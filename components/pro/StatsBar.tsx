import { useTranslations } from 'next-intl'

/**
 * /pro stats bar — 4-column grid (1 col mobile) under the hero.
 * Pure data display, server component.
 */
const KEYS = ['cities', 'tourists', 'booking', 'payout'] as const

export function StatsBar() {
  const t = useTranslations('pro.stats')
  return (
    <section className="bg-navy text-white">
      <div className="container mx-auto px-4 py-10 md:py-12 max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {KEYS.map((key) => (
            <div key={key} className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] text-white">
                {t(`${key}.value`)}
              </p>
              <p className="mt-1 text-[12.5px] md:text-sm text-white/70 leading-snug">
                {t(`${key}.label`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
