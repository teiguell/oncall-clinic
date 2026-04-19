'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Star, ShieldCheck } from 'lucide-react'

interface DoctorCardProps {
  name: string
  specialty: string
  rating?: number
  reviewCount?: number
  eta?: number          // in minutes
  price: number         // in EUR (not cents)
  imageUrl?: string
  verified?: boolean
  onRequest?: () => void
}

/**
 * Zocdoc-style doctor card — UI_DESIGN_MASTERGUIDE §4.
 * Used in search results and the booking flow.
 */
export function DoctorCard({
  name,
  specialty,
  rating,
  reviewCount,
  eta,
  price,
  imageUrl,
  verified = false,
  onRequest,
}: DoctorCardProps) {
  const t = useTranslations('doctorCard')
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <article className="card-hover rounded-card border border-border/60 bg-card p-4 shadow-card">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative h-14 w-14 flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={56}
              height={56}
              quality={75}
              loading="lazy"
              className="rounded-full object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary font-display font-semibold text-lg flex items-center justify-center">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-base truncate">{name}</h3>
              <p className="text-xs text-muted-foreground truncate">{specialty}</p>
            </div>
            {verified && (
              <span className="pill-success flex-shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t('verified_comib')}
              </span>
            )}
          </div>

          {/* Rating + ETA */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {typeof rating === 'number' && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
                {typeof reviewCount === 'number' && (
                  <span>({reviewCount} {t('reviews')})</span>
                )}
              </span>
            )}
            {typeof eta === 'number' && (
              <span>{t('eta_minutes', { mins: eta })}</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: price + CTA */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs text-muted-foreground">{t('price_from')} </span>
          <span className="font-display font-semibold text-lg">€{price}</span>
        </div>
        <Button size="sm" onClick={onRequest} className="min-h-[44px] rounded-button">
          {t('request_doctor')}
        </Button>
      </div>
    </article>
  )
}
