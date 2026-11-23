import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface DiscreteItem {
  id: string;
  x: number;
  f: number;
}

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const ArithmeticMeanExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U18-01',
    chapter: 18,
    titleNp: 'अङ्कगणितीय मध्यक अन्वेषक',
    titleEn: 'Arithmetic Mean Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [mode, setMode] = useState<'individual' | 'discrete' | 'outlier'>('individual');

  // Mode 1: Individual Series Data
  const [individualValues, setIndividualValues] = useState<number[]>([15, 20, 25, 30, 35]);
  const [newValInput, setNewValInput] = useState<string>('');

  // Mode 2: Discrete Series Data (X and f)
  const [discreteItems, setDiscreteItems] = useState<DiscreteItem[]>([
    { id: '1', x: 10, f: 3 },
    { id: '2', x: 20, f: 5 },
    { id: '3', x: 30, f: 8 },
    { id: '4', x: 40, f: 4 }
  ]);

  // Mode 3: Outlier Experiment
  const [baseValues, setBaseValues] = useState<number[]>([20, 22, 24, 25, 26, 28]);
  const [outlierVal, setOutlierVal] = useState<number>(90);
  const [includeOutlier, setIncludeOutlier] = useState<boolean>(false);

  // Calculations: Individual
  const sumIndividual = useMemo(() => individualValues.reduce((a, b) => a + b, 0), [individualValues]);
  const countIndividual = individualValues.length;
  const meanIndividual = countIndividual > 0 ? (sumIndividual / countIndividual).toFixed(2) : '0';

  // Calculations: Discrete
  const discreteCalc = useMemo(() => {
    let sumF = 0;
    let sumFX = 0;
    const table = discreteItems.map(item => {
      const fx = item.x * item.f;
      sumF += item.f;
      sumFX += fx;
      return { ...item, fx };
    });
    const mean = sumF > 0 ? (sumFX / sumF).toFixed(2) : '0';
    return { table, sumF, sumFX, mean };
  }, [discreteItems]);

  // Calculations: Outlier
  const outlierCalc = useMemo(() => {
    const listWithout = [...baseValues];
    const sumWithout = listWithout.reduce((a, b) => a + b, 0);
    const meanWithout = (sumWithout / listWithout.length).toFixed(2);

    const listWith = [...baseValues, outlierVal];
    const sumWith = listWith.reduce((a, b) => a + b, 0);
    const meanWith = (sumWith / listWith.length).toFixed(2);

    return {
      without: { list: listWithout, sum: sumWithout, n: listWithout.length, mean: meanWithout },
      with: { list: listWith, sum: sumWith, n: listWith.length, mean: meanWith }
    };
  }, [baseValues, outlierVal]);

  const handleAddIndividual = () => {
    const parsed = parseFloat(newValInput);
    if (!isNaN(parsed)) {
      setIndividualValues([...individualValues, parsed]);
      setNewValInput('');
    }
  };

  const handleRemoveIndividual = (index: number) => {
    if (individualValues.length > 2) {
      setIndividualValues(individualValues.filter((_, i) => i !== index));
    }
  };

  const handleUpdateDiscreteFreq = (index: number, newF: number) => {
    if (newF < 1 || newF > 20) return;
    const updated = [...discreteItems];
    updated[index].f = newF;
    setDiscreteItems(updated);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! व्यक्तिगत श्रेणी (∑X/N), खण्डित श्रेणी (∑fX/∑f) को मध्यक र सन्तुलन बिन्दुमा चरम मान (Outlier) को प्रभाव अन्वेषण गर्नुहोस्!',
        'Welcome! Explore the arithmetic mean for individual and discrete datasets and see how extreme outliers pull the balance point!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls and Mode Tabs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex flex-col gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setMode('individual')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg text-left transition-all ${
                mode === 'individual'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. {L('व्यक्तिगत श्रेणी (Individual Series)', 'Individual Series')}
            </button>
            <button
              onClick={() => setMode('discrete')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg text-left transition-all ${
                mode === 'discrete'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. {L('खण्डित श्रेणी (Discrete Series)', 'Discrete Series')}
            </button>
            <button
              onClick={() => setMode('outlier')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg text-left transition-all ${
                mode === 'outlier'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. {L('चरम मानको प्रभाव (Outlier Impact)', 'Outlier Sensitivity')}
            </button>
          </div>

          {/* Mode 1 Controls */}
          {mode === 'individual' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800">
                {L('नयाँ मान थप्नुहोस् (Add Value)', 'Add New Value')}
              </h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newValInput}
                  onChange={e => setNewValInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddIndividual()}
                  placeholder={L('मान लेख्नुहोस्...', 'Enter value...')}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <button
                  onClick={handleAddIndividual}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shrink-0"
                >
                  {L('थप्नुहोस्', 'Add')}
                </button>
              </div>

              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">
                  {L('हालका मानहरू (हटाउन × थिच्नुहोस्):', 'Current Values (click × to remove):')}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {individualValues.map((v, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800"
                    >
                      {fmt(v)}
                      {individualValues.length > 2 && (
                        <button
                          onClick={() => handleRemoveIndividual(i)}
                          className="text-rose-500 hover:text-rose-700 font-bold ml-1 text-sm leading-none"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mode 2 Controls */}
          {mode === 'discrete' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800">
                {L('बारम्बारता (f) परिवर्तन गर्नुहोस्:', 'Adjust Frequencies (f):')}
              </h4>
              <div className="space-y-2">
                {discreteItems.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold font-mono text-slate-700">
                      X = {fmt(item.x)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateDiscreteFreq(idx, item.f - 1)}
                        className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold font-mono text-indigo-700 w-6 text-center">
                        {fmt(item.f)}
                      </span>
                      <button
                        onClick={() => handleUpdateDiscreteFreq(idx, item.f + 1)}
                        className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode 3 Controls */}
          {mode === 'outlier' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800">
                {L('चरम मान (Outlier) नियन्त्रण', 'Outlier Settings')}
              </h4>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">
                  {L(`चरम मान (Outlier Value) = ${fmt(outlierVal)}:`, `Outlier Value = ${outlierVal}:`)}
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={outlierVal}
                  onChange={e => setOutlierVal(parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  checked={includeOutlier}
                  onChange={e => setIncludeOutlier(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>{L('चरम मान समावेश गर्नुहोस्', 'Include Outlier in Dataset')}</span>
              </label>
            </div>
          )}

          {/* Formula Reference Card */}
          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
            <h5 className="font-bold flex items-center gap-1.5">
              <span>📐 {L('पाठ्यपुस्तक सूत्रहरू', 'Textbook Formulas')}</span>
            </h5>
            <div className="font-mono text-[11px] bg-white p-2 rounded border border-indigo-100 space-y-1">
              <div>
                <strong>{L('व्यक्तिगत:', 'Individual:')}</strong> \bar&#123;X&#125; = \frac&#123;∑X&#125;&#123;N&#125;
              </div>
              <div>
                <strong>{L('खण्डित:', 'Discrete:')}</strong> \bar&#123;X&#125; = \frac&#123;∑fX&#125;&#123;∑f&#125;
              </div>
            </div>
          </div>
        </div>

        {/* Display and Step-by-Step Calculation Column */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {/* Visual Scale / Balance Beam Metaphor */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex justify-between">
              <span>{L('मध्यकको सन्तुलन बिन्दु (Fulcrum / Balance Point)', 'Balance Point of Mean')}</span>
              <span className="text-indigo-700 font-mono font-bold text-sm">
                \bar&#123;X&#125; = {fmt(mode === 'individual' ? meanIndividual : mode === 'discrete' ? discreteCalc.mean : includeOutlier ? outlierCalc.with.mean : outlierCalc.without.mean)}
              </span>
            </h4>

            {/* Visual Balance SVG */}
            <svg viewBox="0 0 500 130" className="w-full bg-white rounded-lg border border-slate-100 p-2">
              {/* Beam line */}
              <line x1="40" y1="80" x2="460" y2="80" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

              {/* Fulcrum Triangle placed at normalized mean position */}
              {(() => {
                const currentMeanNum = parseFloat(
                  mode === 'individual'
                    ? meanIndividual
                    : mode === 'discrete'
                    ? discreteCalc.mean
                    : includeOutlier
                    ? outlierCalc.with.mean
                    : outlierCalc.without.mean
                );

                const minScale = 5;
                const maxScale = mode === 'outlier' && includeOutlier ? 120 : 60;
                const clamped = Math.max(minScale, Math.min(maxScale, currentMeanNum));
                const fulcrumX = 40 + ((clamped - minScale) / (maxScale - minScale)) * 420;

                return (
                  <g>
                    <polygon
                      points={`${fulcrumX},80 ${fulcrumX - 14},110 ${fulcrumX + 14},110`}
                      fill="#4f46e5"
                    />
                    <text
                      x={fulcrumX}
                      y={124}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-indigo-700 font-mono"
                    >
                      \bar&#123;X&#125; = {fmt(currentMeanNum.toFixed(1))}
                    </text>
                  </g>
                );
              })()}

              {/* Data points resting on beam */}
              {mode === 'individual' &&
                individualValues.map((v, i) => {
                  const minScale = 5;
                  const maxScale = 60;
                  const clamped = Math.max(minScale, Math.min(maxScale, v));
                  const x = 40 + ((clamped - minScale) / (maxScale - minScale)) * 420;
                  return (
                    <circle key={i} cx={x} cy={72} r={6} fill="#ec4899" stroke="#9d174d" strokeWidth="1.5" />
                  );
                })}

              {mode === 'discrete' &&
                discreteItems.map((item, i) => {
                  const minScale = 5;
                  const maxScale = 60;
                  const x = 40 + ((item.x - minScale) / (maxScale - minScale)) * 420;
                  return (
                    <g key={i}>
                      {Array.from({ length: item.f }).map((_, stackIdx) => (
                        <circle
                          key={stackIdx}
                          cx={x}
                          cy={72 - stackIdx * 8}
                          r={5}
                          fill="#3b82f6"
                          stroke="#1e40af"
                          strokeWidth="1"
                        />
                      ))}
                    </g>
                  );
                })}

              {mode === 'outlier' && (
                <g>
                  {baseValues.map((v, i) => {
                    const minScale = 5;
                    const maxScale = includeOutlier ? 120 : 60;
                    const x = 40 + ((v - minScale) / (maxScale - minScale)) * 420;
                    return <circle key={i} cx={x} cy={72} r={6} fill="#059669" />;
                  })}
                  {includeOutlier && (
                    <circle
                      cx={40 + ((outlierVal - 5) / (120 - 5)) * 420}
                      cy={72}
                      r={9}
                      fill="#d97706"
                      stroke="#78350f"
                      strokeWidth="2"
                    />
                  )}
                </g>
              )}
            </svg>
          </div>

          {/* Mathematical Step-by-Step Breakdown */}
          {mode === 'individual' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800">{L('गणनाको चरणबद्ध समाधान:', 'Step-by-Step Calculation:')}</h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-600">{L('१. मानहरूको योगफल (Sum of all values, ∑X):', '1. Sum of all values (∑X):')}</span>
                  <span className="font-mono font-bold text-slate-800">
                    {individualValues.join(' + ')} = <span className="text-indigo-700">{fmt(sumIndividual)}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-600">{L('२. कुल पद सङ्ख्या (Number of terms, N):', '2. Total number of terms (N):')}</span>
                  <span className="font-mono font-bold text-slate-800">{fmt(countIndividual)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-sm font-bold">
                  <span className="text-indigo-950">
                    {L('३. अङ्कगणितीय मध्यक (\\bar{X} = ∑X / N):', '3. Arithmetic Mean (\\bar{X} = ∑X / N):')}
                  </span>
                  <span className="font-mono text-indigo-700 text-base">
                    {fmt(sumIndividual)} / {fmt(countIndividual)} = {fmt(meanIndividual)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {mode === 'discrete' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800">{L('खण्डित श्रेणी बारम्बारता तालिका र गणना:', 'Discrete Frequency Table & Calculation:')}</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">{L('मान (X)', 'Value (X)')}</th>
                      <th className="py-2 px-3 text-center">{L('बारम्बारता (f)', 'Frequency (f)')}</th>
                      <th className="py-2 px-3 text-center">{L('गुणनफल (f × X)', 'Product (f × X)')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {discreteCalc.table.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-semibold text-slate-800">{fmt(item.x)}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">{fmt(item.f)}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-indigo-700">{fmt(item.fx)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <tr>
                      <td className="py-2 px-3 text-slate-800">{L('जम्मा योग (Total)', 'Total')}</td>
                      <td className="py-2 px-3 text-center font-mono text-indigo-800 text-sm">
                        N = ∑f = {fmt(discreteCalc.sumF)}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-indigo-800 text-sm">
                        ∑fX = {fmt(discreteCalc.sumFX)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center text-xs">
                <span className="font-bold text-indigo-900">
                  {L('अङ्कगणितीय मध्यक (\\bar{X} = ∑fX / ∑f):', 'Arithmetic Mean (\\bar{X} = ∑fX / ∑f):')}
                </span>
                <span className="font-mono text-base font-bold text-indigo-700">
                  {fmt(discreteCalc.sumFX)} / {fmt(discreteCalc.sumF)} = {fmt(discreteCalc.mean)}
                </span>
              </div>
            </div>
          )}

          {mode === 'outlier' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800">{L('चरम मानको तुलनात्मक विश्लेषण:', 'Comparative Outlier Analysis:')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="font-bold text-emerald-900">{L('चरम मान बिना (Without Outlier):', 'Without Outlier:')}</div>
                  <div className="text-slate-600 font-mono text-[11px]">{outlierCalc.without.list.join(', ')}</div>
                  <div className="text-slate-700">∑X = {fmt(outlierCalc.without.sum)}, N = {fmt(outlierCalc.without.n)}</div>
                  <div className="text-base font-bold text-emerald-700 font-mono">
                    \bar&#123;X&#125; = {fmt(outlierCalc.without.mean)}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border space-y-1.5 ${includeOutlier ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                  <div className="font-bold text-amber-900">{L('चरम मान सहित (With Outlier):', 'With Outlier:')}</div>
                  <div className="text-slate-600 font-mono text-[11px]">
                    {outlierCalc.with.list.slice(0, -1).join(', ')}, <span className="font-bold text-amber-700">{outlierVal}</span>
                  </div>
                  <div className="text-slate-700">∑X = {fmt(outlierCalc.with.sum)}, N = {fmt(outlierCalc.with.n)}</div>
                  <div className="text-base font-bold text-amber-700 font-mono">
                    \bar&#123;X&#125; = {fmt(outlierCalc.with.mean)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <strong>{L('निष्कर्ष:', 'Key Takeaway:')}</strong>{' '}
                {L(
                  'मध्यक (Mean) प्रत्येक मानको योगफलमा आधारित हुने भएकोले एउटै असामान्य ठूलो वा सानो मान (Outlier) ले मध्यकलाई अत्यधिक परिवर्तन गर्छ।',
                  'Because the mean uses every numerical value, a single extreme outlier drags the balance point dramatically towards itself.'
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};

export default ArithmeticMeanExplorer;
