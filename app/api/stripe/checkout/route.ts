import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SERVICES, type ServiceType } from '@/types'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

function sanitizeText(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

export async function POST(request: Request) {
  // Rate limit: 5 checkout attempts per minute per IP
  const ip = getClientIp(request)
  const { allowed } = checkRateLimit(ip, 5, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const { serviceType, type, scheduledAt, lat, lng, locale, preferredDoctorId } = body
  const address = sanitizeText(body.address, 500)
  const symptoms = sanitizeText(body.symptoms, 2000)
  const notes = sanitizeText(body.notes, 1000)

  const service = SERVICES.find(s => s.value === serviceType as ServiceType)
  if (!service) return NextResponse.json({ error: 'Servicio no válido' }, { status: 400 })
  if (!service.active) return NextResponse.json({ error: 'Servicio próximamente disponible' }, { status: 400 })

  // Price is the regional base; per-doctor adjustment and night surcharge
  // are applied at doctor acceptance / payout time.
  const priceEuros = service.basePrice
  const priceCents = Math.round(priceEuros * 100)

  const commissionRate = parseFloat(process.env.NEXT_PUBLIC_COMMISSION_RATE || '0.15')
  const commission = Math.round(priceCents * commissionRate)
  const doctorAmount = priceCents - commission

  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

  if (isTestMode) {
    // TEST MODE: create consultation directly, simulated payment
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert({
        patient_id: user.id,
        // Preferred-doctor preassignment: if the patient picked one in step 3,
        // skip the broadcast and go straight to the doctor's inbox.
        doctor_id: preferredDoctorId || null,
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

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

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

  // PRODUCTION MODE: real Stripe Checkout
  const { stripe } = await import('@/lib/stripe')
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: priceCents,
        product_data: { name: service.label || serviceType },
      },
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/patient/booking-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/patient/request?cancelled=true`,
    customer_email: user.email,
    metadata: {
      patient_id: user.id,
      service_type: serviceType,
      type,
      address,
      symptoms,
      notes: notes || '',
      scheduled_at: scheduledAt || '',
      lat: String(lat || 38.9067),
      lng: String(lng || 1.4206),
      commission: String(commission),
      doctor_amount: String(doctorAmount),
      price: String(priceCents),
    },
  })

  return NextResponse.json({ sessionUrl: session.url })
}
