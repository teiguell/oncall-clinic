'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Cookie } from 'lucide-react'

type CookieConsentValue = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string
}

/**
 * Cookie consent banner — hydration-safe via mounted-gate pattern.
 *
 * CRITICAL (audit Round 3, 2026-04-24): the first SSR render AND the
 * first CSR render MUST return IDENTICAL HTML. Any browser-only read
 * (document.cookie, localStorage, navigator) is forbidden in the
 * render path before `mounted` flips true.
 *
 * Contract:
 *   - Initial state: mounted=false → returns null
 *   - After useEffect fires (client-only): mounted=true + check existing consent
 *   - If no existing consent → show banner after 800ms delay
 *
 * Server HTML and first-client HTML both output `null` → no #418 risk.
 */
export function CookieConsent() {
  const t = useTranslations('cookieBanner')
  const locale = useLocale()

  // mounted = hard gate for SSR/CSR symmetry
  const [mounted, setMounted] = useState(false)
  const [show, setShow] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Mark mounted FIRST so any subsequent logic runs client-only
    setMounted(true)

    // Now safe to read browser-only APIs
    let hasCookie = false
    let hasLocalStorage = false
    try {
      hasCookie = document.cookie
        .split('; ')
        .some(row => row.startsWith('cookie_consent='))
    } catch { /* ignore */ }
    try {
      hasLocalStorage = !!window.localStorage.getItem('cookie-consent')
    } catch { /* localStorage disabled */ }

    if (!hasCookie && !hasLocalStorage) {
      const timer = setTimeout(() => setShow(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const saveConsent = (consent: CookieConsentValue) => {
    const expires = new Date()
    expires.setMonth(expires.getMonth() + 13)
    const payload = encodeURIComponent(JSON.stringify(consent))
    try {
      document.cookie = `cookie_consent=${payload}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`
    } catch { /* cookie disabled */ }
    try {
      window.localStorage.setItem('cookie-consent', JSON.stringify(consent))
    } catch { /* localStorage disabled */ }
    setShow(false)

    if (!consent.analytics) {
      try {
        document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
        document.cookie = '_ga_=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
      } catch { /* ignore */ }
    }
  }

  const acceptAll = () =>
    saveConsent({ necessary: true, analytics: true, marketing: true, timestamp: new Date().toISOString() })

  const rejectNonEssential = () =>
    saveConsent({ necessary: true, analytics: false, marketing: false, timestamp: new Date().toISOString() })

  const acceptSelected = () => {
    const analyticsCheckbox = document.getElementById('cookie-analytics') as HTMLInputElement | null
    const marketingCheckbox = document.getElementById('cookie-marketing') as HTMLInputElement | null
    saveConsent({
      necessary: true,
      analytics: analyticsCheckbox?.checked || false,
      marketing: marketingCheckbox?.checked || false,
      timestamp: new Date().toISOString(),
    })
  }

  // Hard gate: SSR and first-CSR render MUST be identical. Both return null here.
  if (!mounted) return null
  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t shadow-2xl p-4 md:p-6 animate-slide-up" role="dialog" aria-label="Cookie consent">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-start gap-3 mb-4">
          <Cookie className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground text-lg">{t('title')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('description')}{' '}
              <Link href={`/${locale}/legal/cookies`} className="text-primary hover:underline font-medium">
                {t('readPolicy')}
              </Link>
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="mb-4 space-y-3 border rounded-lg p-4 bg-gray-50">
            <label className="flex items-start gap-3">
              <input type="checkbox" checked disabled className="rounded mt-1" />
              <div>
                <span className="font-medium text-sm">{t('necessary.title')}</span>
                <p className="text-xs text-gray-500">{t('necessary.desc')}</p>
              </div>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" id="cookie-analytics" className="rounded mt-1" />
              <div>
                <span className="font-medium text-sm">{t('analytics.title')}</span>
                <p className="text-xs text-gray-500">{t('analytics.desc')}</p>
              </div>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" id="cookie-marketing" className="rounded mt-1" />
              <div>
                <span className="font-medium text-sm">{t('marketing.title')}</span>
                <p className="text-xs text-gray-500">{t('marketing.desc')}</p>
              </div>
            </label>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-sky-600 hover:underline text-left min-h-[44px]"
          >
            {showDetails ? t('hideDetails') : t('showDetails')}
          </button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={rejectNonEssential}>
              {t('rejectAll')}
            </Button>
            {showDetails && (
              <Button variant="outline" size="sm" onClick={acceptSelected}>
                {t('acceptSelected')}
              </Button>
            )}
            <Button size="sm" onClick={acceptAll} className="bg-sky-500 hover:bg-sky-600">
              {t('acceptAll')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
