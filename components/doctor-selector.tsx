'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { DoctorCardSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { useBookingStore } from '@/stores/booking-store'
import { Star, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterKey = 'all' | 'available' | 'top' | 'nearest'

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
  const [filter, setFilter] = useState<FilterKey>('all')
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

  // Client-side sort per filter chip. We don't refetch — keeps UX snappy.
  const sortedDoctors = useMemo(() => {
    const copy = [...doctors]
    if (filter === 'top') {
      copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    } else if (filter === 'nearest') {
      copy.sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity))
    } else if (filter === 'available') {
      // "Available" here means soonest (low distance proxy for ETA)
      copy.sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity))
    }
    return copy
  }, [doctors, filter])

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

  const filters: Array<{ key: FilterKey; label: string }> = [
    { key: 'all',       label: t('filter.all') },
    { key: 'available', label: t('filter.available') },
    { key: 'top',       label: t('filter.top') },
    { key: 'nearest',   label: t('filter.nearest') },
  ]

  // Approximate ETA: 1.5 min per km (city avg) + 10 min base; rounded to 5.
  const etaFromDistance = (km?: number) =>
    typeof km === 'number' ? Math.max(5, Math.round((10 + km * 1.5) / 5) * 5) : null

  // Ibiza local hour window for night pricing (22:00–07:59)
  const [isNightHour, setIsNightHour] = useState(false)
  useEffect(() => {
    const h = new Date().getHours()
    setIsNightHour(h >= 22 || h < 8)
  }, [])

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        {t('found', { count: doctors.length })}
      </p>

      {/* Filter rail — horizontal scroll chips (prototype §step2) */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {filters.map(f => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'shrink-0 px-5 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap min-h-[32px]',
                active
                  ? 'bg-primary text-white border border-primary'
                  : 'bg-white text-muted-foreground border border-border hover:border-primary/40',
              )}
              aria-pressed={active}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {sortedDoctors.map(d => {
        const isSelected = selectedDoctorId === d.id
        const initials = d.full_name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase()
        const eta = etaFromDistance(d.distance_km)
        // Night price support (ITEM 13): if current Ibiza hour is in night
        // window (22:00–07:59) and doctor has night_price, use it.
        const dAny = d as unknown as { night_price?: number | null }
        const displayPriceCents = isNightHour && typeof dAny.night_price === 'number'
          ? dAny.night_price
          : d.consultation_price
        // We store whatever price the doctor will actually be charged so the
        // booking store stays consistent with the render (step 2 summary + step 3 order).
        const storedPriceCents = displayPriceCents
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => {
              setSelectedDoctor(d.id, d.full_name, storedPriceCents, d.specialty)
              onSelect?.(d)
            }}
            className={cn(
              'w-full rounded-card border p-3.5 text-left transition-all min-h-[44px]',
              isSelected
                ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-card'
                : 'border-border bg-card card-hover hover:border-primary/40',
            )}
            aria-pressed={isSelected}
          >
            <div className="flex items-start gap-3.5">
              {/* Avatar 54px with verified badge (prototype §step2) */}
              <div className="relative flex-shrink-0">
                <div className="h-[54px] w-[54px] rounded-full bg-gradient-to-br from-primary/20 to-primary/40 text-primary-foreground font-display font-semibold text-base flex items-center justify-center">
                  <span className="text-primary">{initials}</span>
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 h-[18px] w-[18px] rounded-full bg-emerald-500 border-[2.5px] border-background flex items-center justify-center text-white"
                  aria-label={t('verified')}
                >
                  <Check className="h-[10px] w-[10px]" aria-hidden="true" strokeWidth={3} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {/* Nombre: 15px / 600 / -0.2px */}
                    <p className="font-semibold text-[15px] tracking-[-0.2px] truncate">
                      {d.full_name}
                    </p>
                    {/* Especialidad: 12.5px */}
                    <p className="text-[12.5px] text-muted-foreground mt-0.5 truncate leading-snug">
                      {d.specialty?.replace('_', ' ')}{d.city ? ` · ${d.city}` : ''}
                    </p>
                  </div>
                  {typeof displayPriceCents === 'number' && (
                    <div className="text-right flex-shrink-0">
                      {/* Precio: 15px / 700 / -0.2px */}
                      <div className="font-bold text-[15px] tracking-[-0.2px]">
                        €{(displayPriceCents / 100).toFixed(0)}
                      </div>
                      {isNightHour && typeof dAny.night_price === 'number' && (
                        <div className="text-[9.5px] font-semibold text-amber-600 tracking-wide uppercase mt-0.5">
                          Noche
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2.5">
                  {typeof d.rating === 'number' && d.rating > 0 && (
                    <span className="inline-flex items-center gap-1 text-[12px]">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span className="font-semibold text-foreground">{d.rating.toFixed(1)}</span>
                      {typeof d.total_reviews === 'number' && (
                        <span className="text-muted-foreground/70 font-normal">({d.total_reviews})</span>
                      )}
                    </span>
                  )}
                  {eta !== null && (
                    <>
                      <span className="text-muted-foreground/50" aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        ~{eta} min
                      </span>
                    </>
                  )}
                </div>

                {/* Language badges — prototype tokens */}
                <div className="mt-2 flex gap-1">
                  <span className="inline-flex items-center bg-[#F1F5F9] text-[10.5px] font-semibold text-[#475569] tracking-[0.3px] px-[7px] py-[3px] rounded-[6px]">
                    ES
                  </span>
                  <span className="inline-flex items-center bg-[#F1F5F9] text-[10.5px] font-semibold text-[#475569] tracking-[0.3px] px-[7px] py-[3px] rounded-[6px]">
                    EN
                  </span>
                </div>
              </div>
            </div>

            {/* 2C: Expanding mini confirmation bar when selected */}
            <div
              className={cn(
                'overflow-hidden transition-[max-height,opacity,margin] duration-200',
                isSelected ? 'max-h-[44px] opacity-100 mt-2.5' : 'max-h-0 opacity-0 mt-0',
              )}
            >
              <div className="bg-primary/5 rounded-[10px] px-3 py-2.5 flex items-center gap-2">
                <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-[12.5px] font-medium text-primary">
                  {t('selected')}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
