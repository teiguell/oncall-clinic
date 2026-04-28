/**
 * Auth bypass — Round 9 Fix H + Round 11 Fix A (TEMPORAL, alpha audit only).
 *
 * Why this exists:
 *   Cowork (Director's Chrome MCP) cannot complete real OAuth flows in its
 *   audit environment (extensions in the profile mutate the OAuth popup,
 *   and Director won't expose real credentials to MCP). To audit the full
 *   patient + doctor journeys end-to-end (booking → Stripe → tracking →
 *   feedback / onboarding → dashboard → consultations) we provide
 *   server+client recognised "demo" identities, gated behind env vars.
 *
 * Activation (set on Vercel Preview + Production):
 *   `NEXT_PUBLIC_AUTH_BYPASS=true`         → enables bypass at all
 *   `NEXT_PUBLIC_AUTH_BYPASS_ROLE=patient` → bypass user is the demo patient (default)
 *   `NEXT_PUBLIC_AUTH_BYPASS_ROLE=doctor`  → bypass user is the demo doctor
 *   `NEXT_PUBLIC_AUTH_BYPASS_ROLE=admin`   → bypass user is the demo admin (no seed yet)
 *   `NEXT_PUBLIC_AUTH_BYPASS_ROLE=clinic`  → bypass user is the demo clinic owner (Round 15)
 *
 * Off (the default + when the env var is anything else): zero behaviour
 * change. The flags are public envs so the client bundle can read them
 * directly — there's nothing secret about "we're in audit mode".
 *
 * Removal plan:
 *   1. Cowork closes alpha audit.
 *   2. Director flips env vars off (or deletes them) on Vercel.
 *   3. After alpha launch, the next code sweep deletes this file + its
 *      imports across the repo. Search for `AUTH_BYPASS` to find all
 *      usage sites.
 *
 * The bypass intentionally does NOT touch Supabase RLS or the cookies
 * that Supabase uses to identify a session. It only writes the bypass
 * user's id/email/role into checkout payloads + UI state. Real database
 * rows for the demo user must exist in `auth.users` + `profiles` (and
 * `doctor_profiles` for the doctor role) — Director-managed seed.
 */

export const AUTH_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true'

export type BypassRole = 'patient' | 'doctor' | 'admin' | 'clinic'

const RAW_ROLE = process.env.NEXT_PUBLIC_AUTH_BYPASS_ROLE
export const AUTH_BYPASS_ROLE: BypassRole =
  RAW_ROLE === 'doctor' || RAW_ROLE === 'admin' || RAW_ROLE === 'clinic'
    ? RAW_ROLE
    : 'patient'

/**
 * Existing seed users in `auth.users` (verified via Supabase MCP):
 *   - patient: 3d23f1d6-0bfe-4bf5-90ff-e63919cd0b6f (demo-patient@oncall.clinic)
 *     • Round 9 Fix H — Director-seeded
 *   - doctor:  628856ea-4c70-4bfb-b35d-dfd56d95f951 (demo-doctor@oncall.clinic)
 *     • Round 11 Fix A — Director-seeded with COMIB 07/12345, RC AXA Demo
 *       €600k cobertura, verification_status=verified, is_available=true,
 *       activated_at=NOW, consultation_price=15000 (€150 cents),
 *       lat 38.9067 lng 1.4206 (Ibiza centro)
 *   - admin:   no seed yet — alpha audit doesn't cover admin surface
 *
 * If you change a UUID, also update the Director seed SQL.
 */
const BYPASS_USERS: Record<BypassRole, BypassUserShape> = {
  patient: {
    id: '3d23f1d6-0bfe-4bf5-90ff-e63919cd0b6f',
    email: 'demo-patient@oncall.clinic',
    user_metadata: { full_name: 'Demo Patient', role: 'patient' },
    role: 'patient',
  },
  doctor: {
    id: '628856ea-4c70-4bfb-b35d-dfd56d95f951',
    email: 'demo-doctor@oncall.clinic',
    user_metadata: { full_name: 'Demo Doctor (Cowork Bypass)', role: 'doctor' },
    role: 'doctor',
  },
  admin: {
    // Placeholder — admin audit path is not in scope for alpha.
    id: '00000000-0000-0000-0000-000000000a01',
    email: 'demo-admin@oncall.clinic',
    user_metadata: { full_name: 'Demo Admin', role: 'admin' },
    role: 'admin',
  },
  clinic: {
    // Round 18-D: Cowork seeded the demo clinic owner via direct SQL.
    //   user_id  : 4d34e2e7-b5c3-5f25-9dc7-af3afa295ce7
    //   clinic_id: 0d40b56a-5593-4e82-8db3-4bef92a2eadd (Clínica Demo Ibiza)
    //   linked   : 3 doctors via clinic_doctors
    //   verified : verification_status='verified'
    // The /clinic/dashboard now reads real seeded KPIs in bypass mode.
    id: '4d34e2e7-b5c3-5f25-9dc7-af3afa295ce7',
    email: 'demo-clinic@oncall.clinic',
    user_metadata: { full_name: 'Clínica Demo Ibiza', role: 'clinic' },
    role: 'clinic',
  },
}

/**
 * Shape mimics @supabase/supabase-js User just enough for the booking +
 * onboarding flows. We deliberately do NOT include access tokens — bypass
 * cannot pretend to have a session against Supabase services. It's a
 * UI/server-handler convenience only.
 */
export type BypassUserShape = {
  id: string
  email: string
  user_metadata: { full_name: string; role: BypassRole }
  role: BypassRole
}

export const BYPASS_USER: BypassUserShape = BYPASS_USERS[AUTH_BYPASS_ROLE]
export const BYPASS_USER_ID = BYPASS_USER.id

/**
 * Convenience: the same lookup function for server-side code that needs
 * to evaluate role-aware bypass without re-reading process.env. This is
 * the canonical helper callers should use; do NOT inline the env check
 * in route handlers (that pattern was OK pre-Round 11 but now we'd have
 * to inline the role resolution everywhere too).
 */
export function getBypassUser(): BypassUserShape | null {
  return AUTH_BYPASS ? BYPASS_USER : null
}
