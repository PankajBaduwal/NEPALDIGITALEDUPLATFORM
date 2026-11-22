/**
 * ProfitLossMarketplace.tsx
 * Grade 8 Mathematics – Unit 5: PROFIT AND LOSS (नाफा र नोक्सान)
 * Simulation 1: Profit and Loss Marketplace (नाफा र नोक्सान बजार)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 5)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ShoppingBag, TrendingUp, TrendingDown, Store, Award, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै वस्तु किनेको मूल्य (CP) भन्दा बेचेको मूल्य (SP) धेरै (SP > CP) भए के हुन्छ?',
    en: 'When the selling price (SP) is greater than the cost price (CP), what occurs?',
    options: [
      { key: 'A', label: 'नाफा (Profit = SP - CP)' },
      { key: 'B', label: 'नोक्सान (Loss)' },
      { key: 'C', label: 'नाफा पनि होइन, नोक्सान पनि होइन' },
      { key: 'D', label: 'छुट मात्र' },
    ],
    answer: 'A',
  },
  {
    np: 'नाफा प्रतिशत (Profit %) र नोक्सान प्रतिशत (Loss %) सधैं कुन मूल्यमा गणना गरिन्छ?',
    en: 'On which price are profit percentage and loss percentage always calculated?',
    options: [
      { key: 'A', label: 'क्रय मूल्यमा (On Cost Price - CP)' },
      { key: 'B', label: 'बिक्री मूल्यमा (On SP)' },
      { key: 'C', label: 'अङ्कित मूल्यमा (On MP)' },
      { key: 'D', label: 'छुट रकममा' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा झोला रु. ५०० मा किनेर रु. ६०० मा बेच्दा नाफा प्रतिशत कति हुन्छ?',
    en: 'If a bag is bought for Rs. 500 and sold for Rs. 600, what is the profit percentage?',
    options: [
      { key: 'A', label: '२०% [ नाफा १०० ÷ ५०० × १००% = २०% ]' },
      { key: 'B', label: '१०%' },
      { key: 'C', label: '२५%' },
      { key: 'D', label: '१५%' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा वस्तु रु. ८०० मा किनेर रु. ७२० मा बेच्दा नोक्सान प्रतिशत कति हुन्छ?',
    en: 'If an item is bought for Rs. 800 and sold for Rs. 720, what is the loss percentage?',
    options: [
      { key: 'A', label: '१०% [ नोक्सान ८० ÷ ८०० × १००% = १०% ]' },
      { key: 'B', label: '१२%' },
      { key: 'C', label: '८%' },
      { key: 'D', label: '२०%' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि क्रय मूल्य रु. १००० र नोक्सान रु. १५० भए बिक्री मूल्य (SP) कति हुन्छ?',
    en: 'If cost price is Rs. 1000 and loss is Rs. 150, what is the selling price (SP)?',
    options: [
      { key: 'A', label: 'रु. ८५० [ SP = CP - Loss = १००० - १५० = ८५० ]' },
      { key: 'B', label: 'रु. ११५०' },
      { key: 'C', label: 'रु. ९००' },
      { key: 'D', label: 'रु. ७५०' },
    ],
    answer: 'A',
  },
];

interface Product {
  id: string;
  nameNp: string;
  nameEn: string;
  defaultCp: number;
  defaultSp: number;
}

const PRODUCTS: Product[] = [
  { id: 'bag', nameNp: 'विद्यालय झोला (School Bag)', nameEn: 'School Bag', defaultCp: 800, defaultSp: 1000 },
  { id: 'shoes', nameNp: 'जुत्ता (Sports Shoes)', nameEn: 'Sports Shoes', defaultCp: 1000, defaultSp: 850 },
  { id: 'shirt', nameNp: 'कमिज (Cotton Shirt)', nameEn: 'Cotton Shirt', defaultCp: 500, defaultSp: 600 },
  { id: 'calc', nameNp: 'क्याल्कुलेटर (Calculator)', nameEn: 'Calculator', defaultCp: 800, defaultSp: 720 },
  { id: 'books', nameNp: 'गणित पुस्तक सेट (Book Set)', nameEn: 'Math Book Set', defaultCp: 1200, defaultSp: 1500 },
];

export const ProfitLossMarketplace: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U5-01',
    chapter: 5,
    titleNp: 'नाफा र नोक्सान बजार (Profit and Loss Marketplace)',
    titleEn: 'Profit and Loss Marketplace',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'learn' | 'shopkeeper' | 'challenge'>('learn');

  // Tab 1 Learn selected product
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [learnCp, setLearnCp] = useState<number>(PRODUCTS[0].defaultCp);
  const [learnSp, setLearnSp] = useState<number>(PRODUCTS[0].defaultSp);

  // Tab 2 Student shopkeeper custom prices
  const [customCp, setCustomCp] = useState<number>(600);
  const [customSp, setCustomSp] = useState<number>(750);

  // Calculations for Learn
  const diff = learnSp - learnCp;
  const isProfit = diff > 0;
  const isLoss = diff < 0;
  const absDiff = Math.abs(diff);
  const percent = learnCp > 0 ? (absDiff / learnCp) * 100 : 0;

  // Calculations for Custom Shopkeeper
  const customDiff = customSp - customCp;
  const customIsProfit = customDiff > 0;
  const customAbsDiff = Math.abs(customDiff);
  const customPercent = customCp > 0 ? (customAbsDiff / customCp) * 100 : 0;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! नाफा र नोक्सान बजारमा स्वागत छ। क्रय मूल्य (CP), बिक्री मूल्य (SP) र प्रतिशत नाफा/नोक्सान हिसाब गरौँ!',
        'Hello! Welcome to Profit & Loss Marketplace. Explore Cost Price (CP), Selling Price (SP), and Profit/Loss Percentages!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'learn', labelNp: '१. पाठ्यपुस्तकका उदाहरणहरू (Learn)', labelEn: '1. Learn Concepts', icon: ShoppingBag },
            { id: 'shopkeeper', labelNp: '२. विद्यार्थी पसले मोड (Shopkeeper Mode)', labelEn: '2. Student Shopkeeper', icon: Store },
            { id: 'challenge', labelNp: '३. अभ्यास चुनौती (Challenge Quiz)', labelEn: '3. Challenge Quiz', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  border: 'none',
                  background: active ? '#0284c7' : '#ffffff',
                  color: active ? '#ffffff' : '#334155',
                  boxShadow: active ? '0 2px 4px rgba(2, 132, 199, 0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                <span>{isNe ? tab.labelNp : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Learn Concepts */}
        {activeTab === 'learn' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={20} />
              {L('वस्तु छान्नुहोस् र नाफा/नोक्सान विश्लेषण हेर्नुहोस्', 'Select Product & Inspect Profit/Loss')}
            </h3>

            {/* Product buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setLearnCp(p.defaultCp);
                    setLearnSp(p.defaultSp);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selectedProduct.id === p.id ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: selectedProduct.id === p.id ? '#e0f2fe' : '#ffffff',
                    color: selectedProduct.id === p.id ? '#0369a1' : '#334155',
                  }}
                >
                  {isNe ? p.nameNp : p.nameEn}
                </button>
              ))}
            </div>

            {/* Price display & comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                  {L('क्रय मूल्य (Cost Price - CP):', 'Cost Price (CP):')}
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                  रु. {isNe ? toNp(learnCp) : learnCp}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  {L('पसलेले किनेको मूल्य', 'Price paid by the shopkeeper to buy')}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                  {L('बिक्री मूल्य (Selling Price - SP):', 'Selling Price (SP):')}
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#0284c7', marginTop: 4 }}>
                  रु. {isNe ? toNp(learnSp) : learnSp}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  {L('ग्राहकलाई बेचेको मूल्य', 'Price at which the item is sold')}
                </div>
              </div>
            </div>

            {/* Outcome Result Box */}
            <div
              style={{
                background: isProfit ? '#f0fdf4' : isLoss ? '#fef2f2' : '#f8fafc',
                border: `2px solid ${isProfit ? '#86efac' : isLoss ? '#fca5a5' : '#cbd5e1'}`,
                padding: 18,
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isProfit ? <TrendingUp size={24} color="#16a34a" /> : <TrendingDown size={24} color="#dc2626" />}
                <span style={{ fontSize: 18, fontWeight: 900, color: isProfit ? '#15803d' : '#b91c1c' }}>
                  {isProfit
                    ? L(`नाफा भयो! (SP > CP) : रु. ${toNp(absDiff)}`, `Profit! (SP > CP) : Rs. ${absDiff}`)
                    : isLoss
                    ? L(`नोक्सान भयो! (CP > SP) : रु. ${toNp(absDiff)}`, `Loss! (CP > SP) : Rs. ${absDiff}`)
                    : L('नाफा पनि भएन, नोक्सान पनि भएन (SP = CP)', 'No Profit, No Loss')}
                </span>
              </div>

              {diff !== 0 && (
                <div style={{ marginTop: 12, fontSize: 15, color: '#334155', lineHeight: 1.6 }}>
                  <div>
                    <strong>{isProfit ? L('नाफा सूत्र:', 'Profit Formula:') : L('नोक्सान सूत्र:', 'Loss Formula:')}</strong>{' '}
                    {isProfit ? 'Profit = SP - CP' : 'Loss = CP - SP'} = रु. {absDiff}
                  </div>
                  <div style={{ marginTop: 4, fontWeight: 800, color: isProfit ? '#166534' : '#991b1b', fontSize: 17 }}>
                    {isProfit ? L('नाफा प्रतिशत = ', 'Profit % = ') : L('नोक्सान प्रतिशत = ', 'Loss % = ')}
                    ({absDiff} ÷ {learnCp}) × १००% = {isNe ? toNp(percent.toFixed(2)) : percent.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    {L('विशेष ध्यान दिनुहोस्: नाफा वा नोक्सान प्रतिशत सधैं क्रय मूल्य (CP) मा हिसाब गरिन्छ!', 'Note: Profit % and Loss % are always calculated on the Cost Price (CP)!')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Student Shopkeeper */}
        {activeTab === 'shopkeeper' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#16a34a', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Store size={20} />
              {L('विद्यार्थी पसले मोड (Custom Shopkeeper Sandbox)', 'Student Shopkeeper Sandbox')}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#475569' }}>
              {L(
                'आफ्नो पसलमा सामानको क्रय मूल्य र बिक्री मूल्य आफैँ निर्धारण गरी नाफा वा नोक्सान गणना गर्नुहोस्:',
                'Set your own Cost Price (CP) and Selling Price (SP) to see the business profit or loss outcome:'
              )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  {L('क्रय मूल्य (CP) रु:', 'Cost Price (CP) Rs:')} {customCp}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={customCp}
                  onChange={(e) => setCustomCp(parseInt(e.target.value, 10))}
                  style={{ width: '100%', cursor: 'pointer', marginTop: 6 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  {L('बिक्री मूल्य (SP) रु:', 'Selling Price (SP) Rs:')} {customSp}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={customSp}
                  onChange={(e) => setCustomSp(parseInt(e.target.value, 10))}
                  style={{ width: '100%', cursor: 'pointer', marginTop: 6 }}
                />
              </div>
            </div>

            <div style={{ background: customIsProfit ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${customIsProfit ? '#86efac' : '#fca5a5'}`, padding: 18, borderRadius: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: customIsProfit ? '#166534' : '#991b1b' }}>
                {customIsProfit ? L('व्यापार नतिजा: नाफा भयो', 'Business Result: Profit') : L('व्यापार नतिजा: नोक्सान भयो', 'Business Result: Loss')}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: customIsProfit ? '#15803d' : '#b91c1c', marginTop: 4 }}>
                {customIsProfit ? `+ रु. ${customAbsDiff}` : `- रु. ${customAbsDiff}`} ({customPercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Challenge */}
        {activeTab === 'challenge' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} />
              {L('नाफा र नोक्सान आधिकारिक पाठ्यक्रम चुनौती', 'Profit & Loss Challenge Quiz')}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
              {L(
                'माथि दायाँ कुनामा रहेको "चुनौती (Challenge)" मोडमा क्लिक गरी ५ वटा आधिकारिक पाठ्यपुस्तकका प्रश्नहरू हल गर्नुहोस् र ताराहरू जित्नुहोस्!',
                'Click "Challenge" in the header to take the official CDC curriculum quiz and earn mastery stars!'
              )}
            </p>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ProfitLossMarketplace;
