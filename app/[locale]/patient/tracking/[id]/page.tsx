"use client"

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  getStatusLabel, getStatusStep, estimateArrivalTime,
  calculateDistance, formatCurrencyFromEuros
} from '@/lib/utils'
import { ArrowLeft, Phone, Star, MapPin, Clock, CheckCircle2, AlertCircle, PhoneCall } from 'lucide-react'
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps'
import { ServiceTimeline } from '@/components/shared/service-timeline'
import { useTranslations, useLocale } from 'next-intl'
import { StarRating } from '@/components/star-rating'
import type { Consultation } from '@/types'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

/** Auto-fits map bounds to show both patient and doctor markers */
function MapFitBounds({ patientLoc, doctorLoc }: {
  patientLoc: { lat: number; lng: number }
  doctorLoc: { lat: number; lng: number } | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!map || !doctorLoc) return
    const bounds = new google.maps.LatLngBounds()
    bounds.extend(patientLoc)
    bounds.extend(doctorLoc)
    map.fitBounds(bounds, { top: 60, bottom: 60, left: 40, right: 40 })
  }, [map, patientLoc, doctorLoc])

  return null
}

/** Real Google Maps tracking view with patient + doctor markers */
function TrackingMap({ patientLoc, doctorLoc, eta, t }: {
  patientLoc: { lat: number; lng: number }
  doctorLoc: { lat: number; lng: number } | null
  eta: number | null
  t: (key: string) => string
}) {
  const center = useMemo(() => patientLoc, [patientLoc.lat, patientLoc.lng])

  return (
    <div className="relative flex-shrink-0" style={{ height: '45vh' }}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={14}
          mapId="tracking-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <MapFitBounds patientLoc={patientLoc} doctorLoc={doctorLoc} />

          {/* Patient marker (red) */}
          <AdvancedMarker position={patientLoc}>
            <Pin
              background="#ef4444"
              borderColor="#dc2626"
              glyphColor="#ffffff"
            />
          </AdvancedMarker>

          {/* Doctor marker (blue, animated) */}
          {doctorLoc && (
            <AdvancedMarker position={doctorLoc}>
              <div className="relative">
                <div className="absolute -inset-2 bg-blue-400 rounded-full opacity-30 animate-ping" />
                <Pin
                  background="#3b82f6"
                  borderColor="#2563eb"
                  glyphColor="#ffffff"
                />
              </div>
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>

      {/* ETA overlay badge */}
      {eta && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2 z-10">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="font-bold text-blue-600">~{eta} min</span>
          <span className="text-gray-500 text-sm">{t('tracking.arrival')}</span>
        </div>
      )}

      {/* Location legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 shadow-md space-y-1.5 z-10">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-600">{t('tracking.yourLocation')}</span>
        </div>
        {doctorLoc && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs text-gray-600">{t('tracking.doctorLocation')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/** Graceful fallback when no Google Maps API key is configured */
function MapPlaceholder({ patientLoc, doctorLoc, eta, t }: {
  patientLoc: { lat: number; lng: number }
  doctorLoc: { lat: number; lng: number } | null
  eta: number | null
  t: (key: string) => string
}) {
  return (
    <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0" style={{ height: '45vh' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-500/10 mb-4">
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-800 font-semibold text-lg">
            {doctorLoc ? t('tracking.doctorOnTheWay') : t('tracking.realtimeMap')}
          </p>
          <p className="text-sm text-gray-500 mt-1">{t('tracking.realtimeMapDesc')}</p>
          {eta && (
            <div className="mt-4 bg-white rounded-2xl px-4 py-2 shadow-md inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-bold text-blue-600">~{eta} min</span>
              <span className="text-gray-500 text-sm">{t('tracking.arrival')}</span>
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-4 right-4 bg-white rounded-xl p-2 shadow-md flex items-center gap-2">
        <MapPin className="h-4 w-4 text-red-500" />
        <span className="text-xs text-gray-600">{t('tracking.yourLocation')}</span>
      </div>
    </div>
  )
}

export default function TrackingPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('patient')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [doctorLoc, setDoctorLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)

  const STATUS_STEPS = [
    { label: t('tracking.step1'), icon: '🔍', desc: t('tracking.step1Desc') },
    { label: t('tracking.step2'), icon: '✅', desc: t('tracking.step2Desc') },
    { label: t('tracking.step3'), icon: '🚗', desc: t('tracking.step3Desc') },
    { label: t('tracking.step4'), icon: '🏠', desc: t('tracking.step4Desc') },
    { label: t('tracking.step5'), icon: '🎉', desc: t('tracking.step5Desc') },
  ]

  useEffect(() => {
    const supabase = createClient()
    const id = params.id as string

    const fetchConsultation = async () => {
      const { data } = await supabase
        .from('consultations')
        .select(`*, doctor_profiles(*, profiles(*))`)
        .eq('id', id)
        .single()
      setConsultation(data)
      setLoading(false)
    }

    fetchConsultation()

    // Realtime subscription
    const channel = supabase
      .channel(`consultation:${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'consultations',
        filter: `id=eq.${id}`,
      }, async (payload) => {
        const updated = payload.new as Consultation
        setConsultation(prev => prev ? { ...prev, ...updated } : null)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'doctor_profiles',
      }, (payload) => {
        const doc = payload.new as { current_lat: number; current_lng: number }
        if (doc.current_lat && doc.current_lng) {
          setDoctorLoc({ lat: doc.current_lat, lng: doc.current_lng })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.id])

  const submitReview = async () => {
    if (rating === 0 || !consultation) return
    setSubmittingReview(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Insert into consultation_reviews (trigger handles updating doctor_profiles)
    await supabase.from('consultation_reviews').insert({
      consultation_id: consultation.id,
      patient_id: user.id,
      doctor_id: consultation.doctor_id,
      rating,
      comment: reviewComment || null,
    })

    // Also update the consultation record for backward compatibility
    await supabase
      .from('consultations')
      .update({ rating, review: reviewComment || null })
      .eq('id', params.id as string)

    setReviewSubmitted(true)
    setSubmittingReview(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-full max-w-md mx-auto space-y-3 mb-4" aria-busy="true" aria-label="Loading"><div className="h-8 w-2/3 skeleton-shimmer rounded-md mx-auto" /><div className="h-48 skeleton-shimmer rounded-card" /></div>
          <p className="text-gray-500">{tCommon('loading')}</p>
        </div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold">{t('tracking.notFound')}</h2>
          <Link href={`/${locale}/patient/dashboard`} className="mt-4 inline-block">
            <Button>{tCommon('backHome')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentStep = getStatusStep(consultation.status)
  const isCompleted = consultation.status === 'completed'
  const isCancelled = consultation.status === 'cancelled'
  const doctor = (consultation as Consultation & { doctor_profiles?: { profiles?: { full_name: string; avatar_url?: string; phone?: string }; specialty?: string; rating?: number } }).doctor_profiles

  const patientLoc = { lat: consultation.lat, lng: consultation.lng }
  const distanceKm = doctorLoc
    ? calculateDistance(patientLoc.lat, patientLoc.lng, doctorLoc.lat, doctorLoc.lng)
    : null
  const eta = distanceKm ? estimateArrivalTime(distanceKm) : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b px-4 h-16 flex items-center gap-4">
        <Link href={`/${locale}/patient/dashboard`}>
          <button className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="font-bold text-gray-900">{t('tracking.title')}</h1>
          <p className="text-xs text-gray-500">{getStatusLabel(consultation.status)}</p>
        </div>
        {!isCancelled && !isCompleted && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-600 font-medium">{t('tracking.live')}</span>
          </div>
        )}
      </header>

      {/* Round 7 M8: ServiceTimeline summary at top of tracking. Maps the
          4-state consultation status to the 6-step shared timeline. Hidden
          on cancelled (currentStep = -1). */}
      {!isCancelled && (
        <div className="bg-white border-b px-4 py-3 md:py-4">
          <ServiceTimeline currentStep={currentStep} />
        </div>
      )}

      {/* Real-time tracking map */}
      {GOOGLE_MAPS_API_KEY ? (
        <TrackingMap patientLoc={patientLoc} doctorLoc={doctorLoc} eta={eta} t={t} />
      ) : (
        <MapPlaceholder patientLoc={patientLoc} doctorLoc={doctorLoc} eta={eta} t={t} />
      )}

      {/* Persistent 112 emergency banner (under map, above bottom card) */}
      {!isCompleted && !isCancelled && (
        <div
          role="note"
          className="flex items-center gap-2 bg-red-50 border-y border-red-200 px-4 py-2 text-[12.5px] text-red-900"
        >
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1">{t('tracking.emergency_banner')}</span>
          <a
            href="tel:112"
            className="inline-flex items-center gap-1 rounded-full bg-red-600 text-white px-3 py-1 text-[12px] font-semibold hover:bg-red-700 transition-colors min-h-[28px]"
          >
            <PhoneCall className="h-3 w-3" aria-hidden="true" />
            112
          </a>
        </div>
      )}

      {/* Bottom card */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-4 relative z-10 overflow-auto">
        <div className="p-6 space-y-6">

          {/* ETA hero card — premium blue gradient (prototype §tracking) */}
          {!isCompleted && !isCancelled && eta !== null && (
            <div
              className="rounded-2xl p-4 text-white flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
              }}
            >
              <div>
                <div className="text-[12px] font-medium text-white/75 tracking-wide">
                  {t('tracking.estimatedArrival')}
                </div>
                <div className="text-[32px] font-bold tracking-tight leading-none mt-0.5">
                  ~{eta} <span className="text-[20px] font-semibold">min</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <MapPin className="w-6 h-6" />
              </div>
            </div>
          )}

          {/* Status timeline — colored stepper per prototype */}
          {!isCompleted && !isCancelled && (
            <div>
              <h3 className="font-semibold mb-4">{t('tracking.statusTitle')}</h3>
              <div className="space-y-3">
                {STATUS_STEPS.slice(0, 5).map((step, i) => {
                  const done = i < currentStep
                  const active = i === currentStep
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all ${
                          done
                            ? 'bg-emerald-500 text-white'
                            : active
                              ? 'bg-primary text-white ring-4 ring-primary/20'
                              : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {done ? <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} /> : step.icon}
                      </div>
                      <div className={done ? 'text-emerald-700' : active ? 'text-primary' : 'text-gray-400'}>
                        <p className={`text-sm font-medium ${active ? 'font-semibold' : ''}`}>
                          {step.label}
                        </p>
                        {active && (
                          <p className="text-xs text-gray-500 font-normal">{step.desc}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Doctor card */}
          {doctor && (
            <div className="border rounded-2xl p-4">
              <h3 className="text-sm text-gray-500 mb-3">{t('tracking.yourDoctor')}</h3>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={doctor.profiles?.avatar_url || ''} />
                  <AvatarFallback className="gradient-primary text-white font-bold">
                    {doctor.profiles?.full_name?.substring(0, 2).toUpperCase() || 'MD'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{doctor.profiles?.full_name}</p>
                  <p className="text-sm text-gray-500">{doctor.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{doctor.rating?.toFixed(1)}</span>
                  </div>
                </div>
                {doctor.profiles?.phone && (
                  <a href={`tel:${doctor.profiles.phone}`}>
                    <button className="h-11 w-11 rounded-2xl bg-green-50 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-green-600" />
                    </button>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Pending - searching */}
          {consultation.status === 'pending' && !doctor && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary mb-4 animate-bounce">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-bold text-gray-900">{t('tracking.searchingDoctor')}</h3>
              <p className="text-sm text-gray-500 mt-2">{t('tracking.searchingDoctorDesc')}</p>
              <div className="mt-4 flex justify-center gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Price summary */}
          {consultation.price && (
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">{t('request.total')}</span>
                <span className="font-bold text-gray-900">
                  {formatCurrencyFromEuros(consultation.price / 100)}
                </span>
              </div>
              <p className="text-xs text-gray-500">{t('tracking.paymentNote')}</p>
            </div>
          )}

          {/* Completed - rating */}
          {isCompleted && (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <div>
                <h3 className="text-xl font-bold">{t('tracking.completed')}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {t('tracking.completedDesc')}
                </p>
              </div>

              {!consultation.rating && !reviewSubmitted && (
                <div className="border rounded-2xl p-4 space-y-4">
                  <p className="font-medium">{t('tracking.rateConsultation')}</p>
                  <div className="flex justify-center">
                    <StarRating value={rating} onChange={setRating} size="lg" />
                  </div>
                  {rating > 0 && (
                    <>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={t('tracking.commentPlaceholder')}
                        className="w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <Button
                        onClick={submitReview}
                        className="w-full"
                        disabled={submittingReview}
                      >
                        {t('tracking.submitRating')}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {(consultation.rating || reviewSubmitted) && (
                <div className="border rounded-2xl p-4">
                  <p className="text-sm text-green-600 font-medium">
                    {t('tracking.thankYouRating')}
                  </p>
                </div>
              )}

              <Link href={`/${locale}/patient/dashboard`}>
                <Button className="w-full" size="lg">{tCommon('backHome')}</Button>
              </Link>
            </div>
          )}

          {/* Cancelled */}
          {isCancelled && (
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
              <div>
                <h3 className="text-xl font-bold">{t('tracking.cancelled')}</h3>
                {consultation.cancellation_reason && (
                  <p className="text-gray-500 text-sm mt-1">{consultation.cancellation_reason}</p>
                )}
              </div>
              <Link href={`/${locale}/patient/request`}>
                <Button className="w-full">{t('request.title')}</Button>
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* Sticky emergency 112 button */}
      {!isCompleted && !isCancelled && (
        <a
          href="tel:112"
          className="fixed bottom-6 right-6 mb-20 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 active:scale-95 transition-all"
          aria-label={t('tracking.emergencyCall')}
        >
          <PhoneCall className="h-6 w-6" />
        </a>
      )}
    </div>
  )
}
