/**
 * RationalNumberDiscoveryLab.tsx
 * Grade 7 Mathematics – Lesson 4: RATIONAL NUMBER
 * Simulation 5: Rational Number Discovery Lab (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 67-71)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Layers, Sparkles, Check, HelpCircle, ArrowRight } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'a/b को रूपमा लेख्न सकिने सङ्ख्यालाई के भनिन्छ, जहाँ a र b पूर्णाङ्क हुन् र b ≠ 0?',
    en: 'What is a number called that can be expressed as a/b, where a and b are integers and b ≠ 0?',
    options: [
      { key: 'A', label: 'Rational number' },
      { key: 'B', label: 'Irrational number' },
      { key: 'C', label: 'Negative integers only' },
      { key: 'D', label: 'Natural numbers only' },
    ],
    answer: 'A',
  },
  {
    np: 'परिमेय सङ्ख्या a/b मा हर (Denominator: b) को मान किन शून्य (0) हुन सक्दैन?',
    en: 'Why can the denominator b never be zero (0) in a rational number a/b?',
    options: [
      { key: 'A', label: 'Because dividing by zero gives an infinite or undefined value' },
      { key: 'B', label: 'Because zero is a small number' },
      { key: 'C', label: 'It is just a rule' },
      { key: 'D', label: 'None of the above' },
    ],
    answer: 'A',
  },
  {
    np: 'सङ्ख्या पद्धतिहरूको समावेशी सम्बन्ध कुन सही छ?',
    en: 'Which nested subset relation correctly represents the number systems?',
    options: [
      { key: 'A', label: 'N ⊂ W ⊂ Z ⊂ Q' },
      { key: 'B', label: 'Q ⊂ Z ⊂ W ⊂ N' },
      { key: 'C', label: 'Z ⊂ N ⊂ Q ⊂ W' },
      { key: 'D', label: 'W ⊂ N ⊂ Z ⊂ Q' },
    ],
    answer: 'A',
  },
  {
    np: 'के शून्य (0) एउटा परिमेय सङ्ख्या हो?',
    en: 'Is zero (0) a rational number?',
    options: [
      { key: 'A', label: 'Yes, because 0 can be written as 0/1' },
      { key: 'B', label: 'No' },
      { key: 'C', label: 'Only positive' },
      { key: 'D', label: 'Do not know' },
    ],
    answer: 'A',
  },
];

export const RationalNumberDiscoveryLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L4-01',
    titleEn: 'Rational Number Discovery Lab',
    titleNp: 'परिमेय सङ्ख्या खोजी प्रयोगशाला',
    chapter: 4,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'why_needed' | 'builder' | 'nested_sets' | 'zero_rational'>('why_needed');

  // Interactive Fraction Builder State
  const [numA, setNumA] = useState<number>(3);
  const [denB, setDenB] = useState<number>(4);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'दुई पूर्णाङ्कहरूको भाग सधैं पूर्णाङ्क हुँदैन (जस्तै 3 ÷ 4 = 3/4), त्यसैले हामीलाई rational numbers (Q) चाहिन्छ!',
        'Integer division does not always result in an integer (e.g., 3 ÷ 4 = 3/4). This introduces the set of Rational Numbers (Q)!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'why_needed', np: '1. परिमेय सङ्ख्या किन चाहियो?', en: '1. Why Rational Numbers?' },
            { id: 'builder', np: '2. a/b निर्माणशाला (Builder)', en: '2. a/b Fraction Builder' },
            { id: 'nested_sets', np: '3. सङ्ख्या प्रणाली सम्बन्ध (N ⊂ W ⊂ Z ⊂ Q)', en: '3. Number Systems (N ⊂ W ⊂ Z ⊂ Q)' },
            { id: 'zero_rational', np: '4. शून्य र पूर्णाङ्कको परिमेय रूप', en: '4. Zero & Integers as Q' },
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

        {/* ── TAB 1: WHY DO WE NEED RATIONAL NUMBERS? ─────── */}
        {activeTab === 'why_needed' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक पृष्ठभूमि (पृष्ठ 67)', 'Textbook Background (Page 67)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('पूर्णाङ्कहरूको भाग र परिमेय सङ्ख्याको आवश्यकता', 'Integer Operations & The Need for Rational Numbers')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>Addition</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#166534', marginTop: 4 }}>3 + (-4) = -1 ∈ ℤ</div>
                <div style={{ fontSize: 11, color: '#16A34A', marginTop: 2 }}>✓ It is an integer</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>Subtraction</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#166534', marginTop: 4 }}>3 - (-4) = +7 ∈ ℤ</div>
                <div style={{ fontSize: 11, color: '#16A34A', marginTop: 2 }}>✓ It is an integer</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>Multiplication</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#166534', marginTop: 4 }}>3 × (-4) = -12 ∈ ℤ</div>
                <div style={{ fontSize: 11, color: '#16A34A', marginTop: 2 }}>✓ It is an integer</div>
              </div>

              <div style={{ background: '#FEE2E2', padding: 16, borderRadius: 14, border: '2px solid #DC2626' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#991B1B' }}>Division</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#7F1D1D', marginTop: 4 }}>3 ÷ (-4) = -3/4 ∉ ℤ</div>
                <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 800, marginTop: 2 }}>✗ Not an integer!</div>
              </div>
            </div>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 18, borderRadius: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F766E', marginBottom: 4 }}>
                💡 Conclusion:
              </div>
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
                The quotient of two integers is not always an integer. To express such numbers, we need <strong>rational numbers (Q)</strong> .
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: BUILDER a/b ───────────────────────────── */}
        {activeTab === 'builder' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('a/b परिमेय सङ्ख्या निर्माणशाला (जहाँ b ≠ 0)', 'Rational Number Builder: a/b (where b ≠ 0)')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 8 }}>
                  Numerator (a): <strong>{numA > 0 ? `+${isNe ? toNp(numA) : numA}` : isNe ? toNp(numA) : numA}</strong>
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[-4, -3, -1, 0, 1, 3, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setNumA(val)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: numA === val ? '2px solid #0F766E' : '1px solid #CBD5E1',
                        background: numA === val ? '#F0FDFA' : '#FFFFFF',
                        color: numA === val ? '#0F766E' : '#334155',
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {val > 0 ? `+${isNe ? toNp(val) : val}` : isNe ? toNp(val) : val}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 8 }}>
                  Denominator (b ≠ 0): <strong>{denB > 0 ? `+${isNe ? toNp(denB) : denB}` : isNe ? toNp(denB) : denB}</strong>
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[-5, -4, -2, 2, 3, 4, 7].map((val) => (
                    <button
                      key={val}
                      onClick={() => setDenB(val)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: denB === val ? '2px solid #0F766E' : '1px solid #CBD5E1',
                        background: denB === val ? '#F0FDFA' : '#FFFFFF',
                        color: denB === val ? '#0F766E' : '#334155',
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {val > 0 ? `+${isNe ? toNp(val) : val}` : isNe ? toNp(val) : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fraction result */}
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F766E', marginBottom: 8 }}>
                {L('निर्मित Rational number:', 'Formed Rational Number:')}
              </div>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', fontSize: 28, fontWeight: 900, color: '#0F172A' }}>
                <span>{numA > 0 ? `+${isNe ? toNp(numA) : numA}` : isNe ? toNp(numA) : numA}</span>
                <span style={{ width: '100%', height: 3, background: '#0F766E', margin: '4px 0' }} />
                <span>{denB > 0 ? `+${isNe ? toNp(denB) : denB}` : isNe ? toNp(denB) : denB}</span>
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>
                {L('दशमलव मान:', 'Decimal value:')} {(numA / denB).toFixed(3)}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: NESTED NUMBER SETS ────────────────────── */}
        {activeTab === 'nested_sets' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक समावेशी सम्बन्ध (पृष्ठ 69)', 'Textbook Inclusion Model (Page 69)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('सङ्ख्या प्रणालीहरूको सम्बन्ध: N ⊂ W ⊂ Z ⊂ Q', 'Number System Relation: N ⊂ W ⊂ Z ⊂ Q')}
            </h3>

            {/* Visual Nested Boxes */}
            <div style={{ padding: 20, background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#166534', marginBottom: 8 }}>
                Q: Rational numbers ( ..., -3/4, -1, 0, 1/2, 2, 5/3, ...)
              </div>
              <div style={{ padding: 16, background: '#EFF6FF', border: '2px solid #93C5FD', borderRadius: 14, marginLeft: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#1E40AF', marginBottom: 8 }}>
                  Z: Integers ( ..., -3, -2, -1, 0, 1, 2, 3, ...)
                </div>
                <div style={{ padding: 14, background: '#FEF3C7', border: '2px solid #FDE68A', borderRadius: 12, marginLeft: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#92400E', marginBottom: 6 }}>
                    W: Whole numbers ( 0, 1, 2, 3, ...)
                  </div>
                  <div style={{ padding: 12, background: '#FFFFFF', border: '2px solid #CBD5E1', borderRadius: 10, marginLeft: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#0F172A' }}>
                      N: Natural numbers ( 1, 2, 3, 4, ...)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: ZERO & INTEGERS AS RATIONAL ────────────── */}
        {activeTab === 'zero_rational' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('प्रत्येक पूर्णाङ्क र शून्य पनि परिमेय सङ्ख्या हुन्', 'Every Integer and Zero is a Rational Number')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E' }}>0 = 0/1 (b ≠ 0)</div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Zero can be written as 0/1, 0/2, so it is a rational number.</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E' }}>5 = 5/1 (b ≠ 0)</div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Every positive integer can be written with 1 in the denominator.</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E' }}>-7 = -7/1 (b ≠ 0)</div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Every negative integer is also a rational number.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default RationalNumberDiscoveryLab;
