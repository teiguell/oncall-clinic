import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { BottomTabBarWrapper } from '@/components/shared/bottom-tab-bar-wrapper'
import { AUTH_BYPASS, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'
import { StripeSetupBanner } from '@/components/doctor/StripeSetupBanner'

/**
 * DoctorLayout — server-side gate for every route under /[locale]/doctor/*.
 *
 * Behaviour:
 *   1. Unauthenticated users → redirect to /login?next=<current-path>
 *      (so after Magic Link / Google OAuth they land back where they were)
 *   2. Authenticated users whose profile.role !== 'doctor' → redirect to
 *      /[locale] (their own role's homepage)
 *   3. /[locale]/doctor/onboarding is INTENTIONALLY kept accessible to
 *      users whose profile.role is 'doctor' but whose doctor_profile row
 *      is incomplete — the onboarding page itself guides them through.
 *
 * Reads x-pathname header (injected by lib/supabase/middleware.ts) to build
 * the `next` query param. Same pattern we use in app/[locale]/patient/layout.tsx.
 */
export default async function DoctorLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const hdrs = await headers()
  const pathname = hdrs.get('x-pathname') || `/${locale}/doctor/dashboard`

  // Round 11 Fix A — bypass server gate when auditor is impersonating
  // the demo doctor. We skip both the auth and the role check; the seed
  // doctor row (profile.role='doctor') exists in DB so any downstream
  // query that joins on the bypass UUID still works.
  if (!(AUTH_BYPASS && AUTH_BYPASS_ROLE === 'doctor')) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect(`/${locale}/login?next=${encodeURIComponent(pathname)}`)
    }

    // Role check: block patients / admins from seeing the doctor UI
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      // User exists in auth.users but no profiles row — force login flow to
      // trigger the profile creation path (OAuth callback creates it).
      redirect(`/${locale}/login?next=${encodeURIComponent(pathname)}`)
    }

    if (profile.role !== 'doctor') {
      redirect(`/${locale}`)
    }
  }

  // Round 18A-5: Stripe setup banner at top of /doctor/dashboard.
  // Pathname gate keeps it dashboard-only (avoid redundant DB hits on
  // /doctor/consultations etc.). Banner returns null when the doctor
  // is already onboarded or has no pending payouts.
  const isDashboard = pathname === `/${locale}/doctor/dashboard`

  // Round 7 M7: BottomTabBar mobile nav under all /doctor/* routes.
  return (
    <>
      {isDashboard && (
        <div className="max-w-[1200px] mx-auto px-4 pt-4">
          <StripeSetupBanner locale={locale} />
        </div>
      )}
      {children}
      <BottomTabBarWrapper />
    </>
  )
}
