'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  Home, Calendar, User, LayoutDashboard, Map, DollarSign, Users, Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'patient' | 'doctor' | 'admin'

interface Tab {
  href: string
  label: string
  icon: LucideIcon
}

interface BottomTabBarProps {
  role: Role
}

/**
 * Mobile bottom tab bar — only visible on <md. Position fixed bottom-0,
 * respects iOS safe-area inset. Renders different tab sets per role.
 * Pair with `pb-20` on <main> to avoid overlap.
 */
export function BottomTabBar({ role }: BottomTabBarProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('nav')

  const tabs: Record<Role, Tab[]> = {
    patient: [
      { href: `/${locale}/patient/dashboard`,     label: t('tabHome'),          icon: Home },
      { href: `/${locale}/patient/history`,       label: t('tabConsultations'), icon: Calendar },
      { href: `/${locale}/patient/profile`,       label: t('tabProfile'),       icon: User },
    ],
    doctor: [
      { href: `/${locale}/doctor/dashboard`,      label: t('tabDashboard'),     icon: LayoutDashboard },
      { href: `/${locale}/doctor/consultations`,  label: t('tabMap'),           icon: Map },
      { href: `/${locale}/doctor/earnings`,       label: t('tabEarnings'),      icon: DollarSign },
      { href: `/${locale}/doctor/profile`,        label: t('tabProfile'),       icon: User },
    ],
    admin: [
      { href: `/${locale}/admin/dashboard`,       label: t('tabDashboard'),     icon: LayoutDashboard },
      { href: `/${locale}/admin/verifications`,   label: t('tabDoctors'),       icon: Users },
      { href: `/${locale}/admin/consultations`,   label: t('tabConsultations'), icon: Calendar },
      { href: `/${locale}/settings`,              label: t('tabConfig'),        icon: Settings },
    ],
  }

  const currentTabs = tabs[role]

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch justify-around">
        {currentTabs.map(tab => {
          const Icon = tab.icon
          const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/')
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2 min-h-[48px] transition-colors',
                  isActive ? 'text-primary' : 'text-gray-500 hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
