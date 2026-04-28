import { useTranslations } from 'next-intl'

/**
 * ClinicaLogos — Round 20 Q3-2.
 *
 * 3-slot "trusted by" cluster on /clinica between StatsBar and
 * Problem/Solve. Currently 3 placeholder slots ("Tu clínica aquí" +
 * 2× "Próximamente"). As real partner clinics sign up, these become
 * real logos.
 *
 * Placeholder design: muted slate cards with the clinic name as
 * uppercase tracked text. Visual rhythm preserved when real logos
 * (SVG) replace the text in a follow-up.
 */
export function ClinicaLogos() {
  const t = useTranslations('clinicLanding.logos')
  const slots = [t('slot0'), t('slot1'), t('slot2')]
  return (
    <section
      className="bg-white border-t border-slate-200"
      style={{ padding: 'clamp(36px, 5vw, 56px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[920px] mx-auto text-center">
        <div className="text-[11.5px] uppercase tracking-[0.18em] text-slate-500 font-semibold mb-5">
          {t('eyebrow')}
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {slots.map((label, i) => (
            <div
              key={i}
              className="bg-slate-50 border border-dashed border-slate-200 grid place-items-center"
              style={{
                padding: 'clamp(20px, 3vw, 32px)',
                borderRadius: 12,
                minHeight: 70,
              }}
            >
              <span
                className="text-slate-500 font-semibold uppercase tracking-[0.12em]"
                style={{ fontSize: 'clamp(11px, 1.1vw, 13px)' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
