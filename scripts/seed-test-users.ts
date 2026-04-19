/**
 * OnCall Clinic — Seed test users for E2E manual testing
 *
 * Creates:
 *   - 3 doctors (Martínez, Ruiz, Wilson) distributed across Ibiza
 *   - 1 patient
 *   - 1 completed consultation + review (so dashboards aren't empty)
 *
 * Requires .env.local with real Supabase credentials:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npx tsx scripts/seed-test-users.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not configured in .env.local')
  process.exit(1)
}
if (!serviceRoleKey || serviceRoleKey === 'your_supabase_service_role_key') {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Doctor specs ─────────────────────────────────────────
const DOCTORS = [
  {
    email: 'dr.martinez@test.oncall.clinic',
    password: 'TestDoc2026!',
    name: 'Dr. Carlos Martínez García',
    phone: '+34 600 111 222',
    profile: {
      license_number: 'ESP-28-12345',
      specialty: 'general_medicine',
      verification_status: 'verified',
      is_available: true,
      current_lat: 38.9067, // Ibiza ciudad
      current_lng: 1.4206,
      stripe_account_id: 'acct_test_martinez',
      stripe_onboarded: true,
      activated_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(), // 2 months ago
      price_adjustment: 0.00,
      languages: ['es', 'en'],
      years_experience: 12,
      rc_insurance_company: 'AXA Seguros',
      rc_insurance_expiry_date: '2027-06-30',
      contract_accepted_at: new Date().toISOString(),
      contract_version: '1.0',
    },
  },
  {
    email: 'dra.ruiz@test.oncall.clinic',
    password: 'TestDoc2026!',
    name: 'Dra. Elena Ruiz López',
    phone: '+34 600 333 444',
    profile: {
      license_number: 'ESP-07-67890',
      specialty: 'general_medicine',
      verification_status: 'verified',
      is_available: true,
      current_lat: 38.9836, // Santa Eulalia
      current_lng: 1.5328,
      stripe_account_id: 'acct_test_ruiz',
      stripe_onboarded: true,
      activated_at: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(), // 6 months ago
      price_adjustment: -0.10,
      languages: ['es', 'en', 'de'],
      years_experience: 8,
      rc_insurance_company: 'Zurich Insurance',
      rc_insurance_expiry_date: '2027-09-15',
      contract_accepted_at: new Date().toISOString(),
      contract_version: '1.0',
    },
  },
  {
    email: 'dr.wilson@test.oncall.clinic',
    password: 'TestDoc2026!',
    name: 'Dr. James Wilson',
    phone: '+34 600 555 666',
    profile: {
      license_number: 'UK-GMC-7654321',
      specialty: 'general_medicine',
      verification_status: 'verified',
      is_available: true,
      current_lat: 38.9806, // San Antonio
      current_lng: 1.3006,
      stripe_account_id: 'acct_test_wilson',
      stripe_onboarded: true,
      activated_at: new Date(Date.now() - 425 * 24 * 3600 * 1000).toISOString(), // 14 months ago (past promo)
      price_adjustment: 0.15,
      languages: ['en', 'es'],
      years_experience: 15,
      rc_insurance_company: 'Medical Protection Society',
      rc_insurance_expiry_date: '2027-12-01',
      contract_accepted_at: new Date().toISOString(),
      contract_version: '1.0',
    },
  },
]

const PATIENT = {
  email: 'paciente@test.oncall.clinic',
  password: 'TestPat2026!',
  name: 'Test Patient',
  phone: '+34 600 777 888',
}

// ─── Create user + profile ────────────────────────────────
async function createUser(email: string, password: string, fullName: string, phone: string, role: 'patient' | 'doctor') {
  // Try to find existing
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const existing = users.find(u => u.email === email)
  if (existing) {
    await supabase.from('profiles').upsert({
      id: existing.id,
      email, full_name: fullName, phone, role,
    }, { onConflict: 'id' })
    return existing.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })
  if (error || !data.user) throw new Error(`Failed ${email}: ${error?.message}`)

  await supabase.from('profiles').upsert({
    id: data.user.id,
    email, full_name: fullName, phone, role,
  }, { onConflict: 'id' })

  return data.user.id
}

// ═══════════════════════════════════════════════════════════
async function main() {
  console.log('🌱 Seeding test users for E2E testing...\n')

  // Doctors
  const doctorProfileIds: string[] = []
  for (const doc of DOCTORS) {
    console.log(`  → ${doc.email}`)
    const userId = await createUser(doc.email, doc.password, doc.name, doc.phone, 'doctor')
    const { error } = await supabase.from('doctor_profiles').upsert({
      user_id: userId,
      ...doc.profile,
    }, { onConflict: 'user_id' })
    if (error) console.error(`    ❌ doctor_profile: ${error.message}`)
    else {
      const { data } = await supabase.from('doctor_profiles').select('id').eq('user_id', userId).single()
      if (data) doctorProfileIds.push(data.id)
    }
  }

  // Patient
  console.log(`\n  → ${PATIENT.email}`)
  const patientId = await createUser(PATIENT.email, PATIENT.password, PATIENT.name, PATIENT.phone, 'patient')
  await supabase.from('consent_log').insert([
    { user_id: patientId, consent_type: 'health_data_processing', granted: true, ip_address: '127.0.0.1' },
    { user_id: patientId, consent_type: 'geolocation_tracking',   granted: true, ip_address: '127.0.0.1' },
  ])

  // Seed consultation (completed) + review so dashboards aren't empty
  if (doctorProfileIds[0]) {
    console.log('\n  → Seeding 1 completed consultation + review')
    const { data: consult } = await supabase.from('consultations').insert({
      patient_id: patientId,
      doctor_id: doctorProfileIds[0],
      type: 'scheduled',
      status: 'completed',
      service_type: 'general_medicine',
      symptoms: 'Dolor de garganta y fiebre leve desde ayer',
      address: 'Hotel Ocean Drive, Paseo Marítimo, Ibiza',
      lat: 38.9067, lng: 1.4306,
      price: 15000, commission: 1500, doctor_amount: 13500,
      payout_status: 'completed',
      payment_status: 'paid',
      stripe_session_id: `test_session_seed_${Date.now()}`,
      stripe_payment_intent_id: `test_pi_seed_${Date.now()}`,
      accepted_at:  new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      started_at:   new Date(Date.now() - 2 * 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 90 * 60 * 1000).toISOString(),
    }).select().single()

    if (consult) {
      await supabase.from('consultation_reviews').insert({
        consultation_id: consult.id,
        patient_id: patientId,
        doctor_id: doctorProfileIds[0],
        rating: 5,
        comment: 'Excelente atención. El doctor fue muy profesional y puntual.',
        is_public: true,
      })
    }
  }

  console.log('\n✅ Seed complete!\n')
  console.log('=== CREDENCIALES TEST ===')
  console.log(`Paciente: ${PATIENT.email} / ${PATIENT.password}`)
  for (const d of DOCTORS) {
    console.log(`${d.name.split(' ').slice(0, 2).join(' ')}: ${d.email} / ${d.password}`)
  }
  console.log('========================\n')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
