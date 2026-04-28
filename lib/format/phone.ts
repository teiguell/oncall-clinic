/**
 * OnCall Clinic phone number constants — Round 22-4 (Q4-8).
 *
 * Single source of truth for the support / front-desk phone number.
 * Audit found 5 different formatting variants of the same number
 * scattered across the codebase, which:
 *   - reduced trust (visitors notice inconsistencies)
 *   - made the number harder to update if the line changes
 *   - polluted SEO snippets with mixed entity formats
 *
 * Use:
 *   import { ONCALL_PHONE_DISPLAY, ONCALL_PHONE_TEL, ONCALL_WA } from '@/lib/format/phone'
 *
 *   <a href={ONCALL_PHONE_TEL}>{ONCALL_PHONE_DISPLAY}</a>
 *   <a href={ONCALL_WA}>WhatsApp</a>
 *
 * To change the number, edit this file alone — every consumer picks
 * up the new value automatically.
 *
 * ALSO defines safe placeholder values for form inputs that need an
 * example phone (registration, contact form). The placeholder is
 * intentionally an obvious-fake (+34 600 000 000) so users don't
 * accidentally type it as their real number.
 */

/** Front-desk + emergency support phone (Ibiza). */
export const ONCALL_PHONE_E164 = '+34871183415'

/** Display form, with grouped digits (Spanish formatting convention). */
export const ONCALL_PHONE_DISPLAY = '+34 871 18 34 15'

/** `tel:` href — must be E.164 with no spaces. */
export const ONCALL_PHONE_TEL = `tel:${ONCALL_PHONE_E164}`

/** WhatsApp `https://wa.me/{e164-without-plus}` link. */
export const ONCALL_WA = `https://wa.me/${ONCALL_PHONE_E164.replace(/^\+/, '')}`

/** Obvious-fake placeholder for form inputs. NOT a real number. */
export const PLACEHOLDER_PHONE = '+34 600 000 000'
