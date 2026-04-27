import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

export const dynamic = 'force-dynamic'

/**
 * /api/clinic/profile — Round 15B-4.
 *
 *   GET   → current clinic's full row (auth-gated).
 *   PATCH → update mutable fields: name, phone, address, city, province,
 *           coverage_zones, coverage_radius_km, logo_url, website, description.
 *
 * Immutable here (admin-only): cif, legal_name, verification_status,
 * verified_at, commission_rate, stripe_account_id, max_doctors.
 */

async function resolveUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'clinic' ? bypass.id : null)
  return { supabase, userId }
}

export async function GET() {
  const { supabase, userId } = await resolveUserId()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  const { data: clinic, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    return NextResponse.json({ error: error.message, code: 'db_error' }, { status: 500 })
  }
  if (!clinic) {
    return NextResponse.json({ error: 'clinic_not_found', code: 'not_found' }, { status: 404 })
  }
  return NextResponse.json(clinic)
}

const MUTABLE_FIELDS = new Set([
  'name',
  'phone',
  'address',
  'city',
  'province',
  'coverage_zones',
  'coverage_radius_km',
  'logo_url',
  'website',
  'description',
  'email', // owner can update contact email; CIF stays locked
])

export async function PATCH(request: Request) {
  const { supabase, userId } = await resolveUserId()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json', code: 'bad_request' }, { status: 400 })
  }

  // Whitelist mutable fields. Anything outside MUTABLE_FIELDS is silently
  // dropped — caller doesn't get a 400 (forward-compat: client can send
  // a fuller object when new fields appear without breaking older
  // backends).
  const updates: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(body)) {
    if (MUTABLE_FIELDS.has(k)) updates[k] = v
  }
  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'no_mutable_fields', code: 'bad_request' }, { status: 400 })
  }
  updates.updated_at = new Date().toISOString()

  const { data: clinic, error } = await supabase
    .from('clinics')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .maybeSingle()
  if (error) {
    return NextResponse.json({ error: error.message, code: 'db_error' }, { status: 500 })
  }
  if (!clinic) {
    return NextResponse.json({ error: 'clinic_not_found', code: 'not_found' }, { status: 404 })
  }
  return NextResponse.json(clinic)
}
