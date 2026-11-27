import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const CircleTheoremExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U12-01',
    chapter: 12,
    titleNp: 'वृत्तका साध्यहरू अन्तरक्रियात्मक अन्वेषक',
    titleEn: 'Circle Theorem Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'centralInscribed' | 'semicircle' | 'sameSegment' | 'cyclicQuad' | 'chords' | 'challenge'>('centralInscribed');

  // Circle Dimensions
  const cx = 240;
  const cy = 135;
  const radius = 95;

  // ── 1. CENTRAL & INSCRIBED ANGLE STATE ────────────────────────────────────
  const [centralAngleDeg, setCentralAngleDeg] = useState<number>(100); // angle AOB
  const [inscribedApexAngleDeg, setInscribedApexAngleDeg] = useState<number>(90); // position of C on circle

  // A and B on bottom arc
  const radA = ((180 - centralAngleDeg / 2) * Math.PI) / 180;
  const radB = ((180 + centralAngleDeg / 2) * Math.PI) / 180;
  const ptA = { x: cx + radius * Math.cos(radA), y: cy - radius * Math.sin(radA) };
  const ptB = { x: cx + radius * Math.cos(radB), y: cy - radius * Math.sin(radB) };

  // Apex C on top circumference
  const radC = (inscribedApexAngleDeg * Math.PI) / 180;
  const ptC = { x: cx + radius * Math.cos(radC), y: cy - radius * Math.sin(radC) };

  const inscribedAngleDeg = centralAngleDeg / 2;

  // ── 2. ANGLE IN SEMICIRCLE STATE ──────────────────────────────────────────
  const [semiApexAngleDeg, setSemiApexAngleDeg] = useState<number>(65); // C position on upper semicircle
  const radSemiC = (semiApexAngleDeg * Math.PI) / 180;
  const ptSemiA = { x: cx - radius, y: cy }; // diameter endpoint A (-R, 0)
  const ptSemiB = { x: cx + radius, y: cy }; // diameter endpoint B (+R, 0)
  const ptSemiC = { x: cx + radius * Math.cos(radSemiC), y: cy - radius * Math.sin(radSemiC) };

  // ── 3. ANGLES IN SAME SEGMENT STATE ───────────────────────────────────────
  const [segApex1Deg, setSegApex1Deg] = useState<number>(75); // C position
  const [segApex2Deg, setSegApex2Deg] = useState<number>(125); // D position
  const radSegC = (segApex1Deg * Math.PI) / 180;
  const radSegD = (segApex2Deg * Math.PI) / 180;
  const ptSegA = { x: cx - 75, y: cy + 58 };
  const ptSegB = { x: cx + 75, y: cy + 58 };
  const ptSegC = { x: cx + radius * Math.cos(radSegC), y: cy - radius * Math.sin(radSegC) };
  const ptSegD = { x: cx + radius * Math.cos(radSegD), y: cy - radius * Math.sin(radSegD) };

  // Inscribed angle for fixed chord ptSegA - ptSegB:
  // Chord angle at centre = 2 * asin(75 / 95) = ~104.2 deg => inscribed angle = ~52.1 deg
  const sameSegmentAngleDeg = 52.1;

  // ── 4. CYCLIC QUADRILATERAL STATE ─────────────────────────────────────────
  const [qAngleA, setQAngleA] = useState<number>(40);
  const [qAngleB, setQAngleB] = useState<number>(130);
  const [qAngleC, setQAngleC] = useState<number>(220);
  const [qAngleD, setQAngleD] = useState<number>(310);

  const getPtOnCirc = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
  };

  const ptQuadA = getPtOnCirc(qAngleA);
  const ptQuadB = getPtOnCirc(qAngleB);
  const ptQuadC = getPtOnCirc(qAngleC);
  const ptQuadD = getPtOnCirc(qAngleD);

  // Inscribed angle subtended by opposite arc = 1/2 of opposite arc
  const arcBCD = ((qAngleA - qAngleC + 360) % 360);
  const angleBad = Math.round(arcBCD / 2);
  const angleBcd = 180 - angleBad;

  const arcCDA = ((qAngleB - qAngleD + 360) % 360);
  const angleAbc = Math.round(arcCDA / 2);
  const angleAdc = 180 - angleAbc;

  // ── 5. PRACTICE CHALLENGE ──────────────────────────────────────────────────
  const [score, setScore] = useState<number>(0);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizQuestions = [
    {
      qEn: 'If the central angle ∠AOB standing on arc AB is 110°, what is the measure of the inscribed angle ∠ACB on the same arc?',
      qNp: 'यदि चाप AB मा बनेको केन्द्रीय कोण ∠AOB = ११०° भए सोही चापमा बनेको परिधि कोण ∠ACB को मान कति हुन्छ?',
      options: ['55°', '110°', '220°', '70°'],
      optionsNp: ['५५°', '११०°', '२२०°', '७०°'],
      correct: 0, // 110 / 2 = 55
      hintEn: 'Theorem: Central angle is twice the inscribed angle standing on the same arc: ∠ACB = 1/2 × ∠AOB = 1/2 × 110° = 55°.',
      hintNp: 'साध्य अनुसार: एउटै चापमा आधारित परिधि कोण केन्द्रीय कोणको आधा हुन्छ: ∠ACB = १/२ × ११०° = ५५°।',
    },
    {
      qEn: 'In a circle with diameter AB, C is any point on the circumference. What is the value of ∠ACB?',
      qNp: 'व्यास AB भएको वृत्तमा C परिधिको कुनै बिन्दु हो। कोण ∠ACB को मान कति हुन्छ?',
      options: ['90° (Right angle)', '60°', '180°', '45°'],
      optionsNp: ['९०° (एक समकोण)', '६०°', '१८०°', '४५°'],
      correct: 0,
      hintEn: 'Theorem: Angle in a semicircle is a right angle (90°).',
      hintNp: 'साध्य: अर्धवृत्तमा बनेको परिधिको कोण सधैँ एक समकोण (९०°) हुन्छ।',
    },
    {
      qEn: 'In a cyclic quadrilateral ABCD, if ∠ABC = 75°, what is the measure of the opposite angle ∠ADC?',
      qNp: 'चक्रीय चतुर्भुज ABCD मा यदि ∠ABC = ७५° भए यसको सम्मुख कोण ∠ADC को मान कति हुन्छ?',
      options: ['105°', '75°', '180°', '115°'],
      optionsNp: ['१०५°', '७५°', '१८०°', '११५°'],
      correct: 0, // 180 - 75 = 105
      hintEn: 'Theorem: Opposite angles of a cyclic quadrilateral are supplementary (sum = 180°): ∠ADC = 180° - 75° = 105°.',
      hintNp: 'साध्य: चक्रीय चतुर्भुजका सम्मुख कोणहरूको योगफल १८०° (परिपूरक) हुन्छ: ∠ADC = १८०° - ७५° = १०५°।',
    },
    {
      qEn: 'If two inscribed angles ∠ACB and ∠ADB stand on the same chord AB in the same segment, what is their relationship?',
      qNp: 'यदि एउटै वृत्तखण्डमा चाप AB मा बनेका दुई परिधि कोणहरू ∠ACB र ∠ADB छन् भने तिनीहरूको सम्बन्ध के हुन्छ?',
      options: [
        '∠ACB = ∠ADB (Equal)',
        '∠ACB + ∠ADB = 180°',
        '∠ACB = 2 × ∠ADB',
        '∠ACB + ∠ADB = 90°',
      ],
      optionsNp: [
        '∠ACB = ∠ADB (बराबर)',
        '∠ACB + ∠ADB = १८०°',
        '∠ACB = २ × ∠ADB',
        '∠ACB + ∠ADB = ९०°',
      ],
      correct: 0,
      hintEn: 'Theorem: Inscribed angles standing on the same arc/segment are equal.',
      hintNp: 'साध्य: एउटै वृत्तखण्डमा आधारित परिधि कोणहरू आपसमा बराबर हुन्छन्।',
    },
  ];

  const handleSelectAnswer = (idx: number) => {
    setSelectedAns(idx);
    const q = quizQuestions[quizIdx];
    if (idx === q.correct) {
      kit.good();
      setScore((prev) => prev + 10);
      setQuizFeedback(isNe ? 'सटीक उत्तर! धेरै राम्रो।' : 'Correct! Excellent circle theorem application.');
    } else {
      kit.oops();
      setQuizFeedback(isNe ? 'गलत उत्तर। साध्य र संकेत हेरी पुन: प्रयास गर्नुहोस्।' : 'Incorrect. Check the circle theorem.');
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
        'नमस्ते! कक्षा १० गणितको एकाइ १२: वृत्त (Circle) साध्य प्रयोगशालामा स्वागत छ! यहाँ केन्द्रीय कोण, परिधि कोण, अर्धवृत्तको समकोण, र चक्रीय चतुर्भुजका साध्यहरू परिधिका बिन्दुहरू सारेर प्रत्यक्ष जाँच्नुहोस्!',
        'Welcome to Grade 10 Unit 12: Circle Theorem Explorer! Drag points along the circumference, investigate central vs. inscribed angles, verify right angles in semicircles, and master cyclic quadrilateral theorems!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'centralInscribed', labelNp: 'क) केन्द्रीय कोण र परिधि कोण (२:१)', labelEn: 'A) Central & Inscribed Angle' },
            { id: 'semicircle', labelNp: 'ख) अर्धवृत्तको कोण (९०°)', labelEn: 'B) Angle in Semicircle (90°)' },
            { id: 'sameSegment', labelNp: 'ग) एउटै वृत्तखण्डका कोणहरू (बराबर)', labelEn: 'C) Angles in Same Segment' },
            { id: 'cyclicQuad', labelNp: 'घ) चक्रीय चतुर्भुज (१८०°)', labelEn: 'D) Cyclic Quadrilateral' },
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
            TAB 1: CENTRAL AND INSCRIBED ANGLE RELATION
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'centralInscribed' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{L('साध्य: केन्द्रीय कोण = २ × परिधि कोण', 'Theorem: Central Angle = 2 × Inscribed Angle')}</span>
                <span className="text-amber-300 font-mono">
                  ∠AOB = 2 · ∠ACB
                </span>
              </div>

              <div className="w-full overflow-hidden flex justify-center bg-slate-900/60 rounded-xl border border-slate-700 py-2">
                <svg width={480} height={260} viewBox="0 0 480 260" className="max-w-full">
                  {/* Circle */}
                  <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#38BDF8" strokeWidth={2} />

                  {/* Arc AB Highlight */}
                  <path
                    d={`M ${ptA.x} ${ptA.y} A ${radius} ${radius} 0 0 0 ${ptB.x} ${ptB.y}`}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={4.5}
                  />

                  {/* Radii OA and OB forming Central Angle */}
                  <line x1={cx} y1={cy} x2={ptA.x} y2={ptA.y} stroke="#14B8A6" strokeWidth={2.5} />
                  <line x1={cx} y1={cy} x2={ptB.x} y2={ptB.y} stroke="#14B8A6" strokeWidth={2.5} />

                  {/* Chords CA and CB forming Inscribed Angle */}
                  <line x1={ptC.x} y1={ptC.y} x2={ptA.x} y2={ptA.y} stroke="#F59E0B" strokeWidth={2.5} />
                  <line x1={ptC.x} y1={ptC.y} x2={ptB.x} y2={ptB.y} stroke="#F59E0B" strokeWidth={2.5} />

                  {/* Center O */}
                  <circle cx={cx} cy={cy} r={4} fill="#FFFFFF" />
                  <text x={cx + 6} y={cy - 6} fill="#FFFFFF" fontSize="11" fontWeight="bold">O</text>

                  {/* Points A, B */}
                  <circle cx={ptA.x} cy={ptA.y} r={4.5} fill="#EF4444" />
                  <text x={ptA.x - 14} y={ptA.y + 16} fill="#FCA5A5" fontSize="12" fontWeight="bold">A</text>

                  <circle cx={ptB.x} cy={ptB.y} r={4.5} fill="#EF4444" />
                  <text x={ptB.x + 6} y={ptB.y + 16} fill="#FCA5A5" fontSize="12" fontWeight="bold">B</text>

                  {/* Point C (Movable Apex) */}
                  <circle cx={ptC.x} cy={ptC.y} r={6} fill="#F59E0B" />
                  <text x={ptC.x} y={ptC.y - 10} textAnchor="middle" fill="#FDE68A" fontSize="12" fontWeight="bold">C</text>

                  {/* Angle Labels */}
                  <text x={cx} y={cy + 24} textAnchor="middle" fill="#2DD4BF" fontSize="11" fontWeight="bold">
                    ∠AOB = {fmt(centralAngleDeg)}°
                  </text>
                  <text x={ptC.x} y={ptC.y + 18} textAnchor="middle" fill="#FDE68A" fontSize="11" fontWeight="bold">
                    ∠ACB = {fmt(inscribedAngleDeg)}°
                  </text>
                </svg>
              </div>

              <div className="w-full flex justify-between text-xs text-slate-300 mt-2">
                <span>केन्द्रीय कोण ∠AOB: <strong className="text-teal-300">{fmt(centralAngleDeg)}°</strong></span>
                <span>परिधि कोण ∠ACB: <strong className="text-amber-300">{fmt(inscribedAngleDeg)}°</strong> (ठिक आधा)</span>
              </div>
            </div>

            {/* Sliders & Math Breakdown */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <h4 className="font-bold text-sm text-[#142D4E]">
                  {L('चाप तथा शीर्षबिन्दु समायोजन:', 'Adjust Arc & Apex C:')}
                </h4>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('केन्द्रीय कोण ∠AOB (चाप AB):', 'Central Angle ∠AOB (Arc AB):')}</span>
                    <span className="text-teal-600 font-bold font-mono">{fmt(centralAngleDeg)}°</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="2"
                    value={centralAngleDeg}
                    onChange={(e) => setCentralAngleDeg(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('परिधि कोणको शीर्षबिन्दु C को स्थिति:', 'Apex C Position along Arc:')}</span>
                    <span className="text-amber-600 font-bold font-mono">{fmt(inscribedApexAngleDeg)}°</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="135"
                    step="1"
                    value={inscribedApexAngleDeg}
                    onChange={(e) => setInscribedApexAngleDeg(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {L('C लाई परिधिमा जहाँ सारे पनि कोण ∠ACB स्थिर रहन्छ।', 'Moving C anywhere on the arc keeps ∠ACB constant.')}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-300 rounded-2xl shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                  {L('साध्य निष्कर्ष तथा सम्बन्ध', 'Theorem Relationship')}
                </span>

                <div className="p-3 bg-white rounded-xl border text-xs font-mono space-y-1">
                  <div>∠AOB = २ × ∠ACB  ⟹  {fmt(centralAngleDeg)}° = २ × {fmt(inscribedAngleDeg)}°</div>
                  <div>∠ACB = ½ × ∠AOB  ⟹  {fmt(inscribedAngleDeg)}° = ½ × {fmt(centralAngleDeg)}°</div>
                </div>

                <div className="text-xs text-teal-900 leading-relaxed font-sans">
                  <strong>💡 {L('स्मरण रहोस्:', 'Key Insight:')}</strong>{' '}
                  {L(
                    'एउटै चाप AB मा आधारित भएमा केन्द्रीय कोण सधैँ परिधि कोणको दोब्बर र परिधि कोण केन्द्रीय कोणको आधा हुन्छ।',
                    'Standing on the same arc, the central angle is always twice the inscribed angle.'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: ANGLE IN A SEMICIRCLE (90 DEGREES)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'semicircle' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{L('साध्य: अर्धवृत्तको परिधि कोण एक समकोण हुन्छ', 'Theorem: Angle in Semicircle is 90°')}</span>
                <span className="text-emerald-400 font-mono font-bold">
                  ∠ACB = 90° (Right Angle)
                </span>
              </div>

              <div className="w-full overflow-hidden flex justify-center bg-slate-900/60 rounded-xl border border-slate-700 py-2">
                <svg width={480} height={260} viewBox="0 0 480 260" className="max-w-full">
                  {/* Semicircle */}
                  <path
                    d={`M ${ptSemiA.x} ${ptSemiA.y} A ${radius} ${radius} 0 0 1 ${ptSemiB.x} ${ptSemiB.y}`}
                    fill="#14B8A6"
                    fillOpacity={0.15}
                    stroke="#38BDF8"
                    strokeWidth={2.5}
                  />
                  {/* Lower dashed circle */}
                  <path
                    d={`M ${ptSemiB.x} ${ptSemiB.y} A ${radius} ${radius} 0 0 1 ${ptSemiA.x} ${ptSemiA.y}`}
                    fill="none"
                    stroke="#475569"
                    strokeWidth={1.5}
                    strokeDasharray="3,3"
                  />

                  {/* Diameter AB */}
                  <line x1={ptSemiA.x} y1={ptSemiA.y} x2={ptSemiB.x} y2={ptSemiB.y} stroke="#EF4444" strokeWidth={3} />

                  {/* Chords AC and BC */}
                  <line x1={ptSemiC.x} y1={ptSemiC.y} x2={ptSemiA.x} y2={ptSemiA.y} stroke="#F59E0B" strokeWidth={2.5} />
                  <line x1={ptSemiC.x} y1={ptSemiC.y} x2={ptSemiB.x} y2={ptSemiB.y} stroke="#F59E0B" strokeWidth={2.5} />

                  {/* Center O */}
                  <circle cx={cx} cy={cy} r={4} fill="#FFFFFF" />
                  <text x={cx} y={cy + 16} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">O (Centre)</text>

                  {/* Diameter endpoints */}
                  <circle cx={ptSemiA.x} cy={ptSemiA.y} r={4.5} fill="#EF4444" />
                  <text x={ptSemiA.x - 14} y={ptSemiA.y + 4} fill="#FCA5A5" fontSize="12" fontWeight="bold">A</text>
                  <circle cx={ptSemiB.x} cy={ptSemiB.y} r={4.5} fill="#EF4444" />
                  <text x={ptSemiB.x + 8} y={ptSemiB.y + 4} fill="#FCA5A5" fontSize="12" fontWeight="bold">B</text>

                  {/* Apex C */}
                  <circle cx={ptSemiC.x} cy={ptSemiC.y} r={6} fill="#10B981" />
                  <text x={ptSemiC.x} y={ptSemiC.y - 10} textAnchor="middle" fill="#34D399" fontSize="12" fontWeight="bold">C</text>

                  {/* Right Angle indicator at C */}
                  <text x={ptSemiC.x} y={ptSemiC.y + 18} textAnchor="middle" fill="#FDE68A" fontSize="11" fontWeight="bold">
                    ∠ACB = ९०°
                  </text>
                </svg>
              </div>

              <div className="w-full flex justify-between text-xs text-slate-300 mt-2">
                <span>व्यास AB = २ × R</span>
                <span>केन्द्रीय कोण ∠AOB = १८०° ⟹ परिधि कोण = ९०°</span>
              </div>
            </div>

            {/* Slider & Explanation */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <h4 className="font-bold text-sm text-[#142D4E]">
                  {L('अर्धवृत्तमा बिन्दु C सार्नुहोस्:', 'Slide Point C on Semicircle:')}
                </h4>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('बिन्दु C को स्थिति कोण (Angle of C):', 'Angle of C on Semicircle:')}</span>
                    <span className="text-emerald-600 font-bold font-mono">{fmt(semiApexAngleDeg)}°</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="160"
                    step="1"
                    value={semiApexAngleDeg}
                    onChange={(e) => setSemiApexAngleDeg(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                  {L('साध्यको सरल उपपत्ति (Simple Proof)', 'Simple Proof')}
                </span>

                <div className="text-xs text-emerald-900 leading-relaxed font-sans space-y-1.5">
                  <div>१) व्यास AB वृत्तको केन्द्र O बाट जाने सिधा रेखा हो, त्यसैले केन्द्रीय कोण ∠AOB = १८०° हुन्छ।</div>
                  <div>२) साध्य १ अनुसार, एउटै चापमा बनेको परिधि कोण केन्द्रीय कोणको आधा हुन्छ:</div>
                  <div className="font-mono font-bold text-emerald-800 p-2 bg-white rounded border">
                    ∠ACB = ½ × ∠AOB = ½ × १८०° = ९०° (एक समकोण)
                  </div>
                  <div>३) अतः C लाई अर्धवृत्तको परिधिमा जुनसुकै स्थानमा सारे पनि ∠ACB सधैँ ९०° नै रहन्छ।</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: ANGLES IN THE SAME SEGMENT
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'sameSegment' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{L('साध्य: एउटै वृत्तखण्डका परिधि कोणहरू बराबर हुन्छन्', 'Theorem: Angles in Same Segment are Equal')}</span>
                <span className="text-teal-300 font-mono font-bold">
                  ∠ACB = ∠ADB
                </span>
              </div>

              <div className="w-full overflow-hidden flex justify-center bg-slate-900/60 rounded-xl border border-slate-700 py-2">
                <svg width={480} height={260} viewBox="0 0 480 260" className="max-w-full">
                  {/* Circle */}
                  <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#38BDF8" strokeWidth={2} />

                  {/* Chord AB */}
                  <line x1={ptSegA.x} y1={ptSegA.y} x2={ptSegB.x} y2={ptSegB.y} stroke="#EF4444" strokeWidth={3} />
                  <circle cx={ptSegA.x} cy={ptSegA.y} r={4} fill="#EF4444" />
                  <text x={ptSegA.x - 14} y={ptSegA.y + 16} fill="#FCA5A5" fontSize="12" fontWeight="bold">A</text>
                  <circle cx={ptSegB.x} cy={ptSegB.y} r={4} fill="#EF4444" />
                  <text x={ptSegB.x + 6} y={ptSegB.y + 16} fill="#FCA5A5" fontSize="12" fontWeight="bold">B</text>

                  {/* Inscribed Angle 1 (ACB) - Teal */}
                  <line x1={ptSegC.x} y1={ptSegC.y} x2={ptSegA.x} y2={ptSegA.y} stroke="#14B8A6" strokeWidth={2} />
                  <line x1={ptSegC.x} y1={ptSegC.y} x2={ptSegB.x} y2={ptSegB.y} stroke="#14B8A6" strokeWidth={2} />
                  <circle cx={ptSegC.x} cy={ptSegC.y} r={5} fill="#14B8A6" />
                  <text x={ptSegC.x} y={ptSegC.y - 8} textAnchor="middle" fill="#5EEAD4" fontSize="12" fontWeight="bold">C</text>

                  {/* Inscribed Angle 2 (ADB) - Amber */}
                  <line x1={ptSegD.x} y1={ptSegD.y} x2={ptSegA.x} y2={ptSegA.y} stroke="#F59E0B" strokeWidth={2} />
                  <line x1={ptSegD.x} y1={ptSegD.y} x2={ptSegB.x} y2={ptSegB.y} stroke="#F59E0B" strokeWidth={2} />
                  <circle cx={ptSegD.x} cy={ptSegD.y} r={5} fill="#F59E0B" />
                  <text x={ptSegD.x} y={ptSegD.y - 8} textAnchor="middle" fill="#FDE68A" fontSize="12" fontWeight="bold">D</text>

                  {/* Value labels */}
                  <text x={ptSegC.x} y={ptSegC.y + 16} textAnchor="middle" fill="#5EEAD4" fontSize="10" fontWeight="bold">
                    {fmt(sameSegmentAngleDeg.toFixed(1))}°
                  </text>
                  <text x={ptSegD.x} y={ptSegD.y + 16} textAnchor="middle" fill="#FDE68A" fontSize="10" fontWeight="bold">
                    {fmt(sameSegmentAngleDeg.toFixed(1))}°
                  </text>
                </svg>
              </div>

              <div className="w-full flex justify-between text-xs text-slate-300 mt-2">
                <span>∠ACB = <strong className="text-teal-300">{fmt(sameSegmentAngleDeg.toFixed(1))}°</strong></span>
                <span>∠ADB = <strong className="text-amber-300">{fmt(sameSegmentAngleDeg.toFixed(1))}°</strong> (सधैँ बराबर)</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <h4 className="font-bold text-sm text-[#142D4E]">
                  {L('शीर्षबिन्दुहरू C र D सार्नुहोस्:', 'Slide Points C & D:')}
                </h4>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('बिन्दु C को स्थिति (Apex C):', 'Apex C Position:')}</span>
                    <span className="text-teal-600 font-bold font-mono">{fmt(segApex1Deg)}°</span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="95"
                    step="1"
                    value={segApex1Deg}
                    onChange={(e) => setSegApex1Deg(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('बिन्दु D को स्थिति (Apex D):', 'Apex D Position:')}</span>
                    <span className="text-amber-600 font-bold font-mono">{fmt(segApex2Deg)}°</span>
                  </div>
                  <input
                    type="range"
                    min="105"
                    max="155"
                    step="1"
                    value={segApex2Deg}
                    onChange={(e) => setSegApex2Deg(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-teal-50 border border-teal-300 rounded-xl text-xs text-teal-900 leading-relaxed">
                <strong>{L('💡 साध्य निष्कर्ष:', 'Theorem Statement:')}</strong>
                <p className="mt-1">
                  {L(
                    'एउटै जीवा AB वा सोही चापमा आधारित भएर एउटै वृत्तखण्डमा कोरिएका सबै परिधि कोणहरू बराबर हुन्छन् (∠ACB = ∠ADB = ½ × केन्द्रीय कोण)।',
                    'All inscribed angles subtended by the same chord or arc in the same segment of a circle are strictly equal.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: CYCLIC QUADRILATERAL (OPPOSITE ANGLES = 180 DEGREES)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'cyclicQuad' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{L('साध्य: चक्रीय चतुर्भुजका सम्मुख कोणहरू परिपूरक हुन्छन्', 'Theorem: Opposite Angles of Cyclic Quad = 180°')}</span>
                <span className="text-amber-300 font-mono font-bold">
                  ∠B + ∠D = 180°, ∠A + ∠C = 180°
                </span>
              </div>

              <div className="w-full overflow-hidden flex justify-center bg-slate-900/60 rounded-xl border border-slate-700 py-2">
                <svg width={480} height={260} viewBox="0 0 480 260" className="max-w-full">
                  {/* Circle */}
                  <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#38BDF8" strokeWidth={2} />

                  {/* Cyclic Quadrilateral ABCD */}
                  <polygon
                    points={`${ptQuadA.x},${ptQuadA.y} ${ptQuadB.x},${ptQuadB.y} ${ptQuadC.x},${ptQuadC.y} ${ptQuadD.x},${ptQuadD.y}`}
                    fill="#14B8A6"
                    fillOpacity={0.25}
                    stroke="#14B8A6"
                    strokeWidth={2.5}
                  />

                  {/* Vertices */}
                  <circle cx={ptQuadA.x} cy={ptQuadA.y} r={5} fill="#EF4444" />
                  <text x={ptQuadA.x + 8} y={ptQuadA.y - 6} fill="#FCA5A5" fontSize="12" fontWeight="bold">A ({fmt(angleBad)}°)</text>

                  <circle cx={ptQuadB.x} cy={ptQuadB.y} r={5} fill="#F59E0B" />
                  <text x={ptQuadB.x - 12} y={ptQuadB.y - 6} fill="#FDE68A" fontSize="12" fontWeight="bold">B ({fmt(angleAbc)}°)</text>

                  <circle cx={ptQuadC.x} cy={ptQuadC.y} r={5} fill="#EF4444" />
                  <text x={ptQuadC.x - 14} y={ptQuadC.y + 16} fill="#FCA5A5" fontSize="12" fontWeight="bold">C ({fmt(angleBcd)}°)</text>

                  <circle cx={ptQuadD.x} cy={ptQuadD.y} r={5} fill="#F59E0B" />
                  <text x={ptQuadD.x + 8} y={ptQuadD.y + 16} fill="#FDE68A" fontSize="12" fontWeight="bold">D ({fmt(angleAdc)}°)</text>
                </svg>
              </div>

              <div className="w-full flex justify-between text-xs text-slate-300 mt-2">
                <span>∠A + ∠C = {fmt(angleBad)}° + {fmt(angleBcd)}° = <strong className="text-amber-300">१८०°</strong></span>
                <span>∠B + ∠D = {fmt(angleAbc)}° + {fmt(angleAdc)}° = <strong className="text-amber-300">१८०°</strong></span>
              </div>
            </div>

            {/* Sliders to deform quadrilateral */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <h4 className="font-bold text-sm text-[#142D4E]">
                  {L('शीर्षबिन्दुहरू घुमाई चतुर्भुज बदल्नुहोस्:', 'Rotate Vertices along Circumference:')}
                </h4>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('शीर्षबिन्दु A को स्थिति (Angle of A):', 'Position of A:')}</span>
                    <span className="text-rose-600 font-bold font-mono">{fmt(qAngleA)}°</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="65"
                    value={qAngleA}
                    onChange={(e) => setQAngleA(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{L('शीर्षबिन्दु B को स्थिति (Angle of B):', 'Position of B:')}</span>
                    <span className="text-amber-600 font-bold font-mono">{fmt(qAngleB)}°</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="155"
                    value={qAngleB}
                    onChange={(e) => setQAngleB(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-sm text-xs text-emerald-900 leading-relaxed">
                <strong>{L('💡 साध्य निष्कर्ष (Cyclic Quad Theorem):', 'Cyclic Quad Theorem:')}</strong>
                <p className="mt-1">
                  {L(
                    'कुनै पनि चक्रीय चतुर्भुज (Cyclic Quadrilateral) मा सम्मुख कोणहरूको योगफल सधैँ १८०° (परिपूरक / Supplementary) हुन्छ: ∠A + ∠C = १८०° र ∠B + ∠D = १८०°।',
                    'The opposite angles of a cyclic quadrilateral are always supplementary (sum to 180°).'
                  )}
                </p>
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

export default CircleTheoremExplorer;
