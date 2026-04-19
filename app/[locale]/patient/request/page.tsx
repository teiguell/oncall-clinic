"use client"

import { useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { SERVICES, type ServiceType, type ConsultationType } from '@/types'
import { formatCurrencyFromEuros } from '@/lib/utils'
import { MapPin, Zap, Calendar, ArrowLeft, AlertCircle, ChevronRight, ShieldCheck, Award, Lock, CheckCircle } from 'lucide-react'
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
  const [selectedService, setSelectedService] = useState<ServiceType>(
    (searchParams.get('service') as ServiceType) || 'general_medicine'
  )
  const [loading, setLoading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const STEPS = [t('request.typeStep'), t('request.serviceStep'), t('request.detailsStep'), t('request.confirmStep')]

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

  const service = SERVICES.find(s => s.value === selectedService)!
  // Flat base price (adjustments apply at payout); commission shown only
  // internally to the doctor, never to the patient.
  const price = service.basePrice
  const commission = price * 0.10
  const doctorAmount = price - commission

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${locale}/login`); return }

    const scheduledAt = data.scheduledDate && data.scheduledTime
      ? new Date(`${data.scheduledDate}T${data.scheduledTime}`).toISOString()
      : null

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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t('request.whatType')}</h2>
              <p className="text-gray-500 mt-2">{t('request.whatTypeDesc')}</p>
            </div>

            <button
              onClick={() => { setType('urgent'); nextStep() }}
              className={`w-full p-6 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                type === 'urgent' ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl gradient-emergency flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{t('request.urgent')}</h3>
                  <p className="text-gray-500 text-sm">{t('request.urgentDesc')}</p>
                  <Badge variant="warning" className="mt-2">{t('request.urgentSurcharge')}</Badge>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => { setType('scheduled'); nextStep() }}
              className={`w-full p-6 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                type === 'scheduled' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl gradient-success flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{t('request.scheduled')}</h3>
                  <p className="text-gray-500 text-sm">{t('request.scheduledDesc')}</p>
                  <Badge variant="success" className="mt-2">{t('request.standardPrice')}</Badge>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </button>
          </div>
        )}

        {/* Step 1: Service */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t('request.whatSpecialty')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SERVICES.map((service) => {
                const servicePrice = service.basePrice
                const isDisabled = !service.active
                return (
                  <button
                    key={service.value}
                    disabled={isDisabled}
                    onClick={() => { if (!isDisabled) { setSelectedService(service.value); nextStep() } }}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                      isDisabled
                        ? 'border-border/60 bg-muted/40 opacity-60 cursor-not-allowed'
                        : selectedService === service.value
                          ? 'border-primary bg-primary/5 hover:shadow-md'
                          : 'border-border bg-card hover:shadow-md'
                    }`}
                  >
                    {service.comingSoon && (
                      <span className="absolute top-2 right-2 pill-neutral">
                        {t('request.comingSoon')}
                      </span>
                    )}
                    <span className="text-3xl">{service.icon}</span>
                    <p className="font-semibold text-sm mt-2 text-foreground">{service.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                    {service.active && (
                      <p className="text-primary font-bold text-sm mt-2">
                        {formatCurrencyFromEuros(servicePrice)}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Symptoms */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep() }} className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('request.whereAndWhat')}</h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('request.address')}</label>
              <div className="relative">
                <Input
                  placeholder={t('request.addressPlaceholder')}
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

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('request.confirm')}</h2>
              <p className="text-gray-500 mt-2">{t('request.confirmDesc')}</p>
            </div>

            <Card className="border-0 shadow-md">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <span className="text-3xl">{service.icon}</span>
                  <div>
                    <p className="font-semibold">{service.label}</p>
                    <Badge variant={type === 'urgent' ? 'destructive' : 'success'}>
                      {type === 'urgent' ? t('request.urgentBadge') : t('request.scheduledBadge')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('request.basePrice')}</span>
                    <span className="font-medium">{formatCurrencyFromEuros(price)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{t('request.toDoctor')}</span>
                    <span>{formatCurrencyFromEuros(doctorAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{t('request.platformCommission')}</span>
                    <span>{formatCurrencyFromEuros(commission)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-3 border-t">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {t('request.paymentNote')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ITEM-4: Trust signals above pay CTA */}
            <div className="flex flex-col gap-2 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {tTrust('comibShort')}
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {tTrust('insuranceShort')}
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {tTrust('rgpdShort')}
              </div>
            </div>

            {/* ITEM-5: Sticky CTA on mobile, inline on desktop */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 md:px-0 py-3 md:py-0 bg-background/95 backdrop-blur-sm border-t md:static md:bg-transparent md:border-0 z-10">
                <Button type="submit" className="w-full" size="xl" loading={loading}>
                  {type === 'urgent' ? t('request.submitUrgent') : t('request.submitScheduled')}
                </Button>
              </div>
            </form>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <RequestConsultationPage />
    </Suspense>
  )
}
