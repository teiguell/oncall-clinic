'use client'

import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { useTranslations, useLocale } from 'next-intl'
import { Zap, Calendar, ShieldCheck, CheckCircle, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AddressMap } from '@/components/shared/address-map'
import { PlacesAutocomplete } from '@/components/booking/PlacesAutocomplete'
import type { ConsultationType } from '@/types'

type StepFormData = {
  address: string
  scheduledDate?: string
  scheduledTime?: string
}

/**
 * Step 1 of 3 — Tipo de visita + dirección (Round 9 pivot, "intermediario puro").
 *
 * Combines what was Step 0 (type only) and the address picker portion of the
 * old Step 2. Symptoms / chips / notes / Art.9 consent NO longer collected
 * — OnCall is now a pure intermediary. The visiting doctor takes anamnesis
 * presentially under their own data-controller role.
 *
 * File name kept as `Step0Type.tsx` to avoid a churn of imports; component
 * name now `Step1TypeAndAddress` reflects the role.
 */
export function Step0Type({
  type,
  setType,
  register,
  errors,
  watch,
  setValue,
  detecting,
  detectLocation,
  onNext,
  onAddressLocation,
}: {
  type: ConsultationType
  setType: (next: ConsultationType) => void
  register: UseFormRegister<StepFormData>
  errors: FieldErrors<StepFormData>
  watch: UseFormWatch<StepFormData>
  setValue: UseFormSetValue<StepFormData>
  detecting: boolean
  detectLocation: () => void
  onNext: () => void
  // Round 16-A: PlacesAutocomplete reports back real lat/lng when the
  // user picks a hotel suggestion or geolocates. Parent stores it in
  // userLocation so checkout can submit accurate coords.
  onAddressLocation?: (lat: number, lng: number) => void
}) {
  const t = useTranslations('patient')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  const addressValue = watch('address') || ''
  const scheduledDate = watch('scheduledDate')
  const scheduledTime = watch('scheduledTime')

  // Round 9: Step 1 advance only allowed when address ≥10 chars and (if
  // scheduled) date+time are both set. We let react-hook-form do the
  // address validation on submit; the disabled flag is for the CTA only.
  const canContinue =
    addressValue.trim().length >= 10 &&
    (type === 'urgent' || (Boolean(scheduledDate) && Boolean(scheduledTime)))

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!canContinue) return
    onNext()
  }

  return (
    <div className="space-y-5 pb-24 md:pb-0">
      <div className="mb-6">
        {/* Availability eyebrow with pulsing green dot */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-3">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot"
            style={{ boxShadow: '0 0 0 4px rgba(16,185,129,0.15)' }}
          />
          <span className="text-[11px] font-semibold tracking-[0.04em] text-emerald-700">
            {t('request.availabilityEyebrow')}
          </span>
        </div>
        <h2 className="text-[26px] font-bold tracking-[-0.7px] text-foreground leading-tight">
          {t('request.whatType')}
        </h2>
        <p className="text-muted-foreground text-sm mt-2">{t('request.whatTypeDesc')}</p>
      </div>

      {/* Urgent option */}
      <button
        type="button"
        onClick={() => setType('urgent')}
        className={`w-full p-4 rounded-2xl border text-left transition-all hover:shadow-md ${
          type === 'urgent' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border bg-card'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="h-[52px] w-[52px] rounded-[14px] bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground text-[15.5px] tracking-tight">
                {t('request.urgent.title')}
              </h3>
              {/* Round 9 Fix D: badge "Disponible ahora" — coherent with
                  subtitle "Llegada en 30-90 minutos". No more "<20 MIN"
                  badge contradicting "1 hora" subtitle. */}
              <span className="text-[10px] font-bold tracking-[0.04em] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">
                {t('request.urgent.badge')}
              </span>
            </div>
            <p className="text-muted-foreground text-[12.5px] leading-snug mt-0.5">
              {t('request.urgent.subtitle')}
            </p>
          </div>
          <div
            className={`h-[22px] w-[22px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
              type === 'urgent' ? 'bg-primary border-primary' : 'border-border'
            }`}
            aria-hidden="true"
          >
            {type === 'urgent' && <CheckCircle className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </div>
        </div>
      </button>

      {/* Scheduled option */}
      <button
        type="button"
        onClick={() => setType('scheduled')}
        className={`w-full p-4 rounded-2xl border text-left transition-all hover:shadow-md ${
          type === 'scheduled' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border bg-card'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="h-[52px] w-[52px] rounded-[14px] bg-gradient-to-br from-blue-50 to-blue-100 text-primary flex items-center justify-center flex-shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-[15.5px] tracking-tight">
              {t('request.scheduled')}
            </h3>
            <p className="text-muted-foreground text-[12.5px] leading-snug mt-0.5">
              {t('request.scheduledDesc')}
            </p>
          </div>
          <div
            className={`h-[22px] w-[22px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
              type === 'scheduled' ? 'bg-primary border-primary' : 'border-border'
            }`}
            aria-hidden="true"
          >
            {type === 'scheduled' && <CheckCircle className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </div>
        </div>
      </button>

      {/* Scheduled date + time pickers — only when scheduled */}
      {type === 'scheduled' && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Input
            label={t('request.date')}
            type="date"
            min={new Date().toISOString().split('T')[0]}
            {...register('scheduledDate')}
          />
          <Input
            label={t('request.time')}
            type="time"
            min="08:00"
            max="22:00"
            {...register('scheduledTime')}
          />
        </div>
      )}

      {/* Address section — Round 16-A: Google Places Autocomplete with
          Ibiza bounds replaces the plain text input. Tourists typing
          "Ushuaïa" / "Hard Rock" / "Pacha" get hotel suggestions with
          real lat/lng coords. Falls back to plain text if Places script
          fails to load (no NEXT_PUBLIC_GOOGLE_PLACES_KEY in env). */}
      <div className="pt-2 space-y-3">
        <h3 className="font-semibold text-[16px] tracking-[-0.2px] text-foreground">
          {t('request.where')}
        </h3>

        {/* react-hook-form binding: hidden mirror so the form state stays
            in sync with the autocomplete value. The autocomplete drives
            the visible UI and reports back to react-hook-form via
            setValue + onAddressLocation. */}
        <input type="hidden" {...register('address')} />

        <PlacesAutocomplete
          locale={locale === 'en' ? 'en' : 'es'}
          defaultValue={addressValue}
          placeholder={locale === 'en' ? "Hotel Ushuaïa, Platja d'en Bossa..." : "Hotel Ushuaïa, Platja d'en Bossa..."}
          onChange={(v) => setValue('address', v, { shouldValidate: true, shouldDirty: true })}
          onSelect={({ address, lat, lng }) => {
            setValue('address', address, { shouldValidate: true, shouldDirty: true })
            onAddressLocation?.(lat, lng)
          }}
          onGeolocate={({ address, lat, lng }) => {
            setValue('address', address, { shouldValidate: true, shouldDirty: true })
            onAddressLocation?.(lat, lng)
          }}
        />

        {errors.address?.message && (
          <p className="text-xs text-red-600 mt-1">{errors.address.message as string}</p>
        )}

        {/* Legacy detectLocation kept as fallback — most users won't see
            it because PlacesAutocomplete has its own "Mi ubicación" button.
            Hidden when Places is the primary input. */}
        <button
          type="button"
          onClick={detectLocation}
          className="hidden"
          aria-hidden="true"
        >
          {detecting ? '...' : t('request.myLocation')}
        </button>

        <AddressMap
          onChange={(lat, lng) => {
            // Round 16-A: when user drags the map pin, propagate coords
            // to the parent so checkout submits accurate coordinates.
            onAddressLocation?.(lat, lng)
          }}
        />
      </div>

      {/* Round 16-E — price preview before user reaches Step 2.
          Tourists know what to expect; reduces "surprise pricing"
          drop-off in Step 2. */}
      <div
        className="mt-4 bg-slate-50 border border-slate-200"
        style={{ padding: '12px 14px', borderRadius: 12 }}
      >
        <div className="text-[11.5px] uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">
          {t('request.pricePreview.title')}
        </div>
        <ul className="text-[13.5px] text-slate-700 space-y-0.5">
          <li>{t('request.pricePreview.base')}</li>
          <li className="text-slate-500">{t('request.pricePreview.night')}</li>
        </ul>
      </div>

      {/* Trust strip */}
      <div className="mt-3 p-3 px-3.5 bg-card rounded-xl border border-border flex items-center gap-2.5">
        <ShieldCheck className="h-[18px] w-[18px] text-emerald-600 flex-shrink-0" aria-hidden="true" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {locale === 'en'
            ? 'Licensed doctors · Reimbursable by your insurer'
            : 'Médicos colegiados · Reembolso a tu aseguradora'}
        </p>
      </div>

      {/* Sticky Continue CTA — same pattern as Step 2 / Step 3 */}
      <div className="fixed bottom-0 left-0 right-0 md:static p-4 md:p-0 bg-background/95 backdrop-blur-sm border-t md:border-0 z-40 safe-area-bottom">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full h-[54px] text-[15px] font-semibold"
          size="lg"
        >
          {tCommon('continue')} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
