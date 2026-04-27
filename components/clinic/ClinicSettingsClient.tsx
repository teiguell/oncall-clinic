'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Check } from 'lucide-react'

interface Clinic {
  id: string
  name: string
  legal_name: string
  cif: string
  email: string
  phone: string | null
  address: string | null
  city: string
  province: string | null
  coverage_zones: string[]
  coverage_radius_km: number
  description: string | null
  website: string | null
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  verification_status: string
  commission_rate: number
}

export function ClinicSettingsClient() {
  const t = useTranslations('clinicDashboard.settings')
  const tStripe = useTranslations('clinicDashboard.stripe')
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [stripeLoading, setStripeLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/clinic/profile')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'load_failed')
        setLoading(false)
        return
      }
      const data = (await res.json()) as Clinic
      setClinic({ ...data, coverage_zones: data.coverage_zones ?? [] })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'network_error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    if (!clinic || saving) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/clinic/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clinic.name,
          phone: clinic.phone,
          address: clinic.address,
          city: clinic.city,
          province: clinic.province,
          coverage_zones: clinic.coverage_zones,
          coverage_radius_km: clinic.coverage_radius_km,
          description: clinic.description,
          website: clinic.website,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'save_failed')
        setSaving(false)
        return
      }
      setClinic({ ...data, coverage_zones: data.coverage_zones ?? [] })
      setSavedAt(Date.now())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'network_error')
    } finally {
      setSaving(false)
    }
  }

  const setupStripe = async () => {
    setStripeLoading(true)
    try {
      const res = await fetch('/api/clinic/stripe-onboarding', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (data?.url) {
        window.location.href = data.url
      } else {
        setError(data?.error ?? 'stripe_link_failed')
      }
    } finally {
      setStripeLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }
  if (!clinic) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-700 text-sm">
        {error ?? t('noClinic')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile section */}
      <section className="bg-white border border-slate-200" style={{ borderRadius: 14, padding: 24 }}>
        <h2 className="font-semibold text-[#0B1220] mb-1" style={{ fontSize: 17 }}>
          {t('sections.profile')}
        </h2>
        <p className="text-slate-500 text-[13px] mb-5">{t('profileSubtitle')}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label={t('fields.name')} value={clinic.name} onChange={(v) => setClinic({ ...clinic, name: v })} />
          <Input label={t('fields.cif')} value={clinic.cif} disabled />
          <Input label={t('fields.legalName')} value={clinic.legal_name} disabled />
          <Input label={t('fields.email')} value={clinic.email} disabled />
          <Input label={t('fields.phone')} value={clinic.phone ?? ''} onChange={(v) => setClinic({ ...clinic, phone: v })} />
          <Input label={t('fields.city')} value={clinic.city} onChange={(v) => setClinic({ ...clinic, city: v })} />
          <Input label={t('fields.address')} value={clinic.address ?? ''} onChange={(v) => setClinic({ ...clinic, address: v })} />
          <Input label={t('fields.province')} value={clinic.province ?? ''} onChange={(v) => setClinic({ ...clinic, province: v })} />
          <Input
            label={t('fields.coverageZones')}
            value={clinic.coverage_zones.join(', ')}
            onChange={(v) => setClinic({ ...clinic, coverage_zones: v.split(',').map((s) => s.trim()).filter(Boolean) })}
          />
          <Input
            label={t('fields.coverageRadiusKm')}
            type="number"
            value={String(clinic.coverage_radius_km)}
            onChange={(v) => setClinic({ ...clinic, coverage_radius_km: Number(v) })}
          />
        </div>
        <div className="mt-4">
          <label className="block text-[14px] text-slate-700 mb-1.5">{t('fields.description')}</label>
          <textarea
            value={clinic.description ?? ''}
            onChange={(e) => setClinic({ ...clinic, description: e.target.value })}
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-[13px]">{error}</div>
        )}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center justify-center text-white font-semibold disabled:opacity-50"
            style={{
              padding: '11px 18px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
              fontSize: 14,
              letterSpacing: '-0.2px',
              minHeight: 42,
            }}
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('save')}
          </button>
          {savedAt && (
            <span className="inline-flex items-center gap-1.5 text-green-700 text-[13px]">
              <Check className="h-4 w-4" /> {t('saved')}
            </span>
          )}
        </div>
      </section>

      {/* Stripe section */}
      <section className="bg-white border border-slate-200" style={{ borderRadius: 14, padding: 24 }}>
        <h2 className="font-semibold text-[#0B1220] mb-1" style={{ fontSize: 17 }}>
          {t('sections.stripe')}
        </h2>
        <p className="text-slate-500 text-[13px] mb-5">{t('stripeSubtitle')}</p>
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: clinic.stripe_onboarding_complete ? '#16A34A' : '#94A3B8' }}
            aria-hidden="true"
          />
          <span className="text-[#0B1220] font-medium">
            {clinic.stripe_onboarding_complete ? tStripe('ready') : tStripe('notReady')}
          </span>
        </div>
        {!clinic.stripe_onboarding_complete && (
          <button
            type="button"
            onClick={setupStripe}
            disabled={stripeLoading}
            className="mt-4 inline-flex items-center justify-center text-white font-medium disabled:opacity-50"
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
              fontSize: 13.5,
              letterSpacing: '-0.2px',
              minHeight: 38,
            }}
          >
            {stripeLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {tStripe('setupCta')}
          </button>
        )}
      </section>

      {/* Billing placeholder */}
      <section className="bg-white border border-slate-200" style={{ borderRadius: 14, padding: 24 }}>
        <h2 className="font-semibold text-[#0B1220] mb-1" style={{ fontSize: 17 }}>
          {t('sections.billing')}
        </h2>
        <p className="text-slate-500 text-[13px]">{t('billingComingSoon')}</p>
      </section>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  disabled,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-[14px] text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  )
}
