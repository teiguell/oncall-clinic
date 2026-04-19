'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Cookie } from 'lucide-react'

type CookieConsent = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string
}

export function CookieConsent() {
  const t = useTranslations('cookieBanner')
  const [show, setShow] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const consent = document.cookie
      .split('; ')
      .find(row => row.startsWith('cookie_consent='))
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const saveConsent = (consent: CookieConsent) => {
    const expires = new Date()
    expires.setMonth(expires.getMonth() + 13)
    document.cookie = `cookie_consent=${encodeURIComponent(JSON.stringify(consent))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`
    setShow(false)

    if (!consent.analytics) {
      document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
      document.cookie = '_ga_=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    }
  }

  const acceptAll = () =>
    saveConsent({ necessary: true, analytics: true, marketing: true, timestamp: new Date().toISOString() })

  const rejectNonEssential = () =>
    saveConsent({ necessary: true, analytics: false, marketing: false, timestamp: new Date().toISOString() })

  const acceptSelected = () => {
    const analyticsCheckbox = document.getElementById('cookie-analytics') as HTMLInputElement
    const marketingCheckbox = document.getElementById('cookie-marketing') as HTMLInputElement
    saveConsent({
      necessary: true,
      analytics: analyticsCheckbox?.checked || false,
      marketing: marketingCheckbox?.checked || false,
      timestamp: new Date().toISOString(),
    })
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t shadow-2xl p-4 md:p-6 animate-slide-up" role="dialog" aria-label="Cookie consent">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-start gap-3 mb-4">
          <Cookie className="h-6 w-6 text-sky-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{t('title')}</h3>
            <p className="text-sm text-gray-600 mt-1">{t('description')}</p>
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
