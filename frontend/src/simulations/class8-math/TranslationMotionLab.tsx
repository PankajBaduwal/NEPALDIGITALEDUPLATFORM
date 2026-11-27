import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface Point {
  x: number;
  y: number;
}

type ShapeType = 'point' | 'segment' | 'triangle' | 'quadrilateral';

interface ShapeDef {
  type: ShapeType;
  nameNp: string;
  nameEn: string;
  vertices: { name: string; x: number; y: number }[];
}

const PRESET_SHAPES: ShapeDef[] = [
  {
    type: 'point',
    nameNp: 'Point P',
    nameEn: 'Point P',
    vertices: [{ name: 'P', x: 2, y: 1 }],
  },
  {
    type: 'segment',
    nameNp: 'Line segment AB',
    nameEn: 'Line Segment AB',
    vertices: [
      { name: 'A', x: 1, y: 1 },
      { name: 'B', x: 4, y: 3 },
    ],
  },
  {
    type: 'triangle',
    nameNp: 'Triangle ABC',
    nameEn: 'Triangle ABC',
    vertices: [
      { name: 'A', x: 1, y: 2 },
      { name: 'B', x: 4, y: 1 },
      { name: 'C', x: 3, y: 5 },
    ],
  },
  {
    type: 'quadrilateral',
    nameNp: 'Quadrilateral ABCD',
    nameEn: 'Quadrilateral ABCD',
    vertices: [
      { name: 'A', x: 1, y: 1 },
      { name: 'B', x: 4, y: 1 },
      { name: 'C', x: 5, y: 4 },
      { name: 'D', x: 2, y: 4 },
    ],
  },
];

const CHALLENGES = [
  {
    id: 1,
    titleNp: 'Challenge 1: Translating a point',
    titleEn: 'Challenge 1: Point Translation',
    shape: PRESET_SHAPES[0],
    targetVector: { a: 4, b: 3 },
    descNp: 'Translate point P(2, 1) 4 right and 3 up: T = (4, 3)',
    descEn: 'Translate point P(2, 1) right by 4 and up by 3: T = (4, 3)',
  },
  {
    id: 2,
    titleNp: 'चुनौती 2: रेखाखण्डको विस्थापन',
    titleEn: 'Challenge 2: Segment Translation',
    shape: PRESET_SHAPES[1],
    targetVector: { a: -3, b: 2 },
    descNp: 'Line segment AB लाई बायाँ 3 र Up 2 विस्थापन गर्नुहोस्: T = (-3, 2)',
    descEn: 'Translate segment AB left by 3 and up by 2: T = (-3, 2)',
  },
  {
    id: 3,
    titleNp: 'चुनौती 3: त्रिभुजको विस्थापन',
    titleEn: 'Challenge 3: Triangle Translation',
    shape: PRESET_SHAPES[2],
    targetVector: { a: 3, b: -2 },
    descNp: 'Triangle ABC लाई Right 3 र तल 2 विस्थापन गर्नुहोस्: T = (3, -2)',
    descEn: 'Translate triangle ABC right by 3 and down by 2: T = (3, -2)',
  },
  {
    id: 4,
    titleNp: 'चुनौती 4: चतुर्भुजको विस्थापन',
    titleEn: 'Challenge 4: Quadrilateral Translation',
    shape: PRESET_SHAPES[3],
    targetVector: { a: -2, b: -3 },
    descNp: 'Quadrilateral ABCD लाई बायाँ 2 र तल 3 विस्थापन गर्नुहोस्: T = (-2, -3)',
    descEn: 'Translate quadrilateral ABCD left by 2 and down by 3: T = (-2, -3)',
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'विस्थापन (Translation) गर्दा कुनै वस्तुको कुन गुण परिवर्तन हुँदैन?',
    en: 'Which property of an object does NOT change during translation?',
    options: [
      { key: 'A', label: 'Shape, size and orientation' },
      { key: 'B', label: 'Position only' },
      { key: 'C', label: 'Area' },
      { key: 'D', label: 'All of the above stay unchanged' },
    ],
    answer: 'D',
  },
  {
    np: 'यदि विस्थापन भेक्टर T = (3, -4) भए, Point P(2, 5) को प्रतिबिम्ब P\' कति हुन्छ?',
    en: 'If translation vector T = (3, -4), what are the coordinates of image P\' for P(2, 5)?',
    options: [
      { key: 'A', label: "(5, 1) — P'(2+3, 5-4)" },
      { key: 'B', label: "(5, 9)" },
      { key: 'C', label: "(-1, 9)" },
      { key: 'D', label: "(6, -20)" },
    ],
    answer: 'A',
  },
  {
    np: 'विस्थापन भेक्टर T = (-5, 0) ले वस्तुलाई कता लैजान्छ?',
    en: 'Where does the translation vector T = (-5, 0) shift the object?',
    options: [
      { key: 'A', label: '5 units right' },
      { key: 'B', label: '5 units left horizontally' },
      { key: 'C', label: '5 units up' },
      { key: 'D', label: '5 units down' },
    ],
    answer: 'B',
  },
  {
    np: 'बिन्दु A(1, 2) बाट प्रतिबिम्ब A\'(4, 7) बन्दा प्रयोग भएको विस्थापन भेक्टर T कति हो?',
    en: 'What translation vector T was used if image A\'(4, 7) was formed from A(1, 2)?',
    options: [
      { key: 'A', label: 'T = (3, 5)' },
      { key: 'B', label: 'T = (5, 9)' },
      { key: 'C', label: 'T = (-3, -5)' },
      { key: 'D', label: 'T = (4, 7)' },
    ],
    answer: 'A',
  },
];

export const TranslationMotionLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U19-02',
    chapter: 19,
    titleNp: 'विस्थापन गति प्रयोगशाला',
    titleEn: 'Translation Motion Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'explore' | 'step' | 'challenge'>('explore');

  // Free explorer state
  const [selectedShapeIdx, setSelectedShapeIdx] = useState<number>(2); // Triangle default
  const [vectorA, setVectorA] = useState<number>(3); // delta X
  const [vectorB, setVectorB] = useState<number>(2); // delta Y
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showCoords, setShowCoords] = useState<boolean>(true);

  // Step-by-step animation step (0: original, 1: horizontal shift, 2: vertical shift)
  const [stepPhase, setStepPhase] = useState<number>(0);

  // Challenge state
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userVectorA, setUserVectorA] = useState<number>(0);
  const [userVectorB, setUserVectorB] = useState<number>(0);
  const [challengeSolved, setChallengeSolved] = useState<boolean>(false);

  // Grid coordinates mapping
  const width = 640;
  const height = 500;
  const originX = width / 2;
  const originY = height / 2;
  const scale = 28; // pixels per coordinate unit (-11 to +11)

  const toSvgX = (x: number) => originX + x * scale;
  const toSvgY = (y: number) => originY - y * scale;

  const currentShape = PRESET_SHAPES[selectedShapeIdx];
  const translatedVertices = useMemo(() => {
    return currentShape.vertices.map((v) => ({
      name: v.name + "'",
      x: v.x + vectorA,
      y: v.y + vectorB,
    }));
  }, [currentShape, vectorA, vectorB]);

  // Step-by-step intermediate vertices
  const stepVertices = useMemo(() => {
    if (stepPhase === 0) return currentShape.vertices;
    if (stepPhase === 1) {
      return currentShape.vertices.map((v) => ({
        name: v.name + '₁',
        x: v.x + vectorA,
        y: v.y,
      }));
    }
    return translatedVertices;
  }, [stepPhase, currentShape, vectorA, translatedVertices]);

  // Challenge check
  const activeChallenge = CHALLENGES[challengeIdx];
  const handleCheckChallenge = () => {
    if (userVectorA === activeChallenge.targetVector.a && userVectorB === activeChallenge.targetVector.b) {
      kit.good();
      setChallengeSolved(true);
    } else {
      kit.oops();
      setChallengeSolved(false);
    }
  };

  const handleNextChallenge = () => {
    const nextIdx = (challengeIdx + 1) % CHALLENGES.length;
    setChallengeIdx(nextIdx);
    setUserVectorA(0);
    setUserVectorB(0);
    setChallengeSolved(false);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! विस्थापन भेक्टर T = (a, b) द्वारा आकृतिहरू सार्ने गणितीय विधि र गुणहरू अन्वेषण गरौं!',
        'Hello! Explore translating shapes using translation vector T = (a, b) and its invariant properties!'
      )}
    >
      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b pb-3">
        <button
          onClick={() => setActiveTab('explore')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'explore' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔍 Explorer lab
        </button>
        <button
          onClick={() => setActiveTab('step')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'step' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🚶 Step-by-step translation
        </button>
        <button
          onClick={() => setActiveTab('challenge')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'challenge' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎯 Translation challenges
        </button>
      </div>

      {activeTab === 'explore' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main SVG Grid Visualizer */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-md p-4 border border-slate-200 flex flex-col items-center">
            <svg width={width} height={height} className="border rounded bg-slate-50 shadow-inner select-none max-w-full">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
                </marker>
                <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
                  <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Grid background */}
              <rect width={width} height={height} fill="url(#grid)" />

              {/* Axes */}
              <line x1={0} y1={originY} x2={width} y2={originY} stroke="#94a3b8" strokeWidth="2" />
              <line x1={originX} y1={0} x2={originX} y2={height} stroke="#94a3b8" strokeWidth="2" />

              {/* Axis tick marks and numbers */}
              {Array.from({ length: 23 }, (_, i) => i - 11).map((val) => {
                if (val === 0) return null;
                const px = toSvgX(val);
                const py = toSvgY(val);
                return (
                  <React.Fragment key={val}>
                    {/* X ticks */}
                    <line x1={px} y1={originY - 3} x2={px} y2={originY + 3} stroke="#64748b" strokeWidth="1.5" />
                    <text x={px} y={originY + 16} fontSize="10" fill="#64748b" textAnchor="middle">
                      {val}
                    </text>
                    {/* Y ticks */}
                    <line x1={originX - 3} y1={py} x2={originX + 3} y2={py} stroke="#64748b" strokeWidth="1.5" />
                    <text x={originX - 8} y={py + 3} fontSize="10" fill="#64748b" textAnchor="end">
                      {val}
                    </text>
                  </React.Fragment>
                );
              })}
              <text x={originX - 10} y={originY + 14} fontSize="11" fontWeight="bold" fill="#64748b">
                O
              </text>
              <text x={width - 15} y={originY - 6} fontSize="12" fontWeight="bold" fill="#334155">
                X
              </text>
              <text x={originX + 8} y={15} fontSize="12" fontWeight="bold" fill="#334155">
                Y
              </text>

              {/* Translation displacement vectors (dashed purple lines with arrowhead) */}
              {showVectors &&
                currentShape.vertices.map((v, i) => {
                  const target = translatedVertices[i];
                  const x1 = toSvgX(v.x);
                  const y1 = toSvgY(v.y);
                  const x2 = toSvgX(target.x);
                  const y2 = toSvgY(target.y);
                  return (
                    <g key={i}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#8b5cf6"
                        strokeWidth="2.5"
                        strokeDasharray="4 3"
                        markerEnd="url(#arrow)"
                      />
                    </g>
                  );
                })}

              {/* Original Object Shape (Blue) */}
              {currentShape.type === 'segment' && (
                <line
                  x1={toSvgX(currentShape.vertices[0].x)}
                  y1={toSvgY(currentShape.vertices[0].y)}
                  x2={toSvgX(currentShape.vertices[1].x)}
                  y2={toSvgY(currentShape.vertices[1].y)}
                  stroke="#2563eb"
                  strokeWidth="3.5"
                />
              )}
              {(currentShape.type === 'triangle' || currentShape.type === 'quadrilateral') && (
                <polygon
                  points={currentShape.vertices.map((v) => `${toSvgX(v.x)},${toSvgY(v.y)}`).join(' ')}
                  fill="rgba(37, 99, 235, 0.2)"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />
              )}

              {/* Original vertices */}
              {currentShape.vertices.map((v) => (
                <g key={v.name}>
                  <circle cx={toSvgX(v.x)} cy={toSvgY(v.y)} r={6} fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x={toSvgX(v.x) + 9}
                    y={toSvgY(v.y) - 8}
                    fontSize="12"
                    fontWeight="bold"
                    fill="#1d4ed8"
                    className="select-none"
                  >
                    {v.name} {showCoords ? `(${v.x}, ${v.y})` : ''}
                  </text>
                </g>
              ))}

              {/* Image Shape (Emerald Green) */}
              {currentShape.type === 'segment' && (
                <line
                  x1={toSvgX(translatedVertices[0].x)}
                  y1={toSvgY(translatedVertices[0].y)}
                  x2={toSvgX(translatedVertices[1].x)}
                  y2={toSvgY(translatedVertices[1].y)}
                  stroke="#059669"
                  strokeWidth="3.5"
                />
              )}
              {(currentShape.type === 'triangle' || currentShape.type === 'quadrilateral') && (
                <polygon
                  points={translatedVertices.map((v) => `${toSvgX(v.x)},${toSvgY(v.y)}`).join(' ')}
                  fill="rgba(5, 150, 105, 0.25)"
                  stroke="#059669"
                  strokeWidth="2.5"
                />
              )}

              {/* Image vertices */}
              {translatedVertices.map((v) => (
                <g key={v.name}>
                  <circle cx={toSvgX(v.x)} cy={toSvgY(v.y)} r={6} fill="#059669" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x={toSvgX(v.x) + 9}
                    y={toSvgY(v.y) - 8}
                    fontSize="12"
                    fontWeight="bold"
                    fill="#047857"
                    className="select-none"
                  >
                    {v.name} {showCoords ? `(${v.x}, ${v.y})` : ''}
                  </text>
                </g>
              ))}
            </svg>

            {/* Legend & quick vector info */}
            <div className="flex flex-wrap gap-4 mt-3 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block"></span>
                Original object
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block"></span>
                Image object
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-0.5 border-t-2 border-purple-500 border-dashed inline-block"></span>
                Translation vector ( $\vec{'{T}'}$)
              </span>
            </div>
          </div>

          {/* Interactive Controls & Coordinates Table */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-indigo-900 mb-2 text-sm flex items-center justify-between">
                <span>Select shape</span>
                <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded">
                  {currentShape.nameNp}
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SHAPES.map((shape, idx) => (
                  <button
                    key={shape.type}
                    onClick={() => setSelectedShapeIdx(idx)}
                    className={`py-1.5 px-2 rounded text-xs font-medium border text-left transition-all ${
                      selectedShapeIdx === idx
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-indigo-100'
                    }`}
                  >
                    {shape.nameNp}
                  </button>
                ))}
              </div>
            </div>

            {/* Translation Vector Vector Controls */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Vector controls
              </h3>

              {/* Horizontal translation (a) */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Horizontal translation $\Delta x = a$ ({vectorA >= 0 ? 'Right' : 'बायाँ'}):</span>
                  <span className="text-indigo-700 font-bold">{vectorA >= 0 ? `+${vectorA}` : vectorA}</span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="1"
                  value={vectorA}
                  onChange={(e) => setVectorA(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>-6</span>
                  <span>0</span>
                  <span>+6</span>
                </div>
              </div>

              {/* Vertical translation (b) */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Vertical translation $\Delta y = b$ ({vectorB >= 0 ? 'Up' : 'तल'}):</span>
                  <span className="text-indigo-700 font-bold">{vectorB >= 0 ? `+${vectorB}` : vectorB}</span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="1"
                  value={vectorB}
                  onChange={(e) => setVectorB(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>-6</span>
                  <span>0</span>
                  <span>+6</span>
                </div>
              </div>

              {/* Directional Quick Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <button
                  onClick={() => setVectorA((prev) => Math.max(-6, prev - 1))}
                  className="py-1 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded font-medium border"
                >
                  ⬅ Left (-1)
                </button>
                <button
                  onClick={() => setVectorA((prev) => Math.min(6, prev + 1))}
                  className="py-1 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded font-medium border"
                >
                  ➡ Right (+1)
                </button>
                <button
                  onClick={() => setVectorB((prev) => Math.min(6, prev + 1))}
                  className="py-1 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded font-medium border"
                >
                  ⬆ Up (+1)
                </button>
                <button
                  onClick={() => setVectorB((prev) => Math.max(-6, prev - 1))}
                  className="py-1 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded font-medium border"
                >
                  ⬇ Down (-1)
                </button>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVectors}
                    onChange={(e) => setShowVectors(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  <span>Vector lines</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCoords}
                    onChange={(e) => setShowCoords(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  <span>Show coordinates</span>
                </label>
              </div>
            </div>

            {/* Formula & Calculation Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-2">
                Transformation rule
              </h3>
              <div className="p-2 bg-white rounded border border-emerald-300 font-mono text-center text-sm font-bold text-emerald-800 mb-3">
                P(x, y) <span className="text-slate-400">→</span> P'(x + {vectorA}, y + {vectorB})
              </div>

              {/* Coordinate table */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
                {currentShape.vertices.map((v, i) => {
                  const img = translatedVertices[i];
                  return (
                    <div key={v.name} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-emerald-100">
                      <span className="font-bold text-blue-700">
                        {v.name}({v.x}, {v.y})
                      </span>
                      <span className="text-slate-400 font-mono">→</span>
                      <span className="font-bold text-emerald-700">
                        {img.name}({img.x}, {img.y})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Step by step Horizontal & Vertical animation */}
      {activeTab === 'step' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-xl shadow-md p-4 border border-slate-200 flex flex-col items-center">
            <svg width={width} height={height} className="border rounded bg-slate-50 shadow-inner select-none max-w-full">
              <defs>
                <pattern id="grid-step" width={scale} height={scale} patternUnits="userSpaceOnUse">
                  <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={width} height={height} fill="url(#grid-step)" />
              <line x1={0} y1={originY} x2={width} y2={originY} stroke="#94a3b8" strokeWidth="2" />
              <line x1={originX} y1={0} x2={originX} y2={height} stroke="#94a3b8" strokeWidth="2" />

              {/* Original object in blue */}
              <polygon
                points={currentShape.vertices.map((v) => `${toSvgX(v.x)},${toSvgY(v.y)}`).join(' ')}
                fill="rgba(37, 99, 235, 0.15)"
                stroke="#2563eb"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Intermediate or final state */}
              <polygon
                points={stepVertices.map((v) => `${toSvgX(v.x)},${toSvgY(v.y)}`).join(' ')}
                fill={stepPhase === 1 ? 'rgba(234, 179, 8, 0.25)' : 'rgba(5, 150, 105, 0.3)'}
                stroke={stepPhase === 1 ? '#ca8a04' : '#059669'}
                strokeWidth="2.5"
              />

              {/* Vertices of current step */}
              {stepVertices.map((v) => (
                <g key={v.name}>
                  <circle
                    cx={toSvgX(v.x)}
                    cy={toSvgY(v.y)}
                    r={5}
                    fill={stepPhase === 1 ? '#ca8a04' : '#059669'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text x={toSvgX(v.x) + 7} y={toSvgY(v.y) - 6} fontSize="11" fontWeight="bold">
                    {v.name}({v.x}, {v.y})
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-bold text-amber-900 mb-2 text-sm">2-step translation process</h3>
              <p className="text-xs text-amber-800 leading-relaxed mb-4">
                To understand translation easily, we first move parallel to the horizontal (X-axis) and then parallel to the vertical (Y-axis).
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => setStepPhase(0)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all ${
                    stepPhase === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700'
                  }`}
                >
                  Step 0: Initial position
                </button>
                <button
                  onClick={() => setStepPhase(1)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all ${
                    stepPhase === 1 ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-700'
                  }`}
                >
                  Step 1: Horizontal translation ($\Delta x = {vectorA >= 0 ? `+${vectorA}` : vectorA}$)
                  <div className="text-[11px] font-normal opacity-90 mt-0.5">
                    {vectorA >= 0 ? `${vectorA} units right` : `${Math.abs(vectorA)} units left`} moves
                  </div>
                </button>
                <button
                  onClick={() => setStepPhase(2)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all ${
                    stepPhase === 2 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700'
                  }`}
                >
                  Step 2: Vertical translation ($\Delta y = {vectorB >= 0 ? `+${vectorB}` : vectorB}$)
                  <div className="text-[11px] font-normal opacity-90 mt-0.5">
                    {vectorB >= 0 ? `${vectorB} units up` : `${Math.abs(vectorB)} units down`} moves
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">✨ Invariant properties:</span>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Side lengths are preserved.</li>
                <li>Angle measures are preserved.</li>
                <li>The shape does not rotate or flip (orientation preserved).</li>
                <li>The image and the original shape are congruent ($\Delta ABC \cong \Delta A'B'C'$).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Challenges */}
      {activeTab === 'challenge' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-xl shadow-md p-4 border border-slate-200 flex flex-col items-center">
            <svg width={width} height={height} className="border rounded bg-slate-50 shadow-inner select-none max-w-full">
              <defs>
                <pattern id="grid-ch" width={scale} height={scale} patternUnits="userSpaceOnUse">
                  <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={width} height={height} fill="url(#grid-ch)" />
              <line x1={0} y1={originY} x2={width} y2={originY} stroke="#94a3b8" strokeWidth="2" />
              <line x1={originX} y1={0} x2={originX} y2={height} stroke="#94a3b8" strokeWidth="2" />

              {/* Target Ghost shape in dashed gray/green */}
              <polygon
                points={activeChallenge.shape.vertices
                  .map((v) => `${toSvgX(v.x + activeChallenge.targetVector.a)},${toSvgY(v.y + activeChallenge.targetVector.b)}`)
                  .join(' ')}
                fill="rgba(34, 197, 94, 0.1)"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeDasharray="5 3"
              />

              {/* User Current translated shape */}
              <polygon
                points={activeChallenge.shape.vertices
                  .map((v) => `${toSvgX(v.x + userVectorA)},${toSvgY(v.y + userVectorB)}`)
                  .join(' ')}
                fill={challengeSolved ? 'rgba(34, 197, 94, 0.35)' : 'rgba(99, 102, 241, 0.25)'}
                stroke={challengeSolved ? '#16a34a' : '#4f46e5'}
                strokeWidth="2.5"
              />

              {/* User shape vertices */}
              {activeChallenge.shape.vertices.map((v) => {
                const curX = v.x + userVectorA;
                const curY = v.y + userVectorB;
                return (
                  <circle key={v.name} cx={toSvgX(curX)} cy={toSvgY(curY)} r={5} fill="#4f46e5" stroke="#fff" strokeWidth="2" />
                );
              })}
            </svg>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h3 className="font-bold text-purple-900 text-sm mb-1">{activeChallenge.titleNp}</h3>
              <p className="text-xs text-purple-800 mb-3">{activeChallenge.descNp}</p>

              <div className="space-y-3 bg-white p-3 rounded-lg border border-purple-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Horizontal translation $\Delta x = a$: {userVectorA}
                  </label>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    value={userVectorA}
                    onChange={(e) => {
                      setUserVectorA(parseInt(e.target.value));
                      setChallengeSolved(false);
                    }}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vertical translation $\Delta y = b$: {userVectorB}
                  </label>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    value={userVectorB}
                    onChange={(e) => {
                      setUserVectorB(parseInt(e.target.value));
                      setChallengeSolved(false);
                    }}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleCheckChallenge}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow transition-all"
                >
                  Check
                </button>
                {challengeSolved && (
                  <button
                    onClick={handleNextChallenge}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow animate-pulse"
                  >
                    अर्को चुनौती ➡
                  </button>
                )}
              </div>

              {challengeSolved && (
                <div className="mt-3 p-2 bg-emerald-100 border border-emerald-300 rounded text-emerald-800 text-xs font-bold text-center">
                  🎉 स्याबास! तपाईंले सही विस्थापन भेक्टर पत्ता लगाउनुभयो!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SimFrame2D>
  );
};
export default TranslationMotionLab;
