'use client'

/**
 * Version badge — gated to non-prod builds by default (audit P1 #11).
 *
 * Visible only when NODE_ENV !== 'production' OR when Ops flips the
 * NEXT_PUBLIC_SHOW_VERSION env var to 'true' (Vercel preview / debug
 * sessions). Keeps the "α 0.6.0" marker out of production pages seen
 * by authenticated patients and doctors.
 */

export const VERSION = '0.6.0'

export function VersionBadge() {
  const shouldShow =
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_SHOW_VERSION === 'true'

  if (!shouldShow) return null

  return (
    <div
      className="fixed top-3 right-3 z-50 flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50/90 backdrop-blur-sm px-2.5 py-1 text-xs sm:text-sm font-medium text-amber-800 shadow-sm pointer-events-none"
      role="status"
      aria-label={`Alpha version ${VERSION}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
      </span>
      <span className="font-mono">α {VERSION}</span>
    </div>
  )
}
