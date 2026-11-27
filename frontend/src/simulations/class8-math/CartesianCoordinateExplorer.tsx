import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Target, Move, CheckCircle, RefreshCw, Compass } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  label: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'निर्देशाङ्क (-३, ४) समतलको कुन चतुर्थांश (Quadrant) मा पर्दछ?',
    en: 'In which quadrant does the point (-3, 4) lie?',
    options: [
      { key: 'A', label: 'पहिलो (Quadrant I)' },
      { key: 'B', label: 'दोस्रो (Quadrant II)' },
      { key: 'C', label: 'तेस्रो (Quadrant III)' },
      { key: 'D', label: 'चौथो (Quadrant IV)' },
    ],
    answer: 'B',
  },
  {
    np: 'मूलबिन्दु (Origin) को निर्देशांक कुन हो?',
    en: 'What are the coordinates of the origin?',
    options: [
      { key: 'A', label: '(०, ०) / (0, 0)' },
      { key: 'B', label: '(१, १)' },
      { key: 'C', label: '(०, १)' },
      { key: 'D', label: '(१, ०)' },
    ],
    answer: 'A',
  },
  {
    np: 'X-अक्षमा पर्ने कुनै पनि बिन्दुको Y-निर्देशाङ्क कति हुन्छ?',
    en: 'What is the y-coordinate of any point lying on the x-axis?',
    options: [
      { key: 'A', label: '० (Zero)' },
      { key: 'B', label: '१' },
      { key: 'C', label: '-१' },
      { key: 'D', label: 'जुनसुकै' },
    ],
    answer: 'A',
  },
  {
    np: 'बिन्दु (४, -५) समतलको कुन चतुर्थांशमा पर्दछ?',
    en: 'In which quadrant does the point (4, -5) lie?',
    options: [
      { key: 'A', label: 'पहिलो (I)' },
      { key: 'B', label: 'दोस्रो (II)' },
      { key: 'C', label: 'तेस्रो (III)' },
      { key: 'D', label: 'चौथो (Quadrant IV)' },
    ],
    answer: 'D',
  }
];

export const CartesianCoordinateExplorer: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U17-01',
    chapter: 17,
    titleNp: 'कार्तीय निर्देशांक अन्वेषक',
    titleEn: 'Cartesian Coordinate Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'explore' | 'quadrants' | 'hunt'>('explore');

  // Interactive primary point coordinates (from -6 to +6)
  const [pointX, setPointX] = useState<number>(3);
  const [pointY, setPointY] = useState<number>(4);

  // Manual input fields
  const [inputX, setInputX] = useState<string>('3');
  const [inputY, setInputY] = useState<string>('4');

  // Treasure hunt state
  const [targetPoint, setTargetPoint] = useState<{ x: number; y: number }>({ x: -3, y: 2 });
  const [huntScore, setHuntScore] = useState<number>(0);
  const [huntFeedback, setHuntFeedback] = useState<string | null>(null);

  // Determine Quadrant / Axis
  const getQuadrantInfo = (x: number, y: number) => {
    if (x === 0 && y === 0) return { np: 'मूलबिन्दु (Origin)', en: 'Origin (0,0)', color: 'text-amber-400' };
    if (x === 0) return { np: 'Y-अक्षमा (On Y-axis)', en: 'On Y-axis', color: 'text-sky-400' };
    if (y === 0) return { np: 'X-अक्षमा (On X-axis)', en: 'On X-axis', color: 'text-sky-400' };
    if (x > 0 && y > 0) return { np: 'पहिलो चतुर्थांश (Quadrant I: +, +)', en: 'Quadrant I (+, +)', color: 'text-emerald-400' };
    if (x < 0 && y > 0) return { np: 'दोस्रो चतुर्थांश (Quadrant II: -, +)', en: 'Quadrant II (-, +)', color: 'text-purple-400' };
    if (x < 0 && y < 0) return { np: 'तेस्रो चतुर्थांश (Quadrant III: -, -)', en: 'Quadrant III (-, -)', color: 'text-rose-400' };
    return { np: 'चौथो चतुर्थांश (Quadrant IV: +, -)', en: 'Quadrant IV (+, -)', color: 'text-amber-400' };
  };

  const quad = getQuadrantInfo(pointX, pointY);

  // SVG grid dimensions (500x500, center at 250, 250, scale 30px per unit)
  const cx = 250, cy = 250, scale = 32;
  const svgX = cx + pointX * scale;
  const svgY = cy - pointY * scale;

  const handleGridClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert SVG pixel to integer coordinate (-6 to 6)
    const rawX = Math.round((clickX - cx) / scale);
    const rawY = Math.round((cy - clickY) / scale);

    const clampedX = Math.max(-6, Math.min(6, rawX));
    const clampedY = Math.max(-6, Math.min(6, rawY));

    setPointX(clampedX);
    setPointY(clampedY);
    setInputX(clampedX.toString());
    setInputY(clampedY.toString());

    if (activeTab === 'hunt') {
      if (clampedX === targetPoint.x && clampedY === targetPoint.y) {
        kit.good();
        setHuntScore((s) => s + 1);
        setHuntFeedback(L('🎉 सही! खजाना भेटियो!', '🎉 Correct! Treasure found!'));
        // Generate new target
        const rx = Math.floor(Math.random() * 11) - 5;
        const ry = Math.floor(Math.random() * 11) - 5;
        setTargetPoint({ x: rx, y: ry });
      } else {
        kit.oops();
        setHuntFeedback(L(`❌ मिलेन। तपाईंले (${clampedX}, ${clampedY}) छान्नुभयो। पुनः खोज्नुहोस्।`, `❌ Not there! You picked (${clampedX}, ${clampedY}). Try again!`));
      }
    }
  };

  const handleApplyInput = () => {
    const nx = parseInt(inputX) || 0;
    const ny = parseInt(inputY) || 0;
    const clampedX = Math.max(-6, Math.min(6, nx));
    const clampedY = Math.max(-6, Math.min(6, ny));
    setPointX(clampedX);
    setPointY(clampedY);
    kit.good();
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! कार्तीय निर्देशांक समतलमा बिन्दुहरू खोज्ने, चतुर्थांश चिन्ने र खजाना खोज्ने खेल खेलौं!',
        'Hello! Explore Cartesian coordinates, identify quadrants, and play coordinate treasure hunt!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'explore' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('१. निर्देशांक अन्वेषक (Coordinate Explorer)', '1. Coordinate Explorer')}
          </button>
          <button
            onClick={() => setActiveTab('quadrants')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'quadrants' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('२. चार चतुर्थांशहरू (Quadrants I - IV)', '2. Four Quadrants')}
          </button>
          <button
            onClick={() => setActiveTab('hunt')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'hunt' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('३. खजाना खोज खेल (Treasure Hunt)', '3. Treasure Hunt Game')}
          </button>
        </div>

        {/* Coordinate Info Bar & Manual Inputs */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">
                {L('हालको बिन्दुको निर्देशांक (Current Point):', 'Current Coordinates:')}
              </div>
              <div className="text-xl font-mono font-bold text-amber-300">
                P({pointX}, {pointY}) &nbsp;
                <span className={`text-sm font-sans font-semibold ${quad.color}`}>
                  [{isNe ? quad.np : quad.en}]
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-mono">X:</span>
            <input
              type="number"
              min="-6"
              max="6"
              value={inputX}
              onChange={(e) => setInputX(e.target.value)}
              className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-sm text-center"
            />
            <span className="text-xs text-slate-300 font-mono">Y:</span>
            <input
              type="number"
              min="-6"
              max="6"
              value={inputY}
              onChange={(e) => setInputY(e.target.value)}
              className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-sm text-center"
            />
            <button
              onClick={handleApplyInput}
              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
            >
              {L('प्लट गर्नुहोस्', 'Plot')}
            </button>
          </div>
        </div>

        {/* Treasure Hunt Target Banner */}
        {activeTab === 'hunt' && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏴‍☠️</span>
              <span className="text-xs text-amber-200 font-semibold">
                {L(`लक्ष्य बिन्दु खोज्नुहोस्: (${targetPoint.x}, ${targetPoint.y}) मा क्लिक गर्नुहोस्!`, `Find target point: Click on (${targetPoint.x}, ${targetPoint.y})!`)}
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-emerald-400">
              {L('प्राप्ताङ्क (Score):', 'Score:')} {huntScore}
            </div>
          </div>
        )}

        {/* Interactive SVG Cartesian Grid */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center select-none relative">
          <svg
            viewBox="0 0 500 500"
            className="w-full max-w-lg h-96 cursor-crosshair"
            onClick={handleGridClick}
          >
            {/* Background Grid Lines */}
            {[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((i) => {
              const xPos = cx + i * scale;
              const yPos = cy + i * scale;
              return (
                <g key={i}>
                  <line x1={xPos} y1="30" x2={xPos} y2="470" stroke={i === 0 ? '#38bdf8' : '#1e293b'} strokeWidth={i === 0 ? 2.5 : 1} />
                  <line x1="30" y1={yPos} x2="470" y2={yPos} stroke={i === 0 ? '#38bdf8' : '#1e293b'} strokeWidth={i === 0 ? 2.5 : 1} />
                  {i !== 0 && (
                    <>
                      <text x={xPos} y={cy + 16} fill="#94a3b8" fontSize="11" textAnchor="middle">{i}</text>
                      <text x={cx - 10} y={cy - i * scale + 4} fill="#94a3b8" fontSize="11" textAnchor="end">{i}</text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Origin Label */}
            <circle cx={cx} cy={cy} r="4" fill="#38bdf8" />
            <text x={cx - 12} y={cy + 16} fill="#38bdf8" fontSize="12" fontWeight="bold">O(0,0)</text>

            {/* Axis Labels */}
            <text x="480" y={cy + 4} fill="#38bdf8" fontSize="13" fontWeight="bold">X</text>
            <text x="15" y={cy + 4} fill="#38bdf8" fontSize="13" fontWeight="bold">X'</text>
            <text x={cx + 6} y="22" fill="#38bdf8" fontSize="13" fontWeight="bold">Y</text>
            <text x={cx + 6} y="485" fill="#38bdf8" fontSize="13" fontWeight="bold">Y'</text>

            {/* Quadrant Watermarks */}
            {activeTab === 'quadrants' && (
              <g opacity="0.6">
                <text x="360" y="140" fill="#10b981" fontSize="18" fontWeight="bold" textAnchor="middle">I (+, +)</text>
                <text x="140" y="140" fill="#a855f7" fontSize="18" fontWeight="bold" textAnchor="middle">II (-, +)</text>
                <text x="140" y="360" fill="#f43f5e" fontSize="18" fontWeight="bold" textAnchor="middle">III (-, -)</text>
                <text x="360" y="360" fill="#f59e0b" fontSize="18" fontWeight="bold" textAnchor="middle">IV (+, -)</text>
              </g>
            )}

            {/* Distance rays from origin to point */}
            <line x1={cx} y1={cy} x2={svgX} y2={cy} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
            <line x1={svgX} y1={cy} x2={svgX} y2={svgY} stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" />

            {/* Point P Marker */}
            <circle cx={svgX} cy={svgY} r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
            <text x={svgX + 8} y={svgY - 8} fill="#f59e0b" fontSize="13" fontWeight="bold">
              P({pointX}, {pointY})
            </text>

            {/* Target marker in treasure hunt */}
            {activeTab === 'hunt' && (
              <circle cx={cx + targetPoint.x * scale} cy={cy - targetPoint.y * scale} r="14" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 3" className="animate-pulse" />
            )}
          </svg>

          {huntFeedback && activeTab === 'hunt' && (
            <div className="mt-2 text-xs font-bold text-amber-300">
              {huntFeedback}
            </div>
          )}

          <div className="text-[11px] text-slate-400 mt-2">
            💡 {L('समतलमा जहाँसुकै क्लिक गरी निर्देशांक तुरुन्त पत्ता लगाउनुहोस्।', 'Click anywhere on the grid to plot or identify coordinates immediately.')}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default CartesianCoordinateExplorer;
