import { permanentRedirect } from 'next/navigation'

/**
 * /[locale]/pro/registro — Round 14 P0 #2 (Opción A confirmed by Director).
 *
 * The Round 13 v3 landing's primary CTA "Empezar registro · 5 min" pointed
 * here, but the route didn't exist (silent 404). The full doctor onboarding
 * flow already lives at /[locale]/doctor/onboarding (Round 11, 4 steps:
 * Personal → COMIB+RC+RETA → Stripe → Contract + activation), so we
 * redirect rather than duplicate.
 *
 * Why we keep the /pro/* alias instead of changing the landing CTAs to
 * /doctor/onboarding directly:
 *   - Brand coherence: the entire B2B funnel is "/pro/*"
 *   - SEO: indexable entry point under the pro path
 *   - Future flexibility: if we ever build a dedicated /pro onboarding
 *     (different from /doctor/onboarding), the URL stays the same.
 *
 * 308 (permanent + method-preserving) instead of 302 because this is a
 * stable alias, not a temporary forward.
 */
export default async function ProRegistroEntry({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  permanentRedirect(`/${locale}/doctor/onboarding`)
}
