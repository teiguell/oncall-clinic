import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import '../globals.css'
import { Toaster } from '@/components/ui/toaster'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { MedicalOrganizationJsonLd, FAQPageJsonLd } from '@/components/seo/json-ld'
import { CrispChat } from '@/components/crisp-chat'
import { MobileNav } from '@/components/mobile-nav'
import { TestModeBanner } from '@/components/test-mode-banner'
import { CookieConsent } from '@/components/cookie-consent'
import { VersionBadge } from '@/components/version-badge'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://oncall.clinic'),
  title: {
    default: 'OnCall Clinic — Médico a Domicilio en Ibiza | Home Doctor Ibiza',
    template: '%s | OnCall Clinic Ibiza',
  },
  description:
    'Médico a domicilio en Ibiza desde 1 hora. Consultas de medicina general en tu hotel, villa o domicilio. Verified doctors · Available 24/7 · Pay by card.',
  keywords: [
    'médico a domicilio Ibiza', 'home doctor Ibiza', 'doctor on demand Ibiza',
    'médico urgencias Ibiza', 'pediatra domicilio Ibiza', 'English doctor Ibiza',
    'IV drip Ibiza', 'doctor at hotel Ibiza', 'médico hotel Ibiza',
    'teleconsulta Ibiza', 'médico villa Ibiza', 'visita médica domicilio Baleares',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: 'en_GB',
    url: 'https://oncall.clinic',
    siteName: 'OnCall Clinic',
    title: 'OnCall Clinic — Médico a domicilio en Ibiza',
    description:
      'Consultas de medicina general en tu hotel, villa o domicilio. Desde 1 hora. / General medicine house calls at your hotel, villa or home. From 1 hour.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'OnCall Clinic — Home Doctor Ibiza',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OnCall Clinic — Médico a domicilio Ibiza',
    description: 'General medicine house calls in Ibiza from 1 hour.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large' as const,
    },
  },
  alternates: {
    canonical: 'https://oncall.clinic',
    languages: {
      es: 'https://oncall.clinic/es',
      en: 'https://oncall.clinic/en',
    },
  },
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'es' | 'en')) {
    notFound()
  }

  // Enable static rendering — next-intl needs explicit locale for each request
  // during SSG/ISR, otherwise server components fall back to default locale.
  setRequestLocale(locale)

  const messages = await getMessages({ locale })
  const tA11y = await getTranslations({ locale, namespace: 'a11y' })

  return (
    <html lang={locale} className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-to-content">
          {tA11y('skipToContent')}
        </a>
        <MedicalOrganizationJsonLd />
        <FAQPageJsonLd />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TestModeBanner />
          <VersionBadge />
          {children}
          <Toaster />
          <MobileNav />
          <CrispChat />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
