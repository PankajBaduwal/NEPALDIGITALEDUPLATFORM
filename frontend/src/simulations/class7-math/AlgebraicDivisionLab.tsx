/**
 * AlgebraicDivisionLab.tsx
 * Grade 7 Mathematics – Lesson 11: ALGEBRAIC EXPRESSION
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
    np: '6x² ÷ 3x गर्दा भागफल (Quotient) कति हुन्छ?',
    en: 'What is the quotient of 6x² ÷ 3x?',
    options: [
      { key: 'A', label: '2x' },
      { key: 'B', label: '2x²' },
      { key: 'C', label: '3x' },
      { key: 'D', label: '2' },
    ],
    answer: 'A',
  },
  {
    np: '(2x² - 3x + 7) लाई (2x - 1) ले लामो भाग (Long division) गर्दा भागफल र शेषफल कति हुन्छ?',
    en: 'Dividing (2x² - 3x + 7) by (2x - 1) gives what quotient and remainder?',
    options: [
      { key: 'A', label: 'Quotient = x - 1, Remainder = 6' },
      { key: 'B', label: 'Quotient = x + 1, Remainder = 0' },
      { key: 'C', label: 'Quotient = 2x, Remainder = 7' },
      { key: 'D', label: 'Quotient = x, Remainder = 4' },
    ],
    answer: 'A',
  },
  {
    np: 'भाज्य (Dividend), भाजक (Divisor), भागफल (Quotient) र शेषफल (Remainder) को सम्बन्ध कुन हो?',
    en: 'What is the division verification formula?',
    options: [
      { key: 'A', label: 'Dividend = Divisor × Quotient + Remainder' },
      { key: 'B', label: 'Dividend = Divisor + Quotient + Remainder' },
      { key: 'C', label: 'Dividend = Divisor ÷ Quotient' },
      { key: 'D', label: 'Dividend = Quotient - Remainder' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा आयतको क्षेत्रफल (x² - y²) र चौडाइ (x - y) भए लम्बाइ कति हुन्छ?',
    en: 'If a rectangle area is (x² - y²) and breadth is (x - y), what is the length?',
    options: [
      { key: 'A', label: 'x + y [ (x² - y²) ÷ (x - y) = x + y ]' },
      { key: 'B', label: 'x - y' },
      { key: 'C', label: '2x + y' },
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
        'बीजगणितीय लामो भाग गर्दा पहिलो पदलाई मिलाएर भाग गरिन्छ, गुणा गरी घटाइन्छ, र भाज्य = Divisor × Quotient + Remainder प्रमाणित गरिन्छ!',
        'In polynomial long division, divide leading terms, subtract, and verify: Dividend = Divisor × Quotient + Remainder!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'mono', np: '1. एकपदीय भाग (6x² ÷ 3x)', en: '1. Monomial Division' },
            { id: 'long-div', np: '2. बहुपद लामो भाग (2x² - 3x + 7) ÷ (2x - 1)', en: '2. Polynomial Long Div' },
            { id: 'exact', np: '3. निःशेष भाग (x² + 7x + 10) ÷ (x + 2)', en: '3. Exact Division' },
            { id: 'verify', np: '4. भाग परीक्षण र आयतको लम्बाइ', en: '4. Verification & Geometry' },
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
                <strong>{L('समस्या:', 'Problem:')}</strong> 6x² ÷ 3x
              </div>
              <div>= (6 ÷ 3) × (x² ÷ x¹)</div>
              <div>= 2 × x²⁻¹</div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#166534',
                }}
              >
                = 2x
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
                'पाठ्यपुस्तक पृष्ठ 158 को लामो भागको तालिका र चरणहरू:',
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
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x - 1 &nbsp;&nbsp;(Quotient)
              </div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_______________</div>
              <div>2x - 1 ) 2x² - 3x + 7</div>
              <div style={{ color: '#DC2626' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2x² - &nbsp;x &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ x(2x - 1) ]
              </div>
              <div style={{ color: '#64748B' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(-) &nbsp;(+) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(sign changes on subtracting)
              </div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;----------------</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2x + 7 &nbsp;&nbsp;(bring down)</div>
              <div style={{ color: '#DC2626' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-2x + 1 &nbsp;&nbsp;[ -1(2x - 1) ]
              </div>
              <div style={{ color: '#64748B' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(+) &nbsp;(-) &nbsp;&nbsp;(sign change)
              </div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;---------</div>
              <div style={{ color: '#166534', fontWeight: 'bold' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6 &nbsp;&nbsp;(Remainder)
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
                  x - 1 (x - 1)
                </div>
              </div>

              <div style={{ background: '#F0FDF4', padding: 14, borderRadius: 8, border: '1px solid #BBF7D0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#15803D' }}>
                  {L('शेषफल (Remainder - R)', 'Remainder (R)')}
                </span>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#16A34A', marginTop: 4 }}>
                  6 (6)
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
                'पाठ्यपुस्तक उदाहरण: (x² + 7x + 10) लाई (x + 2) ले भाग गर्दा शेषफल शून्य (0) आउँछ:',
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
                <strong>{L('1. अंशको खण्डीकरण (Factoring):', '1. Factoring Numerator:')}</strong> x² + 7x + 10 = (x + 2)(x + 5)
              </div>
              <div>
                <strong>{L('2. भाग गर्दा:', '2. Dividing:')}</strong> [ (x + 2)(x + 5) ] ÷ (x + 2)
              </div>
              <div>
                <strong>{L('3. साझा (x + 2) काट्दा:', '3. Cancelling (x + 2):')}</strong>
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                {L('भागफल = x + 5, शेषफल = 0', 'Quotient = x + 5, Remainder = 0')}
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
                'भाज्य = Divisor × Quotient + Remainder सुत्र प्रमाणित गरौँ:',
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
                <strong>{L('परीक्षण सूत्र:', 'Formula:')}</strong> Divisor × Quotient + Remainder
              </div>
              <div>= (2x - 1)(x - 1) + 6</div>
              <div>= [ 2x(x - 1) - 1(x - 1) ] + 6</div>
              <div>= (2x² - 2x - x + 1) + 6</div>
              <div>= 2x² - 3x + 1 + 6</div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#3730A3',
                }}
              >
                = 2x² - 3x + 7 = Dividend (Verified!)
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
