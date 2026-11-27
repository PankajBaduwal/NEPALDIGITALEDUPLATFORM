/**
 * Chapter 17 · Subtraction of numbers up to two digits (दुई अङ्कसम्मका सङ्ख्याको घटाउ)
 * Sim 1: Break and Take Away (फुकाऔँ र घटाऔँ) — Pure 2D Edition
 * 100% 2D SVG / CSS Animations – No Three.js/WebGL dependencies.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

export const BreakAndTakeAway: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH17-01',
    chapter: 17,
    titleNp: 'फुकाऔँ र घटाऔँ (दुई अङ्कको घटाउ)',
    titleEn: 'Break and Take Away (Subtraction with Borrowing)',
  });

  const [start, setStart] = useState<number>(32);
  const [take, setTake] = useState<number>(15);
  const [isBroken, setIsBroken] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const diff = start - take;
  const initialTens = Math.floor(start / 10);
  const initialOnes = start % 10;

  const currentTens = isBroken ? initialTens - 1 : initialTens;
  const currentOnes = isBroken ? initialOnes + 10 : initialOnes;

  const handleBreakTen = () => {
    kit.tap();
    setIsBroken(true);
    kit.good(
      '१ दशक फुकाएर १० एकाइ बनाइयो! अब सजिलै घटाउन सकिन्छ।',
      'Unbundled 1 ten into 10 ones! Now we can subtract easily.'
    );
  };

  const handleSubtract = () => {
    kit.tap();
    setIsDone(true);
    kit.good(
      `${toNp(start)} बाट ${toNp(take)} घटाउँदा बाँकी = ${toNp(diff)}`,
      `${start} − ${take} = ${diff}`
    );
  };

  const newProblem = () => {
    kit.tap();
    const newStart = Math.floor(Math.random() * 30) + 22; // 22 to 51
    const newTake = Math.floor(Math.random() * (newStart - 10)) + 6;
    setStart(newStart);
    setTake(newTake);
    setIsBroken(false);
    setIsDone(false);
  };

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: '३२ − १५ गर्दा कति बाँकी रहन्छ?',
        en: 'What is 32 − 15?',
        options: [
          { key: '17', label: isNe ? '१७' : '17' },
          { key: '18', label: isNe ? '१८' : '18' },
          { key: '15', label: isNe ? '१५' : '15' },
        ],
        answer: '17',
      },
      {
        np: '१ दशक फुकाउँदा कतिवटा एकाइ बन्छन्?',
        en: 'Unbundling 1 ten gives how many ones?',
        options: [
          { key: '10', label: isNe ? '१० एकाइ' : '10 ones' },
          { key: '5', label: isNe ? '५ एकाइ' : '5 ones' },
          { key: '1', label: isNe ? '१ एकाइ' : '1 one' },
        ],
        answer: '10',
      },
      {
        np: '४० − १३ को घटाउफल कति हुन्छ?',
        en: 'What is 40 − 13?',
        options: [
          { key: '27', label: isNe ? '२७' : '27' },
          { key: '28', label: isNe ? '२८' : '28' },
          { key: '37', label: isNe ? '३७' : '37' },
        ],
        answer: '27',
      },
    ],
    [isNe]
  );

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      hud={
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #187C68',
            borderRadius: 16,
            padding: '8px 18px',
            boxShadow: '0 4px 12px rgba(24,124,104,0.15)',
            fontWeight: 900,
            fontSize: 22,
            color: '#187C68',
          }}
        >
          {isNe ? toNp(start) : start} − {isNe ? toNp(take) : take} ={' '}
          <span style={{ color: isDone ? '#047857' : '#94A3B8' }}>
            {isDone ? (isNe ? toNp(diff) : diff) : '?'}
          </span>
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {!isBroken && initialOnes < take % 10 && (
              <button
                onClick={handleBreakTen}
                style={{
                  background: '#D97706',
                  color: '#FFF',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(217,119,6,0.25)',
                }}
              >
                🔓 {L('१ दशक फुकाऔँ (Unbundle 1 Ten to 10 Ones)', 'Unbundle 1 Ten')}
              </button>
            )}

            <button
              onClick={handleSubtract}
              disabled={isDone}
              style={{
                background: isDone ? '#CBD5E1' : '#187C68',
                color: '#FFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 900,
                cursor: isDone ? 'default' : 'pointer',
                boxShadow: '0 4px 10px rgba(24,124,104,0.25)',
              }}
            >
              ✂️ {L('घटाऔँ (Subtract)', 'Subtract')}
            </button>

            <button
              onClick={newProblem}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '12px 18px',
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔄 {L('नयाँ प्रश्न', 'New Problem')}
            </button>
          </div>
        )
      }
    >
      {/* ── 2D Unbundling Workspace ───────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 460,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(220px, 0.8fr)',
          gap: 20,
          padding: 24,
          background: 'linear-gradient(180deg, #FCE8EF 0%, #F5F7F5 60%)',
        }}
      >
        {/* Workspace Block Area */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            padding: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: '#187C68' }}>
            🧱 {L(`शुरुको सङ्ख्या: ${toNp(start)}`, `Starting Number: ${start}`)}
          </div>

          {/* Tens */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0369A1', marginBottom: 6 }}>
              📦 {L(`दशक (Tens): ${toNp(currentTens)} वटा`, `Tens: ${currentTens}`)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: currentTens }).map((_, i) => (
                <div key={i} style={{ width: 24, height: 75, background: '#0284C7', borderRadius: 6 }} />
              ))}
            </div>
          </div>

          {/* Ones */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#D97706', marginBottom: 6 }}>
              🔶 {L(`एकाइ (Ones): ${toNp(currentOnes)} वटा`, `Ones: ${currentOnes}`)}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Array.from({ length: currentOnes }).map((_, i) => {
                const isCrossed = isDone && i < take % 10;
                return (
                  <div
                    key={i}
                    style={{
                      width: 22,
                      height: 22,
                      background: isCrossed ? '#CBD5E1' : '#F59E0B',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EF4444',
                      fontWeight: 900,
                      fontSize: 14,
                    }}
                  >
                    {isCrossed ? '✕' : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Calculation Note */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            padding: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 800, color: '#64748B' }}>
            {L('घटाउने कार्यविधि:', 'Steps:')}
          </div>
          <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
            1. {L(`पहिले एकाइ घटाउने (${toNp(initialOnes)} − ${toNp(take % 10)})`, `Subtract ones first`)}
            <br />
            {initialOnes < take % 10 && (
              <span style={{ color: '#D97706', fontWeight: 800 }}>
                ⚠️ {L('एकाइ नपुगेकाले १ दशक फुकाइयो (+१० एकाइ)', 'Not enough ones, unbundled 1 ten')}
                <br />
              </span>
            )}
            2. {L(`दशकबाट दशक घटाउने`, `Subtract tens from tens`)}
          </div>

          {isDone && (
            <div
              style={{
                background: '#E6F3E9',
                border: '2px solid #10B981',
                borderRadius: 14,
                padding: '12px 16px',
                marginTop: 10,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18, color: '#065F46' }}>
                🎉 {L(`बाँकी = ${toNp(diff)}`, `Remaining = ${diff}`)}
              </div>
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};
