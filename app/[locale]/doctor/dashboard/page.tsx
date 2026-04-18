"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { getStatusLabel, formatCurrencyFromEuros, formatRelativeDate, getService, calculateDistance, estimateArrivalTime } from '@/lib/utils'
import { Zap, MapPin, Clock, TrendingUp, Star, CheckCircle, XCircle, Navigation, MessageCircle, ChevronRight } from 'lucide-react'
import type { Profile, DoctorProfile, Consultation } from '@/types'

export default function DoctorDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('doctor')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [pendingRequests, setPendingRequests] = useState<Consultation[]>([])
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null)
  const [earnings, setEarnings] = useState({ today: 0, week: 0, total: 0 })
  const [activeChats, setActiveChats] = useState<Array<{ id: string; completed_at: string; patient_name: string; unread: number }>>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [accepting, setAccepting] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${locale}/login`); return }

    const [profileRes, doctorRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('doctor_profiles').select('*').eq('user_id', user.id).single(),
    ])

    if (!profileRes.data || profileRes.data.role !== 'doctor') {
      router.push(`/${locale}/login`); return
    }

    setProfile(profileRes.data)
    setDoctorProfile(doctorRes.data)

    if (doctorRes.data) {
      // Pending requests (unassigned)
      const { data: requests } = await supabase
        .from('consultations')
        .select(`*, profiles!patient_id(*)`)
        .eq('status', 'pending')
        .eq('type', 'urgent')
        .is('doctor_id', null)
        .order('created_at', { ascending: true })
        .limit(10)

      setPendingRequests(requests || [])

      // Active consultation
      const { data: active } = await supabase
        .from('consultations')
        .select(`*, profiles!patient_id(*)`)
        .eq('doctor_id', doctorRes.data.id)
        .in('status', ['accepted', 'in_progress', 'arrived'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setActiveConsultation(active)

      // Earnings
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString()

      const { data: allPayouts } = await supabase
        .from('consultations')
        .select('doctor_amount, completed_at')
        .eq('doctor_id', doctorRes.data.id)
        .eq('status', 'completed')
        .not('doctor_amount', 'is', null)

      if (allPayouts) {
        const todayEarnings = allPayouts
          .filter(p => p.completed_at >= todayStart)
          .reduce((sum, p) => sum + (p.doctor_amount || 0), 0)
        const weekEarnings = allPayouts
          .filter(p => p.completed_at >= weekStart)
          .reduce((sum, p) => sum + (p.doctor_amount || 0), 0)
        const totalEarnings = allPayouts.reduce((sum, p) => sum + (p.doctor_amount || 0), 0)

        setEarnings({
          today: todayEarnings / 100,
          week: weekEarnings / 100,
          total: totalEarnings / 100,
        })
      }

      // Active chats (completed consultations within 48h)
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      const { data: chatConsultations } = await supabase
        .from('consultations')
        .select(`id, completed_at, patient_id, profiles!patient_id(full_name)`)
        .eq('doctor_id', doctorRes.data.id)
        .eq('status', 'completed')
        .gte('completed_at', fortyEightHoursAgo)
        .order('completed_at', { ascending: false })
        .limit(5)

      if (chatConsultations && chatConsultations.length > 0) {
        const chatIds = chatConsultations.map(c => c.id)
        const { data: unreadMessages } = await supabase
          .from('consultation_messages')
          .select('consultation_id')
          .in('consultation_id', chatIds)
          .eq('sender_role', 'patient')
          .is('read_at', null)

        const unreadMap: Record<string, number> = {}
        if (unreadMessages) {
          unreadMessages.forEach(msg => {
            unreadMap[msg.consultation_id] = (unreadMap[msg.consultation_id] || 0) + 1
          })
        }

        setActiveChats(chatConsultations.map(c => ({
          id: c.id,
          completed_at: c.completed_at as string,
          patient_name: (c as unknown as { profiles?: { full_name?: string } }).profiles?.full_name || '',
          unread: unreadMap[c.id] || 0,
        })))
      } else {
        setActiveChats([])
      }
    }
    setLoading(false)
  }, [router, locale])

  useEffect(() => {
    fetchData()

    const supabase = createClient()
    // Realtime: new consultation requests
    const channel = supabase
      .channel('doctor_requests')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'consultations',
      }, () => fetchData())
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'consultations',
      }, () => fetchData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchData])

  const toggleAvailability = async () => {
    if (!doctorProfile) return
    setToggling(true)
    const supabase = createClient()

    // Get current location when going online
    let lat = doctorProfile.current_lat
    let lng = doctorProfile.current_lng

    if (!doctorProfile.is_available) {
      await new Promise<void>((resolve) => {
        navigator.geolocation?.getCurrentPosition(
          (pos) => { lat = pos.coords.latitude; lng = pos.coords.longitude; resolve() },
          () => resolve()
        )
      })
    }

    const { error } = await supabase
      .from('doctor_profiles')
      .update({
        is_available: !doctorProfile.is_available,
        current_lat: lat,
        current_lng: lng,
      })
      .eq('id', doctorProfile.id)

    if (!error) {
      setDoctorProfile(prev => prev ? {
        ...prev,
        is_available: !prev.is_available,
        current_lat: lat,
        current_lng: lng
      } : null)
      toast({
        title: !doctorProfile.is_available ? t('dashboard.toastAvailableTitle') : t('dashboard.toastUnavailableTitle'),
        description: !doctorProfile.is_available
          ? t('dashboard.toastAvailableDesc')
          : t('dashboard.toastUnavailableDesc'),
        variant: !doctorProfile.is_available ? 'success' : 'default',
      })
    }
    setToggling(false)
  }

  const acceptRequest = async (consultationId: string) => {
    if (!doctorProfile) return
    setAccepting(consultationId)
    const supabase = createClient()

    let lat = doctorProfile.current_lat
    let lng = doctorProfile.current_lng
    navigator.geolocation?.getCurrentPosition(pos => {
      lat = pos.coords.latitude
      lng = pos.coords.longitude
    })

    const { error } = await supabase
      .from('consultations')
      .update({
        doctor_id: doctorProfile.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', consultationId)
      .is('doctor_id', null) // Prevent double-accepting

    if (error) {
      toast({ title: t('dashboard.toastAlreadyTakenTitle'), description: t('dashboard.toastAlreadyTakenDesc'), variant: 'destructive' })
    } else {
      toast({ title: t('dashboard.toastAcceptedTitle'), description: t('dashboard.toastAcceptedDesc'), variant: 'success' })
      fetchData()
    }
    setAccepting(null)
  }

  const updateConsultationStatus = async (consultationId: string, status: string) => {
    const supabase = createClient()
    const updates: Record<string, string> = { status }
    if (status === 'in_progress') updates.started_at = new Date().toISOString()
    if (status === 'arrived') {/* already in_progress -> arrived */ }
    if (status === 'completed') updates.completed_at = new Date().toISOString()

    await supabase.from('consultations').update(updates).eq('id', consultationId)

    // Update doctor location
    if (doctorProfile && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        supabase.from('doctor_profiles').update({
          current_lat: pos.coords.latitude,
          current_lng: pos.coords.longitude,
        }).eq('id', doctorProfile.id)
      })
    }

    fetchData()
    toast({ title: `${t('dashboard.statusUpdate')}: ${getStatusLabel(status as never)}`, variant: 'success' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!profile || !doctorProfile) return null

  const isVerified = doctorProfile.verification_status === 'verified'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />

      <main className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Verification alert */}
        {!isVerified && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <p className="font-semibold text-amber-800">{t('dashboard.verificationPending')}</p>
              <p className="text-sm text-amber-700">{t('dashboard.verificationPendingDesc')}</p>
            </div>
          </div>
        )}

        {/* Availability toggle - UBER STYLE */}
        <Card className="border-0 shadow-lg mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className={`p-6 transition-colors ${doctorProfile.is_available ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {doctorProfile.is_available ? `🟢 ${t('dashboard.available')}` : `⚫ ${t('dashboard.unavailable')}`}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {doctorProfile.is_available
                      ? t('dashboard.activeStatus')
                      : t('dashboard.inactiveStatus')}
                  </p>
                </div>
                <button
                  onClick={toggleAvailability}
                  disabled={toggling || !isVerified}
                  className={`relative inline-flex h-14 w-24 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                    doctorProfile.is_available
                      ? 'bg-green-500 focus:ring-green-500'
                      : 'bg-gray-300 focus:ring-gray-300'
                  }`}
                >
                  <span className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform ${
                    doctorProfile.is_available ? 'translate-x-12' : 'translate-x-2'
                  }`} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: t('dashboard.todayEarnings'), value: formatCurrencyFromEuros(earnings.today), icon: Zap },
            { label: t('earnings.thisWeek'), value: formatCurrencyFromEuros(earnings.week), icon: TrendingUp },
            { label: t('earnings.total'), value: formatCurrencyFromEuros(earnings.total), icon: Star },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <stat.icon className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                <p className="font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active consultation */}
        {activeConsultation && (
          <Card className="border-0 shadow-lg mb-6 border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-blue-700">{t('dashboard.activeConsultation')}</CardTitle>
                <Badge variant="info">{getStatusLabel(activeConsultation.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{activeConsultation.address}</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                <strong>{t('dashboard.symptoms')}:</strong> {activeConsultation.symptoms}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {activeConsultation.status === 'accepted' && (
                  <Button
                    onClick={() => updateConsultationStatus(activeConsultation.id, 'in_progress')}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    {t('dashboard.startRoute')}
                  </Button>
                )}
                {activeConsultation.status === 'in_progress' && (
                  <Button
                    onClick={() => updateConsultationStatus(activeConsultation.id, 'arrived')}
                    size="sm"
                    variant="success"
                  >
                    {t('dashboard.arrived')}
                  </Button>
                )}
                {activeConsultation.status === 'arrived' && (
                  <Button
                    onClick={() => updateConsultationStatus(activeConsultation.id, 'completed')}
                    size="sm"
                    variant="success"
                    className="col-span-2"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('dashboard.completeConsultation')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active chats (post-consultation) */}
        {activeChats.length > 0 && (
          <Card className="border-0 shadow-md mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                {t('dashboard.activeChats')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeChats.map((chat) => (
                  <Link key={chat.id} href={`/${locale}/consultation/${chat.id}/chat`}>
                    <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {chat.patient_name?.substring(0, 2).toUpperCase() || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-gray-900">{chat.patient_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {chat.unread > 0 && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 min-w-[20px] text-center">
                            {chat.unread}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending requests */}
        {doctorProfile.is_available && pendingRequests.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">
              {t('dashboard.nearbyRequests')} ({pendingRequests.length})
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((req) => {
                const service = getService(req.service_type)
                const patient = (req as Consultation & { profiles?: { full_name: string } }).profiles
                const dist = doctorProfile.current_lat && req.lat
                  ? calculateDistance(doctorProfile.current_lat, doctorProfile.current_lng!, req.lat, req.lng)
                  : null
                const eta = dist ? estimateArrivalTime(dist) : null

                return (
                  <Card key={req.id} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl flex-shrink-0">{service?.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">{service?.label}</p>
                              <Badge variant={req.type === 'urgent' ? 'destructive' : 'success'} className="text-xs">
                                {req.type === 'urgent' ? `🚨 ${t('dashboard.urgent')}` : `📅 ${t('dashboard.scheduled')}`}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">{req.symptoms}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              {dist && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{dist.toFixed(1)} km</span>}
                              {eta && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />~{eta} min</span>}
                              {req.doctor_amount && (
                                <span className="text-green-600 font-semibold">
                                  +{formatCurrencyFromEuros(req.doctor_amount / 100)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => acceptRequest(req.id)}
                          loading={accepting === req.id}
                          size="sm"
                          className="flex-shrink-0"
                        >
                          {t('dashboard.accept')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {doctorProfile.is_available && pendingRequests.length === 0 && !activeConsultation && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">⏳</div>
            <p className="font-medium text-gray-600">{t('dashboard.noRequests')}</p>
            <p className="text-sm mt-1">{t('dashboard.noRequestsDesc')}</p>
          </div>
        )}

        {!doctorProfile.is_available && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">😴</div>
            <p className="font-medium text-gray-600">{t('dashboard.restMode')}</p>
            <p className="text-sm mt-1">{t('dashboard.restModeDesc')}</p>
          </div>
        )}

      </main>
    </div>
  )
}
