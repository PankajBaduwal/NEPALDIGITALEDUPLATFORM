/**
 * ExpressionSimplificationIndicesChallenge.tsx
 * Grade 8 Mathematics – Unit 9: INDICES
 * Simulation 3: Expression Simplification & Indices Challenge
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 9)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { HelpCircle, CheckCircle, RefreshCw, Award, Calculator, Puzzle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'p⁴ × p³ × p⁻⁵ को सरलीकृत रूप के हुन्छ?',
    en: 'What is the simplified form of p⁴ × p³ × p⁻⁵?',
    options: [
      { key: 'A', label: 'p² [ p⁴⁺³⁻⁵ = p² ]' },
      { key: 'B', label: 'p¹²' },
      { key: 'C', label: 'p⁷' },
      { key: 'D', label: 'p⁻¹²' },
    ],
    answer: 'A',
  },
  {
    np: '(8x⁵) ÷ (2x²) को मान कति हुन्छ?',
    en: 'What is the value of (8x⁵) ÷ (2x²)?',
    options: [
      { key: 'A', label: '4x³ [ (8÷2) × x⁵⁻² = 4x³ ]' },
      { key: 'B', label: '6x³' },
      { key: 'C', label: '4x⁷' },
      { key: 'D', label: '16x¹⁰' },
    ],
    answer: 'A',
  },
  {
    np: '(2a³b²)² को मान कति हुन्छ?',
    en: 'What is the value of (2a³b²)²?',
    options: [
      { key: 'A', label: '4a⁶b⁴ [ 2² × a³ˣ² × b²ˣ² = 4a⁶b⁴ ]' },
      { key: 'B', label: '2a⁶b⁴' },
      { key: 'C', label: '4a⁵b⁴' },
      { key: 'D', label: '4a⁶b²' },
    ],
    answer: 'A',
  },
  {
    np: 'x³ × xᐞ = x⁸ भए खाली कोठा (ᐞ) मा कुन घाताङ्क हुन्छ?',
    en: 'In x³ × xᐞ = x⁸, what is the missing exponent?',
    options: [
      { key: 'A', label: '5 [ 3 + 5 = 8 ]' },
      { key: 'B', label: '24' },
      { key: 'C', label: '2.6' },
      { key: 'D', label: '11' },
    ],
    answer: 'A',
  },
  {
    np: '(x²y²)³ को मान कति हुन्छ?',
    en: 'What is the value of (x²y²)³?',
    options: [
      { key: 'A', label: 'x⁶y⁶' },
      { key: 'B', label: 'x⁵y⁵' },
      { key: 'C', label: 'x⁶y²' },
      { key: 'D', label: 'xy⁶' },
    ],
    answer: 'A',
  },
];

export const ExpressionSimplificationIndicesChallenge: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U9-03',
    chapter: 9,
    titleNp: 'व्यञ्जक सरलीकरण र घाताङ्क चुनौती (Expression Simplification Challenge)',
    titleEn: 'Expression Simplification and Indices Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'step_by_step' | 'missing_exp' | 'challenges'>('step_by_step');

  // Tab 1 Step by step simulator
  const [coeffNum, setCoeffNum] = useState<number>(8);
  const [coeffDen, setCoeffDen] = useState<number>(2);
  const [powerNum, setPowerNum] = useState<number>(5);
  const [powerDen, setPowerDen] = useState<number>(2);

  const resCoeff = coeffDen !== 0 ? coeffNum / coeffDen : 0;
  const resPower = powerNum - powerDen;

  // Tab 2 Missing exponent puzzle
  const [knownPower, setKnownPower] = useState<number>(3);
  const [targetSumPower, setTargetSumPower] = useState<number>(8);
  const [userMissingInput, setUserMissingInput] = useState<string>('');
  const [missingFeedback, setMissingFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  const handleCheckMissing = () => {
    const val = parseInt(userMissingInput, 10);
    const correctVal = targetSumPower - knownPower;
    if (val === correctVal) {
      kit.good();
      setMissingFeedback({
        isCorrect: true,
        msg: L(`उत्कृष्ट! खाली घाताङ्क = ${toNp(correctVal)} ठ्याक्कै सही छ! (${toNp(knownPower)} + ${toNp(correctVal)} = ${toNp(targetSumPower)})`, `Correct! Exponent = ${correctVal}!`),
      });
    } else {
      kit.oops();
      setMissingFeedback({
        isCorrect: false,
        msg: L(`पुनः प्रयास गर्नुहोस्! घाताङ्कको गुणन नियम: ${toNp(knownPower)} + ᐞ = ${toNp(targetSumPower)} ⇒ ᐞ = ${toNp(targetSumPower)} - ${toNp(knownPower)}`, `Try again! Hint: ${knownPower} + Box = ${targetSumPower}`),
      });
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! घाताङ्कका मिश्रित नियमहरू प्रयोग गरेर जटिल बीजीय व्यञ्जकहरूलाई सरल बनाउन सिकौं!',
        'Hello! Let us apply mixed laws of indices to simplify algebraic expressions step by step!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('step_by_step')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'step_by_step' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            {L('1. गुणाङ्क र घाताङ्क सरलीकरण (Coefficients & Powers)', '1. Coefficients & Powers')}
          </button>
          <button
            onClick={() => setActiveTab('missing_exp')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'missing_exp' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Puzzle className="w-4 h-4" />
            {L('2. छुटेको घाताङ्क पत्ता लगाउने (Missing Exponent Puzzle)', '2. Missing Exponent')}
          </button>
        </div>

        {/* Tab 1: Coefficients & Powers */}
        {activeTab === 'step_by_step' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">
                <div className="text-xl font-black text-amber-400 font-mono">
                  ({toNp(coeffNum)}x<sup>{toNp(powerNum)}</sup>) ÷ ({toNp(coeffDen)}x<sup>{toNp(powerDen)}</sup>) ={' '}
                  <span className="text-emerald-400">
                    {toNp(resCoeff)}x<sup>{toNp(resPower)}</sup>
                  </span>
                </div>
                <div className="text-xs px-3 py-1 bg-indigo-900 text-indigo-300 rounded-full font-bold">
                  {L('संख्यात्मक गुणाङ्क र चलराशि छुट्टाछुट्टै', 'Coefficients & Exponents Separated')}
                </div>
              </div>

              {/* Step Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
                  <div className="text-xs font-bold text-sky-400 uppercase">{L('चरण 1: संख्यात्मक गुणाङ्कको भाग', 'Step 1: Divide Coefficients')}</div>
                  <div className="text-xl font-bold font-mono text-white">
                    {toNp(coeffNum)} ÷ {toNp(coeffDen)} = <span className="text-emerald-400 font-black">{toNp(resCoeff)}</span>
                  </div>
                </div>

                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase">{L('चरण 2: चलराशिको घाताङ्क घटाउ', 'Step 2: Subtract Powers')}</div>
                  <div className="text-xl font-bold font-mono text-white">
                    x<sup>{toNp(powerNum)} - {toNp(powerDen)}</sup> = <span className="text-emerald-400 font-black">x<sup>{toNp(resPower)}</sup></span>
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Numerator coefficient: {toNp(coeffNum)}</label>
                  <input type="range" min="4" max="24" step="2" value={coeffNum} onChange={(e) => setCoeffNum(Number(e.target.value))} className="w-full accent-sky-500" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Denominator coefficient: {toNp(coeffDen)}</label>
                  <input type="range" min="1" max="6" value={coeffDen} onChange={(e) => setCoeffDen(Number(e.target.value))} className="w-full accent-sky-500" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Numerator exponent: {toNp(powerNum)}</label>
                  <input type="range" min={powerDen} max="8" value={powerNum} onChange={(e) => setPowerNum(Number(e.target.value))} className="w-full accent-amber-500" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Denominator exponent: {toNp(powerDen)}</label>
                  <input type="range" min="1" max={powerNum} value={powerDen} onChange={(e) => setPowerDen(Number(e.target.value))} className="w-full accent-amber-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Missing Exponent Puzzle */}
        {activeTab === 'missing_exp' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('छुटेको घाताङ्क पत्ता लगाउनुहोस् (Missing Exponent Puzzle)', 'Missing Exponent Puzzle')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('CDC पाठ्यपुस्तक अभ्यास: x³ × xᐞ = x⁸ भए खाली कोठाको मान कति हुन्छ?', 'CDC Exercise: If x³ × xᐞ = x⁸, what is the missing exponent in the box?')}
                </p>
              </div>

              {/* Puzzle Equation Card */}
              <div className="p-8 bg-slate-900 text-white rounded-3xl flex items-center justify-center gap-3 text-3xl font-mono">
                <span>x<sup>{toNp(knownPower)}</sup></span>
                <span className="text-amber-400">×</span>
                <span className="px-3 py-1 bg-amber-500/20 border-2 border-dashed border-amber-400 rounded-xl text-amber-300">
                  x<sup>?</sup>
                </span>
                <span className="text-slate-400">=</span>
                <span className="text-emerald-400">x<sup>{toNp(targetSumPower)}</sup></span>
              </div>

              <div className="max-w-xs mx-auto space-y-3">
                <label className="block text-xs font-bold text-slate-600 text-center">
                  {L('खाली कोठा (?) को घाताङ्क लेख्नुहोस्:', 'Enter the missing exponent: ')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={userMissingInput}
                    onChange={(e) => setUserMissingInput(e.target.value)}
                    placeholder={L('घाताङ्क...', 'Exponent...')}
                    className="w-full px-4 py-2 border rounded-xl font-bold text-center text-lg"
                  />
                  <button
                    onClick={handleCheckMissing}
                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition"
                  >
                    {L('जाँच', 'Check')}
                  </button>
                </div>
              </div>

              {missingFeedback && (
                <div
                  className={`p-4 rounded-2xl text-sm font-semibold max-w-md mx-auto text-center ${
                    missingFeedback.isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {missingFeedback.msg}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const newKnown = Math.floor(Math.random() * 4) + 2;
                    const newTarget = newKnown + Math.floor(Math.random() * 5) + 2;
                    setKnownPower(newKnown);
                    setTargetSumPower(newTarget);
                    setUserMissingInput('');
                    setMissingFeedback(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> {L('नयाँ समस्या बनाउनुहोस्', 'Generate New Puzzle')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default ExpressionSimplificationIndicesChallenge;
