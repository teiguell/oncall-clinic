import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { sessionId } = await request.json()
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { stripe } = await import('@/lib/stripe')
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not confirmed', status: session.payment_status }, { status: 400 })
  }

  const m = session.metadata || {}

  // Check if consultation already exists for this session
  const { data: existing } = await supabase
    .from('consultations')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ consultationId: existing.id })
  }

  const { data: consultation, error } = await supabase
    .from('consultations')
    .insert({
      patient_id: m.patient_id || user.id,
      type: m.type || 'urgent',
      status: 'pending',
      service_type: m.service_type || 'general_medicine',
      symptoms: m.symptoms || '',
      notes: m.notes || null,
      address: m.address || '',
      lat: parseFloat(m.lat || '38.9067'),
      lng: parseFloat(m.lng || '1.4206'),
      scheduled_at: m.scheduled_at || null,
      price: parseInt(m.price || '0', 10),
      commission: parseInt(m.commission || '0', 10),
      doctor_amount: parseInt(m.doctor_amount || '0', 10),
      payment_status: 'paid',
      stripe_session_id: sessionId,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ consultationId: consultation.id })
}
