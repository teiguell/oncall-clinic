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
 * Hotfix (2026-04-28 18:30): the previous implementation used inline
 *   `style={{ height: 'auto', width: 'auto', maxHeight: height }}`
 * which collapsed the SVG to 0×0 because:
 *   - Browsers can't infer aspect ratio from a viewBox-only SVG when
 *     both width AND height are auto (max-height alone doesn't
 *     trigger ratio resolution).
 * Fix:
 *   1. Tailwind className `h-8 w-auto md:h-10` — fixed height in
 *      flow units; w-auto computes from intrinsic SVG width:height ratio
 *   2. SVG files now carry `width="X" height="Y"` attrs (defense in
 *      depth — even if Tailwind classes were stripped, the browser
 *      now has explicit pixel dimensions to scale from)
 *
 * Props:
 *   - `priority` — set true for above-the-fold logos (sticky nav)
 *   - `variant` — explicit override (skips pathname detection)
 *   - `className` — Tailwind override (defaults to `h-8 w-auto md:h-10`)
 */

const VARIANT_CONFIG = {
  patient: {
    src: '/brand/logo-patient.svg',
    alt: 'OnCall Clinic',
    intrinsicWidth: 260,
    intrinsicHeight: 82,
  },
  pro: {
    src: '/brand/logo-pro.svg',
    alt: 'OnCall Clinic Pro',
    intrinsicWidth: 300,
    intrinsicHeight: 82,
  },
  clinic: {
    src: '/brand/logo-clinic.svg',
    alt: 'OnCall Clinic — Clínicas Asociadas',
    intrinsicWidth: 260,
    intrinsicHeight: 82,
  },
} as const

export function Logo({
  priority = true,
  variant,
  className = 'h-8 w-auto md:h-10',
}: {
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

  const config = VARIANT_CONFIG[resolved]

  return (
    <Image
      src={config.src}
      alt={config.alt}
      width={config.intrinsicWidth}
      height={config.intrinsicHeight}
      priority={priority}
      className={className}
    />
  )
}
