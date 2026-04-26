'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'

/**
 * /pro income calculator — Round 11 Fix F.3 interactive slider.
 *
 * Inputs:
 *   - Visits per month: 1 - 50 (slider)
 *
 * Outputs:
 *   - Single big "estimated monthly earnings" figure (year 1, 10% commission)
 *
 * Year-1 model:
 *   €150 base fee × 0.90 = €135 net per visit (10% commission, all-inclusive
 *   per Round 9 R7: covers VAT + Stripe — no other fee).
 *
 * Critical legal copy stays explicit (commissionNote) so the value prop
 * is honest. "All-inclusive" = no extra Stripe fees the doctor pays.
 */

const BASE_FEE_EUR = 150
const COMMISSION_RATE = 0.10
const NET_PER_VISIT_EUR = Math.round(BASE_FEE_EUR * (1 - COMMISSION_RATE)) // €135

const DEFAULT_VISITS = 12 // Ibiza network average mid-season
const MIN_VISITS = 1
const MAX_VISITS = 50

export function IncomeCalculator({ locale }: { locale: string }) {
  const t = useTranslations('pro.income')
  const [visits, setVisits] = useState(DEFAULT_VISITS)

  const monthlyAmount = useMemo(() => visits * NET_PER_VISIT_EUR, [visits])
  const formatted = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'es-ES').format(monthlyAmount),
    [monthlyAmount, locale],
  )

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

        {/* Static breakdown — single visit math */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <table className="w-full text-[15px]">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-5 py-4 text-slate-700">{t('rowConsultation')}</td>
                <td className="px-5 py-4 text-right font-semibold text-navy tabular-nums">€{BASE_FEE_EUR}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-5 py-4 text-slate-700">
                  {t('rowCommission')}
                  <p className="text-[12px] text-slate-500 mt-1">{t('commissionNote')}</p>
                </td>
                <td className="px-5 py-4 text-right font-semibold text-amber-600 tabular-nums">−€{Math.round(BASE_FEE_EUR * COMMISSION_RATE)}</td>
              </tr>
              <tr className="bg-teal-100/50">
                <td className="px-5 py-5 font-semibold text-teal-900">{t('rowNet')}</td>
                <td className="px-5 py-5 text-right">
                  <span className="font-display text-2xl font-bold text-green-600 tabular-nums">€{NET_PER_VISIT_EUR}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[13px] text-slate-500 text-center">{t('yearTwo')}</p>

        {/* Slider + monthly figure */}
        <div className="mt-8 rounded-2xl bg-navy text-white p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-teal-300 text-center">
            {t('monthlyTitle')}
          </p>
          <p
            className="font-display text-4xl md:text-5xl font-bold mt-2 tracking-[-0.02em] tabular-nums text-center"
            aria-live="polite"
          >
            {t('monthlyRange', { amount: formatted })}
          </p>

          <div className="mt-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="pro-income-visits" className="text-[12.5px] text-white/70">
                {t('sliderLabel')}
              </label>
              <span className="text-[14px] font-semibold tabular-nums text-white">
                {visits}
              </span>
            </div>
            <input
              id="pro-income-visits"
              type="range"
              min={MIN_VISITS}
              max={MAX_VISITS}
              value={visits}
              onChange={(e) => setVisits(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
              aria-label={t('sliderLabel')}
            />
            <p className="mt-3 text-[12px] text-white/60 text-center">
              {t('sliderHint')}
            </p>
          </div>

          <p className="mt-5 text-[12.5px] text-white/70 max-w-md mx-auto leading-relaxed text-center">
            {t('monthlyNote')}
          </p>

          <div className="mt-6 text-center">
            <Link
              href={`/${locale}/doctor/register`}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors min-h-[44px]"
            >
              {t('ctaText')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
