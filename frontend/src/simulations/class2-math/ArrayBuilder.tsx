/**
 * Lesson 16 · Multiplication 2 (गुणन २)
 * Array Builder — rows and columns of cubes build the multiplication tables; swap rows and columns (a × b = b × a).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { cube } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#78716c'];

export const ArrayBuilder: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L16-01', chapter: 16, titleNp: 'पङ्क्ति र स्तम्भ (पहाडा)', titleEn: 'Array Builder (Multiplication Tables)' });
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [lit, setLit] = useState(0);
  const [busy, setBusy] = useState(false);
  const [li, setLi] = useState(0);
  const scene = useRef<{ set: (r: number, c: number, lit: number) => void; flipAnim: (done: () => void) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const root = new THREE.Group(); ctx.scene.add(root);
    const cubes: THREE.Mesh[] = [];
    const set = (r: number, c: number, litN: number) => {
      [...root.children].forEach((x) => root.remove(x)); cubes.length = 0;
      const gap = 1.08; const w = (c - 1) * gap / 2, d = (r - 1) * gap / 2;
      for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) {
        const m = cube(COLORS[y % COLORS.length], 0.96) as THREE.Mesh; m.position.set(x * gap - w, 0.5, y * gap - d); m.userData.i = y * c + x;
        const mm = m.material as THREE.MeshStandardMaterial; mm.transparent = true; mm.opacity = y * c + x < litN ? 1 : 0.22; root.add(m); cubes.push(m);
      }
    };
    const flipAnim = (done: () => void) => { ctx.tween(900, (k) => { root.rotation.y = k * Math.PI / 2; }, () => { root.rotation.y = 0; done(); }, ease.inOut); };
    scene.current = { set, flipAnim };
    set(3, 4, 12);
    return () => { scene.current = null; };
  }, [], { camera: [0, 10, 11], target: [0, 0.5, 0], minDistance: 6, maxDistance: 22 });

  const apply = (r: number, c: number, l = r * c) => { setRows(r); setCols(c); setLit(l); scene.current?.set(r, c, l); };
  const countAll = () => {
    if (busy) return; setBusy(true); const total = rows * cols; apply(rows, cols, 0); let n = 0;
    const tick = () => { n += 1; setLit(n); scene.current?.set(rows, cols, n); if (n % cols === 0) kit.say(`${n}`, `${n}`); if (n < total) window.setTimeout(tick, 140); else { setBusy(false); kit.good(`${rows} × ${cols} = ${total}`, `${rows} × ${cols} = ${total}`); kit.star(); } };
    window.setTimeout(tick, 300);
  };
  const swap = () => { if (busy) return; setBusy(true); scene.current?.flipAnim(() => { apply(cols, rows); setBusy(false); kit.say(`${cols} × ${rows} = ${rows * cols}. उत्तर उही!`, `${cols} × ${rows} = ${rows * cols}. Same answer!`); }); };

  useEffect(() => {
    if (kit.mode === 'LEARN') { const p = [[2, 5], [3, 4], [4, 3], [5, 2], [6, 3]][li % 5]; apply(p[0], p[1], 0); kit.say('पङ्क्ति र स्तम्भ गरेर घन मिलाउँदा गुणन बन्छ।', 'Rows and columns of cubes make multiplication.'); }
    else if (kit.mode === 'PLAY') { apply(rows, cols); kit.say('पङ्क्ति र स्तम्भ बदलौँ।', 'Change the rows and columns.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const r = rnd(2, 9), c = rnd(2, 9); return { r, c, kind: i % 2 }; }), []);
  const questions: (QuizQuestion & { r: number; c: number })[] = data.map((d, i) => d.kind === 0
    ? { np: `${fmt('ne', d.r)} × ${fmt('ne', d.c)} = ?`, en: `${d.r} × ${d.c} = ?`, r: d.r, c: d.c, answer: String(d.r * d.c), options: numChoices(d.r * d.c, i * 11 + 3, [d.r, -d.r, d.c, -d.c, 1]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) }
    : { np: `${fmt('ne', d.r)} पङ्क्ति, ${fmt('ne', d.c)} स्तम्भ। जम्मा कति घन?`, en: `${d.r} rows of ${d.c}. How many cubes in all?`, r: d.r, c: d.c, answer: String(d.r * d.c), options: numChoices(d.r * d.c, i * 13 + 5, [d.c, -d.c, 1, -1, d.r]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#64748b' }}>{Array.from({ length: Math.min(rows, 6) }, () => cols).join(' + ')}{rows > 6 ? ' …' : ''}</div>
      <div style={{ fontSize: 34, fontWeight: 900 }}>{fmt(kit.lang, rows)} × {fmt(kit.lang, cols)} = <span style={{ color: lit === rows * cols ? '#16a34a' : '#94a3b8' }}>{fmt(kit.lang, lit === rows * cols ? rows * cols : lit)}</span></div>
    </div>
  );
  const stepper = (label: string, v: number, set: (n: number) => void) => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#f1f5f9', borderRadius: 14, padding: '4px 8px' }}>
      <b>{label}</b><CBtn color="#94a3b8" disabled={busy} style={{ minHeight: 40, padding: '2px 12px' }} onClick={() => set(Math.max(1, v - 1))}>−</CBtn><b style={{ minWidth: 24, textAlign: 'center', fontSize: 20 }}>{fmt(kit.lang, v)}</b><CBtn color="#0ea5e9" disabled={busy} style={{ minHeight: 40, padding: '2px 12px' }} onClick={() => set(Math.min(10, v + 1))}>+</CBtn>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 200 }}>{kit.t(`${fmt('ne', rows)} पङ्क्ति × ${fmt('ne', cols)} स्तम्भ`, `${rows} rows × ${cols} columns`)}</div>
      <CBtn color="#8b5cf6" disabled={busy} onClick={countAll}>▶ {kit.t('गनौँ', 'Count')}</CBtn>
      <CBtn color="#f97316" disabled={busy} onClick={swap}>🔄 {kit.t('पङ्क्ति ↔ स्तम्भ', 'Swap')}</CBtn>
      <CBtn color="#16a34a" disabled={busy} onClick={() => setLi(li + 1)}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{stepper(kit.t('पङ्क्ति', 'Rows'), rows, (n) => apply(n, cols))}{stepper(kit.t('स्तम्भ', 'Cols'), cols, (n) => apply(rows, n))}
      <CBtn color="#8b5cf6" disabled={busy} onClick={countAll}>▶ {kit.t('गनौँ', 'Count')}</CBtn><CBtn color="#f97316" disabled={busy} onClick={swap}>🔄</CBtn></Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.r, q.c)} />
  );
  void shuffle;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
