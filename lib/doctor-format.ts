/**
 * Doctor name formatters — Round 7 Fix B (M2) + P0-B sanitization.
 *
 * Live audit caught "Continuar con Dr. Dr. James" because seed data has
 * `firstName: "Dr. James"` and the template prefixed another "Dr." in
 * front. Strip any honorific prefix from both first/last before joining.
 */

const PREFIXES = /^(Dr\.|Dra\.|Doctor|Doctora|Mr\.|Mrs\.|Ms\.)\s+/i

function clean(part: string): string {
  return (part || '').replace(PREFIXES, '').trim()
}

/**
 * Returns "C. Smith" from `{ firstName: "Carlos", lastName: "Smith" }` —
 * a compact form for sticky CTAs and confirmation buttons. Strips any
 * "Dr."/"Dra."/etc prefix already present in the data so the calling i18n
 * key (e.g. `"Continuar con Dr. {name}"`) can prepend its own honorific
 * without duplication.
 */
export function formatDoctorShortName(d: { firstName: string; lastName: string }): string {
  const first = clean(d.firstName)
  const last = clean(d.lastName)
  if (!first && !last) return ''
  if (!first) return last
  if (!last) return first
  return `${first.charAt(0).toUpperCase()}. ${last}`
}

/**
 * Same input shape but pulls from a single `full_name` string the way our
 * doctor_profiles + profiles join produces it ("Carlos Smith Ruiz").
 * Splits on whitespace, last token is the surname; everything before is
 * collapsed into the given-name slot for `formatDoctorShortName`.
 */
export function formatFullNameShort(fullName: string | null | undefined): string {
  if (!fullName) return ''
  const cleaned = fullName.replace(PREFIXES, '').trim()
  if (!cleaned) return ''
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) return parts[0]
  const lastName = parts[parts.length - 1]
  const firstName = parts.slice(0, -1).join(' ')
  return formatDoctorShortName({ firstName, lastName })
}
