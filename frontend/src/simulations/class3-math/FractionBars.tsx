/**
 * Lesson 7 · Fraction (भिन्न)
 * Chocolate Fractions — a bar of chocolate cut into equal pieces; eat some and read the fraction (numerator over denominator).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
const ORD = ['', '', 'half', 'third', 'quarter', 'fifth', 'sixth', 'seventh', 'eighth'];
const fword = (n: number, d: number) => (d === 2 ? (n === 1 ? 'one half' : 'two halves') : `${['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'][n]} ${ORD[d]}${n > 1 ? 's' : ''}`);
const TOUR: [number, number][] = [[1, 2], [1, 3], [1, 4], [3, 4], [2, 3], [3, 5], [5, 8]];
const Frac: React.FC<{ n: number; d: number; size?: number }> = ({ n, d, size = 30 }) => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', fontWeight: 900, fontSize: size, lineHeight: 1.05, margin: '0 6px' }}><span>{n}</span><span style={{ borderTop: '3px solid #0f172a', alignSelf: 'stretch', textAlign: 'center' }}>{d}</span></span>
);

export const FractionBars: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L7-01', chapter: 7, titleNp: 'चकलेट भिन्न', titleEn: 'Chocolate Fractions' });
  const [n, setN] = useState(1);
  const [d, setD] = useState(2);
  const [li, setLi] = useState(0);
  const scene = useRef<{ set: (n: number, d: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const tray = shadowed(new THREE.Mesh(new THREE.BoxGeometry(15, 0.3, 4.4), mat('#e2e8f0', 0.8))); tray.position.y = 0.15; ctx.scene.add(tray);
    const set = (nn: number, dd: number) => {
      g.clear(); const W = 13.6, w = W / dd;
      for (let i = 0; i < dd; i++) {
        const on = i < nn; const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w - 0.14, on ? 1.1 : 0.55, 3.4), mat(on ? '#7c2d12' : '#fde68a', 0.5)));
        m.position.set(-W / 2 + w * (i + 0.5), 0.3 + (on ? 0.55 : 0.28), 0); g.add(m);
        const top = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w - 0.9, 0.08, 2.4), mat(on ? '#9a3412' : '#fef3c7', 0.4))); top.position.set(m.position.x, m.position.y + (on ? 0.55 : 0.28), 0); g.add(top);
        m.scale.y = 0.01; ctx.tween(260 + i * 60, (k) => { m.scale.y = Math.max(0.01, k); }, undefined, ease.back);
      }
    };
    scene.current = { set }; set(1, 2);
    return () => { scene.current = null; };
  }, [], { camera: [0, 9, 10], target: [0, 0.6, 0], minDistance: 6, maxDistance: 20, ground: 0xfef9c3 });

  const apply = (nn: number, dd: number, speak = false) => { setN(nn); setD(dd); scene.current?.set(nn, dd); if (speak) kit.say(`${nn}/${dd} — ${nn} अंश, ${dd} हर`, `${nn}/${dd} = ${fword(nn, dd)}: ${dd} equal pieces, ${nn} taken`); };
  useEffect(() => { if (kit.mode === 'LEARN') { const [a, b] = TOUR[li % TOUR.length]; apply(a, b, true); } else if (kit.mode === 'PLAY') apply(n, d); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const dd = rnd(2, 8); return { n: rnd(1, dd - 1), d: dd, kind: i % 3, other: rnd(2, 8) }; }), []);
  const questions: (QuizQuestion & { f: [number, number] })[] = data.map((q, i) => {
    const t = `${q.n}/${q.d}`;
    if (q.kind === 0) { const wrong = shuffle([q.d - q.n, q.d, q.n + 1].filter((x) => x !== q.n && x >= 1), i).slice(0, 2); const opts = shuffle([q.d - q.n === q.n ? q.n + 2 : q.d - q.n, q.n, ...wrong].filter((x, j, a) => a.indexOf(x) === j), i).slice(0, 3); void opts; const o = shuffle(Array.from(new Set([`${q.n}/${q.d}`, `${q.d - q.n || 1}/${q.d}`, `${q.n}/${q.d + 1}`])), i + 2); return { f: [q.n, q.d], np: 'चित्रमा खाइएको भाग कुन भिन्न हो?', en: 'Which fraction of the bar has been eaten?', answer: `${q.n}/${q.d}`, options: o.map((k) => ({ key: k, label: k.split('/').map((x) => fmt(kit.lang, x)).join('/') })) }; }
    if (q.kind === 1) { const o = shuffle(Array.from(new Set([q.d, q.n, q.d + 2])), i + 4); return { f: [q.n, q.d], np: `${t} मा हर (कुल बराबर भाग) कति हो?`, en: `In ${t}, what is the denominator (equal pieces in all)?`, answer: String(q.d), options: o.map((x) => ({ key: String(x), label: fmt(kit.lang, x) })) }; }
    const o = shuffle(Array.from(new Set([q.n, q.d, q.n + 2])), i + 6); return { f: [q.n, q.d], np: `${t} मा अंश (लिएको भाग) कति हो?`, en: `In ${t}, what is the numerator (pieces taken)?`, answer: String(q.n), options: o.map((x) => ({ key: String(x), label: fmt(kit.lang, x) })) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '6px 18px', border: '3px solid #7c2d12', textAlign: 'center' }}>
      <Frac n={n} d={d} size={34} /><div style={{ fontSize: 14, fontWeight: 800 }}>{fword(n, d)}</div>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{kit.t('अंश = लिएको भाग · हर = कुल बराबर भाग', 'numerator = taken · denominator = equal pieces')}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('सबै टुक्रा बराबर हुनुपर्छ', 'All the pieces must be equal')}</div><CBtn color="#16a34a" onClick={() => { kit.star(); setLi(li + 1); }}>{kit.t('अर्को', 'Next')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      <CBtn color="#8b5cf6" onClick={() => d > 2 && apply(Math.min(n, d - 1), d - 1)}>{kit.t('हर', 'Pieces')} −</CBtn><CBtn color="#8b5cf6" onClick={() => d < 8 && apply(n, d + 1)}>{kit.t('हर', 'Pieces')} +</CBtn>
      <CBtn color="#f59e0b" onClick={() => n > 0 && apply(n - 1, d)}>{kit.t('अंश', 'Eaten')} −</CBtn><CBtn color="#f59e0b" onClick={() => n < d && apply(n + 1, d)}>{kit.t('अंश', 'Eaten')} +</CBtn>
    </Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.f[0], q.f[1])} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
