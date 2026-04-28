import { NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'
import { sendSms } from '@/lib/notifications/sms'
import { logNotification, isRateLimited } from '@/lib/notifications/log'
import { pushToUser } from '@/lib/push'

export const dynamic = 'force-dynamic'

const PROXIMITY_RADIUS_METERS = 300 // tolerant for hotel-block GPS jitter
const EARTH_RADIUS_M = 6_371_000

/**
 * POST /api/consultations/[id]/checkin — Round 17-B.
 *
 * Doctor marks physical arrival at the patient address.
 *
 * Body: { lat: number, lng: number }
 *
 * Behaviour:
 *   1. Auth: real doctor session OR doctor bypass.
 *   2. Verify the consultation exists + belongs to this doctor.
 *   3. Verify status is 'accepted' (can only check in from accepted).
 *      Idempotent: returns 200 if already 'in_progress' (already checked in).
 *   4. Distance check: doctor's reported GPS must be within
 *      PROXIMITY_RADIUS_METERS of the consultation address. We accept
 *      a generous radius (300m) because urban GPS in hotel blocks /
 *      villas can be 50-100m off.
 *   5. UPDATE consultations SET status='in_progress', checkin_at, checkin_lat, checkin_lng.
 *   6. Fire Twilio SMS to the patient (template patient.doctor_arrived).
 *
 * Returns: { ok, status: 'in_progress', sms: { sent, ... } }
 */
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_M * c
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: consultationId } = await context.params

  let body: { lat?: number; lng?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }
  const lat = Number(body.lat)
  const lng = Number(body.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat_lng_required', code: 'bad_request' }, { status: 400 })
  }

  const { userId, supabase } = await getEffectiveSession('doctor')
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  // Resolve doctor row + verify ownership of the consultation.
  const { data: doctor } = await supabase
    .from('doctor_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  if (!doctor) {
    return NextResponse.json({ error: 'doctor_not_found', code: 'forbidden' }, { status: 403 })
  }

  const { data: consultation } = await supabase
    .from('consultations')
    .select('id, doctor_id, patient_id, status, lat, lng, address')
    .eq('id', consultationId)
    .maybeSingle()
  if (!consultation || consultation.doctor_id !== doctor.id) {
    return NextResponse.json({ error: 'consultation_forbidden', code: 'forbidden' }, { status: 403 })
  }

  // Idempotent: already checked in → return current state.
  if (consultation.status === 'in_progress') {
    return NextResponse.json({ ok: true, status: 'in_progress', alreadyCheckedIn: true })
  }
  if (consultation.status !== 'accepted') {
    return NextResponse.json(
      { error: 'invalid_status', code: 'bad_request', currentStatus: consultation.status },
      { status: 400 },
    )
  }

  // Proximity check.
  if (consultation.lat != null && consultation.lng != null) {
    const dist = distanceMeters(lat, lng, consultation.lat, consultation.lng)
    if (dist > PROXIMITY_RADIUS_METERS) {
      return NextResponse.json(
        {
          error: 'too_far_from_address',
          code: 'too_far',
          distanceM: Math.round(dist),
          maxM: PROXIMITY_RADIUS_METERS,
        },
        { status: 422 },
      )
    }
  }

  // Update status + record check-in coords.
  const { error: updateErr } = await supabase
    .from('consultations')
    .update({
      status: 'in_progress',
      checkin_at: new Date().toISOString(),
      checkin_lat: lat,
      checkin_lng: lng,
    })
    .eq('id', consultationId)
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message, code: 'db_error' }, { status: 500 })
  }

  // Fire SMS to patient — best-effort.
  let smsResult: { sent: boolean; status: string; providerId?: string | null; errorCode?: string | null } = {
    sent: false,
    status: 'skipped',
  }

  try {
    const { data: patient } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', consultation.patient_id)
      .maybeSingle()
    const phone = patient?.phone
    if (phone) {
      const acceptLang = request.headers.get('accept-language') ?? ''
      const locale: 'es' | 'en' = acceptLang.toLowerCase().startsWith('en') ? 'en' : 'es'
      const provider = process.env.SMS_PROVIDER === 'twilio' ? 'twilio' : 'stub'

      if (await isRateLimited(phone, 60_000)) {
        await logNotification({
          channel: 'sms',
          provider,
          toAddress: phone,
          userId: consultation.patient_id,
          templateKey: 'patient.doctor_arrived',
          locale,
          status: 'rate_limited',
        })
        smsResult = { sent: false, status: 'rate_limited' }
      } else {
        const tSms = await getTranslations({ locale, namespace: 'notifications.sms' })
        const messageBody = tSms('patientDoctorArrived', {
          address: consultation.address?.slice(0, 80) ?? '',
        })
        const result = await sendSms({
          to: phone,
          body: messageBody,
          templateKey: 'patient.doctor_arrived',
        })
        await logNotification({
          channel: 'sms',
          provider,
          toAddress: phone,
          userId: consultation.patient_id,
          templateKey: 'patient.doctor_arrived',
          locale,
          status: result.ok ? 'sent' : (result.skipped ? 'skipped' : 'failed'),
          providerMessageId: result.providerId ?? null,
          errorCode: result.errorCode ?? null,
          errorMessage: result.error ?? null,
        })
        smsResult = {
          sent: result.ok && !result.skipped,
          status: result.ok ? 'sent' : (result.skipped ? 'skipped' : 'failed'),
          providerId: result.providerId ?? null,
          errorCode: result.errorCode ?? null,
        }
      }
    }
  } catch (e) {
    console.error('[checkin] SMS error:', e)
  }

  // Round 17-F — Web Push to patient (complementary to SMS)
  try {
    const baseUrl = new URL(request.url).origin
    await pushToUser(consultation.patient_id, {
      title: 'OnCall Clinic',
      body: `📍 Tu médico ha llegado a ${(consultation.address ?? '').slice(0, 60)}`,
      url: `${baseUrl}/es/patient/tracking/${consultationId}`,
      tag: `consultation-${consultationId}`,
    })
  } catch (e) {
    console.warn('[checkin] push error (non-fatal):', e)
  }

  return NextResponse.json({
    ok: true,
    status: 'in_progress',
    sms: smsResult,
  })
}
