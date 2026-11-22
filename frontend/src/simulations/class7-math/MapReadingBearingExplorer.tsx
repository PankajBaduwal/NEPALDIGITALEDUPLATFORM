/**
 * MapReadingBearingExplorer.tsx
 * Grade 7 Mathematics – Lesson 20: BEARING AND SCALE DRAWING (दिगंश र मापन चित्र)
 * Simulation 2: Map Reading and Bearing Explorer (नक्सा अध्ययन र दिगंश अन्वेषक)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 301-306)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { MapPin, Navigation, Compass, Check, ArrowRight, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'नक्सामा स्थान A बाट स्थान B को दिगंश नाप्दा सबैभन्दा पहिले कुन बिन्दुमा उत्तर (North) रेखा खिच्नुपर्छ?',
    en: 'When measuring the bearing of location B from location A on a map, at which point should the North line be drawn first?',
    options: [
      { key: 'A', label: 'सुरुवाती स्थान A मा (Starting Point A)' },
      { key: 'B', label: 'स्थान B मा' },
      { key: 'C', label: 'नक्साको कुनामा' },
      { key: 'D', label: 'नक्साको केन्द्रमा' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि गाउँपालिका भवनबाट विद्यालय ठीक पूर्व (East) दिशामा अवस्थित छ भने विद्यालयको दिगंश कति हुन्छ?',
    en: 'If a school is located due East from the municipality office, what is its bearing?',
    options: [
      { key: 'A', label: '०९०° (090°)' },
      { key: 'B', label: '०००°' },
      { key: 'C', label: '१८०°' },
      { key: 'D', label: '२७०°' },
    ],
    answer: 'A',
  },
  {
    np: 'काठमाडौंबाट मनाङ (Manang from Kathmandu) उत्तर-पश्चिम दिशामा पर्छ। यसको सम्भावित दिगंश कति हुन्छ?',
    en: 'Manang lies North-West from Kathmandu. What is its approximate three-figure bearing?',
    options: [
      { key: 'A', label: '३१५° (315°)' },
      { key: 'B', label: '०४५°' },
      { key: 'C', label: '१३५°' },
      { key: 'D', label: '२२५°' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि A बाट B को दिगंश ०६०° छ भने, B बाट A को दिगंश (Back Bearing) कति हुन्छ? (६०° + १८०°)',
    en: 'If the bearing of B from A is 060°, what is the back bearing of A from B? (60° + 180°)',
    options: [
      { key: 'A', label: '२४०°' },
      { key: 'B', label: '१२०°' },
      { key: 'C', label: '३००°' },
      { key: 'D', label: '०६०°' },
    ],
    answer: 'A',
  },
];

interface MapPlace {
  id: string;
  nameNp: string;
  nameEn: string;
  x: number;
  y: number;
  iconColor: string;
}

const MUNICIPALITY_PLACES: MapPlace[] = [
  { id: 'office', nameNp: 'गाउँपालिका भवन (केन्द्र)', nameEn: 'Municipality Office (Base)', x: 170, y: 150, iconColor: '#dc2626' },
  { id: 'school', nameNp: 'माध्यमिक विद्यालय', nameEn: 'Secondary School', x: 270, y: 70, iconColor: '#2563eb' },
  { id: 'temple', nameNp: 'ऐतिहासिक मन्दिर', nameEn: 'Historic Temple', x: 280, y: 220, iconColor: '#d97706' },
  { id: 'hospital', nameNp: 'सामुदायिक अस्पताल', nameEn: 'Community Hospital', x: 60, y: 80, iconColor: '#059669' },
  { id: 'buspark', nameNp: 'बसपार्क', nameEn: 'Bus Park', x: 70, y: 230, iconColor: '#7c3aed' },
  { id: 'watertank', nameNp: 'पानी ट्याङ्की', nameEn: 'Water Tank', x: 170, y: 40, iconColor: '#0891b2' },
];

interface NepalPlace {
  id: string;
  fromNp: string;
  fromEn: string;
  toNp: string;
  toEn: string;
  fromCoord: [number, number];
  toCoord: [number, number];
  expectedBearing: number;
}

const NEPAL_LANDMARKS: NepalPlace[] = [
  {
    id: 'ktm_manang',
    fromNp: 'काठमाडौं',
    fromEn: 'Kathmandu',
    toNp: 'मनाङ',
    toEn: 'Manang',
    fromCoord: [220, 150],
    toCoord: [130, 70],
    expectedBearing: 312,
  },
  {
    id: 'pkr_nepalgunj',
    fromNp: 'पोखरा',
    fromEn: 'Pokhara',
    toNp: 'नेपालगञ्ज',
    toEn: 'Nepalgunj',
    fromCoord: [170, 140],
    toCoord: [60, 150],
    expectedBearing: 265,
  },
  {
    id: 'janakpur_taplejung',
    fromNp: 'जनकपुर',
    fromEn: 'Janakpur',
    toNp: 'ताप्लेजुङ',
    toEn: 'Taplejung',
    fromCoord: [240, 180],
    toCoord: [310, 100],
    expectedBearing: 41,
  },
];

type ExplorerMode = 'municipality_map' | 'nepal_map_challenge';

export const MapReadingBearingExplorer: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L20-02',
    chapter: 20,
    titleNp: 'नक्सा अध्ययन र दिगंश अन्वेषक (Map Reading Bearing Explorer)',
    titleEn: 'Map Reading and Bearing Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [mode, setMode] = useState<ExplorerMode>('municipality_map');

  // Municipality Map States
  const [basePlaceId, setBasePlaceId] = useState<string>('office');
  const [destPlaceId, setDestPlaceId] = useState<string>('school');

  // Nepal Landmark Challenge States
  const [nepalIdx, setNepalIdx] = useState<number>(0);
  const [userNepalBearing, setUserNepalBearing] = useState<string>('');
  const [nepalFeedback, setNepalFeedback] = useState<string | null>(null);

  const basePlace = MUNICIPALITY_PLACES.find((p) => p.id === basePlaceId) || MUNICIPALITY_PLACES[0];
  const destPlace = MUNICIPALITY_PLACES.find((p) => p.id === destPlaceId) || MUNICIPALITY_PLACES[1];

  // Geometrical Bearing calculation:
  // Bearing = clockwise angle from North (dx, -dy)
  // dx = dest.x - base.x, dy = dest.y - base.y (SVG coordinates where +y is downward)
  const calcBearing = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    // Math.atan2(dx, -dy) yields angle in radians clockwise from North!
    let rad = Math.atan2(dx, -dy);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return Math.round(deg);
  };

  const calculatedBearing = calcBearing(basePlace, destPlace);

  const format3Digit = (d: number) => {
    if (d < 10) return `00${d}°`;
    if (d < 100) return `0${d}°`;
    return `${d}°`;
  };

  const currentNepal = NEPAL_LANDMARKS[nepalIdx];

  const handleCheckNepal = () => {
    const val = parseInt(userNepalBearing.replace('°', '').trim(), 10);
    if (isNaN(val)) return;

    if (Math.abs(val - currentNepal.expectedBearing) <= 8) {
      setNepalFeedback(
        L(
          `उत्कृष्ट! बिल्कुल सही (अपेक्षित दिगंश: ${format3Digit(currentNepal.expectedBearing)})।`,
          `Excellent! Correct bearing (approx ${format3Digit(currentNepal.expectedBearing)}).`
        )
      );
    } else {
      setNepalFeedback(
        L(
          `प्रयास राम्रो! सही दिगंश लगभग ${format3Digit(currentNepal.expectedBearing)} हो।`,
          `Good try! The accurate bearing is approximately ${format3Digit(currentNepal.expectedBearing)}.`
        )
      );
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! नक्सामा कुनै स्थानबाट अर्को स्थानको दिगंश पत्ता लगाउन सुरुवाती बिन्दुमा उत्तर रेखा खिचेर घडीको सुई अनुसार नापिन्छ।',
        'Hello! To find bearing on a map, draw a North line at the origin and measure clockwise to the destination!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'municipality_map', np: '१. गाउँपालिका नक्सा अध्ययन (Municipality Map)', en: '1. Municipality Map Explorer' },
            { id: 'nepal_map_challenge', np: '२. नेपाल नक्सा दिगंश चुनौती (Nepal Map Challenge)', en: '2. Nepal Map Challenge' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as ExplorerMode)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                mode === item.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? item.np : item.en}
            </button>
          ))}
        </div>

        {/* Mode 1: Municipality Map */}
        {mode === 'municipality_map' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L('नक्सामा दिगंश नाप्ने चरणबद्ध नियम:', 'Rules for Measuring Bearing on a Map:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'चरण १: सुरुवाती स्थानमा ठाडो उत्तर (North) रेखा खिच्ने। चरण २: सो स्थानबाट गन्तव्य स्थानसम्म सीधा रेखा जोड्ने। चरण ३: उत्तर रेखाबाट घडीको सुईको दिशामा कोण नापी ३ अङ्कमा लेख्ने।',
                  'Step 1: Draw North line at origin. Step 2: Draw ray towards destination. Step 3: Measure angle clockwise from North.'
                )}
              </p>
            </div>

            {/* Selection controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {L('सुरुवाती स्थान (Reference Point from):', 'Starting Point (From):')}
                </label>
                <select
                  value={basePlaceId}
                  onChange={(e) => setBasePlaceId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  {MUNICIPALITY_PLACES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isNe ? p.nameNp : p.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {L('गन्तव्य स्थान (Destination Point to):', 'Destination Point (To):')}
                </label>
                <select
                  value={destPlaceId}
                  onChange={(e) => setDestPlaceId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  {MUNICIPALITY_PLACES.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.id === basePlaceId}>
                      {isNe ? p.nameNp : p.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Map Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-emerald-950/10 border-2 border-emerald-800/20 rounded-3xl p-4 flex flex-col items-center relative overflow-hidden shadow-inner">
                <svg width="340" height="280" viewBox="0 0 340 280">
                  {/* Subtle map terrain lines & roads */}
                  <path d="M 30 150 Q 170 120 310 150" fill="none" stroke="#cbd5e1" strokeWidth="6" />
                  <path d="M 170 30 Q 170 150 170 260" fill="none" stroke="#cbd5e1" strokeWidth="6" />
                  <path d="M 60 80 Q 170 150 280 220" fill="none" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="6,4" />

                  {/* Compass rose indicator in upper right corner */}
                  <g transform="translate(305, 35)">
                    <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="0" y1="12" x2="0" y2="-12" stroke="#ef4444" strokeWidth="2" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="#94a3b8" strokeWidth="1.5" />
                    <polygon points="0,-14 3,-7 -3,-7" fill="#ef4444" />
                    <text x="0" y="-17" textAnchor="middle" fontSize="9" fontWeight="black" fill="#ef4444">N</text>
                  </g>

                  {/* North Reference Line from Base Place */}
                  <line
                    x1={basePlace.x}
                    y1={basePlace.y}
                    x2={basePlace.x}
                    y2={basePlace.y - 65}
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="4,2"
                  />
                  <text x={basePlace.x + 4} y={basePlace.y - 68} fontSize="11" fontWeight="black" fill="#ef4444">
                    N
                  </text>

                  {/* Bearing Vector Line from Base to Destination */}
                  <line
                    x1={basePlace.x}
                    y1={basePlace.y}
                    x2={destPlace.x}
                    y2={destPlace.y}
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />

                  {/* Clockwise Angle Arc */}
                  {(() => {
                    const r = 35;
                    const rad = ((calculatedBearing - 90) * Math.PI) / 180;
                    const xEnd = basePlace.x + r * Math.cos(rad);
                    const yEnd = basePlace.y + r * Math.sin(rad);
                    const largeArc = calculatedBearing > 180 ? 1 : 0;
                    return (
                      <path
                        d={`M ${basePlace.x} ${basePlace.y - r} A ${r} ${r} 0 ${largeArc} 1 ${xEnd} ${yEnd}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                    );
                  })()}

                  {/* Render Map Places */}
                  {MUNICIPALITY_PLACES.map((p) => {
                    const isBase = p.id === basePlaceId;
                    const isDest = p.id === destPlaceId;
                    return (
                      <g key={p.id}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isBase || isDest ? 8 : 6}
                          fill={p.iconColor}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="cursor-pointer"
                          onClick={() => {
                            if (p.id !== basePlaceId) setDestPlaceId(p.id);
                          }}
                        />
                        <text
                          x={p.x}
                          y={p.y + 16}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#1e293b"
                          className="bg-white/80"
                        >
                          {isNe ? p.nameNp.split(' ')[0] : p.nameEn.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Bearing Info Card */}
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase">{L('दिगंश मापन नतिजा (Bearing Result)', 'Bearing Result')}</div>
                  <div className="text-base font-bold text-slate-900">
                    {isNe
                      ? `${basePlace.nameNp} बाट ${destPlace.nameNp} को दिगंश:`
                      : `Bearing of ${destPlace.nameEn} from ${basePlace.nameEn}:`}
                  </div>
                  <div className="text-3xl font-black text-amber-600 tracking-wider">
                    {format3Digit(calculatedBearing)}
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-2">
                    {L(
                      `उत्तर दिशा (North) बाट घडीको सुईको दिशामा नापिएको कोण = ${calculatedBearing}°।`,
                      `Angle measured clockwise from North reference line = ${calculatedBearing}°.`
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Nepal Map Challenge */}
        {mode === 'nepal_map_challenge' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-2xl flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-amber-950" style={{ fontFamily: FONT_NP }}>
                  {L('नेपाल नक्सा दिगंश चुनौती (Nepal Landmarks Bearing Challenge):', 'Nepal Map Bearing Challenge:')}
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  {L('पाठ्यपुस्तकमा उल्लिखित स्थानहरू बीचको दिगंश अनुमान गरी प्रविष्ट गर्नुहोस्।', 'Estimate the bearing between prominent Nepali cities from the textbook.')}
                </p>
              </div>
              <button
                onClick={() => {
                  setNepalIdx((nepalIdx + 1) % NEPAL_LANDMARKS.length);
                  setUserNepalBearing('');
                  setNepalFeedback(null);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                {L('अर्को स्थान', 'Next Landmark')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Nepal Outline Map Graphic */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col items-center">
                <svg width="340" height="220" viewBox="0 0 340 220">
                  {/* Stylized Nepal Map boundary */}
                  <path
                    d="M 30 140 L 70 120 L 120 100 L 160 80 L 230 70 L 290 80 L 320 110 L 300 150 L 250 170 L 190 160 L 140 180 L 70 180 Z"
                    fill="rgba(16, 185, 129, 0.15)"
                    stroke="#059669"
                    strokeWidth="2.5"
                  />

                  {/* North Compass Rose */}
                  <g transform="translate(45, 45)">
                    <line x1="0" y1="10" x2="0" y2="-10" stroke="#ef4444" strokeWidth="2" />
                    <text x="0" y="-13" textAnchor="middle" fontSize="9" fontWeight="black" fill="#ef4444">N</text>
                  </g>

                  {/* Draw Connecting Bearing Line */}
                  <line
                    x1={currentNepal.fromCoord[0]}
                    y1={currentNepal.fromCoord[1]}
                    x2={currentNepal.toCoord[0]}
                    y2={currentNepal.toCoord[1]}
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />

                  {/* North line at starting location */}
                  <line
                    x1={currentNepal.fromCoord[0]}
                    y1={currentNepal.fromCoord[1]}
                    x2={currentNepal.fromCoord[0]}
                    y2={currentNepal.fromCoord[1] - 40}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                  <text x={currentNepal.fromCoord[0] + 4} y={currentNepal.fromCoord[1] - 42} fontSize="10" fontWeight="bold" fill="#ef4444">
                    N
                  </text>

                  {/* Start Point */}
                  <circle cx={currentNepal.fromCoord[0]} cy={currentNepal.fromCoord[1]} r="6" fill="#2563eb" />
                  <text x={currentNepal.fromCoord[0]} y={currentNepal.fromCoord[1] + 16} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e40af">
                    {isNe ? currentNepal.fromNp : currentNepal.fromEn}
                  </text>

                  {/* Destination Point */}
                  <circle cx={currentNepal.toCoord[0]} cy={currentNepal.toCoord[1]} r="6" fill="#dc2626" />
                  <text x={currentNepal.toCoord[0]} y={currentNepal.toCoord[1] + 16} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#dc2626">
                    {isNe ? currentNepal.toNp : currentNepal.toEn}
                  </text>
                </svg>
              </div>

              {/* Challenge input */}
              <div className="space-y-4">
                <div className="text-sm font-bold text-slate-800">
                  {isNe
                    ? `प्रश्न: ${currentNepal.fromNp} बाट ${currentNepal.toNp} को दिगंश कति हुन्छ?`
                    : `Question: What is the bearing of ${currentNepal.toEn} from ${currentNepal.fromEn}?`}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userNepalBearing}
                    onChange={(e) => setUserNepalBearing(e.target.value)}
                    placeholder="e.g. 312°"
                    className="flex-1 px-4 py-2.5 border-2 border-indigo-200 rounded-xl font-bold text-base focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    onClick={handleCheckNepal}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md text-sm flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    {L('जाँच', 'Check')}
                  </button>
                </div>

                {nepalFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold ${
                      nepalFeedback.includes('उत्कृष्ट') || nepalFeedback.includes('Excellent')
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {nepalFeedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default MapReadingBearingExplorer;
