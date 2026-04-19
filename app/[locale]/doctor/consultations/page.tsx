'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/shared/navbar'
import type { Profile as ProfileType } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { MessageCircle, MapPin, Calendar, CheckCircle, Clock, Stethoscope } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

type FilterStatus = 'all' | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

interface Consultation {
  id: string
  patient_id: string
  type: string
  status: string
  service_type: string
  symptoms: string
  address: string
  scheduled_at: string | null
  created_at: string
  price: number | null
  patient?: { full_name: string | null; email: string | null }
}

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'secondary'> = {
  pending: 'warning',
  accepted: 'info',
  in_progress: 'info',
  arrived: 'info',
  completed: 'success',
  cancelled: 'destructive',
}

export default function DoctorConsultationsPage() {
  const t = useTranslations('consultations')
  const tCommon = useTranslations('doctor')
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<{ id: string; full_name: string; role: string } | null>(null)
  const [doctorProfileId, setDoctorProfileId] = useState<string | null>(null)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push(`/${locale}/login`); return }

      const profileRes = await supabase.from('profiles').select('id, full_name, role').eq('id', session.user.id).single()
      if (!profileRes.data || profileRes.data.role !== 'doctor') {
        router.push(`/${locale}/login`); return
      }
      setProfile(profileRes.data)

      const dpRes = await supabase.from('doctor_profiles').select('id').eq('user_id', session.user.id).single()
      if (!dpRes.data) { router.push(`/${locale}/doctor/onboarding`); return }
      const dpId = dpRes.data.id
      setDoctorProfileId(dpId)

      const { data } = await supabase
        .from('consultations')
        .select('id, patient_id, type, status, service_type, symptoms, address, scheduled_at, created_at, price, patient:profiles!consultations_patient_id_fkey(full_name, email)')
        .eq('doctor_id', dpId)
        .order('created_at', { ascending: false })

      setConsultations((data || []) as unknown as Consultation[])
      setLoading(false)

      // Realtime subscription
      channel = supabase
        .channel('doctor-consultations')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'consultations', filter: `doctor_id=eq.${dpId}` },
          async () => {
            const { data: refresh } = await supabase
              .from('consultations')
              .select('id, patient_id, type, status, service_type, symptoms, address, scheduled_at, created_at, price, patient:profiles!consultations_patient_id_fkey(full_name, email)')
              .eq('doctor_id', dpId)
              .order('created_at', { ascending: false })
            setConsultations((refresh || []) as unknown as Consultation[])
          }
        )
        .subscribe()
    }

    load()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase, router, locale])

  const acceptConsultation = async (id: string) => {
    if (!doctorProfileId) return
    await supabase
      .from('consultations')
      .update({ doctor_id: doctorProfileId, status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', id)
  }

  const transitionStatus = async (id: string, newStatus: 'in_progress' | 'arrived' | 'completed') => {
    const patch: Record<string, unknown> = { status: newStatus }
    const now = new Date().toISOString()
    if (newStatus === 'in_progress') patch.started_at = now
    if (newStatus === 'completed') patch.completed_at = now
    await supabase.from('consultations').update(patch).eq('id', id)
  }

  const filtered = filter === 'all'
    ? consultations
    : consultations.filter(c => c.status === filter || (filter === 'in_progress' && (c.status === 'in_progress' || c.status === 'arrived')))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md space-y-3" aria-busy="true" aria-label="Loading"><div className="h-8 w-2/3 skeleton-shimmer rounded-md" /><div className="h-24 skeleton-shimmer rounded-card" /><div className="h-24 skeleton-shimmer rounded-card" /></div>
      </div>
    )
  }

  if (!profile) return null

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: t('filterAll') },
    { key: 'pending', label: t('filterPending') },
    { key: 'accepted', label: t('filterConfirmed') },
    { key: 'in_progress', label: t('filterInProgress') },
    { key: 'completed', label: t('filterCompleted') },
    { key: 'cancelled', label: t('filterCancelled') },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile as unknown as ProfileType} />
      <main className="container mx-auto max-w-3xl px-4 py-8 fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map(f => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.key)}
              className="shrink-0"
            >
              {f.label}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title={t('noConsultations')}
            description={t('noConsultationsDesc')}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(c => {
              const when = c.scheduled_at ? new Date(c.scheduled_at) : new Date(c.created_at)
              const isActive = c.status === 'accepted' || c.status === 'in_progress' || c.status === 'arrived'
              const isPending = c.status === 'pending'
              return (
                <Card key={c.id} className="border-0 shadow-sm card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{c.patient?.full_name || t('patientName')}</p>
                          <Badge variant={STATUS_COLORS[c.status] || 'secondary'} className="text-xs">
                            {c.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{c.service_type?.replace('_', ' ')}</p>
                      </div>
                      {c.price != null && (
                        <span className="text-sm font-semibold text-gray-900">€{(c.price / 100).toFixed(2)}</span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span>{when.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-500" />
                        <span className="truncate">{c.address}</span>
                      </div>
                      {c.symptoms && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">{c.symptoms}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {isPending && (
                        <Button size="sm" onClick={() => acceptConsultation(c.id)} className="gap-2">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {t('accept')}
                        </Button>
                      )}
                      {c.status === 'accepted' && (
                        <Button size="sm" variant="outline" onClick={() => transitionStatus(c.id, 'in_progress')}>
                          {t('onRoute')}
                        </Button>
                      )}
                      {c.status === 'in_progress' && (
                        <Button size="sm" variant="outline" onClick={() => transitionStatus(c.id, 'arrived')}>
                          {t('arrived')}
                        </Button>
                      )}
                      {c.status === 'arrived' && (
                        <Button size="sm" onClick={() => transitionStatus(c.id, 'completed')}>
                          {t('complete')}
                        </Button>
                      )}
                      {isActive && (
                        <Link href={`/${locale}/consultation/${c.id}/chat`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {t('chat')}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
