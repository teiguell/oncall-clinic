"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Stethoscope, Mail, Lock, User, Phone, ArrowLeft, Check, Gift } from 'lucide-react'

type ConsentType =
  | 'health_data_processing'
  | 'geolocation_tracking'
  | 'analytics'
  | 'marketing_communications'
  | 'profiling'

type FormData = {
  fullName: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
}

function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDoctor = searchParams.get('role') === 'doctor'
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor'>(isDoctor ? 'doctor' : 'patient')
  const [consents, setConsents] = useState<Record<ConsentType, boolean>>({
    health_data_processing: false,
    geolocation_tracking: false,
    analytics: false,
    marketing_communications: false,
    profiling: false,
  })
  const [consentError, setConsentError] = useState(false)
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '')
  const t = useTranslations('auth')
  const locale = useLocale()

  const toggleConsent = (type: ConsentType) => {
    setConsents(prev => ({ ...prev, [type]: !prev[type] }))
    setConsentError(false)
  }

  const schema = z.object({
    fullName: z.string().min(2, t('errors.nameRequired')),
    email: z.string().email(t('errors.invalidEmail')),
    phone: z.string().min(9, t('errors.invalidPhone')).optional(),
    password: z.string()
      .min(12, t('errors.minPassword'))
      .regex(/[A-Z]/, t('errors.passwordUppercase'))
      .regex(/[0-9]/, t('errors.passwordNumber')),
    confirmPassword: z.string(),
  }).refine(d => d.password === d.confirmPassword, {
    message: t('errors.passwordsMismatch'),
    path: ['confirmPassword'],
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    // Validate required consents
    if (!consents.health_data_processing || !consents.geolocation_tracking) {
      setConsentError(true)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone || null,
          role: selectedRole,
        },
      },
    })

    if (error) {
      toast({
        title: t('register.errorTitle'),
        description: error.message,
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    if (authData.user) {
      // Look up referrer if referral code was provided
      let referredBy: string | null = null
      if (referralCode.trim()) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referralCode.trim().toUpperCase())
          .single()
        if (referrer) {
          referredBy = referrer.id
        }
      }

      // Create profile
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        phone: data.phone || null,
        role: selectedRole,
        ...(referredBy ? { referred_by: referredBy } : {}),
      })

      // Insert all 5 consent records via API (captures real IP server-side)
      const consentTypes: ConsentType[] = [
        'health_data_processing',
        'geolocation_tracking',
        'analytics',
        'marketing_communications',
        'profiling',
      ]
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null

      const consentRecords = consentTypes.map(type => ({
        user_id: authData.user!.id,
        consent_type: type,
        granted: consents[type],
        user_agent: userAgent,
      }))

      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentRecords),
      })

      toast({
        title: t('register.successTitle'),
        description: selectedRole === 'doctor'
          ? t('register.successDoctor')
          : t('register.successPatient'),
        variant: 'success',
      })

      if (selectedRole === 'doctor') {
        router.push(`/${locale}/doctor/onboarding`)
      } else {
        router.push(`/${locale}/patient/dashboard`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">OnCall Clinic</h1>
          <p className="text-gray-500 mt-1">{t('register.subtitle')}</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">{t('register.title')}</CardTitle>
            <CardDescription>{t('register.description')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setSelectedRole('patient')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === 'patient'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">🏥</div>
                <div className="font-semibold text-sm">{t('register.asPatient')}</div>
                <div className="text-xs text-gray-500 mt-0.5">{t('register.asPatientDesc')}</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('doctor')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === 'doctor'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">🩺</div>
                <div className="font-semibold text-sm">{t('register.asDoctor')}</div>
                <div className="text-xs text-gray-500 mt-0.5">{t('register.asDoctorDesc')}</div>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="fullName"
                label={t('register.name')}
                placeholder={selectedRole === 'doctor' ? 'Dra. Ana García' : 'María García'}
                icon={<User className="h-4 w-4" />}
                error={errors.fullName?.message}
                required
                aria-required="true"
                autoComplete="name"
                {...register('fullName')}
              />
              <Input
                id="email"
                label={t('register.email')}
                type="email"
                placeholder="ana@ejemplo.com"
                icon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                required
                aria-required="true"
                autoComplete="email"
                {...register('email')}
              />
              <Input
                id="phone"
                label={t('register.phone')}
                type="tel"
                placeholder="+XX XXX XXX XXX"
                icon={<Phone className="h-4 w-4" />}
                error={errors.phone?.message}
                autoComplete="tel"
                {...register('phone')}
              />
              <Input
                id="password"
                label={t('register.password')}
                type="password"
                placeholder={t('register.passwordPlaceholder')}
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                required
                aria-required="true"
                autoComplete="new-password"
                {...register('password')}
              />
              <Input
                id="confirmPassword"
                label={t('register.confirmPassword')}
                type="password"
                placeholder={t('register.confirmPasswordPlaceholder')}
                icon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                required
                aria-required="true"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />

              {/* Referral code (optional) */}
              <Input
                label={t('register.referralCode')}
                placeholder={t('register.referralCodePlaceholder')}
                icon={<Gift className="h-4 w-4" />}
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />

              <p className="text-xs text-gray-500">
                {t.rich('register.terms', {
                  termsLink: (chunks) => <Link href={`/${locale}/legal/terms`} className="text-blue-600 hover:underline">{chunks}</Link>,
                  privacyLink: (chunks) => <Link href={`/${locale}/legal/privacy`} className="text-blue-600 hover:underline">{chunks}</Link>,
                })}
              </p>

              {/* GDPR Consent Checkboxes */}
              <div className="space-y-3 rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                {/* Required: Health data processing */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      id="consent_health"
                      name="consent_health"
                      type="checkbox"
                      checked={consents.health_data_processing}
                      onChange={() => toggleConsent('health_data_processing')}
                      required
                      aria-required="true"
                      className="sr-only"
                    />
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                      consents.health_data_processing
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {consents.health_data_processing && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-700 leading-tight">
                      {t('register.consentHealth')} <span className="text-red-500">*</span>
                    </span>
                    <Link href={`/${locale}/legal/privacy`} className="block text-xs text-blue-600 hover:underline mt-0.5">
                      {t('register.readPrivacyPolicy')}
                    </Link>
                  </div>
                </label>

                {/* Required: Geolocation tracking */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      id="consent_geo"
                      name="consent_geo"
                      type="checkbox"
                      checked={consents.geolocation_tracking}
                      onChange={() => toggleConsent('geolocation_tracking')}
                      required
                      aria-required="true"
                      className="sr-only"
                    />
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                      consents.geolocation_tracking
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {consents.geolocation_tracking && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-xs text-gray-700 leading-tight">
                    {t('register.consentGeo')} <span className="text-red-500">*</span>
                  </span>
                </label>

                {/* Optional: Analytics */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      id="consent_analytics"
                      name="consent_analytics"
                      type="checkbox"
                      checked={consents.analytics}
                      onChange={() => toggleConsent('analytics')}
                      className="sr-only"
                    />
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                      consents.analytics
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {consents.analytics && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 leading-tight">
                    {t('register.consentAnalytics')}
                  </span>
                </label>

                {/* Optional: Marketing */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      id="consent_marketing"
                      name="consent_marketing"
                      type="checkbox"
                      checked={consents.marketing_communications}
                      onChange={() => toggleConsent('marketing_communications')}
                      className="sr-only"
                    />
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                      consents.marketing_communications
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {consents.marketing_communications && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 leading-tight">
                    {t('register.consentMarketing')}
                  </span>
                </label>

                {/* Optional: Profiling */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      id="consent_profiling"
                      name="consent_profiling"
                      type="checkbox"
                      checked={consents.profiling}
                      onChange={() => toggleConsent('profiling')}
                      className="sr-only"
                    />
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                      consents.profiling
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {consents.profiling && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 leading-tight">
                    {t('register.consentProfiling')}
                  </span>
                </label>

                {consentError && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {t('register.consentRequired')}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                {selectedRole === 'doctor' ? t('register.submitDoctor') : t('register.submit')}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              {t('register.hasAccount')}{' '}
              <Link href={`/${locale}/login`} className="text-blue-600 font-semibold hover:underline">
                {t('register.logIn')}
              </Link>
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href={`/${locale}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}

// Wrap with Suspense for useSearchParams

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <RegisterPage />
    </Suspense>
  )
}
