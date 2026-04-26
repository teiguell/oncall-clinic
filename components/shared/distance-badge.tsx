import { MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DistanceBadgeProps {
  distanceKm?: number | null
  etaMinutes?: number | null
  className?: string
  /** Variant: muted = grey (in card body), solid = green (highlight ETA) */
  variant?: 'muted' | 'solid'
}

/**
 * DistanceBadge — Round 7 Fix A (M1, M3, M12).
 *
 * Standard renderer for "distance + ETA" on doctor cards. Hides each chip
 * independently when its value is missing so we never show "— km" or
 * "0 min". Used in:
 *   - DoctorSelector card (Step 2 of booking)
 *   - DoctorCard (search results)
 *   - any future surface where we need to convey proximity
 */
export function DistanceBadge({
  distanceKm,
  etaMinutes,
  className,
  variant = 'muted',
}: DistanceBadgeProps) {
  const hasDistance = typeof distanceKm === 'number' && Number.isFinite(distanceKm)
  const hasEta = typeof etaMinutes === 'number' && Number.isFinite(etaMinutes)
  if (!hasDistance && !hasEta) return null

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-[12px]',
        variant === 'muted' ? 'text-muted-foreground' : 'text-emerald-600 font-semibold',
        className,
      )}
    >
      {hasDistance && (
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          {distanceKm!.toFixed(1)} km
        </span>
      )}
      {hasDistance && hasEta && <span className="text-muted-foreground/50" aria-hidden="true">·</span>}
      {hasEta && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden="true" />
          ~{etaMinutes} min
        </span>
      )}
    </div>
  )
}
