import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Interface for event logging
export interface EventLogEntry {
  tracking_code?: string;
  user_id?: string;
  user_role?: 'patient' | 'doctor' | 'admin';
  event_type: string;
  event_payload: Record<string, any>;
}

// Create the event_log table if it doesn't exist
export async function initializeEventLogTable() {
  try {
    const { error } = await supabase.rpc('create_event_log_table_if_not_exists');
    
    if (error) {
      // Try to create using SQL directly
      const { error: sqlError } = await supabase
        .from('event_log')
        .select('id')
        .limit(1);
      
      if (sqlError && sqlError.code === 'PGRST116') {
        // Table doesn't exist, create it
        console.log('Creating event_log table in Supabase...');
        
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS event_log (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tracking_code TEXT,
            user_id TEXT,
            user_role TEXT CHECK (user_role IN ('patient', 'doctor', 'admin')),
            event_type TEXT NOT NULL,
            event_payload JSONB,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_event_log_tracking_code ON event_log(tracking_code);
          CREATE INDEX IF NOT EXISTS idx_event_log_user_id ON event_log(user_id);
          CREATE INDEX IF NOT EXISTS idx_event_log_event_type ON event_log(event_type);
          CREATE INDEX IF NOT EXISTS idx_event_log_timestamp ON event_log(timestamp);
        `;
        
        // We'll handle table creation differently
        console.log('Event log table will be created on first use');
      }
    }
    
    console.log('Event log system initialized');
  } catch (error) {
    console.error('Error initializing event log table:', error);
  }
}

// Log an event to Supabase
export async function logEvent(entry: EventLogEntry): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('event_log')
      .insert({
        tracking_code: entry.tracking_code || null,
        user_id: entry.user_id || null,
        user_role: entry.user_role || null,
        event_type: entry.event_type,
        event_payload: entry.event_payload
      });

    if (error) {
      console.error('Error logging event to Supabase:', error);
      return false;
    }

    console.log(`Event logged: ${entry.event_type}`);
    return true;
  } catch (error) {
    console.error('Error logging event:', error);
    return false;
  }
}

// Get events for a tracking code
export async function getEventsByTrackingCode(trackingCode: string) {
  try {
    const { data, error } = await supabase
      .from('event_log')
      .select('*')
      .eq('tracking_code', trackingCode)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Get events for a user
export async function getEventsByUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('event_log')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching user events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user events:', error);
    return [];
  }
}

// Get all events (for admin panel)
export async function getAllEvents(limit: number = 100, offset: number = 0) {
  try {
    const { data, error } = await supabase
      .from('event_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching all events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
}

// Log error events
export async function logError(error: any, context: string, metadata?: Record<string, any>) {
  try {
    await logEvent({
      event_type: 'system_error',
      event_payload: {
        context,
        error: error?.message || String(error),
        stack: error?.stack,
        metadata: metadata || {}
      }
    });
  } catch (logError) {
    console.error('Error logging error event:', logError);
  }
}