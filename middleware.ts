import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/')
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
  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
