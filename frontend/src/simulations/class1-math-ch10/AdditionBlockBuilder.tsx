/**
 * AdditionBlockBuilder.tsx
 * Simulation 04: Addition Block Builder
 * Class 1 Mathematics - Chapter 10: Addition up to 20
 * Nepal Digital Education Platform
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Boxes,
  Layers,
  HelpCircle,
  Award,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_NUMERALS: Record<number, string> = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
  6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: '11', 12: '12', 13: '13', 14: '14', 15: '15',
  16: '16', 17: '17', 18: '18', 19: '19', 20: '20',
};

type BuilderMode = 'DUAL_TEN_FRAME' | 'COLOUR_ADDITION' | 'THREE_GROUPS' | 'QUIZ';

interface BlockProblem {
  a: number; // Red
  b: number; // Blue
  c?: number; // Green (for three groups)
  sum: number;
}

interface QuizItem {
  id: number;
  questionNp: string;
  questionEn: string;
  options: number[];
  correct: number;
  explanationNp: string;
  explanationEn: string;
}

export const AdditionBlockBuilder: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('en');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Mode
  const [mode, setMode] = useState<BuilderMode>('DUAL_TEN_FRAME');

  // ==========================================
  // MODE 1: DUAL TEN-FRAME BUILDER (Red + Blue)
  // ==========================================
  const problems: BlockProblem[] = useMemo(
    () => [
      { a: 9, b: 6, sum: 15 },
      { a: 8, b: 7, sum: 15 },
      { a: 7, b: 8, sum: 15 },
      { a: 9, b: 5, sum: 14 },
      { a: 10, b: 9, sum: 19 },
      { a: 8, b: 5, sum: 13 },
      { a: 9, b: 8, sum: 17 },
    ],
    []
  );
  const [probIdx, setProbIdx] = useState(0);
  const currentProb = problems[probIdx];

  // Ten-Frame arrangement state
  // Frame 1 has 10 cells, Frame 2 has 10 cells (Total 20 cells)
  // Cells hold: null | 'RED' | 'BLUE' | 'GREEN'
  const [cells, setCells] = useState<(string | null)[]>(() => {
    const arr = Array(20).fill(null);
    for (let i = 0; i < 9; i++) arr[i] = 'RED';
    for (let i = 9; i < 15; i++) arr[i] = 'BLUE';
    return arr;
  });

  // Re-initialize cells when problem changes
  useEffect(() => {
    const arr = Array(20).fill(null);
    for (let i = 0; i < currentProb.a; i++) arr[i] = 'RED';
    for (let i = currentProb.a; i < currentProb.a + currentProb.b; i++) arr[i] = 'BLUE';
    setCells(arr);
  }, [probIdx, currentProb]);

  // ==========================================
  // MODE 2: THREE GROUPS ADDITION
  // ==========================================
  const threeGroupProblems: BlockProblem[] = useMemo(
    () => [
      { a: 5, b: 6, c: 4, sum: 15 },
      { a: 4, b: 6, c: 5, sum: 15 },
      { a: 7, b: 3, c: 6, sum: 16 },
      { a: 8, b: 2, c: 7, sum: 17 },
      { a: 6, b: 4, c: 8, sum: 18 },
    ],
    []
  );
  const [threeIdx, setThreeIdx] = useState(0);
  const currentThree = threeGroupProblems[threeIdx];

  // ==========================================
  // MODE 3: QUIZ EVALUATION (10 QUESTIONS)
  // ==========================================
  const quizList: QuizItem[] = useMemo(
    () => [
      {
        id: 1,
        questionNp: '9 वटा राता ब्लक र 6 वटा नीला ब्लक मिलाउँदा जम्मा कति हुन्छ?',
        questionEn: 'How many blocks in total when combining 9 red and 6 blue blocks?',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '9 + 6 = 15 हुन्छ।',
        explanationEn: '9 + 6 = 15 (Fifteen).',
      },
      {
        id: 2,
        questionNp: 'पहिलो दश-कोठे घरमा 10 ओटा र दोस्रो घरमा 5 ओटा ब्लक हुँदा जम्मा कति भयो?',
        questionEn: 'If Frame 1 has 10 blocks and Frame 2 has 5 blocks, what is the total?',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '10 + 5 = 15 हुन्छ।',
        explanationEn: '10 + 5 = 15.',
      },
      {
        id: 3,
        questionNp: '8 + 7 को जोडफल कति हुन्छ?',
        questionEn: 'What is the sum of 8 + 7?',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '8 + 7 = 15 हुन्छ।',
        explanationEn: '8 + 7 = 15.',
      },
      {
        id: 4,
        questionNp: '5 + 6 + 4 जोड्दा कति आउँछ?',
        questionEn: 'What is 5 + 6 + 4?',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '6 र 4 जोड्दा 10 हुन्छ, 10 + 5 = 15।',
        explanationEn: '6 + 4 = 10, 10 + 5 = 15.',
      },
      {
        id: 5,
        questionNp: '10 वटा राता र 9 वटा नीला ब्लक जोड्दा कति हुन्छ?',
        questionEn: '10 red blocks and 9 blue blocks make how many?',
        options: [18, 19, 20],
        correct: 19,
        explanationNp: '10 + 9 = 19 हुन्छ।',
        explanationEn: '10 + 9 = 19 (Nineteen).',
      },
      {
        id: 6,
        questionNp: '9 + 5 को जोडफल कति हो?',
        questionEn: 'What is 9 + 5?',
        options: [13, 14, 15],
        correct: 14,
        explanationNp: '9 + 5 = 14 हुन्छ।',
        explanationEn: '9 + 5 = 14 (Fourteen).',
      },
      {
        id: 7,
        questionNp: '7 + 3 + 6 जोड्दा कति हुन्छ?',
        questionEn: 'What is the total of 7 + 3 + 6?',
        options: [15, 16, 17],
        correct: 16,
        explanationNp: '7 + 3 = 10, 10 + 6 = 16।',
        explanationEn: '7 + 3 = 10, 10 + 6 = 16.',
      },
      {
        id: 8,
        questionNp: '9 + 8 को मान कति हुन्छ?',
        questionEn: 'What is the sum of 9 + 8?',
        options: [16, 17, 18],
        correct: 17,
        explanationNp: '9 + 8 = 17 हुन्छ।',
        explanationEn: '9 + 8 = 17 (Seventeen).',
      },
      {
        id: 9,
        questionNp: '8 + 2 + 7 जोड्दा कति हुन्छ?',
        questionEn: 'What is 8 + 2 + 7?',
        options: [16, 17, 18],
        correct: 17,
        explanationNp: '8 + 2 = 10, 10 + 7 = 17।',
        explanationEn: '8 + 2 = 10, 10 + 7 = 17.',
      },
      {
        id: 10,
        questionNp: '10 ओटाको पूरा घर र 6 ओटाको समूह मिलेर कति बन्छ?',
        questionEn: 'A full frame of 10 and a group of 6 make what number?',
        options: [15, 16, 17],
        correct: 16,
        explanationNp: '10 + 6 = 16 बन्दछ।',
        explanationEn: '10 + 6 = 16 (Sixteen).',
      },
    ],
    []
  );

  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Audio Synthesizer
  const playSound = useCallback(
    (type: 'click' | 'block' | 'success' | 'fanfare' | 'boop') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();

        if (type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'block') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(320, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.12);
        } else if (type === 'success') {
          [523.25, 659.25, 783.99].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = ctx.currentTime + idx * 0.08;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.14, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.3);
          });
        } else if (type === 'fanfare') {
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = ctx.currentTime + idx * 0.1;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.18, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.4);
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

  // Progress API
  const recordProgress = useCallback(async (score: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH10-04/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSpentSeconds: 150,
          metrics: {
            blockBuilderScore: score,
            starsAwarded: Math.min(3, Math.ceil(score / 3.3)),
          },
        }),
      });
    } catch (err) {}
  }, []);

  // Dual Ten-Frame Actions
  const handleNextProblem = () => {
    playSound('click');
    setProbIdx((prev) => (prev + 1) % problems.length);
  };

  // Three Groups Actions
  const handleNextThree = () => {
    playSound('click');
    setThreeIdx((prev) => (prev + 1) % threeGroupProblems.length);
  };

  // Quiz Actions
  const handleQuizAnswer = (opt: number) => {
    if (quizAnswered) return;
    setQuizSelected(opt);
    setQuizAnswered(true);
    const q = quizList[quizIdx];

    if (opt === q.correct) {
      playSound('success');
      setQuizScore((prev) => prev + 1);
      speak('स्याबास! सही उत्तर।', 'Well done! Correct answer.');
    } else {
      playSound('boop');
      speak('मिलेन। सही उत्तर हेर्नुहोस्।', 'Incorrect. Check the explanation.');
    }
  };

  const handleQuizNext = () => {
    playSound('click');
    if (quizIdx + 1 < quizList.length) {
      setQuizIdx((prev) => prev + 1);
      setQuizAnswered(false);
      setQuizSelected(null);
    } else {
      setQuizCompleted(true);
      playSound('fanfare');
      recordProgress(quizScore);
    }
  };

  const handleQuizReset = () => {
    playSound('click');
    setQuizIdx(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setQuizSelected(null);
    setQuizCompleted(false);
  };

  const frame1Count = cells.slice(0, 10).filter(Boolean).length;
  const frame2Count = cells.slice(10, 20).filter(Boolean).length;

  return (
    <div className="relative w-full h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 bg-white backdrop-blur border-b border-slate-200 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLibrary}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700"
            title="Back to Chapter 10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 font-semibold">
                Class 1 • Math • Chapter 10
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 font-semibold">
                Simulation 04
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {language === 'np' ? 'जोड ब्लक निर्माण खेल (दश-कोठे घरहरू)' : 'Addition Block Builder'}
            </h1>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60 text-xs">
          <button
            onClick={() => {
              playSound('click');
              setMode('DUAL_TEN_FRAME');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              mode === 'DUAL_TEN_FRAME' ? 'bg-rose-600 text-white shadow' : 'text-slate-600 hover:bg-white'
            }`}
          >
            {language === 'np' ? 'दश-कोठे घरहरू' : 'Dual Ten-Frames'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setMode('THREE_GROUPS');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              mode === 'THREE_GROUPS' ? 'bg-amber-600 text-white shadow' : 'text-slate-600 hover:bg-white'
            }`}
          >
            {language === 'np' ? '3 समूहको जोड' : 'Three Groups'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setMode('QUIZ');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              mode === 'QUIZ' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {language === 'np' ? 'परीक्षा' : 'Quiz'}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-100 transition text-slate-700"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-700" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>
          
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        {/* ========================================================================= */}
        {/* MODE 1: DUAL TEN-FRAME HOUSES */}
        {/* ========================================================================= */}
        {mode === 'DUAL_TEN_FRAME' && (
          <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full justify-center gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-rose-400 tracking-wider">
                    {language === 'np' ? 'रातो र नीलो ब्लक जोड' : 'Red & Blue Block Addition'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                    {NEP_NUMERALS[currentProb.a]} (red) + {NEP_NUMERALS[currentProb.b]} (blue) = {NEP_NUMERALS[currentProb.sum]} ({currentProb.a} + {currentProb.b} = {currentProb.sum})
                  </h3>
                </div>

                <button
                  onClick={handleNextProblem}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को समस्या' : 'Next Problem'}
                </button>
              </div>

              {/* Two Ten-Frame Houses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Frame 1: Complete Ten */}
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-emerald-500/40 flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      {language === 'np' ? 'पहिलो घर (पूरा 10)' : 'First House (Full 10)'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-full">
                      {NEP_NUMERALS[frame1Count]} / 10
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {cells.slice(0, 10).map((color, idx) => (
                      <div
                        key={idx}
                        className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center font-black text-sm shadow ${
                          color === 'RED'
                            ? 'bg-rose-500 text-white border-rose-300'
                            : color === 'BLUE'
                            ? 'bg-sky-500 text-white border-sky-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {color ? NEP_NUMERALS[idx + 1] : ''}
                      </div>
                    ))}
                  </div>

                  <span className="text-xs text-emerald-700 font-bold mt-3">
                    {language === 'np' ? '1 पूरा दश = 10' : '1 Full Ten = 10'}
                  </span>
                </div>

                {/* Frame 2: Remaining ones */}
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-amber-500/40 flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                      {language === 'np' ? 'दोस्रो घर (बाँकी एकाइ)' : 'Second House (Remaining)'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-full">
                      {NEP_NUMERALS[frame2Count]} / 10
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {cells.slice(10, 20).map((color, idx) => (
                      <div
                        key={idx + 10}
                        className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center font-black text-sm shadow ${
                          color === 'RED'
                            ? 'bg-rose-500 text-white border-rose-300'
                            : color === 'BLUE'
                            ? 'bg-sky-500 text-white border-sky-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {color ? NEP_NUMERALS[idx + 11] : ''}
                      </div>
                    ))}
                  </div>

                  <span className="text-xs text-amber-700 font-bold mt-3">
                    {language === 'np' ? `थप एकाइ = ${NEP_NUMERALS[frame2Count]}` : `Remaining = ${frame2Count}`}
                  </span>
                </div>
              </div>

              {/* Bottom Equation Summary */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-700 font-bold">
                    {language === 'np' ? 'समीकरण:' : 'Equation:'}
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    10 + {NEP_NUMERALS[frame2Count]} ={' '}
                    <span className="text-amber-700">{NEP_NUMERALS[currentProb.sum]}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-700 font-bold border border-rose-500/40">
                    {NEP_NUMERALS[currentProb.a]} red
                  </span>
                  <span>+</span>
                  <span className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-700 font-bold border border-sky-500/40">
                    {NEP_NUMERALS[currentProb.b]} blue
                  </span>
                  <span>=</span>
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-700 font-black border border-amber-500/40">
                    {NEP_NUMERALS[currentProb.sum]} total
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: THREE GROUPS ADDITION */}
        {/* ========================================================================= */}
        {mode === 'THREE_GROUPS' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full justify-center">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-700 tracking-wider">
                    {language === 'np' ? '3 समूहको रङ्गीन ब्लक जोड' : 'Three Group Color Addition'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">
                    {NEP_NUMERALS[currentThree.a]} (red) + {NEP_NUMERALS[currentThree.b]} (blue) + {NEP_NUMERALS[currentThree.c!]} (yellow) = {NEP_NUMERALS[currentThree.sum]}
                  </h3>
                </div>

                <button
                  onClick={handleNextThree}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को समस्या' : 'Next'}
                </button>
              </div>

              {/* Three Color Groups */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Group A */}
                <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex flex-col items-center">
                  <span className="text-xs font-bold text-rose-700 uppercase mb-2">
                    {language === 'np' ? `रातो (${NEP_NUMERALS[currentThree.a]})` : `Red (${currentThree.a})`}
                  </span>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {Array.from({ length: currentThree.a }).map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-lg bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow">
                        {NEP_NUMERALS[i + 1]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group B */}
                <div className="p-4 bg-sky-950/40 border border-sky-500/40 rounded-2xl flex flex-col items-center">
                  <span className="text-xs font-bold text-sky-700 uppercase mb-2">
                    {language === 'np' ? `नीलो (${NEP_NUMERALS[currentThree.b]})` : `Blue (${currentThree.b})`}
                  </span>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {Array.from({ length: currentThree.b }).map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-lg bg-sky-500 text-white font-bold text-xs flex items-center justify-center shadow">
                        {NEP_NUMERALS[i + 1]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group C */}
                <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex flex-col items-center">
                  <span className="text-xs font-bold text-amber-700 uppercase mb-2">
                    {language === 'np' ? `पहेंलो (${NEP_NUMERALS[currentThree.c!]})` : `Yellow (${currentThree.c})`}
                  </span>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {Array.from({ length: currentThree.c! }).map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow">
                        {NEP_NUMERALS[i + 1]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-center text-2xl font-black text-amber-700">
                {NEP_NUMERALS[currentThree.a]} + {NEP_NUMERALS[currentThree.b]} + {NEP_NUMERALS[currentThree.c!]} = {NEP_NUMERALS[currentThree.sum]}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: QUIZ EVALUATION */}
        {/* ========================================================================= */}
        {mode === 'QUIZ' && (
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full justify-center">
            {!quizCompleted ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-3">
                  <span className="font-bold text-rose-400">
                    {language === 'np'
                      ? `प्रश्न ${NEP_NUMERALS[quizIdx + 1]} / ${NEP_NUMERALS[quizList.length]}`
                      : `Question ${quizIdx + 1} of ${quizList.length}`}
                  </span>
                  <span>
                    {language === 'np' ? `अङ्क: ${NEP_NUMERALS[quizScore]}` : `Score: ${quizScore}`}
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-slate-900">
                  {language === 'np' ? quizList[quizIdx].questionNp : quizList[quizIdx].questionEn}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {quizList[quizIdx].options.map((opt) => {
                    const isSelected = quizSelected === opt;
                    const isCorrectOpt = opt === quizList[quizIdx].correct;
                    let btnStyle = 'bg-slate-100 hover:bg-slate-100 text-slate-900';

                    if (quizAnswered) {
                      if (isCorrectOpt) {
                        btnStyle = 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-500/30';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-600 text-white font-black';
                      } else {
                        btnStyle = 'bg-white text-slate-500 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        disabled={quizAnswered}
                        onClick={() => handleQuizAnswer(opt)}
                        className={`p-4 rounded-2xl text-xl font-bold transition flex flex-col items-center justify-center gap-1 border border-slate-300 ${btnStyle}`}
                      >
                        <span className="text-3xl">{NEP_NUMERALS[opt]}</span>
                        <span className="text-xs opacity-75">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {quizAnswered && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <p className="font-bold text-rose-400 mb-1">
                      {language === 'np' ? 'व्याख्या:' : 'Explanation:'}
                    </p>
                    <p>
                      {language === 'np' ? quizList[quizIdx].explanationNp : quizList[quizIdx].explanationEn}
                    </p>
                  </div>
                )}

                {quizAnswered && (
                  <button
                    onClick={handleQuizNext}
                    className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white border-2 border-rose-500/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <Award className="w-10 h-10 text-rose-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {language === 'np' ? 'बधाई छ! परीक्षा सम्पन्न भयो!' : 'Congratulations! Assessment Complete!'}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    {language === 'np'
                      ? 'तपाईंले दश-कोठे घरमा रङ्गीन ब्लकहरू भरेर 20 सम्मको जोड गर्न सिक्नुभयो।'
                      : 'You have mastered ten-frame houses and block addition up to 20.'}
                  </p>
                </div>

                <div className="text-4xl font-black text-rose-400">
                  {NEP_NUMERALS[quizScore]} / {NEP_NUMERALS[quizList.length]}
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleQuizReset}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition"
                  >
                    {language === 'np' ? 'पुनः परीक्षा दिनुहोस्' : 'Retake Quiz'}
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setMode('DUAL_TEN_FRAME');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'दश-कोठे घरमा फर्कनुहोस्' : 'Back to Builder'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

