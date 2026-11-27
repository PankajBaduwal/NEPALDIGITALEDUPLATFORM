/**
 * AlgebraicTilesFactorizationPlayground.tsx
 * Grade 8 Mathematics – Unit 10: ALGEBRAIC EXPRESSION
 * Simulation 1: Algebraic Tiles and Factorization Playground
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 10)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Square, Grid, Layers, Award, CheckCircle, RefreshCw, Scissors } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'x² + 3x लाई बीजगणितीय टायलबाट आयत बनाउँदा लम्बाइ र चौडाइ के हुन्छ?',
    en: 'When x² + 3x is arranged into a rectangle using algebra tiles, what are its length and breadth?',
    options: [
      { key: 'A', label: 'Length = x + 3, Breadth = x [ x(x + 3) ]' },
      { key: 'B', label: 'Length = x, Breadth = 3' },
      { key: 'C', label: 'Length = x², Breadth = 3x' },
      { key: 'D', label: 'Length = x + 1, Breadth = x + 2' },
    ],
    answer: 'A',
  },
  {
    np: 'ax + bx + ay + by लाई समूह मिलान (Grouping) विधिबाट खण्डीकरण गर्दा के आउँछ?',
    en: 'Factorizing ax + bx + ay + by by grouping terms yields what result?',
    options: [
      { key: 'A', label: '(a + b)(x + y)' },
      { key: 'B', label: '(a + x)(b + y)' },
      { key: 'C', label: '(a - b)(x - y)' },
      { key: 'D', label: 'ab(x + y)' },
    ],
    answer: 'A',
  },
  {
    np: 'दुई वर्गको अन्तर (Difference of Two Squares: a² - b²) को खण्डीकृत रूप कुन हो?',
    en: 'What is the factorized form of the difference of two squares: a² - b²?',
    options: [
      { key: 'A', label: '(a + b)(a - b)' },
      { key: 'B', label: '(a - b)²' },
      { key: 'C', label: '(a + b)²' },
      { key: 'D', label: 'a² - 2ab + b²' },
    ],
    answer: 'A',
  },
  {
    np: 'पूर्ण वर्ग व्यञ्जक a² + 2ab + b² को मान कुनसँग बराबर हुन्छ?',
    en: 'The perfect square expression a² + 2ab + b² is equal to what?',
    options: [
      { key: 'A', label: '(a + b)²' },
      { key: 'B', label: '(a - b)²' },
      { key: 'C', label: '(a + b)(a - b)' },
      { key: 'D', label: '2(a + b)' },
    ],
    answer: 'A',
  },
  {
    np: '2x² + 4x बाट साझा गुणनखण्ड (Common Factor) 2x लिँदा बाँकी के रहन्छ?',
    en: 'Taking common factor 2x from 2x² + 4x leaves what expression?',
    options: [
      { key: 'A', label: 'x + 2 [ 2x(x + 2) ]' },
      { key: 'B', label: 'x + 4' },
      { key: 'C', label: '2x + 2' },
      { key: 'D', label: 'x² + 2' },
    ],
    answer: 'A',
  },
];

export const AlgebraicTilesFactorizationPlayground: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U10-01',
    chapter: 10,
    titleNp: 'बीजगणितीय टायल र खण्डीकरण (Algebraic Tiles & Factorization)',
    titleEn: 'Algebraic Tiles and Factorization Playground',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'tiles_rect' | 'common_factor' | 'grouping' | 'diff_squares' | 'perfect_square'>('tiles_rect');

  // Tab 1 state: x^2 + c*x
  const [numXTiles, setNumXTiles] = useState<number>(3); // x^2 + numXTiles * x

  // Tab 4 Difference of squares state: a and b
  const [sideBigA, setSideBigA] = useState<number>(8);
  const [sideSmallB, setSideSmallB] = useState<number>(3);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! खण्डीकरण भनेको बीजीय व्यञ्जकलाई टायलहरू मिलाएर आयत वा वर्ग बनाउनु हो! आउनुहोस् टायलहरूबाट खण्डीकरण हेरौं!',
        'Hello! Factorization visually corresponds to arranging algebraic tiles into a single rectangle! Let us explore tiles and grouping!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('tiles_rect')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'tiles_rect' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Square className="w-4 h-4" />
            {L('1. टायलबाट आयत (x² + bx = x(x+b))', '1. Tiles to Rectangle')}
          </button>
          <button
            onClick={() => setActiveTab('common_factor')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'common_factor' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            {L('2. साझा गुणनखण्ड (Common Factor)', '2. Common Factor')}
          </button>
          <button
            onClick={() => setActiveTab('grouping')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'grouping' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            {L('3. समूह मिलान विधि (Grouping Terms)', '3. Grouping Terms')}
          </button>
          <button
            onClick={() => setActiveTab('diff_squares')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'diff_squares' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Scissors className="w-4 h-4" />
            {L('4. दुई वर्गको अन्तर (a² - b²)', '4. Difference of Squares')}
          </button>
          <button
            onClick={() => setActiveTab('perfect_square')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'perfect_square' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            {L('5. पूर्ण वर्ग (Perfect Square)', '5. Perfect Square')}
          </button>
        </div>

        {/* Tab 1: Tiles to Rectangle */}
        {activeTab === 'tiles_rect' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">
                <div className="text-xl font-mono font-black text-amber-400">
                  x² + {toNp(numXTiles)}x = <span className="text-emerald-400">x(x + {toNp(numXTiles)})</span>
                </div>
                <div className="text-xs px-3 py-1 bg-emerald-950 border border-emerald-500 text-emerald-300 rounded-full font-bold">
                  {L('आयतको क्षेत्रफल = लम्बाइ × चौडाइ', 'Rectangle Area = Length × Breadth')}
                </div>
              </div>

              {/* Graphic Tiles Arrangement */}
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center">
                  {/* Left Label: Breadth = x */}
                  <div className="text-xs font-bold text-sky-400 -rotate-90 pr-2">
                    Breadth = x
                  </div>

                  {/* Tile Grid */}
                  <div className="flex border-2 border-dashed border-emerald-400 p-1 rounded-xl bg-slate-950/60">
                    {/* One x^2 tile (big green square) */}
                    <div className="w-24 h-24 bg-emerald-600 border border-emerald-300 rounded-lg flex items-center justify-center font-mono font-black text-white text-lg shadow-inner">
                      x²
                    </div>

                    {/* Beside it: numXTiles x-tiles (vertical bars of x by 1) */}
                    <div className="flex">
                      {Array.from({ length: numXTiles }).map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-24 bg-teal-500 border border-teal-300 rounded-r-none flex items-center justify-center font-mono font-bold text-white text-xs shadow-inner"
                        >
                          x
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top/Bottom Dimension Label: Length = x + numXTiles */}
                <div className="text-center font-mono text-xs font-bold text-amber-400">
                  Length = x + {toNp(numXTiles)} (1 x-tile + {toNp(numXTiles)} unit strips)
                </div>
              </div>

              {/* Slider for x-tiles */}
              <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700">
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {L('x टायलहरूको संख्या:', 'Number of x-tiles:')} {toNp(numXTiles)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={numXTiles}
                  onChange={(e) => setNumXTiles(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Common Factor */}
        {activeTab === 'common_factor' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('साझा गुणनखण्ड लिने विधि (Taking Common Factor: 2x² + 4x)', 'Taking Common Factor: 2x² + 4x')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('दुवै पदमा रहेका साझा संख्या र चलराशिलाई कोष्ठक बाहिर निकाल्ने:', 'Identify the greatest common monomial factor in each term:')}
                </p>
              </div>

              <div className="p-6 bg-slate-900 text-white rounded-2xl font-mono text-sm space-y-4">
                <div className="text-amber-400 font-bold uppercase">{L('चरणबद्ध खण्डीकरण:', 'Step-by-Step Breakdown:')}</div>
                <div className="space-y-2">
                  <div>1. First term: 2x² = <span className="text-emerald-400 font-bold">2 · x</span> · x</div>
                  <div>2. Second term: 4x = <span className="text-emerald-400 font-bold">2 · x</span> · 2</div>
                  <div className="p-3 bg-slate-800 rounded-xl text-emerald-300 font-bold text-base border border-slate-700">
                    3. Common factor of both = <span className="text-amber-400">2x</span>
                  </div>
                  <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xl font-black text-emerald-300 text-center">
                    2x² + 4x = 2x(x + 2)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Grouping Terms */}
        {activeTab === 'grouping' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('समूह मिलान विधिबाट खण्डीकरण (Factorization by Grouping)', 'Factorization by Grouping')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('चार ओटा पदहरू भएको व्यञ्जक ax + bx + ay + by लाई जोडी बनाएर साझा लिने:', 'Group terms in pairs to extract common binomials:')}
                </p>
              </div>

              <div className="p-6 bg-slate-900 text-white rounded-2xl font-mono text-sm space-y-4">
                <div className="text-amber-400 font-bold uppercase">{L('समूह मिलान प्रक्रिया:', 'Grouping Procedure:')}</div>
                <div className="space-y-2">
                  <div>1. Given expression: ax + bx + ay + by</div>
                  <div>2. Grouping the terms in pairs: <span className="text-sky-300">(ax + bx)</span> + <span className="text-purple-300">(ay + by)</span></div>
                  <div>3. Taking out the common factor from each group: <span className="text-sky-400">x(a + b)</span> + <span className="text-purple-400">y(a + b)</span></div>
                  <div className="text-amber-300">4. Taking out the common binomial (a + b):</div>
                  <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-xl text-center text-2xl font-black text-emerald-300">
                    = (a + b)(x + y)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Difference of Two Squares */}
        {activeTab === 'diff_squares' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('दुई वर्गको अन्तर: a² - b² = (a + b)(a - b)', 'Difference of Two Squares: a² - b² = (a + b)(a - b)')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('ठूलो वर्ग (a²) बाट सानो वर्ग (b²) हटाउँदा बाँकी क्षेत्रलाई काटेर जोड्दा आयत (a + b) × (a - b) बन्छ।', 'Removing square b² from square a² and rearranging the L-shape produces rectangle (a+b) by (a-b).')}
                </p>
              </div>

              {/* Graphic Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="w-full h-56 bg-slate-900 rounded-2xl flex items-center justify-center p-4">
                  <svg viewBox="0 0 200 200" className="w-44 h-44">
                    {/* Big Square a */}
                    <rect x="20" y="20" width="160" height="160" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
                    {/* Cut out square b in corner */}
                    <rect x="120" y="20" width="60" height="60" fill="#0f172a" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
                    <text x="150" y="55" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">b² removed</text>
                    <text x="70" y="110" fill="#ffffff" fontSize="12" fontWeight="bold">a² - b²</text>
                  </svg>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl font-mono text-xs space-y-2">
                  <div className="text-amber-400 font-bold uppercase">{L('संख्यात्मक उदाहरण (CDC Case):', 'CDC Numerical Case:')}</div>
                  <div>a = {toNp(sideBigA)}, b = {toNp(sideSmallB)}</div>
                  <div>a² - b² = {toNp(sideBigA)}² - {toNp(sideSmallB)}² = {toNp(sideBigA * sideBigA)} - {toNp(sideSmallB * sideSmallB)} = <b className="text-sky-300">{toNp(sideBigA * sideBigA - sideSmallB * sideSmallB)}</b></div>
                  <div className="pt-2 border-t border-slate-700">
                    (a + b)(a - b) = ({toNp(sideBigA)} + {toNp(sideSmallB)})({toNp(sideBigA)} - {toNp(sideSmallB)}) = {toNp(sideBigA + sideSmallB)} × {toNp(sideBigA - sideSmallB)} = <b className="text-emerald-400">{toNp((sideBigA + sideSmallB) * (sideBigA - sideSmallB))}</b>
                  </div>
                  <div className="text-emerald-300 font-bold pt-1">{L('दुवै विधिबाट नतिजा ठ्याक्कै समान!', 'Both sides evaluate identically!')}</div>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Larger side a: {toNp(sideBigA)}</label>
                  <input type="range" min="5" max="15" value={sideBigA} onChange={(e) => setSideBigA(Number(e.target.value))} className="w-full accent-blue-600" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Smaller side b: {toNp(sideSmallB)}</label>
                  <input type="range" min="1" max={sideBigA - 1} value={sideSmallB} onChange={(e) => setSideSmallB(Number(e.target.value))} className="w-full accent-rose-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Perfect Square */}
        {activeTab === 'perfect_square' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('पूर्ण वर्ग सूत्र: a² + 2ab + b² = (a + b)²', 'Perfect Square: a² + 2ab + b² = (a + b)²')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('भुजा (a + b) भएको ठूलो वर्ग 4 भागमा विभाजित हुन्छ: एउटा a², दुईpcs ab, र एउटा b²।', 'A square of side (a+b) splits into 4 regions: one a², two ab, and one b².')}
                </p>
              </div>

              <div className="p-6 bg-slate-900 text-white rounded-2xl font-mono text-sm space-y-4">
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 w-48 h-48 border-2 border-indigo-400 rounded-xl overflow-hidden text-center text-xs font-bold">
                    <div className="bg-emerald-600 flex items-center justify-center p-2 text-white">a²</div>
                    <div className="bg-sky-600 flex items-center justify-center p-2 text-white">ab</div>
                    <div className="bg-sky-600 flex items-center justify-center p-2 text-white">ab</div>
                    <div className="bg-amber-600 flex items-center justify-center p-2 text-white">b²</div>
                  </div>
                </div>

                <div className="text-center text-lg font-bold text-emerald-400 font-sans">
                  Sum of the areas = a² + ab + ab + b² = <span className="text-amber-300">a² + 2ab + b² = (a + b)²</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default AlgebraicTilesFactorizationPlayground;
