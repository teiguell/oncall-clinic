import { setRequestLocale, getTranslations } from 'next-intl/server'

/**
 * /[locale]/clinic/doctors — Round 15A skeleton.
 *
 * Phase 1: empty-state placeholder. Phase 2 (Round 15B):
 *   - List doctors from clinic_doctors join doctor_profiles
 *   - Per-doctor: name, specialty, rating, consultations this month, status
 *   - Invite doctor button + toggle activate/deactivate
 *   - Delete association
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
      <div
        className="bg-white border border-dashed border-slate-300 text-center"
        style={{ padding: '48px 28px', borderRadius: 14 }}
      >
        <p className="text-slate-500 text-[14.5px]">Próximamente — Phase 2 (Round 15B)</p>
      </div>
    </div>
  )
}
