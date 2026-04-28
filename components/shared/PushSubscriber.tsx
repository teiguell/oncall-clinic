'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * PushSubscriber — Round 17-F client island.
 *
 * Mounts on patient + doctor dashboards. Idempotently:
 *   1. Registers /sw.js (no-op if already registered)
 *   2. Asks for Notification permission on user gesture (NOT auto —
 *      Safari + Chrome flag silent prompts as spam)
 *   3. Subscribes via PushManager + posts the result to
 *      /api/push/subscribe
 *
 * Renders a small inline button when permission is 'default' (not yet
 * asked). When 'granted' OR 'denied', renders nothing — the user has
 * already decided. This prevents nag-banner UX.
 *
 * Public VAPID key comes from NEXT_PUBLIC_VAPID_PUBLIC_KEY (Cowork
 * env var). Without it, the component renders null + logs a warning
 * — production stays functional.
 *
 * iOS Safari quirks:
 *   - Push only works when the page is added to Home Screen as a PWA
 *     (Safari 16.4+, March 2023). Pre-PWA Safari ignores subscribe.
 *   - We detect via window.matchMedia('(display-mode: standalone)')
 *     and hide the button when not standalone.
 */

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export function PushSubscriber({
  label,
}: {
  /** Optional CTA label override; defaults to "Activar notificaciones". */
  label?: string
}) {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [busy, setBusy] = useState(false)
  const [requested, setRequested] = useState(false)
  const checkedRef = useRef(false)

  // Detect support + read current permission ONCE on mount. Does NOT
  // request permission — that requires a user gesture.
  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (!PUBLIC_VAPID_KEY) {
      console.warn('[PushSubscriber] NEXT_PUBLIC_VAPID_PUBLIC_KEY missing')
      return
    }
    setSupported(true)
    setPermission(Notification.permission)

    // Pre-register the SW silently — no permission prompt yet.
    navigator.serviceWorker.register('/sw.js').catch((e) => {
      console.warn('[PushSubscriber] sw.js register failed', e)
    })
  }, [])

  const subscribe = async () => {
    if (busy) return
    setBusy(true)
    setRequested(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') {
        setBusy(false)
        return
      }

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      // Type cast: PushSubscriptionOptions wants ArrayBuffer; the typed
      // ArrayBufferLike from Uint8Array is functionally identical at
      // runtime but TS variants differ across DOM lib versions.
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY!),
      } as unknown as PushSubscriptionOptionsInit
      const sub = existing ?? (await reg.pushManager.subscribe(subscribeOptions))

      const json = sub.toJSON() as {
        endpoint?: string
        keys?: { p256dh?: string; auth?: string }
      }

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent.slice(0, 250),
        }),
      })
    } catch (e) {
      console.warn('[PushSubscriber] subscribe error', e)
    } finally {
      setBusy(false)
    }
  }

  // Don't render anything when:
  // - not supported (server-side, old browsers, missing VAPID)
  // - permission already granted (subscribed) OR denied (user said no)
  if (!supported) return null
  if (permission === 'granted' || permission === 'denied') return null

  return (
    <button
      type="button"
      onClick={subscribe}
      disabled={busy}
      className="inline-flex items-center gap-2 text-[13px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-lg border border-blue-100 disabled:opacity-50"
    >
      🔔 {label ?? 'Activar notificaciones'}
      {requested && busy && (
        <span className="text-[11px] text-slate-500" aria-hidden="true">…</span>
      )}
    </button>
  )
}
