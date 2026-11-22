/**
 * Lesson 6 · Local numerals up to 20 (स्थानीय अङ्क प्रणाली)
 * Numeral Street — signboards for 1 to 20 in Hindu-Arabic, Devanagari and Roman numerals.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }

const roman = (n: number): string => {
  const table: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let s = '';
  for (const [v, r] of table) {
    while (n >= v) {
      s += r;
      n -= v;
    }
  }
  return s;
};

const BOARD_COLORS = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#0284C7', '#8B5CF6'];

export const NumeralSigns: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L6-01',
    chapter: 6,
    titleNp: 'अङ्क सडक (रोमन र देवनागरी)',
    titleEn: 'Numeral Street (Roman and Devanagari)',
  });

  const [selectedNum, setSelectedNum] = useState(5);
  const [isTouring, setIsTouring] = useState(false);

  const chooseNumber = (n: number, speak = true) => {
    setSelectedNum(n);
    if (speak) {
      kit.say(
        `हिन्दु-अरेबिक: ${n}, देवनागरी: ${toNp(n)}, रोमन: ${roman(n)}`,
        `${n} in Devanagari is ${toNp(n)}, in Roman is ${roman(n)}`
      );
    }
  };

  const handleStartTour = () => {
    if (isTouring) return;
    setIsTouring(true);
    let i = 1;
    const step = () => {
      chooseNumber(i);
      i += 1;
      if (i <= 20) {
        setTimeout(step, 1100);
      } else {
        setTimeout(() => {
          setIsTouring(false);
          kit.good('१ देखि २० सम्मका सबै अङ्कहरू भ्रमण गरियो!', 'Completed tour of numerals 1 to 20!');
          kit.star();
        }, 800);
      }
    };
    step();
  };

  useEffect(() => {
    chooseNumber(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz Questions for Challenge Mode
  const questions: QuizQuestion[] = Array.from({ length: 8 }).map((_, i) => {
    const num = rnd(1, 20);
    const kind = i % 3;
    const wrong = shuffle(
      Array.from({ length: 20 }, (_, j) => j + 1).filter((x) => x !== num),
      i + 4
    ).slice(0, 2);
    const opts = shuffle([num, ...wrong], i * 7 + 1);

    if (kind === 0) {
      return {
        np: `सङ्ख्या ${toNp(num)} को रोमन अङ्क कुन हो?`,
        en: `Which Roman numeral represents ${toNp(num)}?`,
        answer: String(num),
        options: opts.map((x) => ({ key: String(x), label: roman(x) })),
      };
    }
    if (kind === 1) {
      return {
        np: `रोमन अङ्क ${roman(num)} ले कुन सङ्ख्या बुझाउँछ?`,
        en: `What number does Roman numeral ${roman(num)} represent?`,
        answer: String(num),
        options: opts.map((x) => ({ key: String(x), label: toNp(x) })),
      };
    }
    return {
      np: `अङ्क ${num} लाई देवनागरीमा कसरी लेखिन्छ?`,
      en: `How is ${num} written in Devanagari?`,
      answer: String(num),
      options: opts.map((x) => ({ key: String(x), label: toNp(x) })),
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
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontWeight: 900,
        fontSize: 16,
        color: '#26332E',
      }}
    >
      <div>{selectedNum}</div>
      <div style={{ color: '#CBD5E1' }}>=</div>
      <div style={{ color: '#0284C7', fontSize: 20 }}>{toNp(selectedNum)}</div>
      <div style={{ color: '#CBD5E1' }}>=</div>
      <div style={{ color: '#D97706', fontSize: 20 }}>{roman(selectedNum)}</div>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <CBtn color="#187C68" disabled={isTouring} onClick={handleStartTour}>
          🚀 {kit.t('१–२० सडक भ्रमण', 'Tour 1–20')}
        </CBtn>
        <CBtn color="#0284C7" onClick={() => chooseNumber(Math.min(20, selectedNum + 1))}>
          +१ {kit.t('अर्को अङ्क', 'Next')}
        </CBtn>
        <CBtn color="#64748B" onClick={() => chooseNumber(Math.max(1, selectedNum - 1))}>
          -१ {kit.t('अघिल्लो अङ्क', 'Prev')}
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
          gap: 16,
        }}
      >
        {/* Spotlight Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 20,
            padding: '16px 36px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B' }}>
              {kit.t('हिन्दु–अरेबिक', 'Hindu-Arabic')}
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#1E293B' }}>
              {selectedNum}
            </div>
          </div>

          <div style={{ fontSize: 24, color: '#CBD5E1' }}>➔</div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#0284C7' }}>
              {kit.t('नेपाली देवनागरी', 'Devanagari')}
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0284C7' }}>
              {toNp(selectedNum)}
            </div>
          </div>

          <div style={{ fontSize: 24, color: '#CBD5E1' }}>➔</div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#D97706' }}>
              {kit.t('रोमन प्रणाली', 'Roman')}
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#D97706' }}>
              {roman(selectedNum)}
            </div>
          </div>
        </div>

        {/* 20 Numeral Signboards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: 8,
            width: '100%',
            maxWidth: 880,
          }}
        >
          {Array.from({ length: 20 }).map((_, idx) => {
            const num = idx + 1;
            const isSelected = num === selectedNum;
            const color = BOARD_COLORS[(num - 1) % BOARD_COLORS.length];

            return (
              <button
                key={num}
                type="button"
                onClick={() => chooseNumber(num)}
                style={{
                  background: isSelected ? color : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#1E293B',
                  border: `2px solid ${color}`,
                  borderRadius: 12,
                  padding: '8px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.08)' : 'none',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900 }}>{num}</div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{toNp(num)}</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    borderRadius: 4,
                    padding: '1px 6px',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    marginTop: 2,
                  }}
                >
                  {roman(num)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </SimFrame2D>
  );
};
