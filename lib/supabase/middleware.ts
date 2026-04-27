import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getBypassUser } from '@/lib/auth-bypass'

// Extract locale from path (e.g., /es/patient/dashboard → es)
function getLocaleFromPath(path: string): string {
  const match = path.match(/^\/(es|en)(\/|$)/)
  return match ? match[1] : 'es'
}

// Strip locale prefix from path
function stripLocale(path: string): string {
  return path.replace(/^\/(es|en)/, '') || '/'
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Guard: if Supabase env vars are missing, skip auth middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Round 14 P0 #1 — bypass-aware route guard. When NEXT_PUBLIC_AUTH_BYPASS=true
  // and a real session is absent, fall back to the synthetic bypass user
  // (role-aware: patient | doctor | admin per AUTH_BYPASS_ROLE). Real
  // sessions ALWAYS win — the bypass is only a fallback. Without this,
  // the middleware blocked Cowork audits even though the banner showed
  // (DOCTOR) and the API endpoint accepted the bypass — the layout/route
  // guards were rejecting first.
  const { data: { user: realUser } } = await supabase.auth.getUser()
  const bypassUser = getBypassUser()
  const user = realUser ?? bypassUser

  const fullPath = request.nextUrl.pathname
  const locale = getLocaleFromPath(fullPath)
  const path = stripLocale(fullPath)

  // Expose the current path to server components (layouts) via a header.
  // Used by `/[locale]/patient/layout.tsx` to skip the consent gate on
  // `/patient/request` itself (prevents redirect loops).
  supabaseResponse.headers.set('x-pathname', fullPath)

  // ITEM 0: `/patient/request` is EXCLUDED from protection. The Step 3 of
  // the booking flow has its own inline auth (login/register without leaving
  // the page) which preserves the user's progress. Forcing a redirect here
  // breaks the purchase flow on mobile.
  const protectedPatientRoutes = [
    '/patient/dashboard',
    '/patient/consultations',
    '/patient/profile',
    '/patient/booking-success',
    '/patient/tracking',
    '/patient/history',
    '/patient/privacy',
  ]
  const protectedDoctorRoutes = ['/doctor']
  const protectedAdminRoutes = ['/admin']
  // Round 15: /clinic/* is the B2B authenticated surface. The /clinic/login +
  // /clinic/register pages stay public — they live in the (auth) route group
  // under (auth)/clinic/* and are NOT prefixed with these protected paths.
  const protectedClinicRoutes = [
    '/clinic/dashboard',
    '/clinic/doctors',
    '/clinic/consultations',
    '/clinic/settings',
    '/clinic/profile',
  ]
  const authRoutes = ['/login', '/register']

  // Redirect to locale-prefixed login if not authenticated on protected route
  if (!user && (
    protectedPatientRoutes.some(r => path.startsWith(r)) ||
    protectedDoctorRoutes.some(r => path.startsWith(r)) ||
    protectedAdminRoutes.some(r => path.startsWith(r)) ||
    protectedClinicRoutes.some(r => path.startsWith(r))
  )) {
    const redirectUrl = request.nextUrl.clone()
    // Round 15: clinic routes redirect to /clinic/login so role context
    // is preserved (the unified login reads ?role=clinic and adapts copy).
    const isClinicRoute = protectedClinicRoutes.some(r => path.startsWith(r))
    redirectUrl.pathname = isClinicRoute
      ? `/${locale}/clinic/login`
      : `/${locale}/login`
    redirectUrl.searchParams.set('next', fullPath)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages to their dashboard.
  // Round 14: when the user is the bypass user (no real session), the
  // role comes from `bypassUser.role` (set at build time by env var) —
  // we cannot query `profiles` for the bypass id without an extra RLS
  // round-trip, and the bypass UUID always has the right role row in DB
  // anyway. Real users continue to use the live profiles lookup.
  if (user && authRoutes.some(r => path.startsWith(r))) {
    let role: string | null | undefined
    if (realUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', realUser.id)
        .single()
      role = profile?.role
    } else if (bypassUser) {
      role = bypassUser.role
    }

    const redirectUrl = request.nextUrl.clone()
    if (role === 'doctor') {
      redirectUrl.pathname = `/${locale}/doctor/dashboard`
    } else if (role === 'admin') {
      redirectUrl.pathname = `/${locale}/admin/dashboard`
    } else if (role === 'clinic') {
      // Round 15
      redirectUrl.pathname = `/${locale}/clinic/dashboard`
    } else {
      redirectUrl.pathname = `/${locale}/patient/dashboard`
    }
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
