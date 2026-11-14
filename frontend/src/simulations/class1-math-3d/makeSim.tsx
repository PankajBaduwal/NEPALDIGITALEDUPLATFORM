/**
 * A tiny factory that turns a "spec" into a full Learn / Play / Challenge 3D simulation on the shared Class 1 kit.
 * A spec supplies: the 3D scene builder, the guided Learn steps, the Play controls and the Challenge questions.
 * Everything else (speech, stars, progress saving, big buttons, Nepali + English) comes from the kit.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StageCtx, StageOptions, useStage } from '../class1-math-kit/useStage';
import { SimFrame, QuizPanel, Controls, CBtn, useSimKit, KitConfig, SimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

export interface Step<S> { np: string; en: string; run?: (s: S, kit: SimKit) => void }
export interface Q<S> extends QuizQuestion { setup?: (s: S) => void }
export interface PlayCtx<S, U> {
  kit: SimKit;
  ui: U;
  setUi: (patch: Partial<U>) => void;
  /** run something on the 3D scene once it exists */
  scene: (fn: (s: S) => void) => void;
  /** speak helper */
  num: (n: number) => string;
}
export interface Spec<S, U extends object = {}> {
  cfg: KitConfig;
  stage?: StageOptions;
  /** build the 3D scene; `notify` lets the scene tell the React side something happened (a tap, a count…) */
  build: (ctx: StageCtx, notify: (ev: any) => void) => S;
  ui0?: U;
  learn: Step<S>[];
  playIntro: [string, string];
  /** called when Play starts */
  onPlay?: (s: S, kit: SimKit) => void;
  /** called when a scene event arrives */
  onEvent?: (ev: any, p: PlayCtx<S, U>) => void;
  play: (p: PlayCtx<S, U>) => React.ReactNode;
  hud?: (p: PlayCtx<S, U>, mode: string) => React.ReactNode;
  quiz: () => Q<S>[];
  /** extra controls under the quiz (for example a hint button) */
  quizExtra?: (p: PlayCtx<S, U>) => React.ReactNode;
}

interface Props { onBackToLibrary: () => void; userRole?: string }

export function makeSim<S, U extends object = {}>(spec: Spec<S, U>): React.FC<Props> {
  const Sim: React.FC<Props> = ({ onBackToLibrary }) => {
    const kit = useSimKit(spec.cfg);
    const [ui, setUiState] = useState<U>((spec.ui0 || {}) as U);
    const [step, setStep] = useState(0);
    const [qKey, setQKey] = useState(0);
    const sceneRef = useRef<S | null>(null);
    const liveRef = useRef<PlayCtx<S, U> | null>(null);

    const setUi = (patch: Partial<U>) => setUiState((u) => ({ ...u, ...patch }));
    const p: PlayCtx<S, U> = {
      kit, ui, setUi,
      scene: (fn) => { if (sceneRef.current) fn(sceneRef.current); },
      num: (n) => (kit.lang === 'ne' ? toNp(n) : String(n)),
    };
    liveRef.current = p;

    useStage(kit.stageRef, (ctx) => {
      const s = spec.build(ctx, (ev) => { if (liveRef.current) spec.onEvent?.(ev, liveRef.current); });
      sceneRef.current = s;
      return () => { sceneRef.current = null; };
    }, [], spec.stage);

    // entering a mode
    useEffect(() => {
      const s = sceneRef.current;
      if (!s) return;
      if (kit.mode === 'LEARN') {
        const st = spec.learn[step] || spec.learn[0];
        st.run?.(s, kit);
        kit.say(st.np, st.en);
      } else if (kit.mode === 'PLAY') {
        spec.onPlay?.(s, kit);
        kit.say(spec.playIntro[0], spec.playIntro[1]);
      } else {
        setQKey((k) => k + 1);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kit.mode, step]);

    const questions = useMemo(() => spec.quiz(), [qKey]);
    const st = spec.learn[Math.min(step, spec.learn.length - 1)];
    const last = step >= spec.learn.length - 1;

    const panel = kit.mode === 'LEARN' ? (
      <Controls>
        <div style={{ fontWeight: 800, fontSize: 18, flex: 1, minWidth: 200 }}>
          <span style={{ color: '#64748b', fontSize: 13 }}>{kit.t('चरण', 'Step')} {p.num(step + 1)}/{p.num(spec.learn.length)}</span><br />
          {kit.t(st.np, st.en)}
        </div>
        <CBtn color="#94a3b8" disabled={step === 0} onClick={() => setStep(step - 1)}>⬅ {kit.t('पछाडि', 'Back')}</CBtn>
        <CBtn color="#0ea5e9" onClick={() => kit.say(st.np, st.en)}>🔊</CBtn>
        <CBtn color="#16a34a" onClick={() => { kit.tap(); if (last) { kit.star(); kit.good(); setStep(0); } else setStep(step + 1); }}>
          {last ? `⭐ ${kit.t('सकियो', 'Finish')}` : `${kit.t('अर्को', 'Next')} ➜`}
        </CBtn>
      </Controls>
    ) : kit.mode === 'PLAY' ? (
      spec.play(p)
    ) : (
      <div>
        <QuizPanel kit={kit} questions={questions} resetKey={qKey} onAsk={(q: any) => { if (sceneRef.current) q.setup?.(sceneRef.current); }} />
        {spec.quizExtra && <div style={{ marginTop: 8 }}>{spec.quizExtra(p)}</div>}
      </div>
    );

    return <SimFrame kit={kit} onBack={onBackToLibrary} hud={spec.hud?.(p, kit.mode)} panel={panel} />;
  };
  return Sim;
}

/** A row of big number buttons. */
export const NumPad: React.FC<{ kit: SimKit; from: number; to: number; value?: number; onPick: (n: number) => void; color?: string }> = ({ kit, from, to, value, onPick, color = '#0ea5e9' }) => (
  <>
    {Array.from({ length: to - from + 1 }, (_, i) => from + i).map((v) => (
      <CBtn key={v} color={v === value ? color : '#fb923c'} style={{ minWidth: 52, padding: '6px 10px', minHeight: 52, fontSize: 22 }} onClick={() => { kit.tap(); onPick(v); }}>
        {kit.lang === 'ne' ? toNp(v) : v}
      </CBtn>
    ))}
  </>
);

/** A big white card shown over the stage (a number or an equation). */
export const Hud: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#0ea5e9' }) => (
  <div style={{ background: 'rgba(255,255,255,.93)', borderRadius: 18, padding: '8px 16px', border: `3px solid ${color}`, textAlign: 'center', fontSize: 38, fontWeight: 900 }}>{children}</div>
);

/** shorthand to build number-answer options 0..n around the correct answer */
export const numOptions = (answer: number, lo: number, hi: number, count = 3, np = false) => {
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < count && guard++ < 60) set.add(lo + Math.floor(Math.random() * (hi - lo + 1)));
  return [...set].sort(() => Math.random() - 0.5).map((v) => ({ key: String(v), label: np ? toNp(v) : String(v) }));
};
