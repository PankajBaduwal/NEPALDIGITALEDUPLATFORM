/**
 * Chapter 20 · Coins and Notes
 * Sim 1: Coins and Notes — Pure 2D Edition
 * 100% 2D SVG / Interactive Money – No Three.js/WebGL dependencies.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface MoneyItem {
  id: string;
  nameEn: string;
  nameNp: string;
  val: number;
  type: 'coin' | 'note';
  color: string;
}

const MONEY_TYPES: MoneyItem[] = [
  { id: 'c1', nameEn: 'Rs 1 Coin', nameNp: 'रु 1 सिक्का', val: 1, type: 'coin', color: '#D4AF37' },
  { id: 'c2', nameEn: 'Rs 2 Coin', nameNp: 'रु 2 सिक्का', val: 2, type: 'coin', color: '#C0C0C0' },
  { id: 'n5', nameEn: 'Rs 5 Note', nameNp: 'रु 5 नोट', val: 5, type: 'note', color: '#EF4444' },
  { id: 'n10', nameEn: 'Rs 10 Note', nameNp: 'रु 10 नोट', val: 10, type: 'note', color: '#F97316' },
  { id: 'n20', nameEn: 'Rs 20 Note', nameNp: 'रु 20 नोट', val: 20, type: 'note', color: '#84CC16' },
  { id: 'n50', nameEn: 'Rs 50 Note', nameNp: 'रु 50 नोट', val: 50, type: 'note', color: '#06B6D4' },
];

export const CoinsAndNotes: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH20-01',
    chapter: 20,
    titleNp: 'सिक्का र नोट (नेपाली मुद्रा)',
    titleEn: 'Coins and Notes (Nepali Currency)',
  });

  const [wallet, setWallet] = useState<MoneyItem[]>([]);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const totalAmount = wallet.reduce((sum, item) => sum + item.val, 0);

  const addMoney = (item: MoneyItem) => {
    kit.tap();
    setWallet((prev) => [...prev, item]);
  };

  const clearWallet = () => {
    kit.tap();
    setWallet([]);
  };

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: 'कुन बढी मूल्यको छ: रु 10 को नोट कि रु 5 को नोट?',
        en: 'Which is worth more: Rs 10 note or Rs 5 note?',
        options: [
          { key: '10', label: isNe ? 'रु 10 को नोट' : 'Rs 10 note' },
          { key: '5', label: isNe ? 'रु 5 को नोट' : 'Rs 5 note' },
          { key: 'same', label: isNe ? 'बराबर' : 'Same' },
        ],
        answer: '10',
      },
      {
        np: 'रु 5 बनाउन रु 1 का कतिवटा सिक्का चाहिन्छ?',
        en: 'How many Rs 1 coins make Rs 5?',
        options: [
          { key: '5', label: isNe ? '5 वटा' : '5 coins' },
          { key: '2', label: isNe ? '2 वटा' : '2 coins' },
          { key: '10', label: isNe ? '10 वटा' : '10 coins' },
        ],
        answer: '5',
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
          💰 {L(`जम्मा रकम: रु ${toNp(totalAmount)}`, `Total Amount: Rs ${totalAmount}`)}
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
              {L('सिक्का वा नोट थप्न छुनुहोस्:', 'Tap to add money:')}
            </span>
            {MONEY_TYPES.map((item) => (
              <button
                key={item.id}
                onClick={() => addMoney(item)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 12,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#187C68',
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{item.type === 'coin' ? '🪙' : '💵'}</span>
                <span>{isNe ? item.nameNp : item.nameEn}</span>
              </button>
            ))}

            <button
              onClick={clearWallet}
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
              🔄 {L('रकम हटाउनुहोस्', 'Clear')}
            </button>
          </div>
        )
      }
    >
      {/* ── 2D Money Wallet Area ──────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 460,
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
            width: 'min(720px, 94vw)',
            minHeight: 280,
            background: '#FFFFFF',
            borderRadius: 24,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, color: '#187C68', marginBottom: 16 }}>
            👛 {L('तपाईँको थैलीमा भएका सिक्का र नोटहरू:', 'Coins and notes in your wallet:')}
          </div>

          <div style={{ flex: 1, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {wallet.map((item, idx) => (
              <div
                key={idx}
                style={{
                  width: item.type === 'coin' ? 64 : 110,
                  height: item.type === 'coin' ? 64 : 64,
                  borderRadius: item.type === 'coin' ? 32 : 12,
                  background: item.type === 'coin' ? item.color : '#F0FDF4',
                  border: item.type === 'coin' ? '3px solid #B45309' : `2px solid ${item.color}`,
                  color: item.type === 'coin' ? '#FFFFFF' : '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 16,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  animation: 'simPop 0.25s ease',
                }}
              >
                {isNe ? toNp(item.val) : item.val}
              </div>
            ))}

            {wallet.length === 0 && (
              <div style={{ color: '#94A3B8', fontSize: 15, fontWeight: 700 }}>
                {L('थैली खाली छ। तलका बटनबाट सिक्का वा नोट थप्नुहोस्!', 'Wallet is empty. Tap buttons below to add money!')}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
