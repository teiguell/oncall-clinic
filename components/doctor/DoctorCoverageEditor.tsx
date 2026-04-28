'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, Check, ArrowLeft, MapPin } from 'lucide-react'
import { PlacesAutocomplete } from '@/components/booking/PlacesAutocomplete'

const ZONES = [
  'Eivissa centro',
  'Sant Antoni',
  'Santa Eulària',
  'Sant Josep',
  'Sant Joan',
  'Formentera',
] as const

interface Coverage {
  lat: number | null
  lng: number | null
  radiusKm: number
  zones: string[]
}

/**
 * DoctorCoverageEditor — Round 17-D.
 *
 * Three controls:
 *   1. Center address picker (PlacesAutocomplete restricted to Ibiza)
 *      — sets coverage_lat/lng. Defaults to current_lat/lng if not set.
 *   2. Radius slider (1-50 km, default 15)
 *   3. Zone checkboxes (6 named Ibiza zones)
 */
export function DoctorCoverageEditor({ locale }: { locale: string }) {
  const t = useTranslations('doctor.coverage')
  const router = useRouter()
  const [coverage, setCoverage] = useState<Coverage>({
    lat: null,
    lng: null,
    radiusKm: 15,
    zones: [],
  })
  const [centerLabel, setCenterLabel] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/doctor/coverage')
      const data = (await res.json()) as Coverage
      setCoverage({
        lat: data.lat,
        lng: data.lng,
        radiusKm: data.radiusKm ?? 15,
        zones: data.zones ?? [],
      })
      if (data.lat != null && data.lng != null) {
        setCenterLabel(`${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'load_failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const toggleZone = (zone: string) => {
    setCoverage((c) => ({
      ...c,
      zones: c.zones.includes(zone)
        ? c.zones.filter((z) => z !== zone)
        : [...c.zones, zone],
    }))
  }

  const save = async () => {
    if (coverage.lat == null || coverage.lng == null) {
      setError(t('locationRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/doctor/coverage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: coverage.lat,
          lng: coverage.lng,
          radiusKm: coverage.radiusKm,
          zones: coverage.zones,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'save_failed')
        setSaving(false)
        return
      }
      setSavedAt(Date.now())
      setSaving(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'network_error')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-xl mx-auto pt-6 pb-32">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0B1220] text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </button>

        <h1
          className="font-bold text-[#0B1220] mb-1"
          style={{ fontSize: 26, letterSpacing: '-0.02em' }}
        >
          {t('title')}
        </h1>
        <p className="text-slate-600 text-[14.5px] mb-5">{t('subtitle')}</p>

        {/* Center picker */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          <label className="block">
            <span className="block text-[14px] font-semibold text-[#0B1220] mb-1.5">
              <MapPin className="inline h-4 w-4 mr-1 text-blue-600" aria-hidden="true" />
              {t('centerLabel')}
            </span>
            <span className="block text-[13px] text-slate-500 mb-3">
              {t('centerHint')}
            </span>
            <PlacesAutocomplete
              locale={locale === 'en' ? 'en' : 'es'}
              defaultValue={centerLabel}
              placeholder={t('placeholder')}
              onChange={setCenterLabel}
              onSelect={({ address, lat, lng }) => {
                setCoverage((c) => ({ ...c, lat, lng }))
                setCenterLabel(address)
              }}
              onGeolocate={({ address, lat, lng }) => {
                setCoverage((c) => ({ ...c, lat, lng }))
                setCenterLabel(address)
              }}
            />
          </label>
        </section>

        {/* Radius slider */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] font-semibold text-[#0B1220]">
              {t('radiusLabel')}
            </span>
            <span className="text-[14px] font-bold text-blue-600">
              {coverage.radiusKm} km
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={coverage.radiusKm}
            onChange={(e) => setCoverage((c) => ({ ...c, radiusKm: Number(e.target.value) }))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>1 km</span>
            <span>25 km</span>
            <span>50 km</span>
          </div>
        </section>

        {/* Zones */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <span className="block text-[14px] font-semibold text-[#0B1220] mb-3">
            {t('zonesLabel')}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {ZONES.map((zone) => (
              <label
                key={zone}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  coverage.zones.includes(zone)
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={coverage.zones.includes(zone)}
                  onChange={() => toggleZone(zone)}
                  className="h-4 w-4 accent-blue-600"
                />
                <span className="text-[13.5px] text-[#0B1220]">{zone}</span>
              </label>
            ))}
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-[13px]">
            {error}
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center text-white font-semibold disabled:opacity-50"
              style={{
                padding: '13px 18px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                fontSize: 15,
                minHeight: 48,
              }}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('save')}
            </button>
            {savedAt && (
              <span className="inline-flex items-center gap-1.5 text-green-700 text-[13px]">
                <Check className="h-4 w-4" /> {t('saved')}
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
