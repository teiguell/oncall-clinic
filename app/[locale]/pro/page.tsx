import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { routing } from '@/i18n/routing'

import { ProNav } from '@/components/pro/ProNav'
import { ProHero } from '@/components/pro/ProHero'
import { StatsBar } from '@/components/pro/StatsBar'
import { BenefitsGrid } from '@/components/pro/BenefitsGrid'
import { IncomeCalculator } from '@/components/pro/IncomeCalculator'
import { RegistrationSteps } from '@/components/pro/RegistrationSteps'
import { RequirementsGrid } from '@/components/pro/RequirementsGrid'
import { CitiesGrid } from '@/components/pro/CitiesGrid'
import { ProFAQ } from '@/components/pro/ProFAQ'
import { ProCTA } from '@/components/pro/ProCTA'

const BASE_URL = 'https://oncall.clinic'
const FAQ_COUNT_FOR_JSONLD = 5 // first 5 questions go into FAQPage schema

/**
 * /[locale]/pro — doctor acquisition landing.
 *
 * Strategic intent: Spanish-speaking licensed doctors in Spain are the
 * primary target. Therefore:
 *   - x-default points to /es/pro (NOT /en/pro)
 *   - SEO keywords prioritise Spanish vocabulary
 *   - English version is the secondary surface for international staff
 *     and Ibiza expat doctors
 *
 * SSG via generateStaticParams. Server component throughout except the
 * sticky nav (mobile menu state).
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

  // Pre-fetch FAQ + meta for the JSON-LD schemas (server-side only — they
  // never reach the client bundle).
  const [tMeta, tFaq, tFooter] = await Promise.all([
    getTranslations({ locale, namespace: 'pro.meta' }),
    getTranslations({ locale, namespace: 'pro.faq' }),
    getTranslations({ locale, namespace: 'pro.footer' }),
  ])

  const url = `${BASE_URL}/${locale}/pro`

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
      name: tFaq(`questions.${i}.q`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: tFaq(`questions.${i}.a`),
      },
    })),
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <ProNav locale={locale} />
      <ProHero locale={locale} />
      <StatsBar />
      <BenefitsGrid />
      <IncomeCalculator locale={locale} />
      <RegistrationSteps />
      <RequirementsGrid />
      <CitiesGrid />
      <ProFAQ />
      <ProCTA locale={locale} />

      {/* Footer — Round 10 acquisition page footer (lighter than the main
          site footer; legal links + intermediary disclaimer + copyright). */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-white/80">
              <p className="font-semibold text-white">{tFooter('company')}</p>
              <p className="mt-1 text-[12.5px] text-white/60 max-w-md leading-relaxed">
                {tFooter('intermediary')}
              </p>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-white/70">
              <li><Link href={`/${locale}/legal/privacy`} className="hover:text-white">{tFooter('links.privacy')}</Link></li>
              <li><Link href={`/${locale}/legal/terms`} className="hover:text-white">{tFooter('links.terms')}</Link></li>
              <li><Link href={`/${locale}/legal/cookies`} className="hover:text-white">{tFooter('links.cookies')}</Link></li>
              <li><Link href={`/${locale}/legal/aviso-legal`} className="hover:text-white">{tFooter('links.legal')}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-white">{tFooter('links.contact')}</Link></li>
              <li><Link href={`/${locale}`} className="hover:text-white">{tFooter('links.patients')}</Link></li>
            </ul>
          </div>
          <p className="mt-8 pt-6 border-t border-white/10 text-[12px] text-white/50">
            © {new Date().getFullYear()} {tFooter('company')}. {tFooter('rights')}
          </p>
        </div>
      </footer>
    </main>
  )
}
