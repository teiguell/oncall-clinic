import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { routing } from '@/i18n/routing'
import { breadcrumbsSchema } from '@/lib/seo/breadcrumbs'
import { LandingNavV3 } from '@/components/landing/v3/LandingNavV3'
import { FooterV3 } from '@/components/landing/v3/FooterV3'
import { Star, MapPin, CheckCircle2 } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'

const BASE_URL = 'https://oncall.clinic'

interface DoctorRow {
  id: string
  user_id: string
  specialty: string
  bio: string | null
  rating: number | null
  total_reviews: number | null
  city: string | null
  consultation_price: number | null
  languages: string[] | null
  years_experience: number | null
  profiles: { full_name: string | null; avatar_url: string | null } | Array<{ full_name: string | null; avatar_url: string | null }>
}

/**
 * /[locale]/medicos — Round 20 Q3-1.
 *
 * Public doctor listing page. Indexable by search engines (long-tail
 * keyword "médico colegiado a domicilio Ibiza" + per-doctor names).
 * Server component; fetches active + verified doctors via service-role
 * (bypasses RLS to render the public surface).
 *
 * SEO surfaces:
 *   - <h1> with keyword phrase
 *   - JSON-LD MedicalOrganization (parent) + Person[] (each doctor)
 *   - BreadcrumbList (Home → Médicos)
 *   - hreflang ES↔EN with x-default → /es/medicos
 *
 * UI: simple card grid (avatar/initials, name, specialty, rating,
 * languages, price). Click-through to /[locale]/patient/request with
 * `preferredDoctorId` query param so the patient lands in Step 2 with
 * the doctor pre-selected.
 *
 * R7 compliance: no clinical data exposed — only public profile
 * fields (specialty as broad category, languages, rating, price).
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
  const t = await getTranslations({ locale, namespace: 'doctorsListing.meta' })
  const isEn = locale === 'en'
  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}/medicos`,
      languages: {
        es: `${BASE_URL}/es/medicos`,
        en: `${BASE_URL}/en/medicos`,
        'x-default': `${BASE_URL}/es/medicos`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isEn ? 'en_GB' : 'es_ES',
      alternateLocale: isEn ? 'es_ES' : 'en_GB',
      url: `${BASE_URL}/${locale}/medicos`,
      siteName: 'OnCall Clinic',
      title: t('title'),
      description: t('description'),
    },
    robots: { index: true, follow: true },
  }
}

export default async function DoctorsListingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = createServiceRoleClient()
  const { data: rawDoctors } = await supabase
    .from('doctor_profiles')
    .select(`
      id, user_id, specialty, bio, rating, total_reviews, city,
      consultation_price, languages, years_experience,
      profiles!inner(full_name, avatar_url)
    `)
    .eq('activation_status', 'active')
    .eq('verification_status', 'verified')
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(20)

  const doctors = ((rawDoctors ?? []) as unknown as DoctorRow[]).map((d) => {
    const p = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles
    return {
      id: d.id,
      fullName: p?.full_name ?? '—',
      avatarUrl: p?.avatar_url ?? null,
      specialty: d.specialty,
      bio: d.bio,
      rating: d.rating,
      totalReviews: d.total_reviews,
      city: d.city,
      consultationPrice: d.consultation_price,
      languages: d.languages ?? [],
      yearsExperience: d.years_experience,
    }
  })

  const t = await getTranslations({ locale, namespace: 'doctorsListing' })
  const tMeta = await getTranslations({ locale, namespace: 'doctorsListing.meta' })

  const url = `${BASE_URL}/${locale}/medicos`

  // JSON-LD MedicalOrganization (parent) + Person array (one per doctor)
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'OnCall Clinic',
    url: BASE_URL,
    medicalSpecialty: 'GeneralPractice',
    areaServed: { '@type': 'City', name: 'Ibiza', address: { '@type': 'PostalAddress', addressCountry: 'ES' } },
    member: doctors.map((d) => ({
      '@type': 'Person',
      name: d.fullName,
      jobTitle: locale === 'en' ? 'Doctor' : 'Médico',
      worksFor: { '@type': 'MedicalOrganization', name: 'OnCall Clinic' },
      knowsLanguage: d.languages,
    })),
  }

  const breadcrumbs = breadcrumbsSchema([
    { name: locale === 'en' ? 'Home' : 'Inicio', url: `${BASE_URL}/${locale}` },
    { name: locale === 'en' ? 'Doctors' : 'Médicos', url },
  ])

  return (
    <main className="min-h-screen bg-[#FAFBFC] text-[#0B1220]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <LandingNavV3 locale={locale} />

      <section
        className="relative overflow-hidden bg-white border-b border-slate-200"
        style={{ padding: 'clamp(40px, 6vw, 72px) clamp(18px, 4vw, 56px)' }}
      >
        <div className="max-w-[1240px] mx-auto">
          {/* Round 23-3 (Q5-5): visual breadcrumbs above the H1. */}
          <Breadcrumbs
            className="text-[13px] text-slate-500 mb-4"
            items={[
              { label: locale === 'en' ? 'Home' : 'Inicio', href: `/${locale}` },
              { label: locale === 'en' ? 'Doctors' : 'Médicos' },
            ]}
          />
          <h1
            className="font-bold text-[#0B1220]"
            style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            {tMeta('title')}
          </h1>
          <p className="text-slate-600 mt-3" style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', maxWidth: 720 }}>
            {tMeta('description')}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13.5px] text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
              {t('stats.doctors', { count: doctors.length })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
              {t('stats.247')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
              {t('stats.languages')}
            </span>
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(18px, 4vw, 56px)' }}>
        <div className="max-w-[1240px] mx-auto">
          {doctors.length === 0 ? (
            <p className="text-center text-slate-500 py-12">{t('emptyState')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((d) => (
                <DoctorCard key={d.id} doctor={d} locale={locale} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href={`/${locale}/patient/request`}
              className="inline-flex items-center justify-center text-white font-semibold"
              style={{
                padding: '14px 26px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #16A34A, #15803D)',
                fontSize: 15,
                letterSpacing: '-0.2px',
                boxShadow: '0 12px 28px -10px rgba(22,163,74,0.5)',
                minHeight: 46,
              }}
            >
              {t('cta')}
            </Link>
          </div>
        </div>
      </section>

      <FooterV3 locale={locale} />
    </main>
  )
}

function DoctorCard({
  doctor,
  locale,
}: {
  doctor: {
    id: string
    fullName: string
    avatarUrl: string | null
    specialty: string
    rating: number | null
    totalReviews: number | null
    city: string | null
    consultationPrice: number | null
    languages: string[]
    yearsExperience: number | null
  }
  locale: string
}) {
  const initials = doctor.fullName.split(' ').slice(0, 2).map((s) => s[0] ?? '').join('').toUpperCase() || '—'
  const priceEuros =
    typeof doctor.consultationPrice === 'number'
      ? Math.round(doctor.consultationPrice / 100)
      : null

  // Round 20 Q3-1: link directly to booking with preferredDoctorId so
  // the patient lands in Step 2 with this doctor pre-selected.
  const bookHref = `/${locale}/patient/request?preferredDoctorId=${doctor.id}`

  return (
    <Link
      href={bookHref}
      className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
      style={{ padding: '20px 22px', borderRadius: 16, display: 'block' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="h-14 w-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 grid place-items-center font-semibold text-slate-600 flex-shrink-0"
          style={{ fontSize: 18 }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#0B1220] text-[15.5px] tracking-[-0.2px] truncate">
            {doctor.fullName}
          </p>
          <p className="text-[13px] text-slate-600 mt-0.5 truncate">
            {doctor.specialty?.replace(/_/g, ' ')}
            {doctor.city && (
              <span>
                {' · '}
                <MapPin className="inline h-3 w-3 -mt-0.5 text-slate-400" aria-hidden="true" /> {doctor.city}
              </span>
            )}
          </p>
          {typeof doctor.rating === 'number' && doctor.rating > 0 && (
            <div className="flex items-center gap-1 mt-1.5 text-[12.5px]">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="font-semibold text-[#0B1220]">{doctor.rating.toFixed(1)}</span>
              {typeof doctor.totalReviews === 'number' && doctor.totalReviews > 0 && (
                <span className="text-slate-400">({doctor.totalReviews})</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {doctor.languages.slice(0, 5).map((lang) => (
          <span
            key={lang}
            className="bg-slate-100 text-slate-600 text-[10.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          >
            {lang}
          </span>
        ))}
      </div>

      <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-slate-100">
        <span className="text-[12px] text-slate-500">
          {doctor.yearsExperience ? `${doctor.yearsExperience} años exp.` : ''}
        </span>
        {priceEuros !== null && (
          <span className="font-bold text-[#0B1220]" style={{ fontSize: 18 }}>
            €{priceEuros}
          </span>
        )}
      </div>
    </Link>
  )
}
