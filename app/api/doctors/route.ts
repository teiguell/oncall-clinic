import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/doctors?near=<lat>,<lng>
 *
 * BUG FIX P0 #2 (2026-04-24): Cowork audit flagged /api/doctors 404. The
 * DoctorSelector already falls back to a direct Supabase query when the
 * RPC `find_nearest_doctors` doesn't exist, so patient flow wasn't
 * functionally broken — but an unnecessary 404 in Network tab hurts trust.
 *
 * Strategy: try RPC first (if it exists in Supabase), fallback to a simple
 * availability query. Returns [] on any error (never surfaces 500 to
 * client; the UI handles empty list gracefully).
 */
export async function GET(req: NextRequest) {
  const near = req.nextUrl.searchParams.get('near')
  const [latStr, lngStr] = (near ?? '').split(',')
  const lat = Number(latStr)
  const lng = Number(lngStr)

  const supabase = await createClient()

  // Attempt RPC first (returns pre-sorted, distance-annotated list)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const rpc = await supabase.rpc('find_nearest_doctors', {
      lat_in: lat,
      lng_in: lng,
      radius_km: 25,
    })
    if (!rpc.error && Array.isArray(rpc.data)) {
      return NextResponse.json(rpc.data)
    }
  }

  // Fallback: plain availability query, joined with profile for display.
  // activation_status filter (Round 14 follow-up, migration 021/024): hide
  // doctors who haven't finished email + SMS + admin review.
  // Round 14 follow-up: removed `night_price` from SELECT — that column
  // does not exist on doctor_profiles (only `consultation_price` and
  // `price_adjustment`). With `night_price` in the SELECT this fallback
  // had been silently returning [] for every call since the column was
  // dropped (or never existed).
  const { data: rows } = await supabase
    .from('doctor_profiles')
    .select(`
      id,
      user_id,
      specialty,
      bio,
      rating,
      total_reviews,
      consultation_price,
      current_lat,
      current_lng,
      city,
      is_available,
      verification_status,
      profiles!inner(full_name, avatar_url)
    `)
    .eq('is_available', true)
    .eq('verification_status', 'verified')
    .eq('activation_status', 'active')
    .limit(10)

  return NextResponse.json(rows || [])
}
