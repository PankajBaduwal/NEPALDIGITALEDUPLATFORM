import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Reveal, useHome } from './hooks';
import { VisAdmin, VisBoard, VisAI, VisAssignment, VisExam, VisAnalytics, BoardScreen } from './visuals';

const FEATURES: Array<{ id: string; title: string; Vis: React.FC; items: string[] }> = [
  { id: 'f-admin', title: 'Academic Administration', Vis: VisAdmin, items: ['Student and teacher enrollment', 'CSV / XLSX bulk import', 'Class and section management', 'Subject allocation', 'Class Teacher assignment', 'Timetable automation with conflict checks'] },
  { id: 'f-smartboard', title: 'Smart Board & Digital Classroom', Vis: VisBoard, items: ['Interactive digital whiteboard', 'Stylus writing', 'Geometry tools', 'PDF textbook reader', 'Split-screen teaching', 'Simulation integration', 'Student PDF export'] },
  { id: 'f-ai', title: 'AI-Powered Learning', Vis: VisAI, items: ['Textbook-grounded AI with source references', 'English and Nepali', 'Question answering', 'Step-by-step solutions', 'Image-based question analysis', 'AI teaching assistance for teachers'] },
  { id: 'f-assignment', title: 'Assignment Studio', Vis: VisAssignment, items: ['Assignment creation', 'AI-assisted assignment generation', 'Rubrics', 'Submission management', 'Handwriting OCR', 'Evaluation workflow'] },
  { id: 'f-exam', title: 'Quiz & Examination', Vis: VisExam, items: ['Quiz generation', 'Timed examinations', 'Question banks', 'Assessment configuration', 'Marks entry', 'Results and report cards'] },
  { id: 'f-analytics', title: 'Attendance & Academic Analytics', Vis: VisAnalytics, items: ['Daily attendance', 'Student attendance trends', 'Chronic absenteeism alerts', 'Class performance', 'Academic reports', 'Result analytics'] },
];

export const Features: React.FC = () => (
  <section id="features" className="nh-sec nh-alt" aria-labelledby="feat-title">
    <div className="nh-wrap">
      <Reveal className="nh-head center"><span className="nh-eyebrow">Platform features</span><h2 id="feat-title" className="nh-h2">A Complete Digital Academic Operating System</h2><p className="nh-lead">Every module is designed to connect institutional management, teaching, learning and academic assessment.</p></Reveal>
      <div className="nh-grid nh-g3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.id} i={i % 3} id={f.id} style={{ scrollMarginTop: 90 }}>
            <article className="nh-card hover nh-feat" style={{ height: '100%' }}>
              <div className="nh-feat-vis" aria-hidden="true"><f.Vis /></div>
              <div className="nh-feat-body"><h3>{f.title}</h3><ul>{f.items.map((t) => <li key={t}><Check size={15} />{t}</li>)}</ul></div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const MiniAssess = () => (<div style={{ width: '100%', display: 'grid', gap: 8, transform: 'rotateX(8deg) rotateY(-10deg)' }}>{['Create quiz', 'Generate assignment', 'Grade submissions'].map((t, i) => <div key={t} style={{ background: 'rgba(255,255,255,.95)', borderRadius: 10, padding: '9px 12px', fontSize: 12.5, fontWeight: 700, color: '#0b3f3d', marginLeft: i * 14, display: 'flex', justifyContent: 'space-between' }}>{t}<span style={{ color: '#1fb589' }}>{['Q', 'AI', 'A+'][i]}</span></div>)}</div>);
const MiniLearn = () => (<div style={{ display: 'flex', gap: 10, transform: 'rotateX(8deg) rotateY(-10deg)' }}><div style={{ background: '#fff', borderRadius: 10, padding: 10, width: 110, fontSize: 10, color: '#52645f' }}><b style={{ color: '#0e3e3b' }}>Textbook</b><div style={{ height: 4, background: '#daf5ec', margin: '6px 0', borderRadius: 3 }} /><div style={{ height: 4, background: '#dcebe6', margin: '6px 0', width: '70%', borderRadius: 3 }} /><div style={{ height: 4, background: '#dcebe6', margin: '6px 0', borderRadius: 3 }} /></div><div style={{ background: '#effaf6', borderRadius: 10, padding: 10, width: 120, fontSize: 10, color: '#0f4c4a', fontWeight: 700 }}>Ask the AI about this chapter</div></div>);
const MiniOps = () => (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, width: 200, transform: 'rotateX(10deg) rotateY(-12deg)' }}>{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ height: 24, borderRadius: 5, background: i % 5 === 0 ? '#7fe3c2' : i % 3 === 0 ? '#fde68a' : '#daf5ec' }} />)}</div>);

export const Studios: React.FC = () => {
  const h = useHome();
  const STUDIOS = [
    { id: 'studio-smartboard', title: 'Smart Board Studio', desc: 'A connected whiteboard that teaches from the national textbook.', feats: ['Whiteboard & stylus', 'Textbook split view', 'Simulations'], vis: <div style={{ width: 230, borderRadius: 8, overflow: 'hidden', transform: 'rotateX(8deg) rotateY(-10deg)', boxShadow: '0 20px 30px -12px #000' }}><BoardScreen aiNote={false} /></div>, cta: 'Open Smart Board', go: h.smartBoard },
    { id: 'studio-assessment', title: 'Assessment Studio', desc: 'Create quizzes and assignments, collect submissions and grade.', feats: ['Quiz generation', 'Assignment Studio', 'Handwriting OCR'], vis: <MiniAssess />, cta: 'Explore as a teacher', go: () => h.launchRole('TEACHER') },
    { id: 'studio-learning', title: 'Learning Studio', desc: 'Students read textbooks, ask the AI and practise at their own pace.', feats: ['Digital textbooks', 'Textbook-grounded AI', 'Notes & materials'], vis: <MiniLearn />, cta: 'Explore as a student', go: () => h.launchRole('STUDENT') },
    { id: 'studio-operations', title: 'Academic Operations Studio', desc: 'Run enrollment, timetables, attendance and administration.', feats: ['Enrollment & import', 'Timetable builder', 'Attendance'], vis: <MiniOps />, cta: 'Explore as an administrator', go: () => h.launchRole('SCHOOL_ADMIN') },
  ];
  return (
    <section id="studios" className="nh-sec" aria-labelledby="studio-title">
      <div className="nh-wrap">
        <Reveal className="nh-head center"><span className="nh-eyebrow">Platform studios</span><h2 id="studio-title" className="nh-h2">Explore the Platform Studios</h2><p className="nh-lead">Four focused workspaces, each built around a real part of school life.</p></Reveal>
        <div className="nh-grid nh-g2">
          {STUDIOS.map((s, i) => (
            <Reveal key={s.id} i={i % 2} id={s.id} style={{ scrollMarginTop: 90 }}>
              <article className="nh-card hover nh-studio" style={{ height: '100%' }}>
                <div><h3 style={{ fontSize: 20, fontWeight: 800 }}>{s.title}</h3><p style={{ marginTop: 8, fontSize: 14.5 }}>{s.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '14px 0' }}>{s.feats.map((f) => <span key={f} className="nh-chip">{f}</span>)}</div>
                  <button type="button" className="nh-btn nh-btn-primary nh-btn-sm" onClick={s.go}>{s.cta} <ArrowRight size={14} /></button></div>
                <div className="nh-studio-vis" aria-hidden="true">{s.vis}</div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
