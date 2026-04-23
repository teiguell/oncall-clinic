'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'

/**
 * Mobile-only sticky bottom CTA for the landing page (audit P2 #15 —
 * ride-hailing pattern). Hidden on md+ breakpoints so desktop keeps
 * the existing hero flow.
 *
 * Respects iOS safe-area-inset via `.safe-area-bottom` (defined in globals.css).
 *
 * Pairs with `body` padding-bottom utility that consumers should add when
 * this component is rendered on a page, to prevent the last section from
 * being hidden behind the fixed bar. The landing page does that inline.
 */
export function MobileStickyCta() {
  const t = useTranslations('landing.hero')
  const locale = useLocale()

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 md:hidden safe-area-bottom"
      aria-label="Primary action"
    >
      <div className="px-4 py-3">
        <Link
          href={`/${locale}/patient/request`}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-transform min-h-[44px]"
        >
          {t('ctaPrimary')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
