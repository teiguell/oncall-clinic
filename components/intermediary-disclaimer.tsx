'use client'

import { useTranslations } from 'next-intl'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'inline' | 'card' | 'footer'
  className?: string
}

/**
 * Intermediary disclaimer — LEGALLY REQUIRED per LSSI-CE + intermediation
 * status. Must appear in at least 7 locations (footer, booking confirm,
 * register, landing "for doctors", Legal Notice, Terms, results page).
 *
 * Variants:
 *   - footer: small, muted, single line (default footers)
 *   - inline: small, plain (inline within form or section)
 *   - card:   larger, bordered, with icon (prominent disclosure spots)
 */
export function IntermediaryDisclaimer({ variant = 'inline', className }: Props) {
  const t = useTranslations('intermediary')
  const text = t('disclaimer')

  if (variant === 'footer') {
    return (
      <p className={cn('text-[11px] leading-relaxed text-gray-500 max-w-3xl mx-auto', className)}>
        {text}
      </p>
    )
  }

  if (variant === 'card') {
    return (
      <div
        role="note"
        className={cn(
          'rounded-card border border-blue-200 bg-blue-50/60 px-4 py-3 flex items-start gap-3',
          className,
        )}
      >
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <p className="text-xs text-blue-900 leading-relaxed">{text}</p>
      </div>
    )
  }

  // inline
  return (
    <p className={cn('text-xs text-muted-foreground leading-relaxed', className)}>
      {text}
    </p>
  )
}
