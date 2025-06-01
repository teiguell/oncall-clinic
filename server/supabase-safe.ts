import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = supabaseUrl && supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey) : null;

export interface EventLogEntry {
  tracking_code?: string;
  user_id?: string;
  user_role?: 'patient' | 'doctor' | 'admin';
  event_type: string;
  event_payload: Record<string, any>;
}

export async function initializeEventLogTable() {
  if (!supabase) {
    console.log('Event log system initialized');
    return;
  }
  
  try {
    await supabase.from('event_log').select('id').limit(1);
    console.log('Event log system initialized');
  } catch (error) {
    console.log('Event log system initialized (offline mode)');
  }
}

export async function logEvent(entry: EventLogEntry): Promise<void> {
  if (!supabase) return;
  
  try {
    await supabase.from('event_log').insert({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Silent fail for logging
  }
}

export async function logError(message: string, details?: any): Promise<void> {
  await logEvent({
    event_type: 'error',
    event_payload: { message, details }
  });
}

export async function getEventsByTrackingCode(trackingCode: string): Promise<any[]> {
  if (!supabase) return [];
  
  try {
    const { data } = await supabase
      .from('event_log')
      .select('*')
      .eq('tracking_code', trackingCode)
      .order('timestamp', { ascending: false });
    
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getEventsByUser(userId: string, userRole?: string): Promise<any[]> {
  if (!supabase) return [];
  
  try {
    let query = supabase
      .from('event_log')
      .select('*')
      .eq('user_id', userId);
    
    if (userRole) {
      query = query.eq('user_role', userRole);
    }
    
    const { data } = await query.order('timestamp', { ascending: false });
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getAllEvents(limit = 100): Promise<any[]> {
  if (!supabase) return [];
  
  try {
    const { data } = await supabase
      .from('event_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    return data || [];
  } catch (error) {
    return [];
  }
}