/**
 * SubtractionPlayground.tsx (Converted to 100% Pure 2D)
 * Simulation 01: Subtraction Playground
 * Class 1 Mathematics - Chapter 8: Subtraction up to 10
 * Nepal CDC Curriculum Aligned
 * 100% Pure 2D Vector & Canvas – Zero WebGL/Three.js.
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

export const SubtractionPlayground: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH8-01',
    chapter: 8,
    titleNp: 'घटाउ खेलमैदान (10 सम्मको घटाउ)',
    titleEn: 'Subtraction Playground (Up to 10)',
  });

  const [totalCount, setTotalCount] = useState<number>(7);
  const [takeAwayCount, setTakeAwayCount] = useState<number>(3);
  const remaining = totalCount - takeAwayCount;

  const questions: QuizQuestion[] = [
    {
      np: '8 वटा चरामध्ये 3 वटा उडेर गए भने कति बाँकी रहन्छन्? (8 - 3 = ?)',
      en: 'If 3 birds fly away from a group of 8, how many remain? (8 - 3 = ?)',
      options: [
        { key: '5', label: kit.t('5', '5 (Five)') },
        { key: '4', label: kit.t('4', '4 (Four)') },
        { key: '6', label: kit.t('6', '6 (Six)') },
      ],
      answer: '5',
    },
    {
      np: '10 - 4 = ?',
      en: '10 - 4 = ?',
      options: [
        { key: '6', label: kit.t('6', '6 (Six)') },
        { key: '5', label: kit.t('5', '5 (Five)') },
        { key: '7', label: kit.t('7', '7 (Seven)') },
      ],
      answer: '6',
    },
    {
      np: 'कुनै सङ्ख्याबाट सोही सङ्ख्या घटाउँदा के बाँकी हुन्छ? (5 - 5 = ?)',
      en: 'What is left when a number is subtracted from itself? (5 - 5 = ?)',
      options: [
        { key: '0', label: kit.t('0', '0 (Zero)') },
        { key: '1', label: kit.t('1', '1 (One)') },
      ],
      answer: '0',
    },
    {
      np: '7 - 0 = ?',
      en: '7 - 0 = ?',
      options: [
        { key: '7', label: kit.t('7', '7 (Seven)') },
        { key: '0', label: kit.t('0', '0 (Zero)') },
      ],
      answer: '7',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      mascotGreeting={kit.t(
        'वस्तुहरू झिकेर घटाउ अभ्यास गरौँ र बाँकी कति रह्यो गनौँ!',
        'Take away items from the group to practice subtraction!'
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => {
              const tot = Math.floor(Math.random() * 6) + 4;
              const sub = Math.floor(Math.random() * tot) + 1;
              setTotalCount(tot);
              setTakeAwayCount(sub);
              kit.tap();
              kit.say(`${toNp(tot)} बाट ${toNp(sub)} घटाउँदा कति बाँकी रहन्छ?`, `What is ${tot} minus ${sub}?`);
            }}
            style={{
              padding: '8px 18px',
              borderRadius: 12,
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontWeight: 'bold',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            🎲 {kit.t('नयाँ घटाउ (New Problem)', 'New Problem')}
          </button>
        </div>
      }
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', boxSizing: 'border-box' }}>
        {/* Subtraction Formula Banner */}
        <div
          style={{
            padding: '16px 32px',
            borderRadius: 20,
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 900, color: '#0284c7' }}>{toNp(totalCount)}</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#dc2626' }}>➖</span>
          <span style={{ fontSize: 32, fontWeight: 900, color: '#ea580c' }}>{toNp(takeAwayCount)}</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#64748b' }}>🟰</span>
          <span style={{ fontSize: 36, fontWeight: 900, color: '#16a34a' }}>{toNp(remaining)}</span>
        </div>

        {/* Visual Item Display */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 20,
            border: '2px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
            width: '100%',
            maxWidth: 620,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 12 }}>
            {kit.t('वस्तुहरू (रातो क्रस भएका वस्तुहरू घटाइएका हुन्):', 'Items (Crossed out items are taken away):')}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 100,
              background: '#f8fafc',
              borderRadius: 16,
              padding: 16,
            }}
          >
            {Array.from({ length: totalCount }).map((_, idx) => {
              const isTakenAway = idx >= remaining;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isTakenAway) {
                      setTakeAwayCount((p) => Math.max(p - 1, 0));
                    } else {
                      setTakeAwayCount((p) => Math.min(p + 1, totalCount));
                    }
                    kit.tap();
                  }}
                  style={{
                    position: 'relative',
                    fontSize: 34,
                    cursor: 'pointer',
                    opacity: isTakenAway ? 0.35 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  title={isTakenAway ? 'Taken away' : 'Remaining'}
                >
                  🎈
                  {isTakenAway && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: 28,
                        color: '#dc2626',
                        fontWeight: 'bold',
                      }}
                    >
                      ❌
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stepper Controls */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 18 }}>
            <button
              disabled={takeAwayCount <= 0}
              onClick={() => {
                setTakeAwayCount((p) => Math.max(p - 1, 0));
                kit.tap();
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                background: takeAwayCount <= 0 ? '#f1f5f9' : '#ffffff',
                fontWeight: 'bold',
                fontSize: 14,
                cursor: takeAwayCount <= 0 ? 'not-allowed' : 'pointer',
              }}
            >
              ➕ {kit.t('फिर्ता थपौँ', 'Put Back')}
            </button>
            <button
              disabled={takeAwayCount >= totalCount}
              onClick={() => {
                setTakeAwayCount((p) => Math.min(p + 1, totalCount));
                kit.tap();
                if (takeAwayCount + 1 === totalCount) kit.star();
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                background: takeAwayCount >= totalCount ? '#f1f5f9' : '#ffffff',
                fontWeight: 'bold',
                fontSize: 14,
                cursor: takeAwayCount >= totalCount ? 'not-allowed' : 'pointer',
                color: '#dc2626',
              }}
            >
              ➖ {kit.t('झिकौँ (Take Away)', 'Take Away')}
            </button>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default SubtractionPlayground;
