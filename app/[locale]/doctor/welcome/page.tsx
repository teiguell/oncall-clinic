import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'
import { DoctorWelcomeTour } from '@/components/doctor/DoctorWelcomeTour'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'doctor.welcome' })
  return {
    title: `${t('title')} — OnCall Clinic`,
    robots: { index: false, follow: false },
  }
}

/**
 * /[locale]/doctor/welcome — Round 17-A.
 *
 * 5-card tour shown to a doctor on first sign-in after activation
 * (email verified + phone OTP verified + admin reviewed). Skippable;
 * each card has a "Saltar" button. Completion is tracked in
 * `doctor_profiles.welcome_completed_at` so subsequent logins skip.
 *
 * Cards (per Round 17 spec):
 *   1. Tu agenda      → /doctor/availability  (R17-D, deferred)
 *   2. Tu zona        → /doctor/coverage      (R17-D, deferred)
 *   3. Tu tarifa      → /doctor/pricing       (deferred — copy nudge)
 *   4. Tu Stripe      → informational (R18A: post-first-visit)
 *   5. Listo          → /doctor/dashboard
 *
 * Round 17-A scope: ships the 5-card UI + skip + dashboard CTA. The
 * destination pages (/availability, /coverage, /pricing) are R17-D
 * follow-ups; clicking those CTAs gracefully redirects to /dashboard
 * for now (with a toast nudge).
 *
 * Auto-redirect: if welcome_completed_at is already set, jump straight
 * to /dashboard so we don't trap returning doctors.
 */
export default async function DoctorWelcomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const { userId, supabase } = await getEffectiveSession('doctor')
  if (!userId) {
    redirect(`/${locale}/login?next=/${locale}/doctor/welcome`)
  }

  // Check if the doctor has already completed the welcome tour.
  const { data: doctorProfile } = await supabase
    .from('doctor_profiles')
    .select('welcome_completed_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (doctorProfile?.welcome_completed_at) {
    redirect(`/${locale}/doctor/dashboard`)
  }

  return <DoctorWelcomeTour locale={locale} />
}
