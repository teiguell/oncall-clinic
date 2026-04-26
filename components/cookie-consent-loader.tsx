'use client'

import dynamic from 'next/dynamic'

/**
 * Round 5 Fix A — Hydration IIFE OUT del bundle layout (2026-04-25).
 *
 * Background:
 *   `<CookieConsent />` reads document.cookie + window.localStorage to
 *   decide whether to show the banner. Even though those reads are
 *   guarded by a useState/useEffect mounted-gate, importing the file
 *   from `app/[locale]/layout.tsx` dragged the lexical references INTO
 *   the layout JS chunk. The Cowork bundle audit greps that chunk and
 *   counts every literal `localStorage` / `document.cookie` / `window.`
 *   occurrence — Round 3 and Round 4 deploys both failed (4×document.cookie,
 *   2×localStorage, 2×window in `layout-04fcd2e46af2f1dd.js`).
 *
 * Fix:
 *   `next/dynamic` with `ssr: false` produces a separate code-split chunk
 *   loaded only on the client AFTER hydration completes. The layout
 *   bundle now contains zero browser-only API references — the audit
 *   grep returns 0.
 *
 * Trade-off:
 *   The banner appears ~50ms later than before (one extra round-trip for
 *   the chunk). This is invisible to users (the banner already used an
 *   800ms `setTimeout` delay) and a non-issue for SEO (banner is
 *   cosmetic, not part of the document tree at SSR time).
 */
const CookieConsent = dynamic(
  () => import('./cookie-consent').then((m) => ({ default: m.CookieConsent })),
  { ssr: false }
)

export function CookieConsentLoader() {
  return <CookieConsent />
}
