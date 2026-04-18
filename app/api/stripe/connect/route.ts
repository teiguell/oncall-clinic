import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, createDoctorStripeAccount, createOnboardingLink } from '@/lib/stripe'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'doctor') {
    return NextResponse.json({ error: 'Solo para médicos' }, { status: 403 })
  }

  const { data: doctorProfile } = await supabase
    .from('doctor_profiles').select('*').eq('user_id', user.id).single()

  if (!doctorProfile) {
    return NextResponse.json({ error: 'Perfil de médico no encontrado' }, { status: 404 })
  }

  try {
    let stripeAccountId = doctorProfile.stripe_account_id

    if (!stripeAccountId) {
      // Create new Stripe Connect account
      const account = await createDoctorStripeAccount(profile.email, profile.full_name)
      stripeAccountId = account.id

      await supabase
        .from('doctor_profiles')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', doctorProfile.id)
    }

    // Create onboarding link
    const link = await createOnboardingLink(stripeAccountId)

    return NextResponse.json({ url: link.url })
  } catch (error) {
    console.error('Stripe connect error:', error)
    return NextResponse.json(
      { error: 'Error al conectar con Stripe' },
      { status: 500 }
    )
  }
}

// Webhook to handle Stripe account updates
export async function GET(request: Request) {
  const url = new URL(request.url)
  const stripeAccountId = url.searchParams.get('account_id')

  if (stripeAccountId) {
    const account = await stripe.accounts.retrieve(stripeAccountId)

    if (account.details_submitted) {
      const supabase = await createClient()
      await supabase
        .from('doctor_profiles')
        .update({ stripe_onboarded: true })
        .eq('stripe_account_id', stripeAccountId)
    }
  }

  return NextResponse.json({ ok: true })
}
