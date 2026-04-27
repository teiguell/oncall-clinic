import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ClinicDoctorsClient } from '@/components/clinic/ClinicDoctorsClient'

/**
 * /[locale]/clinic/doctors — Round 15B-5.
 *
 * Real page: lists clinic_doctors via /api/clinic/doctors, with status
 * badges (active/inactive/pending), invite-by-email modal, and per-row
 * disassociate action (DELETE /api/clinic/doctors/[id]).
 */
export default async function ClinicDoctorsPage({
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
        {t('nav.doctors')}
      </h1>
      <ClinicDoctorsClient />
    </div>
  )
}
