/**
 * Simple in-memory rate limiter for MVP.
 * In production, replace with Upstash Redis or similar persistent store
 * — in-memory state is lost on every serverless cold start / redeploy.
 */

const rateLimit = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  ip: string,
  limit: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimit.get(ip)

  if (!record || now > record.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  record.count++
  if (record.count > limit) return { allowed: false, remaining: 0 }
  return { allowed: true, remaining: limit - record.count }
}

/**
 * Extract real client IP from Next.js request headers (proxy-aware).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
}
