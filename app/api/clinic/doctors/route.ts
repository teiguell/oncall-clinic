import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

export const dynamic = 'force-dynamic'

/**
 * GET /api/clinic/doctors — Round 15B-4.
 *
 * Lists all doctors associated with the current clinic via the
 * `clinic_doctors` junction. Joins doctor_profiles + profiles for
 * display fields (name, specialty, rating, status).
 *
 * Returns: array of { id, doctorId, fullName, specialty, rating,
 * totalReviews, status, addedAt }
 */
export async function GET() {
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
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  if (!clinic) {
    return NextResponse.json({ error: 'clinic_not_found', code: 'not_found' }, { status: 404 })
  }

  // Two-step query: first the clinic_doctors rows, then the doctor
  // profiles + profile names. RLS allows the clinic owner to read their
  // own clinic_doctors rows + the joined doctor_profiles via the doctor
  // RLS policies (verified docs are public-readable for booking).
  const { data: rows, error } = await supabase
    .from('clinic_doctors')
    .select(`
      id, status, added_at,
      doctor:doctor_profiles!inner(
        id, specialty, rating, total_reviews,
        profile:profiles!inner(full_name, avatar_url)
      )
    `)
    .eq('clinic_id', clinic.id)
    .order('added_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message, code: 'db_error' }, { status: 500 })
  }

  type Row = {
    id: string
    status: string
    added_at: string
    doctor: {
      id: string
      specialty: string
      rating: number | null
      total_reviews: number | null
      profile: { full_name: string | null; avatar_url: string | null } | Array<{ full_name: string | null; avatar_url: string | null }>
    } | Array<{
      id: string
      specialty: string
      rating: number | null
      total_reviews: number | null
      profile: { full_name: string | null; avatar_url: string | null } | Array<{ full_name: string | null; avatar_url: string | null }>
    }>
  }

  const list = ((rows ?? []) as unknown as Row[]).map((r) => {
    const d = Array.isArray(r.doctor) ? r.doctor[0] : r.doctor
    const p = Array.isArray(d?.profile) ? d.profile[0] : d?.profile
    return {
      id: r.id,
      doctorId: d?.id ?? null,
      fullName: p?.full_name ?? '—',
      specialty: d?.specialty ?? '',
      rating: d?.rating ?? null,
      totalReviews: d?.total_reviews ?? null,
      avatarUrl: p?.avatar_url ?? null,
      status: r.status,
      addedAt: r.added_at,
    }
  })

  return NextResponse.json(list)
}
