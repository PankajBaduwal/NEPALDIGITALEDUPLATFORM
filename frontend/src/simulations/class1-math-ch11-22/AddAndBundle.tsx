/**
 * Chapter 16 · Addition up to the sum of 100 (योगफल १०० सम्म आउने जोड)
 * Sim 1: Add and Bundle (जोडौँ र बाँधौँ) — Pure 2D Edition
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

export const AddAndBundle: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH16-01',
    chapter: 16,
    titleNp: 'जोडौँ र बाँधौँ (१०० सम्मको जोड)',
    titleEn: 'Add and Bundle (Addition to 100)',
  });

  const [a, setA] = useState<number>(27);
  const [b, setB] = useState<number>(15);
  const [isBundled, setIsBundled] = useState<boolean>(false);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const total = a + b;
  const aTens = Math.floor(a / 10), aOnes = a % 10;
  const bTens = Math.floor(b / 10), bOnes = b % 10;
  const rawOnes = aOnes + bOnes;
  const totalTens = Math.floor(total / 10);
  const totalOnes = total % 10;

  const handleBundle = () => {
    kit.tap();
    setIsBundled(true);
    if (rawOnes >= 10) {
      kit.good(
        `१० एकाइ मिलेर १ नयाँ दशक बन्यो! जम्मा योगफल = ${toNp(total)}`,
        `10 ones bundled into 1 new ten rod! Total sum = ${total}`
      );
    } else {
      kit.good(`जम्मा योगफल = ${toNp(total)}`, `Total sum = ${total}`);
    }
  };

  const newNumbers = () => {
    kit.tap();
    const newA = Math.floor(Math.random() * 40) + 14;
    const newB = Math.floor(Math.random() * 40) + 12;
    setA(newA);
    setB(newB);
    setIsBundled(false);
  };

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: '२५ + १५ को योगफल कति हुन्छ?',
        en: 'What is 25 + 15?',
        options: [
          { key: '40', label: isNe ? '४०' : '40' },
          { key: '30', label: isNe ? '३०' : '30' },
          { key: '35', label: isNe ? '३५' : '35' },
        ],
        answer: '40',
      },
      {
        np: '८ एकाइ र ५ एकाइ जोड्दा कति हुन्छ? (८ + ५)',
        en: 'What is 8 ones + 5 ones?',
        options: [
          { key: '13', label: isNe ? '१३ (१ दशक ३ एकाइ)' : '13 (1 ten 3 ones)' },
          { key: '12', label: isNe ? '१२' : '12' },
          { key: '14', label: isNe ? '१४' : '14' },
        ],
        answer: '13',
      },
      {
        np: '३४ + २८ को योगफल कति हुन्छ?',
        en: 'What is 34 + 28?',
        options: [
          { key: '62', label: isNe ? '६२' : '62' },
          { key: '52', label: isNe ? '५२' : '52' },
          { key: '60', label: isNe ? '६०' : '60' },
        ],
        answer: '62',
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
            fontSize: 22,
            color: '#187C68',
          }}
        >
          {isNe ? toNp(a) : a} + {isNe ? toNp(b) : b} ={' '}
          <span style={{ color: '#047857' }}>{isNe ? toNp(total) : total}</span>
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleBundle}
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
              ✨ {L('दशक बाँधौँ र जोडौँ (Bundle Tens & Add)', 'Bundle Tens & Add')}
            </button>

            <button
              onClick={newNumbers}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '12px 18px',
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔄 {L('नयाँ सङ्ख्याहरू', 'New Numbers')}
            </button>
          </div>
        )
      }
    >
      {/* ── Main 2D Stage: Bundling Workspace ─────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 460,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          padding: 24,
          background: 'linear-gradient(180deg, #FEF3C7 0%, #F5F7F5 60%)',
        }}
      >
        {/* Column A: First Number */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            padding: 18,
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: '#187C68' }}>
            {L(`पहिलो सङ्ख्या: ${toNp(a)}`, `First Number: ${a}`)}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0369A1', marginBottom: 6 }}>
              📦 {L(`दशक: ${toNp(aTens)} वटा`, `Tens: ${aTens}`)}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: aTens }).map((_, i) => (
                <div key={i} style={{ width: 22, height: 70, background: '#0284C7', borderRadius: 6 }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#D97706', marginBottom: 6 }}>
              🔶 {L(`एकाइ: ${toNp(aOnes)} वटा`, `Ones: ${aOnes}`)}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Array.from({ length: aOnes }).map((_, i) => (
                <div key={i} style={{ width: 18, height: 18, background: '#F59E0B', borderRadius: 4 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Column B: Second Number & Combined Result */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            padding: 18,
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: '#187C68' }}>
            {L(`दोस्रो सङ्ख्या: ${toNp(b)}`, `Second Number: ${b}`)}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0369A1', marginBottom: 6 }}>
              📦 {L(`दशक: ${toNp(bTens)} वटा`, `Tens: ${bTens}`)}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: bTens }).map((_, i) => (
                <div key={i} style={{ width: 22, height: 70, background: '#0284C7', borderRadius: 6 }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#D97706', marginBottom: 6 }}>
              🔶 {L(`एकाइ: ${toNp(bOnes)} वटा`, `Ones: ${bOnes}`)}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Array.from({ length: bOnes }).map((_, i) => (
                <div key={i} style={{ width: 18, height: 18, background: '#F59E0B', borderRadius: 4 }} />
              ))}
            </div>
          </div>

          {/* Bundled Result Callout */}
          {isBundled && (
            <div
              style={{
                marginTop: 'auto',
                background: '#E6F3E9',
                border: '2px solid #10B981',
                borderRadius: 14,
                padding: '10px 14px',
                animation: 'simPop 0.3s ease',
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 15, color: '#065F46' }}>
                🎉 {L(`जोडफल = ${toNp(total)} (${toNp(totalTens)} दशक, ${toNp(totalOnes)} एकाइ)`, `Sum = ${total} (${totalTens} tens, ${totalOnes} ones)`)}
              </div>
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};
