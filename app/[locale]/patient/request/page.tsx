"use client"

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { type ServiceType, type ConsultationType } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useBookingStore } from '@/stores/booking-store'

// Sub-components (BLOQUE B split)
import { BookingStepper } from '@/components/booking/BookingStepper'
import { Step0Type } from '@/components/booking/Step0Type'
import { Step1Doctor } from '@/components/booking/Step1Doctor'
import { Step2Details } from '@/components/booking/Step2Details'
import { Step3Confirm } from '@/components/booking/Step3Confirm'

type FormData = {
  address: string
  symptoms: string
  notes?: string
  scheduledDate?: string
  scheduledTime?: string
}

/**
 * /patient/request — 4-step booking flow orchestrator.
 *
 * Structure:
 *   Step 0 (Type)       → Step0Type.tsx
 *   Step 1 (Doctor)     → Step1Doctor.tsx
 *   Step 2 (Details)    → Step2Details.tsx
 *   Step 3 (Confirm)    → Step3Confirm.tsx (inline auth OR payment summary)
 *
 * This file owns all state + handlers; each sub-component is a dumb view
 * receiving props. No data fetch happens here — the doctor selector and
 * form state live in their own components / Zustand store.
 */
function RequestConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const t = useTranslations('patient')
  const tCommon = useTranslations('common')
  const tBooking = useTranslations('booking2')
  const locale = useLocale()

  const schema = z.object({
    address: z.string().min(10, t('request.validAddress')),
    symptoms: z.string().min(20, t('request.validSymptoms')),
    notes: z.string().optional(),
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
  })

  // Step: jump to 3 if Magic Link redirect set ?step=3
  const initialStep = searchParams.get('step') === '3' ? 3 : 0
  const [step, setStep] = useState(initialStep)

  const [type, setType] = useState<ConsultationType>(
    searchParams.get('type') === 'scheduled' ? 'scheduled' : 'urgent'
  )
  // Service is locked to general_medicine (only active service).
  const selectedService: ServiceType = 'general_medicine'
  const [loading, setLoading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Doctor selection — Zustand (persisted non-medical fields only)
  const selectedDoctorId = useBookingStore(s => s.selectedDoctorId)
  const selectedDoctorName = useBookingStore(s => s.selectedDoctorName)
  const selectedDoctorPrice = useBookingStore(s => s.selectedDoctorPrice)
  const selectedDoctorSpecialty = useBookingStore(s => s.selectedDoctorSpecialty)

  // Inline auth state — Magic Link + Google OAuth
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    /**
     * Round 5 Fix B (2026-04-25) — Magic Link gate al entrar Step 1.
     *
     * Background: anonymous users used to be allowed to walk all the way
     * to Step 4 and only meet auth at the inline Step3Confirm widget. If
     * they skipped that and hit /api/stripe/checkout directly, the API
     * returned 401 → consultation INSERT failed with FK violation
     * `consultations_patient_id_fkey` (no row in auth.users for null id).
     *
     * Strategy: redirect anonymous visitors at mount to /login with a
     * `next` query param so the post-Magic-Link callback brings them
     * back to /patient/request. Any deep-step query (`?type=scheduled`,
     * `?step=3`) is preserved so the flow resumes where the user left.
     *
     * Render gating: while `authChecking` is true we render a skeleton
     * — this prevents Step0 / Step1 from briefly flashing on unauthed
     * users before the redirect resolves.
     */
    const supabase = createClient()
    let cancelled = false
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return
      if (!user) {
        const here =
          typeof window !== 'undefined'
            ? window.location.pathname + window.location.search
            : `/${locale}/patient/request`
        router.replace(`/${locale}/login?next=${encodeURIComponent(here)}`)
        return
      }
      setAuthUser(user)
      setAuthChecking(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
    })
    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [locale, router])

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
  }, [setValue, locale])

  const priceCents = selectedDoctorPrice ?? null
  const priceEuros = priceCents !== null ? Math.round(priceCents / 100) : null

  // Magic Link auth
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
        // Round 5 Fix C — surface the real backend error.message instead
        // of the generic "Algo fue mal" title. Some codes have specific
        // recovery actions (e.g. consent_required → redirect to consent).
        if (result.code === 'consent_required') {
          toast({
            title: t('request.consentRequiredTitle'),
            description: t('request.consentRequiredDesc'),
            variant: 'destructive',
          })
          router.push(`/${locale}/patient/privacy?next=${encodeURIComponent(`/${locale}/patient/request?step=3`)}`)
        } else if (result.code === 'unauthorized') {
          // Defensive: gate at mount should already prevent this, but if
          // the session expired between mount and submit, push them to login.
          router.replace(`/${locale}/login?next=${encodeURIComponent(`/${locale}/patient/request?step=3`)}`)
        } else {
          toast({
            title: result.error || t('request.errorCreating'),
            description: result.code ? `[${result.code}]` : undefined,
            variant: 'destructive',
          })
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('request.errorCreating')
      toast({
        title: msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  // Round 5 Fix B — skeleton while auth check resolves. If the user is
  // anonymous, the useEffect above has already kicked off a router.replace;
  // we just hold the UI quiet until that lands.
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-3" aria-busy="true" aria-label="Loading">
          <div className="h-8 w-2/3 skeleton-shimmer rounded-md" />
          <div className="h-32 skeleton-shimmer rounded-card" />
          <div className="h-12 skeleton-shimmer rounded-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back + stepper */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href={`/${locale}/patient/dashboard`}>
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors" aria-label={tCommon('back')}>
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 truncate">{t('request.title')}</h1>
            <p className="text-xs text-gray-500 truncate">
              {STEPS[step]} · {t('request.stepOf', { current: step + 1, total: STEPS.length })}
            </p>
          </div>
        </div>
        {/* Progress — BookingStepper visual 1/4 → 4/4 */}
        <div className="container mx-auto px-4 pb-3">
          <BookingStepper currentStep={step} totalSteps={STEPS.length} labels={STEPS} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        {step === 0 && (
          <Step0Type
            type={type}
            onSelect={(next) => { setType(next); nextStep() }}
          />
        )}

        {step === 1 && (
          <Step1Doctor
            selectedDoctorId={selectedDoctorId}
            selectedDoctorName={selectedDoctorName}
            userLocation={userLocation}
            onNext={nextStep}
          />
        )}

        {step === 2 && (
          <Step2Details
            type={type}
            selectedDoctorId={selectedDoctorId}
            selectedDoctorName={selectedDoctorName}
            selectedDoctorSpecialty={selectedDoctorSpecialty}
            priceEuros={priceEuros}
            detecting={detecting}
            detectLocation={detectLocation}
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            onSubmit={(e) => { e.preventDefault(); nextStep() }}
          />
        )}

        {step === 3 && (
          <Step3Confirm
            authChecking={authChecking}
            authUser={authUser}
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            authLoading={authLoading}
            magicLinkSent={magicLinkSent}
            setMagicLinkSent={setMagicLinkSent}
            handleMagicLink={handleMagicLink}
            handleGoogleLogin={handleGoogleLogin}
            type={type}
            selectedDoctorId={selectedDoctorId}
            selectedDoctorName={selectedDoctorName}
            selectedDoctorSpecialty={selectedDoctorSpecialty}
            priceEuros={priceEuros}
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
            loading={loading}
            onSubmit={handleSubmit(onSubmit)}
          />
        )}

        {/* Back navigation (hide on step 0 + step 3 since Step3 has its own sticky CTA) */}
        {step > 0 && step < 3 && (
          <div className="mt-6">
            <button
              onClick={prevStep}
              className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-700 min-h-[44px]"
              aria-label={tCommon('back')}
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-3" aria-busy="true" aria-label="Loading">
            <div className="h-8 w-2/3 skeleton-shimmer rounded-md" />
            <div className="h-32 skeleton-shimmer rounded-card" />
          </div>
        </div>
      }
    >
      <RequestConsultationPage />
    </Suspense>
  )
}
