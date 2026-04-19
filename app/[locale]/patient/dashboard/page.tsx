import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getStatusLabel, getStatusColor, formatRelativeDate, getService } from '@/lib/utils'
import { Zap, Calendar, Clock, ArrowRight, ChevronRight, Activity, MessageCircle, Stethoscope } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { ReferralCard } from '@/components/referral-card'
import { EmptyState } from '@/components/ui/empty-state'
import type { Consultation } from '@/types'

export const dynamic = 'force-dynamic'

export default async function PatientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()

  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'patient') redirect(`/${locale}/login`)

  const t = await getTranslations('patient')
  const tServices = await getTranslations('services')
  const tStates = await getTranslations('dashboardStates')

  // Get active consultation
  const { data: activeConsultation } = await supabase
    .from('consultations')
    .select(`*, doctor_profiles(*, profiles(*))`)
    .eq('patient_id', user.id)
    .in('status', ['pending', 'accepted', 'in_progress', 'arrived'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get recent consultations
  const { data: recentConsultations } = await supabase
    .from('consultations')
    .select(`*, doctor_profiles(*, profiles(*))`)
    .eq('patient_id', user.id)
    .in('status', ['completed', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Get completed consultations within 48h (for post-consultation chat)
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const { data: chatConsultations } = await supabase
    .from('consultations')
    .select(`id, completed_at, doctor_profiles(*, profiles(*))`)
    .eq('patient_id', user.id)
    .eq('status', 'completed')
    .gte('completed_at', fortyEightHoursAgo)
    .order('completed_at', { ascending: false })
    .limit(3)

  // Get unread message counts for active chats
  let unreadCounts: Record<string, number> = {}
  if (chatConsultations && chatConsultations.length > 0) {
    const chatIds = chatConsultations.map(c => c.id)
    const { data: unreadMessages } = await supabase
      .from('consultation_messages')
      .select('consultation_id')
      .in('consultation_id', chatIds)
      .eq('sender_role', 'doctor')
      .is('read_at', null)

    if (unreadMessages) {
      unreadCounts = unreadMessages.reduce((acc: Record<string, number>, msg) => {
        acc[msg.consultation_id] = (acc[msg.consultation_id] || 0) + 1
        return acc
      }, {})
    }
  }

  const firstName = profile.full_name?.split(' ')[0] || 'Usuario'
  const hour = new Date().getHours()
  // 6-12 morning, 12-20 afternoon, else evening/night
  const greeting = hour >= 6 && hour < 12
    ? t('dashboard.greeting')
    : hour >= 12 && hour < 20
      ? t('dashboard.greetingAfternoon')
      : t('dashboard.greetingEvening')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>

        {/* Active consultation banner */}
        {activeConsultation && (
          <Link href={`/${locale}/patient/tracking/${activeConsultation.id}`}>
            <div className="mb-6 gradient-primary text-white rounded-2xl p-5 cursor-pointer hover:opacity-95 transition-opacity shadow-lg shadow-blue-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm opacity-80">{t('dashboard.activeConsultation')}</div>
                    <div className="font-semibold">
                      {/* TODO: use t('status.${status}') */}
                      {getStatusLabel(activeConsultation.status)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-300 rounded-full animate-pulse" />
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Post-consultation chat */}
        {chatConsultations && chatConsultations.length > 0 && (
          <Card className="border-0 shadow-md mb-6 border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              {chatConsultations.map((c: any) => {
                const doctorName = c.doctor_profiles?.profiles?.full_name || c.doctor_profiles?.[0]?.profiles?.full_name || ''
                const unread = unreadCounts[c.id] || 0
                return (
                  <Link key={c.id} href={`/${locale}/consultation/${c.id}/chat`}>
                    <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {t('dashboard.chatWithDoctor')}
                          </p>
                          <p className="text-xs text-gray-500">Dr/a. {doctorName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {unread > 0 && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 min-w-[20px] text-center">
                            {unread}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Main actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href={`/${locale}/patient/request?type=urgent`}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group h-full">
              <CardContent className="p-5">
                <div className="h-12 w-12 rounded-2xl gradient-emergency flex items-center justify-center mb-4 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{t('dashboard.emergencyNow')}</h3>
                <p className="text-xs text-gray-500">{t('dashboard.emergencyDesc')}</p>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/${locale}/patient/request?type=scheduled`}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group h-full">
              <CardContent className="p-5">
                <div className="h-12 w-12 rounded-2xl gradient-success flex items-center justify-center mb-4 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{t('dashboard.scheduleVisit')}</h3>
                <p className="text-xs text-gray-500">{t('dashboard.scheduleDesc')}</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Services quick access */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-base">{tServices('title')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-3">
              {['general_medicine', 'pediatrics', 'emergency', 'cardiology', 'dermatology', 'nursing'].map((type) => {
                const service = getService(type as never)
                if (!service) return null
                return (
                  <Link
                    key={type}
                    href={`/${locale}/patient/request?type=urgent&service=${type}`}
                    className="flex flex-col items-center p-3 rounded-xl hover:bg-blue-50 transition-colors text-center group"
                  >
                    <span className="text-2xl mb-1">{service.icon}</span>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700 leading-tight">
                      {service.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent consultations */}
        {recentConsultations && recentConsultations.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t('dashboard.recentHistory')}</CardTitle>
              <Link href={`/${locale}/patient/history`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                {t('dashboard.seeAll')} <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {recentConsultations.slice(0, 3).map((c: Consultation & { doctor_profiles?: { profiles?: { full_name: string } } }) => {
                  const service = getService(c.service_type)
                  return (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{service?.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service?.label}</p>
                          <p className="text-xs text-gray-500">{formatRelativeDate(c.created_at)}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(c.status)}>
                        {/* TODO: use t('status.${status}') */}
                        {getStatusLabel(c.status)}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {!recentConsultations?.length && !activeConsultation && (
          <EmptyState
            icon={Stethoscope}
            title={tStates('emptyPatientTitle')}
            description={tStates('emptyPatientDesc')}
            actionLabel={tStates('emptyPatientCta')}
            actionHref={`/${locale}/patient/request?type=urgent`}
          />
        )}

        {/* Referral card */}
        {profile.referral_code && (
          <ReferralCard referralCode={profile.referral_code} />
        )}

        {/* Bottom padding for mobile nav */}
        <div className="h-20 md:h-0" />
      </main>
    </div>
  )
}
