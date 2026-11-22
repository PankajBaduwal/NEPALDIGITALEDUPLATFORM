/**
 * RatioDiscoveryWorld.tsx
 * Grade 7 Mathematics – Lesson 6: RATIO AND PROPORTION (अनुपात र समानुपात)
 * Simulation 1: Ratio Discovery and Comparison World (2D + Selective 3D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 87-92)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Scale, Check, RefreshCw, ArrowRight, Sparkles, Layers, PieChart } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एउटा झोलामा ४ रातो र ६ निलो बल छन् भने रातो र निलो बलको अनुपात (सरल रूपमा) कति हुन्छ?',
    en: 'In a bag there are 4 red and 6 blue balls. What is the ratio of red to blue balls in simplest form?',
    options: [
      { key: 'A', label: '२ : ३ (2 : 3)' },
      { key: 'B', label: '३ : २ (3 : 2)' },
      { key: 'C', label: '४ : १० (4 : 10)' },
      { key: 'D', label: '१ : २ (1 : 2)' },
    ],
    answer: 'A',
  },
  {
    np: '१८ सेमी र ६ मिमी को अनुपात निकाल्दा पहिले के गर्नुपर्छ?',
    en: 'What must be done first when finding the ratio of 18 cm and 6 mm?',
    options: [
      { key: 'A', label: 'दुवैलाई एउटै एकाइ (मिमी) मा बदल्ने (१८ सेमी = १८० मिमी)' },
      { key: 'B', label: 'सिधै १८ : ६ लेख्ने' },
      { key: 'C', label: 'दुवैलाई जोड्ने' },
      { key: 'D', label: '६ लाई १८ ले भाग गर्ने' },
    ],
    answer: 'A',
  },
  {
    np: '२४ : ३६ को सरल रूप (Simplest form) कुन हो?',
    en: 'What is the simplest form of 24 : 36?',
    options: [
      { key: 'A', label: '२ : ३ (HCF = १२ ले भाग गर्दा)' },
      { key: 'B', label: '४ : ६' },
      { key: 'C', label: '१२ : १८' },
      { key: 'D', label: '१ : ३' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा वृत्तलाई ५ बराबर भागमा बाँडी ३ भाग रङ्ग्याइएको छ भने रङ्ग्याइएको र नरङ्ग्याइएको भागको अनुपात कति हुन्छ?',
    en: 'A circle is divided into 5 equal parts with 3 parts shaded. What is the ratio of shaded to unshaded parts?',
    options: [
      { key: 'A', label: '३ : २' },
      { key: 'B', label: '३ : ५' },
      { key: 'C', label: '२ : ५' },
      { key: 'D', label: '५ : ३' },
    ],
    answer: 'A',
  },
];

export const RatioDiscoveryWorld: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L6-01',
    titleEn: 'Ratio Discovery and Comparison World',
    titleNp: 'अनुपात खोजी र तुलना संसार',
    chapter: 6,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'visual' | 'simplest' | 'units' | 'fraction'>('visual');

  // Tab 1: Red vs Blue balls
  const [redBalls, setRedBalls] = useState<number>(4);
  const [blueBalls, setBlueBalls] = useState<number>(6);

  // Greatest common divisor helper
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const ballGcd = gcd(redBalls, blueBalls) || 1;
  const simpRed = redBalls / ballGcd;
  const simpBlue = blueBalls / ballGcd;

  // Tab 2: Simplest Form Explorer
  const [termA, setTermA] = useState<number>(18);
  const [termB, setTermB] = useState<number>(30);
  const currentGcd = gcd(termA, termB) || 1;

  // Tab 3: Same Unit Conversion Explorer
  const [selectedUnitScenario, setSelectedUnitScenario] = useState<number>(0);
  const UNIT_SCENARIOS = [
    {
      labelNp: '१८ सेमी र ६ मिमी',
      labelEn: '18 cm and 6 mm',
      val1: 18,
      unit1: 'cm',
      val2: 6,
      unit2: 'mm',
      convertedVal1: 180,
      convertedUnit1: 'mm',
      stepTextNp: '१ सेमी = १० मिमी हुन्छ। त्यसैले १८ सेमी = १८ × १० = १८० मिमी।',
      stepTextEn: '1 cm = 10 mm. Therefore 18 cm = 18 × 10 = 180 mm.',
      ratioAns: '180 : 6 = 30 : 1',
    },
    {
      labelNp: '२ केजी र ५०० ग्राम',
      labelEn: '2 kg and 500 g',
      val1: 2,
      unit1: 'kg',
      val2: 500,
      unit2: 'g',
      convertedVal1: 2000,
      convertedUnit1: 'g',
      stepTextNp: '१ केजी = १००० ग्राम हुन्छ। त्यसैले २ केजी = २ × १००० = २००० ग्राम।',
      stepTextEn: '1 kg = 1000 g. Therefore 2 kg = 2 × 1000 = 2000 g.',
      ratioAns: '2000 : 500 = 4 : 1',
    },
    {
      labelNp: '३ लिटर र ७५० मिलिलिटर',
      labelEn: '3 L and 750 mL',
      val1: 3,
      unit1: 'L',
      val2: 750,
      unit2: 'mL',
      convertedVal1: 3000,
      convertedUnit1: 'mL',
      stepTextNp: '१ लिटर = १००० मिलिलिटर हुन्छ। त्यसैले ३ लिटर = ३ × १००० = ३००० मिलिलिटर।',
      stepTextEn: '1 L = 1000 mL. Therefore 3 L = 3 × 1000 = 3000 mL.',
      ratioAns: '3000 : 750 = 4 : 1',
    },
    {
      labelNp: 'रु ५ र ५० पैसा',
      labelEn: 'Rs 5 and 50 Paisa',
      val1: 5,
      unit1: 'Rs',
      val2: 50,
      unit2: 'paisa',
      convertedVal1: 500,
      convertedUnit1: 'paisa',
      stepTextNp: 'रु १ = १०० पैसा हुन्छ। त्यसैले रु ५ = ५ × १०० = ५०० पैसा।',
      stepTextEn: 'Rs 1 = 100 paisa. Therefore Rs 5 = 5 × 100 = 500 paisa.',
      ratioAns: '500 : 50 = 10 : 1',
    },
  ];

  // Tab 4: Ratio vs Fraction
  const [totalParts, setTotalParts] = useState<number>(5);
  const [shadedParts, setShadedParts] = useState<number>(3);
  const unshadedParts = Math.max(0, totalParts - shadedParts);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'अनुपातले दुई सजातीय परिमाणहरूको भागद्वारा तुलना गर्छ। सरल रूप निकाल्न म.स. ले भाग गर्नुहोस्!',
        'Ratio compares two like quantities by division. Divide by HCF to get the simplest form!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'visual', np: '१. अनुपात खोजी (बलहरूको तुलना)', en: '1. Discover Ratio (Balls)' },
            { id: 'simplest', np: '२. सरल रूप (Simplest Form & HCF)', en: '2. Simplest Form & HCF' },
            { id: 'units', np: '३. समान एकाइ रूपान्तरण', en: '3. Same Unit Challenge' },
            { id: 'fraction', np: '४. भिन्न र अनुपात सम्बन्ध', en: '4. Ratio vs Fraction' },
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

        {/* TAB 1: Ratio of Balls */}
        {activeTab === 'visual' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('रातो र निलो बलहरूको अनुपात', 'Ratio of Red and Blue Balls')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'दुई सजातीय परिमाणहरूको भागद्वारा तुलना गर्नु नै अनुपात (Ratio) हो। अनुपातमा क्रम (Order) ले ठूलो महत्त्व राख्छ।',
                'Ratio is a comparison of two like quantities by division. The order of terms is crucial in a ratio.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', margin: '16px 0' }}>
              <div>
                <label style={{ fontWeight: 600, color: '#DC2626', display: 'block', marginBottom: 4 }}>
                  {L('रातो बलहरू (Red Balls): ', 'Red Balls: ')} {isNe ? toNp(redBalls) : redBalls}
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={redBalls}
                  onChange={(e) => {
                    kit.tap();
                    setRedBalls(parseInt(e.target.value));
                  }}
                  style={{ width: 160 }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, color: '#2563EB', display: 'block', marginBottom: 4 }}>
                  {L('निलो बलहरू (Blue Balls): ', 'Blue Balls: ')} {isNe ? toNp(blueBalls) : blueBalls}
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={blueBalls}
                  onChange={(e) => {
                    kit.tap();
                    setBlueBalls(parseInt(e.target.value));
                  }}
                  style={{ width: 160 }}
                />
              </div>

              <button
                onClick={() => {
                  kit.tap();
                  setRedBalls(4);
                  setBlueBalls(6);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                <RefreshCw size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {L('पुनः सेट (Reset)', 'Reset')}
              </button>
            </div>

            {/* Visual Balls Display */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                padding: 16,
                background: '#F1F5F9',
                borderRadius: 10,
              }}
            >
              {/* Red Balls */}
              <div style={{ background: '#FFF', padding: 12, borderRadius: 8, border: '2px solid #FCA5A5' }}>
                <span style={{ fontWeight: 700, color: '#DC2626' }}>
                  {L('रातो बलहरू', 'Red Balls')} ({isNe ? toNp(redBalls) : redBalls})
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {Array.from({ length: redBalls }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 30% 30%, #F87171, #DC2626)',
                        boxShadow: '0 2px 5px rgba(220,38,38,0.4)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Blue Balls */}
              <div style={{ background: '#FFF', padding: 12, borderRadius: 8, border: '2px solid #93C5FD' }}>
                <span style={{ fontWeight: 700, color: '#2563EB' }}>
                  {L('निलो बलहरू', 'Blue Balls')} ({isNe ? toNp(blueBalls) : blueBalls})
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {Array.from({ length: blueBalls }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 30% 30%, #60A5FA, #2563EB)',
                        boxShadow: '0 2px 5px rgba(37,99,235,0.4)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mathematical Ratio Box */}
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: '#ECFDF5',
                borderRadius: 10,
                border: '1px solid #A7F3D0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>
                  {L('रातो बल : निलो बल (Red : Blue)', 'Red : Blue')}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                  {isNe ? toNp(redBalls) : redBalls} : {isNe ? toNp(blueBalls) : blueBalls}
                  {ballGcd > 1 && (
                    <span style={{ fontSize: 16, color: '#059669', marginLeft: 8 }}>
                      = {isNe ? toNp(simpRed) : simpRed} : {isNe ? toNp(simpBlue) : simpBlue}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#047857', marginTop: 4 }}>
                  {L(`भिन्न रूप: ${redBalls}/${blueBalls}`, `Fraction form: ${redBalls}/${blueBalls}`)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>
                  {L('निलो बल : रातो बल (Blue : Red) [क्रम उल्टो गर्दा]', 'Blue : Red [Reversing Order]')}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>
                  {isNe ? toNp(blueBalls) : blueBalls} : {isNe ? toNp(redBalls) : redBalls}
                  {ballGcd > 1 && (
                    <span style={{ fontSize: 16, color: '#2563EB', marginLeft: 8 }}>
                      = {isNe ? toNp(simpBlue) : simpBlue} : {isNe ? toNp(simpRed) : simpRed}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#1E40AF', marginTop: 4 }}>
                  {L(`भिन्न रूप: ${blueBalls}/${redBalls}`, `Fraction form: ${blueBalls}/${redBalls}`)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>
                  {L('रातो बल : जम्मा बल (Red : Total)', 'Red : Total')}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#B45309', marginTop: 4 }}>
                  {isNe ? toNp(redBalls) : redBalls} : {isNe ? toNp(redBalls + blueBalls) : redBalls + blueBalls}
                </div>
                <div style={{ fontSize: 12, color: '#78350F', marginTop: 4 }}>
                  {L(
                    `HCF = ${ballGcd} ले भाग गर्दा सरल रूप प्राप्त हुन्छ`,
                    `Dividing by HCF = ${ballGcd} gives simplest form`
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Simplest Form Explorer */}
        {activeTab === 'simplest' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('अनुपातको सरल रूप (Simplest Form of Ratio)', 'Simplest Form of Ratio')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'अनुपातका दुवै पदहरू (पूर्वपद र उत्तरपद) लाई तिनीहरूको महत्तम समापवर्तक (HCF) ले भाग गर्दा अनुपात सरल रूपमा परिणत हुन्छ।',
                'Dividing both terms (antecedent and consequent) by their HCF converts the ratio into simplest form.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '16px 0' }}>
              {[
                { a: 18, b: 30, label: '१८ : ३० (पाठ्यपुस्तक उदाहरण)' },
                { a: 24, b: 36, label: '२४ : ३६' },
                { a: 15, b: 45, label: '१५ : ४५' },
                { a: 14, b: 21, label: '१४ : २१' },
                { a: 25, b: 100, label: '२५ : १००' },
              ].map((pair, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    kit.tap();
                    setTermA(pair.a);
                    setTermB(pair.b);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    background: termA === pair.a && termB === pair.b ? '#187C68' : '#F1F5F9',
                    color: termA === pair.a && termB === pair.b ? '#FFF' : '#334155',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {pair.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
                alignItems: 'stretch',
              }}
            >
              {/* Sliders for Custom Numbers */}
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>
                  {L('आफ्नो सङ्ख्या रोज्नुहोस्', 'Choose Custom Terms')}
                </h4>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    {L('पहिलो पद (Antecedent): ', 'First Term: ')} {isNe ? toNp(termA) : termA}
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={60}
                    value={termA}
                    onChange={(e) => {
                      kit.tap();
                      setTermA(parseInt(e.target.value));
                    }}
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    {L('दोस्रो पद (Consequent): ', 'Second Term: ')} {isNe ? toNp(termB) : termB}
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={60}
                    value={termB}
                    onChange={(e) => {
                      kit.tap();
                      setTermB(parseInt(e.target.value));
                    }}
                    style={{ width: '100%', marginTop: 4 }}
                  />
                </div>
              </div>

              {/* Step by Step Reduction */}
              <div style={{ background: '#EEF2FF', padding: 16, borderRadius: 10, border: '1px solid #C7D2FE' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#3730A3' }}>
                  {L('चरणबद्ध समाधान (Step-by-Step Reduction)', 'Step-by-Step Solution')}
                </h4>
                <div style={{ fontSize: 14, color: '#1E1B4B', lineHeight: 1.8 }}>
                  <div>
                    <strong>{L('१. दिइएको अनुपात:', '1. Given Ratio:')}</strong> {isNe ? toNp(termA) : termA} :{' '}
                    {isNe ? toNp(termB) : termB} = {isNe ? toNp(termA) : termA} / {isNe ? toNp(termB) : termB}
                  </div>
                  <div>
                    <strong>{L('२. म.स. (HCF):', '2. HCF:')}</strong> HCF({termA}, {termB}) ={' '}
                    <span style={{ color: '#4338CA', fontWeight: 800 }}>{isNe ? toNp(currentGcd) : currentGcd}</span>
                  </div>
                  <div>
                    <strong>{L('३. म.स. ले दुवैलाई भाग गर्दा:', '3. Dividing both terms by HCF:')}</strong>
                    <br />({isNe ? toNp(termA) : termA} ÷ {isNe ? toNp(currentGcd) : currentGcd}) / (
                    {isNe ? toNp(termB) : termB} ÷ {isNe ? toNp(currentGcd) : currentGcd})
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      padding: '8px 12px',
                      background: '#FFF',
                      borderRadius: 6,
                      border: '1px solid #818CF8',
                      fontWeight: 800,
                      color: '#312E81',
                      fontSize: 16,
                    }}
                  >
                    {L('सरल रूप (Simplest Form):', 'Simplest Form:')} {isNe ? toNp(termA / currentGcd) : termA / currentGcd}{' '}
                    :{' '}
                    {isNe ? toNp(termB / currentGcd) : termB / currentGcd}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Same Unit Conversion Explorer */}
        {activeTab === 'units' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('समान एकाइ रूपान्तरण (Conversion into Same Unit)', 'Conversion into Same Unit')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'अनुपात निकाल्नु अघि दुवै परिमाणहरूलाई एउटै एकाइ (Same Unit) मा परिणत गर्नुपर्छ। अनुपातको कुनै एकाइ हुँदैन।',
                'Quantities must be converted into the same unit before comparing. A ratio has no units.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '16px 0' }}>
              {UNIT_SCENARIOS.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => {
                    kit.tap();
                    setSelectedUnitScenario(i);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: selectedUnitScenario === i ? '#187C68' : '#F1F5F9',
                    color: selectedUnitScenario === i ? '#FFF' : '#334155',
                  }}
                >
                  {L(sc.labelNp, sc.labelEn)}
                </button>
              ))}
            </div>

            {/* Selected Scenario Walkthrough */}
            {(() => {
              const cur = UNIT_SCENARIOS[selectedUnitScenario];
              return (
                <div
                  style={{
                    padding: 20,
                    background: '#F8FAFC',
                    borderRadius: 12,
                    border: '2px solid #CBD5E1',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        background: '#EF4444',
                        color: '#FFF',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {L('फरक एकाइहरू', 'Different Units')}
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                      {cur.val1} {cur.unit1} {L('र', 'and')} {cur.val2} {cur.unit2}
                    </span>
                  </div>

                  <div
                    style={{
                      background: '#FFF',
                      padding: 16,
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      marginBottom: 16,
                      lineHeight: 1.8,
                    }}
                  >
                    <div style={{ color: '#0369A1', fontWeight: 600, marginBottom: 6 }}>
                      {L('चरण १: एउटै सानो एकाइमा रूपान्तरण गर्ने', 'Step 1: Convert into the same smaller unit')}
                    </div>
                    <div style={{ color: '#334155', fontSize: 14 }}>{L(cur.stepTextNp, cur.stepTextEn)}</div>

                    <div style={{ marginTop: 10, color: '#0369A1', fontWeight: 600 }}>
                      {L('चरण २: अनुपात निकाली सरल रूपमा लैजाने', 'Step 2: Form ratio and simplify')}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#187C68', marginTop: 4 }}>
                      {cur.convertedVal1} {cur.convertedUnit1} : {cur.val2} {cur.unit2} = {cur.ratioAns}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#FEF3C7',
                      borderRadius: 8,
                      border: '1px solid #FCD34D',
                      fontSize: 13,
                      color: '#92400E',
                    }}
                  >
                    💡{' '}
                    <strong>{L('स्मरण रहोस्:', 'Remember:')}</strong>{' '}
                    {L(
                      'अनुपात शुद्ध सङ्ख्या हो, यसको पछाडि से.मी, ग्राम, रुपैयाँ आदि एकाइ लेखिँदैन!',
                      'A ratio is a pure dimensionless number without any units (no cm, g, Rs, etc.)!'
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 4: Ratio vs Fraction */}
        {activeTab === 'fraction' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('भिन्न र अनुपातको सम्बन्ध (Ratio vs Fraction)', 'Relationship: Ratio vs Fraction')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'भिन्नले कुनै वस्तुको सम्पूर्ण भाग (Whole) सँगको सम्बन्ध देखाउँछ भने अनुपातले भागहरूको आपसमा वा सम्पूर्णसँगको तुलना गर्दछ।',
                'A fraction compares part to whole, while a ratio compares part to part or part to whole.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', margin: '16px 0' }}>
              <div>
                <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  {L('जम्मा बराबर भागहरू (Total Parts): ', 'Total Parts: ')} {isNe ? toNp(totalParts) : totalParts}
                </label>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={totalParts}
                  onChange={(e) => {
                    kit.tap();
                    const newTot = parseInt(e.target.value);
                    setTotalParts(newTot);
                    if (shadedParts > newTot) setShadedParts(newTot);
                  }}
                  style={{ width: 160 }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, color: '#047857', display: 'block', marginBottom: 4 }}>
                  {L('रङ्ग्याइएको भागहरू (Shaded Parts): ', 'Shaded Parts: ')} {isNe ? toNp(shadedParts) : shadedParts}
                </label>
                <input
                  type="range"
                  min={1}
                  max={totalParts}
                  value={shadedParts}
                  onChange={(e) => {
                    kit.tap();
                    setShadedParts(parseInt(e.target.value));
                  }}
                  style={{ width: 160 }}
                />
              </div>
            </div>

            {/* Visual Parts Bar */}
            <div
              style={{
                display: 'flex',
                height: 50,
                borderRadius: 8,
                overflow: 'hidden',
                border: '2px solid #0F172A',
                marginBottom: 20,
              }}
            >
              {Array.from({ length: totalParts }).map((_, idx) => {
                const isShaded = idx < shadedParts;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      kit.tap();
                      setShadedParts(idx + 1);
                    }}
                    style={{
                      flex: 1,
                      background: isShaded ? '#10B981' : '#E2E8F0',
                      borderRight: idx === totalParts - 1 ? 'none' : '1px solid #0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: isShaded ? '#FFF' : '#64748B',
                      cursor: 'pointer',
                    }}
                  >
                    {isNe ? toNp(idx + 1) : idx + 1}
                  </div>
                );
              })}
            </div>

            {/* Comparison Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              <div style={{ background: '#ECFDF5', padding: 16, borderRadius: 10, border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: 13, color: '#065F46', fontWeight: 700 }}>
                  {L('रङ्ग्याइएको भागको भिन्न (Fraction)', 'Shaded Fraction')}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                  {isNe ? toNp(shadedParts) : shadedParts} / {isNe ? toNp(totalParts) : totalParts}
                </div>
                <div style={{ fontSize: 12, color: '#065F46', marginTop: 4 }}>
                  {L('(रङ्ग्याइएको भाग / जम्मा भाग)', '(Shaded part / Total parts)')}
                </div>
              </div>

              <div style={{ background: '#F0F9FF', padding: 16, borderRadius: 10, border: '1px solid #BAE6FD' }}>
                <div style={{ fontSize: 13, color: '#075985', fontWeight: 700 }}>
                  {L('रङ्ग्याइएको : नरङ्ग्याइएको (Ratio Part to Part)', 'Ratio: Shaded to Unshaded')}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0284C7', marginTop: 4 }}>
                  {isNe ? toNp(shadedParts) : shadedParts} : {isNe ? toNp(unshadedParts) : unshadedParts}
                </div>
                <div style={{ fontSize: 12, color: '#0369A1', marginTop: 4 }}>
                  {L(
                    `${shadedParts} हरियो भाग र ${unshadedParts} सेतो भाग`,
                    `${shadedParts} green parts and ${unshadedParts} plain parts`
                  )}
                </div>
              </div>

              <div style={{ background: '#FDF4FF', padding: 16, borderRadius: 10, border: '1px solid #F0ABFC' }}>
                <div style={{ fontSize: 13, color: '#86198F', fontWeight: 700 }}>
                  {L('रङ्ग्याइएको : जम्मा भाग (Ratio Part to Whole)', 'Ratio: Shaded to Total')}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#A21CAF', marginTop: 4 }}>
                  {isNe ? toNp(shadedParts) : shadedParts} : {isNe ? toNp(totalParts) : totalParts}
                </div>
                <div style={{ fontSize: 12, color: '#86198F', marginTop: 4 }}>
                  {L('भिन्नलाई अनुपातको रूपमा लेख्न सकिन्छ', 'A fraction can be expressed as a ratio')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default RatioDiscoveryWorld;
