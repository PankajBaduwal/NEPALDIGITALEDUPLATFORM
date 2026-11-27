/**
 * SimpleInterestFormulaUnknownLab.tsx
 * Grade 8 Mathematics – Unit 7: SIMPLE INTEREST (साधारण ब्याज)
 * Simulation 2: Simple Interest Formula & Unknown Variables Lab (साधारण ब्याज सूत्र र अज्ञात मान प्रयोगशाला)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 7)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Calculator, Clock, HelpCircle, CheckCircle, RefreshCw, ArrowRight, Compass } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'ब्याज I = रु. २,४००, समय T = ३ वर्ष र दर R = १०% भए सावाँ (P) निकाल्ने सूत्र र मान कति हुन्छ?',
    en: 'If I = Rs. 2,400, T = 3 years and R = 10%, what is the formula and value for Principal (P)?',
    options: [
      { key: 'A', label: 'P = (100 × I) / (T × R) = रु. ८,०००' },
      { key: 'B', label: 'P = रु. ७,५००' },
      { key: 'C', label: 'P = रु. ६,०००' },
      { key: 'D', label: 'P = रु. ९,०००' },
    ],
    answer: 'A',
  },
  {
    np: '३ वर्ष ६ महिनालाई वर्षमा रूपान्तरण गर्दा कति वर्ष हुन्छ?',
    en: 'How many years is 3 years and 6 months when converted to fractional years?',
    options: [
      { key: 'A', label: '३.५ वर्ष (3 + 6/12 = 3.5 years)' },
      { key: 'B', label: '३.६ वर्ष' },
      { key: 'C', label: '३.२ वर्ष' },
      { key: 'D', label: '४ वर्ष' },
    ],
    answer: 'A',
  },
  {
    np: 'सान्तेमानले रु. ५,००० को १०% का दरले ३ वर्ष ६ महिनामा कति ब्याज पाउँछन्?',
    en: 'How much simple interest does Santaman receive on Rs. 5,000 at 10% for 3 years 6 months?',
    options: [
      { key: 'A', label: 'रु. १,७५० [ (५००० × ३.५ × १०) ÷ १०० = १७५० ]' },
      { key: 'B', label: 'रु. १,५००' },
      { key: 'C', label: 'रु. २,०००' },
      { key: 'D', label: 'रु. १,६५०' },
    ],
    answer: 'A',
  },
  {
    np: 'रु. ६,००० को ८% का दरले कति समय (T) मा रु. १,४४० ब्याज आउला?',
    en: 'In how much time (T) will Rs. 6,000 earn Rs. 1,440 interest at 8% per annum?',
    options: [
      { key: 'A', label: '३ वर्ष [ T = (१०० × १४४०) ÷ (६००० × ८) = ३ ]' },
      { key: 'B', label: '२.५ वर्ष' },
      { key: 'C', label: '४ वर्ष' },
      { key: 'D', label: '२ वर्ष' },
    ],
    answer: 'A',
  },
  {
    np: 'रु. १२,००० को २ वर्षमा रु. २,८८० ब्याज आउन ब्याजदर (R) कति हुनुपर्छ?',
    en: 'What interest rate (R) is needed for Rs. 12,000 to earn Rs. 2,880 interest in 2 years?',
    options: [
      { key: 'A', label: '१२% [ R = (१०० × २८८०) ÷ (१२००० × २) = १२% ]' },
      { key: 'B', label: '१०%' },
      { key: 'C', label: '१५%' },
      { key: 'D', label: '८%' },
    ],
    answer: 'A',
  },
];

export const SimpleInterestFormulaUnknownLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U7-02',
    chapter: 7,
    titleNp: 'साधारण ब्याज सूत्र र अज्ञात मान (Simple Interest Formula & Unknown Lab)',
    titleEn: 'Simple Interest Formula & Unknown Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'unknown_solver' | 'time_converter' | 'textbook_cases'>('unknown_solver');

  // Mode for Unknown Solver: 'I' | 'P' | 'T' | 'R'
  const [unknownTarget, setUnknownTarget] = useState<'I' | 'P' | 'T' | 'R'>('P');

  // Values
  const [inP, setInP] = useState<number>(8000);
  const [inT, setInT] = useState<number>(3);
  const [inR, setInR] = useState<number>(10);
  const [inI, setInI] = useState<number>(2400);

  // Time converter states
  const [convYears, setConvYears] = useState<number>(3);
  const [convMonths, setConvMonths] = useState<number>(6);
  const totalConvertedYears = convYears + convMonths / 12;

  // Unknown calculations
  const calcI = (inP * inT * inR) / 100;
  const calcP = inT * inR > 0 ? (100 * inI) / (inT * inR) : 0;
  const calcT = inP * inR > 0 ? (100 * inI) / (inP * inR) : 0;
  const calcR = inP * inT > 0 ? (100 * inI) / (inP * inT) : 0;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! I = PTR/100 बाट P, T र R का ३ ओटा रूपान्तरित सूत्रहरू बन्छन्। कुनै पनि अज्ञात मान पत्ता लगाऔं!',
        'Hello! From I = PTR/100, we derive 3 transformed formulas for P, T, and R. Let us solve any unknown value!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('unknown_solver')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'unknown_solver' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            {L('१. अज्ञात मान सूत्र चक्र (Formula & Unknown Solver)', '1. Unknown Variable Solver')}
          </button>
          <button
            onClick={() => setActiveTab('time_converter')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'time_converter' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            {L('२. समय रूपान्तरण (वर्ष र महिना)', '2. Time Unit Converter')}
          </button>
          <button
            onClick={() => setActiveTab('textbook_cases')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'textbook_cases' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            {L('३. CDC पाठ्यपुस्तक उदाहरणहरू', '3. CDC Textbook Cases')}
          </button>
        </div>

        {/* Tab 1: Unknown Variable Solver */}
        {activeTab === 'unknown_solver' && (
          <div className="space-y-6">
            {/* Target Selector */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                {L('कुन अज्ञात मान पत्ता लगाउने? (Select variable to find):', 'Select variable to solve for:')}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setUnknownTarget('I')}
                  className={`p-3 rounded-2xl font-black text-sm border transition flex flex-col items-center gap-1 ${
                    unknownTarget === 'I'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                      : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span>{L('ब्याज (I) पत्ता लगाउने', 'Find Interest (I)')}</span>
                  <span className="text-xs font-mono font-normal">I = (P·T·R)/100</span>
                </button>

                <button
                  onClick={() => setUnknownTarget('P')}
                  className={`p-3 rounded-2xl font-black text-sm border transition flex flex-col items-center gap-1 ${
                    unknownTarget === 'P'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <span>{L('सावाँ (P) पत्ता लगाउने', 'Find Principal (P)')}</span>
                  <span className="text-xs font-mono font-normal">P = (100·I)/(T·R)</span>
                </button>

                <button
                  onClick={() => setUnknownTarget('T')}
                  className={`p-3 rounded-2xl font-black text-sm border transition flex flex-col items-center gap-1 ${
                    unknownTarget === 'T'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  <span>{L('समय (T) पत्ता लगाउने', 'Find Time (T)')}</span>
                  <span className="text-xs font-mono font-normal">T = (100·I)/(P·R)</span>
                </button>

                <button
                  onClick={() => setUnknownTarget('R')}
                  className={`p-3 rounded-2xl font-black text-sm border transition flex flex-col items-center gap-1 ${
                    unknownTarget === 'R'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span>{L('दर (R) पत्ता लगाउने', 'Find Rate (R)')}</span>
                  <span className="text-xs font-mono font-normal">R = (100·I)/(P·T)</span>
                </button>
              </div>
            </div>

            {/* Inputs & Calculation Result */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {unknownTarget !== 'P' && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">{L('सावाँ (Principal P):', 'Principal (P):')}</label>
                    <input
                      type="number"
                      value={inP}
                      onChange={(e) => setInP(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-blue-400"
                    />
                  </div>
                )}

                {unknownTarget !== 'T' && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">{L('समय (Time T in years):', 'Time (T in years):')}</label>
                    <input
                      type="number"
                      value={inT}
                      onChange={(e) => setInT(Math.max(0.1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-purple-400"
                    />
                  </div>
                )}

                {unknownTarget !== 'R' && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">{L('ब्याजदर (Rate R %):', 'Rate (R %):')}</label>
                    <input
                      type="number"
                      value={inR}
                      onChange={(e) => setInR(Math.max(0.1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-emerald-400"
                    />
                  </div>
                )}

                {unknownTarget !== 'I' && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">{L('ब्याज (Interest I):', 'Interest (I):')}</label>
                    <input
                      type="number"
                      value={inI}
                      onChange={(e) => setInI(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* Result Showcase */}
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">{L('निकाल्नुपर्ने मान (Calculated Target):', 'Calculated Target:')}</div>
                  <div className="text-3xl font-black text-amber-400 mt-1">
                    {unknownTarget === 'I' && `I = रु. ${toNp(calcI.toFixed(2))}`}
                    {unknownTarget === 'P' && `P = रु. ${toNp(calcP.toFixed(2))}`}
                    {unknownTarget === 'T' && `T = ${toNp(calcT.toFixed(2))} ${L('वर्ष (years)', 'years')}`}
                    {unknownTarget === 'R' && `R = ${toNp(calcR.toFixed(2))}%`}
                  </div>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-xl text-xs font-mono text-slate-300 space-y-1">
                  <div className="text-amber-300 font-bold">{L('प्रयोग गरिएको सूत्र:', 'Formula Used:')}</div>
                  {unknownTarget === 'I' && <div>I = (P × T × R) ÷ 100 = ({toNp(inP)} × {toNp(inT)} × {toNp(inR)}) ÷ १००</div>}
                  {unknownTarget === 'P' && <div>P = (100 × I) ÷ (T × R) = (१०० × {toNp(inI)}) ÷ ({toNp(inT)} × {toNp(inR)})</div>}
                  {unknownTarget === 'T' && <div>T = (100 × I) ÷ (P × R) = (१०० × {toNp(inI)}) ÷ ({toNp(inP)} × {toNp(inR)})</div>}
                  {unknownTarget === 'R' && <div>R = (100 × I) ÷ (P × T) = (१०० × {toNp(inI)}) ÷ ({toNp(inP)} × {toNp(inT)})</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Time Unit Converter */}
        {activeTab === 'time_converter' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('महिनालाई वर्षमा रूपान्तरण गर्ने तरिका (Converting Months to Years)', 'Converting Months to Fractional Years')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'साधारण ब्याज सूत्र I = PTR/100 मा समय T सधैं वर्ष (Years) मा हुनुपर्छ। त्यसैले महिनालाई १२ ले भाग गरिन्छ।',
                    'In simple interest formula, Time T must always be in years. Months must be divided by 12.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">{L('वर्ष संख्या (Years):', 'Years:')}</label>
                    <input
                      type="number"
                      value={convYears}
                      onChange={(e) => setConvYears(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">{L('थप महिना (Additional Months):', 'Months:')}</label>
                    <input
                      type="number"
                      value={convMonths}
                      onChange={(e) => setConvMonths(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 text-center space-y-2">
                  <div className="text-xs font-bold uppercase text-indigo-900">{L('रूपान्तरित समय (T in Years)', 'Converted T in Years')}</div>
                  <div className="text-3xl font-black text-indigo-700">
                    {toNp(totalConvertedYears.toFixed(2))} {L('वर्ष', 'years')}
                  </div>
                  <div className="text-xs text-slate-600">
                    T = {toNp(convYears)} + ({toNp(convMonths)} ÷ १२) = {toNp(convYears)} + {toNp((convMonths / 12).toFixed(2))} = <b>{toNp(totalConvertedYears.toFixed(2))}</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Textbook Cases */}
        {activeTab === 'textbook_cases' && (
          <div className="space-y-4">
            <div
              onClick={() => {
                setUnknownTarget('I');
                setInP(20000);
                setInT(2);
                setInR(10);
                setActiveTab('unknown_solver');
              }}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition space-y-1"
            >
              <div className="font-bold text-slate-800 text-sm">
                {L('सोमायाको बचत (Somaya CDC Example 1)', 'Somaya CDC Example 1')}
              </div>
              <p className="text-xs text-slate-600">
                P = रु. २०,०००, R = १०%, T = २ वर्ष ⇒ I = रु. ४,०००।
              </p>
            </div>

            <div
              onClick={() => {
                setUnknownTarget('I');
                setInP(5000);
                setInT(3.5);
                setInR(10);
                setActiveTab('unknown_solver');
              }}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition space-y-1"
            >
              <div className="font-bold text-slate-800 text-sm">
                {L('सान्तेमानको ब्याज (Santaman CDC Example 2)', 'Santaman CDC Example 2')}
              </div>
              <p className="text-xs text-slate-600">
                P = रु. ५,०००, R = १०%, T = ३ वर्ष ६ महिना (३.५ वर्ष) ⇒ I = रु. १,७५०।
              </p>
            </div>

            <div
              onClick={() => {
                setUnknownTarget('P');
                setInI(2400);
                setInT(3);
                setInR(10);
                setActiveTab('unknown_solver');
              }}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition space-y-1"
            >
              <div className="font-bold text-slate-800 text-sm">
                {L('सावाँ पत्ता लगाउने (Finding Principal P - CDC Example 3)', 'Finding Principal P - CDC Example 3')}
              </div>
              <p className="text-xs text-slate-600">
                I = रु. २,४००, T = ३ वर्ष, R = १०% ⇒ P = रु. ८,०००।
              </p>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default SimpleInterestFormulaUnknownLab;
