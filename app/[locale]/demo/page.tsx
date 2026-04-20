'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { AlertTriangle } from 'lucide-react'

/**
 * Demo login page — only accessible when NEXT_PUBLIC_TEST_MODE=true.
 * Provides one-tap login for patient and doctor demo accounts to allow the
 * founder to run an end-to-end simulation from a phone without typing
 * passwords on each tab.
 */
export default function DemoPage() {
  const router = useRouter()
  const supabase = createClient()
  const locale = useLocale()
  const t = useTranslations('demo')
  const tAuth = useTranslations('auth')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">Demo mode is not active.</p>
      </div>
    )
  }

  const demoAccounts = [
    {
      email: 'demo-patient@oncall.clinic',
      password: 'Demo2026!Patient',
      role: 'patient' as const,
      label: t('patient_label'),
      description: t('patient_description'),
      emoji: '🏖️',
    },
    {
      email: 'demo-doctor@oncall.clinic',
      password: 'Demo2026!Doctor',
      role: 'doctor' as const,
      label: t('doctor_label'),
      description: t('doctor_description'),
      emoji: '👨‍⚕️',
    },
  ]

  const handleLogin = async (email: string, password: string, role: 'patient' | 'doctor') => {
    setLoading(email)
    setError(null)
    try {
      // 1. Try sign-in
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError?.message?.toLowerCase().includes('invalid login')) {
        // 2. Sign up if account doesn't exist
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: role === 'patient' ? 'Demo Patient' : 'Dra. María García (Demo)',
              role,
            },
          },
        })
        if (signUpError) throw signUpError

        // 3. Ensure profile row
        if (signUpData.user) {
          await supabase.from('profiles').upsert({
            id: signUpData.user.id,
            email,
            full_name: role === 'patient' ? 'Demo Patient' : 'Dra. María García (Demo)',
            role,
          }, { onConflict: 'id' })

          // 3b. Auto-confirm email so login works immediately in test mode
          await fetch('/api/demo/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: signUpData.user.id }),
          }).catch(() => { /* non-blocking */ })
        }

        // 4. Re-login (in case signUp didn't auto-sign-in)
        await supabase.auth.signInWithPassword({ email, password })
      } else if (signInError) {
        throw signInError
      }

      // 5. Redirect
      router.push(role === 'doctor' ? `/${locale}/doctor/dashboard` : `/${locale}/patient/request`)
    } catch (err) {
      const raw = err instanceof Error ? err.message : ''
      const key = raw.toLowerCase()
      let msg = tAuth('errors.unknownError')
      if (key.includes('email not confirmed')) msg = tAuth('errors.emailNotConfirmed')
      else if (key.includes('already registered') || key.includes('already been registered')) msg = tAuth('errors.userAlreadyRegistered')
      else if (key.includes('rate limit') || key.includes('too many')) msg = tAuth('errors.tooManyRequests')
      else if (key.includes('invalid login')) msg = tAuth('errors.invalidCredentials')
      setError(msg)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 bg-background">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/90 px-3 py-1 text-sm font-semibold text-white">
          <AlertTriangle className="h-3.5 w-3.5" />
          {t('banner')}
        </div>
        <h1 className="font-display text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {demoAccounts.map(account => (
          <button
            key={account.email}
            onClick={() => handleLogin(account.email, account.password, account.role)}
            disabled={loading !== null}
            className="w-full p-5 rounded-card border-2 border-border text-left card-hover transition-all hover:border-primary disabled:opacity-60 disabled:cursor-wait space-y-1 min-h-[72px]"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{account.emoji}</span>
              <div className="flex-1">
                <div className="font-display text-base font-semibold">{account.label}</div>
                <div className="text-xs text-muted-foreground">{account.description}</div>
              </div>
            </div>
            {loading === account.email && (
              <div className="text-xs text-primary mt-2 pl-9">{t('entering')}…</div>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="w-full max-w-sm rounded-card border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="text-center space-y-3 text-sm text-muted-foreground max-w-sm">
        <p className="font-medium text-foreground">{t('instructions_title')}</p>
        <ol className="text-left space-y-2 list-decimal list-inside">
          <li>{t('instr1')}</li>
          <li>{t('instr2')}</li>
          <li>{t('instr3')}</li>
          <li>{t('instr4')}</li>
        </ol>
        <p className="text-xs border-t pt-3">
          {t('test_card')}: <code className="bg-muted px-1 rounded">4242 4242 4242 4242</code> · Exp: 12/30 · CVC: 123
        </p>
      </div>
    </div>
  )
}
