import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * POST /api/consent
 *
 * Legacy single-type toggle endpoint used by the /patient/privacy page.
 * As of migration 019 (BLOQUE D), this endpoint writes to `user_consents`
 * (the single-row-per-user current state), NOT to the deprecated
 * `consent_log` audit table.
 *
 * Accepts body: { consent_type, granted } where consent_type ∈
 *   'health_data_processing' | 'geolocation_tracking' | 'analytics'
 *   | 'marketing_communications' | 'profiling'
 *
 * Reads the user's current row, flips the single field, upserts.
 * Unlike /api/consent/state, this does NOT enforce mandatory consents —
 * it's a general-purpose toggle used for revoking from the privacy page
 * (a user CAN revoke health_data if they want to stop using the service;
 * that's their right under Art. 7(3) GDPR).
 */

const TYPE_TO_COLUMN: Record<string, 'health_data' | 'geolocation' | 'analytics' | 'marketing' | 'profiling'> = {
  health_data_processing: 'health_data',
  geolocation_tracking: 'geolocation',
  analytics: 'analytics',
  marketing_communications: 'marketing',
  profiling: 'profiling',
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed } = checkRateLimit(ip, 10, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: { consent_type?: unknown; granted?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const consentType = typeof body.consent_type === 'string' ? body.consent_type : ''
  const granted = body.granted === true
  const column = TYPE_TO_COLUMN[consentType]
  if (!column) {
    return NextResponse.json(
      { error: `unknown consent_type: ${consentType}` },
      { status: 400 }
    )
  }

  const ua = request.headers.get('user-agent') || null

  // Fetch current row (RLS ensures own row only)
  const { data: existing } = await supabase
    .from('user_consents')
    .select('health_data, geolocation, analytics, marketing, profiling')
    .eq('user_id', user.id)
    .maybeSingle()

  const merged = {
    user_id: user.id,
    health_data: existing?.health_data ?? false,
    geolocation: existing?.geolocation ?? false,
    analytics: existing?.analytics ?? false,
    marketing: existing?.marketing ?? false,
    profiling: existing?.profiling ?? false,
    consented_at: new Date().toISOString(),
    ip_address: ip,
    user_agent: ua,
    version: '1.0',
  }
  merged[column] = granted

  const { error } = await supabase
    .from('user_consents')
    .upsert(merged, { onConflict: 'user_id' })

  if (error) {
    console.error('user_consents upsert error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
