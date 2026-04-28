import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { ReviewSubmitForm } from '@/components/review/ReviewSubmitForm'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'review' })
  return {
    title: `${t('title', { name: '' }).replace('{name}', '').trim()} — OnCall Clinic`,
    robots: { index: false, follow: false },
  }
}

/**
 * /[locale]/review/[token] — Round 17-C.
 *
 * Patient submits a 1-5 star rating + optional comment for a
 * completed consultation. Auth is by possession of the SMS-delivered
 * token (URL itself). Server pre-fetches the doctor's name to
 * personalize the headline.
 *
 * Token can be either:
 *   - A `consultation_reviews.review_token` UUID (Round 17-C native)
 *   - A `consultations.id` UUID (R17-B SMS that pre-dated migration 031)
 *
 * Both paths resolve to the same review submission. The submit page
 * silently accepts either and POSTs `{ token, rating, comment }` to
 * /api/reviews/submit.
 */
export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>
}) {
  const { locale, token } = await params
  setRequestLocale(locale)

  // Service-role lookup — review submit is unauthenticated by SMS link.
  const supabase = createServiceRoleClient()

  let doctorName: string | null = null
  let alreadySubmitted = false

  // Try the dedicated review_token first.
  const { data: byToken } = await supabase
    .from('consultation_reviews')
    .select('id, rating, doctor:doctor_profiles!inner(profile:profiles!inner(full_name))')
    .eq('review_token', token)
    .maybeSingle()

  type DoctorJoin = { profile: { full_name: string | null } | Array<{ full_name: string | null }> }

  if (byToken) {
    const d = (byToken as { doctor: DoctorJoin | DoctorJoin[] }).doctor
    const doctor = Array.isArray(d) ? d[0] : d
    const profile = Array.isArray(doctor?.profile) ? doctor.profile[0] : doctor?.profile
    doctorName = profile?.full_name ?? null
    alreadySubmitted = byToken.rating != null && byToken.rating > 0
  } else {
    // Fallback: token is a consultation.id from R17-B SMS
    const { data: consultation } = await supabase
      .from('consultations')
      .select(
        'id, status, doctor:doctor_profiles!inner(profile:profiles!inner(full_name))',
      )
      .eq('id', token)
      .maybeSingle()
    if (consultation) {
      const d = (consultation as { doctor: DoctorJoin | DoctorJoin[] }).doctor
      const doctor = Array.isArray(d) ? d[0] : d
      const profile = Array.isArray(doctor?.profile) ? doctor.profile[0] : doctor?.profile
      doctorName = profile?.full_name ?? null

      // Also check if a review already exists for this consultation
      const { data: existing } = await supabase
        .from('consultation_reviews')
        .select('id')
        .eq('consultation_id', token)
        .maybeSingle()
      alreadySubmitted = !!existing
    }
  }

  return (
    <ReviewSubmitForm
      locale={locale}
      token={token}
      doctorName={doctorName}
      alreadySubmitted={alreadySubmitted}
    />
  )
}
