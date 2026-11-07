import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { api } from '../../../services/api';
import { Reveal, useHome, type LevelKey } from './hooks';

const LEVELS: Array<{ key: LevelKey; title: string; range: string; classes: number[]; note: string }> = [
  { key: 'primary', title: 'Primary Level', range: 'Classes 1–5', classes: [1, 2, 3, 4, 5], note: 'Foundational learning' },
  { key: 'basic', title: 'Basic Level', range: 'Classes 6–8', classes: [6, 7, 8], note: 'Building core subjects' },
  { key: 'secondary', title: 'Secondary Level', range: 'Classes 9–10', classes: [9, 10], note: 'Leading to SEE' },
  { key: 'higher', title: 'Higher Secondary', range: 'Classes 11–12', classes: [11, 12], note: 'Streams and NEB' },
];
type Book = { title: string; titleNepali?: string; medium: string; pageCount?: number };
type Subject = { id: string; code: string; name: string; nameNepali?: string; isCompulsory?: boolean; stream?: string; creditHours?: number; availableMedia?: string[]; textbooks?: Book[] };
const medLabel = (m: string) => (m === 'ENGLISH' ? 'English' : m === 'NEPALI' ? 'Nepali' : m === 'BOTH' ? 'Both media' : m);

export const Curriculum: React.FC = () => {
  const h = useHome();
  const level = LEVELS.find((l) => l.key === h.level) || LEVELS[2];
  const [grade, setGrade] = useState<number>(level.classes[0]);
  const [medium, setMedium] = useState<'ALL' | 'ENGLISH' | 'NEPALI'>('ALL');
  const [open, setOpen] = useState<string | null>(null);
  const [data, setData] = useState<Record<number, Subject[] | 'error'>>({});
  const reqd = useRef<Set<number>>(new Set());
  const [tick, setTick] = useState(0);

  useEffect(() => { setGrade(level.classes[0]); setOpen(null); }, [level.key]);
  useEffect(() => {
    if (reqd.current.has(grade)) return;
    reqd.current.add(grade);
    api.get<Subject[]>(`/curriculum/subjects?grade=${grade}`).then((r) => setData((d) => ({ ...d, [grade]: Array.isArray(r) ? r : [] }))).catch(() => { reqd.current.delete(grade); setData((d) => ({ ...d, [grade]: 'error' })); });
  }, [grade, tick]);

  const raw = data[grade];
  const subjects = useMemo(() => {
    if (!Array.isArray(raw)) return [];
    const has = (s: Subject, m: string) => (s.availableMedia || []).includes(m) || (s.textbooks || []).some((b) => b.medium === m || b.medium === 'BOTH');
    return raw.filter((s) => medium === 'ALL' || has(s, medium)).sort((a, b) => Number(!!b.isCompulsory) - Number(!!a.isCompulsory) || a.name.localeCompare(b.name));
  }, [raw, medium]);

  return (
    <section id="curriculum" className="nh-sec" aria-labelledby="cur-title">
      <div className="nh-wrap">
        <Reveal className="nh-head center"><span className="nh-eyebrow">Curriculum library</span><h2 id="cur-title" className="nh-h2">Nepal CDC Curriculum — Classes 1–12</h2><p className="nh-lead">Organized national curriculum structure with English and Nepali medium learning resources. Subjects and textbooks below load live from the platform's central curriculum library.</p></Reveal>

        <Reveal><div className="nh-levels" role="group" aria-label="Curriculum level">
          {LEVELS.map((l) => (
            <button key={l.key} type="button" className="nh-level" aria-pressed={level.key === l.key} onClick={() => h.chooseLevel(l.key)}>
              <span className="stack" aria-hidden="true"><i /><i /><i /></span>
              <b>{l.title}</b><span>{l.range}</span><div style={{ fontSize: 12, color: '#117a6b', marginTop: 6, fontWeight: 700 }}>{l.note}</div>
            </button>
          ))}
        </div></Reveal>

        <div className="nh-classes" role="group" aria-label="Class">{level.classes.map((c) => <button key={c} type="button" className="nh-class" aria-pressed={grade === c} onClick={() => { setGrade(c); setOpen(null); }}>Class {c}</button>)}
          <span style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} role="group" aria-label="Medium">{(['ALL', 'ENGLISH', 'NEPALI'] as const).map((m) => <button key={m} type="button" className="nh-chip" style={{ cursor: 'pointer', background: medium === m ? '#117a6b' : undefined, color: medium === m ? '#fff' : undefined }} aria-pressed={medium === m} onClick={() => setMedium(m)}>{m === 'ALL' ? 'All media' : medLabel(m) + ' medium'}</button>)}</div>
        </div>

        <div aria-live="polite">
          {raw === undefined && <div className="nh-grid nh-g3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="nh-skeleton" />)}</div>}
          {raw === 'error' && <div className="nh-card" style={{ padding: 22, textAlign: 'center' }}>The curriculum library could not be reached right now. <button type="button" className="nh-link" onClick={() => { reqd.current.delete(grade); setData((d) => { const n = { ...d }; delete n[grade]; return n; }); setTick((t) => t + 1); }}>Try again</button></div>}
          {Array.isArray(raw) && subjects.length === 0 && <div className="nh-card" style={{ padding: 22, textAlign: 'center' }}>No subjects are listed for this selection yet.</div>}
          <div className="nh-grid nh-g3">
            {subjects.map((s) => {
              const books = s.textbooks || [];
              const isOpen = open === s.id;
              return (
                <div key={s.id} className="nh-card hover" style={{ padding: 0 }}>
                  <button type="button" className="nh-subj" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.id)} style={{ background: 'none', border: 0, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
                      <div><b style={{ color: '#0e3e3b', fontSize: 15 }}>{s.name}</b><div lang="ne" className="ne" style={{ fontSize: 13, color: '#6f817d' }}>{s.nameNepali}</div></div>
                      <BookOpen size={18} color="#1fb589" />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      <span className={`nh-chip ${s.isCompulsory ? '' : 'gold'}`}>{s.isCompulsory ? 'Compulsory' : 'Optional'}</span>
                      {s.stream && s.stream !== 'GENERAL' && <span className="nh-chip">{s.stream.charAt(0) + s.stream.slice(1).toLowerCase()}</span>}
                      {[...new Set(books.map((b) => b.medium))].map((m) => <span key={m} className="nh-chip">{medLabel(m)}</span>)}
                    </div>
                    {isOpen && (
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #dcebe6', fontSize: 13 }}>
                        {books.length === 0 ? <span style={{ color: '#6f817d' }}>No textbook is mapped to this subject yet.</span> : books.slice(0, 4).map((b, i) => (
                          <div key={i} style={{ padding: '4px 0', color: '#2f4f4c' }}><b>{b.titleNepali && b.medium === 'NEPALI' ? <span lang="ne" className="ne">{b.titleNepali}</span> : b.title.length > 70 ? b.title.slice(0, 70) + '…' : b.title}</b><div style={{ color: '#6f817d', fontSize: 12 }}>{medLabel(b.medium)}{b.pageCount ? ` · ${b.pageCount} pages` : ''}</div></div>
                        ))}
                        {s.creditHours ? <div style={{ color: '#6f817d', fontSize: 12, marginTop: 4 }}>{s.creditHours} credit hours</div> : null}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 30 }}><button type="button" className="nh-btn nh-btn-primary" onClick={() => h.launchRole('STUDENT')}>Read the textbooks in the student demo <ArrowRight size={16} /></button></div>
        <p className="nh-note">Curriculum content is organized from the national syllabus framework. This page does not imply official government approval of the platform.</p>
      </div>
    </section>
  );
};
export default Curriculum;
