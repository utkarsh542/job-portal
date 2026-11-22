import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, Send, Square } from 'lucide-react';
import { toast } from '../../toast';
import {
  classify, dayKey, fetchMails, firstEmail, getTemplate, isFollowUpSubject, sendMany,
  ROLE_COLOR, ROLE_LABEL, type Bucket, type MailItem, type Role, type SendStatus,
} from '../../lib/core';
import { CredsBar, RolePicker, StatusText, TemplateEditor } from './Shared';

type Range = 'yesterday' | 'today' | '3d' | '7d' | 'date';
const RANGE_LABEL: Record<Range, string> = { yesterday: 'Yesterday', today: 'Today', '3d': 'Last 3 days', '7d': 'Last 7 days', date: 'Pick date' };

const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

interface Target { email: string; subject: string; date: string; bucket: Bucket }

/**
 * Sent mails → who needs a follow-up.
 * Picks mails sent in the chosen range, skips anyone who already got a follow-up after that,
 * groups them Backend & AI / Python Backend by the subject you sent, and sends the follow-up template with the right resume.
 */
export const FollowUpPage: React.FC = () => {
  const [sent, setSent] = useState<MailItem[]>([]);
  const [loadedDays, setLoadedDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<Range>('yesterday');
  const [pickDate, setPickDate] = useState(() => dayKey(daysAgo(1)));

  const [unchecked, setUnchecked] = useState<Record<string, boolean>>({});
  const [otherAs, setOtherAs] = useState<Role>('ai');
  const [editRole, setEditRole] = useState<Role>('ai');
  const [tpls, setTpls] = useState(() => ({ ai: getTemplate('followup', 'ai'), backend: getTemplate('followup', 'backend') }));
  const [attach, setAttach] = useState(true);

  const [statuses, setStatuses] = useState<Record<string, { s: SendStatus; e?: string }>>({});
  const [running, setRunning] = useState<Bucket | null>(null);
  const stopRef = useRef(false);

  // How many days back we need to fetch for the selected range (+ a margin to see later follow-ups)
  const neededDays = useMemo(() => {
    if (range === 'date') {
      const diff = Math.ceil((Date.now() - new Date(pickDate + 'T00:00:00').getTime()) / 86400000);
      return Math.max(2, diff + 1);
    }
    return range === '7d' ? 8 : range === '3d' ? 4 : 2;
  }, [range, pickDate]);

  const load = async (days: number) => {
    setLoading(true);
    try {
      const list = await fetchMails('sent', days);
      setSent(list);
      setLoadedDays(days);
      setStatuses({});
      setUnchecked({});
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (neededDays > loadedDays) load(Math.max(neededDays, 8)); }, [neededDays]);

  const inRange = (iso: string) => {
    const k = dayKey(new Date(iso));
    if (range === 'today') return k === dayKey(new Date());
    if (range === 'yesterday') return k === dayKey(daysAgo(1));
    if (range === 'date') return k === pickDate;
    const n = range === '7d' ? 7 : 3;
    return new Date(iso).getTime() >= new Date(dayKey(daysAgo(n)) + 'T00:00:00').getTime();
  };

  const { groups, skipped } = useMemo(() => {
    // last follow-up time per recipient
    const lastFollowUp: Record<string, number> = {};
    for (const m of sent) {
      if (!isFollowUpSubject(m.subject)) continue;
      const e = firstEmail(m.to);
      if (e) lastFollowUp[e] = Math.max(lastFollowUp[e] || 0, new Date(m.date).getTime());
    }
    const g: Record<Bucket, Target[]> = { ai: [], backend: [], other: [] };
    const seen = new Set<string>();
    let skippedCount = 0;
    for (const m of sent) {
      // skip follow-ups themselves and replies/forwards (those are conversations, not applications)
      if (isFollowUpSubject(m.subject) || /^\s*(re|fwd?|fw)\s*:/i.test(m.subject) || !inRange(m.date)) continue;
      const email = firstEmail(m.to);
      if (!email || seen.has(email)) continue;
      seen.add(email);
      if ((lastFollowUp[email] || 0) > new Date(m.date).getTime()) { skippedCount++; continue; }
      const bucket = classify(m.subject, m.body);
      g[bucket].push({ email, subject: m.subject, date: m.date, bucket });
    }
    return { groups: g, skipped: skippedCount };
  }, [sent, range, pickDate]);

  const roleFor = (b: Bucket): Role => (b === 'other' ? otherAs : b);
  const selected = (b: Bucket) => groups[b].filter(t => !unchecked[t.email] && statuses[t.email]?.s !== 'sent').map(t => t.email);

  const sendGroup = async (b: Bucket) => {
    const emails = selected(b);
    if (!emails.length) return;
    const role = roleFor(b);
    const t = tpls[role];
    if (!t.subject.trim() || !t.body.trim()) return toast.error('Follow-up subject and message are required');
    stopRef.current = false;
    setRunning(b);
    const { sent: ok, failed } = await sendMany(
      emails,
      () => ({ subject: t.subject, body: t.body, resume: attach ? role : 'none' }),
      (email, s, e) => setStatuses(prev => ({ ...prev, [email]: { s, e } })),
      () => stopRef.current,
    );
    setRunning(null);
    (failed ? toast.warn : toast.success)(`${ROLE_LABEL[role]} follow-ups: ${ok} sent, ${failed} failed`);
  };

  return (
    <div className="page">
      <div className="glass-card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 className="page-title">Follow-up</h2>
            <p className="page-sub">Mails you sent earlier, grouped by role. People who already got a follow-up are left out.</p>
          </div>
          <button type="button" className="btn-secondary btn-sm" onClick={() => load(Math.max(neededDays, 8))} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> {loading ? 'Loading…' : 'Reload'}
          </button>
        </div>
        <div className="row">
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sent on:</span>
          <div className="seg">
            {(Object.keys(RANGE_LABEL) as Range[]).map(r => (
              <button key={r} type="button" className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{RANGE_LABEL[r]}</button>
            ))}
          </div>
          {range === 'date' && (
            <input type="date" className="search-input" style={{ width: 'auto' }} value={pickDate} max={dayKey(new Date())} onChange={e => setPickDate(e.target.value)} />
          )}
          {skipped > 0 && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{skipped} already followed up — hidden</span>}
        </div>
        <CredsBar />
      </div>

      <div className="cols">
        {(['ai', 'backend', 'other'] as Bucket[]).filter(b => b !== 'other' || groups.other.length > 0).map(b => {
          const sel = selected(b);
          return (
            <div key={b} className="glass-card stack" style={{ borderTop: `4px solid ${ROLE_COLOR[b]}`, gap: '0.75rem' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{ROLE_LABEL[b]}</span>
                <span className="badge" style={{ background: ROLE_COLOR[b] }}>{groups[b].length}</span>
              </div>
              {b === 'other' && (
                <div className="row" style={{ gap: '0.4rem', fontSize: '0.8rem' }}>
                  Send as: <RolePicker value={otherAs} onChange={setOtherAs} />
                </div>
              )}
              {running === b ? (
                <button type="button" className="btn-secondary btn-sm" onClick={() => { stopRef.current = true; }}><Square size={13} /> Stop</button>
              ) : (
                <button type="button" className="btn-primary btn-sm" disabled={!sel.length || running !== null} onClick={() => sendGroup(b)}
                  style={{ background: ROLE_COLOR[roleFor(b)] }}>
                  <Send size={13} /> Send {ROLE_LABEL[roleFor(b)]} follow-up to {sel.length}
                </button>
              )}
              <div className="mail-list">
                {groups[b].length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{loading ? 'Loading…' : 'No one to follow up'}</div>}
                {groups[b].map(t => (
                  <label key={t.email} className="mail-row" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={!unchecked[t.email]} disabled={running !== null}
                      onChange={() => setUnchecked(prev => ({ ...prev, [t.email]: !prev[t.email] }))} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="em">{t.email}</div>
                      <div className="sub">{new Date(t.date).toLocaleDateString()} · {t.subject}</div>
                    </div>
                    <StatusText status={statuses[t.email]?.s} error={statuses[t.email]?.e} />
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Follow-up message</span>
          <RolePicker value={editRole} onChange={setEditRole} />
        </div>
        <TemplateEditor kind="followup" role={editRole} subject={tpls[editRole].subject} body={tpls[editRole].body} rows={8}
          onChange={t => setTpls(prev => ({ ...prev, [editRole]: t }))} />
        <label className="row" style={{ gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={attach} onChange={e => setAttach(e.target.checked)} />
          Attach resume — Backend & AI group gets the AI Engineer PDF, Python Backend group gets the Python Backend PDF
        </label>
      </div>
    </div>
  );
};
