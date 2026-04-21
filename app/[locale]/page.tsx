'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { TrustBadges } from '@/components/trust-badges'
import { IntermediaryDisclaimer } from '@/components/intermediary-disclaimer'
import { ServiceScope } from '@/components/shared/service-scope'
import {
  Stethoscope, MapPin, Clock, Shield, ArrowRight,
  Baby, Dumbbell, Syringe, CheckCircle2, Menu, X,
  AlertTriangle, PhoneCall, Star, Check,
} from 'lucide-react'

// Static demo doctors for the landing preview. The real /patient/request flow
// queries Supabase via DoctorSelector; this preview is marketing-only so the
// data is static and rendered server-friendly.
const DEMO_DOCTORS = [
  { initials: 'EM', bg: 'from-amber-200 to-amber-500',  rating: 4.98, reviews: 312, etaKey: 'eta1' as const, langs: ['ES','EN','CA'], specKey: 'spec1' as const, nameKey: 'name1' as const },
  { initials: 'MD', bg: 'from-blue-200 to-blue-500',    rating: 4.96, reviews: 208, etaKey: 'eta2' as const, langs: ['FR','EN','ES'], specKey: 'spec2' as const, nameKey: 'name2' as const },
  { initials: 'SR', bg: 'from-pink-200 to-pink-500',    rating: 4.95, reviews: 187, etaKey: 'eta3' as const, langs: ['IT','EN','ES'], specKey: 'spec3' as const, nameKey: 'name3' as const },
]

export default function LandingPage() {
  const t = useTranslations('landing')
  const tNav = useTranslations('nav')
  const tServices = useTranslations('services')
  const tTrust = useTranslations('trust')
  const tInterm = useTranslations('intermediary')
  const tFaq = useTranslations('faq')
  const tDoctors = useTranslations('landing.doctors')
  const locale = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Design-system features (3 max — Hick's Law)
  const features = [
    {
      icon: Clock,
      title: t('features.urgentTitle'),
      description: t('features.urgentDesc'),
    },
    {
      icon: MapPin,
      title: t('features.trackingTitle'),
      description: t('features.trackingDesc'),
    },
    {
      icon: Shield,
      title: t('features.verifiedTitle'),
      description: t('features.verifiedDesc'),
    },
  ]

  // Only 1 active service + 3 coming soon — per product decision
  const services = [
    { icon: Stethoscope, value: 'general_medicine', active: true },
    { icon: Baby,        value: 'pediatrics',       active: false },
    { icon: Dumbbell,    value: 'physio',           active: false },
    { icon: Syringe,     value: 'nursing',          active: false },
  ]

  const heroTitleParts = t('hero.title').split('\n')

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4" aria-label="Main navigation">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <Stethoscope className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-display text-xl font-bold">OnCall Clinic</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('howItWorks.title')}</Link>
            <Link href="#servicios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{tNav('services')}</Link>
            <Link href="#medicos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('forDoctors.title')}</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <Link href={`/${locale}/login`}>
                <Button variant="outline" size="sm">{tNav('login')}</Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button size="sm" className="btn-lift">{tNav('register')}</Button>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/70 bg-background animate-fade-in-up">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <Link href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center">{t('howItWorks.title')}</Link>
              <Link href="#servicios" onClick={() => setMobileMenuOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center">{tNav('services')}</Link>
              <Link href="#medicos" onClick={() => setMobileMenuOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center">{t('forDoctors.title')}</Link>
              <div className="pt-2 border-t border-border/70 flex items-center justify-between">
                <LanguageSwitcher />
              </div>
              <Link href={`/${locale}/login`} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">{tNav('login')}</Button>
              </Link>
              <Link href={`/${locale}/register`} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">{tNav('register')}</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main-content">
        {/* ═══════════════════════════════════════════════════════
             HERO — clarity-first, single CTA, 112 disclaimer
           ═══════════════════════════════════════════════════════ */}
        <section className="section-animate relative overflow-hidden pt-10 md:pt-16 pb-16 md:pb-20">
          {/* Premium warm multi-layer gradient from prototype */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background: `
                radial-gradient(120% 60% at 100% 0%, rgba(245,158,11,0.10), transparent 60%),
                radial-gradient(90% 70% at 0% 15%, rgba(59,130,246,0.13), transparent 55%),
                linear-gradient(180deg, #FAFBFC 0%, #F1F6FE 100%)
              `,
            }}
          />
          {/* Decorative orb — amber blur top-right */}
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-200/30 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute top-40 left-0 w-80 h-80 rounded-full bg-blue-200/20 blur-3xl pointer-events-none"
          />

          <div className="relative container mx-auto px-4 text-center">
            {/* IBIZA · BALEARES eyebrow — tracked, uppercase, green pulse dot */}
            <div className="flex items-center justify-center gap-2 mb-5 animate-fade-in-up">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot"
                  style={{ boxShadow: '0 0 0 4px rgba(16,185,129,0.15)' }}
                />
                {t('hero.eyebrow')}
              </span>
            </div>
            {/* Secondary trust pills (compact) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 animate-fade-in-up">
              <span className="pill-info">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                {t('badge')}
              </span>
              <span className="pill-success">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 live-dot" aria-hidden="true" />
                {t('liveBadge')}
              </span>
            </div>

            {/* H1 — 40px mobile, 48px+ desktop, tight tracking, solid slate
                 with gradient reserved for the second line only (prototype §hero.title). */}
            <h1 className="font-display text-[40px] sm:text-5xl md:text-5xl lg:text-6xl font-bold tracking-[-0.035em] leading-[1.05] mb-6 animate-fade-in-up text-[#0B1220]">
              {heroTitleParts[0]}
              <span className="block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {heroTitleParts[1]}
              </span>
            </h1>

            {/* Subtitle using theme muted-foreground */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
              {t('hero.subtitle')}
            </p>

            {/* Single primary CTA (Hick's Law) */}
            <div className="flex flex-col items-center gap-3 mb-5">
              <Link href={`/${locale}/patient/request`} className="w-full sm:w-auto">
                <Button size="xl" className="btn-lift shadow-cta w-full sm:w-auto min-h-[48px] gap-2 rounded-button">
                  {t('hero.ctaPrimary')}
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">{t('hero.priceHint')}</p>
              {/* Trust line — specific, honest (no fake ratings) */}
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {tTrust('heroLine')}
              </p>
            </div>

            {/* 112 emergency disclaimer — always visible, non-dismissable */}
            <div
              role="note"
              aria-label="Emergency disclaimer"
              className="mx-auto max-w-2xl mb-8 flex flex-col sm:flex-row items-center gap-3 rounded-card border border-destructive/30 bg-destructive/5 px-4 py-3 animate-fade-in-up"
            >
              <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{t('emergency112.notice')}</span>
              </div>
              <a
                href="tel:112"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-destructive text-destructive-foreground px-3 py-1.5 text-sm font-semibold hover:bg-destructive/90 transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                {t('emergency112.callButton')}
              </a>
            </div>

            {/* Trust badges compact — directly below disclaimer for reinforcement */}
            <div className="animate-fade-in-up">
              <TrustBadges compact />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
             HOW IT WORKS — 3 steps (Hick's + Miller's law)
           ═══════════════════════════════════════════════════════ */}
        <section id="como-funciona" className="section-animate py-16 md:py-20 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary mb-3">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-primary" />
                {t('howItWorks.kicker')}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-balance">{t('howItWorks.title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {[
                { n: '01', icon: MapPin,      title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
                { n: '02', icon: Stethoscope, title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
                { n: '03', icon: CheckCircle2,title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.n} className="relative bg-card rounded-card p-6 md:p-7 shadow-card border border-border/60 overflow-hidden">
                    {/* Big decorative "01/02/03" numeral — prototype §how */}
                    <span
                      aria-hidden="true"
                      className="absolute -top-2 right-4 font-display text-[72px] font-bold text-primary/[0.07] leading-none select-none pointer-events-none"
                    >
                      {item.n}
                    </span>
                    <div className="relative h-[52px] w-[52px] rounded-[14px] bg-gradient-to-br from-blue-50 to-blue-100 text-primary flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="relative text-[11px] font-semibold tracking-[0.12em] text-muted-foreground/80 uppercase mb-1">
                      {item.n}
                    </div>
                    <h3 className="relative font-display text-lg font-semibold mb-2 tracking-tight">{item.title}</h3>
                    <p className="relative text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
             SCOPE — what's included / what's NOT (expectations)
           ═══════════════════════════════════════════════════════ */}
        <ServiceScope />

        {/* ═══════════════════════════════════════════════════════
             FEATURES — 3 cards (reduced from 4, was overwhelming)
           ═══════════════════════════════════════════════════════ */}
        <section className="section-animate py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700 mb-3">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-amber-600" />
                {t('features.kicker')}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-balance">{t('features.title')}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title} className="border-border/60 shadow-card card-hover rounded-card">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="font-display font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
             SERVICES — 1 active + 3 coming soon
           ═══════════════════════════════════════════════════════ */}
        <section id="servicios" className="section-animate py-16 md:py-20 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700 mb-3">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-amber-600" />
                {t('servicesAvail.kicker')}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-balance">{t('servicesAvail.title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                {t('servicesAvail.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {services.map((service) => {
                const Icon = service.icon
                const descKey = `${service.value}_desc` as const
                return (
                  <Card
                    key={service.value}
                    className={
                      'relative rounded-card border transition-all ' +
                      (service.active
                        ? 'border-primary/30 bg-card shadow-card hover:shadow-elevated cursor-pointer'
                        : 'border-border/60 bg-muted/50 opacity-75 cursor-default')
                    }
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={
                          'h-11 w-11 rounded-xl flex items-center justify-center ' +
                          (service.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')
                        }>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span className={service.active ? 'pill-success' : 'pill-neutral'}>
                          {service.active ? t('servicesAvail.availableBadge') : t('servicesAvail.comingSoonBadge')}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-base mb-1">{tServices(service.value)}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t(`servicesAvail.${descKey}`)}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
             DOCTORS PREVIEW — static marketing preview (real list
             lives in /patient/request via <DoctorSelector/>)
           ═══════════════════════════════════════════════════════ */}
        <section id="doctores" className="section-animate py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700 mb-3">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-emerald-600" />
                {tDoctors('kicker')}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-balance">{tDoctors('title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                {tDoctors('subtitle')}
              </p>
            </div>

            <div className="space-y-3">
              {DEMO_DOCTORS.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-card rounded-card border border-border/60 shadow-card"
                >
                  {/* Avatar with verified check */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`h-14 w-14 rounded-full bg-gradient-to-br ${d.bg} text-white font-display font-semibold text-lg flex items-center justify-center`}
                      style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.08)' }}
                    >
                      {d.initials}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-500 border-[2.5px] border-background flex items-center justify-center text-white"
                      aria-label="Verified"
                    >
                      <Check className="h-3 w-3" aria-hidden="true" strokeWidth={3} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-[15px] tracking-tight truncate">
                      {tDoctors(d.nameKey)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {tDoctors(d.specKey)}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span className="font-semibold text-foreground">{d.rating.toFixed(2)}</span>
                        <span className="text-muted-foreground/70">({d.reviews})</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {tDoctors(d.etaKey)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {d.langs.map(lang => (
                        <span
                          key={lang}
                          className="px-1.5 py-0.5 rounded-full bg-[#EFF5FF] text-[10.5px] font-semibold text-[#2563EB] tracking-wide"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href={`/${locale}/patient/request`}>
                <Button variant="outline" size="lg" className="gap-2 rounded-button">
                  {tDoctors('seeAll')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
             FOR DOCTORS
           ═══════════════════════════════════════════════════════ */}
        <section id="medicos" className="section-animate py-16 md:py-20 bg-gradient-to-br from-primary to-indigo-700 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 mb-3">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-emerald-300" />
                {t('forDoctors.kicker')}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-5 text-balance">{t('forDoctors.title')}</h2>
              <p className="text-base md:text-lg opacity-90 mb-10 max-w-2xl mx-auto">
                {t('forDoctors.subtitle')}
              </p>
              <div className="grid md:grid-cols-3 gap-5 mb-10 text-left">
                {[
                  { title: t('forDoctors.benefit1Title'), desc: t('forDoctors.benefit1Desc') },
                  { title: t('forDoctors.benefit2Title'), desc: t('forDoctors.benefit2Desc') },
                  { title: t('forDoctors.benefit3Title'), desc: t('forDoctors.benefit3Desc') },
                ].map((item) => (
                  <div key={item.title} className="p-6 bg-white/10 rounded-card backdrop-blur border border-white/15">
                    <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm opacity-85 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Link href={`/${locale}/register?role=doctor`}>
                <Button size="xl" variant="outline" className="btn-lift border-white text-white hover:bg-white hover:text-primary gap-2 rounded-button">
                  {t('forDoctors.cta')}
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <p className="mt-6 text-xs text-white/70 max-w-xl mx-auto">
                {tInterm('disclaimer')}
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
             FAQ — accordion, 6 common questions
           ═══════════════════════════════════════════════════════ */}
        <section id="faq" className="section-animate py-16 md:py-20 bg-muted/40">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary mb-3">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-primary" />
                {tFaq('kicker')}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-balance">{tFaq('title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground">{tFaq('subtitle')}</p>
            </div>
            <div className="space-y-3">
              {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                <details
                  key={n}
                  className="rounded-card border border-border/60 bg-card shadow-card overflow-hidden group"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 p-5 font-display font-semibold text-left hover:bg-muted/40">
                    <span>{tFaq(`q${n}`)}</span>
                    <span className="text-primary text-xl group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {tFaq(`a${n}`)}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
             CTA FINAL
           ═══════════════════════════════════════════════════════ */}
        <section className="section-animate relative overflow-hidden py-16 md:py-20 text-white">
          {/* Dark navy → primary gradient */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background:
                'linear-gradient(160deg, #0B1F3F 0%, #1E3A8A 60%, #3B82F6 140%)',
            }}
          />
          {/* Decorative orbs (amber top-right, blue bottom-left) */}
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 h-[260px] w-[260px] rounded-full -z-10"
            style={{
              background:
                'radial-gradient(circle, rgba(245,158,11,0.35), transparent 70%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-16 h-[240px] w-[240px] rounded-full -z-10"
            style={{
              background:
                'radial-gradient(circle, rgba(59,130,246,0.6), transparent 70%)',
            }}
          />

          <div className="relative container mx-auto px-4 text-center max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200 mb-3">
              {t('cta.kicker')}
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-balance leading-tight">
              {t('cta.title').split('\n').map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-base md:text-lg text-blue-100/80 mb-8">
              {t('cta.subtitle')}
            </p>

            <Link href={`/${locale}/patient/request`} className="inline-block w-full sm:w-auto">
              <Button
                size="xl"
                className="btn-lift w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-50 shadow-[0_10px_30px_rgba(0,0,0,0.25)] gap-2 rounded-button"
              >
                {t('hero.ctaPrimary')}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-blue-100/80 inline-flex items-center gap-1.5 justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              {t('cta.trust')}
            </p>

            {/* Divider + phone fallback (matches prototype "or call us") */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-xs text-blue-100/70 uppercase tracking-wider">{t('cta.or')}</span>
              <div className="flex-1 h-px bg-white/15" />
            </div>
            <a
              href="tel:+34871183415"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-[14px] border border-white/15 bg-white/10 backdrop-blur text-white font-semibold hover:bg-white/15 transition-colors"
            >
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              +34 871 18 34 15
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#como-funciona" className="hover:text-white transition-colors">{t('footer.howItWorks')}</Link></li>
                <li><Link href="#servicios" className="hover:text-white transition-colors">{t('footer.services')}</Link></li>
                <li><Link href="#faq" className="hover:text-white transition-colors">{t('footer.faq')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#medicos" className="hover:text-white transition-colors">{t('footer.forDoctors')}</Link></li>
                <li><Link href={`/${locale}/legal/aviso-legal`} className="hover:text-white transition-colors">{t('footer.about')}</Link></li>
                <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href={`/${locale}/legal/privacy`} className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                <li><Link href={`/${locale}/legal/terms`} className="hover:text-white transition-colors">{t('footer.terms')}</Link></li>
                <li><Link href={`/${locale}/legal/cookies`} className="hover:text-white transition-colors">{t('footer.cookies')}</Link></li>
                <li><Link href={`/${locale}/legal/aviso-legal`} className="hover:text-white transition-colors">{t('footer.legalNotice')}</Link></li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <span className="font-display font-bold">OnCall Clinic</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{t('footer.tagline')}</p>
              <div className="[&_button]:text-gray-300 [&_button]:hover:text-white [&_button]:hover:bg-gray-800">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center space-y-2">
            <p className="text-sm text-gray-500">{t('footer.copyright')}</p>
            <p className="text-xs text-gray-600 max-w-2xl mx-auto">{t('footer.caibRegistry')}</p>
            <IntermediaryDisclaimer variant="footer" />
          </div>
        </div>
      </footer>
    </div>
  )
}
