import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/doctors/count?lat=<lat>&lng=<lng>&radius_km=<r> — Round 16-F.
 *
 * Lightweight count-only endpoint used by Step 1 of the booking flow
 * to surface "9 médicos disponibles cerca · ETA 30-90 min" preview
 * BEFORE the patient reaches Step 2. Reduces drop-off by reassuring
 * them that doctors are available at their address.
 *
 * Implementation: piggybacks on the existing `find_nearest_doctors`
 * RPC (Round 14 follow-up) which already filters
 * is_available + verification_status='verified' + activation_status='active'
 * + within radius_km. We just count the result rows.
 *
 * Returns: { count: number, etaRange?: string }
 *
 * Falls back to 0 silently on any error — Step 1 UI degrades gracefully
 * (no preview = no negative signal).
 *
 * Public endpoint (no auth). The data leakage is the same we already
 * accept on /api/doctors (per Cowork's earlier audit).
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const lat = Number(url.searchParams.get('lat'))
  const lng = Number(url.searchParams.get('lng'))
  const radiusKm = Number(url.searchParams.get('radius_km')) || 25

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ count: 0, etaRange: null })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('find_nearest_doctors', {
      lat_in: lat,
      lng_in: lng,
      radius_km: radiusKm,
    })
    if (error || !Array.isArray(data)) {
      return NextResponse.json({ count: 0, etaRange: null })
    }

    const count = data.length
    // Quick ETA bucket based on closest distance: 1km = ~5 min, 10km = ~30 min.
    // The RPC sorts by distance ASC so data[0] is the nearest.
    let etaRange: string | null = null
    if (count > 0) {
      const minKm = (data[0] as { distance_km?: number })?.distance_km ?? 0
      const minMin = Math.max(15, Math.round(minKm * 4 + 10))
      const maxMin = Math.min(120, minMin + 60)
      etaRange = `${minMin}-${maxMin} min`
    }

    return NextResponse.json({ count, etaRange })
  } catch {
    return NextResponse.json({ count: 0, etaRange: null })
  }
}
