/**
 * ProportionUnknownValueLab.tsx
 * Grade 8 Mathematics – Unit 4: RATIO AND PROPORTION
 * Simulation 10: Proportion and Unknown Value Lab
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 4)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Equal, ArrowRight, Check, Award, Layers, Sparkles, Scale } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दुईpcs बराबर अनुपातहरू बीचको सम्बन्धलाई के भनिन्छ?',
    en: 'An equality between two ratios is called a:',
    options: [
      { key: 'A', label: 'Proportion (a:b = c:d or a:b :: c:d)' },
      { key: 'B', label: 'Inequality' },
      { key: 'C', label: 'Percentage' },
      { key: 'D', label: 'Exponent' },
    ],
    answer: 'A',
  },
  {
    np: 'समानुपात a:b = c:d मा अन्तिम पदहरूको गुणनफल र मध्य पदहरूको गुणनफल बीच के सम्बन्ध हुन्छ?',
    en: 'In proportion a:b = c:d, what is the relation between product of extremes and product of means?',
    options: [
      { key: 'A', label: 'Product of the extremes = product of the means (a × d = b × c)' },
      { key: 'B', label: 'a × b = c × d' },
      { key: 'C', label: 'a + d = b + c' },
      { key: 'D', label: 'a - d = b - c' },
    ],
    answer: 'A',
  },
  {
    np: 'समानुपात 5:8 = 10:a मा अज्ञात पद a को मान कति हुन्छ?',
    en: 'In proportion 5:8 = 10:a, what is the missing term a?',
    options: [
      { key: 'A', label: '16 [ 5a = 80 ⇒ a = 16 ]' },
      { key: 'B', label: '12' },
      { key: 'C', label: '20' },
      { key: 'D', label: '25' },
    ],
    answer: 'A',
  },
  {
    np: '4 र 5 मा कुन सङ्ख्या जोड्दा तिनीहरूको अनुपात 5:6 हुन्छ?',
    en: 'What number must be added to 4 and 5 so that their ratio becomes 5:6?',
    options: [
      { key: 'A', label: '1 [ (4+1)/(5+1) = 5/6 ]' },
      { key: 'B', label: '2' },
      { key: 'C', label: '3' },
      { key: 'D', label: '0' },
    ],
    answer: 'A',
  },
  {
    np: '12 pcs केराको मूल्य Rs. 150 पर्छ भने Rs. 900 मा कतिpcs केरा किन्न सकिन्छ?',
    en: 'If 12 bananas cost Rs. 150, how many bananas can be purchased for Rs. 900?',
    options: [
      { key: 'A', label: '72 pcs [ 12/150 = x/900 ⇒ x = 72 ]' },
      { key: 'B', label: '60 pcs' },
      { key: 'C', label: '84 pcs' },
      { key: 'D', label: '50 pcs' },
    ],
    answer: 'A',
  },
];

export const ProportionUnknownValueLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U4-03',
    chapter: 4,
    titleNp: 'समानुपात र अज्ञात मान प्रयोगशाला (Proportion Lab)',
    titleEn: 'Proportion and Unknown Value Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'paper' | 'means_extremes' | 'missing' | 'add_number' | 'bananas' | 'challenge'>('paper');

  // Tab 3 Missing term inputs: a:b = c:x
  const [inpA, setInpA] = useState<number>(5);
  const [inpB, setInpB] = useState<number>(8);
  const [inpC, setInpC] = useState<number>(10);
  const missingX = (inpB * inpC) / inpA;

  // Tab 4 Add number: (num1 + y)/(num2 + y) = targetA / targetB
  const [addNum1, setAddNum1] = useState<number>(4);
  const [addNum2, setAddNum2] = useState<number>(5);
  const [targetRatioA, setTargetRatioA] = useState<number>(5);
  const [targetRatioB, setTargetRatioB] = useState<number>(6);

  // Cross multiply: targetB*(num1+y) = targetA*(num2+y)
  // targetB*num1 + targetB*y = targetA*num2 + targetA*y
  // (targetB - targetA)*y = targetA*num2 - targetB*num1
  const denom = targetRatioB - targetRatioA;
  const numer = targetRatioA * addNum2 - targetRatioB * addNum1;
  const calculatedY = denom !== 0 ? numer / denom : 0;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! समानुपात प्रयोगशालामा स्वागत छ। मध्य पद, अन्तिम पद, बज्र गुणन र अज्ञात मान पत्ता लगाउन सिकौँ!',
        'Hello! Welcome to Proportion Lab. Master means, extremes, cross multiplication, and solving unknown terms!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'paper', labelNp: '1. कागज पट्याएर समानुपात (1/3 = 2/6)', labelEn: '1. Paper Folding (1/3=2/6)', icon: Layers },
            { id: 'means_extremes', labelNp: '2. मध्य पद र अन्तिम पद नियम', labelEn: '2. Means & Extremes', icon: Scale },
            { id: 'missing', labelNp: '3. अज्ञात पद पत्ता लगाउने (5:8 = 10:a)', labelEn: '3. Find Unknown Term', icon: ArrowRight },
            { id: 'add_number', labelNp: '4. सङ्ख्या जोडेर समानुपात बनाउने', labelEn: '4. Add Number to Ratio', icon: Sparkles },
            { id: 'bananas', labelNp: '5. केरा र मूल्य प्रत्यक्ष समानुपात', labelEn: '5. Bananas & Price', icon: Equal },
            { id: 'challenge', labelNp: '6. अभ्यास चुनौती', labelEn: '6. Quiz Challenge', icon: Award },
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

        {/* Tab 1: Paper Folding */}
        {activeTab === 'paper' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={20} />
              {L('पाठ्यपुस्तक क्रियाकलाप: कागज पट्याएर समानुपात खोजी', 'CDC Textbook Activity: Paper Folding Equivalence')}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              {L(
                'समान नापका दुईpcs आयताकार कागजका टुक्रा लिऔँ। पहिलोलाई 3 बराबर भाग लगाई 1 भाग रङ्गाउँ (1:3)। दोस्रोलाई 6 बराबर भाग लगाई 2 भाग रङ्गाउँ (2:6)।',
                'Take two identical rectangular papers. Divide first into 3 parts and color 1 (1:3). Divide second into 6 parts and color 2 (2:6).'
              )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Paper 1 */}
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                  {L('पहिलो कागज: 3 भागमा 1 भाग रङ्ग्याइएको (1:3)', 'Paper 1: 1 out of 3 parts shaded (1:3)')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', height: 50, border: '2px solid #0284c7', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ background: '#0284c7' }} />
                  <div style={{ background: '#ffffff', borderLeft: '1px dashed #cbd5e1' }} />
                  <div style={{ background: '#ffffff', borderLeft: '1px dashed #cbd5e1' }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0284c7', marginTop: 8, textAlign: 'center' }}>
                  1 / 3 = 1 : 3
                </div>
              </div>

              {/* Paper 2 */}
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
                  {L('दोस्रो कागज: 6 भागमा 2 भाग रङ्ग्याइएको (2:6)', 'Paper 2: 2 out of 6 parts shaded (2:6)')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', height: 50, border: '2px solid #16a34a', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ background: '#16a34a' }} />
                  <div style={{ background: '#16a34a', borderLeft: '1px dashed #ffffff' }} />
                  <div style={{ background: '#ffffff', borderLeft: '1px dashed #cbd5e1' }} />
                  <div style={{ background: '#ffffff', borderLeft: '1px dashed #cbd5e1' }} />
                  <div style={{ background: '#ffffff', borderLeft: '1px dashed #cbd5e1' }} />
                  <div style={{ background: '#ffffff', borderLeft: '1px dashed #cbd5e1' }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a', marginTop: 8, textAlign: 'center' }}>
                  2 / 6 = 2 : 6 = 1 : 3
                </div>
              </div>
            </div>

            <div style={{ background: '#ecfdf5', padding: 16, borderRadius: 12, border: '1.5px solid #a7f3d0', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>
                {L('दुवै अनुपातहरू बराबर भएकाले यिनीहरू समानुपाती छन्:', 'Both ratios are equal, so they form a proportion:')}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                1 : 3 = 2 : 6  or  1 : 3 :: 2 : 6
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Means and Extremes */}
        {activeTab === 'means_extremes' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scale size={20} />
              {L('समानुपातको आधारभूत नियम: अन्तिम पद र मध्य पद', 'Product of Extremes = Product of Means')}
            </h3>

            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 14, border: '1px solid #cbd5e1', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>
                <span style={{ color: '#dc2626' }}>a</span> : <span style={{ color: '#0284c7' }}>b</span> = <span style={{ color: '#0284c7' }}>c</span> : <span style={{ color: '#dc2626' }}>d</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 12, fontSize: 14, fontWeight: 700 }}>
                <span style={{ color: '#dc2626' }}>{L('अन्तिम पदहरू (Extremes): a र d', 'Extremes: a and d')}</span>
                <span style={{ color: '#0284c7' }}>{L('मध्य पदहरू (Means): b र c', 'Means: b and c')}</span>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: 18, borderRadius: 12, border: '1.5px solid #bbf7d0', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>{L('बज्र गुणन नियम (Cross Multiplication Rule):', 'Cross Multiplication Property:')}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#15803d', marginTop: 6 }}>
                a × d = b × c
              </div>
              <div style={{ fontSize: 13, color: '#166534', marginTop: 4 }}>
                {L('अन्तिम पदहरूको गुणनफल = मध्य पदहरूको गुणनफल', 'Product of Extremes = Product of Means')}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Missing Term */}
        {activeTab === 'missing' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight size={20} />
              {L('पाठ्यपुस्तक उदाहरण: अज्ञात पद पत्ता लगाउने (5:8 = 10:a)', 'Textbook Example: Find Unknown Term (5:8 = 10:a)')}
            </h3>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{L('पाठ्यपुस्तक उदाहरणहरू:', 'Textbook Examples:')}</span>
              {[
                { a: 5, b: 8, c: 10 },
                { a: 3, b: 5, c: 12 },
                { a: 4, b: 7, c: 16 },
                { a: 2, b: 9, c: 18 },
              ].map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInpA(ex.a);
                    setInpB(ex.b);
                    setInpC(ex.c);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: inpA === ex.a && inpB === ex.b && inpC === ex.c ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: inpA === ex.a && inpB === ex.b && inpC === ex.c ? '#e0f2fe' : '#ffffff',
                    color: inpA === ex.a && inpB === ex.b && inpC === ex.c ? '#0369a1' : '#334155',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {ex.a}:{ex.b} = {ex.c}:x
                </button>
              ))}
            </div>

            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                {inpA} / {inpB} = {inpC} / x
              </div>
              <div style={{ fontSize: 15, color: '#334155' }}>
                {L('बज्र गुणन गर्दा:', 'By Cross Multiplication:')}<br />
                {inpA} × x = {inpB} × {inpC}<br />
                {inpA}x = {inpB * inpC}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#16a34a', marginTop: 4 }}>
                x = {inpB * inpC} ÷ {inpA} = {missingX}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Add Number to Make Ratio Proportional */}
        {activeTab === 'add_number' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} />
              {L('पाठ्यपुस्तक उदाहरण: 4 र 5 मा कुन सङ्ख्या जोड्दा अनुपात 5:6 हुन्छ?', 'Textbook Example: What Number to Add to 4 & 5 for 5:6?')}
            </h3>

            <div style={{ background: '#fff7ed', padding: 18, borderRadius: 14, border: '1px solid #fed7aa', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14, color: '#9a3412' }}>
                {L('मानौँ, जोड्नुपर्ने सङ्ख्या y हो।', 'Let the required number to be added be y.')}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#c2410c' }}>
                (4 + y) / (5 + y) = 5 / 6
              </div>
              <div style={{ fontSize: 14, color: '#7c2d12', lineHeight: 1.6 }}>
                6(4 + y) = 5(5 + y)<br />
                24 + 6y = 25 + 5y<br />
                6y - 5y = 25 - 24<br />
                <strong>y = 1</strong>
              </div>
              <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #fdba74', fontWeight: 800, color: '#9a3412' }}>
                {L('जाँच: (4 + 1) / (5 + 1) = 5 / 6', 'Verification: (4 + 1) / (5 + 1) = 5 / 6 (True)')}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Bananas & Direct Proportion */}
        {activeTab === 'bananas' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Equal size={20} />
              {L('पाठ्यपुस्तक उदाहरण: केरा र मूल्य प्रत्यक्ष समानुपात', 'Direct Proportion: Bananas & Price')}
            </h3>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#334155' }}>
                {L(
                  '12 pcs केराको मूल्य Rs. 150 पर्छ भने Rs. 900 मा कतिpcs केरा किन्न सकिन्छ?',
                  'If 12 bananas cost Rs. 150, how many bananas can be purchased for Rs. 900?'
                )}
              </p>
            </div>

            <div style={{ background: '#f0fdf4', padding: 18, borderRadius: 12, border: '1.5px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 15, color: '#166534' }}>
                12 / 150 = x / 900<br />
                150 × x = 12 × 900<br />
                150x = 10,800
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#15803d', marginTop: 4 }}>
                x = 10,800 ÷ 150 = 72 bananas
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Challenge */}
        {activeTab === 'challenge' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} />
              {L('समानुपात अभ्यास चुनौती', 'Proportion Challenge Quiz')}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
              {L(
                'माथि दायाँ कुनामा रहेको "चुनौती (Challenge)" ट्याबबाट 5 pcs आधिकारिक पाठ्यपुस्तकका प्रश्नहरू हल गरी ताराहरू कमाउनुहोस्!',
                'Click "Challenge" mode in the header to take the official CDC curriculum quiz and earn mastery stars!'
              )}
            </p>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ProportionUnknownValueLab;
