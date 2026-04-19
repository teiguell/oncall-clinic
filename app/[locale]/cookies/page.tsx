import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

// Shortcut route: /cookies → /legal/cookies (full policy lives in legal/)
export default async function CookiesRedirect() {
  const locale = await getLocale()
  redirect(`/${locale}/legal/cookies`)
}
