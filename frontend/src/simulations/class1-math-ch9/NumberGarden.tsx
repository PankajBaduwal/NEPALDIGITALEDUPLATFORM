/**
 * NumberGarden.tsx (Converted to 100% Pure 2D)
 * Simulation 01: Number Garden 11–20 (११ देखि २० सम्मको सङ्ख्या बगैँचा)
 * Class 1 Mathematics - Chapter 9: Numbers 11 to 20 (११ देखि २० सम्मका सङ्ख्याहरू)
 * Nepal CDC Curriculum Aligned (मेरो गणित, कक्षा १)
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

const NEP_NAMES: Record<number, string> = {
  11: 'एघार',
  12: 'बाह्र',
  13: 'तेह्र',
  14: 'चौध',
  15: 'पन्ध्र',
  16: 'सोह्र',
  17: 'सत्र',
  18: 'अठार',
  19: 'उन्नाइस',
  20: 'बीस',
};

const EN_NAMES: Record<number, string> = {
  11: 'Eleven',
  12: 'Twelve',
  13: 'Thirteen',
  14: 'Fourteen',
  15: 'Fifteen',
  16: 'Sixteen',
  17: 'Seventeen',
  18: 'Eighteen',
  19: 'Nineteen',
  20: 'Twenty',
};

export const NumberGarden: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH9-01',
    chapter: 9,
    titleNp: '११ देखि २० सम्मका सङ्ख्याहरू (Numbers 11 to 20)',
    titleEn: 'Numbers 11 to 20 (1 Ten + Ones)',
  });

  const [activeNumber, setActiveNumber] = useState<number>(14);
  const ones = activeNumber - 10;

  const questions: QuizQuestion[] = [
    {
      np: '१ दश र ४ एक मिलेर कुन सङ्ख्या बन्छ?',
      en: 'What number is formed by 1 Ten and 4 Ones?',
      options: [
        { key: '14', label: kit.t('१४ (चौध - 14)', '14 (Fourteen)') },
        { key: '15', label: kit.t('१५ (पन्ध्र - 15)', '15 (Fifteen)') },
        { key: '41', label: kit.t('४१ (एकचालीस - 41)', '41') },
      ],
      answer: '14',
    },
    {
      np: '१६ मा कतिवटा दश र कतिवटा एक हुन्छन्?',
      en: 'How many tens and ones are there in the number 16?',
      options: [
        { key: '16', label: kit.t('१ दश र ६ एक (1 Ten, 6 Ones)', '1 Ten, 6 Ones') },
        { key: '61', label: kit.t('६ दश र १ एक', '6 Tens, 1 One') },
      ],
      answer: '16',
    },
    {
      np: '२ वटा दशको मुठा मिलेर कति हुन्छ?',
      en: 'What number is formed by 2 bundles of ten?',
      options: [
        { key: '20', label: kit.t('२० (बीस - 20)', '20 (Twenty)') },
        { key: '12', label: kit.t('१२ (बाह्र - 12)', '12 (Twelve)') },
        { key: '10', label: kit.t('१० (दश - 10)', '10 (Ten)') },
      ],
      answer: '20',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      mascotGreeting={kit.t(
        '१ दशको मुठा र बाँकी एकहरू मिलाएर ११ देखि २० सम्मका सङ्ख्या बनाऔँ!',
        'Combine 1 bundle of ten with ones to form numbers 11 to 20!'
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          {Array.from({ length: 10 }).map((_, i) => {
            const num = 11 + i;
            const isSel = num === activeNumber;
            return (
              <button
                key={num}
                onClick={() => {
                  setActiveNumber(num);
                  kit.tap();
                  kit.say(
                    `${toNp(num)} (${NEP_NAMES[num]}): १ दश र ${toNp(num - 10)} एक।`,
                    `${num} (${EN_NAMES[num]}): 1 Ten and ${num - 10} Ones.`
                  );
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  border: isSel ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: isSel ? '#0284c7' : '#ffffff',
                  color: isSel ? '#ffffff' : '#0f172a',
                  fontWeight: 'bold',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {toNp(num)}
              </button>
            );
          })}
        </div>
      }
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', boxSizing: 'border-box' }}>
        {/* Active Number Banner */}
        <div
          style={{
            padding: '12px 32px',
            borderRadius: 20,
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 900, color: '#0284c7' }}>
            {toNp(activeNumber)} <span style={{ fontSize: 18, color: '#64748b' }}>({activeNumber})</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
            {kit.t(NEP_NAMES[activeNumber], EN_NAMES[activeNumber])}
          </div>
        </div>

        {/* Tens and Ones Representation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: '100%', maxWidth: 680 }}>
          {/* 1 Ten Bundle Card */}
          <div style={{ background: '#ffffff', borderRadius: 18, border: '2px solid #16a34a', padding: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a', marginBottom: 6 }}>
              📦 {kit.t('१ दशको मुठा (1 Ten Bundle)', '1 Ten Bundle')}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              {kit.t('१० वटा सिन्काको १ मुठा', '10 sticks bundled together')}
            </div>
            <div style={{ minHeight: 90, background: '#f0fdf4', borderRadius: 14, border: '2px dashed #bbf7d0', padding: 12, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} style={{ fontSize: 22 }} title={`सिन्का ${i + 1}`}>🥢</span>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800, color: '#15803d' }}>
              = १० (10)
            </div>
          </div>

          {/* Ones Card */}
          <div style={{ background: '#ffffff', borderRadius: 18, border: '2px solid #ea580c', padding: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#ea580c', marginBottom: 6 }}>
              ✨ {kit.t(`${toNp(ones)} एक (Khulla Ones)`, `${ones} Ones`)}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              {kit.t('मुठा बाहिरका खुल्ला सिन्का', 'Separate single sticks')}
            </div>
            <div style={{ minHeight: 90, background: '#fff7ed', borderRadius: 14, border: '2px dashed #fed7aa', padding: 12, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              {ones === 0 ? (
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{kit.t('० एक (Zero Ones)', '0 Ones')}</span>
              ) : (
                Array.from({ length: ones }).map((_, i) => (
                  <span key={i} style={{ fontSize: 26 }}>🥢</span>
                ))
              )}
            </div>
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800, color: '#c2410c' }}>
              = {toNp(ones)} ({ones})
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default NumberGarden;
