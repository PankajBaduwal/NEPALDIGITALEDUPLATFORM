import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'यदि दुई सीधा रेखालाई छेदकले काट्दा एकान्तर कोणहरू बराबर भए ती रेखाहरू कस्ता हुन्छन्?',
    en: 'If alternate interior angles are equal, what can we conclude about the two lines?',
    options: [
      { key: 'A', label: 'तिनीहरू लम्ब हुन्छन्' },
      { key: 'B', label: 'तिनीहरू समानान्तर हुन्छन् (Parallel)' },
      { key: 'C', label: 'तिनीहरू ९०° मा जोडिन्छन्' },
      { key: 'D', label: 'तिनीहरू बाङ्गा हुन्छन्' }
    ],
    answer: 'B'
  },
  {
    np: 'यदि एकैतर्फका क्रमागत भित्री कोणहरूको जोड १७०° भए, के ती रेखाहरू समानान्तर हुन्?',
    en: 'If the sum of co-interior angles is 170°, are the lines parallel?',
    options: [
      { key: 'A', label: 'हो, सधैं' },
      { key: 'B', label: 'होइन, समानान्तर छैनन् (Not parallel)' },
      { key: 'C', label: 'यदि तेर्सो भए मात्र' },
      { key: 'D', label: 'भन्न सकिँदैन' }
    ],
    answer: 'B'
  },
  {
    np: 'कोणको डिग्री नाप्न परम्परागत रूपमा कुन ज्यामितीय उपकरण प्रयोग गरिन्छ?',
    en: 'Which tool is traditionally used to measure angle degrees precisely?',
    options: [
      { key: 'A', label: 'कम्पास' },
      { key: 'B', label: 'चाँदा (Protractor)' },
      { key: 'C', label: 'स्केल' },
      { key: 'D', label: 'डिभाइडर' }
    ],
    answer: 'B'
  }
];

export const ParallelLinesAngleRelationshipLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U13-02',
    chapter: 13,
    titleNp: 'समानान्तर रेखा र कोण सम्बन्ध प्रयोगशाला',
    titleEn: 'Parallel Lines Angle Relationship Lab'
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  // Tilt of line 2 (0 = perfectly parallel to line 1)
  const [line2Tilt, setLine2Tilt] = useState<number>(0);
  const [showProtractor, setShowProtractor] = useState<boolean>(true);
  const [activeTestCriterion, setActiveTestCriterion] = useState<'alternate' | 'cointerior' | 'corresponding'>('alternate');

  // Transversal inclination
  const transversalDeg = 60;
  const isParallel = Math.abs(line2Tilt) === 0;

  // Angles for line 1 (tilt = 0)
  const angle1_acute = transversalDeg;
  const angle1_obtuse = 180 - transversalDeg;

  // Angles for line 2 (affected by tilt)
  const angle2_acute = transversalDeg + line2Tilt;
  const angle2_obtuse = 180 - angle2_acute;

  // Evaluation of criteria
  const cointeriorSum = angle1_obtuse + angle2_acute;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! दुई रेखाहरू समानान्तर छन् कि छैनन् भनेर कोण नापेर र तिनको सम्बन्ध जाँचेर परीक्षण गर्नुहोस्!',
        'Hello! Test whether two lines are parallel by examining their angles and verifying geometric conditions!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Parallel Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            isParallel
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isParallel ? '✅' : '⚠️'}</span>
            <div>
              <div className="font-bold text-sm">
                {isParallel
                  ? L('रेखाहरू समानान्तर छन्! (Lines are PARALLEL: AB ∥ CD)', 'Lines are PARALLEL (AB ∥ CD)')
                  : L('रेखाहरू समानान्तर छैनन्! (Lines are NOT Parallel)', 'Lines are NOT Parallel')}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {isParallel
                  ? L('एकान्तर कोण बराबर छन् र क्रमागत भित्री कोणको जोड १८०° छ।', 'Alternate angles are equal, co-interior sum is exactly 180°.')
                  : L('दोस्रो रेखा ढल्केको छ। समानान्तर बनाउन तलको स्लाइडरलाई ०° मा लैजानुहोस्।', 'Line CD is tilted. Move slider to 0° to make lines parallel.')}
              </div>
            </div>
          </div>
          <button
            onClick={() => setLine2Tilt(0)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            {L('समानान्तर बनाउनुहोस् (Reset)', 'Make Parallel')}
          </button>
        </div>

        {/* Interactive Controls */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
            <label className="text-xs text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
              {L('दोस्रो रेखा (CD) को ढल्काइ (Line CD Tilt):', 'Tilt of Line CD:')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-25"
                max="25"
                value={line2Tilt}
                onChange={(e) => setLine2Tilt(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <span className="font-mono text-sm font-bold text-cyan-300 w-12 text-center">
                {line2Tilt > 0 ? `+${line2Tilt}°` : `${line2Tilt}°`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProtractor(!showProtractor)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                showProtractor
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {showProtractor ? L('📐 चाँदा लुकाउनुहोस्', 'Hide Protractor') : L('📐 चाँदा देखाउनुहोस्', 'Show Protractor')}
            </button>
          </div>
        </div>

        {/* Criteria Selection Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTestCriterion('alternate')}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              activeTestCriterion === 'alternate'
                ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            {L('१. एकान्तर कोण परीक्षण (Alternate Angles)', '1. Alternate Angles Test')}
          </button>
          <button
            onClick={() => setActiveTestCriterion('cointerior')}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              activeTestCriterion === 'cointerior'
                ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            {L('२. क्रमागत भित्री कोण परीक्षण (Co-Interior Sum)', '2. Co-Interior Sum Test')}
          </button>
          <button
            onClick={() => setActiveTestCriterion('corresponding')}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              activeTestCriterion === 'corresponding'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            {L('३. संगत कोण परीक्षण (Corresponding Angles)', '3. Corresponding Angles Test')}
          </button>
        </div>

        {/* Geometry Canvas */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
          <svg viewBox="0 0 540 320" className="w-full max-w-2xl h-80 select-none">
            {/* Background Grid */}
            <defs>
              <pattern id="gridLab" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="540" height="320" fill="url(#gridLab)" />

            {/* Line 1: AB (y = 90) */}
            <line x1="40" y1="90" x2="500" y2="90" stroke="#38bdf8" strokeWidth="3" />
            <text x="25" y="95" fill="#38bdf8" fontSize="13" fontWeight="bold">A</text>
            <text x="510" y="95" fill="#38bdf8" fontSize="13" fontWeight="bold">B</text>

            {/* Line 2: CD (tilted, centered at x=270, y=230) */}
            {(() => {
              const tiltRad = (line2Tilt * Math.PI) / 180;
              const cdLength = 230;
              const cX = 270 - cdLength * Math.cos(tiltRad);
              const cY = 230 + cdLength * Math.sin(tiltRad);
              const dX = 270 + cdLength * Math.cos(tiltRad);
              const dY = 230 - cdLength * Math.sin(tiltRad);
              return (
                <g>
                  <line x1={cX} y1={cY} x2={dX} y2={dY} stroke="#06b6d4" strokeWidth="3" />
                  <text x={cX - 15} y={cY + 5} fill="#06b6d4" fontSize="13" fontWeight="bold">C</text>
                  <text x={dX + 10} y={dY + 5} fill="#06b6d4" fontSize="13" fontWeight="bold">D</text>
                </g>
              );
            })()}

            {/* Transversal Line EF */}
            <line x1="160" y1="280" x2="380" y2="40" stroke="#f43f5e" strokeWidth="2.5" />
            <text x="145" y="295" fill="#f43f5e" fontSize="13" fontWeight="bold">E</text>
            <text x="390" y="35" fill="#f43f5e" fontSize="13" fontWeight="bold">F</text>

            {/* Intersection 1 at (315, 90) */}
            <circle cx="334" cy="90" r="4" fill="#ffffff" />
            {/* Intersection 2 at (206, 230) approx */}
            <circle cx="206" cy="230" r="4" fill="#ffffff" />

            {/* Interactive Protractor Overlay */}
            {showProtractor && (
              <g transform="translate(334, 90) scale(0.65)" opacity="0.85">
                <path
                  d="M -100 0 A 100 100 0 0 1 100 0 Z"
                  fill="#fef08a"
                  fillOpacity="0.25"
                  stroke="#eab308"
                  strokeWidth="2"
                />
                <line x1="-100" y1="0" x2="100" y2="0" stroke="#eab308" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="3" fill="#eab308" />
                {/* 60 deg indicator */}
                <line x1="0" y1="0" x2={-100 * Math.cos(Math.PI / 3)} y2={-100 * Math.sin(Math.PI / 3)} stroke="#ef4444" strokeWidth="2" />
                <text x="-65" y="-60" fill="#fef08a" fontSize="14" fontWeight="bold">60°</text>
              </g>
            )}

            {/* Angle labels on Line 1 */}
            <text x="345" y="80" fill="#38bdf8" fontSize="12" fontWeight="bold">
              {angle1_acute}°
            </text>
            <text x="290" y="115" fill="#f59e0b" fontSize="12" fontWeight="bold">
              ∠A₁ = {angle1_obtuse}°
            </text>

            {/* Angle labels on Line 2 */}
            <text x="220" y="225" fill="#06b6d4" fontSize="12" fontWeight="bold">
              ∠A₂ = {angle2_acute}°
            </text>
            <text x="160" y="255" fill="#f59e0b" fontSize="12" fontWeight="bold">
              {angle2_obtuse}°
            </text>
          </svg>
        </div>

        {/* Verification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Alternate Angles Condition */}
          <div
            className={`p-4 rounded-xl border ${
              isParallel
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-slate-900 border-slate-700'
            }`}
          >
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {L('१. एकान्तर कोण (Alternate)', '1. Alternate Angles')}
            </div>
            <div className="mt-2 text-sm text-slate-200">
              ∠A₁ = <span className="font-mono text-amber-300 font-bold">{angle1_obtuse}°</span>
              <br />
              ∠A₂ = <span className="font-mono text-cyan-300 font-bold">{angle2_acute}°</span>
            </div>
            <div className="mt-2 text-xs font-semibold">
              {angle1_obtuse === angle2_acute ? (
                <span className="text-emerald-400">✅ बराबर छन् ({angle1_obtuse}° = {angle2_acute}°)</span>
              ) : (
                <span className="text-rose-400">❌ बराबर छैनन् ({angle1_obtuse}° ≠ {angle2_acute}°)</span>
              )}
            </div>
          </div>

          {/* Co-Interior Angles Condition */}
          <div
            className={`p-4 rounded-xl border ${
              isParallel
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-slate-900 border-slate-700'
            }`}
          >
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {L('२. क्रमागत भित्री कोण (Co-Interior)', '2. Co-Interior Sum')}
            </div>
            <div className="mt-2 text-sm text-slate-200">
              जोड = <span className="font-mono text-slate-100 font-bold">{angle1_obtuse}° + {angle2_acute}°</span>
            </div>
            <div className="mt-2 text-xs font-semibold">
              {cointeriorSum === 180 ? (
                <span className="text-emerald-400">✅ ठीक १८०° छ (Supplementary)</span>
              ) : (
                <span className="text-rose-400">❌ {cointeriorSum}° (१८०° भएन)</span>
              )}
            </div>
          </div>

          {/* Conclusion */}
          <div
            className={`p-4 rounded-xl border ${
              isParallel
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-slate-900 border-slate-700'
            }`}
          >
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {L('निष्कर्ष (Conclusion)', 'Conclusion')}
            </div>
            <div className="mt-2 text-sm font-bold">
              {isParallel ? (
                <span className="text-emerald-300">AB समानान्तर CD (AB ∥ CD)</span>
              ) : (
                <span className="text-rose-300">AB र CD समानान्तर छैनन्</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isParallel
                ? L('सबै समानान्तर गुणहरू सन्तुष्ट छन्।', 'All parallel properties satisfied.')
                : L('समानान्तर हुनका लागि कोण नियम मिलेको छैन।', 'Does not satisfy angle theorems.')}
            </p>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default ParallelLinesAngleRelationshipLab;
