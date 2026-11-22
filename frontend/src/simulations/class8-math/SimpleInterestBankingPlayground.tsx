/**
 * SimpleInterestBankingPlayground.tsx
 * Grade 8 Mathematics – Unit 7: SIMPLE INTEREST (साधारण ब्याज)
 * Simulation 1: Simple Interest Banking Playground (साधारण ब्याज र बैंकिङ खेलमैदान)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 7)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Landmark, PiggyBank, Calendar, Percent, TrendingUp, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'साधारण ब्याज (Simple Interest - I) पत्ता लगाउने सही सूत्र कुन हो?',
    en: 'What is the correct formula to calculate Simple Interest (I)?',
    options: [
      { key: 'A', label: 'I = (P × T × R) / 100' },
      { key: 'B', label: 'I = P + T + R' },
      { key: 'C', label: 'I = (P × R) / T' },
      { key: 'D', label: 'I = 100 / (P × T × R)' },
    ],
    answer: 'A',
  },
  {
    np: 'ब्याजदर ८% प्रतिवर्ष भन्नाले के बुझिन्छ?',
    en: 'What does an interest rate of 8% per annum mean?',
    options: [
      { key: 'A', label: 'रु. १०० को १ वर्षको ब्याज रु. ८ (Rs. 8 on Rs. 100 for 1 year)' },
      { key: 'B', label: 'रु. १००० को १ वर्षको ब्याज रु. ८' },
      { key: 'C', label: 'रु. १०० को १ महिनाको ब्याज रु. ८' },
      { key: 'D', label: 'रु. ८ को १ वर्षको ब्याज रु. १००' },
    ],
    answer: 'A',
  },
  {
    np: 'भूमिकाले रु. ५,००० बैंकमा २ वर्ष राख्दा बैंकले रु. ५,८०० फिर्ता दियो भने ब्याज रकम (I) कति हो?',
    en: 'Bhumika deposited Rs. 5,000 for 2 years and received Rs. 5,800. What is the interest amount (I)?',
    options: [
      { key: 'A', label: 'रु. ८०० [ I = A - P = ५८०० - ५००० = ८०० ]' },
      { key: 'B', label: 'रु. ५,८००' },
      { key: 'C', label: 'रु. ४००' },
      { key: 'D', label: 'रु. १,०००' },
    ],
    answer: 'A',
  },
  {
    np: 'सावाँ (P) रु. १०,००० को १०% का दरले ३ वर्षको साधारण ब्याज कति हुन्छ?',
    en: 'What is the simple interest on a principal of Rs. 10,000 at 10% per annum for 3 years?',
    options: [
      { key: 'A', label: 'रु. ३,००० [ (१०००० × ३ × १०) ÷ १०० = ३००० ]' },
      { key: 'B', label: 'रु. ३,५००' },
      { key: 'C', label: 'रु. २,५००' },
      { key: 'D', label: 'रु. १,०००' },
    ],
    answer: 'A',
  },
  {
    np: 'मिश्रधन (Amount - A) को सूत्र कुन हो?',
    en: 'Which is the correct formula for Amount (A)?',
    options: [
      { key: 'A', label: 'A = P + I (सावाँ + ब्याज)' },
      { key: 'B', label: 'A = P - I' },
      { key: 'C', label: 'A = P × I' },
      { key: 'D', label: 'A = I / P' },
    ],
    answer: 'A',
  },
];

const PRESETS = [
  { nameNp: 'भूमिकाको मुद्दती बचत (Bhumika Example)', nameEn: 'Bhumika Deposit', p: 5000, t: 2, r: 8 },
  { nameNp: 'किसान कृषि ऋण (Agriculture Loan)', nameEn: 'Agri Loan', p: 25000, t: 3, r: 10 },
  { nameNp: 'छात्रवृत्ति कोष (Scholarship Fund)', nameEn: 'Scholarship Fund', p: 50000, t: 5, r: 12 },
  { nameNp: 'लघुवित्त बचत (Microfinance Savings)', nameEn: 'Micro Savings', p: 10000, t: 1, r: 6 },
];

export const SimpleInterestBankingPlayground: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U7-01',
    chapter: 7,
    titleNp: 'साधारण ब्याज र बैंकिङ खेलमैदान (Simple Interest Banking Playground)',
    titleEn: 'Simple Interest Banking Playground',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'bank_vault' | 'rate_meaning' | 'linear_timeline' | 'presets'>('bank_vault');

  // Core values
  const [p, setP] = useState<number>(5000);
  const [t, setT] = useState<number>(2);
  const [r, setR] = useState<number>(8);

  const interest = (p * t * r) / 100;
  const amount = p + interest;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! बैंकमा पैसा जम्मा गर्दा वा ऋण लिँदा साधारण ब्याज कसरी हिसाब गरिन्छ? आउनुहोस्, सावाँ, समय, दर र मिश्रधन बुझौं!',
        'Hello! How is simple interest calculated when depositing or borrowing money? Let us master Principal, Time, Rate, and Amount!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('bank_vault')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'bank_vault' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Landmark className="w-4 h-4" />
            {L('१. बैंकिङ भल्ट र ब्याज (Banking Vault & Interest)', '1. Banking Vault & Interest')}
          </button>
          <button
            onClick={() => setActiveTab('rate_meaning')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'rate_meaning' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Percent className="w-4 h-4" />
            {L('२. ब्याजदरको वास्तविक अर्थ (Rate % Meaning)', '2. Meaning of Rate %')}
          </button>
          <button
            onClick={() => setActiveTab('linear_timeline')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'linear_timeline' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {L('३. वार्षिक वृद्धि टाइमलाइन (Linear Timeline)', '3. Growth Timeline')}
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'presets' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            {L('४. पाठ्यपुस्तक परिदृश्य (CDC Scenarios)', '4. CDC Scenarios')}
          </button>
        </div>

        {/* Tab 1: Bank Vault & Interactive Calculator */}
        {activeTab === 'bank_vault' && (
          <div className="space-y-6">
            {/* Visual Bank Summary Cards */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {L('नेपाल राष्ट्र बैंक वित्तीय साक्षरता मोडेल', 'Nepal Financial Literacy Model')}
                </span>
                <h3 className="text-2xl font-black text-amber-400 mt-1">
                  {L('साधारण ब्याज भल्ट (Simple Interest Vault)', 'Simple Interest Vault')}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Principal */}
                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 text-center">
                  <div className="text-xs text-slate-400 font-bold uppercase">{L('सावाँ (Principal - P)', 'Principal (P)')}</div>
                  <div className="text-3xl font-black text-blue-400 my-2">रु. {toNp(p.toLocaleString())}</div>
                  <div className="text-xs text-slate-500">{L('सुरुमा जम्मा गरिएको रकम', 'Initial deposited money')}</div>
                </div>

                {/* Interest */}
                <div className="bg-slate-800/90 p-5 rounded-2xl border border-amber-600/60 text-center">
                  <div className="text-xs text-amber-400 font-bold uppercase">{L('साधारण ब्याज (Interest - I)', 'Interest (I)')}</div>
                  <div className="text-3xl font-black text-amber-300 my-2">रु. {toNp(interest.toLocaleString())}</div>
                  <div className="text-xs text-amber-400/80">
                    I = (P × T × R) ÷ 100 = ({toNp(p)} × {toNp(t)} × {toNp(r)}) ÷ १००
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-emerald-950/80 p-5 rounded-2xl border border-emerald-500 text-center">
                  <div className="text-xs text-emerald-400 font-bold uppercase">{L('मिश्रधन (Amount - A)', 'Amount (A = P + I)')}</div>
                  <div className="text-3xl font-black text-emerald-300 my-2">रु. {toNp(amount.toLocaleString())}</div>
                  <div className="text-xs text-emerald-400/80">{toNp(p.toLocaleString())} + {toNp(interest.toLocaleString())}</div>
                </div>
              </div>

              {/* Formula details */}
              <div className="bg-slate-800 p-4 rounded-2xl text-xs font-mono space-y-1 text-slate-300">
                <div className="text-amber-400 font-bold">{L('गणितीय कार्यविधि (CDC Method):', 'Mathematical Formula:')}</div>
                <div>१. ब्याज (I) = P × T × R ÷ १०० = {toNp(p)} × {toNp(t)} × {toNp(r)} ÷ १०० = रु. {toNp(interest)}</div>
                <div>२. मिश्रधन (A) = P + I = {toNp(p)} + {toNp(interest)} = रु. {toNp(amount)}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  {L('सावाँ (Principal P):', 'Principal (P):')} <span className="text-indigo-600 text-base">रु. {toNp(p)}</span>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={p}
                  onChange={(e) => setP(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  {L('समय (Time T in years):', 'Time (T in years):')} <span className="text-indigo-600 text-base">{toNp(t)} {L('वर्ष', 'years')}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={t}
                  onChange={(e) => setT(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  {L('ब्याजदर (Rate R % p.a.):', 'Rate (R % p.a.):')} <span className="text-indigo-600 text-base">{toNp(r)}%</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={r}
                  onChange={(e) => setR(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rate Meaning */}
        {activeTab === 'rate_meaning' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('ब्याजदर R% को वास्तविक अर्थ के हो?', 'What does Interest Rate R% actually mean?')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'पाठ्यपुस्तक स्पष्टीकरण: ब्याजदर ८% प्रतिवर्ष भन्नाले रु. १०० को १ वर्षमा आउने ब्याज रु. ८ हो।',
                    'CDC Textbook concept: 8% per annum means Rs. 100 earns Rs. 8 interest in 1 year.'
                  )}
                </p>
              </div>

              {/* Visual 100 blocks metaphor */}
              <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-200 space-y-4">
                <div className="text-sm font-bold text-amber-950">
                  {L(`रु. १०० सावाँ मा ${toNp(r)}% दरले वार्षिक ब्याज प्रदर्शन:`, `Visualization of ${r}% on Rs. 100 base:`)}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-amber-300 text-center shadow-sm">
                    <div className="text-xs text-slate-500 font-bold uppercase">{L('सावाँ (Base)', 'Base Money')}</div>
                    <div className="text-2xl font-black text-blue-600 my-1">रु. १००</div>
                    <div className="text-[11px] text-slate-400">{L('१ वर्षको लागि', 'For 1 year')}</div>
                  </div>

                  <ArrowRight className="w-6 h-6 text-amber-600 hidden md:block" />

                  <div className="p-4 bg-white rounded-2xl border border-emerald-300 text-center shadow-sm">
                    <div className="text-xs text-emerald-700 font-bold uppercase">{L('१ वर्षको ब्याज (Interest)', 'Annual Interest')}</div>
                    <div className="text-2xl font-black text-emerald-600 my-1">रु. {toNp(r)}</div>
                    <div className="text-[11px] text-emerald-500 font-semibold">{toNp(r)}% {L('दर अनुसार', 'at this rate')}</div>
                  </div>

                  <ArrowRight className="w-6 h-6 text-amber-600 hidden md:block" />

                  <div className="p-4 bg-white rounded-2xl border border-indigo-300 text-center shadow-sm">
                    <div className="text-xs text-indigo-700 font-bold uppercase">{L('१ वर्षपछिको मिश्रधन', '1-Yr Amount')}</div>
                    <div className="text-2xl font-black text-indigo-700 my-1">रु. {toNp(100 + r)}</div>
                    <div className="text-[11px] text-slate-400">१०० + {toNp(r)}</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs text-slate-700 space-y-1">
                  <div>• रु. १०० को १ वर्षको ब्याज = रु. {toNp(r)}</div>
                  <div>• रु. १ को १ वर्षको ब्याज = रु. {toNp(r)} / १००</div>
                  <div>• रु. P को १ वर्षको ब्याज = रु. (P × {toNp(r)}) / १००</div>
                  <div className="font-bold text-indigo-900">• रु. P को T वर्षको ब्याज = रु. (P × T × R) / १००</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Linear Growth Timeline */}
        {activeTab === 'linear_timeline' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('वर्षेनी ब्याजको रैखिक वृद्धि (Linear Growth Timeline)', 'Annual Linear Growth Timeline')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'साधारण ब्याजमा प्रत्येक वर्ष सुरुको सावाँमा मात्र ब्याज लाग्छ, त्यसैले ब्याज प्रत्येक वर्ष समान रकमले बढ्छ।',
                    'In simple interest, interest is calculated strictly on initial principal each year, growing uniformly.'
                  )}
                </p>
              </div>

              {/* Year by Year Progression Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="p-3">{L('वर्ष (Year)', 'Year (T)')}</th>
                      <th className="p-3">{L('सावाँ (Principal P)', 'Principal (P)')}</th>
                      <th className="p-3">{L('त्यस वर्षको ब्याज (Yearly Interest)', 'Yearly Interest')}</th>
                      <th className="p-3">{L('जम्मा ब्याज (Total Interest I)', 'Total Interest (I)')}</th>
                      <th className="p-3 text-right">{L('मिश्रधन (Total Amount A)', 'Total Amount (A)')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[1, 2, 3, 4, 5].map((yr) => {
                      const curInt = (p * yr * r) / 100;
                      const curAmt = p + curInt;
                      const yrInt = (p * 1 * r) / 100;
                      return (
                        <tr key={yr} className={yr === t ? 'bg-indigo-50 font-bold text-indigo-900' : 'text-slate-700'}>
                          <td className="p-3">{toNp(yr)} {L('वर्ष', 'Year')}</td>
                          <td className="p-3">रु. {toNp(p.toLocaleString())}</td>
                          <td className="p-3 text-emerald-600">+रु. {toNp(yrInt.toLocaleString())}</td>
                          <td className="p-3 text-amber-600 font-bold">रु. {toNp(curInt.toLocaleString())}</td>
                          <td className="p-3 text-right font-black text-indigo-700">रु. {toNp(curAmt.toLocaleString())}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESETS.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setP(item.p);
                    setT(item.t);
                    setR(item.r);
                    setActiveTab('bank_vault');
                  }}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition space-y-2"
                >
                  <div className="font-bold text-slate-800 text-sm">{isNe ? item.nameNp : item.nameEn}</div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>P: रु. {toNp(item.p.toLocaleString())}</span>
                    <span>T: {toNp(item.t)} {L('वर्ष', 'yrs')}</span>
                    <span>R: {toNp(item.r)}%</span>
                  </div>
                  <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                    {L('यो परिदृश्य लोड गर्नुहोस्', 'Load this scenario')} <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default SimpleInterestBankingPlayground;
