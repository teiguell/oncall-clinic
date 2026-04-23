"use client"

import { useTranslations } from 'next-intl'

/**
 * TestModeBanner — "MODO PRUEBA" notice at the top of every page.
 *
 * Two independent gates:
 *   1. NEXT_PUBLIC_TEST_MODE must be 'true' (app is wired for test Stripe + demo flow)
 *   2. NEXT_PUBLIC_SHOW_TEST_BANNER must NOT be 'false' (opt-out escape hatch)
 *
 * Audit P1 #13: Ops needs to hide the banner on demo.oncall.clinic without
 * flipping TEST_MODE (which would break Stripe sandbox). Set
 * NEXT_PUBLIC_SHOW_TEST_BANNER=false to hide the banner while keeping test
 * mode active.
 */
export function TestModeBanner() {
  const t = useTranslations('banner')
  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') return null
  if (process.env.NEXT_PUBLIC_SHOW_TEST_BANNER === 'false') return null
  return (
    <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium sticky top-0 z-[60]">
      <span className="mr-2">⚠️</span>
      {t('testMode')}
    </div>
  )
}
