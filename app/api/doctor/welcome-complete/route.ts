import { NextResponse } from 'next/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/doctor/welcome-complete — Round 17-A.
 *
 * Marks the welcome tour as completed for the current doctor by
 * setting `doctor_profiles.welcome_completed_at = NOW()`. Idempotent:
 * the welcome page checks this column on next visit and redirects to
 * /dashboard, so re-completing is a no-op.
 *
 * Auth: real doctor session OR doctor bypass (welcome page is
 * /doctor/* and gated server-side).
 *
 * Best-effort: if the column doesn't exist yet (migration deferred),
 * the UPDATE silently no-ops via Supabase — caller doesn't see an
 * error. The page logic uses maybeSingle() so a missing column or row
 * just keeps the doctor on /welcome (acceptable until migration
 * lands).
 */
export async function POST() {
  const { userId, supabase } = await getEffectiveSession('doctor')
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }
  const { error } = await supabase
    .from('doctor_profiles')
    .update({ welcome_completed_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) {
    // Migration may not be applied yet — degrade gracefully.
    console.warn('[doctor/welcome-complete] update failed:', error.message)
    return NextResponse.json({ ok: false, error: error.message })
  }
  return NextResponse.json({ ok: true })
}
