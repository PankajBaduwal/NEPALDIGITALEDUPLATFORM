import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface ExpressionCase {
  id: string;
  nameEn: string;
  nameNp: string;
  type: 'common' | 'diff_sq' | 'cubes' | 'trinomial' | 'fourth_deg';
  expr: string;
  steps: {
    titleEn: string;
    titleNp: string;
    detail: string;
    rule: string;
  }[];
  factors: string[];
  testVal: number;
  evalOriginal: (x: number) => number;
  evalFactored: (x: number) => number;
}

const CASES: ExpressionCase[] = [
  {
    id: 'c1',
    nameEn: 'Common Term Taking',
    nameNp: 'साझा पद लिने',
    type: 'common',
    expr: '4x³ - 12x²',
    steps: [
      {
        titleEn: 'Find HCF of coefficients',
        titleNp: 'गुणाङ्कहरूको म.स. पत्ता लगाउने',
        detail: 'Factors of 4 = 2 × 2; Factors of 12 = 2 × 2 × 3 → Common coefficient = 4',
        rule: 'HCF (4, 12) = 4',
      },
      {
        titleEn: 'Find lowest power of variable x',
        titleNp: 'चल राशि x को न्यूनतम घात लिने',
        detail: 'x³ and x² have x² in common',
        rule: 'Lowest power = x²',
      },
      {
        titleEn: 'Divide each term by 4x²',
        titleNp: 'प्रत्येक पदलाई 4x² ले भाग गर्ने',
        detail: '4x³ / 4x² = x and -12x² / 4x² = -3',
        rule: '4x²(x - 3)',
      },
    ],
    factors: ['4x²', '(x - 3)'],
    testVal: 2,
    evalOriginal: (x) => 4 * Math.pow(x, 3) - 12 * Math.pow(x, 2),
    evalFactored: (x) => 4 * Math.pow(x, 2) * (x - 3),
  },
  {
    id: 'c2',
    nameEn: 'Difference of Two Squares',
    nameNp: 'दुई वर्गको अन्तर (a² - b²)',
    type: 'diff_sq',
    expr: '9x² - 25',
    steps: [
      {
        titleEn: 'Express each term as a complete square',
        titleNp: 'प्रत्येक पदलाई पूर्ण वर्ग बनाउने',
        detail: '9x² = (3x)² and 25 = (5)²',
        rule: '(3x)² - (5)²',
      },
      {
        titleEn: 'Apply identity a² - b² = (a - b)(a + b)',
        titleNp: 'सर्वसमिका a² - b² = (a - b)(a + b) प्रयोग गर्ने',
        detail: 'Here a = 3x and b = 5',
        rule: '(3x - 5)(3x + 5)',
      },
    ],
    factors: ['(3x - 5)', '(3x + 5)'],
    testVal: 3,
    evalOriginal: (x) => 9 * Math.pow(x, 2) - 25,
    evalFactored: (x) => (3 * x - 5) * (3 * x + 5),
  },
  {
    id: 'c3',
    nameEn: 'Trinomial Factoring (Middle Term Split)',
    nameNp: 'त्रिपदीय अभिव्यक्तिको खण्डीकरण (मध्यपद विभाजन)',
    type: 'trinomial',
    expr: 'x² + 7x + 12',
    steps: [
      {
        titleEn: 'Identify product and sum requirements',
        titleNp: 'गुणनफल र योगफल पत्ता लगाउने',
        detail: 'Product p × q = 12, Sum p + q = 7. Factors of 12 summing to 7 are 3 and 4.',
        rule: '3 × 4 = 12, 3 + 4 = 7',
      },
      {
        titleEn: 'Split middle term 7x into 3x + 4x',
        titleNp: 'मध्यपद 7x लाई 3x + 4x मा विभाजन गर्ने',
        detail: 'x² + 3x + 4x + 12',
        rule: 'x(x + 3) + 4(x + 3)',
      },
      {
        titleEn: 'Take common binomial (x + 3)',
        titleNp: 'साझा खण्ड (x + 3) लिने',
        detail: '(x + 3)(x + 4)',
        rule: '(x + 3)(x + 4)',
      },
    ],
    factors: ['(x + 3)', '(x + 4)'],
    testVal: 2,
    evalOriginal: (x) => Math.pow(x, 2) + 7 * x + 12,
    evalFactored: (x) => (x + 3) * (x + 4),
  },
  {
    id: 'c4',
    nameEn: 'Difference of Two Cubes',
    nameNp: 'दुई घनको अन्तर (a³ - b³)',
    type: 'cubes',
    expr: 'x³ - 8',
    steps: [
      {
        titleEn: 'Write as difference of cubes',
        titleNp: 'घनको अन्तरको रूपमा लेख्ने',
        detail: 'x³ - (2)³',
        rule: 'a = x, b = 2',
      },
      {
        titleEn: 'Apply formula a³ - b³ = (a - b)(a² + ab + b²)',
        titleNp: 'सूत्र a³ - b³ = (a - b)(a² + ab + b²) प्रयोग गर्ने',
        detail: '(x - 2)(x² + 2x + 2²)',
        rule: '(x - 2)(x² + 2x + 4)',
      },
    ],
    factors: ['(x - 2)', '(x² + 2x + 4)'],
    testVal: 3,
    evalOriginal: (x) => Math.pow(x, 3) - 8,
    evalFactored: (x) => (x - 2) * (Math.pow(x, 2) + 2 * x + 4),
  },
  {
    id: 'c5',
    nameEn: 'Fourth-Degree Expression (a⁴ + a²b² + b⁴)',
    nameNp: 'चौथो घातको अभिव्यक्ति (a⁴ + a²b² + b⁴)',
    type: 'fourth_deg',
    expr: 'x⁴ + x² + 1',
    steps: [
      {
        titleEn: 'Group first and third terms as squares',
        titleNp: 'पहिलो र तेस्रो पदलाई पूर्ण वर्ग बनाउने',
        detail: '(x²)² + (1)² + x² = (x² + 1)² - 2(x²)(1) + x²',
        rule: '(x² + 1)² - x²',
      },
      {
        titleEn: 'Apply difference of two squares',
        titleNp: 'दुई वर्गको अन्तर सूत्र प्रयोग गर्ने',
        detail: '(x² + 1 - x)(x² + 1 + x)',
        rule: '(x² - x + 1)(x² + x + 1)',
      },
    ],
    factors: ['(x² - x + 1)', '(x² + x + 1)'],
    testVal: 2,
    evalOriginal: (x) => Math.pow(x, 4) + Math.pow(x, 2) + 1,
    evalFactored: (x) => (Math.pow(x, 2) - x + 1) * (Math.pow(x, 2) + x + 1),
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'x² - 9 लाई खण्डीकरण गर्दा कुन सूत्र प्रयोग हुन्छ?',
    en: 'Which formula is used to factorize x² - 9?',
    options: [
      { key: 'A', label: 'a² - b² = (a - b)(a + b)' },
      { key: 'B', label: 'a³ - b³ = (a - b)(a² + ab + b²)' },
      { key: 'C', label: '(a + b)² = a² + 2ab + b²' },
      { key: 'D', label: 'a³ + b³ = (a + b)(a² - ab + b²)' },
    ],
    answer: 'A',
  },
  {
    np: 'x³ - 8 को खण्डीकरण कुन हो?',
    en: 'What is the factorization of x³ - 8?',
    options: [
      { key: 'A', label: '(x - 2)(x² + 2x + 4)' },
      { key: 'B', label: '(x - 2)(x² - 2x + 4)' },
      { key: 'C', label: '(x + 2)(x² - 2x + 4)' },
      { key: 'D', label: '(x - 2)³' },
    ],
    answer: 'A',
  },
  {
    np: 'त्रिपदीय अभिव्यक्ति x² + 5x + 6 मा मध्यपद 5x लाई कसरी टुक्राउन सकिन्छ?',
    en: 'In trinomial expression x² + 5x + 6, how is the middle term 5x split?',
    options: [
      { key: 'A', label: '2x + 3x' },
      { key: 'B', label: '1x + 4x' },
      { key: 'C', label: '6x - 1x' },
      { key: 'D', label: '3x + 3x' },
    ],
    answer: 'A',
  },
];

export const AlgebraicFactorizationExplorer: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U10-01',
    chapter: 10,
    titleNp: 'बीजीय खण्डीकरण अन्वेषक',
    titleEn: 'Algebraic Factorization Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [selectedCaseId, setSelectedCaseId] = useState<string>('c1');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [customX, setCustomX] = useState<number>(3);
  const [showVerification, setShowVerification] = useState<boolean>(true);

  const currentCase = CASES.find((c) => c.id === selectedCaseId) || CASES[0];
  const origVal = currentCase.evalOriginal(customX);
  const factVal = currentCase.evalFactored(customX);
  const isEqual = Math.abs(origVal - factVal) < 1e-6;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! बीजीय अभिव्यक्तिका विभिन्न खण्डीकरण विधिहरू (साझा लिने, वर्गको अन्तर, घनको जोड/घटाउ र त्रिपदीय मध्यपद विभाजन) यहाँ प्रत्यक्ष अभ्यास गर्नुहोस्!',
        'Welcome! Explore various algebraic factorization techniques (common terms, difference of squares, sum/diff of cubes, and trinomials) step-by-step!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Case Selector Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCaseId(c.id);
                setActiveStep(0);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: selectedCaseId === c.id ? '2px solid #0D9488' : '1px solid #CBD5E1',
                backgroundColor: selectedCaseId === c.id ? '#F0FDFA' : '#FFFFFF',
                color: selectedCaseId === c.id ? '#0F766E' : '#475569',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: isNe ? FONT_NP : 'inherit',
                fontSize: 13,
                boxShadow: selectedCaseId === c.id ? '0 2px 4px rgba(13,148,136,0.15)' : 'none',
              }}
            >
              {L(c.nameNp, c.nameEn)}: <span style={{ fontFamily: 'monospace' }}>{c.expr}</span>
            </button>
          ))}
        </div>

        {/* Main Interactive Stage */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)',
            gap: 16,
          }}
        >
          {/* Left: Step-by-Step Breakdown */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F766E' }}>
                {L('मूल अभिव्यक्ति:', 'Original Expression:')}
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#1E293B',
                  fontFamily: 'monospace',
                  background: '#F1F5F9',
                  padding: '4px 10px',
                  borderRadius: 6,
                }}
              >
                {currentCase.expr}
              </span>
            </div>

            <div style={{ borderBottom: '1px solid #E2E8F0', margin: '4px 0' }} />

            <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              {L('चरणबद्ध समाधान (Steps):', 'Step-by-Step Resolution:')}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentCase.steps.map((st, idx) => {
                const isCurrent = idx === activeStep;
                const isPassed = idx < activeStep;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border: isCurrent
                        ? '2px solid #0D9488'
                        : isPassed
                        ? '1px solid #99F6E4'
                        : '1px solid #E2E8F0',
                      backgroundColor: isCurrent ? '#F0FDFA' : isPassed ? '#F8FAFC' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: isCurrent ? '#0D9488' : isPassed ? '#14B8A6' : '#94A3B8',
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {fmt(idx + 1)}
                      </span>
                      <strong style={{ fontSize: 13, color: '#1E293B' }}>
                        {L(st.titleNp, st.titleEn)}
                      </strong>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, paddingLeft: 32 }}>
                      {st.detail}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        paddingLeft: 32,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#0F766E',
                        fontSize: 13,
                      }}
                    >
                      {st.rule}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: activeStep === 0 ? '#F1F5F9' : '#FFFFFF',
                  color: activeStep === 0 ? '#94A3B8' : '#334155',
                  cursor: activeStep === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                }}
              >
                ← {L('अघिल्लो चरण', 'Previous Step')}
              </button>
              <button
                disabled={activeStep >= currentCase.steps.length - 1}
                onClick={() =>
                  setActiveStep((prev) => Math.min(currentCase.steps.length - 1, prev + 1))
                }
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor:
                    activeStep >= currentCase.steps.length - 1 ? '#94A3B8' : '#0D9488',
                  color: '#FFFFFF',
                  cursor: activeStep >= currentCase.steps.length - 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {L('अर्को चरण', 'Next Step')} →
              </button>
            </div>
          </div>

          {/* Right: Factor Cards & Verification Lab */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Factored Result Banner */}
            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>
                {L('अन्तिम खण्डहरू (Final Factors):', 'Final Factors:')}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  marginTop: 10,
                  flexWrap: 'wrap',
                }}
              >
                {currentCase.factors.map((fac, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #10B981',
                        borderRadius: 8,
                        fontFamily: 'monospace',
                        fontSize: 16,
                        fontWeight: 800,
                        color: '#065F46',
                        boxShadow: '0 2px 4px rgba(16,185,129,0.1)',
                      }}
                    >
                      {fac}
                    </div>
                    {idx < currentCase.factors.length - 1 && (
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>×</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#047857' }}>
                {L(
                  'यी खण्डहरूलाई गुणन गर्दा पुनः सुरुको अभिव्यक्ति प्राप्त हुन्छ।',
                  'Multiplying these factor terms back together reconstructs the original expression.'
                )}
              </div>
            </div>

            {/* Verification Slider */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                  {L('संख्यात्मक प्रमाणीकरण (Numerical Proof):', 'Numerical Proof Verification:')}
                </span>
                <label style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={showVerification}
                    onChange={(e) => setShowVerification(e.target.checked)}
                  />
                  {L('प्रमाणीकरण देखाउने', 'Show Proof')}
                </label>
              </div>

              {showVerification && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, color: '#475569', minWidth: 60 }}>
                      x = <strong>{fmt(customX)}</strong>
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      step={1}
                      value={customX}
                      onChange={(e) => setCustomX(Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#0D9488' }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                      backgroundColor: '#F8FAFC',
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {L('मूल अभिव्यक्तिको मान:', 'Original Expression Value:')}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                        {currentCase.expr.replace(/x/g, `(${customX})`)} ={' '}
                        <span style={{ color: '#0D9488' }}>{fmt(origVal)}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {L('खण्डीकृत गुणनफलको मान:', 'Factored Form Value:')}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                        {currentCase.factors.join('').replace(/x/g, `${customX}`)} ={' '}
                        <span style={{ color: '#0D9488' }}>{fmt(factVal)}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      backgroundColor: isEqual ? '#F0FDF4' : '#FEF2F2',
                      borderRadius: 6,
                      color: isEqual ? '#15803D' : '#B91C1C',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <span>{isEqual ? '✓' : '✗'}</span>
                    <span>
                      {isEqual
                        ? L(
                            `प्रमाणित: मूल अभिव्यक्ति र खण्डीकृत स्वरूप दुवै बराबर छन् (${fmt(origVal)} = ${fmt(factVal)})!`,
                            `Verified: Original expression and factored form yield identical results (${origVal} = ${factVal})!`
                          )
                        : L('मानहरू मिलेनन्।', 'Values do not match.')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default AlgebraicFactorizationExplorer;
