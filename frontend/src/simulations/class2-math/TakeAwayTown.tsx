/**
 * Lesson 8 · Subtraction (घटाउ) — three-digit numbers
 * Take Away Town — take blocks away; break a hundred into tens or a ten into ones when you need more.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { Blocks3, fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
const LEARN = [[468, 235], [352, 127], [600, 243], [745, 368], [530, 176]];

export const TakeAwayTown: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L8-01', chapter: 8, titleNp: 'घटाउ सहर (तीन अङ्क)', titleEn: 'Take Away Town (three-digit subtraction)' });
  const [a, setA] = useState(468);
  const [b, setB] = useState(235);
  const [h, setH] = useState(4); const [t, setT] = useState(6); const [o, setO] = useState(8);
  const [rh, setRh] = useState(2); const [rt, setRt] = useState(3); const [ro, setRo] = useState(5);
  const [busy, setBusy] = useState(false);
  const [li, setLi] = useState(0);
  const scene = useRef<Blocks3 | null>(null);
  const doneFor = useRef('');

  useStage(kit.stageRef, (ctx) => {
    const bl = new Blocks3(ctx, { x: -6.5, z: 0, u: 0.34 });
    scene.current = bl; bl.setNumber(468);
    return () => { scene.current = null; bl.dispose(); };
  }, [], { camera: [0, 9, 13.5], target: [0, 1.6, 0], minDistance: 7, maxDistance: 24 });

  const setup = (x: number, y: number) => {
    setA(x); setB(y); setH(Math.floor(x / 100)); setT(Math.floor((x % 100) / 10)); setO(x % 10);
    setRh(Math.floor(y / 100)); setRt(Math.floor((y % 100) / 10)); setRo(y % 10); setBusy(false); doneFor.current = '';
    scene.current?.setNumber(x);
  };
  const complete = rh === 0 && rt === 0 && ro === 0;
  useEffect(() => { if (complete && kit.mode !== 'CHALLENGE' && doneFor.current !== `${a}-${b}`) { doneFor.current = `${a}-${b}`; kit.good(`${a} − ${b} = ${h * 100 + t * 10 + o}`, `${a} − ${b} = ${h * 100 + t * 10 + o}`); kit.star(); } /* eslint-disable-next-line */ }, [complete]);

  const takeO = () => {
    if (busy) return;
    if (ro === 0) { kit.oops('एकाइ पहिले नै घटाइसक्यौँ', 'You already took all the ones'); return; }
    if (o === 0) { kit.oops('एकाइ पुगेन! दशक फुकाऔँ 🔨', 'Not enough ones! Break a ten 🔨'); return; }
    scene.current?.removeOne(); setO(o - 1); setRo(ro - 1); kit.tap();
  };
  const takeT = () => {
    if (busy) return;
    if (rt === 0) { kit.oops('दशक पहिले नै घटाइसक्यौँ', 'You already took all the tens'); return; }
    if (t === 0) { kit.oops('दशक पुगेन! सय फुकाऔँ 🔨', 'Not enough tens! Break a hundred 🔨'); return; }
    scene.current?.removeTen(); setT(t - 1); setRt(rt - 1); kit.tap();
  };
  const takeH = () => {
    if (busy) return;
    if (rh === 0) { kit.oops('सय पहिले नै घटाइसक्यौँ', 'You already took all the hundreds'); return; }
    if (h === 0) return;
    scene.current?.removeHundred(); setH(h - 1); setRh(rh - 1); kit.tap();
  };
  const breakT = () => {
    if (busy || !t) return;
    if (o >= ro) { kit.oops('अहिले फुकाउनु पर्दैन', 'No need to break a ten now'); return; }
    setBusy(true); scene.current?.breakTen(() => setBusy(false)); setT(t - 1); setO(o + 10); kit.say('१ दशक फुक्यो — १० एकाइ भयो!', '1 ten broke into 10 ones!');
  };
  const breakH = () => {
    if (busy || !h) return;
    if (t >= rt) { kit.oops('अहिले सय फुकाउनु पर्दैन', 'No need to break a hundred now'); return; }
    setBusy(true); scene.current?.breakHundred(() => setBusy(false)); setH(h - 1); setT(t + 10); kit.say('१ सय फुक्यो — १० दशक भयो!', '1 hundred broke into 10 tens!');
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') { setup(LEARN[li][0], LEARN[li][1]); kit.say(`${LEARN[li][0]} बाट ${LEARN[li][1]} घटाऔँ।`, `Take ${LEARN[li][1]} away from ${LEARN[li][0]}.`); }
    else if (kit.mode === 'PLAY') { const x = rnd(400, 900); setup(x, rnd(110, x - 120 > 480 ? 480 : x - 120)); kit.say('ब्लक हटाउँदै घटाऔँ। नपुगे फुकाऔँ।', 'Take blocks away. Break a ten or a hundred if you need more.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    let x = 0, y = 0;
    for (;;) { x = rnd(300, 950); y = rnd(110, Math.min(x - 100, 480)); const borrow = (x % 10) < (y % 10) || (Math.floor(x / 10) % 10) < (Math.floor(y / 10) % 10); if ((i % 2 === 0) === borrow) continue; if (y < x) break; }
    return { x, y, r: x - y };
  }), []);
  const questions: (QuizQuestion & { x: number; y: number })[] = data.map((d, i) => ({
    np: `${fmt('ne', d.x)} − ${fmt('ne', d.y)} = ?`, en: `${d.x} − ${d.y} = ?`, x: d.x, y: d.y, answer: String(d.r),
    options: numChoices(d.r, i * 19 + 7, [10, -10, 100, 1, -1]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })),
  }));

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 30, fontWeight: 900 }}>{fmt(kit.lang, a)} − {fmt(kit.lang, b)} = <span style={{ color: complete ? '#16a34a' : '#94a3b8' }}>{complete ? fmt(kit.lang, h * 100 + t * 10 + o) : '?'}</span></div>
      {!complete && <div style={{ fontSize: 15, fontWeight: 800, color: '#be123c' }}>{kit.t('अझै घटाउनु पर्ने', 'Still to take')}: {fmt(kit.lang, rh)} {kit.t('सय', 'h')} + {fmt(kit.lang, rt)} {kit.t('दशक', 't')} + {fmt(kit.lang, ro)} {kit.t('एकाइ', 'o')}</div>}
    </div>
  );
  const buttons = (
    <>
      <CBtn color="#fb7185" disabled={busy} onClick={takeH}>−100 🟥</CBtn>
      <CBtn color="#0ea5e9" disabled={busy} onClick={takeT}>−10 🟦</CBtn>
      <CBtn color="#eab308" disabled={busy} onClick={takeO}>−1 🟨</CBtn>
      <CBtn color="#f97316" disabled={busy} onClick={breakT}>🔨 {kit.t('दशक', 'ten')}</CBtn>
      <CBtn color="#dc2626" disabled={busy} onClick={breakH}>🔨 {kit.t('सय', 'hundred')}</CBtn>
    </>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 180 }}>{complete ? `✅ ${a} − ${b} = ${h * 100 + t * 10 + o}` : kit.t('एकाइ, दशक, सय — यही क्रममा', 'Ones, then tens, then hundreds')}</div>
      {buttons}<CBtn color="#16a34a" disabled={!complete} onClick={() => setLi((li + 1) % LEARN.length)}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{buttons}<CBtn color="#8b5cf6" onClick={() => { const x = rnd(400, 900); setup(x, rnd(110, Math.min(x - 120, 480))); }}>🎲</CBtn><CBtn color="#f59e0b" onClick={() => setup(a, b)}>↺</CBtn></Controls>
  ) : (
    <div><QuizPanel kit={kit} questions={questions} onAsk={(q: any) => setup(q.x, q.y)} /><div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>{buttons}</div></div>
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
