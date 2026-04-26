import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { BottomTabBarWrapper } from '@/components/shared/bottom-tab-bar-wrapper'

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

  // Round 7 M7: BottomTabBar mobile nav under all /doctor/* routes.
  return (
    <>
      {children}
      <BottomTabBarWrapper />
    </>
  )
}
