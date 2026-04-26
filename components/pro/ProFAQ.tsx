import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'

/**
 * /pro FAQ — 7 native <details>/<summary> accordions.
 *
 * Implementation note: native <details> is server-renderable, accessible
 * by default (keyboard, screen reader), no JS required. Multiple can be
 * open at once. This matches the pattern already used in `BookingFaq`.
 *
 * The mega-prompt mentioned a client-component variant with useState; the
 * server-side <details> approach is functionally equivalent for the user
 * (toggle on click) without shipping a JS chunk for the FAQ section.
 */
const QUESTION_COUNT = 7

export function ProFAQ() {
  const t = useTranslations('pro.faq')
  return (
    <section id="faq" className="bg-slate-50">
      <div className="container mx-auto px-4 py-16 md:py-20 max-w-3xl">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] uppercase tracking-[0.18em] font-semibold text-teal-700 mb-3">
            {t('overline')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy tracking-[-0.02em] text-balance">
            {t('title')}
          </h2>
        </div>

        <div className="space-y-3">
          {Array.from({ length: QUESTION_COUNT }, (_, i) => (
            <details
              key={i}
              className="group rounded-xl border border-slate-200 bg-white open:border-teal-200 open:shadow-card transition-shadow"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden">
                <span className="font-semibold text-[15.5px] text-navy pr-4">
                  {t(`questions.${i}.q`)}
                </span>
                <ChevronDown
                  className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-180 flex-shrink-0"
                  aria-hidden="true"
                />
              </summary>
              <div className="px-5 pb-5 -mt-1 text-[14px] text-slate-600 leading-relaxed">
                {t(`questions.${i}.a`)}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
