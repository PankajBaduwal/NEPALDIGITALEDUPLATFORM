/**
 * Lesson 7 · Addition (जोड) — three-digit numbers
 * Add Town — join two numbers made of blocks; ten ones bundle into a ten, ten tens bundle into a hundred.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { Blocks3, fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const LEARN = [[234, 125], [346, 178], [457, 265], [568, 247], [129, 386]];

export const AddTown: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L7-01', chapter: 7, titleNp: 'जोड सहर (तीन अङ्क)', titleEn: 'Add Town (three-digit addition)' });
  const [a, setA] = useState(234);
  const [b, setB] = useState(125);
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);
  const [li, setLi] = useState(0);
  const scene = useRef<{ A: Blocks3; B: Blocks3 } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const A = new Blocks3(ctx, { x: -6.5, z: -3.2, u: 0.3, labelColor: '#0ea5e9' });
    const B = new Blocks3(ctx, { x: -6.5, z: 2.4, u: 0.3, labelColor: '#f43f5e' });
    scene.current = { A, B }; A.setNumber(234); B.setNumber(125);
    return () => { scene.current = null; A.dispose(); B.dispose(); };
  }, [], { camera: [0, 12, 15], target: [0, 1.2, -0.3], minDistance: 8, maxDistance: 26 });

  const setup = (x: number, y: number) => { setA(x); setB(y); setJoined(false); setBusy(false); scene.current?.A.setNumber(x); scene.current?.B.setNumber(y); };
  const join = () => {
    if (joined || busy || !scene.current) return;
    setBusy(true); kit.tap(); kit.say('दुवै सङ्ख्याका ब्लकहरू जोडौँ।', 'Join the blocks of both numbers.');
    scene.current.A.absorb(scene.current.B, () => { setBusy(false); setJoined(true); tick((v) => v + 1); });
  };
  const A = scene.current?.A;
  const canOnes = joined && !busy && !!A && A.ones.length >= 10;
  const canTens = joined && !busy && !!A && A.tens.length >= 10;
  const finished = joined && !busy && !!A && A.ones.length < 10 && A.tens.length < 10;
  const doneFor = useRef('');
  useEffect(() => { if (finished && kit.mode !== 'CHALLENGE' && doneFor.current !== `${a}+${b}`) { doneFor.current = `${a}+${b}`; kit.good(`${a} + ${b} = ${a + b}`, `${a} + ${b} = ${a + b}`); kit.star(); } /* eslint-disable-next-line */ }, [finished]);
  const bundleOnes = () => { if (!canOnes) return; setBusy(true); kit.say('१० एकाइ → १ दशक', '10 ones → 1 ten'); scene.current?.A.bundleOnes(() => { setBusy(false); tick((v) => v + 1); }); };
  const bundleTens = () => { if (!canTens) return; setBusy(true); kit.say('१० दशक → १ सय', '10 tens → 1 hundred'); scene.current?.A.bundleTens(() => { setBusy(false); tick((v) => v + 1); }); };

  useEffect(() => {
    doneFor.current = '';
    if (kit.mode === 'LEARN') { setup(LEARN[li][0], LEARN[li][1]); kit.say(`${LEARN[li][0]} र ${LEARN[li][1]} जोडौँ।`, `Let us add ${LEARN[li][0]} and ${LEARN[li][1]}.`); }
    else if (kit.mode === 'PLAY') { const x = rnd(120, 560), y = rnd(120, 400); setup(x, y); kit.say('जोडौँ थिचेर ब्लक मिलाऔँ।', 'Press Join to put the blocks together.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    let x = 0, y = 0;
    for (;;) { x = rnd(120, 650); y = rnd(110, 320); const carry = (x % 10) + (y % 10) >= 10 || (Math.floor(x / 10) % 10) + (Math.floor(y / 10) % 10) >= 10; if ((i % 2 === 0) === carry) continue; if (x + y <= 999) break; }
    return { x, y, s: x + y };
  }), []);
  const questions: (QuizQuestion & { x: number; y: number })[] = data.map((d, i) => ({
    np: `${fmt('ne', d.x)} + ${fmt('ne', d.y)} = ?`, en: `${d.x} + ${d.y} = ?`, x: d.x, y: d.y, answer: String(d.s),
    options: numChoices(d.s, i * 17 + 3, [10, -10, 100, 1, -1]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })),
  }));

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', fontSize: 30, fontWeight: 900 }}>
      {fmt(kit.lang, a)} + {fmt(kit.lang, b)} = <span style={{ color: finished ? '#16a34a' : '#94a3b8' }}>{finished ? fmt(kit.lang, a + b) : '?'}</span>
    </div>
  );
  const steps = (
    <>
      <CBtn color="#8b5cf6" disabled={joined || busy} onClick={join}>① {kit.t('जोडौँ', 'Join')}</CBtn>
      <CBtn color="#f97316" disabled={!canOnes} onClick={bundleOnes}>② {kit.t('१० एकाइ बाँधौँ', 'Bundle 10 ones')}</CBtn>
      <CBtn color="#ef4444" disabled={!canTens} onClick={bundleTens}>③ {kit.t('१० दशक बाँधौँ', 'Bundle 10 tens')}</CBtn>
    </>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 200 }}>{finished ? `✅ ${a} + ${b} = ${a + b}` : joined ? kit.t('१० वा बढी भए बाँधौँ', 'Bundle when there are 10 or more') : kit.t('पहिले दुवै सङ्ख्या जोडौँ', 'First join the two numbers')}</div>
      {steps}
      <CBtn color="#16a34a" disabled={!finished} onClick={() => setLi((li + 1) % LEARN.length)}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{steps}<CBtn color="#8b5cf6" onClick={() => setup(rnd(120, 560), rnd(120, 400))}>🎲 {kit.t('नयाँ प्रश्न', 'New problem')}</CBtn><CBtn color="#f59e0b" onClick={() => setup(a, b)}>↺</CBtn></Controls>
  ) : (
    <div><QuizPanel kit={kit} questions={questions} onAsk={(q: any) => setup(q.x, q.y)} /><div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>{steps}</div></div>
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
