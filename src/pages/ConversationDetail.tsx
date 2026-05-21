import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Calendar, UserCheck, Search } from 'lucide-react';
import type { Conversation, Message, IntentScore } from '../lib/supabase';

const C = {
  brand:    '#007AFF',
  nearBlk:  '#1D1D1F',
  darkGray: '#3A3A3C',
  midGray:  '#8E8E93',
  surface:  '#F2F2F7',
  white:    '#FFFFFF',
  border:   'rgba(0,0,0,0.08)',
  success:  '#34C759',
  warning:  '#FF9500',
};

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  active:     { label: 'Active',       bg: 'rgba(0,122,255,0.10)',  color: C.brand   },
  booked:     { label: 'Appt. Booked', bg: 'rgba(52,199,89,0.10)', color: C.success },
  handed_off: { label: 'Handed Off',   bg: 'rgba(255,149,0,0.10)', color: C.warning },
  closed:     { label: 'Closed',       bg: 'rgba(0,0,0,0.06)',      color: C.midGray },
};

const CHANNEL_LABEL: Record<string, string> = {
  sms: 'SMS', website_chat: 'Website Chat', facebook: 'Facebook',
};

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const TOOL_META: Record<string, { icon: React.ReactNode; label: (p: Record<string, string>) => string; color: string }> = {
  check_availability: {
    icon: <Search size={11} />,
    label: p => `Nova checked availability${p.date ? ` · ${p.date} ${p.time ?? ''}`.trim() : ''}`,
    color: '#8E8E93',
  },
  book_appointment: {
    icon: <Calendar size={11} />,
    label: p => `Appointment booked · ${p.appointment_time ?? ''} · ${p.vehicle ?? ''}`,
    color: '#34C759',
  },
  send_confirmation: {
    icon: <Calendar size={11} />,
    label: p => `Confirmation sent · ${p.appointment_time ?? ''}`,
    color: '#34C759',
  },
  escalate_to_human: {
    icon: <UserCheck size={11} />,
    label: p => `Handed off to team · ${p.reason ?? ''}`,
    color: '#FF9500',
  },
};

function ToolEvent({ content }: { content: string }) {
  let parsed: Record<string, string> = {};
  try { parsed = JSON.parse(content); } catch {}
  const meta = TOOL_META[parsed.tool] ?? {
    icon: null,
    label: () => parsed.tool ?? 'Agent action',
    color: '#8E8E93',
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, color: meta.color, fontWeight: 500,
        backgroundColor: `${meta.color}14`,
        border: `0.5px solid ${meta.color}30`,
        borderRadius: 20, padding: '3px 10px',
      }}>
        {meta.icon}
        {meta.label(parsed)}
      </div>
    </div>
  );
}

function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\n)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part === '\n') return <br key={i} />;
    return part;
  });
}

function IntentBadge({ intent }: { intent: IntentScore | null }) {
  if (!intent) return null;
  const meta = {
    cold: { color: '#8E8E93', bg: 'rgba(142,142,147,0.10)', icon: '❄️' },
    warm: { color: '#FF9500', bg: 'rgba(255,149,0,0.10)',   icon: '🌡' },
    hot:  { color: '#FF3B30', bg: 'rgba(255,59,48,0.10)',   icon: '🔥' },
  }[intent.level] ?? { color: '#8E8E93', bg: 'rgba(142,142,147,0.10)', icon: '❄️' };
  return (
    <span title={intent.signals.join(' · ')} style={{
      fontSize: 11, fontWeight: 500, padding: '3px 9px',
      borderRadius: 6, backgroundColor: meta.bg, color: meta.color,
      cursor: 'default',
    }}>
      {meta.icon} {intent.level.charAt(0).toUpperCase() + intent.level.slice(1)} · {intent.score}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.closed;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '3px 9px',
      borderRadius: 6, backgroundColor: m.bg, color: m.color,
    }}>{m.label}</span>
  );
}

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [conv, setConv]       = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]     = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/conversation/${id}`)
      .then(r => r.json())
      .then(setConv)
      .catch(err => setError(err.message));

    fetch(`/api/messages/${id}`)
      .then(r => r.json())
      .then(setMessages)
      .catch(err => setError(err.message));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending || !id) return;

    setInput('');
    setSending(true);
    setError(null);

    // Optimistic: add user message immediately
    const tempUser: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUser]);

    try {
      const res = await fetch('/api/agent-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: id, userMessage: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Server error');

      // Reload messages from DB so tool_call events appear in the right order
      const freshRes = await fetch(`/api/messages/${id}`);
      const freshMessages: Message[] = await freshRes.json();
      if (Array.isArray(freshMessages) && freshMessages.length > 0) {
        setMessages(freshMessages);
      } else {
        const agentMsg: Message = {
          id: `temp-agent-${Date.now()}`,
          conversation_id: id,
          role: 'agent',
          content: data.reply,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, agentMsg]);
      }
      setConv(c => {
        if (!c) return c;
        return {
          ...c,
          ...(data.status !== c.status ? { status: data.status } : {}),
          ...(data.intentScore ? { intent_score: data.intentScore } : {}),
        };
      });
    } catch (err: any) {
      setError(err.message);
      // Roll back optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempUser.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const lead = conv?.leads;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.surface }}>
      {/* Header */}
      <div style={{
        backgroundColor: C.white, borderBottom: `0.5px solid ${C.border}`,
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/conversations')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: C.brand, fontSize: 14, fontWeight: 400, padding: 0 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ width: '0.5px', height: 20, backgroundColor: C.border }} />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              backgroundColor: 'rgba(0,122,255,0.10)', color: C.brand,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600,
            }}>
              {lead?.name ? lead.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : '?'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: C.nearBlk }}>{lead?.name ?? '—'}</span>
                {conv && <StatusBadge status={conv.status} />}
                {conv?.intent_score && <IntentBadge intent={conv.intent_score} />}
              </div>
              <span style={{ fontSize: 12, color: C.midGray }}>
                {lead?.vehicle_interest ?? '—'} · {conv ? CHANNEL_LABEL[conv.channel] ?? conv.channel : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {messages.length === 0 && !conv && (
            <div style={{ textAlign: 'center', color: C.midGray, fontSize: 14, paddingTop: 48 }}>
              Loading…
            </div>
          )}
          {messages.map((msg, i) => {
            if (msg.role === 'tool_call') {
              return <ToolEvent key={msg.id} content={msg.content} />;
            }
            const isAgent = msg.role === 'agent';
            const prev = messages[i - 1];
            const showSender = !prev || (prev.role !== msg.role && prev.role !== 'tool_call');
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAgent ? 'flex-start' : 'flex-end', marginTop: showSender ? 16 : 2 }}>
                {showSender && (
                  <span style={{ fontSize: 11, color: C.midGray, marginBottom: 4 }}>
                    {isAgent ? 'Nova · AI Agent' : lead?.name ?? 'Lead'}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexDirection: isAgent ? 'row' : 'row-reverse' }}>
                  <div style={{
                    maxWidth: 460, padding: '10px 14px', borderRadius: 16,
                    borderBottomLeftRadius: isAgent ? 4 : 16,
                    borderBottomRightRadius: isAgent ? 16 : 4,
                    backgroundColor: isAgent ? C.white : C.brand,
                    color: isAgent ? C.nearBlk : '#FFFFFF',
                    fontSize: 14, lineHeight: 1.5,
                    border: isAgent ? `0.5px solid ${C.border}` : 'none',
                    boxShadow: isAgent ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                  }}>
                    {isAgent ? renderMarkdown(msg.content) : msg.content}
                  </div>
                  <span style={{ fontSize: 10, color: C.midGray, flexShrink: 0, paddingBottom: 2 }}>
                    {fmt(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
          {sending && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 16 }}>
              <span style={{ fontSize: 11, color: C.midGray, marginBottom: 4 }}>Nova · AI Agent</span>
              <div style={{
                padding: '10px 16px', borderRadius: '16px 16px 16px 4px',
                backgroundColor: C.white, border: `0.5px solid ${C.border}`,
                display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    backgroundColor: C.midGray,
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 24px', backgroundColor: 'rgba(255,59,48,0.08)',
          borderTop: '0.5px solid rgba(255,59,48,0.2)',
          fontSize: 13, color: '#FF3B30', flexShrink: 0,
        }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Input */}
      <div style={{
        backgroundColor: C.white, borderTop: `0.5px solid ${C.border}`,
        padding: '12px 24px', flexShrink: 0,
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Reply as the lead… (Enter to send)"
            rows={1}
            style={{
              flex: 1, resize: 'none', border: `0.5px solid ${C.border}`,
              borderRadius: 10, padding: '9px 12px',
              fontSize: 14, color: C.nearBlk, outline: 'none',
              backgroundColor: C.surface, fontFamily: 'inherit',
              lineHeight: 1.5,
            }}
            onInput={e => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              backgroundColor: !input.trim() || sending ? C.surface : C.brand,
              color: !input.trim() || sending ? C.midGray : '#FFFFFF',
              cursor: !input.trim() || sending ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background-color 0.15s',
            }}
          >
            <Send size={15} />
          </button>
        </div>
        <p style={{ maxWidth: 680, margin: '6px auto 0', fontSize: 11, color: C.midGray, textAlign: 'center' }}>
          Simulate a lead message — Nova will respond live
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
