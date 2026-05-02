'use client'

import { useTranslations } from 'next-intl'

/**
 * /pro stats bar — Round 26-2 (Z-12).
 *
 * Round 13 introduced a count-up animation on scroll-into-view.
 * Round 26 removes it: the previous animated values (850 visitas,
 * €132 neto, 94% retención, <7 días) were projections without real
 * backing data. LGCU art. 20 prohibits misleading commercial claims —
 * keeping fake counts animating into a "live" stat bar is a LGCU risk.
 *
 * Replaced with the four defensible current figures:
 *   9+   médicos activos (verified on 2026-05-01)
 *   €150 tarifa base por visita (pricing canonical, lib/pricing.ts)
 *   24/7 cobertura urgencias + programadas
 *   60   minutos media de llegada (operational target)
 *
 * Static render — no IntersectionObserver, no requestAnimationFrame,
 * no client-side state. Component stays 'use client' because next-intl
 * useTranslations requires a client boundary here.
 */

export function StatsBar() {
  const t = useTranslations('proV3.stats')

  return (
    <section
      className="bg-white border-y border-[#EEF1F5]"
      style={{ padding: 'clamp(24px, 3.5vw, 36px) clamp(18px, 4vw, 56px)' }}
    >
      <div
        className="max-w-[1240px] mx-auto grid gap-5 md:gap-8"
        style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
      >
        {/* Mobile 2-col */}
        <div className="contents md:hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <StatItem key={i} index={i} t={t} firstInRow={i === 0 || i === 2} />
          ))}
        </div>
        {/* Desktop 4-col */}
        <div className="hidden md:contents">
          {Array.from({ length: 4 }, (_, i) => (
            <StatItem key={i} index={i} t={t} firstInRow={i === 0} desktop />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({
  index,
  t,
  firstInRow,
  desktop = false,
}: {
  index: number
  t: ReturnType<typeof useTranslations>
  firstInRow: boolean
  desktop?: boolean
}) {
  return (
    <div
      style={
        desktop && !firstInRow
          ? { paddingLeft: 32, borderLeft: '1px solid #EEF1F5' }
          : undefined
      }
    >
      <span
        className="font-bold tracking-[-1.2px] text-[#0B1220] tabular-nums"
        style={{ fontSize: 'clamp(28px, 3vw, 34px)' }}
      >
        {t(`items.${index}.value`)}
      </span>
      <div
        className="font-semibold text-[#374151]"
        style={{ fontSize: 14, letterSpacing: '-0.1px', marginTop: 4 }}
      >
        {t(`items.${index}.label`)}
      </div>
      <div className="text-[12px] text-slate-400" style={{ marginTop: 2 }}>
        {t(`items.${index}.sub`)}
      </div>
    </div>
  )
}
