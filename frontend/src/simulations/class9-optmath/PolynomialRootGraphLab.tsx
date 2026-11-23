import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const PolynomialRootGraphLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U1-02',
    chapter: 1,
    titleNp: 'बहुपदको शून्यमान तथा ग्राफ प्रयोगशाला',
    titleEn: 'Polynomial Root and Graph Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'graph_roots' | 'synthetic_div' | 'factor_theorem'>('graph_roots');

  // Quadratic Coefficients: p(x) = a*x^2 + b*x + c
  const [coeffA, setCoeffA] = useState<number>(1);
  const [coeffB, setCoeffB] = useState<number>(-5);
  const [coeffC, setCoeffC] = useState<number>(6);

  // Discriminant & Roots
  const discriminant = coeffB * coeffB - 4 * coeffA * coeffC;
  const roots = useMemo(() => {
    if (coeffA === 0) {
      if (coeffB === 0) return [];
      return [-coeffC / coeffB];
    }
    if (discriminant < 0) return [];
    if (discriminant === 0) return [-coeffB / (2 * coeffA)];
    const r1 = (-coeffB + Math.sqrt(discriminant)) / (2 * coeffA);
    const r2 = (-coeffB - Math.sqrt(discriminant)) / (2 * coeffA);
    return [Math.min(r1, r2), Math.max(r1, r2)];
  }, [coeffA, coeffB, coeffC, discriminant]);

  // Synthetic Division State: Dividing p(x) = a*x^3 + b*x^2 + c*x + d by (x - r)
  const [synA, setSynA] = useState<number>(1);
  const [synB, setSynB] = useState<number>(-2);
  const [synC, setSynC] = useState<number>(-5);
  const [synD, setSynD] = useState<number>(6);
  const [divisorR, setDivisorR] = useState<number>(3); // dividing by (x - 3)

  // Synthetic division computation steps
  const synSteps = useMemo(() => {
    // Row 1: synA, synB, synC, synD
    const r = divisorR;
    const c1 = synA;
    const m1 = c1 * r;
    const c2 = synB + m1;
    const m2 = c2 * r;
    const c3 = synC + m2;
    const m3 = c3 * r;
    const rem = synD + m3;

    return {
      coeffs: [synA, synB, synC, synD],
      mults: [null, m1, m2, m3],
      results: [c1, c2, c3, rem],
      quotientText: `${c1 !== 1 ? c1 : ''}x² ${c2 >= 0 ? '+ ' + c2 : c2}x ${c3 >= 0 ? '+ ' + c3 : c3}`,
      remainder: rem,
      isFactor: rem === 0,
    };
  }, [synA, synB, synC, synD, divisorR]);

  // SVG Graph Coordinate Mapping
  // X range [-6, 6], Y range [-10, 15]
  const svgW = 400;
  const svgH = 300;
  const originX = 200;
  const originY = 180;
  const scaleX = 25; // px per x-unit
  const scaleY = 10; // px per y-unit

  const evaluateP = (x: number) => coeffA * x * x + coeffB * x + coeffC;

  // Generate smooth polyline points
  const graphPoints = useMemo(() => {
    const pts: string[] = [];
    for (let x = -6; x <= 6; x += 0.2) {
      const y = evaluateP(x);
      const svgX = originX + x * scaleX;
      const svgY = originY - y * scaleY;
      if (svgY >= -20 && svgY <= svgH + 20) {
        pts.push(`${svgX.toFixed(1)},${svgY.toFixed(1)}`);
      }
    }
    return pts.join(' ');
  }, [coeffA, coeffB, coeffC]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! बहुपदको शून्यमान (Roots/Zeroes), द्विघात समीकरणको ग्राफ र संश्लेषित भाग (Synthetic Division) विधि यस प्रयोगशालामा अन्तरक्रियात्मक रूपमा सिक्नुहोस्!',
        'Welcome! Explore polynomial roots as X-intercepts, observe discriminant cases, and practice step-by-step Synthetic Division!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('graph_roots')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'graph_roots'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {L('बहुपद ग्राफ र शून्यमान (Graph & Roots)', 'Graph & Roots')}
          </button>
          <button
            onClick={() => setActiveTab('synthetic_div')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'synthetic_div'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {L('संश्लेषित भाग विधि (Synthetic Division)', 'Synthetic Division')}
          </button>
          <button
            onClick={() => setActiveTab('factor_theorem')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'factor_theorem'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {L('गुणनखण्ड साध्य (Factor Theorem)', 'Factor Theorem')}
          </button>
        </div>

        {/* TAB 1: GRAPH & ROOTS */}
        {activeTab === 'graph_roots' && (
          <>
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">
                {L('द्विघात बहुपद (Quadratic Polynomial):', 'Polynomial Coefficients:')}
              </h4>

              {/* Equation display */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center font-mono text-base font-bold text-indigo-900">
                p(x) = {coeffA !== 1 ? coeffA : ''}x² {coeffB >= 0 ? `+ ${coeffB}x` : `${coeffB}x`} {coeffC >= 0 ? `+ ${coeffC}` : `${coeffC}`}
              </div>

              {/* Sliders */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>a (x² को गुणाङ्क):</span>
                    <span className="font-mono text-indigo-700">{fmt(coeffA)}</span>
                  </div>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="1"
                    value={coeffA}
                    onChange={e => setCoeffA(parseInt(e.target.value) || 1)}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>b (x को गुणाङ्क):</span>
                    <span className="font-mono text-indigo-700">{fmt(coeffB)}</span>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="1"
                    value={coeffB}
                    onChange={e => setCoeffB(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>c (अचर पद, Constant):</span>
                    <span className="font-mono text-indigo-700">{fmt(coeffC)}</span>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="1"
                    value={coeffC}
                    onChange={e => setCoeffC(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">{L('पाठ्यपुस्तक उदाहरणहरू:', 'Textbook Examples:')}</span>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono font-semibold">
                  <button
                    onClick={() => { setCoeffA(1); setCoeffB(0); setCoeffC(-4); }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 border"
                  >
                    x² − 4
                  </button>
                  <button
                    onClick={() => { setCoeffA(1); setCoeffB(-5); setCoeffC(6); }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 border"
                  >
                    x² − 5x + 6
                  </button>
                  <button
                    onClick={() => { setCoeffA(1); setCoeffB(-4); setCoeffC(4); }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 border"
                  >
                    x² − 4x + 4
                  </button>
                </div>
              </div>

              {/* Discriminant and Roots info */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-800">
                  {L('विवेचक (Discriminant, b² − 4ac):', 'Discriminant (b² − 4ac):')}{' '}
                  <span className="font-mono text-indigo-700">{fmt(discriminant)}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  {discriminant > 0
                    ? L('b² − 4ac > ०: २ वटा भिन्न वास्तविक शून्यमानहरू (X-अक्षलाई २ बिन्दुमा काट्छ)', '2 distinct real roots (intersects X-axis twice)')
                    : discriminant === 0
                    ? L('b² − 4ac = ०: १ वटा दोहोरिएको वास्तविक शून्यमान (X-अक्षलाई स्पर्श गर्छ)', '1 repeated real root (touches X-axis)')
                    : L('b² − 4ac < ०: वास्तविक शून्यमान छैन (X-अक्षलाई छुँदैन)', 'No real roots (does not intersect X-axis)')}
                </div>
              </div>
            </div>

            {/* Visual Coordinate Graph */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[400px] bg-slate-50 rounded-xl border border-slate-200 select-none">
                {/* Grid Lines */}
                {Array.from({ length: 13 }).map((_, i) => {
                  const x = i * scaleX + (originX - 6 * scaleX);
                  return (
                    <line key={i} x1={x} y1={0} x2={x} y2={svgH} stroke="#e2e8f0" strokeDasharray="2 2" />
                  );
                })}

                {/* Axes */}
                <line x1={0} y1={originY} x2={svgW} y2={originY} stroke="#334155" strokeWidth="2" />
                <line x1={originX} y1={0} x2={originX} y2={svgH} stroke="#334155" strokeWidth="2" />
                <text x={svgW - 15} y={originY - 6} className="text-xs font-bold fill-slate-700">X</text>
                <text x={originX + 8} y={15} className="text-xs font-bold fill-slate-700">Y</text>

                {/* Polynomial Curve */}
                <polyline
                  points={graphPoints}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Highlight Roots (X-intercepts) */}
                {roots.map((r, i) => {
                  const rx = originX + r * scaleX;
                  const ry = originY;
                  return (
                    <g key={i}>
                      <circle cx={rx} cy={ry} r={6} fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                      <text x={rx} y={ry + 20} textAnchor="middle" className="text-xs font-bold fill-red-700 font-mono">
                        x = {fmt(r.toFixed(1))}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="mt-3 text-center text-xs font-semibold text-slate-700">
                {roots.length > 0
                  ? L(`शून्यमानहरू (X-अक्षका प्रतिच्छेदन बिन्दुहरू): x = ${roots.map(r => fmt(r.toFixed(1))).join(', ')}`, `Roots: x = ${roots.map(r => r.toFixed(1)).join(', ')}`)
                  : L('कुनै वास्तविक शून्यमान छैन (No real roots)', 'No real roots on X-axis')}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: SYNTHETIC DIVISION */}
        {activeTab === 'synthetic_div' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('संश्लेषित भाग विधि (Synthetic Division Visualiser)', 'Synthetic Division Workspace')}
                </h4>
                <p className="text-xs text-slate-500">
                  {L('बहुपदलाई एकपदी (x − r) ले भाग गर्ने द्रुत विधि।', 'Fast division of polynomial by binomial (x - r).')}
                </p>
              </div>
            </div>

            {/* Inputs: Polynomial coefficients and divisor */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border">
                <span className="text-slate-500 block mb-1">x³ को गुणाङ्क (a):</span>
                <input
                  type="number"
                  value={synA}
                  onChange={e => setSynA(parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded font-mono font-bold"
                />
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border">
                <span className="text-slate-500 block mb-1">x² को गुणाङ्क (b):</span>
                <input
                  type="number"
                  value={synB}
                  onChange={e => setSynB(parseInt(e.target.value) || 0)}
                  className="w-full p-1 border rounded font-mono font-bold"
                />
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border">
                <span className="text-slate-500 block mb-1">x को गुणाङ्क (c):</span>
                <input
                  type="number"
                  value={synC}
                  onChange={e => setSynC(parseInt(e.target.value) || 0)}
                  className="w-full p-1 border rounded font-mono font-bold"
                />
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border">
                <span className="text-slate-500 block mb-1">अचर पद (d):</span>
                <input
                  type="number"
                  value={synD}
                  onChange={e => setSynD(parseInt(e.target.value) || 0)}
                  className="w-full p-1 border rounded font-mono font-bold"
                />
              </div>
              <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200">
                <span className="text-indigo-900 font-bold block mb-1">भाजक (x − r) मा r:</span>
                <input
                  type="number"
                  value={divisorR}
                  onChange={e => setDivisorR(parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded font-mono font-bold text-indigo-700"
                />
              </div>
            </div>

            {/* Synthetic Division Table Visual */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-center overflow-x-auto">
              <div className="font-mono text-sm leading-loose">
                {/* Row 1 */}
                <div className="flex items-center gap-6 pb-2">
                  <div className="w-12 text-center font-bold text-indigo-700 bg-indigo-100 rounded py-1">
                    r = {fmt(divisorR)}
                  </div>
                  <div className="border-l-2 border-slate-400 pl-4 flex gap-8 font-bold text-slate-800">
                    {synSteps.coeffs.map((c, i) => (
                      <span key={i} className="w-10 text-center">{fmt(c)}</span>
                    ))}
                  </div>
                </div>

                {/* Row 2 (Multiplications) */}
                <div className="flex items-center gap-6 pb-2">
                  <div className="w-12 text-center text-slate-400 text-xs">× {fmt(divisorR)}</div>
                  <div className="border-l-2 border-slate-400 pl-4 flex gap-8 text-amber-700">
                    {synSteps.mults.map((m, i) => (
                      <span key={i} className="w-10 text-center">{m !== null ? (m >= 0 ? `+${fmt(m)}` : fmt(m)) : '↓'}</span>
                    ))}
                  </div>
                </div>

                {/* Divider Line */}
                <div className="border-t-2 border-slate-600 my-1"></div>

                {/* Row 3 (Quotient & Remainder) */}
                <div className="flex items-center gap-6 pt-1">
                  <div className="w-12 text-center text-slate-400 text-xs">+ যোগ</div>
                  <div className="border-l-2 border-slate-400 pl-4 flex gap-8 font-bold">
                    {synSteps.results.slice(0, 3).map((q, i) => (
                      <span key={i} className="w-10 text-center text-indigo-700">{fmt(q)}</span>
                    ))}
                    <span className="w-10 text-center text-rose-700 border-l border-slate-300 pl-2">
                      {fmt(synSteps.remainder)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Result Interpretation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">{L('भागफल (Quotient Q(x)):', 'Quotient Q(x):')}</span>
                <span className="font-mono text-sm font-bold text-indigo-700">{synSteps.quotientText}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">{L('शेषफल (Remainder R):', 'Remainder R:')}</span>
                <span className={`font-mono text-sm font-bold ${synSteps.isFactor ? 'text-emerald-700' : 'text-rose-700'}`}>
                  R = {fmt(synSteps.remainder)} {synSteps.isFactor ? L('(शून्य शेषफल ⇒ गुणनखण्ड हो)', '(Zero remainder ⇒ is a factor!)') : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FACTOR THEOREM */}
        {activeTab === 'factor_theorem' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('गुणनखण्ड साध्य (Factor Theorem Verification)', 'Factor Theorem Verification')}
            </h4>
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-2 text-indigo-950">
              <div className="font-bold text-sm">
                📖 {L('साध्य सिद्धान्त (Theorem Statement):', 'Factor Theorem:')}
              </div>
              <p className="leading-relaxed">
                {L(
                  'यदि कुनै बहुपद p(x) मा x = a राख्दा p(a) = ० हुन्छ भने (x − a) बहुपद p(x) को एउटा गुणनखण्ड (Factor) हुन्छ।',
                  'If evaluating a polynomial p(x) at x = a yields p(a) = 0, then (x − a) is a factor of p(x).'
                )}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
              <div className="font-bold text-slate-800 text-sm">
                p(x) = x³ − 2x² − 5x + 6
              </div>
              <div>
                परीक्षण (Test x = 3): p(3) = (3)³ − 2(3)² − 5(3) + 6 = 27 − 18 − 15 + 6 = <span className="font-bold text-emerald-700">0</span>
              </div>
              <div className="text-emerald-800 font-bold">
                ⇒ (x − 3) बहुपद p(x) को गुणनखण्ड हो!
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default PolynomialRootGraphLab;
