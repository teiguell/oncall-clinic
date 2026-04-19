'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import {
  Stethoscope, MapPin, Clock, Shield, ArrowRight,
  Heart, Activity, Baby, Thermometer, Dumbbell, CheckCircle2, Zap, Menu, X
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
  const locale = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mainRef = useScrollReveal()

  const features = [
    { icon: Zap, title: t('features.urgentTitle'), description: t('features.urgentDesc'), color: 'text-yellow-600 bg-yellow-50' },
    { icon: Clock, title: t('features.scheduledTitle'), description: t('features.scheduledDesc'), color: 'text-blue-600 bg-blue-50' },
    { icon: MapPin, title: t('features.trackingTitle'), description: t('features.trackingDesc'), color: 'text-green-600 bg-green-50' },
    { icon: Shield, title: t('features.verifiedTitle'), description: t('features.verifiedDesc'), color: 'text-purple-600 bg-purple-50' },
  ]

  const services = [
    { icon: Stethoscope, value: 'general_medicine', time: '30-45 min' },
    { icon: Baby, value: 'pediatrics', time: '30-45 min' },
    { icon: Heart, value: 'cardiology', time: '45-60 min' },
    { icon: Activity, value: 'emergency', time: '15-30 min' },
    { icon: Thermometer, value: 'internal_medicine', time: '45-60 min' },
    { icon: Dumbbell, value: 'physio', time: '45-60 min' },
  ]

  const stats = [
    { value: '30', label: t('stats.arrival') },
    { value: '4.9★', label: t('stats.rating') },
    { value: '24/7', label: t('stats.available') },
    { value: '15%', label: t('stats.commission') },
  ]

  const heroTitleParts = t('hero.title').split('\n')

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4" aria-label="Main navigation">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">OnCall Clinic</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#servicios" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{tNav('services')}</Link>
            <Link href="#como-funciona" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{t('howItWorks.title')}</Link>
            <Link href="#medicos" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{t('forDoctors.title')}</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <Link href={`/${locale}/login`}>
                <Button variant="outline" size="sm">{tNav('login')}</Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button size="sm">{tNav('register')}</Button>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <Link href="#servicios" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-700 py-3 min-h-[44px] flex items-center">{tNav('services')}</Link>
              <Link href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-700 py-3 min-h-[44px] flex items-center">{t('howItWorks.title')}</Link>
              <Link href="#medicos" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-700 py-3 min-h-[44px] flex items-center">{t('forDoctors.title')}</Link>
              <div className="pt-2 border-t flex items-center justify-between">
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

      <main ref={mainRef}>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-white pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Badge variant="info" className="px-4 py-1.5 text-sm">
              {t('badge')}
            </Badge>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1.5 text-sm font-medium text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500 live-dot" />
              {t('liveBadge')}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            {heroTitleParts[0]}<br />
            <span className="text-transparent bg-clip-text gradient-primary">
              {heroTitleParts[1]}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/patient/request`}>
              <Button size="xl" className="w-full sm:w-auto gap-2">
                {t('hero.ctaPrimary')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href={`/${locale}/register?role=doctor`}>
              <Button size="xl" variant="outline" className="w-full sm:w-auto gap-2">
                <Stethoscope className="h-5 w-5" />
                {t('hero.ctaSecondary')}
              </Button>
            </Link>
          </div>
          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            {[t('hero.trustBadge1'), t('hero.trustBadge2'), t('hero.trustBadge3')].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('howItWorks.title')}</h2>
            <p className="text-xl text-gray-600">{t('howItWorks.step1Desc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto scroll-reveal">
            {[
              { step: '1', icon: '📍', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
              { step: '2', icon: '🩺', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
              { step: '3', icon: '🚗', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">
                    {item.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 md:right-auto md:-left-2 h-7 w-7 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('features.title')}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 scroll-reveal">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('services.title')}</h2>
            <p className="text-xl text-gray-600">{t('services.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto scroll-reveal">
            {services.map((service) => (
              <Card key={service.value} className="border hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mx-auto mb-3 transition-colors">
                    <service.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="font-medium text-gray-900 text-sm">{tServices(service.value)}</div>
                  {service.time && (
                    <div className="text-xs text-blue-600 mt-1 font-medium">{service.time}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For doctors */}
      <section id="medicos" className="py-24 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <h2 className="text-4xl font-bold mb-6">{t('forDoctors.title')}</h2>
            <p className="text-xl opacity-90 mb-10">
              {t('forDoctors.subtitle')}
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: '💶', title: t('forDoctors.benefit1Title'), desc: t('forDoctors.benefit1Desc') },
                { icon: '🗓️', title: t('forDoctors.benefit2Title'), desc: t('forDoctors.benefit2Desc') },
                { icon: '📱', title: t('forDoctors.benefit3Title'), desc: t('forDoctors.benefit3Desc') },
              ].map((item) => (
                <div key={item.title} className="text-left p-6 bg-white/10 rounded-2xl backdrop-blur">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm opacity-80">{item.desc}</p>
                </div>
              ))}
            </div>
            <Link href={`/${locale}/register?role=doctor`}>
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700 gap-2">
                {t('forDoctors.cta')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t('cta.title').split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            {t('cta.subtitle')}
          </p>
          <Link href={`/${locale}/register`}>
            <Button size="xl" className="gap-2 shadow-xl shadow-blue-500/30">
              {t('cta.button')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            <CheckCircle2 className="inline h-4 w-4 text-green-500 mr-1" />
            {t('cta.trust')}
          </p>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          {/* 4-column grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Product */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#como-funciona" className="hover:text-white transition-colors">{t('footer.howItWorks')}</Link></li>
                <li><Link href="#servicios" className="hover:text-white transition-colors">{t('footer.services')}</Link></li>
                <li><Link href={`/${locale}/register`} className="hover:text-white transition-colors">{t('footer.faq')}</Link></li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#medicos" className="hover:text-white transition-colors">{t('footer.forDoctors')}</Link></li>
                <li><Link href={`/${locale}/legal/aviso-legal`} className="hover:text-white transition-colors">{t('footer.about')}</Link></li>
                <li><Link href={`/${locale}/legal/aviso-legal`} className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href={`/${locale}/legal/privacy`} className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                <li><Link href={`/${locale}/legal/terms`} className="hover:text-white transition-colors">{t('footer.terms')}</Link></li>
                <li><Link href={`/${locale}/legal/cookies`} className="hover:text-white transition-colors">{t('footer.cookies')}</Link></li>
                <li><Link href={`/${locale}/legal/aviso-legal`} className="hover:text-white transition-colors">{t('footer.legalNotice')}</Link></li>
              </ul>
            </div>
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">OnCall Clinic</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{t('footer.tagline')}</p>
              <div className="[&_button]:text-gray-300 [&_button]:hover:text-white [&_button]:hover:bg-gray-800">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-sm text-gray-500">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
