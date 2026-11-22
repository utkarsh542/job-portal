import React, { useState } from 'react';
import { Paperclip, RotateCcw, Save, Settings } from 'lucide-react';
import { toast } from '../../toast';
import { ROLE_LABEL, ROLE_COLOR, RESUME_FILE, getCreds, saveCreds, saveTemplate, resetTemplate, type Role, type TemplateKind, type SendStatus } from '../../lib/core';

/** Gmail + App password, shared by all pages. Collapsed by default. */
export const CredsBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(() => getCreds().user);
  const [pass, setPass] = useState(() => getCreds().pass);
  return (
    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
      <button type="button" className="chip" onClick={() => setOpen(o => !o)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.7rem' }}>
        <Settings size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />
        Sending from {user}
      </button>
      {open && (
        <div className="row" style={{ marginTop: '0.6rem' }}>
          <input className="search-input" style={{ flex: 1, minWidth: 200 }} value={user} onChange={e => setUser(e.target.value)} placeholder="Gmail address" />
          <input className="search-input" style={{ flex: 1, minWidth: 200 }} type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Gmail App Password" />
          <button type="button" className="btn-primary btn-sm" onClick={() => { saveCreds(user, pass); setOpen(false); toast.success('Gmail settings saved'); }}>Save</button>
        </div>
      )}
    </div>
  );
};

/** Backend & AI / Python Backend switch */
export const RolePicker: React.FC<{ value: Role; onChange: (r: Role) => void }> = ({ value, onChange }) => (
  <div className="seg">
    {(['ai', 'backend'] as Role[]).map(r => (
      <button key={r} type="button" className={value === r ? 'on' : ''} onClick={() => onChange(r)} style={value === r ? { color: ROLE_COLOR[r] } : undefined}>
        {ROLE_LABEL[r]}
      </button>
    ))}
  </div>
);

/** Which resume to attach */
export const ResumePicker: React.FC<{ value: Role | 'none'; onChange: (r: Role | 'none') => void }> = ({ value, onChange }) => (
  <div className="row" style={{ gap: '0.5rem' }}>
    <Paperclip size={15} style={{ color: '#10b981' }} />
    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Resume:</span>
    <div className="seg">
      {(['ai', 'backend', 'none'] as const).map(r => (
        <button key={r} type="button" className={value === r ? 'on' : ''} onClick={() => onChange(r)}>
          {r === 'none' ? 'No resume' : `${ROLE_LABEL[r]} (${RESUME_FILE[r]})`}
        </button>
      ))}
    </div>
  </div>
);

/** Subject + message editor with "save as default" / "reset" for the role */
export const TemplateEditor: React.FC<{
  kind: TemplateKind;
  role: Role;
  subject: string;
  body: string;
  onChange: (t: { subject: string; body: string }) => void;
  rows?: number;
}> = ({ kind, role, subject, body, onChange, rows = 10 }) => (
  <div className="stack" style={{ gap: '0.6rem' }}>
    <div>
      <label className="modal-label">Subject</label>
      <input className="search-input" value={subject} onChange={e => onChange({ subject: e.target.value, body })} />
    </div>
    <div>
      <label className="modal-label">Message</label>
      <textarea className="search-input" rows={rows} value={body} onChange={e => onChange({ subject, body: e.target.value })} style={{ fontSize: '0.85rem' }} />
    </div>
    <div className="row" style={{ gap: '0.5rem' }}>
      <button type="button" className="btn-secondary btn-sm" onClick={() => { saveTemplate(kind, role, { subject, body }); toast.success(`Saved as default ${ROLE_LABEL[role]} ${kind === 'followup' ? 'follow-up' : 'apply'} mail`); }}>
        <Save size={13} /> Save as default for {ROLE_LABEL[role]}
      </button>
      <button type="button" className="btn-secondary btn-sm" onClick={() => { onChange(resetTemplate(kind, role)); toast.info('Reset to original template'); }}>
        <RotateCcw size={13} /> Reset
      </button>
    </div>
  </div>
);

export const StatusText: React.FC<{ status?: SendStatus; error?: string }> = ({ status, error }) => {
  if (!status || status === 'pending') return null;
  const label = status === 'sent' ? 'Sent ✓' : status === 'failed' ? 'Failed' : 'Sending…';
  return <span className={`status-${status}`} title={error} style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>;
};
