import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Optional `next` param: if auth flow was initiated from inside a specific
  // page (e.g. /patient/request?step=3), we return the user exactly there
  // so the booking context is preserved. Only same-origin paths are allowed.
  const nextParam = searchParams.get('next')
  // Default locale for OAuth callback — detect from Accept-Language or default to 'es'
  const acceptLang = request.headers.get('accept-language') || ''
  const locale = acceptLang.toLowerCase().startsWith('en') ? 'en' : 'es'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      // Round 9 Fix F — surface OAuth exchange errors. Without this, the
      // user just lands on /login?error=oauth_error with no clue why and
      // no Vercel log entry. Now: full error in server logs + reason
      // bubbled into the redirect so the login page can render a usable
      // message ("Email already registered with a different provider",
      // "Invalid grant", etc.).
      console.error('[auth/callback] exchangeCodeForSession failed:', {
        message: error.message,
        status: (error as { status?: number }).status,
        name: error.name,
        code: (error as { code?: string }).code,
      })
      const detail = encodeURIComponent(error.message || 'oauth_exchange_failed')
      return NextResponse.redirect(`${origin}/${locale}/login?error=oauth_exchange_failed&detail=${detail}`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile) {
          // New Google user - create profile
          const { error: profileError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata.full_name || user.email!.split('@')[0],
            avatar_url: user.user_metadata.avatar_url || null,
            role: 'patient',
          })
          if (profileError) {
            console.error('[auth/callback] profile insert failed:', profileError.message)
            // Continue anyway — user is authed, profile creation can be retried.
          }
        }

        // Sanitize next param — must start with / and be same-origin only
        const safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
          ? nextParam
          : null

        if (safeNext) {
          return NextResponse.redirect(`${origin}${safeNext}`)
        }

        const redirectPath = profile?.role === 'doctor'
          ? `/${locale}/doctor/dashboard`
          : profile?.role === 'admin'
          ? `/${locale}/admin/dashboard`
          : `/${locale}/patient/dashboard`

      return NextResponse.redirect(`${origin}${redirectPath}`)
    }

    // Authed but no user object — shouldn't happen but guard against it.
    console.error('[auth/callback] exchange ok but getUser returned null')
    return NextResponse.redirect(`${origin}/${locale}/login?error=oauth_no_user`)
  }

  // No `code` query param — likely landed here directly without going through
  // the OAuth flow. Redirect home with a generic error.
  console.error('[auth/callback] missing `code` query param', { url: request.url })
  return NextResponse.redirect(`${origin}/${locale}/login?error=oauth_missing_code`)
}
