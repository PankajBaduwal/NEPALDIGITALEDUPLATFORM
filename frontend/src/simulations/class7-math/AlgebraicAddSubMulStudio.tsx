/**
 * AlgebraicAddSubMulStudio.tsx
 * Grade 7 Mathematics – Lesson 11: ALGEBRAIC EXPRESSION (बीजगणितीय व्यञ्जक)
 * Simulation 2: Algebraic Addition, Subtraction & Multiplication Studio (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 150-156)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Plus, Minus, X, ArrowRight, Grid, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: '(३x + २) + (५x + ४) लाई जोड्दा नतिजा कति हुन्छ?',
    en: 'What is the sum of (3x + 2) + (5x + 4)?',
    options: [
      { key: 'A', label: '८x + ६ [ (३x + ५x) + (२ + ४) = ८x + ६ ]' },
      { key: 'B', label: '१४x' },
      { key: 'C', label: '८x + ८' },
      { key: 'D', label: '१५x² + ८' },
    ],
    answer: 'A',
  },
  {
    np: '(७x + ५) बाट (३x + २) घटाउँदा (ब्र्याकेट खोल्दा चिन्ह परिवर्तन भई) कति प्राप्त हुन्छ?',
    en: 'Subtracting (3x + 2) from (7x + 5) yields what result?',
    options: [
      { key: 'A', label: '४x + ३ [ ७x + ५ - ३x - २ = ४x + ३ ]' },
      { key: 'B', label: '४x + ७' },
      { key: 'C', label: '१०x + ७' },
      { key: 'D', label: '४x - ३' },
    ],
    answer: 'A',
  },
  {
    np: 'एकपदीय पदहरूको गुणन ३x × २x को मान कति हुन्छ?',
    en: 'What is the product of monomials 3x × 2x?',
    options: [
      { key: 'A', label: '६x² (३ × २ = ६ र x × x = x²)' },
      { key: 'B', label: '५x' },
      { key: 'C', label: '६x' },
      { key: 'D', label: '५x²' },
    ],
    answer: 'A',
  },
  {
    np: 'विस्तार गर्नुहोस्: (x + २)(x + ३) = ?',
    en: 'Expand: (x + 2)(x + 3) = ?',
    options: [
      { key: 'A', label: 'x² + ५x + ६ [ x(x+३) + २(x+३) = x² + ३x + २x + ६ ]' },
      { key: 'B', label: 'x² + ६' },
      { key: 'C', label: 'x² + ६x + ५' },
      { key: 'D', label: '२x + ५' },
    ],
    answer: 'A',
  },
];

export const AlgebraicAddSubMulStudio: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L11-02',
    titleEn: 'Algebraic Add, Sub & Mul Studio',
    titleNp: 'बीजगणितीय जोड, घटाउ र गुणन प्रयोगशाला',
    chapter: 11,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'add' | 'sub' | 'mul-mono' | 'mul-poly'>('add');

  // Tab 1: Addition (3x + 2) + (5x + 4)
  const [addA1, setAddA1] = useState<number>(3);
  const [addC1, setAddC1] = useState<number>(2);
  const [addA2, setAddA2] = useState<number>(5);
  const [addC2, setAddC2] = useState<number>(4);

  // Tab 2: Subtraction (7x + 5) - (3x + 2)
  const [subA1, setSubA1] = useState<number>(7);
  const [subC1, setSubC1] = useState<number>(5);
  const [subA2, setSubA2] = useState<number>(3);
  const [subC2, setSubC2] = useState<number>(2);

  // Tab 3: Multiplication of Monomials (3x * 2x)
  const [monoCoeff1, setMonoCoeff1] = useState<number>(3);
  const [monoCoeff2, setMonoCoeff2] = useState<number>(2);

  // Tab 4: Polynomial Multiplication (x + a)(x + b)
  const [polyA, setPolyA] = useState<number>(2);
  const [polyB, setPolyB] = useState<number>(3);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'जोड र घटाउमा सजातीय पदहरू मिलाइन्छ, घटाउँदा ब्र्याकेटभित्रको चिन्ह उल्टिन्छ, र गुणनमा वितरण नियम लागू हुन्छ!',
        'In addition/subtraction, group like terms; subtraction flips bracket signs; multiplication uses distributive law!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'add', np: '१. व्यञ्जकहरूको जोड (Addition)', en: '1. Addition' },
            { id: 'sub', np: '२. व्यञ्जकहरूको घटाउ (Subtraction)', en: '2. Subtraction' },
            { id: 'mul-mono', np: '३. एकपदी गुणन (3x × 2x)', en: '3. Monomial Mul' },
            { id: 'mul-poly', np: '४. द्विपदी गुणन र आयत मोडल', en: '4. (x+2)(x+3) Area Model' },
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

        {/* TAB 1: Addition */}
        {activeTab === 'add' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('बीजगणितीय व्यञ्जकहरूको जोड (Addition of Expressions)', 'Addition of Expressions')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: (३x + २) र (५x + ४) लाई जोड्दा सजातीय पदहरू एक ठाउँमा ल्याइन्छ:',
                'Textbook Example: Adding (3x + 2) and (5x + 4) by grouping like terms:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1' }}>
                  पहिलो व्यञ्जक: ({addA1}x + {addC1})
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={addA1}
                    onChange={(e) => setAddA1(parseInt(e.target.value))}
                    style={{ width: 100 }}
                  />
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={addC1}
                    onChange={(e) => setAddC1(parseInt(e.target.value))}
                    style={{ width: 100 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                  दोस्रो व्यञ्जक: ({addA2}x + {addC2})
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={addA2}
                    onChange={(e) => setAddA2(parseInt(e.target.value))}
                    style={{ width: 100 }}
                  />
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={addC2}
                    onChange={(e) => setAddC2(parseInt(e.target.value))}
                    style={{ width: 100 }}
                  />
                </div>
              </div>
            </div>

            {/* Step-by-Step Card */}
            <div
              style={{
                background: '#F0FDF4',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #BBF7D0',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('१. जोड्ने रूप:', '1. Expression:')}</strong> ({addA1}x + {addC1}) + ({addA2}x + {addC2})
              </div>
              <div>
                <strong>{L('२. सजातीय पदहरू एकै ठाउँमा राख्दा:', '2. Grouping like terms:')}</strong> ({addA1}x +{' '}
                {addA2}x) + ({addC1} + {addC2})
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#166534',
                }}
              >
                = {addA1 + addA2}x + {addC1 + addC2}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Subtraction */}
        {activeTab === 'sub' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('व्यञ्जकहरूको घटाउ (Subtraction with Sign Changes)', 'Subtraction with Sign Changes')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: (७x + ५) बाट (३x + २) घटाउँदा ब्र्याकेट खोल्दा चिन्ह बदलिन्छ (- ३x - २):',
                'Textbook Example: Subtracting (3x + 2) flips signs when removing brackets (- 3x - 2):'
              )}
            </p>

            <div
              style={{
                background: '#FEF2F2',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #FECACA',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div>
                <strong>{L('१. घटाउ रूप:', '1. Subtraction Problem:')}</strong> ({subA1}x + {subC1}) - ({subA2}x + {subC2})
              </div>
              <div>
                <strong>{L('२. ब्र्याकेट खोल्दा (चिन्ह परिवर्तन):', '2. Removing brackets (sign inversion):')}</strong>{' '}
                {subA1}x + {subC1} - {subA2}x - {subC2}
              </div>
              <div>
                <strong>{L('३. सजातीय पदहरू मिलाउँदा:', '3. Grouping like terms:')}</strong> ({subA1}x - {subA2}x) + ({' '}
                {subC1} - {subC2} )
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#991B1B',
                }}
              >
                = {subA1 - subA2}x + {subC1 - subC2}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Monomial Mul */}
        {activeTab === 'mul-mono' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('एकपदी पदहरूको गुणन (Multiplication of Monomials: 3x × 2x)', 'Multiplication of Monomials')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'गुणांकहरू आपसमा गुणन हुन्छन् र समान चलका घातहरू जोडिन्छन्: (३ × २) × (x × x) = ६x²।',
                'Coefficients multiply together, and powers of like variables add together.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1' }}>
                  पहिलो गुणांक: {monoCoeff1}
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={monoCoeff1}
                  onChange={(e) => setMonoCoeff1(parseInt(e.target.value))}
                  style={{ width: 140, display: 'block', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                  दोस्रो गुणांक: {monoCoeff2}
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={monoCoeff2}
                  onChange={(e) => setMonoCoeff2(parseInt(e.target.value))}
                  style={{ width: 140, display: 'block', marginTop: 4 }}
                />
              </div>
            </div>

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
                <strong>{L('गुणन:', 'Problem:')}</strong> {monoCoeff1}x × {monoCoeff2}x
              </div>
              <div>
                = ({monoCoeff1} × {monoCoeff2}) × (x¹ × x¹)
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#3730A3',
                }}
              >
                = {monoCoeff1 * monoCoeff2}x²
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Polynomial Multiplication (Area Model) */}
        {activeTab === 'mul-poly' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('द्विपदी गुणन र आयत मोडल (x + 2)(x + 3)', 'Polynomial Multiplication & Area Model')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: (x + २)(x + ३) लाई वितरण नियम वा आयताकार क्षेत्रफल मोडलबाट गुणन गर्दा:',
                'Textbook Example: (x + 2)(x + 3) via distributive law or rectangular area model:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1' }}>
                  मान a: {polyA}
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={polyA}
                  onChange={(e) => setPolyA(parseInt(e.target.value))}
                  style={{ width: 140, display: 'block', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                  मान b: {polyB}
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={polyB}
                  onChange={(e) => setPolyB(parseInt(e.target.value))}
                  style={{ width: 140, display: 'block', marginTop: 4 }}
                />
              </div>
            </div>

            {/* Step-by-Step Card */}
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
                <strong>{L('१. वितरण नियम (Distributive Law):', '1. Distributive Law:')}</strong> (x + {polyA})(x +{' '}
                {polyB})
              </div>
              <div>
                = x(x + {polyB}) + {polyA}(x + {polyB})
              </div>
              <div>
                = (x² + {polyB}x) + ({polyA}x + {polyA * polyB})
              </div>
              <div>
                = x² + ({polyB} + {polyA})x + {polyA * polyB}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#065F46',
                }}
              >
                = x² + {polyA + polyB}x + {polyA * polyB}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default AlgebraicAddSubMulStudio;
