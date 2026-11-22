/**
 * GeometryAreaExplorer.tsx
 * Grade 8 Mathematics – Unit 8: AREA AND VOLUME (क्षेत्रफल र आयतन)
 * Simulation 1: Geometry Area Explorer (ज्यामितीय क्षेत्रफल अन्वेषक)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 8)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Square, Triangle, Move, CheckCircle, RefreshCw, Award, Layers, Calculator } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'समबाहु त्रिभुज (Equilateral Triangle) को भुजा a भए यसको क्षेत्रफल निकाल्ने सूत्र कुन हो?',
    en: 'If a is the side length of an equilateral triangle, which is the formula for its area?',
    options: [
      { key: 'A', label: 'A = (√3 / 4) a²' },
      { key: 'B', label: 'A = (1 / 2) a²' },
      { key: 'C', label: 'A = √3 a' },
      { key: 'D', label: 'A = (3 / 4) a²' },
    ],
    answer: 'A',
  },
  {
    np: 'समलम्ब चतुर्भुज (Trapezium) का समानान्तर भुजाहरू a र b तथा उचाइ h भए यसको क्षेत्रफल कति हुन्छ?',
    en: 'If a and b are parallel sides and h is perpendicular height of a trapezium, what is its area?',
    options: [
      { key: 'A', label: 'A = 1/2 (a + b) h' },
      { key: 'B', label: 'A = (a + b) h' },
      { key: 'C', label: 'A = 1/2 a b h' },
      { key: 'D', label: 'A = 2 (a + b) h' },
    ],
    answer: 'A',
  },
  {
    np: 'समचतुर्भुज (Rhombus) का दुई विकर्णहरू d₁ = ८ सेमी र d₂ = ६ सेमी भए क्षेत्रफल कति हुन्छ?',
    en: 'If the diagonals of a rhombus are d₁ = 8 cm and d₂ = 6 cm, what is its area?',
    options: [
      { key: 'A', label: '२४ वर्ग सेमी [ A = 1/2 × ८ × ६ = २४ ]' },
      { key: 'B', label: '४८ वर्ग सेमी' },
      { key: 'C', label: '१४ वर्ग सेमी' },
      { key: 'D', label: '२८ वर्ग सेमी' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै त्रिभुजको शीर्षबिन्दु आधारसँग समानान्तर रेखामा सारेमा त्यसको क्षेत्रफलमा के परिवर्तन आउँछ?',
    en: 'If the vertex of a triangle moves along a line parallel to its base, what happens to its area?',
    options: [
      { key: 'A', label: 'क्षेत्रफल स्थिर रहन्छ (आधार र लम्ब उचाइ समान भएकोले)' },
      { key: 'B', label: 'क्षेत्रफल बढ्छ' },
      { key: 'C', label: 'क्षेत्रफल घट्छ' },
      { key: 'D', label: 'शून्य हुन्छ' },
    ],
    answer: 'A',
  },
  {
    np: 'चतुर्भुजको विकर्ण d = १० सेमी र विपरीत शीर्षहरूबाट खिचिएका लम्बहरू h₁ = ४ सेमी र h₂ = ३ सेमी भए क्षेत्रफल कति हुन्छ?',
    en: 'If diagonal d = 10 cm and perpendicular offsets are h₁ = 4 cm and h₂ = 3 cm, what is the area?',
    options: [
      { key: 'A', label: '३५ वर्ग सेमी [ 1/2 × १० × (४ + ३) = ३५ ]' },
      { key: 'B', label: '७० वर्ग सेमी' },
      { key: 'C', label: '४० वर्ग सेमी' },
      { key: 'D', label: '३० वर्ग सेमी' },
    ],
    answer: 'A',
  },
];

export const GeometryAreaExplorer: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U8-01',
    chapter: 8,
    titleNp: 'ज्यामितीय क्षेत्रफल अन्वेषक (Geometry Area Explorer)',
    titleEn: 'Geometry Area Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'triangles' | 'quadrilaterals' | 'vertex_shear' | 'challenge'>('triangles');

  // Triangle exploration state
  const [triType, setTriType] = useState<'right' | 'general' | 'equilateral' | 'isosceles'>('equilateral');
  const [baseB, setBaseB] = useState<number>(10);
  const [heightH, setHeightH] = useState<number>(8);
  const [sideA, setSideA] = useState<number>(10); // for equilateral & isosceles
  const [isoBase, setIsoBase] = useState<number>(8);

  // Quadrilateral state
  const [quadType, setQuadType] = useState<'parallelogram' | 'rhombus' | 'trapezium' | 'general_quad'>('parallelogram');
  const [pBase, setPBase] = useState<number>(12);
  const [pHeight, setPHeight] = useState<number>(7);
  const [diag1, setDiag1] = useState<number>(10);
  const [diag2, setDiag2] = useState<number>(8);
  const [trapA, setTrapA] = useState<number>(12);
  const [trapB, setTrapB] = useState<number>(8);
  const [trapH, setTrapH] = useState<number>(6);
  const [gDiag, setGDiag] = useState<number>(14);
  const [gh1, setGh1] = useState<number>(5);
  const [gh2, setGh2] = useState<number>(4);

  // Vertex shear demonstration state (C moves along parallel line y = H)
  const [vertexX, setVertexX] = useState<number>(6); // 0 to 14

  // Calculations
  const calcRightTriArea = 0.5 * baseB * heightH;
  const calcGeneralTriArea = 0.5 * baseB * heightH;
  const calcEquiHeight = (Math.sqrt(3) / 2) * sideA;
  const calcEquiArea = (Math.sqrt(3) / 4) * sideA * sideA;
  const calcIsoHeight = Math.sqrt(Math.max(0, sideA * sideA - (isoBase / 2) * (isoBase / 2)));
  const calcIsoArea = 0.5 * isoBase * calcIsoHeight;

  // Quad calculations
  const calcParaArea = pBase * pHeight;
  const calcRhombusArea = 0.5 * diag1 * diag2;
  const calcTrapArea = 0.5 * (trapA + trapB) * trapH;
  const calcGeneralQuadArea = 0.5 * gDiag * (gh1 + gh2);

  // Challenge State
  const [chalIndex, setChalIndex] = useState(0);
  const [userAreaInput, setUserAreaInput] = useState('');
  const [chalFeedback, setChalFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  const CHALLENGE_ITEMS = [
    {
      titleNp: 'समबाहु त्रिभुज (CDC उदाहरण)',
      titleEn: 'Equilateral Triangle',
      descNp: 'एउटा समबाहु त्रिभुजको प्रत्येक भुजा ८ सेमी छ। यसको क्षेत्रफल पत्ता लगाउनुहोस्। [सूत्र: A = (√3/4) a²; √3 ≈ 1.732]',
      descEn: 'Each side of an equilateral triangle is 8 cm. Find its area [A = (√3/4) a²; √3 ≈ 1.732].',
      target: ((Math.sqrt(3) / 4) * 64),
      unit: 'cm²',
      formula: 'A = (√3/4) × 8² = (1.732 ÷ 4) × 64 ≈ 27.71 cm²',
    },
    {
      titleNp: 'समलम्ब चतुर्भुज (CDC उदाहरण)',
      titleEn: 'Trapezium',
      descNp: 'समानान्तर भुजाहरू १५ सेमी र ९ सेमी तथा उचाइ ६ सेमी भएको समलम्ब चतुर्भुजको क्षेत्रफल पत्ता लगाउनुहोस्।',
      descEn: 'Find the area of a trapezium with parallel sides 15 cm and 9 cm and height 6 cm.',
      target: 0.5 * (15 + 9) * 6,
      unit: 'cm²',
      formula: 'A = 1/2 × (15 + 9) × 6 = 1/2 × 24 × 6 = 72 cm²',
    },
    {
      titleNp: 'समचतुर्भुज (Rhombus)',
      titleEn: 'Rhombus',
      descNp: 'एउटा समचतुर्भुजका विकर्णहरू १२ सेमी र १० सेमी छन् भने यसको क्षेत्रफल कति हुन्छ?',
      descEn: 'The diagonals of a rhombus are 12 cm and 10 cm. Find its area.',
      target: 0.5 * 12 * 10,
      unit: 'cm²',
      formula: 'A = 1/2 × d₁ × d₂ = 1/2 × 12 × 10 = 60 cm²',
    },
  ];

  const handleCheckChallenge = () => {
    const cur = CHALLENGE_ITEMS[chalIndex];
    const val = parseFloat(userAreaInput);
    if (Math.abs(val - cur.target) < 0.5) {
      kit.good();
      setChalFeedback({
        isCorrect: true,
        msg: L(`उत्कृष्ट! सही क्षेत्रफल: ${toNp(cur.target.toFixed(2))} ${cur.unit}`, `Brilliant! Correct: ${cur.target.toFixed(2)} ${cur.unit}`),
      });
    } else {
      kit.oops();
      setChalFeedback({
        isCorrect: false,
        msg: L(`पुनः प्रयास गर्नुहोस्! कार्यविधि: ${cur.formula}`, `Try again! Hint: ${cur.formula}`),
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
        'नमस्ते! ज्यामितिमा त्रिभुज र चतुर्भुजहरूको क्षेत्रफल केवल सूत्र मात्र होइन, सतहको नाप हो! आउनुहोस् प्रमाणसहित अन्वेषण गरौं!',
        'Hello! In geometry, area is not just a formula, it is the measurement of surface. Let us explore derivations and calculations!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('triangles')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'triangles' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Triangle className="w-4 h-4" />
            {L('१. त्रिभुजहरूको क्षेत्रफल (Triangles)', '1. Triangle Types & Derivations')}
          </button>
          <button
            onClick={() => setActiveTab('quadrilaterals')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'quadrilaterals' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Square className="w-4 h-4" />
            {L('२. चतुर्भुजहरूको क्षेत्रफल (Quadrilaterals)', '2. Quadrilateral Family')}
          </button>
          <button
            onClick={() => setActiveTab('vertex_shear')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'vertex_shear' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Move className="w-4 h-4" />
            {L('३. शीर्षबिन्दु सार्दा क्षेत्रफल (Constant Area Demo)', '3. Vertex Shear Principle')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'challenge' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            {L('४. पाठ्यपुस्तक चुनौती (CDC Challenge)', '4. CDC Challenge')}
          </button>
        </div>

        {/* Tab 1: Triangles */}
        {activeTab === 'triangles' && (
          <div className="space-y-6">
            {/* Triangle Sub-selector */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'equilateral', np: 'समबाहु त्रिभुज (Equilateral)', en: 'Equilateral Triangle' },
                { id: 'isosceles', np: 'समद्विबाहु त्रिभुज (Isosceles)', en: 'Isosceles Triangle' },
                { id: 'right', np: 'समकोण त्रिभुज (Right-Angled)', en: 'Right-Angled Triangle' },
                { id: 'general', np: 'साधारण त्रिभुज (General Triangle)', en: 'General Triangle' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTriType(item.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    triType === item.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {isNe ? item.np : item.en}
                </button>
              ))}
            </div>

            {/* SVG Visual and Info */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* SVG Canvas */}
              <div className="w-full h-64 bg-slate-800 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                <svg viewBox="0 0 300 220" className="w-full h-full">
                  {/* Grid background */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="300" height="220" fill="url(#grid)" />

                  {/* Equilateral Triangle */}
                  {triType === 'equilateral' && (
                    <g>
                      <polygon points="150,30 60,186 240,186" fill="rgba(99, 102, 241, 0.35)" stroke="#818cf8" strokeWidth="3" />
                      {/* Altitude / Height line */}
                      <line x1="150" y1="30" x2="150" y2="186" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
                      {/* Right angle marker at base */}
                      <rect x="150" y="174" width="12" height="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                      {/* Labels */}
                      <text x="150" y="205" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontWeight="bold">
                        a = {toNp(sideA)} cm
                      </text>
                      <text x="155" y="110" fill="#fbbf24" fontSize="11" fontWeight="bold">
                        h = {toNp(calcEquiHeight.toFixed(1))} cm
                      </text>
                      <text x="90" y="95" fill="#a5b4fc" fontSize="11" textAnchor="end">a</text>
                      <text x="210" y="95" fill="#a5b4fc" fontSize="11">a</text>
                    </g>
                  )}

                  {/* Isosceles Triangle */}
                  {triType === 'isosceles' && (
                    <g>
                      <polygon points="150,35 70,185 230,185" fill="rgba(16, 185, 129, 0.35)" stroke="#34d399" strokeWidth="3" />
                      <line x1="150" y1="35" x2="150" y2="185" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
                      <rect x="150" y="173" width="12" height="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="150" y="205" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontWeight="bold">
                        b = {toNp(isoBase)} cm (आधार)
                      </text>
                      <text x="155" y="110" fill="#fbbf24" fontSize="11" fontWeight="bold">
                        h = {toNp(calcIsoHeight.toFixed(1))} cm
                      </text>
                      <text x="95" y="100" fill="#6ee7b7" fontSize="11" textAnchor="end">a = {toNp(sideA)}</text>
                      <text x="205" y="100" fill="#6ee7b7" fontSize="11">a = {toNp(sideA)}</text>
                    </g>
                  )}

                  {/* Right Triangle */}
                  {triType === 'right' && (
                    <g>
                      {/* Visual rectangle half */}
                      <rect x="60" y="40" width="180" height="140" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeDasharray="4,4" />
                      <line x1="60" y1="40" x2="240" y2="180" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,4" />
                      <polygon points="60,40 60,180 240,180" fill="rgba(244, 63, 94, 0.35)" stroke="#f43f5e" strokeWidth="3" />
                      <rect x="60" y="165" width="15" height="15" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="150" y="202" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontWeight="bold">
                        b = {toNp(baseB)} cm (आधार)
                      </text>
                      <text x="45" y="115" fill="#e2e8f0" fontSize="11" textAnchor="end" fontWeight="bold">
                        h = {toNp(heightH)} cm (उचाइ)
                      </text>
                      <text x="170" y="100" fill="#fda4af" fontSize="10">
                        {L('आयातको आधा (Half Rect)', 'Half Rectangle')}
                      </text>
                    </g>
                  )}

                  {/* General Triangle */}
                  {triType === 'general' && (
                    <g>
                      <polygon points="120,40 40,180 250,180" fill="rgba(59, 130, 246, 0.35)" stroke="#60a5fa" strokeWidth="3" />
                      <line x1="120" y1="40" x2="120" y2="180" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
                      <rect x="120" y="168" width="12" height="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="145" y="202" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontWeight="bold">
                        b = {toNp(baseB)} cm (आधार)
                      </text>
                      <text x="125" y="110" fill="#fbbf24" fontSize="11" fontWeight="bold">
                        h = {toNp(heightH)} cm
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Formula and Details Panel */}
              <div className="space-y-4">
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                  <div className="text-xs text-amber-400 font-bold uppercase">{L('क्षेत्रफल सूत्र र प्रतिपादन:', 'Area Formula & Derivation:')}</div>

                  {triType === 'equilateral' && (
                    <div className="space-y-2 mt-2 text-xs text-slate-300 font-mono">
                      <div className="text-base font-black text-indigo-400">A = (√3 / 4) a²</div>
                      <div>१. लम्बले आधारलाई आधा गर्छ: b/2 = a/2</div>
                      <div>२. पाइथागोरस साध्य: h = √(a² - (a/2)²) = √(3a²/4) = (√3/2)a</div>
                      <div>३. क्षेत्रफल A = 1/2 × a × (√3/2)a = <b className="text-emerald-400">(√3/4)a²</b></div>
                      <div className="text-emerald-300 text-sm font-bold pt-2 border-t border-slate-700 font-sans">
                        = (1.732 / 4) × {toNp(sideA)}² = <span className="text-xl">{toNp(calcEquiArea.toFixed(2))}</span> cm²
                      </div>
                    </div>
                  )}

                  {triType === 'isosceles' && (
                    <div className="space-y-2 mt-2 text-xs text-slate-300 font-mono">
                      <div className="text-base font-black text-emerald-400">A = (b / 4) √(4a² - b²)</div>
                      <div>१. शीर्षलम्ब h = √(a² - (b/2)²) = √(4a² - b²) / 2</div>
                      <div>२. क्षेत्रफल A = 1/2 × b × h = <b className="text-emerald-400">b/4 √(4a² - b²)</b></div>
                      <div className="text-emerald-300 text-sm font-bold pt-2 border-t border-slate-700 font-sans">
                        h = {toNp(calcIsoHeight.toFixed(2))} cm | क्षेत्रफल = <span className="text-xl">{toNp(calcIsoArea.toFixed(2))}</span> cm²
                      </div>
                    </div>
                  )}

                  {triType === 'right' && (
                    <div className="space-y-2 mt-2 text-xs text-slate-300 font-mono">
                      <div className="text-base font-black text-rose-400">A = 1/2 × b × h</div>
                      <div>१. आयतको क्षेत्रफल = b × h</div>
                      <div>२. विकर्णले २ बराबर समकोण त्रिभुज बनाउँछ।</div>
                      <div className="text-emerald-300 text-sm font-bold pt-2 border-t border-slate-700 font-sans">
                        क्षेत्रफल = 1/2 × {toNp(baseB)} × {toNp(heightH)} = <span className="text-xl">{toNp(calcRightTriArea.toFixed(2))}</span> cm²
                      </div>
                    </div>
                  )}

                  {triType === 'general' && (
                    <div className="space-y-2 mt-2 text-xs text-slate-300 font-mono">
                      <div className="text-base font-black text-blue-400">A = 1/2 × आधार × लम्ब उचाइ</div>
                      <div>१. आधार (b) = {toNp(baseB)} cm</div>
                      <div>२. ठाडो उचाइ (h) = {toNp(heightH)} cm</div>
                      <div className="text-emerald-300 text-sm font-bold pt-2 border-t border-slate-700 font-sans">
                        क्षेत्रफल = 1/2 × {toNp(baseB)} × {toNp(heightH)} = <span className="text-xl">{toNp(calcGeneralTriArea.toFixed(2))}</span> cm²
                      </div>
                    </div>
                  )}
                </div>

                {/* Dimension Sliders */}
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                  {triType === 'equilateral' && (
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">
                        {L('भुजा (Side a):', 'Side (a):')} {toNp(sideA)} cm
                      </label>
                      <input
                        type="range"
                        min="4"
                        max="20"
                        value={sideA}
                        onChange={(e) => setSideA(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  )}

                  {triType === 'isosceles' && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">
                          {L('बराबर भुजाहरू (Equal sides a):', 'Equal Sides (a):')} {toNp(sideA)} cm
                        </label>
                        <input
                          type="range"
                          min="6"
                          max="20"
                          value={sideA}
                          onChange={(e) => setSideA(Number(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">
                          {L('आधार (Base b):', 'Base (b):')} {toNp(isoBase)} cm
                        </label>
                        <input
                          type="range"
                          min="4"
                          max={Math.floor(sideA * 1.8)}
                          value={isoBase}
                          onChange={(e) => setIsoBase(Number(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {(triType === 'right' || triType === 'general') && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">
                          {L('आधार (Base b):', 'Base (b):')} {toNp(baseB)} cm
                        </label>
                        <input
                          type="range"
                          min="4"
                          max="20"
                          value={baseB}
                          onChange={(e) => setBaseB(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">
                          {L('उचाइ (Height h):', 'Height (h):')} {toNp(heightH)} cm
                        </label>
                        <input
                          type="range"
                          min="3"
                          max="15"
                          value={heightH}
                          onChange={(e) => setHeightH(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Quadrilaterals */}
        {activeTab === 'quadrilaterals' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'parallelogram', np: 'समानान्तर चतुर्भुज (Parallelogram)', en: 'Parallelogram' },
                { id: 'rhombus', np: 'समचतुर्भुज (Rhombus)', en: 'Rhombus' },
                { id: 'trapezium', np: 'समलम्ब चतुर्भुज (Trapezium)', en: 'Trapezium' },
                { id: 'general_quad', np: 'साधारण चतुर्भुज (General Quadrilateral)', en: 'General Quadrilateral' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setQuadType(item.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    quadType === item.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {isNe ? item.np : item.en}
                </button>
              ))}
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* SVG Quadrilateral Display */}
              <div className="w-full h-64 bg-slate-800 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                <svg viewBox="0 0 300 220" className="w-full h-full">
                  {/* Parallelogram */}
                  {quadType === 'parallelogram' && (
                    <g>
                      <polygon points="50,170 190,170 250,50 110,50" fill="rgba(14, 165, 233, 0.35)" stroke="#38bdf8" strokeWidth="3" />
                      <line x1="110" y1="50" x2="110" y2="170" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
                      <rect x="110" y="158" width="12" height="12" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="120" y="195" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontWeight="bold">
                        b = {toNp(pBase)} cm (आधार)
                      </text>
                      <text x="115" y="115" fill="#fbbf24" fontSize="11" fontWeight="bold">
                        h = {toNp(pHeight)} cm
                      </text>
                    </g>
                  )}

                  {/* Rhombus with Diagonals */}
                  {quadType === 'rhombus' && (
                    <g>
                      <polygon points="150,30 240,110 150,190 60,110" fill="rgba(168, 85, 247, 0.35)" stroke="#c084fc" strokeWidth="3" />
                      {/* Diagonal 1 (horizontal) */}
                      <line x1="60" y1="110" x2="240" y2="110" stroke="#f59e0b" strokeWidth="2" />
                      {/* Diagonal 2 (vertical) */}
                      <line x1="150" y1="30" x2="150" y2="190" stroke="#10b981" strokeWidth="2" />
                      <rect x="150" y="98" width="12" height="12" fill="none" stroke="#fff" strokeWidth="1" />
                      <text x="210" y="105" fill="#f59e0b" fontSize="11" fontWeight="bold">d₁ = {toNp(diag1)}</text>
                      <text x="155" y="60" fill="#10b981" fontSize="11" fontWeight="bold">d₂ = {toNp(diag2)}</text>
                    </g>
                  )}

                  {/* Trapezium */}
                  {quadType === 'trapezium' && (
                    <g>
                      <polygon points="40,170 260,170 210,60 90,60" fill="rgba(245, 158, 11, 0.35)" stroke="#fbbf24" strokeWidth="3" />
                      <line x1="90" y1="60" x2="90" y2="170" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" />
                      <rect x="90" y="158" width="12" height="12" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                      <text x="150" y="50" fill="#fbbf24" fontSize="11" textAnchor="middle" fontWeight="bold">
                        b = {toNp(trapB)} cm
                      </text>
                      <text x="150" y="195" fill="#fbbf24" fontSize="11" textAnchor="middle" fontWeight="bold">
                        a = {toNp(trapA)} cm
                      </text>
                      <text x="95" y="115" fill="#ef4444" fontSize="11" fontWeight="bold">
                        h = {toNp(trapH)} cm
                      </text>
                    </g>
                  )}

                  {/* General Quadrilateral */}
                  {quadType === 'general_quad' && (
                    <g>
                      <polygon points="40,110 130,40 260,110 160,180" fill="rgba(236, 72, 153, 0.35)" stroke="#f472b6" strokeWidth="3" />
                      {/* Main Diagonal */}
                      <line x1="40" y1="110" x2="260" y2="110" stroke="#38bdf8" strokeWidth="2.5" />
                      {/* Perpendicular offset 1 */}
                      <line x1="130" y1="40" x2="130" y2="110" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
                      {/* Perpendicular offset 2 */}
                      <line x1="160" y1="180" x2="160" y2="110" stroke="#10b981" strokeWidth="2" strokeDasharray="4,4" />
                      <text x="150" y="125" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">
                        d = {toNp(gDiag)} cm
                      </text>
                      <text x="135" y="80" fill="#f59e0b" fontSize="11" fontWeight="bold">h₁ = {toNp(gh1)}</text>
                      <text x="165" y="150" fill="#10b981" fontSize="11" fontWeight="bold">h₂ = {toNp(gh2)}</text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Math & Working */}
              <div className="space-y-4">
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-xs font-mono space-y-2 text-slate-300">
                  {quadType === 'parallelogram' && (
                    <div>
                      <div className="text-sm font-bold text-sky-400">क्षेत्रफल A = b × h</div>
                      <p className="font-sans text-slate-400 text-[11px]">
                        त्रिभुज काटेर अर्को छेउमा सार्दा आयत बन्छ (A = आधार × उचाइ)।
                      </p>
                      <div className="text-emerald-400 text-base font-bold font-sans pt-2 border-t border-slate-700">
                        = {toNp(pBase)} × {toNp(pHeight)} = <span className="text-xl">{toNp(calcParaArea)}</span> cm²
                      </div>
                    </div>
                  )}

                  {quadType === 'rhombus' && (
                    <div>
                      <div className="text-sm font-bold text-purple-400">क्षेत्रफल A = 1/2 × d₁ × d₂</div>
                      <p className="font-sans text-slate-400 text-[11px]">
                        विकर्णहरूले ४ ओटा बराबर समकोण त्रिभुजमा विभाजन गर्छन्।
                      </p>
                      <div className="text-emerald-400 text-base font-bold font-sans pt-2 border-t border-slate-700">
                        = 1/2 × {toNp(diag1)} × {toNp(diag2)} = <span className="text-xl">{toNp(calcRhombusArea)}</span> cm²
                      </div>
                    </div>
                  )}

                  {quadType === 'trapezium' && (
                    <div>
                      <div className="text-sm font-bold text-amber-400">क्षेत्रफल A = 1/2 × (a + b) × h</div>
                      <p className="font-sans text-slate-400 text-[11px]">
                        समानान्तर भुजाहरूको योगफल × ठाडो उचाइ ÷ २।
                      </p>
                      <div className="text-emerald-400 text-base font-bold font-sans pt-2 border-t border-slate-700">
                        = 1/2 × ({toNp(trapA)} + {toNp(trapB)}) × {toNp(trapH)} = <span className="text-xl">{toNp(calcTrapArea)}</span> cm²
                      </div>
                    </div>
                  )}

                  {quadType === 'general_quad' && (
                    <div>
                      <div className="text-sm font-bold text-pink-400">क्षेत्रफल A = 1/2 × d × (h₁ + h₂)</div>
                      <p className="font-sans text-slate-400 text-[11px]">
                        विकर्णले चतुर्भुजलाई २ त्रिभुजहरूमा बाँड्छ।
                      </p>
                      <div className="text-emerald-400 text-base font-bold font-sans pt-2 border-t border-slate-700">
                        = 1/2 × {toNp(gDiag)} × ({toNp(gh1)} + {toNp(gh2)}) = <span className="text-xl">{toNp(calcGeneralQuadArea)}</span> cm²
                      </div>
                    </div>
                  )}
                </div>

                {/* Quad Sliders */}
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                  {quadType === 'parallelogram' && (
                    <>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">आधार (b): {toNp(pBase)} cm</label>
                        <input type="range" min="6" max="24" value={pBase} onChange={(e) => setPBase(Number(e.target.value))} className="w-full accent-sky-500" />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">उचाइ (h): {toNp(pHeight)} cm</label>
                        <input type="range" min="4" max="15" value={pHeight} onChange={(e) => setPHeight(Number(e.target.value))} className="w-full accent-sky-500" />
                      </div>
                    </>
                  )}

                  {quadType === 'rhombus' && (
                    <>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">विकर्ण १ (d₁): {toNp(diag1)} cm</label>
                        <input type="range" min="4" max="20" value={diag1} onChange={(e) => setDiag1(Number(e.target.value))} className="w-full accent-purple-500" />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">विकर्ण २ (d₂): {toNp(diag2)} cm</label>
                        <input type="range" min="4" max="20" value={diag2} onChange={(e) => setDiag2(Number(e.target.value))} className="w-full accent-purple-500" />
                      </div>
                    </>
                  )}

                  {quadType === 'trapezium' && (
                    <>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">भुजा a: {toNp(trapA)} cm</label>
                        <input type="range" min="6" max="20" value={trapA} onChange={(e) => setTrapA(Number(e.target.value))} className="w-full accent-amber-500" />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">भुजा b: {toNp(trapB)} cm</label>
                        <input type="range" min="4" max="15" value={trapB} onChange={(e) => setTrapB(Number(e.target.value))} className="w-full accent-amber-500" />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">उचाइ h: {toNp(trapH)} cm</label>
                        <input type="range" min="3" max="12" value={trapH} onChange={(e) => setTrapH(Number(e.target.value))} className="w-full accent-amber-500" />
                      </div>
                    </>
                  )}

                  {quadType === 'general_quad' && (
                    <>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">विकर्ण d: {toNp(gDiag)} cm</label>
                        <input type="range" min="8" max="24" value={gDiag} onChange={(e) => setGDiag(Number(e.target.value))} className="w-full accent-pink-500" />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">लम्ब h₁: {toNp(gh1)} cm | लम्ब h₂: {toNp(gh2)} cm</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="range" min="2" max="10" value={gh1} onChange={(e) => setGh1(Number(e.target.value))} className="w-full accent-pink-500" />
                          <input type="range" min="2" max="10" value={gh2} onChange={(e) => setGh2(Number(e.target.value))} className="w-full accent-pink-500" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Vertex Shear Principle */}
        {activeTab === 'vertex_shear' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('आधार र लम्ब उचाइ समान भए क्षेत्रफल किन समान रहन्छ?', 'Why does Area remain constant when Base and Height are unchanged?')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'शीर्षबिन्दु C लाई आधार AB सँग समानान्तर रेखामा दायाँ-बायाँ सार्नुहोस्। त्रिभुजको आकार बदलिन्छ तर ठाडो लम्ब उचाइ (h) नबदलिने भएकाले क्षेत्रफल ठ्याक्कै समान रहन्छ!',
                    'Drag vertex C horizontally along the parallel line. The slant sides change, but perpendicular height h is constant, so Area is strictly CONSTANT!'
                  )}
                </p>
              </div>

              {/* Interactive SVG Animation of Shear */}
              <div className="w-full h-64 bg-slate-900 rounded-3xl p-4 flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 320 200" className="w-full h-full">
                  {/* Parallel top line */}
                  <line x1="20" y1="50" x2="300" y2="50" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,6" />
                  <text x="295" y="42" fill="#f59e0b" fontSize="10" textAnchor="end">{L('समानान्तर रेखा (Parallel Line)', 'Parallel Line')}</text>

                  {/* Fixed base line */}
                  <line x1="80" y1="160" x2="220" y2="160" stroke="#38bdf8" strokeWidth="4" />
                  <text x="150" y="180" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">
                    {L('स्थिर आधार b = १० सेमी', 'Fixed Base b = 10 cm')}
                  </text>

                  {/* The triangle */}
                  <polygon
                    points={`${40 + vertexX * 16},50 80,160 220,160`}
                    fill="rgba(99, 102, 241, 0.4)"
                    stroke="#818cf8"
                    strokeWidth="3"
                  />

                  {/* Perpendicular Height */}
                  <line x1={`${40 + vertexX * 16}`} y1="50" x2={`${40 + vertexX * 16}`} y2="160" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
                  <rect x={`${40 + vertexX * 16}`} y="148" width="12" height="12" fill="none" stroke="#ef4444" strokeWidth="1" />
                  <text x={`${48 + vertexX * 16}`} y="110" fill="#ef4444" fontSize="11" fontWeight="bold">
                    h = ८ सेमी
                  </text>

                  {/* Draggable Vertex Point C */}
                  <circle cx={`${40 + vertexX * 16}`} cy="50" r="8" fill="#fbbf24" stroke="#fff" strokeWidth="2" />
                  <text x={`${40 + vertexX * 16}`} y="35" fill="#fbbf24" fontSize="12" fontWeight="black" textAnchor="middle">
                    C
                  </text>
                </svg>
              </div>

              {/* Slider for Vertex X */}
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-200 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-indigo-950">
                  <span>{L('शीर्षबिन्दु C को स्थिति सार्नुहोस्:', 'Shift Vertex C Position:')}</span>
                  <span className="text-indigo-600 font-mono">X = {toNp(vertexX)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="14"
                  value={vertexX}
                  onChange={(e) => setVertexX(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />

                <div className="p-4 bg-white rounded-xl border border-indigo-300 flex justify-between items-center">
                  <div className="text-xs text-slate-600">
                    <div>{L('आधार (b): १० सेमी | ठाडो लम्ब उचाइ (h): ८ सेमी', 'Base (b): 10 cm | Perpendicular Height (h): 8 cm')}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{L('सूत्र: A = 1/2 × आधार × लम्ब उचाइ', 'Formula: A = 1/2 × b × h')}</div>
                  </div>
                  <div className="text-2xl font-black text-emerald-600">
                    A = {toNp((0.5 * 10 * 8).toFixed(1))} cm²
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
                  {isNe ? CHALLENGE_ITEMS[chalIndex].titleNp : CHALLENGE_ITEMS[chalIndex].titleEn}
                </h3>
                <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold">
                  {L(`समस्या ${toNp(chalIndex + 1)} / ${toNp(CHALLENGE_ITEMS.length)}`, `Problem ${chalIndex + 1} of ${CHALLENGE_ITEMS.length}`)}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-200">
                {isNe ? CHALLENGE_ITEMS[chalIndex].descNp : CHALLENGE_ITEMS[chalIndex].descEn}
              </div>

              <div className="max-w-xs">
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {L('तपाईंको उत्तर (क्षेत्रफल):', 'Your Answer (Area):')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={userAreaInput}
                    onChange={(e) => setUserAreaInput(e.target.value)}
                    placeholder={L('मान लेख्नुहोस्...', 'Enter value...')}
                    className="w-full px-4 py-2 border rounded-xl font-bold text-slate-800"
                  />
                  <span className="text-sm font-bold text-slate-500 whitespace-nowrap">{CHALLENGE_ITEMS[chalIndex].unit}</span>
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
                    setChalIndex((prev) => (prev + 1) % CHALLENGE_ITEMS.length);
                    setUserAreaInput('');
                    setChalFeedback(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> {L('अर्को समस्या', 'Next Problem')}
                </button>
              </div>

              {chalFeedback && (
                <div
                  className={`p-4 rounded-2xl text-sm font-semibold ${
                    chalFeedback.isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {chalFeedback.msg}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default GeometryAreaExplorer;
