import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS = [
  {
    np: 'विषमबाहु त्रिभुज (Scalene Triangle) को तीन भुजाहरू a, b र c भए अर्ध-परिमिति (s) को सूत्र के हो?',
    en: 'If a, b, and c are side lengths of a scalene triangle, what is the formula for semi-perimeter (s)?',
    options: [
      { key: 'A', label: 's = a + b + c' },
      { key: 'B', label: 's = (a + b + c) / 2' },
      { key: 'C', label: 's = (a + b + c) / 3' },
      { key: 'D', label: 's = √(a + b + c)' },
    ],
    answer: 'B',
  },
  {
    np: 'हिरोनको सूत्र (Heron\'s Formula) अनुसार त्रिभुजको क्षेत्रफल कुन हो?',
    en: 'According to Heron\'s Formula, what is the area of a triangle?',
    options: [
      { key: 'A', label: 'A = 1/2 × base × height' },
      { key: 'B', label: 'A = √[s(s - a)(s - b)(s - c)]' },
      { key: 'C', label: 'A = s(s - a)(s - b)(s - c)' },
      { key: 'D', label: 'A = √[s + (s - a) + (s - b) + (s - c)]' },
    ],
    answer: 'B',
  },
  {
    np: 'त्रिभुजका भुजाहरू 13 सेमि, 14 सेमि र 15 सेमि भए अर्ध-परिमिति (s) कति हुन्छ?',
    en: 'If triangle sides are 13 cm, 14 cm, and 15 cm, what is the semi-perimeter (s)?',
    options: [
      { key: 'A', label: '21 cm' },
      { key: 'B', label: '42 cm' },
      { key: 'C', label: '28 cm' },
      { key: 'D', label: '30 cm' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै चतुर्भुजलाई विकर्ण (Diagonal) ले दुई त्रिभुजमा विभाजन गर्दा चतुर्भुजको कुल क्षेत्रफल कसरी निकालिन्छ?',
    en: 'When a quadrilateral is divided into two triangles by a diagonal, how is total area determined?',
    options: [
      { key: 'A', label: 'Product of the areas of the two triangles' },
      { key: 'B', label: 'Difference of the areas of the two triangles' },
      { key: 'C', label: 'Sum of the areas of the two triangles (A = A₁ + A₂)' },
      { key: 'D', label: 'Square of the diagonal' },
    ],
    answer: 'C',
  },
];

export const HeronsFormulaLandExplorer: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U5-01',
    chapter: 5,
    titleNp: 'हिरोनको सूत्र तथा जग्गा क्षेत्रफल अन्वेषक',
    titleEn: "Heron's Formula and Land Area Explorer",
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'triangle' | 'quadrilateral' | 'challenge'>('triangle');

  // --- Scalene Triangle State ---
  const [sideA, setSideA] = useState<number>(13);
  const [sideB, setSideB] = useState<number>(14);
  const [sideC, setSideC] = useState<number>(15);

  // Triangle Inequality Validation: sum of any two sides > third side
  const isValidTriangle = sideA + sideB > sideC && sideA + sideC > sideB && sideB + sideC > sideA;

  // Semi-perimeter and Heron's Area
  const semiPerimeter = (sideA + sideB + sideC) / 2;
  const sMinusA = semiPerimeter - sideA;
  const sMinusB = semiPerimeter - sideB;
  const sMinusC = semiPerimeter - sideC;
  const heronsProduct = semiPerimeter * sMinusA * sMinusB * sMinusC;
  const triangleArea = isValidTriangle && heronsProduct > 0 ? Math.sqrt(heronsProduct) : 0;

  // --- Quadrilateral by 2 Triangles State ---
  // Diagonal d splits quad ABCD into Triangle 1 (a1, b1, d) and Triangle 2 (a2, b2, d)
  const [qA1, setQA1] = useState<number>(20);
  const [qB1, setQB1] = useState<number>(25);
  const [qDiag, setQDiag] = useState<number>(30);
  const [qA2, setQA2] = useState<number>(22);
  const [qB2, setQB2] = useState<number>(28);

  const isValidT1 = qA1 + qB1 > qDiag && qA1 + qDiag > qB1 && qB1 + qDiag > qA1;
  const isValidT2 = qA2 + qB2 > qDiag && qA2 + qDiag > qB2 && qB2 + qDiag > qA2;

  const s1 = (qA1 + qB1 + qDiag) / 2;
  const p1 = s1 * (s1 - qA1) * (s1 - qB1) * (s1 - qDiag);
  const areaT1 = isValidT1 && p1 > 0 ? Math.sqrt(p1) : 0;

  const s2 = (qA2 + qB2 + qDiag) / 2;
  const p2 = s2 * (s2 - qA2) * (s2 - qB2) * (s2 - qDiag);
  const areaT2 = isValidT2 && p2 > 0 ? Math.sqrt(p2) : 0;

  const totalQuadArea = areaT1 + areaT2;

  // --- Practice / Challenge State ---
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const landProblems = [
    {
      titleNp: 'समस्या 1: त्रिकोणात्मक जग्गाको क्षेत्रफल',
      titleEn: 'Problem 1: Triangular Land Plot',
      descNp: 'एउटा त्रिकोणात्मक जग्गाका भुजाहरू क्रमशः 25 m, 30 m र 35 m छन्। हिरोनको सूत्र प्रयोग गरी सो जग्गाको क्षेत्रफल (sq mमा) निकाल्नुहोस्।',
      descEn: 'A triangular plot has boundaries of 25m, 30m, and 35m. Calculate the area of the land plot using Heron\'s formula.',
      // s = (25+30+35)/2 = 45. s-a = 20, s-b = 15, s-c = 10. Product = 45 * 20 * 15 * 10 = 135000. sqrt(135000) = 367.42
      correct: 367.42,
      solutionNp: 's = (25 + 30 + 35) / 2 = 45 m। A = √[45 × (45-25) × (45-30) × (45-35)] = √[45 × 20 × 15 × 10] = √1,35,000 ≈ 367.42 sq m।',
      solutionEn: 's = (25 + 30 + 35) / 2 = 45 m. A = √[45 × 20 × 15 × 10] = √135,000 ≈ 367.42 sq. m.',
    },
    {
      titleNp: 'समस्या 2: समद्विबाहु त्रिभुजको जग्गा',
      titleEn: 'Problem 2: Isosceles Triangular Field',
      descNp: 'एउटा बारीका दुई समान भुजाहरू 20 m र आधार 24 m छन्। सो बारीको क्षेत्रफल कति हुन्छ?',
      descEn: 'A farm has two equal sides of 20m each and a base of 24m. Find the total area of the field.',
      // s = (20+20+24)/2 = 32. s-a = 12, s-b = 12, s-c = 8. Product = 32 * 12 * 12 * 8 = 36864. sqrt(36864) = 192.
      correct: 192,
      solutionNp: 's = (20 + 20 + 24) / 2 = 32 m। A = √[32 × 12 × 12 × 8] = √36,864 = 192 sq m।',
      solutionEn: 's = (20 + 20 + 24) / 2 = 32 m. A = √[32 × 12 × 12 × 8] = √36,864 = 192 sq. m.',
    },
    {
      titleNp: 'समस्या 3: चतुर्भुजाकार जग्गाको विभाजन',
      titleEn: 'Problem 3: Quadrilateral Land by Diagonal',
      descNp: 'एउटा चतुर्भुजाकार घडेरीको विकर्ण 50 m छ। सो विकर्णले बनाएका दुई त्रिभुजहरूको क्षेत्रफल क्रमशः 250 sq m र 350 sq m छन् भने कुल घडेरीको क्षेत्रफल कति हुन्छ?',
      descEn: 'A diagonal of a quadrilateral plot is 50m. The two divided triangles have areas 250 sq. m and 350 sq. m. What is the total area of the plot?',
      correct: 600,
      solutionNp: 'कुल क्षेत्रफल = A₁ + A₂ = 250 + 350 = 600 sq m।',
      solutionEn: 'Total Area = A₁ + A₂ = 250 + 350 = 600 sq. m.',
    },
  ];

  const currProb = landProblems[challengeIdx];

  const handleCheckChallenge = () => {
    const val = parseFloat(userAnswer.trim());
    if (isNaN(val)) return;
    if (Math.abs(val - currProb.correct) <= 0.5) {
      kit.good();
      setFeedback('correct');
    } else {
      kit.oops();
      setFeedback('incorrect');
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! पाठ 5 क्षेत्रफल अन्तर्गत हिरोनको सूत्रबाट विषमबाहु त्रिभुज र चतुर्भुजको क्षेत्रफल निकाल्न सिकौं!',
        "Welcome! Explore Heron's formula for scalene triangles and quadrilateral land plots!"
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Navigation Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('triangle')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'triangle'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>📐</span>
            <span>{L('1. हिरोनको सूत्र (त्रिभुज)', "1. Heron's Formula")}</span>
          </button>
          <button
            onClick={() => setActiveTab('quadrilateral')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quadrilateral'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🔷</span>
            <span>{L('2. चतुर्भुज विभाजन', '2. Quad Division')}</span>
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'challenge'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🎯</span>
            <span>{L('3. जग्गा समस्या चुनौती', '3. Land Problems')}</span>
          </button>
        </div>

        {activeTab === 'triangle' && (
          /* =========================================================================
             HERON'S FORMULA EXPLORER (SCALENE TRIANGLE)
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-2">
                <span>📐</span>
                <span>{L('हिरोनको सूत्रद्वारा विषमबाहु त्रिभुजको क्षेत्रफल', "Heron's Formula for Scalene Triangles")}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'विषमबाहु त्रिभुजमा उचाइ थाहा नभएको अवस्थामा तीनवटै भुजाहरू a, b, c को नाप प्रयोग गरी अर्ध-परिमिति s = (a + b + c)/2 निकालिन्छ। त्यसपछि हिरोनको सूत्र A = √[s(s - a)(s - b)(s - c)] बाट क्षेत्रफल पत्ता लगाइन्छ।',
                  "When the height is unknown, Heron's formula calculates triangle area from its three sides a, b, and c via semi-perimeter s = (a + b + c)/2."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('त्रिभुजका भुजाहरू परिवर्तन गर्नुहोस्', 'Adjust Triangle Sides')}
                </h3>

                {/* Side a */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {L('भुजा a (Side a):', 'Side a:')}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {isNe ? toNp(sideA) : sideA} {L('एकाइ', 'units')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={sideA}
                    onChange={(e) => setSideA(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Side b */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {L('भुजा b (Side b):', 'Side b:')}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {isNe ? toNp(sideB) : sideB} {L('एकाइ', 'units')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={sideB}
                    onChange={(e) => setSideB(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Side c */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {L('भुजा c (Side c):', 'Side c:')}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {isNe ? toNp(sideC) : sideC} {L('एकाइ', 'units')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={sideC}
                    onChange={(e) => setSideC(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Triangle Inequality Status */}
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  isValidTriangle
                    ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                }`}>
                  {isValidTriangle ? (
                    <div>
                      ✓ {L('त्रिभुज सम्भव छ (Triangle Inequality Satisfied): कुनै दुई भुजाको जोड तेस्रो भुजाभन्दा ठूलो छ।', 'Valid triangle: The sum of any two sides is greater than the third side.')}
                    </div>
                  ) : (
                    <div>
                      ✗ {L('त्रिभुज बन्न सक्दैन (Invalid Triangle): दुई भुजाको योग तेस्रो भन्दा ठूलो हुनुपर्छ।', 'Invalid triangle: Sum of any two sides must exceed the third side.')}
                    </div>
                  )}
                </div>

                {/* Preset standard textbook triangles */}
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    {L('पाठ्यपुस्तकका चर्चित उदाहरणहरू:', 'Textbook Standard Examples:')}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => { setSideA(13); setSideB(14); setSideC(15); }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-bold rounded-lg"
                    >
                      13, 14, 15
                    </button>
                    <button
                      onClick={() => { setSideA(6); setSideB(8); setSideC(10); }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-bold rounded-lg"
                    >
                      6, 8, 10
                    </button>
                    <button
                      onClick={() => { setSideA(20); setSideB(25); setSideC(30); }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-bold rounded-lg"
                    >
                      20, 25, 30
                    </button>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Visualization */}
              <div className="lg:col-span-7 space-y-4">
                {/* SVG Visual Triangle */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 400 240" className="w-full max-w-md h-56">
                    {isValidTriangle ? (
                      <g>
                        {/* Triangle Coordinates */}
                        {/* A at top, B at bottom left, C at bottom right */}
                        <polygon
                          points="200,30 60,200 340,200"
                          className="fill-emerald-100/70 dark:fill-emerald-900/30 stroke-emerald-600 dark:stroke-emerald-400 stroke-2"
                        />
                        {/* Vertex Labels */}
                        <circle cx="200" cy="30" r="5" className="fill-emerald-600" />
                        <text x="200" y="20" textAnchor="middle" className="text-xs font-bold fill-gray-800 dark:fill-gray-100">A</text>

                        <circle cx="60" cy="200" r="5" className="fill-emerald-600" />
                        <text x="50" y="215" textAnchor="middle" className="text-xs font-bold fill-gray-800 dark:fill-gray-100">B</text>

                        <circle cx="340" cy="200" r="5" className="fill-emerald-600" />
                        <text x="350" y="215" textAnchor="middle" className="text-xs font-bold fill-gray-800 dark:fill-gray-100">C</text>

                        {/* Side lengths */}
                        <text x="115" y="110" className="text-xs font-bold fill-emerald-700 dark:fill-emerald-300 font-mono">
                          c = {isNe ? toNp(sideC) : sideC}
                        </text>
                        <text x="280" y="110" className="text-xs font-bold fill-emerald-700 dark:fill-emerald-300 font-mono">
                          b = {isNe ? toNp(sideB) : sideB}
                        </text>
                        <text x="200" y="220" textAnchor="middle" className="text-xs font-bold fill-emerald-700 dark:fill-emerald-300 font-mono">
                          a = {isNe ? toNp(sideA) : sideA}
                        </text>

                        {/* Shaded Area Callout */}
                        <text x="200" y="130" textAnchor="middle" className="text-base font-black fill-emerald-800 dark:fill-emerald-200">
                          {L('क्षेत्रफल', 'Area')} ≈ {isNe ? toNp(triangleArea.toFixed(2)) : triangleArea.toFixed(2)}
                        </text>
                      </g>
                    ) : (
                      <text x="200" y="120" textAnchor="middle" className="text-sm font-bold fill-red-500">
                        {L('यी भुजाहरूबाट त्रिभुज बन्न सक्दैन', 'Cannot form triangle with these sides')}
                      </text>
                    )}
                  </svg>
                </div>

                {/* Step-by-Step Mathematical Calculations */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3 text-sm">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                    {L('हिरोनको सूत्रको चरणबद्ध हिसाब (Step-by-Step Calculation)', "Heron's Formula Breakdown")}
                  </h4>

                  {/* Step 1: Perimeter and Semi-Perimeter */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-1">
                    <div className="font-bold text-gray-800 dark:text-gray-200">
                      {L('चरण 1: परिमिति (P) र अर्ध-परिमिति (s) निकाल्ने', 'Step 1: Perimeter & Semi-Perimeter (s)')}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                      P = a + b + c = {isNe ? toNp(sideA) : sideA} + {isNe ? toNp(sideB) : sideB} + {isNe ? toNp(sideC) : sideC} = {isNe ? toNp(sideA + sideB + sideC) : sideA + sideB + sideC}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      s = P / 2 = {isNe ? toNp(sideA + sideB + sideC) : sideA + sideB + sideC} / 2 = {isNe ? toNp(semiPerimeter) : semiPerimeter}
                    </div>
                  </div>

                  {/* Step 2: Differences (s - a), (s - b), (s - c) */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-1">
                    <div className="font-bold text-gray-800 dark:text-gray-200">
                      {L('चरण 2: प्रत्येक भुजा घटाउने (s - a, s - b, s - c)', 'Step 2: Subtractions (s - a, s - b, s - c)')}
                    </div>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs text-gray-700 dark:text-gray-300">
                      <div>(s - a) = {isNe ? toNp(semiPerimeter) : semiPerimeter} - {isNe ? toNp(sideA) : sideA} = <strong>{isNe ? toNp(sMinusA) : sMinusA}</strong></div>
                      <div>(s - b) = {isNe ? toNp(semiPerimeter) : semiPerimeter} - {isNe ? toNp(sideB) : sideB} = <strong>{isNe ? toNp(sMinusB) : sMinusB}</strong></div>
                      <div>(s - c) = {isNe ? toNp(semiPerimeter) : semiPerimeter} - {isNe ? toNp(sideC) : sideC} = <strong>{isNe ? toNp(sMinusC) : sMinusC}</strong></div>
                    </div>
                  </div>

                  {/* Step 3: Heron's Formula Application */}
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                    <div className="font-bold text-emerald-900 dark:text-emerald-200">
                      {L("चरण 3: हिरोनको सूत्र प्रयोग गर्ने: A = √[s(s - a)(s - b)(s - c)]", "Step 3: Apply Heron's Formula: A = √[s(s - a)(s - b)(s - c)]")}
                    </div>
                    <div className="font-mono text-xs text-emerald-800 dark:text-emerald-300">
                      A = √[{isNe ? toNp(semiPerimeter) : semiPerimeter} × {isNe ? toNp(sMinusA) : sMinusA} × {isNe ? toNp(sMinusB) : sMinusB} × {isNe ? toNp(sMinusC) : sMinusC}]
                    </div>
                    <div className="font-mono text-xs text-emerald-800 dark:text-emerald-300">
                      A = √[{isNe ? toNp(heronsProduct) : heronsProduct.toLocaleString()}]
                    </div>
                    <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">
                      A ≈ {isNe ? toNp(triangleArea.toFixed(2)) : triangleArea.toFixed(2)} {L('वर्ग एकाइ (sq. units)', 'sq. units')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quadrilateral' && (
          /* =========================================================================
             QUADRILATERAL SPLIT BY DIAGONAL
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                <span>🔷</span>
                <span>{L('चतुर्भुजलाई दुई त्रिभुजमा विभाजन गरी क्षेत्रफल पत्ता लगाउने', 'Quadrilateral Area by Diagonal Division')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'जग्गा नापी गर्दा अनियमित आकारको चतुर्भुजाकार जग्गालाई एउटा विकर्ण (Diagonal d) खिचेर दुईpcs त्रिभुज Δ1 र Δ2 मा विभाजन गरिन्छ। दुवै त्रिभुजको क्षेत्रफल हिरोनको सूत्रबाट निकाली जोड्दा कुल क्षेत्रफल आउँछ: कुल क्षेत्रफल = A₁ + A₂।',
                  'In land surveys, an irregular quadrilateral is divided into two triangles by a diagonal d. The areas of both triangles are computed using Heron\'s formula and summed: Total Area = A₁ + A₂.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Inputs */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('भुजाहरू तथा विकर्ण (Sides & Diagonal)', 'Sides & Diagonal Inputs')}
                </h3>

                {/* Triangle 1 Inputs */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl space-y-3 border border-blue-200 dark:border-blue-800">
                  <div className="font-bold text-blue-900 dark:text-blue-200 text-xs uppercase tracking-wide">
                    {L('त्रिभुज 1:', 'Triangle 1 (Top Part):')}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">{L('भुजा a₁ (m):', 'Side a₁ (m):')}</label>
                      <input
                        type="number"
                        value={qA1}
                        onChange={(e) => setQA1(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">{L('भुजा b₁ (m):', 'Side b₁ (m):')}</label>
                      <input
                        type="number"
                        value={qB1}
                        onChange={(e) => setQB1(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Common Diagonal */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl space-y-2 border border-amber-200 dark:border-amber-800">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wide">
                      {L('साझा विकर्ण d (Diagonal d):', 'Shared Diagonal d:')}
                    </span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                      {isNe ? toNp(qDiag) : qDiag} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={qDiag}
                    onChange={(e) => setQDiag(parseInt(e.target.value) || 0)}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                {/* Triangle 2 Inputs */}
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl space-y-3 border border-indigo-200 dark:border-indigo-800">
                  <div className="font-bold text-indigo-900 dark:text-indigo-200 text-xs uppercase tracking-wide">
                    {L('त्रिभुज 2:', 'Triangle 2 (Bottom Part):')}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">{L('भुजा a₂ (m):', 'Side a₂ (m):')}</label>
                      <input
                        type="number"
                        value={qA2}
                        onChange={(e) => setQA2(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">{L('भुजा b₂ (m):', 'Side b₂ (m):')}</label>
                      <input
                        type="number"
                        value={qB2}
                        onChange={(e) => setQB2(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphic & Sum Breakdown */}
              <div className="lg:col-span-7 space-y-4">
                {/* SVG Visual Quad */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 400 240" className="w-full max-w-md h-56">
                    {/* Quad ABCD split into ABD (T1) and BCD (T2) */}
                    {/* Top Triangle T1 (Blue) */}
                    <polygon
                      points="50,120 200,30 350,120"
                      className="fill-blue-100/70 dark:fill-blue-900/40 stroke-blue-600 stroke-2"
                    />
                    {/* Bottom Triangle T2 (Indigo) */}
                    <polygon
                      points="50,120 350,120 220,210"
                      className="fill-indigo-100/70 dark:fill-indigo-900/40 stroke-indigo-600 stroke-2"
                    />
                    {/* Diagonal Line */}
                    <line
                      x1="50"
                      y1="120"
                      x2="350"
                      y2="120"
                      className="stroke-amber-500 stroke-2 stroke-dasharray-4"
                      strokeDasharray="6 4"
                    />

                    {/* Labels */}
                    <text x="200" y="80" textAnchor="middle" className="text-xs font-black fill-blue-700 dark:fill-blue-300">
                      Δ1 = {isNe ? toNp(areaT1.toFixed(1)) : areaT1.toFixed(1)} m²
                    </text>
                    <text x="200" y="165" textAnchor="middle" className="text-xs font-black fill-indigo-700 dark:fill-indigo-300">
                      Δ2 = {isNe ? toNp(areaT2.toFixed(1)) : areaT2.toFixed(1)} m²
                    </text>
                    <text x="200" y="115" textAnchor="middle" className="text-[11px] font-mono font-bold fill-amber-700 dark:fill-amber-300">
                      d = {isNe ? toNp(qDiag) : qDiag} m
                    </text>
                  </svg>
                </div>

                {/* Calculation Summary */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3 text-sm">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                    {L('चतुर्भुजको कुल क्षेत्रफलको गणना', 'Quadrilateral Total Area Calculation')}
                  </h4>

                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-blue-700 dark:text-blue-300 font-semibold">
                      {L('1. त्रिभुज 1 को क्षेत्रफल (A₁):', '1. Triangle 1 Area (A₁):')}
                    </span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                      {isNe ? toNp(areaT1.toFixed(2)) : areaT1.toFixed(2)} m²
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-indigo-700 dark:text-indigo-300 font-semibold">
                      {L('2. त्रिभुज 2 को क्षेत्रफल (A₂):', '2. Triangle 2 Area (A₂):')}
                    </span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                      {isNe ? toNp(areaT2.toFixed(2)) : areaT2.toFixed(2)} m²
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-base font-black text-indigo-900 dark:text-indigo-200">
                    <span>{L('कुल चतुर्भुजको क्षेत्रफल (A = A₁ + A₂):', 'Total Quadrilateral Area (A = A₁ + A₂):')}</span>
                    <span className="text-xl font-mono text-indigo-600 dark:text-indigo-400">
                      {isNe ? toNp(totalQuadArea.toFixed(2)) : totalQuadArea.toFixed(2)} m²
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenge' && (
          /* =========================================================================
             LAND PROBLEM CHALLENGE
             ========================================================================= */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex gap-2 justify-center">
              {landProblems.map((p, i) => (
                <button
                  key={p.titleEn}
                  onClick={() => {
                    setChallengeIdx(i);
                    setUserAnswer('');
                    setFeedback(null);
                  }}
                  className={`py-2 px-4 rounded-xl text-sm font-bold border transition-all ${
                    challengeIdx === i
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isNe ? toNp(i + 1) : i + 1}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-purple-200 dark:border-purple-800 space-y-5">
              <div className="border-b pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {L('अभ्यास समस्या', 'Practice Challenge')}
                </span>
                <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 mt-1">
                  {isNe ? currProb.titleNp : currProb.titleEn}
                </h3>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-gray-800 dark:text-gray-200 text-base leading-relaxed border border-purple-200 dark:border-purple-800">
                {isNe ? currProb.descNp : currProb.descEn}
              </div>

              {/* Input */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {L('तपाईंको उत्तर (sq mमा):', 'Your Answer (in sq. meters):')}
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="any"
                    value={userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value);
                      setFeedback(null);
                    }}
                    placeholder={L('उदा. 367.42', 'e.g. 367.42')}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 font-mono text-lg font-bold dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={handleCheckChallenge}
                    disabled={!userAnswer.trim()}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow disabled:opacity-50 transition-all"
                  >
                    {L('जाँच गर्नुहोस्', 'Check Answer')}
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback === 'correct' && (
                <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 rounded-xl text-green-900 dark:text-green-200 space-y-2">
                  <div className="font-black flex items-center gap-2 text-base">
                    <span>🎉</span>
                    <span>{L('उत्कृष्ट! सही उत्तर।', 'Excellent! Correct Answer.')}</span>
                  </div>
                  <div className="text-sm">
                    <strong>{L('समाधान विधि:', 'Solution:')}</strong> {isNe ? currProb.solutionNp : currProb.solutionEn}
                  </div>
                </div>
              )}

              {feedback === 'incorrect' && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl text-red-900 dark:text-red-200 space-y-2">
                  <div className="font-black flex items-center gap-2 text-base">
                    <span>❌</span>
                    <span>{L('उत्तर मिलेन। पुनः प्रयास गर्नुहोस्।', 'Incorrect. Please try again!')}</span>
                  </div>
                  <div className="text-xs">
                    {L('सुझाव: पहिले अर्ध-परिमिति s निकाल्नुहोस् र हिरोनको सूत्र A = √[s(s-a)(s-b)(s-c)] प्रयोग गर्नुहोस्।', "Hint: Calculate semi-perimeter s first, then apply Heron's formula.")}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default HeronsFormulaLandExplorer;
