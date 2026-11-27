/**
 * VirtualMarketProfitLoss.tsx
 * Grade 7 Mathematics – Lesson 7: PROFIT AND LOSS
 * Simulation 1: Virtual Marketplace Profit and Loss (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 98-100)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ShoppingBag, TrendingUp, TrendingDown, Scale, Check, DollarSign } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'विक्रय मूल्य (SP) क्रय मूल्य (CP) भन्दा बढी हुँदा (SP > CP) के हुन्छ?',
    en: 'When Selling Price (SP) is greater than Cost Price (CP) (SP > CP), what occurs?',
    options: [
      { key: 'A', label: 'Profit (SP - CP)' },
      { key: 'B', label: 'Loss (CP - SP)' },
      { key: 'C', label: 'Neither profit nor loss' },
      { key: 'D', label: 'Discount' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा रेडियो Rs 750 मा किनेर Rs 800 मा बेच्दा कति नाफा वा नोक्सान हुन्छ?',
    en: 'A radio is bought for Rs 750 and sold for Rs 800. What is the profit or loss?',
    options: [
      { key: 'A', label: 'Rs 50 profit (SP - CP = 800 - 750 = Rs 50)' },
      { key: 'B', label: 'Rs 50 loss' },
      { key: 'C', label: 'Rs 150 profit' },
      { key: 'D', label: 'Rs 100 loss' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि एउटा साइकल Rs 1000 मा किनेर Rs 900 मा बेचेमा के हुन्छ?',
    en: 'If a bicycle is bought for Rs 1000 and sold for Rs 900, what is the result?',
    options: [
      { key: 'A', label: 'Rs 100 loss (CP - SP = 1000 - 900 = Rs 100)' },
      { key: 'B', label: 'Rs 100 profit' },
      { key: 'C', label: 'Rs 90 loss' },
      { key: 'D', label: 'Neither profit nor loss' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि क्रय मूल्य र विक्रय मूल्य दुवै बराबर (SP = CP) भएमा के हुन्छ?',
    en: 'If Cost Price equals Selling Price (SP = CP), what happens?',
    options: [
      { key: 'A', label: 'Neither profit nor loss (break-even)' },
      { key: 'B', label: '10% profit' },
      { key: 'C', label: '10% loss' },
      { key: 'D', label: 'Extra profit' },
    ],
    answer: 'A',
  },
];

export const VirtualMarketProfitLoss: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L7-01',
    titleEn: 'Virtual Marketplace Profit and Loss',
    titleNp: 'भर्चुअल बजार नाफा र नोक्सान',
    chapter: 7,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'market' | 'detector' | 'scenarios'>('market');

  // Tab 1: Interactive Market Stall
  const [costPrice, setCostPrice] = useState<number>(750);
  const [sellingPrice, setSellingPrice] = useState<number>(800);

  const diff = sellingPrice - costPrice;
  const isProfit = diff > 0;
  const isLoss = diff < 0;
  const isBreakEven = diff === 0;

  // Preset textbook scenarios
  const PRESETS = [
    { nameNp: 'रेडियो बिक्री (Radio)', nameEn: 'Radio Sale', cp: 750, sp: 800 },
    { nameNp: 'साइकल बिक्री (Cycle)', nameEn: 'Cycle Sale', cp: 1000, sp: 900 },
    { nameNp: 'घडी बिक्री (Watch)', nameEn: 'Watch Sale', cp: 1200, sp: 1500 },
    { nameNp: 'किताब बिक्री (Book)', nameEn: 'Book Sale', cp: 450, sp: 450 },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'विक्रय मूल्य बढी भए नाफा (SP - CP) र क्रय मूल्य बढी भए नोक्सान (CP - SP) हुन्छ!',
        'If Selling Price is higher, there is Profit (SP - CP); if Cost Price is higher, there is Loss (CP - SP)!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'market', np: '1. बजार पसल (Virtual Market Stall)', en: '1. Market Stall' },
            { id: 'detector', np: '2. नाफा/नोक्सान तराजु (Profit-Loss Scale)', en: '2. Profit-Loss Scale' },
            { id: 'scenarios', np: '3. पाठ्यपुस्तकका उदाहरणहरू (Textbook Cases)', en: '3. Textbook Cases' },
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

        {/* TAB 1: Market Stall */}
        {activeTab === 'market' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('बजार पसल: क्रय मूल्य र विक्रय मूल्यको तुलना', 'Market Stall: Comparing CP and SP')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'कुनै सामान किनेको मूल्यलाई क्रय मूल्य (Cost Price - CP) र बेचेको मूल्यलाई विक्रय मूल्य (Selling Price - SP) भनिन्छ।',
                'The price at which an item is bought is Cost Price (CP), and the price at which it is sold is Selling Price (SP).'
              )}
            </p>

            {/* Sliders */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', margin: '20px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('क्रय मूल्य (Cost Price - CP): ', 'Cost Price (CP): ')} Rs {costPrice}
                </label>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={50}
                  value={costPrice}
                  onChange={(e) => {
                    kit.tap();
                    setCostPrice(parseInt(e.target.value));
                  }}
                  style={{ width: 180 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('विक्रय मूल्य (Selling Price - SP): ', 'Selling Price (SP): ')} Rs {sellingPrice}
                </label>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={50}
                  value={sellingPrice}
                  onChange={(e) => {
                    kit.tap();
                    setSellingPrice(parseInt(e.target.value));
                  }}
                  style={{ width: 180 }}
                />
              </div>
            </div>

            {/* Visual Balance Scale & Bar Comparison */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                padding: 16,
                background: '#F8FAFC',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
              }}
            >
              {/* Cost Price Card */}
              <div style={{ background: '#EFF6FF', padding: 16, borderRadius: 8, border: '2px solid #93C5FD' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8' }}>
                  {L('क्रय मूल्य (CP) - किनेको मूल्य', 'Cost Price (CP)')}
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>
                  Rs {costPrice.toLocaleString()}
                </div>
                <div style={{ height: 10, background: '#BFDBFE', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (costPrice / 2000) * 100)}%`, height: '100%', background: '#2563EB' }} />
                </div>
              </div>

              {/* Selling Price Card */}
              <div style={{ background: '#F0FDF4', padding: 16, borderRadius: 8, border: '2px solid #86EFAC' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#15803D' }}>
                  {L('विक्रय मूल्य (SP) - बेचेको मूल्य', 'Selling Price (SP)')}
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#16A34A', marginTop: 4 }}>
                  Rs {sellingPrice.toLocaleString()}
                </div>
                <div style={{ height: 10, background: '#BBF7D0', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (sellingPrice / 2000) * 100)}%`, height: '100%', background: '#16A34A' }} />
                </div>
              </div>
            </div>

            {/* Profit or Loss Status Badge */}
            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 10,
                background: isProfit ? '#ECFDF5' : isLoss ? '#FEF2F2' : '#F1F5F9',
                border: `2px solid ${isProfit ? '#34D399' : isLoss ? '#F87171' : '#94A3B8'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {isProfit && <TrendingUp size={36} color="#059669" />}
              {isLoss && <TrendingDown size={36} color="#DC2626" />}
              {isBreakEven && <Scale size={36} color="#64748B" />}

              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: isProfit ? '#065F46' : isLoss ? '#991B1B' : '#334155' }}>
                  {isProfit && L(`नाफा भयो!`, `Profit Earned! (Rs ${diff})`)}
                  {isLoss && L(`नोक्सान भयो! (Loss: Rs ${Math.abs(diff)})`, `Loss Incurred! (Rs ${Math.abs(diff)})`)}
                  {isBreakEven && L('नाफा पनि भएन र नोक्सान पनि भएन (Break-Even)', 'Break-Even (No Profit, No Loss)')}
                </div>
                <div style={{ fontSize: 13, color: isProfit ? '#047857' : isLoss ? '#B91C1C' : '#475569', marginTop: 4 }}>
                  {isProfit &&
                    L(
                      `SP > CP भएकोले: नाफा (Profit) = SP - CP = Rs ${sellingPrice} - Rs ${costPrice} = Rs ${diff}`,
                      `Since SP > CP: Profit = SP - CP = Rs ${sellingPrice} - Rs ${costPrice} = Rs ${diff}`
                    )}
                  {isLoss &&
                    L(
                      `CP > SP भएकोले: नोक्सान (Loss) = CP - SP = Rs ${costPrice} - Rs ${sellingPrice} = Rs ${Math.abs(diff)}`,
                      `Since CP > SP: Loss = CP - SP = Rs ${costPrice} - Rs ${sellingPrice} = Rs ${Math.abs(diff)}`
                    )}
                  {isBreakEven &&
                    L(
                      `SP = CP भएकोले कुनै घाटा वा फाइदा छैन।`,
                      `Since SP = CP, there is zero gain and zero loss.`
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Profit-Loss Scale Detector */}
        {activeTab === 'detector' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('नाफा-नोक्सान तराजु (Interactive Balance Scale)', 'Interactive Balance Scale')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'तराजुमा विक्रय मूल्य भारी भए नाफा हुन्छ, क्रय मूल्य भारी भए नोक्सान हुन्छ, र दुवै बराबर भए सन्तुलन रहन्छ।',
                'If Selling Price is heavier, there is profit; if Cost Price is heavier, there is loss; if equal, balanced.'
              )}
            </p>

            {/* SVG Visual Scale */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '24px 0',
                background: '#F8FAFC',
                borderRadius: 12,
                margin: '16px 0',
              }}
            >
              <svg width="320" height="180" viewBox="0 0 320 180">
                {/* Stand */}
                <path d="M160 30 L160 140" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                <path d="M110 140 L210 140" stroke="#334155" strokeWidth="8" strokeLinecap="round" />

                {/* Pivot point */}
                <circle cx="160" cy="30" r="8" fill="#187C68" />

                {/* Beam tilting angle based on diff */}
                {(() => {
                  const tilt = Math.max(-20, Math.min(20, (costPrice - sellingPrice) * 0.05));
                  const leftY = 30 + tilt;
                  const rightY = 30 - tilt;
                  return (
                    <>
                      {/* Beam */}
                      <line x1="60" y1={leftY} x2="260" y2={rightY} stroke="#1E293B" strokeWidth="5" />
                      {/* Left string & pan (CP) */}
                      <line x1="60" y1={leftY} x2="60" y2={leftY + 50} stroke="#94A3B8" strokeWidth="2" />
                      <ellipse cx="60" cy={leftY + 50} rx="35" ry="10" fill="#3B82F6" />
                      <text x="60" y={leftY + 75} textAnchor="middle" fill="#1E40AF" fontWeight="bold" fontSize="11">
                        CP: Rs {costPrice}
                      </text>

                      {/* Right string & pan (SP) */}
                      <line x1="260" y1={rightY} x2="260" y2={rightY + 50} stroke="#94A3B8" strokeWidth="2" />
                      <ellipse cx="260" cy={rightY + 50} rx="35" ry="10" fill="#10B981" />
                      <text x="260" y={rightY + 75} textAnchor="middle" fill="#047857" fontWeight="bold" fontSize="11">
                        SP: Rs {sellingPrice}
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>

            <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 700 }}>
              {isProfit && <span style={{ color: '#059669' }}>SP is higher (SP &gt; CP) ➜ profit = Rs {diff}</span>}
              {isLoss && <span style={{ color: '#DC2626' }}>CP is higher (CP &gt; SP) ➜ loss = Rs {Math.abs(diff)}</span>}
              {isBreakEven && <span style={{ color: '#64748B' }}>सन्तुलित (SP = CP) ➜ नाफा/नोक्सान = 0</span>}
            </div>
          </div>
        )}

        {/* TAB 3: Textbook Cases */}
        {activeTab === 'scenarios' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('पाठ्यपुस्तकका वास्तविक उदाहरणहरू', 'Textbook Real-World Cases')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'तलका बटन थिचेर पाठ्यपुस्तकका विभिन्न खरिद-बिक्रीका अवस्थाहरू जाँच्नुहोस्:',
                'Click buttons below to explore textbook purchase and sales scenarios:'
              )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, margin: '16px 0' }}>
              {PRESETS.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    kit.tap();
                    setCostPrice(p.cp);
                    setSellingPrice(p.sp);
                    setActiveTab('market');
                  }}
                  style={{
                    padding: 14,
                    background: '#F8FAFC',
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#1E293B', fontSize: 14 }}>
                    {L(p.nameNp, p.nameEn)}
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                    CP: Rs {p.cp} | SP: Rs {p.sp}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: 800,
                      color: p.sp > p.cp ? '#059669' : p.sp < p.cp ? '#DC2626' : '#64748B',
                    }}
                  >
                    {p.sp > p.cp && `Profit: Rs ${p.sp - p.cp}`}
                    {p.sp < p.cp && `Loss: Rs ${p.cp - p.sp}`}
                    {p.sp === p.cp && `Break-even`}
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

export default VirtualMarketProfitLoss;
