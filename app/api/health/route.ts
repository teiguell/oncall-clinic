import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health — liveness + readiness probe.
 *
 * Returns 200 + JSON always (Vercel edge health checks don't differentiate
 * on status codes inside function handlers). Consumers should inspect the
 * `ok` flag + individual subsystem fields.
 */
export async function GET() {
  let supabaseStatus: 'up' | 'down' = 'up'
  let supabaseError: string | null = null
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    if (error) {
      supabaseStatus = 'down'
      supabaseError = error.message
    }
  } catch (err) {
    supabaseStatus = 'down'
    supabaseError = err instanceof Error ? err.message : 'unknown'
  }

  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY
  const webhookConfigured = !!process.env.STRIPE_WEBHOOK_SECRET
  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const ok = supabaseStatus === 'up' && stripeConfigured && supabaseConfigured

  return NextResponse.json({
    ok,
    supabase: supabaseStatus,
    supabase_error: supabaseError,
    stripe: stripeConfigured ? 'configured' : 'missing',
    stripe_webhook: webhookConfigured ? 'configured' : 'missing',
    env_supabase: supabaseConfigured ? 'configured' : 'missing',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    timestamp: new Date().toISOString(),
  })
}
