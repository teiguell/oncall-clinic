'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { DoctorCardSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { useBookingStore } from '@/stores/booking-store'
import { Star, ShieldCheck, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Doctor {
  id: string
  user_id: string
  full_name: string
  specialty: string
  bio: string | null
  rating: number | null
  total_reviews: number | null
  city: string | null
  consultation_price: number | null
  current_lat: number | null
  current_lng: number | null
  avatar_url: string | null
  distance_km?: number
}

interface DoctorSelectorProps {
  patientLat: number
  patientLng: number
  onSelect?: (doctor: Doctor) => void
}

/**
 * DoctorSelector — lists nearby available doctors and lets the user pick one.
 * Tries `find_nearest_doctors` RPC first; falls back to a plain query if the
 * RPC isn't available. Shows 3 skeleton cards while loading.
 */
export function DoctorSelector({ patientLat, patientLng, onSelect }: DoctorSelectorProps) {
  const t = useTranslations('doctorSelector')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const selectedDoctorId = useBookingStore(s => s.selectedDoctorId)
  const setSelectedDoctor = useBookingStore(s => s.setSelectedDoctor)

  const load = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    // Try RPC first
    const rpcRes = await supabase.rpc('find_nearest_doctors', {
      lat_in: patientLat,
      lng_in: patientLng,
      radius_km: 50,
    }).then(r => r, () => null)

    let candidateIds: Array<{ id: string; distance_km?: number }> = []
    if (rpcRes && !rpcRes.error && Array.isArray(rpcRes.data)) {
      candidateIds = rpcRes.data.map((r: { id: string; distance_km?: number }) => ({
        id: r.id,
        distance_km: r.distance_km,
      }))
    }

    // Fallback: plain query
    let query = supabase
      .from('doctor_profiles')
      .select(`
        id, user_id, specialty, bio, rating, total_reviews,
        current_lat, current_lng, city, consultation_price,
        profiles!inner(full_name, avatar_url)
      `)
      .eq('is_available', true)
      .eq('verification_status', 'verified')

    if (candidateIds.length > 0) {
      query = query.in('id', candidateIds.map(c => c.id))
    } else {
      query = query.limit(10)
    }

    const { data, error: queryError } = await query
    if (queryError) {
      setError(queryError.message)
      setLoading(false)
      return
    }

    type Row = {
      id: string
      user_id: string
      specialty: string
      bio: string | null
      rating: number | null
      total_reviews: number | null
      current_lat: number | null
      current_lng: number | null
      city: string | null
      consultation_price: number | null
      profiles: { full_name: string | null; avatar_url: string | null }
        | Array<{ full_name: string | null; avatar_url: string | null }>
    }
    const rows = (data || []) as unknown as Row[]
    const getProfile = (r: Row) =>
      Array.isArray(r.profiles) ? r.profiles[0] : r.profiles

    const mapped: Doctor[] = rows.map(r => {
      const p = getProfile(r)
      return {
        id: r.id,
        user_id: r.user_id,
        full_name: p?.full_name || '—',
        specialty: r.specialty,
        bio: r.bio,
        rating: r.rating,
        total_reviews: r.total_reviews,
        city: r.city,
        consultation_price: r.consultation_price,
        current_lat: r.current_lat,
        current_lng: r.current_lng,
        avatar_url: p?.avatar_url || null,
        distance_km: candidateIds.find(c => c.id === r.id)?.distance_km,
      }
    })

    setDoctors(mapped)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientLat, patientLng])

  if (loading) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">{t('searching')}</p>
        <DoctorCardSkeleton />
        <DoctorCardSkeleton />
        <DoctorCardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        icon="server"
        title={t('error')}
        description={error}
        onRetry={load}
        retryLabel={t('retry')}
        showPhone
        phoneLabel={t('callUs')}
      />
    )
  }

  if (doctors.length === 0) {
    return (
      <ErrorState
        icon="alert"
        title={t('noDoctors')}
        description=""
        showPhone
        phoneLabel={t('callUs')}
      />
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        {t('found', { count: doctors.length })}
      </p>
      {doctors.map(d => {
        const isSelected = selectedDoctorId === d.id
        const initials = d.full_name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase()
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => {
              setSelectedDoctor(d.id, d.full_name)
              onSelect?.(d)
            }}
            className={cn(
              'w-full rounded-card border-2 p-4 text-left transition-all min-h-[44px]',
              isSelected
                ? 'border-primary bg-primary/5 shadow-card'
                : 'border-border bg-card card-hover hover:border-primary/40',
            )}
            aria-pressed={isSelected}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary font-display font-semibold flex items-center justify-center shrink-0">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-semibold text-sm truncate">{d.full_name}</span>
                  <span className="pill-success">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    {t('verified')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {d.specialty?.replace('_', ' ')} · {d.city}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  {typeof d.rating === 'number' && d.rating > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span className="font-medium text-foreground">{d.rating.toFixed(1)}</span>
                      {typeof d.total_reviews === 'number' && (
                        <span>({d.total_reviews})</span>
                      )}
                    </span>
                  )}
                  {typeof d.distance_km === 'number' && (
                    <span>{d.distance_km.toFixed(1)} km</span>
                  )}
                  {typeof d.consultation_price === 'number' && (
                    <span className="font-display font-semibold text-foreground">
                      €{(d.consultation_price / 100).toFixed(0)}
                    </span>
                  )}
                </div>
                {d.bio && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{d.bio}</p>
                )}
              </div>

              {isSelected && (
                <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
