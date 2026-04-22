import * as Sentry from '@sentry/nextjs'

// Edge runtime — minimal config, same DSN + env. No redaction helper here
// because edge errors typically don't include body-level health data.
Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.05,
  environment: process.env.VERCEL_ENV || 'development',
})
