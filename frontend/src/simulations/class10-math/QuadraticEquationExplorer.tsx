import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const QuadraticEquationExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U7-01',
    chapter: 7,
    titleNp: 'वर्ग समीकरण तथा परबोला अन्वेषक',
    titleEn: 'Quadratic Equation and Parabola Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'parabolaGraph' | 'solvingMethods' | 'wordProblems' | 'challenge'>('parabolaGraph');

  // ── 1. PARABOLA & DISCRIMINANT CONTROLS ────────────────────────────────────
  const [coeffA, setCoeffA] = useState<number>(1);
  const [coeffB, setCoeffB] = useState<number>(-2);
  const [coeffC, setCoeffC] = useState<number>(-3);

  // Discriminant D = b^2 - 4ac
  const D = coeffB * coeffB - 4 * coeffA * coeffC;

  // Vertex (h, k) where h = -b / (2a), k = c - b^2 / (4a)
  const vertexX = -coeffB / (2 * coeffA);
  const vertexY = coeffA * vertexX * vertexX + coeffB * vertexX + coeffC;

  // Roots
  let root1: number | null = null;
  let root2: number | null = null;
  if (D > 0) {
    root1 = (-coeffB + Math.sqrt(D)) / (2 * coeffA);
    root2 = (-coeffB - Math.sqrt(D)) / (2 * coeffA);
  } else if (D === 0) {
    root1 = -coeffB / (2 * coeffA);
    root2 = root1;
  }

  // ── 2. SOLVING METHODS STATE ────────────────────────────────────────────────
  const [selectedMethod, setSelectedMethod] = useState<'factorization' | 'completingSquare' | 'formula'>('factorization');
  const [presetEq, setPresetEq] = useState<number>(0);

  const presetList = [
    { a: 1, b: -5, c: 6, label: 'x² - 5x + 6 = 0 (Roots: 2, 3)' },
    { a: 1, b: 6, c: 8, label: 'x² + 6x + 8 = 0 (Roots: -2, -4)' },
    { a: 2, b: 7, c: 6, label: '2x² + 7x + 6 = 0 (Roots: -1.5, -2)' },
    { a: 1, b: -4, c: -5, label: 'x² - 4x - 5 = 0 (Roots: 5, -1)' },
    { a: 1, b: -6, c: 9, label: 'x² - 6x + 9 = 0 (Double Root: 3)' },
  ];

  const currentPreset = presetList[presetEq];
  const pA = currentPreset.a;
  const pB = currentPreset.b;
  const pC = currentPreset.c;
  const pD = pB * pB - 4 * pA * pC;
  const pRoot1 = (-pB + Math.sqrt(Math.max(0, pD))) / (2 * pA);
  const pRoot2 = (-pB - Math.sqrt(Math.max(0, pD))) / (2 * pA);

  // ── 3. WORD PROBLEM LAB ─────────────────────────────────────────────────────
  const [activeProblem, setActiveProblem] = useState<number>(0);

  const wordProblemsList = [
    {
      titleEn: '1. Area of a Garden (Rectangle)',
      titleNp: '1. बगैँचाको क्षेत्रफल (आयाताकार)',
      descEn:
        'The length of a rectangular garden is 4 meters more than its breadth. If the total area of the garden is 96 square meters, find its length and breadth.',
      descNp:
        'एउटा आयाताकार बगैँचाको लम्बाइ यसको चौडाइ भन्दा 4 m बढी छ। यदि बगैँचाको क्षेत्रफल 96 sq m भए, लम्बाइ र चौडाइ पत्ता लगाउनुहोस्।',
      letStatementEn: 'Let breadth = x meters. Then length = (x + 4) meters.',
      letStatementNp: 'मानौँ, चौडाइ = x m। त्यसो भए लम्बाइ = (x + 4) m।',
      eqFormation: 'x(x + 4) = 96  ⟹  x² + 4x - 96 = 0',
      factoring: '(x + 12)(x - 8) = 0',
      solutionsEn: 'x = 8 or x = -12',
      solutionsNp: 'x = 8 अथवा x = -12',
      validReasonEn: 'Breadth cannot be negative (x > 0). Therefore, Breadth = 8 m, Length = 8 + 4 = 12 m.',
      validReasonNp: 'चौडाइ ऋणात्मक हुन सक्दैन (x > 0)। अतः चौडाइ = 8 m, लम्बाइ = 8 + 4 = 12 m।',
      b: 8,
      l: 12,
    },
    {
      titleEn: '2. Consecutive Natural Numbers Product',
      titleNp: '2. लगातार दुई प्राकृतिक संख्याको गुणनफल',
      descEn: 'The product of two consecutive positive integers is 72. Find the two numbers.',
      descNp: 'लगातार दुई धनात्मक प्राकृतिक संख्याहरूको गुणनफल 72 छ भने ती संख्याहरू पत्ता लगाउनुहोस्।',
      letStatementEn: 'Let the numbers be x and (x + 1).',
      letStatementNp: 'मानौँ, ती संख्याहरू x र (x + 1) हुन्।',
      eqFormation: 'x(x + 1) = 72  ⟹  x² + x - 72 = 0',
      factoring: '(x + 9)(x - 8) = 0',
      solutionsEn: 'x = 8 or x = -9',
      solutionsNp: 'x = 8 अथवा x = -9',
      validReasonEn: 'Given positive integers (x > 0), reject -9. The numbers are 8 and 8 + 1 = 9.',
      validReasonNp: 'धनात्मक संख्या भएकाले ऋणात्मक -9 लाई अस्वीकार गरिन्छ। अतः ती संख्याहरू 8 र 9 हुन्।',
      b: 8,
      l: 9,
    },
    {
      titleEn: '3. Right Triangle Dimensions',
      titleNp: '3. समकोणी त्रिभुजको नाप',
      descEn:
        'In a right-angled triangle, the base is 7 cm longer than the perpendicular. If the hypotenuse is 13 cm, find the lengths of the base and perpendicular.',
      descNp:
        'एउटा समकोणी त्रिभुजको आधार यसको लम्ब भन्दा 7 से.मी. लामो छ। यदि कर्ण 13 से.मी. भए आधार र लम्बको लम्बाइ निकाल्नुहोस्।',
      letStatementEn: 'Let perpendicular = x cm. Then base = (x + 7) cm and hypotenuse = 13 cm.',
      letStatementNp: 'मानौँ, लम्ब = x से.मी., आधार = (x + 7) से.मी. र कर्ण = 13 से.मी.।',
      eqFormation: 'x² + (x + 7)² = 13²  ⟹  2x² + 14x + 49 = 169  ⟹  2x² + 14x - 120 = 0  ⟹  x² + 7x - 60 = 0',
      factoring: '(x + 12)(x - 5) = 0',
      solutionsEn: 'x = 5 or x = -12',
      solutionsNp: 'x = 5 अथवा x = -12',
      validReasonEn: 'Side length cannot be negative. Hence, Perpendicular = 5 cm, Base = 5 + 7 = 12 cm.',
      validReasonNp: 'लम्बाइ ऋणात्मक हुन सक्दैन। त्यसैले लम्ब = 5 से.मी., आधार = 5 + 7 = 12 से.मी.।',
      b: 5,
      l: 12,
    },
  ];

  // ── 4. PRACTICE CHALLENGE ──────────────────────────────────────────────────
  const [score, setScore] = useState<number>(0);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizQuestions = [
    {
      qEn: 'For the equation 2x² - 4x + 2 = 0, what is the value of Discriminant D and the nature of roots?',
      qNp: 'समीकरण 2x² - 4x + 2 = 0 का लागि विविक्तकर (D) को मान र मूलहरूको प्रकृति के हुन्छ?',
      options: [
        'D = 0, Real and equal roots',
        'D = 16, Two distinct roots',
        'D = -8, No real roots',
        'D = 4, Real and distinct roots',
      ],
      optionsNp: [
        'D = 0, वास्तविक र बराबर मूलहरू',
        'D = 16, दुई फरक वास्तविक मूलहरू',
        'D = -8, कुनै वास्तविक मूल छैन',
        'D = 4, वास्तविक र फरक मूलहरू',
      ],
      correct: 0, // D = (-4)^2 - 4(2)(2) = 16 - 16 = 0
      hintEn: 'D = b² - 4ac = (-4)² - 4(2)(2) = 16 - 16 = 0. When D = 0, roots are real and equal.',
      hintNp: 'D = b² - 4ac = (-4)² - 4(2)(2) = 16 - 16 = 0। D = 0 हुँदा मूलहरू वास्तविक र बराबर हुन्छन्।',
    },
    {
      qEn: 'Solve by factorization: x² - 7x + 12 = 0. What are the roots?',
      qNp: 'खण्डिकरण विधिबाट हल गर्नुहोस्: x² - 7x + 12 = 0। यसका मूलहरू के हुन्?',
      options: ['x = 3, 4', 'x = -3, -4', 'x = 2, 6', 'x = 1, 12'],
      correct: 0,
      hintEn: 'Factorization: (x - 3)(x - 4) = 0  ⟹  x = 3 or x = 4.',
      hintNp: 'खण्डिकरण: (x - 3)(x - 4) = 0  ⟹  x = 3 अथवा x = 4।',
    },
    {
      qEn: 'If a quadratic equation ax² + bx + c = 0 has D < 0, what does its parabola look like on the graph?',
      qNp: 'यदि वर्ग समीकरण ax² + bx + c = 0 को D < 0 भए, यसको परबोला रेखाचित्र कस्तो देखिन्छ?',
      options: [
        'Does not touch or intersect the x-axis',
        'Intersects the x-axis at exactly 2 points',
        'Touches the x-axis at exactly 1 point',
        'Passes through the origin (0,0)',
      ],
      optionsNp: [
        'x-अक्षलाई कतै पनि छुँदैन वा काट्दैन',
        'x-अक्षलाई ठिक 2 ठाउँमा काट्छ',
        'x-अक्षलाई ठिक 1 बिन्दुमा छुन्छ',
        'मूल बिन्दु (0,0) बाट जान्छ',
      ],
      correct: 0,
      hintEn: 'When D < 0, there are no real roots, meaning the parabola has no x-intercepts.',
      hintNp: 'D < 0 हुँदा कुनै वास्तविक मूल नहुने भएकाले परबोलाले x-अक्षलाई कतै पनि काट्दैन।',
    },
    {
      qEn: 'The length of a room exceeds its breadth by 3 m and area is 40 m². What is its breadth?',
      qNp: 'एउटा कोठाको लम्बाइ चौडाइ भन्दा 3 m बढी छ र क्षेत्रफल 40 sq m छ भने चौडाइ कति हुन्छ?',
      options: ['5 m', '8 m', '4 m', '10 m'],
      optionsNp: ['5 m', '8 m', '4 m', '10 m'],
      correct: 0, // x(x+3) = 40 => x^2 + 3x - 40 = 0 => (x+8)(x-5)=0 => x=5
      hintEn: 'x(x + 3) = 40 ⟹ x² + 3x - 40 = 0 ⟹ (x + 8)(x - 5) = 0. Since breadth > 0, breadth = 5 m.',
      hintNp: 'x(x + 3) = 40 ⟹ x² + 3x - 40 = 0 ⟹ (x + 8)(x - 5) = 0। चौडाइ > 0 हुने हुँदा चौडाइ = 5 m।',
    },
  ];

  const handleSelectAnswer = (idx: number) => {
    setSelectedAns(idx);
    const q = quizQuestions[quizIdx];
    if (idx === q.correct) {
      kit.good();
      setScore((prev) => prev + 10);
      setQuizFeedback(isNe ? 'सटीक उत्तर! धेरै राम्रो।' : 'Correct! Excellent quadratic reasoning.');
    } else {
      kit.oops();
      setQuizFeedback(isNe ? 'गलत उत्तर। संकेत हेरी पुन: प्रयास गर्नुहोस्।' : 'Incorrect. Check the formula and discriminant rule.');
    }
  };

  const handleNextQuiz = () => {
    kit.tap();
    setSelectedAns(null);
    setQuizFeedback(null);
    setQuizIdx((prev) => (prev + 1) % quizQuestions.length);
  };

  // ── SVG COORDINATE SYSTEM GENERATOR ────────────────────────────────────────
  // Coordinate range: x in [-8, 8], y in [-10, 15]
  // SVG size: 480 x 300.
  const svgW = 480;
  const svgH = 300;
  const scaleX = svgW / 16; // 30 px per unit x
  const scaleY = svgH / 26; // ~11.5 px per unit y
  const originX = svgW / 2; // x=0 at 240
  const originY = 170; // y=0 at 170

  const toSvgX = (x: number) => originX + x * scaleX;
  const toSvgY = (y: number) => originY - y * scaleY;

  // Parabola points from x = -8 to 8
  const pathPoints: string[] = [];
  for (let x = -8; x <= 8; x += 0.2) {
    const y = coeffA * x * x + coeffB * x + coeffC;
    pathPoints.push(`${toSvgX(x)},${toSvgY(y)}`);
  }
  const parabolaD = `M ${pathPoints.join(' L ')}`;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा 10 गणितको एकाइ 7: वर्ग समीकरण (Quadratic Equation) तथा परबोला अन्वेषकमा स्वागत छ! यहाँ गुणाङ्कहरू परिवर्तन गर्नुहोस्, विविक्तकर र मूलहरू जाँच्नुहोस्, र तीनवटै समाधान विधिहरू सिक्नुहोस्!',
        'Welcome to Grade 10 Unit 7: Quadratic Equation & Parabola Explorer! Adjust coefficients, inspect discriminant D, visualize roots on the coordinate graph, and master all textbook solving methods!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'parabolaGraph', labelNp: 'क) परबोला रेखाचित्र तथा विविक्तकर (Graph & D)', labelEn: 'A) Parabola Graph & Discriminant' },
            { id: 'solvingMethods', labelNp: 'ख) पाठ्यपुस्तकका 3 वटै समाधान विधिहरू', labelEn: 'B) 3 Textbook Solving Methods' },
            { id: 'wordProblems', labelNp: 'ग) व्यावहारिक शाब्दिक समस्या प्रयोगशाला', labelEn: 'C) Word Problems Laboratory' },
            { id: 'challenge', labelNp: 'घ) अभ्यास चुनौती (Quiz)', labelEn: 'D) Practice Challenge' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                kit.tap();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[#167C80] text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-[#142D4E] border border-slate-200'
              }`}
            >
              {isNe ? tab.labelNp : tab.labelEn}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: PARABOLA GRAPH & DISCRIMINANT
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'parabolaGraph' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* SVG Visual Coordinate Graph */}
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>
                  y = {fmt(coeffA)}x² {coeffB >= 0 ? `+ ${fmt(coeffB)}x` : `- ${fmt(Math.abs(coeffB))}x`}{' '}
                  {coeffC >= 0 ? `+ ${fmt(coeffC)}` : `- ${fmt(Math.abs(coeffC))}`}
                </span>
                <span className="text-amber-300">
                  {coeffA > 0 ? L('माथितिर फर्केको (Opens Up)', 'Opens Upward') : L('तलतिर फर्केको (Opens Down)', 'Opens Downward')}
                </span>
              </div>

              <div className="w-full overflow-hidden flex justify-center bg-slate-900/60 rounded-xl border border-slate-700">
                <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="max-w-full">
                  {/* Grid Lines */}
                  {[-6, -4, -2, 2, 4, 6].map((gx) => (
                    <line
                      key={`gx-${gx}`}
                      x1={toSvgX(gx)}
                      y1={10}
                      x2={toSvgX(gx)}
                      y2={svgH - 10}
                      stroke="#334155"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                    />
                  ))}
                  {[-6, -3, 3, 6, 9, 12].map((gy) => (
                    <line
                      key={`gy-${gy}`}
                      x1={10}
                      y1={toSvgY(gy)}
                      x2={svgW - 10}
                      y2={toSvgY(gy)}
                      stroke="#334155"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                    />
                  ))}

                  {/* Axes */}
                  <line x1={10} y1={originY} x2={svgW - 10} y2={originY} stroke="#94A3B8" strokeWidth={2} />
                  <line x1={originX} y1={10} x2={originX} y2={svgH - 10} stroke="#94A3B8" strokeWidth={2} />
                  <text x={svgW - 25} y={originY - 6} fill="#94A3B8" fontSize="11" fontWeight="bold">X</text>
                  <text x={originX + 8} y={22} fill="#94A3B8" fontSize="11" fontWeight="bold">Y</text>

                  {/* Axis of Symmetry */}
                  <line
                    x1={toSvgX(vertexX)}
                    y1={10}
                    x2={toSvgX(vertexX)}
                    y2={svgH - 10}
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                  />

                  {/* Parabola Curve */}
                  <path d={parabolaD} fill="none" stroke="#2DD4BF" strokeWidth={3} />

                  {/* Vertex Point */}
                  <circle cx={toSvgX(vertexX)} cy={toSvgY(vertexY)} r={5} fill="#F59E0B" />
                  <text
                    x={toSvgX(vertexX)}
                    y={coeffA > 0 ? toSvgY(vertexY) + 16 : toSvgY(vertexY) - 10}
                    textAnchor="middle"
                    fill="#FDE68A"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    V({fmt(vertexX.toFixed(1))}, {fmt(vertexY.toFixed(1))})
                  </text>

                  {/* Root 1 (if real) */}
                  {root1 !== null && (
                    <g>
                      <circle cx={toSvgX(root1)} cy={originY} r={6} fill="#10B981" />
                      <text x={toSvgX(root1)} y={originY + 16} textAnchor="middle" fill="#34D399" fontSize="11" fontWeight="bold">
                        x₁ = {fmt(root1.toFixed(1))}
                      </text>
                    </g>
                  )}

                  {/* Root 2 (if real and distinct) */}
                  {root2 !== null && D > 0 && (
                    <g>
                      <circle cx={toSvgX(root2)} cy={originY} r={6} fill="#10B981" />
                      <text x={toSvgX(root2)} y={originY + 16} textAnchor="middle" fill="#34D399" fontSize="11" fontWeight="bold">
                        x₂ = {fmt(root2.toFixed(1))}
                      </text>
                    </g>
                  )}

                  {/* Y-Intercept (0, c) */}
                  <circle cx={originX} cy={toSvgY(coeffC)} r={4} fill="#EC4899" />
                  <text x={originX - 10} y={toSvgY(coeffC) - 4} textAnchor="end" fill="#F472B6" fontSize="10">
                    (0, {fmt(coeffC)})
                  </text>
                </svg>
              </div>

              <div className="w-full flex justify-between text-xs text-slate-400 mt-2">
                <span>{L('सममिति अक्ष (Axis of Symmetry):', 'Axis of Symmetry:')} x = {fmt(vertexX.toFixed(2))}</span>
                <span>{L('y-अन्त:खण्ड (y-intercept):', 'y-intercept:')} (0, {fmt(coeffC)})</span>
              </div>
            </div>

            {/* Controls & Discriminant Card */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <h4 className="font-bold text-sm text-[#142D4E]">
                  {L('गुणाङ्कहरू समायोजन (Coefficients a, b, c):', 'Adjust Coefficients (a, b, c):')}
                </h4>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('x² को गुणाङ्क (a ≠ 0):', 'Coefficient of x² (a ≠ 0):')}</span>
                    <span className="text-[#167C80] font-bold">{fmt(coeffA)}</span>
                  </div>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="1"
                    value={coeffA}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setCoeffA(v === 0 ? 1 : v);
                    }}
                    className="w-full accent-[#167C80]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('x को गुणाङ्क (b):', 'Coefficient of x (b):')}</span>
                    <span className="text-amber-600 font-bold">{fmt(coeffB)}</span>
                  </div>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="1"
                    value={coeffB}
                    onChange={(e) => setCoeffB(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('अचर पद (c):', 'Constant Term (c):')}</span>
                    <span className="text-indigo-600 font-bold">{fmt(coeffC)}</span>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="1"
                    value={coeffC}
                    onChange={(e) => setCoeffC(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Discriminant D Card */}
              <div
                className={`p-4 rounded-2xl border shadow-sm ${
                  D > 0
                    ? 'bg-emerald-50 border-emerald-300'
                    : D === 0
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-rose-50 border-rose-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {L('विविक्तकर (Discriminant D)', 'Discriminant (D = b² - 4ac)')}
                  </span>
                  <span
                    className={`text-lg font-black font-mono ${
                      D > 0 ? 'text-emerald-700' : D === 0 ? 'text-amber-700' : 'text-rose-700'
                    }`}
                  >
                    D = {fmt(D)}
                  </span>
                </div>

                <div className="text-xs text-slate-600 mb-2 font-mono">
                  D = ({fmt(coeffB)})² - 4({fmt(coeffA)})({fmt(coeffC)}) = {fmt(coeffB * coeffB)} - {fmt(4 * coeffA * coeffC)} = {fmt(D)}
                </div>

                <div className="p-2.5 bg-white/80 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-800">
                    {D > 0 && L('✔ D > 0: दुई फरक वास्तविक मूलहरू (Two Distinct Real Roots)', '✔ D > 0: Two Distinct Real Roots')}
                    {D === 0 && L('✔ D = 0: दुई बराबर वास्तविक मूलहरू (Real & Equal Double Root)', '✔ D = 0: Real & Equal Double Root')}
                    {D < 0 && L('✖ D < 0: कुनै वास्तविक मूल छैन (No Real Roots)', '✖ D < 0: No Real Roots (Parabola does not cross X-axis)')}
                  </div>
                  <div className="text-slate-700">
                    {D > 0 && (
                      <span>
                        x₁ = <strong className="text-emerald-700">{fmt(root1?.toFixed(2) || '')}</strong>, x₂ ={' '}
                        <strong className="text-emerald-700">{fmt(root2?.toFixed(2) || '')}</strong>
                      </span>
                    )}
                    {D === 0 && (
                      <span>
                        x = <strong className="text-amber-700">{fmt(root1?.toFixed(2) || '')}</strong>
                      </span>
                    )}
                    {D < 0 && (
                      <span className="text-rose-600">
                        {L('परबोलाले x-अक्षलाई कतै पनि काट्दैन वा छुँदैन।', 'Graph does not intersect the x-axis.')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: 3 TEXTBOOK SOLVING METHODS
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'solvingMethods' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            {/* Equation Preset Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border rounded-xl">
              <span className="text-xs font-bold text-slate-700">
                {L('पाठ्यपुस्तकका नमुना समीकरणहरू (Preset Equations):', 'Textbook Example Equations:')}
              </span>
              <div className="flex flex-wrap gap-2">
                {presetList.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      kit.tap();
                      setPresetEq(idx);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      presetEq === idx
                        ? 'bg-[#142D4E] text-white shadow-sm'
                        : 'bg-white border text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'factorization', np: '1. खण्डिकरण विधि', en: '1. Factorization Method' },
                { id: 'completingSquare', np: '2. पूर्ण वर्ग बनाउने विधि', en: '2. Completing the Square' },
                { id: 'formula', np: '3. सुत्र प्रयोग विधि', en: '3. Quadratic Formula' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    kit.tap();
                    setSelectedMethod(m.id as any);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === m.id
                      ? 'bg-[#167C80] text-white border-[#167C80] font-bold shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="text-xs">{isNe ? m.np : m.en}</div>
                </button>
              ))}
            </div>

            {/* Step-by-Step Mathematical Working Card */}
            <div className="p-4 bg-slate-50 border rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-bold text-[#142D4E]">
                  {L('समीकरण:', 'Equation:')} {fmt(pA !== 1 ? pA : '')}x² {pB >= 0 ? `+ ${fmt(pB)}x` : `- ${fmt(Math.abs(pB))}x`}{' '}
                  {pC >= 0 ? `+ ${fmt(pC)}` : `- ${fmt(Math.abs(pC))}`} = 0
                </span>
                <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full font-bold">
                  {L('अन्तिम मूलहरू:', 'Final Roots:')} x = {fmt(pRoot1)}, x = {fmt(pRoot2)}
                </span>
              </div>

              {/* METHOD 1: FACTORIZATION */}
              {selectedMethod === 'factorization' && (
                <div className="space-y-3 font-mono text-xs sm:text-sm">
                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs">Step 1: Splitting the middle term</span>
                    <span>
                      {pA !== 1 ? `${fmt(pA)}x²` : 'x²'} + ({fmt(-pRoot1 - pRoot2)})x + {fmt(pC)} = 0
                    </span>
                    <p className="text-xs text-slate-500 font-sans mt-1">
                      {L(
                        `गुणनफल a·c = ${fmt(pA * pC)} र योगफल b = ${fmt(pB)} हुने दुई संख्याहरू खोज्दा।`,
                        `Find two numbers whose product is a·c = ${pA * pC} and sum is b = ${pB}.`
                      )}
                    </p>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs">Step 2: Grouping and factoring</span>
                    <span>
                      ({fmt(pA)}x - {fmt(Math.abs(pRoot1 * pA))})(x - {fmt(pRoot2)}) = 0
                    </span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs">Step 3: Zero-product property</span>
                    <div className="space-y-1 mt-1 text-teal-700 font-bold">
                      <div>Either: x - {fmt(pRoot1)} = 0  ⟹  x = {fmt(pRoot1)}</div>
                      <div>Or: x - {fmt(pRoot2)} = 0  ⟹  x = {fmt(pRoot2)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 2: COMPLETING THE SQUARE */}
              {selectedMethod === 'completingSquare' && (
                <div className="space-y-3 font-mono text-xs sm:text-sm">
                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs">चरण 1: अचर पदलाई दायाँतर्फ सार्ने (Move constant term)</span>
                    <span>{pA !== 1 ? `${fmt(pA)}x²` : 'x²'} {pB >= 0 ? `+ ${fmt(pB)}x` : `- ${fmt(Math.abs(pB))}x`} = {fmt(-pC)}</span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs">चरण 2: दुवैतर्फ (b/2a)² थप्ने (Add (b/2a)² to both sides)</span>
                    <span>
                      (x {pB >= 0 ? '+' : '-'} {fmt(Math.abs(pB / (2 * pA)))})² = {fmt(-pC / pA)} + {fmt(Math.pow(pB / (2 * pA), 2).toFixed(2))}
                    </span>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs">चरण 3: दुवैतर्फ वर्गमूल लिने (Take square root of both sides)</span>
                    <div className="mt-1 text-teal-700 font-bold">
                      x = {fmt(-pB / (2 * pA))} ± √{fmt(pD / (4 * pA * pA))}  ⟹  x = {fmt(pRoot1)}, x = {fmt(pRoot2)}
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 3: QUADRATIC FORMULA */}
              {selectedMethod === 'formula' && (
                <div className="space-y-3 font-mono text-xs sm:text-sm">
                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs">चरण 1: वर्ग समीकरणको सुत्र (Standard Quadratic Formula)</span>
                    <span className="text-base font-bold text-[#167C80]">x = [-b ± √(b² - 4ac)] / 2a</span>
                    <div className="text-xs text-slate-500 font-sans mt-1">
                      a = {fmt(pA)}, b = {fmt(pB)}, c = {fmt(pC)}
                    </div>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs">चरण 2: मानहरू प्रतिस्थापन (Substituting values)</span>
                    <span>
                      x = [-({fmt(pB)}) ± √(({fmt(pB)})² - 4({fmt(pA)})({fmt(pC)}))] / 2({fmt(pA)})
                    </span>
                    <div className="mt-1">
                      x = [{fmt(-pB)} ± √{fmt(pD)}] / {fmt(2 * pA)}
                    </div>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <span className="text-slate-400 block text-xs">चरण 3: धनात्मक (+) र ऋणात्मक (-) चिन्ह लिँदा</span>
                    <div className="space-y-1 mt-1 text-teal-700 font-bold">
                      <div>(+) लिँदा: x = [{fmt(-pB)} + {fmt(Math.sqrt(pD))}] / {fmt(2 * pA)} = {fmt(pRoot1)}</div>
                      <div>(-) लिँदा: x = [{fmt(-pB)} - {fmt(Math.sqrt(pD))}] / {fmt(2 * pA)} = {fmt(pRoot2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: WORD PROBLEMS LABORATORY
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'wordProblems' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            {/* Problem Tabs */}
            <div className="flex gap-2 border-b pb-3">
              {wordProblemsList.map((prob, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    kit.tap();
                    setActiveProblem(idx);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeProblem === idx
                      ? 'bg-[#167C80] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border'
                  }`}
                >
                  {isNe ? prob.titleNp : prob.titleEn}
                </button>
              ))}
            </div>

            {/* Problem Description */}
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
              <h4 className="font-bold text-sm text-teal-900 mb-1">
                {isNe ? wordProblemsList[activeProblem].titleNp : wordProblemsList[activeProblem].titleEn}
              </h4>
              <p className="text-xs sm:text-sm text-teal-800 leading-relaxed">
                {isNe ? wordProblemsList[activeProblem].descNp : wordProblemsList[activeProblem].descEn}
              </p>
            </div>

            {/* Guided Solution Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                <span className="text-xs font-bold text-[#142D4E] block">
                  {L('1. चल राशि मान्ने (Variable Assignment):', '1. Variable Assignment:')}
                </span>
                <p className="text-xs text-slate-700 font-medium">
                  {isNe ? wordProblemsList[activeProblem].letStatementNp : wordProblemsList[activeProblem].letStatementEn}
                </p>

                <span className="text-xs font-bold text-[#142D4E] block pt-2">
                  {L('2. वर्ग समीकरण निर्माण (Equation Formation):', '2. Equation Formation:')}
                </span>
                <p className="text-xs font-mono font-bold text-teal-700 bg-white p-2 rounded border">
                  {wordProblemsList[activeProblem].eqFormation}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                <span className="text-xs font-bold text-[#142D4E] block">
                  {L('3. खण्डिकरण र हल (Factoring & Solving):', '3. Factoring & Solving:')}
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 bg-white p-2 rounded border">
                  {wordProblemsList[activeProblem].factoring}
                </p>
                <p className="text-xs font-bold text-teal-700">
                  {isNe ? wordProblemsList[activeProblem].solutionsNp : wordProblemsList[activeProblem].solutionsEn}
                </p>

                <span className="text-xs font-bold text-[#142D4E] block pt-1">
                  {L('4. यथार्थपरक उत्तरको छनोट (Valid Solution Filtering):', '4. Valid Physical Interpretation:')}
                </span>
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded text-xs text-emerald-900 font-medium">
                  {isNe ? wordProblemsList[activeProblem].validReasonNp : wordProblemsList[activeProblem].validReasonEn}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: PRACTICE CHALLENGE
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'challenge' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#167C80]">
                {L(`प्रश्न ${fmt(quizIdx + 1)} / ${fmt(quizQuestions.length)}`, `Question ${fmt(quizIdx + 1)} of ${fmt(quizQuestions.length)}`)}
              </span>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {L(`प्राप्ताङ्क: ${fmt(score)}`, `Score: ${fmt(score)}`)}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#142D4E] mb-4">
              {isNe ? quizQuestions[quizIdx].qNp : quizQuestions[quizIdx].qEn}
            </h3>

            <div className="space-y-2.5 mb-5">
              {(isNe && quizQuestions[quizIdx].optionsNp ? quizQuestions[quizIdx].optionsNp : quizQuestions[quizIdx].options).map(
                (opt, oIdx) => {
                  const isSelected = selectedAns === oIdx;
                  const isCorrect = oIdx === quizQuestions[quizIdx].correct;
                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

                  if (selectedAns !== null) {
                    if (isSelected && isCorrect) btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                    else if (isSelected && !isCorrect) btnStyle = 'bg-rose-100 border-rose-400 text-rose-900 font-bold';
                    else if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(oIdx)}
                      disabled={selectedAns !== null}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                }
              )}
            </div>

            {quizFeedback && (
              <div
                className={`p-3.5 rounded-xl mb-4 text-xs ${
                  selectedAns === quizQuestions[quizIdx].correct
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <div className="font-bold mb-1">{quizFeedback}</div>
                <div>{isNe ? quizQuestions[quizIdx].hintNp : quizQuestions[quizIdx].hintEn}</div>
              </div>
            )}

            {selectedAns !== null && (
              <div className="flex justify-end">
                <button
                  onClick={handleNextQuiz}
                  className="px-5 py-2.5 bg-[#142D4E] text-white rounded-xl text-xs sm:text-sm font-bold shadow hover:bg-slate-800 transition-all"
                >
                  {L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default QuadraticEquationExplorer;
