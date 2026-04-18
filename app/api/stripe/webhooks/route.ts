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

      case 'account.updated':
        await handleAccountUpdated(supabase, event.data.object as Stripe.Account)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Log the processed event
    await supabase.from('stripe_webhook_logs').insert({
      event_type: event.type,
      event_id: event.id,
      payload: event.data.object as unknown as Record<string, unknown>,
      status: 'processed',
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(`Error processing webhook ${event.type}:`, err)

    // Log the failed event
    await supabase.from('stripe_webhook_logs').insert({
      event_type: event.type,
      event_id: event.id,
      payload: event.data.object as unknown as Record<string, unknown>,
      status: 'failed',
    })

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

  await supabase
    .from('consultations')
    .update({
      stripe_payment_intent_id: session.payment_intent as string,
      status: 'accepted',
    })
    .eq('id', consultationId)
}

async function handlePaymentSucceeded(supabase: SupabaseClient, paymentIntent: Stripe.PaymentIntent) {
  const consultationId = paymentIntent.metadata?.consultation_id
  if (!consultationId) return

  await supabase
    .from('consultations')
    .update({
      stripe_payment_intent_id: paymentIntent.id,
      payout_status: 'pending',
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

async function handleAccountUpdated(supabase: SupabaseClient, account: Stripe.Account) {
  const isOnboarded = account.charges_enabled && account.payouts_enabled

  await supabase
    .from('doctor_profiles')
    .update({
      stripe_onboarded: isOnboarded,
    })
    .eq('stripe_account_id', account.id)
}
