import webpush from 'web-push'
import { createServiceRoleClient } from '@/lib/supabase/service'

/**
 * Web Push helper — Round 17-F.
 *
 * Wraps `web-push` with our service-role Supabase client so any server
 * route can do:
 *
 *   await pushToUser(userId, { title, body, url })
 *
 * Behaviour:
 *   1. Loads all push_subscriptions rows for the user.
 *   2. Fans out webpush.sendNotification per row in parallel.
 *   3. On 410 Gone (subscription expired/revoked), soft-deletes the
 *      row so we don't keep retrying. Other errors are logged, kept.
 *
 * Best-effort: callers don't await per-row failure; they just receive
 * a count summary. Push is COMPLEMENTARY to Twilio SMS — if push
 * fails (offline browser, disabled notifications) the SMS still hits.
 *
 * Env vars (set on Vercel by Cowork):
 *   - VAPID_PUBLIC_KEY       (server)
 *   - VAPID_PRIVATE_KEY      (server)
 *   - NEXT_PUBLIC_VAPID_PUBLIC_KEY (mirrored for client subscribe)
 *   - VAPID_SUBJECT          (mailto:dpo@oncall.clinic by default)
 */

let vapidConfigured = false
function ensureVapidConfigured() {
  if (vapidConfigured) return
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:dpo@oncall.clinic'
  if (!publicKey || !privateKey) {
    throw new Error(
      '[push] VAPID keys missing — set VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY env vars',
    )
  }
  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
}

export interface PushPayload {
  title: string
  body: string
  /** Optional deep-link URL the notification click handler opens. */
  url?: string
  /** Optional icon override. Defaults to /icon.png in the SW. */
  icon?: string
  /** Optional badge override. Defaults to /icon.png in the SW. */
  badge?: string
  /** Optional tag for collapsing duplicates per consultation. */
  tag?: string
  /** If true, notification stays until user dismisses it. */
  requireInteraction?: boolean
}

interface StoredSubscription {
  id: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushResult {
  total: number
  sent: number
  expired: number
  failed: number
}

/**
 * Send a push notification to every subscription belonging to `userId`.
 * Returns a summary count. Does NOT throw on individual failures.
 *
 * Caller pattern:
 *
 *   try { await pushToUser(patientId, { title, body, url }) }
 *   catch (e) { console.warn('[push] all failed', e) }
 *
 * The wrapping try/catch is for VAPID-config-missing only; per-row
 * failures are swallowed.
 */
export async function pushToUser(
  userId: string,
  payload: PushPayload,
): Promise<PushResult> {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    // Silent no-op when keys aren't set (dev / preview without push).
    return { total: 0, sent: 0, expired: 0, failed: 0 }
  }
  ensureVapidConfigured()

  const supabase = createServiceRoleClient()
  const { data: rows, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, keys')
    .eq('user_id', userId)

  if (error) {
    console.error('[push] load subscriptions failed:', error.message)
    return { total: 0, sent: 0, expired: 0, failed: 0 }
  }

  const subs = (rows ?? []) as unknown as StoredSubscription[]
  if (subs.length === 0) {
    return { total: 0, sent: 0, expired: 0, failed: 0 }
  }

  const body = JSON.stringify(payload)
  const results = await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          body,
        )
        // Stamp last_used_at so we know which subs are alive.
        await supabase
          .from('push_subscriptions')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', sub.id)
        return { id: sub.id, status: 'sent' as const }
      } catch (e) {
        const code = (e as { statusCode?: number })?.statusCode
        if (code === 404 || code === 410) {
          // Gone: subscription is dead, soft-delete it
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          return { id: sub.id, status: 'expired' as const }
        }
        console.warn('[push] send failed for', sub.endpoint.slice(0, 40), code, e)
        return { id: sub.id, status: 'failed' as const }
      }
    }),
  )

  return {
    total: subs.length,
    sent: results.filter((r) => r.status === 'sent').length,
    expired: results.filter((r) => r.status === 'expired').length,
    failed: results.filter((r) => r.status === 'failed').length,
  }
}
