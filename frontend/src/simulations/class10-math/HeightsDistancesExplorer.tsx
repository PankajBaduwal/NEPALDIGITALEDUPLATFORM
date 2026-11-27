import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const HeightsDistancesExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U15-01',
    chapter: 15,
    titleNp: 'उचाइ र दूरी अन्वेषक प्रयोगशाला',
    titleEn: 'Heights and Distances Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'elevation' | 'depression' | 'clinometer' | 'brokenTree' | 'circularPond' | 'challenge'>('elevation');

  // ── 1. ELEVATION PARAMETERS ───────────────────────────────────────────────
  const [elevDist, setElevDist] = useState<number>(20); // distance d in meters (5 to 50)
  const [elevAngle, setElevAngle] = useState<number>(30); // angle theta in degrees (15 to 75)
  const [elevEyeH, setElevEyeH] = useState<number>(1.5); // eye height e in meters (0 to 2)

  // Trigonometric calculation
  const elevRad = (elevAngle * Math.PI) / 180;
  const elevAboveEye = elevDist * Math.tan(elevRad);
  const elevTotalH = elevAboveEye + elevEyeH;

  // ── 2. DEPRESSION PARAMETERS ──────────────────────────────────────────────
  const [deprTowerH, setDeprTowerH] = useState<number>(30); // tower height H in meters (10 to 60)
  const [deprAngle, setDeprAngle] = useState<number>(45); // depression angle alpha (15 to 70)

  const deprRad = (deprAngle * Math.PI) / 180;
  const deprDist = deprTowerH / Math.tan(deprRad); // distance d = H / tan(alpha)
  const deprHypot = Math.sqrt(deprTowerH * deprTowerH + deprDist * deprDist);

  // ── 3. CLINOMETER SIMULATOR PARAMETERS ────────────────────────────────────
  const [clinoAngle, setClinoAngle] = useState<number>(45); // measured angle
  const [clinoDist, setClinoDist] = useState<number>(15);
  const [clinoEyeH, setClinoEyeH] = useState<number>(1.4);
  const clinoPlumbAngle = 90 - clinoAngle; // angle plumb line hangs relative to vertical
  const clinoHeight = clinoDist * Math.tan((clinoAngle * Math.PI) / 180) + clinoEyeH;

  // ── 4. BROKEN TREE PARAMETERS ─────────────────────────────────────────────
  const [brokenDist, setBrokenDist] = useState<number>(12); // distance from foot d (m)
  const [brokenAngle, setBrokenAngle] = useState<number>(30); // angle theta (30, 45, 60)

  const brokenRad = (brokenAngle * Math.PI) / 180;
  const brokenTrunk = brokenDist * Math.tan(brokenRad); // standing part x = d * tan(theta)
  const brokenPart = brokenDist / Math.cos(brokenRad); // fallen hypotenuse y = d / cos(theta)
  const brokenTotalH = brokenTrunk + brokenPart; // total original height H = x + y

  // ── 5. CIRCULAR POND PARAMETERS ───────────────────────────────────────────
  const [pondDiameter, setPondDiameter] = useState<number>(28); // diameter D (m)
  const [pondAngle, setPondAngle] = useState<number>(45); // angle of elevation from bank

  const pondRadius = pondDiameter / 2;
  const pondPoleHeight = pondRadius * Math.tan((pondAngle * Math.PI) / 180);

  // ── 6. QUIZ / CHALLENGE ───────────────────────────────────────────────────
  const [score, setScore] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

  const quizQuestions = [
    {
      id: 1,
      qNp: '१.५ मिटर अग्लो एक व्यक्तिले ४० मिटर टाढा रहेको मन्दिरको गजुर हेर्दा उन्नतांश कोण ३०° पाउँछ। मन्दिरको कुल उचाइ कति होला? (tan ३०° = १/√३ ≈ ०.५७७)',
      qEn: 'An observer 1.5 m tall stands 40 m away from a temple and observes the top with an angle of elevation of 30°. What is the total height of the temple? (tan 30° = 1/√3 ≈ 0.577)',
      options: [
        { np: '२४.५८ मिटर', en: '24.58 m', correct: true },
        { np: '२३.०८ मिटर', en: '23.08 m', correct: false },
        { np: '४१.५ मिटर', en: '41.5 m', correct: false },
        { np: '३१.५ मिटर', en: '31.5 m', correct: false },
      ],
      hintNp: 'h = d × tan(θ) + e = ४० × (१/√३) + १.५ = २३.०९ + १.५ = २४.५९ मिटर',
      hintEn: 'h = d × tan(θ) + e = 40 × 0.5774 + 1.5 = 23.09 + 1.5 = 24.59 m',
    },
    {
      id: 2,
      qNp: '६० मिटर अग्लो धरहराको टुप्पोबाट जमिनमा रहेको एक कारलाई हेर्दा अवनति कोण ४५° देखिन्छ। धरहराको फेदबाट कार कति टाढा छ?',
      qEn: 'From the top of a 60 m high tower, the angle of depression of a car on the ground is 45°. How far is the car from the base of the tower?',
      options: [
        { np: '३० मिटर', en: '30 m', correct: false },
        { np: '६० मिटर', en: '60 m', correct: true },
        { np: '८४.८५ मिटर', en: '84.85 m', correct: false },
        { np: '१२० मिटर', en: '120 m', correct: false },
      ],
      hintNp: 'अवनति कोण = उन्नतांश कोण = ४५°। tan ४५° = १, त्यसैले दूरी = ६० / tan ४५° = ६० मिटर।',
      hintEn: 'Angle of depression = Angle of elevation = 45°. tan 45° = 1, so distance = 60 / 1 = 60 m.',
    },
    {
      id: 3,
      qNp: 'एउटा रुख हावाले भाँचिएर टुप्पोले फेदबाट १० मिटरको दूरीमा जमिन छुँदा ३०° को कोण बनाउँछ। रुखको कुल प्रारम्भिक उचाइ कति थियो? (tan ३०° = १/√३, cos ३०° = √३/२)',
      qEn: 'A tree is broken by the wind such that its top touches the ground at a distance of 10 m from its base, making an angle of 30°. What was the original height of the tree?',
      options: [
        { np: '१०√३ मिटर (१७.३२ मि)', en: '10√3 m (17.32 m)', correct: true },
        { np: '१० मिटर', en: '10 m', correct: false },
        { np: '२० मिटर', en: '20 m', correct: false },
        { np: '१५.७७ मिटर', en: '15.77 m', correct: false },
      ],
      hintNp: 'भाँचिएको रुख: उभिएको भाग x = १० tan ३०° = १०/√३, ढलेको भाग y = १० / cos ३०° = २०/√३। कुल उचाइ = (१० + २०)/√३ = ३०/√३ = १०√३ ≈ १७.३२ मि।',
      hintEn: 'Broken tree: Trunk x = 10 tan 30° = 10/√3, fallen y = 10 / cos 30° = 20/√3. Total = 30/√3 = 10√3 ≈ 17.32 m.',
    },
    {
      id: 4,
      qNp: 'एउटा वृत्ताकार पोखरीको केन्द्रमा स्तम्भ छ। पोखरीको व्यास २० मिटर छ र डिलबाट स्तम्भको टुप्पो हेर्दा ६०° को कोण बन्छ। स्तम्भको उचाइ कति?',
      qEn: 'A pillar is erected at the centre of a circular pond. The diameter of the pond is 20 m. If the angle of elevation of the top from the bank is 60°, what is the height of the pillar?',
      options: [
        { np: '१०√३ मिटर (१७.३२ मि)', en: '10√3 m (17.32 m)', correct: true },
        { np: '२०√३ मिटर (३४.६४ मि)', en: '20√3 m (34.64 m)', correct: false },
        { np: '१० मिटर', en: '10 m', correct: false },
        { np: '३० मिटर', en: '30 m', correct: false },
      ],
      hintNp: 'पोखरीको अर्धव्यास r = व्यास / २ = १० मि। उचाइ h = r × tan ६०° = १० × √३ = १७.३२ मिटर।',
      hintEn: 'Radius r = Diameter / 2 = 10 m. Height h = r × tan 60° = 10 × √3 ≈ 17.32 m.',
    },
  ];

  const handleSelectQuizOption = (qIdx: number, optIdx: number, isCorrect: boolean) => {
    if (selectedAnswers[qIdx] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setShowFeedback((prev) => ({ ...prev, [qIdx]: true }));
    if (isCorrect) setScore((prev) => prev + 25);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'उचाइ र दूरी प्रयोगशालामा स्वागत छ! त्रिकोणमिति प्रयोग गरेर अग्ला मन्दिर, रुख, र धरहराको उचाइ पत्ता लगाउनुहोस्!',
        'Welcome to Heights & Distances Lab! Explore trigonometry to calculate heights of temples, trees, and towers!'
      )}
    >
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB NAVIGATION */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {[
            { id: 'elevation', labelNp: 'उन्नतांश कोण (Elevation)', labelEn: 'Angle of Elevation' },
            { id: 'depression', labelNp: 'अवनति कोण (Depression)', labelEn: 'Angle of Depression' },
            { id: 'clinometer', labelNp: 'क्लाइनोमिटर (Clinometer)', labelEn: 'Virtual Clinometer' },
            { id: 'brokenTree', labelNp: 'भाँचिएको रुख (Broken Tree)', labelEn: 'Broken Tree Problem' },
            { id: 'circularPond', labelNp: 'वृत्ताकार पोखरी (Circular Pond)', labelEn: 'Circular Pond' },
            { id: 'challenge', labelNp: 'अभ्यास तथा मूल्याङ्कन', labelEn: 'Challenge & Quiz' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#142D4E] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-teal-50 border border-gray-200'
              }`}
            >
              {L(tab.labelNp, tab.labelEn)}
            </button>
          ))}
        </div>

        {/* ── TAB 1: ANGLE OF ELEVATION ────────────────────────────────────────── */}
        {activeTab === 'elevation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#142D4E] text-base sm:text-lg">
                  {L('उन्नतांश कोण तथा उचाइको ज्यामितीय स्वरूप', 'Geometric Representation of Angle of Elevation')}
                </h3>
                <span className="text-xs bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-semibold">
                  tan θ = (h - e) / d
                </span>
              </div>

              {/* SVG VISUALIZATION */}
              <div className="w-full bg-[#F5F7F8] rounded-xl p-2 border border-gray-200 overflow-x-auto flex justify-center">
                <svg viewBox="0 0 700 360" className="w-full max-w-[680px] h-[340px] select-none">
                  <defs>
                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E0F2FE" />
                      <stop offset="100%" stopColor="#BAE6FD" />
                    </linearGradient>
                    <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#86EFAC" />
                      <stop offset="100%" stopColor="#4ADE80" />
                    </linearGradient>
                    <linearGradient id="pagodaGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#B91C1C" />
                      <stop offset="100%" stopColor="#991B1B" />
                    </linearGradient>
                  </defs>

                  {/* Sky & Ground */}
                  <rect x="0" y="0" width="700" height="300" fill="url(#skyGrad)" opacity="0.4" />
                  <rect x="0" y="300" width="700" height="60" fill="url(#groundGrad)" />
                  <line x1="0" y1="300" x2="700" y2="300" stroke="#15803D" strokeWidth="3" />

                  {/* Calculations for visual scaling */}
                  {/* Observer foot at x = 120, y = 300 */}
                  {/* Observer eye height: map 0-2m to 0-40px */}
                  {(() => {
                    const obsX = 120;
                    const obsGroundY = 300;
                    const obsEyeH_px = Math.max(10, (elevEyeH / 2) * 35);
                    const obsEyeY = obsGroundY - obsEyeH_px;

                    // Temple base at x = 540, y = 300
                    const templeX = 540;
                    const templeW = 50;

                    // Height scaling: total height max around 60m mapped to 240px
                    const maxVisualH = 220;
                    const scaleFactor = maxVisualH / Math.max(35, elevTotalH);
                    const templeH_px = Math.min(250, elevTotalH * scaleFactor);
                    const templeTopY = obsGroundY - templeH_px;
                    const sightTopY = templeTopY;

                    return (
                      <g>
                        {/* Observer Figure */}
                        <g transform={`translate(${obsX - 12}, ${obsGroundY - obsEyeH_px - 14})`}>
                          {/* Head */}
                          <circle cx="12" cy="7" r="7" fill="#142D4E" />
                          {/* Body */}
                          <line x1="12" y1="14" x2="12" y2={obsEyeH_px + 8} stroke="#142D4E" strokeWidth="4" />
                          {/* Legs */}
                          <line x1="12" y1={obsEyeH_px + 8} x2="6" y2={obsEyeH_px + 14} stroke="#142D4E" strokeWidth="3" />
                          <line x1="12" y1={obsEyeH_px + 8} x2="18" y2={obsEyeH_px + 14} stroke="#142D4E" strokeWidth="3" />
                        </g>

                        {/* Observer Height Indicator */}
                        <line x1={obsX - 25} y1={obsGroundY} x2={obsX - 25} y2={obsEyeY} stroke="#D9A441" strokeWidth="2" strokeDasharray="3,3" />
                        <line x1={obsX - 30} y1={obsGroundY} x2={obsX - 20} y2={obsGroundY} stroke="#D9A441" strokeWidth="2" />
                        <line x1={obsX - 30} y1={obsEyeY} x2={obsX - 20} y2={obsEyeY} stroke="#D9A441" strokeWidth="2" />
                        <text x={obsX - 35} y={(obsGroundY + obsEyeY) / 2 + 4} fill="#B45309" fontSize="11" fontWeight="bold" textAnchor="end">
                          e = {fmt(elevEyeH)} m
                        </text>

                        {/* Pagoda Temple Graphic */}
                        {/* Temple Main Tower */}
                        <rect x={templeX - templeW / 2} y={templeTopY + 25} width={templeW} height={templeH_px - 25} fill="url(#pagodaGrad)" rx="2" />
                        {/* Pagoda Roofs */}
                        <polygon
                          points={`${templeX},${templeTopY} ${templeX - 35},${templeTopY + 25} ${templeX + 35},${templeTopY + 25}`}
                          fill="#7F1D1D"
                        />
                        {/* Pinnacle (Gajur) */}
                        <circle cx={templeX} cy={templeTopY - 4} r="5" fill="#D9A441" />
                        <polygon points={`${templeX},${templeTopY - 14} ${templeX - 3},${templeTopY - 4} ${templeX + 3},${templeTopY - 4}`} fill="#D9A441" />

                        {/* Horizontal Eye-Level Line */}
                        <line x1={obsX} y1={obsEyeY} x2={templeX} y2={obsEyeY} stroke="#64748B" strokeWidth="2" strokeDasharray="5,4" />
                        <text x={(obsX + templeX) / 2} y={obsEyeY + 16} fill="#64748B" fontSize="11" fontWeight="bold" textAnchor="middle">
                          {L('क्षितिज रेखा (Horizontal line)', 'Horizontal line of sight')}
                        </text>

                        {/* Ground Distance Line */}
                        <line x1={obsX} y1={obsGroundY + 18} x2={templeX} y2={obsGroundY + 18} stroke="#167C80" strokeWidth="2" markerEnd="url(#arrow)" />
                        <line x1={obsX} y1={obsGroundY + 10} x2={obsX} y2={obsGroundY + 26} stroke="#167C80" strokeWidth="2" />
                        <line x1={templeX} y1={obsGroundY + 10} x2={templeX} y2={obsGroundY + 26} stroke="#167C80" strokeWidth="2" />
                        <text x={(obsX + templeX) / 2} y={obsGroundY + 36} fill="#167C80" fontSize="13" fontWeight="bold" textAnchor="middle">
                          d = {fmt(elevDist)} m
                        </text>

                        {/* Line of Sight (Hypotenuse) */}
                        <line x1={obsX} y1={obsEyeY} x2={templeX} y2={templeTopY} stroke="#DC2626" strokeWidth="3" />
                        <text
                          x={(obsX + templeX) / 2 - 20}
                          y={(obsEyeY + templeTopY) / 2 - 10}
                          fill="#DC2626"
                          fontSize="11"
                          fontWeight="bold"
                          transform={`rotate(${-elevAngle * 0.5}, ${(obsX + templeX) / 2}, ${(obsEyeY + templeTopY) / 2})`}
                        >
                          {L('दृष्टि रेखा (Line of Sight)', 'Line of Sight')}
                        </text>

                        {/* Right Angle Symbol at (templeX, obsEyeY) */}
                        <rect x={templeX - 16} y={obsEyeY - 16} width="16" height="16" fill="none" stroke="#64748B" strokeWidth="1.5" />

                        {/* Angle Arc at Observer Eye */}
                        <path
                          d={`M ${obsX + 40} ${obsEyeY} A 40 40 0 0 0 ${obsX + 40 * Math.cos(elevRad)} ${obsEyeY - 40 * Math.sin(elevRad)}`}
                          fill="none"
                          stroke="#E11D48"
                          strokeWidth="2.5"
                        />
                        <text x={obsX + 48} y={obsEyeY - 10} fill="#E11D48" fontSize="13" fontWeight="bold">
                          θ = {fmt(elevAngle)}°
                        </text>

                        {/* Total Height Dimension Line on Right */}
                        <line x1={templeX + 45} y1={templeTopY} x2={templeX + 45} y2={obsGroundY} stroke="#142D4E" strokeWidth="2" />
                        <line x1={templeX + 40} y1={templeTopY} x2={templeX + 50} y2={templeTopY} stroke="#142D4E" strokeWidth="2" />
                        <line x1={templeX + 40} y1={obsGroundY} x2={templeX + 50} y2={obsGroundY} stroke="#142D4E" strokeWidth="2" />
                        <text x={templeX + 58} y={(templeTopY + obsGroundY) / 2 + 5} fill="#142D4E" fontSize="13" fontWeight="bold">
                          h = {fmt(elevTotalH.toFixed(2))} m
                        </text>

                        {/* Eye-level division marker */}
                        <line x1={templeX + 38} y1={obsEyeY} x2={templeX + 52} y2={obsEyeY} stroke="#D9A441" strokeWidth="2" />
                        <text x={templeX + 58} y={(templeTopY + obsEyeY) / 2 + 4} fill="#167C80" fontSize="11" fontWeight="bold">
                          {fmt(elevAboveEye.toFixed(2))} m
                        </text>
                        <text x={templeX + 58} y={(obsEyeY + obsGroundY) / 2 + 4} fill="#D9A441" fontSize="10" fontWeight="bold">
                          {fmt(elevEyeH)} m
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* LIVE FORMULA BOX */}
              <div className="w-full mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <div className="text-sm font-semibold text-teal-900 mb-1">
                  {L('उचाइ निकाल्ने सूत्र (Formula):', 'Formula for Object Height:')}
                </div>
                <div className="text-base font-bold text-[#142D4E] flex flex-wrap items-center gap-2">
                  <span>h = d × tan(θ) + e</span>
                  <span className="text-gray-400">|</span>
                  <span>
                    h = {fmt(elevDist)} × tan({fmt(elevAngle)}°) + {fmt(elevEyeH)}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span>
                    h = {fmt(elevDist)} × {fmt(Math.tan(elevRad).toFixed(4))} + {fmt(elevEyeH)} ={' '}
                    <strong className="text-teal-700 font-extrabold">{fmt(elevTotalH.toFixed(2))} m</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* CONTROLS PANEL */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h4 className="font-bold text-[#142D4E] text-sm uppercase tracking-wider">
                  {L('मापन नियन्त्रण (Parameters)', 'Measurement Controls')}
                </h4>

                {/* Distance Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{L('क्षितिज दूरी (Distance d):', 'Distance from base (d):')}</span>
                    <span className="text-teal-700 font-bold">{fmt(elevDist)} m</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={elevDist}
                    onChange={(e) => setElevDist(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>५ मि</span>
                    <span>५० मि</span>
                  </div>
                </div>

                {/* Angle Slider & Preset Buttons */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{L('उन्नतांश कोण (Angle θ):', 'Angle of Elevation (θ):')}</span>
                    <span className="text-rose-600 font-bold">{fmt(elevAngle)}°</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="75"
                    step="1"
                    value={elevAngle}
                    onChange={(e) => setElevAngle(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                  <div className="flex gap-2 mt-2">
                    {[30, 45, 60].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setElevAngle(deg)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                          elevAngle === deg ? 'bg-rose-600 text-white border-rose-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {fmt(deg)}°
                      </button>
                    ))}
                  </div>
                </div>

                {/* Observer Eye Height Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{L('पर्यवेक्षकको उचाइ (Eye Height e):', 'Observer Eye Height (e):')}</span>
                    <span className="text-amber-600 font-bold">{fmt(elevEyeH)} m</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={elevEyeH}
                    onChange={(e) => setElevEyeH(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>० मि (जमिन)</span>
                    <span>२ मि</span>
                  </div>
                </div>
              </div>

              {/* CURRICULUM EXPLANATION CARD */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <div className="font-bold text-amber-900 text-xs mb-1 flex items-center gap-1">
                  💡 {L('पाठ्यपुस्तक सिद्धान्त (CDC Textbook Note)', 'Curriculum Standard')}
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {L(
                    'पर्यवेक्षकको आँखाले क्षितिज रेखाभन्दा माथि रहेको वस्तुलाई हेर्दा आँखा र वस्तु जोड्ने दृष्टि रेखाले क्षितिज रेखासँग बनाउने कोणलाई उन्नतांश कोण (Angle of Elevation) भनिन्छ।',
                    'When an observer looks at an object above eye level, the angle formed by the line of sight with the horizontal line is called the Angle of Elevation.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: ANGLE OF DEPRESSION ──────────────────────────────────────── */}
        {activeTab === 'depression' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#142D4E] text-base sm:text-lg">
                  {L('अवनति कोण र एकान्तर कोण सम्बन्ध', 'Angle of Depression and Alternate Angles')}
                </h3>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                  tan α = H / d
                </span>
              </div>

              {/* SVG VISUALIZATION */}
              <div className="w-full bg-[#F5F7F8] rounded-xl p-2 border border-gray-200 overflow-x-auto flex justify-center">
                <svg viewBox="0 0 700 360" className="w-full max-w-[680px] h-[340px] select-none">
                  {/* Background & Ground */}
                  <rect x="0" y="0" width="700" height="290" fill="#F8FAFC" />
                  <rect x="0" y="290" width="700" height="70" fill="#E2E8F0" />
                  <line x1="0" y1="290" x2="700" y2="290" stroke="#94A3B8" strokeWidth="2" />

                  {(() => {
                    const towerX = 140;
                    const towerW = 60;
                    const groundY = 290;
                    const towerH_px = Math.min(200, (deprTowerH / 60) * 190);
                    const towerTopY = groundY - towerH_px;

                    // Calculate car position based on deprDist
                    // max distance around 80m mapped to 460px
                    const carX = Math.min(640, towerX + (deprDist / 80) * 440);

                    return (
                      <g>
                        {/* Tower / Building */}
                        <rect x={towerX - towerW / 2} y={towerTopY} width={towerW} height={towerH_px} fill="#334155" rx="3" />
                        {/* Tower Windows */}
                        {[0, 1, 2, 3].map((row) => (
                          <g key={row}>
                            <rect x={towerX - 20} y={towerTopY + 20 + row * 40} width="12" height="18" fill="#FCD34D" rx="1" />
                            <rect x={towerX + 8} y={towerTopY + 20 + row * 40} width="12" height="18" fill="#FCD34D" rx="1" />
                          </g>
                        ))}
                        {/* Tower Top Platform & Observer */}
                        <rect x={towerX - towerW / 2 - 5} y={towerTopY - 4} width={towerW + 10} height="6" fill="#1E293B" />
                        <circle cx={towerX} cy={towerTopY - 12} r="5" fill="#EF4444" />
                        <line x1={towerX} y1={towerTopY - 7} x2={towerX} y2={towerTopY - 2} stroke="#EF4444" strokeWidth="3" />

                        {/* Top Horizontal Sight Line (Dashed) */}
                        <line x1={towerX} y1={towerTopY - 12} x2={carX + 40} y2={towerTopY - 12} stroke="#64748B" strokeWidth="2" strokeDasharray="6,4" />
                        <text x={towerX + 160} y={towerTopY - 20} fill="#64748B" fontSize="11" fontWeight="bold">
                          {L('शीर्ष क्षितिज रेखा (Horizontal line at top)', 'Horizontal reference line')}
                        </text>

                        {/* Ground Car */}
                        <g transform={`translate(${carX - 25}, ${groundY - 16})`}>
                          <rect x="4" y="4" width="36" height="12" fill="#2563EB" rx="2" />
                          <circle cx="12" cy="16" r="4" fill="#0F172A" />
                          <circle cx="32" cy="16" r="4" fill="#0F172A" />
                          <polygon points="10,4 16,-2 28,-2 34,4" fill="#60A5FA" />
                        </g>

                        {/* Line of Sight (Diagonal Downward) */}
                        <line x1={towerX} y1={towerTopY - 12} x2={carX} y2={groundY} stroke="#EF4444" strokeWidth="3" />

                        {/* Angle of Depression Arc at Top */}
                        <path
                          d={`M ${towerX + 50} ${towerTopY - 12} A 50 50 0 0 1 ${towerX + 50 * Math.cos(deprRad)} ${towerTopY - 12 + 50 * Math.sin(deprRad)}`}
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="2.5"
                        />
                        <text x={towerX + 58} y={towerTopY + 10} fill="#EF4444" fontSize="13" fontWeight="bold">
                          α = {fmt(deprAngle)}°
                        </text>

                        {/* Alternate Interior Angle Arc at Car (Ground) */}
                        <path
                          d={`M ${carX - 45} ${groundY} A 45 45 0 0 1 ${carX - 45 * Math.cos(deprRad)} ${groundY - 45 * Math.sin(deprRad)}`}
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                        />
                        <text x={carX - 60} y={groundY - 12} fill="#2563EB" fontSize="13" fontWeight="bold">
                          α = {fmt(deprAngle)}°
                        </text>

                        {/* Dimension: Tower Height H */}
                        <line x1={towerX - 45} y1={towerTopY} x2={towerX - 45} y2={groundY} stroke="#142D4E" strokeWidth="2" />
                        <line x1={towerX - 52} y1={towerTopY} x2={towerX - 38} y2={towerTopY} stroke="#142D4E" strokeWidth="2" />
                        <line x1={towerX - 52} y1={groundY} x2={towerX - 38} y2={groundY} stroke="#142D4E" strokeWidth="2" />
                        <text x={towerX - 58} y={(towerTopY + groundY) / 2} fill="#142D4E" fontSize="13" fontWeight="bold" textAnchor="end">
                          H = {fmt(deprTowerH)} m
                        </text>

                        {/* Dimension: Distance d */}
                        <line x1={towerX} y1={groundY + 22} x2={carX} y2={groundY + 22} stroke="#167C80" strokeWidth="2" />
                        <line x1={towerX} y1={groundY + 15} x2={towerX} y2={groundY + 29} stroke="#167C80" strokeWidth="2" />
                        <line x1={carX} y1={groundY + 15} x2={carX} y2={groundY + 29} stroke="#167C80" strokeWidth="2" />
                        <text x={(towerX + carX) / 2} y={groundY + 40} fill="#167C80" fontSize="13" fontWeight="bold" textAnchor="middle">
                          d = {fmt(deprDist.toFixed(2))} m
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* FORMULA CARD */}
              <div className="w-full mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="text-sm font-semibold text-indigo-900 mb-1">
                  {L('अवनति कोण तथा एकान्तर कोण सिद्धान्त:', 'Alternate Interior Angles Principle:')}
                </div>
                <div className="text-xs sm:text-sm text-indigo-950 space-y-1">
                  <div>
                    {L(
                      'शीर्ष क्षितिज रेखा र जमिनको सतह समानान्तर हुने भएकाले अवनति कोण र जमिनमा बन्ने उन्नतांश कोण आपसमा बराबर हुन्छन् (एकान्तर कोण)।',
                      'Since the horizontal line of sight at top is parallel to the ground surface, the angle of depression equals the angle of elevation (alternate angles).'
                    )}
                  </div>
                  <div className="font-bold text-[#142D4E] pt-1">
                    d = H / tan(α) = {fmt(deprTowerH)} / tan({fmt(deprAngle)}°) ={' '}
                    <span className="text-indigo-700 font-extrabold">{fmt(deprDist.toFixed(2))} m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h4 className="font-bold text-[#142D4E] text-sm uppercase tracking-wider">
                  {L('स्तम्भ र कोण नियन्त्रण', 'Tower & Angle Controls')}
                </h4>

                {/* Tower Height */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{L('धरहरा/स्तम्भको उचाइ (H):', 'Tower Height (H):')}</span>
                    <span className="text-slate-800 font-bold">{fmt(deprTowerH)} m</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={deprTowerH}
                    onChange={(e) => setDeprTowerH(Number(e.target.value))}
                    className="w-full accent-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>१० मि</span>
                    <span>६० मि</span>
                  </div>
                </div>

                {/* Angle of Depression */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{L('अवनति कोण (α):', 'Angle of Depression (α):')}</span>
                    <span className="text-rose-600 font-bold">{fmt(deprAngle)}°</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="70"
                    step="1"
                    value={deprAngle}
                    onChange={(e) => setDeprAngle(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                  <div className="flex gap-2 mt-2">
                    {[30, 45, 60].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setDeprAngle(deg)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                          deprAngle === deg ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {fmt(deg)}°
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculated Values */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{L('धरहरादेखि कारको दूरी:', 'Distance to car:')}</span>
                    <span className="font-bold text-teal-700">{fmt(deprDist.toFixed(2))} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{L('दृष्टि दूरी (Hypotenuse):', 'Direct distance:')}</span>
                    <span className="font-bold text-slate-700">{fmt(deprHypot.toFixed(2))} m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: VIRTUAL CLINOMETER ────────────────────────────────────────── */}
        {activeTab === 'clinometer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#142D4E] text-base sm:text-lg">
                  {L('क्लाइनोमिटर (Clinometer) यन्त्र सिमुलेटर', 'Virtual Clinometer Sighting Simulator')}
                </h3>
                <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-semibold">
                  θ = 90° - Plumb Angle
                </span>
              </div>

              {/* CLINOMETER SVG */}
              <div className="w-full bg-[#FFFBEB] rounded-xl p-3 border border-amber-200 flex justify-center">
                <svg viewBox="0 0 500 320" className="w-full max-w-[500px] h-[300px] select-none">
                  <defs>
                    <radialGradient id="plumbGrad">
                      <stop offset="0%" stopColor="#94A3B8" />
                      <stop offset="100%" stopColor="#334155" />
                    </radialGradient>
                  </defs>

                  {/* Sighting Tube (Tilted by clinoAngle) */}
                  <g transform={`translate(250, 160) rotate(${-clinoAngle})`}>
                    {/* Sighting Straw / Tube */}
                    <rect x="-180" y="-8" width="360" height="16" fill="#1E293B" rx="3" />
                    <line x1="-180" y1="0" x2="180" y2="0" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4,4" />

                    {/* Sighting Eye Icon at left */}
                    <circle cx="-195" cy="0" r="10" fill="#D97706" />
                    <circle cx="-195" cy="0" r="4" fill="#FFFFFF" />

                    {/* Target Arrow at right */}
                    <polygon points="190,0 178,-6 178,6" fill="#DC2626" />

                    {/* Semi-Circular Protractor attached under the tube */}
                    {/* Centered at (0, 0), extends downwards */}
                    <path d="M -140 0 A 140 140 0 0 0 140 0 Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="3" opacity="0.95" />

                    {/* Protractor degree tick marks */}
                    {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180].map((deg) => {
                      const rad = (deg * Math.PI) / 180;
                      const x1 = -140 * Math.cos(rad);
                      const y1 = 140 * Math.sin(rad);
                      const x2 = -125 * Math.cos(rad);
                      const y2 = 125 * Math.sin(rad);
                      return (
                        <g key={deg}>
                          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth={deg % 30 === 0 ? '2' : '1'} />
                          {deg % 30 === 0 && (
                            <text
                              x={-112 * Math.cos(rad)}
                              y={112 * Math.sin(rad) + 4}
                              fill="#1E293B"
                              fontSize="10"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {deg}°
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Center Pivot Point */}
                    <circle cx="0" cy="0" r="6" fill="#DC2626" />
                  </g>

                  {/* Plumb Line (String with Bob) - Always hangs VERTICALLY under gravity */}
                  <g transform="translate(250, 160)">
                    {/* The plumb line hangs straight down */}
                    <line x1="0" y1="0" x2="0" y2="135" stroke="#DC2626" strokeWidth="2.5" />
                    {/* Heavy Plumb Bob */}
                    <circle cx="0" cy="140" r="10" fill="url(#plumbGrad)" />
                    <polygon points="0,154 -7,140 7,140" fill="url(#plumbGrad)" />
                  </g>

                  {/* Angle Reading Overlay */}
                  <rect x="20" y="20" width="180" height="60" fill="#FFFFFF" rx="8" stroke="#E2E8F0" />
                  <text x="30" y="42" fill="#142D4E" fontSize="12" fontWeight="bold">
                    {L('उन्नतांश कोण (Elevation):', 'Elevation Angle:')} {fmt(clinoAngle)}°
                  </text>
                  <text x="30" y="64" fill="#B45309" fontSize="11" fontWeight="bold">
                    {L('प्लम लाइन कोण:', 'Plumb line reading:')} {fmt(clinoPlumbAngle)}°
                  </text>
                </svg>
              </div>

              {/* EXPERIMENTAL PROCEDURE */}
              <div className="w-full mt-4 p-4 bg-white border border-gray-200 rounded-xl space-y-2 text-xs sm:text-sm">
                <div className="font-bold text-[#142D4E]">
                  {L('क्लाइनोमिटर प्रयोग विधि (Experimental Steps):', 'How to use a Clinometer in field:')}
                </div>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>
                    {L(
                      'स्ट्र / नलीबाट वस्तुको टुप्पोलाई सिधा दृष्टि रेखामा हेर्नुहोस्।',
                      'Sight the top of the object through the straw / tube.'
                    )}
                  </li>
                  <li>
                    {L(
                      'प्लम लाइन ठाडो रहँदा प्रोटेक्टरमा देखाएको कोण नोट गर्नुहोस् (उन्नतांश कोण = ९०° - प्लम लाइन कोण)।',
                      'Read the plumb line angle (Angle of elevation θ = 90° - plumb line reading).'
                    )}
                  </li>
                  <li>
                    {L(
                      'वस्तुको फेदसम्मको दूरी (d) फित्ताले नाप्नुहोस् र उचाइ = d tan θ + आँखाको उचाइ सूत्र लगाउनुहोस्।',
                      'Measure ground distance d with tape and calculate Height = d tan θ + eye height.'
                    )}
                  </li>
                </ol>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h4 className="font-bold text-[#142D4E] text-sm uppercase tracking-wider">
                  {L('सिमुलेटर नियन्त्रण', 'Simulator Controls')}
                </h4>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{L('दृष्टि कोण (Sight Tilt θ):', 'Sight Tilt (θ):')}</span>
                    <span className="text-rose-600 font-bold">{fmt(clinoAngle)}°</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="1"
                    value={clinoAngle}
                    onChange={(e) => setClinoAngle(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{L('फेदसम्मको दूरी (d):', 'Distance to tree (d):')}</span>
                    <span className="text-teal-700 font-bold">{fmt(clinoDist)} m</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="1"
                    value={clinoDist}
                    onChange={(e) => setClinoDist(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5 text-xs">
                  <div className="text-teal-900 font-bold">{L('गणना गरिएको उचाइ:', 'Calculated Height:')}</div>
                  <div className="text-gray-700">
                    d × tan(θ) + e = {fmt(clinoDist)} × tan({fmt(clinoAngle)}°) + {fmt(clinoEyeH)}
                  </div>
                  <div className="text-lg font-black text-[#142D4E]">{fmt(clinoHeight.toFixed(2))} m</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: BROKEN TREE PROBLEM ──────────────────────────────────────── */}
        {activeTab === 'brokenTree' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#142D4E] text-base sm:text-lg">
                  {L('हावाले भाँचेको रुख समस्या (Broken Tree Problem)', 'Broken Tree by Wind Storm Problem')}
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold">
                  H = x + y = d(tan θ + sec θ)
                </span>
              </div>

              {/* BROKEN TREE SVG */}
              <div className="w-full bg-[#ECFDF5] rounded-xl p-2 border border-emerald-200 overflow-x-auto flex justify-center">
                <svg viewBox="0 0 650 340" className="w-full max-w-[620px] h-[320px] select-none">
                  {/* Ground */}
                  <line x1="20" y1="280" x2="620" y2="280" stroke="#047857" strokeWidth="3" />
                  <rect x="20" y="280" width="600" height="40" fill="#D1FAE5" />

                  {(() => {
                    const footX = 180;
                    const groundY = 280;

                    // scale factor
                    const scale = 7;
                    const trunkH_px = Math.min(180, brokenTrunk * scale);
                    const breakY = groundY - trunkH_px;
                    const tipX = footX + brokenDist * scale;

                    return (
                      <g>
                        {/* Standing Trunk (Vertical) */}
                        <line x1={footX} y1={groundY} x2={footX} y2={breakY} stroke="#78350F" strokeWidth="12" strokeLinecap="round" />
                        <line x1={footX - 2} y1={groundY} x2={footX - 2} y2={breakY} stroke="#92400E" strokeWidth="4" />

                        {/* Broken Top (Hypotenuse to ground at tipX) */}
                        <line x1={footX} y1={breakY} x2={tipX} y2={groundY} stroke="#15803D" strokeWidth="10" strokeLinecap="round" />

                        {/* Foliage / Leaves near the tip */}
                        <circle cx={tipX - 15} cy={groundY - 15} r="20" fill="#22C55E" opacity="0.8" />
                        <circle cx={tipX - 35} cy={groundY - 25} r="18" fill="#16A34A" opacity="0.8" />
                        <circle cx={tipX} cy={groundY - 5} r="12" fill="#15803D" opacity="0.9" />

                        {/* Tree Foot & Break Labels */}
                        <circle cx={footX} cy={groundY} r="4" fill="#000" />
                        <text x={footX - 14} y={groundY + 16} fill="#000" fontSize="12" fontWeight="bold">
                          B (फेद)
                        </text>

                        <circle cx={footX} cy={breakY} r="4" fill="#EF4444" />
                        <text x={footX - 20} y={breakY - 4} fill="#EF4444" fontSize="12" fontWeight="bold">
                          C (भाँचिएको ठाउँ)
                        </text>

                        <circle cx={tipX} cy={groundY} r="4" fill="#000" />
                        <text x={tipX + 8} y={groundY + 16} fill="#000" fontSize="12" fontWeight="bold">
                          A (टुप्पो)
                        </text>

                        {/* Angle Arc at tip A */}
                        <path
                          d={`M ${tipX - 35} ${groundY} A 35 35 0 0 1 ${tipX - 35 * Math.cos(brokenRad)} ${groundY - 35 * Math.sin(brokenRad)}`}
                          fill="none"
                          stroke="#E11D48"
                          strokeWidth="2.5"
                        />
                        <text x={tipX - 52} y={groundY - 10} fill="#E11D48" fontSize="12" fontWeight="bold">
                          {fmt(brokenAngle)}°
                        </text>

                        {/* Dimension: Standing Trunk x */}
                        <text x={footX - 16} y={(groundY + breakY) / 2} fill="#78350F" fontSize="12" fontWeight="bold" textAnchor="end">
                          x = {fmt(brokenTrunk.toFixed(2))} m
                        </text>

                        {/* Dimension: Broken Hypotenuse y */}
                        <text
                          x={(footX + tipX) / 2 + 10}
                          y={(breakY + groundY) / 2 - 14}
                          fill="#15803D"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          y = {fmt(brokenPart.toFixed(2))} m
                        </text>

                        {/* Dimension: Distance d */}
                        <line x1={footX} y1={groundY + 22} x2={tipX} y2={groundY + 22} stroke="#142D4E" strokeWidth="2" />
                        <text x={(footX + tipX) / 2} y={groundY + 38} fill="#142D4E" fontSize="12" fontWeight="bold" textAnchor="middle">
                          d = {fmt(brokenDist)} m
                        </text>

                        {/* Right angle symbol at B */}
                        <rect x={footX} y={groundY - 14} width="14" height="14" fill="none" stroke="#78350F" strokeWidth="1.5" />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* STEP-BY-STEP CALCULATION */}
              <div className="w-full mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="text-sm font-bold text-emerald-900">
                  {L('पाठ्यपुस्तक समाधान चरणहरू:', 'Step-by-Step CDC Textbook Solution:')}
                </div>
                <div className="text-xs sm:text-sm text-gray-800 space-y-1 font-mono">
                  <div>
                    १. उभिएको भाग (Trunk) x = d × tan({fmt(brokenAngle)}°) = {fmt(brokenDist)} × {fmt(Math.tan(brokenRad).toFixed(4))} ={' '}
                    <strong>{fmt(brokenTrunk.toFixed(2))} m</strong>
                  </div>
                  <div>
                    २. ढलेको भाग (Fallen) y = d / cos({fmt(brokenAngle)}°) = {fmt(brokenDist)} / {fmt(Math.cos(brokenRad).toFixed(4))} ={' '}
                    <strong>{fmt(brokenPart.toFixed(2))} m</strong>
                  </div>
                  <div className="pt-1 text-[#142D4E] font-bold border-t border-emerald-200">
                    ३. रुखको कुल प्रारम्भिक उचाइ (Total Height) H = x + y = {fmt(brokenTrunk.toFixed(2))} + {fmt(brokenPart.toFixed(2))} ={' '}
                    <span className="text-emerald-700 text-base font-extrabold">{fmt(brokenTotalH.toFixed(2))} m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h4 className="font-bold text-[#142D4E] text-sm uppercase tracking-wider">
                  {L('रुखका मानहरू फेर्नुहोस्', 'Modify Tree Values')}
                </h4>

                {/* Distance d */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{L('फेदबाट छोएको दूरी (d):', 'Distance to tip (d):')}</span>
                    <span className="text-emerald-700 font-bold">{fmt(brokenDist)} m</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={brokenDist}
                    onChange={(e) => setBrokenDist(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* Angle θ */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{L('जमिनसँग बनाएको कोण (θ):', 'Angle with ground (θ):')}</span>
                    <span className="text-rose-600 font-bold">{fmt(brokenAngle)}°</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[30, 45, 60].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setBrokenAngle(deg)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                          brokenAngle === deg ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {fmt(deg)}°
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-950 space-y-1">
                  <div className="font-bold">💡 {L('परीक्षामा सोधिने प्रश्न', 'SEE Exam Special')}</div>
                  <p className="text-[11px] leading-relaxed">
                    {L(
                      'एसईई परीक्षामा रुख, बिजुलीको खम्बा वा झण्डाको खम्बा हावाले भाँचिएको प्रश्न बारम्बार सोधिने महत्वपूर्ण ४ अङ्कको प्रश्न हो।',
                      'This broken tree/pole problem is a classic high-yield 4-mark question frequently asked in SEE examinations.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: CIRCULAR POND ────────────────────────────────────────────── */}
        {activeTab === 'circularPond' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#142D4E] text-base sm:text-lg">
                  {L('वृत्ताकार पोखरी र केन्द्रको स्तम्भ', 'Circular Pond and Central Pillar')}
                </h3>
                <span className="text-xs bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-semibold">
                  r = D / 2, h = r tan θ
                </span>
              </div>

              {/* POND SVG */}
              <div className="w-full bg-[#ECFEFF] rounded-xl p-2 border border-cyan-200 overflow-x-auto flex justify-center">
                <svg viewBox="0 0 650 340" className="w-full max-w-[620px] h-[320px] select-none">
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#0891B2" />
                    </linearGradient>
                  </defs>

                  {/* Circular Pond in Perspective (Ellipse) */}
                  <ellipse cx="325" cy="250" rx="220" ry="60" fill="url(#waterGrad)" opacity="0.6" stroke="#0891B2" strokeWidth="3" />

                  {/* Bank Edge Outline */}
                  <ellipse cx="325" cy="250" rx="230" ry="65" fill="none" stroke="#155E75" strokeWidth="2" strokeDasharray="5,3" />

                  {/* Central Pillar at (325, 250) */}
                  {(() => {
                    const centerX = 325;
                    const centerY = 250;
                    const poleH_px = Math.min(190, (pondPoleHeight / 40) * 160);
                    const poleTopY = centerY - poleH_px;
                    const bankX = centerX - 220; // left bank edge

                    return (
                      <g>
                        {/* Pole Base Pedestal */}
                        <rect x={centerX - 14} y={centerY - 10} width="28" height="20" fill="#64748B" rx="2" />
                        {/* Pole / Pillar Column */}
                        <line x1={centerX} y1={centerY} x2={centerX} y2={poleTopY} stroke="#1E293B" strokeWidth="12" strokeLinecap="round" />
                        {/* Pillar Cap & Light */}
                        <polygon points={`${centerX},${poleTopY - 14} ${centerX - 10},${poleTopY} ${centerX + 10},${poleTopY}`} fill="#D9A441" />
                        <circle cx={centerX} cy={poleTopY - 16} r="5" fill="#EF4444" />

                        {/* Person standing on Left Bank */}
                        <g transform={`translate(${bankX - 10}, ${centerY - 35})`}>
                          <circle cx="10" cy="5" r="5" fill="#142D4E" />
                          <line x1="10" y1="10" x2="10" y2="26" stroke="#142D4E" strokeWidth="3" />
                          <line x1="10" y1="26" x2="5" y2="35" stroke="#142D4E" strokeWidth="2.5" />
                          <line x1="10" y1="26" x2="15" y2="35" stroke="#142D4E" strokeWidth="2.5" />
                        </g>

                        {/* Line of Sight from Bank to Top of Pole */}
                        <line x1={bankX} y1={centerY - 25} x2={centerX} y2={poleTopY} stroke="#EF4444" strokeWidth="2.5" />

                        {/* Radius line on water surface */}
                        <line x1={bankX} y1={centerY} x2={centerX} y2={centerY} stroke="#0369A1" strokeWidth="2" strokeDasharray="4,4" />
                        <text x={(bankX + centerX) / 2} y={centerY + 18} fill="#0369A1" fontSize="11" fontWeight="bold" textAnchor="middle">
                          r = D/2 = {fmt(pondRadius)} m
                        </text>

                        {/* Diameter Dimension across Pond */}
                        <line x1={bankX} y1={centerY + 35} x2={centerX + 220} y2={centerY + 35} stroke="#0891B2" strokeWidth="2" />
                        <text x={centerX} y={centerY + 50} fill="#0891B2" fontSize="12" fontWeight="bold" textAnchor="middle">
                          {L('व्यास (Diameter D)', 'Diameter D')} = {fmt(pondDiameter)} m
                        </text>

                        {/* Angle Arc at Bank */}
                        <path
                          d={`M ${bankX + 40} ${centerY - 25} A 40 40 0 0 0 ${bankX + 35} ${centerY - 45}`}
                          fill="none"
                          stroke="#E11D48"
                          strokeWidth="2"
                        />
                        <text x={bankX + 45} y={centerY - 32} fill="#E11D48" fontSize="12" fontWeight="bold">
                          θ = {fmt(pondAngle)}°
                        </text>

                        {/* Pillar Height Dimension */}
                        <line x1={centerX + 35} y1={poleTopY} x2={centerX + 35} y2={centerY} stroke="#142D4E" strokeWidth="2" />
                        <text x={centerX + 44} y={(poleTopY + centerY) / 2 + 4} fill="#142D4E" fontSize="13" fontWeight="bold">
                          h = {fmt(pondPoleHeight.toFixed(2))} m
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* CALCULATION CARD */}
              <div className="w-full mt-4 p-4 bg-cyan-50 border border-cyan-200 rounded-xl space-y-2">
                <div className="text-sm font-bold text-cyan-900">
                  {L('पोखरी र स्तम्भ उचाइ सूत्र (CDC Formula):', 'Pond & Pillar Height Formula:')}
                </div>
                <div className="text-xs sm:text-sm text-gray-800 space-y-1">
                  <div>
                    अर्धव्यास (Radius r) = व्यास / २ = {fmt(pondDiameter)} / २ = <strong>{fmt(pondRadius)} m</strong>
                  </div>
                  <div>
                    स्तम्भको उचाइ (Height h) = r × tan(θ) = {fmt(pondRadius)} × tan({fmt(pondAngle)}°) ={' '}
                    <span className="text-cyan-800 font-extrabold text-base">{fmt(pondPoleHeight.toFixed(2))} m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h4 className="font-bold text-[#142D4E] text-sm uppercase tracking-wider">
                  {L('पोखरीको नाप नियन्त्रण', 'Pond Measurements')}
                </h4>

                {/* Diameter */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{L('पोखरीको व्यास (Diameter D):', 'Pond Diameter (D):')}</span>
                    <span className="text-cyan-700 font-bold">{fmt(pondDiameter)} m</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="2"
                    value={pondDiameter}
                    onChange={(e) => setPondDiameter(Number(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>

                {/* Angle */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>{L('उन्नतांश कोण (θ):', 'Angle of Elevation (θ):')}</span>
                    <span className="text-rose-600 font-bold">{fmt(pondAngle)}°</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[30, 45, 60].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setPondAngle(deg)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                          pondAngle === deg ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {fmt(deg)}°
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200 text-xs space-y-1">
                  <div className="text-cyan-900 font-bold">{L('पाठ्यपुस्तक सन्दर्भ:', 'Textbook Context:')}</div>
                  <p className="text-cyan-800 leading-relaxed text-[11px]">
                    {L(
                      'पोखरीको डिलबाट केन्द्रसम्मको दूरी पोखरीको अर्धव्यास (Radius) बराबर हुन्छ। तसर्थ क्षितिज दूरी d = r = D/2 मानिन्छ।',
                      'The horizontal distance from the bank of a circular pond to its central pillar equals the radius (r = D/2).'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: CHALLENGE & QUIZ ─────────────────────────────────────────── */}
        {activeTab === 'challenge' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-bold text-lg text-[#142D4E]">
                  {L('उचाइ र दूरी अभ्यास प्रश्नहरू', 'Heights & Distances Practice Quiz')}
                </h3>
                <p className="text-xs text-gray-500">
                  {L('पाठ्यक्रम विकास केन्द्रको पाठ्यपुस्तक अनुसार ४ महत्वपूर्ण प्रश्नहरू', '4 key textbook questions with full solutions')}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                <span className="text-xl">🏆</span>
                <span className="font-bold text-amber-900 text-sm">
                  {L('अङ्क:', 'Score:')} {fmt(score)} / {fmt(100)}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {quizQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="font-semibold text-gray-900 text-sm">{L(q.qNp, q.qEn)}</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[idx] === optIdx;
                      let btnStyle = 'bg-white hover:bg-gray-100 border-gray-200 text-gray-800';
                      if (selectedAnswers[idx] !== undefined) {
                        if (opt.correct) btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                        else if (isSelected) btnStyle = 'bg-rose-100 border-rose-400 text-rose-900';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={selectedAnswers[idx] !== undefined}
                          onClick={() => handleSelectQuizOption(idx, optIdx, opt.correct)}
                          className={`p-3 text-left text-xs rounded-xl border transition-all ${btnStyle}`}
                        >
                          {L(opt.np, opt.en)}
                        </button>
                      );
                    })}
                  </div>

                  {showFeedback[idx] && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                      <strong>💡 {L('समाधान व्याख्या:', 'Solution Explanation:')}</strong> {L(q.hintNp, q.hintEn)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
