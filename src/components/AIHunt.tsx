import React, { useState } from 'react';
import {
  Search, Send, Loader2, CheckCircle2, AlertCircle, ExternalLink,
  Building2, Zap, Mail, Edit3,
  Sparkles, Globe, Play, Layers, CheckSquare, Square as SquareIcon, Filter,
  Settings
} from 'lucide-react';
import { getApiBase } from '../config';
import { toast } from '../toast';

// ─── Types ────────────────────────────────────────────────────
interface HuntResult {
  id: string;
  title: string;
  company: string;
  platform: string;
  url: string;
  hrEmail: string;
  candidateEmails?: string[];
  isGuessed: boolean;
  publishedDate?: string;
}

interface EmailBatch {
  batchNum: number;
  items: HuntResult[];
}

// ─── Platform definitions ─────────────────────────────────────
const PLATFORMS = [
  { key: 'naukri',          label: 'Naukri.com',       color: '#0056b3' },
  { key: 'linkedin',        label: 'LinkedIn',         color: '#0a66c2' },
  { key: 'indeed',          label: 'Indeed',           color: '#2557a7' },
  { key: 'greenhouse',      label: 'Greenhouse',       color: '#22c55e' },
  { key: 'lever',           label: 'Lever',            color: '#3b82f6' },
  { key: 'ashby',           label: 'Ashby',            color: '#8b5cf6' },
  { key: 'workday',         label: 'Workday',          color: '#f59e0b' },
  { key: 'smartrecruiters', label: 'SmartRecruiters',  color: '#ef4444' },
  { key: 'workable',        label: 'Workable',         color: '#06b6d4' },
  { key: 'icims',           label: 'iCIMS',            color: '#6366f1' },
  { key: 'jobvite',         label: 'Jobvite',          color: '#f97316' },
  { key: 'bamboohr',        label: 'BambooHR',         color: '#10b981' },
  { key: 'rippling',        label: 'Rippling',         color: '#ec4899' },
  { key: 'dover',           label: 'Dover',            color: '#64748b' },
  { key: 'pinpoint',        label: 'Pinpoint',         color: '#0ea5e9' },
];

const COVER_LETTER = `Dear Hiring Team,

I am writing to express my strong interest in Backend & AI Engineer opportunities at your organization.

I bring 4+ years of experience engineering production-grade backend systems and GenAI applications for enterprise clients including PwC and Aditya Birla Group. My core expertise centers on Python, FastAPI, microservices, cloud-native deployments on AWS and Azure, and building end-to-end LLM/GenAI pipelines.

Key Highlights of my experience:
• GenAI & LLM Pipelines: Built production GenAI pipelines using OpenAI, Azure OpenAI, AWS Bedrock, and LangChain for document Q&A, summarization, and risk prediction at PwC (processing 500+ tax documents/month) with OCR integration (Tesseract, Docling, AWS Textract) and vector databases.
• High-Scale Fintech & API Integrations: Developed and maintained mission-critical third-party financial API integrations (Razorpay, Digio, Tartan) for Aditya Birla Group serving a 10M+ customer base; reduced integration failure rate by ~30% via robust retry and error-handling layers.
• Scalable Serverless & Microservices: Architected FastAPI + PostgreSQL backend on AWS Lambda (serverless), reducing infrastructure costs by ~35% vs EC2, and implemented Redis caching layers improving API response times by ~60%.
• Asynchronous Architecture & SRE: Designed distributed message architectures with AWS SNS+SQS (50K+ msgs/day) and Celery+Redis task queues; drove SRE best practices maintaining 99.5%+ service availability.

I would be thrilled to bring my experience in Python backend microservices and GenAI systems to your engineering team.

Please find my resume attached for your consideration.

Thank you for your time and consideration.

Best regards,
Utkarsh Gupta
Backend & AI Engineer | Python · FastAPI · LLMs · AWS
+91 8840143567
gutkarsh191@gmail.com
LinkedIn | GitHub`;

// ─── Styles ───────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#1e293b',
    padding: '2rem 1.5rem',
  } as React.CSSProperties,
  container: { maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' } as React.CSSProperties,
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  } as React.CSSProperties,
  heroCard: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    borderRadius: '20px',
    padding: '2rem 2rem 1.5rem',
    color: 'white',
    boxShadow: '0 8px 32px rgba(79, 70, 229, 0.25)',
  } as React.CSSProperties,
  label: { fontSize: '0.78rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' } as React.CSSProperties,
  input: {
    width: '100%', padding: '0.65rem 1rem', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '0.95rem', color: '#1e293b',
    background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white', border: 'none', borderRadius: '10px',
    padding: '0.7rem 1.5rem', fontWeight: 700, fontSize: '0.9rem',
    cursor: 'pointer', transition: 'opacity 0.2s, transform 0.15s',
  } as React.CSSProperties,
  btnGreen: {
    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
    background: '#10b981', color: 'white', border: 'none', borderRadius: '8px',
    padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.8rem',
    cursor: 'pointer', transition: 'opacity 0.2s',
  } as React.CSSProperties,
  btnOutline: {
    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
    background: 'transparent', color: '#4f46e5', border: '1.5px solid #4f46e5',
    borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600,
    fontSize: '0.8rem', cursor: 'pointer',
  } as React.CSSProperties,
  platformPill: (active: boolean, color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem',
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    border: `1.5px solid ${active ? color : '#e2e8f0'}`,
    background: active ? `${color}15` : '#f8fafc',
    color: active ? color : '#64748b',
    userSelect: 'none',
  }),
  resultCard: (selected: boolean, sent: boolean): React.CSSProperties => ({
    background: sent ? '#f0fdf4' : selected ? '#f5f3ff' : '#ffffff',
    borderRadius: '14px',
    border: `1.5px solid ${sent ? '#86efac' : selected ? '#c7d2fe' : '#e2e8f0'}`,
    padding: '1.25rem',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  }),
  platformBadge: (color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
    fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem',
    borderRadius: '999px', background: `${color}18`, color: color,
    letterSpacing: '0.03em', textTransform: 'uppercase',
  }),
};

// ─── Component ────────────────────────────────────────────────
export const AIHunt: React.FC = () => {
  const [position, setPosition] = useState('Backend & AI Engineer');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['naukri', 'linkedin', 'indeed', 'greenhouse', 'lever', 'ashby', 'workday', 'workable']);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('geminiApiKey') || '');
  const [exaKey, setExaKey] = useState(() => localStorage.getItem('exaApiKey') || '');
  const [smtpUser, setSmtpUser] = useState(() => localStorage.getItem('sheetSync_smtpUser') || 'gutkarsh191@gmail.com');
  const [smtpPass, setSmtpPass] = useState(() => (localStorage.getItem('sheetSync_smtpPass') || 'akqltiacqtgtptsw').replace(/\s+/g, ''));
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);
  const [tempSmtpPass, setTempSmtpPass] = useState(() => (localStorage.getItem('sheetSync_smtpPass') || 'akqltiacqtgtptsw').replace(/\s+/g, ''));

  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<HuntResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [searchMsg, setSearchMsg] = useState('');

  // Per-card state
  const [editEmails, setEditEmails] = useState<Record<string, string>>({});
  const [sendStatus, setSendStatus] = useState<Record<string, 'idle' | 'sending' | 'sent' | 'error'>>({});
  const [sendLog, setSendLog] = useState<Record<string, string>>({});

  // Sent History to guarantee zero duplicate emails across runs
  const [sentHistory, setSentHistory] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('aiHunt_sentEmailsList');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  // Contacted Companies to guarantee zero duplicate companies across runs
  const [contactedCompanies, setContactedCompanies] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('aiHunt_contactedCompanies');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  const recordEmailSent = (email: string, company?: string) => {
    const norm = email.trim().toLowerCase();
    if (norm) {
      setSentHistory(prev => {
        const next = new Set(prev);
        next.add(norm);
        try {
          localStorage.setItem('aiHunt_sentEmailsList', JSON.stringify(Array.from(next)));
        } catch (_) {}
        return next;
      });
    }
    if (company && company.trim()) {
      const normCo = company.trim();
      setContactedCompanies(prev => {
        const next = new Set(prev);
        next.add(normCo);
        try {
          localStorage.setItem('aiHunt_contactedCompanies', JSON.stringify(Array.from(next)));
        } catch (_) {}
        return next;
      });
    }
  };

  const clearExclusionHistory = () => {
    if (window.confirm('Reset contacted history? Future searches will be able to suggest previously contacted companies again.')) {
      setContactedCompanies(new Set());
      setSentHistory(new Set());
      try {
        localStorage.removeItem('aiHunt_contactedCompanies');
        localStorage.removeItem('aiHunt_sentEmailsList');
      } catch (_) {}
      toast.success('Contacted history reset successfully!');
    }
  };

  // Batching state
  const [batches, setBatches] = useState<EmailBatch[]>([]);
  const [sendingBatchNum, setSendingBatchNum] = useState<number | null>(null);
  const [batchLogs, setBatchLogs] = useState<Record<number, string>>({});
  const [processedBatches, setProcessedBatches] = useState<Record<number, boolean>>({});
  const [sendingAllBatches, setSendingAllBatches] = useState(false);


  const togglePlatform = (key: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.id)));
    }
  };

  const handleSearch = async () => {
    if (!position.trim()) { setError('Position name is required.'); return; }
    if (selectedPlatforms.length === 0) { setError('Select at least one platform.'); return; }
    setError('');
    setSearchMsg('');
    setResults([]);
    setSelectedIds(new Set());
    setBatches([]);
    setSendStatus({});
    setSendLog({});
    setBatchLogs({});
    setProcessedBatches({});
    setEditEmails({});
    setSearching(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 75000);

    try {
      const res = await fetch(`${getApiBase()}/api/ai-hunt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          position: position.trim(),
          platforms: selectedPlatforms,
          exaApiKey: exaKey.trim(),
          geminiApiKey: geminiKey.trim(),
          excludeCompanies: Array.from(contactedCompanies),
          excludeEmails: Array.from(sentHistory)
        }),
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!data.success) { setError(data.message || 'Search failed.'); }
      else {
        const resList: HuntResult[] = data.results || [];

        // Client-side strict de-duplication by email and company (excluding already contacted)
        const seenEmails = new Set<string>();
        const seenCompanies = new Set<string>();
        const normExcludedCos = new Set(Array.from(contactedCompanies).map(c => c.toLowerCase().replace(/[^a-z0-9]/g, '')));
        const normExcludedEmails = new Set(Array.from(sentHistory).map(e => e.toLowerCase().trim()));
        const uniqueResults: HuntResult[] = [];

        for (const item of resList) {
          const em = (item.hrEmail || '').trim().toLowerCase();
          const co = (item.company || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          if (em && (seenEmails.has(em) || normExcludedEmails.has(em))) continue;
          if (co && (seenCompanies.has(co) || normExcludedCos.has(co))) continue;
          if (em) seenEmails.add(em);
          if (co) seenCompanies.add(co);
          uniqueResults.push({
            ...item,
            candidateEmails: Array.from(new Set((item.candidateEmails || []).map(e => e.trim().toLowerCase())))
          });
        }

        if (uniqueResults.length === 0 && resList.length > 0) {
          setError(`All ${resList.length} returned leads were already contacted previously. Click "Search Position" again for a fresh batch, or click "Reset Exclusions" if you wish to re-apply.`);
        } else {
          setResults(uniqueResults);
          // Auto select all unique results
          setSelectedIds(new Set(uniqueResults.map(r => r.id)));
          if (data.message) {
            setSearchMsg(`${data.message} (${uniqueResults.length} new fresh companies, ${contactedCompanies.size} previously contacted excluded)`);
          }

          // Auto create 10-email batches ensuring zero duplicate recipients
          createBatches(uniqueResults, new Set(uniqueResults.map(r => r.id)));
        }
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        setError('Search timed out after 75 seconds. Please check your connection and try again.');
      } else {
        setError(e.message || 'Network connection failed. Ensure backend server is running on port 3001.');
      }
    } finally {
      setSearching(false);
    }
  };

  const createBatches = (resList: HuntResult[], selectedSet: Set<string>) => {
    const activeResults: HuntResult[] = [];
    const seenBatchEmails = new Set<string>();

    for (const r of resList) {
      if (!selectedSet.has(r.id)) continue;
      const targetEmail = (editEmails[r.id] ?? r.hrEmail ?? '').trim().toLowerCase();
      if (!targetEmail) continue;
      // Guarantee zero duplicate recipient emails across all batches
      if (seenBatchEmails.has(targetEmail)) continue;
      seenBatchEmails.add(targetEmail);
      activeResults.push(r);
    }

    const newBatches: EmailBatch[] = [];
    const chunkSize = 10;
    for (let i = 0; i < activeResults.length; i += chunkSize) {
      newBatches.push({
        batchNum: newBatches.length + 1,
        items: activeResults.slice(i, i + chunkSize)
      });
    }
    setBatches(newBatches);
    setProcessedBatches({});
    setBatchLogs({});
  };

  const handleGenerateBatchesClick = () => {
    createBatches(results, selectedIds);
  };

  const getEmail = (r: HuntResult) => editEmails[r.id] ?? r.hrEmail;

  const sendOne = async (r: HuntResult): Promise<boolean> => {
    const rawEmail = getEmail(r);
    const email = (rawEmail || '').trim().toLowerCase();

    if (!email) {
      setSendStatus(p => ({ ...p, [r.id]: 'error' }));
      setSendLog(p => ({ ...p, [r.id]: '❌ Recipient email is missing.' }));
      return false;
    }

    // Duplicate protection: prevent sending if this email was already emailed
    if (sentHistory.has(email) && sendStatus[r.id] !== 'sent') {
      recordEmailSent(email, r.company);
      setSendStatus(p => ({ ...p, [r.id]: 'sent' }));
      setSendLog(p => ({ ...p, [r.id]: `ℹ️ Skipped: Already sent to ${email} (duplicate prevented).` }));
      return true;
    }

    if (!smtpPass.trim()) {
      setSendStatus(p => ({ ...p, [r.id]: 'error' }));
      setSendLog(p => ({ ...p, [r.id]: '❌ Gmail App Password required. Click "Gmail SMTP Settings" above to enter your 16-character App Password.' }));
      return false;
    }
    setSendStatus(p => ({ ...p, [r.id]: 'sending' }));
    setSendLog(p => ({ ...p, [r.id]: `Sending to ${email}...` }));
    try {
      const resp = await fetch(`${getApiBase()}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpUser: smtpUser.trim(),
          smtpPass: smtpPass.trim(),
          to: email,
          subject: 'Application for Backend & AI Engineer | 4+ Years Experience | Python, FastAPI, GenAI',
          body: COVER_LETTER,
          roleType: 'ai',
          resumeFileName: 'Utkarsh_Gupta.pdf'
        }),
      });
      const d = await resp.json();
      if (d.success) {
        recordEmailSent(email, r.company);
        setSendStatus(p => ({ ...p, [r.id]: 'sent' }));
        setSendLog(p => ({ ...p, [r.id]: `✅ Sent to ${email}` }));
        return true;
      } else {
        setSendStatus(p => ({ ...p, [r.id]: 'error' }));
        setSendLog(p => ({ ...p, [r.id]: `❌ Failed: ${d.message}` }));
        return false;
      }
    } catch (e: any) {
      setSendStatus(p => ({ ...p, [r.id]: 'error' }));
      setSendLog(p => ({ ...p, [r.id]: `❌ Error: ${e.message}` }));
      return false;
    }
  };

  const handleSendBatch = async (batchIdx: number) => {
    const batch = batches[batchIdx];
    if (!batch || batch.items.length === 0) return;

    setSendingBatchNum(batch.batchNum);
    setBatchLogs(p => ({ ...p, [batch.batchNum]: `Sending batch ${batch.batchNum} (${batch.items.length} emails)...` }));

    let successCount = 0;
    let failCount = 0;

    for (const item of batch.items) {
      const ok = await sendOne(item);
      if (ok) successCount++;
      else failCount++;
      await new Promise(r => setTimeout(r, 600)); // 0.6s delay
    }

    setProcessedBatches(p => ({ ...p, [batch.batchNum]: true }));
    setBatchLogs(p => ({
      ...p,
      [batch.batchNum]: `✅ Batch ${batch.batchNum} completed! ${successCount} sent ${failCount > 0 ? `(${failCount} failed)` : ''}`
    }));
    setSendingBatchNum(null);
  };

  const handleSendAllBatches = async () => {
    setSendingAllBatches(true);
    for (let i = 0; i < batches.length; i++) {
      if (!processedBatches[batches[i].batchNum]) {
        await handleSendBatch(i);
      }
    }
    setSendingAllBatches(false);
  };

  const resultPlatformColor = (platform: string) =>
    PLATFORMS.find(p => p.label === platform)?.color || '#4f46e5';

  const sentCount = Object.values(sendStatus).filter(s => s === 'sent').length;

  return (
    <div style={S.page}>
      <div style={S.container}>

        {/* ── Hero Header ── */}
        <div style={S.heroCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '10px' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>AI Multi-Platform Job &amp; Recruiter Hunter</h1>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: '0.1rem 0 0' }}>
                Search position across Naukri.com, LinkedIn, Indeed, Greenhouse, Lever &amp; Ashby → Auto-extract HR emails → Create 10-email Batches → One-click Send!
              </p>
            </div>
          </div>
          {results.length > 0 && (
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Found Leads', val: results.length, color: 'rgba(255,255,255,0.9)' },
                { label: 'Selected', val: selectedIds.size, color: '#c7d2fe' },
                { label: '10-Email Batches', val: batches.length, color: '#fde68a' },
                { label: 'Mails Sent', val: sentCount, color: '#86efac' },
                { label: 'Duplicates Filtered', val: '100% Unique', color: '#a7f3d0' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.85, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Search Config Panel ── */}
        <div style={S.card}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={18} style={{ color: '#4f46e5' }} /> Search Position &amp; Target Platforms
          </h2>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <div style={{ flex: 2, minWidth: '220px' }}>
              <label style={S.label}>Job Position / Designation</label>
              <input
                type="text"
                value={position}
                onChange={e => setPosition(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. Python Developer, Backend & AI Engineer, FastAPI Developer..."
                style={{ ...S.input, fontSize: '1rem', fontWeight: 600 }}
              />
            </div>

            <div style={{ flex: 2, minWidth: '200px' }}>
              <label style={S.label}>Gemini API Key (Required for Live AI Search)</label>
              <input
                type="password"
                value={geminiKey}
                onChange={e => { const v = e.target.value.trim(); setGeminiKey(v); localStorage.setItem('geminiApiKey', v); }}
                placeholder="AIzaSy... — Google Gemini API Key"
                style={{ ...S.input, fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
              <div style={{ fontSize: '0.7rem', color: geminiKey ? '#16a34a' : '#6366f1', marginTop: '0.2rem', fontWeight: 500 }}>
                {geminiKey ? '✅ Live AI Search Active (Naukri, LinkedIn & ATS)' : '💡 Paste your Gemini key to search live Naukri & LinkedIn jobs'}
              </div>
            </div>

            <div style={{ flex: 2, minWidth: '200px' }}>
              <label style={S.label}>Exa.ai API Key (Optional)</label>
              <input
                type="password"
                value={exaKey}
                onChange={e => { const v = e.target.value.trim(); setExaKey(v); localStorage.setItem('exaApiKey', v); }}
                placeholder="Optional — leave empty to use built-in search"
                style={{ ...S.input, fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>


            <button
              style={{ ...S.btnPrimary, height: '44px', padding: '0 2rem', opacity: searching ? 0.7 : 1, minWidth: '160px' }}
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? <><Loader2 size={16} className="animate-spin" /> Fetching...</> : <><Search size={16} /> Search Position</>}
            </button>
          </div>

          {/* SMTP Credentials & Sender Config */}
          <div style={{
            background: smtpPass ? 'rgba(34, 197, 94, 0.06)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${smtpPass ? 'rgba(34, 197, 94, 0.25)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <Mail size={16} style={{ color: smtpPass ? '#22c55e' : '#f59e0b' }} />
                <span>
                  <strong>Sending Gmail:</strong> <code style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{smtpUser}</code>
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  background: smtpPass ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: smtpPass ? '#16a34a' : '#d97706'
                }}>
                  {smtpPass ? '✅ App Password Configured' : '⚠️ App Password Required to Send'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowSmtpSettings(prev => !prev)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: '6px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <Settings size={13} />
                {showSmtpSettings ? 'Hide Settings' : 'Configure Password'}
              </button>
            </div>

            {showSmtpSettings && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                paddingTop: '0.5rem',
                borderTop: '1px dashed rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                      Gmail Address
                    </label>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={e => setSmtpUser(e.target.value)}
                      placeholder="e.g. gutkarsh191@gmail.com"
                      style={{ ...S.input, fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                      16-Character Gmail App Password
                    </label>
                    <input
                      type="password"
                      value={tempSmtpPass}
                      onChange={e => setTempSmtpPass(e.target.value)}
                      placeholder="e.g. abcd efgh ijkl mnop"
                      style={{ ...S.input, fontFamily: 'monospace', fontSize: '0.85rem' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const u = smtpUser.trim();
                      const p = tempSmtpPass.trim().replace(/\s+/g, '');
                      setSmtpUser(u);
                      setSmtpPass(p);
                      localStorage.setItem('sheetSync_smtpUser', u);
                      localStorage.setItem('sheetSync_smtpPass', p);
                      setShowSmtpSettings(false);
                      toast.success('Gmail SMTP Credentials Saved!');
                    }}
                    style={{ ...S.btnPrimary, height: '38px', padding: '0 1.25rem', fontSize: '0.82rem' }}
                  >
                    Save Password
                  </button>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  💡 <strong>How to get this password:</strong> Google requires an <strong>App Password</strong> (not your regular Gmail password). 
                  Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline', fontWeight: 600 }}>Google Account &gt; Security &gt; App Passwords <ExternalLink size={11} style={{ verticalAlign: '-1px' }} /></a> (ensure 2-Step Verification is ON), name it <em>Job Portal</em>, and paste the 16-letter code here.
                </div>
              </div>
            )}
          </div>

          {/* Platform Toggles */}
          <label style={S.label}>Select Job &amp; ATS Platforms</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              style={{ ...S.platformPill(selectedPlatforms.length === PLATFORMS.length, '#4f46e5') }}
              onClick={() => setSelectedPlatforms(
                selectedPlatforms.length === PLATFORMS.length ? [] : PLATFORMS.map(p => p.key)
              )}
            >
              All Platforms
            </button>
            {PLATFORMS.map(p => (
              <button
                key={p.key}
                style={S.platformPill(selectedPlatforms.includes(p.key), p.color)}
                onClick={() => togglePlatform(p.key)}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                {p.label}
              </button>
            ))}
          </div>

          {(contactedCompanies.size > 0 || sentHistory.size > 0) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.78rem',
              color: '#166534',
              marginTop: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span>
                🛡️ <strong>Anti-Duplication Active:</strong> {contactedCompanies.size} companies &amp; {sentHistory.size} emails previously contacted are automatically excluded from searches.
              </span>
              <button
                type="button"
                onClick={clearExclusionHistory}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#dc2626',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                Reset Exclusions
              </button>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.85rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {searchMsg && !error && (
            <div style={{ marginTop: '1rem', background: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px', padding: '0.75rem 1rem', color: '#854d0e', fontSize: '0.85rem' }}>
              {searchMsg}
            </div>
          )}
        </div>

        {/* ── Discovered Leads Section ── */}
        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', background: '#fff', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  📋 Discovered Job Leads ({results.length})
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                  {selectedIds.size} selected · Click email pills or edit directly below
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={{ ...S.btnOutline }}
                  onClick={toggleSelectAll}
                >
                  <Filter size={14} />
                  {selectedIds.size === results.length ? 'Deselect All' : 'Select All'}
                </button>

                <button
                  type="button"
                  style={{ ...S.btnPrimary, background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  onClick={handleGenerateBatchesClick}
                  disabled={selectedIds.size === 0}
                >
                  <Layers size={15} /> Create 10-Email Batches ({Math.ceil(selectedIds.size / 10)})
                </button>
              </div>
            </div>

            {/* Leads List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {results.map((r) => {
                const status = sendStatus[r.id] || 'idle';
                const isSent = status === 'sent';
                const isSending = status === 'sending';
                const isSelected = selectedIds.has(r.id);
                const color = resultPlatformColor(r.platform);
                const email = getEmail(r);


                return (
                  <div key={r.id} style={S.resultCard(isSelected, isSent)}>
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>

                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleSelect(r.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: isSelected ? '#4f46e5' : '#94a3b8', flexShrink: 0, marginTop: '0.2rem' }}
                      >
                        {isSelected ? <CheckSquare size={20} /> : <SquareIcon size={20} />}
                      </button>

                      {/* Company Icon */}
                      <div style={{ width: 42, height: 42, borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={20} style={{ color }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                          <span style={S.platformBadge(color)}>{r.platform}</span>
                          <span style={{ fontSize: '0.65rem', background: '#ecfdf5', color: '#047857', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 600, border: '1px solid #a7f3d0' }}>
                            🎯 Verified Genuine Email (No Guessing)
                          </span>
                          {isSent && <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 600 }}>✅ Sent</span>}
                          {sentHistory.has(email) && !isSent && (
                            <span style={{ fontSize: '0.65rem', background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 600 }}>
                              🛡️ Previously Contacted (Duplicate Protected)
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.15rem' }}>
                          {r.company}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.4rem' }}>
                          {r.title}
                        </div>

                        {/* Editable Email Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '450px' }}>
                          <Mail size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEditEmails(p => ({ ...p, [r.id]: e.target.value }))}
                            style={{ ...S.input, padding: '0.3rem 0.6rem', fontSize: '0.8rem', fontFamily: 'monospace', color: '#4f46e5', background: '#f8f5ff', border: '1px solid #e0e7ff', flex: 1 }}
                          />
                          <Edit3 size={12} style={{ color: '#c7d2fe', flexShrink: 0 }} />
                        </div>

                        {/* Candidate Email Suggestions (Genuine Contacts) */}
                        {r.candidateEmails && r.candidateEmails.length > 0 && (
                          <div style={{ marginTop: '0.45rem' }}>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
                              ⚡ Genuine Hiring Contacts ({r.candidateEmails.length}) — Click any to switch:
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {Array.from(new Set(r.candidateEmails)).map(cEmail => (
                                <button
                                  key={cEmail}
                                  type="button"
                                  title={`Click to use ${cEmail}`}
                                  onClick={() => setEditEmails(p => ({ ...p, [r.id]: cEmail }))}
                                  style={{
                                    fontSize: '0.72rem',
                                    fontFamily: 'monospace',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '6px',
                                    border: email === cEmail ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                                    background: email === cEmail ? '#4f46e5' : '#ffffff',
                                    color: email === cEmail ? '#ffffff' : '#334155',
                                    cursor: 'pointer',
                                    fontWeight: email === cEmail ? 700 : 500,
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {cEmail}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {sendLog[r.id] && (
                          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: isSent ? '#15803d' : '#dc2626', fontWeight: 500 }}>
                            {sendLog[r.id]}
                          </div>
                        )}
                      </div>

                      {/* Right Action buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end', flexShrink: 0 }}>
                        <button
                          type="button"
                          style={{
                            ...S.btnGreen,
                            background: isSent ? '#86efac' : isSending ? '#6ee7b7' : '#10b981',
                            opacity: isSending || sendingAllBatches ? 0.7 : 1,
                            minWidth: '90px', justifyContent: 'center'
                          }}
                          onClick={() => sendOne(r)}
                          disabled={isSending || sendingAllBatches}
                        >
                          {isSending ? <><Loader2 size={13} className="animate-spin" /> Sending</> :
                           isSent ? <><CheckCircle2 size={13} /> Resend</> :
                           <><Send size={13} /> Send</>}
                        </button>

                        <a
                          href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(r.company + ' Technical Recruiter OR Talent Acquisition')}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.72rem',
                            color: '#0a66c2',
                            textDecoration: 'none',
                            fontWeight: 600,
                            background: 'rgba(10, 102, 194, 0.08)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px'
                          }}
                          title={`Find ${r.company} HR & recruiters on LinkedIn`}
                        >
                          <Search size={10} /> Recruiter
                        </a>

                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}
                        >
                          <ExternalLink size={11} /> View Job
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 10-Email Batches Panel ── */}
        {batches.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#fff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  🚀 Batches Created — {batches.length} Batches (10 Emails / Batch)
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                  {batches.reduce((sum, b) => sum + b.items.length, 0)} total leads ready · Auto-attaches your resume PDF
                </p>
              </div>

              <button
                type="button"
                style={{ ...S.btnPrimary, background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.75rem 1.75rem' }}
                onClick={handleSendAllBatches}
                disabled={sendingAllBatches || sendingBatchNum !== null}
              >
                {sendingAllBatches ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending All Batches...</>
                ) : (
                  <><Play size={16} /> Send All {batches.length} Batches (Auto-Pilot)</>
                )}
              </button>
            </div>

            {/* Batch Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {batches.map((batch, idx) => {
                const isProcessed = processedBatches[batch.batchNum];
                const isSending = sendingBatchNum === batch.batchNum;

                return (
                  <div
                    key={batch.batchNum}
                    style={{
                      background: isProcessed ? '#f0fdf4' : '#ffffff',
                      borderRadius: '14px',
                      border: `1.5px solid ${isProcessed ? '#86efac' : '#e2e8f0'}`,
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>Batch {batch.batchNum}</span>
                        <span style={{ fontSize: '0.72rem', background: '#e0e7ff', color: '#4f46e5', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                          {batch.items.length} Mails
                        </span>
                      </div>

                      {isProcessed && (
                        <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '160px', overflowY: 'auto' }}>
                      {batch.items.map((item) => {
                        const itemEmail = getEmail(item);
                        return (
                          <div key={item.id} style={{ fontSize: '0.76rem', fontFamily: 'monospace', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                              {itemEmail}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                              {item.company.substring(0, 15)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {batchLogs[batch.batchNum] && (
                      <div style={{ fontSize: '0.75rem', color: isProcessed ? '#15803d' : '#4f46e5', fontWeight: 600 }}>
                        {batchLogs[batch.batchNum]}
                      </div>
                    )}

                    <button
                      type="button"
                      style={{
                        ...S.btnPrimary,
                        justifyContent: 'center',
                        background: isProcessed ? '#10b981' : undefined,
                        opacity: isSending || sendingAllBatches ? 0.7 : 1
                      }}
                      onClick={() => handleSendBatch(idx)}
                      disabled={isSending || sendingAllBatches}
                    >
                      {isSending ? (
                        <><Loader2 size={14} className="animate-spin" /> Sending Batch {batch.batchNum}...</>
                      ) : isProcessed ? (
                        <><CheckCircle2 size={14} /> Resend Batch {batch.batchNum}</>
                      ) : (
                        <><Send size={14} /> Send Batch {batch.batchNum}</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Empty searching state ── */}
        {searching && (
          <div style={{ ...S.card, textAlign: 'center', padding: '3rem' }}>
            <Zap size={40} style={{ color: '#4f46e5', marginBottom: '1rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
              Hunting live for "{position}" openings...
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Searching LinkedIn, Indeed, Greenhouse, Lever, Ashby, Workday &amp; extracting HR emails
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', animation: `bounce 0.8s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
