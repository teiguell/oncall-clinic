'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Menu, X, Globe } from 'lucide-react'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { Logo } from '@/components/shared/Logo'

/**
 * v3 sticky nav — client component for mobile menu state.
 * Uses existing LanguageSwitcher (next-intl integrated).
 */
export function LandingNavV3({ locale }: { locale: string }) {
  const t = useTranslations('landingV3.nav')
  const [open, setOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur"
      style={{
        background: 'rgba(250,251,252,.85)',
        borderBottom: '1px solid rgba(11,18,32,.06)',
      }}
    >
      <nav
        className="mx-auto flex items-center justify-between"
        style={{ height: 60, padding: '0 22px', maxWidth: 1280 }}
        aria-label="Main navigation"
      >
        <Link href={`/${locale}`} aria-label="OnCall Clinic">
          {/* LOGOS brief: audience-aware logo replaces the inline wordmark.
              Patient variant by default; the Logo component auto-switches
              based on usePathname for /pro and /clinica routes. */}
          <Logo priority />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-[14px] text-slate-700 font-medium">
          <a href="#como-funciona" className="hover:text-[#0B1220] transition-colors">
            {t('howItWorks')}
          </a>
          <a href="#servicio" className="hover:text-[#0B1220] transition-colors">
            {t('service')}
          </a>
          <Link href={`/${locale}/pro`} className="hover:text-[#0B1220] transition-colors">
            {t('hotels')}
          </Link>
          <a href="#faq" className="hover:text-[#0B1220] transition-colors">
            {t('faq')}
          </a>
          <span className="inline-flex items-center gap-1.5 text-slate-500 text-[13px]">
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            <LanguageSwitcher />
          </span>
          <Link
            href={`/${locale}/patient/request`}
            className="inline-flex items-center justify-center text-white font-semibold"
            style={{
              height: 38,
              padding: '0 18px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              fontSize: 13.5,
              letterSpacing: '-0.01em',
              boxShadow: '0 6px 14px -4px rgba(59,130,246,.4)',
            }}
          >
            {t('ctaPrimary')}
          </Link>
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2.5">
          <span className="inline-flex items-center gap-1 text-[12px] text-slate-500 font-semibold">
            <Globe className="h-[13px] w-[13px]" aria-hidden="true" />
            <LanguageSwitcher />
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid place-items-center bg-white border border-slate-200 min-w-[44px] min-h-[44px]"
            style={{ width: 36, height: 36, borderRadius: 10 }}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5 text-[#0B1220]" /> : <Menu className="h-5 w-5 text-[#0B1220]" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="container mx-auto px-5 py-4 flex flex-col gap-2">
            <a href="#como-funciona" onClick={() => setOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center text-slate-700">
              {t('howItWorks')}
            </a>
            <a href="#servicio" onClick={() => setOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center text-slate-700">
              {t('service')}
            </a>
            <Link href={`/${locale}/pro`} onClick={() => setOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center text-slate-700">
              {t('hotels')}
            </Link>
            <a href="#faq" onClick={() => setOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center text-slate-700">
              {t('faq')}
            </a>
            <Link
              href={`/${locale}/patient/request`}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center text-white font-semibold min-h-[44px]"
              style={{
                height: 44,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                fontSize: 14,
                letterSpacing: '-0.01em',
              }}
            >
              {t('ctaPrimary')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
