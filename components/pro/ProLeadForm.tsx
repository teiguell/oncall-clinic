'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import { PLACEHOLDER_PHONE } from '@/lib/format/phone'

/**
 * /pro lead form — Round 22-7 (Q4-19).
 *
 * Lightweight 6-field form for doctors who want to know more before
 * starting full registration. Posts to `/api/leads/pro` which inserts
 * into the `leads` table (type='doctor') and pings tei@.
 *
 * The full registration flow (`/doctor/onboarding`) collects KYC,
 * Stripe Connect setup, RC insurance, COMIB number scan etc. — too
 * heavy for top-of-funnel. This form is the soft entry point.
 *
 * Specialty values are an enum aligned with the API's allow-list.
 * Adding a new specialty here requires updating ALLOWED_SPECIALTIES
 * in app/api/leads/pro/route.ts (otherwise the API rejects it).
 */
export function ProLeadForm() {
  const t = useTranslations('proLeadForm')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting' || status === 'success') return
    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      full_name: String(data.get('full_name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      specialty: String(data.get('specialty') ?? '').trim(),
      comib_number: String(data.get('comib_number') ?? '').trim() || undefined,
      message: String(data.get('message') ?? '').trim() || undefined,
      source_url: typeof window !== 'undefined' ? window.location.pathname : undefined,
    }

    setStatus('submitting')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/leads/pro', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `HTTP ${res.status}`)
      }
      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : t('unknownError'))
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-5"
      >
        <Check className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold text-emerald-900">{t('success.title')}</p>
          <p className="text-sm text-emerald-800 mt-0.5">{t('success.body')}</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input name="full_name" required placeholder={t('fields.fullName')} aria-label={t('fields.fullName')} disabled={status === 'submitting'} />
      <Input name="email" type="email" required autoComplete="email" placeholder={t('fields.email')} aria-label={t('fields.email')} disabled={status === 'submitting'} />
      <Input name="phone" type="tel" required autoComplete="tel" placeholder={`${t('fields.phone')} (${PLACEHOLDER_PHONE})`} aria-label={t('fields.phone')} disabled={status === 'submitting'} />
      <Input name="comib_number" placeholder={t('fields.comib')} aria-label={t('fields.comib')} disabled={status === 'submitting'} />
      <select
        name="specialty"
        required
        disabled={status === 'submitting'}
        defaultValue=""
        aria-label={t('fields.specialty')}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="" disabled>{t('fields.specialtyPlaceholder')}</option>
        <option value="general">{t('fields.specialty_general')}</option>
        <option value="pediatrics">{t('fields.specialty_pediatrics')}</option>
        <option value="gynecology">{t('fields.specialty_gynecology')}</option>
        <option value="other">{t('fields.specialty_other')}</option>
      </select>
      <textarea
        name="message"
        rows={4}
        placeholder={t('fields.message')}
        aria-label={t('fields.message')}
        disabled={status === 'submitting'}
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {status === 'error' && errorMsg && (
        <p role="alert" aria-live="polite" className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {errorMsg}
        </p>
      )}
      <Button type="submit" disabled={status === 'submitting'} className="w-full sm:w-auto">
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </Button>
      <p className="text-xs text-slate-500 leading-relaxed">{t('legal')}</p>
    </form>
  )
}
