import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const CompoundInterestLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U2-01',
    chapter: 2,
    titleNp: 'चक्रीय ब्याज दृश्य प्रयोगशाला',
    titleEn: 'Compound Interest Visual Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'yearByYear' | 'compareSI' | 'frequency' | 'reverseCalc'>('yearByYear');

  // Input Controls
  const [principal, setPrincipal] = useState<number>(100000);
  const [rate, setRate] = useState<number>(10); // annual rate %
  const [years, setYears] = useState<number>(3);

  // Year-by-year compounding calculation
  let runningP = principal;
  const yearlyBreakdown: { year: number; startP: number; interest: number; endAmount: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const interest = (runningP * rate * 1) / 100;
    const endAmount = runningP + interest;
    yearlyBreakdown.push({ year: y, startP: runningP, interest, endAmount });
    runningP = endAmount;
  }
  const finalAnnualAmount = runningP;
  const totalAnnualCI = finalAnnualAmount - principal;

  // Simple Interest calculation for comparison
  const totalSI = (principal * rate * years) / 100;
  const finalSIAmount = principal + totalSI;
  const diffCISI = totalAnnualCI - totalSI;

  // Compounding Frequency Comparison for current P, R, T
  // Annual:
  const caAnnual = principal * Math.pow(1 + rate / 100, years);
  const ciAnnual = caAnnual - principal;

  // Semi-annual (Half-yearly):
  const caSemi = principal * Math.pow(1 + rate / 200, 2 * years);
  const ciSemi = caSemi - principal;

  // Quarterly (Terminal):
  const caQuarterly = principal * Math.pow(1 + rate / 400, 4 * years);
  const ciQuarterly = caQuarterly - principal;

  // Reverse Calculation State
  const [revKnownA, setRevKnownA] = useState<number>(133100);
  const [revR, setRevR] = useState<number>(10);
  const [revT, setRevT] = useState<number>(3);
  const revCalculatedP = revKnownA / Math.pow(1 + revR / 100, revT);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा १० गणितको एकाइ २: चक्रीय ब्याज (Compound Interest) प्रयोगशालामा स्वागत छ! यहाँ ब्याजमाथि ब्याज कसरी थपिन्छ, वार्षिक, अर्धवार्षिक र त्रैमासिक ब्याज, तथा साधारण र चक्रीय ब्याजको भिन्नता हेर्नुहोस्!',
        'Welcome to Grade 10 Compound Interest Laboratory! Visually observe interest on interest, compare Simple vs Compound Interest, and explore compounding frequencies!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'yearByYear', labelNp: 'क) वर्षैपिच्छे चक्रीय वृद्धि (Year-by-Year)', labelEn: 'A) Year-by-Year Growth' },
            { id: 'compareSI', labelNp: 'ख) साधारण र चक्रीय ब्याज तुलना (SI vs CI)', labelEn: 'B) Compare SI vs CI' },
            { id: 'frequency', labelNp: 'ग) ब्याज गणना अवधि (वार्षिक, अर्धवार्षिक, त्रैमासिक)', labelEn: 'C) Compounding Frequency' },
            { id: 'reverseCalc', labelNp: 'घ) उल्टो गणना (Reverse Calculation)', labelEn: 'D) Reverse Calculation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                kit.tap();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[#167C80] text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-[#142D4E] border border-slate-200'
              }`}
            >
              {isNe ? tab.labelNp : tab.labelEn}
            </button>
          ))}
        </div>

        {/* CONTROLS BAR (shared across Tabs A, B, C) */}
        {activeTab !== 'reverseCalc' && (
          <div className="bg-[#142D4E] text-white p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs shadow-sm">
            <div>
              <div className="flex justify-between font-bold text-slate-200 mb-1">
                <span>{L('सावाँ (Principal P):', 'Principal P:')}</span>
                <span className="text-amber-400 font-mono">रु. {fmt(principal.toLocaleString())}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="500000"
                step="10000"
                value={principal}
                onChange={(e) => setPrincipal(parseInt(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-200 mb-1">
                <span>{L('वार्षिक ब्याजदर (Rate R):', 'Annual Rate R:')}</span>
                <span className="text-cyan-400 font-mono">{fmt(rate)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={rate}
                onChange={(e) => setRate(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-200 mb-1">
                <span>{L('समय (Time T):', 'Time T:')}</span>
                <span className="text-emerald-400 font-mono">{fmt(years)} {L('वर्ष', 'Years')}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>
          </div>
        )}

        {/* ── TAB A: YEAR-BY-YEAR COMPOUNDING ────────────────────────────────────── */}
        {activeTab === 'yearByYear' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Visual Money Growth Chart */}
            <div className="md:col-span-6 bg-slate-900 rounded-2xl p-4 flex flex-col justify-between text-white shadow-md">
              <span className="text-xs font-bold text-cyan-400">
                {L('सावाँ र ब्याजको वार्षिक वृद्धि (Principal & Accumulated CI):', 'Growth of Principal & Compound Interest:')}
              </span>

              {/* Stacked Growth Bars */}
              <div className="flex items-end justify-around h-48 pt-4 pb-2 border-b border-slate-700">
                <div className="flex flex-col items-center gap-1">
                  <div
                    style={{ height: '70px', width: '38px' }}
                    className="bg-blue-600 rounded-t flex items-center justify-center text-[10px] font-bold"
                  >
                    P
                  </div>
                  <span className="text-[11px] text-slate-400">Year 0</span>
                </div>

                {yearlyBreakdown.map((item) => {
                  const pHeight = 70;
                  const intRatio = (item.endAmount - principal) / principal;
                  const intHeight = Math.min(intRatio * 100, 80);
                  return (
                    <div key={item.year} className="flex flex-col items-center gap-1">
                      <div className="w-[38px] flex flex-col justify-end">
                        <div
                          style={{ height: `${intHeight}px` }}
                          className="bg-amber-400 rounded-t flex items-center justify-center text-[9px] font-bold text-slate-900"
                        >
                          +CI
                        </div>
                        <div
                          style={{ height: `${pHeight}px` }}
                          className="bg-blue-600 flex items-center justify-center text-[10px] font-bold"
                        >
                          P
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Y{fmt(item.year)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary */}
              <div className="mt-3 flex justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400">कुल चक्रीय मिश्रधन (CA):</span>
                  <div className="text-sm font-bold text-emerald-400">रु. {fmt(Math.round(finalAnnualAmount).toLocaleString())}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">कुल चक्रीय ब्याज (CI):</span>
                  <div className="text-sm font-bold text-amber-400">रु. {fmt(Math.round(totalAnnualCI).toLocaleString())}</div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Table and Formulas */}
            <div className="md:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="bg-amber-50 border-l-4 border-amber-600 p-3 rounded text-xs text-amber-950">
                <span className="font-bold">{L('ब्याजमाथि ब्याज (Interest on Interest):', 'Core Concept:')}</span>
                <p className="mt-1">
                  {L(
                    'प्रत्येक वर्षको अन्त्यमा प्राप्त ब्याज अघिल्लो सावाँमा जोडिन्छ र नयाँ सावाँ (New Principal) बन्छ। त्यसैले हरेक वर्ष ब्याजको रकम बढ्दै जान्छ!',
                    'At the end of each year, the accrued interest is added to the principal to form the new principal for the next period.'
                  )}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b">
                      <th className="p-2 font-bold text-slate-700">वर्ष</th>
                      <th className="p-2 font-bold text-slate-700">सुरुको सावाँ (P)</th>
                      <th className="p-2 font-bold text-slate-700">ब्याज (I = P·R/100)</th>
                      <th className="p-2 font-bold text-slate-700">अन्तिम मिश्रधन (A)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyBreakdown.map((row) => (
                      <tr key={row.year} className="border-b font-mono">
                        <td className="p-2 font-bold text-slate-800">Y{fmt(row.year)}</td>
                        <td className="p-2">रु. {fmt(Math.round(row.startP).toLocaleString())}</td>
                        <td className="p-2 text-amber-700 font-bold">+ रु. {fmt(Math.round(row.interest).toLocaleString())}</td>
                        <td className="p-2 text-emerald-800 font-bold">रु. {fmt(Math.round(row.endAmount).toLocaleString())}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl font-mono text-xs space-y-1">
                <div className="font-bold text-[#142D4E]">वार्षिक चक्रीय मिश्रधन सूत्र (Formula):</div>
                <div className="text-slate-700">CA = P(1 + R/100)ᵀ = {fmt(principal)} × (1 + {fmt(rate)}/100)^{fmt(years)}</div>
                <div className="font-bold text-[#167C80] text-sm">= रु. {fmt(Math.round(finalAnnualAmount).toLocaleString())}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB B: COMPARE SI VS CI ────────────────────────────────────────────── */}
        {activeTab === 'compareSI' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-[#142D4E] text-base">
              {L('साधारण ब्याज (SI) र वार्षिक चक्रीय ब्याज (CI) को तुलना:', 'Comparison of Simple vs Compound Interest:')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <span className="font-bold text-blue-900 text-sm block">{L('१) साधारण ब्याज (Simple Interest):', '1) Simple Interest (SI):')}</span>
                <div className="font-mono text-xs text-slate-600">SI = (P × T × R) / 100</div>
                <div className="font-mono text-xs text-slate-600">= ({fmt(principal)} × {fmt(years)} × {fmt(rate)}) / 100</div>
                <div className="text-lg font-bold text-blue-950 font-mono">
                  SI = रु. {fmt(totalSI.toLocaleString())}
                </div>
                <div className="text-xs text-slate-500">कुल मिश्रधन = रु. {fmt(finalSIAmount.toLocaleString())}</div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-bold text-emerald-900 text-sm block">{L('२) चक्रीय ब्याज (Compound Interest):', '2) Compound Interest (CI):')}</span>
                <div className="font-mono text-xs text-slate-600">CI = P[(1 + R/100)ᵀ - 1]</div>
                <div className="font-mono text-xs text-slate-600">= {fmt(principal)} × [(1.{fmt(rate)})^{fmt(years)} - 1]</div>
                <div className="text-lg font-bold text-emerald-950 font-mono">
                  CI = रु. {fmt(Math.round(totalAnnualCI).toLocaleString())}
                </div>
                <div className="text-xs text-slate-500">कुल मिश्रधन = रु. {fmt(Math.round(finalAnnualAmount).toLocaleString())}</div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                <span className="font-bold text-amber-900 text-sm block">{L('३) ब्याजको भिन्नता (Difference CI - SI):', '3) Difference (CI - SI):')}</span>
                <div className="font-mono text-xs text-slate-600">अन्तर = CI - SI</div>
                <div className="font-mono text-xs text-slate-600">रु. {fmt(Math.round(totalAnnualCI).toLocaleString())} - रु. {fmt(totalSI.toLocaleString())}</div>
                <div className="text-xl font-bold text-amber-950 font-mono">
                  = रु. {fmt(Math.round(diffCISI).toLocaleString())}
                </div>
                <div className="text-[11px] text-amber-800">
                  {L('समय जति लामो हुन्छ, चक्रीय ब्याज र साधारण ब्याज बीचको अन्तर उति नै ठूलो हुन्छ!', 'The longer the duration, the faster the gap between CI and SI expands!')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB C: COMPOUNDING FREQUENCY ───────────────────────────────────────── */}
        {activeTab === 'frequency' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-teal-50 border-l-4 border-teal-600 p-3 rounded text-xs text-teal-950">
              <span className="font-bold">{L('ब्याज गणना अवधिको प्रभाव (Impact of Compounding Period):', 'Compounding Period Effect:')}</span>
              <p className="mt-1">
                {L(
                  'जति चाँडो-चाँडो ब्याज पुँजीकृत (Compound) गरिन्छ, उति नै धेरै ब्याज प्राप्त हुन्छ। त्यसैले: त्रैमासिक ब्याज > अर्धवार्षिक ब्याज > वार्षिक ब्याज!',
                  'The more frequently interest is compounded within the year, the greater the final yield: Quarterly > Semi-annual > Annual!'
                )}
              </p>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                <span className="font-bold text-slate-800 text-xs block">वार्षिक (Annually)</span>
                <div className="font-mono text-[11px] text-slate-500">A = P(1 + R/100)ᵀ</div>
                <div className="text-base font-bold text-slate-900 font-mono">रु. {fmt(Math.round(caAnnual).toLocaleString())}</div>
                <div className="text-xs text-amber-700 font-bold">CI = रु. {fmt(Math.round(ciAnnual).toLocaleString())}</div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-900 text-xs block">अर्धवार्षिक (Half-yearly)</span>
                <div className="font-mono text-[11px] text-slate-500">A = P(1 + R/200)²ᵀ</div>
                <div className="text-base font-bold text-indigo-950 font-mono">रु. {fmt(Math.round(caSemi).toLocaleString())}</div>
                <div className="text-xs text-amber-700 font-bold">CI = रु. {fmt(Math.round(ciSemi).toLocaleString())}</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-900 text-xs block">त्रैमासिक (Quarterly)</span>
                <div className="font-mono text-[11px] text-slate-500">A = P(1 + R/400)⁴ᵀ</div>
                <div className="text-base font-bold text-emerald-950 font-mono">रु. {fmt(Math.round(caQuarterly).toLocaleString())}</div>
                <div className="text-xs text-amber-700 font-bold">CI = रु. {fmt(Math.round(ciQuarterly).toLocaleString())}</div>
              </div>
            </div>

            {/* Textbook Benchmark Example */}
            <div className="p-4 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-2">
              <div className="text-amber-400 font-bold text-sm">
                {L('पाठ्यपुस्तकको प्रमाणिक उदाहरण (रु. १,००,०००, १५% वार्षिक दर, १ वर्ष):', 'CDC Textbook Benchmark Example (Rs. 100,000 at 15% for 1 year):')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                <div>• वार्षिक: रु. १,१५,०००.००</div>
                <div>• अर्धवार्षिक: रु. १,१५,५६२.५० (+ रु. ५६२.५०)</div>
                <div>• त्रैमासिक: रु. १,१५,८६५.०४ (+ रु. ८६५.०४)</div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB D: REVERSE CALCULATION ─────────────────────────────────────────── */}
        {activeTab === 'reverseCalc' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-[#142D4E] text-base">
              {L('उल्टो गणना: मिश्रधनबाट सावाँ पत्ता लगाउने विधि', 'Reverse Calculation: Find Principal from Amount')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">दिइएको मिश्रधन (CA):</span>
                <input
                  type="number"
                  value={revKnownA}
                  onChange={(e) => setRevKnownA(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">वार्षिक दर (R%):</span>
                <input
                  type="number"
                  value={revR}
                  onChange={(e) => setRevR(parseFloat(e.target.value) || 1)}
                  className="w-full p-2 border rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">समय (T वर्ष):</span>
                <input
                  type="number"
                  value={revT}
                  onChange={(e) => setRevT(parseFloat(e.target.value) || 1)}
                  className="w-full p-2 border rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl font-mono text-xs space-y-2">
              <div className="font-bold text-[#167C80] text-sm">
                सूत्र: P = CA / (1 + R/100)ᵀ
              </div>
              <div className="text-slate-700">
                = {fmt(revKnownA)} / (1 + {fmt(revR)}/100)^{fmt(revT)}
              </div>
              <div className="text-xl font-bold text-emerald-900 pt-1">
                सावाँ (P) = रु. {fmt(Math.round(revCalculatedP).toLocaleString())}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default CompoundInterestLab;
