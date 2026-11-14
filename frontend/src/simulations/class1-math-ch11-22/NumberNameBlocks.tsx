/**
 * Chapter 13 · Number names up to 20 (२० सम्मका सङ्ख्याका नाम)
 * Number Name Blocks — see the amount, see the numeral, then build the number name from letter blocks.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, QuizPanel, Controls, CBtn, useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { ball, mat, shadowed, textPlane, textSprite, retext, PALETTE } from '../class1-math-kit/models';
import { enName, npName, toNp, shuffle } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const TILE = 1.05;

export const NumberNameBlocks: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH13-01', chapter: 13, titleNp: 'सङ्ख्याको नाम बनाऔँ', titleEn: 'Number Name Blocks' });
  const [n, setN] = useState(7);
  const [built, setBuilt] = useState(0);
  const scene = useRef<{ set: (n: number) => void } | null>(null);
  const live = useRef({ onBuilt: (_c: number, _len: number) => {} });
  live.current.onBuilt = (c, len) => { setBuilt(c); if (c === len) { kit.good(); kit.star(); } };

  useStage(kit.stageRef, (ctx) => {
    const floor = shadowed(new THREE.Mesh(new THREE.BoxGeometry(17, 0.3, 9), mat('#fef3c7', 0.9)));
    floor.position.set(0, 0.15, 1); ctx.scene.add(floor);
    const balls = new THREE.Group(); ctx.scene.add(balls);
    const slotsG = new THREE.Group(); ctx.scene.add(slotsG);
    const tilesG = new THREE.Group(); ctx.scene.add(tilesG);
    const big = textSprite('7', 3.2, { px: 150, w: 256, h: 256, bg: '#ffffff', border: '#0ea5e9', radius: 50 });
    big.position.set(-6.5, 3.6, -2); ctx.scene.add(big);
    let word = ''; let next = 0;
    const tile = (ch: string) => {
      const g = new THREE.Group();
      const b = shadowed(new THREE.Mesh(new RoundedBoxGeometry(TILE, 0.3, TILE, 3, 0.1), mat('#fbbf24', 0.4))); g.add(b);
      const p = textPlane(ch, TILE * 0.9, { px: 170, w: 256, h: 256, color: '#78350f' }); p.rotation.x = -Math.PI / 2; p.position.y = 0.17; g.add(p);
      g.userData.isTile = true; g.userData.ch = ch;
      return g;
    };
    const set = (num: number) => {
      [balls, slotsG, tilesG].forEach((g) => [...g.children].forEach((c) => g.remove(c)));
      retext(big, kit.lang === 'ne' ? toNp(num) : String(num), { px: 150, w: 256, h: 256, bg: '#ffffff', border: '#0ea5e9', radius: 50 });
      for (let i = 0; i < num; i++) {
        const b = ball(PALETTE[(i < 10 ? 0 : 4) + (i % 2)], 0.36);
        b.position.set(-3.2 + (i % 10) * 0.85, 0.7 + Math.floor(i / 10) * 0.8, -2.2); balls.add(b);
      }
      word = enName(num).replace('-', '');
      next = 0;
      const w0 = -((word.length - 1) * (TILE + 0.15)) / 2;
      for (let i = 0; i < word.length; i++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(TILE, 0.1, TILE), new THREE.MeshStandardMaterial({ color: '#7dd3fc', transparent: true, opacity: 0.55 }));
        s.position.set(w0 + i * (TILE + 0.15), 0.35, 1.2); slotsG.add(s);
      }
      const letters = shuffle(word.split(''));
      const t0 = -((letters.length - 1) * (TILE + 0.2)) / 2;
      letters.forEach((ch, i) => { const t = tile(ch); t.position.set(t0 + i * (TILE + 0.2), 0.45, 3.4); t.userData.home = t.position.clone(); tilesG.add(t); });
      live.current.onBuilt(0, word.length);
    };
    const place = (t: THREE.Object3D, idx: number) => {
      const target = slotsG.children[idx].position.clone().setY(0.55);
      const p0 = t.position.clone();
      t.userData.placed = true;
      ctx.tween(450, (k) => { t.position.lerpVectors(p0, target, k); t.position.y += Math.sin(k * Math.PI) * 0.9; }, undefined, ease.inOut);
    };
    ctx.onTap(() => tilesG.children, (hit) => {
      if (!hit) return;
      let o: THREE.Object3D | null = hit.object;
      while (o && !o.userData.isTile) o = o.parent;
      if (!o || o.userData.placed) return;
      if (o.userData.ch === word[next]) {
        place(o, next); next += 1; kit.tap(); live.current.onBuilt(next, word.length);
      } else {
        const x0 = o.position.x; kit.oops(`${word[next].toUpperCase()} पहिले चाहिन्छ`, `Look for the letter ${word[next].toUpperCase()}`);
        ctx.tween(350, (k) => { o!.position.x = x0 + Math.sin(k * Math.PI * 6) * 0.15; });
      }
    });
    scene.current = { set };
    set(7);
    ctx.onFrame((_d, t) => { big.position.y = 3.6 + Math.sin(t * 2) * 0.1; });
    return () => { scene.current = null; };
  }, [], { camera: [0, 9, 10.5], target: [0, 0.6, 0.8], minDistance: 7, maxDistance: 20 });

  const apply = (v: number) => { setN(v); setBuilt(0); scene.current?.set(v); };
  useEffect(() => {
    if (kit.mode !== 'CHALLENGE') { apply(n); kit.say(`यो ${npName(n)} हो। अक्षर छोएर अङ्ग्रेजी नाम बनाऔँ।`, `This is ${enName(n)}. Tap the letters in order to build its name.`); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, kit.lang]);

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const v = 1 + Math.floor(Math.random() * 20);
    const kind = i % 2;
    const others = shuffle(Array.from({ length: 20 }, (_, j) => j + 1).filter((x) => x !== v)).slice(0, 2);
    return { v, kind, opts: shuffle([v, ...others]) };
  }), []);
  const questions: (QuizQuestion & { v: number })[] = data.map((d) => d.kind === 0
    ? { np: `यो सङ्ख्याको नाम कुन हो?`, en: 'Which is the name of this number?', v: d.v, answer: String(d.v), options: d.opts.map((o) => ({ key: String(o), label: enName(o) })) }
    : { np: `'${enName(d.v)}' कुन सङ्ख्या हो?`, en: `Which number is '${enName(d.v)}'?`, v: d.v, answer: String(d.v), options: d.opts.map((o) => ({ key: String(o), label: kit.lang === 'ne' ? toNp(o) : String(o) })) });

  const word = enName(n).replace('-', '');
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 34, fontWeight: 900, textTransform: 'capitalize' }}>{built === word.length ? enName(n) : word.slice(0, built).padEnd(word.length, '_').split('').join(' ')}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#64748b' }}>{npName(n)}</div>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { apply(q.v); }} />
  ) : (
    <Controls>
      {kit.mode === 'LEARN' && (
        <>
          <CBtn color="#f59e0b" onClick={() => apply(Math.max(1, n - 1))}>◀</CBtn>
          <div style={{ fontWeight: 900, fontSize: 24, minWidth: 80, textAlign: 'center' }}>{kit.lang === 'ne' ? toNp(n) : n}</div>
          <CBtn color="#f59e0b" onClick={() => apply(Math.min(20, n + 1))}>▶</CBtn>
          <CBtn color="#16a34a" onClick={() => kit.say(`${npName(n)}`, enName(n))}>🔊 {kit.t('नाम सुनौँ', 'Hear the name')}</CBtn>
        </>
      )}
      {kit.mode === 'PLAY' && Array.from({ length: 20 }, (_, i) => i + 1).map((v) => (
        <CBtn key={v} color={v === n ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 44, minHeight: 44, padding: '6px 8px', fontSize: 16 }} onClick={() => apply(v)}>{kit.lang === 'ne' ? toNp(v) : v}</CBtn>
      ))}
      <CBtn color="#ec4899" style={{ minHeight: 44 }} onClick={() => apply(n)}>↺ {kit.t('फेरि', 'Reset')}</CBtn>
    </Controls>
  );

  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
