/**
 * Lesson 5 · Odd and even numbers (जोर र बिजोर सङ्ख्या)
 * Odd-Even Machine — numbered crates ride a belt; look at the last digit and send each to the Even or the Odd bin.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite, textPlane } from '../class1-math-kit/models';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

export const OddEvenMachine: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L5-01', chapter: 5, titleNp: 'जोर–बिजोर मेसिन', titleEn: 'Odd-Even Machine' });
  const [n, setN] = useState(37);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [done, setDone] = useState(0);
  const [lock, setLock] = useState(false);
  const scene = useRef<{ crate: (n: number) => void; send: (even: boolean, ok: boolean, then: () => void) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const belt = shadowed(new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 3.2), mat('#475569', 0.8))); belt.position.y = 0.2; ctx.scene.add(belt);
    for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 3.2), new THREE.MeshBasicMaterial({ color: 0x94a3b8 })); s.position.set(-8 + i * 1.25, 0.42, 0); ctx.scene.add(s); }
    const bin = (x: number, color: string, text: string) => {
      const g = new THREE.Group(); g.position.set(x, 0, 4.2);
      const b = shadowed(new THREE.Mesh(new THREE.BoxGeometry(4.6, 2, 3), mat(color, 0.6))); b.position.y = 1; g.add(b);
      const top = textSprite(text, 3.2, { px: 70, w: 256, h: 128, bg: '#ffffff', border: color }); top.position.set(0, 3, 0); g.add(top);
      ctx.scene.add(g); return g;
    };
    bin(-5.2, '#16a34a', '👯 Even · जोर'); bin(5.2, '#f97316', '🧍 Odd · बिजोर');
    const crate = new THREE.Group(); ctx.scene.add(crate);
    let numberText: THREE.Object3D | null = null;
    const make = (v: number) => {
      [...crate.children].forEach((c) => crate.remove(c));
      const box = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 2.6), mat('#fcd34d', 0.5))); box.position.y = 1.5; crate.add(box);
      const s = String(v); const head = s.slice(0, -1); const last = s.slice(-1);
      const lab = textSprite(`${head}${last}`, 2.4, { px: 110, w: 256, h: 160, color: '#1e293b' });
      lab.position.set(0, 1.6, 1.5); crate.add(lab); numberText = lab;
      const cm = document.createElement('canvas'); cm.width = 256; cm.height = 160; const g = cm.getContext('2d')!;
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 110px sans-serif';
      const wHead = g.measureText(head).width, wLast = g.measureText(last).width; const x0 = 128 - (wHead + wLast) / 2;
      g.fillStyle = '#1e293b'; g.textAlign = 'left'; g.fillText(head, x0, 84); g.fillStyle = '#dc2626'; g.fillText(last, x0 + wHead, 84);
      const m: any = (lab as any).material; m.map?.dispose?.(); const tex = new THREE.CanvasTexture(cm); tex.colorSpace = THREE.SRGBColorSpace; m.map = tex; m.needsUpdate = true;
      crate.position.set(-9, 0.4, 0); crate.rotation.set(0, 0, 0); crate.scale.setScalar(1);
      ctx.tween(650, (k) => { crate.position.x = -9 + 9 * k; }, undefined, ease.out);
    };
    const send = (even: boolean, ok: boolean, then: () => void) => {
      const to = new THREE.Vector3(even ? -5.2 : 5.2, 2.2, 4.2); const p0 = crate.position.clone();
      if (!ok) { ctx.tween(420, (k) => { crate.position.x = p0.x + Math.sin(k * Math.PI * 6) * 0.2; }, then); return; }
      ctx.tween(650, (k) => { crate.position.lerpVectors(p0, to, k); crate.position.y = p0.y + Math.sin(k * Math.PI) * 1.8; crate.scale.setScalar(1 - 0.5 * k); }, then, ease.inOut);
    };
    scene.current = { crate: make, send };
    make(37); void numberText; void textPlane;
    return () => { scene.current = null; };
  }, [], { camera: [0, 7.5, 12.5], target: [0, 1.5, 1], minDistance: 8, maxDistance: 22, sky: 0xe0f2fe, ground: 0xcbd5e1 });

  const nextNum = () => { const v = rnd(10, 99); setN(v); scene.current?.crate(v); setLock(false); };
  const answer = (even: boolean) => {
    if (lock) return; const ok = (n % 2 === 0) === even; setLock(true);
    scene.current?.send(even, ok, () => {
      if (ok) { kit.good(); kit.star(); const s = streak + 1; setStreak(s); setBest((b) => Math.max(b, s)); setDone((d) => d + 1); window.setTimeout(nextNum, 250); }
      else { setStreak(0); kit.oops(`अन्तिम अङ्क ${n % 10} छ — ${n % 2 ? 'बिजोर' : 'जोर'}`, `The last digit is ${n % 10} — ${n % 2 ? 'odd' : 'even'}`); setLock(false); }
    });
  };
  const learnSamples = [14, 27, 30, 48, 55, 61, 72, 89];
  const [li, setLi] = useState(0);
  useEffect(() => {
    setStreak(0); setDone(0); setLock(false);
    if (kit.mode === 'LEARN') { const v = learnSamples[li]; setN(v); scene.current?.crate(v); kit.say('अन्तिम अङ्क हेरौँ: ०, २, ४, ६, ८ भए जोर, १, ३, ५, ७, ९ भए बिजोर।', 'Look at the last digit: 0, 2, 4, 6, 8 is even; 1, 3, 5, 7, 9 is odd.'); }
    else if (kit.mode === 'PLAY') { nextNum(); kit.say('सङ्ख्या हेरी सही डब्बामा पठाऔँ।', 'Look at the number and send it to the right bin.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, () => rnd(11, 99)), []);
  const questions: (QuizQuestion & { v: number })[] = data.map((v) => ({
    np: `${fmt('ne', v)} जोर हो कि बिजोर?`, en: `Is ${v} odd or even?`, v, answer: v % 2 ? 'odd' : 'even',
    options: shuffle([{ key: 'even', label: kit.t('जोर 👯', 'Even 👯') }, { key: 'odd', label: kit.t('बिजोर 🧍', 'Odd 🧍') }], v),
  }));

  const hud = kit.mode === 'PLAY' ? (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', fontWeight: 900, fontSize: 18 }}>🔥 {kit.t('लगातार', 'Streak')}: {fmt(kit.lang, streak)} · ⭐ {kit.t('उत्तम', 'Best')}: {fmt(kit.lang, best)} · ✔ {fmt(kit.lang, done)}</div>
  ) : null;
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 900, fontSize: 18, flex: 1, minWidth: 200 }}>{fmt(kit.lang, n)} → {kit.t('अन्तिम अङ्क', 'last digit')} <span style={{ color: '#dc2626' }}>{fmt(kit.lang, n % 10)}</span> → {n % 2 ? kit.t('बिजोर 🧍', 'Odd 🧍') : kit.t('जोर 👯', 'Even 👯')}</div>
      <CBtn color="#16a34a" onClick={() => { kit.tap(); scene.current?.send(n % 2 === 0, true, () => undefined); window.setTimeout(() => { kit.star(); setLi((li + 1) % learnSamples.length); }, 900); }}>{kit.t('डब्बामा पठाऔँ', 'Send it')}</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      <div style={{ fontWeight: 900, fontSize: 24, minWidth: 70 }}>{fmt(kit.lang, n)}</div>
      <CBtn color="#16a34a" disabled={lock} onClick={() => answer(true)}>👯 {kit.t('जोर', 'Even')}</CBtn>
      <CBtn color="#f97316" disabled={lock} onClick={() => answer(false)}>🧍 {kit.t('बिजोर', 'Odd')}</CBtn>
    </Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { setN(q.v); scene.current?.crate(q.v); }} />
  );
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
