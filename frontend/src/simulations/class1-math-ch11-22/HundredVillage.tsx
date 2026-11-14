/**
 * Chapter 15 · Numbers from 21 to 100 (२१ देखि १०० सम्मका सङ्ख्या)
 * Hundred Village — build any number with tens towers and one cubes, and watch it light up on the 100 wall.
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit } from '../class1-math-kit/SimKit';
import { cube } from '../class1-math-kit/models';
import { Blocks } from '../class1-math-kit/place';
import { enName, npName, toNp, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const ROW_COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#78716c'];
const COUNT_BY_TENS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export const HundredVillage: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH15-01', chapter: 15, titleNp: 'सय गाउँ (२१ देखि १०० सम्म)', titleEn: 'Hundred Village (Numbers 21 to 100)' });
  const [tens, setTens] = useState(2);
  const [ones, setOnes] = useState(3);
  const [step, setStep] = useState(0);
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => rnd(21, 99));
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const scene = useRef<{ blocks: Blocks; wall: (n: number) => void } | null>(null);
  const val = tens * 10 + ones;

  useStage(kit.stageRef, (ctx) => {
    const blocks = new Blocks(ctx, { x: -5, z: 2.5, tensColor: '#38bdf8', onesColor: '#facc15', u: 0.5 });
    const cubes: THREE.Mesh[] = [];
    const wallG = new THREE.Group(); wallG.position.set(-3.2, 0, -4.5); ctx.scene.add(wallG);
    for (let i = 0; i < 100; i++) {
      const c = cube(ROW_COLORS[Math.floor(i / 10)], 0.52) as THREE.Mesh;
      c.position.set((i % 10) * 0.62, 0.35 + Math.floor(i / 10) * 0.62, 0);
      c.userData.i = i; wallG.add(c); cubes.push(c);
    }
    const wall = (n: number) => cubes.forEach((c, i) => {
      const m = c.material as THREE.MeshStandardMaterial;
      m.transparent = true; m.opacity = i < n ? 1 : 0.14; m.emissive.set(i < n ? ROW_COLORS[Math.floor(i / 10)] : '#000000'); m.emissiveIntensity = i < n ? 0.18 : 0;
    });
    wall(23);
    scene.current = { blocks, wall };
    blocks.setNumber(23);
    return () => { scene.current = null; blocks.dispose(); };
  }, [], { camera: [-1, 10, 13.5], target: [-0.5, 2.2, 0], minDistance: 8, maxDistance: 24 });

  // keep the 3D board matching the numbers
  useEffect(() => { const s = scene.current; if (!s) return; s.wall(val); }, [val]);
  const rebuild = (t: number, o: number) => { setTens(t); setOnes(o); scene.current?.blocks.set(t, o); };
  const addTen = () => { if (tens >= 10 || val >= 100) { kit.oops('१०० भन्दा बढी हुँदैन', 'Not more than 100'); return; } scene.current?.blocks.addTen(); setTens(tens + 1); kit.tap(); };
  const delTen = () => { if (!tens) return; scene.current?.blocks.removeTen(); setTens(tens - 1); kit.tap(); };
  const addOne = () => {
    if (val >= 100) { kit.oops('१०० भन्दा बढी हुँदैन', 'Not more than 100'); return; }
    kit.tap();
    if (ones === 9) { // ten loose cubes make a new ten
      scene.current?.blocks.addOne();
      window.setTimeout(() => { scene.current?.blocks.bundle(); }, 350);
      kit.say('१० वटा एकाइ मिलेर १ दशक बन्यो!', '10 ones make 1 ten!');
      setOnes(0); setTens(tens + 1);
    } else { scene.current?.blocks.addOne(); setOnes(ones + 1); }
  };
  const delOne = () => {
    if (!ones) {
      if (!tens) return;
      scene.current?.blocks.breakTen(); setTens(tens - 1); setOnes(9); scene.current && window.setTimeout(() => scene.current?.blocks.removeOne(), 700);
      return;
    }
    scene.current?.blocks.removeOne(); setOnes(ones - 1); kit.tap();
  };

  const num = (v: number) => (kit.lang === 'ne' ? toNp(v) : String(v));
  const sayNum = () => kit.say(`${toNp(val)} — ${tens} दशक र ${ones} एकाइ`, `${enName(val)} — ${tens} tens and ${ones} ones`);

  useEffect(() => {
    if (kit.mode === 'LEARN') { rebuild(0, 0); setStep(0); kit.say('दश-दशका समूह गनौँ। +१० थिचौँ।', 'Let us count in tens. Press +10.'); }
    else if (kit.mode === 'PLAY') { rebuild(4, 7); kit.say('आफूले मन लागेको सङ्ख्या बनाऔँ।', 'Build any number you like.'); }
    else { newRound(0, true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const learnTen = () => {
    if (step >= 10) return;
    scene.current?.blocks.addTen(); setTens(step + 1); setStep(step + 1); kit.tap();
    const v = (step + 1) * 10;
    kit.say(`${toNp(v)} · ${npName(v)}`, `${v} · ${enName(v)}`);
    if (step + 1 === 10) { kit.good('सय बन्यो! १० दशक = १००', '10 tens = 100!'); kit.star(); }
  };
  const newRound = (r: number, reset = false) => {
    const t = rnd(21, 99);
    setTarget(t); rebuild(0, 0);
    if (reset) { setScore(0); setFinished(false); }
    setRound(r);
    kit.say(`${toNp(t)} बनाऔँ।`, `Build ${enName(t)} (${t}).`);
  };
  const check = () => {
    if (val === target) {
      kit.good(); kit.star();
      const ns = score + 1;
      setScore(ns);
      window.setTimeout(() => { if (round + 1 >= 5) { setFinished(true); kit.finish(ns, 5); } else newRound(round + 1); }, 1100);
    } else {
      kit.oops(`तिमीले ${toNp(val)} बनायौ। ${toNp(target)} चाहिन्छ।`, `You made ${val}. We need ${target}.`);
    }
  };

  const hud = (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      {kit.mode === 'CHALLENGE'
        ? <div style={{ fontSize: 30, fontWeight: 900 }}>{kit.t('बनाऔँ', 'Build')}: {num(target)}</div>
        : <>
          <div style={{ fontSize: 40, fontWeight: 900 }}>{num(val)}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0369a1' }}>{num(tens)} {kit.t('दशक', 'tens')} + {num(ones)} {kit.t('एकाइ', 'ones')}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#64748b', textTransform: 'capitalize' }}>{kit.lang === 'ne' ? npName(val) : enName(val)}</div>
        </>}
    </div>
  );

  const buildPad = (
    <>
      <CBtn color="#0ea5e9" onClick={addTen}>+10 🟦</CBtn>
      <CBtn color="#94a3b8" onClick={delTen}>−10</CBtn>
      <CBtn color="#eab308" onClick={addOne}>+1 🟨</CBtn>
      <CBtn color="#94a3b8" onClick={delOne}>−1</CBtn>
      <CBtn color="#f59e0b" onClick={() => rebuild(0, 0)}>↺</CBtn>
    </>
  );

  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 18, flex: 1, minWidth: 220 }}>{step < 10 ? kit.t('दश दश गरेर १०० सम्म पुगौँ', 'Count by tens up to 100') : kit.t('१० दशक = १००! 🎉', '10 tens = 100! 🎉')}</div>
      <CBtn color="#0ea5e9" disabled={step >= 10} onClick={learnTen}>+10 🟦</CBtn>
      <CBtn color="#f59e0b" onClick={() => { rebuild(0, 0); setStep(0); }}>↺</CBtn>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', width: '100%' }}>
        {COUNT_BY_TENS.map((v, i) => <span key={v} style={{ padding: '2px 10px', borderRadius: 12, fontWeight: 800, background: i < step ? '#bae6fd' : '#f1f5f9', color: i < step ? '#075985' : '#94a3b8' }}>{num(v)}</span>)}
      </div>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{buildPad}<CBtn color="#16a34a" onClick={sayNum}>🔊</CBtn></Controls>
  ) : finished ? (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 900 }}>🏆 {kit.t(`५ मध्ये ${toNp(score)} सही!`, `${score} of 5 correct!`)}</div>
      <CBtn color="#0ea5e9" onClick={() => newRound(0, true)}>↺ {kit.t('फेरि खेलौँ', 'Play again')}</CBtn>
    </div>
  ) : (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, minWidth: 130 }}>{kit.t('प्रश्न', 'Round')} {num(round + 1)}/{num(5)}</div>
      {buildPad}
      <CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn>
    </Controls>
  );

  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
