"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrencyFromEuros, formatDate, getService } from '@/lib/utils'
import { TrendingUp, ArrowLeft, ExternalLink, CreditCard, Info } from 'lucide-react'
import type { Profile, DoctorProfile, Consultation } from '@/types'

export default function DoctorEarnings() {
  const router = useRouter()
  const t = useTranslations('doctor')
  const locale = useLocale()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [completedConsultations, setCompletedConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingStripe, setConnectingStripe] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/${locale}/login`); return }

      const [profileRes, doctorRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('doctor_profiles').select('*').eq('user_id', user.id).single(),
      ])

      if (!profileRes.data) { router.push(`/${locale}/login`); return }
      setProfile(profileRes.data)
      setDoctorProfile(doctorRes.data)

      if (doctorRes.data) {
        const { data: consultations } = await supabase
          .from('consultations')
          .select('*')
          .eq('doctor_id', doctorRes.data.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(50)
        setCompletedConsultations(consultations || [])
      }
      setLoading(false)
    }
    load()
  }, [router, locale])

  const connectStripe = async () => {
    setConnectingStripe(true)
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setConnectingStripe(false)
    }
  }

  if (loading || !profile || !doctorProfile) return null

  const totalEarnings = completedConsultations.reduce((sum, c) => sum + (c.doctor_amount || 0), 0)
  const totalCommission = completedConsultations.reduce((sum, c) => sum + (c.commission || 0), 0)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEarnings = completedConsultations
    .filter(c => c.completed_at && new Date(c.completed_at) >= monthStart)
    .reduce((sum, c) => sum + (c.doctor_amount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/${locale}/doctor/dashboard`}>
            <button className="p-2 rounded-xl hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('earnings.title')}</h1>
            <p className="text-sm text-gray-500">{t('earnings.commission')}: {(doctorProfile.commission_rate * 100).toFixed(0)}%</p>
          </div>
        </div>

        {/* Earnings summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-0 shadow-md gradient-primary text-white">
            <CardContent className="p-5">
              <TrendingUp className="h-5 w-5 mb-3 opacity-80" />
              <p className="text-2xl font-bold">{formatCurrencyFromEuros(totalEarnings / 100)}</p>
              <p className="text-sm opacity-80 mt-1">{t('earnings.total')}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <TrendingUp className="h-5 w-5 mb-3 text-green-600" />
              <p className="text-2xl font-bold">{formatCurrencyFromEuros(monthEarnings / 100)}</p>
              <p className="text-sm text-gray-500 mt-1">{t('earnings.thisMonth')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Commission info */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-sm">{t('earnings.howPaymentWorks')}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('earnings.totalToPatient')}</span>
                <span>100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('earnings.commissionOnCall')}</span>
                <span className="text-red-500">-{(doctorProfile.commission_rate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">{t('earnings.yourAmount')}</span>
                <span className="font-semibold text-green-600">{(100 - doctorProfile.commission_rate * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
              💳 {t('earnings.autoTransferNote')}
            </div>
          </CardContent>
        </Card>

        {/* Stripe Connect */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('earnings.bankAccountStripe')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {doctorProfile.stripe_account_id && doctorProfile.stripe_onboarded ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">{t('earnings.stripeConnected')}</span>
                </div>
                <Badge variant="success">{t('earnings.active')}</Badge>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  {t('earnings.connectStripeDesc')}
                </p>
                <Button
                  onClick={connectStripe}
                  loading={connectingStripe}
                  className="w-full flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('earnings.connectStripe')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction history */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">{t('earnings.consultationHistory')} ({completedConsultations.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {completedConsultations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>{t('earnings.noConsultations')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedConsultations.map((c) => {
                  const service = getService(c.service_type)
                  return (
                    <div key={c.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{service?.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{service?.label}</p>
                          <p className="text-xs text-gray-500">
                            {c.completed_at ? formatDate(c.completed_at) : '—'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {t('earnings.commission')}: {formatCurrencyFromEuros((c.commission || 0) / 100)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          +{formatCurrencyFromEuros((c.doctor_amount || 0) / 100)}
                        </p>
                        <Badge
                          variant={c.payout_status === 'completed' ? 'success' : 'warning'}
                          className="text-xs"
                        >
                          {c.payout_status === 'completed' ? t('earnings.paid') : t('earnings.pending')}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
