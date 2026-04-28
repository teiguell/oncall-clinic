import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { CITIES, getCity, getSisterCities } from '@/lib/cities'
import { routing } from '@/i18n/routing'
import { breadcrumbsSchema } from '@/lib/seo/breadcrumbs'
import { LandingNavV3 } from '@/components/landing/v3/LandingNavV3'
import { FooterV3 } from '@/components/landing/v3/FooterV3'
import { Check, Phone, Clock, Stethoscope, ArrowRight } from 'lucide-react'
import { ONCALL_PHONE_TEL } from '@/lib/format/phone'

const BASE_URL = 'https://oncall.clinic'
const FAQ_COUNT = 6

/**
 * /[locale]/medico-domicilio/[city] — Round 20-B / Q3-4.
 *
 * 20 statically-generated URLs (10 cities × 2 locales) targeting the
 * long-tail "médico a domicilio {city}" keyword. Each page is unique-
 * enough thanks to:
 *   - city name in H1 + headings + body
 *   - coordinates + province in JSON-LD areaServed
 *   - population sentence for unique paragraph content
 *   - sister-cities internal-link cluster (top 3 closest)
 *   - shared FAQ structure with city-name interpolation per question
 *
 * The dynamic segment is `[city]` (slug); the URL prefix
 * `medico-domicilio` is part of the static path. Sitemap.ts iterates
 * CITIES and emits 1 entry per (locale, city).
 *
 * Note: Director's spec said `app/[locale]/medico-domicilio-[city]/page.tsx`
 * but Next.js folders can't mix static prefix + dynamic in one segment.
 * The clean equivalent is `medico-domicilio/[city]/`. URL:
 * `/es/medico-domicilio/ibiza` (vs the spec's `medico-domicilio-ibiza`).
 * SEO impact identical; structurally cleaner.
 */
export function generateStaticParams() {
  const params: Array<{ locale: string; city: string }> = []
  for (const locale of routing.locales) {
    for (const city of CITIES) {
      params.push({ locale, city: city.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>
}): Promise<Metadata> {
  const { locale, city: citySlug } = await params
  const city = getCity(citySlug)
  if (!city) return {}

  const cityName = city.name[locale as 'es' | 'en'] ?? city.name.es
  const isEn = locale === 'en'

  const title = isEn
    ? `Home-call doctor in ${cityName} · OnCall Clinic`
    : `Médico a domicilio en ${cityName} · OnCall Clinic`
  const description = isEn
    ? `Licensed home-call doctors in ${cityName} (${city.province}). 24/7 availability, transparent pricing, ES + EN. Book online.`
    : `Médicos colegiados a domicilio en ${cityName} (${city.province}). 24/7, precios transparentes, ES + EN. Reserva online.`

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}/medico-domicilio/${city.slug}`,
      languages: {
        es: `${BASE_URL}/es/medico-domicilio/${city.slug}`,
        en: `${BASE_URL}/en/medico-domicilio/${city.slug}`,
        'x-default': `${BASE_URL}/es/medico-domicilio/${city.slug}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isEn ? 'en_GB' : 'es_ES',
      alternateLocale: isEn ? 'es_ES' : 'en_GB',
      url: `${BASE_URL}/${locale}/medico-domicilio/${city.slug}`,
      siteName: 'OnCall Clinic',
      title,
      description,
    },
    robots: { index: true, follow: true },
  }
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ locale: string; city: string }>
}) {
  const { locale, city: citySlug } = await params
  setRequestLocale(locale)

  const city = getCity(citySlug)
  if (!city) notFound()

  const cityName = city.name[locale as 'es' | 'en'] ?? city.name.es
  const isEn = locale === 'en'
  const t = await getTranslations({ locale, namespace: 'cityPage' })
  const sisters = getSisterCities(city.slug, 3)
  const url = `${BASE_URL}/${locale}/medico-domicilio/${city.slug}`

  // ---------- JSON-LD ----------
  const medBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: `OnCall Clinic — ${cityName}`,
    description: t('hero.subtitle', { city: cityName }),
    url,
    medicalSpecialty: 'GeneralPractice',
    paymentAccepted: ['Credit Card', 'Stripe'],
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: city.province,
      addressCountry: 'ES',
    },
    areaServed: {
      '@type': 'City',
      name: cityName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: cityName,
        addressRegion: city.province,
        addressCountry: 'ES',
      },
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city.lat,
      longitude: city.lng,
    },
    openingHours: 'Mo-Su 00:00-23:59',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: Array.from({ length: FAQ_COUNT }, (_, i) => ({
      '@type': 'Question',
      name: t(`faq.${i}.q`, { city: cityName }),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`faq.${i}.a`, { city: cityName, region: city.region }),
      },
    })),
  }

  const breadcrumbs = breadcrumbsSchema([
    { name: isEn ? 'Home' : 'Inicio', url: `${BASE_URL}/${locale}` },
    { name: t('breadcrumbCities'), url: `${BASE_URL}/${locale}/medicos` },
    { name: cityName, url },
  ])

  // Population sentence rendered with locale-aware separator
  const populationFmt = city.population.toLocaleString(
    isEn ? 'en-GB' : 'es-ES',
  )

  return (
    <main className="min-h-screen bg-[#FAFBFC] text-[#0B1220]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <LandingNavV3 locale={locale} />

      {/* Hero */}
      <section
        className="bg-white border-b border-slate-200"
        style={{ padding: 'clamp(48px, 7vw, 96px) clamp(18px, 4vw, 56px)' }}
      >
        <div className="max-w-[1240px] mx-auto">
          <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-3 uppercase tracking-[0.16em] font-semibold">
            <span>{city.region}</span>
            {city.isLive && (
              <span className="text-emerald-600 inline-flex items-center gap-1">
                <span
                  aria-hidden="true"
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }}
                />
                {t('liveLabel')}
              </span>
            )}
          </div>
          <h1
            className="font-bold text-[#0B1220]"
            style={{ fontSize: 'clamp(34px, 5vw, 60px)', letterSpacing: '-0.02em', lineHeight: 1.05 }}
          >
            {t('hero.title', { city: cityName })}
          </h1>
          <p
            className="text-slate-600 mt-4"
            style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', maxWidth: 720 }}
          >
            {t('hero.subtitle', { city: cityName })}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/patient/request`}
              className="inline-flex items-center justify-center text-white font-semibold"
              style={{
                padding: '13px 22px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #16A34A, #15803D)',
                fontSize: 14.5,
                letterSpacing: '-0.2px',
                boxShadow: '0 12px 28px -10px rgba(22,163,74,0.5)',
                minHeight: 46,
              }}
            >
              {t('hero.cta')}
              <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
            </Link>
            <a
              href={ONCALL_PHONE_TEL}
              className="inline-flex items-center justify-center font-medium"
              style={{
                padding: '13px 18px',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                background: 'white',
                color: '#0B1220',
                fontSize: 14.5,
                minHeight: 46,
              }}
            >
              <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('hero.phone')}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {t('hero.trust.licensed')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {t('hero.trust.247')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {t('hero.trust.languages')}
            </span>
          </div>
        </div>
      </section>

      {/* Unique paragraph (population sentence) */}
      <section
        style={{ padding: 'clamp(48px, 6vw, 80px) clamp(18px, 4vw, 56px)' }}
      >
        <div className="max-w-[920px] mx-auto">
          <h2
            className="font-bold text-[#0B1220]"
            style={{ fontSize: 'clamp(24px, 3.2vw, 36px)', letterSpacing: '-0.02em' }}
          >
            {t('about.title', { city: cityName })}
          </h2>
          <p className="text-slate-600 mt-3 leading-relaxed text-[15.5px]">
            {t('about.body', {
              city: cityName,
              region: city.region,
              population: populationFmt,
            })}
          </p>
          {!city.isLive && (
            <div
              className="mt-6 bg-amber-50 border border-amber-200"
              style={{ padding: '14px 16px', borderRadius: 12 }}
            >
              <p className="text-[13.5px] text-amber-900">
                <strong className="font-semibold">{t('comingSoon.label')}</strong>
                {' '}{t('comingSoon.body', { city: cityName })}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section
        className="bg-white border-y border-slate-200"
        style={{ padding: 'clamp(48px, 6vw, 80px) clamp(18px, 4vw, 56px)' }}
      >
        <div className="max-w-[920px] mx-auto">
          <h2
            className="font-bold text-[#0B1220] mb-6"
            style={{ fontSize: 'clamp(24px, 3.2vw, 36px)', letterSpacing: '-0.02em' }}
          >
            {t('faqTitle', { city: cityName })}
          </h2>
          <div className="space-y-3">
            {Array.from({ length: FAQ_COUNT }).map((_, i) => (
              <details
                key={i}
                className="group bg-[#FAFBFC] border border-slate-200"
                style={{ borderRadius: 12 }}
                open={i === 0}
              >
                <summary
                  className="cursor-pointer list-none flex justify-between items-center gap-4"
                  style={{ padding: '16px 20px', fontSize: 15.5, fontWeight: 600, color: '#0B1220' }}
                >
                  <span>{t(`faq.${i}.q`, { city: cityName })}</span>
                  <span
                    className="text-blue-600 transition-transform group-open:rotate-45"
                    aria-hidden="true"
                    style={{ fontSize: 22, fontWeight: 300, lineHeight: 1 }}
                  >
                    +
                  </span>
                </summary>
                <p
                  className="text-slate-600 leading-relaxed"
                  style={{ padding: '0 20px 16px', fontSize: 14.5 }}
                >
                  {t(`faq.${i}.a`, { city: cityName, region: city.region })}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Sister cities — internal linking cluster */}
      <section
        style={{ padding: 'clamp(48px, 6vw, 80px) clamp(18px, 4vw, 56px)' }}
      >
        <div className="max-w-[1240px] mx-auto">
          <h2
            className="font-bold text-[#0B1220]"
            style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', letterSpacing: '-0.02em' }}
          >
            {t('sister.title')}
          </h2>
          <p className="text-slate-600 mt-2 text-[14.5px]">
            {t('sister.subtitle')}
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sisters.map((s) => {
              const sName = s.name[locale as 'es' | 'en'] ?? s.name.es
              return (
                <Link
                  key={s.slug}
                  href={`/${locale}/medico-domicilio/${s.slug}`}
                  className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                  style={{ padding: '18px 20px', borderRadius: 14, display: 'block' }}
                >
                  <div className="font-semibold text-[#0B1220] text-[15px]">
                    {t('sister.cardTitle', { city: sName })}
                  </div>
                  <div className="text-[12.5px] text-slate-500 mt-1">{s.region}</div>
                  <div className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-blue-600 font-medium">
                    {t('sister.cardCta')} <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <FooterV3 locale={locale} />
    </main>
  )
}
