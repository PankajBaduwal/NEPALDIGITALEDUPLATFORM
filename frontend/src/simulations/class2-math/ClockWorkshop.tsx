/**
 * Lesson 2 · Time (समय) — the clock
 * Clock Workshop — o'clock, half past, quarter past and quarter to, on a big 3D clock; set the clock yourself.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { clockModel, Clock3D, mat, shadowed } from '../class1-math-kit/models';
import { enName, npName, toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const MINS = [0, 15, 30, 45];
const phrase = (h: number, m: number, lang: 'ne' | 'en') => {
  const h2 = h % 12 || 12, nx = (h % 12) + 1 > 12 ? 1 : (h % 12) + 1 === 0 ? 12 : (h % 12) + 1;
  if (lang === 'en') return m === 0 ? `${enName(h2)} o'clock` : m === 15 ? `quarter past ${enName(h2)}` : m === 30 ? `half past ${enName(h2)}` : `quarter to ${enName(nx)}`;
  return m === 0 ? `${npName(h2)} बजे` : m === 15 ? `सवा ${npName(h2)}` : m === 30 ? `साढे ${npName(h2)}` : `पौने ${npName(nx)}`;
};

export const ClockWorkshop: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G2-L2-01', chapter: 2, titleNp: 'घडी कार्यशाला (समय)', titleEn: 'Clock Workshop (Telling Time)' });
  const [h, setH] = useState(3);
  const [m, setM] = useState(0);
  const [target, setTarget] = useState<{ h: number; m: number } | null>(null);
  const [li, setLi] = useState(0);
  const scene = useRef<{ setTime: (h: number, m: number, animate?: boolean) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const clock: Clock3D = clockModel(3);
    clock.group.position.set(0, 4.2, 0); ctx.scene.add(clock.group);
    const stand = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.8, 1.2, 14), mat('#f97316', 0.5))); stand.position.set(0, 0.6, 0); ctx.scene.add(stand);
    let cur = { h: 3, m: 0 };
    const setTime = (hh: number, mm: number, animate = true) => {
      const from = cur.h * 60 + cur.m, to = (hh % 12) * 60 + mm; let d = to - from; if (d < -360) d += 720; if (d > 360) d -= 720;
      const run = (k: number) => { const v = ((from + d * k) % 720 + 720) % 720; cur = { h: Math.floor(v / 60), m: v % 60 }; clock.setTime(Math.floor(v / 60) || 12, v % 60); };
      if (animate) ctx.tween(850, run, () => { cur = { h: hh % 12, m: mm }; }, ease.inOut); else { run(1); cur = { h: hh % 12, m: mm }; }
    };
    scene.current = { setTime };
    setTime(3, 0, false);
    return () => { scene.current = null; };
  }, [], { camera: [0, 5, 12.5], target: [0, 4.2, 0], minDistance: 7, maxDistance: 20, ground: 0xd9f99d });

  const update = (hh: number, mm: number, speak = true) => { setH(hh); setM(mm); scene.current?.setTime(hh, mm); if (speak) kit.say(phrase(hh, mm, 'ne'), phrase(hh, mm, 'en')); };
  const nextTarget = () => { const t = { h: rnd(1, 12), m: MINS[rnd(0, 3)] }; setTarget(t); update(12, 0, false); kit.say(`घडीमा ${phrase(t.h, t.m, 'ne')} बनाऔँ।`, `Make the clock show ${phrase(t.h, t.m, 'en')}.`); };
  const check = () => { if (!target) return; if (h % 12 === target.h % 12 && m === target.m) { kit.good(); kit.star(); window.setTimeout(nextTarget, 1200); } else kit.oops('छोटो सुई घण्टा, ठूलो सुई मिनेट हो', 'Short hand = hour, long hand = minutes'); };

  const STEPS: [number, number][] = [[3, 0], [3, 30], [3, 15], [3, 45], [7, 0], [9, 30], [11, 15], [5, 45]];
  useEffect(() => {
    if (kit.mode === 'LEARN') { const [a, b] = STEPS[li % STEPS.length]; update(a, b); }
    else if (kit.mode === 'PLAY') nextTarget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const data = useMemo(() => Array.from({ length: 8 }, () => ({ h: rnd(1, 12), m: MINS[rnd(0, 3)] })), []);
  const questions: (QuizQuestion & { h: number; m: number })[] = data.map((d, i) => {
    const key = (hh: number, mm: number) => `${hh}:${mm}`;
    const wrong = new Set<string>(); let g = 0; while (wrong.size < 2 && g++ < 60) { const w = key(rnd(1, 12), MINS[rnd(0, 3)]); if (w !== key(d.h, d.m)) wrong.add(w); }
    return { np: 'घडीमा कति बजेको छ?', en: 'What time does the clock show?', h: d.h, m: d.m, answer: key(d.h, d.m), options: shuffle([key(d.h, d.m), ...Array.from(wrong)], i * 13 + 2).map((k) => { const [hh, mm] = k.split(':').map(Number); return { key: k, label: phrase(hh, mm, kit.lang) }; }) };
  });

  const hud = (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      {kit.mode === 'PLAY' && target ? <div style={{ fontSize: 20, fontWeight: 900 }}>🎯 {phrase(target.h, target.m, kit.lang)}</div>
        : kit.mode === 'CHALLENGE' ? <div style={{ fontSize: 18, fontWeight: 900 }}>{kit.t('समय पढौँ', 'Read the time')}</div>
        : <><div style={{ fontSize: 34, fontWeight: 900 }}>{h % 12 || 12}:{String(m).padStart(2, '0')}</div><div style={{ fontSize: 16, fontWeight: 800 }}>{phrase(h, m, kit.lang)}</div></>}
    </div>
  );
  const buttons = (
    <>
      <CBtn color="#f59e0b" onClick={() => update((h % 12) + 1, m)}>{kit.t('+१ घण्टा', '+1 hour')}</CBtn>
      <CBtn color="#f59e0b" onClick={() => update(((h + 10) % 12) + 1, m)}>{kit.t('−१ घण्टा', '−1 hour')}</CBtn>
      {MINS.map((mm) => <CBtn key={mm} color={m === mm ? '#8b5cf6' : '#94a3b8'} style={{ minWidth: 56 }} onClick={() => update(h, mm)}>:{String(mm).padStart(2, '0')}</CBtn>)}
    </>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('ठूलो सुई १२ मा = ठीक बजे · ६ मा = साढे · ३ मा = सवा · ९ मा = पौने', 'Long hand on 12 = o\'clock · 6 = half past · 3 = quarter past · 9 = quarter to')}</div>
      <CBtn color="#16a34a" onClick={() => { kit.star(); setLi(li + 1); }}>{kit.t('अर्को', 'Next')} ➜</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{buttons}<CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn><CBtn color="#8b5cf6" onClick={nextTarget}>🎲</CBtn></Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => update(q.h, q.m, false)} />
  );
  void toNp;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
