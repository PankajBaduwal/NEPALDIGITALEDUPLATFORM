import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Ruler, CheckCircle, RefreshCw, Calculator, Move } from 'lucide-react';

interface PresetPair {
  id: string;
  nameNp: string;
  nameEn: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const PRESETS: PresetPair[] = [
  { id: 'p1', nameNp: 'A(२, ३) र B(६, ६)', nameEn: 'A(2, 3) and B(6, 6)', x1: 2, y1: 3, x2: 6, y2: 6 },
  { id: 'p2', nameNp: 'A(०, ०) र B(३, ४)', nameEn: 'A(0, 0) and B(3, 4)', x1: 0, y1: 0, x2: 3, y2: 4 },
  { id: 'p3', nameNp: 'A(-४, ०) र B(२, -४)', nameEn: 'A(-4, 0) and B(2, -4)', x1: -4, y1: 0, x2: 2, y2: -4 },
  { id: 'p4', nameNp: 'A(-३, -२) र B(१, १)', nameEn: 'A(-3, -2) and B(1, 1)', x1: -3, y1: -2, x2: 1, y2: 1 }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दुई बिन्दुहरू (x₁, y₁) र (x₂, y₂) बीचको दूरी निकाल्ने सूत्र कुन हो?',
    en: 'What is the distance formula between two points (x₁, y₁) and (x₂, y₂)?',
    options: [
      { key: 'A', label: '√[(x₂ - x₁)² + (y₂ - y₁)²]' },
      { key: 'B', label: '(x₂ - x₁) + (y₂ - y₁)' },
      { key: 'C', label: '√[(x₂ + x₁)² + (y₂ + y₁)²]' },
      { key: 'D', label: '(x₂ - x₁)² - (y₂ - y₁)²' },
    ],
    answer: 'A',
  },
  {
    np: 'मूलबिन्दु (०, ०) र बिन्दु (३, ४) बीचको सीधा दूरी कति हुन्छ?',
    en: 'What is the straight distance between the origin (0, 0) and point (3, 4)?',
    options: [
      { key: 'A', label: '५ एकाइ (5 units)' },
      { key: 'B', label: '७ एकाइ' },
      { key: 'C', label: '२५ एकाइ' },
      { key: 'D', label: '३.५ एकाइ' },
    ],
    answer: 'A',
  },
  {
    np: 'दूरी सूत्र कुन प्रसिद्ध ज्यामितीय साध्य (Theorem) मा आधारित छ?',
    en: 'On which famous geometric theorem is the distance formula based?',
    options: [
      { key: 'A', label: 'पाइथागोरसको साध्य (Pythagoras Theorem)' },
      { key: 'B', label: 'थेल्सको साध्य' },
      { key: 'C', label: 'युक्लिडको साध्य' },
      { key: 'D', label: 'क्षेत्रमिति साध्य' },
    ],
    answer: 'A',
  }
];

export const DistanceBetweenPointsLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U17-02',
    chapter: 17,
    titleNp: 'दुई बिन्दुहरू बीचको दूरी प्रयोगशाला',
    titleEn: 'Distance Between Two Points Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  // Points A and B coordinates
  const [x1, setX1] = useState<number>(2);
  const [y1, setY1] = useState<number>(3);
  const [x2, setX2] = useState<number>(6);
  const [y2, setY2] = useState<number>(6);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'visual' | 'pythagoras' | 'challenge'>('visual');

  // Challenge test state
  const [testDistInput, setTestDistInput] = useState<string>('');
  const [challengeVerdict, setChallengeVerdict] = useState<string | null>(null);

  // Math Calculations
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dxSq = dx * dx;
  const dySq = dy * dy;
  const sumSq = dxSq + dySq;
  const distance = Math.sqrt(sumSq);

  // SVG grid settings (Scale: 24px per unit, center at 200, 200)
  const cx = 200, cy = 180, scale = 24;
  const svgA = { x: cx + x1 * scale, y: cy - y1 * scale };
  const svgB = { x: cx + x2 * scale, y: cy - y2 * scale };
  const svgC = { x: cx + x2 * scale, y: cy - y1 * scale }; // Right angle vertex

  const handleApplyPreset = (p: PresetPair) => {
    setX1(p.x1);
    setY1(p.y1);
    setX2(p.x2);
    setY2(p.y2);
    setChallengeVerdict(null);
    setTestDistInput('');
  };

  const handleCheckChallenge = () => {
    const val = parseFloat(testDistInput);
    if (Math.abs(val - distance) < 0.1) {
      setChallengeVerdict('correct');
      kit.good();
    } else {
      setChallengeVerdict('incorrect');
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
        'नमस्ते! पाइथागोरस साध्य प्रयोग गरी दुई बिन्दुहरू बीचको सीधा दूरी निकाल्ने प्रक्रिया प्रयोगात्मक रूपमा सिकौं!',
        'Hello! Discover how to calculate the straight-line distance between two points using Pythagoras theorem!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'visual' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('१. ग्राफीय रेखाचित्र र दूरी (Visual Graph)', '1. Visual Graph & Distance')}
          </button>
          <button
            onClick={() => setActiveTab('pythagoras')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pythagoras' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('२. पाइथागोरस साध्य विधि (Step-by-Step)', '2. Pythagoras Step-by-Step')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'challenge' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('३. दूरी गणना अभ्यास (Distance Challenge)', '3. Practice Challenge')}
          </button>
        </div>

        {/* Presets Bar */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
            {L('पाठ्यपुस्तकका उदाहरणहरू:', 'Textbook Presets:')}
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-amber-300 transition-all"
            >
              {isNe ? p.nameNp : p.nameEn}
            </button>
          ))}
        </div>

        {/* Sliders for moving points A and B */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900/70 rounded-xl border border-slate-800">
          <div className="space-y-2">
            <div className="text-xs font-bold text-sky-400">
              {L('बिन्दु A(x₁, y₁):', 'Point A(x₁, y₁):')} ({x1}, {y1})
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">x₁:</span>
              <input type="range" min="-6" max="6" value={x1} onChange={(e) => setX1(parseInt(e.target.value))} className="w-full accent-sky-500" />
              <span className="text-xs text-slate-400">y₁:</span>
              <input type="range" min="-6" max="6" value={y1} onChange={(e) => setY1(parseInt(e.target.value))} className="w-full accent-sky-500" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-400">
              {L('बिन्दु B(x₂, y₂):', 'Point B(x₂, y₂):')} ({x2}, {y2})
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">x₂:</span>
              <input type="range" min="-6" max="6" value={x2} onChange={(e) => setX2(parseInt(e.target.value))} className="w-full accent-amber-500" />
              <span className="text-xs text-slate-400">y₂:</span>
              <input type="range" min="-6" max="6" value={y2} onChange={(e) => setY2(parseInt(e.target.value))} className="w-full accent-amber-500" />
            </div>
          </div>
        </div>

        {/* Interactive SVG Stage with Right Triangle */}
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

            {/* Right Triangle Construction */}
            <polygon
              points={`${svgA.x},${svgA.y} ${svgC.x},${svgC.y} ${svgB.x},${svgB.y}`}
              fill="rgba(56, 189, 248, 0.12)"
              stroke="#334155"
              strokeDasharray="4 3"
            />

            {/* Horizontal difference line: AC */}
            <line x1={svgA.x} y1={svgA.y} x2={svgC.x} y2={svgC.y} stroke="#38bdf8" strokeWidth="2.5" />
            <text x={(svgA.x + svgC.x) / 2} y={svgA.y + (y2 >= y1 ? 16 : -8)} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
              Δx = |{x2} - ({x1})| = {Math.abs(dx)}
            </text>

            {/* Vertical difference line: CB */}
            <line x1={svgC.x} y1={svgC.y} x2={svgB.x} y2={svgB.y} stroke="#a855f7" strokeWidth="2.5" />
            <text x={svgC.x + (x2 >= x1 ? 8 : -8)} y={(svgC.y + svgB.y) / 2} fill="#a855f7" fontSize="11" fontWeight="bold" textAnchor={x2 >= x1 ? 'start' : 'end'}>
              Δy = |{y2} - ({y1})| = {Math.abs(dy)}
            </text>

            {/* Direct Distance Hypotenuse: AB */}
            <line x1={svgA.x} y1={svgA.y} x2={svgB.x} y2={svgB.y} stroke="#f59e0b" strokeWidth="3.5" />
            <text x={(svgA.x + svgB.x) / 2 - 10} y={(svgA.y + svgB.y) / 2 - 10} fill="#f59e0b" fontSize="13" fontWeight="bold">
              d = {distance.toFixed(2)}
            </text>

            {/* Points A and B */}
            <circle cx={svgA.x} cy={svgA.y} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
            <text x={svgA.x - 10} y={svgA.y - 10} fill="#38bdf8" fontSize="12" fontWeight="bold">
              A({x1}, {y1})
            </text>

            <circle cx={svgB.x} cy={svgB.y} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
            <text x={svgB.x + 10} y={svgB.y - 10} fill="#f59e0b" fontSize="12" fontWeight="bold">
              B({x2}, {y2})
            </text>
          </svg>
        </div>

        {/* Step-by-Step Pythagoras Calculation */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 font-mono text-xs text-slate-200 space-y-2">
          <div className="text-amber-400 font-sans font-bold text-sm">
            {L('पाइथागोरस साध्यद्वारा दूरी निकाल्ने चरणहरू:', 'Pythagoras Distance Derivation Steps:')}
          </div>
          <div>१. क्षितिज अन्तर (Horizontal difference): x₂ - x₁ = {x2} - ({x1}) = {dx} ⇒ (x₂ - x₁)² = {dxSq}</div>
          <div>२. ठाडो अन्तर (Vertical difference): y₂ - y₁ = {y2} - ({y1}) = {dy} ⇒ (y₂ - y₁)² = {dySq}</div>
          <div>३. दूरी AB = √[(x₂ - x₁)² + (y₂ - y₁)²] = √[{dxSq} + {dySq}] = √{sumSq} = <span className="text-emerald-400 font-bold text-sm">{distance.toFixed(2)} एकाइ</span></div>
        </div>

        {/* Challenge Mode Input */}
        {activeTab === 'challenge' && (
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {L('दूरीको मान अनुमान गर्नुहोस् र जाँच्नुहोस्:', 'Calculate Distance and Verify:')}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300">AB =</span>
              <input
                type="number"
                step="any"
                value={testDistInput}
                onChange={(e) => setTestDistInput(e.target.value)}
                placeholder="e.g. 5"
                className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-amber-400 outline-none"
              />
              <button
                onClick={handleCheckChallenge}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all"
              >
                {L('जाँच गर्नुहोस्', 'Verify Distance')}
              </button>
            </div>

            {challengeVerdict && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold ${
                  challengeVerdict === 'correct'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {challengeVerdict === 'correct'
                  ? L(`🎉 स्याबास! सही दूरी = ${distance.toFixed(2)} एकाइ`, `🎉 Correct! Distance = ${distance.toFixed(2)} units`)
                  : L(`❌ मिलेन! सूत्र: d = √[(${dx})² + (${dy})²] = √${sumSq} = ${distance.toFixed(2)}`, `❌ Incorrect. Solve d = √${sumSq} = ${distance.toFixed(2)}`)}
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default DistanceBetweenPointsLab;
