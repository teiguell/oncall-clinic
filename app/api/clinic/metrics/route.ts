import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

export const dynamic = 'force-dynamic'

/**
 * GET /api/clinic/metrics — Round 15B-4.
 *
 * Aggregates the dashboard KPIs in a single call:
 *   - consultationsThisMonth (count, from `consultations` filtered by clinic_id + month start)
 *   - revenueThisMonth (sum of `price` for completed status, in cents — divide by 100 in UI)
 *   - netThisMonth     (revenue minus commission)
 *   - activeDoctors    (count from clinic_doctors WHERE status='active')
 *   - avgRating        (average of doctor_profiles.rating across active links)
 *
 * Useful for the dashboard skeleton (Round 15A) which currently does
 * the same queries inline; Round 15C can swap for this single call to
 * cut TTFB on the dashboard page.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'clinic' ? bypass.id : null)
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  if (!clinic) {
    // Empty metrics so the dashboard renders without an error
    return NextResponse.json({
      consultationsThisMonth: 0,
      revenueThisMonthCents: 0,
      netThisMonthCents: 0,
      activeDoctors: 0,
      avgRating: null,
    })
  }

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const sinceIso = monthStart.toISOString()

  const [{ count: consCount }, { data: revRows }, { count: docCount }, { data: doctorRatings }] =
    await Promise.all([
      supabase
        .from('consultations')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinic.id)
        .gte('created_at', sinceIso),
      supabase
        .from('consultations')
        .select('price, commission')
        .eq('clinic_id', clinic.id)
        .gte('created_at', sinceIso)
        .eq('status', 'completed'),
      supabase
        .from('clinic_doctors')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinic.id)
        .eq('status', 'active'),
      supabase
        .from('clinic_doctors')
        .select('doctor:doctor_profiles!inner(rating)')
        .eq('clinic_id', clinic.id)
        .eq('status', 'active'),
    ])

  let revenueCents = 0
  let commissionCents = 0
  for (const r of (revRows ?? []) as Array<{ price: number | null; commission: number | null }>) {
    revenueCents += r.price ?? 0
    commissionCents += r.commission ?? 0
  }
  const netCents = revenueCents - commissionCents

  type RatingRow = {
    doctor: { rating: number | null } | Array<{ rating: number | null }>
  }
  const ratingValues: number[] = []
  for (const r of (doctorRatings ?? []) as unknown as RatingRow[]) {
    const d = Array.isArray(r.doctor) ? r.doctor[0] : r.doctor
    if (typeof d?.rating === 'number') ratingValues.push(d.rating)
  }
  const avgRating =
    ratingValues.length > 0
      ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
      : null

  return NextResponse.json({
    consultationsThisMonth: consCount ?? 0,
    revenueThisMonthCents: revenueCents,
    netThisMonthCents: netCents,
    activeDoctors: docCount ?? 0,
    avgRating,
  })
}
