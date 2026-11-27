import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS = [
  {
    np: 'बेलना (Cylinder) को वक्र सतहको क्षेत्रफल (Curved Surface Area - CSA) को सूत्र के हो?',
    en: 'What is the formula for the Curved Surface Area (CSA) of a cylinder?',
    options: [
      { key: 'A', label: '२πrh (2πrh = वृत्तको परिधि × उचाइ)' },
      { key: 'B', label: 'πr²h' },
      { key: 'C', label: '२πr(r + h)' },
      { key: 'D', label: 'πrl' },
    ],
    answer: 'A',
  },
  {
    np: 'बेलनाको वक्र सतहलाई काटेर समतलमा फुकाउँदा कुन ज्यामितीय आकार बन्छ?',
    en: 'When the curved surface of a cylinder is unrolled onto a plane, what geometric shape is formed?',
    options: [
      { key: 'A', label: 'वृत्त (Circle)' },
      { key: 'B', label: 'आयात (Rectangle with length = 2πr, breadth = h)' },
      { key: 'C', label: 'त्रिभुज (Triangle)' },
      { key: 'D', label: 'समलम्ब (Trapezium)' },
    ],
    answer: 'B',
  },
  {
    np: 'बेलनाको कुल सतहको क्षेत्रफल (Total Surface Area - TSA) को सूत्र के हो?',
    en: 'What is the formula for the Total Surface Area (TSA) of a cylinder?',
    options: [
      { key: 'A', label: 'TSA = २πrh' },
      { key: 'B', label: 'TSA = २πr(r + h) [दुई वृत्ताकार आधार + वक्र सतह]' },
      { key: 'C', label: 'TSA = πr²h' },
      { key: 'D', label: 'TSA = ४πr²' },
    ],
    answer: 'B',
  },
  {
    np: '७ सेमि अर्धव्यास (r) र १० सेमि उचाइ (h) भएको बेलनाको वक्र सतहको क्षेत्रफल (CSA) कति हुन्छ? (π = २२/७)',
    en: 'What is the CSA of a cylinder with radius 7 cm and height 10 cm? (π = 22/7)',
    options: [
      { key: 'A', label: '२२० वर्ग सेमि' },
      { key: 'B', label: '४४० वर्ग सेमि (२ × २२/७ × ७ × १० = ४४०)' },
      { key: 'C', label: '७४८ वर्ग सेमि' },
      { key: 'D', label: '१,५४० वर्ग सेमि' },
    ],
    answer: 'B',
  },
];

export const InteractiveCylinderExplorer: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U7-01',
    chapter: 7,
    titleNp: 'अन्तरक्रियात्मक बेलना अन्वेषक',
    titleEn: 'Interactive Cylinder Explorer',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [inputMode, setInputMode] = useState<'radius' | 'diameter'>('radius');
  const [radiusCm, setRadiusCm] = useState<number>(7);
  const [heightCm, setHeightCm] = useState<number>(14);
  const [unfoldProgress, setUnfoldProgress] = useState<number>(0); // 0% = cylinder, 100% = net (rectangle + 2 circles)
  const [highlightPart, setHighlightPart] = useState<'all' | 'csa' | 'bases'>('all');

  // When in diameter mode:
  const diameterCm = radiusCm * 2;

  // Exact math with π = 22/7 for CDC textbook style, and float display
  const pi = 22 / 7;
  const baseAreaOne = pi * radiusCm * radiusCm;
  const baseCircumference = 2 * pi * radiusCm;
  const csa = 2 * pi * radiusCm * heightCm;
  const twoBasesArea = 2 * baseAreaOne;
  const tsa = csa + twoBasesArea; // 2 * pi * radius * (radius + height)

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! बेलना (Cylinder) को अर्धव्यास r, उचाइ h, वक्र सतह CSA = २πrh, २D नेटमा आयत र कुल सतह TSA = २πr(r + h) अन्वेषण गरौं!',
        'Welcome! Explore cylinder radius, height, curved surface area (CSA = 2πrh), rectangle unfolding, and TSA = 2πr(r + h)!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Top Control Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setHighlightPart('all')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              highlightPart === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {L('कुल बेलना (Full Cylinder)', 'Full Cylinder')}
          </button>
          <button
            onClick={() => setHighlightPart('csa')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              highlightPart === 'csa'
                ? 'bg-amber-600 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {L('वक्र सतह (Curved Surface)', 'Curved Surface')}
          </button>
          <button
            onClick={() => setHighlightPart('bases')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              highlightPart === 'bases'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {L('दुई वृत्ताकार आधार (2 Bases)', '2 Circular Bases')}
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Left */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                {L('बेलनाको नाप नियन्त्रण', 'Cylinder Dimensions')}
              </h3>
              {/* Radius / Diameter Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 text-xs font-bold">
                <button
                  onClick={() => setInputMode('radius')}
                  className={`px-2 py-1 rounded-md ${inputMode === 'radius' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  {L('अर्धव्यास (r)', 'Radius (r)')}
                </button>
                <button
                  onClick={() => setInputMode('diameter')}
                  className={`px-2 py-1 rounded-md ${inputMode === 'diameter' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  {L('व्यास (d)', 'Diameter (d)')}
                </button>
              </div>
            </div>

            {/* Radius or Diameter Slider */}
            {inputMode === 'radius' ? (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {L('अर्धव्यास r (Radius):', 'Radius (r):')}
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {isNe ? toNp(radiusCm) : radiusCm} cm (d = {isNe ? toNp(diameterCm) : diameterCm} cm)
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="21"
                  step="1"
                  value={radiusCm}
                  onChange={(e) => setRadiusCm(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {L('व्यास d (Diameter):', 'Diameter (d):')}
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {isNe ? toNp(diameterCm) : diameterCm} cm (r = {isNe ? toNp(radiusCm) : radiusCm} cm)
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="42"
                  step="2"
                  value={diameterCm}
                  onChange={(e) => setRadiusCm(parseInt(e.target.value) / 2)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            )}

            {/* Height Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {L('उचाइ h (Height):', 'Height (h):')}
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {isNe ? toNp(heightCm) : heightCm} cm
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Quick Equilateral Preset (r = h) */}
            <div className="flex gap-2">
              <button
                onClick={() => { setRadiusCm(7); setHeightCm(10); }}
                className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-bold rounded-lg text-left"
              >
                r=7, h=10
              </button>
              <button
                onClick={() => { setRadiusCm(7); setHeightCm(14); }}
                className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-bold rounded-lg text-left"
              >
                r=7, h=14 (2r=h)
              </button>
              <button
                onClick={() => { setRadiusCm(10); setHeightCm(10); }}
                className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-bold rounded-lg text-left"
              >
                r=h=10
              </button>
            </div>

            {/* Net Unfolding Slider */}
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                <span>{L('वक्र सतहलाई आयतमा फुकाउने:', 'Unfold Curved Surface to Rectangle:')}</span>
                <span className="font-mono">{unfoldProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={unfoldProgress}
                onChange={(e) => setUnfoldProgress(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="text-[11px] text-purple-700 dark:text-purple-300">
                {L('वक्र सतह फुकाउँदा बन्ने आयतको लम्बाइ = वृत्तको परिधि (२πr) र चौडाइ = उचाइ (h) हुन्छ।', 'Unfolded rectangle length = Circumference (2πr) and breadth = Height (h).')}
              </div>
            </div>
          </div>

          {/* Visual Display & Derivation Right */}
          <div className="lg:col-span-7 space-y-4">
            {/* SVG Visual Canvas */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[300px]">
              <svg viewBox="0 0 480 280" className="w-full max-w-lg h-64">
                {unfoldProgress < 50 ? (
                  /* 3D Cylinder View */
                  <g>
                    {/* Top Base Ellipse */}
                    <ellipse
                      cx="240"
                      cy="60"
                      rx="90"
                      ry="28"
                      className={`transition-all duration-300 ${
                        highlightPart === 'bases' || highlightPart === 'all'
                          ? 'fill-emerald-300/80 stroke-emerald-600 stroke-2'
                          : 'fill-gray-200 stroke-gray-400'
                      }`}
                    />

                    {/* Cylinder Body (Curved Surface) */}
                    <rect
                      x="150"
                      y="60"
                      width="180"
                      height="150"
                      className={`transition-all duration-300 ${
                        highlightPart === 'csa' || highlightPart === 'all'
                          ? 'fill-amber-200/50 dark:fill-amber-900/30 stroke-amber-500 stroke-1'
                          : 'fill-gray-100 stroke-gray-300'
                      }`}
                    />

                    {/* Bottom Base Ellipse */}
                    <ellipse
                      cx="240"
                      cy="210"
                      rx="90"
                      ry="28"
                      className={`transition-all duration-300 ${
                        highlightPart === 'bases' || highlightPart === 'all'
                          ? 'fill-emerald-400/80 stroke-emerald-700 stroke-2'
                          : 'fill-gray-300 stroke-gray-500'
                      }`}
                    />

                    {/* Side Edges */}
                    <line x1="150" y1="60" x2="150" y2="210" className="stroke-amber-600 stroke-2" />
                    <line x1="330" y1="60" x2="330" y2="210" className="stroke-amber-600 stroke-2" />

                    {/* Radius Dimension on Top Ellipse */}
                    <line x1="240" y1="60" x2="330" y2="60" className="stroke-blue-600 stroke-2" />
                    <circle cx="240" cy="60" r="3" className="fill-blue-600" />
                    <text x="285" y="52" textAnchor="middle" className="text-xs font-bold fill-blue-700 dark:fill-blue-300 font-mono">
                      r = {radiusCm} cm
                    </text>

                    {/* Height Dimension on Right */}
                    <line x1="355" y1="60" x2="355" y2="210" className="stroke-purple-600 stroke-2 stroke-dasharray-4" strokeDasharray="4 4" />
                    <text x="375" y="140" className="text-xs font-bold fill-purple-700 dark:fill-purple-300 font-mono">
                      h = {heightCm} cm
                    </text>

                    {/* Body Center Label */}
                    <text x="240" y="140" textAnchor="middle" className="text-sm font-black fill-amber-900 dark:fill-amber-200">
                      {L('वक्र सतह (CSA)', 'Curved Surface')}
                    </text>
                  </g>
                ) : (
                  /* 2D Unfolded Net View: Large Rectangle + 2 Circles */
                  <g>
                    {/* Top Circle Base */}
                    <circle cx="240" cy="45" r="32" className="fill-emerald-300/80 stroke-emerald-700 stroke-2" />
                    <text x="240" y="49" textAnchor="middle" className="text-[10px] font-black fill-emerald-950">
                      πr²
                    </text>

                    {/* Unfolded Rectangle (CSA) */}
                    <rect x="70" y="90" width="340" height="100" className="fill-amber-200/70 dark:fill-amber-900/40 stroke-amber-600 stroke-2" />
                    <text x="240" y="145" textAnchor="middle" className="text-xs font-black fill-amber-950 dark:fill-amber-100">
                      {L('वक्र सतह = लम्बाइ × चौडाइ = २πr × h', 'Curved Surface Area = 2πr × h')}
                    </text>

                    {/* Length indicator (Circumference = 2πr) */}
                    <text x="240" y="82" textAnchor="middle" className="text-xs font-bold fill-blue-700 dark:fill-blue-300 font-mono">
                      {L('लम्बाइ', 'Length')} = २πr ≈ {baseCircumference.toFixed(1)} cm
                    </text>

                    {/* Breadth indicator (Height = h) */}
                    <text x="420" y="145" textAnchor="start" className="text-xs font-bold fill-purple-700 dark:fill-purple-300 font-mono">
                      b = h = {heightCm} cm
                    </text>

                    {/* Bottom Circle Base */}
                    <circle cx="240" cy="235" r="32" className="fill-emerald-400/80 stroke-emerald-700 stroke-2" />
                    <text x="240" y="239" textAnchor="middle" className="text-[10px] font-black fill-emerald-950">
                      πr²
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Step-by-Step Mathematical Derivation */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3 text-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                {L('सूत्र व्युत्पत्ति तथा चरणबद्ध हिसाब', 'Formulas & Step-by-Step Derivation')}
              </h4>

              {/* 1. Base Area and Circumference */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    {L('१. वृत्ताकार आधार (Circular Base):', '1. Circular Base:')}
                  </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    A = πr² ≈ {baseAreaOne.toFixed(1)} cm²
                  </span>
                </div>
                <div className="text-gray-500 font-mono">
                  परिधि (Circumference) = २πr = २ × (२२/७) × {radiusCm} = {baseCircumference.toFixed(1)} cm
                </div>
              </div>

              {/* 2. CSA */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    {L('२. वक्र सतहको क्षेत्रफल (CSA = २πrh):', '2. Curved Surface Area (CSA = 2πrh):')}
                  </span>
                  <span className="text-base font-black text-amber-700 dark:text-amber-300 font-mono">
                    {isNe ? toNp(csa.toFixed(1)) : csa.toFixed(1)} cm²
                  </span>
                </div>
                <div className="text-gray-500 font-mono">
                  CSA = २ × (२२/७) × {radiusCm} × {heightCm} = {csa.toFixed(1)} cm²
                </div>
              </div>

              {/* 3. TSA */}
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900 dark:text-blue-200 text-base">
                    {L('३. कुल सतहको क्षेत्रफल (TSA = २πr(r + h)):', '3. Total Surface Area (TSA = 2πr(r + h)):')}
                  </span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                    {isNe ? toNp(tsa.toFixed(1)) : tsa.toFixed(1)} cm²
                  </span>
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-300 font-mono">
                  TSA = CSA + २ × आधारको क्षेत्रफल = {csa.toFixed(1)} + {twoBasesArea.toFixed(1)} = {tsa.toFixed(1)} cm²
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default InteractiveCylinderExplorer;
