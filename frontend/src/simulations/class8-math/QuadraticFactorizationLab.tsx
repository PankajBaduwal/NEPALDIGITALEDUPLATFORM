/**
 * QuadraticFactorizationLab.tsx
 * Grade 8 Mathematics – Unit 10: ALGEBRAIC EXPRESSION (बीजगणितीय व्यञ्जक)
 * Simulation 2: Quadratic Expression & Factorization Lab (वर्ग समीकरण र खण्डीकरण प्रयोगशाला)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 10)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Calculator, CheckCircle, RefreshCw, Award, ArrowRight, Grid } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'x² + 5x + 6 लाई खण्डीकरण गर्दा गुणनफल ६ र जोड ५ हुने दुई सङ्ख्याहरू कुन हुन्?',
    en: 'When factorizing x² + 5x + 6, which two numbers have product 6 and sum 5?',
    options: [
      { key: 'A', label: '२ र ३ [ २ × ३ = ६, २ + ३ = ५ ]' },
      { key: 'B', label: '१ र ६' },
      { key: 'C', label: '४ र १' },
      { key: 'D', label: '-२ र -३' },
    ],
    answer: 'A',
  },
  {
    np: 'x² + 5x - 6 को खण्डीकृत रूप के हुन्छ?',
    en: 'What is the factorized form of x² + 5x - 6?',
    options: [
      { key: 'A', label: '(x + 6)(x - 1) [ ६ × (-१) = -६, ६ - १ = ५ ]' },
      { key: 'B', label: '(x + 2)(x + 3)' },
      { key: 'C', label: '(x - 6)(x + 1)' },
      { key: 'D', label: '(x - 2)(x - 3)' },
    ],
    answer: 'A',
  },
  {
    np: '३x² + ११x + ६ मा गुणनफल ३ × ६ = १८ र जोड ११ हुने दुई सङ्ख्याहरू के हुन्?',
    en: 'In 3x² + 11x + 6, what two numbers have product 18 and sum 11?',
    options: [
      { key: 'A', label: '९ र २ [ ९ × २ = १८, ९ + २ = ११ ]' },
      { key: 'B', label: '६ र ३' },
      { key: 'C', label: '१८ र १' },
      { key: 'D', label: '१० र १' },
    ],
    answer: 'A',
  },
  {
    np: '३x² + ११x + ६ को अन्तिम खण्डीकृत रूप के हो?',
    en: 'What is the final factorized form of 3x² + 11x + 6?',
    options: [
      { key: 'A', label: '(x + 3)(3x + 2)' },
      { key: 'B', label: '(3x + 1)(x + 6)' },
      { key: 'C', label: '(3x + 3)(x + 2)' },
      { key: 'D', label: '(x + 9)(x + 2)' },
    ],
    answer: 'A',
  },
  {
    np: 'x² - 6x + 5 लाई खण्डीकरण गर्दा के आउँछ?',
    en: 'What is the factorized form of x² - 6x + 5?',
    options: [
      { key: 'A', label: '(x - 1)(x - 5) [ (-१) × (-५) = ५, (-१) + (-५) = -६ ]' },
      { key: 'B', label: '(x + 1)(x + 5)' },
      { key: 'C', label: '(x - 2)(x - 3)' },
      { key: 'D', label: '(x + 6)(x - 1)' },
    ],
    answer: 'A',
  },
];

const PRESET_QUADRATICS = [
  {
    id: 1,
    nameNp: 'x² + 5x + 6 (CDC उदाहरण १: धनात्मक अचर)',
    nameEn: 'x² + 5x + 6 (Positive Constant)',
    a: 1, b: 5, c: 6,
    p: 2, q: 3,
    stepsNp: [
      'गुणनफल = ६, जोड = ५ ⇒ सङ्ख्याहरू २ र ३',
      'मध्यपद टुक्र्याउँदा: x² + 2x + 3x + 6',
      'समूह बनाउँदा: x(x + 2) + 3(x + 2)',
      'अन्तिम रूप: (x + 2)(x + 3)',
    ],
  },
  {
    id: 2,
    nameNp: 'x² + 5x - 6 (CDC उदाहरण २: ऋणात्मक अचर)',
    nameEn: 'x² + 5x - 6 (Negative Constant)',
    a: 1, b: 5, c: -6,
    p: 6, q: -1,
    stepsNp: [
      'गुणनफल = -६, जोड = ५ ⇒ सङ्ख्याहरू ६ र -१',
      'मध्यपद टुक्र्याउँदा: x² + 6x - x - 6',
      'समूह बनाउँदा: x(x + 6) - 1(x + 6)',
      'अन्तिम रूप: (x + 6)(x - 1)',
    ],
  },
  {
    id: 3,
    nameNp: '3x² + 11x + 6 (CDC उदाहरण ३: x² को गुणाङ्क भएको)',
    nameEn: '3x² + 11x + 6 (Leading Coefficient > 1)',
    a: 3, b: 11, c: 6,
    p: 9, q: 2,
    stepsNp: [
      'गुणनफल = ३ × ६ = १८, जोड = ११ ⇒ सङ्ख्याहरू ९ र २',
      'मध्यपद टुक्र्याउँदा: 3x² + 9x + 2x + 6',
      'समूह बनाउँदा: 3x(x + 3) + 2(x + 3)',
      'अन्तिम रूप: (x + 3)(3x + 2)',
    ],
  },
  {
    id: 4,
    nameNp: 'x² - 6x + 5 (ऋणात्मक मध्यपद)',
    nameEn: 'x² - 6x + 5 (Negative Middle Term)',
    a: 1, b: -6, c: 5,
    p: -1, q: -5,
    stepsNp: [
      'गुणनफल = ५, जोड = -६ ⇒ सङ्ख्याहरू -१ र -५',
      'मध्यपद टुक्र्याउँदा: x² - x - 5x + 5',
      'समूह बनाउँदा: x(x - 1) - 5(x - 1)',
      'अन्तिम रूप: (x - 1)(x - 5)',
    ],
  },
];

export const QuadraticFactorizationLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U10-02',
    chapter: 10,
    titleNp: 'वर्ग समीकरण र खण्डीकरण प्रयोगशाला (Quadratic Factorization Lab)',
    titleEn: 'Quadratic Expression and Factorization Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'textbook_cases' | 'factor_pair_table' | 'challenge'>('textbook_cases');

  // Selected preset
  const [selectedCase, setSelectedCase] = useState(PRESET_QUADRATICS[0]);

  // Factor pair discovery state
  const [targetProduct, setTargetProduct] = useState<number>(12);
  const [targetSum, setTargetSum] = useState<number>(7);

  // Generate factor pairs of targetProduct
  const factorPairs: { f1: number; f2: number; sum: number }[] = [];
  const absP = Math.abs(targetProduct);
  for (let i = 1; i <= Math.sqrt(absP); i++) {
    if (absP % i === 0) {
      const other = absP / i;
      if (targetProduct > 0) {
        factorPairs.push({ f1: i, f2: other, sum: i + other });
        factorPairs.push({ f1: -i, f2: -other, sum: -i - other });
      } else {
        factorPairs.push({ f1: i, f2: -other, sum: i - other });
        factorPairs.push({ f1: -i, f2: other, sum: -i + other });
      }
    }
  }

  // Interactive challenge state
  const [chalPInput, setChalPInput] = useState('');
  const [chalQInput, setChalQInput] = useState('');
  const [chalFeedback, setChalFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  const handleCheckChallenge = () => {
    const pVal = parseInt(chalPInput, 10);
    const qVal = parseInt(chalQInput, 10);
    const expectedProd = selectedCase.p * selectedCase.q;
    const expectedSum = selectedCase.p + selectedCase.q;

    if (pVal * qVal === expectedProd && pVal + qVal === expectedSum) {
      kit.good();
      setChalFeedback({
        isCorrect: true,
        msg: L(`उत्कृष्ट! सङ्ख्याहरू ${toNp(pVal)} र ${toNp(qVal)} सही छन्!`, `Brilliant! Numbers ${pVal} and ${qVal} are correct!`),
      });
    } else {
      kit.oops();
      setChalFeedback({
        isCorrect: false,
        msg: L(
          `प्रयास गर्नुहोस्! गुणनफल = ${toNp(expectedProd)} र जोड = ${toNp(expectedSum)} हुनुपर्छ।`,
          `Keep trying! Product must be ${expectedProd} and Sum must be ${expectedSum}.`
        ),
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
        'नमस्ते! ax² + bx + c रूपको त्रिपदीय व्यञ्जकलाई मध्यपद टुक्र्याएर (Product & Sum विधि) खण्डीकरण गर्न सिकौं!',
        'Hello! Let us factorize quadratic trinomials ax² + bx + c by splitting the middle term using the product-and-sum method!'
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
            <Calculator className="w-4 h-4" />
            {L('१. CDC पाठ्यपुस्तक केसहरू (CDC Cases)', '1. CDC Textbook Cases')}
          </button>
          <button
            onClick={() => setActiveTab('factor_pair_table')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'factor_pair_table' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            {L('२. गुणनखण्ड जोडी तालिका (Factor Pairs Table)', '2. Factor Pair Table')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'challenge' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            {L('३. मध्यपद खण्डीकरण चुनौती (Split Term Challenge)', '3. Split Term Challenge')}
          </button>
        </div>

        {/* Tab 1: Textbook Cases */}
        {activeTab === 'textbook_cases' && (
          <div className="space-y-6">
            {/* Case Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {PRESET_QUADRATICS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    selectedCase.id === item.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isNe ? item.nameNp : item.nameEn}
                </button>
              ))}
            </div>

            {/* Step-by-Step Mathematical Flow */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6 font-mono">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="text-2xl font-black text-amber-400">
                  {isNe ? selectedCase.nameNp.split(' ')[0] : selectedCase.nameEn.split(' ')[0]}
                </div>
                <div className="text-xs text-slate-400">
                  a = {toNp(selectedCase.a)}, b = {toNp(selectedCase.b)}, c = {toNp(selectedCase.c)}
                </div>
              </div>

              {/* Steps display */}
              <div className="space-y-3 text-sm">
                {selectedCase.stepsNp.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition ${
                      idx === selectedCase.stepsNp.length - 1
                        ? 'bg-emerald-950/80 border-emerald-500 font-bold text-emerald-300 text-lg text-center font-sans'
                        : 'bg-slate-800/90 border-slate-700 text-slate-200'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>

              {/* Expansion verification */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 text-xs text-slate-400 space-y-1">
                <div className="font-bold text-amber-300 font-sans">{L('उत्तरको सत्यता जाँच (Verification by Expansion):', 'Verification by Expansion:')}</div>
                <div>(x + {toNp(selectedCase.p)})(... ) लाई गुणन गर्दा सुरुको व्यञ्जक प्राप्त हुन्छ।</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Factor Pair Table Generator */}
        {activeTab === 'factor_pair_table' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('अन्तरक्रियात्मक गुणनखण्ड जोडी खोजकर्ता (Factor Pair Finder)', 'Factor Pair Finder')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('कुनै पनि गुणनफल (ac) र चाहेको जोड (b) लेख्नुहोस्। प्रणालीले उपयुक्त जोडी छानेर देखाउँछ:', 'Enter product (ac) and target sum (b) to automatically test factor pairs:')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {L('गुणनफल (Product = a × c):', 'Product (a × c):')}
                  </label>
                  <input
                    type="number"
                    value={targetProduct}
                    onChange={(e) => setTargetProduct(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-indigo-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {L('चाहिएको जोड वा अन्तर (Target Sum = b):', 'Target Sum (b):')}
                  </label>
                  <input
                    type="number"
                    value={targetSum}
                    onChange={(e) => setTargetSum(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Table of factor pairs */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">{L('गुणनखण्ड १ (f₁)', 'Factor 1')}</th>
                      <th className="p-3">{L('गुणनखण्ड २ (f₂)', 'Factor 2')}</th>
                      <th className="p-3">{L('गुणनफल (f₁ × f₂)', 'Product')}</th>
                      <th className="p-3">{L('जोड (f₁ + f₂)', 'Sum')}</th>
                      <th className="p-3 text-right">{L('स्थिति (Match?)', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {factorPairs.map((pair, idx) => {
                      const isMatch = pair.sum === targetSum;
                      return (
                        <tr key={idx} className={isMatch ? 'bg-emerald-100 font-bold text-emerald-950' : 'text-slate-700'}>
                          <td className="p-3">{toNp(pair.f1)}</td>
                          <td className="p-3">{toNp(pair.f2)}</td>
                          <td className="p-3">{toNp(targetProduct)}</td>
                          <td className="p-3 font-bold">{toNp(pair.sum)}</td>
                          <td className="p-3 text-right">
                            {isMatch ? (
                              <span className="px-2 py-1 bg-emerald-600 text-white rounded-md text-[10px] font-bold">
                                {L('सही जोडी (MATCH!)', 'MATCH!')}
                              </span>
                            ) : (
                              <span className="text-slate-400">बेमेल</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Split Term Challenge */}
        {activeTab === 'challenge' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('मध्यपद टुक्र्याउने दुई सङ्ख्या पत्ता लगाउनुहोस्', 'Find the Two Numbers to Split Middle Term')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  व्यञ्जक: <b className="text-indigo-700 font-mono text-base">{selectedCase.nameNp.split(' ')[0]}</b>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {L('पहिलो सङ्ख्या (p):', 'First number (p):')}
                  </label>
                  <input
                    type="number"
                    value={chalPInput}
                    onChange={(e) => setChalPInput(e.target.value)}
                    placeholder="p..."
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {L('दोस्रो सङ्ख्या (q):', 'Second number (q):')}
                  </label>
                  <input
                    type="number"
                    value={chalQInput}
                    onChange={(e) => setChalQInput(e.target.value)}
                    placeholder="q..."
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <button
                onClick={handleCheckChallenge}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" /> {L('उत्तर जाँच्नुहोस्', 'Check Answer')}
              </button>

              {chalFeedback && (
                <div
                  className={`p-4 rounded-2xl text-sm font-semibold ${
                    chalFeedback.isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {chalFeedback.msg}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default QuadraticFactorizationLab;
