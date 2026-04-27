/**
 * SMS adapter — Round 14 (Twilio production via fetch + Messaging Service).
 *
 * Director decision (2026-04-27):
 *   - Provider: Twilio España, Messaging Service alphanumeric sender
 *     "OnCall" (no purchased number — trial account uses the
 *     Service-SID for sender selection).
 *   - The 3 critical SMS triggers are: doctor activation OTP,
 *     "doctor accepted your visit" (patient), "doctor arriving in
 *     ~10 min" (patient). All other comms stay on email.
 *
 * Env contract:
 *   SMS_PROVIDER                  'twilio' | 'stub' (default 'stub')
 *   TWILIO_ACCOUNT_SID            ACxxxx... (server-only)
 *   TWILIO_AUTH_TOKEN             32-hex (server-only)
 *   TWILIO_MESSAGING_SERVICE_SID  MGxxxx... (server-only)
 *
 * The Twilio REST endpoint accepts `MessagingServiceSid` as a body field
 * INSTEAD of `From` — the Messaging Service then resolves the sender
 * (alphanumeric "OnCall" for ES). NOT setting `From` is mandatory when
 * using the Messaging Service path.
 *
 * Trial-account caveat: until Tei upgrades, only verified caller IDs
 * receive messages (others return Twilio error 21608). The smoke-test
 * recipient is the Director's verified phone (see Round 14 inbox).
 */

export interface SendSmsInput {
  to: string
  body: string
  /** Forwarded into the notifications_log row by callers; not used by Twilio. */
  templateKey?: string
}

export interface SendSmsResult {
  ok: boolean
  providerId?: string
  error?: string
  /** Provider error code (Twilio numeric, when present). Useful for audit logs. */
  errorCode?: string
  skipped?: boolean
}

const TWILIO_BASE = 'https://api.twilio.com/2010-04-01/Accounts'

async function sendViaTwilio(input: SendSmsInput): Promise<SendSmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

  if (!sid || !token || !messagingServiceSid) {
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
        // Round 14 — Messaging Service path (NOT `From`). The service
        // resolves the alphanumeric "OnCall" sender for ES destinations.
        MessagingServiceSid: messagingServiceSid,
        To: input.to,
        Body: input.body,
      }).toString(),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      // Try to surface Twilio's numeric error code from the JSON body.
      let twilioCode: string | undefined
      try {
        const parsed = JSON.parse(detail) as { code?: number; message?: string }
        if (typeof parsed.code === 'number') twilioCode = String(parsed.code)
      } catch {
        // not JSON; ignore
      }
      console.error(
        '[notifications/sms] Twilio error',
        res.status,
        twilioCode ?? '',
        detail.slice(0, 300),
      )
      return {
        ok: false,
        error: `twilio_${res.status}`,
        errorCode: twilioCode,
      }
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

  // Stub: log and pretend success. Useful for previews / local dev so
  // callers can walk the flow without spending €0.07 per SMS.
  console.warn(
    '[notifications/sms] STUB MODE — would send SMS:\n' +
      `  to:   ${input.to}\n` +
      `  body: ${input.body.slice(0, 160)}`,
  )
  return { ok: true, skipped: true }
}
