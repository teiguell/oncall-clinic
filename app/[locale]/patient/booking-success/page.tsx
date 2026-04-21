'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Phone } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useBookingStore } from '@/stores/booking-store'

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4" aria-busy="true">
          <div className="h-24 w-24 mx-auto rounded-full skeleton-shimmer" />
          <div className="h-6 w-3/4 mx-auto skeleton-shimmer rounded-md" />
          <div className="h-4 w-1/2 mx-auto skeleton-shimmer rounded-md" />
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}

function BookingSuccessContent() {
  const t = useTranslations('patient.bookingSuccess')
  const tBooking = useTranslations('booking2')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [isTestMode, setIsTestMode] = useState(false)
  const [waitingTooLong, setWaitingTooLong] = useState(false)
  const lastSubmission = useBookingStore(s => s.lastSubmission)

  // After 5 minutes of waiting, surface a reassuring message + phone fallback
  useEffect(() => {
    const timer = setTimeout(() => setWaitingTooLong(true), 5 * 60 * 1000)
    return () => clearTimeout(timer)
  }, [])

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
          <div className="fade-in space-y-4" aria-busy="true" aria-label="Verificando">
            {/* Optimistic: show submission summary from store while verifying */}
            {lastSubmission ? (
              <>
                <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-2 animate-pulse">
                  <CheckCircle2 className="h-14 w-14 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <div className="rounded-card bg-white border border-border/60 p-4 text-left space-y-1 shadow-card">
                  <p className="text-xs text-muted-foreground">{lastSubmission.address}</p>
                  <p className="text-sm line-clamp-2 text-foreground">{lastSubmission.symptoms}</p>
                </div>
                <p className="text-muted-foreground text-sm">{t('redirecting')}</p>
              </>
            ) : (
              <>
                <div className="h-24 w-24 mx-auto rounded-full skeleton-shimmer" />
                <div className="h-6 w-3/4 mx-auto skeleton-shimmer rounded-md" />
                <div className="h-4 w-1/2 mx-auto skeleton-shimmer rounded-md" />
                <p className="text-muted-foreground text-sm">{t('redirecting')}</p>
              </>
            )}
          </div>
        )}

        {status === 'success' && (
          <div className="fade-in">
            {/* Confetti (16 colored pieces fall & rotate 3.5s infinite) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-50" aria-hidden="true">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="confetti-piece absolute w-2 h-2 rounded-sm"
                  style={{
                    left: `${5 + i * 6}%`,
                    animationDelay: `${i * 0.15}s`,
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][i % 5],
                  }}
                />
              ))}
            </div>
            {/* Check circle with ripple rings */}
            <div className="relative mx-auto w-[120px] h-[120px] flex items-center justify-center mb-6">
              <span className="ripple-ring absolute inset-0 rounded-full border-2 border-emerald-300" aria-hidden="true" />
              <span
                className="ripple-ring absolute inset-0 rounded-full border-2 border-emerald-200"
                style={{ animationDelay: '0.5s' }}
                aria-hidden="true"
              />
              <div className="success-check w-[84px] h-[84px] rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              {isTestMode ? t('testMode') : t('title')}
            </h1>
            <p className="text-gray-600 mb-6">{t('redirecting')}</p>

            {/* ITEM 15: Premium ETA card with progress dots (prototype §success) */}
            <div className="bg-white rounded-2xl border border-border p-4 mt-2 mb-6 w-full max-w-sm mx-auto text-left">
              {/* Progress dots: 2/5 filled while doctor search proceeds */}
              <div className="flex gap-1.5 mb-3" aria-hidden="true">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i <= 2 ? 'bg-emerald-500' : 'bg-border'}`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#047857] px-2.5 py-1.5 rounded-full">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />
                  <span className="text-[11px] font-semibold">{tBooking('confirmed')}</span>
                </div>
              </div>
              <p className="text-[22px] font-bold tracking-[-0.4px] text-foreground">~12 min</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">{tBooking('doctorOnWay')}</p>
            </div>

            {consultationId && (
              <Link href={`/${locale}/patient/tracking/${consultationId}`}>
                <Button>{t('redirecting')}</Button>
              </Link>
            )}

            {/* Timeout fallback: after 5 minutes without a doctor accepting */}
            {waitingTooLong && (
              <div className="mt-6 p-4 rounded-card bg-amber-50 border border-amber-200 text-center space-y-2">
                <p className="text-sm text-amber-900 font-medium">{t('stillSearching')}</p>
                <p className="text-sm text-amber-800">{t('preferCall')}</p>
                <a
                  href="tel:+34871183415"
                  className="inline-flex items-center gap-2 text-primary font-semibold btn-hover mt-1"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  +34 871 18 34 15
                </a>
              </div>
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
