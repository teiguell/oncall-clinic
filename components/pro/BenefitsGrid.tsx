import { useTranslations } from 'next-intl'
import {
  Tag, CalendarDays, Wallet, Globe2, ShieldOff, Sparkles,
  type LucideIcon,
} from 'lucide-react'

const ICONS: LucideIcon[] = [Tag, CalendarDays, Wallet, Globe2, ShieldOff, Sparkles]

/**
 * /pro benefits — 6 cards grid (3 cols desktop / 1 col mobile).
 * Each card pulls title + desc from `pro.benefits.items[i]`.
 */
export function BenefitsGrid() {
  const t = useTranslations('pro.benefits')
  return (
    <section id="benefits" className="bg-white">
      <div className="container mx-auto px-4 py-16 md:py-20 max-w-5xl">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] uppercase tracking-[0.18em] font-semibold text-teal-700 mb-3">
            {t('overline')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy tracking-[-0.02em] text-balance">
            {t('title')}
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ICONS.map((Icon, i) => (
            <article
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-teal-200 hover:shadow-card transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-teal-700" aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold text-lg text-navy mb-1.5 tracking-[-0.01em]">
                {t(`items.${i}.title`)}
              </h3>
              <p className="text-[14px] text-slate-600 leading-relaxed">
                {t(`items.${i}.desc`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
