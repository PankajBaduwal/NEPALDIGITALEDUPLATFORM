/**
 * AlgebraicFractionAddSubLab.tsx
 * Grade 8 Mathematics – Unit 11: ALGEBRAIC FRACTION (बीजीय भिन्न)
 * Simulation 2: Algebraic Fraction Addition & Subtraction Lab (बीजीय भिन्नको जोड र घटाउ)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 11)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Plus, Minus, Layers, Award, CheckCircle, RefreshCw, Calculator } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'समान हर भएका बीजीय भिन्नहरू a/x र b/x को जोडफल कति हुन्छ?',
    en: 'What is the sum of like algebraic fractions a/x and b/x?',
    options: [
      { key: 'A', label: '(a + b) / x [ हर उही रहन्छ, अंशहरू जोडिन्छन् ]' },
      { key: 'B', label: '(a + b) / 2x' },
      { key: 'C', label: 'ab / x' },
      { key: 'D', label: '(a + b) / x²' },
    ],
    answer: 'A',
  },
  {
    np: '5a / 6b - a / 6b लाई घटाएर सरल गर्दा अन्तिम मान कति हुन्छ?',
    en: 'Subtracting and simplifying 5a / 6b - a / 6b gives what final value?',
    options: [
      { key: 'A', label: '2a / 3b [ 4a/6b लाई २ ले काट्दा 2a/3b ]' },
      { key: 'B', label: '4a / 6b' },
      { key: 'C', label: '4a / b' },
      { key: 'D', label: '5 / 6' },
    ],
    answer: 'A',
  },
  {
    np: 'असमहर बीजीय भिन्नहरू a/x र b/y लाई जोड्दा साझा हर (LCM) के हुन्छ?',
    en: 'When adding unlike fractions a/x and b/y, what is the common denominator (LCM)?',
    options: [
      { key: 'A', label: 'xy [ साझा हर xy ⇒ (ay + bx) / xy ]' },
      { key: 'B', label: 'x + y' },
      { key: 'C', label: 'x / y' },
      { key: 'D', label: 'x²y²' },
    ],
    answer: 'A',
  },
  {
    np: 'x / (x + y) - y / (x - y) को साझा हर कुन हो?',
    en: 'What is the common denominator for x / (x + y) - y / (x - y)?',
    options: [
      { key: 'A', label: '(x + y)(x - y) = x² - y²' },
      { key: 'B', label: 'x² + y²' },
      { key: 'C', label: '2x' },
      { key: 'D', label: '(x - y)²' },
    ],
    answer: 'A',
  },
  {
    np: '2a / y + 3b / y को मान कति हुन्छ?',
    en: 'What is the sum of 2a / y + 3b / y?',
    options: [
      { key: 'A', label: '(2a + 3b) / y' },
      { key: 'B', label: '5ab / y' },
      { key: 'C', label: '(2a + 3b) / 2y' },
      { key: 'D', label: '5ab / 2y' },
    ],
    answer: 'A',
  },
];

const PRESET_OPERATIONS = [
  {
    id: 1,
    type: 'same_add',
    titleNp: '२a/y + ३b/y (समान हर - जोड)',
    titleEn: '2a/y + 3b/y (Like Denominators)',
    f1: '2a / y',
    f2: '3b / y',
    op: '+',
    commonDen: 'y',
    combinedNum: '2a + 3b',
    finalAns: '(2a + 3b) / y',
  },
  {
    id: 2,
    type: 'same_sub',
    titleNp: '५a/६b - a/६b (समान हर - घटाउ र सरलीकरण)',
    titleEn: '5a/6b - a/6b (Like Denominators)',
    f1: '5a / 6b',
    f2: 'a / 6b',
    op: '-',
    commonDen: '6b',
    combinedNum: '5a - a = 4a',
    finalAns: '4a / 6b = 2a / 3b',
  },
  {
    id: 3,
    type: 'diff_lcm',
    titleNp: 'x/(x+y) - y/(x-y) (असमहर - LCM विधि)',
    titleEn: 'x/(x+y) - y/(x-y) (Unlike Denominators)',
    f1: 'x / (x + y)',
    f2: 'y / (x - y)',
    op: '-',
    commonDen: '(x + y)(x - y)',
    combinedNum: 'x(x - y) - y(x + y) = x² - xy - xy - y² = x² - 2xy - y²',
    finalAns: '(x² - 2xy - y²) / (x² - y²)',
  },
];

export const AlgebraicFractionAddSubLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U11-02',
    chapter: 11,
    titleNp: 'बीजीय भिन्नको जोड र घटाउ (Algebraic Fraction Addition & Subtraction)',
    titleEn: 'Algebraic Fraction Addition and Subtraction Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'same_den' | 'diff_den' | 'challenge'>('same_den');

  // Same Denominator Live State
  const [numA, setNumA] = useState<number>(3);
  const [numB, setNumB] = useState<number>(2);
  const [sameOp, setSameOp] = useState<'+' | '-'>('+');
  const sameResultNum = sameOp === '+' ? numA + numB : numA - numB;

  // Selected Preset
  const [selectedPreset, setSelectedPreset] = useState(PRESET_OPERATIONS[0]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! समान हर भए अंशहरू मात्र जोडिन्छ वा घटाइन्छ; असमहर भए पहिले ल.स. (LCM) निकालेर समहर बनाउनुपर्छ!',
        'Hello! With like denominators, combine numerators directly. With unlike denominators, find the LCM first!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('same_den')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'same_den' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            {L('१. समान हर भएका भिन्न (Like Fractions)', '1. Like Fractions')}
          </button>
          <button
            onClick={() => setActiveTab('diff_den')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'diff_den' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            {L('२. असमहर भएका भिन्न (Unlike Fractions & LCM)', '2. Unlike Fractions')}
          </button>
        </div>

        {/* Tab 1: Same Denominator (Like Fractions) */}
        {activeTab === 'same_den' && (
          <div className="space-y-6">
            {/* Interactive Builder */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6 font-mono">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">
                <div className="text-xl font-bold text-amber-400">
                  <span className="text-sky-300">{toNp(numA)}x / y</span> {sameOp} <span className="text-emerald-300">{toNp(numB)}x / y</span> ={' '}
                  <span className="text-amber-300">{toNp(sameResultNum)}x / y</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSameOp('+')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      sameOp === '+' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    + {L('जोड (Add)', 'Add')}
                  </button>
                  <button
                    onClick={() => setSameOp('-')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      sameOp === '-' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    - {L('घटाउ (Subtract)', 'Subtract')}
                  </button>
                </div>
              </div>

              {/* Visual Card */}
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-center space-y-4">
                <div className="text-2xl text-center">
                  <div className="border-b-2 border-slate-400 px-6 pb-2 inline-block">
                    <span className="text-sky-300">{toNp(numA)}x</span> {sameOp} <span className="text-emerald-300">{toNp(numB)}x</span>
                  </div>
                  <div className="pt-2 text-amber-400 font-bold">y</div>
                </div>

                <div className="text-xs text-slate-400 text-center font-sans">
                  नियम: हर <b className="text-amber-400">y</b> उस्तै रहन्छ, केवल अंशहरू <b className="text-sky-300">{toNp(numA)}x</b> र <b className="text-emerald-300">{toNp(numB)}x</b> {sameOp === '+' ? 'जोडिन्छन्' : 'घटाइन्छन्'}।
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-sky-400 block mb-1">पहिलो अंश गुणाङ्क: {toNp(numA)}</label>
                  <input type="range" min="1" max="10" value={numA} onChange={(e) => setNumA(Number(e.target.value))} className="w-full accent-sky-500" />
                </div>
                <div>
                  <label className="text-xs text-emerald-400 block mb-1">दोस्रो अंश गुणाङ्क: {toNp(numB)}</label>
                  <input type="range" min="1" max={sameOp === '-' ? numA : 10} value={numB} onChange={(e) => setNumB(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>
              </div>
            </div>

            {/* Presets List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_OPERATIONS.slice(0, 2).map((p) => (
                <div key={p.id} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold uppercase text-indigo-700">{p.titleNp}</div>
                  <div className="text-base font-mono font-bold text-slate-800">{p.f1} {p.op} {p.f2}</div>
                  <div className="text-xs text-slate-500 font-mono">साझा हर: {p.commonDen}</div>
                  <div className="text-sm font-mono font-black text-emerald-700">= {p.finalAns}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Different Denominators (Unlike Fractions & LCM) */}
        {activeTab === 'diff_den' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('असमहर बीजीय भिन्नको जोड र घटाउ (CDC पाठ्यपुस्तक उदाहरण)', 'Unlike Algebraic Fractions (CDC Example)')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'उदाहरण: x/(x+y) - y/(x-y) लाई हल गर्न हरहरूको ल.स. निकाल्ने र समहर बनाएर अंश घटाउने:',
                    'Example: Subtract x/(x+y) - y/(x-y) by finding the LCM of denominators first:'
                  )}
                </p>
              </div>

              {/* Step by step solution container */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl font-mono text-xs space-y-4">
                <div className="p-4 bg-slate-800 rounded-xl space-y-1">
                  <div className="text-amber-400 font-bold uppercase text-sm">{L('चरण १: हरहरूको ल.स. (LCM) निकाल्ने', 'Step 1: Find LCM')}</div>
                  <div className="text-slate-300">
                    पहिलो हर = (x + y), दोस्रो हर = (x - y) ⇒ <b>ल.स. = (x + y)(x - y) = x² - y²</b>
                  </div>
                </div>

                <div className="p-4 bg-slate-800 rounded-xl space-y-1">
                  <div className="text-sky-400 font-bold uppercase text-sm">{L('चरण २: समहर बनाउने (Cross Multiply)', 'Step 2: Equivalent Fractions')}</div>
                  <div className="text-slate-300 py-1">
                    [ x(x - y) - y(x + y) ] ÷ [ (x + y)(x - y) ]
                  </div>
                </div>

                <div className="p-4 bg-slate-800 rounded-xl space-y-1">
                  <div className="text-emerald-400 font-bold uppercase text-sm">{L('चरण ३: अंशको सरलीकरण (Simplify Numerator)', 'Step 3: Simplify')}</div>
                  <div className="text-slate-300">
                    x² - xy - xy - y² = <b>x² - 2xy - y²</b>
                  </div>
                </div>

                <div className="p-5 bg-emerald-950/90 border border-emerald-500 rounded-xl text-center text-lg font-bold text-emerald-300">
                  अन्तिम उत्तर = (x² - 2xy - y²) / (x² - y²)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default AlgebraicFractionAddSubLab;
