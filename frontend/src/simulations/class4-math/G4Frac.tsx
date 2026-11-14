/**
 * Class 4 lesson 6 · Fraction, decimal and percentage (भिन्न, दशमलव र प्रतिशत)
 * Fraction Pies (equivalent fractions, comparing) and Decimal Grid (fraction = decimal = percent).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, Hud, Tip, Props, mcq, numQ } from './h4';

/* ───────────── Fraction Pies ───────────── */
const pieColors = ['#ef4444', '#f97316'];
const frac = (lang: 'ne' | 'en', n: number, d: number) => `${fmt(lang, n)}/${fmt(lang, d)}`;
type PieApi = { set: (i: number, n: number, d: number) => void };

export const FractionPies: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L6-01', chapter: 6, titleNp: 'भिन्नको पाई', titleEn: 'Fraction Pies' });
  const [A, setA] = useState<[number, number]>([1, 2]);
  const [B, setB] = useState<[number, number]>([2, 4]);
  const [k, setK] = useState(2);
  const [target, setTarget] = useState<[number, number]>([3, 4]);
  const scene = useRef<PieApi | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = [new THREE.Group(), new THREE.Group()]; g[0].position.x = -4.4; g[1].position.x = 4.4; g.forEach((x) => { x.position.y = 0.3; ctx.scene.add(x); });
    const set = (i: number, n: number, d: number) => {
      g[i].clear();
      for (let s = 0; s < d; s++) {
        const th = (2 * Math.PI) / d; const m = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.7, 40, 1, false, s * th + 0.02, th - 0.04), mat(s < n ? pieColors[i] : '#f1f5f9', 0.5)));
        m.userData.slice = s; g[i].add(m);
      }
      const lab = textSprite(`${n}/${d}`, 2.6, { px: 64, w: 256, h: 112, bg: '#ffffff', border: pieColors[i] }); lab.position.set(0, 3.2, 0); g[i].add(lab);
    };
    set(0, 1, 2); set(1, 2, 4); scene.current = { set };
    ctx.onTap(() => g[0].children.filter((c) => c.userData.slice !== undefined), (hit) => { if (hit) tapRef.current?.(hit.object.userData.slice); });
    return () => { scene.current = null; };
  }, [], { camera: [0, 12, 8], target: [0, 0, 0], minDistance: 7, maxDistance: 22, ground: 0xfef9c3 });
  const tapRef = useRef<((s: number) => void) | null>(null);

  const put = (i: number, n: number, d: number) => { if (i === 0) setA([n, d]); else setB([n, d]); scene.current?.set(i, n, d); };
  const learn = (kk: number, base = A) => { setK(kk); put(0, base[0], base[1]); put(1, base[0] * kk, base[1] * kk); kit.say(`${frac('ne', base[0], base[1])} = ${frac('ne', base[0] * kk, base[1] * kk)}`, `${base[0]}/${base[1]} = ${base[0] * kk}/${base[1] * kk}`); };
  const freshLearn = () => { const d = rnd(2, 6), n = rnd(1, d - 1); const base: [number, number] = [n, d]; put(0, n, d); learn(2, base); };
  const newTarget = () => { const d = rnd(3, 8), n = rnd(1, d - 1); setTarget([n, d]); put(0, 0, d); put(1, n, d); kit.say(`${frac('ne', n, d)} बनाउन पाई ट्याप गर`, `Tap the pie to shade ${n}/${d}`); };
  useEffect(() => { if (kit.mode === 'LEARN') freshLearn(); else if (kit.mode === 'PLAY') newTarget(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  tapRef.current = (s: number) => {
    if (kit.mode !== 'PLAY') return; const nn = s + 1 === A[0] ? s : s + 1; put(0, nn, A[1]); kit.tap();
    if (nn === target[0]) { kit.good(); kit.star(); window.setTimeout(newTarget, 1200); }
  };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const d = rnd(2, 6), n = rnd(1, d - 1), kk = rnd(2, 4); const d2 = rnd(3, 9), n2 = rnd(1, d2 - 1); return { d, n, kk, d2, n2, i }; }), []);
  const questions: (QuizQuestion & { d: any })[] = data.map((d, i) => {
    if (i % 3 === 0) return { d, ...mcq('रङ्गिन भाग कति भिन्न हो?', 'What fraction is shaded?', `${d.n}/${d.d}`, [`${d.d - d.n}/${d.d}`, `${d.n}/${d.d + 1}`, `${d.n + 1}/${d.d}`], i), options: mcq('', '', `${d.n}/${d.d}`, [`${d.d - d.n}/${d.d}`, `${d.n}/${d.d + 1}`, `${d.n + 1}/${d.d}`], i).options.map((o) => ({ key: o.key, label: o.key.split('/').map((x) => fmt(kit.lang, x)).join('/') })) };
    if (i % 3 === 1) return { d, ...numQ(`${frac('ne', d.n, d.d)} = ?/${fmt('ne', d.d * d.kk)}`, `${d.n}/${d.d} = ?/${d.d * d.kk}`, d.n * d.kk, i, [1, -1, d.kk, 2], (x) => fmt(kit.lang, x), 1) };
    const gt = d.n / d.d > d.n2 / d.d2 ? 0 : d.n / d.d < d.n2 / d.d2 ? 1 : 2;
    return { d, ...mcq(`${frac('ne', d.n, d.d)} र ${frac('ne', d.n2, d.d2)} मध्ये कुन ठूलो?`, `Which is greater: ${d.n}/${d.d} or ${d.n2}/${d.d2}?`, ['a', 'b', 'eq'][gt], ['a', 'b', 'eq'].filter((x) => x !== ['a', 'b', 'eq'][gt]), i), options: [{ key: 'a', label: frac(kit.lang, d.n, d.d) }, { key: 'b', label: frac(kit.lang, d.n2, d.d2) }, { key: 'eq', label: kit.t('बराबर', 'Equal') }] };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color="#ef4444">
      {kit.mode === 'PLAY' ? <div style={{ fontSize: 24, fontWeight: 900 }}>🎯 {frac(kit.lang, target[0], target[1])} · {frac(kit.lang, A[0], A[1])}</div>
        : <div style={{ fontSize: 24, fontWeight: 900 }}>{frac(kit.lang, A[0], A[1])} = {frac(kit.lang, B[0], B[1])}</div>}
      {kit.mode === 'LEARN' && <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{fmt(kit.lang, A[0])}×{fmt(kit.lang, k)} / {fmt(kit.lang, A[1])}×{fmt(kit.lang, k)}</div>}
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('अंश र हर दुवैलाई एउटै सङ्ख्याले गुणा गर्दा बराबर भिन्न बन्छ', 'Multiply top and bottom by the same number: same fraction')}</Tip>{[2, 3, 4].map((x) => <CBtn key={x} color={x === k ? '#ef4444' : '#94a3b8'} onClick={() => { learn(x); kit.star(); }}>×{fmt(kit.lang, x)}</CBtn>)}<CBtn color="#8b5cf6" onClick={freshLearn}>🎲</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><Tip>{kit.t('बायाँको पाईका टुक्रा ट्याप गरी रङ्ग्याऔँ', 'Tap slices of the left pie to shade them')}</Tip><CBtn color="#f59e0b" onClick={() => A[0] > 0 && put(0, A[0] - 1, A[1])}>−</CBtn><CBtn color="#f59e0b" onClick={() => A[0] < A[1] && put(0, A[0] + 1, A[1])}>+</CBtn><CBtn color="#8b5cf6" onClick={newTarget}>🎲</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { const d = q.d; put(0, d.n, d.d); if (d.i % 3 === 1) put(1, d.n * d.kk, d.d * d.kk); else put(1, d.n2, d.d2); }} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};

/* ───────────── Decimal Grid ───────────── */
export const DecimalGrid: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L6-02', chapter: 6, titleNp: 'दशमलव ग्रिड', titleEn: 'Decimal Grid' });
  const [n, setN] = useState(35);
  const [target, setTarget] = useState(60);
  const scene = useRef<{ set: (n: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const tiles: THREE.Mesh[] = []; const g = new THREE.Group(); ctx.scene.add(g);
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
      const t = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 0.85), mat('#e2e8f0', 0.6))); t.position.set((c - 4.5) * 0.95, 0.25, (r - 4.5) * 0.95); t.userData.i = r * 10 + c; g.add(t); tiles.push(t);
    }
    const set = (v: number) => tiles.forEach((t, i) => { const on = i < v; (t.material as THREE.MeshStandardMaterial).color.set(on ? (Math.floor(i / 10) % 2 ? '#0ea5e9' : '#38bdf8') : '#e2e8f0'); t.scale.y = on ? 1.6 : 1; t.position.y = on ? 0.4 : 0.25; });
    ctx.onTap(() => tiles, (hit) => { if (hit) tapRef.current?.(hit.object.userData.i + 1); });
    scene.current = { set }; set(35);
    return () => { scene.current = null; };
  }, [], { camera: [0, 12, 10], target: [0, 0, 0], minDistance: 7, maxDistance: 22, ground: 0xecfccb });
  const tapRef = useRef<((v: number) => void) | null>(null);

  const put = (v: number) => { const x = Math.max(0, Math.min(100, v)); setN(x); scene.current?.set(x); };
  const dec = (v: number) => (v / 100).toFixed(2).replace(/0$/, '');
  const say = (v: number) => kit.say(`${fmt('ne', v)}/१०० = ${fmt('ne', dec(v))} = ${fmt('ne', v)}%`, `${v}/100 = ${dec(v)} = ${v}%`);
  const newTarget = () => { const t = rnd(1, 19) * 5; setTarget(t); put(0); kit.say(`${fmt('ne', t)}% रङ्ग्याऔँ`, `Shade ${t}%`); };
  useEffect(() => { if (kit.mode === 'LEARN') { put(35); say(35); } else if (kit.mode === 'PLAY') newTarget(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  tapRef.current = (v: number) => { if (kit.mode === 'CHALLENGE') return; put(v); if (kit.mode === 'LEARN') say(v); };
  const check = () => { if (n === target) { kit.good(); kit.star(); window.setTimeout(newTarget, 1200); } else kit.oops(n < target ? 'अझै रङ्ग्याऔँ' : 'अलि घटाऔँ', n < target ? 'Shade a few more' : 'Too many — take some away'); };

  const data = useMemo(() => Array.from({ length: 8 }, () => rnd(1, 19) * 5 + (rnd(0, 1) ? 0 : rnd(1, 4))), []);
  const questions: (QuizQuestion & { v: number })[] = data.map((v, i) => {
    if (i % 3 === 0) return { v, ...numQ('कति प्रतिशत रङ्गिएको छ?', 'What percent is shaded?', v, i, [10, -10, 5, -5, 1], (x) => `${fmt(kit.lang, x)}%`, 1) };
    if (i % 3 === 1) return { v, ...mcq('रङ्गिएको भागलाई दशमलवमा लेख', 'Write the shaded part as a decimal', dec(v), [dec(Math.min(99, v + 10)), dec(Math.max(1, v - 10)), (v / 10).toFixed(1), dec(v + 1)], i), options: mcq('', '', dec(v), [dec(Math.min(99, v + 10)), dec(Math.max(1, v - 10)), (v / 10).toFixed(1), dec(v + 1)], i).options.map((o) => ({ key: o.key, label: fmt(kit.lang, o.key) })) };
    return { v, ...numQ(`${fmt('ne', v)}/१०० = ?%`, `${v}/100 = ?%`, v, i + 2, [10, -10, 1, 100], (x) => `${fmt(kit.lang, x)}%`, 1) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color="#0ea5e9">
      {kit.mode === 'PLAY' && <div style={{ fontSize: 15, fontWeight: 900 }}>🎯 {fmt(kit.lang, target)}%</div>}
      <div style={{ fontSize: 22, fontWeight: 900 }}>{fmt(kit.lang, n)}/{fmt(kit.lang, 100)} = {fmt(kit.lang, dec(n))} = {fmt(kit.lang, n)}%</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{kit.t('१०० मध्ये रङ्गिएका', 'shaded out of 100')}</div>
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('१०० मध्ये जति भाग = भिन्न = दशमलव = प्रतिशत', 'Parts out of 100 = fraction = decimal = percent')}</Tip>{[10, 25, 50, 75].map((v) => <CBtn key={v} color="#0ea5e9" onClick={() => { put(v); say(v); kit.star(); }}>{fmt(kit.lang, v)}%</CBtn>)}</Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><CBtn color="#ef4444" onClick={() => put(n - 10)}>−10</CBtn><CBtn color="#ef4444" onClick={() => put(n - 1)}>−1</CBtn><CBtn color="#0ea5e9" onClick={() => put(n + 1)}>+1</CBtn><CBtn color="#0ea5e9" onClick={() => put(n + 10)}>+10</CBtn><CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn><CBtn color="#8b5cf6" onClick={newTarget}>🎲</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => put(q.v)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
