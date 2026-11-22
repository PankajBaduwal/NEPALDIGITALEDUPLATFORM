/**
 * TenObjectAdventure.tsx (Converted to 100% Pure 2D)
 * Simulation 01: Ten Object Adventure (दश वस्तुहरू गनौँ)
 * Class 1 Mathematics - Chapter 6: Ten (दश)
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

export const TenObjectAdventure: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH6-01',
    chapter: 6,
    titleNp: 'दश वस्तुहरू गनौँ (१० - Ten)',
    titleEn: 'Count Ten Objects (10)',
  });

  const [activeCount, setActiveCount] = useState<number>(7);

  const questions: QuizQuestion[] = [
    {
      np: '९ पछि आउने पहिलो दुई अङ्कको सङ्ख्या कुन हो?',
      en: 'What is the first 2-digit number that comes right after 9?',
      options: [
        { key: '10', label: kit.t('१० (दश - Ten)', '10 (Ten)') },
        { key: '8', label: kit.t('८ (आठ)', '8 (Eight)') },
        { key: '11', label: kit.t('११ (एघार)', '11 (Eleven)') },
      ],
      answer: '10',
    },
    {
      np: '१० बनाउन ७ मा कति जोड्नुपर्छ?',
      en: 'How many more are needed with 7 to make 10?',
      options: [
        { key: '3', label: kit.t('३ (तीन)', '3 (Three)') },
        { key: '2', label: kit.t('२ (दुई)', '2 (Two)') },
        { key: '4', label: kit.t('४ (चार)', '4 (Four)') },
      ],
      answer: '3',
    },
    {
      np: 'हाम्रो दुवै हातमा जम्मा कतिवटा औँलाहरू हुन्छन्?',
      en: 'How many fingers do we have in total on both hands?',
      options: [
        { key: '10', label: kit.t('१० वटा (Ten fingers)', '10 fingers') },
        { key: '5', label: kit.t('५ वटा (Five fingers)', '5 fingers') },
      ],
      answer: '10',
    },
    {
      np: 'दश (१०) मा कतिवटा दश र कतिवटा एक हुन्छन्?',
      en: 'In the number 10, how many tens and ones are there?',
      options: [
        { key: 't1', label: kit.t('१ दश र ० एक (1 Ten, 0 Ones)', '1 Ten, 0 Ones') },
        { key: 't0', label: kit.t('० दश र १ एक', '0 Tens, 1 One') },
      ],
      answer: 't1',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      mascotGreeting={kit.t(
        'फ्रेममा १० वटासम्म वस्तुहरू थप्नुहोस् र १ दश (१०) पूरा बनाऔँ!',
        'Add items to the ten-frame to complete 1 group of Ten (10)!'
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => {
              setActiveCount(10);
              kit.tap();
              kit.say('स्याबास! १० वटा पूरा भयो, यो १ दश हो।', 'Great! 10 objects filled, making 1 Ten.');
              kit.star();
            }}
            style={{
              padding: '8px 20px',
              borderRadius: 12,
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              fontWeight: 'bold',
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(22,163,74,0.2)',
            }}
          >
            ⭐ {kit.t('१० वटा पूरा गरौँ (Make 10)', 'Fill All 10')}
          </button>

          <button
            onClick={() => {
              setActiveCount(0);
              kit.tap();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              fontWeight: 'bold',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            🔄 {kit.t('खाली गरौँ (Clear)', 'Clear')}
          </button>
        </div>
      }
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', boxSizing: 'border-box' }}>
        {/* Count Status Header */}
        <div
          style={{
            padding: '12px 28px',
            borderRadius: 18,
            background: activeCount === 10 ? '#dcfce7' : '#f8fafc',
            border: `2px solid ${activeCount === 10 ? '#16a34a' : '#cbd5e1'}`,
            marginBottom: 20,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 900, color: activeCount === 10 ? '#15803d' : '#0284c7' }}>
            {toNp(activeCount)} <span style={{ fontSize: 16, fontWeight: 700, color: '#64748b' }}>/ १० ({activeCount} / 10)</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: activeCount === 10 ? '#166534' : '#475569' }}>
            {activeCount === 10
              ? kit.t('🎉 १ दश (One Ten) पूरा भयो!', '🎉 1 Ten is complete!')
              : kit.t(`१० बनाउन अझै ${toNp(10 - activeCount)} वटा चाहिन्छ।`, `Need ${10 - activeCount} more to make 10.`)}
          </div>
        </div>

        {/* Classroom 10-Frame (५ र ५ गरी १०) */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 20,
            border: '3px solid #0f172a',
            padding: 20,
            boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
            width: '100%',
            maxWidth: 580,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase' }}>
            {kit.t('१०-को कोठा (Ten-Frame Grid)', 'Ten-Frame Grid')}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {Array.from({ length: 10 }).map((_, idx) => {
              const isFilled = idx < activeCount;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isFilled && idx === activeCount - 1) {
                      setActiveCount((p) => p - 1);
                    } else {
                      setActiveCount(idx + 1);
                    }
                    kit.tap();
                  }}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 14,
                    border: isFilled ? '3px solid #16a34a' : '2px dashed #cbd5e1',
                    background: isFilled ? '#ecfdf5' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  title={`कोठा ${idx + 1}`}
                >
                  {isFilled ? '⭐' : <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>{toNp(idx + 1)}</span>}
                </div>
              );
            })}
          </div>

          {/* Stepper Controls */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 18 }}>
            <button
              disabled={activeCount <= 0}
              onClick={() => {
                setActiveCount((p) => Math.max(p - 1, 0));
                kit.tap();
              }}
              style={{
                padding: '10px 22px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                background: activeCount <= 0 ? '#f1f5f9' : '#ffffff',
                fontSize: 15,
                fontWeight: 'bold',
                cursor: activeCount <= 0 ? 'not-allowed' : 'pointer',
                color: '#dc2626',
              }}
            >
              ➖ १ {kit.t('घटाऔँ', 'Remove')}
            </button>
            <button
              disabled={activeCount >= 10}
              onClick={() => {
                setActiveCount((p) => Math.min(p + 1, 10));
                kit.tap();
                if (activeCount + 1 === 10) kit.star();
              }}
              style={{
                padding: '10px 22px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                background: activeCount >= 10 ? '#f1f5f9' : '#ffffff',
                fontSize: 15,
                fontWeight: 'bold',
                cursor: activeCount >= 10 ? 'not-allowed' : 'pointer',
                color: '#16a34a',
              }}
            >
              ➕ १ {kit.t('थपौँ', 'Add')}
            </button>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default TenObjectAdventure;
