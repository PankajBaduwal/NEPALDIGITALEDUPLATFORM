/**
 * Class 4 lesson 14 · Bar diagram (स्तम्भ चित्र)
 * BarGraphLab — 2D Interactive Bar Chart with customizable scales (1, 2, 5, 10).
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, Props, numQ, mcq } from './h4';

const CATS = [
  { np: 'क्रिकेट', en: 'Cricket', color: '#EF4444' },
  { np: 'फुटबल', en: 'Football', color: '#0EA5E9' },
  { np: 'भलिबल', en: 'Volleyball', color: '#F59E0B' },
  { np: 'खो-खो', en: 'Kho-kho', color: '#10B981' },
];

const SCALES = [1, 2, 5, 10];

export const BarGraphLab: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L14-01',
    chapter: 14,
    titleNp: 'स्तम्भ चित्र प्रयोगशाला (बार ग्राफ)',
    titleEn: 'Bar Graph Lab',
  });

  const [scale, setScale] = useState(5);
  const [vals, setVals] = useState<number[]>([30, 45, 20, 35]);
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const applyScale = (newScale: number) => {
    setScale(newScale);
    const newVals = CATS.map(() => rnd(1, 8) * newScale);
    setVals(newVals);
    kit.tap();
    kit.say(`स्केल: १ एकाइ = ${newScale}`, `Scale: 1 unit = ${newScale}`);
  };

  const bump = (idx: number, delta: number) => {
    const next = [...vals];
    next[idx] = Math.max(0, Math.min(scale * 10, next[idx] + delta * scale));
    setVals(next);
    setActiveBar(idx);
    kit.tap();
    kit.say(`${CATS[idx].np}: ${next[idx]}`, `${CATS[idx].en}: ${next[idx]}`);
  };

  const fresh = () => {
    const nextVals = CATS.map(() => rnd(1, 8) * scale);
    setVals(nextVals);
    setActiveBar(null);
    kit.tap();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qScale = SCALES[i % SCALES.length];
      const qVals = CATS.map(() => rnd(1, 8) * qScale);
      const catIdx = i % CATS.length;
      const count = qVals[catIdx];
      const maxI = qVals.indexOf(Math.max(...qVals));

      if (i % 2 === 0) {
        return numQ(
          `${CATS[catIdx].np}को स्तम्भले कति सङ्ख्या देखाउँछ? (स्केल = ${qScale})`,
          `What value does the ${CATS[catIdx].en} bar show? (Scale = ${qScale})`,
          count,
          i,
          [qScale, -qScale, 2 * qScale, 5],
          (x) => fmt(kit.lang, x),
          1
        );
      } else {
        const q = mcq(
          'कुन खेलको स्तम्भ सबैभन्दा अग्लो (धेरै) छ?',
          'Which sport has the tallest bar?',
          String(maxI),
          [0, 1, 2, 3].filter((x) => x !== maxI).map(String),
          i
        );
        return {
          ...q,
          options: q.options.map((o) => ({
            key: o.key,
            label: kit.lang === 'ne' ? CATS[Number(o.key)].np : CATS[Number(o.key)].en,
          })),
        };
      }
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={
        activeBar !== null
          ? kit.t(
            `${CATS[activeBar].np}: ${vals[activeBar]} (स्केल १ खण्ड = ${scale})`,
            `${CATS[activeBar].en}: ${vals[activeBar]} (Scale 1 unit = ${scale})`
          )
          : kit.t(
            `स्तम्भ चित्र: १ खण्ड = ${scale}। स्तम्भमा ट्याप गरेर वा +/− थिचेर मान हेरौँ!`,
            `Bar Graph: 1 block = ${scale}. Tap any bar or use +/− to adjust values!`
          )
      }
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>
            {kit.t('स्केल (Scale):', 'Scale:')}
          </div>
          {SCALES.map((s) => (
            <button
              key={s}
              onClick={() => applyScale(s)}
              style={{
                padding: '7px 14px',
                borderRadius: 10,
                border: scale === s ? '2px solid #187C68' : '1px solid #CBD5E1',
                background: scale === s ? '#E6F3E9' : '#FFFFFF',
                color: scale === s ? '#187C68' : '#334155',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              १ = {s}
            </button>
          ))}
          <button
            onClick={fresh}
            style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🎲 {kit.t('नयाँ तथ्याङ्क', 'Random')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 700, gap: 16 }}>
        {/* Graph Display Card */}
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: 18,
            border: '2px solid #E2E8F0',
            padding: '24px 28px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* SVG Bar Chart with Gridlines */}
          <svg viewBox="0 0 520 250" style={{ width: '100%', maxWidth: 520 }}>
            {/* Background horizontal gridlines */}
            {[0, 2, 4, 6, 8, 10].map((k) => {
              const y = 200 - k * 18;
              const val = k * scale;
              return (
                <g key={k}>
                  <line x1="50" y1={y} x2="480" y2={y} stroke="#F1F5F9" strokeWidth="1.5" />
                  <text x="42" y={y + 4} textAnchor="end" fill="#64748B" fontSize="11" fontWeight="700">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* X-axis line */}
            <line x1="50" y1="200" x2="480" y2="200" stroke="#334155" strokeWidth="2" />

            {/* Bars */}
            {CATS.map((cat, i) => {
              const val = vals[i];
              const barHeight = (val / (10 * scale)) * 180;
              const x = 75 + i * 105;
              const y = 200 - barHeight;
              const isSelected = activeBar === i;

              return (
                <g key={cat.en} onClick={() => { setActiveBar(i); kit.tap(); }} style={{ cursor: 'pointer' }}>
                  {/* Bar rect */}
                  <rect
                    x={x}
                    y={y}
                    width="55"
                    height={Math.max(2, barHeight)}
                    rx="6"
                    fill={cat.color}
                    stroke={isSelected ? '#1E293B' : 'transparent'}
                    strokeWidth={isSelected ? 3 : 0}
                    style={{
                      transition: 'all 0.25s ease',
                      filter: isSelected ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'none',
                    }}
                  />
                  {/* Value on top of bar */}
                  <text
                    x={x + 27.5}
                    y={y - 6}
                    textAnchor="middle"
                    fill={cat.color}
                    fontSize="13"
                    fontWeight="900"
                  >
                    {val}
                  </text>
                  {/* Category label below bar */}
                  <text
                    x={x + 27.5}
                    y="222"
                    textAnchor="middle"
                    fill="#1E293B"
                    fontSize="12"
                    fontWeight="800"
                  >
                    {kit.t(cat.np, cat.en)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Stepper controls below chart for each bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, width: '100%', marginTop: 8 }}>
            {CATS.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                <button
                  onClick={() => bump(idx, -1)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  −
                </button>
                <button
                  onClick={() => bump(idx, 1)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default BarGraphLab;
