/**
 * Lesson 6 · Local numerals up to 20 (स्थानीय अङ्क प्रणाली)
 * Numeral Street — signboards for 1 to 20 in Hindu-Arabic, Devanagari and Roman numerals.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const roman = (n: number) => { const t: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, r] of t) while (n >= v) { s += r; n -= v; } return s; };
const COL = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9'];

export const NumeralSigns: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L6-01', chapter: 6, titleNp: 'अङ्क सडक (रोमन र देवनागरी)', titleEn: 'Numeral Street (Roman and Devanagari)' });
  const [sel, setSel] = useState(5);
  const [tour, setTour] = useState(false);
  const scene = useRef<{ pick: (n: number) => void } | null>(null);
  const live = useRef({ tap: (_n: number) => {}, mode: kit.mode });
  live.current.mode = kit.mode;

  useStage(kit.stageRef, (ctx) => {
    const boards: THREE.Group[] = [];
    for (let n = 1; n <= 20; n++) {
      const g = new THREE.Group(); const row = Math.floor((n - 1) / 10), col = (n - 1) % 10;
      g.position.set((col - 4.5) * 2.5, 0, row ? 2.2 : -2.2); g.userData.n = n;
      const post = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8), mat('#78716c'))); post.position.y = 0.8; g.add(post);
      const board = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.4, 0.15), mat(COL[(n - 1) % 5], 0.5))); board.position.y = 2.4; g.add(board);
      const t = textSprite(`${n}\n${toNp(n)}\n${roman(n)}`, 2, { px: 60, w: 192, h: 288, bg: '#ffffff' }); t.scale.set(1.8, 2.2, 1); t.position.set(0, 2.4, 0.12); g.add(t);
      ctx.scene.add(g); boards.push(g);
    }
    const pick = (n: number) => boards.forEach((b) => { b.userData.sel = b.userData.n === n; });
    ctx.onFrame(() => boards.forEach((b) => { const to = b.userData.sel ? 0.9 : 0; b.position.y += (to - b.position.y) * 0.18; }));
    ctx.onTap(() => boards, (hit) => { if (!hit) return; let o: THREE.Object3D | null = hit.object; while (o && o.userData.n === undefined) o = o.parent; if (o) live.current.tap(o.userData.n); });
    scene.current = { pick }; pick(5);
    return () => { scene.current = null; };
  }, [], { camera: [0, 6, 17], target: [0, 2.2, 0], minDistance: 9, maxDistance: 28, ground: 0xd1fae5 });

  const choose = (n: number) => { setSel(n); scene.current?.pick(n); kit.say(`${toNp(n)} — ${roman(n)}`, `${n} — ${roman(n)}`); };
  live.current.tap = (n) => { if (live.current.mode !== 'CHALLENGE') { kit.tap(); choose(n); } };
  const runTour = () => { if (tour) return; setTour(true); let i = 1; const step = () => { choose(i); i += 1; if (i <= 20) window.setTimeout(step, 1300); else window.setTimeout(() => { setTour(false); kit.good(); kit.star(); }, 1000); }; step(); };

  useEffect(() => { if (kit.mode === 'LEARN') { choose(1); kit.say('रोमन: I, V, X बाट बन्छ। देवनागरी: १, २, ३…', 'Roman numerals use I, V and X. Devanagari: १, २, ३…'); } else scene.current?.pick(-1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const n = rnd(1, 20); const k = i % 4; const w = shuffle(Array.from({ length: 20 }, (_, j) => j + 1).filter((x) => x !== n), i + 3).slice(0, 2); return { n, k, w }; }), []);
  const questions: QuizQuestion[] = data.map((d, i) => {
    const o = shuffle([d.n, ...d.w], i * 5 + 1);
    if (d.k === 0) return { np: `${toNp(d.n)} को रोमन अङ्क कुन हो?`, en: `Which Roman numeral is ${toNp(d.n)}?`, answer: String(d.n), options: o.map((x) => ({ key: String(x), label: roman(x) })) };
    if (d.k === 1) return { np: `${roman(d.n)} को हिन्दु-अरेबिक अङ्क कुन हो?`, en: `${roman(d.n)} equals which number?`, answer: String(d.n), options: o.map((x) => ({ key: String(x), label: String(x) })) };
    if (d.k === 2) return { np: `${d.n} को देवनागरी अङ्क कुन हो?`, en: `Which is ${d.n} in Devanagari?`, answer: String(d.n), options: o.map((x) => ({ key: String(x), label: toNp(x) })) };
    return { np: `${toNp(d.n)} को रोमन अङ्क कुन हो?`, en: `${toNp(d.n)} in Roman numerals is…`, answer: String(d.n), options: o.map((x) => ({ key: String(x), label: roman(x) })) };
  });
  void rnd;

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #22c55e', textAlign: 'center', minWidth: 190 }}>
      {[[kit.t('हिन्दु-अरेबिक', 'Hindu-Arabic'), String(sel)], [kit.t('देवनागरी', 'Devanagari'), toNp(sel)], [kit.t('रोमन', 'Roman'), roman(sel)]].map(([l, v]) => <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontWeight: 900, fontSize: 18 }}><span style={{ fontSize: 13, color: '#64748b' }}>{l}</span><span>{v}</span></div>)}
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('सूचना पाटी छोएर तीनै प्रकारका अङ्क हेरौँ', 'Tap a signboard to see all three kinds of numerals')}</div><CBtn color="#8b5cf6" disabled={tour} onClick={runTour}>▶ {kit.t('१ देखि २० सम्म', '1 to 20 tour')}</CBtn><CBtn color="#f59e0b" disabled={tour} onClick={() => choose(((sel + 18) % 20) + 1)}>◀</CBtn><CBtn color="#f59e0b" disabled={tour} onClick={() => choose((sel % 20) + 1)}>▶</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <CBtn key={n} color={n === sel ? '#0ea5e9' : '#cbd5e1'} style={{ minWidth: 44, minHeight: 40, padding: '2px 6px', fontSize: 14, color: n === sel ? '#fff' : '#1f2937' }} onClick={() => choose(n)}>{n}</CBtn>)}</Controls>
  ) : <QuizPanel kit={kit} questions={questions} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
