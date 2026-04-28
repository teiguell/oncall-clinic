import { NextResponse } from 'next/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/push/subscribe — Round 17-F.
 *
 * Body: a `PushSubscriptionJSON` from the browser:
 *   {
 *     endpoint: 'https://...',
 *     keys: { p256dh: '...', auth: '...' }
 *   }
 *
 * Optional: { userAgent: string } — captured from navigator.userAgent
 * for debug-per-device. Omitted in production privacy mode (header
 * already arrives with the request anyway).
 *
 * Behaviour:
 *   - Auth required (real session OR bypass with patient/doctor/clinic role)
 *   - UPSERT by endpoint (a re-subscribe from the same device replaces
 *     the keys, preserves the row id + created_at)
 *
 * Returns: { ok, subscriptionId }
 */
export async function POST(request: Request) {
  let body: {
    endpoint?: string
    keys?: { p256dh?: string; auth?: string }
    userAgent?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json(
      { error: 'subscription_required', code: 'bad_request' },
      { status: 400 },
    )
  }

  const { userId, supabase } = await getEffectiveSession()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  // UPSERT by endpoint to handle re-subscriptions cleanly.
  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: userId,
        endpoint: body.endpoint,
        keys: body.keys,
        user_agent:
          (body.userAgent ?? request.headers.get('user-agent'))?.slice(0, 250) ?? null,
      },
      { onConflict: 'endpoint' },
    )
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message, code: 'db_error' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, subscriptionId: data.id })
}
