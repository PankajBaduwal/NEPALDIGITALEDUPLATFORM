/**
 * FractionDecimalConversionStudio.tsx
 * Grade 7 Mathematics – Lesson 4: RATIONAL NUMBER
 * Simulation 7: Fraction and Decimal Conversion Studio (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 73-76)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Sparkles, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'सान्त दशमलव (Terminating Decimal) को विशेषता कुन हो?',
    en: 'What is the characteristic of a terminating decimal?',
    options: [
      { key: 'A', label: 'The digits after the decimal point end after a finite number of places (for example 0.25)' },
      { key: 'B', label: 'The digits after the decimal point repeat forever' },
      { key: 'C', label: 'Only zero always comes' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
  {
    np: '0.333... (0.3̄) लाई भिन्नमा रूपान्तरण गर्दा कति हुन्छ?',
    en: 'Converting 0.333... (0.3̄) into a fraction gives what value?',
    options: [
      { key: 'A', label: '1/3 (9x = 3 ⟹ x = 3/9 = 1/3)' },
      { key: 'B', label: '3/10' },
      { key: 'C', label: '1/9' },
      { key: 'D', label: '3/100' },
    ],
    answer: 'A',
  },
  {
    np: '0.75 लाई सरल भिन्न (Lowest terms) मा रूपान्तरण गर्दा कति हुन्छ?',
    en: 'What is 0.75 in simplified lowest terms fraction?',
    options: [
      { key: 'A', label: '3/4 (75/100 = 3/4)' },
      { key: 'B', label: '7/5' },
      { key: 'C', label: '1/2' },
      { key: 'D', label: '4/3' },
    ],
    answer: 'A',
  },
  {
    np: '1/2 र 5/6 को ठीक बीचको परिमेय सङ्ख्या निकाल्ने सुत्र कुन हो?',
    en: 'Which method finds the rational number exactly midway between 1/2 and 5/6?',
    options: [
      { key: 'A', label: 'Mean method: (1/2 + 5/6) ÷ 2 = 2/3' },
      { key: 'B', label: 'Multiplication method: 1/2 × 5/6' },
      { key: 'C', label: 'Subtraction method: 5/6 - 1/2' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
];

export const FractionDecimalConversionStudio: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L4-03',
    titleEn: 'Fraction & Decimal Conversion Studio',
    titleNp: 'भिन्न र दशमलव रूपान्तरण प्रयोगशाला',
    chapter: 4,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'terminating_recurring' | 'dec_to_frac' | 'recurring_frac' | 'between_rationals'>('terminating_recurring');

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'भिन्नलाई दशमलवमा बदल्दा सान्त (Terminating) वा दोहोरिने (Recurring) दशमलव बन्दछ। बीचको परिमेय सङ्ख्या औसत विधिबाट पत्ता लगाइन्छ!',
        'Converting fractions results in terminating or recurring decimals. Midpoint rational numbers are found using the average method!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'terminating_recurring', np: '1. सान्त र दोहोरिने दशमलव', en: '1. Terminating vs Recurring' },
            { id: 'dec_to_frac', np: '2. सान्त दशमलवबाट भिन्न (0.75 = 3/4)', en: '2. Terminating to Fraction' },
            { id: 'recurring_frac', np: '3. दोहोरिने दशमलवबाट भिन्न (10x - x)', en: '3. Recurring to Fraction (10x - x)' },
            { id: 'between_rationals', np: '4. दुई परिमेय सङ्ख्याको बीचको सङ्ख्या', en: '4. Between Two Rationals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveTab(tab.id as any);
              }}
              style={{
                flex: '1 1 auto',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? '#0F766E' : '#F8FAFC',
                color: activeTab === tab.id ? '#FFFFFF' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              {isNe ? tab.np : tab.en}
            </button>
          ))}
        </div>

        {/* ── TAB 1: TERMINATING VS RECURRING ──────────────── */}
        {activeTab === 'terminating_recurring' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक वर्गीकरण (पृष्ठ 73-74)', 'Textbook Types (Pages 73-74)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('सान्त दशमलव (Terminating) र दोहोरिने दशमलव (Recurring) को तुलना', 'Terminating vs. Non-Terminating Recurring Decimals')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {/* Terminating */}
              <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#166534', marginBottom: 8 }}>
                  1. Terminating decimals
                </div>
                <div style={{ fontSize: 14, color: '#14532D', lineHeight: 1.8 }}>
                  • 1/2 = <strong>0.5</strong> (remainder 0)<br />
                  • 1/4 = <strong>0.25</strong> (remainder 0)<br />
                  • 1/8 = <strong>0.125</strong> (ends at a fixed place)
                </div>
              </div>

              {/* Recurring */}
              <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#92400E', marginBottom: 8 }}>
                  2. Non-terminating recurring decimals
                </div>
                <div style={{ fontSize: 14, color: '#78350F', lineHeight: 1.8 }}>
                  • 1/3 = <strong>0.333... (0.3̄)</strong><br />
                  • 4/11 = <strong>0.3636... (0.36̄)</strong><br />
                  • 2/7 = <strong>0.285714285714...</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: TERMINATING TO FRACTION ───────────────── */}
        {activeTab === 'dec_to_frac' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('सान्त दशमलवलाई सरल भिन्नमा रूपान्तरण गर्ने विधि', 'Converting Terminating Decimals to Simplified Fractions')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E', marginBottom: 8 }}>
                Example 1: 0.75
              </div>
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.8 }}>
                <div>• There are 2 places after the decimal point, so write 100 in the denominator: <strong>75/100</strong></div>
                <div>• Dividing both numerator and denominator by 25: (75 ÷ 25) / (100 ÷ 25) = <strong>3/4</strong></div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E', marginBottom: 8 }}>
                Example 2: 0.125
              </div>
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.8 }}>
                <div>• There are 3 places after the decimal point, so write 1000 in the denominator: <strong>125/1000</strong></div>
                <div>• Dividing by 125: <strong>1/8</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: RECURRING TO FRACTION ─────────────────── */}
        {activeTab === 'recurring_frac' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक बीजीय विधि (पृष्ठ 75)', 'Textbook Algebraic Method (Page 75)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('10x - x घटाउ विधिद्वारा 0.333... लाई भिन्नमा बदल्ने', 'Converting 0.333... into Fraction using 10x - x')}
            </h3>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 14, color: '#134E4A', lineHeight: 2 }}>
                <div>Let x = 0.333... --------- (Equation 1)</div>
                <div>Multiplying both sides by 10: 10x = 3.333... --------- (Equation 2)</div>
                <div>Subtracting Equation (1) from (2): 10x - x = 3.333... - 0.333...</div>
                <div>9x = 3</div>
                <div>x = 3/9</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F766E', marginTop: 6 }}>
                  x = <strong>1/3</strong> (final simplest fraction)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: BETWEEN TWO RATIONAL NUMBERS ──────────── */}
        {activeTab === 'between_rationals' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक औसत विधि (पृष्ठ 75-76)', 'Textbook Average Method (Pages 75-76)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('1/2 र 5/6 को बीचमा पर्ने दुईpcs परिमेय सङ्ख्याहरू पत्ता लगाउने', 'Finding Two Rational Numbers Between 1/2 and 5/6')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 14, color: '#1E293B', lineHeight: 2 }}>
                <div><strong>First number (mean):</strong> (1/2 + 5/6) ÷ 2 = (3/6 + 5/6) ÷ 2 = (8/6) ÷ 2 = 4/6 = <strong>2/3</strong></div>
                <div><strong>Second number:</strong> (mean of 1/2 and 2/3) = (1/2 + 2/3) ÷ 2 = (3/6 + 4/6) ÷ 2 = (7/6) ÷ 2 = <strong>7/12</strong></div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E', marginTop: 10 }}>
                  ✓ Two rational numbers between 1/2 and 5/6: <strong>7/12 and 2/3</strong> .
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default FractionDecimalConversionStudio;
