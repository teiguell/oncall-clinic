import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * POST /api/consent/state
 *
 * Upserts the CURRENT GDPR consent state for the authenticated user
 * (single row in `user_consents`). Also validates that mandatory consents
 * (health_data + geolocation) are granted — otherwise the service cannot
 * be provided (matching doctor without geolocation is impossible; health
 * data is required by Art. 9.2.a GDPR).
 *
 * Complements the immutable audit log in /api/consent (→ consent_log).
 * Both endpoints coexist: this one is the quick-lookup "latest state",
 * /api/consent is the append-only audit trail.
 */
export async function POST(request: NextRequest) {
  // Rate limit: 10 consent requests per minute per IP
  const ip = getClientIp(request)
  const { allowed } = checkRateLimit(ip, 10, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Session auth — the user must be signed in to record their consent
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: {
    health_data?: unknown
    geolocation?: unknown
    analytics?: unknown
    marketing?: unknown
    profiling?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  // Mandatory consents must be explicitly true — no coercion from truthy
  // non-boolean inputs (e.g. strings, 1). This prevents accidental consent.
  if (body.health_data !== true || body.geolocation !== true) {
    return NextResponse.json(
      { error: 'mandatory consents missing' },
      { status: 400 }
    )
  }

  const ua = request.headers.get('user-agent') || null

  const { error } = await supabase.from('user_consents').upsert(
    {
      user_id: user.id,
      health_data: true,
      geolocation: true,
      analytics: body.analytics === true,
      marketing: body.marketing === true,
      profiling: body.profiling === true,
      consented_at: new Date().toISOString(),
      ip_address: ip,
      user_agent: ua,
      version: '1.0',
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    console.error('user_consents upsert error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
