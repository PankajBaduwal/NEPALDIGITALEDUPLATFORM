import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const GeometricConstructionStudio: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U11-01',
    chapter: 11,
    titleNp: 'अन्तरक्रियात्मक ज्यामितीय रचना स्टुडियो',
    titleEn: 'Interactive Geometric Construction Studio',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'parallelogram' | 'triangle' | 'quadToTriangle' | 'challenge'>('parallelogram');

  // ── 1. EQUAL-AREA PARALLELOGRAM CONSTRUCTION ──────────────────────────────
  const [pStep, setPStep] = useState<number>(0);
  const pTotalSteps = 6;

  // Given: AB = 4 cm, BC = 5.5 cm, ∠ABC = 60°. Required: ||gm with angle 120°
  // Scale: 1 cm = 32 px
  const scale = 32;
  const pA = { x: 90, y: 220 };
  const pB = { x: pA.x + 4.5 * scale, y: 220 }; // 4.5 cm
  // C at 60 deg from B: dx = 5.5 * cos(60) = 2.75 cm, dy = 5.5 * sin(60) = 4.76 cm
  const pC = { x: pB.x - 2.75 * scale, y: pB.y - 4.76 * scale };
  const pD = { x: pA.x - 2.75 * scale, y: pA.y - 4.76 * scale };
  // Parallel line extended: y = pC.y
  // Construct new ||gm with angle 120° at A or B:
  // From A at 120 deg (or from B):
  const pQ = { x: pB.x + 2.75 * scale, y: pC.y };
  const pP = { x: pA.x + 2.75 * scale, y: pC.y };

  // ── 2. EQUAL-AREA TRIANGLE CONSTRUCTION ───────────────────────────────────
  const [tStep, setTStep] = useState<number>(0);
  const tTotalSteps = 5;

  // Given: Triangle ABC with BC = 5 cm, AB = 5.5 cm, ∠ABC = 60°
  // Required: Triangle DBC on same base BC with side CD = 6.5 cm
  const tB = { x: 100, y: 220 };
  const tC = { x: tB.x + 5.5 * scale, y: 220 };
  const tA = { x: tB.x + 2.75 * scale, y: tB.y - 4.76 * scale };
  // Parallel line through A parallel to BC (y = tA.y)
  const tD = { x: tC.x - 1.2 * scale, y: tA.y };

  // ── 3. QUADRILATERAL TO EQUAL-AREA TRIANGLE CONSTRUCTION ──────────────────
  const [qStep, setQStep] = useState<number>(0);
  const qTotalSteps = 6;

  // Quadrilateral ABCD: A at (100, 220), B at (250, 220), C at (290, 100), D at (140, 70)
  const qA = { x: 100, y: 220 };
  const qB = { x: 240, y: 220 };
  const qC = { x: 290, y: 90 };
  const qD = { x: 140, y: 70 };
  // Diagonal BD connects qB and qD.
  // Slope of BD: (qD.y - qB.y) / (qD.x - qB.x) = (70 - 220) / (140 - 240) = -150 / -100 = 1.5
  // Parallel line through C: y - 90 = 1.5 * (x - 290)
  // Intersection with line AB (extended horizontal line y = 220):
  // 220 - 90 = 1.5 * (x - 290) => 130 / 1.5 = x - 290 => x = 290 + 86.6 = 376.6
  const qE = { x: 376.6, y: 220 };

  // ── 4. PRACTICE CHALLENGE ──────────────────────────────────────────────────
  const [score, setScore] = useState<number>(0);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizQuestions = [
    {
      qEn: 'In constructing a triangle equal in area to a quadrilateral ABCD, why is line CE drawn parallel to diagonal BD?',
      qNp: 'चतुर्भुज ABCD सँग बराबर क्षेत्रफल हुने त्रिभुज रचना गर्दा रेखा CE लाई कर्ण BD सँग किन समानान्तर कोरिएको हो?',
      options: [
        'So that ∆BCD and ∆BDE have equal areas on the same base BD',
        'To make the triangle equilateral',
        'To halve the perimeter',
        'Because diagonals are always perpendicular',
      ],
      optionsNp: [
        'जसले गर्दा एउटै आधार BD मा बनेका ∆BCD र ∆BDE को क्षेत्रफल बराबर हुन्छ',
        'त्रिभुजलाई समबाहु बनाउन',
        'परिधितर्फ आधा घटाउन',
        'किनभने कर्ण सधैँ लम्ब हुन्छ',
      ],
      correct: 0,
      hintEn: 'Since CE || BD, triangles ∆BCD and ∆BDE stand on common base BD between the same parallels, so Area(∆BCD) = Area(∆BDE).',
      hintNp: 'CE || BD भएकाले एउटै आधार BD र उही समानान्तर रेखा बीचका त्रिभुजहरू ∆BCD र ∆BDE को क्षेत्रफल बराबर हुन्छ।',
    },
    {
      qEn: 'What compass angle is constructed by drawing an arc of radius r and cutting it with the same radius r from the initial point?',
      qNp: 'कम्पासको निश्चित अर्धव्यास r ले चाप खिचेर सोही अर्धव्यासले पहिलो पटक काट्दा कति degreesको कोण बन्छ?',
      options: ['60°', '90°', '45°', '120°'],
      optionsNp: ['60°', '90°', '45°', '120°'],
      correct: 0,
      hintEn: 'Cutting a circular arc with its own radius forms an equilateral triangle sector, which measures exactly 60°.',
      hintNp: 'चापलाई आफ्नै अर्धव्यासले एकपटक काट्दा बन्ने कोण ठिक 60° हुन्छ (दुईपटक काट्दा 120°)।',
    },
    {
      qEn: 'When constructing a parallelogram of equal area to a given parallelogram on the same base, which line must contain the top vertices?',
      qNp: 'एउटै आधारमा दिइएको स.च. सँग बराबर क्षेत्रफल हुने नयाँ स.च. रचना गर्दा माथिल्लो शीर्षबिन्दुहरू कुन रेखामा पर्नुपर्छ?',
      options: [
        'A line parallel to the base passing through the opposite side',
        'Any vertical line',
        'A line perpendicular to the diagonal',
        'A line twice the height',
      ],
      optionsNp: [
        'आधारसँग समानान्तर हुने र विपरीत भुजाबाट जाने समानान्तर रेखामा',
        'जुनसुकै ठाडो रेखामा',
        'कर्णसँग लम्ब हुने रेखामा',
        'दोब्बर उचाइ भएको रेखामा',
      ],
      correct: 0,
      hintEn: 'To keep perpendicular height h constant and preserve area (b × h), top vertices must lie on the line parallel to the base.',
      hintNp: 'लम्ब उचाइ h स्थिर राखी क्षेत्रफल (b × h) बराबर बनाउन माथिल्लो शीर्षबिन्दुहरू आधारसँग समानान्तर रेखामा नै पर्नुपर्छ।',
    },
    {
      qEn: 'If a constructed triangle ADE has the same area as quadrilateral ABCD, what is true about their areas?',
      qNp: 'यदि रचना गरिएको त्रिभुज ADE को क्षेत्रफल चतुर्भुज ABCD सँग बराबर छ भने कुन सम्बन्ध सत्य हो?',
      options: [
        'Area(ADE) = Area(ABCD)',
        'Area(ADE) = 2 × Area(ABCD)',
        'Area(ADE) = 1/2 × Area(ABCD)',
        'Perimeter(ADE) = Perimeter(ABCD)',
      ],
      optionsNp: [
        'क्षे(ADE) = क्षे(ABCD)',
        'क्षे(ADE) = 2 × क्षे(ABCD)',
        'क्षे(ADE) = 1/2 × क्षे(ABCD)',
        'परिमिति(ADE) = परिमिति(ABCD)',
      ],
      correct: 0,
      hintEn: 'The purpose of the construction is Area conservation: Area(∆ADE) = Area(ABCD).',
      hintNp: 'रचनाको मूल उद्देश्य नै क्षेत्रफल संरक्षण हो: क्षे(∆ADE) = क्षे(ABCD)।',
    },
  ];

  const handleSelectAnswer = (idx: number) => {
    setSelectedAns(idx);
    const q = quizQuestions[quizIdx];
    if (idx === q.correct) {
      kit.good();
      setScore((prev) => prev + 10);
      setQuizFeedback(isNe ? 'सटीक उत्तर! धेरै राम्रो।' : 'Correct! Excellent construction theory.');
    } else {
      kit.oops();
      setQuizFeedback(isNe ? 'गलत उत्तर। संकेत हेरी पुन: प्रयास गर्नुहोस्।' : 'Incorrect. Check the geometric construction principles.');
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
        'नमस्ते! कक्षा 10 गणितको एकाइ 11: रचना (Construction) स्टुडियोमा स्वागत छ! यहाँ कम्पास र स्केलका चरणहरू प्रत्यक्ष हेर्नुहोस्, बराबर क्षेत्रफल हुने समानान्तर चतुर्भुज, त्रिभुज र चतुर्भुजबाट त्रिभुज बनाउने रचनाहरू सिक्नुहोस्!',
        'Welcome to Grade 10 Unit 11: Interactive Geometric Construction Studio! Follow authentic step-by-step compass and ruler constructions to create equal-area parallelograms, triangles, and transform quadrilaterals into triangles!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'parallelogram', labelNp: 'क) बराबर क्षेत्रफल हुने स.च. को रचना', labelEn: 'A) Equal-Area Parallelogram' },
            { id: 'triangle', labelNp: 'ख) बराबर क्षेत्रफल हुने त्रिभुजको रचना', labelEn: 'B) Equal-Area Triangle' },
            { id: 'quadToTriangle', labelNp: 'ग) चतुर्भुज बराबर क्षेत्रफलको त्रिभुज', labelEn: 'C) Quad to Equal-Area Triangle' },
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
            TAB 1: EQUAL-AREA PARALLELOGRAM
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'parallelogram' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Visual Drawing Board */}
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{L('रचना 1: दिइएको स.च. सँग बराबर क्षेत्रफल हुने स.च.', 'Construction 1: Equal-Area Parallelogram')}</span>
                <span className="text-amber-300 font-mono">
                  {L(`चरण ${fmt(pStep + 1)} / ${fmt(pTotalSteps)}`, `Step ${fmt(pStep + 1)} of ${fmt(pTotalSteps)}`)}
                </span>
              </div>

              <div className="w-full overflow-hidden flex justify-center bg-slate-900/60 rounded-xl border border-slate-700 py-3">
                <svg width={480} height={260} viewBox="0 0 480 260" className="max-w-full">
                  {/* Step 1: Base AB */}
                  {pStep >= 0 && (
                    <g>
                      <line x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y} stroke="#EF4444" strokeWidth={3.5} />
                      <circle cx={pA.x} cy={pA.y} r={4} fill="#EF4444" />
                      <text x={pA.x - 14} y={pA.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">A</text>
                      <circle cx={pB.x} cy={pB.y} r={4} fill="#EF4444" />
                      <text x={pB.x + 8} y={pB.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">B</text>
                      <text x={(pA.x + pB.x) / 2} y={pA.y + 16} textAnchor="middle" fill="#FCA5A5" fontSize="10">4.5 cm</text>
                    </g>
                  )}

                  {/* Step 2: Compass Arc at B for 60° */}
                  {pStep >= 1 && (
                    <g>
                      <path
                        d={`M ${pB.x - 40} ${pB.y} A 40 40 0 0 1 ${pB.x - 20} ${pB.y - 34.6}`}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth={1.5}
                        strokeDasharray="3,2"
                      />
                      <circle cx={pB.x - 20} cy={pB.y - 34.6} r={3} fill="#F59E0B" />
                      <text x={pB.x - 42} y={pB.y - 12} fill="#FDE68A" fontSize="9">60°</text>
                    </g>
                  )}

                  {/* Step 3: Original ||gm ABCD completed */}
                  {pStep >= 2 && (
                    <g>
                      <polygon
                        points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                        fill="#14B8A6"
                        fillOpacity={0.3}
                        stroke="#14B8A6"
                        strokeWidth={2}
                      />
                      <circle cx={pC.x} cy={pC.y} r={4} fill="#14B8A6" />
                      <text x={pC.x + 8} y={pC.y - 6} fill="#5EEAD4" fontSize="11" fontWeight="bold">C</text>
                      <circle cx={pD.x} cy={pD.y} r={4} fill="#14B8A6" />
                      <text x={pD.x - 12} y={pD.y - 6} fill="#5EEAD4" fontSize="11" fontWeight="bold">D</text>
                    </g>
                  )}

                  {/* Step 4: Parallel Line CD Extended */}
                  {pStep >= 3 && (
                    <g>
                      <line x1={30} y1={pC.y} x2={450} y2={pC.y} stroke="#38BDF8" strokeWidth={1.5} strokeDasharray="4,3" />
                      <text x={440} y={pC.y - 6} fill="#38BDF8" fontSize="10">DC Extended (|| AB)</text>
                    </g>
                  )}

                  {/* Step 5: Compass Arc for new angle 120° */}
                  {pStep >= 4 && (
                    <g>
                      <path
                        d={`M ${pA.x + 35} ${pA.y} A 35 35 0 0 0 ${pA.x - 17.5} ${pA.y - 30.3}`}
                        fill="none"
                        stroke="#EC4899"
                        strokeWidth={1.5}
                        strokeDasharray="2,2"
                      />
                      <text x={pA.x + 10} y={pA.y - 14} fill="#F472B6" fontSize="9">120°</text>
                    </g>
                  )}

                  {/* Step 6: Final Equal-Area Parallelogram ABQP */}
                  {pStep >= 5 && (
                    <g>
                      <polygon
                        points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pQ.x},${pQ.y} ${pP.x},${pP.y}`}
                        fill="#F59E0B"
                        fillOpacity={0.35}
                        stroke="#F59E0B"
                        strokeWidth={2.5}
                      />
                      <circle cx={pP.x} cy={pP.y} r={4} fill="#F59E0B" />
                      <text x={pP.x - 8} y={pP.y - 8} fill="#FDE68A" fontSize="11" fontWeight="bold">P</text>
                      <circle cx={pQ.x} cy={pQ.y} r={4} fill="#F59E0B" />
                      <text x={pQ.x + 8} y={pQ.y - 8} fill="#FDE68A" fontSize="11" fontWeight="bold">Q</text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Stepper Navigation */}
              <div className="w-full flex justify-between items-center mt-3 pt-2 border-t border-slate-700">
                <button
                  onClick={() => {
                    kit.tap();
                    setPStep(Math.max(0, pStep - 1));
                  }}
                  disabled={pStep === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 text-xs font-bold disabled:opacity-40"
                >
                  {L('← अघिल्लो चरण', '← Prev')}
                </button>
                <span className="text-xs font-mono text-amber-300">
                  {pStep === pTotalSteps - 1 ? L('रचना सम्पन्न! (Completed)', 'Construction Complete!') : L('रचना जारी छ...', 'In progress...')}
                </span>
                <button
                  onClick={() => {
                    kit.tap();
                    setPStep(Math.min(pTotalSteps - 1, pStep + 1));
                  }}
                  disabled={pStep === pTotalSteps - 1}
                  className="px-3 py-1.5 rounded-lg bg-[#167C80] text-white text-xs font-bold disabled:opacity-40"
                >
                  {L('पछिल्लो चरण →', 'Next →')}
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions Card */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                  {L('पाठ्यपुस्तक रचना निर्देशन (Construction Steps)', 'Step-by-Step Instructions')}
                </span>

                <div className="space-y-2 text-xs">
                  {[
                    L('1. आधार रेखाखण्ड AB = 4.5 से.मी. खिच्नुहोस्।', '1. Draw base line segment AB = 4.5 cm.'),
                    L('2. बिन्दु B मा कम्पासको सहायताले ∠ABC = 60° को कोण बनाउनुहोस्।', '2. Construct ∠ABC = 60° at B using compass.'),
                    L('3. BC = 5.5 से.मी. र AD = 5.5 से.मी. चाप खिची स.च. ABCD पूरा गर्नुहोस्।', '3. Cut arcs of 5.5 cm to complete original ||gm ABCD.'),
                    L('4. शीर्ष भुजा DC लाई दायाँ-बायाँ दुवैतर्फ समानान्तर रूपमा लम्ब्याउनुहोस्।', '4. Extend top side DC parallel to base AB.'),
                    L('5. तोकिएको नयाँ कोण 120° (वा नयाँ भुजा 6 से.मी.) को चाप खिच्नुहोस्।', '5. Construct specified new angle 120° (or side 6 cm).'),
                    L('6. बिन्दुहरू P र Q जोडी नयाँ स.च. ABQP पूरा गर्नुहोस्।', '6. Join vertices to complete equal-area ||gm ABQP.'),
                  ].map((inst, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border transition-all ${
                        pStep === i
                          ? 'bg-amber-50 border-amber-300 font-bold text-amber-900 shadow-sm'
                          : pStep > i
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : 'opacity-40 border-dashed text-slate-400'
                      }`}
                    >
                      {inst}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900">
                <strong>{L('💡 क्षेत्रफल प्रमाणीकरण:', 'Area Verification:')}</strong>{' '}
                {L(
                  'स.च. ABCD र स.च. ABQP दुवै एउटै आधार AB मा र उही समानान्तर रेखा बीच रहेकाले तिनीहरूको क्षेत्रफल बराबर हुन्छ (Area ABCD = Area ABQP)।',
                  'Both parallelograms share base AB between the same parallel lines, ensuring their areas are strictly equal.'
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: EQUAL-AREA TRIANGLE
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'triangle' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{L('रचना 2: दिइएको त्रिभुजसँग बराबर क्षेत्रफल हुने त्रिभुज', 'Construction 2: Equal-Area Triangle')}</span>
                <span className="text-amber-300 font-mono">
                  {L(`चरण ${fmt(tStep + 1)} / ${fmt(tTotalSteps)}`, `Step ${fmt(tStep + 1)} of ${fmt(tTotalSteps)}`)}
                </span>
              </div>

              <div className="w-full overflow-hidden flex justify-center bg-slate-900/60 rounded-xl border border-slate-700 py-3">
                <svg width={480} height={260} viewBox="0 0 480 260" className="max-w-full">
                  {/* Step 1: Base BC */}
                  {tStep >= 0 && (
                    <g>
                      <line x1={tB.x} y1={tB.y} x2={tC.x} y2={tC.y} stroke="#EF4444" strokeWidth={3.5} />
                      <circle cx={tB.x} cy={tB.y} r={4} fill="#EF4444" />
                      <text x={tB.x - 14} y={tB.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">B</text>
                      <circle cx={tC.x} cy={tC.y} r={4} fill="#EF4444" />
                      <text x={tC.x + 8} y={tC.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">C</text>
                    </g>
                  )}

                  {/* Step 2: Triangle ABC completed */}
                  {tStep >= 1 && (
                    <g>
                      <polygon
                        points={`${tB.x},${tB.y} ${tC.x},${tC.y} ${tA.x},${tA.y}`}
                        fill="#14B8A6"
                        fillOpacity={0.35}
                        stroke="#14B8A6"
                        strokeWidth={2}
                      />
                      <circle cx={tA.x} cy={tA.y} r={4} fill="#14B8A6" />
                      <text x={tA.x} y={tA.y - 8} textAnchor="middle" fill="#5EEAD4" fontSize="11" fontWeight="bold">A</text>
                    </g>
                  )}

                  {/* Step 3: Parallel line through A parallel to BC */}
                  {tStep >= 2 && (
                    <g>
                      <line x1={40} y1={tA.y} x2={440} y2={tA.y} stroke="#38BDF8" strokeWidth={1.5} strokeDasharray="4,3" />
                      <text x={430} y={tA.y - 6} fill="#38BDF8" fontSize="10">Line || BC</text>
                    </g>
                  )}

                  {/* Step 4: Compass arc cutting parallel line at D */}
                  {tStep >= 3 && (
                    <g>
                      <path
                        d={`M ${tD.x + 15} ${tD.y - 15} A 20 20 0 0 1 ${tD.x - 15} ${tD.y + 15}`}
                        fill="none"
                        stroke="#EC4899"
                        strokeWidth={2}
                      />
                      <circle cx={tD.x} cy={tD.y} r={5} fill="#F59E0B" />
                      <text x={tD.x + 8} y={tD.y - 8} fill="#FDE68A" fontSize="12" fontWeight="bold">D</text>
                    </g>
                  )}

                  {/* Step 5: Final Triangle DBC completed */}
                  {tStep >= 4 && (
                    <g>
                      <polygon
                        points={`${tB.x},${tB.y} ${tC.x},${tC.y} ${tD.x},${tD.y}`}
                        fill="#F59E0B"
                        fillOpacity={0.4}
                        stroke="#F59E0B"
                        strokeWidth={2.5}
                      />
                    </g>
                  )}
                </svg>
              </div>

              {/* Stepper Navigation */}
              <div className="w-full flex justify-between items-center mt-3 pt-2 border-t border-slate-700">
                <button
                  onClick={() => {
                    kit.tap();
                    setTStep(Math.max(0, tStep - 1));
                  }}
                  disabled={tStep === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 text-xs font-bold disabled:opacity-40"
                >
                  {L('← अघिल्लो चरण', '← Prev')}
                </button>
                <span className="text-xs font-mono text-amber-300">
                  {tStep === tTotalSteps - 1 ? L('रचना सम्पन्न!', 'Complete!') : L('रचना जारी छ...', 'In progress...')}
                </span>
                <button
                  onClick={() => {
                    kit.tap();
                    setTStep(Math.min(tTotalSteps - 1, tStep + 1));
                  }}
                  disabled={tStep === tTotalSteps - 1}
                  className="px-3 py-1.5 rounded-lg bg-[#167C80] text-white text-xs font-bold disabled:opacity-40"
                >
                  {L('पछिल्लो चरण →', 'Next →')}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                  {L('त्रिभुज रचनाका चरणहरू (Triangle Steps)', 'Triangle Steps')}
                </span>

                <div className="space-y-2 text-xs">
                  {[
                    L('1. आधार रेखाखण्ड BC खिच्नुहोस्।', '1. Draw base line BC.'),
                    L('2. दिइएको कोण र भुजाका आधारमा मूल त्रिभुज ABC पूरा गर्नुहोस्।', '2. Complete original ∆ABC.'),
                    L('3. शीर्षबिन्दु A बाट आधार BC सँग समानान्तर हुने रेखा कोर्नुहोस्।', '3. Construct parallel line through A parallel to BC.'),
                    L('4. तोकिएको भुजाको नाप लिएर कम्पासले समानान्तर रेखामा काट्नुहोस् (बिन्दु D)।', '4. Cut arc of specified side length at D.'),
                    L('5. D लाई B र C सँग जोडी नयाँ समान क्षेत्रफलको त्रिभुज DBC बनाउनुहोस्।', '5. Join D to B and C to form equal-area ∆DBC.'),
                  ].map((inst, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border transition-all ${
                        tStep === i
                          ? 'bg-amber-50 border-amber-300 font-bold text-amber-900 shadow-sm'
                          : tStep > i
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : 'opacity-40 border-dashed text-slate-400'
                      }`}
                    >
                      {inst}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: QUADRILATERAL TO EQUAL-AREA TRIANGLE
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'quadToTriangle' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{L('रचना 3: चतुर्भुज बराबर क्षेत्रफल हुने त्रिभुज', 'Construction 3: Quadrilateral to Triangle')}</span>
                <span className="text-amber-300 font-mono">
                  {L(`चरण ${fmt(qStep + 1)} / ${fmt(qTotalSteps)}`, `Step ${fmt(qStep + 1)} of ${fmt(qTotalSteps)}`)}
                </span>
              </div>

              <div className="w-full overflow-hidden flex justify-center bg-slate-900/60 rounded-xl border border-slate-700 py-3">
                <svg width={480} height={260} viewBox="0 0 480 260" className="max-w-full">
                  {/* Step 1: Quadrilateral ABCD */}
                  {qStep >= 0 && (
                    <g>
                      <polygon
                        points={`${qA.x},${qA.y} ${qB.x},${qB.y} ${qC.x},${qC.y} ${qD.x},${qD.y}`}
                        fill="#14B8A6"
                        fillOpacity={0.25}
                        stroke="#14B8A6"
                        strokeWidth={2}
                      />
                      <circle cx={qA.x} cy={qA.y} r={4} fill="#EF4444" />
                      <text x={qA.x - 14} y={qA.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">A</text>
                      <circle cx={qB.x} cy={qB.y} r={4} fill="#EF4444" />
                      <text x={qB.x - 4} y={qB.y + 16} fill="#FFFFFF" fontSize="12" fontWeight="bold">B</text>
                      <circle cx={qC.x} cy={qC.y} r={4} fill="#14B8A6" />
                      <text x={qC.x + 8} y={qC.y - 4} fill="#5EEAD4" fontSize="11" fontWeight="bold">C</text>
                      <circle cx={qD.x} cy={qD.y} r={4} fill="#14B8A6" />
                      <text x={qD.x - 12} y={qD.y - 6} fill="#5EEAD4" fontSize="11" fontWeight="bold">D</text>
                    </g>
                  )}

                  {/* Step 2: Diagonal BD */}
                  {qStep >= 1 && (
                    <g>
                      <line x1={qB.x} y1={qB.y} x2={qD.x} y2={qD.y} stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="4,3" />
                      <text x={(qB.x + qD.x) / 2 - 10} y={(qB.y + qD.y) / 2} fill="#FDE68A" fontSize="10">कर्ण BD</text>
                    </g>
                  )}

                  {/* Step 3: Base AB Extended to E */}
                  {qStep >= 2 && (
                    <g>
                      <line x1={qA.x} y1={qA.y} x2={440} y2={qA.y} stroke="#FFFFFF" strokeWidth={1.5} strokeDasharray="3,3" />
                      <text x={420} y={qA.y + 16} fill="#94A3B8" fontSize="10">AB Extended</text>
                    </g>
                  )}

                  {/* Step 4: Line through C parallel to BD meeting extended AB at E */}
                  {qStep >= 3 && (
                    <g>
                      <line x1={qC.x} y1={qC.y} x2={qE.x} y2={qE.y} stroke="#38BDF8" strokeWidth={2} strokeDasharray="4,3" />
                      <circle cx={qE.x} cy={qE.y} r={5} fill="#EF4444" />
                      <text x={qE.x + 8} y={qE.y + 16} fill="#FCA5A5" fontSize="12" fontWeight="bold">E</text>
                    </g>
                  )}

                  {/* Step 5: Join D to E */}
                  {qStep >= 4 && (
                    <g>
                      <line x1={qD.x} y1={qD.y} x2={qE.x} y2={qE.y} stroke="#EC4899" strokeWidth={2.5} />
                    </g>
                  )}

                  {/* Step 6: Final Shaded Triangle ADE */}
                  {qStep >= 5 && (
                    <g>
                      <polygon
                        points={`${qA.x},${qA.y} ${qE.x},${qE.y} ${qD.x},${qD.y}`}
                        fill="#F59E0B"
                        fillOpacity={0.4}
                        stroke="#F59E0B"
                        strokeWidth={3}
                      />
                      <text x={(qA.x + qE.x + qD.x) / 3} y={(qA.y + qE.y + qD.y) / 3 + 10} textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                        ∆ ADE
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Stepper Navigation */}
              <div className="w-full flex justify-between items-center mt-3 pt-2 border-t border-slate-700">
                <button
                  onClick={() => {
                    kit.tap();
                    setQStep(Math.max(0, qStep - 1));
                  }}
                  disabled={qStep === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 text-xs font-bold disabled:opacity-40"
                >
                  {L('← अघिल्लो चरण', '← Prev')}
                </button>
                <span className="text-xs font-mono text-amber-300">
                  {qStep === qTotalSteps - 1 ? L('रचना सम्पन्न!', 'Complete!') : L('रचना जारी छ...', 'In progress...')}
                </span>
                <button
                  onClick={() => {
                    kit.tap();
                    setQStep(Math.min(qTotalSteps - 1, qStep + 1));
                  }}
                  disabled={qStep === qTotalSteps - 1}
                  className="px-3 py-1.5 rounded-lg bg-[#167C80] text-white text-xs font-bold disabled:opacity-40"
                >
                  {L('पछिल्लो चरण →', 'Next →')}
                </button>
              </div>
            </div>

            {/* Theoretical Explanation */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                  {L('रचनाका चरणहरू (Construction Steps)', 'Construction Steps')}
                </span>

                <div className="space-y-2 text-xs">
                  {[
                    L('1. दिइएको नाप अनुसार चतुर्भुज ABCD कोर्नुहोस्।', '1. Draw given quadrilateral ABCD.'),
                    L('2. कर्ण BD जोड्नुहोस्।', '2. Join diagonal BD.'),
                    L('3. आधार AB लाई दायाँतर्फ लम्ब्याउनुहोस्।', '3. Extend side AB to the right.'),
                    L('4. शीर्षबिन्दु C बाट कर्ण BD सँग समानान्तर हुने रेखा खिच्नुहोस्, जसले लम्ब्याइएको रेखालाई E मा काट्छ।', '4. Draw line through C parallel to BD meeting extended AB at E.'),
                    L('5. शीर्षबिन्दु D र E जोड्नुहोस्।', '5. Join vertices D and E.'),
                    L('6. यसरी बनेको ∆ADE को क्षेत्रफल चतुर्भुज ABCD सँग बराबर हुन्छ।', '6. Resulting ∆ADE has identical area to ABCD.'),
                  ].map((inst, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border transition-all ${
                        qStep === i
                          ? 'bg-amber-50 border-amber-300 font-bold text-amber-900 shadow-sm'
                          : qStep > i
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : 'opacity-40 border-dashed text-slate-400'
                      }`}
                    >
                      {inst}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 leading-relaxed">
                <strong>{L('💡 साध्य प्रमाण (Why areas are equal):', 'Why areas are equal:')}</strong>
                <p className="mt-1">
                  {L(
                    '∆BCD र ∆BDE एउटै आधार BD र समानान्तर रेखाहरू BD || CE बीच छन्, त्यसैले क्षे(∆BCD) = क्षे(∆BDE)। दुवैतर्फ साझा ∆ABD जोड्दा: चतुर्भुज ABCD = ∆ADE।',
                    'Triangles BCD and BDE share base BD between parallels BD || CE, so Area(BCD) = Area(BDE). Adding common ∆ABD yields Area(ABCD) = Area(ADE).'
                  )}
                </p>
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

export default GeometricConstructionStudio;
