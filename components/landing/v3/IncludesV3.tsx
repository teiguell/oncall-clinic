import { useTranslations } from 'next-intl'
import { Check, X } from 'lucide-react'
import { SectionHeader } from './SectionHeader'

const YES_COUNT = 5
const NO_COUNT = 3

/**
 * "Qué incluye / Qué NO incluye" dual-card section + 112 emergency
 * pill. Server component. The 112 pill is the legal-honesty piece —
 * we do NOT replace urgent care, we triage to it.
 */
export function IncludesV3() {
  const t = useTranslations('landingV3.includes')
  return (
    <section
      id="servicio"
      style={{
        padding: 'clamp(56px, 8vw, 110px) clamp(22px, 6vw, 80px)',
        background: 'linear-gradient(180deg, #FAFBFC 0%, #F4F7FB 100%)',
      }}
    >
      <div className="max-w-[1180px] mx-auto">
        <SectionHeader eyebrow={t('eyebrow')} title={t('title')} sub={t('subtitle')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-5 mt-7 md:mt-12">
          {/* Includes card */}
          <div
            className="bg-white"
            style={{
              borderRadius: 20,
              padding: 'clamp(22px, 3vw, 32px)',
              border: '1px solid #DCFCE7',
              boxShadow: '0 1px 0 rgba(11,18,32,.02), 0 8px 30px -16px rgba(16,185,129,.18)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="grid place-items-center w-[38px] h-[38px] rounded-[10px] bg-emerald-50">
                <Check className="h-[22px] w-[22px] text-emerald-500" aria-hidden="true" />
              </div>
              <div
                className="font-bold"
                style={{ fontSize: 'clamp(20px, 1.8vw, 22px)', letterSpacing: '-0.02em' }}
              >
                {t('yesTitle')}
              </div>
            </div>
            <ul className="list-none p-0 mt-5 flex flex-col gap-3.5">
              {Array.from({ length: YES_COUNT }, (_, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 grid place-items-center w-[22px] h-[22px] rounded-full bg-emerald-50 mt-px">
                    <Check className="h-[14px] w-[14px] text-emerald-500" aria-hidden="true" />
                  </div>
                  <div className="text-[15.5px] text-[#1E293B] leading-[1.45]">
                    {t(`yesItems.${i}`)}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Excludes card */}
          <div
            className="bg-white"
            style={{
              borderRadius: 20,
              padding: 'clamp(22px, 3vw, 32px)',
              border: '1px solid #FEE2E2',
              boxShadow: '0 1px 0 rgba(11,18,32,.02), 0 8px 30px -16px rgba(239,68,68,.16)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="grid place-items-center w-[38px] h-[38px] rounded-[10px] bg-red-50">
                <X className="h-[22px] w-[22px] text-red-500" aria-hidden="true" strokeWidth={2.4} />
              </div>
              <div
                className="font-bold"
                style={{ fontSize: 'clamp(20px, 1.8vw, 22px)', letterSpacing: '-0.02em' }}
              >
                {t('noTitle')}
              </div>
            </div>
            <ul className="list-none p-0 mt-5 flex flex-col gap-3.5">
              {Array.from({ length: NO_COUNT }, (_, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 grid place-items-center w-[22px] h-[22px] rounded-full bg-red-50 mt-px">
                    <X className="h-3 w-3 text-red-500" aria-hidden="true" strokeWidth={3} />
                  </div>
                  <div className="text-[15.5px] text-[#1E293B] leading-[1.45]">
                    {t(`noItems.${i}`)}
                  </div>
                </li>
              ))}
            </ul>

            {/* Emergency 112 pill */}
            <div
              className="mt-5 flex items-center gap-3 border border-dashed"
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FEF2F2, #FFF7ED)',
                borderColor: '#FCA5A5',
              }}
            >
              <div
                className="grid place-items-center text-white font-bold flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#EF4444',
                  fontSize: 13,
                  letterSpacing: '0.02em',
                }}
              >
                {t('emergencyPhone')}
              </div>
              <div className="text-[13.5px] text-[#7F1D1D] leading-[1.4]">
                <strong className="text-[#991B1B]">{t('emergencyTitle')}</strong>
                {' · '}
                {t('emergencyBody', { phone: t('emergencyPhone') })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
