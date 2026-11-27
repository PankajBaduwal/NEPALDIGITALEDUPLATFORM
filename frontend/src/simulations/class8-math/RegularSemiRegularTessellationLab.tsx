import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Layers, CheckCircle, HelpCircle, RefreshCw } from 'lucide-react';

type TessCategory = 'regular' | 'semiregular';

interface TessPatternItem {
  id: string;
  category: TessCategory;
  nameNp: string;
  nameEn: string;
  notation: string;
  polygonsNp: string;
  polygonsEn: string;
  anglesFormula: string;
  svgType: 'hexagons' | 'squares' | 'triangles' | 'octagons_square' | 'triangles_hexagons';
}

const PATTERNS: TessPatternItem[] = [
  {
    id: 'reg_hex',
    category: 'regular',
    nameNp: 'नियमित षट्भुज (Hexagon 6.6.6)',
    nameEn: 'Hexagonal Regular (6.6.6)',
    notation: '6.6.6',
    polygonsNp: '3 pcs नियमित षट्भुजहरू',
    polygonsEn: '3 Regular Hexagons',
    anglesFormula: '120° + 120° + 120° = 360°',
    svgType: 'hexagons'
  },
  {
    id: 'reg_sq',
    category: 'regular',
    nameNp: 'वर्ग ग्रिड (Square 4.4.4.4)',
    nameEn: 'Square Grid (4.4.4.4)',
    notation: '4.4.4.4',
    polygonsNp: '4 pcs वर्गहरू',
    polygonsEn: '4 Squares',
    anglesFormula: '90° + 90° + 90° + 90° = 360°',
    svgType: 'squares'
  },
  {
    id: 'reg_tri',
    category: 'regular',
    nameNp: 'समबाहु त्रिभुज (Triangle 3.3.3.3.3.3)',
    nameEn: 'Triangular Regular (3.3.3.3.3.3)',
    notation: '3.3.3.3.3.3',
    polygonsNp: '6 pcs समबाहु त्रिभुजहरू',
    polygonsEn: '6 Equilateral Triangles',
    anglesFormula: '60° × 6 = 360°',
    svgType: 'triangles'
  },
  {
    id: 'semi_oct_sq',
    category: 'semiregular',
    nameNp: 'अष्टभुज र वर्ग (Octagon & Square 8.8.4)',
    nameEn: 'Truncated Square (8.8.4)',
    notation: '8.8.4',
    polygonsNp: '2 pcs अष्टभुज र 1 pcs वर्ग',
    polygonsEn: '2 Regular Octagons and 1 Square',
    anglesFormula: '135° + 135° + 90° = 360°',
    svgType: 'octagons_square'
  },
  {
    id: 'semi_tri_hex',
    category: 'semiregular',
    nameNp: 'त्रिभुज र षट्भुज (Triangle & Hexagon 3.6.3.6)',
    nameEn: 'Tri-Hexagonal (3.6.3.6)',
    notation: '3.6.3.6',
    polygonsNp: '2 pcs त्रिभुज र 2 pcs षट्भुज',
    polygonsEn: '2 Triangles and 2 Hexagons',
    anglesFormula: '60° + 120° + 60° + 120° = 360°',
    svgType: 'triangles_hexagons'
  }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'नियमित टेसेलेसन (Regular Tessellation) मा कति प्रकारका नियमित बहुभुज प्रयोग हुन्छन्?',
    en: 'How many types of regular polygons are used in a regular tessellation?',
    options: [
      { key: 'A', label: 'Exactly 1 type only' },
      { key: 'B', label: '2 types' },
      { key: 'C', label: '3 types' },
      { key: 'D', label: 'Any number' },
    ],
    answer: 'A',
  },
  {
    np: 'अष्टभुज र वर्ग मिलेर बन्ने अर्ध-नियमित टेसेलेसनको सङ्केत कुन हो?',
    en: 'What is the vertex notation of the semi-regular tessellation of octagons and squares?',
    options: [
      { key: 'A', label: '8.8.4 (8.8.4)' },
      { key: 'B', label: '4.4.4' },
      { key: 'C', label: '6.6.6' },
      { key: 'D', label: '3.3.4.4' },
    ],
    answer: 'A',
  },
  {
    np: 'संसारमा जम्मा कतिpcs मात्र नियमित टेसेलेसनहरू सम्भव छन्?',
    en: 'How many regular tessellations are mathematically possible?',
    options: [
      { key: 'A', label: 'Only 3 (3.3.3.3.3.3, 4.4.4.4, 6.6.6)' },
      { key: 'B', label: '5 pcs' },
      { key: 'C', label: '8 pcs' },
      { key: 'D', label: 'Countless' },
    ],
    answer: 'A',
  }
];

export const RegularSemiRegularTessellationLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U18-02',
    chapter: 18,
    titleNp: 'नियमित र अर्ध-नियमित टेसेलेसन प्रयोगशाला',
    titleEn: 'Regular and Semi-Regular Tessellation Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [selectedPatternId, setSelectedPatternId] = useState<string>('semi_oct_sq');
  const [showVertexDetail, setShowVertexDetail] = useState<boolean>(true);

  const curPattern = PATTERNS.find((p) => p.id === selectedPatternId) || PATTERNS[3];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! नियमित (एउटै बहुभुज) र अर्ध-नियमित (दुई वा बढी बहुभुज) टेसेलेसनका शीर्षबिन्दु सङ्केतहरू (Vertex Notations) सिकौं!',
        'Hello! Explore regular and semi-regular tessellations along with their mathematical vertex notations!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Pattern Selection Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPatternId(p.id)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedPatternId === p.id
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-mono font-bold text-sm text-amber-300">{p.notation}</div>
              <div className="text-[11px] opacity-90 mt-0.5">
                {p.category === 'regular' ? L('नियमित', 'Regular') : L('अर्ध-नियमित', 'Semi-Regular')}
              </div>
            </button>
          ))}
        </div>

        {/* Pattern Details Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/30 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              {curPattern.category === 'regular' ? L('नियमित टेसेलेसन (Regular Tessellation)', 'Regular Tessellation') : L('अर्ध-नियमित टेसेलेसन (Semi-Regular Tessellation)', 'Semi-Regular Tessellation')}
            </div>
            <div className="text-base font-bold text-slate-100 mt-1">
              {isNe ? curPattern.nameNp : curPattern.nameEn}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              {L('संलग्न बहुभुजहरू:', 'Surrounding Polygons:')} {isNe ? curPattern.polygonsNp : curPattern.polygonsEn}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-right">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">
              {L('शीर्षबिन्दु सङ्केत (Notation):', 'Vertex Notation:')}
            </div>
            <div className="font-mono text-xl font-bold text-emerald-400 mt-0.5">
              {curPattern.notation}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              {curPattern.anglesFormula}
            </div>
          </div>
        </div>

        {/* SVG Visualization Stage */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center select-none">
          <svg viewBox="0 0 460 260" className="w-full max-w-xl h-64">
            <defs>
              <pattern id="gridLabTess" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="460" height="260" fill="url(#gridLabTess)" />

            {/* Truncated Square (8.8.4): Octagons + Small Squares */}
            {curPattern.svgType === 'octagons_square' && (
              <g transform="translate(130, 25)">
                {/* Octagon 1 */}
                <polygon
                  points="30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30"
                  fill="rgba(56, 189, 248, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Octagon 2 to right */}
                <polygon
                  points="140,0 180,0 210,30 210,70 180,100 140,100 110,70 110,30"
                  fill="rgba(56, 189, 248, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Octagon 3 below */}
                <polygon
                  points="30,110 70,110 100,140 100,180 70,210 30,210 0,180 0,140"
                  fill="rgba(56, 189, 248, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Central connecting square */}
                <rect x="70" y="70" width="40" height="40" fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" strokeWidth="2" />

                {/* Common vertex circle & label */}
                <circle cx="70" cy="70" r="5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
                <text x="70" y="55" fill="#22c55e" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Vertex (8.8.4)
                </text>
              </g>
            )}

            {/* Hexagonal (6.6.6) */}
            {curPattern.svgType === 'hexagons' && (
              <g transform="translate(140, 40)">
                {[
                  { cx: 70, cy: 60 },
                  { cx: 130, cy: 60 },
                  { cx: 100, cy: 112 },
                ].map((c, i) => {
                  const r = 35;
                  const pts = [0, 1, 2, 3, 4, 5]
                    .map((k) => {
                      const a = (Math.PI / 3) * k;
                      return `${c.cx + r * Math.cos(a)},${c.cy + r * Math.sin(a)}`;
                    })
                    .join(' ');
                  return (
                    <polygon key={i} points={pts} fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2" />
                  );
                })}
                <circle cx="100" cy="78" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                <text x="100" y="98" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Vertex (6.6.6)
                </text>
              </g>
            )}

            {/* Squares (4.4.4.4) */}
            {curPattern.svgType === 'squares' && (
              <g transform="translate(130, 30)">
                <rect x="20" y="20" width="80" height="80" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2" />
                <rect x="100" y="20" width="80" height="80" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2" />
                <rect x="20" y="100" width="80" height="80" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2" />
                <rect x="100" y="100" width="80" height="80" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="100" cy="100" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="100" y="90" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Vertex (4.4.4.4)
                </text>
              </g>
            )}

            {/* Triangles (3.3.3.3.3.3) */}
            {curPattern.svgType === 'triangles' && (
              <g transform="translate(170, 40)">
                {[0, 1, 2, 3, 4, 5].map((k) => {
                  const r = 70;
                  const a1 = (Math.PI / 3) * k;
                  const a2 = (Math.PI / 3) * (k + 1);
                  return (
                    <polygon
                      key={k}
                      points={`60,80 ${60 + r * Math.cos(a1)},${80 + r * Math.sin(a1)} ${60 + r * Math.cos(a2)},${80 + r * Math.sin(a2)}`}
                      fill="rgba(56, 189, 248, 0.2)"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                  );
                })}
                <circle cx="60" cy="80" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                <text x="60" y="70" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Vertex (3.3.3.3.3.3)
                </text>
              </g>
            )}

            {/* Triangles & Hexagons (3.6.3.6) */}
            {curPattern.svgType === 'triangles_hexagons' && (
              <g transform="translate(150, 40)">
                <polygon points="50,30 90,30 110,65 90,100 50,100 30,65" fill="rgba(34, 197, 94, 0.25)" stroke="#22c55e" strokeWidth="2" />
                <polygon points="120,30 160,30 180,65 160,100 120,100 100,65" fill="rgba(34, 197, 94, 0.25)" stroke="#22c55e" strokeWidth="2" />
                <polygon points="90,30 120,30 105,4" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="2" />
                <polygon points="90,100 120,100 105,126" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="105" cy="30" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="105" y="20" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Vertex (3.6.3.6)
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Vertex Explanation Summary */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-1">
          <div className="font-bold text-amber-400">
            {L('💡 शीर्षबिन्दु सङ्केत (Vertex Notation) कसरी बुझ्ने?', '💡 How to Read Vertex Notation?')}
          </div>
          <div>
            {L(
              'शीर्षबिन्दु वरिपरि घडीको दिशामा घुम्दा भेटिने बहुभुजहरूका भुजाहरूको संख्यालाई थोप्लो (.) ले छुट्याएर लेखिन्छ। जस्तै "8.8.4" ले दुई अष्टभुज (8) र एक वर्ग (4) लाई जनाउँछ।',
              'The notation lists the number of sides of each polygon around the vertex in cyclic order. For example, "8.8.4" means two octagons (8) and one square (4).'
            )}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default RegularSemiRegularTessellationLab;
