/**
 * Chapter 15 · Numbers 21 to 100
 * Sim 1: Hundred Village — Pure 2D Edition
 * 100% 2D SVG / Interactive 100-Grid – No Three.js/WebGL dependencies.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

export const HundredVillage: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH15-01',
    chapter: 15,
    titleNp: '100 सम्मका सङ्ख्या (दशक र एकाइ)',
    titleEn: 'Hundred Village (Numbers to 100)',
  });

  const [n, setN] = useState<number>(34);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const tens = Math.floor(n / 10);
  const ones = n % 10;

  const handleSelectNumber = (num: number) => {
    kit.tap();
    setN(num);
    const t = Math.floor(num / 10);
    const o = num % 10;
    kit.say(
      `${toNp(num)} मा ${toNp(t)} दशक र ${toNp(o)} एकाइ हुन्छन्।`,
      `${num} has ${t} tens and ${o} ones.`
    );
  };

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: 'सङ्ख्या 45 मा कति दशक (Tens) हुन्छन्?',
        en: 'How many tens are in number 45?',
        options: [
          { key: '4', label: isNe ? '4 दशक' : '4 tens' },
          { key: '5', label: isNe ? '5 दशक' : '5 tens' },
          { key: '40', label: isNe ? '40 दशक' : '40 tens' },
        ],
        answer: '4',
      },
      {
        np: 'सङ्ख्या 72 मा कति एकाइ (Ones) हुन्छन्?',
        en: 'How many ones are in number 72?',
        options: [
          { key: '2', label: isNe ? '2 एकाइ' : '2 ones' },
          { key: '7', label: isNe ? '7 एकाइ' : '7 ones' },
          { key: '20', label: isNe ? '20 एकाइ' : '20 ones' },
        ],
        answer: '2',
      },
      {
        np: '3 दशक र 8 एकाइ मिलेर कुन सङ्ख्या बन्छ?',
        en: 'Which number is formed by 3 tens and 8 ones?',
        options: [
          { key: '38', label: isNe ? '38' : '38' },
          { key: '83', label: isNe ? '83' : '83' },
          { key: '30', label: isNe ? '30' : '30' },
        ],
        answer: '38',
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
          {isNe ? toNp(n) : n} ={' '}
          <span style={{ color: '#0369A1' }}>
            {isNe ? `${toNp(tens)} दशक` : `${tens} tens`}
          </span>{' '}
          +{' '}
          <span style={{ color: '#D97706' }}>
            {isNe ? `${toNp(ones)} एकाइ` : `${ones} ones`}
          </span>
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
              💡 {L('100 को ग्रिडमा कुनै पनि सङ्ख्या छोएर दशक र एकाइ हेर्नुहोस्!', 'Tap any number in the 100-grid to see its tens and ones!')}
            </span>
          </div>
        )
      }
    >
      {/* ── 2D 100-Grid & Place Value Blocks ──────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 460,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(240px, 0.8fr)',
          gap: 20,
          padding: 20,
          background: 'linear-gradient(180deg, #E0F2FE 0%, #F5F7F5 60%)',
          alignItems: 'center',
        }}
      >
        {/* 100-Grid Table */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            padding: 14,
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 4,
          }}
        >
          {Array.from({ length: 100 }, (_, i) => {
            const num = i + 1;
            const isSelected = num === n;

            return (
              <button
                key={num}
                onClick={() => handleSelectNumber(num)}
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: isSelected ? '2px solid #187C68' : '1px solid #E2E8F0',
                  background: isSelected ? '#187C68' : '#F8FAFC',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  fontWeight: 900,
                  fontSize: 12,
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.1)' : 'none',
                  transition: 'all 0.1s ease',
                  boxShadow: isSelected ? '0 2px 6px rgba(24,124,104,0.25)' : 'none',
                }}
              >
                {isNe ? toNp(num) : num}
              </button>
            );
          })}
        </div>

        {/* Place Value Rods & Units Display */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, color: '#187C68' }}>
            🧱 {L(`स्थानमान प्रतिनिधित्व (${toNp(n)})`, `Place Value Representation (${n})`)}
          </div>

          {/* Tens Rods */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0369A1', marginBottom: 6 }}>
              📦 {L(`दशक (Tens): ${toNp(tens)} वटा मुठ्ठा (= ${toNp(tens * 10)})`, `Tens: ${tens} bundles (= ${tens * 10})`)}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Array.from({ length: tens }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 22,
                    height: 70,
                    background: '#0284C7',
                    borderRadius: 6,
                    border: '1px solid #0369A1',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                  title="Bundle of 10"
                >
                  10
                </div>
              ))}
              {tens === 0 && <span style={{ color: '#94A3B8', fontSize: 12 }}>Zero tens</span>}
            </div>
          </div>

          {/* Ones Cubes */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#D97706', marginBottom: 6 }}>
              🔶 {L(`एकाइ (Ones): ${toNp(ones)} वटा`, `Ones: ${ones} units`)}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Array.from({ length: ones }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 20,
                    height: 20,
                    background: '#F59E0B',
                    borderRadius: 4,
                    border: '1px solid #D97706',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                  title="1 one"
                />
              ))}
              {ones === 0 && <span style={{ color: '#94A3B8', fontSize: 12 }}>Zero ones</span>}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
