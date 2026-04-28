'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MapPin, Loader2, Check, Clock, Navigation, MessageCircle } from 'lucide-react'

interface ConsultationData {
  id: string
  status: string
  address: string | null
  lat: number | null
  lng: number | null
  checkin_at: string | null
  checkout_at: string | null
  scheduled_at: string | null
  type: string | null
}

/**
 * CheckInOutScreen — Round 17-B client island.
 *
 * Routes to one of three sub-screens based on `consultation.status`:
 *   - 'accepted'     → CheckInPanel
 *   - 'in_progress'  → CheckOutPanel (with elapsed-time counter)
 *   - 'completed'    → ReceiptPanel (read-only)
 *
 * Each panel is a focused single-action screen designed for the
 * doctor on-site (mobile, glanceable, big buttons). The check-in
 * panel uses navigator.geolocation to grab GPS coords; the check-out
 * panel just confirms.
 */
export function CheckInOutScreen({
  locale,
  consultation,
}: {
  locale: string
  consultation: ConsultationData
}) {
  const router = useRouter()
  const t = useTranslations('doctor.checkinout')

  if (consultation.status === 'accepted') {
    return <CheckInPanel locale={locale} consultation={consultation} t={t} router={router} />
  }
  if (consultation.status === 'in_progress') {
    return <CheckOutPanel locale={locale} consultation={consultation} t={t} router={router} />
  }
  if (consultation.status === 'completed') {
    return <ReceiptPanel locale={locale} consultation={consultation} t={t} router={router} />
  }

  // Pending or other status — redirect to dashboard
  return (
    <main className="min-h-screen bg-slate-50 grid place-items-center p-4">
      <div className="text-center max-w-md">
        <p className="text-slate-600 mb-3">{t('invalidStatus', { status: consultation.status })}</p>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/doctor/dashboard`)}
          className="text-blue-600 hover:underline"
        >
          {t('backToDashboard')}
        </button>
      </div>
    </main>
  )
}

// ---------- Check-in ----------

function CheckInPanel({
  locale,
  consultation,
  t,
  router,
}: {
  locale: string
  consultation: ConsultationData
  t: (k: string, vars?: Record<string, string | number>) => string
  router: ReturnType<typeof useRouter>
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [distanceM, setDistanceM] = useState<number | null>(null)

  // Watch position while on this screen so the distance number is live.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCoords({ lat, lng })
        if (consultation.lat != null && consultation.lng != null) {
          setDistanceM(distanceMeters(lat, lng, consultation.lat, consultation.lng))
        }
      },
      (e) => setError(e.message),
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 8_000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [consultation.lat, consultation.lng])

  const submitCheckin = async () => {
    if (!coords || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/consultations/${consultation.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: coords.lat, lng: coords.lng }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data?.code === 'too_far') {
          setError(t('tooFar', { distance: data.distanceM ?? '—', max: data.maxM ?? 300 }))
        } else {
          setError(data?.error ?? 'checkin_failed')
        }
        setSubmitting(false)
        return
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'network_error')
      setSubmitting(false)
    }
  }

  const tooFar = distanceM != null && distanceM > 300

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
          <div
            className="grid place-items-center mx-auto mb-5"
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              boxShadow: '0 12px 28px -10px rgba(29,78,216,0.5)',
            }}
            aria-hidden="true"
          >
            <Navigation className="h-7 w-7 text-white" />
          </div>

          <h1
            className="font-bold text-[#0B1220] text-center"
            style={{ fontSize: 20, letterSpacing: '-0.01em' }}
          >
            {t('checkinTitle')}
          </h1>
          <p className="text-slate-600 text-center mt-1.5 text-[14px]">
            {consultation.address ?? '—'}
          </p>

          {/* Distance display */}
          <div className="mt-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-[12.5px] uppercase tracking-wider text-slate-500 font-semibold">
                {t('distanceLabel')}
              </span>
            </div>
            {distanceM == null ? (
              <p className="text-slate-500 text-[14px] flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t('locating')}
              </p>
            ) : (
              <p
                className={`text-[18px] font-bold ${tooFar ? 'text-amber-700' : 'text-green-700'}`}
              >
                {t('distanceFromAddress', { distance: Math.round(distanceM) })}
              </p>
            )}
          </div>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-[13px]">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={submitCheckin}
            disabled={!coords || submitting || tooFar}
            className="mt-5 w-full inline-flex items-center justify-center text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: tooFar
                ? 'linear-gradient(135deg, #94A3B8, #64748B)'
                : 'linear-gradient(135deg, #16A34A, #15803D)',
              fontSize: 15,
              letterSpacing: '-0.2px',
              minHeight: 48,
            }}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {tooFar ? t('moveCloser') : t('cta')}
          </button>

          <p className="text-center text-[12px] text-slate-500 mt-3">
            {t('proximityNote', { max: 300 })}
          </p>
        </div>
      </div>
    </main>
  )
}

// ---------- Check-out ----------

function CheckOutPanel({
  locale: _locale,
  consultation,
  t,
  router,
}: {
  locale: string
  consultation: ConsultationData
  t: (k: string, vars?: Record<string, string | number>) => string
  router: ReturnType<typeof useRouter>
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState<string>('—')

  useEffect(() => {
    if (!consultation.checkin_at) return
    const startMs = new Date(consultation.checkin_at).getTime()
    const tick = () => {
      const min = Math.floor((Date.now() - startMs) / 60_000)
      setElapsed(`${min} min`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [consultation.checkin_at])

  const submitCheckout = async () => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/consultations/${consultation.id}/checkout`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'checkout_failed')
        setSubmitting(false)
        return
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'network_error')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
          <div
            className="grid place-items-center mx-auto mb-5"
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #16A34A, #15803D)',
              boxShadow: '0 12px 28px -10px rgba(22,163,74,0.5)',
            }}
            aria-hidden="true"
          >
            <Clock className="h-7 w-7 text-white" />
          </div>

          <h1
            className="font-bold text-[#0B1220] text-center"
            style={{ fontSize: 20, letterSpacing: '-0.01em' }}
          >
            {t('checkoutTitle')}
          </h1>
          <p className="text-slate-600 text-center mt-1.5 text-[14px]">
            {consultation.address ?? '—'}
          </p>

          <div className="mt-5 bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
            <span className="text-[12.5px] uppercase tracking-wider text-slate-500 font-semibold">
              {t('elapsedLabel')}
            </span>
            <p className="text-[24px] font-bold text-[#0B1220] mt-1" style={{ letterSpacing: '-0.02em' }}>
              {elapsed}
            </p>
          </div>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-[13px]">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={submitCheckout}
            disabled={submitting}
            className="mt-5 w-full inline-flex items-center justify-center text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #16A34A, #15803D)',
              fontSize: 15,
              letterSpacing: '-0.2px',
              minHeight: 48,
            }}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('checkoutCta')}
          </button>

          <p className="text-center text-[12px] text-slate-500 mt-3 leading-relaxed">
            {t('checkoutNote')}
          </p>
        </div>
      </div>
    </main>
  )
}

// ---------- Receipt (completed) ----------

function ReceiptPanel({
  locale,
  consultation,
  t,
  router,
}: {
  locale: string
  consultation: ConsultationData
  t: (k: string, vars?: Record<string, string | number>) => string
  router: ReturnType<typeof useRouter>
}) {
  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 text-center">
          <div
            className="grid place-items-center mx-auto mb-5 bg-emerald-100"
            style={{ width: 64, height: 64, borderRadius: '50%' }}
            aria-hidden="true"
          >
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h1
            className="font-bold text-[#0B1220]"
            style={{ fontSize: 20, letterSpacing: '-0.01em' }}
          >
            {t('completedTitle')}
          </h1>
          <p className="text-slate-600 mt-1.5 text-[14px]">{consultation.address ?? '—'}</p>

          {consultation.checkout_at && (
            <p className="text-[12.5px] text-slate-500 mt-3">
              {t('completedAt', { time: new Date(consultation.checkout_at).toLocaleString(locale) })}
            </p>
          )}

          <button
            type="button"
            onClick={() => router.push(`/${locale}/doctor/dashboard`)}
            className="mt-5 w-full inline-flex items-center justify-center font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              fontSize: 14.5,
              minHeight: 44,
            }}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {t('backToDashboard')}
          </button>
        </div>
      </div>
    </main>
  )
}

// ---------- Helpers ----------

const EARTH_RADIUS_M = 6_371_000

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_M * c
}
