/**
 * HcfLcmAlgebraicExpressionsLab.tsx
 * Grade 8 Mathematics – Unit 10: ALGEBRAIC EXPRESSION
 * Simulation 3: HCF and LCM of Algebraic Expressions Lab
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 10)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Layers, CheckCircle, RefreshCw, Award, GitMerge, ListFilter } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'x² + 2xy + y² र x² - y² को महत्तम समापवर्तक (HCF) के हुन्छ?',
    en: 'What is the HCF of x² + 2xy + y² and x² - y²?',
    options: [
      { key: 'A', label: 'x + y [ common to (x+y)² and (x+y)(x-y) ]' },
      { key: 'B', label: 'x - y' },
      { key: 'C', label: '(x + y)²' },
      { key: 'D', label: 'x² + y²' },
    ],
    answer: 'A',
  },
  {
    np: 'माथिका दुई व्यञ्जकहरूको लघुत्तम समापवर्त्य (LCM) कुन हो?',
    en: 'What is the LCM of the above two expressions?',
    options: [
      { key: 'A', label: '(x + y)²(x - y)' },
      { key: 'B', label: '(x + y)(x - y)' },
      { key: 'C', label: '(x - y)²' },
      { key: 'D', label: 'x² - y²' },
    ],
    answer: 'A',
  },
  {
    np: 'x² + 6x + 8, x² - 4 र x² + 4x + 4 तीनै ओटाको साझा गुणनखण्ड (HCF) के हो?',
    en: 'What is the common factor (HCF) of x² + 6x + 8, x² - 4 and x² + 4x + 4?',
    options: [
      { key: 'A', label: 'x + 2' },
      { key: 'B', label: 'x - 2' },
      { key: 'C', label: 'x + 4' },
      { key: 'D', label: '(x + 2)²' },
    ],
    answer: 'A',
  },
  {
    np: 'ल.स. (LCM) निकाल्ने सही सूत्र कुन हो?',
    en: 'Which is the correct principle to find LCM of expressions?',
    options: [
      { key: 'A', label: 'Common factors × remaining factors' },
      { key: 'B', label: 'Common factors only' },
      { key: 'C', label: 'Remaining factors only' },
      { key: 'D', label: 'Sum of both expressions' },
    ],
    answer: 'A',
  },
  {
    np: 'x² र x³ को HCF र LCM क्रमशः के के हुन्?',
    en: 'What are the HCF and LCM of monomials x² and x³?',
    options: [
      { key: 'A', label: 'HCF = x², LCM = x³' },
      { key: 'B', label: 'HCF = x³, LCM = x²' },
      { key: 'C', label: 'HCF = x, LCM = x⁵' },
      { key: 'D', label: 'HCF = 1, LCM = x⁶' },
    ],
    answer: 'A',
  },
];

const PRESET_CASES = [
  {
    id: 1,
    titleNp: 'केस 1: दुई द्विपदीय/त्रिपदीय व्यञ्जक (CDC पाठ्यपुस्तक उदाहरण 3)',
    titleEn: 'Case 1: Two Expressions (CDC Example 3)',
    e1Name: 'x² + 2xy + y²',
    e1Factors: '(x + y)(x + y)',
    e2Name: 'x² - y²',
    e2Factors: '(x + y)(x - y)',
    common: '(x + y)',
    remaining: '(x + y), (x - y)',
    hcf: 'x + y',
    lcm: '(x + y)²(x - y)',
  },
  {
    id: 2,
    titleNp: 'केस 2: तीन त्रिपदीय व्यञ्जकहरू (CDC पाठ्यपुस्तक उदाहरण 4)',
    titleEn: 'Case 2: Three Expressions (CDC Example 4)',
    e1Name: 'x² + 6x + 8',
    e1Factors: '(x + 4)(x + 2)',
    e2Name: 'x² - 4',
    e2Factors: '(x + 2)(x - 2)',
    e3Name: 'x² + 4x + 4',
    e3Factors: '(x + 2)(x + 2)',
    common: '(x + 2)',
    remaining: '(x + 4), (x - 2), (x + 2)',
    hcf: 'x + 2',
    lcm: '(x + 2)²(x + 4)(x - 2)',
  },
  {
    id: 3,
    titleNp: 'केस 3: संख्यात्मक र एकपदीय (Monomials)',
    titleEn: 'Case 3: Numeric & Monomials',
    e1Name: '12x²',
    e1Factors: '2 × 2 × 3 × x × x',
    e2Name: '18x³',
    e2Factors: '2 × 3 × 3 × x × x × x',
    common: '2 × 3 × x × x = 6x²',
    remaining: '2, 3, x',
    hcf: '6x²',
    lcm: '36x³',
  },
];

export const HcfLcmAlgebraicExpressionsLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U10-03',
    chapter: 10,
    titleNp: 'बीजीय व्यञ्जकहरूको म.स. र ल.स. (HCF & LCM of Algebraic Expressions)',
    titleEn: 'HCF and LCM of Algebraic Expressions Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'textbook_cases' | 'concept_venn' | 'challenge'>('textbook_cases');

  // Selected case
  const [selectedCase, setSelectedCase] = useState(PRESET_CASES[0]);

  // Challenge State
  const [chalChoice, setChalChoice] = useState<'HCF' | 'LCM'>('HCF');
  const [userSelectedHcf, setUserSelectedHcf] = useState<string | null>(null);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! बीजीय व्यञ्जकहरूको म.स. र ल.स. निकाल्न पहिले प्रत्येक व्यञ्जकलाई खण्डीकरण गर्नुपर्छ। आउनुहोस् साझा र बाँकी गुणनखण्ड छानौं!',
        'Hello! To find HCF and LCM of algebraic expressions, factorize each expression first. Then group common and remaining factors!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('textbook_cases')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'textbook_cases' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <GitMerge className="w-4 h-4" />
            {L('1. CDC पाठ्यपुस्तक उदाहरणहरू (CDC Cases)', '1. CDC Textbook Cases')}
          </button>
          <button
            onClick={() => setActiveTab('concept_venn')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'concept_venn' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            {L('2. म.स. र ल.स. सिद्धान्त (HCF vs LCM Principle)', '2. HCF vs LCM Principle')}
          </button>
        </div>

        {/* Tab 1: Textbook Cases */}
        {activeTab === 'textbook_cases' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {PRESET_CASES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    selectedCase.id === item.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isNe ? item.titleNp : item.titleEn}
                </button>
              ))}
            </div>

            {/* Step-by-step factorization breakdown */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6 font-mono">
              <div className="text-amber-400 font-bold text-sm uppercase">
                {isNe ? selectedCase.titleNp : selectedCase.titleEn}
              </div>

              {/* Expressions and their factorized forms */}
              <div className="space-y-3">
                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                  <div className="text-xs text-sky-400 font-bold uppercase">{L('पहिलो व्यञ्जक (First Expression):', 'First Expression:')}</div>
                  <div className="text-base text-white mt-1">
                    {selectedCase.e1Name} = <span className="text-emerald-400 font-bold">{selectedCase.e1Factors}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                  <div className="text-xs text-purple-400 font-bold uppercase">{L('दोस्रो व्यञ्जक (Second Expression):', 'Second Expression:')}</div>
                  <div className="text-base text-white mt-1">
                    {selectedCase.e2Name} = <span className="text-emerald-400 font-bold">{selectedCase.e2Factors}</span>
                  </div>
                </div>

                {selectedCase.e3Name && (
                  <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    <div className="text-xs text-amber-400 font-bold uppercase">{L('तेस्रो व्यञ्जक (Third Expression):', 'Third Expression:')}</div>
                    <div className="text-base text-white mt-1">
                      {selectedCase.e3Name} = <span className="text-emerald-400 font-bold">{selectedCase.e3Factors}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Result cards: HCF & LCM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* HCF */}
                <div className="p-5 bg-blue-950/80 border-2 border-blue-500 rounded-2xl">
                  <div className="text-xs font-bold uppercase text-blue-300">
                    {L('महत्तम समापवर्तक (HCF - साझा मात्र)', 'HCF (Common Factors Only)')}
                  </div>
                  <div className="text-2xl font-black text-blue-200 mt-2">
                    {selectedCase.hcf}
                  </div>
                  <div className="text-xs text-blue-300/80 mt-1">
                    Common factor: {selectedCase.common}
                  </div>
                </div>

                {/* LCM */}
                <div className="p-5 bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl">
                  <div className="text-xs font-bold uppercase text-emerald-300">
                    {L('लघुत्तम समापवर्त्य (LCM - साझा × बाँकी)', 'LCM (Common × Remaining)')}
                  </div>
                  <div className="text-2xl font-black text-emerald-200 mt-2">
                    {selectedCase.lcm}
                  </div>
                  <div className="text-xs text-emerald-300/80 mt-1">
                    Common × remaining factors
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: HCF vs LCM Principle */}
        {activeTab === 'concept_venn' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('म.स. (HCF) र ल.स. (LCM) को आधारभूत भिन्नता', 'Fundamental Difference between HCF and LCM')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'म.स. ले दिइएका दुवै व्यञ्जकलाई निःशेष भाग जान्छ; तर ल.स. लाई दिइएका दुवै व्यञ्जकले निःशेष भाग जान्छ।',
                    'HCF divides all given expressions; conversely, LCM is divisible by all given expressions.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                  <h4 className="font-bold text-blue-950 text-sm">
                    {L('म.स. (Highest Common Factor - HCF)', 'Highest Common Factor (HCF)')}
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-700">
                    <li>• Only the factors present in all expressions <b>common factors</b> are taken.</li>
                    <li>• For terms with the same base, <b>the lowest exponent</b> is chosen (for example, for x² and x³, HCF = x²).</li>
                    <li>• It is less than or equal to both expressions.</li>
                  </ul>
                </div>

                <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <h4 className="font-bold text-emerald-950 text-sm">
                    {L('ल.स. (Lowest Common Multiple - LCM)', 'Lowest Common Multiple (LCM)')}
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-700">
                    <li>• <b>common factors</b> together with the remaining <b>all factors</b> are multiplied.</li>
                    <li>• For terms with the same base, <b>the highest exponent</b> is chosen (for example, for x² and x³, LCM = x³).</li>
                    <li>• It is greater than or equal to both expressions.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default HcfLcmAlgebraicExpressionsLab;
