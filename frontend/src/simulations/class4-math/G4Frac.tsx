/**
 * Class 4 lesson 6 · Fraction, decimal and percentage (भिन्न, दशमलव र प्रतिशत)
 * FractionPies — 2D Interactive Pie charts for equivalent fractions and comparison.
 * DecimalGrid — 2D 100-Square grid demonstrating Fraction = Decimal = Percentage.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, Props, mcq, numQ } from './h4';

const frac = (lang: 'ne' | 'en', n: number, d: number) => `${fmt(lang, n)}/${fmt(lang, d)}`;

/* ───────────── 1. FractionPies ───────────── */
const pieColors = ['#EF4444', '#0EA5E9'];

export const FractionPies: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L6-01',
    chapter: 6,
    titleNp: 'भिन्नको पाई (समतुल्य भिन्न)',
    titleEn: 'Fraction Pies (Equivalent Fractions)',
  });

  const [A, setA] = useState<[number, number]>([1, 2]); // [shaded, total]
  const [B, setB] = useState<[number, number]>([2, 4]);
  const [multiplier, setMultiplier] = useState(2);

  const applyMultiplier = (k: number) => {
    setMultiplier(k);
    setB([A[0] * k, A[1] * k]);
    kit.tap();
    kit.say(
      `${frac('ne', A[0], A[1])} = ${frac('ne', A[0] * k, A[1] * k)}`,
      `${A[0]}/${A[1]} = ${A[0] * k}/${A[1] * k}`
    );
  };

  const fresh = () => {
    const d = rnd(2, 6);
    const n = rnd(1, d - 1);
    setA([n, d]);
    setB([n * 2, d * 2]);
    setMultiplier(2);
    kit.tap();
  };

  const toggleSliceA = (sIdx: number) => {
    const nextShaded = sIdx + 1 === A[0] ? sIdx : sIdx + 1;
    setA([nextShaded, A[1]]);
    setB([nextShaded * multiplier, A[1] * multiplier]);
    kit.tap();
    kit.say(`${nextShaded}/${A[1]}`, `${nextShaded}/${A[1]}`);
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qd = rnd(2, 6);
      const qn = rnd(1, qd - 1);
      const qk = rnd(2, 4);

      if (i % 2 === 0) {
        return mcq(
          `रङ्गिन भाग कति भिन्न हो? (${qn} भाग रङ्गिएको, जम्मा ${qd} भाग)`,
          `What fraction is shaded? (${qn} parts shaded out of ${qd})`,
          `${qn}/${qd}`,
          [`${qd - qn}/${qd}`, `${qn}/${qd + 1}`, `${qn + 1}/${qd}`],
          i
        );
      } else {
        return numQ(
          `${frac('ne', qn, qd)} = ?/${fmt('ne', qd * qk)} (समतुल्य भिन्न)`,
          `${qn}/${qd} = ?/${qd * qk} (Equivalent fraction)`,
          qn * qk,
          i,
          [1, -1, qk, 2],
          (x) => fmt(kit.lang, x),
          1
        );
      }
    });
  }, [kit.lang]);

  // SVG Pie Generator
  const renderPie = (n: number, d: number, color: string, isInteractive: boolean) => {
    const radius = 70;
    const center = 85;

    return (
      <svg width="170" height="170" viewBox="0 0 170 170">
        {Array.from({ length: d }).map((_, s) => {
          const startAngle = (s * 2 * Math.PI) / d - Math.PI / 2;
          const endAngle = ((s + 1) * 2 * Math.PI) / d - Math.PI / 2;
          const isShaded = s < n;

          const x1 = center + radius * Math.cos(startAngle);
          const y1 = center + radius * Math.sin(startAngle);
          const x2 = center + radius * Math.cos(endAngle);
          const y2 = center + radius * Math.sin(endAngle);

          const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
          const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={s}
              d={pathData}
              fill={isShaded ? color : '#F1F5F9'}
              stroke="#FFFFFF"
              strokeWidth="2.5"
              onClick={() => isInteractive && toggleSliceA(s)}
              style={{
                cursor: isInteractive ? 'pointer' : 'default',
                transition: 'fill 0.2s ease',
              }}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `अंश र हर दुवैलाई एउटै सङ्ख्याले गुणा गर्दा समतुल्य (बराबर) भिन्न बन्छ: ${A[0]}/${A[1]} = ${B[0]}/${B[1]}`,
        `Multiplying numerator and denominator by the same number creates an equivalent fraction: ${A[0]}/${A[1]} = ${B[0]}/${B[1]}`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[2, 3, 4].map((k) => (
            <button
              key={k}
              onClick={() => applyMultiplier(k)}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: multiplier === k ? '2px solid #187C68' : '1px solid #CBD5E1',
                background: multiplier === k ? '#E6F3E9' : '#FFFFFF',
                color: multiplier === k ? '#187C68' : '#334155',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              ×{fmt(kit.lang, k)}
            </button>
          ))}
          <button
            onClick={() => A[0] > 0 && setA([A[0] - 1, A[1]])}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('रङ्गिन', 'Shade')} −
          </button>
          <button
            onClick={() => A[0] < A[1] && setA([A[0] + 1, A[1]])}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('रङ्गिन', 'Shade')} +
          </button>
          <button
            onClick={fresh}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🎲 {kit.t('नयाँ भिन्न', 'Random')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 680, gap: 16 }}>
        {/* Equivalence Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 900, color: '#187C68' }}>
            {frac(kit.lang, A[0], A[1])} = {frac(kit.lang, B[0], B[1])}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginTop: 4 }}>
            ({A[0]} × {multiplier}) / ({A[1]} × {multiplier}) = {B[0]}/{B[1]}
          </div>
        </div>

        {/* 2 Pies Comparison View */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 60px 1fr',
            alignItems: 'center',
            gap: 16,
            width: '100%',
          }}
        >
          {/* Pie A */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              border: '2px solid #E2E8F0',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: pieColors[0] }}>
              {kit.t('पहिलो पाई (ट्याप गर)', 'First Pie (Tap to shade)')}
            </div>
            {renderPie(A[0], A[1], pieColors[0], true)}
            <div style={{ fontSize: 20, fontWeight: 900, color: pieColors[0] }}>
              {frac(kit.lang, A[0], A[1])}
            </div>
          </div>

          <div style={{ fontSize: 32, fontWeight: 900, color: '#187C68', textAlign: 'center' }}>=</div>

          {/* Pie B */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              border: '2px solid #E2E8F0',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: pieColors[1] }}>
              {kit.t('समतुल्य पाई (×' + multiplier + ')', 'Equivalent Pie (×' + multiplier + ')')}
            </div>
            {renderPie(B[0], B[1], pieColors[1], false)}
            <div style={{ fontSize: 20, fontWeight: 900, color: pieColors[1] }}>
              {frac(kit.lang, B[0], B[1])}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

/* ───────────── 2. DecimalGrid ───────────── */
export const DecimalGrid: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L6-02',
    chapter: 6,
    titleNp: 'दशमलव ग्रिड (१०० कोठा)',
    titleEn: 'Decimal Grid (100 Squares)',
  });

  const [n, setN] = useState(35); // 0 to 100

  const decimal = (n / 100).toFixed(2);
  const percent = n;

  const setVal = (v: number) => {
    const nextVal = Math.max(0, Math.min(100, v));
    setN(nextVal);
    kit.tap();
    kit.say(
      `${nextVal}/१०० = ${decimal} = ${nextVal}%`,
      `${nextVal}/100 = ${decimal} = ${nextVal}%`
    );
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qv = rnd(1, 19) * 5;
      const qdec = (qv / 100).toFixed(2);

      if (i % 2 === 0) {
        return numQ(
          `१०० मध्ये ${qv} कोठा रङ्ग्याउँदा कति प्रतिशत हुन्छ?`,
          `If ${qv} out of 100 squares are shaded, what percentage is that?`,
          qv,
          i,
          [10, -10, 5, -5, 1],
          (x) => `${fmt(kit.lang, x)}%`,
          1
        );
      } else {
        return mcq(
          `${qv}/१०० लाई दशमलवमा लेख्नुहोस्:`,
          `Write ${qv}/100 as a decimal:`,
          qdec,
          [((qv + 10) / 100).toFixed(2), ((qv - 5) / 100).toFixed(2), (qv / 10).toFixed(1)],
          i
        );
      }
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `१०० मध्ये रङ्गिएका भाग: ${n}/१०० = ${decimal} = ${percent}%`,
        `Shaded parts out of 100: ${n}/100 = ${decimal} = ${percent}%`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[10, 25, 50, 75].map((preset) => (
            <button
              key={preset}
              onClick={() => setVal(preset)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: n === preset ? '2px solid #187C68' : '1px solid #CBD5E1',
                background: n === preset ? '#E6F3E9' : '#FFFFFF',
                color: n === preset ? '#187C68' : '#334155',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {fmt(kit.lang, preset)}%
            </button>
          ))}
          <button
            onClick={() => setVal(n - 10)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            −10
          </button>
          <button
            onClick={() => setVal(n - 1)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            −1
          </button>
          <button
            onClick={() => setVal(n + 1)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            +1
          </button>
          <button
            onClick={() => setVal(n + 10)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            +10
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 540, gap: 16 }}>
        {/* Equivalency Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900, color: '#187C68' }}>
            {fmt(kit.lang, n)}/१०० = {decimal} = {fmt(kit.lang, percent)}%
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginTop: 4 }}>
            {kit.t('भिन्न = दशमलव = प्रतिशत', 'Fraction = Decimal = Percent')}
          </div>
        </div>

        {/* 10x10 Hundred Grid */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            border: '2px solid #E2E8F0',
            padding: 16,
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            width: '100%',
            maxWidth: 380,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 3,
            }}
          >
            {Array.from({ length: 100 }).map((_, idx) => {
              const isShaded = idx < n;
              return (
                <div
                  key={idx}
                  onClick={() => setVal(idx + 1)}
                  style={{
                    aspectRatio: '1/1',
                    borderRadius: 4,
                    background: isShaded ? (Math.floor(idx / 10) % 2 === 0 ? '#0284C7' : '#38BDF8') : '#F1F5F9',
                    border: isShaded ? '1px solid #0369A1' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                  title={`${idx + 1}`}
                />
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textAlign: 'center', marginTop: 8 }}>
            {kit.t('कोठामा ट्याप गरेर रङ्गिन भाग बदल्नुहोस्', 'Tap squares to shade')}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default FractionPies;
