/**
 * AlgebraicDivisionLab.tsx
 * Grade 7 Mathematics – Lesson 11: ALGEBRAIC EXPRESSION (बीजगणितीय व्यञ्जक)
 * Simulation 3: Algebraic Division and Long Division Lab (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 157-160)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Divide, Check, RefreshCw, ArrowRight, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: '६x² ÷ ३x गर्दा भागफल (Quotient) कति हुन्छ?',
    en: 'What is the quotient of 6x² ÷ 3x?',
    options: [
      { key: 'A', label: '२x (६÷३ = २ र x²÷x = x)' },
      { key: 'B', label: '२x²' },
      { key: 'C', label: '३x' },
      { key: 'D', label: '२' },
    ],
    answer: 'A',
  },
  {
    np: '(२x² - ३x + ७) लाई (२x - १) ले लामो भाग (Long division) गर्दा भागफल र शेषफल कति हुन्छ?',
    en: 'Dividing (2x² - 3x + 7) by (2x - 1) gives what quotient and remainder?',
    options: [
      { key: 'A', label: 'भागफल = x - १, शेषफल = ६ (Quotient = x - 1, Remainder = 6)' },
      { key: 'B', label: 'भागफल = x + १, शेषफल = ०' },
      { key: 'C', label: 'भागफल = २x, शेषफल = ७' },
      { key: 'D', label: 'भागफल = x, शेषफल = ४' },
    ],
    answer: 'A',
  },
  {
    np: 'भाज्य (Dividend), भाजक (Divisor), भागफल (Quotient) र शेषफल (Remainder) को सम्बन्ध कुन हो?',
    en: 'What is the division verification formula?',
    options: [
      { key: 'A', label: 'भाज्य = भाजक × भागफल + शेषफल (Dividend = Divisor × Quotient + Remainder)' },
      { key: 'B', label: 'भाज्य = भाजक + भागफल + शेषफल' },
      { key: 'C', label: 'भाज्य = भाजक ÷ भागफल' },
      { key: 'D', label: 'भाज्य = भागफल - शेषफल' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा आयतको क्षेत्रफल (x² - y²) र चौडाइ (x - y) भए लम्बाइ कति हुन्छ?',
    en: 'If a rectangle area is (x² - y²) and breadth is (x - y), what is the length?',
    options: [
      { key: 'A', label: 'x + y [ (x² - y²) ÷ (x - y) = x + y ]' },
      { key: 'B', label: 'x - y' },
      { key: 'C', label: '२x + y' },
      { key: 'D', label: 'xy' },
    ],
    answer: 'A',
  },
];

export const AlgebraicDivisionLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L11-03',
    titleEn: 'Algebraic Division and Long Division Lab',
    titleNp: 'बीजगणितीय भाग र लामो भाग प्रयोगशाला',
    chapter: 11,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'mono' | 'long-div' | 'exact' | 'verify'>('long-div');

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'बीजगणितीय लामो भाग गर्दा पहिलो पदलाई मिलाएर भाग गरिन्छ, गुणा गरी घटाइन्छ, र भाज्य = भाजक × भागफल + शेषफल प्रमाणित गरिन्छ!',
        'In polynomial long division, divide leading terms, subtract, and verify: Dividend = Divisor × Quotient + Remainder!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'mono', np: '१. एकपदीय भाग (6x² ÷ 3x)', en: '1. Monomial Division' },
            { id: 'long-div', np: '२. बहुपद लामो भाग (2x² - 3x + 7) ÷ (2x - 1)', en: '2. Polynomial Long Div' },
            { id: 'exact', np: '३. निःशेष भाग (x² + 7x + 10) ÷ (x + 2)', en: '3. Exact Division' },
            { id: 'verify', np: '४. भाग परीक्षण र आयतको लम्बाइ', en: '4. Verification & Geometry' },
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

        {/* TAB 1: Monomial */}
        {activeTab === 'mono' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('एकपदीय व्यञ्जकहरूको भाग (Division of Monomials)', 'Division of Monomials')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'गुणांकलाई गुणांकले भाग गरिन्छ र समान चलको घाताङ्क घटाइन्छ (xᵐ ÷ xⁿ = xᵐ⁻ⁿ):',
                'Coefficients are divided, and powers of like variables are subtracted (xᵐ ÷ xⁿ = xᵐ⁻ⁿ):'
              )}
            </p>

            <div
              style={{
                background: '#F0FDF4',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #BBF7D0',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div>
                <strong>{L('समस्या:', 'Problem:')}</strong> ६x² ÷ ३x
              </div>
              <div>= (६ ÷ ३) × (x² ÷ x¹)</div>
              <div>= २ × x²⁻¹</div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#166534',
                }}
              >
                = २x
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Polynomial Long Division (Textbook Page 158) */}
        {activeTab === 'long-div' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('बहुपद लामो भाग विधि (Long Division: (2x² - 3x + 7) ÷ (2x - 1))', 'Polynomial Long Division')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ १५८ को लामो भागको तालिका र चरणहरू:',
                'Step-by-step table from Textbook Page 158:'
              )}
            </p>

            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 16,
                background: '#F8FAFC',
                padding: 20,
                borderRadius: 10,
                border: '2px solid #CBD5E1',
                lineHeight: 1.8,
                margin: '16px 0',
              }}
            >
              <div style={{ color: '#0369A1', fontWeight: 'bold' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x - १ &nbsp;&nbsp;(भागफल / Quotient)
              </div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_______________</div>
              <div>२x - १ ) २x² - ३x + ७</div>
              <div style={{ color: '#DC2626' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;२x² - &nbsp;x &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ x(२x - १) ]
              </div>
              <div style={{ color: '#64748B' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(-) &nbsp;(+) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(घटाउँदा चिन्ह परिवर्तन)
              </div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;----------------</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-२x + ७ &nbsp;&nbsp;(तल झारियो)</div>
              <div style={{ color: '#DC2626' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-२x + १ &nbsp;&nbsp;[ -१(२x - १) ]
              </div>
              <div style={{ color: '#64748B' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(+) &nbsp;(-) &nbsp;&nbsp;(चिन्ह परिवर्तन)
              </div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;---------</div>
              <div style={{ color: '#166534', fontWeight: 'bold' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;६ &nbsp;&nbsp;(शेषफल / Remainder)
              </div>
            </div>

            {/* Results Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              <div style={{ background: '#EFF6FF', padding: 14, borderRadius: 8, border: '1px solid #BFDBFE' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8' }}>
                  {L('भागफल (Quotient - Q)', 'Quotient (Q)')}
                </span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>
                  x - १ (x - 1)
                </div>
              </div>

              <div style={{ background: '#F0FDF4', padding: 14, borderRadius: 8, border: '1px solid #BBF7D0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#15803D' }}>
                  {L('शेषफल (Remainder - R)', 'Remainder (R)')}
                </span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#16A34A', marginTop: 4 }}>
                  ६ (6)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Exact Division */}
        {activeTab === 'exact' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('निःशेष भाग (Exact Division: (x² + 7x + 10) ÷ (x + 2))', 'Exact Division')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: (x² + ७x + १०) लाई (x + २) ले भाग गर्दा शेषफल शून्य (०) आउँछ:',
                'Textbook Example: (x² + 7x + 10) ÷ (x + 2) leaves Remainder = 0:'
              )}
            </p>

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
                <strong>{L('१. अंशको खण्डीकरण (Factoring):', '1. Factoring Numerator:')}</strong> x² + ७x + १० = (x + २)(x + ५)
              </div>
              <div>
                <strong>{L('२. भाग गर्दा:', '2. Dividing:')}</strong> [ (x + २)(x + ५) ] ÷ (x + २)
              </div>
              <div>
                <strong>{L('३. साझा (x + २) काट्दा:', '3. Cancelling (x + 2):')}</strong>
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                {L('भागफल = x + ५, शेषफल = ०', 'Quotient = x + 5, Remainder = 0')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Verification & Geometry */}
        {activeTab === 'verify' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('भाग परीक्षण र आयतको लम्बाइ (Verification & Rectangle Dimension)', 'Verification & Geometry')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'भाज्य = भाजक × भागफल + शेषफल सुत्र प्रमाणित गरौँ:',
                'Verify Dividend = Divisor × Quotient + Remainder:'
              )}
            </p>

            <div
              style={{
                background: '#EEF2FF',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #C7D2FE',
                lineHeight: 2,
                marginBottom: 16,
              }}
            >
              <div>
                <strong>{L('परीक्षण सूत्र:', 'Formula:')}</strong> भाजक × भागफल + शेषफल
              </div>
              <div>= (२x - १)(x - १) + ६</div>
              <div>= [ २x(x - १) - १(x - १) ] + ६</div>
              <div>= (२x² - २x - x + १) + ६</div>
              <div>= २x² - ३x + १ + ६</div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#3730A3',
                }}
              >
                = २x² - ३x + ७ = भाज्य (प्रमाणित भयो / Verified!)
              </div>
            </div>

            {/* Geometric Application */}
            <div
              style={{
                background: '#ECFDF5',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #6EE7B7',
                lineHeight: 1.8,
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', color: '#065F46' }}>
                📐 {L('पाठ्यपुस्तक ज्यामितीय समस्या (Rectangle Application):', 'Textbook Geometry Problem:')}
              </h4>
              <p style={{ margin: 0, fontSize: 14, color: '#047857' }}>
                {L(
                  'यदि एउटा आयतको क्षेत्रफल (x² - y²) र चौडाइ (x - y) भए लम्बाइ = क्षेत्रफल ÷ चौडाइ = (x² - y²) ÷ (x - y) = (x - y)(x + y) ÷ (x - y) = (x + y) हुन्छ।',
                  'If rectangle Area = x² - y² and Breadth = x - y, then Length = Area ÷ Breadth = x + y.'
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default AlgebraicDivisionLab;
