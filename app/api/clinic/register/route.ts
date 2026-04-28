import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getBypassUser, AUTH_BYPASS, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

export const dynamic = 'force-dynamic'

/**
 * POST /api/clinic/register — Round 18-C (anonymous flow).
 *
 * Two paths:
 *
 *   PATH 1 (auth'd): user has a real cookie session OR is the clinic
 *     bypass. We INSERT clinics + UPDATE profiles.role='clinic' tied
 *     to that user. Same as the original Round 15A flow.
 *
 *   PATH 2 (anonymous): no session. We use the service-role client to
 *     call supabase.auth.admin.inviteUserByEmail(email) — Supabase
 *     creates the auth.users row + sends a magic-link email. Then
 *     INSERT profiles + clinics + UPDATE role='clinic' tied to the
 *     newly-minted user.
 *     The clinic owner clicks the magic-link → lands authenticated
 *     on /clinic/dashboard with the verification banner.
 *
 * Request body: {
 *   name, legalName, cif, email, phone?, address?, city, province?,
 *   coverageZones: string[], coverageRadiusKm: number, rcConfirmed: boolean,
 *   stripeAccountId?: string  // optional, populated from Stripe Connect step
 * }
 *
 * Response: { ok, clinicId, magicLinkSent? } on success, { error, code } on failure.
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
    stripeAccountId?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }

  // Required fields
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

  const trimmedEmail = body.email!.trim().toLowerCase()

  // Resolve session (Path 1) or fall through to anonymous (Path 2).
  const cookieSupabase = await createClient()
  const {
    data: { user },
  } = await cookieSupabase.auth.getUser()
  const bypass = getBypassUser()
  const sessionUserId =
    user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'clinic' ? bypass.id : null)

  // Service-role client for ALL writes — RLS would block the anonymous
  // path, and the auth'd path benefits from the same uniformity. We've
  // already verified the user identity via the cookie session above
  // for Path 1.
  const adminClient = createServiceRoleClient()

  let effectiveUserId: string
  let magicLinkSent = false

  if (sessionUserId) {
    // PATH 1: authenticated — register tied to the existing user.
    effectiveUserId = sessionUserId

    // Check if this user already has a clinic.
    const { data: existing } = await adminClient
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
  } else {
    // PATH 2: anonymous — invite a new user via magic link.
    if (AUTH_BYPASS) {
      // Bypass envs without a clinic role + no real session: refuse so
      // we don't accidentally seed multiple test clinics.
      return NextResponse.json(
        { error: 'bypass_session_required', code: 'unauthorized' },
        { status: 401 },
      )
    }

    // Check if a profile with this email already exists — if yes, the
    // anonymous register would collide.
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, role')
      .eq('email', trimmedEmail)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        {
          error: 'email_already_registered',
          code: 'conflict',
          hint: 'Inicia sesión con este email y vuelve a /clinic/register para continuar.',
        },
        { status: 409 },
      )
    }

    // Mint a new auth.users row + send magic-link email.
    type InviteAuth = {
      auth: {
        admin: {
          inviteUserByEmail: (
            email: string,
            options?: { redirectTo?: string },
          ) => Promise<{
            data: { user: { id: string } | null }
            error: { message: string } | null
          }>
        }
      }
    }
    const baseUrl = new URL(request.url).origin
    const invite = await (adminClient as unknown as InviteAuth).auth.admin.inviteUserByEmail(
      trimmedEmail,
      { redirectTo: `${baseUrl}/es/clinic/dashboard` },
    )
    if (invite.error || !invite.data?.user?.id) {
      console.error('[clinic/register] inviteUserByEmail error:', invite.error)
      return NextResponse.json(
        { error: invite.error?.message ?? 'invite_failed', code: 'invite_failed' },
        { status: 500 },
      )
    }
    effectiveUserId = invite.data.user.id
    magicLinkSent = true

    // Insert profile shell so middleware / role gates see role='clinic'.
    await adminClient.from('profiles').insert({
      id: effectiveUserId,
      email: trimmedEmail,
      full_name: body.name!.trim(),
      role: 'clinic',
      phone: body.phone?.trim() || null,
    })
  }

  // Insert clinic row (both paths).
  const { data: clinic, error: insertErr } = await adminClient
    .from('clinics')
    .insert({
      user_id: effectiveUserId,
      name: body.name!.trim(),
      legal_name: body.legalName!.trim(),
      cif: body.cif!.trim().toUpperCase(),
      email: trimmedEmail,
      phone: body.phone?.trim() || null,
      address: body.address?.trim() || null,
      city: body.city!.trim(),
      province: body.province?.trim() || null,
      coverage_zones: body.coverageZones!,
      coverage_radius_km: Math.max(1, Math.min(200, Math.round(body.coverageRadiusKm ?? 25))),
      verification_status: 'pending',
      stripe_account_id: body.stripeAccountId ?? null,
    })
    .select('id')
    .single()

  if (insertErr) {
    console.error('[clinic/register] insert error:', insertErr)
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

  // Best-effort: align profile.role for the auth'd path (Path 1)
  await adminClient
    .from('profiles')
    .update({ role: 'clinic' })
    .eq('id', effectiveUserId)

  // TODO: send admin notification email ("Nueva clínica pendiente
  // de verificación: {name} CIF {cif}"). The admin contact lives in
  // ADMIN_NOTIFY_EMAIL env var; sendEmail is in lib/notifications.
  // Deferred to follow-up — the dashboard banner already surfaces
  // pending verification on the clinic side.

  return NextResponse.json({
    ok: true,
    clinicId: clinic.id,
    status: 'pending',
    magicLinkSent,
  })
}
