import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getBypassUser, AUTH_BYPASS, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

export const dynamic = 'force-dynamic'

/**
 * POST /api/clinic/doctors/invite — Round 18-C extension of R15B-4.
 *
 * Body: { email: string, name?: string }
 *
 * Path A (doctor registered): INSERT clinic_doctors status='pending'
 * Path B (doctor not registered): INSERT clinic_doctor_invites with
 * a magic-link token. Future: Resend email "Clínica X te invita a
 * unirte: {url}/doctor/onboarding?inviteToken={token}".
 *
 * Both paths respect max_doctors quota (active + pending invites).
 */
export async function POST(request: Request) {
  const cookieSupabase = await createClient()
  const {
    data: { user },
  } = await cookieSupabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'clinic' ? bypass.id : null)
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  // Use service-role for writes (R14F-3 pattern, consistent with register).
  const supabase = !user && AUTH_BYPASS && bypass
    ? createServiceRoleClient()
    : cookieSupabase

  let body: { email?: string; name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }
  const email = (body.email ?? '').trim().toLowerCase()
  const doctorName = (body.name ?? '').trim() || null
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

  // Quota: active links + pending invites both count
  const [{ count: activeLinks }, { count: pendingInvites }] = await Promise.all([
    supabase
      .from('clinic_doctors')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinic.id)
      .eq('status', 'active'),
    supabase
      .from('clinic_doctor_invites')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinic.id)
      .eq('status', 'pending'),
  ])
  const totalUsage = (activeLinks ?? 0) + (pendingInvites ?? 0)
  if (totalUsage >= (clinic.max_doctors ?? 10)) {
    return NextResponse.json(
      {
        error: 'max_doctors_reached',
        code: 'quota_exceeded',
        max: clinic.max_doctors ?? 10,
      },
      { status: 409 },
    )
  }

  // Path A: doctor already registered?
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', email)
    .maybeSingle()

  if (profile) {
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
    return NextResponse.json({
      ok: true,
      path: 'registered',
      linkId: linkRow.id,
      status: 'pending',
    })
  }

  // Path B: doctor not registered → issue invite token.
  // Idempotency: re-issue existing pending non-expired invite.
  const { data: existingInvite } = await supabase
    .from('clinic_doctor_invites')
    .select('id, invite_token, expires_at')
    .eq('clinic_id', clinic.id)
    .eq('doctor_email', email)
    .eq('status', 'pending')
    .maybeSingle()

  const baseUrl = new URL(request.url).origin

  if (existingInvite && new Date(existingInvite.expires_at) > new Date()) {
    return NextResponse.json({
      ok: true,
      path: 'invite_resent',
      inviteId: existingInvite.id,
      inviteToken: existingInvite.invite_token,
      inviteUrl: `${baseUrl}/es/doctor/onboarding?inviteToken=${existingInvite.invite_token}`,
    })
  }

  const { data: inviteRow, error: inviteErr } = await supabase
    .from('clinic_doctor_invites')
    .insert({
      clinic_id: clinic.id,
      doctor_email: email,
      doctor_name: doctorName,
    })
    .select('id, invite_token, expires_at')
    .single()
  if (inviteErr) {
    return NextResponse.json(
      { error: inviteErr.message, code: 'db_error' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    path: 'invited_anonymous',
    inviteId: inviteRow.id,
    inviteToken: inviteRow.invite_token,
    inviteUrl: `${baseUrl}/es/doctor/onboarding?inviteToken=${inviteRow.invite_token}`,
    expiresAt: inviteRow.expires_at,
  })
}
