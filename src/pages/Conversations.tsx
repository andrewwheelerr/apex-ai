import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight, Zap } from 'lucide-react';
import { getConversations } from '../lib/queries';
import type { Conversation, IntentScore } from '../lib/supabase';

const C = {
  brand:    '#007AFF',
  nearBlk:  '#1D1D1F',
  darkGray: '#3A3A3C',
  midGray:  '#8E8E93',
  surface:  '#F2F2F7',
  white:    '#FFFFFF',
  border:   'rgba(0,0,0,0.08)',
  warning:  '#FF9500',
  success:  '#34C759',
};

type FilterStatus = 'all' | 'active' | 'booked' | 'handed_off' | 'closed';

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  active:     { label: 'Active',       bg: 'rgba(0,122,255,0.10)',  color: '#007AFF' },
  booked:     { label: 'Appt. Booked', bg: 'rgba(52,199,89,0.10)', color: '#34C759' },
  handed_off: { label: 'Handed Off',   bg: 'rgba(255,149,0,0.10)', color: '#FF9500' },
  closed:     { label: 'Closed',       bg: 'rgba(0,0,0,0.06)',     color: '#8E8E93' },
};

const CHANNEL_LABEL: Record<string, string> = {
  sms:          'SMS',
  website_chat: 'Website',
  facebook:     'Facebook',
};

const filterOptions: { key: FilterStatus; label: string }[] = [
  { key: 'all',        label: 'All'          },
  { key: 'active',     label: 'Active'       },
  { key: 'booked',     label: 'Appt. Booked' },
  { key: 'handed_off', label: 'Handed Off'   },
  { key: 'closed',     label: 'Closed'       },
];

// Opening messages Nova will respond to, keyed by vehicle interest fragment
const OPENERS = [
  'Hi, I saw your listing online and I\'m interested in learning more.',
  'Hey, can you tell me more about availability and pricing?',
  'I\'d like to schedule a test drive — what times do you have open?',
  'Hi! I was browsing your inventory and had a few questions.',
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2);
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.closed;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '3px 9px',
      borderRadius: 6, backgroundColor: m.bg, color: m.color, whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  );
}

const INTENT_META = {
  cold: { label: 'Cold', color: '#8E8E93', bg: 'rgba(142,142,147,0.10)', flame: '🧊' },
  warm: { label: 'Warm', color: '#FF9500', bg: 'rgba(255,149,0,0.10)',   flame: '🔥' },
  hot:  { label: 'Hot',  color: '#FF3B30', bg: 'rgba(255,59,48,0.10)',   flame: '🔥' },
};

function IntentBadge({ intent }: { intent: IntentScore | null }) {
  if (!intent) return null;
  const m = INTENT_META[intent.level] ?? INTENT_META.cold;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 500, padding: '2px 7px',
        borderRadius: 6, backgroundColor: m.bg, color: m.color, whiteSpace: 'nowrap',
      }}>
        {intent.level === 'hot' ? '🔥' : intent.level === 'warm' ? '🌡' : '❄️'} {m.label} · {intent.score}
      </span>
      <span style={{ fontSize: 11, color: '#8E8E93', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {intent.summary}
      </span>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: '50%',
          backgroundColor: C.brand,
          display: 'inline-block',
          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </span>
  );
}

const TH: React.CSSProperties = {
  padding: '0 16px 12px',
  fontSize: 11,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#8E8E93',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

export default function Conversations() {
  const navigate = useNavigate();
  const [rows, setRows]         = useState<Conversation[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState<FilterStatus>('all');
  const [thinking, setThinking] = useState<Set<string>>(new Set());
  const [simulating, setSimulating] = useState(false);

  const loadConversations = useCallback(() => {
    getConversations()
      .then(data => { setRows(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, []);

  useEffect(() => {
    loadConversations();
    // Auto-refresh every 10s to show new simulated conversations and status updates
    const interval = setInterval(loadConversations, 10_000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  async function simulateLead() {
    if (simulating) return;
    setSimulating(true);
    try {
      // Create a new conversation for a random lead
      const simRes = await fetch('/api/simulate-lead', { method: 'POST' });
      const { conversationId, lead } = await simRes.json();
      if (!conversationId) throw new Error('No conversationId returned');

      // Add to thinking set so the card shows the indicator immediately
      setThinking(prev => new Set(prev).add(conversationId));

      // Refresh list so the new conversation card appears
      loadConversations();

      // Fire an opening message — Nova responds live
      const opener = OPENERS[Math.floor(Math.random() * OPENERS.length)];
      await fetch('/api/agent-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userMessage: opener }),
      });

      // Remove from thinking and refresh
      setThinking(prev => { const s = new Set(prev); s.delete(conversationId); return s; });
      loadConversations();
    } catch (err: any) {
      console.error('[simulate-lead]', err.message);
    } finally {
      setSimulating(false);
    }
  }

  const counts: Record<FilterStatus, number> = {
    all:        rows.length,
    active:     rows.filter(r => r.status === 'active').length,
    booked:     rows.filter(r => r.status === 'booked').length,
    handed_off: rows.filter(r => r.status === 'handed_off').length,
    closed:     rows.filter(r => r.status === 'closed').length,
  };

  const visible = rows.filter(r => {
    const q = search.toLowerCase();
    const lead = r.leads;
    const matchSearch = !q ||
      lead?.name.toLowerCase().includes(q) ||
      lead?.vehicle_interest?.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const activeThinking = thinking.size;

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#F2F2F7' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: '28px 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 500, color: C.nearBlk, letterSpacing: '-0.5px', margin: 0 }}>
            Conversations
          </h1>
          {!loading && (
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6,
              backgroundColor: 'rgba(0,122,255,0.10)', color: C.brand,
            }}>
              {counts.active} active
            </span>
          )}
          {activeThinking > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6,
              backgroundColor: 'rgba(52,199,89,0.10)', color: C.success,
            }}>
              <ThinkingDots />
              Nova handling {activeThinking}
            </span>
          )}

          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={simulateLead}
              disabled={simulating}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10, border: 'none',
                backgroundColor: simulating ? C.surface : C.brand,
                color: simulating ? C.midGray : '#FFFFFF',
                fontSize: 13, fontWeight: 500, cursor: simulating ? 'default' : 'pointer',
                transition: 'background-color 0.15s',
              }}
            >
              <Zap size={13} />
              {simulating ? 'Simulating…' : 'Simulate Lead'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 10,
            backgroundColor: C.white, border: `0.5px solid ${C.border}`,
            flex: 1, maxWidth: 300,
          }}>
            <Search size={14} style={{ color: C.midGray, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by name or vehicle"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 14, color: C.nearBlk, width: '100%' }}
            />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: 4,
            borderRadius: 10, backgroundColor: C.white, border: `0.5px solid ${C.border}`,
          }}>
            {filterOptions.map(opt => {
              const active = filter === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setFilter(opt.key)}
                  style={{
                    padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: active ? 500 : 400,
                    backgroundColor: active ? C.brand : 'transparent',
                    color: active ? '#FFFFFF' : C.darkGray,
                    transition: 'all 0.1s',
                  }}
                >
                  {opt.label}
                  <span style={{ marginLeft: 5, fontSize: 11, color: active ? 'rgba(255,255,255,0.75)' : C.midGray }}>
                    {counts[opt.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 32px 32px' }}>
        <div style={{ backgroundColor: C.white, borderRadius: 10, border: `0.5px solid ${C.border}`, overflow: 'hidden' }}>

          {loading && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: C.midGray, fontSize: 14 }}>
              Loading conversations…
            </div>
          )}

          {error && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#FF3B30', fontSize: 13 }}>
              Could not load data: {error}
            </div>
          )}

          {!loading && !error && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `0.5px solid ${C.border}` }}>
                  <th style={{ ...TH, paddingLeft: 20 }}>Name</th>
                  <th style={TH}>Vehicle</th>
                  <th style={TH}>Last Message</th>
                  <th style={TH}>Intent</th>
                  <th style={TH}>Channel</th>
                  <th style={TH}>Time</th>
                  <th style={TH}>Status</th>
                  <th style={TH}></th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center', color: C.midGray, fontSize: 14 }}>
                      {rows.length === 0 ? 'No conversations yet.' : 'No results match your search.'}
                    </td>
                  </tr>
                ) : visible.map((row, i) => {
                  const lead = row.leads;
                  const isLast = i === visible.length - 1;
                  const isThinking = thinking.has(row.id);
                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: isLast ? 'none' : `0.5px solid ${C.border}`,
                        backgroundColor: isThinking ? 'rgba(0,122,255,0.02)' : 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {/* Name */}
                      <td style={{ padding: '12px 16px 12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            backgroundColor: isThinking ? 'rgba(0,122,255,0.15)' : 'rgba(0,122,255,0.10)',
                            color: C.brand,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 600,
                            transition: 'background-color 0.2s',
                          }}>
                            {initials(lead?.name ?? '?')}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 500, color: C.nearBlk }}>
                            {lead?.name ?? '—'}
                          </span>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 13, color: C.darkGray }}>
                          {lead?.vehicle_interest ?? '—'}
                        </span>
                      </td>

                      {/* Last message / thinking indicator */}
                      <td style={{ padding: '12px 16px', maxWidth: 280 }}>
                        {isThinking ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.brand }}>
                            <ThinkingDots /> Nova is responding…
                          </span>
                        ) : (
                          <span style={{ fontSize: 13, color: C.midGray, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            {row.last_message_preview ?? '—'}
                          </span>
                        )}
                      </td>

                      {/* Intent */}
                      <td style={{ padding: '12px 16px' }}>
                        {isThinking
                          ? <span style={{ fontSize: 11, color: C.midGray }}>Scoring…</span>
                          : <IntentBadge intent={row.intent_score} />
                        }
                      </td>

                      {/* Channel */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, color: C.midGray }}>
                          {CHANNEL_LABEL[row.channel] ?? row.channel}
                        </span>
                      </td>

                      {/* Time */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, color: C.midGray }}>
                          {timeAgo(row.last_message_at)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>

                      {/* View */}
                      <td style={{ padding: '12px 20px 12px 8px', textAlign: 'right' }}>
                        <button
                          onClick={() => navigate(`/conversations/${row.id}`)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 12, color: C.brand, background: 'none', border: 'none',
                            cursor: 'pointer', fontWeight: 500,
                          }}
                        >
                          View <ArrowUpRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
