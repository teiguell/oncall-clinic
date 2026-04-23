import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Vercel Cron — /api/cron/purge-chat
 *
 * Triggered daily at 03:00 UTC by vercel.json. Calls the Supabase RPC
 * `purge_old_chat_messages()` (SECURITY DEFINER, service_role only).
 *
 * Replaces pg_cron from migration 018 — pg_cron is not available on the
 * current Supabase tier, so the scheduling lives in Vercel and the
 * deletion logic in a Postgres function.
 *
 * Auth: Vercel Cron always sends Authorization: Bearer <CRON_SECRET>.
 * Any request without that header returns 401.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data, error } = await supabase.rpc('purge_old_chat_messages')

  if (error) {
    console.error('[cron/purge-chat] error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const deletedCount =
    (Array.isArray(data) ? (data[0] as { deleted_count?: number } | undefined)?.deleted_count : undefined) ?? 0

  console.log(`[cron/purge-chat] deleted ${deletedCount} messages`)

  return NextResponse.json({
    ok: true,
    deleted_count: deletedCount,
    timestamp: new Date().toISOString(),
  })
}
