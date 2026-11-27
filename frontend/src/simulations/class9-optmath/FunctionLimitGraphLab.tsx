import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const FunctionLimitGraphLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U6-03',
    chapter: 6,
    titleNp: 'फलनको सीमा तथा ग्राफ अनुसन्धानशाला',
    titleEn: 'Function Limit and Graph Investigation Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'approach' | 'lhl_rhl' | 'existence' | 'challenge'>('approach');

  // Selected Function
  const [funcChoice, setFuncChoice] = useState<'linear' | 'rational_hole' | 'piecewise'>('rational_hole');
  
  // Probe X value
  const [probeX, setProbeX] = useState<number>(1.8);

  // Target a and evaluating f(x)
  let targetA = 2;
  let targetLimit = 4;
  let hasHoleAtTarget = false;

  const evalFunc = (x: number): { val: number | null; isUndefined: boolean } => {
    if (funcChoice === 'linear') {
      targetA = 2;
      targetLimit = 7;
      hasHoleAtTarget = false;
      return { val: 5 * x - 3, isUndefined: false };
    } else if (funcChoice === 'rational_hole') {
      targetA = 2;
      targetLimit = 4;
      hasHoleAtTarget = true;
      if (Math.abs(x - 2) < 0.0001) {
        return { val: null, isUndefined: true };
      }
      return { val: (x * x - 4) / (x - 2), isUndefined: false }; // x + 2
    } else {
      // Piecewise: x < 2 => x + 1, x >= 2 => x + 3
      targetA = 2;
      targetLimit = NaN; // Does not exist
      hasHoleAtTarget = false;
      if (x < 2) return { val: x + 1, isUndefined: false };
      return { val: x + 3, isUndefined: false };
    }
  };

  const currentEval = evalFunc(probeX);

  // SVG coordinate transformation
  const svgW = 380;
  const svgH = 300;
  const originX = 140;
  const originY = 220;
  const scaleX = 35;
  const scaleY = 20;

  const toSvgX = (x: number) => originX + x * scaleX;
  const toSvgY = (y: number) => originY - y * scaleY;

  // LHL and RHL test sequences
  const lhlSteps = [1.5, 1.8, 1.9, 1.95, 1.99, 1.999];
  const rhlSteps = [2.5, 2.2, 2.1, 2.05, 2.01, 2.001];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! फलनको सीमा (Limit of a Function), बायाँ सीमा (LHL x → a⁻), दायाँ सीमा (RHL x → a⁺), र सीमा अस्तित्वको सर्त (LHL = RHL = L) ग्राफबाट अन्वेषण गर्नुहोस्!',
        'Welcome! Investigate function limits, Left-Hand Limit (LHL), Right-Hand Limit (RHL), and condition of limit existence on interactive graphs!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'approach', labelNp: 'क) बिन्दु तर्फ नजिकिँदा (Approaching a Point)', labelEn: 'A) Approaching a Point' },
            { id: 'lhl_rhl', labelNp: 'ख) बायाँ र दायाँ सीमा (LHL and RHL)', labelEn: 'B) LHL and RHL' },
            { id: 'existence', labelNp: 'ग) सीमा अस्तित्वको सर्त (Limit Existence)', labelEn: 'C) Limit Existence' },
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

        {/* FUNCTION SELECTION BUTTONS */}
        <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-2.5 rounded-xl border">
          <span className="text-xs font-bold text-slate-600 uppercase mr-2">{L('फलन छान्नुहोस्:', 'Select Function:')}</span>
          <button
            onClick={() => setFuncChoice('rational_hole')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              funcChoice === 'rational_hole' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700'
            }`}
          >
            f(x) = (x² - 4)/(x - 2) [x → 2]
          </button>
          <button
            onClick={() => setFuncChoice('linear')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              funcChoice === 'linear' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700'
            }`}
          >
            f(x) = 5x - 3 [x → 2]
          </button>
          <button
            onClick={() => setFuncChoice('piecewise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              funcChoice === 'piecewise' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700'
            }`}
          >
            {L('टुक्रा फलन (LHL ≠ RHL)', 'Piecewise (LHL ≠ RHL)')}
          </button>
        </div>

        {/* TAB A: APPROACHING A POINT */}
        {activeTab === 'approach' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-7 bg-slate-900 rounded-2xl p-3 flex justify-center">
              <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                {/* Axes */}
                <line x1={20} y1={originY} x2={svgW - 20} y2={originY} stroke="#475569" strokeWidth={1.5} />
                <line x1={originX} y1={20} x2={originX} y2={svgH - 20} stroke="#475569" strokeWidth={1.5} />
                <text x={svgW - 20} y={originY - 6} fill="#94a3b8" fontSize="10">x</text>
                <text x={originX + 8} y={30} fill="#94a3b8" fontSize="10">y</text>

                {/* Target vertical line x = targetA */}
                <line x1={toSvgX(targetA)} y1={20} x2={toSvgX(targetA)} y2={originY} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3" />
                <text x={toSvgX(targetA)} y={originY + 16} fill="#fbbf24" fontSize="11" textAnchor="middle" fontWeight="bold">
                  x = {fmt(targetA)}
                </text>

                {/* Function Graph Line */}
                {funcChoice === 'rational_hole' && (
                  <>
                    <line x1={toSvgX(-1)} y1={toSvgY(1)} x2={toSvgX(5)} y2={toSvgY(7)} stroke="#38bdf8" strokeWidth={3} />
                    {/* Open circle at (2, 4) */}
                    <circle cx={toSvgX(2)} cy={toSvgY(4)} r={5} fill="#0f172a" stroke="#f43f5e" strokeWidth={2.5} />
                    <text x={toSvgX(2) + 8} y={toSvgY(4) - 6} fill="#f43f5e" fontSize="10" fontWeight="bold">
                      Hole (2, 4)
                    </text>
                  </>
                )}
                {funcChoice === 'linear' && (
                  <line x1={toSvgX(0.5)} y1={toSvgY(-0.5)} x2={toSvgX(3)} y2={toSvgY(12)} stroke="#38bdf8" strokeWidth={3} />
                )}
                {funcChoice === 'piecewise' && (
                  <>
                    <line x1={toSvgX(-1)} y1={toSvgY(0)} x2={toSvgX(2)} y2={toSvgY(3)} stroke="#38bdf8" strokeWidth={3} />
                    <circle cx={toSvgX(2)} cy={toSvgY(3)} r={4} fill="#0f172a" stroke="#38bdf8" strokeWidth={2} />
                    <line x1={toSvgX(2)} y1={toSvgY(5)} x2={toSvgX(5)} y2={toSvgY(8)} stroke="#34d399" strokeWidth={3} />
                    <circle cx={toSvgX(2)} cy={toSvgY(5)} r={4} fill="#34d399" />
                  </>
                )}

                {/* Probe Point */}
                {!currentEval.isUndefined && currentEval.val !== null && (
                  <>
                    <line x1={toSvgX(probeX)} y1={originY} x2={toSvgX(probeX)} y2={toSvgY(currentEval.val)} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3" />
                    <line x1={originX} y1={toSvgY(currentEval.val)} x2={toSvgX(probeX)} y2={toSvgY(currentEval.val)} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3" />
                    <circle cx={toSvgX(probeX)} cy={toSvgY(currentEval.val)} r={5} fill="#fbbf24" />
                  </>
                )}
              </svg>
            </div>

            <div className="md:col-span-5 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {L('चर x को मान सार्नुहोस् (Move x):', 'Move x slider:')} {fmt(probeX.toFixed(3))}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.05"
                  value={probeX}
                  onChange={(e) => setProbeX(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl font-mono text-sm space-y-1">
                <div className="text-slate-600">x = {fmt(probeX.toFixed(3))}</div>
                <div className="text-indigo-900 font-bold">
                  {currentEval.isUndefined
                    ? 'f(x) = 0/0 (अपरिभाषित / Undefined at x=2)'
                    : `f(x) = ${fmt(currentEval.val!.toFixed(3))}`}
                </div>
                <div className="text-emerald-700 text-xs font-bold pt-1">
                  {funcChoice !== 'piecewise' ? (
                    <span>lim (x → 2) f(x) = {fmt(targetLimit)} (सीमा अस्तित्वमा छ!)</span>
                  ) : (
                    <span className="text-rose-600">LHL ≠ RHL (सीमा अस्तित्वमा छैन)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: LHL AND RHL */}
        {activeTab === 'lhl_rhl' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-3 rounded text-sm text-indigo-900">
              <span className="font-bold">{L('बायाँ सीमा (LHL) र दायाँ सीमा (RHL):', 'LHL and RHL Concepts:')}</span>
              <p className="mt-1">
                {L(
                  'बायाँ सीमा (Left-Hand Limit): x मान २ भन्दा साना मानहरूबाट २ तर्फ नजिकिँदा (x → 2⁻)। दायाँ सीमा (Right-Hand Limit): x मान २ भन्दा ठूला मानहरूबाट २ तर्फ नजिकिँदा (x → 2⁺)।',
                  'LHL: x approaches 2 from values strictly less than 2 (x → 2⁻). RHL: x approaches 2 from values strictly greater than 2 (x → 2⁺).'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LHL Table */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="font-bold text-blue-900 text-sm">
                  बायाँ सीमा तालिका (x → 2⁻):
                </div>
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-1">x (&lt; 2)</th>
                      <th className="p-1">f(x)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lhlSteps.map((val, idx) => {
                      const res = evalFunc(val).val;
                      return (
                        <tr key={idx} className="border-b border-blue-100">
                          <td className="p-1">{fmt(val)}</td>
                          <td className="p-1 font-bold text-indigo-800">{fmt(res !== null ? res.toFixed(3) : '')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="text-xs font-bold text-blue-950 pt-1">
                  ➔ LHL = {funcChoice === 'piecewise' ? '3' : fmt(targetLimit)}
                </div>
              </div>

              {/* RHL Table */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="font-bold text-emerald-900 text-sm">
                  दायाँ सीमा तालिका (x → 2⁺):
                </div>
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-1">x (&gt; 2)</th>
                      <th className="p-1">f(x)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rhlSteps.map((val, idx) => {
                      const res = evalFunc(val).val;
                      return (
                        <tr key={idx} className="border-b border-emerald-100">
                          <td className="p-1">{fmt(val)}</td>
                          <td className="p-1 font-bold text-emerald-800">{fmt(res !== null ? res.toFixed(3) : '')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="text-xs font-bold text-emerald-950 pt-1">
                  ➔ RHL = {funcChoice === 'piecewise' ? '5' : fmt(targetLimit)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: EXISTENCE */}
        {activeTab === 'existence' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3 rounded text-sm text-emerald-900">
              <span className="font-bold">{L('सीमा अस्तित्वको मूलभूत सिद्धान्त:', 'Existence of Limit Theorem:')}</span>
              <p className="mt-1">
                {L(
                  'कुनै बिन्दु x = a मा फलन f(x) को दुई-तर्फी सीमा (Two-sided limit) तब मात्र अस्तित्वमा रहन्छ जब बायाँ सीमा (LHL) र दायाँ सीमा (RHL) दुवै अस्तित्वमा हुन्छन् र तिनीहरूको मान आपसमा बराबर हुन्छ: lim (x→a⁻) f(x) = lim (x→a⁺) f(x) = L।',
                  'The two-sided limit of f(x) as x → a exists if and only if both LHL and RHL exist and are equal: LHL = RHL = L.'
                )}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
              <div className="font-bold text-slate-800 text-sm">
                {L('फलनको वास्तविक मान (f(a)) र सीमा मान (Limit) बीचको अन्तर:', 'Difference between f(a) and Limit:')}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {L(
                  'f(x) = (x² - 4)/(x - 2) मा x = २ राख्दा f(२) अपरिभाषित (0/0) हुन्छ किनभने हर शून्य हुन्छ। तर २ को नजिकिँदा सीमा मान (Limit) भने ठ्याक्कै ४ हुन्छ! सीमाले बिन्दुमा के छ भन्दा पनि बिन्दुको नजिकिँदा के हुन्छ भनी देखाउँछ।',
                  'In f(x) = (x²-4)/(x-2), f(2) is undefined (0/0). However, the limiting value as x approaches 2 is 4! Limit describes the behavior near the point, not necessarily at the point itself.'
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default FunctionLimitGraphLab;
