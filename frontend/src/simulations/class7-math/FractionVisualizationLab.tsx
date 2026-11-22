/**
 * FractionVisualizationLab.tsx
 * Grade 7 Mathematics – Lesson 5: FRACTION AND DECIMAL (भिन्न र दशमलव)
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
    np: '१२/१८ लाई सरलतम रूप (Lowest terms) मा रूपान्तरण गर्दा कति हुन्छ?',
    en: 'What is 12/18 in its lowest terms (simplified fraction)?',
    options: [
      { key: 'A', label: '२/३ (६ ले भाग गर्दा)' },
      { key: 'B', label: '३/४' },
      { key: 'C', label: '४/६' },
      { key: 'D', label: '१/२' },
    ],
    answer: 'A',
  },
  {
    np: '१/३ + १/२ जोड्दा हर (Denominator) समान बनाउन कति बनाउनुपर्छ?',
    en: 'To add 1/3 + 1/2, what is the common denominator required?',
    options: [
      { key: 'A', label: '५' },
      { key: 'B', label: '६ (ल.स. = ६)' },
      { key: 'C', label: '३' },
      { key: 'D', label: '२' },
    ],
    answer: 'B',
  },
  {
    np: 'कृपाले केकको १/२ भाग, अमनले १/३ भाग र सन्दिपले १/६ भाग खाए भने कसले सबैभन्दा धेरै खायो?',
    en: 'Kripa ate 1/2 of a cake, Aman ate 1/3, and Sandeep ate 1/6. Who ate the largest portion?',
    options: [
      { key: 'A', label: 'कृपाले (१/२ = ३/६)' },
      { key: 'B', label: 'अमनले (१/३ = २/६)' },
      { key: 'C', label: 'सन्दिपले (१/६)' },
      { key: 'D', label: 'सबैले बराबर खाए' },
    ],
    answer: 'A',
  },
  {
    np: 'तलका मध्ये १/२ सँग तुल्य भिन्न (Equivalent Fraction) कुन हो?',
    en: 'Which of the following is equivalent to 1/2?',
    options: [
      { key: 'A', label: '२/४' },
      { key: 'B', label: '३/६' },
      { key: 'C', label: '४/८' },
      { key: 'D', label: 'माथिका सबै (All of the above)' },
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
            { id: 'bars', np: '१. भिन्न पट्टी मोडल (Fraction Bar)', en: '1. Fraction Bar' },
            { id: 'equivalent', np: '२. तुल्य भिन्न (Equivalent: 1/2=2/4)', en: '2. Equivalent Fractions' },
            { id: 'simplify', np: '३. सरलतम रूप (Simplification: 12/18)', en: '3. Simplification' },
            { id: 'add_sub', np: '४. समान हर बनाई जोडघटाउ', en: '4. Common Denominator' },
            { id: 'cake_compare', np: '५. केक बाँडफाँड तुलना (कृपा, अमन, सन्दिप)', en: '5. Cake Sharing Comparison' },
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
                  {L('पाठ्यपुस्तक अवधारणा (पृष्ठ ७७)', 'Textbook Concept (Page 77)')}
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
                जम्मा बराबर भागहरू (हर / Denominator):
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
                      १/{isNe ? toNp(totalParts) : totalParts}
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
              {L('तुल्य भिन्नहरू (Equivalent Fractions): १/२ = २/४ = ३/६ = ४/८', 'Equivalent Fractions: 1/2 = 2/4 = 3/6 = 4/8')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { n: 1, d: 2, label: '१/२' },
                { n: 2, d: 4, label: '२/४' },
                { n: 3, d: 6, label: '३/६' },
                { n: 4, d: 8, label: '४/८' },
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
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>= ५०%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: SIMPLIFICATION ────────────────────────── */}
        {activeTab === 'simplify' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण (पृष्ठ ७८)', 'Textbook Example (Page 78)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('१२/१८ लाई म.स. (६) ले भाग गरी सरलतम रूप (२/३) मा ल्याउने', 'Simplifying 12/18 to Lowest Terms (2/3) using HCF 6')}
            </h3>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 15, color: '#134E4A', lineHeight: 2 }}>
                <div>१. अंश १२ र हर १८ को साझा गुणनखण्डहरू: १, २, ३, ६</div>
                <div>२. सबैभन्दा ठूलो साझा गुणनखण्ड (म.स. / HCF) = ६</div>
                <div>३. अंश र हर दुवैलाई ६ ले भाग गर्दा:</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0F766E', margin: '8px 0' }}>
                  (१२ ÷ ६) / (१८ ÷ ६) = <strong>२/३</strong>
                </div>
                <div>✓ २ र ३ को अब १ बाहेक अरु कुनै साझा गुणनखण्ड छैन। त्यसैले २/३ सरलतम भिन्न हो।</div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: COMMON DENOMINATOR ────────────────────── */}
        {activeTab === 'add_sub' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण: १/३ + १/२', 'Textbook Example: 1/3 + 1/2')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('असमान हर भएका भिन्नहरूको जोड (समान हर ६ बनाएर)', 'Adding Unlike Fractions by Converting to Common Denominator 6')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 15, color: '#1E293B', lineHeight: 2 }}>
                <div>• हर ३ र २ को ल.स. (LCM) = ६</div>
                <div>• १/३ लाई हर ६ बनाउँदा: (१ × २) / (३ × २) = <strong>२/६</strong></div>
                <div>• १/२ लाई हर ६ बनाउँदा: (१ × ३) / (२ × ३) = <strong>३/६</strong></div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0F766E', marginTop: 10 }}>
                  ⟹ २/६ + ३/६ = (२ + ३) / ६ = <strong>५/६</strong>
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
                🎂 {L('पाठ्यपुस्तक केक समस्या (पृष्ठ ८०)', 'Textbook Cake Problem (Page 80)')}
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#92400E', lineHeight: 1.5 }}>
                "{L('कृपाले केकको १/२ भाग, अमनले १/३ भाग र सन्दिपले १/६ भाग खाए। समान हर बनाई कसले सबैभन्दा धेरै खायो तुलना गर्नुहोस्।', 'Kripa ate 1/2, Aman ate 1/3, and Sandeep ate 1/6 of a cake. Convert to common denominator and compare.')}"
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#166534' }}>कृपा (Kripa): १/२</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#14532D', marginTop: 4 }}>= ३/६ भाग (सबैभन्दा धेरै! 👑)</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>अमन (Aman): १/३</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#475569', marginTop: 4 }}>= २/६ भाग</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>सन्दिप (Sandeep): १/६</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#475569', marginTop: 4 }}>= १/६ भाग (सबैभन्दा थोरै)</div>
              </div>
            </div>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 16, borderRadius: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F766E' }}>
                {L('तुलना: ३/६ > २/६ > १/६ ⟹ कृपाले सबैभन्दा ठूलो भाग खाइन्!', 'Comparison: 3/6 > 2/6 > 1/6 ⟹ Kripa ate the largest portion!')}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default FractionVisualizationLab;
