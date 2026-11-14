/**
 * Class 4 lessons 1–3 · Lines and angles, Plane figures, Solid objects
 * Protractor Lab, Shape Builder, Solid Explorer.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, Hud, Tip, Props, mcq, numQ } from './h4';

/* ───────────── Lesson 1 · Protractor Lab ───────────── */
const kindOf = (a: number) => (a === 180 ? 3 : a === 90 ? 1 : a < 90 ? 0 : 2);
const KIND = [['न्यून कोण', 'Acute angle', '#0ea5e9'], ['समकोण', 'Right angle', '#16a34a'], ['अधिक कोण', 'Obtuse angle', '#f97316'], ['सरल कोण', 'Straight angle', '#8b5cf6']] as const;

export const ProtractorLab: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L1-01', chapter: 1, titleNp: 'चाँद प्रयोगशाला', titleEn: 'Protractor Lab' });
  const [a, setA] = useState(60);
  const [target, setTarget] = useState(65);
  const scene = useRef<{ set: (d: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(5.2, 64, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#bae6fd', transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.02; ctx.scene.add(disc);
    for (let d = 0; d <= 180; d += 10) {
      const th = (d * Math.PI) / 180;
      const tick = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.07), mat('#0f172a'))); tick.position.set(Math.cos(th) * 4.95, 0.08, -Math.sin(th) * 4.95); tick.rotation.y = th; ctx.scene.add(tick);
      const lab = textSprite(String(d), 1.1, { px: 40, w: 128, h: 64, bg: null, color: '#0f172a' }); lab.position.set(Math.cos(th) * 5.9, 0.3, -Math.sin(th) * 5.9); ctx.scene.add(lab);
    }
    const base = shadowed(new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.15, 0.22), mat('#2563eb', 0.5))); base.geometry.translate(3.2, 0, 0); base.position.y = 0.14; ctx.scene.add(base);
    const arm = shadowed(new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.15, 0.22), mat('#ef4444', 0.5))); arm.geometry.translate(3.2, 0, 0); arm.position.y = 0.3; ctx.scene.add(arm);
    const knob = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 20), mat('#facc15', 0.4))); knob.position.y = 0.25; ctx.scene.add(knob);
    let sec = new THREE.Mesh(); ctx.scene.add(sec);
    const set = (deg: number) => {
      const th = (deg * Math.PI) / 180; arm.rotation.y = th;
      ctx.scene.remove(sec); sec.geometry.dispose();
      sec = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48, 0, Math.max(0.01, th)), new THREE.MeshBasicMaterial({ color: KIND[kindOf(deg)][2], transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
      sec.rotation.x = -Math.PI / 2; sec.position.y = 0.1; ctx.scene.add(sec);
    };
    scene.current = { set }; set(60);
    return () => { scene.current = null; };
  }, [], { camera: [0, 11, 9], target: [0, 0, -2], minDistance: 7, maxDistance: 22, ground: 0xe0f2fe });

  const upd = (d: number, speak = false) => { const v = Math.max(0, Math.min(180, d)); setA(v); scene.current?.set(v); if (speak) { const k = kindOf(v); kit.say(`${fmt('ne', v)}° — ${KIND[k][0]}`, `${v}° — ${KIND[k][1]}`); } };
  const newTarget = () => { const t = rnd(4, 34) * 5; setTarget(t); upd(rnd(0, 1) ? 20 : 160); kit.say(`${fmt('ne', t)}° को कोण बनाऔँ`, `Make an angle of ${t}°`); };
  useEffect(() => { if (kit.mode === 'LEARN') upd(30, true); else if (kit.mode === 'PLAY') newTarget(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const check = () => { if (a === target) { kit.good(); kit.star(); window.setTimeout(newTarget, 1200); } else kit.oops(a < target ? 'अझै खोलौँ' : 'अलि बन्द गरौँ', a < target ? 'Open it a bit more' : 'Close it a bit'); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ deg: i % 2 ? rnd(2, 17) * 10 + 5 : [30, 45, 90, 120, 135, 180, 60, 150][rnd(0, 7)], i })), []);
  const questions: (QuizQuestion & { deg: number })[] = data.map((d, i) => {
    const k = kindOf(d.deg);
    if (i % 2 === 0) return { deg: d.deg, np: 'यो कस्तो कोण हो?', en: 'What kind of angle is this?', answer: String(k), options: shuffle(KIND.map((x, j) => ({ key: String(j), label: kit.t(x[0], x[1]) })), i + 2) };
    return { deg: d.deg, ...numQ('चाँदले यो कोण कति डिग्री देखाउँछ?', 'What does the protractor read?', d.deg, i, [10, -10, 5, -5, 20], (x) => `${fmt(kit.lang, x)}°`) };
  });

  const k = kindOf(a);
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color={KIND[k][2]}>
      {kit.mode === 'PLAY' && <div style={{ fontSize: 15, fontWeight: 900 }}>🎯 {kit.t(`${fmt('ne', target)}° बनाऔँ`, `Make ${target}°`)}</div>}
      <div style={{ fontSize: 30, fontWeight: 900 }}>{fmt(kit.lang, a)}°</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: KIND[k][2] }}>{kit.t(KIND[k][0], KIND[k][1])}</div>
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('आधार रेखा 0° मा राखेर कोण पढौँ', 'Keep the base line on 0° and read the angle')}</Tip>
      {[30, 90, 120, 180].map((d) => <CBtn key={d} color={KIND[kindOf(d)][2]} onClick={() => upd(d, true)}>{fmt(kit.lang, d)}°</CBtn>)}
      <CBtn color="#ef4444" onClick={() => upd(a - 10, true)}>−10°</CBtn><CBtn color="#ef4444" onClick={() => upd(a + 10, true)}>+10°</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{[-5, -1, 1, 5].map((d) => <CBtn key={d} color="#ef4444" onClick={() => upd(a + d)}>{d > 0 ? '+' : '−'}{Math.abs(d)}°</CBtn>)}<CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn><CBtn color="#8b5cf6" onClick={newTarget}>🎲</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => upd(q.deg)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};

/* ───────────── Lesson 2 · Shape Builder ───────────── */
interface Sh { np: string; en: string; pts: [number, number][]; lens: string[]; sides: number; color: string; factNp: string; factEn: string }
const SHAPES: Sh[] = [
  { np: 'समबाहु त्रिभुज', en: 'Equilateral triangle', pts: [[-3, -2.6], [3, -2.6], [0, 2.6]], lens: ['6', '6', '6'], sides: 3, color: '#ef4444', factNp: 'तीनै भुजा बराबर', factEn: 'All 3 sides are equal' },
  { np: 'समद्विबाहु त्रिभुज', en: 'Isosceles triangle', pts: [[-3, -2], [3, -2], [0, 2]], lens: ['6', '5', '5'], sides: 3, color: '#f97316', factNp: 'दुई भुजा बराबर', factEn: '2 sides are equal' },
  { np: 'विषमबाहु त्रिभुज', en: 'Scalene triangle', pts: [[-3, -2], [3, -2], [2, 2]], lens: ['6', '4.1', '6.4'], sides: 3, color: '#eab308', factNp: 'कुनै भुजा बराबर छैन', factEn: 'No two sides are equal' },
  { np: 'समकोणी त्रिभुज', en: 'Right-angled triangle', pts: [[-3, -2], [1.8, -2], [-3, 1.6]], lens: ['8', '10', '6'], sides: 3, color: '#22c55e', factNp: 'एउटा कोण ९०° (समकोण)', factEn: 'One angle is 90° (a right angle)' },
  { np: 'वर्ग', en: 'Square', pts: [[-2.5, -2.5], [2.5, -2.5], [2.5, 2.5], [-2.5, 2.5]], lens: ['5', '5', '5', '5'], sides: 4, color: '#0ea5e9', factNp: '४ बराबर भुजा र ४ समकोण', factEn: '4 equal sides and 4 right angles' },
  { np: 'आयत', en: 'Rectangle', pts: [[-3.5, -2], [3.5, -2], [3.5, 2], [-3.5, 2]], lens: ['7', '4', '7', '4'], sides: 4, color: '#8b5cf6', factNp: 'सम्मुख भुजा बराबर, ४ समकोण', factEn: 'Opposite sides equal, 4 right angles' },
  { np: 'समानान्तर चतुर्भुज', en: 'Parallelogram', pts: [[-4, -2], [2, -2], [4, 2], [-2, 2]], lens: ['6', '4.5', '6', '4.5'], sides: 4, color: '#ec4899', factNp: 'सम्मुख भुजा बराबर र समानान्तर', factEn: 'Opposite sides equal and parallel' },
  { np: 'समचतुर्भुज', en: 'Rhombus', pts: [[0, -3], [4, 0], [0, 3], [-4, 0]], lens: ['5', '5', '5', '5'], sides: 4, color: '#14b8a6', factNp: '४ बराबर भुजा, सम्मुख कोण बराबर', factEn: '4 equal sides, opposite angles equal' },
  { np: 'समलम्ब चतुर्भुज', en: 'Trapezium', pts: [[-4, -2], [4, -2], [2, 2], [-2, 2]], lens: ['8', '4.5', '4', '4.5'], sides: 4, color: '#a16207', factNp: 'एक जोडी भुजा समानान्तर', factEn: 'One pair of sides is parallel' },
];

export const ShapeBuilder: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L2-01', chapter: 2, titleNp: 'आकृति निर्माता', titleEn: 'Shape Builder' });
  const [si, setSi] = useState(0);
  const [hide, setHide] = useState(false);
  const scene = useRef<{ show: (i: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); g.position.y = 3.4; ctx.scene.add(g);
    const show = (i: number) => {
      g.clear(); const s = SHAPES[i]; const sh = new THREE.Shape(); s.pts.forEach(([x, y], j) => (j ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
      const m = shadowed(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false }), mat(s.color, 0.5))); m.position.z = -0.3; g.add(m);
      const cx = s.pts.reduce((t, p) => t + p[0], 0) / s.pts.length, cy = s.pts.reduce((t, p) => t + p[1], 0) / s.pts.length;
      s.pts.forEach(([x, y], j) => {
        const d = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), mat('#0f172a'))); d.position.set(x, y, 0.4); g.add(d);
        const L = textSprite('ABCD'[j], 1, { px: 60, w: 96, h: 96, bg: null, color: '#0f172a' }); const dx = x - cx, dy = y - cy, n = Math.hypot(dx, dy) || 1; L.position.set(x + (dx / n) * 0.7, y + (dy / n) * 0.7, 0.4); g.add(L);
        const [x2, y2] = s.pts[(j + 1) % s.pts.length]; const mx = (x + x2) / 2, my = (y + y2) / 2, ex = mx - cx, ey = my - cy, en = Math.hypot(ex, ey) || 1;
        const t = textSprite(s.lens[j], 1.5, { px: 52, w: 160, h: 80, bg: '#ffffff', border: s.color }); t.position.set(mx + (ex / en) * 0.9, my + (ey / en) * 0.9, 0.5); g.add(t);
      });
    };
    scene.current = { show }; show(0);
    ctx.onFrame((dt) => { g.rotation.y = Math.sin(performance.now() / 1600) * 0.35; void dt; });
    return () => { scene.current = null; };
  }, [], { camera: [0, 4, 14], target: [0, 3.2, 0], minDistance: 8, maxDistance: 24, ground: 0xfef9c3 });

  const choose = (i: number, speak = false) => { setSi(i); setHide(false); scene.current?.show(i); if (speak) kit.say(`${SHAPES[i].np}: ${SHAPES[i].factNp}`, `${SHAPES[i].en}: ${SHAPES[i].factEn}`); };
  const [pick, setPick] = useState(0);
  const newRound = () => { const i = rnd(0, SHAPES.length - 1); setPick(i); choose(i); setHide(true); kit.say('यो कुन आकृति हो?', 'Which shape is this?'); };
  useEffect(() => { if (kit.mode === 'LEARN') choose(si, true); else if (kit.mode === 'PLAY') newRound(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const opts = useMemo(() => shuffle([pick, ...shuffle(SHAPES.map((_, i) => i).filter((i) => i !== pick), pick + 7).slice(0, 3)], pick + 11), [pick, kit.mode]);
  const answer = (i: number) => { if (i === pick) { kit.good(); kit.star(); setHide(false); window.setTimeout(newRound, 1300); } else kit.oops(`भुजा गनेर हेरौँ: ${SHAPES[pick].sides}`, `Count the sides: ${SHAPES[pick].sides}`); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ s: (i * 5 + rnd(0, 3)) % SHAPES.length, i })), []);
  const questions: (QuizQuestion & { s: number })[] = data.map((d, i) => {
    const S = SHAPES[d.s];
    if (i % 2) return { s: d.s, ...numQ('यसमा कति वटा भुजा छन्?', 'How many sides does it have?', S.sides, i, [1, -1, 2], (x) => fmt(kit.lang, x), 3) };
    const names = SHAPES.filter((_, j) => j !== d.s).map((x) => x.en);
    const q = mcq('यो कुन आकृति हो?', 'Which shape is this?', S.en, names, i);
    return { s: d.s, ...q, options: q.options.map((o) => ({ key: o.key, label: kit.t(SHAPES.find((x) => x.en === o.key)!.np, o.key) })) };
  });

  const S = SHAPES[si];
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color={S.color}>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{hide ? '?' : kit.t(S.np, S.en)}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#475569' }}>{fmt(kit.lang, S.sides)} {kit.t('भुजा', 'sides')}{hide ? '' : ` · ${kit.t(S.factNp, S.factEn)}`}</div>
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('आकृति छानौँ र गुण हेरौँ', 'Pick a shape and read its properties')}</Tip>{SHAPES.map((s, i) => <CBtn key={i} color={i === si ? s.color : '#94a3b8'} onClick={() => { choose(i, true); kit.star(); }}>{kit.t(s.np, s.en)}</CBtn>)}</Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{opts.map((i) => <CBtn key={i} color={SHAPES[i].color} onClick={() => answer(i)}>{kit.t(SHAPES[i].np, SHAPES[i].en)}</CBtn>)}</Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => choose(q.s)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};

/* ───────────── Lesson 3 · Solid Explorer ───────────── */
interface So { np: string; en: string; f: number; e: number; v: number; color: string; geo: () => THREE.BufferGeometry; poly: boolean; noteNp: string; noteEn: string }
const SOLIDS: So[] = [
  { np: 'घन', en: 'Cube', f: 6, e: 12, v: 8, color: '#ef4444', geo: () => new THREE.BoxGeometry(3, 3, 3), poly: true, noteNp: 'सबै सतह बराबर वर्ग', noteEn: 'All faces are equal squares' },
  { np: 'घनाभ', en: 'Cuboid', f: 6, e: 12, v: 8, color: '#f97316', geo: () => new THREE.BoxGeometry(5, 2.4, 3), poly: true, noteNp: 'सतहहरू आयताकार', noteEn: 'Faces are rectangles' },
  { np: 'पिरामिड', en: 'Square pyramid', f: 5, e: 8, v: 5, color: '#eab308', geo: () => new THREE.ConeGeometry(2.6, 3.4, 4, 1).rotateY(Math.PI / 4), poly: true, noteNp: 'आधार वर्ग, ४ त्रिभुजाकार सतह', noteEn: 'Square base, 4 triangle faces' },
  { np: 'त्रिभुजाकार प्रिज्म', en: 'Triangular prism', f: 5, e: 9, v: 6, color: '#22c55e', geo: () => new THREE.CylinderGeometry(2, 2, 3.6, 3), poly: true, noteNp: '२ त्रिभुज र ३ आयताकार सतह', noteEn: '2 triangles and 3 rectangles' },
  { np: 'बेलना', en: 'Cylinder', f: 3, e: 2, v: 0, color: '#0ea5e9', geo: () => new THREE.CylinderGeometry(1.7, 1.7, 3.4, 40), poly: false, noteNp: '२ समतल र १ वक्र सतह', noteEn: '2 flat faces and 1 curved face' },
  { np: 'शङ्कु', en: 'Cone', f: 2, e: 1, v: 1, color: '#8b5cf6', geo: () => new THREE.ConeGeometry(2, 3.6, 40), poly: false, noteNp: '१ समतल र १ वक्र सतह, १ शीर्ष', noteEn: '1 flat face, 1 curved face, 1 vertex' },
  { np: 'गोला', en: 'Sphere', f: 1, e: 0, v: 0, color: '#ec4899', geo: () => new THREE.SphereGeometry(2, 40, 28), poly: false, noteNp: '१ वक्र सतह मात्र', noteEn: 'Only 1 curved face' },
];

export const SolidExplorer: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L3-01', chapter: 3, titleNp: 'ठोस वस्तु अन्वेषक', titleEn: 'Solid Explorer' });
  const [si, setSi] = useState(0);
  const [what, setWhat] = useState(0); // Play: 0 faces, 1 edges, 2 vertices
  const scene = useRef<{ show: (i: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); g.position.y = 2.6; ctx.scene.add(g);
    const show = (i: number) => {
      g.clear(); const s = SOLIDS[i]; const geo = s.geo();
      const m = shadowed(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.45, transparent: true, opacity: s.poly ? 0.8 : 1 }))); g.add(m);
      if (s.poly) {
        const eg = new THREE.EdgesGeometry(geo); g.add(new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: '#0f172a' })));
        const seen = new Set<string>(); const p = eg.attributes.position;
        for (let k = 0; k < p.count; k++) { const key = [p.getX(k), p.getY(k), p.getZ(k)].map((v) => v.toFixed(2)).join(','); if (seen.has(key)) continue; seen.add(key); const d = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), mat('#0f172a')); d.position.set(p.getX(k), p.getY(k), p.getZ(k)); g.add(d); }
      }
    };
    scene.current = { show }; show(0);
    ctx.onFrame((dt) => { g.rotation.y += dt * 0.5; });
    return () => { scene.current = null; };
  }, [], { camera: [0, 5, 10], target: [0, 2.4, 0], minDistance: 6, maxDistance: 20, ground: 0xe0f2fe });

  const choose = (i: number, speak = false) => { setSi(i); scene.current?.show(i); const s = SOLIDS[i]; if (speak) kit.say(`${s.np}: ${fmt('ne', s.f)} सतह, ${fmt('ne', s.e)} किनारा, ${fmt('ne', s.v)} शीर्ष`, `${s.en}: ${s.f} faces, ${s.e} edges, ${s.v} vertices`); };
  const newRound = () => { const i = rnd(0, SOLIDS.length - 1), w = rnd(0, 2); setSi(i); setWhat(w); scene.current?.show(i); kit.say(['यसमा कति सतह छन्?', 'यसमा कति किनारा छन्?', 'यसमा कति शीर्ष छन्?'][w], ['How many faces?', 'How many edges?', 'How many vertices?'][w]); };
  useEffect(() => { if (kit.mode === 'LEARN') choose(si, true); else if (kit.mode === 'PLAY') newRound(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const val = (s: So, w: number) => [s.f, s.e, s.v][w];
  const answer = (n: number) => { if (n === val(SOLIDS[si], what)) { kit.good(); kit.star(); window.setTimeout(newRound, 1100); } else kit.oops('फेरि गनौँ', 'Count again'); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ s: (i * 3 + rnd(0, 2)) % SOLIDS.length, w: i % 3 })), []);
  const questions: (QuizQuestion & { s: number })[] = data.map((d, i) => {
    const S = SOLIDS[d.s]; const wn = [['सतह', 'faces'], ['किनारा', 'edges'], ['शीर्ष', 'vertices']][d.w];
    return { s: d.s, ...numQ(`${S.np}मा कति ${wn[0]} छन्?`, `How many ${wn[1]} does a ${S.en.toLowerCase()} have?`, val(S, d.w), i, [1, -1, 2, -2, 3], (x) => fmt(kit.lang, x)) };
  });

  const S = SOLIDS[si];
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color={S.color}>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{kit.t(S.np, S.en)}</div>
      {kit.mode === 'LEARN' ? <><div style={{ fontSize: 15, fontWeight: 800 }}>{kit.t('सतह', 'F')} {fmt(kit.lang, S.f)} · {kit.t('किनारा', 'E')} {fmt(kit.lang, S.e)} · {kit.t('शीर्ष', 'V')} {fmt(kit.lang, S.v)}</div><div style={{ fontSize: 13, color: '#475569', fontWeight: 700 }}>{kit.t(S.noteNp, S.noteEn)}{S.poly ? ` · F + V − E = ${S.f + S.v - S.e}` : ''}</div></> : <div style={{ fontSize: 15, fontWeight: 800 }}>{kit.t(['सतह कति?', 'किनारा कति?', 'शीर्ष कति?'][what], ['Faces?', 'Edges?', 'Vertices?'][what])}</div>}
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('सतह, किनारा र शीर्ष गनौँ', 'Count the faces, edges and vertices')}</Tip>{SOLIDS.map((s, i) => <CBtn key={i} color={i === si ? s.color : '#94a3b8'} onClick={() => { choose(i, true); kit.star(); }}>{kit.t(s.np, s.en)}</CBtn>)}</Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{[0, 1, 2, 3, 4, 5, 6, 8, 9, 12].map((n) => <CBtn key={n} color="#0ea5e9" style={{ minWidth: 56, fontSize: 22 }} onClick={() => answer(n)}>{fmt(kit.lang, n)}</CBtn>)}</Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => choose(q.s)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
