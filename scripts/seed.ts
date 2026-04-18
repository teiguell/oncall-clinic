/**
 * OnCall Clinic — Seed Script
 * Creates realistic test data for Ibiza-based medical marketplace.
 * Run: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { randomUUID } from 'crypto'

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

const PASSWORD = 'Test1234!'

// ─── Helpers ──────────────────────────────────────────────
function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString()
}
function daysAgo(d: number) {
  return new Date(Date.now() - d * 86400_000).toISOString()
}

const counts: Record<string, number> = {}
function track(table: string, n = 1) { counts[table] = (counts[table] || 0) + n }

// ─── Create auth user + profile ───────────────────────────
async function createUser(email: string, fullName: string, phone: string, role: 'patient' | 'doctor' | 'admin'): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (error) {
    if (error.message.includes('already') || error.message.includes('exists')) {
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const existing = users.find((u: { email?: string }) => u.email === email)
      if (existing) {
        console.log(`  ↳ ${email} already exists, reusing`)
        await supabase.from('profiles').upsert({ id: existing.id, email, full_name: fullName, phone, role }, { onConflict: 'id' })
        return existing.id
      }
    }
    throw new Error(`Failed to create ${email}: ${error.message}`)
  }

  const userId = data.user.id
  await supabase.from('profiles').upsert({ id: userId, email, full_name: fullName, phone, role }, { onConflict: 'id' })
  track('auth.users')
  track('profiles')
  return userId
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log('🌱 OnCall Clinic — Seeding database...\n')

  // ─── 1. PATIENTS ────────────────────────────────────────
  console.log('👤 Creating patients...')
  const patientIds: string[] = []
  const patients = [
    { email: 'james.mitchell@test.com', name: 'James Mitchell', phone: '+44 7700 900001' },
    { email: 'anna.mueller@test.com', name: 'Anna Müller', phone: '+49 170 1234567' },
    { email: 'sophie.vdb@test.com', name: 'Sophie van der Berg', phone: '+31 6 12345678' },
    { email: 'maria.garcia@test.com', name: 'María García López', phone: '+34 600 123 456' },
    { email: 'pierre.dubois@test.com', name: 'Pierre Dubois', phone: '+33 6 12 34 56 78' },
  ]
  for (const p of patients) {
    patientIds.push(await createUser(p.email, p.name, p.phone, 'patient'))
  }

  // ─── 2. DOCTORS ─────────────────────────────────────────
  console.log('🩺 Creating doctors...')
  const doctorUserIds: string[] = []
  const doctors = [
    { email: 'dr.carlos.ruiz@test.com', name: 'Carlos Ruiz Martínez', phone: '+34 611 000 001' },
    { email: 'dr.elena.fernandez@test.com', name: 'Elena Fernández Torres', phone: '+34 611 000 002' },
    { email: 'dr.miguel.costa@test.com', name: 'Miguel Ángel Costa', phone: '+34 611 000 003' },
    { email: 'dra.laura.sanchez@test.com', name: 'Laura Sánchez Vidal', phone: '+34 611 000 004' },
    { email: 'dr.pablo.mari@test.com', name: 'Pablo Marí Ribas', phone: '+34 611 000 005' },
  ]
  for (const d of doctors) {
    doctorUserIds.push(await createUser(d.email, d.name, d.phone, 'doctor'))
  }

  // ─── 3. ADMIN ───────────────────────────────────────────
  console.log('⚙️  Creating admin...')
  const adminId = await createUser('teiguell.med@gmail.com', 'Tei', '+34 600 000 000', 'admin')

  // ─── 4. DOCTOR PROFILES ─────────────────────────────────
  console.log('📋 Creating doctor profiles...')
  const doctorProfileIds: string[] = []
  const doctorProfileData = [
    {
      user_id: doctorUserIds[0], license_number: '282800001', specialty: 'general_medicine',
      bio: 'Medicina general con 15 años de experiencia en urgencias domiciliarias en Ibiza.',
      city: 'Ibiza', rating: 4.8, total_reviews: 42,
      comib_license_number: '07/12345', languages: ['es', 'en'], years_experience: 15,
      current_lat: 38.9087, current_lng: 1.4304,
    },
    {
      user_id: doctorUserIds[1], license_number: '282800002', specialty: 'general_medicine',
      bio: 'Especialista en medicina interna y atención turística. Hablo español, inglés y alemán.',
      city: 'Ibiza', rating: 4.9, total_reviews: 67,
      comib_license_number: '07/12346', languages: ['es', 'en', 'de'], years_experience: 12,
      current_lat: 38.9120, current_lng: 1.4520,
    },
    {
      user_id: doctorUserIds[2], license_number: '282800003', specialty: 'general_medicine',
      bio: 'Médico de familia con amplia experiencia en urgencias nocturnas y pediatría.',
      city: 'Ibiza', rating: 4.5, total_reviews: 23,
      comib_license_number: '07/12347', languages: ['es', 'en'], years_experience: 8,
      current_lat: 38.9800, current_lng: 1.3010,
    },
    {
      user_id: doctorUserIds[3], license_number: '282800004', specialty: 'general_medicine',
      bio: 'Médica general con formación en medicina del viajero y patología tropical.',
      city: 'Ibiza', rating: 4.7, total_reviews: 35,
      comib_license_number: '07/12348', languages: ['es', 'en', 'fr'], years_experience: 10,
      current_lat: 38.8833, current_lng: 1.4028,
    },
    {
      user_id: doctorUserIds[4], license_number: '282800005', specialty: 'general_medicine',
      bio: 'Ibicenco de nacimiento. 20 años atendiendo pacientes locales y turistas.',
      city: 'Ibiza', rating: 4.6, total_reviews: 51,
      comib_license_number: '07/12349', languages: ['es', 'en', 'ca'], years_experience: 20,
      current_lat: 38.9840, current_lng: 1.5330,
    },
  ]

  for (const dp of doctorProfileData) {
    const id = randomUUID()
    const { error } = await supabase.from('doctor_profiles').upsert({
      id,
      ...dp,
      verification_status: 'verified',
      is_available: true,
      commission_rate: 0.15,
      stripe_account_id: `acct_test_${dp.comib_license_number.replace('/', '')}`,
      stripe_onboarded: true,
      rc_insurance_company: 'AXA Seguros',
      rc_insurance_policy_number: `RC-IBZ-${dp.comib_license_number.replace('/', '')}`,
      rc_insurance_coverage_amount: 1500000,
      rc_insurance_expiry_date: '2027-01-15',
      reta_registration_number: `RETA-${dp.comib_license_number.replace('/', '')}`,
      comib_verified: true,
      contract_accepted_at: daysAgo(90),
      contract_version: 'v1.0',
      payout_speed: 'instant',
    }, { onConflict: 'user_id' })
    if (error) console.error(`  ❌ doctor_profile: ${error.message}`)
    else doctorProfileIds.push(id)
    track('doctor_profiles')
  }

  // If upsert returned existing, fetch actual IDs
  if (doctorProfileIds.length < 5) {
    const { data: profiles } = await supabase.from('doctor_profiles').select('id, user_id')
    if (profiles) {
      for (const uid of doctorUserIds) {
        const found = profiles.find((p: { user_id: string }) => p.user_id === uid)
        if (found && !doctorProfileIds.includes(found.id)) doctorProfileIds.push(found.id)
      }
    }
  }

  // ─── 5. CONSULTATIONS ──────────────────────────────────
  console.log('📝 Creating consultations...')

  const locations = [
    { address: 'Hotel Ushuaïa, Playa d\'en Bossa', lat: 38.8833, lng: 1.4028 },
    { address: 'Hotel Nobu, Talamanca', lat: 38.9087, lng: 1.4304 },
    { address: 'Marina Botafoch 23', lat: 38.9120, lng: 1.4520 },
    { address: 'Playa d\'en Bossa Beach Club', lat: 38.8750, lng: 1.3980 },
    { address: 'Cala Conta Beach Villa', lat: 38.9600, lng: 1.2200 },
    { address: 'Hotel Cubanito, Sant Antoni', lat: 38.9800, lng: 1.3010 },
    { address: 'Aguas de Ibiza, Santa Eulària', lat: 38.9840, lng: 1.5330 },
    { address: 'Boutique Hostal Dalt Vila', lat: 38.9067, lng: 1.4360 },
    { address: 'Invisa Hotel Es Canar', lat: 39.0000, lng: 1.5700 },
    { address: 'Six Senses Portinatx', lat: 39.1100, lng: 1.5250 },
  ]

  const symptoms = [
    'Severe sunburn with blistering on shoulders and back. Applied aftersun but pain persists.',
    'Acute gastroenteritis since last night. Vomiting and diarrhoea. Unable to keep fluids down.',
    'Ear infection — severe pain in right ear, possible swimmer\'s ear. Started 2 days ago.',
    'Allergic reaction to insect bite. Swelling on left arm, mild rash spreading.',
    'Multiple insect bites (mosquitos). Intense itching, some swelling. Child 4 years old.',
    'Dehydration after day at beach. Dizziness, headache, dark urine.',
    'Minor laceration on foot from sea urchin. Bleeding stopped but area looks inflamed.',
    'Suspected UTI — burning sensation, frequent urination since yesterday.',
    'Severe anxiety / panic attack. Heart racing, difficulty breathing. History of anxiety disorder.',
    'Food poisoning from restaurant. Abdominal cramps, nausea, fever 38.5°C.',
  ]

  const consultationIds: string[] = []

  // 5 completed
  for (let i = 0; i < 5; i++) {
    const id = randomUUID()
    const loc = locations[i]
    const price = i < 3 ? 15000 : 20000 // €150 or €200
    const commission = Math.round(price * 0.15)
    const { error } = await supabase.from('consultations').insert({
      id,
      patient_id: patientIds[i % 5],
      doctor_id: doctorProfileIds[i % 5],
      type: 'urgent',
      status: 'completed',
      service_type: 'general_medicine',
      symptoms: symptoms[i],
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
      price,
      commission,
      doctor_amount: price - commission,
      payout_status: 'completed',
      stripe_payment_intent_id: `pi_test_completed_${i}`,
      accepted_at: hoursAgo(72 + i * 24),
      started_at: hoursAgo(71 + i * 24),
      completed_at: hoursAgo(70 + i * 24),
      created_at: hoursAgo(73 + i * 24),
    })
    if (error) console.error(`  ❌ consultation completed ${i}: ${error.message}`)
    else { consultationIds.push(id); track('consultations') }
  }

  // 5 accepted (doctor assigned, en camino)
  for (let i = 0; i < 5; i++) {
    const id = randomUUID()
    const loc = locations[5 + (i % 5)]
    const { error } = await supabase.from('consultations').insert({
      id,
      patient_id: patientIds[i % 5],
      doctor_id: doctorProfileIds[(i + 1) % 5],
      type: 'urgent',
      status: 'accepted',
      service_type: 'general_medicine',
      symptoms: symptoms[5 + (i % 5)],
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
      price: 15000,
      commission: 2250,
      doctor_amount: 12750,
      payout_status: 'pending',
      stripe_payment_intent_id: `pi_test_accepted_${i}`,
      accepted_at: hoursAgo(1),
      created_at: hoursAgo(2),
    })
    if (error) console.error(`  ❌ consultation accepted ${i}: ${error.message}`)
    else { consultationIds.push(id); track('consultations') }
  }

  // 3 pending
  for (let i = 0; i < 3; i++) {
    const id = randomUUID()
    const loc = locations[i + 2]
    const { error } = await supabase.from('consultations').insert({
      id,
      patient_id: patientIds[(i + 2) % 5],
      type: 'urgent',
      status: 'pending',
      service_type: 'general_medicine',
      symptoms: symptoms[(i + 3) % 10],
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
      price: 15000,
      commission: 2250,
      doctor_amount: 12750,
      created_at: hoursAgo(0.5),
    })
    if (error) console.error(`  ❌ consultation pending ${i}: ${error.message}`)
    else { consultationIds.push(id); track('consultations') }
  }

  // 3 cancelled (>24h, 100% refund)
  for (let i = 0; i < 3; i++) {
    const id = randomUUID()
    const loc = locations[i + 7]
    const { error } = await supabase.from('consultations').insert({
      id,
      patient_id: patientIds[i % 5],
      type: 'scheduled',
      status: 'cancelled',
      service_type: 'general_medicine',
      symptoms: symptoms[i],
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
      price: 15000,
      cancellation_reason: 'Patient cancelled — feeling better',
      cancelled_at: daysAgo(5 + i),
      created_at: daysAgo(8 + i),
    })
    if (error) console.error(`  ❌ consultation cancelled24 ${i}: ${error.message}`)
    else { consultationIds.push(id); track('consultations') }
  }

  // 2 cancelled (<2h, 0% refund)
  for (let i = 0; i < 2; i++) {
    const id = randomUUID()
    const loc = locations[i + 3]
    const { error } = await supabase.from('consultations').insert({
      id,
      patient_id: patientIds[(i + 3) % 5],
      type: 'urgent',
      status: 'cancelled',
      service_type: 'general_medicine',
      symptoms: symptoms[i + 5],
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
      price: 20000,
      cancellation_reason: 'Late cancellation — no refund',
      cancelled_at: hoursAgo(48 + i * 24),
      created_at: hoursAgo(49 + i * 24),
    })
    if (error) console.error(`  ❌ consultation cancelled2h ${i}: ${error.message}`)
    else { consultationIds.push(id); track('consultations') }
  }

  // 2 in_progress
  for (let i = 0; i < 2; i++) {
    const id = randomUUID()
    const loc = locations[i]
    const { error } = await supabase.from('consultations').insert({
      id,
      patient_id: patientIds[i],
      doctor_id: doctorProfileIds[i],
      type: 'urgent',
      status: 'in_progress',
      service_type: 'general_medicine',
      symptoms: symptoms[i + 7],
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
      price: 15000,
      commission: 2250,
      doctor_amount: 12750,
      payout_status: 'pending',
      stripe_payment_intent_id: `pi_test_inprogress_${i}`,
      accepted_at: hoursAgo(1),
      started_at: hoursAgo(0.5),
      created_at: hoursAgo(1.5),
    })
    if (error) console.error(`  ❌ consultation in_progress ${i}: ${error.message}`)
    else { consultationIds.push(id); track('consultations') }
  }

  console.log(`  ✅ ${consultationIds.length} consultations created`)

  // ─── 6. PAYOUTS (for completed consultations) ──────────
  console.log('💰 Creating payouts...')
  for (let i = 0; i < 5; i++) {
    const amount = i < 3 ? 12750 : 17000
    const { error } = await supabase.from('payouts').insert({
      doctor_id: doctorProfileIds[i % 5],
      consultation_id: consultationIds[i],
      amount,
      status: 'completed',
      stripe_transfer_id: `tr_test_${i}`,
    })
    if (error) console.error(`  ❌ payout ${i}: ${error.message}`)
    else track('payouts')
  }

  // ─── 7. REFUNDS (for cancelled >24h) ──────────────────
  console.log('💸 Creating refunds...')
  for (let i = 0; i < 2; i++) {
    const cancelledIdx = 13 + i // indices 13-15 are cancelled >24h
    if (consultationIds[cancelledIdx]) {
      const { error } = await supabase.from('refunds').insert({
        consultation_id: consultationIds[cancelledIdx],
        amount: 150.00,
        reason: 'Cancellation >24h — full refund',
        stripe_refund_id: `re_test_${i}`,
        status: 'completed',
        requested_by: patientIds[i % 5],
      })
      if (error) console.error(`  ❌ refund ${i}: ${error.message}`)
      else track('refunds')
    }
  }

  // ─── 8. REVIEWS (for completed consultations) ──────────
  console.log('⭐ Creating reviews...')
  const reviews = [
    { rating: 5, comment: 'Dr. Ruiz was absolutely fantastic. Arrived in 20 minutes at our hotel. Very professional and spoke excellent English. Highly recommend!' },
    { rating: 5, comment: 'Elena was so kind and thorough. She explained everything clearly and prescribed the right medication. Feeling much better now.' },
    { rating: 4, comment: 'Good service overall. Doctor arrived quickly and was competent. Only minor issue was finding the villa entrance.' },
    { rating: 5, comment: 'Lifesaver! My daughter had a terrible allergic reaction at 1am and Dr. Sánchez was there within 25 minutes. Amazing service.' },
    { rating: 4, comment: 'Very professional service. Pablo was friendly and efficient. Would use again if needed during our holiday.' },
  ]
  for (let i = 0; i < 5; i++) {
    const { error } = await supabase.from('consultation_reviews').insert({
      consultation_id: consultationIds[i],
      patient_id: patientIds[i % 5],
      doctor_id: doctorProfileIds[i % 5],
      rating: reviews[i].rating,
      comment: reviews[i].comment,
      is_public: true,
    })
    if (error) console.error(`  ❌ review ${i}: ${error.message}`)
    else track('consultation_reviews')
  }

  // Also update consultation rating field
  for (let i = 0; i < 5; i++) {
    await supabase.from('consultations').update({
      rating: reviews[i].rating,
      review: reviews[i].comment,
    }).eq('id', consultationIds[i])
  }

  // ─── 9. CHAT MESSAGES (post-consultation follow-up) ────
  console.log('💬 Creating chat messages...')
  // 3 conversations using first 3 completed consultations (indices 0-2)
  const chatMessages = [
    // Conversation 1: patient 0 + doctor 0 (4 messages)
    { consultation_id: consultationIds[0], sender_id: patientIds[0], sender_role: 'patient', content: 'Hi Dr. Ruiz, the antihistamine is helping with the sunburn but I still have some blistering. Is that normal?' },
    { consultation_id: consultationIds[0], sender_id: doctorUserIds[0], sender_role: 'doctor', content: 'Yes, blistering can persist for a few days. Keep applying the aloe vera gel and stay out of direct sun. If you notice any signs of infection (pus, increasing redness, fever), call us immediately.' },
    { consultation_id: consultationIds[0], sender_id: patientIds[0], sender_role: 'patient', content: 'Thank you! Will the blisters scar?' },
    { consultation_id: consultationIds[0], sender_id: doctorUserIds[0], sender_role: 'doctor', content: 'Most sunburn blisters heal without scarring if you avoid popping them and keep the area clean and moisturised. Give it 7-10 days.' },
    // Conversation 2: patient 1 + doctor 1 (3 messages)
    { consultation_id: consultationIds[1], sender_id: patientIds[1], sender_role: 'patient', content: 'Hallo Dr. Fernández, die Übelkeit ist besser. Darf ich jetzt wieder normal essen?' },
    { consultation_id: consultationIds[1], sender_id: doctorUserIds[1], sender_role: 'doctor', content: 'Glad to hear that! Start with bland foods — rice, toast, bananas. Avoid dairy, alcohol and spicy food for at least 48 more hours. Keep hydrating with small sips.' },
    { consultation_id: consultationIds[1], sender_id: patientIds[1], sender_role: 'patient', content: 'Perfect, danke! I will follow your advice. Can I go to the pool tomorrow?' },
    // Conversation 3: patient 2 + doctor 2 (2 messages)
    { consultation_id: consultationIds[2], sender_id: patientIds[2], sender_role: 'patient', content: 'Hi doctor, the ear drops are working but my hearing still feels muffled. Should I be worried?' },
    { consultation_id: consultationIds[2], sender_id: doctorUserIds[2], sender_role: 'doctor', content: 'That is normal — the inflammation takes 3-5 days to fully resolve. Continue the drops 3x daily. Avoid swimming and keep the ear dry. If no improvement by day 5, visit a clinic for follow-up.' },
  ]

  for (let i = 0; i < chatMessages.length; i++) {
    const { error } = await supabase.from('consultation_messages').insert({
      ...chatMessages[i],
      created_at: hoursAgo(3 - i * 0.3),
    })
    if (error) console.error(`  ❌ chat message: ${error.message}`)
    else track('consultation_messages')
  }

  // ─── 10. CONSENT LOG ──────────────────────────────────
  console.log('🔒 Creating consent records...')
  const consentTypes = ['health_data_processing', 'geolocation_tracking', 'analytics', 'marketing_communications', 'profiling'] as const
  for (let i = 0; i < 5; i++) {
    const records = consentTypes.map((type, j) => ({
      user_id: patientIds[i],
      consent_type: type,
      granted: j < 2 ? true : Math.random() > 0.5, // first 2 always true
      ip_address: `10.0.0.${10 + i}`,
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    }))
    const { error } = await supabase.from('consent_log').insert(records)
    if (error) console.error(`  ❌ consent ${i}: ${error.message}`)
    else track('consent_log', 5)
  }

  // ─── 11. REFERRALS ────────────────────────────────────
  console.log('🎁 Setting up referrals...')
  // James (patient 0) referred Anna (patient 1) — completed
  // Anna (patient 1) referred Sophie (patient 2) — pending
  await supabase.from('profiles').update({ referred_by: patientIds[0] }).eq('id', patientIds[1])
  await supabase.from('profiles').update({ referred_by: patientIds[1] }).eq('id', patientIds[2])
  track('referrals', 2)

  // ─── 12. NOTIFICATIONS ────────────────────────────────
  console.log('🔔 Creating notifications...')
  const notifications = [
    { user_id: patientIds[0], title: 'Booking confirmed', body: 'Dr. Carlos Ruiz has accepted your request and is on his way.', type: 'booking_confirmed' },
    { user_id: patientIds[1], title: 'Doctor en route', body: 'Dr. Elena Fernández is heading to your location. ETA: 15 minutes.', type: 'doctor_en_route' },
    { user_id: patientIds[2], title: 'Rate your consultation', body: 'How was your experience with Dr. Miguel Ángel Costa? Leave a review!', type: 'review_reminder' },
    { user_id: patientIds[0], title: 'Referral bonus!', body: 'Your friend Anna just completed their first consultation. €10 credit added!', type: 'referral_bonus' },
    { user_id: doctorUserIds[3], title: 'RC Insurance Renewal', body: 'Your RC insurance policy expires in 60 days. Please renew to continue operating.', type: 'rc_expiry' },
  ]
  for (const n of notifications) {
    const { error } = await supabase.from('notifications').insert({ ...n, read: false })
    if (error) console.error(`  ❌ notification: ${error.message}`)
    else track('notifications')
  }

  // ─── 13. STRIPE WEBHOOK LOGS ──────────────────────────
  console.log('📡 Creating webhook logs...')
  const webhookLogs = [
    { event_type: 'checkout.session.completed', event_id: `evt_test_checkout_0`, status: 'processed' },
    { event_type: 'payment_intent.succeeded', event_id: `evt_test_payment_0`, status: 'processed' },
    { event_type: 'transfer.created', event_id: `evt_test_transfer_0`, status: 'processed' },
    { event_type: 'charge.refunded', event_id: `evt_test_refund_0`, status: 'processed' },
    { event_type: 'account.updated', event_id: `evt_test_account_0`, status: 'processed' },
  ]
  for (const wh of webhookLogs) {
    const { error } = await supabase.from('stripe_webhook_logs').insert({ ...wh, payload: {} })
    if (error) console.error(`  ❌ webhook log: ${error.message}`)
    else track('stripe_webhook_logs')
  }

  // ─── SUMMARY ──────────────────────────────────────────
  console.log('\n' + '═'.repeat(50))
  console.log('📊 Seed Summary:')
  console.log('═'.repeat(50))
  for (const [table, count] of Object.entries(counts).sort()) {
    console.log(`  ${table.padEnd(30)} ${count}`)
  }
  console.log('═'.repeat(50))

  console.log('\n🔑 Test Credentials (password: Test1234!):')
  console.log('─'.repeat(50))
  console.log('  ADMIN:')
  console.log('    teiguell.med@gmail.com')
  console.log('\n  PATIENTS:')
  for (const p of patients) console.log(`    ${p.email.padEnd(30)} ${p.name}`)
  console.log('\n  DOCTORS:')
  for (const d of doctors) console.log(`    ${d.email.padEnd(35)} ${d.name}`)

  console.log('\n✅ Seed complete!')
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err)
  process.exit(1)
})
