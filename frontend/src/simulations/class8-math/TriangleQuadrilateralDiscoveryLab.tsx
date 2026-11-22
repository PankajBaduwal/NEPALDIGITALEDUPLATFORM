import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Shapes, Eye, CheckCircle, RefreshCw, Scissors, Compass } from 'lucide-react';

type ShapeTab = 'triangle_sum' | 'equilateral' | 'isosceles' | 'right_isosceles' | 'rhombus' | 'kite' | 'trapezium' | 'quiz_challenge';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै पनि त्रिभुजका तीनवटै भित्री कोणहरूको जोड कति डिग्री हुन्छ?',
    en: 'What is the sum of the three interior angles of any triangle?',
    options: [
      { key: 'A', label: '९०° (90°)' },
      { key: 'B', label: '१८०° (180°)' },
      { key: 'C', label: '२७०° (270°)' },
      { key: 'D', label: '३६०° (360°)' },
    ],
    answer: 'B',
  },
  {
    np: 'समबाहु त्रिभुज (Equilateral triangle) को प्रत्येक भित्री कोणको नाप कति हुन्छ?',
    en: 'What is the measure of each interior angle of an equilateral triangle?',
    options: [
      { key: 'A', label: '४५° (45°)' },
      { key: 'B', label: '६०° (60°)' },
      { key: 'C', label: '९०° (90°)' },
      { key: 'D', label: '१२०° (120°)' },
    ],
    answer: 'B',
  },
  {
    np: 'समचतुर्भुज (Rhombus) का विकर्णहरू (Diagonals) आपसमा कसरी काटिन्छन्?',
    en: 'How do the diagonals of a rhombus intersect each other?',
    options: [
      { key: 'A', label: 'समकोणमा परस्पर समद्विभाजन हुन्छन् (Bisect at 90°)' },
      { key: 'B', label: 'समानान्तर हुन्छन्' },
      { key: 'C', label: 'बराबर लम्बाइका मात्र हुन्छन्' },
      { key: 'D', label: 'काटिँदैनन्' },
    ],
    answer: 'A',
  },
  {
    np: 'पतङ्गाकार चतुर्भुज (Kite) मा कुन विकर्णले अर्को विकर्णलाई लम्ब भएर आधा गर्दछ?',
    en: 'In a kite, which diagonal perpendicularly bisects the other?',
    options: [
      { key: 'A', label: 'सानो विकर्णले ठूलोलाई' },
      { key: 'B', label: 'लामो विकर्णले छोटो विकर्णलाई (Longer bisects shorter at 90°)' },
      { key: 'C', label: 'दुवैले एकअर्कालाई' },
      { key: 'D', label: 'कुनै पनि होइन' },
    ],
    answer: 'B',
  },
  {
    np: 'समलम्ब चतुर्भुज (Trapezium) को प्रमुख विशेषता के हो?',
    en: 'What is the defining characteristic of a trapezium?',
    options: [
      { key: 'A', label: 'सबै भुजाहरू बराबर हुनु' },
      { key: 'B', label: 'सम्मुख भुजाहरूको एक जोडी समानान्तर हुनु (Exactly 1 pair of parallel sides)' },
      { key: 'C', label: 'सबै कोण ९०° हुनु' },
      { key: 'D', label: 'विकर्णहरू बराबर हुनु' },
    ],
    answer: 'B',
  },
];

export const TriangleQuadrilateralDiscoveryLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U14-01',
    chapter: 14,
    titleNp: 'त्रिभुज र चतुर्भुज खोजी प्रयोगशाला',
    titleEn: 'Triangle and Quadrilateral Discovery Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<ShapeTab>('triangle_sum');

  // Dynamic Triangle Angle Explorer state: Vertex C (x, y)
  const [vertexCx, setVertexCx] = useState<number>(200);
  const [vertexCy, setVertexCy] = useState<number>(70);
  const [showCutoutLine, setShowCutoutLine] = useState<boolean>(false);

  // Vertices for standard base AB
  const Ax = 80, Ay = 220;
  const Bx = 320, By = 220;

  // Calculate side lengths
  const cLen = Math.hypot(Bx - Ax, By - Ay); // 240
  const aLen = Math.hypot(vertexCx - Bx, vertexCy - By);
  const bLen = Math.hypot(vertexCx - Ax, vertexCy - Ay);

  // Calculate angles in degrees using Law of Cosines
  const rawAngleA = Math.acos(Math.max(-1, Math.min(1, (bLen * bLen + cLen * cLen - aLen * aLen) / (2 * bLen * cLen)))) * (180 / Math.PI);
  const rawAngleB = Math.acos(Math.max(-1, Math.min(1, (aLen * aLen + cLen * cLen - bLen * bLen) / (2 * aLen * cLen)))) * (180 / Math.PI);
  const degA = Math.round(rawAngleA);
  const degB = Math.round(rawAngleB);
  const degC = 180 - degA - degB;

  // Rhombus angle state
  const [rhombusAngle, setRhombusAngle] = useState<number>(60);
  const [showDiagonals, setShowDiagonals] = useState<boolean>(true);

  // Kite shape state
  const [kiteTopLength, setKiteTopLength] = useState<number>(80);
  const [kiteBottomLength, setKiteBottomLength] = useState<number>(140);
  const [kiteWidth, setKiteWidth] = useState<number>(120);

  // Trapezium state
  const [trapTopWidth, setTrapTopWidth] = useState<number>(140);
  const [trapHeight, setTrapHeight] = useState<number>(120);
  const [trapShift, setTrapShift] = useState<number>(30);

  // Property Quiz State
  const [challengeScore, setChallengeScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleChallengePick = (key: string, isCorrect: boolean, feedbackNp: string, feedbackEn: string) => {
    setSelectedAnswer(key);
    if (isCorrect) {
      kit.good();
      setChallengeScore((s) => s + 1);
      setChallengeFeedback({ ok: true, msg: L(feedbackNp, feedbackEn) });
    } else {
      kit.oops();
      setChallengeFeedback({ ok: false, msg: L(feedbackNp, feedbackEn) });
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते विद्यार्थी साथीहरू! त्रिभुज, समचतुर्भुज, पतङ्ग र समलम्ब चतुर्भुजका सबै ज्यामितीय गुणहरू आफैं नापेर र चलाएर पत्ता लगाऔं!',
        'Hello students! Explore and experimentally verify all properties of triangles, rhombuses, kites, and trapeziums!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('triangle_sum')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'triangle_sum' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('१. त्रिभुज कोण जोड (180°)', '1. Triangle Angle Sum')}
          </button>
          <button
            onClick={() => setActiveTab('equilateral')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'equilateral' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('२. समबाहु त्रिभुज (60°)', '2. Equilateral (60°)')}
          </button>
          <button
            onClick={() => setActiveTab('isosceles')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'isosceles' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('३. समद्विबाहु त्रिभुज', '3. Isosceles Base Angles')}
          </button>
          <button
            onClick={() => setActiveTab('right_isosceles')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'right_isosceles' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('४. समकोण समद्विबाहु (45°)', '4. Right Isosceles (45°)')}
          </button>
          <button
            onClick={() => setActiveTab('rhombus')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rhombus' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('५. समचतुर्भुज (Rhombus)', '5. Rhombus')}
          </button>
          <button
            onClick={() => setActiveTab('kite')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'kite' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('६. पतङ्गाकार (Kite)', '6. Kite')}
          </button>
          <button
            onClick={() => setActiveTab('trapezium')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'trapezium' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('७. समलम्ब (Trapezium)', '7. Trapezium')}
          </button>
        </div>

        {/* Tab 1: Triangle Angle Explorer */}
        {activeTab === 'triangle_sum' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-amber-300 text-base flex items-center gap-2">
                  <span>📐</span> {L('त्रिभुजका तीन भित्री कोणहरूको योगफल = १८०°', 'Sum of Interior Angles of a Triangle = 180°')}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {L('शीर्षबिन्दु C लाई सार्नुहोस् र आकार जुनसुकै भए तापनि तीनवटै कोणको जोड सधैं १८०° रहने प्रमाण हेर्नुहोस्।', 'Drag vertex C. Regardless of how the triangle shifts, the sum of interior angles remains exactly 180°.')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCutoutLine(!showCutoutLine)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                    showCutoutLine ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <Scissors size={14} />
                  {showCutoutLine ? L('कोण काटेर सीधा रेखामा हेर्नुहोस्', 'Hide Straight Line Cutout') : L('कोण काटेर सीधा रेखामा मिलाउनुहोस्', 'Arrange Angles on Straight Line')}
                </button>
                <button
                  onClick={() => { setVertexCx(200); setVertexCy(70); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Sliders for moving vertex C */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900/70 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {L('शीर्षबिन्दु C को दायाँ-बायाँ स्थिति (Horizontal X):', 'Vertex C Horizontal Position (X):')} {vertexCx}
                </label>
                <input
                  type="range"
                  min="60"
                  max="340"
                  value={vertexCx}
                  onChange={(e) => setVertexCx(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {L('शीर्षबिन्दु C को उचाइ स्थिति (Vertical Height Y):', 'Vertex C Height Position (Y):')} {240 - vertexCy}
                </label>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={vertexCy}
                  onChange={(e) => setVertexCy(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Interactive SVG Stage */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center">
              <svg viewBox="0 0 420 280" className="w-full max-w-xl h-64 select-none">
                <defs>
                  <pattern id="gridTri" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="420" height="280" fill="url(#gridTri)" />

                {/* Triangle Polygon */}
                <polygon
                  points={`${Ax},${Ay} ${Bx},${By} ${vertexCx},${vertexCy}`}
                  fill="rgba(245, 158, 11, 0.15)"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                {/* Angle Arcs */}
                <circle cx={Ax} cy={Ay} r="24" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx={Bx} cy={By} r="24" fill="rgba(168, 85, 247, 0.25)" stroke="#a855f7" strokeWidth="1.5" />
                <circle cx={vertexCx} cy={vertexCy} r="24" fill="rgba(34, 197, 94, 0.25)" stroke="#22c55e" strokeWidth="1.5" />

                {/* Vertices */}
                <circle cx={Ax} cy={Ay} r="6" fill="#38bdf8" />
                <circle cx={Bx} cy={By} r="6" fill="#a855f7" />
                <circle cx={vertexCx} cy={vertexCy} r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" className="cursor-pointer" />

                {/* Labels */}
                <text x={Ax - 20} y={Ay + 10} fill="#38bdf8" fontSize="13" fontWeight="bold">A ({degA}°)</text>
                <text x={Bx + 10} y={By + 10} fill="#a855f7" fontSize="13" fontWeight="bold">B ({degB}°)</text>
                <text x={vertexCx} y={vertexCy - 14} fill="#f59e0b" fontSize="13" fontWeight="bold" textAnchor="middle">C ({degC}°)</text>

                {/* Straight line arrangement when toggled */}
                {showCutoutLine && (
                  <g transform="translate(60, 255)">
                    <line x1="0" y1="0" x2="300" y2="0" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
                    {/* Semi-circle straight angle pieces */}
                    <path d="M 120 0 A 30 30 0 0 0 150 -30 L 150 0 Z" fill="#38bdf8" fillOpacity="0.7" />
                    <path d="M 150 0 L 150 -30 A 30 30 0 0 1 180 0 Z" fill="#22c55e" fillOpacity="0.7" />
                    <text x="150" y="18" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle">
                      ∠A + ∠B + ∠C = सरल कोण (Straight Angle = 180°)
                    </text>
                  </g>
                )}
              </svg>

              {/* Dynamic Math Verification Box */}
              <div className="w-full max-w-xl mt-3 p-3 bg-slate-900 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {L('कोणहरूको जोड:', 'Sum of Angles:')}
                </span>
                <div className="font-mono text-base font-bold text-amber-300">
                  <span className="text-sky-400">∠A ({degA}°)</span> + <span className="text-purple-400">∠B ({degB}°)</span> + <span className="text-emerald-400">∠C ({degC}°)</span> = <span className="text-white text-lg">180°</span> ✅
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Equilateral Triangle */}
        {activeTab === 'equilateral' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-amber-300 text-base">
                {L('समबाहु त्रिभुजका गुणहरू (Equilateral Triangle Properties)', 'Equilateral Triangle Properties')}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {L('तीनवटै भुजाहरू बराबर हुन्छन् (AB = BC = CA) र तीनवटै कोणहरू बराबर भई प्रत्येक ६०° हुन्छन् (∠A = ∠B = ∠C = ६०°)।', 'All three sides are equal (AB = BC = CA) and all three angles are equal to 60° (∠A = ∠B = ∠C = 60°).')}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
              <svg viewBox="0 0 400 260" className="w-full max-w-md h-64">
                {/* Equilateral polygon */}
                <polygon points="200,45 85,225 315,225" fill="rgba(14, 165, 233, 0.15)" stroke="#38bdf8" strokeWidth="3" />
                {/* Hash marks on sides */}
                <line x1="138" y1="130" x2="148" y2="135" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="252" y1="135" x2="262" y2="130" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="198" y1="220" x2="202" y2="230" stroke="#38bdf8" strokeWidth="2.5" />

                {/* Angle texts */}
                <text x="85" y="245" fill="#38bdf8" fontSize="13" fontWeight="bold">A (60°)</text>
                <text x="315" y="245" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="end">B (60°)</text>
                <text x="200" y="32" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">C (60°)</text>

                {/* Folding line of symmetry */}
                <line x1="200" y1="45" x2="200" y2="225" stroke="#eab308" strokeWidth="2" strokeDasharray="5 4" />
                <text x="210" y="140" fill="#eab308" fontSize="11" fontWeight="bold">सममिति अक्ष (Axis of Symmetry)</text>
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
                <div className="text-xs text-slate-400">{L('बराबर भुजाहरू', 'Equal Sides')}</div>
                <div className="font-mono font-bold text-amber-300 mt-1">AB = BC = CA</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
                <div className="text-xs text-slate-400">{L('प्रत्येक भित्री कोण', 'Each Interior Angle')}</div>
                <div className="font-mono font-bold text-emerald-300 mt-1">180° ÷ 3 = 60°</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
                <div className="text-xs text-slate-400">{L('सममितिका अक्षहरू', 'Axes of Symmetry')}</div>
                <div className="font-mono font-bold text-sky-300 mt-1">३ वटा (3 Axes)</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Isosceles Triangle */}
        {activeTab === 'isosceles' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-amber-300 text-base">
                {L('समद्विबाहु त्रिभुजका गुणहरू (Isosceles Triangle Base Angles)', 'Isosceles Triangle Base Angles Theorem')}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {L('कुनै पनि त्रिभुजका दुई भुजाहरू बराबर भएमा तिनका सम्मुख कोणहरू (आधार कोणहरू / Base Angles) पनि बराबर हुन्छन्।', 'If two sides of a triangle are equal, the angles opposite to them (the base angles) are also equal.')}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
              <svg viewBox="0 0 400 260" className="w-full max-w-md h-64">
                {/* Isosceles triangle */}
                <polygon points="200,40 100,230 300,230" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="3" />
                {/* Hash marks on AC and BC */}
                <line x1="145" y1="130" x2="155" y2="135" stroke="#a855f7" strokeWidth="2.5" />
                <line x1="245" y1="135" x2="255" y2="130" stroke="#a855f7" strokeWidth="2.5" />

                {/* Base angle arcs */}
                <path d="M 125 230 A 25 25 0 0 0 114 207" fill="none" stroke="#22c55e" strokeWidth="2" />
                <path d="M 275 230 A 25 25 0 0 1 286 207" fill="none" stroke="#22c55e" strokeWidth="2" />

                {/* Labels */}
                <text x="80" y="245" fill="#22c55e" fontSize="13" fontWeight="bold">∠A (68°)</text>
                <text x="320" y="245" fill="#22c55e" fontSize="13" fontWeight="bold" textAnchor="end">∠B (68°)</text>
                <text x="200" y="28" fill="#e2e8f0" fontSize="13" fontWeight="bold" textAnchor="middle">∠C (44°)</text>

                <text x="130" y="115" fill="#a855f7" fontSize="12" fontWeight="bold">AC</text>
                <text x="260" y="115" fill="#a855f7" fontSize="12" fontWeight="bold">BC</text>
              </svg>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center font-mono text-sm text-emerald-300">
              AC = BC ⇒ आधार कोण ∠A = ∠B = 68° | शीर्ष कोण ∠C = 180° - (68° + 68°) = 44°
            </div>
          </div>
        )}

        {/* Tab 4: Right-Angled Isosceles Triangle */}
        {activeTab === 'right_isosceles' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-amber-300 text-base">
                {L('समकोण समद्विबाहु त्रिभुज (Right-Angled Isosceles Triangle)', 'Right-Angled Isosceles Triangle')}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {L('एउटा कोण समकोण (९०°) र अन्य दुई भुजा बराबर भएको त्रिभुज। यसका दुई आधार कोणहरू बराबर भई प्रत्येक ४५° हुन्छन्: ९०° + ४५° + ४५° = १८०°।', 'A triangle with one right angle (90°) and two equal legs. Its remaining two base angles are equal and each measures exactly 45°: 90° + 45° + 45° = 180°.')}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
              <svg viewBox="0 0 380 260" className="w-full max-w-md h-64">
                <polygon points="90,50 90,220 260,220" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="3" />
                {/* 90 deg corner square */}
                <rect x="90" y="200" width="20" height="20" fill="none" stroke="#22c55e" strokeWidth="2" />

                {/* Hash marks on perpendicular and base */}
                <line x1="85" y1="135" x2="95" y2="135" stroke="#22c55e" strokeWidth="2.5" />
                <line x1="175" y1="215" x2="175" y2="225" stroke="#22c55e" strokeWidth="2.5" />

                <text x="60" y="235" fill="#22c55e" fontSize="13" fontWeight="bold">∠B = 90°</text>
                <text x="70" y="45" fill="#38bdf8" fontSize="13" fontWeight="bold">∠A = 45°</text>
                <text x="270" y="235" fill="#38bdf8" fontSize="13" fontWeight="bold">∠C = 45°</text>
                <text x="190" y="125" fill="#e2e8f0" fontSize="12" fontWeight="bold">कर्ण (Hypotenuse)</text>
              </svg>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center font-mono text-sm text-slate-200">
              ∠A + ∠B + ∠C = 45° + 90° + 45° = <span className="text-amber-400 font-bold">180°</span>
            </div>
          </div>
        )}

        {/* Tab 5: Rhombus Explorer */}
        {activeTab === 'rhombus' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-amber-300 text-base">
                  {L('समचतुर्भुजका गुणहरू (Properties of Rhombus)', 'Properties of a Rhombus')}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {L('चारवटै भुजा बराबर (AB = BC = CD = DA), सम्मुख कोण बराबर, र विकर्णहरूले एकअर्कालाई समकोण (९०°) मा समद्विभाजन गर्छन्।', 'All 4 sides are equal, opposite angles are equal, and diagonals bisect each other perpendicularly at 90°.')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDiagonals(!showDiagonals)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                    showDiagonals ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {showDiagonals ? L('विकर्ण लुकाउनुहोस्', 'Hide Diagonals') : L('विकर्ण देखाउनुहोस्', 'Show Diagonals')}
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-800">
              <label className="text-xs text-slate-400 block mb-1">
                {L('समचतुर्भुजको कोण परिवर्तन गर्नुहोस् (Tilt Angle):', 'Rhombus Tilt Angle:')} {rhombusAngle}°
              </label>
              <input
                type="range"
                min="40"
                max="90"
                value={rhombusAngle}
                onChange={(e) => setRhombusAngle(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* SVG Rhombus */}
            {(() => {
              const rad = (rhombusAngle * Math.PI) / 180;
              const side = 150;
              const x1 = 120, y1 = 210;
              const x2 = x1 + side, y2 = 210;
              const x3 = x2 + side * Math.cos(rad), y3 = 210 - side * Math.sin(rad);
              const x4 = x1 + side * Math.cos(rad), y4 = 210 - side * Math.sin(rad);
              const oppAngle = 180 - rhombusAngle;

              return (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
                  <svg viewBox="0 0 450 250" className="w-full max-w-lg h-64">
                    <polygon
                      points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
                      fill="rgba(245, 158, 11, 0.15)"
                      stroke="#f59e0b"
                      strokeWidth="3"
                    />
                    {showDiagonals && (
                      <g>
                        {/* Diagonals */}
                        <line x1={x1} y1={y1} x2={x3} y2={y3} stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3" />
                        <line x1={x2} y1={y2} x2={x4} y2={y4} stroke="#a855f7" strokeWidth="2" strokeDasharray="5 3" />
                        {/* Intersection 90 deg marker */}
                        <circle cx={(x1 + x3) / 2} cy={(y1 + y3) / 2} r="4" fill="#ffffff" />
                        <text x={(x1 + x3) / 2 + 8} y={(y1 + y3) / 2 - 8} fill="#22c55e" fontSize="12" fontWeight="bold">90°</text>
                      </g>
                    )}

                    <text x={x1 - 15} y={y1 + 10} fill="#f59e0b" fontSize="13" fontWeight="bold">A ({rhombusAngle}°)</text>
                    <text x={x2 + 10} y={y2 + 10} fill="#f59e0b" fontSize="13" fontWeight="bold">B ({oppAngle}°)</text>
                    <text x={x3 + 10} y={y3 - 5} fill="#f59e0b" fontSize="13" fontWeight="bold">C ({rhombusAngle}°)</text>
                    <text x={x4 - 15} y={y4 - 5} fill="#f59e0b" fontSize="13" fontWeight="bold">D ({oppAngle}°)</text>
                  </svg>
                </div>
              );
            })()}

            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-center text-xs text-amber-200">
              💡 {L('स्मरण रहोस्: वर्ग (Square) एउटा विशेष समचतुर्भुज हो जहाँ सबै कोण ९०° हुन्छन्। तर सबै समचतुर्भुज वर्ग होइनन्।', 'Note: A square is a special rhombus where all angles are 90°, but not every rhombus is a square.')}
            </div>
          </div>
        )}

        {/* Tab 6: Kite Explorer */}
        {activeTab === 'kite' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-amber-300 text-base">
                {L('पतङ्गाकार चतुर्भुजका गुणहरू (Properties of Kite)', 'Properties of a Kite')}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {L('आसन्न भुजाहरूका दुई जोडी बराबर (AB = AD र BC = CD), असमान भुजाहरूबीचका कोणहरू बराबर (∠B = ∠D), र लामो विकर्णले छोटो विकर्णलाई लम्ब भएर आधा गर्दछ।', 'Two pairs of equal adjacent sides (AB = AD and BC = CD), equal angles between unequal sides (∠B = ∠D), and the longer diagonal perpendicularly bisects the shorter diagonal.')}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
              <svg viewBox="0 0 380 280" className="w-full max-w-md h-72">
                {/* Kite Vertices: Top A, Right B, Bottom C, Left D */}
                {/* Center of intersection at (190, 110) */}
                <polygon points="190,30 270,110 190,250 110,110" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="3" />
                {/* Diagonals */}
                <line x1="190" y1="30" x2="190" y2="250" stroke="#f59e0b" strokeWidth="2.5" />
                <line x1="110" y1="110" x2="270" y2="110" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" />

                {/* 90 deg corner */}
                <rect x="190" y="110" width="14" height="14" fill="none" stroke="#22c55e" strokeWidth="1.5" />

                {/* Hash marks on equal adjacent sides */}
                <line x1="145" y1="67" x2="153" y2="73" stroke="#a855f7" strokeWidth="2" />
                <line x1="227" y1="73" x2="235" y2="67" stroke="#a855f7" strokeWidth="2" />

                <line x1="148" y1="177" x2="154" y2="183" stroke="#a855f7" strokeWidth="2" />
                <line x1="144" y1="181" x2="150" y2="187" stroke="#a855f7" strokeWidth="2" />
                <line x1="226" y1="183" x2="232" y2="177" stroke="#a855f7" strokeWidth="2" />
                <line x1="230" y1="187" x2="236" y2="181" stroke="#a855f7" strokeWidth="2" />

                <text x="190" y="20" fill="#f59e0b" fontSize="13" fontWeight="bold" textAnchor="middle">A</text>
                <text x="280" y="115" fill="#38bdf8" fontSize="13" fontWeight="bold">B (∠B)</text>
                <text x="190" y="270" fill="#f59e0b" fontSize="13" fontWeight="bold" textAnchor="middle">C</text>
                <text x="75" y="115" fill="#38bdf8" fontSize="13" fontWeight="bold">D (∠D)</text>
                <text x="205" y="105" fill="#22c55e" fontSize="11" fontWeight="bold">90°</text>
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center font-mono text-xs text-slate-200">
                AB = AD &nbsp;|&nbsp; BC = CD &nbsp;|&nbsp; ∠B = ∠D
              </div>
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center font-mono text-xs text-amber-300">
                लामो विकर्ण AC ⊥ छोटो विकर्ण BD (BD आधा हुन्छ)
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Trapezium Explorer */}
        {activeTab === 'trapezium' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-amber-300 text-base">
                {L('समलम्ब चतुर्भुजका गुणहरू (Properties of Trapezium)', 'Properties of a Trapezium')}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {L('सम्मुख भुजाहरूको ठीक एक जोडी समानान्तर हुन्छ (AB ∥ CD)। असमानान्तर भुजामा पर्ने क्रमागत भित्री कोणहरूको जोड १८०° हुन्छ (∠A + ∠D = १८०° र ∠B + ∠C = १८०°)।', 'Exactly one pair of opposite sides is parallel (AB ∥ CD). Co-interior angles along the non-parallel sides add up to 180° (∠A + ∠D = 180° and ∠B + ∠C = 180°).')}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
              <svg viewBox="0 0 420 240" className="w-full max-w-lg h-60">
                {/* Trapezium points: A(70, 200), B(350, 200), C(280, 70), D(140, 70) */}
                <polygon points="70,200 350,200 280,70 140,70" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="3" />

                {/* Parallel arrow markers on DC and AB */}
                <polygon points="205,67 215,70 205,73" fill="#38bdf8" />
                <polygon points="205,197 215,200 205,203" fill="#38bdf8" />

                <text x="50" y="215" fill="#38bdf8" fontSize="13" fontWeight="bold">A (65°)</text>
                <text x="360" y="215" fill="#38bdf8" fontSize="13" fontWeight="bold">B (75°)</text>
                <text x="290" y="65" fill="#38bdf8" fontSize="13" fontWeight="bold">C (105°)</text>
                <text x="125" y="65" fill="#38bdf8" fontSize="13" fontWeight="bold">D (115°)</text>
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center font-mono text-sm text-emerald-300">
                ∠A + ∠D = 65° + 115° = 180° (Co-Interior)
              </div>
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center font-mono text-sm text-emerald-300">
                ∠B + ∠C = 75° + 105° = 180° (Co-Interior)
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default TriangleQuadrilateralDiscoveryLab;
