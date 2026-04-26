import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, ShieldCheck } from 'lucide-react'

/**
 * /pro hero — doctor acquisition landing.
 * Server component (no client state). Headlines and copy come from
 * `pro.hero.*` translations.
 */
export function ProHero({ locale }: { locale: string }) {
  const t = useTranslations('pro.hero')
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-teal-50/40 to-white">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
            {t('badge')}
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-navy tracking-[-0.02em] leading-[1.05] mt-5 text-balance">
            {t('title')}
          </h1>
          <p className="mt-5 text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/${locale}/doctor/register`}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-teal-600 text-white text-[15px] font-semibold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-colors min-h-[44px] w-full sm:w-auto"
            >
              {t('ctaPrimary')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#process"
              className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-white text-navy text-[15px] font-semibold border border-slate-200 hover:border-slate-300 transition-colors min-h-[44px] w-full sm:w-auto"
            >
              {t('ctaSecondary')}
            </Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
            {t('trustNote')}
          </p>
        </div>
      </div>
    </section>
  )
}
