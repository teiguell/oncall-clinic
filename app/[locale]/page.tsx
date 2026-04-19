'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { TrustBadges } from '@/components/trust-badges'
import {
  Stethoscope, MapPin, Clock, Shield, ArrowRight,
  Baby, Dumbbell, Syringe, CheckCircle2, Menu, X,
  AlertTriangle, PhoneCall,
} from 'lucide-react'

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    const targets = el.querySelectorAll('.scroll-reveal')
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [])
  return ref
}

export default function LandingPage() {
  const t = useTranslations('landing')
  const tNav = useTranslations('nav')
  const tServices = useTranslations('services')
  const tTrust = useTranslations('trust')
  const locale = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mainRef = useScrollReveal()

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

      <main id="main-content" ref={mainRef}>
        {/* ═══════════════════════════════════════════════════════
             HERO — clarity-first, single CTA, 112 disclaimer
           ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-10 md:pt-16 pb-16 md:pb-20">
          {/* Subtle gradient using theme tokens, not raw blue-50 */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-muted/60 via-background to-background"
          />
          <div
            aria-hidden="true"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl -z-10"
          />

          <div className="relative container mx-auto px-4 text-center">
            {/* Badge + live pulse */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6 animate-fade-in-up">
              <span className="pill-info">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                {t('badge')}
              </span>
              <span className="pill-success">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 live-dot" aria-hidden="true" />
                {t('liveBadge')}
              </span>
            </div>

            {/* H1 — font-display, responsive scale */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up">
              {heroTitleParts[0]}<br />
              <span className="text-transparent bg-clip-text gradient-primary">
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
        <section id="como-funciona" className="py-16 md:py-20 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 scroll-reveal">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">{t('howItWorks.title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                {t('howItWorks.step1Desc')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto scroll-reveal">
              {[
                { step: '1', icon: MapPin,      title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
                { step: '2', icon: Stethoscope, title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
                { step: '3', icon: CheckCircle2,title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.step} className="relative bg-card rounded-card p-6 md:p-7 shadow-card border border-border/60">
                    <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center shadow-card">
                      {item.step}
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
             FEATURES — 3 cards (reduced from 4, was overwhelming)
           ═══════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 scroll-reveal">
              <h2 className="font-display text-3xl md:text-4xl font-bold">{t('features.title')}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto scroll-reveal">
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
        <section id="servicios" className="py-16 md:py-20 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 scroll-reveal">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">{t('servicesAvail.title')}</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                {t('servicesAvail.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto scroll-reveal">
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
             FOR DOCTORS
           ═══════════════════════════════════════════════════════ */}
        <section id="medicos" className="py-16 md:py-20 bg-gradient-to-br from-primary to-indigo-700 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center scroll-reveal">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-5">{t('forDoctors.title')}</h2>
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
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
             CTA FINAL
           ═══════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4 text-center scroll-reveal">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-5">
              {t('cta.title').split('\n').map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Link href={`/${locale}/patient/request`}>
              <Button size="xl" className="btn-lift shadow-cta gap-2 rounded-button">
                {t('hero.ctaPrimary')}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {t('cta.trust')}
            </p>
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
                <li><Link href={`/${locale}/register`} className="hover:text-white transition-colors">{t('footer.faq')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#medicos" className="hover:text-white transition-colors">{t('footer.forDoctors')}</Link></li>
                <li><Link href={`/${locale}/legal/aviso-legal`} className="hover:text-white transition-colors">{t('footer.about')}</Link></li>
                <li><Link href={`/${locale}/legal/aviso-legal`} className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
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
          </div>
        </div>
      </footer>
    </div>
  )
}
