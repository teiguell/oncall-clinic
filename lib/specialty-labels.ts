/**
 * Specialty label i18n — Round 26-4.
 *
 * Single source of truth for doctor specialty → display label mapping.
 * Used by DoctorCard (client), medicos listing (server), and doctor
 * profile pages. Kept out of next-intl message files so it stays
 * co-located with the DB enum definition in types/index.ts.
 *
 * Add new specialties here when the DB enum is extended.
 */

type Locale = 'es' | 'en'

const SPECIALTY_LABELS: Record<string, Record<Locale, string>> = {
  general_medicine: { es: 'Medicina general',  en: 'General medicine' },
  pediatrics:       { es: 'Pediatría',          en: 'Pediatrics' },
  gynecology:       { es: 'Ginecología',        en: 'Gynecology' },
  dermatology:      { es: 'Dermatología',       en: 'Dermatology' },
  internal_medicine:{ es: 'Medicina interna',   en: 'Internal medicine' },
  traumatology:     { es: 'Traumatología',      en: 'Traumatology' },
  cardiology:       { es: 'Cardiología',        en: 'Cardiology' },
  psychiatry:       { es: 'Psiquiatría',        en: 'Psychiatry' },
  neurology:        { es: 'Neurología',         en: 'Neurology' },
  ophthalmology:    { es: 'Oftalmología',       en: 'Ophthalmology' },
  otolaryngology:   { es: 'Otorrinolaringología', en: 'ENT / Otolaryngology' },
  urology:          { es: 'Urología',           en: 'Urology' },
}

/**
 * Returns the display label for a specialty enum value in the given locale.
 * Falls back to a humanised version of the raw key (underscores → spaces,
 * first letter capitalised) so unknown future specialties degrade gracefully.
 */
export function getSpecialtyLabel(specialty: string | null | undefined, locale: Locale): string {
  if (!specialty) return ''
  const map = SPECIALTY_LABELS[specialty]
  if (map) return map[locale]
  // Fallback: "internal_medicine" → "Internal medicine"
  const humanised = specialty.replace(/_/g, ' ')
  return humanised.charAt(0).toUpperCase() + humanised.slice(1)
}
