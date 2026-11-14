/**
 * Class 4 lesson 12 · Perimeter and area (परिमिति र क्षेत्रफल)
 * Garden Lab — an ant walks round a rectangular garden (perimeter); square tiles cover it (area).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, Hud, Tip, Props, numQ } from './h4';

type Mode = 'P' | 'A';
interface Api { set: (l: number, w: number, mode: Mode, rows: number) => void; walk: (l: number, w: number, done: () => void) => void }
const S = 0.85;

export const GardenLab: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L12-01', chapter: 12, titleNp: 'बगैँचा प्रयोगशाला (परिमिति र क्षेत्रफल)', titleEn: 'Garden Lab (Perimeter & Area)' });
  const [l, setL] = useState(6);
  const [w, setW] = useState(4);
  const [mode, setMode] = useState<Mode>('P');
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState(4);
  const [target, setTarget] = useState({ mode: 'P' as Mode, v: 20 });
  const scene = useRef<Api | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g); let ant: THREE.Mesh | null = null;
    const pt = (l2: number, w2: number, u: number, v: number) => new THREE.Vector3((u - l2 / 2) * S, 0.5, (v - w2 / 2) * S);
    const set = (l2: number, w2: number, m: Mode, r: number) => {
      g.clear(); ant = null;
      const floor = shadowed(new THREE.Mesh(new THREE.BoxGeometry(l2 * S, 0.2, w2 * S), mat('#bbf7d0', 0.8))); floor.position.y = 0.1; g.add(floor);
      if (m === 'A') {
        for (let i = 0; i < l2; i++) for (let j = 0; j < w2; j++) { if (j >= r) continue; const t = shadowed(new THREE.Mesh(new THREE.BoxGeometry(S * 0.92, 0.18, S * 0.92), mat((i + j) % 2 ? '#38bdf8' : '#0ea5e9', 0.5))); t.position.set((i + 0.5 - l2 / 2) * S, 0.29, (j + 0.5 - w2 / 2) * S); g.add(t); }
      } else {
        const cols = ['#ef4444', '#f59e0b', '#ef4444', '#f59e0b']; const sides: [number, number, number, number][] = [[0, 0, 1, 0], [l2, 0, 0, 1], [l2, w2, -1, 0], [0, w2, 0, -1]]; const len = [l2, w2, l2, w2];
        sides.forEach(([x0, y0, dx, dy], si) => { for (let k = 0; k < len[si]; k++) { const p = pt(l2, w2, x0 + dx * k, y0 + dy * k); const post = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.9, 0.16), mat(cols[si], 0.5))); post.position.set(p.x, 0.55, p.z); g.add(post); } });
      }
      const lt = textSprite(`${l2}`, 1.5, { px: 56, w: 160, h: 80, bg: '#ffffff', border: '#ef4444' }); lt.position.set(0, 0.6, (w2 / 2) * S + 0.9); g.add(lt);
      const wt = textSprite(`${w2}`, 1.5, { px: 56, w: 160, h: 80, bg: '#ffffff', border: '#f59e0b' }); wt.position.set((l2 / 2) * S + 0.9, 0.6, 0); g.add(wt);
    };
    const walk = (l2: number, w2: number, done: () => void) => {
      set(l2, w2, 'P', 0); const a = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), mat('#7c2d12', 0.4))); g.add(a); ant = a;
      const path = [pt(l2, w2, 0, 0), pt(l2, w2, l2, 0), pt(l2, w2, l2, w2), pt(l2, w2, 0, w2), pt(l2, w2, 0, 0)]; const lens = path.slice(1).map((p, i) => p.distanceTo(path[i])); const tot = lens.reduce((s, x) => s + x, 0);
      ctx.tween(Math.max(2500, (l2 + w2) * 300), (k) => { let d = k * tot, i = 0; while (i < 3 && d > lens[i]) { d -= lens[i]; i++; } const p0 = path[i], p1 = path[i + 1]; a.position.lerpVectors(p0, p1, Math.min(1, d / lens[i])); a.position.y = 0.5; }, done, ease.inOut);
    };
    scene.current = { set, walk }; set(6, 4, 'P', 4);
    return () => { scene.current = null; void ant; };
  }, [], { camera: [0, 13, 9], target: [0, 0, 0], minDistance: 7, maxDistance: 24, ground: 0xfef9c3 });

  const apply = (l2: number, w2: number, m: Mode = mode, r = w2) => { setL(l2); setW(w2); setMode(m); setRows(r); scene.current?.set(l2, w2, m, r); };
  const P = 2 * (l + w), A = l * w;
  const newTarget = () => { const m: Mode = rnd(0, 1) ? 'P' : 'A'; const v = m === 'P' ? rnd(5, 14) * 2 : [12, 16, 18, 20, 24, 30, 36][rnd(0, 6)]; setTarget({ mode: m, v }); apply(2, 2, m); kit.say(m === 'P' ? `परिमिति ${fmt('ne', v)} भएको आयत बनाऔँ` : `क्षेत्रफल ${fmt('ne', v)} भएको आयत बनाऔँ`, m === 'P' ? `Make a rectangle with perimeter ${v}` : `Make a rectangle with area ${v}`); };
  const freshLearn = () => { const l2 = rnd(4, 9), w2 = rnd(2, 5); apply(l2, w2, 'P'); kit.say(`लम्बाइ ${fmt('ne', l2)}, चौडाइ ${fmt('ne', w2)}। कमिला वरिपरि हिँडोस्`, `Length ${l2}, width ${w2}. Let the ant walk all the way round`); };
  useEffect(() => { if (kit.mode === 'LEARN') freshLearn(); else if (kit.mode === 'PLAY') newTarget(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const doWalk = () => { if (busy) return; setMode('P'); setBusy(true); scene.current?.walk(l, w, () => { setBusy(false); kit.say(`परिमिति = २ × (${fmt('ne', l)} + ${fmt('ne', w)}) = ${fmt('ne', P)}`, `Perimeter = 2 × (${l} + ${w}) = ${P}`); kit.star(); }); };
  const doFill = () => { if (busy) return; setMode('A'); setRows(0); scene.current?.set(l, w, 'A', 0); setBusy(true); let r = 0; const step = () => { r++; setRows(r); scene.current?.set(l, w, 'A', r); if (r < w) window.setTimeout(step, 450); else { setBusy(false); kit.say(`क्षेत्रफल = ${fmt('ne', l)} × ${fmt('ne', w)} = ${fmt('ne', A)}`, `Area = ${l} × ${w} = ${A}`); kit.star(); } }; window.setTimeout(step, 300); };
  const check = () => { const v = target.mode === 'P' ? P : A; if (v === target.v) { kit.good(); kit.star(); window.setTimeout(newTarget, 1300); } else kit.oops(`अहिले ${target.mode === 'P' ? 'परिमिति' : 'क्षेत्रफल'} ${fmt('ne', v)}`, `Now the ${target.mode === 'P' ? 'perimeter' : 'area'} is ${v}`); };
  const bump = (dl: number, dw: number) => apply(Math.max(1, Math.min(12, l + dl)), Math.max(1, Math.min(8, w + dw)), kit.mode === 'PLAY' ? target.mode : mode);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const l2 = rnd(3, 12), w2 = rnd(2, 8); return { l: l2, w: w2, i }; }), []);
  const questions: (QuizQuestion & { d: { l: number; w: number; m: Mode } })[] = data.map((d, i) => {
    const sq = i % 4 === 3; const w2 = sq ? d.l : d.w; const shape = sq ? 'वर्गको' : 'आयतको'; const shapeEn = sq ? 'square' : 'rectangle';
    if (i % 4 === 2) return { d: { l: d.l, w: d.w, m: 'P' as Mode }, ...numQ(`आयतको परिमिति ${fmt('ne', 2 * (d.l + d.w))} र लम्बाइ ${fmt('ne', d.l)} भए चौडाइ कति?`, `A rectangle has perimeter ${2 * (d.l + d.w)} and length ${d.l}. What is the width?`, d.w, i, [1, -1, 2, d.l], (x) => fmt(kit.lang, x), 1) };
    if (i % 2 === 0) return { d: { l: d.l, w: w2, m: 'P' as Mode }, ...numQ(`${sq ? 'वर्ग' : 'आयत'}को ${sq ? 'भुजा' : 'लम्बाइ ' + fmt('ne', d.l) + ', चौडाइ'} ${fmt('ne', sq ? d.l : w2)}। परिमिति कति?`, `${shapeEn[0].toUpperCase() + shapeEn.slice(1)}: ${sq ? 'side ' + d.l : 'length ' + d.l + ', width ' + w2}. What is the perimeter?`, 2 * (d.l + w2), i, [2, -2, d.l, 4, -4], (x) => fmt(kit.lang, x), 1) };
    void shape;
    return { d: { l: d.l, w: w2, m: 'A' as Mode }, ...numQ(`लम्बाइ ${fmt('ne', d.l)}, चौडाइ ${fmt('ne', w2)} भएको आयतको क्षेत्रफल कति?`, `A rectangle is ${d.l} long and ${w2} wide. What is its area?`, d.l * w2, i + 1, [d.l, -d.l, w2, 2 * (d.l + w2), 1], (x) => fmt(kit.lang, x), 1) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color={mode === 'P' ? '#ef4444' : '#0ea5e9'}>
      {kit.mode === 'PLAY' && <div style={{ fontSize: 15, fontWeight: 900 }}>🎯 {target.mode === 'P' ? kit.t('परिमिति', 'Perimeter') : kit.t('क्षेत्रफल', 'Area')} = {fmt(kit.lang, target.v)}</div>}
      <div style={{ fontSize: 14, fontWeight: 800, color: '#475569' }}>{kit.t('लम्बाइ', 'Length')} {fmt(kit.lang, l)} · {kit.t('चौडाइ', 'Width')} {fmt(kit.lang, w)}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color: mode === 'P' ? '#ef4444' : '#0ea5e9' }}>{mode === 'P' ? `${kit.t('परिमिति', 'Perimeter')} = 2 × (${fmt(kit.lang, l)} + ${fmt(kit.lang, w)}) = ${fmt(kit.lang, P)}` : `${kit.t('क्षेत्रफल', 'Area')} = ${fmt(kit.lang, l)} × ${fmt(kit.lang, w)} = ${fmt(kit.lang, rows >= w ? A : l * rows)}`}</div>
    </Hud>
  );
  const adj = [[-1, 0, 'L −'], [1, 0, 'L +'], [0, -1, 'W −'], [0, 1, 'W +']].map(([a, b, t]) => <CBtn key={t as string} color="#f59e0b" disabled={busy} onClick={() => bump(a as number, b as number)}>{kit.lang === 'ne' ? (t as string).replace('L', 'ल').replace('W', 'चौ') : (t as string)}</CBtn>);
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('परिमिति = वरिपरिको दुरी · क्षेत्रफल = भित्रको ठाउँ (वर्ग एकाइ)', 'Perimeter = distance around · Area = space inside (square units)')}</Tip>{adj}<CBtn color="#ef4444" disabled={busy} onClick={doWalk}>🐜 {kit.t('परिमिति', 'Perimeter')}</CBtn><CBtn color="#0ea5e9" disabled={busy} onClick={doFill}>▦ {kit.t('क्षेत्रफल', 'Area')}</CBtn><CBtn color="#8b5cf6" disabled={busy} onClick={freshLearn}>🎲</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{adj}<CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn><CBtn color="#8b5cf6" onClick={newTarget}>🎲</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.d.l, q.d.w, q.d.m)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
