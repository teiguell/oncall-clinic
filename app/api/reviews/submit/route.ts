import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

/**
 * POST /api/reviews/submit — Round 17-C.
 *
 * Public unauthenticated endpoint that accepts a review submission
 * tied to a consultation via either:
 *   - { token: string }       — review_token from the SMS link
 *   - { consultationId }      — fallback, used by R17-B SMS that fired
 *                                BEFORE migration 031 added review_token
 *
 * Body: { token?, consultationId?, rating: 1-5, comment?: string }
 *
 * Behaviour:
 *   1. Look up the consultation (must be 'completed') + verify the
 *      caller knows the token OR the consultation_id (the SMS is the
 *      auth surface).
 *   2. Reject if a review row already exists (UNIQUE consultation_id).
 *   3. INSERT row with the patient_id + doctor_id from the consultation.
 *
 * Uses the service-role client because the patient is unauthenticated
 * here (token = possession proof). RLS would block an INSERT by anon.
 *
 * Returns: { ok, reviewId } on success.
 */
export async function POST(request: Request) {
  let body: { token?: string; consultationId?: string; rating?: number; comment?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }

  const rating = Number(body.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating_out_of_range', code: 'bad_request' }, { status: 400 })
  }
  if (!body.token && !body.consultationId) {
    return NextResponse.json({ error: 'token_or_consultation_required', code: 'bad_request' }, { status: 400 })
  }

  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 500) : null

  const supabase = createServiceRoleClient()

  // Resolve the consultation. Token path is preferred; consultation_id
  // is the fallback for R17-B SMS that fired before 031 migrated.
  let consultationId: string | null = null
  let patientId: string | null = null
  let doctorRowId: string | null = null

  if (body.token) {
    // Token-based: look up an existing review row pre-issued (none yet)
    // OR look up the consultation by direct join (review_token would be
    // on the consultations table for SMS-time issuance — but R17-B sends
    // the consultation_id as the URL token, so this path is mostly
    // future-proofing for a separate "preissue review token" scheme).
    const { data: existing } = await supabase
      .from('consultation_reviews')
      .select('id, consultation_id, patient_id, doctor_id, rating')
      .eq('review_token', body.token)
      .maybeSingle()
    if (existing) {
      // Already submitted? (rating > 0 means full row, not just preissue)
      if (existing.rating && existing.rating > 0) {
        return NextResponse.json(
          { error: 'already_submitted', code: 'conflict', reviewId: existing.id },
          { status: 409 },
        )
      }
      consultationId = existing.consultation_id
      patientId = existing.patient_id
      doctorRowId = existing.doctor_id
    }
  }

  if (!consultationId) {
    const lookupId = body.consultationId ?? body.token
    if (!lookupId) {
      return NextResponse.json({ error: 'invalid_token', code: 'not_found' }, { status: 404 })
    }
    const { data: consultation } = await supabase
      .from('consultations')
      .select('id, status, patient_id, doctor_id')
      .eq('id', lookupId)
      .maybeSingle()
    if (!consultation) {
      return NextResponse.json({ error: 'consultation_not_found', code: 'not_found' }, { status: 404 })
    }
    if (consultation.status !== 'completed') {
      return NextResponse.json(
        { error: 'consultation_not_completed', code: 'bad_request', currentStatus: consultation.status },
        { status: 400 },
      )
    }
    consultationId = consultation.id
    patientId = consultation.patient_id
    doctorRowId = consultation.doctor_id
  }

  // Reject duplicate (UNIQUE consultation_id constraint guards this too,
  // but a clean 409 beats a raw 23505).
  const { data: dupe } = await supabase
    .from('consultation_reviews')
    .select('id')
    .eq('consultation_id', consultationId)
    .maybeSingle()
  if (dupe?.id) {
    return NextResponse.json(
      { error: 'already_submitted', code: 'conflict', reviewId: dupe.id },
      { status: 409 },
    )
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('consultation_reviews')
    .insert({
      consultation_id: consultationId,
      patient_id: patientId,
      doctor_id: doctorRowId,
      rating,
      comment,
      is_public: true,
    })
    .select('id')
    .single()
  if (insertErr) {
    return NextResponse.json(
      { error: insertErr.message, code: insertErr.code === '23505' ? 'conflict' : 'db_error' },
      { status: insertErr.code === '23505' ? 409 : 500 },
    )
  }

  return NextResponse.json({ ok: true, reviewId: inserted.id })
}
