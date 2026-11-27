import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const LocusCoordinateGeometryLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U3-01',
    chapter: 3,
    titleNp: 'बिन्दुपथ तथा खण्ड-सूत्र प्रयोगशाला',
    titleEn: 'Locus and Coordinate Geometry Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'circle_locus' | 'section_formula' | 'challenges'>('circle_locus');

  // Activity A & B: Circle Locus (x - h)^2 + (y - k)^2 = r^2
  const [centerH, setCenterH] = useState<number>(2);
  const [centerK, setCenterK] = useState<number>(1);
  const [locusRadius, setLocusRadius] = useState<number>(3);
  const [movingAngleDeg, setMovingAngleDeg] = useState<number>(45);

  const angleRad = (movingAngleDeg * Math.PI) / 180;
  const movingX = centerH + locusRadius * Math.cos(angleRad);
  const movingY = centerK + locusRadius * Math.sin(angleRad);

  // Activity C: Section Formula
  // Points A(x1, y1) and B(x2, y2)
  const [ptA, setPtA] = useState<{ x: number; y: number }>({ x: -2, y: -1 });
  const [ptB, setPtB] = useState<{ x: number; y: number }>({ x: 6, y: 5 });
  const [ratioM1, setRatioM1] = useState<number>(2);
  const [ratioM2, setRatioM2] = useState<number>(1);

  // P = ( (m1*x2 + m2*x1)/(m1+m2), (m1*y2 + m2*y1)/(m1+m2) )
  const divX = (ratioM1 * ptB.x + ratioM2 * ptA.x) / (ratioM1 + ratioM2);
  const divY = (ratioM1 * ptB.y + ratioM2 * ptA.y) / (ratioM1 + ratioM2);

  // Challenge Mode
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const CHALLENGES = [
    {
      qNp: 'मूलबिन्दु (0, 0) बाट सधैं 5 एकाइ दुरीमा रहने बिन्दु P(x, y) को बिन्दुपथको समीकरण के हुन्छ?',
      qEn: 'What is the equation of the locus of a point P(x, y) which is always at a distance of 5 units from the origin (0, 0)?',
      opts: ['x² + y² = 25', 'x + y = 5', 'x² − y² = 25', 'x² + y² = 5'],
      correct: 0,
      expNp: 'दुरी सूत्र अनुसार: √(x² + y²) = 5 ⇒ x² + y² = 25।',
      expEn: 'By distance formula: √(x² + y²) = 5 => x² + y² = 25.',
    },
    {
      qNp: 'बिन्दुहरू A(2, 3) र B(6, 7) लाई जोड्ने रेखाखण्डको मध्यबिन्दु M का निर्देशाङ्क कति हुन्छन्?',
      qEn: 'Find the coordinates of the midpoint M of the line segment joining A(2, 3) and B(6, 7):',
      opts: ['(4, 5)', '(8, 10)', '(3, 4)', '(2, 2)'],
      correct: 0,
      expNp: 'मध्यबिन्दु = ((x₁ + x₂)/2, (y₁ + y₂)/2) = ((2 + 6)/2, (3 + 7)/2) = (4, 5)।',
      expEn: 'Midpoint = ((2 + 6)/2, (3 + 7)/2) = (4, 5).',
    },
    {
      qNp: 'बिन्दुहरू P(1, 2) र Q(4, 5) लाई 1:2 को अनुपातमा आन्तरिक विभाजन गर्ने बिन्दुको x-निर्देशाङ्क कति हुन्छ?',
      qEn: 'What is the x-coordinate of the point dividing P(1, 2) and Q(4, 5) internally in the ratio 1:2?',
      opts: ['x = 2', 'x = 3', 'x = 2.5', 'x = 1'],
      correct: 0,
      expNp: 'x = (m₁x₂ + m₂x₁)/(m₁ + m₂) = (1×4 + 2×1)/(1 + 2) = 6/3 = 2।',
      expEn: 'x = (1×4 + 2×1)/(1 + 2) = 6/3 = 2.',
    },
  ];

  // SVG Scales: mapping [-8, 8] to [20, 340]
  const svgSize = 360;
  const origin = 180;
  const scale = 20; // 20px per unit

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! ऐच्छिक गणितको बिन्दुपथ (Locus) र खण्ड-सूत्र (Section Formula) प्रयोगशालामा स्वागत छ। निश्चित सर्तअनुसार हिँड्ने बिन्दुको पथ, वृत्तको समीकरण र रेखाखण्ड विभाजनको अन्वेषण गर्नुहोस्!',
        'Welcome! Explore the locus of points (circles, lines), equations of paths, and the internal section formula!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('circle_locus')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'circle_locus'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {L('वृत्त बिन्दुपथ (Circle Locus)', 'Circle Locus')}
          </button>
          <button
            onClick={() => setActiveTab('section_formula')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'section_formula'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {L('खण्ड-सूत्र अन्वेषक (Section Formula)', 'Section Formula')}
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'challenges'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {L('निर्देशाङ्क चुनौती (Challenges)', 'Coordinate Challenges')}
          </button>
        </div>

        {/* TAB 1: CIRCLE LOCUS */}
        {activeTab === 'circle_locus' && (
          <>
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">
                {L('निश्चित बिन्दुबाट बराबर दुरीको बिन्दुपथ (Circle Locus):', 'Circle Locus Controls:')}
              </h4>
              <p className="text-xs text-slate-500">
                {L('निश्चित बिन्दु (h, k) केन्द्र र निश्चित दुरी r अर्धव्यास भएको वृत्तको बिन्दुपथ: (x − h)² + (y − k)² = r²', 'A circle is the locus of a point at constant distance r from fixed center (h, k).')}
              </p>

              {/* Sliders */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>{L('केन्द्रबिन्दु x (h):', 'Center x (h):')}</span>
                    <span className="font-mono text-indigo-700 font-bold">{fmt(centerH)}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    value={centerH}
                    onChange={e => setCenterH(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>{L('केन्द्रबिन्दु y (k):', 'Center y (k):')}</span>
                    <span className="font-mono text-indigo-700 font-bold">{fmt(centerK)}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    value={centerK}
                    onChange={e => setCenterK(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>{L('अर्धव्यास दुरी (Radius r):', 'Radius (r):')}</span>
                    <span className="font-mono text-indigo-700 font-bold">{fmt(locusRadius)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={locusRadius}
                    onChange={e => setLocusRadius(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>{L('बिन्दु P को घुमाइ कोण (Angle θ):', 'Moving Point Angle:')}</span>
                    <span className="font-mono text-indigo-700 font-bold">{fmt(movingAngleDeg)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="10"
                    value={movingAngleDeg}
                    onChange={e => setMovingAngleDeg(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Equation Card */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-1 font-mono">
                <span className="font-bold text-indigo-950 block text-xs">{L('बिन्दुपथको समीकरण (Equation of Locus):', 'Equation of Locus:')}</span>
                <div className="text-sm font-bold text-indigo-700">
                  (x {centerH >= 0 ? `− ${centerH}` : `+ ${-centerH}`})² + (y {centerK >= 0 ? `− ${centerK}` : `+ ${-centerK}`})² = {locusRadius * locusRadius}
                </div>
                <div className="text-[11px] text-slate-600 pt-1">
                  Coordinates of P: ({movingX.toFixed(2)}, {movingY.toFixed(2)})
                </div>
              </div>
            </div>

            {/* Visual Coordinate Canvas */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full max-w-[340px] bg-slate-50 rounded-xl border border-slate-200 select-none">
                {/* Grid Lines */}
                {Array.from({ length: 17 }).map((_, i) => {
                  const p = i * scale;
                  return (
                    <g key={i}>
                      <line x1={p} y1={0} x2={p} y2={svgSize} stroke="#e2e8f0" strokeDasharray="1 1" />
                      <line x1={0} y1={p} x2={svgSize} y2={p} stroke="#e2e8f0" strokeDasharray="1 1" />
                    </g>
                  );
                })}

                {/* Axes */}
                <line x1={0} y1={origin} x2={svgSize} y2={origin} stroke="#334155" strokeWidth="2" />
                <line x1={origin} y1={0} x2={origin} y2={svgSize} stroke="#334155" strokeWidth="2" />

                {/* Circle Locus */}
                <circle
                  cx={origin + centerH * scale}
                  cy={origin - centerK * scale}
                  r={locusRadius * scale}
                  fill="#6366f1"
                  fillOpacity="0.1"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                />

                {/* Center Point */}
                <circle cx={origin + centerH * scale} cy={origin - centerK * scale} r={5} fill="#dc2626" />
                <text
                  x={origin + centerH * scale + 8}
                  y={origin - centerK * scale - 6}
                  className="text-[11px] font-bold fill-red-700 font-mono"
                >
                  C({fmt(centerH)}, {fmt(centerK)})
                </text>

                {/* Moving Point P */}
                <circle
                  cx={origin + movingX * scale}
                  cy={origin - movingY * scale}
                  r={6}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={origin + movingX * scale + 8}
                  y={origin - movingY * scale - 6}
                  className="text-[11px] font-bold fill-emerald-800 font-mono"
                >
                  P({fmt(movingX.toFixed(1))}, {fmt(movingY.toFixed(1))})
                </text>

                {/* Radius line CP */}
                <line
                  x1={origin + centerH * scale}
                  y1={origin - centerK * scale}
                  x2={origin + movingX * scale}
                  y2={origin - movingY * scale}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>
          </>
        )}

        {/* TAB 2: SECTION FORMULA */}
        {activeTab === 'section_formula' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('आन्तरिक खण्ड-सूत्र (Internal Section Formula Explorer)', 'Section Formula')}
            </h4>

            {/* Formula Banner */}
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-mono text-center text-indigo-950 font-bold">
              P(x, y) = \left( \frac&#123;m₁x₂ + m₂x₁&#125;&#123;m₁ + m₂&#125; , \frac&#123;m₁y₂ + m₂y₁&#125;&#123;m₁ + m₂&#125; \right)
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">A(x₁, y₁):</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={ptA.x}
                    onChange={e => setPtA({ ...ptA, x: parseInt(e.target.value) || 0 })}
                    className="w-16 p-1 border rounded font-mono font-bold text-center"
                  />
                  <input
                    type="number"
                    value={ptA.y}
                    onChange={e => setPtA({ ...ptA, y: parseInt(e.target.value) || 0 })}
                    className="w-16 p-1 border rounded font-mono font-bold text-center"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">B(x₂, y₂):</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={ptB.x}
                    onChange={e => setPtB({ ...ptB, x: parseInt(e.target.value) || 0 })}
                    className="w-16 p-1 border rounded font-mono font-bold text-center"
                  />
                  <input
                    type="number"
                    value={ptB.y}
                    onChange={e => setPtB({ ...ptB, y: parseInt(e.target.value) || 0 })}
                    className="w-16 p-1 border rounded font-mono font-bold text-center"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">{L('विभाजन अनुपात (m₁ : m₂):', 'Ratio m₁ : m₂:')}</span>
                <div className="flex items-center gap-2 font-mono">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={ratioM1}
                    onChange={e => setRatioM1(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 p-1 border rounded text-center font-bold text-indigo-700"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={ratioM2}
                    onChange={e => setRatioM2(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 p-1 border rounded text-center font-bold text-indigo-700"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Point */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row justify-between items-center text-xs font-mono gap-2">
              <span className="font-bold text-emerald-950 text-sm">
                Coordinates of the dividing point P:
              </span>
              <span className="text-base font-bold text-emerald-700 bg-white px-4 py-1.5 rounded-lg border border-emerald-300">
                P({fmt(divX.toFixed(2))}, {fmt(divY.toFixed(2))})
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: CHALLENGES */}
        {activeTab === 'challenges' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                {L(`प्रश्न ${challengeIdx + 1} / ${CHALLENGES.length}`, `Question ${challengeIdx + 1} of ${CHALLENGES.length}`)}
              </span>
              <span className="font-bold text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                ⭐ {L(`अङ्क: ${fmt(score)}`, `Score: ${score}`)}
              </span>
            </div>

            <h3 className="font-bold text-slate-800 text-sm">
              {L(CHALLENGES[challengeIdx].qNp, CHALLENGES[challengeIdx].qEn)}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CHALLENGES[challengeIdx].opts.map((opt, i) => {
                let style = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                if (answered) {
                  if (i === CHALLENGES[challengeIdx].correct) {
                    style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  } else if (selectedAns === i) {
                    style = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                  } else {
                    style = 'opacity-50 border-slate-200 text-slate-400';
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (answered) return;
                      setSelectedAns(i);
                      setAnswered(true);
                      if (i === CHALLENGES[challengeIdx].correct) setScore(s => s + 25);
                    }}
                    disabled={answered}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all text-left ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-indigo-900">{L('स्पष्टीकरण:', 'Explanation:')}</div>
                <div className="text-slate-700">{L(CHALLENGES[challengeIdx].expNp, CHALLENGES[challengeIdx].expEn)}</div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              {answered && (
                <button
                  onClick={() => {
                    setSelectedAns(null);
                    setAnswered(false);
                    setChallengeIdx(c => (c + 1) % CHALLENGES.length);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {challengeIdx === CHALLENGES.length - 1
                    ? L('सुरुबाट फेरि गर्नुहोस्', 'Start Over')
                    : L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default LocusCoordinateGeometryLab;
