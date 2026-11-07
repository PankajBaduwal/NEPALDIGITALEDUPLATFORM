import React, { useEffect, useState } from 'react';
import { Check, Play, ArrowRight, Smartphone, FileText, Gauge, ShieldCheck, BookOpen, Wifi } from 'lucide-react';
import { api } from '../../../services/api';
import { Reveal, useHome, useInView, useCountUp } from './hooks';
import { BoardScreen, NepalMap } from './visuals';

/* ── Smart Board showcase ─────────────────────────── */
export const SmartBoardShowcase: React.FC = () => {
  const h = useHome();
  return (
    <section id="smartboard" className="nh-sec nh-sb" aria-labelledby="sb-title">
      <div className="nh-wrap nh-sb-grid">
        <Reveal>
          <span className="nh-eyebrow">Smart Board</span>
          <h2 id="sb-title" className="nh-h2" style={{ color: '#fff' }}>Transform Every Classroom into an Interactive Digital Learning Space.</h2>
          <p className="nh-lead">Teach with a connected digital whiteboard, curriculum textbook reader, handwriting tools and interactive simulations.</p>
          <ul>
            {['Digital whiteboard with stylus writing, graphs and geometry shapes', 'National textbook side panel for split-screen teaching', 'AI explanation panel that points back to the textbook', 'Physics, chemistry and maths simulations', 'Export the lesson to PDF for students'].map((t) => <li key={t}><Check size={17} /><span>{t}</span></li>)}
          </ul>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" className="nh-btn nh-btn-primary" onClick={h.smartBoard}><Play size={16} /> Launch Smart Board Demo</button>
            <button type="button" className="nh-btn nh-btn-ghost" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.4)' }} onClick={() => h.go('features')}>Explore Features <ArrowRight size={16} /></button>
          </div>
        </Reveal>
        <Reveal i={2}>
          <div style={{ perspective: 1400 }} aria-hidden="true">
            <div style={{ transform: 'rotateY(-12deg) rotateX(4deg)', transformStyle: 'preserve-3d', background: 'linear-gradient(145deg,#134744,#0b3f3d)', padding: 12, borderRadius: 22, boxShadow: '0 60px 90px -30px rgba(0,0,0,.7), 0 0 0 1px rgba(47,207,156,.3)' }}>
              <div style={{ aspectRatio: '16/10', borderRadius: 12, overflow: 'hidden' }}><BoardScreen /></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10, justifyContent: 'center' }}>{['Whiteboard', 'Textbook', 'Simulation', 'AI'].map((t, i) => <span key={t} style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 999, background: i === 0 ? '#1fb589' : 'rgba(255,255,255,.1)', color: '#fff' }}>{t}</span>)}</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ── Live platform figures ────────────────────────── */
type Overview = { institutions: number; students: number; teachers: number; districts: number; subjects: number; textbooks: number; asOf: string };
const Stat: React.FC<{ value: number | null; label: string; suffix?: string; active: boolean; i: number }> = ({ value, label, suffix, active, i }) => {
  const v = useCountUp(value, active);
  return (
    <Reveal i={i}><div className="nh-card nh-stat-card"><b aria-label={value === null ? 'Not available' : `${value}${suffix || ''}`}>{value === null ? '—' : v.toLocaleString('en-IN')}{value !== null && suffix}</b><span>{label}</span></div></Reveal>
  );
};
export const Stats: React.FC = () => {
  const [d, setD] = useState<Overview | null | 'error'>(null);
  const [ref, seen] = useInView<HTMLDivElement>();
  useEffect(() => { api.get<Overview>('/public/overview').then(setD).catch(() => setD('error')); }, []);
  const o = d && d !== 'error' ? d : null;
  return (
    <section id="stats" className="nh-sec" aria-labelledby="stats-title">
      <div className="nh-map-bg" aria-hidden="true"><NepalMap pins /></div>
      <div className="nh-wrap" style={{ position: 'relative' }}>
        <Reveal className="nh-head center"><span className="nh-eyebrow">Platform figures</span><h2 id="stats-title" className="nh-h2">What is on the platform today</h2><p className="nh-lead">Live counts from this platform's own records, not projections.</p></Reveal>
        <div ref={ref} className="nh-grid nh-g4" style={{ gridTemplateColumns: undefined }}>
          <Stat value={o?.institutions ?? null} label="Schools & colleges on the platform" active={seen} i={0} />
          <Stat value={o?.students ?? null} label="Students" active={seen} i={1} />
          <Stat value={o?.teachers ?? null} label="Teachers" active={seen} i={2} />
          <Stat value={o?.districts ?? null} suffix=" / 77" label="Districts with an institution" active={seen} i={3} />
        </div>
        <div className="nh-grid nh-g2" style={{ marginTop: 22, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          <Stat value={o?.subjects ?? null} label="Curriculum subjects" active={seen} i={4} />
          <Stat value={o?.textbooks ?? null} label="Textbooks in the library" active={seen} i={5} />
        </div>
        <p className="nh-note">{d === 'error' ? 'Live figures are unavailable right now.' : o ? `Live figures as of ${new Date(o.asOf).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}. Includes demonstration institutions.` : 'Loading figures…'}</p>
      </div>
    </section>
  );
};

/* ── Connectivity ─────────────────────────────────── */
const POINTS: Array<{ icon: React.ElementType; title: string; text: string }> = [
  { icon: FileText, title: 'Optimized PDF loading', text: 'Textbooks are served with byte-range support, so a reader can open a page without downloading the whole book first.' },
  { icon: Smartphone, title: 'Responsive mobile access', text: 'Dashboards and the student portal adapt to phones and tablets, not only classroom computers.' },
  { icon: Gauge, title: 'Efficient data usage', text: 'Pages load only what they need, and heavy visuals load on demand.' },
  { icon: ShieldCheck, title: 'Reliable academic workflows', text: 'Attendance, marks and timetables are saved on the server and visible to the right people straight away.' },
  { icon: BookOpen, title: 'Accessible learning resources', text: 'English and Nepali medium resources sit side by side for every class.' },
  { icon: Wifi, title: 'Connection awareness', text: 'The app tells users when their connection drops. An internet connection is still required to use the platform.' },
];
export const Connectivity: React.FC = () => (
  <section id="connectivity" className="nh-sec nh-alt" aria-labelledby="conn-title">
    <div className="nh-wrap nh-conn">
      <Reveal>
        <span className="nh-eyebrow">Across Nepal</span>
        <h2 id="conn-title" className="nh-h2">Designed for Schools Across All 7 Provinces.</h2>
        <p className="nh-lead">The platform is built to stay useful on modest connections and everyday devices.</p>
        <div style={{ marginTop: 18 }}>{POINTS.map((p) => <div key={p.title} className="nh-point"><span className="nh-dd-ic" style={{ width: 36, height: 36 }}><p.icon size={17} /></span><div><b style={{ color: '#0e3e3b', fontSize: 15 }}>{p.title}</b><div style={{ fontSize: 13.5 }}>{p.text}</div></div></div>)}</div>
      </Reveal>
      <Reveal i={2}>
        <div className="nh-card" style={{ padding: 24 }}><NepalMap pins labels /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>{['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'].map((p) => <span key={p} className="nh-chip">{p}</span>)}</div><p className="nh-note" style={{ textAlign: 'left' }}>Pins mark the seven provinces, not specific schools. Boundaries: Survey Department of Nepal / OCHA via geoBoundaries (CC BY 3.0 IGO).</p></div>
      </Reveal>
    </div>
  </section>
);
