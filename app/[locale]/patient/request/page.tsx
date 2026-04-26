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
import { AUTH_BYPASS, BYPASS_USER } from '@/lib/auth-bypass'

// Sub-components — Round 9 pivot: 3 steps (was 4). Step2Details deleted.
import { BookingStepper } from '@/components/booking/BookingStepper'
import { Step0Type } from '@/components/booking/Step0Type'
import { Step1Doctor } from '@/components/booking/Step1Doctor'
import { Step3Confirm } from '@/components/booking/Step3Confirm'

type FormData = {
  address: string
  // Round 9 Fix B: symptoms + notes ya no se recogen.
  // Phone añadido en Step 3 para que el médico pueda contactar logística.
  phone?: string
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

  // Round 9 Fix B: schema simplified — no symptoms/notes. Address required;
  // phone optional (some bookings will have it on the auth user metadata).
  const schema = z.object({
    address: z.string().min(10, t('request.validAddress')),
    phone: z.string().optional(),
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
  })

  // Round 9 Fix A: 3 steps. Magic Link redirect now uses ?step=2 (was 3).
  // Backwards compat: also accept old ?step=3 deep links until Q3 2026.
  const stepParam = searchParams.get('step')
  const initialStep =
    stepParam === '2' || stepParam === '3' ? 2 : 0
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
     * Round 7 P0-A (2026-04-26) — REVERTED Round 5 Fix B mount-time redirect.
     *
     * Why: the redirect at mount broke the funnel. Anonymous visitors are
     * supposed to walk Step 0 → Step 1 → Step 2 and only meet auth at the
     * inline Step3Confirm widget (Magic Link / Google OAuth) right before
     * the Stripe redirect. Forcing a redirect at mount lost users.
     *
     * Defence-in-depth still in place:
     *   - /api/stripe/checkout returns 401 `unauthorized` if anon (Round 5
     *     Fix C). The submit handler maps that code to a router.replace →
     *     /login?next=... so a session that expires mid-flow still recovers.
     *   - The Step3Confirm widget hard-blocks Stripe redirect until auth +
     *     consent are captured.
     *
     * This effect now only resolves the current user (no redirect) so
     * Step3Confirm knows whether to show the inline auth widget or jump
     * straight to the order summary.
     */
    // Round 9 Fix H — short-circuit auth resolution when bypass is on so
    // Cowork audit gets straight to the order summary without a real
    // session. Bypass is gated by NEXT_PUBLIC_AUTH_BYPASS=true.
    if (AUTH_BYPASS) {
      setAuthUser(BYPASS_USER as unknown as User)
      setAuthChecking(false)
      return
    }
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

  // Round 9 Fix A: 3 step labels. typeStep now covers Type + Address.
  // detailsStep label removed — old Step 2 (symptoms/chips/notes) eliminated.
  const STEPS = [
    t('request.typeStep'),
    t('request.chooseDoctor'),
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
        emailRedirectTo: `${window.location.origin}/${locale}/patient/request?step=2`,
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
        redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/patient/request?step=2`,
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

    // Round 9 Fix B — symptoms ya no se recogen. lastSubmission queda
    // sin el campo (el shape del store se actualiza en commit B siguiente).
    useBookingStore.getState().setLastSubmission({
      serviceType: selectedService,
      type,
      address: data.address,
      symptoms: '',
      submittedAt: new Date().toISOString(),
    })

    try {
      // Round 9 Fix G — defensive POST + explicit toast on every failure
      // path so the user never gets a silent button. Logs to console for
      // Director debugging when something doesn't redirect.
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: selectedService,
          type,
          address: data.address,
          // Round 9 Fix B — symptoms/notes ya no se recogen ni envían.
          // El payload se mantiene minimal: tipo + dirección + médico + geo.
          phone: data.phone || null,
          scheduledAt,
          lat: userLocation?.lat || 38.9067,
          lng: userLocation?.lng || 1.4206,
          locale,
          preferredDoctorId: selectedDoctorId,
        }),
      })

      // Parse JSON defensively — some 5xx may return HTML.
      let result: {
        testMode?: boolean
        redirectUrl?: string
        sessionUrl?: string
        url?: string
        error?: string
        code?: string
      } = {}
      try {
        result = await res.json()
      } catch {
        result = { error: `HTTP ${res.status}: respuesta no JSON` }
      }

      if (!res.ok) {
        console.error('[checkout] non-OK response', res.status, result)
        if (result.code === 'consent_required') {
          // Round 9 Fix C — debería ya no dispararse (consent gate eliminado),
          // pero queda defensivo por si quedan rows legacy en DB.
          toast({
            title: t('request.consentRequiredTitle'),
            description: t('request.consentRequiredDesc'),
            variant: 'destructive',
          })
          router.push(`/${locale}/patient/privacy?next=${encodeURIComponent(`/${locale}/patient/request?step=2`)}`)
          return
        }
        if (result.code === 'unauthorized' || res.status === 401) {
          toast({
            title: t('request.authTitle'),
            description: t('request.authDesc'),
            variant: 'destructive',
          })
          router.replace(`/${locale}/login?next=${encodeURIComponent(`/${locale}/patient/request?step=2`)}`)
          return
        }
        toast({
          title: result.error || t('request.errorCreating'),
          description: result.code ? `[${result.code}] HTTP ${res.status}` : `HTTP ${res.status}`,
          variant: 'destructive',
        })
        return
      }

      if (result.testMode && result.redirectUrl) {
        toast({
          title: '✅ Pago simulado',
          description: 'Modo prueba — redirigiendo al seguimiento...',
          variant: 'success',
        })
        router.push(result.redirectUrl)
        return
      }

      // Accept both `url` (canonical) and `sessionUrl` (legacy back-compat).
      const checkoutUrl = result.url || result.sessionUrl
      if (!checkoutUrl) {
        console.error('[checkout] response missing url/sessionUrl', result)
        toast({
          title: t('request.errorCreating'),
          description: 'Stripe no devolvió URL — contacta soporte.',
          variant: 'destructive',
        })
        return
      }
      window.location.href = checkoutUrl
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('request.errorCreating')
      console.error('[checkout] network/unexpected error', err)
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

  // Round 7 P0-A: removed `if (authChecking) return <Skeleton>` — that early
  // return only existed to mask the Round 5 redirect flicker. Without the
  // redirect, anon users should see Step 0 immediately. authChecking still
  // resolves in the background and is consumed by Step3Confirm to pick
  // between inline-auth widget and order summary.

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
        {/* Round 9 Fix A: 3-step flow.
            Step 0 — Tipo + Dirección (was Step 0 type + Step 2 address)
            Step 1 — Médico
            Step 2 — Confirmar y pagar (auth inline + order summary) */}
        {step === 0 && (
          <Step0Type
            type={type}
            setType={setType}
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            detecting={detecting}
            detectLocation={detectLocation}
            onNext={nextStep}
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
            register={register}
            errors={errors}
          />
        )}

        {/* Back navigation (hide on step 0 + step 2 — Step 2 has its own sticky CTA) */}
        {step > 0 && step < 2 && (
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
