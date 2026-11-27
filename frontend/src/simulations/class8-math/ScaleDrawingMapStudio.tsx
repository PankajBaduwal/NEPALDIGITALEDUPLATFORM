import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { MapPin, Ruler, Scaling, CheckCircle, Calculator, Building2 } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'यदि नक्साको मापन अनुपात १ सेमी = ५० मिटर छ र दुई स्थान बीचको दूरी ६ सेमी भए, वास्तविक दूरी कति हुन्छ?',
    en: 'If map scale is 1 cm = 50 m and map distance is 6 cm, what is the actual distance?',
    options: [
      { key: 'A', label: '३०० मिटर (6 × 50 = 300 m)' },
      { key: 'B', label: '५६ मिटर' },
      { key: 'C', label: '१५० मिटर' },
      { key: 'D', label: '६०० मिटर' },
    ],
    answer: 'A',
  },
  {
    np: 'वास्तविक दूरी ४०० मिटर भएको बाटोलाई १ सेमी = १०० मिटरको मापन चित्रमा कति लम्बाइले जनाइन्छ?',
    en: 'A road of actual distance 400 m is represented on a scale of 1 cm = 100 m by what length?',
    options: [
      { key: 'A', label: '४ सेमी (400 ÷ 100 = 4 cm)' },
      { key: 'B', label: '४० सेमी' },
      { key: 'C', label: '०.४ सेमी' },
      { key: 'D', label: '४०० सेमी' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि १ सेमी = ५०० मिटर छ भने, यस अनुपातको वास्तविक अर्थ के हो?',
    en: 'What does the scale 1 cm = 500 m mathematically mean?',
    options: [
      { key: 'A', label: 'नक्साको १ सेमीले जमिनको ५०० मिटर जनाउँछ' },
      { key: 'B', label: 'जमिनको १ सेमीले नक्साको ५०० मिटर जनाउँछ' },
      { key: 'C', label: 'दुवै स्थानको दूरी ५०० मिटर हो' },
      { key: 'D', label: 'नक्साको क्षेत्रफल ५०० मिटर² हो' },
    ],
    answer: 'A',
  },
  {
    np: 'ठूलो मापन अनुपात (Larger Scale) को नक्सामा वस्तुहरू कस्ता देखिन्छन्?',
    en: 'How do objects appear on a larger scale map?',
    options: [
      { key: 'A', label: 'ठूला र विस्तृत (Larger and with more detail)' },
      { key: 'B', label: 'अझ साना र अस्पष्ट' },
      { key: 'C', label: 'कुनै परिवर्तन हुँदैन' },
      { key: 'D', label: 'उल्टो देखिन्छन्' },
    ],
    answer: 'A',
  },
];

interface LocationItem {
  id: string;
  nameNp: string;
  nameEn: string;
  icon: string;
  x: number; // in grid pixels
  y: number;
}

const DEFAULT_LOCATIONS: LocationItem[] = [
  { id: 'gate', nameNp: 'मूल ढोका', nameEn: 'Main Gate', icon: '🚪', x: 80, y: 320 },
  { id: 'office', nameNp: 'प्रशासन कक्ष', nameEn: 'School Office', icon: '🏢', x: 180, y: 220 },
  { id: 'class', nameNp: 'कक्षाकोठा', nameEn: 'Classroom', icon: '🏫', x: 380, y: 140 },
  { id: 'library', nameNp: 'पुस्तकालय', nameEn: 'Library', icon: '📚', x: 420, y: 280 },
  { id: 'ground', nameNp: 'खेलमैदान', nameEn: 'Playground', icon: '⚽', x: 220, y: 100 },
];

const SCALES = [
  { label: '१ सेमी = १० मिटर', factor: 10 },
  { label: '१ सेमी = ५० मिटर', factor: 50 },
  { label: '१ सेमी = १०० मिटर', factor: 100 },
  { label: '१ सेमी = २०० मिटर', factor: 200 },
  { label: '१ सेमी = ५०० मिटर', factor: 500 },
];

export const ScaleDrawingMapStudio: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U20-02',
    chapter: 20,
    titleNp: 'मापन चित्र र नक्सा मापन स्टुडियो',
    titleEn: 'Scale Drawing and Map Measurement Studio',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'map' | 'calc' | 'challenge'>('map');

  // Scale state: meters per cm (1 grid unit = 1 cm = 40px)
  const [scaleFactor, setScaleFactor] = useState<number>(50); // 1cm = 50m default
  const pxPerCm = 40;

  // School locations
  const [locations, setLocations] = useState<LocationItem[]>(DEFAULT_LOCATIONS);
  const [selectedLocA, setSelectedLocA] = useState<string>('gate');
  const [selectedLocB, setSelectedLocB] = useState<string>('class');
  const [draggingLocId, setDraggingLocId] = useState<string | null>(null);

  // Calculator inputs
  const [calcMapCm, setCalcMapCm] = useState<number>(5);
  const [calcActualM, setCalcActualM] = useState<number>(250);

  // Challenge state
  const [challengeTargetMapCm, setChallengeTargetMapCm] = useState<number>(4);
  const [challengeScaleFactor, setChallengeScaleFactor] = useState<number>(100);
  const [userGuessMeters, setUserGuessMeters] = useState<string>('');
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  // Find selected locations
  const locA = locations.find((l) => l.id === selectedLocA) || locations[0];
  const locB = locations.find((l) => l.id === selectedLocB) || locations[1];

  // Calculate distance between locA and locB in cm and meters
  const distPx = Math.hypot(locB.x - locA.x, locB.y - locA.y);
  const mapDistanceCm = parseFloat((distPx / pxPerCm).toFixed(1));
  const actualDistanceM = Math.round(mapDistanceCm * scaleFactor);

  const handleDragLocation = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingLocId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(40, Math.min(rect.width - 40, e.clientX - rect.left));
    const y = Math.max(40, Math.min(rect.height - 40, e.clientY - rect.top));

    setLocations((prev) =>
      prev.map((loc) => (loc.id === draggingLocId ? { ...loc, x, y } : loc))
    );
  };

  const handleCheckChallenge = () => {
    const expected = challengeTargetMapCm * challengeScaleFactor;
    const userVal = parseFloat(userGuessMeters);
    if (Math.abs(userVal - expected) < 1) {
      kit.good();
      setChallengeFeedback(L('🎉 शाबास! तपाईंले सही वास्तविक दूरी हिसाब गर्नुभयो!', '🎉 Correct! Accurate distance calculated!'));
    } else {
      kit.oops();
      setChallengeFeedback(
        L(
          `❌ मिलेन। सही उत्तर: ${challengeTargetMapCm} सेमी × ${challengeScaleFactor} = ${expected} मिटर हो।`,
          `❌ Incorrect. The answer is ${challengeTargetMapCm} cm × ${challengeScaleFactor} = ${expected} m.`
        )
      );
    }
  };

  const generateNewChallenge = () => {
    const scales = [10, 50, 100, 200, 500];
    const s = scales[Math.floor(Math.random() * scales.length)];
    const cm = Math.floor(Math.random() * 8) + 2;
    setChallengeScaleFactor(s);
    setChallengeTargetMapCm(cm);
    setUserGuessMeters('');
    setChallengeFeedback(null);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! नक्साको मापन अनुपात (Scale Factor), नक्साको दूरी र जमिनको वास्तविक दूरीको हिसाब सिकौं!',
        'Hello! Explore scale drawings, measure map distances, and calculate real ground distances!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'map' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🗺️ {L('१. विद्यालय नक्सा मापन स्टुडियो (Map Studio)', '1. School Map Studio')}
          </button>
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'calc' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🧮 {L('२. मापन अनुपात क्यालकुलेटर (Scale Calculator)', '2. Scale Calculator')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'challenge' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎯 {L('३. मापन चित्र चुनौती (Distance Challenge)', '3. Distance Challenge')}
          </button>
        </div>

        {/* Tab 1: Interactive School Map & Ruler */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Map Canvas */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg p-4 border border-slate-200 flex flex-col items-center">
              <div className="w-full flex justify-between items-center text-xs font-bold text-slate-700 mb-2 px-1">
                <span>{L('स्थानहरू तान्नुहोस् (Drag locations to customize map)', 'Drag locations on the map')}</span>
                <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300">
                  मापन: १ सेमी = {scaleFactor} मिटर (४० px = १ सेमी)
                </span>
              </div>

              <svg
                width={560}
                height={380}
                onMouseMove={handleDragLocation}
                onMouseUp={() => setDraggingLocId(null)}
                className="max-w-full bg-slate-900 rounded-xl shadow-inner select-none cursor-crosshair border border-slate-700"
              >
                {/* 1cm grid pattern (40px) */}
                <defs>
                  <pattern id="grid-cm" width={pxPerCm} height={pxPerCm} patternUnits="userSpaceOnUse">
                    <path d={`M ${pxPerCm} 0 L 0 0 0 ${pxPerCm}`} fill="none" stroke="#1e293b" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="560" height="380" fill="url(#grid-cm)" />

                {/* Connecting road between selected A and B */}
                <line
                  x1={locA.x}
                  y1={locA.y}
                  x2={locB.x}
                  y2={locB.y}
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeDasharray="6 4"
                />

                {/* Midpoint measurement label */}
                {(() => {
                  const midX = (locA.x + locB.x) / 2;
                  const midY = (locA.y + locB.y) / 2;
                  return (
                    <g>
                      <rect
                        x={midX - 60}
                        y={midY - 22}
                        width="120"
                        height="26"
                        rx="6"
                        fill="#0f172a"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      />
                      <text
                        x={midX}
                        y={midY - 5}
                        fontSize="11"
                        fontWeight="bold"
                        fill="#fde047"
                        textAnchor="middle"
                      >
                        {mapDistanceCm} सेमी ➜ {actualDistanceM} मिटर
                      </text>
                    </g>
                  );
                })()}

                {/* School locations */}
                {locations.map((loc) => {
                  const isA = loc.id === selectedLocA;
                  const isB = loc.id === selectedLocB;
                  const isSelected = isA || isB;

                  return (
                    <g
                      key={loc.id}
                      onMouseDown={() => setDraggingLocId(loc.id)}
                      className="cursor-move"
                    >
                      {/* Selection ring */}
                      {isSelected && (
                        <circle
                          cx={loc.x}
                          cy={loc.y}
                          r={24}
                          fill={isA ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}
                          stroke={isA ? '#3b82f6' : '#10b981'}
                          strokeWidth="2"
                        />
                      )}
                      <circle cx={loc.x} cy={loc.y} r={16} fill="#1e293b" stroke="#ffffff" strokeWidth="2.5" />
                      <text x={loc.x} y={loc.y + 5} fontSize="14" textAnchor="middle">
                        {loc.icon}
                      </text>
                      <text
                        x={loc.x}
                        y={loc.y + 30}
                        fontSize="11"
                        fontWeight="bold"
                        fill="#e2e8f0"
                        textAnchor="middle"
                      >
                        {loc.nameNp}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Scale selector buttons */}
              <div className="w-full flex flex-wrap justify-center items-center gap-2 mt-3 pt-2 border-t">
                <span className="text-xs font-bold text-slate-600">मापन अनुपात छान्नुहोस्:</span>
                {SCALES.map((s) => (
                  <button
                    key={s.factor}
                    onClick={() => setScaleFactor(s.factor)}
                    className={`px-3 py-1 text-xs rounded-lg font-bold border transition-all ${
                      scaleFactor === s.factor
                        ? 'bg-amber-600 text-white border-amber-600 shadow'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Measurement Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-amber-600" />
                  {L('दूरी मापन (Distance Calculation)', 'Distance Calculation')}
                </h3>

                {/* Point selectors */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-750 font-bold mb-1">स्थान १ (पहिलो बिन्दु):</label>
                    <select
                      value={selectedLocA}
                      onChange={(e) => setSelectedLocA(e.target.value)}
                      className="w-full p-2 rounded-lg border border-amber-200 bg-white font-semibold text-slate-800"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.icon} {l.nameNp} ({l.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">स्थान २ (दोस्रो बिन्दु):</label>
                    <select
                      value={selectedLocB}
                      onChange={(e) => setSelectedLocB(e.target.value)}
                      className="w-full p-2 rounded-lg border border-amber-200 bg-white font-semibold text-slate-800"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.icon} {l.nameNp} ({l.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Computed Output Cards */}
                <div className="bg-white rounded-xl p-3 border border-amber-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">नक्सामा दूरी (Map Distance):</span>
                    <span className="text-amber-600 font-extrabold text-sm font-mono">{mapDistanceCm} सेमी</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">मापन गुणक (Scale Factor):</span>
                    <span className="text-slate-800 font-bold">{scaleFactor} मिटर/सेमी</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between items-center">
                    <span className="text-indigo-900 font-bold">वास्तविक दूरी (Actual):</span>
                    <span className="text-indigo-700 font-extrabold text-lg font-mono">{actualDistanceM} मिटर</span>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-100/70 rounded-lg text-xs text-amber-950 font-semibold leading-relaxed">
                  💡 <b>सूत्र:</b> वास्तविक दूरी = नक्साको दूरी × मापन अनुपात
                  <div className="font-mono mt-0.5 text-amber-900 font-bold">
                    = {mapDistanceCm} × {scaleFactor} = {actualDistanceM} मिटर
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Scale Conversion Calculator */}
        {activeTab === 'calc' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-6">
            <h3 className="text-center font-extrabold text-slate-800 text-lg flex items-center justify-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              {L('मापन अनुपात क्यालकुलेटर (Map & Actual Distance Calculator)', 'Scale Calculator')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Box 1: Map Distance -> Actual Distance */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-indigo-900 uppercase">
                  १. नक्साको दूरी ➜ वास्तविक दूरी
                </span>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">नक्सामा दूरी (सेमी):</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={calcMapCm}
                    onChange={(e) => setCalcMapCm(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-indigo-200 font-mono text-sm"
                  />
                </div>
                <div className="p-3 bg-white rounded border border-indigo-200 text-xs">
                  <span className="text-slate-500 block">१ सेमी = {scaleFactor} मिटर मापनमा:</span>
                  <div className="text-xl font-extrabold text-indigo-700 font-mono mt-1">
                    {Math.round(calcMapCm * scaleFactor)} मिटर
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono block mt-0.5">
                    ({calcMapCm} × {scaleFactor} = {Math.round(calcMapCm * scaleFactor)})
                  </span>
                </div>
              </div>

              {/* Box 2: Actual Distance -> Map Distance */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-amber-900 uppercase">
                  २. वास्तविक दूरी ➜ नक्साको दूरी
                </span>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">वास्तविक दूरी (मिटर):</label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={calcActualM}
                    onChange={(e) => setCalcActualM(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-amber-200 font-mono text-sm"
                  />
                </div>
                <div className="p-3 bg-white rounded border border-amber-200 text-xs">
                  <span className="text-slate-500 block">१ सेमी = {scaleFactor} मिटर मापनमा:</span>
                  <div className="text-xl font-extrabold text-amber-700 font-mono mt-1">
                    {(calcActualM / scaleFactor).toFixed(2)} सेमी
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono block mt-0.5">
                    ({calcActualM} ÷ {scaleFactor} = {(calcActualM / scaleFactor).toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Practice Challenge */}
        {activeTab === 'challenge' && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                {L('मापन चित्र चुनौती (Scale Calculation Challenge)', 'Scale Calculation Challenge')}
              </span>
              <h3 className="text-lg font-extrabold text-slate-800 mt-1">
                {L(
                  `नक्साको दूरी = ${challengeTargetMapCm} सेमी र मापन १ सेमी = ${challengeScaleFactor} मिटर भए वास्तविक दूरी कति होला?`,
                  `If map distance = ${challengeTargetMapCm} cm and scale is 1 cm = ${challengeScaleFactor} m, what is the actual distance?`
                )}
              </h3>
            </div>

            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="number"
                placeholder="वास्तविक दूरी मिटरमा..."
                value={userGuessMeters}
                onChange={(e) => {
                  setUserGuessMeters(e.target.value);
                  setChallengeFeedback(null);
                }}
                className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-sm"
              />
              <span className="self-center font-bold text-slate-700 text-sm">मिटर</span>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleCheckChallenge}
                className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow transition-all"
              >
                {L('जाँच गर्नुहोस् (Check)', 'Check')}
              </button>
              <button
                onClick={generateNewChallenge}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm border"
              >
                {L('अर्को प्रश्न (Next)', 'Next')}
              </button>
            </div>

            {challengeFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold text-center border ${
                  challengeFeedback.includes('🎉')
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {challengeFeedback}
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default ScaleDrawingMapStudio;
