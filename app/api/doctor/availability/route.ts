import { NextResponse } from 'next/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'

export const dynamic = 'force-dynamic'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
type Day = (typeof DAYS)[number]
type Slot = [string, string] // [from, to] HH:MM

const TIME_RE = /^\d{2}:\d{2}$/

function isValidSlot(slot: unknown): slot is Slot {
  if (!Array.isArray(slot) || slot.length !== 2) return false
  const [from, to] = slot
  if (typeof from !== 'string' || typeof to !== 'string') return false
  if (!TIME_RE.test(from) || !TIME_RE.test(to)) return false
  return from < to
}

function isValidSchedule(input: unknown): input is Record<Day, Slot[]> {
  if (!input || typeof input !== 'object') return false
  for (const day of DAYS) {
    const slots = (input as Record<string, unknown>)[day]
    if (!Array.isArray(slots)) return false
    if (!slots.every(isValidSlot)) return false
  }
  return true
}

/**
 * GET /api/doctor/availability — Round 17-D.
 *
 * Returns the current doctor's `availability_schedule` JSONB. Returns
 * an empty default object when not yet set.
 *
 * Body schema (PUT):
 *   { mon: [['08:00','14:00']], tue: [], ..., sun: [] }
 */
export async function GET() {
  const { userId, supabase } = await getEffectiveSession('doctor')
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: doctor } = await supabase
    .from('doctor_profiles')
    .select('availability_schedule')
    .eq('user_id', userId)
    .maybeSingle()

  return NextResponse.json({
    schedule:
      doctor?.availability_schedule ??
      DAYS.reduce<Record<string, Slot[]>>((acc, d) => ({ ...acc, [d]: [] }), {}),
  })
}

/**
 * PUT /api/doctor/availability — Round 17-D.
 *
 * Replaces the doctor's weekly schedule. Validates structure: 7 days
 * (mon..sun) each containing an array of [HH:MM, HH:MM] tuples where
 * from < to.
 */
export async function PUT(request: Request) {
  const { userId, supabase } = await getEffectiveSession('doctor')
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }

  const schedule = (body as { schedule?: unknown })?.schedule
  if (!isValidSchedule(schedule)) {
    return NextResponse.json(
      { error: 'invalid_schedule', code: 'bad_request' },
      { status: 400 },
    )
  }

  const { error } = await supabase
    .from('doctor_profiles')
    .update({ availability_schedule: schedule })
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: error.message, code: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, schedule })
}
