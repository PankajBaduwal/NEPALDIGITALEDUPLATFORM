/**
 * Lesson 3 · Comparison of numbers (सङ्ख्याको तुलना)
 * Digit Duel — two five-digit numbers compared place by place from left to right; choose >, < or =.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, shuffle, toNp } from '../class1-math-kit/nepali';
import { big, fmt, digitsOf, PLACES } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

const sym = (a: number, b: number) => (a > b ? '>' : a < b ? '<' : '=');

export const DigitDuel: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L3-01',
    chapter: 3,
    titleNp: 'अङ्कको द्वन्द्व (तुलना)',
    titleEn: 'Digit Duel (Comparison)',
  });

  const [a, setA] = useState(48215);
  const [b, setB] = useState(48721);
  const [activeCol, setActiveCol] = useState(-1);
  const [revealed, setRevealed] = useState(false);
  const [guess, setGuess] = useState<string | null>(null);

  const da = digitsOf(a);
  const db = digitsOf(b);

  const newPair = () => {
    const x = rnd(10000, 99999);
    // 50% chance of differing in higher places, 25% near end, 10% equal
    const r = rnd(0, 9);
    let y = x;
    if (r !== 0) {
      const matchPlaces = rnd(0, 3);
      const strA = String(x);
      const diffDigit = (Number(strA[matchPlaces]) + rnd(1, 8)) % 10;
      const strB = strA.slice(0, matchPlaces) + diffDigit + strA.slice(matchPlaces + 1);
      y = Number(strB);
      if (y < 10000) y += 10000;
    }
    setA(x);
    setB(y);
    setActiveCol(-1);
    setRevealed(false);
    setGuess(null);
  };

  const walkStepByStep = () => {
    setActiveCol(0);
    setRevealed(false);
    kit.tap();

    let c = 0;
    const interval = setInterval(() => {
      setActiveCol(c);
      kit.tap();
      if (da[c] !== db[c] || c === 4) {
        clearInterval(interval);
        setRevealed(true);
        const s = sym(a, b);
        kit.say(
          s === '='
            ? 'सबै अङ्क बराबर छन् — दुवै सङ्ख्या बराबर छन्'
            : `${PLACES[c].np}को अङ्क ${toNp(da[c])} र ${toNp(db[c])} फरक छ — ${a > b ? 'पहिलो ठूलो' : 'दोस्रो ठूलो'}`,
          s === '='
            ? 'All digits match — numbers are equal'
            : `${PLACES[c].en} digits differ: ${da[c]} vs ${db[c]}`
        );
      } else {
        c += 1;
      }
    }, 800);
  };

  const handleGuess = (sign: string) => {
    const correct = sym(a, b);
    setGuess(sign);
    setRevealed(true);
    if (sign === correct) {
      kit.good(
        `स्याबास! ${toNp(a.toLocaleString('en-US'))} ${sign} ${toNp(b.toLocaleString('en-US'))} सही हो!`,
        `Correct! ${a.toLocaleString('en-US')} ${sign} ${b.toLocaleString('en-US')}`
      );
      kit.star();
    } else {
      kit.oops('ध्यान दिएर बायाँतर्फबाट पहिलो फरक अङ्क तुलना गरौँ', 'Compare digits from left to right.');
    }
  };

  useEffect(() => {
    newPair();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz Questions for Challenge Mode
  const quizData = useMemo(() => Array.from({ length: 6 }, () => {
    const x = rnd(10000, 99999);
    const y = rnd(0, 4) === 0 ? x : x + rnd(-300, 300);
    return { a: x, b: Math.max(10000, Math.min(99999, y)) };
  }), []);

  const questions: QuizQuestion[] = quizData.map((d) => ({
    np: `${toNp(d.a.toLocaleString('en-US'))} ___ ${toNp(d.b.toLocaleString('en-US'))} मा कुन चिह्न मिल्छ?`,
    en: `Which sign completes ${d.a.toLocaleString('en-US')} ___ ${d.b.toLocaleString('en-US')}?`,
    answer: sym(d.a, d.b),
    options: ['>', '<', '='].map((s) => ({ key: s, label: s })),
  }));

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontSize: 18,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      <span style={{ color: '#0284C7' }}>{toNp(a.toLocaleString('en-US'))}</span>{' '}
      <span style={{ color: '#187C68', padding: '0 6px' }}>{revealed ? sym(a, b) : '?'}</span>{' '}
      <span style={{ color: '#E11D48' }}>{toNp(b.toLocaleString('en-US'))}</span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => { setA(q.a); setB(q.b); setRevealed(false); }} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', gap: 6 }}>
          {['>', '=', '<'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleGuess(s)}
              style={{
                width: 48,
                height: 44,
                borderRadius: 10,
                fontSize: 22,
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                background: guess === s ? (s === sym(a, b) ? '#16A34A' : '#DC2626') : '#187C68',
                color: '#FFFFFF',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <CBtn color="#059669" onClick={walkStepByStep}>
          🔍 {kit.t('स्थानमान तुलना गरौँ', 'Step-by-Step Compare')}
        </CBtn>
        <CBtn color="#64748B" onClick={newPair}>
          🎲 {kit.t('नयाँ सङ्ख्याहरू', 'New Pair')}
        </CBtn>
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
            padding: '30px 40px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            maxWidth: 780,
            width: '100%',
          }}
        >
          {/* Column Place Labels */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 12,
              width: '100%',
              textAlign: 'center',
            }}
          >
            {PLACES.map((p, i) => (
              <div
                key={p.en}
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: activeCol === i ? '#DC2626' : p.color,
                  background: activeCol === i ? '#FEE2E2' : '#F8FAFC',
                  padding: '6px 4px',
                  borderRadius: 8,
                  border: activeCol === i ? '2px solid #EF4444' : '1px solid #E2E8F0',
                }}
              >
                {kit.lang === 'ne' ? p.np : p.en}
              </div>
            ))}
          </div>

          {/* Row A: First Number */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#0284C7', minWidth: 50 }}>
              {kit.t('सङ्ख्या १:', 'Num 1:')}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, flex: 1 }}>
              {da.map((digit, i) => (
                <div
                  key={i}
                  style={{
                    background: activeCol === i ? '#E0F2FE' : '#FFFFFF',
                    border: `2.5px solid ${activeCol === i ? '#0284C7' : '#CBD5E1'}`,
                    borderRadius: 12,
                    padding: '12px 0',
                    textAlign: 'center',
                    fontSize: 26,
                    fontWeight: 900,
                    color: '#0284C7',
                    boxShadow: activeCol === i ? '0 4px 12px rgba(2, 132, 199, 0.2)' : 'none',
                  }}
                >
                  {toNp(digit)}
                </div>
              ))}
            </div>
          </div>

          {/* Middle Sign Badge */}
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#F1F5F9',
              border: '3px solid #187C68',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 900,
              color: '#187C68',
            }}
          >
            {revealed ? sym(a, b) : '?'}
          </div>

          {/* Row B: Second Number */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#E11D48', minWidth: 50 }}>
              {kit.t('सङ्ख्या २:', 'Num 2:')}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, flex: 1 }}>
              {db.map((digit, i) => (
                <div
                  key={i}
                  style={{
                    background: activeCol === i ? '#FFE4E6' : '#FFFFFF',
                    border: `2.5px solid ${activeCol === i ? '#E11D48' : '#CBD5E1'}`,
                    borderRadius: 12,
                    padding: '12px 0',
                    textAlign: 'center',
                    fontSize: 26,
                    fontWeight: 900,
                    color: '#E11D48',
                    boxShadow: activeCol === i ? '0 4px 12px rgba(225, 29, 72, 0.2)' : 'none',
                  }}
                >
                  {toNp(digit)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
