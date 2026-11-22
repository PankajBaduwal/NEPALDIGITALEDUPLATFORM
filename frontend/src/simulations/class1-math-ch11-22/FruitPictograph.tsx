/**
 * Chapter 22 · Pictograph (चित्रचार्ट)
 * Sim 1: Fruit Pictograph (फलफूल चित्रचार्ट) — Pure 2D Edition
 * 100% 2D SVG / CSS Charts – No Three.js/WebGL dependencies.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface FruitCategory {
  id: string;
  nameEn: string;
  nameNp: string;
  emoji: string;
  color: string;
}

const FRUIT_COLS: FruitCategory[] = [
  { id: 'apple', nameEn: 'Apple', nameNp: 'स्याउ', emoji: '🍎', color: '#EF4444' },
  { id: 'banana', nameEn: 'Banana', nameNp: 'केरा', emoji: '🍌', color: '#F59E0B' },
  { id: 'orange', nameEn: 'Orange', nameNp: 'सुन्तला', emoji: '🍊', color: '#FB923C' },
  { id: 'mango', nameEn: 'Mango', nameNp: 'आँप', emoji: '🥭', color: '#EAB308' },
];

export const FruitPictograph: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH22-01',
    chapter: 22,
    titleNp: 'फलफूल चित्रचार्ट (Pictograph)',
    titleEn: 'Fruit Pictograph (Chart Reading)',
  });

  const [counts, setCounts] = useState<Record<string, number>>({
    apple: 5,
    banana: 4,
    orange: 6,
    mango: 3,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const addFruit = (id: string) => {
    kit.tap();
    setCounts((prev) => ({ ...prev, [id]: Math.min(8, prev[id] + 1) }));
  };

  const removeFruit = (id: string) => {
    kit.tap();
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }));
  };

  const totalFruits = Object.values(counts).reduce((a, b) => a + b, 0);

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: 'चित्रचार्टमा सबैभन्दा बढी सङ्ख्यामा कुन फलफूल छ?',
        en: 'Which fruit is present in the largest quantity on the chart?',
        options: [
          { key: 'orange', label: isNe ? 'सुन्तला (Orange)' : 'Orange' },
          { key: 'apple', label: isNe ? 'स्याउ (Apple)' : 'Apple' },
          { key: 'banana', label: isNe ? 'केरा (Banana)' : 'Banana' },
        ],
        answer: 'orange',
      },
      {
        np: 'स्याउको सङ्ख्या कति छ?',
        en: 'What is the count of apples on the chart?',
        options: [
          { key: '5', label: isNe ? '५' : '5' },
          { key: '4', label: isNe ? '४' : '4' },
          { key: '6', label: isNe ? '६' : '6' },
        ],
        answer: '5',
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
            fontSize: 20,
            color: '#187C68',
          }}
        >
          📊 {L(`जम्मा फलफूल: ${toNp(totalFruits)} वटा`, `Total Fruits: ${totalFruits}`)}
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
              {L('फलफूल थप्न वा घटाउन बटन थिच्नुहोस्:', 'Add or remove fruits to update pictograph:')}
            </span>
            {FRUIT_COLS.map((col) => (
              <div key={col.id} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button
                  onClick={() => addFruit(col.id)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 10,
                    padding: '6px 12px',
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  + {col.emoji} {isNe ? col.nameNp : col.nameEn}
                </button>
              </div>
            ))}
          </div>
        )
      }
    >
      {/* ── 2D Pictograph Column Chart ────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 460,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'linear-gradient(180deg, #E0F2FE 0%, #F5F7F5 60%)',
        }}
      >
        <div
          style={{
            width: 'min(760px, 94vw)',
            height: '340px',
            background: '#FFFFFF',
            borderRadius: 24,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            padding: '24px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
            alignItems: 'end',
            position: 'relative',
          }}
        >
          {FRUIT_COLS.map((col) => {
            const count = counts[col.id];

            return (
              <div
                key={col.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {/* Stack of fruit icons */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: 6,
                    minHeight: 200,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                  }}
                >
                  {Array.from({ length: count }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 32,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                        animation: 'simPop 0.25s ease',
                      }}
                    >
                      {col.emoji}
                    </div>
                  ))}
                </div>

                {/* Number Badge */}
                <div
                  style={{
                    background: col.color,
                    color: '#FFF',
                    padding: '2px 10px',
                    borderRadius: 10,
                    fontWeight: 900,
                    fontSize: 14,
                  }}
                >
                  {isNe ? toNp(count) : count}
                </div>

                {/* Column Base Label */}
                <div style={{ fontWeight: 900, fontSize: 14, color: '#1E293B', textAlign: 'center' }}>
                  {isNe ? col.nameNp : col.nameEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SimFrame2D>
  );
};
