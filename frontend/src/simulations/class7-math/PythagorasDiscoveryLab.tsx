/**
 * PythagorasDiscoveryLab.tsx
 * Grade 7 Mathematics – Lesson 14: PLANE FIGURES (समतलीय आकृतिहरू)
 * Simulation 3: Pythagoras Discovery and Geometric Proof Lab (पाइथागोरस साध्य प्रयोगशाला)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 223-230)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Calculator, Check, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'समकोणी त्रिभुज (Right-angled Triangle) मा ९०° को विपरित सबैभन्दा लामो भुजालाई के भनिन्छ?',
    en: 'In a right-angled triangle, what is the longest side opposite to the 90° angle called?',
    options: [
      { key: 'A', label: 'कर्ण (Hypotenuse - h)' },
      { key: 'B', label: 'लम्ब (Perpendicular - p)' },
      { key: 'C', label: 'आधार (Base - b)' },
      { key: 'D', label: 'विकर्ण' },
    ],
    answer: 'A',
  },
  {
    np: 'पाइथागोरस साध्य (Pythagoras Theorem) को सम्बन्ध कुन हो?',
    en: 'Which is the correct formula for Pythagoras Theorem?',
    options: [
      { key: 'A', label: 'h² = p² + b²' },
      { key: 'B', label: 'h = p + b' },
      { key: 'C', label: 'h² = p² - b²' },
      { key: 'D', label: 'h² = 2(p + b)' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि समकोणी त्रिभुजमा आधार (b) = ३ सेमी र लम्ब (p) = ४ सेमी भए कर्ण (h) कति हुन्छ?',
    en: 'If base = 3 cm and perpendicular = 4 cm, what is the hypotenuse h? (√(3² + 4²))',
    options: [
      { key: 'A', label: '५ सेमी (√(९ + १६) = √२५ = ५)' },
      { key: 'B', label: '७ सेमी' },
      { key: 'C', label: '६ सेमी' },
      { key: 'D', label: '१२ सेमी' },
    ],
    answer: 'A',
  },
  {
    np: 'कुन त्रिक (Triplet) ले समकोणी त्रिभुज बनाउँछ?',
    en: 'Which triplet forms a right-angled triangle?',
    options: [
      { key: 'A', label: '५, १२, १३ (५² + १२² = १३²)' },
      { key: 'B', label: '४, ५, ६' },
      { key: 'C', label: '२, ३, ४' },
      { key: 'D', label: '३, ४, ८' },
    ],
    answer: 'A',
  },
];

type LabTab = 'visual_proof' | 'solver' | 'triplet_tester';

export const PythagorasDiscoveryLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L14-03',
    chapter: 14,
    titleNp: 'पाइथागोरस साध्य प्रयोगशाला (Pythagoras Discovery Lab)',
    titleEn: 'Pythagoras Discovery Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [tab, setTab] = useState<LabTab>('visual_proof');

  // Interactive base and perpendicular values
  const [pVal, setPVal] = useState<number>(3);
  const [bVal, setBVal] = useState<number>(4);

  // Unknown Side Solver States
  const [solveTarget, setSolveTarget] = useState<'h' | 'p' | 'b'>('h');
  const [solverP, setSolverP] = useState<number>(12);
  const [solverB, setSolverB] = useState<number>(5);
  const [solverH, setSolverH] = useState<number>(13);

  // Triplet Tester Inputs
  const [side1, setSide1] = useState<number>(8);
  const [side2, setSide2] = useState<number>(15);
  const [side3, setSide3] = useState<number>(17);

  const hSquared = pVal * pVal + bVal * bVal;
  const hVal = Math.sqrt(hSquared);

  // Triplet logic
  const sides = [side1, side2, side3].sort((x, y) => x - y);
  const isTriplet = sides[0] * sides[0] + sides[1] * sides[1] === sides[2] * sides[2];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते साथीहरू! कर्णमा बनेको वर्गको क्षेत्रफल = लम्ब र आधारमा बनेका वर्गहरूको योगफल (h² = p² + b²) प्रत्यक्ष हेरौँ!',
        'Hello friends! Explore the visual geometric square proof of Pythagoras Theorem (h² = p² + b²) interactively!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'visual_proof', np: '१. तीन वर्गको ज्यामितीय प्रमाण (Geometric Square Proof)', en: '1. Geometric Square Proof' },
            { id: 'solver', np: '२. अज्ञात भुजा क्यालकुलेटर (Unknown Side Solver)', en: '2. Unknown Side Solver' },
            { id: 'triplet_tester', np: '३. पाइथागोरस त्रिक परीक्षण (Pythagorean Triplets)', en: '3. Pythagorean Triplets' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as LabTab)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                tab === item.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? item.np : item.en}
            </button>
          ))}
        </div>

        {/* Tab 1: Geometric Square Proof */}
        {tab === 'visual_proof' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
              <h3 className="text-lg font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L('पाइथागोरस साध्य (Pythagoras Theorem):', 'Pythagoras Theorem Statement:')}
              </h3>
              <p className="text-slate-700 text-sm mt-1">
                {L(
                  'कुनै पनि समकोणी त्रिभुजमा कर्ण (Hypotenuse) मा बनेको वर्गको क्षेत्रफल बाँकी दुई भुजाहरू (लम्ब र आधार) मा बनेका वर्गहरूको क्षेत्रफलको योगफलसँग बराबर हुन्छ अर्थात् h² = p² + b²।',
                  'In any right-angled triangle, the area of the square on the hypotenuse is equal to the sum of the areas of the squares on the other two sides: h² = p² + b².'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Dynamic SVG with 3 squares */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="340" height="300" viewBox="0 0 340 300">
                  {/* Right triangle at (120, 180) */}
                  {/* Origin O at (120, 180). Right angle at (120, 180). */}
                  {/* Perpendicular goes up to (120, 180 - pVal*20) */}
                  {/* Base goes right to (120 + bVal*20, 180) */}
                  {(() => {
                    const scale = 22;
                    const ox = 120;
                    const oy = 180;
                    const px = ox;
                    const py = oy - pVal * scale;
                    const bx = ox + bVal * scale;
                    const by = oy;

                    const pLen = pVal * scale;
                    const bLen = bVal * scale;

                    return (
                      <>
                        {/* Square on Perpendicular (left of p) */}
                        <rect
                          x={ox - pLen}
                          y={py}
                          width={pLen}
                          height={pLen}
                          fill="rgba(59, 130, 246, 0.3)"
                          stroke="#2563eb"
                          strokeWidth="2"
                        />
                        <text
                          x={ox - pLen / 2}
                          y={py + pLen / 2 + 5}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill="#1d4ed8"
                        >
                          p² = {pVal * pVal}
                        </text>

                        {/* Square on Base (below b) */}
                        <rect
                          x={ox}
                          y={oy}
                          width={bLen}
                          height={bLen}
                          fill="rgba(16, 185, 129, 0.3)"
                          stroke="#059669"
                          strokeWidth="2"
                        />
                        <text
                          x={ox + bLen / 2}
                          y={oy + bLen / 2 + 5}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill="#047857"
                        >
                          b² = {bVal * bVal}
                        </text>

                        {/* Triangle ABC */}
                        <polygon
                          points={`${ox},${oy} ${px},${py} ${bx},${by}`}
                          fill="rgba(245, 158, 11, 0.4)"
                          stroke="#d97706"
                          strokeWidth="3"
                        />

                        {/* Right angle marker at (ox, oy) */}
                        <path
                          d={`M ${ox} ${oy - 14} L ${ox + 14} ${oy - 14} L ${ox + 14} ${oy}`}
                          fill="none"
                          stroke="#b45309"
                          strokeWidth="2"
                        />

                        {/* Hypotenuse label */}
                        <text
                          x={(px + bx) / 2 + 10}
                          y={(py + by) / 2 - 5}
                          fontSize="12"
                          fontWeight="bold"
                          fill="#dc2626"
                        >
                          h = {hVal % 1 === 0 ? hVal : hVal.toFixed(2)}
                        </text>
                      </>
                    );
                  })()}
                </svg>
                <div className="text-xs text-slate-500 mt-2 text-center">
                  {L('चित्र: लम्ब, आधार र कर्णमा बनेका वर्गहरूको तुलना', 'Visual comparison of squares on p, b, and h')}
                </div>
              </div>

              {/* Controls and Math Proof Box */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <label className="text-xs font-bold text-blue-900 block mb-1">
                    {L(`लम्ब (Perpendicular p): ${toNp(pVal)} एकाइ`, `Perpendicular (p): ${pVal} units`)}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={pVal}
                    onChange={(e) => setPVal(Number(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <label className="text-xs font-bold text-emerald-900 block mb-1">
                    {L(`आधार (Base b): ${toNp(bVal)} एकाइ`, `Base (b): ${bVal} units`)}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={bVal}
                    onChange={(e) => setBVal(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Calculation breakdown */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('पाइथागोरस सूत्र अनुसार हिसाब:', 'Pythagorean Verification:')}
                  </div>
                  <div className="text-sm text-slate-700">
                    p² = {toNp(pVal)}² = <span className="font-bold text-blue-600">{toNp(pVal * pVal)}</span>
                  </div>
                  <div className="text-sm text-slate-700">
                    b² = {toNp(bVal)}² = <span className="font-bold text-emerald-600">{toNp(bVal * bVal)}</span>
                  </div>
                  <div className="text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                    h² = p² + b² = {toNp(pVal * pVal)} + {toNp(bVal * bVal)} ={' '}
                    <span className="text-rose-600">{toNp(hSquared)}</span>
                  </div>
                  <div className="text-base font-black text-rose-700">
                    h = √{toNp(hSquared)} = {toNp(hVal % 1 === 0 ? hVal : hVal.toFixed(2))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Unknown Side Solver */}
        {tab === 'solver' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <h3 className="text-lg font-bold text-indigo-950" style={{ fontFamily: FONT_NP }}>
                {L('अज्ञात भुजा पत्ता लगाउने विधि (Calculate Unknown Side):', 'Find Any Unknown Side:')}
              </h3>
              <p className="text-xs text-indigo-800 mt-1">
                {L(
                  'यदि कुनै दुई भुजाको नाप थाहा छ भने पाइथागोरस सूत्र प्रयोग गरी तेस्रो भुजा सजिलै निकाल्न सकिन्छ।',
                  'Given any two sides of a right triangle, calculate the third side using the Pythagorean theorem.'
                )}
              </p>
            </div>

            {/* Target selector */}
            <div className="flex gap-2 justify-center">
              {[
                { id: 'h', labelNp: 'कर्ण (h) पत्ता लगाउने: h = √(p² + b²)', labelEn: 'Find Hypotenuse (h)' },
                { id: 'p', labelNp: 'लम्ब (p) पत्ता लगाउने: p = √(h² - b²)', labelEn: 'Find Perpendicular (p)' },
                { id: 'b', labelNp: 'आधार (b) पत्ता लगाउने: b = √(h² - p²)', labelEn: 'Find Base (b)' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSolveTarget(item.id as 'h' | 'p' | 'b')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    solveTarget === item.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isNe ? item.labelNp : item.labelEn}
                </button>
              ))}
            </div>

            {/* Interactive Inputs and Live Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                {solveTarget === 'h' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {L('लम्ब (p) सेमी:', 'Perpendicular (p) cm:')}
                      </label>
                      <input
                        type="number"
                        value={solverP}
                        onChange={(e) => setSolverP(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {L('आधार (b) सेमी:', 'Base (b) cm:')}
                      </label>
                      <input
                        type="number"
                        value={solverB}
                        onChange={(e) => setSolverB(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-xl font-bold"
                      />
                    </div>
                  </>
                )}

                {solveTarget === 'p' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {L('कर्ण (h) सेमी (सबैभन्दा ठूलो):', 'Hypotenuse (h) cm (largest):')}
                      </label>
                      <input
                        type="number"
                        value={solverH}
                        onChange={(e) => setSolverH(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {L('आधार (b) सेमी:', 'Base (b) cm:')}
                      </label>
                      <input
                        type="number"
                        value={solverB}
                        onChange={(e) => setSolverB(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-xl font-bold"
                      />
                    </div>
                  </>
                )}

                {solveTarget === 'b' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {L('कर्ण (h) सेमी:', 'Hypotenuse (h) cm:')}
                      </label>
                      <input
                        type="number"
                        value={solverH}
                        onChange={(e) => setSolverH(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {L('लम्ब (p) सेमी:', 'Perpendicular (p) cm:')}
                      </label>
                      <input
                        type="number"
                        value={solverP}
                        onChange={(e) => setSolverP(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-xl font-bold"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Step-by-Step Calculation Result */}
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-3">
                <div className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  {L('चरणबद्ध समाधान (Step-by-Step Solution):', 'Step-by-Step Solution:')}
                </div>

                {solveTarget === 'h' && (() => {
                  const hCalcSq = solverP * solverP + solverB * solverB;
                  const resH = Math.sqrt(hCalcSq);
                  return (
                    <div className="text-sm text-slate-800 space-y-1.5">
                      <div>सूत्र: h² = p² + b²</div>
                      <div>h² = {solverP}² + {solverB}² = {solverP * solverP} + {solverB * solverB} = {hCalcSq}</div>
                      <div className="text-lg font-black text-emerald-900 pt-2 border-t border-emerald-200">
                        कर्ण (h) = √{hCalcSq} = {toNp(resH % 1 === 0 ? resH : resH.toFixed(2))} सेमी
                      </div>
                    </div>
                  );
                })()}

                {solveTarget === 'p' && (() => {
                  const pCalcSq = solverH * solverH - solverB * solverB;
                  const resP = pCalcSq > 0 ? Math.sqrt(pCalcSq) : 0;
                  return (
                    <div className="text-sm text-slate-800 space-y-1.5">
                      <div>सूत्र: p² = h² - b²</div>
                      <div>p² = {solverH}² - {solverB}² = {solverH * solverH} - {solverB * solverB} = {pCalcSq}</div>
                      <div className="text-lg font-black text-emerald-900 pt-2 border-t border-emerald-200">
                        लम्ब (p) = √{pCalcSq} = {toNp(resP % 1 === 0 ? resP : resP.toFixed(2))} सेमी
                      </div>
                    </div>
                  );
                })()}

                {solveTarget === 'b' && (() => {
                  const bCalcSq = solverH * solverH - solverP * solverP;
                  const resB = bCalcSq > 0 ? Math.sqrt(bCalcSq) : 0;
                  return (
                    <div className="text-sm text-slate-800 space-y-1.5">
                      <div>सूत्र: b² = h² - p²</div>
                      <div>b² = {solverH}² - {solverP}² = {solverH * solverH} - {solverP * solverP} = {bCalcSq}</div>
                      <div className="text-lg font-black text-emerald-900 pt-2 border-t border-emerald-200">
                        आधार (b) = √{bCalcSq} = {toNp(resB % 1 === 0 ? resB : resB.toFixed(2))} सेमी
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Pythagorean Triplets */}
        {tab === 'triplet_tester' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl">
              <h3 className="text-lg font-bold text-amber-950" style={{ fontFamily: FONT_NP }}>
                {L('पाइथागोरस त्रिक परीक्षण (Pythagorean Triplet Tester):', 'Pythagorean Triplet Test:')}
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                {L(
                  'पाठ्यपुस्तक अनुसार: यदि दुई साना भुजाहरूको वर्गको जोड सबैभन्दा ठूलो भुजाको वर्गसँग बराबर हुन्छ भने ती संख्याहरूले समकोणी त्रिभुज बनाउँछन्।',
                  'CDC Rule: If the sum of squares of two smaller numbers equals the square of the largest number, they form a right triangle.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Inputs */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <div className="text-sm font-bold text-slate-800">
                  {L('तीन संख्याहरू प्रविष्ट गर्नुहोस्:', 'Enter 3 Numbers:')}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={side1}
                    onChange={(e) => setSide1(Number(e.target.value))}
                    className="p-3 border rounded-xl text-center font-bold text-lg"
                  />
                  <input
                    type="number"
                    value={side2}
                    onChange={(e) => setSide2(Number(e.target.value))}
                    className="p-3 border rounded-xl text-center font-bold text-lg"
                  />
                  <input
                    type="number"
                    value={side3}
                    onChange={(e) => setSide3(Number(e.target.value))}
                    className="p-3 border rounded-xl text-center font-bold text-lg"
                  />
                </div>

                {/* Preset quick buttons from CDC textbook */}
                <div className="pt-2">
                  <div className="text-xs text-slate-500 mb-1.5 font-semibold">
                    {L('पाठ्यपुस्तकका उदाहरणहरू थिचेर हेर्नुहोस्:', 'Try Textbook Examples:')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { s: [3, 4, 5], label: '३, ४, ५' },
                      { s: [5, 12, 13], label: '५, १२, १३' },
                      { s: [8, 15, 17], label: '८, १५, १७' },
                      { s: [12, 10, 5], label: '१२, १०, ५ (गलत/No)' },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSide1(item.s[0]);
                          setSide2(item.s[1]);
                          setSide3(item.s[2]);
                        }}
                        className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-indigo-700 hover:bg-indigo-50"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verification Output */}
              <div
                className={`p-5 rounded-2xl border ${
                  isTriplet
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-rose-50 border-rose-300'
                } space-y-3`}
              >
                <div className="text-base font-bold flex items-center gap-2">
                  {isTriplet ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span className="text-emerald-900">
                        {L('यो पाइथागोरस त्रिक हो! (Forms a Right Triangle)', 'Yes! This is a Pythagorean Triplet.')}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-rose-600 text-xl font-bold">✕</span>
                      <span className="text-rose-900">
                        {L('यो समकोणी त्रिभुज बन्दैन! (Not a Right Triangle)', 'No! Does NOT form a Right Triangle.')}
                      </span>
                    </>
                  )}
                </div>

                <div className="text-xs md:text-sm text-slate-700 space-y-1">
                  <div>साना भुजाहरूको वर्गको जोड: {sides[0]}² + {sides[1]}² = {sides[0] * sides[0]} + {sides[1] * sides[1]} = <b>{sides[0] * sides[0] + sides[1] * sides[1]}</b></div>
                  <div>ठूलो भुजाको वर्ग: {sides[2]}² = <b>{sides[2] * sides[2]}</b></div>
                  <div className="pt-2 font-bold">
                    {isTriplet
                      ? `✓ ${sides[0] * sides[0] + sides[1] * sides[1]} = ${sides[2] * sides[2]} (बराबर भएकोले समकोणी त्रिभुज बन्छ)`
                      : `✕ ${sides[0] * sides[0] + sides[1] * sides[1]} ≠ ${sides[2] * sides[2]} (बराबर नभएकोले समकोणी त्रिभुज बन्दैन)`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default PythagorasDiscoveryLab;
