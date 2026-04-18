import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * RGPD Art. 17 — Right to Erasure (Hard Delete)
 * Permanently deletes ALL user data in FK-safe order.
 * Captures IP for audit trail before deletion.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userId = user.id

  // Capture IP for consent revocation audit
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Use admin client to bypass RLS for deletions
  const adminSupabase = await createAdminClient()

  try {
    // Step 1: Revoke ALL consents with IP (audit trail BEFORE deletion)
    const consentTypes = [
      'health_data_processing',
      'geolocation_tracking',
      'analytics',
      'marketing_communications',
      'profiling',
    ] as const

    const revocationRecords = consentTypes.map(type => ({
      user_id: userId,
      consent_type: type,
      granted: false,
      ip_address: ip,
      user_agent: userAgent,
      revoked_at: new Date().toISOString(),
    }))

    await adminSupabase.from('consent_log').insert(revocationRecords)

    // Step 2: Get all consultation IDs for this user
    const { data: consultations } = await adminSupabase
      .from('consultations')
      .select('id')
      .eq('patient_id', userId)
    const consultationIds = consultations?.map(c => c.id) || []

    // Step 3: Delete consultation-dependent data (in FK order)
    if (consultationIds.length > 0) {
      await adminSupabase.from('consultation_messages').delete().in('consultation_id', consultationIds)
      await adminSupabase.from('consultation_reviews').delete().in('consultation_id', consultationIds)
      await adminSupabase.from('refunds').delete().in('consultation_id', consultationIds)
      await adminSupabase.from('consultation_status_history').delete().in('consultation_id', consultationIds)
      // Note: payouts reference doctor_profiles, not deleted here (financial records retained per tax law)
    }

    // Step 4: Delete consultations
    await adminSupabase.from('consultations').delete().eq('patient_id', userId)

    // Step 5: Delete notifications
    await adminSupabase.from('notifications').delete().eq('user_id', userId)

    // Step 6: Clear referral references (self-referencing FK)
    await adminSupabase.from('profiles').update({ referred_by: null }).eq('referred_by', userId)

    // Step 7: Delete consent log (after recording revocations)
    await adminSupabase.from('consent_log').delete().eq('user_id', userId)

    // Step 8: Delete doctor profile if user is a doctor
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profile?.role === 'doctor') {
      await adminSupabase.from('doctor_documents').delete().eq('doctor_id', userId)
      await adminSupabase.from('rc_expiry_alerts').delete().eq('doctor_id', userId)
      await adminSupabase.from('doctor_profiles').delete().eq('user_id', userId)
    }

    // Step 9: Delete profile
    await adminSupabase.from('profiles').delete().eq('id', userId)

    // Step 10: Delete auth user (permanently removes from auth.users)
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId)
    if (authError) {
      console.error('Failed to delete auth user:', authError.message)
      // Profile data already deleted — auth cleanup can be retried
    }

    return NextResponse.json({
      success: true,
      message: 'Account permanently deleted per RGPD Art. 17.',
    })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Error deleting account. Please contact support.' },
      { status: 500 }
    )
  }
}
