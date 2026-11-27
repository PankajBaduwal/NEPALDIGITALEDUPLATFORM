import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

type AngleHighlight = 'none' | 'alternate' | 'corresponding' | 'cointerior' | 'verticallyOpposite' | 'linearPair';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दुई समानान्तर रेखाहरूलाई एक छेदकले काट्दा एकान्तर कोण (Alternate angles) चिन्न कुन अक्षरको आकार सहयोगी हुन्छ?',
    en: 'When two parallel lines are cut by a transversal, which letter shape helps identify alternate angles?',
    options: [
      { key: 'A', label: 'अक्षर "F"' },
      { key: 'B', label: 'अक्षर "Z"' },
      { key: 'C', label: 'अक्षर "C"' },
      { key: 'D', label: 'अक्षर "X"' }
    ],
    answer: 'B'
  },
  {
    np: 'यदि दुई समानान्तर रेखाभित्रका एकैतिरका क्रमागत भित्री कोण (Co-interior angles) x र ११०° भए x को मान कति हुन्छ?',
    en: 'If one pair of co-interior angles is x and 110°, what is the value of x if lines are parallel?',
    options: [
      { key: 'A', label: '११०°' },
      { key: 'B', label: '७०°' },
      { key: 'C', label: '९०°' },
      { key: 'D', label: '२०°' }
    ],
    answer: 'B'
  },
  {
    np: 'समानान्तर रेखामा संगत कोणहरू (Corresponding angles) कुन अक्षर आकारमा बन्दछन्?',
    en: 'Corresponding angles on parallel lines form which characteristic letter shape?',
    options: [
      { key: 'A', label: 'अक्षर "Z"' },
      { key: 'B', label: 'अक्षर "F"' },
      { key: 'C', label: 'अक्षर "C"' },
      { key: 'D', label: 'अक्षर "V"' }
    ],
    answer: 'B'
  }
];

export const LinesAnglesTransversalExplorer: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U13-01',
    chapter: 13,
    titleNp: 'समानान्तर रेखा र छेदक कोण अन्वेषक',
    titleEn: 'Lines and Angles Transversal Explorer'
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  // Transversal angle in degrees (measured from horizontal)
  const [transversalAngle, setTransversalAngle] = useState<number>(65);
  // Highlight mode
  const [highlightMode, setHighlightMode] = useState<AngleHighlight>('alternate');

  // Acute and obtuse angle calculations
  const theta = transversalAngle; // acute angle if < 90
  const obtuse = 180 - theta;

  // Visual layout coordinates on SVG 500x320
  const y1 = 100; // Line AB
  const y2 = 220; // Line CD
  const centerX = 250;

  // Calculate intersection points with line AB and CD
  const rad = (theta * Math.PI) / 180;
  // x = cx - (y - centerY) / tan(rad)
  const centerY = 160;
  const int1X = centerX - (y1 - centerY) / Math.tan(rad);
  const int2X = centerX - (y2 - centerY) / Math.tan(rad);

  // Transversal endpoints
  const tLen = 140;
  const tX1 = centerX - tLen * Math.cos(rad);
  const tY1 = centerY + tLen * Math.sin(rad);
  const tX2 = centerX + tLen * Math.cos(rad);
  const tY2 = centerY - tLen * Math.sin(rad);

  // Helper to color an angle index
  // Intersection 1 (top):
  // 1: top-left (obtuse or acute), 2: top-right, 3: bottom-left, 4: bottom-right
  // Intersection 2 (bottom):
  // 5: top-left, 6: top-right, 7: bottom-left, 8: bottom-right
  const getAngleColor = (num: number) => {
    if (highlightMode === 'alternate') {
      // Alternate interior: 4 and 5 (or 3 and 6)
      if (num === 4 || num === 5) return '#f59e0b'; // amber
      if (num === 3 || num === 6) return '#06b6d4'; // cyan
    } else if (highlightMode === 'corresponding') {
      // F-shape corresponding pairs: 1 & 5, 2 & 6, 3 & 7, 4 & 8
      if (num === 2 || num === 6) return '#10b981'; // emerald
      if (num === 4 || num === 8) return '#ec4899'; // pink
    } else if (highlightMode === 'cointerior') {
      // Co-interior (C-shape): 4 & 6 (sum 180) or 3 & 5 (sum 180)
      if (num === 4 || num === 6) return '#8b5cf6'; // purple
      if (num === 3 || num === 5) return '#f97316'; // orange
    } else if (highlightMode === 'verticallyOpposite') {
      if (num === 1 || num === 4) return '#3b82f6';
      if (num === 2 || num === 3) return '#eab308';
    } else if (highlightMode === 'linearPair') {
      if (num === 1 || num === 2) return '#ef4444';
    }
    return '#64748b'; // default slate
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! दुई समानान्तर रेखाहरूलाई छेदक (Transversal) ले काट्दा बन्ने ८ वटा कोणहरू र तिनका सम्बन्धहरू पत्ता लगाउनुहोस्!',
        'Hello! Explore the 8 angles formed when a transversal intersects two parallel lines and discover their geometric relationships!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Angle Relationship Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <button
            onClick={() => setHighlightMode('alternate')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              highlightMode === 'alternate'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {L('एकान्तर कोणहरू (Z-Shape)', 'Alternate Angles (Z)')}
          </button>
          <button
            onClick={() => setHighlightMode('corresponding')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              highlightMode === 'corresponding'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {L('संगत कोणहरू (F-Shape)', 'Corresponding (F)')}
          </button>
          <button
            onClick={() => setHighlightMode('cointerior')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              highlightMode === 'cointerior'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md shadow-purple-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {L('क्रमागत भित्री कोण (C-Shape)', 'Co-Interior (C)')}
          </button>
          <button
            onClick={() => setHighlightMode('verticallyOpposite')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              highlightMode === 'verticallyOpposite'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-md shadow-blue-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {L('शीर्षाभिमुख कोण (X-Shape)', 'Vertically Opposite')}
          </button>
          <button
            onClick={() => setHighlightMode('linearPair')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              highlightMode === 'linearPair'
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-md shadow-rose-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {L('आसन्न कोणहरूको जोड (180°)', 'Linear Pair (180°)')}
          </button>
        </div>

        {/* Transversal Angle Slider */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">📐</span>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {L('छेदक रेखाको कोण घुमाउनुहोस् (Tilt Transversal):', 'Transversal Angle Control:')}
              </div>
              <div className="text-amber-400 font-mono font-bold text-sm">
                θ = {transversalAngle}° | (180° - θ) = {180 - transversalAngle}°
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-[200px] max-w-md">
            <input
              type="range"
              min="35"
              max="145"
              value={transversalAngle}
              onChange={(e) => setTransversalAngle(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        {/* Interactive Geometric SVG Canvas */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
          <svg viewBox="0 0 500 320" className="w-full max-w-2xl h-80 select-none">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="500" height="320" fill="url(#grid)" />

            {/* Parallel Line 1: AB */}
            <line x1="40" y1={y1} x2="460" y2={y1} stroke="#38bdf8" strokeWidth="3" />
            <polygon points={`250,${y1 - 6} 260,${y1} 250,${y1 + 6}`} fill="#38bdf8" />
            <text x="30" y={y1 + 5} fill="#38bdf8" fontSize="14" fontWeight="bold">
              A
            </text>
            <text x="470" y={y1 + 5} fill="#38bdf8" fontSize="14" fontWeight="bold">
              B
            </text>

            {/* Parallel Line 2: CD */}
            <line x1="40" y1={y2} x2="460" y2={y2} stroke="#38bdf8" strokeWidth="3" />
            <polygon points={`250,${y2 - 6} 260,${y2} 250,${y2 + 6}`} fill="#38bdf8" />
            <text x="30" y={y2 + 5} fill="#38bdf8" fontSize="14" fontWeight="bold">
              C
            </text>
            <text x="470" y={y2 + 5} fill="#38bdf8" fontSize="14" fontWeight="bold">
              D
            </text>

            {/* Transversal Line: EF */}
            <line x1={tX1} y1={tY1} x2={tX2} y2={tY2} stroke="#f43f5e" strokeWidth="3" strokeDasharray="1 0" />
            <text x={tX1 - 10} y={tY1 + 15} fill="#f43f5e" fontSize="14" fontWeight="bold">
              E
            </text>
            <text x={tX2 + 10} y={tY2 - 5} fill="#f43f5e" fontSize="14" fontWeight="bold">
              F
            </text>

            {/* Intersection 1 (top, int1X, y1) */}
            <circle cx={int1X} cy={y1} r="4" fill="#ffffff" />
            {/* Angle 1: top-left */}
            <text x={int1X - 25} y={y1 - 15} fill={getAngleColor(1)} fontSize="13" fontWeight="bold">
              ∠1 ({transversalAngle < 90 ? obtuse : theta}°)
            </text>
            {/* Angle 2: top-right */}
            <text x={int1X + 15} y={y1 - 15} fill={getAngleColor(2)} fontSize="13" fontWeight="bold">
              ∠2 ({transversalAngle < 90 ? theta : obtuse}°)
            </text>
            {/* Angle 3: bottom-left */}
            <text x={int1X - 30} y={y1 + 25} fill={getAngleColor(3)} fontSize="13" fontWeight="bold">
              ∠3 ({transversalAngle < 90 ? theta : obtuse}°)
            </text>
            {/* Angle 4: bottom-right */}
            <text x={int1X + 15} y={y1 + 25} fill={getAngleColor(4)} fontSize="13" fontWeight="bold">
              ∠4 ({transversalAngle < 90 ? obtuse : theta}°)
            </text>

            {/* Intersection 2 (bottom, int2X, y2) */}
            <circle cx={int2X} cy={y2} r="4" fill="#ffffff" />
            {/* Angle 5: top-left */}
            <text x={int2X - 30} y={y2 - 15} fill={getAngleColor(5)} fontSize="13" fontWeight="bold">
              ∠5 ({transversalAngle < 90 ? obtuse : theta}°)
            </text>
            {/* Angle 6: top-right */}
            <text x={int2X + 15} y={y2 - 15} fill={getAngleColor(6)} fontSize="13" fontWeight="bold">
              ∠6 ({transversalAngle < 90 ? theta : obtuse}°)
            </text>
            {/* Angle 7: bottom-left */}
            <text x={int2X - 30} y={y2 + 25} fill={getAngleColor(7)} fontSize="13" fontWeight="bold">
              ∠7 ({transversalAngle < 90 ? theta : obtuse}°)
            </text>
            {/* Angle 8: bottom-right */}
            <text x={int2X + 15} y={y2 + 25} fill={getAngleColor(8)} fontSize="13" fontWeight="bold">
              ∠8 ({transversalAngle < 90 ? obtuse : theta}°)
            </text>

            {/* Highlight Z-Shape, F-Shape, or C-Shape Lines */}
            {highlightMode === 'alternate' && (
              <polyline
                points={`150,${y1} ${int1X},${y1} ${int2X},${y2} 350,${y2}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeOpacity="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {highlightMode === 'corresponding' && (
              <polyline
                points={`350,${y1} ${int1X},${y1} ${int2X},${y2} 350,${y2}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeOpacity="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {highlightMode === 'cointerior' && (
              <polyline
                points={`350,${y1} ${int1X},${y1} ${int2X},${y2} 350,${y2}`}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="4"
                strokeOpacity="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </div>

        {/* Concept Card Based on Selection */}
        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-3">
          {highlightMode === 'alternate' && (
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <span>🔲</span>
                <span>{L('एकान्तर कोणहरू (Alternate Angles – "Z" आकार)', 'Alternate Angles – "Z" Pattern')}</span>
              </div>
              <p className="text-sm text-slate-300 mt-2">
                {L(
                  'समानान्तर रेखाहरूलाई छेदकले काट्दा भित्री भागमा विपरीत तर्फ बन्ने कोणहरूलाई एकान्तर कोण भनिन्छ। यी कोणहरू सधैं आपसमा बराबर हुन्छन्।',
                  'Alternate interior angles lie on opposite sides of the transversal between the two parallel lines. They are always equal in measure.'
                )}
              </p>
              <div className="font-mono text-xs text-amber-300 mt-2 p-3 bg-amber-950/30 rounded-xl border border-amber-500/20">
                • ∠4 = ∠5 ({transversalAngle < 90 ? obtuse : theta}°) &nbsp;|&nbsp; • ∠3 = ∠6 ({transversalAngle < 90 ? theta : obtuse}°)
              </div>
            </div>
          )}

          {highlightMode === 'corresponding' && (
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <span>🔲</span>
                <span>{L('संगत कोणहरू (Corresponding Angles – "F" आकार)', 'Corresponding Angles – "F" Pattern')}</span>
              </div>
              <p className="text-sm text-slate-300 mt-2">
                {L(
                  'छेदकको एकैतिर र समानान्तर रेखाको माथि वा तल उस्तै स्थानमा पर्ने कोणहरू संगत कोण हुन्। यी सधैं बराबर हुन्छन्।',
                  'Corresponding angles occupy the same relative position at each intersection where a straight line crosses two others. They are always equal.'
                )}
              </p>
              <div className="font-mono text-xs text-emerald-300 mt-2 p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/20">
                • ∠2 = ∠6 &nbsp;|&nbsp; • ∠4 = ∠8 &nbsp;|&nbsp; • ∠1 = ∠5 &nbsp;|&nbsp; • ∠3 = ∠7
              </div>
            </div>
          )}

          {highlightMode === 'cointerior' && (
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
                <span>🔲</span>
                <span>{L('क्रमागत भित्री कोणहरू (Co-Interior Angles – "C" आकार)', 'Co-Interior Angles – "C" Pattern')}</span>
              </div>
              <p className="text-sm text-slate-300 mt-2">
                {L(
                  'समानान्तर रेखाहरूको बीचमा र छेदकको एकैतिर पर्ने कोणहरू क्रमागत भित्री कोण हुन्। यिनको जोड सधैं १८०° (परिपूरक/Supplementary) हुन्छ।',
                  'Consecutive interior angles lie between the parallel lines on the same side of the transversal. Their sum is always 180° (supplementary).'
                )}
              </p>
              <div className="font-mono text-xs text-purple-300 mt-2 p-3 bg-purple-950/30 rounded-xl border border-purple-500/20">
                • ∠4 + ∠6 = {transversalAngle < 90 ? obtuse : theta}° + {transversalAngle < 90 ? theta : obtuse}° = 180°
                &nbsp;|&nbsp; • ∠3 + ∠5 = 180°
              </div>
            </div>
          )}

          {highlightMode === 'verticallyOpposite' && (
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-bold text-base">
                <span>🔲</span>
                <span>{L('शीर्षाभिमुख कोणहरू (Vertically Opposite Angles)', 'Vertically Opposite Angles')}</span>
              </div>
              <p className="text-sm text-slate-300 mt-2">
                {L(
                  'दुई सीधा रेखा आपसमा काटिँदा शीर्ष बिन्दुको विपरीत तर्फ बन्ने कोणहरू शीर्षाभिमुख कोण हुन्। यी बराबर हुन्छन्।',
                  'When two lines intersect, the angles opposite each other are vertically opposite angles and are always equal.'
                )}
              </p>
              <div className="font-mono text-xs text-blue-300 mt-2 p-3 bg-blue-950/30 rounded-xl border border-blue-500/20">
                • ∠1 = ∠4 &nbsp;|&nbsp; • ∠2 = ∠3 &nbsp;|&nbsp; • ∠5 = ∠8 &nbsp;|&nbsp; • ∠6 = ∠7
              </div>
            </div>
          )}

          {highlightMode === 'linearPair' && (
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <span>🔲</span>
                <span>{L('आसन्न कोणहरूको जोड (Linear Pair of Angles)', 'Linear Pair of Angles')}</span>
              </div>
              <p className="text-sm text-slate-300 mt-2">
                {L(
                  'एउटै सरल रेखामा एउटा साझा भुजा भई बन्ने दुई कोणहरूको जोड १८०° हुन्छ (एक सरल कोण)।',
                  'Two adjacent angles that form a straight line add up to 180°.'
                )}
              </p>
              <div className="font-mono text-xs text-rose-300 mt-2 p-3 bg-rose-950/30 rounded-xl border border-rose-500/20">
                • ∠1 + ∠2 = 180° &nbsp;|&nbsp; • ∠3 + ∠4 = 180° &nbsp;|&nbsp; • ∠5 + ∠6 = 180°
              </div>
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};
export default LinesAnglesTransversalExplorer;
