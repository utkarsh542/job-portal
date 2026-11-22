import React from 'react';
import { ROLE_TEMPLATES, type RoleTemplate } from '../templates';
import { CheckCircle2, FileCheck, Server, Sparkles } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: string;
  onSelectRole: (template: RoleTemplate) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  qa: <CheckCircle2 size={14} />,
  ai_qa: <Sparkles size={14} />,
  api_sdet: <Server size={14} />,
  manual_qa: <FileCheck size={14} />
};

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelectRole }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label className="modal-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
        Select Role Outreach Template:
      </label>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {ROLE_TEMPLATES.map((tmpl) => {
          const isSelected = selectedRole === tmpl.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectRole(tmpl)}
              className={isSelected ? 'btn-primary' : 'btn-secondary'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {ICONS[tmpl.id] || <Server size={14} />}
              <span>{tmpl.label}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(99,102,241,0.08)',
                  color: isSelected ? '#ffffff' : 'var(--accent-color)'
                }}
              >
                {tmpl.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
