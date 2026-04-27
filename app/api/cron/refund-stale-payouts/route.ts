import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/refund-stale-payouts — Round 18A-7.
 *
 * Daily cron (vercel.json: "0 2 * * *") that refunds patients for
 * pending_payouts that crossed the 90-day refund_deadline without the
 * doctor configuring Stripe Connect.
 *
 * Auth: shared `CRON_SECRET` header — Vercel Cron sends it
 * automatically when the cron schedule fires. Anyone else hitting the
 * endpoint without the right Bearer token gets 401.
 *
 * Per stale row:
 *   1. Lookup consultation.stripe_session_id
 *   2. Retrieve session → expand payment_intent → refund the PI
 *   3. UPDATE pending_payouts SET status='refunded', refunded_at=NOW,
 *      refund_reason='doctor_no_stripe_setup_90d'
 *
 * Failures don't abort the loop — each row is processed independently.
 */
export async function GET(request: Request) {
  // Auth check
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Service role client — bypasses RLS, needed for cron + webhook
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'service_role_env_missing' }, { status: 500 })
  }
  const supabase = createClient(url, serviceKey)

  // Pull stale rows
  const nowIso = new Date().toISOString()
  const { data: stale, error: selectErr } = await supabase
    .from('pending_payouts')
    .select('id, consultation_id, amount_cents')
    .eq('status', 'pending_doctor_setup')
    .lt('refund_deadline', nowIso)
    .limit(100)

  if (selectErr) {
    return NextResponse.json({ error: selectErr.message, code: 'db_error' }, { status: 500 })
  }

  if (!stale?.length) {
    return NextResponse.json({ processed: 0 })
  }

  type Stale = { id: string; consultation_id: string; amount_cents: number }
  let refundedCount = 0
  let failedCount = 0
  const failures: Array<{ id: string; reason: string }> = []

  for (const p of stale as Stale[]) {
    try {
      const { data: consultation } = await supabase
        .from('consultations')
        .select('stripe_session_id')
        .eq('id', p.consultation_id)
        .maybeSingle()

      const sessionId = consultation?.stripe_session_id
      if (!sessionId || sessionId.startsWith('test_session_')) {
        // Test mode session — skip Stripe call, just mark refunded.
        await supabase
          .from('pending_payouts')
          .update({
            status: 'refunded',
            refunded_at: new Date().toISOString(),
            refund_reason: sessionId ? 'test_mode_skipped' : 'no_session_id',
          })
          .eq('id', p.id)
        refundedCount++
        continue
      }

      // Retrieve the session + expand payment_intent so we can refund it.
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      })
      const piId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id

      if (piId) {
        await stripe.refunds.create({
          payment_intent: piId,
          reason: 'requested_by_customer',
          metadata: {
            reason_code: 'doctor_no_stripe_setup_90d',
            payout_id: p.id,
          },
        })
      }

      await supabase
        .from('pending_payouts')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_reason: 'doctor_no_stripe_setup_90d',
        })
        .eq('id', p.id)
      refundedCount++
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown'
      console.error('[cron/refund-stale-payouts] payout', p.id, 'failed:', msg)
      failures.push({ id: p.id, reason: msg })
      failedCount++
      // Don't update the row — it remains in pending_doctor_setup so the
      // next cron run retries. Director can intervene via support if a
      // row keeps failing.
    }
  }

  return NextResponse.json({
    processed: stale.length,
    refunded: refundedCount,
    failed: failedCount,
    failures,
  })
}
