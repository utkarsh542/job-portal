import React, { useEffect, useMemo, useState } from 'react';
import { Copy, RefreshCw, Send } from 'lucide-react';
import { toast } from '../../toast';
import { classify, fetchMails, firstEmail, setApplyPrefill, ROLE_COLOR, ROLE_LABEL, type Bucket, type MailItem } from '../../lib/core';
import { CredsBar } from './Shared';

const BUCKETS: Bucket[] = ['ai', 'backend', 'other'];

/**
 * Gmail drafts split into Backend & AI / Python Backend / Other by what you wrote in the draft.
 * Any draft can be moved by hand. Each group can be copied or sent to Apply.
 */
export const DraftsPage: React.FC<{ onGoApply: () => void }> = ({ onGoApply }) => {
  const [drafts, setDrafts] = useState<MailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [moved, setMoved] = useState<Record<number, Bucket>>({});
  const [done, setDone] = useState<Record<number, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      const list = await fetchMails('drafts');
      setDrafts(list);
      setMoved({});
      setDone({});
      toast.success(`Loaded ${list.length} drafts`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const groups = useMemo(() => {
    const g: Record<Bucket, (MailItem & { email: string })[]> = { ai: [], backend: [], other: [] };
    for (const d of drafts) {
      if (done[d.id]) continue;
      const email = firstEmail(d.to);
      if (!email) continue; // draft without a recipient is useless here
      g[moved[d.id] || classify(d.subject, d.body)].push({ ...d, email });
    }
    return g;
  }, [drafts, moved, done]);

  const uniqueEmails = (b: Bucket) => Array.from(new Set(groups[b].map(d => d.email)));

  const markDone = (b: Bucket) => setDone(prev => ({ ...prev, ...Object.fromEntries(groups[b].map(d => [d.id, true])) }));

  const copyGroup = (b: Bucket) => {
    const emails = uniqueEmails(b);
    navigator.clipboard.writeText(emails.join('\n'));
    markDone(b);
    toast.success(`Copied ${emails.length} ${ROLE_LABEL[b]} emails`);
  };

  const applyGroup = (b: 'ai' | 'backend') => {
    const emails = uniqueEmails(b);
    setApplyPrefill({ role: b, emails });
    markDone(b);
    onGoApply();
  };

  return (
    <div className="page">
      <div className="glass-card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 className="page-title">Gmail Drafts</h2>
            <p className="page-sub">
              Write <b>full</b> or <b>fe</b> in the draft subject (or first line). Drafts are split automatically — click a tag on any row to move it.
            </p>
          </div>
          <button type="button" className="btn-secondary btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> {loading ? 'Loading…' : 'Reload'}
          </button>
        </div>
        <CredsBar />
      </div>

      <div className="cols">
        {BUCKETS.map(b => (
          <div key={b} className="glass-card stack" style={{ borderTop: `4px solid ${ROLE_COLOR[b]}`, gap: '0.75rem' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{ROLE_LABEL[b]}</span>
              <span className="badge" style={{ background: ROLE_COLOR[b] }}>{uniqueEmails(b).length}</span>
            </div>

            <div className="row" style={{ gap: '0.5rem' }}>
              <button type="button" className="btn-secondary btn-sm" disabled={!groups[b].length} onClick={() => copyGroup(b)}>
                <Copy size={13} /> Copy emails
              </button>
              {b !== 'other' && (
                <button type="button" className="btn-primary btn-sm" disabled={!groups[b].length} onClick={() => applyGroup(b)}
                  style={{ background: ROLE_COLOR[b] }}>
                  <Send size={13} /> Apply as {ROLE_LABEL[b]}
                </button>
              )}
            </div>

            <div className="mail-list">
              {groups[b].length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{loading ? 'Loading…' : 'Nothing here'}</div>}
              {groups[b].map(d => (
                <div key={d.id} className="mail-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="em">{d.email}</div>
                    <div className="sub">{d.subject}</div>
                  </div>
                  {BUCKETS.filter(x => x !== b).map(x => (
                    <button key={x} type="button" className="chip" title={`Move to ${ROLE_LABEL[x]}`}
                      onClick={() => setMoved(prev => ({ ...prev, [d.id]: x }))}>
                      → {x === 'ai' ? 'AI' : x === 'backend' ? 'Backend' : 'Other'}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
