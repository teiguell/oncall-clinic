import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getEffectiveSession } from '@/lib/supabase/auto-client'
import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate, getService } from '@/lib/utils'
import {
  Zap, ChevronRight, MessageCircle, Stethoscope,
  Bell, Star, User, FileText, Check,
} from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { ReferralCard } from '@/components/referral-card'
import { DashboardGreeting } from '@/components/dashboard-greeting'
import { EmptyState } from '@/components/ui/empty-state'
import type { Consultation } from '@/types'

export const dynamic = 'force-dynamic'

type DoctorProfile = {
  id?: string
  rating?: number | null
  profiles?: { full_name?: string | null } | Array<{ full_name?: string | null }>
  specialty?: string | null
} | null

const getDoctorProfile = (dp: unknown): Exclude<DoctorProfile, null> => {
  if (Array.isArray(dp)) return dp[0] ?? {}
  return (dp as Exclude<DoctorProfile, null>) ?? {}
}
const getDoctorName = (dp: unknown): string => {
  const d = getDoctorProfile(dp)
  const p = Array.isArray(d?.profiles) ? d.profiles[0] : d?.profiles
  return p?.full_name || ''
}
const initialsOf = (name: string): string =>
  name.trim().split(/\s+/).slice(0, 2).map(s => s[0] ?? '').join('').toUpperCase() || '—'

export default async function PatientDashboard() {
  const locale = await getLocale()
  // Round 14F-5 + R14F-7: bypass-aware session resolution. Real cookie
  // session always wins; if absent and AUTH_BYPASS=true with role
  // patient, we use the demo-patient seed UUID and a service-role
  // client so the data queries below see the seeded rows. The previous
  // `if (!user) redirect('/login')` was the loop source — middleware
  // sent us here from /login, then this page sent us back.
  const { userId, supabase, isBypass } = await getEffectiveSession('patient')

  if (!userId) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Real session: enforce role. Bypass: trust the role we resolved.
  if (!isBypass && (!profile || profile.role !== 'patient')) redirect(`/${locale}/login`)

  const t = await getTranslations('patient')
  const tStates = await getTranslations('dashboardStates')

  // Get active consultation
  const { data: activeConsultation } = await supabase
    .from('consultations')
    .select(`*, doctor_profiles(*, profiles(*))`)
    .eq('patient_id', userId)
    .in('status', ['pending', 'accepted', 'in_progress', 'arrived', 'en_route'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get recent consultations
  const { data: recentConsultations } = await supabase
    .from('consultations')
    .select(`*, doctor_profiles(*, profiles(*))`)
    .eq('patient_id', userId)
    .in('status', ['completed', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Get completed consultations within 48h (for post-consultation chat)
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const { data: chatConsultations } = await supabase
    .from('consultations')
    .select(`id, completed_at, doctor_profiles(*, profiles(*))`)
    .eq('patient_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', fortyEightHoursAgo)
    .order('completed_at', { ascending: false })
    .limit(3)

  // Get unread message counts for active chats
  let unreadCounts: Record<string, number> = {}
  let totalUnread = 0
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
      totalUnread = unreadMessages.length
    }
  }

  const firstName = profile.full_name?.split(' ')[0] || 'Usuario'

  // Doctor info for active consultation
  const activeDoctorName = activeConsultation
    ? getDoctorName(activeConsultation.doctor_profiles)
    : ''
  const activeDoctorSpecialty = (() => {
    if (!activeConsultation) return ''
    const d = getDoctorProfile(activeConsultation.doctor_profiles)
    return (d?.specialty || '').replace('_', ' ')
  })()
  const activeDoctorRating = (() => {
    if (!activeConsultation) return null
    const d = getDoctorProfile(activeConsultation.doctor_profiles)
    return typeof d?.rating === 'number' ? d.rating : null
  })()
  // Safe key lookup for status (falls back to raw key if missing)
  const statusKey = (s: string) => (`status.${s}` as const)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />

      <main className="container mx-auto px-4 py-5 max-w-md md:max-w-2xl">
        {/* ── 1A. Greeting + Bell ─────────────────── */}
        <div className="pt-3 px-1 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DashboardGreeting firstName={firstName} locale={locale} />
            </div>
            <button
              className="relative h-11 w-11 rounded-[14px] bg-white border border-border flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {totalUnread > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* ── 1B. Active Consultation Card (premium) ─────────────────── */}
        {activeConsultation && (
          <Link href={`/${locale}/patient/tracking/${activeConsultation.id}`} className="block mb-6">
            <div
              className="rounded-[20px] border border-[#E7EEF9] p-4"
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFCFF 100%)',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(59,130,246,0.06)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 bg-primary rounded-full animate-pulse" aria-hidden="true" />
                <span className="text-[13px] font-semibold text-primary">
                  {t(statusKey(activeConsultation.status))}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[52px] w-[52px] rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center relative">
                  <span className="text-primary font-semibold text-sm">
                    {initialsOf(activeDoctorName)}
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 h-[18px] w-[18px] bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold tracking-[-0.2px] truncate">
                    {activeDoctorName || '—'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[13px] text-muted-foreground truncate">
                      {activeDoctorSpecialty || '—'}
                    </span>
                    {activeDoctorRating !== null && (
                      <>
                        <span className="text-muted-foreground/50" aria-hidden="true">·</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-[11px] w-[11px] fill-amber-400 text-amber-400" aria-hidden="true" />
                          <span className="text-[11px] text-muted-foreground ml-0.5">
                            {activeDoctorRating.toFixed(1)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-center mb-3">
                <p className="text-[28px] font-bold text-emerald-600 tracking-[-1px] tabular-nums">~12 min</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t('dashboard.estimatedArrival')}
                </p>
              </div>
              <Button className="w-full h-12 text-[15px] font-semibold shadow-md shadow-primary/25">
                {t('dashboard.trackDoctor')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </Link>
        )}

        {/* Post-consultation chat banner (retained — valuable UX) */}
        {chatConsultations && chatConsultations.length > 0 && (
          <div className="rounded-[14px] border border-[#EEF1F5] bg-white shadow-sm p-3 mb-6">
            {chatConsultations.map((c: { id: string; doctor_profiles: unknown }) => {
              const doctorName = getDoctorName(c.doctor_profiles)
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
          </div>
        )}

        {/* ── 1C. Quick Actions Grid (3 columns) ─────────────────── */}
        <div className="grid grid-cols-3 gap-[10px] mb-6">
          <Link href={`/${locale}/patient/request`}>
            <div className="bg-primary text-white rounded-2xl p-3.5 hover:bg-primary/90 transition-colors h-full">
              <div className="h-[34px] w-[34px] bg-white/20 rounded-[10px] flex items-center justify-center mb-2">
                <Zap className="h-4 w-4" />
              </div>
              <p className="text-[12.5px] font-semibold tracking-[-0.1px]">
                {t('dashboard.newConsult')}
              </p>
            </div>
          </Link>
          <Link href={`/${locale}/patient/profile`}>
            <div className="bg-white border border-border rounded-2xl p-3.5 hover:bg-gray-50 transition-colors h-full">
              <div className="h-[34px] w-[34px] bg-[#F1F5FB] rounded-[10px] flex items-center justify-center mb-2">
                <User className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[12.5px] font-semibold tracking-[-0.1px] text-foreground">
                {t('dashboard.profile')}
              </p>
            </div>
          </Link>
          <Link href={`/${locale}/patient/history`}>
            <div className="bg-white border border-border rounded-2xl p-3.5 hover:bg-gray-50 transition-colors h-full">
              <div className="h-[34px] w-[34px] bg-[#F1F5FB] rounded-[10px] flex items-center justify-center mb-2">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[12.5px] font-semibold tracking-[-0.1px] text-foreground">
                {t('dashboard.invoices')}
              </p>
            </div>
          </Link>
        </div>

        {/* ── 1D. Past Consultations ─────────────────── */}
        {recentConsultations && recentConsultations.length > 0 && (
          <div className="space-y-3 mb-6">
            <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-foreground">
              {t('dashboard.pastConsultations')}
            </h2>
            {recentConsultations.slice(0, 3).map((c: Consultation & { doctor_profiles?: unknown }) => {
              const doctorName = getDoctorName(c.doctor_profiles) || ''
              const service = getService(c.service_type)
              const rating = (c as unknown as { rating?: number | null }).rating || 0
              const typeLabel = service?.label || ''
              return (
                <Link key={c.id} href={`/${locale}/patient/tracking/${c.id}`}>
                  <div className="bg-white border border-[#EEF1F5] rounded-[14px] p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/15 to-primary/30 flex items-center justify-center">
                      <span className="text-primary font-semibold text-xs">
                        {doctorName ? initialsOf(doctorName) : (service?.icon || '—')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold tracking-[-0.1px] truncate">
                        {doctorName || typeLabel}
                      </p>
                      <p className="text-[12.5px] text-muted-foreground">
                        {typeLabel} · {formatRelativeDate(c.created_at)}
                      </p>
                    </div>
                    {rating > 0 ? (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star
                            key={i}
                            className={`h-[11px] w-[11px] ${
                              i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    ) : (
                      <Badge className="text-[10px]">
                        {t(statusKey(c.status))}
                      </Badge>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
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
