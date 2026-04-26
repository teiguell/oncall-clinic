'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

/**
 * Step 3 — GDPR Consent Recapture.
 *
 * Gated before OrderSummary whenever the authed user lacks the mandatory
 * consents (health_data + geolocation). The 5 flags are independent
 * (no bundled consent), none pre-marked (Art. 7(2) GDPR: freely given).
 *
 * Optional flags (analytics/marketing/profiling) do NOT block progression.
 *
 * On submit: POST /api/consent/state → upserts `user_consents` row.
 */
export function Step3Consent({ onComplete }: { onComplete: () => void }) {
  const t = useTranslations('consent')
  const locale = useLocale()
  const { toast } = useToast()

  // All checkboxes start FALSE — no dark pattern.
  const [healthData, setHealthData] = useState(false)
  const [geolocation, setGeolocation] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [profiling, setProfiling] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const canContinue = healthData && geolocation

  const handleSubmit = async () => {
    if (!canContinue) {
      toast({
        title: t('mandatoryError'),
        variant: 'destructive',
      })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/consent/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          health_data: healthData,
          geolocation,
          analytics,
          marketing,
          profiling,
        }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: '' }))
        toast({
          title: t('saveError'),
          description: error || undefined,
          variant: 'destructive',
        })
        setSubmitting(false)
        return
      }
      onComplete()
    } catch {
      toast({ title: t('saveError'), variant: 'destructive' })
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="mb-4">
        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-[26px] font-bold tracking-[-0.7px] text-foreground leading-tight">
          {t('title')}
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      {/* Mandatory group */}
      <section className="bg-white rounded-2xl border border-border p-4">
        <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-3">
          {t('mandatoryHeading')}
        </p>
        <div className="space-y-3">
          <ConsentCheckbox
            id="consent-health"
            checked={healthData}
            onChange={setHealthData}
            label={t('healthData')}
            required
          />
          <ConsentCheckbox
            id="consent-geo"
            checked={geolocation}
            onChange={setGeolocation}
            label={t('geolocation')}
            required
          />
        </div>
      </section>

      {/* Optional group */}
      <section className="bg-white rounded-2xl border border-border p-4">
        <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-3">
          {t('optionalHeading')}
        </p>
        <div className="space-y-3">
          <ConsentCheckbox
            id="consent-analytics"
            checked={analytics}
            onChange={setAnalytics}
            label={t('analytics')}
          />
          <ConsentCheckbox
            id="consent-marketing"
            checked={marketing}
            onChange={setMarketing}
            label={t('marketing')}
          />
          <ConsentCheckbox
            id="consent-profiling"
            checked={profiling}
            onChange={setProfiling}
            label={t('profiling')}
          />
        </div>
      </section>

      {/* Legal links */}
      <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
        <Link
          href={`/${locale}/legal/privacy`}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('privacyLink')}
        </Link>
        {' · '}
        <Link
          href={`/${locale}/legal/terms`}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('termsLink')}
        </Link>
        {' · '}
        <Link
          href={`/${locale}/legal/cookies`}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('cookiesLink')}
        </Link>
      </p>

      <Button
        type="button"
        className="w-full h-[54px] text-[15px] font-semibold"
        onClick={handleSubmit}
        disabled={!canContinue || submitting}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
        ) : null}
        {t('continueBtn')}
      </Button>
    </div>
  )
}

function ConsentCheckbox({
  id,
  checked,
  onChange,
  label,
  required,
}: {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  required?: boolean
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 rounded-[6px] border-border accent-primary flex-shrink-0"
        aria-required={required}
      />
      <span className="text-[13px] text-foreground leading-snug">
        {label}
        {required && <span className="text-primary ml-0.5" aria-hidden="true">*</span>}
      </span>
    </label>
  )
}
