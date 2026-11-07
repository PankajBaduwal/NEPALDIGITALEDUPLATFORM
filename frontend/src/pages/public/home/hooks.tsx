import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** True once the element has entered the viewport (once). Shows immediately when IntersectionObserver or motion is unavailable. */
export function useInView<T extends HTMLElement>(margin = '0px 0px -8% 0px') {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined' || reducedMotion());
  useEffect(() => {
    if (seen || !ref.current) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); } }, { rootMargin: margin, threshold: 0.08 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen, margin]);
  return [ref, seen] as const;
}

/** Scroll-triggered reveal with a stagger index. */
export const Reveal: React.FC<{ i?: number; className?: string; id?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ i = 0, className = '', id, style, children }) => {
  const [ref, seen] = useInView<HTMLDivElement>();
  return <div ref={ref} id={id} className={`nh-reveal ${seen ? 'in' : ''} ${className}`} style={{ ['--i' as any]: i, ...style }}>{children}</div>;
};

/** Counts up to `target` once `active` turns true. */
export function useCountUp(target: number | null, active: boolean, ms = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (target === null || !active) return;
    if (reducedMotion()) { setV(target); return; }
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / ms); setV(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, ms]);
  return v;
}

export type LevelKey = 'primary' | 'basic' | 'secondary' | 'higher';
export interface HomeActions {
  openDemo: () => void;
  launchRole: (role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'CLASS_TEACHER' | 'STUDENT') => void;
  login: (superAdmin?: boolean) => void;
  register: () => void;
  status: () => void;
  smartBoard: () => void;
  tour: () => void;
  go: (id: string) => void;
  chooseLevel: (l: LevelKey) => void;
  level: LevelKey;
  launching: string | null;
}
export const HomeCtx = createContext<HomeActions | null>(null);
export const useHome = () => { const c = useContext(HomeCtx); if (!c) throw new Error('useHome outside HomeCtx'); return c; };
