import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS = [
  {
    np: 'समान्तर अनुक्रम (Arithmetic Sequence) को सामान्य पद (nth term tₙ) को सूत्र के हो?',
    en: 'What is the formula for the nth term (tₙ) of an Arithmetic Sequence?',
    options: [
      { key: 'A', label: 'tₙ = a + (n - 1)d' },
      { key: 'B', label: 'tₙ = arⁿ⁻¹' },
      { key: 'C', label: 'tₙ = a + nd' },
      { key: 'D', label: 'tₙ = a × r' },
    ],
    answer: 'A',
  },
  {
    np: 'गुणोत्तर अनुक्रम (Geometric Sequence) को सामान्य पद (nth term tₙ) को सूत्र के हो?',
    en: 'What is the formula for the nth term (tₙ) of a Geometric Sequence?',
    options: [
      { key: 'A', label: 'tₙ = arⁿ⁻¹' },
      { key: 'B', label: 'tₙ = a + (n - 1)d' },
      { key: 'C', label: 'tₙ = a / r' },
      { key: 'D', label: 'tₙ = (a + r)ⁿ' },
    ],
    answer: 'A',
  },
  {
    np: 'अनुक्रम २, ६, १८, ५४, ... कस्तो प्रकारको अनुक्रम हो?',
    en: 'What type of sequence is 2, 6, 18, 54, ...?',
    options: [
      { key: 'A', label: 'समान्तर अनुक्रम (AP)' },
      { key: 'B', label: 'गुणोत्तर अनुक्रम (GP, साझा अनुपात r = ३)' },
      { key: 'C', label: 'बिजोर संख्याको अनुक्रम' },
      { key: 'D', label: 'सिमित अनुक्रम' },
    ],
    answer: 'B',
  },
  {
    np: 'समान्तर अनुक्रम ५, ८, ११, १४, ... मा साझा अन्तर (Common Difference d) कति हुन्छ?',
    en: 'In the arithmetic sequence 5, 8, 11, 14, ..., what is the common difference (d)?',
    options: [
      { key: 'A', label: '२' },
      { key: 'B', label: '३ (८ - ५ = ३)' },
      { key: 'C', label: '५' },
      { key: 'D', label: '११' },
    ],
    answer: 'B',
  },
];

export const ArithmeticGeometricSequenceLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U8-02',
    chapter: 8,
    titleNp: 'समान्तर र गुणोत्तर अनुक्रम प्रयोगशाला',
    titleEn: 'Arithmetic and Geometric Sequence Laboratory',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'ap' | 'gp' | 'compare'>('ap');

  // --- AP State ---
  const [apFirstTerm, setApFirstTerm] = useState<number>(3); // a
  const [apDiff, setApDiff] = useState<number>(4); // d
  const [apTermsCount, setApTermsCount] = useState<number>(7);
  const [apSearchVal, setApSearchVal] = useState<number>(27);

  // Generate AP terms
  const apList = Array.from({ length: apTermsCount }, (_, i) => {
    const n = i + 1;
    return { n, val: apFirstTerm + (n - 1) * apDiff };
  });

  // Check which term apSearchVal is
  const apSolvedN = apDiff !== 0 ? (apSearchVal - apFirstTerm) / apDiff + 1 : 1;
  const isApValidTerm = Number.isInteger(apSolvedN) && apSolvedN > 0;

  // --- GP State ---
  const [gpFirstTerm, setGpFirstTerm] = useState<number>(2); // a
  const [gpRatio, setGpRatio] = useState<number>(3); // r
  const [gpTermsCount, setGpTermsCount] = useState<number>(6);

  // Generate GP terms
  const gpList = Array.from({ length: gpTermsCount }, (_, i) => {
    const n = i + 1;
    return { n, val: gpFirstTerm * Math.pow(gpRatio, n - 1) };
  });

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! समान्तर अनुक्रम (AP: tₙ = a + (n-१)d) र गुणोत्तर अनुक्रम (GP: tₙ = arⁿ⁻¹) को पद निकाल्ने र तुलना गर्ने अभ्यास गरौं!',
        'Welcome! Explore Arithmetic Progression (AP: tₙ = a + (n-1)d) and Geometric Progression (GP: tₙ = arⁿ⁻¹)!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Navigation Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('ap')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ap'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>➕</span>
            <span>{L('१. समान्तर अनुक्रम (AP)', '1. Arithmetic (AP)')}</span>
          </button>
          <button
            onClick={() => setActiveTab('gp')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'gp'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>✖️</span>
            <span>{L('२. गुणोत्तर अनुक्रम (GP)', '2. Geometric (GP)')}</span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>⚖️</span>
            <span>{L('३. तुलनात्मक अभ्यास', '3. Compare AP & GP')}</span>
          </button>
        </div>

        {activeTab === 'ap' && (
          /* =========================================================================
             ARITHMETIC SEQUENCE (AP)
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <span>➕</span>
                <span>{L('समान्तर अनुक्रम (Arithmetic Progression - AP)', 'Arithmetic Progression (AP)')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'लगातार दुई पदहरू बीचको अन्तर समान (d = tₙ - tₙ₋₁) भएको अनुक्रमलाई समान्तर अनुक्रम भनिन्छ। सामान्य पद: tₙ = a + (n - १)d।',
                  'A sequence with a constant difference between consecutive terms is an Arithmetic Sequence. General term: tₙ = a + (n - 1)d.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('AP मानहरू समायोजन गर्नुहोस्', 'Adjust AP Values')}
                </h3>

                {/* First Term a */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{L('पहिलो पद a (First Term):', 'First Term (a):')}</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{apFirstTerm}</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="20"
                    value={apFirstTerm}
                    onChange={(e) => setApFirstTerm(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Common Difference d */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{L('साझा अन्तर d (Common Difference):', 'Common Difference (d):')}</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{apDiff}</span>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="15"
                    value={apDiff}
                    onChange={(e) => setApDiff(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {apDiff > 0 ? L('धनात्मक अन्तर (बढ्दो अनुक्रम)', 'Positive d (Increasing)') : apDiff < 0 ? L('ऋणात्मक अन्तर (घट्दो अनुक्रम)', 'Negative d (Decreasing)') : L('शून्य अन्तर', 'Zero d')}
                  </div>
                </div>

                {/* Reverse Solver: which term is value X? */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-2 border">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {L('उल्टो हिसाब: कुन पद कति हो? (Find term number n):', 'Reverse Solver: Find n for value tₙ:')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">tₙ =</span>
                    <input
                      type="number"
                      value={apSearchVal}
                      onChange={(e) => setApSearchVal(parseInt(e.target.value) || 0)}
                      className="w-24 px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-mono">
                    {isApValidTerm
                      ? L(`मान ${toNp(apSearchVal)} यस अनुक्रमको ${toNp(apSolvedN)}-औँ पद हो।`, `Value ${apSearchVal} is term t_${apSolvedN}.`)
                      : L(`मान ${toNp(apSearchVal)} यस अनुक्रममा पर्दैन।`, `Value ${apSearchVal} does not belong to this AP.`)}
                  </div>
                </div>
              </div>

              {/* Visualization Right */}
              <div className="lg:col-span-7 space-y-4">
                {/* AP Stream Cards with Differences Highlighted */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {L('समान्तर अनुक्रमका पदहरू (AP Terms Stream):', 'AP Terms Stream:')}
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    {apList.map((item, idx) => (
                      <React.Fragment key={item.n}>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-center min-w-[65px] shadow-sm">
                          <div className="text-[10px] text-gray-500 font-mono font-semibold">
                            t_{item.n}
                          </div>
                          <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                            {isNe ? toNp(item.val) : item.val}
                          </div>
                        </div>
                        {idx < apList.length - 1 && (
                          <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-full border border-emerald-200">
                            {apDiff >= 0 ? `+${apDiff}` : apDiff}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Formula Breakdown Card */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2 text-sm">
                  <div className="font-bold text-blue-900 dark:text-blue-200">
                    {L('AP सामान्य पदको सूत्र: tₙ = a + (n - १)d', 'General Term Formula: tₙ = a + (n - 1)d')}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 font-mono space-y-1">
                    <div>t₁ = {apFirstTerm}</div>
                    <div>t₂ = {apFirstTerm} + (२ - १) × {apDiff} = {apFirstTerm + apDiff}</div>
                    <div>t₃ = {apFirstTerm} + (३ - १) × {apDiff} = {apFirstTerm + 2 * apDiff}</div>
                    <div>t₄ = {apFirstTerm} + (४ - १) × {apDiff} = {apFirstTerm + 3 * apDiff}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gp' && (
          /* =========================================================================
             GEOMETRIC SEQUENCE (GP)
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-2">
                <span>✖️</span>
                <span>{L('गुणोत्तर अनुक्रम (Geometric Progression - GP)', 'Geometric Progression (GP)')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'लगातार दुई पदहरू बीचको अनुपात समान (r = tₙ / tₙ₋₁) भएको अनुक्रमलाई गुणोत्तर अनुक्रम भनिन्छ। सामान्य पद: tₙ = arⁿ⁻¹।',
                  'A sequence with a constant ratio between consecutive terms is a Geometric Sequence. General term: tₙ = arⁿ⁻¹.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('GP मानहरू समायोजन गर्नुहोस्', 'Adjust GP Values')}
                </h3>

                {/* First Term a */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{L('पहिलो पद a (First Term):', 'First Term (a):')}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{gpFirstTerm}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={gpFirstTerm}
                    onChange={(e) => setGpFirstTerm(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Common Ratio r */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{L('साझा अनुपात r (Common Ratio):', 'Common Ratio (r):')}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{gpRatio}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="5"
                    value={gpRatio}
                    onChange={(e) => setGpRatio(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Visualization Right */}
              <div className="lg:col-span-7 space-y-4">
                {/* GP Stream Cards with Ratio Highlighted */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {L('गुणोत्तर अनुक्रमका पदहरू (GP Terms Stream):', 'GP Terms Stream:')}
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    {gpList.map((item, idx) => (
                      <React.Fragment key={item.n}>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center min-w-[65px] shadow-sm">
                          <div className="text-[10px] text-gray-500 font-mono font-semibold">
                            t_{item.n}
                          </div>
                          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                            {isNe ? toNp(item.val) : item.val}
                          </div>
                        </div>
                        {idx < gpList.length - 1 && (
                          <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-full border border-blue-200">
                            ×{gpRatio}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Formula Breakdown */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2 text-sm">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200">
                    {L('GP सामान्य पदको सूत्र: tₙ = a × rⁿ⁻¹', 'General Term Formula: tₙ = arⁿ⁻¹')}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 font-mono space-y-1">
                    <div>t₁ = {gpFirstTerm} × {gpRatio}⁰ = {gpFirstTerm}</div>
                    <div>t₂ = {gpFirstTerm} × {gpRatio}¹ = {gpFirstTerm * gpRatio}</div>
                    <div>t₃ = {gpFirstTerm} × {gpRatio}² = {gpFirstTerm * gpRatio * gpRatio}</div>
                    <div>t₄ = {gpFirstTerm} × {gpRatio}³ = {gpFirstTerm * Math.pow(gpRatio, 3)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          /* =========================================================================
             COMPARISON TABLE
             ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-blue-200 dark:border-blue-800 space-y-3 text-sm">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 text-base border-b pb-2 flex items-center gap-2">
                <span>➕</span>
                <span>{L('समान्तर अनुक्रम (AP)', 'Arithmetic Progression')}</span>
              </h3>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <li>• <strong>{L('परिभाषा:', 'Definition:')}</strong> {L('लगातार दुई पदहरू बीचको अन्तर सधैं समान हुन्छ।', 'Constant difference between terms.')}</li>
                <li>• <strong>{L('साझा अन्तर:', 'Difference:')}</strong> d = t₂ - t₁ = t₃ - t₂</li>
                <li>• <strong>{L('सामान्य पद:', 'General Term:')}</strong> tₙ = a + (n - १)d</li>
                <li>• <strong>{L('उदाहरण:', 'Example:')}</strong> ५, १०, १५, २०, २५, ... (d = ५)</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-emerald-200 dark:border-emerald-800 space-y-3 text-sm">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-base border-b pb-2 flex items-center gap-2">
                <span>✖️</span>
                <span>{L('गुणोत्तर अनुक्रम (GP)', 'Geometric Progression')}</span>
              </h3>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <li>• <strong>{L('परिभाषा:', 'Definition:')}</strong> {L('लगातार दुई पदहरू बीचको अनुपात सधैं समान हुन्छ।', 'Constant ratio between terms.')}</li>
                <li>• <strong>{L('साझा अनुपात:', 'Ratio:')}</strong> r = t₂ / t₁ = t₃ / t₂</li>
                <li>• <strong>{L('सामान्य पद:', 'General Term:')}</strong> tₙ = a × rⁿ⁻¹</li>
                <li>• <strong>{L('उदाहरण:', 'Example:')}</strong> ३, ६, १२, २४, ४८, ... (r = २)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ArithmeticGeometricSequenceLab;
