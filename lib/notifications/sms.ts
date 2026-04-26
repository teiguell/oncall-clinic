/**
 * SMS adapter — Round 11 Fix B.
 *
 * Strategy for alpha: log-only stub. The Round 11 prompt asks the
 * Director to choose between Twilio (€0.05/msg, official) and a
 * cheaper alternative (WhatsApp via 360dialog ~€0.005/msg, or
 * email-only). Until that decision lands, sendSms() logs to the
 * server console and returns `{ ok: true, skipped: true }` so callers
 * can pretend it succeeded for end-to-end audit purposes.
 *
 * When Director picks a provider, replace the body of `sendViaProvider`
 * with the corresponding REST call (Twilio or 360dialog both have
 * fetch-friendly APIs — no SDK needed).
 *
 * Env contract for Twilio (when activated):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_FROM_NUMBER  e.g. "+34911234567"
 */

export interface SendSmsInput {
  to: string
  body: string
}

export interface SendSmsResult {
  ok: boolean
  providerId?: string
  error?: string
  skipped?: boolean
}

const TWILIO_BASE = 'https://api.twilio.com/2010-04-01/Accounts'

async function sendViaTwilio(input: SendSmsInput): Promise<SendSmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) {
    return { ok: false, skipped: true, error: 'twilio_not_configured' }
  }

  try {
    const res = await fetch(`${TWILIO_BASE}/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: input.to,
        From: from,
        Body: input.body,
      }).toString(),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[notifications/sms] Twilio error', res.status, detail.slice(0, 300))
      return { ok: false, error: `twilio_${res.status}` }
    }
    const json = (await res.json().catch(() => null)) as { sid?: string } | null
    return { ok: true, providerId: json?.sid }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown_error'
    console.error('[notifications/sms] network error:', msg)
    return { ok: false, error: msg }
  }
}

export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const provider = process.env.SMS_PROVIDER || 'stub'

  if (provider === 'twilio') {
    return sendViaTwilio(input)
  }

  // Stub: log and pretend success. Useful for alpha audit so callers can
  // walk the activation flow without paying €0.05 per SMS.
  console.warn(
    '[notifications/sms] STUB MODE — would send SMS:\n' +
      `  to:   ${input.to}\n` +
      `  body: ${input.body.slice(0, 160)}`,
  )
  return { ok: true, skipped: true }
}
