import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS = [
  {
    np: 'प्रिज्मको छड्के सतहको क्षेत्रफल (Lateral Surface Area - LSA) को सामान्य सूत्र के हो?',
    en: 'What is the general formula for the Lateral Surface Area (LSA) of a prism?',
    options: [
      { key: 'A', label: 'LSA = perimeter of base × height (P × h)' },
      { key: 'B', label: 'LSA = area of base × height (A × h)' },
      { key: 'C', label: 'LSA = 2A + P × h' },
      { key: 'D', label: 'LSA = 2(l + b)' },
    ],
    answer: 'A',
  },
  {
    np: 'प्रिज्मको कुल सतहको क्षेत्रफल (Total Surface Area - TSA) को सूत्र के हो?',
    en: 'What is the formula for the Total Surface Area (TSA) of a prism?',
    options: [
      { key: 'A', label: 'TSA = 2A + P × h' },
      { key: 'B', label: 'TSA = A × h' },
      { key: 'C', label: 'TSA = P × h' },
      { key: 'D', label: 'TSA = 4a²' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा त्रिभुजाकार प्रिज्मका आधारका भुजाहरू 6 सेमि, 8 सेमि र 10 सेमि छन् र प्रिज्मको लम्बाइ 15 सेमि भए LSA कति हुन्छ?',
    en: 'If a triangular prism has base sides 6cm, 8cm, 10cm and length 15cm, what is its LSA?',
    options: [
      { key: 'A', label: '360 sq cm (P = 24, LSA = 24 × 15 = 360)' },
      { key: 'B', label: '240 sq cm' },
      { key: 'C', label: '408 sq cm' },
      { key: 'D', label: '120 sq cm' },
    ],
    answer: 'A',
  },
  {
    np: 'a भुजा भएको घनाकार प्रिज्म (Cube) को कुल सतहको क्षेत्रफल (TSA) कति हुन्छ?',
    en: 'What is the Total Surface Area (TSA) of a cube with edge a?',
    options: [
      { key: 'A', label: '4a²' },
      { key: 'B', label: '5a²' },
      { key: 'C', label: '6a² (sum of 6 square faces)' },
      { key: 'D', label: 'a³' },
    ],
    answer: 'C',
  },
];

export const PrismSurfaceAreaLaboratory: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U6-02',
    chapter: 6,
    titleNp: 'प्रिज्मको छड्के र कुल सतहको क्षेत्रफल प्रयोगशाला',
    titleEn: 'Lateral and Total Surface Area Laboratory',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [shapeType, setShapeType] = useState<'triangular' | 'rectangular' | 'cube'>('triangular');
  const [unfoldProgress, setUnfoldProgress] = useState<number>(0); // 0% = 3D Solid, 100% = Flat Net

  // --- Triangular Prism Parameters ---
  // Right-angled or scalene base triangle: sides a, b, c
  const [triA, setTriA] = useState<number>(6); // base leg 1 (cm)
  const [triB, setTriB] = useState<number>(8); // base leg 2 (cm)
  const [triC, setTriC] = useState<number>(10); // hypotenuse / third side (cm)
  const [triH, setTriH] = useState<number>(15); // prism length/height (cm)

  // Triangular calculations
  const triPerimeter = triA + triB + triC;
  const triS = triPerimeter / 2;
  const triHeronProd = triS * (triS - triA) * (triS - triB) * (triS - triC);
  const triBaseArea = triHeronProd > 0 ? Math.sqrt(triHeronProd) : (triA * triB) / 2;
  const triLSA = triPerimeter * triH;
  const triTSA = 2 * triBaseArea + triLSA;

  // --- Rectangular Prism Parameters ---
  const [rectL, setRectL] = useState<number>(8); // cm
  const [rectB, setRectB] = useState<number>(5); // cm
  const [rectH, setRectH] = useState<number>(12); // cm

  const rectPerimeter = 2 * (rectL + rectB);
  const rectBaseArea = rectL * rectB;
  const rectLSA = rectPerimeter * rectH; // 2h(l + b)
  const rectTSA = 2 * rectBaseArea + rectLSA; // 2(lb + bh + hl)

  // --- Cube Parameters ---
  const [cubeA, setCubeA] = useState<number>(6); // cm
  const cubePerimeter = 4 * cubeA;
  const cubeBaseArea = cubeA * cubeA;
  const cubeLSA = 4 * (cubeA * cubeA);
  const cubeTSA = 6 * (cubeA * cubeA);

  // Active Selected Values
  let curBaseArea = triBaseArea;
  let curPerimeter = triPerimeter;
  let curLSA = triLSA;
  let curTSA = triTSA;
  let curHeight = triH;

  if (shapeType === 'rectangular') {
    curBaseArea = rectBaseArea;
    curPerimeter = rectPerimeter;
    curLSA = rectLSA;
    curTSA = rectTSA;
    curHeight = rectH;
  } else if (shapeType === 'cube') {
    curBaseArea = cubeBaseArea;
    curPerimeter = cubePerimeter;
    curLSA = cubeLSA;
    curTSA = cubeTSA;
    curHeight = cubeA;
  }

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! प्रिज्मको आधारको परिमिति P, आधारको क्षेत्रफल A र लम्बाइ h बाट छड्के सतह (LSA = P × h) र कुल सतह (TSA = 2A + P × h) को हिसाब र 2D नेटको अन्वेषण गरौं!',
        'Welcome! Explore base perimeter P, base area A, height h to calculate LSA = P × h and TSA = 2A + P × h with 2D net unfolding!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Shape Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setShapeType('triangular')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              shapeType === 'triangular'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>📐</span>
            <span>{L('त्रिभुजाकार प्रिज्म', 'Triangular Prism')}</span>
          </button>
          <button
            onClick={() => setShapeType('rectangular')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              shapeType === 'rectangular'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>📦</span>
            <span>{L('आयताकार प्रिज्म', 'Rectangular Prism')}</span>
          </button>
          <button
            onClick={() => setShapeType('cube')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              shapeType === 'cube'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🧊</span>
            <span>{L('घन (Cube)', 'Cube')}</span>
          </button>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
              {L('प्रिज्मको नाप तथा नेट नियन्त्रण', 'Dimensions & Net Controls')}
            </h3>

            {/* Unfold Slider (0% 3D to 100% 2D Net) */}
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                <span>{L('2D नेट फुकाउने (Unfold to Net):', 'Unfold to 2D Net:')}</span>
                <span className="font-mono">{unfoldProgress}% ({unfoldProgress > 50 ? L('नेट खुल्यो', 'Net Opened') : L('3D ठोस', '3D Solid')})</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={unfoldProgress}
                onChange={(e) => setUnfoldProgress(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>3D solid</span>
                <span>2D net (unfolded)</span>
              </div>
            </div>

            {/* Dimension Sliders for Triangular */}
            {shapeType === 'triangular' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {L('आधारका भुजाहरू (Base Sides):', 'Base Triangle Sides:')}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-gray-500">a (cm):</label>
                    <input
                      type="number"
                      value={triA}
                      onChange={(e) => setTriA(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500">b (cm):</label>
                    <input
                      type="number"
                      value={triB}
                      onChange={(e) => setTriB(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500">c (cm):</label>
                    <input
                      type="number"
                      value={triC}
                      onChange={(e) => setTriC(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {L('प्रिज्मको लम्बाइ / उचाइ h (Height):', 'Prism Length / Height (h):')}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{triH} cm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={triH}
                    onChange={(e) => setTriH(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Dimension Sliders for Rectangular */}
            {shapeType === 'rectangular' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-gray-500">l (cm):</label>
                    <input
                      type="number"
                      value={rectL}
                      onChange={(e) => setRectL(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500">b (cm):</label>
                    <input
                      type="number"
                      value={rectB}
                      onChange={(e) => setRectB(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{L('उचाइ h (Height):', 'Height (h):')}</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{rectH} cm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={rectH}
                    onChange={(e) => setRectH(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Dimension Sliders for Cube */}
            {shapeType === 'cube' && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{L('घनको भुजा a (Edge length a):', 'Cube Edge (a):')}</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{cubeA} cm</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={cubeA}
                    onChange={(e) => setCubeA(parseInt(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Parameter Badges */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">{L('आधारको परिमिति (P):', 'Base Perimeter (P):')}</span>
                <span className="font-mono font-bold">{isNe ? toNp(curPerimeter) : curPerimeter} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{L('एक आधारको क्षेत्रफल (A):', 'Base Area (A):')}</span>
                <span className="font-mono font-bold">{isNe ? toNp(curBaseArea.toFixed(1)) : curBaseArea.toFixed(1)} cm²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{L('उचाइ / लम्बाइ (h):', 'Height / Length (h):')}</span>
                <span className="font-mono font-bold">{isNe ? toNp(curHeight) : curHeight} cm</span>
              </div>
            </div>
          </div>

          {/* Visual Display & Net / Formulas */}
          <div className="lg:col-span-7 space-y-4">
            {/* Visual Net / Solid Canvas */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[280px]">
              <svg viewBox="0 0 460 260" className="w-full max-w-lg h-64">
                {unfoldProgress < 50 ? (
                  /* 3D Solid View */
                  <g>
                    {/* Isometric 3D Solid */}
                    <polygon
                      points="120,70 60,200 180,200"
                      className="fill-emerald-400/80 stroke-emerald-700 stroke-2"
                    />
                    <polygon
                      points="120,70 260,30 320,160 180,200"
                      className="fill-amber-200/50 stroke-amber-500 stroke-1"
                    />
                    <polygon
                      points="60,200 180,200 320,160 200,160"
                      className="fill-amber-300/60 stroke-amber-600 stroke-1"
                    />
                    <polygon
                      points="260,30 200,160 320,160"
                      className="fill-emerald-300/50 stroke-emerald-600 stroke-2"
                    />
                    <text x="120" y="160" textAnchor="middle" className="text-xs font-black fill-emerald-950 dark:fill-white">
                      {L('आधार (Base A)', 'Base A')}
                    </text>
                    <text x="240" y="115" textAnchor="middle" className="text-xs font-black fill-amber-900 dark:fill-amber-100">
                      {L('छड्के सतह (LSA)', 'Lateral Face')}
                    </text>
                  </g>
                ) : (
                  /* 2D Unfolded Net View */
                  <g>
                    {/* Lateral Faces unfolded into a single large rectangle (P x h) */}
                    {/* Face 1 */}
                    <rect x="60" y="90" width="80" height="80" className="fill-amber-200/70 stroke-amber-600 stroke-1" />
                    <text x="100" y="135" textAnchor="middle" className="text-xs font-bold fill-amber-900">
                      a × h
                    </text>

                    {/* Face 2 */}
                    <rect x="140" y="90" width="100" height="80" className="fill-amber-300/70 stroke-amber-600 stroke-1" />
                    <text x="190" y="135" textAnchor="middle" className="text-xs font-bold fill-amber-900">
                      b × h
                    </text>

                    {/* Face 3 */}
                    <rect x="240" y="90" width="120" height="80" className="fill-amber-200/70 stroke-amber-600 stroke-1" />
                    <text x="300" y="135" textAnchor="middle" className="text-xs font-bold fill-amber-900">
                      c × h
                    </text>

                    {/* Top Base Triangle attached to Face 2 */}
                    <polygon points="140,90 240,90 190,25" className="fill-emerald-300/80 stroke-emerald-700 stroke-2" />
                    <text x="190" y="65" textAnchor="middle" className="text-xs font-black fill-emerald-950">
                      {L('आधार 1 (Base 1)', 'Base 1')}
                    </text>

                    {/* Bottom Base Triangle attached to Face 2 */}
                    <polygon points="140,170 240,170 190,235" className="fill-emerald-300/80 stroke-emerald-700 stroke-2" />
                    <text x="190" y="200" textAnchor="middle" className="text-xs font-black fill-emerald-950">
                      {L('आधार 2 (Base 2)', 'Base 2')}
                    </text>

                    {/* Label for entire LSA rectangle */}
                    <text x="210" y="250" textAnchor="middle" className="text-xs font-black fill-amber-700">
                      {L('कुल छड्के सतह (LSA) = (a + b + c) × h = P × h', 'Total LSA Rectangle = P × h')}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3 text-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                {L('चरणबद्ध क्षेत्रफल हिसाब (Formulas & Step Breakdown)', 'Calculations Breakdown')}
              </h4>

              {/* 1. LSA */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    {L('1. छड्के सतहको क्षेत्रफल (LSA = P × h):', '1. Lateral Surface Area (LSA = P × h):')}
                  </span>
                  <span className="text-base font-black text-amber-700 dark:text-amber-300 font-mono">
                    {isNe ? toNp(curLSA.toFixed(1)) : curLSA.toFixed(1)} cm²
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  LSA = {curPerimeter} cm × {curHeight} cm = {curLSA.toFixed(1)} cm²
                </div>
              </div>

              {/* 2. Bases Area */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    {L('2. दुई आधारको क्षेत्रफल (2 × Base Area):', '2. Area of Two Bases (2 × A):')}
                  </span>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">
                    {isNe ? toNp((2 * curBaseArea).toFixed(1)) : (2 * curBaseArea).toFixed(1)} cm²
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  2 × {curBaseArea.toFixed(1)} cm² = {(2 * curBaseArea).toFixed(1)} cm²
                </div>
              </div>

              {/* 3. TSA */}
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900 dark:text-blue-200 text-base">
                    {L('3. कुल सतहको क्षेत्रफल (TSA = 2A + LSA):', '3. Total Surface Area (TSA = 2A + LSA):')}
                  </span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                    {isNe ? toNp(curTSA.toFixed(1)) : curTSA.toFixed(1)} cm²
                  </span>
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-300 font-mono">
                  TSA = {(2 * curBaseArea).toFixed(1)} + {curLSA.toFixed(1)} = {curTSA.toFixed(1)} cm²
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default PrismSurfaceAreaLaboratory;
