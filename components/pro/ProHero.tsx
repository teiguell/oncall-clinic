import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'

/**
 * /pro hero — doctor acquisition landing (Round 11 Fix F.1 visual upgrade).
 *
 * - Subtle gradient background `slate-50 → white → amber-50/30` (matches
 *   the warm acquisition palette without competing with the navy nav).
 * - Primary CTA uses gradient amber-to-orange + arrow icon to focus the
 *   eye. Secondary CTA scrolls to `#income` so the user can self-qualify
 *   on income before starting registration.
 * - Trust line below the CTAs surfaces the social proof that closes:
 *   "⭐ 50+ médicos · Pago al instante · Sin permanencia".
 *
 * No iPhone mockup — Director's Claude Design v2 mockups aren't on disk
 * yet. Mockup slot reserved as a TODO when the asset lands.
 */
export function ProHero({ locale }: { locale: string }) {
  const t = useTranslations('pro.hero')
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
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
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[15px] font-semibold shadow-lg shadow-amber-500/30 hover:from-amber-600 hover:to-orange-600 transition-colors min-h-[44px] w-full sm:w-auto"
            >
              {t('ctaPrimary')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#income"
              className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-white text-navy text-[15px] font-semibold border border-slate-200 hover:border-slate-300 transition-colors min-h-[44px] w-full sm:w-auto"
            >
              {t('ctaSecondary')}
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            {t('trustNote')}
          </p>
        </div>
      </div>
    </section>
  )
}
