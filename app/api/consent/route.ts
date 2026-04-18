import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client to bypass RLS
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface ConsentRecord {
  user_id: string
  consent_type: string
  granted: boolean
  user_agent: string | null
  revoked_at?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const records: ConsentRecord | ConsentRecord[] = body

    // Extract real IP from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'

    const supabase = getSupabase()

    // Support both single record and batch
    const items = Array.isArray(records) ? records : [records]

    // Validate
    for (const item of items) {
      if (!item.user_id || !item.consent_type || typeof item.granted !== 'boolean') {
        return NextResponse.json(
          { error: 'Missing required fields: user_id, consent_type, granted' },
          { status: 400 }
        )
      }
    }

    const insertData = items.map(item => ({
      user_id: item.user_id,
      consent_type: item.consent_type,
      granted: item.granted,
      ip_address: ip,
      user_agent: item.user_agent,
      revoked_at: item.granted ? null : (item.revoked_at || new Date().toISOString()),
    }))

    const { error } = await supabase.from('consent_log').insert(insertData)

    if (error) {
      console.error('Consent insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Consent API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
