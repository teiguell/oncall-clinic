'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Stethoscope, Menu, X } from 'lucide-react'
import { LanguageSwitcher } from '@/components/shared/language-switcher'

/**
 * Sticky nav for the /pro doctor-acquisition landing.
 * Client component (mobile menu state). Anchor links use the same ids
 * as the corresponding section components (#benefits, #income, etc.).
 */
export function ProNav({ locale }: { locale: string }) {
  const t = useTranslations('pro.nav')
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4" aria-label="Pro navigation">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600">
            <Stethoscope className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-display text-[15px] text-navy" style={{ fontWeight: 620 }}>
            OnCall Clinic
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#benefits" className="text-sm text-slate-600 hover:text-navy transition-colors">{t('benefits')}</a>
          <a href="#income" className="text-sm text-slate-600 hover:text-navy transition-colors">{t('income')}</a>
          <a href="#process" className="text-sm text-slate-600 hover:text-navy transition-colors">{t('process')}</a>
          <a href="#faq" className="text-sm text-slate-600 hover:text-navy transition-colors">{t('faq')}</a>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href={`/${locale}`}
              className="text-sm text-slate-600 hover:text-navy transition-colors"
            >
              {t('patients')}
            </Link>
            <Link
              href={`/${locale}/doctor/register`}
              className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors min-h-[36px]"
            >
              {t('register')}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5 text-navy" /> : <Menu className="h-5 w-5 text-navy" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <a href="#benefits" onClick={() => setOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center text-slate-700">{t('benefits')}</a>
            <a href="#income" onClick={() => setOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center text-slate-700">{t('income')}</a>
            <a href="#process" onClick={() => setOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center text-slate-700">{t('process')}</a>
            <a href="#faq" onClick={() => setOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center text-slate-700">{t('faq')}</a>
            <Link href={`/${locale}`} onClick={() => setOpen(false)} className="text-sm py-3 min-h-[44px] flex items-center text-slate-700">{t('patients')}</Link>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <LanguageSwitcher />
              <Link
                href={`/${locale}/doctor/register`}
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors min-h-[40px]"
              >
                {t('register')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
