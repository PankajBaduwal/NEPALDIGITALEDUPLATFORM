/**
 * Unit conversion lab used by lessons 8 (m ↔ cm), 16 (h ↔ min ↔ s), 18 (L ↔ mL), 19 (km ↔ m) and 20 (kg ↔ g).
 * A big unit and a small unit are shown as 3D things you can build up; Learn shows 1, 2, 3 … big units turning into small ones.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { clockModel, mat, shadowed, textSprite } from '../class1-math-kit/models';
import { shuffle, rnd } from '../class1-math-kit/nepali';
import { big as bigFmt, fmt, near } from './h3';

export type Visual = 'jug' | 'ruler' | 'road' | 'scale' | 'hours' | 'minutes';
export interface Pair { bigNp: string; bigEn: string; smallNp: string; smallEn: string; factor: number; max: number; step: number; visual: Visual; color: string }
export interface UnitCfg { code: string; chapter: number; titleNp: string; titleEn: string; pairs: Pair[]; hintNp: string; hintEn: string }
interface Props { onBackToLibrary: () => void; userRole?: string }

type SceneApi = { set: (big: number, extra: number, pair: Pair) => void };

const buildScene = (ctx: any, g: THREE.Group): SceneApi => {
  let clock: ReturnType<typeof clockModel> | null = null; let sec: THREE.Mesh | null = null; let carry: THREE.Object3D | null = null;
  const set = (bg: number, extra: number, p: Pair) => {
    g.clear(); clock = null; sec = null; carry = null;
    const total = bg * p.factor + extra; const maxTotal = p.max * p.factor;
    const tag = (txt: string, x: number, y: number, z: number, c = p.color) => { const t = textSprite(txt, 2.4, { px: 52, w: 320, h: 96, bg: '#ffffff', border: c }); t.position.set(x, y, z); g.add(t); };
    if (p.visual === 'jug') {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 6, 36, 1, true), new THREE.MeshStandardMaterial({ color: '#bae6fd', transparent: true, opacity: 0.35, side: THREE.DoubleSide })); tank.position.y = 3; g.add(tank);
      const h = Math.max(0.05, (6 * total) / maxTotal); const water = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, h, 36), mat('#38bdf8', 0.2))); water.position.y = h / 2; g.add(water);
      for (let i = 0; i < 6; i++) { const y = (6 * (i + 1) * p.factor) / maxTotal; if (y <= 6.01) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.05), mat('#334155')); m.position.set(2.3, y, 0); g.add(m); } }
      for (let i = 0; i < bg; i++) { const b = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.8, 20), mat('#22c55e', 0.3))); b.position.set(-6 + (i % 3) * 1.6, 0.9 + Math.floor(i / 3) * 1.9, 3); g.add(b); const c = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 14), mat('#fff'))); c.position.set(-6 + (i % 3) * 1.6, 1.95 + Math.floor(i / 3) * 1.9, 3); g.add(c); }
      for (let i = 0; i < extra / p.step; i++) { const c = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.6, 14), mat('#f59e0b', 0.4))); c.position.set(5 + (i % 3) * 1.1, 0.3 + Math.floor(i / 3) * 0.7, 3); g.add(c); }
      tag(`${bg} L + ${extra} mL`, 0, 7.4, 0);
    } else if (p.visual === 'ruler' || p.visual === 'road') {
      const isRoad = p.visual === 'road'; const L = 20; const bar = shadowed(new THREE.Mesh(new THREE.BoxGeometry(L, isRoad ? 0.1 : 0.15, isRoad ? 2.6 : 1.2), mat(isRoad ? '#475569' : '#fde68a', 0.7))); bar.position.set(0, 0.07, 0); g.add(bar);
      for (let i = 0; i <= p.max; i++) { const x = -L / 2 + (L * i) / p.max; const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.12, isRoad ? 1.2 : 0.5, 0.12), mat(isRoad ? '#f8fafc' : '#7c2d12'))); m.position.set(x, isRoad ? 0.7 : 0.3, isRoad ? 1.6 : 0.7); g.add(m); const t = textSprite(`${i}${isRoad ? 'km' : 'm'}`, 1.3, { px: 44, w: 192, h: 96, bg: null, color: '#0f172a' }); t.position.set(x, isRoad ? 1.8 : 1.1, isRoad ? 1.6 : 0.7); g.add(t); }
      const x = -L / 2 + (L * total) / maxTotal;
      if (isRoad) { const car = new THREE.Group(); const body = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2, 0.7, 1.1), mat('#ef4444', 0.4))); body.position.y = 0.6; car.add(body); const top = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 1), mat('#fecaca', 0.4))); top.position.set(-0.1, 1.2, 0); car.add(top); [-0.6, 0.6].forEach((a) => [-0.55, 0.55].forEach((b) => { const w = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 14), mat('#111827'))); w.rotation.x = Math.PI / 2; w.position.set(a, 0.3, b); car.add(w); })); car.position.set(x, 0, 0); g.add(car); carry = car; }
      else { const fill = shadowed(new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.02, x + L / 2), 0.3, 0.8), mat(p.color, 0.4))); fill.position.set((x - L / 2) / 2, 0.3, 0); g.add(fill); }
      tag(isRoad ? `${(total / p.factor).toFixed(total % p.factor ? 1 : 0)} km` : `${bg} m + ${extra} cm`, isRoad ? x : 0, 3, 0);
    } else if (p.visual === 'scale') {
      const base = shadowed(new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 3), mat('#94a3b8', 0.5))); base.position.set(-3, 0.15, 0); g.add(base);
      for (let i = 0; i < bg; i++) { const b = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.2), mat('#a16207', 0.7))); b.position.set(-5.5 + (i % 3) * 1.7, 0.9 + Math.floor(i / 3) * 1.25, 0); g.add(b); const t = textSprite('1 kg', 1, { px: 40, w: 160, h: 80, bg: null, color: '#fff' }); t.position.set(-5.5 + (i % 3) * 1.7, 0.9 + Math.floor(i / 3) * 1.25, 0.65); g.add(t); }
      for (let i = 0; i < extra / p.step; i++) { const c = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat('#f59e0b', 0.5))); c.position.set(2.5 + (i % 3) * 0.6, 0.55 + Math.floor(i / 3) * 0.6, 0); g.add(c); }
      const dial = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.3, 36), mat('#f1f5f9', 0.5))); dial.rotation.x = Math.PI / 2; dial.position.set(3, 3.6, -1.4); g.add(dial);
      const needle = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 0.08), mat('#dc2626'))); needle.geometry.translate(0, 0.8, 0); needle.position.set(3, 3.6, -1.2); needle.rotation.z = -(total / maxTotal) * Math.PI * 1.6 + 0.8 * Math.PI; g.add(needle);
      tag(`${bg} kg + ${extra} g`, 0, 5.8, 0);
    } else {
      clock = clockModel(2.8); clock.group.position.set(0, 3.6, 0); g.add(clock.group);
      if (p.visual === 'hours') clock.setTime(bg || 12, extra);
      else { clock.minuteHand.rotation.z = -(bg / 60) * Math.PI * 2; clock.hourHand.rotation.z = -(bg / 720) * Math.PI * 2; }
      sec = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.5, 0.04), mat('#ec4899')); sec.geometry.translate(0, 1.1, 0); sec.position.z = 0.4; sec.rotation.z = p.visual === 'minutes' ? -(extra / 60) * Math.PI * 2 : 0; clock.group.add(sec);
      const n = Math.min(bg, 12); for (let i = 0; i < n; i++) { const b = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat(p.color, 0.5))); b.position.set((i - (n - 1) / 2) * 1.1, 0.5, 2.5); g.add(b); }
      tag(p.visual === 'hours' ? `${bg} h + ${extra} min` : `${bg} min + ${extra} s`, 0, 7.5, 0);
    }
    void carry; void sec; void clock;
  };
  return { set };
};

const asText = (p: Pair, lang: 'ne' | 'en', big: boolean) => (lang === 'ne' ? (big ? p.bigNp : p.smallNp) : big ? p.bigEn : p.smallEn);

export const makeUnitSim = (cfg: UnitCfg): React.FC<Props> => ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: cfg.code, chapter: cfg.chapter, titleNp: cfg.titleNp, titleEn: cfg.titleEn });
  const [pi, setPi] = useState(0);
  const [bg, setBg] = useState(2);
  const [ex, setEx] = useState(0);
  const [li, setLi] = useState(1);
  const scene = useRef<SceneApi | null>(null);
  const P = cfg.pairs[pi];

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g); scene.current = buildScene(ctx, g); scene.current.set(2, 0, cfg.pairs[0]);
    return () => { scene.current = null; };
  }, [], { camera: [0, 7, 17], target: [0, 2.5, 0], minDistance: 9, maxDistance: 28, ground: 0xecfccb });

  const show = (b: number, e: number, p = P, speak = false) => { setBg(b); setEx(e); scene.current?.set(b, e, p); if (speak) kit.say(`${b} ${p.bigNp} = ${b * p.factor} ${p.smallNp}`, `${b} ${p.bigEn} = ${b * p.factor} ${p.smallEn}`); };
  useEffect(() => {
    if (kit.mode === 'LEARN') { show(li, 0, P, true); } else if (kit.mode === 'PLAY') show(bg, ex, P);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li, pi]);

  const total = bg * P.factor + ex;
  const data = useMemo(() => Array.from({ length: 8 }, (_, i) => { const p = cfg.pairs[i % cfg.pairs.length]; const k = rnd(1, p.max); const e = rnd(1, p.factor / p.step - 1) * p.step; return { p, k, e, kind: i % 4 }; }), []);
  const questions: (QuizQuestion & { d: any })[] = data.map((d, i) => {
    const { p, k, e } = d; const sb = (l: 'ne' | 'en') => asText(p, l, true), ss = (l: 'ne' | 'en') => asText(p, l, false);
    const lbl = (v: number) => ({ key: String(v), label: `${bigFmt(kit.lang, v)}` });
    if (d.kind === 0) return { d, np: `${fmt('ne', k)} ${sb('ne')} = कति ${ss('ne')}?`, en: `${k} ${sb('en')} = how many ${ss('en')}?`, answer: String(k * p.factor), options: near(k * p.factor, i + 2, [p.factor, -p.factor, p.factor / 10, 10 * p.factor, p.step], 1).map(lbl) };
    if (d.kind === 1) return { d, np: `${bigFmt('ne', k * p.factor)} ${ss('ne')} = कति ${sb('ne')}?`, en: `${k * p.factor} ${ss('en')} = how many ${sb('en')}?`, answer: String(k), options: near(k, i + 4, [1, -1, 2, 10], 1).map(lbl) };
    if (d.kind === 2) return { d, np: `${fmt('ne', k)} ${sb('ne')} ${fmt('ne', e)} ${ss('ne')} = कति ${ss('ne')}?`, en: `${k} ${sb('en')} ${e} ${ss('en')} = how many ${ss('en')}?`, answer: String(k * p.factor + e), options: near(k * p.factor + e, i + 6, [p.step, -p.step, p.factor, -p.factor, e], 1).map(lbl) };
    return { d, np: `१ ${sb('ne')} मा कति ${ss('ne')} हुन्छन्?`, en: `How many ${ss('en')} are in 1 ${sb('en')}?`, answer: String(p.factor), options: shuffle([p.factor, p.factor / 10, p.factor * 10].filter((x) => x >= 1), i + 9).map(lbl) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: `3px solid ${P.color}`, textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#475569' }}>{kit.t(`१ ${P.bigNp} = ${fmt('ne', P.factor)} ${P.smallNp}`, `1 ${P.bigEn} = ${P.factor} ${P.smallEn}`)}</div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{fmt(kit.lang, bg)} {asText(P, kit.lang, true)}{ex ? ` ${fmt(kit.lang, ex)} ${asText(P, kit.lang, false)}` : ''}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: P.color }}>= {bigFmt(kit.lang, total)} {asText(P, kit.lang, false)}</div>
    </div>
  );
  const pairBtns = cfg.pairs.length > 1 && cfg.pairs.map((p, i) => <CBtn key={i} color={i === pi ? p.color : '#94a3b8'} onClick={() => { setPi(i); setBg(2); setEx(0); }}>{kit.t(`${p.bigNp}↔${p.smallNp}`, `${p.bigEn}↔${p.smallEn}`)}</CBtn>);
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t(cfg.hintNp, cfg.hintEn)}</div>{pairBtns}<CBtn color="#16a34a" onClick={() => { kit.star(); setLi((li % P.max) + 1); }}>{kit.t('अर्को', 'Next')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{pairBtns}
      <CBtn color={P.color} onClick={() => bg > 0 && show(bg - 1, ex)}>−1 {asText(P, kit.lang, true)}</CBtn><CBtn color={P.color} onClick={() => bg < P.max && show(bg + 1, ex)}>+1 {asText(P, kit.lang, true)}</CBtn>
      <CBtn color="#f59e0b" onClick={() => ex >= P.step && show(bg, ex - P.step)}>−{P.step} {asText(P, kit.lang, false)}</CBtn><CBtn color="#f59e0b" onClick={() => ex + P.step < P.factor && show(bg, ex + P.step)}>+{P.step} {asText(P, kit.lang, false)}</CBtn>
    </Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { const d = q.d; if (d.p !== P) setPi(cfg.pairs.indexOf(d.p)); show(d.kind === 2 ? d.k : d.k, d.kind === 2 ? d.e : 0, d.p); }} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
