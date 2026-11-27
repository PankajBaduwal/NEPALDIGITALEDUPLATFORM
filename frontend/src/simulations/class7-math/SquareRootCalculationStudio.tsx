/**
 * SquareRootCalculationStudio.tsx
 * Grade 7 Mathematics – Lesson 2: WHOLE NUMBER (पूर्ण सङ्ख्या)
 * Simulation 2: Square Root Calculation Studio (2D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 18-28)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ArrowRight, RotateCcw, Check, Sparkles, HelpCircle, Layers, Split } from 'lucide-react';

interface PrimeFactorPair {
  prime: number;
  count: number;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'लगातार बिजोर सङ्ख्या घटाउने विधिबाट √४९ पत्ता लगाउँदा कति पटक घटाउनुपर्छ?',
    en: 'How many continuous odd subtractions are required to find √49?',
    options: [
      { key: 'A', label: '५ पटक' },
      { key: 'B', label: '६ पटक' },
      { key: 'C', label: '७ पटक (१+३+५+७+९+११+१३)' },
      { key: 'D', label: '९ पटक' },
    ],
    answer: 'C',
  },
  {
    np: 'अभाज्य गुणनखण्ड विधिबाट √१२२५ को मान कति हुन्छ? (१२२५ = ५ × ५ × ७ × ७)',
    en: 'What is √1225 using prime factorisation? (1225 = 5 × 5 × 7 × 7)',
    options: [
      { key: 'A', label: '२५' },
      { key: 'B', label: '३५ (५ × ७ = ३५)' },
      { key: 'C', label: '४५' },
      { key: 'D', label: '५५' },
    ],
    answer: 'B',
  },
  {
    np: '१२६७५ = ३ × ५² × १३² लाई पूर्ण वर्ग बनाउन कुन सबैभन्दा सानो सङ्ख्याले भाग गर्नुपर्छ?',
    en: 'By what least number should 12675 = 3 × 5² × 13² be divided to make it a perfect square?',
    options: [
      { key: 'A', label: '३ (३ को जोडी नभएकोले)' },
      { key: 'B', label: '५' },
      { key: 'C', label: '१३' },
      { key: 'D', label: '१५' },
    ],
    answer: 'A',
  },
  {
    np: 'भाग विधिबाट वर्गमूल निकाल्दा दायाँबाट कति-कति अङ्कको जोडी (Pair) बनाइन्छ?',
    en: 'When finding square root by division method, how many digits are paired from the right?',
    options: [
      { key: 'A', label: '१ अङ्क' },
      { key: 'B', label: '२ अङ्क (जोडी/Pairs)' },
      { key: 'C', label: '३ अङ्क' },
      { key: 'D', label: '४ अङ्क' },
    ],
    answer: 'B',
  },
];

export const SquareRootCalculationStudio: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L2-02',
    titleEn: 'Square Root Calculation Studio',
    titleNp: 'वर्गमूल गणना प्रयोगशाला',
    chapter: 2,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'subtraction' | 'prime' | 'division' | 'perfect_test'>('subtraction');

  // ── Tab 1: Continuous Subtraction State ──────────────────────
  const [subNumber, setSubNumber] = useState<number>(64);
  const [currentVal, setCurrentVal] = useState<number>(64);
  const [subStep, setSubStep] = useState<number>(0);
  const [subHistory, setSubHistory] = useState<{ step: number; prev: number; odd: number; result: number }[]>([]);

  const handleNextSubStep = () => {
    const nextOdd = 2 * subStep + 1;
    if (currentVal < nextOdd) {
      kit.oops(L('शेष ० भएन, यो पूर्ण वर्ग होइन!', 'Cannot reach 0, not a perfect square!'));
      return;
    }
    kit.tap();
    const nextVal = currentVal - nextOdd;
    setSubHistory((prev) => [...prev, { step: subStep + 1, prev: currentVal, odd: nextOdd, result: nextVal }]);
    setCurrentVal(nextVal);
    setSubStep((s) => s + 1);

    if (nextVal === 0) {
      kit.good(L(`उत्कृष्ट! ${toNp(subStep + 1)} पटकमा शून्य आयो ⟹ √${toNp(subNumber)} = ${toNp(subStep + 1)}`, `Finished in ${subStep + 1} steps ⟹ √${subNumber} = ${subStep + 1}`));
    }
  };

  const resetSubtraction = (num: number) => {
    kit.tap();
    setSubNumber(num);
    setCurrentVal(num);
    setSubStep(0);
    setSubHistory([]);
  };

  // ── Tab 2: Prime Factorisation State ─────────────────────────
  const [selectedPfNum, setSelectedPfNum] = useState<number>(36);
  const PF_DATA: Record<number, { factors: number[]; paired: [number, number][]; unpaired: number[]; root: number }> = {
    36: { factors: [2, 2, 3, 3], paired: [[2, 2], [3, 3]], unpaired: [], root: 6 },
    169: { factors: [13, 13], paired: [[13, 13]], unpaired: [], root: 13 },
    324: { factors: [2, 2, 3, 3, 3, 3], paired: [[2, 2], [3, 3], [3, 3]], unpaired: [], root: 18 },
    1225: { factors: [5, 5, 7, 7], paired: [[5, 5], [7, 7]], unpaired: [], root: 35 },
    5625: { factors: [3, 3, 5, 5, 5, 5], paired: [[3, 3], [5, 5], [5, 5]], unpaired: [], root: 75 },
  };

  // ── Tab 3: Long Division State ───────────────────────────────
  const [selectedDivNum, setSelectedDivNum] = useState<number>(1764);
  const [divStepIndex, setDivStepIndex] = useState<number>(1);
  const LONG_DIV_EXAMPLES: Record<
    number,
    {
      pairs: string[];
      steps: {
        titleNp: string;
        titleEn: string;
        quotient: string;
        divisor: string;
        subtraction: string;
        remainder: string;
        descNp: string;
        descEn: string;
      }[];
      finalRoot: number;
    }
  > = {
    1764: {
      pairs: ['१७', '६४'],
      finalRoot: 42,
      steps: [
        {
          titleNp: 'चरण १: पहिलो जोडी (१७) को वर्गमूल अनुमान',
          titleEn: 'Step 1: Estimate root for first pair (17)',
          quotient: '४',
          divisor: '४',
          subtraction: '१७ - १६ = १',
          remainder: '१',
          descNp: '१७ भन्दा नबढ्ने ठूलो पूर्ण वर्ग १६ हो (४ × ४ = १६)। भागफलमा ४ लेख्ने।',
          descEn: 'Largest square ≤ 17 is 16 (4 × 4 = 16). Write 4 in quotient.',
        },
        {
          titleNp: 'चरण २: अर्को जोडी (६४) तल झार्ने र भाजक दोब्बर गर्ने',
          titleEn: 'Step 2: Bring down next pair (64) and double the divisor',
          quotient: '४२',
          divisor: '८२',
          subtraction: '१६४ - १६४ = ०',
          remainder: '०',
          descNp: '६४ तल झार्दा १६४ भयो। ४ को दोब्बर ८ भयो। ८ को पछाडि २ राख्दा: ८२ × २ = १६४। शेष = ०।',
          descEn: 'Bringing down 64 gives 164. 4 doubled is 8. Putting 2 gives 82 × 2 = 164. Remainder = 0.',
        },
      ],
    },
    2304: {
      pairs: ['२३', '०४'],
      finalRoot: 48,
      steps: [
        {
          titleNp: 'चरण १: पहिलो जोडी (२३) हेर्ने',
          titleEn: 'Step 1: Check first pair (23)',
          quotient: '४',
          divisor: '४',
          subtraction: '२३ - १६ = ७',
          remainder: '७',
          descNp: '४ × ४ = १६ (५ × ५ = २५ बढी हुन्छ)। शेष ७ रह्यो।',
          descEn: '4 × 4 = 16 (5²=25 is too big). Remainder is 7.',
        },
        {
          titleNp: 'चरण २: ०४ तल झार्ने र भाजक दोब्बर (८) बनाउने',
          titleEn: 'Step 2: Bring down 04, divisor becomes 88',
          quotient: '४८',
          divisor: '८८',
          subtraction: '७०४ - ७०४ = ०',
          remainder: '०',
          descNp: '०४ झार्दा ७०४ भयो। ८ को पछाडि ८ राख्दा: ८८ × ८ = ७०४। शेष = ०।',
          descEn: 'Divisor 88 × 8 = 704. Remainder = 0. Therefore √2304 = 48.',
        },
      ],
    },
  };

  // ── Tab 4: Perfect Square Test ───────────────────────────────
  const [testNumber, setTestNumber] = useState<number>(12675);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'वर्गमूल निकाल्ने ३ वटा मुख्य विधिहरू छन्: लगातार बिजोर सङ्ख्या घटाउने, अभाज्य गुणनखण्ड, र भाग विधि। आउनुहोस् अभ्यास गरौँ!',
        'There are 3 core square root methods: continuous subtraction, prime factorisation, and long division. Let us explore!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'subtraction', np: '१. लगातार घटाउ विधि (Continuous Subtraction)', en: '1. Continuous Subtraction' },
            { id: 'prime', np: '२. अभाज्य गुणनखण्ड विधि (Prime Factorisation)', en: '2. Prime Factorisation' },
            { id: 'division', np: '३. भाग विधि (Division Method)', en: '3. Division Method' },
            { id: 'perfect_test', np: '४. पूर्ण वर्ग जाँच र न्यूनतम गुणन/भाग', en: '4. Perfect Square Test' },
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

        {/* ── TAB 1: CONTINUOUS SUBTRACTION METHOD ──────────── */}
        {activeTab === 'subtraction' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तक विधि १ (पृष्ठ १८)', 'Textbook Method 1 (Page 18)')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('लगातार १, ३, ५, ७, ९... बिजोर सङ्ख्याहरू घटाएर वर्गमूल पत्ता लगाउने', 'Find Square Root by Subtracting Consecutive Odd Numbers (1, 3, 5, 7...)')}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[36, 49, 64, 81, 100].map((num) => (
                  <button
                    key={num}
                    onClick={() => resetSubtraction(num)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: subNumber === num ? '2px solid #0F766E' : '1px solid #CBD5E1',
                      background: subNumber === num ? '#F0FDFA' : '#FFFFFF',
                      color: subNumber === num ? '#0F766E' : '#334155',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {isNe ? toNp(num) : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  {L('हालको मान (Current Value)', 'Current Value')}
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: currentVal === 0 ? '#16A34A' : '#0F766E', margin: '8px 0' }}>
                  {isNe ? toNp(currentVal) : currentVal}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  {currentVal > 0 ? (
                    <>
                      {L('अर्को घटाउनुपर्ने बिजोर सङ्ख्या:', 'Next odd number to subtract:')}{' '}
                      <strong style={{ color: '#DC2626' }}>{isNe ? toNp(2 * subStep + 1) : 2 * subStep + 1}</strong>
                    </>
                  ) : (
                    <span style={{ color: '#16A34A' }}>✓ {L('शून्य आयो! प्रक्रिया सम्पन्न।', 'Reached zero! Process complete.')}</span>
                  )}
                </div>

                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleNextSubStep}
                    disabled={currentVal === 0}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: 'none',
                      background: currentVal === 0 ? '#94A3B8' : '#0F766E',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: currentVal === 0 ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {L('अर्को बिजोर सङ्ख्या घटाउनुहोस्', 'Subtract Next Odd')} <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => resetSubtraction(subNumber)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#334155',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              {/* Steps Counter & Conclusion */}
              <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 20, borderRadius: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F766E', marginBottom: 6 }}>
                  {L('घटाउ गरिएका चरणहरूको सङ्ख्या (Number of Subtraction Steps):', 'Number of Subtraction Steps:')}
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#0F766E', marginBottom: 8 }}>
                  {isNe ? toNp(subStep) : subStep} {L('पटक', 'times')}
                </div>
                {currentVal === 0 && (
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#166534', background: '#DCFCE7', padding: '8px 14px', borderRadius: 10 }}>
                    {isNe ? `त्यसैले, √${toNp(subNumber)} = ${toNp(subStep)}` : `Therefore, √${subNumber} = ${subStep}`}
                  </div>
                )}
              </div>
            </div>

            {/* Subtraction History Log */}
            {subHistory.length > 0 && (
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 10, textTransform: 'uppercase' }}>
                  {L('घटाउ तालिका (Step-by-step Log):', 'Step-by-step Log:')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                  {subHistory.map((h) => (
                    <div key={h.step} style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                      <span style={{ color: '#64748B', fontSize: 11 }}>#{isNe ? toNp(h.step) : h.step}: </span>
                      {isNe ? toNp(h.prev) : h.prev} - <span style={{ color: '#DC2626' }}>{isNe ? toNp(h.odd) : h.odd}</span> = <strong>{isNe ? toNp(h.result) : h.result}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: PRIME FACTORISATION METHOD ────────────── */}
        {activeTab === 'prime' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तक विधि २ (पृष्ठ १९-२१)', 'Textbook Method 2 (Pages 19-21)')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('अभाज्य गुणनखण्ड गरी जोडी बनाएर वर्गमूल निकाल्ने', 'Prime Factorisation and Pairing Equal Factors')}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[36, 169, 324, 1225, 5625].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      kit.tap();
                      setSelectedPfNum(num);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: selectedPfNum === num ? '2px solid #0F766E' : '1px solid #CBD5E1',
                      background: selectedPfNum === num ? '#F0FDFA' : '#FFFFFF',
                      color: selectedPfNum === num ? '#0F766E' : '#334155',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {isNe ? toNp(num) : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Factorisation Breakdown */}
            {PF_DATA[selectedPfNum] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Step 1: Prime Factors List */}
                <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B', marginBottom: 6 }}>
                    १. {L('अभाज्य गुणनखण्डहरू (Prime Factors):', 'Prime Factors:')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', fontFamily: 'monospace' }}>
                    {isNe ? toNp(selectedPfNum) : selectedPfNum} = {PF_DATA[selectedPfNum].factors.map((f) => (isNe ? toNp(f) : f)).join(' × ')}
                  </div>
                </div>

                {/* Step 2: Grouping into Pairs */}
                <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 18, borderRadius: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0F766E', marginBottom: 8 }}>
                    २. {L('बराबर अभाज्य गुणनखण्डहरूलाई जोडी बनाउँदा (Grouping into pairs):', 'Grouping equal prime factors into pairs:')}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 900 }}>√{isNe ? toNp(selectedPfNum) : selectedPfNum} = √[</span>
                    {PF_DATA[selectedPfNum].paired.map((p, idx) => (
                      <span key={idx} style={{ background: '#CCFBF1', color: '#0F766E', padding: '4px 10px', borderRadius: 8, fontWeight: 900, fontSize: 15 }}>
                        ({isNe ? toNp(p[0]) : p[0]} × {isNe ? toNp(p[1]) : p[1]})
                      </span>
                    ))}
                    <span style={{ fontSize: 16, fontWeight: 900 }}>]</span>
                  </div>
                </div>

                {/* Step 3: Taking one factor from each pair */}
                <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 18, borderRadius: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 6 }}>
                    ३. {L('प्रत्येक जोडीबाट एक-एक गुणनखण्ड लिई गुणन गर्दा:', 'Taking one factor from each pair and multiplying:')}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#14532D' }}>
                    √{isNe ? toNp(selectedPfNum) : selectedPfNum} = {PF_DATA[selectedPfNum].paired.map((p) => (isNe ? toNp(p[0]) : p[0])).join(' × ')} = <strong>{isNe ? toNp(PF_DATA[selectedPfNum].root) : PF_DATA[selectedPfNum].root}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: LONG DIVISION METHOD ──────────────────── */}
        {activeTab === 'division' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तक विधि ३ (पृष्ठ २२-२४)', 'Textbook Method 3 (Pages 22-24)')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('भाग विधिबाट वर्गमूल निकाल्ने चरणबद्ध अभ्यास', 'Step-by-Step Square Root by Long Division')}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1764, 2304].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      kit.tap();
                      setSelectedDivNum(num);
                      setDivStepIndex(1);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: selectedDivNum === num ? '2px solid #0F766E' : '1px solid #CBD5E1',
                      background: selectedDivNum === num ? '#F0FDFA' : '#FFFFFF',
                      color: selectedDivNum === num ? '#0F766E' : '#334155',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    √{isNe ? toNp(num) : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Division Interactive Display */}
            {LONG_DIV_EXAMPLES[selectedDivNum] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Pairs Header */}
                <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>
                    {L('दायाँबाट २-२ अङ्कका जोडीहरू:', 'Pairs grouped from right:')}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {LONG_DIV_EXAMPLES[selectedDivNum].pairs.map((p, idx) => (
                      <span key={idx} style={{ background: '#E2E8F0', padding: '4px 10px', borderRadius: 6, fontWeight: 900, fontSize: 16, color: '#0F172A' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Steps Visualizer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {LONG_DIV_EXAMPLES[selectedDivNum].steps.slice(0, divStepIndex).map((s, idx) => (
                    <div key={idx} style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 14, padding: 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 6 }}>
                        {isNe ? s.titleNp : s.titleEn}
                      </div>
                      <p style={{ fontSize: 13, color: '#334155', margin: '0 0 10px', lineHeight: 1.5 }}>
                        {isNe ? s.descNp : s.descEn}
                      </p>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, fontWeight: 800, color: '#0F172A', flexWrap: 'wrap' }}>
                        <span style={{ background: '#CCFBF1', padding: '3px 8px', borderRadius: 6 }}>{L('भाजक (Divisor):', 'Divisor:')} {s.divisor}</span>
                        <span style={{ background: '#FEF3C7', padding: '3px 8px', borderRadius: 6 }}>{L('भागफल (Quotient):', 'Quotient:')} {s.quotient}</span>
                        <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: 6 }}>{s.subtraction}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <button
                    onClick={() => {
                      kit.tap();
                      if (divStepIndex < LONG_DIV_EXAMPLES[selectedDivNum].steps.length) {
                        setDivStepIndex((i) => i + 1);
                      } else {
                        kit.good(L('भाग विधि पूरा भयो!', 'Division complete!'));
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
                    {divStepIndex < LONG_DIV_EXAMPLES[selectedDivNum].steps.length
                      ? L('अर्को चरण हेर्नुहोस्', 'Show Next Step')
                      : L('पुनः दोहोर्‍याउनुहोस्', 'Restart Division')}
                  </button>

                  <div style={{ fontSize: 15, fontWeight: 900, color: '#166534' }}>
                    √{isNe ? toNp(selectedDivNum) : selectedDivNum} = {isNe ? toNp(LONG_DIV_EXAMPLES[selectedDivNum].finalRoot) : LONG_DIV_EXAMPLES[selectedDivNum].finalRoot}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: PERFECT SQUARE TEST ───────────────────── */}
        {activeTab === 'perfect_test' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('पूर्ण वर्ग बनाउन न्यूनतम गुणन वा भाग गर्नुपर्ने सङ्ख्या पत्ता लगाउने', 'Least Multiplier or Divisor to Form a Perfect Square')}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748B' }}>
              {L('पाठ्यपुस्तक पृष्ठ २४ उदाहरण: १२६७५ को अभाज्य गुणनखण्ड गरी जाँच गर्नुहोस्।', 'Textbook Page 24 Example: Factorize 12675 and find unpaired prime.')}
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                { num: 12675, descNp: '१२६७५ = ३ × ५ × ५ × १३ × १३', descEn: '12675 = 3 × 5 × 5 × 13 × 13', unpaired: 3 },
                { num: 180, descNp: '१८० = २ × २ × ३ × ३ × ५', descEn: '180 = 2 × 2 × 3 × 3 × 5', unpaired: 5 },
                { num: 500, descNp: '५०० = २ × २ × ५ × ५ × ५', descEn: '500 = 2 × 2 × 5 × 5 × 5', unpaired: 5 },
              ].map((item) => (
                <button
                  key={item.num}
                  onClick={() => {
                    kit.tap();
                    setTestNumber(item.num);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: testNumber === item.num ? '2px solid #0F766E' : '1px solid #CBD5E1',
                    background: testNumber === item.num ? '#F0FDFA' : '#FFFFFF',
                    color: testNumber === item.num ? '#0F766E' : '#334155',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {isNe ? toNp(item.num) : item.num}
                </button>
              ))}
            </div>

            {/* Analysis Card */}
            <div style={{ background: '#FFFBEB', border: '2px solid #F59E0B', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#92400E', marginBottom: 8 }}>
                {testNumber === 12675 && '१२६७५ = ३ × (५ × ५) × (१३ × १३)'}
                {testNumber === 180 && '१८० = (२ × २) × (३ × ३) × ५'}
                {testNumber === 500 && '५०० = (२ × २) × (५ × ५) × ५'}
              </div>

              <div style={{ fontSize: 14, color: '#78350F', lineHeight: 1.6 }}>
                <div>
                  • {L('यहाँ सबै गुणनखण्डहरूको जोडी बनेको छैन।', 'Not all prime factors can be grouped into pairs.')}
                </div>
                <div>
                  • {L('न्यूनतम गुणन गर्नुपर्ने सङ्ख्या (Least Multiplier):', 'Least number to multiply:')}{' '}
                  <strong>{testNumber === 12675 ? (isNe ? '३' : '3') : isNe ? '५' : '5'}</strong>{' '}
                  {L('(जोडी पुर्‍याउन)', '(to complete pair)')}
                </div>
                <div>
                  • {L('न्यूनतम भाग गर्नुपर्ने सङ्ख्या (Least Divisor):', 'Least number to divide:')}{' '}
                  <strong>{testNumber === 12675 ? (isNe ? '३' : '3') : isNe ? '५' : '5'}</strong>{' '}
                  {L('(अतिरिक्त गुणनखण्ड हटाउन)', '(to remove unpaired factor)')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default SquareRootCalculationStudio;
