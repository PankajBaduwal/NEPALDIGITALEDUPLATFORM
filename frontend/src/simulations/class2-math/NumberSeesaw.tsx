/**
 * Lesson 4 · Comparison of numbers (सङ्ख्याको तुलना)
 * Number Seesaw — the bigger number pulls its side down. Choose >, < or =.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite, retext, cube } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const PAIRS = [[345, 298], [512, 521], [407, 407], [680, 86], [199, 201], [750, 705]];
const SYM = (a: number, b: number) => (a > b ? '>' : a < b ? '<' : '=');

export const NumberSeesaw: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L4-01', chapter: 4, titleNp: 'सङ्ख्याको झुला (तुलना)', titleEn: 'Number Seesaw (Comparing Numbers)' });
  const [a, setA] = useState(345);
  const [b, setB] = useState(298);
  const [li, setLi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const scene = useRef<{ set: (a: number, b: number, animate?: boolean) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const base = shadowed(new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.2, 4), mat('#92400e', 0.8))); base.position.y = 1.1; base.rotation.y = Math.PI / 4; ctx.scene.add(base);
    const beam = new THREE.Group(); beam.position.y = 2.3; ctx.scene.add(beam);
    const plank = shadowed(new THREE.Mesh(new THREE.BoxGeometry(11, 0.28, 1.6), mat('#f59e0b', 0.6))); beam.add(plank);
    const mkPan = (x: number, color: string) => {
      const g = new THREE.Group(); g.position.set(x, 0.3, 0);
      const pan = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.2, 32), mat(color, 0.5))); g.add(pan);
      const bar = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), mat(color, 0.4))); g.add(bar);
      const lab = textSprite('0', 1.9, { px: 96, w: 256, h: 128, bg: '#ffffff', border: color }); g.add(lab);
      beam.add(g); return { g, bar, lab };
    };
    const L = mkPan(-4.2, '#38bdf8'); const R = mkPan(4.2, '#fb7185');
    void cube;
    let tilt = 0;
    const set = (x: number, y: number, animate = true) => {
      const h = (n: number) => 0.2 + (n / 999) * 4.2;
      [[L, x], [R, y]].forEach(([p, n]: any) => { p.bar.scale.y = h(n); p.bar.position.y = 0.1 + h(n) / 2; p.lab.position.set(0, 0.5 + h(n) + 0.7, 0); retext(p.lab, String(n), { px: 96, w: 256, h: 128, bg: '#ffffff', border: p === L ? '#38bdf8' : '#fb7185' }); });
      const to = x === y ? 0 : x > y ? 0.24 : -0.24;
      const from = tilt; tilt = to;
      const apply = (k: number) => { const v = from + (to - from) * k; beam.rotation.z = v; [L, R].forEach((p) => { p.g.rotation.z = -v; }); };
      if (animate) ctx.tween(900, apply, undefined, ease.back); else apply(1);
    };
    scene.current = { set };
    set(345, 298, false);
    return () => { scene.current = null; };
  }, [], { camera: [0, 6, 14], target: [0, 3, 0], minDistance: 8, maxDistance: 22 });

  const apply = (x: number, y: number) => { setA(x); setB(y); setPicked(null); scene.current?.set(x, y); };
  useEffect(() => {
    if (kit.mode === 'LEARN') { apply(PAIRS[li][0], PAIRS[li][1]); const [x, y] = PAIRS[li]; kit.say(x === y ? `${x} र ${y} बराबर छन्।` : `${Math.max(x, y)} ठूलो छ, ${Math.min(x, y)} सानो।`, x === y ? `${x} and ${y} are equal.` : `${Math.max(x, y)} is greater than ${Math.min(x, y)}.`); }
    else if (kit.mode === 'PLAY') { apply(a, b); kit.say('सङ्ख्या बदलौँ र झुला हेरौँ।', 'Change the numbers and watch the seesaw.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const step = (side: 'a' | 'b', d: number) => { const v = Math.max(0, Math.min(999, (side === 'a' ? a : b) + d)); side === 'a' ? apply(v, b) : apply(a, v); kit.tap(); };
  const guess = (s: string) => {
    setPicked(s);
    if (s === SYM(a, b)) { kit.good(`${a} ${s} ${b}`, `${a} ${s} ${b}`); kit.star(); } else kit.oops('झुलामा हेरेर फेरि सोचौँ!', 'Look at the seesaw and think again');
  };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    let x = rnd(100, 999), y = rnd(100, 999);
    if (i % 4 === 3) y = x; else if (i % 3 === 0) y = x + rnd(1, 9) * (Math.random() < 0.5 ? 1 : -1);
    y = Math.max(10, Math.min(999, y));
    return { x, y, kind: i < 4 ? 'sym' : i % 2 ? 'big' : 'small' };
  }), []);
  const questions: (QuizQuestion & { x: number; y: number })[] = data.map((d) => {
    if (d.kind === 'sym') return { np: `${fmt('ne', d.x)} ◯ ${fmt('ne', d.y)} — सही चिन्ह कुन हो?`, en: `${d.x} ◯ ${d.y} — which sign is correct?`, x: d.x, y: d.y, answer: SYM(d.x, d.y), options: ['>', '<', '='].map((s) => ({ key: s, label: s })) };
    const x = d.x === d.y ? d.y + 1 : d.x;
    return d.kind === 'big'
      ? { np: 'कुन सङ्ख्या ठूलो छ?', en: 'Which number is greater?', x, y: d.y, answer: String(Math.max(x, d.y)), options: shuffle([x, d.y], x).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) }
      : { np: 'कुन सङ्ख्या सानो छ?', en: 'Which number is smaller?', x, y: d.y, answer: String(Math.min(x, d.y)), options: shuffle([x, d.y], x + 3).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 18px', border: '3px solid #0ea5e9', fontSize: 34, fontWeight: 900 }}>
      {fmt(kit.lang, a)} <span style={{ color: picked === SYM(a, b) || kit.mode === 'LEARN' ? '#16a34a' : '#94a3b8' }}>{picked === SYM(a, b) || kit.mode === 'LEARN' ? SYM(a, b) : '?'}</span> {fmt(kit.lang, b)}
    </div>
  );
  const stepper = (label: string, side: 'a' | 'b', color: string) => (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', background: '#f1f5f9', borderRadius: 14, padding: '4px 8px' }}>
      <b style={{ color }}>{label}</b>
      {[100, 10, 1].map((d) => <React.Fragment key={d}><CBtn color="#0ea5e9" style={{ minHeight: 40, padding: '2px 8px', fontSize: 14 }} onClick={() => step(side, d)}>+{fmt(kit.lang, d)}</CBtn><CBtn color="#94a3b8" style={{ minHeight: 40, padding: '2px 8px', fontSize: 14 }} onClick={() => step(side, -d)}>−{fmt(kit.lang, d)}</CBtn></React.Fragment>)}
    </div>
  );
  const symBtns = ['>', '<', '='].map((s) => <CBtn key={s} color={picked === s ? (s === SYM(a, b) ? '#16a34a' : '#f97316') : '#8b5cf6'} style={{ minWidth: 56, fontSize: 26 }} onClick={() => guess(s)}>{s}</CBtn>);
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('चिन्हको मुख ठूलो सङ्ख्यातिर खुल्छ।', 'The sign opens its mouth toward the bigger number.')}</div>
      <CBtn color="#16a34a" onClick={() => { kit.star(); setLi((li + 1) % PAIRS.length); }}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <div><Controls>{stepper('A', 'a', '#0284c7')}{stepper('B', 'b', '#e11d48')}</Controls><div style={{ marginTop: 6 }}><Controls><b>{kit.t('सही चिन्ह रोजौँ', 'Pick the sign')}:</b>{symBtns}</Controls></div></div>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.x, q.y)} />
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
