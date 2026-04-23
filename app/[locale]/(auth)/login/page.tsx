"use client"

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stethoscope, ArrowLeft } from 'lucide-react'

// Allowlist for post-auth redirect to prevent open-redirect abuse.
// Matches the paths a legitimate flow would want to resume on.
const SAFE_NEXT_PREFIXES = [
  '/patient/dashboard',
  '/patient/request',
  '/patient/tracking',
  '/patient/history',
  '/patient/profile',
  '/patient/booking-success',
  '/doctor/dashboard',
  '/doctor/consultations',
  '/doctor/profile',
  '/doctor/earnings',
  '/doctor/onboarding',
  '/admin',
]

function sanitizeNext(raw: string | null): string | null {
  if (!raw) return null
  // Strip locale prefix (/es or /en) before checking
  const stripped = raw.replace(/^\/(es|en)/, '')
  if (!stripped.startsWith('/')) return null
  if (stripped.startsWith('//')) return null
  if (!SAFE_NEXT_PREFIXES.some(p => stripped.startsWith(p))) return null
  return raw
}

function LoginInner() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const nextParam = sanitizeNext(searchParams.get('next'))
  const callbackUrl = (() => {
    const base = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/callback`
    return nextParam ? `${base}?next=${encodeURIComponent(nextParam)}` : base
  })()

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
      },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  const signInGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
      },
    })
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="text-5xl">📧</div>
          <h1 className="text-2xl font-semibold text-[#0B1220]">{t('magicLinkSentTitle')}</h1>
          <p className="text-neutral-600">{t('magicLinkSentBody', { email })}</p>
          <button
            onClick={() => setSent(false)}
            className="text-blue-600 underline hover:text-blue-700"
          >
            {t('useAnotherEmail')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-semibold text-[#0B1220]">{t('welcomeBack')}</h1>
          <p className="text-neutral-600 mt-1">{t('signInSubtitle')}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-5">
          {/* Google Sign In */}
          <button
            onClick={signInGoogle}
            className="w-full h-12 rounded-2xl border border-neutral-300 flex items-center justify-center gap-3 hover:bg-neutral-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 44 24c0-1.3-.1-2.6-.4-3.9z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2a12 12 0 0 1-18.1-5.5l-6.5 5A20 20 0 0 0 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l.1-.1 6.2 5.2C37 39 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
            </svg>
            <span className="font-medium">{t('continueWithGoogle')}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-500 uppercase tracking-wider">{t('or')}</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <form onSubmit={sendMagicLink} className="space-y-3">
            <Input
              type="email"
              required
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-label={t('emailPlaceholder')}
            />
            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full h-12 rounded-2xl gradient-primary text-white font-semibold"
            >
              {loading ? t('sending') : t('sendMagicLink')}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>

          <p className="text-xs text-center text-neutral-500">{t('magicLinkExplainer')}</p>
        </div>

        <div className="text-center mt-6">
          <Link
            href={`/${locale}`}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="h-10 w-40 skeleton-shimmer rounded-md" aria-busy="true" aria-label="Loading" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  )
}
