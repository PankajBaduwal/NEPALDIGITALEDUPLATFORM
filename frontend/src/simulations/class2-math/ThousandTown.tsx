/**
 * Lesson 3 · Numbers up to 1000 (१००० सम्मका सङ्ख्या)
 * Thousand Town — build any number to 999 with hundred flats, ten towers and one cubes.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { Blocks3, fmt, enName1000, npBig } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

export const ThousandTown: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L3-01', chapter: 3, titleNp: 'हजार सहर (१००० सम्मका सङ्ख्या)', titleEn: 'Thousand Town (Numbers up to 1000)' });
  const [h, setH] = useState(3);
  const [t, setT] = useState(4);
  const [o, setO] = useState(5);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => rnd(101, 999));
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const scene = useRef<Blocks3 | null>(null);
  const val = h * 100 + t * 10 + o;
  const n = (v: number) => fmt(kit.lang, v);

  useStage(kit.stageRef, (ctx) => {
    const b = new Blocks3(ctx, { x: -6.5, z: 0.5, u: 0.34 });
    scene.current = b; b.setNumber(345);
    return () => { scene.current = null; b.dispose(); };
  }, [], { camera: [0, 9, 13], target: [0, 1.6, 0], minDistance: 7, maxDistance: 24 });

  const rebuild = (hh: number, tt: number, oo: number) => { setH(hh); setT(tt); setO(oo); scene.current?.set(hh, tt, oo); };
  const say = () => kit.say(`${npBig(val)} — ${h} सय, ${t} दशक, ${o} एकाइ`, `${enName1000(val)} — ${h} hundreds, ${t} tens, ${o} ones`);

  const addH = () => { if (busy) return; if (h >= 9) { kit.oops('९९९ भन्दा बढी हुँदैन', 'Stay below 1000'); return; } scene.current?.addHundred(); setH(h + 1); kit.tap(); };
  const addT = () => {
    if (busy) return; kit.tap(); scene.current?.addTen();
    if (t === 9) { if (h >= 9) { scene.current?.removeTen(); kit.oops('९९९ भन्दा बढी हुँदैन', 'Stay below 1000'); return; } setBusy(true); window.setTimeout(() => scene.current?.bundleTens(() => setBusy(false)), 350); kit.say('१० दशक मिलेर १ सय बन्यो!', '10 tens make 1 hundred!'); setT(0); setH(h + 1); } else setT(t + 1);
  };
  const addO = () => {
    if (busy) return; kit.tap(); scene.current?.addOne();
    if (o === 9) {
      if (t === 9 && h >= 9) { scene.current?.removeOne(); kit.oops('९९९ भन्दा बढी हुँदैन', 'Stay below 1000'); return; }
      setBusy(true); kit.say('१० एकाइ मिलेर १ दशक बन्यो!', '10 ones make 1 ten!');
      window.setTimeout(() => scene.current?.bundleOnes(() => {
        if (t === 9) scene.current?.bundleTens(() => setBusy(false)); else setBusy(false);
      }), 350);
      setO(0); if (t === 9) { setT(0); setH(h + 1); } else setT(t + 1);
    } else setO(o + 1);
  };
  const delH = () => { if (busy || !h) return; scene.current?.removeHundred(); setH(h - 1); kit.tap(); };
  const delT = () => {
    if (busy) return;
    if (t > 0) { scene.current?.removeTen(); setT(t - 1); kit.tap(); return; }
    if (h > 0) { setBusy(true); scene.current?.breakHundred(() => { scene.current?.removeTen(); setBusy(false); }); setH(h - 1); setT(9); kit.say('१ सय फुकेर १० दशक भयो', '1 hundred broke into 10 tens'); }
  };
  const delO = () => {
    if (busy) return;
    if (o > 0) { scene.current?.removeOne(); setO(o - 1); kit.tap(); return; }
    if (t > 0) { setBusy(true); scene.current?.breakTen(() => { scene.current?.removeOne(); setBusy(false); }); setT(t - 1); setO(9); return; }
    if (h > 0) { setBusy(true); scene.current?.breakHundred(() => scene.current?.breakTen(() => { scene.current?.removeOne(); setBusy(false); })); setH(h - 1); setT(9); setO(9); }
  };

  const newRound = (r: number, reset = false) => {
    const tg = rnd(101, 999); setTarget(tg); rebuild(0, 0, 0); setRound(r);
    if (reset) { setScore(0); setFinished(false); }
    kit.say(`${npBig(tg)} बनाऔँ।`, `Build ${enName1000(tg)} (${tg}).`);
  };
  useEffect(() => {
    if (kit.mode === 'LEARN') { rebuild(0, 0, 0); setStep(0); kit.say('सय–सयका फ्ल्याट थपेर गनौँ। +१०० थिचौँ।', 'Let us count in hundreds. Press +100.'); }
    else if (kit.mode === 'PLAY') { rebuild(3, 4, 5); kit.say('मनपरेको सङ्ख्या बनाऔँ।', 'Build any number you like.'); }
    else newRound(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const learnHundred = () => {
    if (step >= 9) return;
    scene.current?.addHundred(); setH(step + 1); setStep(step + 1); kit.tap();
    const v = (step + 1) * 100;
    kit.say(`${npBig(v)} · ${v}`, `${enName1000(v)} · ${v}`);
    if (step + 1 === 9) { kit.good('९०० भयो! अब १ सय थप्यो भने १०००', '900! One more hundred makes 1000'); kit.star(); }
  };
  const check = () => {
    if (val === target) {
      kit.good(); kit.star(); const ns = score + 1; setScore(ns);
      window.setTimeout(() => { if (round + 1 >= 5) { setFinished(true); kit.finish(ns, 5); } else newRound(round + 1); }, 1100);
    } else kit.oops(`तिमीले ${npBig(val)} बनायौ`, `You made ${val}. We need ${target}.`);
  };

  const pad = (
    <>
      <CBtn color="#fb7185" disabled={busy} onClick={addH}>+100 🟥</CBtn><CBtn color="#94a3b8" disabled={busy} onClick={delH}>−100</CBtn>
      <CBtn color="#0ea5e9" disabled={busy} onClick={addT}>+10 🟦</CBtn><CBtn color="#94a3b8" disabled={busy} onClick={delT}>−10</CBtn>
      <CBtn color="#eab308" disabled={busy} onClick={addO}>+1 🟨</CBtn><CBtn color="#94a3b8" disabled={busy} onClick={delO}>−1</CBtn>
      <CBtn color="#f59e0b" onClick={() => rebuild(0, 0, 0)}>↺</CBtn>
    </>
  );
  const hud = (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      {kit.mode === 'CHALLENGE' ? <div style={{ fontSize: 30, fontWeight: 900 }}>{kit.t('बनाऔँ', 'Build')}: {n(target)}</div> : <>
        <div style={{ fontSize: 40, fontWeight: 900 }}>{n(val)}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0369a1' }}>{n(h)} {kit.t('सय', 'hundreds')} + {n(t)} {kit.t('दशक', 'tens')} + {n(o)} {kit.t('एकाइ', 'ones')}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>{kit.lang === 'ne' ? npBig(val) : enName1000(val)}</div>
      </>}
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{step < 9 ? kit.t('१ सय = १० दशक = १०० एकाइ', '1 hundred = 10 tens = 100 ones') : '🎉 ९०० !'}</div>
      <CBtn color="#fb7185" disabled={step >= 9} onClick={learnHundred}>+100 🟥</CBtn>
      <CBtn color="#f59e0b" onClick={() => { rebuild(0, 0, 0); setStep(0); }}>↺</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{pad}<CBtn color="#16a34a" onClick={say}>🔊</CBtn></Controls>
  ) : finished ? (
    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 900 }}>🏆 {kit.t(`५ मध्ये ${fmt('ne', score)} सही!`, `${score} of 5 correct!`)}</div><CBtn color="#0ea5e9" onClick={() => newRound(0, true)}>↺ {kit.t('फेरि खेलौँ', 'Play again')}</CBtn></div>
  ) : (
    <Controls><div style={{ fontWeight: 800, minWidth: 120 }}>{kit.t('प्रश्न', 'Round')} {n(round + 1)}/{n(5)}</div>{pad}<CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn></Controls>
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
