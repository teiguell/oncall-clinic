/**
 * Postel's Law — be liberal in what you accept, strict in what you emit.
 *
 * Accepts variations:
 *   +34612345678
 *   0034612345678
 *   34612345678
 *   612345678
 *   612 345 678
 *   612-345-678
 *
 * Emits canonical: +34XXXXXXXXX
 * Returns null when digits don't form a plausible phone number (<9 or >15).
 */
export function normalizePhone(input: string, defaultCountry: string = '34'): string | null {
  if (!input) return null

  // Strip everything except digits and leading +
  const trimmed = input.trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')

  if (digits.length < 9 || digits.length > 15) return null

  let normalized: string

  if (hasPlus) {
    // +34... → trust the user's country code
    normalized = digits
  } else if (digits.startsWith('00')) {
    // 0034... → drop the 00 international prefix
    normalized = digits.slice(2)
  } else if (digits.length === 9) {
    // Local 9-digit number → prepend default country code
    normalized = `${defaultCountry}${digits}`
  } else if (digits.startsWith(defaultCountry) && digits.length >= defaultCountry.length + 9) {
    // Already prefixed with country code
    normalized = digits
  } else {
    // Ambiguous — if the leading digits match a known country and the rest is
    // 9+ digits, accept as-is; otherwise fall back to prepending default.
    normalized = digits.length >= 10 ? digits : `${defaultCountry}${digits}`
  }

  if (normalized.length < 10 || normalized.length > 15) return null
  return `+${normalized}`
}

/**
 * Returns a human-readable preview of a canonical phone number, e.g.
 * `+34 612 345 678` from `+34612345678`. Returns the input unchanged if
 * it doesn't start with "+".
 */
export function formatPhonePreview(canonical: string): string {
  if (!canonical?.startsWith('+')) return canonical
  const digits = canonical.slice(1)
  // Naive split for Spanish numbers; generic fallback for others.
  if (digits.startsWith('34') && digits.length === 11) {
    return `+34 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }
  // Generic: "+CC rest" with a space after the first 2-3 digits
  return `+${digits.slice(0, 2)} ${digits.slice(2)}`
}
