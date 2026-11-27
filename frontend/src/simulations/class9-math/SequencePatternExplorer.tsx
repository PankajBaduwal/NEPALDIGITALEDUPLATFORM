import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface PresetSequence {
  id: string;
  nameNp: string;
  nameEn: string;
  ruleNp: string;
  ruleEn: string;
  formula: (n: number) => number;
  formulaStr: string;
  isFinite: boolean;
  termLimit?: number;
}

const PRESET_SEQUENCES: PresetSequence[] = [
  {
    id: 'odd',
    nameNp: 'बिजोर संख्याहरूको अनुक्रम (Odd numbers)',
    nameEn: 'Odd numbers',
    ruleNp: 'प्रत्येक पद २ ले बढ्छ: tₙ = २n - १',
    ruleEn: 'Increases by 2: tₙ = 2n - 1',
    formula: (n) => 2 * n - 1,
    formulaStr: '2n - 1',
    isFinite: false,
  },
  {
    id: 'squares',
    nameNp: 'वर्ग संख्याहरूको अनुक्रम (Square numbers)',
    nameEn: 'Square numbers',
    ruleNp: 'पद संख्याको वर्ग: tₙ = n²',
    ruleEn: 'Square of term index: tₙ = n²',
    formula: (n) => n * n,
    formulaStr: 'n²',
    isFinite: false,
  },
  {
    id: 'cubes',
    nameNp: 'घन संख्याहरूको अनुक्रम (Cube numbers)',
    nameEn: 'Cube numbers',
    ruleNp: 'पद संख्याको घन: tₙ = n³',
    ruleEn: 'Cube of term index: tₙ = n³',
    formula: (n) => n * n * n,
    formulaStr: 'n³',
    isFinite: false,
  },
  {
    id: 'arith3',
    nameNp: 'समान अन्तर ३ भएको अनुक्रम (४, ७, १०, १३, ...)',
    nameEn: 'Arithmetic with d=3 (4, 7, 10, ...)',
    ruleNp: 'tₙ = ३n + १',
    ruleEn: 'tₙ = 3n + 1',
    formula: (n) => 3 * n + 1,
    formulaStr: '3n + 1',
    isFinite: false,
  },
  {
    id: 'finite10',
    nameNp: '१० सम्मका जोड संख्याहरूको सीमित अनुक्रम (Finite)',
    nameEn: 'Finite even numbers up to 10',
    ruleNp: 'tₙ = २n (n = १ देखि ५ सम्म सीमित)',
    ruleEn: 'tₙ = 2n (Limited to 5 terms)',
    formula: (n) => 2 * n,
    formulaStr: '2n (n ≤ 5)',
    isFinite: true,
    termLimit: 5,
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'अनुक्रम १, ४, ९, १६, २५, ... को सामान्य पद (General Term tₙ) के हो?',
    en: 'What is the general term (tₙ) of the sequence 1, 4, 9, 16, 25, ...?',
    options: [
      { key: 'A', label: 'tₙ = २n' },
      { key: 'B', label: 'tₙ = n² (पद संख्याको वर्ग)' },
      { key: 'C', label: 'tₙ = n + ३' },
      { key: 'D', label: 'tₙ = २n - १' },
    ],
    answer: 'B',
  },
  {
    np: 'जुन अनुक्रममा पदहरूको संख्या निश्चित र गन्न सकिने हुन्छ, त्यसलाई कस्तो अनुक्रम भनिन्छ?',
    en: 'A sequence with a fixed, countable number of terms is called what?',
    options: [
      { key: 'A', label: 'सीमित अनुक्रम (Finite Sequence)' },
      { key: 'B', label: 'असीमित अनुक्रम (Infinite Sequence)' },
      { key: 'C', label: 'श्रेणी (Series)' },
      { key: 'D', label: 'गुणोत्तर अनुक्रम' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि tₙ = ३n + २ भए सो अनुक्रमको पाँचौँ पद (t₅) कति हुन्छ?',
    en: 'If tₙ = 3n + 2, what is the 5th term (t₅)?',
    options: [
      { key: 'A', label: '१५' },
      { key: 'B', label: '१७ (३ × ५ + २ = १७)' },
      { key: 'C', label: '२०' },
      { key: 'D', label: '२५' },
    ],
    answer: 'B',
  },
  {
    np: 'अनुक्रम ३, ७, ११, १५, ... मा खाली ठाउँ भर्नुहोस्: ३, ७, ११, १५, [ ? ]',
    en: 'Fill in the missing term in the sequence: 3, 7, 11, 15, [ ? ]',
    options: [
      { key: 'A', label: '१७' },
      { key: 'B', label: '१८' },
      { key: 'C', label: '१९ (प्रत्येक पद ४ ले बढ्छ: १५ + ४ = १९)' },
      { key: 'D', label: '२१' },
    ],
    answer: 'C',
  },
];

export const SequencePatternExplorer: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U8-01',
    chapter: 8,
    titleNp: 'अनुक्रम ढाँचा अन्वेषक',
    titleEn: 'Sequence Pattern Explorer',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [selectedPreset, setSelectedPreset] = useState<PresetSequence>(PRESET_SEQUENCES[0]);
  const [numTerms, setNumTerms] = useState<number>(8);
  const [targetN, setTargetN] = useState<number>(12); // calculate nth term

  // Generate sequence items
  const termsCount = selectedPreset.isFinite && selectedPreset.termLimit ? selectedPreset.termLimit : numTerms;
  const termsList = Array.from({ length: termsCount }, (_, i) => ({
    n: i + 1,
    val: selectedPreset.formula(i + 1),
  }));

  const targetTermVal = selectedPreset.formula(targetN);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! पाठ ८ अनुक्रम र श्रेणी अन्तर्गत संख्याहरूको ढाँचा, सामान्य पद tₙ, सीमित र असीमित अनुक्रमको रमाइलो अन्वेषण गरौं!',
        'Welcome! Explore number patterns, general term tₙ, finite & infinite sequences, and number line visualizations!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Preset Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRESET_SEQUENCES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedPreset(s)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedPreset.id === s.id
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-lg scale-[1.02]'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-mono font-bold mb-1">
                tₙ = {s.formulaStr}
              </div>
              <div className="text-[11px] opacity-90 truncate">
                {isNe ? s.nameNp.split('(')[0] : s.nameEn}
              </div>
            </button>
          ))}
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Left */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
              {L('अनुक्रम नियम र नियन्त्रण', 'Sequence Parameters')}
            </h3>

            {/* Pattern Rule Banner */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1">
              <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                {L('अनुक्रमको नियम (Pattern Rule):', 'Pattern Rule:')}
              </div>
              <div className="text-sm font-black text-blue-700 dark:text-blue-300 font-mono">
                {isNe ? selectedPreset.ruleNp : selectedPreset.ruleEn}
              </div>
              <div className="text-[11px] text-blue-800 dark:text-blue-400">
                {selectedPreset.isFinite ? L('प्रकार: सीमित अनुक्रम (Finite)', 'Type: Finite Sequence') : L('प्रकार: असीमित अनुक्रम (Infinite)', 'Type: Infinite Sequence')}
              </div>
            </div>

            {/* Terms Count Slider */}
            {!selectedPreset.isFinite && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {L('प्रदर्शित पदहरूको संख्या (Terms Count):', 'Number of Terms:')}
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {isNe ? toNp(numTerms) : numTerms}
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  value={numTerms}
                  onChange={(e) => setNumTerms(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            )}

            {/* Calculate any N-th term */}
            <div className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-2 border">
              <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {L('कुनै पनि n-औँ पद निकाल्नुहोस् (Find nth term):', 'Find nth term value:')}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">n =</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetN}
                  onChange={(e) => setTargetN(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-2.5 py-1.5 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                />
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono ml-auto">
                  t_{targetN} = {isNe ? toNp(targetTermVal) : targetTermVal}
                </span>
              </div>
            </div>
          </div>

          {/* Visualization Right */}
          <div className="lg:col-span-7 space-y-4">
            {/* Visual Number Cards Animation */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                {L('अनुक्रमका पदहरू (Sequence Terms Display):', 'Sequence Terms Stream:')}
              </div>

              <div className="flex flex-wrap gap-2.5 items-center">
                {termsList.map((item) => (
                  <div
                    key={item.n}
                    className="p-3 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl text-center min-w-[64px] shadow-sm"
                  >
                    <div className="text-[10px] text-gray-500 font-mono font-semibold">
                      t_{item.n}
                    </div>
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                      {isNe ? toNp(item.val) : item.val}
                    </div>
                  </div>
                ))}
                {!selectedPreset.isFinite && (
                  <div className="text-2xl font-black text-gray-400 font-mono px-2">
                    ...
                  </div>
                )}
              </div>
            </div>

            {/* Table of Values */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3 text-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                {L('पद संख्या (n) र मान (tₙ) तालिका', 'Term Index (n) and Value Table')}
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <th className="p-2 border border-gray-200 dark:border-gray-600">n</th>
                      {termsList.map((t) => (
                        <th key={t.n} className="p-2 border border-gray-200 dark:border-gray-600 font-mono">
                          {t.n}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 font-bold border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        tₙ
                      </td>
                      {termsList.map((t) => (
                        <td key={t.n} className="p-2 font-mono font-bold text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600">
                          {isNe ? toNp(t.val) : t.val}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default SequencePatternExplorer;
