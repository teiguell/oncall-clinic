import { NextResponse, type NextRequest } from 'next/server'

/**
 * POST /api/waitlist — Round 23-2 (Q5-2).
 *
 * Accepts `{email, source, locale, city_interest?}`. Round 23-4 will
 * back this with a real Supabase `waitlist` table (migration 034) +
 * service-role INSERT. For now we validate the payload, log it
 * server-side, and return 200 so the UX is already correct.
 *
 * Round 23-4 should swap the body of this handler with the actual
 * INSERT (`onConflict('email').ignore()` so duplicates are no-ops).
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
    typeof payload.city_interest === 'string' ? payload.city_interest.slice(0, 64) : null

  // Round 23-2 stub: log only. Replace with Supabase INSERT in 23-4.
  // Using stderr (console.warn) so the entry is visible in Vercel
  // logs at the default verbosity without turning on debug logs.
  console.warn(
    `[waitlist:23-2-stub] email=${email} source=${source} locale=${locale} city=${city_interest ?? '-'}`,
  )

  return NextResponse.json({ ok: true })
}
