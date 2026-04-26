/**
 * Auth bypass — Round 9 Fix H (TEMPORAL, alpha audit only).
 *
 * Why this exists:
 *   Cowork (Director's Chrome MCP) cannot complete real OAuth flows in its
 *   audit environment (extensions in the profile mutate the OAuth popup,
 *   and Director won't expose real credentials to MCP). To audit the full
 *   patient flow end-to-end (booking → Stripe → tracking → feedback) we
 *   provide a server+client recognised "demo patient" identity, gated
 *   behind a single env var.
 *
 * Activation:
 *   `NEXT_PUBLIC_AUTH_BYPASS=true` on Vercel (Preview + Production).
 *   Off (the default + when the env var is anything else): zero behaviour
 *   change. The flag is a public env so the client bundle can read it
 *   directly — there's nothing secret about "we're in audit mode".
 *
 * Removal plan:
 *   1. Cowork closes alpha audit.
 *   2. Director flips the env var off (or deletes it) on Vercel.
 *   3. After alpha launch, the next code sweep deletes this file + its
 *      imports across the repo. Search for `AUTH_BYPASS` to find all
 *      usage sites.
 *
 * The bypass intentionally does NOT touch Supabase RLS or the cookies
 * that Supabase uses to identify a session. It only writes the bypass
 * user's id/email into checkout payloads + UI state. Real database rows
 * for the demo patient still need the seed UUID below to exist in
 * `auth.users` + `profiles` (Director runs that seed once).
 */

export const AUTH_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true'

/**
 * Stable seed UUID — must match a row in `auth.users` and `profiles` for
 * the consultations FK to succeed. Director-controlled (one-time SQL seed).
 * If you change this, also update the seed migration.
 */
// Director note (2026-04-26): seed UUID 00000000-... no longer matched any
// real row. Switched to existing demo-patient row (3d23f1d6-...) which
// already exists in auth.users + has profile {role: 'patient'} created
// via Supabase MCP. No new seed needed.
export const BYPASS_USER_ID = '3d23f1d6-0bfe-4bf5-90ff-e63919cd0b6f'

/**
 * Shape mimics @supabase/supabase-js User just enough for the booking flow.
 * We deliberately do NOT include access tokens — bypass cannot pretend to
 * have a session against Supabase services. It's a UI/server-handler
 * convenience only.
 */
export const BYPASS_USER = {
  id: BYPASS_USER_ID,
  email: 'demo-patient@oncall.clinic',
  user_metadata: {
    full_name: 'Demo Patient',
  },
} as const

export type BypassUserShape = typeof BYPASS_USER
