import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Default locale for OAuth callback — detect from Accept-Language or default to 'es'
  const acceptLang = request.headers.get('accept-language') || ''
  const locale = acceptLang.toLowerCase().startsWith('en') ? 'en' : 'es'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile) {
          // New Google user - create profile
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata.full_name || user.email!.split('@')[0],
            avatar_url: user.user_metadata.avatar_url || null,
            role: 'patient',
          })
          return NextResponse.redirect(`${origin}/${locale}/patient/dashboard`)
        }

        const redirectPath = profile.role === 'doctor'
          ? `/${locale}/doctor/dashboard`
          : profile.role === 'admin'
          ? `/${locale}/admin/dashboard`
          : `/${locale}/patient/dashboard`

        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=oauth_error`)
}
