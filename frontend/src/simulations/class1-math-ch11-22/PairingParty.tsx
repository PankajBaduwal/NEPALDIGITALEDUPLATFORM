/**
 * Chapter 12 · Odd and Even numbers (जोर र बिजोर सङ्ख्या)
 * Pairing Party — balls line up in two columns; make pairs. No one left alone = even, one left alone = odd.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, QuizPanel, Controls, CBtn, useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { ball, mat, shadowed, textSprite, PALETTE } from '../class1-math-kit/models';
import { enName, npName, toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const LEARN_NUMS = [6, 7, 10, 13, 16, 19];

export const PairingParty: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH12-01', chapter: 12, titleNp: 'जोडी बनाऔँ (जोर र बिजोर)', titleEn: 'Pairing Party (Odd and Even)' });
  const [n, setN] = useState(7);
  const [paired, setPaired] = useState(false);
  const [li, setLi] = useState(0);
  const scene = useRef<{ set: (n: number) => void; pair: () => void } | null>(null);
  const live = useRef({ onPaired: () => {} });
  live.current.onPaired = () => setPaired(true);

  useStage(kit.stageRef, (ctx) => {
    const stage = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.9, 0.4, 48), mat('#fde68a', 0.8)));
    stage.position.y = 0.2; ctx.scene.add(stage);
    const group = new THREE.Group(); group.position.y = 0.4; ctx.scene.add(group);
    let balls: THREE.Object3D[] = [];
    let extras: THREE.Object3D[] = [];
    const slot = (i: number, total: number) => {
      const rows = Math.ceil(total / 2);
      return new THREE.Vector3(i % 2 === 0 ? -1.9 : 1.9, 0.6, (Math.floor(i / 2) - (rows - 1) / 2) * 1.25);
    };
    const set = (num: number) => {
      [...balls, ...extras].forEach((o) => group.remove(o));
      balls = []; extras = [];
      for (let i = 0; i < num; i++) {
        const b = ball(PALETTE[Math.floor(i / 2) % PALETTE.length], 0.55);
        b.position.copy(slot(i, num)); b.userData.home = b.position.clone(); b.userData.i = i;
        group.add(b); balls.push(b);
      }
    };
    const pair = () => {
      const num = balls.length;
      const pairs = Math.floor(num / 2);
      for (let p = 0; p < pairs; p++) {
        const a = balls[p * 2], b = balls[p * 2 + 1];
        const z = a.userData.home.z;
        ctx.tween(700, (k) => { a.position.x = -1.9 + 1.3 * k; b.position.x = 1.9 - 1.3 * k; a.position.y = 0.6 + Math.sin(k * Math.PI) * 0.7; b.position.y = a.position.y; }, () => {
          const ribbon = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 8), mat('#ec4899', 0.4)));
          ribbon.rotation.z = Math.PI / 2; ribbon.position.set(0, 0.5, z); group.add(ribbon); extras.push(ribbon);
        }, ease.inOut);
      }
      window.setTimeout(() => {
        if (num % 2 === 1) {
          const lone = balls[num - 1];
          const sad = textSprite('😢', 1.2, { px: 90, w: 128, h: 128 }); sad.position.set(0, 1.4, 0); lone.add(sad); extras.push(sad);
          ctx.tween(900, (k) => lone.scale.setScalar(1 + Math.sin(k * Math.PI * 4) * 0.18));
        } else { balls.forEach((b) => ctx.tween(500, (k) => b.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.2))); }
        live.current.onPaired();
      }, 900);
    };
    scene.current = { set, pair };
    set(7);
    ctx.onFrame((_dt, time) => { group.rotation.y = Math.sin(time * 0.3) * 0.08; });
    return () => { scene.current = null; };
  }, [], { camera: [0, 10, 9], target: [0, 0.5, 0], minDistance: 6, maxDistance: 22 });

  const apply = (num: number) => { setN(num); setPaired(false); scene.current?.set(num); };
  useEffect(() => {
    if (kit.mode === 'LEARN') { apply(LEARN_NUMS[li]); kit.say(`${npName(LEARN_NUMS[li])} वटा बल छन्। जोडी बनाउन सकिन्छ?`, `There are ${LEARN_NUMS[li]} balls. Can we make pairs?`); }
    else if (kit.mode === 'PLAY') { apply(n); kit.say('सङ्ख्या रोजौँ र जोडी बनाऔँ।', 'Pick a number and make pairs.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const doPair = () => {
    if (paired) return;
    scene.current?.pair();
    window.setTimeout(() => {
      kit.tap();
      if (n % 2 === 0) kit.say(`कोही एक्लो भएन। ${npName(n)} जोर सङ्ख्या हो।`, `Nobody is alone. ${enName(n)} is an even number.`);
      else kit.say(`एउटा एक्लो भयो। ${npName(n)} बिजोर सङ्ख्या हो।`, `One is left alone. ${enName(n)} is an odd number.`);
    }, 950);
  };

  const data = useMemo(() => shuffle(Array.from({ length: 20 }, (_, i) => i + 1)).slice(0, 8), []);
  const questions: (QuizQuestion & { num: number })[] = data.map((v) => ({
    np: `${toNp(v)} जोर हो कि बिजोर?`, en: `Is ${v} odd or even?`, num: v, answer: v % 2 === 0 ? 'even' : 'odd',
    options: [{ key: 'even', label: kit.t('जोर 👯', 'Even 👯') }, { key: 'odd', label: kit.t('बिजोर 🧍', 'Odd 🧍') }],
  }));

  const num = (v: number) => (kit.lang === 'ne' ? toNp(v) : String(v));
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 40, fontWeight: 900 }}>{num(n)}</div>
      {paired && <div style={{ fontSize: 20, fontWeight: 900, color: n % 2 ? '#ea580c' : '#16a34a' }}>{n % 2 ? kit.t('बिजोर (Odd)', 'Odd') : kit.t('जोर (Even)', 'Even')}</div>}
    </div>
  );

  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 18, flex: 1, minWidth: 200 }}>{kit.t(`${npName(n)} वटा बल — जोडी बनाऔँ`, `${n} balls — let's make pairs`)}</div>
      <CBtn color="#ec4899" disabled={paired} onClick={doPair}>🎀 {kit.t('जोडी बनाऔँ', 'Make pairs')}</CBtn>
      <CBtn color="#16a34a" disabled={!paired} onClick={() => { kit.star(); setLi((li + 1) % LEARN_NUMS.length); }}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      {Array.from({ length: 20 }, (_, i) => i + 1).map((v) => (
        <CBtn key={v} color={v === n ? '#0ea5e9' : v % 2 ? '#fb923c' : '#4ade80'} style={{ minWidth: 44, padding: '6px 8px', minHeight: 44, fontSize: 16 }} onClick={() => apply(v)}>{num(v)}</CBtn>
      ))}
      <CBtn color="#ec4899" disabled={paired} onClick={doPair}>🎀 {kit.t('जोडी', 'Pairs')}</CBtn>
    </Controls>
  ) : (
    <div>
      <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.num)} />
      <div style={{ marginTop: 8 }}><CBtn color="#ec4899" disabled={paired} onClick={doPair} style={{ minHeight: 44, padding: '6px 14px', fontSize: 15 }}>🎀 {kit.t('सहयोग: जोडी बनाऔँ', 'Hint: make pairs')}</CBtn></div>
    </div>
  );

  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
