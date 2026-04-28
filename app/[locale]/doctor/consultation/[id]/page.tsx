import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'
import { CheckInOutScreen } from '@/components/doctor/CheckInOutScreen'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Consulta — OnCall Clinic',
  robots: { index: false, follow: false },
}

/**
 * /[locale]/doctor/consultation/[id] — Round 17-B.
 *
 * Server gate that fetches the consultation + chooses the screen
 * variant based on status:
 *   accepted     → CheckInScreen  (doctor will press "Marcar llegada")
 *   in_progress  → CheckOutScreen (doctor will press "Finalizar visita")
 *   completed    → ReceiptScreen  (read-only summary; deferred to R17-C)
 *
 * Auth: real doctor session OR doctor bypass. RLS / ownership enforced
 * by the doctor_id match in the SELECT.
 */
export default async function DoctorConsultationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const { userId, supabase } = await getEffectiveSession('doctor')
  if (!userId) {
    redirect(`/${locale}/login?next=/${locale}/doctor/consultation/${id}`)
  }

  const { data: doctor } = await supabase
    .from('doctor_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  if (!doctor) {
    redirect(`/${locale}/doctor/onboarding`)
  }

  const { data: consultation } = await supabase
    .from('consultations')
    .select('id, doctor_id, status, address, lat, lng, checkin_at, checkout_at, scheduled_at, type')
    .eq('id', id)
    .eq('doctor_id', doctor.id)
    .maybeSingle()

  if (!consultation) {
    redirect(`/${locale}/doctor/dashboard`)
  }

  return (
    <CheckInOutScreen
      locale={locale}
      consultation={{
        id: consultation.id,
        status: consultation.status,
        address: consultation.address,
        lat: consultation.lat,
        lng: consultation.lng,
        checkin_at: consultation.checkin_at,
        checkout_at: consultation.checkout_at,
        scheduled_at: consultation.scheduled_at,
        type: consultation.type,
      }}
    />
  )
}
