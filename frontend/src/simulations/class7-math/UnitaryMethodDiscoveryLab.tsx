/**
 * UnitaryMethodDiscoveryLab.tsx
 * Grade 7 Mathematics – Lesson 8: UNITARY METHOD (एकाइ विधि)
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
    np: 'एकाइ विधि (Unitary Method) मा धेरै वस्तुको मूल्यबाट १ वस्तुको मूल्य पत्ता लगाउँदा कुन गणितीय क्रिया गरिन्छ?',
    en: 'In the unitary method, what mathematical operation is used to find the cost of 1 unit from multiple units?',
    options: [
      { key: 'A', label: 'भाग (Division: मूल्य ÷ सङ्ख्या)' },
      { key: 'B', label: 'गुणन (Multiplication)' },
      { key: 'C', label: 'जोड (Addition)' },
      { key: 'D', label: 'घटाउ (Subtraction)' },
    ],
    answer: 'A',
  },
  {
    np: '३० वटा केराको मूल्य रु २२५ पर्छ भने १ दर्जन (१२ वटा) केराको मूल्य कति पर्छ?',
    en: 'If 30 bananas cost Rs 225, what is the cost of 1 dozen (12) bananas?',
    options: [
      { key: 'A', label: 'रु ९० (१ केरा = २२५/३० = रु ७.५० => १२ × ७.५० = रु ९०)' },
      { key: 'B', label: 'रु १००' },
      { key: 'C', label: 'रु ८०' },
      { key: 'D', label: 'रु ७५' },
    ],
    answer: 'A',
  },
  {
    np: '३ वटा कापीको मूल्य रु २७० पर्छ भने ५ वटा कापीको मूल्य कति पर्छ?',
    en: 'If 3 notebooks cost Rs 270, what is the cost of 5 notebooks?',
    options: [
      { key: 'A', label: 'रु ४५० (१ कापी = २७०/३ = रु ९० => ५ × ९० = रु ४५०)' },
      { key: 'B', label: 'रु ४००' },
      { key: 'C', label: 'रु ५००' },
      { key: 'D', label: 'रु ५४०' },
    ],
    answer: 'A',
  },
  {
    np: 'एकाइ विधि (Unitary Method) को सही २ चरण कुन हुन्?',
    en: 'What are the correct 2 steps of the Unitary Method?',
    options: [
      { key: 'A', label: '१. भाग गरी १ एकाइको मान निकाल्ने, २. गुणन गरी मागेको एकाइको मान निकाल्ने' },
      { key: 'B', label: '१. पहिले गुणन गर्ने, २. पछि भाग गर्ने' },
      { key: 'C', label: 'सिधै जोड्ने र घटाउने' },
      { key: 'D', label: 'प्रतिशत निकाल्ने' },
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
    { nameNp: 'कलम (Pen)', nameEn: 'Pen', unitName: 'वटा (pcs)', baseQty: 6, baseCost: 120 },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'एकाइ विधिको २ नियम: धेरै एकाइबाट १ एकाइमा भाग (Divide) गर्ने, १ एकाइबाट धेरैमा गुणन (Multiply) गर्ने!',
        '2 rules of Unitary Method: Divide to find 1 unit, Multiply to find target units!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'bananas', np: '१. केराको मूल्य (Textbook Banana Example)', en: '1. Banana Price Example' },
            { id: 'matrix', np: '२. कापीको मूल्य र २-चरण ढाँचा', en: '2. 2-Step Pattern' },
            { id: 'grocery', np: '३. किराना पसल एकाइ किनमेल', en: '3. Grocery Shopping' },
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
              {L('केराको मूल्य: एकाइ विधिको व्यावहारिक प्रयोग', 'Banana Price: Unitary Method in Practice')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ १०४ अनुसार: ३० वटा केराको मूल्य रु २२५ पर्छ भने १ दर्जन (१२ वटा) केराको मूल्य कति पर्छ?',
                'From Textbook Page 104: If 30 bananas cost Rs 225, how much does 1 dozen (12 bananas) cost?'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#D97706', display: 'block', marginBottom: 4 }}>
                  {L('दिइएको केरा सङ्ख्या: ', 'Given Bananas: ')} {givenBananas} वटा
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
                  {L('दिइएको मूल्य (रु): ', 'Given Cost (Rs): ')} रु {givenBananaCost}
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
                  {L('पत्ता लगाउनुपर्ने केरा: ', 'Target Bananas: ')} {targetBananas} वटा
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
                  {L('चरण १: धेरै एकाइको मूल्य (Given)', 'Step 1: Multiple Units')}
                </span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#92400E', marginTop: 4 }}>
                  {givenBananas} वटा केरा = रु {givenBananaCost}
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ background: '#EFF6FF', padding: 16, borderRadius: 10, border: '2px solid #3B82F6' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>
                  {L('चरण २: १ एकाइको मूल्य (भाग गर्ने - Divide)', 'Step 2: 1 Unit Cost (Divide)')}
                </span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>
                  १ केरा = रु {givenBananaCost} ÷ {givenBananas}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>
                  = रु {unitBananaPrice.toFixed(2)}
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ background: '#ECFDF5', padding: 16, borderRadius: 10, border: '2px solid #10B981' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#065F46' }}>
                  {L('चरण ३: मागेको एकाइको मूल्य (गुणन - Multiply)', 'Step 3: Target Units (Multiply)')}
                </span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                  {targetBananas} केरा = {targetBananas} × रु {unitBananaPrice.toFixed(2)}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                  = रु {targetBananaCost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Notebooks */}
        {activeTab === 'matrix' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('कापीको मूल्य: २-चरण ढाँचा (Notebook 2-Step Pattern)', 'Notebook 2-Step Pattern')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ १०५ अनुसार: ३ वटा कापीको मूल्य रु २७० पर्छ भने ५ वटा कापीको मूल्य कति पर्छ?',
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
                <strong>{L('१. दिइएको:', '1. Given:')}</strong> ३ वटा कापीको मूल्य = रु २७०
              </div>
              <div>
                <strong>{L('२. एकाइ मूल्य निकाल्न भाग गर्दा:', '2. Dividing to find unit cost:')}</strong>
                <br />१ वटा कापीको मूल्य = रु २७० ÷ ३ ={' '}
                <span style={{ fontWeight: 800, color: '#059669' }}>रु ९०</span>
              </div>
              <div>
                <strong>{L('३. ५ वटा कापीको मूल्य निकाल्न गुणन गर्दा:', '3. Multiplying to find 5 units:')}</strong>
                <br />५ वटा कापीको मूल्य = ५ × रु ९० ={' '}
                <span style={{ fontWeight: 800, color: '#187C68' }}>रु ४५०</span>
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
                      {item.baseQty} {item.unitName} {L(item.nameNp, item.nameEn)} = रु {item.baseCost}
                    </div>
                    <div>
                      १ {item.unitName} को मूल्य = रु {item.baseCost} ÷ {item.baseQty} ={' '}
                      <strong>रु {unitRate}</strong>
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 20,
                        fontWeight: 800,
                        color: '#187C68',
                      }}
                    >
                      {groceryTargetQty} {item.unitName} को मूल्य = रु {totalCost.toLocaleString()}
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
