import { NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'
import { sendSms } from '@/lib/notifications/sms'
import { logNotification } from '@/lib/notifications/log'

export const dynamic = 'force-dynamic'

/**
 * POST /api/consultations/[id]/checkout — Round 17-B.
 *
 * Doctor marks the visit as completed.
 *
 * Body: {} (no params; the doctor must be checked-in already).
 *
 * Behaviour:
 *   1. Auth: real doctor session OR doctor bypass.
 *   2. Verify the consultation exists + belongs to this doctor.
 *   3. Verify status is 'in_progress' (must be checked-in first).
 *      Idempotent: returns 200 if already 'completed'.
 *   4. UPDATE consultations SET status='completed', checkout_at, completed_at.
 *   5. Delegate Path A/B payment routing to the existing
 *      /api/consultations/[id]/complete logic by calling that route's
 *      handler internally. Avoids duplicating Stripe transfer +
 *      pending_payouts insert here.
 *      Implementation note: server-to-server fetch with the same
 *      cookies + bypass headers passes through. Failing that, we
 *      fall back to a direct status flip — pending_payouts insert
 *      is skipped (Round 17-C will retry via cron sweeper).
 *   6. Fire SMS to patient with review-request token (R17-C handles the review submit page).
 *
 * Returns: { ok, status: 'completed', payout: 'transferred'|'pending'|'skipped' }
 */

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: consultationId } = await context.params

  const { userId, supabase } = await getEffectiveSession('doctor')
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  // Resolve doctor + verify ownership.
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
    .select('id, doctor_id, patient_id, status, address')
    .eq('id', consultationId)
    .maybeSingle()
  if (!consultation || consultation.doctor_id !== doctor.id) {
    return NextResponse.json({ error: 'consultation_forbidden', code: 'forbidden' }, { status: 403 })
  }

  if (consultation.status === 'completed') {
    return NextResponse.json({ ok: true, status: 'completed', alreadyCheckedOut: true })
  }
  if (consultation.status !== 'in_progress') {
    return NextResponse.json(
      { error: 'not_checked_in', code: 'bad_request', currentStatus: consultation.status },
      { status: 400 },
    )
  }

  // Stamp checkout_at + flip to completed. The /complete route below
  // ALSO sets completed_at + status='completed', but the field
  // assignments are idempotent so doing it here keeps the row
  // consistent even if the inner complete call fails.
  const { error: updateErr } = await supabase
    .from('consultations')
    .update({
      status: 'completed',
      checkout_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .eq('id', consultationId)
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message, code: 'db_error' }, { status: 500 })
  }

  // Delegate payment routing to /api/consultations/[id]/complete.
  // Note: that route's auth uses cookieClient → it would fail in bypass
  // mode without the cookie. For bypass mode we already updated the
  // row above so the doctor sees 'completed' immediately; the
  // pending_payouts insert is best-effort.
  let payoutStatus: 'transferred' | 'pending_doctor_setup' | 'skipped' | 'failed' = 'skipped'
  try {
    const baseUrl = new URL(request.url).origin
    const cookie = request.headers.get('cookie') ?? ''
    const res = await fetch(`${baseUrl}/api/consultations/${consultationId}/complete`, {
      method: 'POST',
      headers: cookie ? { cookie } : {},
    })
    if (res.ok) {
      const data = (await res.json()) as { payout?: string }
      payoutStatus = (data.payout as typeof payoutStatus) ?? 'skipped'
    }
  } catch (e) {
    console.error('[checkout] complete delegate error:', e)
  }

  // Fire review-request SMS to patient (R17-C).
  // Generates a deterministic review token tied to the consultation;
  // the actual `consultation_reviews` row is created lazy on submit.
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
      const tSms = await getTranslations({ locale, namespace: 'notifications.sms' })
      // The review token is the consultation_id itself (R17-C accepts
      // either the dedicated review_token from the table OR the
      // consultation_id as a fallback). Keeps R17-B independent of
      // R17-C migration timing.
      const reviewUrl = `${new URL(request.url).origin}/${locale}/review/${consultationId}`
      const messageBody = tSms('patientReviewRequest', { url: reviewUrl })
      const result = await sendSms({
        to: phone,
        body: messageBody,
        templateKey: 'patient.review_request',
      })
      await logNotification({
        channel: 'sms',
        provider,
        toAddress: phone,
        userId: consultation.patient_id,
        templateKey: 'patient.review_request',
        locale,
        status: result.ok ? 'sent' : (result.skipped ? 'skipped' : 'failed'),
        providerMessageId: result.providerId ?? null,
        errorCode: result.errorCode ?? null,
        errorMessage: result.error ?? null,
      })
    }
  } catch (e) {
    console.error('[checkout] review SMS error:', e)
  }

  return NextResponse.json({
    ok: true,
    status: 'completed',
    payout: payoutStatus,
  })
}
