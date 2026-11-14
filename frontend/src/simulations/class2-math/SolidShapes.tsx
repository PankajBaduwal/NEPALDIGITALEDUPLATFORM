/**
 * Lesson 13 · Geometric shapes (ज्यामितीय आकार) — solid shapes
 * Solid Shapes Workshop — spin cubes, cuboids, spheres, cylinders, cones and pyramids; count faces, edges and corners; roll or slide?
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const SOLIDS = [
  { id: 'cube', np: 'घन', en: 'Cube', faces: 6, edges: 12, corners: 8, rolls: false, color: '#ef4444', geo: () => new RoundedBoxGeometry(2.2, 2.2, 2.2, 3, 0.08) },
  { id: 'cuboid', np: 'घनाभ', en: 'Cuboid', faces: 6, edges: 12, corners: 8, rolls: false, color: '#f97316', geo: () => new RoundedBoxGeometry(3.2, 1.8, 2, 3, 0.08) },
  { id: 'sphere', np: 'गोला', en: 'Sphere', faces: 1, edges: 0, corners: 0, rolls: true, color: '#22c55e', geo: () => new THREE.SphereGeometry(1.25, 36, 28) },
  { id: 'cylinder', np: 'बेलना', en: 'Cylinder', faces: 3, edges: 2, corners: 0, rolls: true, color: '#0ea5e9', geo: () => new THREE.CylinderGeometry(1, 1, 2.6, 36) },
  { id: 'cone', np: 'शङ्कु', en: 'Cone', faces: 2, edges: 1, corners: 1, rolls: true, color: '#8b5cf6', geo: () => new THREE.ConeGeometry(1.25, 2.6, 36) },
  { id: 'pyramid', np: 'पिरामिड', en: 'Pyramid', faces: 5, edges: 8, corners: 5, rolls: false, color: '#eab308', geo: () => new THREE.ConeGeometry(1.6, 2.4, 4) },
];

export const SolidShapes: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L13-01', chapter: 13, titleNp: 'ठोस आकार कार्यशाला', titleEn: 'Solid Shapes Workshop' });
  const [sel, setSel] = useState(0);
  const [rolled, setRolled] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const scene = useRef<{ show: (i: number) => void; test: (i: number, done: () => void) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const ramp = shadowed(new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 3.6), mat('#d6a870', 0.8))); ramp.position.set(2.8, 1.35, 3.8); ramp.rotation.z = -0.28; ctx.scene.add(ramp);
    const holder = new THREE.Group(); ctx.scene.add(holder);
    let obj: THREE.Mesh | null = null;
    const show = (i: number) => {
      if (obj) holder.remove(obj);
      const s = SOLIDS[i]; obj = shadowed(new THREE.Mesh(s.geo(), mat(s.color, 0.35)));
      obj.position.set(-2.4, 1.6, 0); obj.rotation.set(0.3, 0.5, 0); holder.add(obj);
    };
    const test = (i: number, done: () => void) => {
      show(i); const o = obj!; const s = SOLIDS[i];
      o.position.set(-0.4, 3.35, 3.8); o.rotation.set(0, 0, 0);
      const x0 = o.position.x, y0 = o.position.y;
      ctx.tween(s.rolls ? 1800 : 1500, (k) => {
        const dist = s.rolls ? k * k * 7.8 : Math.min(1, k * 1.0) * 2.2 * (k < 0.35 ? 0 : (k - 0.35) / 0.65);
        o.position.x = x0 + dist * Math.cos(0.28); o.position.y = y0 - dist * Math.sin(0.28);
        if (s.rolls) { if (s.id === 'cylinder') { o.rotation.z = Math.PI / 2; o.rotation.x = dist * 0.8; } else o.rotation.z = -dist * 0.8; }
      }, done, (k) => k);
    };
    scene.current = { show, test };
    ctx.onFrame((dt) => { if (obj && obj.position.z === 0) obj.rotation.y += dt * 0.7; });
    show(0);
    return () => { scene.current = null; };
  }, [], { camera: [0, 6, 13.5], target: [0.2, 1.8, 1.5], minDistance: 8, maxDistance: 22, ground: 0xfef3c7 });

  const choose = (i: number) => { setSel(i); setRolled(''); scene.current?.show(i); const s = SOLIDS[i]; kit.say(`${s.np} — ${s.faces} फेस, ${s.edges} किनारा, ${s.corners} कुना`, `${s.en}: ${s.faces} faces, ${s.edges} edges, ${s.corners} corners`); };
  const roll = () => { if (busy) return; setBusy(true); setRolled(''); const s = SOLIDS[sel]; kit.say('चिप्लिन्छ कि गुड्छ? हेरौँ!', 'Will it slide or roll? Watch!'); scene.current?.test(sel, () => { setBusy(false); setRolled(s.rolls ? 'roll' : 'slide'); kit.say(s.rolls ? `${s.np} गुड्छ!` : `${s.np} चिप्लन्छ, गुड्दैन।`, s.rolls ? `The ${s.en.toLowerCase()} rolls!` : `The ${s.en.toLowerCase()} slides; it does not roll.`); }); };
  useEffect(() => {
    if (kit.mode === 'LEARN') choose(0); else if (kit.mode === 'PLAY') { choose(2); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const s = rnd(0, 5);
    const kind = ['name', 'faces', 'roll', 'corners'][i % 4];
    return { s, kind };
  }), []);
  const questions: (QuizQuestion & { s: number })[] = data.map((d, i) => {
    const S = SOLIDS[d.s];
    if (d.kind === 'name') return { np: 'यो कुन आकार हो?', en: 'Which shape is this?', s: d.s, answer: String(d.s), options: shuffle([d.s, ...shuffle([0, 1, 2, 3, 4, 5].filter((x) => x !== d.s), i + 4).slice(0, 2)], i + 8).map((v) => ({ key: String(v), label: kit.t(SOLIDS[v].np, SOLIDS[v].en) })) };
    if (d.kind === 'faces') return { np: `${S.np}को कतिवटा फेस (सतह) हुन्छन्?`, en: `How many faces does a ${S.en.toLowerCase()} have?`, s: d.s, answer: String(S.faces), options: numChoices(S.faces, i * 3 + 1, [1, -1, 2, 3]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) };
    if (d.kind === 'roll') return { np: `${S.np} गुड्छ कि चिप्लन्छ?`, en: `Does the ${S.en.toLowerCase()} roll or slide?`, s: d.s, answer: S.rolls ? 'roll' : 'slide', options: [{ key: 'roll', label: kit.t('गुड्छ 🛞', 'Rolls 🛞') }, { key: 'slide', label: kit.t('चिप्लन्छ 🛷', 'Slides 🛷') }] };
    return { np: `${S.np}को कतिवटा कुना हुन्छन्?`, en: `How many corners does a ${S.en.toLowerCase()} have?`, s: d.s, answer: String(S.corners), options: numChoices(S.corners, i * 5 + 2, [1, -1, 2, 4, 3]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) };
  });

  const S = SOLIDS[sel];
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', minWidth: 190 }}>
      <div style={{ fontSize: 20, fontWeight: 900, textAlign: 'center' }}>{kit.t(S.np, S.en)}</div>
      {[['faces', kit.t('फेस', 'Faces'), S.faces], ['edges', kit.t('किनारा', 'Edges'), S.edges], ['corners', kit.t('कुना', 'Corners'), S.corners]].map(([k, l, v]) => <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}><span>{l}</span><span style={{ color: '#0369a1' }}>{fmt(kit.lang, v as number)}</span></div>)}
      {rolled && <div style={{ marginTop: 4, fontWeight: 900, textAlign: 'center', color: rolled === 'roll' ? '#16a34a' : '#ea580c' }}>{rolled === 'roll' ? kit.t('गुड्छ 🛞', 'Rolls 🛞') : kit.t('चिप्लन्छ 🛷', 'Slides 🛷')}</div>}
    </div>
  );
  const picker = SOLIDS.map((s, i) => <CBtn key={s.id} color={i === sel ? '#0ea5e9' : '#94a3b8'} style={{ minHeight: 44, padding: '6px 12px', fontSize: 15 }} disabled={busy} onClick={() => choose(i)}>{kit.t(s.np, s.en)}</CBtn>);
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('आकार छोएर घुमाउँदै हेरौँ', 'Spin each shape and look closely')}</div>{picker}</Controls>
  ) : kit.mode === 'PLAY' ? (
    <div><Controls>{picker}</Controls><div style={{ marginTop: 6 }}><Controls><CBtn color="#16a34a" disabled={busy} onClick={roll}>🛝 {kit.t('गुड्छ कि चिप्लन्छ?', 'Roll or slide?')}</CBtn></Controls></div></div>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { setSel(q.s); setRolled(''); scene.current?.show(q.s); }} />
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
