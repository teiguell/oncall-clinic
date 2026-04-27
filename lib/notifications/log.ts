import { createClient } from '@/lib/supabase/server'

/**
 * notifications_log helper — Round 14.
 *
 * Wraps the INSERT against `notifications_log` (migration 022) and
 * provides a pre-send rate-limit check. All inserts run as the service
 * role via the standard server Supabase client — RLS allows that
 * unconditionally. We never throw on log failure (logging breaking the
 * actual notification path would be a worse outcome than a silent miss).
 */

export type NotificationChannel = 'email' | 'sms' | 'push'
export type NotificationStatus = 'sent' | 'failed' | 'skipped' | 'rate_limited'

export interface LogEntry {
  channel: NotificationChannel
  provider: string
  toAddress: string
  userId?: string | null
  templateKey: string
  locale?: 'es' | 'en'
  status: NotificationStatus
  providerMessageId?: string | null
  errorCode?: string | null
  errorMessage?: string | null
}

export async function logNotification(entry: LogEntry): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('notifications_log').insert({
      channel: entry.channel,
      provider: entry.provider,
      to_address: entry.toAddress,
      user_id: entry.userId ?? null,
      template_key: entry.templateKey,
      locale: entry.locale ?? 'es',
      status: entry.status,
      provider_message_id: entry.providerMessageId ?? null,
      error_code: entry.errorCode ?? null,
      error_message: entry.errorMessage ?? null,
    })
    if (error) {
      console.error('[notifications/log] insert failed:', error.message)
    }
  } catch (err) {
    console.error('[notifications/log] unexpected error:', err)
  }
}

/**
 * Rate limit per recipient: returns `true` if a notification was sent to
 * `toAddress` within the last `windowMs` (default 60s) with status='sent'.
 *
 * Caller should respond with `status='rate_limited'` and skip the
 * actual provider call. We only count `sent` rows, not `failed` or
 * `skipped`, so a transient failure can be retried immediately.
 */
export async function isRateLimited(
  toAddress: string,
  windowMs = 60_000,
): Promise<boolean> {
  try {
    const supabase = await createClient()
    const since = new Date(Date.now() - windowMs).toISOString()
    const { data, error } = await supabase
      .from('notifications_log')
      .select('id')
      .eq('to_address', toAddress)
      .eq('status', 'sent')
      .gte('sent_at', since)
      .limit(1)
    if (error) {
      console.error('[notifications/log] rate-limit check failed:', error.message)
      return false // fail-open: better one duplicate than blocking real OTPs
    }
    return Boolean(data && data.length > 0)
  } catch (err) {
    console.error('[notifications/log] rate-limit check error:', err)
    return false
  }
}
