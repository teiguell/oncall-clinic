/**
 * AuthBypassBanner — Round 9 Fix H + Round 11 Fix A.
 *
 * Visible only when NEXT_PUBLIC_AUTH_BYPASS=true. Sits below TestModeBanner
 * and above page content. Purple to be loudly distinct from the amber
 * MODO PRUEBA banner so an auditor can see at a glance that bypass is on.
 *
 * Round 11: now reads NEXT_PUBLIC_AUTH_BYPASS_ROLE so the banner explicitly
 * announces which demo identity is active (PATIENT / DOCTOR / ADMIN).
 *
 * Reads env vars directly (NEXT_PUBLIC_*, inlined at build time).
 * Server component — no client JS shipped.
 */
export function AuthBypassBanner() {
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS !== 'true') return null

  // Round 20 Q3-3: production gate. The banner is for Cowork audit
  // envs (Vercel preview + local dev). On production we hide it even
  // if AUTH_BYPASS was accidentally left on so a public visitor never
  // sees the purple "AUTH BYPASS ACTIVO" banner. (The bypass server
  // logic is also env-gated; the banner suppression is defense-in-depth.)
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') return null

  const rawRole = process.env.NEXT_PUBLIC_AUTH_BYPASS_ROLE
  // Round 18-D: 'clinic' added to the recognised roles list.
  const role =
    rawRole === 'doctor' || rawRole === 'admin' || rawRole === 'clinic'
      ? rawRole
      : 'patient'
  const label = role.toUpperCase()
  return (
    <div
      role="status"
      className="bg-purple-600 text-white text-center text-xs sm:text-sm py-1.5 px-4 sticky top-0 z-[60]"
    >
      🔓 AUTH BYPASS ACTIVO ({label}) — sesión simulada como demo-{role}. Solo para audit live.
    </div>
  )
}
