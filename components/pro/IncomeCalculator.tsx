import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'

/**
 * /pro income calculator — static example showing €150 → €135 net.
 *
 * Critical legal copy: the 10% commission is ALL-INCLUSIVE — covers VAT
 * and Stripe fees. The doctor pays nothing else. This must remain explicit
 * (commissionNote) so the value prop is honest.
 */
export function IncomeCalculator({ locale }: { locale: string }) {
  const t = useTranslations('pro.income')
  return (
    <section id="income" className="bg-slate-50">
      <div className="container mx-auto px-4 py-16 md:py-20 max-w-3xl">
        <div className="text-center mb-10">
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

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <table className="w-full text-[15px]">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-5 py-4 text-slate-700">{t('rowConsultation')}</td>
                <td className="px-5 py-4 text-right font-semibold text-navy tabular-nums">€150</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-5 py-4 text-slate-700">
                  {t('rowCommission')}
                  <p className="text-[12px] text-slate-500 mt-1">{t('commissionNote')}</p>
                </td>
                <td className="px-5 py-4 text-right font-semibold text-amber-600 tabular-nums">−€15</td>
              </tr>
              <tr className="bg-teal-100/50">
                <td className="px-5 py-5 font-semibold text-teal-900">{t('rowNet')}</td>
                <td className="px-5 py-5 text-right">
                  <span className="font-display text-2xl font-bold text-green-600 tabular-nums">€135</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[13px] text-slate-500 text-center">{t('yearTwo')}</p>

        <div className="mt-8 rounded-2xl bg-navy text-white p-6 md:p-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-teal-300">
            {t('monthlyTitle')}
          </p>
          <p className="font-display text-3xl md:text-4xl font-bold mt-2 tracking-[-0.02em]">
            {t('monthlyRange')}
          </p>
          <p className="mt-3 text-sm text-white/70 max-w-md mx-auto leading-relaxed">
            {t('monthlyNote')}
          </p>
          <Link
            href={`/${locale}/doctor/register`}
            className="mt-6 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors min-h-[44px]"
          >
            {t('ctaText')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
