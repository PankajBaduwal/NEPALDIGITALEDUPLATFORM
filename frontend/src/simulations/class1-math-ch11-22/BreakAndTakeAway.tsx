/**
 * Chapter 17 · Subtraction of numbers up to two digits (दुई अङ्कसम्मका सङ्ख्याको घटाउ)
 * Break and Take Away — take blocks away; if there are not enough ones, break one tower into ten ones.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { Blocks } from '../class1-math-kit/place';
import { toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const LEARN = [[48, 23], [39, 15], [52, 27], [60, 34], [75, 38]];

export const BreakAndTakeAway: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH17-01', chapter: 17, titleNp: 'फुकाऔँ र घटाऔँ (दुई अङ्क)', titleEn: 'Break and Take Away (two digits)' });
  const [a, setA] = useState(52);
  const [b, setB] = useState(27);
  const [tens, setTens] = useState(5);
  const [ones, setOnes] = useState(2);
  const [remT, setRemT] = useState(2);
  const [remO, setRemO] = useState(7);
  const [li, setLi] = useState(0);
  const [busy, setBusy] = useState(false);
  const scene = useRef<{ blocks: Blocks } | null>(null);
  const finishedFor = useRef('');

  useStage(kit.stageRef, (ctx) => {
    const blocks = new Blocks(ctx, { x: -6, z: 0, tensColor: '#38bdf8', onesColor: '#facc15', u: 0.5 });
    scene.current = { blocks }; blocks.setNumber(52);
    return () => { scene.current = null; blocks.dispose(); };
  }, [], { camera: [0, 9, 13], target: [0, 1.8, 0], minDistance: 8, maxDistance: 24 });

  const setup = (x: number, y: number) => {
    setA(x); setB(y); setTens(Math.floor(x / 10)); setOnes(x % 10); setRemT(Math.floor(y / 10)); setRemO(y % 10); setBusy(false);
    finishedFor.current = '';
    scene.current?.blocks.setNumber(x);
  };
  const done = (t: number, o: number, rt: number, ro: number) => {
    if (kit.mode === 'CHALLENGE') return;
    if (rt === 0 && ro === 0 && finishedFor.current !== `${a}-${b}`) {
      finishedFor.current = `${a}-${b}`;
      kit.good(`${a} − ${b} = ${t * 10 + o}`, `${a} − ${b} = ${t * 10 + o}`);
      kit.star();
    }
  };
  const takeOne = () => {
    if (busy) return;
    if (remO === 0) { kit.oops('एकाइ पहिले नै सबै घटाइसक्यौँ', 'You already took all the ones'); return; }
    if (ones === 0) { kit.oops('एकाइ पुगेन! एउटा दशक फुकाऔँ 🔨', 'Not enough ones! Break a ten 🔨'); return; }
    scene.current?.blocks.removeOne(); kit.tap();
    setOnes(ones - 1); setRemO(remO - 1); done(tens, ones - 1, remT, remO - 1);
  };
  const takeTen = () => {
    if (busy) return;
    if (remT === 0) { kit.oops('दशक पहिले नै सबै घटाइसक्यौँ', 'You already took all the tens'); return; }
    if (tens === 0) return;
    scene.current?.blocks.removeTen(); kit.tap();
    setTens(tens - 1); setRemT(remT - 1); done(tens - 1, ones, remT - 1, remO);
  };
  const breakTen = () => {
    if (busy) return;
    if (!tens) return;
    if (ones >= remO) { kit.oops('अहिले फुकाउनु पर्दैन', 'No need to break a ten now'); return; }
    setBusy(true);
    scene.current?.blocks.breakTen(() => setBusy(false));
    setTens(tens - 1); setOnes(ones + 10);
    kit.say('एउटा दशक फुक्यो — अब १० वटा एकाइ छन्!', 'One ten broke into 10 ones!');
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') { setup(LEARN[li][0], LEARN[li][1]); kit.say(`${toNp(LEARN[li][0])} बाट ${toNp(LEARN[li][1])} घटाऔँ।`, `Take ${LEARN[li][1]} away from ${LEARN[li][0]}.`); }
    else if (kit.mode === 'PLAY') { const [x, y] = [rnd(40, 90), rnd(11, 39)]; setup(x, y); kit.say('ब्लक हटाएर घटाऔँ। एकाइ नपुगे दशक फुकाऔँ।', 'Take blocks away. If ones are not enough, break a ten.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    let x = 0, y = 0;
    for (;;) { x = rnd(30, 90); y = rnd(11, x - 5 > 45 ? 45 : x - 5); const borrow = (x % 10) < (y % 10); if ((i % 2 === 0) === borrow) continue; if (y < x) break; }
    const r = x - y;
    const wrong = Math.floor(x / 10 - y / 10) * 10 + Math.abs((x % 10) - (y % 10));
    const opts = Array.from(new Set([r, wrong === r ? r + 1 : wrong, r + 10, r + 1])).slice(0, 3);
    if (!opts.includes(r)) opts[0] = r;
    return { x, y, r, opts: shuffle(opts) };
  }), []);
  const questions: (QuizQuestion & { x: number; y: number })[] = data.map((d) => ({
    np: `${toNp(d.x)} − ${toNp(d.y)} = ?`, en: `${d.x} − ${d.y} = ?`, x: d.x, y: d.y, answer: String(d.r),
    options: d.opts.map((v) => ({ key: String(v), label: kit.lang === 'ne' ? toNp(v) : String(v) })),
  }));

  const num = (v: number) => (kit.lang === 'ne' ? toNp(v) : String(v));
  const complete = remT === 0 && remO === 0;
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 900 }}>{num(a)} − {num(b)} = <span style={{ color: complete ? '#16a34a' : '#94a3b8' }}>{complete ? num(tens * 10 + ones) : '?'}</span></div>
      {!complete && <div style={{ fontSize: 16, fontWeight: 800, color: '#be123c' }}>{kit.t('अझै घटाउनु पर्ने', 'Still to take away')}: {num(remT)} {kit.t('दशक', 'tens')} + {num(remO)} {kit.t('एकाइ', 'ones')}</div>}
    </div>
  );
  const buttons = (
    <>
      <CBtn color="#eab308" onClick={takeOne} disabled={busy}>−1 🟨 {kit.t('एकाइ', 'one')}</CBtn>
      <CBtn color="#0ea5e9" onClick={takeTen} disabled={busy}>−10 🟦 {kit.t('दशक', 'ten')}</CBtn>
      <CBtn color="#f97316" onClick={breakTen} disabled={busy}>🔨 {kit.t('दशक फुकाऔँ', 'Break a ten')}</CBtn>
    </>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 180 }}>{complete ? `✅ ${a} − ${b} = ${tens * 10 + ones}` : kit.t('पहिले एकाइ, अनि दशक घटाऔँ', 'Take away ones first, then tens')}</div>
      {buttons}
      <CBtn color="#16a34a" disabled={!complete} onClick={() => setLi((li + 1) % LEARN.length)}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      {buttons}
      <CBtn color="#8b5cf6" onClick={() => setup(rnd(40, 90), rnd(11, 39))}>🎲 {kit.t('नयाँ प्रश्न', 'New problem')}</CBtn>
      <CBtn color="#f59e0b" onClick={() => setup(a, b)}>↺</CBtn>
    </Controls>
  ) : (
    <div>
      <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => setup(q.x, q.y)} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>{buttons}</div>
    </div>
  );

  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
