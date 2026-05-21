import React, { useState } from 'react';
import { Check, Bell, Building2, Bot } from 'lucide-react';

const C = {
  brand:    '#007AFF',
  nearBlk:  '#1D1D1F',
  darkGray: '#3A3A3C',
  midGray:  '#8E8E93',
  surface:  '#F2F2F7',
  white:    '#FFFFFF',
  border:   'rgba(0,0,0,0.08)',
  success:  '#34C759',
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.darkGray, marginBottom: 6 }}>
        {label}
        {hint && <span style={{ fontSize: 12, fontWeight: 400, color: C.midGray, marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  borderRadius: 10, border: `0.5px solid rgba(0,0,0,0.12)`,
  backgroundColor: C.white,
  fontSize: 15, color: C.nearBlk, outline: 'none',
  fontFamily: 'inherit',
};

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, borderColor: focused ? C.brand : 'rgba(0,0,0,0.12)' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, borderColor: focused ? C.brand : 'rgba(0,0,0,0.12)', appearance: 'none', cursor: 'pointer' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
      <span style={{ fontSize: 14, color: C.nearBlk }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 24, borderRadius: 12,
          backgroundColor: checked ? C.brand : 'rgba(0,0,0,0.12)',
          position: 'relative', transition: 'background-color 0.15s', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 19 : 3,
          width: 18, height: 18, borderRadius: '50%', backgroundColor: C.white,
          transition: 'left 0.15s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
      </div>
    </label>
  );
}

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
        fontSize: 14, fontWeight: 500,
        backgroundColor: saved ? 'rgba(52,199,89,0.12)' : C.brand,
        color: saved ? C.success : '#FFFFFF',
        transition: 'all 0.15s',
      }}
    >
      {saved && <Check size={14} strokeWidth={2} />}
      {saved ? 'Saved' : 'Save changes'}
    </button>
  );
}

function SectionCard({ icon: Icon, title, description, children, onSave, saved }: {
  icon: React.ElementType; title: string; description: string;
  children: React.ReactNode; onSave: () => void; saved: boolean;
}) {
  return (
    <div style={{
      backgroundColor: C.white, borderRadius: 10, border: `0.5px solid ${C.border}`,
      overflow: 'hidden', marginBottom: 16,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '18px 24px', borderBottom: `0.5px solid ${C.border}`,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          backgroundColor: 'rgba(0,122,255,0.10)', color: C.brand,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} strokeWidth={1.6} />
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 500, color: C.nearBlk, margin: 0 }}>{title}</p>
          <p style={{ fontSize: 13, color: C.midGray, margin: 0 }}>{description}</p>
        </div>
      </div>
      <div style={{ padding: 24 }}>
        {children}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: `0.5px solid ${C.border}` }}>
          <SaveButton saved={saved} onClick={onSave} />
        </div>
      </div>
    </div>
  );
}

type Tone = 'friendly' | 'professional' | 'direct';

export default function Settings() {
  // Dealership Info
  const [dealerName, setDealerName]   = useState('Premier Honda');
  const [address, setAddress]         = useState('4400 Stevens Creek Blvd, San Jose, CA 95129');
  const [phone, setPhone]             = useState('(408) 985-1000');
  const [website, setWebsite]         = useState('www.premierhonda.com');
  const [timezone, setTimezone]       = useState('America/Los_Angeles');
  const [saved1, setSaved1]           = useState(false);

  // AI Agent Settings
  const [agentName, setAgentName]     = useState('Nova');
  const [tone, setTone]               = useState<Tone>('friendly');
  const [greeting, setGreeting]       = useState("Hi! I'm Nova from Premier Honda. I can help you find the right vehicle, check availability, or schedule a test drive — what are you looking for today?");
  const [escEmail, setEscEmail]       = useState('sales@premierhonda.com');
  const [saved2, setSaved2]           = useState(false);

  // Notification Preferences
  const [notifNewLead, setNotifNewLead]           = useState(true);
  const [notifHandoff, setNotifHandoff]           = useState(true);
  const [notifAppt, setNotifAppt]                 = useState(true);
  const [notifWeekly, setNotifWeekly]             = useState(false);
  const [notifEmail, setNotifEmail]               = useState('manager@premierhonda.com');
  const [saved3, setSaved3]                       = useState(false);

  function save(set: (v: boolean) => void) {
    set(true);
    setTimeout(() => set(false), 2200);
  }

  const toneOptions: { value: Tone; label: string; desc: string }[] = [
    { value: 'friendly',     label: 'Friendly',      desc: 'Warm and conversational'     },
    { value: 'professional', label: 'Professional',  desc: 'Polished and confident'      },
    { value: 'direct',       label: 'Direct',        desc: 'Concise, high-volume ready'  },
  ];

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#F2F2F7' }}>
      <div style={{ padding: '28px 32px 0', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 500, color: C.nearBlk, letterSpacing: '-0.5px', margin: 0 }}>
          Settings
        </h1>
      </div>

      {/* Two-column layout */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16,
        padding: '0 32px 32px', alignItems: 'start',
      }}>
        {/* Left column */}
        <div>
          <SectionCard
            icon={Building2}
            title="Dealership Info"
            description="Your dealership's public-facing details"
            onSave={() => save(setSaved1)}
            saved={saved1}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Dealership name">
                  <Input value={dealerName} onChange={setDealerName} placeholder="e.g. Premier Honda" />
                </Field>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Address">
                  <Input value={address} onChange={setAddress} placeholder="Street address" />
                </Field>
              </div>
              <Field label="Phone number">
                <Input value={phone} onChange={setPhone} placeholder="(000) 000-0000" type="tel" />
              </Field>
              <Field label="Website">
                <Input value={website} onChange={setWebsite} placeholder="www.yourdealership.com" />
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Timezone">
                  <Select
                    value={timezone}
                    onChange={setTimezone}
                    options={[
                      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                      { value: 'America/Denver',      label: 'Mountain Time (MT)' },
                      { value: 'America/Chicago',     label: 'Central Time (CT)' },
                      { value: 'America/New_York',    label: 'Eastern Time (ET)' },
                    ]}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={Bot}
            title="AI Agent Settings"
            description="How Nova presents itself to customers"
            onSave={() => save(setSaved2)}
            saved={saved2}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Agent name">
                  <Input value={agentName} onChange={setAgentName} placeholder="e.g. Nova, Alex" />
                </Field>
                <Field label="Escalation email">
                  <Input value={escEmail} onChange={setEscEmail} type="email" placeholder="sales@dealership.com" />
                </Field>
              </div>

              <Field label="Conversation tone">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 2 }}>
                  {toneOptions.map(opt => {
                    const active = tone === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTone(opt.value)}
                        style={{
                          padding: '12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                          backgroundColor: active ? 'rgba(0,122,255,0.07)' : C.surface,
                          border: `0.5px solid ${active ? C.brand : C.border}`,
                        }}
                      >
                        <p style={{ fontSize: 13, fontWeight: 500, color: active ? C.brand : C.nearBlk, margin: '0 0 3px' }}>
                          {opt.label}
                        </p>
                        <p style={{ fontSize: 12, color: C.midGray, margin: 0, lineHeight: 1.4 }}>
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Opening message" hint="— sent at conversation start">
                <textarea
                  value={greeting}
                  onChange={e => setGreeting(e.target.value)}
                  rows={4}
                  style={{
                    ...inputStyle, resize: 'none', lineHeight: 1.55,
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = C.brand)}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)')}
                />
                <p style={{ fontSize: 12, color: C.midGray, margin: '4px 0 0', textAlign: 'right' }}>
                  {greeting.length} chars
                </p>
              </Field>
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div>
          <SectionCard
            icon={Bell}
            title="Notification Preferences"
            description="When to send alerts to your team"
            onSave={() => save(setSaved3)}
            saved={saved3}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Alert email address">
                <Input value={notifEmail} onChange={setNotifEmail} type="email" placeholder="manager@dealership.com" />
              </Field>

              <div style={{ paddingTop: 4 }}>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.midGray, margin: '0 0 12px' }}>
                  Alert triggers
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Toggle checked={notifNewLead}  onChange={setNotifNewLead}  label="New lead received"      />
                  <Toggle checked={notifHandoff}  onChange={setNotifHandoff}  label="Conversation handed off" />
                  <Toggle checked={notifAppt}     onChange={setNotifAppt}     label="Appointment booked"     />
                  <Toggle checked={notifWeekly}   onChange={setNotifWeekly}   label="Weekly performance digest" />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
