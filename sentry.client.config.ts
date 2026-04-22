import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.5,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',

  /**
   * Redact health-data fields before the event leaves the browser.
   * Medical data (Art. 9 GDPR) must never reach a third-party SaaS.
   */
  beforeSend(event) {
    return redactSensitive(event)
  },
  beforeSendTransaction(event) {
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
])

function redactSensitive<T extends Record<string, unknown> | Sentry.Event>(obj: T): T {
  const clone = JSON.parse(JSON.stringify(obj)) as T
  walk(clone)
  return clone
}

function walk(node: unknown): void {
  if (!node || typeof node !== 'object') return
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k)) {
      ;(node as Record<string, unknown>)[k] = '[REDACTED]'
      continue
    }
    if (v && typeof v === 'object') walk(v)
  }
}
