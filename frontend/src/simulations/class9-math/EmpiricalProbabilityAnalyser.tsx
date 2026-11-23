import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const EmpiricalProbabilityAnalyser: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U19-03',
    chapter: 19,
    titleNp: 'प्रयोगात्मक सम्भाव्यता तथा विश्लेषण प्रयोगशाला',
    titleEn: 'Empirical Probability and Experiment Analyser',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'coin' | 'dice' | 'brick'>('coin');

  // Experiment A: Repeated Coin Toss
  const [totalCoinTrials, setTotalCoinTrials] = useState<number>(0);
  const [coinHeads, setCoinHeads] = useState<number>(0);

  const handleSimulateCoins = (n: number) => {
    let heads = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() < 0.5) heads++;
    }
    setTotalCoinTrials(prev => prev + n);
    setCoinHeads(prev => prev + heads);
  };

  const coinTails = totalCoinTrials - coinHeads;
  const empiricalPHead = totalCoinTrials > 0 ? coinHeads / totalCoinTrials : 0;
  const empiricalPTail = totalCoinTrials > 0 ? coinTails / totalCoinTrials : 0;

  // Experiment B: Repeated Dice Rolls
  const [diceTrials, setDiceTrials] = useState<number>(0);
  const [diceCounts, setDiceCounts] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const handleSimulateDice = (n: number) => {
    const counts = [...diceCounts];
    for (let i = 0; i < n; i++) {
      const face = Math.floor(Math.random() * 6);
      counts[face]++;
    }
    setDiceTrials(prev => prev + n);
    setDiceCounts(counts);
  };

  // Experiment C: Defective Brick Factory (CDC Textbook Problem)
  const [totalBricksTested, setTotalBricksTested] = useState<number>(500);
  const [defectiveCount, setDefectiveCount] = useState<number>(25);
  const [futureBatchSize, setFutureBatchSize] = useState<number>(20000);

  const pDefective = totalBricksTested > 0 ? defectiveCount / totalBricksTested : 0;
  const pGood = 1 - pDefective;
  const expectedDefectiveInBatch = Math.round(futureBatchSize * pDefective);
  const expectedGoodInBatch = futureBatchSize - expectedDefectiveInBatch;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! प्रयोगात्मक सम्भाव्यता (Empirical Probability = नतिजा आएको पटक / कुल परीक्षण) र सैद्धान्तिक सम्भाव्यताबीचको भिन्नता तथा ठूलो सङ्ख्याको नियम (Law of Large Numbers) अवलोकन गर्नुहोस्!',
        'Welcome! Compare Empirical Probability (Occurrences / Total trials) with Theoretical Probability, and observe how large sample sizes converge!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('coin')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'coin'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🪙</span>
            <span>{L('१. ठूलो मात्रामा सिक्का उछाल (Coin Trials)', '1. Coin Trials')}</span>
          </button>
          <button
            onClick={() => setActiveTab('dice')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'dice'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎲</span>
            <span>{L('२. पासा बारम्बारता विश्लेषण (Dice Frequency)', '2. Dice Frequency')}</span>
          </button>
          <button
            onClick={() => setActiveTab('brick')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'brick'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🧱</span>
            <span>{L('३. इँटा कारखाना समस्या (Brick Factory Lab)', '3. Brick Factory Lab')}</span>
          </button>
        </div>

        {/* TAB 1: Coin Empirical Trials */}
        {activeTab === 'coin' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('दोहोर्याइएको सिक्का परीक्षण (Repeated Coin Tosses)', 'Repeated Coin Tosses')}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  {L(
                    `कुल परीक्षण: ${fmt(totalCoinTrials)} | शीर्ष (H): ${fmt(coinHeads)} | पुच्छर (T): ${fmt(coinTails)}`,
                    `Total Trials: ${totalCoinTrials} | Heads: ${coinHeads} | Tails: ${coinTails}`
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleSimulateCoins(10)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200"
                >
                  +१० {L('पटक', 'x')}
                </button>
                <button
                  onClick={() => handleSimulateCoins(50)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200"
                >
                  +५० {L('पटक', 'x')}
                </button>
                <button
                  onClick={() => handleSimulateCoins(100)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  +१०० {L('पटक', 'x')}
                </button>
                <button
                  onClick={() => handleSimulateCoins(500)}
                  className="px-3 py-1.5 bg-indigo-800 hover:bg-indigo-900 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  +५०० {L('पटक', 'x')}
                </button>
                {totalCoinTrials > 0 && (
                  <button
                    onClick={() => {
                      setTotalCoinTrials(0);
                      setCoinHeads(0);
                    }}
                    className="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    {L('रिसेट', 'Reset')}
                  </button>
                )}
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-950 text-xs">🪙 {L('शीर्ष (Heads, H)', 'Heads (H)')}</span>
                  <span className="font-mono text-sm font-bold text-amber-900">{fmt(coinHeads)} / {fmt(totalCoinTrials)}</span>
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <div>
                    {L('प्रयोगात्मक सम्भाव्यता (Empirical P):', 'Empirical Probability:')}{' '}
                    <span className="font-mono font-bold text-indigo-700 text-base">
                      {totalCoinTrials > 0 ? empiricalPHead.toFixed(3) : '—'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {L('सैद्धान्तिक मान (Theoretical):', 'Theoretical Value:')} <span className="font-mono font-bold">0.500 (५०%)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-xs">🪙 {L('पुच्छर (Tails, T)', 'Tails (T)')}</span>
                  <span className="font-mono text-sm font-bold text-slate-900">{fmt(coinTails)} / {fmt(totalCoinTrials)}</span>
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <div>
                    {L('प्रयोगात्मक सम्भाव्यता (Empirical P):', 'Empirical Probability:')}{' '}
                    <span className="font-mono font-bold text-indigo-700 text-base">
                      {totalCoinTrials > 0 ? empiricalPTail.toFixed(3) : '—'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {L('सैद्धान्तिक मान (Theoretical):', 'Theoretical Value:')} <span className="font-mono font-bold">0.500 (५०%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Convergence Insight */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1.5 leading-relaxed">
              <strong>💡 {L('ठूलो सङ्ख्याको नियम (Law of Large Numbers):', 'Law of Large Numbers:')}</strong>
              <p>
                {L(
                  'थोरै पटक (जस्तै ५ वा १० पटक) उफार्दा शीर्ष र पुच्छरको अनुपात ५०% भन्दा निकै फरक हुन सक्छ। तर जति धेरै पटक (५०० वा १००० पटक) उफार्दै गइन्छ, प्रयोगात्मक सम्भाव्यता सैद्धान्तिक मान ०.५ को नजिक पुग्दै जान्छ।',
                  'With a small number of trials (e.g. 5 or 10), the empirical ratio may deviate from 50%. As the number of trials increases to 500 or 1000+, empirical probability reliably converges towards the theoretical 0.5.'
                )}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Dice Frequency Analysis */}
        {activeTab === 'dice' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('पासा बारम्बारता विश्लेषण (Dice Frequency)', 'Dice Frequency Analysis')}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  {L(`कुल रोल: ${fmt(diceTrials)} | सैद्धान्तिक सम्भाव्यता = १/६ ≈ ०.१६७`, `Total Rolls: ${diceTrials} | Theoretical = 1/6 ≈ 0.167`)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSimulateDice(30)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200"
                >
                  +३० {L('पटक', 'x')}
                </button>
                <button
                  onClick={() => handleSimulateDice(60)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  +६० {L('पटक', 'x')}
                </button>
                <button
                  onClick={() => handleSimulateDice(300)}
                  className="px-3 py-1.5 bg-indigo-800 hover:bg-indigo-900 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  +३०० {L('पटक', 'x')}
                </button>
                {diceTrials > 0 && (
                  <button
                    onClick={() => {
                      setDiceTrials(0);
                      setDiceCounts([0, 0, 0, 0, 0, 0]);
                    }}
                    className="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    {L('रिसेट', 'Reset')}
                  </button>
                )}
              </div>
            </div>

            {/* 6 Faces Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5">{L('पासाको अङ्क (Face)', 'Dice Face')}</th>
                    <th className="p-2.5 text-center">{L('आएको पटक (Frequency)', 'Frequency')}</th>
                    <th className="p-2.5 text-center">{L('प्रयोगात्मक सम्भाव्यता', 'Empirical P')}</th>
                    <th className="p-2.5 text-center">{L('सैद्धान्तिक सम्भाव्यता', 'Theoretical P')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {diceCounts.map((count, i) => {
                    const emp = diceTrials > 0 ? (count / diceTrials).toFixed(3) : '—';
                    return (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold font-mono text-slate-800">🎲 {fmt(i + 1)}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-indigo-700">{fmt(count)}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-700">{emp}</td>
                        <td className="p-2.5 text-center font-mono text-slate-500">0.167 (1/6)</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Defective Brick Factory Problem (CDC Textbook) */}
        {activeTab === 'brick' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {L('इँटा कारखाना गुणस्तर परीक्षण (Brick Factory Quality Control)', 'Brick Quality Investigation')}
              </h4>
              <p className="text-xs text-slate-500">
                {L(
                  'पाठ्यपुस्तक समस्या: नमुना परीक्षण गरिएका इँटाहरूमध्ये बिग्रेका इँटाको आधारमा सम्पूर्ण लटको सम्भाव्यता तथा अनुमान।',
                  'Textbook application: Estimating total defective and good bricks in a large shipment from sample testing.'
                )}
              </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {L('परीक्षण गरिएको जम्मा इँटा:', 'Sample Bricks Tested:')}
                </label>
                <input
                  type="number"
                  value={totalBricksTested}
                  onChange={e => setTotalBricksTested(Math.max(10, parseInt(e.target.value) || 0))}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-rose-700 block">
                  {L('बिग्रेका (खराब) इँटा सङ्ख्या:', 'Defective Bricks Found:')}
                </label>
                <input
                  type="number"
                  value={defectiveCount}
                  onChange={e => setDefectiveCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono font-bold text-rose-700"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-indigo-700 block">
                  {L('आगामी लट (कुल इँटा सङ्ख्या):', 'Future Batch Size:')}
                </label>
                <input
                  type="number"
                  value={futureBatchSize}
                  onChange={e => setFutureBatchSize(Math.max(100, parseInt(e.target.value) || 0))}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono font-bold text-indigo-700"
                />
              </div>
            </div>

            {/* Calculation Output */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-indigo-100 space-y-1">
                  <div className="text-slate-500">{L('खराब इँटा पर्ने सम्भाव्यता P(Defective):', 'P(Defective):')}</div>
                  <div className="text-base font-bold font-mono text-rose-700">
                    \frac&#123;{fmt(defectiveCount)}&#125;&#123;{fmt(totalBricksTested)}&#125; = {pDefective.toFixed(4)} ({(pDefective * 100).toFixed(2)}%)
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-indigo-100 space-y-1">
                  <div className="text-slate-500">{L('राम्रो इँटा पर्ने सम्भाव्यता P(Good):', 'P(Good):')}</div>
                  <div className="text-base font-bold font-mono text-emerald-700">
                    1 − {pDefective.toFixed(4)} = {pGood.toFixed(4)} ({(pGood * 100).toFixed(2)}%)
                  </div>
                </div>
              </div>

              {/* Estimation for batch */}
              <div className="p-3 bg-white rounded-lg border border-indigo-100 flex flex-col sm:flex-row justify-between items-center gap-2">
                <span className="font-semibold text-slate-800">
                  {L(
                    `${fmt(futureBatchSize)} वटा इँटाको लटमा अनुमानित खराब इँटा सङ्ख्या:`,
                    `Expected defective bricks in a batch of ${futureBatchSize}:`
                  )}
                </span>
                <span className="text-base font-bold font-mono text-rose-700">
                  {fmt(futureBatchSize)} × {pDefective.toFixed(4)} ≈ {fmt(expectedDefectiveInBatch)} {L('वटा', 'bricks')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default EmpiricalProbabilityAnalyser;
