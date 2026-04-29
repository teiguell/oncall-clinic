import { NextResponse, type NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/notifications/email'

/**
 * POST /api/leads/pro — Round 22-7 (Q4-19).
 *
 * Doctor lead form on /[locale]/pro. Inserts into `leads` with
 * `type='doctor'` and fires a notification email to tei@oncall.clinic
 * so we can hand-route the lead while the volume is still small.
 *
 * Validation:
 *   - email + phone + full_name + specialty are required.
 *   - All other fields are optional, capped to a sensible length so a
 *     fat-fingered submission can't poison the table.
 *
 * Email failure is non-fatal: if Resend is unconfigured or down we
 * still return ok (the lead is in the DB and the admin will see it
 * on the next dashboard load).
 */

const ALLOWED_SPECIALTIES = new Set([
  'general',
  'pediatrics',
  'gynecology',
  'other',
])

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const full_name = strField(payload.full_name, 120)
  const email = (strField(payload.email, 200) ?? '').toLowerCase()
  const phone = strField(payload.phone, 32)
  const specialty = strField(payload.specialty, 32)
  const comib_number = strField(payload.comib_number, 32) ?? null
  const message = strField(payload.message, 1000) ?? null
  const source_url = strField(payload.source_url, 300) ?? null

  if (!full_name) return NextResponse.json({ error: 'Missing full_name' }, { status: 400 })
  if (!email || !/.+@.+\..+/.test(email))
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  if (!phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 })
  if (!specialty || !ALLOWED_SPECIALTIES.has(specialty))
    return NextResponse.json({ error: 'Invalid specialty' }, { status: 400 })

  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase.from('leads').insert({
      type: 'doctor',
      full_name,
      email,
      phone,
      specialty,
      comib_number,
      message,
      source_url,
      status: 'new',
    })
    if (error) {
      console.error('[leads/pro] insert error', { code: error.code, message: error.message })
      return NextResponse.json({ error: 'Could not save lead' }, { status: 500 })
    }

    // Notify the admin inbox. Best-effort.
    void sendEmail({
      to: 'tei@oncall.clinic',
      replyTo: email,
      subject: `Nuevo lead médico — ${full_name}`,
      html: renderDoctorEmail({ full_name, email, phone, specialty, comib_number, message, source_url }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[leads/pro] unexpected error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function strField(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined
  const trimmed = v.trim()
  if (trimmed.length === 0) return undefined
  return trimmed.slice(0, max)
}

function renderDoctorEmail(d: {
  full_name: string
  email: string
  phone: string
  specialty: string
  comib_number: string | null
  message: string | null
  source_url: string | null
}): string {
  const rows = [
    ['Nombre', d.full_name],
    ['Email', d.email],
    ['Teléfono', d.phone],
    ['Especialidad', d.specialty],
    ['COMIB', d.comib_number ?? '—'],
    ['Origen', d.source_url ?? '—'],
  ]
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748B">${k}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`)
    .join('')
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h1 style="font-size:18px;margin:0 0 16px">Nuevo lead médico</h1>
      <table style="font-size:14px;border-collapse:collapse">${rows}</table>
      ${d.message ? `<div style="margin-top:18px;padding:14px;background:#F8FAFC;border-radius:8px"><div style="color:#64748B;font-size:12px;margin-bottom:6px">Mensaje</div><div style="font-size:14px;white-space:pre-wrap">${escapeHtml(d.message)}</div></div>` : ''}
    </div>
  `
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
