import { setRequestLocale, getTranslations } from 'next-intl/server'

/**
 * /[locale]/clinic/consultations — Round 15A skeleton.
 *
 * Phase 1: empty-state placeholder. Phase 2 (Round 15B):
 *   - Table of consultations.* WHERE clinic_id = clinic.id
 *   - Filters: date range, doctor, status, zone
 *   - Per-row: date, patient (only name), doctor, zone, price, commission, net
 *   - CSV export
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
      <div
        className="bg-white border border-dashed border-slate-300 text-center"
        style={{ padding: '48px 28px', borderRadius: 14 }}
      >
        <p className="text-slate-500 text-[14.5px]">Próximamente — Phase 2 (Round 15B)</p>
      </div>
    </div>
  )
}
