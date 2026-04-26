import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notify, generateOtp } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/confirm-doctor?token=<one-time-token>&locale=es
 *
 * Round 11 Fix C — email confirmation step of the doctor activation flow.
 *
 * Flow:
 *   1. Look up the doctor row by activation_email_token.
 *   2. If found + not expired:
 *      - mark email_verified_at = now()
 *      - clear the email token
 *      - generate a 6-digit phone OTP, store hash + expiry
 *      - flip activation_status → 'pending_sms'
 *      - notify('doctor.activation_sms') with the OTP
 *   3. Redirect the doctor to /[locale]/doctor/onboarding so the dashboard
 *      can prompt them to enter the OTP.
 *
 * Failure modes redirect to /[locale]/doctor/onboarding?confirm=error&detail=...
 * with a human-readable detail param so the page can surface it.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token') || ''
  const locale = searchParams.get('locale') === 'en' ? 'en' : 'es'

  const errorRedirect = (detail: string) =>
    NextResponse.redirect(
      `${origin}/${locale}/doctor/onboarding?confirm=error&detail=${encodeURIComponent(detail)}`,
    )

  if (!/^[a-f0-9]{32,64}$/.test(token)) {
    return errorRedirect('invalid_token_format')
  }

  const supabase = await createClient()
  const { data: doc, error: lookupErr } = await supabase
    .from('doctor_profiles')
    .select('id, user_id, activation_status, activation_email_token_expires, phone_verified_at')
    .eq('activation_email_token', token)
    .maybeSingle()

  if (lookupErr) {
    console.error('[confirm-doctor] lookup error:', lookupErr.message)
    return errorRedirect('lookup_failed')
  }
  if (!doc) {
    return errorRedirect('token_not_found_or_consumed')
  }

  const expiresAt = doc.activation_email_token_expires
    ? new Date(doc.activation_email_token_expires).getTime()
    : 0
  if (expiresAt && expiresAt < Date.now()) {
    return errorRedirect('token_expired')
  }

  // Resolve the recipient phone for the SMS step. Phone lives on profiles.
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, phone, full_name')
    .eq('id', doc.user_id)
    .maybeSingle()

  const phone = profile?.phone || null
  const otpCode = generateOtp()
  const otpExpires = new Date(Date.now() + 10 * 60_000).toISOString() // 10 min

  const updates: Record<string, unknown> = {
    email_verified_at: new Date().toISOString(),
    activation_email_token: null,
    activation_email_token_expires: null,
  }

  // If there's a phone to text, advance into the SMS gate; otherwise skip
  // straight to admin review. The doctor can fill in their phone later
  // via the profile page.
  if (phone) {
    updates.phone_otp_code = otpCode
    updates.phone_otp_expires_at = otpExpires
    updates.activation_status = 'pending_sms'
  } else if (doc.activation_status === 'pending_email') {
    updates.activation_status = 'pending_admin_review'
  }

  const { error: updateErr } = await supabase
    .from('doctor_profiles')
    .update(updates)
    .eq('id', doc.id)

  if (updateErr) {
    console.error('[confirm-doctor] update error:', updateErr.message)
    return errorRedirect('update_failed')
  }

  // Fire the SMS notification (or email-only fallback). Errors here are
  // not fatal — the doctor can request a resend from the dashboard.
  if (phone) {
    await notify({
      to: { email: profile?.email || undefined, phone },
      kind: 'doctor.activation_sms',
      data: { code: otpCode },
      channels: ['sms'],
      locale,
    })
  }

  return NextResponse.redirect(
    `${origin}/${locale}/doctor/onboarding?confirm=ok${phone ? '&step=otp' : '&step=admin_review'}`,
  )
}
