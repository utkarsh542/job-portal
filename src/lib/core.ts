// Shared helpers for the 4 pages: Apply, Drafts, Follow-up, Resume.
import { getApiBase } from '../config';
import { FRESH_TEMPLATE, FRONTEND_FRESH_TEMPLATE, FOLLOWUP_TEMPLATE, FRONTEND_FOLLOWUP_TEMPLATE } from '../templates';

export type Role = 'ai' | 'backend';
export type Bucket = Role | 'other';
export type TemplateKind = 'fresh' | 'followup';

export const ROLE_LABEL: Record<Bucket, string> = {
  ai: 'AI / GenAI QA Engineer',
  backend: 'QA Engineer (Manual & API)',
  other: 'Other',
};

export const ROLE_COLOR: Record<Bucket, string> = {
  ai: '#8b5cf6',
  backend: '#0ea5e9',
  other: '#64748b',
};

export const RESUME_FILE: Record<Role, string> = {
  ai: 'Cheshta_Verma.pdf',
  backend: 'Cheshta_Verma.pdf',
};

// ── Gmail credentials (one place, shared by every page) ──
const USER_KEY = 'sheetSync_smtpUser';
const PASS_KEY = 'sheetSync_smtpPass';
export const getCreds = () => {
  let user = (localStorage.getItem(USER_KEY) || '').trim();
  if (!user || user === 'gutkarsh191@gmail.com' || user.toLowerCase().includes('utkarsh')) {
    user = 'kmcheshtamzn@gmail.com';
    try { localStorage.setItem(USER_KEY, user); } catch {}
  }
  let pass = (localStorage.getItem(PASS_KEY) || '').trim().replace(/\s+/g, '');
  if (!pass || pass === 'akqltiacqtgtptsw') {
    pass = 'bixwjrotqbhdelun';
    try { localStorage.setItem(PASS_KEY, pass); } catch {}
  }
  return { user, pass };
};
export const saveCreds = (user: string, pass: string) => {
  localStorage.setItem(USER_KEY, user.trim());
  localStorage.setItem(PASS_KEY, pass.trim().replace(/\s+/g, ''));
};

// ── Templates: defaults from templates.ts, user edits saved per role + kind ──
const DEFAULTS: Record<TemplateKind, Record<Role, { subject: string; body: string }>> = {
  fresh: { ai: FRESH_TEMPLATE, backend: FRONTEND_FRESH_TEMPLATE },
  followup: { ai: FOLLOWUP_TEMPLATE, backend: FRONTEND_FOLLOWUP_TEMPLATE },
};
const tplKey = (kind: TemplateKind, role: Role) => `sheetSync_tpl_${kind}_${role}`;

export const getTemplate = (kind: TemplateKind, role: Role): { subject: string; body: string } => {
  try {
    const saved = localStorage.getItem(tplKey(kind, role));
    if (saved) {
      const t = JSON.parse(saved);
      if (t && typeof t.subject === 'string' && typeof t.body === 'string') {
        // Discard any legacy saved templates from previous user
        if (!t.body.includes('Utkarsh') && !t.subject.includes('Utkarsh')) {
          return t;
        }
      }
    }
  } catch { /* fall through to default */ }
  return { ...DEFAULTS[kind][role] };
};
export const saveTemplate = (kind: TemplateKind, role: Role, t: { subject: string; body: string }) =>
  localStorage.setItem(tplKey(kind, role), JSON.stringify(t));
export const resetTemplate = (kind: TemplateKind, role: Role) => {
  localStorage.removeItem(tplKey(kind, role));
  return { ...DEFAULTS[kind][role] };
};

// ── Role detection from what you typed in subject / body ──
// AI QA words: ai, genai, llm, rag, hallucination, prompt, model, classification, nlp
// Manual & API QA words: qa, test, manual, api, postman, sdet, rest, sql, uat, regression, smoke, bug, defect, jira
const AI_RE = /\b(ai|gen[\s-]?ai|llm|rag|hallucination|prompt|model|nlp)\b/i;
const BE_RE = /\b(qa|test|manual|api|postman|sdet|rest|sql|uat|regression|smoke|bug|defect|jira)\b/i;

const firstMatch = (text: string): Bucket | null => {
  const ai = text.search(AI_RE);
  const be = text.search(BE_RE);
  if (ai < 0 && be < 0) return null;
  if (ai < 0) return 'backend';
  if (be < 0) return 'ai';
  return ai < be ? 'ai' : 'backend';
};

export const classify = (subject: string, body = ''): Bucket => {
  const subj = (subject || '').replace(/\(no subject\)/i, '');
  const fromSubject = firstMatch(subj);
  if (fromSubject) return fromSubject;
  const firstLine = (body || '').replace(/Recipient email:.*/i, '').split(/\r?\n/).map(l => l.trim()).find(Boolean) || '';
  return (firstLine.length <= 25 && firstMatch(firstLine)) || 'other';
};

export const isFollowUpSubject = (subject: string) => /^\s*(re:\s*)?follow[\s-]?up/i.test(subject || '');

// ── Never mail these (server blocks them too, see BLOCKED_EMAILS in server.js) ──
export const BLOCKED_EMAILS = new Set([
  'rajkumaar@bridgeaitech.com',
  'sahaj@bridgeaitech.com',
]);
export const isBlocked = (email: string) => BLOCKED_EMAILS.has(email.trim().toLowerCase());

// ── Email parsing (blocked addresses are dropped everywhere) ──
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
export const extractEmails = (text: string): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of (text || '').match(EMAIL_RE) || []) {
    const e = m.toLowerCase();
    if (BLOCKED_EMAILS.has(e)) continue;
    if (!seen.has(e)) { seen.add(e); out.push(e); }
  }
  return out;
};
export const firstEmail = (text: string): string | null => extractEmails(text)[0] || null;

// ── API calls ──
export interface MailItem { id: number; to: string; subject: string; body: string; date: string; }

export const fetchMails = async (folderType: 'drafts' | 'sent', sinceDays?: number): Promise<MailItem[]> => {
  const { user, pass } = getCreds();
  const res = await fetch(`${getApiBase()}/api/fetch-drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smtpUser: user, smtpPass: pass, folderType, sinceDays }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Could not fetch mails');
  return data.drafts || [];
};

export const sendMail = async (opts: { to: string; subject: string; body: string; resume: Role | 'none' }) => {
  if (isBlocked(opts.to)) throw new Error(`${opts.to} is blocked — not sent`);
  const { user, pass } = getCreds();
  const res = await fetch(`${getApiBase()}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      smtpUser: user,
      smtpPass: pass,
      to: opts.to,
      subject: opts.subject.trim(),
      body: opts.body.trim(),
      roleType: opts.resume === 'none' ? 'ai' : opts.resume,
      attachResume: opts.resume !== 'none',
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || `Send failed (${res.status})`);
};

export type SendStatus = 'pending' | 'sending' | 'sent' | 'failed';

/** Sends one mail per address, one after another, with a short gap to stay under Gmail limits. */
export const sendMany = async (
  emails: string[],
  build: (email: string) => { subject: string; body: string; resume: Role | 'none' },
  onStatus: (email: string, status: SendStatus, error?: string) => void,
  shouldStop: () => boolean,
) => {
  let sent = 0;
  let failed = 0;
  for (const email of emails) {
    if (shouldStop()) break;
    onStatus(email, 'sending');
    try {
      await sendMail({ to: email, ...build(email) });
      sent++;
      onStatus(email, 'sent');
    } catch (e: any) {
      failed++;
      onStatus(email, 'failed', e?.message);
    }
    await new Promise(r => setTimeout(r, 800));
  }
  return { sent, failed };
};

// ── Hand-off between pages (Drafts → Apply) ──
const PREFILL_KEY = 'sheetSync_applyPrefill';
export const setApplyPrefill = (p: { role: Role; emails: string[] }) => localStorage.setItem(PREFILL_KEY, JSON.stringify(p));
export const takeApplyPrefill = (): { role: Role; emails: string[] } | null => {
  const raw = localStorage.getItem(PREFILL_KEY);
  localStorage.removeItem(PREFILL_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
};

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
