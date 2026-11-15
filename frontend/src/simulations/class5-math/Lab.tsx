/**
 * A generic 3D maths lab used by most Class 5 and Class 6 simulations.
 * A lab is described by its number controls, a `draw` function that builds the 3D scene from them, a headline,
 * an optional Play goal ("make this") and eight Challenge questions. The engine gives it Learn, Play and Challenge.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStage, StageCtx, StageOptions } from '../class1-math-kit/useStage';
import { SimFrame, Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';
import { Hud, Props, Bi, Params, LQ, fmt } from './h5';

export interface LabParam {
  id: string; np: string; en: string; min: number; max: number; init: number; step?: number; color?: string;
  /** names for each value (value − min is the index), for choices such as a shape or an operation */
  names?: Bi[];
  /** how the value is written, default is the plain number */
  show?: (v: number) => string;
}
export interface LabGoal { p: Params; np: string; en: string; start?: Params }
export interface LabCfg {
  code: string; chapter: number; titleNp: string; titleEn: string;
  params: LabParam[];
  stage?: StageOptions;
  draw: (g: THREE.Group, p: Params, lang: 'ne' | 'en', ctx: StageCtx) => void;
  /** headline over the scene; use '\n' for more than one line */
  info: (p: Params) => Bi;
  tip: Bi;
  goal?: () => LabGoal;
  quiz: (i: number) => LQ;
  /** keep the numbers in a valid combination (for example the smaller number first) */
  fix?: (p: Params) => Params;
  /** the colour of the headline box */
  color?: string;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const makeLab = (cfg: LabCfg): React.FC<Props> => ({ onBackToLibrary }) => {
  const kit = useSimKit({ code: cfg.code, chapter: cfg.chapter, titleNp: cfg.titleNp, titleEn: cfg.titleEn });
  const init = useMemo(() => Object.fromEntries(cfg.params.map((x) => [x.id, x.init])) as Params, []);
  const [p, setP] = useState<Params>(init);
  const [goal, setGoal] = useState<LabGoal | null>(null);
  const api = useRef<{ g: THREE.Group; ctx: StageCtx } | null>(null);
  const color = cfg.color ?? '#0ea5e9';

  useStage(kit.stageRef, (ctx) => {
    const g = new THREE.Group(); ctx.scene.add(g); api.current = { g, ctx };
    return () => { api.current = null; };
  }, [], { camera: [0, 9, 14], target: [0, 1.5, 0], minDistance: 6, maxDistance: 30, ground: 0xecfccb, ...cfg.stage });

  useEffect(() => {
    const a = api.current; if (!a) return;
    a.g.clear(); cfg.draw(a.g, p, kit.lang, a.ctx);
  }, [p, kit.lang]);

  const norm = (q: Params): Params => { const r: Params = {}; cfg.params.forEach((x) => { r[x.id] = clamp(q[x.id] ?? x.init, x.min, x.max); }); return cfg.fix ? cfg.fix(r) : r; };
  const put = (q: Params) => { const n = norm(q); setP(n); return n; };
  const bump = (x: LabParam, dir: number) => put({ ...p, [x.id]: p[x.id] + dir * (x.step ?? 1) });
  const randomise = () => {
    const q: Params = {}; cfg.params.forEach((x) => { const s = x.step ?? 1; const n = Math.floor((x.max - x.min) / s); q[x.id] = x.min + s * Math.floor(Math.random() * (n + 1)); });
    const n = put(q); const b = cfg.info(n); kit.say(b.np, b.en);
  };
  const newGoal = () => { if (!cfg.goal) return; const g = cfg.goal(); setGoal(g); put({ ...init, ...(g.start ?? {}) }); kit.say(g.np, g.en); };

  useEffect(() => {
    if (kit.mode === 'LEARN') { const b = cfg.info(p); kit.say(cfg.tip.np, cfg.tip.en, false); void b; }
    else if (kit.mode === 'PLAY') newGoal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const check = () => {
    if (!goal) return;
    if (Object.keys(goal.p).every((k) => p[k] === goal.p[k])) { kit.good(); kit.star(); window.setTimeout(newGoal, 1300); }
    else kit.oops('अझै मिलेन, फेरि हेरौँ', 'Not yet — look again');
  };

  const raw = useMemo(() => Array.from({ length: 8 }, (_, i) => cfg.quiz(i)), []);
  const questions = useMemo<(QuizQuestion & { set?: Params })[]>(() => raw.map((q) => (kit.lang === 'ne'
    ? { ...q, np: toNp(q.np), options: q.options.map((o) => ({ key: o.key, label: typeof o.label === 'string' ? toNp(o.label) : o.label })) }
    : q)), [raw, kit.lang]);

  const head = cfg.info(p); const lines = (kit.lang === 'ne' ? head.np : head.en).split('\n');
  const hud = kit.mode === 'CHALLENGE' ? null : (
    <Hud color={color}>
      {kit.mode === 'PLAY' && goal && <div style={{ fontSize: 14, fontWeight: 900, color: '#b45309' }}>🎯 {kit.t(goal.np, goal.en)}</div>}
      {lines.map((l, i) => <div key={i} style={{ fontSize: i === 0 ? 17 : 14, fontWeight: i === 0 ? 900 : 700, color: i === 0 ? '#0f172a' : '#475569' }}>{l}</div>)}
    </Hud>
  );

  const label = (x: LabParam) => { const v = p[x.id]; const nm = x.names?.[v - x.min]; return nm ? kit.t(nm.np, nm.en) : x.show ? x.show(v) : fmt(kit.lang, v); };
  const steppers = cfg.params.map((x) => (
    <span key={x.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <CBtn color={x.color ?? color} style={{ minWidth: 44, padding: '8px 12px', minHeight: 44, fontSize: 18 }} onClick={() => bump(x, -1)}>−</CBtn>
      <span style={{ minWidth: 92, textAlign: 'center', fontWeight: 900, fontSize: 14, lineHeight: 1.15 }}><span style={{ color: '#64748b', fontSize: 12 }}>{kit.t(x.np, x.en)}</span><br />{label(x)}</span>
      <CBtn color={x.color ?? color} style={{ minWidth: 44, padding: '8px 12px', minHeight: 44, fontSize: 18 }} onClick={() => bump(x, 1)}>+</CBtn>
    </span>
  ));

  const panel = kit.mode === 'LEARN' ? (
    <Controls><div style={{ fontWeight: 800, fontSize: 16, flex: 1, minWidth: 200 }}>{kit.t(cfg.tip.np, cfg.tip.en)}</div>{steppers}<CBtn color="#16a34a" onClick={() => { kit.star(); randomise(); }}>🎲 {kit.t('नयाँ', 'New')}</CBtn></Controls>
  ) : kit.mode === 'PLAY' ? (
    <Controls>{steppers}{cfg.goal && <CBtn color="#16a34a" onClick={check}>✓ {kit.t('जाँचौँ', 'Check')}</CBtn>}{cfg.goal && <CBtn color="#f59e0b" onClick={newGoal}>🎯 {kit.t('अर्को लक्ष्य', 'New goal')}</CBtn>}</Controls>
  ) : <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { if (q.set) put({ ...p, ...q.set }); }} />;
  return <SimFrame kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} />;
};
