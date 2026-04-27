import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

/**
 * POST /api/clinic/stripe-onboarding — Round 15B-1.
 *
 * Creates (or reuses) a Stripe Connect Express account for the
 * authenticated clinic owner and returns an onboarding link that the
 * UI redirects the browser to.
 *
 * vs. doctor onboarding:
 *   - type='standard'   (clinic uses its own Stripe dashboard for full
 *                       business reporting; doctors get 'express' which
 *                       is OnCall-managed UI in Round 18A)
 *   - business_type='company' (CIF + tax ID; doctors are 'individual')
 *
 * Auth: real clinic session OR clinic bypass. The clinic must own a
 * `clinics` row tied to user_id.
 *
 * Side effect: persists `clinics.stripe_account_id` after create. The
 * webhook flips `stripe_onboarding_complete=true` once the account
 * has charges_enabled + payouts_enabled.
 *
 * Returns: { url } — Stripe-hosted onboarding URL. Frontend window.location = url.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'clinic' ? bypass.id : null)
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id, stripe_account_id, name, email, cif, legal_name')
    .eq('user_id', userId)
    .maybeSingle()

  if (!clinic) {
    return NextResponse.json(
      { error: 'clinic_not_found', code: 'not_found' },
      { status: 404 },
    )
  }

  let accountId = clinic.stripe_account_id

  if (!accountId) {
    try {
      const account = await stripe.accounts.create({
        type: 'standard',
        country: 'ES',
        email: clinic.email,
        business_type: 'company',
        company: {
          name: clinic.legal_name ?? clinic.name,
          tax_id: clinic.cif,
        },
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        metadata: {
          clinic_id: clinic.id,
          role: 'clinic',
        },
      })
      accountId = account.id

      const { error: updateErr } = await supabase
        .from('clinics')
        .update({
          stripe_account_id: accountId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clinic.id)
      if (updateErr) {
        console.error('[clinic/stripe-onboarding] persist account_id failed:', updateErr.message)
        // Non-fatal — the account exists, the link will still work.
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'stripe_account_create_failed'
      console.error('[clinic/stripe-onboarding] create error:', msg)
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
      refresh_url: `${baseUrl}/es/clinic/dashboard?stripe=refresh`,
      return_url: `${baseUrl}/es/clinic/dashboard?stripe=ready`,
      type: 'account_onboarding',
    })
    return NextResponse.json({ url: link.url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'stripe_account_link_failed'
    console.error('[clinic/stripe-onboarding] link error:', msg)
    return NextResponse.json(
      { error: msg, code: 'stripe_error' },
      { status: 502 },
    )
  }
}
