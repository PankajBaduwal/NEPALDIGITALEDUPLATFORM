/**
 * RealLifeBusinessChallenge.tsx
 * Grade 7 Mathematics – Lesson 7: PROFIT AND LOSS (नाफा र नोक्सान)
 * Simulation 4: Real-Life Business and Overhead Expenses (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 101-103)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Truck, Home, AlertTriangle, TrendingUp, Check, Layers } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'सामान किन्दा लागेको ढुवानी, मर्मत वा कर खर्चलाई के भनिन्छ र यो कहाँ जोडिन्छ?',
    en: 'What is transportation, repair, or tax called, and where is it added?',
    options: [
      { key: 'A', label: 'अतिरिक्त खर्च (Overhead Expenses), यो क्रय मूल्य (CP) मा जोडिन्छ' },
      { key: 'B', label: 'विक्रय मूल्य (SP) मा जोडिन्छ' },
      { key: 'C', label: 'नाफाबाट घटाइन्छ' },
      { key: 'D', label: 'कुनै पनि होइन' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा फ्रिज रु ३२,५०० मा किनेर रु ५०० ढुवानी खर्च लाग्यो र रु ३३,५०० मा बेचियो भने नाफा कति हुन्छ?',
    en: 'A fridge was bought for Rs 32,500 with Rs 500 transport and sold for Rs 33,500. What is the profit?',
    options: [
      { key: 'A', label: 'रु ५०० (जम्मा CP = ३३,०००, SP = ३३,५०० => नाफा = रु ५००)' },
      { key: 'B', label: 'रु १,०००' },
      { key: 'C', label: 'रु १,५००' },
      { key: 'D', label: 'नोक्सान रु ५००' },
    ],
    answer: 'A',
  },
  {
    np: '५० वटा चिम प्रतिगोटा रु ४० का दरले किन्दा १५ वटा फुट्यो। बाँकी ३५ वटा प्रतिगोटा रु ५० मा बेच्दा के हुन्छ?',
    en: '50 bulbs were bought at Rs 40 each, 15 were broken. The remaining 35 were sold at Rs 50 each. What is the result?',
    options: [
      { key: 'A', label: 'रु २५० नोक्सान (CP = २०००, SP = १७५० => नोक्सान = रु २५०)' },
      { key: 'B', label: 'रु २५० नाफा' },
      { key: 'C', label: 'रु ५०० नाफा' },
      { key: 'D', label: 'नाफा न नोक्सान' },
    ],
    answer: 'A',
  },
  {
    np: 'घर रु ९५,००,००० मा किनेर मर्मतमा रु २,००,००० खर्च गरी रु १,१०,००,००० मा बेच्दा नाफा कति हुन्छ?',
    en: 'A house was bought for Rs 95,00,000, Rs 2,00,000 spent on repair, and sold for Rs 1,10,00,000. What is the profit?',
    options: [
      { key: 'A', label: 'रु १३,००,००० (जम्मा CP = ९७ लाख, SP = १ करोड १० लाख)' },
      { key: 'B', label: 'रु १५,००,०००' },
      { key: 'C', label: 'रु १०,००,०००' },
      { key: 'D', label: 'रु १२,००,०००' },
    ],
    answer: 'A',
  },
];

export const RealLifeBusinessChallenge: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L7-04',
    titleEn: 'Real-Life Business & Overhead Expenses',
    titleNp: 'व्यवहारिक व्यापार र अतिरिक्त खर्च',
    chapter: 7,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'overhead' | 'damaged' | 'real-estate' | 'spoiled'>('overhead');

  // Case 1: Refrigerator Overhead
  const [fridgeBuyPrice, setFridgeBuyPrice] = useState<number>(32500);
  const [transportCost, setTransportCost] = useState<number>(500);
  const [fridgeSp, setFridgeSp] = useState<number>(33500);
  const totalFridgeCp = fridgeBuyPrice + transportCost;
  const fridgeProfit = fridgeSp - totalFridgeCp;

  // Case 2: Broken Bulbs
  const [totalBulbs, setTotalBulbs] = useState<number>(50);
  const [bulbRate, setBulbRate] = useState<number>(40);
  const [brokenBulbs, setBrokenBulbs] = useState<number>(15);
  const [sellingBulbRate, setSellingBulbRate] = useState<number>(50);
  const remainingBulbs = Math.max(0, totalBulbs - brokenBulbs);
  const totalBulbCp = totalBulbs * bulbRate;
  const totalBulbSp = remainingBulbs * sellingBulbRate;
  const bulbDiff = totalBulbSp - totalBulbCp;

  // Case 3: Real Estate
  const houseBuy = 9500000;
  const houseRepair = 200000;
  const houseSp = 11000000;
  const totalHouseCp = houseBuy + houseRepair;
  const houseProfit = houseSp - totalHouseCp;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'सामान किन्दा लागेको ढुवानी र मर्मत खर्चलाई क्रय मूल्यमा जोडेर कुल क्रय मूल्य निकालिन्छ!',
        'Add transportation and repair expenses to purchase price to find total cost price!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'overhead', np: '१. ढुवानी खर्च (Overhead Expenses)', en: '1. Overhead Expenses' },
            { id: 'damaged', np: '२. फुटेको सामान (Damaged Goods)', en: '2. Damaged Goods' },
            { id: 'real-estate', np: '३. घर मर्मत र बिक्री (House Repair)', en: '3. House Repair' },
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

        {/* TAB 1: Overhead Expenses (Fridge) */}
        {activeTab === 'overhead' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('ढुवानी र अतिरिक्त खर्च (Overhead Expenses)', 'Overhead Expenses')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: एउटा फ्रिज रु ३२,५०० मा किनेर घर ल्याउँदा रु ५०० ढुवानी खर्च लाग्यो र रु ३३,५०० मा बेचियो।',
                'Textbook Example: A refrigerator bought for Rs 32,500 had Rs 500 transport cost, then was sold for Rs 33,500.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('खरिद मूल्य: ', 'Purchase Price: ')} रु {fridgeBuyPrice.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={25000}
                  max={40000}
                  step={500}
                  value={fridgeBuyPrice}
                  onChange={(e) => {
                    kit.tap();
                    setFridgeBuyPrice(parseInt(e.target.value));
                  }}
                  style={{ width: 170 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#D97706', display: 'block', marginBottom: 4 }}>
                  {L('ढुवानी खर्च: ', 'Transport Cost: ')} रु {transportCost.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={100}
                  value={transportCost}
                  onChange={(e) => {
                    kit.tap();
                    setTransportCost(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('विक्रय मूल्य (SP): ', 'Selling Price: ')} रु {fridgeSp.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={30000}
                  max={45000}
                  step={500}
                  value={fridgeSp}
                  onChange={(e) => {
                    kit.tap();
                    setFridgeSp(parseInt(e.target.value));
                  }}
                  style={{ width: 170 }}
                />
              </div>
            </div>

            {/* Total Cost Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                marginTop: 16,
              }}
            >
              <div style={{ background: '#EFF6FF', padding: 16, borderRadius: 10, border: '1px solid #BFDBFE' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>
                  {L('जम्मा क्रय मूल्य (Total CP)', 'Total Cost Price (CP)')}
                </span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>
                  रु {totalFridgeCp.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: '#1E3A8A', marginTop: 4 }}>
                  {L('खरिद मूल्य + ढुवानी खर्च', 'Purchase Price + Transportation')}
                </div>
              </div>

              <div style={{ background: '#F0FDF4', padding: 16, borderRadius: 10, border: '1px solid #BBF7D0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
                  {L('विक्रय मूल्य (SP)', 'Selling Price (SP)')}
                </span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#16A34A', marginTop: 4 }}>
                  रु {fridgeSp.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: '#14532D', marginTop: 4 }}>
                  {L('ग्राहकलाई बेचेको मूल्य', 'Price paid by customer')}
                </div>
              </div>

              <div
                style={{
                  background: fridgeProfit >= 0 ? '#ECFDF5' : '#FEF2F2',
                  padding: 16,
                  borderRadius: 10,
                  border: `2px solid ${fridgeProfit >= 0 ? '#34D399' : '#F87171'}`,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: fridgeProfit >= 0 ? '#065F46' : '#991B1B' }}>
                  {fridgeProfit >= 0 ? L('नाफा (Profit)', 'Profit') : L('नोक्सान (Loss)', 'Loss')}
                </span>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: fridgeProfit >= 0 ? '#059669' : '#DC2626',
                    marginTop: 4,
                  }}
                >
                  रु {Math.abs(fridgeProfit).toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: fridgeProfit >= 0 ? '#047857' : '#B91C1C', marginTop: 4 }}>
                  {fridgeProfit >= 0 ? `SP - Total CP` : `Total CP - SP`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Damaged Goods (Bulbs) */}
        {activeTab === 'damaged' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('फुटफुट वा नष्ट भएको सामानको हिसाब (Damaged Goods)', 'Damaged Goods Case')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: ५० वटा चिम प्रतिगोटा रु ४० का दरले किन्दा बाटोमा १५ वटा फुट्यो। बाँकी ३५ वटा प्रतिगोटा रु ५० मा बेच्दा के हुन्छ?',
                'Textbook Example: 50 bulbs bought at Rs 40 each; 15 broke. The remaining 35 were sold at Rs 50 each.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  {L('जम्मा किनेको चिम: ', 'Total Bulbs Bought: ')} {totalBulbs} वटा
                </label>
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={10}
                  value={totalBulbs}
                  onChange={(e) => {
                    kit.tap();
                    const newTot = parseInt(e.target.value);
                    setTotalBulbs(newTot);
                    if (brokenBulbs >= newTot) setBrokenBulbs(Math.floor(newTot / 4));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', display: 'block', marginBottom: 4 }}>
                  {L('फुटेका चिमहरू: ', 'Broken Bulbs: ')} {brokenBulbs} वटा
                </label>
                <input
                  type="range"
                  min={0}
                  max={totalBulbs - 5}
                  value={brokenBulbs}
                  onChange={(e) => {
                    kit.tap();
                    setBrokenBulbs(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('बिक्री दर (प्रतिगोटा): ', 'Selling Rate (each): ')} रु {sellingBulbRate}
                </label>
                <input
                  type="range"
                  min={30}
                  max={80}
                  step={5}
                  value={sellingBulbRate}
                  onChange={(e) => {
                    kit.tap();
                    setSellingBulbRate(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div
              style={{
                background: '#F8FAFC',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('१. जम्मा क्रय मूल्य (Total CP):', '1. Total CP:')}</strong> {totalBulbs} वटा × रु{' '}
                {bulbRate} = <span style={{ fontWeight: 800 }}>रु {totalBulbCp.toLocaleString()}</span>
              </div>
              <div>
                <strong>{L('२. बेच्न मिल्ने बाँकी चिम:', '2. Salable Bulbs:')}</strong> {totalBulbs} - {brokenBulbs} ={' '}
                <span style={{ fontWeight: 800, color: '#0369A1' }}>{remainingBulbs} वटा</span>
              </div>
              <div>
                <strong>{L('३. जम्मा विक्रय मूल्य (Total SP):', '3. Total SP:')}</strong> {remainingBulbs} वटा × रु{' '}
                {sellingBulbRate} = <span style={{ fontWeight: 800 }}>रु {totalBulbSp.toLocaleString()}</span>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 18,
                  fontWeight: 800,
                  color: bulbDiff >= 0 ? '#059669' : '#DC2626',
                }}
              >
                {bulbDiff >= 0
                  ? L(
                      `नतिजा: रु ${bulbDiff} नाफा (Profit)`,
                      `Result: Rs ${bulbDiff} Profit`
                    )
                  : L(
                      `नतिजा: रु ${Math.abs(bulbDiff)} नोक्सान (Loss)`,
                      `Result: Rs ${Math.abs(bulbDiff)} Loss`
                    )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Real Estate (House Repair) */}
        {activeTab === 'real-estate' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('घर खरिद, मर्मत र बिक्री (House Repair & Sale)', 'House Purchase, Repair & Sale')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ १०२ अनुसार: एउटा घर रु ९५,००,००० मा किनेर मर्मत गर्न रु २,००,००० खर्च गरियो र रु १,१०,००,००० मा बेचियो।',
                'Textbook Page 102: A house bought for Rs 95,00,000, Rs 2,00,000 spent on repair, and sold for Rs 1,10,00,000.'
              )}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                margin: '20px 0',
              }}
            >
              <div style={{ background: '#EEF2FF', padding: 16, borderRadius: 10, border: '1px solid #C7D2FE' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4338CA' }}>
                  {L('१. खरिद मूल्य (Purchase)', 'Purchase Price')}
                </span>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#3730A3', marginTop: 4 }}>
                  रु ९५,००,००० (95 Lakhs)
                </div>
              </div>

              <div style={{ background: '#FEF3C7', padding: 16, borderRadius: 10, border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>
                  {L('२. मर्मत खर्च (Repair)', 'Repair Expense')}
                </span>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#92400E', marginTop: 4 }}>
                  रु २,००,००० (2 Lakhs)
                </div>
              </div>

              <div style={{ background: '#ECFDF5', padding: 16, borderRadius: 10, border: '1px solid #6EE7B7' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#065F46' }}>
                  {L('३. जम्मा लागत (Total CP)', 'Total Cost Price')}
                </span>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                  रु ९७,००,००० (97 Lakhs)
                </div>
              </div>

              <div style={{ background: '#F0FDF4', padding: 16, borderRadius: 10, border: '1px solid #86EFAC' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#15803D' }}>
                  {L('४. विक्रय मूल्य (SP)', 'Selling Price')}
                </span>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#16A34A', marginTop: 4 }}>
                  रु १,१०,००,००० (1.1 Crore)
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 16,
                background: '#ECFDF5',
                borderRadius: 10,
                border: '2px solid #10B981',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 14, color: '#065F46', fontWeight: 700 }}>
                {L('प्राप्त खुद नाफा (Net Profit)', 'Net Profit Earned')}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                रु {houseProfit.toLocaleString()} ({L('तेह्र लाख रुपैयाँ', '13 Lakhs')})
              </div>
              <div style={{ fontSize: 13, color: '#059669', marginTop: 4 }}>
                नाफा प्रतिशत = (१३,००,००० / ९७,००,०००) × १००% = {((houseProfit / totalHouseCp) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default RealLifeBusinessChallenge;
