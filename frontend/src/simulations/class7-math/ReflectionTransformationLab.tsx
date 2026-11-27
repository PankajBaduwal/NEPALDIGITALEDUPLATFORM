/**
 * ReflectionTransformationLab.tsx
 * Grade 7 Mathematics – Lesson 19: TRANSFORMATION
 * Simulation 1: Reflection and Mirror Transformation Lab
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 278-285)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { FlipHorizontal, FlipVertical, Check, Shuffle, CheckCircle2 } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'X-अक्षमा परावर्तन (Reflection about X-axis) गर्दा बिन्दु (x, y) को प्रतिबिम्ब कुन सूत्र अनुसार परिवर्तन हुन्छ?',
    en: 'Under reflection about the X-axis, what is the coordinate transformation rule for point (x, y)?',
    options: [
      { key: 'A', label: '(x, y) → (x, −y)' },
      { key: 'B', label: '(x, y) → (−x, y)' },
      { key: 'C', label: '(x, y) → (−x, −y)' },
      { key: 'D', label: '(x, y) → (y, x)' },
    ],
    answer: 'A',
  },
  {
    np: 'Y-अक्षमा परावर्तन (Reflection about Y-axis) गर्दा बिन्दु (x, y) को प्रतिबिम्ब कुन सूत्र अनुसार परिवर्तन हुन्छ?',
    en: 'Under reflection about the Y-axis, what is the coordinate transformation rule for point (x, y)?',
    options: [
      { key: 'A', label: '(x, y) → (−x, y)' },
      { key: 'B', label: '(x, y) → (x, −y)' },
      { key: 'C', label: '(x, y) → (−x, −y)' },
      { key: 'D', label: '(x, y) → (x, y)' },
    ],
    answer: 'A',
  },
  {
    np: 'बिन्दु A(4, 5) लाई X-अक्षमा परावर्तन गर्दा यसको प्रतिबिम्ब A\' को निर्देशाङ्क कति हुन्छ?',
    en: 'What is the image A\' when point A(4, 5) is reflected across the X-axis?',
    options: [
      { key: 'A', label: 'A\'(4, −5)' },
      { key: 'B', label: 'A\'(−4, 5)' },
      { key: 'C', label: 'A\'(−4, −5)' },
      { key: 'D', label: 'A\'(5, 4)' },
    ],
    answer: 'A',
  },
  {
    np: 'परावर्तन अक्षबाट वस्तुको बिन्दु र प्रतिबिम्बको बिन्दुको दूरी कस्तो हुन्छ?',
    en: 'What is the distance of the object point and image point from the reflection axis?',
    options: [
      { key: 'A', label: 'Always equal (equal perpendicular distance)' },
      { key: 'B', label: 'The image is twice as far away' },
      { key: 'C', label: 'The object is nearer' },
      { key: 'D', label: 'They are different' },
    ],
    answer: 'A',
  },
];

type RefTab = 'explore_axes' | 'polygon_reflection' | 'cdc_challenge' | 'inverse_solver';

export const ReflectionTransformationLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L19-01',
    chapter: 19,
    titleNp: 'परावर्तन र ऐना रूपान्तरण प्रयोगशाला (Reflection Lab)',
    titleEn: 'Reflection and Mirror Transformation Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [tab, setTab] = useState<RefTab>('explore_axes');

  // Interactive Point
  const [ptX, setPtX] = useState<number>(4);
  const [ptY, setPtY] = useState<number>(5);
  const [activeAxis, setActiveAxis] = useState<'x' | 'y'>('x');

  // Polygon Triangle Vertices
  const [triShape, setTriShape] = useState<[number, number][]>([
    [2, 2],
    [5, 2],
    [3, 6],
  ]);
  const [polyAxis, setPolyAxis] = useState<'x' | 'y'>('x');

  // Challenge Mode State
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userX, setUserX] = useState<string>('');
  const [userY, setUserY] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const CDC_PROBLEMS = [
    { pt: [4, 5], axis: 'x', ans: [4, -5] },
    { pt: [-3, 4], axis: 'y', ans: [3, 4] },
    { pt: [1, 2], axis: 'x', ans: [1, -2] },
    { pt: [3, 2], axis: 'y', ans: [-3, 2] },
    { pt: [-4, 4], axis: 'x', ans: [-4, -4] },
    { pt: [-2, 6], axis: 'y', ans: [2, 6] },
    { pt: [8, -7], axis: 'x', ans: [8, 7] },
    { pt: [-9, 7], axis: 'y', ans: [9, 7] },
  ];

  const currentProb = CDC_PROBLEMS[challengeIdx];

  const handleCheckChallenge = () => {
    const xVal = parseInt(userX, 10);
    const yVal = parseInt(userY, 10);
    if (isNaN(xVal) || isNaN(yVal)) return;

    if (xVal === currentProb.ans[0] && yVal === currentProb.ans[1]) {
      setFeedback(L('उत्कृष्ट! बिल्कुल सही उत्तर।', 'Excellent! Absolutely correct.'));
    } else {
      setFeedback(
        L(
          `प्रयास राम्रो! सही उत्तर (${toNp(currentProb.ans[0])}, ${toNp(currentProb.ans[1])}) हो।`,
          `Good try! The correct reflection is (${currentProb.ans[0]}, ${currentProb.ans[1]}).`
        )
      );
    }
  };

  const nextChallenge = () => {
    setChallengeIdx((challengeIdx + 1) % CDC_PROBLEMS.length);
    setUserX('');
    setUserY('');
    setFeedback(null);
  };

  // SVG grid coordinate conversions
  // Grid domain [-8, 8] x [-8, 8] -> SVG [0, 320] x [0, 320]
  const toSvgX = (x: number) => 160 + x * 18;
  const toSvgY = (y: number) => 160 - y * 18;

  // Reflected Point coordinates
  const refPtX = activeAxis === 'x' ? ptX : -ptX;
  const refPtY = activeAxis === 'x' ? -ptY : ptY;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते साथीहरू! परावर्तनमा वस्तु र यसको प्रतिबिम्ब अक्षबाट बराबर दूरीमा हुन्छन्। X-अक्ष र Y-अक्षमा परावर्तन हेरौँ!',
        'Hello friends! Under reflection, an object and its image lie at equal distance from the axis. Let us explore X and Y reflections!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'explore_axes', np: '1. अक्ष परावर्तन अन्वेषक (Explore Axes)', en: '1. Explore Axes' },
            { id: 'polygon_reflection', np: '2. त्रिभुज परावर्तन (Reflect Polygon)', en: '2. Reflect Polygons' },
            { id: 'cdc_challenge', np: '3. पाठ्यपुस्तक अभ्यास चुनौती (CDC Challenge)', en: '3. Textbook Challenge' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as RefTab)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? t.np : t.en}
            </button>
          ))}
        </div>

        {/* Tab 1: Explore Axes */}
        {tab === 'explore_axes' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L('परावर्तनका दुई मुख्य सूत्रहरू (CDC Textbook Coordinate Rules):', 'Reflection Coordinate Rules:')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs md:text-sm text-slate-800">
                <div className="bg-white p-3 rounded-xl border border-blue-200 font-bold">
                  <div>{L('1. X-अक्षमा परावर्तन (Reflection about X-axis):', '1. Reflection about X-axis:')}</div>
                  <div className="text-blue-700 text-base mt-1">(x, y) → (x, −y)</div>
                  <div className="text-[11px] text-slate-500 font-normal">x stays the same, the sign of y is reversed.</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-200 font-bold">
                  <div>{L('2. Y-अक्षमा परावर्तन (Reflection about Y-axis):', '2. Reflection about Y-axis:')}</div>
                  <div className="text-emerald-700 text-base mt-1">(x, y) → (−x, y)</div>
                  <div className="text-[11px] text-slate-500 font-normal">y stays the same, the sign of x is reversed.</div>
                </div>
              </div>
            </div>

            {/* Axis Switcher */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActiveAxis('x')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeAxis === 'x'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
                {L('X-अक्ष परावर्तन रेखा (y = 0)', 'Reflect across X-axis (y = 0)')}
              </button>
              <button
                onClick={() => setActiveAxis('y')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeAxis === 'y'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FlipVertical className="w-4 h-4" />
                {L('Y-अक्ष परावर्तन रेखा (x = 0)', 'Reflect across Y-axis (x = 0)')}
              </button>
            </div>

            {/* Grid Visual and Coordinate Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="320" height="320" viewBox="0 0 320 320">
                  {/* Grid lines */}
                  {Array.from({ length: 17 }).map((_, i) => {
                    const pos = i * 18 + 16;
                    return (
                      <g key={i}>
                        <line x1={pos} y1="16" x2={pos} y2="304" stroke="#e2e8f0" strokeWidth="1" />
                        <line x1="16" y1={pos} x2="304" y2={pos} stroke="#e2e8f0" strokeWidth="1" />
                      </g>
                    );
                  })}

                  {/* Axes */}
                  <line x1="16" y1="160" x2="304" y2="160" stroke="#334155" strokeWidth={activeAxis === 'x' ? 3.5 : 2} strokeDasharray={activeAxis === 'x' ? 'none' : 'none'} />
                  <line x1="160" y1="16" x2="160" y2="304" stroke="#334155" strokeWidth={activeAxis === 'y' ? 3.5 : 2} />

                  {/* Axis Highlight Glow */}
                  {activeAxis === 'x' && (
                    <line x1="16" y1="160" x2="304" y2="160" stroke="#3b82f6" strokeWidth="3" />
                  )}
                  {activeAxis === 'y' && (
                    <line x1="160" y1="16" x2="160" y2="304" stroke="#10b981" strokeWidth="3" />
                  )}

                  <text x="295" y="155" fontSize="11" fontWeight="bold">X</text>
                  <text x="165" y="28" fontSize="11" fontWeight="bold">Y</text>
                  <text x="150" y="172" fontSize="10" fill="#64748b">O</text>

                  {/* Perpendicular Connecting Line between Point and Image */}
                  <line
                    x1={toSvgX(ptX)}
                    y1={toSvgY(ptY)}
                    x2={toSvgX(refPtX)}
                    y2={toSvgY(refPtY)}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />

                  {/* Original Point A */}
                  <circle cx={toSvgX(ptX)} cy={toSvgY(ptY)} r="6" fill="#2563eb" />
                  <text x={toSvgX(ptX) + 8} y={toSvgY(ptY) - 6} fontSize="12" fontWeight="bold" fill="#1d4ed8">
                    A({ptX}, {ptY})
                  </text>

                  {/* Reflected Image A' */}
                  <circle cx={toSvgX(refPtX)} cy={toSvgY(refPtY)} r="6" fill="#dc2626" />
                  <text x={toSvgX(refPtX) + 8} y={toSvgY(refPtY) + 14} fontSize="12" fontWeight="bold" fill="#dc2626">
                    A'({refPtX}, {refPtY})
                  </text>
                </svg>
                <div className="text-[11px] text-slate-500 mt-2">
                  {L('रातो = प्रतिबिम्ब बिन्दु A\'', 'Blue = Object Point A | Red = Reflected Image Point A\'')}
                </div>
              </div>

              {/* Coordinate Sliders */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-blue-950">
                      {L(`बिन्दु A को x-निर्देशाङ्क: ${toNp(ptX)}`, `Point A x-coordinate: ${ptX}`)}
                    </label>
                  </div>
                  <input
                    type="range"
                    min="-7"
                    max="7"
                    value={ptX}
                    onChange={(e) => setPtX(Number(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-emerald-950">
                      {L(`बिन्दु A को y-निर्देशाङ्क: ${toNp(ptY)}`, `Point A y-coordinate: ${ptY}`)}
                    </label>
                  </div>
                  <input
                    type="range"
                    min="-7"
                    max="7"
                    value={ptY}
                    onChange={(e) => setPtY(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Calculation breakdown */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('चरणबद्ध परावर्तन हिसाब:', 'Step-by-Step Calculation:')}
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>Original point A = ({ptX}, {ptY})</div>
                    <div>Axis of reflection = {activeAxis === 'x' ? 'X-axis (y = 0)' : 'Y-अक्ष (x = 0)'}</div>
                    <div className="text-sm font-black text-indigo-700 pt-1 border-t border-slate-200">
                      Image A' = ({toNp(refPtX)}, {toNp(refPtY)})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reflect Polygon */}
        {tab === 'polygon_reflection' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-purple-950" style={{ fontFamily: FONT_NP }}>
                {L('त्रिभुजको परावर्तन (Reflection of Triangle):', 'Reflection of Triangle on Grid:')}
              </h3>
              <p className="text-xs text-purple-800 mt-1">
                {L(
                  'त्रिभुजका तीनवटै शीर्षबिन्दुहरूलाई अक्षमा परावर्तन गरी नयाँ शीर्षहरू जोड्दा त्रिभुजको दुरुस्त प्रतिबिम्ब (Congruent Image) प्राप्त हुन्छ।',
                  'Reflecting each vertex across the axis and joining them yields a congruent image triangle.'
                )}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setPolyAxis('x')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  polyAxis === 'x' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {L('X-अक्षमा परावर्तन', 'Reflect on X-axis')}
              </button>
              <button
                onClick={() => setPolyAxis('y')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  polyAxis === 'y' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {L('Y-अक्षमा परावर्तन', 'Reflect on Y-axis')}
              </button>
            </div>

            {/* SVG Visual */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
              <svg width="340" height="340" viewBox="0 0 340 340">
                {/* Axes */}
                <line x1="20" y1="170" x2="320" y2="170" stroke="#334155" strokeWidth="2.5" />
                <line x1="170" y1="20" x2="170" y2="320" stroke="#334155" strokeWidth="2.5" />
                <text x="310" y="165" fontSize="11" fontWeight="bold">X</text>
                <text x="175" y="32" fontSize="11" fontWeight="bold">Y</text>

                {(() => {
                  const sX = (x: number) => 170 + x * 18;
                  const sY = (y: number) => 170 - y * 18;

                  const origPts = triShape.map((p) => `${sX(p[0])},${sY(p[1])}`).join(' ');
                  const refPts = triShape
                    .map((p) => {
                      const rx = polyAxis === 'x' ? p[0] : -p[0];
                      const ry = polyAxis === 'x' ? -p[1] : p[1];
                      return `${sX(rx)},${sY(ry)}`;
                    })
                    .join(' ');

                  return (
                    <>
                      {/* Original Triangle */}
                      <polygon points={origPts} fill="rgba(59, 130, 246, 0.3)" stroke="#2563eb" strokeWidth="3" />
                      {/* Image Triangle */}
                      <polygon points={refPts} fill="rgba(239, 68, 68, 0.3)" stroke="#dc2626" strokeWidth="3" />

                      {/* Vertex points */}
                      {triShape.map((p, idx) => {
                        const labels = ['P', 'Q', 'R'];
                        const rx = polyAxis === 'x' ? p[0] : -p[0];
                        const ry = polyAxis === 'x' ? -p[1] : p[1];
                        return (
                          <g key={idx}>
                            <circle cx={sX(p[0])} cy={sY(p[1])} r="4" fill="#2563eb" />
                            <text x={sX(p[0]) + 5} y={sY(p[1]) - 5} fontSize="11" fontWeight="bold" fill="#1d4ed8">
                              {labels[idx]}({p[0]}, {p[1]})
                            </text>
                            <circle cx={sX(rx)} cy={sY(ry)} r="4" fill="#dc2626" />
                            <text x={sX(rx) + 5} y={sY(ry) + 12} fontSize="11" fontWeight="bold" fill="#dc2626">
                              {labels[idx]}'({rx}, {ry})
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
              <div className="text-xs text-slate-600 mt-2 text-center">
                {L('रातो △P\'Q\'R\' = प्रतिबिम्ब (Congruent/अनुरूप)', 'Blue △PQR = Object | Red △P\'Q\'R\' = Image (Congruent)')}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: CDC Challenge */}
        {tab === 'cdc_challenge' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <div>
                <h3 className="text-base font-bold text-indigo-950" style={{ fontFamily: FONT_NP }}>
                  {L('पाठ्यपुस्तक अभ्यास चुनौती (CDC Textbook Exercises):', 'CDC Coordinate Challenge:')}
                </h3>
                <p className="text-xs text-indigo-800 mt-1">
                  {L('पाठ्यपुस्तकका प्रश्नहरू हल गरी परावर्तन प्रतिबिम्बको निर्देशाङ्क लेख्नुहोस्।', 'Calculate the reflected coordinates for standard CDC textbook examples.')}
                </p>
              </div>
              <button
                onClick={nextChallenge}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
              >
                <Shuffle className="w-3.5 h-3.5" />
                {L('अर्को प्रश्न', 'Next Problem')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-3 text-center">
                <div className="text-xs font-bold uppercase text-indigo-700">
                  {currentProb.axis === 'x' ? L('X-अक्ष परावर्तन', 'X-axis Reflection') : L('Y-अक्ष परावर्तन', 'Y-axis Reflection')}
                </div>
                <div className="text-2xl font-black text-slate-800">
                  Point P = ({toNp(currentProb.pt[0])}, {toNp(currentProb.pt[1])})
                </div>
                <div className="text-sm text-slate-600">
                  {currentProb.axis === 'x'
                    ? L('यस बिन्दुलाई X-अक्षमा परावर्तन गर्दा प्रतिबिम्ब P\' कति हुन्छ?', 'What is the image P\' after reflection across the X-axis?')
                    : L('यस बिन्दुलाई Y-अक्षमा परावर्तन गर्दा प्रतिबिम्ब P\' कति हुन्छ?', 'What is the image P\' after reflection across the Y-axis?')}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {L('नयाँ x मान:', 'New x:')}
                    </label>
                    <input
                      type="number"
                      value={userX}
                      onChange={(e) => setUserX(e.target.value)}
                      placeholder="x"
                      className="w-full px-4 py-2.5 border-2 rounded-xl font-bold text-center text-lg focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {L('नयाँ y मान:', 'New y:')}
                    </label>
                    <input
                      type="number"
                      value={userY}
                      onChange={(e) => setUserY(e.target.value)}
                      placeholder="y"
                      className="w-full px-4 py-2.5 border-2 rounded-xl font-bold text-center text-lg focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCheckChallenge}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md text-sm flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {L('उत्तर जाँच गर्नुहोस् (Check Answer)', 'Check Answer')}
                </button>

                {feedback && (
                  <div
                    className={`p-4 rounded-xl text-xs font-bold ${
                      feedback.includes('उत्कृष्ट') || feedback.includes('Excellent')
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {feedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ReflectionTransformationLab;
