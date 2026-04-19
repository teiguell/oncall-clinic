import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { Toaster } from '@/components/ui/toaster'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { MedicalOrganizationJsonLd, FAQPageJsonLd } from '@/components/seo/json-ld'
import { CrispChat } from '@/components/crisp-chat'
import { MobileNav } from '@/components/mobile-nav'
import { TestModeBanner } from '@/components/test-mode-banner'
import { CookieConsent } from '@/components/cookie-consent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://oncallclinic.com'),
  title: {
    default: 'OnCall Clinic — Médico a Domicilio en Ibiza | Home Doctor Ibiza',
    template: '%s | OnCall Clinic Ibiza',
  },
  description:
    'Médico a domicilio en Ibiza en 30 minutos. English-speaking verified doctors at your hotel or villa. Book now, pay by card. Available 24/7.',
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
    url: 'https://oncallclinic.com',
    siteName: 'OnCall Clinic',
    title: 'OnCall Clinic — Médico a Domicilio en Ibiza en 30 minutos',
    description:
      'Verified doctors at your door in Ibiza. English-speaking. Book by app, track in real-time, pay by card.',
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
    title: 'OnCall Clinic — Médico a Domicilio Ibiza',
    description: 'Doctor at your door in Ibiza in 30 minutes. Book now.',
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
    canonical: 'https://oncallclinic.com',
    languages: {
      es: 'https://oncallclinic.com/es',
      en: 'https://oncallclinic.com/en',
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

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <MedicalOrganizationJsonLd />
        <FAQPageJsonLd />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TestModeBanner />
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
