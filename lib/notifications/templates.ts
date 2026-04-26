/**
 * Notification templates — Round 11 Fix B.
 *
 * Each kind has subject/html/text for email and an optional body for SMS.
 * Templates are bilingual; callers pass `locale` (defaults to 'es').
 *
 * Keep the HTML self-contained (inline styles only). No external CSS,
 * no external fonts — Resend renders them server-side and most email
 * clients strip <style> tags.
 */

import type { NotificationKind, NotificationTemplate } from './types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://oncall.clinic'

/** Tiny HTML escape for user-supplied data interpolations. */
function esc(value: unknown): string {
  if (value == null) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Standard envelope wrap so all our emails share branding. */
function wrap(content: string, locale: 'es' | 'en' = 'es'): string {
  const footerLine =
    locale === 'en'
      ? 'OnCall Clinic — Ibiza Care S.L. · Technology intermediary, no medical services.'
      : 'OnCall Clinic — Ibiza Care S.L. · Intermediario tecnológico. No prestamos servicios médicos.'
  return `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:0;background:#f6f8fa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fa;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;border:1px solid #e2e8f0;">
          <tr><td style="padding:28px 32px;">
            <div style="font-size:20px;font-weight:700;color:#1B3A5C;margin-bottom:24px;">OnCall Clinic</div>
            ${content}
          </td></tr>
        </table>
        <p style="font-size:12px;color:#64748b;margin:18px 0 0;">${footerLine}</p>
      </td></tr>
    </table>
  </body>
</html>`
}

function ctaButton(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:#0d9488;color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;margin:16px 0;">${esc(label)}</a>`
}

const TEMPLATES: Partial<Record<NotificationKind, NotificationTemplate>> = {
  'doctor.welcome': {
    email: {
      subject: (_, locale) =>
        locale === 'en' ? 'Welcome to OnCall Clinic' : 'Bienvenido a OnCall Clinic',
      html: (data, locale) => {
        const name = esc(data?.name) || (locale === 'en' ? 'doctor' : 'doctor/a')
        if (locale === 'en') {
          return wrap(
            `<p>Hi ${name},</p>
             <p>Welcome to OnCall Clinic — the doctor-on-demand network across Spain.</p>
             <p>Your application is recorded. Next step: complete your professional profile and verification.</p>
             ${ctaButton(`${APP_URL}/en/doctor/onboarding`, 'Continue onboarding')}
             <p style="font-size:12px;color:#64748b;">If you didn't start a registration, ignore this email.</p>`,
            'en',
          )
        }
        return wrap(
          `<p>Hola ${name},</p>
           <p>Bienvenido a OnCall Clinic — la red de médicos a domicilio en España.</p>
           <p>Tu solicitud está registrada. Siguiente paso: completa tu perfil profesional y verificación.</p>
           ${ctaButton(`${APP_URL}/es/doctor/onboarding`, 'Continuar onboarding')}
           <p style="font-size:12px;color:#64748b;">Si no iniciaste el registro, ignora este email.</p>`,
          'es',
        )
      },
      text: (data, locale) => {
        const name = (data?.name as string) || ''
        const link = `${APP_URL}/${locale}/doctor/onboarding`
        return locale === 'en'
          ? `Hi ${name},\n\nWelcome to OnCall Clinic. Continue onboarding: ${link}`
          : `Hola ${name},\n\nBienvenido a OnCall Clinic. Continúa el onboarding: ${link}`
      },
    },
  },

  'doctor.activation_email': {
    email: {
      subject: (_, locale) =>
        locale === 'en' ? 'Confirm your OnCall Clinic account' : 'Confirma tu cuenta OnCall Clinic',
      html: (data, locale) => {
        const link = (data?.confirmUrl as string) || `${APP_URL}/${locale}/doctor/onboarding`
        if (locale === 'en') {
          return wrap(
            `<p>Confirm your email to activate your doctor account.</p>
             ${ctaButton(link, 'Confirm email')}
             <p style="font-size:12px;color:#64748b;">This link expires in 24 hours.</p>`,
            'en',
          )
        }
        return wrap(
          `<p>Confirma tu email para activar tu cuenta de médico.</p>
           ${ctaButton(link, 'Confirmar email')}
           <p style="font-size:12px;color:#64748b;">Este enlace caduca en 24 horas.</p>`,
          'es',
        )
      },
      text: (data, locale) => {
        const link = (data?.confirmUrl as string) || `${APP_URL}/${locale}/doctor/onboarding`
        return locale === 'en'
          ? `Confirm your email to activate your OnCall Clinic doctor account: ${link}`
          : `Confirma tu email para activar tu cuenta OnCall Clinic: ${link}`
      },
    },
  },

  'doctor.activation_sms': {
    sms: {
      body: (data, locale) => {
        const code = esc(data?.code) || '------'
        return locale === 'en'
          ? `OnCall Clinic: your verification code is ${code}. Valid 10 min.`
          : `OnCall Clinic: tu código de verificación es ${code}. Válido 10 min.`
      },
    },
  },

  'doctor.onboarding_complete': {
    email: {
      subject: (_, locale) =>
        locale === 'en' ? 'Your account is active' : 'Tu cuenta ya está activa',
      html: (_, locale) => {
        const link = `${APP_URL}/${locale}/doctor/dashboard`
        if (locale === 'en') {
          return wrap(
            `<p>Your professional documents have been verified. Your OnCall Clinic doctor account is now active.</p>
             <p>You can start receiving consultation requests.</p>
             ${ctaButton(link, 'Go to dashboard')}`,
            'en',
          )
        }
        return wrap(
          `<p>Tus documentos profesionales han sido verificados. Tu cuenta de médico OnCall Clinic está activa.</p>
           <p>Ya puedes empezar a recibir solicitudes de consulta.</p>
           ${ctaButton(link, 'Ir al dashboard')}`,
          'es',
        )
      },
      text: (_, locale) => {
        const link = `${APP_URL}/${locale}/doctor/dashboard`
        return locale === 'en'
          ? `Your OnCall Clinic doctor account is active. Dashboard: ${link}`
          : `Tu cuenta de médico OnCall Clinic está activa. Dashboard: ${link}`
      },
    },
  },

  'doctor.consultation_new': {
    email: {
      subject: (data, locale) =>
        locale === 'en'
          ? `New consultation: ${esc(data?.address) || 'Ibiza'}`
          : `Nueva consulta: ${esc(data?.address) || 'Ibiza'}`,
      html: (data, locale) => {
        const link = (data?.dashboardUrl as string) || `${APP_URL}/${locale}/doctor/dashboard`
        const address = esc(data?.address) || ''
        const price = esc(data?.price) || ''
        if (locale === 'en') {
          return wrap(
            `<p>You have a new consultation request.</p>
             <p><b>Address:</b> ${address}<br/><b>Price:</b> €${price}</p>
             ${ctaButton(link, 'Open dashboard')}
             <p style="font-size:12px;color:#64748b;">Tap "Accept" within 5 minutes to claim this visit.</p>`,
            'en',
          )
        }
        return wrap(
          `<p>Tienes una nueva solicitud de consulta.</p>
           <p><b>Dirección:</b> ${address}<br/><b>Precio:</b> €${price}</p>
           ${ctaButton(link, 'Abrir dashboard')}
           <p style="font-size:12px;color:#64748b;">Pulsa "Aceptar" en menos de 5 minutos para quedarte la visita.</p>`,
          'es',
        )
      },
      text: (data, locale) => {
        const link = (data?.dashboardUrl as string) || `${APP_URL}/${locale}/doctor/dashboard`
        return locale === 'en'
          ? `New OnCall consultation. Open dashboard: ${link}`
          : `Nueva consulta OnCall. Abre dashboard: ${link}`
      },
    },
    sms: {
      body: (data, locale) => {
        const link = (data?.dashboardUrl as string) || `${APP_URL}/${locale}/doctor/dashboard`
        return locale === 'en'
          ? `OnCall: new consultation. ${link}`
          : `OnCall: nueva consulta. ${link}`
      },
    },
  },

  'patient.booking_confirmed': {
    email: {
      subject: (_, locale) =>
        locale === 'en' ? 'Booking confirmed' : 'Reserva confirmada',
      html: (data, locale) => {
        const link = (data?.trackingUrl as string) || `${APP_URL}/${locale}/patient/dashboard`
        if (locale === 'en') {
          return wrap(
            `<p>Your visit is confirmed. The doctor will contact you shortly.</p>
             ${ctaButton(link, 'Track the visit')}`,
            'en',
          )
        }
        return wrap(
          `<p>Tu visita está confirmada. El médico se pondrá en contacto contigo en breve.</p>
           ${ctaButton(link, 'Seguir la visita')}`,
          'es',
        )
      },
      text: (data, locale) => {
        const link = (data?.trackingUrl as string) || `${APP_URL}/${locale}/patient/dashboard`
        return locale === 'en'
          ? `OnCall booking confirmed. Track: ${link}`
          : `Reserva OnCall confirmada. Seguir: ${link}`
      },
    },
  },

  'admin.doctor_signup': {
    email: {
      subject: (data) => `New doctor signup: ${esc(data?.name) || 'unknown'}`,
      html: (data) => {
        const name = esc(data?.name) || '(no name)'
        const license = esc(data?.licenseNumber) || ''
        const insurance = esc(data?.insuranceCompany) || ''
        const policyNumber = esc(data?.policyNumber) || ''
        const email = esc(data?.email) || ''
        const reviewUrl =
          (data?.reviewUrl as string) || `${APP_URL}/es/admin/verifications`
        return wrap(
          `<p><b>New doctor pending review</b></p>
           <ul>
             <li><b>Name:</b> ${name}</li>
             <li><b>Email:</b> ${email}</li>
             <li><b>License (COMIB):</b> ${license}</li>
             <li><b>Liability insurer:</b> ${insurance} · policy ${policyNumber}</li>
           </ul>
           ${ctaButton(reviewUrl, 'Review documents')}`,
          'es',
        )
      },
      text: (data) => {
        const name = esc(data?.name) || '(no name)'
        const reviewUrl =
          (data?.reviewUrl as string) || `${APP_URL}/es/admin/verifications`
        return `New doctor pending review: ${name}. ${reviewUrl}`
      },
    },
  },
}

export function getTemplate(kind: NotificationKind): NotificationTemplate | undefined {
  return TEMPLATES[kind]
}
