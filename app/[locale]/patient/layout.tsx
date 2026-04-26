import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { BottomTabBarWrapper } from '@/components/shared/bottom-tab-bar-wrapper'

/**
 * PatientLayout — server-side auth gate for every /[locale]/patient/*.
 *
 * AUDIT P0-2 (2026-04-23): the previous version of this layout enforced a
 * mandatory GDPR consent check on ALL patient routes (dashboard, profile,
 * history, tracking, privacy, ...), redirecting everyone without a
 * `user_consents` row to `/patient/request?step=3&consent=required`.
 *
 * That was legally over-reaching. Art. 9.2.a GDPR requires explicit consent
 * to PROCESS new health data — i.e., before creating a new consultation.
 * Browsing your existing profile, reviewing past consultations, or
 * following a tracking map for a consultation you already consented to
 * does NOT need a fresh consent gate.
 *
 * New behaviour:
 *   1. Unauthenticated → /login?next=<current-path> (preserves context)
 *   2. Authenticated → pass through. No consent check at the layout level.
 *   3. The consent capture still lives INSIDE the booking flow
 *      (Step3Consent at /patient/request?step=3) — that's where new health
 *      data gets processed, so that's where the gate belongs.
 *
 * Special case: /patient/request is excluded from this layout's auth
 * redirect because it self-gates with inline Magic Link + Google OAuth
 * + consent capture. Reading x-pathname (set by middleware.ts) avoids
 * the redirect loop that a blanket layout check would create.
 */
export default async function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const hdrs = await headers()
  const pathname = hdrs.get('x-pathname') || ''

  // Self-gated: the booking flow handles its own auth + consent inline.
  if (pathname.includes('/patient/request')) {
    return <>{children}</>
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const encodedNext = encodeURIComponent(pathname || `/${locale}/patient/dashboard`)
    redirect(`/${locale}/login?next=${encodedNext}`)
  }

  // Round 7 M7: BottomTabBar mobile nav. The wrapper has its own hide
  // logic for tracking/chat/booking-success so we don't have to gate here.
  // pb-20 on a sub-wrapper would override consumer page's own padding;
  // instead each consuming page already has safe-area or tab-bar buffer.
  return (
    <>
      {children}
      <BottomTabBarWrapper />
    </>
  )
}
