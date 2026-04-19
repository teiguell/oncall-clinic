"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LanguageSwitcher } from './language-switcher'
import { Stethoscope, Bell, LogOut, User, Settings, ChevronDown, Shield } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Profile } from '@/types'

interface NavbarProps {
  user: Profile
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('nav')

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}`)
  }

  const dashboardHref = user.role === 'doctor'
    ? `/${locale}/doctor/dashboard`
    : user.role === 'admin'
    ? `/${locale}/admin/dashboard`
    : `/${locale}/patient/dashboard`

  const roleLabel = user.role === 'doctor'
    ? '🩺 ' + t('roleDoctor')
    : user.role === 'admin'
    ? '⚙️ ' + t('roleAdmin')
    : '🏥 ' + t('rolePatient')

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={dashboardHref} className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 hidden sm:block">OnCall Clinic</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Solicitar médico — visible only for patients (Serial Position Effect) */}
          {user.role === 'patient' && (
            <Link href={`/${locale}/patient/request`} className="hidden sm:inline-flex">
              <Button size="sm" className="gap-1.5 btn-hover">
                <Stethoscope className="h-3.5 w-3.5" />
                {t('requestDoctor')}
              </Button>
            </Link>
          )}

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Role badge */}
          <Badge variant={user.role === 'doctor' ? 'info' : user.role === 'admin' ? 'purple' : 'success'} className="hidden sm:flex">
            {roleLabel}
          </Badge>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-100 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="text-xs gradient-primary text-white">
                    {user.full_name?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.full_name?.split(' ')[0]}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="font-medium text-sm truncate">{user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/profile`} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/settings`} className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t('settings')}
                </Link>
              </DropdownMenuItem>
              {user.role === 'patient' && (
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/patient/privacy`} className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t('privacy')}
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
