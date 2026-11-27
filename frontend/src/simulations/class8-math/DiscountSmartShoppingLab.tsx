/**
 * DiscountSmartShoppingLab.tsx
 * Grade 8 Mathematics – Unit 5: PROFIT AND LOSS
 * Simulation 2: Discount and Smart Shopping Lab
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 5)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Tag, Percent, ShoppingCart, Award, ArrowRight, HelpCircle, AlertTriangle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'छुट रकम (Discount Amount) सधैं कुन मूल्यमा गणना गरिन्छ?',
    en: 'On which price is the discount amount always calculated?',
    options: [
      { key: 'A', label: 'On marked price (MP)' },
      { key: 'B', label: 'On cost price (CP)' },
      { key: 'C', label: 'On selling price (SP)' },
      { key: 'D', label: 'On profit' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा ज्याकेटको अङ्कित मूल्य Rs. 2,200 र छुट 10% भए छुट पछिको बिक्री मूल्य (SP) कति हुन्छ?',
    en: 'If a jacket has a marked price of Rs. 2,200 and a 10% discount, what is the selling price (SP)?',
    options: [
      { key: 'A', label: 'Rs. 1,980 [ discount 220 ⇒ 2200 - 220 = 1980 ]' },
      { key: 'B', label: 'Rs. 2,000' },
      { key: 'C', label: 'Rs. 1,880' },
      { key: 'D', label: 'Rs. 2,100' },
    ],
    answer: 'A',
  },
  {
    np: '8% छुट दिएर एउटा मोबाइल Rs. 22,080 मा बेच्दा त्यसको सुरुको अङ्कित मूल्य (MP) कति थियो?',
    en: 'A mobile is sold for Rs. 22,080 after an 8% discount. What was its original marked price (MP)?',
    options: [
      { key: 'A', label: 'Rs. 24,000 [ MP = 22080 × 100 ÷ 92 = 24,000 ]' },
      { key: 'B', label: 'Rs. 23,000' },
      { key: 'C', label: 'Rs. 25,000' },
      { key: 'D', label: 'Rs. 26,500' },
    ],
    answer: 'A',
  },
  {
    np: 'अङ्कित मूल्य Rs. 1,800 भएको वस्तु Rs. 1,530 मा बेच्दा छुट प्रतिशत कति हुन्छ?',
    en: 'If an item with marked price Rs. 1,800 is sold for Rs. 1,530, what is the discount percentage?',
    options: [
      { key: 'A', label: '15% [ discount 270 ÷ 1800 × 100% = 15% ]' },
      { key: 'B', label: '10%' },
      { key: 'C', label: '12%' },
      { key: 'D', label: '18%' },
    ],
    answer: 'A',
  },
  {
    np: 'क्रय मूल्यभन्दा 25% बढाएर अङ्कित मूल्य तोकी पुनः 25% छुट दिँदा पसलेलाई के हुन्छ?',
    en: 'If marked price is set 25% above CP and sold at a 25% discount, what is the net business result?',
    options: [
      { key: 'A', label: '6.25% loss (net loss of 6.25%)' },
      { key: 'B', label: 'Neither profit nor loss' },
      { key: 'C', label: '6.25% profit' },
      { key: 'D', label: '25% profit' },
    ],
    answer: 'A',
  },
];

const TEXTBOOK_PRODUCTS = [
  { nameNp: 'घडी (Watch)', nameEn: 'Watch', mp: 2200, discountPct: 15 },
  { nameNp: 'झोला (Bag)', nameEn: 'Bag', mp: 1750, discountPct: 12 },
  { nameNp: 'दराज (Cupboard)', nameEn: 'Cupboard', mp: 30000, discountPct: 25 },
  { nameNp: 'कम्प्युटर (Computer)', nameEn: 'Computer', mp: 40000, discountPct: 10 },
];

export const DiscountSmartShoppingLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U5-02',
    chapter: 5,
    titleNp: 'छुट र किनमेल प्रयोगशाला (Discount & Shopping Lab)',
    titleEn: 'Discount and Smart Shopping Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'calc_sp' | 'find_mp' | 'find_pct' | 'discount_profit_trap' | 'challenge'>('calc_sp');

  // Tab 1 selected textbook product
  const [selectedProd, setSelectedProd] = useState(TEXTBOOK_PRODUCTS[0]);
  const discAmount = (selectedProd.mp * selectedProd.discountPct) / 100;
  const spVal = selectedProd.mp - discAmount;

  // Tab 2 Find MP inputs
  const [givenSp, setGivenSp] = useState<number>(22080);
  const [givenPct, setGivenPct] = useState<number>(8);
  const calculatedMp = (givenSp * 100) / (100 - givenPct);

  // Tab 3 Find discount % inputs
  const [testMp, setTestMp] = useState<number>(1800);
  const [testSp, setTestSp] = useState<number>(1530);
  const calcDiscAmount = testMp - testSp;
  const calcDiscPct = testMp > 0 ? (calcDiscAmount / testMp) * 100 : 0;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! अङ्कित मूल्य (MP), छुट प्रतिशत र छुटपछिको बिक्री मूल्य (SP) हिसाब गर्न सिकौँ!',
        'Hello! Explore Marked Price (MP), Discount %, Discount Amount, and Final Selling Price (SP)!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'calc_sp', labelNp: '1. छुट र बिक्री मूल्य गणना', labelEn: '1. Calculate SP', icon: Tag },
            { id: 'find_mp', labelNp: '2. अङ्कित मूल्य (MP) पत्ता लगाउने', labelEn: '2. Find Marked Price', icon: ArrowRight },
            { id: 'find_pct', labelNp: '3. छुट प्रतिशत निकाल्ने', labelEn: '3. Find Discount %', icon: Percent },
            { id: 'discount_profit_trap', labelNp: '4. छुट र नाफा/नोक्सान संयोजन', labelEn: '4. Discount & Profit/Loss', icon: AlertTriangle },
            { id: 'challenge', labelNp: '5. अभ्यास चुनौती', labelEn: '5. Quiz Challenge', icon: Award },
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

        {/* Tab 1: Calculate SP */}
        {activeTab === 'calc_sp' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag size={20} />
              {L('पाठ्यपुस्तक तालिका: छुट र बिक्री मूल्य गणना', 'CDC Textbook Table: Discount & Selling Price')}
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {TEXTBOOK_PRODUCTS.map((prod) => (
                <button
                  key={prod.nameEn}
                  onClick={() => setSelectedProd(prod)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selectedProd.nameEn === prod.nameEn ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: selectedProd.nameEn === prod.nameEn ? '#e0f2fe' : '#ffffff',
                    color: selectedProd.nameEn === prod.nameEn ? '#0369a1' : '#334155',
                  }}
                >
                  {isNe ? prod.nameNp : prod.nameEn}
                </button>
              ))}
            </div>

            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 15, color: '#334155' }}>
                • <strong>{L('अङ्कित मूल्य (Marked Price - MP):', 'Marked Price (MP):')}</strong> Rs. {isNe ? toNp(selectedProd.mp) : selectedProd.mp}
              </div>
              <div style={{ fontSize: 15, color: '#334155' }}>
                • <strong>{L('छुट प्रतिशत (Discount %):', 'Discount %:')}</strong> {selectedProd.discountPct}%
              </div>
              <div style={{ fontSize: 15, color: '#0284c7', fontWeight: 700 }}>
                • <strong>{L('छुट रकम (Discount Amount):', 'Discount Amount:')}</strong> (Rs. {selectedProd.mp} × {selectedProd.discountPct}) ÷ 100 = <strong>Rs. {discAmount}</strong>
              </div>

              <div style={{ background: '#ecfdf5', padding: 14, borderRadius: 10, border: '1.5px solid #a7f3d0', marginTop: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>
                  {L('छुटपछिको बिक्री मूल्य (SP = MP - Discount):', 'Final Selling Price (SP = MP - Discount):')}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                  Rs. {isNe ? toNp(spVal) : spVal}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Find MP */}
        {activeTab === 'find_mp' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight size={20} />
              {L('पाठ्यपुस्तक उदाहरण: बिक्री मूल्य र छुटबाट सुरुको अङ्कित मूल्य पत्ता लगाउने', 'Find Marked Price from SP & Discount %')}
            </h3>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', marginBottom: 14, lineHeight: 1.6 }}>
              <div style={{ fontSize: 14, color: '#1e293b' }}>
                {L(
                  '8% छुट दिएर एउटा मोबाइल Rs. 22,080 मा बेच्दा सुरुको अङ्कित मूल्य कति थियो?',
                  'A mobile was sold for Rs. 22,080 after an 8% discount. Find its original marked price:'
                )}
              </div>
            </div>

            <div style={{ background: '#eff6ff', padding: 18, borderRadius: 14, border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14, color: '#1e40af' }}>
                Let the marked price = MP<br />
                SP = MP × (100 - Discount%) ÷ 100<br />
                22,080 = MP × (100 - 8) ÷ 100<br />
                22,080 = MP × 92 ÷ 100
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#1d4ed8', marginTop: 4 }}>
                MP = (22,080 × 100) ÷ 92 = Rs. {calculatedMp.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Find Discount % */}
        {activeTab === 'find_pct' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Percent size={20} />
              {L('पाठ्यपुस्तक उदाहरण: छुट प्रतिशत पत्ता लगाउने', 'Find Discount Percentage')}
            </h3>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>• <strong>Marked price (MP):</strong> Rs. {testMp}</div>
              <div>• <strong>Selling price (SP):</strong> Rs. {testSp}</div>
              <div>• <strong>Discount amount = MP - SP:</strong> Rs. {testMp} - Rs. {testSp} = Rs. {calcDiscAmount}</div>
              <div style={{ background: '#ecfdf5', padding: 14, borderRadius: 10, border: '1.5px solid #a7f3d0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>{L('छुट प्रतिशत सूत्र:', 'Discount % Formula:')}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                  (Discount amount ÷ MP) × 100% = ({calcDiscAmount} ÷ {testMp}) × 100% = {calcDiscPct.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Discount & Profit Trap */}
        {activeTab === 'discount_profit_trap' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#c2410c', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={20} />
              {L('पाठ्यपुस्तक विशेष उदाहरण: छुट दिँदैमा नाफा हुन्छ भन्ने हुँदैन!', 'Textbook Trap: Discount Does Not Always Mean Profit!')}
            </h3>

            <div style={{ background: '#fff7ed', padding: 16, borderRadius: 12, border: '1px solid #fed7aa', marginBottom: 14, lineHeight: 1.6 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#9a3412' }}>
                {L(
                  'एउटा कम्प्युटर Rs. 36,000 मा किनियो (CP)। यसको अङ्कित मूल्य 25% बढाएर राखियो र पछि 25% छुटमा बेचियो। के पसलेलाई नाफा भयो?',
                  'A computer was bought for Rs. 36,000 (CP). Marked price was set 25% above CP, and then sold at a 25% discount. Did the shopkeeper earn a profit?'
                )}
              </p>
            </div>

            <div style={{ background: '#fef2f2', padding: 18, borderRadius: 14, border: '1.5px solid #fecaca', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>1. Cost price (CP) = <strong>Rs. 36,000</strong></div>
              <div>2. Marked price (25% increase) = 36000 + 9000 = <strong>Rs. 45,000</strong></div>
              <div>3. Discount (25% of 45,000) = <strong>Rs. 11,250</strong></div>
              <div>4. Selling price (SP = 45000 - 11250) = <strong>Rs. 33,750</strong></div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#b91c1c', marginTop: 4 }}>
                5. Since SP (33,750) &lt; CP (36,000), there is a loss = Rs. 2,250
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Challenge */}
        {activeTab === 'challenge' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} />
              {L('छुट तथा किनमेल अभ्यास चुनौती', 'Discount Challenge Quiz')}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
              {L(
                'माथि दायाँ कुनामा रहेको "चुनौती (Challenge)" ट्याबबाट 5 pcs आधिकारिक पाठ्यपुस्तकका प्रश्नहरू हल गरी ताराहरू जित्नुहोस्!',
                'Click "Challenge" mode in the header to take the official CDC curriculum quiz and earn mastery stars!'
              )}
            </p>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default DiscountSmartShoppingLab;
