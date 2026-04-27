import { useTranslations } from 'next-intl'
import { Plus, Minus } from 'lucide-react'
import { SectionHeader } from './SectionHeader'

const QUESTION_COUNT = 8
const OPEN_BY_DEFAULT = 3

/**
 * 8-question FAQ accordion using native <details>/<summary>. First 3
 * are open by default per the v3 design. Server component, no JS.
 *
 * The +/− affordance flips automatically because the +/− SVGs are
 * controlled by the `group-open:` modifier on the parent details.
 */
export function FaqV3() {
  const t = useTranslations('landingV3.faq')
  return (
    <section
      id="faq"
      style={{
        padding: 'clamp(56px, 8vw, 110px) clamp(22px, 6vw, 80px)',
        background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFCF5 100%)',
      }}
    >
      <div className="max-w-[880px] mx-auto">
        <SectionHeader
          eyebrow={t('eyebrow')}
          title={t('title')}
          sub={t('subtitle')}
          align="center"
        />
        <div
          className="mt-7 md:mt-12 bg-white border border-[#EEF2F6] overflow-hidden shadow-[0_1px_0_rgba(11,18,32,.02),0_8px_30px_-16px_rgba(11,18,32,.08)]"
          style={{ borderRadius: 20 }}
        >
          {Array.from({ length: QUESTION_COUNT }, (_, i) => (
            <details
              key={i}
              {...(i < OPEN_BY_DEFAULT ? { open: true } : {})}
              className={`group ${i === 0 ? '' : 'border-t border-[#F1F5F9]'}`}
            >
              <summary
                className="cursor-pointer flex items-center justify-between gap-4 list-none [&::-webkit-details-marker]:hidden"
                style={{ padding: '18px 20px', fontSize: 'clamp(15.5px, 1.4vw, 17px)' }}
              >
                <span
                  className="font-semibold text-[#0B1220]"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {t(`items.${i}.q`)}
                </span>
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 grid place-items-center transition-all"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                  }}
                >
                  <Plus
                    className="h-4 w-4 text-slate-500 group-open:hidden bg-slate-50 rounded-full p-[3px] box-content"
                    aria-hidden="true"
                  />
                  <Minus
                    className="h-4 w-4 text-[#3B82F6] hidden group-open:inline-block bg-blue-50 rounded-full p-[3px] box-content"
                    aria-hidden="true"
                  />
                </span>
              </summary>
              <div
                className="text-slate-600"
                style={{
                  padding: '0 20px 20px',
                  fontSize: 15,
                  lineHeight: 1.6,
                  maxWidth: 720,
                  textWrap: 'pretty' as React.CSSProperties['textWrap'],
                }}
              >
                {t(`items.${i}.a`)}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
