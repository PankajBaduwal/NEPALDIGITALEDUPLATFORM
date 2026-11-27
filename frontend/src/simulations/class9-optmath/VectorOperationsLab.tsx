import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const VectorOperationsLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U4-02',
    chapter: 4,
    titleNp: 'भेक्टर जोड तथा कार्य सञ्चालन प्रयोगशाला',
    titleEn: 'Vector Addition and Operations Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'triangle' | 'polygon' | 'addsub' | 'scalar' | 'challenge'>('triangle');

  // Activity A: Triangle Law AB + BC = AC
  const [vecA, setVecA] = useState<{ x: number; y: number }>({ x: 4, y: 2 });
  const [vecB, setVecB] = useState<{ x: number; y: number }>({ x: 2, y: 4 });

  // Activity B: Polygon Law (3 or 4 vectors)
  const [polygonClosed, setPolygonClosed] = useState<boolean>(false);

  // Activity C: Addition & Subtraction
  const [v1, setV1] = useState<{ x: number; y: number }>({ x: 3, y: 2 });
  const [v2, setV2] = useState<{ x: number; y: number }>({ x: 2, y: -3 });
  const [opMode, setOpMode] = useState<'add' | 'sub'>('add');

  // Activity D: Scalar Multiplication
  const [baseVec, setBaseVec] = useState<{ x: number; y: number }>({ x: 2, y: 1 });
  const [scalarK, setScalarK] = useState<number>(2);

  // Activity E: Challenge
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);

  const challenges = [
    {
      qNp: 'यदि a⃗ = (3, -2) र b⃗ = (-1, 5) भए, a⃗ + b⃗ को मान कति हुन्छ?',
      qEn: 'If a⃗ = (3, -2) and b⃗ = (-1, 5), what is a⃗ + b⃗?',
      opts: ['(2, 3)', '(4, 3)', '(2, -7)', '(-3, -10)'],
      correct: 0,
      expNp: 'a⃗ + b⃗ = (3 + (-1), -2 + 5) = (2, 3)',
      expEn: 'a⃗ + b⃗ = (3 + (-1), -2 + 5) = (2, 3)',
    },
    {
      qNp: 'यदि p⃗ = (2, -4) भए, 3p⃗ को मान कति हुन्छ?',
      qEn: 'If p⃗ = (2, -4), what is 3p⃗?',
      opts: ['(5, -1)', '(6, -12)', '(6, 12)', '(-6, 12)'],
      correct: 1,
      expNp: '3p⃗ = (3 × 2, 3 × (-4)) = (6, -12)',
      expEn: '3p⃗ = (3 × 2, 3 × (-4)) = (6, -12)',
    },
    {
      qNp: 'त्रिभुज ABC मा, AB⃗ + BC⃗ + CA⃗ को नतिजामूलक भेक्टर के हुन्छ?',
      qEn: 'In triangle ABC, what is the resultant of AB⃗ + BC⃗ + CA⃗?',
      opts: ['2AC⃗', '0⃗ (शून्य भेक्टर)', 'AB⃗', 'BC⃗'],
      correct: 1,
      expNp: 'AB⃗ + BC⃗ = AC⃗, त्यसैले AC⃗ + CA⃗ = AC⃗ - AC⃗ = 0⃗',
      expEn: 'AB⃗ + BC⃗ = AC⃗, therefore AC⃗ + CA⃗ = AC⃗ - AC⃗ = 0⃗ (Zero vector)',
    },
  ];

  // SVG dimensions
  const svgW = 380;
  const svgH = 320;
  const originX = 70;
  const originY = 240;
  const scale = 24;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! भेक्टर जोडको त्रिभुज नियम, बहुभुज नियम, कम्पोनेन्ट जोड-घटाउ र स्केलर गुणनलाई यहाँ प्रत्यक्ष रूपमा परिक्षण गर्नुहोस्!',
        'Welcome! Explore the Triangle Law, Polygon Law, Component Addition/Subtraction, and Scalar Multiplication of vectors!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'triangle', labelNp: 'क) त्रिभुज नियम (Triangle Law)', labelEn: 'A) Triangle Law' },
            { id: 'polygon', labelNp: 'ख) बहुभुज नियम (Polygon Law)', labelEn: 'B) Polygon Law' },
            { id: 'addsub', labelNp: 'ग) जोड तथा घटाउ (a⃗ ± b⃗)', labelEn: 'C) Addition & Subtraction' },
            { id: 'scalar', labelNp: 'घ) स्केलर गुणन (ka⃗)', labelEn: 'D) Scalar Multiplication' },
            { id: 'challenge', labelNp: 'ङ) अभ्यास चुनौती (Quiz)', labelEn: 'E) Challenge' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                kit.tap();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {isNe ? tab.labelNp : tab.labelEn}
            </button>
          ))}
        </div>

        {/* TAB A: TRIANGLE LAW */}
        {activeTab === 'triangle' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-6 bg-slate-900 rounded-2xl p-4 flex flex-col items-center">
              <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                <defs>
                  <marker id="arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                  <marker id="arr-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
                  </marker>
                  <marker id="arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
                  </marker>
                </defs>

                {/* Grid */}
                {Array.from({ length: 15 }).map((_, i) => (
                  <line key={`gx-${i}`} x1={i * 24 + 10} y1={10} x2={i * 24 + 10} y2={svgH - 10} stroke="#334155" strokeWidth={0.6} />
                ))}
                {Array.from({ length: 13 }).map((_, i) => (
                  <line key={`gy-${i}`} x1={10} y1={i * 24 + 10} x2={svgW - 10} y2={i * 24 + 10} stroke="#334155" strokeWidth={0.6} />
                ))}

                {/* Head-to-tail Vectors: A -> B -> C */}
                {(() => {
                  const ax = originX;
                  const ay = originY;
                  const bx = originX + vecA.x * scale;
                  const by = originY - vecA.y * scale;
                  const cx = bx + vecB.x * scale;
                  const cy = by - vecB.y * scale;

                  return (
                    <>
                      {/* AB Vector */}
                      <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#38bdf8" strokeWidth={3.5} markerEnd="url(#arr-blue)" />
                      <circle cx={ax} cy={ay} r={4} fill="#e2e8f0" />
                      <text x={ax - 15} y={ay + 15} fill="#e2e8f0" fontSize="12" fontWeight="bold">A</text>
                      <circle cx={bx} cy={by} r={4} fill="#38bdf8" />
                      <text x={bx + 5} y={by + 15} fill="#38bdf8" fontSize="12" fontWeight="bold">B</text>
                      <text x={(ax + bx) / 2 - 20} y={(ay + by) / 2 + 15} fill="#38bdf8" fontSize="11" fontWeight="bold">AB⃗ ({fmt(vecA.x)}, {fmt(vecA.y)})</text>

                      {/* BC Vector */}
                      <line x1={bx} y1={by} x2={cx} y2={cy} stroke="#34d399" strokeWidth={3.5} markerEnd="url(#arr-emerald)" />
                      <circle cx={cx} cy={cy} r={4} fill="#34d399" />
                      <text x={cx + 8} y={cy} fill="#34d399" fontSize="12" fontWeight="bold">C</text>
                      <text x={(bx + cx) / 2 + 10} y={(by + cy) / 2} fill="#34d399" fontSize="11" fontWeight="bold">BC⃗ ({fmt(vecB.x)}, {fmt(vecB.y)})</text>

                      {/* Resultant AC Vector */}
                      <line x1={ax} y1={ay} x2={cx} y2={cy} stroke="#fbbf24" strokeWidth={4} strokeDasharray="6" markerEnd="url(#arr-amber)" />
                      <text x={(ax + cx) / 2 - 35} y={(ay + cy) / 2 - 10} fill="#fbbf24" fontSize="13" fontWeight="bold">
                        AC⃗ = AB⃗ + BC⃗
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className="md:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-sm text-amber-900">
                <span className="font-bold">{L('त्रिभुजको नियम (Triangle Law):', 'Triangle Law of Addition:')}</span>
                <p className="mt-1">
                  {L(
                    'यदि दुईpcs भेक्टरहरूलाई एउटा त्रिभुजका दुई क्रमिक भुजाहरू (पहिलोको टुप्पामा दोस्रोको पुच्छर) ले जनाइन्छ भने, विपरित क्रममा रहेको तेस्रो भुजाले तिनीहरूको जोड (नतिजामूलक भेक्टर) लाई जनाउँछ: AB⃗ + BC⃗ = AC⃗।',
                    'If two vectors are represented by two sides of a triangle in sequence (head-to-tail), the third side taken in reverse order represents their resultant sum: AB⃗ + BC⃗ = AC⃗.'
                  )}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-blue-700 block mb-1">Vector AB⃗ (x, y):</label>
                <div className="flex gap-2">
                  <input type="number" min="-2" max="6" value={vecA.x} onChange={(e) => setVecA({ ...vecA, x: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                  <input type="number" min="-2" max="6" value={vecA.y} onChange={(e) => setVecA({ ...vecA, y: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-700 block mb-1">Vector BC⃗ (x, y):</label>
                <div className="flex gap-2">
                  <input type="number" min="-2" max="6" value={vecB.x} onChange={(e) => setVecB({ ...vecB, x: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                  <input type="number" min="-2" max="6" value={vecB.y} onChange={(e) => setVecB({ ...vecB, y: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl font-mono text-sm space-y-1">
                <div className="font-bold text-slate-800">
                  Resultant vector (AC⃗):
                </div>
                <div className="text-indigo-900 font-bold">
                  AC⃗ = AB⃗ + BC⃗ = ({fmt(vecA.x)} + {fmt(vecB.x)}, {fmt(vecA.y)} + {fmt(vecB.y)}) = ({fmt(vecA.x + vecB.x)}, {fmt(vecA.y + vecB.y)})
                </div>
                <div className="text-xs text-slate-500">
                  Magnitude |AC⃗| = √({fmt(vecA.x + vecB.x)}² + {fmt(vecA.y + vecB.y)}²) = {fmt(Math.sqrt((vecA.x + vecB.x) ** 2 + (vecA.y + vecB.y) ** 2).toFixed(2))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: POLYGON LAW */}
        {activeTab === 'polygon' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-3 rounded text-sm text-indigo-900">
              <span className="font-bold">{L('बहुभुजको नियम (Polygon Law):', 'Polygon Law of Vectors:')}</span>
              <p className="mt-1">
                {L(
                  'धेरै भेक्टरहरूलाई पालैपालो head-to-tail क्रममा जोड्दा शुरुको बिन्दुदेखि अन्तिम टुप्पोसम्म जोडिएको भेक्टर नै तिनीहरूको नतिजामूलक भेक्टर (R⃗) हुन्छ। यदि बहुभुज बन्द (Closed) छ भने नतिजामूलक भेक्टर शून्य 0⃗ हुन्छ!',
                  'When multiple vectors are connected head-to-tail, the directed segment from the initial point to the final terminal point is the resultant vector R⃗. In a closed polygon, the resultant sum is 0⃗.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-7 bg-slate-900 rounded-xl p-3 flex justify-center">
                <svg width={360} height={260} viewBox="0 0 360 260">
                  <defs>
                    <marker id="p-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                    </marker>
                    <marker id="p-res" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                    </marker>
                  </defs>

                  {/* Points P1, P2, P3, P4 */}
                  {(() => {
                    const pts = [
                      { x: 50, y: 190, name: 'A' },
                      { x: 150, y: 210, name: 'B' },
                      { x: 250, y: 150, name: 'C' },
                      { x: 200, y: 60, name: 'D' },
                    ];
                    return (
                      <>
                        {/* AB */}
                        <line x1={pts[0].x} y1={pts[0].y} x2={pts[1].x} y2={pts[1].y} stroke="#38bdf8" strokeWidth={3} markerEnd="url(#p-arrow)" />
                        {/* BC */}
                        <line x1={pts[1].x} y1={pts[1].y} x2={pts[2].x} y2={pts[2].y} stroke="#34d399" strokeWidth={3} markerEnd="url(#p-arrow)" />
                        {/* CD */}
                        <line x1={pts[2].x} y1={pts[2].y} x2={pts[3].x} y2={pts[3].y} stroke="#a78bfa" strokeWidth={3} markerEnd="url(#p-arrow)" />

                        {/* If closed, show DA */}
                        {polygonClosed ? (
                          <line x1={pts[3].x} y1={pts[3].y} x2={pts[0].x} y2={pts[0].y} stroke="#f43f5e" strokeWidth={3} markerEnd="url(#p-arrow)" />
                        ) : (
                          /* Resultant AD */
                          <line x1={pts[0].x} y1={pts[0].y} x2={pts[3].x} y2={pts[3].y} stroke="#fbbf24" strokeWidth={3.5} strokeDasharray="5" markerEnd="url(#p-res)" />
                        )}

                        {pts.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r={4} fill="#f8fafc" />
                            <text x={p.x - 10} y={p.y + 16} fill="#f8fafc" fontSize="12" fontWeight="bold">{p.name}</text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div className="md:col-span-5 space-y-4">
                <button
                  onClick={() => {
                    setPolygonClosed(!polygonClosed);
                    kit.tap();
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                    polygonClosed ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {polygonClosed ? L('खुला बहुभुज हेर्नुहोस् (Resultant R⃗)', 'Show Open Polygon (Resultant R⃗)') : L('बहुभुज बन्द गर्नुहोस् (Closed Polygon)', 'Close Polygon (DA⃗)')}
                </button>

                <div className="p-4 bg-slate-50 border rounded-xl space-y-2 text-sm">
                  {polygonClosed ? (
                    <div>
                      <div className="font-bold text-rose-700">बन्द बहुभुज (Closed Polygon ABCD):</div>
                      <div className="font-mono text-sm mt-1">AB⃗ + BC⃗ + CD⃗ + DA⃗ = 0⃗</div>
                      <p className="text-xs text-slate-500 mt-1">
                        शुRs गरेको बिन्दु A मै फर्किने भएकाले विस्थापन शून्य हुन्छ।
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-amber-800">Resultant vector (R⃗):</div>
                      <div className="font-mono text-sm mt-1 text-indigo-900 font-bold">
                        R⃗ = AB⃗ + BC⃗ + CD⃗ = AD⃗
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        From the start A of the first vector to the tip D of the last vector.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: ADDITION & SUBTRACTION */}
        {activeTab === 'addsub' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setOpMode('add')}
                className={`flex-1 py-2 rounded-xl font-bold text-sm border ${opMode === 'add' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700'}`}
              >
                {L('भेक्टर जोड: a⃗ + b⃗', 'Addition: a⃗ + b⃗')}
              </button>
              <button
                onClick={() => setOpMode('sub')}
                className={`flex-1 py-2 rounded-xl font-bold text-sm border ${opMode === 'sub' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700'}`}
              >
                {L('भेक्टर घटाउ: a⃗ - b⃗ = a⃗ + (-b⃗)', 'Subtraction: a⃗ - b⃗')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-xs font-bold text-blue-900">Vector a⃗ (x₁, y₁):</span>
                <div className="flex gap-2 mt-2">
                  <input type="number" min="-6" max="6" value={v1.x} onChange={(e) => setV1({ ...v1, x: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                  <input type="number" min="-6" max="6" value={v1.y} onChange={(e) => setV1({ ...v1, y: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                </div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-xs font-bold text-emerald-900">Vector b⃗ (x₂, y₂):</span>
                <div className="flex gap-2 mt-2">
                  <input type="number" min="-6" max="6" value={v2.x} onChange={(e) => setV2({ ...v2, x: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                  <input type="number" min="-6" max="6" value={v2.y} onChange={(e) => setV2({ ...v2, y: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                </div>
              </div>
            </div>

            {/* Calculations Box */}
            {(() => {
              const resX = opMode === 'add' ? v1.x + v2.x : v1.x - v2.x;
              const resY = opMode === 'add' ? v1.y + v2.y : v1.y - v2.y;
              return (
                <div className="p-4 bg-slate-900 text-white rounded-xl font-mono space-y-2">
                  <div className="text-sm text-cyan-400 font-bold">
                    {opMode === 'add' ? 'a⃗ + b⃗ = (x₁ + x₂, y₁ + y₂)' : 'a⃗ - b⃗ = (x₁ - x₂, y₁ - y₂) = a⃗ + (-b⃗)'}
                  </div>
                  <div className="text-base font-bold">
                    = ({fmt(v1.x)} {opMode === 'add' ? '+' : '-'} ({fmt(v2.x)}), {fmt(v1.y)} {opMode === 'add' ? '+' : '-'} ({fmt(v2.y)}))
                  </div>
                  <div className="text-xl text-emerald-400 font-bold">
                    = ({fmt(resX)}, {fmt(resY)})
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB D: SCALAR MULTIPLICATION */}
        {activeTab === 'scalar' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3 rounded text-sm text-emerald-900">
              <span className="font-bold">{L('स्केलर गुणन (Scalar Multiplication):', 'Scalar Multiplication (ka⃗):')}</span>
              <p className="mt-1">
                {L(
                  'यदि a⃗ = (x, y) र k एउटा वास्तविक संख्या हो भने ka⃗ = (kx, ky) हुन्छ। k > 0 भए दिशा उही रहन्छ, k < 0 भए दिशा उल्टिन्छ, र k = 0 भए शून्य भेक्टर 0⃗ बन्दछ।',
                  'For vector a⃗ = (x, y) and scalar k, ka⃗ = (kx, ky). If k > 0 direction is unchanged; if k < 0 direction reverses; if k = 0 it becomes 0⃗.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-6 bg-slate-900 rounded-xl p-3 flex justify-center">
                <svg width={340} height={260} viewBox="0 0 340 260">
                  <defs>
                    <marker id="sc-base" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                    </marker>
                    <marker id="sc-res" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
                    </marker>
                  </defs>

                  {/* Origin */}
                  <circle cx={170} cy={130} r={4} fill="#e2e8f0" />
                  <text x={160} y={150} fill="#94a3b8" fontSize="11">O(0,0)</text>

                  {/* Base Vector */}
                  <line
                    x1={170}
                    y1={130}
                    x2={170 + baseVec.x * 20}
                    y2={130 - baseVec.y * 20}
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    markerEnd="url(#sc-base)"
                  />
                  <text x={170 + baseVec.x * 20 + 5} y={130 - baseVec.y * 20} fill="#38bdf8" fontSize="11" fontWeight="bold">a⃗</text>

                  {/* Scaled Vector */}
                  {scalarK !== 0 && (
                    <line
                      x1={170}
                      y1={130}
                      x2={170 + baseVec.x * scalarK * 20}
                      y2={130 - baseVec.y * scalarK * 20}
                      stroke="#fbbf24"
                      strokeWidth={3.5}
                      strokeDasharray={scalarK < 0 ? '4' : 'none'}
                      markerEnd="url(#sc-res)"
                    />
                  )}
                </svg>
              </div>

              <div className="md:col-span-6 space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-700">Scalar value k: {fmt(scalarK)}</span>
                  <input
                    type="range"
                    min="-3"
                    max="4"
                    step="0.5"
                    value={scalarK}
                    onChange={(e) => setScalarK(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 mt-1"
                  />
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>-3</span>
                    <span>0</span>
                    <span>+4</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border rounded-xl space-y-1 font-mono text-sm">
                  <div className="text-slate-600">a⃗ = ({fmt(baseVec.x)}, {fmt(baseVec.y)})</div>
                  <div className="text-amber-800 font-bold text-base">
                    ka⃗ = {fmt(scalarK)} × ({fmt(baseVec.x)}, {fmt(baseVec.y)}) = ({fmt(scalarK * baseVec.x)}, {fmt(scalarK * baseVec.y)})
                  </div>
                  <div className="text-xs text-slate-500">
                    {scalarK > 0 && L('दिशा अपरिवर्तित (Same direction), लम्बाइ बदलिएको', 'Same direction, scaled magnitude')}
                    {scalarK < 0 && L('दिशा ठ्याक्कै विपरित (Opposite direction)!', 'Opposite direction!')}
                    {scalarK === 0 && L('शून्य भेक्टर 0⃗ (Zero vector)', 'Zero vector')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB E: CHALLENGE */}
        {activeTab === 'challenge' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-slate-800">
                {L(`प्रश्न ${toNp(challengeIdx + 1)} / ${toNp(challenges.length)}`, `Question ${challengeIdx + 1} of ${challenges.length}`)}
              </span>
              <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded">
                {L('पाठ्यपुस्तक आधारित प्रश्न', 'CDC Textbook Question')}
              </span>
            </div>

            <p className="font-medium text-slate-800 text-base">
              {isNe ? challenges[challengeIdx].qNp : challenges[challengeIdx].qEn}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {challenges[challengeIdx].opts.map((opt, i) => {
                const isSelected = selectedAns === i;
                const isCorrect = i === challenges[challengeIdx].correct;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedAns(i);
                      if (isCorrect) kit.good();
                      else kit.oops();
                    }}
                    className={`p-3 rounded-xl border text-left font-mono font-bold transition-all ${
                      selectedAns === null
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                        : isCorrect
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                        : isSelected
                        ? 'bg-rose-100 border-rose-400 text-rose-900'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {fmt(opt)}
                  </button>
                );
              })}
            </div>

            {selectedAns !== null && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="text-xs font-bold text-blue-900">
                  {L('समाधान व्याख्या (Solution):', 'Explanation:')}
                </div>
                <div className="text-sm font-mono text-blue-950">
                  {isNe ? challenges[challengeIdx].expNp : challenges[challengeIdx].expEn}
                </div>
                <button
                  onClick={() => {
                    setSelectedAns(null);
                    setChallengeIdx((prev) => (prev + 1) % challenges.length);
                  }}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  {L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default VectorOperationsLab;
