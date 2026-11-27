/**
 * UnitaryMethodDiscoveryLab.tsx
 * Grade 7 Mathematics – Lesson 8: UNITARY METHOD
 * Simulation 1: Unitary Method Discovery Lab (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 104-106)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ShoppingCart, Divide, X, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एकाइ विधि (Unitary Method) मा धेरै वस्तुprice ofबाट 1 वस्तुprice of पत्ता लगाउँदा कुन गणितीय क्रिया गरिन्छ?',
    en: 'In the unitary method, what mathematical operation is used to find the cost of 1 unit from multiple units?',
    options: [
      { key: 'A', label: 'Division (price ÷ number)' },
      { key: 'B', label: 'Multiplication' },
      { key: 'C', label: 'Addition' },
      { key: 'D', label: 'Subtraction' },
    ],
    answer: 'A',
  },
  {
    np: '30 pcs bananasprice of Rs 225 पर्छ भने 1 दर्जन (12 pcs) bananasprice of कति पर्छ?',
    en: 'If 30 bananas cost Rs 225, what is the cost of 1 dozen (12) bananas?',
    options: [
      { key: 'A', label: 'Rs 90' },
      { key: 'B', label: 'Rs 100' },
      { key: 'C', label: 'Rs 80' },
      { key: 'D', label: 'Rs 75' },
    ],
    answer: 'A',
  },
  {
    np: 'Price of 3 copies Rs 270 पर्छ भने Price of 5 copies कति पर्छ?',
    en: 'If 3 notebooks cost Rs 270, what is the cost of 5 notebooks?',
    options: [
      { key: 'A', label: 'Rs 450' },
      { key: 'B', label: 'Rs 400' },
      { key: 'C', label: 'Rs 500' },
      { key: 'D', label: 'Rs 540' },
    ],
    answer: 'A',
  },
  {
    np: 'एकाइ विधि (Unitary Method) को सही 2 चरण कुन हुन्?',
    en: 'What are the correct 2 steps of the Unitary Method?',
    options: [
      { key: 'A', label: '1. Divide to find the value of 1 unit, 2. Multiply to find the value of the required units' },
      { key: 'B', label: '1. Multiply first, 2. Divide afterwards' },
      { key: 'C', label: 'Simply add and subtract' },
      { key: 'D', label: 'Find the percentage' },
    ],
    answer: 'A',
  },
];

export const UnitaryMethodDiscoveryLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L8-01',
    titleEn: 'Unitary Method Discovery Lab',
    titleNp: 'एकाइ विधि खोजी प्रयोगशाला',
    chapter: 8,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'bananas' | 'matrix' | 'grocery'>('bananas');

  // Case 1: Bananas (Textbook page 104)
  const [givenBananas, setGivenBananas] = useState<number>(30);
  const [givenBananaCost, setGivenBananaCost] = useState<number>(225);
  const [targetBananas, setTargetBananas] = useState<number>(12); // 1 dozen
  const unitBananaPrice = givenBananaCost / givenBananas;
  const targetBananaCost = unitBananaPrice * targetBananas;

  // Case 2: Notebooks
  const [nbGivenQty, setNbGivenQty] = useState<number>(3);
  const [nbGivenCost, setNbGivenCost] = useState<number>(270);
  const [nbTargetQty, setNbTargetQty] = useState<number>(5);
  const nbUnitPrice = nbGivenCost / nbGivenQty;
  const nbTargetCost = nbUnitPrice * nbTargetQty;

  // Case 3: Grocery items
  const [selectedGrocery, setSelectedGrocery] = useState<number>(0);
  const [groceryTargetQty, setGroceryTargetQty] = useState<number>(4);
  const GROCERY_ITEMS = [
    { nameNp: 'स्याउ (Apple)', nameEn: 'Apple', unitName: 'kg', baseQty: 5, baseCost: 750 },
    { nameNp: 'चामल (Rice)', nameEn: 'Rice', unitName: 'kg', baseQty: 10, baseCost: 1200 },
    { nameNp: 'दूध (Milk)', nameEn: 'Milk', unitName: 'L', baseQty: 2, baseCost: 180 },
    { nameNp: 'कलम (Pen)', nameEn: 'Pen', unitName: 'pcs (pcs)', baseQty: 6, baseCost: 120 },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'एकाइ विधिको 2 नियम: धेरै एकाइबाट 1 एकाइमा भाग (Divide) गर्ने, 1 एकाइबाट धेरैमा गुणन (Multiply) गर्ने!',
        '2 rules of Unitary Method: Divide to find 1 unit, Multiply to find target units!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'bananas', np: '1. bananasprice of (Textbook Banana Example)', en: '1. Banana Price Example' },
            { id: 'matrix', np: '2. कापीprice of र 2-चरण ढाँचा', en: '2. 2-Step Pattern' },
            { id: 'grocery', np: '3. किराना पसल एकाइ किनमेल', en: '3. Grocery Shopping' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveTab(tab.id as any);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === tab.id ? '#187C68' : '#E2E8F0',
                color: activeTab === tab.id ? '#FFF' : '#334155',
                transition: 'all 0.2s',
              }}
            >
              {L(tab.np, tab.en)}
            </button>
          ))}
        </div>

        {/* TAB 1: Banana Price Example */}
        {activeTab === 'bananas' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('bananasprice of: एकाइ विधिको व्यावहारिक प्रयोग', 'Banana Price: Unitary Method in Practice')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ 104 अनुसार: 30 pcs bananasprice of Rs 225 पर्छ भने 1 दर्जन (12 pcs) bananasprice of कति पर्छ?',
                'From Textbook Page 104: If 30 bananas cost Rs 225, how much does 1 dozen (12 bananas) cost?'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#D97706', display: 'block', marginBottom: 4 }}>
                  {L('दिइएको bananas सङ्ख्या: ', 'Given Bananas: ')} {givenBananas} pcs
                </label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={givenBananas}
                  onChange={(e) => {
                    kit.tap();
                    setGivenBananas(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('दिइएprice of: ', 'Given Cost (Rs): ')} Rs {givenBananaCost}
                </label>
                <input
                  type="range"
                  min={150}
                  max={450}
                  step={15}
                  value={givenBananaCost}
                  onChange={(e) => {
                    kit.tap();
                    setGivenBananaCost(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#4338CA', display: 'block', marginBottom: 4 }}>
                  {L('पत्ता लगाउनुपर्ने bananas: ', 'Target Bananas: ')} {targetBananas} pcs
                </label>
                <input
                  type="range"
                  min={1}
                  max={24}
                  value={targetBananas}
                  onChange={(e) => {
                    kit.tap();
                    setTargetBananas(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* 3 Step Visual Pipeline */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                margin: '20px 0',
              }}
            >
              {/* Step 1 */}
              <div style={{ background: '#FFFBEB', padding: 16, borderRadius: 10, border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>
                  {L('चरण 1: धेरै एकाइprice of (Given)', 'Step 1: Multiple Units')}
                </span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#92400E', marginTop: 4 }}>
                  {givenBananas} pcs bananas = Rs {givenBananaCost}
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ background: '#EFF6FF', padding: 16, borderRadius: 10, border: '2px solid #3B82F6' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>
                  {L('चरण 2: 1 एकाइprice of', 'Step 2: 1 Unit Cost (Divide)')}
                </span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>
                  1 bananas = Rs {givenBananaCost} ÷ {givenBananas}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>
                  = Rs {unitBananaPrice.toFixed(2)}
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ background: '#ECFDF5', padding: 16, borderRadius: 10, border: '2px solid #10B981' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#065F46' }}>
                  {L('चरण 3: मागेको एकाइprice of', 'Step 3: Target Units (Multiply)')}
                </span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                  {targetBananas} bananas = {targetBananas} × Rs {unitBananaPrice.toFixed(2)}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                  = Rs {targetBananaCost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Notebooks */}
        {activeTab === 'matrix' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('कापीprice of: 2-चरण ढाँचा (Notebook 2-Step Pattern)', 'Notebook 2-Step Pattern')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ 105 अनुसार: Price of 3 copies Rs 270 पर्छ भने Price of 5 copies कति पर्छ?',
                'From Textbook Page 105: If 3 notebooks cost Rs 270, what is the cost of 5 notebooks?'
              )}
            </p>

            <div
              style={{
                background: '#F8FAFC',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div>
                <strong>{L('1. दिइएको:', '1. Given:')}</strong> Price of 3 copies = Rs 270
              </div>
              <div>
                <strong>{L('2. एकाइ मूल्य निकाल्न भाग गर्दा:', '2. Dividing to find unit cost:')}</strong>
                <br />Price of 1 copy = Rs 270 ÷ 3 ={' '}
                <span style={{ fontWeight: 800, color: '#059669' }}>Rs 90</span>
              </div>
              <div>
                <strong>{L('3. Price of 5 copies निकाल्न गुणन गर्दा:', '3. Multiplying to find 5 units:')}</strong>
                <br />Price of 5 copies = 5 × Rs 90 ={' '}
                <span style={{ fontWeight: 800, color: '#187C68' }}>Rs 450</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Grocery Shopping */}
        {activeTab === 'grocery' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('किराना पसल एकाइ किनमेल (Interactive Grocery Shopping)', 'Interactive Grocery Shopping')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'सामान रोज्नुहोस् र चाहेको परिमाण छानेर एकाइ विधिद्वारा सिधै हिसाब गर्नुहोस्:',
                'Select an item and quantity to calculate using unitary method:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '14px 0' }}>
              {GROCERY_ITEMS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    kit.tap();
                    setSelectedGrocery(idx);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: selectedGrocery === idx ? '#187C68' : '#F1F5F9',
                    color: selectedGrocery === idx ? '#FFF' : '#334155',
                  }}
                >
                  {L(item.nameNp, item.nameEn)}
                </button>
              ))}
            </div>

            {(() => {
              const item = GROCERY_ITEMS[selectedGrocery];
              const unitRate = item.baseCost / item.baseQty;
              const totalCost = unitRate * groceryTargetQty;
              return (
                <div
                  style={{
                    padding: 16,
                    background: '#F8FAFC',
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      {L('किन्न चाहेको परिमाण (Target Quantity): ', 'Target Quantity: ')} {groceryTargetQty}{' '}
                      {item.unitName}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={groceryTargetQty}
                      onChange={(e) => {
                        kit.tap();
                        setGroceryTargetQty(parseInt(e.target.value));
                      }}
                      style={{ width: 180 }}
                    />
                  </div>

                  <div style={{ lineHeight: 1.8, fontSize: 14 }}>
                    <div>
                      {item.baseQty} {item.unitName} {L(item.nameNp, item.nameEn)} = Rs {item.baseCost}
                    </div>
                    <div>
                      1 {item.unitName} price of = Rs {item.baseCost} ÷ {item.baseQty} ={' '}
                      <strong>Rs {unitRate}</strong>
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 20,
                        fontWeight: 800,
                        color: '#187C68',
                      }}
                    >
                      {groceryTargetQty} {item.unitName} price of = Rs {totalCost.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default UnitaryMethodDiscoveryLab;
