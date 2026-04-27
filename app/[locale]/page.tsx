import { setRequestLocale } from 'next-intl/server'
import { LandingNavV3 } from '@/components/landing/v3/LandingNavV3'
import { HeroV3 } from '@/components/landing/v3/HeroV3'
import { HowItWorksV3 } from '@/components/landing/v3/HowItWorksV3'
import { IncludesV3 } from '@/components/landing/v3/IncludesV3'
import { ServiceTimeline } from '@/components/shared/service-timeline'
import { TestimonialsV3 } from '@/components/landing/v3/TestimonialsV3'
import { FaqV3 } from '@/components/landing/v3/FaqV3'
import { FinalCtaV3 } from '@/components/landing/v3/FinalCtaV3'
import { IntermediaryDisclaimer } from '@/components/intermediary-disclaimer'
import { FooterV3 } from '@/components/landing/v3/FooterV3'

/**
 * /[locale] — Patient-facing landing v3 (Round 12, Claude Design handoff).
 *
 * Composition:
 *   1. LandingNavV3              (client island — mobile menu state)
 *   2. HeroV3                    (h1 + iPhone mock + floating badges)
 *   3. HowItWorksV3              (3 step cards 01/02/03)
 *   4. IncludesV3                (Qué incluye / Qué NO incluye + 112 pill)
 *   5. ServiceTimeline           (preserved from Rounds 5-7 — full 6-step
 *                                 lifecycle including post-visit chat)
 *   6. TestimonialsV3            (4 tourist quotes UK/DE/FR)
 *   7. FaqV3                     (8 questions, top 3 open)
 *   8. FinalCtaV3                (amber-orange gradient + 4 trust pills)
 *   9. IntermediaryDisclaimer    (preserved — slim LSSI-CE notice)
 *   10. FooterV3                 (dark navy)
 *
 * Preservation contract (see Director Round 12 brief):
 *   - LocaleLayout still wraps everything → MODO PRUEBA banner,
 *     AuthBypassBanner, CookieConsentLoader, CrispChat, MedicalOrgJsonLd
 *     all keep rendering automatically (they live in the layout, not here).
 *   - BottomTabBarWrapper is wired in patient/doctor layouts only;
 *     unaffected by this change.
 *   - ServiceTimeline + IntermediaryDisclaimer remain (Round 12 rule:
 *     don't drop them unless the design replaces them).
 *
 * R7 compliance: zero clinical-data collection. The iPhone mock chips
 * show TYPE-OF-VISIT (Urgente / Programada / Hoy / Mañana) — not symptoms.
 * Every CTA points to /[locale]/patient/request which is the 3-step
 * intermediary flow (Round 9 pivot) — no symptom textarea, no consent
 * Art.9, no clinical data path of any kind.
 *
 * Server component — every section uses next-intl `useTranslations`
 * (which requires `setRequestLocale(locale)` on the request); the only
 * client island is LandingNavV3 for the mobile menu toggle.
 */
export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main className="min-h-screen bg-[#FAFBFC] text-[#0B1220]">
      <LandingNavV3 locale={locale} />
      <HeroV3 locale={locale} />
      <HowItWorksV3 />
      <IncludesV3 />

      {/* ServiceTimeline kept (Round 5-7 invariant) — gives the visitor
          the full 6-step lifecycle (Solicitas → Doctor acepta → En camino
          → Consulta → Informe → Seguimiento) before testimonials. */}
      <section className="bg-[#FAFBFC] py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-20 max-w-[1180px]">
          <ServiceTimeline />
        </div>
      </section>

      <TestimonialsV3 />
      <FaqV3 />
      <FinalCtaV3 locale={locale} />

      {/* Slim LSSI-CE intermediary disclaimer just above the footer.
          Preserved per Round 12 brief — Round 9 R7 pivot makes the
          intermediary positioning legally relevant. */}
      <div className="bg-[#0B1220]">
        <div className="container mx-auto px-4 max-w-[1180px] pt-8">
          <IntermediaryDisclaimer />
        </div>
      </div>

      <FooterV3 locale={locale} />
    </main>
  )
}
