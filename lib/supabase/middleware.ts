import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  const { data: { user } } = await supabase.auth.getUser()

  const fullPath = request.nextUrl.pathname
  const locale = getLocaleFromPath(fullPath)
  const path = stripLocale(fullPath)

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
  const authRoutes = ['/login', '/register']

  // Redirect to locale-prefixed login if not authenticated on protected route
  if (!user && (
    protectedPatientRoutes.some(r => path.startsWith(r)) ||
    protectedDoctorRoutes.some(r => path.startsWith(r)) ||
    protectedAdminRoutes.some(r => path.startsWith(r))
  )) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = `/${locale}/login`
    redirectUrl.searchParams.set('redirectTo', fullPath)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages to their dashboard
  if (user && authRoutes.some(r => path.startsWith(r))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const redirectUrl = request.nextUrl.clone()
    if (profile?.role === 'doctor') {
      redirectUrl.pathname = `/${locale}/doctor/dashboard`
    } else if (profile?.role === 'admin') {
      redirectUrl.pathname = `/${locale}/admin/dashboard`
    } else {
      redirectUrl.pathname = `/${locale}/patient/dashboard`
    }
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
