/**
 * Chapter 13 · Number names up to 20
 * Sim 1: Number Name Blocks — Pure 2D Edition
 * 100% 2D SVG / Interactive Blocks – No Three.js/WebGL dependencies.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NUM_NAMES_EN = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
  'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY'
];

const NUM_NAMES_NP = [
  '', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दश',
  'एघार', 'बाह्र', 'तेह्र', 'चौध', 'पन्ध्र', 'सोह्र', 'सत्र', 'अठार', 'उन्नीस', 'बीस'
];

export const NumberNameBlocks: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH13-01',
    chapter: 13,
    titleNp: 'सङ्ख्याको नाम बनाऔँ (1–20)',
    titleEn: 'Number Name Blocks (1–20)',
  });

  const [n, setN] = useState<number>(5);
  const [typedLetters, setTypedLetters] = useState<string[]>([]);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const targetWord = isNe ? NUM_NAMES_NP[n] : NUM_NAMES_EN[n];
  const targetChars = targetWord.split('');

  const handleTapChar = (char: string) => {
    kit.tap();
    const nextTyped = [...typedLetters, char];
    setTypedLetters(nextTyped);

    if (nextTyped.join('') === targetWord) {
      kit.good(
        `सबास! ${toNp(n)} लाई "${targetWord}" लेखिन्छ!`,
        `Great job! ${n} is spelled "${targetWord}"!`
      );
    }
  };

  const clearTyped = () => {
    kit.tap();
    setTypedLetters([]);
  };

  const changeNumber = (newN: number) => {
    kit.tap();
    setN(newN);
    setTypedLetters([]);
  };

  // Scrambled letters bank including target letters and a few decoys
  const scrambledChoices = useMemo(() => {
    const chars = targetWord.split('');
    const decoys = isNe ? ['क', 'म', 'न', 'र', 'ल'] : ['A', 'E', 'R', 'S', 'T'];
    return [...chars, ...decoys.slice(0, 3)].sort(() => Math.random() - 0.5);
  }, [targetWord, isNe]);

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: '5 को अङ्ग्रेजी नाम के हो?',
        en: 'What is the number name for 5?',
        options: [
          { key: 'FIVE', label: 'FIVE' },
          { key: 'FOUR', label: 'FOUR' },
          { key: 'SIX', label: 'SIX' },
        ],
        answer: 'FIVE',
      },
      {
        np: '10 को अङ्ग्रेजी नाम के हो?',
        en: 'What is the number name for 10?',
        options: [
          { key: 'TEN', label: 'TEN' },
          { key: 'TWO', label: 'TWO' },
          { key: 'TWELVE', label: 'TWELVE' },
        ],
        answer: 'TEN',
      },
      {
        np: '15 लाई अङ्ग्रेजीमा के भनिन्छ?',
        en: 'What is the number name for 15?',
        options: [
          { key: 'FIFTEEN', label: 'FIFTEEN' },
          { key: 'FIFTY', label: 'FIFTY' },
          { key: 'FIVE', label: 'FIVE' },
        ],
        answer: 'FIFTEEN',
      },
    ],
    []
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
          {isNe ? toNp(n) : n} = <span style={{ color: '#047857' }}>{targetWord}</span>
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
                {L('सङ्ख्या रोज्नुहोस्:', 'Pick number:')}
              </span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20].map((val) => (
                <button
                  key={val}
                  onClick={() => changeNumber(val)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    border: n === val ? '2px solid #187C68' : '1px solid #CBD5E1',
                    background: n === val ? '#187C68' : '#FFFFFF',
                    color: n === val ? '#FFFFFF' : '#334155',
                    fontWeight: 900,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  {isNe ? toNp(val) : val}
                </button>
              ))}

              <button
                onClick={clearTyped}
                style={{
                  marginLeft: 'auto',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                🔄 {L('अक्षर मेटाउनुहोस्', 'Clear Letters')}
              </button>
            </div>
          </div>
        )
      }
    >
      {/* ── Main 2D Stage: Word Slots and Letter Tiles ─────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 440,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          padding: 24,
          background: 'linear-gradient(180deg, #E0F2FE 0%, #F5F7F5 60%)',
        }}
      >
        {/* Count Representation (Stars or Apples) */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 480 }}>
          {Array.from({ length: n }).map((_, i) => (
            <span key={i} style={{ fontSize: 30, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
              ⭐
            </span>
          ))}
        </div>

        {/* Target Spelling Slots */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {targetChars.map((char, i) => {
            const filledChar = typedLetters[i];
            const isFilled = filledChar !== undefined;
            const isMatch = isFilled && filledChar === char;

            return (
              <div
                key={i}
                style={{
                  width: 54,
                  height: 60,
                  borderRadius: 14,
                  background: isFilled ? (isMatch ? '#E6F3E9' : '#FEF2F2') : '#FFFFFF',
                  border: isFilled
                    ? isMatch
                      ? '3px solid #187C68'
                      : '3px solid #EF4444'
                    : '2px dashed #94A3B8',
                  color: isMatch ? '#187C68' : '#B91C1C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 900,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                  animation: isFilled ? 'simPop 0.2s' : 'none',
                }}
              >
                {filledChar || ''}
              </div>
            );
          })}
        </div>

        {/* Letter Choice Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 520 }}>
          {scrambledChoices.map((char, i) => (
            <button
              key={i}
              onClick={() => handleTapChar(char)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: '#FFFFFF',
                border: '2px solid #187C68',
                color: '#187C68',
                fontSize: 24,
                fontWeight: 900,
                boxShadow: '0 4px 8px rgba(24,124,104,0.18)',
                cursor: 'pointer',
                transition: 'transform 0.1s',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    </SimFrame2D>
  );
};
