import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch consultations
  const { data: consultations } = await supabase
    .from('consultations')
    .select('*')
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch consent log
  const { data: consents } = await supabase
    .from('consent_log')
    .select('*')
    .eq('user_id', user.id)
    .order('granted_at', { ascending: false })

  const exportData = {
    exported_at: new Date().toISOString(),
    user_id: user.id,
    email: user.email,
    profile: profile || null,
    consultations: consultations || [],
    consent_log: consents || [],
  }

  return NextResponse.json(exportData, {
    headers: {
      'Content-Disposition': `attachment; filename="data-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}
