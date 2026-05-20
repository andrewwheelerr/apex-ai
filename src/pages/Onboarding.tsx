import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';

const C = {
  bg:        'oklch(10%  0.013 252)',
  surface:   'oklch(14%  0.017 252)',
  raised:    'oklch(18%  0.021 252)',
  border:    'oklch(26%  0.019 252)',
  accent:    'oklch(63%  0.225 240)',
  accentHi:  'oklch(70%  0.215 240)',
  accentDim: 'oklch(22%  0.052 240)',
  ink1:      'oklch(93%  0.008 252)',
  ink2:      'oklch(63%  0.012 252)',
  ink3:      'oklch(41%  0.010 252)',
};

const crmOptions = [
  'VinSolutions',
  'DealerSocket',
  'CDK Drive',
  'Elead / CDK CRM',
  'Reynolds & Reynolds',
  'DealerTrack',
  'Other',
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium mb-1.5" style={{ color: C.ink2 }}>{label}</label>
      {children}
      {hint && <p className="text-[11px] mt-1.5" style={{ color: C.ink3 }}>{hint}</p>}
    </div>
  );
}

const inputStyle = (focused: boolean) => ({
  backgroundColor: C.raised,
  border: `1px solid ${focused ? C.accent : C.border}`,
  color: C.ink1,
  outline: 'none',
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  fontSize: '13px',
  transition: 'border-color 100ms',
  fontFamily: 'inherit',
});

function TextInput({
  value, onChange, placeholder, type = 'text',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle(focused)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle(focused), appearance: 'none', cursor: 'pointer' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <option value="" disabled>Select CRM...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

const steps = ['Dealership', 'Agent Setup', 'Go Live'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [dealerName,  setDealerName]  = useState('');
  const [crm,         setCrm]         = useState('');
  const [agentName,   setAgentName]   = useState('');
  const [hoursStart,  setHoursStart]  = useState('09:00');
  const [hoursEnd,    setHoursEnd]    = useState('20:00');
  const [escEmail,    setEscEmail]    = useState('');

  function canAdvance() {
    if (step === 0) return dealerName.trim() !== '' && crm !== '';
    if (step === 1) return agentName.trim() !== '' && escEmail.trim() !== '';
    return true;
  }

  function advance() {
    if (step < steps.length - 1) setStep(s => s + 1);
    else navigate('/dashboard');
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: C.bg }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-[7px]"
          style={{ backgroundColor: C.accent }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5L13 12.5H1L7 1.5Z" fill="white" />
            <line x1="3.8" y1="8.8" x2="10.2" y2="8.8" stroke="white" strokeWidth="1.4" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: C.ink1 }}>
          Apex AI
        </span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => {
          const done   = i < step;
          const active = i === step;
          return (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-200"
                  style={{
                    backgroundColor: done ? C.accent : active ? C.accentDim : C.raised,
                    color:           done ? 'white'  : active ? C.accent    : C.ink3,
                    border:          active ? `1.5px solid ${C.accent}` : 'none',
                  }}
                >
                  {done ? <Check size={10} strokeWidth={2.5} color="white" /> : i + 1}
                </div>
                <span
                  className="text-[12px] font-medium"
                  style={{ color: active ? C.ink1 : done ? C.ink2 : C.ink3 }}
                >
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-10 h-px"
                  style={{ backgroundColor: i < step ? C.accent : C.border }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Card */}
      <div
        className="w-full max-w-[480px] rounded-2xl p-8"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        {step === 0 && (
          <>
            <h1 className="text-[18px] font-semibold mb-1 tracking-[-0.01em]" style={{ color: C.ink1 }}>
              Set up your dealership
            </h1>
            <p className="text-[13px] mb-6" style={{ color: C.ink3 }}>
              This takes about 3 minutes. You can change everything later.
            </p>

            <div className="space-y-4">
              <Field label="Dealership Name">
                <TextInput
                  value={dealerName}
                  onChange={setDealerName}
                  placeholder="e.g. Premier Honda of Springfield"
                />
              </Field>

              <Field label="CRM Platform" hint="Used to sync lead records and appointments automatically.">
                <Select value={crm} onChange={setCrm} options={crmOptions} />
              </Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-[18px] font-semibold mb-1 tracking-[-0.01em]" style={{ color: C.ink1 }}>
              Configure your agent
            </h1>
            <p className="text-[13px] mb-6" style={{ color: C.ink3 }}>
              Your AI agent will use these settings in every conversation.
            </p>

            <div className="space-y-4">
              <Field label="Agent Name" hint="Customers will see this in their messages.">
                <TextInput
                  value={agentName}
                  onChange={setAgentName}
                  placeholder="e.g. Nova, Alex, Max"
                />
              </Field>

              <Field label="Business Hours">
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={hoursStart}
                    onChange={e => setHoursStart(e.target.value)}
                    style={{ ...inputStyle(false), width: 'auto', flex: 1 }}
                  />
                  <span className="text-[12px] shrink-0" style={{ color: C.ink3 }}>to</span>
                  <input
                    type="time"
                    value={hoursEnd}
                    onChange={e => setHoursEnd(e.target.value)}
                    style={{ ...inputStyle(false), width: 'auto', flex: 1 }}
                  />
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: C.ink3 }}>
                  Outside these hours, Nova will set expectations about response times.
                </p>
              </Field>

              <Field label="Escalation Email" hint="Sales alerts and handoff summaries are sent here.">
                <TextInput
                  type="email"
                  value={escEmail}
                  onChange={setEscEmail}
                  placeholder="sales@yourdealership.com"
                />
              </Field>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="text-center py-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: C.accentDim }}
            >
              <Check size={22} style={{ color: C.accent }} strokeWidth={2.5} />
            </div>
            <h1
              className="text-[18px] font-semibold mb-2 tracking-[-0.01em]"
              style={{ color: C.ink1 }}
            >
              You're ready to go
            </h1>
            <p className="text-[13px] mb-2" style={{ color: C.ink3 }}>
              <strong style={{ color: C.ink2 }}>{dealerName || 'Your dealership'}</strong> is configured
              with <strong style={{ color: C.ink2 }}>{agentName || 'Nova'}</strong> as your AI agent.
            </p>
            <p className="text-[12px]" style={{ color: C.ink3 }}>
              Lead notifications will go to {escEmail || 'your team'}. You can adjust everything in Settings.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-7">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-[13px] font-medium px-4 py-2 rounded-lg transition-colors duration-100"
              style={{ color: C.ink2, backgroundColor: C.raised, border: `1px solid ${C.border}` }}
            >
              Back
            </button>
          ) : (
            <span />
          )}

          <button
            onClick={advance}
            disabled={!canAdvance()}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-5 py-2 rounded-lg transition-opacity duration-100"
            style={{
              backgroundColor: C.accent,
              color: 'oklch(97% 0.005 240)',
              opacity: canAdvance() ? 1 : 0.4,
              cursor: canAdvance() ? 'pointer' : 'default',
            }}
          >
            {step === steps.length - 1 ? 'Open Dashboard' : 'Continue'}
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-[11px] mt-6" style={{ color: C.ink3 }}>
        Need help? Email us at <span style={{ color: C.accent }}>support@apexai.co</span>
      </p>
    </div>
  );
}
