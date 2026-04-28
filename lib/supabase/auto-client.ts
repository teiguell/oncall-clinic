import type { SupabaseClient } from '@supabase/supabase-js'
import { AUTH_BYPASS, getBypassUser, type BypassRole } from '@/lib/auth-bypass'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

/**
 * Bypass-aware session + Supabase client resolver — Round 14F-5.
 *
 * Returns a single object with the resolved userId AND the right
 * Supabase client to use for downstream queries:
 *
 *   - Real cookie session (production): cookie-bound client + user.id
 *     RLS enforces row ownership via auth.uid() — fully secure.
 *
 *   - AUTH_BYPASS=true with bypass user matching `expectRole`:
 *     service-role client + bypass.id. RLS is bypassed, so callers
 *     MUST manually filter by `userId` in WHERE clauses to avoid
 *     leaking other users' rows.
 *
 *   - No session AND no eligible bypass: userId=null + cookie client.
 *     Caller should redirect to /login.
 *
 * Why one function instead of two:
 *   - Avoids double `supabase.auth.getUser()` (one DB roundtrip per page)
 *   - Couples the userId + client decision so callers can't accidentally
 *     resolve to the bypass user but query with the cookie client (would
 *     hit RLS empty-row).
 *
 * Security contract:
 *   - NEVER call from a client component (service-role key would leak)
 *   - When `isBypass=true`, queries MUST `.eq()` on the effective userId.
 *     Example:
 *
 *       const { userId, supabase } = await getEffectiveSession('patient')
 *       if (!userId) redirect(`/${locale}/login`)
 *       const { data } = await supabase
 *         .from('consultations')
 *         .select('*')
 *         .eq('patient_id', userId)   // ← required when bypass
 *
 *   - `expectRole` defends bypass=clinic from rendering patient data:
 *     /patient/dashboard passes 'patient'; if bypass=clinic is active
 *     the resolver returns userId=null → redirect to login.
 */
export interface EffectiveSession {
  userId: string | null
  supabase: SupabaseClient
  isBypass: boolean
}

export async function getEffectiveSession(
  expectRole?: BypassRole,
): Promise<EffectiveSession> {
  const cookieClient = await createServerClient()
  const {
    data: { user },
  } = await cookieClient.auth.getUser()

  // Real session always wins.
  if (user?.id) {
    return { userId: user.id, supabase: cookieClient, isBypass: false }
  }

  // No real session → check bypass.
  if (AUTH_BYPASS) {
    const bypass = getBypassUser()
    if (bypass && (!expectRole || bypass.role === expectRole)) {
      return {
        userId: bypass.id,
        supabase: createServiceRoleClient(),
        isBypass: true,
      }
    }
  }

  // No real session, no eligible bypass — caller decides what to do.
  return { userId: null, supabase: cookieClient, isBypass: false }
}
