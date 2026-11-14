/**
 * Lesson 4 · Number patterns (सङ्ख्याको ढाँचा)
 * Pattern Train — a train of numbered wagons follows a rule (add or subtract the same number); find the missing wagon.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite } from '../class1-math-kit/models';
import { rnd } from '../class1-math-kit/nepali';
import { big, fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
interface Pat { start: number; step: number; hide: number }
const mk = (): Pat => { const step = [2, 3, 5, 10, 25, 100, 250, 1000][rnd(0, 7)] * (rnd(0, 2) ? 1 : -1); const start = step > 0 ? rnd(1, 40) * (step >= 100 ? 10 : 1) : rnd(0, 20) * Math.abs(step) + Math.abs(step) * 8; return { start, step, hide: rnd(1, 5) }; };
const seq = (p: Pat) => Array.from({ length: 7 }, (_, i) => p.start + p.step * i);
const COL = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899'];

export const PatternTrain: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: 'SIM-MATH-G3-L4-01', chapter: 4, titleNp: 'ढाँचा रेल', titleEn: 'Pattern Train' });
  const [pat, setPat] = useState<Pat>({ start: 5, step: 5, hide: 3 });
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState(0);
  const scene = useRef<{ build: (p: Pat, hidden: boolean) => void; reveal: () => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g);
    const rail = shadowed(new THREE.Mesh(new THREE.BoxGeometry(24, 0.2, 0.5), mat('#78716c', 0.8))); rail.position.set(0, 0.3, 0); ctx.scene.add(rail);
    let hid: THREE.Sprite | null = null; let hidVal = 0; let wag: THREE.Group | null = null;
    const label = (v: number, q = false) => textSprite(q ? '?' : v.toLocaleString('en-US'), 1.7, { px: 64, w: 256, h: 128, bg: q ? '#fde68a' : '#ffffff', border: q ? '#f59e0b' : '#94a3b8' });
    const build = (p: Pat, hidden: boolean) => {
      g.clear(); hid = null; const s = seq(p);
      s.forEach((v, i) => {
        const w = new THREE.Group(); w.position.set((i - 3) * 3.3, 0, 0);
        const body = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.5, 1.6), mat(COL[i], 0.5))); body.position.y = 1.2; w.add(body);
        [-0.9, 0.9].forEach((x) => [-0.8, 0.8].forEach((z) => { const wh = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 16), mat('#1f2937', 0.6))); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.5, z); w.add(wh); }));
        const q = hidden && i === p.hide; const t = label(v, q); t.position.set(0, 2.4, 0); w.add(t);
        if (q) { hid = t; hidVal = v; wag = w; }
        if (i < 6) { const hk = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.12), mat('#475569'))); hk.position.set(1.7, 0.8, 0); w.add(hk); }
        g.add(w); w.scale.setScalar(0.01); ctx.tween(300 + i * 90, (k) => w.scale.setScalar(Math.max(0.01, k)), undefined, ease.back);
      });
    };
    const reveal = () => { if (!hid || !wag) return; const t = label(hidVal); t.position.copy(hid.position); wag.remove(hid); wag.add(t); hid = null; };
    scene.current = { build, reveal }; build({ start: 5, step: 5, hide: 3 }, false);
    return () => { scene.current = null; };
  }, [], { camera: [0, 4.5, 13.5], target: [0, 1.6, 0], minDistance: 8, maxDistance: 24, ground: 0xe7e5e4 });

  const load = (p: Pat, hidden: boolean) => { setPat(p); setOpen(!hidden); scene.current?.build(p, hidden); };
  const rule = (p: Pat) => `${p.step > 0 ? '+' : '−'}${Math.abs(p.step).toLocaleString('en-US')}`;

  useEffect(() => {
    if (kit.mode === 'LEARN') { const p = { ...mk(), hide: -1 }; load(p, false); kit.say(`ढाँचा: हरेक पटक ${p.step > 0 ? 'जोड्ने' : 'घटाउने'} ${Math.abs(p.step)}`, `Rule: ${p.step > 0 ? 'add' : 'subtract'} ${Math.abs(p.step)} each time`); }
    else if (kit.mode === 'PLAY') { const p = mk(); load(p, true); kit.say('खाली डिब्बामा के सङ्ख्या आउँछ?', 'Which number goes in the empty wagon?'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, seed]);

  const answer = seq(pat)[Math.max(0, pat.hide)];
  const opts = useMemo(() => near(answer, seed + 4, [Math.abs(pat.step), -Math.abs(pat.step), 2 * Math.abs(pat.step), 1, -1]), [answer, seed, pat.step]);
  const pick = (v: number) => { if (open) return; if (v === answer) { setOpen(true); scene.current?.reveal(); kit.good(); kit.star(); window.setTimeout(() => setSeed((s) => s + 1), 1400); } else kit.oops(`नियम ${rule(pat)} हो`, `The rule is ${rule(pat)}`); };

  const data = useMemo(() => Array.from({ length: 8 }, () => mk()), []);
  const questions: (QuizQuestion & { p: Pat })[] = data.map((p, i) => { const a = seq(p)[p.hide]; return { np: 'खाली डिब्बामा कुन सङ्ख्या आउँछ?', en: 'Which number is missing from the train?', p, answer: String(a), options: near(a, i + 9, [Math.abs(p.step), -Math.abs(p.step), 2 * Math.abs(p.step), 1, -1]).map((x) => ({ key: String(x), label: big(kit.lang, x) })) }; });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #22c55e', textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#64748b' }}>{kit.t('नियम', 'Rule')}</div>
      <div style={{ fontSize: 28, fontWeight: 900 }}>{kit.mode === 'PLAY' && !open ? '?' : fmt(kit.lang, rule(pat).replace(/\d+/, (x) => x)) }</div>
    </div>
  );
  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{kit.t('दुई छिमेकी डिब्बाबीचको फरक हेरौँ', 'Look at the gap between neighbouring wagons')}</div><CBtn color="#16a34a" onClick={() => { kit.star(); setSeed(seed + 1); }}>{kit.t('अर्को ढाँचा', 'Next pattern')} ➜</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{opts.map((v) => <CBtn key={v} color="#0ea5e9" style={{ minWidth: 90, fontSize: 22 }} onClick={() => pick(v)}>{big(kit.lang, v)}</CBtn>)}</Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => load(q.p, true)} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
