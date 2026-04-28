'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, Check, ArrowLeft, Plus, X } from 'lucide-react'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
type Day = (typeof DAYS)[number]
type Slot = [string, string]
type Schedule = Record<Day, Slot[]>

const EMPTY_SCHEDULE: Schedule = {
  mon: [],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [],
}

const DEFAULT_SLOT: Slot = ['09:00', '18:00']

/**
 * DoctorAvailabilityEditor — Round 17-D.
 *
 * 7-day weekly editor. Each day shows zero-or-more time slots
 * [from, to]. Doctors typically set "all weekdays 09:00-18:00 + sat
 * 09:00-13:00" — small UI optimised for that 30-second flow.
 *
 * Save → PUT /api/doctor/availability with the full schedule object.
 */
export function DoctorAvailabilityEditor({ locale }: { locale: string }) {
  const t = useTranslations('doctor.availability')
  const router = useRouter()
  const [schedule, setSchedule] = useState<Schedule>(EMPTY_SCHEDULE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/doctor/availability')
      const data = await res.json()
      if (data?.schedule && typeof data.schedule === 'object') {
        // Coerce to known shape; missing days → empty arrays.
        const next = { ...EMPTY_SCHEDULE }
        for (const day of DAYS) {
          const slots = (data.schedule as Record<string, unknown>)[day]
          if (Array.isArray(slots)) next[day] = slots as Slot[]
        }
        setSchedule(next)
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

  const addSlot = (day: Day) => {
    setSchedule((s) => ({ ...s, [day]: [...s[day], [...DEFAULT_SLOT] as Slot] }))
  }

  const removeSlot = (day: Day, idx: number) => {
    setSchedule((s) => ({ ...s, [day]: s[day].filter((_, i) => i !== idx) }))
  }

  const updateSlot = (day: Day, idx: number, position: 0 | 1, value: string) => {
    setSchedule((s) => {
      const slots = [...s[day]]
      const slot = [...slots[idx]] as Slot
      slot[position] = value
      slots[idx] = slot
      return { ...s, [day]: slots }
    })
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/doctor/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
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

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          {DAYS.map((day) => (
            <div key={day} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[14.5px] text-[#0B1220]">
                  {t(`days.${day}`)}
                </span>
                <button
                  type="button"
                  onClick={() => addSlot(day)}
                  className="inline-flex items-center gap-1 text-[12.5px] text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded-lg"
                >
                  <Plus className="h-3.5 w-3.5" /> {t('addSlot')}
                </button>
              </div>
              {schedule[day].length === 0 ? (
                <p className="text-[12.5px] text-slate-400 italic">{t('unavailable')}</p>
              ) : (
                <div className="space-y-2">
                  {schedule[day].map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot[0]}
                        onChange={(e) => updateSlot(day, idx, 0, e.target.value)}
                        className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                      <span className="text-slate-400">—</span>
                      <input
                        type="time"
                        value={slot[1]}
                        onChange={(e) => updateSlot(day, idx, 1, e.target.value)}
                        className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlot(day, idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={t('removeSlot')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

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

        <p className="text-center text-[12px] text-slate-500 mt-4">
          <span
            onClick={() => router.push(`/${locale}/doctor/dashboard`)}
            className="cursor-pointer hover:text-slate-700"
          >
            {t('skipToDashboard')}
          </span>
        </p>
      </div>
    </main>
  )
}
