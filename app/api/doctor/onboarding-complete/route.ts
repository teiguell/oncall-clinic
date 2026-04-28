import { NextResponse } from 'next/server'
import { createHash, randomBytes } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { notify } from '@/lib/notifications'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://oncall.clinic'

/**
 * POST /api/doctor/onboarding-complete — Round 11 Fix C.
 *
 * Called by the doctor onboarding Step 4 right after the contract is
 * accepted. Server-side responsibilities:
 *   1. Re-confirm the doctor row exists and belongs to the current user
 *      (RLS does this implicitly, we just join on user_id).
 *   2. Generate a single-use activation_email_token (32 hex chars,
 *      derived from a 16-byte cryptographic random + sha256 to keep
 *      the column human-unreadable).
 *   3. Set activation_status = 'pending_email', store the token + 24h
 *      expiry on the doctor_profiles row.
 *   4. Send notify('doctor.welcome') + notify('doctor.activation_email')
 *      to the doctor.
 *   5. Send notify('admin.doctor_signup') to ADMIN_NOTIFY_EMAIL with the
 *      doctor summary so the admin can review documents.
 *
 * Body shape (JSON):
 *   { locale?: 'es' | 'en' }
 *
 * Returns: { ok: boolean, activationStatus: string }
 */
export async function POST(request: Request) {
  let body: { locale?: string; inviteToken?: string }
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const locale = body.locale === 'en' ? 'en' : 'es'
  // Round 18-C: doctor may be onboarding from a clinic-issued invite
  // link (/doctor/onboarding?inviteToken=<UUID>). The client passes the
  // token through to this completion endpoint.
  const inviteToken = typeof body.inviteToken === 'string' && body.inviteToken.trim()
    ? body.inviteToken.trim()
    : null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Bypass passthrough so Cowork audit can complete onboarding too.
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'doctor' ? bypass.id : null)
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  // Profile + doctor row lookup
  const [profileRes, doctorRes] = await Promise.all([
    supabase.from('profiles').select('id, email, phone, full_name, role').eq('id', userId).maybeSingle(),
    supabase.from('doctor_profiles').select('id, license_number, insurance_company, policy_number, activation_status').eq('user_id', userId).maybeSingle(),
  ])

  if (profileRes.error || doctorRes.error) {
    console.error('[onboarding-complete] read error:',
      profileRes.error?.message || doctorRes.error?.message)
    return NextResponse.json({ error: 'db_error', code: 'db_error' }, { status: 500 })
  }

  const profile = profileRes.data
  const doc = doctorRes.data

  if (!profile || !doc) {
    return NextResponse.json({ error: 'profile_or_doctor_row_missing', code: 'not_found' }, { status: 404 })
  }
  if (profile.role !== 'doctor') {
    return NextResponse.json({ error: 'wrong_role', code: 'forbidden' }, { status: 403 })
  }

  // Idempotency: already past pending_email → don't re-fire emails.
  if (doc.activation_status && doc.activation_status !== 'pending_email' && doc.activation_status !== 'active') {
    // pending_sms / pending_admin_review / suspended — leave the row alone.
    return NextResponse.json({ ok: true, activationStatus: doc.activation_status, alreadyKicked: true })
  }

  // Generate a token: hex-encoded sha256 of 16 random bytes. 64 chars.
  const token = createHash('sha256').update(randomBytes(16)).digest('hex')
  const tokenExpires = new Date(Date.now() + 24 * 3600_000).toISOString() // 24h

  const { error: updateErr } = await supabase
    .from('doctor_profiles')
    .update({
      activation_status: 'pending_email',
      activation_email_token: token,
      activation_email_token_expires: tokenExpires,
    })
    .eq('id', doc.id)

  if (updateErr) {
    console.error('[onboarding-complete] update error:', updateErr.message)
    return NextResponse.json({ error: updateErr.message, code: 'db_error' }, { status: 500 })
  }

  // Fire-and-forget notifications. Errors do NOT fail the request — the
  // doctor's onboarding is already saved; resend can be triggered later.
  const confirmUrl = `${APP_URL}/api/auth/confirm-doctor?token=${token}&locale=${locale}`

  // 1) Welcome
  await notify({
    to: { email: profile.email, userId: profile.id },
    kind: 'doctor.welcome',
    data: { name: profile.full_name },
    channels: ['email'],
    locale,
  }).catch((e) => console.error('[onboarding-complete] welcome email failed:', e))

  // 2) Activation email
  await notify({
    to: { email: profile.email, userId: profile.id },
    kind: 'doctor.activation_email',
    data: { confirmUrl, name: profile.full_name },
    channels: ['email'],
    locale,
  }).catch((e) => console.error('[onboarding-complete] activation email failed:', e))

  // 3) Admin notification
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL
  if (adminEmail) {
    await notify({
      to: { email: adminEmail },
      kind: 'admin.doctor_signup',
      data: {
        name: profile.full_name,
        email: profile.email,
        licenseNumber: doc.license_number,
        insuranceCompany: doc.insurance_company,
        policyNumber: doc.policy_number,
        reviewUrl: `${APP_URL}/es/admin/verifications`,
      },
      channels: ['email'],
      locale: 'es',
    }).catch((e) => console.error('[onboarding-complete] admin email failed:', e))
  } else {
    console.warn('[onboarding-complete] ADMIN_NOTIFY_EMAIL unset — skipping admin notification')
  }

  // Round 18-C: if the doctor onboarded via a clinic invite, link them
  // to the clinic + mark the invite accepted. Best-effort; failures
  // don't roll back the onboarding (clinic owner can retry the
  // association from the dashboard).
  let clinicLink: { clinicId: string; linkId: string } | null = null
  if (inviteToken) {
    try {
      const { data: invite } = await supabase
        .from('clinic_doctor_invites')
        .select('id, clinic_id, expires_at, status')
        .eq('invite_token', inviteToken)
        .maybeSingle()

      if (
        invite &&
        invite.status === 'pending' &&
        new Date(invite.expires_at) > new Date()
      ) {
        // Insert clinic_doctors link with status='active'.
        const { data: linkRow, error: linkErr } = await supabase
          .from('clinic_doctors')
          .insert({
            clinic_id: invite.clinic_id,
            doctor_id: doc.id,
            status: 'active',
          })
          .select('id')
          .single()

        if (!linkErr && linkRow) {
          clinicLink = { clinicId: invite.clinic_id, linkId: linkRow.id }
          // Also stamp doctor_profiles.clinic_id as the doctor's
          // primary clinic (booking-Step-2 branding source).
          await supabase
            .from('doctor_profiles')
            .update({ clinic_id: invite.clinic_id })
            .eq('id', doc.id)
        }

        // Mark invite accepted regardless of link insert outcome —
        // the invite is consumed.
        await supabase
          .from('clinic_doctor_invites')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
          })
          .eq('id', invite.id)
      }
    } catch (e) {
      console.warn('[onboarding-complete] clinic invite link error:', e)
    }
  }

  return NextResponse.json({
    ok: true,
    activationStatus: 'pending_email',
    clinicLink,
  })
}
