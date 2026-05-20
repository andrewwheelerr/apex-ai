import React from 'react';
import { TrendingUp, TrendingDown, Clock, Calendar, ChevronDown } from 'lucide-react';

const C = {
  bg:        'oklch(11%  0.014 252)',
  surface:   'oklch(15%  0.018 252)',
  raised:    'oklch(19%  0.022 252)',
  border:    'oklch(28%  0.020 252)',
  borderSub: 'oklch(21%  0.016 252)',
  accent:    'oklch(63%  0.225 240)',
  accentHi:  'oklch(70%  0.215 240)',
  accentDim: 'oklch(23%  0.055 240)',
  ink1:      'oklch(93%  0.008 252)',
  ink2:      'oklch(63%  0.012 252)',
  ink3:      'oklch(41%  0.010 252)',
  ok:        'oklch(67%  0.155 148)',
  okDim:     'oklch(21%  0.048 148)',
  warn:      'oklch(76%  0.138 68)',
  warnDim:   'oklch(21%  0.048 68)',
};

interface Metric {
  label: string;
  value: string;
  subtext: string;
  delta: string;
  up: boolean;
  positive: boolean; // true = up is good
}

const metrics: Metric[] = [
  { label: 'Leads Responded', value: '847',    subtext: 'This week',        delta: '+12%', up: true,  positive: true  },
  { label: 'Appts. Booked',   value: '63',     subtext: 'This week',        delta: '+8%',  up: true,  positive: true  },
  { label: 'Avg Response',    value: '1m 24s', subtext: 'vs 1m 42s prior',  delta: '−14%', up: false, positive: false },
  { label: 'Handoff Rate',    value: '6.2%',   subtext: 'of all convos',    delta: '−1.1pp', up: false, positive: false },
];

const hourlyData = [12, 8, 3, 1, 1, 2, 5, 18, 31, 42, 47, 38, 35, 41, 44, 49, 52, 46, 38, 29, 22, 18, 15, 13];

const channelBreakdown = [
  { label: 'Website Chat',  count: 412, pct: 49 },
  { label: 'SMS / Text',    count: 276, pct: 33 },
  { label: 'Facebook Lead', count: 110, pct: 13 },
  { label: 'Email Intake',  count:  49, pct:  6 },
];

const recentActivity = [
  { name: 'Marcus T.',  vehicle: '2024 Accord Sport',   action: 'Appointment booked',    time: '4m ago',  ok: true  },
  { name: 'Priya S.',   vehicle: '2025 CR-V Hybrid',    action: 'Active — awaiting reply',time: '11m ago', ok: null  },
  { name: 'James W.',   vehicle: '2023 Pilot TrailSport',action: 'Handed off to sales',   time: '28m ago', ok: false },
  { name: 'Dana L.',    vehicle: '2024 Ridgeline AWD',  action: 'Appointment booked',    time: '1h ago',  ok: true  },
  { name: 'Brendan H.', vehicle: '2024 Civic Type R',   action: 'Closed — no response',  time: '2h ago',  ok: null  },
];

const maxHourly = Math.max(...hourlyData);

export default function Dashboard() {
  return (
    <div className="min-h-full" style={{ backgroundColor: C.bg }}>
      {/* Page header */}
      <div
        className="flex items-center justify-between px-8 h-[58px] shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSub}`, backgroundColor: C.surface }}
      >
        <div>
          <h1 className="text-[15px] font-semibold" style={{ color: C.ink1 }}>
            Performance Overview
          </h1>
        </div>
        <button
          className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: C.raised, color: C.ink2, border: `1px solid ${C.border}` }}
        >
          <Calendar size={12} />
          Last 7 days
          <ChevronDown size={12} />
        </button>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* Metrics strip */}
        <div
          className="rounded-xl overflow-hidden grid grid-cols-4"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
        >
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="px-6 py-5"
              style={{ borderRight: i < metrics.length - 1 ? `1px solid ${C.border}` : 'none' }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.07em] mb-3" style={{ color: C.ink3 }}>
                {m.label}
              </p>
              <p
                className="text-[28px] font-semibold tracking-[-0.02em] leading-none mb-1.5"
                style={{ color: C.ink1, fontVariantNumeric: 'tabular-nums' }}
              >
                {m.value}
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className="flex items-center gap-0.5 text-[11px] font-medium"
                  style={{ color: m.up === m.positive ? C.ok : C.warn }}
                >
                  {m.up
                    ? <TrendingUp size={11} strokeWidth={2} />
                    : <TrendingDown size={11} strokeWidth={2} />
                  }
                  {m.delta}
                </span>
                <span className="text-[11px]" style={{ color: C.ink3 }}>{m.subtext}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main content row */}
        <div className="grid grid-cols-[1fr_280px] gap-5">

          {/* Hourly activity chart */}
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[13px] font-semibold" style={{ color: C.ink1 }}>
                  Lead Activity
                </h2>
                <p className="text-[12px] mt-0.5" style={{ color: C.ink3 }}>Conversations started by hour of day</p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: C.ink3 }}>
                <Clock size={11} />
                Today
              </div>
            </div>

            {/* Chart */}
            <div className="flex items-end gap-[3px]" style={{ height: 96 }}>
              {hourlyData.map((v, i) => {
                const heightPct = (v / maxHourly) * 100;
                const isBusiness = i >= 8 && i <= 19;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-opacity duration-100"
                    style={{
                      height: `${Math.max(heightPct, 4)}%`,
                      backgroundColor: isBusiness ? C.accent : C.raised,
                      opacity: isBusiness ? (0.3 + (v / maxHourly) * 0.7) : 0.4,
                    }}
                    title={`${i}:00 — ${v} leads`}
                  />
                );
              })}
            </div>

            {/* Hour labels */}
            <div className="flex mt-2 text-[10px]" style={{ color: C.ink3 }}>
              {['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p'].map((label, i) => (
                <span key={label} style={{ width: `${100 / 8}%` }}>{label}</span>
              ))}
            </div>
          </div>

          {/* Channel breakdown */}
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
          >
            <h2 className="text-[13px] font-semibold mb-1" style={{ color: C.ink1 }}>
              Channels
            </h2>
            <p className="text-[12px] mb-5" style={{ color: C.ink3 }}>By lead source this week</p>

            <div className="space-y-4">
              {channelBreakdown.map(ch => (
                <div key={ch.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-medium" style={{ color: C.ink2 }}>{ch.label}</span>
                    <span className="text-[12px]" style={{ color: C.ink3, fontVariantNumeric: 'tabular-nums' }}>
                      {ch.count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.raised }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${ch.pct}%`, backgroundColor: C.accent, opacity: 0.55 + ch.pct / 200 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
        >
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${C.borderSub}` }}
          >
            <h2 className="text-[13px] font-semibold" style={{ color: C.ink1 }}>Recent Activity</h2>
            <a href="/conversations" className="text-[12px] font-medium" style={{ color: C.accent }}>
              View all
            </a>
          </div>
          <table className="w-full">
            <tbody>
              {recentActivity.map((row, i) => (
                <tr
                  key={row.name}
                  style={{
                    borderBottom: i < recentActivity.length - 1 ? `1px solid ${C.borderSub}` : 'none',
                  }}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: C.accentDim, color: C.accent }}
                      >
                        {row.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: C.ink1 }}>{row.name}</p>
                        <p className="text-[11px]" style={{ color: C.ink3 }}>{row.vehicle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-[12px]" style={{ color: C.ink2 }}>{row.action}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="text-[11px]" style={{ color: C.ink3 }}>{row.time}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
