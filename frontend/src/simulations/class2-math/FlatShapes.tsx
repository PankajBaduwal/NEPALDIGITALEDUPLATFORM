/**
 * Lesson 13 · Geometric shapes (ज्यामितीय आकार) — flat shapes
 * Flat Shapes Builder — shapes made of sticks and balls; tap each stick to count the sides and each ball to count the corners.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const poly = (n: number, r: number, rot = 0): [number, number][] => Array.from({ length: n }, (_, i) => [Math.cos(rot + (i / n) * Math.PI * 2) * r, Math.sin(rot + (i / n) * Math.PI * 2) * r]);
const SHAPES = [
  { id: 'triangle', np: 'त्रिभुज', en: 'Triangle', pts: poly(3, 3, Math.PI / 2), sides: 3, corners: 3, color: '#ef4444' },
  { id: 'square', np: 'वर्ग', en: 'Square', pts: [[-2.4, -2.4], [2.4, -2.4], [2.4, 2.4], [-2.4, 2.4]] as [number, number][], sides: 4, corners: 4, color: '#0ea5e9' },
  { id: 'rectangle', np: 'आयत', en: 'Rectangle', pts: [[-3.4, -2], [3.4, -2], [3.4, 2], [-3.4, 2]] as [number, number][], sides: 4, corners: 4, color: '#22c55e' },
  { id: 'pentagon', np: 'पञ्चभुज', en: 'Pentagon', pts: poly(5, 3, Math.PI / 2), sides: 5, corners: 5, color: '#f97316' },
  { id: 'hexagon', np: 'षड्भुज', en: 'Hexagon', pts: poly(6, 3, 0), sides: 6, corners: 6, color: '#8b5cf6' },
  { id: 'circle', np: 'गोलो', en: 'Circle', pts: [] as [number, number][], sides: 0, corners: 0, color: '#eab308' },
];

export const FlatShapes: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L13-02', chapter: 13, titleNp: 'सतही आकार बनाऔँ', titleEn: 'Flat Shapes Builder' });
  const [sel, setSel] = useState(0);
  const [sides, setSides] = useState(0);
  const [corners, setCorners] = useState(0);
  const scene = useRef<{ show: (i: number) => void; reset: () => void } | null>(null);
  const live = useRef({ mode: kit.mode, sel: 0, sides: 0, corners: 0, hitSide: () => {}, hitCorner: () => {} });
  live.current.mode = kit.mode; live.current.sel = sel; live.current.sides = sides; live.current.corners = corners;

  useStage(kit.stageRef, (ctx) => {
    const root = new THREE.Group(); root.position.y = 0.4; ctx.scene.add(root);
    let sticks: THREE.Mesh[] = []; let balls: THREE.Mesh[] = [];
    const show = (i: number) => {
      [...root.children].forEach((c) => root.remove(c)); sticks = []; balls = [];
      const s = SHAPES[i];
      if (s.id === 'circle') {
        const ring = shadowed(new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.14, 16, 64), mat(s.color, 0.4))); ring.rotation.x = Math.PI / 2; root.add(ring);
      } else {
        const face = new THREE.Shape(); s.pts.forEach((p, k) => (k === 0 ? face.moveTo(p[0], p[1]) : face.lineTo(p[0], p[1]))); face.closePath();
        const f = new THREE.Mesh(new THREE.ShapeGeometry(face), new THREE.MeshStandardMaterial({ color: s.color, transparent: true, opacity: 0.22, side: THREE.DoubleSide })); f.rotation.x = -Math.PI / 2; f.position.y = 0.02; root.add(f);
        s.pts.forEach((p, k) => {
          const q = s.pts[(k + 1) % s.pts.length]; const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
          const stick = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, len, 14), mat(s.color, 0.4))); stick.rotation.z = Math.PI / 2; stick.rotation.y = -Math.atan2(q[1] - p[1], q[0] - p[0]) * -1;
          const g = new THREE.Group(); g.position.set((p[0] + q[0]) / 2, 0.15, -(p[1] + q[1]) / 2); stick.rotation.set(0, 0, Math.PI / 2); g.rotation.y = Math.atan2(q[1] - p[1], q[0] - p[0]); g.add(stick); g.userData.side = k; stick.userData.side = k; root.add(g); sticks.push(stick);
        });
        s.pts.forEach((p, k) => { const b = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), mat('#1e293b', 0.4))); b.position.set(p[0], 0.2, -p[1]); b.userData.corner = k; root.add(b); balls.push(b); });
      }
    };
    const reset = () => { sticks.forEach((s) => { (s.material as THREE.MeshStandardMaterial).color.set(SHAPES[live.current.sel].color); s.userData.counted = false; }); balls.forEach((b) => { (b.material as THREE.MeshStandardMaterial).color.set('#1e293b'); b.userData.counted = false; }); };
    scene.current = { show, reset };
    const pulse = (o: THREE.Object3D) => ctx.tween(350, (k) => o.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.35));
    ctx.onTap(() => [...sticks, ...balls], (hit) => {
      if (!hit || live.current.mode === 'CHALLENGE') return; const o = hit.object as THREE.Mesh;
      if (o.userData.counted) return; o.userData.counted = true; pulse(o);
      if (o.userData.side !== undefined) { (o.material as THREE.MeshStandardMaterial).color.set('#facc15'); live.current.hitSide(); }
      else if (o.userData.corner !== undefined) { (o.material as THREE.MeshStandardMaterial).color.set('#f43f5e'); live.current.hitCorner(); }
    });
    ctx.onFrame((_d, t) => { root.rotation.y = Math.sin(t * 0.4) * 0.12; });
    show(0);
    return () => { scene.current = null; };
  }, [], { camera: [0, 11, 5], target: [0, 0, 0], minDistance: 6, maxDistance: 18, ground: 0xdcfce7, sky: 0xf0fdf4 });

  live.current.hitSide = () => { const n = live.current.sides + 1; setSides(n); kit.tap(); kit.say(`${n}`, `${n}`, true); if (n === SHAPES[live.current.sel].sides && live.current.corners === SHAPES[live.current.sel].corners) { kit.good(); kit.star(); } };
  live.current.hitCorner = () => { const n = live.current.corners + 1; setCorners(n); kit.tap(); if (n === SHAPES[live.current.sel].corners && live.current.sides === SHAPES[live.current.sel].sides) { kit.good(); kit.star(); } };

  const choose = (i: number) => { setSel(i); setSides(0); setCorners(0); live.current.sel = i; scene.current?.show(i); const s = SHAPES[i]; kit.say(s.id === 'circle' ? `${s.np} — सीधो भुजा छैन, कुना छैन` : `${s.np} — ${s.sides} भुजा र ${s.corners} कुना`, s.id === 'circle' ? `${s.en}: no straight sides and no corners` : `${s.en}: ${s.sides} sides and ${s.corners} corners`); };
  useEffect(() => { if (kit.mode === 'LEARN') choose(0); else if (kit.mode === 'PLAY') choose(1); /* eslint-disable-next-line */ }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ s: rnd(0, 5), kind: ['name', 'sides', 'corners', 'name'][i % 4] })), []);
  const questions: (QuizQuestion & { s: number })[] = data.map((d, i) => {
    const S = SHAPES[d.s];
    if (d.kind === 'name') return { np: 'यो कुन आकार हो?', en: 'Which shape is this?', s: d.s, answer: String(d.s), options: shuffle([d.s, ...shuffle([0, 1, 2, 3, 4, 5].filter((x) => x !== d.s), i + 2).slice(0, 2)], i + 6).map((v) => ({ key: String(v), label: kit.t(SHAPES[v].np, SHAPES[v].en) })) };
    if (d.kind === 'sides') return { np: 'यसका कतिवटा भुजा छन्?', en: 'How many sides does it have?', s: d.s, answer: String(S.sides), options: numChoices(S.sides, i * 3 + 1, [1, -1, 2, 3]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) };
    return { np: 'यसका कतिवटा कुना छन्?', en: 'How many corners does it have?', s: d.s, answer: String(S.corners), options: numChoices(S.corners, i * 5 + 4, [1, -1, 2, 3]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) };
  });

  const S = SHAPES[sel];
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', minWidth: 180 }}>
      <div style={{ fontSize: 20, fontWeight: 900, textAlign: 'center' }}>{kit.t(S.np, S.en)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}><span>{kit.t('भुजा', 'Sides')}</span><span style={{ color: sides === S.sides ? '#16a34a' : '#0369a1' }}>{fmt(kit.lang, sides)} / {fmt(kit.lang, S.sides)}</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}><span>{kit.t('कुना', 'Corners')}</span><span style={{ color: corners === S.corners ? '#16a34a' : '#0369a1' }}>{fmt(kit.lang, corners)} / {fmt(kit.lang, S.corners)}</span></div>
    </div>
  );
  const picker = SHAPES.map((s, i) => <CBtn key={s.id} color={i === sel ? '#0ea5e9' : '#94a3b8'} style={{ minHeight: 44, padding: '6px 12px', fontSize: 15 }} onClick={() => choose(i)}>{kit.t(s.np, s.en)}</CBtn>);
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('सिन्का (भुजा) र बल (कुना) छोएर गनौँ', 'Tap the sticks (sides) and balls (corners) to count')}</div>{picker}<CBtn color="#f59e0b" onClick={() => { setSides(0); setCorners(0); scene.current?.reset(); }}>↺</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{picker}<CBtn color="#f59e0b" onClick={() => { setSides(0); setCorners(0); scene.current?.reset(); }}>↺</CBtn></Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { setSel(q.s); setSides(0); setCorners(0); live.current.sel = q.s; scene.current?.show(q.s); }} />
  );
  void ease;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
