import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { DoctorCoverageEditor } from '@/components/doctor/DoctorCoverageEditor'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tu zona — OnCall Clinic',
  robots: { index: false, follow: false },
}

export default async function DoctorCoveragePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <DoctorCoverageEditor locale={locale} />
}
