'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomTabBar } from './bottom-tab-bar'

/**
 * Auto-detects the authenticated user's role and renders the appropriate
 * mobile tab bar. Hidden on landing, auth, legal, tracking, and other
 * public/overlay routes.
 */
export function BottomTabBarWrapper() {
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin' | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    let active = true

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || !active) { setRole(null); return }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (active && data?.role) setRole(data.role as 'patient' | 'doctor' | 'admin')
    })

    return () => { active = false }
  }, [pathname])

  // Hide on specific routes where a tab bar would be noisy / overlap the UI
  const HIDDEN_PATTERNS = [
    /^\/[a-z]{2}$/,             // landing
    /\/login/,
    /\/register/,
    /\/legal/,
    /\/tracking\//,             // tracking has its own emergency FAB
    /\/consultation\/.*\/chat/, // chat is full-screen
    /\/booking-success/,
  ]
  const hidden = !role || HIDDEN_PATTERNS.some(p => p.test(pathname || ''))
  if (hidden) return null

  return <BottomTabBar role={role} />
}
