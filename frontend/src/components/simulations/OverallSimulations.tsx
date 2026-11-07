/**
 * Overall simulations — every Physics, Chemistry and Mathematics simulation ported from KPRIET, in one place
 * (school-level simulations and Virtual Labs from Classes 3–12, plus the college-level library).
 * Class 1 and Class 2 simulations are shown inside their own class instead.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Atom, FlaskConical, Sigma, Search, Play, Loader2, Beaker, Monitor } from 'lucide-react';
import { KprietSimulationPlayer } from './KprietSimulationPlayer';
import { launchOnSmartBoard } from './smartBoardLaunch';

type Subject = 'PHYSICS' | 'CHEMISTRY' | 'MATHEMATICS';
type Level = 'ALL' | 'SCHOOL' | 'COLLEGE';

interface Row {
  id: string;
  title: string;
  icon?: string;
  description: string;
  group: string;
  level: string;
  isSchool: boolean;
  isLab: boolean;
  subject: Subject;
}

const SUBJECTS: Array<{ key: Subject; label: string; icon: React.ElementType; color: string; bg: string }> = [
  { key: 'PHYSICS', label: 'Physics', icon: Atom, color: '#4c3fa8', bg: '#f5f3ff' },
  { key: 'CHEMISTRY', label: 'Chemistry', icon: FlaskConical, color: '#117a6b', bg: '#e6f7f0' },
  { key: 'MATHEMATICS', label: 'Mathematics', icon: Sigma, color: '#0f4c4a', bg: '#e9f6f1' },
];

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export const OverallSimulations: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState<Subject>('PHYSICS');
  const [level, setLevel] = useState<Level>('ALL');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Row | null>(null);

  useEffect(() => {
    let live = true;
    import('../../kpriet-sims/catalog')
      .then((m) => {
        if (!live) return;
        const list = m.overallSimulations().map((s: any): Row => {
          const school = Boolean(s.band === 'GRADES_1_8' || s.band === 'GRADES_9_12');
          const lvl = m.levelLabelOf(s);
          return {
            id: s.id,
            title: s.title,
            icon: s.icon,
            description: s.shortDescription || s.detailedDescription || '',
            group: school ? lvl : titleCase(String(s.category || s.topic || 'General')),
            level: lvl,
            isSchool: school,
            isLab: s.contentType === 'VIRTUAL_LAB' || /^exp-/i.test(s.id) || /^vl-/i.test(s.id),
            subject: m.subjectOf(s) as Subject,
          };
        });
        setRows(list);
      })
      .catch((e) => live && setError(e?.message || 'Could not load the simulation library.'));
    return () => {
      live = false;
    };
  }, []);

  const counts = useMemo(() => {
    const c: Record<Subject, number> = { PHYSICS: 0, CHEMISTRY: 0, MATHEMATICS: 0 };
    (rows || []).forEach((r) => (c[r.subject] += 1));
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows || []).filter(
      (r) =>
        r.subject === subject &&
        (level === 'ALL' || (level === 'SCHOOL' ? r.isSchool : !r.isSchool)) &&
        (!q || r.title.toLowerCase().includes(q) || r.group.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    );
  }, [rows, subject, level, query]);

  const groups = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of filtered) (m.get(r.group) || m.set(r.group, []).get(r.group)!).push(r);
    const classNo = (g: string) => (/^Class (\d+)$/.exec(g) ? Number(/^Class (\d+)$/.exec(g)![1]) : 999);
    return [...m.entries()].sort((a, b) => classNo(a[0]) - classNo(b[0]) || a[0].localeCompare(b[0]));
  }, [filtered]);

  const active = SUBJECTS.find((s) => s.key === subject)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'linear-gradient(135deg,#0f4c4a,#117a6b)', color: '#fff', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800 }}>Overall Simulations</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#bfeede' }}>
            Physics, Chemistry and Mathematics — {rows ? counts.PHYSICS + counts.CHEMISTRY + counts.MATHEMATICS : '…'} interactive simulations and virtual labs. Class 1–2 simulations are inside their own class.
          </p>
        </div>
        <button type="button" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.16)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', padding: '8px 14px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <ArrowLeft size={15} /> Back to classes
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {SUBJECTS.map((s) => {
          const on = s.key === subject;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSubject(s.key)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', border: `1.5px solid ${on ? s.color : '#dcebe6'}`, background: on ? s.color : '#fff', color: on ? '#fff' : '#2f4f4c' }}
            >
              <s.icon size={18} /> {s.label}
              <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 999, background: on ? 'rgba(255,255,255,.25)' : s.bg, color: on ? '#fff' : s.color }}>{rows ? counts[s.key] : '…'}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', background: '#fff', border: '1px solid #dcebe6', borderRadius: 12, padding: '10px 14px' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8da19d' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${active.label.toLowerCase()} simulations…`}
            style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #cfdcd8', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
          />
        </div>
        {([['ALL', 'All levels'], ['SCHOOL', 'School (Classes 3–12)'], ['COLLEGE', 'College level']] as Array<[Level, string]>).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setLevel(k)} style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: level === k ? 800 : 600, cursor: 'pointer', border: '1px solid #cfdcd8', background: level === k ? active.color : '#f4faf8', color: level === k ? '#fff' : '#4b605b' }}>
            {label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 700, color: active.color }}>{filtered.length} shown</span>
      </div>

      {!rows && !error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5f736f' }}>
          <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 8px' }} /> Loading the simulation library…
        </div>
      )}
      {error && <div style={{ padding: 20, background: '#fef2f2', color: '#b91c1c', borderRadius: 12 }}>{error}</div>}

      {rows && groups.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#5f736f', background: '#fff', borderRadius: 12, border: '1px solid #dcebe6' }}>No simulations match your search.</div>}

      {groups.map(([group, items]) => (
        <section key={group}>
          <h3 style={{ margin: '4px 0 10px', fontSize: 14.5, fontWeight: 800, color: '#0e3e3b', display: 'flex', alignItems: 'center', gap: 8 }}>
            {group}
            <span style={{ fontSize: 11, fontWeight: 700, color: active.color, background: active.bg, padding: '1px 8px', borderRadius: 999 }}>{items.length}</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 12 }}>
            {items.map((r) => (
              <div
                key={r.id}
                style={{ textAlign: 'left', background: '#fff', border: '1px solid #dcebe6', borderRadius: 14, padding: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 130 }}
              >
                <div onClick={() => setOpen(r)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 10, background: active.bg, display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0 }}>{r.icon || '🔬'}</span>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: '#0e3e3b', lineHeight: 1.3 }}>{r.title}</div>
                </div>
                {r.description && <div style={{ fontSize: 12, color: '#5f736f', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.description}</div>}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#f4faf8', border: '1px solid #dcebe6', color: '#4b605b' }}>{r.level}</span>
                  {r.isLab && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#4c3fa8', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Beaker size={11} /> Virtual Lab
                    </span>
                  )}
                  <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6 }}>
                    <button type="button" onClick={() => launchOnSmartBoard(r.id, r.title)} title="Launch directly on the Smart Board" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 800, color: '#fff', background: '#0f4c4a', border: 0, borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
                      <Monitor size={13} /> Smart Board
                    </button>
                    <button type="button" onClick={() => setOpen(r)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 800, color: active.color, background: active.bg, border: `1px solid ${active.color}33`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
                      <Play size={13} /> Launch
                    </button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {open && <KprietSimulationPlayer simulationId={open.id} title={open.title} onClose={() => setOpen(null)} />}
    </div>
  );
};
