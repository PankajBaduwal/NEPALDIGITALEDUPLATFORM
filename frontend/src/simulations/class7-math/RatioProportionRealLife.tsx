/**
 * RatioProportionRealLife.tsx
 * Grade 7 Mathematics – Lesson 6: RATIO AND PROPORTION (अनुपात र समानुपात)
 * Simulation 3: Ratio & Proportion in Real Life (2D + Interactive Practical Activities)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 89-97)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Users, DollarSign, Award, ShoppingBag, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एउटा विद्यालयमा जम्मा ४५० विद्यार्थीमध्ये १८० जना छात्राहरू छन् भने छात्र र छात्राको सङ्ख्याको अनुपात कति हुन्छ?',
    en: 'In a school of 450 students, 180 are girls. What is the ratio of boys to girls?',
    options: [
      { key: 'A', label: '३ : २ (छात्र = २७०, छात्रा = १८० => २७०:१८० = ३:२)' },
      { key: 'B', label: '२ : ३' },
      { key: 'C', label: '२ : ५' },
      { key: 'D', label: '३ : ५' },
    ],
    answer: 'A',
  },
  {
    np: 'रु ५४,००० लाई ५ : ४ को अनुपातमा दुई व्यक्तिलाई बाँड्दा पहिलो व्यक्तिले कति पाउँछ?',
    en: 'When dividing Rs 54,000 between two persons in ratio 5 : 4, how much does the first person get?',
    options: [
      { key: 'A', label: 'रु ३०,००० (५/९ × ५४००० = ३०,०००)' },
      { key: 'B', label: 'रु २४,०००' },
      { key: 'C', label: 'रु २०,०००' },
      { key: 'D', label: 'रु २५,०००' },
    ],
    answer: 'A',
  },
  {
    np: 'प्रमेशको उचाइ १६५ सेमी र प्रमिलाको उचाइ १५० सेमी छ भने उनीहरूको उचाइको अनुपात कति हुन्छ?',
    en: "Pramesh's height is 165 cm and Pramila's height is 150 cm. What is the ratio of their heights?",
    options: [
      { key: 'A', label: '११ : १० (१६५/१५० लाई १५ ले भाग गर्दा)' },
      { key: 'B', label: '१० : ११' },
      { key: 'C', label: '५ : ६' },
      { key: 'D', label: '३३ : ३०' },
    ],
    answer: 'A',
  },
  {
    np: '६ केजी सुन्तलाको मूल्य रु ५४० पर्छ भने सोही दरमा ८ केजी सुन्तलाको मूल्य कति पर्छ?',
    en: 'If 6 kg oranges cost Rs 540, what is the cost of 8 kg oranges at the same rate?',
    options: [
      { key: 'A', label: 'रु ७२० (६/५४० = ८/x => x = ७२०)' },
      { key: 'B', label: 'रु ६००' },
      { key: 'C', label: 'रु ६४०' },
      { key: 'D', label: 'रु ८००' },
    ],
    answer: 'A',
  },
];

export const RatioProportionRealLife: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L6-03',
    titleEn: 'Ratio & Proportion in Real Life',
    titleNp: 'अनुपात र समानुपातको व्यवहारिक प्रयोग',
    chapter: 6,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'school' | 'heights' | 'divide' | 'orange'>('school');

  // Tab 1: School Population
  const [totalStudents, setTotalStudents] = useState<number>(450);
  const [girlsCount, setGirlsCount] = useState<number>(180);
  const boysCount = Math.max(0, totalStudents - girlsCount);

  // Tab 2: Height comparison
  const [prameshH, setPrameshH] = useState<number>(165);
  const [pramilaH, setPramilaH] = useState<number>(150);

  // Tab 3: Divide Money
  const [totalMoney, setTotalMoney] = useState<number>(54000);
  const [ratioPart1, setRatioPart1] = useState<number>(5);
  const [ratioPart2, setRatioPart2] = useState<number>(4);
  const totalParts = ratioPart1 + ratioPart2;
  const share1 = (totalMoney * ratioPart1) / totalParts;
  const share2 = (totalMoney * ratioPart2) / totalParts;

  // Tab 4: Orange price proportion
  const [orangeKg1, setOrangeKg1] = useState<number>(6);
  const [orangeCost1, setOrangeCost1] = useState<number>(540);
  const [orangeKg2, setOrangeKg2] = useState<number>(8);
  const orangeCost2 = (orangeCost1 * orangeKg2) / orangeKg1;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'दैनिक जीवनमा विद्यालय जनसंख्या, उचाइ, रकम बाँडफाँड र बजार मूल्यमा समानुपातको प्रयोग गरिन्छ!',
        'Real-world uses: school populations, heights, dividing money, and proportional market pricing!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'school', np: '१. विद्यालय जनसंख्या (School Population)', en: '1. School Population' },
            { id: 'heights', np: '२. उचाइ तुलना (Height Comparison)', en: '2. Height Comparison' },
            { id: 'divide', np: '३. रकम बाँडफाँड (Divide Money in Ratio)', en: '3. Divide Money' },
            { id: 'orange', np: '४. सुन्तलाको बजार भाउ (Orange Proportion)', en: '4. Price Proportion' },
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

        {/* TAB 1: School Population */}
        {activeTab === 'school' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('विद्यालयका छात्र र छात्राको सङ्ख्याको अनुपात', 'Ratio of Boys and Girls in School')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ ८९ अनुसार: एउटा विद्यालयमा जम्मा ४५० विद्यार्थी छन्, जसमध्ये १८० जना छात्राहरू छन्।',
                'From Textbook Page 89: In a school with 450 total students, 180 are girls.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block' }}>
                  {L('जम्मा विद्यार्थी (Total Students): ', 'Total Students: ')} {isNe ? toNp(totalStudents) : totalStudents}
                </label>
                <input
                  type="range"
                  min={200}
                  max={600}
                  step={50}
                  value={totalStudents}
                  onChange={(e) => {
                    kit.tap();
                    const newTot = parseInt(e.target.value);
                    setTotalStudents(newTot);
                    if (girlsCount > newTot) setGirlsCount(Math.floor(newTot / 2));
                  }}
                  style={{ width: 180 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#DB2777', display: 'block' }}>
                  {L('छात्रा सङ्ख्या (Girls): ', 'Girls: ')} {isNe ? toNp(girlsCount) : girlsCount}
                </label>
                <input
                  type="range"
                  min={50}
                  max={totalStudents - 50}
                  step={10}
                  value={girlsCount}
                  onChange={(e) => {
                    kit.tap();
                    setGirlsCount(parseInt(e.target.value));
                  }}
                  style={{ width: 180 }}
                />
              </div>
            </div>

            {/* Visual Bar of Boys vs Girls */}
            <div style={{ margin: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                <span style={{ color: '#DB2777' }}>
                  {L('छात्रा (Girls): ', 'Girls: ')} {girlsCount} (
                  {Math.round((girlsCount / totalStudents) * 100)}%)
                </span>
                <span style={{ color: '#2563EB' }}>
                  {L('छात्र (Boys): ', 'Boys: ')} {boysCount} ({Math.round((boysCount / totalStudents) * 100)}%)
                </span>
              </div>
              <div style={{ height: 28, display: 'flex', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ width: `${(girlsCount / totalStudents) * 100}%`, background: '#F472B6' }} />
                <div style={{ width: `${(boysCount / totalStudents) * 100}%`, background: '#60A5FA' }} />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                marginTop: 16,
              }}
            >
              <div style={{ background: '#FDF2F8', padding: 14, borderRadius: 8, border: '1px solid #FBCFE8' }}>
                <div style={{ fontWeight: 700, color: '#9D174D', fontSize: 13 }}>
                  {L('छात्रा र छात्रको अनुपात (Girls : Boys)', 'Girls : Boys')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#BE185D', marginTop: 4 }}>
                  {girlsCount} : {boysCount} = {girlsCount / 90} : {boysCount / 90}
                </div>
                <div style={{ fontSize: 12, color: '#831843', marginTop: 2 }}>
                  {L(`९० ले भाग गर्दा सरल रूप प्राप्त हुन्छ`, `Dividing by common factor gives simplest form`)}
                </div>
              </div>

              <div style={{ background: '#EFF6FF', padding: 14, borderRadius: 8, border: '1px solid #BFDBFE' }}>
                <div style={{ fontWeight: 700, color: '#1E40AF', fontSize: 13 }}>
                  {L('छात्र र छात्राको अनुपात (Boys : Girls)', 'Boys : Girls')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>
                  {boysCount} : {girlsCount} = {boysCount / 90} : {girlsCount / 90}
                </div>
                <div style={{ fontSize: 12, color: '#1E3A8A', marginTop: 2 }}>
                  {L(`क्रम बदल्दा अनुपात पनि उल्टिन्छ`, `Changing order reverses the ratio terms`)}
                </div>
              </div>

              <div style={{ background: '#ECFDF5', padding: 14, borderRadius: 8, border: '1px solid #A7F3D0' }}>
                <div style={{ fontWeight: 700, color: '#065F46', fontSize: 13 }}>
                  {L('छात्रा र जम्मा विद्यार्थीको अनुपात', 'Girls : Total Students')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                  {girlsCount} : {totalStudents} = 2 : 5
                </div>
                <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
                  {L(`५ जनामा २ जना छात्रा रहेछन्`, `2 out of every 5 students are girls`)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Height comparison */}
        {activeTab === 'heights' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('उचाइको तुलना (Pramesh vs Pramila Height)', 'Height Comparison')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ ८९ अनुसार: प्रमेशको उचाइ १६५ सेमी र प्रमिलाको उचाइ १५० सेमी छ। उचाइको अनुपात पत्ता लगाऔँ।',
                "From Textbook Page 89: Pramesh's height is 165 cm and Pramila's height is 150 cm."
              )}
            </p>

            <div style={{ display: 'flex', gap: 24, margin: '20px 0', alignItems: 'flex-end' }}>
              {/* Pramesh bar */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 70,
                    height: prameshH * 1.2,
                    background: 'linear-gradient(180deg, #3B82F6, #1D4ED8)',
                    borderRadius: '8px 8px 0 0',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: 8,
                    color: '#FFF',
                    fontWeight: 800,
                  }}
                >
                  {prameshH} cm
                </div>
                <div style={{ fontWeight: 700, color: '#1E40AF', marginTop: 8 }}>
                  {L('प्रमेश (Pramesh)', 'Pramesh')}
                </div>
              </div>

              {/* Pramila bar */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 70,
                    height: pramilaH * 1.2,
                    background: 'linear-gradient(180deg, #EC4899, #BE185D)',
                    borderRadius: '8px 8px 0 0',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: 8,
                    color: '#FFF',
                    fontWeight: 800,
                  }}
                >
                  {pramilaH} cm
                </div>
                <div style={{ fontWeight: 700, color: '#9D174D', marginTop: 8 }}>
                  {L('प्रमिला (Pramila)', 'Pramila')}
                </div>
              </div>

              {/* Step by step card */}
              <div
                style={{
                  flex: 1,
                  background: '#F8FAFC',
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  lineHeight: 1.8,
                }}
              >
                <div>
                  <strong>{L('अनुपात:', 'Ratio:')}</strong> १६५ सेमी : १५० सेमी = १६५ / १५०
                </div>
                <div>
                  <strong>{L('म.स. (HCF) निकाल्दा:', 'Finding HCF:')}</strong> HCF(165, 150) = १५
                </div>
                <div>
                  <strong>{L('१५ ले भाग गर्दा:', 'Dividing by 15:')}</strong> (१६५ ÷ १५) / (१५० ÷ १५) = ११ / १०
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#187C68',
                  }}
                >
                  {L('उचाइको अनुपात:', "Heights' Ratio:")} ११ : १० (11 : 10)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Divide Money */}
        {activeTab === 'divide' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('दिइएको अनुपातमा रकम बाँडफाँड गर्ने', 'Dividing Amount in Given Ratio')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ ९५ अनुसार: रु ५४,००० लाई ५ : ४ को अनुपातमा दुई व्यक्ति A र B बीच बाँडफाँड गर्नुहोस्।',
                'From Textbook Page 95: Divide Rs 54,000 between persons A and B in the ratio 5 : 4.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block' }}>
                  {L('बाँड्नुपर्ने जम्मा रकम (Total Money): ', 'Total Money: ')} रु {totalMoney.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={18000}
                  max={90000}
                  step={9000}
                  value={totalMoney}
                  onChange={(e) => {
                    kit.tap();
                    setTotalMoney(parseInt(e.target.value));
                  }}
                  style={{ width: 180 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0369A1', display: 'block' }}>
                  {L('व्यक्ति A को अनुपात भाग: ', "Person A's Share: ")} {ratioPart1}
                </label>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={ratioPart1}
                  onChange={(e) => {
                    kit.tap();
                    setRatioPart1(parseInt(e.target.value));
                  }}
                  style={{ width: 120 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#15803D', display: 'block' }}>
                  {L('व्यक्ति B को अनुपात भाग: ', "Person B's Share: ")} {ratioPart2}
                </label>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={ratioPart2}
                  onChange={(e) => {
                    kit.tap();
                    setRatioPart2(parseInt(e.target.value));
                  }}
                  style={{ width: 120 }}
                />
              </div>
            </div>

            {/* Step-by-Step Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
              }}
            >
              <div style={{ background: '#F0FDF4', padding: 16, borderRadius: 10, border: '1px solid #BBF7D0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
                  {L('चरणबद्ध बाँडफाँड सुत्र', 'Formula & Steps')}
                </span>
                <div style={{ fontSize: 14, lineHeight: 1.8, marginTop: 8, color: '#14532D' }}>
                  <div>
                    <strong>{L('अनुपातका पदहरूको जोड:', 'Sum of Ratio Terms:')}</strong> {ratioPart1} + {ratioPart2} ={' '}
                    <span style={{ fontWeight: 800 }}>{totalParts} भाग (parts)</span>
                  </div>
                  <div>
                    <strong>{L('१ भागको मान:', 'Value of 1 part:')}</strong> रु {totalMoney.toLocaleString()} ÷{' '}
                    {totalParts} = रु {(totalMoney / totalParts).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ background: '#EFF6FF', padding: 16, borderRadius: 10, border: '1px solid #BFDBFE' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>
                  {L('व्यक्ति A ले पाउने रकम', "Person A's Share")}
                </span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>
                  रु {Math.round(share1).toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: '#1E3A8A', marginTop: 2 }}>
                  ({ratioPart1}/{totalParts} × रु {totalMoney.toLocaleString()})
                </div>
              </div>

              <div style={{ background: '#FAF5FF', padding: 16, borderRadius: 10, border: '1px solid #E9D5FF' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6B21A8' }}>
                  {L('व्यक्ति B ले पाउने रकम', "Person B's Share")}
                </span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#9333EA', marginTop: 4 }}>
                  रु {Math.round(share2).toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: '#581C87', marginTop: 2 }}>
                  ({ratioPart2}/{totalParts} × रु {totalMoney.toLocaleString()})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Orange price proportion */}
        {activeTab === 'orange' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('सुन्तलाको मूल्य समानुपात (Orange Price Proportion)', 'Orange Price Proportion')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ ९५ अनुसार: ६ केजी सुन्तलाको मूल्य रु ५४० पर्छ भने सोही दरमा ८ केजी सुन्तलाको मूल्य कति पर्छ?',
                'From Textbook Page 95: If 6 kg of oranges cost Rs 540, what is the cost of 8 kg at the same rate?'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#C2410C', display: 'block' }}>
                  {L('पहिलो तौल (First Weight): ', 'First Weight: ')} {orangeKg1} kg
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={orangeKg1}
                  onChange={(e) => {
                    kit.tap();
                    setOrangeKg1(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#15803D', display: 'block' }}>
                  {L('पहिलो मूल्य (First Cost): ', 'First Cost: ')} रु {orangeCost1}
                </label>
                <input
                  type="range"
                  min={180}
                  max={900}
                  step={90}
                  value={orangeCost1}
                  onChange={(e) => {
                    kit.tap();
                    setOrangeCost1(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4338CA', display: 'block' }}>
                  {L('नयाँ तौल (Target Weight): ', 'Target Weight: ')} {orangeKg2} kg
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={orangeKg2}
                  onChange={(e) => {
                    kit.tap();
                    setOrangeKg2(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Proportion Calculation Card */}
            <div
              style={{
                background: '#FFF7ED',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #FFEDD5',
                lineHeight: 1.8,
              }}
            >
              <div>
                <strong>{L('समानुपातको तालिका:', 'Proportion Table:')}</strong>
                <div style={{ marginTop: 6, display: 'inline-flex', border: '1px solid #F97316', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ padding: '6px 12px', background: '#FFEDD5', fontWeight: 700, color: '#9A3412' }}>
                    {L('तौल (केजी):', 'Weight (kg):')} {orangeKg1} : {orangeKg2}
                  </div>
                  <div style={{ padding: '6px 12px', background: '#FFF', fontWeight: 700, color: '#EA580C' }}>
                    {L('मूल्य (रु):', 'Cost (Rs):')} {orangeCost1} : x
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <strong>{L('समानुपात सूत्र अनुसार:', 'According to Proportion:')}</strong>
                <br />
                {orangeKg1} / {orangeKg2} = {orangeCost1} / x
              </div>
              <div>
                {orangeKg1} × x = {orangeKg2} × {orangeCost1}
              </div>
              <div>
                x = ({orangeKg2} × {orangeCost1}) ÷ {orangeKg1} = {orangeKg2 * orangeCost1} ÷ {orangeKg1}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#C2410C',
                }}
              >
                {orangeKg2} kg {L('सुन्तलाको मूल्य:', 'Oranges Cost:')} रु {Math.round(orangeCost2).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default RatioProportionRealLife;
