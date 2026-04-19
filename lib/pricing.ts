/**
 * Dynamic pricing helpers — OnCall Clinic.
 *
 * Rules:
 *   - Year 1 from a doctor's activation: 10% platform commission.
 *   - From month 13 onwards: 15% standard commission.
 *   - Per-doctor price adjustment: ±30% over the regional base price.
 *   - Night/holiday surcharge: 30% extra on the adjusted price.
 */

export const COMMISSION_YEAR_1 = 0.10
export const COMMISSION_STANDARD = 0.15
export const PROMO_MONTHS = 12

/**
 * Months elapsed between two dates (calendar months, inclusive of partial).
 */
function monthsElapsed(from: Date, to: Date = new Date()): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
}

/**
 * Returns the commission rate to apply to a payout, given when the doctor
 * was activated on the platform.
 */
export function getCommissionRate(activatedAt: Date | string | null | undefined): number {
  if (!activatedAt) return COMMISSION_STANDARD
  const date = typeof activatedAt === 'string' ? new Date(activatedAt) : activatedAt
  if (Number.isNaN(date.getTime())) return COMMISSION_STANDARD
  return monthsElapsed(date) < PROMO_MONTHS ? COMMISSION_YEAR_1 : COMMISSION_STANDARD
}

/**
 * Platform fee (commission) on a gross amount, in the same unit as input.
 * e.g. amount in cents → returns cents.
 */
export function calculatePlatformFee(amount: number, activatedAt: Date | string | null | undefined): number {
  return Math.round(amount * getCommissionRate(activatedAt))
}

/**
 * Net amount the doctor receives after platform commission.
 */
export function calculateDoctorPayout(amount: number, activatedAt: Date | string | null | undefined): number {
  return amount - calculatePlatformFee(amount, activatedAt)
}
