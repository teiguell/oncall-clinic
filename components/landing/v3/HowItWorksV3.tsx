import { useTranslations } from 'next-intl'
import { MapPin, Stethoscope, Check, type LucideIcon } from 'lucide-react'
import { SectionHeader } from './SectionHeader'

const STEP_COUNT = 3
const ICONS: LucideIcon[] = [MapPin, Stethoscope, Check]

/**
 * "Tres pasos. Sin papeleo." — 3-card numbered grid.
 * Server component, pulls all copy from `landingV3.how.steps[i]`.
 */
export function HowItWorksV3() {
  const t = useTranslations('landingV3.how')
  return (
    <section
      id="como-funciona"
      className="bg-[#FAFBFC]"
      style={{ padding: 'clamp(56px, 8vw, 110px) clamp(22px, 6vw, 80px)' }}
    >
      <div className="max-w-[1180px] mx-auto">
        <SectionHeader eyebrow={t('eyebrow')} title={t('title')} sub={t('subtitle')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 md:gap-5 mt-7 md:mt-14 relative">
          {Array.from({ length: STEP_COUNT }, (_, i) => {
            const Icon = ICONS[i]
            return (
              <article
                key={i}
                className="relative bg-white border border-[#EEF2F6] shadow-[0_1px_0_rgba(11,18,32,.02),0_8px_30px_-16px_rgba(11,18,32,.08)]"
                style={{ borderRadius: 20, padding: 'clamp(22px, 3vw, 30px)' }}
              >
                <div className="text-[13px] font-bold tracking-[0.08em] text-slate-400">
                  {t(`steps.${i}.n`)}
                </div>
                <div
                  className="mt-3.5 grid place-items-center"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #EEF4FF, #FFF7E6)',
                  }}
                >
                  <Icon className="h-[26px] w-[26px] text-[#3B82F6]" aria-hidden="true" />
                </div>
                <div
                  className="mt-4 font-bold text-[#0B1220]"
                  style={{ fontSize: 'clamp(19px, 1.8vw, 22px)', letterSpacing: '-0.02em' }}
                >
                  {t(`steps.${i}.title`)}
                </div>
                <div
                  className="mt-2 text-slate-600"
                  style={{ fontSize: 14.5, lineHeight: 1.55 }}
                >
                  {t(`steps.${i}.body`)}
                </div>
                {/* Connector line — desktop only, between cards 0/1 and 1/2 */}
                {i < STEP_COUNT - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden md:block absolute"
                    style={{
                      right: -16,
                      top: '50%',
                      width: 32,
                      height: 1,
                      background: 'linear-gradient(90deg, #E5E7EB, transparent)',
                    }}
                  />
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
