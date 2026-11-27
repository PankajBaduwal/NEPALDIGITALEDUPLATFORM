import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const StatisticalDispersionLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U5-02',
    chapter: 5,
    titleNp: 'तथ्याङ्कीय विचलनशीलता प्रयोगशाला',
    titleEn: 'Statistical Dispersion Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'dispersion' | 'quartiledev' | 'meandev' | 'compare'>('dispersion');

  // Activity A: Comparing two datasets with identical mean
  // Group A: 18, 19, 20, 21, 22 (Mean = 20, tight)
  // Group B: 10, 15, 20, 25, 30 (Mean = 20, dispersed)
  const groupA = [18, 19, 20, 21, 22];
  const groupB = [10, 15, 20, 25, 30];

  // Activity B: Quartile Deviation
  const [qdDataInput, setQdDataInput] = useState<string>('6, 8, 10, 12, 14, 16, 18, 20, 22');
  const qdRaw = qdDataInput
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));
  const qdSorted = [...qdRaw].sort((a, b) => a - b);
  const qdN = qdSorted.length;

  const getQ = (k: number) => {
    if (qdN === 0) return 0;
    const pos = (k * (qdN + 1)) / 4;
    const base = Math.floor(pos) - 1;
    const frac = pos - Math.floor(pos);
    if (base < 0) return qdSorted[0];
    if (base >= qdN - 1) return qdSorted[qdN - 1];
    return qdSorted[base] + frac * (qdSorted[base + 1] - qdSorted[base]);
  };

  const q1 = getQ(1);
  const q3 = getQ(3);
  const iqr = q3 - q1;
  const qd = iqr / 2;
  const coeffQd = q3 + q1 !== 0 ? (q3 - q1) / (q3 + q1) : 0;

  // Activity C: Mean Deviation
  const [mdCenter, setMdCenter] = useState<'mean' | 'median'>('mean');
  const [mdDataInput, setMdDataInput] = useState<string>('5, 8, 11, 14, 17');
  const mdRaw = mdDataInput
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));
  const mdSorted = [...mdRaw].sort((a, b) => a - b);
  const mdN = mdSorted.length;

  const sumX = mdSorted.reduce((acc, v) => acc + v, 0);
  const meanX = mdN > 0 ? sumX / mdN : 0;
  const medianX = mdN > 0 ? (mdN % 2 === 1 ? mdSorted[Math.floor(mdN / 2)] : (mdSorted[mdN / 2 - 1] + mdSorted[mdN / 2]) / 2) : 0;

  const activeCenter = mdCenter === 'mean' ? meanX : medianX;
  const absDeviations = mdSorted.map((x) => Math.abs(x - activeCenter));
  const sumAbsDev = absDeviations.reduce((acc, v) => acc + v, 0);
  const meanDev = mdN > 0 ? sumAbsDev / mdN : 0;
  const coeffMd = activeCenter !== 0 ? meanDev / activeCenter : 0;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! तथ्याङ्कशास्त्रमा फैलावट (Dispersion), चतुर्थांश विचलन (Quartile Deviation) र मध्यक विचलन (Mean Deviation) यस प्रयोगशालामा गणना र तुलना गर्नुहोस्!',
        'Welcome! Explore Measures of Dispersion, Quartile Deviation (QD), and Mean Deviation (MD) with step-by-step tables!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'dispersion', labelNp: 'क) फैलावटको अवधारणा (Concept)', labelEn: 'A) Concept of Dispersion' },
            { id: 'quartiledev', labelNp: 'ख) चतुर्थांश विचलन (Quartile Dev)', labelEn: 'B) Quartile Deviation' },
            { id: 'meandev', labelNp: 'ग) मध्यक विचलन (Mean Deviation)', labelEn: 'C) Mean Deviation' },
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

        {/* TAB A: CONCEPT OF DISPERSION */}
        {activeTab === 'dispersion' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-amber-50 border-l-4 border-amber-600 p-3 rounded text-sm text-amber-900">
              <span className="font-bold">{L('फैलावट (Dispersion) किन आवश्यक छ?', 'Why is Dispersion Needed?')}</span>
              <p className="mt-1">
                {L(
                  'औसत (Mean) एउटै हुँदैमा दुईवटा श्रेणी उस्तै हुँदैनन्। तथ्याङ्कहरू औसत मानको वरिपरि कति नजिक वा टाढा फैलिएका छन् भनी नाप्न विचलनशीलता (Dispersion) चाहिन्छ।',
                  'Two datasets can have the exact same mean, yet behave completely differently depending on how spread out the values are around the center.'
                )}
              </p>
            </div>

            {/* Visual Comparison of Group A vs Group B */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900">समूह A (कम फैलिएको / Consistent):</span>
                  <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-mono">Range = 4</span>
                </div>
                <div className="font-mono text-sm">{groupA.join(', ')}</div>
                <div className="text-xs text-slate-600">
                  औसत (Mean) = २० | न्यूनतम = १८, अधिकतम = २२
                </div>
                {/* Number line representation */}
                <div className="pt-2">
                  <svg width="100%" height={40} viewBox="0 0 300 40" className="bg-white rounded-lg border">
                    <line x1={20} y1={25} x2={280} y2={25} stroke="#cbd5e1" strokeWidth={2} />
                    {groupA.map((val) => {
                      const cx = 20 + ((val - 5) / 30) * 260;
                      return <circle key={val} cx={cx} cy={25} r={5} fill="#10b981" />;
                    })}
                  </svg>
                </div>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-rose-900">समूह B (धेरै फैलिएको / Dispersed):</span>
                  <span className="text-xs bg-rose-200 text-rose-800 px-2 py-0.5 rounded font-mono">Range = 20</span>
                </div>
                <div className="font-mono text-sm">{groupB.join(', ')}</div>
                <div className="text-xs text-slate-600">
                  औसत (Mean) = २० | न्यूनतम = १०, अधिकतम = ३०
                </div>
                {/* Number line representation */}
                <div className="pt-2">
                  <svg width="100%" height={40} viewBox="0 0 300 40" className="bg-white rounded-lg border">
                    <line x1={20} y1={25} x2={280} y2={25} stroke="#cbd5e1" strokeWidth={2} />
                    {groupB.map((val) => {
                      const cx = 20 + ((val - 5) / 30) * 260;
                      return <circle key={val} cx={cx} cy={25} r={5} fill="#f43f5e" />;
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: QUARTILE DEVIATION */}
        {activeTab === 'quartiledev' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded text-sm text-blue-900">
              <span className="font-bold">{L('पाठ्यपुस्तक सूत्र (Quartile Deviation Formulas):', 'CDC Formulas:')}</span>
              <div className="font-mono text-xs mt-1 space-y-1">
                <div>अन्तर-चतुर्थांश विस्तार (Interquartile Range IQR) = Q₃ - Q₁</div>
                <div>चतुर्थांश विचलन (Quartile Deviation QD) = (Q₃ - Q₁) / 2</div>
                <div>चतुर्थांश विचलनको गुणाङ्क (Coeff. of QD) = (Q₃ - Q₁) / (Q₃ + Q₁)</div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {L('तथ्याङ्क प्रविष्ट गर्नुहोस्:', 'Enter Dataset:')}
              </label>
              <input
                type="text"
                value={qdDataInput}
                onChange={(e) => setQdDataInput(e.target.value)}
                className="w-full p-2.5 border rounded-xl font-mono text-sm font-bold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-xs text-slate-500">{L('पहिलो र तेस्रो चतुर्थांश', 'Quartiles')}</div>
                <div className="font-mono text-sm font-bold text-indigo-900 mt-1">
                  Q₁ = {fmt(q1.toFixed(2))}
                </div>
                <div className="font-mono text-sm font-bold text-indigo-900">
                  Q₃ = {fmt(q3.toFixed(2))}
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="text-xs text-indigo-800 font-bold">{L('चतुर्थांश विचलन (QD)', 'Quartile Deviation (QD)')}</div>
                <div className="font-mono text-xs text-slate-600 mt-1">
                  QD = ({fmt(q3.toFixed(2))} - {fmt(q1.toFixed(2))}) / 2
                </div>
                <div className="text-lg font-bold text-indigo-950 font-mono">
                  = {fmt(qd.toFixed(2))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-xs text-emerald-800 font-bold">{L('चतुर्थांश विचलनको गुणाङ्क', 'Coeff. of QD')}</div>
                <div className="font-mono text-xs text-slate-600 mt-1">
                  ({fmt(q3.toFixed(2))} - {fmt(q1.toFixed(2))}) / ({fmt(q3.toFixed(2))} + {fmt(q1.toFixed(2))})
                </div>
                <div className="text-lg font-bold text-emerald-950 font-mono">
                  = {fmt(coeffQd.toFixed(3))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: MEAN DEVIATION */}
        {activeTab === 'meandev' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMdCenter('mean')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${mdCenter === 'mean' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'}`}
              >
                {L('मध्यकबाट मध्यक विचलन (MD from Mean)', 'MD from Mean')}
              </button>
              <button
                onClick={() => setMdCenter('median')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${mdCenter === 'median' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'}`}
              >
                {L('मध्यिकाबाट मध्यक विचलन (MD from Median)', 'MD from Median')}
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {L('तथ्याङ्क प्रविष्ट गर्नुहोस्:', 'Enter Dataset:')}
              </label>
              <input
                type="text"
                value={mdDataInput}
                onChange={(e) => setMdDataInput(e.target.value)}
                className="w-full p-2 border rounded-xl font-mono text-sm font-bold text-slate-800"
              />
            </div>

            {/* Step-by-step Calculation Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 border-b">
                    <th className="p-2 font-bold text-slate-700">पद (x)</th>
                    <th className="p-2 font-bold text-slate-700">
                      {mdCenter === 'mean' ? '|x - X̄| (निरपेक्ष विचलन)' : '|x - Md| (निरपेक्ष विचलन)'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mdSorted.map((x, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 font-mono">{fmt(x)}</td>
                      <td className="p-2 font-mono text-indigo-700 font-bold">
                        |{fmt(x)} - {fmt(activeCenter.toFixed(1))}| = {fmt(Math.abs(x - activeCenter).toFixed(1))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-2">
                      N = {fmt(mdN)} | {mdCenter === 'mean' ? `X̄ = ${fmt(meanX.toFixed(2))}` : `Md = ${fmt(medianX.toFixed(2))}`}
                    </td>
                    <td className="p-2 font-mono text-emerald-700">
                      ∑|d| = {fmt(sumAbsDev.toFixed(2))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <div className="text-xs text-indigo-800 font-bold">
                  {mdCenter === 'mean' ? 'मध्यकबाट मध्यक विचलन (MD from Mean):' : 'मध्यिकाबाट मध्यक विचलन (MD from Median):'}
                </div>
                <div className="font-mono text-xs text-slate-600">MD = ∑|x - A| / N = {fmt(sumAbsDev.toFixed(2))} / {fmt(mdN)}</div>
                <div className="text-xl font-bold text-indigo-950 font-mono">
                  MD = {fmt(meanDev.toFixed(2))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="text-xs text-emerald-800 font-bold">
                  {L('मध्यक विचलनको गुणाङ्क (Coefficient of MD):', 'Coefficient of MD:')}
                </div>
                <div className="font-mono text-xs text-slate-600">Coeff. = MD / A = {fmt(meanDev.toFixed(2))} / {fmt(activeCenter.toFixed(2))}</div>
                <div className="text-xl font-bold text-emerald-950 font-mono">
                  = {fmt(coeffMd.toFixed(3))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default StatisticalDispersionLab;
