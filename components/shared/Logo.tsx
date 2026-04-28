'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'

/**
 * Audience-aware Logo — Round 20 / LOGOS brief.
 *
 * Renders one of three brand logos depending on the active route:
 *
 *   /[locale]/pro/* OR /[locale]/doctor/*    → logo-pro.svg (with PRO badge)
 *   /[locale]/clinica/* OR /[locale]/clinic/* → logo-clinic.svg (navy + gold)
 *   everything else (incl. /[locale]/patient/*) → logo-patient.svg (blue + cross)
 *
 * Replaces the text "OnCall Clinic" wordmark + the inline gradient
 * badge that was rendered per-page. Uses next/image for responsive
 * + lazy loading. SVG so retina + zoom stay crisp without 2x raster.
 *
 * Props:
 *   - `width` / `height` — defaults 130×41 (matches design spec).
 *   - `priority` — set true for above-the-fold logos (sticky nav).
 *
 * Edge case: this is a 'use client' component because we need
 * usePathname. The parent <Link> wrapping it (e.g. in LandingNavV3)
 * stays as a server-rendered link; only the logo itself hydrates.
 */
export function Logo({
  width = 130,
  height = 41,
  priority = true,
  /** Optional override (sets the variant explicitly, ignoring pathname). */
  variant,
  className,
}: {
  width?: number
  height?: number
  priority?: boolean
  variant?: 'patient' | 'pro' | 'clinic'
  className?: string
}) {
  const pathname = usePathname() ?? ''

  const resolved =
    variant ??
    (pathname.match(/\/[a-z]{2}\/(pro|doctor)/) ? 'pro' :
     pathname.match(/\/[a-z]{2}\/(clinica|clinic)/) ? 'clinic' :
     'patient')

  const src = `/brand/logo-${resolved}.svg`
  const alt =
    resolved === 'pro'
      ? 'OnCall Clinic Pro'
      : resolved === 'clinic'
      ? 'OnCall Clinic — Clínicas Asociadas'
      : 'OnCall Clinic'

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ height: 'auto', width: 'auto', maxHeight: height }}
    />
  )
}
