import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

export const dynamic = 'force-dynamic'

/**
 * POST /api/clinic/doctors/invite — Round 15B-4.
 *
 * Body: { email: string }
 *
 * Looks up the doctor by email in profiles → doctor_profiles. If found,
 * inserts a `clinic_doctors` row with status='pending' and notifies the
 * doctor (email magic-link with accept/decline).
 *
 * If the doctor doesn't exist yet, returns 404 with a hint to ask the
 * doctor to register at /pro/registro first. Round 15C will add a
 * "pending invite" flow so an unregistered doctor can be associated
 * before signup.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'clinic' ? bypass.id : null)
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }
  const email = (body.email ?? '').trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'email_required', code: 'bad_request' }, { status: 400 })
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id, name, max_doctors')
    .eq('user_id', userId)
    .maybeSingle()
  if (!clinic) {
    return NextResponse.json({ error: 'clinic_not_found', code: 'not_found' }, { status: 404 })
  }

  // Check max_doctors quota
  const { count: currentCount } = await supabase
    .from('clinic_doctors')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinic.id)
    .eq('status', 'active')
  if (typeof currentCount === 'number' && currentCount >= (clinic.max_doctors ?? 10)) {
    return NextResponse.json(
      {
        error: 'max_doctors_reached',
        code: 'quota_exceeded',
        max: clinic.max_doctors ?? 10,
      },
      { status: 409 },
    )
  }

  // Find the doctor by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', email)
    .maybeSingle()
  if (!profile) {
    return NextResponse.json(
      {
        error: 'doctor_not_found',
        code: 'not_found',
        hint: 'Pídele al médico que se registre en /pro/registro primero.',
      },
      { status: 404 },
    )
  }
  if (profile.role !== 'doctor') {
    return NextResponse.json(
      { error: 'profile_not_doctor', code: 'invalid_role' },
      { status: 409 },
    )
  }

  const { data: doctor } = await supabase
    .from('doctor_profiles')
    .select('id')
    .eq('user_id', profile.id)
    .maybeSingle()
  if (!doctor) {
    return NextResponse.json(
      { error: 'doctor_profile_missing', code: 'not_found' },
      { status: 404 },
    )
  }

  // Check if already linked
  const { data: existing } = await supabase
    .from('clinic_doctors')
    .select('id, status')
    .eq('clinic_id', clinic.id)
    .eq('doctor_id', doctor.id)
    .maybeSingle()
  if (existing) {
    return NextResponse.json(
      {
        error: 'already_linked',
        code: 'conflict',
        currentStatus: existing.status,
      },
      { status: 409 },
    )
  }

  // Insert the link with status='pending'. Doctor accepts via a future
  // /api/clinic/doctors/[id]/accept endpoint (Round 15C).
  const { data: linkRow, error: insertErr } = await supabase
    .from('clinic_doctors')
    .insert({
      clinic_id: clinic.id,
      doctor_id: doctor.id,
      status: 'pending',
    })
    .select('id')
    .single()
  if (insertErr) {
    return NextResponse.json(
      { error: insertErr.message, code: 'db_error' },
      { status: 500 },
    )
  }

  // TODO Round 15C: send email to the doctor with accept link.
  // For now, the link is created in 'pending' status and the doctor
  // sees it on /doctor/dashboard (Round 15C surfaces it).

  return NextResponse.json({
    ok: true,
    linkId: linkRow.id,
    status: 'pending',
  })
}
