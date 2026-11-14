/**
 * Class 4 lesson 15 · Algebra (बीजगणित)
 * Balance Scale — an unknown x on a balance: take the same from both sides, or guess x until it balances.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, Hud, Tip, Props, numQ } from './h4';

interface Side { cubes: [number, string][]; bags: number }
interface Spec { left: Side; right: Side; tilt: number }
type Api = { set: (s: Spec) => void };
const BLUE = '#38bdf8', ORANGE = '#f97316', GREEN = '#22c55e';

/** Equation forms: 0 → x + a = b ; 1 → a x = b */
interface Eq { kind: 0 | 1; a: number; x: number; b: number }
const makeEq = (kind: 0 | 1): Eq => { if (kind === 0) { const a = rnd(2, 9), x = rnd(2, 10); return { kind, a, x, b: a + x }; } const a = rnd(2, 4), x = rnd(2, 6); return { kind, a, x, b: a * x }; };
const text = (e: Eq) => (e.kind === 0 ? `x + ${e.a} = ${e.b}` : `${e.a}x = ${e.b}`);

export const BalanceAlgebra: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L15-01', chapter: 15, titleNp: 'तराजु बीजगणित', titleEn: 'Balance Algebra' });
  const [eq, setEq] = useState<Eq>(() => makeEq(0));
  const [g, setG] = useState(1);
  const [step, setStep] = useState(0);
  const scene = useRef<Api | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const grp = new THREE.Group(); ctx.scene.add(grp);
    const stand = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 5, 16), mat('#475569', 0.5))); stand.position.y = 2.5; grp.add(stand);
    const base = shadowed(new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 2), mat('#334155', 0.5))); base.position.y = 0.15; grp.add(base);
    const dyn = new THREE.Group(); grp.add(dyn);
    const set = (s: Spec) => {
      dyn.clear(); const th = s.tilt; const beam = shadowed(new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 0.5), mat('#a16207', 0.5))); beam.position.y = 5.2; beam.rotation.z = th; dyn.add(beam);
      const side = (sd: Side, sign: number) => {
        const ex = sign * 6 * Math.cos(th), ey = 5.2 - sign * 6 * Math.sin(th); const pan = new THREE.Group(); pan.position.set(ex, ey - 2.3, 0); dyn.add(pan);
        const disc = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2, 0.2, 28), mat('#94a3b8', 0.4))); pan.add(disc);
        [-1, 1].forEach((k) => { const st = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.3, 0.05), mat('#334155')); st.position.set(k * 1.7, 1.15, 0); st.rotation.z = -k * 0.4; pan.add(st); });
        let i = 0;
        sd.bags && Array.from({ length: sd.bags }).forEach((_, b) => { const bag = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 16), mat('#a855f7', 0.6))); bag.position.set(-1 + b * 1.5 - (sd.bags - 1) * 0.4, 0.95, -0.6); pan.add(bag); const t = textSprite('x', 1.1, { px: 70, w: 96, h: 96, bg: null, color: '#fff' }); t.position.set(bag.position.x, 0.95, 0.2); pan.add(t); });
        sd.cubes.forEach(([n, col]) => { for (let k = 0; k < n; k++, i++) { const c = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat(col, 0.5))); c.position.set(-1.3 + (i % 5) * 0.65, 0.35 + Math.floor(i / 5) * 0.55, 0.55); pan.add(c); } });
      };
      side(s.left, -1); side(s.right, 1);
    };
    scene.current = { set };
    return () => { scene.current = null; };
  }, [], { camera: [0, 6, 16], target: [0, 3.2, 0], minDistance: 9, maxDistance: 26, ground: 0xe0f2fe });

  const tilt = (l: number, r: number) => Math.max(-0.3, Math.min(0.3, (l - r) * 0.04));
  const draw = (e: Eq, guess: number | null, rm = false) => {
    const bags = e.kind === 0 ? 1 : e.a; const xs = guess ?? 0;
    const left: Side = e.kind === 0 ? { cubes: [[rm ? 0 : e.a, ORANGE], [guess ?? 0, BLUE]], bags: guess === null ? bags : 0 } : { cubes: [[(guess ?? 0) * e.a, BLUE]], bags: guess === null ? bags : 0 };
    const right: Side = { cubes: [[rm && e.kind === 0 ? e.b - e.a : e.b, GREEN]], bags: 0 };
    const L = (e.kind === 0 ? (rm ? 0 : e.a) + xs : xs * e.a), R = rm && e.kind === 0 ? e.b - e.a : e.b;
    scene.current?.set({ left, right, tilt: guess === null ? 0 : tilt(L, R) });
  };
  const fresh = (kind?: 0 | 1) => { const e = makeEq(kind ?? (rnd(0, 2) === 2 ? 1 : 0)); setEq(e); setStep(0); setG(1); return e; };
  const learnStart = () => { const e = fresh(0); draw(e, null); kit.say(`${text(e)}: x कति होला?`, `${text(e)}: what is x?`); };
  const playStart = () => { const e = fresh(); setG(1); draw(e, 1); kit.say(`${text(e)} — x को मान अनुमान गरौँ`, `${text(e)} — guess x until it balances`); };
  useEffect(() => { if (kit.mode === 'LEARN') learnStart(); else if (kit.mode === 'PLAY') playStart(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const learnNext = () => {
    if (eq.kind === 0) {
      if (step === 0) { setStep(1); draw(eq, null, true); kit.say(`दुवैतिरबाट ${fmt('ne', eq.a)} हटाऔँ`, `Take ${eq.a} away from both sides`); }
      else if (step === 1) { setStep(2); draw(eq, eq.x); kit.say(`x = ${fmt('ne', eq.b)} − ${fmt('ne', eq.a)} = ${fmt('ne', eq.x)}`, `x = ${eq.b} − ${eq.a} = ${eq.x}`); kit.star(); }
      else learnStart();
    } else learnStart();
  };
  const bump = (d: number) => { const v = Math.max(0, Math.min(12, g + d)); setG(v); draw(eq, v); };
  const check = () => { if (g === eq.x) { kit.good(`x = ${fmt('ne', g)}`, `x = ${g}`); kit.star(); window.setTimeout(playStart, 1300); } else kit.oops(g < eq.x ? 'x अझै ठूलो छ' : 'x अलि सानो छ', g < eq.x ? 'x is bigger' : 'x is smaller'); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ k: i % 4, e0: makeEq(0), e1: makeEq(1), c: rnd(2, 6), x: rnd(2, 9), i })), []);
  const questions: (QuizQuestion & { e: Eq | null })[] = data.map((d, i) => {
    if (d.k === 0 || d.k === 3) return { e: d.e0, ...numQ(`${text(d.e0)} भए x = ?`, `If ${text(d.e0)}, what is x?`, d.e0.x, i, [1, -1, 2, d.e0.a], (x) => fmt(kit.lang, x), 1) };
    if (d.k === 1) return { e: d.e1, ...numQ(`${text(d.e1)} भए x = ?`, `If ${text(d.e1)}, what is x?`, d.e1.x, i + 2, [1, -1, 2, d.e1.a], (x) => fmt(kit.lang, x), 1) };
    return { e: null, ...numQ(`x = ${fmt('ne', d.x)} हुँदा ${fmt('ne', d.c)}x + ${fmt('ne', d.c)} को मान कति?`, `When x = ${d.x}, what is the value of ${d.c}x + ${d.c}?`, d.c * d.x + d.c, i + 3, [d.c, -d.c, 1, d.x], (x) => fmt(kit.lang, x), 1) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color="#a855f7">
      <div style={{ fontSize: 26, fontWeight: 900 }}>{kit.mode === 'LEARN' && step === 1 ? `x = ${eq.b} − ${eq.a}` : kit.mode === 'LEARN' && step === 2 ? `x = ${eq.x}` : text(eq)}</div>
      {kit.mode === 'PLAY' && <div style={{ fontSize: 15, fontWeight: 800, color: '#475569' }}>{kit.t('अनुमान', 'Guess')}: x = {fmt(kit.lang, g)}</div>}
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{eq.kind === 0 ? kit.t('दुवैतिरबाट बराबर हटाउँदा तराजु सन्तुलित नै रहन्छ', 'Take the same away from both sides and it stays balanced') : kit.t('दुवैतिर बराबर भाग लगाऔँ', 'Share both sides equally')}</Tip><CBtn color="#16a34a" onClick={learnNext}>{step >= 2 ? kit.t('नयाँ', 'New') : kit.t('अर्को', 'Next')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><CBtn color="#ef4444" onClick={() => bump(-1)}>x −1</CBtn><CBtn color="#0ea5e9" onClick={() => bump(1)}>x +1</CBtn><CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn><CBtn color="#8b5cf6" onClick={playStart}>🎲</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { if (q.e) draw(q.e, null); else scene.current?.set({ left: { cubes: [], bags: 0 }, right: { cubes: [], bags: 0 }, tilt: 0 }); }} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
