import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const AlgebraicFractionLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U8-01',
    chapter: 8,
    titleNp: 'बीजीय भिन्न दृश्य प्रयोगशाला',
    titleEn: 'Algebraic Fraction Visual Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'simplify' | 'operations' | 'restrictions' | 'challenge'>('simplify');

  // ── 1. FACTOR & SIMPLIFY STATE ─────────────────────────────────────────────
  const [selectedExampleIdx, setSelectedExampleIdx] = useState<number>(0);
  const [cancelledFactor, setCancelledFactor] = useState<boolean>(false);

  const simplifyExamples = [
    {
      label: '(x² - 9) / (x² + 3x)',
      numOriginal: 'x² - 9',
      denOriginal: 'x² + 3x',
      numFactors: ['(x - 3)', '(x + 3)'],
      denFactors: ['x', '(x + 3)'],
      commonFactor: '(x + 3)',
      numSimplified: 'x - 3',
      denSimplified: 'x',
      excludedValues: ['0', '-3'],
      sampleVal: 5,
    },
    {
      label: '(x² - 4) / (x² - 4x + 4)',
      numOriginal: 'x² - 4',
      denOriginal: 'x² - 4x + 4',
      numFactors: ['(x + 2)', '(x - 2)'],
      denFactors: ['(x - 2)', '(x - 2)'],
      commonFactor: '(x - 2)',
      numSimplified: 'x + 2',
      denSimplified: 'x - 2',
      excludedValues: ['2'],
      sampleVal: 4,
    },
    {
      label: '(2x² + 6x) / (x² - 9)',
      numOriginal: '2x² + 6x',
      denOriginal: 'x² - 9',
      numFactors: ['2x', '(x + 3)'],
      denFactors: ['(x - 3)', '(x + 3)'],
      commonFactor: '(x + 3)',
      numSimplified: '2x',
      denSimplified: 'x - 3',
      excludedValues: ['3', '-3'],
      sampleVal: 6,
    },
    {
      label: '(a² - 4a + 3) / (a² - 1)',
      numOriginal: 'a² - 4a + 3',
      denOriginal: 'a² - 1',
      numFactors: ['(a - 3)', '(a - 1)'],
      denFactors: ['(a + 1)', '(a - 1)'],
      commonFactor: '(a - 1)',
      numSimplified: 'a - 3',
      denSimplified: 'a + 1',
      excludedValues: ['1', '-1'],
      sampleVal: 3,
    },
  ];

  const currentSimEx = simplifyExamples[selectedExampleIdx];

  // ── 2. NUMERICAL VERIFICATION STATE ────────────────────────────────────────
  const [testInputX, setTestInputX] = useState<number>(5);

  const computeOriginalVal = (x: number): { val: number | null; error?: string } => {
    if (selectedExampleIdx === 0) {
      if (x === 0 || x === -3) return { val: null, error: 'Denominator is 0 (Undefined)' };
      return { val: (x * x - 9) / (x * x + 3 * x) };
    } else if (selectedExampleIdx === 1) {
      if (x === 2) return { val: null, error: 'Denominator is 0 (Undefined)' };
      return { val: (x * x - 4) / (x * x - 4 * x + 4) };
    } else if (selectedExampleIdx === 2) {
      if (x === 3 || x === -3) return { val: null, error: 'Denominator is 0 (Undefined)' };
      return { val: (2 * x * x + 6 * x) / (x * x - 9) };
    } else {
      if (x === 1 || x === -1) return { val: null, error: 'Denominator is 0 (Undefined)' };
      return { val: (x * x - 4 * x + 3) / (x * x - 1) };
    }
  };

  const computeSimplifiedVal = (x: number): { val: number | null; error?: string } => {
    if (selectedExampleIdx === 0) {
      if (x === 0) return { val: null, error: 'Denominator is 0 (Undefined)' };
      return { val: (x - 3) / x };
    } else if (selectedExampleIdx === 1) {
      if (x === 2) return { val: null, error: 'Denominator is 0 (Undefined)' };
      return { val: (x + 2) / (x - 2) };
    } else if (selectedExampleIdx === 2) {
      if (x === 3) return { val: null, error: 'Denominator is 0 (Undefined)' };
      return { val: (2 * x) / (x - 3) };
    } else {
      if (x === -1) return { val: null, error: 'Denominator is 0 (Undefined)' };
      return { val: (x - 3) / (x + 1) };
    }
  };

  const origResult = computeOriginalVal(testInputX);
  const simpResult = computeSimplifiedVal(testInputX);

  // ── 3. OPERATIONS STATE ────────────────────────────────────────────────────
  const [selectedOp, setSelectedOp] = useState<'add' | 'subtract' | 'multiply' | 'divide'>('add');

  // ── 4. PRACTICE CHALLENGE ──────────────────────────────────────────────────
  const [score, setScore] = useState<number>(0);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizQuestions = [
    {
      qEn: 'For which value(s) of x is the algebraic fraction (x + 5) / (x² - 16) undefined?',
      qNp: 'बीजीय भिन्न (x + 5) / (x² - 16) को मान x को कुन मानका लागि अपरिभाषित हुन्छ?',
      options: ['x = 4 and x = -4', 'x = -5 only', 'x = 16 only', 'x = 0'],
      optionsNp: ['x = 4 र x = -4', 'x = -5 मात्र', 'x = 16 मात्र', 'x = 0'],
      correct: 0,
      hintEn: 'A fraction is undefined when denominator = 0. Here x² - 16 = 0  ⟹  (x - 4)(x + 4) = 0  ⟹  x = 4, -4.',
      hintNp: 'हर (Denominator) = 0 हुँदा भिन्न अपरिभाषित हुन्छ। x² - 16 = 0  ⟹  (x - 4)(x + 4) = 0  ⟹  x = ±4।',
    },
    {
      qEn: 'Simplify the fraction: (x² - 25) / (x + 5). What is the result?',
      qNp: 'भिन्नलाई सरल गर्नुहोस्: (x² - 25) / (x + 5)। यसको नतिजा कति हुन्छ?',
      options: ['x - 5 (where x ≠ -5)', 'x + 5', 'x - 20', 'x / 5'],
      optionsNp: ['x - 5', 'x + 5', 'x - 20', 'x / 5'],
      correct: 0,
      hintEn: 'Factor numerator: (x - 5)(x + 5) / (x + 5) = x - 5 (provided x ≠ -5).',
      hintNp: 'अंशको खण्डिकरण: (x - 5)(x + 5) / (x + 5) = x - 5।',
    },
    {
      qEn: 'What is the Lowest Common Denominator (LCM) of: 1 / (x - 2) and 1 / (x + 2)?',
      qNp: '1 / (x - 2) र 1 / (x + 2) का हरहरूको साझा ल.सा. (LCM) के हुन्छ?',
      options: ['(x - 2)(x + 2) = x² - 4', 'x - 4', '2x', '(x - 2) + (x + 2)'],
      optionsNp: ['(x - 2)(x + 2) = x² - 4', 'x - 4', '2x', '(x - 2) + (x + 2)'],
      correct: 0,
      hintEn: 'Since (x - 2) and (x + 2) share no common factor, their LCM is their product: (x - 2)(x + 2) = x² - 4.',
      hintNp: 'दुवै हरहरू विजातीय भएकाले तिनीहरूको गुणनफल (x - 2)(x + 2) नै ल.सा. हुन्छ।',
    },
    {
      qEn: 'Why is it mathematically illegal to cancel x in (x + 7) / x to get 7?',
      qNp: '(x + 7) / x मा x लाई काटेर सिधै 7 लेख्नु किन गणितीय रूपमा गलत हो?',
      options: [
        'Because x is a term in addition, not a multiplying common factor',
        'Because 7 is prime',
        'Because x must always be positive',
        'It is actually allowed',
      ],
      optionsNp: [
        'किनभने x जोडमा रहेको पद हो, गुणनको साझा खण्ड होइन',
        'किनभने 7 एउटा रूढ संख्या हो',
        'किनभने x सधैँ धनात्मक हुनुपर्छ',
        'यो वास्तवमा काट्न पाइन्छ',
      ],
      correct: 0,
      hintEn: 'Only multiplicative common factors of the entire numerator and denominator can be cancelled: (a · c)/(b · c) = a/b.',
      hintNp: 'अंश र हरका सम्पूर्ण गुणन खण्ड (Factors) मात्र काट्न पाइन्छ, जोड वा घटाउका छुट्टाछुट्टै पदहरू काट्न पाइँदैन।',
    },
  ];

  const handleSelectAnswer = (idx: number) => {
    setSelectedAns(idx);
    const q = quizQuestions[quizIdx];
    if (idx === q.correct) {
      kit.good();
      setScore((prev) => prev + 10);
      setQuizFeedback(isNe ? 'सटीक उत्तर! धेरै राम्रो।' : 'Correct! Excellent algebraic reasoning.');
    } else {
      kit.oops();
      setQuizFeedback(isNe ? 'गलत उत्तर। संकेत हेरी पुन: प्रयास गर्नुहोस्।' : 'Incorrect. Check the denominator and factoring rule.');
    }
  };

  const handleNextQuiz = () => {
    kit.tap();
    setSelectedAns(null);
    setQuizFeedback(null);
    setQuizIdx((prev) => (prev + 1) % quizQuestions.length);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा 10 गणितको एकाइ 8: बीजीय भिन्न (Algebraic Fraction) प्रयोगशालामा स्वागत छ! यहाँ खण्डिकरण गर्नुहोस्, साझा खण्ड काट्नुहोस्, अपरिभाषित हुने हरका मानहरू पत्ता लगाउनुहोस् र भिन्नका 4 वटै क्रियाहरू सिक्नुहोस्!',
        'Welcome to Grade 10 Unit 8: Algebraic Fraction Visual Laboratory! Factorize expressions, cancel common factors legally, discover excluded denominator values, and master all 4 fraction operations!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'simplify', labelNp: 'क) खण्डिकरण र सरलीकरण (Factor & Simplify)', labelEn: 'A) Factor & Simplify' },
            { id: 'operations', labelNp: 'ख) भिन्नका चार क्रियाहरू (+, -, ×, ÷)', labelEn: 'B) Fraction Operations' },
            { id: 'restrictions', labelNp: 'ग) अपरिभाषित मानहरू तथा संख्या परीक्षण', labelEn: 'C) Excluded Domain & Test' },
            { id: 'challenge', labelNp: 'घ) अभ्यास चुनौती (Quiz)', labelEn: 'D) Practice Challenge' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                kit.tap();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[#167C80] text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-[#142D4E] border border-slate-200'
              }`}
            >
              {isNe ? tab.labelNp : tab.labelEn}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: FACTOR & SIMPLIFY (INTERACTIVE CANCELLATION)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'simplify' && (
          <div className="space-y-4">
            {/* Example Selector */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700">
                {L('पाठ्यपुस्तकका नमुना भिन्नहरू (Select Fraction Example):', 'Textbook Fraction Examples:')}
              </span>
              <div className="flex flex-wrap gap-2">
                {simplifyExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      kit.tap();
                      setSelectedExampleIdx(idx);
                      setCancelledFactor(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                      selectedExampleIdx === idx
                        ? 'bg-[#142D4E] text-white shadow-sm'
                        : 'bg-slate-50 border text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Cancellation Board */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Visual Board */}
              <div className="md:col-span-7 bg-[#142D4E] p-6 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {L('अन्तरक्रियात्मक खण्ड काट्ने बोर्ड (Click to Cancel Common Factor)', 'Click to Cancel Common Factor')}
                </span>

                <div className="my-6 p-6 bg-slate-900/70 border border-slate-700 rounded-2xl flex flex-col items-center gap-3 w-full max-w-sm">
                  {/* Numerator */}
                  <div className="flex items-center gap-2 text-lg sm:text-xl font-mono font-bold">
                    {currentSimEx.numFactors.map((f, i) => {
                      const isCommon = f === currentSimEx.commonFactor;
                      return (
                        <span
                          key={`num-${i}`}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            isCommon && cancelledFactor
                              ? 'line-through text-rose-400 bg-rose-950/40 border border-rose-500/50'
                              : isCommon
                              ? 'text-teal-300 bg-teal-900/40 border border-teal-500/50'
                              : 'text-amber-300'
                          }`}
                        >
                          {f}
                        </span>
                      );
                    })}
                  </div>

                  {/* Fraction Bar */}
                  <div className="w-full h-1 bg-slate-400 rounded-full" />

                  {/* Denominator */}
                  <div className="flex items-center gap-2 text-lg sm:text-xl font-mono font-bold">
                    {currentSimEx.denFactors.map((f, i) => {
                      const isCommon = f === currentSimEx.commonFactor;
                      return (
                        <span
                          key={`den-${i}`}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            isCommon && cancelledFactor
                              ? 'line-through text-rose-400 bg-rose-950/40 border border-rose-500/50'
                              : isCommon
                              ? 'text-teal-300 bg-teal-900/40 border border-teal-500/50'
                              : 'text-indigo-300'
                          }`}
                        >
                          {f}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Cancel Action Button */}
                <button
                  onClick={() => {
                    kit.tap();
                    setCancelledFactor(!cancelledFactor);
                  }}
                  className={`w-full max-w-sm py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all ${
                    cancelledFactor
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {cancelledFactor
                    ? L(`पुन: खण्ड देखाउनुहोस् (Reset ${currentSimEx.commonFactor})`, `Show Common Factor Again`)
                    : L(`साझा खण्ड ${currentSimEx.commonFactor} काट्नुहोस् (Cancel Common Factor)`, `Cancel ${currentSimEx.commonFactor}`)}
                </button>

                <div className="w-full flex justify-between text-xs text-slate-400 mt-4 border-t border-slate-700/60 pt-2">
                  <span>
                    {L('अपरिभाषित हुने प्रतिबन्ध:', 'Domain Restrictions:')} x ≠ {currentSimEx.excludedValues.map(v => fmt(v)).join(', ')}
                  </span>
                  <span>
                    {cancelledFactor
                      ? L('सरलीकृत रूप प्राप्त!', 'Simplified form achieved!')
                      : L('साझा खण्ड पत्ता लाग्यो', 'Common factor identified')}
                  </span>
                </div>
              </div>

              {/* Step-by-Step Explanation Card */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3 font-mono text-xs">
                  <span className="font-bold text-sm text-[#142D4E] block font-sans">
                    {L('क्रमबद्ध समाधान प्रक्रिया (Step-by-Step Simplification):', 'Step-by-Step Simplification:')}
                  </span>

                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <span className="text-slate-400 block font-sans text-xs">Step 1: Original algebraic fraction</span>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">
                      {currentSimEx.numOriginal} / {currentSimEx.denOriginal}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <span className="text-slate-400 block font-sans text-xs">Step 2: Factorizing numerator and denominator</span>
                    <div className="font-bold text-teal-700 text-sm mt-0.5">
                      {currentSimEx.numFactors.join('')} / {currentSimEx.denFactors.join('')}
                    </div>
                  </div>

                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                    <span className="text-teal-700 block font-sans text-xs font-bold">
                      Step 3: Cancelling the common factor (simplified fraction)
                    </span>
                    <div className="font-bold text-[#142D4E] text-base mt-0.5">
                      {currentSimEx.numSimplified} / {currentSimEx.denSimplified}
                    </div>
                    <span className="text-xs text-slate-600 block mt-1 font-sans">
                      ({L('जहाँ हर', 'where denominator')} ≠ 0, x ∉ {'{'}{currentSimEx.excludedValues.map(v => fmt(v)).join(', ')}{'}'})
                    </span>
                  </div>
                </div>

                {/* Important Pedagogy Alert */}
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 leading-relaxed">
                  <strong className="block mb-1 font-bold">
                    ⚠️ {L('महत्त्वपूर्ण गणितीय नियम (Crucial Rule):', 'Important Factoring Rule:')}
                  </strong>
                  {L(
                    'अंश र हरका सम्पूर्ण गुणन खण्ड (Factors) मात्र काट्न पाइन्छ! जोड वा घटाउमा रहेका पदहरू छुट्टाछुट्टै काट्न पाइँदैन। उदाहरणका लागि, (x + 3) / x मा x काट्न मिल्दैन किनभने अंशमा x गुणनमा नभई जोडमा छ।',
                    'Only entire multiplicative factors can be cancelled! Individual terms connected by addition or subtraction cannot be cancelled separately. For example, in (x + 3) / x, you cannot cancel x because x is added, not multiplied.'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: FRACTION OPERATIONS (+, -, *, /)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'operations' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            {/* Operation Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'add', np: '1. जोड (+)', en: '1. Addition (+)' },
                { id: 'subtract', np: '2. घटाउ (-)', en: '2. Subtraction (-)' },
                { id: 'multiply', np: '3. गुणन (×)', en: '3. Multiplication (×)' },
                { id: 'divide', np: '4. भाग (÷)', en: '4. Division (÷)' },
              ].map((op) => (
                <button
                  key={op.id}
                  onClick={() => {
                    kit.tap();
                    setSelectedOp(op.id as any);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedOp === op.id
                      ? 'bg-[#167C80] text-white border-[#167C80] font-bold shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="text-xs sm:text-sm">{isNe ? op.np : op.en}</div>
                </button>
              ))}
            </div>

            {/* Step-by-Step Operation Display */}
            <div className="p-4 bg-slate-50 border rounded-xl space-y-4 font-mono text-xs sm:text-sm">
              {/* ADDITION */}
              {selectedOp === 'add' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-[#142D4E] text-base">1 / x + 1 / (x + 1)</span>
                    <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full font-bold">
                      {L('ल.सा. विधि (LCM Method)', 'LCM Method')}
                    </span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs font-sans">Step 1: LCM of the denominators</span>
                    <span className="text-teal-700 font-bold">LCM = x(x + 1)</span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs font-sans">Step 2: Making a common denominator and adding</span>
                    <span>= [1 · (x + 1) + 1 · x] / [x(x + 1)]</span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs font-sans">Step 3: Adding like terms (final simplified sum)</span>
                    <span className="text-base font-bold text-emerald-700">= (2x + 1) / [x(x + 1)]</span>
                  </div>
                </div>
              )}

              {/* SUBTRACTION */}
              {selectedOp === 'subtract' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-[#142D4E] text-base">x / (x - y) - y / (x + y)</span>
                    <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full font-bold">
                      {L('CDC पाठ्यपुस्तक उदाहरण', 'CDC Textbook Example')}
                    </span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs font-sans">Step 1: LCM of the denominators</span>
                    <span className="text-teal-700 font-bold">LCM = (x - y)(x + y) = x² - y²</span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs font-sans">चरण 2: अंश विस्तार र घटाउ (Cross Multiplication)</span>
                    <span>= [x(x + y) - y(x - y)] / [(x - y)(x + y)]</span>
                    <div className="mt-1">= (x² + xy - xy + y²) / (x² - y²)</div>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs font-sans">चरण 3: +xy र -xy काटिँदा (Final Difference)</span>
                    <span className="text-base font-bold text-emerald-700">= (x² + y²) / (x² - y²)</span>
                  </div>
                </div>
              )}

              {/* MULTIPLICATION */}
              {selectedOp === 'multiply' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-[#142D4E] text-base">
                      [(x - 2) / (x + 3)] × [(x + 3) / (x - 1)]
                    </span>
                    <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full font-bold">
                      {L('गुणन र खण्ड विलोपन', 'Multiplication & Factor Cancel')}
                    </span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs font-sans">चरण 1: अंश र हरलाई एउटै भिन्नमा मिलाउने</span>
                    <span>= [(x - 2)(x + 3)] / [(x + 3)(x - 1)]</span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs font-sans">चरण 2: समान खण्ड (x + 3) लाई काट्दा</span>
                    <span className="text-base font-bold text-emerald-700">= (x - 2) / (x - 1)</span>
                    <div className="text-xs text-slate-500 font-sans mt-1">
                      ({L('प्रतिबन्ध: x ≠ -3, x ≠ 1', 'Restrictions: x ≠ -3, x ≠ 1')})
                    </div>
                  </div>
                </div>
              )}

              {/* DIVISION */}
              {selectedOp === 'divide' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-[#142D4E] text-base">
                      (x² - 4) / (x + 5) ÷ (x - 2) / (x + 5)
                    </span>
                    <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full font-bold">
                      {L('व्युत्क्रम भिन्नले गुणन (Invert & Multiply)', 'Invert & Multiply')}
                    </span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs font-sans">चरण 1: दोस्रो भिन्नलाई उल्ट्याएर गुणन चिन्ह राख्ने</span>
                    <span>= [(x² - 4) / (x + 5)] × [(x + 5) / (x - 2)]</span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs font-sans">चरण 2: x² - 4 लाई (x - 2)(x + 2) मा खण्डिकरण गर्ने</span>
                    <span>= [(x - 2)(x + 2)(x + 5)] / [(x + 5)(x - 2)]</span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs font-sans">चरण 3: समान खण्डहरू (x - 2) र (x + 5) काट्दा</span>
                    <span className="text-base font-bold text-emerald-700">= x + 2</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: EXCLUDED DOMAIN & NUMERICAL VERIFICATION
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'restrictions' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <div>
              <h4 className="font-bold text-sm text-[#142D4E] mb-1">
                {L('अपरिभाषित मानहरू र संख्यात्मक तुल्यता परीक्षण (Domain & Numerical Verification)', 'Domain & Numerical Verification')}
              </h4>
              <p className="text-xs text-slate-600">
                {L(
                  'कुनै पनि भिन्नमा हर (Denominator) शून्य (0) हुन सक्दैन। तल x को मान परिवर्तन गरी हेर्नुहोस् कि मूल भिन्न र सरलीकृत भिन्न समान मान दिन्छन् वा अपरिभाषित हुन्छन्।',
                  'A fraction denominator can never be zero. Change x below to verify that the original and simplified fractions yield the identical value, or become undefined at excluded points.'
                )}
              </p>
            </div>

            {/* Slider / Input for x */}
            <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">
                  {L('परीक्षणका लागि चल राशि x को मान छान्नुहोस्:', 'Select Test Value for x:')}
                </span>
                <span className="text-sm font-black font-mono text-[#167C80]">x = {fmt(testInputX)}</span>
              </div>
              <input
                type="range"
                min="-6"
                max="8"
                step="1"
                value={testInputX}
                onChange={(e) => setTestInputX(Number(e.target.value))}
                className="w-full accent-[#167C80]"
              />
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>x = -6</span>
                <span>x = 0</span>
                <span>x = +8</span>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original Fraction Card */}
              <div
                className={`p-4 rounded-xl border shadow-sm ${
                  origResult.val === null ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {L('1. मूल भिन्नको मान (Original Expression)', '1. Original Expression')}
                </span>
                <div className="font-mono text-xs text-slate-600 mb-2">
                  ({currentSimEx.numOriginal}) / ({currentSimEx.denOriginal})
                </div>

                {origResult.val === null ? (
                  <div className="text-sm font-bold text-rose-700 p-2 bg-rose-100 rounded">
                    ✖ {L('अपरिभाषित (Undefined / हर शून्य!)', 'Undefined (Division by zero!)')}
                  </div>
                ) : (
                  <div className="text-2xl font-black font-mono text-[#142D4E]">
                    {fmt(origResult.val.toFixed(3))}
                  </div>
                )}
              </div>

              {/* Simplified Fraction Card */}
              <div
                className={`p-4 rounded-xl border shadow-sm ${
                  simpResult.val === null ? 'bg-rose-50 border-rose-300' : 'bg-emerald-50 border-emerald-300'
                }`}
              >
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  {L('2. सरलीकृत भिन्नको मान (Simplified Expression)', '2. Simplified Expression')}
                </span>
                <div className="font-mono text-xs text-emerald-700 mb-2">
                  ({currentSimEx.numSimplified}) / ({currentSimEx.denSimplified})
                </div>

                {simpResult.val === null ? (
                  <div className="text-sm font-bold text-rose-700 p-2 bg-rose-100 rounded">
                    ✖ {L('अपरिभाषित (Undefined)', 'Undefined')}
                  </div>
                ) : (
                  <div className="text-2xl font-black font-mono text-emerald-700">
                    {fmt(simpResult.val.toFixed(3))}
                  </div>
                )}
              </div>
            </div>

            {/* Verdict */}
            <div className="p-3.5 bg-slate-100 border rounded-xl text-xs text-slate-700 flex items-center gap-2">
              <span className="text-base">💡</span>
              <div>
                {origResult.val !== null ? (
                  <span>
                    {L(
                      `x = ${fmt(testInputX)} मा दुवै भिन्नको मान हुबहु समान (${fmt(origResult.val.toFixed(3))}) आउँछ। यसले दुई भिन्न समान (Equivalent) भएको पुष्टि गर्छ।`,
                      `At x = ${testInputX}, both expressions yield the exact same value (${origResult.val.toFixed(3)}), proving algebraic equivalence.`
                    )}
                  </span>
                ) : (
                  <span className="text-rose-700 font-bold">
                    {L(
                      `x = ${fmt(testInputX)} हरलाई शून्य बनाउने प्रतिबन्धित मान हो, त्यसैले यहाँ भिन्नको कुनै मान आउँदैन।`,
                      `x = ${testInputX} makes the original denominator 0, thus the expression is undefined at this point.`
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: PRACTICE CHALLENGE
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'challenge' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#167C80]">
                {L(`प्रश्न ${fmt(quizIdx + 1)} / ${fmt(quizQuestions.length)}`, `Question ${fmt(quizIdx + 1)} of ${fmt(quizQuestions.length)}`)}
              </span>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {L(`प्राप्ताङ्क: ${fmt(score)}`, `Score: ${fmt(score)}`)}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#142D4E] mb-4">
              {isNe ? quizQuestions[quizIdx].qNp : quizQuestions[quizIdx].qEn}
            </h3>

            <div className="space-y-2.5 mb-5">
              {(isNe && quizQuestions[quizIdx].optionsNp ? quizQuestions[quizIdx].optionsNp : quizQuestions[quizIdx].options).map(
                (opt, oIdx) => {
                  const isSelected = selectedAns === oIdx;
                  const isCorrect = oIdx === quizQuestions[quizIdx].correct;
                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

                  if (selectedAns !== null) {
                    if (isSelected && isCorrect) btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                    else if (isSelected && !isCorrect) btnStyle = 'bg-rose-100 border-rose-400 text-rose-900 font-bold';
                    else if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(oIdx)}
                      disabled={selectedAns !== null}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                }
              )}
            </div>

            {quizFeedback && (
              <div
                className={`p-3.5 rounded-xl mb-4 text-xs ${
                  selectedAns === quizQuestions[quizIdx].correct
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <div className="font-bold mb-1">{quizFeedback}</div>
                <div>{isNe ? quizQuestions[quizIdx].hintNp : quizQuestions[quizIdx].hintEn}</div>
              </div>
            )}

            {selectedAns !== null && (
              <div className="flex justify-end">
                <button
                  onClick={handleNextQuiz}
                  className="px-5 py-2.5 bg-[#142D4E] text-white rounded-xl text-xs sm:text-sm font-bold shadow hover:bg-slate-800 transition-all"
                >
                  {L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default AlgebraicFractionLab;
