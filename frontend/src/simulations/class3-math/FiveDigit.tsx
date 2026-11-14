/**
 * Lesson 2 · Five-digit numbers (पाँच अङ्कका सङ्ख्या)
 * Five-Digit Towers — five columns of cubes (ten-thousands, thousands, hundreds, tens, ones); build, read and write numbers up to 99,999.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { shuffle, rnd } from '../class1-math-kit/nepali';
import { Pillars, PLACES, digitsOf, big, fmt, words, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
const COLORS = PLACES.map((p) => p.color);
const EXAMPLES = [23456, 40507, 76000, 9999, 50050];

export const FiveDigit: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L2-01', chapter: 2, titleNp: 'पाँच अङ्कका टावर', titleEn: 'Five-Digit Towers' });
  const [d, setD] = useState<number[]>([2, 3, 4, 5, 6]);
  const [li, setLi] = useState(0);
  const scene = useRef<Pillars | null>(null);
  const value = d.reduce((a, v) => a * 10 + v, 0);

  useStage(kit.stageRef, (ctx) => {
    const p = new Pillars(ctx, 5, { u: 0.62, colors: COLORS, names: PLACES });
    scene.current = p; p.set([2, 3, 4, 5, 6], false);
    return () => { scene.current = null; p.dispose(); };
  }, [], { camera: [0, 7, 17], target: [0, 4, 0], minDistance: 9, maxDistance: 28 });

  const apply = (nd: number[], speak = true) => { setD(nd); scene.current?.set(nd); const v = nd.reduce((a, x) => a * 10 + x, 0); if (speak) kit.say(`${v.toLocaleString('en-US')} — ${words(v)}`, `${v.toLocaleString('en-US')} — ${words(v)}`); };
  const step = (c: number, dir: number) => { const nd = [...d]; nd[c] = (nd[c] + dir + 10) % 10; kit.tap(); apply(nd, false); };

  useEffect(() => {
    if (kit.mode === 'LEARN') apply(digitsOf(EXAMPLES[li % EXAMPLES.length]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ v: rnd(10000, 99999), c: rnd(0, 4), kind: i % 2 })), []);
  const questions: QuizQuestion[] = data.map((q, i) => {
    const ds = digitsOf(q.v);
    const t = q.v.toLocaleString('en-US');
    if (q.kind === 0) {
      const opts = shuffle(Array.from(new Set([ds[q.c], (ds[q.c] + 1) % 10, (ds[q.c] + 4) % 10])), i + 2);
      return { np: `${t} मा ${PLACES[q.c].np}को स्थानमा कुन अङ्क छ?`, en: `In ${t}, which digit is in the ${PLACES[q.c].en.toLowerCase()} place?`, answer: String(ds[q.c]), options: opts.map((x) => ({ key: String(x), label: fmt(kit.lang, x) })) };
    }
    const pv = ds[q.c] * 10 ** (4 - q.c);
    const opts = near(pv, i + 6, [10 ** (4 - q.c), -(10 ** (4 - q.c)), 10 ** (5 - q.c), ds[q.c]]);
    return { np: `${t} मा ${PLACES[q.c].np}को अङ्कको स्थानीय मान कति हो?`, en: `What is the place value of the ${PLACES[q.c].en.toLowerCase()} digit of ${t}?`, answer: String(pv), options: opts.map((x) => ({ key: String(x), label: big(kit.lang, x) })) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #8b5cf6', textAlign: 'center', maxWidth: 420 }}>
      <div style={{ fontSize: 34, fontWeight: 900 }}>{big(kit.lang, value)}</div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{words(value)}</div>
      <div style={{ fontSize: 13, color: '#475569', fontWeight: 700 }}>{d.map((x, i) => x * 10 ** (4 - i)).filter((x) => x).map((x) => big(kit.lang, x)).join(' + ') || '0'}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('१० हजार = १ दशहजार · हरेक स्तम्भमा ९ भन्दा बढी घन हुँदैन', '10 thousands = 1 ten-thousand · each column holds at most 9 cubes')}</div><CBtn color="#16a34a" onClick={() => { kit.star(); setLi(li + 1); }}>{kit.t('अर्को', 'Next')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{PLACES.map((p, c) => <div key={p.en} style={{ display: 'flex', alignItems: 'center', gap: 4, background: p.color + '22', borderRadius: 14, padding: '2px 6px' }}><CBtn color={p.color} style={{ minWidth: 40, minHeight: 44, padding: '4px 8px' }} onClick={() => step(c, -1)}>−</CBtn><span style={{ fontWeight: 900, fontSize: 13, minWidth: 40, textAlign: 'center' }}>{kit.t(p.np, p.en)}</span><CBtn color={p.color} style={{ minWidth: 40, minHeight: 44, padding: '4px 8px' }} onClick={() => step(c, 1)}>+</CBtn></div>)}<CBtn color="#8b5cf6" onClick={() => apply(digitsOf(rnd(10000, 99999)))}>🎲</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(_q: any, i: number) => { apply(digitsOf(data[i].v), false); scene.current?.highlight(data[i].c); }} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
