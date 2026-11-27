import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS = [
  {
    np: '(a + b)³ को ज्यामितीय विस्तार (Geometric Expansion) मा कुल कतिवटा साना ठोसहरू (Tessellated blocks) बन्छन्?',
    en: 'In the geometric expansion of (a + b)³, how many smaller cuboids and cubes are formed?',
    options: [
      { key: 'A', label: '४ वटा' },
      { key: 'B', label: '६ वटा' },
      { key: 'C', label: '८ वटा (१ वटा a³, ३ वटा a²b, ३ वटा ab², १ वटा b³)' },
      { key: 'D', label: '१२ वटा' },
    ],
    answer: 'C',
  },
  {
    np: '(a + b)³ को सही बीजीय विस्तार सूत्र कुन हो?',
    en: 'What is the correct algebraic expansion formula for (a + b)³?',
    options: [
      { key: 'A', label: 'a³ + ३a²b + ३ab² + b³' },
      { key: 'B', label: 'a³ + b³' },
      { key: 'C', label: 'a³ - ३a²b + ३ab² - b³' },
      { key: 'D', label: 'a³ + ३ab + b³' },
    ],
    answer: 'A',
  },
  {
    np: '(a - b)³ को विस्तार सूत्र कुन हो?',
    en: 'What is the expansion formula for (a - b)³?',
    options: [
      { key: 'A', label: 'a³ - ३a²b + ३ab² - b³' },
      { key: 'B', label: 'a³ - b³' },
      { key: 'C', label: 'a³ + ३a²b - ३ab² + b³' },
      { key: 'D', label: 'a³ - ३ab(a - b)' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि a = ३ र b = २ भए (a + b)³ = ५³ = १२५ हुन्छ। यसमा ३a²b को मान कति हुन्छ?',
    en: 'If a = 3 and b = 2, (a + b)³ = 5³ = 125. What is the value of 3a²b?',
    options: [
      { key: 'A', label: '२७' },
      { key: 'B', label: '५४ (३ × ३² × २ = ३ × ९ × २ = ५४)' },
      { key: 'C', label: '३६' },
      { key: 'D', label: '८' },
    ],
    answer: 'B',
  },
];

export const AlgebraicCubeBuilder: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U9-01',
    chapter: 9,
    titleNp: 'बीजीय घन निर्माण: (a + b)³ र (a - b)³',
    titleEn: 'Algebraic Cube Builder: (a + b)³ and (a - b)³',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [mode, setMode] = useState<'plus' | 'minus'>('plus');
  const [valA, setValA] = useState<number>(4);
  const [valB, setValB] = useState<number>(2);
  const [highlightBlock, setHighlightBlock] = useState<'all' | 'a3' | 'a2b' | 'ab2' | 'b3'>('all');

  // Math terms for (a + b)³
  const aCube = Math.pow(valA, 3);
  const threeA2B = 3 * valA * valA * valB;
  const threeAB2 = 3 * valA * valB * valB;
  const bCube = Math.pow(valB, 3);
  const totalPlusCube = Math.pow(valA + valB, 3);

  // Math terms for (a - b)³
  const totalMinusCube = Math.pow(Math.max(1, valA - valB), 3);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! (a + b)³ र (a - b)³ को ज्यामितीय ३D घन ब्लकहरू, ८ वटा खण्डहरूको आयतन र बीजीय विस्तार अन्वेषण गरौं!',
        'Welcome! Explore geometric 3D visualization of (a + b)³ and (a - b)³, block volumes, and algebraic expansions!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Plus / Minus Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setMode('plus')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              mode === 'plus'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🟦</span>
            <span>(a + b)³ = a³ + 3a²b + 3ab² + b³</span>
          </button>
          <button
            onClick={() => setMode('minus')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              mode === 'minus'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🟪</span>
            <span>(a - b)³ = a³ - 3a²b + 3ab² - b³</span>
          </button>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Left */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
              {L('भुजाहरू a र b नियन्त्रण', 'Variables a and b')}
            </h3>

            {/* Slider a */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {L('पहिलो खण्ड a (Side a):', 'Side a:')}
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  a = {isNe ? toNp(valA) : valA}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={valA}
                onChange={(e) => setValA(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Slider b */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {L('दोस्रो खण्ड b (Side b):', 'Side b:')}
                </span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                  b = {isNe ? toNp(valB) : valB}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={mode === 'minus' ? Math.max(1, valA - 1) : 6}
                value={valB}
                onChange={(e) => setValB(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Block Inspector Selector */}
            {mode === 'plus' && (
              <div>
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  {L('८ वटा खण्डहरू हाइलाइट गर्नुहोस्:', 'Highlight 8 Components:')}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    onClick={() => setHighlightBlock('all')}
                    className={`p-2 rounded-xl border ${highlightBlock === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                  >
                    {L('सबै ८ खण्डहरू (All 8)', 'All 8 Blocks')}
                  </button>
                  <button
                    onClick={() => setHighlightBlock('a3')}
                    className={`p-2 rounded-xl border ${highlightBlock === 'a3' ? 'bg-indigo-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                  >
                    १ वटा a³ ({aCube})
                  </button>
                  <button
                    onClick={() => setHighlightBlock('a2b')}
                    className={`p-2 rounded-xl border ${highlightBlock === 'a2b' ? 'bg-emerald-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                  >
                    ३ वटा a²b ({threeA2B})
                  </button>
                  <button
                    onClick={() => setHighlightBlock('ab2')}
                    className={`p-2 rounded-xl border ${highlightBlock === 'ab2' ? 'bg-amber-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                  >
                    ३ वटा ab² ({threeAB2})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Visualization Right */}
          <div className="lg:col-span-7 space-y-4">
            {/* SVG Visual Partitioned Cube */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[300px]">
              <svg viewBox="0 0 460 280" className="w-full max-w-lg h-64">
                {/* 3D Isometric View of Cube with a and b subdivisions */}
                <g>
                  {/* Base large cube (a + b) */}
                  <polygon
                    points="230,50 350,115 230,180 110,115"
                    className="fill-blue-100/60 stroke-blue-500 stroke-2"
                  />
                  <polygon
                    points="110,115 230,180 230,260 110,195"
                    className="fill-blue-200/70 stroke-blue-600 stroke-2"
                  />
                  <polygon
                    points="230,180 350,115 350,195 230,260"
                    className="fill-blue-300/80 stroke-blue-700 stroke-2"
                  />

                  {/* Subdivision partition lines representing a and b */}
                  <line x1="190" y1="72" x2="310" y2="137" className="stroke-indigo-600 stroke-2 stroke-dasharray-2" strokeDasharray="4 2" />
                  <line x1="150" y1="137" x2="270" y2="202" className="stroke-indigo-600 stroke-2 stroke-dasharray-2" strokeDasharray="4 2" />

                  {/* Labels on edges */}
                  <text x="160" y="70" textAnchor="middle" className="text-xs font-black fill-blue-700 font-mono">a = {valA}</text>
                  <text x="210" y="98" textAnchor="middle" className="text-xs font-black fill-purple-700 font-mono">b = {valB}</text>

                  {/* Center Formula Callout */}
                  <text x="230" y="220" textAnchor="middle" className="text-base font-black fill-gray-900 dark:fill-white">
                    {mode === 'plus'
                      ? `(${valA} + ${valB})³ = ${valA + valB}³ = ${totalPlusCube}`
                      : `(${valA} - ${valB})³ = ${valA - valB}³ = ${totalMinusCube}`}
                  </text>
                </g>
              </svg>
            </div>

            {/* Algebraic Volume Breakdown Table */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3 text-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                {L('बीजीय पदहरू तथा आयतनको योगफल', 'Component Volumes Breakdown')}
              </h4>

              {mode === 'plus' ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">१. १ वटा a³ ब्लक (a × a × a):</span>
                    <span className="font-mono font-bold">{valA}³ = {aCube}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">२. ३ वटा a²b ब्लक (३ × a² × b):</span>
                    <span className="font-mono font-bold">३ × {valA}² × {valB} = {threeA2B}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="font-semibold text-amber-700 dark:text-amber-300">३. ३ वटा ab² ब्लक (३ × a × b²):</span>
                    <span className="font-mono font-bold">३ × {valA} × {valB}² = {threeAB2}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="font-semibold text-purple-700 dark:text-purple-300">४. १ वटा b³ ब्लक (b × b × b):</span>
                    <span className="font-mono font-bold">{valB}³ = {bCube}</span>
                  </div>
                  <div className="pt-2 flex justify-between items-center text-sm font-black text-blue-900 dark:text-blue-200">
                    <span>कुल योगफल = {aCube} + {threeA2B} + {threeAB2} + {bCube}:</span>
                    <span className="text-xl font-mono text-blue-600 dark:text-blue-400">{totalPlusCube}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl space-y-1 font-mono">
                    <div>(a - b)³ = a³ - ३a²b + ३ab² - b³</div>
                    <div>= {valA}³ - ३({valA}²)({valB}) + ३({valA})({valB}²) - {valB}³</div>
                    <div>= {aCube} - {threeA2B} + {threeAB2} - {bCube}</div>
                    <div className="text-base font-bold text-purple-700 dark:text-purple-300 pt-1">
                      = {totalMinusCube}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default AlgebraicCubeBuilder;
