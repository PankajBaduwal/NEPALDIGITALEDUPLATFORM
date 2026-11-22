/**
 * Skip-counting frog on 2D stepping stones / lily pads. One engine, two lessons:
 *  • Lesson 3 (numbers up to 1000): hop by 1, 10 or 100
 *  • Lesson 11 (multiplication 1): hop by 2, 3, 4, 5 or 10 — k hops of s is k × s
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { shuffle, rnd, toNp } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
interface Cfg {
  code: string;
  chapter: number;
  titleNp: string;
  titleEn: string;
  steps: number[];
  starts: (step: number) => number[];
  times?: boolean;
}
const STONES = 11;

const makeHop = (cfg: Cfg): React.FC<Props> => ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: cfg.code,
    chapter: cfg.chapter,
    titleNp: cfg.titleNp,
    titleEn: cfg.titleEn,
  });

  const [step, setStep] = useState(cfg.steps[1] ?? cfg.steps[0]);
  const [start, setStart] = useState(0);
  const [pos, setPos] = useState(0); // stone index 0..10
  const [isHopping, setIsHopping] = useState(false);

  const reset = (s: number, st: number) => {
    setStart(s);
    setStep(st);
    setPos(0);
    setIsHopping(false);
  };

  const hop = () => {
    if (isHopping || pos >= STONES - 1) return;
    setIsHopping(true);
    kit.tap();
    const nextPos = pos + 1;
    setPos(nextPos);
    const curVal = start + nextPos * step;
    if (cfg.times) {
      kit.say(`${nextPos} × ${step} = ${curVal}`, `${nextPos} × ${step} = ${curVal}`);
    } else {
      kit.say(`${curVal}`, `${curVal}`);
    }
    setTimeout(() => {
      setIsHopping(false);
      if (nextPos === STONES - 1) {
        kit.good('अन्तिम ढुङ्गामा पुगियो!', 'Reached the end of the pond!');
        kit.star();
      }
    }, 450);
  };

  const runAuto = () => {
    if (isHopping) return;
    setPos(0);
    let p = 0;
    const tick = () => {
      p += 1;
      setPos(p);
      kit.tap();
      const curVal = start + p * step;
      if (cfg.times) {
        kit.say(`${p} × ${step} = ${curVal}`, `${p} × ${step} = ${curVal}`);
      } else {
        kit.say(`${curVal}`, `${curVal}`);
      }
      if (p < STONES - 1) {
        setTimeout(tick, 700);
      } else {
        setTimeout(() => {
          kit.good('स्याबास! सबै ढुङ्गाहरू घुमियो!', 'Well done! Traversed all stones!');
          kit.star();
        }, 600);
      }
    };
    setTimeout(tick, 500);
  };

  useEffect(() => {
    const s0 = cfg.starts(step)[0] ?? 0;
    if (kit.mode !== 'CHALLENGE') {
      reset(s0, step);
      kit.say(
        cfg.times ? `${step} को दरले उफ्रौँ।` : `${step} का दरले उफ्रौँ।`,
        `Let us hop in steps of ${step}.`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const data = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const st = cfg.steps[rnd(0, cfg.steps.length - 1)];
    const starts = cfg.starts(st);
    const s0 = starts[rnd(0, starts.length - 1)];
    const k = rnd(2, 8);
    const kind = cfg.times && i % 2 === 1 ? 'times' : 'next';
    return { st, s0, k, kind };
  }), []);

  const questions: (QuizQuestion & { st: number; s0: number })[] = data.map((d, i) => {
    if (d.kind === 'times') {
      const ans = d.k * d.st;
      return {
        np: `${toNp(d.st)} को ${toNp(d.k)} पटक उफ्रिँदा कति पुग्छ? (${toNp(d.k)} × ${toNp(d.st)})`,
        en: `${d.k} hops of ${d.st}: what is ${d.k} × ${d.st}?`,
        st: d.st,
        s0: d.s0,
        answer: String(ans),
        options: numChoices(ans, i * 11 + 2, [d.st, -d.st, 1, -1]).map((v) => ({
          key: String(v),
          label: fmt(kit.lang, v),
        })),
      };
    }
    const cur = d.s0 + d.k * d.st;
    const ans = cur + d.st;
    return {
      np: `${toNp(cur)} पछि के आउँछ? (${toNp(d.st)} को दरले)`,
      en: `Counting by ${d.st}: what comes after ${cur}?`,
      st: d.st,
      s0: d.s0,
      answer: String(ans),
      options: numChoices(ans, i * 13 + 4, [d.st, -d.st, 1, -1, 10]).map((v) => ({
        key: String(v),
        label: fmt(kit.lang, v),
      })),
    };
  });

  const currentVal = start + pos * step;

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
        {kit.t('उफ्राइको दर', 'Step')}: +{fmt(kit.lang, step)}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#187C68' }}>
        {fmt(kit.lang, currentVal)}
      </div>
      {cfg.times && (
        <div style={{ fontSize: 14, fontWeight: 900, color: '#8B5CF6' }}>
          {fmt(kit.lang, pos)} × {fmt(kit.lang, step)} = {fmt(kit.lang, pos * step)}
        </div>
      )}
    </div>
  );

  const stepButtons = cfg.steps.map((st) => (
    <CBtn
      key={st}
      color={st === step ? '#187C68' : '#64748B'}
      disabled={isHopping}
      onClick={() => reset(cfg.starts(st)[0] ?? 0, st)}
    >
      +{fmt(kit.lang, st)}
    </CBtn>
  ));

  const startButtons = !cfg.times
    ? cfg.starts(step).map((s) => (
      <CBtn
        key={s}
        color={s === start ? '#8B5CF6' : '#94A3B8'}
        style={{ minWidth: 50, fontSize: 14 }}
        disabled={isHopping}
        onClick={() => reset(s, step)}
      >
        {fmt(kit.lang, s)}
      </CBtn>
    ))
    : null;

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => reset(q.s0, q.st)} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#26332E' }}>
          {kit.t('दर छान्नुहोस्:', 'Step:')}
        </span>
        {stepButtons}
        <CBtn color="#059669" disabled={isHopping || pos >= STONES - 1} onClick={hop}>
          🐸 {kit.t('उफ्रौँ (+१ कदम)', 'Hop (+1)')}
        </CBtn>
        <CBtn color="#8B5CF6" disabled={isHopping} onClick={runAuto}>
          ▶ {kit.t('उफ्रेर देखाऔँ', 'Auto Hop')}
        </CBtn>
        <CBtn color="#64748B" onClick={() => reset(start, step)}>
          ↺ {kit.t('सुरुमा', 'Reset')}
        </CBtn>
      </div>
      {startButtons && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
            {kit.t('सुरुको सङ्ख्या:', 'Start at:')}
          </span>
          {startButtons}
        </div>
      )}
    </Controls>
  );

  return (
    <SimFrame2D kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} grade={cfg.chapter > 10 ? 2 : 2}>
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        {/* Pond Stream SVG */}
        <div
          style={{
            width: '100%',
            maxWidth: 960,
            background: 'linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 100%)',
            borderRadius: 24,
            padding: '40px 20px',
            border: '2px solid #7DD3FC',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            position: 'relative',
            overflowX: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minWidth: 700,
              position: 'relative',
              padding: '0 20px',
            }}
          >
            {/* 11 Lilypads / Stones */}
            {Array.from({ length: STONES }).map((_, i) => {
              const val = start + i * step;
              const isFrogHere = i === pos;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 2,
                    cursor: 'pointer',
                  }}
                  onClick={() => setPos(i)}
                >
                  {/* Frog on Lilypad */}
                  <div
                    style={{
                      height: 50,
                      display: 'flex',
                      alignItems: 'flex-end',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: isFrogHere ? (isHopping ? 'translateY(-20px) scale(1.15)' : 'scale(1)') : 'scale(0)',
                      opacity: isFrogHere ? 1 : 0,
                    }}
                  >
                    <span style={{ fontSize: 38 }}>🐸</span>
                  </div>

                  {/* Lilypad SVG */}
                  <svg width="68" height="48" viewBox="0 0 68 48">
                    <ellipse
                      cx="34"
                      cy="24"
                      rx="32"
                      ry="20"
                      fill={isFrogHere ? '#16A34A' : i % 2 === 0 ? '#22C55E' : '#4ADE80'}
                      stroke="#15803D"
                      strokeWidth="2.5"
                    />
                    <path d="M34 24 L66 24" stroke="#15803D" strokeWidth="2" strokeDasharray="3 2" />
                  </svg>

                  {/* Number Label */}
                  <div
                    style={{
                      background: isFrogHere ? '#187C68' : '#FFFFFF',
                      color: isFrogHere ? '#FFFFFF' : '#1E293B',
                      borderRadius: 8,
                      padding: '2px 8px',
                      fontSize: 13,
                      fontWeight: 900,
                      marginTop: 4,
                      border: '1.5px solid #CBD5E1',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    {fmt(kit.lang, val)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

const seq = (n: number, f: (i: number) => number) => Array.from({ length: n }, (_, i) => f(i));

export const HopTo1000 = makeHop({
  code: 'SIM-MATH-G2-L3-02',
  chapter: 3,
  titleNp: 'उफ्रने भ्यागुता (१००० सम्म)',
  titleEn: 'Hopping Frog (counting to 1000)',
  steps: [1, 10, 100],
  starts: (st) => (st === 100 ? [0, 100, 200] : st === 10 ? [0, 100, 250, 400, 560, 700] : [0, 45, 90, 120, 240, 500]),
});

export const TablesHop = makeHop({
  code: 'SIM-MATH-G2-L11-02',
  chapter: 11,
  titleNp: 'पहाडा भ्यागुता (गुणन १)',
  titleEn: 'Tables Frog (Multiplication 1)',
  steps: [2, 3, 4, 5, 10],
  starts: () => seq(1, () => 0),
  times: true,
});
