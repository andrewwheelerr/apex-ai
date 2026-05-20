import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, SlidersHorizontal, ExternalLink } from 'lucide-react';

const C = {
  bg:         'oklch(11%  0.014 252)',
  surface:    'oklch(14%  0.017 252)',
  raised:     'oklch(19%  0.022 252)',
  border:     'oklch(22%  0.016 252)',
  accent:     'oklch(63%  0.225 240)',
  accentHi:   'oklch(70%  0.215 240)',
  accentDim:  'oklch(23%  0.055 240)',
  ink1:       'oklch(93%  0.008 252)',
  ink2:       'oklch(63%  0.012 252)',
  ink3:       'oklch(41%  0.010 252)',
};

const primaryNav = [
  { to: '/dashboard',     icon: LayoutDashboard,    label: 'Dashboard' },
  { to: '/conversations', icon: MessageSquare,       label: 'Conversations' },
];

const secondaryNav = [
  { to: '/settings', icon: SlidersHorizontal, label: 'Settings' },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <span
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-100 cursor-pointer"
          style={{
            color:           isActive ? C.accentHi : C.ink2,
            backgroundColor: isActive ? C.accentDim : 'transparent',
          }}
          onMouseEnter={e => {
            if (!isActive) {
              (e.currentTarget as HTMLElement).style.backgroundColor = C.raised;
              (e.currentTarget as HTMLElement).style.color = C.ink1;
            }
          }}
          onMouseLeave={e => {
            if (!isActive) {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = C.ink2;
            }
          }}
        >
          <Icon size={15} strokeWidth={1.8} />
          {label}
        </span>
      )}
    </NavLink>
  );
}

export default function Layout() {
  return (
    <div className="flex h-full" style={{ backgroundColor: C.bg }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col w-[216px] shrink-0 h-full"
        style={{ backgroundColor: C.surface, borderRight: `1px solid ${C.border}` }}
      >
        {/* Wordmark */}
        <div
          className="flex items-center gap-2.5 px-5 h-[58px] shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div
            className="flex items-center justify-center w-7 h-7 rounded-[6px] shrink-0"
            style={{ backgroundColor: C.accent }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5L13 12.5H1L7 1.5Z" fill="white" />
              <line x1="3.8" y1="8.8" x2="10.2" y2="8.8" stroke="white" strokeWidth="1.4" />
            </svg>
          </div>
          <span
            className="text-[14px] font-semibold tracking-[-0.01em]"
            style={{ color: C.ink1 }}
          >
            Apex AI
          </span>
          <span
            className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: C.accentDim, color: C.accent }}
          >
            Beta
          </span>
        </div>

        {/* Section label */}
        <div className="px-5 pt-5 pb-1.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: C.ink3 }}
          >
            Platform
          </span>
        </div>

        {/* Primary nav */}
        <nav className="px-2.5 space-y-0.5">
          {primaryNav.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom nav */}
        <div
          className="px-2.5 pt-3 pb-2"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          {secondaryNav.map(item => <NavItem key={item.to} {...item} />)}
        </div>

        {/* Dealer identity */}
        <div
          className="mx-3 mb-4 p-3 rounded-lg flex items-center gap-2.5"
          style={{ backgroundColor: C.raised }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ backgroundColor: C.accentDim, color: C.accent }}
          >
            PH
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium truncate" style={{ color: C.ink1 }}>
              Premier Honda
            </p>
            <p className="text-[11px] truncate" style={{ color: C.ink3 }}>
              VinSolutions
            </p>
          </div>
          <ExternalLink size={12} style={{ color: C.ink3, flexShrink: 0 }} />
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 overflow-auto" style={{ backgroundColor: C.bg }}>
        <Outlet />
      </main>
    </div>
  );
}
