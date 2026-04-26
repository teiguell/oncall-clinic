import type { Metadata } from 'next'
import { Inter, Inter_Tight, Plus_Jakarta_Sans } from 'next/font/google'
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
import { CookieConsentLoader } from '@/components/cookie-consent-loader'
import { VersionBadge } from '@/components/version-badge'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
// Inter Tight — tighter sibling for display headlines (landing H1/H2).
// From Claude Design v2 Landing bundle: crisper letter-spacing on large type.
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-inter-tight',
  display: 'swap',
})
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  const isEn = locale === 'en'
  return {
    metadataBase: new URL('https://oncall.clinic'),
    title: {
      default: isEn
        ? 'OnCall Clinic — Home Doctor in Ibiza'
        : 'OnCall Clinic — Médico a Domicilio en Ibiza',
      template: '%s | OnCall Clinic',
    },
    description: isEn
      ? 'Home doctor in Ibiza from 1 hour. General medicine house calls at your hotel, villa or home. Pay by card.'
      : 'Médico a domicilio en Ibiza desde 1 hora. Consultas de medicina general en tu hotel, villa o domicilio. Paga con tarjeta.',
    keywords: [
      'médico a domicilio Ibiza', 'home doctor Ibiza', 'doctor on demand Ibiza',
      'médico urgencias Ibiza', 'pediatra domicilio Ibiza', 'English doctor Ibiza',
      'IV drip Ibiza', 'doctor at hotel Ibiza', 'médico hotel Ibiza',
      'teleconsulta Ibiza', 'médico villa Ibiza', 'visita médica domicilio Baleares',
    ],
    openGraph: {
      type: 'website',
      locale: isEn ? 'en_GB' : 'es_ES',
      alternateLocale: isEn ? 'es_ES' : 'en_GB',
      url: `https://oncall.clinic/${locale}`,
      siteName: 'OnCall Clinic',
      title: isEn
        ? 'OnCall Clinic — Home Doctor in Ibiza'
        : 'OnCall Clinic — Médico a domicilio en Ibiza',
      description: isEn
        ? 'General medicine house calls at your hotel, villa or home. From 1 hour.'
        : 'Consultas de medicina general en tu hotel, villa o domicilio. Desde 1 hora.',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'OnCall Clinic — Home Doctor Ibiza',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isEn
        ? 'OnCall Clinic — Home Doctor Ibiza'
        : 'OnCall Clinic — Médico a domicilio Ibiza',
      description: isEn
        ? 'General medicine house calls in Ibiza from 1 hour.'
        : 'Consultas de medicina general en Ibiza desde 1 hora.',
      images: ['/og-image.jpg'],
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      ],
      apple: '/apple-touch-icon.png',
      shortcut: '/favicon.ico',
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
      canonical: `https://oncall.clinic/${locale}`,
      languages: {
        es: 'https://oncall.clinic/es',
        en: 'https://oncall.clinic/en',
      },
    },
  }
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
    <html lang={locale} className={`${inter.variable} ${interTight.variable} ${jakarta.variable}`} suppressHydrationWarning>
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
          <CookieConsentLoader />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
