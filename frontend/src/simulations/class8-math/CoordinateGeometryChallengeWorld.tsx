import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { MapPin, Navigation, Trophy, CheckCircle, RefreshCw } from 'lucide-react';

interface Landmark {
  id: string;
  nameNp: string;
  nameEn: string;
  icon: string;
  x: number;
  y: number;
}

const LANDMARKS: Landmark[] = [
  { id: 'home', nameNp: 'घर (Home)', nameEn: 'Home', icon: '🏠', x: 0, y: 0 },
  { id: 'school', nameNp: 'विद्यालय (School)', nameEn: 'School', icon: '🏫', x: 4, y: 3 },
  { id: 'hospital', nameNp: 'अस्पताल (Hospital)', nameEn: 'Hospital', icon: '🏥', x: -3, y: 4 },
  { id: 'playground', nameNp: 'खेलमैदान (Playground)', nameEn: 'Playground', icon: '⚽', x: -4, y: -3 },
  { id: 'market', nameNp: 'बजार (Market)', nameEn: 'Market', icon: '🏪', x: 5, y: -2 },
  { id: 'park', nameNp: 'पार्क (Park)', nameEn: 'Park', icon: '🌳', x: 2, y: -4 },
  { id: 'cat', nameNp: 'बिरालो (Cat)', nameEn: 'Cat', icon: '🐱', x: -2, y: 2 },
  { id: 'mouse', nameNp: 'मुसो (Mouse)', nameEn: 'Mouse', icon: '🐭', x: 1, y: 2 }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'घर (0, 0) बाट विद्यालय (4, 3) सम्मको सीधा दूरी कति units हुन्छ?',
    en: 'What is the straight-line distance from Home (0, 0) to School (4, 3)?',
    options: [
      { key: 'A', label: '5 units (5 units: √(4²+3²))' },
      { key: 'B', label: '7 units' },
      { key: 'C', label: '12 units' },
      { key: 'D', label: '25 units' },
    ],
    answer: 'A',
  },
  {
    np: 'अस्पतालको स्थान (-3, 4) समतलको कुन चतुर्थांशमा पर्दछ?',
    en: 'In which quadrant is the Hospital located at (-3, 4)?',
    options: [
      { key: 'A', label: 'Second quadrant (II)' },
      { key: 'B', label: 'First quadrant' },
      { key: 'C', label: 'Third quadrant' },
      { key: 'D', label: 'Fourth quadrant' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि वृत्तको केन्द्र (0, 0) मा छ र परिधिको बिन्दु (3, 4) भए वृत्तको अर्धव्यास (Radius) कति हुन्छ?',
    en: 'If a circle has its center at (0, 0) and passes through (3, 4), what is its radius?',
    options: [
      { key: 'A', label: '5 units (r = √(3²+4²))' },
      { key: 'B', label: '7 units' },
      { key: 'C', label: '25 units' },
      { key: 'D', label: '10 units' },
    ],
    answer: 'A',
  }
];

export const CoordinateGeometryChallengeWorld: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U17-03',
    chapter: 17,
    titleNp: 'निर्देशाङ्क ज्यामिति चुनौती संसार',
    titleEn: 'Coordinate Geometry Challenge World',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'map' | 'shortest_distance' | 'circle_radius'>('map');
  const [selectedFrom, setSelectedFrom] = useState<string>('home');
  const [selectedTo, setSelectedTo] = useState<string>('school');

  // Circle radius center & circumference
  const [radiusInput, setRadiusInput] = useState<string>('');
  const [radiusFeedback, setRadiusFeedback] = useState<string | null>(null);

  const locFrom = LANDMARKS.find((l) => l.id === selectedFrom) || LANDMARKS[0];
  const locTo = LANDMARKS.find((l) => l.id === selectedTo) || LANDMARKS[1];

  // Distance calculation
  const dx = locTo.x - locFrom.x;
  const dy = locTo.y - locFrom.y;
  const directDist = Math.sqrt(dx * dx + dy * dy);

  // SVG parameters
  const cx = 200, cy = 180, scale = 24;

  const handleTestRadius = () => {
    // Center (0,0) to School (4,3) -> radius = 5
    const val = parseFloat(radiusInput);
    if (Math.abs(val - 5) < 0.1) {
      setRadiusFeedback('correct');
      kit.good();
    } else {
      setRadiusFeedback('incorrect');
      kit.oops();
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! नक्सामा विभिन्न स्थानहरूको निर्देशांक पत्ता लगाउने र सीधा दूरी निकाल्ने व्यावहारिक चुनौतीमा स्वागत छ!',
        'Welcome! Explore practical town landmarks, calculate straight-line distances, and solve real-world geometry puzzles!'
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
            {L('1. नक्सा र स्थान खोज (Town Map)', '1. Town Map & Locations')}
          </button>
          <button
            onClick={() => setActiveTab('shortest_distance')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'shortest_distance' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('2. छोटो सीधा दूरी (Shortest Distance)', '2. Shortest Distance')}
          </button>
          <button
            onClick={() => setActiveTab('circle_radius')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'circle_radius' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('3. वृत्तको अर्धव्यास चुनौती (Circle Radius)', '3. Circle Radius Challenge')}
          </button>
        </div>

        {/* Town Landmarks Grid Canvas */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center select-none">
          <svg viewBox="0 0 400 360" className="w-full max-w-lg h-72">
            {/* Grid */}
            {[-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const xPos = cx + i * scale;
              const yPos = cy + i * scale;
              return (
                <g key={i}>
                  <line x1={xPos} y1="20" x2={xPos} y2="340" stroke={i === 0 ? '#475569' : '#1e293b'} strokeWidth={i === 0 ? 2 : 1} />
                  <line x1="20" y1={yPos} x2="380" y2={yPos} stroke={i === 0 ? '#475569' : '#1e293b'} strokeWidth={i === 0 ? 2 : 1} />
                </g>
              );
            })}

            {/* Connecting line between selected From and To in Shortest Distance mode */}
            {activeTab === 'shortest_distance' && (
              <g>
                <line
                  x1={cx + locFrom.x * scale}
                  y1={cy - locFrom.y * scale}
                  x2={cx + locTo.x * scale}
                  y2={cy - locTo.y * scale}
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="4 2"
                />
              </g>
            )}

            {/* Circle in Circle Radius Mode */}
            {activeTab === 'circle_radius' && (
              <circle
                cx={cx}
                cy={cy}
                r={5 * scale}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            )}

            {/* Render Landmarks */}
            {LANDMARKS.map((lm) => {
              const px = cx + lm.x * scale;
              const py = cy - lm.y * scale;
              const isSelected = lm.id === selectedFrom || lm.id === selectedTo;
              return (
                <g key={lm.id} className="cursor-pointer" onClick={() => setSelectedTo(lm.id)}>
                  <circle
                    cx={px}
                    cy={py}
                    r={isSelected ? 14 : 10}
                    fill={isSelected ? '#f59e0b' : '#1e293b'}
                    stroke={isSelected ? '#ffffff' : '#475569'}
                    strokeWidth="1.5"
                  />
                  <text x={px} y={py + 4} fontSize="12" textAnchor="middle">
                    {lm.icon}
                  </text>
                  <text
                    x={px}
                    y={py - 12}
                    fill={isSelected ? '#f59e0b' : '#94a3b8'}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {isNe ? lm.nameNp.split(' ')[0] : lm.nameEn} ({lm.x},{lm.y})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Shortest Distance Mode Controls */}
        {activeTab === 'shortest_distance' && (
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {L('दुई स्थानहरू बीचको सीधा दूरी गणना गर्नुहोस्:', 'Calculate Distance Between 2 Landmarks:')}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">{L('सुRs स्थान:', 'From:')}</span>
                <select
                  value={selectedFrom}
                  onChange={(e) => setSelectedFrom(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                >
                  {LANDMARKS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.icon} {isNe ? l.nameNp : l.nameEn} ({l.x}, {l.y})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">{L('गन्तव्य:', 'To:')}</span>
                <select
                  value={selectedTo}
                  onChange={(e) => setSelectedTo(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-semibold"
                >
                  {LANDMARKS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.icon} {isNe ? l.nameNp : l.nameEn} ({l.x}, {l.y})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
              d = √[({locTo.x} - ({locFrom.x}))² + ({locTo.y} - ({locFrom.y}))²] = √[({dx})² + ({dy})²] ={' '}
              <span className="text-emerald-400 font-bold text-sm">{directDist.toFixed(2)} Units</span>
            </div>
          </div>
        )}

        {/* Circle Radius Challenge */}
        {activeTab === 'circle_radius' && (
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {L('वृत्तको अर्धव्यास (Radius) चुनौती:', 'Circle Radius Challenge:')}
            </div>
            <p className="text-xs text-slate-300">
              {L(
                'एउटा वृत्तको केन्द्र घर O(0, 0) मा छ र यसको परिधि विद्यालय (4, 3) भएर जान्छ। यस वृत्तको अर्धव्यास r कति होला?',
                'A circle has its center at Home O(0, 0) and passes through School (4, 3). What is its radius r?'
              )}
            </p>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-mono">r =</span>
              <input
                type="number"
                value={radiusInput}
                onChange={(e) => setRadiusInput(e.target.value)}
                placeholder="5"
                className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-amber-400 outline-none"
              />
              <button
                onClick={handleTestRadius}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all"
              >
                {L('जाँच गर्नुहोस्', 'Check Radius')}
              </button>
            </div>

            {radiusFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold ${
                  radiusFeedback === 'correct'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {radiusFeedback === 'correct'
                  ? L('🎉 सही उत्तर! अर्धव्यास r = √[(4-0)² + (3-0)²] = √(16+9) = 5 units', '🎉 Correct! Radius r = √(4² + 3²) = 5 units!')
                  : L('❌ मिलेन! केन्द्र (0,0) देखि परिधि (4,3) को दूरी निकाल्नुहोस्: r = 5', '❌ Incorrect. Solve r = √(4² + 3²) = 5 units')}
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default CoordinateGeometryChallengeWorld;
