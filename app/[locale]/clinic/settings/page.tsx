import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ClinicSettingsClient } from '@/components/clinic/ClinicSettingsClient'

/**
 * /[locale]/clinic/settings — Round 15B-5.
 *
 * Sections:
 *   1. Profile (edit name, phone, address, coverage zones, radius, description)
 *   2. Stripe Connect (status + setup CTA)
 *   3. Billing (placeholder — Round 15C will add monthly invoices)
 */
export default async function ClinicSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'clinicDashboard' })
  return (
    <div className="max-w-[800px]">
      <h1 className="font-bold text-[#0B1220] mb-6" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>
        {t('nav.settings')}
      </h1>
      <ClinicSettingsClient />
    </div>
  )
}
