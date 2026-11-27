/**
 * CongruentFigureDiscoveryLab.tsx
 * Grade 7 Mathematics – Lesson 15: CONGRUENT FIGURES
 * Simulation 1: Congruent Figure Discovery Lab
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 231-239)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Check, RotateCw, Move, Scissors, Copy, Sparkles, CheckCircle2 } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'समान आकार (Same Shape) र समान नाप (Same Size) भएका दुई आकृतिहरूलाई के भनिन्छ?',
    en: 'Figures that have both the exact same shape and the exact same size are called:',
    options: [
      { key: 'A', label: 'Congruent figures' },
      { key: 'B', label: 'Similar figures only' },
      { key: 'C', label: 'Unequal figures' },
      { key: 'D', label: 'Parallel figures' },
    ],
    answer: 'A',
  },
  {
    np: 'दुई आकृतिहरू अनुरूप छन् वा छैनन् भनी प्रत्यक्ष जाँच्ने सबैभन्दा सजिलो विधि कुन हो?',
    en: 'What is the most direct physical method to verify if two figures are congruent?',
    options: [
      { key: 'A', label: 'Placing one figure over the other (overlapping method)' },
      { key: 'B', label: 'Weighing them' },
      { key: 'C', label: 'Looking at the colour' },
      { key: 'D', label: 'Adding the perimeters only' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि दुई त्रिभुजहरू ABC र XYZ अनुरूप छन् (△ABC ≅ △XYZ) भने कुन सम्बन्ध सत्य हुन्छ?',
    en: 'If two triangles ABC and XYZ are congruent (△ABC ≅ △XYZ), which relationship is true?',
    options: [
      { key: 'A', label: 'Corresponding sides are equal and corresponding angles are equal' },
      { key: 'B', label: 'Different sides but equal angles' },
      { key: 'C', label: 'Different angles but equal sides' },
      { key: 'D', label: 'No parts are equal' },
    ],
    answer: 'A',
  },
  {
    np: 'दुवै हात जोडेर नमस्कार गर्दा दुवै हत्केलाहरू एकआपसमा दुरुस्त खप्टिन्छन्। यो के को उदाहरण हो?',
    en: 'Joining hands in Namaskar where both palms overlap identically is a real-life example of:',
    options: [
      { key: 'A', label: 'Congruent objects' },
      { key: 'B', label: 'Asymmetric object' },
      { key: 'C', label: 'Unequal object' },
      { key: 'D', label: 'Tessellation only' },
    ],
    answer: 'A',
  },
];

type LabTab = 'shape_size' | 'overlapping' | 'tracing_paper' | 'corresponding_parts' | 'real_life';

export const CongruentFigureDiscoveryLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L15-01',
    chapter: 15,
    titleNp: 'अनुरूप आकृति खोजी प्रयोगशाला (Congruent Figures Lab)',
    titleEn: 'Congruent Figure Discovery Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [tab, setTab] = useState<LabTab>('shape_size');

  // Activity 1: Shape & Size Comparison pairs
  const [selectedPairIdx, setSelectedPairIdx] = useState<number>(0);
  const PAIRS = [
    {
      titleNp: 'जोडी 1: उस्तै आकार र उस्तै नापका त्रिभुज (Congruent)',
      titleEn: 'Pair 1: Same Shape & Same Size Triangles',
      isCongruent: true,
      reasonNp: 'दुवैको आकार त्रिभुज र तीनवटै भुजाको लम्बाइ बराबर छ।',
      reasonEn: 'Both are triangles with identical side lengths.',
      fig1: { pts: '40,140 120,40 140,140' },
      fig2: { pts: '180,140 260,40 280,140' },
    },
    {
      titleNp: 'जोडी 2: उस्तै आकार तर फरक नाप (Same Shape, Different Size)',
      titleEn: 'Pair 2: Same Shape, Different Size (Not Congruent)',
      isCongruent: false,
      reasonNp: 'दुवै वर्ग (Square) भए पनि एउटा सानो र अर्को ठूलो भएकाले अनुरूप होइनन्।',
      reasonEn: 'Both are squares, but one is larger, so they are not congruent.',
      fig1: { rect: { x: 50, y: 60, s: 70 } },
      fig2: { rect: { x: 180, y: 50, s: 95 } },
    },
    {
      titleNp: 'जोडी 3: फरक आकार (Different Shapes)',
      titleEn: 'Pair 3: Different Shapes (Triangle & Circle)',
      isCongruent: false,
      reasonNp: 'एउटा त्रिभुज र अर्को वृत्त भएकाले आकार नै फरक छ।',
      reasonEn: 'One is a triangle and one is a circle, so shapes differ.',
      fig1: { pts: '50,140 100,50 150,140' },
      fig2: { circle: { cx: 230, cy: 95, r: 45 } },
    },
    {
      titleNp: 'जोडी 4: घुमेको अनुरूप त्रिभुज (Rotated Congruent)',
      titleEn: 'Pair 4: Rotated Congruent Triangles',
      isCongruent: true,
      reasonNp: 'दोस्रो त्रिभुज घुमेको भए पनि घुमाएर खप्ट्याउँदा दुरुस्त मिल्छ।',
      reasonEn: 'Orientation is rotated, but shape and size are identical.',
      fig1: { pts: '60,140 140,140 140,60' },
      fig2: { pts: '200,60 200,140 280,60' },
    },
  ];

  // Activity 2: Overlapping experiment state
  const [overlapX, setOverlapX] = useState<number>(140);
  const [overlapY, setOverlapY] = useState<number>(0);
  const [overlapRot, setOverlapRot] = useState<number>(0);

  // Check if overlap is close to target (target: overlapX ~ 0, overlapY ~ 0, overlapRot ~ 0)
  const isPerfectOverlap = Math.abs(overlapX) <= 10 && Math.abs(overlapY) <= 10 && overlapRot % 360 === 0;

  // Activity 3: Virtual Tracing Paper
  const [isTracingPlaced, setIsTracingPlaced] = useState<boolean>(false);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! समान आकार (Same Shape) र समान नाप (Same Size) भएका आकृतिहरू अनुरूप (Congruent) हुन्छन्। खप्ट्याएर जाचौँ!',
        'Hello! Figures with the exact same shape and size are congruent. Let us test them by overlapping and tracing!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'shape_size', np: '1. समान आकार र समान नाप (Same Shape & Size)', en: '1. Shape & Size Test' },
            { id: 'overlapping', np: '2. खप्ट्याउने प्रयोग (Overlapping Lab)', en: '2. Overlapping Lab' },
            { id: 'tracing_paper', np: '3. Tracing paper विधि (Tracing Paper)', en: '3. Virtual Tracing Paper' },
            { id: 'corresponding_parts', np: '4. संगत भागहरू (Corresponding Parts)', en: '4. Corresponding Parts' },
            { id: 'real_life', np: '5. व्यावहारिक उदाहरण (Real-Life)', en: '5. Real-Life Objects' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as LabTab)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? t.np : t.en}
            </button>
          ))}
        </div>

        {/* Tab 1: Shape and Size */}
        {tab === 'shape_size' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L('अनुरूप आकृति (Congruent Figures) को मूल नियम:', 'Golden Rule of Congruent Figures:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'उस्तै आकार (Same Shape) र उस्तै नाप (Same Size) भएका दुई आकृतिहरूलाई अनुरूप आकृतिहरू भनिन्छ। दुई आकृति उस्तै देखिएर मात्र पुग्दैन, नाप पनि बराबर हुनुपर्छ।',
                  'Figures having both the same shape and the exact same size are congruent. Merely looking similar is not enough; dimensions must match.'
                )}
              </p>
            </div>

            {/* Pair Selector */}
            <div className="flex flex-wrap gap-2 justify-center">
              {PAIRS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPairIdx(idx)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedPairIdx === idx
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isNe ? p.titleNp.split(':')[0] : p.titleEn.split(':')[0]}
                </button>
              ))}
            </div>

            {/* Visual Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="300" height="180" viewBox="0 0 300 180">
                  {/* Pair Visuals */}
                  {PAIRS[selectedPairIdx].fig1.pts && (
                    <polygon points={PAIRS[selectedPairIdx].fig1.pts} fill="rgba(59, 130, 246, 0.3)" stroke="#2563eb" strokeWidth="2.5" />
                  )}
                  {PAIRS[selectedPairIdx].fig1.rect && (
                    <rect
                      x={PAIRS[selectedPairIdx].fig1.rect!.x}
                      y={PAIRS[selectedPairIdx].fig1.rect!.y}
                      width={PAIRS[selectedPairIdx].fig1.rect!.s}
                      height={PAIRS[selectedPairIdx].fig1.rect!.s}
                      fill="rgba(59, 130, 246, 0.3)"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    />
                  )}

                  {PAIRS[selectedPairIdx].fig2.pts && (
                    <polygon points={PAIRS[selectedPairIdx].fig2.pts} fill="rgba(245, 158, 11, 0.3)" stroke="#d97706" strokeWidth="2.5" />
                  )}
                  {PAIRS[selectedPairIdx].fig2.rect && (
                    <rect
                      x={PAIRS[selectedPairIdx].fig2.rect!.x}
                      y={PAIRS[selectedPairIdx].fig2.rect!.y}
                      width={PAIRS[selectedPairIdx].fig2.rect!.s}
                      height={PAIRS[selectedPairIdx].fig2.rect!.s}
                      fill="rgba(245, 158, 11, 0.3)"
                      stroke="#d97706"
                      strokeWidth="2.5"
                    />
                  )}
                  {PAIRS[selectedPairIdx].fig2.circle && (
                    <circle
                      cx={PAIRS[selectedPairIdx].fig2.circle!.cx}
                      cy={PAIRS[selectedPairIdx].fig2.circle!.cy}
                      r={PAIRS[selectedPairIdx].fig2.circle!.r}
                      fill="rgba(245, 158, 11, 0.3)"
                      stroke="#d97706"
                      strokeWidth="2.5"
                    />
                  )}

                  <text x="90" y="165" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e40af">
                    Figure 1
                  </text>
                  <text x="230" y="165" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#b45309">
                    Figure 2
                  </text>
                </svg>
              </div>

              {/* Status and explanation */}
              <div className="space-y-3">
                <div
                  className={`p-5 rounded-2xl border ${
                    PAIRS[selectedPairIdx].isCongruent
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-rose-50 border-rose-300'
                  }`}
                >
                  <div className="text-base font-bold flex items-center gap-2">
                    {PAIRS[selectedPairIdx].isCongruent ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-950">
                          {L('अनुरूप आकृतिहरू हुन् (Congruent Figures)', 'These are Congruent Figures!')}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-rose-600 text-lg font-black">✕</span>
                        <span className="text-rose-950">
                          {L('अनुरूप आकृतिहरू होइनन् (NOT Congruent)', 'These are NOT Congruent!')}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-slate-700 mt-2 leading-relaxed">
                    {isNe ? PAIRS[selectedPairIdx].reasonNp : PAIRS[selectedPairIdx].reasonEn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Overlapping Lab */}
        {tab === 'overlapping' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-emerald-950" style={{ fontFamily: FONT_NP }}>
                {L('खप्ट्याउने प्रयोग (Overlapping Verification Activity):', 'Overlapping Verification Activity:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'पहेँलो आकृतिलाई तानेर र घुमाएर नीलो आकृतिमाथि खप्ट्याउनुहोस्। दुवैका चारै किनारा दुरुस्त मिलेमा मात्र अनुरूप प्रमाणित हुन्छ।',
                  'Drag and rotate the second figure over the first figure. When the boundaries match perfectly, congruence is proved.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="300" height="240" viewBox="0 0 300 240">
                  {/* Fixed Reference Triangle 1 at (60, 160) */}
                  <polygon points="60,160 140,160 140,80" fill="rgba(59, 130, 246, 0.3)" stroke="#2563eb" strokeWidth="3" />
                  <text x="100" y="140" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e40af">
                    △1
                  </text>

                  {/* Movable & Rotatable Triangle 2 */}
                  <g transform={`translate(${60 + overlapX}, ${160 + overlapY}) rotate(${overlapRot}) translate(-60, -160)`}>
                    <polygon points="60,160 140,160 140,80" fill="rgba(245, 158, 11, 0.45)" stroke="#d97706" strokeWidth="3" />
                    <text x="100" y="140" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#92400e">
                      △2
                    </text>
                  </g>
                </svg>

                <div className="text-xs text-slate-500 mt-2">
                  {isPerfectOverlap
                    ? L('✓ दुवै आकृति पूर्ण रूपमा खप्टिए!', '✓ Boundaries overlap perfectly!')
                    : L('दायाँतिरका नियन्त्रकहरूबाट △2 लाई △1 माथि लैजानुहोस्।', 'Use controls to align △2 on top of △1.')}
                </div>
              </div>

              {/* Manipulation Controls */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>{L('दायाँ / बायाँ सार्नुहोस् (Move X):', 'Horizontal (X):')}</span>
                      <span>{overlapX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="160"
                      value={overlapX}
                      onChange={(e) => setOverlapX(Number(e.target.value))}
                      className="w-full h-2 bg-indigo-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>{L('माथि / तल सार्नुहोस् (Move Y):', 'Vertical (Y):')}</span>
                      <span>{overlapY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-60"
                      max="60"
                      value={overlapY}
                      onChange={(e) => setOverlapY(Number(e.target.value))}
                      className="w-full h-2 bg-indigo-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>{L('घुमाउनुहोस् (Rotate):', 'Rotate:')}</span>
                      <span>{overlapRot}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="45"
                      value={overlapRot}
                      onChange={(e) => setOverlapRot(Number(e.target.value))}
                      className="w-full h-2 bg-indigo-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border text-center font-bold text-sm ${
                    isPerfectOverlap
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {isPerfectOverlap
                    ? L('सबास! दुवै आकृतिहरू एकअर्कामा दुरुस्त खप्टिएकाले यी अनुरूप (Congruent) हुन्!', 'Match! Both shapes coincide completely, proving they are Congruent!')
                    : L('अझै खप्टिएको छैन (Not Yet Matched)', 'Not Yet Matched (Align X to 0, Y to 0, Rot to 0°)')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Virtual Tracing Paper */}
        {tab === 'tracing_paper' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-purple-950" style={{ fontFamily: FONT_NP }}>
                {L('पाठ्यपुस्तक विधि: Tracing paper (Tracing Paper) द्वारा परीक्षण:', 'CDC Tracing Paper Activity:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'पारदर्शी Tracing paperलाई पहिलो चित्रमाथि राखी सिसाकलमले घेरा कोरिन्छ, र सो Tracing paperलाई अर्को चित्रमाथि लगेर खप्टिन्छ कि खप्टिँदैन हेरिन्छ।',
                  'Trace the outline of figure 1 onto tracing paper, then place the traced sheet over figure 2 to verify coincidence.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="300" height="200" viewBox="0 0 300 200">
                  {/* Figure 1 at Left */}
                  <polygon points="50,150 120,150 120,70" fill="#93c5fd" stroke="#2563eb" strokeWidth="2.5" />
                  <text x="85" y="170" textAnchor="middle" fontSize="11" fontWeight="bold">Figure 1</text>

                  {/* Figure 2 at Right */}
                  <polygon points="180,150 250,150 250,70" fill="#fed7aa" stroke="#ea580c" strokeWidth="2.5" />
                  <text x="215" y="170" textAnchor="middle" fontSize="11" fontWeight="bold">Figure 2</text>

                  {/* Tracing Paper Overlay */}
                  {isTracingPlaced ? (
                    <g transform="translate(130, 0)">
                      <rect x="40" y="50" width="90" height="110" fill="rgba(255, 255, 255, 0.75)" stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2" />
                      <polygon points="50,150 120,150 120,70" fill="none" stroke="#4f46e5" strokeWidth="2.5" />
                      <text x="85" y="45" textAnchor="middle" fontSize="10" fill="#4f46e5" fontWeight="bold">Tracing paper</text>
                    </g>
                  ) : (
                    <g transform="translate(0, 0)">
                      <rect x="40" y="50" width="90" height="110" fill="rgba(255, 255, 255, 0.75)" stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2" />
                      <polygon points="50,150 120,150 120,70" fill="none" stroke="#4f46e5" strokeWidth="2.5" />
                      <text x="85" y="45" textAnchor="middle" fontSize="10" fill="#4f46e5" fontWeight="bold">Tracing paper</text>
                    </g>
                  )}
                </svg>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setIsTracingPlaced(!isTracingPlaced)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  {isTracingPlaced
                    ? L('Tracing paperलाई Figure 1 मा फर्काउनुहोस्', 'Return Tracing Paper to Figure 1')
                    : L('Tracing paperलाई Figure 2 माथि राख्नुहोस्', 'Move Tracing Paper over Figure 2')}
                </button>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm text-slate-700">
                  {isTracingPlaced ? (
                    <div className="text-emerald-800 font-bold flex items-center gap-1.5">
                      <Check className="w-5 h-5 text-emerald-600" />
                      {L('Figure 1 बाट कोरिएको ट्रेसिङ रेखा Figure 2 को किनारामा दुरुस्त खप्टियो! अतः यी दुई आकृति अनुरूप हुन्।', 'The traced boundary of Figure 1 coincides exactly over Figure 2! Proving they are congruent.')}
                    </div>
                  ) : (
                    <div>
                      {L('Figure 1 माथि Tracing paper राखिएको छ। माथिको बटन थिचेर Figure 2 माथि सार्नुहोस्।', 'Tracing paper is on Figure 1. Click button to place it over Figure 2.')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Corresponding Parts */}
        {tab === 'corresponding_parts' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-amber-950" style={{ fontFamily: FONT_NP }}>
                {L('संगत शीर्षबिन्दु, संगत भुजा र संगत कोणहरू (Corresponding Parts):', 'Corresponding Parts of Congruent Triangles:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'यदि △ABC ≅ △XYZ भए, खप्टिने शीर्षहरूलाई संगत शीर्ष, खप्टिने भुजाहरूलाई संगत भुजा र खप्टिने कोणहरूलाई संगत कोण भनिन्छ।',
                  'In congruent triangles △ABC and △XYZ, matching vertices, sides, and angles are corresponding parts.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="300" height="200" viewBox="0 0 300 200">
                  {/* Triangle ABC */}
                  <polygon points="50,150 130,150 130,70" fill="rgba(59, 130, 246, 0.2)" stroke="#2563eb" strokeWidth="2.5" />
                  <text x="40" y="165" fontSize="12" fontWeight="bold">A</text>
                  <text x="135" y="165" fontSize="12" fontWeight="bold">B</text>
                  <text x="135" y="65" fontSize="12" fontWeight="bold">C</text>

                  {/* Triangle XYZ */}
                  <polygon points="180,150 260,150 260,70" fill="rgba(245, 158, 11, 0.2)" stroke="#d97706" strokeWidth="2.5" />
                  <text x="170" y="165" fontSize="12" fontWeight="bold">X</text>
                  <text x="265" y="165" fontSize="12" fontWeight="bold">Y</text>
                  <text x="265" y="65" fontSize="12" fontWeight="bold">Z</text>
                </svg>
              </div>

              {/* Table of Corresponding Elements */}
              <div className="space-y-3">
                <table className="w-full text-xs border-collapse bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                  <thead className="bg-slate-200 text-slate-800 font-bold">
                    <tr>
                      <th className="p-2.5 text-left border-r border-slate-300">{L('संगत शीर्ष (Vertices)', 'Vertices')}</th>
                      <th className="p-2.5 text-left border-r border-slate-300">{L('संगत भुजा (Sides)', 'Sides')}</th>
                      <th className="p-2.5 text-left">{L('संगत कोण (Angles)', 'Angles')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 border-r border-slate-200 font-bold">A ↔ X</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-blue-700">AB = XY</td>
                      <td className="p-2.5 font-bold text-emerald-700">∠A = ∠X</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 border-r border-slate-200 font-bold">B ↔ Y</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-blue-700">BC = YZ</td>
                      <td className="p-2.5 font-bold text-emerald-700">∠B = ∠Y</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 border-r border-slate-200 font-bold">C ↔ Z</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-blue-700">CA = ZX</td>
                      <td className="p-2.5 font-bold text-emerald-700">∠C = ∠Z</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Real-Life Objects */}
        {tab === 'real_life' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <h3 className="text-base font-bold text-indigo-950" style={{ fontFamily: FONT_NP }}>
                {L('पाठ्यपुस्तकका दैनिक जीवनका अनुरूप वस्तुहरू:', 'Textbook Real-Life Congruent Objects:')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  titleNp: '1. नमस्कार गर्दा दुई हत्केला',
                  titleEn: '1. Palms in Namaskar',
                  descNp: 'दुवै हात जोड्दा औंला र हत्केलाहरू ठ्याक्कै दुरुस्त खप्टिन्छन्।',
                  descEn: 'Palms joined in Namaskar match in both shape and size.',
                },
                {
                  titleNp: '2. ज्यामिति बाकसका सेटस्क्वायर',
                  titleEn: '2. Set Squares in Geometry Box',
                  descNp: 'एउटै बाकसका 30°-60° वा 45°-45° का सेटस्क्वायरहरू अनुरूप हुन्छन्।',
                  descEn: 'Identical setsquares manufactured to standard measurements.',
                },
                {
                  titleNp: '3. एउटै दरका दुईpcs सिक्का',
                  titleEn: '3. Identical Currency Coins',
                  descNp: 'नेपाल राष्ट्र बैंकले छापेका दुईpcs 5 rupeesका सिक्काहरू पूर्ण अनुरूप हुन्छन्।',
                  descEn: 'Two five-rupee coins minted to identical shape and thickness.',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="font-bold text-sm text-slate-800" style={{ fontFamily: FONT_NP }}>
                    {isNe ? item.titleNp : item.titleEn}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isNe ? item.descNp : item.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default CongruentFigureDiscoveryLab;
