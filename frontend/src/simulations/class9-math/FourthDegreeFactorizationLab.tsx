import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface FourthDegreeProblem {
  id: string;
  expr: string;
  step1: string;
  step2: string;
  step3: string;
  finalFactors: string;
  evaluateFn: (v: number) => number;
}

const PROBLEMS: FourthDegreeProblem[] = [
  {
    id: 'p1',
    expr: 'y⁴ + y² + 1',
    step1: '(y²)² + (१)² + y²',
    step2: '[(y² + १)² - २(y²)(१)] + y²',
    step3: '(y² + १)² - (y)²',
    finalFactors: '(y² + y + 1)(y² - y + 1)',
    evaluateFn: (y) => Math.pow(y, 4) + Math.pow(y, 2) + 1,
  },
  {
    id: 'p2',
    expr: 'y⁴ + 64',
    step1: '(y²)² + (८)²',
    step2: '(y² + ८)² - २(y²)(८)',
    step3: '(y² + ८)² - (४y)²',
    finalFactors: '(y² + 4y + 8)(y² - 4y + 8)',
    evaluateFn: (y) => Math.pow(y, 4) + 64,
  },
  {
    id: 'p3',
    expr: 'x⁴ + 4y⁴',
    step1: '(x²)² + (२y²)²',
    step2: '(x² + २y²)² - २(x²)(२y²)',
    step3: '(x² + २y²)² - (२xy)²',
    finalFactors: '(x² + 2xy + 2y²)(x² - 2xy + 2y²)',
    evaluateFn: (x) => Math.pow(x, 4) + 4 * 1, // with y=1
  },
  {
    id: 'p4',
    expr: 'a⁴ + a² + 1',
    step1: '(a²)² + (१)² + a²',
    step2: '(a² + १)² - २a² + a²',
    step3: '(a² + १)² - (a)²',
    finalFactors: '(a² + a + 1)(a² - a + 1)',
    evaluateFn: (a) => Math.pow(a, 4) + Math.pow(a, 2) + 1,
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'a⁴ + a²b² + b⁴ लाई खण्डीकरण गर्दा कुन सर्वसमिका (Identity) को रूपमा रूपान्तरण गरिन्छ?',
    en: 'When factorizing a⁴ + a²b² + b⁴, which identity form is it transformed into?',
    options: [
      { key: 'A', label: 'दुई वर्गको अन्तर: (a² + b²)² - (ab)² [x² - y²]' },
      { key: 'B', label: 'घनको जोड: x³ + y³' },
      { key: 'C', label: 'वर्गको जोड: (x + y)²' },
      { key: 'D', label: 'कुनै पनि होइन' },
    ],
    answer: 'A',
  },
  {
    np: 'y⁴ + y² + १ को सही खण्डीकरण कुन हो?',
    en: 'What is the correct factorization of y⁴ + y² + 1?',
    options: [
      { key: 'A', label: '(y² + y + १)(y² - y + १)' },
      { key: 'B', label: '(y² + १)²' },
      { key: 'C', label: '(y² - १)(y² + y + १)' },
      { key: 'D', label: '(y² + y - १)(y² - y - १)' },
    ],
    answer: 'A',
  },
  {
    np: 'y⁴ + ६४ लाई पूर्ण वर्ग बनाउँदा (y² + ८)² बाट कति घटाउनुपर्छ?',
    en: 'To make y⁴ + 64 into a difference of squares from (y² + 8)², what must be subtracted?',
    options: [
      { key: 'A', label: '(४y)² अर्थात् १६y²' },
      { key: 'B', label: '८y²' },
      { key: 'C', label: '६४y²' },
      { key: 'D', label: '२y²' },
    ],
    answer: 'A',
  },
  {
    np: 'x⁴ + ४y⁴ को खण्डीकरण कुन हो?',
    en: 'What is the factorization of x⁴ + 4y⁴?',
    options: [
      { key: 'A', label: '(x² + २xy + २y²)(x² - २xy + २y²)' },
      { key: 'B', label: '(x² + २y²)²' },
      { key: 'C', label: '(x² - २y²)²' },
      { key: 'D', label: '(x + २y)⁴' },
    ],
    answer: 'A',
  },
];

export const FourthDegreeFactorizationLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U9-03',
    chapter: 9,
    titleNp: 'चौथो घातका अभिव्यक्तिको खण्डीकरण प्रयोगशाला',
    titleEn: 'Fourth-Degree Expression Factorization Lab',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeProblem, setActiveProblem] = useState<FourthDegreeProblem>(PROBLEMS[0]);
  const [revealedStep, setRevealedStep] = useState<number>(0);
  const [substituteVal, setSubstituteVal] = useState<number>(2);

  const evalResult = activeProblem.evaluateFn(substituteVal);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! a⁴ + a²b² + b⁴ स्वरूपका चौथो घातका अभिव्यक्तिलाई x² - y² = (x + y)(x - y) मा रूपान्तरण गरी खण्डीकरण गर्न सिकौं!',
        'Welcome! Factorize fourth-degree expressions of the form a⁴ + a²b² + b⁴ by transforming into a difference of squares!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Expression Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PROBLEMS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActiveProblem(p);
                setRevealedStep(0);
              }}
              className={`p-3 rounded-2xl border text-center transition-all ${
                activeProblem.id === p.id
                  ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-lg scale-[1.02]'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="text-base font-mono font-bold mb-1">{p.expr}</div>
              <div className="text-[11px] opacity-85">
                {L('पाठ्यपुस्तक उदाहरण', 'Textbook Example')}
              </div>
            </button>
          ))}
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Left */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
              {L('अभिव्यक्ति तथा चरण नियन्त्रण', 'Expression & Step Controls')}
            </h3>

            {/* Current Expression Banner */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {L('चौथो घातको अभिव्यक्ति:', 'Fourth-Degree Expression:')}
              </div>
              <div className="text-3xl font-black text-purple-700 dark:text-purple-300 font-mono my-2">
                {activeProblem.expr}
              </div>
              <div className="text-xs text-gray-500 font-mono">
                a⁴ + a²b² + b⁴ स्वरूप
              </div>
            </div>

            {/* Step Advancement Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setRevealedStep((prev) => Math.min(3, prev + 1))}
                disabled={revealedStep >= 3}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow disabled:opacity-40 transition-all"
              >
                {L('अर्को चरण खोल्नुहोस् (Next Step) →', 'Reveal Next Step →')}
              </button>
              <button
                onClick={() => setRevealedStep(3)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-bold text-xs border transition-all"
              >
                {L('सबै चरणहरू एकैचोटि हेर्नुहोस्', 'Show All Steps')}
              </button>
            </div>

            {/* Numerical Verification Subtitle */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border space-y-2 text-xs">
              <div className="font-bold text-gray-800 dark:text-gray-200">
                {L('संख्यात्मक मान राखेर जाँच (Numerical Substitution):', 'Verify by Numerical Substitution:')}
              </div>
              <div className="flex items-center gap-2">
                <span>चल (Variable) =</span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={substituteVal}
                  onChange={(e) => setSubstituteVal(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                />
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 ml-auto">
                  मान = {evalResult}
                </span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Factoring Right */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4 text-xs font-mono">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm border-b pb-2 font-sans">
                {L('चरणबद्ध समाधान प्रक्रिया (Step-by-Step Transformation)', 'Step-by-Step Transformation')}
              </h4>

              {/* Step 1 */}
              <div className={`p-3 rounded-xl border transition-all ${
                revealedStep >= 1 ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 text-purple-900 dark:text-purple-100' : 'opacity-40 bg-gray-50'
              }`}>
                <div className="font-bold font-sans text-gray-700 dark:text-gray-300 mb-1">
                  {L('चरण १: पहिलो र तेस्रो पदलाई वर्गको रूपमा मिलाउने', 'Step 1: Group into square terms')}
                </div>
                <div className="text-sm font-bold">= {activeProblem.step1}</div>
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-xl border transition-all ${
                revealedStep >= 2 ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 text-indigo-900 dark:text-indigo-100' : 'opacity-40 bg-gray-50'
              }`}>
                <div className="font-bold font-sans text-gray-700 dark:text-gray-300 mb-1">
                  {L('चरण २: a² + b² = (a + b)² - २ab सूत्र प्रयोग गरी पूर्ण वर्ग बनाउने', 'Step 2: Complete square')}
                </div>
                <div className="text-sm font-bold">= {activeProblem.step2}</div>
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-xl border transition-all ${
                revealedStep >= 3 ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 text-blue-900 dark:text-blue-100' : 'opacity-40 bg-gray-50'
              }`}>
                <div className="font-bold font-sans text-gray-700 dark:text-gray-300 mb-1">
                  {L('चरण ३: दुई वर्गको अन्तर बनाउने: X² - Y²', 'Step 3: Difference of two squares')}
                </div>
                <div className="text-sm font-bold">= {activeProblem.step3}</div>
              </div>

              {/* Final Result */}
              {revealedStep >= 3 && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl">
                  <div className="font-sans font-bold text-xs text-emerald-800 dark:text-emerald-300">
                    {L('चरण ४: X² - Y² = (X + Y)(X - Y) लागू गर्दा अन्तिम खण्डीकरण:', 'Step 4: Factored Result')}
                  </div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                    = {activeProblem.finalFactors}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default FourthDegreeFactorizationLab;
