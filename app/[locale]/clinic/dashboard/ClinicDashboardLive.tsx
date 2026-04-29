'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { PullToRefresh } from '@/components/shared/pull-to-refresh'

/**
 * Round 25-1 (Z-1) — clinic dashboard realtime + polling.
 *
 * Pre-Round-25 the clinic dashboard was a pure server component:
 * KPIs computed on first render, never refreshed without a manual
 * page reload. Compared to the doctor + patient surfaces (which
 * already had realtime + polling in Round 17 / 18) the clinic
 * admin had a strictly worse UX.
 *
 * This client island:
 *   - receives the SSR-computed initial values as props (so the first
 *     paint is identical to the previous server-only behaviour)
 *   - subscribes to 3 Postgres-changes channels:
 *       consultations  WHERE clinic_id = X  (KPI #1, #2)
 *       clinic_doctors WHERE clinic_id = X  (KPI #3)
 *       leads          (any INSERT)         (B2B funnel signal)
 *   - polls /api/clinic/metrics every 30s as a safety net (mirrors
 *     the doctor dashboard's pattern — covers the case where the
 *     websocket is silently disconnected by an intermediate proxy).
 *
 * The realtime channels run server-side filtering via Supabase RLS;
 * an admin only receives events for their own clinic_id. In bypass
 * mode (auth cookie absent) RLS rejects realtime — that's expected,
 * the polling fallback still ticks.
 */

interface KpiData {
  consultationsThisMonth: number
  revenueEur: number   // already converted from cents in the SSR page
  activeDoctors: number
  avgRating: string    // formatted "4.6" or "—"
}

interface Props {
  clinicId: string | null
  initial: KpiData
}

export function ClinicDashboardLive({ clinicId, initial }: Props) {
  const tKpi = useTranslations('clinicDashboard.kpis')
  const [data, setData] = useState<KpiData>(initial)
  const lastRefetchRef = useRef<number>(0)

  // Round 25-10 (Z-10): hoist `refetch` so the pull-to-refresh
  // wrapper can call it on user gesture without re-implementing the
  // throttle / parse / setState pipeline. Stable identity via
  // useCallback so the realtime subscription effect doesn't tear down
  // and re-subscribe on every render.
  const refetch = useCallback(async () => {
    const now = Date.now()
    if (now - lastRefetchRef.current < 500) return
    lastRefetchRef.current = now
    try {
      const res = await fetch('/api/clinic/metrics', { cache: 'no-store' })
      if (!res.ok) return
      const fresh = await res.json() as {
        consultationsThisMonth: number
        revenueThisMonthCents: number
        activeDoctors: number
        avgRating: number | null
      }
      setData({
        consultationsThisMonth: fresh.consultationsThisMonth ?? 0,
        revenueEur: (fresh.revenueThisMonthCents ?? 0) / 100,
        activeDoctors: fresh.activeDoctors ?? 0,
        avgRating: typeof fresh.avgRating === 'number' ? fresh.avgRating.toFixed(1) : '—',
      })
    } catch {
      // network blip — next tick or next event will recover
    }
  }, [])

  useEffect(() => {
    if (!clinicId) return // bypass / no-clinic users render the static initial values
    const supabase = createClient()

    const consultationsChannel = supabase
      .channel(`clinic:${clinicId}:consultations`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'consultations', filter: `clinic_id=eq.${clinicId}` },
        () => { void refetch() },
      )
      .subscribe()

    const doctorsChannel = supabase
      .channel(`clinic:${clinicId}:doctors`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clinic_doctors', filter: `clinic_id=eq.${clinicId}` },
        () => { void refetch() },
      )
      .subscribe()

    // Leads INSERTs are a B2B-funnel signal — the clinic admin
    // probably wants a live counter even though leads aren't filtered
    // by clinic_id (RLS scopes leads SELECT to admin role only). We
    // subscribe broadly and let the metrics endpoint compute whatever
    // shape the dashboard wants. Bandwidth is tiny.
    const leadsChannel = supabase
      .channel(`clinic:${clinicId}:leads`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        () => { void refetch() },
      )
      .subscribe()

    const pollHandle = setInterval(() => { void refetch() }, 30_000)

    return () => {
      void supabase.removeChannel(consultationsChannel)
      void supabase.removeChannel(doctorsChannel)
      void supabase.removeChannel(leadsChannel)
      clearInterval(pollHandle)
    }
  }, [clinicId, refetch])

  const kpis = [
    { label: tKpi('consultationsThisMonth'), value: String(data.consultationsThisMonth) },
    { label: tKpi('revenueThisMonth'), value: `€${data.revenueEur.toFixed(0)}` },
    { label: tKpi('activeDoctors'), value: String(data.activeDoctors) },
    { label: tKpi('avgRating'), value: data.avgRating },
  ]

  return (
    // Round 25-10 (Z-10): pull-to-refresh wrapper for mobile. On
    // desktop the touch events never fire so the wrapper renders
    // children verbatim. Same `refetch` callback that the realtime
    // subscription + polling use, so all three paths converge on the
    // same /api/clinic/metrics call.
    <PullToRefresh onRefresh={refetch}>
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        // aria-live polite so screen readers hear the count change
        // without interrupting the user's current focus context.
        aria-live="polite"
      >
        {kpis.map((k, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200"
            style={{ padding: '18px 20px', borderRadius: 14 }}
          >
            <div className="text-slate-500 text-[12.5px] uppercase tracking-wider">{k.label}</div>
            <div
              className="font-bold text-[#0B1220] mt-2"
              style={{ fontSize: 28, letterSpacing: '-0.02em' }}
            >
              {k.value}
            </div>
          </div>
        ))}
      </div>
    </PullToRefresh>
  )
}
