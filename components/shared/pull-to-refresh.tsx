'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'

/**
 * PullToRefresh — Round 25-10 (Z-10).
 *
 * Custom 30-LOC pull-to-refresh wrapper for the mobile doctor +
 * clinic dashboards. Avoids pulling in `react-pull-to-refresh` (24kb
 * gzipped, last update 2021, depends on a class component); we just
 * listen to touchstart/touchmove/touchend at the wrapper level and
 * fire `onRefresh` when the user drags >= TRIGGER_DISTANCE px while
 * scrolled to the top of the page.
 *
 * Interaction:
 *   - Activates only when document.scrollTop === 0 at touchstart.
 *   - Tracks deltaY; while pulling, the indicator (spinner + arrow)
 *     translates downward at half the user's drag distance — gives
 *     iOS-like rubber feedback without fighting native scroll.
 *   - Releases at >= TRIGGER_DISTANCE → calls onRefresh, shows
 *     `state='refreshing'` until the promise resolves.
 *
 * Desktop: this component is a no-op; touch events don't fire so
 * the wrapper renders children verbatim.
 *
 * Accessibility: the indicator is decorative (aria-hidden); the
 * underlying refresh action is also reachable via the realtime
 * subscription / 30s polling already wired into the dashboards.
 */

const TRIGGER_DISTANCE = 70 // px the user must drag to trigger refresh
const MAX_PULL = 120        // visual cap so the indicator doesn't run away

export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void> | void
  children: ReactNode
}) {
  const [pull, setPull] = useState(0)
  const [state, setState] = useState<'idle' | 'pulling' | 'refreshing'>('idle')
  const startYRef = useRef<number | null>(null)

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (state === 'refreshing') return
      // Only engage when scrolled to the top of the document (so we
      // don't hijack scroll-up gestures inside long lists).
      if (typeof document === 'undefined') return
      const scrollTop = document.scrollingElement?.scrollTop ?? 0
      if (scrollTop > 0) {
        startYRef.current = null
        return
      }
      startYRef.current = e.touches[0]?.clientY ?? null
    }

    const onTouchMove = (e: TouchEvent) => {
      if (state === 'refreshing') return
      if (startYRef.current == null) return
      const currentY = e.touches[0]?.clientY ?? 0
      const delta = currentY - startYRef.current
      if (delta <= 0) {
        // user scrolling up while at top — let native handle
        if (pull !== 0) setPull(0)
        if (state !== 'idle') setState('idle')
        return
      }
      // Half-speed rubber pull, capped.
      const visual = Math.min(delta / 2, MAX_PULL)
      setPull(visual)
      setState(visual >= TRIGGER_DISTANCE ? 'pulling' : 'idle')
    }

    const onTouchEnd = async () => {
      if (state === 'refreshing') return
      const triggered = pull >= TRIGGER_DISTANCE
      startYRef.current = null
      if (triggered) {
        setState('refreshing')
        try {
          await onRefresh()
        } finally {
          setState('idle')
          setPull(0)
        }
      } else {
        setPull(0)
        setState('idle')
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [pull, state, onRefresh])

  const indicatorTranslate = state === 'refreshing' ? 40 : pull
  const isReady = pull >= TRIGGER_DISTANCE || state === 'refreshing'

  return (
    <>
      {/* Indicator floats above content, doesn't push it down. */}
      <div
        aria-hidden="true"
        className="fixed left-0 right-0 top-0 grid place-items-center pointer-events-none z-50 transition-opacity"
        style={{
          height: 60,
          transform: `translateY(${indicatorTranslate - 60}px)`,
          opacity: indicatorTranslate > 4 ? 1 : 0,
          transition: state === 'refreshing' ? 'transform 200ms ease-out' : 'none',
        }}
      >
        <div
          className={`grid place-items-center rounded-full bg-white shadow-lg border border-slate-200 ${
            isReady ? 'text-emerald-600' : 'text-slate-400'
          }`}
          style={{ width: 40, height: 40 }}
        >
          {state === 'refreshing' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw
              className="h-5 w-5 transition-transform"
              style={{
                transform: isReady ? 'rotate(180deg)' : `rotate(${pull * 2}deg)`,
              }}
            />
          )}
        </div>
      </div>
      {children}
    </>
  )
}
