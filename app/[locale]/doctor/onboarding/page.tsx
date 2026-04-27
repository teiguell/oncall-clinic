"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { AUTH_BYPASS, AUTH_BYPASS_ROLE, BYPASS_USER_ID } from '@/lib/auth-bypass'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { SERVICES } from '@/types'
import {
  Stethoscope, FileText, Upload, CheckCircle, ArrowLeft, ArrowRight,
  CreditCard, Shield, Clock, AlertCircle, User, Globe
} from 'lucide-react'

const SPECIALTIES = [...new Set(SERVICES.map(s => s.label))].filter(s => s !== 'Urgencias')

const LANGUAGE_OPTIONS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pt', label: 'Português' },
]

const COMIB_REGEX = /^\d{2}\/\d{5}$/

type StepData = {
  // Step 1 — Personal Info
  fullName: string
  email: string
  phone: string
  languages: string[]
  yearsExperience: string
  specialty: string
  // Step 2 — Documentation
  comibLicense: string
  rcCompany: string
  rcPolicyNumber: string
  rcCoverage: string
  rcExpiry: string
  retaNumber: string
  // Step 3 — Stripe (tracked via stripeConnected)
  // Step 4 — Contract
  contractAccepted: boolean
}

export default function DoctorRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('doctor')
  const locale = useLocale()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)
  const [doctorProfileId, setDoctorProfileId] = useState<string | null>(null)
  const [rcFile, setRcFile] = useState<File | null>(null)
  const [retaFile, setRetaFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<StepData>({
    fullName: '',
    email: '',
    phone: '',
    languages: ['es'],
    yearsExperience: '',
    specialty: '',
    comibLicense: '',
    rcCompany: '',
    rcPolicyNumber: '',
    rcCoverage: '',
    rcExpiry: '',
    retaNumber: '',
    contractAccepted: false,
  })

  // Load existing profile data
  const loadProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    // Round 14 P0 #1 — bypass: when AUTH_BYPASS_ROLE=doctor, fall back
    // to the seeded demo-doctor UUID so Cowork audits load the page.
    const userId = user?.id ?? (AUTH_BYPASS && AUTH_BYPASS_ROLE === 'doctor' ? BYPASS_USER_ID : null)
    if (!userId) { router.push(`/${locale}/login`); return }

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', userId).single()

    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || prev.fullName,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
      }))
    }

    const { data: doctorProfile } = await supabase
      .from('doctor_profiles').select('*').eq('user_id', userId).single()

    if (doctorProfile) {
      setDoctorProfileId(doctorProfile.id)
      setStripeConnected(!!doctorProfile.stripe_onboarded)
      setFormData(prev => ({
        ...prev,
        specialty: doctorProfile.specialty || prev.specialty,
        languages: doctorProfile.languages || prev.languages,
        yearsExperience: doctorProfile.years_experience?.toString() || prev.yearsExperience,
        comibLicense: doctorProfile.comib_license_number || prev.comibLicense,
        rcCompany: doctorProfile.rc_insurance_company || prev.rcCompany,
        rcPolicyNumber: doctorProfile.rc_insurance_policy_number || prev.rcPolicyNumber,
        rcCoverage: doctorProfile.rc_insurance_coverage_amount?.toString() || prev.rcCoverage,
        rcExpiry: doctorProfile.rc_insurance_expiry_date || prev.rcExpiry,
        retaNumber: doctorProfile.reta_registration_number || prev.retaNumber,
      }))
      if (doctorProfile.contract_accepted_at) {
        setFormData(prev => ({ ...prev, contractAccepted: true }))
      }
    }
  }, [locale, router])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const updateField = (field: keyof StepData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const toggleLanguage = (code: string) => {
    setFormData(prev => {
      const langs = prev.languages.includes(code)
        ? prev.languages.filter(l => l !== code)
        : [...prev.languages, code]
      return { ...prev, languages: langs.length > 0 ? langs : prev.languages }
    })
  }

  // ---- Validation per step ----

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {}
    if (!formData.fullName.trim()) errs.fullName = t('onboarding.required')
    if (!formData.email.trim()) errs.email = t('onboarding.required')
    if (!formData.phone.trim()) errs.phone = t('onboarding.required')
    if (!formData.specialty) errs.specialty = t('onboarding.selectSpecialty')
    if (formData.languages.length === 0) errs.languages = t('onboarding.required')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {}
    if (!formData.comibLicense.trim()) {
      errs.comibLicense = t('onboarding.required')
    } else if (!COMIB_REGEX.test(formData.comibLicense)) {
      errs.comibLicense = t('onboarding.comibFormat')
    }
    if (!formData.rcCompany.trim()) errs.rcCompany = t('onboarding.required')
    if (!formData.rcPolicyNumber.trim()) errs.rcPolicyNumber = t('onboarding.required')
    if (!formData.rcCoverage.trim()) {
      errs.rcCoverage = t('onboarding.required')
    } else if (parseFloat(formData.rcCoverage) < 1000000) {
      errs.rcCoverage = t('onboarding.rcCoverageMin')
    }
    if (!formData.rcExpiry) errs.rcExpiry = t('onboarding.required')
    if (!formData.retaNumber.trim()) errs.retaNumber = t('onboarding.required')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ---- Save helpers ----

  const saveStep1 = async () => {
    if (!validateStep1()) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id ?? (AUTH_BYPASS && AUTH_BYPASS_ROLE === 'doctor' ? BYPASS_USER_ID : null)
      if (!userId) { router.push(`/${locale}/login`); return }

      // Update profile name/phone
      await supabase.from('profiles').update({
        full_name: formData.fullName,
        phone: formData.phone,
      }).eq('id', userId)

      // Upsert doctor_profiles
      if (doctorProfileId) {
        await supabase.from('doctor_profiles').update({
          specialty: formData.specialty,
          languages: formData.languages,
          years_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
        }).eq('id', doctorProfileId)
      } else {
        const { data: newDoc } = await supabase.from('doctor_profiles').insert({
          user_id: userId,
          specialty: formData.specialty,
          languages: formData.languages,
          years_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
          license_number: 'pending',
          city: 'Ibiza',
          verification_status: 'pending',
          commission_rate: 0.15,
        }).select('id').single()
        if (newDoc) setDoctorProfileId(newDoc.id)
      }
      setStep(1)
    } catch {
      toast({ title: t('onboarding.error'), variant: 'destructive' })
    }
    setLoading(false)
  }

  const uploadFile = async (file: File, path: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: true })
    if (error) throw error
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(data.path)
    return urlData.publicUrl
  }

  const saveStep2 = async () => {
    if (!validateStep2()) return
    if (!doctorProfileId) return
    setLoading(true)
    try {
      const supabase = createClient()

      let rcDocUrl: string | undefined
      let retaDocUrl: string | undefined

      if (rcFile) {
        if (rcFile.size > 5 * 1024 * 1024) {
          setErrors({ rcFile: t('onboarding.fileTooLarge') })
          setLoading(false)
          return
        }
        rcDocUrl = await uploadFile(rcFile, `rc/${doctorProfileId}/${rcFile.name}`)
      }
      if (retaFile) {
        if (retaFile.size > 5 * 1024 * 1024) {
          setErrors({ retaFile: t('onboarding.fileTooLarge') })
          setLoading(false)
          return
        }
        retaDocUrl = await uploadFile(retaFile, `reta/${doctorProfileId}/${retaFile.name}`)
      }

      const updateData: Record<string, unknown> = {
        comib_license_number: formData.comibLicense,
        license_number: formData.comibLicense,
        rc_insurance_company: formData.rcCompany,
        rc_insurance_policy_number: formData.rcPolicyNumber,
        rc_insurance_coverage_amount: parseFloat(formData.rcCoverage),
        rc_insurance_expiry_date: formData.rcExpiry,
        reta_registration_number: formData.retaNumber,
      }
      if (rcDocUrl) updateData.rc_insurance_document_url = rcDocUrl
      if (retaDocUrl) updateData.reta_document_url = retaDocUrl

      await supabase.from('doctor_profiles').update(updateData).eq('id', doctorProfileId)
      // Round 18A-2: skip the Stripe Connect step (was step=2). The new
      // Stripe-deferred design jumps straight to Contract (step=3). The
      // Stripe step markup is left in place as dead UI; Round 18B will
      // clean it up. The dashboard StripeSetupBanner now nudges the
      // doctor to onboard Stripe post-first-visit.
      setStep(3)
    } catch {
      toast({ title: t('onboarding.error'), variant: 'destructive' })
    }
    setLoading(false)
  }

  const handleStripeConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast({ title: t('onboarding.error'), description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: t('onboarding.error'), variant: 'destructive' })
    }
    setLoading(false)
  }

  const saveStep4 = async () => {
    if (!formData.contractAccepted || !doctorProfileId) return
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('doctor_profiles').update({
        contract_accepted_at: new Date().toISOString(),
        contract_version: '1.0',
        verification_status: 'pending',
      }).eq('id', doctorProfileId)

      // Round 11 Fix C — kick off the activation flow:
      // generate the email-confirm token + send welcome / activation /
      // admin emails. Best-effort: failures here don't roll back the
      // contract acceptance (the doctor row is already saved). The
      // dashboard exposes a "resend activation email" button if needed.
      try {
        await fetch('/api/doctor/onboarding-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale }),
        })
      } catch (e) {
        console.warn('[onboarding] activation kickoff failed:', e)
      }

      setStep(4)
    } catch {
      toast({ title: t('onboarding.error'), variant: 'destructive' })
    }
    setLoading(false)
  }

  const TOTAL_STEPS = 5
  const stepLabels = [
    t('onboarding.step1'),
    t('onboarding.step2'),
    t('onboarding.step3'),
    t('onboarding.step4'),
    t('onboarding.step5'),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-xl mx-auto mb-4">
            <Stethoscope className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('onboarding.title')}</h1>
          <p className="text-gray-500 mt-2">{t('onboarding.verificationTime')}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                  i < step ? 'bg-green-500 text-white' :
                  i === step ? 'gradient-primary text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-xs text-center hidden sm:block ${
                  i <= step ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}>{label}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((step) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-xl border-0">
          {/* ========== STEP 1 — Personal Info ========== */}
          {step === 0 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('onboarding.personalInfo')}
                </CardTitle>
                <CardDescription>{t('onboarding.personalInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label={`${t('onboarding.fullName')} *`}
                  name="fullName"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={e => updateField('fullName', e.target.value)}
                  error={errors.fullName}
                />

                <Input
                  label={`${t('onboarding.email')} *`}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  error={errors.email}
                  disabled
                />

                <Input
                  label={`${t('onboarding.phone')} *`}
                  type="tel"
                  inputMode="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder={t('onboarding.phonePlaceholder')}
                  value={formData.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  error={errors.phone}
                />

                {/* Languages */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    {t('onboarding.languages')} *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map(lang => (
                      <label
                        key={lang.code}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                          formData.languages.includes(lang.code)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang.code)}
                          onChange={() => toggleLanguage(lang.code)}
                          className="sr-only"
                        />
                        <span className="text-sm">{lang.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.languages && <p className="text-xs text-red-500">{errors.languages}</p>}
                </div>

                {/* Years of experience */}
                <Input
                  label={t('onboarding.yearsExperience')}
                  type="number"
                  name="yearsExperience"
                  inputMode="numeric"
                  min="0"
                  max="60"
                  step="1"
                  value={formData.yearsExperience}
                  onChange={e => updateField('yearsExperience', e.target.value)}
                />

                {/* Specialty */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('onboarding.specialty')} *</label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.specialty}
                    onChange={e => updateField('specialty', e.target.value)}
                  >
                    <option value="">{t('onboarding.selectSpecialty')}</option>
                    {SPECIALTIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="Medicina General">{t('onboarding.generalMedicine')}</option>
                  </select>
                  {errors.specialty && <p className="text-xs text-red-500">{errors.specialty}</p>}
                </div>

                <Button onClick={saveStep1} className="w-full" size="lg" loading={loading}>
                  {t('onboarding.nextDocumentation')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </>
          )}

          {/* ========== STEP 2 — Documentation ========== */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('onboarding.uploadDocs')}
                </CardTitle>
                <CardDescription>{t('onboarding.uploadDocsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* COMIB License */}
                <div className="p-4 bg-blue-50 rounded-xl space-y-3">
                  <h3 className="font-semibold text-sm text-blue-800">{t('onboarding.comibLicense')}</h3>
                  <Input
                    placeholder={t('onboarding.comibPlaceholder')}
                    value={formData.comibLicense}
                    onChange={e => updateField('comibLicense', e.target.value)}
                    error={errors.comibLicense}
                  />
                  <p className="text-xs text-blue-600">{t('onboarding.comibFormat')}</p>
                </div>

                {/* RC Insurance */}
                <div className="p-4 bg-amber-50 rounded-xl space-y-3">
                  <h3 className="font-semibold text-sm text-amber-800 flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    RC Insurance
                  </h3>

                  <Input
                    label={`${t('onboarding.rcCompany')} *`}
                    value={formData.rcCompany}
                    onChange={e => updateField('rcCompany', e.target.value)}
                    error={errors.rcCompany}
                  />

                  <Input
                    label={`${t('onboarding.rcPolicyNumber')} *`}
                    value={formData.rcPolicyNumber}
                    onChange={e => updateField('rcPolicyNumber', e.target.value)}
                    error={errors.rcPolicyNumber}
                  />

                  <Input
                    label={`${t('onboarding.rcCoverage')} *`}
                    type="number"
                    min="1000000"
                    step="100000"
                    value={formData.rcCoverage}
                    onChange={e => updateField('rcCoverage', e.target.value)}
                    error={errors.rcCoverage}
                  />
                  <p className="text-xs text-amber-600">{t('onboarding.rcCoverageMin')}</p>

                  <Input
                    label={`${t('onboarding.rcExpiry')} *`}
                    type="date"
                    value={formData.rcExpiry}
                    onChange={e => updateField('rcExpiry', e.target.value)}
                    error={errors.rcExpiry}
                  />

                  {/* RC File upload */}
                  <div className="border-2 border-dashed border-amber-300 rounded-xl p-4 hover:border-amber-400 transition-colors">
                    <label className="cursor-pointer flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        rcFile ? 'bg-green-100' : 'bg-amber-100'
                      }`}>
                        {rcFile
                          ? <CheckCircle className="h-5 w-5 text-green-600" />
                          : <Upload className="h-5 w-5 text-amber-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {rcFile ? rcFile.name : t('onboarding.uploadRcDoc')}
                        </p>
                        <p className="text-xs text-gray-500">{t('onboarding.fileFormats')}</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="sr-only"
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) setRcFile(f)
                        }}
                      />
                    </label>
                  </div>
                  {errors.rcFile && <p className="text-xs text-red-500">{errors.rcFile}</p>}
                </div>

                {/* RETA */}
                <div className="p-4 bg-green-50 rounded-xl space-y-3">
                  <h3 className="font-semibold text-sm text-green-800">RETA</h3>
                  <Input
                    label={`${t('onboarding.retaNumber')} *`}
                    value={formData.retaNumber}
                    onChange={e => updateField('retaNumber', e.target.value)}
                    error={errors.retaNumber}
                  />

                  <div className="border-2 border-dashed border-green-300 rounded-xl p-4 hover:border-green-400 transition-colors">
                    <label className="cursor-pointer flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        retaFile ? 'bg-green-100' : 'bg-green-100'
                      }`}>
                        {retaFile
                          ? <CheckCircle className="h-5 w-5 text-green-600" />
                          : <Upload className="h-5 w-5 text-green-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {retaFile ? retaFile.name : t('onboarding.retaDoc')}
                        </p>
                        <p className="text-xs text-gray-500">{t('onboarding.fileFormats')}</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="sr-only"
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) setRetaFile(f)
                        }}
                      />
                    </label>
                  </div>
                  {errors.retaFile && <p className="text-xs text-red-500">{errors.retaFile}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(0)} className="flex-1" size="lg">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('onboarding.back')}
                  </Button>
                  <Button onClick={saveStep2} className="flex-1" size="lg" loading={loading}>
                    {t('onboarding.next')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* ========== STEP 3 — Stripe Connect ========== */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('onboarding.stripeConnect')}
                </CardTitle>
                <CardDescription>{t('onboarding.stripeConnectDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-indigo-600" />
                  </div>

                  {stripeConnected ? (
                    <div className="space-y-3">
                      <Badge variant="success" className="text-sm px-3 py-1">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('onboarding.stripeConnected')}
                      </Badge>
                      <p className="text-sm text-gray-600">{t('onboarding.stripeConnectDesc')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Badge variant="warning" className="text-sm px-3 py-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {t('onboarding.stripeNotConnected')}
                      </Badge>
                      <p className="text-sm text-gray-600">{t('onboarding.stripeConnectDesc')}</p>
                      <Button
                        onClick={handleStripeConnect}
                        size="lg"
                        className="mt-2"
                        loading={loading}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {t('onboarding.stripeConnectButton')}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1" size="lg">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('onboarding.back')}
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1" size="lg">
                    {t('onboarding.next')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* ========== STEP 4 — Contract ========== */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t('onboarding.contractTitle')}
                </CardTitle>
                <CardDescription>{t('onboarding.contractSummary')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  <h3 className="font-semibold text-sm text-gray-800">{t('onboarding.contractSummary')}</h3>
                  <ul className="space-y-2.5">
                    {[
                      { icon: <CreditCard className="h-4 w-4" />, text: '15% commission per consultation' },
                      { icon: <Clock className="h-4 w-4" />, text: '24h payment to your bank account' },
                      { icon: <Shield className="h-4 w-4" />, text: 'RC insurance >= 1,000,000 EUR required' },
                      { icon: <CheckCircle className="h-4 w-4" />, text: 'No exclusivity — work freely' },
                      { icon: <AlertCircle className="h-4 w-4" />, text: 'Clinical responsibility remains with the doctor' },
                    ].map((term, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <span className="text-blue-600 mt-0.5 flex-shrink-0">{term.icon}</span>
                        {t(`onboarding.contractTerms.${i}`, { defaultValue: term.text })}
                      </li>
                    ))}
                  </ul>
                </div>

                <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.contractAccepted}
                    onChange={e => updateField('contractAccepted', e.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t('onboarding.acceptContract')}
                  </span>
                </label>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1" size="lg">
                    {/* Round 18A-2: was setStep(2) (back to Stripe).
                        Stripe step is skipped now; back goes to Docs (1). */}
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('onboarding.back')}
                  </Button>
                  <Button
                    onClick={saveStep4}
                    className="flex-1"
                    size="lg"
                    loading={loading}
                    disabled={!formData.contractAccepted}
                  >
                    {t('onboarding.submit')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* ========== STEP 5 — Confirmation ========== */}
          {step === 4 && (
            <CardContent className="py-10 text-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('onboarding.pendingVerification')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('onboarding.pendingVerificationDesc')}
              </p>

              <div className="bg-blue-50 rounded-2xl p-5 text-left mb-6">
                <h3 className="font-semibold text-blue-800 mb-3">{t('onboarding.whatHappensNow')}</h3>
                <ul className="space-y-2">
                  {[
                    { done: !!formData.fullName, label: t('onboarding.step1') },
                    { done: !!formData.comibLicense, label: t('onboarding.step2') },
                    { done: stripeConnected, label: t('onboarding.step3') },
                    { done: formData.contractAccepted, label: t('onboarding.step4') },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {item.done ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className={item.done ? 'text-green-700' : 'text-gray-500'}>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => router.push(`/${locale}/doctor/dashboard`)}
                className="w-full"
                size="lg"
              >
                {t('onboarding.goToDashboard')}
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
