import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'

/**
 * ClinicaLogos — Round 20 Q3-2 + Round 25-9 (Z-9) placeholder upgrade.
 *
 * 3-slot "trusted by" cluster on /clinica between StatsBar and
 * Problem/Solve. Pre-Round-25 the slots were anonymous slate cards.
 * Now each card is a deliberate "available spot" — dashed border
 * with a `+` icon + "Próximamente: tu clínica" label, plus a CTA
 * below the row that anchors to the bottom B2B form (Round 22-7).
 *
 * Once real partner clinics sign up, the `slots` array can be
 * replaced with `<Image src="…" alt="…">` per slot. The CTA stays
 * forever as a "join the program" tertiary entry.
 *
 * R7: pure marketing surface, no clinical content.
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
              className="bg-slate-50/60 border-2 border-dashed border-slate-200 grid place-items-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/30"
              style={{
                padding: 'clamp(20px, 3vw, 32px)',
                borderRadius: 12,
                minHeight: 84,
              }}
              aria-label={label}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Plus
                  className="text-slate-400 h-5 w-5"
                  aria-hidden="true"
                />
                <span
                  className="text-slate-500 font-semibold tracking-[0.05em]"
                  style={{ fontSize: 'clamp(11px, 1.05vw, 12.5px)' }}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Round 25-9 (Z-9): CTA below the placeholder row that
            anchors to the existing B2B lead form (Round 22-7). The
            arrow signals an in-page jump; smooth-scroll is global. */}
        <a
          href="#contacto-clinica"
          className="inline-flex items-center gap-1.5 mt-6 text-[13.5px] font-medium text-indigo-700 hover:text-indigo-900 transition-colors"
        >
          {t('cta')}
        </a>
      </div>
    </section>
  )
}
