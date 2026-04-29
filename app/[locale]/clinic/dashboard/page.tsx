import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getEffectiveSession } from '@/lib/supabase/auto-client'
import { ClinicDashboardLive } from './ClinicDashboardLive'

/**
 * /[locale]/clinic/dashboard — Round 15 Block 2.2.
 *
 * Phase 1 (Round 15A) scope: KPI cards (consultations, revenue, active
 * doctors, average rating) with empty-state copy when no consultations
 * have been served yet. Phase 2 (Round 15B) will add:
 *   - 30-day consultations bar chart
 *   - Last 5 consultations list
 *   - Stripe Connect status block with setup CTA
 *
 * The data fetch falls back to zero values when:
 *   - bypass mode without a real clinic row in DB
 *   - clinic row exists but verification_status != 'verified'
 *   - clinic verified but no consultations yet
 */
export default async function ClinicDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // tKpi labels are now consumed inside <ClinicDashboardLive /> via
  // useTranslations — no need to pre-fetch here.
  const tEmpty = await getTranslations({ locale, namespace: 'clinicDashboard.empty' })
  const tStripe = await getTranslations({ locale, namespace: 'clinicDashboard.stripe' })

  // Round 14F-5 + R18-D: bypass-aware session for clinic dashboard.
  // Real cookie session (production owner) wins; if absent and
  // AUTH_BYPASS=true with role='clinic', uses Cowork's seeded
  // demo-clinic UUID (4d34e2e7-...) + service-role client.
  const { userId, supabase } = await getEffectiveSession('clinic')

  // Fetch clinic + KPI counts (best-effort — empty if no real clinic row).
  let clinicId: string | null = null
  let stripeReady = false
  if (userId) {
    const { data: clinic } = await supabase
      .from('clinics')
      .select('id, stripe_onboarding_complete')
      .eq('user_id', userId)
      .maybeSingle()
    clinicId = clinic?.id ?? null
    stripeReady = !!clinic?.stripe_onboarding_complete
  }

  // Aggregate counts. RLS ensures the clinic owner only sees their own
  // consultations (via consultations.clinic_id + the implicit clinic
  // ownership policy). Bypass users without a real clinics row will see
  // zeros across the board — expected.
  let consultationsThisMonth = 0
  let revenueThisMonth = 0
  let activeDoctors = 0

  if (clinicId) {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const since = monthStart.toISOString()

    const { count: consCount } = await supabase
      .from('consultations')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', since)
    consultationsThisMonth = consCount ?? 0

    // Round 18-D fix: column is `price` (cents), not `amount_cents`.
    // The original query was returning 0 for revenue because Supabase
    // silently dropped the unknown column (no error, just empty data).
    const { data: revRows } = await supabase
      .from('consultations')
      .select('price')
      .eq('clinic_id', clinicId)
      .gte('created_at', since)
      .eq('status', 'completed')
    revenueThisMonth =
      ((revRows ?? []) as Array<{ price: number | null }>)
        .reduce((sum, r) => sum + (r.price ?? 0), 0) / 100

    const { count: docCount } = await supabase
      .from('clinic_doctors')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'active')
    activeDoctors = docCount ?? 0
  }

  const isEmpty = consultationsThisMonth === 0 && activeDoctors === 0

  return (
    <div className="max-w-[1100px]">
      {/* Round 25-1 (Z-1): KPI grid moved into a client island so it
          subscribes to realtime + polls /api/clinic/metrics. The
          server-computed values above are passed as `initial` so the
          first paint is identical to the previous server-only render. */}
      <ClinicDashboardLive
        clinicId={clinicId}
        initial={{
          consultationsThisMonth,
          revenueEur: revenueThisMonth,
          activeDoctors,
          avgRating: '—',
        }}
      />

      {/* Stripe Connect status */}
      <div
        className="bg-white border border-slate-200 flex flex-wrap gap-4 justify-between items-center"
        style={{ padding: '18px 20px', borderRadius: 14 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="grid place-items-center text-white font-bold"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: stripeReady
                ? 'linear-gradient(135deg, #16A34A, #15803D)'
                : 'linear-gradient(135deg, #94A3B8, #64748B)',
              fontSize: 16,
            }}
            aria-hidden="true"
          >
            S
          </div>
          <div>
            <div className="font-semibold text-[#0B1220]">
              {stripeReady ? tStripe('ready') : tStripe('notReady')}
            </div>
          </div>
        </div>
        {!stripeReady && clinicId && (
          <a
            href="/api/clinic/stripe-onboarding"
            className="inline-flex items-center justify-center text-white font-medium"
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
              fontSize: 13.5,
              letterSpacing: '-0.2px',
              minHeight: 38,
            }}
          >
            {tStripe('setupCta')}
          </a>
        )}
      </div>

      {isEmpty && (
        <div
          className="mt-6 bg-white border border-dashed border-slate-300 text-center"
          style={{ padding: '40px 28px', borderRadius: 14 }}
        >
          <div
            className="font-semibold text-[#0B1220]"
            style={{ fontSize: 18, letterSpacing: '-0.01em' }}
          >
            {tEmpty('title')}
          </div>
          <p className="text-slate-600 mt-2 text-[14.5px] max-w-md mx-auto leading-relaxed">
            {tEmpty('body')}
          </p>
        </div>
      )}
    </div>
  )
}
