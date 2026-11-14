/**
 * Chapter 21 · Length (लम्बाइ)
 * Measure with Cubes — line up cubes beside an object to find how long it is, and compare long and short.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { cube, mat, shadowed, textSprite, pencil } from '../class1-math-kit/models';
import { toNp, enName, npName, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
interface Thing { id: string; np: string; en: string; len: number; color: string }
const THINGS: Thing[] = [
  { id: 'pencil', np: 'पेन्सिल', en: 'Pencil', len: 6, color: '#facc15' },
  { id: 'crayon', np: 'क्रेयोन', en: 'Crayon', len: 3, color: '#ef4444' },
  { id: 'ribbon', np: 'रिबन', en: 'Ribbon', len: 8, color: '#ec4899' },
  { id: 'stick', np: 'लौरो', en: 'Stick', len: 10, color: '#a16207' },
  { id: 'straw', np: 'स्ट्रो', en: 'Straw', len: 5, color: '#22c55e' },
  { id: 'key', np: 'साँचो', en: 'Key', len: 2, color: '#94a3b8' },
];

const makeThing = (t: Thing) => {
  if (t.id === 'pencil') { const p = pencil('#facc15', t.len - 0.9); p.position.x = (t.len - 0.9) / 2 + 0.05; const g = new THREE.Group(); g.add(p); return g; }
  const g = new THREE.Group();
  const body = shadowed(new THREE.Mesh(t.id === 'ribbon' ? new THREE.BoxGeometry(t.len, 0.06, 0.55) : new THREE.CylinderGeometry(t.id === 'key' ? 0.18 : 0.2, t.id === 'key' ? 0.18 : 0.2, t.len, 14), mat(t.color, 0.5)));
  if (t.id !== 'ribbon') body.rotation.z = Math.PI / 2;
  body.position.x = t.len / 2; body.position.y = t.id === 'ribbon' ? 0.05 : 0.22; g.add(body);
  return g;
};

export const MeasureWithCubes: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH21-01', chapter: 21, titleNp: 'घन राखेर नापौँ (लम्बाइ)', titleEn: 'Measure with Cubes (Length)' });
  const [a, setA] = useState(0);
  const [b, setB] = useState<number | null>(null);
  const [placed, setPlaced] = useState(0);
  const [placedB, setPlacedB] = useState(0);
  const scene = useRef<{ show: (a: number, b: number | null) => void; place: (lane: 'A' | 'B', n: number, animate?: boolean) => void; clear: () => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const desk = shadowed(new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 9), mat('#fde68a', 0.9))); desk.position.set(0, -0.1, 0); ctx.scene.add(desk);
    const lanes = { A: new THREE.Group(), B: new THREE.Group() };
    lanes.A.position.set(-5, 0.1, -1.8); lanes.B.position.set(-5, 0.1, 2.4);
    ctx.scene.add(lanes.A, lanes.B);
    const state: Record<'A' | 'B', { thing: THREE.Group | null; cubes: THREE.Mesh[]; label?: THREE.Sprite }> = { A: { thing: null, cubes: [] }, B: { thing: null, cubes: [] } };
    const setLane = (lane: 'A' | 'B', t: Thing | null) => {
      const g = lanes[lane]; [...g.children].forEach((c) => g.remove(c)); state[lane] = { thing: null, cubes: [] };
      if (!t) return;
      const th = makeThing(t); th.position.set(0, 0.2, 0); g.add(th); state[lane].thing = th;
      // unit marks on the floor so children can count "steps"
      const name = textSprite('', 2, { px: 60, w: 256, h: 128, bg: '#ffffff', border: t.color }); name.position.set(-1.6, 0.8, 0); g.add(name); state[lane].label = name;
    };
    const place = (lane: 'A' | 'B', n: number, animate = true) => {
      const g = lanes[lane]; const s = state[lane];
      while (s.cubes.length > n) { const c = s.cubes.pop()!; g.remove(c); }
      while (s.cubes.length < n) {
        const i = s.cubes.length;
        const c = cube(i % 2 ? '#38bdf8' : '#0ea5e9', 0.92) as THREE.Mesh;
        c.position.set(i + 0.5, 0.46, 0.75);
        if (animate) { c.scale.setScalar(0.01); ctx.tween(280, (k) => c.scale.setScalar(Math.max(0.01, k)), undefined, ease.back); }
        g.add(c); s.cubes.push(c);
      }
    };
    const show = (ai: number, bi: number | null) => { setLane('A', THINGS[ai]); setLane('B', bi === null ? null : THINGS[bi]); };
    const clear = () => { place('A', 0); place('B', 0); };
    scene.current = { show, place, clear };
    show(0, null);
    return () => { scene.current = null; };
  }, [], { camera: [0, 9, 11], target: [0, 0, 0.3], minDistance: 6, maxDistance: 20, ground: null, sky: 0xe0f2fe });

  const apply = (ai: number, bi: number | null) => { setA(ai); setB(bi); setPlaced(0); setPlacedB(0); scene.current?.show(ai, bi); };
  const A = THINGS[a];
  const place = (lane: 'A' | 'B', d: number) => {
    const th = lane === 'A' ? A : THINGS[b!];
    const cur = lane === 'A' ? placed : placedB;
    const nx = Math.max(0, Math.min(th.len, cur + d));
    if (nx === cur) { if (d > 0) kit.oops('पूरा भयो!', 'Already as long as the object!'); return; }
    scene.current?.place(lane, nx); lane === 'A' ? setPlaced(nx) : setPlacedB(nx);
    kit.tap();
    if (d > 0) kit.say(kit.lang === 'ne' ? npName(nx) : enName(nx), enName(nx), true);
    if (nx === th.len && d > 0) { kit.good(`${th.np} ${toNp(nx)} घन लामो छ`, `The ${th.en.toLowerCase()} is ${nx} cubes long`); kit.star(); }
  };
  const autoMeasure = () => {
    let i = 0;
    const step = () => { i += 1; scene.current?.place('A', i); setPlaced(i); kit.say(npName(i), enName(i)); if (i < A.len) window.setTimeout(step, 700); else { kit.good(`${A.np} ${toNp(A.len)} घन लामो छ`, `The ${A.en.toLowerCase()} is ${A.len} cubes long`); kit.star(); } };
    scene.current?.place('A', 0); setPlaced(0); step();
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') { apply(0, null); kit.say('पेन्सिलको छेउमा घन राखेर नापौँ।', 'Let us put cubes beside the pencil to measure it.'); }
    else if (kit.mode === 'PLAY') { apply(rnd(0, 5), null); kit.say('वस्तु रोजौँ र घन थपेर नापौँ।', 'Pick an object and add cubes to measure it.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const x = rnd(0, 5);
    if (i % 2 === 0) {
      const v = THINGS[x].len;
      const opts = shuffle(Array.from(new Set([v, v + 1, Math.max(1, v - 1)])));
      return { kind: 0, x, y: null as number | null, v, opts };
    }
    let y = rnd(0, 5); while (THINGS[y].len === THINGS[x].len) y = rnd(0, 5);
    return { kind: 1, x, y, v: THINGS[x].len > THINGS[y].len ? x : y, opts: shuffle([x, y]) };
  }), []);
  const questions: (QuizQuestion & { x: number; y: number | null })[] = data.map((d) => d.kind === 0
    ? { np: `${THINGS[d.x].np} कति घन लामो छ?`, en: `How many cubes long is the ${THINGS[d.x].en.toLowerCase()}?`, x: d.x, y: null, answer: String(d.v), options: d.opts.map((o) => ({ key: String(o), label: kit.lang === 'ne' ? toNp(o) : String(o) })) }
    : { np: 'कुन चाहिँ लामो छ?', en: 'Which one is longer?', x: d.x, y: d.y, answer: String(d.v), options: d.opts.map((o) => ({ key: String(o), label: kit.t(THINGS[o].np, THINGS[o].en) })) });

  const num = (v: number) => (kit.lang === 'ne' ? toNp(v) : String(v));
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 17, fontWeight: 800 }}>{kit.t(A.np, A.en)}</div>
      <div style={{ fontSize: 34, fontWeight: 900, color: placed === A.len ? '#16a34a' : '#0369a1' }}>{num(placed)} {kit.t('घन', 'cubes')}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 200 }}>{kit.t('घन एकपछि अर्को गरी जोडौँ, सुरु र अन्त्य मिलाएर।', 'Put cubes end to end, starting at the beginning of the object.')}</div>
      <CBtn color="#8b5cf6" onClick={autoMeasure}>▶ {kit.t('नापेर देखाऔँ', 'Show me')}</CBtn>
      <CBtn color="#0ea5e9" onClick={() => place('A', 1)}>+1 🧊</CBtn>
      <CBtn color="#94a3b8" onClick={() => place('A', -1)}>−1</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <div>
      <Controls>
        {THINGS.map((t, i) => <CBtn key={t.id} color={i === a ? '#0ea5e9' : '#94a3b8'} style={{ minHeight: 44, padding: '6px 12px', fontSize: 15 }} onClick={() => apply(i, b)}>{kit.t(t.np, t.en)}</CBtn>)}
      </Controls>
      <Controls>
        <CBtn color="#0ea5e9" onClick={() => place('A', 1)}>+1 🧊</CBtn>
        <CBtn color="#94a3b8" onClick={() => place('A', -1)}>−1</CBtn>
        <CBtn color={b === null ? '#8b5cf6' : '#f97316'} onClick={() => apply(a, b === null ? (a + 1) % 6 : null)}>{b === null ? `⚖ ${kit.t('दुई वस्तु तुलना', 'Compare two')}` : `✕ ${kit.t('एउटा मात्र', 'Just one')}`}</CBtn>
        {b !== null && <><CBtn color="#0ea5e9" onClick={() => place('B', 1)}>B +1</CBtn><CBtn color="#94a3b8" onClick={() => place('B', -1)}>B −1</CBtn><CBtn color="#16a34a" onClick={() => apply(a, (b + 1) % 6 === a ? (b + 2) % 6 : (b + 1) % 6)}>{kit.t('अर्को B', 'Next B')} ➜</CBtn></>}
      </Controls>
    </div>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { apply(q.x, q.y); if (q.y === null) window.setTimeout(() => scene.current?.place('A', THINGS[q.x].len, false), 60); }} />
  );

  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
