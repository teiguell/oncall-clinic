'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  Calendar,
  MapPin,
  Euro,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react'

/**
 * 5-card welcome tour client island — Round 17-A.
 *
 * Each step has:
 *   - Icon
 *   - Title + body (i18n)
 *   - "Continue" CTA (advances to next step OR navigates to settings page)
 *   - "Saltar" link (skip → /dashboard, marks complete)
 *
 * Bottom: 5-dot progress indicator. Final card CTA is the dashboard link
 * + auto-marks welcome_completed_at via /api/doctor/welcome-complete.
 */
const STEPS = [
  { key: 'step1' as const, icon: Calendar,    href: 'availability' },
  { key: 'step2' as const, icon: MapPin,      href: 'coverage' },
  { key: 'step3' as const, icon: Euro,        href: 'pricing' },
  { key: 'step4' as const, icon: CreditCard,  href: null },        // informational
  { key: 'step5' as const, icon: CheckCircle2, href: 'dashboard' },
]

export function DoctorWelcomeTour({ locale }: { locale: string }) {
  const t = useTranslations('doctor.welcome')
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const markComplete = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await fetch('/api/doctor/welcome-complete', { method: 'POST' })
    } catch (e) {
      console.warn('[doctor/welcome] complete flag failed:', e)
    }
    setSubmitting(false)
  }

  const onPrimary = async () => {
    if (isLast) {
      await markComplete()
      router.push(`/${locale}/doctor/dashboard`)
      return
    }
    // Advance to next card. R17-D / R17-A follow-up pages don't exist
    // yet, so we don't auto-navigate to current.href — we stay in the
    // tour and let the doctor click through. They can tap the
    // destination link separately if available.
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const onSkip = async () => {
    await markComplete()
    router.push(`/${locale}/doctor/dashboard`)
  }

  const Icon = current.icon

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 grid place-items-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1
            className="font-bold text-[#0B1220]"
            style={{ fontSize: 'clamp(24px, 4vw, 30px)', letterSpacing: '-0.02em' }}
          >
            {t('title')}
          </h1>
          <p className="text-slate-600 mt-1.5 text-[14.5px]">
            {t('subtitle', { defaultValue: 'Cinco pasos para empezar.' })}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-7 shadow-xl border border-slate-100">
          <div
            className="grid place-items-center mx-auto mb-5"
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              boxShadow: '0 12px 28px -10px rgba(29,78,216,0.5)',
            }}
            aria-hidden="true"
          >
            <Icon className="h-7 w-7 text-white" />
          </div>

          <h2
            className="font-semibold text-[#0B1220] text-center"
            style={{ fontSize: 19, letterSpacing: '-0.01em' }}
          >
            {t(`${current.key}.title`)}
          </h2>
          <p className="text-slate-600 text-center mt-2 text-[14.5px] leading-relaxed">
            {t(`${current.key}.body`)}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6 mb-1" role="status" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="rounded-full transition-colors"
                style={{
                  width: i === step ? 22 : 7,
                  height: 7,
                  background: i === step ? '#1D4ED8' : i < step ? '#93C5FD' : '#E2E8F0',
                }}
              />
            ))}
          </div>

          {/* CTAs */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="inline-flex items-center justify-center text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
                style={{ padding: '11px 14px', borderRadius: 12, minHeight: 44 }}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onPrimary}
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center text-white font-semibold disabled:opacity-50"
              style={{
                padding: '12px 18px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                fontSize: 14.5,
                letterSpacing: '-0.2px',
                minHeight: 44,
              }}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t(`${current.key}.cta`)}
              {!isLast && <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />}
            </button>
          </div>

          {/* Skip — visible on every step except the last */}
          {!isLast && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={onSkip}
                className="text-[13px] text-slate-500 hover:text-slate-700 underline-offset-4 hover:underline"
              >
                {t('skip', { defaultValue: 'Saltar y configurar después' })}
              </button>
            </div>
          )}
        </div>

        {/* Footer link to dashboard for the impatient */}
        <p className="text-center text-[12.5px] text-slate-500 mt-5">
          <Link href={`/${locale}/doctor/dashboard`} className="hover:text-slate-700">
            {t('skipToDashboard', { defaultValue: 'Ir al dashboard' })}
          </Link>
        </p>
      </div>
    </main>
  )
}
