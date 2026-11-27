import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface SigmaPreset {
  id: string;
  titleNp: string;
  titleEn: string;
  formulaStr: string;
  fn: (i: number) => number;
  defaultStart: number;
  defaultEnd: number;
}

const SIGMA_PRESETS: SigmaPreset[] = [
  {
    id: 'linear1',
    titleNp: 'Σ (२i + ३) — पाठ्यपुस्तक उदाहरण',
    titleEn: 'Σ (2i + 3) — Textbook Example',
    formulaStr: '2i + 3',
    fn: (i) => 2 * i + 3,
    defaultStart: 1,
    defaultEnd: 5,
  },
  {
    id: 'squares',
    titleNp: 'Σ i² — पहिलो n स्वाभाविक संख्याका वर्गहरूको जोड',
    titleEn: 'Σ i² — Sum of squares',
    formulaStr: 'i²',
    fn: (i) => i * i,
    defaultStart: 1,
    defaultEnd: 5,
  },
  {
    id: 'linear2',
    titleNp: 'Σ (३i - १) — ३ को फरक भएको श्रेणी',
    titleEn: 'Σ (3i - 1) — Linear series',
    formulaStr: '3i - 1',
    fn: (i) => 3 * i - 1,
    defaultStart: 1,
    defaultEnd: 6,
  },
  {
    id: 'powers',
    titleNp: 'Σ २ⁱ — २ को घातांक श्रेणी',
    titleEn: 'Σ 2ⁱ — Powers of 2',
    formulaStr: '2ⁱ',
    fn: (i) => Math.pow(2, i),
    defaultStart: 1,
    defaultEnd: 5,
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'अनुक्रमका पदहरूलाई जोड चिन्ह (+) ले जोडेर लेखिएको गणितीय अभिव्यक्तिलाई के भनिन्छ?',
    en: 'What is a mathematical expression called when terms of a sequence are connected by plus (+) signs?',
    options: [
      { key: 'A', label: 'श्रेणी (Series)' },
      { key: 'B', label: 'अनुक्रम (Sequence)' },
      { key: 'C', label: 'समीकरण (Equation)' },
      { key: 'D', label: 'भिन्न (Fraction)' },
    ],
    answer: 'A',
  },
  {
    np: 'ग्रीक अक्षर सिग्मा (Σ - Sigma) ले गणितमा कुन क्रियालाई जनाउँछ?',
    en: 'What mathematical operation does the Greek letter Sigma (Σ) represent?',
    options: [
      { key: 'A', label: 'जोडफल (Summation)' },
      { key: 'B', label: 'गुणनफल (Product)' },
      { key: 'C', label: 'भागफल (Division)' },
      { key: 'D', label: 'वर्गमूल (Square root)' },
    ],
    answer: 'A',
  },
  {
    np: 'Σ (i = १ देखि ३ सम्म) २i को मान कति हुन्छ?',
    en: 'What is the evaluated sum of Σ (from i = 1 to 3) of 2i?',
    options: [
      { key: 'A', label: '६' },
      { key: 'B', label: '१२ (२×१ + २×२ + २×३ = २ + ४ + ६ = १२)' },
      { key: 'C', label: '१४' },
      { key: 'D', label: '८' },
    ],
    answer: 'B',
  },
  {
    np: 'श्रेणी १ + ३ + ५ + ७ + ९ लाई सिग्मा सङ्केतमा कसरी लेखिन्छ?',
    en: 'How is the series 1 + 3 + 5 + 7 + 9 expressed in Sigma notation?',
    options: [
      { key: 'A', label: 'Σ (i = १ देखि ५) (२i - १)' },
      { key: 'B', label: 'Σ (i = १ देखि ५) २i' },
      { key: 'C', label: 'Σ (i = १ देखि ५) i²' },
      { key: 'D', label: 'Σ (i = १ देखि ९) i' },
    ],
    answer: 'A',
  },
];

export const SeriesSigmaNotationExplorer: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U8-03',
    chapter: 8,
    titleNp: 'श्रेणी तथा सिग्मा सङ्केत अन्वेषक',
    titleEn: 'Series and Sigma Notation Explorer',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [selectedPreset, setSelectedPreset] = useState<SigmaPreset>(SIGMA_PRESETS[0]);
  const [startIndex, setStartIndex] = useState<number>(1);
  const [endIndex, setEndIndex] = useState<number>(5);

  // Expanded terms
  const terms: { i: number; val: number }[] = [];
  let runningSum = 0;
  for (let idx = startIndex; idx <= endIndex; idx++) {
    const val = selectedPreset.fn(idx);
    runningSum += val;
    terms.push({ i: idx, val });
  }

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! अनुक्रमबाट श्रेणी बनाउने, सिग्मा सङ्केत (Σ) को प्रयोग, पदहरूको विस्तार र जोडफल निकाल्न सिकौं!',
        'Welcome! Explore series formation from sequences, Sigma notation (Σ), term expansions, and sum calculation!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Preset Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SIGMA_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPreset(p);
                setStartIndex(p.defaultStart);
                setEndIndex(p.defaultEnd);
              }}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedPreset.id === p.id
                  ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-lg scale-[1.02]'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-mono font-bold mb-1">
                Σ ({p.formulaStr})
              </div>
              <div className="text-[11px] opacity-90 truncate">
                {isNe ? p.titleNp.split('—')[0] : p.titleEn.split('—')[0]}
              </div>
            </button>
          ))}
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Left */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
              {L('सिग्मा सूचक नियन्त्रण', 'Sigma Limits Control')}
            </h3>

            {/* Sigma Notation Large Display Box */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/30 p-5 rounded-2xl border border-purple-200 dark:border-purple-800 text-center relative">
              {/* Upper Limit */}
              <div className="text-sm font-mono font-bold text-purple-700 dark:text-purple-300">
                n = {isNe ? toNp(endIndex) : endIndex}
              </div>

              {/* Sigma Symbol and Formula */}
              <div className="flex items-center justify-center gap-3 my-1">
                <span className="text-5xl font-serif text-purple-800 dark:text-purple-200">
                  Σ
                </span>
                <span className="text-2xl font-mono font-bold text-gray-800 dark:text-gray-100">
                  ({selectedPreset.formulaStr})
                </span>
              </div>

              {/* Lower Limit */}
              <div className="text-sm font-mono font-bold text-purple-700 dark:text-purple-300">
                i = {isNe ? toNp(startIndex) : startIndex}
              </div>
            </div>

            {/* Lower Limit Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {L('सुरुको सूचक (Lower Index i):', 'Starting Index (i):')}
                </span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                  i = {isNe ? toNp(startIndex) : startIndex}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={Math.min(endIndex, 4)}
                value={startIndex}
                onChange={(e) => setStartIndex(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Upper Limit Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {L('अन्तिम सूचक (Upper Index n):', 'Ending Index (n):')}
                </span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                  n = {isNe ? toNp(endIndex) : endIndex}
                </span>
              </div>
              <input
                type="range"
                min={startIndex}
                max="8"
                value={endIndex}
                onChange={(e) => setEndIndex(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Visualization Right */}
          <div className="lg:col-span-7 space-y-4">
            {/* Step-by-Step Expansion Stream */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                {L('सिग्माको पद विस्तार (Expansion of Terms):', 'Term-by-Term Expansion:')}
              </div>

              <div className="flex flex-wrap gap-2.5 items-center">
                {terms.map((t, idx) => (
                  <React.Fragment key={t.i}>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl text-center min-w-[70px]">
                      <div className="text-[10px] text-gray-500 font-mono">
                        i = {t.i}
                      </div>
                      <div className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                        {isNe ? toNp(t.val) : t.val}
                      </div>
                    </div>
                    {idx < terms.length - 1 && (
                      <span className="text-2xl font-black text-gray-400 font-mono">
                        +
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Total Evaluated Sum */}
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div>
                  <div className="text-base font-black text-gray-900 dark:text-gray-100">
                    {L('कुल जोडफल (Evaluated Sum):', 'Total Sum:')}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {terms.map((t) => t.val).join(' + ')}
                  </div>
                </div>
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  = {isNe ? toNp(runningSum) : runningSum}
                </div>
              </div>
            </div>

            {/* Sequence vs Series Comparison Card */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border text-xs space-y-2">
              <div className="font-bold text-gray-800 dark:text-gray-200 text-sm border-b pb-1">
                {L('अनुक्रम र श्रेणी बीचको भिन्नता (Sequence vs Series)', 'Sequence vs Series Concept')}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <strong className="text-blue-600 dark:text-blue-400">{L('अनुक्रम (Sequence):', 'Sequence:')}</strong>
                  <div className="font-mono mt-0.5">{terms.map((t) => t.val).join(', ')}</div>
                  <div className="text-gray-500 text-[10px] mt-0.5">{L('संख्याहरूको अल्पविराम (,) ले छुट्याइएको सूची', 'Ordered list separated by commas')}</div>
                </div>
                <div>
                  <strong className="text-purple-600 dark:text-purple-400">{L('श्रेणी (Series):', 'Series:')}</strong>
                  <div className="font-mono mt-0.5">{terms.map((t) => t.val).join(' + ')}</div>
                  <div className="text-gray-500 text-[10px] mt-0.5">{L('अनुक्रमका पदहरूलाई जोड चिन्ह (+) ले जोडेको रूप', 'Indicated sum of the terms')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default SeriesSigmaNotationExplorer;
