import { NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getBypassUser, AUTH_BYPASS_ROLE, AUTH_BYPASS } from '@/lib/auth-bypass'
import { sendSms } from '@/lib/notifications/sms'
import { logNotification, isRateLimited } from '@/lib/notifications/log'

export const dynamic = 'force-dynamic'

/**
 * POST /api/consultations/[id]/accept — Round 14 trigger #2.
 *
 * Server-side handler for "doctor accepted this consultation". The
 * client-side optimistic accept (Round 7-E in `/doctor/dashboard`)
 * already does the DB update; this endpoint can also be called
 * directly (idempotent — only acts if status is still 'pending')
 * and additionally fires a Twilio SMS to the patient with ETA.
 *
 * Body:
 *   { etaMin?: number }   (estimated minutes; defaults to 60)
 *
 * Auth: real doctor session OR doctor bypass. The doctor must own the
 * consultation (RLS check via doctor_id = current doctor_profiles.id).
 *
 * Returns: { ok, consultation, sms: { sent, providerId?, errorCode? } }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: consultationId } = await params
  if (!consultationId) {
    return NextResponse.json({ error: 'missing_id', code: 'bad_request' }, { status: 400 })
  }

  // Round 14F-3: cookieSupabase to resolve session; switch to service-role
  // for DB writes when in bypass mode (no real auth.uid() to satisfy RLS).
  const cookieSupabase = await createClient()
  const { data: { user } } = await cookieSupabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'doctor' ? bypass.id : null)
  const supabase = !user && AUTH_BYPASS && bypass
    ? createServiceRoleClient()
    : cookieSupabase
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  let body: { etaMin?: number }
  try {
    body = await request.json().catch(() => ({}))
  } catch {
    body = {}
  }
  const etaMin = typeof body.etaMin === 'number' ? Math.max(5, Math.round(body.etaMin)) : 60

  // Resolve doctor_profile.id for the current user.
  const { data: doctorProfile, error: dpErr } = await supabase
    .from('doctor_profiles')
    .select('id, user_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (dpErr || !doctorProfile) {
    return NextResponse.json(
      { error: 'doctor_profile_not_found', code: 'forbidden' },
      { status: 403 },
    )
  }

  // Look up the consultation; ensure it's still pending or already
  // accepted by THIS doctor (idempotent).
  const { data: consultation, error: cErr } = await supabase
    .from('consultations')
    .select('id, patient_id, doctor_id, status, address, lat, lng')
    .eq('id', consultationId)
    .maybeSingle()
  if (cErr || !consultation) {
    return NextResponse.json({ error: 'consultation_not_found', code: 'not_found' }, { status: 404 })
  }

  // Atomic accept: only update if (status='pending' AND doctor_id NULL)
  // OR (doctor_id = us). The .is('doctor_id', null) condition prevents
  // double-accept races between two doctors hitting this endpoint.
  if (consultation.status !== 'pending' && consultation.doctor_id !== doctorProfile.id) {
    return NextResponse.json(
      { error: 'already_taken', code: 'consultation_already_taken' },
      { status: 409 },
    )
  }

  const { error: updErr, data: updated } = await supabase
    .from('consultations')
    .update({
      doctor_id: doctorProfile.id,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', consultationId)
    .or(`doctor_id.is.null,doctor_id.eq.${doctorProfile.id}`)
    .select('id, patient_id, status, address')
    .single()

  if (updErr || !updated) {
    return NextResponse.json(
      { error: updErr?.message ?? 'update_failed', code: 'db_error' },
      { status: 500 },
    )
  }

  // Fire SMS to the patient (best-effort; never blocks the accept).
  let smsResult: Awaited<ReturnType<typeof sendSms>> = { ok: false, skipped: true }
  try {
    const { data: patient } = await supabase
      .from('profiles')
      .select('phone, full_name')
      .eq('id', updated.patient_id)
      .maybeSingle()

    const { data: doctorContact } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()

    const phone = patient?.phone
    if (phone) {
      const acceptLang = request.headers.get('accept-language') || ''
      const locale: 'es' | 'en' = acceptLang.toLowerCase().startsWith('en') ? 'en' : 'es'

      if (await isRateLimited(phone, 60_000)) {
        await logNotification({
          channel: 'sms',
          provider: process.env.SMS_PROVIDER === 'twilio' ? 'twilio' : 'stub',
          toAddress: phone,
          userId: updated.patient_id,
          templateKey: 'patient.doctor_accepted',
          locale,
          status: 'rate_limited',
        })
      } else {
        const tSms = await getTranslations({ locale, namespace: 'notifications.sms' })
        const body = tSms('patientDoctorAccepted', {
          name: (doctorContact?.full_name ?? 'OnCall').split(' ').slice(0, 2).join(' '),
          eta: String(etaMin),
        })
        smsResult = await sendSms({ to: phone, body, templateKey: 'patient.doctor_accepted' })
        await logNotification({
          channel: 'sms',
          provider: process.env.SMS_PROVIDER === 'twilio' ? 'twilio' : 'stub',
          toAddress: phone,
          userId: updated.patient_id,
          templateKey: 'patient.doctor_accepted',
          locale,
          status: smsResult.ok ? 'sent' : (smsResult.skipped ? 'skipped' : 'failed'),
          providerMessageId: smsResult.providerId ?? null,
          errorCode: smsResult.errorCode ?? null,
          errorMessage: smsResult.error ?? null,
        })
      }
    }
  } catch (err) {
    console.error('[consultations/accept] SMS dispatch error:', err)
    // Swallow — accept succeeded, SMS failure is logged in catch.
  }

  return NextResponse.json({
    ok: true,
    consultation: updated,
    sms: {
      sent: smsResult.ok && !smsResult.skipped,
      skipped: smsResult.skipped ?? false,
      providerId: smsResult.providerId,
      errorCode: smsResult.errorCode,
    },
  })
}
