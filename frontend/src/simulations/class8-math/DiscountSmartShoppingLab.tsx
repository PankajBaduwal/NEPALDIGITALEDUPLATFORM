/**
 * DiscountSmartShoppingLab.tsx
 * Grade 8 Mathematics – Unit 5: PROFIT AND LOSS (नाफा र नोक्सान)
 * Simulation 2: Discount and Smart Shopping Lab (छुट र किनमेल प्रयोगशाला)
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
      { key: 'A', label: 'अङ्कित मूल्यमा (On Marked Price - MP)' },
      { key: 'B', label: 'क्रय मूल्यमा (On CP)' },
      { key: 'C', label: 'बिक्री मूल्यमा (On SP)' },
      { key: 'D', label: 'नाफामा' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा ज्याकेटको अङ्कित मूल्य रु. २,२०० र छुट १०% भए छुट पछिको बिक्री मूल्य (SP) कति हुन्छ?',
    en: 'If a jacket has a marked price of Rs. 2,200 and a 10% discount, what is the selling price (SP)?',
    options: [
      { key: 'A', label: 'रु. १,९८० [ छुट २२० ⇒ २२०० - २२० = १९८० ]' },
      { key: 'B', label: 'रु. २,०००' },
      { key: 'C', label: 'रु. १,८८०' },
      { key: 'D', label: 'रु. २,१००' },
    ],
    answer: 'A',
  },
  {
    np: '८% छुट दिएर एउटा मोबाइल रु. २२,०८० मा बेच्दा त्यसको सुरुको अङ्कित मूल्य (MP) कति थियो?',
    en: 'A mobile is sold for Rs. 22,080 after an 8% discount. What was its original marked price (MP)?',
    options: [
      { key: 'A', label: 'रु. २४,००० [ MP = २२०८० × १०० ÷ ९२ = २४,००० ]' },
      { key: 'B', label: 'रु. २३,०००' },
      { key: 'C', label: 'रु. २५,०००' },
      { key: 'D', label: 'रु. २६,५००' },
    ],
    answer: 'A',
  },
  {
    np: 'अङ्कित मूल्य रु. १,८०० भएको वस्तु रु. १,५३० मा बेच्दा छुट प्रतिशत कति हुन्छ?',
    en: 'If an item with marked price Rs. 1,800 is sold for Rs. 1,530, what is the discount percentage?',
    options: [
      { key: 'A', label: '१५% [ छुट २७० ÷ १८०० × १००% = १५% ]' },
      { key: 'B', label: '१०%' },
      { key: 'C', label: '१२%' },
      { key: 'D', label: '१८%' },
    ],
    answer: 'A',
  },
  {
    np: 'क्रय मूल्यभन्दा २५% बढाएर अङ्कित मूल्य तोकी पुनः २५% छुट दिँदा पसलेलाई के हुन्छ?',
    en: 'If marked price is set 25% above CP and sold at a 25% discount, what is the net business result?',
    options: [
      { key: 'A', label: '६.२५% नोक्सान (Net Loss of 6.25%)' },
      { key: 'B', label: 'नाफा पनि होइन नोक्सान पनि होइन' },
      { key: 'C', label: '६.२५% नाफा' },
      { key: 'D', label: '२५% नाफा' },
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
            { id: 'calc_sp', labelNp: '१. छुट र बिक्री मूल्य गणना', labelEn: '1. Calculate SP', icon: Tag },
            { id: 'find_mp', labelNp: '२. अङ्कित मूल्य (MP) पत्ता लगाउने', labelEn: '2. Find Marked Price', icon: ArrowRight },
            { id: 'find_pct', labelNp: '३. छुट प्रतिशत निकाल्ने', labelEn: '3. Find Discount %', icon: Percent },
            { id: 'discount_profit_trap', labelNp: '४. छुट र नाफा/नोक्सान संयोजन', labelEn: '4. Discount & Profit/Loss', icon: AlertTriangle },
            { id: 'challenge', labelNp: '५. अभ्यास चुनौती', labelEn: '5. Quiz Challenge', icon: Award },
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
                • <strong>{L('अङ्कित मूल्य (Marked Price - MP):', 'Marked Price (MP):')}</strong> रु. {isNe ? toNp(selectedProd.mp) : selectedProd.mp}
              </div>
              <div style={{ fontSize: 15, color: '#334155' }}>
                • <strong>{L('छुट प्रतिशत (Discount %):', 'Discount %:')}</strong> {selectedProd.discountPct}%
              </div>
              <div style={{ fontSize: 15, color: '#0284c7', fontWeight: 700 }}>
                • <strong>{L('छुट रकम (Discount Amount):', 'Discount Amount:')}</strong> (रु. {selectedProd.mp} × {selectedProd.discountPct}) ÷ १०० = <strong>रु. {discAmount}</strong>
              </div>

              <div style={{ background: '#ecfdf5', padding: 14, borderRadius: 10, border: '1.5px solid #a7f3d0', marginTop: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>
                  {L('छुटपछिको बिक्री मूल्य (SP = MP - Discount):', 'Final Selling Price (SP = MP - Discount):')}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                  रु. {isNe ? toNp(spVal) : spVal}
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
                  '८% छुट दिएर एउटा मोबाइल रु. २२,०८० मा बेच्दा सुरुको अङ्कित मूल्य कति थियो?',
                  'A mobile was sold for Rs. 22,080 after an 8% discount. Find its original marked price:'
                )}
              </div>
            </div>

            <div style={{ background: '#eff6ff', padding: 18, borderRadius: 14, border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14, color: '#1e40af' }}>
                मानौँ अङ्कित मूल्य = MP<br />
                SP = MP × (१०० - छुट%) ÷ १००<br />
                २२,०८० = MP × (१०० - ८) ÷ १००<br />
                २२,०८० = MP × ९२ ÷ १००
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#1d4ed8', marginTop: 4 }}>
                MP = (२२,०८० × १००) ÷ ९२ = रु. {calculatedMp.toLocaleString()}
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
              <div>• <strong>अङ्कित मूल्य (MP):</strong> रु. {testMp}</div>
              <div>• <strong>बिक्री मूल्य (SP):</strong> रु. {testSp}</div>
              <div>• <strong>छुट रकम = MP - SP:</strong> रु. {testMp} - रु. {testSp} = रु. {calcDiscAmount}</div>
              <div style={{ background: '#ecfdf5', padding: 14, borderRadius: 10, border: '1.5px solid #a7f3d0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>{L('छुट प्रतिशत सूत्र:', 'Discount % Formula:')}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                  (छुट रकम ÷ MP) × १००% = ({calcDiscAmount} ÷ {testMp}) × १००% = {calcDiscPct.toFixed(2)}%
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
                  'एउटा कम्प्युटर रु. ३६,००० मा किनियो (CP)। यसको अङ्कित मूल्य २५% बढाएर राखियो र पछि २५% छुटमा बेचियो। के पसलेलाई नाफा भयो?',
                  'A computer was bought for Rs. 36,000 (CP). Marked price was set 25% above CP, and then sold at a 25% discount. Did the shopkeeper earn a profit?'
                )}
              </p>
            </div>

            <div style={{ background: '#fef2f2', padding: 18, borderRadius: 14, border: '1.5px solid #fecaca', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>१. क्रय मूल्य (CP) = <strong>रु. ३६,०००</strong></div>
              <div>२. अङ्कित मूल्य (२५% वृद्धि) = ३६००० + ९००० = <strong>रु. ४५,०००</strong></div>
              <div>३. छुट (२५% of ४५,०००) = <strong>रु. ११,२५०</strong></div>
              <div>४. बिक्री मूल्य (SP = ४५००० - ११२५०) = <strong>रु. ३३,७५०</strong></div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#b91c1c', marginTop: 4 }}>
                ५. SP (३३,७५०) &lt; CP (३६,०००) भएकाले नोक्सान भयो = रु. २,२५० (६.२५% नोक्सान)
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
                'माथि दायाँ कुनामा रहेको "चुनौती (Challenge)" ट्याबबाट ५ वटा आधिकारिक पाठ्यपुस्तकका प्रश्नहरू हल गरी ताराहरू जित्नुहोस्!',
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
