import React, { useState } from 'react';
import { Check, Info } from 'lucide-react';

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
};

type Tone = 'friendly' | 'professional' | 'direct';

const toneOptions: { value: Tone; label: string; desc: string }[] = [
  { value: 'friendly',     label: 'Friendly',     desc: 'Warm, conversational — feels like a helpful person, not a bot.'   },
  { value: 'professional', label: 'Professional',  desc: 'Polished and confident — matches a premium dealership experience.' },
  { value: 'direct',       label: 'Direct',        desc: 'Concise and efficient — best for high-volume response speed.'     },
];

const escalationKeywords = ['lawsuit', 'BBB', 'manager', 'refund', 'cancel', 'complaint'];

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[13px] font-semibold mb-1" style={{ color: C.ink1 }}>{title}</h2>
      <p className="text-[12px]" style={{ color: C.ink3 }}>{description}</p>
    </div>
  );
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <label className="text-[12px] font-medium" style={{ color: C.ink2 }}>{children}</label>
      {hint && (
        <span title={hint}>
          <Info size={11} style={{ color: C.ink3 }} />
        </span>
      )}
    </div>
  );
}

function Input({
  value, onChange, placeholder, type = 'text',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg text-[13px] outline-none transition-colors duration-100 placeholder:text-[13px]"
      style={{
        backgroundColor: C.raised,
        border: `1px solid ${C.border}`,
        color: C.ink1,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = C.accent; }}
      onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
    />
  );
}

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-150"
      style={{
        backgroundColor: saved ? C.okDim : C.accent,
        color:           saved ? C.ok   : 'oklch(97% 0.005 240)',
      }}
    >
      {saved && <Check size={13} />}
      {saved ? 'Saved' : 'Save changes'}
    </button>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
    >
      {children}
    </div>
  );
}

export default function Settings() {
  const [tone, setTone]             = useState<Tone>('friendly');
  const [agentName, setAgentName]   = useState('Nova');
  const [greeting, setGreeting]     = useState(
    "Hi! I'm Nova, your Premier Honda assistant. I can help you find the right vehicle, check availability, or schedule a test drive. What are you looking for today?"
  );
  const [escEmail, setEscEmail]     = useState('sales@premierhonda.com');
  const [escAfter, setEscAfter]     = useState('3');
  const [keywords, setKeywords]     = useState(escalationKeywords);
  const [newKw, setNewKw]           = useState('');

  const [saved1, setSaved1] = useState(false);
  const [saved2, setSaved2] = useState(false);
  const [saved3, setSaved3] = useState(false);

  function save(setSaved: (v: boolean) => void) {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  function addKeyword() {
    const kw = newKw.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) setKeywords(prev => [...prev, kw]);
    setNewKw('');
  }

  return (
    <div className="min-h-full" style={{ backgroundColor: C.bg }}>
      {/* Header */}
      <div
        className="flex items-center px-8 h-[58px] shrink-0"
        style={{ borderBottom: `1px solid ${C.borderSub}`, backgroundColor: C.surface }}
      >
        <h1 className="text-[15px] font-semibold" style={{ color: C.ink1 }}>Agent Settings</h1>
      </div>

      <div className="px-8 py-6 max-w-[720px] space-y-5">

        {/* Section 1: Persona */}
        <Section>
          <SectionHeader
            title="Agent Persona"
            description="Configure how Nova presents itself during conversations."
          />

          <div className="space-y-5">
            <div>
              <Label>Agent Name</Label>
              <Input value={agentName} onChange={setAgentName} placeholder="e.g. Nova, Alex, Max" />
              <p className="text-[11px] mt-1.5" style={{ color: C.ink3 }}>
                Customers will see this name in every message.
              </p>
            </div>

            <div>
              <Label hint="Controls word choice and sentence structure across all responses.">
                Conversation Tone
              </Label>
              <div className="grid grid-cols-3 gap-2.5 mt-1">
                {toneOptions.map(opt => {
                  const active = tone === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTone(opt.value)}
                      className="text-left p-3.5 rounded-lg transition-colors duration-100"
                      style={{
                        backgroundColor: active ? C.accentDim : C.raised,
                        border:          `1px solid ${active ? C.accent : C.border}`,
                      }}
                    >
                      <p
                        className="text-[12px] font-semibold mb-1"
                        style={{ color: active ? C.accentHi : C.ink1 }}
                      >
                        {opt.label}
                      </p>
                      <p className="text-[11px] leading-[1.45]" style={{ color: C.ink3 }}>
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <SaveButton saved={saved1} onClick={() => save(setSaved1)} />
          </div>
        </Section>

        {/* Section 2: Greeting */}
        <Section>
          <SectionHeader
            title="Greeting Message"
            description="Sent automatically when a new conversation starts."
          />

          <div>
            <Label>Opening message</Label>
            <textarea
              value={greeting}
              onChange={e => setGreeting(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none leading-relaxed transition-colors duration-100"
              style={{
                backgroundColor: C.raised,
                border: `1px solid ${C.border}`,
                color: C.ink1,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = C.accent; }}
              onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[11px]" style={{ color: C.ink3 }}>
                Use {'{dealership}'} or {'{agent_name}'} as placeholders.
              </p>
              <p className="text-[11px]" style={{ color: C.ink3 }}>{greeting.length} chars</p>
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <SaveButton saved={saved2} onClick={() => save(setSaved2)} />
          </div>
        </Section>

        {/* Section 3: Escalation */}
        <Section>
          <SectionHeader
            title="Escalation Rules"
            description="Define when Nova hands a conversation to your sales team."
          />

          <div className="space-y-5">
            <div>
              <Label hint="Escalation alerts and summaries are sent here.">Escalation Email</Label>
              <Input
                type="email"
                value={escEmail}
                onChange={setEscEmail}
                placeholder="sales@yourdealership.com"
              />
            </div>

            <div>
              <Label hint="If the customer doesn't reply within this many follow-ups, escalate to a human.">
                Escalate after unanswered messages
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={escAfter}
                  onChange={e => setEscAfter(e.target.value)}
                  className="w-20 px-3 py-2 rounded-lg text-[13px] outline-none text-center transition-colors duration-100"
                  style={{
                    backgroundColor: C.raised,
                    border: `1px solid ${C.border}`,
                    color: C.ink1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = C.accent; }}
                  onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
                />
                <span className="text-[12px]" style={{ color: C.ink3 }}>messages with no reply</span>
              </div>
            </div>

            <div>
              <Label hint="If any of these words appear, Nova will immediately hand off to a human.">
                Escalation Keywords
              </Label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {keywords.map(kw => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md"
                    style={{ backgroundColor: C.raised, color: C.ink2, border: `1px solid ${C.border}` }}
                  >
                    {kw}
                    <button
                      onClick={() => setKeywords(prev => prev.filter(k => k !== kw))}
                      className="ml-0.5 leading-none"
                      style={{ color: C.ink3 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKw}
                  onChange={e => setNewKw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addKeyword()}
                  placeholder="Add keyword..."
                  className="flex-1 max-w-[200px] px-3 py-2 rounded-lg text-[12px] outline-none transition-colors duration-100 placeholder:text-[12px]"
                  style={{
                    backgroundColor: C.raised,
                    border: `1px solid ${C.border}`,
                    color: C.ink1,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = C.accent; }}
                  onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
                />
                <button
                  onClick={addKeyword}
                  className="px-3 py-2 rounded-lg text-[12px] font-medium transition-colors duration-100"
                  style={{ backgroundColor: C.raised, color: C.ink2, border: `1px solid ${C.border}` }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <SaveButton saved={saved3} onClick={() => save(setSaved3)} />
          </div>
        </Section>

      </div>
    </div>
  );
}
