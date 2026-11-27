import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface SimplificationProblem {
  id: string;
  titleNp: string;
  titleEn: string;
  category: 'algebraic_cycle' | 'common_power' | 'base_reduction';
  expr: string;
  expectedAnswer: string;
  steps: {
    ruleNp: string;
    ruleEn: string;
    math: string;
  }[];
}

const PROBLEMS: SimplificationProblem[] = [
  {
    id: 'pr1',
    titleNp: 'साझा घाताङ्क लिएर सरलीकरण (Taking Common Power)',
    titleEn: 'Taking Common Exponential Power',
    category: 'common_power',
    expr: '(2^(x+1) + 2^x) / (2^(x+2) - 2^x)',
    expectedAnswer: '1',
    steps: [
      {
        ruleNp: '2^(x+1) लाई 2^x × 2¹ र 2^(x+2) लाई 2^x × 2² मा टुक्राउने:',
        ruleEn: 'Split 2^(x+1) into 2^x × 2¹ and 2^(x+2) into 2^x × 2²:',
        math: '= (2^x · 2 + 2^x · 1) / (2^x · 4 - 2^x · 1)',
      },
      {
        ruleNp: 'अंश र हर दुवैबाट 2^x साझा लिने:',
        ruleEn: 'Factor out common 2^x from both numerator and denominator:',
        math: '= [2^x (2 + 1)] / [2^x (4 - 1)]',
      },
      {
        ruleNp: '2^x काट्ने र कोष्ठक भित्रको सरलीकरण गर्ने:',
        ruleEn: 'Cancel 2^x and evaluate inside brackets:',
        math: '= 3 / 3 = 1',
      },
    ],
  },
  {
    id: 'pr2',
    titleNp: 'चक्रीय घाताङ्क सर्वसमिका (Cyclic Algebraic Powers)',
    titleEn: 'Cyclic Algebraic Powers (Difference of Squares)',
    category: 'algebraic_cycle',
    expr: '(x^a / x^b)^(a+b) · (x^b / x^c)^(b+c) · (x^c / x^a)^(c+a)',
    expectedAnswer: '1',
    steps: [
      {
        ruleNp: 'भाग नियम (Quotient Law) अनुसार x^a / x^b = x^(a-b) प्रयोग गर्ने:',
        ruleEn: 'Apply quotient law x^a / x^b = x^(a-b):',
        math: '= [x^(a - b)]^(a + b) · [x^(b - c)]^(b + c) · [x^(c - a)]^(c + a)',
      },
      {
        ruleNp: 'घातको घात नियम र (a - b)(a + b) = a² - b² प्रयोग गर्ने:',
        ruleEn: 'Apply power of power and identity (a - b)(a + b) = a² - b²:',
        math: '= x^(a² - b²) · x^(b² - c²) · x^(c² - a²)',
      },
      {
        ruleNp: 'समान आधार गुणन नियमले सबै घातहरू जोड्ने:',
        ruleEn: 'Apply product law and sum all exponents:',
        math: '= x^(a² - b² + b² - c² + c² - a²) = x⁰ = 1',
      },
    ],
  },
  {
    id: 'pr3',
    titleNp: 'आधार 3 मा रूपान्तरण गरी सरलीकरण (Base Reduction)',
    titleEn: 'Base Reduction to Powers of 3',
    category: 'base_reduction',
    expr: '(3^(n+1) · 9^(n-1)) / 27^n',
    expectedAnswer: '1/3',
    steps: [
      {
        ruleNp: '9 लाई 3² र 27 लाई 3³ को रूपमा लेख्ने:',
        ruleEn: 'Express 9 as 3² and 27 as 3³:',
        math: '= [3^(n+1) · (3²)^(n-1)] / (3³)^n',
      },
      {
        ruleNp: 'घातको घात नियम (3²)^(n-1) = 3^(2n-2) र (3³)^n = 3^(3n) लागू गर्ने:',
        ruleEn: 'Multiply exponents: (3²)^(n-1) = 3^(2n-2) and (3³)^n = 3^(3n):',
        math: '= [3^(n+1 + 2n-2)] / 3^(3n) = 3^(3n-1) / 3^(3n)',
      },
      {
        ruleNp: 'भाग नियम अनुसार घातहरू घटाउने:',
        ruleEn: 'Apply quotient law to subtract exponents:',
        math: '= 3^((3n-1) - 3n) = 3^(-1) = 1/3',
      },
    ],
  },
  {
    id: 'pr4',
    titleNp: 'आधार 5 को साझा घाताङ्क (Powers of 5 Common)',
    titleEn: 'Taking Common Powers of 5',
    category: 'common_power',
    expr: '(5^(n+2) - 5^n) / (5^(n+1) + 5^n)',
    expectedAnswer: '4',
    steps: [
      {
        ruleNp: '5^(n+2) = 5^n × 25 र 5^(n+1) = 5^n × 5 मा टुक्राउने:',
        ruleEn: 'Split 5^(n+2) = 5^n × 25 and 5^(n+1) = 5^n × 5:',
        math: '= [5^n · 25 - 5^n · 1] / [5^n · 5 + 5^n · 1]',
      },
      {
        ruleNp: '5^n साझा लिने:',
        ruleEn: 'Factor out 5^n:',
        math: '= [5^n (25 - 1)] / [5^n (5 + 1)] = [5^n · 24] / [5^n · 6]',
      },
      {
        ruleNp: '5^n काटेर 24 ÷ 6 = 4 निकाल्ने:',
        ruleEn: 'Cancel 5^n and divide 24 by 6:',
        math: '= 24 / 6 = 4',
      },
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'चक्रीय घाताङ्क अभिव्यक्ति (xᵃ/xᵇ)ᵃ⁺ᵇ · (xᵇ/xᶜ)ᵇ⁺ᶜ · (xᶜ/xᵃ)ᶜ⁺ᵃ को अन्तिम सरलीकृत मान कति हुन्छ?',
    en: 'What is the final simplified value of (xᵃ/xᵇ)ᵃ⁺ᵇ · (xᵇ/xᶜ)ᵇ⁺ᶜ · (xᶜ/xᵃ)ᶜ⁺ᵃ?',
    options: [
      { key: 'A', label: '1' },
      { key: 'B', label: '0' },
      { key: 'C', label: 'x' },
      { key: 'D', label: 'x^(2a+2b+2c)' },
    ],
    answer: 'A',
  },
  {
    np: '2^(x+1) + 2^x मा कुन पद साझा (common) लिन सकिन्छ?',
    en: 'Which term can be factored out as common in 2^(x+1) + 2^x?',
    options: [
      { key: 'A', label: '2^x' },
      { key: 'B', label: '2' },
      { key: 'C', label: '2^(x+1)' },
      { key: 'D', label: 'x' },
    ],
    answer: 'A',
  },
  {
    np: '3^(3n-1) ÷ 3^(3n) को मान कति हुन्छ?',
    en: 'What is the value of 3^(3n-1) ÷ 3^(3n)?',
    options: [
      { key: 'A', label: '1/3 (3⁻¹ = 1/3)' },
      { key: 'B', label: '3' },
      { key: 'C', label: '-3' },
      { key: 'D', label: '1' },
    ],
    answer: 'A',
  },
];

export const IndicesSimplificationChallenge: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U12-03',
    chapter: 12,
    titleNp: 'घाताङ्क सरलीकरण चुनौती',
    titleEn: 'Indices Simplification Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeProblemId, setActiveProblemId] = useState<string>('pr1');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userGuess, setUserGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [showCheatsheet, setShowCheatsheet] = useState<boolean>(false);

  const prob = PROBLEMS.find((p) => p.id === activeProblemId) || PROBLEMS[0];

  const handleSelectProblem = (id: string) => {
    setActiveProblemId(id);
    setCurrentStep(0);
    setUserGuess('');
    setFeedback('none');
  };

  const handleVerifyGuess = () => {
    if (userGuess.trim() === prob.expectedAnswer) {
      setFeedback('correct');
      setCurrentStep(prob.steps.length);
    } else {
      setFeedback('incorrect');
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! कक्षा 9 को पाठ्यपुस्तकमा आधारित चक्रीय घाताङ्क र साझा पद लिने कठिन बीजीय घाताङ्क सरलीकरणहरूलाई चरणबद्ध रूपमा अभ्यास गरौं!',
        'Welcome! Tackle multi-law algebraic and cyclic indices simplifications from the Grade 9 curriculum step-by-step!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Problem Selector Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {PROBLEMS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectProblem(p.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: activeProblemId === p.id ? '2px solid #0D9488' : '1px solid #CBD5E1',
                backgroundColor: activeProblemId === p.id ? '#F0FDFA' : '#FFFFFF',
                color: activeProblemId === p.id ? '#0F766E' : '#475569',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: isNe ? FONT_NP : 'inherit',
                fontSize: 13,
              }}
            >
              {L(p.titleNp, p.titleEn)}
            </button>
          ))}
        </div>

        {/* Expression Banner & Cheatsheet Toggle */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 700 }}>
              {L('सरलीकरण गर्नुपर्ने अभिव्यक्ति:', 'Expression to Simplify:')}
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 18,
                fontWeight: 800,
                color: '#1E293B',
                marginTop: 4,
                backgroundColor: '#F8FAFC',
                padding: '6px 12px',
                borderRadius: 8,
              }}
            >
              {prob.expr}
            </div>
          </div>

          <button
            onClick={() => setShowCheatsheet(!showCheatsheet)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #CBD5E1',
              backgroundColor: showCheatsheet ? '#EFF6FF' : '#FFFFFF',
              color: '#1D4ED8',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📖 {showCheatsheet ? L('नियम तालिका लुकाउने', 'Hide Laws Cheatsheet') : L('नियम तालिका हेर्ने', 'View Laws Cheatsheet')}
          </button>
        </div>

        {/* Cheatsheet Drawer */}
        {showCheatsheet && (
          <div
            style={{
              backgroundColor: '#EFF6FF',
              borderRadius: 10,
              border: '1px solid #BFDBFE',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              fontSize: 12,
            }}
          >
            <div>
              <strong>Product rule:</strong>
              <div style={{ fontFamily: 'monospace', color: '#1E40AF' }}>aᵐ × aⁿ = aᵐ⁺ⁿ</div>
            </div>
            <div>
              <strong>Quotient rule:</strong>
              <div style={{ fontFamily: 'monospace', color: '#1E40AF' }}>aᵐ ÷ aⁿ = aᵐ⁻ⁿ</div>
            </div>
            <div>
              <strong>Power of a power rule:</strong>
              <div style={{ fontFamily: 'monospace', color: '#1E40AF' }}>(aᵐ)ⁿ = aᵐⁿ</div>
            </div>
            <div>
              <strong>Zero power rule:</strong>
              <div style={{ fontFamily: 'monospace', color: '#1E40AF' }}>a⁰ = 1 (a ≠ 0)</div>
            </div>
            <div>
              <strong>Negative power rule:</strong>
              <div style={{ fontFamily: 'monospace', color: '#1E40AF' }}>a⁻ᵐ = 1 / aᵐ</div>
            </div>
            <div>
              <strong>Difference of squares identity:</strong>
              <div style={{ fontFamily: 'monospace', color: '#1E40AF' }}>(a - b)(a + b) = a² - b²</div>
            </div>
          </div>
        )}

        {/* Step-by-Step Simplification Pipeline */}
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
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              {L('चरणबद्ध समाधान (Step-by-Step Reduction):', 'Step-by-Step Reduction:')}
            </span>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              {L('खुलेका चरणहरू:', 'Revealed steps:')} {fmt(currentStep)} / {fmt(prob.steps.length)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prob.steps.slice(0, currentStep).map((st, idx) => (
              <div
                key={idx}
                style={{
                  padding: 12,
                  backgroundColor: '#F8FAFC',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F766E' }}>
                  {L(`चरण ${fmt(idx + 1)}:`, `Step ${idx + 1}:`)} {L(st.ruleNp, st.ruleEn)}
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#1E293B',
                    marginTop: 6,
                    paddingLeft: 8,
                  }}
                >
                  {st.math}
                </div>
              </div>
            ))}
          </div>

          {currentStep < prob.steps.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
              <button
                onClick={() => setCurrentStep((prev) => Math.min(prob.steps.length, prev + 1))}
                style={{
                  padding: '7px 16px',
                  borderRadius: 6,
                  border: '1px solid #0D9488',
                  backgroundColor: '#F0FDFA',
                  color: '#0F766E',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {L('अर्को चरण खोल्नुहोस् (+)', 'Reveal Next Step (+)')}
              </button>
            </div>
          )}

          {currentStep === prob.steps.length && (
            <div
              style={{
                backgroundColor: '#ECFDF5',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #A7F3D0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>
                {L('सरलीकृत अन्तिम मान:', 'Simplified Final Result:')}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: '#065F46' }}>
                = {prob.expectedAnswer}
              </span>
            </div>
          )}
        </div>

        {/* User Answer Check Card */}
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
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
            {L('तपाईंको अनुमानित अन्तिम मान जाँच्नुहोस्:', 'Test your final simplified answer:')}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              placeholder={L('उदा: 1 वा 4 वा 1/3', 'e.g. 1 or 4 or 1/3')}
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                fontSize: 14,
                fontFamily: 'monospace',
                width: 180,
              }}
            />
            <button
              onClick={handleVerifyGuess}
              style={{
                padding: '7px 16px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: '#0D9488',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {L('जाँच गर्नुहोस्', 'Verify')}
            </button>
          </div>

          {feedback === 'correct' && (
            <div
              style={{
                padding: 10,
                backgroundColor: '#ECFDF5',
                borderRadius: 6,
                color: '#065F46',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              🎉 {L('सही उत्तर! तपाईंको सरलीकरण त्रुटिरहित छ।', 'Correct answer! Your simplification is exact.')}
            </div>
          )}

          {feedback === 'incorrect' && (
            <div
              style={{
                padding: 10,
                backgroundColor: '#FEF2F2',
                borderRadius: 6,
                color: '#991B1B',
                fontSize: 13,
              }}
            >
              ❌ {L('मिलेन, कृपया माथिका चरणबद्ध नियमहरू अवलोकन गर्नुहोस्।', 'Incorrect, check the step-by-step reduction above.')}
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};

export default IndicesSimplificationChallenge;
