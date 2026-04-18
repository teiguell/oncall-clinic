"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export function CrispChat() {
  const pathname = usePathname()
  const locale = useLocale()

  const isAdmin = pathname?.startsWith(`/${locale}/admin`)
  const crispId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID

  useEffect(() => {
    if (!crispId || isAdmin) return

    const initCrisp = async () => {
      const { Crisp } = await import('crisp-sdk-web')

      Crisp.configure(crispId)
      // Set language via session data
      Crisp.session.setData({ locale })

      // If user is logged in, pass info to Crisp
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          if (user.email) {
            Crisp.user.setEmail(user.email)
          }
          if (user.user_metadata?.full_name) {
            Crisp.user.setNickname(user.user_metadata.full_name)
          }
        }
      } catch {
        // Silently fail if auth check fails
      }
    }

    initCrisp()
  }, [crispId, isAdmin, locale])

  if (!crispId || isAdmin) return null

  return null
}
