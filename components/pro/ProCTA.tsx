import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShieldCheck, Stethoscope, Lock, Building2, ArrowRight } from 'lucide-react'

/**
 * /pro final CTA — Round 11 Fix F.8.
 *
 * - Section CTA gradient changed from navy → amber-to-orange to match
 *   the hero primary CTA (single dominant action color across the page).
 * - Sticky bottom bar on mobile keeps the registration CTA permanently
 *   reachable while the user reads the lower sections (FAQ, etc.).
 *   Hidden on md+ where the page is short enough that the section CTA
 *   sits within reach.
 * - 4 trust badges retained on the desktop section card.
 */
export function ProCTA({ locale }: { locale: string }) {
  const t = useTranslations('pro.cta')
  return (
    <>
      <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] text-balance">
            {t('title')}
          </h2>
          <p className="mt-3 text-base md:text-lg text-white/85 max-w-xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/${locale}/doctor/register`}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-white text-amber-700 text-[15px] font-semibold shadow-lg hover:bg-slate-50 transition-colors min-h-[44px] w-full sm:w-auto"
            >
              {t('button')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-white/10 text-white text-[15px] font-medium border border-white/30 hover:bg-white/20 transition-colors min-h-[44px] w-full sm:w-auto"
            >
              {t('secondaryButton')}
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[
              { icon: Lock,         labelKey: 'rgpd' },
              { icon: Stethoscope,  labelKey: 'comib' },
              { icon: ShieldCheck,  labelKey: 'stripe' },
              { icon: Building2,    labelKey: 'company' },
            ].map(({ icon: Icon, labelKey }) => (
              <div
                key={labelKey}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/15 border border-white/20"
              >
                <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                <span className="text-[11px] font-medium text-white/95 text-center leading-tight">
                  {t(`trust.${labelKey}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky mobile-only registration CTA. Hidden on md+. */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(15,23,42,0.05)] px-4 py-3 safe-area-bottom">
        <Link
          href={`/${locale}/doctor/register`}
          className="inline-flex items-center justify-center gap-2 h-12 w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[15px] font-semibold shadow-lg shadow-amber-500/30 min-h-[44px]"
        >
          {t('button')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </>
  )
}
