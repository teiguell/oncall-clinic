import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrencyFromEuros, formatRelativeDate } from '@/lib/utils'
import {
  Users, Stethoscope, FileCheck, TrendingUp,
  AlertCircle, ChevronRight, Activity
} from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const t = await getTranslations('admin')
  const locale = await getLocale()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile || profile.role !== 'admin') redirect(`/${locale}/login`)

  // Stats
  const [
    { count: totalPatients },
    { count: totalDoctors },
    { count: pendingVerifications },
    { count: activeConsultations },
    { data: recentConsultations },
    { data: totalRevenue },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
    supabase.from('doctor_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('consultations').select('*', { count: 'exact', head: true }).in('status', ['pending', 'accepted', 'in_progress', 'arrived']),
    supabase.from('consultations')
      .select(`*, profiles!patient_id(full_name), doctor_profiles(profiles(full_name))`)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('consultations').select('commission').eq('status', 'completed').not('commission', 'is', null),
  ])

  const platformRevenue = (totalRevenue || []).reduce((sum: number, c: { commission: number }) => sum + (c.commission || 0), 0)

  const stats = [
    { label: t('dashboard.totalPatients'), value: totalPatients || 0, icon: Users, color: 'text-blue-600 bg-blue-50', href: `/${locale}/admin/users` },
    { label: t('dashboard.activeDoctors'), value: totalDoctors || 0, icon: Stethoscope, color: 'text-green-600 bg-green-50', href: `/${locale}/admin/doctors` },
    { label: t('dashboard.pendingVerifications'), value: pendingVerifications || 0, icon: FileCheck, color: 'text-amber-600 bg-amber-50', href: `/${locale}/admin/verifications`, alert: true },
    { label: t('dashboard.activeConsultations'), value: activeConsultations || 0, icon: Activity, color: 'text-purple-600 bg-purple-50', href: `/${locale}/admin/consultations` },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>

        {/* Revenue highlight */}
        <Card className="border-0 shadow-lg gradient-primary text-white mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="opacity-80 text-sm">{t('dashboard.totalRevenue')}</p>
                <p className="text-4xl font-bold mt-1">{formatCurrencyFromEuros(platformRevenue / 100)}</p>
                <p className="text-sm opacity-70 mt-1">{t('dashboard.commissionNote')}</p>
              </div>
              <TrendingUp className="h-16 w-16 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className={`border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer ${stat.alert && (stat.value as number) > 0 ? 'ring-2 ring-amber-400' : ''}`}>
                <CardContent className="p-4">
                  <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value as number}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  {stat.alert && (stat.value as number) > 0 && (
                    <Badge variant="warning" className="mt-2 text-xs">{t('dashboard.requiresAction')}</Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href={`/${locale}/admin/verifications`}>
            <Button className="w-full flex items-center gap-2" size="lg">
              <FileCheck className="h-5 w-5" />
              {t('dashboard.reviewDoctors')}
              {(pendingVerifications || 0) > 0 && (
                <Badge className="ml-auto bg-white text-blue-600 text-xs">
                  {pendingVerifications}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href={`/${locale}/admin/commissions`}>
            <Button variant="outline" className="w-full flex items-center gap-2" size="lg">
              <TrendingUp className="h-5 w-5" />
              {t('dashboard.manageServices')}
            </Button>
          </Link>
          <Link href={`/${locale}/admin/consultations`}>
            <Button variant="outline" className="w-full flex items-center gap-2" size="lg">
              <Activity className="h-5 w-5" />
              {t('dashboard.viewLiveConsultations')}
            </Button>
          </Link>
        </div>

        {/* Recent consultations */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t('dashboard.recentConsultations')}</CardTitle>
            <Link href={`/${locale}/admin/consultations`} className="text-sm text-blue-600 flex items-center gap-1">
              {t('dashboard.viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {!recentConsultations?.length ? (
              <p className="text-center text-gray-400 py-4">{t('dashboard.noConsultationsYet')}</p>
            ) : (
              <div className="space-y-3">
                {recentConsultations.map((c: {
                  id: string
                  status: string
                  service_type: string
                  type: string
                  commission: number | null
                  created_at: string
                  profiles?: { full_name?: string }
                }) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        c.status === 'completed' ? 'bg-green-400' :
                        c.status === 'cancelled' ? 'bg-red-400' :
                        'bg-yellow-400 animate-pulse'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{c.profiles?.full_name || 'Paciente'}</p>
                        <p className="text-xs text-gray-500">
                          {c.service_type.replace('_', ' ')} · {formatRelativeDate(c.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-500">
                        {c.commission ? `+${formatCurrencyFromEuros(c.commission / 100)}` : '—'}
                      </p>
                      <Badge variant={
                        c.status === 'completed' ? 'success' :
                        c.status === 'cancelled' ? 'destructive' :
                        'warning'
                      } className="text-xs mt-0.5">
                        {c.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
