import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Compass, Navigation, Map, Award, CheckCircle, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एक व्यक्ति बिन्दु A बाट १२०° को दिगंशमा ५०० मिटर हिँडेर बिन्दु B मा पुग्छ। B बाट A फर्कन कुन दिगंशमा हिँड्नुपर्छ?',
    en: 'A person walks 500 m on bearing 120° from A to B. On what bearing should they return from B to A?',
    options: [
      { key: 'A', label: '३००° (120° + 180° = 300°)' },
      { key: 'B', label: '०६०°' },
      { key: 'C', label: '२४०°' },
      { key: 'D', label: '१८०°' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि १ सेमी = ५० मिटर मापनमा नक्सा बनाउँदा ३०० मिटर दूरी कति लामो रेखाले खिच्नुपर्छ?',
    en: 'On a scale of 1 cm = 50 m, what length line represents 300 m on the map?',
    options: [
      { key: 'A', label: '६ सेमी (300 ÷ 50 = 6 cm)' },
      { key: 'B', label: '१५ सेमी' },
      { key: 'C', label: '३ सेमी' },
      { key: 'D', label: '३० सेमी' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै स्थान मूलबिन्दुबाट ०४५° को दिगंशमा छ भने त्यो कुन दिशामा पर्दछ?',
    en: 'If a place is on a bearing of 045° from the origin, in which direction does it lie?',
    options: [
      { key: 'A', label: 'उत्तर-पूर्व (North-East / NE)' },
      { key: 'B', label: 'दक्षिण-पूर्व' },
      { key: 'C', label: 'उत्तर-पश्चिम' },
      { key: 'D', label: 'पूर्व' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि यात्रा A बाट B र त्यसपछि B बाट C गरिन्छ भने यसलाई के भनिन्छ?',
    en: 'When a journey proceeds from A to B and then B to C, what is this called?',
    options: [
      { key: 'A', label: 'बहु-चरणे यात्रा / मार्ग रेखाङ्कन (Multi-leg Navigation)' },
      { key: 'B', label: 'सीधा विस्थापन' },
      { key: 'C', label: 'परिक्रमण' },
      { key: 'D', label: 'परावर्तन' },
    ],
    answer: 'A',
  },
];

interface Waypoint {
  nameNp: string;
  nameEn: string;
  icon: string;
  bearingDeg: number;
  distanceM: number;
}

const VILLAGE_DESTINATIONS: Waypoint[] = [
  { nameNp: 'विद्यालय', nameEn: 'School', icon: '🏫', bearingDeg: 60, distanceM: 300 },
  { nameNp: 'स्वास्थ्य चौकी', nameEn: 'Health Post', icon: '🏥', bearingDeg: 135, distanceM: 400 },
  { nameNp: 'मन्दिर', nameEn: 'Temple', icon: '🛕', bearingDeg: 210, distanceM: 250 },
  { nameNp: 'बसपार्क', nameEn: 'Bus Park', icon: '🚌', bearingDeg: 300, distanceM: 350 },
  { nameNp: 'पानीको मुहान', nameEn: 'Water Spring', icon: '💧', bearingDeg: 345, distanceM: 200 },
];

export const BearingScaleNavigationChallenge: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U20-03',
    chapter: 20,
    titleNp: 'दिगंश र मापन नेभिगेसन चुनौती',
    titleEn: 'Bearing and Scale Navigation Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'free_nav' | 'village' | 'mission'>('village');

  // Free Navigation parameters
  const [scaleFactor, setScaleFactor] = useState<number>(50); // 1 cm = 50 m
  const pxPerCm = 35; // 35 pixels per cm on screen
  const [startPoint] = useState<{ x: number; y: number }>({ x: 260, y: 220 });

  // Leg 1
  const [leg1Bearing, setLeg1Bearing] = useState<number>(60);
  const [leg1DistM, setLeg1DistM] = useState<number>(200);

  // Leg 2
  const [leg2Bearing, setLeg2Bearing] = useState<number>(150);
  const [leg2DistM, setLeg2DistM] = useState<number>(150);
  const [showLeg2, setShowLeg2] = useState<boolean>(true);

  // Village map target
  const [selectedVillageDest, setSelectedVillageDest] = useState<number>(0);

  // Mission state
  const [missionTargetBearing, setMissionTargetBearing] = useState<number>(90);
  const [missionTargetDistM, setMissionTargetDistM] = useState<number>(300);
  const [userReturnBearing, setUserReturnBearing] = useState<string>('');
  const [missionFeedback, setMissionFeedback] = useState<string | null>(null);

  // Helper formatting
  const formatBearing = (deg: number) => {
    const rounded = Math.round(((deg % 360) + 360) % 360);
    return rounded.toString().padStart(3, '0') + '°';
  };

  // Convert distance in meters to screen pixels via map scale
  const metersToPx = (m: number) => (m / scaleFactor) * pxPerCm;

  // Compute end point of Leg 1 (Point B)
  const rad1 = (leg1Bearing * Math.PI) / 180;
  const leg1Px = metersToPx(leg1DistM);
  const pointB = {
    x: startPoint.x + leg1Px * Math.sin(rad1),
    y: startPoint.y - leg1Px * Math.cos(rad1),
  };

  // Compute end point of Leg 2 (Point C)
  const rad2 = (leg2Bearing * Math.PI) / 180;
  const leg2Px = metersToPx(leg2DistM);
  const pointC = {
    x: pointB.x + leg2Px * Math.sin(rad2),
    y: pointB.y - leg2Px * Math.cos(rad2),
  };

  // Return bearing from C to startPoint
  const returnDx = startPoint.x - pointC.x;
  const returnDy = startPoint.y - pointC.y;
  let returnAngle = (Math.atan2(returnDx, -returnDy) * 180) / Math.PI;
  if (returnAngle < 0) returnAngle += 360;
  returnAngle = Math.round(returnAngle);

  // Direct distance from start to C
  const totalDirectDistM = Math.round(
    (Math.hypot(pointC.x - startPoint.x, pointC.y - startPoint.y) / pxPerCm) * scaleFactor
  );

  const handleCheckMission = () => {
    const expectedReturn =
      missionTargetBearing < 180 ? missionTargetBearing + 180 : missionTargetBearing - 180;
    const userVal = parseInt(userReturnBearing);
    if (userVal === expectedReturn) {
      kit.good();
      setMissionFeedback(
        L(
          '🎉 एकदम सही! तपाईंले सही विपरित दिगंश हिसाब गरी घर फर्कने बाटो पत्ता लगाउनुभयो!',
          '🎉 Correct! Accurate return bearing calculated!'
        )
      );
    } else {
      kit.oops();
      setMissionFeedback(
        L(
          `❌ मिलेन। सुरु दिगंश ${formatBearing(missionTargetBearing)} भएकोले फर्कने दिगंश ${formatBearing(expectedReturn)} हो।`,
          `❌ Incorrect. For forward bearing ${formatBearing(missionTargetBearing)}, reverse bearing is ${formatBearing(expectedReturn)}.`
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
        'नमस्ते! गाउँको नक्सा, दिगंश कोण र मापन अनुपात मिलाएर यात्रा गर्ने र फर्कने दिशा पत्ता लगाऔं!',
        'Hello! Navigate village routes using bearings and scale drawings, and compute return bearings!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('village')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'village' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🏘️ {L('१. गाउँको नक्सा नेभिगेसन (Village Map)', '1. Village Map Navigation')}
          </button>
          <button
            onClick={() => setActiveTab('free_nav')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'free_nav' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🧭 {L('२. २-चरणे बहु-मार्ग यात्रा (2-Leg Navigation)', '2. Multi-Leg Navigation')}
          </button>
          <button
            onClick={() => setActiveTab('mission')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'mission' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎯 {L('३. फिर्ती यात्रा चुनौती (Return Mission)', '3. Return Mission')}
          </button>
        </div>

        {/* Tab 1: Village Map Navigation */}
        {activeTab === 'village' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg p-4 border border-slate-200 flex flex-col items-center">
              <div className="w-full flex justify-between items-center text-xs font-bold text-slate-700 mb-2 px-1">
                <span>{L('घर (Home) बाट गन्तव्य छान्नुहोस्', 'Select destination from Home')}</span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  मापन: १ सेमी = ५० मिटर
                </span>
              </div>

              <svg
                width={540}
                height={400}
                className="max-w-full bg-slate-900 rounded-xl shadow-inner select-none border border-slate-800"
              >
                <defs>
                  <pattern id="grid-nav" width="35" height="35" patternUnits="userSpaceOnUse">
                    <path d="M 35 0 L 0 0 0 35" fill="none" stroke="#1e293b" strokeWidth="1" />
                  </pattern>
                  <marker id="arrow-route" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                  </marker>
                  <marker id="arrow-n" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                  </marker>
                </defs>
                <rect width={540} height={400} fill="url(#grid-nav)" />

                {/* North Reference arrow at Home */}
                <line
                  x1={startPoint.x}
                  y1={startPoint.y}
                  x2={startPoint.x}
                  y2={startPoint.y - 80}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  markerEnd="url(#arrow-n)"
                />
                <text x={startPoint.x + 8} y={startPoint.y - 70} fontSize="12" fontWeight="900" fill="#ef4444">
                  N (उत्तर)
                </text>

                {/* Destinations */}
                {VILLAGE_DESTINATIONS.map((dest, idx) => {
                  const isSelected = selectedVillageDest === idx;
                  const rad = (dest.bearingDeg * Math.PI) / 180;
                  const distPx = metersToPx(dest.distanceM);
                  const destX = startPoint.x + distPx * Math.sin(rad);
                  const destY = startPoint.y - distPx * Math.cos(rad);

                  return (
                    <g key={dest.nameNp}>
                      {/* Route line to selected */}
                      {isSelected && (
                        <g>
                          <line
                            x1={startPoint.x}
                            y1={startPoint.y}
                            x2={destX}
                            y2={destY}
                            stroke="#f59e0b"
                            strokeWidth="3.5"
                            markerEnd="url(#arrow-route)"
                          />
                          {/* Bearing angle arc */}
                          {(() => {
                            const r = 40;
                            const xArc = startPoint.x + r * Math.sin(rad);
                            const yArc = startPoint.y - r * Math.cos(rad);
                            const largeArc = dest.bearingDeg > 180 ? 1 : 0;
                            const path = `M ${startPoint.x} ${startPoint.y - r} A ${r} ${r} 0 ${largeArc} 1 ${xArc} ${yArc}`;
                            return (
                              <path d={path} fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="2.5" />
                            );
                          })()}
                        </g>
                      )}

                      {/* Destination icon marker */}
                      <circle
                        cx={destX}
                        cy={destY}
                        r={isSelected ? 22 : 16}
                        fill={isSelected ? '#f59e0b' : '#334155'}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="cursor-pointer"
                        onClick={() => setSelectedVillageDest(idx)}
                      />
                      <text
                        x={destX}
                        y={destY + 5}
                        fontSize={isSelected ? '16' : '13'}
                        textAnchor="middle"
                        className="cursor-pointer"
                        onClick={() => setSelectedVillageDest(idx)}
                      >
                        {dest.icon}
                      </text>
                      <text
                        x={destX}
                        y={destY + 28}
                        fontSize="11"
                        fontWeight="bold"
                        fill={isSelected ? '#fde047' : '#94a3b8'}
                        textAnchor="middle"
                      >
                        {dest.nameNp}
                      </text>
                    </g>
                  );
                })}

                {/* Home Marker at center */}
                <circle cx={startPoint.x} cy={startPoint.y} r={20} fill="#3b82f6" stroke="#ffffff" strokeWidth="3" />
                <text x={startPoint.x} y={startPoint.y + 6} fontSize="14" textAnchor="middle">
                  🏠
                </text>
                <text x={startPoint.x} y={startPoint.y + 32} fontSize="12" fontWeight="900" fill="#60a5fa" textAnchor="middle">
                  घर (Home)
                </text>
              </svg>

              {/* Destination buttons */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {VILLAGE_DESTINATIONS.map((d, i) => (
                  <button
                    key={d.nameNp}
                    onClick={() => setSelectedVillageDest(i)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold border transition-all ${
                      selectedVillageDest === i
                        ? 'bg-amber-600 text-white border-amber-600 shadow'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                    }`}
                  >
                    {d.icon} {d.nameNp}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination details card */}
            <div className="lg:col-span-4 space-y-4">
              {(() => {
                const cur = VILLAGE_DESTINATIONS[selectedVillageDest];
                const mapCm = (cur.distanceM / 50).toFixed(1);
                const revBearing = cur.bearingDeg < 180 ? cur.bearingDeg + 180 : cur.bearingDeg - 180;

                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{cur.icon}</span>
                      <div>
                        <h4 className="font-extrabold text-amber-950 text-base">{cur.nameNp}</h4>
                        <span className="text-xs text-amber-800">{cur.nameEn}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-amber-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold">घरबाट दिगंश (Bearing):</span>
                        <span className="text-amber-600 font-extrabold text-sm font-mono">
                          {formatBearing(cur.bearingDeg)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold">वास्तविक दूरी:</span>
                        <span className="text-slate-800 font-bold">{cur.distanceM} मिटर</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold">नक्सामा दूरी (१:५०):</span>
                        <span className="text-indigo-700 font-bold font-mono">{mapCm} सेमी</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between items-center">
                        <span className="text-emerald-800 font-bold">घर फर्कने दिगंश:</span>
                        <span className="text-emerald-700 font-extrabold text-sm font-mono">
                          {formatBearing(revBearing)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-900 leading-relaxed bg-amber-100/60 p-2.5 rounded-lg">
                      💡 <b>फर्कने दिगंश:</b> {cur.bearingDeg < 180 ? `${formatBearing(cur.bearingDeg)} + १८०° = ${formatBearing(revBearing)}` : `${formatBearing(cur.bearingDeg)} - १८०° = ${formatBearing(revBearing)}`}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 2: Free 2-Leg Multi-route Navigation */}
        {activeTab === 'free_nav' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg p-4 border border-slate-200 flex flex-col items-center">
              <svg width={540} height={400} className="max-w-full bg-slate-900 rounded-xl shadow-inner select-none border border-slate-800">
                <rect width={540} height={400} fill="#0f172a" />

                {/* North arrow at A */}
                <line x1={startPoint.x} y1={startPoint.y} x2={startPoint.x} y2={startPoint.y - 60} stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
                <text x={startPoint.x + 6} y={startPoint.y - 50} fontSize="11" fontWeight="bold" fill="#ef4444">N</text>

                {/* Leg 1: A -> B */}
                <line x1={startPoint.x} y1={startPoint.y} x2={pointB.x} y2={pointB.y} stroke="#f59e0b" strokeWidth="3" />
                <circle cx={startPoint.x} cy={startPoint.y} r={8} fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                <text x={startPoint.x - 15} y={startPoint.y + 18} fontSize="11" fontWeight="bold" fill="#60a5fa">A (सुरुवात)</text>

                <circle cx={pointB.x} cy={pointB.y} r={8} fill="#f59e0b" stroke="#fff" strokeWidth="2" />
                <text x={pointB.x + 10} y={pointB.y + 5} fontSize="11" fontWeight="bold" fill="#fbbf24">B</text>

                {/* North arrow at B */}
                {showLeg2 && (
                  <g>
                    <line x1={pointB.x} y1={pointB.y} x2={pointB.x} y2={pointB.y - 60} stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
                    <text x={pointB.x + 6} y={pointB.y - 50} fontSize="11" fontWeight="bold" fill="#ef4444">N</text>

                    {/* Leg 2: B -> C */}
                    <line x1={pointB.x} y1={pointB.y} x2={pointC.x} y2={pointC.y} stroke="#10b981" strokeWidth="3" />
                    <circle cx={pointC.x} cy={pointC.y} r={8} fill="#10b981" stroke="#fff" strokeWidth="2" />
                    <text x={pointC.x + 10} y={pointC.y + 5} fontSize="11" fontWeight="bold" fill="#34d399">C (अन्तिम)</text>

                    {/* Return direct line C -> A (Dashed) */}
                    <line x1={pointC.x} y1={pointC.y} x2={startPoint.x} y2={startPoint.y} stroke="#a855f7" strokeWidth="2" strokeDasharray="4 3" />
                  </g>
                )}
              </svg>
            </div>

            {/* Controls for Leg 1 and Leg 2 */}
            <div className="lg:col-span-4 space-y-4">
              {/* Leg 1 Controls */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs">
                <span className="font-bold text-amber-900 block">पहिलो चरण (Leg 1: A ➜ B)</span>
                <div>
                  <div className="flex justify-between font-semibold">
                    <span>दिगंश (Bearing):</span>
                    <span className="font-mono text-amber-700 font-bold">{formatBearing(leg1Bearing)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={leg1Bearing}
                    onChange={(e) => setLeg1Bearing(parseInt(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-semibold">
                    <span>दूरी (Distance):</span>
                    <span className="font-mono text-amber-700 font-bold">{leg1DistM} मिटर</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    step="25"
                    value={leg1DistM}
                    onChange={(e) => setLeg1DistM(parseInt(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>
              </div>

              {/* Leg 2 Controls */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900">दोस्रो चरण (Leg 2: B ➜ C)</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLeg2}
                      onChange={(e) => setShowLeg2(e.target.checked)}
                      className="accent-emerald-600"
                    />
                    <span>सक्रिय</span>
                  </label>
                </div>
                {showLeg2 && (
                  <>
                    <div>
                      <div className="flex justify-between font-semibold">
                        <span>दिगंश (Bearing):</span>
                        <span className="font-mono text-emerald-700 font-bold">{formatBearing(leg2Bearing)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="359"
                        value={leg2Bearing}
                        onChange={(e) => setLeg2Bearing(parseInt(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold">
                        <span>दूरी (Distance):</span>
                        <span className="font-mono text-emerald-700 font-bold">{leg2DistM} मिटर</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="250"
                        step="25"
                        value={leg2DistM}
                        onChange={(e) => setLeg2DistM(parseInt(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Summary */}
              {showLeg2 && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs space-y-1">
                  <div className="font-bold text-purple-900">अन्तिम स्थिति C बाट सुरु A फर्कने:</div>
                  <div className="flex justify-between text-purple-800">
                    <span>सीधा फर्कने दिगंश:</span>
                    <span className="font-mono font-bold">{formatBearing(returnAngle)}</span>
                  </div>
                  <div className="flex justify-between text-purple-800">
                    <span>सीधा दूरी (विस्थापन):</span>
                    <span className="font-mono font-bold">~{totalDirectDistM} मिटर</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Return Journey Mission */}
        {activeTab === 'mission' && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                {L('फिर्ती यात्रा मिसन (Return Journey Mission)', 'Return Journey Mission')}
              </span>
              <h3 className="text-base font-extrabold text-slate-800 mt-1">
                {L(
                  `एक यात्रु बिन्दु A बाट ${formatBearing(missionTargetBearing)} को दिगंशमा ${missionTargetDistM} मिटर हिँडेर B मा पुग्छ। B बाट A फर्कन कुन दिगंशमा हिँड्नुपर्छ?`,
                  `A traveler walks on bearing ${formatBearing(missionTargetBearing)} for ${missionTargetDistM} m from A to B. On what bearing should they walk back from B to A?`
                )}
              </h3>
            </div>

            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="number"
                placeholder="फर्कने दिगंश कोण (डिग्री)..."
                value={userReturnBearing}
                onChange={(e) => {
                  setUserReturnBearing(e.target.value);
                  setMissionFeedback(null);
                }}
                className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-sm"
              />
              <span className="self-center font-bold text-slate-700 text-sm">डिग्री (°)</span>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleCheckMission}
                className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow transition-all"
              >
                {L('जाँच गर्नुहोस् (Check)', 'Check')}
              </button>
              <button
                onClick={() => {
                  setMissionTargetBearing(Math.floor(Math.random() * 24) * 15);
                  setMissionTargetDistM((Math.floor(Math.random() * 5) + 2) * 50);
                  setUserReturnBearing('');
                  setMissionFeedback(null);
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm border"
              >
                {L('नयाँ मिसन (New Mission)', 'New Mission')}
              </button>
            </div>

            {missionFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold text-center border ${
                  missionFeedback.includes('🎉')
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {missionFeedback}
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default BearingScaleNavigationChallenge;
