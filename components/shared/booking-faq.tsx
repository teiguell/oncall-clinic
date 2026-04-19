'use client'

import { useTranslations } from 'next-intl'
import { AlertTriangle, Ban, UserX, Globe, ShieldCheck } from 'lucide-react'

const QUESTIONS = [
  { icon: AlertTriangle, qKey: 'q1', aKey: 'a1', n: 1 as const },
  { icon: Ban,           qKey: 'q2', aKey: 'a2', n: 2 as const },
  { icon: UserX,         qKey: 'q3', aKey: 'a3', n: 3 as const },
  { icon: Globe,         qKey: 'q4', aKey: 'a4', n: 4 as const },
  { icon: ShieldCheck,   qKey: 'q5', aKey: 'a5', n: 5 as const },
] as const

/**
 * Compact FAQ to surface at the booking decision point.
 * Uses native <details>/<summary> — no JS, fast, accessible by default.
 */
export function BookingFaq() {
  const t = useTranslations('bookingFaq')

  return (
    <div className="rounded-card border border-border/60 bg-card p-4 space-y-2">
      <p className="font-display font-semibold text-sm mb-2">{t('title')}</p>
      {QUESTIONS.map(({ icon: Icon, qKey, aKey, n }) => (
        <details key={n} className="group border-b border-border/50 last:border-0">
          <summary className="cursor-pointer list-none flex items-start justify-between gap-3 py-2.5 text-sm">
            <span className="flex items-start gap-2 flex-1">
              <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span className="font-medium">{t(qKey)}</span>
            </span>
            <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">+</span>
          </summary>
          <p className="pl-6 pb-3 text-xs text-muted-foreground leading-relaxed">{t(aKey)}</p>
        </details>
      ))}
    </div>
  )
}
