import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Square, Trash2 } from 'lucide-react';
import { toast } from '../../toast';
import { extractEmails, getTemplate, sendMail, sendMany, takeApplyPrefill, ROLE_LABEL, type Role, type SendStatus } from '../../lib/core';
import { CredsBar, ResumePicker, RolePicker, StatusText, TemplateEditor } from './Shared';

const BULK_KEY = 'sheetSync_bulkPastedEmails';

/** Single + Bulk apply. Role sets the default subject/message/resume; all three can be changed per send. */
export const ApplyPage: React.FC = () => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [role, setRole] = useState<Role>(() => (localStorage.getItem('sheetSync_bulkRole') === 'backend' ? 'backend' : 'ai'));
  const [resume, setResume] = useState<Role | 'none'>(role);
  const [tpl, setTpl] = useState(() => getTemplate('fresh', role));

  const [to, setTo] = useState('');
  const [singleBusy, setSingleBusy] = useState(false);

  const [bulkText, setBulkText] = useState(() => localStorage.getItem(BULK_KEY) || '');
  const [statuses, setStatuses] = useState<Record<string, { s: SendStatus; e?: string }>>({});
  const [running, setRunning] = useState(false);
  const stopRef = useRef(false);

  const bulkEmails = useMemo(() => extractEmails(bulkText), [bulkText]);

  // Coming from Drafts page: open bulk with those emails + role
  useEffect(() => {
    const p = takeApplyPrefill();
    if (p && p.emails.length) {
      setMode('bulk');
      pickRole(p.role);
      updateBulk(p.emails.join('\n'));
      toast.info(`${p.emails.length} ${ROLE_LABEL[p.role]} emails loaded from Drafts`);
    }
  }, []);

  const pickRole = (r: Role) => {
    setRole(r);
    setResume(r);
    setTpl(getTemplate('fresh', r));
    localStorage.setItem('sheetSync_bulkRole', r);
  };

  const updateBulk = (text: string) => {
    setBulkText(text);
    localStorage.setItem(BULK_KEY, text);
  };

  const canSend = tpl.subject.trim() && tpl.body.trim();

  const sendSingle = async () => {
    const email = extractEmails(to)[0];
    if (!email) return toast.error('Enter a valid email address');
    if (!canSend) return toast.error('Subject and message are required');
    setSingleBusy(true);
    try {
      await sendMail({ to: email, subject: tpl.subject, body: tpl.body, resume });
      toast.success(`Sent to ${email}`);
      setTo('');
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    } finally {
      setSingleBusy(false);
    }
  };

  const sendBulk = async () => {
    if (!bulkEmails.length) return toast.error('Paste at least one email');
    if (!canSend) return toast.error('Subject and message are required');
    stopRef.current = false;
    setRunning(true);
    setStatuses({});
    const list = [...bulkEmails];
    const snapshot = { ...tpl, resume };
    const { sent, failed } = await sendMany(
      list,
      () => snapshot,
      (email, s, e) => {
        setStatuses(prev => ({ ...prev, [email]: { s, e } }));
        if (s === 'sent') {
          // drop sent address from the box so a re-run only retries the rest
          setBulkText(prev => {
            const next = extractEmails(prev).filter(x => x !== email).join('\n');
            localStorage.setItem(BULK_KEY, next);
            return next;
          });
        }
      },
      () => stopRef.current,
    );
    setRunning(false);
    (failed ? toast.warn : toast.success)(`Done: ${sent} sent, ${failed} failed${stopRef.current ? ' (stopped)' : ''}`);
  };

  const statusList = Object.entries(statuses);

  return (
    <div className="page">
      <div className="glass-card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 className="page-title">Apply</h2>
            <p className="page-sub">Pick the role, edit subject / message / resume if needed, then send to one HR or many.</p>
          </div>
          <div className="seg">
            <button type="button" className={mode === 'single' ? 'on' : ''} onClick={() => setMode('single')}>Single</button>
            <button type="button" className={mode === 'bulk' ? 'on' : ''} onClick={() => setMode('bulk')}>Bulk</button>
          </div>
        </div>
        <CredsBar />
      </div>

      <div className="glass-card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <RolePicker value={role} onChange={pickRole} />
          <ResumePicker value={resume} onChange={setResume} />
        </div>

        {mode === 'single' ? (
          <div>
            <label className="modal-label">HR email</label>
            <input className="search-input" type="email" placeholder="hr@company.com" value={to} onChange={e => setTo(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendSingle(); }} />
          </div>
        ) : (
          <div>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label className="modal-label" style={{ margin: 0 }}>HR emails (any format — commas, new lines, pasted text)</label>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981' }}>{bulkEmails.length} emails</span>
            </div>
            <textarea className="search-input" rows={6} value={bulkText} onChange={e => updateBulk(e.target.value)} disabled={running}
              placeholder={'hr@razorpay.com\ncareers@paytm.com, talent@cred.club'} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
          </div>
        )}

        <TemplateEditor kind="fresh" role={role} subject={tpl.subject} body={tpl.body} onChange={setTpl} />

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          {mode === 'single' ? (
            <button type="button" className="btn-primary" onClick={sendSingle} disabled={singleBusy}>
              <Send size={15} /> {singleBusy ? 'Sending…' : 'Send'}
            </button>
          ) : running ? (
            <button type="button" className="btn-secondary" onClick={() => { stopRef.current = true; }}>
              <Square size={14} /> Stop
            </button>
          ) : (
            <>
              {bulkText && <button type="button" className="btn-secondary btn-sm" onClick={() => { updateBulk(''); setStatuses({}); }}><Trash2 size={13} /> Clear</button>}
              <button type="button" className="btn-primary" onClick={sendBulk} disabled={!bulkEmails.length}>
                <Send size={15} /> Send to {bulkEmails.length} emails
              </button>
            </>
          )}
        </div>
      </div>

      {mode === 'bulk' && statusList.length > 0 && (
        <div className="glass-card">
          <div style={{ fontWeight: 700, marginBottom: '0.6rem' }}>
            Progress — {statusList.filter(([, v]) => v.s === 'sent').length} sent, {statusList.filter(([, v]) => v.s === 'failed').length} failed
          </div>
          <div className="mail-list">
            {statusList.map(([email, v]) => (
              <div key={email} className="mail-row" style={{ justifyContent: 'space-between' }}>
                <span className="em">{email}</span>
                <StatusText status={v.s} error={v.e} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
