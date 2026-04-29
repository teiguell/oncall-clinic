'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Check, Loader2 } from 'lucide-react'

/**
 * Round 23-2 (Q5-2) waitlist form — used on /blog stub for now,
 * reusable across other "coming soon" surfaces.
 *
 * Posts `{email, source, locale}` to `/api/waitlist`. The Round 23-2
 * version of the endpoint accepts but doesn't persist (waiting for
 * the table migration in Round 23-4); UX is identical from the user's
 * perspective, so once 23-4 lands the previously-collected emails are
 * lost — which is fine because no real audience hits /blog yet.
 *
 * Email validation is intentionally permissive (regex `.+@.+\..+`):
 * server-side validation is the source of truth, and we don't want to
 * reject valid edge cases (e.g. address+tag@example.co.uk).
 */
export function WaitlistForm({
  source,
  locale,
}: {
  source: string
  locale: string
}) {
  const t = useTranslations('blog.waitlist')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting' || status === 'success') return
    if (!email || !/.+@.+\..+/.test(email)) {
      setStatus('error')
      setErrorMsg(t('invalidEmail'))
      return
    }
    setStatus('submitting')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, source, locale }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `HTTP ${res.status}`)
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : t('unknownError'))
    }
  }

  if (status === 'success') {
    return (
      <div
        className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4"
        role="status"
        aria-live="polite"
      >
        <Check className="h-5 w-5 text-emerald-600 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-emerald-900">{t('success')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
      <Input
        type="email"
        autoComplete="email"
        required
        placeholder={t('placeholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className="h-4 w-4" />}
        error={status === 'error' ? errorMsg ?? undefined : undefined}
        disabled={status === 'submitting'}
        aria-label={t('placeholder')}
      />
      <Button type="submit" disabled={status === 'submitting'} className="sm:w-auto whitespace-nowrap">
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </Button>
    </form>
  )
}
