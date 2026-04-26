/**
 * Notifications — types shared across the dispatcher and adapters.
 * Round 11 Fix B (2026-04-26).
 */

export type NotificationKind =
  | 'doctor.welcome'              // tras registro completado
  | 'doctor.activation_email'     // verify email link
  | 'doctor.activation_sms'       // OTP teléfono (6 dígitos)
  | 'doctor.onboarding_complete'  // documentos validados por admin
  | 'doctor.consultation_new'     // nueva consulta asignada
  | 'doctor.consultation_reminder'// 30 min antes
  | 'patient.booking_confirmed'   // tras Stripe success
  | 'patient.doctor_arriving'     // doctor en camino
  | 'patient.consultation_done'   // completar + rating
  | 'admin.doctor_signup'         // admin: nuevo doctor para revisar

export type NotificationChannel = 'email' | 'sms' | 'push'

export interface NotificationRecipient {
  email?: string | null
  phone?: string | null
  /** Optional Supabase user id; useful for audit logs and idempotency. */
  userId?: string | null
}

export interface NotificationRequest {
  to: NotificationRecipient
  kind: NotificationKind
  /** Free-form template substitutions (subject/body interpolation). */
  data?: Record<string, string | number | boolean | null | undefined>
  /** Restrict the channel; defaults are kind-specific (see dispatcher). */
  channels?: NotificationChannel[]
  /** Optional override locale; defaults to 'es' if absent. */
  locale?: 'es' | 'en'
}

export interface NotificationResult {
  ok: boolean
  /** One sent-event per channel that fired, with provider id when available. */
  channels: Array<{
    channel: NotificationChannel
    ok: boolean
    providerId?: string
    error?: string
    /** True when this channel was a no-op (e.g. Resend not configured). */
    skipped?: boolean
  }>
}

/**
 * Each registered template defines how to render an envelope per channel.
 * Channels missing here are unsupported for that kind (caller may still
 * request them — they'll be reported as skipped in NotificationResult).
 */
export interface NotificationTemplate {
  email?: {
    subject: (data: NotificationRequest['data'], locale: 'es' | 'en') => string
    /** Returns plain HTML (must be self-contained, inline styles ok). */
    html: (data: NotificationRequest['data'], locale: 'es' | 'en') => string
    /** Plain-text fallback. */
    text: (data: NotificationRequest['data'], locale: 'es' | 'en') => string
  }
  sms?: {
    body: (data: NotificationRequest['data'], locale: 'es' | 'en') => string
  }
}
