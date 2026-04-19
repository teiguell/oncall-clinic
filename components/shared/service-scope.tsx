'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, XCircle, PhoneCall } from 'lucide-react'

/**
 * Service scope — two cards "What's included" / "What's NOT included".
 * Healthcare UX best practice: set expectations explicitly and redirect
 * life-threatening emergencies to 112 at the point of decision.
 */
export function ServiceScope() {
  const t = useTranslations('scope')

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10">{t('title')}</h2>

        <div className="grid md:grid-cols-2 gap-5">
          {/* INCLUDES */}
          <div className="rounded-card border-2 border-emerald-200 bg-emerald-50/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold text-emerald-900">{t('includes')}</h3>
            </div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5" aria-hidden="true">✓</span>
                <span>{t('item1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5" aria-hidden="true">✓</span>
                <span>{t('item2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5" aria-hidden="true">✓</span>
                <span>{t('item3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5" aria-hidden="true">✓</span>
                <span>{t('item4')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5" aria-hidden="true">✓</span>
                <span>{t('item5')}</span>
              </li>
            </ul>
          </div>

          {/* EXCLUDES */}
          <div className="rounded-card border-2 border-rose-200 bg-rose-50/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-6 w-6 text-rose-600" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold text-rose-900">{t('excludes')}</h3>
            </div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 mt-0.5" aria-hidden="true">✗</span>
                <span>{t('exclude1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 mt-0.5" aria-hidden="true">✗</span>
                <span>{t('exclude2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 mt-0.5" aria-hidden="true">✗</span>
                <span>{t('exclude3')}</span>
              </li>
            </ul>
            <a
              href="tel:112"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 text-white px-4 py-2 text-sm font-semibold hover:bg-rose-700 transition-colors min-h-[44px]"
            >
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              {t('emergencyNote')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
