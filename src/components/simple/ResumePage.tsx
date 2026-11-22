import React, { useEffect, useState } from 'react';
import { ExternalLink, FileText, Upload } from 'lucide-react';
import { toast } from '../../toast';
import { getApiBase } from '../../config';
import { ROLE_COLOR, ROLE_LABEL, RESUME_FILE, type Role } from '../../lib/core';

interface Info { role: Role; exists: boolean; fileName: string; sizeBytes?: number; updatedAt?: string }

const fmtSize = (b?: number) => (!b ? '' : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);

/** Two resumes side by side: Backend & AI and Python Backend. Each can be viewed or replaced. */
export const ResumePage: React.FC = () => {
  const [infos, setInfos] = useState<Partial<Record<Role, Info>>>({});
  const [busy, setBusy] = useState<Role | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`${getApiBase()}/api/resumes`);
      const data = await res.json();
      if (data.success) setInfos(Object.fromEntries(data.resumes.map((r: Info) => [r.role, r])));
    } catch {
      toast.error('Backend not reachable — is server.js running?');
    }
  };

  useEffect(() => { load(); }, []);

  const upload = (role: Role, file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) return toast.error('Only PDF files');
    if (file.size > 15 * 1024 * 1024) return toast.error('PDF must be under 15 MB');
    setBusy(role);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/upload-resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfBase64: reader.result, originalName: file.name, roleType: role }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        toast.success(`${ROLE_LABEL[role]} resume updated`);
        await load();
      } catch (e: any) {
        toast.error(`Upload failed: ${e.message}`);
      } finally {
        setBusy(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page">
      <div className="glass-card">
        <h2 className="page-title">Resume Manager</h2>
        <p className="page-sub">Active resume for AI / GenAI QA and QA Engineer (Manual & API) campaigns.</p>
      </div>

      <div className="cols">
        {(['ai', 'backend'] as Role[]).map(role => {
          const info = infos[role];
          return (
            <div key={role} className="glass-card stack" style={{ borderTop: `4px solid ${ROLE_COLOR[role]}` }}
              onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); upload(role, e.dataTransfer.files?.[0]); }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{ROLE_LABEL[role]}</span>
                <FileText size={20} style={{ color: ROLE_COLOR[role] }} />
              </div>

              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 600 }}>{RESUME_FILE[role]}</div>
                <div style={{ color: info?.exists ? 'var(--text-muted)' : '#ef4444', fontSize: '0.78rem' }}>
                  {!info ? 'Checking…' : info.exists ? `${fmtSize(info.sizeBytes)} · updated ${new Date(info.updatedAt!).toLocaleString()}` : 'Missing — upload a PDF'}
                </div>
              </div>

              <div className="row" style={{ gap: '0.5rem' }}>
                {info?.exists && (
                  <button type="button" className="btn-secondary btn-sm" onClick={() => window.open(`${getApiBase()}/${RESUME_FILE[role]}?t=${Date.now()}`, '_blank')}>
                    <ExternalLink size={13} /> View
                  </button>
                )}
                <label className="btn-primary btn-sm" style={{ background: ROLE_COLOR[role], cursor: busy ? 'wait' : 'pointer' }}>
                  <Upload size={13} /> {busy === role ? 'Uploading…' : info?.exists ? 'Replace PDF' : 'Upload PDF'}
                  <input type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} disabled={busy !== null}
                    onChange={e => { upload(role, e.target.files?.[0]); e.target.value = ''; }} />
                </label>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Or drop a PDF on this card.</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
