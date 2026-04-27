import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/clinic/doctors/[id] — Round 15B-4.
 *
 * "Disassociate" a doctor from the clinic by flipping the
 * `clinic_doctors` row status to 'inactive'. We don't physically delete
 * the row (preserves audit history + lets the clinic re-activate the
 * association without losing the original add_at).
 *
 * `[id]` is the `clinic_doctors.id` (the junction row), NOT the
 * doctor_id. The clinic owner must own the parent clinic.
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

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

  // Verify the link belongs to this clinic before flipping (RLS would
  // also enforce this, but we want a clean 404 vs RLS-silent-zero-rows).
  const { data: link } = await supabase
    .from('clinic_doctors')
    .select('id, status')
    .eq('id', id)
    .eq('clinic_id', clinic.id)
    .maybeSingle()
  if (!link) {
    return NextResponse.json({ error: 'link_not_found', code: 'not_found' }, { status: 404 })
  }
  if (link.status === 'inactive') {
    return NextResponse.json({ ok: true, alreadyInactive: true })
  }

  const { error } = await supabase
    .from('clinic_doctors')
    .update({ status: 'inactive' })
    .eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message, code: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
