/**
 * DifferenceExplorer.tsx
 * Simulation 04: More or Less – Difference Explorer (बढी र कम पत्ता लगाऔँ)
 * Class 1 Mathematics - Chapter 8: Subtraction up to 10 (१० सम्मका सङ्ख्याहरूको घटाउ)
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
  Scale,
  Minus,
  Equal,
  Link2,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];

interface ComparisonActivity {
  id: string;
  itemA: { emoji: string; nameNp: string; nameEn: string; count: number };
  itemB: { emoji: string; nameNp: string; nameEn: string; count: number };
  questionType: 'MORE' | 'FEWER';
  questionNp: string;
  questionEn: string;
}

const COMPARISON_ACTIVITIES: ComparisonActivity[] = [
  {
    id: 'comp-1',
    itemA: { emoji: '👦', nameNp: 'केटा', nameEn: 'Boys', count: 5 },
    itemB: { emoji: '👧', nameNp: 'केटी', nameEn: 'Girls', count: 3 },
    questionType: 'MORE',
    questionNp: 'केटीहरूभन्दा केटाहरू कति जना बढी छन्?',
    questionEn: 'How many more boys are there than girls?',
  },
  {
    id: 'comp-2',
    itemA: { emoji: '🚲', nameNp: 'साइकल', nameEn: 'Bicycles', count: 6 },
    itemB: { emoji: '🧒', nameNp: 'बच्चाहरू', nameEn: 'Children', count: 4 },
    questionType: 'MORE',
    questionNp: 'बच्चाहरूभन्दा साइकल कति वटा बढी छन्?',
    questionEn: 'How many more bicycles are there than children?',
  },
  {
    id: 'comp-3',
    itemA: { emoji: '🍎', nameNp: 'स्याउ', nameEn: 'Apples', count: 7 },
    itemB: { emoji: '🍌', nameNp: 'केरा', nameEn: 'Bananas', count: 5 },
    questionType: 'FEWER',
    questionNp: 'स्याउभन्दा केरा कति वटा कम छन्?',
    questionEn: 'How many fewer bananas are there than apples?',
  },
  {
    id: 'comp-4',
    itemA: { emoji: '🌸', nameNp: 'फूलहरू', nameEn: 'Flowers', count: 8 },
    itemB: { emoji: '🦋', nameNp: 'पुतलीहरू', nameEn: 'Butterflies', count: 5 },
    questionType: 'MORE',
    questionNp: 'पुतलीभन्दा फूलहरू कति वटा बढी छन्?',
    questionEn: 'How many more flowers are there than butterflies?',
  },
  {
    id: 'comp-5',
    itemA: { emoji: '🐱', nameNp: 'बिराला', nameEn: 'Cats', count: 4 },
    itemB: { emoji: '🐶', nameNp: 'कुकुर', nameEn: 'Dogs', count: 4 },
    questionType: 'MORE',
    questionNp: 'दुवै समूहमा बराबर छन्। संख्यात्मक फरक कति हो?',
    questionEn: 'Both groups are equal. What is the difference?',
  },
];

export const DifferenceExplorer: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active comparison index
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentComp = COMPARISON_ACTIVITIES[currentIndex];

  // One-to-one matched pairs animation state
  const [isMatched, setIsMatched] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  // Audio synthesis
  const playSound = useCallback(
    (type: 'click' | 'match' | 'success' | 'boop' | 'fanfare') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.06);
        } else if (type === 'match') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
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

  useEffect(() => {
    setIsMatched(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    speak(currentComp.questionNp, currentComp.questionEn);
  }, [currentIndex, currentComp, speak]);

  const largerCount = Math.max(currentComp.itemA.count, currentComp.itemB.count);
  const smallerCount = Math.min(currentComp.itemA.count, currentComp.itemB.count);
  const correctDifference = largerCount - smallerCount;

  const handleMatchPairs = () => {
    playSound('match');
    setIsMatched(true);
    speak(
      `एक-एक जोडा मिलाउँदा ${correctDifference} वटा जोडा नमिली बाँकी रहे।`,
      `Matching one-to-one shows ${correctDifference} unmatched items as the difference.`
    );
  };

  const handleSelectOption = (ans: number) => {
    setSelectedAnswer(ans);
    const correct = ans === correctDifference;
    setIsCorrect(correct);

    if (correct) {
      playSound('success');
      setScore((s) => s + 1);
      speak(
        `स्याबास! संख्यात्मक फरक ${ans} हो (${largerCount} − ${smallerCount} = ${ans})!`,
        `Correct! The difference is ${ans} (${largerCount} − ${smallerCount} = ${ans})!`
      );
    } else {
      playSound('boop');
      speak('जोडा नमिलेका वस्तुहरू गन्नुहोस्।', 'Count the unmatched items.');
    }
  };

  const persistProgress = async (finalScore: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(
        '/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH8-04/progress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            timeSpentSeconds: 95,
            metrics: {
              differenceExplorerScore: finalScore,
              comparisonsCompleted: COMPARISON_ACTIVITIES.length,
            },
          }),
        }
      );
    } catch (e) {}
  };

  const handleNext = () => {
    playSound('click');
    if (currentIndex < COMPARISON_ACTIVITIES.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCompleted(true);
      playSound('success');
      persistProgress(score + 1);
    }
  };

  const options = [correctDifference - 1, correctDifference, correctDifference + 1]
    .filter((n) => n >= 0 && n <= 10)
    .sort((a, b) => a - b);

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
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
              Class 1 • Math • Chapter 8 • Simulation 04
            </span>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              {language === 'np' ? 'बढी र कम पत्ता लगाऔँ' : 'More or Less – Difference Explorer'}
            </h1>
          </div>
        </div>

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
        {!completed ? (
          <div className="w-full max-w-3xl bg-slate-850/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
            {/* Banner */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {language === 'np'
                  ? `तुलना ${NEP_DIGITS[currentIndex + 1]} / ${NEP_DIGITS[COMPARISON_ACTIVITIES.length]}`
                  : `Comparison ${currentIndex + 1} of ${COMPARISON_ACTIVITIES.length}`}
              </span>
              <button
                onClick={() => speak(currentComp.questionNp, currentComp.questionEn)}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>{language === 'np' ? 'सुन्नुहोस्' : 'Listen'}</span>
              </button>
            </div>

            <h2 className="text-lg md:text-xl font-bold text-white text-center">
              {language === 'np' ? currentComp.questionNp : currentComp.questionEn}
            </h2>

            {/* Side-by-Side Comparison Grid */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-3xl p-6 flex flex-col gap-4">
              {/* Group A Row */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 w-32">
                  <span className="text-sm font-bold text-amber-300">
                    {language === 'np' ? currentComp.itemA.nameNp : currentComp.itemA.nameEn}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black">
                    {language === 'np' ? NEP_DIGITS[currentComp.itemA.count] : currentComp.itemA.count}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 flex-1 justify-start pl-4">
                  {Array.from({ length: currentComp.itemA.count }).map((_, i) => {
                    const isPaired = isMatched && i < smallerCount;
                    const isUnmatched = isMatched && i >= smallerCount;
                    return (
                      <span
                        key={i}
                        className={`text-3xl p-1.5 rounded-xl transition-all duration-300 ${
                          isPaired
                            ? 'bg-sky-500/20 ring-2 ring-sky-400'
                            : isUnmatched
                            ? 'bg-amber-500/30 ring-2 ring-amber-400 animate-bounce'
                            : ''
                        }`}
                      >
                        {currentComp.itemA.emoji}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Group B Row */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 w-32">
                  <span className="text-sm font-bold text-rose-300">
                    {language === 'np' ? currentComp.itemB.nameNp : currentComp.itemB.nameEn}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black">
                    {language === 'np' ? NEP_DIGITS[currentComp.itemB.count] : currentComp.itemB.count}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 flex-1 justify-start pl-4">
                  {Array.from({ length: currentComp.itemB.count }).map((_, i) => {
                    const isPaired = isMatched && i < smallerCount;
                    return (
                      <span
                        key={i}
                        className={`text-3xl p-1.5 rounded-xl transition-all duration-300 ${
                          isPaired ? 'bg-sky-500/20 ring-2 ring-sky-400' : ''
                        }`}
                      >
                        {currentComp.itemB.emoji}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Match One-to-One Button */}
            {!isMatched && (
              <div className="flex justify-center">
                <button
                  onClick={handleMatchPairs}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-900/40 flex items-center gap-2 active:scale-95 transition"
                >
                  <Link2 className="w-4 h-4" />
                  {language === 'np' ? 'एक-एक जोडा मिलाऔँ' : 'Match Pairs (1-to-1)'}
                </button>
              </div>
            )}

            {/* Live Formula Banner */}
            {isMatched && (
              <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700 flex items-center justify-center gap-4 text-xl font-black">
                <span className="text-amber-400">
                  {language === 'np' ? NEP_DIGITS[largerCount] : largerCount}
                </span>
                <Minus className="w-5 h-5 text-rose-400" />
                <span className="text-rose-400">
                  {language === 'np' ? NEP_DIGITS[smallerCount] : smallerCount}
                </span>
                <Equal className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400">
                  {isCorrect
                    ? language === 'np'
                      ? NEP_DIGITS[correctDifference]
                      : correctDifference
                    : '?'}
                </span>
              </div>
            )}

            {/* Answer Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-300 text-center font-bold">
                {language === 'np' ? 'संख्यात्मक फरक छान्नुहोस्:' : 'Select the numerical difference:'}
              </span>
              <div className="grid grid-cols-3 gap-3">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`py-3 rounded-2xl font-black text-2xl border transition active:scale-95 ${
                      selectedAnswer === opt
                        ? isCorrect
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750'
                    }`}
                  >
                    {language === 'np' ? NEP_DIGITS[opt] : opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Action */}
            {isCorrect && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-rose-900/40 transition"
                >
                  {currentIndex < COMPARISON_ACTIVITIES.length - 1
                    ? language === 'np'
                      ? 'अर्को तुलना'
                      : 'Next Comparison'
                    : language === 'np'
                    ? 'समाप्त गरौँ'
                    : 'Finish'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Completion Summary */
          <div className="w-full max-w-md bg-slate-850 border border-slate-700 rounded-3xl p-6 text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">
              {language === 'np' ? 'सबै तुलना पूरा भए!' : 'All Differences Found!'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'np'
                ? 'तपाईंले दुई समूहबीचको संख्यात्मक फरक (कति बढी / कति कम) पत्ता लगाउन सफलता प्राप्त गर्नुभयो।'
                : 'You successfully compared two groups to find the numerical difference.'}
            </p>
            <div className="flex gap-2 w-full pt-2">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setIsMatched(false);
                  setSelectedAnswer(null);
                  setIsCorrect(null);
                  setCompleted(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'np' ? 'पुनः खेल्नुहोस्' : 'Play Again'}
              </button>
              <button
                onClick={onBackToLibrary}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                {language === 'np' ? 'पुस्तकालय फर्कनुहोस्' : 'Return to Library'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

