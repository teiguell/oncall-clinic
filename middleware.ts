import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip for API routes, Next internals, and well-known root files
  // (audit P1-3: /sitemap.xml and /robots.txt were being intercepted by
  // next-intl and redirected to /<locale>/sitemap.xml → 404. Same issue
  // potentially for favicon/icon/manifest if they ever route-match.)
  // Round 17-F + R16-C: /sw.js (service worker) + /.well-known/ (Apple Pay
  // verification + future security.txt) must also pass through verbatim.
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/.well-known/') ||
    pathname === '/sw.js' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.png' ||
    pathname.startsWith('/manifest')
  ) {
    return NextResponse.next()
  }

  // Apply next-intl routing (locale detection & prefix redirect)
  const intlResponse = intlMiddleware(request)

  // If intl middleware issued a redirect (e.g., / → /es), honour it
  if (intlResponse.status !== 200) {
    return intlResponse
  }

  // Apply Supabase session refresh + route protection
  const supabaseResponse = await updateSession(request)

  // Preserve next-intl headers (e.g., x-next-intl-locale) so getMessages()
  // resolves the correct locale. Without this merge, /en URLs fall back to
  // defaultLocale because Supabase middleware returns a fresh NextResponse.
  if (supabaseResponse) {
    intlResponse.headers.forEach((value, key) => {
      if (!supabaseResponse.headers.has(key)) {
        supabaseResponse.headers.set(key, value)
      }
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
