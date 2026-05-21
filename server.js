const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');
require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const DEALERSHIP_ID = '00000000-0000-0000-0000-000000000001';

// ── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'check_availability',
    description: 'Check if a date/time slot is available for a test drive. Pass date as YYYY-MM-DD and time as "HH:MM AM/PM" (e.g. "10:00 AM"). If the lead says "Saturday", resolve it to the nearest upcoming Saturday.',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        time: { type: 'string', description: 'Time as "HH:MM AM" or "HH:MM PM", e.g. "10:00 AM"' },
      },
      required: ['date', 'time'],
    },
  },
  {
    name: 'book_appointment',
    description: 'Book a test drive appointment. Only call this after check_availability confirms the slot is open. On conflict (slot taken since check), return without booking and offer alternatives.',
    input_schema: {
      type: 'object',
      properties: {
        slot_id:          { type: 'string', description: 'The slot_id returned by check_availability' },
        lead_name:        { type: 'string', description: "The lead's name" },
        vehicle:          { type: 'string', description: 'Vehicle they want to test drive' },
        appointment_time: { type: 'string', description: 'Human-readable time, e.g. "Saturday, May 24 at 10:00 AM"' },
      },
      required: ['slot_id', 'lead_name', 'vehicle', 'appointment_time'],
    },
  },
  {
    name: 'send_confirmation',
    description: 'Log a confirmation event after booking. Call this immediately after a successful book_appointment.',
    input_schema: {
      type: 'object',
      properties: {
        appointment_id:   { type: 'string', description: 'ID returned by book_appointment' },
        appointment_time: { type: 'string' },
        vehicle:          { type: 'string' },
      },
      required: ['appointment_id', 'appointment_time', 'vehicle'],
    },
  },
  {
    name: 'escalate_to_human',
    description: 'Transfer the conversation to a human sales rep. Use when the lead asks about trade-in valuation, financing rates, wants to speak to a person, or the request is outside your scope.',
    input_schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Brief reason for escalation' },
      },
      required: ['reason'],
    },
  },
];

// ── Tool handlers ────────────────────────────────────────────────────────────

async function handleTool(toolName, toolInput, conversationId) {
  if (toolName === 'check_availability') {
    const { date, time } = toolInput;
    const { data: slot } = await supabase
      .from('slots')
      .select('id, date, time')
      .eq('date', date)
      .ilike('time', time.trim())
      .eq('is_available', true)
      .maybeSingle();

    if (slot) return { available: true, slot_id: slot.id };

    // Return a few open alternatives so Nova can offer them
    const { data: alts } = await supabase
      .from('slots')
      .select('id, date, time')
      .gte('date', date)
      .eq('is_available', true)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(3);
    return {
      available: false,
      slot_id: null,
      alternatives: (alts ?? []).map(s => ({ slot_id: s.id, date: s.date, time: s.time })),
    };
  }

  if (toolName === 'book_appointment') {
    const { slot_id, lead_name, vehicle, conversation_id: cId = conversationId, appointment_time } = toolInput;

    // Mark slot taken — UNIQUE constraint catches race condition
    const { error: slotErr } = await supabase
      .from('slots')
      .update({ is_available: false })
      .eq('id', slot_id)
      .eq('is_available', true); // only update if still available

    if (slotErr) return { booked: false, reason: 'Slot no longer available' };

    const { data: event } = await supabase
      .from('agent_events')
      .insert({
        conversation_id: cId,
        dealership_id: DEALERSHIP_ID,
        event_type: 'appointment_booked',
        metadata: { slot_id, lead_name, vehicle, appointment_time, source: 'tool_call' },
      })
      .select('id')
      .single();

    // Log as a visible thread event
    await supabase.from('messages').insert({
      conversation_id: cId,
      role: 'tool_call',
      content: JSON.stringify({ tool: 'book_appointment', appointment_time, vehicle }),
    });

    return { booked: true, appointment_id: event?.id ?? 'unknown' };
  }

  if (toolName === 'send_confirmation') {
    const { conversation_id: cId = conversationId, appointment_id, appointment_time, vehicle } = toolInput;
    await supabase.from('messages').insert({
      conversation_id: cId,
      role: 'tool_call',
      content: JSON.stringify({ tool: 'send_confirmation', appointment_time, vehicle, appointment_id }),
    });
    return { sent: true };
  }

  if (toolName === 'escalate_to_human') {
    const { conversation_id: cId = conversationId, reason } = toolInput;
    await supabase.from('agent_events').insert({
      conversation_id: cId,
      dealership_id: DEALERSHIP_ID,
      event_type: 'handed_off',
      metadata: { reason, source: 'tool_call' },
    });
    await supabase.from('messages').insert({
      conversation_id: cId,
      role: 'tool_call',
      content: JSON.stringify({ tool: 'escalate_to_human', reason }),
    });
    return { escalated: true };
  }

  return { error: `Unknown tool: ${toolName}` };
}

// ── Intent scoring ───────────────────────────────────────────────────────────

const INTENT_SCORE_TOOL = {
  name: 'score_intent',
  description: 'Score the lead\'s purchase intent based on the conversation so far.',
  input_schema: {
    type: 'object',
    properties: {
      level:   { type: 'string', enum: ['cold', 'warm', 'hot'], description: 'Overall intent level' },
      score:   { type: 'integer', description: '0–100. cold=0-33, warm=34-66, hot=67-100' },
      signals: { type: 'array', items: { type: 'string' }, description: 'Up to 3 concrete signals from the conversation that explain the score' },
      summary: { type: 'string', description: 'One sentence: where is this lead right now?' },
    },
    required: ['level', 'score', 'signals', 'summary'],
  },
};

async function scoreIntent(conversationId, claudeMessages, conv) {
  try {
    const lead = conv.leads;
    const systemPrompt = `You are an expert automotive sales analyst. Score the purchase intent of a lead based on their conversation with an AI agent.

Lead: ${lead?.name ?? 'unknown'}, interested in ${lead?.vehicle_interest ?? 'unknown'}.

Scoring guide:
- cold (0–33): browsing, vague, not engaging, mentioned competitor, said "just looking"
- warm (34–66): asking specific questions, engaged, open to next steps, hasn't committed
- hot (67–100): asked about availability, requested pricing, proposed a time, ready to book

Be honest. Most leads are warm. Reserve hot for clear buying signals.`;

    // Only pass user/agent messages (no tool_call rows)
    const messages = claudeMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-10); // last 10 turns is enough context

    const response = await anthropic.messages.create({
      model: process.env.AGENT_MODEL ?? 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: systemPrompt,
      tools: [INTENT_SCORE_TOOL],
      tool_choice: { type: 'tool', name: 'score_intent' },
      messages,
    });

    const toolBlock = response.content.find(b => b.type === 'tool_use');
    if (!toolBlock) return;

    const score = {
      ...toolBlock.input,
      scored_at: new Date().toISOString(),
    };

    await supabase
      .from('conversations')
      .update({ intent_score: score })
      .eq('id', conversationId);

    console.log(`[intent] ${conv.leads?.name}: ${score.level} (${score.score}) — ${score.summary}`);
    return score;
  } catch (err) {
    console.error('[intent] scoring error:', err.message);
  }
}

// ── Cross-session memory ─────────────────────────────────────────────────────

const EXTRACT_MEMORY_TOOL = {
  name: 'extract_memory',
  description: 'Extract a structured memory of the lead from the conversation.',
  input_schema: {
    type: 'object',
    properties: {
      vehicles_discussed: {
        type: 'array', items: { type: 'string' },
        description: 'Specific vehicles mentioned by the lead',
      },
      preferences: {
        type: 'array', items: { type: 'string' },
        description: 'Stated preferences, must-haves, nice-to-haves',
      },
      objections: {
        type: 'array', items: { type: 'string' },
        description: 'Concerns, hesitations, or reasons for not buying yet',
      },
      where_they_left_off: {
        type: 'string',
        description: 'One sentence: what was the last concrete thing discussed or agreed to?',
      },
      next_best_action: {
        type: 'string',
        description: 'One sentence: what should Nova do or say when this lead returns?',
      },
    },
    required: ['vehicles_discussed', 'preferences', 'objections', 'where_they_left_off', 'next_best_action'],
  },
};

async function extractMemory(leadId, claudeMessages) {
  try {
    const messages = claudeMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-20); // enough context, not the whole history

    if (messages.length < 2) return; // nothing worth remembering yet

    const response = await anthropic.messages.create({
      model: process.env.AGENT_MODEL ?? 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `You are a CRM assistant. Extract structured notes about a car-buying lead from their conversation with an AI sales agent. Be concise and factual — only include things the lead actually said.`,
      tools: [EXTRACT_MEMORY_TOOL],
      tool_choice: { type: 'tool', name: 'extract_memory' },
      messages,
    });

    const toolBlock = response.content.find(b => b.type === 'tool_use');
    if (!toolBlock) return;

    const memory = { ...toolBlock.input, updated_at: new Date().toISOString() };

    await supabase.from('leads').update({ memory }).eq('id', leadId);
    console.log(`[memory] updated lead ${leadId}: "${memory.where_they_left_off}"`);
    return memory;
  } catch (err) {
    console.error('[memory] error:', err.message);
  }
}

// ── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(conv, leadMemory = null) {
  const lead = conv.leads;
  const channelTone = conv.channel === 'sms'
    ? 'Keep replies under 2 sentences — this is SMS.'
    : 'Be warm and conversational — this is a chat widget.';

  const memorySection = leadMemory ? `
Prior conversation memory (from past sessions — use this to personalize your opening if this is a returning lead):
- Vehicles discussed: ${leadMemory.vehicles_discussed?.join(', ') || 'none'}
- Preferences: ${leadMemory.preferences?.join('; ') || 'none noted'}
- Objections: ${leadMemory.objections?.join('; ') || 'none noted'}
- Where they left off: ${leadMemory.where_they_left_off || 'unknown'}
- Next best action: ${leadMemory.next_best_action || 'continue conversation'}
` : '';

  return `You are Nova, an AI sales agent for Premier Honda. You help leads move from initial interest to booking a test drive.

Lead context:
- Name: ${lead?.name ?? 'the customer'}
- Vehicle interest: ${lead?.vehicle_interest ?? 'not specified'}
- Channel: ${conv.channel}
${memorySection}
Guidelines:
- ${channelTone}
- Answer questions about the vehicle (trims, features, pricing, availability) confidently.
- When the lead shows genuine interest in booking, call check_availability then book_appointment then send_confirmation in sequence.
- When the lead asks about trade-in valuation, financing rates, or wants to speak to a person, call escalate_to_human.
- Never reveal you are an AI unless directly asked. If asked, say "I'm Nova, Premier Honda's digital assistant."
- Today's date is ${new Date().toISOString().split('T')[0]}. Use this to resolve relative dates like "this Saturday".`;
}

app.post('/api/agent-reply', async (req, res) => {
  const { conversationId, userMessage } = req.body;
  if (!conversationId || !userMessage?.trim()) {
    return res.status(400).json({ error: 'conversationId and userMessage required' });
  }

  try {
    // Fetch conversation + lead (including memory)
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select('*, leads(id, name, vehicle_interest, source_channel, memory)')
      .eq('id', conversationId)
      .single();
    if (convErr) throw convErr;

    // Fetch message history (skip tool_call rows — those aren't Claude messages)
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    // Save the incoming user message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: userMessage,
    });

    // Build Claude message list (exclude tool_call system events)
    const claudeMessages = (history ?? [])
      .filter(m => m.role === 'user' || m.role === 'agent')
      .map(m => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.content }));
    claudeMessages.push({ role: 'user', content: userMessage });

    // ── Tool-use loop ────────────────────────────────────────────────────────
    let newStatus = conv.status;
    let agentReply = '';
    let toolsFired = [];

    for (let i = 0; i < 10; i++) { // max 10 iterations — safety guard
      const response = await anthropic.messages.create({
        model: process.env.AGENT_MODEL ?? 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: buildSystemPrompt(conv, conv.leads?.memory ?? null),
        tools: TOOLS,
        messages: claudeMessages,
      });

      // Append assistant turn to running message list
      claudeMessages.push({ role: 'assistant', content: response.content });

      console.log(`[agent] iteration=${i} stop_reason=${response.stop_reason} blocks=${JSON.stringify(response.content.map(b => b.type))}`);

      if (response.stop_reason === 'end_turn') {
        // Extract the final text reply
        const textBlock = response.content.find(b => b.type === 'text');
        agentReply = textBlock?.text ?? '';
        break;
      }

      if (response.stop_reason === 'tool_use') {
        const toolResults = [];

        for (const block of response.content) {
          if (block.type !== 'tool_use') continue;

          console.log(`[tool] calling ${block.name} with`, JSON.stringify(block.input));
          const result = await handleTool(block.name, block.input, conversationId);
          console.log(`[tool] ${block.name} result:`, JSON.stringify(result));
          toolsFired.push(block.name);

          // Track status changes
          if (block.name === 'book_appointment' && result.booked) newStatus = 'booked';
          if (block.name === 'escalate_to_human' && result.escalated) newStatus = 'handed_off';

          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }

        // Feed tool results back to Claude
        claudeMessages.push({ role: 'user', content: toolResults });
        continue;
      }

      // Unexpected stop reason
      break;
    }

    // Save agent's final text reply
    if (agentReply) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'agent',
        content: agentReply,
      });
    }

    // Update conversation metadata
    await supabase.from('conversations').update({
      last_message_preview: agentReply.slice(0, 120),
      last_message_at: new Date().toISOString(),
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', conversationId);

    // Run intent scoring and memory extraction in parallel — neither blocks the reply
    const [intentScore] = await Promise.all([
      scoreIntent(conversationId, claudeMessages, conv),
      extractMemory(conv.leads?.id, claudeMessages),
    ]);

    res.json({ reply: agentReply, status: newStatus, tools: toolsFired, intentScore: intentScore ?? null });
  } catch (err) {
    console.error('[agent-reply]', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages/:conversationId', async (req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', req.params.conversationId)
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/conversation/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, leads(name, vehicle_interest, source_channel)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── Simulate lead ────────────────────────────────────────────────────────────

app.post('/api/simulate-lead', async (req, res) => {
  try {
    // Pick a random lead
    const { data: leads, error: leadsErr } = await supabase
      .from('leads')
      .select('*');
    if (leadsErr) throw leadsErr;
    if (!leads?.length) return res.status(404).json({ error: 'No leads in database' });

    const lead = leads[Math.floor(Math.random() * leads.length)];

    // Create a new conversation
    const channels = ['sms', 'website_chat', 'facebook'];
    const channel = lead.source_channel ?? channels[Math.floor(Math.random() * channels.length)];

    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .insert({
        dealership_id: DEALERSHIP_ID,
        lead_id: lead.id,
        status: 'active',
        channel,
        agent_name: 'Nova',
        last_message_at: new Date().toISOString(),
        last_message_preview: null,
      })
      .select('id')
      .single();
    if (convErr) throw convErr;

    await supabase.from('agent_events').insert({
      conversation_id: conv.id,
      dealership_id: DEALERSHIP_ID,
      event_type: 'conversation_started',
      metadata: null,
    });

    res.json({ conversationId: conv.id, lead });
  } catch (err) {
    console.error('[simulate-lead]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Proactive follow-up ──────────────────────────────────────────────────────

function buildFollowUpPrompt(conv) {
  const lead = conv.leads;
  return `You are Nova, an AI sales agent for Premier Honda.

Lead context:
- Name: ${lead?.name ?? 'the customer'}
- Vehicle interest: ${lead?.vehicle_interest ?? 'not specified'}
- Channel: ${conv.channel}

The lead hasn't responded in 4+ hours. Write one short, natural follow-up message
referencing what they were interested in. Be warm, not pushy. No emojis. 2 sentences max.
Do not book anything — just re-engage.`;
}

async function runFollowUps(options = {}) {
  const { dryRun = false, minSilenceMs = 4 * 60 * 60 * 1000 } = options;
  const cutoff = new Date(Date.now() - minSilenceMs).toISOString();

  const { data: stale, error } = await supabase
    .from('conversations')
    .select('*, leads(name, vehicle_interest, source_channel)')
    .eq('status', 'active')
    .lt('last_message_at', cutoff)
    .is('follow_up_sent_at', null);

  if (error) { console.error('[follow-up] query error:', error.message); return []; }
  if (!stale?.length) { console.log('[follow-up] no stale conversations'); return []; }

  console.log(`[follow-up] found ${stale.length} stale conversation(s)${dryRun ? ' (dry run)' : ''}`);

  const results = [];
  for (const conv of stale) {
    try {
      if (dryRun) {
        results.push({ conversationId: conv.id, lead: conv.leads?.name, status: 'would_send' });
        continue;
      }

      const response = await anthropic.messages.create({
        model: process.env.AGENT_MODEL ?? 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: buildFollowUpPrompt(conv),
        messages: [{ role: 'user', content: '(generate follow-up)' }],
      });

      const reply = response.content.find(b => b.type === 'text')?.text ?? '';
      if (!reply) continue;

      await supabase.from('messages').insert({
        conversation_id: conv.id,
        role: 'agent',
        content: reply,
      });

      await supabase.from('agent_events').insert({
        conversation_id: conv.id,
        dealership_id: DEALERSHIP_ID,
        event_type: 'proactive_followup',
        metadata: { reply, source: 'scheduler' },
      });

      await supabase.from('conversations').update({
        follow_up_sent_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        last_message_preview: reply.slice(0, 120),
        updated_at: new Date().toISOString(),
      }).eq('id', conv.id);

      console.log(`[follow-up] sent to ${conv.leads?.name} (${conv.id})`);
      results.push({ conversationId: conv.id, lead: conv.leads?.name, reply });
    } catch (err) {
      console.error(`[follow-up] error for ${conv.id}:`, err.message);
      results.push({ conversationId: conv.id, lead: conv.leads?.name, error: err.message });
    }
  }

  return results;
}

// Run every 15 minutes
cron.schedule('*/15 * * * *', () => {
  console.log('[follow-up] cron tick');
  runFollowUps();
});

// Manual trigger — POST /api/follow-up-now
// Body: { dryRun?: boolean, minSilenceMs?: number } (minSilenceMs defaults to 4h)
app.post('/api/follow-up-now', async (req, res) => {
  const { dryRun = false, minSilenceMs = 4 * 60 * 60 * 1000 } = req.body ?? {};
  try {
    const results = await runFollowUps({ dryRun, minSilenceMs });
    res.json({ triggered: results.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.AGENT_PORT ?? 3001;
app.listen(PORT, () => console.log(`Nova agent server on :${PORT}`));
