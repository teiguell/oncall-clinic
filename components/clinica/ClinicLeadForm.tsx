'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import { PLACEHOLDER_PHONE } from '@/lib/format/phone'

/**
 * /clinica lead form — Round 22-7 (Q4-19).
 *
 * Lightweight 8-field form for clinics that want a 30-min discovery
 * call before starting the full registration flow at /clinic/register
 * (which collects CIF, RC insurance, coverage zones, etc.).
 *
 * Posts to `/api/leads/clinic` (type='clinic'). The admin email pings
 * tei@ so we can hand-route in the early days.
 *
 * `doctors_count` is a number input clamped server-side to 0–10000;
 * absurd values can't poison the table.
 */
export function ClinicLeadForm() {
  const t = useTranslations('clinicLeadForm')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting' || status === 'success') return
    const form = e.currentTarget
    const data = new FormData(form)
    const docsRaw = String(data.get('doctors_count') ?? '').trim()
    const docsParsed = docsRaw === '' ? undefined : Number(docsRaw)
    const payload = {
      clinic_name: String(data.get('clinic_name') ?? '').trim(),
      contact_name: String(data.get('contact_name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      cif: String(data.get('cif') ?? '').trim() || undefined,
      city: String(data.get('city') ?? '').trim(),
      doctors_count: Number.isFinite(docsParsed) ? docsParsed : undefined,
      message: String(data.get('message') ?? '').trim() || undefined,
      source_url: typeof window !== 'undefined' ? window.location.pathname : undefined,
    }

    setStatus('submitting')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/leads/clinic', {
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
        className="flex items-start gap-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 p-5 text-white"
      >
        <Check className="h-6 w-6 text-emerald-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">{t('success.title')}</p>
          <p className="text-sm text-emerald-100/90 mt-0.5">{t('success.body')}</p>
        </div>
      </div>
    )
  }

  // Inputs invert color scheme to read against the dark navy section.
  // Keep base Input + add `bg-white text-slate-900` overrides via wrapper
  // wrapper class so the existing component's focus ring still applies.
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input name="clinic_name" required placeholder={t('fields.clinicName')} aria-label={t('fields.clinicName')} disabled={status === 'submitting'} className="bg-white text-slate-900" />
        <Input name="contact_name" required placeholder={t('fields.contactName')} aria-label={t('fields.contactName')} disabled={status === 'submitting'} className="bg-white text-slate-900" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input name="email" type="email" required autoComplete="email" placeholder={t('fields.email')} aria-label={t('fields.email')} disabled={status === 'submitting'} className="bg-white text-slate-900" />
        <Input name="phone" type="tel" required autoComplete="tel" placeholder={`${t('fields.phone')} (${PLACEHOLDER_PHONE})`} aria-label={t('fields.phone')} disabled={status === 'submitting'} className="bg-white text-slate-900" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input name="cif" placeholder={t('fields.cif')} aria-label={t('fields.cif')} disabled={status === 'submitting'} className="bg-white text-slate-900" />
        <Input name="city" required placeholder={t('fields.city')} aria-label={t('fields.city')} disabled={status === 'submitting'} className="bg-white text-slate-900" />
        <Input
          name="doctors_count"
          type="number"
          min={0}
          step={1}
          placeholder={t('fields.doctorsCount')}
          aria-label={t('fields.doctorsCount')}
          disabled={status === 'submitting'}
          className="bg-white text-slate-900"
        />
      </div>
      <textarea
        name="message"
        rows={4}
        placeholder={t('fields.message')}
        aria-label={t('fields.message')}
        disabled={status === 'submitting'}
        className="flex w-full rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {status === 'error' && errorMsg && (
        <p role="alert" aria-live="polite" className="flex items-center gap-1.5 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {errorMsg}
        </p>
      )}
      <Button type="submit" disabled={status === 'submitting'} className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100">
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </Button>
      <p className="text-xs text-slate-300 leading-relaxed">{t('legal')}</p>
    </form>
  )
}
