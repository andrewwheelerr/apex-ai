import { createClient } from '@supabase/supabase-js';

const url  = process.env.REACT_APP_SUPABASE_URL!;
const key  = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

// ── Types ──────────────────────────────────────────────────────────────────

export type ConversationStatus = 'active' | 'booked' | 'handed_off' | 'closed';
export type Channel = 'sms' | 'website_chat' | 'facebook';

export interface Dealership {
  id: string;
  name: string;
  crm_type: string | null;
  crm_dealer_id: string | null;
  timezone: string;
  created_at: string;
}

export interface Lead {
  id: string;
  dealership_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  vehicle_interest: string | null;
  source_channel: Channel;
  crm_contact_id: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  dealership_id: string;
  lead_id: string;
  status: ConversationStatus;
  channel: Channel;
  agent_name: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  last_message_preview: string | null;
  // joined
  leads?: Lead;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'agent' | 'system' | 'tool_call';
  content: string;
  created_at: string;
}

export interface AgentEvent {
  id: string;
  conversation_id: string;
  dealership_id: string;
  event_type:
    | 'conversation_started'
    | 'appointment_booked'
    | 'handed_off'
    | 'closed'
    | 'crm_synced';
  metadata: Record<string, unknown> | null;
  created_at: string;
}
