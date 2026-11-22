/**
 * RatioDiscoveryPlayground.tsx
 * Grade 8 Mathematics – Unit 4: RATIO AND PROPORTION (अनुपात र समानुपात)
 * Simulation 8: Ratio Discovery and Comparison Playground (अनुपात खोजी र तुलना खेलमैदान)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 4)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Scale, ArrowRight, Check, Award, Layers, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एउटै एकाइ भएका दुई सजातीय परिमाणहरूको तुलनात्मक भागफललाई के भनिन्छ?',
    en: 'The comparison of two quantities of the same kind by division is called:',
    options: [
      { key: 'A', label: 'अनुपात (Ratio: a/b वा a:b)' },
      { key: 'B', label: 'समानुपात (Proportion)' },
      { key: 'C', label: 'गुणांक (Coefficient)' },
      { key: 'D', label: 'घाताङ्क (Exponent)' },
    ],
    answer: 'A',
  },
  {
    np: 'पाठ्यपुस्तक अनुसार २५० ग्राम र २ किलोग्राम बीचको अनुपात कति हुन्छ?',
    en: 'According to the textbook, what is the ratio of 250 g to 2 kg?',
    options: [
      { key: 'A', label: '१:८ [ २ केजी = २००० ग्राम ⇒ २५०:२००० = १:८ ]' },
      { key: 'B', label: '१२५:१' },
      { key: 'C', label: '२:२५०' },
      { key: 'D', label: '१:४' },
    ],
    answer: 'A',
  },
  {
    np: '४० मिनेट र १ घण्टा बीचको अनुपात निकाल्दा कुन मान प्राप्त हुन्छ?',
    en: 'What is the ratio between 40 minutes and 1 hour?',
    options: [
      { key: 'A', label: '२:३ [ १ घण्टा = ६० मिनेट ⇒ ४०:६० = २:३ ]' },
      { key: 'B', label: '४०:१' },
      { key: 'C', label: '४:१' },
      { key: 'D', label: '३:२' },
    ],
    answer: 'A',
  },
  {
    np: '१२ वटा सिन्के सिसाकलम (Pencil) को रु. १२० र ६ वटा कलम (Pen) को रु. १५० पर्छ भने एउटा पेन्सिल र एउटा कलमको मूल्यको अनुपात कति हुन्छ?',
    en: 'If 12 pencils cost Rs. 120 and 6 pens cost Rs. 150, what is the ratio of the unit price of a pencil to a pen?',
    options: [
      { key: 'A', label: '२:५ [ १ पेन्सिल = रु. १०, १ कलम = रु. २५ ⇒ १०:२५ = २:५ ]' },
      { key: 'B', label: '१:२' },
      { key: 'C', label: '५:२' },
      { key: 'D', label: '४:५' },
    ],
    answer: 'A',
  },
  {
    np: 'अनुपात a:b मा क्रम (Order) को के महत्त्व हुन्छ?',
    en: 'What is the importance of order in the ratio a:b?',
    options: [
      { key: 'A', label: 'क्रम अति महत्वपूर्ण हुन्छ, किनकि a:b र b:a समान होइनन् (a:b ≠ b:a)' },
      { key: 'B', label: 'क्रमले केही फरक पार्दैन' },
      { key: 'C', label: 'a:b सधैं b:a सँग बराबर हुन्छ' },
      { key: 'D', label: 'शून्य मात्र हुन्छ' },
    ],
    answer: 'A',
  },
];

const UNIT_CONVERSIONS = [
  { itemNp: '२५० ग्राम र २ किलोग्राम', itemEn: '250 g and 2 kg', q1: '250 g', q2: '2000 g', ratio: '1:8', stepsNp: '२ केजी = २००० ग्राम ⇒ २५०/२००० = १/८ = १:८' },
  { itemNp: '२ घण्टा र ४५ मिनेट', itemEn: '2 hours and 45 minutes', q1: '120 min', q2: '45 min', ratio: '8:3', stepsNp: '२ घण्टा = १२० मिनेट ⇒ १२०/४५ = ८/३ = ८:३' },
  { itemNp: '४० मिनेट र १ घण्टा', itemEn: '40 minutes and 1 hour', q1: '40 min', q2: '60 min', ratio: '2:3', stepsNp: '१ घण्टा = ६० मिनेट ⇒ ४०/६० = २/३ = २:३' },
  { itemNp: 'रु. ५ र ९० पैसा', itemEn: 'Rs. 5 and 90 paisa', q1: '500 paisa', q2: '90 paisa', ratio: '50:9', stepsNp: 'रु. ५ = ५०० पैसा ⇒ ५००/९० = ५०/९ = ५०:९' },
  { itemNp: '२५० मिलिलिटर र २ लिटर', itemEn: '250 ml and 2 litres', q1: '250 ml', q2: '2000 ml', ratio: '1:8', stepsNp: '२ लिटर = २००० मिलिलिटर ⇒ २५०/२००० = १/८ = १:८' },
];

export const RatioDiscoveryPlayground: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U4-01',
    chapter: 4,
    titleNp: 'अनुपात खोजी र तुलना खेलमैदान (Ratio Discovery)',
    titleEn: 'Ratio Discovery and Comparison Playground',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'intro' | 'pencils' | 'units' | 'simplify' | 'challenge'>('intro');

  // Tab 1 interactive balls
  const [redBalls, setRedBalls] = useState<number>(4);
  const [blueBalls, setBlueBalls] = useState<number>(6);

  // Tab 3 unit conversion index
  const [selectedUnitIdx, setSelectedUnitIdx] = useState<number>(0);

  // Tab 4 ratio simplification inputs
  const [termA, setTermA] = useState<number>(25);
  const [termB, setTermB] = useState<number>(30);

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const ballGcd = gcd(redBalls, blueBalls);
  const simpRed = redBalls / ballGcd;
  const simpBlue = blueBalls / ballGcd;

  const abGcd = gcd(termA, termB);
  const simpA = termA / abGcd;
  const simpB = termB / abGcd;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! अनुपात खोजी खेलमैदानमा स्वागत छ। दुई परिमाणहरूको तुलना, एकाइ रूपान्तरण र सरलीकरण सिकौँ!',
        'Hello! Welcome to Ratio Discovery. Master comparing quantities, same-unit conversions, and simplifying ratios!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'intro', labelNp: '१. अनुपात अवधारणा (रातो र नीलो बल)', labelEn: '1. Ratio Concept (Balls)', icon: Scale },
            { id: 'pencils', labelNp: '२. पेन्सिल र कलमको दर तुलना', labelEn: '2. Pencils & Pens Unit Cost', icon: Sparkles },
            { id: 'units', labelNp: '३. समान एकाइ रूपान्तरण (ग्राम, समय, पैसा)', labelEn: '3. Same-Unit Conversions', icon: Layers },
            { id: 'simplify', labelNp: '४. अनुपात सरलीकरण ल्याब', labelEn: '4. Ratio Simplifier', icon: ArrowRight },
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

        {/* Tab 1: Intro with Balls */}
        {activeTab === 'intro' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scale size={20} />
              {L('पाठ्यपुस्तक उदाहरण १: रातो बल र नीलो बलको अनुपात', 'Textbook Example 1: Red Balls vs Blue Balls Ratio')}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              {L(
                'अनुपात भनेको दुई परिमाणहरू बीचको भागफलको सम्बन्ध हो। अनुपातमा क्रम (Order) अति महत्वपूर्ण हुन्छ।',
                'Ratio is a comparison of two quantities by division. The order of terms is critical: a:b ≠ b:a.'
              )}
            </p>

            {/* Interactive Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div style={{ background: '#fef2f2', padding: 14, borderRadius: 12, border: '1.5px solid #fecaca' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#991b1b' }}>{L('रातो बलहरू (Red Balls):', 'Red Balls:')}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setRedBalls(Math.max(1, redBalls - 1))} style={{ padding: '2px 10px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer' }}>-</button>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#dc2626' }}>{redBalls}</span>
                    <button onClick={() => setRedBalls(Math.min(12, redBalls + 1))} style={{ padding: '2px 10px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
                {/* Visual balls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {Array.from({ length: redBalls }).map((_, i) => (
                    <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: '#dc2626' }} />
                  ))}
                </div>
              </div>

              <div style={{ background: '#eff6ff', padding: 14, borderRadius: 12, border: '1.5px solid #bfdbfe' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{L('नीलो बलहरू (Blue Balls):', 'Blue Balls:')}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setBlueBalls(Math.max(1, blueBalls - 1))} style={{ padding: '2px 10px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer' }}>-</button>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#2563eb' }}>{blueBalls}</span>
                    <button onClick={() => setBlueBalls(Math.min(12, blueBalls + 1))} style={{ padding: '2px 10px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {Array.from({ length: blueBalls }).map((_, i) => (
                    <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563eb' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Three Ratios Explained */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>{L('१. रातो : नीलो', '1. Red : Blue')}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#dc2626', marginTop: 4 }}>
                  {redBalls}:{blueBalls} = {simpRed}:{simpBlue}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>{L('२. नीलो : रातो', '2. Blue : Red')}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#2563eb', marginTop: 4 }}>
                  {blueBalls}:{redBalls} = {simpBlue}:{simpRed}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>{L('३. रातो : जम्मा बल', '3. Red : Total')}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0369a1', marginTop: 4 }}>
                  {redBalls}:{redBalls + blueBalls}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pencils and Pens Activity */}
        {activeTab === 'pencils' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} />
              {L('पाठ्यपुस्तक क्रियाकलाप: पेन्सिल र कलमको दर अनुपात', 'CDC Textbook Activity: Pencil vs Pen Unit Price')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div style={{ background: '#fef3c7', padding: 14, borderRadius: 12, border: '1px solid #fde68a' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#b45309' }}>{L('सिन्के पेन्सिल (Pencils)', 'Pencils')}</div>
                <div style={{ fontSize: 13, color: '#92400e', marginTop: 4 }}>
                  • १२ वटा पेन्सिलको मूल्य = रु. १२०<br />
                  • १ वटा पेन्सिलको मूल्य = १२० ÷ १२ = <strong>रु. १०</strong>
                </div>
              </div>

              <div style={{ background: '#e0e7ff', padding: 14, borderRadius: 12, border: '1px solid #c7d2fe' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#4338ca' }}>{L('कलम (Pens)', 'Pens')}</div>
                <div style={{ fontSize: 13, color: '#3730a3', marginTop: 4 }}>
                  • ६ वटा कलमको मूल्य = रु. १५०<br />
                  • १ वटा कलमको मूल्य = १५० ÷ ६ = <strong>रु. २५</strong>
                </div>
              </div>
            </div>

            <div style={{ background: '#ecfdf5', padding: 16, borderRadius: 12, border: '1.5px solid #a7f3d0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>
                {L('प्रति एकाइ मूल्यको अनुपात (Ratio of Unit Prices):', 'Ratio of Unit Prices (Pencil : Pen):')}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                १० : २५ = २ : ५  [ ५ ले दुवै पदलाई भाग गर्दा ]
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Same-Unit Conversions */}
        {activeTab === 'units' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={20} />
              {L('समान एकाइ रूपान्तरण (Same-Unit Conversion Examples)', 'Convert into Same Unit Before Comparison')}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#475569' }}>
              {L(
                'अनुपात सधैं समान एकाइ (Same Units) भएका सजातीय परिमाणहरूको मात्र निकालिन्छ। पहिले दुवैलाई एउटै सानो एकाइमा लैजानुहोस्:',
                'Always convert both quantities into the exact same unit before simplifying the ratio:'
              )}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {UNIT_CONVERSIONS.map((u, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedUnitIdx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: selectedUnitIdx === idx ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: selectedUnitIdx === idx ? '#e0f2fe' : '#ffffff',
                    color: selectedUnitIdx === idx ? '#0369a1' : '#334155',
                  }}
                >
                  {isNe ? u.itemNp : u.itemEn}
                </button>
              ))}
            </div>

            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                {isNe ? UNIT_CONVERSIONS[selectedUnitIdx].itemNp : UNIT_CONVERSIONS[selectedUnitIdx].itemEn}
              </div>
              <div style={{ fontSize: 14, color: '#475569', marginTop: 8 }}>
                <strong>{L('समान एकाइमा लैजाँदा:', 'Converted to same unit:')}</strong> {UNIT_CONVERSIONS[selectedUnitIdx].q1} : {UNIT_CONVERSIONS[selectedUnitIdx].q2}
              </div>
              <div style={{ fontSize: 14, color: '#0284c7', marginTop: 4 }}>
                <strong>{L('चरणहरू:', 'Working:')}</strong> {UNIT_CONVERSIONS[selectedUnitIdx].stepsNp}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#16a34a', marginTop: 10 }}>
                {L('अन्तिम अनुपात = ', 'Final Ratio = ')}{UNIT_CONVERSIONS[selectedUnitIdx].ratio}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Ratio Simplifier */}
        {activeTab === 'simplify' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight size={20} />
              {L('अनुपात सरलीकरण प्रयोगशाला (Ratio Simplifier)', 'Ratio Simplification Lab')}
            </h3>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{L('पहिलो पद (a):', 'First Term (a):')}</label>
                <input
                  type="number"
                  value={termA}
                  onChange={(e) => setTermA(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={{ width: 90, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 800, fontSize: 16, display: 'block', marginTop: 4 }}
                />
              </div>

              <span style={{ fontSize: 24, fontWeight: 900, color: '#64748b', marginTop: 20 }}>:</span>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{L('दोस्रो पद (b):', 'Second Term (b):')}</label>
                <input
                  type="number"
                  value={termB}
                  onChange={(e) => setTermB(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={{ width: 90, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 800, fontSize: 16, display: 'block', marginTop: 4 }}
                />
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 12, border: '1.5px solid #bbf7d0' }}>
              <div style={{ fontSize: 13, color: '#166534', fontWeight: 700 }}>
                {L(`म.स. (HCF) = ${toNp(abGcd)} ले दुवै पदलाई भाग गर्दा:`, `Dividing both terms by HCF = ${abGcd}:`)}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#15803d', marginTop: 4 }}>
                {termA} : {termB} = {simpA} : {simpB}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Challenge */}
        {activeTab === 'challenge' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} />
              {L('अनुपात अभ्यास चुनौती', 'Ratio Challenge Quiz')}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
              {L(
                'माथि दायाँ कुनामा रहेको "चुनौती (Challenge)" ट्याबबाट ५ वटा आधिकारिक पाठ्यपुस्तकका प्रश्नहरू हल गरी ताराहरू कमाउनुहोस्!',
                'Click "Challenge" mode in the header to take the official CDC curriculum quiz and earn mastery stars!'
              )}
            </p>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default RatioDiscoveryPlayground;
