/**
 * Reusable section header — short blue rule + UPPERCASE eyebrow,
 * big balanced title, optional subtitle. Server component.
 */
export function SectionHeader({
  eyebrow,
  title,
  sub,
  align = 'left',
}: {
  eyebrow: string
  title: string
  sub?: string
  align?: 'left' | 'center'
}) {
  return (
    <div
      className={align === 'center' ? 'text-center max-w-[720px] mx-auto' : 'text-left'}
    >
      <div
        className="inline-flex items-center gap-1.5"
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#3B82F6',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <span
          aria-hidden="true"
          className="inline-block rounded-[1px]"
          style={{ width: 18, height: 1.5, background: '#3B82F6' }}
        />
        {eyebrow}
      </div>
      <div
        className="mt-3 text-balance"
        style={{
          fontSize: 'clamp(30px, 4vw, 46px)',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          fontWeight: 700,
          color: '#0B1220',
        }}
      >
        {title}
      </div>
      {sub && (
        <div
          className="mt-3 text-slate-600"
          style={{
            fontSize: 'clamp(15px, 1.2vw, 18px)',
            lineHeight: 1.5,
            textWrap: 'pretty' as React.CSSProperties['textWrap'],
          }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}
