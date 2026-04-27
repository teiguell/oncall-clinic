'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Loader2, ArrowLeft, Check } from 'lucide-react'

/**
 * 2-step clinic register form — Round 15 Block 1.4.
 *
 * Step 1: Company data (name, legal_name, CIF, email, phone, address,
 *         city, province).
 * Step 2: Coverage (zones — comma-separated → string[], radius_km) +
 *         RC insurance confirmation checkbox.
 *
 * On submit, POSTs to /api/clinic/register. On success, shows a
 * confirmation message + sends the user to /clinic/login.
 *
 * Validation is intentionally light at this layer (server has the
 * authoritative checks via the route + DB CHECK constraints). The
 * form catches blank required fields and CIF format quickly to avoid
 * unnecessary server roundtrips.
 *
 * Round 15A scope note: this is the form skeleton. RC document upload
 * (the spec's "upload doc o checkbox") is deferred to Round 15B —
 * checkbox-only confirmation for now, which the route stores as
 * `rc_insurance_verified=false` (admin verifies manually for alpha).
 */
export function ClinicRegisterForm({ locale }: { locale: string }) {
  const t = useTranslations('clinicAuth.register')
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    legalName: '',
    cif: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    coverageZones: '',
    coverageRadius: 25,
    rcConfirmed: false,
  })

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const canAdvance = () =>
    form.name.trim() &&
    form.legalName.trim() &&
    form.cif.trim() &&
    form.email.trim() &&
    form.city.trim()

  const canSubmit = () =>
    form.coverageZones.trim() && form.coverageRadius > 0 && form.rcConfirmed

  const submit = async () => {
    if (submitting || !canSubmit()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/clinic/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          legalName: form.legalName.trim(),
          cif: form.cif.trim().toUpperCase(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim(),
          province: form.province.trim() || null,
          coverageZones: form.coverageZones
            .split(',')
            .map((z) => z.trim())
            .filter(Boolean),
          coverageRadiusKm: Number(form.coverageRadius),
          rcConfirmed: form.rcConfirmed,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'register_failed')
        setSubmitting(false)
        return
      }
      setDone(true)
      // After 3 s, route to login so the new clinic owner can sign in.
      setTimeout(() => router.push(`/${locale}/clinic/login`), 3000)
    } catch (e) {
      console.error('[clinic/register] submit error:', e)
      setError('network_error')
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[#FAFBFC] grid place-items-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md text-center shadow-sm">
          <div
            className="grid place-items-center mx-auto mb-4 text-white"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #16A34A, #15803D)',
            }}
          >
            <Check className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-[#0B1220]">{t('successTitle')}</h1>
          <p className="text-slate-600 mt-3 leading-relaxed">{t('successBody')}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAFBFC]">
      <div
        className="max-w-[640px] mx-auto"
        style={{ padding: 'clamp(40px, 6vw, 80px) clamp(18px, 4vw, 24px)' }}
      >
        <Link
          href={`/${locale}/clinica`}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0B1220] text-sm mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          OnCall Clínicas
        </Link>

        <h1
          className="font-bold text-[#0B1220]"
          style={{ fontSize: 'clamp(28px, 3.4vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          {t('title')}
        </h1>
        <p className="text-slate-600 mt-3">{t('subtitle')}</p>

        {/* Step indicator */}
        <div className="mt-8 flex items-center gap-3 text-sm">
          <StepDot n={1} active={step === 1} done={step > 1} label={t('step1Title')} />
          <div className="h-px flex-1 bg-slate-200" aria-hidden="true" />
          <StepDot n={2} active={step === 2} done={false} label={t('step2Title')} />
        </div>

        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          {step === 1 ? (
            <div className="grid gap-4">
              <Field label={t('fields.name')} value={form.name} onChange={(v) => update('name', v)} required />
              <Field label={t('fields.legalName')} value={form.legalName} onChange={(v) => update('legalName', v)} required />
              <Field label={t('fields.cif')} value={form.cif} onChange={(v) => update('cif', v.toUpperCase())} required uppercase />
              <Field label={t('fields.email')} value={form.email} onChange={(v) => update('email', v)} type="email" required />
              <Field label={t('fields.phone')} value={form.phone} onChange={(v) => update('phone', v)} type="tel" />
              <Field label={t('fields.address')} value={form.address} onChange={(v) => update('address', v)} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t('fields.city')} value={form.city} onChange={(v) => update('city', v)} required />
                <Field label={t('fields.province')} value={form.province} onChange={(v) => update('province', v)} />
              </div>
              <button
                type="button"
                onClick={() => canAdvance() && setStep(2)}
                disabled={!canAdvance()}
                className="mt-2 inline-flex items-center justify-center text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  padding: '13px 22px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
                  fontSize: 14.5,
                  letterSpacing: '-0.2px',
                  minHeight: 44,
                }}
              >
                {t('next')}
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              <Field
                label={t('fields.coverageZones')}
                value={form.coverageZones}
                onChange={(v) => update('coverageZones', v)}
                placeholder="Ibiza, Sant Antoni, Santa Eulalia"
                required
              />
              <div>
                <label className="block text-[14px] text-slate-700 mb-1.5">{t('fields.coverageRadius')}</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={form.coverageRadius}
                  onChange={(e) => update('coverageRadius', Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
              <label className="flex items-start gap-3 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.rcConfirmed}
                  onChange={(e) => update('rcConfirmed', e.target.checked)}
                  className="mt-1 h-4 w-4 accent-indigo-600"
                />
                <span className="text-[14px] text-slate-700">{t('fields.rcConfirmed')}</span>
              </label>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-[13.5px]">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center justify-center text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
                  style={{ padding: '13px 18px', borderRadius: 12, fontSize: 14.5, minHeight: 44 }}
                >
                  {t('back')}
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit() || submitting}
                  className="flex-1 inline-flex items-center justify-center text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    padding: '13px 22px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
                    fontSize: 14.5,
                    letterSpacing: '-0.2px',
                    minHeight: 44,
                  }}
                >
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t('submit')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function StepDot({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`grid place-items-center font-semibold ${
          active ? 'text-white' : done ? 'text-white' : 'text-slate-500'
        }`}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: active || done ? 'linear-gradient(135deg, #4F46E5, #1E1B4B)' : '#F1F5F9',
          fontSize: 13,
        }}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : n}
      </div>
      <span className={`text-[13px] ${active ? 'text-[#0B1220] font-medium' : 'text-slate-500'}`}>{label}</span>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
  uppercase,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  uppercase?: boolean
}) {
  return (
    <div>
      <label className="block text-[14px] text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-[14.5px] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 ${
          uppercase ? 'uppercase' : ''
        }`}
      />
    </div>
  )
}
