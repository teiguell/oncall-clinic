import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SERVICES, type ServiceType } from '@/types'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const { serviceType, type, address, symptoms, notes, scheduledAt, lat, lng, locale } = body

  const service = SERVICES.find(s => s.value === serviceType as ServiceType)
  if (!service) return NextResponse.json({ error: 'Servicio no válido' }, { status: 400 })

  const multiplier = type === 'urgent' ? service.urgentMultiplier : 1
  const priceEuros = service.basePrice * multiplier
  const priceCents = Math.round(priceEuros * 100)

  const commissionRate = parseFloat(process.env.NEXT_PUBLIC_COMMISSION_RATE || '0.15')
  const commission = Math.round(priceCents * commissionRate)
  const doctorAmount = priceCents - commission

  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

  if (isTestMode) {
    // TEST MODE: create consultation directly, simulated payment
    const { data: consultation, error } = await supabase
      .from('consultations')
      .insert({
        patient_id: user.id,
        type,
        status: 'pending',
        service_type: serviceType,
        symptoms,
        notes: notes || null,
        address,
        lat: lat || 38.9067,
        lng: lng || 1.4206,
        scheduled_at: scheduledAt || null,
        price: priceCents,
        commission,
        doctor_amount: doctorAmount,
        payment_status: 'paid',
        stripe_session_id: `test_session_${Date.now()}`,
        stripe_payment_intent_id: `test_pi_${Date.now()}`,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({
      testMode: true,
      consultationId: consultation.id,
      redirectUrl: `/${locale}/patient/tracking/${consultation.id}`,
    })
  }

  // PRODUCTION MODE: real Stripe Checkout
  const { stripe } = await import('@/lib/stripe')
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: priceCents,
        product_data: { name: service.label || serviceType },
      },
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/patient/booking-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/patient/request?cancelled=true`,
    customer_email: user.email,
    metadata: {
      patient_id: user.id,
      service_type: serviceType,
      type,
      address,
      symptoms,
      notes: notes || '',
      scheduled_at: scheduledAt || '',
      lat: String(lat || 38.9067),
      lng: String(lng || 1.4206),
      commission: String(commission),
      doctor_amount: String(doctorAmount),
      price: String(priceCents),
    },
  })

  return NextResponse.json({ sessionUrl: session.url })
}
