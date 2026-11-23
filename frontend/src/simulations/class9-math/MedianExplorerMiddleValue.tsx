import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface DiscreteRow {
  id: string;
  x: number;
  f: number;
}

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const MedianExplorerMiddleValue: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U18-02',
    chapter: 18,
    titleNp: 'मध्यिका (मध्यमान पद) अन्वेषक',
    titleEn: 'Median Explorer – Finding the Middle Value',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [tab, setTab] = useState<'individual' | 'discrete'>('individual');

  // Individual Series State
  const [rawNumbers, setRawNumbers] = useState<number[]>([18, 12, 25, 14, 30, 22, 19]);
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const [newVal, setNewVal] = useState<string>('');

  // Discrete Series State
  const [discreteRows, setDiscreteRows] = useState<DiscreteRow[]>([
    { id: '1', x: 10, f: 3 },
    { id: '2', x: 15, f: 5 },
    { id: '3', x: 20, f: 8 },
    { id: '4', x: 25, f: 6 },
    { id: '5', x: 30, f: 4 }
  ]);

  // Individual Calculations
  const sortedNumbers = useMemo(() => [...rawNumbers].sort((a, b) => a - b), [rawNumbers]);
  const activeNumbers = isSorted ? sortedNumbers : rawNumbers;
  const nIndiv = rawNumbers.length;
  const isOdd = nIndiv % 2 !== 0;

  const medianResultIndiv = useMemo(() => {
    const s = [...rawNumbers].sort((a, b) => a - b);
    const n = s.length;
    if (n === 0) return { val: 0, posText: '', midIndices: [] };

    if (n % 2 !== 0) {
      const midIdx = Math.floor(n / 2);
      return {
        val: s[midIdx],
        posText: `((N + 1) / 2) = (${n} + 1) / 2 = ${midIdx + 1}`,
        midIndices: [midIdx]
      };
    } else {
      const idx1 = n / 2 - 1;
      const idx2 = n / 2;
      const val = (s[idx1] + s[idx2]) / 2;
      return {
        val,
        posText: `Average of ${idx1 + 1}th and ${idx2 + 1}th items`,
        midIndices: [idx1, idx2]
      };
    }
  }, [rawNumbers]);

  // Discrete Calculations
  const discreteAnalysis = useMemo(() => {
    let cum = 0;
    const table = discreteRows.map(r => {
      cum += r.f;
      return { ...r, cf: cum };
    });
    const totalN = cum;
    const medianPos = (totalN + 1) / 2;

    // Find first row where cf >= medianPos
    const medianRow = table.find(r => r.cf >= medianPos) || table[table.length - 1];

    return {
      table,
      totalN,
      medianPos,
      medianVal: medianRow ? medianRow.x : 0,
      medianRowId: medianRow ? medianRow.id : ''
    };
  }, [discreteRows]);

  const handleAddNumber = () => {
    const p = parseFloat(newVal);
    if (!isNaN(p)) {
      setRawNumbers([...rawNumbers, p]);
      setNewVal('');
      setIsSorted(false);
    }
  };

  const handleRemoveNumber = (idx: number) => {
    if (rawNumbers.length > 3) {
      const copy = [...rawNumbers];
      copy.splice(idx, 1);
      setRawNumbers(copy);
      setIsSorted(false);
    }
  };

  const handleUpdateFreq = (index: number, newF: number) => {
    if (newF < 1 || newF > 25) return;
    const updated = [...discreteRows];
    updated[index].f = newF;
    setDiscreteRows(updated);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! तथ्याङ्कलाई आरोही क्रममा मिलाई जोडी र विजोडी पद सङ्ख्यामा मध्य पद (मध्यिका) पत्ता लगाउनुहोस्!',
        'Welcome! Sort data into ascending order and find the exact middle value (Median) for odd and even distributions.'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Mode selection & data modification */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setTab('individual')}
              className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg text-center transition-all ${
                tab === 'individual'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. {L('व्यक्तिगत श्रेणी', 'Individual Series')}
            </button>
            <button
              onClick={() => setTab('discrete')}
              className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg text-center transition-all ${
                tab === 'discrete'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. {L('खण्डित श्रेणी (c.f.)', 'Discrete Series')}
            </button>
          </div>

          {/* Individual Settings */}
          {tab === 'individual' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800">
                {L('तथ्याङ्क व्यवस्थापन', 'Dataset Management')}
              </h4>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={newVal}
                  onChange={e => setNewVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNumber()}
                  placeholder={L('नयाँ सङ्ख्या थप्नुहोस्...', 'Add number...')}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <button
                  onClick={handleAddNumber}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shrink-0"
                >
                  {L('थप्नुहोस्', 'Add')}
                </button>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {L(`कुल सङ्ख्या (N) = ${fmt(nIndiv)} (${isOdd ? 'जोडी/Odd' : 'विजोडी/Even'})`, `Count N = ${nIndiv} (${isOdd ? 'Odd' : 'Even'})`)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {rawNumbers.map((v, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800"
                    >
                      {fmt(v)}
                      {rawNumbers.length > 3 && (
                        <button
                          onClick={() => handleRemoveNumber(i)}
                          className="text-rose-500 hover:text-rose-700 font-bold ml-1 text-sm leading-none"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsSorted(!isSorted)}
                className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 border ${
                  isSorted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <span>{isSorted ? '✓' : '⇄'}</span>
                <span>
                  {isSorted
                    ? L('आरोही क्रममा मिलाइएको छ (Sorted)', 'Sorted in Ascending Order')
                    : L('चरण १: आरोही क्रममा मिलाउनुहोस् (Sort)', 'Step 1: Sort Ascending')}
                </span>
              </button>
            </div>
          )}

          {/* Discrete Settings */}
          {tab === 'discrete' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800">
                {L('खण्डित मान र बारम्बारता:', 'Values and Frequencies:')}
              </h4>
              <div className="space-y-2">
                {discreteRows.map((r, idx) => (
                  <div key={r.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold font-mono text-slate-700">X = {fmt(r.x)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateFreq(idx, r.f - 1)}
                        className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold font-mono text-indigo-700 w-6 text-center">
                        {fmt(r.f)}
                      </span>
                      <button
                        onClick={() => handleUpdateFreq(idx, r.f + 1)}
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

          {/* Formula summary */}
          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-2">
            <h5 className="font-bold flex items-center gap-1.5">
              <span>📖 {L('मध्यिका स्थिति निर्धारण नियम', 'Median Position Rules')}</span>
            </h5>
            <ul className="text-[11px] text-slate-700 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>
                <strong>{L('विजोडी सङ्ख्या (Odd N):', 'Odd N:')}</strong>{' '}
                M_d = \left(\frac&#123;N + 1&#125;&#123;2&#125;\right)\text&#123;-औं पद (ठ्याक्कै बिचको मान)&#125;
              </li>
              <li>
                <strong>{L('जोडी सङ्ख्या (Even N):', 'Even N:')}</strong>{' '}
                \frac&#123;\frac&#123;N&#125;&#123;2&#125;\text&#123;-औं पद&#125; + (\frac&#123;N&#125;&#123;2&#125;+1)\text&#123;-औं पद&#125;&#125;&#123;2&#125;
              </li>
              <li>
                <strong>{L('खण्डित श्रेणी:', 'Discrete Series:')}</strong>{' '}
                \frac&#123;N+1&#125;&#123;2&#125;\text&#123;-औं पद बराबर वा सोभन्दा ठूलो पहिलो c.f. को सिधा अगाडिको मान X नै मध्यिका हुन्छ।&#125;
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Visual middle-card representation & step calculation */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          {tab === 'individual' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>{L('तथ्याङ्कको दृश्य अवलोकन (Data Layout):', 'Visual Data Layout:')}</span>
                  <span className="text-xs font-normal text-slate-500">
                    {isSorted
                      ? L('✓ आरोही क्रममा मिलाइएको (Ascending Order)', '✓ Sorted in Ascending Order')
                      : L('⚠️ अझै क्रमबद्ध गरिएको छैन', '⚠️ Not sorted yet')}
                  </span>
                </h4>
              </div>

              {/* Number Card Array */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {activeNumbers.map((v, i) => {
                  const isMiddle = isSorted && medianResultIndiv.midIndices.includes(i);
                  return (
                    <div
                      key={i}
                      className={`flex flex-col items-center justify-center w-14 h-16 rounded-xl border-2 transition-all ${
                        isMiddle
                          ? 'bg-amber-100 border-amber-500 shadow-md scale-105'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-mono">#{fmt(i + 1)}</span>
                      <span
                        className={`text-lg font-bold font-mono ${
                          isMiddle ? 'text-amber-900' : 'text-slate-800'
                        }`}
                      >
                        {fmt(v)}
                      </span>
                      {isMiddle && (
                        <span className="text-[8px] font-bold text-amber-700 uppercase tracking-wider">
                          {L('मध्य', 'Middle')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step-by-step Solution */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h5 className="font-bold text-slate-800 text-sm">
                  {L('चरणबद्ध समाधान प्रक्रिया:', 'Step-by-Step Working:')}
                </h5>

                <div className="space-y-2">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <strong>{L('चरण १: तथ्याङ्कलाई आरोही क्रममा राख्दा (Arranging in Ascending Order):', 'Step 1: Arrange in ascending order:')}</strong>
                    <div className="font-mono text-indigo-700 font-semibold mt-1">
                      {sortedNumbers.join(', ')}
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <strong>{L('चरण २: कुल पद सङ्ख्या (Number of terms, N):', 'Step 2: Total number of terms (N):')}</strong>
                    <div className="text-slate-700 mt-1">
                      N = <span className="font-mono font-bold text-slate-900">{fmt(nIndiv)}</span> (
                      {isOdd ? L('विजोडी सङ्ख्या / Odd', 'Odd number') : L('जोडी सङ्ख्या / Even', 'Even number')})
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <strong>{L('चरण ३: मध्यिकाको स्थान (Median Position):', 'Step 3: Median Position:')}</strong>
                    <div className="text-slate-700 mt-1">
                      {isOdd ? (
                        <div>
                          M_d = \left(\frac&#123;N + 1&#125;&#123;2&#125;\right)\text&#123;-औं पद&#125; = \left(\frac&#123;{fmt(nIndiv)} + 1&#125;&#123;2&#125;\right) = <span className="font-bold font-mono text-indigo-700">{fmt((nIndiv + 1) / 2)}</span>-औं पद।
                        </div>
                      ) : (
                        <div>
                          M_d = \text&#123;औसत of &#125; \frac&#123;N&#125;&#123;2&#125;\text&#123; र &#125; (\frac&#123;N&#125;&#123;2&#125;+1)\text&#123;-औं पदहरू&#125; = {fmt(nIndiv / 2)}-औं र {fmt(nIndiv / 2 + 1)}-औं पदहरूको औसत।
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center text-emerald-950 font-bold text-sm">
                    <span>{L('मध्यिका (Median, M_d):', 'Median (M_d):')}</span>
                    <span className="font-mono text-lg text-emerald-700">
                      M_d = {fmt(medianResultIndiv.val)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'discrete' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800">
                {L('खण्डित श्रेणीको सञ्चित बारम्बारता तालिका:', 'Discrete Cumulative Frequency Table:')}
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">{L('मान (X)', 'Value (X)')}</th>
                      <th className="py-2.5 px-4 text-center">{L('बारम्बारता (f)', 'Frequency (f)')}</th>
                      <th className="py-2.5 px-4 text-center">{L('सञ्चित बारम्बारता (c.f.)', 'Cumulative Freq (c.f.)')}</th>
                      <th className="py-2.5 px-4 text-center">{L('कैफियत / स्थिति', 'Remarks')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {discreteAnalysis.table.map(row => {
                      const isMedianRow = row.id === discreteAnalysis.medianRowId;
                      return (
                        <tr
                          key={row.id}
                          className={isMedianRow ? 'bg-amber-50 font-bold text-amber-950' : 'hover:bg-slate-50'}
                        >
                          <td className="py-2.5 px-4 font-mono text-sm">{fmt(row.x)}</td>
                          <td className="py-2.5 px-4 text-center font-mono">{fmt(row.f)}</td>
                          <td className="py-2.5 px-4 text-center font-mono text-indigo-700">{fmt(row.cf)}</td>
                          <td className="py-2.5 px-4 text-center">
                            {isMedianRow ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                                c.f. ≥ {fmt(discreteAnalysis.medianPos)} 📍
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <tr>
                      <td className="py-2.5 px-4">{L('कुल (Total)', 'Total')}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-indigo-800">
                        N = ∑f = {fmt(discreteAnalysis.totalN)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Explanatory Conclusion */}
              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-xs space-y-2 text-indigo-950">
                <div className="font-bold flex items-center justify-between">
                  <span>
                    {L('मध्यिका स्थिति:', 'Median Position:')}{' '}
                    \frac&#123;N+1&#125;&#123;2&#125; = \frac&#123;{fmt(discreteAnalysis.totalN)}+1&#125;&#123;2&#125; = <span className="font-mono text-indigo-700">{fmt(discreteAnalysis.medianPos)}</span>-औं पद
                  </span>
                  <span className="text-base font-bold font-mono text-indigo-700">
                    M_d = {fmt(discreteAnalysis.medianVal)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {L(
                    `सञ्चित बारम्बारता (c.f.) तालिकामा ${fmt(discreteAnalysis.medianPos)} वा सोभन्दा ठूलो पहिलो सञ्चित बारम्बारताको सिधा अगाडिको मान X = ${fmt(discreteAnalysis.medianVal)} भएकाले मध्यिका मान ${fmt(discreteAnalysis.medianVal)} हुन्छ।`,
                    `The first cumulative frequency equal to or greater than ${discreteAnalysis.medianPos} corresponds to X = ${discreteAnalysis.medianVal}, which is our Median.`
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};

export default MedianExplorerMiddleValue;
