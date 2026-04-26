/**
 * Email adapter — Resend via REST (no SDK install needed).
 * Round 11 Fix B.
 *
 * Configuration:
 *   RESEND_API_KEY   — required. If unset, sendEmail returns
 *                      { ok: false, skipped: true } and logs a warning.
 *   RESEND_FROM      — optional, defaults to "OnCall Clinic <noreply@oncall.clinic>".
 */

const RESEND_API_URL = 'https://api.resend.com/emails'

const DEFAULT_FROM = 'OnCall Clinic <noreply@oncall.clinic>'

export interface SendEmailInput {
  to: string
  subject: string
  html: string
  text?: string
  /** Optional reply-to override for human-routed addresses (e.g. support). */
  replyTo?: string
}

export interface SendEmailResult {
  ok: boolean
  providerId?: string
  error?: string
  skipped?: boolean
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[notifications/email] RESEND_API_KEY unset — skipping send to', input.to)
    return { ok: false, skipped: true, error: 'resend_not_configured' }
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || DEFAULT_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[notifications/email] Resend error', res.status, detail.slice(0, 300))
      return { ok: false, error: `resend_${res.status}` }
    }

    const json = (await res.json().catch(() => null)) as { id?: string } | null
    return { ok: true, providerId: json?.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown_error'
    console.error('[notifications/email] network error:', msg)
    return { ok: false, error: msg }
  }
}
