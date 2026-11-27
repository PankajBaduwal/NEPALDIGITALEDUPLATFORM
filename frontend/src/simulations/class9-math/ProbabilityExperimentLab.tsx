import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const ProbabilityExperimentLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U19-01',
    chapter: 19,
    titleNp: 'सम्भाव्यता प्रयोग प्रयोगशाला',
    titleEn: 'Probability Experiment Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeStation, setActiveStation] = useState<'coin' | 'dice' | 'spinner'>('coin');

  // Station A: Coin State
  const [coinTosses, setCoinTosses] = useState<('H' | 'T')[]>([]);
  const [coinIsFlipping, setCoinIsFlipping] = useState<boolean>(false);
  const [selectedCoinEvent, setSelectedCoinEvent] = useState<'H' | 'T' | 'both'>('H');

  // Station B: Dice State
  const [diceRolls, setDiceRolls] = useState<number[]>([]);
  const [diceIsRolling, setDiceIsRolling] = useState<boolean>(false);
  const [selectedDiceEvent, setSelectedDiceEvent] = useState<'even' | 'odd' | 'prime' | 'square' | 'greater4'>('even');

  // Station C: Spinner State
  const spinnerSections = [
    { labelNp: 'रातो', labelEn: 'Red', color: '#ef4444', angle: 90 },
    { labelNp: 'नीलो', labelEn: 'Blue', color: '#3b82f6', angle: 90 },
    { labelNp: 'हरियो', labelEn: 'Green', color: '#10b981', angle: 90 },
    { labelNp: 'पहेंलो', labelEn: 'Yellow', color: '#f59e0b', angle: 90 },
  ];
  const [spinnerAngle, setSpinnerAngle] = useState<number>(0);
  const [spinnerSpinning, setSpinnerSpinning] = useState<boolean>(false);
  const [spinnerResults, setSpinnerResults] = useState<number[]>([]);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);

  // Coin Handlers
  const handleTossCoin = (count: number = 1) => {
    if (coinIsFlipping) return;
    setCoinIsFlipping(true);
    setTimeout(() => {
      const newTosses: ('H' | 'T')[] = [];
      for (let i = 0; i < count; i++) {
        newTosses.push(Math.random() < 0.5 ? 'H' : 'T');
      }
      setCoinTosses(prev => [...newTosses, ...prev]);
      setCoinIsFlipping(false);
    }, 400);
  };

  const coinHeadsCount = coinTosses.filter(t => t === 'H').length;
  const coinTailsCount = coinTosses.filter(t => t === 'T').length;
  const totalCoinTosses = coinTosses.length;

  // Dice Handlers
  const handleRollDice = (count: number = 1) => {
    if (diceIsRolling) return;
    setDiceIsRolling(true);
    setTimeout(() => {
      const newRolls: number[] = [];
      for (let i = 0; i < count; i++) {
        newRolls.push(Math.floor(Math.random() * 6) + 1);
      }
      setDiceRolls(prev => [...newRolls, ...prev]);
      setDiceIsRolling(false);
    }, 400);
  };

  const totalDiceRolls = diceRolls.length;
  const diceFreq = [1, 2, 3, 4, 5, 6].map(face => ({
    face,
    count: diceRolls.filter(r => r === face).length,
  }));

  // Dice Event sets
  const diceEventConfig = {
    even: { nameNp: 'जोडी सङ्ख्या (Even numbers)', nameEn: 'Even numbers', outcomes: [2, 4, 6] },
    odd: { nameNp: 'विजोडी सङ्ख्या (Odd numbers)', nameEn: 'Odd numbers', outcomes: [1, 3, 5] },
    prime: { nameNp: 'रूढ सङ्ख्या (Prime numbers)', nameEn: 'Prime numbers', outcomes: [2, 3, 5] },
    square: { nameNp: 'पूर्ण वर्ग सङ्ख्या (Square numbers)', nameEn: 'Square numbers', outcomes: [1, 4] },
    greater4: { nameNp: '4 भन्दा ठूलो (Numbers > 4)', nameEn: 'Numbers > 4', outcomes: [5, 6] },
  };

  const curDiceEvent = diceEventConfig[selectedDiceEvent];
  const diceFavorableCount = diceRolls.filter(r => curDiceEvent.outcomes.includes(r)).length;

  // Spinner Handlers
  const handleSpinWheel = () => {
    if (spinnerSpinning) return;
    setSpinnerSpinning(true);
    const extraSpins = 360 * 4 + Math.floor(Math.random() * 360);
    const newAngle = spinnerAngle + extraSpins;
    setSpinnerAngle(newAngle);

    setTimeout(() => {
      const normalized = (360 - (newAngle % 360)) % 360;
      // 4 sections of 90 degrees: [0-90: Red, 90-180: Blue, 180-270: Green, 270-360: Yellow]
      const sectionIdx = Math.floor(normalized / 90) % 4;
      setSpinnerResults(prev => [sectionIdx, ...prev]);
      setSpinnerSpinning(false);
    }, 1200);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! सम्भाव्यता प्रयोगशालामा स्वागत छ। सिक्का, पासा र स्पिनर घुमाएर सम्भाव्य नतिजा (Sample Space), अनुकूल घटना र सैद्धान्तिक सम्भाव्यता (P(E) = n(E)/n(S)) अन्वेषण गर्नुहोस्!',
        'Welcome! Explore sample spaces, favorable outcomes, and theoretical probability P(E) = n(E)/n(S) with coin flips, dice rolls, and color spinners.'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Stations */}
        <div className="lg:col-span-12 flex gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveStation('coin')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeStation === 'coin'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🪙</span>
            <span>{L('स्टेसन 1: सिक्का उछाल (Coin Toss)', 'Station 1: Coin Toss')}</span>
          </button>
          <button
            onClick={() => setActiveStation('dice')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeStation === 'dice'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎲</span>
            <span>{L('स्टेसन 2: पासा दगुराइ (Dice Roll)', 'Station 2: Dice Roll')}</span>
          </button>
          <button
            onClick={() => setActiveStation('spinner')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeStation === 'spinner'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎯</span>
            <span>{L('स्टेसन 3: स्पिनर चक्र (Spinner Wheel)', 'Station 3: Spinner Wheel')}</span>
          </button>
        </div>

        {/* STATION 1: COIN TOSS */}
        {activeStation === 'coin' && (
          <>
            {/* Left Controls & Animation */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('सिक्का प्रयोग (Coin Experiment)', 'Coin Experiment')}
                </h4>
                <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                  S = &#123; H, T &#125;, n(S) = 2
                </span>
              </div>

              {/* Coin Representation */}
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-xl border border-slate-200">
                <div
                  className={`w-28 h-28 rounded-full border-4 flex items-center justify-center font-bold text-3xl shadow-lg transition-transform duration-300 ${
                    coinIsFlipping
                      ? 'scale-110 rotate-180 bg-amber-200 border-amber-400 text-amber-800'
                      : coinTosses[0] === 'H'
                      ? 'bg-gradient-to-br from-amber-300 to-amber-500 border-amber-600 text-amber-950'
                      : coinTosses[0] === 'T'
                      ? 'bg-gradient-to-br from-slate-200 to-slate-400 border-slate-500 text-slate-900'
                      : 'bg-amber-100 border-amber-400 text-amber-800'
                  }`}
                >
                  {coinIsFlipping ? '?' : coinTosses[0] === 'H' ? 'H' : coinTosses[0] === 'T' ? 'T' : '🪙'}
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-600">
                  {coinTosses.length === 0
                    ? L('सिक्का उफार्न तलको बटन थिच्नुहोस्', 'Press a button below to flip coin')
                    : L(`पछिल्लो नतिजा: ${coinTosses[0] === 'H' ? 'शीर्ष (Head, H)' : 'पुच्छर (Tail, T)'}`, `Last result: ${coinTosses[0]}`)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleTossCoin(1)}
                  disabled={coinIsFlipping}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {L('1 पटक उफार्नुहोस् (Flip 1 Time)', 'Flip 1 Time')}
                </button>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleTossCoin(10)}
                    disabled={coinIsFlipping}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300"
                  >
                    +10 {L('पटक', 'x')}
                  </button>
                  <button
                    onClick={() => handleTossCoin(20)}
                    disabled={coinIsFlipping}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300"
                  >
                    +20 {L('पटक', 'x')}
                  </button>
                  <button
                    onClick={() => handleTossCoin(50)}
                    disabled={coinIsFlipping}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300"
                  >
                    +50 {L('पटक', 'x')}
                  </button>
                  <button
                    onClick={() => handleTossCoin(100)}
                    disabled={coinIsFlipping}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300"
                  >
                    +100 {L('पटक', 'x')}
                  </button>
                </div>
                {coinTosses.length > 0 && (
                  <button
                    onClick={() => setCoinTosses([])}
                    className="w-full py-1 text-slate-400 hover:text-slate-600 text-[11px] font-medium"
                  >
                    {L('सबै नतिजा रिसेट गर्नुहोस्', 'Reset All Coin Flips')}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Theoretical Formula & Frequency Table */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {/* Formula & Probability Panel */}
              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 space-y-2 text-xs">
                <h4 className="font-bold text-indigo-950 flex justify-between">
                  <span>{L('सैद्धान्तिक सम्भाव्यता (Theoretical Probability)', 'Theoretical Probability')}</span>
                  <span className="font-mono">P(E) = n(E) / n(S)</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                    <span className="text-slate-500 block text-[11px]">{L('शीर्ष (Head, H) आउने सम्भाव्यता:', 'P(Head):')}</span>
                    <span className="text-sm font-bold font-mono text-indigo-700">
                      P(H) = \frac&#123;1&#125;&#123;2&#125; = 0.5 (50%)
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                    <span className="text-slate-500 block text-[11px]">{L('पुच्छर (Tail, T) आउने सम्भाव्यता:', 'P(Tail):')}</span>
                    <span className="text-sm font-bold font-mono text-indigo-700">
                      P(T) = \frac&#123;1&#125;&#123;2&#125; = 0.5 (50%)
                    </span>
                  </div>
                </div>
                {/* Complementary event note */}
                <div className="text-[11px] text-indigo-900 pt-1">
                  <strong>{L('पूरक घटना (Complementary Event):', 'Complementary Event:')}</strong>{' '}
                  P(not H) = 1 − P(H) = 1 − \frac&#123;1&#125;&#123;2&#125; = \frac&#123;1&#125;&#123;2&#125;
                </div>
              </div>

              {/* Live Experiment Observation Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs flex justify-between">
                  <span>{L('प्रयोग नतिजा तालिका (Experimental Results)', 'Experimental Results')}</span>
                  <span className="font-mono text-slate-500">{L(`जम्मा उछाल: ${fmt(totalCoinTosses)}`, `Total Flips: ${totalCoinTosses}`)}</span>
                </h4>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2.5">{L('सम्भाव्य नतिजा', 'Outcome')}</th>
                        <th className="p-2.5 text-center">{L('पटक (Frequency)', 'Frequency')}</th>
                        <th className="p-2.5 text-center">{L('प्रयोगात्मक सम्भाव्यता', 'Empirical Probability')}</th>
                        <th className="p-2.5 text-center">{L('सैद्धान्तिक मान', 'Theoretical')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-bold text-amber-700">🪙 {L('शीर्ष (Head, H)', 'Head (H)')}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{fmt(coinHeadsCount)}</td>
                        <td className="p-2.5 text-center font-mono text-indigo-700 font-bold">
                          {totalCoinTosses > 0 ? (coinHeadsCount / totalCoinTosses).toFixed(3) : '—'}
                        </td>
                        <td className="p-2.5 text-center font-mono text-slate-500">0.500</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700">🪙 {L('पुच्छर (Tail, T)', 'Tail (T)')}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{fmt(coinTailsCount)}</td>
                        <td className="p-2.5 text-center font-mono text-indigo-700 font-bold">
                          {totalCoinTosses > 0 ? (coinTailsCount / totalCoinTosses).toFixed(3) : '—'}
                        </td>
                        <td className="p-2.5 text-center font-mono text-slate-500">0.500</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Progress bar visual */}
                {totalCoinTosses > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${(coinHeadsCount / totalCoinTosses) * 100}%` }}
                        className="bg-amber-500 h-full transition-all duration-300"
                        title={`Heads: ${((coinHeadsCount / totalCoinTosses) * 100).toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${(coinTailsCount / totalCoinTosses) * 100}%` }}
                        className="bg-slate-500 h-full transition-all duration-300"
                        title={`Tails: ${((coinTailsCount / totalCoinTosses) * 100).toFixed(1)}%`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Heads: {totalCoinTosses > 0 ? ((coinHeadsCount / totalCoinTosses) * 100).toFixed(1) : 0}%</span>
                      <span>Tails: {totalCoinTosses > 0 ? ((coinTailsCount / totalCoinTosses) * 100).toFixed(1) : 0}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* STATION 2: DICE EXPERIMENT */}
        {activeStation === 'dice' && (
          <>
            {/* Left Controls & Animation */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('पासा प्रयोग (Dice Experiment)', 'Dice Experiment')}
                </h4>
                <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                  S = &#123; 1, 2, 3, 4, 5, 6 &#125;, n(S) = 6
                </span>
              </div>

              {/* 3D Dice Graphic */}
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-xl border border-slate-200">
                <div
                  className={`w-24 h-24 rounded-2xl bg-white border-2 border-slate-300 shadow-md flex items-center justify-center font-bold text-4xl text-indigo-700 transition-all duration-300 ${
                    diceIsRolling ? 'scale-110 rotate-45 border-indigo-400 bg-indigo-50' : ''
                  }`}
                >
                  {diceIsRolling ? '🎲' : diceRolls[0] ? fmt(diceRolls[0]) : '🎲'}
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-600">
                  {diceRolls.length === 0
                    ? L('पासा दगुराउन बटन थिच्नुहोस्', 'Roll dice to generate outcome')
                    : L(`पछिल्लो नतिजा: ${fmt(diceRolls[0])}`, `Last rolled: ${diceRolls[0]}`)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleRollDice(1)}
                  disabled={diceIsRolling}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {L('1 पटक दगुराउनुहोस् (Roll 1 Time)', 'Roll 1 Time')}
                </button>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleRollDice(10)}
                    disabled={diceIsRolling}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300"
                  >
                    +10 {L('पटक', 'x')}
                  </button>
                  <button
                    onClick={() => handleRollDice(30)}
                    disabled={diceIsRolling}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300"
                  >
                    +30 {L('पटक', 'x')}
                  </button>
                  <button
                    onClick={() => handleRollDice(60)}
                    disabled={diceIsRolling}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300"
                  >
                    +60 {L('पटक', 'x')}
                  </button>
                </div>
                {diceRolls.length > 0 && (
                  <button
                    onClick={() => setDiceRolls([])}
                    className="w-full py-1 text-slate-400 hover:text-slate-600 text-[11px] font-medium"
                  >
                    {L('सबै रोल रिसेट गर्नुहोस्', 'Reset All Rolls')}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Event Inspector & Frequencies */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {/* Event Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {L('घटना (Event, E) छनोट गर्नुहोस्:', 'Select an Event (E):')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(Object.keys(diceEventConfig) as (keyof typeof diceEventConfig)[]).map(key => (
                    <button
                      key={key}
                      onClick={() => setSelectedDiceEvent(key)}
                      className={`p-2 rounded-lg text-left text-xs font-medium border transition-all ${
                        selectedDiceEvent === key
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>{L(diceEventConfig[key].nameNp, diceEventConfig[key].nameEn)}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        E = &#123; {diceEventConfig[key].outcomes.join(', ')} &#125;
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Calculation Card */}
              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-950">
                    {L('घटनाको अनुकूल सङ्ख्या:', 'Favourable Outcomes:')} n(E) = {fmt(curDiceEvent.outcomes.length)}
                  </span>
                  <span className="font-bold text-indigo-950">
                    {L('कुल सम्भाव्य नतिजा:', 'Total Outcomes:')} n(S) = 6
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-indigo-100 flex justify-between items-center font-mono">
                  <span className="text-slate-700">P(E) = \frac&#123;n(E)&#125;&#123;n(S)&#125;</span>
                  <span className="text-base font-bold text-indigo-700">
                    P(E) = \frac&#123;{fmt(curDiceEvent.outcomes.length)}&#125;&#123;6&#125; = {fmt((curDiceEvent.outcomes.length / 6).toFixed(3))}
                  </span>
                </div>
              </div>

              {/* Dice Outcomes Bar Chart */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-800 text-xs">
                  {L('प्रत्येक अङ्कको बारम्बारता (Frequencies 1 to 6):', 'Frequencies for Faces 1 to 6:')}
                </h5>
                <div className="grid grid-cols-6 gap-2 text-center text-xs">
                  {diceFreq.map(f => {
                    const isFavorable = curDiceEvent.outcomes.includes(f.face);
                    return (
                      <div
                        key={f.face}
                        className={`p-2 rounded-xl border transition-all ${
                          isFavorable ? 'bg-indigo-50 border-indigo-300 font-bold' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="text-sm font-bold text-slate-800">{fmt(f.face)}</div>
                        <div className="text-xs font-mono text-indigo-600 mt-1">{fmt(f.count)}x</div>
                        {isFavorable && (
                          <span className="inline-block mt-1 text-[9px] bg-indigo-200 text-indigo-800 px-1 rounded">
                            ✓ E
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* STATION 3: SPINNER WHEEL */}
        {activeStation === 'spinner' && (
          <>
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col items-center">
              <div className="w-full flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('रङ्गीन स्पिनर चक्र', 'Colored Spinner Wheel')}
                </h4>
                <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                  n(S) = 4 equal colours
                </span>
              </div>

              {/* Rotating Wheel SVG */}
              <div className="relative w-48 h-48 my-2">
                {/* Pointer at the top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-slate-800" />
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full rounded-full shadow-lg"
                  style={{
                    transform: `rotate(${spinnerAngle}deg)`,
                    transition: spinnerSpinning ? 'transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
                  }}
                >
                  {/* 4 Quadrants */}
                  <path d="M 50 50 L 50 0 A 50 50 0 0 1 100 50 Z" fill="#ef4444" />
                  <path d="M 50 50 L 100 50 A 50 50 0 0 1 50 100 Z" fill="#3b82f6" />
                  <path d="M 50 50 L 50 100 A 50 50 0 0 1 0 50 Z" fill="#10b981" />
                  <path d="M 50 50 L 0 50 A 50 50 0 0 1 50 0 Z" fill="#f59e0b" />
                  <circle cx="50" cy="50" r="10" fill="#ffffff" stroke="#334155" strokeWidth="2" />
                </svg>
              </div>

              <button
                onClick={handleSpinWheel}
                disabled={spinnerSpinning}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                {spinnerSpinning ? L('घुम्दैछ...', 'Spinning...') : L('स्पिनर घुमाउनुहोस् (Spin Wheel)', 'Spin Wheel')}
              </button>
            </div>

            {/* Right: Color Probability Details */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-xs">
                {L('बराबर सम्भाव्य नतिजा (Equally Likely Outcomes):', 'Equally Likely Color Outcomes:')}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {spinnerSections.map((sec, idx) => {
                  const count = spinnerResults.filter(r => r === idx).length;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedColorIdx === idx
                          ? 'ring-2 ring-indigo-500 bg-indigo-50/50 font-bold'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: sec.color }} />
                        <span className="font-bold">{L(sec.labelNp, sec.labelEn)}</span>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-600 font-mono">
                        P = \frac&#123;1&#125;&#123;4&#125; (25%)
                      </div>
                      <div className="mt-1 text-[11px] text-indigo-700 font-mono font-bold">
                        {L(`आएको: ${fmt(count)} पटक`, `Landed: ${count}x`)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Textbook Concept Note */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1.5 leading-relaxed">
                <strong>{L('पाठ्यपुस्तक सिद्धान्त (Textbook Principle):', 'Textbook Principle:')}</strong>
                <p>
                  {L(
                    'जब प्रत्येक सम्भाव्य नतिजा आउने सम्भावना बराबर हुन्छ, त्यस्ता घटनाहरूलाई समसम्भाव्य घटना (Equally Likely Outcomes) भनिन्छ। 4 pcs बराबर खण्ड भएको स्पिनरमा प्रत्येक रङ्ग आउने सम्भाव्यता P(E) = 1/4 हुन्छ।',
                    'When every possible outcome has an identical chance of occurring, they are called Equally Likely Outcomes. On a 4-equal-section spinner, each color has P(E) = 1/4 = 0.25.'
                  )}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ProbabilityExperimentLab;
