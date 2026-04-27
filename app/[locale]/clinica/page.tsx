import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { routing } from '@/i18n/routing'

import { ClinicaNav } from '@/components/clinica/ClinicaNav'
import { ClinicaHero } from '@/components/clinica/ClinicaHero'
import { ClinicaTopSections } from '@/components/clinica/ClinicaTopSections'
import { ClinicaMidSections } from '@/components/clinica/ClinicaMidSections'
import { ClinicaBottomSections } from '@/components/clinica/ClinicaBottomSections'
import { breadcrumbsSchema } from '@/lib/seo/breadcrumbs'

const BASE_URL = 'https://oncall.clinic'

/**
 * /[locale]/clinica — Round 15 B2B clinic acquisition landing.
 *
 * Sections (Director's spec, 12 ordered blocks):
 *   1. Nav (sticky, indigo "O" wordmark)
 *   2. Hero (indigo gradient + 3-line title with last gradient)
 *   3. StatsBar (8% / 96.8M / €0 / 2 días)              ─┐
 *   4. Problem/Solution (2-col red/green)                │
 *   5. Benefits (6 cards)                                ├ ClinicaTopSections
 *   6. Calculator (€150 → €138 + monthly/yearly range) ─┘
 *   7. How it works (4 horizontal steps)                ─┐
 *   8. Comparison table (6 rows)                        ─┘ ClinicaMidSections
 *   9. Requirements (6 checklist)                       ─┐
 *  10. Cities (10 cards)                                 │
 *  11. FAQ (6 collapsibles, first open)                  ├ ClinicaBottomSections
 *  12. Final CTA (indigo gradient + trust badges)      ─┘
 *  + Footer (minimal — same pattern as /pro)
 *
 * SEO:
 *   - hreflang ES/EN bidirectional with x-default → /es/clinica
 *     (Spanish primary because: clinics are Spanish businesses with CIF,
 *     RC empresarial, etc. Mirror /pro's x-default → ES strategy.)
 *   - JSON-LD WebPage + FAQPage (6 questions)
 *
 * R7 compliance: zero clinical data anywhere on the page. The FAQ
 * explicitly states OnCall does NOT collect clinical data — that's the
 * single most-asked question by clinics.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'clinicLanding.meta' })
  const isEn = locale === 'en'
  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}/clinica`,
      languages: {
        es: `${BASE_URL}/es/clinica`,
        en: `${BASE_URL}/en/clinica`,
        // ES is the primary target (clinics are Spanish businesses).
        'x-default': `${BASE_URL}/es/clinica`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isEn ? 'en_GB' : 'es_ES',
      alternateLocale: isEn ? 'es_ES' : 'en_GB',
      url: `${BASE_URL}/${locale}/clinica`,
      siteName: 'OnCall Clinic',
      title: t('title'),
      description: t('description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    robots: { index: true, follow: true },
  }
}

export default async function ClinicaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [tMeta, tFaq, tFooter] = await Promise.all([
    getTranslations({ locale, namespace: 'clinicLanding.meta' }),
    getTranslations({ locale, namespace: 'clinicLanding.faq' }),
    getTranslations({ locale, namespace: 'clinicLanding.footer' }),
  ])

  const url = `${BASE_URL}/${locale}/clinica`

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
    mainEntity: Array.from({ length: 6 }, (_, i) => ({
      '@type': 'Question',
      name: tFaq(`items.${i}.q`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: tFaq(`items.${i}.a`),
      },
    })),
  }

  // Round 20A-6: BreadcrumbList — gives search engines a hierarchical
  // anchor for SERP rich-snippets and reduces orphan-page weight.
  const breadcrumbs = breadcrumbsSchema([
    { name: locale === 'en' ? 'Home' : 'Inicio', url: `${BASE_URL}/${locale}` },
    { name: locale === 'en' ? 'Partner clinics' : 'Clínicas asociadas', url },
  ])

  // Round 20A-10: MedicalBusiness JSON-LD specific to /clinica
  // — describes the platform's role as a partner-clinic intermediary.
  // Reuses the same operational hours + city the patient-facing schema
  // emits on /[locale] root.
  const medicalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'OnCall Clinic — ' + (locale === 'en' ? 'Partner clinics' : 'Clínicas asociadas'),
    description: tMeta('description'),
    url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ibiza',
      addressRegion: 'Illes Balears',
      addressCountry: 'ES',
    },
    areaServed: ['Ibiza', 'Mallorca', 'Madrid', 'Barcelona'],
    medicalSpecialty: 'GeneralPractice',
    paymentAccepted: ['Credit Card', 'Stripe'],
    priceRange: '€€',
  }

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalBusinessSchema) }}
      />

      <ClinicaNav locale={locale} />
      <ClinicaHero locale={locale} />
      <ClinicaTopSections />
      <ClinicaMidSections />
      <ClinicaBottomSections locale={locale} />

      <footer
        className="bg-white border-t border-[#EEF1F5] text-slate-500"
        style={{
          padding: 'clamp(24px, 3vw, 36px) clamp(18px, 4vw, 56px) clamp(48px, 6vw, 36px)',
          fontSize: 13,
        }}
      >
        <div className="max-w-[1240px] mx-auto flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div
              className="grid place-items-center text-white font-bold"
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: 'linear-gradient(135deg,#4F46E5,#1E1B4B)',
                fontSize: 11,
              }}
              aria-hidden="true"
            >
              O
            </div>
            <span className="text-[#0B1220] font-medium">{tFooter('year', { year: new Date().getFullYear() })}</span>
            <span className="hidden md:inline">— {tFooter('tagline')}</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href={`/${locale}/legal/privacy`} className="hover:text-[#0B1220]">
              {tFooter('links.privacy')}
            </Link>
            <Link href={`/${locale}/legal/terms`} className="hover:text-[#0B1220]">
              {tFooter('links.terms')}
            </Link>
            <Link href={`/${locale}/legal/aviso-legal`} className="hover:text-[#0B1220]">
              {tFooter('links.legal')}
            </Link>
            <a href={`mailto:${tFooter('links.support')}`} className="hover:text-[#0B1220]">
              {tFooter('links.support')}
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
