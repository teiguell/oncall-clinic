import { NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'
import { sendSms } from '@/lib/notifications/sms'
import { logNotification, isRateLimited } from '@/lib/notifications/log'

export const dynamic = 'force-dynamic'

/**
 * POST /api/doctor/eta-update — Round 14 trigger #3.
 *
 * Called by the doctor's mobile client when their location updates put
 * the ETA at ≤ 10 min from the patient's address. Fires a one-time SMS
 * to the patient ("OnCall: tu médico llega en ~10 min al {address}").
 *
 * Idempotency: the rate-limit check (60s/recipient) prevents duplicate
 * "arriving" SMS from a chatty location stream. For the strict "fire
 * once when crossing the 10 min threshold" semantics, an additional
 * `consultations.eta_sms_sent_at` column would be ideal — left as a
 * follow-up so this commit can ship without a DB schema change.
 *
 * Body:
 *   {
 *     consultationId: string,
 *     etaMin: number,
 *   }
 *
 * Auth: real doctor session OR doctor bypass. The doctor must own the
 * consultation (consultation.doctor_id === doctor_profiles.id).
 *
 * Returns:
 *   { ok, sent: boolean, status: 'sent' | 'rate_limited' | 'skipped' | 'failed' }
 */
export async function POST(request: Request) {
  let body: { consultationId?: string; etaMin?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }

  const consultationId = body.consultationId
  const etaMin = typeof body.etaMin === 'number' ? Math.max(1, Math.round(body.etaMin)) : null

  if (!consultationId || etaMin == null) {
    return NextResponse.json(
      { error: 'consultationId + etaMin required', code: 'bad_request' },
      { status: 400 },
    )
  }

  if (etaMin > 10) {
    // No SMS fired above the 10-min threshold. The endpoint still
    // returns ok:true so the client can fire-and-forget every minute.
    return NextResponse.json({ ok: true, sent: false, status: 'skipped' })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'doctor' ? bypass.id : null)
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  // Resolve doctor + consultation.
  const { data: doctorProfile } = await supabase
    .from('doctor_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  if (!doctorProfile) {
    return NextResponse.json({ error: 'doctor_not_found', code: 'forbidden' }, { status: 403 })
  }

  const { data: consultation } = await supabase
    .from('consultations')
    .select('id, patient_id, doctor_id, address, status')
    .eq('id', consultationId)
    .maybeSingle()
  if (!consultation || consultation.doctor_id !== doctorProfile.id) {
    return NextResponse.json({ error: 'consultation_forbidden', code: 'forbidden' }, { status: 403 })
  }

  // Skip if the visit is already completed/cancelled.
  if (consultation.status === 'completed' || consultation.status === 'cancelled') {
    return NextResponse.json({ ok: true, sent: false, status: 'skipped' })
  }

  // Look up patient phone.
  const { data: patient } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', consultation.patient_id)
    .maybeSingle()
  const phone = patient?.phone
  if (!phone) {
    return NextResponse.json({ ok: true, sent: false, status: 'skipped' })
  }

  const acceptLang = request.headers.get('accept-language') || ''
  const locale: 'es' | 'en' = acceptLang.toLowerCase().startsWith('en') ? 'en' : 'es'
  const provider = process.env.SMS_PROVIDER === 'twilio' ? 'twilio' : 'stub'

  if (await isRateLimited(phone, 60_000)) {
    await logNotification({
      channel: 'sms',
      provider,
      toAddress: phone,
      userId: consultation.patient_id,
      templateKey: 'patient.doctor_eta',
      locale,
      status: 'rate_limited',
    })
    return NextResponse.json({ ok: true, sent: false, status: 'rate_limited' })
  }

  const tSms = await getTranslations({ locale, namespace: 'notifications.sms' })
  const messageBody = tSms('patientDoctorEta', {
    eta: String(etaMin),
    address: consultation.address?.slice(0, 80) ?? '',
  })

  const result = await sendSms({ to: phone, body: messageBody, templateKey: 'patient.doctor_eta' })

  await logNotification({
    channel: 'sms',
    provider,
    toAddress: phone,
    userId: consultation.patient_id,
    templateKey: 'patient.doctor_eta',
    locale,
    status: result.ok ? 'sent' : (result.skipped ? 'skipped' : 'failed'),
    providerMessageId: result.providerId ?? null,
    errorCode: result.errorCode ?? null,
    errorMessage: result.error ?? null,
  })

  return NextResponse.json({
    ok: true,
    sent: result.ok && !result.skipped,
    status: result.ok ? 'sent' : (result.skipped ? 'skipped' : 'failed'),
    providerId: result.providerId,
    errorCode: result.errorCode,
  })
}
