/**
 * humanizeError — Round 16-H.
 *
 * Maps known technical error strings to user-friendly toast copy.
 * Default fallback is a polite generic message rather than the raw
 * exception (which can be Stripe SDK + Supabase noise that scares
 * tourists out of the funnel).
 *
 * Intentionally locale-agnostic: callers pass `t` from
 * useTranslations('errors.humanized') and we return the i18n KEY,
 * leaving final translation to next-intl. This keeps the catalog
 * tree-shakable and gives the i18n linter visibility.
 *
 * Pattern at call sites:
 *
 *   import { humanizeError } from '@/lib/errors/humanize'
 *   const tErr = useTranslations('errors.humanized')
 *   try { ... }
 *   catch (e) {
 *     toast({ title: tErr(humanizeError(e)), variant: 'destructive' })
 *   }
 *
 * Add new mappings here as audit feedback surfaces them.
 */

export type HumanizedKey =
  | 'network'
  | 'rateLimited'
  | 'auth'
  | 'unauthorized'
  | 'invalidPhone'
  | 'invalidAddress'
  | 'invalidEmail'
  | 'serverError'
  | 'dbError'
  | 'paymentDeclined'
  | 'rls'
  | 'generic'

/**
 * Mapping table. Order matters: first regex match wins. Add specific
 * patterns BEFORE generic ones so a "RLS violation" with "Failed to
 * fetch" wrapper still maps to 'rls' rather than 'network'.
 */
const PATTERNS: Array<{ test: RegExp; key: HumanizedKey }> = [
  { test: /row-level security|RLS\b/i, key: 'rls' },
  { test: /rate.?limit|too many requests|429/i, key: 'rateLimited' },
  { test: /unauthorized|401\b/i, key: 'unauthorized' },
  { test: /invalid phone|phone format/i, key: 'invalidPhone' },
  { test: /invalid address|address required|address.*length/i, key: 'invalidAddress' },
  { test: /invalid email|email format/i, key: 'invalidEmail' },
  { test: /payment.?failed|card.?declined|payment_method_invalid/i, key: 'paymentDeclined' },
  { test: /failed to fetch|network|networkerror|fetch failed/i, key: 'network' },
  { test: /db.?error|database|postgres|supabase/i, key: 'dbError' },
  { test: /auth.*token|jwt|sign in/i, key: 'auth' },
  { test: /5\d{2}\b|server error/i, key: 'serverError' },
]

export function humanizeError(input: unknown): HumanizedKey {
  const message =
    input instanceof Error
      ? input.message
      : typeof input === 'string'
      ? input
      : typeof input === 'object' && input && 'message' in input
      ? String((input as { message: unknown }).message)
      : ''

  for (const { test, key } of PATTERNS) {
    if (test.test(message)) return key
  }
  return 'generic'
}
