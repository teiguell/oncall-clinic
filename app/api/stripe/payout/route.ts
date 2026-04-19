import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { processPayout } from '@/lib/stripe'
import { getCommissionRate, calculatePlatformFee, calculateDoctorPayout } from '@/lib/pricing'

/**
 * Same-day payout to doctor when consultation is completed.
 * Uses dynamic commission: 10% during Year 1 from doctor.activated_at,
 * 15% after. Overrides whatever was stored at consultation creation.
 */
export async function POST(request: Request) {
  const { consultationId } = await request.json()

  const supabase = await createAdminClient()

  // Get consultation details
  const { data: consultation, error } = await supabase
    .from('consultations')
    .select(`*, doctor_profiles(*)`)
    .eq('id', consultationId)
    .single()

  if (error || !consultation) {
    return NextResponse.json({ error: 'Consulta no encontrada' }, { status: 404 })
  }

  if (consultation.status !== 'completed') {
    return NextResponse.json({ error: 'Consulta no completada' }, { status: 400 })
  }

  const doctorProfile = (consultation as { doctor_profiles?: { stripe_account_id?: string; stripe_onboarded?: boolean; activated_at?: string } }).doctor_profiles

  // Recalculate commission at payout time using the Year-1 promo helper
  const priceCents = consultation.price || 0
  const activatedAt = doctorProfile?.activated_at
  const commissionRate = getCommissionRate(activatedAt)
  const commission = calculatePlatformFee(priceCents, activatedAt)
  const doctorAmountDynamic = calculateDoctorPayout(priceCents, activatedAt)

  if (!doctorProfile?.stripe_account_id || !doctorProfile?.stripe_onboarded) {
    // Queue payout for when doctor connects Stripe
    await supabase.from('payouts').insert({
      doctor_id: consultation.doctor_id,
      consultation_id: consultationId,
      amount: doctorAmountDynamic,
      currency: 'eur',
      status: 'pending',
    })
    return NextResponse.json({ status: 'queued', message: 'Doctor sin Stripe configurado' })
  }

  try {
    const { transfer } = await processPayout({
      stripeAccountId: doctorProfile.stripe_account_id,
      doctorAmountCents: doctorAmountDynamic,
      consultationId,
      currency: 'eur',
      metadata: {
        commission,
        commission_rate: commissionRate,
        total: priceCents,
      },
    })

    // Update consultation
    await supabase
      .from('consultations')
      .update({
        payout_status: 'completed',
        payout_at: new Date().toISOString(),
        stripe_transfer_id: transfer.id,
      })
      .eq('id', consultationId)

    // Record payout
    await supabase.from('payouts').insert({
      doctor_id: consultation.doctor_id,
      consultation_id: consultationId,
      amount: doctorAmountDynamic,
      currency: 'eur',
      status: 'completed',
      stripe_transfer_id: transfer.id,
    })

    // Audit log (B6)
    await supabase.from('payout_audit_log').insert({
      consultation_id: consultationId,
      doctor_id: consultation.doctor_id,
      action: 'completed',
      amount: doctorAmountDynamic,
      stripe_transfer_id: transfer.id,
      metadata: { commission_rate: commissionRate },
    })

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      doctorAmount: doctorAmountDynamic,
      commission,
      commissionRate,
    })
  } catch (error) {
    console.error('Payout error:', error)

    await supabase
      .from('consultations')
      .update({ payout_status: 'failed' })
      .eq('id', consultationId)

    // Audit log (B6)
    await supabase.from('payout_audit_log').insert({
      consultation_id: consultationId,
      doctor_id: consultation.doctor_id,
      action: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json({ error: 'Error al procesar pago' }, { status: 500 })
  }
}
