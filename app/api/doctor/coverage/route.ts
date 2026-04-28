import { NextResponse } from 'next/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'

export const dynamic = 'force-dynamic'

const ZONE_NAMES = new Set([
  'Eivissa centro',
  'Sant Antoni',
  'Santa Eulària',
  'Sant Josep',
  'Sant Joan',
  'Formentera',
])

/**
 * GET /api/doctor/coverage — Round 17-D.
 *
 * Returns coverage_lat / coverage_lng / coverage_radius_km / coverage_zones.
 * Defaults: lat/lng null (uses current_lat/lng fallback at booking time);
 * radius 15; zones [].
 *
 * PUT body: { lat, lng, radiusKm, zones[] }
 */
export async function GET() {
  const { userId, supabase } = await getEffectiveSession('doctor')
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: doctor } = await supabase
    .from('doctor_profiles')
    .select('coverage_lat, coverage_lng, coverage_radius_km, coverage_zones')
    .eq('user_id', userId)
    .maybeSingle()

  return NextResponse.json({
    lat: doctor?.coverage_lat ?? null,
    lng: doctor?.coverage_lng ?? null,
    radiusKm: doctor?.coverage_radius_km ?? 15,
    zones: doctor?.coverage_zones ?? [],
  })
}

export async function PUT(request: Request) {
  const { userId, supabase } = await getEffectiveSession('doctor')
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { lat?: number; lng?: number; radiusKm?: number; zones?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const lat = Number(body.lat)
  const lng = Number(body.lng)
  const radiusKm = Number(body.radiusKm)
  const zones = Array.isArray(body.zones)
    ? (body.zones as unknown[]).filter((z): z is string => typeof z === 'string' && ZONE_NAMES.has(z))
    : []

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat_lng_required', code: 'bad_request' }, { status: 400 })
  }
  if (!Number.isFinite(radiusKm) || radiusKm < 1 || radiusKm > 50) {
    return NextResponse.json({ error: 'radius_out_of_range', code: 'bad_request' }, { status: 400 })
  }

  const { error } = await supabase
    .from('doctor_profiles')
    .update({
      coverage_lat: lat,
      coverage_lng: lng,
      coverage_radius_km: Math.round(radiusKm),
      coverage_zones: zones,
    })
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: error.message, code: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, lat, lng, radiusKm: Math.round(radiusKm), zones })
}
