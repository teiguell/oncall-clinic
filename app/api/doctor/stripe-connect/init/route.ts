import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getBypassUser, AUTH_BYPASS_ROLE, AUTH_BYPASS } from '@/lib/auth-bypass'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

/**
 * POST /api/doctor/stripe-connect/init — Round 18A-3.
 *
 * On-demand Stripe Connect Express creation for individual doctors.
 * Replaces the old wizard-Step-3 flow that forced Stripe at onboarding
 * (now removed via feature flag — see Round 18A-2).
 *
 * Doctors are funnelled here from the dashboard `StripeSetupBanner`
 * (Round 18A-5) when they have pending payouts waiting to be released.
 *
 * vs. clinic onboarding (/api/clinic/stripe-onboarding):
 *   - type='express'   (OnCall-managed UI; clinics get 'standard' for
 *                      their own Stripe dashboard)
 *   - business_type='individual' (vs 'company' for clinics)
 *
 * Side effect: creates Stripe account, persists doctor_profiles
 * .stripe_account_id. Webhook account.updated flips
 * stripe_onboarded_at + triggers retroactive transfer of all
 * pending_payouts rows (Round 18A-4).
 *
 * Returns: { url } — Stripe-hosted onboarding URL. Frontend assigns
 * window.location to it.
 */
export async function POST(request: Request) {
  // Round 14F-3: cookieSupabase for session; service-role for the
  // doctor_profiles UPDATE when running in bypass mode.
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

  const { data: doctor } = await supabase
    .from('doctor_profiles')
    .select('id, stripe_account_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!doctor) {
    return NextResponse.json(
      { error: 'doctor_profile_missing', code: 'not_found' },
      { status: 404 },
    )
  }

  // Pull email from profiles (auth.users.email is the source of truth
  // for real users; bypass user has its own).
  let email: string | undefined
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .maybeSingle()
    email = profile?.email ?? user.email
  } else if (bypass) {
    email = bypass.email
  }

  let accountId = doctor.stripe_account_id

  if (!accountId) {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'ES',
        email,
        business_type: 'individual',
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        settings: {
          payouts: {
            schedule: { interval: 'daily' },
          },
        },
        metadata: {
          doctor_id: doctor.id,
          role: 'doctor',
        },
      })
      accountId = account.id

      const { error: updErr } = await supabase
        .from('doctor_profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', doctor.id)
      if (updErr) {
        console.error('[doctor/stripe-connect/init] persist account_id failed:', updErr.message)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'stripe_account_create_failed'
      console.error('[doctor/stripe-connect/init] create error:', msg)
      return NextResponse.json(
        { error: msg, code: 'stripe_error' },
        { status: 502 },
      )
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin

  try {
    const link = await stripe.accountLinks.create({
      account: accountId!,
      refresh_url: `${baseUrl}/es/doctor/dashboard?stripe=refresh`,
      return_url: `${baseUrl}/es/doctor/dashboard?stripe=ready`,
      type: 'account_onboarding',
    })
    return NextResponse.json({ url: link.url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'stripe_account_link_failed'
    console.error('[doctor/stripe-connect/init] link error:', msg)
    return NextResponse.json(
      { error: msg, code: 'stripe_error' },
      { status: 502 },
    )
  }
}
