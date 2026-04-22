import { createClient } from '@supabase/supabase-js'

/**
 * E2E seed helpers.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY — MUST only be called from test code,
 * never bundled into client code.
 *
 * The test consultation is addressable via `TEST_CONSULTATION_ID` env
 * so the test can force-set its status (e.g. to 'completed' to trigger
 * the review flow) without waiting for Stripe webhooks or Supabase
 * Realtime in a deterministic way.
 */
export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !key) {
    throw new Error('SUPABASE env missing — set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function forceConsultationStatus(id: string, status: string) {
  const client = adminClient()
  const { error } = await client
    .from('consultations')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', id)
  if (error) throw error
}

export async function cleanupTestConsent(userId: string) {
  const client = adminClient()
  await client.from('user_consents').delete().eq('user_id', userId)
}
