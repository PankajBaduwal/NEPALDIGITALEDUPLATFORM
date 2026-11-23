import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const QuartilePercentileExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U5-01',
    chapter: 5,
    titleNp: 'चतुर्थांश तथा शशांश अन्वेषक',
    titleEn: 'Quartile and Percentile Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'individual' | 'discrete' | 'percentile' | 'challenge'>('individual');

  // Activity A: Individual Data
  const [dataInput, setDataInput] = useState<string>('3, 5, 7, 8, 10, 12, 14, 16, 18');
  
  // Parse and sort data
  const rawNumbers = dataInput
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));
  const sortedData = [...rawNumbers].sort((a, b) => a - b);
  const N = sortedData.length;

  // CDC textbook calculation helper: position = (k*(N+1)/4)
  const getIndividualVal = (pos: number) => {
    if (N === 0) return 0;
    if (pos <= 1) return sortedData[0];
    if (pos >= N) return sortedData[N - 1];
    const base = Math.floor(pos) - 1;
    const frac = pos - Math.floor(pos);
    if (frac === 0) return sortedData[base];
    return sortedData[base] + frac * (sortedData[base + 1] - sortedData[base]);
  };

  const posQ1 = (N + 1) / 4;
  const valQ1 = getIndividualVal(posQ1);

  const posQ2 = (N + 1) / 2;
  const valQ2 = getIndividualVal(posQ2);

  const posQ3 = (3 * (N + 1)) / 4;
  const valQ3 = getIndividualVal(posQ3);

  // Activity B: Discrete Data
  const [discreteRows, setDiscreteRows] = useState<{ x: number; f: number }[]>([
    { x: 10, f: 2 },
    { x: 20, f: 5 },
    { x: 30, f: 8 },
    { x: 40, f: 6 },
    { x: 50, f: 4 },
  ]);

  // Compute cf
  let runningCf = 0;
  const discreteTable = discreteRows.map((r) => {
    runningCf += r.f;
    return { ...r, cf: runningCf };
  });
  const totalFreq = runningCf;

  const findDiscreteVal = (targetPos: number) => {
    const row = discreteTable.find((r) => r.cf >= targetPos);
    return row ? row.x : discreteTable[discreteTable.length - 1]?.x || 0;
  };

  const discPosQ1 = (totalFreq + 1) / 4;
  const discValQ1 = findDiscreteVal(discPosQ1);

  const discPosQ2 = (totalFreq + 1) / 2;
  const discValQ2 = findDiscreteVal(discPosQ2);

  const discPosQ3 = (3 * (totalFreq + 1)) / 4;
  const discValQ3 = findDiscreteVal(discPosQ3);

  // Activity C: Percentiles
  const [selectedK, setSelectedK] = useState<number>(25);
  const posPk = (selectedK * (N + 1)) / 100;
  const valPk = getIndividualVal(posPk);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! ऐच्छिक गणित तथ्याङ्कशास्त्र (Statistics) को चतुर्थांशहरू (Q₁, Q₂, Q₃) र शशांशहरू (Percentiles Pₖ) यस अन्तरक्रियात्मक प्रयोगशालामा अन्वेषण गर्नुहोस्!',
        'Welcome! Explore Quartiles (Q1, Q2, Q3) and Percentiles (P_k) for individual and discrete datasets!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'individual', labelNp: 'क) व्यक्तिगत श्रेणी चतुर्थांश (Individual Data)', labelEn: 'A) Individual Data' },
            { id: 'discrete', labelNp: 'ख) खण्डित श्रेणी चतुर्थांश (Discrete Data)', labelEn: 'B) Discrete Data' },
            { id: 'percentile', labelNp: 'ग) शशांश अन्वेषक (Percentiles Pₖ)', labelEn: 'C) Percentile Explorer' },
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

        {/* TAB A: INDIVIDUAL DATA */}
        {activeTab === 'individual' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded text-sm text-blue-900">
              <span className="font-bold">{L('पाठ्यपुस्तक सूत्र (CDC Formula):', 'Textbook Formulas:')}</span>
              <div className="font-mono text-xs mt-1 space-y-1">
                <div>Q₁ = ((N + 1) / 4)औं पदको मान (First Quartile / 25th percentile)</div>
                <div>Q₂ = ((N + 1) / 2)औं पदको मान (Median / 50th percentile)</div>
                <div>Q₃ = (3(N + 1) / 4)औं पदको मान (Third Quartile / 75th percentile)</div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {L('तथ्याङ्क प्रविष्ट गर्नुहोस् (अल्पविरामले छुट्याइएको):', 'Enter dataset (comma-separated):')}
              </label>
              <input
                type="text"
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                className="w-full p-2.5 border rounded-xl font-mono text-sm font-bold text-slate-800"
              />
            </div>

            {/* Sorted Array & Visual Bar */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">
                {L(`क्रमानुसार मिलाइएको तथ्याङ्क (N = ${toNp(N)}):`, `Sorted Data (N = ${N}):`)}
              </span>
              <div className="flex flex-wrap gap-2">
                {sortedData.map((val, idx) => {
                  const itemPos = idx + 1;
                  const isQ1 = itemPos === Math.round(posQ1);
                  const isQ2 = itemPos === Math.round(posQ2);
                  const isQ3 = itemPos === Math.round(posQ3);
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-mono font-bold flex flex-col items-center shadow-xs ${
                        isQ2
                          ? 'bg-amber-100 border-amber-400 text-amber-900'
                          : isQ1 || isQ3
                          ? 'bg-indigo-100 border-indigo-400 text-indigo-900'
                          : 'bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span>{fmt(val)}</span>
                      <span className="text-[10px] text-slate-400">#{fmt(itemPos)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-indigo-800">पहिलो चतुर्थांश (First Quartile Q₁):</span>
                <div className="text-xs text-slate-600 font-mono">स्थान = ({fmt(N)} + 1) / 4 = {fmt(posQ1)}औं पद</div>
                <div className="text-lg font-bold text-indigo-950 font-mono">Q₁ = {fmt(valQ1.toFixed(2))}</div>
                <div className="text-[11px] text-indigo-700">तथ्याङ्कको पहिलो २५% भाग छुट्याउँछ।</div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-800">दोस्रो चतुर्थांश / मध्यिका (Median Q₂):</span>
                <div className="text-xs text-slate-600 font-mono">स्थान = ({fmt(N)} + 1) / 2 = {fmt(posQ2)}औं पद</div>
                <div className="text-lg font-bold text-amber-950 font-mono">Q₂ = {fmt(valQ2.toFixed(2))}</div>
                <div className="text-[11px] text-amber-700">तथ्याङ्कलाई ठ्याक्कै दुई बराबर भाग (५०%) मा विभाजन गर्दछ।</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-emerald-800">तेस्रो चतुर्थांश (Third Quartile Q₃):</span>
                <div className="text-xs text-slate-600 font-mono">स्थान = 3({fmt(N)} + 1) / 4 = {fmt(posQ3)}औं पद</div>
                <div className="text-lg font-bold text-emerald-950 font-mono">Q₃ = {fmt(valQ3.toFixed(2))}</div>
                <div className="text-[11px] text-emerald-700">तथ्याङ्कको ७५% भाग भन्दा तल्लो मान छुट्याउँछ।</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: DISCRETE DATA */}
        {activeTab === 'discrete' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3 rounded text-sm text-emerald-900">
              <span className="font-bold">{L('खण्डित श्रेणी (Discrete Series):', 'Discrete Series Method:')}</span>
              <p className="mt-1">
                {L(
                  'सञ्चित बारम्बारता (cf) तालिका बनाई N = ∑f पत्ता लगाइन्छ। (N+1)/4 वा 3(N+1)/4 भन्दा ठूलो वा बराबर हुने पहिलो cf को सिधा अगाडिको चरमान x नै सम्बन्धित चतुर्थांश हुन्छ।',
                  'Calculate cumulative frequency (cf) where N = ∑f. The value of x corresponding to the cf just greater than or equal to the position is the quartile.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-7 overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b">
                      <th className="p-2.5 font-bold text-slate-700">{L('प्राप्ताङ्क (x)', 'Value (x)')}</th>
                      <th className="p-2.5 font-bold text-slate-700">{L('बारम्बारता (f)', 'Frequency (f)')}</th>
                      <th className="p-2.5 font-bold text-slate-700">{L('सञ्चित बारम्बारता (c.f.)', 'Cum. Freq (c.f.)')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discreteTable.map((row, i) => {
                      const isQ1Row = row.x === discValQ1;
                      const isQ2Row = row.x === discValQ2;
                      const isQ3Row = row.x === discValQ3;
                      return (
                        <tr key={i} className={`border-b ${isQ2Row ? 'bg-amber-50 font-bold' : isQ1Row || isQ3Row ? 'bg-indigo-50 font-bold' : ''}`}>
                          <td className="p-2.5 font-mono">{fmt(row.x)}</td>
                          <td className="p-2.5 font-mono">
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={row.f}
                              onChange={(e) => {
                                const newRows = [...discreteRows];
                                newRows[i].f = parseInt(e.target.value) || 1;
                                setDiscreteRows(newRows);
                              }}
                              className="w-16 p-1 border rounded text-center"
                            />
                          </td>
                          <td className="p-2.5 font-mono text-indigo-700 font-bold">{fmt(row.cf)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2.5">जम्मा (Total N = ∑f)</td>
                      <td className="p-2.5 font-mono">{fmt(totalFreq)}</td>
                      <td className="p-2.5"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="md:col-span-5 space-y-3">
                <div className="p-3 bg-slate-50 border rounded-xl space-y-1 font-mono text-xs">
                  <div className="font-bold text-slate-800 text-sm">चतुर्थांश मानहरू (Quartiles):</div>
                  <div className="text-indigo-900">
                    Q₁ पद = ({fmt(totalFreq)} + 1) / 4 = {fmt(discPosQ1.toFixed(2))}
                    <div className="font-bold text-sm text-indigo-700">➔ Q₁ = {fmt(discValQ1)}</div>
                  </div>
                  <div className="text-amber-900 pt-1">
                    Q₂ पद = ({fmt(totalFreq)} + 1) / 2 = {fmt(discPosQ2.toFixed(2))}
                    <div className="font-bold text-sm text-amber-700">➔ Q₂ = {fmt(discValQ2)}</div>
                  </div>
                  <div className="text-emerald-900 pt-1">
                    Q₃ पद = 3({fmt(totalFreq)} + 1) / 4 = {fmt(discPosQ3.toFixed(2))}
                    <div className="font-bold text-sm text-emerald-700">➔ Q₃ = {fmt(discValQ3)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: PERCENTILES */}
        {activeTab === 'percentile' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-3 rounded text-sm text-indigo-900">
              <span className="font-bold">{L('शशांश (Percentile Pₖ):', 'Percentile Concept:')}</span>
              <p className="mt-1">
                {L(
                  'तथ्याङ्कलाई १०० बराबर भागमा विभाजन गर्ने ९९ वटा मानहरूलाई शशांश (Percentile) भनिन्छ। P₂₅ = Q₁ (पहिलो चतुर्थांश), P₅₀ = Q₂ (मध्यिका), र P₇₅ = Q₃ (तेस्रो चतुर्थांश) सँग बराबर हुन्छ!',
                  'Percentiles divide a sorted dataset into 100 equal parts. P25 = Q1, P50 = Q2 (Median), and P75 = Q3.'
                )}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 text-sm font-bold text-indigo-900">
                <span>{L('शशांश छान्नुहोस् (Percentile k):', 'Select Percentile (k):')} P{fmt(selectedK)}</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  {selectedK === 25 && 'P₂₅ = Q₁'}
                  {selectedK === 50 && 'P₅₀ = Q₂ (Median)'}
                  {selectedK === 75 && 'P₇₅ = Q₃'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="99"
                value={selectedK}
                onChange={(e) => setSelectedK(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono mt-1">
                <span>P₁</span>
                <span>P₂₅ (Q₁)</span>
                <span>P₅₀ (Median)</span>
                <span>P₇₅ (Q₃)</span>
                <span>P₉₉</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border rounded-xl font-mono space-y-2 text-sm">
              <div className="text-slate-600">
                P_{selectedK} = ({selectedK} × (N + 1) / 100)औं पदको मान
              </div>
              <div className="text-indigo-900 font-bold">
                स्थान = ({selectedK} × ({fmt(N)} + 1)) / 100 = {fmt(posPk.toFixed(2))}औं पद
              </div>
              <div className="text-xl font-bold text-indigo-950">
                P_{selectedK} = {fmt(valPk.toFixed(2))}
              </div>
              <div className="text-xs text-slate-500">
                {L(`यस मानभन्दा तल करिब ${toNp(selectedK)}% तथ्याङ्कहरू पर्दछन्।`, `Approximately ${selectedK}% of the dataset lies below this value.`)}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default QuartilePercentileExplorer;
