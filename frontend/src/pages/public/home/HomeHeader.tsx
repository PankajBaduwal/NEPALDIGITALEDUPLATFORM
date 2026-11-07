import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X, MonitorPlay, ClipboardList, FileQuestion, CalendarCheck, CalendarDays, Sparkles, Layers, GraduationCap, School, Users, UserCheck, BookOpen, ShieldAlert, Library, Settings2 } from 'lucide-react';
import { useHome, type LevelKey } from './hooks';

type Item = { label: string; desc?: string; icon: React.ElementType; to?: string; level?: LevelKey };
type Group = { key: string; label: string; items: Item[]; watch: string[] };

const GROUPS: Group[] = [
  { key: 'features', label: 'Features', watch: ['features'], items: [
    { label: 'Smart Board', desc: 'Whiteboard with textbook split view', icon: MonitorPlay, to: 'smartboard' },
    { label: 'Assignment Studio', icon: ClipboardList, to: 'f-assignment' },
    { label: 'Quiz & Examination', icon: FileQuestion, to: 'f-exam' },
    { label: 'Attendance', icon: CalendarCheck, to: 'f-analytics' },
    { label: 'Timetable', icon: CalendarDays, to: 'f-admin' },
    { label: 'AI Learning Assistant', icon: Sparkles, to: 'f-ai' },
  ] },
  { key: 'studios', label: 'Platform Studios', watch: ['studios'], items: [
    { label: 'Smart Board Studio', icon: MonitorPlay, to: 'studio-smartboard' },
    { label: 'Assessment Studio', icon: FileQuestion, to: 'studio-assessment' },
    { label: 'Learning Studio', icon: BookOpen, to: 'studio-learning' },
    { label: 'Academic Operations Studio', icon: Settings2, to: 'studio-operations' },
  ] },
  { key: 'roles', label: 'Role Portals', watch: ['portals'], items: [
    { label: 'Principal', icon: ShieldAlert, to: 'role-principal' }, { label: 'School Admin', icon: School, to: 'role-admin' },
    { label: 'Class Teacher', icon: UserCheck, to: 'role-class' }, { label: 'Subject Teacher', icon: Users, to: 'role-teacher' },
    { label: 'Student', icon: GraduationCap, to: 'role-student' }, { label: 'Super Admin', icon: Layers, to: 'role-super' },
  ] },
  { key: 'cdc', label: 'CDC Curriculum', watch: ['curriculum'], items: [
    { label: 'Primary', desc: 'Classes 1–5', icon: Library, level: 'primary' }, { label: 'Basic', desc: 'Classes 6–8', icon: Library, level: 'basic' },
    { label: 'Secondary', desc: 'Classes 9–10', icon: Library, level: 'secondary' }, { label: 'Higher Secondary', desc: 'Classes 11–12', icon: Library, level: 'higher' },
  ] },
];

export const HomeHeader: React.FC = () => {
  const h = useHome();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [active, setActive] = useState('');
  const timer = useRef<number>(0);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    const ids = ['features', 'studios', 'portals', 'curriculum', 'faq'];
    const els = ids.map((i) => document.getElementById(i)).filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(null); setDrawer(false); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);
  useEffect(() => { document.body.style.overflow = drawer ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [drawer]);

  const pick = (it: Item) => { setOpen(null); setDrawer(false); if (it.level) { h.chooseLevel(it.level); h.go('curriculum'); } else if (it.to) h.go(it.to); };
  const enter = (k: string) => { window.clearTimeout(timer.current); setOpen(k); };
  const leave = () => { timer.current = window.setTimeout(() => setOpen(null), 140); };

  return (
    <header className={`nh-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="nh-wrap nh-bar">
        <button type="button" className="nh-brand" onClick={() => { window.scrollTo({ top: 0 }); }} aria-label="Nepal Digital Education Platform, back to top">
          <img className="nh-brand-logo" src="/brand/logo/logo-horizontal.svg" alt="Nepal Digital Education Platform" width="165" height="40" />
        </button>

        <nav className="nh-nav" aria-label="Main" ref={navRef} onBlur={(e) => { if (!navRef.current?.contains(e.relatedTarget as Node)) setOpen(null); }}>
          {GROUPS.map((g) => (
            <div key={g.key} className={`nh-nav-item ${open === g.key ? 'open' : ''}`} onMouseEnter={() => enter(g.key)} onMouseLeave={leave}>
              <button type="button" className={`nh-nav-btn ${g.watch.includes(active) ? 'active' : ''}`} aria-expanded={open === g.key} aria-haspopup="true" onClick={() => setOpen(open === g.key ? null : g.key)}>
                {g.label} <ChevronDown size={14} />
              </button>
              <div className="nh-dd" role="menu" aria-label={g.label}>
                {g.items.map((it) => (
                  <button key={it.label} type="button" role="menuitem" onClick={() => pick(it)} tabIndex={open === g.key ? 0 : -1}>
                    <span className="nh-dd-ic"><it.icon size={16} /></span><span>{it.label}{it.desc && <small>{it.desc}</small>}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button type="button" className={`nh-nav-btn ${active === 'faq' ? 'active' : ''}`} onClick={() => h.go('faq')}>FAQ</button>
        </nav>

        <div className="nh-right">
          <span className="nh-flag" title="Made for Nepal"><span aria-hidden="true">🇳🇵</span> Nepal</span>
          <button type="button" className="nh-btn nh-btn-ghost nh-btn-sm nh-hide-m" onClick={h.openDemo}>Demo Portals</button>
          <button type="button" className="nh-btn nh-btn-ghost nh-btn-sm nh-hide-m" onClick={() => h.login()}>Login</button>
          <button type="button" className="nh-btn nh-btn-primary nh-btn-sm nh-hide-m" onClick={h.register}>Register School</button>
        </div>
        <button type="button" className="nh-burger" aria-label={drawer ? 'Close menu' : 'Open menu'} aria-expanded={drawer} onClick={() => setDrawer(!drawer)}>{drawer ? <X size={20} /> : <Menu size={20} />}</button>
      </div>

      <div className={`nh-drawer ${drawer ? 'open' : ''}`} aria-hidden={!drawer}>
        {GROUPS.map((g) => (
          <div key={g.key}><h4>{g.label}</h4>{g.items.map((it) => <button key={it.label} type="button" className="row" tabIndex={drawer ? 0 : -1} onClick={() => pick(it)}>{it.label}{it.desc ? ` · ${it.desc}` : ''}</button>)}</div>
        ))}
        <h4>More</h4>
        <button type="button" className="row" tabIndex={drawer ? 0 : -1} onClick={() => { setDrawer(false); h.go('faq'); }}>FAQ</button>
        <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
          <button type="button" className="nh-btn nh-btn-primary" tabIndex={drawer ? 0 : -1} onClick={() => { setDrawer(false); h.openDemo(); }}>Demo Portals</button>
          <button type="button" className="nh-btn nh-btn-ghost" tabIndex={drawer ? 0 : -1} onClick={() => { setDrawer(false); h.login(); }}>Login</button>
          <button type="button" className="nh-btn nh-btn-ghost" tabIndex={drawer ? 0 : -1} onClick={() => { setDrawer(false); h.register(); }}>Register School</button>
        </div>
      </div>
    </header>
  );
};
