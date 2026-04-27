import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SERVICES, type ServiceType } from '@/types'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getBypassUser } from '@/lib/auth-bypass'

function sanitizeText(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

export async function POST(request: Request) {
  // Round 5 Fix C (2026-04-25) — top-level try/catch so any unexpected
  // throw (Stripe SDK, Supabase, JSON parse, etc.) returns a JSON body
  // with `error.message` + `code` instead of a bare 500. The frontend
  // toast reads `error` and shows it verbatim — no more "Algo fue mal".
  try {
  // Rate limit: 5 checkout attempts per minute per IP
  const ip = getClientIp(request)
  const { allowed } = checkRateLimit(ip, 5, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests', code: 'rate_limited' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Round 9 Fix H + Round 11 Fix A — auth bypass for Cowork audit.
  // When NEXT_PUBLIC_AUTH_BYPASS=true the helper returns a synthetic user
  // matching the role configured by NEXT_PUBLIC_AUTH_BYPASS_ROLE. For
  // /api/stripe/checkout the patient role is the natural caller, but we
  // accept any bypass role — the booking endpoint just needs a stable
  // patient_id + email. See lib/auth-bypass.ts for the rationale.
  const bypassUser = getBypassUser()
  const effectiveUser = user ?? bypassUser
  if (!effectiveUser) return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })

  // Round 9 Fix C: Art.9 RGPD consent gate REMOVED. OnCall is now a pure
  // intermediary (LSSI-CE) — no special-category data processing happens
  // here. The visiting doctor is responsible for clinical anamnesis under
  // their own data-controller role. Art.6.1.b basic consent (terms +
  // privacy) is captured client-side in Step 3.

  const body = await request.json()
  const { serviceType, type, scheduledAt, lat, lng, locale, preferredDoctorId } = body
  const address = sanitizeText(body.address, 500)
  // Round 9 Fix B: phone capturado en UI pero todavía no persiste en DB
  // (no hay columna). Lo añadimos a Stripe metadata para visibilidad en
  // dashboard / soporte. Sprint dedicado más adelante: ALTER TABLE
  // consultations ADD COLUMN phone_at_booking TEXT.
  const phone = sanitizeText(body.phone, 30)
  // Round 9 Fix B: symptoms/notes ya no se recogen ni se persisten.
  // Para consultas legacy estos campos quedan null en DB.
  const symptoms = ''
  const notes = ''

  const service = SERVICES.find(s => s.value === serviceType as ServiceType)
  if (!service) return NextResponse.json({ error: 'invalid_service', code: 'invalid_service' }, { status: 400 })
  if (!service.active) return NextResponse.json({ error: 'service_coming_soon', code: 'service_coming_soon' }, { status: 400 })

  // Price model: the doctor sets the price (Ley 15/2007 Defensa Competencia;
  // STS 805/2020 Glovo). If the patient picked a specific doctor, query
  // `consultation_price` + optional `night_price` from `doctor_profiles`.
  // Ibiza night window: 22:00–07:59 local time → use night_price if set.
  // Round 15B-2: also pull `clinic_id` so we can route the commission via
  // the clinic's rate (8%) when applicable, instead of the default
  // individual doctor rate (10/15%).
  let priceCents = Math.round(service.basePrice * 100)
  let clinicIdForConsultation: string | null = null
  let clinicCommissionRate: number | null = null

  if (preferredDoctorId) {
    const { data: doctor } = await supabase
      .from('doctor_profiles')
      .select('consultation_price, night_price, clinic_id')
      .eq('id', preferredDoctorId)
      .maybeSingle()
    if (doctor?.consultation_price && typeof doctor.consultation_price === 'number') {
      priceCents = doctor.consultation_price
      // Switch to night_price between 22:00 and 07:59 Europe/Madrid
      const ibizaHour = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Madrid',
        hour: 'numeric',
        hour12: false,
      })
      const hour = parseInt(ibizaHour)
      const dAny = doctor as unknown as { night_price?: number | null }
      if (
        typeof dAny.night_price === 'number' &&
        (hour >= 22 || hour < 8)
      ) {
        priceCents = dAny.night_price
      }
    }

    // Round 15B-2: clinic commission routing.
    // If the doctor belongs to a verified clinic with stripe_onboarding_complete,
    // use the clinic's commission_rate (8%) instead of individual default (10/15%).
    // Cleaner than refunding post-payment (would require chargebacks
    // and patient confusion); pre-calculate at checkout init.
    if (doctor?.clinic_id) {
      const { data: clinic } = await supabase
        .from('clinics')
        .select('id, commission_rate, verification_status, stripe_onboarding_complete')
        .eq('id', doctor.clinic_id)
        .maybeSingle()
      if (
        clinic?.verification_status === 'verified' &&
        typeof clinic.commission_rate === 'number'
      ) {
        clinicIdForConsultation = clinic.id
        clinicCommissionRate = clinic.commission_rate / 100 // 8.00 → 0.08
      }
    }
  }

  // Round 15B-2: prefer clinic rate when available; else env default (10%).
  const commissionRate =
    clinicCommissionRate ??
    parseFloat(process.env.NEXT_PUBLIC_COMMISSION_RATE || '0.15')
  const commission = Math.round(priceCents * commissionRate)
  const doctorAmount = priceCents - commission

  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

  if (isTestMode) {
    // TEST MODE: create consultation directly, simulated payment
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert({
        patient_id: effectiveUser.id,
        // Preferred-doctor preassignment: if the patient picked one in step 3,
        // skip the broadcast and go straight to the doctor's inbox.
        doctor_id: preferredDoctorId || null,
        // Round 15B-2: tag the consultation with the clinic when applicable
        // so reports + webhook can route the application_fee through the
        // clinic's commission_rate.
        clinic_id: clinicIdForConsultation,
        type,
        status: 'pending',
        service_type: serviceType,
        symptoms,
        notes: notes || null,
        address,
        lat: lat || 38.9067,
        lng: lng || 1.4206,
        scheduled_at: scheduledAt || null,
        price: priceCents,
        commission,
        doctor_amount: doctorAmount,
        payment_status: 'paid',
        stripe_session_id: `test_session_${Date.now()}`,
        stripe_payment_intent_id: `test_pi_${Date.now()}`,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message, code: 'consultation_insert_failed' }, { status: 400 })

    // Broadcast to nearby doctors (fire-and-forget; don't block redirect)
    try {
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || ''
      if (origin) {
        fetch(`${origin}/api/consultations/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consultationId: consultation.id }),
        }).catch((e) => console.error('Assign broadcast failed:', e))
      }
    } catch {
      // noop
    }

    return NextResponse.json({
      testMode: true,
      consultationId: consultation.id,
      redirectUrl: `/${locale}/patient/tracking/${consultation.id}`,
    })
  }

  // PRODUCTION MODE: real Stripe Checkout with marketplace split.
  //
  // Flow:
  //   1. INSERT consultation with status='pending' + payment_status='pending'
  //      → gives us an id to pass in metadata + success_url
  //   2. Create Stripe Checkout session (with application_fee + transfer_data
  //      if the doctor is Connect-onboarded, else plain charge)
  //   3. UPDATE consultation with stripe_session_id
  //   4. Webhook (checkout.session.completed) flips payment_status='paid'
  //      by looking up consultation via metadata.consultation_id
  const { data: consultation, error: insertError } = await supabase
    .from('consultations')
    .insert({
      patient_id: effectiveUser.id,
      doctor_id: preferredDoctorId || null,
      // Round 15B-2: see TEST MODE branch above for rationale
      clinic_id: clinicIdForConsultation,
      type,
      status: 'pending',
      payment_status: 'pending',
      service_type: serviceType,
      symptoms,
      notes: notes || null,
      address,
      lat: lat || 38.9067,
      lng: lng || 1.4206,
      scheduled_at: scheduledAt || null,
      price: priceCents,
      commission,
      doctor_amount: doctorAmount,
    })
    .select('id')
    .single()

  if (insertError || !consultation) {
    console.error('[checkout] insert failed:', insertError?.message)
    return NextResponse.json(
      { error: insertError?.message || 'insert_failed', code: 'insert_failed' },
      { status: 500 },
    )
  }

  // Marketplace split: if the doctor has completed Stripe Connect onboarding,
  // route the funds so the doctor receives (price − commission) directly and
  // the platform keeps the commission as application_fee. If not, the charge
  // goes to the platform account and payouts are handled by a separate
  // transfer (fallback path).
  let stripeAccountId: string | null = null
  if (preferredDoctorId) {
    const { data: doctor } = await supabase
      .from('doctor_profiles')
      .select('stripe_account_id, stripe_onboarded')
      .eq('id', preferredDoctorId)
      .maybeSingle()
    if (doctor?.stripe_onboarded && doctor.stripe_account_id) {
      stripeAccountId = doctor.stripe_account_id as string
    }
  }

  const { stripe } = await import('@/lib/stripe')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

  const sessionParams: import('stripe').Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: priceCents,
        product_data: { name: service.label || serviceType },
      },
      quantity: 1,
    }],
    success_url: `${baseUrl}/${locale}/patient/consultation/${consultation.id}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/patient/request?step=2&cancelled=1`,
    customer_email: effectiveUser.email,
    metadata: {
      consultation_id: consultation.id,
      patient_id: effectiveUser.id,
      doctor_id: preferredDoctorId || '',
      // Round 15B-2: clinic id in metadata for webhook routing
      clinic_id: clinicIdForConsultation || '',
      service_type: serviceType,
      type,
      locale: locale || 'es',
      price: String(priceCents),
      commission: String(commission),
      commission_rate: String(commissionRate), // 0.08 for clinic, 0.10/0.15 for individual
      doctor_amount: String(doctorAmount),
      // Round 9: phone visible en Stripe dashboard para soporte (no en DB todavía).
      ...(phone ? { contact_phone: phone } : {}),
    },
  }

  if (stripeAccountId) {
    sessionParams.payment_intent_data = {
      application_fee_amount: commission,
      transfer_data: {
        destination: stripeAccountId,
      },
    }
  }

  const stripeSession = await stripe.checkout.sessions.create(sessionParams)

  // Save session id so webhook idempotency & retries can cross-reference
  await supabase
    .from('consultations')
    .update({
      stripe_session_id: stripeSession.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', consultation.id)

  return NextResponse.json({
    url: stripeSession.url,
    sessionId: stripeSession.id,
    consultationId: consultation.id,
    // Keep old key for backwards compat with existing Step3Confirm code
    sessionUrl: stripeSession.url,
  })
  } catch (e: unknown) {
    // Round 5 Fix C — never let an unexpected throw bubble out as a bare
    // 500 with no body. Surface the underlying message so the toast can
    // show something useful to the user instead of "Algo fue mal".
    const msg = e instanceof Error ? e.message : 'unknown_error'
    const code =
      e && typeof e === 'object' && 'code' in e && typeof (e as { code: unknown }).code === 'string'
        ? (e as { code: string }).code
        : 'unknown_error'
    console.error('[checkout] unhandled error:', msg, e)
    return NextResponse.json({ error: msg, code }, { status: 500 })
  }
}
