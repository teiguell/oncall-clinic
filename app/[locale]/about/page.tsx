import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { Stethoscope, Mail, Shield, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre nosotros | About us',
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'about' })

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container mx-auto px-4 max-w-3xl py-16 md:py-24">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t('kicker')}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              {t('title')}
            </h1>
          </div>
        </div>

        <p className="text-lg text-muted-foreground leading-relaxed mb-10">
          {t('intro')}
        </p>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4 mb-10">
          <h2 className="font-display text-xl font-semibold">{t('company')}</h2>
          <dl className="space-y-2 text-[14px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t('legalName')}</dt>
              <dd className="font-medium">Ibiza Care SL</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">CIF</dt>
              <dd className="font-medium">B19973569</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t('location')}</dt>
              <dd className="font-medium">Ibiza, España</dd>
            </div>
          </dl>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          <Link
            href={`/${locale}/contact`}
            className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors min-h-[44px] inline-flex items-start gap-3"
          >
            <Mail className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-sm">{t('contactLink')}</p>
              <p className="text-xs text-muted-foreground">{t('contactHint')}</p>
            </div>
          </Link>
          <Link
            href={`/${locale}/legal/privacy`}
            className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors min-h-[44px] inline-flex items-start gap-3"
          >
            <Shield className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-sm">{t('privacyLink')}</p>
              <p className="text-xs text-muted-foreground">RGPD / LOPDGDD</p>
            </div>
          </Link>
          <Link
            href={`/${locale}/legal/aviso-legal`}
            className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors min-h-[44px] inline-flex items-start gap-3"
          >
            <FileText className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold text-sm">{t('legalNoticeLink')}</p>
              <p className="text-xs text-muted-foreground">LSSI-CE</p>
            </div>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground italic">{t('wip')}</p>
      </section>
    </main>
  )
}
