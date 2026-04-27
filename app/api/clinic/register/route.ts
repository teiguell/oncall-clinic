import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getBypassUser, AUTH_BYPASS, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

export const dynamic = 'force-dynamic'

/**
 * POST /api/clinic/register — Round 15 Block 6 (essential subset).
 *
 * Creates a clinic row tied to the current authenticated user. If
 * there's no session, returns 401 — the form should send the user to
 * login first (the unified login page can stash the form data and
 * resubmit post-OAuth in Round 15B; for Phase 1, register requires
 * an existing session).
 *
 * Request body: {
 *   name, legalName, cif, email, phone?, address?, city, province?,
 *   coverageZones: string[], coverageRadiusKm: number, rcConfirmed: boolean
 * }
 *
 * Response: { ok, clinicId } on success, { error, code } on failure.
 *
 * Side effect: writes a row to `clinics` with verification_status='pending'.
 * Admin verifies the RC + CIF manually for alpha (Round 15B will add
 * automated CIF lookup via VIES + RC document upload).
 *
 * Note: an unauthenticated register (create user + clinic in one shot)
 * is deferred to Round 15B — the existing /signup flow + redirect would
 * lose the form data. For now, the user must login first (or use the
 * pro/doctor signup) and then visit /clinic/register.
 */
export async function POST(request: Request) {
  let body: {
    name?: string
    legalName?: string
    cif?: string
    email?: string
    phone?: string | null
    address?: string | null
    city?: string
    province?: string | null
    coverageZones?: string[]
    coverageRadiusKm?: number
    rcConfirmed?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }

  // Required-fields check (server has CHECK constraints too, but
  // catching here keeps error messages user-friendly).
  const missing: string[] = []
  if (!body.name?.trim()) missing.push('name')
  if (!body.legalName?.trim()) missing.push('legalName')
  if (!body.cif?.trim()) missing.push('cif')
  if (!body.email?.trim()) missing.push('email')
  if (!body.city?.trim()) missing.push('city')
  if (!body.coverageZones?.length) missing.push('coverageZones')
  if (!body.rcConfirmed) missing.push('rcConfirmed')
  if (missing.length) {
    return NextResponse.json(
      { error: 'missing_fields', code: 'bad_request', missing },
      { status: 400 },
    )
  }

  // Round 14F-3: cookieSupabase for session; service-role for INSERT in bypass.
  const cookieSupabase = await createClient()
  const {
    data: { user },
  } = await cookieSupabase.auth.getUser()
  const bypass = getBypassUser()
  const effectiveUserId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'clinic' ? bypass.id : null)
  if (!effectiveUserId) {
    return NextResponse.json(
      {
        error: 'unauthorized',
        code: 'unauthorized',
        hint: 'Sign in or sign up first, then visit /clinic/register.',
      },
      { status: 401 },
    )
  }
  const supabase = !user && AUTH_BYPASS && bypass
    ? createServiceRoleClient()
    : cookieSupabase

  // Check if this user already has a clinic row.
  const { data: existing } = await supabase
    .from('clinics')
    .select('id, verification_status')
    .eq('user_id', effectiveUserId)
    .maybeSingle()
  if (existing) {
    return NextResponse.json(
      {
        error: 'clinic_already_exists',
        code: 'conflict',
        clinicId: existing.id,
        verificationStatus: existing.verification_status,
      },
      { status: 409 },
    )
  }

  // Insert the clinic row.
  const { data: clinic, error: insertErr } = await supabase
    .from('clinics')
    .insert({
      user_id: effectiveUserId,
      name: body.name!.trim(),
      legal_name: body.legalName!.trim(),
      cif: body.cif!.trim().toUpperCase(),
      email: body.email!.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      address: body.address?.trim() || null,
      city: body.city!.trim(),
      province: body.province?.trim() || null,
      coverage_zones: body.coverageZones!,
      coverage_radius_km: Math.max(1, Math.min(200, Math.round(body.coverageRadiusKm ?? 25))),
      verification_status: 'pending',
      // commission_rate, rc_insurance_verified, etc. all use migration defaults
    })
    .select('id')
    .single()

  if (insertErr) {
    console.error('[clinic/register] insert error:', insertErr)
    // Pretty error if CIF unique violates
    if (insertErr.code === '23505') {
      return NextResponse.json(
        { error: 'cif_already_registered', code: 'conflict' },
        { status: 409 },
      )
    }
    return NextResponse.json(
      { error: 'register_failed', code: 'internal', detail: insertErr.message },
      { status: 500 },
    )
  }

  // Update the user's profile.role → 'clinic' so middleware routes work.
  // Best-effort; failure here doesn't block the flow.
  await supabase
    .from('profiles')
    .update({ role: 'clinic' })
    .eq('id', effectiveUserId)

  return NextResponse.json({ ok: true, clinicId: clinic.id, status: 'pending' })
}
