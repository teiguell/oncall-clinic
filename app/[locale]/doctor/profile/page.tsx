'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/shared/navbar'
import type { Profile as ProfileType } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Star, Globe, Clock, Shield, CreditCard, Edit, Stethoscope } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: string
}

interface DoctorProfile {
  id: string
  user_id: string
  specialty: string
  bio: string | null
  rating: number | null
  total_reviews: number | null
  comib_license_number: string | null
  license_number: string | null
  languages: string[] | null
  years_experience: number | null
  verification_status: string
  rc_insurance_company: string | null
  rc_insurance_policy_number: string | null
  rc_insurance_coverage_amount: number | null
  rc_insurance_expiry_date: string | null
  reta_registration_number: string | null
  commission_rate: number | null
}

const LANGUAGE_LABELS: Record<string, string> = {
  es: 'Español', en: 'English', de: 'Deutsch', fr: 'Français',
  ca: 'Català', it: 'Italiano', pt: 'Português', nl: 'Nederlands',
}

export default function DoctorProfilePage() {
  const t = useTranslations('doctor')
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [completedConsultations, setCompletedConsultations] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push(`/${locale}/login`); return }

      const profileRes = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (!profileRes.data || profileRes.data.role !== 'doctor') {
        router.push(`/${locale}/login`); return
      }
      setProfile(profileRes.data as Profile)

      const dpRes = await supabase.from('doctor_profiles').select('*').eq('user_id', session.user.id).single()
      if (!dpRes.data) { router.push(`/${locale}/doctor/onboarding`); return }
      setDoctorProfile(dpRes.data as DoctorProfile)

      const [earningsRes, countRes] = await Promise.all([
        supabase.from('payouts').select('amount').eq('doctor_id', dpRes.data.id).eq('status', 'completed'),
        supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('doctor_id', dpRes.data.id).eq('status', 'completed'),
      ])

      const total = (earningsRes.data || []).reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0)
      setTotalEarnings(total)
      setCompletedConsultations(countRes.count || 0)
      setLoading(false)
    }
    load()
  }, [supabase, router, locale])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!profile || !doctorProfile) return null

  const rcExpiry = doctorProfile.rc_insurance_expiry_date
    ? new Date(doctorProfile.rc_insurance_expiry_date)
    : null
  const now = new Date()
  const daysUntilExpiry = rcExpiry ? Math.ceil((rcExpiry.getTime() - now.getTime()) / 86400000) : null
  const rcStatus = !rcExpiry ? 'unknown' :
    daysUntilExpiry! < 0 ? 'expired' :
    daysUntilExpiry! < 30 ? 'warning' : 'valid'

  const languages = (doctorProfile.languages || ['es'])
    .map((l: string) => LANGUAGE_LABELS[l] || l)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile as unknown as ProfileType} />
      <main className="container mx-auto max-w-2xl px-4 py-8 fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
          <Link href={`/${locale}/settings`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              {t('profile.settings')}
            </Button>
          </Link>
        </div>

        {/* Doctor info */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {t('profile.professionalInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                {profile.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">Dr. {profile.full_name}</p>
                <p className="text-sm text-gray-600">{t('profile.specialty')}: {doctorProfile.specialty?.replace('_', ' ')}</p>
                <Badge variant={
                  doctorProfile.verification_status === 'verified' ? 'success' :
                  doctorProfile.verification_status === 'suspended' ? 'destructive' :
                  'warning'
                } className="mt-1 text-xs">
                  {t(`profile.status.${doctorProfile.verification_status}`)}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <Stethoscope className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{t('profile.comibNumber')}: {doctorProfile.comib_license_number || doctorProfile.license_number}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-gray-600">{t('profile.rating')}: {doctorProfile.rating?.toFixed(1) || '—'} ({doctorProfile.total_reviews || 0} {t('profile.reviews')})</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Globe className="h-4 w-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-gray-600">{t('profile.languages')}:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {languages.map(l => <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{t('profile.experience')}: {t('profile.yearsExperience', { years: doctorProfile.years_experience || 0 })}</span>
              </div>
            </div>

            {doctorProfile.bio && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">{t('profile.bio')}</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 italic">{doctorProfile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RC Insurance */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              {t('profile.rcInsurance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('profile.rcCompany')}</span>
                <span className="text-sm font-medium">{doctorProfile.rc_insurance_company || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('profile.rcStatus')}</span>
                <Badge variant={rcStatus === 'valid' ? 'success' : rcStatus === 'warning' ? 'warning' : 'destructive'}>
                  {rcStatus === 'valid' ? '✓' : rcStatus === 'warning' ? '⚠' : '✗'} {rcStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('profile.rcExpiry')}</span>
                <span className="text-sm font-medium">{rcExpiry ? rcExpiry.toLocaleDateString(locale) : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('profile.rcCoverage')}</span>
                <span className="text-sm font-medium">
                  {doctorProfile.rc_insurance_coverage_amount
                    ? `€${Number(doctorProfile.rc_insurance_coverage_amount).toLocaleString()}`
                    : '—'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              {t('profile.totalEarnings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-purple-600">€{(totalEarnings / 100).toFixed(2)}</p>
                <p className="text-xs text-gray-500">{t('profile.totalEarnings')}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-600">{completedConsultations}</p>
                <p className="text-xs text-gray-500">{t('profile.completedConsultations')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
