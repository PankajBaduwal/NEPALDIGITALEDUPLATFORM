/**
 * ZeroDiscoveryPlayground.tsx (Converted to 100% Pure 2D)
 * Simulation 01: The Zero Discovery Playground
 * Class 1 Mathematics - Chapter 5: Zero
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

export const ZeroDiscoveryPlayground: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH5-01',
    chapter: 5,
    titleNp: 'शून्य चिनौँ (Zero Discovery)',
    titleEn: 'Discover Zero (0 / 0)',
  });

  const [appleCount, setAppleCount] = useState<number>(3);
  const [birdCount, setBirdCount] = useState<number>(2);
  const [fishCount, setFishCount] = useState<number>(4);

  const questions: QuizQuestion[] = [
    {
      np: 'टोकरीमा भएका सबै स्याउ खाएपछि टोकरीमा कतिवटा स्याउ बाँकी रहन्छन्?',
      en: 'After eating all apples in a basket, how many apples remain?',
      options: [
        { key: '0', label: kit.t('0', '0 (Zero)') },
        { key: '1', label: kit.t('1', '1 (One)') },
        { key: '2', label: kit.t('2', '2 (Two)') },
      ],
      answer: '0',
    },
    {
      np: 'रूखमा 3 वटा चरा थिए, ती तीनै वटा उडेर गए भने रूखमा कति चरा बाँकी छन्?',
      en: 'There were 3 birds on a tree. If all 3 flew away, how many remain?',
      options: [
        { key: '0', label: kit.t('0', '0 (Zero)') },
        { key: '3', label: kit.t('3', '3 (Three)') },
      ],
      answer: '0',
    },
    {
      np: 'कुनै पनि वस्तु नहुनु वा खाली हुनुलाई कुन सङ्ख्याले जनाउँछ?',
      en: 'Which number represents having nothing or an empty set?',
      options: [
        { key: '0', label: kit.t('0', '0 (Zero)') },
        { key: '10', label: kit.t('10', '10 (Ten)') },
        { key: '1', label: kit.t('1', '1 (One)') },
      ],
      answer: '0',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      mascotGreeting={kit.t(
        'वस्तुहरू हटाएर हेर्नुहोस्। केही पनि बाँकी नरहेपछि त्यसलाई शून्य (0) भनिन्छ!',
        'Remove all items to see that when nothing remains, it is called Zero (0)!'
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => {
              setAppleCount(0);
              kit.tap();
              kit.say('टोकरी रित्तो भयो! स्याउको सङ्ख्या 0 हो।', 'Basket is empty! Apple count is 0 (Zero).');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              fontWeight: 'bold',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            🧺 {kit.t('स्याउ रित्तो बनाऔँ (0 Apples)', 'Empty Apples (0)')}
          </button>

          <button
            onClick={() => {
              setBirdCount(0);
              kit.tap();
              kit.say('सबै चरा उडे! रूखमा 0 चरा छन्।', 'All birds flew away! 0 (Zero) birds on the tree.');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontWeight: 'bold',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            🌳 {kit.t('चरा उडाऔँ (0 Birds)', 'Fly Birds (0)')}
          </button>

          <button
            onClick={() => {
              setFishCount(0);
              kit.tap();
              kit.say('पोखरीमा माछा छैनन्! माछाको सङ्ख्या 0 हो।', 'No fish in the pond! Fish count is 0.');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              fontWeight: 'bold',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            🌊 {kit.t('माछा रित्तो बनाऔँ (0 Fish)', 'Empty Fish (0)')}
          </button>

          <button
            onClick={() => {
              setAppleCount(4);
              setBirdCount(3);
              setFishCount(5);
              kit.tap();
              kit.say('सबै वस्तुहरू फेरि थपिए!', 'Items refreshed!');
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
            🔄 {kit.t('फेरि थपौँ (Reset)', 'Reset')}
          </button>
        </div>
      }
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', boxSizing: 'border-box' }}>
        {/* Big Zero Hero Banner */}
        <div
          style={{
            padding: '12px 24px',
            borderRadius: 18,
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#fef3c7',
              border: '3px solid #f59e0b',
              color: '#b45309',
              fontSize: 32,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            0
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              {kit.t('शून्य (Zero): केही पनि छैन / रित्तो', 'Zero: Nothing / Empty Set')}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
              {kit.t('जब कुनै वस्तु बाँकी रहँदैन, त्यसलाई 0 ले जनाइन्छ।', 'When no items remain, we write 0 (Zero).')}
            </div>
          </div>
        </div>

        {/* 3 Interactive Exploration Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, width: '100%', maxWidth: 760 }}>
          {/* Card 1: Basket Apples */}
          <div style={{ background: '#ffffff', borderRadius: 16, border: '2px solid #e2e8f0', padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              🧺 {kit.t('स्याउको टोकरी', 'Apple Basket')}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: appleCount === 0 ? '#dc2626' : '#16a34a', marginBottom: 8 }}>
              {toNp(appleCount)} {appleCount === 0 && <span style={{ fontSize: 12, color: '#dc2626' }}>(शून्य/Empty)</span>}
            </div>
            <div style={{ minHeight: 70, background: '#f8fafc', borderRadius: 12, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              {appleCount === 0 ? (
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{kit.t('रित्तो टोकरी (Empty)', 'Empty')}</span>
              ) : (
                Array.from({ length: appleCount }).map((_, i) => (
                  <span key={i} style={{ fontSize: 24 }}>🍎</span>
                ))
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
              <button
                disabled={appleCount <= 0}
                onClick={() => {
                  setAppleCount((p) => Math.max(p - 1, 0));
                  kit.tap();
                }}
                style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: appleCount <= 0 ? 'not-allowed' : 'pointer' }}
              >
                ➖ 1
              </button>
              <button
                disabled={appleCount >= 6}
                onClick={() => {
                  setAppleCount((p) => Math.min(p + 1, 6));
                  kit.tap();
                }}
                style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: appleCount >= 6 ? 'not-allowed' : 'pointer' }}
              >
                ➕ 1
              </button>
            </div>
          </div>

          {/* Card 2: Tree Birds */}
          <div style={{ background: '#ffffff', borderRadius: 16, border: '2px solid #e2e8f0', padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              🌳 {kit.t('रूखका चराहरू', 'Birds on Tree')}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: birdCount === 0 ? '#dc2626' : '#0284c7', marginBottom: 8 }}>
              {toNp(birdCount)} {birdCount === 0 && <span style={{ fontSize: 12, color: '#dc2626' }}>(शून्य/Empty)</span>}
            </div>
            <div style={{ minHeight: 70, background: '#f8fafc', borderRadius: 12, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              {birdCount === 0 ? (
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{kit.t('सबै चरा उडे (Flew away)', 'None')}</span>
              ) : (
                Array.from({ length: birdCount }).map((_, i) => (
                  <span key={i} style={{ fontSize: 24 }}>🐦</span>
                ))
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
              <button
                disabled={birdCount <= 0}
                onClick={() => {
                  setBirdCount((p) => Math.max(p - 1, 0));
                  kit.tap();
                }}
                style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: birdCount <= 0 ? 'not-allowed' : 'pointer' }}
              >
                ➖ 1
              </button>
              <button
                disabled={birdCount >= 6}
                onClick={() => {
                  setBirdCount((p) => Math.min(p + 1, 6));
                  kit.tap();
                }}
                style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: birdCount >= 6 ? 'not-allowed' : 'pointer' }}
              >
                ➕ 1
              </button>
            </div>
          </div>

          {/* Card 3: Pond Fish */}
          <div style={{ background: '#ffffff', borderRadius: 16, border: '2px solid #e2e8f0', padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              🌊 {kit.t('पोखरीका माछा', 'Fish in Pond')}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: fishCount === 0 ? '#dc2626' : '#059669', marginBottom: 8 }}>
              {toNp(fishCount)} {fishCount === 0 && <span style={{ fontSize: 12, color: '#dc2626' }}>(शून्य/Empty)</span>}
            </div>
            <div style={{ minHeight: 70, background: '#f8fafc', borderRadius: 12, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              {fishCount === 0 ? (
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{kit.t('पोखरीमा माछा छैनन् (0 Fish)', 'None')}</span>
              ) : (
                Array.from({ length: fishCount }).map((_, i) => (
                  <span key={i} style={{ fontSize: 24 }}>🐟</span>
                ))
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
              <button
                disabled={fishCount <= 0}
                onClick={() => {
                  setFishCount((p) => Math.max(p - 1, 0));
                  kit.tap();
                }}
                style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: fishCount <= 0 ? 'not-allowed' : 'pointer' }}
              >
                ➖ 1
              </button>
              <button
                disabled={fishCount >= 6}
                onClick={() => {
                  setFishCount((p) => Math.min(p + 1, 6));
                  kit.tap();
                }}
                style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: fishCount >= 6 ? 'not-allowed' : 'pointer' }}
              >
                ➕ 1
              </button>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default ZeroDiscoveryPlayground;
