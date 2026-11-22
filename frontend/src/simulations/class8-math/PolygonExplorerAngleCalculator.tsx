import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { CircleDot, Calculator, Eye, CheckCircle, RefreshCw } from 'lucide-react';

interface PolygonMeta {
  n: number;
  nameNp: string;
  nameEn: string;
}

const POLYGONS: PolygonMeta[] = [
  { n: 3, nameNp: 'त्रिभुज (Triangle)', nameEn: 'Triangle' },
  { n: 4, nameNp: 'चतुर्भुज (Quadrilateral)', nameEn: 'Quadrilateral' },
  { n: 5, nameNp: 'पञ्चभुज (Pentagon)', nameEn: 'Pentagon' },
  { n: 6, nameNp: 'षट्भुज (Hexagon)', nameEn: 'Hexagon' },
  { n: 7, nameNp: 'सप्तभुज (Heptagon)', nameEn: 'Heptagon' },
  { n: 8, nameNp: 'अष्टभुज (Octagon)', nameEn: 'Octagon' },
  { n: 9, nameNp: 'नवभुज (Nonagon)', nameEn: 'Nonagon' },
  { n: 10, nameNp: 'दशभुज (Decagon)', nameEn: 'Decagon' },
  { n: 12, nameNp: 'द्वादशभुज (Dodecagon)', nameEn: 'Dodecagon' }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'n वटा भुजा भएको बहुभुजका भित्री कोणहरूको योगफल निकाल्ने सूत्र कुन हो?',
    en: 'What is the formula for the sum of interior angles of an n-sided polygon?',
    options: [
      { key: 'A', label: '(n - 2) × १८०°' },
      { key: 'B', label: 'n × १८०°' },
      { key: 'C', label: '(n + 2) × १८०°' },
      { key: 'D', label: '३६०° ÷ n' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै पनि बहुभुजका बाह्य कोणहरू (Exterior angles) को जम्मा योगफल कति हुन्छ?',
    en: 'What is the sum of exterior angles of any convex polygon?',
    options: [
      { key: 'A', label: '१८०°' },
      { key: 'B', label: '३६०° (Always 360°)' },
      { key: 'C', label: '५४०°' },
      { key: 'D', label: 'भुजाको संख्यामा भर पर्छ' },
    ],
    answer: 'B',
  },
  {
    np: 'नियमित षट्भुज (Regular Hexagon, n = ६) को प्रत्येक भित्री कोण कति डिग्रीको हुन्छ?',
    en: 'What is the measure of each interior angle of a regular hexagon (n = 6)?',
    options: [
      { key: 'A', label: '९०°' },
      { key: 'B', label: '१०८°' },
      { key: 'C', label: '१२०° ((6-2)×180° / 6)' },
      { key: 'D', label: '१३५°' },
    ],
    answer: 'C',
  },
  {
    np: 'नियमित अष्टभुज (Regular Octagon, n = ८) को प्रत्येक बाह्य कोण कति हुन्छ?',
    en: 'What is each exterior angle of a regular octagon (n = 8)?',
    options: [
      { key: 'A', label: '४५° (360° ÷ 8)' },
      { key: 'B', label: '६०°' },
      { key: 'C', label: '९०°' },
      { key: 'D', label: '१३५°' },
    ],
    answer: 'A',
  }
];

export const PolygonExplorerAngleCalculator: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U14-03',
    chapter: 14,
    titleNp: 'बहुभुज अन्वेषक र कोण क्यालकुलेटर',
    titleEn: 'Polygon Explorer and Angle Calculator',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [sides, setSides] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<'triangulation' | 'interior' | 'exterior'>('triangulation');
  const [showExteriorExtensions, setShowExteriorExtensions] = useState<boolean>(true);

  const activePoly = POLYGONS.find((p) => p.n === sides) || POLYGONS[2];

  // Mathematical Calculations
  const triangleCount = sides - 2;
  const interiorSum = (sides - 2) * 180;
  const eachInterior = Number((interiorSum / sides).toFixed(2));
  const exteriorSum = 360;
  const eachExterior = Number((360 / sides).toFixed(2));

  // Compute regular polygon vertices for SVG (center at 200, 150; radius 95)
  const cx = 200, cy = 140, r = 95;
  const vertices: { x: number; y: number; extX: number; extY: number }[] = [];
  for (let i = 0; i < sides; i++) {
    // start angle so flat on bottom
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / sides;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    // Extension for exterior angle (extend past vertex i along edge from i-1)
    const prevAngle = -Math.PI / 2 + (2 * Math.PI * (i - 1 + sides)) / sides;
    const prevX = cx + r * Math.cos(prevAngle);
    const prevY = cy + r * Math.sin(prevAngle);
    const dx = x - prevX;
    const dy = y - prevY;
    const extLen = 35;
    const hyp = Math.hypot(dx, dy) || 1;
    const extX = x + (dx / hyp) * extLen;
    const extY = y + (dy / hyp) * extLen;

    vertices.push({ x, y, extX, extY });
  }

  const polygonPoints = vertices.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! बहुभुजलाई त्रिभुजहरूमा विभाजन गरी भित्री र बाह्य कोणका सूत्रहरूको रोचक प्रतिपादन हेरौं!',
        'Hello! Explore regular polygons, interior angle triangulation, and exterior angle formulas!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('triangulation')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'triangulation' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('१. त्रिभुजीकरण विधि (Triangulation: n - 2)', '1. Interior Triangulation')}
          </button>
          <button
            onClick={() => setActiveTab('interior')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'interior' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('२. भित्री कोण गणना (Interior Angles)', '2. Interior Angle Calculator')}
          </button>
          <button
            onClick={() => setActiveTab('exterior')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'exterior' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('३. बाह्य कोण अन्वेषक (Exterior Angles: 360°)', '3. Exterior Angles (360°)')}
          </button>
        </div>

        {/* Side Selector Buttons */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {L('भुजाको संख्या चयन गर्नुहोस् (Number of Sides n):', 'Select Number of Sides (n):')}
          </div>
          <div className="flex flex-wrap gap-2">
            {POLYGONS.map((p) => (
              <button
                key={p.n}
                onClick={() => setSides(p.n)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  sides === p.n
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                n = {p.n} ({isNe ? p.nameNp.split(' ')[0] : p.nameEn})
              </button>
            ))}
          </div>
        </div>

        {/* Visual Geometry Canvas */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
          <svg viewBox="0 0 400 280" className="w-full max-w-xl h-64 select-none">
            <defs>
              <pattern id="gridPoly" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="280" fill="url(#gridPoly)" />

            {/* Polygon Base Shape */}
            <polygon
              points={polygonPoints}
              fill="rgba(245, 158, 11, 0.12)"
              stroke="#f59e0b"
              strokeWidth="3"
            />

            {/* Triangulation Mode: Diagonals from Vertex 0 */}
            {activeTab === 'triangulation' && (
              <g>
                {vertices.slice(2, sides - 1).map((v, i) => (
                  <line
                    key={i}
                    x1={vertices[0].x}
                    y1={vertices[0].y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />
                ))}
                {/* Center label */}
                <text x={cx} y={cy + 10} fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
                  {triangleCount} वटा त्रिभुज ({triangleCount} Triangles)
                </text>
              </g>
            )}

            {/* Exterior Extensions Mode */}
            {activeTab === 'exterior' && (
              <g>
                {vertices.map((v, i) => (
                  <g key={i}>
                    {/* Extended side line */}
                    <line x1={v.x} y1={v.y} x2={v.extX} y2={v.extY} stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 2" />
                    {/* Exterior angle marker dot */}
                    <circle cx={v.extX} cy={v.extY} r="3" fill="#f43f5e" />
                  </g>
                ))}
                <text x={cx} y={cy + 10} fill="#f43f5e" fontSize="13" fontWeight="bold" textAnchor="middle">
                  जम्मा बाह्य कोण = ३६०°
                </text>
              </g>
            )}

            {/* Vertices Dots */}
            {vertices.map((v, i) => (
              <circle key={i} cx={v.x} cy={v.y} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            ))}

            <text x={cx} y="25" fill="#e2e8f0" fontSize="13" fontWeight="bold" textAnchor="middle">
              {isNe ? activePoly.nameNp : activePoly.nameEn} (n = {sides})
            </text>
          </svg>
        </div>

        {/* Dynamic Formula & Calculation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Triangles Count */}
          <div className="p-3.5 bg-slate-900 border border-slate-700 rounded-xl space-y-1">
            <div className="text-xs text-sky-400 font-bold uppercase tracking-wider">
              {L('त्रिभुजको संख्या (Triangles)', 'Number of Triangles')}
            </div>
            <div className="font-mono text-xl font-bold text-sky-300">
              n - 2 = {sides} - 2 = {triangleCount}
            </div>
            <p className="text-xs text-slate-400">
              {L('एउटा शीर्षबिन्दुबाट विकर्ण खिच्दा बन्ने त्रिभुज', 'Triangles formed from a single vertex')}
            </p>
          </div>

          {/* Sum of Interior Angles */}
          <div className="p-3.5 bg-slate-900 border border-slate-700 rounded-xl space-y-1">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              {L('भित्री कोणहरूको जोड (Interior Sum)', 'Interior Angles Sum')}
            </div>
            <div className="font-mono text-xl font-bold text-amber-300">
              ({sides} - 2) × 180° = {interiorSum}°
            </div>
            <p className="text-xs text-slate-400">
              {L(`प्रत्येक भित्री कोण = ${interiorSum}° ÷ ${sides} = ${eachInterior}°`, `Each regular interior angle = ${eachInterior}°`)}
            </p>
          </div>

          {/* Sum of Exterior Angles */}
          <div className="p-3.5 bg-slate-900 border border-slate-700 rounded-xl space-y-1">
            <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">
              {L('बाह्य कोण (Exterior Angles)', 'Exterior Angles')}
            </div>
            <div className="font-mono text-xl font-bold text-rose-300">
              360° ÷ {sides} = {eachExterior}°
            </div>
            <p className="text-xs text-slate-400">
              {L(`भित्री + बाह्य = ${eachInterior}° + ${eachExterior}° = १८०° (रेखीय जोडी)`, `Interior + Exterior = ${eachInterior}° + ${eachExterior}° = 180°`)}
            </p>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default PolygonExplorerAngleCalculator;
