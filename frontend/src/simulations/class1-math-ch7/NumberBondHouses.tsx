/**
 * NumberBondHouses.tsx
 * Simulation 03: Number Bond Houses (सङ्ख्याका घरहरू)
 * Class 1 Mathematics - Chapter 7: Addition up to 10 (योगफल १० सम्म आउने जोड)
 * Nepal Digital Education Platform
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Plus,
  Home,
  HelpCircle,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];

export const NumberBondHouses: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Selected Target House: 5, 6, 7, 8, 9, 10
  const [targetSum, setTargetSum] = useState<number>(5);
  const [leftRoomCount, setLeftRoomCount] = useState<number>(2);

  // Mode: 'EXPLORE' or 'CHALLENGE'
  const [activeMode, setActiveMode] = useState<'EXPLORE' | 'CHALLENGE'>('EXPLORE');

  // Challenge Mode State
  const [challengeTarget, setChallengeTarget] = useState<number>(10);
  const [challengeGivenPart, setChallengeGivenPart] = useState<number>(4);
  const [challengeUserPart, setChallengeUserPart] = useState<number | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<boolean | null>(null);
  const [challengeScore, setChallengeScore] = useState<number>(0);

  const rightRoomCount = targetSum - leftRoomCount;

  // Sound generator
  const playSound = useCallback(
    (type: 'click' | 'pop' | 'success' | 'boop' | 'fanfare', step?: number) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'click' || type === 'pop') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320 + (step || 1) * 40, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
        } else if (type === 'success') {
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = ctx.currentTime + idx * 0.08;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.15, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.35);
          });
        } else if (type === 'boop') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      } catch (e) {}
    },
    [soundEnabled]
  );

  const speak = useCallback(
    (textNp: string, textEn: string) => {
      if (!soundEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const text = language === 'np' ? textNp : textEn;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
      window.speechSynthesis.speak(utterance);
    },
    [language, soundEnabled]
  );

  const handleHouseSelect = (sum: number) => {
    playSound('click');
    setTargetSum(sum);
    setLeftRoomCount(Math.floor(sum / 2));
    speak(
      `${sum} बनाउने सङ्ख्याको घर हेरौँ।`,
      `Let's explore the number house for making ${sum}.`
    );
  };

  const persistProgress = async (score: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(
        '/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH7-03/progress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            timeSpentSeconds: 110,
            metrics: {
              numberBondScore: score,
            },
          }),
        }
      );
    } catch (e) {}
  };

  const handleChallengeAnswer = (ans: number) => {
    const required = challengeTarget - challengeGivenPart;
    setChallengeUserPart(ans);
    const correct = ans === required;
    setChallengeFeedback(correct);

    if (correct) {
      playSound('success');
      setChallengeScore((s) => s + 1);
      speak(
        `स्याबास! ${challengeGivenPart} मा ${ans} जोड्दा ${challengeTarget} हुन्छ!`,
        `Correct! ${challengeGivenPart} plus ${ans} equals ${challengeTarget}!`
      );
      persistProgress(challengeScore + 1);
    } else {
      playSound('boop');
      speak('पुनः विचार गर्नुहोस्।', 'Think again carefully.');
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Header Bar */}
      <header className="h-16 px-4 bg-slate-800/95 backdrop-blur border-b border-slate-700 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLibrary}
            className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition text-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
              Class 1 • Math • Chapter 7 • Simulation 03
            </span>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-amber-400" />
              {language === 'np' ? 'सङ्ख्याका घरहरू' : 'Number Bond Houses'}
            </h1>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => {
              setActiveMode('EXPLORE');
              playSound('click');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeMode === 'EXPLORE'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {language === 'np' ? 'घरहरू अवलोकन' : 'Explore Houses'}
          </button>
          <button
            onClick={() => {
              setActiveMode('CHALLENGE');
              setChallengeTarget(10);
              setChallengeGivenPart(4);
              setChallengeUserPart(null);
              setChallengeFeedback(null);
              playSound('click');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              activeMode === 'CHALLENGE'
                ? 'bg-amber-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {language === 'np' ? 'खाली कोठा चुनौती' : 'Missing Part Challenge'}
          </button>
        </div>

        {/* Language & Sound */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLanguage((l) => (l === 'np' ? 'en' : 'np'));
              playSound('click');
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            {language === 'np' ? 'EN' : 'नेपाली'}
          </button>
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            className={`p-2 rounded-lg border transition ${
              soundEnabled
                ? 'bg-slate-700 border-slate-600 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-slate-950">
        {activeMode === 'EXPLORE' ? (
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center gap-6">
            {/* House Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-2">
              {[5, 6, 7, 8, 9, 10].map((sum) => (
                <button
                  key={sum}
                  onClick={() => handleHouseSelect(sum)}
                  className={`px-4 py-2 rounded-2xl font-black text-sm transition border ${
                    targetSum === sum
                      ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {language === 'np' ? `${NEP_DIGITS[sum]} को घर` : `House ${sum}`}
                </button>
              ))}
            </div>

            {/* The 2-Room Number House Graphic */}
            <div className="w-full max-w-lg flex flex-col items-center">
              {/* Roof */}
              <div className="w-0 h-0 border-l-[160px] border-l-transparent border-r-[160px] border-r-transparent border-b-[90px] border-b-amber-600 relative flex justify-center">
                <div className="absolute top-[32px] w-14 h-14 rounded-full bg-slate-950 border-2 border-amber-300 flex items-center justify-center shadow-inner">
                  <span className="text-2xl font-black text-amber-400">
                    {language === 'np' ? NEP_DIGITS[targetSum] : targetSum}
                  </span>
                </div>
              </div>

              {/* House Main Body: Two Rooms */}
              <div className="w-full bg-slate-850 border-4 border-amber-600 rounded-b-3xl grid grid-cols-2 divide-x-4 divide-amber-600 p-4 min-h-[220px]">
                {/* Room 1 (Left) */}
                <div className="flex flex-col items-center justify-between p-3 bg-amber-950/20 rounded-bl-2xl">
                  <div className="text-center">
                    <span className="text-xs font-bold text-amber-300 block mb-1">
                      {language === 'np' ? 'पहिलो कोठा' : 'Room A'}
                    </span>
                    <span className="text-3xl font-black text-amber-400">
                      {language === 'np' ? NEP_DIGITS[leftRoomCount] : leftRoomCount}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center py-2 max-w-[140px]">
                    {Array.from({ length: leftRoomCount }).map((_, i) => (
                      <span key={i} className="text-2xl">
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={leftRoomCount <= 0}
                      onClick={() => {
                        if (leftRoomCount > 0) {
                          setLeftRoomCount((c) => c - 1);
                          playSound('pop');
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 disabled:opacity-40"
                    >
                      -
                    </button>
                    <button
                      disabled={leftRoomCount >= targetSum}
                      onClick={() => {
                        if (leftRoomCount < targetSum) {
                          setLeftRoomCount((c) => c + 1);
                          playSound('pop');
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Room 2 (Right) */}
                <div className="flex flex-col items-center justify-between p-3 bg-sky-950/20 rounded-br-2xl">
                  <div className="text-center">
                    <span className="text-xs font-bold text-sky-300 block mb-1">
                      {language === 'np' ? 'दोस्रो कोठा' : 'Room B'}
                    </span>
                    <span className="text-3xl font-black text-sky-400">
                      {language === 'np' ? NEP_DIGITS[rightRoomCount] : rightRoomCount}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center py-2 max-w-[140px]">
                    {Array.from({ length: rightRoomCount }).map((_, i) => (
                      <span key={i} className="text-2xl">
                        🌟
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={rightRoomCount <= 0}
                      onClick={() => {
                        if (rightRoomCount > 0) {
                          setLeftRoomCount((c) => c + 1);
                          playSound('pop');
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 disabled:opacity-40"
                    >
                      -
                    </button>
                    <button
                      disabled={rightRoomCount >= targetSum}
                      onClick={() => {
                        if (rightRoomCount < targetSum) {
                          setLeftRoomCount((c) => c - 1);
                          playSound('pop');
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Formula Banner */}
            <div className="px-6 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-3 text-xl font-black">
              <span className="text-amber-400">
                {language === 'np' ? NEP_DIGITS[leftRoomCount] : leftRoomCount}
              </span>
              <Plus className="w-5 h-5 text-emerald-400" />
              <span className="text-sky-400">
                {language === 'np' ? NEP_DIGITS[rightRoomCount] : rightRoomCount}
              </span>
              <span className="text-slate-400">=</span>
              <span className="text-emerald-400">
                {language === 'np' ? NEP_DIGITS[targetSum] : targetSum}
              </span>
            </div>

            {/* Quick Combination Pills for Target House */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {Array.from({ length: targetSum + 1 }).map((_, a) => {
                const b = targetSum - a;
                const isCurrent = a === leftRoomCount;
                return (
                  <button
                    key={a}
                    onClick={() => {
                      setLeftRoomCount(a);
                      playSound('click');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      isCurrent
                        ? 'bg-emerald-600 border-emerald-400 text-white scale-105'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {language === 'np'
                      ? `${NEP_DIGITS[a]} + ${NEP_DIGITS[b]} = ${NEP_DIGITS[targetSum]}`
                      : `${a} + ${b} = ${targetSum}`}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* CHALLENGE MODE */
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center gap-6">
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {language === 'np' ? 'खाली कोठा पत्ता लगाउनुहोस्' : 'Find the Missing Room Count'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                {language === 'np' ? `अङ्क: ${challengeScore}` : `Score: ${challengeScore}`}
              </span>
            </div>

            <p className="text-sm text-center text-slate-200">
              {language === 'np'
                ? `घरको छानामा जम्मा ${challengeTarget} छ। एउटा कोठामा ${challengeGivenPart} छ भने अर्को कोठामा कति चाहिन्छ?`
                : `The roof total is ${challengeTarget}. One room has ${challengeGivenPart}. How many are needed in the second room?`}
            </p>

            {/* Challenge House Representation */}
            <div className="w-full max-w-sm flex flex-col items-center">
              <div className="w-0 h-0 border-l-[130px] border-l-transparent border-r-[130px] border-r-transparent border-b-[75px] border-b-amber-600 relative flex justify-center">
                <div className="absolute top-[24px] w-12 h-12 rounded-full bg-slate-950 border-2 border-amber-300 flex items-center justify-center">
                  <span className="text-xl font-black text-amber-400">
                    {language === 'np' ? NEP_DIGITS[challengeTarget] : challengeTarget}
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-850 border-4 border-amber-600 rounded-b-3xl grid grid-cols-2 divide-x-4 divide-amber-600 p-4">
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="text-xs text-amber-300 mb-1">
                    {language === 'np' ? 'दिइएको' : 'Given'}
                  </span>
                  <span className="text-4xl font-black text-amber-400">
                    {language === 'np' ? NEP_DIGITS[challengeGivenPart] : challengeGivenPart}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="text-xs text-sky-300 mb-1">
                    {language === 'np' ? 'खाली (?)' : 'Missing (?)'}
                  </span>
                  <span className="text-4xl font-black text-sky-400">
                    {challengeUserPart !== null
                      ? language === 'np'
                        ? NEP_DIGITS[challengeUserPart]
                        : challengeUserPart
                      : '?'}
                  </span>
                </div>
              </div>
            </div>

            {/* Choices */}
            <div className="grid grid-cols-4 gap-2 w-full">
              {[
                challengeTarget - challengeGivenPart - 1,
                challengeTarget - challengeGivenPart,
                challengeTarget - challengeGivenPart + 1,
                challengeTarget - challengeGivenPart + 2,
              ]
                .filter((n) => n >= 0 && n <= 10)
                .sort((a, b) => a - b)
                .map((ans) => (
                  <button
                    key={ans}
                    onClick={() => handleChallengeAnswer(ans)}
                    className={`py-3 rounded-2xl font-black text-xl border transition active:scale-95 ${
                      challengeUserPart === ans
                        ? challengeFeedback
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750'
                    }`}
                  >
                    {language === 'np' ? NEP_DIGITS[ans] : ans}
                  </button>
                ))}
            </div>

            {challengeFeedback && (
              <div className="flex justify-end w-full pt-2">
                <button
                  onClick={() => {
                    const newTotals = [5, 6, 7, 8, 9, 10];
                    const randTot = newTotals[Math.floor(Math.random() * newTotals.length)];
                    const randPart = Math.floor(Math.random() * (randTot + 1));
                    setChallengeTarget(randTot);
                    setChallengeGivenPart(randPart);
                    setChallengeUserPart(null);
                    setChallengeFeedback(null);
                    playSound('click');
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition"
                >
                  {language === 'np' ? 'अर्को चुनौती' : 'Next Challenge'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

