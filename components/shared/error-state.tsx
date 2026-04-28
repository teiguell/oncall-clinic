'use client'

import { AlertTriangle, WifiOff, ServerCrash, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ONCALL_PHONE_DISPLAY, ONCALL_PHONE_TEL } from '@/lib/format/phone'

interface ErrorStateProps {
  title: string
  description: string
  onRetry?: () => void
  retryLabel?: string
  showPhone?: boolean
  phoneLabel?: string
  phoneNumber?: string
  icon?: 'alert' | 'wifi' | 'server'
  className?: string
}

const ICONS: Record<NonNullable<ErrorStateProps['icon']>, LucideIcon> = {
  alert: AlertTriangle,
  wifi: WifiOff,
  server: ServerCrash,
}

/**
 * Reusable error state — replaces inline "Something went wrong" messages.
 * Tone: reassuring, non-technical, actionable (retry + optional phone).
 * aria-live="polite" announces the error to screen readers.
 */
export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = 'Reintentar',
  showPhone = false,
  phoneLabel = '¿Problemas? Llámanos',
  phoneNumber = ONCALL_PHONE_DISPLAY,
  icon = 'alert',
  className,
}: ErrorStateProps) {
  const Icon = ICONS[icon]
  // Round 22-4 (Q4-8): use canonical tel: href when the phone matches the
  // company line; otherwise fall back to the strip-spaces approach so a
  // caller can still pass a custom number.
  const telHref = phoneNumber === ONCALL_PHONE_DISPLAY
    ? ONCALL_PHONE_TEL
    : `tel:${phoneNumber.replace(/\s/g, '')}`

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4 max-w-md mx-auto',
        className,
      )}
    >
      <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-amber-600" aria-hidden="true" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} className="min-h-[44px]">
          {retryLabel}
        </Button>
      )}
      {showPhone && (
        <p className="mt-4 text-sm text-muted-foreground">
          {phoneLabel}:{' '}
          <a href={telHref} className="text-primary hover:underline font-medium">
            {phoneNumber}
          </a>
        </p>
      )}
    </div>
  )
}
