import { NextResponse, type NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/notifications/email'

/**
 * POST /api/leads/clinic — Round 22-7 (Q4-19).
 *
 * Clinic lead form on /[locale]/clinica. Inserts into `leads` with
 * `type='clinic'` + clinic-specific fields, and notifies tei@.
 *
 * Distinguishes between the lightweight contact form (this endpoint)
 * and the full clinic registration (POST /api/clinic/register, which
 * creates an actual auth user + clinic profile). A clinic that fills
 * the lightweight form is "interested but not ready to register" —
 * we hand-route them via email until the relationship matures.
 */

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const clinic_name = strField(payload.clinic_name, 200)
  const contact_name = strField(payload.contact_name, 120)
  const email = (strField(payload.email, 200) ?? '').toLowerCase()
  const phone = strField(payload.phone, 32)
  const cif = strField(payload.cif, 32) ?? null
  const city = strField(payload.city, 80)
  const doctorsCountRaw = payload.doctors_count
  const doctors_count =
    typeof doctorsCountRaw === 'number' && Number.isFinite(doctorsCountRaw) && doctorsCountRaw >= 0
      ? Math.min(Math.floor(doctorsCountRaw), 10_000)
      : null
  const message = strField(payload.message, 1000) ?? null
  const source_url = strField(payload.source_url, 300) ?? null

  if (!clinic_name) return NextResponse.json({ error: 'Missing clinic_name' }, { status: 400 })
  if (!contact_name) return NextResponse.json({ error: 'Missing contact_name' }, { status: 400 })
  if (!email || !/.+@.+\..+/.test(email))
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  if (!phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 })
  if (!city) return NextResponse.json({ error: 'Missing city' }, { status: 400 })

  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase.from('leads').insert({
      type: 'clinic',
      clinic_name,
      contact_name,
      full_name: contact_name, // mirror so admin tables show a name in the common column
      email,
      phone,
      cif,
      city,
      doctors_count,
      message,
      source_url,
      status: 'new',
    })
    if (error) {
      console.error('[leads/clinic] insert error', { code: error.code, message: error.message })
      return NextResponse.json({ error: 'Could not save lead' }, { status: 500 })
    }

    void sendEmail({
      to: 'tei@oncall.clinic',
      replyTo: email,
      subject: `Nuevo lead clínica — ${clinic_name}`,
      html: renderClinicEmail({
        clinic_name,
        contact_name,
        email,
        phone,
        cif,
        city,
        doctors_count,
        message,
        source_url,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[leads/clinic] unexpected error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function strField(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined
  const trimmed = v.trim()
  if (trimmed.length === 0) return undefined
  return trimmed.slice(0, max)
}

function renderClinicEmail(d: {
  clinic_name: string
  contact_name: string
  email: string
  phone: string
  cif: string | null
  city: string
  doctors_count: number | null
  message: string | null
  source_url: string | null
}): string {
  const rows = [
    ['Clínica', d.clinic_name],
    ['Contacto', d.contact_name],
    ['Email', d.email],
    ['Teléfono', d.phone],
    ['Ciudad', d.city],
    ['CIF', d.cif ?? '—'],
    ['Médicos', d.doctors_count !== null ? String(d.doctors_count) : '—'],
    ['Origen', d.source_url ?? '—'],
  ]
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748B">${k}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`)
    .join('')
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h1 style="font-size:18px;margin:0 0 16px">Nuevo lead clínica</h1>
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
