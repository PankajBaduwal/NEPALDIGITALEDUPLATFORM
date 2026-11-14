/**
 * Lesson 3 · Comparison of numbers (सङ्ख्याको तुलना)
 * Digit Duel — two five-digit numbers stand in rows of cards; compare place by place from the left and choose >, < or =.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { big, fmt, digitsOf, PLACES } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
const pair = (): [number, number] => {
  const a = rnd(10000, 99999); const r = rnd(0, 9);
  if (r === 0) return [a, a];
  const same = rnd(0, 3); const s = String(a); let b = Number(s.slice(0, same) + String(rnd(0, 9)) + String(rnd(10000, 99999)).slice(same + 1));
  if (b < 10000) b += 10000; return [a, b];
};
const sym = (a: number, b: number) => (a > b ? '>' : a < b ? '<' : '=');

export const DigitDuel: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L3-01', chapter: 3, titleNp: 'अङ्कको द्वन्द्व (तुलना)', titleEn: 'Digit Duel (Comparison)' });
  const [ab, setAb] = useState<[number, number]>([48215, 48721]);
  const [col, setCol] = useState(-1);
  const [shown, setShown] = useState(false);
  const [auto, setAuto] = useState(0);
  const timers = useRef<number[]>([]);
  const scene = useRef<{ show: (a: number, b: number) => void; mark: (c: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    let cards: THREE.Mesh[][] = [[], []]; const labels: THREE.Object3D[] = [];
    const clear = () => { g.clear(); cards = [[], []]; labels.length = 0; };
    const show = (a: number, b: number) => {
      clear();
      [a, b].forEach((n, r) => digitsOf(n).forEach((d, c) => {
        const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 2.1), mat(r ? '#38bdf8' : '#fb923c', 0.5))); m.position.set((c - 2) * 2.1, 0.25, r ? 2.2 : -2.2); g.add(m); cards[r].push(m);
        const t = textSprite(String(d), 1.8, { px: 150, w: 128, h: 128, bg: null, color: '#0f172a' }); t.position.set((c - 2) * 2.1, 1.5, r ? 2.2 : -2.2); g.add(t);
      }));
      PLACES.forEach((p, c) => { const t = textSprite(p.np, 1.6, { px: 44, w: 256, h: 96, bg: null, color: '#475569' }); t.position.set((c - 2) * 2.1, 0.1, 0); g.add(t); });
    };
    const mark = (c: number) => cards.forEach((row) => row.forEach((m, i) => { (m.material as THREE.MeshStandardMaterial).emissive.setHex(i === c ? 0xfacc15 : 0); (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6; m.position.y = i === c ? 0.6 : 0.25; }));
    scene.current = { show, mark }; show(48215, 48721);
    return () => { scene.current = null; };
  }, [], { camera: [0, 9, 11], target: [0, 0.6, 0], minDistance: 7, maxDistance: 20, ground: 0xfef9c3 });

  const clearTimers = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
  useEffect(() => clearTimers, []);
  const load = (a: number, b: number) => { clearTimers(); setAb([a, b]); setCol(-1); setShown(false); scene.current?.show(a, b); };

  const walk = (a: number, b: number) => {
    const da = digitsOf(a), db = digitsOf(b); let c = 0;
    const step = () => {
      setCol(c); scene.current?.mark(c); kit.tap();
      if (da[c] !== db[c] || c === 4) {
        timers.current.push(window.setTimeout(() => { setShown(true); const s = sym(a, b); kit.say(s === '=' ? 'सबै अङ्क उस्तै छन् — दुवै सङ्ख्या बराबर छन्' : `${PLACES[c].np}को अङ्क ${da[c]} र ${db[c]} फरक छ — ${a > b ? 'पहिलो ठूलो' : 'दोस्रो ठूलो'}`, s === '=' ? 'All digits match — the numbers are equal' : `The ${PLACES[c].en.toLowerCase()} digits differ: ${da[c]} and ${db[c]} — ${a > b ? 'the first is greater' : 'the second is greater'}`); }, 700));
      } else { c += 1; timers.current.push(window.setTimeout(step, 900)); }
    };
    step();
  };
  useEffect(() => {
    if (kit.mode === 'LEARN') { const p = pair(); load(p[0], p[1]); kit.say('बायाँबाट अङ्क तुलना गरौँ', 'Compare the digits from the left'); timers.current.push(window.setTimeout(() => walk(p[0], p[1]), 1200)); }
    else if (kit.mode === 'PLAY') { const p = pair(); load(p[0], p[1]); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, auto]);

  const choose = (s: string) => { if (shown) return; const right = sym(ab[0], ab[1]); walk(ab[0], ab[1]); if (s === right) { kit.good(); kit.star(); } else kit.oops(`सही चिन्ह ${right} हो`, `The right sign is ${right}`); };

  const data = useMemo(() => Array.from({ length: 8 }, () => pair()), []);
  const questions: (QuizQuestion & { p: [number, number] })[] = data.map((p, i) => ({ np: `${p[0].toLocaleString('en-US')} ◯ ${p[1].toLocaleString('en-US')} — सही चिन्ह कुन हो?`, en: `${p[0].toLocaleString('en-US')} ◯ ${p[1].toLocaleString('en-US')} — which sign fits?`, p, answer: sym(p[0], p[1]), options: shuffle(['>', '<', '='], i + 1).map((s) => ({ key: s, label: s })) }));

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #f59e0b', textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 900 }}><span style={{ color: '#ea580c' }}>{big(kit.lang, ab[0])}</span> {shown ? <span style={{ color: '#16a34a' }}>{sym(ab[0], ab[1])}</span> : '◯'} <span style={{ color: '#0284c7' }}>{big(kit.lang, ab[1])}</span></div>
      {col >= 0 && <div style={{ fontSize: 14, fontWeight: 800 }}>{kit.t(PLACES[col].np, PLACES[col].en)}: {fmt(kit.lang, digitsOf(ab[0])[col])} / {fmt(kit.lang, digitsOf(ab[1])[col])}</div>}
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('बढी अङ्क भएको सङ्ख्या ठूलो · अङ्क बराबर भए बायाँबाट तुलना', 'More digits = bigger. Same digits? compare from the left.')}</div><CBtn color="#16a34a" onClick={() => { kit.star(); setAuto(auto + 1); }}>{kit.t('अर्को', 'Next')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{['>', '<', '='].map((s) => <CBtn key={s} color="#8b5cf6" style={{ minWidth: 70, fontSize: 28 }} onClick={() => choose(s)}>{s}</CBtn>)}<CBtn color="#16a34a" onClick={() => setAuto(auto + 1)}>🎲 {kit.t('अर्को', 'Next')}</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => load(q.p[0], q.p[1])} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
