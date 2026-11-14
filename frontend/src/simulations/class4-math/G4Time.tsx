/**
 * Class 4 lesson 7 · Time (समय)
 * 24-Hour Clock — the 12-hour clock face, a sun and moon that travel across the sky, AM/PM and 24-hour time, and elapsed time.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { clockModel, mat, shadowed } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, Hud, Tip, Props, mcq } from './h4';

const pad = (n: number) => String(n).padStart(2, '0');
const h24 = (t: number) => `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
const h12 = (t: number) => { const h = Math.floor(t / 60); return `${h % 12 || 12}:${pad(t % 60)} ${h < 12 ? 'AM' : 'PM'}`; };
const part = (np: string, en: string, t: number) => { void np; void en; const h = Math.floor(t / 60); return h < 6 ? ['रात', 'night'] : h < 12 ? ['बिहान', 'morning'] : h < 17 ? ['दिउँसो', 'afternoon'] : h < 20 ? ['साँझ', 'evening'] : ['रात', 'night']; };
const dur = (lang: 'ne' | 'en', m: number) => (lang === 'ne' ? `${fmt('ne', Math.floor(m / 60))} घण्टा ${fmt('ne', m % 60)} मिनेट` : `${Math.floor(m / 60)} h ${m % 60} min`);

export const Clock24: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G4-L7-01', chapter: 7, titleNp: '२४ घण्टे घडी', titleEn: '24-Hour Clock' });
  const [t, setT] = useState(15 * 60 + 45);
  const [target, setTarget] = useState(18 * 60 + 20);
  const scene = useRef<{ set: (t: number) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const clock = clockModel(3); clock.group.position.set(0, 3.6, 0); ctx.scene.add(clock.group);
    const sun = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 18), new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#f59e0b', emissiveIntensity: 0.6 }))); ctx.scene.add(sun);
    const moon = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 18), new THREE.MeshStandardMaterial({ color: '#e2e8f0', emissive: '#94a3b8', emissiveIntensity: 0.4 }))); ctx.scene.add(moon);
    const set = (tt: number) => {
      clock.setTime(Math.floor(tt / 60) % 12 || 12, tt % 60);
      const day = tt >= 360 && tt < 1080; const ph = (Math.PI * (day ? tt - 360 : (tt - 1080 + 1440) % 1440)) / 720;
      const pos = new THREE.Vector3(-9 * Math.cos(ph), 2 + 8 * Math.sin(ph), -6);
      sun.visible = day; moon.visible = !day; (day ? sun : moon).position.copy(pos);
      ctx.scene.background = new THREE.Color(day ? (tt > 1020 || tt < 420 ? '#fdba74' : '#bfdbfe') : '#1e293b');
    };
    scene.current = { set }; set(15 * 60 + 45);
    return () => { scene.current = null; };
  }, [], { camera: [0, 5, 14], target: [0, 4, 0], minDistance: 8, maxDistance: 24, ground: 0x86efac });

  const upd = (v: number, speak = false) => { const x = ((v % 1440) + 1440) % 1440; setT(x); scene.current?.set(x); if (speak) { const pr = part('', '', x); kit.say(`${fmt('ne', h24(x))} = ${fmt('ne', h12(x))} (${pr[0]})`, `${h24(x)} = ${h12(x)} (${pr[1]})`); } };
  const newTarget = () => { const v = rnd(0, 95) * 15; setTarget(v); upd(rnd(0, 1) ? 6 * 60 : 12 * 60); kit.say(`घडीमा ${fmt('ne', h24(v))} मिलाऔँ`, `Set the clock to ${h24(v)}`); };
  useEffect(() => { if (kit.mode === 'LEARN') upd(15 * 60 + 45, true); else if (kit.mode === 'PLAY') newTarget(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kit.mode]);
  const check = () => { if (t === target) { kit.good(); kit.star(); window.setTimeout(newTarget, 1200); } else kit.oops(`अहिले ${h24(t)} छ`, `It shows ${h24(t)}`); };

  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const v = rnd(0, 95) * 15; const s = rnd(6, 14) * 60 + rnd(0, 3) * 15, d = rnd(2, 20) * 15; return { v, s, d, i }; }), []);
  const questions: (QuizQuestion & { v: number })[] = data.map((d, i) => {
    const wr = (f: (x: number) => string, v: number) => [f((v + 720) % 1440), f((v + 60) % 1440), f((v + 15) % 1440), f((v + 1380) % 1440)];
    if (i % 3 === 0) return { v: d.v, ...mcq(`${h12(d.v)} लाई २४ घण्टे समयमा लेख`, `Write ${h12(d.v)} in 24-hour time`, h24(d.v), wr(h24, d.v), i), options: mcq('', '', h24(d.v), wr(h24, d.v), i).options.map((o) => ({ key: o.key, label: fmt(kit.lang, o.key) })) };
    if (i % 3 === 1) return { v: d.v, ...mcq(`${h24(d.v)} लाई १२ घण्टे समयमा लेख`, `Write ${h24(d.v)} in 12-hour time`, h12(d.v), wr(h12, d.v), i), options: mcq('', '', h12(d.v), wr(h12, d.v), i).options.map((o) => ({ key: o.key, label: fmt(kit.lang, o.key) })) };
    const ans = d.d; const w = [ans + 30, Math.max(15, ans - 15), ans + 60, ans + 15];
    return { v: d.s + d.d, ...mcq(`काम ${h12(d.s)} मा सुरु भई ${h12(d.s + d.d)} मा सकियो। कति समय लाग्यो?`, `Work began at ${h12(d.s)} and ended at ${h12(d.s + d.d)}. How long did it take?`, String(ans), w.map(String), i), options: mcq('', '', String(ans), w.map(String), i).options.map((o) => ({ key: o.key, label: dur(kit.lang, Number(o.key)) })) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color="#f59e0b">
      {kit.mode === 'PLAY' && <div style={{ fontSize: 15, fontWeight: 900 }}>🎯 {fmt(kit.lang, h24(target))}</div>}
      <div style={{ fontSize: 30, fontWeight: 900 }}>{fmt(kit.lang, h24(t))}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: '#475569' }}>{fmt(kit.lang, h12(t))} · {kit.t(part('', '', t)[0], part('', '', t)[1])}</div>
    </Hud>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><Tip>{kit.t('दिउँसो १ बजेपछि १२ जोडौँ: १५:४५ = ३:४५ PM', 'After 12 noon, add 12: 15:45 = 3:45 PM')}</Tip>{[[6, 0], [9, 30], [13, 15], [18, 45], [22, 10]].map(([h, m]) => <CBtn key={h} color="#f59e0b" onClick={() => { upd(h * 60 + m, true); kit.star(); }}>{fmt(kit.lang, pad(h) + ':' + pad(m))}</CBtn>)}<CBtn color="#ef4444" onClick={() => upd(t + 60, true)}>+१ {kit.t('घण्टा', 'h')}</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{[[-60, '−1h'], [60, '+1h'], [-15, '−15m'], [15, '+15m'], [-5, '−5m'], [5, '+5m']].map(([d, l]) => <CBtn key={l as string} color="#f59e0b" onClick={() => upd(t + (d as number))}>{l}</CBtn>)}<CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn><CBtn color="#8b5cf6" onClick={newTarget}>🎲</CBtn></Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => upd(q.v)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
void mat;
