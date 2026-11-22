/**
 * Lesson 5 · Odd and even numbers (जोर र बिजोर सङ्ख्या)
 * Odd-Even Machine — numbered crates ride a conveyor; inspect the last digit and sort into Even or Odd bin.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, toNp } from '../class1-math-kit/nepali';
import { fmt } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

export const OddEvenMachine: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L5-01',
    chapter: 5,
    titleNp: 'जोर–बिजोर मेसिन',
    titleEn: 'Odd-Even Machine',
  });

  const [num, setNum] = useState(37);
  const [streak, setStreak] = useState(0);
  const [lastSorted, setLastSorted] = useState<'EVEN' | 'ODD' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const isEven = num % 2 === 0;
  const numStr = String(num);
  const leadingDigits = numStr.slice(0, -1);
  const lastDigit = numStr.slice(-1);

  const nextNumber = () => {
    setNum(rnd(10, 999));
    setLastSorted(null);
    setIsAnimating(false);
  };

  const handleSort = (choice: 'EVEN' | 'ODD') => {
    if (isAnimating) return;
    const isCorrect = (choice === 'EVEN' && isEven) || (choice === 'ODD' && !isEven);

    setIsAnimating(true);
    setLastSorted(choice);

    if (isCorrect) {
      kit.tap();
      kit.good(
        choice === 'EVEN'
          ? `सबास! अन्तिम अङ्क ${toNp(lastDigit)} भएकोले ${toNp(num)} जोर सङ्ख्या हो!`
          : `सबास! अन्तिम अङ्क ${toNp(lastDigit)} भएकोले ${toNp(num)} बिजोर सङ्ख्या हो!`,
        choice === 'EVEN'
          ? `Correct! Ends in ${lastDigit}, so ${num} is Even!`
          : `Correct! Ends in ${lastDigit}, so ${num} is Odd!`
      );
      kit.star();
      setStreak((s) => s + 1);
      setTimeout(nextNumber, 1200);
    } else {
      kit.oops(
        'अन्तिम अङ्क हेरौँ: ०, २, ४, ६, ८ भए जोर; १, ३, ५, ७, ९ भए बिजोर',
        'Look at the last digit: 0, 2, 4, 6, 8 = Even; 1, 3, 5, 7, 9 = Odd'
      );
      setStreak(0);
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    nextNumber();
    if (kit.mode === 'LEARN') {
      kit.say(
        'सङ्ख्याको अन्तिम अङ्क (एकको स्थान) हेरेर जोर वा बिजोर छुट्याऔँ।',
        'Look at the last digit to decide whether the number is Even or Odd.'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz Questions for Challenge Mode
  const quizNumbers = [24, 37, 58, 81, 140, 253, 466, 789];
  const questions: QuizQuestion[] = quizNumbers.map((n) => {
    const ev = n % 2 === 0;
    return {
      np: `सङ्ख्या ${toNp(n)} जोर हो कि बिजोर?`,
      en: `Is the number ${n} Even or Odd?`,
      answer: ev ? 'Even' : 'Odd',
      options: [
        { key: 'Even', label: kit.t('जोर (Even)', 'Even') },
        { key: 'Odd', label: kit.t('बिजोर (Odd)', 'Odd') },
      ],
    };
  });

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontSize: 15,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      🔥 {kit.t('लगातार सही', 'Streak')}:{' '}
      <span style={{ color: '#059669', fontSize: 20 }}>{toNp(streak)}</span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          disabled={isAnimating}
          onClick={() => handleSort('EVEN')}
          style={{
            background: '#16A34A',
            color: '#FFFFFF',
            borderRadius: 14,
            padding: '12px 24px',
            fontSize: 18,
            fontWeight: 900,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
          }}
        >
          👯 {kit.t('जोर सङ्ख्या (Even)', 'Even Number')}
        </button>

        <button
          type="button"
          disabled={isAnimating}
          onClick={() => handleSort('ODD')}
          style={{
            background: '#F97316',
            color: '#FFFFFF',
            borderRadius: 14,
            padding: '12px 24px',
            fontSize: 18,
            fontWeight: 900,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
          }}
        >
          🧍 {kit.t('बिजोर सङ्ख्या (Odd)', 'Odd Number')}
        </button>

        <CBtn color="#64748B" onClick={nextNumber}>
          🎲 {kit.t('अर्को सङ्ख्या', 'Next Crate')}
        </CBtn>
      </div>
    </Controls>
  );

  return (
    <SimFrame2D kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} grade={2}>
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
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 820,
            background: '#FFFFFF',
            borderRadius: 24,
            padding: '30px 24px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          {/* Rule banner */}
          <div
            style={{
              display: 'flex',
              gap: 20,
              width: '100%',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                background: '#F0FDF4',
                border: '2px solid #BBF7D0',
                borderRadius: 14,
                padding: '8px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: '#166534' }}>
                {kit.t('जोर (Even): अन्त्यमा', 'Even: Ends in')}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#15803D' }}>
                {kit.lang === 'ne' ? '०, २, ४, ६, ८' : '0, 2, 4, 6, 8'}
              </div>
            </div>

            <div
              style={{
                background: '#FFF7ED',
                border: '2px solid #FED7AA',
                borderRadius: 14,
                padding: '8px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: '#C2410C' }}>
                {kit.t('बिजोर (Odd): अन्त्यमा', 'Odd: Ends in')}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#EA580C' }}>
                {kit.lang === 'ne' ? '१, ३, ५, ७, ९' : '1, 3, 5, 7, 9'}
              </div>
            </div>
          </div>

          {/* Conveyor Belt & Crate */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              padding: '20px 0',
            }}
          >
            {/* The Crate */}
            <div
              style={{
                background: '#FEF08A',
                border: '3px solid #CA8A04',
                borderRadius: 16,
                padding: '16px 28px',
                boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 2,
                zIndex: 2,
                transform:
                  lastSorted === 'EVEN'
                    ? 'translate(-120px, 40px) scale(0.85)'
                    : lastSorted === 'ODD'
                      ? 'translate(120px, 40px) scale(0.85)'
                      : 'none',
                transition: 'transform 0.45s ease',
              }}
            >
              <span style={{ fontSize: 44, fontWeight: 900, color: '#1E293B' }}>
                {kit.lang === 'ne' ? toNp(leadingDigits) : leadingDigits}
              </span>
              <span
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  color: '#DC2626',
                  textDecoration: 'underline',
                }}
              >
                {kit.lang === 'ne' ? toNp(lastDigit) : lastDigit}
              </span>
            </div>

            {/* Conveyor Belt Graphic */}
            <svg width="100%" height="40" viewBox="0 0 600 40" style={{ maxWidth: 600, marginTop: -8 }}>
              <rect x="10" y="8" width="580" height="24" rx="12" fill="#475569" />
              {Array.from({ length: 18 }).map((_, i) => (
                <line
                  key={i}
                  x1={30 + i * 32}
                  y1="8"
                  x2={30 + i * 32}
                  y2="32"
                  stroke="#94A3B8"
                  strokeWidth="3"
                />
              ))}
            </svg>
          </div>

          {/* Two Sorting Bins */}
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
            {/* Even Bin */}
            <div
              style={{
                background: '#DCFCE7',
                border: '3px solid #16A34A',
                borderRadius: 18,
                padding: '14px 28px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)',
              }}
            >
              <span style={{ fontSize: 28 }}>📥</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#166534' }}>
                {kit.t('जोर बाकस', 'Even Bin')}
              </div>
              <div style={{ fontSize: 11, color: '#15803D', fontWeight: 800 }}>
                {kit.lang === 'ne' ? '०, २, ४, ६, ८' : '0, 2, 4, 6, 8'}
              </div>
            </div>

            {/* Odd Bin */}
            <div
              style={{
                background: '#FFEDD5',
                border: '3px solid #EA580C',
                borderRadius: 18,
                padding: '14px 28px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.15)',
              }}
            >
              <span style={{ fontSize: 28 }}>📥</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#9A3412' }}>
                {kit.t('बिजोर बाकस', 'Odd Bin')}
              </div>
              <div style={{ fontSize: 11, color: '#C2410C', fontWeight: 800 }}>
                {kit.lang === 'ne' ? '१, ३, ५, ७, ९' : '1, 3, 5, 7, 9'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
