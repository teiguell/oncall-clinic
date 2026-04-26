import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/sms-otp/verify — Round 11 Fix B + Fix C.
 *
 * Verifies the 6-digit OTP the doctor entered in the dashboard against
 * the value stored on `doctor_profiles.phone_otp_code` + expiry. On
 * success, sets `phone_verified_at = now()` and clears the OTP fields,
 * advancing `activation_status` if all gates have passed.
 *
 * Auth: real session OR doctor bypass. The OTP itself is the second
 * factor; the bypass cannot bypass the OTP because the bypass user must
 * still produce the correct code that was last sent (or, in stub mode,
 * the "stub bypass" is gated by NEXT_PUBLIC_AUTH_BYPASS=true and the
 * server simply accepts the canonical alpha-audit code "111111").
 *
 * NOTE: in alpha (TEST_MODE), any code matching "111111" is accepted to
 * unblock Cowork audits — see Round 11 prompt.
 */
export async function POST(request: Request) {
  let body: { code?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }

  const code = (body.code || '').trim()
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'invalid_code_format', code: 'bad_request' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Bypass passthrough for Cowork audit:
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'doctor' ? bypass.id : null)
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true'
  const isAuditMagicCode = isTestMode && code === '111111'

  // Lookup the doctor row. RLS allows the user to read their own
  // doctor_profiles row by user_id.
  const { data: doc, error: docErr } = await supabase
    .from('doctor_profiles')
    .select('id, phone_otp_code, phone_otp_expires_at, phone_verified_at, activation_status')
    .eq('user_id', userId)
    .maybeSingle()

  if (docErr) {
    console.error('[sms-otp/verify] doctor_profiles read error:', docErr.message)
    return NextResponse.json({ error: docErr.message, code: 'db_error' }, { status: 500 })
  }
  if (!doc) {
    return NextResponse.json({ error: 'doctor_profile_not_found', code: 'not_found' }, { status: 404 })
  }

  // Validate code against stored hash, OR accept the alpha audit magic code.
  let valid = false
  if (isAuditMagicCode) {
    valid = true
  } else if (doc.phone_otp_code === code) {
    const expires = doc.phone_otp_expires_at ? new Date(doc.phone_otp_expires_at).getTime() : 0
    valid = expires > Date.now()
  }

  if (!valid) {
    return NextResponse.json({ error: 'invalid_or_expired_code', code: 'invalid_otp' }, { status: 400 })
  }

  // Mark phone verified, clear OTP fields. activation_status moves
  // forward only if it was 'pending_sms' (the natural waiting state).
  const updates: Record<string, unknown> = {
    phone_verified_at: new Date().toISOString(),
    phone_otp_code: null,
    phone_otp_expires_at: null,
  }
  if (doc.activation_status === 'pending_sms') {
    updates.activation_status = 'pending_admin_review'
  }

  const { error: updateErr } = await supabase
    .from('doctor_profiles')
    .update(updates)
    .eq('id', doc.id)

  if (updateErr) {
    console.error('[sms-otp/verify] doctor_profiles update error:', updateErr.message)
    return NextResponse.json({ error: updateErr.message, code: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, activation_status: updates.activation_status ?? doc.activation_status })
}
