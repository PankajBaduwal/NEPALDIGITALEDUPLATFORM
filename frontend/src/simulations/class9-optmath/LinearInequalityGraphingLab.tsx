import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const LinearInequalityGraphingLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U1-03',
    chapter: 1,
    titleNp: 'रेखीय असमानता ग्राफ प्रयोगशाला',
    titleEn: 'Linear Inequality Graphing Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'number_line' | 'plane_ineq' | 'test_point' | 'chocolate'>('plane_ineq');

  // Activity A: One-variable number line
  const [numLineIneq, setNumLineIneq] = useState<'<2' | '<=2' | '>2' | '>=2' | '-1to2'>('<=2');

  // Activity B & C: Two-variable plane inequality: y [op] m*x + c
  const [slopeM, setSlopeM] = useState<number>(1);
  const [interceptC, setInterceptC] = useState<number>(1);
  const [ineqOp, setIneqOp] = useState<'<=' | '>=' | '<' | '>'>('<=');

  // Activity D: Interactive test point
  const [testPoint, setTestPoint] = useState<{ x: number; y: number }>({ x: 1, y: 1 });

  // Activity E: Chocolate budget: 5x + 10y <= 30
  const [choc5Count, setChoc5Count] = useState<number>(2);
  const [choc10Count, setChoc10Count] = useState<number>(2);
  const totalCost = choc5Count * 5 + choc10Count * 10;
  const isBudgetOk = totalCost <= 30;

  // Plane Dimensions
  const svgW = 400;
  const svgH = 320;
  const originX = 200;
  const originY = 160;
  const scale = 20; // 20px = 1 unit, range [-9, 9]

  // Test point satisfy check: y [op] m*x + c
  const boundaryValAtTest = slopeM * testPoint.x + interceptC;
  const isTestSatisfied = (() => {
    if (ineqOp === '<=') return testPoint.y <= boundaryValAtTest;
    if (ineqOp === '>=') return testPoint.y >= boundaryValAtTest;
    if (ineqOp === '<') return testPoint.y < boundaryValAtTest;
    if (ineqOp === '>') return testPoint.y > boundaryValAtTest;
    return false;
  })();

  // Boundary Line endpoints across X from -10 to +10
  const x1 = -10;
  const y1 = slopeM * x1 + interceptC;
  const x2 = 10;
  const y2 = slopeM * x2 + interceptC;

  const svgX1 = originX + x1 * scale;
  const svgY1 = originY - y1 * scale;
  const svgX2 = originX + x2 * scale;
  const svgY2 = originY - y2 * scale;

  // Shading polygon coordinates
  const isDashed = ineqOp === '<' || ineqOp === '>';
  const shadeBelow = ineqOp === '<=' || ineqOp === '<';

  const shadePoly = shadeBelow
    ? `${svgX1},${svgY1} ${svgX2},${svgY2} ${svgW},${svgH} 0,${svgH}`
    : `${svgX1},${svgY1} ${svgX2},${svgY2} ${svgW},0 0,0`;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const mathX = Math.round((clickX - originX) / scale);
    const mathY = Math.round((originY - clickY) / scale);
    setTestPoint({ x: mathX, y: mathY });
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! रेखीय असमानता (Linear Inequalities) को सङ्ख्या रेखा र कार्तेसियन तलमा समाधान क्षेत्र (Shaded Region), ठोस/विन्दुगत सिमा रेखा र परीक्षण बिन्दु विधि यस प्रयोगशालामा अन्वेषण गर्नुहोस्!',
        'Welcome! Explore solution regions of linear inequalities on number lines and coordinate planes, solid vs dashed boundaries, and test points!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('plane_ineq')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'plane_ineq'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {L('द्वि-चल असमानता ग्राफ (2-Variable Plane)', '2-Variable Plane')}
          </button>
          <button
            onClick={() => setActiveTab('number_line')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'number_line'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {L('सङ्ख्या रेखा (Number Line)', 'Number Line')}
          </button>
          <button
            onClick={() => setActiveTab('test_point')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'test_point'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {L('परीक्षण बिन्दु विधि (Test Point Method)', 'Test Point Method')}
          </button>
          <button
            onClick={() => setActiveTab('chocolate')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'chocolate'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. {L('चकलेट बजेट चुनौती (Budget Challenge)', 'Real-Life Budget')}
          </button>
        </div>

        {/* TAB 1: 2-Variable Coordinate Plane */}
        {activeTab === 'plane_ineq' && (
          <>
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">
                {L('असमानता सम्पादक (Inequality Controls):', 'Inequality Controls:')}
              </h4>

              {/* Current Inequality Display */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center font-mono text-lg font-bold text-indigo-900">
                y {ineqOp} {slopeM !== 1 ? (slopeM === -1 ? '−' : slopeM) : ''}x {interceptC >= 0 ? `+ ${interceptC}` : `${interceptC}`}
              </div>

              {/* Operator Selector */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700">{L('असमानता चिन्ह छनोट:', 'Inequality Operator:')}</span>
                <div className="grid grid-cols-4 gap-1.5 font-mono font-bold text-sm">
                  {(['<=', '>=', '<', '>'] as const).map(op => (
                    <button
                      key={op}
                      onClick={() => setIneqOp(op)}
                      className={`p-2 rounded-lg border transition-all ${
                        ineqOp === op ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {op === '<=' ? '≤' : op === '>=' ? '≥' : op}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders for m and c */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>{L('झुकाव (Slope m):', 'Slope (m):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(slopeM)}</span>
                  </div>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="1"
                    value={slopeM}
                    onChange={e => setSlopeM(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>{L('Y-अन्तःखण्ड (Y-intercept c):', 'Y-intercept (c):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(interceptC)}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="1"
                    value={interceptC}
                    onChange={e => setInterceptC(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Line Type Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950">
                <div className="font-bold">
                  {isDashed
                    ? L('✂️ विन्दुगत रेखा (Dashed Line):', '✂️ Dashed Boundary Line:')
                    : L('📏 ठोस रेखा (Solid Line):', '📏 Solid Boundary Line:')}
                </div>
                <div className="text-[11px] text-slate-600">
                  {isDashed
                    ? L('कडा असमानता (< वा >) भएकाले सिमा रेखा समाधान क्षेत्रमा पर्दैन।', 'Strict inequality (< or >): Points on boundary line are EXCLUDED.')
                    : L('समावेशी असमानता (≤ वा ≥) भएकाले सिमा रेखा समाधान क्षेत्रमा पर्छ।', 'Inclusive inequality (≤ or ≥): Points on boundary line are INCLUDED.')}
                </div>
              </div>
            </div>

            {/* Visual Plane SVG */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                onClick={handleSvgClick}
                className="w-full max-w-[400px] bg-slate-50 rounded-xl border border-slate-200 select-none cursor-crosshair"
              >
                {/* Shaded Solution Region */}
                <polygon points={shadePoly} fill="#6366f1" fillOpacity="0.25" />

                {/* Grid */}
                {Array.from({ length: 19 }).map((_, i) => {
                  const p = i * scale;
                  return (
                    <g key={i}>
                      <line x1={p} y1={0} x2={p} y2={svgH} stroke="#e2e8f0" strokeDasharray="1 1" />
                      <line x1={0} y1={p} x2={svgW} y2={p} stroke="#e2e8f0" strokeDasharray="1 1" />
                    </g>
                  );
                })}

                {/* Axes */}
                <line x1={0} y1={originY} x2={svgW} y2={originY} stroke="#334155" strokeWidth="2" />
                <line x1={originX} y1={0} x2={originX} y2={svgH} stroke="#334155" strokeWidth="2" />

                {/* Boundary Line */}
                <line
                  x1={svgX1}
                  y1={svgY1}
                  x2={svgX2}
                  y2={svgY2}
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeDasharray={isDashed ? '6 4' : 'none'}
                />

                {/* Clicked Test Point */}
                <circle
                  cx={originX + testPoint.x * scale}
                  cy={originY - testPoint.y * scale}
                  r={6}
                  fill={isTestSatisfied ? '#10b981' : '#ef4444'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={originX + testPoint.x * scale + 8}
                  y={originY - testPoint.y * scale - 6}
                  className="text-[11px] font-bold font-mono fill-slate-800"
                >
                  ({fmt(testPoint.x)}, {fmt(testPoint.y)})
                </text>
              </svg>

              <div className="mt-2 text-center text-xs font-semibold text-slate-600">
                {L('ग्राफमा कहीँ पनि क्लिक गरी परीक्षण गर्नुहोस्।', 'Click anywhere on graph to test a point.')}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Number Line */}
        {activeTab === 'number_line' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('एक-चल असमानता सङ्ख्या रेखा (One-Variable Number Line)', 'Number Line Inequalities')}
            </h4>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { key: '<2', label: 'x < 2' },
                { key: '<=2', label: 'x ≤ 2' },
                { key: '>2', label: 'x > 2' },
                { key: '>=2', label: 'x ≥ 2' },
                { key: '-1to2', label: '−1 ≤ x < 2' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setNumLineIneq(opt.key as any)}
                  className={`px-3 py-1.5 rounded-lg border font-mono font-bold transition-all ${
                    numLineIneq === opt.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Number Line SVG */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-center">
              <svg viewBox="0 0 460 120" className="w-full max-w-[440px]">
                {/* Main line */}
                <line x1="30" y1="60" x2="430" y2="60" stroke="#334155" strokeWidth="2.5" />

                {/* Ticks from -3 to +5 */}
                {[-3, -2, -1, 0, 1, 2, 3, 4, 5].map((val, i) => {
                  const x = 50 + i * 45;
                  return (
                    <g key={val}>
                      <line x1={x} y1="52" x2={x} y2="68" stroke="#334155" strokeWidth="1.5" />
                      <text x={x} y="85" textAnchor="middle" className="text-xs font-mono font-bold fill-slate-700">
                        {fmt(val)}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded arrow / region */}
                {numLineIneq === '<=2' && (
                  <g>
                    <line x1="30" y1="60" x2="275" y2="60" stroke="#4f46e5" strokeWidth="5" />
                    {/* Closed circle at 2 (x=275) */}
                    <circle cx="275" cy="60" r="6" fill="#4f46e5" stroke="#312e81" strokeWidth="2" />
                  </g>
                )}
                {numLineIneq === '<2' && (
                  <g>
                    <line x1="30" y1="60" x2="275" y2="60" stroke="#4f46e5" strokeWidth="5" />
                    {/* Open circle at 2 */}
                    <circle cx="275" cy="60" r="6" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
                  </g>
                )}
                {numLineIneq === '>=2' && (
                  <g>
                    <line x1="275" y1="60" x2="430" y2="60" stroke="#4f46e5" strokeWidth="5" />
                    <circle cx="275" cy="60" r="6" fill="#4f46e5" stroke="#312e81" strokeWidth="2" />
                  </g>
                )}
                {numLineIneq === '>2' && (
                  <g>
                    <line x1="275" y1="60" x2="430" y2="60" stroke="#4f46e5" strokeWidth="5" />
                    <circle cx="275" cy="60" r="6" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
                  </g>
                )}
                {numLineIneq === '-1to2' && (
                  <g>
                    {/* Closed at -1 (x=140), open at 2 (x=275) */}
                    <line x1="140" y1="60" x2="275" y2="60" stroke="#4f46e5" strokeWidth="5" />
                    <circle cx="140" cy="60" r="6" fill="#4f46e5" stroke="#312e81" strokeWidth="2" />
                    <circle cx="275" cy="60" r="6" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
                  </g>
                )}
              </svg>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950">
              <strong>💡 {L('नियम:', 'Rule:')}</strong>{' '}
              {L(
                'समावेशी असमानता (≤, ≥) मा सीमा मानमा कालो भरिएको वृत्त (Closed dot) हुन्छ। कडा असमानता (<, >) मा खुला वृत्त (Open circle) हुन्छ।',
                'Closed solid dots represent included boundary values (≤, ≥), while open hollow circles represent excluded boundaries (<, >).'
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Test Point Method */}
        {activeTab === 'test_point' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('परीक्षण बिन्दु विधि (Test Point Method: मूलबिन्दु (०, ०) वा कुनै बिन्दु)', 'Test Point Verification')}
            </h4>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800">
                {L('हालको असमानता:', 'Current Inequality:')} <span className="font-mono text-indigo-700">y {ineqOp} {slopeM}x + {interceptC}</span>
              </div>
              <div className="font-bold text-slate-800">
                {L('परीक्षण गरिएको बिन्दु:', 'Tested Point:')} <span className="font-mono text-indigo-700">({testPoint.x}, {testPoint.y})</span>
              </div>
              <div className="font-mono text-slate-700 pt-1">
                x = {testPoint.x}, y = {testPoint.y} राख्दा:{' '}
                {testPoint.y} {ineqOp} {slopeM}({testPoint.x}) + {interceptC} ⇒ {testPoint.y} {ineqOp} {boundaryValAtTest}
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-xs font-bold ${isTestSatisfied ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
              {isTestSatisfied
                ? L(`✅ कथन सत्य छ! बिन्दु (${testPoint.x}, ${testPoint.y}) समाधान क्षेत्र (Shaded region) भित्र पर्दछ।`, `✅ True! Point (${testPoint.x}, ${testPoint.y}) lies inside the solution region.`)
                : L(`❌ कथन असत्य छ! बिन्दु (${testPoint.x}, ${testPoint.y}) समाधान क्षेत्र बाहिर पर्दछ।`, `❌ False! Point (${testPoint.x}, ${testPoint.y}) lies outside the solution region.`)}
            </div>
          </div>
        )}

        {/* TAB 4: Real-Life Chocolate Budget */}
        {activeTab === 'chocolate' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {L('पाठ्यपुस्तक चकलेट खरिद बजेट समस्या', 'Textbook Chocolate Budget Problem')}
              </h4>
              <p className="text-xs text-slate-500">
                {L(
                  'विद्यार्थीसँग कुल रु. ३० छ। रु. ५ पर्ने चकलेट (x) र रु. १० पर्ने चकलेट (y) खरिद गर्दा असमानता: 5x + 10y ≤ 30',
                  'A student has Rs. 30. Chocolates cost Rs. 5 (x) and Rs. 10 (y). Inequality: 5x + 10y ≤ 30'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>🍫 {L('रु. ५ पर्ने चकलेट (x):', 'Rs. 5 Chocolates (x):')}</span>
                  <span className="font-mono text-indigo-700 font-bold">{fmt(choc5Count)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={choc5Count}
                  onChange={e => setChoc5Count(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>🍫 {L('रु. १० पर्ने चकलेट (y):', 'Rs. 10 Chocolates (y):')}</span>
                  <span className="font-mono text-indigo-700 font-bold">{fmt(choc10Count)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={choc10Count}
                  onChange={e => setChoc10Count(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Total Cost & Validity */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center font-mono text-sm">
                <span className="font-bold text-slate-800">
                  ५({fmt(choc5Count)}) + १०({fmt(choc10Count)}) = रु. {fmt(totalCost)}
                </span>
                <span className="font-bold text-slate-600">बजेट = रु. ३०</span>
              </div>
              <div className={`p-3 rounded-lg border font-bold ${isBudgetOk ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
                {isBudgetOk
                  ? L(`✅ मान्य खरिद! कुल खर्च रु. ${fmt(totalCost)} बजेट रु. ३० भित्र छ (5x + 10y ≤ 30 सन्तुष्ट भयो)।`, `✅ Valid! Total cost Rs. ${totalCost} is within budget Rs. 30.`)
                  : L(`❌ बजेट नाघ्यो! कुल खर्च रु. ${fmt(totalCost)} उपलब्ध रु. ३० भन्दा बढी भयो।`, `❌ Exceeds budget! Total cost Rs. ${totalCost} is greater than Rs. 30.`)}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default LinearInequalityGraphingLab;
