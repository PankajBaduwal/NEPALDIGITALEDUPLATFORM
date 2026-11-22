/**
 * ScientificNotationCalcLab.tsx
 * Grade 8 Mathematics – Unit 3: RATIONAL AND IRRATIONAL NUMBERS (परिमेय र अपरिमेय सङ्ख्याहरू)
 * Simulation 7: Scientific Notation Calculation Lab (वैज्ञानिक सङ्केतन गणना प्रयोगशाला)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 3)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Plus, Minus, X, Divide, Award, CheckCircle2, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'पाठ्यपुस्तक अनुसार (३.४ × १०²) + (४.५७ × १०³) को योगफल कति हुन्छ?',
    en: 'According to the textbook, what is the sum of (3.4 × 10²) + (4.57 × 10³)?',
    options: [
      { key: 'A', label: '४.९१ × १०³ [ (०.३४ + ४.५७) × १०³ = ४.९१ × १०³ ]' },
      { key: 'B', label: '७.९७ × १०⁵' },
      { key: 'C', label: '४.९१ × १०²' },
      { key: 'D', label: '४९.१ × १०²' },
    ],
    answer: 'A',
  },
  {
    np: '(४.५४ × १०⁻³) - (२.४ × १०⁻³) को मान कति हुन्छ?',
    en: 'What is the value of (4.54 × 10⁻³) - (2.4 × 10⁻³)?',
    options: [
      { key: 'A', label: '२.१४ × १०⁻³ [ (४.५४ - २.४) × १०⁻³ = २.१४ × १०⁻³ ]' },
      { key: 'B', label: '२.१४ × १०⁻⁶' },
      { key: 'C', label: '२.१४ × १०⁰' },
      { key: 'D', label: '६.९४ × १०⁻³' },
    ],
    answer: 'A',
  },
  {
    np: '(२.० × १०³) × (४.१२ × १०⁴) को गुणनफल कति हुन्छ?',
    en: 'What is the product of (2.0 × 10³) × (4.12 × 10⁴)?',
    options: [
      { key: 'A', label: '८.२४ × १०⁷ [ (२.० × ४.१२) × १०³⁺⁴ = ८.२४ × १०⁷ ]' },
      { key: 'B', label: '८.२४ × १०¹²' },
      { key: 'C', label: '६.१२ × १०⁷' },
      { key: 'D', label: '८.२४ × १०¹' },
    ],
    answer: 'A',
  },
  {
    np: '(९.६० × १०⁷) ÷ (१.६० × १०⁴) को भागफल कति हुन्छ?',
    en: 'What is the quotient of (9.60 × 10⁷) ÷ (1.60 × 10⁴)?',
    options: [
      { key: 'A', label: '६ × १०³ [ (९.६० ÷ १.६०) × १०⁷⁻⁴ = ६ × १०³ ]' },
      { key: 'B', label: '६ × १०¹¹' },
      { key: 'C', label: '६ × १०²⁸' },
      { key: 'D', label: '१.५ × १०³' },
    ],
    answer: 'A',
  },
  {
    np: 'वैज्ञानिक सङ्केतनमा गुणन वा भाग गर्दा १० का घाताङ्कहरू (Exponents) के हुन्छन्?',
    en: 'When multiplying or dividing powers of 10 in scientific notation, what happens to the exponents?',
    options: [
      { key: 'A', label: 'गुणनमा घाताङ्क जोडिन्छ (१०ᵃ⁺ᵇ) र भागमा घटाइन्छ (१०ᵃ⁻ᵇ)' },
      { key: 'B', label: 'गुणनमा घटाइन्छ र भागमा जोडिन्छ' },
      { key: 'C', label: 'घाताङ्कहरू आपसै गुणन हुन्छन्' },
      { key: 'D', label: 'कुनै परिवर्तन हुँदैन' },
    ],
    answer: 'A',
  },
];

export const ScientificNotationCalcLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U3-05',
    chapter: 3,
    titleNp: 'वैज्ञानिक सङ्केतन गणना प्रयोगशाला (Calculation Lab)',
    titleEn: 'Scientific Notation Calculation Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'add' | 'sub' | 'mul' | 'div' | 'real_life' | 'challenge'>('add');

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! वैज्ञानिक सङ्केतनका सङ्ख्याहरूलाई जोड, घटाउ, गुणन र भाग गर्ने नियमहरू सिकौँ!',
        'Hello! Master step-by-step addition, subtraction, multiplication, and division with scientific notation!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'add', labelNp: '१. जोड (Addition)', labelEn: '1. Addition', icon: Plus },
            { id: 'sub', labelNp: '२. घटाउ (Subtraction)', labelEn: '2. Subtraction', icon: Minus },
            { id: 'mul', labelNp: '३. गुणन (Multiplication)', labelEn: '3. Multiplication', icon: X },
            { id: 'div', labelNp: '४. भाग (Division)', labelEn: '4. Division', icon: Divide },
            { id: 'real_life', labelNp: '५. व्यावहारिक समस्या (Word Problems)', labelEn: '5. Real-Life Problems', icon: Award },
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

        {/* Tab 1: Addition */}
        {activeTab === 'add' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={20} />
              {L('पाठ्यपुस्तक उदाहरण: जोड (३.४ × १०² + ४.५७ × १०³)', 'Textbook Example: (3.4 × 10²) + (4.57 × 10³)')}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              {L(
                'जोड गर्दा दुवै सङ्ख्याका १० का घाताङ्क (Power of 10) लाई एउटै (समान) बनाउनुपर्छ। ठूलो घाताङ्क १०³ मा रूपान्तरण गरेर गुणांक जोडिन्छ:',
                'For addition, adjust both terms to a common power of 10 (here 10³), then add the coefficients:'
              )}
            </p>

            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 15, color: '#334155' }}>
                <strong>{L('चरण १: समान घाताङ्कमा लैजाने', 'Step 1: Common Power')}</strong><br />
                ३.४ × १०² = ०.३४ × १०³
              </div>
              <div style={{ fontSize: 15, color: '#334155' }}>
                <strong>{L('चरण २: साझा १०³ झिकेर गुणांक जोड्ने', 'Step 2: Add Coefficients')}</strong><br />
                = (०.३४ × १०³) + (४.५७ × १०³)<br />
                = (०.३४ + ४.५७) × १०³
              </div>
              <div style={{ background: '#ecfdf5', padding: 14, borderRadius: 10, border: '1.5px solid #a7f3d0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>{L('अन्तिम नतिजा (Final Result):', 'Final Result:')}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                  = ४.९१ × १०³
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Subtraction */}
        {activeTab === 'sub' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#c2410c', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Minus size={20} />
              {L('पाठ्यपुस्तक उदाहरण: घटाउ (४.५४ × १०⁻³ - २.४ × १०⁻³)', 'Textbook Example: (4.54 × 10⁻³) - (2.4 × 10⁻³)')}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              {L(
                'यहाँ दुवै सङ्ख्याको १० को घात १०⁻³ पहिले नै समान छ। त्यसैले साझा १०⁻³ झिकी गुणांकहरू सिधै घटाइन्छ:',
                'Here both powers of 10 are already identical (10⁻³). Factor out 10⁻³ and subtract coefficients directly:'
              )}
            </p>

            <div style={{ background: '#fff7ed', padding: 18, borderRadius: 14, border: '1px solid #fed7aa', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 15, color: '#7c2d12' }}>
                = (४.५४ - २.४) × १०⁻³
              </div>
              <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1.5px solid #fdba74' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>{L('अन्तिम नतिजा:', 'Final Result:')}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#c2410c', marginTop: 4 }}>
                  = २.१४ × १०⁻³
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Multiplication */}
        {activeTab === 'mul' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#16a34a', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <X size={20} />
              {L('पाठ्यपुस्तक उदाहरण: गुणन (२.० × १०³) × (४.१२ × १०⁴)', 'Textbook Example: (2.0 × 10³) × (4.12 × 10⁴)')}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              {L(
                'गुणन गर्दा गुणांकलाई गुणांकसँग गुणन गरिन्छ र १० का घाताङ्कहरू आपसमा जोडिन्छ (१०ᵃ × १०ᵇ = १०ᵃ⁺ᵇ):',
                'Multiply coefficients together, and add exponents of 10 (10ᵃ × 10ᵇ = 10ᵃ⁺ᵇ):'
              )}
            </p>

            <div style={{ background: '#f0fdf4', padding: 18, borderRadius: 14, border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 15, color: '#166534' }}>
                = (२.० × ४.१२) × १०³⁺⁴
              </div>
              <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1.5px solid #86efac' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#14532d' }}>{L('अन्तिम नतिजा:', 'Final Result:')}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#15803d', marginTop: 4 }}>
                  = ८.२४ × १०⁷
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Division */}
        {activeTab === 'div' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#7c3aed', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Divide size={20} />
              {L('पाठ्यपुस्तक उदाहरण: भाग (९.६० × १०⁷) ÷ (१.६० × १०⁴)', 'Textbook Example: (9.60 × 10⁷) ÷ (1.60 × 10⁴)')}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              {L(
                'भाग गर्दा गुणांकलाई गुणांकले भाग गरिन्छ र १० का घाताङ्कहरू आपसमा घटाइन्छ (१०ᵃ ÷ १०ᵇ = १०ᵃ⁻ᵇ):',
                'Divide coefficients, and subtract exponents of 10 (10ᵃ ÷ 10ᵇ = 10ᵃ⁻ᵇ):'
              )}
            </p>

            <div style={{ background: '#f5f3ff', padding: 18, borderRadius: 14, border: '1px solid #ddd6fe', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 15, color: '#6d28d9' }}>
                = (९.६० ÷ १.६०) × १०⁷⁻⁴
              </div>
              <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1.5px solid #c4b5fd' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#5b21b6' }}>{L('अन्तिम नतिजा:', 'Final Result:')}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#7c3aed', marginTop: 4 }}>
                  = ६.० × १०³
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Real-Life Problems */}
        {activeTab === 'real_life' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} />
              {L('पाठ्यपुस्तकका दैनिक जीवनका व्यावहारिक समस्याहरू', 'Textbook Real-Life Word Problems')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  {L('समस्या १: दुईवटा पानी ट्याङ्कीको जम्मा क्षमता', 'Problem 1: Total Water Capacity')}
                </div>
                <p style={{ fontSize: 13, color: '#475569', margin: '6px 0' }}>
                  {L('ट्याङ्की A मा २.५ × १०⁴ लिटर र ट्याङ्की B मा १.२ × १०⁴ लिटर पानी छ। जम्मा पानी कति?', 'Tank A has 2.5 × 10⁴ L and Tank B has 1.2 × 10⁴ L. Find total water:')}
                </p>
                <div style={{ fontWeight: 800, color: '#0284c7', fontSize: 14 }}>
                  (२.५ + १.२) × १०⁴ = ३.७ × १०⁴ लिटर
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  {L('समस्या २: रकेटले पार गरेको दुरी', 'Problem 2: Rocket Travel Distance')}
                </div>
                <p style={{ fontSize: 13, color: '#475569', margin: '6px 0' }}>
                  {L('रकेटको गति ३.० × १०⁴ किमी/घण्टा छ भने २.० × १०² घण्टामा कति दुरी पार गर्छ?', 'Rocket speed is 3.0 × 10⁴ km/h. How far does it travel in 2.0 × 10² hours?')}
                </p>
                <div style={{ fontWeight: 800, color: '#16a34a', fontSize: 14 }}>
                  (३.० × २.०) × १०⁴⁺² = ६.० × १०⁶ किमी
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ScientificNotationCalcLab;
