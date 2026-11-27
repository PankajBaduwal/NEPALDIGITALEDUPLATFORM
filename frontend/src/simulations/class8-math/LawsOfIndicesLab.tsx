/**
 * LawsOfIndicesLab.tsx
 * Grade 8 Mathematics – Unit 9: INDICES
 * Simulation 2: Laws of Indices Interactive Lab
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 9)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Layers, Divide, Zap, ArrowRight, ShieldAlert, Award, CheckCircle, RefreshCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'समान आधार भएका घाताङ्कीय सङ्ख्याहरू गुणन गर्दा घाताङ्कहरू के हुन्छन् (xᵐ × xⁿ = ?)?',
    en: 'When multiplying powers with the same base, what happens to exponents (xᵐ × xⁿ = ?)?',
    options: [
      { key: 'A', label: 'Exponents are added: xᵐ⁺ⁿ' },
      { key: 'B', label: 'Exponents are multiplied: xᵐⁿ' },
      { key: 'C', label: 'Exponents are subtracted: xᵐ⁻ⁿ' },
      { key: 'D', label: 'is zero' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै पनि अशून्य सङ्ख्याको घाताङ्क शून्य (Zero Index) हुँदा त्यसको मान कति हुन्छ (x⁰ = ?)?',
    en: 'For any non-zero number x, what is the value of zero exponent (x⁰ = ?)?',
    options: [
      { key: 'A', label: '1 (One: x⁰ = 1, x ≠ 0)' },
      { key: 'B', label: '0 (Zero)' },
      { key: 'C', label: 'x' },
      { key: 'D', label: 'Undefined' },
    ],
    answer: 'A',
  },
  {
    np: '(x²)³ को मान कति हुन्छ?',
    en: 'What is the value of (x²)³?',
    options: [
      { key: 'A', label: 'x⁶ [(xᵐ)ⁿ = xᵐⁿ ⇒ 2 × 3 = 6]' },
      { key: 'B', label: 'x⁵' },
      { key: 'C', label: 'x⁸' },
      { key: 'D', label: 'x¹' },
    ],
    answer: 'A',
  },
  {
    np: 'ऋणात्मक घाताङ्क x⁻² लाई भिन्नका रूपमा कसरी लेखिन्छ?',
    en: 'How is the negative exponent x⁻² written in fraction form?',
    options: [
      { key: 'A', label: '1 / x²' },
      { key: 'B', label: '-2x' },
      { key: 'C', label: '-x²' },
      { key: 'D', label: '2 / x' },
    ],
    answer: 'A',
  },
  {
    np: 'x⁸ ÷ x³ को सरलीकृत रूप के हुन्छ?',
    en: 'What is the simplified form of x⁸ ÷ x³?',
    options: [
      { key: 'A', label: 'x⁵ [ x⁸⁻³ = x⁵ ]' },
      { key: 'B', label: 'x¹¹' },
      { key: 'C', label: 'x²⁴' },
      { key: 'D', label: 'x²' },
    ],
    answer: 'A',
  },
];

export const LawsOfIndicesLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U9-02',
    chapter: 9,
    titleNp: 'घाताङ्कका नियमहरू प्रयोगशाला (Laws of Indices Lab)',
    titleEn: 'Laws of Indices Interactive Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeLaw, setActiveLaw] = useState<'product' | 'quotient' | 'power_power' | 'zero' | 'negative'>('product');

  // Product law state
  const [prodM, setProdM] = useState<number>(3);
  const [prodN, setProdN] = useState<number>(2);

  // Quotient law state
  const [quotM, setQuotM] = useState<number>(5);
  const [quotN, setQuotN] = useState<number>(2);

  // Power of power state
  const [powM, setPowM] = useState<number>(2);
  const [powN, setPowN] = useState<number>(3);

  // Negative law state
  const [negM, setNegM] = useState<number>(3);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! घाताङ्कका 7 ओटा आधारभूत नियमहरूलाई चरणबद्ध विस्तार र काट्ने विधिबाट प्रत्यक्ष प्रमाणित गरौं!',
        'Hello! Let us visually verify all 7 laws of indices through expanded factorization and cancellations!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveLaw('product')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeLaw === 'product' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            {L('1. गुणन नियम (xᵐ × xⁿ = xᵐ⁺ⁿ)', '1. Product Rule')}
          </button>
          <button
            onClick={() => setActiveLaw('quotient')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeLaw === 'quotient' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Divide className="w-4 h-4" />
            {L('2. भाग नियम (xᵐ ÷ xⁿ = xᵐ⁻ⁿ)', '2. Quotient Rule')}
          </button>
          <button
            onClick={() => setActiveLaw('power_power')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeLaw === 'power_power' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            {L('3. घातको घात ((xᵐ)ⁿ = xᵐⁿ)', '3. Power of Power')}
          </button>
          <button
            onClick={() => setActiveLaw('zero')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeLaw === 'zero' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>0</span>
            {L('4. शून्य घाताङ्क (x⁰ = 1)', '4. Zero Exponent')}
          </button>
          <button
            onClick={() => setActiveLaw('negative')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeLaw === 'negative' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>-</span>
            {L('5. ऋणात्मक घाताङ्क (x⁻ᵐ = 1/xᵐ)', '5. Negative Index')}
          </button>
        </div>

        {/* Tab 1: Product Rule */}
        {activeLaw === 'product' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="text-xl font-black text-amber-400">
                  x<sup>{toNp(prodM)}</sup> × x<sup>{toNp(prodN)}</sup> = x<sup>{toNp(prodM + prodN)}</sup>
                </div>
                <div className="text-xs px-3 py-1 bg-indigo-900 text-indigo-300 rounded-full font-bold">
                  {L('नियम: xᵐ × xⁿ = xᵐ⁺ⁿ', 'Rule: xᵐ × xⁿ = xᵐ⁺ⁿ')}
                </div>
              </div>

              {/* Visual Factor Expansion */}
              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase">{L('विस्तार र संयोजन (Expansion & Combination):', 'Expansion & Combination:')}</div>

                <div className="flex flex-wrap items-center gap-3 text-lg font-mono">
                  {/* Part 1 */}
                  <div className="p-3 bg-indigo-950/80 border border-indigo-500 rounded-xl flex items-center gap-1.5">
                    {Array.from({ length: prodM }).map((_, i) => (
                      <React.Fragment key={i}>
                        <span className="text-sky-300 font-bold">x</span>
                        {i < prodM - 1 && <span className="text-slate-500">·</span>}
                      </React.Fragment>
                    ))}
                    <span className="text-xs text-indigo-300 ml-2">({toNp(prodM)} times)</span>
                  </div>

                  <span className="text-amber-400 font-bold">×</span>

                  {/* Part 2 */}
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl flex items-center gap-1.5">
                    {Array.from({ length: prodN }).map((_, i) => (
                      <React.Fragment key={i}>
                        <span className="text-emerald-300 font-bold">x</span>
                        {i < prodN - 1 && <span className="text-slate-500">·</span>}
                      </React.Fragment>
                    ))}
                    <span className="text-xs text-emerald-300 ml-2">({toNp(prodN)} times)</span>
                  </div>

                  <span className="text-slate-400">=</span>

                  <div className="p-3 bg-amber-950/80 border border-amber-500 rounded-xl font-bold text-amber-300">
                    x<sup>{toNp(prodM)} + {toNp(prodN)}</sup> = x<sup>{toNp(prodM + prodN)}</sup>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-sky-400 block mb-1">Exponent m: {toNp(prodM)}</label>
                  <input type="range" min="1" max="5" value={prodM} onChange={(e) => setProdM(Number(e.target.value))} className="w-full accent-sky-500" />
                </div>
                <div>
                  <label className="text-xs text-emerald-400 block mb-1">Exponent n: {toNp(prodN)}</label>
                  <input type="range" min="1" max="5" value={prodN} onChange={(e) => setProdN(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Quotient Rule */}
        {activeLaw === 'quotient' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="text-xl font-black text-amber-400">
                  x<sup>{toNp(quotM)}</sup> ÷ x<sup>{toNp(quotN)}</sup> = x<sup>{toNp(quotM - quotN)}</sup>
                </div>
                <div className="text-xs px-3 py-1 bg-indigo-900 text-indigo-300 rounded-full font-bold">
                  {L('नियम: xᵐ ÷ xⁿ = xᵐ⁻ⁿ (x ≠ 0)', 'Rule: xᵐ ÷ xⁿ = xᵐ⁻ⁿ')}
                </div>
              </div>

              {/* Fraction Cancellation Demo */}
              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center gap-6 text-lg font-mono">
                  {/* Fraction */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 p-2 border-b-2 border-slate-400 text-sky-300">
                      {Array.from({ length: quotM }).map((_, i) => (
                        <span key={i} className={i < quotN ? 'line-through opacity-40 text-rose-400' : 'font-bold'}>
                          x
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 p-2 text-emerald-300">
                      {Array.from({ length: quotN }).map((_, i) => (
                        <span key={i} className="line-through opacity-40 text-rose-400">
                          x
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="text-slate-400">=</span>

                  <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-2xl font-bold text-emerald-300 text-2xl">
                    x<sup>{toNp(quotM - quotN)}</sup>
                  </div>
                </div>

                <div className="text-xs text-slate-400 text-center">
                  Of the numerator and denominator, <b className="text-rose-400">{toNp(quotN)} common factors (x)</b> remaining after cancelling <b className="text-emerald-400">{toNp(quotM - quotN)} x's</b> remain.
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-sky-400 block mb-1">Numerator exponent m: {toNp(quotM)}</label>
                  <input type="range" min={quotN} max="7" value={quotM} onChange={(e) => setQuotM(Number(e.target.value))} className="w-full accent-sky-500" />
                </div>
                <div>
                  <label className="text-xs text-emerald-400 block mb-1">Denominator exponent n: {toNp(quotN)}</label>
                  <input type="range" min="1" max={quotM} value={quotN} onChange={(e) => setQuotN(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Power of a Power */}
        {activeLaw === 'power_power' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="text-xl font-black text-amber-400">
                  (x<sup>{toNp(powM)}</sup>)<sup>{toNp(powN)}</sup> = x<sup>{toNp(powM * powN)}</sup>
                </div>
                <div className="text-xs px-3 py-1 bg-indigo-900 text-indigo-300 rounded-full font-bold">
                  {L('नियम: (xᵐ)ⁿ = xᵐⁿ', 'Rule: (xᵐ)ⁿ = xᵐⁿ')}
                </div>
              </div>

              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3 font-mono text-xs">
                <div className="text-amber-300 font-bold uppercase">{L('विस्तार प्रक्रिया:', 'Expansion Steps:')}</div>
                <div>1. Term inside the bracket: x<sup>{toNp(powM)}</sup></div>
                <div>2. Multiplying it {toNp(powN)} times repeatedly:</div>
                <div className="p-3 bg-slate-900 rounded-xl text-sky-300 flex flex-wrap gap-2 text-sm">
                  {Array.from({ length: powN }).map((_, i) => (
                    <React.Fragment key={i}>
                      <span>(x<sup>{toNp(powM)}</sup>)</span>
                      {i < powN - 1 && <span className="text-slate-500">×</span>}
                    </React.Fragment>
                  ))}
                  <span className="text-slate-400">=</span>
                  <span className="text-emerald-400 font-bold">x<sup>{toNp(powM * powN)}</sup></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-sky-400 block mb-1">Inner exponent m: {toNp(powM)}</label>
                  <input type="range" min="1" max="4" value={powM} onChange={(e) => setPowM(Number(e.target.value))} className="w-full accent-sky-500" />
                </div>
                <div>
                  <label className="text-xs text-emerald-400 block mb-1">Outer exponent n: {toNp(powN)}</label>
                  <input type="range" min="1" max="4" value={powN} onChange={(e) => setPowN(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Zero Exponent */}
        {activeLaw === 'zero' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('शून्य घाताङ्क किन 1 हुन्छ? (Why is x⁰ = 1?)', 'Why is x⁰ = 1?')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('CDC पाठ्यपुस्तक प्रमाण: समान पदलाई समान पदले भाग गर्दा 1 आउँछ र भाग नियम अनुसार घाताङ्क घट्छ।', 'CDC Proof: Dividing any number by itself gives 1; quotient rule subtracts exponents.')}
                </p>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 font-mono text-sm">
                <div className="text-amber-400 font-bold uppercase">{L('प्रमाण विधि (Proof by Two Approaches):', 'Proof by Two Approaches:')}</div>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <span className="text-sky-300">Method 1:</span> x³ ÷ x³ = <b>1</b> (because any number divided by itself gives 1)
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <span className="text-emerald-300">Method 2:</span> x³ ÷ x³ = x<sup>3 - 3</sup> = <b>x⁰</b>
                  </div>
                </div>
                <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-xl text-center text-xl font-bold text-emerald-300">
                  From equations 1 and 2: <span className="text-amber-400">x⁰ = 1</span> (where x ≠ 0)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Negative Exponent */}
        {activeLaw === 'negative' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('ऋणात्मक घाताङ्कको नियम (Negative Exponent: x⁻ᵐ = 1/xᵐ)', 'Negative Exponent Rule')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'अंशबाट हरमा वा हरबाट अंशमा सार्दा घाताङ्कको चिन्ह उल्टो (+ बाट - वा - बाट +) हुन्छ।',
                    'Moving a factor across the fraction bar inverts the sign of its exponent.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-slate-900 text-white p-6 rounded-2xl text-center space-y-4">
                  <div className="text-xs text-slate-400 uppercase font-bold">{L('ऋणात्मक घाताङ्क रूप', 'Negative Form')}</div>
                  <div className="text-4xl font-mono font-black text-rose-400">
                    x<sup>-{toNp(negM)}</sup>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl text-center space-y-4">
                  <div className="text-xs text-slate-400 uppercase font-bold">{L('धनात्मक भिन्न रूप', 'Fraction Form')}</div>
                  <div className="text-4xl font-mono font-black text-emerald-400">
                    1 / x<sup>{toNp(negM)}</sup>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Change exponent m: {toNp(negM)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={negM}
                  onChange={(e) => setNegM(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default LawsOfIndicesLab;
