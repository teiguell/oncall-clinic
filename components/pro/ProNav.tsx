'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Menu, X } from 'lucide-react'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { Logo } from '@/components/shared/Logo'

/**
 * Sticky nav for /pro — Round 13 v3 design.
 *
 * Client component (mobile menu state). Layout:
 *   Logo "O" gradient + "OnCall Pro" wordmark | desktop nav | login + amber Empezar btn
 *
 * Anchor links match the new section ids:
 *   #how-it-works, #income-calculator, #requirements, #faq
 *
 * Background: rgba(white,.78) with backdrop-blur(14px) — matches design.
 */
export function ProNav({ locale }: { locale: string }) {
  const t = useTranslations('proV3.nav')
  const [open, setOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-30 border-b border-[#EEF1F5] backdrop-blur"
      style={{ background: 'rgba(255,255,255,0.78)' }}
    >
      <nav
        className="flex h-16 items-center justify-between"
        aria-label="Pro navigation"
        style={{ padding: '0 clamp(18px, 4vw, 56px)' }}
      >
        <Link href={`/${locale}`} aria-label="OnCall Clinic Pro" className="flex items-center">
          {/* LOGOS brief: brand logo-pro.svg with PRO badge replaces the
              inline gradient O + wordmark. Width matches the prior
              composite (~130px). */}
          <Logo priority variant="pro" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 text-[14px] font-medium text-[#374151]">
          <a href="#how-it-works" className="hover:text-[#0B1220] transition-colors">
            {t('howItWorks')}
          </a>
          <a href="#income-calculator" className="hover:text-[#0B1220] transition-colors">
            {t('income')}
          </a>
          <a href="#requirements" className="hover:text-[#0B1220] transition-colors">
            {t('requirements')}
          </a>
          <a href="#faq" className="hover:text-[#0B1220] transition-colors">
            {t('faq')}
          </a>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href={`/${locale}/pro/login`}
              className="text-[14px] font-medium text-[#374151] hover:text-[#0B1220] transition-colors mr-1"
            >
              {t('login')}
            </Link>
            <Link
              href={`/${locale}/pro/registro`}
              className="inline-flex items-center justify-center text-white font-semibold"
              style={{
                padding: '11px 18px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                fontSize: 14,
                letterSpacing: '-0.2px',
                boxShadow:
                  '0 6px 18px -6px rgba(245,158,11,0.55), 0 1px 0 rgba(255,255,255,0.2) inset',
                minHeight: 36,
              }}
            >
              {t('ctaPrimary')}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ minHeight: 44, minWidth: 44, borderRadius: 8 }}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? (
              <X className="h-5 w-5 text-[#0B1220]" />
            ) : (
              <Menu className="h-5 w-5 text-[#0B1220]" />
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-[#EEF1F5] bg-white">
          <div className="px-5 py-4 flex flex-col gap-2">
            <a
              href="#how-it-works"
              onClick={() => setOpen(false)}
              className="text-sm py-3 min-h-[44px] flex items-center text-slate-700"
            >
              {t('howItWorks')}
            </a>
            <a
              href="#income-calculator"
              onClick={() => setOpen(false)}
              className="text-sm py-3 min-h-[44px] flex items-center text-slate-700"
            >
              {t('income')}
            </a>
            <a
              href="#requirements"
              onClick={() => setOpen(false)}
              className="text-sm py-3 min-h-[44px] flex items-center text-slate-700"
            >
              {t('requirements')}
            </a>
            <a
              href="#faq"
              onClick={() => setOpen(false)}
              className="text-sm py-3 min-h-[44px] flex items-center text-slate-700"
            >
              {t('faq')}
            </a>
            <Link
              href={`/${locale}/pro/login`}
              onClick={() => setOpen(false)}
              className="text-sm py-3 min-h-[44px] flex items-center text-slate-700"
            >
              {t('login')}
            </Link>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#EEF1F5]">
              <LanguageSwitcher />
              <Link
                href={`/${locale}/pro/registro`}
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center text-white font-semibold"
                style={{
                  padding: '12px 20px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  fontSize: 14,
                  letterSpacing: '-0.2px',
                  boxShadow:
                    '0 6px 18px -6px rgba(245,158,11,0.55), 0 1px 0 rgba(255,255,255,0.2) inset',
                  minHeight: 40,
                }}
              >
                {t('ctaPrimary')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
