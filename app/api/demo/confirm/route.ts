import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * POST /api/demo/confirm
 *
 * Auto-confirms the email of a freshly-created demo user so login works
 * immediately after signUp. Only enabled when NEXT_PUBLIC_TEST_MODE=true —
 * returns 403 otherwise.
 *
 * Prevents the P0 bug that occurs when demo users are re-created without
 * email_confirmed_at being set.
 */
export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') {
    return NextResponse.json({ error: 'Demo mode not active' }, { status: 403 })
  }

  const { userId } = await req.json().catch(() => ({ userId: null as string | null }))
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
