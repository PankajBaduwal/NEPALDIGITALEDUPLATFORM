/**
 * Chapter 19 · Time (समय) — reading the clock
 * Clock Tower — a big 3D clock; the sun and moon move across the sky as the hour changes. O'clock and half past.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { clockModel, Clock3D, ball, mat, shadowed } from '../class1-math-kit/models';
import { enName, npName, toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }
const partOfDay = (h24: number) => (h24 >= 5 && h24 < 12 ? ['बिहान', 'morning', '🌅'] : h24 >= 12 && h24 < 17 ? ['दिउँसो', 'afternoon', '☀️'] : h24 >= 17 && h24 < 20 ? ['साँझ', 'evening', '🌇'] : ['राति', 'night', '🌙']);

export const ClockTower: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G1-CH19-02', chapter: 19, titleNp: 'घडी टावर (समय हेरौँ)', titleEn: 'Clock Tower (Telling the Time)' });
  const [h24, setH24] = useState(9);
  const [half, setHalf] = useState(false);
  const [target, setTarget] = useState<{ h: number; half: boolean } | null>(null);
  const scene = useRef<{ setTime: (h24: number, half: boolean, animate?: boolean) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const clock: Clock3D = clockModel(2.7);
    clock.group.position.set(0, 4.4, 0); ctx.scene.add(clock.group);
    const tower = shadowed(new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 2.2), mat('#c2410c', 0.8))); tower.position.set(0, 1.1, 0); ctx.scene.add(tower);
    const roof = shadowed(new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.6, 4), mat('#7c2d12', 0.8))); roof.rotation.y = Math.PI / 4; roof.position.set(0, 8.1, 0); ctx.scene.add(roof);
    const sun = ball('#fde047', 1); (sun.material as THREE.MeshStandardMaterial).emissive.set('#fbbf24'); (sun.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.9; ctx.scene.add(sun);
    const moon = ball('#e2e8f0', 0.75); (moon.material as THREE.MeshStandardMaterial).emissive.set('#94a3b8'); (moon.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5; ctx.scene.add(moon);
    const sky = ctx.scene.background as THREE.Color;
    const day = new THREE.Color('#bfe6ff'), dusk = new THREE.Color('#fdba74'), night = new THREE.Color('#1e293b');
    const fog = ctx.scene.fog as THREE.Fog;
    let cur = { h: 9 };
    const apply = (hh: number) => {
      const a = ((hh - 6) / 12) * Math.PI; // 6am = east horizon, 12 noon = top, 6pm = west
      sun.position.set(-Math.cos(a) * 11, Math.sin(a) * 9 + 0.5, -6); sun.visible = hh >= 5.5 && hh <= 18.5;
      const b = ((hh - 18 + 24) % 24) / 12 * Math.PI;
      moon.position.set(-Math.cos(b) * 11, Math.sin(b) * 9 + 0.5, -6); moon.visible = !(hh >= 6.5 && hh <= 17.5);
      const light = hh >= 7 && hh <= 17 ? 1 : hh >= 5 && hh < 7 ? (hh - 5) / 2 : hh > 17 && hh <= 19 ? 1 - (hh - 17) / 2 : 0;
      const tint = hh >= 5 && hh < 7 || hh > 17 && hh <= 19 ? dusk : day;
      sky.copy(night).lerp(light > 0.99 ? day : tint, Math.max(0.0, light));
      if (hh >= 5 && hh < 7 || hh > 17 && hh <= 19) sky.lerp(dusk, 0.5);
      fog.color.copy(sky);
    };
    const setTime = (hh24: number, half2: boolean, animate = true) => {
      const to = hh24 + (half2 ? 0.5 : 0);
      const from = cur.h;
      let d = to - from; if (Math.abs(d) > 12) d += d > 0 ? -24 : 24;
      const run = (k: number) => { const v = (from + d * k + 24) % 24; cur.h = v; clock.setTime(Math.floor(v) % 12 || 12, Math.round((v % 1) * 60)); apply(v); };
      if (!animate) { run(1); return; }
      ctx.tween(800, run, undefined, ease.inOut);
    };
    scene.current = { setTime };
    setTime(9, false, false);
    ctx.onFrame((_d, t) => { sun.rotation.y = t; });
    return () => { scene.current = null; };
  }, [], { camera: [0, 5.2, 13], target: [0, 4.2, 0], minDistance: 7, maxDistance: 22, ground: 0x86efac });

  const update = (h: number, hf: boolean, speak = true) => {
    setH24(h); setHalf(hf); scene.current?.setTime(h, hf);
    const h12 = h % 12 || 12; const pd = partOfDay(h);
    if (speak) kit.say(hf ? `साढे ${npName(h12)} बज्यो — ${pd[0]}` : `${npName(h12)} बज्यो — ${pd[0]}`, hf ? `It is half past ${enName(h12)} — ${pd[1]}` : `It is ${enName(h12)} o'clock — ${pd[1]}`);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') { update(9, false); }
    else if (kit.mode === 'PLAY') { newTarget(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const newTarget = () => {
    const t = { h: rnd(1, 12), half: Math.random() < 0.4 };
    setTarget(t); update(12, false, false);
    kit.say(t.half ? `घडीमा साढे ${npName(t.h)} बनाऔँ।` : `घडीमा ${npName(t.h)} बजे बनाऔँ।`, t.half ? `Make the clock show half past ${enName(t.h)}.` : `Make the clock show ${enName(t.h)} o'clock.`);
  };
  const check = () => {
    if (!target) return;
    if ((h24 % 12 || 12) === target.h && half === target.half) { kit.good(); kit.star(); window.setTimeout(newTarget, 1200); }
    else kit.oops('फेरि हेरौँ — छोटो सुई घण्टा हो', 'Look again — the short hand shows the hour');
  };

  const data = useMemo(() => Array.from({ length: 8 }, () => {
    const h = rnd(1, 12), hf = Math.random() < 0.4;
    const mk = (hh: number, f: boolean) => `${hh}:${f ? '30' : '00'}`;
    const wrongs = new Set<string>();
    while (wrongs.size < 2) { const w = mk(rnd(1, 12), Math.random() < 0.4); if (w !== mk(h, hf)) wrongs.add(w); }
    return { h, hf, opts: shuffle([mk(h, hf), ...Array.from(wrongs)]) };
  }), []);
  const label = (s: string) => { const [hh, mm] = s.split(':'); const n = Number(hh); return mm === '30' ? kit.t(`साढे ${toNp(n)}`, `half past ${n}`) : kit.t(`${toNp(n)} बजे`, `${n} o'clock`); };
  const questions: (QuizQuestion & { h: number; hf: boolean })[] = data.map((d) => ({
    np: 'घडीमा कति बजेको छ?', en: 'What time does the clock show?', h: d.h, hf: d.hf,
    answer: `${d.h}:${d.hf ? '30' : '00'}`, options: d.opts.map((o) => ({ key: o, label: label(o) })),
  }));

  const pd = partOfDay(h24);
  const hud = (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      {kit.mode === 'PLAY' && target
        ? <div style={{ fontSize: 22, fontWeight: 900 }}>🎯 {target.half ? kit.t(`साढे ${toNp(target.h)}`, `half past ${target.h}`) : kit.t(`${toNp(target.h)} बजे`, `${target.h} o'clock`)}</div>
        : kit.mode !== 'CHALLENGE' && <>
          <div style={{ fontSize: 34, fontWeight: 900 }}>{String(h24 % 12 || 12)}:{half ? '30' : '00'}</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{pd[2]} {kit.t(pd[0], pd[1])}</div>
        </>}
    </div>
  );

  const hourBtns = (
    <>
      <CBtn color="#f59e0b" onClick={() => update((h24 + 23) % 24, half)}>◀ {kit.t('१ घण्टा', '1 hour')}</CBtn>
      <CBtn color="#f59e0b" onClick={() => update((h24 + 1) % 24, half)}>{kit.t('१ घण्टा', '1 hour')} ▶</CBtn>
      <CBtn color={half ? '#8b5cf6' : '#94a3b8'} onClick={() => update(h24, !half)}>{half ? kit.t('साढे', 'Half past') : kit.t('ठीक बजे', "O'clock")} ⇄</CBtn>
    </>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('सानो सुई घण्टा देखाउँछ, ठूलो सुई मिनेट।', 'The short hand shows the hour. The long hand shows the minutes.')}</div>
      {hourBtns}
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{hourBtns}<CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn><CBtn color="#8b5cf6" onClick={newTarget}>🎲</CBtn></Controls>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => update(q.h, q.hf, false)} />
  );

  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
