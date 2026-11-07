/**
 * AdditionEquationStudio.tsx
 * Simulation 05: Addition Equation Studio (जोडका वाक्य बनाऔँ)
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
  Equal,
  Calculator,
  HelpCircle,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];

interface EquationTask {
  id: string;
  itemEmoji: string;
  countA: number;
  countB: number;
  itemNameNp: string;
  itemNameEn: string;
  missingSlot: 'TOTAL' | 'PART_B' | 'PART_A';
}

const TASKS: EquationTask[] = [
  { id: 'eq-1', itemEmoji: '🍎', countA: 1, countB: 2, itemNameNp: 'स्याउ', itemNameEn: 'Apples', missingSlot: 'TOTAL' },
  { id: 'eq-2', itemEmoji: '🌸', countA: 2, countB: 3, itemNameNp: 'फूल', itemNameEn: 'Flowers', missingSlot: 'TOTAL' },
  { id: 'eq-3', itemEmoji: '🥭', countA: 4, countB: 1, itemNameNp: 'आँप', itemNameEn: 'Mangoes', missingSlot: 'TOTAL' },
  { id: 'eq-4', itemEmoji: '⚽', countA: 5, countB: 2, itemNameNp: 'बल', itemNameEn: 'Balls', missingSlot: 'TOTAL' },
  { id: 'eq-5', itemEmoji: '⭐', countA: 6, countB: 3, itemNameNp: 'तारा', itemNameEn: 'Stars', missingSlot: 'TOTAL' },
  { id: 'eq-6', itemEmoji: '🐟', countA: 7, countB: 2, itemNameNp: 'माछा', itemNameEn: 'Fish', missingSlot: 'TOTAL' },
  { id: 'eq-7', itemEmoji: '🌻', countA: 5, countB: 5, itemNameNp: 'सूर्यमुखी', itemNameEn: 'Sunflowers', missingSlot: 'TOTAL' },
  { id: 'eq-8', itemEmoji: '🍎', countA: 3, countB: 0, itemNameNp: 'स्याउ', itemNameEn: 'Apples', missingSlot: 'TOTAL' },
  { id: 'eq-9', itemEmoji: '🐦', countA: 0, countB: 4, itemNameNp: 'चरा', itemNameEn: 'Birds', missingSlot: 'TOTAL' },
  { id: 'eq-10', itemEmoji: '🍊', countA: 3, countB: 4, itemNameNp: 'सुन्तला', itemNameEn: 'Oranges', missingSlot: 'PART_B' },
];

export const AdditionEquationStudio: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Task Index
  const [taskIndex, setTaskIndex] = useState<number>(0);
  const currentTask = TASKS[taskIndex];

  // User Placed Cards
  const [slotPlus, setSlotPlus] = useState<boolean>(false);
  const [slotEqual, setSlotEqual] = useState<boolean>(false);
  const [slotAnswer, setSlotAnswer] = useState<number | null>(null);

  // Feedback State
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  // Sound generator
  const playSound = useCallback(
    (type: 'click' | 'place' | 'success' | 'boop' | 'fanfare', step?: number) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'click' || type === 'place') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400 + (step || 1) * 50, ctx.currentTime);
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
    setSlotPlus(true);
    setSlotEqual(true);
    setSlotAnswer(null);
    setIsAnswerCorrect(null);
    speak(
      `सङ्ख्या वाक्य बनाउनुहोस्: ${currentTask.countA} + ${currentTask.countB} = ?`,
      `Build the addition equation: ${currentTask.countA} + ${currentTask.countB} = ?`
    );
  }, [taskIndex, currentTask, speak]);

  const targetAnswer =
    currentTask.missingSlot === 'TOTAL'
      ? currentTask.countA + currentTask.countB
      : currentTask.missingSlot === 'PART_B'
      ? currentTask.countB
      : currentTask.countA;

  const handleSelectAnswer = (ans: number) => {
    setSlotAnswer(ans);
    const correct = ans === targetAnswer;
    setIsAnswerCorrect(correct);

    if (correct) {
      playSound('success');
      setScore((s) => s + 1);
      speak(
        `स्याबास! ${currentTask.countA} + ${currentTask.countB} = ${currentTask.countA + currentTask.countB} सही वाक्य हो!`,
        `Excellent! ${currentTask.countA} + ${currentTask.countB} = ${currentTask.countA + currentTask.countB} is correct!`
      );
    } else {
      playSound('boop');
      speak('पुनः गणना गर्नुहोस्।', 'Please check your calculation.');
    }
  };

  const handleNextTask = () => {
    playSound('click');
    if (taskIndex < TASKS.length - 1) {
      setTaskIndex((i) => i + 1);
    } else {
      setCompleted(true);
      playSound('success');
      persistProgress(score + 1);
    }
  };

  const persistProgress = async (finalScore: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(
        '/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH7-05/progress',
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
              tasksCompleted: TASKS.length,
            },
          }),
        }
      );
    } catch (e) {}
  };

  const choiceOptions = [targetAnswer - 1, targetAnswer, targetAnswer + 1]
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
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
              Class 1 • Math • Chapter 7 • Simulation 05
            </span>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              {language === 'np' ? 'जोडका वाक्य बनाऔँ' : 'Addition Equation Studio'}
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

      {/* Main Studio Chalkboard Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-slate-950">
        {!completed ? (
          <div className="w-full max-w-3xl bg-emerald-950/40 border-8 border-amber-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 relative">
            {/* Wooden Chalkboard Frame Corner Screws */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-amber-600/60" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-600/60" />
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-amber-600/60" />
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-amber-600/60" />

            {/* Task Index Banner */}
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {language === 'np'
                  ? `अभ्यास ${NEP_DIGITS[taskIndex + 1]} / ${NEP_DIGITS[TASKS.length]}`
                  : `Equation Task ${taskIndex + 1} of ${TASKS.length}`}
              </span>
              <span className="text-xs text-emerald-300">
                {language === 'np' ? 'सही गणितीय वाक्य पूरा गर्नुहोस्' : 'Complete the addition sentence'}
              </span>
            </div>

            {/* Visual Object Groups Display */}
            <div className="grid grid-cols-2 gap-4 py-2">
              {/* Group A Visuals */}
              <div className="bg-slate-900/60 border border-emerald-800/60 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-xs text-amber-300 font-bold mb-2">
                  {language === 'np' ? 'पहिलो समूह' : 'First Group'}
                </span>
                <div className="flex flex-wrap gap-2 justify-center min-h-[60px] items-center">
                  {currentTask.countA === 0 ? (
                    <span className="text-xs text-slate-500 italic">
                      {language === 'np' ? '(शून्य वस्तु)' : '(Zero objects)'}
                    </span>
                  ) : (
                    Array.from({ length: currentTask.countA }).map((_, i) => (
                      <span key={i} className="text-3xl">
                        {currentTask.itemEmoji}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Group B Visuals */}
              <div className="bg-slate-900/60 border border-emerald-800/60 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-xs text-sky-300 font-bold mb-2">
                  {language === 'np' ? 'दोस्रो समूह' : 'Second Group'}
                </span>
                <div className="flex flex-wrap gap-2 justify-center min-h-[60px] items-center">
                  {currentTask.countB === 0 ? (
                    <span className="text-xs text-slate-500 italic">
                      {language === 'np' ? '(शून्य वस्तु)' : '(Zero objects)'}
                    </span>
                  ) : (
                    Array.from({ length: currentTask.countB }).map((_, i) => (
                      <span key={i} className="text-3xl">
                        {currentTask.itemEmoji}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Equation Card Builder */}
            <div className="bg-slate-900/80 border border-emerald-700/60 rounded-2xl p-4 md:p-6 flex items-center justify-center gap-2 md:gap-4 flex-wrap">
              {/* Part A Card */}
              <div className="w-14 h-16 md:w-18 md:h-20 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl md:text-3xl flex items-center justify-center shadow-lg">
                {language === 'np' ? NEP_DIGITS[currentTask.countA] : currentTask.countA}
              </div>

              {/* Plus Sign (+) */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-600/30 border border-emerald-400 text-emerald-300 font-black text-2xl flex items-center justify-center">
                +
              </div>

              {/* Part B Card */}
              {currentTask.missingSlot === 'PART_B' ? (
                <div className="w-14 h-16 md:w-18 md:h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-sky-400 text-sky-400 font-black text-2xl md:text-3xl flex items-center justify-center shadow-inner">
                  {slotAnswer !== null
                    ? language === 'np'
                      ? NEP_DIGITS[slotAnswer]
                      : slotAnswer
                    : '?'}
                </div>
              ) : (
                <div className="w-14 h-16 md:w-18 md:h-20 rounded-2xl bg-sky-500 text-slate-950 font-black text-2xl md:text-3xl flex items-center justify-center shadow-lg">
                  {language === 'np' ? NEP_DIGITS[currentTask.countB] : currentTask.countB}
                </div>
              )}

              {/* Equals Sign (=) */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-600/30 border border-emerald-400 text-emerald-300 font-black text-2xl flex items-center justify-center">
                =
              </div>

              {/* Total Card */}
              {currentTask.missingSlot === 'TOTAL' ? (
                <div className="w-14 h-16 md:w-18 md:h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-emerald-400 text-emerald-400 font-black text-2xl md:text-3xl flex items-center justify-center shadow-inner">
                  {slotAnswer !== null
                    ? language === 'np'
                      ? NEP_DIGITS[slotAnswer]
                      : slotAnswer
                    : '?'}
                </div>
              ) : (
                <div className="w-14 h-16 md:w-18 md:h-20 rounded-2xl bg-emerald-500 text-slate-950 font-black text-2xl md:text-3xl flex items-center justify-center shadow-lg">
                  {language === 'np'
                    ? NEP_DIGITS[currentTask.countA + currentTask.countB]
                    : currentTask.countA + currentTask.countB}
                </div>
              )}
            </div>

            {/* Number Selector Options for Missing Card */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-emerald-300 text-center font-bold">
                {language === 'np' ? 'खाली स्थानमा सही सङ्ख्या छान्नुहोस्:' : 'Select the missing number:'}
              </span>
              <div className="grid grid-cols-3 gap-3">
                {choiceOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(opt)}
                    className={`py-3 rounded-2xl font-black text-2xl border transition active:scale-95 ${
                      slotAnswer === opt
                        ? isAnswerCorrect
                          ? 'bg-emerald-600 border-emerald-300 text-white shadow-lg shadow-emerald-900/50'
                          : 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    }`}
                  >
                    {language === 'np' ? NEP_DIGITS[opt] : opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Task Action */}
            {isAnswerCorrect && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextTask}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition"
                >
                  {taskIndex < TASKS.length - 1
                    ? language === 'np'
                      ? 'अर्को वाक्य'
                      : 'Next Equation'
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
              {language === 'np' ? 'वाक्य निर्माण सम्पन्न भयो!' : 'All Equations Mastered!'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'np'
                ? 'तपाईंले जोड चिन्ह (+) र बराबर चिन्ह (=) को प्रयोग गरी सही गणितीय वाक्य बनाउनुभयो।'
                : 'You successfully connected objects with plus (+) and equals (=) symbols.'}
            </p>
            <div className="flex gap-2 w-full pt-2">
              <button
                onClick={() => {
                  setTaskIndex(0);
                  setSlotAnswer(null);
                  setIsAnswerCorrect(null);
                  setCompleted(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'np' ? 'पुनः खेल्नुहोस्' : 'Play Again'}
              </button>
              <button
                onClick={onBackToLibrary}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
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

