import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Users, SlidersHorizontal,
  Bot, Link2, ChevronDown,
} from 'lucide-react';

const C = {
  brand:     '#007AFF',
  nearBlk:   '#1D1D1F',
  darkGray:  '#3A3A3C',
  midGray:   '#8E8E93',
  surface:   '#F2F2F7',
  white:     '#FFFFFF',
  sidebar:   '#FAFAFA',
  border:    'rgba(0,0,0,0.08)',
  activeBg:  'rgba(0,122,255,0.07)',
  hoverBg:   'rgba(0,0,0,0.04)',
};

const dealers = [
  { id: '1', name: 'Premier Honda',       crm: 'VinSolutions'  },
  { id: '2', name: 'AutoNation Ford',     crm: 'DealerSocket'  },
  { id: '3', name: 'Hendrick Chevrolet',  crm: 'Reynolds'      },
];

const platformNav = [
  { to: '/dashboard',     icon: LayoutDashboard,  label: 'Dashboard'     },
  { to: '/conversations', icon: MessageSquare,     label: 'Conversations' },
  { to: '/leads',         icon: Users,             label: 'Leads'         },
  { to: '/settings',      icon: SlidersHorizontal, label: 'Settings'      },
];

const agentNav = [
  { to: '/agent-config', icon: Bot,   label: 'Agent config'  },
  { to: '/integrations', icon: Link2, label: 'Integrations'  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: C.midGray,
      padding: '0 12px',
      marginBottom: 4,
    }}>
      {children}
    </p>
  );
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink to={to} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 12px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 400,
            color: isActive ? C.brand : C.darkGray,
            backgroundColor: isActive ? C.activeBg : 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.1s',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = C.hoverBg;
          }}
          onMouseLeave={e => {
            if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }}
        >
          <Icon size={16} strokeWidth={1.6} style={{ flexShrink: 0 }} />
          <span>{label}</span>
        </span>
      )}
    </NavLink>
  );
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Layout() {
  const [activeDealer, setActiveDealer] = useState(dealers[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#F2F2F7' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        height: '100%',
        backgroundColor: C.sidebar,
        borderRight: `0.5px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: `0.5px solid ${C.border}`,
        }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: C.nearBlk, letterSpacing: '-0.3px' }}>
            Apex <span style={{ color: C.brand }}>AI</span>
          </span>
        </div>

        {/* Dealer switcher */}
        <div style={{ padding: '12px 12px 0', position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 10,
              backgroundColor: C.white,
              border: `0.5px solid ${C.border}`,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: C.brand,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 500,
              flexShrink: 0,
            }}>
              {initials(activeDealer.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: C.nearBlk, margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeDealer.name}
              </p>
              <p style={{ fontSize: 11, color: C.midGray, margin: 0, lineHeight: 1.3 }}>
                {activeDealer.crm}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: C.midGray }}>Switch</span>
              <ChevronDown size={12} style={{ color: C.midGray, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </div>
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              left: 12,
              right: 12,
              top: 'calc(100% + 4px)',
              backgroundColor: C.white,
              border: `0.5px solid ${C.border}`,
              borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              overflow: 'hidden',
              zIndex: 50,
            }}>
              {dealers.map(d => (
                <button
                  key={d.id}
                  onClick={() => { setActiveDealer(d); setDropdownOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    backgroundColor: activeDealer.id === d.id ? C.activeBg : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    backgroundColor: activeDealer.id === d.id ? C.brand : '#F2F2F7',
                    color: activeDealer.id === d.id ? '#FFFFFF' : C.midGray,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 500,
                    flexShrink: 0,
                  }}>
                    {initials(d.name)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: activeDealer.id === d.id ? 500 : 400, color: activeDealer.id === d.id ? C.brand : C.nearBlk, margin: 0 }}>
                      {d.name}
                    </p>
                    <p style={{ fontSize: 11, color: C.midGray, margin: 0 }}>{d.crm}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 8px 0' }}>
          <SectionLabel>Platform</SectionLabel>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}>
            {platformNav.map(item => <NavItem key={item.to} {...item} />)}
          </nav>

          <SectionLabel>Agent</SectionLabel>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {agentNav.map(item => <NavItem key={item.to} {...item} />)}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F2F2F7' }}>
        <Outlet />
      </main>
    </div>
  );
}
