import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ClinicRegisterForm } from '@/components/clinic/ClinicRegisterForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'clinicAuth.register' })
  return {
    title: `${t('title')} — OnCall Clinic`,
    description: t('subtitle'),
    robots: { index: false, follow: false },
  }
}

/**
 * /[locale]/clinic/register — Round 15.
 *
 * Public 2-step registration form for clinics. Step 1 captures company
 * data (name, CIF, legal name, email, phone, address, city, province).
 * Step 2 captures coverage (zones, radius km) + RC insurance
 * confirmation.
 *
 * On submit: server route POST /api/clinic/register creates an entry
 * in `clinics` with verification_status='pending'. The user is then
 * redirected to /clinic/login (or /clinic/dashboard if already auth'd).
 *
 * Auth-aware: the register form does NOT require an existing session.
 * The /api/clinic/register endpoint creates the auth.users + clinics
 * rows together (or attaches the new clinics row to the existing
 * session if present).
 */
export default async function ClinicRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ClinicRegisterForm locale={locale} />
}
