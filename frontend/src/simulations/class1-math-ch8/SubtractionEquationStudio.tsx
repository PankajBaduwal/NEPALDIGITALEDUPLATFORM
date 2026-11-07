/**
 * SubtractionEquationStudio.tsx
 * Simulation 03: Subtraction Equation Studio (घटाउ वाक्य निर्माण प्रयोगशाला)
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
  Minus,
  Equal,
  Calculator,
  LayoutGrid,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];

type TaskFormat = 'HORIZONTAL' | 'VERTICAL' | 'MISSING_PART' | 'MISSING_START';

interface SubtractionTask {
  id: string;
  format: TaskFormat;
  itemEmoji: string;
  total: number;
  takeAway: number;
  descriptionNp: string;
  descriptionEn: string;
}

const SUB_TASKS: SubtractionTask[] = [
  {
    id: 'st-1',
    format: 'HORIZONTAL',
    itemEmoji: '🍎',
    total: 5,
    takeAway: 2,
    descriptionNp: '५ वटा स्याउबाट २ वटा स्याउ घटाउँदा कति बाँकी रहन्छ?',
    descriptionEn: 'What is 5 − 2 = ?',
  },
  {
    id: 'st-2',
    format: 'HORIZONTAL',
    itemEmoji: '🍌',
    total: 8,
    takeAway: 4,
    descriptionNp: '८ वटा केराबाट ४ वटा केरा घटाउँदा कति बाँकी रहन्छ?',
    descriptionEn: 'What is 8 − 4 = ?',
  },
  {
    id: 'st-3',
    format: 'HORIZONTAL',
    itemEmoji: '⚽',
    total: 10,
    takeAway: 3,
    descriptionNp: '१० वटा बलबाट ३ वटा बल घटाउँदा कति बाँकी हुन्छ?',
    descriptionEn: 'What is 10 − 3 = ?',
  },
  {
    id: 'st-4',
    format: 'VERTICAL',
    itemEmoji: '🌸',
    total: 7,
    takeAway: 3,
    descriptionNp: 'ठाडो घटाउ गर्नुहोस्: ७ बाट ३ घटाउनुहोस्।',
    descriptionEn: 'Perform vertical subtraction: 7 minus 3.',
  },
  {
    id: 'st-5',
    format: 'VERTICAL',
    itemEmoji: '🥭',
    total: 9,
    takeAway: 5,
    descriptionNp: 'ठाडो घटाउ गर्नुहोस्: ९ बाट ५ घटाउनुहोस्।',
    descriptionEn: 'Perform vertical subtraction: 9 minus 5.',
  },
  {
    id: 'st-6',
    format: 'MISSING_PART',
    itemEmoji: '⭐',
    total: 6,
    takeAway: 2,
    descriptionNp: 'खाली ठाउँ भर्नुहोस्: ६ − [ ? ] = ४',
    descriptionEn: 'Find the missing number: 6 − [ ? ] = 4',
  },
  {
    id: 'st-7',
    format: 'MISSING_START',
    itemEmoji: '🐦',
    total: 7,
    takeAway: 2,
    descriptionNp: 'खाली ठाउँ भर्नुहोस्: [ ? ] − २ = ५',
    descriptionEn: 'Find the starting number: [ ? ] − 2 = 5',
  },
  {
    id: 'st-8',
    format: 'MISSING_PART',
    itemEmoji: '🥕',
    total: 8,
    takeAway: 5,
    descriptionNp: 'खाली ठाउँ भर्नुहोस्: ८ − [ ? ] = ३',
    descriptionEn: 'Find the missing number: 8 − [ ? ] = 3',
  },
];

export const SubtractionEquationStudio: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active task tracking
  const [taskIndex, setTaskIndex] = useState<number>(0);
  const currentTask = SUB_TASKS[taskIndex];

  // User entered card
  const [userSelected, setUserSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  // Audio synthesis
  const playSound = useCallback(
    (type: 'click' | 'success' | 'boop' | 'fanfare', step?: number) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400 + (step || 1) * 40, ctx.currentTime);
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

  useEffect(() => {
    setUserSelected(null);
    setIsCorrect(null);
    speak(currentTask.descriptionNp, currentTask.descriptionEn);
  }, [taskIndex, currentTask, speak]);

  const targetAnswer =
    currentTask.format === 'MISSING_PART'
      ? currentTask.takeAway
      : currentTask.format === 'MISSING_START'
      ? currentTask.total
      : currentTask.total - currentTask.takeAway;

  const handleSelectOption = (num: number) => {
    setUserSelected(num);
    const correct = num === targetAnswer;
    setIsCorrect(correct);

    if (correct) {
      playSound('success');
      setScore((s) => s + 1);
      speak(
        `स्याबास! उत्तर ${num} सही हो!`,
        `Excellent! ${num} is correct!`
      );
    } else {
      playSound('boop');
      speak('पुनः गनेर हेर्नुहोस्।', 'Please count again carefully.');
    }
  };

  const persistProgress = async (finalScore: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(
        '/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH8-03/progress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            timeSpentSeconds: 110,
            metrics: {
              equationStudioScore: finalScore,
              tasksCompleted: SUB_TASKS.length,
            },
          }),
        }
      );
    } catch (e) {}
  };

  const handleNext = () => {
    playSound('click');
    if (taskIndex < SUB_TASKS.length - 1) {
      setTaskIndex((i) => i + 1);
    } else {
      setCompleted(true);
      playSound('success');
      persistProgress(score + 1);
    }
  };

  const options = [targetAnswer - 1, targetAnswer, targetAnswer + 1]
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
              Class 1 • Math • Chapter 8 • Simulation 03
            </span>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              {language === 'np' ? 'घटाउ वाक्य निर्माण प्रयोगशाला' : 'Subtraction Equation Studio'}
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

      {/* Main Studio Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-slate-950">
        {!completed ? (
          <div className="w-full max-w-3xl bg-slate-850/90 border-4 border-amber-800/80 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
            {/* Banner */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {language === 'np'
                  ? `अभ्यास ${NEP_DIGITS[taskIndex + 1]} / ${NEP_DIGITS[SUB_TASKS.length]}`
                  : `Task ${taskIndex + 1} of ${SUB_TASKS.length}`}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                {currentTask.format === 'VERTICAL'
                  ? language === 'np'
                    ? 'ठाडो घटाउ'
                    : 'Vertical Subtraction'
                  : currentTask.format === 'HORIZONTAL'
                  ? language === 'np'
                    ? 'तेर्सो घटाउ'
                    : 'Horizontal Subtraction'
                  : language === 'np'
                  ? 'खाली ठाउँ भरौँ'
                  : 'Missing Number'}
              </span>
            </div>

            {/* Visual Object Representation */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-xs text-slate-400 mb-2">
                {language === 'np'
                  ? `जम्मा ${NEP_DIGITS[currentTask.total]} वस्तुहरू (${NEP_DIGITS[currentTask.takeAway]} हटाइयो):`
                  : `Total ${currentTask.total} objects (${currentTask.takeAway} removed):`}
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: currentTask.total }).map((_, i) => {
                  const isRemoved = i < currentTask.takeAway;
                  return (
                    <span
                      key={i}
                      className={`text-3xl p-1 transition ${
                        isRemoved ? 'opacity-25 line-through grayscale scale-90' : 'drop-shadow'
                      }`}
                    >
                      {currentTask.itemEmoji}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* ── EQUATION DISPLAY (Horizontal vs Vertical) ─────────── */}
            {currentTask.format === 'VERTICAL' ? (
              /* Vertical Subtraction Layout */
              <div className="flex justify-center py-2">
                <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-5 flex flex-col items-end w-44 font-black text-3xl">
                  <div className="text-amber-400">
                    {language === 'np' ? NEP_DIGITS[currentTask.total] : currentTask.total}
                  </div>
                  <div className="flex items-center gap-3 text-rose-400">
                    <Minus className="w-6 h-6 stroke-[3]" />
                    <span>
                      {language === 'np'
                        ? NEP_DIGITS[currentTask.takeAway]
                        : currentTask.takeAway}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-500 my-2" />
                  <div
                    className={`w-full py-1 text-center rounded-xl border ${
                      userSelected !== null
                        ? isCorrect
                          ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                          : 'bg-rose-600/30 border-rose-400 text-rose-300'
                        : 'bg-slate-800 border-dashed border-slate-600 text-slate-500'
                    }`}
                  >
                    {userSelected !== null
                      ? language === 'np'
                        ? NEP_DIGITS[userSelected]
                        : userSelected
                      : '?'}
                  </div>
                </div>
              </div>
            ) : (
              /* Horizontal Subtraction Layout */
              <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-4 md:p-6 flex items-center justify-center gap-3 md:gap-5 text-2xl md:text-3xl font-black">
                {/* Slot 1: Total */}
                {currentTask.format === 'MISSING_START' ? (
                  <div className="w-14 h-16 md:w-18 md:h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-amber-400 text-amber-400 flex items-center justify-center">
                    {userSelected !== null
                      ? language === 'np'
                        ? NEP_DIGITS[userSelected]
                        : userSelected
                      : '?'}
                  </div>
                ) : (
                  <div className="w-14 h-16 md:w-18 md:h-20 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                    {language === 'np' ? NEP_DIGITS[currentTask.total] : currentTask.total}
                  </div>
                )}

                {/* Minus Symbol (−) */}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-600/30 border border-rose-400 text-rose-300 flex items-center justify-center">
                  −
                </div>

                {/* Slot 2: TakeAway */}
                {currentTask.format === 'MISSING_PART' ? (
                  <div className="w-14 h-16 md:w-18 md:h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-rose-400 text-rose-400 flex items-center justify-center">
                    {userSelected !== null
                      ? language === 'np'
                        ? NEP_DIGITS[userSelected]
                        : userSelected
                      : '?'}
                  </div>
                ) : (
                  <div className="w-14 h-16 md:w-18 md:h-20 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg">
                    {language === 'np'
                      ? NEP_DIGITS[currentTask.takeAway]
                      : currentTask.takeAway}
                  </div>
                )}

                {/* Equals Symbol (=) */}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-600/30 border border-emerald-400 text-emerald-300 flex items-center justify-center">
                  =
                </div>

                {/* Slot 3: Remainder */}
                {currentTask.format === 'HORIZONTAL' ? (
                  <div className="w-14 h-16 md:w-18 md:h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-emerald-400 text-emerald-400 flex items-center justify-center">
                    {userSelected !== null
                      ? language === 'np'
                        ? NEP_DIGITS[userSelected]
                        : userSelected
                      : '?'}
                  </div>
                ) : (
                  <div className="w-14 h-16 md:w-18 md:h-20 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg">
                    {language === 'np'
                      ? NEP_DIGITS[currentTask.total - currentTask.takeAway]
                      : currentTask.total - currentTask.takeAway}
                  </div>
                )}
              </div>
            )}

            {/* Answer Selector Options */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-300 text-center font-bold">
                {language === 'np' ? 'सही सङ्ख्या छान्नुहोस्:' : 'Select the correct number:'}
              </span>
              <div className="grid grid-cols-3 gap-3">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`py-3 rounded-2xl font-black text-2xl border transition active:scale-95 ${
                      userSelected === opt
                        ? isCorrect
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
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
                  {taskIndex < SUB_TASKS.length - 1
                    ? language === 'np'
                      ? 'अर्को वाक्य'
                      : 'Next Task'
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
              {language === 'np' ? 'घटाउ वाक्य निर्माण सम्पन्न भयो!' : 'All Equations Mastered!'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'np'
                ? 'तपाईंले तेर्सो, ठाडो र खाली ठाउँ भर्ने घटाउ अभ्यास सफलतापूर्वक हल गर्नुभयो।'
                : 'You successfully mastered horizontal, vertical, and missing-number equations.'}
            </p>
            <div className="flex gap-2 w-full pt-2">
              <button
                onClick={() => {
                  setTaskIndex(0);
                  setUserSelected(null);
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

