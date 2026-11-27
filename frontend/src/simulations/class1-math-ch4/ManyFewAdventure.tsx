/**
 * ManyFewAdventure.tsx (Converted to 100% Pure 2D)
 * Simulation 01: Many and Few Adventure
 * Class 1 Mathematics - Chapter 4: Numbers up to 9
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

export const ManyFewAdventure: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH4-01',
    chapter: 4,
    titleNp: 'धेरै र थोरै चिनौँ (9 सम्मका सङ्ख्याहरू)',
    titleEn: 'Many and Few (Numbers up to 9)',
  });

  const [basketA, setBasketA] = useState<number>(6);
  const [basketB, setBasketB] = useState<number>(2);
  const [itemType, setItemType] = useState<'apple' | 'flower' | 'mango'>('apple');

  const itemEmoji = itemType === 'apple' ? '🍎' : itemType === 'flower' ? '🌸' : '🥭';
  const itemNameNp = itemType === 'apple' ? 'Apple' : itemType === 'flower' ? 'Flower' : 'Mango';
  const itemNameEn = itemType === 'apple' ? 'Apple' : itemType === 'flower' ? 'Flower' : 'Mango';

  const isAMore = basketA > basketB;
  const isBMore = basketB > basketA;
  const isEqual = basketA === basketB;

  const questions: QuizQuestion[] = [
    {
      np: 'एउटा टोकरीमा 7 वटा र अर्कोमा 3 वटा Apple छन् भने कुनमा धेरै छन्?',
      en: 'Basket A has 7 apples and Basket B has 3. Which has MORE?',
      options: [
        { key: 'a', label: kit.t('7 वटा भएको टोकरी (Basket with 7)', 'Basket with 7 (Many)') },
        { key: 'b', label: kit.t('3 वटा भएको टोकरी (Basket with 3)', 'Basket with 3 (Few)') },
      ],
      answer: 'a',
    },
    {
      np: '2 र 8 मा कुन सङ्ख्या थोरै (Few) हो?',
      en: 'Between 2 and 8, which number is FEW (less)?',
      options: [
        { key: '2', label: kit.t('2 (Two)', '2 (Two)') },
        { key: '8', label: kit.t('8 (Eight)', '8 (Eight)') },
      ],
      answer: '2',
    },
    {
      np: '5 वटा चरा र 5 वटा माछा भएमा के भनिन्छ?',
      en: 'If there are 5 birds and 5 fish, how do they compare?',
      options: [
        { key: 'eq', label: kit.t('बराबर (Equal)', 'Equal') },
        { key: 'm', label: kit.t('चरा धेरै (More birds)', 'More birds') },
        { key: 'f', label: kit.t('माछा धेरै (More fish)', 'More fish') },
      ],
      answer: 'eq',
    },
    {
      np: '9 वटा Mango र 4 वटा Mangoमा कुन धेरै (Many) हो?',
      en: 'Between 9 mangoes and 4 mangoes, which is MANY (more)?',
      options: [
        { key: '9', label: kit.t('9 वटा (Nine)', '9 (Nine)') },
        { key: '4', label: kit.t('4 वटा (Four)', '4 (Four)') },
      ],
      answer: '9',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      mascotGreeting={kit.t(
        'टोकरीमा वस्तुहरू थप्नुहोस् वा हटाउनुहोस् र कुनमा धेरै वा थोरै छ पत्ता लगाऔँ!',
        'Add or remove items from the baskets and compare Many vs Few!'
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: '4px 8px', borderRadius: 12 }}>
            {(['apple', 'mango', 'flower'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setItemType(type);
                  kit.tap();
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: itemType === type ? '#ffffff' : 'transparent',
                  fontWeight: 'bold',
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: itemType === type ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {type === 'apple' ? '🍎 Apple' : type === 'mango' ? '🥭 Mango' : '🌸 Flower'}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setBasketA(Math.floor(Math.random() * 8) + 1);
              setBasketB(Math.floor(Math.random() * 8) + 1);
              kit.tap();
              kit.say('नयाँ सङ्ख्या आयो! कुनमा धेरै छ गनौँ।', 'New counts loaded! Count which basket has more.');
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
            🎲 {kit.t('नयाँ चुनौती (New Mix)', 'New Mix')}
          </button>
        </div>
      }
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', boxSizing: 'border-box' }}>
        {/* Comparison Result Banner */}
        <div
          style={{
            padding: '10px 24px',
            borderRadius: 16,
            background: isEqual ? '#fef3c7' : '#ecfdf5',
            border: `2px solid ${isEqual ? '#f59e0b' : '#10b981'}`,
            color: isEqual ? '#92400e' : '#065f46',
            fontSize: 16,
            fontWeight: 800,
            marginBottom: 20,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          {isEqual && kit.t(`दुवै टोकरीमा बराबर (${toNp(basketA)}) वस्तुहरू छन्!`, `Both baskets have equal (${basketA}) items!`)}
          {isAMore && kit.t(`टोकरी 'क' मा धेरै (${toNp(basketA)}) र टोकरी 'ख' मा थोरै (${toNp(basketB)}) छन्!`, `Basket A has MORE (${basketA}) and Basket B has FEWER (${basketB})!`)}
          {isBMore && kit.t(`टोकरी 'ख' मा धेरै (${toNp(basketB)}) र टोकरी 'क' मा थोरै (${toNp(basketA)}) छन्!`, `Basket B has MORE (${basketB}) and Basket A has FEWER (${basketA})!`)}
        </div>

        {/* 2 Baskets Side-by-Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, width: '100%', maxWidth: 720 }}>
          {/* Basket A */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              border: `3px solid ${isAMore ? '#10b981' : '#cbd5e1'}`,
              boxShadow: isAMore ? '0 10px 25px rgba(16,185,129,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              🧺 {kit.t('टोकरी क (Basket A)', 'Basket A')}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0284c7', marginBottom: 12 }}>
              {toNp(basketA)} <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>({basketA})</span>
            </div>

            {/* Visual Items Container */}
            <div
              style={{
                width: '100%',
                minHeight: 130,
                background: '#f8fafc',
                borderRadius: 14,
                border: '2px dashed #cbd5e1',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 12,
                boxSizing: 'border-box',
              }}
            >
              {Array.from({ length: basketA }).map((_, i) => (
                <span key={i} style={{ fontSize: 30, animation: 'bounce 0.5s ease' }} title={`${itemNameNp} ${i + 1}`}>
                  {itemEmoji}
                </span>
              ))}
            </div>

            {/* Stepper Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                disabled={basketA <= 1}
                onClick={() => {
                  setBasketA((prev) => Math.max(prev - 1, 1));
                  kit.tap();
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: basketA <= 1 ? '#f1f5f9' : '#ffffff',
                  fontSize: 18,
                  fontWeight: 'bold',
                  cursor: basketA <= 1 ? 'not-allowed' : 'pointer',
                  color: '#dc2626',
                }}
              >
                ➖
              </button>
              <button
                disabled={basketA >= 9}
                onClick={() => {
                  setBasketA((prev) => Math.min(prev + 1, 9));
                  kit.tap();
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: basketA >= 9 ? '#f1f5f9' : '#ffffff',
                  fontSize: 18,
                  fontWeight: 'bold',
                  cursor: basketA >= 9 ? 'not-allowed' : 'pointer',
                  color: '#16a34a',
                }}
              >
                ➕
              </button>
            </div>
          </div>

          {/* Basket B */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              border: `3px solid ${isBMore ? '#10b981' : '#cbd5e1'}`,
              boxShadow: isBMore ? '0 10px 25px rgba(16,185,129,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              🧺 {kit.t('टोकरी ख (Basket B)', 'Basket B')}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#ea580c', marginBottom: 12 }}>
              {toNp(basketB)} <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>({basketB})</span>
            </div>

            {/* Visual Items Container */}
            <div
              style={{
                width: '100%',
                minHeight: 130,
                background: '#f8fafc',
                borderRadius: 14,
                border: '2px dashed #cbd5e1',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 12,
                boxSizing: 'border-box',
              }}
            >
              {Array.from({ length: basketB }).map((_, i) => (
                <span key={i} style={{ fontSize: 30, animation: 'bounce 0.5s ease' }} title={`${itemNameNp} ${i + 1}`}>
                  {itemEmoji}
                </span>
              ))}
            </div>

            {/* Stepper Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                disabled={basketB <= 1}
                onClick={() => {
                  setBasketB((prev) => Math.max(prev - 1, 1));
                  kit.tap();
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: basketB <= 1 ? '#f1f5f9' : '#ffffff',
                  fontSize: 18,
                  fontWeight: 'bold',
                  cursor: basketB <= 1 ? 'not-allowed' : 'pointer',
                  color: '#dc2626',
                }}
              >
                ➖
              </button>
              <button
                disabled={basketB >= 9}
                onClick={() => {
                  setBasketB((prev) => Math.min(prev + 1, 9));
                  kit.tap();
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: basketB >= 9 ? '#f1f5f9' : '#ffffff',
                  fontSize: 18,
                  fontWeight: 'bold',
                  cursor: basketB >= 9 ? 'not-allowed' : 'pointer',
                  color: '#16a34a',
                }}
              >
                ➕
              </button>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default ManyFewAdventure;
