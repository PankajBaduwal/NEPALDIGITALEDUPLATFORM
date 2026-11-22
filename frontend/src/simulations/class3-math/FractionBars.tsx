/**
 * Lesson 7 · Fraction (भिन्न)
 * Chocolate Fractions — chocolate bar cut into equal pieces; eat some and read numerator / denominator.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

const ORD = ['', '', 'half', 'third', 'quarter', 'fifth', 'sixth', 'seventh', 'eighth'];
const fword = (n: number, d: number) =>
  d === 2
    ? n === 1
      ? 'one half'
      : 'two halves'
    : `${['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][n]} ${ORD[d]}${n > 1 ? 's' : ''}`;

const TOUR: [number, number][] = [
  [1, 2],
  [1, 3],
  [1, 4],
  [3, 4],
  [2, 3],
  [3, 5],
  [5, 8],
];

export const FractionBars: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L7-01',
    chapter: 7,
    titleNp: 'चकलेट भिन्न',
    titleEn: 'Chocolate Fractions',
  });

  const [n, setN] = useState(1); // numerator (eaten/taken)
  const [d, setD] = useState(2); // denominator (total parts)
  const [li, setLi] = useState(0);

  const applyFraction = (nn: number, dd: number, speak = false) => {
    setN(nn);
    setD(dd);
    if (speak) {
      kit.say(
        `${toNp(nn)}/${toNp(dd)} — ${toNp(nn)} अंश, ${toNp(dd)} हर`,
        `${nn}/${dd} = ${fword(nn, dd)}: ${dd} equal pieces, ${nn} taken`
      );
    }
  };

  const togglePiece = (i: number) => {
    kit.tap();
    // Set numerator to count of pieces up to i+1 or i
    const nextN = i < n ? i : i + 1;
    setN(nextN);
    kit.say(`${toNp(nextN)}/${toNp(d)}`, `${nextN}/${d}`);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const [a, b] = TOUR[li % TOUR.length];
      applyFraction(a, b, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Quiz Questions for Challenge Mode
  const quizData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const dd = rnd(2, 8);
    return { n: rnd(1, dd - 1), d: dd, kind: i % 3 };
  }), []);

  const questions: (QuizQuestion & { f: [number, number] })[] = quizData.map((q, i) => {
    const t = `${toNp(q.n)}/${toNp(q.d)}`;
    if (q.kind === 0) {
      const o = shuffle(
        Array.from(new Set([`${q.n}/${q.d}`, `${q.d - q.n || 1}/${q.d}`, `${q.n}/${q.d + 1}`])),
        i + 2
      );
      return {
        f: [q.n, q.d],
        np: 'चित्रमा खाइएको भाग कुन भिन्न हो?',
        en: 'Which fraction of the bar has been eaten?',
        answer: `${q.n}/${q.d}`,
        options: o.map((k) => ({
          key: k,
          label: k.split('/').map((x) => toNp(x)).join('/'),
        })),
      };
    }
    if (q.kind === 1) {
      const o = shuffle(Array.from(new Set([q.d, q.n, q.d + 2])), i + 4);
      return {
        f: [q.n, q.d],
        np: `${t} मा हर (Denominator) कति हो?`,
        en: `In ${q.n}/${q.d}, what is the denominator?`,
        answer: String(q.d),
        options: o.map((x) => ({ key: String(x), label: toNp(x) })),
      };
    }
    const o = shuffle(Array.from(new Set([q.n, q.d, q.n + 2])), i + 6);
    return {
      f: [q.n, q.d],
      np: `${t} मा अंश (Numerator) कति हो?`,
      en: `In ${q.n}/${q.d}, what is the numerator?`,
      answer: String(q.n),
      options: o.map((x) => ({ key: String(x), label: toNp(x) })),
    };
  });

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #78350F',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, fontWeight: 900, fontSize: 24, color: '#78350F' }}>
        <span style={{ borderBottom: '2.5px solid currentColor', padding: '0 4px 2px' }}>{toNp(n)}</span>
        <span style={{ paddingTop: 2 }}>{toNp(d)}</span>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#26332E' }}>
          {fword(n, d)}
        </div>
        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800 }}>
          {kit.t('अंश (लिएको) / हर (कुल भाग)', 'numerator / denominator')}
        </div>
      </div>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => applyFraction(q.f[0], q.f[1])} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#26332E' }}>
          {kit.t('कुल भाग (हर):', 'Denominator:')}
        </span>
        {[2, 3, 4, 5, 6, 8].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => applyFraction(Math.min(n, num), num, true)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontWeight: 900,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              background: d === num ? '#78350F' : '#E2E8F0',
              color: d === num ? '#FFFFFF' : '#334155',
            }}
          >
            {toNp(num)}
          </button>
        ))}

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को भिन्न', 'Next')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn
            color="#D97706"
            onClick={() => {
              const nextD = rnd(2, 8);
              const nextN = rnd(1, nextD);
              applyFraction(nextN, nextD);
            }}
          >
            🎲 {kit.t('नयाँ भिन्न', 'Random')}
          </CBtn>
        )}
      </div>
    </Controls>
  );

  return (
    <SimFrame2D kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} grade={3}>
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          gap: 20,
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: '36px 40px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            maxWidth: 780,
            width: '100%',
          }}
        >
          {/* Chocolate Bar 2D Display */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              background: '#FDE68A',
              padding: 10,
              borderRadius: 16,
              border: '3px solid #D97706',
              boxShadow: '0 8px 20px rgba(120, 53, 15, 0.15)',
              maxWidth: '100%',
              overflowX: 'auto',
            }}
          >
            {Array.from({ length: d }).map((_, i) => {
              const isTaken = i < n;
              return (
                <div
                  key={i}
                  onClick={() => togglePiece(i)}
                  style={{
                    width: Math.min(80, 560 / d),
                    height: 120,
                    borderRadius: 10,
                    background: isTaken ? '#78350F' : '#FEF3C7',
                    border: `2.5px solid ${isTaken ? '#451A03' : '#F59E0B'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isTaken ? 'inset 0 2px 6px rgba(0,0,0,0.35)' : 'none',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{isTaken ? '🍫' : '⬜'}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: isTaken ? '#FDE68A' : '#B45309',
                      marginTop: 6,
                    }}
                  >
                    १/{toNp(d)}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 800 }}>
            {kit.t('चकलेटको टुक्रा छोएर अंश (लिएको भाग) परिवर्तन गर्नुहोस्', 'Tap pieces to toggle numerator')}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
