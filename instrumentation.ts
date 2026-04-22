/**
 * Next.js instrumentation hook — loaded once at startup.
 *
 * Only imports the Sentry config files when SENTRY_DSN is set AND the
 * `@sentry/nextjs` package resolves. This keeps the app bootable in
 * environments without Sentry credentials (e.g. local dev, PR previews).
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return

  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config')
    }
    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config')
    }
  } catch (err) {
    // @sentry/nextjs not installed — log + continue. App must still boot.
    // eslint-disable-next-line no-console
    console.warn('[sentry] not installed, skipping init:', err)
  }
}
