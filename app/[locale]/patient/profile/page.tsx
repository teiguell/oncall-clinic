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
import { useToast } from '@/components/ui/use-toast'
import { User, Mail, Phone, Calendar, Activity, Gift, Copy, Edit, Shield } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: string
  referral_code: string | null
  created_at: string
}

export default function PatientProfilePage() {
  const t = useTranslations('patient')
  const locale = useLocale()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [totalConsultations, setTotalConsultations] = useState(0)
  const [lastConsultation, setLastConsultation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push(`/${locale}/login`); return }

      const [profileRes, countRes, lastRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('patient_id', session.user.id),
        supabase.from('consultations').select('created_at').eq('patient_id', session.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ])

      if (profileRes.data) setProfile(profileRes.data as Profile)
      setTotalConsultations(countRes.count || 0)
      if (lastRes.data) setLastConsultation(lastRes.data.created_at)
      setLoading(false)
    }
    load()
  }, [supabase, router, locale])

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code)
      toast({ title: t('profile.codeCopied'), variant: 'success' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!profile) return null

  const memberSince = new Date(profile.created_at).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const lastVisit = lastConsultation
    ? new Date(lastConsultation).toLocaleDateString(locale, {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : t('profile.noConsultations')

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

        {/* Personal info */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {t('profile.personalInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                {profile.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{profile.full_name}</p>
                <Badge variant="info" className="text-xs">{t('profile.patient')}</Badge>
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{profile.phone || t('profile.noPhone')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{t('profile.memberSince')}: {memberSince}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              {t('profile.stats')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{totalConsultations}</p>
                <p className="text-xs text-gray-500">{t('profile.totalConsultations')}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-green-700">{lastVisit}</p>
                <p className="text-xs text-gray-500">{t('profile.lastConsultation')}</p>
              </div>
            </div>
            {profile.referral_code && (
              <div className="mt-4 bg-purple-50 rounded-xl p-4 flex items-center gap-3">
                <Gift className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">{t('profile.referralCode')}</p>
                  <p className="font-mono font-semibold text-purple-700">{profile.referral_code}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={copyReferralCode} className="gap-2">
                  <Copy className="h-4 w-4" />
                  {t('profile.shareCode')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/${locale}/settings`}>
            <Card className="border-0 shadow-sm card-hover cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <Edit className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{t('profile.settings')}</span>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/${locale}/patient/privacy`}>
            <Card className="border-0 shadow-sm card-hover cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{t('profile.privacySettings')}</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
