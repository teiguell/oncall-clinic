import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV || 'development',

  // Server-side redaction — same key list as client.
  beforeSend(event) {
    return redactSensitive(event)
  },
})

const SENSITIVE_KEYS = new Set([
  'symptoms',
  'notes',
  'patient_report',
  'doctor_internal_notes',
  'health_data',
  'email',
  'phone',
  'ip_address',
  'stripe_secret_key',
  'supabase_service_role_key',
])

function redactSensitive<T extends Record<string, unknown> | Sentry.Event>(obj: T): T {
  const clone = JSON.parse(JSON.stringify(obj)) as T
  walk(clone)
  return clone
}

function walk(node: unknown): void {
  if (!node || typeof node !== 'object') return
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      ;(node as Record<string, unknown>)[k] = '[REDACTED]'
      continue
    }
    if (v && typeof v === 'object') walk(v)
  }
}
