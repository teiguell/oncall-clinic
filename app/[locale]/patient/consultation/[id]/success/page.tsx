import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle2, Navigation, Phone } from 'lucide-react'
import { SuccessPoller } from './SuccessPoller'

export const dynamic = 'force-dynamic'

/**
 * Post-Stripe success landing — shown after checkout.sessions.success_url.
 *
 * UX:
 *   1. Read consultation by params.id (RLS ensures patient can only see own)
 *   2. If status !== 'paid' yet (webhook latency) → render a polling card
 *      that re-checks every 3s for up to 30s, then shows a "still processing"
 *      fallback with a "Call us" CTA.
 *   3. If status === 'paid' → success confetti + CTA to tracking.
 */
export default async function ConsultationSuccessPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'consultation.success' })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/patient/consultation/${id}/success`)}`)
  }

  const { data: consultation } = await supabase
    .from('consultations')
    .select('id, status, payment_status, doctor_id, type, price, paid_at')
    .eq('id', id)
    .eq('patient_id', user.id)
    .maybeSingle()

  if (!consultation) {
    redirect(`/${locale}/patient/dashboard`)
  }

  const isPaid = consultation.payment_status === 'paid'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        {isPaid ? (
          <>
            <div className="relative mx-auto w-[84px] h-[84px]">
              <span className="ripple-ring absolute -inset-2 rounded-full border-2 border-emerald-300" aria-hidden="true" />
              <div className="success-check w-[84px] h-[84px] rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
              <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
            </div>
            {consultation.price && (
              <div className="bg-white rounded-2xl border border-border p-4 text-left">
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                  {t('receipt')}
                </p>
                <p className="text-2xl font-bold mt-2">€{Math.round(consultation.price / 100)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('paidAt', {
                    date: consultation.paid_at
                      ? new Date(consultation.paid_at).toLocaleString(locale)
                      : new Date().toLocaleString(locale),
                  })}
                </p>
              </div>
            )}
            <Link
              href={`/${locale}/patient/tracking/${consultation.id}`}
              className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors min-h-[44px]"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              {t('viewTracking')}
            </Link>
            <Link
              href={`/${locale}/patient/dashboard`}
              className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors min-h-[44px]"
            >
              {t('backToDashboard')}
            </Link>
          </>
        ) : (
          <SuccessPoller consultationId={consultation.id} locale={locale} />
        )}
        <div className="pt-4 border-t border-border/60">
          <a
            href="tel:+34871183415"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            +34 871 18 34 15
          </a>
        </div>
      </div>
    </main>
  )
}
