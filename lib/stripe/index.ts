import Stripe from 'stripe'

// Stripe client (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-02-25.clover' as const,
})

// ------------------------------------------------
// Stripe Connect - Same Day Payouts to Doctors
// ------------------------------------------------

export async function createDoctorStripeAccount(doctorEmail: string, doctorName: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'ES',
    email: doctorEmail,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    individual: {
      email: doctorEmail,
    },
    settings: {
      payouts: {
        schedule: {
          interval: 'daily',  // Pagos diarios automáticos
        },
      },
    },
    metadata: { doctor_name: doctorName },
  })
  return account
}

export async function createOnboardingLink(stripeAccountId: string) {
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/doctor/earnings?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/doctor/earnings?connected=true`,
    type: 'account_onboarding',
  })
  return accountLink
}

/**
 * Procesa el pago y transfiere al médico el mismo día.
 * Recibe el importe neto ya calculado (doctor_amount de la consulta).
 * La comisión se calcula al crear la consulta, NO aquí — evita doble cálculo.
 */
export async function processPayout(params: {
  stripeAccountId: string
  doctorAmountCents: number   // Neto para el médico (ya descontada comisión)
  consultationId: string
  currency?: string
  metadata?: Record<string, string | number>
}) {
  const { stripeAccountId, doctorAmountCents, consultationId, currency = 'eur', metadata } = params

  // Transferencia directa a la cuenta del médico
  const transfer = await stripe.transfers.create({
    amount: doctorAmountCents,
    currency,
    destination: stripeAccountId,
    metadata: {
      consultation_id: consultationId,
      ...metadata,
    },
  })

  return { transfer }
}

export async function createPaymentIntent(params: {
  amountCents: number
  currency?: string
  consultationId: string
  patientId: string
}) {
  const { amountCents, currency = 'eur', consultationId, patientId } = params

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      consultation_id: consultationId,
      patient_id: patientId,
    },
  })

  return paymentIntent
}

export async function getDoctorBalance(stripeAccountId: string) {
  const balance = await stripe.balance.retrieve({
    stripeAccount: stripeAccountId,
  })
  return balance
}

// ------------------------------------------------
// Refund Calculation — Cancellation Policy
// ------------------------------------------------

/**
 * Calculate refund amount based on cancellation timing:
 * - >24h before scheduled time: 100% refund
 * - 2-24h before: 50% refund
 * - <2h before: 0% refund (no refund)
 */
export function calculateRefundAmount(params: {
  totalAmountCents: number
  scheduledAt: Date | null
  cancelledAt: Date
}): { refundAmountCents: number; refundPercentage: number } {
  const { totalAmountCents, scheduledAt, cancelledAt } = params

  // If no scheduled time (urgent consultation), use creation time + 30 min
  const referenceTime = scheduledAt || new Date(cancelledAt.getTime() + 30 * 60 * 1000)
  const hoursUntilAppointment = (referenceTime.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60)

  if (hoursUntilAppointment > 24) {
    return { refundAmountCents: totalAmountCents, refundPercentage: 100 }
  } else if (hoursUntilAppointment >= 2) {
    return { refundAmountCents: Math.round(totalAmountCents * 0.5), refundPercentage: 50 }
  } else {
    return { refundAmountCents: 0, refundPercentage: 0 }
  }
}

/**
 * Process a Stripe refund for a consultation
 */
export async function processRefund(params: {
  paymentIntentId: string
  amountCents: number
  reason?: string
}) {
  const { paymentIntentId, amountCents, reason } = params

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountCents,
    reason: 'requested_by_customer',
    metadata: { custom_reason: reason || 'Patient cancellation' },
  })

  return refund
}

// ------------------------------------------------
// Instant Payouts (with Standard fallback)
// ------------------------------------------------

/**
 * Process an instant payout to a doctor's connected Stripe account.
 * Falls back to standard payout if instant is not available.
 */
export async function processInstantPayout(params: {
  doctorStripeAccountId: string
  amountCents: number
  currency?: string
  consultationId?: string
}) {
  const { doctorStripeAccountId, amountCents, currency = 'eur', consultationId } = params

  // Check available balance on the connected account
  const balance = await stripe.balance.retrieve({
    stripeAccount: doctorStripeAccountId,
  })

  const availableBalance = balance.available.find(b => b.currency === currency)
  if (!availableBalance || availableBalance.amount < amountCents) {
    throw new Error('Insufficient balance for payout')
  }

  try {
    // Try instant payout first
    const payout = await stripe.payouts.create(
      {
        amount: amountCents,
        currency,
        method: 'instant',
        metadata: { consultation_id: consultationId || '' },
      },
      { stripeAccount: doctorStripeAccountId }
    )
    return { payout, method: 'instant' as const }
  } catch {
    // Fallback to standard payout if instant not available
    const payout = await stripe.payouts.create(
      {
        amount: amountCents,
        currency,
        method: 'standard',
        metadata: { consultation_id: consultationId || '' },
      },
      { stripeAccount: doctorStripeAccountId }
    )
    return { payout, method: 'standard' as const }
  }
}
