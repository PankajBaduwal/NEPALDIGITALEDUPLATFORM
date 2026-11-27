/**
 * AdditionPlayground.tsx (Converted to 100% Pure 2D)
 * Simulation 01: Addition Playground
 * Class 1 Mathematics - Chapter 7: Addition up to 10
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

export const AdditionPlayground: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH7-01',
    chapter: 7,
    titleNp: 'जोड्ने खेलमैदान (10 सम्मको जोड)',
    titleEn: 'Addition Playground (Up to 10)',
  });

  const [partA, setPartA] = useState<number>(3);
  const [partB, setPartB] = useState<number>(4);
  const total = partA + partB;

  const questions: QuizQuestion[] = [
    {
      np: '4 वटा सुन्तलामा 3 वटा सुन्तला थप्दा जम्मा कति हुन्छ?',
      en: 'If you have 4 oranges and add 3 more, what is the total?',
      options: [
        { key: '7', label: kit.t('7', '7 (Seven)') },
        { key: '6', label: kit.t('6', '6 (Six)') },
        { key: '8', label: kit.t('8', '8 (Eight)') },
      ],
      answer: '7',
    },
    {
      np: '5 + 2 = ?',
      en: '5 + 2 = ?',
      options: [
        { key: '7', label: kit.t('7', '7 (Seven)') },
        { key: '6', label: kit.t('6', '6 (Six)') },
        { key: '8', label: kit.t('8', '8 (Eight)') },
      ],
      answer: '7',
    },
    {
      np: '6 मा कति जोड्दा 10 हुन्छ? (6 + ___ = 10)',
      en: 'What number added to 6 equals 10? (6 + ___ = 10)',
      options: [
        { key: '4', label: kit.t('4', '4 (Four)') },
        { key: '3', label: kit.t('3', '3 (Three)') },
        { key: '5', label: kit.t('5', '5 (Five)') },
      ],
      answer: '4',
    },
    {
      np: '0 मा 8 जोड्दा कति हुन्छ? (0 + 8 = ?)',
      en: 'What is 0 + 8 = ?',
      options: [
        { key: '8', label: kit.t('8', '8 (Eight)') },
        { key: '0', label: kit.t('0', '0 (Zero)') },
      ],
      answer: '8',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      mascotGreeting={kit.t(
        'दुई समूहका वस्तुहरू मिलाएर जम्मा कति हुन्छ पत्ता लगाऔँ!',
        'Combine items from two groups and find the sum!'
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => {
              const a = Math.floor(Math.random() * 5) + 1;
              const b = Math.floor(Math.random() * (10 - a)) + 1;
              setPartA(a);
              setPartB(b);
              kit.tap();
              kit.say(`${toNp(a)} र ${toNp(b)} जोड्दा कति हुन्छ?`, `What is ${a} plus ${b}?`);
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
            🎲 {kit.t('नयाँ जोड (New Problem)', 'New Problem')}
          </button>
        </div>
      }
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', boxSizing: 'border-box' }}>
        {/* Addition Formula Card */}
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
          <span style={{ fontSize: 32, fontWeight: 900, color: '#0284c7' }}>{toNp(partA)}</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#64748b' }}>➕</span>
          <span style={{ fontSize: 32, fontWeight: 900, color: '#ea580c' }}>{toNp(partB)}</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#64748b' }}>🟰</span>
          <span style={{ fontSize: 36, fontWeight: 900, color: '#16a34a' }}>{toNp(total)}</span>
        </div>

        {/* 2 Groups + Combined Output */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', width: '100%', maxWidth: 760 }}>
          {/* Plate A */}
          <div style={{ background: '#ffffff', borderRadius: 18, border: '2px solid #0284c7', padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0284c7', marginBottom: 4 }}>
              {kit.t('पहिलो समूह (Group 1)', 'Group 1')}
            </div>
            <div style={{ minHeight: 90, background: '#f0f9ff', borderRadius: 12, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: partA }).map((_, i) => (
                <span key={i} style={{ fontSize: 28 }}>🍎</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
              <button disabled={partA <= 0} onClick={() => { setPartA((p) => Math.max(p - 1, 0)); kit.tap(); }} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: partA <= 0 ? 'not-allowed' : 'pointer' }}>➖</button>
              <button disabled={partA + partB >= 10} onClick={() => { setPartA((p) => Math.min(p + 1, 10 - partB)); kit.tap(); }} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: partA + partB >= 10 ? 'not-allowed' : 'pointer' }}>➕</button>
            </div>
          </div>

          <div style={{ fontSize: 28, fontWeight: 900, color: '#94a3b8' }}>➕</div>

          {/* Plate B */}
          <div style={{ background: '#ffffff', borderRadius: 18, border: '2px solid #ea580c', padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#ea580c', marginBottom: 4 }}>
              {kit.t('दोस्रो समूह (Group 2)', 'Group 2')}
            </div>
            <div style={{ minHeight: 90, background: '#fff7ed', borderRadius: 12, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: partB }).map((_, i) => (
                <span key={i} style={{ fontSize: 28 }}>🍊</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
              <button disabled={partB <= 0} onClick={() => { setPartB((p) => Math.max(p - 1, 0)); kit.tap(); }} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: partB <= 0 ? 'not-allowed' : 'pointer' }}>➖</button>
              <button disabled={partA + partB >= 10} onClick={() => { setPartB((p) => Math.min(p + 1, 10 - partA)); kit.tap(); }} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: partA + partB >= 10 ? 'not-allowed' : 'pointer' }}>➕</button>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default AdditionPlayground;
