/**
 * DirectVariationDiscoveryLab.tsx
 * Grade 8 Mathematics – Unit 6: UNITARY METHOD
 * Simulation 1: Direct Variation Discovery Lab
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 6)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { TrendingUp, Layers, Compass, CheckCircle, RefreshCw, Calculator, ShoppingBag, Users, Clock } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'प्रत्यक्ष विचरण (Direct Variation) मा दुई चलराशि x र y बीचको सम्बन्ध कस्तो हुन्छ?',
    en: 'In direct variation, what is the mathematical relation between two variables x and y?',
    options: [
      { key: 'A', label: 'y / x = k' },
      { key: 'B', label: 'x × y = k' },
      { key: 'C', label: 'x + y = k' },
      { key: 'D', label: 'x - y = k' },
    ],
    answer: 'A',
  },
  {
    np: '10 केजी स्याउको मूल्य Rs. 950 पर्छ भने 3 केजी स्याउको मूल्य कति पर्ला?',
    en: 'If 10 kg of apples cost Rs. 950, what will 3 kg of apples cost?',
    options: [
      { key: 'A', label: 'Rs. 285 [ 1 kg = 95 ⇒ 3 kg = 285 ]' },
      { key: 'B', label: 'Rs. 300' },
      { key: 'C', label: 'Rs. 270' },
      { key: 'D', label: 'Rs. 315' },
    ],
    answer: 'A',
  },
  {
    np: '10 जना कामदारले 20 दिनमा Rs. 1,60,000 ज्याला पाउँछन् भने 1 people 1 दिनमा कति पाउँछन्?',
    en: 'If 10 workers earn Rs. 1,60,000 in 20 days, how much does 1 worker earn in 1 day?',
    options: [
      { key: 'A', label: 'Rs. 800 [ 1,60,000 ÷ (10 × 20) = 800 ]' },
      { key: 'B', label: 'Rs. 600' },
      { key: 'C', label: 'Rs. 1,000' },
      { key: 'D', label: 'Rs. 750' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा गाडी 50 किमी/घण्टाको समान गतिमा गुड्दा 3.5 घण्टामा कति दूरी पार गर्छ?',
    en: 'A vehicle travelling at a constant speed of 50 km/h covers what distance in 3.5 hours?',
    options: [
      { key: 'A', label: '175 km [ 50 × 3.5 = 175 km ]' },
      { key: 'B', label: '150 km' },
      { key: 'C', label: '200 km' },
      { key: 'D', label: '165 km' },
    ],
    answer: 'A',
  },
  {
    np: '30 जना मानिसले 20 दिनमा 600 m पर्खाल बनाउन सक्छन् भने 15 people 18 दिनमा कति m बनाउलान्?',
    en: 'If 30 people build a 600 m wall in 20 days, how many meters can 15 people build in 18 days?',
    options: [
      { key: 'A', label: '270 m [ rate = 1 m/person-day ⇒ 15 × 18 = 270 ]' },
      { key: 'B', label: '300 m' },
      { key: 'C', label: '250 m' },
      { key: 'D', label: '240 m' },
    ],
    answer: 'A',
  },
];

const PRESET_SCENARIOS = [
  { nameNp: 'कलम खरिद (Pencils)', nameEn: 'Pencils', unitNameNp: 'कलम संख्या', unitNameEn: 'Pencils', rate: 15, baseQty: 1 },
  { nameNp: 'स्याउको तौल (Apples)', nameEn: 'Apples', unitNameNp: 'केजी (kg)', unitNameEn: 'kg', rate: 95, baseQty: 10 },
  { nameNp: 'बस यात्रा दूरी (Bus Travel)', nameEn: 'Bus Distance', unitNameNp: 'घण्टा (Hours)', unitNameEn: 'Hours', rate: 50, baseQty: 1 },
  { nameNp: 'पेट्रोल खरिद (Petrol)', nameEn: 'Petrol', unitNameNp: 'litres (Liters)', unitNameEn: 'Liters', rate: 175, baseQty: 5 },
];

export const DirectVariationDiscoveryLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U6-01',
    chapter: 6,
    titleNp: 'प्रत्यक्ष विचरण अन्वेषण प्रयोगशाला (Direct Variation Discovery Lab)',
    titleEn: 'Direct Variation Discovery Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'ratio' | 'single_unitary' | 'compound' | 'challenge'>('ratio');

  // Tab 1 state
  const [selectedPreset, setSelectedPreset] = useState(PRESET_SCENARIOS[0]);
  const [quantity, setQuantity] = useState<number>(4);
  const totalCost = quantity * selectedPreset.rate;
  const constantK = selectedPreset.rate;

  // Tab 2: Single Unitary Solver
  const [givenQty1, setGivenQty1] = useState<number>(10);
  const [givenVal1, setGivenVal1] = useState<number>(950);
  const [targetQty2, setTargetQty2] = useState<number>(3);
  const unitRate = givenQty1 > 0 ? givenVal1 / givenQty1 : 0;
  const targetVal2 = unitRate * targetQty2;

  // Tab 3: Compound Multi-Variable Direct Variation
  const [workers1, setWorkers1] = useState<number>(10);
  const [days1, setDays1] = useState<number>(20);
  const [earning1, setEarning1] = useState<number>(160000);
  const [workers2, setWorkers2] = useState<number>(15);
  const [days2, setDays2] = useState<number>(10);

  const ratePerPersonDay = (workers1 * days1 > 0) ? earning1 / (workers1 * days1) : 0;
  const targetEarning2 = ratePerPersonDay * workers2 * days2;

  // Tab 4: CDC Challenge state
  const [userChallengeAns, setUserChallengeAns] = useState<string>('');
  const [challengeStep, setChallengeStep] = useState<number>(0);
  const [challengeResult, setChallengeResult] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  const CHALLENGE_ITEMS = [
    {
      qNp: 'एउटा कारले 3 घण्टामा 150 km पार गर्छ भने 5 घण्टामा कति किमी पार गर्छ?',
      qEn: 'If a car travels 150 km in 3 hours, how many km will it travel in 5 hours at uniform speed?',
      ans: 250,
      unit: 'km',
      stepsNp: '1 घण्टामा पार गर्ने दूरी = 150 ÷ 3 = 50 किमी। 5 घण्टामा = 50 × 5 = 250 किमी।',
      stepsEn: 'Distance in 1 hour = 150 ÷ 3 = 50 km. In 5 hours = 50 × 5 = 250 km.',
    },
    {
      qNp: '12 ओटा कापीको मूल्य Rs. 540 पर्छ भने 7 ओटा कापीको मूल्य कति पर्ला?',
      qEn: 'If 12 notebooks cost Rs. 540, what will be the cost of 7 notebooks?',
      ans: 315,
      unit: 'Rs. (Rs.)',
      stepsNp: '1 कापीको मूल्य = 540 ÷ 12 = Rs. 45। 7 कापीको मूल्य = 45 × 7 = Rs. 315।',
      stepsEn: 'Cost of 1 notebook = 540 ÷ 12 = Rs. 45. Cost of 7 notebooks = 45 × 7 = Rs. 315.',
    },
  ];

  const handleCheckChallenge = () => {
    const cur = CHALLENGE_ITEMS[challengeStep];
    const val = parseFloat(userChallengeAns);
    if (Math.abs(val - cur.ans) < 0.1) {
      kit.good();
      setChallengeResult({
        isCorrect: true,
        msg: L(`उत्कृष्ट! सही उत्तर: ${toNp(cur.ans)} ${cur.unit}`, `Brilliant! Correct answer: ${cur.ans} ${cur.unit}`),
      });
    } else {
      kit.oops();
      setChallengeResult({
        isCorrect: false,
        msg: L(`पुनः प्रयास गर्नुहोस्! ${cur.stepsNp}`, `Try again! Hint: ${cur.stepsEn}`),
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
        'नमस्ते! प्रत्यक्ष विचरणमा परिमाण बढ्दा मूल्य पनि त्यही अनुपातमा बढ्छ। आउनुहोस्, एकाइ विधिको रहस्य बुझौं!',
        'Hello! In direct variation, as quantity increases, total value increases proportionally. Let us master the unitary method!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('ratio')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'ratio' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            {L('1. विचरण अवधारणा र अचर k (Concept & Constant k)', '1. Direct Variation & Constant k')}
          </button>
          <button
            onClick={() => setActiveTab('single_unitary')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'single_unitary' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            {L('2. एक-चर एकाइ विधि (Single Unitary Method)', '2. Single Unitary Solver')}
          </button>
          <button
            onClick={() => setActiveTab('compound')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'compound' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            {L('3. मिश्रित विचरण (Compound Direct Variation)', '3. Compound Direct Variation')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'challenge' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {L('4. पाठ्यपुस्तक अभ्यास (CDC Practice)', '4. CDC Challenge')}
          </button>
        </div>

        {/* Tab 1: Ratio & Constant k */}
        {activeTab === 'ratio' && (
          <div className="space-y-6">
            {/* Presets */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">{L('पाठ्यपुस्तक सन्दर्भ उदाहरणहरू:', 'Textbook Presets:')}</span>
              {PRESET_SCENARIOS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPreset(p);
                    setQuantity(p.baseQty);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    selectedPreset.nameEn === p.nameEn
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  {isNe ? p.nameNp : p.nameEn}
                </button>
              ))}
            </div>

            {/* Visual Proportionality Card */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-amber-400">
                    {isNe ? selectedPreset.nameNp : selectedPreset.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {L('परिमाण (x) र जम्मा मूल्य/दूरी (y) बीच प्रत्यक्ष विचरण: y ∝ x', 'Direct variation: y ∝ x')}
                  </p>
                </div>
                <div className="px-4 py-2 bg-slate-800 rounded-2xl border border-indigo-500/50 text-center">
                  <div className="text-xs text-slate-400 font-bold uppercase">{L('अनुपात अचर (Constant k)', 'Constant Ratio k')}</div>
                  <div className="text-xl font-black text-emerald-400">k = y/x = {toNp(constantK)}</div>
                </div>
              </div>

              {/* Live Interactive Visualization Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300">
                      {L('परिमाण (Quantity x):', 'Quantity (x):')} {toNp(quantity)} {isNe ? selectedPreset.unitNameNp : selectedPreset.unitNameEn}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full mt-2 accent-indigo-500"
                    />
                  </div>

                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{L('1 एकाइको दर (Unit Rate):', 'Unit Rate (k):')}</span>
                      <span className="font-bold text-white">Rs. {toNp(constantK)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{L('जम्मा परिमाण (Quantity x):', 'Quantity (x):')}</span>
                      <span className="font-bold text-white">{toNp(quantity)}</span>
                    </div>
                    <div className="flex justify-between text-base border-t border-slate-700 pt-2 font-black">
                      <span className="text-amber-400">{L('जम्मा मूल्य (Total y = k · x):', 'Total Value (y = k · x):')}</span>
                      <span className="text-emerald-400">Rs. {toNp(totalCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Comparative Ratio Table */}
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                  <div className="text-xs font-bold text-amber-300 mb-3 uppercase tracking-wider">
                    {L('पाठ्यपुस्तक तालिका: अनुपात सधैं समान (y/x = Constant)', 'CDC Ratio Table: y/x = Constant')}
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="py-2">{L('परिमाण (x)', 'Qty (x)')}</th>
                        <th className="py-2">{L('मूल्य (y)', 'Cost (y)')}</th>
                        <th className="py-2 text-right">{L('अनुपात (y/x)', 'Ratio (y/x)')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {[1, 2, 4, 8, quantity].map((q, idx) => (
                        <tr key={idx} className={q === quantity ? 'bg-indigo-900/40 font-bold text-indigo-300' : 'text-slate-300'}>
                          <td className="py-1.5">{toNp(q)}</td>
                          <td className="py-1.5">Rs. {toNp(q * constantK)}</td>
                          <td className="py-1.5 text-right font-mono text-emerald-400">
                            {toNp(q * constantK)} ÷ {toNp(q)} = <b>{toNp(constantK)}</b>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Single Unitary Method */}
        {activeTab === 'single_unitary' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('दुई-चर प्रत्यक्ष एकाइ विधि (Standard Unitary Method Solver)', 'Standard Unitary Method Solver')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {L('दिइएको परिमाणबाट 1 एकाइको मान निकाल्ने, अनि सोधिएको परिमाणको मान गुणन गर्ने।', 'Step 1: Divide to find 1 unit. Step 2: Multiply to find target quantity.')}
                </p>
              </div>

              {/* Input grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                  <span className="text-xs font-bold text-indigo-900 uppercase">{L('चरण 1: दिइएको अवस्था', 'Given State')}</span>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">{L('दिइएको परिमाण (Quantity 1):', 'Given Quantity 1:')}</label>
                    <input
                      type="number"
                      value={givenQty1}
                      onChange={(e) => setGivenQty1(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">{L('दिइएको मूल्य (Value 1):', 'Given Value 1:')}</label>
                    <input
                      type="number"
                      value={givenVal1}
                      onChange={(e) => setGivenVal1(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Intermediate Unit Calculation */}
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex flex-col justify-center items-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-800 text-lg">
                    1
                  </div>
                  <div className="text-xs font-bold uppercase text-amber-800">{L('1 एकाइको मान (Unit Value)', 'Unit Value')}</div>
                  <div className="text-2xl font-black text-amber-900">
                    Rs. {toNp(unitRate.toFixed(2))}
                  </div>
                  <div className="text-xs text-slate-600">
                    {toNp(givenVal1)} ÷ {toNp(givenQty1)} = {toNp(unitRate.toFixed(2))}
                  </div>
                </div>

                {/* Target Output */}
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                  <span className="text-xs font-bold text-emerald-900 uppercase">{L('चरण 2: सोधिएको अवस्था', 'Target State')}</span>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">{L('सोधिएको परिमाण (Target Quantity 2):', 'Target Quantity 2:')}</label>
                    <input
                      type="number"
                      value={targetQty2}
                      onChange={(e) => setTargetQty2(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold text-slate-800"
                    />
                  </div>
                  <div className="pt-2 border-t border-emerald-200">
                    <div className="text-xs text-slate-500">{L('अन्तिम मूल्य (Target Value):', 'Target Value:')}</div>
                    <div className="text-2xl font-black text-emerald-700">
                      Rs. {toNp(targetVal2.toFixed(2))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Procedural Explanation Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm space-y-2 text-slate-700">
                <div className="font-bold text-indigo-900">{L('पाठ्यपुस्तक कार्यविधि (Curriculum Procedure):', 'CDC Step Procedure:')}</div>
                <div>1. {toNp(givenQty1)} Price of the unit = Rs. {toNp(givenVal1)}</div>
                <div>2. 1 Price of the unit = Rs. {toNp(givenVal1)} ÷ {toNp(givenQty1)} = Rs. {toNp(unitRate.toFixed(2))}</div>
                <div>3. {toNp(targetQty2)} Price of the unit = Rs. {toNp(unitRate.toFixed(2))} × {toNp(targetQty2)} = <b className="text-emerald-700">Rs. {toNp(targetVal2.toFixed(2))}</b></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Compound Multi-Variable Direct Variation */}
        {activeTab === 'compound' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('मिश्रित प्रत्यक्ष एकाइ विधि (कामदार, दिन र ज्याला/काम)', 'Compound Unitary Method (Workers, Days & Earnings/Work)')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {L('CDC पाठ्यपुस्तक उदाहरण: 10 people 20 दिनमा Rs. 1,60,000 पाउँछन् भने 15 people 10 दिनमा कति पाउँछन्?', 'CDC Example: 10 workers earn Rs. 160,000 in 20 days. How much do 15 workers earn in 10 days?')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Case 1: Initial */}
                <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 space-y-4">
                  <div className="font-bold text-blue-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    {L('प्रारम्भिक अवस्था (Initial State)', 'Initial State')}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">{L('कामदार संख्या (Workers):', 'Workers:')}</label>
                      <input
                        type="number"
                        value={workers1}
                        onChange={(e) => setWorkers1(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">{L('दिन संख्या (Days):', 'Days:')}</label>
                      <input
                        type="number"
                        value={days1}
                        onChange={(e) => setDays1(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 border rounded-xl font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">{L('जम्मा ज्याला / काम (Total Earning / Work):', 'Total Earning / Work:')}</label>
                    <input
                      type="number"
                      value={earning1}
                      onChange={(e) => setEarning1(Math.max(100, Number(e.target.value)))}
                      className="w-full px-3 py-2 border rounded-xl font-bold text-indigo-700"
                    />
                  </div>
                </div>

                {/* Case 2: Target */}
                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-4">
                  <div className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    {L('नयाँ अवस्था (New Target State)', 'New Target State')}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">{L('नयाँ कामदार संख्या:', 'New Workers:')}</label>
                      <input
                        type="number"
                        value={workers2}
                        onChange={(e) => setWorkers2(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">{L('नयाँ दिन संख्या:', 'New Days:')}</label>
                      <input
                        type="number"
                        value={days2}
                        onChange={(e) => setDays2(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 border rounded-xl font-bold"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-300">
                    <div className="text-xs text-slate-500">{L('नयाँ जम्मा ज्याला (New Earning):', 'New Total Earning:')}</div>
                    <div className="text-2xl font-black text-emerald-700">Rs. {toNp(targetEarning2.toLocaleString())}</div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Derivation */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 font-mono text-xs">
                <div className="text-amber-400 font-bold uppercase">{L('एकाइ विधिको विस्तृत चरणहरू:', 'Detailed Step Breakdown:')}</div>
                <div>1. {toNp(workers1)} people {toNp(days1)} wage earned in a day = Rs. {toNp(earning1.toLocaleString())}</div>
                <div>2. 1 people {toNp(days1)} wage earned in a day = Rs. {toNp(earning1)} ÷ {toNp(workers1)} = Rs. {toNp((earning1 / workers1).toFixed(0))}</div>
                <div className="text-emerald-300">
                  3. Wage earned by 1 person in 1 day (unit rate) = Rs. {toNp(earning1)} ÷ ({toNp(workers1)} × {toNp(days1)}) = Rs. {toNp(ratePerPersonDay.toFixed(0))}
                </div>
                <div>4. {toNp(workers2)} people 1 wage earned in a day = Rs. {toNp(ratePerPersonDay)} × {toNp(workers2)} = Rs. {toNp((ratePerPersonDay * workers2).toFixed(0))}</div>
                <div className="text-amber-300 font-bold">
                  5. {toNp(workers2)} people {toNp(days2)} wage earned in a day = Rs. {toNp(ratePerPersonDay * workers2)} × {toNp(days2)} = Rs. {toNp(targetEarning2.toLocaleString())}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Challenge Practice */}
        {activeTab === 'challenge' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {L(`पाठ्यपुस्तक समस्या ${toNp(challengeStep + 1)} / ${toNp(CHALLENGE_ITEMS.length)}`, `CDC Problem ${challengeStep + 1} of ${CHALLENGE_ITEMS.length}`)}
                </h3>
                <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold">
                  {L('अभ्यास परीक्षण', 'Practice Lab')}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-200">
                {isNe ? CHALLENGE_ITEMS[challengeStep].qNp : CHALLENGE_ITEMS[challengeStep].qEn}
              </div>

              <div className="max-w-xs">
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {L('तपाईंको उत्तर:', 'Your Answer:')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={userChallengeAns}
                    onChange={(e) => setUserChallengeAns(e.target.value)}
                    placeholder={L('मान लेख्नुहोस्...', 'Enter value...')}
                    className="w-full px-4 py-2 border rounded-xl font-bold text-slate-800"
                  />
                  <span className="text-sm font-bold text-slate-500 whitespace-nowrap">{CHALLENGE_ITEMS[challengeStep].unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCheckChallenge}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> {L('उत्तर जाँच्नुहोस्', 'Check Answer')}
                </button>
                <button
                  onClick={() => {
                    setChallengeStep((prev) => (prev + 1) % CHALLENGE_ITEMS.length);
                    setUserChallengeAns('');
                    setChallengeResult(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> {L('अर्को प्रश्न', 'Next Problem')}
                </button>
              </div>

              {challengeResult && (
                <div
                  className={`p-4 rounded-2xl text-sm font-semibold ${
                    challengeResult.isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {challengeResult.msg}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default DirectVariationDiscoveryLab;
