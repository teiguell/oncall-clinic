import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { routing } from '@/i18n/routing'

import { ProNav } from '@/components/pro/ProNav'
import { ProHero } from '@/components/pro/ProHero'
import { StatsBar } from '@/components/pro/StatsBar'
import { IncomeCalculator } from '@/components/pro/IncomeCalculator'
import { RegistrationSteps } from '@/components/pro/RegistrationSteps'
import { RequirementsGrid } from '@/components/pro/RequirementsGrid'
import { CitiesGrid } from '@/components/pro/CitiesGrid'
import { ProFAQ } from '@/components/pro/ProFAQ'
import { ProCTA } from '@/components/pro/ProCTA'
import { ProTestimonial } from '@/components/pro/ProTestimonial'
import { ProLeadForm } from '@/components/pro/ProLeadForm'
import { breadcrumbsSchema } from '@/lib/seo/breadcrumbs'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'

const BASE_URL = 'https://oncall.clinic'
const FAQ_COUNT_FOR_JSONLD = 5 // first 5 questions go into FAQPage schema

/**
 * /[locale]/pro — doctor acquisition landing.
 *
 * Round 13 v3 design (Claude Design handoff): premium B2B layout in the
 * Stripe Pro / Doctolib Pro / Uber for Business style. Server component
 * throughout except IncomeCalculator (sliders), StatsBar (count-up
 * IntersectionObserver), and ProNav (mobile menu).
 *
 * Strategic intent: Spanish-speaking COMIB-licensed doctors are the
 * primary target. Therefore:
 *   - x-default points to /es/pro (NOT /en/pro)
 *   - SEO keywords prioritise Spanish vocabulary
 *   - English version is the secondary surface for international staff
 *     and Ibiza expat doctors
 *
 * Section order (Round 13):
 *   1. ProNav            (sticky)
 *   2. ProHero           (h1 gradient on "Tus pacientes" + iPhone mock)
 *   3. StatsBar          (4 stats with count-up on scroll-into-view)
 *   4. IncomeCalculator  (dual slider + dark-card breakdown)
 *   5. RegistrationSteps (4 steps + horizontal progress line desktop)
 *   6. RequirementsGrid  (6 cards 3-col + DOC/RC/RETA/MOV/8h/ES tags)
 *   7. CitiesGrid        (5 cards inc "+6 ciudades" 2027)
 *   8. ProFAQ            (8 questions, top 3 open, +/× rotation toggle)
 *   9. ProCTA            (dark-navy gradient card + sticky mobile CTA)
 *  10. Footer            (minimal — Round 13 v3 spec)
 *
 * Removed in v3 (was in Round 11): BenefitsGrid section. The 6-card
 * "Diseñado para médicos que deciden" overlap with Requirements + the
 * stats bar; the design source explicitly drops it.
 *
 * R7 compliance: zero clinical data anywhere. The doctor-app PhoneMock
 * shows "Adulto · Visita programada" (logística) instead of the design
 * source's "Fiebre + dolor abdominal" (clinical) — see PhoneMockPro.tsx.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pro.meta' })
  const isEn = locale === 'en'
  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}/pro`,
      languages: {
        es: `${BASE_URL}/es/pro`,
        en: `${BASE_URL}/en/pro`,
        // ES is the primary target market — x-default points to /es/pro,
        // overriding the typical English-default convention.
        'x-default': `${BASE_URL}/es/pro`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isEn ? 'en_GB' : 'es_ES',
      alternateLocale: isEn ? 'es_ES' : 'en_GB',
      url: `${BASE_URL}/${locale}/pro`,
      siteName: 'OnCall Clinic',
      title: t('title'),
      description: t('description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function ProPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // Pre-fetch FAQ + meta + footer for SEO + final markup. JSON-LD lives
  // server-side only — never reaches the client bundle.
  const [tMeta, tFaq, tFooterV3] = await Promise.all([
    getTranslations({ locale, namespace: 'pro.meta' }),
    getTranslations({ locale, namespace: 'proV3.faq' }),
    getTranslations({ locale, namespace: 'proV3.footer' }),
  ])

  const url = `${BASE_URL}/${locale}/pro`

  // Round 20 Q3-5: dynamic count of active doctors for the hero badge.
  // Service-role client bypasses RLS for this read-only count. Falls
  // back to 9 (the prior static value) on any error so the badge
  // always renders.
  let activeDoctors = 9
  try {
    const supabaseAdmin = createServiceRoleClient()
    const { count } = await supabaseAdmin
      .from('doctor_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('activation_status', 'active')
      .eq('verification_status', 'verified')
    if (typeof count === 'number' && count > 0) activeDoctors = count
  } catch (e) {
    console.warn('[/pro] doctors count fetch failed, using fallback', e)
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: tMeta('title'),
    description: tMeta('description'),
    url,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite',
      name: 'OnCall Clinic',
      url: BASE_URL,
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: Array.from({ length: FAQ_COUNT_FOR_JSONLD }, (_, i) => ({
      '@type': 'Question',
      name: tFaq(`items.${i}.q`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: tFaq(`items.${i}.a`),
      },
    })),
  }

  // Round 20A-6: BreadcrumbList for richer SERP snippets.
  const breadcrumbs = breadcrumbsSchema([
    { name: locale === 'en' ? 'Home' : 'Inicio', url: `${BASE_URL}/${locale}` },
    { name: locale === 'en' ? 'For doctors' : 'Para médicos', url },
  ])

  return (
    <main className="min-h-screen bg-[#FAFBFC] text-[#0B1220]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <ProNav locale={locale} />
      {/* Round 23-3 (Q5-5): visual breadcrumbs slot under the sticky
          ProNav, before the hero. Mirrors the JSON-LD BreadcrumbList. */}
      <div
        className="bg-white border-b border-slate-200"
        style={{ padding: 'clamp(12px, 1.6vw, 16px) clamp(18px, 4vw, 56px)' }}
      >
        <div className="max-w-[1240px] mx-auto">
          <Breadcrumbs
            className="text-[13px] text-slate-500"
            items={[
              { label: locale === 'en' ? 'Home' : 'Inicio', href: `/${locale}` },
              { label: locale === 'en' ? 'For doctors' : 'Para médicos' },
            ]}
          />
        </div>
      </div>
      <ProHero locale={locale} activeDoctors={activeDoctors} />
      <StatsBar />
      <IncomeCalculator locale={locale} />
      <RegistrationSteps />
      {/* Round 20 Q3-2: single-doctor testimonial card for social proof */}
      <ProTestimonial />
      <RequirementsGrid />
      <CitiesGrid />
      <ProFAQ />
      <ProCTA locale={locale} />

      {/* Round 22-7 (Q4-19): B2B doctor lead form. Doctors who aren't
          ready for full registration drop email + phone + specialty;
          we hand-route the lead via tei@ until volume justifies a
          CRM dashboard. */}
      <ProLeadFormSection />


      {/* Round 13 v3 footer — minimal one-line. Legal links + support email
          per the design spec. The richer 4-column footer was Round 10. */}
      <footer
        className="bg-white border-t border-[#EEF1F5] text-slate-500"
        style={{
          padding: 'clamp(24px, 3vw, 36px) clamp(18px, 4vw, 56px) clamp(88px, 10vw, 36px)',
          fontSize: 13,
        }}
      >
        <div
          className="max-w-[1240px] mx-auto flex flex-wrap gap-4 justify-between items-center"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="grid place-items-center text-white font-bold"
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
                fontSize: 11,
              }}
              aria-hidden="true"
            >
              O
            </div>
            <span className="text-[#0B1220] font-medium">{tFooterV3('company')}</span>
            <span>· {tFooterV3('year', { year: new Date().getFullYear() })}</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href={`/${locale}/legal/privacy`} className="hover:text-[#0B1220]">
              {tFooterV3('links.privacy')}
            </Link>
            <Link href={`/${locale}/legal/terms`} className="hover:text-[#0B1220]">
              {tFooterV3('links.terms')}
            </Link>
            <Link href={`/${locale}/legal/aviso-legal`} className="hover:text-[#0B1220]">
              {tFooterV3('links.legal')}
            </Link>
            <a href={`mailto:${tFooterV3('links.support')}`} className="hover:text-[#0B1220]">
              {tFooterV3('links.support')}
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}

/**
 * Round 22-7 (Q4-19): /pro lead form wrapper.
 *
 * Server component for the section heading + intro copy (so the
 * heading lands in SSR HTML for SEO), plus the client-component
 * ProLeadForm. Sits between the closing CTA and the v3 minimal
 * footer so the form has the user's intent fresh from the FAQ + CTA.
 */
async function ProLeadFormSection() {
  const t = await getTranslations('proLeadForm')
  return (
    <section
      id="contacto-pro"
      className="bg-orange-50/70 border-t border-orange-100"
      style={{ padding: 'clamp(48px, 6vw, 84px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[680px] mx-auto">
        <h2
          className="font-bold text-[#0B1220]"
          style={{ fontSize: 'clamp(26px, 3vw, 36px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
        >
          {t('heading')}
        </h2>
        <p className="text-slate-600 mt-2.5" style={{ fontSize: 16 }}>
          {t('subhead')}
        </p>
        <div className="mt-7">
          <ProLeadForm />
        </div>
      </div>
    </section>
  )
}
