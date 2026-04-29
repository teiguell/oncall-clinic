import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { LandingNavV3 } from '@/components/landing/v3/LandingNavV3'
import { FooterV3 } from '@/components/landing/v3/FooterV3'
import { WaitlistForm } from '@/components/blog/WaitlistForm'

const BASE_URL = 'https://oncall.clinic'

/**
 * /[locale]/blog — Round 23-2 (Q5-2) blog stub.
 *
 * Audit Q4-6 flagged /es/blog as a 404 link in nav/footer (now removed
 * in Round 22-4). Q5-2 brings it back as a real route — a "coming
 * soon" stub with a waitlist form so traffic from referrers / search
 * doesn't bounce. Once the first long-form articles ship (Q5+), this
 * stub will be replaced with a real article index.
 *
 * The waitlist email lands in `waitlist` table with `source =
 * 'blog_stub'` so we can segment the announcement campaign by intent.
 *
 * SEO: returns 200 + `noindex` until articles exist (no point ranking
 * a placeholder), but `follow` so PR backlinks still pass equity to
 * the rest of the site.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
      languages: {
        'es-ES': `${BASE_URL}/es/blog`,
        'en-GB': `${BASE_URL}/en/blog`,
        'x-default': `${BASE_URL}/es/blog`,
      },
    },
    robots: {
      index: false, // no articles yet — don't rank a placeholder
      follow: true,
    },
  }
}

export default async function BlogStubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'blog' })

  return (
    <div className="min-h-screen bg-white">
      <LandingNavV3 locale={locale} />
      <main className="max-w-2xl mx-auto px-6 py-20 md:py-28">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-2">
          {t('comingSoon')}
        </p>
        <p className="text-base text-slate-600 leading-relaxed mb-8">
          {t('description')}
        </p>
        <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
          <h2 className="font-display text-xl font-semibold text-slate-900 mb-2">
            {t('waitlist.heading')}
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            {t('waitlist.subhead')}
          </p>
          <WaitlistForm source="blog_stub" locale={locale} />
        </div>
        <p className="mt-10 text-sm text-slate-500">
          {t('meanwhile')}
        </p>
      </main>
      <FooterV3 locale={locale} />
    </div>
  )
}
