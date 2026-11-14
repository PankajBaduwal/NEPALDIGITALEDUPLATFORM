/**
 * Lesson 21 · Pictograph (चित्रचार्ट)
 * Picture Graph — one picture stands for many (2, 5 or 10); read a pictograph with half pictures and answer questions about it.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
const CATS = [
  { np: 'स्याउ', en: 'Apple', emoji: '🍎', color: '#ef4444' }, { np: 'केरा', en: 'Banana', emoji: '🍌', color: '#eab308' },
  { np: 'सुन्तला', en: 'Orange', emoji: '🍊', color: '#f97316' }, { np: 'अङ्गुर', en: 'Grapes', emoji: '🍇', color: '#8b5cf6' },
];
const mkData = (scale: number) => CATS.map(() => rnd(1, 7) * scale + (rnd(0, 1) && scale % 2 === 0 ? scale / 2 : 0));

export const PictoScale: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L21-01', chapter: 21, titleNp: 'चित्रचार्ट पढौँ', titleEn: 'Picture Graph' });
  const [scale, setScale] = useState(5);
  const [vals, setVals] = useState<number[]>([15, 25, 10, 20]);
  const [seed, setSeed] = useState(0);
  const scene = useRef<{ set: (v: number[], s: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const board = shadowed(new THREE.Mesh(new THREE.BoxGeometry(15, 0.3, 8), mat('#f1f5f9', 0.9))); board.position.y = -0.1; ctx.scene.add(board);
    const set = (v: number[], s: number) => {
      g.clear();
      v.forEach((val, r) => {
        const z = -2.7 + r * 1.8; const lab = textSprite(`${CATS[r].emoji} ${CATS[r].en}`, 2.4, { px: 50, w: 256, h: 96, bg: '#ffffff', border: CATS[r].color }); lab.position.set(-5.6, 0.6, z); g.add(lab);
        const full = Math.floor(val / s), half = val % s !== 0;
        for (let k = 0; k < full + (half ? 1 : 0); k++) {
          const isHalf = half && k === full; const geo = isHalf ? new THREE.SphereGeometry(0.6, 24, 16, 0, Math.PI) : new THREE.SphereGeometry(0.6, 24, 16);
          const m = shadowed(new THREE.Mesh(geo, mat(CATS[r].color, 0.35))); m.position.set(-2.8 + k * 1.4, 0.7, z); if (isHalf) m.rotation.y = -Math.PI / 2; g.add(m);
          m.scale.setScalar(0.01); ctx.tween(250 + k * 60 + r * 50, (t) => m.scale.setScalar(Math.max(0.01, t)), undefined, ease.back);
        }
      });
      const key = textSprite(`🔵 = ${s}`, 2.2, { px: 56, w: 256, h: 96, bg: '#fde68a', border: '#f59e0b' }); key.position.set(5.2, 0.9, -3.4); g.add(key);
    };
    scene.current = { set }; set([15, 25, 10, 20], 5);
    return () => { scene.current = null; };
  }, [], { camera: [0, 8.5, 9.5], target: [0, 0.4, -0.2], minDistance: 7, maxDistance: 20, ground: 0xe0f2fe });

  const load = (v: number[], s: number) => { setVals(v); setScale(s); scene.current?.set(v, s); };
  useEffect(() => { if (kit.mode === 'LEARN') { load([15, 25, 10, 20], 5); kit.say('एउटा चित्र = ५। २५ भनेको ५ चित्र।', 'One picture = 5. So 25 is 5 pictures.'); } else if (kit.mode === 'PLAY') { const s = [2, 5, 10][rnd(0, 2)]; load(mkData(s), s); kit.say('चित्र गनेर कुन फल सबैभन्दा बढी छ भन्नुहोस्', 'Count the pictures: which fruit is the most?'); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode, seed]);

  const setS = (s: number) => load(mkData(s), s);
  const best = vals.indexOf(Math.max(...vals));
  const pickBest = (i: number) => { if (i === best) { kit.good(); kit.star(); window.setTimeout(() => setSeed((x) => x + 1), 1200); } else kit.oops('चित्र गनेर हेरौँ', 'Count the pictures again'); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const s = [2, 5, 10][i % 3]; const v = mkData(s); return { s, v, kind: i % 4, a: rnd(0, 3) }; }), []);
  const questions: (QuizQuestion & { d: any })[] = data.map((d, i) => {
    const L = (x: number) => ({ key: String(x), label: fmt(kit.lang, x) });
    if (d.kind === 0) return { d, np: `${CATS[d.a].np}का कति वटा छन्? (🔵 = ${d.s})`, en: `How many ${CATS[d.a].en.toLowerCase()}s are there? (🔵 = ${d.s})`, answer: String(d.v[d.a]), options: near(d.v[d.a], i + 1, [d.s, -d.s, d.s / 2 | 0 || 1, 1, -1], 1).map(L) };
    if (d.kind === 1) { const m = d.v.indexOf(Math.max(...d.v)); return { d, np: 'कुन फल सबैभन्दा धेरै छ?', en: 'Which fruit is the most?', answer: String(m), options: shuffle(Array.from(new Set([m, (m + 1) % 4, (m + 2) % 4])), i).map((x) => ({ key: String(x), label: kit.t(CATS[x].np, CATS[x].en) })) }; }
    if (d.kind === 2) { const m = d.v.indexOf(Math.min(...d.v)); return { d, np: 'कुन फल सबैभन्दा कम छ?', en: 'Which fruit is the fewest?', answer: String(m), options: shuffle(Array.from(new Set([m, (m + 1) % 4, (m + 3) % 4])), i + 2).map((x) => ({ key: String(x), label: kit.t(CATS[x].np, CATS[x].en) })) }; }
    const t = d.v.reduce((a: number, b: number) => a + b, 0); return { d, np: 'सबै फल जम्मा कति?', en: 'How many fruits are there altogether?', answer: String(t), options: near(t, i + 3, [d.s, -d.s, 2 * d.s, 5, -5], 1).map(L) };
  });
  questions.forEach((q) => { if (!q.options.some((o) => o.key === q.answer)) q.options[0] = { key: q.answer, label: q.answer }; });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 900 }}>🔵 = {fmt(kit.lang, scale)}</div>
      {kit.mode === 'LEARN' && <div style={{ fontSize: 13, fontWeight: 700 }}>{CATS.map((c, i) => `${c.emoji} ${fmt(kit.lang, vals[i])}`).join('  ')}</div>}
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('आधा चित्र = आधा सङ्ख्या', 'A half picture means half the number')}</div>{[2, 5, 10].map((s) => <CBtn key={s} color={s === scale ? '#0ea5e9' : '#94a3b8'} onClick={() => { setS(s); kit.say(`एउटा चित्र = ${s}`, `One picture = ${s}`); }}>🔵 = {fmt(kit.lang, s)}</CBtn>)}</Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{CATS.map((c, i) => <CBtn key={c.en} color={c.color} onClick={() => pickBest(i)}>{c.emoji} {kit.t(c.np, c.en)}</CBtn>)}<CBtn color="#8b5cf6" onClick={() => setSeed(seed + 1)}>🎲</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => load(q.d.v, q.d.s)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
