"use client"

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { type ServiceType, type ConsultationType } from '@/types'
import { MapPin, Zap, Calendar, ArrowLeft, ChevronRight, ShieldCheck, Award, Lock, CheckCircle, Stethoscope } from 'lucide-react'
import { BookingFaq } from '@/components/shared/booking-faq'
import { DoctorSelector } from '@/components/doctor-selector'
import { useBookingStore } from '@/stores/booking-store'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

type FormData = {
  address: string
  symptoms: string
  notes?: string
  scheduledDate?: string
  scheduledTime?: string
}

function RequestConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const t = useTranslations('patient')
  const tCommon = useTranslations('common')
  const tTrust = useTranslations('trust')
  const tBooking = useTranslations('booking2')
  const locale = useLocale()

  const schema = z.object({
    address: z.string().min(10, t('request.validAddress')),
    symptoms: z.string().min(20, t('request.validSymptoms')),
    notes: z.string().optional(),
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
  })
  const [step, setStep] = useState(0)
  const [type, setType] = useState<ConsultationType>(
    searchParams.get('type') === 'scheduled' ? 'scheduled' : 'urgent'
  )
  // Service is locked to general_medicine (only active service). Kept as
  // constant to avoid needing a dedicated step — the user reaches the doctor
  // selector immediately after picking consultation type.
  const selectedService: ServiceType = 'general_medicine'
  const [loading, setLoading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Doctor selection state from Zustand store
  const selectedDoctorId = useBookingStore(s => s.selectedDoctorId)
  const selectedDoctorName = useBookingStore(s => s.selectedDoctorName)
  const selectedDoctorPrice = useBookingStore(s => s.selectedDoctorPrice)
  const selectedDoctorSpecialty = useBookingStore(s => s.selectedDoctorSpecialty)

  // Inline auth state — Magic Link primary + Google OAuth fallback.
  // No password step: reduces friction for medical booking.
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Check session on mount + on step change to step 3
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUser(user)
      setAuthChecking(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const STEPS = [
    t('request.typeStep'),
    t('request.chooseDoctor'),
    t('request.detailsStep'),
    t('request.confirmStep'),
  ]

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        setUserLocation({ lat, lng })
        // Reverse geocode
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=${locale}`
          )
          const data = await res.json()
          if (data.results[0]) {
            setValue('address', data.results[0].formatted_address)
          }
        } catch {
          setValue('address', `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        }
        setDetecting(false)
      },
      () => setDetecting(false)
    )
  }, [setValue])

  // Display price comes from the selected doctor (no hardcoded service price).
  // Falls back to null until a doctor is picked; the UI guards against this.
  const priceCents = selectedDoctorPrice ?? null
  const priceEuros = priceCents !== null ? Math.round(priceCents / 100) : null

  // Inline auth handlers — Magic Link + Google OAuth only.
  // Both return the user to /patient/request?step=3 so booking context persists.
  const handleMagicLink = async () => {
    setAuthLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/patient/request?step=3`,
      },
    })
    if (error) {
      toast({
        title: t('request.authError'),
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setMagicLinkSent(true)
      toast({ title: tBooking('magicLinkSent'), variant: 'success' })
    }
    setAuthLoading(false)
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/patient/request?step=3`,
      },
    })
  }

  const onSubmit = async (data: FormData) => {
    if (!authUser) {
      toast({ title: t('request.authTitle'), variant: 'destructive' })
      return
    }
    if (!selectedDoctorId) {
      toast({ title: t('request.noDoctorSelected'), variant: 'destructive' })
      return
    }
    if (!termsAccepted) {
      toast({ title: t('request.termsAgree'), variant: 'destructive' })
      return
    }
    setLoading(true)

    const scheduledAt = data.scheduledDate && data.scheduledTime
      ? new Date(`${data.scheduledDate}T${data.scheduledTime}`).toISOString()
      : null

    // Optimistic UI: stash submission summary so booking-success renders
    // immediately with local data while the server round-trip completes.
    useBookingStore.getState().setLastSubmission({
      serviceType: selectedService,
      type,
      address: data.address,
      symptoms: data.symptoms,
      submittedAt: new Date().toISOString(),
    })

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: selectedService,
          type,
          address: data.address,
          symptoms: data.symptoms,
          notes: data.notes || null,
          scheduledAt,
          lat: userLocation?.lat || 38.9067,
          lng: userLocation?.lng || 1.4206,
          locale,
          preferredDoctorId: selectedDoctorId,
        }),
      })
      const result = await res.json()

      if (result.testMode) {
        toast({
          title: '✅ Pago simulado',
          description: 'Modo prueba — redirigiendo al seguimiento...',
          variant: 'success',
        })
        router.push(result.redirectUrl)
      } else if (result.sessionUrl) {
        window.location.href = result.sessionUrl
      } else {
        toast({ title: tCommon('error'), description: result.error || t('request.errorCreating'), variant: 'destructive' })
      }
    } catch {
      toast({ title: tCommon('error'), description: t('request.errorCreating'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href={`/${locale}/patient/dashboard`}>
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="font-bold text-gray-900">{t('request.title')}</h1>
            <p className="text-xs text-gray-500">{STEPS[step]} · {t('request.stepOf', { current: step + 1, total: STEPS.length })}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full gradient-primary transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-lg">

        {/* Step 0: Type */}
        {step === 0 && (
          <div className="space-y-4">
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
              <h2 className="text-[26px] font-bold tracking-[-0.7px] text-foreground leading-tight">{t('request.whatType')}</h2>
              <p className="text-gray-500 text-sm mt-2">{t('request.whatTypeDesc')}</p>
            </div>

            <button
              onClick={() => { setType('urgent'); nextStep() }}
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
                    <h3 className="font-semibold text-foreground text-[15.5px] tracking-tight">{t('request.urgent')}</h3>
                    <span className="text-[9.5px] font-bold tracking-[0.04em] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                      &lt; 20 MIN
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[12.5px] leading-snug mt-0.5">{t('request.urgentDesc')}</p>
                  {/* "Doctors available now" trust signal — green pulse dot */}
                  <span className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot"
                      style={{ boxShadow: '0 0 0 3px rgba(16,185,129,0.15)' }}
                    />
                    {t('request.availableNow')}
                  </span>
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

            <button
              onClick={() => { setType('scheduled'); nextStep() }}
              className={`w-full p-4 rounded-2xl border text-left transition-all hover:shadow-md ${
                type === 'scheduled' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="h-[52px] w-[52px] rounded-[14px] bg-gradient-to-br from-blue-50 to-blue-100 text-primary flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-[15.5px] tracking-tight">{t('request.scheduled')}</h3>
                  <p className="text-muted-foreground text-[12.5px] leading-snug mt-0.5">{t('request.scheduledDesc')}</p>
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

            {/* Trust strip */}
            <div className="mt-4 p-3 px-3.5 bg-card rounded-xl border border-border flex items-center gap-2.5">
              <ShieldCheck className="h-[18px] w-[18px] text-emerald-600 flex-shrink-0" aria-hidden="true" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === 'en'
                  ? 'Licensed doctors · Reimbursable by your insurer'
                  : 'Médicos colegiados · Reembolso a tu aseguradora'}
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Choose Doctor — prominent, dedicated step */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-[26px] font-bold tracking-[-0.7px] text-foreground leading-tight">{t('request.chooseDoctor')}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {locale === 'en'
                  ? 'Pick the doctor you prefer. You see their price and ETA upfront.'
                  : 'Elige el médico que prefieras. Ves su precio y hora de llegada desde el principio.'}
              </p>
            </div>

            <DoctorSelector
              patientLat={userLocation?.lat || 38.9067}
              patientLng={userLocation?.lng || 1.4206}
            />

            {/* BLOQUE C: Floating CTA — fixed bottom on mobile only when
                 a doctor is selected. On desktop, remains inline so the
                 page doesn't lose its rhythm. Respects iOS safe-area. */}
            {selectedDoctorId ? (
              <div className="fixed bottom-0 left-0 right-0 md:static md:mt-6 p-4 md:p-0 bg-background/95 backdrop-blur-sm border-t md:border-0 z-40 safe-area-bottom">
                <Button
                  type="button"
                  className="w-full h-[54px] text-[15px] font-semibold btn-lift"
                  onClick={nextStep}
                >
                  {tBooking('continueWith')} Dr. {(selectedDoctorName || '').split(' ')[0]}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-sm border-t mt-4">
                <Button
                  type="button"
                  className="w-full"
                  size="xl"
                  onClick={nextStep}
                  disabled
                >
                  {t('request.noDoctorSelected')}
                </Button>
              </div>
            )}
            {/* Spacer for floating button on mobile (prevents content from
                 being hidden behind the fixed CTA) */}
            {selectedDoctorId && <div className="h-20 md:h-0" aria-hidden="true" />}
          </div>
        )}

        {/* Step 2: Symptoms */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep() }} className="space-y-5">
            <div className="mb-6">
              <h2 className="text-[26px] font-bold tracking-[-0.7px] text-foreground leading-tight">{t('request.whereAndWhat')}</h2>
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

            {/* Premium map placeholder — grid + stylized coastlines + glowing pin
                 Prototype: step3.jsx §MapPreview */}
            <div
              className="relative h-[130px] rounded-[14px] overflow-hidden border border-border"
              aria-hidden="true"
              style={{ background: 'linear-gradient(135deg, #E8F0FB, #DDE8F5)' }}
            >
              {/* Grid pattern (mapa estilo satelital) */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
                <defs>
                  <pattern id="mapGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#CBD6E5" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mapGrid)" />
              </svg>
              {/* Stylized coastlines + roads */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 80 Q75 60 150 75 T300 65" stroke="white" strokeWidth="2" opacity="0.6" />
                <path d="M0 100 Q100 85 200 95 T300 90" stroke="white" strokeWidth="1.5" opacity="0.4" />
                <path d="M50 0 Q55 40 70 130" stroke="white" strokeWidth="1" opacity="0.3" />
                <path d="M200 0 Q190 50 210 130" stroke="white" strokeWidth="1" opacity="0.3" />
              </svg>
              {/* Pin with glow + ping */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div
                    className="h-9 w-9 bg-primary rounded-full border-[3px] border-white flex items-center justify-center relative z-10"
                    style={{ boxShadow: '0 6px 16px rgba(59,130,246,0.4)' }}
                  >
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div
                    className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/85 text-[11px] font-medium text-muted-foreground">
                Ibiza, ES
              </div>
            </div>

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

              {/* Quick-chip symptom toggles — append to textarea when clicked */}
              {(() => {
                const chips: Array<{ id: string; labelKey: 'chipFever' | 'chipPain' | 'chipDizzy' | 'chipNausea' | 'chipCough' | 'chipWound' | 'chipAllergy' | 'chipOther' }> = [
                  { id: 'fever',   labelKey: 'chipFever' },
                  { id: 'pain',    labelKey: 'chipPain' },
                  { id: 'dizzy',   labelKey: 'chipDizzy' },
                  { id: 'nausea',  labelKey: 'chipNausea' },
                  { id: 'cough',   labelKey: 'chipCough' },
                  { id: 'wound',   labelKey: 'chipWound' },
                  { id: 'allergy', labelKey: 'chipAllergy' },
                  { id: 'other',   labelKey: 'chipOther' },
                ]
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
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleChip(label)}
                            aria-pressed={active}
                            className={`inline-flex items-center gap-1 px-3 py-[7px] rounded-full text-[12.5px] font-medium border transition-all duration-[160ms] ${
                              active
                                ? 'bg-primary/5 border-primary text-primary'
                                : 'bg-white border-border text-muted-foreground hover:border-primary/40'
                            }`}
                          >
                            {active && <CheckCircle className="h-3 w-3" aria-hidden="true" />}
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )
              })()}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('request.notes')}</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-3 text-sm resize-none"
                placeholder={t('request.notesPlaceholder')}
                {...register('notes')}
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              {tCommon('continue')} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Step 3: Auth inline (if not signed in) + Order summary + Pay */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="mb-6">
              <h2 className="text-[26px] font-bold tracking-[-0.7px] text-foreground leading-tight">{t('request.confirm')}</h2>
              <p className="text-muted-foreground text-sm mt-1">{t('request.confirmDesc')}</p>
            </div>

            {/* ─── AUTH INLINE — Magic Link primary + Google OAuth ─── */}
            {!authChecking && !authUser && (
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                <div className="text-center mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-3">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-[18px] font-bold tracking-[-0.3px]">
                    {tBooking('signInToConfirm')}
                  </h3>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    {tBooking('magicLinkDesc')}
                  </p>
                </div>

                {!magicLinkSent ? (
                  <div className="space-y-3">
                    <Input
                      className="h-12 rounded-xl border-[1.5px] text-[14px] px-3.5 focus:border-primary transition-colors"
                      type="email"
                      placeholder={t('request.authEmail')}
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      autoComplete="email"
                    />
                    <Button
                      type="button"
                      className="w-full h-12 text-[15px] font-semibold"
                      onClick={handleMagicLink}
                      disabled={!authEmail || authLoading}
                    >
                      {authLoading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      {tBooking('sendMagicLink')}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-primary/5 px-2 text-muted-foreground">
                          {tBooking('orContinueWith')}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 text-[14px] font-medium"
                      onClick={handleGoogleLogin}
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      {tBooking('continueWithGoogle')}
                    </Button>

                    <p className="text-[11px] text-center text-muted-foreground mt-2 leading-relaxed">
                      {tBooking('authDisclaimer')}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="h-16 w-16 bg-emerald-50 rounded-full mx-auto flex items-center justify-center mb-3">
                      <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                      </svg>
                    </div>
                    <h4 className="text-[16px] font-semibold mb-1">{tBooking('checkYourEmail')}</h4>
                    <p className="text-[13px] text-muted-foreground">{tBooking('magicLinkSentTo')}</p>
                    <p className="text-[14px] font-medium text-primary mt-1">{authEmail}</p>
                    <button
                      type="button"
                      onClick={() => setMagicLinkSent(false)}
                      className="text-[13px] text-primary hover:underline mt-3"
                    >
                      {tBooking('useDifferentEmail')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─── ORDER SUMMARY + PAY (shown once authenticated) ─── */}
            {!authChecking && authUser && (
              <>
                {/* ITEM 5: Premium order summary (prototype §step4) */}
                <div className="bg-white rounded-2xl border border-border p-4">
                  <p className="text-[11px] font-semibold tracking-[1.4px] uppercase text-muted-foreground mb-3">
                    {tBooking('orderSummary')}
                  </p>
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="h-[46px] w-[46px] rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-xs">
                        {selectedDoctorName?.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase() || '—'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold truncate">{selectedDoctorName}</p>
                      <p className="text-[12px] text-muted-foreground truncate">
                        {type === 'urgent' ? t('request.urgentBadge') : t('request.scheduledBadge')}
                        {selectedDoctorSpecialty && ` · ${selectedDoctorSpecialty.replace('_', ' ')}`}
                      </p>
                    </div>
                  </div>
                  <div className="py-3 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-[13.5px] text-muted-foreground">{tBooking('consultation')}</span>
                      <span className="text-[13.5px] font-medium">
                        {priceEuros !== null ? `€${priceEuros}` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[13.5px] text-muted-foreground">{tBooking('displacement')}</span>
                      <span className="text-[13.5px] font-medium text-emerald-600">
                        {tBooking('included')} ✓
                      </span>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between pt-3">
                    <span className="text-[13.5px] font-semibold">{tBooking('total')}</span>
                    <span className="text-[18px] font-bold tracking-[-0.3px]">
                      {priceEuros !== null ? `€${priceEuros}` : '—'}
                    </span>
                  </div>
                </div>

                {/* ITEM 6: Trust badges premium — 4 columnas con icon box */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[
                    { icon: Lock,         label: 'SSL' },
                    { icon: ShieldCheck,  label: 'Stripe' },
                    { icon: Award,        label: 'RGPD' },
                    { icon: Stethoscope,  label: tTrust('comibShort') },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1 py-2">
                      <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Icon className="h-[13px] w-[13px] text-muted-foreground" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Terms checkbox (mandatory) */}
                <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded-[6px] border-border accent-primary"
                  />
                  <span>
                    {t('request.termsAgree')} ·{' '}
                    <Link href={`/${locale}/legal/terms`} className="text-primary hover:underline" target="_blank">
                      {t('request.termsLink')}
                    </Link>
                    {' · '}
                    <Link href={`/${locale}/legal/privacy`} className="text-primary hover:underline" target="_blank">
                      {t('request.privacyLink')}
                    </Link>
                  </span>
                </label>

                {/* FAQ compact */}
                <BookingFaq />

                {/* ITEM 7: Green pay button 54px — emerald palette prototype */}
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 md:px-0 py-3 md:py-0 bg-background/95 backdrop-blur-sm border-t md:static md:bg-transparent md:border-0 z-10">
                    <Button
                      type="submit"
                      className="w-full h-[54px] text-[15px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25"
                      disabled={!termsAccepted || !selectedDoctorId || loading}
                    >
                      {loading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      {priceEuros !== null
                        ? `${tBooking('confirmAndPay')} · €${priceEuros}`
                        : tBooking('confirmAndPay')}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        {step > 0 && step < 3 && (
          <div className="mt-6">
            <button
              onClick={prevStep}
              className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {tCommon('back')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center px-4"><div className="w-full max-w-md space-y-3" aria-busy="true" aria-label="Loading"><div className="h-8 w-2/3 skeleton-shimmer rounded-md" /><div className="h-32 skeleton-shimmer rounded-card" /></div></div>}>
      <RequestConsultationPage />
    </Suspense>
  )
}
