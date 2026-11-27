/**
 * AdditionPlayground.tsx (Converted to 100% Pure 2D)
 * Simulation 01: Addition Playground up to 20
 * Class 1 Mathematics - Chapter 10: Addition up to 20
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
    code: 'SIM-MATH-G1-CH10-01',
    chapter: 10,
    titleNp: 'योगफल 20 सम्म आउने जोड (Addition up to 20)',
    titleEn: 'Addition up to 20 (Making 10)',
  });

  const [addendA, setAddendA] = useState<number>(8);
  const [addendB, setAddendB] = useState<number>(5);
  const total = addendA + addendB;

  // Making 10 logic: how many from B needed to make A reach 10
  const needForTen = Math.max(0, 10 - addendA);
  const leftoverB = Math.max(0, addendB - needForTen);

  const questions: QuizQuestion[] = [
    {
      np: '8 + 5 जोड्दा पहिला 10 बनाउन 8 मा कति थपिन्छ?',
      en: 'To solve 8 + 5 by making 10, how many are added to 8 first?',
      options: [
        { key: '2', label: kit.t('2', '2 (Two)') },
        { key: '3', label: kit.t('3', '3 (Three)') },
        { key: '5', label: kit.t('5', '5 (Five)') },
      ],
      answer: '2',
    },
    {
      np: '9 + 6 = ?',
      en: '9 + 6 = ?',
      options: [
        { key: '15', label: kit.t('15', '15 (Fifteen)') },
        { key: '14', label: kit.t('14', '14 (Fourteen)') },
        { key: '16', label: kit.t('16', '16 (Sixteen)') },
      ],
      answer: '15',
    },
    {
      np: '10 + 7 = ?',
      en: '10 + 7 = ?',
      options: [
        { key: '17', label: kit.t('17', '17 (Seventeen)') },
        { key: '16', label: kit.t('16', '16 (Sixteen)') },
        { key: '18', label: kit.t('18', '18 (Eighteen)') },
      ],
      answer: '17',
    },
    {
      np: '7 + 8 = ?',
      en: '7 + 8 = ?',
      options: [
        { key: '15', label: kit.t('15', '15 (Fifteen)') },
        { key: '14', label: kit.t('14', '14 (Fourteen)') },
        { key: '16', label: kit.t('16', '16 (Sixteen)') },
      ],
      answer: '15',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      mascotGreeting={kit.t(
        '10 बनाएर सजिलै 20 सम्मको जोड गर्न सकिन्छ!',
        'Make 10 first to easily add numbers up to 20!'
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => {
              const a = Math.floor(Math.random() * 4) + 6; // 6 to 9
              const b = Math.floor(Math.random() * (20 - a - 2)) + 3; // up to 20
              setAddendA(a);
              setAddendB(b);
              kit.tap();
              kit.say(`${toNp(a)} + ${toNp(b)} जोड्दा कति हुन्छ?`, `What is ${a} + ${b}?`);
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
        {/* Formula Card */}
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
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 900, color: '#0284c7' }}>{toNp(addendA)}</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#64748b' }}>➕</span>
          <span style={{ fontSize: 32, fontWeight: 900, color: '#ea580c' }}>{toNp(addendB)}</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#64748b' }}>🟰</span>
          <span style={{ fontSize: 36, fontWeight: 900, color: '#16a34a' }}>{toNp(total)}</span>
        </div>

        {/* Making 10 Strategy Breakdown Card */}
        <div
          style={{
            background: '#f0fdf4',
            borderRadius: 16,
            border: '2px solid #bbf7d0',
            padding: '12px 24px',
            marginBottom: 20,
            textAlign: 'center',
            maxWidth: 620,
            width: '100%',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 4 }}>
            💡 {kit.t('10 बनाउने तरिका (Making 10 Method):', 'Making 10 Strategy:')}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
            {toNp(addendA)} + {toNp(addendB)} = ({toNp(addendA)} + {toNp(needForTen)}) + {toNp(leftoverB)} = 10 + {toNp(leftoverB)} = {toNp(total)}
          </div>
        </div>

        {/* 2 Groups Display */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', width: '100%', maxWidth: 740 }}>
          {/* Group A */}
          <div style={{ background: '#ffffff', borderRadius: 18, border: '2px solid #0284c7', padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0284c7', marginBottom: 6 }}>
              {kit.t(`पहिलो सङ्ख्या: ${toNp(addendA)}`, `First Number: ${addendA}`)}
            </div>
            <div style={{ minHeight: 90, background: '#f0f9ff', borderRadius: 12, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: addendA }).map((_, i) => (
                <span key={i} style={{ fontSize: 24 }}>🟡</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
              <button disabled={addendA <= 1} onClick={() => { setAddendA((p) => Math.max(p - 1, 1)); kit.tap(); }} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: addendA <= 1 ? 'not-allowed' : 'pointer' }}>➖</button>
              <button disabled={addendA >= 10} onClick={() => { setAddendA((p) => Math.min(p + 1, 10)); kit.tap(); }} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: addendA >= 10 ? 'not-allowed' : 'pointer' }}>➕</button>
            </div>
          </div>

          <div style={{ fontSize: 28, fontWeight: 900, color: '#94a3b8' }}>➕</div>

          {/* Group B */}
          <div style={{ background: '#ffffff', borderRadius: 18, border: '2px solid #ea580c', padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#ea580c', marginBottom: 6 }}>
              {kit.t(`दोस्रो सङ्ख्या: ${toNp(addendB)}`, `Second Number: ${addendB}`)}
            </div>
            <div style={{ minHeight: 90, background: '#fff7ed', borderRadius: 12, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: addendB }).map((_, i) => (
                <span key={i} style={{ fontSize: 24 }}>🔵</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
              <button disabled={addendB <= 1} onClick={() => { setAddendB((p) => Math.max(p - 1, 1)); kit.tap(); }} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: addendB <= 1 ? 'not-allowed' : 'pointer' }}>➖</button>
              <button disabled={addendA + addendB >= 20} onClick={() => { setAddendB((p) => Math.min(p + 1, 20 - addendA)); kit.tap(); }} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: addendA + addendB >= 20 ? 'not-allowed' : 'pointer' }}>➕</button>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default AdditionPlayground;
