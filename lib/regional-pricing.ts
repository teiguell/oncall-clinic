/**
 * Regional pricing + night/holiday surcharge helpers.
 *
 * Prices are stored in the SMALLEST currency unit (cents for EUR) to avoid
 * float rounding issues with Stripe.
 */

export interface RegionalPrice {
  region: string
  basePrice: number  // in cents
  currency: 'eur'
  nightSurcharge: number  // multiplier (1.30 = +30%)
}

export const REGIONAL_PRICES: Record<string, RegionalPrice> = {
  ibiza: { region: 'Ibiza', basePrice: 15000, currency: 'eur', nightSurcharge: 1.30 },
}

export const DOCTOR_ADJUSTMENT_RANGE = { min: -0.30, max: 0.30 }

/**
 * Compute the final patient-facing price given the regional base, a doctor's
 * personal adjustment (±30%), and whether the time window triggers a
 * night/holiday surcharge.
 */
export function calculateConsultationPrice(
  basePrice: number,
  doctorAdjustment: number,
  isNightOrHoliday: boolean,
): number {
  const clampedAdjustment = Math.max(
    DOCTOR_ADJUSTMENT_RANGE.min,
    Math.min(DOCTOR_ADJUSTMENT_RANGE.max, doctorAdjustment || 0),
  )
  const adjusted = Math.round(basePrice * (1 + clampedAdjustment))
  return isNightOrHoliday ? Math.round(adjusted * REGIONAL_PRICES.ibiza.nightSurcharge) : adjusted
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
