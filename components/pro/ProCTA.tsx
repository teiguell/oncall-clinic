import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShieldCheck, Stethoscope, Lock, Building2, ArrowRight } from 'lucide-react'

/**
 * /pro final CTA — gradient navy section with "Crear cuenta" button +
 * 4 trust badges (RGPD, Médicos colegiados, Stripe, Ibiza Care S.L.).
 */
export function ProCTA({ locale }: { locale: string }) {
  const t = useTranslations('pro.cta')
  return (
    <section className="bg-gradient-to-br from-navy via-navy to-navy-700 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] text-balance">
          {t('title')}
        </h2>
        <p className="mt-3 text-base md:text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/${locale}/doctor/register`}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-teal-600 text-white text-[15px] font-semibold shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-colors min-h-[44px] w-full sm:w-auto"
          >
            {t('button')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-white/10 text-white text-[15px] font-medium border border-white/20 hover:bg-white/20 transition-colors min-h-[44px] w-full sm:w-auto"
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
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10"
            >
              <Icon className="h-4 w-4 text-teal-300" aria-hidden="true" />
              <span className="text-[11px] font-medium text-white/80 text-center leading-tight">
                {t(`trust.${labelKey}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
