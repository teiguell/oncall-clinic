import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

export const dynamic = 'force-dynamic'

/**
 * GET /api/clinic/consultations — Round 15B-4.
 *
 * Lists consultations served by doctors of the current clinic.
 * Filters via query params: ?from=YYYY-MM-DD&to=YYYY-MM-DD&doctorId=<uuid>&status=<state>
 *
 * Each row returns: id, created_at, doctor (full_name + id), patient
 * (initials only — privacy), zone (city), price (cents), commission
 * (cents — computed at booking time), net_clinic (cents).
 *
 * R7 compliance: patient name reduced to initials. No clinical data.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = user?.id ?? (bypass && AUTH_BYPASS_ROLE === 'clinic' ? bypass.id : null)
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
  }

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id, commission_rate')
    .eq('user_id', userId)
    .maybeSingle()
  if (!clinic) {
    return NextResponse.json({ error: 'clinic_not_found', code: 'not_found' }, { status: 404 })
  }

  const url = new URL(request.url)
  const from = url.searchParams.get('from') // YYYY-MM-DD
  const to = url.searchParams.get('to')
  const doctorId = url.searchParams.get('doctorId')
  const status = url.searchParams.get('status')

  let query = supabase
    .from('consultations')
    .select(`
      id, created_at, status, price, commission, doctor_amount, city, address,
      doctor:doctor_profiles!inner(id, profile:profiles!inner(full_name)),
      patient:profiles!consultations_patient_id_fkey(full_name)
    `)
    .eq('clinic_id', clinic.id)
    .order('created_at', { ascending: false })
    .limit(200)

  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)
  if (doctorId) query = query.eq('doctor_id', doctorId)
  if (status) query = query.eq('status', status)

  const { data: rows, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message, code: 'db_error' }, { status: 500 })
  }

  type Row = {
    id: string
    created_at: string
    status: string
    price: number | null
    commission: number | null
    doctor_amount: number | null
    city: string | null
    address: string | null
    doctor: { id: string; profile: { full_name: string | null } | Array<{ full_name: string | null }> } | Array<{ id: string; profile: { full_name: string | null } | Array<{ full_name: string | null }> }>
    patient: { full_name: string | null } | Array<{ full_name: string | null }> | null
  }

  const initials = (name: string | null | undefined): string => {
    if (!name) return '—'
    return name.split(' ').slice(0, 2).map((s) => s[0]?.toUpperCase() ?? '').join('') || '—'
  }

  const list = ((rows ?? []) as unknown as Row[]).map((r) => {
    const d = Array.isArray(r.doctor) ? r.doctor[0] : r.doctor
    const dProfile = Array.isArray(d?.profile) ? d.profile[0] : d?.profile
    const patient = Array.isArray(r.patient) ? r.patient[0] : r.patient
    // Net to clinic = price - commission (the platform's cut).
    const netClinic = (r.price ?? 0) - (r.commission ?? 0)
    return {
      id: r.id,
      createdAt: r.created_at,
      status: r.status,
      doctorId: d?.id ?? null,
      doctorName: dProfile?.full_name ?? '—',
      patientInitials: initials(patient?.full_name ?? null),
      zone: r.city ?? null,
      priceCents: r.price ?? 0,
      commissionCents: r.commission ?? 0,
      netClinicCents: netClinic,
    }
  })

  return NextResponse.json(list)
}
