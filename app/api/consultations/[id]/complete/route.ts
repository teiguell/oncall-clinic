import { NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getBypassUser, AUTH_BYPASS_ROLE, AUTH_BYPASS } from '@/lib/auth-bypass'
import { stripe } from '@/lib/stripe'
import { sendSms } from '@/lib/notifications/sms'
import { logNotification, isRateLimited } from '@/lib/notifications/log'

export const dynamic = 'force-dynamic'

const REFUND_DEADLINE_DAYS = 90

/**
 * POST /api/consultations/[id]/complete — Round 18A-6.
 *
 * Doctor marks a consultation as completed → flips status='completed'
 * + completed_at = NOW. Then routes the doctor's net amount via:
 *
 *   Path A (doctor has Stripe Connect ready):
 *     stripe.transfers.create({ amount: doctor_amount, destination, ... })
 *     → funds arrive in their account next payout cycle
 *
 *   Path B (doctor has NOT configured Stripe yet):
 *     INSERT INTO pending_payouts (status='pending_doctor_setup',
 *       refund_deadline = NOW + 90 days)
 *     → doctor sees the StripeSetupBanner on the dashboard with the
 *       cumulative pending amount + earliest deadline. Once they
 *       complete onboarding, webhook account.updated retroactively
 *       transfers all pending rows. After 90 days, the cron refunds
 *       the patient.
 *
 * Auth: real doctor session OR doctor bypass. The doctor must own the
 * consultation (consultation.doctor_id = doctor_profiles.id).
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: consultationId } = await context.params

  // Round 14F-3: cookieSupabase for session; service-role for writes in bypass
  const cookieSupabase = await createClient()
  const {
    data: { user },
  } = await cookieSupabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'doctor' ? bypass.id : null)
  const supabase = !user && AUTH_BYPASS && bypass
    ? createServiceRoleClient()
    : cookieSupabase
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  // Resolve the doctor row + verify ownership.
  const { data: doctor } = await supabase
    .from('doctor_profiles')
    .select('id, stripe_account_id, stripe_onboarded_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (!doctor) {
    return NextResponse.json({ error: 'doctor_not_found', code: 'forbidden' }, { status: 403 })
  }

  const { data: consultation } = await supabase
    .from('consultations')
    .select('id, doctor_id, clinic_id, status, price, commission, doctor_amount')
    .eq('id', consultationId)
    .maybeSingle()
  if (!consultation || consultation.doctor_id !== doctor.id) {
    return NextResponse.json({ error: 'consultation_forbidden', code: 'forbidden' }, { status: 403 })
  }

  if (consultation.status === 'completed') {
    return NextResponse.json({ ok: true, status: 'already_completed' })
  }
  if (consultation.status !== 'in_progress' && consultation.status !== 'accepted') {
    return NextResponse.json(
      { error: 'invalid_status', code: 'bad_request', currentStatus: consultation.status },
      { status: 400 },
    )
  }

  // Flip the consultation to completed.
  const { error: updateErr } = await supabase
    .from('consultations')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', consultationId)
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message, code: 'db_error' }, { status: 500 })
  }

  const doctorAmount = consultation.doctor_amount ?? 0
  if (doctorAmount <= 0) {
    return NextResponse.json({ ok: true, status: 'completed', payout: 'none', reason: 'zero_amount' })
  }

  // Path A: doctor has Stripe ready → immediate transfer
  if (doctor.stripe_onboarded_at && doctor.stripe_account_id) {
    try {
      const transfer = await stripe.transfers.create({
        amount: doctorAmount,
        currency: 'eur',
        destination: doctor.stripe_account_id,
        transfer_group: `consultation_${consultationId}`,
        metadata: {
          consultation_id: consultationId,
          doctor_id: doctor.id,
          path: 'A',
        },
      })
      return NextResponse.json({
        ok: true,
        status: 'completed',
        payout: 'transferred',
        path: 'A',
        transferId: transfer.id,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'transfer_failed'
      console.error('[consultations/complete] Path A transfer error:', msg)
      // Fall through to Path B so the money isn't lost — record as pending.
      // Doctor support can re-trigger via Stripe dashboard.
    }
  }

  // Path B: no Stripe setup → record in pending_payouts
  const refundDeadline = new Date()
  refundDeadline.setDate(refundDeadline.getDate() + REFUND_DEADLINE_DAYS)

  const { error: insertErr } = await supabase
    .from('pending_payouts')
    .insert({
      doctor_id: doctor.id,
      consultation_id: consultationId,
      amount_cents: consultation.price ?? 0,
      commission_cents: consultation.commission ?? 0,
      net_cents: doctorAmount,
      status: 'pending_doctor_setup',
      refund_deadline: refundDeadline.toISOString(),
    })

  if (insertErr) {
    // Duplicate key (consultation_id has UNIQUE) is fine — already recorded.
    if (insertErr.code !== '23505') {
      console.error('[consultations/complete] Path B insert error:', insertErr.message)
      return NextResponse.json(
        { error: insertErr.message, code: 'db_error' },
        { status: 500 },
      )
    }
  }

  // Round 15C-2: notify the doctor via SMS that they have funds waiting
  // + 90-day deadline. The dashboard banner already surfaces the
  // cumulative amount; this push notification ensures they know
  // immediately rather than only on next dashboard visit. Best-effort:
  // failure here doesn't break the complete-consultation response.
  try {
    const { data: doctorProfile } = await supabase
      .from('profiles')
      .select('phone, locale')
      .eq('id', userId)
      .maybeSingle()
    const phone = doctorProfile?.phone as string | undefined
    if (phone) {
      const acceptLang = (doctorProfile?.locale as string | undefined) ?? 'es'
      const locale: 'es' | 'en' = acceptLang.toLowerCase().startsWith('en') ? 'en' : 'es'
      const provider = process.env.SMS_PROVIDER === 'twilio' ? 'twilio' : 'stub'
      const amount = `€${(doctorAmount / 100).toFixed(2)}`
      const deadline = refundDeadline.toLocaleDateString(
        locale === 'en' ? 'en-GB' : 'es-ES',
        { day: 'numeric', month: 'long' },
      )

      // Rate-limit per-phone (60s) to avoid duplicates if the doctor
      // re-completes (race / retry). The notifications_log row keeps
      // an audit trail.
      if (await isRateLimited(phone, 60_000)) {
        await logNotification({
          channel: 'sms',
          provider,
          toAddress: phone,
          userId,
          templateKey: 'doctor.payout_pending',
          locale,
          status: 'rate_limited',
        })
      } else {
        const tSms = await getTranslations({ locale, namespace: 'notifications.sms' })
        const messageBody = tSms('doctorPayoutPending', {
          amount,
          deadline,
        })
        const result = await sendSms({
          to: phone,
          body: messageBody,
          templateKey: 'doctor.payout_pending',
        })
        await logNotification({
          channel: 'sms',
          provider,
          toAddress: phone,
          userId,
          templateKey: 'doctor.payout_pending',
          locale,
          status: result.ok ? 'sent' : (result.skipped ? 'skipped' : 'failed'),
          providerMessageId: result.providerId ?? null,
          errorCode: result.errorCode ?? null,
          errorMessage: result.error ?? null,
        })
      }
    }
  } catch (notifErr) {
    console.error('[consultations/complete] Path B notify error:', notifErr)
  }

  return NextResponse.json({
    ok: true,
    status: 'completed',
    payout: 'pending_doctor_setup',
    path: 'B',
    refundDeadline: refundDeadline.toISOString(),
  })
}
