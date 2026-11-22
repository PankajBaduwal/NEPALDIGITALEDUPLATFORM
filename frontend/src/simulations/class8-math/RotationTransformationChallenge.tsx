import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface Point {
  x: number;
  y: number;
}

type ShapeType = 'point' | 'segment' | 'triangle';

interface ShapeDef {
  type: ShapeType;
  nameNp: string;
  nameEn: string;
  vertices: { name: string; x: number; y: number }[];
}

const PRESET_SHAPES: ShapeDef[] = [
  {
    type: 'point',
    nameNp: 'बिन्दु P',
    nameEn: 'Point P',
    vertices: [{ name: 'P', x: 3, y: 2 }],
  },
  {
    type: 'segment',
    nameNp: 'रेखाखण्ड AB',
    nameEn: 'Line Segment AB',
    vertices: [
      { name: 'A', x: 2, y: 1 },
      { name: 'B', x: 5, y: 3 },
    ],
  },
  {
    type: 'triangle',
    nameNp: 'त्रिभुज ABC',
    nameEn: 'Triangle ABC',
    vertices: [
      { name: 'A', x: 2, y: 1 },
      { name: 'B', x: 5, y: 2 },
      { name: 'C', x: 3, y: 5 },
    ],
  },
];

type RotationType = 'cw90' | 'ccw90' | '180' | 'ccw270';

interface RotationRule {
  key: RotationType;
  angleDeg: number;
  labelNp: string;
  labelEn: string;
  directionNp: string;
  formulaNp: string;
  calc: (x: number, y: number) => { x: number; y: number };
}

const ROTATION_RULES: RotationRule[] = [
  {
    key: 'ccw90',
    angleDeg: 90,
    labelNp: '+९०° (घडीको उल्टो दिशा)',
    labelEn: '+90° (Quarter Turn Anticlockwise)',
    directionNp: 'घडीको विपरित दिशा (Anticlockwise)',
    formulaNp: 'P(x, y) → P\'(-y, x)',
    calc: (x, y) => ({ x: -y, y: x }),
  },
  {
    key: 'cw90',
    angleDeg: -90,
    labelNp: '-९०° (घडीको दिशा)',
    labelEn: '-90° / 270° (Quarter Turn Clockwise)',
    directionNp: 'घडीको दिशा (Clockwise)',
    formulaNp: 'P(x, y) → P\'(y, -x)',
    calc: (x, y) => ({ x: y, y: -x }),
  },
  {
    key: '180',
    angleDeg: 180,
    labelNp: '±१८०° (आधा घुमाइ / Half Turn)',
    labelEn: '±180° (Half Turn)',
    directionNp: 'घडीको दिशा वा विपरित दुवै समान',
    formulaNp: 'P(x, y) → P\'(-x, -y)',
    calc: (x, y) => ({ x: -x, y: -y }),
  },
  {
    key: 'ccw270',
    angleDeg: 270,
    labelNp: '+२७०° (घडीको उल्टो दिशा)',
    labelEn: '+270° Anticlockwise (-90° Clockwise)',
    directionNp: 'घडीको विपरित २७०° = घडीको दिशा ९०°',
    formulaNp: 'P(x, y) → P\'(y, -x)',
    calc: (x, y) => ({ x: y, y: -x }),
  },
];

interface MysteryChallenge {
  id: number;
  type: 'reflection' | 'translation' | 'rotation';
  titleNp: string;
  objVertices: { x: number; y: number }[];
  imgVertices: { x: number; y: number }[];
  correctType: string;
  correctParam: string;
  paramOptions: string[];
  explanationNp: string;
}

const MYSTERY_CHALLENGES: MysteryChallenge[] = [
  {
    id: 1,
    type: 'rotation',
    titleNp: 'रहस्यमय रूपान्तरण १',
    objVertices: [
      { x: 2, y: 1 },
      { x: 5, y: 2 },
      { x: 3, y: 5 },
    ],
    imgVertices: [
      { x: -1, y: 2 },
      { x: -2, y: 5 },
      { x: -5, y: 3 },
    ],
    correctType: 'rotation',
    correctParam: '+90° (घडीको उल्टो)',
    paramOptions: ['+90° (घडीको उल्टो)', '-90° (घडीको दिशा)', '180° घुमाइ'],
    explanationNp: 'P(x, y) → P\'(-y, x) भएकोले यो उद्गमबिन्दु वरिपरि +90° को परिक्रमण हो।',
  },
  {
    id: 2,
    type: 'reflection',
    titleNp: 'रहस्यमय रूपान्तरण २',
    objVertices: [
      { x: 2, y: 1 },
      { x: 5, y: 2 },
      { x: 3, y: 5 },
    ],
    imgVertices: [
      { x: 2, y: -1 },
      { x: 5, y: -2 },
      { x: 3, y: -5 },
    ],
    correctType: 'reflection',
    correctParam: 'X-अक्षमा परावर्तन (y = 0)',
    paramOptions: ['X-अक्षमा परावर्तन (y = 0)', 'Y-अक्षमा परावर्तन (x = 0)', 'y = x रेखामा परावर्तन'],
    explanationNp: 'P(x, y) → P\'(x, -y) भएकोले यो X-अक्षमा भएको परावर्तन हो।',
  },
  {
    id: 3,
    type: 'translation',
    titleNp: 'रहस्यमय रूपान्तरण ३',
    objVertices: [
      { x: 1, y: 2 },
      { x: 4, y: 1 },
      { x: 3, y: 4 },
    ],
    imgVertices: [
      { x: 5, y: 5 },
      { x: 8, y: 4 },
      { x: 7, y: 7 },
    ],
    correctType: 'translation',
    correctParam: 'T = (4, 3) (दायाँ 4, माथि 3)',
    paramOptions: ['T = (4, 3) (दायाँ 4, माथि 3)', 'T = (-4, -3)', 'T = (3, 4)'],
    explanationNp: 'प्रत्येक बिन्दु दायाँ 4 र माथि 3 सरेको छ, त्यसैले विस्थापन T = (4, 3) हो।',
  },
  {
    id: 4,
    type: 'rotation',
    titleNp: 'रहस्यमय रूपान्तरण ४',
    objVertices: [
      { x: 2, y: 3 },
      { x: 4, y: 1 },
      { x: 5, y: 4 },
    ],
    imgVertices: [
      { x: -2, y: -3 },
      { x: -4, y: -1 },
      { x: -5, y: -4 },
    ],
    correctType: 'rotation',
    correctParam: '±180° घुमाइ (आधा परिक्रमण)',
    paramOptions: ['±180° घुमाइ (आधा परिक्रमण)', '+90° घुमाइ', '-90° घुमाइ'],
    explanationNp: 'P(x, y) → P\'(-x, -y) भएकोले यो उद्गमबिन्दु वरिपरि १८०° को परिक्रमण हो।',
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'उद्गमबिन्दु (0, 0) वरिपरि +९०° (घडीको उल्टो) परिक्रमण गर्दा बिन्दु P(x, y) को प्रतिबिम्ब के हुन्छ?',
    en: 'Under a +90° anticlockwise rotation about origin (0, 0), what is the image of P(x, y)?',
    options: [
      { key: 'A', label: "P'(-y, x)" },
      { key: 'B', label: "P'(y, -x)" },
      { key: 'C', label: "P'(-x, -y)" },
      { key: 'D', label: "P'(y, x)" },
    ],
    answer: 'A',
  },
  {
    np: 'बिन्दु A(3, -2) लाई उद्गमबिन्दु वरिपरि १८०° घुमाउँदा बन्ने प्रतिबिम्ब A\' को निर्देशांक कुन हो?',
    en: 'What are the coordinates of image A\' when A(3, -2) is rotated 180° about the origin?',
    options: [
      { key: 'A', label: "(-3, 2) — P(-x, -y)" },
      { key: 'B', label: "(3, 2)" },
      { key: 'C', label: "(-2, 3)" },
      { key: 'D', label: "(2, -3)" },
    ],
    answer: 'A',
  },
  {
    np: 'उद्गमबिन्दु वरिपरि -९०° (घडीको दिशा) को परिक्रमण कुन परिक्रमणसँग बराबर हुन्छ?',
    en: 'A rotation of -90° (clockwise) about the origin is equivalent to which rotation?',
    options: [
      { key: 'A', label: '+२७०° घडीको विपरित दिशा (+270° anticlockwise)' },
      { key: 'B', label: '+९०° घडीको विपरित दिशा (+90° anticlockwise)' },
      { key: 'C', label: '१८०° परिक्रमण' },
      { key: 'D', label: '३६०° पूर्ण परिक्रमण' },
    ],
    answer: 'A',
  },
  {
    np: 'परावर्तन, विस्थापन र परिक्रमण तीनवटै रूपान्तरणमा साझा हुने मुख्य समानता के हो?',
    en: 'What is the key common property shared by Reflection, Translation, and Rotation?',
    options: [
      { key: 'A', label: 'तीनैवटाले आकृति र नाप परिवर्तन गर्दैनन् - अनुरुप रहन्छन् (Congruent / Isometry)' },
      { key: 'B', label: 'तीनैवटाले वस्तुको आकार दोब्बर बनाउँछन्' },
      { key: 'C', label: 'तीनैवटामा वस्तुको अभिमुखिकरण उल्टिन्छ' },
      { key: 'D', label: 'तीनैवटामा वस्तु उद्गमबिन्दुमा सर्छ' },
    ],
    answer: 'A',
  },
];

export const RotationTransformationChallenge: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U19-03',
    chapter: 19,
    titleNp: 'परिक्रमण र रूपान्तरण चुनौती',
    titleEn: 'Rotation & Transformation Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'rotation' | 'mystery'>('rotation');

  // Rotation Explorer state
  const [selectedShapeIdx, setSelectedShapeIdx] = useState<number>(2); // Triangle
  const [selectedRuleKey, setSelectedRuleKey] = useState<RotationType>('ccw90');
  const [showRays, setShowRays] = useState<boolean>(true);
  const [showArcs, setShowArcs] = useState<boolean>(true);

  // Mystery Challenge state
  const [mysteryIdx, setMysteryIdx] = useState<number>(0);
  const [userGuessType, setUserGuessType] = useState<string>('');
  const [userGuessParam, setUserGuessParam] = useState<string>('');
  const [feedback, setFeedback] = useState<{ checked: boolean; isCorrect: boolean } | null>(null);

  // Coordinate scales
  const width = 640;
  const height = 500;
  const originX = width / 2;
  const originY = height / 2;
  const scale = 28;

  const toSvgX = (x: number) => originX + x * scale;
  const toSvgY = (y: number) => originY - y * scale;

  const currentShape = PRESET_SHAPES[selectedShapeIdx];
  const currentRule = ROTATION_RULES.find((r) => r.key === selectedRuleKey) || ROTATION_RULES[0];

  const rotatedVertices = useMemo(() => {
    return currentShape.vertices.map((v) => {
      const img = currentRule.calc(v.x, v.y);
      return {
        name: v.name + "'",
        x: img.x,
        y: img.y,
      };
    });
  }, [currentShape, currentRule]);

  // Mystery challenge logic
  const currentMystery = MYSTERY_CHALLENGES[mysteryIdx];

  const handleCheckMystery = () => {
    const isTypeCorrect = userGuessType === currentMystery.correctType;
    const isParamCorrect = userGuessParam === currentMystery.correctParam;
    const isCorrect = isTypeCorrect && isParamCorrect;
    if (isCorrect) {
      kit.good();
    } else {
      kit.oops();
    }
    setFeedback({ checked: true, isCorrect });
  };

  const handleNextMystery = () => {
    setMysteryIdx((prev) => (prev + 1) % MYSTERY_CHALLENGES.length);
    setUserGuessType('');
    setUserGuessParam('');
    setFeedback(null);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! उद्गमबिन्दु वरिपरि परिक्रमण (+९०°, -९०°, १८०°) र रहस्यमय रूपान्तरण पहिचान गर्ने अभ्यास गरौं!',
        'Hello! Explore rotation about the origin (+90°, -90°, 180°) and solve transformation mystery challenges!'
      )}
    >
      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b pb-3">
        <button
          onClick={() => setActiveTab('rotation')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'rotation' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔄 परिक्रमण प्रयोगशाला (Rotation Lab)
        </button>
        <button
          onClick={() => setActiveTab('mystery')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'mystery' ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🕵️ रहस्यमय रूपान्तरण पहिचान (Mystery Challenge)
        </button>
      </div>

      {activeTab === 'rotation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visualizer */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-md p-4 border border-slate-200 flex flex-col items-center">
            <svg width={width} height={height} className="border rounded bg-slate-50 shadow-inner select-none max-w-full">
              <defs>
                <pattern id="rot-grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
                  <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
                <marker id="rot-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                </marker>
              </defs>

              <rect width={width} height={height} fill="url(#rot-grid)" />

              {/* Axes */}
              <line x1={0} y1={originY} x2={width} y2={originY} stroke="#94a3b8" strokeWidth="2" />
              <line x1={originX} y1={0} x2={originX} y2={height} stroke="#94a3b8" strokeWidth="2" />

              {/* Tick numbers */}
              {Array.from({ length: 23 }, (_, i) => i - 11).map((val) => {
                if (val === 0) return null;
                const px = toSvgX(val);
                const py = toSvgY(val);
                return (
                  <React.Fragment key={val}>
                    <line x1={px} y1={originY - 3} x2={px} y2={originY + 3} stroke="#64748b" strokeWidth="1.5" />
                    <text x={px} y={originY + 16} fontSize="10" fill="#64748b" textAnchor="middle">
                      {val}
                    </text>
                    <line x1={originX - 3} y1={py} x2={originX + 3} y2={py} stroke="#64748b" strokeWidth="1.5" />
                    <text x={originX - 8} y={py + 3} fontSize="10" fill="#64748b" textAnchor="end">
                      {val}
                    </text>
                  </React.Fragment>
                );
              })}
              <text x={originX - 12} y={originY + 16} fontSize="12" fontWeight="bold" fill="#dc2626">
                O(0,0)
              </text>
              <text x={width - 15} y={originY - 6} fontSize="12" fontWeight="bold" fill="#334155">
                X
              </text>
              <text x={originX + 8} y={15} fontSize="12" fontWeight="bold" fill="#334155">
                Y
              </text>

              {/* Origin indicator circle */}
              <circle cx={originX} cy={originY} r={5} fill="#dc2626" stroke="#fff" strokeWidth="2" />

              {/* Connective rays from origin to vertices and images */}
              {showRays &&
                currentShape.vertices.map((v, i) => {
                  const img = rotatedVertices[i];
                  return (
                    <g key={i}>
                      {/* Ray to object vertex */}
                      <line
                        x1={originX}
                        y1={originY}
                        x2={toSvgX(v.x)}
                        y2={toSvgY(v.y)}
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      {/* Ray to image vertex */}
                      <line
                        x1={originX}
                        y1={originY}
                        x2={toSvgX(img.x)}
                        y2={toSvgY(img.y)}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    </g>
                  );
                })}

              {/* Rotation arc indicator for first vertex */}
              {showArcs && currentShape.vertices.length > 0 && (
                <g>
                  {(() => {
                    const v = currentShape.vertices[0];
                    const r = Math.sqrt(v.x * v.x + v.y * v.y) * scale;
                    const startAngle = Math.atan2(v.y, v.x);
                    const angleDelta = (currentRule.angleDeg * Math.PI) / 180;
                    return (
                      <circle
                        cx={originX}
                        cy={originY}
                        r={r}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity={0.6}
                      />
                    );
                  })()}
                </g>
              )}

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
              {currentShape.type === 'triangle' && (
                <polygon
                  points={currentShape.vertices.map((v) => `${toSvgX(v.x)},${toSvgY(v.y)}`).join(' ')}
                  fill="rgba(37, 99, 235, 0.25)"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />
              )}

              {/* Original vertices */}
              {currentShape.vertices.map((v) => (
                <g key={v.name}>
                  <circle cx={toSvgX(v.x)} cy={toSvgY(v.y)} r={5.5} fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
                  <text x={toSvgX(v.x) + 7} y={toSvgY(v.y) - 6} fontSize="11" fontWeight="bold" fill="#1d4ed8">
                    {v.name}({v.x}, {v.y})
                  </text>
                </g>
              ))}

              {/* Rotated Image Shape (Emerald Green) */}
              {currentShape.type === 'segment' && (
                <line
                  x1={toSvgX(rotatedVertices[0].x)}
                  y1={toSvgY(rotatedVertices[0].y)}
                  x2={toSvgX(rotatedVertices[1].x)}
                  y2={toSvgY(rotatedVertices[1].y)}
                  stroke="#059669"
                  strokeWidth="3.5"
                />
              )}
              {currentShape.type === 'triangle' && (
                <polygon
                  points={rotatedVertices.map((v) => `${toSvgX(v.x)},${toSvgY(v.y)}`).join(' ')}
                  fill="rgba(5, 150, 105, 0.25)"
                  stroke="#059669"
                  strokeWidth="2.5"
                />
              )}

              {/* Rotated vertices */}
              {rotatedVertices.map((v) => (
                <g key={v.name}>
                  <circle cx={toSvgX(v.x)} cy={toSvgY(v.y)} r={5.5} fill="#059669" stroke="#ffffff" strokeWidth="2" />
                  <text x={toSvgX(v.x) + 7} y={toSvgY(v.y) - 6} fontSize="11" fontWeight="bold" fill="#047857">
                    {v.name}({v.x}, {v.y})
                  </text>
                </g>
              ))}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-3 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block"></span>
                मूल वस्तु (Original Shape)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block"></span>
                परिक्रमित प्रतिबिम्ब (Rotated Image)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 inline-block"></span>
                परिक्रमण केन्द्र O(0,0)
              </span>
            </div>
          </div>

          {/* Controls & Rotation Rules */}
          <div className="lg:col-span-4 space-y-4">
            {/* Shape selection */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <h3 className="font-bold text-indigo-900 mb-2 text-xs uppercase tracking-wide">
                आकृति छनोट (Select Shape)
              </h3>
              <div className="grid grid-cols-3 gap-1.5">
                {PRESET_SHAPES.map((shape, idx) => (
                  <button
                    key={shape.type}
                    onClick={() => setSelectedShapeIdx(idx)}
                    className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition-all ${
                      selectedShapeIdx === idx
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-700 hover:bg-indigo-100'
                    }`}
                  >
                    {shape.nameNp}
                  </button>
                ))}
              </div>
            </div>

            {/* Rotation Angle Selection */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">परिक्रमण कोण (Rotation Angle about Origin)</h3>
              <div className="space-y-2">
                {ROTATION_RULES.map((rule) => (
                  <button
                    key={rule.key}
                    onClick={() => setSelectedRuleKey(rule.key)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                      selectedRuleKey === rule.key
                        ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 font-bold text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{rule.labelNp}</span>
                      <span className="font-mono text-[11px] text-indigo-600">{rule.formulaNp}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Toggles */}
              <div className="flex justify-between pt-2 border-t text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRays}
                    onChange={(e) => setShowRays(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  <span>केन्द्र रेखा (Origin Rays)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArcs}
                    onChange={(e) => setShowArcs(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  <span>वृत्ताकार पथ (Rotation Path)</span>
                </label>
              </div>
            </div>

            {/* Coordinate Transformation Display */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-2">
                निर्देशाङ्क रूपान्तरण (Coordinate Mapping)
              </h3>
              <div className="p-2 bg-white rounded border border-emerald-300 font-mono text-center text-sm font-bold text-emerald-800 mb-3">
                {currentRule.formulaNp}
              </div>
              <div className="space-y-1.5 text-xs">
                {currentShape.vertices.map((v, i) => {
                  const img = rotatedVertices[i];
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

      {/* Tab 2: Mystery Transformation Challenge */}
      {activeTab === 'mystery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-xl shadow-md p-4 border border-slate-200 flex flex-col items-center">
            <svg width={width} height={height} className="border rounded bg-slate-50 shadow-inner select-none max-w-full">
              <defs>
                <pattern id="grid-myst" width={scale} height={scale} patternUnits="userSpaceOnUse">
                  <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={width} height={height} fill="url(#grid-myst)" />
              <line x1={0} y1={originY} x2={width} y2={originY} stroke="#94a3b8" strokeWidth="2" />
              <line x1={originX} y1={0} x2={originX} y2={height} stroke="#94a3b8" strokeWidth="2" />

              {/* Object */}
              <polygon
                points={currentMystery.objVertices.map((v) => `${toSvgX(v.x)},${toSvgY(v.y)}`).join(' ')}
                fill="rgba(37, 99, 235, 0.25)"
                stroke="#2563eb"
                strokeWidth="2.5"
              />
              {currentMystery.objVertices.map((v, i) => (
                <circle key={i} cx={toSvgX(v.x)} cy={toSvgY(v.y)} r={5} fill="#2563eb" stroke="#fff" strokeWidth="2" />
              ))}

              {/* Image */}
              <polygon
                points={currentMystery.imgVertices.map((v) => `${toSvgX(v.x)},${toSvgY(v.y)}`).join(' ')}
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10b981"
                strokeWidth="2.5"
              />
              {currentMystery.imgVertices.map((v, i) => (
                <circle key={i} cx={toSvgX(v.x)} cy={toSvgY(v.y)} r={5} fill="#10b981" stroke="#fff" strokeWidth="2" />
              ))}
            </svg>
            <div className="flex gap-4 mt-2 text-xs font-semibold">
              <span className="text-blue-600">■ मूल आकृति (Blue)</span>
              <span className="text-emerald-600">■ रूपान्तरित प्रतिबिम्ब (Green)</span>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-bold text-amber-900 text-sm mb-2">{currentMystery.titleNp}</h3>
              <p className="text-xs text-amber-800 mb-3">
                चित्रमा देखाइएको नीलो आकृतिबाट हरियो प्रतिबिम्ब बन्दा कुन रूपान्तरण भएको हो?
              </p>

              {/* Step 1: Select Type */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    १. रूपान्तरणको प्रकार (Transformation Type):
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { key: 'reflection', label: 'परावर्तन' },
                      { key: 'translation', label: 'विस्थापन' },
                      { key: 'rotation', label: 'परिक्रमण' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => {
                          setUserGuessType(t.key);
                          setFeedback(null);
                        }}
                        className={`py-1.5 px-1 rounded text-xs font-medium border text-center transition-all ${
                          userGuessType === t.key
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-slate-700 hover:bg-amber-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Select Parameter */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    २. रूपान्तरणको विशेषता/पैमाना (Parameter):
                  </label>
                  <div className="space-y-1">
                    {currentMystery.paramOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setUserGuessParam(opt);
                          setFeedback(null);
                        }}
                        className={`w-full text-left p-2 rounded text-xs border transition-all ${
                          userGuessParam === opt
                            ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                            : 'bg-white text-slate-700 hover:bg-amber-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  disabled={!userGuessType || !userGuessParam}
                  onClick={handleCheckMystery}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow transition-all"
                >
                  जाँच गर्नुहोस् (Check)
                </button>
                {feedback && feedback.isCorrect && (
                  <button
                    onClick={handleNextMystery}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow animate-pulse"
                  >
                    अर्को प्रश्न ➡
                  </button>
                )}
              </div>

              {feedback && (
                <div
                  className={`mt-3 p-3 rounded text-xs font-semibold ${
                    feedback.isCorrect ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
                  }`}
                >
                  {feedback.isCorrect ? (
                    <div>
                      🎉 एकदम सही! {currentMystery.explanationNp}
                    </div>
                  ) : (
                    <div>
                      ❌ मिलेन, पुनः प्रयास गर्नुहोस्। निर्देशाङ्कहरूको परिवर्तन तालिका ध्यान दिएर हेर्नुहोस्।
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SimFrame2D>
  );
};
export default RotationTransformationChallenge;
