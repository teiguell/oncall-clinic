'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

/**
 * Reusable logout button — works in any nav (top, bottom, drawer, page).
 *
 * Two-layer sign-out for safety:
 *   1. Client SDK: supabase.auth.signOut() clears local token immediately
 *   2. Server endpoint: POST /api/auth/signout clears cookies too
 * Then: router.push(/locale) + router.refresh() so server components
 * re-render without stale session data.
 *
 * WCAG 2.5.5: touch target min-h-[44px]. Focus ring.
 */
export function LogoutButton({
  variant = 'default',
  className,
}: {
  variant?: 'default' | 'icon' | 'ghost'
  className?: string
}) {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut().catch(() => {})
      // Best-effort server wipe (ignore failures — client already cleared)
      await fetch('/api/auth/signout', { method: 'POST', redirect: 'manual' }).catch(() => {})
    } finally {
      router.push(`/${locale}`)
      router.refresh()
    }
  }

  const label = t('signOut')

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center rounded-xl transition-colors',
          'min-h-[44px] min-w-[44px] p-2.5',
          'text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
          'disabled:opacity-50',
          className,
        )}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
      </button>
    )
  }

  if (variant === 'ghost') {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium',
          'text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
          'disabled:opacity-50',
          className,
        )}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        {label}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl text-sm font-semibold',
        'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
        'disabled:opacity-50 transition-colors',
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {label}
    </button>
  )
}
