/**
 * CostPriceSellingPriceStudio.tsx
 * Grade 7 Mathematics – Lesson 7: PROFIT AND LOSS (नाफा र नोक्सान)
 * Simulation 3: Cost Price & Selling Price Studio (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 100-102)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Calculator, ShoppingCart, DollarSign, Check, RefreshCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एउटा हिटर रु २,५०० मा किनेर १०% नाफामा बेच्दा विक्रय मूल्य (SP) कति हुन्छ?',
    en: 'A heater is bought for Rs 2,500 and sold at 10% profit. What is the Selling Price (SP)?',
    options: [
      { key: 'A', label: 'रु २,७५० (२५०० + २५० = रु २,७५०)' },
      { key: 'B', label: 'रु २,६००' },
      { key: 'C', label: 'रु ३,०००' },
      { key: 'D', label: 'रु २,२५०' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा मोबाइल ५% नाफा खाएर रु २१,००० मा बेच्दा त्यसको क्रय मूल्य (CP) कति थियो?',
    en: 'A mobile was sold for Rs 21,000 at a profit of 5%. What was its Cost Price (CP)?',
    options: [
      { key: 'A', label: 'रु २०,००० [ (२१००० × १००) / १०५ = रु २०,००० ]' },
      { key: 'B', label: 'रु १९,९५०' },
      { key: 'C', label: 'रु १९,०००' },
      { key: 'D', label: 'रु २२,०५०' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि क्रय मूल्य रु २०,००० भएको सामानमा १०% नाफा कमाउन नयाँ विक्रय मूल्य कति हुनुपर्छ?',
    en: 'To make 10% profit on an item with Cost Price Rs 20,000, what must the new Selling Price be?',
    options: [
      { key: 'A', label: 'रु २२,००० (२०,००० + २००० = रु २२,०००)' },
      { key: 'B', label: 'रु २१,०००' },
      { key: 'C', label: 'रु २४,०००' },
      { key: 'D', label: 'रु २०,५००' },
    ],
    answer: 'A',
  },
  {
    np: '५% नोक्सान हुँदा क्रय मूल्य (CP) बाट विक्रय मूल्य (SP) निकाल्ने सुत्र कुन हो?',
    en: 'Which is the formula to find Selling Price (SP) when there is a 5% loss?',
    options: [
      { key: 'A', label: 'SP = CP - (५% × CP) वा CP × (९५/१००)' },
      { key: 'B', label: 'SP = CP + (५% × CP)' },
      { key: 'C', label: 'SP = CP / ५' },
      { key: 'D', label: 'SP = CP × १०५/१००' },
    ],
    answer: 'A',
  },
];

export const CostPriceSellingPriceStudio: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L7-03',
    titleEn: 'Cost Price & Selling Price Studio',
    titleNp: 'क्रय मूल्य र विक्रय मूल्य प्रयोगशाला',
    chapter: 7,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'find-sp' | 'find-cp' | 'target-profit'>('find-sp');

  // Mode 1: Find SP given CP and %
  const [givenCp, setGivenCp] = useState<number>(2500); // Heater example
  const [profitPercent, setProfitPercent] = useState<number>(10);
  const profitRupees = (givenCp * profitPercent) / 100;
  const calculatedSp = givenCp + profitRupees;

  // Mode 2: Find CP given SP and Profit %
  const [givenSp, setGivenSp] = useState<number>(21000); // Mobile example
  const [givenProfitPct, setGivenProfitPct] = useState<number>(5);
  // Formula: SP = CP * (100 + P%) / 100 => CP = (SP * 100) / (100 + P%)
  const calculatedCp = (givenSp * 100) / (100 + givenProfitPct);

  // Mode 3: Target SP for desirable profit
  const [targetCp, setTargetCp] = useState<number>(20000);
  const [desiredProfitPct, setDesiredProfitPct] = useState<number>(10);
  const targetProfitAmt = (targetCp * desiredProfitPct) / 100;
  const targetSp = targetCp + targetProfitAmt;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'क्रय मूल्य (CP) १००% हुन्छ! १०% नाफा हुँदा विक्रय मूल्य ११०% र ५% नोक्सान हुँदा ९५% हुन्छ।',
        'Cost Price (CP) is 100%! At 10% profit, SP is 110%; at 5% loss, SP is 95%.'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'find-sp', np: '१. CP र नाफा% बाट SP पत्ता लगाउने', en: '1. Find SP (from CP & P%)' },
            { id: 'find-cp', np: '२. SP र नाफा% बाट CP पत्ता लगाउने', en: '2. Find CP (from SP & P%)' },
            { id: 'target-profit', np: '३. नयाँ नाफा% को लागि नयाँ SP', en: '3. Target Profit Strategy' },
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

        {/* TAB 1: Find SP */}
        {activeTab === 'find-sp' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('क्रय मूल्य (CP) र नाफा प्रतिशतबाट विक्रय मूल्य (SP) निकाल्ने', 'Find SP from CP and Profit %')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: एउटा हिटर रु २,५०० मा किनेर १०% नाफा लिएर बेच्दा विक्रय मूल्य कति हुन्छ?',
                'Textbook Example: A heater bought for Rs 2,500 is sold at 10% profit. Find the selling price.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('क्रय मूल्य (CP): ', 'Cost Price (CP): ')} रु {givenCp.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={1000}
                  max={10000}
                  step={500}
                  value={givenCp}
                  onChange={(e) => {
                    kit.tap();
                    setGivenCp(parseInt(e.target.value));
                  }}
                  style={{ width: 180 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('नाफा प्रतिशत (Profit %): ', 'Profit %: ')} {profitPercent}%
                </label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={profitPercent}
                  onChange={(e) => {
                    kit.tap();
                    setProfitPercent(parseInt(e.target.value));
                  }}
                  style={{ width: 160 }}
                />
              </div>
            </div>

            {/* Step-by-Step Card */}
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
                <strong>{L('१. नाफा रकम (Profit in Rs):', '1. Profit in Rs:')}</strong> CP को {profitPercent}% = (
                {profitPercent} / १००) × रु {givenCp.toLocaleString()} ={' '}
                <span style={{ fontWeight: 800, color: '#059669' }}>रु {profitRupees.toLocaleString()}</span>
              </div>
              <div>
                <strong>{L('२. विक्रय मूल्य (SP):', '2. Selling Price (SP):')}</strong> CP + नाफा रकम = रु{' '}
                {givenCp.toLocaleString()} + रु {profitRupees.toLocaleString()}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                {L('विक्रय मूल्य (SP) = ', 'Selling Price (SP) = ')} रु {calculatedSp.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Find CP */}
        {activeTab === 'find-cp' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('विक्रय मूल्य (SP) र नाफा प्रतिशतबाट क्रय मूल्य (CP) निकाल्ने', 'Find CP from SP and Profit %')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: एउटा मोबाइल फोन ५% नाफा खाएर रु २१,००० मा बेच्दा त्यसको क्रय मूल्य कति थियो?',
                'Textbook Example: A mobile phone was sold at Rs 21,000 with a 5% profit. Find its Cost Price.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('विक्रय मूल्य (SP): ', 'Selling Price (SP): ')} रु {givenSp.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={5000}
                  max={50000}
                  step={1000}
                  value={givenSp}
                  onChange={(e) => {
                    kit.tap();
                    setGivenSp(parseInt(e.target.value));
                  }}
                  style={{ width: 180 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('नाफा प्रतिशत: ', 'Profit %: ')} {givenProfitPct}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={givenProfitPct}
                  onChange={(e) => {
                    kit.tap();
                    setGivenProfitPct(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Step-by-Step Card */}
            <div
              style={{
                background: '#EEF2FF',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #C7D2FE',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('१. धारणा:', '1. Concept:')}</strong> मानौँ CP = १००%। नाफा {givenProfitPct}% भएपछि SP ={' '}
                {100 + givenProfitPct}% हुन्छ।
              </div>
              <div>
                <strong>{L('२. सम्बन्ध:', '2. Relation:')}</strong> {100 + givenProfitPct}% of CP = रु{' '}
                {givenSp.toLocaleString()}
              </div>
              <div>
                <strong>{L('३. सूत्र:', '3. Formula:')}</strong> CP = (SP × १००) / (१०० + P%)
              </div>
              <div>
                CP = ({givenSp.toLocaleString()} × १००) / {100 + givenProfitPct}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#3730A3',
                }}
              >
                {L('क्रय मूल्य (CP) = ', 'Cost Price (CP) = ')} रु {Math.round(calculatedCp).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Target Profit Strategy */}
        {activeTab === 'target-profit' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('नयाँ नाफा प्रतिशतका लागि नयाँ विक्रय मूल्य (Target Profit SP)', 'Target Profit Strategy')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: रु २०,००० मा किनेको मोबाइललाई १०% नाफा कमाउन कति मूल्यमा बेच्नुपर्छ?',
                'Textbook Example: At what price should a mobile bought for Rs 20,000 be sold to earn 10% profit?'
              )}
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('क्रय मूल्य (CP): ', 'Cost Price (CP): ')} रु {targetCp.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={10000}
                  max={50000}
                  step={2000}
                  value={targetCp}
                  onChange={(e) => {
                    kit.tap();
                    setTargetCp(parseInt(e.target.value));
                  }}
                  style={{ width: 180 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('इच्छित नाफा प्रतिशत (Target Profit %): ', 'Target Profit %: ')} {desiredProfitPct}%
                </label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={5}
                  value={desiredProfitPct}
                  onChange={(e) => {
                    kit.tap();
                    setDesiredProfitPct(parseInt(e.target.value));
                  }}
                  style={{ width: 160 }}
                />
              </div>
            </div>

            <div
              style={{
                background: '#ECFDF5',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #6EE7B7',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('नाफा रकम (Profit Amount):', 'Profit Amount:')}</strong> {desiredProfitPct}% of रु{' '}
                {targetCp.toLocaleString()} = रु {targetProfitAmt.toLocaleString()}
              </div>
              <div>
                <strong>{L('नयाँ विक्रय मूल्य (New SP):', 'New Selling Price (SP):')}</strong> रु{' '}
                {targetCp.toLocaleString()} + रु {targetProfitAmt.toLocaleString()}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#065F46',
                }}
              >
                {L('बेच्नुपर्ने मूल्य: ', 'Required Selling Price: ')} रु {targetSp.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default CostPriceSellingPriceStudio;
