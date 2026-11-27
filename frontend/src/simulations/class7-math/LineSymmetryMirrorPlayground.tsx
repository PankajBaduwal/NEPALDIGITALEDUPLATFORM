/**
 * LineSymmetryMirrorPlayground.tsx
 * Grade 7 Mathematics – Lesson 18: SYMMETRY AND TESSELLATION
 * Simulation 1: Line Symmetry and Mirror Playground
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 255-263)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Eye, Check, RotateCcw, Shuffle, Sparkles, Scissors } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै चित्रलाई एउटा सीधा रेखाले ठीक दुई बराबर र खप्टिने भागमा विभाजन गर्छ भने त्यस्तो रेखालाई के भनिन्छ?',
    en: 'If a straight line divides a figure into two identical matching halves that overlap, what is the line called?',
    options: [
      { key: 'A', label: 'Axis of symmetry (line of symmetry)' },
      { key: 'B', label: 'Diagonal' },
      { key: 'C', label: 'Perpendicular' },
      { key: 'D', label: 'Diameter' },
    ],
    answer: 'A',
  },
  {
    np: 'वर्ग (Square) मा कतिpcs सममितिका अक्षहरू (Axes of Symmetry) हुन्छन्?',
    en: 'How many axes of symmetry does a square have?',
    options: [
      { key: 'A', label: '4 (2 joining midpoints of sides and 2 diagonals)' },
      { key: 'B', label: '2 pcs' },
      { key: 'C', label: '1 pcs' },
      { key: 'D', label: 'Countless' },
    ],
    answer: 'A',
  },
  {
    np: 'समबाहु त्रिभुज (Equilateral Triangle) मा कतिpcs सममितिका अक्षहरू हुन्छन्?',
    en: 'How many axes of symmetry does an equilateral triangle have?',
    options: [
      { key: 'A', label: '3 (from each vertex to the midpoint of the opposite side)' },
      { key: 'B', label: '1 pcs' },
      { key: 'C', label: '2 pcs' },
      { key: 'D', label: '4 pcs' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै पनि वृत्त (Circle) मा कतिpcs सममितिका अक्षहरू खिच्न सकिन्छ?',
    en: 'How many axes of symmetry can be drawn in a circle?',
    options: [
      { key: 'A', label: 'Infinite / Countless (Infinite diameters)' },
      { key: 'B', label: '4 pcs' },
      { key: 'C', label: '2 pcs' },
      { key: 'D', label: '1 pcs' },
    ],
    answer: 'A',
  },
];

type SymmetryTab = 'discover' | 'axes_counter' | 'mirror_complete' | 'paper_folding';

export const LineSymmetryMirrorPlayground: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L18-01',
    chapter: 18,
    titleNp: 'रेखीय सममिति र Mirror खेलमैदान (Line Symmetry Playground)',
    titleEn: 'Line Symmetry and Mirror Playground',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [tab, setTab] = useState<SymmetryTab>('discover');

  // Discover Shapes
  const [selectedShape, setSelectedShape] = useState<'butterfly' | 'leaf' | 'nepal_flag' | 'heart' | 'letter_A' | 'letter_F'>('butterfly');
  const [showMirrorLine, setShowMirrorLine] = useState<boolean>(true);

  // Axes Counter Shapes
  const [countShape, setCountShape] = useState<'square' | 'rectangle' | 'equilateral' | 'isosceles' | 'circle' | 'scalene'>('square');
  const [activeAxesIndex, setActiveAxesIndex] = useState<number>(0);

  // Paper Folding Step
  const [foldStep, setFoldStep] = useState<number>(1);

  // Grid Completion (Grid size 6x6, user clicks cells on the right to match left)
  const [leftGrid] = useState<boolean[][]>([
    [false, false, true],
    [false, true, true],
    [true, true, true],
    [true, true, false],
    [false, true, true],
    [false, false, true],
  ]);
  const [rightGrid, setRightGrid] = useState<boolean[][]>([
    [false, false, false],
    [false, false, false],
    [false, false, false],
    [false, false, false],
    [false, false, false],
    [false, false, false],
  ]);
  const [gridSuccess, setGridSuccess] = useState<boolean | null>(null);

  const toggleRightCell = (r: number, c: number) => {
    const next = rightGrid.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? !val : val))
    );
    setRightGrid(next);
    setGridSuccess(null);
  };

  const checkMirrorCompletion = () => {
    let perfect = true;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        // Reflection of left cell (r, 2 - c) on right cell (r, c)
        const expected = leftGrid[r][2 - c];
        if (rightGrid[r][c] !== expected) {
          perfect = false;
          break;
        }
      }
    }
    setGridSuccess(perfect);
  };

  const resetGrid = () => {
    setRightGrid([
      [false, false, false],
      [false, false, false],
      [false, false, false],
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ]);
    setGridSuccess(null);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते साथीहरू! आकृतिलाई दुई बराबर भागमा पट्याउँदा खप्टिने रेखा नै सममितिको अक्ष हो। आउनुहोस्, सममिति पत्ता लगाऔँ!',
        'Hello friends! When a figure folds into two matching halves along a line, that line is an axis of symmetry. Let us explore!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'discover', np: '1. सममिति खोजी (Discover Symmetry)', en: '1. Discover Symmetry' },
            { id: 'axes_counter', np: '2. Axis of symmetry गणना (Count Axes)', en: '2. Count Symmetry Axes' },
            { id: 'paper_folding', np: '3. कागज मोड्ने प्रयोग (Paper Folding)', en: '3. Paper Folding Lab' },
            { id: 'mirror_complete', np: '4. आधा चित्र पूरा गर्ने (Grid Mirror)', en: '4. Complete Half-Figure' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as SymmetryTab)}
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

        {/* Tab 1: Discover Symmetry */}
        {tab === 'discover' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
              <h3 className="text-lg font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L('सममितीय आकृति (Symmetrical Figure) को अर्थ:', 'Meaning of Symmetrical Figures:')}
              </h3>
              <p className="text-slate-700 text-sm mt-1">
                {L(
                  'यदि कुनै चित्रलाई एउटा रेखाबाट मोड्दा दायाँ र बायाँका दुवै भागहरू दुरुस्त एकअर्कामाथि खप्टिन्छन् भने सो चित्रलाई सममितीय आकृति (Symmetrical figure) र सो रेखालाई सममितिको अक्ष (Axis of symmetry) भनिन्छ।',
                  'When a figure can be folded along a straight line such that both halves match and coincide exactly, it is symmetrical, and the fold line is the axis of symmetry.'
                )}
              </p>
            </div>

            {/* Shape Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { id: 'butterfly', labelNp: 'पुतली (Butterfly)', labelEn: 'Butterfly', sym: true },
                { id: 'leaf', labelNp: 'पात (Leaf)', labelEn: 'Leaf', sym: true },
                { id: 'heart', labelNp: 'मुटु आकार (Heart)', labelEn: 'Heart Shape', sym: true },
                { id: 'letter_A', labelNp: 'अक्षर A', labelEn: 'Letter A', sym: true },
                { id: 'letter_F', labelNp: 'अक्षर F', labelEn: 'Letter F (Asymmetric)', sym: false },
                { id: 'nepal_flag', labelNp: 'नेपालको झण्डा (असममित)', labelEn: 'Nepal Flag (Asymmetric)', sym: false },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedShape(item.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedShape === item.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isNe ? item.labelNp : item.labelEn}
                </button>
              ))}
            </div>

            {/* Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="280" height="240" viewBox="0 0 280 240">
                  {/* Center O at (140, 120) */}
                  {selectedShape === 'butterfly' && (
                    <g>
                      {/* Left wing */}
                      <path
                        d="M 140 70 C 80 40 40 80 60 120 C 40 160 80 190 140 160 Z"
                        fill="rgba(147, 51, 234, 0.4)"
                        stroke="#7e22ce"
                        strokeWidth="2.5"
                      />
                      {/* Right wing (symmetric) */}
                      <path
                        d="M 140 70 C 200 40 240 80 220 120 C 240 160 200 190 140 160 Z"
                        fill="rgba(147, 51, 234, 0.4)"
                        stroke="#7e22ce"
                        strokeWidth="2.5"
                      />
                      {/* Body */}
                      <ellipse cx="140" cy="115" rx="5" ry="40" fill="#3b0764" />
                      <circle cx="140" cy="70" r="7" fill="#3b0764" />
                      {/* Antennae */}
                      <line x1="140" y1="65" x2="125" y2="45" stroke="#3b0764" strokeWidth="2" />
                      <line x1="140" y1="65" x2="155" y2="45" stroke="#3b0764" strokeWidth="2" />
                    </g>
                  )}

                  {selectedShape === 'leaf' && (
                    <g>
                      <path
                        d="M 140 40 C 70 80 80 180 140 200 C 200 180 210 80 140 40 Z"
                        fill="rgba(16, 185, 129, 0.35)"
                        stroke="#047857"
                        strokeWidth="2.5"
                      />
                      {/* Midrib */}
                      <line x1="140" y1="40" x2="140" y2="215" stroke="#065f46" strokeWidth="3" />
                      {/* Side veins */}
                      <line x1="140" y1="90" x2="105" y2="80" stroke="#065f46" strokeWidth="1.5" />
                      <line x1="140" y1="90" x2="175" y2="80" stroke="#065f46" strokeWidth="1.5" />
                      <line x1="140" y1="130" x2="100" y2="125" stroke="#065f46" strokeWidth="1.5" />
                      <line x1="140" y1="130" x2="180" y2="125" stroke="#065f46" strokeWidth="1.5" />
                    </g>
                  )}

                  {selectedShape === 'heart' && (
                    <g>
                      <path
                        d="M 140 85 C 140 50 80 40 80 90 C 80 135 140 180 140 190 C 140 180 200 135 200 90 C 200 40 140 50 140 85 Z"
                        fill="rgba(244, 63, 94, 0.4)"
                        stroke="#e11d48"
                        strokeWidth="3"
                      />
                    </g>
                  )}

                  {selectedShape === 'letter_A' && (
                    <g>
                      <polygon points="140,40 80,190 105,190 120,150 160,150 175,190 200,190" fill="none" stroke="#2563eb" strokeWidth="5" />
                      <line x1="120" y1="150" x2="160" y2="150" stroke="#2563eb" strokeWidth="5" />
                    </g>
                  )}

                  {selectedShape === 'letter_F' && (
                    <g>
                      <path d="M 100 40 L 170 40 L 170 65 L 125 65 L 125 105 L 160 105 L 160 130 L 125 130 L 125 190 L 100 190 Z" fill="rgba(239, 68, 68, 0.3)" stroke="#dc2626" strokeWidth="3" />
                    </g>
                  )}

                  {selectedShape === 'nepal_flag' && (
                    <g>
                      {/* Double pennant */}
                      <polygon points="80,40 190,110 110,110 190,190 80,190" fill="rgba(220, 38, 38, 0.3)" stroke="#1e3a8a" strokeWidth="4" />
                      <line x1="80" y1="30" x2="80" y2="210" stroke="#1e293b" strokeWidth="5" />
                    </g>
                  )}

                  {/* Mirror Line */}
                  {showMirrorLine && (
                    <>
                      <line x1="140" y1="20" x2="140" y2="220" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,4" />
                      <text x="145" y="30" fontSize="11" fontWeight="bold" fill="#dc2626">
                        {selectedShape === 'letter_F' || selectedShape === 'nepal_flag' ? 'अक्ष बन्दैन' : 'Axis of symmetry'}
                      </text>
                    </>
                  )}
                </svg>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setShowMirrorLine(!showMirrorLine)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm"
                  >
                    {showMirrorLine ? L('अक्ष रेखा लुकाउनुहोस्', 'Hide Mirror Line') : L('अक्ष रेखा देखाउनुहोस्', 'Show Mirror Line')}
                  </button>
                </div>
              </div>

              {/* Analysis Card */}
              <div className="space-y-4">
                <div
                  className={`p-5 rounded-2xl border ${
                    selectedShape === 'letter_F' || selectedShape === 'nepal_flag'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-emerald-50 border-emerald-300'
                  }`}
                >
                  <div className="text-base font-bold flex items-center gap-2">
                    {selectedShape === 'letter_F' || selectedShape === 'nepal_flag' ? (
                      <span className="text-amber-800">
                        ✕ {L('यो असममितीय आकृति (Asymmetric Figure) हो।', 'This is an Asymmetric Figure.')}
                      </span>
                    ) : (
                      <span className="text-emerald-800">
                        ✓ {L('यो सममितीय आकृति (Symmetrical Figure) हो!', 'This is a Symmetrical Figure!')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-slate-700 mt-2 leading-relaxed">
                    {selectedShape === 'butterfly' &&
                      L('पुतलीको बायाँ र दायाँ दुवै पखेटाहरू बीचको रातो धर्काबाट मोड्दा दुरुस्त खप्टिन्छन्।', 'Both butterfly wings match identically when folded along the vertical centerline.')}
                    {selectedShape === 'leaf' &&
                      L('पातको मुख्य नशा (Midrib) बाट मोड्दा दुवै आधा भाग बराबर हुन्छन्।', 'The midrib of the leaf acts as a line of symmetry.')}
                    {selectedShape === 'heart' &&
                      L('मुटु आकारको बीचको ठाडो रेखाले यसलाई दुई बराबर प्रतिविम्ब भागमा विभाजन गर्छ।', 'A vertical line through the center divides the heart into two mirror reflections.')}
                    {selectedShape === 'letter_A' &&
                      L('अंग्रेजी अक्षर A को बीचबाट ठाडो रेखा खिच्दा दुवै खुट्टा बराबर हुन्छन्।', 'Letter A has 1 vertical axis of symmetry.')}
                    {selectedShape === 'letter_F' &&
                      L('अक्षर F मा कुनै पनि यस्तो रेखा खिच्न सकिँदैन जसले दुवै भागलाई बराबर बनाओस्।', 'No straight line can divide letter F into two matching overlapping halves.')}
                    {selectedShape === 'nepal_flag' &&
                      L('नेपालको झण्डाको अद्वितीय दुई त्रिकोणीय आकारका कारण यो कुनै पनि रेखाबाट खप्टिँदैन।', 'Due to its unique double-pennant shape, the national flag of Nepal is asymmetric.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Count Symmetry Axes */}
        {tab === 'axes_counter' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <h3 className="text-base font-bold text-indigo-950" style={{ fontFamily: FONT_NP }}>
                {L('ज्यामितीय आकृतिहरूमा सममितिका अक्षहरूको संख्या:', 'Number of Axes of Symmetry in Geometrical Figures:')}
              </h3>
              <p className="text-xs text-indigo-800 mt-1">
                {L('पाठ्यपुस्तक अनुसार वर्ग, आयत, समबाहु र समद्विबाहु त्रिभुजमा Axis of symmetryहरू पत्ता लगाउनुहोस्।', 'Identify and verify all axes of symmetry for regular and irregular shapes.')}
              </p>
            </div>

            {/* Shape choices */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {[
                { id: 'square', np: 'वर्ग (Square)', en: 'Square', count: 4 },
                { id: 'rectangle', np: 'आयत (Rectangle)', en: 'Rectangle', count: 2 },
                { id: 'equilateral', np: 'समबाहु त्रिभुज', en: 'Equilateral △', count: 3 },
                { id: 'isosceles', np: 'समद्विबाहु त्रिभुज', en: 'Isosceles △', count: 1 },
                { id: 'scalene', np: 'विषमबाहु त्रिभुज', en: 'Scalene △', count: 0 },
                { id: 'circle', np: 'वृत्त (Circle)', en: 'Circle', count: 'Infinite' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCountShape(s.id as any);
                    setActiveAxesIndex(0);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                    countShape === s.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <div>{isNe ? s.np : s.en}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">({s.count} axis)</div>
                </button>
              ))}
            </div>

            {/* Visual with clickable axes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="260" height="260" viewBox="0 0 260 260">
                  {/* Square: 4 axes */}
                  {countShape === 'square' && (
                    <>
                      <rect x="60" y="60" width="140" height="140" fill="rgba(99, 102, 241, 0.2)" stroke="#4f46e5" strokeWidth="3" />
                      {/* Vertical axis */}
                      <line x1="130" y1="30" x2="130" y2="230" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,4" />
                      {/* Horizontal axis */}
                      <line x1="30" y1="130" x2="230" y2="130" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="5,4" />
                      {/* Diagonal 1 */}
                      <line x1="40" y1="40" x2="220" y2="220" stroke="#10b981" strokeWidth="2" strokeDasharray="5,4" />
                      {/* Diagonal 2 */}
                      <line x1="220" y1="40" x2="40" y2="220" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,4" />
                    </>
                  )}

                  {/* Rectangle: 2 axes (not diagonals!) */}
                  {countShape === 'rectangle' && (
                    <>
                      <rect x="40" y="70" width="180" height="120" fill="rgba(16, 185, 129, 0.2)" stroke="#059669" strokeWidth="3" />
                      {/* Vertical axis */}
                      <line x1="130" y1="40" x2="130" y2="220" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,4" />
                      {/* Horizontal axis */}
                      <line x1="20" y1="130" x2="240" y2="130" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="5,4" />
                    </>
                  )}

                  {/* Equilateral Triangle: 3 axes */}
                  {countShape === 'equilateral' && (
                    <>
                      {/* A(130, 50), B(50, 190), C(210, 190) */}
                      <polygon points="130,50 50,190 210,190" fill="rgba(245, 158, 11, 0.2)" stroke="#d97706" strokeWidth="3" />
                      {/* Axis from A to BC midpoint (130, 190) */}
                      <line x1="130" y1="30" x2="130" y2="210" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,4" />
                      {/* Axis from B to AC midpoint (170, 120) */}
                      <line x1="35" y1="200" x2="185" y2="105" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="5,4" />
                      {/* Axis from C to AB midpoint (90, 120) */}
                      <line x1="225" y1="200" x2="75" y2="105" stroke="#10b981" strokeWidth="2" strokeDasharray="5,4" />
                    </>
                  )}

                  {/* Isosceles Triangle: 1 axis */}
                  {countShape === 'isosceles' && (
                    <>
                      <polygon points="130,50 70,200 190,200" fill="rgba(147, 51, 234, 0.2)" stroke="#9333ea" strokeWidth="3" />
                      <line x1="130" y1="30" x2="130" y2="220" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,4" />
                    </>
                  )}

                  {/* Scalene Triangle: 0 axes */}
                  {countShape === 'scalene' && (
                    <>
                      <polygon points="90,60 50,200 220,180" fill="rgba(239, 68, 68, 0.2)" stroke="#dc2626" strokeWidth="3" />
                    </>
                  )}

                  {/* Circle: Infinite */}
                  {countShape === 'circle' && (
                    <>
                      <circle cx="130" cy="130" r="75" fill="rgba(6, 182, 212, 0.2)" stroke="#0891b2" strokeWidth="3" />
                      <line x1="130" y1="35" x2="130" y2="225" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" />
                      <line x1="35" y1="130" x2="225" y2="130" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4,3" />
                      <line x1="60" y1="60" x2="200" y2="200" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" />
                      <line x1="200" y1="60" x2="60" y2="200" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
                      <text x="130" y="135" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0e7490">∞</text>
                    </>
                  )}
                </svg>
              </div>

              {/* Information details */}
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-sm font-bold text-slate-900">
                    {countShape === 'square' && L('वर्गका 4 pcs Axis of symmetryहरू:', 'Square: 4 Axes of Symmetry')}
                    {countShape === 'rectangle' && L('आयतका 2 pcs Axis of symmetryहरू:', 'Rectangle: 2 Axes of Symmetry')}
                    {countShape === 'equilateral' && L('समबाहु त्रिभुजका 3 pcs अक्षहरू:', 'Equilateral Triangle: 3 Axes')}
                    {countShape === 'isosceles' && L('समद्विबाहु त्रिभुजको 1 अक्ष:', 'Isosceles Triangle: 1 Axis')}
                    {countShape === 'scalene' && L('विषमबाहु त्रिभुज (कुनै अक्ष छैन):', 'Scalene Triangle: 0 Axes')}
                    {countShape === 'circle' && L('वृत्त (Infinite Axis of symmetryहरू):', 'Circle: Infinite Axes')}
                  </div>
                  <div className="text-xs text-slate-600 mt-2 space-y-1">
                    {countShape === 'square' && (
                      <>
                        <div>1. Vertical axis</div>
                        <div>2. Horizontal axis</div>
                        <div>3. Both diagonals (2 diagonal axes)</div>
                        <div className="text-indigo-700 font-bold mt-1">Total = 4 axes</div>
                      </>
                    )}
                    {countShape === 'rectangle' && (
                      <>
                        <div>1. Perpendicularाइको मध्यबिन्दु जोड्ने ठाडो अक्ष</div>
                        <div>2. चौडाइको मध्यबिन्दु जोड्ने तेर्सो अक्ष</div>
                        <div className="text-rose-600 font-semibold mt-1">
                          ⚠️ ध्यान दिनुहोस्: आयतको Diagonal सममितिको अक्ष होइन किनकि Diagonalबाट मोड्दा कुनाहरू खप्टिँदैनन्!
                        </div>
                      </>
                    )}
                    {countShape === 'equilateral' && (
                      <div>प्रत्येक 3 वटै शीर्षबिन्दुबाट विपरित भुजाको मध्यबिन्दु जोड्ने 3 pcs मध्यक रेखा।</div>
                    )}
                    {countShape === 'isosceles' && (
                      <div>दुई बराबर भुजाहरू बीचको शीर्षबाट आधार भुजाको मध्यबिन्दु जोड्ने 1 मात्र रेखा।</div>
                    )}
                    {countShape === 'scalene' && (
                      <div>तीनवटै भुजाहरू असमान भएकाले कुनै पनि रेखाबाट मोड्दा खप्टिँदैन (0 axis)।</div>
                    )}
                    {countShape === 'circle' && (
                      <div>केन्द्रबिन्दु भएर जाने कुनै पनि Diameter (Diameter) सममितिको अक्ष हुन्छ, त्यसैले Infinite (Infinite) अक्ष हुन्छन्।</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Paper Folding Lab */}
        {tab === 'paper_folding' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-purple-950" style={{ fontFamily: FONT_NP }}>
                {L('कागज मोड्ने र काट्ने प्रयोगात्मक गतिविधि (Paper Folding & Cutting):', 'Paper Folding Experiment:')}
              </h3>
              <p className="text-xs text-purple-800 mt-1">
                {L('पाठ्यपुस्तक अनुसार कागजलाई दोब्य्राएर बीचबाट आकृति काटी खोल्दा बन्ने सममितीय आकृति हेर्नुहोस्।', 'Fold a paper in half, cut a shape on the fold line, and unfold to reveal symmetry.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {/* Step 1 */}
              <div
                className={`p-4 rounded-2xl border-2 ${
                  foldStep === 1 ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-purple-700 uppercase">{L('चरण 1: कागज मोड्ने', 'Step 1: Fold')}</div>
                <div className="h-32 flex items-center justify-center">
                  <div className="w-24 h-24 border-2 border-slate-700 bg-amber-50 relative flex">
                    <div className="w-1/2 h-full border-r-2 border-dashed border-red-500 bg-amber-100/60" />
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] text-red-600 font-bold">
                      Fold line
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setFoldStep(1)}
                  className="mt-2 px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold"
                >
                  {L('मोड्ने हेर्नुहोस्', 'View Step 1')}
                </button>
              </div>

              {/* Step 2 */}
              <div
                className={`p-4 rounded-2xl border-2 ${
                  foldStep === 2 ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-purple-700 uppercase">{L('चरण 2: आधा आकृति काट्ने', 'Step 2: Cut Half')}</div>
                <div className="h-32 flex items-center justify-center">
                  <div className="w-16 h-24 border-2 border-slate-700 bg-amber-100 relative">
                    <path d="" />
                    <svg className="w-full h-full" viewBox="0 0 60 90">
                      <path d="M 0 30 C 35 25 35 65 0 60 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                    </svg>
                    <Scissors className="w-4 h-4 text-slate-800 absolute top-7 right-2" />
                  </div>
                </div>
                <button
                  onClick={() => setFoldStep(2)}
                  className="mt-2 px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold"
                >
                  {L('काट्ने हेर्नुहोस्', 'View Step 2')}
                </button>
              </div>

              {/* Step 3 */}
              <div
                className={`p-4 rounded-2xl border-2 ${
                  foldStep === 3 ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-purple-700 uppercase">{L('चरण 3: कागज खोल्ने', 'Step 3: Unfold')}</div>
                <div className="h-32 flex items-center justify-center">
                  <div className="w-24 h-24 border-2 border-slate-700 bg-amber-50 relative flex items-center justify-center">
                    <line className="h-full border-r border-dashed border-red-500 absolute" />
                    <svg className="w-20 h-20" viewBox="0 0 80 80">
                      <path d="M 40 25 C 10 20 10 60 40 55 C 70 60 70 20 40 25 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                      <line x1="40" y1="0" x2="40" y2="80" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3,3" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={() => setFoldStep(3)}
                  className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  {L('खोल्ने हेर्नुहोस्', 'View Step 3')}
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm text-slate-700 text-center">
              {foldStep === 1 && L('कागजलाई बीचबाट सिधा पट्याइन्छ। पट्याइएको किनारा नै सममितिको अक्ष बन्छ।', 'Paper is folded along the centerline. The fold line becomes the axis of symmetry.')}
              {foldStep === 2 && L('मोडिएको किनाराबाट कैंचीले कुनै पनि आधा आकृति (जस्तै आधा मुटु वा रूख) काटिन्छ।', 'Cut half of a shape along the folded edge with scissors.')}
              {foldStep === 3 && L('कागज खोल्दा दुवैतिर ठ्याक्कै दुरुस्त र बराबर भएको पूर्ण सममितीय आकृति प्राप्त हुन्छ!', 'Unfolding reveals a perfectly symmetrical complete figure with fold line as axis!')}
            </div>
          </div>
        )}

        {/* Tab 4: Complete Half-Figure */}
        {tab === 'mirror_complete' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-2xl flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-emerald-950" style={{ fontFamily: FONT_NP }}>
                  {L('आधा चित्र पूरा गर्ने ग्रिड चुनौती (Complete the Half Figure):', 'Complete the Symmetrical Figure on Grid:')}
                </h3>
                <p className="text-xs text-emerald-800 mt-1">
                  {L('बायाँ भागको प्रतिविम्ब हुने गरी Mirror रेखा (Dotted Line) को दायाँतिरका कोठाहरूमा क्लिक गर्नुहोस्।', 'Click on the right grid cells to reflect the left pattern symmetrically across the mirror line.')}
                </p>
              </div>
              <button
                onClick={resetGrid}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {L('खाली गर्नुहोस्', 'Reset')}
              </button>
            </div>

            {/* Grid Workspace */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-0 bg-slate-100 p-4 rounded-2xl border-2 border-slate-300 shadow-inner">
                {/* Left Grid (Fixed half) */}
                <div className="grid grid-cols-3 gap-1 bg-white p-2 rounded-l-xl border-r-2 border-indigo-600">
                  {leftGrid.map((row, ri) =>
                    row.map((val, ci) => (
                      <div
                        key={`left-${ri}-${ci}`}
                        className={`w-9 h-9 rounded-lg border transition-all ${
                          val ? 'bg-indigo-600 border-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    ))
                  )}
                </div>

                {/* Mirror Dotted Line Divider */}
                <div className="h-full px-2 flex flex-col items-center justify-center">
                  <div className="w-0.5 h-64 border-r-2 border-dashed border-red-500" />
                  <span className="text-[10px] text-red-600 font-bold mt-1">Mirror</span>
                </div>

                {/* Right Grid (Interactive) */}
                <div className="grid grid-cols-3 gap-1 bg-white p-2 rounded-r-xl border-l-2 border-indigo-600">
                  {rightGrid.map((row, ri) =>
                    row.map((val, ci) => (
                      <button
                        key={`right-${ri}-${ci}`}
                        onClick={() => toggleRightCell(ri, ci)}
                        className={`w-9 h-9 rounded-lg border transition-all ${
                          val
                            ? 'bg-indigo-600 border-indigo-700 shadow-sm'
                            : 'bg-indigo-50/40 hover:bg-indigo-100/60 border-slate-200'
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Submit / Check Button */}
              <button
                onClick={checkMirrorCompletion}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2 text-sm"
              >
                <Check className="w-4 h-4" />
                {L('सममिति जाँच गर्नुहोस् (Check Symmetry)', 'Check Symmetry')}
              </button>

              {gridSuccess !== null && (
                <div
                  className={`p-4 rounded-2xl text-center text-sm font-bold max-w-md ${
                    gridSuccess
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {gridSuccess
                    ? L('सबास! दुवै भागहरू पूर्ण रूपमा सममितीय र बराबर छन्!', 'Excellent! Both halves match symmetrically and overlap perfectly!')
                    : L('प्रयास राम्रो! केही कोठाहरू मिलेका छैनन्, Mirror रेखाबाट समान दूरीमा कोठाहरू भर्नुहोस्।', 'Good try! Some cells are incorrect. Fill cells at equal distance from the mirror line.')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default LineSymmetryMirrorPlayground;
