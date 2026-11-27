import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface CubeProblem {
  id: string;
  type: 'sum' | 'diff';
  expr: string;
  baseA: string;
  baseB: string;
  factor1: string;
  factor2: string;
  stepsNp: string[];
  stepsEn: string[];
}

const TEXTBOOK_PROBLEMS: CubeProblem[] = [
  {
    id: 'p1',
    type: 'sum',
    expr: '8x³ + y³',
    baseA: '2x',
    baseB: 'y',
    factor1: '(2x + y)',
    factor2: '(4x² - 2xy + y²)',
    stepsNp: [
      '1. घन पदहरू पहिचान गर्ने: 8x³ = (2x)³ र y³ = (y)³',
      '2. यहाँ a = 2x र b = y छ',
      '3. सूत्र: a³ + b³ = (a + b)(a² - ab + b²)',
      '4. मान प्रतिस्थापन: (2x + y)[(2x)² - (2x)(y) + y²]',
      '5. अन्तिम खण्डीकरण: (2x + y)(4x² - 2xy + y²)',
    ],
    stepsEn: [
      '1. Identify cube bases: 8x³ = (2x)³ and y³ = (y)³',
      '2. Here a = 2x and b = y',
      '3. Formula: a³ + b³ = (a + b)(a² - ab + b²)',
      '4. Substitute: (2x + y)[(2x)² - (2x)(y) + y²]',
      '5. Factored result: (2x + y)(4x² - 2xy + y²)',
    ],
  },
  {
    id: 'p2',
    type: 'diff',
    expr: 'x³ - 8',
    baseA: 'x',
    baseB: '2',
    factor1: '(x - 2)',
    factor2: '(x² + 2x + 4)',
    stepsNp: [
      '1. घन पदहरू पहिचान गर्ने: x³ = (x)³ र 8 = (2)³',
      '2. यहाँ a = x र b = 2 छ',
      '3. सूत्र: a³ - b³ = (a - b)(a² + ab + b²)',
      '4. मान प्रतिस्थापन: (x - 2)[(x)² + (x)(2) + 2²]',
      '5. अन्तिम खण्डीकरण: (x - 2)(x² + 2x + 4)',
    ],
    stepsEn: [
      '1. Identify cube bases: x³ = (x)³ and 8 = (2)³',
      '2. Here a = x and b = 2',
      '3. Formula: a³ - b³ = (a - b)(a² + ab + b²)',
      '4. Substitute: (x - 2)[x² + (x)(2) + 2²]',
      '5. Factored result: (x - 2)(x² + 2x + 4)',
    ],
  },
  {
    id: 'p3',
    type: 'sum',
    expr: '27a³ + 64b³',
    baseA: '3a',
    baseB: '4b',
    factor1: '(3a + 4b)',
    factor2: '(9a² - 12ab + 16b²)',
    stepsNp: [
      '1. घन पदहरू पहिचान गर्ने: 27a³ = (3a)³ र 64b³ = (4b)³',
      '2. यहाँ a = 3a र b = 4b छ',
      '3. सूत्र: (a + b)(a² - ab + b²)',
      '4. मान प्रतिस्थापन: (3a + 4b)[(3a)² - (3a)(4b) + (4b)²]',
      '5. अन्तिम खण्डीकरण: (3a + 4b)(9a² - 12ab + 16b²)',
    ],
    stepsEn: [
      '1. Identify cube bases: 27a³ = (3a)³ and 64b³ = (4b)³',
      '2. Here a = 3a and b = 4b',
      '3. Formula: (a + b)(a² - ab + b²)',
      '4. Substitute: (3a + 4b)[(3a)² - (3a)(4b) + (4b)²]',
      '5. Factored result: (3a + 4b)(9a² - 12ab + 16b²)',
    ],
  },
  {
    id: 'p4',
    type: 'diff',
    expr: '125p³ - 8q³',
    baseA: '5p',
    baseB: '2q',
    factor1: '(5p - 2q)',
    factor2: '(25p² + 10pq + 4q²)',
    stepsNp: [
      '1. घन पदहरू पहिचान गर्ने: 125p³ = (5p)³ र 8q³ = (2q)³',
      '2. यहाँ a = 5p र b = 2q छ',
      '3. सूत्र: a³ - b³ = (a - b)(a² + ab + b²)',
      '4. मान प्रतिस्थापन: (5p - 2q)[(5p)² + (5p)(2q) + (2q)²]',
      '5. अन्तिम खण्डीकरण: (5p - 2q)(25p² + 10pq + 4q²)',
    ],
    stepsEn: [
      '1. Identify cube bases: 125p³ = (5p)³ and 8q³ = (2q)³',
      '2. Here a = 5p and b = 2q',
      '3. Formula: a³ - b³ = (a - b)(a² + ab + b²)',
      '4. Substitute: (5p - 2q)[(5p)² + (5p)(2q) + (2q)²]',
      '5. Factored result: (5p - 2q)(25p² + 10pq + 4q²)',
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'a³ + b³ को खण्डीकरण सूत्र (Factorization Formula) कुन हो?',
    en: 'What is the factorization formula for a³ + b³?',
    options: [
      { key: 'A', label: '(a + b)(a² - ab + b²)' },
      { key: 'B', label: '(a + b)(a² + ab + b²)' },
      { key: 'C', label: '(a - b)(a² + ab + b²)' },
      { key: 'D', label: '(a + b)³' },
    ],
    answer: 'A',
  },
  {
    np: 'a³ - b³ को खण्डीकरण सूत्र कुन हो?',
    en: 'What is the factorization formula for a³ - b³?',
    options: [
      { key: 'A', label: '(a - b)(a² + ab + b²)' },
      { key: 'B', label: '(a - b)(a² - ab + b²)' },
      { key: 'C', label: '(a + b)(a² - ab + b²)' },
      { key: 'D', label: '(a - b)³' },
    ],
    answer: 'A',
  },
  {
    np: 'अभिव्यक्ति 8x³ + 27 लाई खण्डीकरण गर्दा पहिलो खण्ड (a + b) के हुन्छ?',
    en: 'When factoring 8x³ + 27, what is the first factor (a + b)?',
    options: [
      { key: 'A', label: '(2x + 3) [because (2x)³ = 8x³ and 3³ = 27]' },
      { key: 'B', label: '(8x + 27)' },
      { key: 'C', label: '(4x + 9)' },
      { key: 'D', label: '(2x - 3)' },
    ],
    answer: 'A',
  },
  {
    np: 'x³ - 1 को खण्डीकरण कुन हो?',
    en: 'What is the factorization of x³ - 1?',
    options: [
      { key: 'A', label: '(x - 1)(x² + x + 1)' },
      { key: 'B', label: '(x + 1)(x² - x + 1)' },
      { key: 'C', label: '(x - 1)(x² - x + 1)' },
      { key: 'D', label: '(x - 1)³' },
    ],
    answer: 'A',
  },
];

export const SumDifferenceCubesFactorLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U9-02',
    chapter: 9,
    titleNp: 'घनाकार जोड र घटाउको खण्डीकरण',
    titleEn: 'Sum and Difference of Cubes Factorization Lab',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeProblem, setActiveProblem] = useState<CubeProblem>(TEXTBOOK_PROBLEMS[0]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showVerify, setShowVerify] = useState<boolean>(false);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! a³ + b³ = (a + b)(a² - ab + b²) र a³ - b³ = (a - b)(a² + ab + b²) को खण्डीकरण तथा चरणबद्ध समाधान प्रयोगशालामा स्वागत छ!',
        'Welcome! Explore step-by-step factorization of a³ + b³ and a³ - b³ with algebraic expansion verification!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Expression Selector Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEXTBOOK_PROBLEMS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActiveProblem(p);
                setCurrentStep(0);
                setShowVerify(false);
              }}
              className={`p-3 rounded-2xl border text-center transition-all ${
                activeProblem.id === p.id
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-lg scale-[1.02]'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-mono font-bold mb-1">{p.expr}</div>
              <div className="text-[11px] opacity-85">
                {p.type === 'sum' ? L('जोड (Sum of Cubes)', 'Sum of Cubes') : L('घटाउ (Diff of Cubes)', 'Diff of Cubes')}
              </div>
            </button>
          ))}
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Problem Display Left */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
              {L('अभिव्यक्ति पहिचान तथा आधार', 'Expression & Cube Bases')}
            </h3>

            {/* Expression Hero Box */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {L('खण्डीकरण गर्नुपर्ने बीजीय अभिव्यक्ति:', 'Expression to Factorize:')}
              </div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono my-2">
                {activeProblem.expr}
              </div>
              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                {activeProblem.type === 'sum' ? 'a³ + b³' : 'a³ - b³'}
              </div>
            </div>

            {/* Bases Identification */}
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="text-gray-500">{L('पहिलो आधार a:', 'First Base a:')}</div>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                  a = {activeProblem.baseA}
                </div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="text-gray-500">{L('दोस्रो आधार b:', 'Second Base b:')}</div>
                <div className="text-xl font-black text-amber-700 dark:text-amber-300 font-mono mt-1">
                  b = {activeProblem.baseB}
                </div>
              </div>
            </div>

            {/* Step Advancement Controls */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setCurrentStep((prev) => Math.min(activeProblem.stepsNp.length - 1, prev + 1))}
                disabled={currentStep >= activeProblem.stepsNp.length - 1}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow disabled:opacity-40 transition-all"
              >
                {L('अर्को चरण हेर्नुहोस् (Next Step) →', 'Next Step →')}
              </button>
              <button
                onClick={() => setShowVerify(!showVerify)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-bold text-xs border transition-all"
              >
                {showVerify ? L('प्रमाणीकरण लुकाउनुहोस्', 'Hide Verification') : L('गुणन गरी प्रमाणित गर्नुहोस् (Verify by Expansion) ✓', 'Verify by Expansion ✓')}
              </button>
            </div>
          </div>

          {/* Step-by-Step Breakdown Right */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                {L('चरणबद्ध खण्डीकरण विधि (Step-by-Step Solution)', 'Step-by-Step Factoring')}
              </h4>

              <div className="space-y-2.5">
                {(isNe ? activeProblem.stepsNp : activeProblem.stepsEn).map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                      idx <= currentStep
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 font-bold shadow-sm'
                        : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400 opacity-50'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>

              {/* Final Result Card */}
              {currentStep >= activeProblem.stepsNp.length - 1 && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl mt-4">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {L('अन्तिम खण्डीकृत रूप (Factored Form):', 'Factored Form:')}
                  </div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    = {activeProblem.factor1}{activeProblem.factor2}
                  </div>
                </div>
              )}
            </div>

            {/* Verification by Expansion Card */}
            {showVerify && (
              <div className="p-5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-2 text-xs font-mono">
                <div className="font-bold text-purple-900 dark:text-purple-200 text-sm">
                  {L('प्रमाणीकरण: दुई खण्डहरूलाई गुणन गर्दा:', 'Verification by Expansion:')}
                </div>
                <div>{activeProblem.factor1} × {activeProblem.factor2}</div>
                <div>= {activeProblem.baseA}{activeProblem.factor2} {activeProblem.type === 'sum' ? '+' : '-'} {activeProblem.baseB}{activeProblem.factor2}</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-black pt-1">
                  = {activeProblem.expr} (Verified!) ✓
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default SumDifferenceCubesFactorLab;
