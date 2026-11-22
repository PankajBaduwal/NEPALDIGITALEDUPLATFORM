/**
 * Chapter 12 · Odd and Even numbers (जोर र बिजोर सङ्ख्या)
 * Sim 1: Pairing Party (जोडी बनाऔँ) — Pure 2D Edition
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

const LEARN_NUMS = [6, 7, 10, 13, 16, 19];
const BALL_EMOJIS = ['⚽', '🏀', '🎾', '🏐', '⚾', '🎱', '🔮', '🎈'];

export const PairingParty: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH12-01',
    chapter: 12,
    titleNp: 'जोडी बनाऔँ (जोर र बिजोर)',
    titleEn: 'Pairing Party (Odd and Even)',
  });

  const [n, setN] = useState<number>(7);
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [learnIdx, setLearnIdx] = useState<number>(0);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const pairsCount = Math.floor(n / 2);
  const isOdd = n % 2 !== 0;

  const handlePair = () => {
    kit.tap();
    setIsPaired(true);

    if (isOdd) {
      kit.oops('एउटा एक्लै रह्यो! त्यसैले यो बिजोर सङ्ख्या हो।', 'One is left alone! So this is an ODD number.');
    } else {
      kit.good('सबैको जोडी बन्यो! यो जोर सङ्ख्या हो।', 'Everyone has a pair! This is an EVEN number.');
    }
  };

  const changeNumber = (val: number) => {
    kit.tap();
    setN(val);
    setIsPaired(false);
  };

  const nextLearn = () => {
    const nextI = (learnIdx + 1) % LEARN_NUMS.length;
    setLearnIdx(nextI);
    setN(LEARN_NUMS[nextI]);
    setIsPaired(false);
  };

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: 'सङ्ख्या ८ जोर हो कि बिजोर? (८ मा जोडी बन्छ कि बन्दैन?)',
        en: 'Is number 8 Even or Odd?',
        options: [
          { key: 'even', label: isNe ? 'जोर (Even)' : 'Even' },
          { key: 'odd', label: isNe ? 'बिजोर (Odd)' : 'Odd' },
        ],
        answer: 'even',
      },
      {
        np: 'सङ्ख्या ९ जोर हो कि बिजोर?',
        en: 'Is number 9 Even or Odd?',
        options: [
          { key: 'odd', label: isNe ? 'बिजोर (Odd)' : 'Odd' },
          { key: 'even', label: isNe ? 'जोर (Even)' : 'Even' },
        ],
        answer: 'odd',
      },
      {
        np: 'सङ्ख्या १२ जोर हो कि बिजोर?',
        en: 'Is number 12 Even or Odd?',
        options: [
          { key: 'even', label: isNe ? 'जोर (Even)' : 'Even' },
          { key: 'odd', label: isNe ? 'बिजोर (Odd)' : 'Odd' },
        ],
        answer: 'even',
      },
      {
        np: 'सङ्ख्या १५ जोर हो कि बिजोर?',
        en: 'Is number 15 Even or Odd?',
        options: [
          { key: 'odd', label: isNe ? 'बिजोर (Odd)' : 'Odd' },
          { key: 'even', label: isNe ? 'जोर (Even)' : 'Even' },
        ],
        answer: 'odd',
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
          {L(`सङ्ख्या: ${toNp(n)}`, `Number: ${n}`)}{' '}
          {isPaired && (
            <span
              style={{
                marginLeft: 10,
                color: isOdd ? '#D97706' : '#059669',
                fontSize: 18,
              }}
            >
              • {isOdd ? L('बिजोर (ODD)', 'ODD') : L('जोर (EVEN)', 'EVEN')}
            </span>
          )}
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handlePair}
                style={{
                  background: '#187C68',
                  color: '#FFF',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(24,124,104,0.25)',
                }}
              >
                🎀 {L('जोडी बनाऔँ (Make Pairs)', 'Make Pairs')}
              </button>

              {kit.mode === 'LEARN' ? (
                <button
                  onClick={nextLearn}
                  style={{
                    background: '#E7F1FC',
                    color: '#1E3A8A',
                    border: '1px solid #BFDBFE',
                    padding: '12px 20px',
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: 'pointer',
                    marginLeft: 'auto',
                  }}
                >
                  👉 {L('अर्को सङ्ख्या हेरौँ', 'Next Number')}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginLeft: 'auto' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
                    {L('सङ्ख्या रोज्नुहोस्:', 'Pick a number:')}
                  </span>
                  {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16].map((num) => (
                    <button
                      key={num}
                      onClick={() => changeNumber(num)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        border: n === num ? '2px solid #187C68' : '1px solid #CBD5E1',
                        background: n === num ? '#187C68' : '#FFFFFF',
                        color: n === num ? '#FFFFFF' : '#334155',
                        fontWeight: 900,
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      {isNe ? toNp(num) : num}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      }
    >
      {/* ── Main 2D Stage: Pairs in Rows ───────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 440,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'linear-gradient(180deg, #FEF3C7 0%, #F5F7F5 60%)',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            padding: '24px 32px',
            minWidth: 'min(480px, 92vw)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {Array.from({ length: pairsCount }).map((_, pIdx) => {
            const ballIcon = BALL_EMOJIS[pIdx % BALL_EMOJIS.length];
            return (
              <div
                key={pIdx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isPaired ? 12 : 64,
                  transition: 'gap 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  position: 'relative',
                  padding: '4px 0',
                }}
              >
                <div style={{ fontSize: 36, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{ballIcon}</div>

                {isPaired && (
                  <div
                    style={{
                      background: '#EC4899',
                      color: '#FFF',
                      padding: '2px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 900,
                      animation: 'simPop 0.3s ease',
                    }}
                  >
                    🎀 {L(`जोडी ${toNp(pIdx + 1)}`, `Pair ${pIdx + 1}`)}
                  </div>
                )}

                <div style={{ fontSize: 36, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{ballIcon}</div>
              </div>
            );
          })}

          {/* Leftover single item for Odd numbers */}
          {isOdd && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                marginTop: 6,
                padding: '6px 0',
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                  animation: isPaired ? 'bounce 0.8s infinite' : 'none',
                }}
              >
                ⚽
              </div>
              {isPaired && (
                <div
                  style={{
                    background: '#F59E0B',
                    color: '#FFF',
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  😢 {L('एक्लै बाँकी (No pair)', 'Left alone (Odd)')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};
