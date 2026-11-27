import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Grid, CheckCircle, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

type PolygonType = 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'octagon';

interface PolyTessMeta {
  type: PolygonType;
  nameNp: string;
  nameEn: string;
  sides: number;
  angle: number;
  canRegularTessellate: boolean;
  vertexCount: number;
  totalAngleAroundVertex: number;
  reasonNp: string;
  reasonEn: string;
}

const SHAPES_DATA: Record<PolygonType, PolyTessMeta> = {
  triangle: {
    type: 'triangle',
    nameNp: 'Equilateral triangle (Equilateral Triangle)',
    nameEn: 'Equilateral Triangle',
    sides: 3,
    angle: 60,
    canRegularTessellate: true,
    vertexCount: 6,
    totalAngleAroundVertex: 360,
    reasonNp: '6 pcs त्रिभुजको 60° कोण शीर्षबिन्दुमा जोडिँदा ठ्याक्कै 360° हुन्छ (6 × 60° = 360°)। त्यसैले नियमित टेसेलेसन बन्दछ।',
    reasonEn: '6 triangles meeting at a vertex form exactly 360° (6 × 60° = 360°), completely covering the plane without gaps.'
  },
  square: {
    type: 'square',
    nameNp: 'Square (Square)',
    nameEn: 'Square',
    sides: 4,
    angle: 90,
    canRegularTessellate: true,
    vertexCount: 4,
    totalAngleAroundVertex: 360,
    reasonNp: '4 pcs Squareको 90° कोण जोडिँदा ठ्याक्कै 360° हुन्छ (4 × 90° = 360°)।',
    reasonEn: '4 squares meeting at a vertex form exactly 360° (4 × 90° = 360°), forming a clean grid tessellation.'
  },
  pentagon: {
    type: 'pentagon',
    nameNp: 'Regular pentagon',
    nameEn: 'Regular Pentagon',
    sides: 5,
    angle: 108,
    canRegularTessellate: false,
    vertexCount: 3,
    totalAngleAroundVertex: 324,
    reasonNp: '3 pcs Pentagon जोड्दा 324° मात्र हुन्छ (36° को खाली ठाउँ / Gap रहन्छ) र 4 pcs जोड्दा 432° भई खप्टिन्छ (Overlap हुन्छ)। त्यसैले नियमित टेसेलेसन बन्दैन!',
    reasonEn: '3 pentagons sum to 324° (leaving a 36° gap) and 4 sum to 432° (overlapping). Regular pentagons cannot tessellate!'
  },
  hexagon: {
    type: 'hexagon',
    nameNp: 'Regular hexagon (Regular Hexagon)',
    nameEn: 'Regular Hexagon',
    sides: 6,
    angle: 120,
    canRegularTessellate: true,
    vertexCount: 3,
    totalAngleAroundVertex: 360,
    reasonNp: '3 pcs षट्भुजको 120° कोण जोडिँदा ठीक 360° हुन्छ (3 × 120° = 360°)। मौरीको चाका (Honeycomb) यसैको उदाहरण हो।',
    reasonEn: '3 regular hexagons meet at 120° each, totaling exactly 360° (3 × 120° = 360°). Honeycombs naturally use this pattern.'
  },
  octagon: {
    type: 'octagon',
    nameNp: 'नियमित अष्टभुज (Regular Octagon)',
    nameEn: 'Regular Octagon',
    sides: 8,
    angle: 135,
    canRegularTessellate: false,
    vertexCount: 2,
    totalAngleAroundVertex: 270,
    reasonNp: '2 pcs अष्टभुज जोड्दा 270° हुन्छ (90° को खाली ठाउँ रहन्छ)। यो खाली ठाउँ भर्न एउटा Square चाहिन्छ (अर्ध-नियमित टेसेलेसन: 8.8.4)।',
    reasonEn: '2 octagons sum to 270° (leaving a 90° gap). It requires a square to close the 360° vertex (semi-regular 8.8.4).'
  }
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै बिन्दुमा बहुभुजहरू खप्टिएर वा खाली ठाउँ नछोडी जोडिन शीर्षबिन्दु वरिपरिका कोणहरूको जोड कति हुनुपर्छ?',
    en: 'For regular polygons to tessellate around a vertex without gaps or overlaps, what must their angles sum to?',
    options: [
      { key: 'A', label: '360° (Exactly 360°)' },
      { key: 'B', label: '180°' },
      { key: 'C', label: '270°' },
      { key: 'D', label: '540°' },
    ],
    answer: 'A',
  },
  {
    np: 'कुन नियमित बहुभुजले मात्र प्रयोग गरी नियमित टेसेलेसन (Regular Tessellation) बनाउन सक्दैन?',
    en: 'Which regular polygon CANNOT form a regular tessellation by itself?',
    options: [
      { key: 'A', label: 'Regular pentagon' },
      { key: 'B', label: 'Equilateral triangle' },
      { key: 'C', label: 'Square' },
      { key: 'D', label: 'Regular hexagon' },
    ],
    answer: 'A',
  },
  {
    np: 'मौरीको चाका (Honeycomb) मा कुन नियमित बहुभुजको टेसेलेसन पाइन्छ?',
    en: 'Which regular polygon tessellation is naturally found in a bee honeycomb?',
    options: [
      { key: 'A', label: 'Regular hexagon (6.6.6)' },
      { key: 'B', label: 'Equilateral triangle' },
      { key: 'C', label: 'Square' },
      { key: 'D', label: 'Pentagon' },
    ],
    answer: 'A',
  }
];

export const TessellationDiscoveryStudio: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U18-01',
    chapter: 18,
    titleNp: 'टेसेलेसन खोजी स्टुडियो',
    titleEn: 'Tessellation Discovery Studio',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeShape, setActiveShape] = useState<PolygonType>('triangle');
  const [tiledRows, setTiledRows] = useState<number>(4);

  const curData = SHAPES_DATA[activeShape];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! कुनै पनि ठाउँ नछोडी र नखप्टिई समतल सतह ढाक्ने टेसेलेसन (Tessellation) को गणितीय रहस्य खोजौं!',
        'Hello! Discover the mathematics of tessellations covering a plane seamlessly without gaps or overlaps!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Shape Selector Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(SHAPES_DATA) as PolygonType[]).map((st) => (
            <button
              key={st}
              onClick={() => {
                setActiveShape(st);
                if (SHAPES_DATA[st].canRegularTessellate) {
                  kit.good();
                } else {
                  kit.oops();
                }
              }}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                activeShape === st
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs">{isNe ? SHAPES_DATA[st].nameNp.split(' ')[0] : SHAPES_DATA[st].nameEn}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{SHAPES_DATA[st].angle}°</div>
            </button>
          ))}
        </div>

        {/* Tessellation Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            curData.canRegularTessellate
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{curData.canRegularTessellate ? '✅' : '❌'}</span>
            <div>
              <div className="font-bold text-sm">
                {curData.canRegularTessellate
                  ? L('नियमित टेसेलेसन बन्दछ! (Tessellates Perfectly)', 'Tessellates Perfectly (No Gaps, No Overlaps)')
                  : L('नियमित टेसेलेसन बन्दैन! (Cannot Tessellate Alone)', 'Cannot Tessellate Alone (Leaves Gaps or Overlaps)')}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {isNe ? curData.reasonNp : curData.reasonEn}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Tiling Stage */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center select-none">
          <svg viewBox="0 0 500 280" className="w-full max-w-2xl h-72">
            <defs>
              <pattern id="tessGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="500" height="280" fill="url(#tessGrid)" />

            {/* Triangle Tiling */}
            {activeShape === 'triangle' && (
              <g transform="translate(100, 30)">
                {[0, 1, 2, 3].map((row) =>
                  [0, 1, 2, 3, 4, 5].map((col) => {
                    const side = 50;
                    const h = side * Math.sin(Math.PI / 3);
                    const x = col * (side / 2);
                    const y = row * h;
                    const isUp = (row + col) % 2 === 0;
                    const p = isUp
                      ? `${x},${y + h} ${x + side},${y + h} ${x + side / 2},${y}`
                      : `${x},${y} ${x + side},${y} ${x + side / 2},${y + h}`;
                    return (
                      <polygon
                        key={`${row}-${col}`}
                        points={p}
                        fill="rgba(56, 189, 248, 0.2)"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                      />
                    );
                  })
                )}
                {/* Vertex Highlight */}
                <circle cx="150" cy="116.8" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                <text x="150" y="140" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">
                  6 × 60° = 360° (3.3.3.3.3.3)
                </text>
              </g>
            )}

            {/* Square Tiling */}
            {activeShape === 'square' && (
              <g transform="translate(110, 30)">
                {[0, 1, 2, 3].map((row) =>
                  [0, 1, 2, 3, 4].map((col) => (
                    <rect
                      key={`${row}-${col}`}
                      x={col * 55}
                      y={row * 55}
                      width="55"
                      height="55"
                      fill="rgba(245, 158, 11, 0.2)"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                    />
                  ))
                )}
                <circle cx="165" cy="110" r="5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
                <text x="165" y="130" fill="#22c55e" fontSize="12" fontWeight="bold" textAnchor="middle">
                  4 × 90° = 360° (4.4.4.4)
                </text>
              </g>
            )}

            {/* Hexagon Tiling */}
            {activeShape === 'hexagon' && (
              <g transform="translate(80, 40)">
                {[0, 1, 2].map((row) =>
                  [0, 1, 2, 3].map((col) => {
                    const r = 35;
                    const x = col * (r * 1.732) + (row % 2 === 1 ? (r * 1.732) / 2 : 0);
                    const y = row * (r * 1.5);
                    const pts = [0, 1, 2, 3, 4, 5]
                      .map((k) => {
                        const a = (Math.PI / 3) * k - Math.PI / 6;
                        return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
                      })
                      .join(' ');
                    return (
                      <polygon
                        key={`${row}-${col}`}
                        points={pts}
                        fill="rgba(34, 197, 94, 0.2)"
                        stroke="#22c55e"
                        strokeWidth="1.5"
                      />
                    );
                  })
                )}
                <circle cx="151" cy="52" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="151" y="75" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                  3 × 120° = 360° (6.6.6)
                </text>
              </g>
            )}

            {/* Pentagon Gap Visualizer */}
            {activeShape === 'pentagon' && (
              <g transform="translate(190, 120)">
                {/* 3 pentagons touching at center */}
                <circle cx="0" cy="0" r="6" fill="#f43f5e" />
                <text x="0" y="24" fill="#f43f5e" fontSize="13" fontWeight="bold" textAnchor="middle">
                  3 × 108° = 324° (a 36° gap!)
                </text>
                <path d="M 0 0 L 60 -30 A 70 70 0 0 1 60 30 Z" fill="rgba(244, 63, 94, 0.3)" stroke="#f43f5e" strokeDasharray="3 3" />
                <text x="80" y="4" fill="#fbbf24" fontSize="11" fontWeight="bold">Gap: 36°</text>
              </g>
            )}

            {/* Octagon Gap Visualizer */}
            {activeShape === 'octagon' && (
              <g transform="translate(200, 120)">
                <circle cx="0" cy="0" r="6" fill="#f43f5e" />
                <text x="0" y="24" fill="#f43f5e" fontSize="13" fontWeight="bold" textAnchor="middle">
                  2 × 135° = 270° (a 90° gap, a square is needed!)
                </text>
                <rect x="0" y="-45" width="45" height="45" fill="rgba(56, 189, 248, 0.3)" stroke="#38bdf8" strokeDasharray="4 3" />
                <text x="22" y="-20" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">90° square</text>
              </g>
            )}
          </svg>
        </div>

        {/* Mathematical Vertex Analysis Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="text-xs text-slate-400">{L('प्रत्येक भित्री कोण', 'Interior Angle')}</div>
            <div className="font-mono font-bold text-xl text-amber-300 mt-1">{curData.angle}°</div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="text-xs text-slate-400">{L('शीर्षबिन्दु वरिपरिको योगफल', 'Angle Around Vertex')}</div>
            <div className={`font-mono font-bold text-xl mt-1 ${curData.canRegularTessellate ? 'text-emerald-400' : 'text-rose-400'}`}>
              {curData.totalAngleAroundVertex}°
            </div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="text-xs text-slate-400">{L('360° पूरा हुने सर्त', 'Divides 360° Exactly')}</div>
            <div className="font-mono font-bold text-sm text-slate-200 mt-2">
              360° ÷ {curData.angle}° = {(360 / curData.angle).toFixed(2)} {curData.canRegularTessellate ? '✅' : '❌'}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default TessellationDiscoveryStudio;
