"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Home, ClipboardList, Shield, User, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoutButton } from '@/components/auth/LogoutButton'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export function MobileNav() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('nav')

  // Don't show on admin, landing, or auth pages
  const isAdmin = pathname?.startsWith(`/${locale}/admin`)
  const isAuth = pathname?.includes('/login') || pathname?.includes('/register')
  const isLanding = pathname === `/${locale}` || pathname === '/'
  const isPatient = pathname?.startsWith(`/${locale}/patient`)
  const isDoctor = pathname?.startsWith(`/${locale}/doctor`)

  if (isAdmin || isAuth || isLanding || (!isPatient && !isDoctor)) return null

  const patientItems: NavItem[] = [
    {
      href: `/${locale}/patient/dashboard`,
      label: t('home'),
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: `/${locale}/patient/history`,
      label: t('history'),
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      href: `/${locale}/patient/privacy`,
      label: t('privacy'),
      icon: <Shield className="h-5 w-5" />,
    },
    {
      href: `/${locale}/patient/profile`,
      label: t('profile'),
      icon: <User className="h-5 w-5" />,
    },
  ]

  const doctorItems: NavItem[] = [
    {
      href: `/${locale}/doctor/dashboard`,
      label: t('dashboard'),
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: `/${locale}/doctor/earnings`,
      label: t('earnings'),
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      href: `/${locale}/doctor/consultations`,
      label: t('consultations'),
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      href: `/${locale}/doctor/profile`,
      label: t('profile'),
      icon: <User className="h-5 w-5" />,
    },
  ]

  const items = isDoctor ? doctorItems : patientItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== `/${locale}/patient/dashboard` &&
             item.href !== `/${locale}/doctor/dashboard` &&
             pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2 min-h-[44px] transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-500'
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
        {/* Logout slot — audit P0-1: mobile users need an obvious exit.
             Rendered as a compact icon button styled to match the nav. */}
        <div className="flex flex-col items-center justify-center flex-1">
          <LogoutButton variant="icon" className="!rounded-lg !p-1.5 h-auto" />
        </div>
      </div>
    </nav>
  )
}
