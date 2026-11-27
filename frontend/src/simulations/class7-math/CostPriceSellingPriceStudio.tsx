/**
 * CostPriceSellingPriceStudio.tsx
 * Grade 7 Mathematics – Lesson 7: PROFIT AND LOSS
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
    np: 'एउटा हिटर Rs 2,500 मा किनेर 10% नाफामा बेच्दा विक्रय मूल्य (SP) कति हुन्छ?',
    en: 'A heater is bought for Rs 2,500 and sold at 10% profit. What is the Selling Price (SP)?',
    options: [
      { key: 'A', label: 'Rs 2,750' },
      { key: 'B', label: 'Rs 2,600' },
      { key: 'C', label: 'Rs 3,000' },
      { key: 'D', label: 'Rs 2,250' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा मोबाइल 5% नाफा खाएर Rs 21,000 मा बेच्दा त्यसको क्रय मूल्य (CP) कति थियो?',
    en: 'A mobile was sold for Rs 21,000 at a profit of 5%. What was its Cost Price (CP)?',
    options: [
      { key: 'A', label: 'Rs 20,000 [ (21000 × 100) / 105 = Rs 20,000 ]' },
      { key: 'B', label: 'Rs 19,950' },
      { key: 'C', label: 'Rs 19,000' },
      { key: 'D', label: 'Rs 22,050' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि क्रय मूल्य Rs 20,000 भएको सामानमा 10% नाफा कमाउन नयाँ विक्रय मूल्य कति हुनुपर्छ?',
    en: 'To make 10% profit on an item with Cost Price Rs 20,000, what must the new Selling Price be?',
    options: [
      { key: 'A', label: 'Rs 22,000' },
      { key: 'B', label: 'Rs 21,000' },
      { key: 'C', label: 'Rs 24,000' },
      { key: 'D', label: 'Rs 20,500' },
    ],
    answer: 'A',
  },
  {
    np: '5% नोक्सान हुँदा क्रय मूल्य (CP) बाट विक्रय मूल्य (SP) निकाल्ने सुत्र कुन हो?',
    en: 'Which is the formula to find Selling Price (SP) when there is a 5% loss?',
    options: [
      { key: 'A', label: 'SP = CP - (5% × CP) or CP × (95/100)' },
      { key: 'B', label: 'SP = CP + (5% × CP)' },
      { key: 'C', label: 'SP = CP / 5' },
      { key: 'D', label: 'SP = CP × 105/100' },
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
        'क्रय मूल्य (CP) 100% हुन्छ! 10% नाफा हुँदा विक्रय मूल्य 110% र 5% नोक्सान हुँदा 95% .',
        'Cost Price (CP) is 100%! At 10% profit, SP is 110%; at 5% loss, SP is 95%.'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'find-sp', np: '1. CP र नाफा% बाट SP पत्ता लगाउने', en: '1. Find SP (from CP & P%)' },
            { id: 'find-cp', np: '2. SP र नाफा% बाट CP पत्ता लगाउने', en: '2. Find CP (from SP & P%)' },
            { id: 'target-profit', np: '3. नयाँ नाफा% को लागि नयाँ SP', en: '3. Target Profit Strategy' },
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
                'पाठ्यपुस्तक उदाहरण: एउटा हिटर Rs 2,500 मा किनेर 10% नाफा लिएर बेच्दा विक्रय मूल्य कति हुन्छ?',
                'Textbook Example: A heater bought for Rs 2,500 is sold at 10% profit. Find the selling price.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('क्रय मूल्य (CP): ', 'Cost Price (CP): ')} Rs {givenCp.toLocaleString()}
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
                <strong>{L('1. नाफा रकम (Profit in Rs):', '1. Profit in Rs:')}</strong> of CP {profitPercent}% = (
                {profitPercent} / 100) × Rs {givenCp.toLocaleString()} ={' '}
                <span style={{ fontWeight: 800, color: '#059669' }}>Rs {profitRupees.toLocaleString()}</span>
              </div>
              <div>
                <strong>{L('2. विक्रय मूल्य (SP):', '2. Selling Price (SP):')}</strong> CP + profit amount = Rs{' '}
                {givenCp.toLocaleString()} + Rs {profitRupees.toLocaleString()}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                {L('विक्रय मूल्य (SP) = ', 'Selling Price (SP) = ')} Rs {calculatedSp.toLocaleString()}
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
                'पाठ्यपुस्तक उदाहरण: एउटा मोबाइल फोन 5% नाफा खाएर Rs 21,000 मा बेच्दा त्यसको क्रय मूल्य कति थियो?',
                'Textbook Example: A mobile phone was sold at Rs 21,000 with a 5% profit. Find its Cost Price.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('विक्रय मूल्य (SP): ', 'Selling Price (SP): ')} Rs {givenSp.toLocaleString()}
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
                <strong>{L('1. धारणा:', '1. Concept:')}</strong> Let CP = 100%. Profit {givenProfitPct}% gives SP ={' '}
                {100 + givenProfitPct}% .
              </div>
              <div>
                <strong>{L('2. सम्बन्ध:', '2. Relation:')}</strong> {100 + givenProfitPct}% of CP = Rs{' '}
                {givenSp.toLocaleString()}
              </div>
              <div>
                <strong>{L('3. सूत्र:', '3. Formula:')}</strong> CP = (SP × 100) / (100 + P%)
              </div>
              <div>
                CP = ({givenSp.toLocaleString()} × 100) / {100 + givenProfitPct}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#3730A3',
                }}
              >
                {L('क्रय मूल्य (CP) = ', 'Cost Price (CP) = ')} Rs {Math.round(calculatedCp).toLocaleString()}
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
                'पाठ्यपुस्तक उदाहरण: Rs 20,000 मा किनेको मोबाइललाई 10% नाफा कमाउन कति मूल्यमा बेच्नुपर्छ?',
                'Textbook Example: At what price should a mobile bought for Rs 20,000 be sold to earn 10% profit?'
              )}
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('क्रय मूल्य (CP): ', 'Cost Price (CP): ')} Rs {targetCp.toLocaleString()}
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
                <strong>{L('नाफा रकम (Profit Amount):', 'Profit Amount:')}</strong> {desiredProfitPct}% of Rs{' '}
                {targetCp.toLocaleString()} = Rs {targetProfitAmt.toLocaleString()}
              </div>
              <div>
                <strong>{L('नयाँ विक्रय मूल्य (New SP):', 'New Selling Price (SP):')}</strong> Rs{' '}
                {targetCp.toLocaleString()} + Rs {targetProfitAmt.toLocaleString()}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#065F46',
                }}
              >
                {L('बेच्नुपर्ने मूल्य: ', 'Required Selling Price: ')} Rs {targetSp.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default CostPriceSellingPriceStudio;
