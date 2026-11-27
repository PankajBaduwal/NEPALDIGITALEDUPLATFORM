import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const GrowthDepreciationExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U3-01',
    chapter: 3,
    titleNp: 'जनसङ्ख्या वृद्धि तथा ह्रास अन्वेषक',
    titleEn: 'Growth and Depreciation Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [mainMode, setMainMode] = useState<'growth' | 'depreciation' | 'migration' | 'compare' | 'profitLoss'>('growth');

  // ── GROWTH CONTROLS ────────────────────────────────────────────────────────
  const [initPop, setInitPop] = useState<number>(25000);
  const [growthRate, setGrowthRate] = useState<number>(2); // 2% CDC textbook activity
  const [growthYears, setGrowthYears] = useState<number>(3);

  // Year-by-year growth
  let currPop = initPop;
  const growthBreakdown: { year: number; start: number; inc: number; end: number }[] = [];
  for (let y = 1; y <= growthYears; y++) {
    const inc = Math.round((currPop * growthRate) / 100);
    const end = currPop + inc;
    growthBreakdown.push({ year: y, start: currPop, inc, end });
    currPop = end;
  }
  const finalPop = currPop;
  const totalPopGrowth = finalPop - initPop;

  // ── DEPRECIATION CONTROLS ──────────────────────────────────────────────────
  const [initAssetVal, setInitAssetVal] = useState<number>(40000); // 40,000 computer example CDC
  const [depRate, setDepRate] = useState<number>(10);
  const [depYears, setDepYears] = useState<number>(2);

  // Year-by-year depreciation
  let currAsset = initAssetVal;
  const depBreakdown: { year: number; start: number; dec: number; end: number }[] = [];
  for (let y = 1; y <= depYears; y++) {
    const dec = Math.round((currAsset * depRate) / 100);
    const end = currAsset - dec;
    depBreakdown.push({ year: y, start: currAsset, dec, end });
    currAsset = end;
  }
  const finalAssetVal = currAsset;
  const totalDepreciated = initAssetVal - finalAssetVal;

  // ── MIGRATION & DEATH ADJUSTMENT ───────────────────────────────────────────
  const [basePop, setBasePop] = useState<number>(50000);
  const [migGrowthRate, setMigGrowthRate] = useState<number>(2);
  const [inMigrants, setInMigrants] = useState<number>(600);
  const [outMigrants, setOutMigrants] = useState<number>(350);
  const [deaths, setDeaths] = useState<number>(150);

  // Adjusted 1st year population:
  const naturalInc = Math.round((basePop * migGrowthRate) / 100);
  const popAfterNat = basePop + naturalInc;
  const popAfterIn = popAfterNat + inMigrants;
  const popAfterOut = popAfterIn - outMigrants;
  const finalAdjustedPop = popAfterOut - deaths;

  // ── PROFIT & LOSS AFTER DEPRECIATION ───────────────────────────────────────
  const [purchaseCost, setPurchaseCost] = useState<number>(80000); // photocopy machine
  const [plDepRate, setPlDepRate] = useState<number>(15);
  const [plYears, setPlYears] = useState<number>(2);
  const [businessIncome, setBusinessIncome] = useState<number>(35000); // income generated
  const [sellingPrice, setSellingPrice] = useState<number>(55000); // sold price

  const depreciatedVal = Math.round(purchaseCost * Math.pow(1 - plDepRate / 100, plYears));
  const totalBenefits = sellingPrice + businessIncome;
  const netProfitOrLoss = totalBenefits - purchaseCost;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा १० गणितको एकाइ ३: वृद्धि तथा ह्रास (Growth & Depreciation) अन्वेषकमा स्वागत छ! यहाँ जनसङ्ख्या वृद्धि, सामानको अवमूल्यन (Depreciation), बसाइँसराइ समायोजन र नाफा-नोक्सान अन्वेषण गर्नुहोस्!',
        'Welcome to Grade 10 Growth and Depreciation Explorer! Investigate repeated percentage increase/decrease, migration adjustments, and asset depreciation!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'growth', labelNp: 'क) जनसङ्ख्या वृद्धि (Growth Mode)', labelEn: 'A) Growth Mode' },
            { id: 'depreciation', labelNp: 'ख) अवमूल्यन / ह्रास (Depreciation)', labelEn: 'B) Depreciation Mode' },
            { id: 'migration', labelNp: 'ग) बसाइँसराइ र मृत्यु समायोजन', labelEn: 'C) Migration & Deaths' },
            { id: 'compare', labelNp: 'घ) वृद्धि र ह्रास तुलना (+ vs -)', labelEn: 'D) Compare (+ vs -)' },
            { id: 'profitLoss', labelNp: 'ङ) ह्रासपछि नाफा-नोक्सान', labelEn: 'E) Profit & Loss' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMainMode(tab.id as any);
                kit.tap();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                mainMode === tab.id
                  ? 'bg-[#167C80] text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-[#142D4E] border border-slate-200'
              }`}
            >
              {isNe ? tab.labelNp : tab.labelEn}
            </button>
          ))}
        </div>

        {/* ── TAB A: GROWTH MODE ─────────────────────────────────────────────────── */}
        {mainMode === 'growth' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-6 bg-[#142D4E] p-4 rounded-2xl text-white shadow-md space-y-3">
              <span className="text-xs font-bold text-emerald-400 block">
                {L('जनसङ्ख्या वृद्धि ग्राफ (Upward Trend):', 'Population Growth (Upward Trend):')}
              </span>

              {/* Upward visual trend */}
              <div className="flex items-end justify-around h-44 pt-4 pb-2 border-b border-slate-700">
                <div className="flex flex-col items-center gap-1">
                  <div style={{ height: '70px', width: '38px' }} className="bg-emerald-600 rounded-t flex items-center justify-center text-[10px] font-bold">
                    P₀
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{fmt(initPop)}</span>
                </div>

                {growthBreakdown.map((row) => {
                  const h = 70 + row.year * 18;
                  return (
                    <div key={row.year} className="flex flex-col items-center gap-1">
                      <div style={{ height: `${h}px`, width: '38px' }} className="bg-emerald-500 rounded-t flex items-center justify-center text-[10px] font-bold">
                        Y{fmt(row.year)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{fmt(row.end)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl font-mono text-xs space-y-1">
                <div>अन्तिम जनसङ्ख्या (Pₜ): <span className="text-emerald-400 font-bold text-sm">{fmt(finalPop)} जना</span></div>
                <div>कुल वृद्धि (Total Growth): <span className="text-amber-400 font-bold">+ {fmt(totalPopGrowth)} जना</span></div>
              </div>
            </div>

            <div className="md:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>सुरुको जनसङ्ख्या (P): {fmt(initPop.toLocaleString())}</span>
                  </div>
                  <input type="range" min="10000" max="100000" step="5000" value={initPop} onChange={(e) => setInitPop(parseInt(e.target.value))} className="w-full accent-[#167C80]" />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-emerald-700 mb-1">
                    <span>वार्षिक वृद्धिदर (Growth Rate R): {fmt(growthRate)}%</span>
                  </div>
                  <input type="range" min="1" max="10" step="0.5" value={growthRate} onChange={(e) => setGrowthRate(parseFloat(e.target.value))} className="w-full accent-emerald-600" />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>समय (Time T): {fmt(growthYears)} वर्ष</span>
                  </div>
                  <input type="range" min="1" max="5" value={growthYears} onChange={(e) => setGrowthYears(parseInt(e.target.value))} className="w-full accent-blue-600" />
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl font-mono text-xs text-teal-950 space-y-1">
                <div className="font-bold">वृद्धि सूत्र: Pₜ = P(1 + R/100)ᵀ</div>
                <div>= {fmt(initPop)} × (1 + {fmt(growthRate)}/100)^{fmt(growthYears)} = <span className="font-bold text-[#167C80] text-sm">{fmt(finalPop)}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB B: DEPRECIATION MODE ───────────────────────────────────────────── */}
        {mainMode === 'depreciation' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-6 bg-slate-900 p-4 rounded-2xl text-white shadow-md space-y-3">
              <span className="text-xs font-bold text-rose-400 block">
                {L('अवमूल्यन / मूल्य ह्रास ग्राफ (Downward Trend):', 'Depreciation (Downward Trend):')}
              </span>

              {/* Downward visual trend */}
              <div className="flex items-end justify-around h-44 pt-4 pb-2 border-b border-slate-700">
                <div className="flex flex-col items-center gap-1">
                  <div style={{ height: '110px', width: '38px' }} className="bg-rose-500 rounded-t flex items-center justify-center text-[10px] font-bold">
                    V₀
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">रु. {fmt(initAssetVal)}</span>
                </div>

                {depBreakdown.map((row) => {
                  const h = Math.max(110 - row.year * 28, 25);
                  return (
                    <div key={row.year} className="flex flex-col items-center gap-1">
                      <div style={{ height: `${h}px`, width: '38px' }} className="bg-rose-600 rounded-t flex items-center justify-center text-[10px] font-bold">
                        Y{fmt(row.year)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">रु. {fmt(row.end)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-800 rounded-xl font-mono text-xs space-y-1">
                <div>ह्रास पछिको मूल्य (Vₜ): <span className="text-emerald-400 font-bold text-sm">रु. {fmt(finalAssetVal.toLocaleString())}</span></div>
                <div>कुल ह्रास भएको रकम (Depreciation): <span className="text-rose-400 font-bold">- रु. {fmt(totalDepreciated.toLocaleString())}</span></div>
              </div>
            </div>

            <div className="md:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>सुरुको मूल्य (V₀): रु. {fmt(initAssetVal.toLocaleString())}</span>
                  </div>
                  <input type="range" min="10000" max="100000" step="5000" value={initAssetVal} onChange={(e) => setInitAssetVal(parseInt(e.target.value))} className="w-full accent-rose-600" />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-rose-700 mb-1">
                    <span>वार्षिक ह्रासदर (Depreciation Rate R): {fmt(depRate)}%</span>
                  </div>
                  <input type="range" min="5" max="30" step="1" value={depRate} onChange={(e) => setDepRate(parseInt(e.target.value))} className="w-full accent-rose-600" />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>समय (T): {fmt(depYears)} वर्ष</span>
                  </div>
                  <input type="range" min="1" max="5" value={depYears} onChange={(e) => setDepYears(parseInt(e.target.value))} className="w-full accent-slate-700" />
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl font-mono text-xs text-rose-950 space-y-1">
                <div className="font-bold">ह्रास सूत्र: Vₜ = V₀(1 - R/100)ᵀ</div>
                <div>= {fmt(initAssetVal)} × (1 - {fmt(depRate)}/100)^{fmt(depYears)} = <span className="font-bold text-sm text-rose-800">रु. {fmt(finalAssetVal.toLocaleString())}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB C: MIGRATION & DEATHS ──────────────────────────────────────────── */}
        {mainMode === 'migration' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded text-xs text-blue-950">
              <span className="font-bold">{L('बसाइँसराइ र मृत्युको क्रमबद्ध समायोजन (Step-by-step Adjustment):', 'Order of Adjustment:')}</span>
              <p className="mt-1">
                {L(
                  'सुरुको जनसङ्ख्यामा पहिले प्राकृतिक दर (R%) ले वृद्धि हुन्छ, त्यसपछि भित्रिने बसाइँसराइ जोडिन्छ, बाहिरिने बसाइँसराइ घटाइन्छ र अन्त्यमा मृत्यु संख्या घटाइन्छ।',
                  'First apply natural population growth (R%), then add in-migrants, subtract out-migrants, and subtract deaths.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="font-bold text-slate-700 block">सुरुको जनसङ्ख्या:</span>
                <input type="number" value={basePop} onChange={(e) => setBasePop(parseInt(e.target.value) || 0)} className="w-full p-1.5 border rounded font-mono font-bold" />
              </div>
              <div>
                <span className="font-bold text-emerald-700 block">+ भित्र बसाइँसराइ:</span>
                <input type="number" value={inMigrants} onChange={(e) => setInMigrants(parseInt(e.target.value) || 0)} className="w-full p-1.5 border rounded font-mono font-bold text-emerald-700" />
              </div>
              <div>
                <span className="font-bold text-amber-700 block">- बाहिर बसाइँसराइ:</span>
                <input type="number" value={outMigrants} onChange={(e) => setOutMigrants(parseInt(e.target.value) || 0)} className="w-full p-1.5 border rounded font-mono font-bold text-amber-700" />
              </div>
              <div>
                <span className="font-bold text-rose-700 block">- मृत्यु संख्या:</span>
                <input type="number" value={deaths} onChange={(e) => setDeaths(parseInt(e.target.value) || 0)} className="w-full p-1.5 border rounded font-mono font-bold text-rose-700" />
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-1.5">
              <div className="text-amber-400 font-bold">१ वर्षपछिको जनसङ्ख्या गणना:</div>
              <div>१. प्राकृतिक वृद्धि (+ {fmt(migGrowthRate)}%): {fmt(basePop)} + {fmt(naturalInc)} = {fmt(popAfterNat)}</div>
              <div>२. भित्र आएका मानिसहरू जोड्दा: {fmt(popAfterNat)} + {fmt(inMigrants)} = {fmt(popAfterIn)}</div>
              <div>३. बाहिर गएका मानिसहरू घटाउँदा: {fmt(popAfterIn)} - {fmt(outMigrants)} = {fmt(popAfterOut)}</div>
              <div>४. मृत्यु भएका मानिसहरू घटाउँदा: {fmt(popAfterOut)} - {fmt(deaths)} = <span className="text-emerald-400 font-bold text-sm">{fmt(finalAdjustedPop)} जना</span></div>
            </div>
          </div>
        )}

        {/* ── TAB D: COMPARE GROWTH VS DEPRECIATION ──────────────────────────────── */}
        {mainMode === 'compare' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-[#142D4E] text-base">
              {L('वृद्धि (+) र ह्रास (-) सूत्रहरूको प्रत्यक्ष तुलना:', 'Comparison of Growth (+) vs Depreciation (-):')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
                <span className="text-sm font-bold text-emerald-950 block">जनसङ्ख्या / मूल्य वृद्धि (Growth):</span>
                <div className="font-mono text-xs font-bold text-emerald-800">Pₜ = P(1 + R/100)ᵀ</div>
                <p className="text-xs text-slate-600">
                  {L('कोष्ठकभित्र धनात्मक (+) चिन्ह हुन्छ किनभने प्रत्येक वर्ष मान बढ्दै जान्छ।', 'Uses positive (+) sign because quantity accumulates over time.')}
                </p>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                <span className="text-sm font-bold text-rose-950 block">सामानको अवमूल्यन (Depreciation):</span>
                <div className="font-mono text-xs font-bold text-rose-800">Vₜ = V₀(1 - R/100)ᵀ</div>
                <p className="text-xs text-slate-600">
                  {L('कोष्ठकभित्र ऋणात्मक (-) चिन्ह हुन्छ किनभने प्रत्येक वर्ष मान घट्दै जान्छ।', 'Uses negative (-) sign because asset value declines over time.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB E: PROFIT & LOSS AFTER DEPRECIATION ─────────────────────────────── */}
        {mainMode === 'profitLoss' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-[#142D4E] text-base">
              {L('व्यावसायिक मेसिनको ह्रासपछि नाफा-नोक्सान विश्लेषण:', 'Profit and Loss Analysis of Depreciated Machinery:')}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block">खरिद मूल्य (Cost):</span>
                <input type="number" value={purchaseCost} onChange={(e) => setPurchaseCost(parseInt(e.target.value) || 0)} className="w-full p-1.5 border rounded font-mono font-bold" />
              </div>
              <div>
                <span className="font-bold text-slate-700 block">ह्रासदर (R%):</span>
                <input type="number" value={plDepRate} onChange={(e) => setPlDepRate(parseInt(e.target.value) || 0)} className="w-full p-1.5 border rounded font-mono font-bold" />
              </div>
              <div>
                <span className="font-bold text-slate-700 block">सञ्चालन आम्दानी:</span>
                <input type="number" value={businessIncome} onChange={(e) => setBusinessIncome(parseInt(e.target.value) || 0)} className="w-full p-1.5 border rounded font-mono font-bold text-emerald-700" />
              </div>
              <div>
                <span className="font-bold text-slate-700 block">बिक्री मूल्य (Sold):</span>
                <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(parseInt(e.target.value) || 0)} className="w-full p-1.5 border rounded font-mono font-bold text-blue-700" />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border rounded-xl font-mono text-xs space-y-1">
              <div>२ वर्षपछिको ह्रास मूल्य (V₂): रु. {fmt(depreciatedVal.toLocaleString())}</div>
              <div>कुल प्राप्त आम्दानी (बिक्री + सञ्चालन): रु. {fmt(totalBenefits.toLocaleString())}</div>
              <div className={`text-base font-bold pt-1 ${netProfitOrLoss >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {netProfitOrLoss >= 0 ? `➔ कुल नाफा (Net Profit) = रु. ${fmt(netProfitOrLoss.toLocaleString())}` : `➔ कुल नोक्सान (Net Loss) = रु. ${fmt(Math.abs(netProfitOrLoss).toLocaleString())}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default GrowthDepreciationExplorer;
