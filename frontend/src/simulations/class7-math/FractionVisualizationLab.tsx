/**
 * FractionVisualizationLab.tsx
 * Grade 7 Mathematics – Lesson 5: FRACTION AND DECIMAL
 * Simulation 8: Fraction Visualization and Simplification Lab (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 77-81)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Sparkles, HelpCircle, ArrowRight, RotateCcw, PieChart } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: '12/18 लाई सरलतम रूप (Lowest terms) मा रूपान्तरण गर्दा कति हुन्छ?',
    en: 'What is 12/18 in its lowest terms (simplified fraction)?',
    options: [
      { key: 'A', label: '2/3' },
      { key: 'B', label: '3/4' },
      { key: 'C', label: '4/6' },
      { key: 'D', label: '1/2' },
    ],
    answer: 'A',
  },
  {
    np: '1/3 + 1/2 जोड्दा हर (Denominator) समान बनाउन कति बनाउनुपर्छ?',
    en: 'To add 1/3 + 1/2, what is the common denominator required?',
    options: [
      { key: 'A', label: '5' },
      { key: 'B', label: '6' },
      { key: 'C', label: '3' },
      { key: 'D', label: '2' },
    ],
    answer: 'B',
  },
  {
    np: 'कृपाले केकको 1/2 भाग, अमनले 1/3 भाग र सन्दिपले 1/6 भाग खाए भने कसले सबैभन्दा धेरै खायो?',
    en: 'Kripa ate 1/2 of a cake, Aman ate 1/3, and Sandeep ate 1/6. Who ate the largest portion?',
    options: [
      { key: 'A', label: 'Kripa (1/2 = 3/6)' },
      { key: 'B', label: 'Aman (1/3 = 2/6)' },
      { key: 'C', label: 'Sandeep (1/6)' },
      { key: 'D', label: 'Everyone ate equally' },
    ],
    answer: 'A',
  },
  {
    np: 'तलका मध्ये 1/2 सँग तुल्य भिन्न (Equivalent Fraction) कुन हो?',
    en: 'Which of the following is equivalent to 1/2?',
    options: [
      { key: 'A', label: '2/4' },
      { key: 'B', label: '3/6' },
      { key: 'C', label: '4/8' },
      { key: 'D', label: 'All of the above' },
    ],
    answer: 'D',
  },
];

export const FractionVisualizationLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L5-01',
    titleEn: 'Fraction Visualization & Simplification',
    titleNp: 'भिन्नको दृश्यावलोकन र सरलीकरण प्रयोगशाला',
    chapter: 5,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'bars' | 'equivalent' | 'simplify' | 'add_sub' | 'cake_compare'>('bars');

  // Interactive Fraction Bar State
  const [totalParts, setTotalParts] = useState<number>(6);
  const [shadedParts, setShadedParts] = useState<number>(3);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'भिन्न भनेको कुनै सिङ्गो वस्तुको बराबर भाग हो। भिन्न जोड्न वा तुलना गर्न पहिले हर (Denominator) समान बनाउनुपर्छ!',
        'Fractions represent equal parts of a whole. To add or compare fractions, convert them to a common denominator!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'bars', np: '1. भिन्न पट्टी मोडल (Fraction Bar)', en: '1. Fraction Bar' },
            { id: 'equivalent', np: '2. तुल्य भिन्न (Equivalent: 1/2=2/4)', en: '2. Equivalent Fractions' },
            { id: 'simplify', np: '3. सरलतम रूप (Simplification: 12/18)', en: '3. Simplification' },
            { id: 'add_sub', np: '4. समान हर बनाई जोडघटाउ', en: '4. Common Denominator' },
            { id: 'cake_compare', np: '5. केक बाँडफाँड तुलना (कृपा, अमन, सन्दिप)', en: '5. Cake Sharing Comparison' },
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

        {/* ── TAB 1: FRACTION BAR MODEL ────────────────────── */}
        {activeTab === 'bars' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तक अवधारणा (पृष्ठ 77)', 'Textbook Concept (Page 77)')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('इन्टरएक्टिभ भिन्न पट्टी: छायाँ पारिएका भागहरू छान्नुहोस्', 'Interactive Fraction Bar: Select Shaded Parts')}
                </h3>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0F766E' }}>
                {isNe ? toNp(shadedParts) : shadedParts} / {isNe ? toNp(totalParts) : totalParts}
              </div>
            </div>

            {/* Total Parts Selector */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B', alignSelf: 'center' }}>
                Total equal parts (denominator):
              </span>
              {[2, 3, 4, 6, 8, 10].map((tp) => (
                <button
                  key={tp}
                  onClick={() => {
                    kit.tap();
                    setTotalParts(tp);
                    setShadedParts(Math.min(shadedParts, tp));
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: totalParts === tp ? '2px solid #0F766E' : '1px solid #CBD5E1',
                    background: totalParts === tp ? '#F0FDFA' : '#FFFFFF',
                    color: totalParts === tp ? '#0F766E' : '#334155',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {isNe ? toNp(tp) : tp}
                </button>
              ))}
            </div>

            {/* Interactive Clickable Fraction Bar */}
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 16 }}>
              <div style={{ display: 'flex', width: '100%', height: 60, borderRadius: 12, overflow: 'hidden', border: '3px solid #0F766E' }}>
                {Array.from({ length: totalParts }).map((_, idx) => {
                  const isShaded = idx < shadedParts;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        kit.tap();
                        setShadedParts(idx + 1 === shadedParts ? idx : idx + 1);
                      }}
                      style={{
                        flex: 1,
                        background: isShaded ? '#14B8A6' : '#FFFFFF',
                        borderRight: idx < totalParts - 1 ? '2px solid #CBD5E1' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        color: isShaded ? '#FFFFFF' : '#94A3B8',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      1/{isNe ? toNp(totalParts) : totalParts}
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#64748B', marginTop: 8 }}>
                👆 {L('बाकसमा क्लिक गरी छायाँ पार्नुहोस् वा हटाउनुहोस्', 'Click a segment to toggle shading')}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: EQUIVALENT FRACTIONS ──────────────────── */}
        {activeTab === 'equivalent' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('तुल्य भिन्नहरू (Equivalent Fractions): 1/2 = 2/4 = 3/6 = 4/8', 'Equivalent Fractions: 1/2 = 2/4 = 3/6 = 4/8')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { n: 1, d: 2, label: '1/2' },
                { n: 2, d: 4, label: '2/4' },
                { n: 3, d: 6, label: '3/6' },
                { n: 4, d: 8, label: '4/8' },
              ].map((frac, idx) => (
                <div key={idx} style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ width: 60, fontSize: 16, fontWeight: 900, color: '#0F766E' }}>{frac.label}</span>
                  <div style={{ flex: 1, display: 'flex', height: 32, borderRadius: 8, overflow: 'hidden', border: '2px solid #0F766E' }}>
                    {Array.from({ length: frac.d }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          background: i < frac.n ? '#14B8A6' : '#FFFFFF',
                          borderRight: i < frac.d - 1 ? '1px solid #CBD5E1' : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>= 50%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: SIMPLIFICATION ────────────────────────── */}
        {activeTab === 'simplify' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण (पृष्ठ 78)', 'Textbook Example (Page 78)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('12/18 लाई म.स. (6) ले भाग गरी सरलतम रूप (2/3) मा ल्याउने', 'Simplifying 12/18 to Lowest Terms (2/3) using HCF 6')}
            </h3>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 15, color: '#134E4A', lineHeight: 2 }}>
                <div>1. Common factors of numerator 12 and denominator 18: 1, 2, 3, 6</div>
                <div>2. Highest common factor (HCF) = 6</div>
                <div>3. Dividing both numerator and denominator by 6:</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0F766E', margin: '8px 0' }}>
                  (12 ÷ 6) / (18 ÷ 6) = <strong>2/3</strong>
                </div>
                <div>✓ 2 and 3 now have no common factor other than 1, so 2/3 is the simplest fraction.</div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: COMMON DENOMINATOR ────────────────────── */}
        {activeTab === 'add_sub' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण: 1/3 + 1/2', 'Textbook Example: 1/3 + 1/2')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('असमान हर भएका भिन्नहरूको जोड (समान हर 6 बनाएर)', 'Adding Unlike Fractions by Converting to Common Denominator 6')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 15, color: '#1E293B', lineHeight: 2 }}>
                <div>• LCM of denominators 3 and 2 = 6</div>
                <div>• Making the denominator of 1/3 equal to 6: (1 × 2) / (3 × 2) = <strong>2/6</strong></div>
                <div>• Making the denominator of 1/2 equal to 6: (1 × 3) / (2 × 3) = <strong>3/6</strong></div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0F766E', marginTop: 10 }}>
                  ⟹ 2/6 + 3/6 = (2 + 3) / 6 = <strong>5/6</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: CAKE SHARING COMPARISON ───────────────── */}
        {activeTab === 'cake_compare' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: 16, padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#B45309', textTransform: 'uppercase', marginBottom: 4 }}>
                🎂 {L('पाठ्यपुस्तक केक समस्या (पृष्ठ 80)', 'Textbook Cake Problem (Page 80)')}
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#92400E', lineHeight: 1.5 }}>
                "{L('कृपाले केकको 1/2 भाग, अमनले 1/3 भाग र सन्दिपले 1/6 भाग खाए। समान हर बनाई कसले सबैभन्दा धेरै खायो तुलना गर्नुहोस्।', 'Kripa ate 1/2, Aman ate 1/3, and Sandeep ate 1/6 of a cake. Convert to common denominator and compare.')}"
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#166534' }}>Kripa: 1/2</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#14532D', marginTop: 4 }}>= 3/6 part (the most! 👑)</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>Aman: 1/3</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#475569', marginTop: 4 }}>= 2/6 part</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>Sandeep: 1/6</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#475569', marginTop: 4 }}>= 1/6 part (the least)</div>
              </div>
            </div>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 16, borderRadius: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F766E' }}>
                {L('तुलना: 3/6 > 2/6 > 1/6 ⟹ कृपाले सबैभन्दा ठूलो भाग खाइन्!', 'Comparison: 3/6 > 2/6 > 1/6 ⟹ Kripa ate the largest portion!')}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default FractionVisualizationLab;
