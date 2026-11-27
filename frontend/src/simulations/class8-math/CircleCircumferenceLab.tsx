/**
 * CircleCircumferenceLab.tsx
 * Grade 8 Mathematics – Unit 8: AREA AND VOLUME
 * Simulation 2: Circle and Circumference Discovery Lab
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 8)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Circle, Compass, Scissors, Award, CheckCircle, RefreshCw, Ruler, RotateCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'वृत्तको परिधि (C) र व्यास (d) बीचको अनुपात (C/d) लाई के भनिन्छ?',
    en: 'What is the ratio of circumference (C) to diameter (d) called?',
    options: [
      { key: 'A', label: 'π (Pi ≈ 22/7 or 3.14)' },
      { key: 'B', label: 'Radius' },
      { key: 'C', label: 'Area' },
      { key: 'D', label: '2π' },
    ],
    answer: 'A',
  },
  {
    np: 'वृत्तको क्षेत्रफल 5,544 sq cm (π = 22/7) भए यसको Radius (r) कति हुन्छ?',
    en: 'If the area of a circle is 5,544 cm² (π = 22/7), what is its radius (r)?',
    options: [
      { key: 'A', label: '42 cm [ r = √(5544 × 7 ÷ 22) = √1764 = 42 ]' },
      { key: 'B', label: '36 cm' },
      { key: 'C', label: '49 cm' },
      { key: 'D', label: '21 cm' },
    ],
    answer: 'A',
  },
  {
    np: 'कागज काटेर वृत्तका खण्डहरूलाई एकापसमा मिलाउँदा बन्ने समानान्तर चतुर्भुजको आधार कति हुन्छ?',
    en: 'When circle sectors are rearranged in the paper-cutting activity, what is the base of the resulting shape?',
    options: [
      { key: 'A', label: 'Half circumference (πr)' },
      { key: 'B', label: 'Full circumference (2πr)' },
      { key: 'C', label: 'Radius (r)' },
      { key: 'D', label: 'Diameter (2r)' },
    ],
    answer: 'A',
  },
  {
    np: 'व्यास d = 14 cm भएको वृत्तको परिधि कति हुन्छ (π = 22/7)?',
    en: 'What is the circumference of a circle with diameter d = 14 cm (π = 22/7)?',
    options: [
      { key: 'A', label: '44 cm [ C = πd = 22/7 × 14 = 44 ]' },
      { key: 'B', label: '88 cm' },
      { key: 'C', label: '154 cm' },
      { key: 'D', label: '28 cm' },
    ],
    answer: 'A',
  },
  {
    np: 'परिधि C = 88 cm भएको वृत्तको क्षेत्रफल कति हुन्छ (π = 22/7)?',
    en: 'If the circumference is C = 88 cm, what is the area of the circle (π = 22/7)?',
    options: [
      { key: 'A', label: '616 sq cm [ r = 14 ⇒ A = 22/7 × 14² = 616 ]' },
      { key: 'B', label: '308 sq cm' },
      { key: 'C', label: '528 sq cm' },
      { key: 'D', label: '1,232 sq cm' },
    ],
    answer: 'A',
  },
];

const REAL_OBJECTS = [
  { nameNp: 'साइकलको पाङ्ग्रा (Bicycle Wheel)', nameEn: 'Bicycle Wheel', r: 35 },
  { nameNp: 'भित्ते घडी (Wall Clock)', nameEn: 'Wall Clock', r: 14 },
  { nameNp: 'गोलाकार पोखरी (Circular Pond)', nameEn: 'Circular Pond', r: 21 },
  { nameNp: 'खाना खाने थाल (Dinner Plate)', nameEn: 'Dinner Plate', r: 10.5 },
];

export const CircleCircumferenceLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U8-02',
    chapter: 8,
    titleNp: 'वृत्त, परिधि र क्षेत्रफल (Circle & Circumference Lab)',
    titleEn: 'Circle and Circumference Discovery Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'radius_pi' | 'sector_derivation' | 'reverse_solver' | 'challenge'>('radius_pi');

  // Interactive radius
  const [radius, setRadius] = useState<number>(14);
  const diameter = radius * 2;
  const PI = 22 / 7;
  const circumference = 2 * PI * radius;
  const area = PI * radius * radius;

  // Sector cutting animation state (0 = intact circle, 1 = exploded, 2 = aligned into parallelogram)
  const [sectorStep, setSectorStep] = useState<number>(0);
  const numSectors = 12;

  // Reverse Solver inputs
  const [givenArea, setGivenArea] = useState<number>(5544);
  const calculatedRadiusFromArea = Math.sqrt((givenArea * 7) / 22);
  const calculatedCircumferenceFromArea = 2 * PI * calculatedRadiusFromArea;

  // Challenge State
  const [chalIndex, setChalIndex] = useState<number>(0);
  const [userChalAns, setUserChalAns] = useState<string>('');
  const [chalResult, setChalResult] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  const CHALLENGES = [
    {
      qNp: 'एउटा गोलाकार पोखरीको अर्धव्यास 21 m छ। यसको वरिपरि 1 फन्को लगाउँदा कति दूरी पार हुन्छ (परिधि C पत्ता लगाउनुहोस्, π = 22/7)?',
      qEn: 'A circular pond has radius 21 m. Find the distance around 1 round (circumference C, π = 22/7).',
      ans: 2 * (22 / 7) * 21, // 132 m
      unit: 'm',
      formula: 'C = 2πr = 2 × (22/7) × 21 = 132 m',
    },
    {
      qNp: 'एउटा वृत्तको क्षेत्रफल 616 sq cm भए यसको Radius (r) कति हुन्छ?',
      qEn: 'If the area of a circle is 616 cm², what is its radius (r)?',
      ans: Math.sqrt((616 * 7) / 22), // 14 cm
      unit: 'cm',
      formula: 'r = √(A/π) = √(616 × 7 ÷ 22) = √196 = 14 cm',
    },
  ];

  const handleCheckChallenge = () => {
    const cur = CHALLENGES[chalIndex];
    const val = parseFloat(userChalAns);
    if (Math.abs(val - cur.ans) < 0.5) {
      kit.good();
      setChalResult({
        isCorrect: true,
        msg: L(`उत्कृष्ट! सही उत्तर: ${toNp(cur.ans.toFixed(1))} ${cur.unit}`, `Brilliant! Correct: ${cur.ans.toFixed(1)} ${cur.unit}`),
      });
    } else {
      kit.oops();
      setChalResult({
        isCorrect: false,
        msg: L(`प्रयास गर्नुहोस्! सूत्र: ${cur.formula}`, `Try again! Hint: ${cur.formula}`),
      });
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! वृत्तको परिधि र व्यासको अनुपात सधैं अचर हुन्छ जसलाई π भनिन्छ। आउनुहोस् वृत्तलाई काटेर आयत बनाऔं र क्षेत्रफल पत्ता लगाऔं!',
        'Hello! The ratio of circumference to diameter is always constant (π). Let us discover how cutting sectors reveals the area formula A = πr²!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('radius_pi')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'radius_pi' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Circle className="w-4 h-4" />
            {L('1. अर्धव्यास, परिधि र π (Radius & Pi)', '1. Radius, Circumference & Pi')}
          </button>
          <button
            onClick={() => setActiveTab('sector_derivation')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'sector_derivation' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Scissors className="w-4 h-4" />
            {L('2. खण्डीकरणबाट क्षेत्रफल प्रतिपादन (Area Derivation)', '2. Area Derivation Activity')}
          </button>
          <button
            onClick={() => setActiveTab('reverse_solver')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'reverse_solver' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            {L('3. क्षेत्रफलबाट अर्धव्यास (Reverse Solver)', '3. Reverse Solver (CDC 5544 cm²)')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'challenge' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            {L('4. वृत्त चुनौती (CDC Challenge)', '4. CDC Challenge')}
          </button>
        </div>

        {/* Tab 1: Radius, Circumference & Pi Discovery */}
        {activeTab === 'radius_pi' && (
          <div className="space-y-6">
            {/* Real Object Presets */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-600">{L('व्यावहारिक गोलाकार वस्तुहरू:', 'Real-World Objects:')}</span>
              {REAL_OBJECTS.map((obj, idx) => (
                <button
                  key={idx}
                  onClick={() => setRadius(obj.r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    radius === obj.r
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  {isNe ? obj.nameNp : obj.nameEn}
                </button>
              ))}
            </div>

            {/* Interactive Visual Circle Display */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Dynamic SVG Circle */}
              <div className="w-full h-64 bg-slate-800 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                <svg viewBox="0 0 260 260" className="w-full h-full">
                  {/* Outer circle */}
                  <circle
                    cx="130"
                    cy="130"
                    r={Math.min(100, Math.max(30, radius * 3.5))}
                    fill="rgba(99, 102, 241, 0.25)"
                    stroke="#818cf8"
                    strokeWidth="3"
                  />
                  {/* Centre point */}
                  <circle cx="130" cy="130" r="4" fill="#fbbf24" />
                  <text x="135" y="125" fill="#fbbf24" fontSize="10" fontWeight="bold">O (Centre)</text>

                  {/* Radius line */}
                  <line
                    x1="130"
                    y1="130"
                    x2={130 + Math.min(100, Math.max(30, radius * 3.5))}
                    y2="130"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                  <text
                    x={130 + Math.min(50, radius * 1.7)}
                    y="122"
                    fill="#34d399"
                    fontSize="11"
                    fontWeight="black"
                    textAnchor="middle"
                  >
                    r = {toNp(radius)}
                  </text>

                  {/* Diameter full line */}
                  <line
                    x1={130 - Math.min(100, Math.max(30, radius * 3.5))}
                    y1="130"
                    x2={130 + Math.min(100, Math.max(30, radius * 3.5))}
                    y2="130"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />

                  {/* Circumference boundary indicator */}
                  <text x="130" y="245" fill="#a5b4fc" fontSize="10" textAnchor="middle" fontWeight="bold">
                    {L('परिधि (Circumference C = 2πr)', 'Circumference C = 2πr')}
                  </text>
                </svg>
              </div>

              {/* Pi Constant Verification & Stats */}
              <div className="space-y-4">
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">{L('व्यास (Diameter d = 2r):', 'Diameter (d):')}</span>
                    <span className="text-lg font-bold text-amber-400">{toNp(diameter)} cm</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">{L('परिधि (Circumference C = 2πr):', 'Circumference (C):')}</span>
                    <span className="text-lg font-bold text-sky-400">{toNp(circumference.toFixed(2))} cm</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">{L('क्षेत्रफल (Area A = πr²):', 'Area (A = πr²):')}</span>
                    <span className="text-xl font-black text-emerald-400">{toNp(area.toFixed(2))} cm²</span>
                  </div>

                  {/* Pi ratio box */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-indigo-500/40 text-xs font-mono">
                    <div className="text-amber-400 font-bold">{L('π को खोजी (Discovering π = C ÷ d):', 'Discovering π = C ÷ d:')}</div>
                    <div className="mt-1 text-slate-300">
                      {toNp(circumference.toFixed(2))} ÷ {toNp(diameter)} = <b className="text-emerald-400 text-sm">≈ {toNp((circumference / diameter).toFixed(4))} (22/7 or 3.14)</b>
                    </div>
                  </div>
                </div>

                {/* Slider */}
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {L('अर्धव्यास परिवर्तन गर्नुहोस् (Change Radius r):', 'Change Radius (r):')} {toNp(radius)} cm
                  </label>
                  <input
                    type="range"
                    min="7"
                    max="42"
                    step="3.5"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sector Rearrangement Derivation */}
        {activeTab === 'sector_derivation' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('कागज काटेर वृत्तको क्षेत्रफल निकाल्ने विधि (CDC Paper-Cutting Derivation)', 'Paper-Cutting Area Derivation')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'वृत्तलाई धेरै ओटा बराबर खण्डहरूमा काटेर एकापसमा मिलाउँदा एउटा समानान्तर चतुर्भुज/आयत बन्छ।',
                    'Dividing a circle into small equal sectors and interleaving them forms an approximate rectangle/parallelogram.'
                  )}
                </p>
              </div>

              {/* Interactive Step Switcher */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setSectorStep(0)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    sectorStep === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {L('1. वृत्त र 12 खण्डहरू', '1. Intact Circle (12 Sectors)')}
                </button>
                <button
                  onClick={() => setSectorStep(1)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    sectorStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {L('2. खण्डहरू छुट्याउने', '2. Separating Sectors')}
                </button>
                <button
                  onClick={() => setSectorStep(2)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    sectorStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {L('3. समानान्तर चतुर्भुज बनाउने', '3. Parallelogram Formed')}
                </button>
              </div>

              {/* Graphic Display */}
              <div className="w-full h-64 bg-slate-900 rounded-3xl p-4 flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 320 200" className="w-full h-full">
                  {sectorStep === 0 && (
                    <g transform="translate(160, 100)">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const startAngle = (i * 30 * Math.PI) / 180;
                        const endAngle = ((i + 1) * 30 * Math.PI) / 180;
                        const r = 70;
                        const x1 = r * Math.cos(startAngle);
                        const y1 = r * Math.sin(startAngle);
                        const x2 = r * Math.cos(endAngle);
                        const y2 = r * Math.sin(endAngle);
                        const color = i % 2 === 0 ? '#6366f1' : '#10b981';
                        return (
                          <path
                            key={i}
                            d={`M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                            fill={color}
                            stroke="#1e1b4b"
                            strokeWidth="1.5"
                          />
                        );
                      })}
                      <circle cx="0" cy="0" r="3" fill="#fff" />
                    </g>
                  )}

                  {sectorStep === 1 && (
                    <g>
                      <text x="160" y="40" fill="#f59e0b" fontSize="12" textAnchor="middle" fontWeight="bold">
                        {L('खण्डहरूलाई आलोपालो रंग लगाउने र काट्ने', 'Coloring alternate sectors in blue and green')}
                      </text>
                      <g transform="translate(60, 70)">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <polygon key={i} points={`${i * 34},60 ${i * 34 + 17},10 ${i * 34 + 34},60`} fill="#6366f1" stroke="#fff" />
                        ))}
                      </g>
                      <g transform="translate(77, 120)">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <polygon key={i} points={`${i * 34},10 ${i * 34 + 17},60 ${i * 34 + 34},10`} fill="#10b981" stroke="#fff" />
                        ))}
                      </g>
                    </g>
                  )}

                  {sectorStep === 2 && (
                    <g transform="translate(50, 50)">
                      {/* Interlocked Parallelogram */}
                      <rect x="20" y="20" width="180" height="70" fill="rgba(255,255,255,0.05)" stroke="#f59e0b" strokeDasharray="4,4" />
                      {Array.from({ length: 6 }).map((_, i) => (
                        <g key={i}>
                          <polygon points={`${20 + i * 30},90 ${35 + i * 30},20 ${50 + i * 30},90`} fill="#6366f1" stroke="#fff" strokeWidth="0.8" />
                          <polygon points={`${35 + i * 30},20 ${50 + i * 30},90 ${65 + i * 30},20`} fill="#10b981" stroke="#fff" strokeWidth="0.8" />
                        </g>
                      ))}
                      {/* Dimension labels */}
                      <line x1="20" y1="105" x2="200" y2="105" stroke="#38bdf8" strokeWidth="2" />
                      <text x="110" y="122" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">
                        आधार (Base) = आधा परिधि = πr
                      </text>
                      <line x1="10" y1="20" x2="10" y2="90" stroke="#f59e0b" strokeWidth="2" />
                      <text x="5" y="60" fill="#f59e0b" fontSize="11" textAnchor="end" fontWeight="bold">
                        उचाइ = r
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Mathematical Proof Card */}
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 text-sm space-y-2 text-indigo-950 font-mono">
                <div className="font-bold text-base text-indigo-900 font-sans">{L('गणितीय प्रतिपादन निष्कर्ष:', 'Derivation Proof:')}</div>
                <div>1. Base of the parallelogram = half the circumference = (2πr) ÷ 2 = <b>πr</b></div>
                <div>2. Height of the parallelogram = radius of the circle = <b>r</b></div>
                <div className="text-base text-emerald-800 font-bold pt-2 border-t border-indigo-200 font-sans">
                  3. Area = base × height = πr × r = <span className="text-2xl text-emerald-700">πr²</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reverse Solver */}
        {activeTab === 'reverse_solver' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('क्षेत्रफलबाट अर्धव्यास पत्ता लगाउने विधि (CDC पाठ्यपुस्तक उदाहरण)', 'Finding Radius from Area (CDC Example)')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'पाठ्यपुस्तक उदाहरण: वृत्तको क्षेत्रफल 5,544 sq cm भए अर्धव्यास र परिधि कति हुन्छ?',
                    'CDC Example: Area = 5,544 cm², find radius and circumference using π = 22/7.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {L('वृत्तको क्षेत्रफल (Area A in cm²):', 'Circle Area (A in cm²):')}
                  </label>
                  <input
                    type="number"
                    value={givenArea}
                    onChange={(e) => setGivenArea(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 border rounded-xl font-bold text-indigo-700 text-lg"
                  />
                  <div className="flex gap-2 mt-2">
                    {[154, 616, 1386, 5544].map((v) => (
                      <button
                        key={v}
                        onClick={() => setGivenArea(v)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        {toNp(v)} cm²
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 font-mono text-xs">
                  <div className="text-amber-400 font-bold uppercase">{L('चरणबद्ध समाधान:', 'Step-by-Step Working:')}</div>
                  <div>1. Formula: A = πr² ⇒ {toNp(givenArea)} = (22/7) × r²</div>
                  <div>2. r² = ({toNp(givenArea)} × 7) ÷ 22 = {toNp((givenArea * 7 / 22).toFixed(1))}</div>
                  <div className="text-emerald-400 text-base font-bold font-sans">
                    3. Radius r = √{toNp((givenArea * 7 / 22).toFixed(0))} = <b>{toNp(calculatedRadiusFromArea.toFixed(1))} cm</b>
                  </div>
                  <div className="text-sky-300 font-sans">
                    4. Circumference C = 2πr = 2 × (22/7) × {toNp(calculatedRadiusFromArea.toFixed(1))} = <b>{toNp(calculatedCircumferenceFromArea.toFixed(1))} cm</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Challenge */}
        {activeTab === 'challenge' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {L(`वृत्त समस्या ${toNp(chalIndex + 1)} / ${toNp(CHALLENGES.length)}`, `Circle Problem ${chalIndex + 1} of ${CHALLENGES.length}`)}
                </h3>
                <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold">
                  {L('अभ्यास परीक्षण', 'Practice Lab')}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-200">
                {isNe ? CHALLENGES[chalIndex].qNp : CHALLENGES[chalIndex].qEn}
              </div>

              <div className="max-w-xs">
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {L('तपाईंको उत्तर:', 'Your Answer:')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={userChalAns}
                    onChange={(e) => setUserChalAns(e.target.value)}
                    placeholder={L('मान लेख्नुहोस्...', 'Enter value...')}
                    className="w-full px-4 py-2 border rounded-xl font-bold text-slate-800"
                  />
                  <span className="text-sm font-bold text-slate-500 whitespace-nowrap">{CHALLENGES[chalIndex].unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCheckChallenge}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> {L('उत्तर जाँच्नुहोस्', 'Check Answer')}
                </button>
                <button
                  onClick={() => {
                    setChalIndex((prev) => (prev + 1) % CHALLENGES.length);
                    setUserChalAns('');
                    setChalResult(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> {L('अर्को प्रश्न', 'Next Problem')}
                </button>
              </div>

              {chalResult && (
                <div
                  className={`p-4 rounded-2xl text-sm font-semibold ${
                    chalResult.isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {chalResult.msg}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default CircleCircumferenceLab;
