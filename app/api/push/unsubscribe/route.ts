import { NextResponse } from 'next/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/push/unsubscribe — Round 17-F.
 *
 * Body: { endpoint: string }
 *
 * Removes the row matching (user_id, endpoint). User can call this on
 * sign-out OR when toggling off notification preferences. Idempotent.
 */
export async function POST(request: Request) {
  let body: { endpoint?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }
  if (!body.endpoint) {
    return NextResponse.json({ error: 'endpoint_required', code: 'bad_request' }, { status: 400 })
  }

  const { userId, supabase } = await getEffectiveSession()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', body.endpoint)

  return NextResponse.json({ ok: true })
}
