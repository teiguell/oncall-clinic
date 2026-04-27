/**
 * Brand mark for the v3 landing — gradient blue→indigo square with a
 * white "+" + wordmark "OnCall Clinic" (Clinic in primary blue).
 *
 * Server component, pure SVG/CSS, no client JS. Used in the nav and the
 * iPhone booking-screen mock.
 */
export function LogoMark({
  size = 28,
  white = false,
}: { size?: number; white?: boolean }) {
  const wordColor = white ? '#FFFFFF' : '#0B1220'
  const accentColor = white ? '#60A5FA' : '#3B82F6'
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-grid place-items-center rounded-[9px] shadow-[0_4px_12px_-4px_rgba(59,130,246,.4)]"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
        }}
      >
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span
        style={{ fontWeight: 700, fontSize: size * 0.58, letterSpacing: '-0.01em', color: wordColor }}
      >
        OnCall<span style={{ color: accentColor }}>Clinic</span>
      </span>
    </span>
  )
}
