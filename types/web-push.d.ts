/**
 * Minimal type declarations for `web-push` — Round 17-F.
 *
 * The official `@types/web-push` package is in devDependencies but
 * may not be installed in some local dev contexts where node_modules
 * differs from CI. This ambient .d.ts covers the slice of the API we
 * actually use (setVapidDetails + sendNotification) so tsc passes
 * without the @types/web-push bundle.
 *
 * Once `npm install` runs against the updated package.json (next
 * Vercel build), the official types take precedence — TypeScript
 * resolves package.types ahead of ambient module declarations
 * matching by name.
 */
declare module 'web-push' {
  export interface PushSubscriptionLike {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }

  export interface SendResult {
    statusCode: number
    body: string
    headers: Record<string, string>
  }

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string,
  ): void

  export function sendNotification(
    subscription: PushSubscriptionLike,
    payload?: string | Buffer,
    options?: {
      TTL?: number
      headers?: Record<string, string>
      contentEncoding?: string
      urgency?: 'very-low' | 'low' | 'normal' | 'high'
    },
  ): Promise<SendResult>

  const webpush: {
    setVapidDetails: typeof setVapidDetails
    sendNotification: typeof sendNotification
  }
  export default webpush
}
