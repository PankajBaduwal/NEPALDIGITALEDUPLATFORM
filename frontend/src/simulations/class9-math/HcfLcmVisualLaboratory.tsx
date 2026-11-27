import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface HcfLcmProblem {
  id: string;
  nameNp: string;
  nameEn: string;
  numExpressions: 2 | 3;
  expressions: {
    labelNp: string;
    labelEn: string;
    raw: string;
    factors: string[];
  }[];
  commonFactorsAll: string[];
  commonFactorsTwo?: string[];
  remainingFactors: { exprIndex: number; factor: string }[];
  hcf: string;
  lcm: string;
  explanationNp: string;
  explanationEn: string;
}

const PROBLEMS: HcfLcmProblem[] = [
  {
    id: 'p1',
    nameNp: '2 अभिव्यक्तिको म.स. र ल.स.',
    nameEn: 'HCF & LCM of 2 Expressions (Squares & Common)',
    numExpressions: 2,
    expressions: [
      {
        labelNp: 'पहिलो अभिव्यक्ति',
        labelEn: 'First Expression',
        raw: 'x² - 4',
        factors: ['(x - 2)', '(x + 2)'],
      },
      {
        labelNp: 'दोस्रो अभिव्यक्ति',
        labelEn: 'Second Expression',
        raw: 'x² - 5x + 6',
        factors: ['(x - 2)', '(x - 3)'],
      },
    ],
    commonFactorsAll: ['(x - 2)'],
    remainingFactors: [
      { exprIndex: 0, factor: '(x + 2)' },
      { exprIndex: 1, factor: '(x - 3)' },
    ],
    hcf: '(x - 2)',
    lcm: '(x - 2)(x + 2)(x - 3)',
    explanationNp:
      'म.स. = Common गुणनखण्ड = (x - 2)\nल.स. = Common गुणनखण्ड × बाँकी गुणनखण्डहरू = (x - 2)(x + 2)(x - 3)',
    explanationEn:
      'HCF = Common factors = (x - 2)\nLCM = Common factor × Remaining factors = (x - 2)(x + 2)(x - 3)',
  },
  {
    id: 'p2',
    nameNp: '2 अभिव्यक्तिको म.स. र ल.स.',
    nameEn: 'HCF & LCM of 2 Expressions (Cubes & Squares)',
    numExpressions: 2,
    expressions: [
      {
        labelNp: 'पहिलो अभिव्यक्ति',
        labelEn: 'First Expression',
        raw: 'x³ - 8',
        factors: ['(x - 2)', '(x² + 2x + 4)'],
      },
      {
        labelNp: 'दोस्रो अभिव्यक्ति',
        labelEn: 'Second Expression',
        raw: 'x² - 4',
        factors: ['(x - 2)', '(x + 2)'],
      },
    ],
    commonFactorsAll: ['(x - 2)'],
    remainingFactors: [
      { exprIndex: 0, factor: '(x² + 2x + 4)' },
      { exprIndex: 1, factor: '(x + 2)' },
    ],
    hcf: '(x - 2)',
    lcm: '(x - 2)(x + 2)(x² + 2x + 4)',
    explanationNp:
      'म.स. = Common गुणनखण्ड = (x - 2)\nल.स. = (x - 2)(x + 2)(x² + 2x + 4)',
    explanationEn:
      'HCF = Common factor = (x - 2)\nLCM = (x - 2)(x + 2)(x² + 2x + 4)',
  },
  {
    id: 'p3',
    nameNp: '3 अभिव्यक्तिको म.स. र ल.स.',
    nameEn: 'HCF & LCM of 3 Expressions',
    numExpressions: 3,
    expressions: [
      {
        labelNp: 'पहिलो अभिव्यक्ति',
        labelEn: '1st Expression',
        raw: 'x² - 9',
        factors: ['(x - 3)', '(x + 3)'],
      },
      {
        labelNp: 'दोस्रो अभिव्यक्ति',
        labelEn: '2nd Expression',
        raw: 'x² + 6x + 9',
        factors: ['(x + 3)', '(x + 3)'],
      },
      {
        labelNp: 'तेस्रो अभिव्यक्ति',
        labelEn: '3rd Expression',
        raw: 'x³ + 27',
        factors: ['(x + 3)', '(x² - 3x + 9)'],
      },
    ],
    commonFactorsAll: ['(x + 3)'],
    remainingFactors: [
      { exprIndex: 0, factor: '(x - 3)' },
      { exprIndex: 1, factor: '(x + 3)' },
      { exprIndex: 2, factor: '(x² - 3x + 9)' },
    ],
    hcf: '(x + 3)',
    lcm: '(x + 3)(x - 3)(x + 3)(x² - 3x + 9)',
    explanationNp:
      'तीनवटैमा Common गुणनखण्ड = (x + 3) → म.स. = (x + 3)\nल.स. = Common × बाँकी = (x + 3)(x - 3)(x + 3)(x² - 3x + 9)',
    explanationEn:
      'Common to all 3 = (x + 3) → HCF = (x + 3)\nLCM = Common all × Remaining = (x + 3)(x - 3)(x + 3)(x² - 3x + 9)',
  },
  {
    id: 'p4',
    nameNp: 'संख्यात्मक गुणाङ्क सहितको म.स. र ल.स.',
    nameEn: 'HCF & LCM with Coefficients',
    numExpressions: 2,
    expressions: [
      {
        labelNp: 'पहिलो अभिव्यक्ति',
        labelEn: '1st Expression',
        raw: '6x² - 24',
        factors: ['6', '(x - 2)', '(x + 2)'],
      },
      {
        labelNp: 'दोस्रो अभिव्यक्ति',
        labelEn: '2nd Expression',
        raw: '9x - 18',
        factors: ['9', '(x - 2)'],
      },
    ],
    commonFactorsAll: ['3', '(x - 2)'],
    remainingFactors: [
      { exprIndex: 0, factor: '2' },
      { exprIndex: 0, factor: '(x + 2)' },
      { exprIndex: 1, factor: '3' },
    ],
    hcf: '3(x - 2)',
    lcm: '18(x - 2)(x + 2)',
    explanationNp:
      'गुणाङ्क 6 र 9 को म.स. = 3, बीजीय Common = (x - 2) → म.स. = 3(x - 2)\nल.स. = 18(x - 2)(x + 2)',
    explanationEn:
      'HCF of 6 & 9 = 3, Common binomial = (x - 2) → HCF = 3(x - 2)\nLCM = 18(x - 2)(x + 2)',
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'म.स. (HCF) र ल.स. (LCM) को सही परिभाषा कुन हो?',
    en: 'What is the correct mathematical definition of HCF and LCM?',
    options: [
      { key: 'A', label: 'HCF = product of common factors; LCM = common × remaining factors' },
      { key: 'B', label: 'HCF = sum of all factors' },
      { key: 'C', label: 'LCM = common factors only' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
  {
    np: 'x² - 4 र x - 2 को म.स. (HCF) कति हुन्छ?',
    en: 'What is the HCF of x² - 4 and x - 2?',
    options: [
      { key: 'A', label: 'x - 2' },
      { key: 'B', label: 'x + 2' },
      { key: 'C', label: '(x - 2)(x + 2)' },
      { key: 'D', label: '1' },
    ],
    answer: 'A',
  },
  {
    np: 'दुई बीजीय अभिव्यक्तिको गुणनफल (A × B) र तिनीहरूको HCF तथा LCM बीचको सम्बन्ध के हो?',
    en: 'What is the relationship between product of two expressions (A × B) and their HCF & LCM?',
    options: [
      { key: 'A', label: 'First expression × second expression = HCF × LCM' },
      { key: 'B', label: 'First + second = HCF + LCM' },
      { key: 'C', label: 'HCF = LCM' },
      { key: 'D', label: 'No relation' },
    ],
    answer: 'A',
  },
];

export const HcfLcmVisualLaboratory: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U10-02',
    chapter: 10,
    titleNp: 'म.स. र ल.स. दृश्य प्रयोगशाला',
    titleEn: 'HCF and LCM Visual Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [selectedProbId, setSelectedProbId] = useState<string>('p1');
  const [highlightMode, setHighlightMode] = useState<'all' | 'common' | 'remaining'>('all');

  const prob = PROBLEMS.find((p) => p.id === selectedProbId) || PROBLEMS[0];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'स्वागत छ! यहाँ दुई वा तीन बीजीय अभिव्यक्तिहरूको खण्डीकरण गरी Common (Common) र बाँकी (Remaining) गुणनखण्डहरू छुट्याएर म.स. र ल.स. पत्ता लगाउनुहोस्!',
        'Welcome! Factorize 2 or 3 algebraic expressions, isolate common and remaining factors, and derive HCF and LCM visually!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Problem Selector Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {PROBLEMS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProbId(p.id);
                setHighlightMode('all');
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: selectedProbId === p.id ? '2px solid #2563EB' : '1px solid #CBD5E1',
                backgroundColor: selectedProbId === p.id ? '#EFF6FF' : '#FFFFFF',
                color: selectedProbId === p.id ? '#1D4ED8' : '#475569',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: isNe ? FONT_NP : 'inherit',
                fontSize: 13,
              }}
            >
              {L(p.nameNp, p.nameEn)}
            </button>
          ))}
        </div>

        {/* Filter / Highlight Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            backgroundColor: '#F8FAFC',
            padding: 10,
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', alignSelf: 'center' }}>
            {L('दृश्यावलोकन:', 'Highlight Mode:')}
          </span>
          <button
            onClick={() => setHighlightMode('all')}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: highlightMode === 'all' ? '2px solid #3B82F6' : '1px solid #CBD5E1',
              backgroundColor: highlightMode === 'all' ? '#DBEAFE' : '#FFFFFF',
              color: highlightMode === 'all' ? '#1E40AF' : '#475569',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {L('सबै गुणनखण्डहरू (All Factors)', 'All Factors')}
          </button>
          <button
            onClick={() => setHighlightMode('common')}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: highlightMode === 'common' ? '2px solid #059669' : '1px solid #CBD5E1',
              backgroundColor: highlightMode === 'common' ? '#D1FAE5' : '#FFFFFF',
              color: highlightMode === 'common' ? '#065F46' : '#475569',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {L('Common गुणनखण्ड मात्र (HCF Focus)', 'Common Factors (HCF)')}
          </button>
          <button
            onClick={() => setHighlightMode('remaining')}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: highlightMode === 'remaining' ? '2px solid #D97706' : '1px solid #CBD5E1',
              backgroundColor: highlightMode === 'remaining' ? '#FEF3C7' : '#FFFFFF',
              color: highlightMode === 'remaining' ? '#92400E' : '#475569',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {L('बाँकी गुणनखण्ड (Remaining Factors)', 'Remaining Factors')}
          </button>
        </div>

        {/* Expressions & Factors Visual Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${prob.expressions.length}, 1fr)`,
            gap: 14,
          }}
        >
          {prob.expressions.map((exp, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 16,
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
                  {L(exp.labelNp, exp.labelEn)}
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#1E293B',
                    backgroundColor: '#F1F5F9',
                    padding: '3px 8px',
                    borderRadius: 6,
                  }}
                >
                  {exp.raw}
                </span>
              </div>

              <div style={{ borderBottom: '1px solid #E2E8F0' }} />

              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                {L('खण्डीकृत रूप (Factorized Form):', 'Factorized Form:')}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {exp.factors.map((f, fIdx) => {
                  const isCommon = prob.commonFactorsAll.includes(f);
                  const isHighlighted =
                    highlightMode === 'all' ||
                    (highlightMode === 'common' && isCommon) ||
                    (highlightMode === 'remaining' && !isCommon);

                  return (
                    <div
                      key={fIdx}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontFamily: 'monospace',
                        fontSize: 14,
                        fontWeight: 700,
                        backgroundColor: isCommon ? '#ECFDF5' : '#FFFBEB',
                        border: isCommon ? '2px solid #10B981' : '1px solid #FCD34D',
                        color: isCommon ? '#065F46' : '#92400E',
                        opacity: isHighlighted ? 1 : 0.25,
                        transition: 'opacity 0.2s',
                        boxShadow: isCommon ? '0 1px 3px rgba(16,185,129,0.2)' : 'none',
                      }}
                    >
                      {f}
                      {isCommon && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 10,
                            padding: '1px 4px',
                            borderRadius: 4,
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            verticalAlign: 'middle',
                          }}
                        >
                          Common
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Calculation Result Summary: HCF & LCM */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          {/* HCF Box */}
          <div
            style={{
              backgroundColor: '#F0FDF4',
              borderRadius: 12,
              border: '2px solid #86EFAC',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                H
              </span>
              <strong style={{ fontSize: 14, color: '#065F46' }}>
                {L('महत्तम समापवर्तक (HCF)', 'Highest Common Factor (HCF)')}
              </strong>
            </div>
            <div style={{ fontSize: 12, color: '#166534' }}>
              {L('सबै अभिव्यक्तिहरूमा उपस्थित Common गुणनखण्डहरूको गुणनफल:', 'Product of common factors occurring in all expressions:')}
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 18,
                fontWeight: 800,
                color: '#065F46',
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #A7F3D0',
              }}
            >
              HCF = {prob.hcf}
            </div>
          </div>

          {/* LCM Box */}
          <div
            style={{
              backgroundColor: '#EFF6FF',
              borderRadius: 12,
              border: '2px solid #93C5FD',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF',
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                L
              </span>
              <strong style={{ fontSize: 14, color: '#1E40AF' }}>
                {L('लघुत्तम समापवर्त्य (LCM)', 'Lowest Common Multiple (LCM)')}
              </strong>
            </div>
            <div style={{ fontSize: 12, color: '#1E40AF' }}>
              {L('Common गुणनखण्ड × बाँकी सबै गुणनखण्डहरू:', 'Common factors × All remaining uncommon factors:')}
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 16,
                fontWeight: 800,
                color: '#1E40AF',
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #BFDBFE',
              }}
            >
              LCM = {prob.lcm}
            </div>
          </div>
        </div>

        {/* Detailed Explanation Panel */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 10,
            border: '1px solid #E2E8F0',
            padding: 14,
            fontSize: 13,
            color: '#334155',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}
        >
          <strong>{L('निष्कर्ष तथा नियम (Rules & Insights):', 'Rules & Insights:')}</strong>
          <div>{L(prob.explanationNp, prob.explanationEn)}</div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default HcfLcmVisualLaboratory;
