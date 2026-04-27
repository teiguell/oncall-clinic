import { redirect } from 'next/navigation'

/**
 * /[locale]/pro/login — Round 14 P0 #2 alias.
 *
 * Forwards to the unified /[locale]/login. The login page itself is
 * role-aware: post-Magic-Link / Google callback, the user lands on
 * the dashboard for their profile.role (patient/doctor/admin), so a
 * doctor coming from the Pro landing ends up at /doctor/dashboard
 * automatically.
 *
 * `?role=doctor` query is informational; it nudges any future copy
 * variant on the login page (e.g. "Welcome back, doctor"). No backend
 * effect today.
 */
export default async function ProLoginEntry({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/login?role=doctor`)
}
