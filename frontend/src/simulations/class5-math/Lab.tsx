/**
 * Generic 2D Educational Maths Lab used by Class 5 and Class 6 simulations.
 * Built on SimFrame2D and high-performance 2D Canvas vector rendering.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';
import { Props, Bi, Params, LQ, fmt } from './h5';
import { Group2D, renderScene2D } from './vis';

export interface LabParam {
  id: string;
  np: string;
  en: string;
  min: number;
  max: number;
  init: number;
  step?: number;
  color?: string;
  names?: Bi[];
  show?: (v: number) => string;
}

export interface LabGoal {
  p: Params;
  np: string;
  en: string;
  start?: Params;
}

export interface LabCfg {
  code: string;
  chapter: number;
  titleNp: string;
  titleEn: string;
  params: LabParam[];
  stage?: any;
  draw: (g: any, p: Params, lang: 'ne' | 'en', ctx: any) => void;
  info: (p: Params) => Bi;
  tip: Bi;
  goal?: () => LabGoal;
  quiz: (i: number) => LQ;
  fix?: (p: Params) => Params;
  color?: string;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const makeLab = (cfg: LabCfg): React.FC<Props> => ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: cfg.code,
    chapter: cfg.chapter,
    titleNp: cfg.titleNp,
    titleEn: cfg.titleEn,
  });

  const init = useMemo(
    () => Object.fromEntries(cfg.params.map((x) => [x.id, x.init])) as Params,
    [cfg.params]
  );
  const [p, setP] = useState<Params>(init);
  const [goal, setGoal] = useState<LabGoal | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const g2d = useMemo(() => new Group2D(), []);
  const color = cfg.color ?? '#187C68';

  const norm = (q: Params): Params => {
    const r: Params = {};
    cfg.params.forEach((x) => {
      r[x.id] = clamp(q[x.id] ?? x.init, x.min, x.max);
    });
    return cfg.fix ? cfg.fix(r) : r;
  };

  const put = (q: Params) => {
    const n = norm(q);
    setP(n);
    return n;
  };

  const bump = (x: LabParam, dir: number) => {
    put({ ...p, [x.id]: (p[x.id] ?? x.init) + dir * (x.step ?? 1) });
    kit.tap();
  };

  const randomise = () => {
    const q: Params = {};
    cfg.params.forEach((x) => {
      const s = x.step ?? 1;
      const n = Math.floor((x.max - x.min) / s);
      q[x.id] = x.min + s * Math.floor(Math.random() * (n + 1));
    });
    const n = put(q);
    const b = cfg.info(n);
    kit.tap();
    kit.say(b.np, b.en);
  };

  const newGoal = () => {
    if (!cfg.goal) return;
    const g = cfg.goal();
    setGoal(g);
    put({ ...init, ...(g.start ?? {}) });
    kit.tap();
    kit.say(g.np, g.en);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      kit.say(cfg.tip.np, cfg.tip.en, false);
    } else if (kit.mode === 'PLAY') {
      newGoal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Redraw onto 2D Canvas whenever parameters or language change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    g2d.clear();
    const dummyCtx = {
      scene: { background: null },
      onFrame: () => { },
      tween: (_ms: number, fn: (t: number) => void, done?: () => void) => {
        fn(1);
        done?.();
      },
    };
    cfg.draw(g2d, p, kit.lang, dummyCtx);

    renderScene2D(ctx, canvas.width, canvas.height, g2d);
  }, [p, kit.lang, g2d, cfg]);

  const rawQuestions = useMemo(() => Array.from({ length: 8 }, (_, i) => cfg.quiz(i)), [cfg]);
  const questions = useMemo<QuizQuestion[]>(() => {
    return rawQuestions.map((q) =>
      kit.lang === 'ne'
        ? {
          ...q,
          np: toNp(q.np),
          options: q.options.map((o) => ({
            key: o.key,
            label: typeof o.label === 'string' ? toNp(o.label) : o.label,
          })),
        }
        : q
    );
  }, [rawQuestions, kit.lang]);

  const head = cfg.info(p);
  const headLines = (kit.lang === 'ne' ? head.np : head.en).split('\n');

  const label = (x: LabParam) => {
    const v = p[x.id] ?? x.init;
    const nm = x.names?.[v - x.min];
    return nm ? kit.t(nm.np, nm.en) : x.show ? x.show(v) : fmt(kit.lang, v);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(cfg.tip.np, cfg.tip.en)}
      questions={questions}
      onAskQuestion={(q: any) => {
        if (q.set) put({ ...p, ...q.set });
      }}
      controls={
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {cfg.params.map((x) => (
            <div
              key={x.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
              }}
            >
              <button
                onClick={() => bump(x, -1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: 'none',
                  background: x.color ?? color,
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                −
              </button>
              <div style={{ minWidth: 84, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>{kit.t(x.np, x.en)}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#1E293B' }}>{label(x)}</div>
              </div>
              <button
                onClick={() => bump(x, 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: 'none',
                  background: x.color ?? color,
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>
          ))}

          <button
            onClick={() => {
              kit.star();
              randomise();
            }}
            style={{
              padding: '9px 18px',
              borderRadius: 12,
              border: 'none',
              background: '#187C68',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            🎲 {kit.t('नयाँ मान', 'Randomize')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 880, gap: 14 }}>
        {/* Info & Headline Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: `2px solid ${color}`,
            borderRadius: 16,
            padding: '12px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            width: '100%',
          }}
        >
          {goal && kit.mode === 'PLAY' && (
            <div style={{ fontSize: 14, fontWeight: 800, color: '#B45309' }}>
              🎯 {kit.t(goal.np, goal.en)}
            </div>
          )}
          {headLines.map((l, i) => (
            <div
              key={i}
              style={{
                fontSize: i === 0 ? 20 : 13,
                fontWeight: i === 0 ? 900 : 700,
                color: i === 0 ? color : '#475569',
              }}
            >
              {l}
            </div>
          ))}
        </div>

        {/* 2D Canvas Viewport */}
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            padding: 8,
          }}
        >
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            style={{ width: '100%', maxHeight: 420, borderRadius: 14, display: 'block' }}
          />
        </div>
      </div>
    </SimFrame2D>
  );
};
export default makeLab;
