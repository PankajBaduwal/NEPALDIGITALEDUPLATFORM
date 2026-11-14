/**
 * Lesson 14 · Multiplication (गुणन)
 * Multiplication Trays — equal trays of tens-rods and ones-cubes; multiply a two-digit number by a one-digit number, ones first then tens.
 * Times-Table Wall — a 10 × 10 wall of cubes; pick rows and columns to see any table fact.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, cube, tenRod } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

export const MultTrays: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L14-01', chapter: 14, titleNp: 'गुणन ट्रे', titleEn: 'Multiplication Trays' });
  const [a, setA] = useState(23);
  const [b, setB] = useState(4);
  const [step, setStep] = useState(0);
  const scene = useRef<{ set: (a: number, b: number, hi: number) => void } | null>(null);
  const t = Math.floor(a / 10), o = a % 10;

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const set = (aa: number, bb: number, hi: number) => {
      g.clear(); const tt = Math.floor(aa / 10), oo = aa % 10;
      for (let k = 0; k < bb; k++) {
        const tray = shadowed(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 4.6), mat('#fcd34d', 0.7))); tray.position.set((k - (bb - 1) / 2) * 3.7, 0.1, 0); g.add(tray);
        for (let i = 0; i < tt; i++) { const r = tenRod(hi === 2 || hi === 3 ? '#fb923c' : '#38bdf8'); r.position.set((k - (bb - 1) / 2) * 3.7 - 1.1 + (i % 3) * 0.6, 0.2, -1.4 + Math.floor(i / 3) * 0.0); r.rotation.y = Math.PI / 2; r.position.z = -1.5 + i * 0.5; r.position.x = (k - (bb - 1) / 2) * 3.7 - 0.6; g.add(r); }
        for (let i = 0; i < oo; i++) { const c = cube(hi === 1 || hi === 3 ? '#f87171' : '#facc15', 0.46); c.position.set((k - (bb - 1) / 2) * 3.7 + 0.8 + (i % 2) * 0.55, 0.45, -1.6 + Math.floor(i / 2) * 0.55); g.add(c); }
        g.scale.setScalar(1); const grp = tray; grp.scale.y = 0.01; ctx.tween(260 + k * 60, (q) => { grp.scale.y = Math.max(0.01, q); }, undefined, ease.back);
      }
    };
    scene.current = { set }; set(23, 4, 0);
    return () => { scene.current = null; };
  }, [], { camera: [0, 9, 12], target: [0, 0.6, 0], minDistance: 7, maxDistance: 24, ground: 0xfef3c7 });

  const apply = (aa: number, bb: number, s = 0) => { setA(aa); setB(bb); setStep(s); scene.current?.set(aa, bb, s); };
  const SAY = (aa: number, bb: number, s: number) => { const oo = aa % 10, tt = Math.floor(aa / 10); return s === 1 ? [`एकाइ: ${oo} × ${bb} = ${oo * bb}`, `Ones: ${oo} × ${bb} = ${oo * bb}`] : s === 2 ? [`दशक: ${tt} × ${bb} = ${tt * bb} दशक = ${tt * bb * 10}`, `Tens: ${tt} × ${bb} = ${tt * bb} tens = ${tt * bb * 10}`] : [`जोडौँ: ${tt * bb * 10} + ${oo * bb} = ${aa * bb}`, `Add: ${tt * bb * 10} + ${oo * bb} = ${aa * bb}`]; };
  const next = () => { const s = step >= 3 ? 1 : step + 1; setStep(s); scene.current?.set(a, b, s); const m = SAY(a, b, s); kit.say(m[0], m[1]); if (s === 3) kit.star(); };
  const fresh = () => apply(rnd(11, 49), rnd(2, 6), 0);
  useEffect(() => { if (kit.mode !== 'CHALLENGE') fresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 8 }, () => ({ a: rnd(11, 49), b: rnd(2, 6) })), []);
  const questions: (QuizQuestion & { q: { a: number; b: number } })[] = data.map((q, i) => ({ q, np: `${q.a} × ${q.b} = ?`, en: `${q.a} × ${q.b} = ?`, answer: String(q.a * q.b), options: near(q.a * q.b, i + 2, [q.b, -q.b, 10, -10, 1, -1]).map((x) => ({ key: String(x), label: fmt(kit.lang, x) })) }));

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #f59e0b', textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{fmt(kit.lang, a)} × {fmt(kit.lang, b)} = {step === 3 ? fmt(kit.lang, a * b) : '?'}</div>
      <div style={{ fontSize: 14, fontWeight: 800 }}>{step ? kit.t(SAY(a, b, step)[0], SAY(a, b, step)[1]) : kit.t(`${b} ट्रे, हरेकमा ${a}`, `${b} trays with ${a} in each`)}</div>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{t} {kit.t('दशक', 'tens')} · {o} {kit.t('एकाइ', 'ones')}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('पहिले एकाइ, पछि दशक गुणा गरेर जोडौँ', 'Multiply the ones, then the tens, then add')}</div><CBtn color="#16a34a" onClick={next}>{kit.t('चरण', 'Step')} ➜</CBtn><CBtn color="#8b5cf6" onClick={fresh}>🎲</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><CBtn color="#f59e0b" onClick={() => a > 11 && apply(a - 1, b)}>{kit.t('सङ्ख्या', 'Number')} −</CBtn><CBtn color="#f59e0b" onClick={() => a < 49 && apply(a + 1, b)}>{kit.t('सङ्ख्या', 'Number')} +</CBtn><CBtn color="#0ea5e9" onClick={() => b > 2 && apply(a, b - 1)}>{kit.t('ट्रे', 'Trays')} −</CBtn><CBtn color="#0ea5e9" onClick={() => b < 6 && apply(a, b + 1)}>{kit.t('ट्रे', 'Trays')} +</CBtn><CBtn color="#16a34a" onClick={next}>{kit.t('चरण', 'Step')} ➜</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.q.a, q.q.b, 0)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};

export const TimesWall: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L14-02', chapter: 14, titleNp: 'पहाडा पर्खाल', titleEn: 'Times-Table Wall' });
  const [r, setR] = useState(3);
  const [c, setC] = useState(4);
  const [li, setLi] = useState(2);
  const scene = useRef<{ mark: (r: number, c: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const cubes: THREE.Mesh[] = [];
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) { const m = cube('#cbd5e1', 0.9) as unknown as THREE.Mesh; m.position.set((x - 4.5) * 1.0, 0.5 + y * 1.0, 0); m.userData = { x: x + 1, y: y + 1 }; ctx.scene.add(m); cubes.push(m); }
    const mark = (rr: number, cc: number) => cubes.forEach((m) => { const on = m.userData.x <= cc && m.userData.y <= rr; (m.material as THREE.MeshStandardMaterial).color.set(on ? (m.userData.y % 2 ? '#f97316' : '#0ea5e9') : '#e2e8f0'); m.scale.setScalar(on ? 0.95 : 0.7); });
    scene.current = { mark }; mark(3, 4);
    return () => { scene.current = null; };
  }, [], { camera: [0, 6, 18], target: [0, 5, 0], minDistance: 9, maxDistance: 30, ground: 0xeef2ff });

  const apply = (rr: number, cc: number, speak = false) => { setR(rr); setC(cc); scene.current?.mark(rr, cc); if (speak) kit.say(`${rr} × ${cc} = ${rr * cc}`, `${rr} rows of ${cc} = ${rr * cc}`); };
  useEffect(() => { if (kit.mode === 'LEARN') apply(li, 5, true); else if (kit.mode === 'PLAY') apply(r, c); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, () => ({ r: rnd(2, 10), c: rnd(2, 10) })), []);
  const questions: (QuizQuestion & { q: { r: number; c: number } })[] = data.map((q, i) => ({ q, np: `${q.r} × ${q.c} = ?`, en: `${q.r} × ${q.c} = ?`, answer: String(q.r * q.c), options: near(q.r * q.c, i + 3, [q.r, -q.r, q.c, -q.c, 1, -1]).map((x) => ({ key: String(x), label: fmt(kit.lang, x) })) }));

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #6366f1', textAlign: 'center' }}>
      <div style={{ fontSize: 30, fontWeight: 900 }}>{fmt(kit.lang, r)} × {fmt(kit.lang, c)} = {fmt(kit.lang, r * c)}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{kit.t(`${c} + `.repeat(Math.min(r, 4)) + (r > 4 ? '…' : ''), '')}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('हरेक पङ्क्तिमा ५ घन — पङ्क्ति थप्दा ५ को पहाडा', 'Every row has 5 cubes — add a row to count by 5')}</div><CBtn color="#16a34a" onClick={() => { kit.star(); setLi((li % 10) + 1); }}>{kit.t('अर्को पङ्क्ति', 'Next row')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls><CBtn color="#f59e0b" onClick={() => r > 1 && apply(r - 1, c, true)}>{kit.t('पङ्क्ति', 'Rows')} −</CBtn><CBtn color="#f59e0b" onClick={() => r < 10 && apply(r + 1, c, true)}>{kit.t('पङ्क्ति', 'Rows')} +</CBtn><CBtn color="#0ea5e9" onClick={() => c > 1 && apply(r, c - 1, true)}>{kit.t('स्तम्भ', 'Cols')} −</CBtn><CBtn color="#0ea5e9" onClick={() => c < 10 && apply(r, c + 1, true)}>{kit.t('स्तम्भ', 'Cols')} +</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => apply(q.q.r, q.q.c)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
