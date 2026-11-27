import React, { useState } from 'react';
import { Play, ArrowRight, CheckCircle2, ShieldCheck, MonitorPlay, Sparkles, Calculator, BarChart3 } from 'lucide-react';
import { useHome } from './hooks';

const TRUST = [
  'CDC Curriculum (Classes 1–12)',
  '430+ Interactive Math & Science Labs',
  'English & Nepali Medium',
  'Smart Board & AI Ready',
];

interface ShowcaseTab {
  id: string;
  label: string;
  icon: React.ElementType;
  img: string;
  alt: string;
  badge: string;
  title: string;
  caption: string;
}

const SHOWCASE_TABS: ShowcaseTab[] = [
  {
    id: 'classroom',
    label: 'Smart Classroom',
    icon: MonitorPlay,
    img: '/assets/home/hero/nepal-smart-classroom-hero.jpg',
    alt: 'Nepali teacher demonstrating geometry and graphs on an interactive Smart Board while students follow along on tablets',
    badge: 'Live Classroom Mode',
    title: 'Interactive Smart Board + Split-Screen Textbook',
    caption: 'Write, draw geometry, launch simulations, and export notes to PDF for every student.',
  },
  {
    id: 'simulations',
    label: '430+ Simulations',
    icon: Calculator,
    img: '/assets/home/hero/nepal-digital-ecosystem.jpg',
    alt: 'Laptop and tablet displaying interactive Mathematics simulations with geometry and coordinate graphs',
    badge: 'Classes 1–10 Complete',
    title: 'Bilingual 2D Math & Science Laboratories',
    caption: 'Hands-on visual labs aligned strictly to the Nepal CDC textbook in English & नेपाली.',
  },
  {
    id: 'ai',
    label: 'AI Tutor',
    icon: Sparkles,
    img: '/assets/home/teacher-ai.jpg',
    alt: 'Textbook-grounded AI teaching assistant explaining concepts with source citations',
    badge: 'Curriculum-Grounded AI',
    title: 'Instant Step-by-Step Explanations with Sources',
    caption: 'Answers student and teacher questions in English & Nepali, citing exact textbook pages.',
  },
  {
    id: 'analytics',
    label: 'School Analytics',
    icon: BarChart3,
    img: '/assets/home/principal-overview.jpg',
    alt: 'Principal and administrator dashboard showing attendance, marks, and timetable management',
    badge: 'Real-Time Operations',
    title: 'Unified Attendance, Marks & Timetable Automation',
    caption: 'Role-based portals for Principals, Admins, Class Teachers, Subject Teachers & Students.',
  },
];

/** Hero: editorial headline and CTAs on the left, interactive visual platform showcase on the right. */
export const Hero: React.FC = () => {
  const h = useHome();
  const [activeTab, setActiveTab] = useState<string>('classroom');
  const current = SHOWCASE_TABS.find((t) => t.id === activeTab) || SHOWCASE_TABS[0];

  return (
    <section className="nh-hero" aria-labelledby="hero-title">
      <div className="nh-wrap nh-hero-grid">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="nh-hero-left">
          <div className="nh-badge-row nh-rise" style={{ ['--i' as any]: 0 }}>
            <span className="nh-flagline">
              <span aria-hidden="true">🇳🇵</span> NATIONAL UNIFIED EDUCATIONAL PLATFORM OF NEPAL
            </span>
            <span className="nh-chip">
              <ShieldCheck size={13} /> CDC CURRICULUM ALIGNED
            </span>
          </div>

          <h1 id="hero-title" className="nh-rise" style={{ ['--i' as any]: 1 }}>
            The Modern Digital Operating System{' '}
            <em>
              for Schools &amp; Colleges in <span className="nh-uline">Nepal.</span>
            </em>
          </h1>

          <p className="nh-hero-copy nh-rise" style={{ ['--i' as any]: 2 }}>
            Unifying school leadership, teachers, students, and curriculum operations in one secure digital ecosystem.
            Built for <strong>Classes 1 to 12</strong> in English and Nepali medium — with interactive Smart Board lessons,{' '}
            <strong>430+ hands-on simulations</strong>, and textbook-grounded AI.
          </p>

          <div className="nh-hero-cta nh-rise" style={{ ['--i' as any]: 3 }}>
            <button type="button" className="nh-btn nh-btn-primary nh-btn-lg" onClick={h.openDemo}>
              <Play size={16} /> Launch Interactive Demo
            </button>
            <button type="button" className="nh-btn nh-btn-ghost nh-btn-lg" onClick={() => h.go('features')}>
              Explore Platform <ArrowRight size={16} />
            </button>
            <button type="button" className="nh-link" onClick={h.tour} style={{ alignSelf: 'center', marginLeft: 4 }}>
              Watch platform tour
            </button>
          </div>

          <div className="nh-trust nh-rise" style={{ ['--i' as any]: 4 }}>
            {TRUST.map((t) => (
              <span key={t}>
                <CheckCircle2 size={14} color="#167C80" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Visual Showcase */}
        <div className="nh-hero-right nh-rise" style={{ ['--i' as any]: 2 }}>
          <div className="nh-showcase-card">
            {/* Mode Switcher Tabs */}
            <div className="nh-showcase-tabs" role="tablist" aria-label="Platform highlights">
              {SHOWCASE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`nh-showcase-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Visual Stage */}
            <div className="nh-showcase-media">
              <img
                key={current.id}
                src={current.img}
                alt={current.alt}
                className="nh-showcase-img"
              />
              <div className="nh-showcase-gradient" aria-hidden="true" />

              {/* Top-right live status pill */}
              <div className="nh-showcase-pill-top" aria-hidden="true">
                <span className="nh-pulse-dot" />
                <span>{current.badge}</span>
              </div>

              {/* Clean bottom caption overlay */}
              <div className="nh-showcase-caption">
                <strong>{current.title}</strong>
                <span>{current.caption}</span>
              </div>
            </div>
          </div>

          {/* Clean Metric Bar */}
          <div className="nh-hero-metrics" aria-label="Platform key metrics">
            <div className="nh-metric-pill">
              <b>430+</b>
              <span>Math &amp; Science Sims</span>
            </div>
            <div className="nh-metric-pill">
              <b>Classes 1–12</b>
              <span>EN / नेपाली Medium</span>
            </div>
            <div className="nh-metric-pill">
              <b>96%</b>
              <span>Live Attendance Sync</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
