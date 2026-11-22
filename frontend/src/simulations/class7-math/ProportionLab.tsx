/**
 * ProportionLab.tsx
 * Grade 7 Mathematics – Lesson 6: RATIO AND PROPORTION (अनुपात र समानुपात)
 * Simulation 2: Proportion and Cross-Multiplication Lab (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 93-97)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Equal, ArrowRight, Check, X, Calculator, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'समानुपात a : b :: c : d मा मध्यम पदहरू (Means) कुन-कुन हुन्?',
    en: 'In proportion a : b :: c : d, which terms are the Means?',
    options: [
      { key: 'A', label: 'b र c (b and c)' },
      { key: 'B', label: 'a र d (a and d)' },
      { key: 'C', label: 'a र b' },
      { key: 'D', label: 'c र d' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि ३ : ५ :: १२ : x समानुपातमा छन् भने x को मान कति हुन्छ?',
    en: 'If 3 : 5 :: 12 : x are in proportion, what is the value of x?',
    options: [
      { key: 'A', label: '२० (३ × x = ५ × १२ => x = ६०/३ = २०)' },
      { key: 'B', label: '१५' },
      { key: 'C', label: '२५' },
      { key: 'D', label: '३६' },
    ],
    answer: 'A',
  },
  {
    np: 'दीपेन्द्रले ३० पूर्णाङ्कमा २५ र नर्मदाले २४ पूर्णाङ्कमा २० अङ्क प्राप्त गर्दा के तिनीहरूको प्राप्ताङ्कको अनुपात समानुपातिक छ?',
    en: 'Dipendra scored 25 out of 30, and Narmada scored 20 out of 24. Are their score ratios in proportion?',
    options: [
      { key: 'A', label: 'हो, दुवै ५/६ बराबर हुन्छन् (२५/३० = २०/२४ = ५/६)' },
      { key: 'B', label: 'होइन, प्राप्ताङ्क फरक छ' },
      { key: 'C', label: 'दीपेन्द्रको मात्र बढी छ' },
      { key: 'D', label: 'निर्णय गर्न सकिँदैन' },
    ],
    answer: 'A',
  },
  {
    np: 'समानुपातको आधारभूत नियम कुन हो?',
    en: 'What is the fundamental law of proportion?',
    options: [
      { key: 'A', label: 'चरम पदहरूको गुणनफल = मध्यम पदहरूको गुणनफल (a × d = b × c)' },
      { key: 'B', label: 'a + d = b + c' },
      { key: 'C', label: 'a - d = b - c' },
      { key: 'D', label: 'a × b = c × d' },
    ],
    answer: 'A',
  },
];

export const ProportionLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L6-02',
    titleEn: 'Proportion and Cross-Multiplication Lab',
    titleNp: 'समानुपात र बज्र गुणन प्रयोगशाला',
    chapter: 6,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'concept' | 'means-extremes' | 'checker' | 'solver'>('concept');

  // Tab 1: Equivalent Ratios to Proportion
  const [multiplier, setMultiplier] = useState<number>(2);
  const baseA = 2;
  const baseB = 3;

  // Tab 2: Means and Extremes Explorer
  const [valA, setValA] = useState<number>(25);
  const [valB, setValB] = useState<number>(30);
  const [valC, setValC] = useState<number>(20);
  const [valD, setValD] = useState<number>(24);
  const productExtremes = valA * valD;
  const productMeans = valB * valC;
  const isProp = productExtremes === productMeans;

  // Tab 3: 4-term Proportion Checker
  const [checkTerms, setCheckTerms] = useState<[number, number, number, number]>([3, 4, 9, 12]);
  const checkExtremes = checkTerms[0] * checkTerms[3];
  const checkMeans = checkTerms[1] * checkTerms[2];
  const checkResult = checkExtremes === checkMeans;

  // Tab 4: Missing Term Solver
  const [solveA, setSolveA] = useState<number>(3);
  const [solveB, setSolveB] = useState<number>(5);
  const [solveC, setSolveC] = useState<number>(12);
  // Missing term x (4th term d): x = (b * c) / a
  const solvedX = (solveB * solveC) / solveA;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'समानुपातमा चरम पदहरूको गुणनफल र मध्यम पदहरूको गुणनफल सधैँ बराबर हुन्छ (a × d = b × c)!',
        'In a proportion, the product of extremes equals the product of means (a × d = b × c)!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'concept', np: '१. समानुपातको अवधारणा', en: '1. Proportion Concept' },
            { id: 'means-extremes', np: '२. चरम र मध्यम पद (Extremes & Means)', en: '2. Extremes & Means' },
            { id: 'checker', np: '३. समानुपात परीक्षण (Proportion Checker)', en: '3. Proportion Checker' },
            { id: 'solver', np: '४. अज्ञात पद पत्ता लगाउने (Solve for x)', en: '4. Find Missing Term (x)' },
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

        {/* TAB 1: Concept & Equivalent Ratios */}
        {activeTab === 'concept' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('दुई बराबर अनुपातको समानता नै समानुपात हो', 'Equality of Two Ratios is Proportion')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'यदि a : b र c : d दुई बराबर अनुपातहरू हुन् भने, तिनीहरूको सम्बन्ध a : b :: c : d (पढ्दा: a का मुनि b समानुपात c का मुनि d) लेखिन्छ।',
                'If two ratios a : b and c : d are equal, their relation is written as a : b :: c : d (read: a is to b as c is to d).'
              )}
            </p>

            <div style={{ margin: '16px 0' }}>
              <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                {L('गुणक बदल्नुहोस् (Change Multiplier): ', 'Change Multiplier: ')} ×{multiplier}
              </label>
              <input
                type="range"
                min={2}
                max={6}
                value={multiplier}
                onChange={(e) => {
                  kit.tap();
                  setMultiplier(parseInt(e.target.value));
                }}
                style={{ width: 200 }}
              />
            </div>

            {/* Visual Equivalent Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
                padding: 16,
                background: '#F8FAFC',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ background: '#FFF', padding: 14, borderRadius: 8, border: '1px solid #CBD5E1' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0369A1' }}>
                  {L('आधार अनुपात (Base Ratio)', 'Base Ratio')}
                </span>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0284C7', margin: '8px 0' }}>
                  {baseA} : {baseB}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Array.from({ length: baseA }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 28,
                        height: 28,
                        background: '#38BDF8',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      A
                    </div>
                  ))}
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#94A3B8', margin: '0 4px' }}>:</span>
                  {Array.from({ length: baseB }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 28,
                        height: 28,
                        background: '#818CF8',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      B
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FFF', padding: 14, borderRadius: 8, border: '1px solid #CBD5E1' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                  {L(`×${multiplier} ले वृद्धि गर्दा प्राप्त समतुल्य अनुपात`, `Equivalent Ratio by ×${multiplier}`)}
                </span>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#16A34A', margin: '8px 0' }}>
                  {baseA * multiplier} : {baseB * multiplier}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {Array.from({ length: baseA * multiplier }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 22,
                        height: 22,
                        background: '#34D399',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        fontWeight: 700,
                        fontSize: 10,
                      }}
                    >
                      A
                    </div>
                  ))}
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#94A3B8', margin: '0 4px' }}>:</span>
                  {Array.from({ length: baseB * multiplier }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 22,
                        height: 22,
                        background: '#A78BFA',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        fontWeight: 700,
                        fontSize: 10,
                      }}
                    >
                      B
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Proportion Notation Box */}
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: '#ECFDF5',
                borderRadius: 10,
                border: '1px solid #6EE7B7',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>
                {L('समानुपातको रूप (Proportion Notation)', 'Proportion Notation')}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                {baseA} : {baseB} :: {baseA * multiplier} : {baseB * multiplier}
              </div>
              <div style={{ fontSize: 14, color: '#059669', marginTop: 4 }}>
                {L(
                  `अर्थात्: ${baseA}/${baseB} = ${baseA * multiplier}/${baseB * multiplier}`,
                  `That is: ${baseA}/${baseB} = ${baseA * multiplier}/${baseB * multiplier}`
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Extremes and Means Explorer */}
        {activeTab === 'means-extremes' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('चरम पद र मध्यम पद (Extremes and Means)', 'Extremes and Means')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'समानुपात a : b :: c : d मा पहिलो (a) र चौथो (d) पदलाई चरम पद (Extremes) भनिन्छ भने दोस्रो (b) र तेस्रो (c) पदलाई मध्यम पद (Means) भनिन्छ।',
                'In proportion a : b :: c : d, the 1st (a) and 4th (d) terms are Extremes, while the 2nd (b) and 3rd (c) terms are Means.'
              )}
            </p>

            {/* CDC Textbook Example: Dipendra vs Narmada Marks */}
            <div
              style={{
                background: '#FEF3C7',
                padding: 14,
                borderRadius: 8,
                border: '1px solid #FDE68A',
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 700, color: '#92400E', fontSize: 14 }}>
                📖 {L('पाठ्यपुस्तक उदाहरण (Dipendra & Narmada Marks):', 'CDC Textbook Example:')}
              </div>
              <div style={{ fontSize: 13, color: '#78350F', marginTop: 4 }}>
                {L(
                  'दीपेन्द्रले ३० पूर्णाङ्कमा २५ अङ्क ल्याए (२५ : ३० = ५ : ६)। नर्मदाले २४ पूर्णाङ्कमा २० अङ्क ल्याइन् (२० : २४ = ५ : ६)।',
                  'Dipendra got 25 out of 30 (25 : 30 = 5 : 6). Narmada got 20 out of 24 (20 : 24 = 5 : 6).'
                )}
                <br />
                {L(
                  'यहाँ २५ : ३० :: २० : २४ एक समानुपात हो।',
                  'Here 25 : 30 :: 20 : 24 forms a valid proportion.'
                )}
              </div>
            </div>

            {/* Visual Box with Highlighted Terms */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: 24,
                background: '#F1F5F9',
                borderRadius: 12,
                flexWrap: 'wrap',
              }}
            >
              {/* Term a */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626' }}>
                  {L('चरम (Extreme)', 'Extreme')} (a)
                </span>
                <input
                  type="number"
                  value={valA}
                  onChange={(e) => setValA(parseInt(e.target.value) || 0)}
                  style={{
                    width: 70,
                    padding: 8,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 800,
                    borderRadius: 8,
                    border: '2px solid #EF4444',
                    background: '#FEE2E2',
                    display: 'block',
                    marginTop: 4,
                  }}
                />
              </div>

              <span style={{ fontSize: 26, fontWeight: 800, color: '#64748B' }}>:</span>

              {/* Term b */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB' }}>
                  {L('मध्यम (Mean)', 'Mean')} (b)
                </span>
                <input
                  type="number"
                  value={valB}
                  onChange={(e) => setValB(parseInt(e.target.value) || 0)}
                  style={{
                    width: 70,
                    padding: 8,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 800,
                    borderRadius: 8,
                    border: '2px solid #3B82F6',
                    background: '#DBEAFE',
                    display: 'block',
                    marginTop: 4,
                  }}
                />
              </div>

              <span style={{ fontSize: 26, fontWeight: 800, color: '#187C68' }}>::</span>

              {/* Term c */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB' }}>
                  {L('मध्यम (Mean)', 'Mean')} (c)
                </span>
                <input
                  type="number"
                  value={valC}
                  onChange={(e) => setValC(parseInt(e.target.value) || 0)}
                  style={{
                    width: 70,
                    padding: 8,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 800,
                    borderRadius: 8,
                    border: '2px solid #3B82F6',
                    background: '#DBEAFE',
                    display: 'block',
                    marginTop: 4,
                  }}
                />
              </div>

              <span style={{ fontSize: 26, fontWeight: 800, color: '#64748B' }}>:</span>

              {/* Term d */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626' }}>
                  {L('चरम (Extreme)', 'Extreme')} (d)
                </span>
                <input
                  type="number"
                  value={valD}
                  onChange={(e) => setValD(parseInt(e.target.value) || 0)}
                  style={{
                    width: 70,
                    padding: 8,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 800,
                    borderRadius: 8,
                    border: '2px solid #EF4444',
                    background: '#FEE2E2',
                    display: 'block',
                    marginTop: 4,
                  }}
                />
              </div>
            </div>

            {/* Multiplication Comparison */}
            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                }}
              >
                <div style={{ color: '#B91C1C', fontWeight: 700, fontSize: 13 }}>
                  {L('चरम पदहरूको गुणनफल (Product of Extremes):', 'Product of Extremes:')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#991B1B', marginTop: 4 }}>
                  a × d = {valA} × {valD} = {productExtremes}
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                }}
              >
                <div style={{ color: '#1D4ED8', fontWeight: 700, fontSize: 13 }}>
                  {L('मध्यम पदहरूको गुणनफल (Product of Means):', 'Product of Means:')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>
                  b × c = {valB} × {valC} = {productMeans}
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 8,
                background: isProp ? '#ECFDF5' : '#FEF2F2',
                border: `2px solid ${isProp ? '#10B981' : '#EF4444'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {isProp ? <Check size={28} color="#10B981" /> : <X size={28} color="#EF4444" />}
              <div>
                <strong style={{ color: isProp ? '#065F46' : '#991B1B', fontSize: 16 }}>
                  {isProp
                    ? L(
                        `समानुपात प्रमाणित भयो! (a × d = b × c = ${productExtremes})`,
                        `Proportion Verified! (a × d = b × c = ${productExtremes})`
                      )
                    : L(
                        `समानुपात होइन! (a × d = ${productExtremes} ≠ b × c = ${productMeans})`,
                        `Not in Proportion! (Extremes = ${productExtremes} ≠ Means = ${productMeans})`
                      )}
                </strong>
                <div style={{ fontSize: 12, color: isProp ? '#047857' : '#B91C1C', marginTop: 2 }}>
                  {isProp
                    ? L('दुवै गुणनफल बराबर भएकाले यी सङ्ख्याहरू समानुपातिक छन्।', 'Both products are equal, hence proportional.')
                    : L('गुणनफल बराबर नभएकाले यी सङ्ख्याहरू समानुपातिक छैनन्।', 'Products are not equal, hence not proportional.')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Proportion Checker */}
        {activeTab === 'checker' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('समानुपात परीक्षण (Checking if 4 quantities are in proportion)', 'Check if 4 quantities are in proportion')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'तलका अभ्यासका उदाहरणहरू परीक्षण गर्नुहोस् वा आफ्नै ४ सङ्ख्याहरू राख्नुहोस्:',
                'Test textbook exercises or enter any 4 numbers to check if they form a proportion:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '14px 0' }}>
              {[
                { terms: [3, 4, 9, 12] as [number, number, number, number], label: '३, ४, ९, १२ (पाठ्यपुस्तक क)' },
                { terms: [7, 8, 14, 20] as [number, number, number, number], label: '७, ८, १४, २० (पाठ्यपुस्तक ख)' },
                { terms: [5, 15, 8, 24] as [number, number, number, number], label: '५, १५, ८, २४' },
                { terms: [12, 16, 18, 24] as [number, number, number, number], label: '१२, १६, १८, २४' },
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    kit.tap();
                    setCheckTerms(ex.terms);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    background: '#F1F5F9',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                margin: '20px 0',
                flexWrap: 'wrap',
              }}
            >
              {[0, 1, 2, 3].map((pos) => (
                <div key={pos} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="number"
                    value={checkTerms[pos]}
                    onChange={(e) => {
                      const newT = [...checkTerms] as [number, number, number, number];
                      newT[pos] = parseInt(e.target.value) || 0;
                      setCheckTerms(newT);
                    }}
                    style={{
                      width: 65,
                      padding: 8,
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: 18,
                      borderRadius: 8,
                      border: '2px solid #CBD5E1',
                    }}
                  />
                  {pos === 0 && <span style={{ fontWeight: 800, fontSize: 18 }}>,</span>}
                  {pos === 1 && <span style={{ fontWeight: 800, fontSize: 18 }}>,</span>}
                  {pos === 2 && <span style={{ fontWeight: 800, fontSize: 18 }}>,</span>}
                </div>
              ))}
            </div>

            <div
              style={{
                padding: 16,
                background: '#F8FAFC',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                lineHeight: 1.8,
              }}
            >
              <div>
                <strong>{L('१. चरम पदहरूको गुणनफल:', '1. Product of Extremes:')}</strong> {checkTerms[0]} ×{' '}
                {checkTerms[3]} = <span style={{ fontWeight: 800, color: '#DC2626' }}>{checkExtremes}</span>
              </div>
              <div>
                <strong>{L('२. मध्यम पदहरूको गुणनफल:', '2. Product of Means:')}</strong> {checkTerms[1]} ×{' '}
                {checkTerms[2]} = <span style={{ fontWeight: 800, color: '#2563EB' }}>{checkMeans}</span>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 16,
                  fontWeight: 800,
                  color: checkResult ? '#059669' : '#DC2626',
                }}
              >
                {checkResult
                  ? L(
                      `नतिजा: ${checkExtremes} = ${checkMeans} (बराबर छ), त्यसैले यी पदहरू समानुपातिक हुन्।`,
                      `Result: ${checkExtremes} = ${checkMeans} (Equal), so they form a proportion.`
                    )
                  : L(
                      `नतिजा: ${checkExtremes} ≠ ${checkMeans} (बराबर छैन), त्यसैले यी पदहरू समानुपातिक होइनन्।`,
                      `Result: ${checkExtremes} ≠ ${checkMeans} (Not equal), so they do NOT form a proportion.`
                    )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Missing Term Solver */}
        {activeTab === 'solver' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('अज्ञात पद (x) पत्ता लगाउने बज्र गुणन विधि', 'Find Missing Term (x) via Cross-Multiplication')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'यदि समानुपातमा कुनै एउटा पद थाहा नभएमा चरम र मध्यम पदहरूको गुणनफल नियम (बज्र गुणन) प्रयोग गरी x को मान पत्ता लगाउन सकिन्छ।',
                'If one term in a proportion is unknown, use the cross-multiplication rule to solve for x.'
              )}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '20px 0',
                flexWrap: 'wrap',
                background: '#EEF2FF',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #C7D2FE',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4338CA' }}>a</span>
                <input
                  type="number"
                  value={solveA}
                  onChange={(e) => setSolveA(parseInt(e.target.value) || 1)}
                  style={{
                    width: 60,
                    padding: 6,
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: 18,
                    borderRadius: 6,
                    border: '1px solid #818CF8',
                    display: 'block',
                    marginTop: 4,
                  }}
                />
              </div>

              <span style={{ fontSize: 24, fontWeight: 800, color: '#6366F1' }}>:</span>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4338CA' }}>b</span>
                <input
                  type="number"
                  value={solveB}
                  onChange={(e) => setSolveB(parseInt(e.target.value) || 1)}
                  style={{
                    width: 60,
                    padding: 6,
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: 18,
                    borderRadius: 6,
                    border: '1px solid #818CF8',
                    display: 'block',
                    marginTop: 4,
                  }}
                />
              </div>

              <span style={{ fontSize: 24, fontWeight: 800, color: '#4F46E5' }}>::</span>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4338CA' }}>c</span>
                <input
                  type="number"
                  value={solveC}
                  onChange={(e) => setSolveC(parseInt(e.target.value) || 1)}
                  style={{
                    width: 60,
                    padding: 6,
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: 18,
                    borderRadius: 6,
                    border: '1px solid #818CF8',
                    display: 'block',
                    marginTop: 4,
                  }}
                />
              </div>

              <span style={{ fontSize: 24, fontWeight: 800, color: '#6366F1' }}>:</span>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>x (चौथो पद)</span>
                <div
                  style={{
                    width: 60,
                    padding: 6,
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: 18,
                    borderRadius: 6,
                    background: '#FEE2E2',
                    border: '2px solid #EF4444',
                    color: '#B91C1C',
                    marginTop: 4,
                  }}
                >
                  x
                </div>
              </div>
            </div>

            {/* Step-by-Step Solver */}
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
                <strong>{L('१. सुत्र:', '1. Formula:')}</strong> a × x = b × c (चरम पदहरूको गुणन = मध्यम पदहरूको गुणन)
              </div>
              <div>
                <strong>{L('२. मान राख्दा:', '2. Substituting values:')}</strong> {solveA} × x = {solveB} × {solveC}
              </div>
              <div>
                <strong>{L('३. गुणन गर्दा:', '3. Multiplying:')}</strong> {solveA}x = {solveB * solveC}
              </div>
              <div>
                <strong>{L('४. बज्र गुणन र भाग गर्दा:', '4. Cross-dividing:')}</strong> x = {solveB * solveC} ÷ {solveA}
              </div>
              <div
                style={{
                  marginTop: 8,
                  padding: '8px 12px',
                  background: '#ECFDF5',
                  borderRadius: 6,
                  border: '1px solid #34D399',
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#065F46',
                }}
              >
                x = {Number.isInteger(solvedX) ? solvedX : solvedX.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ProportionLab;
