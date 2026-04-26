'use client'

import type { FormEvent } from 'react'
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { useTranslations, useLocale } from 'next-intl'
import {
  MapPin, ChevronRight, CheckCircle,
  Thermometer, Activity, Wind, Droplets, Mic, Bandage, Sparkles, MoreHorizontal,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AddressMap } from '@/components/shared/address-map'
import type { ConsultationType } from '@/types'

// Round 7 Fix B (M6) — symptom chip icons. Keys must match the chips array
// id below so the icon resolves by lookup.
const SYMPTOM_ICONS: Record<string, typeof Thermometer> = {
  fever: Thermometer,
  pain: Activity,
  dizzy: Wind,
  nausea: Droplets,
  cough: Mic,
  wound: Bandage,
  allergy: Sparkles,
  other: MoreHorizontal,
}

type DetailsFormData = {
  address: string
  symptoms: string
  notes?: string
  scheduledDate?: string
  scheduledTime?: string
}

/**
 * Step 2 — Details (address, symptoms, optional scheduled datetime).
 * Renders the Ibiza map placeholder, live summary card (doctor chosen),
 * address with geolocation, symptom chips, notes.
 */
export function Step2Details({
  type,
  selectedDoctorId,
  selectedDoctorName,
  selectedDoctorSpecialty,
  priceEuros,
  detecting,
  detectLocation,
  register,
  errors,
  watch,
  setValue,
  onSubmit,
}: {
  type: ConsultationType
  selectedDoctorId: string | null
  selectedDoctorName: string | null
  selectedDoctorSpecialty: string | null
  priceEuros: number | null
  detecting: boolean
  detectLocation: () => void
  register: UseFormRegister<DetailsFormData>
  errors: FieldErrors<DetailsFormData>
  watch: UseFormWatch<DetailsFormData>
  setValue: UseFormSetValue<DetailsFormData>
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}) {
  const t = useTranslations('patient')
  const tBooking = useTranslations('booking2')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  // Keep the chips and their keys typed to match `patient.request.chip*` i18n.
  const chips: Array<{
    id: string
    labelKey: 'chipFever' | 'chipPain' | 'chipDizzy' | 'chipNausea' | 'chipCough' | 'chipWound' | 'chipAllergy' | 'chipOther'
  }> = [
    { id: 'fever',   labelKey: 'chipFever' },
    { id: 'pain',    labelKey: 'chipPain' },
    { id: 'dizzy',   labelKey: 'chipDizzy' },
    { id: 'nausea',  labelKey: 'chipNausea' },
    { id: 'cough',   labelKey: 'chipCough' },
    { id: 'wound',   labelKey: 'chipWound' },
    { id: 'allergy', labelKey: 'chipAllergy' },
    { id: 'other',   labelKey: 'chipOther' },
  ]

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="mb-6">
        <h2 className="text-[26px] font-bold tracking-[-0.7px] text-foreground leading-tight">
          {t('request.whereAndWhat')}
        </h2>
      </div>

      {/* Live summary — doctor chosen in step 1 (prototype §step3 summary) */}
      {selectedDoctorId && (
        <div className="bg-white rounded-[14px] border border-border p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-semibold text-[11px]">
              {selectedDoctorName?.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase() || '—'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-0.5">
              {t('request.doctorLocked')}
            </p>
            <p className="font-semibold text-[13px] truncate leading-tight mt-0.5">
              {selectedDoctorName}
            </p>
            <p className="text-[11.5px] text-muted-foreground truncate">
              {selectedDoctorSpecialty ? selectedDoctorSpecialty.replace('_', ' ') : '—'} · ~12 min
            </p>
          </div>
          {priceEuros !== null && (
            <div className="text-right">
              <p className="text-[15px] font-bold tracking-[-0.2px]">€{priceEuros}</p>
            </div>
          )}
        </div>
      )}

      {/* Round 7 Fix B (M5): real Google Maps with draggable marker.
          AddressMap gracefully degrades to the prior SVG placeholder
          when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY isn't configured. */}
      <AddressMap
        onChange={() => {
          // The pin position is informational here — the canonical
          // address comes from the text input + geocoding. Future iter:
          // reverse-geocode the pin coords into the address field.
        }}
      />

      {/* Address input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('request.address')}</label>
        <div className="relative">
          <Input
            placeholder={locale === 'en' ? "Hotel Ushuaïa, Platja d'en Bossa..." : "Hotel Ushuaïa, Platja d'en Bossa..."}
            icon={<MapPin className="h-4 w-4" />}
            error={errors.address?.message}
            {...register('address')}
          />
          <button
            type="button"
            onClick={detectLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-medium"
          >
            {detecting ? '...' : t('request.myLocation')}
          </button>
        </div>
      </div>

      {/* Scheduled date+time (only if type === 'scheduled') */}
      {type === 'scheduled' && (
        <div className="grid grid-cols-2 gap-3">
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

      {/* Symptoms textarea + chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{t('request.symptoms')} *</label>
          {(() => {
            const symptomsValue = watch('symptoms') || ''
            const valid = symptomsValue.length >= 20
            return (
              <span className={`text-xs ${valid ? 'text-emerald-600' : 'text-muted-foreground'} inline-flex items-center gap-1`}>
                {valid && <CheckCircle className="h-3 w-3" aria-hidden="true" />}
                {symptomsValue.length} / 20+ {tBooking('characters')}
              </span>
            )
          })()}
        </div>
        <textarea
          className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-3 text-base md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          placeholder={t('request.symptomsPlaceholder')}
          {...register('symptoms')}
        />
        {errors.symptoms && <p className="text-xs text-destructive" role="alert">{errors.symptoms.message}</p>}

        {/* Quick-chip symptom toggles */}
        {(() => {
          const current = watch('symptoms') || ''
          const toggleChip = (label: string) => {
            const marker = `· ${label}`
            if (current.includes(marker)) {
              setValue('symptoms', current.replace(marker, '').replace(/ {2,}/g, ' ').trim(), { shouldValidate: true })
            } else {
              const prefix = current.trim().length > 0 ? `${current.trim()} ` : ''
              setValue('symptoms', `${prefix}${marker}`, { shouldValidate: true })
            }
          }
          return (
            <>
              <p className="text-xs text-muted-foreground mt-3 font-medium">{t('request.chipsHint')}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {chips.map(c => {
                  const label = t(`request.${c.labelKey}`)
                  const active = current.includes(`· ${label}`)
                  // Round 7 Fix B (M6): per-symptom Lucide icon on every chip
                  const Icon = SYMPTOM_ICONS[c.id] || MoreHorizontal
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleChip(label)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 px-3 py-[7px] rounded-full text-[12.5px] font-medium border transition-all duration-[160ms] ${
                        active
                          ? 'bg-primary/5 border-primary text-primary'
                          : 'bg-white border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {active ? (
                        <CheckCircle className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {label}
                    </button>
                  )
                })}
              </div>
            </>
          )
        })()}
      </div>

      {/* Notes (optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('request.notes')}</label>
        <textarea
          className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-3 text-sm resize-none"
          placeholder={t('request.notesPlaceholder')}
          {...register('notes')}
        />
      </div>

      {/* Round 7 Fix B (M4): sticky CTA on mobile, inline on md+. Spacer
          below preserves room so the textarea / notes don't get hidden
          behind the floating bar. Mirrors the Step 1 pattern. */}
      <div className="fixed bottom-0 left-0 right-0 md:static p-4 md:p-0 bg-background/95 backdrop-blur-sm border-t md:border-0 z-40 safe-area-bottom">
        <Button type="submit" className="w-full h-[54px] text-[15px] font-semibold" size="lg">
          {tCommon('continue')} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="h-20 md:h-0" aria-hidden="true" />
    </form>
  )
}
