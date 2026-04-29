import { NextResponse, type NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

/**
 * POST /api/waitlist — Round 23-4 (Q5-6).
 *
 * Accepts `{email, source, locale, city_interest?}`. Inserts into
 * `public.waitlist` via the service-role client (the table's RLS
 * allows anon INSERT, but using service-role lets us short-circuit
 * the JWT round-trip and keep the endpoint stateless).
 *
 * Idempotent on email — duplicates are no-ops (UNIQUE constraint +
 * we explicitly catch the 23505 PG error code so the user still
 * sees the success state instead of a confusing "already registered"
 * error). Lost data scenario from the 23-2 stub is irrelevant; the
 * stub never persisted.
 *
 * R7 ✅ — emails are not health data; just acquisition signals.
 */
export async function POST(req: NextRequest) {
  let payload: {
    email?: unknown
    source?: unknown
    locale?: unknown
    city_interest?: unknown
  }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  const source = typeof payload.source === 'string' ? payload.source.slice(0, 64) : 'unknown'
  const locale = typeof payload.locale === 'string' ? payload.locale.slice(0, 8) : 'es'
  const city_interest =
    typeof payload.city_interest === 'string' && payload.city_interest.length > 0
      ? payload.city_interest.slice(0, 64)
      : null

  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase.from('waitlist').insert({
      email,
      source,
      locale,
      city_interest,
    })

    if (error) {
      // Postgres unique_violation — same email already in the table.
      // From the user's perspective this is success ("we already
      // have you, no action needed").
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, duplicate: true })
      }
      console.error('[waitlist] insert error', { code: error.code, message: error.message })
      return NextResponse.json({ error: 'Could not save email' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[waitlist] unexpected error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
