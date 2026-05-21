import React, { useState, useEffect } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { getKPIs, getConversations } from '../lib/queries';
import type { Conversation } from '../lib/supabase';

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
  danger:   '#FF3B30',
};

const sourceData = [
  { label: 'Website Chat',  key: 'website_chat' },
  { label: 'SMS / Text',    key: 'sms'          },
  { label: 'Facebook',      key: 'facebook'     },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const dateRanges = ['Last 7 days', 'Last 30 days', 'This month', 'Custom'];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    active:     { label: 'Active',      bg: 'rgba(0,122,255,0.10)',  color: C.brand   },
    handed_off: { label: 'Handed Off',  bg: 'rgba(255,149,0,0.10)',  color: C.warning },
    booked:     { label: 'Appt. Booked',bg: 'rgba(52,199,89,0.10)', color: C.success },
    closed:     { label: 'Closed',      bg: 'rgba(0,0,0,0.06)',      color: C.midGray },
  };
  const s = map[status] ?? map.closed;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 6,
      backgroundColor: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2);
}

interface KPIData {
  total: number;
  active: number;
  booked: number;
  handed_off: number;
  closed: number;
  appts_this_week: number;
  handoffs_this_week: number;
}

export default function Dashboard() {
  const [range, setRange] = useState('Last 7 days');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [recent, setRecent] = useState<Conversation[]>([]);

  useEffect(() => {
    getKPIs().then(setKpis).catch(console.error);
    getConversations().then(data => setRecent(data.slice(0, 6))).catch(console.error);
  }, []);

  return (
    <div style={{ minHeight: '100%', backgroundColor: C.surface }}>
      {/* Page header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 32px 0',
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 500, color: C.nearBlk, letterSpacing: '-0.5px', margin: 0 }}>
          Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: C.midGray }}>Premier Honda</span>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setRangeOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 10,
                backgroundColor: C.white, border: `0.5px solid ${C.border}`,
                fontSize: 13, color: C.darkGray, cursor: 'pointer', fontWeight: 400,
              }}
            >
              {range}
              <ChevronDown size={13} style={{ color: C.midGray }} />
            </button>
            {rangeOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 4px)',
                backgroundColor: C.white, border: `0.5px solid ${C.border}`,
                borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                overflow: 'hidden', zIndex: 50, minWidth: 150,
              }}>
                {dateRanges.map(r => (
                  <button
                    key={r}
                    onClick={() => { setRange(r); setRangeOpen(false); }}
                    style={{
                      width: '100%', display: 'block', padding: '9px 14px',
                      fontSize: 13, color: r === range ? C.brand : C.nearBlk,
                      backgroundColor: r === range ? 'rgba(0,122,255,0.06)' : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontWeight: r === range ? 500 : 400,
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 32px 32px' }}>
        {/* Hero frosted glass KPI card */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          {/* Gradient backdrop so the blur has something to work with */}
          <div style={{
            position: 'absolute', inset: -2,
            background: 'linear-gradient(135deg, rgba(0,122,255,0.13) 0%, rgba(52,199,89,0.05) 60%, transparent 100%)',
            borderRadius: 16,
          }} />
          <div style={{
            position: 'relative',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.72)',
            borderRadius: 14,
            border: `0.5px solid ${C.border}`,
            padding: '24px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
          }}>
            {[
              { label: 'Total Conversations', value: kpis ? String(kpis.total)            : '—', sub: 'all time'         },
              { label: 'Active Now',           value: kpis ? String(kpis.active)           : '—', sub: 'in progress'      },
              { label: 'Appts This Week',      value: kpis ? String(kpis.appts_this_week)  : '—', sub: 'booked by agent'  },
              { label: 'Handoff Rate',         value: kpis ? (kpis.total > 0 ? `${((kpis.handed_off / kpis.total) * 100).toFixed(1)}%` : '0%') : '—', sub: 'of all convos' },
            ].map((kpi, i, arr) => (
              <div
                key={kpi.label}
                style={{
                  paddingRight: i < arr.length - 1 ? 32 : 0,
                  borderRight: i < arr.length - 1 ? `0.5px solid ${C.border}` : 'none',
                  paddingLeft: i > 0 ? 32 : 0,
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.midGray, margin: '0 0 10px' }}>
                  {kpi.label}
                </p>
                <p style={{ fontSize: 28, fontWeight: 500, color: C.nearBlk, letterSpacing: '-0.5px', margin: '0 0 6px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {kpi.value}
                </p>
                <span style={{ fontSize: 12, color: C.midGray }}>{kpi.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          {/* Left: Conversations by Source bar chart */}
          <div style={{
            backgroundColor: C.white, borderRadius: 10, border: `0.5px solid ${C.border}`,
            padding: 24,
          }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 500, color: C.nearBlk, margin: '0 0 2px' }}>
                Conversations by Source
              </h2>
              <p style={{ fontSize: 13, color: C.midGray, margin: 0 }}>All time</p>
            </div>

            {(() => {
              const counts = sourceData.map(d => ({
                ...d,
                count: recent.length > 0
                  ? (kpis ? [
                    { key: 'website_chat', n: recent.filter(r => r.channel === 'website_chat').length },
                    { key: 'sms',          n: recent.filter(r => r.channel === 'sms').length },
                    { key: 'facebook',     n: recent.filter(r => r.channel === 'facebook').length },
                  ].find(x => x.key === d.key)?.n ?? 0 : 0)
                  : 0,
              }));
              const total = counts.reduce((s, d) => s + d.count, 0);
              const maxC = Math.max(...counts.map(d => d.count), 1);
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160, marginBottom: 12 }}>
                    {counts.map(d => {
                      const h = Math.max((d.count / maxC) * 140, d.count > 0 ? 8 : 4);
                      return (
                        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: C.darkGray, fontVariantNumeric: 'tabular-nums' }}>
                            {d.count}
                          </span>
                          <div style={{
                            width: '100%', height: h, borderRadius: '5px 5px 0 0',
                            backgroundColor: C.brand, opacity: d.count > 0 ? 0.18 + (d.count / maxC) * 0.72 : 0.08,
                          }} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {counts.map(d => (
                      <div key={d.label} style={{ flex: 1, textAlign: 'center' }}>
                        <p style={{ fontSize: 11, color: C.midGray, margin: 0, lineHeight: 1.3 }}>{d.label}</p>
                        <p style={{ fontSize: 11, color: C.midGray, margin: 0 }}>
                          {total > 0 ? `${Math.round((d.count / total) * 100)}%` : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Right: Recent conversation feed */}
          <div style={{
            backgroundColor: C.white, borderRadius: 10, border: `0.5px solid ${C.border}`,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `0.5px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 500, color: C.nearBlk, margin: 0 }}>
                Recent
              </h2>
              <a href="/conversations" style={{ fontSize: 13, color: C.brand, textDecoration: 'none', fontWeight: 400 }}>
                View all
              </a>
            </div>

            <div>
              {recent.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: C.midGray, fontSize: 13 }}>
                  Loading…
                </div>
              ) : recent.map((row, i) => {
                const name = row.leads?.name ?? '—';
                const vehicle = row.leads?.vehicle_interest ?? '—';
                return (
                  <div
                    key={row.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 20px',
                      borderBottom: i < recent.length - 1 ? `0.5px solid ${C.border}` : 'none',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      backgroundColor: 'rgba(0,122,255,0.10)', color: C.brand,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 500,
                    }}>
                      {initials(name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.nearBlk, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {name}
                      </p>
                      <p style={{ fontSize: 12, color: C.midGray, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {vehicle}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <StatusBadge status={row.status} />
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: C.midGray }}>
                        <Clock size={10} />
                        {timeAgo(row.last_message_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
