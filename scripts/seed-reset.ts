/**
 * OnCall Clinic — Seed Reset Script
 * Deletes ALL test data in reverse dependency order, then re-seeds.
 * Run: npx tsx scripts/seed-reset.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { execSync } from 'child_process'

// Load .env.local
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

// Test user emails to identify seed data
const TEST_EMAILS = [
  'james.mitchell@test.com',
  'anna.mueller@test.com',
  'sophie.vdb@test.com',
  'maria.garcia@test.com',
  'pierre.dubois@test.com',
  'dr.carlos.ruiz@test.com',
  'dr.elena.fernandez@test.com',
  'dr.miguel.costa@test.com',
  'dra.laura.sanchez@test.com',
  'dr.pablo.mari@test.com',
  'admin@oncallclinic.com',
]

// ─── Delete tables in reverse dependency order ───────────────
const TABLES_IN_DELETE_ORDER = [
  'consultation_messages',
  'consultation_reviews',
  'refunds',
  'payouts',
  'stripe_webhook_logs',
  'consultation_status_history',
  'notifications',
  'consultations',
  'consent_log',
  'doctor_documents',
  'rc_expiry_alerts',
  'doctor_profiles',
  'profiles',
]

async function resetDatabase() {
  console.log('🗑️  OnCall Clinic — Resetting seed data...\n')

  // 1. Get user IDs for test accounts
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const testUsers = users.filter((u: { email?: string }) =>
    u.email && TEST_EMAILS.includes(u.email)
  )
  const testUserIds = testUsers.map((u: { id: string }) => u.id)

  if (testUserIds.length === 0) {
    console.log('  No test users found. Skipping cleanup.\n')
  } else {
    console.log(`  Found ${testUserIds.length} test users to clean up.\n`)

    // 2. Delete from each table (filtering by user where applicable)
    for (const table of TABLES_IN_DELETE_ORDER) {
      try {
        let result;

        switch (table) {
          case 'consultation_messages':
          case 'consultation_reviews':
          case 'refunds':
          case 'payouts':
          case 'consultation_status_history': {
            // These reference consultations — delete where consultation belongs to test patient
            const { data: consultations } = await supabase
              .from('consultations')
              .select('id')
              .in('patient_id', testUserIds)
            const cIds = consultations?.map((c: { id: string }) => c.id) || []
            if (cIds.length > 0) {
              result = await supabase.from(table).delete().in('consultation_id', cIds)
            } else {
              console.log(`  ⏭️  ${table}: no matching consultations`)
              continue
            }
            break
          }

          case 'stripe_webhook_logs':
            // Delete all test webhook logs (they don't have user refs, delete all)
            result = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
            break

          case 'notifications':
            result = await supabase.from(table).delete().in('user_id', testUserIds)
            break

          case 'consultations':
            result = await supabase.from(table).delete().in('patient_id', testUserIds)
            break

          case 'consent_log':
            result = await supabase.from(table).delete().in('user_id', testUserIds)
            break

          case 'doctor_documents':
          case 'rc_expiry_alerts':
          case 'doctor_profiles': {
            const doctorEmails = TEST_EMAILS.filter(e => e.startsWith('dr.') || e.startsWith('dra.'))
            const doctorIds = testUsers
              .filter((u: { email?: string }) => u.email && doctorEmails.includes(u.email))
              .map((u: { id: string }) => u.id)
            if (doctorIds.length > 0) {
              const column = table === 'doctor_profiles' ? 'id' : 'doctor_id'
              result = await supabase.from(table).delete().in(column, doctorIds)
            } else {
              console.log(`  ⏭️  ${table}: no doctor users`)
              continue
            }
            break
          }

          case 'profiles':
            // Clear referred_by references before deleting (self-referencing FK)
            await supabase.from('profiles').update({ referred_by: null }).in('id', testUserIds)
            await supabase.from('profiles').update({ referred_by: null }).in('referred_by', testUserIds)
            result = await supabase.from(table).delete().in('id', testUserIds)
            break

          default:
            console.log(`  ⏭️  ${table}: unknown table, skipping`)
            continue
        }

        if (result?.error) {
          console.error(`  ❌ ${table}: ${result.error.message}`)
        } else {
          console.log(`  ✅ ${table}: cleared`)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`  ❌ ${table}: ${msg}`)
      }
    }

    // 3. Delete auth users
    console.log('\n  Deleting auth users...')
    for (const user of testUsers) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(user.id)
        if (error) {
          console.error(`  ❌ Auth user ${user.email}: ${error.message}`)
        } else {
          console.log(`  ✅ Deleted auth user: ${user.email}`)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`  ❌ Auth user ${user.email}: ${msg}`)
      }
    }
  }

  console.log('\n─────────────────────────────────────────')
  console.log('🌱 Now re-seeding...\n')

  // 4. Run seed script
  try {
    execSync('npx tsx scripts/seed.ts', {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
  } catch {
    console.error('\n❌ Seed script failed')
    process.exit(1)
  }

  console.log('\n✅ Reset + seed complete!')
}

resetDatabase().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
