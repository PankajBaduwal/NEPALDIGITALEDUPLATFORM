import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Palette, CheckCircle, RefreshCw, Sparkles, Paintbrush } from 'lucide-react';

const COLORS = [
  { id: 'amber', hex: '#f59e0b', nameNp: 'पहेँलो', nameEn: 'Amber' },
  { id: 'sky', hex: '#38bdf8', nameNp: 'नीलो', nameEn: 'Sky' },
  { id: 'emerald', hex: '#10b981', nameNp: 'हरियो', nameEn: 'Emerald' },
  { id: 'purple', hex: '#a855f7', nameNp: 'बैजनी', nameEn: 'Purple' },
  { id: 'rose', hex: '#f43f5e', nameNp: 'रातो', nameEn: 'Rose' },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'टेसेलेसन डिजाइन गर्दा दुई बहुभुजहरू बीच खाली ठाउँ (Gap) वा खप्टाइ (Overlap) हुन पाउँछ कि पाउँदैन?',
    en: 'Can there be any gaps or overlaps between polygons in a tessellation?',
    options: [
      { key: 'A', label: 'Neither gaps nor overlaps are allowed' },
      { key: 'B', label: 'Only gaps are allowed' },
      { key: 'C', label: 'Overlaps are allowed' },
      { key: 'D', label: 'As you wish' },
    ],
    answer: 'A',
  },
  {
    np: 'रङ्गीचङ्गी भुइँको टायल (Floor Tiling) कुन गणितीय सिद्धान्तमा आधारित छ?',
    en: 'Colorful floor tiling is an application of which mathematical principle?',
    options: [
      { key: 'A', label: 'Tessellation' },
      { key: 'B', label: 'Quadratic equation' },
      { key: 'C', label: 'Volume' },
      { key: 'D', label: 'Common factor' },
    ],
    answer: 'A',
  }
];

export const TessellationPatternDesigner: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U18-03',
    chapter: 18,
    titleNp: 'टेसेलेसन ढाँचा रचनाकार',
    titleEn: 'Tessellation Pattern Designer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeColor, setActiveColor] = useState<string>('#f59e0b');
  const [designerMode, setDesignerMode] = useState<'free_square' | 'free_hex' | 'challenge'>('free_hex');

  // Hexagon grid colors state (rows 4, cols 5)
  const [hexGridColors, setHexGridColors] = useState<Record<string, string>>({
    '0-0': '#38bdf8', '0-1': '#10b981', '0-2': '#f59e0b', '0-3': '#a855f7',
    '1-0': '#f59e0b', '1-1': '#38bdf8', '1-2': '#a855f7', '1-3': '#10b981',
    '2-0': '#10b981', '2-1': '#a855f7', '2-2': '#38bdf8', '2-3': '#f59e0b',
  });

  // Square grid colors state (rows 4, cols 6)
  const [squareGridColors, setSquareGridColors] = useState<Record<string, string>>({});

  // Challenge task: complete hexagon (1,2) with color #f59e0b
  const [challengeComplete, setChallengeComplete] = useState<boolean>(false);

  const handleHexClick = (row: number, col: number) => {
    const key = `${row}-${col}`;
    setHexGridColors((prev) => ({ ...prev, [key]: activeColor }));
    kit.good();

    if (designerMode === 'challenge' && row === 1 && col === 2) {
      setChallengeComplete(true);
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    const key = `${row}-${col}`;
    setSquareGridColors((prev) => ({ ...prev, [key]: activeColor }));
    kit.good();
  };

  const handleClear = () => {
    setHexGridColors({});
    setSquareGridColors({});
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! रङ्गीन टायल र षट्भुजहरू मिलाएर आफ्नै सुन्दर टेसेलेसन ढाँचा तयार गर्नुहोस्!',
        'Hello! Design your own seamless colorful tessellation patterns using hexagons and squares!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Designer Mode Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setDesignerMode('free_hex')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              designerMode === 'free_hex' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('1. षट्भुज मौरीको चाका ढाँचा (Hexagon Honeycomb)', '1. Hexagon Honeycomb')}
          </button>
          <button
            onClick={() => setDesignerMode('free_square')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              designerMode === 'free_square' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('2. वर्गाकार भुइँ टायल (Square Floor Tiling)', '2. Square Tiling')}
          </button>
          <button
            onClick={() => setDesignerMode('challenge')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              designerMode === 'challenge' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('3. छुटेको टायल चुनौती (Missing Tile Challenge)', '3. Missing Tile Challenge')}
          </button>
        </div>

        {/* Color Palette Selector */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-amber-400" />
            <span className="text-xs font-bold text-slate-300">
              {L('टायलको रङ छान्नुहोस् (Pick Tile Color):', 'Pick Color:')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={`w-7 h-7 rounded-full transition-transform ${
                  activeColor === c.hex ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-80 hover:opacity-100'
                }`}
                title={isNe ? c.nameNp : c.nameEn}
              />
            ))}
            <button
              onClick={handleClear}
              className="ml-3 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 flex items-center gap-1"
            >
              <RefreshCw size={12} />
              {L('खाली गर्नुहोस्', 'Clear')}
            </button>
          </div>
        </div>

        {/* Interactive Drawing Canvas */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center select-none">
          <svg viewBox="0 0 460 260" className="w-full max-w-xl h-64">
            {/* Hexagon Pattern Grid */}
            {(designerMode === 'free_hex' || designerMode === 'challenge') && (
              <g transform="translate(60, 25)">
                {[0, 1, 2, 3].map((row) =>
                  [0, 1, 2, 3, 4].map((col) => {
                    const r = 26;
                    const x = col * (r * 1.732) + (row % 2 === 1 ? (r * 1.732) / 2 : 0);
                    const y = row * (r * 1.5);
                    const key = `${row}-${col}`;
                    const fillColor = hexGridColors[key] || 'rgba(30, 41, 59, 0.4)';
                    const isMissingInChallenge = designerMode === 'challenge' && row === 1 && col === 2 && !challengeComplete;

                    const pts = [0, 1, 2, 3, 4, 5]
                      .map((k) => {
                        const a = (Math.PI / 3) * k - Math.PI / 6;
                        return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
                      })
                      .join(' ');

                    return (
                      <g key={key} onClick={() => handleHexClick(row, col)} className="cursor-pointer">
                        <polygon
                          points={pts}
                          fill={isMissingInChallenge ? 'none' : fillColor}
                          stroke={isMissingInChallenge ? '#f43f5e' : '#475569'}
                          strokeWidth={isMissingInChallenge ? 2.5 : 1}
                          strokeDasharray={isMissingInChallenge ? '4 3' : 'none'}
                          className="hover:stroke-white transition-colors"
                        />
                        {isMissingInChallenge && (
                          <text x={x} y={y + 4} fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="middle">
                            ?
                          </text>
                        )}
                      </g>
                    );
                  })
                )}
              </g>
            )}

            {/* Square Pattern Grid */}
            {designerMode === 'free_square' && (
              <g transform="translate(70, 20)">
                {[0, 1, 2, 3, 4].map((row) =>
                  [0, 1, 2, 3, 4, 5, 6].map((col) => {
                    const size = 42;
                    const key = `${row}-${col}`;
                    const fillColor = squareGridColors[key] || 'rgba(30, 41, 59, 0.4)';
                    return (
                      <rect
                        key={key}
                        x={col * size}
                        y={row * size}
                        width={size}
                        height={size}
                        fill={fillColor}
                        stroke="#475569"
                        strokeWidth="1"
                        className="cursor-pointer hover:stroke-white transition-colors"
                        onClick={() => handleSquareClick(row, col)}
                      />
                    );
                  })
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Challenge Feedback */}
        {designerMode === 'challenge' && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-bold ${
              challengeComplete
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
          >
            {challengeComplete
              ? L('🎉 बधाई छ! तपाईंले छुटेको षट्भुज टायल रङ्गाएर टेसेलेसन पूरा गर्नुभयो!', '🎉 Great job! You filled the missing hexagonal tile to complete the 6.6.6 tessellation!')
              : L('चुनौती: रातो डट भएको छुटेको षट्भुज (?) मा क्लिक गरी टेसेलेसन पूरा गर्नुहोस्!', 'Challenge: Click on the missing dotted hexagon (?) with any color to complete the tessellation!')}
          </div>
        )}

        <div className="text-[11px] text-slate-400 text-center">
          💡 {L('टायलमा क्लिक गरेर रङ भर्नुहोस्। कुनै पनि खाली ठाउँ नराखी ढाँचा बनाउनुहोस्।', 'Click on any tile to paint it with the selected color without leaving gaps.')}
        </div>
      </div>
    </SimFrame2D>
  );
};
export default TessellationPatternDesigner;
