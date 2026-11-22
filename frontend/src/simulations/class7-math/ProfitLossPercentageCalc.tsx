/**
 * ProfitLossPercentageCalc.tsx
 * Grade 7 Mathematics – Lesson 7: PROFIT AND LOSS (नाफा र नोक्सान)
 * Simulation 2: Profit and Loss Percentage Studio (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 99-101)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Percent, TrendingUp, TrendingDown, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'नाफा प्रतिशत (Profit %) र नोक्सान प्रतिशत (Loss %) सधैँ कुन मूल्यको आधारमा हिसाब गरिन्छ?',
    en: 'On which price base is Profit percentage and Loss percentage always calculated?',
    options: [
      { key: 'A', label: 'क्रय मूल्य (Cost Price - CP)' },
      { key: 'B', label: 'विक्रय मूल्य (Selling Price - SP)' },
      { key: 'C', label: 'बजार मूल्य (Market Price)' },
      { key: 'D', label: 'नाफा रकम' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा वस्तु रु १,२०० मा किनेर रु १,५०० मा बेच्दा नाफा प्रतिशत कति हुन्छ?',
    en: 'An item is bought for Rs 1,200 and sold for Rs 1,500. What is the profit percentage?',
    options: [
      { key: 'A', label: '२५% (३००/१२०० × १००% = २५%)' },
      { key: 'B', label: '२०%' },
      { key: 'C', label: '३०%' },
      { key: 'D', label: '१५%' },
    ],
    answer: 'A',
  },
  {
    np: 'रु १,००० मा किनेको सामान रु ९५० मा बेच्दा कति प्रतिशत नोक्सान हुन्छ?',
    en: 'A goods bought for Rs 1,000 is sold for Rs 950. What is the loss percentage?',
    options: [
      { key: 'A', label: '५% (५०/१००० × १००% = ५%)' },
      { key: 'B', label: '१०%' },
      { key: 'C', label: '२.५%' },
      { key: 'D', label: '५०%' },
    ],
    answer: 'A',
  },
  {
    np: 'नाफा प्रतिशत निकाल्ने सही सूत्र कुन हो?',
    en: 'What is the correct formula to calculate Profit Percentage?',
    options: [
      { key: 'A', label: '(नाफा / क्रय मूल्य) × १००%  [(Profit / CP) × 100%]' },
      { key: 'B', label: '(नाफा / विक्रय मूल्य) × १००%' },
      { key: 'C', label: '(क्रय मूल्य / नाफा) × १००%' },
      { key: 'D', label: '(विक्रय मूल्य - क्रय मूल्य) × १०' },
    ],
    answer: 'A',
  },
];

export const ProfitLossPercentageCalc: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L7-02',
    titleEn: 'Profit and Loss Percentage Studio',
    titleNp: 'नाफा र नोक्सान प्रतिशत कार्यशाला',
    chapter: 7,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'calc' | 'comparison' | 'visual-bar'>('calc');

  // Interactive inputs for calculator
  const [cp, setCp] = useState<number>(1200);
  const [sp, setSp] = useState<number>(1500);

  const netDiff = sp - cp;
  const isProfit = netDiff > 0;
  const isLoss = netDiff < 0;
  const profitAmt = Math.max(0, netDiff);
  const lossAmt = Math.max(0, -netDiff);

  const percentageVal = cp > 0 ? (Math.abs(netDiff) / cp) * 100 : 0;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नाफा र नोक्सान प्रतिशत सधैँ क्रय मूल्य (CP) को आधारमा हिसाब गरिन्छ: (नाफा वा नोक्सान / CP) × १००%',
        'Profit % and Loss % are always computed on Cost Price base: (Profit or Loss / CP) × 100%'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'calc', np: '१. प्रतिशत क्याल्कुलेटर (Percentage Calculator)', en: '1. Percentage Calculator' },
            { id: 'visual-bar', np: '२. प्रतिशत दृश्यावलोकन पट्टी (Visual Bar)', en: '2. Visual Bar' },
            { id: 'comparison', np: '३. बहु-उत्पादन तुलना (Product Comparison)', en: '3. Product Comparison' },
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

        {/* TAB 1: Step-by-Step Calculator */}
        {activeTab === 'calc' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('चरणबद्ध नाफा र नोक्सान प्रतिशत गणना', 'Step-by-Step Percentage Calculation')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'नाफा प्रतिशत र नोक्सान प्रतिशत सधैँ क्रय मूल्य (CP) मा आधारित हुन्छ। तलका मान परिवर्तन गरी हेर्नुहोस्:',
                'Profit % and Loss % are always evaluated on Cost Price (CP). Adjust values below:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('क्रय मूल्य (CP): ', 'Cost Price (CP): ')} रु {cp}
                </label>
                <input
                  type="range"
                  min={200}
                  max={3000}
                  step={50}
                  value={cp}
                  onChange={(e) => {
                    kit.tap();
                    setCp(parseInt(e.target.value));
                  }}
                  style={{ width: 180 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('विक्रय मूल्य (SP): ', 'Selling Price (SP): ')} रु {sp}
                </label>
                <input
                  type="range"
                  min={200}
                  max={3000}
                  step={50}
                  value={sp}
                  onChange={(e) => {
                    kit.tap();
                    setSp(parseInt(e.target.value));
                  }}
                  style={{ width: 180 }}
                />
              </div>
            </div>

            {/* Step-by-Step Solution Card */}
            <div
              style={{
                background: '#F8FAFC',
                padding: 18,
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('१. दिइएको:', '1. Given:')}</strong> क्रय मूल्य (CP) = रु {cp}, विक्रय मूल्य (SP) = रु {sp}
              </div>

              <div>
                <strong>{L('२. अवस्था परीक्षण:', '2. Condition Check:')}</strong>{' '}
                {isProfit && (
                  <span style={{ color: '#059669', fontWeight: 700 }}>
                    SP &gt; CP भएकोले यहाँ नाफा (Profit) हुन्छ।
                  </span>
                )}
                {isLoss && (
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>
                    CP &gt; SP भएकोले यहाँ नोक्सान (Loss) हुन्छ।
                  </span>
                )}
                {!isProfit && !isLoss && <span style={{ color: '#64748B' }}>SP = CP (नाफा/नोक्सान छैन)</span>}
              </div>

              <div>
                <strong>{L('३. रकम गणना:', '3. Amount Calculation:')}</strong>{' '}
                {isProfit && `नाफा = SP - CP = रु ${sp} - रु ${cp} = रु ${profitAmt}`}
                {isLoss && `नोक्सान = CP - SP = रु ${cp} - रु ${sp} = रु ${lossAmt}`}
                {!isProfit && !isLoss && `रकम = रु ०`}
              </div>

              <div>
                <strong>{L('४. प्रतिशत सूत्र:', '4. Percentage Formula:')}</strong>{' '}
                {isProfit && `नाफा प्रतिशत (P%) = (नाफा / CP) × १००%`}
                {isLoss && `नोक्सान प्रतिशत (L%) = (नोक्सान / CP) × १००%`}
                {!isProfit && !isLoss && `०%`}
              </div>

              <div>
                <strong>{L('५. मान राख्दा:', '5. Substituting values:')}</strong>{' '}
                {isProfit && `(${profitAmt} / ${cp}) × १००% = (${(profitAmt * 100).toLocaleString()} / ${cp})%`}
                {isLoss && `(${lossAmt} / ${cp}) × १००% = (${(lossAmt * 100).toLocaleString()} / ${cp})%`}
                {!isProfit && !isLoss && `०%`}
              </div>

              <div
                style={{
                  marginTop: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: isProfit ? '#ECFDF5' : isLoss ? '#FEF2F2' : '#F1F5F9',
                  border: `2px solid ${isProfit ? '#10B981' : isLoss ? '#EF4444' : '#94A3B8'}`,
                  fontSize: 18,
                  fontWeight: 800,
                  color: isProfit ? '#047857' : isLoss ? '#B91C1C' : '#334155',
                }}
              >
                {isProfit && `${L('नाफा प्रतिशत', 'Profit Percentage')} = ${percentageVal.toFixed(2)}%`}
                {isLoss && `${L('नोक्सान प्रतिशत', 'Loss Percentage')} = ${percentageVal.toFixed(2)}%`}
                {!isProfit && !isLoss && `०% (Break-Even)`}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Visual Percentage Bar */}
        {activeTab === 'visual-bar' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('१००% आधार (CP) सँगको दृश्यावलोकन तुलना', 'Visual Comparison Relative to 100% CP Base')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'क्रय मूल्य (CP) लाई १००% मान्दा विक्रय मूल्य कति प्रतिशत पुग्छ हेर्नुहोस्:',
                'Considering Cost Price (CP) as 100%, observe where the Selling Price falls:'
              )}
            </p>

            <div style={{ margin: '24px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                <span style={{ color: '#0369A1' }}>{L('क्रय मूल्य (CP Base = १००%): रु ', 'Cost Price (100% Base): Rs ')}{cp}</span>
                <span style={{ color: isProfit ? '#059669' : '#DC2626' }}>
                  {L('विक्रय मूल्य (SP): रु ', 'Selling Price (SP): Rs ')}{sp} ({((sp / cp) * 100).toFixed(1)}%)
                </span>
              </div>

              {/* Progress Container */}
              <div
                style={{
                  height: 36,
                  background: '#E2E8F0',
                  borderRadius: 10,
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid #CBD5E1',
                }}
              >
                {/* 100% CP marker line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: '#0F172A',
                    zIndex: 2,
                  }}
                />

                {/* Left side: Cost Price baseline */}
                <div
                  style={{
                    width: `${Math.min(100, (sp / (cp * 1.5)) * 100)}%`,
                    height: '100%',
                    background: isProfit ? 'linear-gradient(90deg, #3B82F6, #10B981)' : '#F87171',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 10,
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {isProfit && `+${percentageVal.toFixed(1)}%`}
                  {isLoss && `-${percentageVal.toFixed(1)}%`}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginTop: 4 }}>
                <span>०%</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>CP = १००%</span>
                <span>१५०%+</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Product Comparison */}
        {activeTab === 'comparison' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('वस्तुहरूको नाफा प्रतिशत तुलना', 'Comparing Profitability Across Items')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'व्यापारमा कुन सामान बेच्दा धेरै फाइदा भयो भन्ने कुरा नाफा रकम मात्र नभई नाफा प्रतिशत (Profit %) हेरेर निर्णय गरिन्छ।',
                'In business, profitability is determined by profit percentage rather than just gross rupee profit.'
              )}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                marginTop: 16,
              }}
            >
              {[
                { nameNp: 'सामान A (पेन्सिल बक्स)', nameEn: 'Item A (Pencil Box)', cp: 100, sp: 130 },
                { nameNp: 'सामान B (झोला)', nameEn: 'Item B (School Bag)', cp: 1000, sp: 1200 },
                { nameNp: 'सामान C (ज्याकेट)', nameEn: 'Item C (Jacket)', cp: 2500, sp: 2750 },
              ].map((item, idx) => {
                const pAmt = item.sp - item.cp;
                const pPct = (pAmt / item.cp) * 100;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      background: '#F8FAFC',
                      borderRadius: 10,
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>
                      {L(item.nameNp, item.nameEn)}
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                      CP: रु {item.cp} | SP: रु {item.sp}
                    </div>
                    <div style={{ fontSize: 13, color: '#0369A1', marginTop: 2 }}>
                      नाफा रकम: <strong>रु {pAmt}</strong>
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        padding: '6px 10px',
                        borderRadius: 6,
                        background: '#ECFDF5',
                        border: '1px solid #6EE7B7',
                        fontWeight: 800,
                        color: '#047857',
                        fontSize: 14,
                      }}
                    >
                      नाफा %: {pPct.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: '#FEF3C7',
                borderRadius: 8,
                border: '1px solid #FCD34D',
                fontSize: 13,
                color: '#92400E',
              }}
            >
              💡{' '}
              {L(
                'हेर्नुहोस्: सामान A को नाफा रकम रु ३० मात्र भए पनि नाफा प्रतिशत ३०% छ, जुन सामान B (२०%) र सामान C (१०%) भन्दा धेरै बढी हो!',
                'Notice: Even though Item A yielded only Rs 30 profit, its profit margin is 30%, which is higher than Item B (20%) and Item C (10%)!'
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ProfitLossPercentageCalc;
