import { useTranslations } from 'next-intl'

/**
 * /pro 5-step registration timeline. Vertical layout on mobile + desktop.
 * Each step has a numbered badge, title, description and time estimate.
 */
const STEP_COUNT = 5

export function RegistrationSteps() {
  const t = useTranslations('pro.process')
  return (
    <section id="process" className="bg-white">
      <div className="container mx-auto px-4 py-16 md:py-20 max-w-3xl">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] uppercase tracking-[0.18em] font-semibold text-teal-700 mb-3">
            {t('overline')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy tracking-[-0.02em] text-balance">
            {t('title')}
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Round 11 Fix F.4 — vertical on mobile, horizontal on md+. */}
        <ol className="flex flex-col md:grid md:grid-cols-5 gap-5 md:gap-4 relative">
          {/* Connector line (desktop only) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-[22px] left-[10%] right-[10%] h-px bg-slate-200 -z-0"
          />
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <li
              key={i}
              className="relative md:flex md:flex-col md:items-center md:text-center flex gap-4 md:gap-0 rounded-2xl border border-slate-200 md:border-0 md:bg-transparent bg-white p-5 md:p-2 hover:md:border-0 hover:border-teal-200 hover:md:shadow-none hover:shadow-card transition-all"
            >
              <div className="flex-shrink-0 md:mb-3 relative z-10">
                <div className="h-11 w-11 rounded-full bg-navy text-white flex items-center justify-center font-display font-bold text-base ring-4 ring-slate-50">
                  {i + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0 md:flex-initial">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:flex-col md:items-center md:gap-1">
                  <h3 className="font-display font-semibold text-base md:text-[15px] text-navy tracking-[-0.01em]">
                    {t(`steps.${i}.title`)}
                  </h3>
                  <span className="inline-flex items-center text-[10.5px] font-semibold uppercase tracking-wide bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                    {t(`steps.${i}.time`)}
                  </span>
                </div>
                <p className="mt-1.5 md:mt-2 text-[14px] md:text-[12.5px] text-slate-600 leading-relaxed md:leading-snug">
                  {t(`steps.${i}.desc`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
