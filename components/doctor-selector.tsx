'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { DoctorCardSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { useBookingStore } from '@/stores/booking-store'
import { Star, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { estimatedEta } from '@/lib/eta'
import { DistanceBadge } from '@/components/shared/distance-badge'

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
  // Round 15B-3: clinic branding ("Dr. X — Clínica Y" + verified badge)
  clinic_id?: string | null
  clinic_name?: string | null
  is_clinic_priority?: boolean
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
  // BUG FIX P0 #1 (Rules of Hooks): MUST be declared before any early-return.
  // Used only in the "data loaded" branch but React requires the same
  // hook count on every render of the same component instance.
  const [isNightHour, setIsNightHour] = useState(false)
  // Round 7 P1-E: only one card may be expanded at a time. null = none.
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const selectedDoctorId = useBookingStore(s => s.selectedDoctorId)
  const setSelectedDoctor = useBookingStore(s => s.setSelectedDoctor)

  const load = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    // Try RPC first. Round 15B-3: RPC now returns clinic_id + clinic_name +
    // is_clinic_priority columns we surface in the card UI.
    const rpcRes = await supabase.rpc('find_nearest_doctors', {
      lat_in: patientLat,
      lng_in: patientLng,
      radius_km: 50,
    }).then(r => r, () => null)

    type RpcRow = {
      id: string
      distance_km?: number
      clinic_id?: string | null
      clinic_name?: string | null
      is_clinic_priority?: boolean
    }
    let candidateIds: Array<{ id: string; distance_km?: number; clinic_id?: string | null; clinic_name?: string | null; is_clinic_priority?: boolean }> = []
    if (rpcRes && !rpcRes.error && Array.isArray(rpcRes.data)) {
      candidateIds = (rpcRes.data as RpcRow[]).map((r) => ({
        id: r.id,
        distance_km: r.distance_km,
        clinic_id: r.clinic_id,
        clinic_name: r.clinic_name,
        is_clinic_priority: r.is_clinic_priority,
      }))
    }

    // Fallback: plain query.
    // activation_status filter (Round 14 follow-up, migration 021/024).
    let query = supabase
      .from('doctor_profiles')
      .select(`
        id, user_id, specialty, bio, rating, total_reviews,
        current_lat, current_lng, city, consultation_price,
        profiles!inner(full_name, avatar_url)
      `)
      .eq('is_available', true)
      .eq('verification_status', 'verified')
      .eq('activation_status', 'active')

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
      const rpcMatch = candidateIds.find(c => c.id === r.id)
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
        distance_km: rpcMatch?.distance_km,
        // Round 15B-3: clinic branding
        clinic_id: rpcMatch?.clinic_id ?? null,
        clinic_name: rpcMatch?.clinic_name ?? null,
        is_clinic_priority: rpcMatch?.is_clinic_priority ?? false,
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

  // BUG FIX P0 #1: isNightHour effect BEFORE early-returns (Rules of Hooks).
  // new Date() ONLY inside useEffect → no SSR/CSR hydration mismatch.
  useEffect(() => {
    const h = new Date().getHours()
    setIsNightHour(h >= 22 || h < 8)
  }, [])

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

  // Round 7 Fix A (M1, M3): switched from local etaFromDistance to shared
  // `lib/eta.ts` helper so the same model is used by all surfaces. The new
  // model is 30 km/h avg — empirically closer to Ibiza traffic than the
  // previous "10 min base + 1.5 min/km" formula on long trips.

  // Note: isNightHour state + its useEffect now live at the top of the
  // component (pre early-returns) to comply with Rules of Hooks.

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
        const isExpanded = expandedId === d.id
        const initials = d.full_name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase()
        const eta = estimatedEta(d.distance_km)
        // Night price support (ITEM 13): if current Ibiza hour is in night
        // window (22:00–07:59) and doctor has night_price, use it.
        const dAny = d as unknown as { night_price?: number | null }
        const displayPriceCents = isNightHour && typeof dAny.night_price === 'number'
          ? dAny.night_price
          : d.consultation_price
        // We store whatever price the doctor will actually be charged so the
        // booking store stays consistent with the render (step 2 summary + step 3 order).
        const storedPriceCents = displayPriceCents
        const handleSelect = () => {
          setSelectedDoctor(d.id, d.full_name, storedPriceCents, d.specialty)
          onSelect?.(d)
        }
        // Round 7 P1-E: card root is now <div role="button"> so we can nest
        // the real <button> chevron. Enter / Space mirror click for keyboard.
        return (
          <div
            key={d.id}
            role="button"
            tabIndex={0}
            onClick={handleSelect}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSelect()
              }
            }}
            className={cn(
              'w-full rounded-card border p-3.5 text-left transition-all min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              isSelected
                ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-card'
                : 'border-border bg-card card-hover hover:border-primary/40',
            )}
            aria-pressed={isSelected}
            aria-expanded={isExpanded}
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
                    {/* Nombre: 15px / 600 / -0.2px. Round 15B-3: include clinic name when present. */}
                    <p className="font-semibold text-[15px] tracking-[-0.2px] truncate">
                      {d.full_name}
                      {d.clinic_name && (
                        <span className="text-indigo-600 font-medium"> — {d.clinic_name}</span>
                      )}
                    </p>
                    {/* Especialidad + verified-clinic badge */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[12.5px] text-muted-foreground truncate leading-snug">
                        {d.specialty?.replace('_', ' ')}{d.city ? ` · ${d.city}` : ''}
                      </p>
                      {d.is_clinic_priority && (
                        <span
                          className="inline-flex items-center bg-indigo-50 text-indigo-700 text-[10px] font-semibold tracking-[0.3px] px-[6px] py-[2px] rounded-[6px] flex-shrink-0"
                          title={t('clinicVerified')}
                        >
                          {t('clinicVerified')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 flex-shrink-0">
                    {typeof displayPriceCents === 'number' && (
                      <div className="text-right">
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
                    {/* Round 7 P1-E: chevron-expand button. stopPropagation
                        so it doesn't trigger the card's select handler. */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedId(isExpanded ? null : d.id)
                      }}
                      className="h-7 w-7 -mr-1 -mt-0.5 rounded-full hover:bg-muted/60 flex items-center justify-center text-muted-foreground transition-transform"
                      aria-label={isExpanded ? t('collapseDetails') : t('expandDetails')}
                      aria-expanded={isExpanded}
                    >
                      <ChevronDown
                        className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {/* Round 7 Fix A (M1, M3): rating + DistanceBadge (km + ETA) */}
                <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  {typeof d.rating === 'number' && d.rating > 0 && (
                    <span className="inline-flex items-center gap-1 text-[12px]">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span className="font-semibold text-foreground">{d.rating.toFixed(1)}</span>
                      {typeof d.total_reviews === 'number' && (
                        <span className="text-muted-foreground/70 font-normal">({d.total_reviews})</span>
                      )}
                    </span>
                  )}
                  {(typeof d.distance_km === 'number' || typeof eta === 'number') && (
                    <>
                      <span className="text-muted-foreground/50" aria-hidden="true">·</span>
                      <DistanceBadge
                        distanceKm={d.distance_km}
                        etaMinutes={eta}
                        variant="solid"
                      />
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

            {/* Round 7 P1-E: expanded panel — bio, reviews count, distance/eta */}
            <div
              className={cn(
                'overflow-hidden transition-[max-height,opacity,margin] duration-200',
                isExpanded ? 'max-h-[280px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0',
              )}
              aria-hidden={!isExpanded}
            >
              <div className="border-t border-border pt-3 space-y-2.5 text-[12.5px]">
                {d.bio && (
                  <p className="text-muted-foreground leading-relaxed line-clamp-3">{d.bio}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted-foreground">
                  {typeof d.distance_km === 'number' && (
                    <span>
                      <span className="font-medium text-foreground">{d.distance_km.toFixed(1)} km</span>
                      {' '}{t('expanded.fromYou')}
                    </span>
                  )}
                  {typeof eta === 'number' && (
                    <span>
                      <span className="font-medium text-foreground">~{eta} min</span>
                      {' '}{t('expanded.eta')}
                    </span>
                  )}
                  {typeof d.total_reviews === 'number' && d.total_reviews > 0 && (
                    <span>
                      <span className="font-medium text-foreground">{d.total_reviews}</span>
                      {' '}{t('expanded.reviews')}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10.5px] uppercase tracking-wide text-muted-foreground/70 font-semibold">
                    {t('expanded.languages')}:
                  </span>
                  <span className="text-[11.5px] font-medium">Español, English</span>
                </div>
              </div>
            </div>

            {/* 2C: Expanding mini confirmation bar when selected (kept) */}
            <div
              className={cn(
                'overflow-hidden transition-[max-height,opacity,margin] duration-200',
                isSelected && !isExpanded ? 'max-h-[44px] opacity-100 mt-2.5' : 'max-h-0 opacity-0 mt-0',
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
          </div>
        )
      })}
    </div>
  )
}
