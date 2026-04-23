import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/signout
 *
 * Server-side sign-out. Clears the Supabase session (and its cookies)
 * on the server, then returns a 303 redirect to the locale home so the
 * browser lands on a public page with a fresh render (no stale session
 * in any React Query / Zustand cache).
 *
 * Called from <LogoutButton />. The existing top-nav dropdown also
 * continues to work via client-side `supabase.auth.signOut()`.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Derive locale from Referer if possible, else default to 'es'.
  const referer = request.headers.get('referer') || ''
  const localeMatch = referer.match(/\/(es|en)(\/|$)/)
  const locale = localeMatch ? localeMatch[1] : 'es'

  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/${locale}`, { status: 303 })
}
