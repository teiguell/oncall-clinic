"use client"

import { useTranslations } from 'next-intl'

/**
 * TestModeBanner — "MODO PRUEBA" notice at the top of every page.
 *
 * Three independent gates (any one returning null hides the banner):
 *
 *   1. Audit P0-1 (2026-04-28): if Stripe is in LIVE mode
 *      (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY starts with `pk_live_`),
 *      hide the banner — real money is moving and the "MODO PRUEBA"
 *      copy is actively misleading. This gate trumps all the others;
 *      Director can flip to live keys without remembering to flip
 *      TEST_MODE / SHOW_TEST_BANNER.
 *
 *   2. NEXT_PUBLIC_TEST_MODE must be 'true' (app is wired for test
 *      Stripe + demo flow). This was the original gate.
 *
 *   3. NEXT_PUBLIC_SHOW_TEST_BANNER must NOT be 'false' (opt-out
 *      escape hatch — hide the banner on demo.oncall.clinic without
 *      flipping TEST_MODE which would break Stripe sandbox).
 */
export function TestModeBanner() {
  const t = useTranslations('banner')
  // P0-1: Stripe live mode → banner hidden, no questions asked.
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (publishable && publishable.startsWith('pk_live_')) return null
  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') return null
  if (process.env.NEXT_PUBLIC_SHOW_TEST_BANNER === 'false') return null
  return (
    <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium sticky top-0 z-[60]">
      <span className="mr-2">⚠️</span>
      {t('testMode')}
    </div>
  )
}
