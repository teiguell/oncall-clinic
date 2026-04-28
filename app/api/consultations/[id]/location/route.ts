import { NextResponse } from 'next/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/consultations/[id]/location — Round 17-E.
 *
 * Doctor's live geo-position update. The doctor PWA calls this every
 * ~30 s via navigator.geolocation.watchPosition while a consultation
 * is in 'accepted' or 'in_progress' status.
 *
 * Body: { lat: number, lng: number }
 *
 * Behaviour:
 *   - Auth: doctor session OR doctor bypass + ownership check
 *   - Status gate: only updates if consultation is accepted/in_progress
 *     (no point storing stale positions on completed/cancelled)
 *   - Updates doctor_position_lat/lng/at on the consultation row
 *
 * Patient tracking page polls the same row every 30 s for the live
 * pin. RLS allows the patient to read their own consultation row,
 * which includes these columns; that's the read surface.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: consultationId } = await context.params

  let body: { lat?: number; lng?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }
  const lat = Number(body.lat)
  const lng = Number(body.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat_lng_required', code: 'bad_request' }, { status: 400 })
  }

  const { userId, supabase } = await getEffectiveSession('doctor')
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  const { data: doctor } = await supabase
    .from('doctor_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  if (!doctor) {
    return NextResponse.json({ error: 'doctor_not_found', code: 'forbidden' }, { status: 403 })
  }

  const { data: consultation } = await supabase
    .from('consultations')
    .select('id, doctor_id, status')
    .eq('id', consultationId)
    .maybeSingle()
  if (!consultation || consultation.doctor_id !== doctor.id) {
    return NextResponse.json({ error: 'consultation_forbidden', code: 'forbidden' }, { status: 403 })
  }

  // Skip stale positions on completed/cancelled.
  if (consultation.status !== 'accepted' && consultation.status !== 'in_progress') {
    return NextResponse.json({ ok: true, status: 'skipped', reason: 'inactive_status' })
  }

  const { error } = await supabase
    .from('consultations')
    .update({
      doctor_position_lat: lat,
      doctor_position_lng: lng,
      doctor_position_at: new Date().toISOString(),
    })
    .eq('id', consultationId)

  if (error) {
    return NextResponse.json({ error: error.message, code: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
