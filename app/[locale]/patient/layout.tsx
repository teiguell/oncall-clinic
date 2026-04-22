import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/**
 * PatientLayout — server-side guard that enforces BOTH:
 *   1. Authentication (handled in practice by middleware.ts too)
 *   2. Mandatory GDPR consents (health_data + geolocation)
 *
 * NOTE: `/patient/request` is INTENTIONALLY excluded from the `protectedPatientRoutes`
 * in `lib/supabase/middleware.ts`, so the booking flow handles auth/consent inline
 * via Step3 (`Step3Confirm` + `Step3Consent`). This layout catches everything
 * else — dashboard, tracking, history, profile, etc.
 *
 * If the user is missing mandatory consent, they are redirected to
 * `/patient/request?step=3&consent=required` — the booking flow will render
 * the consent form at Step 3 and then return them to the original target
 * after completion (UX nice-to-have for a future iteration).
 */
export default async function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Read current pathname from the header injected by `lib/supabase/middleware.ts`.
  // /patient/request self-gates (inline auth + consent) — skip the layout check
  // to avoid redirect loops.
  const hdrs = await headers()
  const pathname = hdrs.get('x-pathname') || ''
  if (pathname.includes('/patient/request')) {
    return <>{children}</>
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // Protected sub-route (dashboard, tracking, history, profile, etc.) — require
  // mandatory GDPR consents before rendering.
  const { data: consent } = await supabase
    .from('user_consents')
    .select('health_data, geolocation')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!consent?.health_data || !consent?.geolocation) {
    redirect(`/${locale}/patient/request?step=3&consent=required`)
  }

  return <>{children}</>
}
