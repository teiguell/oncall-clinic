'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
        <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}

function BookingSuccessContent() {
  const t = useTranslations('patient.bookingSuccess')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [isTestMode, setIsTestMode] = useState(false)

  useEffect(() => {
    const testParam = searchParams.get('test')
    const cid = searchParams.get('consultationId')
    const sessionId = searchParams.get('session_id')

    if (testParam === 'true' && cid) {
      setIsTestMode(true)
      setConsultationId(cid)
      setStatus('success')
      return
    }

    if (sessionId) {
      // Verify real Stripe session
      fetch('/api/stripe/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.consultationId) {
            setConsultationId(data.consultationId)
            setStatus('success')
          } else {
            setStatus('error')
          }
        })
        .catch(() => setStatus('error'))
      return
    }

    setStatus('error')
  }, [searchParams])

  useEffect(() => {
    if (status === 'success' && consultationId) {
      const timer = setTimeout(() => {
        router.push(`/${locale}/patient/tracking/${consultationId}`)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status, consultationId, router, locale])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="fade-in">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">{t('redirecting')}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="fade-in">
            <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-pulse">
              <CheckCircle2 className="h-14 w-14 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {isTestMode ? t('testMode') : t('title')}
            </h1>
            <p className="text-gray-600 mb-6">{t('redirecting')}</p>
            {consultationId && (
              <Link href={`/${locale}/patient/tracking/${consultationId}`}>
                <Button>{t('redirecting')}</Button>
              </Link>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="fade-in">
            <div className="mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <AlertCircle className="h-14 w-14 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('error')}</h1>
            <Link href={`/${locale}/patient/request`}>
              <Button>{t('retry')}</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
