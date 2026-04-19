'use client'

import { ShieldCheck, Lock, Heart, Stethoscope } from 'lucide-react'
import { useTranslations } from 'next-intl'

/**
 * Trust signals row — healthcare UI best practice (UX_MASTERGUIDE §3, Module 3).
 * Place ADJACENT to CTAs, not in footer, for maximum conversion impact.
 */
export function TrustBadges({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('trust')

  const items = [
    { icon: Stethoscope, label: t('comib') },
    { icon: ShieldCheck, label: t('insurance') },
    { icon: Lock, label: t('gdpr') },
    { icon: Heart, label: t('english') },
  ]

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
        {items.map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="pill-success">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
