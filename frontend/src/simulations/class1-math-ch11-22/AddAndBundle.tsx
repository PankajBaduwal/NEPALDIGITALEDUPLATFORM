/**
 * Chapter 16 · Addition of numbers up to the sum of 100 (योगफल १०० सम्म आउने जोड)
 * Add and Bundle — join two numbers made of blocks, then bundle ten loose cubes into one new tower.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { Blocks } from '../class1-math-kit/place';
import { toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const LEARN = [[23, 14], [35, 27], [48, 19], [56, 28], [17, 45]];

export const AddAndBundle: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH16-01', chapter: 16, titleNp: 'जोडौँ र बाँधौँ (१०० सम्म)', titleEn: 'Add and Bundle (up to 100)' });
  const [a, setA] = useState(23);
  const [b, setB] = useState(14);
  const [stage, setStage] = useState(0); // 0 apart · 1 joined · 2 bundled / finished
  const [li, setLi] = useState(0);
  const [busy, setBusy] = useState(false);
  const scene = useRef<{ A: Blocks; B: Blocks } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const A = new Blocks(ctx, { x: -6, z: -2.8, tensColor: '#38bdf8', onesColor: '#facc15', u: 0.45, labelColor: '#0ea5e9' });
    const B = new Blocks(ctx, { x: -6, z: 2.2, tensColor: '#fb7185', onesColor: '#fde047', u: 0.45, labelColor: '#f43f5e' });
    scene.current = { A, B };
    A.setNumber(23); B.setNumber(14);
    return () => { scene.current = null; A.dispose(); B.dispose(); };
  }, [], { camera: [0, 10.5, 14], target: [0, 1.5, 0], minDistance: 8, maxDistance: 24 });

  const setup = (x: number, y: number) => { setA(x); setB(y); setStage(0); setBusy(false); scene.current?.A.setNumber(x); scene.current?.B.setNumber(y); };
  const needsBundle = (a % 10) + (b % 10) >= 10;
  const join = () => {
    if (stage !== 0 || busy) return;
    setBusy(true); kit.tap();
    kit.say('दुवै सङ्ख्याका ब्लकहरू एकै ठाउँमा जोडौँ।', 'Join the blocks of both numbers together.');
    scene.current?.A.absorb(scene.current.B, () => {
      setBusy(false); setStage(1);
      if (!needsBundle) { kit.good(`${a} + ${b} = ${a + b}`, `${a} + ${b} = ${a + b}`); setStage(2); }
      else kit.say('१० वटा एकाइ भए! तिनलाई एउटा दशकमा बाँधौँ।', 'We have 10 or more ones! Bundle ten of them into one tower.');
    });
  };
  const bundle = () => {
    if (stage !== 1 || busy || !needsBundle) return;
    setBusy(true);
    scene.current?.A.bundle(() => { setBusy(false); setStage(2); kit.good(`${a} + ${b} = ${a + b}`, `${a} + ${b} = ${a + b}`); });
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') { setup(LEARN[li][0], LEARN[li][1]); kit.say(`${toNp(LEARN[li][0])} र ${toNp(LEARN[li][1])} जोडौँ।`, `Let us add ${LEARN[li][0]} and ${LEARN[li][1]}.`); }
    else if (kit.mode === 'PLAY') { setup(a, b); kit.say('दुई सङ्ख्या रोजौँ र जोडौँ।', 'Choose two numbers and add them.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    let x = 0, y = 0;
    for (;;) { x = rnd(11, 70); y = rnd(11, 40); const regroup = (x % 10) + (y % 10) >= 10; if ((i % 2 === 0) === regroup) continue; if (x + y <= 100) break; }
    const s = x + y;
    return { x, y, s, opts: shuffle([s, s - 10 < 0 ? s + 2 : s - 10, s + 1]) };
  }), []);
  const questions: (QuizQuestion & { x: number; y: number })[] = data.map((d) => ({
    np: `${toNp(d.x)} + ${toNp(d.y)} = ?`, en: `${d.x} + ${d.y} = ?`, x: d.x, y: d.y, answer: String(d.s),
    options: d.opts.map((v) => ({ key: String(v), label: kit.lang === 'ne' ? toNp(v) : String(v) })),
  }));

  const num = (v: number) => (kit.lang === 'ne' ? toNp(v) : String(v));
  const step = (which: 'a' | 'b', part: 'tens' | 'ones', d: 1 | -1) => {
    if (stage !== 0) return;
    const cur = which === 'a' ? a : b;
    let t = Math.floor(cur / 10), o = cur % 10;
    if (part === 'tens') t = Math.min(9, Math.max(0, t + d)); else o = Math.min(9, Math.max(0, o + d));
    const next = t * 10 + o;
    const other = which === 'a' ? b : a;
    if (next + other > 100) { kit.oops('जोड १०० भन्दा बढी हुन्छ', 'The sum would be over 100'); return; }
    which === 'a' ? setA(next) : setB(next);
    (which === 'a' ? scene.current?.A : scene.current?.B)?.setNumber(next);
  };
  const stepper = (label: string, which: 'a' | 'b') => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#f1f5f9', borderRadius: 14, padding: '4px 8px' }}>
      <b style={{ minWidth: 70 }}>{label} {num(which === 'a' ? a : b)}</b>
      <CBtn color="#0ea5e9" style={{ minHeight: 40, padding: '4px 10px', fontSize: 15 }} onClick={() => step(which, 'tens', 1)}>+{num(10)}</CBtn>
      <CBtn color="#94a3b8" style={{ minHeight: 40, padding: '4px 10px', fontSize: 15 }} onClick={() => step(which, 'tens', -1)}>−{num(10)}</CBtn>
      <CBtn color="#eab308" style={{ minHeight: 40, padding: '4px 10px', fontSize: 15 }} onClick={() => step(which, 'ones', 1)}>+{num(1)}</CBtn>
      <CBtn color="#94a3b8" style={{ minHeight: 40, padding: '4px 10px', fontSize: 15 }} onClick={() => step(which, 'ones', -1)}>−{num(1)}</CBtn>
    </div>
  );

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', fontSize: 32, fontWeight: 900 }}>
      {num(a)} + {num(b)} = <span style={{ color: stage === 2 ? '#16a34a' : '#94a3b8' }}>{stage === 2 ? num(a + b) : '?'}</span>
    </div>
  );
  const stepBtns = (
    <>
      <CBtn color="#8b5cf6" disabled={stage !== 0 || busy} onClick={join}>① {kit.t('जोडौँ', 'Join')}</CBtn>
      <CBtn color="#f97316" disabled={stage !== 1 || busy || !needsBundle} onClick={bundle}>② {kit.t('१० बाँधौँ', 'Bundle 10')}</CBtn>
    </>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 200 }}>
        {stage === 0 && kit.t('पहिले दुवै सङ्ख्या जोडौँ', 'First, join the two numbers')}
        {stage === 1 && kit.t('१० वा बढी एकाइ छन्। बाँधौँ!', '10 or more ones. Bundle them!')}
        {stage === 2 && `✅ ${a} + ${b} = ${a + b}`}
      </div>
      {stepBtns}
      <CBtn color="#16a34a" disabled={stage !== 2} onClick={() => { kit.star(); setLi((li + 1) % LEARN.length); }}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      {stepper('A', 'a')}{stepper('B', 'b')}{stepBtns}
      <CBtn color="#f59e0b" onClick={() => setup(a, b)}>↺</CBtn>
    </Controls>
  ) : (
    <div>
      <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => setup(q.x, q.y)} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>{stepBtns}</div>
    </div>
  );

  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
