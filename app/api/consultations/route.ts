import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const limit = parseInt(url.searchParams.get('limit') || '20')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  let query = supabase.from('consultations').select(`
    *,
    profiles!patient_id(id, full_name, avatar_url, phone),
    doctor_profiles(id, specialty, rating, profiles(id, full_name, avatar_url, phone))
  `)

  if (profile?.role === 'patient') {
    query = query.eq('patient_id', user.id)
  } else if (profile?.role === 'doctor') {
    const { data: doctorProfile } = await supabase
      .from('doctor_profiles').select('id').eq('user_id', user.id).single()
    if (doctorProfile) query = query.eq('doctor_id', doctorProfile.id)
  }

  if (status) query = query.eq('status', status)

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const { id, status, ...updates } = body

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const statusTimestamps: Record<string, string> = {
    accepted: 'accepted_at',
    in_progress: 'started_at',
    completed: 'completed_at',
    cancelled: 'cancelled_at',
  }

  const updateData: Record<string, unknown> = { ...updates }
  if (status) {
    updateData.status = status
    const tsField = statusTimestamps[status]
    if (tsField) updateData[tsField] = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('consultations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Trigger same-day payout when completed
  if (status === 'completed') {
    fetch('/api/stripe/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultationId: id }),
    }).catch(console.error)
  }

  return NextResponse.json({ data })
}
