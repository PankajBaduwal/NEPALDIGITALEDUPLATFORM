/**
 * RationalNumberPropertiesLab.tsx
 * Grade 7 Mathematics – Lesson 4: RATIONAL NUMBER
 * Simulation 6: Rational Number Properties Lab (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 70-73)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Check, Sparkles, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'परिमेय सङ्ख्यामा गुणनको तत्समक (Multiplicative Identity) कुन हो?',
    en: 'What is the multiplicative identity for rational numbers?',
    options: [
      { key: 'A', label: '1' },
      { key: 'B', label: '0' },
      { key: 'C', label: '-1' },
      { key: 'D', label: '2' },
    ],
    answer: 'A',
  },
  {
    np: '2/3 को गुणन प्रतिलोम (Multiplicative Inverse / Reciprocal) कति हुन्छ?',
    en: 'What is the multiplicative inverse (reciprocal) of 2/3?',
    options: [
      { key: 'A', label: '3/2' },
      { key: 'B', label: '-2/3' },
      { key: 'C', label: '1' },
      { key: 'D', label: '0' },
    ],
    answer: 'A',
  },
  {
    np: 'कुन सङ्ख्याको गुणन प्रतिलोम (Multiplicative Inverse) हुँदैन?',
    en: 'Which number does NOT have a multiplicative inverse?',
    options: [
      { key: 'A', label: 'Zero (0)' },
      { key: 'B', label: '1' },
      { key: 'C', label: '-1' },
      { key: 'D', label: '2' },
    ],
    answer: 'A',
  },
  {
    np: '(1/2 + 1/3) + 1/4 = 1/2 + (1/3 + 1/4) कुन गुण हो?',
    en: '(1/2 + 1/3) + 1/4 = 1/2 + (1/3 + 1/4) demonstrates which property?',
    options: [
      { key: 'A', label: 'Associative property' },
      { key: 'B', label: 'Commutative property' },
      { key: 'C', label: 'Closure property' },
      { key: 'D', label: 'Identity property' },
    ],
    answer: 'A',
  },
];

export const RationalNumberPropertiesLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L4-02',
    titleEn: 'Rational Number Properties Lab',
    titleNp: 'परिमेय सङ्ख्याका गुणहरू प्रयोगशाला',
    chapter: 4,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'identity' | 'inverse' | 'commutative' | 'associative' | 'closure'>('identity');

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'परिमेय सङ्ख्याका 5 मुख्य गुणहरू छन्: तत्समक, प्रतिलोम, क्रमविनिमेय, साहचर्य, र संवृत। शून्यको गुणन प्रतिलोम हुँदैन!',
        'Explore 5 key rational properties: Identity, Inverse, Commutative, Associative, and Closure. Note that 0 has no reciprocal!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'identity', np: '1. Identity property (Identity: 0 & 1)', en: '1. Identity (0 & 1)' },
            { id: 'inverse', np: '2. प्रतिलोम गुण (Inverse: + & ×)', en: '2. Inverses (+ & ×)' },
            { id: 'commutative', np: '3. Commutative property (Commutative)', en: '3. Commutative' },
            { id: 'associative', np: '4. साहचर्य गुण (Associative)', en: '4. Associative' },
            { id: 'closure', np: '5. Closure property (Closure)', en: '5. Closure' },
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

        {/* ── TAB 1: IDENTITY PROPERTY ─────────────────────── */}
        {activeTab === 'identity' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक गुण 1', 'Textbook Property 1 (Page 70)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('Identity property', 'Identity Property: 0 for Addition, 1 for Multiplication')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 6 }}>
                  Additive identity (0)
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#134E4A', margin: '8px 0' }}>
                  3/4 + 0 = 3/4
                </div>
                <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>
                  Adding zero to any rational number does not change its value: a + 0 = a.
                </p>
              </div>

              <div style={{ background: '#DCFCE7', border: '2px solid #86EFAC', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#166534', marginBottom: 6 }}>
                  Multiplicative identity (1)
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#14532D', margin: '8px 0' }}>
                  3/4 × 1 = 3/4
                </div>
                <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>
                  Multiplying any rational number by 1 keeps its value the same: a × 1 = a.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: INVERSE PROPERTY ──────────────────────── */}
        {activeTab === 'inverse' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक गुण 2', 'Textbook Property 2 (Page 71)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('प्रतिलोम गुण (Additive Inverse & Multiplicative Inverse)', 'Inverse Properties: Additive and Reciprocal')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 6 }}>
                  1. Additive inverse
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '8px 0' }}>
                  1/2 + (-1/2) = 0
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                  The sum of a number and its opposite is always zero: a + (-a) = 0.
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 6 }}>
                  2. Multiplicative inverse (reciprocal)
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '8px 0' }}>
                  2/3 × 3/2 = 1
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                  Multiplying after inverting the numerator and denominator gives 1: (a/b) × (b/a) = 1.
                </div>
              </div>
            </div>

            {/* Zero has no reciprocal warning banner */}
            <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#991B1B', marginBottom: 4 }}>
                ⚠️ Important exception:
              </div>
              <div style={{ fontSize: 13, color: '#7F1D1D' }}>
                Zero (0) has no multiplicative inverse, because 1/0 is undefined!
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: COMMUTATIVE PROPERTY ──────────────────── */}
        {activeTab === 'commutative' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('Commutative property (Commutative Property: a + b = b + a)', 'Commutative Property: a + b = b + a')}
            </h3>
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F766E', marginBottom: 8 }}>
                1/2 + 1/3 = 3/6 + 2/6 = 5/6<br />
                1/3 + 1/2 = 2/6 + 3/6 = 5/6
              </div>
              <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>
                Changing the order when adding or multiplying gives the same final result.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 4: ASSOCIATIVE PROPERTY ──────────────────── */}
        {activeTab === 'associative' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('साहचर्य गुण (Associative Property: (a+b)+c = a+(b+c))', 'Associative Property: Grouping does not change sum')}
            </h3>
            <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#166534', marginBottom: 8 }}>
                (1/2 + 1/3) + 1/4 = 1/2 + (1/3 + 1/4) = 13/12
              </div>
              <p style={{ fontSize: 13, color: '#14532D', margin: 0 }}>
                Regrouping with brackets also leaves the result of addition and multiplication the same.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 5: CLOSURE PROPERTY ──────────────────────── */}
        {activeTab === 'closure' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('Closure property (Closure Property in Q)', 'Closure Property in Rational Numbers')}
            </h3>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 14, color: '#1E293B', lineHeight: 1.8 }}>
                <div>• The sum of two rational numbers is always a rational number: a + b ∈ Q</div>
                <div>• The difference of two rational numbers is always a rational number: a - b ∈ Q</div>
                <div>• The product of two rational numbers is always a rational number: a × b ∈ Q</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default RationalNumberPropertiesLab;
