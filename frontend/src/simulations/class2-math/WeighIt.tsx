/**
 * Lesson 6 · Weight (तौल)
 * Weigh It — heavier goes down. Balance an object with 1 kg, 2 kg and 5 kg weights to find how heavy it is.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const ITEMS = [
  { np: 'किताब', en: 'Book', emoji: '📕', w: 1, color: '#ef4444' },
  { np: 'झोला', en: 'Bag', emoji: '🎒', w: 2, color: '#0ea5e9' },
  { np: 'तरबुजा', en: 'Watermelon', emoji: '🍉', w: 3, color: '#22c55e' },
  { np: 'बिरालो', en: 'Cat', emoji: '🐱', w: 4, color: '#f59e0b' },
  { np: 'चामलको बोरा', en: 'Rice sack', emoji: '🌾', w: 5, color: '#d6b88c' },
  { np: 'ढुङ्गा', en: 'Big stone', emoji: '🪨', w: 8, color: '#94a3b8' },
];

export const WeighIt: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L6-01', chapter: 6, titleNp: 'तौलौँ (तौल)', titleEn: 'Weigh It (Weight)' });
  const [item, setItem] = useState(2);
  const [item2, setItem2] = useState<number | null>(null);
  const [weights, setWeights] = useState<number[]>([]);
  const [li, setLi] = useState(0);
  const scene = useRef<{ set: (left: number, right: { kind: 'weights'; list: number[] } | { kind: 'item'; i: number } | null, animate?: boolean) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const base = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.7, 3.4, 12), mat('#92400e', 0.8))); base.position.y = 1.7; ctx.scene.add(base);
    const foot = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.3, 24), mat('#92400e', 0.8))); foot.position.y = 0.15; ctx.scene.add(foot);
    const beam = new THREE.Group(); beam.position.y = 3.5; ctx.scene.add(beam);
    beam.add(shadowed(new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.25, 0.5), mat('#f59e0b', 0.5))));
    const mkPan = (x: number) => { const g = new THREE.Group(); g.position.set(x, -0.4, 0); const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), mat('#78350f')); rope.position.y = 0.7; g.add(rope); const pan = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.18, 32), mat('#cbd5e1', 0.4, 0.5))); pan.position.y = -0.1; g.add(pan); const load = new THREE.Group(); g.add(load); beam.add(g); return { g, load }; };
    const L = mkPan(-4.4), R = mkPan(4.4);
    let tilt = 0;
    const clear = (grp: THREE.Group) => [...grp.children].forEach((c) => grp.remove(c));
    const objMesh = (i: number) => { const it = ITEMS[i]; const g = new THREE.Group(); const b = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), mat(it.color, 0.5))); b.position.y = 0.85; g.add(b); const s = textSprite(it.emoji, 1.6, { px: 120, w: 160, h: 160 }); s.position.set(0, 0.9, 0.9); g.add(s); return g; };
    const set = (left: number, right: any, animate = true) => {
      clear(L.load); clear(R.load);
      L.load.add(objMesh(left));
      let rw = 0;
      if (right?.kind === 'item') { R.load.add(objMesh(right.i)); rw = ITEMS[right.i].w; }
      else if (right?.kind === 'weights') {
        let x = -1.1, y = 0; right.list.forEach((w: number) => {
          const h = 0.5 + w * 0.12; const wt = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.35 + w * 0.05, 0.45 + w * 0.06, h, 16), mat(w === 5 ? '#334155' : w === 2 ? '#475569' : '#64748b', 0.4, 0.6)));
          wt.position.set(x, 0.09 + h / 2 + y, 0); R.load.add(wt);
          const t = textSprite(`${w}`, 0.7, { px: 90, w: 128, h: 128, color: '#fff' }); t.position.set(x, 0.09 + h / 2 + y, 0.6); R.load.add(t);
          x += 0.95; if (x > 1.2) { x = -1.1; y += 1.2; }
        }); rw = right.list.reduce((a: number, b: number) => a + b, 0);
      }
      const lw = ITEMS[left].w; const to = lw === rw ? 0 : lw > rw ? 0.22 : -0.22; const from = tilt; tilt = to;
      const apply2 = (k: number) => { const v = from + (to - from) * k; beam.rotation.z = v; L.g.rotation.z = -v; R.g.rotation.z = -v; };
      if (animate) ctx.tween(900, apply2, undefined, ease.back); else apply2(1);
    };
    scene.current = { set };
    set(2, { kind: 'weights', list: [] }, false);
    return () => { scene.current = null; };
  }, [], { camera: [0, 6, 13], target: [0, 3, 0], minDistance: 8, maxDistance: 22 });

  const sum = weights.reduce((a, b) => a + b, 0);
  const show = (i: number, w: number[] | null, j: number | null = null) => { setItem(i); setItem2(j); setWeights(w || []); scene.current?.set(i, j !== null ? { kind: 'item', i: j } : { kind: 'weights', list: w || [] }); };
  const addW = (w: number) => { if (item2 !== null) return; const nw = [...weights, w]; if (nw.length > 12) return; setWeights(nw); scene.current?.set(item, { kind: 'weights', list: nw }); kit.tap(); const s = nw.reduce((a, b) => a + b, 0); if (s === ITEMS[item].w) { kit.good(`${ITEMS[item].np} ${fmt('ne', s)} किलो हो`, `The ${ITEMS[item].en.toLowerCase()} weighs ${s} kg`); kit.star(); } };
  const delW = () => { if (!weights.length) return; const nw = weights.slice(0, -1); setWeights(nw); scene.current?.set(item, { kind: 'weights', list: nw }); };

  useEffect(() => {
    if (kit.mode === 'LEARN') { const pairs: [number, number][] = [[0, 4], [3, 1], [5, 2], [2, 0]]; const [a, b] = pairs[li % pairs.length]; show(a, null, b); const hv = ITEMS[a].w > ITEMS[b].w ? a : b; kit.say(`${ITEMS[hv].np} बढी भारी छ, त्यसैले तल झर्यो।`, `The ${ITEMS[hv].en.toLowerCase()} is heavier, so it goes down.`); }
    else if (kit.mode === 'PLAY') { show(item2 === null ? item : 2, []); kit.say('किलोका तौल थपेर बराबर बनाऔँ।', 'Add kilogram weights until it balances.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    if (i % 2 === 0) { const a = rnd(0, 5); let b = rnd(0, 5); while (ITEMS[b].w === ITEMS[a].w) b = rnd(0, 5); return { kind: 'heavy', a, b }; }
    return { kind: 'kg', a: rnd(0, 5) };
  }), []);
  const questions: (QuizQuestion & { d: any })[] = data.map((d: any, i) => d.kind === 'heavy'
    ? { np: 'कुन भारी छ? (तल झर्ने)', en: 'Which one is heavier? (the lower side)', d, answer: String(ITEMS[d.a].w > ITEMS[d.b].w ? d.a : d.b), options: [d.a, d.b].map((v) => ({ key: String(v), label: <span>{ITEMS[v].emoji} {kit.t(ITEMS[v].np, ITEMS[v].en)}</span> })) }
    : { np: `${ITEMS[d.a].np}को तौल कति किलो छ? (तौल गनौँ)`, en: `How many kg does the ${ITEMS[d.a].en.toLowerCase()} weigh? (count the weights)`, d, answer: String(ITEMS[d.a].w), options: numChoices(ITEMS[d.a].w, i * 5 + 2, [1, -1, 2]).map((v) => ({ key: String(v), label: `${fmt(kit.lang, v)} kg` })) });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      {item2 === null ? <><div style={{ fontSize: 16, fontWeight: 800 }}>{ITEMS[item].emoji} {kit.t(ITEMS[item].np, ITEMS[item].en)}</div><div style={{ fontSize: 32, fontWeight: 900, color: sum === ITEMS[item].w ? '#16a34a' : '#0369a1' }}>{fmt(kit.lang, sum)} kg</div></> : <div style={{ fontSize: 22, fontWeight: 900 }}>{ITEMS[item].emoji} vs {ITEMS[item2].emoji}</div>}
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('भारी वस्तु तल झर्छ, हलुका माथि जान्छ।', 'The heavier thing goes down; the lighter goes up.')}</div>
      <CBtn color="#16a34a" onClick={() => { kit.star(); setLi(li + 1); }}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <div>
      <Controls>{ITEMS.map((it, i) => <CBtn key={i} color={i === item && item2 === null ? '#0ea5e9' : '#94a3b8'} style={{ minHeight: 44, padding: '6px 10px', fontSize: 15 }} onClick={() => show(i, [])}>{it.emoji}</CBtn>)}</Controls>
      <div style={{ marginTop: 6 }}><Controls><b>{kit.t('तौल थपौँ', 'Add weight')}:</b><CBtn color="#64748b" onClick={() => addW(1)}>+1 kg</CBtn><CBtn color="#475569" onClick={() => addW(2)}>+2 kg</CBtn><CBtn color="#334155" onClick={() => addW(5)}>+5 kg</CBtn><CBtn color="#f59e0b" onClick={delW}>↶</CBtn><CBtn color="#8b5cf6" onClick={() => show(rnd(0, 5), [])}>🎲</CBtn></Controls></div>
    </div>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { const d = q.d; if (d.kind === 'heavy') show(d.a, null, d.b); else { const list: number[] = []; let r = ITEMS[d.a].w; while (r >= 5 && Math.random() < 0.5) { list.push(5); r -= 5; } while (r > 0) { list.push(1); r -= 1; } show(d.a, list); } }} />
  );
  void shuffle;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
