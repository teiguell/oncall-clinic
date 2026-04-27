import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

/**
 * StripeSetupBanner — Round 18A-5.
 *
 * Server component rendered at the top of /doctor/dashboard. Shows
 * only when:
 *   1. The doctor has at least one `pending_payouts` row in status
 *      'pending_doctor_setup' (i.e. has earned money waiting for them
 *      to configure Stripe).
 *   2. doctor_profiles.stripe_onboarded_at IS NULL (not yet set up).
 *
 * Renders a CTA "Configurar cobros (5 min)" linking to /api/doctor/
 * stripe-connect/init (POST returns Stripe URL → window.location).
 * Also surfaces the earliest refund_deadline so the doctor knows the
 * 90-day clock.
 *
 * Returns null when:
 *   - already onboarded
 *   - no pending payouts
 *   - no doctor row (e.g. bypass without seed)
 */
export async function StripeSetupBanner({ locale }: { locale: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'doctor' ? bypass.id : null)
  if (!userId) return null

  const { data: doctor } = await supabase
    .from('doctor_profiles')
    .select('id, stripe_onboarded_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (!doctor || doctor.stripe_onboarded_at) return null

  const { data: pending } = await supabase
    .from('pending_payouts')
    .select('net_cents, refund_deadline')
    .eq('doctor_id', doctor.id)
    .eq('status', 'pending_doctor_setup')
    .order('refund_deadline', { ascending: true })

  if (!pending?.length) return null

  type Pending = { net_cents: number; refund_deadline: string }
  const totalCents = (pending as Pending[]).reduce((sum, p) => sum + p.net_cents, 0)
  const earliestDeadline = (pending as Pending[])[0]?.refund_deadline

  const t = await getTranslations({ locale, namespace: 'doctorDashboard.stripeBanner' })

  const fmtDeadline = (iso: string | undefined) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div
      className="bg-amber-50 border border-amber-200 rounded-2xl mb-5"
      style={{ padding: '18px 20px' }}
    >
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="grid place-items-center text-white text-lg font-bold flex-shrink-0"
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            }}
          >
            €
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[#0B1220] text-[15px]">
              {t('title', { amount: `€${(totalCents / 100).toFixed(2)}` })}
            </div>
            <p className="text-[13px] text-[#78350F] mt-0.5 leading-snug">
              {t('deadline', { date: fmtDeadline(earliestDeadline) })}
            </p>
          </div>
        </div>
        <Link
          href={`/${locale}/doctor/dashboard?stripe=setup`}
          // The actual init happens via a small client wrapper that
          // POSTs /api/doctor/stripe-connect/init and redirects to the
          // returned URL. Round 18A-5 ships server banner; client glue
          // is below in StripeSetupBannerCta.
          className="inline-flex items-center justify-center text-white font-semibold flex-shrink-0"
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #D97706, #B45309)',
            fontSize: 13.5,
            letterSpacing: '-0.2px',
            minHeight: 40,
            boxShadow: '0 6px 16px -6px rgba(217,119,6,0.55)',
          }}
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  )
}
