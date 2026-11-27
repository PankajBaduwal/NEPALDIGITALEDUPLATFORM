/**
 * Chapter 20 · Coins and Notes
 * Sim 2: Toy Shop — Pure 2D Edition
 * 100% 2D SVG / Interactive Shop – No Three.js/WebGL dependencies.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface Toy {
  id: string;
  nameEn: string;
  nameNp: string;
  price: number;
  emoji: string;
}

const TOYS: Toy[] = [
  { id: 'ball', nameEn: 'Football', nameNp: 'फुटबल', price: 15, emoji: '⚽' },
  { id: 'car', nameEn: 'Toy Car', nameNp: 'खेलौना कार', price: 25, emoji: '🚗' },
  { id: 'bear', nameEn: 'Teddy Bear', nameNp: 'भालु खेलौना', price: 30, emoji: '🧸' },
  { id: 'kite', nameEn: 'Colorful Kite', nameNp: 'चङ्गा', price: 10, emoji: '🪁' },
  { id: 'train', nameEn: 'Toy Train', nameNp: 'रेलगाडी', price: 40, emoji: '🚂' },
];

export const ToyShop: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH20-02',
    chapter: 20,
    titleNp: 'खेलौना पसल (खरिद र फिर्ता)',
    titleEn: 'Toy Shop (Purchasing & Change)',
  });

  const [selectedToy, setSelectedToy] = useState<Toy>(TOYS[0]);
  const [paid, setPaid] = useState<number>(0);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const change = Math.max(0, paid - selectedToy.price);
  const isPaidEnough = paid >= selectedToy.price;

  const addPayment = (amount: number) => {
    kit.tap();
    const newPaid = paid + amount;
    setPaid(newPaid);
    if (newPaid >= selectedToy.price) {
      const chg = newPaid - selectedToy.price;
      kit.good(
        `खरिद सफल! खेलौनाको मूल्य Rs ${toNp(selectedToy.price)}, फिर्ता रकम Rs ${toNp(chg)}।`,
        `Purchase complete! Toy price Rs ${selectedToy.price}, change Rs ${chg}.`
      );
    }
  };

  const clearPurchase = () => {
    kit.tap();
    setPaid(0);
  };

  const selectToy = (toy: Toy) => {
    kit.tap();
    setSelectedToy(toy);
    setPaid(0);
  };

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: 'Rs 15 को फुटबल किन्न Rs 20 दिँदा कति फिर्ता आउँछ?',
        en: 'A football costs Rs 15. You give Rs 20. How much is the change?',
        options: [
          { key: '5', label: isNe ? 'Rs 5' : 'Rs 5' },
          { key: '10', label: isNe ? 'Rs 10' : 'Rs 10' },
          { key: '2', label: isNe ? 'Rs 2' : 'Rs 2' },
        ],
        answer: '5',
      },
      {
        np: 'Rs 25 को खेलौना किन्न Rs 50 दिँदा कति फिर्ता आउँछ?',
        en: 'A toy costs Rs 25. You pay Rs 50. How much is the change?',
        options: [
          { key: '25', label: isNe ? 'Rs 25' : 'Rs 25' },
          { key: '20', label: isNe ? 'Rs 20' : 'Rs 20' },
          { key: '30', label: isNe ? 'Rs 30' : 'Rs 30' },
        ],
        answer: '25',
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
            fontSize: 18,
            color: '#187C68',
          }}
        >
          🏷️ {L('मूल्य:', 'Price:')} Rs {isNe ? toNp(selectedToy.price) : selectedToy.price} |{' '}
          {L('तिरेको:', 'Paid:')} Rs {isNe ? toNp(paid) : paid} |{' '}
          <span style={{ color: '#047857' }}>
            {L('फिर्ता:', 'Change:')} Rs {isNe ? toNp(change) : change}
          </span>
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
              {L('पैसा तिर्नुहोस्:', 'Pay with cash:')}
            </span>
            {[5, 10, 20, 50].map((amt) => (
              <button
                key={amt}
                onClick={() => addPayment(amt)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  border: '1px solid #187C68',
                  background: '#FFFFFF',
                  color: '#187C68',
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                + Rs {isNe ? toNp(amt) : amt}
              </button>
            ))}

            <button
              onClick={clearPurchase}
              style={{
                marginLeft: 'auto',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                padding: '8px 14px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔄 {L('पुनः सुरु', 'Reset Payment')}
            </button>
          </div>
        )
      }
    >
      {/* ── 2D Toy Shop Counter ───────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 460,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(220px, 0.8fr)',
          gap: 20,
          padding: 24,
          background: 'linear-gradient(180deg, #E0F2FE 0%, #F5F7F5 60%)',
          alignItems: 'center',
        }}
      >
        {/* Toy Shelves */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, color: '#187C68' }}>
            🏪 {L('खेलौना छान्नुहोस् (Choose a Toy):', 'Choose a Toy:')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
            {TOYS.map((toy) => {
              const isSelected = selectedToy.id === toy.id;
              return (
                <div
                  key={toy.id}
                  onClick={() => selectToy(toy)}
                  style={{
                    borderRadius: 16,
                    border: isSelected ? '3px solid #187C68' : '1px solid #E2E8F0',
                    background: isSelected ? '#E6F3E9' : '#F8FAFC',
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.05)' : 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(24,124,104,0.2)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 44 }}>{toy.emoji}</span>
                  <div style={{ fontSize: 13, fontWeight: 900, marginTop: 6, color: '#1E293B' }}>
                    {isNe ? toy.nameNp : toy.nameEn}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#D97706' }}>
                    Rs {isNe ? toNp(toy.price) : toy.price}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cash Register / Counter Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48 }}>{selectedToy.emoji}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#187C68' }}>
            {isNe ? selectedToy.nameNp : selectedToy.nameEn}
          </div>
          <div style={{ fontSize: 15, color: '#475569', fontWeight: 800 }}>
            {L(`मूल्य: Rs ${toNp(selectedToy.price)}`, `Price: Rs ${selectedToy.price}`)}
          </div>

          {isPaidEnough ? (
            <div
              style={{
                background: '#E6F3E9',
                border: '2px solid #10B981',
                borderRadius: 16,
                padding: '12px 16px',
                animation: 'simPop 0.3s ease',
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16, color: '#065F46' }}>
                🎉 {L('रकम भुक्तानी भयो!', 'Payment Received!')}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                {L(`फिर्ता रकम: Rs ${toNp(change)}`, `Change to return: Rs ${change}`)}
              </div>
            </div>
          ) : (
            <div style={{ color: '#D97706', fontSize: 13, fontWeight: 800 }}>
              ⚠️ {L(`अझै Rs ${toNp(selectedToy.price - paid)} तिर्न बाँकी`, `Rs ${selectedToy.price - paid} remaining to pay`)}
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};
