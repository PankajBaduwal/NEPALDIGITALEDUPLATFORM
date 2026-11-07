import React from 'react';
import { NEPAL_PROVINCES, NEPAL_VIEWBOX } from './nepalMap';
import { CalendarDays, Users, Sparkles, FileText, BarChart3, ClipboardCheck, BookOpen } from 'lucide-react';

const TONES = ['#daf5ec', '#bfeede', '#e9f6f1', '#a6e6d0', '#effaf6', '#cdeee3', '#92dcc2'];

/** Nepal's seven provinces from official boundary data (see nepalMap.ts for source and licence). */
export const NepalMap: React.FC<{ pins?: boolean; labels?: boolean; className?: string; label?: string }> = ({ pins = false, labels = false, className = '', label = 'Map of Nepal showing its seven provinces' }) => (
  <svg viewBox={NEPAL_VIEWBOX} className={`nh-map ${className}`} role="img" aria-label={label}>
    {NEPAL_PROVINCES.map((p, i) => (
      <g key={p.name}>
        <path className="prov" style={{ fill: TONES[i % TONES.length] }} d={p.d}><title>{p.name} Province</title></path>
        {labels && <text className="prov-label" x={p.cx} y={p.cy + (pins ? 26 : 5)} textAnchor="middle">{p.name}</text>}
        {pins && <><circle className="nh-pin-ring" cx={p.cx} cy={p.cy} r="9" style={{ ['--d' as any]: `${i * 0.35}s` }} /><circle className="nh-pin" cx={p.cx} cy={p.cy} r="6" /></>}
      </g>
    ))}
  </svg>
);

/** Logo mark: the Nepal pennant over mountains, in the page's blue and crimson. */
export const BrandMark: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Nepal Digital Education Platform" style={{ flex: '0 0 auto' }}>
    <rect width="40" height="40" rx="11" fill="#0b3f3d" />
    <path d="M4 34 L15 20 L21 28 L26 21 L36 34 Z" fill="#7fe3c2" />
    <path d="M10 34 L19 23 L24 30 L28 25 L36 34 Z" fill="#fff" opacity=".92" />
    <path d="M13 6 L13 26" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M13.5 6.5 L27 14 L18.5 14 Z M13.5 14 L29 24 L13.5 24 Z" fill="#c8102e" stroke="#fff" strokeWidth=".8" strokeLinejoin="round" />
  </svg>
);

/** The Smart Board screen used in the hero and the showcase: textbook pane, handwriting, graph and AI chip. */
export const BoardScreen: React.FC<{ aiNote?: boolean }> = ({ aiNote = true }) => (
  <div className="nh-screen">
    <div className="nh-screen-book">
      <b>Science &amp; Technology</b>
      <span>Chapter: Force and Motion</span>
      <i style={{ width: '92%' }} /><i style={{ width: '78%' }} /><i style={{ width: '86%' }} /><i style={{ width: '60%' }} />
      <div className="pg">Newton's second law relates force, mass and acceleration.</div>
    </div>
    <div className="nh-screen-white">
      <svg viewBox="0 0 260 150" width="100%" height="100%" aria-hidden="true">
        <text x="14" y="34" fontSize="22" fontStyle="italic" fontWeight="700" fill="#0b3f3d" fontFamily="Georgia, serif">F = m × a</text>
        <path className="nh-draw" d="M20 128 L20 60 M20 128 L130 128 M20 120 C50 118 70 96 92 74 C106 60 118 54 128 50" stroke="#1fb589" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path className="nh-draw" style={{ animationDelay: '.6s' }} d="M168 120 L218 120 L193 78 Z" stroke="#c9971c" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
        <circle cx="140" cy="46" r="3" fill="#1fb589" />
      </svg>
      {aiNote && <div style={{ position: 'absolute', right: 10, top: 10, background: '#effaf6', border: '1px solid #bfeede', color: '#0f4c4a', fontSize: 8.5, fontWeight: 800, padding: '3px 7px', borderRadius: 7 }}>AI explanation · with textbook source</div>}
      <div className="nh-screen-tools"><i /><i /><i /><i /></div>
    </div>
  </div>
);

const Row: React.FC<{ a: string; b: string }> = ({ a, b }) => <div className="row"><span>{a}</span><b style={{ margin: 0, display: 'inline', color: '#117a6b' }}>{b}</b></div>;

/** Small floating UI cards that orbit the hero Smart Board. Each stands for a real module. */
export const FloatingCards: React.FC = () => (
  <>
    <div className="nh-fl" style={{ left: '-1%', top: '6%', transform: 'translateZ(80px)' }}><div className="nh-fl-in nh-mini" style={{ ['--dl' as any]: '0s' }}><b><CalendarDays size={13} color="#117a6b" /> Today's timetable</b><Row a="P1 · Mathematics" b="10:00" /><Row a="P2 · Science" b="10:45" /><Row a="P3 · English" b="11:30" /></div></div>
    <div className="nh-fl" style={{ right: '-2%', top: '2%', transform: 'translateZ(110px)' }}><div className="nh-fl-in nh-mini" style={{ ['--dl' as any]: '1.2s' }}><b><ClipboardCheck size={13} color="#117a6b" /> Attendance</b><div style={{ fontSize: 22, fontWeight: 800, color: '#0e3e3b' }}>96%</div><div className="bar"><i style={{ width: '96%' }} /></div></div></div>
    <div className="nh-fl hide-t" style={{ left: '-3%', bottom: '14%', transform: 'translateZ(100px)' }}><div className="nh-fl-in nh-mini" style={{ ['--dl' as any]: '2s' }}><b><Sparkles size={13} color="#c8102e" /> AI assistant</b><div style={{ maxWidth: 150 }}>Explain Newton's second law with an example.</div></div></div>
    <div className="nh-fl" style={{ right: '0%', bottom: '10%', transform: 'translateZ(70px)' }}><div className="nh-fl-in nh-mini" style={{ ['--dl' as any]: '.6s' }}><b><BarChart3 size={13} color="#117a6b" /> Terminal result</b><Row a="Grade" b="A+" /><Row a="GPA" b="4.0" /></div></div>
    <div className="nh-fl hide-t" style={{ left: '40%', top: '-3%', transform: 'translateZ(130px)' }}><div className="nh-fl-in nh-mini" style={{ ['--dl' as any]: '1.7s', minWidth: 120 }}><b><BookOpen size={13} color="#117a6b" /> Textbook</b>Classes 1–12</div></div>
    <div className="nh-fl hide-t" style={{ right: '10%', bottom: '-2%', transform: 'translateZ(60px)' }}><div className="nh-fl-in nh-mini" style={{ ['--dl' as any]: '2.6s', minWidth: 120 }}><b><Users size={13} color="#117a6b" /> Student progress</b><div className="bar"><i style={{ width: '72%' }} /></div></div></div>
  </>
);

/* ── small 3D visuals for feature cards ─────────────── */
const Tilt: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="nh-tilt" style={{ position: 'relative', width: 190, height: 120 }}>{children}</div>;
const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', ...s });

export const VisAdmin = () => (<Tilt>
  <div className="nh-pv-box" style={abs({ left: 0, top: 6, width: 110, height: 84, transform: 'translateZ(0)', padding: 8 })}><div style={{ fontSize: 9, fontWeight: 800, color: '#117a6b' }}>Timetable</div>{[0, 1, 2].map((r) => <div key={r} style={{ display: 'flex', gap: 3, marginTop: 4 }}>{[0, 1, 2, 3].map((c) => <i key={c} style={{ flex: 1, height: 12, borderRadius: 3, background: (r + c) % 3 === 0 ? '#7fe3c2' : '#daf5ec' }} />)}</div>)}</div>
  <div className="nh-pv-box" style={abs({ right: 0, top: 30, width: 86, height: 70, transform: 'translateZ(36px)', padding: 8 })}><div style={{ fontSize: 9, fontWeight: 800 }}>Class 10 · A</div><div style={{ fontSize: 9, color: '#6f817d' }}>Class teacher</div><div className="bar" style={{ marginTop: 8, height: 5, background: '#daf5ec', borderRadius: 4 }}><i style={{ display: 'block', width: '70%', height: '100%', background: '#1fb589', borderRadius: 4 }} /></div></div>
</Tilt>);
export const VisBoard = () => (<Tilt><div style={abs({ left: 8, top: 4, width: 170, height: 106, background: '#0e3e3b', borderRadius: 10, padding: 6, boxShadow: '0 16px 30px -12px rgba(6,43,42,.6)' })}><div style={{ background: '#fff', borderRadius: 6, height: '100%', padding: 6, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, fontWeight: 700, color: '#0b3f3d' }}>a² + b² = c²</div></div>
  <div className="nh-mini" style={abs({ right: -6, bottom: -4, minWidth: 0, padding: '5px 8px', transform: 'translateZ(40px)' })}>△ ⊿ π</div></Tilt>);
export const VisAI = () => (<svg width="190" height="120" viewBox="0 0 190 120" aria-hidden="true" className="nh-tilt">
  <g stroke="#7fe3c2" strokeWidth="1.3" fill="none" opacity=".8"><path d="M95 60 L36 24 M95 60 L160 28 M95 60 L28 92 M95 60 L158 96 M36 24 L28 92 M160 28 L158 96" /></g>
  <circle cx="95" cy="60" r="16" fill="#1fb589" /><text x="95" y="65" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">AI</text>
  {[[36, 24], [160, 28], [28, 92], [158, 96]].map(([x, y], i) => <g key={i}><rect x={x - 13} y={y - 9} width="26" height="18" rx="4" fill="#fff" stroke="#bfeede" /><path d={`M${x - 7} ${y - 2} h14 M${x - 7} ${y + 3} h9`} stroke="#2fcf9c" strokeWidth="1.5" /></g>)}</svg>);
export const VisAssignment = () => (<Tilt>
  <div className="nh-sheet" style={{ left: 20, top: 12, transform: 'translateZ(0) rotate(-8deg)' }}><i /><i /><i style={{ width: '60%' }} /></div>
  <div className="nh-sheet" style={{ left: 62, top: 6, transform: 'translateZ(24px) rotate(2deg)' }}><i /><i style={{ width: '70%' }} /><i /></div>
  <div className="nh-sheet" style={{ left: 104, top: 14, transform: 'translateZ(48px) rotate(10deg)' }}><b style={{ fontSize: 14, color: '#1fb589' }}>A+</b><i /><i style={{ width: '50%' }} /></div>
</Tilt>);
export const VisExam = () => (<Tilt><div className="nh-pv-box" style={abs({ left: 12, top: 4, width: 166, height: 104, padding: 10 })}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 800 }}><span>Timed exam</span><span style={{ color: '#c8102e' }}>42:10</span></div>{['A', 'B', 'C'].map((o, i) => <div key={o} style={{ marginTop: 6, fontSize: 9.5, padding: '3px 7px', borderRadius: 6, border: '1px solid ' + (i === 1 ? '#1fb589' : '#dcebe6'), background: i === 1 ? '#effaf6' : '#fff' }}>{o}. Option text</div>)}</div></Tilt>);
export const VisAnalytics = () => (<Tilt><div className="nh-pv-box" style={abs({ left: 8, top: 6, width: 172, height: 100, padding: 10 })}><div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 62 }}>{[38, 56, 44, 72, 60, 86].map((h, i) => <i key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? '#1fb589' : '#bfeede', borderRadius: '4px 4px 0 0' }} />)}</div><div style={{ fontSize: 9, color: '#6f817d', marginTop: 6 }}>Class performance trend</div></div></Tilt>);

export const Ic = { FileText, Sparkles };
