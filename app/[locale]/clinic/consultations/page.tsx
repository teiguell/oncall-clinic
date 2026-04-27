import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ClinicConsultationsClient } from '@/components/clinic/ClinicConsultationsClient'

/**
 * /[locale]/clinic/consultations — Round 15B-5.
 *
 * Real page: table of clinic consultations via /api/clinic/consultations.
 * Filters: date range, doctor, status. Each row shows
 * date · patient initials · doctor · zone · €gross · €commission · €net.
 *
 * R7 compliance: patient is shown as initials only.
 */
export default async function ClinicConsultationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'clinicDashboard' })
  return (
    <div className="max-w-[1100px]">
      <h1 className="font-bold text-[#0B1220] mb-6" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>
        {t('nav.consultations')}
      </h1>
      <ClinicConsultationsClient />
    </div>
  )
}
