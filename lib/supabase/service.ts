import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — Round 14F-3.
 *
 * BYPASSES Row Level Security. Use this ONLY when:
 *   1. The caller has been authenticated through your own logic
 *      (real session OR bypass user with role check), AND
 *   2. The operation hits a table whose RLS policy requires
 *      `auth.uid()` to match a row column, AND
 *   3. The bypass user has no real Supabase session — so RLS sees
 *      `auth.uid() = null` and rejects the write.
 *
 * Practical use case: AUTH_BYPASS=true + AUTH_BYPASS_ROLE=patient/doctor/clinic.
 * The bypass user has a synthetic UUID matching a real row in
 * `profiles`/`doctor_profiles`/`clinics`, but `supabase.auth.getUser()`
 * returns null because the bypass never minted a session token. The
 * cookie-bound client (`@/lib/supabase/server`) cannot insert against
 * tables with RLS that gate on `auth.uid()`. Switching to service_role
 * for those specific inserts is the documented escape hatch.
 *
 * Real production users (no bypass) keep using the cookie-bound client
 * — RLS protects them from writing to other users' rows. The
 * service-role path is gated on AUTH_BYPASS so it cannot be triggered
 * from a real client request.
 *
 * SECURITY: requires `SUPABASE_SERVICE_ROLE_KEY` env var (server-only,
 * never bundled to the client). Never expose this client to client
 * components or unauthenticated routes.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      '[supabase/service] SUPABASE_SERVICE_ROLE_KEY missing — service-role client unavailable',
    )
  }
  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
