/**
 * HcfDiscoveryLab.tsx
 * Grade 7 Mathematics – Lesson 2: WHOLE NUMBER
 * Simulation 4: HCF Discovery and Problem-Solving Lab (2D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 30-36)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Check, Sparkles, HelpCircle, ArrowRight, RotateCcw, Split, Users } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दुई वा दुईभन्दा बढी सङ्ख्याहरूलाई निःशेष भाग जाने सबैभन्दा ठूलो साझा गुणनखण्डलाई के भनिन्छ?',
    en: 'What is the greatest common factor that divides two or more numbers without remainder?',
    options: [
      { key: 'A', label: 'Lowest common multiple (LCM)' },
      { key: 'B', label: 'Highest common factor (HCF)' },
      { key: 'C', label: 'Perfect square number' },
      { key: 'D', label: 'Prime number' },
    ],
    answer: 'B',
  },
  {
    np: '20 र 35 को साझा गुणनखण्डहरू {1, 5} भए यिनीहरूको म.स. (HCF) कति हुन्छ?',
    en: 'If common factors of 20 and 35 are {1, 5}, what is their HCF?',
    options: [
      { key: 'A', label: '1' },
      { key: 'B', label: '5' },
      { key: 'C', label: '20' },
      { key: 'D', label: '35' },
    ],
    answer: 'B',
  },
  {
    np: 'हरिमायाले 30 pcs स्याउ र 40 pcs केरा बढीमा कति जनालाई बराबर भाग लगाउन सक्छिन्?',
    en: 'Harimaya has 30 apples and 40 bananas. Among at most how many people can she distribute them equally?',
    options: [
      { key: 'A', label: '5 people' },
      { key: 'B', label: '10 people (HCF = 10)' },
      { key: 'C', label: '15 people' },
      { key: 'D', label: '20 people' },
    ],
    answer: 'B',
  },
  {
    np: '100 र 125 को भाग विधिबाट म.स. निकाल्दा अन्तिम भाजक कति हुन्छ?',
    en: 'By division method, what is the final divisor giving remainder 0 for 100 and 125?',
    options: [
      { key: 'A', label: '5' },
      { key: 'B', label: '20' },
      { key: 'C', label: '25' },
      { key: 'D', label: '50' },
    ],
    answer: 'C',
  },
];

export const HcfDiscoveryLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L2-04',
    titleEn: 'HCF Discovery & Problem-Solving Lab',
    titleNp: 'महत्तम समापवर्तक (म.स.) खोजी प्रयोगशाला',
    chapter: 2,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'factor_list' | 'prime_hcf' | 'division_hcf' | 'distribution'>('factor_list');

  // ── Tab 1: Factor Listing State ──────────────────────────────
  const [selectedNumA, setSelectedNumA] = useState<number>(20);
  const [selectedNumB, setSelectedNumB] = useState<number>(35);

  const getFactors = (n: number) => {
    const facts: number[] = [];
    for (let i = 1; i <= n; i++) {
      if (n % i === 0) facts.push(i);
    }
    return facts;
  };
  const factorsA = getFactors(selectedNumA);
  const factorsB = getFactors(selectedNumB);
  const commonFactors = factorsA.filter((f) => factorsB.includes(f));
  const hcfValue = Math.max(...commonFactors);

  // ── Tab 3: Continuous Division Steps ─────────────────────────
  const [divStepIndex, setDivStepIndex] = useState<number>(1);
  const DIV_STEPS = [
    {
      titleNp: 'चरण 1: ठूलो सङ्ख्या (125) लाई सानो सङ्ख्या (100) ले भाग गर्ने',
      titleEn: 'Step 1: Divide larger number (125) by smaller number (100)',
      dividend: 125,
      divisor: 100,
      quotient: 1,
      remainder: 25,
      descNp: '125 ÷ 100 = 1 पटक गयो, शेष 25 आयो। (शेष 0 नभएकाले अघि बढ्ने)',
      descEn: '125 ÷ 100 = 1, remainder 25. (Remainder is not 0, continue)',
    },
    {
      titleNp: 'चरण 2: अघिल्लो भाजक (100) लाई शेष (25) ले भाग गर्ने',
      titleEn: 'Step 2: Divide previous divisor (100) by remainder (25)',
      dividend: 100,
      divisor: 25,
      quotient: 4,
      remainder: 0,
      descNp: '100 ÷ 25 = 4 पटक गयो, शेष 0 आयो! अन्तिम भाजक 25 नै म.स. हो।',
      descEn: '100 ÷ 25 = 4, remainder 0! Final divisor 25 is the HCF.',
    },
  ];

  // ── Tab 4: Harimaya Distribution State ───────────────────────
  const [peopleCount, setPeopleCount] = useState<number>(10);
  const applesTotal = 30;
  const bananasTotal = 40;
  const isOptimalPeople = peopleCount === 10;
  const canDivideEvenly = applesTotal % peopleCount === 0 && bananasTotal % peopleCount === 0;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'Highest common factor (HCF) भनेको दिइएका सङ्ख्याहरूलाई निःशेष भाग जाने सबैभन्दा ठूलो साझा गुणनखण्ड हो। आउनुहोस् व्यवहारिक प्रयोग सिकौँ!',
        'Highest Common Factor (HCF) is the greatest common factor that divides all numbers without a remainder. Let us discover!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'factor_list', np: '1. साझा गुणनखण्ड सूची विधि', en: '1. Factor Listing Method' },
            { id: 'prime_hcf', np: '2. अभाज्य गुणनखण्डबाट म.स.', en: '2. HCF by Prime Factorisation' },
            { id: 'division_hcf', np: '3. निरन्तर भाग विधि', en: '3. Continuous Division Method' },
            { id: 'distribution', np: '4. व्यवहारिक फलफूल बाँडफाँड (हरिमाया)', en: '4. Equal Distribution Challenge' },
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

        {/* ── TAB 1: FACTOR LISTING METHOD ─────────────────── */}
        {activeTab === 'factor_list' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तक पृष्ठ 30-31', 'Textbook Pages 30-31')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('सबै गुणनखण्डहरू सूचीकरण गरी सबैभन्दा ठूलो साझा गुणनखण्ड छान्ने', 'List All Factors and Find the Highest Common Factor')}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { a: 20, b: 35 },
                  { a: 18, b: 24 },
                  { a: 12, b: 18 },
                ].map((pair, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      kit.tap();
                      setSelectedNumA(pair.a);
                      setSelectedNumB(pair.b);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: selectedNumA === pair.a && selectedNumB === pair.b ? '2px solid #0F766E' : '1px solid #CBD5E1',
                      background: selectedNumA === pair.a && selectedNumB === pair.b ? '#F0FDFA' : '#FFFFFF',
                      color: selectedNumA === pair.a && selectedNumB === pair.b ? '#0F766E' : '#334155',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    ({isNe ? toNp(pair.a) : pair.a}, {isNe ? toNp(pair.b) : pair.b})
                  </button>
                ))}
              </div>
            </div>

            {/* Factors Display Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
              {/* Factors of A */}
              <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B', marginBottom: 8 }}>
                  {L(`${toNp(selectedNumA)} का गुणनखण्डहरू (Factors of ${selectedNumA}):`, `Factors of ${selectedNumA}:`)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {factorsA.map((f) => (
                    <span
                      key={f}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: commonFactors.includes(f) ? '#DCFCE7' : '#FFFFFF',
                        border: commonFactors.includes(f) ? '2px solid #16A34A' : '1px solid #CBD5E1',
                        fontWeight: 800,
                        fontSize: 14,
                        color: commonFactors.includes(f) ? '#166534' : '#334155',
                      }}
                    >
                      {isNe ? toNp(f) : f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Factors of B */}
              <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B', marginBottom: 8 }}>
                  {L(`${toNp(selectedNumB)} का गुणनखण्डहरू (Factors of ${selectedNumB}):`, `Factors of ${selectedNumB}:`)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {factorsB.map((f) => (
                    <span
                      key={f}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: commonFactors.includes(f) ? '#DCFCE7' : '#FFFFFF',
                        border: commonFactors.includes(f) ? '2px solid #16A34A' : '1px solid #CBD5E1',
                        fontWeight: 800,
                        fontSize: 14,
                        color: commonFactors.includes(f) ? '#166534' : '#334155',
                      }}
                    >
                      {isNe ? toNp(f) : f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Common Factors and HCF Banner */}
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F766E', marginBottom: 6 }}>
                {L('साझा गुणनखण्डहरू (Common Factors):', 'Common Factors:')} {'{ '}
                {commonFactors.map((f) => (isNe ? toNp(f) : f)).join(', ')} {' }'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#166534' }}>
                {L('Highest common factor (HCF) =', 'Highest Common Factor (HCF) =')}{' '}
                <strong style={{ color: '#0F766E' }}>{isNe ? toNp(hcfValue) : hcfValue}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: PRIME FACTORISATION HCF ───────────────── */}
        {activeTab === 'prime_hcf' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण (पृष्ठ 32)', 'Textbook Example (Page 32)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('100, 125 र 200 को अभाज्य गुणनखण्डबाट म.स. निकाल्ने', 'Find HCF of 100, 125 and 200 by Prime Factorisation')}
            </h3>

            {/* Ladder displays */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>100 (100)</div>
                <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#334155' }}>
                  = 2 × 2 × <strong style={{ color: '#0F766E', background: '#CCFBF1', padding: '2px 4px', borderRadius: 4 }}>5</strong> × <strong style={{ color: '#0F766E', background: '#CCFBF1', padding: '2px 4px', borderRadius: 4 }}>5</strong>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>125 (125)</div>
                <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#334155' }}>
                  = <strong style={{ color: '#0F766E', background: '#CCFBF1', padding: '2px 4px', borderRadius: 4 }}>5</strong> × <strong style={{ color: '#0F766E', background: '#CCFBF1', padding: '2px 4px', borderRadius: 4 }}>5</strong> × 5
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>200 (200)</div>
                <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#334155' }}>
                  = 2 × 2 × 2 × <strong style={{ color: '#0F766E', background: '#CCFBF1', padding: '2px 4px', borderRadius: 4 }}>5</strong> × <strong style={{ color: '#0F766E', background: '#CCFBF1', padding: '2px 4px', borderRadius: 4 }}>5</strong>
                </div>
              </div>
            </div>

            {/* Common Primes Highlight */}
            <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 4 }}>
                {L('तीनै pcs सङ्ख्यामा साझा अभाज्य गुणनखण्डहरू (Common prime factors in all three):', 'Common prime factors in all three:')}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#14532D' }}>
                5 × 5 = {isNe ? toNp(25) : 25}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginTop: 4 }}>
                ⟹ {L('HCF = 25', 'HCF = 25')}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: CONTINUOUS DIVISION METHOD ────────────── */}
        {activeTab === 'division_hcf' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक विधि (पृष्ठ 33)', 'Textbook Method (Page 33)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('100 र 125 को भाग विधिबाट म.स. निकाल्ने (शेष 0 नआएसम्म निरन्तर भाग)', 'HCF of 100 & 125 by Continuous Division until Remainder = 0')}
            </h3>

            {/* Division Steps Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {DIV_STEPS.slice(0, divStepIndex).map((step, idx) => (
                <div key={idx} style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 4 }}>
                    {isNe ? step.titleNp : step.titleEn}
                  </div>
                  <p style={{ fontSize: 13, color: '#334155', margin: '0 0 10px' }}>
                    {isNe ? step.descNp : step.descEn}
                  </p>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13, fontWeight: 800, flexWrap: 'wrap' }}>
                    <span style={{ background: '#CCFBF1', padding: '3px 8px', borderRadius: 6 }}>Divisor: {isNe ? toNp(step.divisor) : step.divisor}</span>
                    <span style={{ background: '#E2E8F0', padding: '3px 8px', borderRadius: 6 }}>Dividend: {isNe ? toNp(step.dividend) : step.dividend}</span>
                    <span style={{ background: '#FEF3C7', padding: '3px 8px', borderRadius: 6 }}>Quotient: {isNe ? toNp(step.quotient) : step.quotient}</span>
                    <span style={{ background: step.remainder === 0 ? '#DCFCE7' : '#FEE2E2', color: step.remainder === 0 ? '#166534' : '#DC2626', padding: '3px 8px', borderRadius: 6 }}>
                      Remainder: {isNe ? toNp(step.remainder) : step.remainder}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  kit.tap();
                  if (divStepIndex < DIV_STEPS.length) {
                    setDivStepIndex((i) => i + 1);
                  } else {
                    kit.good(L('भाग विधिबाट म.स. = 25 पत्ता लाग्यो!', 'HCF = 25 reached!'));
                  }
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#0F766E',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {divStepIndex < DIV_STEPS.length ? L('अर्को चरण हेर्नुहोस्', 'Show Next Step') : L('पुनः दोहोर्‍याउनुहोस्', 'Restart')}
              </button>

              <div style={{ fontSize: 16, fontWeight: 900, color: '#166534' }}>
                HCF = {isNe ? '25' : '25'}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: EQUAL DISTRIBUTION CHALLENGE ─────────── */}
        {activeTab === 'distribution' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: 16, padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#B45309', textTransform: 'uppercase', marginBottom: 4 }}>
                🍎 {L('पाठ्यपुस्तक व्यवहारिक समस्या (पृष्ठ 33)', 'Textbook Practical Problem (Page 33)')}
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#92400E', lineHeight: 1.5 }}>
                "{L('हरिमायासँग 30 pcs स्याउ र 40 pcs केरा छन्। ती फलफूलहरू बढीमा कति जनालाई बराबर भाग लगाउन सकिन्छ र प्रत्येकले कति-कति पाउँछन्?', 'Harimaya has 30 apples and 40 bananas. Among the greatest number of people, how many can receive an equal share without remainder?')}"
              </h3>
            </div>

            {/* Interactive Slider for Number of People */}
            <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 8 }}>
                {L('बाँडफाँड गरिने मानिसहरूको सङ्ख्या (Number of People):', 'Number of People:')} <strong>{isNe ? toNp(peopleCount) : peopleCount} {L('जना', 'people')}</strong>
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[2, 5, 8, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => {
                      kit.tap();
                      setPeopleCount(cnt);
                      if (cnt === 10) {
                        kit.good(L('उत्कृष्ट! 10 जना नै अधिकतम सम्भावित सङ्ख्या हो (म.स. = 10)', 'Optimal! 10 people is the HCF'));
                      }
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: peopleCount === cnt ? '2px solid #0F766E' : '1px solid #CBD5E1',
                      background: peopleCount === cnt ? '#F0FDFA' : '#FFFFFF',
                      color: peopleCount === cnt ? '#0F766E' : '#334155',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {isNe ? toNp(cnt) : cnt} {L('जना', 'people')}
                  </button>
                ))}
              </div>
            </div>

            {/* Distribution Results Card */}
            <div
              style={{
                background: canDivideEvenly ? (isOptimalPeople ? '#DCFCE7' : '#F0FDFA') : '#FEE2E2',
                border: canDivideEvenly ? (isOptimalPeople ? '2px solid #16A34A' : '2px solid #99F6E4') : '2px solid #DC2626',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900, color: canDivideEvenly ? '#166534' : '#DC2626', marginBottom: 8 }}>
                {canDivideEvenly
                  ? isOptimalPeople
                    ? L('✓ अधिकतम सम्भावित मानिस सङ्ख्या: 10 people (HCF = 10)', '✓ Greatest Possible Number of People: 10 (HCF = 10)')
                    : L(`बराबर बाँड्न मिल्छ तर यो अधिकतम (म.स.) होइन।`, `Even distribution, but not the maximum (HCF).`)
                  : L('✗ यो सङ्ख्यामा सबै फलफूल बराबर बाँड्न मिल्दैन!', '✗ Cannot divide all fruits evenly!')}
              </div>

              {canDivideEvenly && (
                <div style={{ fontSize: 14, color: '#1E293B', lineHeight: 1.6 }}>
                  <div>• {L('प्रत्येक व्यक्तिले पाउने स्याउ:', 'Apples received by each person:')} 30 ÷ {isNe ? toNp(peopleCount) : peopleCount} = <strong>{isNe ? toNp(applesTotal / peopleCount) : applesTotal / peopleCount} {L('pcs', 'apples')}</strong></div>
                  <div>• {L('प्रत्येक व्यक्तिले पाउने केरा:', 'Bananas received by each person:')} 40 ÷ {isNe ? toNp(peopleCount) : peopleCount} = <strong>{isNe ? toNp(bananasTotal / peopleCount) : bananasTotal / peopleCount} {L('pcs', 'bananas')}</strong></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default HcfDiscoveryLab;
