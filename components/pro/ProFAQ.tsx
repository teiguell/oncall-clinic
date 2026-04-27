import { useTranslations } from 'next-intl'

const QUESTION_COUNT = 8
const OPEN_BY_DEFAULT = 3

/**
 * /pro FAQ — Round 13 v3 design.
 *
 * 8 native <details>/<summary> accordions, top 3 open by default. The
 * +/× toggle uses a CSS `rotate(45deg)` on the `+` glyph when the
 * details element is `[open]` — turns the plus into an ×. No client JS
 * needed; native <details> handles state.
 *
 * The +/× icon styling matches the design: round-rect 28×28 button,
 * slate-100 bg → ink-100 + white when open.
 */
export function ProFAQ() {
  const t = useTranslations('proV3.faq')
  return (
    <section
      id="faq"
      className="bg-[#FAFBFC]"
      style={{ padding: 'clamp(56px, 8vw, 100px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[880px] mx-auto">
        <div style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <div className="text-[12px] font-semibold uppercase tracking-[1px] text-[#3B82F6] mb-2.5">
            {t('kicker')}
          </div>
          <h2
            className="font-display text-balance"
            style={{
              fontSize: 'clamp(32px, 4.5vw, 46px)',
              fontWeight: 700,
              letterSpacing: '-1.4px',
              color: '#0B1220',
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            {t('title')}
          </h2>
        </div>

        <div
          className="bg-white border border-[#EEF1F5] overflow-hidden"
          style={{ borderRadius: 20 }}
        >
          {Array.from({ length: QUESTION_COUNT }, (_, i) => (
            <details
              key={i}
              {...(i < OPEN_BY_DEFAULT ? { open: true } : {})}
              className={`group ${i === QUESTION_COUNT - 1 ? '' : 'border-b border-[#EEF1F5]'}`}
            >
              <summary
                className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden bg-transparent border-0 text-left"
                style={{ padding: 'clamp(18px, 2vw, 22px) clamp(20px, 2.5vw, 28px)' }}
              >
                <span
                  className="text-[#0B1220] font-semibold"
                  style={{
                    fontSize: 'clamp(15px, 1.4vw, 16px)',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {t(`items.${i}.q`)}
                </span>
                <span
                  className="grid place-items-center flex-shrink-0 transition-all bg-slate-100 text-slate-700 group-open:bg-[#0B1220] group-open:text-white"
                  aria-hidden="true"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  <span className="block transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <div
                className="text-slate-500"
                style={{
                  padding: '0 clamp(20px, 2.5vw, 28px) clamp(20px, 2.2vw, 24px)',
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  paddingRight: 'calc(clamp(20px, 2.5vw, 28px) + 44px)',
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
