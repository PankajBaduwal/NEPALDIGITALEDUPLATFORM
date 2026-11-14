/**
 * Lesson 1 · Time 1 (समय १) — hour and minute
 * Minute Clock — read any time on a big clock: o'clock, half past, quarter past, quarter to and every minute in between.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { clockModel, mat, shadowed } from '../class1-math-kit/models';
import { enName, npName, shuffle, rnd } from '../class1-math-kit/nepali';
import { fmt } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
const nxt = (h: number) => (h % 12) + 1;
const phrase = (h: number, m: number, lang: 'ne' | 'en') => {
  const h2 = h % 12 || 12;
  if (lang === 'en') return m === 0 ? `${enName(h2)} o'clock` : m === 15 ? `quarter past ${enName(h2)}` : m === 30 ? `half past ${enName(h2)}` : m === 45 ? `quarter to ${enName(nxt(h2))}` : `${m} minutes past ${enName(h2)}`;
  return m === 0 ? `${npName(h2)} बजे` : m === 15 ? `सवा ${npName(h2)}` : m === 30 ? `साढे ${npName(h2)}` : m === 45 ? `पौने ${npName(nxt(h2))}` : `${npName(h2)} बजेर ${fmt('ne', m)} मिनेट`;
};
const STEPS: [number, number][] = [[10, 0], [3, 30], [7, 15], [5, 45], [11, 24], [2, 50], [8, 7]];

export const ClockMinutes: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L1-01', chapter: 1, titleNp: 'मिनेट घडी (समय १)', titleEn: 'Minute Clock (Time 1)' });
  const [h, setH] = useState(10);
  const [m, setM] = useState(0);
  const [li, setLi] = useState(0);
  const scene = useRef<{ setTime: (h: number, m: number, animate?: boolean) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const clock = clockModel(3.2); clock.group.position.set(0, 4.4, 0); ctx.scene.add(clock.group);
    const stand = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.9, 1.3, 14), mat('#f97316', 0.5))); stand.position.set(0, 0.65, 0); ctx.scene.add(stand);
    let cur = 10 * 60;
    const setTime = (hh: number, mm: number, animate = true) => {
      const to = (hh % 12) * 60 + mm; let d = to - (cur % 720); if (d < -360) d += 720; if (d > 360) d -= 720; const from = cur;
      const run = (k: number) => { const v = ((from + d * k) % 720 + 720) % 720; clock.setTime(Math.floor(v / 60) || 12, v % 60); };
      if (animate) ctx.tween(800, run, () => { cur = to; }, ease.inOut); else { run(1); cur = to; }
    };
    scene.current = { setTime }; setTime(10, 0, false);
    return () => { scene.current = null; };
  }, [], { camera: [0, 5, 13], target: [0, 4.4, 0], minDistance: 7, maxDistance: 20, ground: 0xd9f99d });

  const update = (hh: number, mm: number, speak = true) => { const H = ((hh - 1 + 12) % 12) + 1, M = ((mm % 60) + 60) % 60; setH(H); setM(M); scene.current?.setTime(H, M); if (speak) kit.say(phrase(H, M, 'ne'), phrase(H, M, 'en')); };
  const bump = (dm: number) => { const t = (h % 12) * 60 + m + dm; const tt = ((t % 720) + 720) % 720; update(Math.floor(tt / 60) || 12, tt % 60); };

  useEffect(() => {
    if (kit.mode === 'LEARN') { const [a, b] = STEPS[li % STEPS.length]; update(a, b); } else if (kit.mode === 'PLAY') update(h, m, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, () => ({ h: rnd(1, 12), m: [0, 15, 30, 45, rnd(1, 59), rnd(1, 59)][rnd(0, 5)] })), []);
  const questions: (QuizQuestion & { h: number; m: number })[] = data.map((d, i) => {
    const key = (hh: number, mm: number) => `${hh}:${mm}`;
    const wrong = new Set<string>(); let g = 0; while (wrong.size < 2 && g++ < 80) { const w = key(rnd(0, 1) ? d.h : rnd(1, 12), rnd(0, 1) ? d.m : rnd(0, 59)); if (w !== key(d.h, d.m)) wrong.add(w); }
    return { np: 'घडीमा कति बजेको छ?', en: 'What time does the clock show?', h: d.h, m: d.m, answer: key(d.h, d.m), options: shuffle([key(d.h, d.m), ...Array.from(wrong)], i * 11 + 3).map((k) => { const [hh, mm] = k.split(':').map(Number); return { key: k, label: `${fmt(kit.lang, hh)}:${fmt(kit.lang, String(mm).padStart(2, '0'))}` }; }) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 34, fontWeight: 900 }}>{fmt(kit.lang, h)}:{fmt(kit.lang, String(m).padStart(2, '0'))}</div>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{phrase(h, m, kit.lang)}</div>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>{kit.t('छोटो सुई = घण्टा · ठूलो सुई = मिनेट', 'short hand = hour · long hand = minutes')}</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('ठूलो सुईले एक पटक घुम्दा ६० मिनेट = १ घण्टा', 'One full turn of the long hand = 60 minutes = 1 hour')}</div><CBtn color="#16a34a" onClick={() => { kit.star(); setLi(li + 1); }}>{kit.t('अर्को', 'Next')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>
      <CBtn color="#f59e0b" onClick={() => bump(-60)}>−1 {kit.t('घण्टा', 'hr')}</CBtn><CBtn color="#f59e0b" onClick={() => bump(60)}>+1 {kit.t('घण्टा', 'hr')}</CBtn>
      <CBtn color="#8b5cf6" onClick={() => bump(-5)}>−5 {kit.t('मि', 'min')}</CBtn><CBtn color="#8b5cf6" onClick={() => bump(5)}>+5 {kit.t('मि', 'min')}</CBtn>
      <CBtn color="#0ea5e9" onClick={() => bump(-1)}>−1</CBtn><CBtn color="#0ea5e9" onClick={() => bump(1)}>+1</CBtn>
      {[0, 15, 30, 45].map((mm) => <CBtn key={mm} color="#94a3b8" style={{ minWidth: 52 }} onClick={() => update(h, mm)}>:{String(mm).padStart(2, '0')}</CBtn>)}
    </Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => update(q.h, q.m, false)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
