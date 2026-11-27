import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const SlopeStraightLineGraphLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U3-02',
    chapter: 3,
    titleNp: 'झुकाव तथा सरलरेखा ग्राफ प्रयोगशाला',
    titleEn: 'Slope and Straight-Line Graph Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'slope' | 'intercepts' | 'forms' | 'challenge'>('slope');

  // Activity A: Slope between P(x1, y1) and Q(x2, y2)
  const [ptP, setPtP] = useState<{ x: number; y: number }>({ x: 1, y: 1 });
  const [ptQ, setPtQ] = useState<{ x: number; y: number }>({ x: 5, y: 4 });

  const deltaX = ptQ.x - ptP.x;
  const deltaY = ptQ.y - ptP.y;
  const slopeM = deltaX !== 0 ? deltaY / deltaX : null;
  const angleThetaDeg = slopeM !== null ? (Math.atan(slopeM) * 180) / Math.PI : 90;

  // Activity B: Intercepts (y = mx + c)
  const [lineM, setLineM] = useState<number>(1);
  const [lineC, setLineC] = useState<number>(2);

  // x-intercept a = -c/m
  const interceptA = lineM !== 0 ? -lineC / lineM : null;
  const interceptB = lineC;

  // Activity C: General Form Ax + By + C = 0
  const [coeffA, setCoeffA] = useState<number>(2);
  const [coeffB, setCoeffB] = useState<number>(3);
  const [coeffC, setCoeffC] = useState<number>(-6);

  // SVG Scales
  const svgSize = 360;
  const origin = 180;
  const scale = 20;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! ऐच्छिक गणितको सरलरेखाको झुकाव (Slope m = tan θ), अन्तःखण्डहरू र सरलरेखाका विभिन्न समीकरण रूपहरू (Slope-intercept, Double-intercept, General form) यस प्रयोगशालामा अन्वेषण गर्नुहोस्!',
        'Welcome! Explore the slope of lines (m = rise/run = tan θ), X & Y intercepts, and straight-line equation forms!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('slope')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'slope'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {L('झुकाव अन्वेषक (Slope Explorer: Rise/Run)', 'Slope (Rise/Run)')}
          </button>
          <button
            onClick={() => setActiveTab('intercepts')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'intercepts'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {L('अन्तःखण्ड अन्वेषक (Intercepts)', 'Intercepts')}
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'forms'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {L('समीकरणका विभिन्न रूपहरू (Equation Forms)', 'Equation Forms')}
          </button>
        </div>

        {/* TAB 1: SLOPE EXPLORER */}
        {activeTab === 'slope' && (
          <>
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">
                {L('2 बिन्दुहरू बीचको झुकाव (Slope m = tan θ):', 'Slope between 2 Points:')}
              </h4>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Point P(x₁, y₁):</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={ptP.x}
                      onChange={e => setPtP({ ...ptP, x: parseInt(e.target.value) || 0 })}
                      className="w-16 p-1 border rounded font-mono font-bold text-center"
                    />
                    <input
                      type="number"
                      value={ptP.y}
                      onChange={e => setPtP({ ...ptP, y: parseInt(e.target.value) || 0 })}
                      className="w-16 p-1 border rounded font-mono font-bold text-center"
                    />
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Point Q(x₂, y₂):</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={ptQ.x}
                      onChange={e => setPtQ({ ...ptQ, x: parseInt(e.target.value) || 0 })}
                      className="w-16 p-1 border rounded font-mono font-bold text-center"
                    />
                    <input
                      type="number"
                      value={ptQ.y}
                      onChange={e => setPtQ({ ...ptQ, y: parseInt(e.target.value) || 0 })}
                      className="w-16 p-1 border rounded font-mono font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Slope Math Breakdown */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 text-xs font-mono">
                <div className="font-bold text-indigo-950 text-sm">
                  m = \frac&#123;y₂ − y₁&#125;&#123;x₂ − x₁&#125; = \frac&#123;rise&#125;&#123;run&#125;
                </div>
                <div className="text-slate-700">
                  m = \frac&#123;{fmt(ptQ.y)} − ({fmt(ptP.y)})&#125;&#123;{fmt(ptQ.x)} − ({fmt(ptP.x)})&#125; = \frac&#123;{fmt(deltaY)}&#125;&#123;{fmt(deltaX)}&#125;
                </div>
                <div className="text-base font-bold text-indigo-700 pt-1">
                  m = {slopeM !== null ? fmt(slopeM.toFixed(2)) : 'Undefined'}
                </div>
                <div className="text-slate-600 text-[11px]">
                  Angle of inclination with the positive X-axis: θ = {fmt(angleThetaDeg.toFixed(1))}°
                </div>
              </div>
            </div>

            {/* Coordinate Plane with Rise/Run Triangle */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full max-w-[340px] bg-slate-50 rounded-xl border border-slate-200 select-none">
                {/* Axes */}
                <line x1={0} y1={origin} x2={svgSize} y2={origin} stroke="#334155" strokeWidth="2" />
                <line x1={origin} y1={0} x2={origin} y2={svgSize} stroke="#334155" strokeWidth="2" />

                {/* Points P and Q mapped to SVG */}
                {(() => {
                  const px = origin + ptP.x * scale;
                  const py = origin - ptP.y * scale;
                  const qx = origin + ptQ.x * scale;
                  const qy = origin - ptQ.y * scale;

                  return (
                    <g>
                      {/* Straight Line through P and Q extended */}
                      <line
                        x1={px - deltaX * scale * 2}
                        y1={py + deltaY * scale * 2}
                        x2={qx + deltaX * scale * 2}
                        y2={qy - deltaY * scale * 2}
                        stroke="#4f46e5"
                        strokeWidth="2.5"
                      />

                      {/* Rise and Run right-triangle guides */}
                      <line x1={px} y1={py} x2={qx} y2={py} stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" />
                      <line x1={qx} y1={py} x2={qx} y2={qy} stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />

                      {/* Labels for Run and Rise */}
                      <text x={(px + qx) / 2} y={py + 16} textAnchor="middle" className="text-[10px] font-bold fill-blue-700 font-mono">
                        Run = {fmt(deltaX)}
                      </text>
                      <text x={qx + 8} y={(py + qy) / 2} className="text-[10px] font-bold fill-red-700 font-mono">
                        Rise = {fmt(deltaY)}
                      </text>

                      {/* Points */}
                      <circle cx={px} cy={py} r={5} fill="#4f46e5" />
                      <text x={px - 8} y={py - 8} className="text-[11px] font-bold fill-indigo-900 font-mono">
                        P({fmt(ptP.x)}, {fmt(ptP.y)})
                      </text>

                      <circle cx={qx} cy={qy} r={5} fill="#4f46e5" />
                      <text x={qx + 8} y={qy - 8} className="text-[11px] font-bold fill-indigo-900 font-mono">
                        Q({fmt(ptQ.x)}, {fmt(ptQ.y)})
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </>
        )}

        {/* TAB 2: INTERCEPTS */}
        {activeTab === 'intercepts' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('अन्तःखण्ड अन्वेषक (X-intercept a र Y-intercept b/c)', 'Intercepts Explorer')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>{L('झुकाव (Slope m):', 'Slope (m):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(lineM)}</span>
                  </div>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="0.5"
                    value={lineM}
                    onChange={e => setLineM(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>{L('Y-अन्तःखण्ड (c):', 'Y-intercept (c):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(lineC)}</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="1"
                    value={lineC}
                    onChange={e => setLineC(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Intercepts Card */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 text-xs font-mono">
                <div className="font-bold text-indigo-950 text-sm">
                  Equation: y = {lineM}x {lineC >= 0 ? `+ ${lineC}` : lineC}
                </div>
                <div className="p-2 bg-white rounded border border-indigo-100 flex justify-between">
                  <span>Y-intercept (when x = 0):</span>
                  <span className="font-bold text-indigo-700">(0, {fmt(interceptB)})</span>
                </div>
                <div className="p-2 bg-white rounded border border-indigo-100 flex justify-between">
                  <span>X-intercept (x = -c/m):</span>
                  <span className="font-bold text-emerald-700">
                    {interceptA !== null ? `(${fmt(interceptA.toFixed(1))}, 0)` : L('समानान्तर (छैन)', 'None (Parallel)')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EQUATION FORMS */}
        {activeTab === 'forms' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('सरलरेखाका विभिन्न समीकरण रूपहरू (Straight Line Equation Forms)', 'Straight Line Equation Forms')}
            </h4>

            {/* General Form Controls: Ax + By + C = 0 */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">A:</span>
                <input
                  type="number"
                  value={coeffA}
                  onChange={e => setCoeffA(parseInt(e.target.value) || 1)}
                  className="w-full p-1.5 border rounded font-mono font-bold text-center"
                />
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">B:</span>
                <input
                  type="number"
                  value={coeffB}
                  onChange={e => setCoeffB(parseInt(e.target.value) || 1)}
                  className="w-full p-1.5 border rounded font-mono font-bold text-center"
                />
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">C:</span>
                <input
                  type="number"
                  value={coeffC}
                  onChange={e => setCoeffC(parseInt(e.target.value) || 0)}
                  className="w-full p-1.5 border rounded font-mono font-bold text-center"
                />
              </div>
            </div>

            {/* Form Conversions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-950 block">{L('1. साधारण रूप (General Form):', 'General Form:')}</span>
                <div className="text-sm font-bold text-indigo-800">
                  {fmt(coeffA)}x {coeffB >= 0 ? `+ ${fmt(coeffB)}y` : `${fmt(coeffB)}y`} {coeffC >= 0 ? `+ ${fmt(coeffC)}` : `${fmt(coeffC)}`} = 0
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="font-bold text-blue-950 block">{L('2. झुकाव-अन्तःखण्ड रूप (y = mx + c):', 'Slope-Intercept Form:')}</span>
                <div className="text-sm font-bold text-blue-800">
                  y = {(-coeffA / coeffB).toFixed(2)}x {(-coeffC / coeffB) >= 0 ? `+ ${(-coeffC / coeffB).toFixed(2)}` : `${(-coeffC / coeffB).toFixed(2)}`}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-950 block">{L('3. दुई-अन्तःखण्ड रूप (x/a + y/b = 1):', 'Double Intercept Form:')}</span>
                <div className="text-sm font-bold text-emerald-800">
                  \frac&#123;x&#125;&#123;{(-coeffC / coeffA).toFixed(1)}&#125; + \frac&#123;y&#125;&#123;{(-coeffC / coeffB).toFixed(1)}&#125; = 1
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default SlopeStraightLineGraphLab;
