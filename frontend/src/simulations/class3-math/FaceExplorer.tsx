/**
 * Lesson 11 · Geometrical shapes (ज्यामितीय आकार)
 * Face Explorer — open up a cube, cuboid, cylinder, cone or pyramid and see the flat shapes (faces) it is made of.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { shuffle } from '../class1-math-kit/nepali';
import { fmt } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
interface Face { geo: THREE.BufferGeometry; pos: THREE.Vector3; rot: THREE.Euler; n: THREE.Vector3; color: string }
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const plane = (w: number, h: number, pos: THREE.Vector3, rot: THREE.Euler, n: THREE.Vector3, color: string): Face => ({ geo: new THREE.PlaneGeometry(w, h), pos, rot, n, color });
const SOLIDS = [
  { id: 'cube', np: 'घन', en: 'Cube', info: ['६ वटा वर्गाकार सतह', '6 faces — all squares'], flat: 6, shape: 'square', build: (): Face[] => { const r = (x: number, y: number, z: number) => new THREE.Euler(x, y, z); return [plane(2, 2, V(0, 0, 1), r(0, 0, 0), V(0, 0, 1), '#ef4444'), plane(2, 2, V(0, 0, -1), r(0, Math.PI, 0), V(0, 0, -1), '#ef4444'), plane(2, 2, V(1, 0, 0), r(0, Math.PI / 2, 0), V(1, 0, 0), '#f97316'), plane(2, 2, V(-1, 0, 0), r(0, -Math.PI / 2, 0), V(-1, 0, 0), '#f97316'), plane(2, 2, V(0, 1, 0), r(-Math.PI / 2, 0, 0), V(0, 1, 0), '#eab308'), plane(2, 2, V(0, -1, 0), r(Math.PI / 2, 0, 0), V(0, -1, 0), '#eab308')]; } },
  { id: 'cuboid', np: 'घनाभ', en: 'Cuboid', info: ['६ वटा आयताकार सतह', '6 faces — rectangles'], flat: 6, shape: 'rectangle', build: (): Face[] => { const r = (x: number, y: number, z: number) => new THREE.Euler(x, y, z); return [plane(3, 1.6, V(0, 0, 0.9), r(0, 0, 0), V(0, 0, 1), '#0ea5e9'), plane(3, 1.6, V(0, 0, -0.9), r(0, Math.PI, 0), V(0, 0, -1), '#0ea5e9'), plane(1.8, 1.6, V(1.5, 0, 0), r(0, Math.PI / 2, 0), V(1, 0, 0), '#22c55e'), plane(1.8, 1.6, V(-1.5, 0, 0), r(0, -Math.PI / 2, 0), V(-1, 0, 0), '#22c55e'), plane(3, 1.8, V(0, 0.8, 0), r(-Math.PI / 2, 0, 0), V(0, 1, 0), '#a855f7'), plane(3, 1.8, V(0, -0.8, 0), r(Math.PI / 2, 0, 0), V(0, -1, 0), '#a855f7')]; } },
  { id: 'cylinder', np: 'बेलना', en: 'Cylinder', info: ['२ वटा गोलो सतह र १ वटा बाङ्गो सतह', '2 flat circles and 1 curved face'], flat: 2, shape: 'circle', build: (): Face[] => [
    { geo: new THREE.CircleGeometry(1.1, 40), pos: V(0, 1.2, 0), rot: new THREE.Euler(-Math.PI / 2, 0, 0), n: V(0, 1, 0), color: '#ef4444' },
    { geo: new THREE.CircleGeometry(1.1, 40), pos: V(0, -1.2, 0), rot: new THREE.Euler(Math.PI / 2, 0, 0), n: V(0, -1, 0), color: '#ef4444' },
    { geo: new THREE.CylinderGeometry(1.1, 1.1, 2.4, 40, 1, true), pos: V(0, 0, 0), rot: new THREE.Euler(), n: V(1, 0, 0), color: '#0ea5e9' }] },
  { id: 'cone', np: 'शङ्कु', en: 'Cone', info: ['१ वटा गोलो सतह र १ वटा बाङ्गो सतह', '1 flat circle and 1 curved face'], flat: 1, shape: 'circle', build: (): Face[] => [
    { geo: new THREE.CircleGeometry(1.2, 40), pos: V(0, -1.3, 0), rot: new THREE.Euler(Math.PI / 2, 0, 0), n: V(0, -1, 0), color: '#ef4444' },
    { geo: new THREE.ConeGeometry(1.2, 2.6, 40, 1, true), pos: V(0, 0, 0), rot: new THREE.Euler(), n: V(0, 1, 0), color: '#8b5cf6' }] },
  { id: 'pyramid', np: 'पिरामिड', en: 'Pyramid', info: ['१ वर्ग र ४ त्रिभुजाकार सतह', '1 square and 4 triangle faces'], flat: 5, shape: 'triangle', build: (): Face[] => {
    const apex = V(0, 1.3, 0); const c = [V(-1.2, -1.3, -1.2), V(1.2, -1.3, -1.2), V(1.2, -1.3, 1.2), V(-1.2, -1.3, 1.2)]; const out: Face[] = [plane(2.4, 2.4, V(0, -1.3, 0), new THREE.Euler(Math.PI / 2, 0, 0), V(0, -1, 0), '#eab308')];
    for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; const cen = a.clone().add(b).add(apex).divideScalar(3); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([a.x - cen.x, a.y - cen.y, a.z - cen.z, b.x - cen.x, b.y - cen.y, b.z - cen.z, apex.x - cen.x, apex.y - cen.y, apex.z - cen.z], 3)); g.computeVertexNormals(); out.push({ geo: g, pos: cen, rot: new THREE.Euler(), n: V(cen.x, 0.2, cen.z).normalize(), color: ['#f97316', '#22c55e', '#0ea5e9', '#ec4899'][i] }); }
    return out; } },
];

export const FaceExplorer: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L11-01', chapter: 11, titleNp: 'सतह अन्वेषक (ज्यामितीय आकार)', titleEn: 'Face Explorer (Geometrical Shapes)' });
  const [sel, setSel] = useState(0);
  const [open, setOpen] = useState(false);
  const scene = useRef<{ show: (i: number) => void; explode: (on: boolean) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g); let faces: { m: THREE.Mesh; f: Face }[] = []; let amt = 0, goal = 0;
    const show = (i: number) => { g.clear(); faces = SOLIDS[i].build().map((f) => { const m = new THREE.Mesh(f.geo, new THREE.MeshStandardMaterial({ color: f.color, roughness: 0.45, side: THREE.DoubleSide })); m.castShadow = true; m.rotation.copy(f.rot); m.position.copy(f.pos); g.add(m); return { m, f }; }); g.position.y = 2.8; g.scale.setScalar(1.5); g.rotation.x = 0.5; amt = goal = 0; };
    ctx.onFrame((dt) => { amt += (goal - amt) * Math.min(1, dt * 5); faces.forEach(({ m, f }) => m.position.copy(f.pos).addScaledVector(f.n, amt * 2.2)); g.rotation.y += dt * 0.35; });
    scene.current = { show, explode: (on) => { goal = on ? 1 : 0; } }; show(0);
    return () => { scene.current = null; };
  }, [], { camera: [0, 5.5, 10], target: [0, 2.8, 0], minDistance: 6, maxDistance: 22, ground: 0xe0e7ff });

  const choose = (i: number) => { setSel(i); setOpen(false); scene.current?.show(i); kit.say(`${SOLIDS[i].np} — ${SOLIDS[i].info[0]}`, `${SOLIDS[i].en}: ${SOLIDS[i].info[1]}`); };
  const toggle = () => { const o = !open; setOpen(o); scene.current?.explode(o); kit.tap(); };
  useEffect(() => { if (kit.mode === 'LEARN') choose(0); else if (kit.mode === 'PLAY') { setOpen(false); scene.current?.explode(false); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ s: i % 5, kind: i % 3 })), []);
  const NAMES = { square: ['वर्ग', 'square'], rectangle: ['आयत', 'rectangle'], circle: ['वृत्त (गोलो)', 'circle'], triangle: ['त्रिभुज', 'triangle'] } as const;
  const questions: (QuizQuestion & { s: number })[] = data.map((d, i) => {
    const S = SOLIDS[d.s];
    if (d.kind === 0) { const opts = Array.from(new Set([S.flat, S.flat + 2, Math.max(1, S.flat - 1)])); return { s: d.s, np: `${S.np}मा कतिवटा समतल सतह हुन्छन्?`, en: `How many flat faces does a ${S.en.toLowerCase()} have?`, answer: String(S.flat), options: shuffle(opts, i).map((x) => ({ key: String(x), label: fmt(kit.lang, x) })) }; }
    if (d.kind === 1) { const k = S.shape as keyof typeof NAMES; return { s: d.s, np: `${S.np}को सतह कुन आकारको हुन्छ?`, en: `Which shape appears as a face of a ${S.en.toLowerCase()}?`, answer: k, options: shuffle(Object.keys(NAMES), i + 3).slice(0, 4).concat(Object.keys(NAMES).includes(k) ? [] : [k]).filter((x, j, a) => a.indexOf(x) === j).slice(0, 3).map((x) => ({ key: x, label: kit.t(NAMES[x as keyof typeof NAMES][0], NAMES[x as keyof typeof NAMES][1]) })) }; }
    return { s: d.s, np: 'यो कुन आकार हो? (खोलेर हेर)', en: 'Which solid is this?', answer: String(d.s), options: shuffle([d.s, (d.s + 1) % 5, (d.s + 3) % 5], i + 7).map((x) => ({ key: String(x), label: kit.t(SOLIDS[x].np, SOLIDS[x].en) })) };
  });
  questions.forEach((q) => { if (!q.options.some((o) => o.key === q.answer)) { const a = q.answer as keyof typeof NAMES; q.options[0] = { key: q.answer, label: kit.t(NAMES[a][0], NAMES[a][1]) }; } });

  const S = SOLIDS[sel];
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #6366f1', textAlign: 'center', maxWidth: 320 }}>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{kit.t(S.np, S.en)}</div><div style={{ fontSize: 14, fontWeight: 700 }}>{kit.t(S.info[0], S.info[1])}</div>
    </div>
  );
  const picker = SOLIDS.map((s, i) => <CBtn key={s.id} color={i === sel ? '#6366f1' : '#94a3b8'} style={{ minHeight: 44, padding: '6px 12px', fontSize: 15 }} onClick={() => choose(i)}>{kit.t(s.np, s.en)}</CBtn>);
  const panel = kit.mode === 'CHALLENGE' ? <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { setSel(q.s); scene.current?.show(q.s); scene.current?.explode(true); }} /> : (
    <Controls>{picker}<CBtn color="#16a34a" onClick={toggle}>{open ? '🔒' : '🔓'} {open ? kit.t('बन्द गर', 'Close up') : kit.t('खोलेर हेर', 'Open up')}</CBtn></Controls>
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
