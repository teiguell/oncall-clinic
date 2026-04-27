'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

/**
 * /pro stats bar — Round 13 v3 design.
 *
 * Client component (count-up animation on scroll-into-view via
 * IntersectionObserver). 4 stats in a single row on md+, 2-col on
 * mobile. Each stat: big tabular number, label, micro-subtext.
 *
 * The count-up parses a target int from each stat's `value` and
 * interpolates from 0 with a cubic-ease-out over 1.4s. Non-numeric
 * prefix/suffix (€, +, %, "<", " días") is preserved by string-split.
 */

const ITEM_COUNT = 4
const DURATION_MS = 1400

type ParsedValue = {
  prefix: string
  number: number
  suffix: string
}

function parseValue(raw: string): ParsedValue {
  // Examples: "850+", "€132", "94%", "<7 días"
  const match = raw.match(/^(\D*?)([\d.,]+)(.*)$/u)
  if (!match) return { prefix: '', number: 0, suffix: raw }
  const num = parseFloat(match[2].replace(/\./g, '').replace(',', '.'))
  return {
    prefix: match[1],
    number: Number.isFinite(num) ? num : 0,
    suffix: match[3],
  }
}

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.25) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setSeen(true)
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, seen, threshold])
  return seen
}

function useCountUp(target: number, started: boolean) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!started) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION_MS)
      const eased = 1 - Math.pow(1 - p, 3)
      setV(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, started])
  return v
}

function StatNumber({ raw, started }: { raw: string; started: boolean }) {
  const { prefix, number, suffix } = parseValue(raw)
  const v = useCountUp(number, started)
  // Round to integer for the visible animation; final `started` snap goes to the parsed value.
  const display = started ? Math.round(v) : 0
  return (
    <span
      className="font-bold tracking-[-1.2px] text-[#0B1220] tabular-nums"
      style={{ fontSize: 'clamp(28px, 3vw, 34px)' }}
    >
      {prefix}
      {display.toLocaleString('es-ES')}
      {suffix}
    </span>
  )
}

export function StatsBar() {
  const t = useTranslations('proV3.stats')
  const ref = useRef<HTMLElement | null>(null)
  const seen = useInView(ref, 0.2)

  return (
    <section
      ref={ref}
      className="bg-white border-y border-[#EEF1F5]"
      style={{ padding: 'clamp(24px, 3.5vw, 36px) clamp(18px, 4vw, 56px)' }}
    >
      <div
        className="max-w-[1240px] mx-auto grid gap-5 md:gap-8"
        style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
      >
        {/* Mobile uses 2-col, desktop 4-col — switch at md */}
        <div className="contents md:hidden">
          {Array.from({ length: ITEM_COUNT }, (_, i) => (
            <StatItem key={i} index={i} t={t} seen={seen} firstInRow={i === 0 || i === 2} />
          ))}
        </div>
        <div className="hidden md:contents">
          {Array.from({ length: ITEM_COUNT }, (_, i) => (
            <StatItem key={i} index={i} t={t} seen={seen} firstInRow={i === 0} desktop />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({
  index,
  t,
  seen,
  firstInRow,
  desktop = false,
}: {
  index: number
  t: ReturnType<typeof useTranslations>
  seen: boolean
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
      <StatNumber raw={t(`items.${index}.value`)} started={seen} />
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
