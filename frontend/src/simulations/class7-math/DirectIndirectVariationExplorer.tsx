/**
 * DirectIndirectVariationExplorer.tsx
 * Grade 7 Mathematics – Lesson 8: UNITARY METHOD
 * Simulation 2: Direct and Indirect Variation Explorer (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 105-107)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { TrendingUp, TrendingDown, Users, DollarSign, Check, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एउटा परिमाण बढ्दा अर्को परिमाण पनि सोही अनुपातमा बढ्छ भने त्यसलाई कस्तो विचरण भनिन्छ?',
    en: 'When an increase in one quantity causes a proportional increase in another, what variation is it?',
    options: [
      { key: 'A', label: 'Direct variation (y / x = k)' },
      { key: 'B', label: 'Indirect variation (x × y = k)' },
      { key: 'C', label: 'Mixed variation' },
      { key: 'D', label: 'No variation' },
    ],
    answer: 'A',
  },
  {
    np: 'कामदारको सङ्ख्या बढ्दा काम सक्न लाग्ने days घट्छ। यो कस्तो विचरणको उदाहरण हो?',
    en: 'As the number of workers increases, the days required decreases. What type of variation is this?',
    options: [
      { key: 'A', label: 'Indirect variation' },
      { key: 'B', label: 'Direct variation' },
      { key: 'C', label: 'Not proportional' },
      { key: 'D', label: 'Constant variation' },
    ],
    answer: 'A',
  },
  {
    np: 'Direct variation मा कुन सम्बन्ध सधैँ स्थिर (Constant) रहन्छ?',
    en: 'In Direct Variation, which relationship is always constant?',
    options: [
      { key: 'A', label: 'Ratio (y / x = k)' },
      { key: 'B', label: 'Product (x × y = k)' },
      { key: 'C', label: 'Sum (x + y = k)' },
      { key: 'D', label: 'Difference (x - y = k)' },
    ],
    answer: 'A',
  },
  {
    np: 'Indirect variation मा कुन सम्बन्ध सधैँ स्थिर (Constant) रहन्छ?',
    en: 'In Indirect Variation, which relationship is always constant?',
    options: [
      { key: 'A', label: 'Product (x × y = k)' },
      { key: 'B', label: 'Quotient (y / x = k)' },
      { key: 'C', label: 'Exponent (x^y = k)' },
      { key: 'D', label: 'Percentage' },
    ],
    answer: 'A',
  },
];

export const DirectIndirectVariationExplorer: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L8-02',
    titleEn: 'Direct & Indirect Variation Explorer',
    titleNp: 'प्रत्यक्ष र अप्रत्यक्ष विचरण अन्वेषक',
    chapter: 8,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'direct' | 'indirect' | 'classifier'>('direct');

  // Tab 1: Direct Variation (Notebooks vs Cost)
  const [nbCount, setNbCount] = useState<number>(3);
  const costPerNb = 50;
  const totalNbCost = nbCount * costPerNb;

  // Tab 2: Indirect Variation (Workers vs Days)
  const totalManDays = 120; // 120 man-days work
  const [workers, setWorkers] = useState<number>(6);
  const daysNeeded = totalManDays / workers;

  // Tab 3: Classifier Game
  const [classifierPairs, setClassifierPairs] = useState([
    { textNp: 'सामानको सङ्ख्या र तिनको जम्मा मूल्य', textEn: 'Quantity of items and their total cost', type: 'direct', userAns: null as string | null },
    { textNp: 'गाडीको गति र निश्चित दुरी पार गर्न लाग्ने समय', textEn: 'Speed of vehicle and time taken to cover fixed distance', type: 'indirect', userAns: null as string | null },
    { textNp: 'कामदारको सङ्ख्या र काम सम्पन्न गर्न लाग्ने days', textEn: 'Number of workers and days to complete work', type: 'indirect', userAns: null as string | null },
    { textNp: 'पेट्रोलको परिमाण र गाडीले गुड्ने दुरी', textEn: 'Quantity of petrol and distance traveled', type: 'direct', userAns: null as string | null },
  ]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'प्रत्यक्ष विचरणमा अनुपात y/x = k स्थिर हुन्छ र अप्रत्यक्ष विचरणमा गुणनफल x × y = k स्थिर हुन्छ!',
        'In direct variation, ratio y/x = k is constant; in indirect variation, product xy = k is constant!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'direct', np: '1. Direct variation', en: '1. Direct Variation' },
            { id: 'indirect', np: '2. Indirect variation', en: '2. Indirect Variation' },
            { id: 'classifier', np: '3. विचरण वर्गीकरण चुनौती (Classifier Quiz)', en: '3. Variation Classifier' },
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

        {/* TAB 1: Direct Variation */}
        {activeTab === 'direct' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('Direct variation: कापीको सङ्ख्या र मूल्य', 'Direct Variation: Copies vs Price')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'कापीको सङ्ख्या बढ्दा मूल्य पनि बढ्छ, र सङ्ख्या घट्दा मूल्य पनि घट्छ। यहाँ मूल्य र सङ्ख्याको अनुपात (y / x) सधैँ स्थिर (Rs 50) रहन्छ।',
                'As copy quantity increases, cost increases. The ratio of cost to quantity (y/x) remains constant (Rs 50).'
              )}
            </p>

            <div style={{ margin: '16px 0' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                {L('कापीको सङ्ख्या (Quantity - x): ', 'Copy Quantity (x): ')} {nbCount} pcs
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={nbCount}
                onChange={(e) => {
                  kit.tap();
                  setNbCount(parseInt(e.target.value));
                }}
                style={{ width: 220 }}
              />
            </div>

            {/* Direct Variation Table */}
            <div style={{ overflowX: 'auto', marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9' }}>
                    <th style={{ padding: 8, border: '1px solid #CBD5E1' }}>{L('कापी सङ्ख्या (x)', 'Copies (x)')}</th>
                    <th style={{ padding: 8, border: '1px solid #CBD5E1' }}>{L('मूल्य Rs (y)', 'Cost Rs (y)')}</th>
                    <th style={{ padding: 8, border: '1px solid #CBD5E1' }}>{L('अनुपात y/x (k)', 'Ratio y/x (k)')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((qty) => (
                    <tr
                      key={qty}
                      style={{
                        background: qty === nbCount ? '#ECFDF5' : '#FFF',
                        fontWeight: qty === nbCount ? 800 : 400,
                      }}
                    >
                      <td style={{ padding: 8, border: '1px solid #CBD5E1' }}>{qty}</td>
                      <td style={{ padding: 8, border: '1px solid #CBD5E1' }}>Rs {qty * costPerNb}</td>
                      <td style={{ padding: 8, border: '1px solid #CBD5E1', color: '#059669' }}>
                        {qty * costPerNb} / {qty} = <strong>50</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visual SVG Line Graph of Direct Variation */}
            <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                📈 {L('प्रत्यक्ष विचरणको रेखाचित्र (सीधा रेखा - Straight Line through Origin)', 'Direct Variation Graph')}
              </span>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                <svg width="340" height="180" viewBox="0 0 340 180">
                  {/* Axes */}
                  <line x1="40" y1="150" x2="310" y2="150" stroke="#64748B" strokeWidth="2" />
                  <line x1="40" y1="20" x2="40" y2="150" stroke="#64748B" strokeWidth="2" />
                  <text x="315" y="155" fontSize="11" fill="#475569">x</text>
                  <text x="40" y="15" fontSize="11" fill="#475569">y</text>

                  {/* Direct Proportional Line */}
                  <line x1="40" y1="150" x2="290" y2="30" stroke="#10B981" strokeWidth="3" />

                  {/* Active Point */}
                  {(() => {
                    const px = 40 + (nbCount / 10) * 250;
                    const py = 150 - (nbCount / 10) * 120;
                    return (
                      <>
                        <circle cx={px} cy={py} r="6" fill="#059669" />
                        <text x={px + 8} y={py - 6} fontSize="12" fontWeight="bold" fill="#065F46">
                          ({nbCount}, Rs {totalNbCost})
                        </text>
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Indirect Variation */}
        {activeTab === 'indirect' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('Indirect variation: कामदार र लाग्ने days', 'Indirect Variation: Workers vs Days')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'कामदारको सङ्ख्या बढ्दा काम सक्न लाग्ने days घट्छ, र कामदार घट्दा days बढ्छ। यहाँ दुई परिमाणको गुणनफल (x × y) सधैँ स्थिर (120 श्रम-days) रहन्छ।',
                'As workers increase, days required decrease. The product (x × y) remains constant (120 man-days).'
              )}
            </p>

            <div style={{ margin: '16px 0' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#4338CA', display: 'block', marginBottom: 4 }}>
                {L('कामदार सङ्ख्या (Workers - x): ', 'Workers (x): ')} {workers} people
              </label>
              <input
                type="range"
                min={2}
                max={24}
                step={2}
                value={workers}
                onChange={(e) => {
                  kit.tap();
                  setWorkers(parseInt(e.target.value));
                }}
                style={{ width: 220 }}
              />
            </div>

            {/* Visual Workers vs Days */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                margin: '16px 0',
              }}
            >
              <div style={{ background: '#EEF2FF', padding: 16, borderRadius: 10, border: '1px solid #C7D2FE' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4338CA' }}>
                  {L('कामदार (Workers)', 'Workers')}
                </span>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#3730A3', marginTop: 4 }}>
                  {workers} people
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                  {Array.from({ length: Math.min(16, workers) }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#6366F1',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ background: '#FEF3C7', padding: 16, borderRadius: 10, border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>
                  {L('काम सक्न लाग्ने days (Days Needed)', 'Days Needed')}
                </span>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#92400E', marginTop: 4 }}>
                  {daysNeeded.toFixed(1)} days
                </div>
                <div style={{ fontSize: 12, color: '#78350F', marginTop: 4 }}>
                  {L(`120 ÷ ${workers} = ${daysNeeded.toFixed(1)} days`, `120 ÷ ${workers} = ${daysNeeded.toFixed(1)} days`)}
                </div>
              </div>
            </div>

            {/* Product constancy card */}
            <div
              style={{
                padding: 14,
                background: '#ECFDF5',
                borderRadius: 8,
                border: '1px solid #6EE7B7',
                fontSize: 15,
                fontWeight: 700,
                color: '#065F46',
                textAlign: 'center',
              }}
            >
              {L('स्थिर गुणनफल (Constant Product):', 'Constant Product:')} x × y = {workers} × {daysNeeded.toFixed(1)} ={' '}
              <span style={{ color: '#047857', fontSize: 18 }}>120 man-days</span>
            </div>
          </div>
        )}

        {/* TAB 3: Classifier Quiz */}
        {activeTab === 'classifier' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('विचरण पहिचान गर्नुहोस् (Identify Variation Type)', 'Identify Variation Type')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'दैनिक जीवनका यी परिमाणहरू प्रत्यक्ष (Direct) हुन् वा अप्रत्यक्ष (Indirect) छानेर परीक्षण गर्नुहोस्:',
                'Test whether these real-life pairs are Direct or Indirect variation:'
              )}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {classifierPairs.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 14,
                    background: '#F8FAFC',
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#1E293B', fontSize: 14 }}>
                    {idx + 1}. {L(item.textNp, item.textEn)}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        const updated = [...classifierPairs];
                        updated[idx].userAns = 'direct';
                        setClassifierPairs(updated);
                        if (item.type === 'direct') kit.good();
                        else kit.oops();
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        background: item.userAns === 'direct' ? (item.type === 'direct' ? '#10B981' : '#EF4444') : '#FFF',
                        color: item.userAns === 'direct' ? '#FFF' : '#334155',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      {L('प्रत्यक्ष (Direct)', 'Direct')}
                    </button>

                    <button
                      onClick={() => {
                        const updated = [...classifierPairs];
                        updated[idx].userAns = 'indirect';
                        setClassifierPairs(updated);
                        if (item.type === 'indirect') kit.good();
                        else kit.oops();
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        background: item.userAns === 'indirect' ? (item.type === 'indirect' ? '#10B981' : '#EF4444') : '#FFF',
                        color: item.userAns === 'indirect' ? '#FFF' : '#334155',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      {L('अप्रत्यक्ष (Indirect)', 'Indirect')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default DirectIndirectVariationExplorer;
