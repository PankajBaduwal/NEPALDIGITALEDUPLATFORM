/**
 * Class 4 lesson 15 · Algebra
 * BalanceAlgebra — 2D Interactive algebraic balance scale (x + a = b or a·x = b).
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, Props, numQ } from './h4';

interface Eq {
  kind: 0 | 1; // 0: x + a = b, 1: a·x = b
  a: number;
  x: number;
  b: number;
}

const makeEq = (kind: 0 | 1 = 0): Eq => {
  if (kind === 0) {
    const a = rnd(2, 9);
    const x = rnd(2, 10);
    return { kind, a, x, b: a + x };
  }
  const a = rnd(2, 4);
  const x = rnd(2, 6);
  return { kind, a, x, b: a * x };
};

const getEqText = (e: Eq) => (e.kind === 0 ? `x + ${e.a} = ${e.b}` : `${e.a}x = ${e.b}`);

export const BalanceAlgebra: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L15-01',
    chapter: 15,
    titleNp: 'तराजु बीजगणित (समीकरण)',
    titleEn: 'Balance Algebra (Equations)',
  });

  const [eq, setEq] = useState<Eq>(() => makeEq(0));
  const [guessX, setGuessX] = useState(1);

  const leftWeight = eq.kind === 0 ? guessX + eq.a : guessX * eq.a;
  const rightWeight = eq.b;
  const isBalanced = leftWeight === rightWeight;

  const tiltAngle = Math.max(-12, Math.min(12, (rightWeight - leftWeight) * 3));

  const bumpGuess = (delta: number) => {
    const next = Math.max(0, Math.min(15, guessX + delta));
    setGuessX(next);
    kit.tap();
    const curLeft = eq.kind === 0 ? next + eq.a : next * eq.a;
    if (curLeft === rightWeight) {
      kit.good();
      kit.star();
      kit.say(`तराजु बराबर भयो! x = ${next}`, `Balanced! x = ${next}`);
    } else {
      kit.say(
        curLeft < rightWeight ? 'बायाँतिर हलुङ्गो भयो' : 'बायाँतिर गह्रुङ्गो भयो',
        curLeft < rightWeight ? 'Left side is lighter' : 'Left side is heavier'
      );
    }
  };

  const fresh = () => {
    const nextKind: 0 | 1 = rnd(0, 1) ? 0 : 1;
    const next = makeEq(nextKind);
    setEq(next);
    setGuessX(1);
    kit.tap();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qe = makeEq(i % 2 === 0 ? 0 : 1);
      return numQ(
        `${getEqText(qe)} मा x को मान कति हुन्छ?`,
        `In ${getEqText(qe)}, what is the value of x?`,
        qe.x,
        i,
        [1, -1, 2, -2],
        (v) => fmt(kit.lang, v),
        1
      );
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={
        isBalanced
          ? kit.t(
            `तराजु सन्तुलनमा आयो! ${getEqText(eq)} → x = ${eq.x}`,
            `The scale is balanced! ${getEqText(eq)} → x = ${eq.x}`
          )
          : kit.t(
            `समीकरण: ${getEqText(eq)}। x को मान अनुमान गरी तराजु सन्तुलनमा ल्याऔँ!`,
            `Equation: ${getEqText(eq)}. Adjust x until the scale balances!`
          )
      }
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => bumpGuess(-1)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#EF4444',
              color: '#FFFFFF',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            x − 1
          </button>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#1E293B', padding: '0 8px' }}>
            x = {fmt(kit.lang, guessX)}
          </div>
          <button
            onClick={() => bumpGuess(1)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#187C68',
              color: '#FFFFFF',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            x + 1
          </button>
          <button
            onClick={fresh}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🎲 {kit.t('नयाँ समीकरण', 'New Equation')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 660, gap: 16 }}>
        {/* Equation Status Banner */}
        <div
          style={{
            background: isBalanced ? '#DCFCE7' : '#FFFFFF',
            border: isBalanced ? '2px solid #16A34A' : '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900, color: isBalanced ? '#15803D' : '#1E293B' }}>
            {getEqText(eq)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: isBalanced ? '#166534' : '#64748B', marginTop: 4 }}>
            {isBalanced
              ? kit.t('✓ दुवैतिर बराबर भयो!', '✓ Perfectly Balanced!')
              : leftWeight < rightWeight
                ? kit.t(`बायाँ तौल (${leftWeight}) < दायाँ तौल (${rightWeight})`, `Left (${leftWeight}) < Right (${rightWeight})`)
                : kit.t(`बायाँ तौल (${leftWeight}) > दायाँ तौल (${rightWeight})`, `Left (${leftWeight}) > Right (${rightWeight})`)}
          </div>
        </div>

        {/* 2D SVG Balance Scale */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            padding: '24px 20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 520 250" style={{ width: '100%', maxWidth: 520 }}>
            {/* Stand Base & Pole */}
            <rect x="235" y="80" width="50" height="130" fill="#475569" rx="6" />
            <polygon points="260,60 235,90 285,90" fill="#334155" />
            <rect x="190" y="210" width="140" height="14" fill="#1E293B" rx="4" />

            {/* Fulcrum Pivot Pin */}
            <circle cx="260" cy="70" r="7" fill="#EF4444" />

            {/* Tilting Beam */}
            <g
              transform={`rotate(${tiltAngle}, 260, 70)`}
              style={{ transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <rect x="70" y="66" width="380" height="8" rx="4" fill="#B45309" />

              {/* Left Pan Attachment */}
              <g transform="translate(100, 70)">
                <line x1="0" y1="0" x2="-35" y2="60" stroke="#64748B" strokeWidth="2" />
                <line x1="0" y1="0" x2="35" y2="60" stroke="#64748B" strokeWidth="2" />
                <ellipse cx="0" cy="60" rx="48" ry="10" fill="#94A3B8" />

                {/* Items on Left Pan */}
                <g transform="translate(0, 48)">
                  {/* x bag */}
                  <circle cx="-16" cy="-10" r="14" fill="#8B5CF6" />
                  <text x="-16" y="-6" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">
                    x
                  </text>
                  {/* Additional constant cubes */}
                  {eq.kind === 0 && (
                    <g transform="translate(16, -10)">
                      <rect x="-10" y="-10" width="20" height="20" rx="3" fill="#F59E0B" />
                      <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">
                        {eq.a}
                      </text>
                    </g>
                  )}
                </g>
              </g>

              {/* Right Pan Attachment */}
              <g transform="translate(420, 70)">
                <line x1="0" y1="0" x2="-35" y2="60" stroke="#64748B" strokeWidth="2" />
                <line x1="0" y1="0" x2="35" y2="60" stroke="#64748B" strokeWidth="2" />
                <ellipse cx="0" cy="60" rx="48" ry="10" fill="#94A3B8" />

                {/* Constant cubes on Right Pan */}
                <g transform="translate(0, 40)">
                  <rect x="-16" y="-12" width="32" height="24" rx="4" fill="#10B981" />
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900">
                    {eq.b}
                  </text>
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default BalanceAlgebra;
