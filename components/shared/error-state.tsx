'use client'

import { AlertTriangle, WifiOff, ServerCrash, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  phoneNumber = '+34 871 18 34 15',
  icon = 'alert',
  className,
}: ErrorStateProps) {
  const Icon = ICONS[icon]

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
          <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="text-primary hover:underline font-medium">
            {phoneNumber}
          </a>
        </p>
      )}
    </div>
  )
}
