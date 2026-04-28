import { NextResponse } from 'next/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/consultations/[id]/internal-note — Round 17-C.
 *
 * Doctor adds an operational note tied to a consultation. R7 vigente:
 * notes are LOGÍSTICAS NO CLÍNICAS. Validation is best-effort string
 * scrubbing — the doctor takes ultimate responsibility, but we
 * enforce a lightweight prefix-blocklist + length cap to nudge them
 * away from clinical content.
 *
 * Body: { note: string }
 *
 * Auth: real doctor session OR doctor bypass + ownership of the
 * consultation.
 *
 * Returns: { ok, noteId }
 */

const MAX_NOTE_LENGTH = 500

// R7 nudges: words that strongly suggest clinical content. Not a hard
// block — just rejects obvious cases. Doctor with intent can bypass.
const CLINICAL_HINT_PATTERNS = [
  /\bsínto?ma|symptom/i,
  /\bdiagn[óo]stico|diagnosis/i,
  /\bprescrib|presc?ription|receta/i,
  /\btratamiento|treatment plan/i,
  /\bdolor|pain (level|score)/i,
  /\bmg\b|\bml\b.*\d/i, // dosage hints
]

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: consultationId } = await context.params

  let body: { note?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }

  const note = typeof body.note === 'string' ? body.note.trim() : ''
  if (!note) {
    return NextResponse.json({ error: 'note_required', code: 'bad_request' }, { status: 400 })
  }
  if (note.length > MAX_NOTE_LENGTH) {
    return NextResponse.json(
      { error: 'note_too_long', code: 'bad_request', max: MAX_NOTE_LENGTH },
      { status: 400 },
    )
  }
  // R7 soft block: clinical-hint patterns
  for (const pattern of CLINICAL_HINT_PATTERNS) {
    if (pattern.test(note)) {
      return NextResponse.json(
        {
          error: 'clinical_content_not_allowed',
          code: 'r7_violation',
          hint: 'Las notas internas son operativas, no clínicas. Usa la historia clínica de tu propio sistema para datos de salud.',
        },
        { status: 422 },
      )
    }
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
    .select('id, doctor_id')
    .eq('id', consultationId)
    .maybeSingle()
  if (!consultation || consultation.doctor_id !== doctor.id) {
    return NextResponse.json({ error: 'consultation_forbidden', code: 'forbidden' }, { status: 403 })
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('consultation_internal_notes')
    .insert({
      consultation_id: consultationId,
      doctor_id: doctor.id,
      note,
    })
    .select('id')
    .single()
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message, code: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, noteId: inserted.id })
}
