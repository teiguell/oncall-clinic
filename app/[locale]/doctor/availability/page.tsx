import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { DoctorAvailabilityEditor } from '@/components/doctor/DoctorAvailabilityEditor'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tu agenda — OnCall Clinic',
  robots: { index: false, follow: false },
}

/**
 * /[locale]/doctor/availability — Round 17-D.
 *
 * Server wrapper. Auth is enforced by /[locale]/doctor/layout.tsx
 * (real session OR doctor bypass). The client editor handles GET +
 * PUT against /api/doctor/availability.
 */
export default async function DoctorAvailabilityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <DoctorAvailabilityEditor locale={locale} />
}
