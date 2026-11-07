import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MonitorPlay } from 'lucide-react';
import { DemoRoleModal, DEMO_TARGETS } from '../../components/common/DemoRoleModal';
import { useAuth } from '../../context/AuthContext';
import { HomeCtx, reducedMotion, useInView, type HomeActions, type LevelKey } from './home/hooks';
import { HomeHeader } from './home/HomeHeader';
import { Hero } from './home/Hero';
import { ProductPreview } from './home/ProductPreview';
import './home/home.css';

// Everything below the first screen is split into its own chunks and loaded as the visitor scrolls (or when the browser is idle).
const loaders = {
  features: () => import('./home/Features').then((m) => ({ default: m.Features })),
  studios: () => import('./home/Features').then((m) => ({ default: m.Studios })),
  roles: () => import('./home/Roles').then((m) => ({ default: m.Roles })),
  curriculum: () => import('./home/Curriculum').then((m) => ({ default: m.Curriculum })),
  board: () => import('./home/Showcase').then((m) => ({ default: m.SmartBoardShowcase })),
  stats: () => import('./home/Showcase').then((m) => ({ default: m.Stats })),
  connectivity: () => import('./home/Showcase').then((m) => ({ default: m.Connectivity })),
  faq: () => import('./home/Closing').then((m) => ({ default: m.Faq })),
  cta: () => import('./home/Closing').then((m) => ({ default: m.FinalCta })),
  footer: () => import('./home/Closing').then((m) => ({ default: m.HomeFooter })),
};
const L = {
  features: lazy(loaders.features), studios: lazy(loaders.studios), roles: lazy(loaders.roles), curriculum: lazy(loaders.curriculum), board: lazy(loaders.board),
  stats: lazy(loaders.stats), connectivity: lazy(loaders.connectivity), faq: lazy(loaders.faq), cta: lazy(loaders.cta), footer: lazy(loaders.footer),
};

/** Mounts its section only when it is near the viewport (or when forced), reserving space so the page does not jump. */
const Defer: React.FC<{ force: boolean; height: number; children: React.ReactNode }> = ({ force, height, children }) => {
  const [ref, seen] = useInView<HTMLDivElement>('900px 0px 900px 0px');
  const show = force || seen;
  return <div ref={ref} style={show ? undefined : { minHeight: height }}>{show && <Suspense fallback={<div style={{ minHeight: height }} aria-busy="true" />}>{children}</Suspense>}</div>;
};

export const PublicHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [tourOpen, setTourOpen] = useState(false);
  const [level, setLevel] = useState<LevelKey>('secondary');
  const [mountAll, setMountAll] = useState(false);
  const [launching, setLaunching] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number>(0);

  useEffect(() => {
    document.documentElement.classList.toggle('nh-smooth', !reducedMotion());
    const idle = (window as any).requestIdleCallback || ((cb: () => void) => window.setTimeout(cb, 1800));
    const h = idle(() => Object.values(loaders).forEach((l) => l()), { timeout: 4000 });
    return () => { document.documentElement.classList.remove('nh-smooth'); (window as any).cancelIdleCallback?.(h); };
  }, []);

  const go = useCallback((id: string) => {
    setMountAll(true);
    let tries = 0;
    const attempt = () => {
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' }); window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 700); return; }
      if (tries++ < 40) window.setTimeout(attempt, 60);
    };
    window.setTimeout(attempt, 30);
  }, []);

  const say = (m: string) => { setToast(m); window.clearTimeout(toastTimer.current); toastTimer.current = window.setTimeout(() => setToast(''), 5000); };

  const actions: HomeActions = useMemo(() => ({
    openDemo: () => navigate('/login'),
    launchRole: () => navigate('/login'),
    login: (superAdmin) => navigate(superAdmin ? '/super-admin-login' : '/login'),
    register: () => navigate('/register'),
    status: () => navigate('/institution-registration-status'),
    smartBoard: () => { window.open('/smartboard/index.html', '_blank', 'noopener'); },
    tour: () => setTourOpen(true),
    go,
    chooseLevel: setLevel,
    level,
    launching,
  }), [navigate, go, level, launching]);

  useEffect(() => {
    if (!tourOpen) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setTourOpen(false);
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [tourOpen]);

  return (
    <HomeCtx.Provider value={actions}>
      <div className="nh">
        <a href="#main" style={{ position: 'absolute', left: -9999 }} onFocus={(e) => (e.currentTarget.style.left = '12px')} onBlur={(e) => (e.currentTarget.style.left = '-9999px')}>Skip to content</a>
        <HomeHeader />
        <main id="main">
          <Hero />
          <ProductPreview />
          <Defer force={mountAll} height={900}><L.features /></Defer>
          <Defer force={mountAll} height={700}><L.studios /></Defer>
          <Defer force={mountAll} height={900}><L.roles /></Defer>
          <Defer force={mountAll} height={900}><L.curriculum /></Defer>
          <Defer force={mountAll} height={560}><L.board /></Defer>
          <Defer force={mountAll} height={560}><L.stats /></Defer>
          <Defer force={mountAll} height={640}><L.connectivity /></Defer>
          <Defer force={mountAll} height={700}><L.faq /></Defer>
          <Defer force={mountAll} height={420}><L.cta /></Defer>
        </main>
        <Defer force={mountAll} height={420}><L.footer /></Defer>

        {tourOpen && (
          <div className="nh-modal" role="presentation" onClick={() => setTourOpen(false)}>
            <div className="nh-modal-in" role="dialog" aria-modal="true" aria-labelledby="tour-title" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 id="tour-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18 }}><MonitorPlay size={20} color="#117a6b" /> Platform tour</h3>
                <button type="button" aria-label="Close" onClick={() => setTourOpen(false)} autoFocus><X size={20} /></button>
              </div>
              <img src="/assets/brand/online_smartboard_lecture.jpg" alt="A classroom lesson on a Smart Board" style={{ width: '100%', borderRadius: 14, maxHeight: 340, objectFit: 'cover' }} loading="lazy" />
              <h4 style={{ marginTop: 16, fontSize: 17 }}>Smart Board, CDC textbooks and assessment in one place</h4>
              <p style={{ marginTop: 6, fontSize: 14 }}>Interactive whiteboard with a split-screen textbook, handwriting OCR for assignments, and conflict-checked timetable scheduling.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <button type="button" className="nh-btn nh-btn-primary" onClick={() => { setTourOpen(false); navigate('/login'); }}>Sign in to the platform</button>
                <button type="button" className="nh-btn nh-btn-ghost" onClick={actions.smartBoard}>Open Smart Board</button>
              </div>
            </div>
          </div>
        )}
        {toast && <div className="nh-toast" role="alert">{toast}</div>}
      </div>
    </HomeCtx.Provider>
  );
};

export default PublicHomePage;
