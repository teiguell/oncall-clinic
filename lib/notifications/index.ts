/**
 * Notifications dispatcher — Round 11 Fix B.
 *
 * Single entrypoint for any server code that wants to email/SMS the user:
 *
 *   import { notify } from '@/lib/notifications'
 *   await notify({
 *     to: { email: 'a@b.c', phone: '+34...' },
 *     kind: 'doctor.consultation_new',
 *     data: { address: 'Hotel X', price: '150' },
 *   })
 *
 * Channel selection:
 *   - If `channels` is provided, only those are attempted.
 *   - Otherwise both email and SMS are tried when the recipient has the
 *     corresponding contact field. SMS is only attempted when the
 *     template defines an SMS body (kinds that aren't time-critical
 *     skip SMS to avoid noise).
 *
 * Errors never throw — the function always resolves with a structured
 * result so callers can decide whether to fail the parent action.
 */

import { sendEmail } from './email'
import { sendSms } from './sms'
import { getTemplate } from './templates'
import type {
  NotificationChannel,
  NotificationRequest,
  NotificationResult,
} from './types'

export type { NotificationKind, NotificationChannel } from './types'

export async function notify(req: NotificationRequest): Promise<NotificationResult> {
  const locale: 'es' | 'en' = req.locale === 'en' ? 'en' : 'es'
  const template = getTemplate(req.kind)

  if (!template) {
    console.error('[notifications] no template registered for kind:', req.kind)
    return { ok: false, channels: [] }
  }

  const wantedChannels: NotificationChannel[] =
    req.channels && req.channels.length > 0
      ? req.channels
      : ['email', 'sms']

  const results: NotificationResult['channels'] = []

  // EMAIL ----------------------------------------------------------------
  if (wantedChannels.includes('email') && template.email && req.to.email) {
    const env = template.email
    const r = await sendEmail({
      to: req.to.email,
      subject: env.subject(req.data, locale),
      html: env.html(req.data, locale),
      text: env.text(req.data, locale),
    })
    results.push({ channel: 'email', ok: r.ok, providerId: r.providerId, error: r.error, skipped: r.skipped })
  } else if (wantedChannels.includes('email') && (!template.email || !req.to.email)) {
    results.push({ channel: 'email', ok: false, skipped: true, error: !req.to.email ? 'no_email' : 'no_template' })
  }

  // SMS ------------------------------------------------------------------
  if (wantedChannels.includes('sms') && template.sms && req.to.phone) {
    const r = await sendSms({
      to: req.to.phone,
      body: template.sms.body(req.data, locale),
    })
    results.push({ channel: 'sms', ok: r.ok, providerId: r.providerId, error: r.error, skipped: r.skipped })
  } else if (wantedChannels.includes('sms') && (!template.sms || !req.to.phone)) {
    results.push({ channel: 'sms', ok: false, skipped: true, error: !req.to.phone ? 'no_phone' : 'no_template' })
  }

  // PUSH (alpha = polling, no Web Push). Reserved channel for the future.

  // ok = at least one channel actually delivered (not skipped, not errored).
  const ok = results.some((r) => r.ok && !r.skipped)
  return { ok, channels: results }
}

/**
 * Generates a 6-digit numeric OTP. Used for SMS phone verification in
 * the doctor onboarding flow.
 */
export function generateOtp(): string {
  // 100000–999999 inclusive. Math.random is fine for OTP — Supabase
  // RLS + expiry window provide the security boundary, not entropy.
  return String(Math.floor(100000 + Math.random() * 900000))
}
