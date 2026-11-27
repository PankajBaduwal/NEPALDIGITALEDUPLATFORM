import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { FlipHorizontal, FlipVertical, CheckCircle, RefreshCw } from 'lucide-react';

type MirrorAxis = 'x_axis' | 'y_axis';
type ShapeType = 'point' | 'triangle' | 'rectangle';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'बिन्दु (3, 5) लाई X-अक्षमा परावर्तन गर्दा प्रतिबिम्बको निर्देशांक कति हुन्छ?',
    en: 'What are the coordinates of the image when point (3, 5) is reflected in the x-axis?',
    options: [
      { key: 'A', label: '(3, -5) / (3, -5)' },
      { key: 'B', label: '(-3, 5)' },
      { key: 'C', label: '(-3, -5)' },
      { key: 'D', label: '(5, 3)' },
    ],
    answer: 'A',
  },
  {
    np: 'बिन्दु (-4, 2) लाई Y-अक्षमा परावर्तन गर्दा प्रतिबिम्ब कुन हुन्छ?',
    en: 'What is the image of point (-4, 2) when reflected in the y-axis?',
    options: [
      { key: 'A', label: '(4, 2) / (4, 2)' },
      { key: 'B', label: '(-4, -2)' },
      { key: 'C', label: '(4, -2)' },
      { key: 'D', label: '(2, -4)' },
    ],
    answer: 'A',
  },
  {
    np: 'परावर्तन (Reflection) मा वस्तु र प्रतिबिम्ब बीचको कुन दूरी ऐनाको अक्षसँग बराबर हुन्छ?',
    en: 'In reflection, what distance to the mirror line is equal for both object and image?',
    options: [
      { key: 'A', label: 'Perpendicular distance' },
      { key: 'B', label: 'Curved distance' },
      { key: 'C', label: 'None of these' },
      { key: 'D', label: 'Double the distance' },
    ],
    answer: 'A',
  }
];

export const ReflectionExplorer: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U19-01',
    chapter: 19,
    titleNp: 'परावर्तन अन्वेषक (Reflection Explorer)',
    titleEn: 'Reflection Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [axis, setAxis] = useState<MirrorAxis>('x_axis');
  const [shape, setShape] = useState<ShapeType>('triangle');

  // Triangle vertices state
  const [triA, setTriA] = useState<{ x: number; y: number }>({ x: 2, y: 4 });
  const [triB, setTriB] = useState<{ x: number; y: number }>({ x: 5, y: 1 });
  const [triC, setTriC] = useState<{ x: number; y: number }>({ x: 1, y: 1 });

  // Compute reflected vertices based on axis
  const reflect = (pt: { x: number; y: number }) => {
    return axis === 'x_axis' ? { x: pt.x, y: -pt.y } : { x: -pt.x, y: pt.y };
  };

  const refA = reflect(triA);
  const refB = reflect(triB);
  const refC = reflect(triC);

  // SVG grid settings (Scale: 25px per unit, center at 200, 180)
  const cx = 200, cy = 180, scale = 25;
  const toSvg = (pt: { x: number; y: number }) => ({
    x: cx + pt.x * scale,
    y: cy - pt.y * scale,
  });

  const svgA = toSvg(triA);
  const svgB = toSvg(triB);
  const svgC = toSvg(triC);

  const svgRefA = toSvg(refA);
  const svgRefB = toSvg(refB);
  const svgRefC = toSvg(refC);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! X-अक्ष र Y-अक्षमा वस्तुहरूको ऐना प्रतिबिम्ब (Reflection) र निर्देशांक परिवर्तनका नियमहरू सिकौं!',
        'Hello! Explore reflection across the X and Y axes and learn how coordinates transform under reflection!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Controls: Mirror Axis and Shape */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {L('परावर्तन अक्ष (Reflection Axis):', 'Mirror Axis:')}
            </span>
            <button
              onClick={() => { setAxis('x_axis'); kit.good(); }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                axis === 'x_axis' ? 'bg-amber-600 border-amber-400 text-white shadow' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {L('X-अक्ष (y = 0)', 'X-Axis')}
            </button>
            <button
              onClick={() => { setAxis('y_axis'); kit.good(); }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                axis === 'y_axis' ? 'bg-amber-600 border-amber-400 text-white shadow' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {L('Y-अक्ष (x = 0)', 'Y-Axis')}
            </button>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-amber-300">
            {axis === 'x_axis' ? '(x, y) → (x, -y)' : '(x, y) → (-x, y)'}
          </div>
        </div>

        {/* SVG Cartesian Coordinate Reflection Display */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center select-none">
          <svg viewBox="0 0 400 360" className="w-full max-w-lg h-72">
            {/* Grid */}
            {[-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const xPos = cx + i * scale;
              const yPos = cy + i * scale;
              return (
                <g key={i}>
                  <line x1={xPos} y1="20" x2={xPos} y2="340" stroke={i === 0 ? (axis === 'y_axis' ? '#f43f5e' : '#475569') : '#1e293b'} strokeWidth={i === 0 && axis === 'y_axis' ? 3.5 : 1} />
                  <line x1="20" y1={yPos} x2="380" y2={yPos} stroke={i === 0 ? (axis === 'x_axis' ? '#f43f5e' : '#475569') : '#1e293b'} strokeWidth={i === 0 && axis === 'x_axis' ? 3.5 : 1} />
                </g>
              );
            })}

            {/* Mirror Axis Indicator */}
            {axis === 'x_axis' ? (
              <text x="360" y={cy - 8} fill="#f43f5e" fontSize="12" fontWeight="bold">Mirror (X-axis)</text>
            ) : (
              <text x={cx + 8} y="35" fill="#f43f5e" fontSize="12" fontWeight="bold">Mirror (Y-axis)</text>
            )}

            {/* Connecting Perpendicular Dotted Lines to Mirror Axis */}
            <line x1={svgA.x} y1={svgA.y} x2={svgRefA.x} y2={svgRefA.y} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1={svgB.x} y1={svgB.y} x2={svgRefB.x} y2={svgRefB.y} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1={svgC.x} y1={svgC.y} x2={svgRefC.x} y2={svgRefC.y} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Original Object Triangle (Sky Blue) */}
            <polygon
              points={`${svgA.x},${svgA.y} ${svgB.x},${svgB.y} ${svgC.x},${svgC.y}`}
              fill="rgba(56, 189, 248, 0.2)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
            <circle cx={svgA.x} cy={svgA.y} r="5" fill="#38bdf8" />
            <circle cx={svgB.x} cy={svgB.y} r="5" fill="#38bdf8" />
            <circle cx={svgC.x} cy={svgC.y} r="5" fill="#38bdf8" />
            <text x={svgA.x} y={svgA.y - 8} fill="#38bdf8" fontSize="11" fontWeight="bold">A({triA.x},{triA.y})</text>
            <text x={svgB.x + 8} y={svgB.y} fill="#38bdf8" fontSize="11" fontWeight="bold">B({triB.x},{triB.y})</text>
            <text x={svgC.x - 14} y={svgC.y} fill="#38bdf8" fontSize="11" fontWeight="bold">C({triC.x},{triC.y})</text>

            {/* Reflected Image Triangle (Amber) */}
            <polygon
              points={`${svgRefA.x},${svgRefA.y} ${svgRefB.x},${svgRefB.y} ${svgRefC.x},${svgRefC.y}`}
              fill="rgba(245, 158, 11, 0.25)"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            <circle cx={svgRefA.x} cy={svgRefA.y} r="5" fill="#f59e0b" />
            <circle cx={svgRefB.x} cy={svgRefB.y} r="5" fill="#f59e0b" />
            <circle cx={svgRefC.x} cy={svgRefC.y} r="5" fill="#f59e0b" />
            <text x={svgRefA.x} y={svgRefA.y + 16} fill="#f59e0b" fontSize="11" fontWeight="bold">A'({refA.x},{refA.y})</text>
            <text x={svgRefB.x + 8} y={svgRefB.y + 12} fill="#f59e0b" fontSize="11" fontWeight="bold">B'({refB.x},{refB.y})</text>
            <text x={svgRefC.x - 14} y={svgRefC.y + 12} fill="#f59e0b" fontSize="11" fontWeight="bold">C'({refC.x},{refC.y})</text>
          </svg>
        </div>

        {/* Transformation Coordinate Mapping Table */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="text-xs text-slate-400">Image of vertex A</div>
            <div className="font-mono font-bold text-sm text-slate-200 mt-1">
              A({triA.x}, {triA.y}) → <span className="text-amber-300">A'({refA.x}, {refA.y})</span>
            </div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="text-xs text-slate-400">Image of vertex B</div>
            <div className="font-mono font-bold text-sm text-slate-200 mt-1">
              B({triB.x}, {triB.y}) → <span className="text-amber-300">B'({refB.x}, {refB.y})</span>
            </div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="text-xs text-slate-400">Image of vertex C</div>
            <div className="font-mono font-bold text-sm text-slate-200 mt-1">
              C({triC.x}, {triC.y}) → <span className="text-amber-300">C'({refC.x}, {refC.y})</span>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default ReflectionExplorer;
