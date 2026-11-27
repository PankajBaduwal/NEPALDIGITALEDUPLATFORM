import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const EqualAreaGeometryExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U10-01',
    chapter: 10,
    titleNp: 'समान क्षेत्रफल ज्यामिति अन्वेषक',
    titleEn: 'Equal-Area Geometry Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'parallelograms' | 'triangleParallelogram' | 'triangles' | 'proof' | 'challenge'>('parallelograms');

  // ── 1. PARALLELOGRAMS ON SAME BASE STATE ──────────────────────────────────
  const [baseLen, setBaseLen] = useState<number>(7); // base b in cm
  const [heightVal, setHeightVal] = useState<number>(5); // height h in cm
  const [p1Shift, setP1Shift] = useState<number>(2); // top shift of parallelogram 1
  const [p2Shift, setP2Shift] = useState<number>(5); // top shift of parallelogram 2
  const [showRectangleCompare, setShowRectangleCompare] = useState<boolean>(false);

  // Scaled coordinates for SVG: origin at (70, 220)
  // 1 cm = 26 px
  const pxPerCm = 26;
  const startX = 70;
  const baseY = 210;
  const topY = baseY - heightVal * pxPerCm;
  const pBasePx = baseLen * pxPerCm;

  const A = { x: startX, y: baseY };
  const B = { x: startX + pBasePx, y: baseY };

  // Parallelogram 1 (ABCD): D = A + shift1, C = B + shift1
  const D1 = { x: startX + p1Shift * pxPerCm, y: topY };
  const C1 = { x: startX + (baseLen + p1Shift) * pxPerCm, y: topY };

  // Parallelogram 2 (ABEF): F = A + shift2, E = B + shift2
  const F2 = { x: startX + p2Shift * pxPerCm, y: topY };
  const E2 = { x: startX + (baseLen + p2Shift) * pxPerCm, y: topY };

  // Rectangle on same base (ABR1R2): R1 = (A.x, topY), R2 = (B.x, topY)
  const R1 = { x: startX, y: topY };
  const R2 = { x: startX + pBasePx, y: topY };

  const areaP1 = baseLen * heightVal;
  const areaP2 = baseLen * heightVal;
  const areaRect = baseLen * heightVal;

  // ── 2. TRIANGLE & PARALLELOGRAM STATE ─────────────────────────────────────
  const [triApexShift, setTriApexShift] = useState<number>(3.5); // vertex E position along top parallel line
  const areaTriangle = 0.5 * baseLen * heightVal;

  // ── 3. TWO TRIANGLES ON SAME BASE STATE ───────────────────────────────────
  const [tri1Shift, setTri1Shift] = useState<number>(2);
  const [tri2Shift, setTri2Shift] = useState<number>(6);
  const [showMedianView, setShowMedianView] = useState<boolean>(false);

  // ── 4. FORMAL PROOF STEPPER STATE ─────────────────────────────────────────
  const [proofStep, setProofStep] = useState<number>(0);
  const proofSteps = [
    {
      titleNp: 'साध्य 1: एउटै आधार र उही समानान्तर रेखाहरू बीचका समानान्तर चतुर्भुजहरू क्षेत्रफलमा बराबर हुन्छन्।',
      titleEn: 'Theorem 1: Parallelograms on the same base and between the same parallels are equal in area.',
      givenNp: 'दिइएको: स.च. ABCD र स.च. ABEF एउटै आधार AB र उही समानान्तर रेखाहरू AB र FC बीच रहेका छन्।',
      givenEn: 'Given: Parallelograms ABCD and ABEF on the same base AB and between same parallels AB || FC.',
      toProveNp: 'प्रमाणित गर्नुपर्ने: स.च. ABCD को क्षे. = स.च. ABEF को क्षे.',
      toProveEn: 'To Prove: Area of Parallelogram ABCD = Area of Parallelogram ABEF.',
      steps: [
        {
          statementNp: '1. ∆ADF र ∆BCE मा: (i) ∠ADF = ∠BCE, (ii) ∠AFD = ∠BEC, (iii) AD = BC।',
          statementEn: '1. In ∆ADF and ∆BCE: (i) ∠ADF = ∠BCE (corr. angles, AD || BC), (ii) ∠AFD = ∠BEC (corr. angles, AF || BE), (iii) AD = BC (opp. sides of ||gm ABCD).',
          reasonNp: 'कोण-कोण-भुजा (को.को.भु. वा को.भु.को.) अनुरूपता तथ्य।',
          reasonEn: 'Angle-Angle-Side (AAS) congruency axiom.',
          highlight: 'triangles',
        },
        {
          statementNp: '2. ∆ADF ≅ ∆BCE',
          statementEn: '2. ∆ADF ≅ ∆BCE',
          reasonNp: 'तथ्य 1 अनुसार दुई त्रिभुजहरू अनुरूप भएकाले।',
          reasonEn: 'Triangles are congruent by statement 1.',
          highlight: 'triangles',
        },
        {
          statementNp: '3. ∆ADF को क्षे. = ∆BCE को क्षे.',
          statementEn: '3. Area of ∆ADF = Area of ∆BCE',
          reasonNp: 'अनुरूप त्रिभुजहरूको क्षेत्रफल बराबर हुन्छ।',
          reasonEn: 'Congruent triangles are equal in area.',
          highlight: 'triangles',
        },
        {
          statementNp: '4. चतुर्भुज ABED को क्षे. + ∆ADF को क्षे. = चतुर्भुज ABED को क्षे. + ∆BCE को क्षे.',
          statementEn: '4. Trapezium ABED + ∆ADF = Trapezium ABED + ∆BCE',
          reasonNp: 'तथ्य 3 को दुवैतर्फ साझा भाग चतुर्भुज ABED को क्षेत्रफल जोड्दा।',
          reasonEn: 'Adding common area of Trapezium ABED to both sides of statement 3.',
          highlight: 'trapezium',
        },
        {
          statementNp: '5. अतः स.च. ABEF को क्षे. = स.च. ABCD को क्षे.',
          statementEn: '5. Therefore, Area of ||gm ABEF = Area of ||gm ABCD (Proved).',
          reasonNp: 'अखण्ड योग तथ्य अनुसार।',
          reasonEn: 'Whole part axiom (sum of parts equals whole).',
          highlight: 'all',
        },
      ],
    },
  ];

  // ── 5. PRACTICE CHALLENGE ──────────────────────────────────────────────────
  const [score, setScore] = useState<number>(0);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizQuestions = [
    {
      qEn: 'If a parallelogram and a triangle stand on the same base of 8 cm and between the same parallels of height 6 cm, what is the area of the triangle?',
      qNp: 'यदि एउटा समानान्तर चतुर्भुज र त्रिभुज एउटै आधार 8 से.मी. र उही समानान्तर रेखाहरू बीच 6 से.मी. उचाइमा छन् भने त्रिभुजको क्षेत्रफल कति हुन्छ?',
      options: ['24 cm²', '48 cm²', '16 cm²', '32 cm²'],
      optionsNp: ['24 वर्ग से.मी.', '48 वर्ग से.मी.', '16 वर्ग से.मी.', '32 वर्ग से.मी.'],
      correct: 0, // 0.5 * 8 * 6 = 24
      hintEn: 'Area of triangle = 1/2 × base × height = 1/2 × 8 × 6 = 24 cm² (Half of parallelogram area = 48 cm²).',
      hintNp: 'त्रिभुजको क्षेत्रफल = 1/2 × आधार × उचाइ = 1/2 × 8 × 6 = 24 वर्ग से.मी.।',
    },
    {
      qEn: 'In ∆ABC, AD is a median bisecting BC at D. If Area of ∆ABC = 60 cm², what is the Area of ∆ABD?',
      qNp: '∆ABC मा AD एउटा मध्यिका हो जसले BC लाई D मा बराबर भाग गर्छ। यदि ∆ABC को क्षेत्रफल 60 वर्ग से.मी. भए ∆ABD को क्षेत्रफल कति हुन्छ?',
      options: ['30 cm²', '40 cm²', '20 cm²', '45 cm²'],
      optionsNp: ['30 वर्ग से.मी.', '40 वर्ग से.मी.', '20 वर्ग से.मी.', '45 वर्ग से.मी.'],
      correct: 0,
      hintEn: 'A median of a triangle divides it into two triangles of equal area. Hence, Area(∆ABD) = 60 / 2 = 30 cm².',
      hintNp: 'त्रिभुजको मध्यिकाले त्रिभुजलाई दुई बराबर क्षेत्रफल भएका त्रिभुजहरूमा विभाजन गर्छ। अतः क्षे(∆ABD) = 60 / 2 = 30 वर्ग से.मी.।',
    },
    {
      qEn: 'Two parallelograms ABCD and ABEF stand on the same base AB. If Area of ABCD = 42 cm², what is Area of ABEF if both lie between AB and CD?',
      qNp: 'दुई स.च. ABCD र ABEF एउटै आधार AB मा छन्। यदि दुवै AB र CD बीच रहेका छन् र ABCD को क्षेत्रफल 42 वर्ग से.मी. छ भने ABEF को क्षेत्रफल कति हुन्छ?',
      options: ['42 cm²', '21 cm²', '84 cm²', '36 cm²'],
      optionsNp: ['42 वर्ग से.मी.', '21 वर्ग से.मी.', '84 वर्ग से.मी.', '36 वर्ग से.मी.'],
      correct: 0,
      hintEn: 'Theorem: Parallelograms on the same base and between the same parallels are equal in area. Therefore Area(ABEF) = 42 cm².',
      hintNp: 'साध्य अनुसार: एउटै आधार र उही समानान्तर रेखाहरू बीचका समानान्तर चतुर्भुजहरू क्षेत्रफलमा बराबर हुन्छन्। अतः क्षे(ABEF) = 42 वर्ग से.मी.।',
    },
    {
      qEn: 'If a vertex of a triangle moves along a line parallel to its base, what happens to its area?',
      qNp: 'यदि त्रिभुजको एउटा शीर्षबिन्दु यसको आधारसँग समानान्तर हुने रेखामा दायाँ-बायाँ सर्छ भने यसको क्षेत्रफलमा के परिवर्तन हुन्छ?',
      options: [
        'Area remains constant (does not change)',
        'Area increases as it moves right',
        'Area decreases as it moves right',
        'Area becomes zero',
      ],
      optionsNp: [
        'क्षेत्रफल स्थिर रहन्छ (कुनै परिवर्तन हुँदैन)',
        'दायाँ सर्दा क्षेत्रफल बढ्छ',
        'दायाँ सर्दा क्षेत्रफल घट्छ',
        'क्षेत्रफल शून्य हुन्छ',
      ],
      correct: 0,
      hintEn: 'Since base and perpendicular distance (height) between parallels remain unchanged, Area = 1/2 × b × h remains strictly constant.',
      hintNp: 'आधार र समानान्तर रेखाहरू बीचको लम्ब उचाइ स्थिर रहने हुनाले 1/2 × आधार × उचाइ को मान सधैँ समान रहन्छ।',
    },
  ];

  const handleSelectAnswer = (idx: number) => {
    setSelectedAns(idx);
    const q = quizQuestions[quizIdx];
    if (idx === q.correct) {
      kit.good();
      setScore((prev) => prev + 10);
      setQuizFeedback(isNe ? 'सटीक उत्तर! धेरै राम्रो।' : 'Correct! Excellent geometric reasoning.');
    } else {
      kit.oops();
      setQuizFeedback(isNe ? 'गलत उत्तर। साध्य र संकेत हेरी पुन: प्रयास गर्नुहोस्।' : 'Incorrect. Check the theorem and formula.');
    }
  };

  const handleNextQuiz = () => {
    kit.tap();
    setSelectedAns(null);
    setQuizFeedback(null);
    setQuizIdx((prev) => (prev + 1) % quizQuestions.length);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा 10 गणितको एकाइ 10: त्रिभुज र चतुर्भुजहरू (Triangles and Quadrilaterals) समान क्षेत्रफल प्रयोगशालामा स्वागत छ! यहाँ शीर्षबिन्दुहरू सार्नुहोस्, समानान्तर रेखाहरू बीच क्षेत्रफल बराबर हुने साध्यहरू प्रत्यक्ष जाँच्नुहोस्!',
        'Welcome to Grade 10 Unit 10: Equal-Area Geometry Explorer! Slide vertices along parallel lines, verify equal area theorems dynamically, and follow step-by-step geometric proofs!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'parallelograms', labelNp: 'क) स.च. हरूको समान क्षेत्रफल (साध्य 1)', labelEn: 'A) Equal Parallelograms (Thm 1)' },
            { id: 'triangleParallelogram', labelNp: 'ख) त्रिभुज र स.च. को सम्बन्ध (साध्य 2)', labelEn: 'B) Triangle & Parallelogram (Thm 2)' },
            { id: 'triangles', labelNp: 'ग) समान त्रिभुज तथा मध्यिका (साध्य 3)', labelEn: 'C) Equal Triangles & Median (Thm 3)' },
            { id: 'proof', labelNp: 'घ) अन्तरक्रियात्मक सैद्धान्तिक प्रमाण', labelEn: 'D) Interactive Formal Proof' },
            { id: 'challenge', labelNp: 'ङ) अभ्यास चुनौती (Quiz)', labelEn: 'E) Practice Challenge' },
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
            TAB 1: PARALLELOGRAMS ON SAME BASE (THEOREM 1)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'parallelograms' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Visual SVG Canvas */}
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{L('साध्य 1: एउटै आधार र उही समानान्तर रेखाहरू बीच', 'Theorem 1: Same Base & Same Parallels')}</span>
                <span className="text-amber-300 font-mono">
                  {L('उचाइ h = ' + fmt(heightVal) + ' cm', 'Height h = ' + fmt(heightVal) + ' cm')}
                </span>
              </div>

              <div className="w-full overflow-hidden flex justify-center bg-slate-900/60 rounded-xl border border-slate-700 py-3">
                <svg width={480} height={260} viewBox="0 0 480 260" className="max-w-full">
                  {/* Parallel Line 1 (Top) */}
                  <line x1={20} y1={topY} x2={460} y2={topY} stroke="#38BDF8" strokeWidth={2} strokeDasharray="4,3" />
                  <text x={450} y={topY - 8} fill="#38BDF8" fontSize="10" fontWeight="bold">L₂</text>

                  {/* Parallel Line 2 (Bottom) */}
                  <line x1={20} y1={baseY} x2={460} y2={baseY} stroke="#38BDF8" strokeWidth={2} />
                  <text x={450} y={baseY + 16} fill="#38BDF8" fontSize="10" fontWeight="bold">L₁</text>

                  {/* Perpendicular Height Indicator */}
                  <line x1={A.x + 35} y1={topY} x2={A.x + 35} y2={baseY} stroke="#F59E0B" strokeWidth={2} strokeDasharray="3,3" />
                  {/* Right angle marker */}
                  <rect x={A.x + 35} y={baseY - 10} width={10} height={10} fill="none" stroke="#F59E0B" strokeWidth={1.5} />
                  <text x={A.x + 40} y={topY + (baseY - topY) / 2 + 4} fill="#FDE68A" fontSize="10" fontWeight="bold">
                    h = {fmt(heightVal)}
                  </text>

                  {/* Parallelogram 1 (ABCD) - Teal */}
                  <polygon
                    points={`${A.x},${A.y} ${B.x},${B.y} ${C1.x},${C1.y} ${D1.x},${D1.y}`}
                    fill="#14B8A6"
                    fillOpacity={0.35}
                    stroke="#14B8A6"
                    strokeWidth={2.5}
                  />

                  {/* Parallelogram 2 (ABEF) - Amber */}
                  <polygon
                    points={`${A.x},${A.y} ${B.x},${B.y} ${E2.x},${E2.y} ${F2.x},${F2.y}`}
                    fill="#F59E0B"
                    fillOpacity={0.3}
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                  />

                  {/* Rectangle Comparison (if toggled) */}
                  {showRectangleCompare && (
                    <polygon
                      points={`${A.x},${A.y} ${B.x},${B.y} ${R2.x},${R2.y} ${R1.x},${R1.y}`}
                      fill="#EC4899"
                      fillOpacity={0.25}
                      stroke="#EC4899"
                      strokeWidth={2}
                      strokeDasharray="4,2"
                    />
                  )}

                  {/* Common Base Highlight */}
                  <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#EF4444" strokeWidth={4} />

                  {/* Vertex Labels */}
                  <circle cx={A.x} cy={A.y} r={4} fill="#EF4444" />
                  <text x={A.x - 14} y={A.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">A</text>

                  <circle cx={B.x} cy={B.y} r={4} fill="#EF4444" />
                  <text x={B.x + 6} y={B.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">B</text>

                  {/* P1 Vertices */}
                  <circle cx={D1.x} cy={D1.y} r={4} fill="#14B8A6" />
                  <text x={D1.x - 10} y={D1.y - 8} fill="#5EEAD4" fontSize="11" fontWeight="bold">D</text>
                  <circle cx={C1.x} cy={C1.y} r={4} fill="#14B8A6" />
                  <text x={C1.x + 6} y={C1.y - 8} fill="#5EEAD4" fontSize="11" fontWeight="bold">C</text>

                  {/* P2 Vertices */}
                  <circle cx={F2.x} cy={F2.y} r={4} fill="#F59E0B" />
                  <text x={F2.x - 10} y={F2.y - 8} fill="#FDE68A" fontSize="11" fontWeight="bold">F</text>
                  <circle cx={E2.x} cy={E2.y} r={4} fill="#F59E0B" />
                  <text x={E2.x + 6} y={E2.y - 8} fill="#FDE68A" fontSize="11" fontWeight="bold">E</text>

                  {/* Base dimension label */}
                  <text x={A.x + pBasePx / 2} y={baseY + 22} textAnchor="middle" fill="#FCA5A5" fontSize="11" fontWeight="bold">
                    {L('साझा आधार (Base) = ' + fmt(baseLen) + ' cm', 'Common Base = ' + fmt(baseLen) + ' cm')}
                  </text>
                </svg>
              </div>

              <div className="w-full flex justify-between text-xs text-slate-300 mt-2">
                <span>Area of parallelogram ABCD: <strong className="text-teal-300">{fmt(areaP1)} cm²</strong></span>
                <span>Area of parallelogram ABEF: <strong className="text-amber-300">{fmt(areaP2)} cm²</strong></span>
              </div>
            </div>

            {/* Controls & Calculations */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <h4 className="font-bold text-sm text-[#142D4E]">
                  {L('ज्यामितीय नियन्त्रक (Geometric Sliders):', 'Geometric Controls:')}
                </h4>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('साझा आधार लम्बाइ (Base b):', 'Common Base (b):')}</span>
                    <span className="text-[#167C80] font-bold">{fmt(baseLen)} cm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="10"
                    step="0.5"
                    value={baseLen}
                    onChange={(e) => setBaseLen(Number(e.target.value))}
                    className="w-full accent-[#167C80]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('समानान्तर रेखा बीचको लम्ब उचाइ (Height h):', 'Perpendicular Height (h):')}</span>
                    <span className="text-amber-600 font-bold">{fmt(heightVal)} cm</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="7"
                    step="0.5"
                    value={heightVal}
                    onChange={(e) => setHeightVal(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('स.च. 1 (ABCD) को झुकाव (Top Shift):', '||gm 1 Inclination (Shift):')}</span>
                    <span className="text-teal-600 font-bold font-mono">+{fmt(p1Shift)} cm</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="4"
                    step="0.5"
                    value={p1Shift}
                    onChange={(e) => setP1Shift(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('स.च. 2 (ABEF) को झुकाव (Top Shift):', '||gm 2 Inclination (Shift):')}</span>
                    <span className="text-amber-600 font-bold font-mono">+{fmt(p2Shift)} cm</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="7"
                    step="0.5"
                    value={p2Shift}
                    onChange={(e) => setP2Shift(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div className="pt-2 border-t">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={showRectangleCompare}
                      onChange={(e) => setShowRectangleCompare(e.target.checked)}
                      className="accent-pink-600 rounded"
                    />
                    <span>{L('आयताकार रूप (Rectangle) सँग तुलना गर्नुहोस्', 'Compare with Rectangle on same base')}</span>
                  </label>
                </div>
              </div>

              {/* Theorem Result Card */}
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                  {L('गणितीय प्रमाण तथा निष्कर्ष (Mathematical Verification)', 'Mathematical Verification')}
                </span>

                <div className="p-2.5 bg-white rounded-xl border text-xs font-mono space-y-1">
                  <div>Area(ABCD) = base × height = {fmt(baseLen)} × {fmt(heightVal)} = <strong className="text-teal-700">{fmt(areaP1)} cm²</strong></div>
                  <div>Area(ABEF) = base × height = {fmt(baseLen)} × {fmt(heightVal)} = <strong className="text-amber-700">{fmt(areaP2)} cm²</strong></div>
                  {showRectangleCompare && (
                    <div>क्षे(आयतः ABR₁R₂) = {fmt(baseLen)} × {fmt(heightVal)} = <strong className="text-pink-700">{fmt(areaRect)} cm²</strong></div>
                  )}
                </div>

                <div className="text-xs text-emerald-900 leading-relaxed font-sans">
                  <strong>💡 {L('साध्य 1 निष्कर्ष:', 'Theorem 1 Conclusion:')}</strong>{' '}
                  {L(
                    'समानान्तर चतुर्भुजको आकार र झुकाव जतिसुकै परिवर्तन भए पनि आधार र उचाइ स्थिर रहेसम्म तिनीहरूको क्षेत्रफल सधैँ बराबर हुन्छ।',
                    'Regardless of how much the shape or inclination changes, as long as base and height remain constant, their areas are strictly equal.'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: TRIANGLE & PARALLELOGRAM RELATION (THEOREM 2)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'triangleParallelogram' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{L('साध्य 2: त्रिभुज र समानान्तर चतुर्भुजको क्षेत्रफल सम्बन्ध', 'Theorem 2: Triangle & Parallelogram Area')}</span>
                <span className="text-amber-300 font-mono">
                  Area(∆) = ½ × Area(||gm)
                </span>
              </div>

              <div className="w-full overflow-hidden flex justify-center bg-slate-900/60 rounded-xl border border-slate-700 py-3">
                <svg width={480} height={260} viewBox="0 0 480 260" className="max-w-full">
                  {/* Parallel Lines */}
                  <line x1={20} y1={topY} x2={460} y2={topY} stroke="#38BDF8" strokeWidth={2} strokeDasharray="4,3" />
                  <line x1={20} y1={baseY} x2={460} y2={baseY} stroke="#38BDF8" strokeWidth={2} />

                  {/* Parallelogram ABCD */}
                  <polygon
                    points={`${A.x},${A.y} ${B.x},${B.y} ${C1.x},${C1.y} ${D1.x},${D1.y}`}
                    fill="#14B8A6"
                    fillOpacity={0.25}
                    stroke="#14B8A6"
                    strokeWidth={2}
                  />

                  {/* Triangle ABE - apex E sliding on top line */}
                  {(() => {
                    const apexE = { x: startX + triApexShift * pxPerCm, y: topY };
                    return (
                      <g>
                        <polygon
                          points={`${A.x},${A.y} ${B.x},${B.y} ${apexE.x},${apexE.y}`}
                          fill="#F59E0B"
                          fillOpacity={0.55}
                          stroke="#F59E0B"
                          strokeWidth={3}
                        />
                        <circle cx={apexE.x} cy={apexE.y} r={6} fill="#F59E0B" />
                        <text x={apexE.x} y={apexE.y - 10} textAnchor="middle" fill="#FDE68A" fontSize="12" fontWeight="bold">
                          E (Apex)
                        </text>
                      </g>
                    );
                  })()}

                  {/* Base AB */}
                  <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#EF4444" strokeWidth={4} />
                  <circle cx={A.x} cy={A.y} r={4} fill="#EF4444" />
                  <text x={A.x - 14} y={A.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">A</text>
                  <circle cx={B.x} cy={B.y} r={4} fill="#EF4444" />
                  <text x={B.x + 6} y={B.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">B</text>

                  {/* Parallelogram vertices D, C */}
                  <circle cx={D1.x} cy={D1.y} r={4} fill="#14B8A6" />
                  <text x={D1.x - 12} y={D1.y - 8} fill="#5EEAD4" fontSize="11" fontWeight="bold">D</text>
                  <circle cx={C1.x} cy={C1.y} r={4} fill="#14B8A6" />
                  <text x={C1.x + 8} y={C1.y - 8} fill="#5EEAD4" fontSize="11" fontWeight="bold">C</text>
                </svg>
              </div>

              <div className="w-full flex justify-between text-xs text-slate-300 mt-2">
                <span>Area of parallelogram ABCD: <strong className="text-teal-300">{fmt(areaP1)} cm²</strong></span>
                <span>Area of ∆ ABE: <strong className="text-amber-300">{fmt(areaTriangle)} cm²</strong> (exactly half)</span>
              </div>
            </div>

            {/* Slider & Math Comparison */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <h4 className="font-bold text-sm text-[#142D4E]">
                  {L('त्रिभुजको शीर्षबिन्दु E सार्नुहोस्:', 'Slide Triangle Apex E along Line L₂:')}
                </h4>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('शीर्षबिन्दु E को स्थिति (Apex E Position):', 'Apex E Position along L₂:')}</span>
                    <span className="text-amber-600 font-bold font-mono">+{fmt(triApexShift)} cm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="11"
                    step="0.5"
                    value={triApexShift}
                    onChange={(e) => setTriApexShift(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {L('E लाई जतिसुकै दायाँ वा बायाँ सारे पनि त्रिभुजको क्षेत्रफल स्थिर रहन्छ।', 'Moving E anywhere along the parallel line keeps triangle area constant.')}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-300 rounded-2xl shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                  {L('साध्य 2 सूत्र तथा विश्लेषण (Theorem 2 Verification)', 'Theorem 2 Verification')}
                </span>

                <div className="p-3 bg-white rounded-xl border text-xs font-mono space-y-1.5">
                  <div className="text-slate-600">
                    1) Area of parallelogram ABCD = base × height = {fmt(baseLen)} × {fmt(heightVal)} ={' '}
                    <strong className="text-teal-700">{fmt(areaP1)} cm²</strong>
                  </div>
                  <div className="text-slate-600">
                    2) Area of ∆ ABE = ½ × base × height = ½ × {fmt(baseLen)} × {fmt(heightVal)} ={' '}
                    <strong className="text-amber-700">{fmt(areaTriangle)} cm²</strong>
                  </div>
                  <div className="text-xs font-bold text-teal-900 pt-1 border-t">
                    ∆ ABE = ½ × parallelogram ABCD = ½ × {fmt(areaP1)} = {fmt(areaTriangle)} cm²
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: EQUAL TRIANGLES ON SAME BASE (THEOREM 3)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'triangles' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>
                  {showMedianView
                    ? L('मध्यिकाले त्रिभुजलाई दुई बराबर क्षेत्रफलमा बाँड्छ', 'Median bisects triangle into equal areas')
                    : L('साध्य 3: एउटै आधार र उही समानान्तर रेखाहरू बीचका त्रिभुजहरू', 'Theorem 3: Triangles on Same Base')}
                </span>
                <span className="text-amber-300 font-mono">
                  Area(∆₁) = Area(∆₂)
                </span>
              </div>

              <div className="w-full overflow-hidden flex justify-center bg-slate-900/60 rounded-xl border border-slate-700 py-3">
                <svg width={480} height={260} viewBox="0 0 480 260" className="max-w-full">
                  {!showMedianView ? (
                    <>
                      {/* Parallel lines */}
                      <line x1={20} y1={topY} x2={460} y2={topY} stroke="#38BDF8" strokeWidth={2} strokeDasharray="4,3" />
                      <line x1={20} y1={baseY} x2={460} y2={baseY} stroke="#38BDF8" strokeWidth={2} />

                      {/* Triangle 1 (ABC) */}
                      {(() => {
                        const C = { x: startX + tri1Shift * pxPerCm, y: topY };
                        return (
                          <g>
                            <polygon
                              points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                              fill="#14B8A6"
                              fillOpacity={0.4}
                              stroke="#14B8A6"
                              strokeWidth={2.5}
                            />
                            <circle cx={C.x} cy={C.y} r={5} fill="#14B8A6" />
                            <text x={C.x} y={C.y - 8} textAnchor="middle" fill="#5EEAD4" fontSize="12" fontWeight="bold">C</text>
                          </g>
                        );
                      })()}

                      {/* Triangle 2 (ABD) */}
                      {(() => {
                        const D = { x: startX + tri2Shift * pxPerCm, y: topY };
                        return (
                          <g>
                            <polygon
                              points={`${A.x},${A.y} ${B.x},${B.y} ${D.x},${D.y}`}
                              fill="#F59E0B"
                              fillOpacity={0.35}
                              stroke="#F59E0B"
                              strokeWidth={2.5}
                            />
                            <circle cx={D.x} cy={D.y} r={5} fill="#F59E0B" />
                            <text x={D.x} y={D.y - 8} textAnchor="middle" fill="#FDE68A" fontSize="12" fontWeight="bold">D</text>
                          </g>
                        );
                      })()}

                      {/* Shared Base AB */}
                      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#EF4444" strokeWidth={4} />
                      <circle cx={A.x} cy={A.y} r={4} fill="#EF4444" />
                      <text x={A.x - 14} y={A.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">A</text>
                      <circle cx={B.x} cy={B.y} r={4} fill="#EF4444" />
                      <text x={B.x + 6} y={B.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">B</text>
                    </>
                  ) : (
                    /* MEDIAN VIEW: Triangle ABC with median AM bisecting base BC */
                    <>
                      {(() => {
                        const triApexA = { x: 240, y: topY };
                        const ptB = { x: 100, y: baseY };
                        const ptC = { x: 380, y: baseY };
                        const ptM = { x: (ptB.x + ptC.x) / 2, y: baseY };

                        return (
                          <g>
                            {/* Left sub-triangle ABM */}
                            <polygon
                              points={`${triApexA.x},${triApexA.y} ${ptB.x},${ptB.y} ${ptM.x},${ptM.y}`}
                              fill="#14B8A6"
                              fillOpacity={0.4}
                              stroke="#14B8A6"
                              strokeWidth={2.5}
                            />
                            {/* Right sub-triangle ACM */}
                            <polygon
                              points={`${triApexA.x},${triApexA.y} ${ptM.x},${ptM.y} ${ptC.x},${ptC.y}`}
                              fill="#F59E0B"
                              fillOpacity={0.4}
                              stroke="#F59E0B"
                              strokeWidth={2.5}
                            />

                            {/* Median AM */}
                            <line x1={triApexA.x} y1={triApexA.y} x2={ptM.x} y2={ptM.y} stroke="#EF4444" strokeWidth={3} strokeDasharray="4,2" />

                            <circle cx={triApexA.x} cy={triApexA.y} r={5} fill="#FFFFFF" />
                            <text x={triApexA.x} y={triApexA.y - 10} textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">A</text>

                            <circle cx={ptB.x} cy={ptB.y} r={5} fill="#FFFFFF" />
                            <text x={ptB.x - 12} y={ptB.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">B</text>

                            <circle cx={ptC.x} cy={ptC.y} r={5} fill="#FFFFFF" />
                            <text x={ptC.x + 8} y={ptC.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">C</text>

                            <circle cx={ptM.x} cy={ptM.y} r={5} fill="#EF4444" />
                            <text x={ptM.x} y={ptM.y + 18} textAnchor="middle" fill="#FCA5A5" fontSize="11" fontWeight="bold">M</text>

                            {/* Equal base markings */}
                            <text x={(ptB.x + ptM.x) / 2} y={baseY + 14} textAnchor="middle" fill="#5EEAD4" fontSize="10">BM = ½ BC</text>
                            <text x={(ptM.x + ptC.x) / 2} y={baseY + 14} textAnchor="middle" fill="#FDE68A" fontSize="10">MC = ½ BC</text>
                          </g>
                        );
                      })()}
                    </>
                  )}
                </svg>
              </div>

              <div className="w-full flex justify-between text-xs text-slate-300 mt-2">
                {!showMedianView ? (
                  <>
                    <span>Area of ∆ ABC: <strong className="text-teal-300">{fmt(areaTriangle)} cm²</strong></span>
                    <span>Area of ∆ ABD: <strong className="text-amber-300">{fmt(areaTriangle)} cm²</strong> (equal)</span>
                  </>
                ) : (
                  <>
                    <span>∆ ABM को क्षे.: <strong className="text-teal-300">{fmt((areaTriangle / 2).toFixed(1))} cm²</strong></span>
                    <span>∆ ACM को क्षे.: <strong className="text-amber-300">{fmt((areaTriangle / 2).toFixed(1))} cm²</strong></span>
                  </>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowMedianView(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      !showMedianView ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    {L('साध्य 3: समान आधार', 'Thm 3: Same Base')}
                  </button>
                  <button
                    onClick={() => setShowMedianView(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      showMedianView ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    {L('मध्यिका विभाजन (Median)', 'Median Division')}
                  </button>
                </div>

                {!showMedianView ? (
                  <>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{L('त्रिभुज 1 (∆ABC) को शीर्षबिन्दु C:', '∆ABC Apex C Position:')}</span>
                        <span className="text-teal-600 font-bold font-mono">+{fmt(tri1Shift)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={tri1Shift}
                        onChange={(e) => setTri1Shift(Number(e.target.value))}
                        className="w-full accent-teal-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{L('त्रिभुज 2 (∆ABD) को शीर्षबिन्दु D:', '∆ABD Apex D Position:')}</span>
                        <span className="text-amber-600 font-bold font-mono">+{fmt(tri2Shift)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="10"
                        step="0.5"
                        value={tri2Shift}
                        onChange={(e) => setTri2Shift(Number(e.target.value))}
                        className="w-full accent-amber-600"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {L(
                      'मध्यिका (Median AM) ले विपरीत भुजा BC लाई बराबर दुई भागमा (BM = MC) काट्छ। दुवै उप-त्रिभुजहरूको उचाइ साझा शीर्षबिन्दु A बाट एउटै हुने हुँदा तिनीहरूको क्षेत्रफल बराबर हुन्छ।',
                      'The median AM divides base BC into two equal halves. Since both triangles share the same perpendicular height from vertex A, their areas are strictly equal.'
                    )}
                  </p>
                )}
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-sm text-xs text-emerald-900 leading-relaxed space-y-1">
                <strong>{L('💡 साध्य 3 निष्कर्ष (Theorem 3 Statement):', 'Theorem 3 Statement:')}</strong>
                <p>
                  {L(
                    'एउटै आधार र उही समानान्तर रेखाहरू बीच बनेका त्रिभुजहरूको क्षेत्रफल सधैँ बराबर हुन्छ (∆ABC = ∆ABD = ½ × b × h)।',
                    'Triangles on the same base and between the same parallel lines are strictly equal in area.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: INTERACTIVE FORMAL PROOF EXPLORER
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'proof' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="border-b pb-3">
              <h4 className="font-bold text-sm text-[#142D4E]">
                {isNe ? proofSteps[0].titleNp : proofSteps[0].titleEn}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                {isNe ? proofSteps[0].givenNp : proofSteps[0].givenEn} |{' '}
                <strong className="text-teal-700">{isNe ? proofSteps[0].toProveNp : proofSteps[0].toProveEn}</strong>
              </p>
            </div>

            {/* Stepper Buttons */}
            <div className="flex gap-2">
              {proofSteps[0].steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    kit.tap();
                    setProofStep(idx);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    proofStep === idx
                      ? 'bg-[#167C80] text-white border-[#167C80] shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {L(`चरण ${fmt(idx + 1)}`, `Step ${fmt(idx + 1)}`)}
                </button>
              ))}
            </div>

            {/* Statement and Reason Table Card */}
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs">
                <thead className="bg-[#142D4E] text-white">
                  <tr>
                    <th className="p-3 text-left w-3/5">{L('तथ्यहरू (Statements)', 'Statements')}</th>
                    <th className="p-3 text-left w-2/5">{L('कारणहरू (Reasons)', 'Reasons')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {proofSteps[0].steps.map((st, idx) => (
                    <tr
                      key={idx}
                      className={`transition-all ${
                        proofStep === idx ? 'bg-amber-50/80 font-bold text-amber-950' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 leading-relaxed">
                        {isNe ? st.statementNp : st.statementEn}
                      </td>
                      <td className="p-3 text-slate-500 leading-relaxed font-normal">
                        {isNe ? st.reasonNp : st.reasonEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500 font-mono">
                {L(`चरण ${fmt(proofStep + 1)} / ${fmt(proofSteps[0].steps.length)}`, `Step ${fmt(proofStep + 1)} of ${fmt(proofSteps[0].steps.length)}`)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    kit.tap();
                    setProofStep(Math.max(0, proofStep - 1));
                  }}
                  disabled={proofStep === 0}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold disabled:opacity-40"
                >
                  {L('← अघिल्लो चरण', '← Previous Step')}
                </button>
                <button
                  onClick={() => {
                    kit.tap();
                    setProofStep(Math.min(proofSteps[0].steps.length - 1, proofStep + 1));
                  }}
                  disabled={proofStep === proofSteps[0].steps.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-[#142D4E] text-white text-xs font-bold disabled:opacity-40"
                >
                  {L('पछिल्लो चरण →', 'Next Step →')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 5: PRACTICE CHALLENGE
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

export default EqualAreaGeometryExplorer;
