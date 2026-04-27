import { redirect } from 'next/navigation'

/**
 * /[locale]/pro/dashboard — Round 14 P0 #2 alias.
 *
 * Forwards to the existing doctor dashboard. The doctor server-layout
 * gate (`app/[locale]/doctor/layout.tsx`) handles the auth + role check
 * (and the Round 11 + Round 14-A bypass), so this redirect is a
 * 1-liner shortcut for the "/pro/dashboard" branding URL.
 */
export default async function ProDashboardEntry({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/doctor/dashboard`)
}
