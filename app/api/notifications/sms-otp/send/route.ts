import { NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE, AUTH_BYPASS } from '@/lib/auth-bypass'
import { sendSms } from '@/lib/notifications/sms'
import { logNotification, isRateLimited } from '@/lib/notifications/log'
import { generateOtp } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/sms-otp/send — Round 14 trigger #1.
 *
 * Generates a fresh 6-digit OTP for the doctor's phone number and
 * fires the activation SMS via Twilio (or stub). The OTP is stored on
 * `doctor_profiles.phone_otp_code` + `phone_otp_expires_at` (10 min)
 * for `/api/notifications/sms-otp/verify` (Round 11 Fix C) to consume.
 *
 * Auth: real session OR doctor bypass.
 *
 * Rate limit: 60s/recipient hard floor (notifications_log enforced).
 *
 * Body:
 *   {} — phone is read from `profiles.phone` for the user.
 *   { phone: '+34...' } — Round 14F-2: when AUTH_BYPASS is on, the
 *     endpoint accepts an explicit `phone` in the body so Cowork can
 *     smoke-test without a real auth.users row on file. In production
 *     (AUTH_BYPASS off) the body.phone is IGNORED — security stays
 *     intact: only the actual signed-in user can target their own
 *     phone.
 *
 * Returns: { ok, status: 'sent' | 'rate_limited' | 'failed', expiresAt? }
 */
export async function POST(request: Request) {
  // Round 14F-2: optionally read body.phone for bypass-mode smoke testing.
  const reqBody: { phone?: string } = AUTH_BYPASS
    ? await request.json().catch(() => ({} as { phone?: string }))
    : ({} as { phone?: string })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'doctor' ? bypass.id : null)
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  // Pull phone + locale + doctor row in parallel.
  const [profileRes, doctorRes] = await Promise.all([
    supabase.from('profiles').select('email, phone').eq('id', userId).maybeSingle(),
    supabase.from('doctor_profiles').select('id, activation_status').eq('user_id', userId).maybeSingle(),
  ])

  // Round 14F-2: phone resolution priority:
  //   1. body.phone (only when AUTH_BYPASS=true — production never trusts body)
  //   2. profile.phone from DB
  // The bypass body.phone path lets Cowork hit this endpoint with any
  // verified Twilio trial number without seeding the DB row first.
  const phoneFromBody = AUTH_BYPASS && typeof reqBody.phone === 'string'
    ? reqBody.phone.trim() || null
    : null
  const phone = phoneFromBody ?? profileRes.data?.phone
  const doc = doctorRes.data

  if (!phone) {
    return NextResponse.json({ error: 'no_phone_on_profile', code: 'no_phone' }, { status: 400 })
  }
  if (!doc) {
    return NextResponse.json({ error: 'doctor_profile_missing', code: 'not_found' }, { status: 404 })
  }

  // Locale from Accept-Language; default ES.
  const acceptLang = request.headers.get('accept-language') || ''
  const locale: 'es' | 'en' = acceptLang.toLowerCase().startsWith('en') ? 'en' : 'es'

  // Rate limit per phone (60s).
  if (await isRateLimited(phone, 60_000)) {
    await logNotification({
      channel: 'sms',
      provider: process.env.SMS_PROVIDER === 'twilio' ? 'twilio' : 'stub',
      toAddress: phone,
      userId,
      templateKey: 'doctor.activation_sms',
      locale,
      status: 'rate_limited',
    })
    return NextResponse.json({ ok: false, status: 'rate_limited', code: 'rate_limited' }, { status: 429 })
  }

  // Generate + store the OTP.
  const code = generateOtp()
  const expiresAtIso = new Date(Date.now() + 10 * 60_000).toISOString()
  const { error: updateErr } = await supabase
    .from('doctor_profiles')
    .update({
      phone_otp_code: code,
      phone_otp_expires_at: expiresAtIso,
    })
    .eq('id', doc.id)
  if (updateErr) {
    console.error('[sms-otp/send] update failed:', updateErr.message)
    return NextResponse.json({ error: updateErr.message, code: 'db_error' }, { status: 500 })
  }

  const tSms = await getTranslations({ locale, namespace: 'notifications.sms' })
  const body = tSms('doctorActivationOtp', { code })

  const result = await sendSms({ to: phone, body, templateKey: 'doctor.activation_sms' })

  await logNotification({
    channel: 'sms',
    provider: process.env.SMS_PROVIDER === 'twilio' ? 'twilio' : 'stub',
    toAddress: phone,
    userId,
    templateKey: 'doctor.activation_sms',
    locale,
    status: result.ok ? 'sent' : (result.skipped ? 'skipped' : 'failed'),
    providerMessageId: result.providerId ?? null,
    errorCode: result.errorCode ?? null,
    errorMessage: result.error ?? null,
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        status: 'failed',
        error: result.error,
        errorCode: result.errorCode,
        skipped: result.skipped,
      },
      { status: result.skipped ? 200 : 502 },
    )
  }

  return NextResponse.json({ ok: true, status: 'sent', expiresAt: expiresAtIso })
}
