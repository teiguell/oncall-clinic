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

        <ol className="space-y-5">
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <li
              key={i}
              className="relative flex gap-4 md:gap-5 rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-200 hover:shadow-card transition-all"
            >
              {/* Step number badge */}
              <div className="flex-shrink-0">
                <div className="h-11 w-11 rounded-full bg-navy text-white flex items-center justify-center font-display font-bold text-base">
                  {i + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display font-semibold text-base md:text-lg text-navy tracking-[-0.01em]">
                    {t(`steps.${i}.title`)}
                  </h3>
                  <span className="inline-flex items-center text-[10.5px] font-semibold uppercase tracking-wide bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                    {t(`steps.${i}.time`)}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
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
