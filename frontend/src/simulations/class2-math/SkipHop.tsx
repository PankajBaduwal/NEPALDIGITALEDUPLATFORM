/**
 * Skip-counting frog on 3D stepping stones. One engine, two lessons:
 *  • Lesson 3 (numbers up to 1000): hop by 1, 10 or 100
 *  • Lesson 11 (multiplication 1): hop by 2, 3, 4, 5 or 10 — k hops of s is k × s
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, ease } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { mat, shadowed, textSprite, retext } from '../class1-math-kit/models';
import { shuffle, rnd } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
interface Cfg { code: string; chapter: number; titleNp: string; titleEn: string; steps: number[]; starts: (step: number) => number[]; times?: boolean }
const STONES = 11;

const frogModel = () => {
  const g = new THREE.Group();
  const green = mat('#22c55e', 0.5);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 18), green); body.scale.set(1, 0.8, 1.15); body.position.y = 0.5; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 22, 16), green); head.position.set(0, 0.85, 0.5); g.add(head);
  for (const x of [-0.2, 0.2]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), mat('#ffffff')); eye.position.set(x, 1.22, 0.55); g.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mat('#111827')); pupil.position.set(x, 1.24, 0.68); g.add(pupil);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.35, 6, 10), green); leg.position.set(x * 2, 0.2, -0.3); leg.rotation.x = 1.1; g.add(leg);
  }
  return shadowed(g);
};

const makeHop = (cfg: Cfg): React.FC<Props> => ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: cfg.code, chapter: cfg.chapter, titleNp: cfg.titleNp, titleEn: cfg.titleEn });
  const [step, setStep] = useState(cfg.steps[cfg.steps.length > 3 ? 1 : 1] ?? cfg.steps[0]);
  const [start, setStart] = useState(0);
  const [pos, setPos] = useState(0); // stone index the frog is on
  const [busy, setBusy] = useState(false);
  const scene = useRef<{ layout: (start: number, step: number) => void; hopTo: (i: number, done?: () => void, instant?: boolean) => void } | null>(null);

  useStage(kit.stageRef, (ctx) => {
    const stones: { m: THREE.Mesh; lab: THREE.Sprite }[] = [];
    for (let i = 0; i < STONES; i++) {
      const m = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, 0.35, 28), mat(i % 2 ? '#a8a29e' : '#d6d3d1', 0.9)));
      m.position.set((i - (STONES - 1) / 2) * 1.75, 0.18, 0); ctx.scene.add(m);
      const lab = textSprite('0', 1.5, { px: 70, w: 256, h: 128, bg: '#ffffff', border: '#0ea5e9' }); lab.position.set(m.position.x, 1.9, 0); ctx.scene.add(lab);
      stones.push({ m, lab });
    }
    const water = new THREE.Mesh(new THREE.PlaneGeometry(40, 10), new THREE.MeshStandardMaterial({ color: '#7dd3fc', transparent: true, opacity: 0.75, roughness: 0.2 }));
    water.rotation.x = -Math.PI / 2; water.position.y = 0.02; ctx.scene.add(water);
    const frog = frogModel(); frog.rotation.y = Math.PI / 2; frog.position.set(stones[0].m.position.x, 0.35, 0); ctx.scene.add(frog);
    const layout = (s: number, st: number) => stones.forEach((x, i) => retext(x.lab, String(s + i * st), { px: 66, w: 256, h: 128, bg: '#ffffff', border: '#0ea5e9' }));
    const hopTo = (i: number, done?: () => void, instant = false) => {
      const to = stones[i].m.position.x; const from = frog.position.x;
      if (instant) { frog.position.set(to, 0.35, 0); done?.(); return; }
      ctx.tween(520, (k) => { frog.position.x = from + (to - from) * k; frog.position.y = 0.35 + Math.sin(k * Math.PI) * 1.3; frog.rotation.z = -Math.sin(k * Math.PI) * 0.25; }, () => { frog.position.y = 0.35; frog.rotation.z = 0; done?.(); }, ease.inOut);
    };
    scene.current = { layout, hopTo };
    layout(0, 10);
    return () => { scene.current = null; };
  }, [], { camera: [0, 6.5, 12.5], target: [0, 1, 0], minDistance: 7, maxDistance: 22, ground: null, sky: 0xd1f0ff });

  const reset = (s: number, st: number) => { setStart(s); setStep(st); setPos(0); scene.current?.layout(s, st); scene.current?.hopTo(0, undefined, true); };
  const hop = () => {
    if (busy || pos >= STONES - 1) { if (pos >= STONES - 1) kit.oops('अन्तिम ढुङ्गामा पुग्यौँ', 'We reached the last stone'); return; }
    setBusy(true); const np = pos + 1;
    scene.current?.hopTo(np, () => { setBusy(false); });
    setPos(np); const v = start + np * step;
    kit.say(`${v}`, `${v}`, true);
    if (cfg.times) kit.say(`${np} × ${step} = ${v}`, `${np} × ${step} = ${v}`, false);
  };
  const auto = () => {
    if (busy) return; reset(start, step); setBusy(true);
    let i = 0;
    const next = () => { i += 1; scene.current?.hopTo(i, undefined); setPos(i); kit.say(`${start + i * step}`, `${start + i * step}`); if (i < STONES - 1) window.setTimeout(next, 900); else { setBusy(false); kit.good(); kit.star(); } };
    window.setTimeout(next, 500);
  };

  useEffect(() => {
    const st = kit.mode === 'LEARN' ? (cfg.times ? 2 : 10) : step;
    const s0 = cfg.starts(st)[0];
    if (kit.mode !== 'CHALLENGE') { reset(s0, st); kit.say(cfg.times ? `${st} ले गन्दै उफ्रौँ।` : `${st} का दरले उफ्रौँ।`, cfg.times ? `Let us hop in steps of ${st}.` : `Let us hop in steps of ${st}.`); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const st = cfg.steps[rnd(0, cfg.steps.length - 1)];
    const starts = cfg.starts(st); const s0 = starts[rnd(0, starts.length - 1)];
    const k = rnd(2, 8);
    const kind = cfg.times && i % 2 === 1 ? 'times' : 'next';
    return { st, s0, k, kind };
  }), []);
  const questions: (QuizQuestion & { st: number; s0: number })[] = data.map((d, i) => {
    if (d.kind === 'times') {
      const ans = d.k * d.st; return { np: `${d.st} को ${d.k} पटक उफ्रिँदा कति पुग्छ? (${d.k} × ${d.st})`, en: `${d.k} hops of ${d.st}: what is ${d.k} × ${d.st}?`, st: d.st, s0: d.s0, answer: String(ans), options: numChoices(ans, i * 11 + 2, [d.st, -d.st, 1, -1]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) };
    }
    const cur = d.s0 + d.k * d.st; const ans = cur + d.st;
    return { np: `${cur} पछि के आउँछ? (${d.st} को दरले)`, en: `Counting by ${d.st}: what comes after ${cur}?`, st: d.st, s0: d.s0, answer: String(ans), options: numChoices(ans, i * 13 + 4, [d.st, -d.st, 1, -1, 10]).map((v) => ({ key: String(v), label: fmt(kit.lang, v) })) };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: '3px solid #0ea5e9', textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{kit.t('उफ्राइको दर', 'Step')}: +{fmt(kit.lang, step)}</div>
      <div style={{ fontSize: 34, fontWeight: 900 }}>{fmt(kit.lang, start + pos * step)}</div>
      {cfg.times && <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{fmt(kit.lang, pos)} × {fmt(kit.lang, step)} = {fmt(kit.lang, pos * step)}</div>}
    </div>
  );
  const stepButtons = cfg.steps.map((st) => <CBtn key={st} color={st === step ? '#0ea5e9' : '#94a3b8'} style={{ minWidth: 56 }} disabled={busy} onClick={() => reset(cfg.starts(st)[0], st)}>+{fmt(kit.lang, st)}</CBtn>);
  const startButtons = !cfg.times ? cfg.starts(step).map((s) => <CBtn key={s} color={s === start ? '#8b5cf6' : '#cbd5e1'} style={{ color: '#1f2937', minWidth: 60, minHeight: 44, padding: '6px 10px', fontSize: 16 }} disabled={busy} onClick={() => reset(s, step)}>{fmt(kit.lang, s)}</CBtn>) : null;
  const panel = kit.mode === 'LEARN' ? (
    <Controls>
      <div style={{ fontWeight: 800, fontSize: 17, flex: 1, minWidth: 220 }}>{cfg.times ? kit.t('२ को दरले उफ्रिँदा २, ४, ६, ८ … आउँछ', 'Hopping by 2 gives 2, 4, 6, 8 …') : kit.t('१०० को दरले उफ्रिँदा १००, २००, ३०० …', 'Hopping by 100 gives 100, 200, 300 …')}</div>
      {stepButtons}<CBtn color="#8b5cf6" disabled={busy} onClick={auto}>▶ {kit.t('उफ्रेर देखाऔँ', 'Show me')}</CBtn>
    </Controls>
  ) : kit.mode === 'PLAY' ? (
    <div><Controls>{stepButtons}<CBtn color="#16a34a" disabled={busy} onClick={hop}>🐸 {kit.t('उफ्रौँ', 'Hop')}</CBtn><CBtn color="#f59e0b" onClick={() => reset(start, step)}>↺</CBtn></Controls>{startButtons && <div style={{ marginTop: 6 }}><Controls><b>{kit.t('सुरु', 'Start')}:</b>{startButtons}</Controls></div>}</div>
  ) : (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { reset(q.s0, q.st); }} />
  );
  void shuffle;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};

const seq = (n: number, f: (i: number) => number) => Array.from({ length: n }, (_, i) => f(i));
export const HopTo1000 = makeHop({ code: 'SIM-MATH-G2-L3-02', chapter: 3, titleNp: 'उफ्रने भ्यागुता (१००० सम्म)', titleEn: 'Hopping Frog (counting to 1000)', steps: [1, 10, 100], starts: (st) => (st === 100 ? [0, 100, 200] : st === 10 ? [0, 100, 250, 400, 560, 700] : [0, 45, 90, 120, 240, 500]) });
export const TablesHop = makeHop({ code: 'SIM-MATH-G2-L11-02', chapter: 11, titleNp: 'पहाडा भ्यागुता (गुणन १)', titleEn: 'Tables Frog (Multiplication 1)', steps: [2, 3, 4, 5, 10], starts: () => seq(1, () => 0), times: true });
