import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhook processing (bypasses RLS)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  const supabase = getSupabase()

  // Idempotency check — skip if already processed
  const { data: existing } = await supabase
    .from('stripe_webhook_logs')
    .select('id')
    .eq('event_id', event.id)
    .single()

  if (existing) {
    return NextResponse.json({ received: true, message: 'Already processed' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabase, event.data.object as Stripe.PaymentIntent)
        break

      case 'transfer.created':
        await handleTransferCreated(supabase, event.data.object as Stripe.Transfer)
        break

      case 'payout.paid':
        handlePayoutPaid(event.data.object as Stripe.Payout)
        break

      case 'charge.refunded':
        await handleChargeRefunded(supabase, event.data.object as Stripe.Charge)
        break

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed':
        await handleSessionFailed(supabase, event.data.object as Stripe.Checkout.Session)
        break

      case 'account.updated':
        await handleAccountUpdated(supabase, event.data.object as Stripe.Account)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // BLOQUE A: log with upsert so duplicate event_ids overwrite cleanly
    // instead of failing the unique constraint and masking real errors.
    await supabase.from('stripe_webhook_logs').upsert(
      {
        event_type: event.type,
        event_id: event.id,
        payload: event.data.object as unknown as Record<string, unknown>,
        status: 'processed',
      },
      { onConflict: 'event_id' }
    )

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(`Error processing webhook ${event.type}:`, err)

    await supabase.from('stripe_webhook_logs').upsert(
      {
        event_type: event.type,
        event_id: event.id,
        payload: event.data.object as unknown as Record<string, unknown>,
        status: 'failed',
      },
      { onConflict: 'event_id' }
    )

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// -----------------------------------------------
// Event Handlers
// -----------------------------------------------

type SupabaseClient = ReturnType<typeof getSupabase>

async function handleCheckoutCompleted(supabase: SupabaseClient, session: Stripe.Checkout.Session) {
  const consultationId = session.metadata?.consultation_id
  if (!consultationId) return

  // BLOQUE A: set payment_status='paid' + stripe_session_id + updated_at
  await supabase
    .from('consultations')
    .update({
      payment_status: 'paid',
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', consultationId)
}

async function handlePaymentSucceeded(supabase: SupabaseClient, paymentIntent: Stripe.PaymentIntent) {
  const consultationId = paymentIntent.metadata?.consultation_id
  if (!consultationId) return

  // BLOQUE A: payment_intent.succeeded is the authoritative "money captured"
  // signal. Mark payment_status='paid' here too in case checkout.session.completed
  // fired earlier but failed the UPDATE.
  await supabase
    .from('consultations')
    .update({
      payment_status: 'paid',
      stripe_payment_intent_id: paymentIntent.id,
      payout_status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', consultationId)
}

async function handleTransferCreated(supabase: SupabaseClient, transfer: Stripe.Transfer) {
  const consultationId = transfer.metadata?.consultation_id
  if (!consultationId) return

  await supabase
    .from('consultations')
    .update({
      stripe_transfer_id: transfer.id,
      payout_status: 'processing',
    })
    .eq('id', consultationId)

  await supabase
    .from('payouts')
    .update({
      stripe_transfer_id: transfer.id,
      status: 'processing',
    })
    .eq('consultation_id', consultationId)
}

function handlePayoutPaid(payout: Stripe.Payout) {
  console.log(`Payout ${payout.id} completed: ${payout.amount / 100} ${payout.currency}`)
}

async function handleChargeRefunded(supabase: SupabaseClient, charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string
  if (!paymentIntentId) return

  // BLOQUE A: also flip consultations.payment_status='refunded'
  await supabase
    .from('consultations')
    .update({
      payment_status: 'refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntentId)

  const { data: consultation } = await supabase
    .from('consultations')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (!consultation) return

  const latestRefund = charge.refunds?.data?.[0]

  await supabase
    .from('refunds')
    .update({
      stripe_refund_id: latestRefund?.id,
      status: 'completed',
    })
    .eq('consultation_id', consultation.id)
    .eq('status', 'processing')
}

async function handleSessionFailed(supabase: SupabaseClient, session: Stripe.Checkout.Session) {
  const consultationId = session.metadata?.consultation_id
  if (!consultationId) return
  await supabase
    .from('consultations')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: session.status === 'expired' ? 'checkout_expired' : 'async_payment_failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', consultationId)
}

async function handleAccountUpdated(supabase: SupabaseClient, account: Stripe.Account) {
  const isOnboarded = account.charges_enabled && account.payouts_enabled
  const role = account.metadata?.role ?? 'doctor'

  // Round 18A-4: route by role.
  // - 'clinic' → flip clinics.stripe_onboarding_complete
  // - 'doctor' (default) → flip doctor_profiles.stripe_onboarded_at
  //   AND retroactively transfer all pending_payouts rows.
  if (role === 'clinic') {
    await supabase
      .from('clinics')
      .update({
        stripe_onboarding_complete: isOnboarded,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', account.id)
    return
  }

  // Doctor branch — keep the legacy stripe_onboarded boolean for
  // backward compat AND set the new stripe_onboarded_at timestamp
  // used by /api/consultations/[id]/complete (Path A vs B routing).
  const updates: Record<string, unknown> = { stripe_onboarded: isOnboarded }
  if (isOnboarded) {
    updates.stripe_onboarded_at = new Date().toISOString()
  }
  const { data: doctor } = await supabase
    .from('doctor_profiles')
    .update(updates)
    .eq('stripe_account_id', account.id)
    .select('id, stripe_account_id')
    .maybeSingle()

  if (!isOnboarded || !doctor?.id) return

  // Round 18A-4: retroactive transfer of pending_payouts.
  // For each row in 'pending_doctor_setup', call stripe.transfers.create
  // with destination=doctor.stripe_account_id, then flip the row to
  // 'transferred' (with stripe_transfer_id + transferred_at). Failures
  // mark the row as 'failed' for manual review.
  const { data: pendingRows } = await supabase
    .from('pending_payouts')
    .select('id, net_cents, consultation_id')
    .eq('doctor_id', doctor.id)
    .eq('status', 'pending_doctor_setup')

  if (!pendingRows?.length) return

  for (const p of pendingRows as Array<{ id: string; net_cents: number; consultation_id: string }>) {
    try {
      const transfer = await stripe.transfers.create({
        amount: p.net_cents,
        currency: 'eur',
        destination: account.id,
        transfer_group: `consultation_${p.consultation_id}`,
        metadata: {
          payout_id: p.id,
          retroactive: 'true',
        },
      })
      await supabase
        .from('pending_payouts')
        .update({
          status: 'transferred',
          transferred_at: new Date().toISOString(),
          stripe_transfer_id: transfer.id,
        })
        .eq('id', p.id)
    } catch (e) {
      console.error('[webhook] retroactive transfer failed for payout', p.id, e)
      await supabase
        .from('pending_payouts')
        .update({ status: 'failed' })
        .eq('id', p.id)
    }
  }
}
