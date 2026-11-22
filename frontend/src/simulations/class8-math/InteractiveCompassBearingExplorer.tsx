import React, { useState, useRef } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Compass, Navigation, ArrowUpRight, RotateCw, CheckCircle, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दिगंश (Bearing) मापन गर्दा कुन दिशाबाट कुन दिशातर्फ कोण नापिन्छ?',
    en: 'From which direction and in which way is bearing measured?',
    options: [
      { key: 'A', label: 'उत्तर दिशाबाट घडीको दिशामा (Clockwise from North)' },
      { key: 'B', label: 'पूर्व दिशाबाट घडीको विपरित दिशामा' },
      { key: 'C', label: 'दक्षिण दिशाबाट घडीको दिशामा' },
      { key: 'D', label: 'उत्तर दिशाबाट घडीको विपरित दिशामा' },
    ],
    answer: 'A',
  },
  {
    np: 'पूर्व (East) दिशाको ३-अङ्कीय दिगंश (Three-figure bearing) कति हुन्छ?',
    en: 'What is the three-figure bearing of East?',
    options: [
      { key: 'A', label: '०९०° (090°)' },
      { key: 'B', label: '९०° (90°)' },
      { key: 'C', label: '१८०° (180°)' },
      { key: 'D', label: '०४५° (045°)' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि बिन्दु A बाट B को दिगंश ०६०° (060°) भए, B बाट A को विपरित दिगंश (Reverse Bearing) कति हुन्छ?',
    en: 'If the bearing of B from A is 060°, what is the reverse bearing of A from B?',
    options: [
      { key: 'A', label: '२४०° (060° + 180° = 240°)' },
      { key: 'B', label: '१२०°' },
      { key: 'C', label: '३००°' },
      { key: 'D', label: '०६०°' },
    ],
    answer: 'A',
  },
  {
    np: 'दक्षिण-पश्चिम (South-West) दिशाको दिगंश कति हुन्छ?',
    en: 'What is the bearing of South-West (SW)?',
    options: [
      { key: 'A', label: '२२५° (180° + 45° = 225°)' },
      { key: 'B', label: '१३५°' },
      { key: 'C', label: '३१५°' },
      { key: 'D', label: '०४५°' },
    ],
    answer: 'A',
  },
];

interface Point {
  x: number;
  y: number;
}

export const InteractiveCompassBearingExplorer: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U20-01',
    chapter: 20,
    titleNp: 'कम्पास र दिगंश अन्वेषक',
    titleEn: 'Interactive Compass and Bearing Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'compass' | 'two_point' | 'challenge'>('compass');

  // Single Compass explorer angle (0 to 359)
  const [bearingAngle, setBearingAngle] = useState<number>(45);

  // Two-point workspace (Point A: Start, Point B: Target)
  const [pointA, setPointA] = useState<Point>({ x: 180, y: 300 });
  const [pointB, setPointB] = useState<Point>({ x: 380, y: 150 });
  const [draggingPoint, setDraggingPoint] = useState<'A' | 'B' | null>(null);

  // Challenge mode
  const [targetBearing, setTargetBearing] = useState<number>(120);
  const [challengeScore, setChallengeScore] = useState<number>(0);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  // Helper format 3-digit bearing string
  const formatBearing = (deg: number) => {
    const rounded = Math.round(((deg % 360) + 360) % 360);
    return rounded.toString().padStart(3, '0') + '°';
  };

  // Get direction name from bearing
  const getDirectionName = (deg: number) => {
    const norm = Math.round(((deg % 360) + 360) % 360);
    if (norm >= 338 || norm <= 22) return { np: 'उत्तर (North)', en: 'North (N)' };
    if (norm >= 23 && norm <= 67) return { np: 'उत्तर-पूर्व (North-East)', en: 'North-East (NE)' };
    if (norm >= 68 && norm <= 112) return { np: 'पूर्व (East)', en: 'East (E)' };
    if (norm >= 113 && norm <= 157) return { np: 'दक्षिण-पूर्व (South-East)', en: 'South-East (SE)' };
    if (norm >= 158 && norm <= 202) return { np: 'दक्षिण (South)', en: 'South (S)' };
    if (norm >= 203 && norm <= 247) return { np: 'दक्षिण-पश्चिम (South-West)', en: 'South-West (SW)' };
    if (norm >= 248 && norm <= 292) return { np: 'पश्चिम (West)', en: 'West (W)' };
    return { np: 'उत्तर-पश्चिम (North-West)', en: 'North-West (NW)' };
  };

  // Calculate forward and reverse bearing between A and B
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y; // SVG y grows downward!
  // In screen SVG: North is along negative Y.
  // Clockwise angle from North: atan2(dx, -dy) in degrees
  let forwardAngleRad = Math.atan2(dx, -dy);
  let forwardBearing = (forwardAngleRad * 180) / Math.PI;
  if (forwardBearing < 0) forwardBearing += 360;
  forwardBearing = Math.round(forwardBearing);

  const reverseBearing = forwardBearing < 180 ? forwardBearing + 180 : forwardBearing - 180;
  const distancePx = Math.round(Math.hypot(dx, dy));

  // Compass SVG interaction
  const compassSvgRef = useRef<SVGSVGElement | null>(null);
  const handleCompassMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const mx = e.clientX - rect.left - cx;
    const my = e.clientY - rect.top - cy;
    let rad = Math.atan2(mx, -my);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;
    setBearingAngle(Math.round(deg));
  };

  // Two-point drag interaction
  const handleTwoPointMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingPoint) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(30, Math.min(rect.width - 30, e.clientX - rect.left));
    const y = Math.max(30, Math.min(rect.height - 30, e.clientY - rect.top));
    if (draggingPoint === 'A') {
      setPointA({ x, y });
    } else {
      setPointB({ x, y });
    }
  };

  const handleCheckChallenge = () => {
    const diff = Math.abs(bearingAngle - targetBearing);
    if (diff <= 3 || diff >= 357) {
      kit.good();
      setChallengeScore((s) => s + 1);
      setChallengeFeedback(L('🎉 शाबास! तपाईंले सही दिगंश मिलाउनुभयो!', '🎉 Excellent! You matched the target bearing!'));
      setTargetBearing(Math.floor(Math.random() * 24) * 15);
    } else {
      kit.oops();
      setChallengeFeedback(
        L(
          `❌ अझै मिलेन। तपाईंको दिगंश: ${formatBearing(bearingAngle)}, आवश्यक: ${formatBearing(targetBearing)}`,
          `❌ Not quite! Your bearing: ${formatBearing(bearingAngle)}, target: ${formatBearing(targetBearing)}`
        )
      );
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! उत्तर दिशाबाट घडीको दिशामा ३-अङ्क दिगंश (Three-digit Bearing) र विपरित दिगंशको हिसाब सिकौं!',
        'Hello! Explore clockwise three-digit bearings from North and master reverse bearings!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('compass')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'compass' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🧭 {L('१. कम्पास दिगंश अन्वेषक (Compass Explorer)', '1. Compass Explorer')}
          </button>
          <button
            onClick={() => setActiveTab('two_point')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'two_point' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📍 {L('२. दुई स्थान बीचको दिगंश (Two-Point Bearing & Reverse)', '2. Point-to-Point Bearing')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'challenge' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎯 {L('३. दिगंश चुनौती (Bearing Challenge)', '3. Bearing Challenge')}
          </button>
        </div>

        {/* Tab 1: Interactive Compass Dial */}
        {activeTab === 'compass' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 360-degree Compass Dial */}
            <div className="lg:col-span-7 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 flex flex-col items-center">
              <div className="text-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {L('कम्पास डायल घुमाउनुहोस् (Drag / Click to rotate needle)', 'Drag or click needle on the dial')}
                </span>
              </div>

              <svg
                ref={compassSvgRef}
                width={360}
                height={360}
                onMouseMove={handleCompassMouseMove}
                onClick={handleCompassMouseMove}
                className="cursor-crosshair select-none bg-slate-900 rounded-full shadow-inner border-4 border-slate-700"
              >
                {/* Dial outer circle */}
                <circle cx={180} cy={180} r={170} fill="#0f172a" stroke="#334155" strokeWidth="3" />
                <circle cx={180} cy={180} r={135} fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

                {/* Degree tick marks every 10 and 30 deg */}
                {Array.from({ length: 36 }, (_, i) => i * 10).map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const isMajor = deg % 30 === 0;
                  const r1 = isMajor ? 140 : 155;
                  const r2 = 168;
                  const x1 = 180 + r1 * Math.sin(rad);
                  const y1 = 180 - r1 * Math.cos(rad);
                  const x2 = 180 + r2 * Math.sin(rad);
                  const y2 = 180 - r2 * Math.cos(rad);

                  return (
                    <g key={deg}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isMajor ? '#f59e0b' : '#64748b'} strokeWidth={isMajor ? 2.5 : 1} />
                      {isMajor && (
                        <text
                          x={180 + 122 * Math.sin(rad)}
                          y={180 - 122 * Math.cos(rad) + 4}
                          fontSize="9"
                          fontWeight="bold"
                          fill="#cbd5e1"
                          textAnchor="middle"
                        >
                          {deg}°
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Cardinal direction labels */}
                <text x={180} y={35} fontSize="18" fontWeight="900" fill="#ef4444" textAnchor="middle">
                  N (उत्तर)
                </text>
                <text x={325} y={186} fontSize="16" fontWeight="bold" fill="#38bdf8" textAnchor="middle">
                  E (पूर्व)
                </text>
                <text x={180} y={335} fontSize="16" fontWeight="bold" fill="#38bdf8" textAnchor="middle">
                  S (दक्षिण)
                </text>
                <text x={35} y={186} fontSize="16" fontWeight="bold" fill="#38bdf8" textAnchor="middle">
                  W (पश्चिम)
                </text>

                {/* Clockwise angle sector arc from North (0 deg) to bearingAngle */}
                {(() => {
                  const rArc = 90;
                  const rad = (bearingAngle * Math.PI) / 180;
                  const xEnd = 180 + rArc * Math.sin(rad);
                  const yEnd = 180 - rArc * Math.cos(rad);
                  const largeArc = bearingAngle > 180 ? 1 : 0;
                  const path =
                    bearingAngle === 0
                      ? ''
                      : `M 180 90 A ${rArc} ${rArc} 0 ${largeArc} 1 ${xEnd} ${yEnd}`;
                  return (
                    <path
                      d={path}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeDasharray="4 2"
                      opacity="0.85"
                    />
                  );
                })()}

                {/* North reference line */}
                <line x1={180} y1={180} x2={180} y2={45} stroke="#ef4444" strokeWidth="2.5" strokeDasharray="3 3" />

                {/* Rotating direction pointer needle */}
                {(() => {
                  const rad = (bearingAngle * Math.PI) / 180;
                  const tipX = 180 + 130 * Math.sin(rad);
                  const tipY = 180 - 130 * Math.cos(rad);
                  const baseLeftX = 180 + 12 * Math.sin(rad - Math.PI / 2);
                  const baseLeftY = 180 - 12 * Math.cos(rad - Math.PI / 2);
                  const baseRightX = 180 + 12 * Math.sin(rad + Math.PI / 2);
                  const baseRightY = 180 - 12 * Math.cos(rad + Math.PI / 2);

                  return (
                    <g>
                      <polygon
                        points={`${tipX},${tipY} ${baseLeftX},${baseLeftY} 180,180`}
                        fill="#f59e0b"
                        stroke="#b45309"
                        strokeWidth="1.5"
                      />
                      <polygon
                        points={`${tipX},${tipY} ${baseRightX},${baseRightY} 180,180`}
                        fill="#d97706"
                        stroke="#b45309"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })()}

                {/* Center hub */}
                <circle cx={180} cy={180} r={10} fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              {/* Angle slider control */}
              <div className="w-full mt-4 max-w-sm">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>०° (North)</span>
                  <span className="text-amber-600 font-extrabold text-sm font-mono">{formatBearing(bearingAngle)}</span>
                  <span>३६०°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={bearingAngle}
                  onChange={(e) => setBearingAngle(parseInt(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {[
                  { label: '०४५° (NE)', deg: 45 },
                  { label: '०९०° (E)', deg: 90 },
                  { label: '१३५° (SE)', deg: 135 },
                  { label: '१८०° (S)', deg: 180 },
                  { label: '२२५° (SW)', deg: 225 },
                  { label: '२७०° (W)', deg: 270 },
                  { label: '३१५° (NW)', deg: 315 },
                ].map((item) => (
                  <button
                    key={item.deg}
                    onClick={() => setBearingAngle(item.deg)}
                    className={`px-2.5 py-1 text-xs rounded font-bold border transition-all ${
                      bearingAngle === item.deg
                        ? 'bg-amber-600 text-white border-amber-600 shadow'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Readout & Theory Explanation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-extrabold text-amber-950 text-sm mb-3 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-600" />
                  {L('दिगंश मान र दिशा (Bearing Value & Direction)', 'Bearing Value & Direction')}
                </h3>

                <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm text-center mb-3">
                  <span className="text-xs text-slate-500 font-semibold block">
                    {L('तीन-अङ्कीय दिगंश (Three-digit Bearing)', 'Three-digit Bearing')}
                  </span>
                  <div className="text-4xl font-extrabold text-amber-600 font-mono tracking-widest my-1">
                    {formatBearing(bearingAngle)}
                  </div>
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
                    {isNe ? getDirectionName(bearingAngle).np : getDirectionName(bearingAngle).en}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 bg-white/70 p-3 rounded-xl border border-amber-100">
                  <div className="flex justify-between">
                    <span className="font-semibold">{L('उत्तरबाट कोण (Angle from North):', 'Angle from North:')}</span>
                    <span className="font-bold text-slate-900">{bearingAngle}° (घडीको दिशा)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">{L('विपरित दिगंश (Reverse Bearing):', 'Reverse Bearing:')}</span>
                    <span className="font-bold text-indigo-700 font-mono">
                      {bearingAngle < 180 ? `${formatBearing(bearingAngle)} + 180° = ${formatBearing(bearingAngle + 180)}` : `${formatBearing(bearingAngle)} - 180° = ${formatBearing(bearingAngle - 180)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Core Textbook Rules Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm text-xs space-y-2.5">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-indigo-600" />
                  {L('दिगंशका मुख्य ३ नियमहरू (3 Key Rules of Bearing)', '3 Key Rules of Bearing')}
                </h4>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
                  <p className="font-medium text-slate-800">
                    <span className="font-bold text-indigo-600">१.</span> सधैं <b>उत्तर दिशा (North)</b> बाट सुरु गरिन्छ।
                  </p>
                  <p className="font-medium text-slate-800">
                    <span className="font-bold text-indigo-600">२.</span> सधैं <b>घडीको दिशा (Clockwise)</b> मा नापिन्छ।
                  </p>
                  <p className="font-medium text-slate-800">
                    <span className="font-bold text-indigo-600">३.</span> सधैं <b>३ अङ्क (Three Digits)</b> मा लेखिन्छ (जस्तै ३०° लाई <b>०३०°</b>)।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Two-Point Bearing & Reciprocal/Reverse Bearing */}
        {activeTab === 'two_point' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Canvas for point A and B */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg p-4 border border-slate-200 flex flex-col items-center">
              <div className="w-full flex justify-between items-center text-xs font-bold text-slate-600 mb-2 px-2">
                <span>{L('बिन्दु A (सुरुवात) वा B (गन्तव्य) लाई तान्नुहोस् (Drag Point A or B)', 'Drag Point A or Point B')}</span>
                <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  दूरी: {distancePx} px
                </span>
              </div>

              <svg
                width={560}
                height={400}
                onMouseMove={handleTwoPointMove}
                onMouseUp={() => setDraggingPoint(null)}
                className="max-w-full bg-slate-900 rounded-xl shadow-inner select-none cursor-crosshair border border-slate-800"
              >
                {/* Background Grid */}
                <defs>
                  <pattern id="grid-bearing" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                  </pattern>
                  <marker id="arrow-bearing" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                  </marker>
                  <marker id="arrow-north" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                  </marker>
                </defs>
                <rect width="560" height="400" fill="url(#grid-bearing)" />

                {/* North line at Point A */}
                <line
                  x1={pointA.x}
                  y1={pointA.y}
                  x2={pointA.x}
                  y2={pointA.y - 90}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  markerEnd="url(#arrow-north)"
                />
                <text x={pointA.x + 8} y={pointA.y - 80} fontSize="13" fontWeight="900" fill="#ef4444">
                  N (उत्तर)
                </text>

                {/* North line at Point B (for reverse bearing) */}
                <line
                  x1={pointB.x}
                  y1={pointB.y}
                  x2={pointB.x}
                  y2={pointB.y - 70}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  markerEnd="url(#arrow-north)"
                />
                <text x={pointB.x + 8} y={pointB.y - 60} fontSize="11" fontWeight="bold" fill="#ef4444">
                  N (उत्तर)
                </text>

                {/* Direct line from A to B */}
                <line
                  x1={pointA.x}
                  y1={pointA.y}
                  x2={pointB.x}
                  y2={pointB.y}
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  markerEnd="url(#arrow-bearing)"
                />

                {/* Forward Bearing Arc from North at A */}
                {(() => {
                  const r = 45;
                  const rad = (forwardBearing * Math.PI) / 180;
                  const xEnd = pointA.x + r * Math.sin(rad);
                  const yEnd = pointA.y - r * Math.cos(rad);
                  const largeArc = forwardBearing > 180 ? 1 : 0;
                  const path = `M ${pointA.x} ${pointA.y - r} A ${r} ${r} 0 ${largeArc} 1 ${xEnd} ${yEnd}`;
                  return (
                    <g>
                      <path d={path} fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2.5" />
                      <text
                        x={pointA.x + 25 * Math.sin(rad / 2)}
                        y={pointA.y - 25 * Math.cos(rad / 2) + 4}
                        fontSize="11"
                        fontWeight="bold"
                        fill="#fde047"
                        textAnchor="middle"
                      >
                        {formatBearing(forwardBearing)}
                      </text>
                    </g>
                  );
                })()}

                {/* Point A (Draggable) */}
                <g
                  onMouseDown={() => setDraggingPoint('A')}
                  className="cursor-move"
                >
                  <circle cx={pointA.x} cy={pointA.y} r={14} fill="#3b82f6" stroke="#ffffff" strokeWidth="3" />
                  <text x={pointA.x} y={pointA.y + 4} fontSize="12" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                    A
                  </text>
                  <text x={pointA.x - 25} y={pointA.y + 28} fontSize="11" fontWeight="bold" fill="#60a5fa">
                    सुरुवात (Start A)
                  </text>
                </g>

                {/* Point B (Draggable) */}
                <g
                  onMouseDown={() => setDraggingPoint('B')}
                  className="cursor-move"
                >
                  <circle cx={pointB.x} cy={pointB.y} r={14} fill="#10b981" stroke="#ffffff" strokeWidth="3" />
                  <text x={pointB.x} y={pointB.y + 4} fontSize="12" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                    B
                  </text>
                  <text x={pointB.x - 30} y={pointB.y + 28} fontSize="11" fontWeight="bold" fill="#34d399">
                    गन्तव्य (Target B)
                  </text>
                </g>
              </svg>
            </div>

            {/* Calculations and reverse bearing breakdown */}
            <div className="lg:col-span-4 space-y-4">
              {/* Forward Bearing Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                  १. A बाट B को दिगंश (Bearing of B from A)
                </span>
                <div className="text-3xl font-extrabold text-amber-600 font-mono my-1">
                  {formatBearing(forwardBearing)}
                </div>
                <p className="text-xs text-amber-900">
                  बिन्दु A को उत्तर दिशा रेखाबाट घडीको दिशामा नाप्दा।
                </p>
              </div>

              {/* Reverse Bearing Card */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 shadow-sm">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
                  २. B बाट A को विपरित दिगंश (Reverse Bearing of A from B)
                </span>
                <div className="text-3xl font-extrabold text-indigo-600 font-mono my-1">
                  {formatBearing(reverseBearing)}
                </div>
                <div className="mt-2 text-xs text-indigo-950 bg-white/80 p-2.5 rounded-lg border border-indigo-200">
                  <span className="font-bold">गणितीय हिसाब:</span>
                  <div className="font-mono mt-1 font-semibold text-indigo-900">
                    {forwardBearing < 180 ? (
                      <span>{formatBearing(forwardBearing)} + १८०° = {formatBearing(reverseBearing)}</span>
                    ) : (
                      <span>{formatBearing(forwardBearing)} - १८०° = {formatBearing(reverseBearing)}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    {forwardBearing < 180 ? '१८०° भन्दा सानो भएमा १८०° जोडिन्छ।' : '१८०° वा सोभन्दा ठूलो भएमा १८०° घटाइन्छ।'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bearing Challenge */}
        {activeTab === 'challenge' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                {L('दिगंश परीक्षण (Bearing Precision Challenge)', 'Bearing Precision Challenge')}
              </span>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">
                {L(`लक्ष्य दिगंश: ${formatBearing(targetBearing)} सेट गर्नुहोस्`, `Set the needle to ${formatBearing(targetBearing)}`)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {L('कम्पासको सुई घुमाएर तोकिएको दिगंश कोणमा मिलाउनुहोस् र जाँच गर्नुहोस्।', 'Rotate the compass needle to match the target bearing.')}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-3xl font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-6 py-2 rounded-xl mb-4">
                तपाईंको कोण: {formatBearing(bearingAngle)}
              </div>

              <input
                type="range"
                min="0"
                max="359"
                value={bearingAngle}
                onChange={(e) => {
                  setBearingAngle(parseInt(e.target.value));
                  setChallengeFeedback(null);
                }}
                className="w-full max-w-md accent-amber-600 cursor-pointer"
              />
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleCheckChallenge}
                className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow transition-all"
              >
                {L('जाँच गर्नुहोस् (Check Answer)', 'Check Answer')}
              </button>
              <button
                onClick={() => {
                  setTargetBearing(Math.floor(Math.random() * 24) * 15);
                  setChallengeFeedback(null);
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm border"
              >
                {L('नयाँ कोण (New Angle)', 'New Angle')}
              </button>
            </div>

            {challengeFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold text-center border ${
                  challengeFeedback.includes('🎉')
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {challengeFeedback}
              </div>
            )}

            <div className="text-center text-xs font-semibold text-slate-500">
              सफल प्रयासहरू: <span className="text-amber-600 font-bold">{challengeScore}</span>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default InteractiveCompassBearingExplorer;
