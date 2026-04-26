import { NextResponse } from 'next/server'
import { notify } from '@/lib/notifications'
import type { NotificationKind, NotificationChannel } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/send — internal-only endpoint for server code
 * that needs to dispatch a notification. Round 11 Fix B.
 *
 * Auth: shared-secret header `x-internal-secret` must match
 * `INTERNAL_NOTIFICATIONS_SECRET` env var. The caller is always our own
 * server (server actions, webhooks, cron jobs) — never the browser. We
 * deliberately do NOT accept Supabase user sessions here so a logged-in
 * patient can't trigger arbitrary doctor emails.
 *
 * Body shape (JSON):
 *   {
 *     to:       { email?, phone?, userId? },
 *     kind:     NotificationKind,
 *     data?:    Record<string, ...>,
 *     channels?: ('email' | 'sms' | 'push')[],
 *     locale?:  'es' | 'en'
 *   }
 *
 * Returns the same shape as the dispatcher's NotificationResult.
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-internal-secret')
  const expected = process.env.INTERNAL_NOTIFICATIONS_SECRET

  if (!expected) {
    console.error('[notifications/send] INTERNAL_NOTIFICATIONS_SECRET not set — refusing to send')
    return NextResponse.json({ error: 'not_configured', code: 'internal_secret_missing' }, { status: 503 })
  }
  if (secret !== expected) {
    return NextResponse.json({ error: 'unauthorized', code: 'invalid_internal_secret' }, { status: 401 })
  }

  let body: {
    to?: { email?: string; phone?: string; userId?: string }
    kind?: string
    data?: Record<string, unknown>
    channels?: string[]
    locale?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }

  if (!body.kind || !body.to || (!body.to.email && !body.to.phone)) {
    return NextResponse.json(
      { error: 'kind + (email|phone) required', code: 'bad_request' },
      { status: 400 },
    )
  }

  const result = await notify({
    to: body.to,
    kind: body.kind as NotificationKind,
    data: body.data as Record<string, string | number | boolean | null | undefined> | undefined,
    channels: body.channels as NotificationChannel[] | undefined,
    locale: body.locale === 'en' ? 'en' : 'es',
  })

  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
