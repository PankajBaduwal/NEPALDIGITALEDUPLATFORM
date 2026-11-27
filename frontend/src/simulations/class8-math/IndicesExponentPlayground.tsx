/**
 * IndicesExponentPlayground.tsx
 * Grade 8 Mathematics – Unit 9: INDICES (घाताङ्क)
 * Simulation 1: Indices Discovery and Exponent Playground (घाताङ्क खोजी र गुणन खेलमैदान)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 9)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Zap, Activity, BarChart2, Award, CheckCircle, RefreshCw, Layers } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'घाताङ्कीय रूप ५⁴ मा आधार (Base) र घाताङ्क (Index) क्रमशः के के हुन्?',
    en: 'In the index form 5⁴, what are the base and index respectively?',
    options: [
      { key: 'A', label: 'आधार = ५, घाताङ्क = ४ (Base = 5, Index = 4)' },
      { key: 'B', label: 'आधार = ४, घाताङ्क = ५' },
      { key: 'C', label: 'आधार = २०, घाताङ्क = १' },
      { key: 'D', label: 'आधार = ९, घाताङ्क = ५' },
    ],
    answer: 'A',
  },
  {
    np: 'पाठ्यपुस्तकको ब्याक्टेरिया वृद्धि उदाहरण अनुसार प्रत्येक २० मिनेटमा दोब्बर हुँदा १२० मिनेट (२ घण्टा) मा १ ब्याक्टेरिया कति पुग्छ?',
    en: 'According to the CDC bacteria doubling example, how many bacteria will 1 become in 120 minutes (doubling every 20 mins)?',
    options: [
      { key: 'A', label: '६४ ओटा (२⁶ = ६४)' },
      { key: 'B', label: '३२ ओटा' },
      { key: 'C', label: '१२८ ओटा' },
      { key: 'D', label: '४८ ओटा' },
    ],
    answer: 'A',
  },
  {
    np: '२⁵ र ५² मध्ये कुनको मान ठूलो हुन्छ?',
    en: 'Which has a greater value: 2⁵ or 5²?',
    options: [
      { key: 'A', label: '२⁵ ठूलो हुन्छ [ २⁵ = ३२, ५² = २५ ]' },
      { key: 'B', label: '५² ठूलो हुन्छ' },
      { key: 'C', label: 'दुवै बराबर हुन्' },
      { key: 'D', label: 'भन्न सकिँदैन' },
    ],
    answer: 'A',
  },
  {
    np: '३ × ३ × ३ × ३ × ३ लाई घाताङ्कीय सङ्केतमा कसरी लेखिन्छ?',
    en: 'How is 3 × 3 × 3 × 3 × 3 written in index form?',
    options: [
      { key: 'A', label: '३⁵ (3 to the power 5)' },
      { key: 'B', label: '५³' },
      { key: 'C', label: '१५' },
      { key: 'D', label: '३ × ५' },
    ],
    answer: 'A',
  },
  {
    np: '१०⁴ को मान कति हुन्छ?',
    en: 'What is the numerical value of 10⁴?',
    options: [
      { key: 'A', label: '१०,००० (1 followed by 4 zeros)' },
      { key: 'B', label: '४०' },
      { key: 'C', label: '१,०००' },
      { key: 'D', label: '१,००,०००' },
    ],
    answer: 'A',
  },
];

const BACTERIA_DATA = [
  { timeMins: 0, timeNp: 'सुरुमा (0 मिनेट)', count: 1, power: '२⁰ = १' },
  { timeMins: 20, timeNp: '२० मिनेट', count: 2, power: '२¹ = २' },
  { timeMins: 40, timeNp: '४० मिनेट', count: 4, power: '२² = ४' },
  { timeMins: 60, timeNp: '६० मिनेट (१ घण्टा)', count: 8, power: '२³ = ८' },
  { timeMins: 80, timeNp: '८० मिनेट', count: 16, power: '२⁴ = १६' },
  { timeMins: 100, timeNp: '१०० मिनेट', count: 32, power: '२⁵ = ३२' },
  { timeMins: 120, timeNp: '१२० मिनेट (२ घण्टा)', count: 64, power: '२⁶ = ६४' },
];

export const IndicesExponentPlayground: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U9-01',
    chapter: 9,
    titleNp: 'घाताङ्क खोजी र गुणन खेलमैदान (Indices & Exponent Playground)',
    titleEn: 'Indices Discovery and Exponent Playground',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'repeated_mul' | 'bacteria' | 'compare_powers' | 'challenge'>('repeated_mul');

  // Tab 1 state
  const [baseVal, setBaseVal] = useState<number>(3);
  const [expVal, setExpVal] = useState<number>(4);
  const computedVal = Math.pow(baseVal, expVal);

  // Tab 2 Bacteria timeline step
  const [bacteriaStep, setBacteriaStep] = useState<number>(3); // 60 mins

  // Tab 3 Compare powers state
  const [compBase1, setCompBase1] = useState<number>(2);
  const [compExp1, setCompExp1] = useState<number>(5);
  const [compBase2, setCompBase2] = useState<number>(5);
  const [compExp2, setCompExp2] = useState<number>(2);

  const val1 = Math.pow(compBase1, compExp1);
  const val2 = Math.pow(compBase2, compExp2);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! घाताङ्क भनेको एउटै सङ्ख्यालाई बारम्बार गुणन गर्दा छोटो रूपमा लेख्ने गणितीय नियम हो। आउनुहोस् आधार र घातको शक्ति बुझौं!',
        'Hello! Indices represent repeated multiplication in a compact mathematical form. Let us master Base and Exponent!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('repeated_mul')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'repeated_mul' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            {L('१. दोहोरिएको गुणन र घाताङ्क (Repeated Multiplication)', '1. Repeated Multiplication')}
          </button>
          <button
            onClick={() => setActiveTab('bacteria')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'bacteria' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            {L('२. ब्याक्टेरिया दोब्बर वृद्धि (CDC Bacteria Model)', '2. Bacteria Growth')}
          </button>
          <button
            onClick={() => setActiveTab('compare_powers')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'compare_powers' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            {L('३. घातहरूको तुलना (Compare Powers)', '3. Compare Powers')}
          </button>
        </div>

        {/* Tab 1: Repeated Multiplication */}
        {activeTab === 'repeated_mul' && (
          <div className="space-y-6">
            {/* Quick base selector */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-600">{L('आधार सङ्ख्या छान्नुहोस्:', 'Choose Base:')}</span>
              {[2, 3, 4, 5, 10].map((b) => (
                <button
                  key={b}
                  onClick={() => setBaseVal(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    baseVal === b ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  आधार {toNp(b)}
                </button>
              ))}
            </div>

            {/* Visual Builder Card */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black text-amber-400 font-mono">{toNp(baseVal)}</span>
                  <span className="text-3xl font-black text-sky-400 font-mono -translate-y-4">{toNp(expVal)}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase font-bold">{L('गणना गरिएको मान (Calculated Value):', 'Calculated Value:')}</div>
                  <div className="text-3xl font-black text-emerald-400">{toNp(computedVal.toLocaleString())}</div>
                </div>
              </div>

              {/* Expanded Multiplication Sequence */}
              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
                <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                  {L('विस्तारित गुणन रूप (Expanded Factor Form):', 'Expanded Form:')}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-lg font-mono font-bold text-slate-100">
                  {Array.from({ length: expVal }).map((_, i) => (
                    <React.Fragment key={i}>
                      <span className="px-3 py-1.5 bg-indigo-950/80 border border-indigo-500 rounded-xl text-amber-300">
                        {toNp(baseVal)}
                      </span>
                      {i < expVal - 1 && <span className="text-slate-400">×</span>}
                    </React.Fragment>
                  ))}
                  <span className="text-slate-400">=</span>
                  <span className="text-emerald-400 font-black">{toNp(computedVal.toLocaleString())}</span>
                </div>
                <div className="text-xs text-slate-400">
                  आधार <b className="text-amber-400">{toNp(baseVal)}</b> लाई जम्मा <b className="text-sky-400">{toNp(expVal)} पटक</b> गुणन गरिएको छ।
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-amber-400 block mb-1">
                    {L('आधार सङ्ख्या (Base a):', 'Base (a):')} {toNp(baseVal)}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={baseVal}
                    onChange={(e) => setBaseVal(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-sky-400 block mb-1">
                    {L('घाताङ्क (Index/Exponent n):', 'Index (n):')} {toNp(expVal)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={expVal}
                    onChange={(e) => setExpVal(Number(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CDC Bacteria Model */}
        {activeTab === 'bacteria' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('ब्याक्टेरिया दोब्बर हुने तालिका (CDC पाठ्यपुस्तक पृष्ठ १-२ उदाहरण)', 'CDC Bacteria Doubling Population')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'एउटा ब्याक्टेरिया प्रत्येक २० मिनेटमा टुक्रिएर दोब्बर हुन्छ। यसरी २ को घातमा घाताङ्कीय वृद्धि कसरी हुन्छ?',
                    'A bacterium splits and doubles every 20 minutes. Observe how the population follows powers of 2!'
                  )}
                </p>
              </div>

              {/* Time Slider */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  {L('समय चयन गर्नुहोस् (Select Time):', 'Time:')} {BACTERIA_DATA[bacteriaStep].timeNp}
                </label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={bacteriaStep}
                  onChange={(e) => setBacteriaStep(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Bacteria Visual Dots */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-4">
                <div className="text-xs font-bold text-amber-400 uppercase">
                  {BACTERIA_DATA[bacteriaStep].timeNp} मा जम्मा ब्याक्टेरिया: {toNp(BACTERIA_DATA[bacteriaStep].count)}
                </div>

                <div className="flex flex-wrap gap-2 max-w-lg justify-center p-3 max-h-48 overflow-y-auto">
                  {Array.from({ length: BACTERIA_DATA[bacteriaStep].count }).map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-emerald-400 border border-emerald-200 animate-pulse flex items-center justify-center text-[8px] font-bold text-emerald-950"
                    >
                      🦠
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 bg-slate-800 rounded-xl border border-indigo-500/50 text-indigo-300 font-mono font-bold text-sm">
                  घात रूप: {BACTERIA_DATA[bacteriaStep].power}
                </div>
              </div>

              {/* CDC Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5">{L('समय (Time)', 'Time')}</th>
                      <th className="p-2.5">{L('सङ्ख्या (Count)', 'Count')}</th>
                      <th className="p-2.5 text-right">{L('घाताङ्कीय रूप (Power of 2)', 'Power of 2')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {BACTERIA_DATA.map((row, idx) => (
                      <tr
                        key={idx}
                        className={idx === bacteriaStep ? 'bg-indigo-50 font-bold text-indigo-900' : 'text-slate-700'}
                      >
                        <td className="p-2.5">{row.timeNp}</td>
                        <td className="p-2.5 font-bold text-emerald-700">{toNp(row.count)}</td>
                        <td className="p-2.5 text-right font-mono text-indigo-600">{row.power}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Compare Powers */}
        {activeTab === 'compare_powers' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('घातहरूको तुलना (Comparing Exponential Values)', 'Comparing Exponential Values')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('पाठ्यपुस्तक प्रश्न: २⁵ र ५² मध्ये कुन ठूलो हुन्छ?', 'Textbook Question: Which is greater: 2⁵ or 5²?')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expression 1 */}
                <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 space-y-3">
                  <div className="text-xs font-bold text-blue-900 uppercase">{L('अभिव्यक्ति १', 'Expression 1')}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-blue-800">{toNp(compBase1)}</span>
                    <span className="text-2xl font-black text-blue-600 -translate-y-3">{toNp(compExp1)}</span>
                    <span className="text-xl font-bold text-slate-600 ml-4">= {toNp(val1.toLocaleString())}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <label className="text-[11px] text-slate-500 block">आधार: {toNp(compBase1)}</label>
                      <input type="range" min="2" max="6" value={compBase1} onChange={(e) => setCompBase1(Number(e.target.value))} className="w-full accent-blue-600" />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block">घात: {toNp(compExp1)}</label>
                      <input type="range" min="1" max="6" value={compExp1} onChange={(e) => setCompExp1(Number(e.target.value))} className="w-full accent-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Expression 2 */}
                <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="text-xs font-bold text-emerald-900 uppercase">{L('अभिव्यक्ति २', 'Expression 2')}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-emerald-800">{toNp(compBase2)}</span>
                    <span className="text-2xl font-black text-emerald-600 -translate-y-3">{toNp(compExp2)}</span>
                    <span className="text-xl font-bold text-slate-600 ml-4">= {toNp(val2.toLocaleString())}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <label className="text-[11px] text-slate-500 block">आधार: {toNp(compBase2)}</label>
                      <input type="range" min="2" max="6" value={compBase2} onChange={(e) => setCompBase2(Number(e.target.value))} className="w-full accent-emerald-600" />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block">घात: {toNp(compExp2)}</label>
                      <input type="range" min="1" max="6" value={compExp2} onChange={(e) => setCompExp2(Number(e.target.value))} className="w-full accent-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Verdict */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl text-center text-sm font-bold">
                {val1 > val2 ? (
                  <span className="text-blue-400">{toNp(compBase1)}<sup>{toNp(compExp1)}</sup> ({toNp(val1)}) &gt; {toNp(compBase2)}<sup>{toNp(compExp2)}</sup> ({toNp(val2)})</span>
                ) : val1 < val2 ? (
                  <span className="text-emerald-400">{toNp(compBase2)}<sup>{toNp(compExp2)}</sup> ({toNp(val2)}) &gt; {toNp(compBase1)}<sup>{toNp(compExp1)}</sup> ({toNp(val1)})</span>
                ) : (
                  <span className="text-amber-400">दुवैको मान समान छ ({toNp(val1)})</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default IndicesExponentPlayground;
