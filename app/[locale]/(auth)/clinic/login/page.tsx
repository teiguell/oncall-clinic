import { redirect } from 'next/navigation'

/**
 * /[locale]/clinic/login — Round 15.
 *
 * Forwards to the unified `/login?role=clinic`. The login page is
 * role-aware: post-Magic-Link / Google callback the user lands on the
 * dashboard for their profile.role (patient/doctor/admin/clinic).
 *
 * `?role=clinic` is informational; it lets the unified login page show
 * clinic-specific copy (Round 15B will add a copy variant). No backend
 * effect today.
 *
 * Mirrors the /pro/login pattern.
 */
export default async function ClinicLoginEntry({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/login?role=clinic`)
}
