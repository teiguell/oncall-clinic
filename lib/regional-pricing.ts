/**
 * Regional pricing — ORIENTATIVE recommendation only.
 *
 * Legal framework: Ley 15/2007 (Defensa Competencia) + STS 805/2020 prevents
 * a technology intermediary from fixing prices for independent professionals.
 * Doctors SET THEIR OWN `consultation_price` freely. We only publish a
 * recommended range to help patients and doctors calibrate expectations.
 *
 * Amounts are in SMALLEST currency unit (cents EUR) for Stripe compatibility.
 */

export interface RegionalPricing {
  region: string
  currency: 'eur'
  recommendedRange: { min: number; max: number }  // cents
  nightSurchargeRecommended: number  // multiplier (1.30 = +30%), non-binding
}

export const REGIONAL_PRICING: Record<string, RegionalPricing> = {
  ibiza: {
    region: 'Ibiza',
    currency: 'eur',
    recommendedRange: { min: 10000, max: 25000 }, // €100 – €250
    nightSurchargeRecommended: 1.30,
  },
}

/**
 * Technical guard-rails on the `consultation_price` column (migration 014).
 * NOT a commercial constraint — only to prevent clearly-broken values.
 */
export const DOCTOR_PRICE_LIMITS = { min: 5000, max: 50000 } // cents

/**
 * Suggested midpoint of the recommended range — used as the default price
 * when a doctor hasn't explicitly set their own.
 */
export function getDefaultPrice(region: string): number {
  const r = REGIONAL_PRICING[region] ?? REGIONAL_PRICING.ibiza
  return Math.round((r.recommendedRange.min + r.recommendedRange.max) / 2)
}

/**
 * Clamp a doctor-entered price to the technical guard-rails.
 */
export function clampDoctorPrice(priceCents: number): number {
  return Math.max(DOCTOR_PRICE_LIMITS.min, Math.min(DOCTOR_PRICE_LIMITS.max, priceCents))
}

/**
 * Returns true when the given date falls in the night-surcharge window:
 *   - 22:00 – 07:59 any day
 *   - Sundays (any hour)
 * (Spanish public holidays can be added later from a static array.)
 */
export function isNightOrHoliday(date: Date): boolean {
  const hour = date.getHours()
  if (hour >= 22 || hour < 8) return true
  if (date.getDay() === 0) return true
  return false
}
