import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS = [
  {
    np: 'बेलनाको आयतन (Volume of a Cylinder) को सूत्र के हो?',
    en: 'What is the formula for the volume of a cylinder?',
    options: [
      { key: 'A', label: 'V = πr²h' },
      { key: 'B', label: 'V = 2πrh' },
      { key: 'C', label: 'V = 2πr(r + h)' },
      { key: 'D', label: 'V = 4/3 πr³' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि एउटा बेलनाकार पानी ट्याङ्कीको अर्धव्यास 1 m र उचाइ 1.4 m छ भने यसमा कति litres पानी अटाउँछ? (π = 22/7)',
    en: 'If a cylindrical water tank has radius 1m and height 1.4m, what is its capacity in liters? (π = 22/7)',
    options: [
      { key: 'A', label: '4,400 litres (V = 22/7 × 1² × 1.4 = 4.4 m³ = 4,400 L)' },
      { key: 'B', label: '2,200 litres' },
      { key: 'C', label: '1,400 litres' },
      { key: 'D', label: '8,800 litres' },
    ],
    answer: 'A',
  },
  {
    np: 'बेलनाको आयतन V र उचाइ h दिइएको भए आधारको क्षेत्रफल (Base Area A) कसरी निकालिन्छ?',
    en: 'Given cylinder volume V and height h, how is the base area A calculated?',
    options: [
      { key: 'A', label: 'A = V × h' },
      { key: 'B', label: 'A = V / h' },
      { key: 'C', label: 'A = √(V / h)' },
      { key: 'D', label: 'A = V - h' },
    ],
    answer: 'B',
  },
  {
    np: 'यदि बेलनाको अर्धव्यासलाई दोब्बर (Double) बनाइयो र उचाइ उही राखियो भने आयतन कति गुणा बढ्छ?',
    en: 'If the radius of a cylinder is doubled while keeping height constant, how many times does volume increase?',
    options: [
      { key: 'A', label: '2 times' },
      { key: 'B', label: '4 times (since it is r², 2² = 4 times)' },
      { key: 'C', label: '8 times' },
      { key: 'D', label: 'No change' },
    ],
    answer: 'B',
  },
];

export const CylinderVolumeWaterTankLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U7-02',
    chapter: 7,
    titleNp: 'बेलनाको आयतन तथा पानी ट्याङ्की प्रयोगशाला',
    titleEn: 'Cylinder Volume and Water Tank Laboratory',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'tank' | 'compare' | 'reverse'>('tank');

  // --- Tank Parameters (in meters) ---
  const [tankRadiusM, setTankRadiusM] = useState<number>(0.7); // 70 cm = 0.7m
  const [tankHeightM, setTankHeightM] = useState<number>(2.0); // 2m
  const [waterFillPct, setWaterFillPct] = useState<number>(75); // %

  const pi = 22 / 7;
  const baseAreaSqM = pi * tankRadiusM * tankRadiusM;
  const totalVolumeCubicM = baseAreaSqM * tankHeightM;
  const totalCapacityLiters = Math.round(totalVolumeCubicM * 1000);
  const currentLiters = Math.round((totalCapacityLiters * waterFillPct) / 100);
  const currentWaterHeightM = (tankHeightM * (waterFillPct / 100)).toFixed(2);

  // --- Container Comparison State (Container A vs Container B) ---
  const [tankARadius, setTankARadius] = useState<number>(0.5);
  const [tankAHeight, setTankAHeight] = useState<number>(2.0);
  const [tankBRadius, setTankBRadius] = useState<number>(1.0);
  const [tankBHeight, setTankBHeight] = useState<number>(0.5);

  const volA_m3 = pi * tankARadius * tankARadius * tankAHeight;
  const volB_m3 = pi * tankBRadius * tankBRadius * tankBHeight;
  const volA_liters = Math.round(volA_m3 * 1000);
  const volB_liters = Math.round(volB_m3 * 1000);

  // --- Reverse Solver State ---
  const [givenVolLiters, setGivenVolLiters] = useState<number>(6160);
  const [givenHeightM, setGivenHeightM] = useState<number>(1.0);

  const reverseVolM3 = givenVolLiters / 1000;
  const reverseBaseArea = givenHeightM > 0 ? reverseVolM3 / givenHeightM : 0;
  const reverseRadiusM = Math.sqrt(reverseBaseArea / pi);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! बेलनाको आयतन V = πr²h, पानी ट्याङ्कीको litres क्षमता (1 m³ = 1,000 litres) र भाँडाहरूको क्षमता तुलना गरौं!',
        'Welcome! Explore cylinder volume V = πr²h, water tank capacity in liters (1 m³ = 1,000 L), and container comparisons!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('tank')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'tank'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🚰</span>
            <span>{L('1. बेलनाकार ट्याङ्की', '1. Cylindrical Tank')}</span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>⚖️</span>
            <span>{L('2. दुई भाँडाको तुलना', '2. Container Comparison')}</span>
          </button>
          <button
            onClick={() => setActiveTab('reverse')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'reverse'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🔍</span>
            <span>{L('3. उल्टो हिसाब (Reverse)', '3. Reverse Solver')}</span>
          </button>
        </div>

        {activeTab === 'tank' && (
          /* =========================================================================
             CYLINDRICAL WATER TANK
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <span>🚰</span>
                <span>{L('बेलनाकार पानी ट्याङ्कीको आयतन तथा litres क्षमता', 'Cylinder Volume & Water Capacity')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'बेलनाको आयतन = आधारको क्षेत्रफल × उचाइ (V = πr²h)। 1 cu m (m³) = 1,000 litres पानी र 1 litres = 1,000 घन सेन्टिm (cm³) हुन्छ।',
                  'Cylinder Volume = Base Area × Height (V = πr²h). 1 cubic meter (m³) equals 1,000 liters of water.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('ट्याङ्कीको नाप नियन्त्रण', 'Tank Dimensions')}
                </h3>

                {/* Radius */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {L('अर्धव्यास r (Radius):', 'Radius (r):')}
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {tankRadiusM} m ({Math.round(tankRadiusM * 100)} cm)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="2.5"
                    step="0.05"
                    value={tankRadiusM}
                    onChange={(e) => setTankRadiusM(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Height */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {L('उचाइ h (Height):', 'Height (h):')}
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {tankHeightM} m ({Math.round(tankHeightM * 100)} cm)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.1"
                    value={tankHeightM}
                    onChange={(e) => setTankHeightM(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Water Level Slider */}
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-cyan-900 dark:text-cyan-200">
                    <span>{L('पानीको स्तर (Water Level):', 'Water Fill Level:')}</span>
                    <span className="font-mono">{waterFillPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={waterFillPct}
                    onChange={(e) => setWaterFillPct(parseInt(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-cyan-800 dark:text-cyan-300 font-mono">
                    <span>{L('पानीको उचाइ:', 'Water Height:')} {currentWaterHeightM} m</span>
                    <span>{L('हालको पानी:', 'Current Water:')} {isNe ? toNp(currentLiters) : currentLiters.toLocaleString()} L</span>
                  </div>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => { setTankRadiusM(0.7); setTankHeightM(1.0); }}
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 font-bold text-left"
                  >
                    r=0.7m, h=1m (1,540 L)
                  </button>
                  <button
                    onClick={() => { setTankRadiusM(0.7); setTankHeightM(2.0); }}
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 font-bold text-left"
                  >
                    r=0.7m, h=2m (3,080 L)
                  </button>
                  <button
                    onClick={() => { setTankRadiusM(1.0); setTankHeightM(1.4); }}
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 font-bold text-left"
                  >
                    r=1.0m, h=1.4m (4,400 L)
                  </button>
                  <button
                    onClick={() => { setTankRadiusM(1.4); setTankHeightM(1.0); }}
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 font-bold text-left"
                  >
                    r=1.4m, h=1m (6,160 L)
                  </button>
                </div>
              </div>

              {/* 3D Visualizer & Results Right */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[300px]">
                  <svg viewBox="0 0 440 280" className="w-full max-w-lg h-64">
                    {/* Tank Outer Outline */}
                    <ellipse cx="220" cy="50" rx="90" ry="25" className="fill-cyan-50/40 stroke-cyan-500 stroke-2" />
                    <line x1="130" y1="50" x2="130" y2="220" className="stroke-cyan-500 stroke-2" />
                    <line x1="310" y1="50" x2="310" y2="220" className="stroke-cyan-500 stroke-2" />
                    <ellipse cx="220" cy="220" rx="90" ry="25" className="fill-cyan-100/50 stroke-cyan-600 stroke-2" />

                    {/* Water Level */}
                    {(() => {
                      const totalH = 170; // 220 - 50
                      const waterH = totalH * (waterFillPct / 100);
                      const topY = 220 - waterH;

                      return (
                        <>
                          {/* Water Column Body */}
                          <rect x="130" y={topY} width="180" height={waterH} className="fill-blue-400/70 transition-all duration-300" />
                          {/* Water Surface Ellipse */}
                          <ellipse cx="220" cy={topY} rx="90" ry="25" className="fill-blue-300/80 stroke-blue-400 stroke-1 transition-all duration-300" />
                          {/* Water Bottom Ellipse */}
                          <ellipse cx="220" cy="220" rx="90" ry="25" className="fill-blue-500/70 stroke-blue-600 stroke-1" />
                        </>
                      );
                    })()}

                    {/* Center Text inside water */}
                    <text x="220" y="195" textAnchor="middle" className="text-base font-black fill-white drop-shadow font-mono">
                      {isNe ? toNp(currentLiters) : currentLiters.toLocaleString()} L
                    </text>
                  </svg>
                </div>

                {/* Calculation Cards */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">{L('आधारको क्षेत्रफल (Base Area A = πr²):', 'Base Area (A = πr²):')}</div>
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
                      {baseAreaSqM.toFixed(2)} m²
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      (22/7) × {tankRadiusM}²
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">{L('कुल ट्याङ्की क्षमता (Total Capacity):', 'Total Capacity:')}</div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {isNe ? toNp(totalCapacityLiters) : totalCapacityLiters.toLocaleString()} L
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 font-mono">
                      {totalVolumeCubicM.toFixed(2)} m³ × 1,000
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          /* =========================================================================
             CONTAINER COMPARISON (CONTAINER A VS CONTAINER B)
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-2">
                <span>⚖️</span>
                <span>{L('दुई बेलनाकार भाँडाहरूको क्षमता तुलना', 'Compare Two Cylindrical Containers')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'अर्धव्यास दोब्बर गर्दा आयतन 4 गुणा बढ्छ तर उचाइ दोब्बर गर्दा आयतन 2 times मात्र बढ्छ (किनकि V = πr²h मा r को वर्ग हुन्छ)। दुई भाँडाहरूको तुलना गरी कुनमा बढी पानी अटाउँछ परीक्षण गर्नुहोस्।',
                  'Doubling the radius quadruples the volume, whereas doubling the height only doubles it (since r is squared in V = πr²h).'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Container A */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-blue-200 dark:border-blue-800 space-y-3">
                <h3 className="font-bold text-blue-900 dark:text-blue-300 border-b pb-2">
                  {L('भाँडो क (Container A): अग्लो तर पातलो', 'Container A: Tall & Thin')}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-600 dark:text-gray-400 font-semibold">r_A (m):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tankARadius}
                      onChange={(e) => setTankARadius(parseFloat(e.target.value) || 0.1)}
                      className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 dark:text-gray-400 font-semibold">h_A (m):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tankAHeight}
                      onChange={(e) => setTankAHeight(parseFloat(e.target.value) || 0.1)}
                      className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl space-y-1">
                  <div className="text-xs text-gray-500">{L('आयतन र क्षमता:', 'Volume & Capacity:')}</div>
                  <div className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                    {volA_m3.toFixed(2)} m³ ({isNe ? toNp(volA_liters) : volA_liters.toLocaleString()} L)
                  </div>
                </div>
              </div>

              {/* Container B */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-emerald-200 dark:border-emerald-800 space-y-3">
                <h3 className="font-bold text-emerald-900 dark:text-emerald-300 border-b pb-2">
                  {L('भाँडो ख (Container B): होचो तर फराकिलो', 'Container B: Short & Wide')}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-600 dark:text-gray-400 font-semibold">r_B (m):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tankBRadius}
                      onChange={(e) => setTankBRadius(parseFloat(e.target.value) || 0.1)}
                      className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 dark:text-gray-400 font-semibold">h_B (m):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tankBHeight}
                      onChange={(e) => setTankBHeight(parseFloat(e.target.value) || 0.1)}
                      className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-1">
                  <div className="text-xs text-gray-500">{L('आयतन र क्षमता:', 'Volume & Capacity:')}</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {volB_m3.toFixed(2)} m³ ({isNe ? toNp(volB_liters) : volB_liters.toLocaleString()} L)
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Verdict */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border text-center">
              <span className="text-base font-black text-gray-800 dark:text-gray-100">
                {volA_liters > volB_liters
                  ? L(`निष्कर्ष: भाँडो 'क' मा ${toNp(volA_liters - volB_liters)} litres बढी पानी अटाउँछ।`, `Result: Container A holds ${volA_liters - volB_liters} L more water.`)
                  : volB_liters > volA_liters
                  ? L(`निष्कर्ष: भाँडो 'ख' मा ${toNp(volB_liters - volA_liters)} litres बढी पानी अटाउँछ।`, `Result: Container B holds ${volB_liters - volA_liters} L more water.`)
                  : L('निष्कर्ष: दुवै भाँडोको क्षमता बराबर छ।', 'Result: Both containers have equal capacity.')}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'reverse' && (
          /* =========================================================================
             REVERSE SOLVER
             ========================================================================= */
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/30 p-5 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                <span>🔍</span>
                <span>{L('आयतन र उचाइबाट आधारको क्षेत्रफल र अर्धव्यास निकाल्ने', 'Reverse Calculation: Find Area & Radius from Volume')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'यदि ट्याङ्कीको litres क्षमता र उचाइ थाहा छ भने: आधारको क्षेत्रफल A = V / h र अर्धव्यास r = √(A / π) हुन्छ।',
                  'Given volume V and height h: Base Area A = V / h, and Radius r = √(A / π).'
                )}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{L('दिइएको पानी क्षमता (Liters):', 'Given Volume (L):')}</label>
                  <input
                    type="number"
                    step="100"
                    value={givenVolLiters}
                    onChange={(e) => setGivenVolLiters(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{L('दिइएको उचाइ h (Meters):', 'Given Height h (m):')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={givenHeightM}
                    onChange={(e) => setGivenHeightM(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-full px-3 py-2 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{L('1. cu mमा आयतन V:', '1. Volume in m³:')}</span>
                  <span className="font-mono font-bold">{reverseVolM3.toFixed(2)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{L('2. आधारको क्षेत्रफल A = V / h:', '2. Base Area A = V / h:')}</span>
                  <span className="font-mono font-bold text-purple-700 dark:text-purple-300">{reverseBaseArea.toFixed(2)} m²</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-bold text-gray-800 dark:text-gray-100">{L('3. आधारको अर्धव्यास r = √(A / π):', '3. Radius r = √(A / π):')}</span>
                  <span className="text-xl font-mono font-black text-purple-600 dark:text-purple-400">{reverseRadiusM.toFixed(2)} m</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default CylinderVolumeWaterTankLab;
