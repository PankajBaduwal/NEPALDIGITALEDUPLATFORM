import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Calculator, ArrowDownUp, BarChart2, CheckCircle, RefreshCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'तथ्याङ्क 5, 8, 12, 15, 20 को औसत (Mean) कति हुन्छ?',
    en: 'What is the mean of data 5, 8, 12, 15, 20?',
    options: [
      { key: 'A', label: '12 — (60 ÷ 5 = 12)' },
      { key: 'B', label: '10' },
      { key: 'C', label: '15' },
      { key: 'D', label: '8' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि कुल पद सङ्ख्या n बिजोर (Odd) भए मध्यिका (Median) कुन पदको मान हुन्छ?',
    en: 'If total number of terms n is odd, median is the value of which term?',
    options: [
      { key: 'A', label: 'Value of the [(n + 1) ÷ 2]th term' },
      { key: 'B', label: 'Value of the (n ÷ 2)th term' },
      { key: 'C', label: 'Value of the [(n - 1) ÷ 2]th term' },
      { key: 'D', label: 'Value of the (n + 2)th term' },
    ],
    answer: 'A',
  },
  {
    np: 'तथ्याङ्क 7, 9, 12, 12, 15, 12, 18, 20 को बहुलक (Mode) कति हो?',
    en: 'What is the mode of data 7, 9, 12, 12, 15, 12, 18, 20?',
    options: [
      { key: 'A', label: '12' },
      { key: 'B', label: '15' },
      { key: 'C', label: '7' },
      { key: 'D', label: '20' },
    ],
    answer: 'A',
  },
  {
    np: 'मध्यिका निकाल्नुभन्दा अगाडि तथ्याङ्कलाई अनिवार्य रूपमा के गर्नुपर्दछ?',
    en: 'What must be done to the dataset before finding the median?',
    options: [
      { key: 'A', label: 'Arrange in increasing or decreasing order (sort in order)' },
      { key: 'B', label: 'Add them all' },
      { key: 'C', label: 'Remove the largest value' },
      { key: 'D', label: 'Multiply by 2' },
    ],
    answer: 'A',
  },
];

const PRESETS = [
  { nameNp: 'Textbook sample 1', data: [12, 15, 18, 20, 15, 25, 15] },
  { nameNp: 'Sample 2', data: [10, 14, 18, 12, 16, 20, 14, 24] },
  { nameNp: 'Test marks sample', data: [45, 52, 60, 52, 75, 80, 52, 68, 90] },
];

export const MeanMedianModeDiscoveryLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U21-02',
    chapter: 21,
    titleNp: 'औसत, मध्यिका र बहुलक प्रयोगशाला',
    titleEn: 'Mean, Median and Mode Discovery Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'mean' | 'median' | 'mode' | 'all'>('all');
  const [dataList, setDataList] = useState<number[]>([12, 15, 18, 20, 15, 25, 15]);
  const [inputVal, setInputVal] = useState<string>('');

  // Sorted list for median
  const sortedList = useMemo(() => [...dataList].sort((a, b) => a - b), [dataList]);
  const n = dataList.length;

  // Mean calculations
  const sumX = useMemo(() => dataList.reduce((acc, v) => acc + v, 0), [dataList]);
  const meanVal = n > 0 ? parseFloat((sumX / n).toFixed(2)) : 0;

  // Median calculations
  const isOdd = n % 2 !== 0;
  const medianInfo = useMemo(() => {
    if (n === 0) return { val: 0, index1: 0, index2: 0 };
    if (isOdd) {
      const idx = Math.floor(n / 2);
      return { val: sortedList[idx], index1: idx, index2: idx };
    } else {
      const idx1 = n / 2 - 1;
      const idx2 = n / 2;
      const val = (sortedList[idx1] + sortedList[idx2]) / 2;
      return { val, index1: idx1, index2: idx2 };
    }
  }, [sortedList, n, isOdd]);

  // Mode calculations
  const modeInfo = useMemo(() => {
    if (n === 0) return { modes: [], maxFreq: 0, freqMap: {} };
    const counts: Record<number, number> = {};
    dataList.forEach((v) => {
      counts[v] = (counts[v] || 0) + 1;
    });

    const maxF = Math.max(...Object.values(counts));
    const modes = Object.keys(counts)
      .map(Number)
      .filter((k) => counts[k] === maxF && maxF > 1);

    return { modes, maxFreq: maxF, freqMap: counts };
  }, [dataList, n]);

  const handleAddNumber = () => {
    const num = parseInt(inputVal);
    if (!isNaN(num) && dataList.length < 15) {
      setDataList([...dataList, num]);
      setInputVal('');
    }
  };

  const handleRemoveItem = (idx: number) => {
    if (dataList.length <= 3) return;
    setDataList(dataList.filter((_, i) => i !== idx));
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! व्यक्तिगत श्रेणीका तथ्याङ्कबाट औसत (Mean), मध्यिका (Median) र बहुलक (Mode) को हिसाब चरणबद्ध रूपमा सिकौं!',
        'Hello! Discover step-by-step Mean, Median, and Mode calculations for individual series data!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 {L('1. तीनवटै मान तुलना (Summary Comparison)', '1. Summary Comparison')}
          </button>
          <button
            onClick={() => setActiveTab('mean')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'mean' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🧮 {L('2. औसत विधि (Mean Lab)', '2. Mean Lab')}
          </button>
          <button
            onClick={() => setActiveTab('median')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'median' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            ↔️ {L('3. मध्यिका क्रमबद्ध विधि (Median Lab)', '3. Median Lab')}
          </button>
          <button
            onClick={() => setActiveTab('mode')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'mode' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎯 {L('4. बहुलक आवृत्ति (Mode Lab)', '4. Mode Lab')}
          </button>
        </div>

        {/* Dataset Controls & Presets */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs font-bold text-slate-500 self-center mr-1">Choose a sample:</span>
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setDataList([...p.data])}
                  className="px-2.5 py-1 text-xs rounded-lg font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                >
                  {p.nameNp}
                </button>
              ))}
            </div>

            {/* Add Number Input */}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="New number..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNumber()}
                className="w-28 p-1.5 text-xs rounded border border-slate-300 font-mono text-center"
              />
              <button
                onClick={handleAddNumber}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow"
              >
                Add
              </button>
            </div>
          </div>

          {/* Current Dataset Tokens */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
            <span className="text-xs font-bold text-slate-500">Current data (n = {n}):</span>
            {dataList.map((val, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-mono font-bold"
              >
                {val}
                <button
                  onClick={() => handleRemoveItem(i)}
                  className="text-amber-400 hover:text-rose-600 font-black ml-1 text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tab 1: Summary Comparison */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Mean Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm text-center">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                1. Mean (X̄)
              </span>
              <div className="text-4xl font-extrabold text-blue-600 font-mono my-2">{meanVal}</div>
              <div className="text-xs text-blue-900 bg-white p-2.5 rounded-xl border border-blue-200 font-mono">
                X̄ = ∑X ÷ n = {sumX} ÷ {n}
              </div>
            </div>

            {/* Median Card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                2. Median ($M_d$)
              </span>
              <div className="text-4xl font-extrabold text-emerald-600 font-mono my-2">{medianInfo.val}</div>
              <div className="text-xs text-emerald-900 bg-white p-2.5 rounded-xl border border-emerald-200">
                {isOdd ? `Odd (n=${n}): middle value (${medianInfo.val})` : `Even (n=${n}): mean of the two middle values`}
              </div>
            </div>

            {/* Mode Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm text-center">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                3. Mode ($M_o$)
              </span>
              <div className="text-4xl font-extrabold text-amber-600 font-mono my-2">
                {modeInfo.modes.length > 0 ? modeInfo.modes.join(', ') : 'None'}
              </div>
              <div className="text-xs text-amber-900 bg-white p-2.5 rounded-xl border border-amber-200">
                {modeInfo.modes.length > 0
                  ? `Highest frequency: ${modeInfo.maxFreq} times`
                  : 'No number is repeated'}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mean Step-by-Step */}
        {activeTab === 'mean' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base text-center">
              Step-by-step process for finding the arithmetic mean
            </h3>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3 text-xs text-blue-950">
              <div>
                <span className="font-bold">Step 1: Find the sum of all values ($\sum X$):</span>
                <div className="p-2 bg-white rounded border border-blue-200 font-mono mt-1 text-slate-700">
                  $\sum X$ = {dataList.join(' + ')} = <b className="text-blue-700">{sumX}</b>
                </div>
              </div>

              <div>
                <span className="font-bold">Step 2: Count the total number of terms ($n$):</span>
                <div className="p-2 bg-white rounded border border-blue-200 font-mono mt-1 text-slate-700">
                  $n$ = <b className="text-blue-700">{n}</b>
                </div>
              </div>

              <div>
                <span className="font-bold">Step 3: Use the formula to find the mean:</span>
                <div className="p-3 bg-white rounded border border-blue-200 font-mono mt-1 text-center text-sm font-bold text-blue-800">
                  X̄ = ∑X ÷ n = {sumX} ÷ {n} = {meanVal}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Median Ordering and Middle Highlighting */}
        {activeTab === 'median' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base text-center">
              Median: ordering method
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">
                  Step 1: Arrange the data in ascending order:
                </span>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {sortedList.map((val, idx) => {
                    const isMid = idx === medianInfo.index1 || idx === medianInfo.index2;
                    return (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-xl font-mono text-center font-bold border transition-all ${
                          isMid
                            ? 'bg-emerald-600 text-white border-emerald-600 scale-110 shadow-md ring-2 ring-emerald-300'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        <div className="text-[10px] opacity-75 font-normal">#{idx + 1}</div>
                        <div className="text-sm">{val}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-2">
                <span className="font-bold block">
                  Step 2: Number of terms n = {n} ({isOdd ? 'Odd' : 'Even'}):
                </span>

                {isOdd ? (
                  <div>
                    Since it is odd, median = value of the [(n + 1) ÷ 2]th term
                    <div className="font-mono mt-1 p-2 bg-white rounded border border-emerald-200">
                      = ({n} + 1) ÷ 2 = {Math.floor((n + 1) / 2)} th term = <b className="text-emerald-700 text-sm">{medianInfo.val}</b>
                    </div>
                  </div>
                ) : (
                  <div>
                    Since it is even, median = mean of the (n ÷ 2)th and [(n ÷ 2) + 1]th terms
                    <div className="font-mono mt-1 p-2 bg-white rounded border border-emerald-200">
                      = ({sortedList[medianInfo.index1]} + {sortedList[medianInfo.index2]}) ÷ 2 = <b className="text-emerald-700 text-sm">{medianInfo.val}</b>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Mode Frequency Table */}
        {activeTab === 'mode' && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base text-center">
              Mode and frequency table
            </h3>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3 text-xs">
              <span className="font-bold text-amber-950 block">
                Value that appears most often (highest frequency):
              </span>

              <div className="space-y-1.5">
                {Object.entries(modeInfo.freqMap).map(([val, freq]) => {
                  const isMax = freq === modeInfo.maxFreq && modeInfo.maxFreq > 1;
                  return (
                    <div
                      key={val}
                      className={`flex justify-between items-center p-2 rounded-lg border text-xs font-mono ${
                        isMax
                          ? 'bg-amber-500 text-white border-amber-600 font-bold shadow'
                          : 'bg-white text-slate-700 border-amber-100'
                      }`}
                    >
                      <span>Number: {val}</span>
                      <span>Frequency (times): {freq} {isMax ? '⭐ (mode)' : ''}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 p-3 bg-white rounded-xl border border-amber-200 text-center font-bold text-amber-900">
                Conclusion: mode = {modeInfo.modes.length > 0 ? modeInfo.modes.join(', ') : 'No mode'}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default MeanMedianModeDiscoveryLab;
