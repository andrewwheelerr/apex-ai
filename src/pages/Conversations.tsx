import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

const C = {
  bg:        'oklch(11%  0.014 252)',
  surface:   'oklch(15%  0.018 252)',
  raised:    'oklch(19%  0.022 252)',
  high:      'oklch(24%  0.026 252)',
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
  err:       'oklch(62%  0.185 27)',
  errDim:    'oklch(19%  0.048 27)',
};

type Status = 'active' | 'handed_off' | 'closed';

interface Conversation {
  id: string;
  contact: string;
  vehicle: string;
  preview: string;
  status: Status;
  agent: string;
  time: string;
  source: string;
}

const conversations: Conversation[] = [
  { id: '1', contact: 'Marcus T.',    vehicle: '2024 Accord Sport',     preview: 'Sounds good — I can do Tuesday at 11am.',             status: 'active',     agent: 'Nova', time: '4m ago',    source: 'Website'  },
  { id: '2', contact: 'Priya S.',     vehicle: '2025 CR-V Hybrid',      preview: 'What financing options do you have for that trim?',   status: 'active',     agent: 'Nova', time: '11m ago',   source: 'SMS'      },
  { id: '3', contact: 'James W.',     vehicle: '2023 Pilot TrailSport', preview: 'I need to speak with someone about the trade value.', status: 'handed_off', agent: 'Nova', time: '28m ago',   source: 'Facebook' },
  { id: '4', contact: 'Dana L.',      vehicle: '2024 Ridgeline AWD',    preview: 'Thanks, see you Saturday morning!',                  status: 'closed',     agent: 'Nova', time: '1h ago',    source: 'Website'  },
  { id: '5', contact: 'Brendan H.',   vehicle: '2024 Civic Type R',     preview: 'Is the Type R still in stock?',                      status: 'closed',     agent: 'Nova', time: '2h ago',    source: 'SMS'      },
  { id: '6', contact: 'Tanya M.',     vehicle: '2024 Passport Elite',   preview: 'Do you have it in Sonic Gray?',                      status: 'active',     agent: 'Nova', time: '3h ago',    source: 'Website'  },
  { id: '7', contact: 'Raj P.',       vehicle: '2025 Odyssey EX-L',     preview: 'How long does financing approval usually take?',     status: 'handed_off', agent: 'Nova', time: '4h ago',    source: 'Email'    },
  { id: '8', contact: 'Sarah K.',     vehicle: '2024 HR-V Sport',       preview: 'Okay, I will stop by after work on Friday.',         status: 'closed',     agent: 'Nova', time: '5h ago',    source: 'SMS'      },
  { id: '9', contact: 'Elijah F.',    vehicle: '2023 Accord Hybrid',    preview: 'Can you match the price I got from the other dealer?',status: 'closed',    agent: 'Nova', time: '6h ago',    source: 'Website'  },
  { id: '10',contact: 'Monique D.',   vehicle: '2024 Prologue AWD',     preview: 'I had no idea Honda made an EV — tell me more.',     status: 'active',     agent: 'Nova', time: '7h ago',    source: 'Facebook' },
];

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  active:     { label: 'Active',      color: C.accent,  bg: C.accentDim  },
  handed_off: { label: 'Handed Off',  color: C.warn,    bg: C.warnDim    },
  closed:     { label: 'Closed',      color: C.ink3,    bg: C.raised     },
};

const filterOptions: { key: Status | 'all'; label: string }[] = [
  { key: 'all',        label: 'All'        },
  { key: 'active',     label: 'Active'     },
  { key: 'handed_off', label: 'Handed Off' },
  { key: 'closed',     label: 'Closed'     },
];

export default function Conversations() {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<Status | 'all'>('all');
  const [hovered, setHovered] = useState<string | null>(null);

  const visible = conversations.filter(c => {
    const matchSearch = search === '' ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicle.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all:        conversations.length,
    active:     conversations.filter(c => c.status === 'active').length,
    handed_off: conversations.filter(c => c.status === 'handed_off').length,
    closed:     conversations.filter(c => c.status === 'closed').length,
  };

  return (
    <div className="min-h-full" style={{ backgroundColor: C.bg }}>
      {/* Header */}
      <div
        className="flex items-center gap-4 px-8 h-[58px] shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSub}`, backgroundColor: C.surface }}
      >
        <h1 className="text-[15px] font-semibold" style={{ color: C.ink1 }}>Conversations</h1>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: C.accentDim, color: C.accent }}
        >
          {conversations.filter(c => c.status === 'active').length} active
        </span>
      </div>

      <div className="px-8 pt-5 pb-8">
        {/* Controls */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-[320px]"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
          >
            <Search size={13} style={{ color: C.ink3 }} />
            <input
              type="text"
              placeholder="Search by name or vehicle..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-[13px] w-full placeholder:text-[13px]"
              style={{ color: C.ink1 }}
            />
          </div>

          {/* Filter tabs */}
          <div
            className="flex items-center p-0.5 rounded-lg gap-0.5"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
          >
            {filterOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors duration-100"
                style={{
                  backgroundColor: filter === opt.key ? C.raised : 'transparent',
                  color:           filter === opt.key ? C.ink1 : C.ink3,
                }}
              >
                {opt.label}
                <span
                  className="ml-1.5 text-[10px]"
                  style={{ color: filter === opt.key ? C.ink2 : C.ink3 }}
                >
                  {counts[opt.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
        >
          {/* Column headers */}
          <div
            className="grid px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.07em]"
            style={{
              gridTemplateColumns: '2fr 2fr 3fr 100px 80px 90px',
              color: C.ink3,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <span>Contact</span>
            <span>Vehicle</span>
            <span>Last Message</span>
            <span>Status</span>
            <span>Source</span>
            <span className="text-right">Time</span>
          </div>

          {/* Rows */}
          {visible.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px]" style={{ color: C.ink3 }}>
              No conversations match your search.
            </div>
          ) : (
            visible.map((row, i) => {
              const sc = statusConfig[row.status];
              const isLast = i === visible.length - 1;
              const isHovered = hovered === row.id;
              return (
                <div
                  key={row.id}
                  className="grid px-5 py-3.5 cursor-pointer transition-colors duration-75"
                  style={{
                    gridTemplateColumns: '2fr 2fr 3fr 100px 80px 90px',
                    borderBottom: isLast ? 'none' : `1px solid ${C.borderSub}`,
                    backgroundColor: isHovered ? C.raised : 'transparent',
                  }}
                  onMouseEnter={() => setHovered(row.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Contact */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-4">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: C.accentDim, color: C.accent }}
                    >
                      {row.contact.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-[13px] font-medium truncate" style={{ color: C.ink1 }}>
                      {row.contact}
                    </span>
                  </div>

                  {/* Vehicle */}
                  <div className="flex items-center pr-4 min-w-0">
                    <span className="text-[12px] truncate" style={{ color: C.ink2 }}>{row.vehicle}</span>
                  </div>

                  {/* Preview */}
                  <div className="flex items-center pr-4 min-w-0">
                    <span className="text-[12px] truncate" style={{ color: C.ink3 }}>"{row.preview}"</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md"
                      style={{ backgroundColor: sc.bg, color: sc.color }}
                    >
                      {row.status === 'active' && (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: sc.color }}
                        />
                      )}
                      {sc.label}
                    </span>
                  </div>

                  {/* Source */}
                  <div className="flex items-center">
                    <span className="text-[12px]" style={{ color: C.ink3 }}>{row.source}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center justify-end">
                    <span className="text-[11px]" style={{ color: C.ink3 }}>{row.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
