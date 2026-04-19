import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { processPayout } from '@/lib/stripe'

/**
 * Same-day payout to doctor when consultation is completed
 * Called by a trigger or webhook when consultation.status = 'completed'
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

  const doctorProfile = (consultation as { doctor_profiles?: { stripe_account_id?: string; stripe_onboarded?: boolean; commission_rate?: number } }).doctor_profiles

  if (!doctorProfile?.stripe_account_id || !doctorProfile?.stripe_onboarded) {
    // Queue payout for when doctor connects Stripe
    await supabase.from('payouts').insert({
      doctor_id: consultation.doctor_id,
      consultation_id: consultationId,
      amount: consultation.doctor_amount,
      currency: 'eur',
      status: 'pending',
    })
    return NextResponse.json({ status: 'queued', message: 'Doctor sin Stripe configurado' })
  }

  try {
    const { transfer } = await processPayout({
      stripeAccountId: doctorProfile.stripe_account_id,
      doctorAmountCents: consultation.doctor_amount!,
      consultationId,
      currency: 'eur',
      metadata: {
        commission: consultation.commission || 0,
        total: consultation.price || 0,
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
      amount: consultation.doctor_amount,
      currency: 'eur',
      status: 'completed',
      stripe_transfer_id: transfer.id,
    })

    // Audit log (B6)
    await supabase.from('payout_audit_log').insert({
      consultation_id: consultationId,
      doctor_id: consultation.doctor_id,
      action: 'completed',
      amount: consultation.doctor_amount,
      stripe_transfer_id: transfer.id,
    })

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      doctorAmount: consultation.doctor_amount,
      commission: consultation.commission,
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
