import { NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'
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
 *   {} (the phone number is read from `profiles.phone` for the user;
 *       a future variant could accept an explicit `phone` for
 *       resend-to-different-number flows).
 *
 * Returns: { ok, status: 'sent' | 'rate_limited' | 'failed', expiresAt? }
 */
export async function POST(request: Request) {
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

  const phone = profileRes.data?.phone
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
