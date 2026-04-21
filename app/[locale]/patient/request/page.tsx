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
  const tErrors = useTranslations('auth')
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

  // Inline auth state (replaces redirect-to-/login — preserves booking progress)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authPhone, setAuthPhone] = useState('')
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

  // Inline auth handlers — never redirect out of /patient/request
  const handleAuthLogin = async () => {
    setAuthLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    })
    if (error) {
      const msg = error.message.toLowerCase()
      const description = msg.includes('invalid login')
        ? tErrors('login.invalidCredentials')
        : msg.includes('email not confirmed')
          ? tErrors('errors.emailNotConfirmed')
          : t('request.authError')
      toast({ title: t('request.authError'), description, variant: 'destructive' })
    } else if (data.user) {
      setAuthUser(data.user)
      toast({ title: t('request.authLoginSuccess'), variant: 'success' })
    }
    setAuthLoading(false)
  }

  const handleAuthRegister = async () => {
    setAuthLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
      options: { data: { full_name: authName, phone: authPhone } },
    })
    if (error) {
      toast({ title: t('request.authError'), description: error.message, variant: 'destructive' })
    } else if (data.user) {
      // Upsert profile so downstream queries find the patient row
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: authEmail,
        full_name: authName,
        phone: authPhone || null,
        role: 'patient',
      }, { onConflict: 'id' })
      // Auto-confirm in test mode so they can continue without email verification
      if (process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
        await fetch('/api/demo/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id }),
        }).catch(() => {})
      }
      setAuthUser(data.user)
      toast({ title: t('request.authRegisterSuccess'), variant: 'success' })
    }
    setAuthLoading(false)
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
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">{t('request.whatType')}</h2>
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
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('request.chooseDoctor')}</h2>
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

            <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-sm border-t mt-4">
              <Button
                type="button"
                className="w-full"
                size="xl"
                onClick={nextStep}
                disabled={!selectedDoctorId}
              >
                {!selectedDoctorId ? t('request.noDoctorSelected') : tCommon('continue')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Symptoms */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep() }} className="space-y-5">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('request.whereAndWhat')}</h2>
            </div>

            {/* Live summary — doctor chosen in step 1, price locked */}
            {selectedDoctorId && (
              <div className="bg-card rounded-card border border-border p-3.5 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold flex items-center justify-center text-sm">
                  {selectedDoctorName?.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase() || '—'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-muted-foreground">
                    {t('request.doctorLocked')}
                  </p>
                  <p className="font-semibold text-sm truncate leading-tight mt-0.5">
                    {selectedDoctorName}
                  </p>
                  {selectedDoctorSpecialty && (
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedDoctorSpecialty.replace('_', ' ')}
                    </p>
                  )}
                </div>
                {priceEuros !== null && (
                  <div className="text-right">
                    <p className="font-display font-bold text-base">€{priceEuros}</p>
                  </div>
                )}
              </div>
            )}

            {/* Decorative Ibiza map placeholder — same as step 3 prototype */}
            <div
              className="relative h-24 rounded-xl border border-border overflow-hidden"
              aria-hidden="true"
              style={{
                background: 'linear-gradient(135deg, #E8F0FB 0%, #DDE8F5 100%)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-primary border-[3px] border-white shadow-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -inset-2 rounded-full bg-primary/20 animate-pulse" />
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
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                              active
                                ? 'bg-primary/10 text-primary border-primary'
                                : 'bg-card text-muted-foreground border-border hover:border-primary/40'
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
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('request.confirm')}</h2>
              <p className="text-muted-foreground text-sm mt-1">{t('request.confirmDesc')}</p>
            </div>

            {/* ─── AUTH INLINE (no redirect; preserves booking progress) ─── */}
            {!authChecking && !authUser && (
              <div className="rounded-card border border-primary/30 bg-primary/5 p-5">
                <h3 className="font-display font-semibold text-[15.5px] tracking-tight">
                  {t('request.authTitle')}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  {t('request.authSubtitle')}
                </p>

                <div className="space-y-3">
                  {isRegistering && (
                    <>
                      <Input
                        type="text"
                        placeholder={t('request.authName')}
                        value={authName}
                        onChange={e => setAuthName(e.target.value)}
                      />
                      <Input
                        type="tel"
                        placeholder={t('request.authPhone')}
                        value={authPhone}
                        onChange={e => setAuthPhone(e.target.value)}
                      />
                    </>
                  )}
                  <Input
                    type="email"
                    placeholder={t('request.authEmail')}
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder={t('request.authPassword')}
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    onClick={isRegistering ? handleAuthRegister : handleAuthLogin}
                    loading={authLoading}
                    disabled={!authEmail || !authPassword || (isRegistering && !authName)}
                  >
                    {isRegistering ? t('request.authRegister') : t('request.authLogin')}
                  </Button>

                  <div className="text-xs text-center text-muted-foreground">
                    {isRegistering ? (
                      <>
                        {t('request.authHasAccount')}{' '}
                        <button
                          type="button"
                          onClick={() => setIsRegistering(false)}
                          className="text-primary font-medium hover:underline"
                        >
                          {t('request.authLoginLink')}
                        </button>
                      </>
                    ) : (
                      <>
                        {t('request.authNoAccount')}{' '}
                        <button
                          type="button"
                          onClick={() => setIsRegistering(true)}
                          className="text-primary font-medium hover:underline"
                        >
                          {t('request.authRegisterLink')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── ORDER SUMMARY + PAY (shown once authenticated) ─── */}
            {!authChecking && authUser && (
              <>
                <Card className="border border-border/60 shadow-md">
                  <CardContent className="p-5 space-y-4">
                    <p className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-muted-foreground">
                      {t('request.orderSummary')}
                    </p>

                    {/* Doctor */}
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold flex items-center justify-center">
                        {selectedDoctorName?.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase() || '—'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{selectedDoctorName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={type === 'urgent' ? 'destructive' : 'success'}>
                            {type === 'urgent' ? t('request.urgentBadge') : t('request.scheduledBadge')}
                          </Badge>
                          {selectedDoctorSpecialty && (
                            <span className="text-xs text-muted-foreground truncate">
                              {selectedDoctorSpecialty.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address (read-only echo from step 2) */}
                    <div className="text-xs">
                      <p className="text-muted-foreground mb-0.5">{t('request.address')}</p>
                      <p className="text-foreground leading-relaxed">{watch('address') || '—'}</p>
                    </div>

                    {/* Price breakdown — single line, transparent */}
                    <div className="space-y-1.5 pt-3 border-t text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('request.consultationLabel')}</span>
                        <span className="font-medium">
                          {priceEuros !== null ? `€${priceEuros}` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t('request.travelIncluded')}</span>
                        <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {tCommon('yes')}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-display font-semibold">{t('request.totalLabel')}</span>
                      <span className="font-display font-bold text-lg">
                        {priceEuros !== null ? `€${priceEuros}` : '—'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Trust badges — SSL, Stripe, RGPD, Colegiados */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 py-1.5">
                    <Lock className="h-3.5 w-3.5 text-emerald-600" />
                    SSL
                  </div>
                  <div className="flex items-center gap-1.5 py-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Stripe
                  </div>
                  <div className="flex items-center gap-1.5 py-1.5">
                    <Award className="h-3.5 w-3.5 text-emerald-600" />
                    RGPD
                  </div>
                  <div className="flex items-center gap-1.5 py-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
                    {tTrust('comibShort')}
                  </div>
                </div>

                {/* Terms checkbox (mandatory) */}
                <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border"
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

                {/* Sticky CTA on mobile, inline on desktop */}
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 md:px-0 py-3 md:py-0 bg-background/95 backdrop-blur-sm border-t md:static md:bg-transparent md:border-0 z-10">
                    <Button
                      type="submit"
                      className="w-full"
                      size="xl"
                      loading={loading}
                      disabled={!termsAccepted || !selectedDoctorId}
                    >
                      {priceEuros !== null
                        ? `${t('request.payNow')} · €${priceEuros}`
                        : t('request.payNow')}
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
