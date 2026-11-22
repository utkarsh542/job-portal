import { useEffect, useState } from 'react';
import { Clock, FileSpreadsheet, FileText, Inbox, Send, Sparkles } from 'lucide-react';
import { ToastContainer } from './toast';
import { ApplyPage } from './components/simple/ApplyPage';
import { AIHunt } from './components/AIHunt';
import { DraftsPage } from './components/simple/DraftsPage';
import { FollowUpPage } from './components/simple/FollowUpPage';
import { ResumePage } from './components/simple/ResumePage';

type Page = 'apply' | 'hunt' | 'drafts' | 'followup' | 'resume';

const PAGES: { id: Page; path: string; label: string; icon: typeof Send }[] = [
  { id: 'apply', path: '/', label: 'Apply', icon: Send },
  { id: 'hunt', path: '/hunt', label: 'Job Hunt', icon: Sparkles },
  { id: 'drafts', path: '/drafts', label: 'Drafts', icon: Inbox },
  { id: 'followup', path: '/followup', label: 'Follow-up', icon: Clock },
  { id: 'resume', path: '/resume', label: 'Resumes', icon: FileText },
];

// Old links keep working
const ALIASES: Record<string, Page> = {
  '/direct-send': 'apply', '/bulk-paste': 'apply',
  '/hunt': 'hunt', '/job-hunt': 'hunt', '/ai-hunt': 'hunt',
  '/gmail-drafts': 'drafts', '/gmail-sent': 'followup',
};

const REPO_BASE = () => (window.location.pathname.startsWith('/job-portal') ? '/job-portal' : '');

// Supports GitHub Pages subpath /job-portal, 404 ?p= redirect, and #/hash routes
const readRoute = (): string => {
  const p = new URLSearchParams(window.location.search).get('p');
  if (p) {
    const clean = decodeURIComponent(p).replace(/^\/?/, '/');
    window.history.replaceState(null, '', `${REPO_BASE()}${clean}`);
    return clean;
  }
  if (window.location.hash) return window.location.hash.replace(/^#\/?/, '/');
  let path = window.location.pathname;
  if (path.startsWith('/job-portal')) path = path.slice('/job-portal'.length);
  return path.replace(/\/+$/, '') || '/';
};

const pageFor = (route: string): Page =>
  PAGES.find(p => p.path === route)?.id || ALIASES[route] || 'apply';

function App() {
  const [page, setPage] = useState<Page>(() => pageFor(readRoute()));

  useEffect(() => {
    const onNav = () => setPage(pageFor(readRoute()));
    window.addEventListener('popstate', onNav);
    window.addEventListener('hashchange', onNav);
    return () => {
      window.removeEventListener('popstate', onNav);
      window.removeEventListener('hashchange', onNav);
    };
  }, []);

  const go = (id: Page) => {
    const path = PAGES.find(p => p.id === id)!.path;
    window.history.pushState({}, '', `${REPO_BASE()}${path}`);
    setPage(id);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container">
      <ToastContainer />
      <header className="app-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="brand-section" style={{ cursor: 'pointer' }} onClick={() => go('apply')}>
          <div className="brand-icon-wrapper">
            <FileSpreadsheet size={24} style={{ color: 'white' }} />
          </div>
          <h1 className="brand-title">SheetSync</h1>
        </div>
        <nav className="seg" style={{ background: '#fff', border: '1px solid var(--border-color)' }}>
          {PAGES.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={page === id ? 'on' : ''} onClick={() => go(id)}
              style={page === id ? { background: 'var(--accent-color)', color: '#fff' } : undefined}>
              <Icon size={14} style={{ verticalAlign: '-2px', marginRight: 5 }} />
              {label}
            </button>
          ))}
        </nav>
      </header>

      {page === 'apply' && <ApplyPage />}
      {page === 'hunt' && <AIHunt />}
      {page === 'drafts' && <DraftsPage onGoApply={() => go('apply')} />}
      {page === 'followup' && <FollowUpPage />}
      {page === 'resume' && <ResumePage />}
    </div>
  );
}

export default App;
