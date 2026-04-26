import { useTranslations } from 'next-intl'
import {
  ScrollText, ShieldCheck, Briefcase, Smartphone, Languages, Backpack,
  type LucideIcon,
} from 'lucide-react'

const ICONS: LucideIcon[] = [ScrollText, ShieldCheck, Briefcase, Smartphone, Languages, Backpack]

/**
 * /pro requirements — 6 items in a 2-col grid (1 col mobile).
 * Reassures candidates that the bar is achievable: if you already do
 * private medicine in Spain you likely meet all six.
 */
export function RequirementsGrid() {
  const t = useTranslations('pro.requirements')
  return (
    <section id="requirements" className="bg-slate-50">
      <div className="container mx-auto px-4 py-16 md:py-20 max-w-4xl">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ICONS.map((Icon, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-5 flex gap-4"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <Icon className="h-5 w-5 text-teal-700" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[15.5px] text-navy">
                  {t(`items.${i}.title`)}
                </h3>
                <p className="mt-1 text-[13.5px] text-slate-600 leading-relaxed">
                  {t(`items.${i}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
