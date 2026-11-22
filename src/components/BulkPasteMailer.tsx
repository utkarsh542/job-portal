import React, { useState, useMemo, useEffect } from 'react';
import { Mail, CheckCircle2, Loader2, Paperclip, Send, Layers, Trash2, Play, ExternalLink, RefreshCw, Code, Cpu } from 'lucide-react';
import { toast } from '../toast';
import { getApiBase } from '../config';
import { BACKEND_AI_TEMPLATE, PYTHON_BACKEND_TEMPLATE, FOLLOWUP_TEMPLATE } from '../templates';
import { ResumeUploader } from './ResumeUploader';

export const BulkPasteMailer: React.FC = () => {
  const [campaignType, setCampaignType] = useState<'fresh' | 'followup'>(() => {
    const saved = localStorage.getItem('sheetSync_campaignType');
    return saved === 'followup' ? 'followup' : 'fresh';
  });

  const [selectedRole, setSelectedRole] = useState<'ai' | 'backend'>(() => {
    const savedRole = localStorage.getItem('sheetSync_bulkRole');
    return savedRole === 'backend' ? 'backend' : 'ai';
  });

  const [rawText, setRawText] = useState(() => localStorage.getItem('sheetSync_bulkPastedEmails') || '');
  const [subject, setSubject] = useState(() => {
    if (campaignType === 'followup') {
      return FOLLOWUP_TEMPLATE.subject;
    }
    return selectedRole === 'ai' ? BACKEND_AI_TEMPLATE.subject : PYTHON_BACKEND_TEMPLATE.subject;
  });
  const [bodyTemplate, setBodyTemplate] = useState(() => {
    if (campaignType === 'followup') {
      return FOLLOWUP_TEMPLATE.body;
    }
    return selectedRole === 'ai' ? BACKEND_AI_TEMPLATE.body : PYTHON_BACKEND_TEMPLATE.body;
  });

  const [smtpUser, setSmtpUser] = useState(() => {
    const saved = (localStorage.getItem('sheetSync_smtpUser') || '').trim();
    if (!saved || saved === 'gutkarsh191@gmail.com' || saved.toLowerCase().includes('utkarsh')) {
      localStorage.setItem('sheetSync_smtpUser', 'kmcheshtamzn@gmail.com');
      return 'kmcheshtamzn@gmail.com';
    }
    return saved;
  });
  const [smtpPass, setSmtpPass] = useState(() => {
    let p = (localStorage.getItem('sheetSync_smtpPass') || '').replace(/\s+/g, '');
    if (!p || p === 'akqltiacqtgtptsw') {
      p = 'bixwjrotqbhdelun';
      try { localStorage.setItem('sheetSync_smtpPass', p); } catch {}
    }
    return p;
  });

  const [processedBatches, setProcessedBatches] = useState<Record<number, boolean>>({});
  const [sendingBatchIndex, setSendingBatchIndex] = useState<number | null>(null);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [batchLogs, setBatchLogs] = useState<Record<number, string>>({});

  // Sync with campaignType & role saved in localStorage (e.g. set by GmailDraftsManager export)
  const syncWithLocalStorage = () => {
    const savedCampaign = localStorage.getItem('sheetSync_campaignType');
    const savedRole = localStorage.getItem('sheetSync_bulkRole');
    const savedText = localStorage.getItem('sheetSync_bulkPastedEmails');

    if (savedText !== null) {
      setRawText(savedText);
    }

    const role = savedRole === 'backend' ? 'backend' : 'ai';
    setSelectedRole(role);

    if (savedCampaign === 'followup') {
      setCampaignType('followup');
      setSubject(FOLLOWUP_TEMPLATE.subject);
      setBodyTemplate(FOLLOWUP_TEMPLATE.body);
    } else {
      setCampaignType('fresh');
      setSubject(role === 'ai' ? BACKEND_AI_TEMPLATE.subject : PYTHON_BACKEND_TEMPLATE.subject);
      setBodyTemplate(role === 'ai' ? BACKEND_AI_TEMPLATE.body : PYTHON_BACKEND_TEMPLATE.body);
    }
  };

  useEffect(() => {
    syncWithLocalStorage();

    const handleStorageChange = () => syncWithLocalStorage();
    window.addEventListener('popstate', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('popstate', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleRoleSwitch = (role: 'ai' | 'backend') => {
    setSelectedRole(role);
    localStorage.setItem('sheetSync_bulkRole', role);
    if (campaignType === 'followup') {
      setSubject(FOLLOWUP_TEMPLATE.subject);
      setBodyTemplate(FOLLOWUP_TEMPLATE.body);
    } else {
      setSubject(role === 'ai' ? BACKEND_AI_TEMPLATE.subject : PYTHON_BACKEND_TEMPLATE.subject);
      setBodyTemplate(role === 'ai' ? BACKEND_AI_TEMPLATE.body : PYTHON_BACKEND_TEMPLATE.body);
    }
    toast.info(role === 'ai' ? '🤖 Switched to AI / GenAI QA Role' : '⚙️ Switched to QA Engineer (Manual & API) Role');
  };

  const handleSwitchCampaignType = (type: 'fresh' | 'followup') => {
    setCampaignType(type);
    localStorage.setItem('sheetSync_campaignType', type);
    if (type === 'fresh') {
      setSubject(selectedRole === 'ai' ? BACKEND_AI_TEMPLATE.subject : PYTHON_BACKEND_TEMPLATE.subject);
      setBodyTemplate(selectedRole === 'ai' ? BACKEND_AI_TEMPLATE.body : PYTHON_BACKEND_TEMPLATE.body);
      toast.info('✉️ Switched to Fresh Outreach Mail Template');
    } else {
      setSubject(FOLLOWUP_TEMPLATE.subject);
      setBodyTemplate(FOLLOWUP_TEMPLATE.body);
      toast.info('🔄 Switched to Follow-Up Reminder Mail Template');
    }
  };

  // Helper to remove a single successfully sent email from rawText state and localStorage
  const removeEmailFromRawText = (targetEmail: string) => {
    const cleanTarget = targetEmail.trim().toLowerCase();
    setRawText(currentRawText => {
      const lines = currentRawText.split(/\r?\n/);
      const remainingLines: string[] = [];

      for (const line of lines) {
        const tokens = line.split(/([\s,;]+)/);
        const newTokens: string[] = [];

        for (const tok of tokens) {
          const cleanTok = tok.trim().toLowerCase().replace(/^["']|["']$/g, '');
          if (cleanTok === cleanTarget) {
            continue;
          }
          newTokens.push(tok);
        }

        const rebuiltLine = newTokens.join('').replace(/^[\s,;]+|[\s,;]+$/g, '').trim();
        if (rebuiltLine) {
          remainingLines.push(rebuiltLine);
        }
      }

      const nextRawText = remainingLines.join('\n');
      localStorage.setItem('sheetSync_bulkPastedEmails', nextRawText);
      return nextRawText;
    });
  };

  // Parse emails out of raw text input (handles newlines, commas, semicolons, spaces)
  const parsedEmails = useMemo(() => {
    if (!rawText.trim()) return [];

    // Regex matching valid emails
    const tokens = rawText.split(/[\s,;\n\r]+/);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validEmails: string[] = [];
    const seen = new Set<string>();

    tokens.forEach(token => {
      const cleanToken = token.trim().toLowerCase().replace(/^["']|["']$/g, '');
      if (cleanToken && emailRegex.test(cleanToken) && !seen.has(cleanToken)) {
        seen.add(cleanToken);
        validEmails.push(cleanToken);
      }
    });

    return validEmails;
  }, [rawText]);

  // Group emails into batches of 10
  const batches = useMemo(() => {
    const chunkSize = 10;
    const result: string[][] = [];
    for (let i = 0; i < parsedEmails.length; i += chunkSize) {
      result.push(parsedEmails.slice(i, i + chunkSize));
    }
    return result;
  }, [parsedEmails]);

  // Toast when emails are pasted/extracted
  const [lastNotifiedCount, setLastNotifiedCount] = useState(0);
  useEffect(() => {
    if (parsedEmails.length > 0 && parsedEmails.length !== lastNotifiedCount) {
      setLastNotifiedCount(parsedEmails.length);
      toast.success(`📋 Loaded ${parsedEmails.length} email addresses into ${batches.length} bulk batches!`);
    }
  }, [parsedEmails.length, batches.length, lastNotifiedCount]);

  // Send a specific batch index
  const handleSendBatch = async (batchIdx: number) => {
    const targetEmails = [...(batches[batchIdx] || [])];
    if (!targetEmails || targetEmails.length === 0) return;

    setSendingBatchIndex(batchIdx);
    setBatchLogs(prev => ({ ...prev, [batchIdx]: `Sending batch to ${targetEmails.length} recipients...` }));
    toast.info(`🚀 Starting batch ${batchIdx + 1} send (${targetEmails.length} recipients)...`);

    // Save SMTP credentials
    localStorage.setItem('sheetSync_smtpUser', smtpUser);
    localStorage.setItem('sheetSync_smtpPass', smtpPass);

    let successCount = 0;
    let failCount = 0;

    for (const email of targetEmails) {
      try {
        const res = await fetch(`${getApiBase()}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            smtpUser: smtpUser.trim(),
            smtpPass: smtpPass.trim(),
            to: email,
            subject: subject.trim(),
            body: bodyTemplate.trim(),
            roleType: selectedRole,
            resumeFileName: 'Cheshta_Verma.pdf'
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
          removeEmailFromRawText(email);
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setProcessedBatches(prev => ({ ...prev, [batchIdx]: true }));
    setSendingBatchIndex(null);
    const logText = `Batch ${batchIdx + 1}: ${successCount} sent, ${failCount} failed.`;
    setBatchLogs(prev => ({ ...prev, [batchIdx]: logText }));

    if (successCount > 0) {
      toast.success(`✅ Batch ${batchIdx + 1} completed! ${successCount} sent, ${failCount} failed.`);
    } else {
      toast.error(`❌ Batch ${batchIdx + 1} failed for all recipients.`);
    }
  };

  // Run all emails sequentially
  const handleSendAllBatches = async () => {
    if (parsedEmails.length === 0) return;
    setIsSendingAll(true);

    const emailList = [...parsedEmails];
    toast.info(`🚀 Processing all ${emailList.length} emails (${batches.length} batches)...`);

    // Save SMTP credentials
    localStorage.setItem('sheetSync_smtpUser', smtpUser);
    localStorage.setItem('sheetSync_smtpPass', smtpPass);

    let totalSuccess = 0;
    let totalFail = 0;

    for (let i = 0; i < emailList.length; i++) {
      const email = emailList[i];
      const currentBatchIdx = Math.floor(i / 10);
      setSendingBatchIndex(currentBatchIdx);
      setBatchLogs(prev => ({ ...prev, [currentBatchIdx]: `Sending ${i + 1}/${emailList.length}: ${email}` }));

      try {
        const res = await fetch(`${getApiBase()}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            smtpUser: smtpUser.trim(),
            smtpPass: smtpPass.trim(),
            to: email,
            subject: subject.trim(),
            body: bodyTemplate.trim(),
            roleType: selectedRole,
            resumeFileName: 'Cheshta_Verma.pdf'
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          totalSuccess++;
          removeEmailFromRawText(email);
        } else {
          totalFail++;
        }
      } catch {
        totalFail++;
      }
    }

    setIsSendingAll(false);
    setSendingBatchIndex(null);
    if (totalSuccess > 0) {
      toast.success(`🎉 All ${emailList.length} bulk emails processed! ${totalSuccess} sent, ${totalFail} failed.`);
    } else {
      toast.error(`❌ Bulk send failed for all ${emailList.length} recipients.`);
    }
  };

  // Open batch as Gmail web compose tabs
  const handleOpenBatchAsDrafts = (batchIdx: number) => {
    const targetEmails = batches[batchIdx];
    if (!targetEmails || targetEmails.length === 0) return;

    toast.info(`📝 Opening ${targetEmails.length} Gmail draft tabs for Batch ${batchIdx + 1}...`);
    targetEmails.forEach(email => {
      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyTemplate)}`;
      window.open(url, '_blank');
    });
  };

  // Open ALL parsed emails as Gmail web draft tabs
  const handleOpenAllAsDrafts = () => {
    if (parsedEmails.length === 0) return;
    toast.info(`📝 Opening ${parsedEmails.length} Gmail draft tabs...`);
    parsedEmails.forEach(email => {
      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyTemplate)}`;
      window.open(url, '_blank');
    });
  };

  // Clear raw input
  const handleClear = () => {
    setRawText('');
    localStorage.removeItem('sheetSync_bulkPastedEmails');
    setProcessedBatches({});
    setBatchLogs({});
    toast.info("Cleared raw text input.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Layers size={24} />
          </div>
          <div>
            <h2 className="upload-title" style={{ fontSize: '1.4rem', marginBottom: '0.15rem' }}>Bulk Raw Email Batch Mailer</h2>
            <p className="upload-hint" style={{ marginBottom: 0 }}>
              Paste raw emails, choose <b>Fresh Outreach</b> or <b>Follow-Up</b> campaign mode, and send in automated batches of 10.
            </p>
          </div>
        </div>
      </div>

      {/* Active Resume Attachment Bar */}
      <ResumeUploader compact />

      {/* Campaign Mode Switcher (Fresh vs Follow-Up) */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: campaignType === 'followup' ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-card)', borderColor: campaignType === 'followup' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {campaignType === 'fresh' ? '✉️ Mode: Fresh Outreach Email' : '🔄 Mode: Follow-Up Email Campaign'}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            {campaignType === 'fresh'
              ? 'Sends initial introduction application & resume to new HR contacts.'
              : 'Sends gentle follow-up reminder emails to previously contacted recruiters.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.05)', padding: '0.3rem', borderRadius: '12px' }}>
          <button
            type="button"
            className={campaignType === 'fresh' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => handleSwitchCampaignType('fresh')}
            style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', border: 'none' }}
          >
            <Send size={14} style={{ marginRight: '0.3rem' }} />
            Fresh Mail
          </button>
          <button
            type="button"
            className={campaignType === 'followup' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => handleSwitchCampaignType('followup')}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.8rem',
              border: 'none',
              background: campaignType === 'followup' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: campaignType === 'followup' ? '#ffffff' : undefined
            }}
          >
            <RefreshCw size={14} style={{ marginRight: '0.3rem' }} />
            Follow-Up Mail
          </button>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Raw Textarea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="modal-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: 0 }}>
              <Mail size={16} style={{ color: '#10b981' }} />
              Paste Raw HR Email Addresses (Separated by commas, newlines, or semicolons)
            </label>
            {parsedEmails.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                Found {parsedEmails.length} valid emails ({batches.length} batches of 10)
              </span>
            )}
          </div>
          <textarea
            rows={6}
            placeholder="Paste your raw list here, for example:
hr@google.com, hr@razorpay.com, careers@paytm.com
hr@cred.club; jobs@phonepe.com"
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              localStorage.setItem('sheetSync_bulkPastedEmails', e.target.value);
            }}
            className="search-input"
            style={{
              padding: '0.85rem 1rem',
              height: 'auto',
              resize: 'vertical',
              fontFamily: 'var(--font-mono)',
              lineHeight: '1.5',
              fontSize: '0.85rem'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              💡 Duplicate emails are automatically removed.
            </span>
            {rawText.trim() && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClear}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f87171' }}
              >
                <Trash2 size={12} />
                Clear Input
              </button>
            )}
          </div>
        </div>

        {/* Credentials & Role Select */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="modal-label">Sender Gmail Address</label>
            <input
              type="email"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className="search-input"
              style={{ paddingLeft: '0.75rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="modal-label">Gmail App Password</label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              className="search-input"
              style={{ paddingLeft: '0.75rem' }}
            />
          </div>
        </div>

        {/* Email Subject & Message Customizer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', borderTop: '1px solid rgba(75, 85, 99, 0.15)', paddingTop: '1rem' }}>

          {/* Role Template & Resume Selector Option */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="modal-label" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Layers size={14} style={{ color: '#6366f1' }} /> Select Role Campaign Template & Resume Attachment:
            </label>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={selectedRole === 'ai' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => handleRoleSwitch('ai')}
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: selectedRole === 'ai' ? 700 : 500,
                  background: selectedRole === 'ai' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : undefined,
                  color: selectedRole === 'ai' ? '#ffffff' : undefined,
                  borderColor: selectedRole === 'ai' ? '#8b5cf6' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Cpu size={16} />
                <span>🤖 AI / GenAI QA Engineer</span>
                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>
                  AI QA Resume PDF
                </span>
              </button>

              <button
                type="button"
                className={selectedRole === 'backend' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => handleRoleSwitch('backend')}
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: selectedRole === 'backend' ? 700 : 500,
                  background: selectedRole === 'backend' ? 'linear-gradient(135deg, #0284c7, #0ea5e9)' : undefined,
                  color: selectedRole === 'backend' ? '#ffffff' : undefined,
                  borderColor: selectedRole === 'backend' ? '#0284c7' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Code size={16} />
                <span>⚙️ QA Engineer (Manual & API)</span>
                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>
                  QA Resume PDF
                </span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="modal-label">Email Subject ({selectedRole === 'ai' ? 'AI / GENAI QA' : 'QA (MANUAL & API)'} - {campaignType.toUpperCase()} MODE)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="search-input"
              style={{ paddingLeft: '1rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="modal-label">Email Message Template ({selectedRole === 'ai' ? 'AI / GENAI QA' : 'QA (MANUAL & API)'} - {campaignType.toUpperCase()} MODE)</label>
            <textarea
              rows={6}
              value={bodyTemplate}
              onChange={(e) => setBodyTemplate(e.target.value)}
              className="search-input"
              style={{ padding: '0.75rem 1rem', height: 'auto', resize: 'vertical', fontSize: '0.85rem', lineHeight: '1.4' }}
            />
          </div>
        </div>

        {/* PDF Attachment Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: selectedRole === 'ai' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(14, 165, 233, 0.08)',
          border: selectedRole === 'ai' ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid rgba(14, 165, 233, 0.25)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Paperclip size={16} style={{ color: selectedRole === 'ai' ? '#8b5cf6' : '#0ea5e9' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: selectedRole === 'ai' ? '#8b5cf6' : '#0ea5e9' }}>
              Cheshta_Verma.pdf
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Attached automatically to all {selectedRole === 'ai' ? 'AI / GenAI QA' : 'QA Engineer'} emails)
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', background: selectedRole === 'ai' ? '#8b5cf6' : '#0ea5e9', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
            {selectedRole === 'ai' ? 'AI / GenAI QA PDF Attached' : 'QA Engineer PDF Attached'}
          </span>
        </div>
      </div>

      {/* Batches Overview & Controls */}
      {parsedEmails.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Bulk Execution Queue ({batches.length} Batches of 10)
            </span>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleOpenAllAsDrafts}
                style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
              >
                <ExternalLink size={14} />
                Open All {parsedEmails.length} as Gmail Tabs
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleSendAllBatches}
                disabled={isSendingAll || sendingBatchIndex !== null}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.82rem', background: campaignType === 'followup' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#10b981', borderColor: campaignType === 'followup' ? '#f59e0b' : '#10b981' }}
              >
                {isSendingAll ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                {isSendingAll ? 'Sending All Batches...' : `Send All ${batches.length} Batches`}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {batches.map((batchList, bIdx) => {
              const isSending = sendingBatchIndex === bIdx;
              const isDone = processedBatches[bIdx];

              return (
                <div
                  key={bIdx}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    background: isDone ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                    borderColor: isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Batch #{bIdx + 1} ({batchList.length} Emails)
                      </span>
                      {isDone && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={13} /> Completed
                        </span>
                      )}
                    </div>

                    {/* Email preview list */}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '6px', maxHeight: '80px', overflowY: 'auto' }}>
                      {batchList.map((em, idx) => (
                        <div key={idx} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          • {em}
                        </div>
                      ))}
                    </div>

                    {batchLogs[bIdx] && (
                      <div style={{ fontSize: '0.72rem', color: isDone ? '#10b981' : '#6366f1', fontWeight: 600 }}>
                        {batchLogs[bIdx]}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleOpenBatchAsDrafts(bIdx)}
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      <ExternalLink size={12} />
                      Gmail Tabs
                    </button>

                    <button
                      type="button"
                      className={isDone ? 'btn-secondary' : 'btn-primary'}
                      onClick={() => handleSendBatch(bIdx)}
                      disabled={isSending}
                      style={{ flex: 1.2, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center', background: isDone ? undefined : campaignType === 'followup' ? '#f59e0b' : '#10b981', borderColor: isDone ? undefined : campaignType === 'followup' ? '#f59e0b' : '#10b981' }}
                    >
                      {isSending ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Sending...
                        </>
                      ) : isDone ? (
                        'Resend Batch'
                      ) : (
                        <>
                          <Send size={12} />
                          Send Batch #{bIdx + 1}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
