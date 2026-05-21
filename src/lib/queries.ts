import { supabase, type Conversation, type ConversationStatus } from './supabase';

const DEALERSHIP_ID = '00000000-0000-0000-0000-000000000001';

export async function getConversations(status?: ConversationStatus) {
  let q = supabase
    .from('conversations')
    .select('*, leads(name, vehicle_interest, source_channel)')
    .eq('dealership_id', DEALERSHIP_ID)
    .order('last_message_at', { ascending: false });

  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) throw error;
  return data as Conversation[];
}

export async function getKPIs() {
  const [conversations, events] = await Promise.all([
    supabase
      .from('conversations')
      .select('status')
      .eq('dealership_id', DEALERSHIP_ID),
    supabase
      .from('agent_events')
      .select('event_type, created_at')
      .eq('dealership_id', DEALERSHIP_ID)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  if (conversations.error) throw conversations.error;
  if (events.error) throw events.error;

  const rows = conversations.data ?? [];
  const evts = events.data ?? [];

  return {
    total:      rows.length,
    active:     rows.filter(r => r.status === 'active').length,
    booked:     rows.filter(r => r.status === 'booked').length,
    handed_off: rows.filter(r => r.status === 'handed_off').length,
    closed:     rows.filter(r => r.status === 'closed').length,
    appts_this_week: evts.filter(e => e.event_type === 'appointment_booked').length,
    handoffs_this_week: evts.filter(e => e.event_type === 'handed_off').length,
  };
}
