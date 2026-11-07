import React from 'react';
import { Play, ArrowRight, CheckCircle2, ShieldCheck, ClipboardCheck, Sparkles } from 'lucide-react';
import { useHome } from './hooks';

const TRUST = ['CDC Curriculum Framework', 'Classes 1–12', 'English & Nepali Medium', 'AI-Powered Learning', 'Institutional Academic Management'];

/** Hero: headline and calls to action on the left, the classroom photograph on the right. The framed dashboard follows in ProductPreview. */
export const Hero: React.FC = () => {
  const h = useHome();
  return (
    <section className="nh-hero" aria-labelledby="hero-title">
      <div className="nh-wrap nh-hero-grid">
        <div>
          <div className="nh-badge-row nh-rise" style={{ ['--i' as any]: 0 }}>
            <span className="nh-flagline"><span aria-hidden="true">🇳🇵</span> NATIONAL UNIFIED EDUCATIONAL PLATFORM OF NEPAL</span>
            <span className="nh-chip"><ShieldCheck size={13} /> CDC CURRICULUM ALIGNED</span>
          </div>
          <h1 id="hero-title" className="nh-rise" style={{ ['--i' as any]: 1 }}>The Modern Digital Operating System <em>for Schools &amp; Colleges in Nepal.</em></h1>
          <p className="nh-hero-copy nh-rise" style={{ ['--i' as any]: 2 }}>
            Unifying school leadership, teachers, students and curriculum operations in one secure digital ecosystem. From Classes 1 to 12 in English and Nepali medium, with interactive Smart Board lessons, intelligent academic management and curriculum-grounded AI learning.
          </p>
          <div className="nh-hero-cta nh-rise" style={{ ['--i' as any]: 3 }}>
            <button type="button" className="nh-btn nh-btn-primary" onClick={h.openDemo}><Play size={16} /> Launch Interactive Demo</button>
            <button type="button" className="nh-btn nh-btn-ghost" onClick={() => h.go('platform-preview')}>Explore Platform <ArrowRight size={16} /></button>
            <button type="button" className="nh-link" onClick={h.tour} style={{ alignSelf: 'center' }}>Watch the platform tour</button>
          </div>
          <div className="nh-trust nh-rise" style={{ ['--i' as any]: 4 }}>
            {TRUST.map((t) => <span key={t}><CheckCircle2 size={13} color="#1fb589" /> {t}</span>)}
          </div>
        </div>

        <div className="nh-hero-photo nh-rise" style={{ ['--i' as any]: 2 }}>
          <img src="/assets/brand/hero_classroom.webp" alt="A teacher pointing at a geometry lesson on a Smart Board while five students sit around a table" width="1024" height="1024" decoding="async" fetchPriority="high" />
          <div className="nh-photo-card nh-float-a" aria-hidden="true" style={{ left: -18, top: '14%' }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center', fontWeight: 800, color: '#0e3e3b', fontSize: 12 }}><ClipboardCheck size={14} color="#1fb589" /> Attendance</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0e3e3b', lineHeight: 1.2 }}>96%</div>
            <div style={{ height: 5, borderRadius: 4, background: '#daf5ec', overflow: 'hidden', marginTop: 4 }}><i style={{ display: 'block', width: '96%', height: '100%', background: '#1fb589' }} /></div>
          </div>
          <div className="nh-photo-card nh-float-b" aria-hidden="true" style={{ right: -14, bottom: '12%', maxWidth: 190 }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center', fontWeight: 800, color: '#0e3e3b', fontSize: 12 }}><Sparkles size={14} color="#1fb589" /> AI explanation</div>
            <div style={{ marginTop: 3 }}>With a source from the textbook</div>
          </div>
        </div>
      </div>
    </section>
  );
};
