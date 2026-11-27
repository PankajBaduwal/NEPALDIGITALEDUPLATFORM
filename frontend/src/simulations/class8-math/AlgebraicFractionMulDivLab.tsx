/**
 * AlgebraicFractionMulDivLab.tsx
 * Grade 8 Mathematics – Unit 11: ALGEBRAIC FRACTION
 * Simulation 3: Algebraic Fraction Multiplication & Division Lab
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 11)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { X, Divide, RotateCw, Scissors, Award, CheckCircle, RefreshCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'बीजीय भिन्नको भाग (Division) गर्दा भाजक (Divisor) भिन्नलाई के गर्नुपर्छ?',
    en: 'When dividing algebraic fractions, what must be done to the divisor fraction?',
    options: [
      { key: 'A', label: 'Multiply by the reciprocal (inverted fraction)' },
      { key: 'B', label: 'Multiply numerator by numerator directly' },
      { key: 'C', label: 'Add the denominator to the numerator' },
      { key: 'D', label: 'Remove the fraction' },
    ],
    answer: 'A',
  },
  {
    np: '[(a² - b²) / (a² + ab)] × [a² / (ab - b²)] लाई सरल गर्दा कुन मान आउँछ?',
    en: 'Simplifying [(a² - b²) / (a² + ab)] × [a² / (ab - b²)] gives what result?',
    options: [
      { key: 'A', label: 'a / b [ (a+b)(a-b)/a(a+b) × a²/b(a-b) = a/b ]' },
      { key: 'B', label: 'b / a' },
      { key: 'C', label: 'a² / b²' },
      { key: 'D', label: '1' },
    ],
    answer: 'A',
  },
  {
    np: '[(x² + 3x + 2) / 4] ÷ [(x² - 1) / 2] को भागफल कति हुन्छ?',
    en: 'What is [(x² + 3x + 2) / 4] ÷ [(x² - 1) / 2]?',
    options: [
      { key: 'A', label: '(x + 2) / [2(x - 1)]' },
      { key: 'B', label: '(x + 1) / 2' },
      { key: 'C', label: '(x - 1) / (x + 2)' },
      { key: 'D', label: '2(x + 2)' },
    ],
    answer: 'A',
  },
  {
    np: 'भिन्न a/b को व्युत्क्रम (Reciprocal) के हो?',
    en: 'What is the reciprocal of fraction a/b?',
    options: [
      { key: 'A', label: 'b / a' },
      { key: 'B', label: '-a / b' },
      { key: 'C', label: '1 / (a + b)' },
      { key: 'D', label: 'ab' },
    ],
    answer: 'A',
  },
  {
    np: 'बीजीय भिन्नको गुणन गर्दा कुन नियम लागू हुन्छ?',
    en: 'Which rule applies when multiplying algebraic fractions?',
    options: [
      { key: 'A', label: ' / (denominator × denominator) [ Numerator×Numerator / Denominator×Denominator ]' },
      { key: 'B', label: ' / (denominator + denominator)' },
      { key: 'C', label: 'A common denominator must be found' },
      { key: 'D', label: 'The answer is always 1' },
    ],
    answer: 'A',
  },
];

export const AlgebraicFractionMulDivLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U11-03',
    chapter: 11,
    titleNp: 'बीजीय भिन्नको गुणन र भाग (Multiplication & Division Lab)',
    titleEn: 'Algebraic Fraction Multiplication and Division Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'multiplication' | 'division_reciprocal' | 'challenge'>('multiplication');

  // Interactive division reciprocal state
  const [isReciprocalInverted, setIsReciprocalInverted] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! बीजीय भिन्नको गुणनमा अंशले अंशलाई र हरले हरलाई गुणन गरिन्छ। भाग गर्दा दोस्रो भिन्नलाई उल्टो (व्युत्क्रम) बनाई गुणन गरिन्छ!',
        'Hello! In algebraic fraction multiplication, multiply numerators and denominators. In division, multiply by the reciprocal of the divisor!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('multiplication')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'multiplication' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
            {L('1. बीजीय भिन्नको गुणन (CDC पाठ्यपुस्तक उदाहरण)', '1. Multiplication')}
          </button>
          <button
            onClick={() => setActiveTab('division_reciprocal')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'division_reciprocal' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            {L('2. बीजीय भिन्नको भाग र व्युत्क्रम (Division & Reciprocal)', '2. Division & Reciprocal')}
          </button>
        </div>

        {/* Tab 1: Multiplication */}
        {activeTab === 'multiplication' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6 font-mono">
              <div className="border-b border-slate-800 pb-3 text-center">
                <span className="text-xs uppercase text-amber-400 font-bold font-sans">
                  {L('CDC पाठ्यपुस्तक उदाहरण 2: गुणन र खण्डीकरण', 'CDC Example 2: Multiplication')}
                </span>
                <div className="text-2xl font-black text-sky-300 mt-1">
                  [(a² - b²) / (a² + ab)] × [a² / (ab - b²)]
                </div>
              </div>

              {/* Step by Step Expansion */}
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-800 rounded-xl space-y-1">
                  <div className="text-amber-400 font-bold font-sans">{L('चरण 1: प्रत्येक व्यञ्जकको खण्डीकरण गर्ने', 'Step 1: Factorize')}</div>
                  <div className="text-slate-300">
                    • a² - b² = <b>(a + b)(a - b)</b><br />
                    • a² + ab = <b>a(a + b)</b><br />
                    • ab - b² = <b>b(a - b)</b>
                  </div>
                </div>

                <div className="p-4 bg-slate-800 rounded-xl space-y-2 text-center">
                  <div className="text-sky-400 font-bold font-sans">{L('चरण 2: खण्डीकृत रूपमा राख्ने', 'Step 2: Factorized Form')}</div>
                  <div className="text-lg py-2">
                    <span className="border-b border-slate-500 pb-1 px-2 inline-block">(a + b)(a - b)</span>
                    <span className="mx-2">×</span>
                    <span className="border-b border-slate-500 pb-1 px-2 inline-block">a · a</span>
                    <br />
                    <span className="pt-1 px-2 inline-block">a(a + b)</span>
                    <span className="mx-2"> </span>
                    <span className="pt-1 px-2 inline-block">b(a - b)</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-800 rounded-xl space-y-1">
                  <div className="text-emerald-400 font-bold font-sans">{L('चरण 3: साझा गुणनखण्डहरू काट्ने', 'Step 3: Cancel Common Factors')}</div>
                  <div className="text-slate-300">
                    • (a + b) with (a + b) cancelled<br />
                    • (a - b) with (a - b) cancelled<br />
                    • a with one a of the numerator cancelled
                  </div>
                </div>

                <div className="p-5 bg-emerald-950/90 border border-emerald-500 rounded-2xl text-center text-2xl font-black text-emerald-300 font-sans">
                  Final simplified value = a / b
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Division and Reciprocal */}
        {activeTab === 'division_reciprocal' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('बीजीय भिन्नको भाग विधि (CDC पाठ्यपुस्तक उदाहरण)', 'Algebraic Fraction Division')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    '[(x² + 3x + 2) / 4] ÷ [(x² - 1) / 2]: भागलाई गुणनमा बदल्दा दोस्रो भिन्न उल्टिन्छ (व्युत्क्रम हुन्छ)।',
                    'Division is converted to multiplication by inverting the divisor fraction.'
                  )}
                </p>
              </div>

              {/* Reciprocal Animation Control */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsReciprocalInverted(!isReciprocalInverted)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition flex items-center gap-2 text-sm"
                >
                  <RotateCw className={`w-4 h-4 transition duration-500 ${isReciprocalInverted ? 'rotate-180' : ''}`} />
                  {isReciprocalInverted ? L('मूल भाग रूप हेर्नुहोस् (÷)', 'Show Division (÷)') : L('व्युत्क्रम गरी गुणनमा बदल्नुहोस् (×)', 'Invert to Multiply (×)')}
                </button>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-2xl font-mono text-center space-y-4">
                <div className="text-2xl font-black text-sky-300">
                  {isReciprocalInverted ? (
                    <div>
                      [(x² + 3x + 2) / 4] <span className="text-emerald-400 font-black">× [2 / (x² - 1)]</span>
                    </div>
                  ) : (
                    <div>
                      [(x² + 3x + 2) / 4] <span className="text-amber-400 font-black">÷ [(x² - 1) / 2]</span>
                    </div>
                  )}
                </div>

                {isReciprocalInverted && (
                  <div className="p-4 bg-slate-800 rounded-xl text-xs text-left space-y-2 text-slate-300 font-mono">
                    <div className="text-amber-400 font-bold font-sans">{L('खण्डीकरण र सरलीकरण:', 'Factorize and Cancel:')}</div>
                    <div>= [ (x + 1)(x + 2) / 4 ] × [ 2 / ((x + 1)(x - 1)) ]</div>
                    <div>• (x + 1) साझा cancelled</div>
                    <div>• 2 ले 4 लाई काट्दा तल 2 बाँकी रह्यो</div>
                    <div className="text-emerald-400 text-xl font-bold font-sans pt-2 border-t border-slate-700 text-center">
                      = (x + 2) / [2(x - 1)]
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default AlgebraicFractionMulDivLab;
