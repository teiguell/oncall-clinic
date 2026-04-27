import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * POST /api/consultations/assign
 * Broadcast a pending consultation to nearby available doctors.
 *
 * - Called from the checkout/verify endpoint (real mode) or directly after
 *   test-mode insert.
 * - Uses the `find_nearest_doctors` Postgres function (defined in migration
 *   001) to locate candidates within a 50 km radius.
 * - Inserts a notification for each candidate. The first doctor who PATCHes
 *   /api/consultations with status='accepted' wins the assignment (race
 *   handled at DB level by CHECK on `consultations.status` + atomic UPDATE).
 *
 * Body: { consultationId: string, radiusKm?: number }
 */
export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { allowed } = checkRateLimit(ip, 10, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { consultationId, radiusKm = 50 } = await request.json().catch(() => ({}))
  if (!consultationId) {
    return NextResponse.json({ error: 'consultationId required' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Fetch consultation
  const { data: consultation, error: consultErr } = await supabase
    .from('consultations')
    .select('id, patient_id, service_type, status, lat, lng, address')
    .eq('id', consultationId)
    .single()

  if (consultErr || !consultation) {
    return NextResponse.json({ error: 'Consultation not found' }, { status: 404 })
  }
  if (consultation.status !== 'pending') {
    return NextResponse.json({ error: 'Consultation already assigned or closed' }, { status: 400 })
  }

  // Find nearby verified + available doctors via existing Postgres function.
  // Falls back to a plain query if the RPC is unavailable in this environment.
  let candidates: Array<{ id: string; user_id: string; distance_km?: number }> = []
  try {
    const { data, error } = await supabase.rpc('find_nearest_doctors', {
      lat_in: consultation.lat,
      lng_in: consultation.lng,
      radius_km: radiusKm,
    })
    if (!error && data) candidates = data as typeof candidates
  } catch {
    // noop — fallback below
  }

  if (candidates.length === 0) {
    // activation_status filter (Round 14 follow-up): hide doctors who
    // haven't finished email + SMS + admin review.
    const { data: fallback } = await supabase
      .from('doctor_profiles')
      .select('id, user_id')
      .eq('verification_status', 'verified')
      .eq('is_available', true)
      .eq('activation_status', 'active')
      .limit(10)
    candidates = (fallback || []) as typeof candidates
  }

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: 'no_doctors_available', message: 'No available doctors found' },
      { status: 200 },
    )
  }

  // Broadcast notification to each candidate doctor (race: first to accept wins)
  const notifications = candidates.map(c => ({
    user_id: c.user_id,
    type: 'consultation_request',
    title: 'Nueva solicitud de consulta',
    body: `Consulta de medicina general en ${consultation.address || 'Ibiza'}`,
    data: {
      consultation_id: consultation.id,
      service_type: consultation.service_type,
      lat: consultation.lat,
      lng: consultation.lng,
      distance_km: c.distance_km ?? null,
    },
    read: false,
  }))

  const { error: notifErr } = await supabase.from('notifications').insert(notifications)
  if (notifErr) {
    console.error('Notification broadcast failed:', notifErr.message)
    return NextResponse.json({ error: notifErr.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    broadcastTo: candidates.length,
    consultationId: consultation.id,
  })
}
