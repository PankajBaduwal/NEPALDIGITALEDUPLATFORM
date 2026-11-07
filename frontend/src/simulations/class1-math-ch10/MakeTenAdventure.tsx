/**
 * MakeTenAdventure.tsx
 * Simulation 02: Make Ten Adventure (दश बनाएर जोडौँ)
 * Class 1 Mathematics - Chapter 10: Addition up to 20 (योगफल २० सम्म आउने जोड)
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
  GitBranch,
  Grid,
  Lightbulb,
  Award,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_NUMERALS: Record<number, string> = {
  0: '०', 1: '१', 2: '२', 3: '३', 4: '४', 5: '५',
  6: '६', 7: '७', 8: '८', 9: '९', 10: '१०',
  11: '११', 12: '१२', 13: '१३', 14: '१४', 15: '१५',
  16: '१६', 17: '१७', 18: '१८', 19: '१९', 20: '२०',
};

interface MakeTenProblem {
  a: number; // e.g. 8
  b: number; // e.g. 5
  need: number; // 10 - a = 2
  remain: number; // b - need = 3
  sum: number; // 13
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

export const MakeTenAdventure: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Mode: 'EXPLORE_STEPS' | 'SPLIT_PRACTICE' | 'QUIZ'
  const [mode, setMode] = useState<'EXPLORE_STEPS' | 'SPLIT_PRACTICE' | 'QUIZ'>('EXPLORE_STEPS');

  // EXPLORE PROBLEMS
  const problems: MakeTenProblem[] = useMemo(
    () => [
      { a: 8, b: 5, need: 2, remain: 3, sum: 13 },
      { a: 9, b: 4, need: 1, remain: 3, sum: 13 },
      { a: 7, b: 6, need: 3, remain: 3, sum: 13 },
      { a: 6, b: 7, need: 4, remain: 3, sum: 13 },
      { a: 8, b: 6, need: 2, remain: 4, sum: 14 },
      { a: 9, b: 7, need: 1, remain: 6, sum: 16 },
      { a: 7, b: 5, need: 3, remain: 2, sum: 12 },
    ],
    []
  );

  const [problemIdx, setProblemIdx] = useState(0);
  const currentProb = problems[problemIdx];

  // Current Step in Make Ten (1 to 5)
  // Step 1: Initial (Show A and B)
  // Step 2: Need X to make 10
  // Step 3: Split B into X and Y
  // Step 4: Transfer X into A's Ten Frame -> Frame A is now 10
  // Step 5: 10 + Y = Total
  const [step, setStep] = useState<number>(1);

  // SPLIT PRACTICE WORKSTATION STATE
  const [practiceProbIdx, setPracticeProbIdx] = useState(0);
  const practiceList = useMemo(
    () => [
      { a: 8, b: 6, need: 2, remain: 4, sum: 14 },
      { a: 7, b: 5, need: 3, remain: 2, sum: 12 },
      { a: 9, b: 5, need: 1, remain: 4, sum: 14 },
      { a: 6, b: 8, need: 4, remain: 4, sum: 14 },
    ],
    []
  );
  const practiceProb = practiceList[practiceProbIdx];
  const [userNeedInput, setUserNeedInput] = useState<number | null>(null);
  const [userRemainInput, setUserRemainInput] = useState<number | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<'idle' | 'success' | 'incorrect'>('idle');

  // QUIZ STATE
  const quizList: QuizItem[] = useMemo(
    () => [
      {
        id: 1,
        questionNp: '८ लाई १० बनाउन कति चाहिन्छ? ८ + [ ? ] = १०',
        questionEn: 'How much is needed to make 8 into 10? 8 + [ ? ] = 10',
        options: [1, 2, 3],
        correct: 2,
        explanationNp: '८ मा २ जोड्दा १० हुन्छ (८ + २ = १०)।',
        explanationEn: '8 + 2 = 10.',
      },
      {
        id: 2,
        questionNp: '८ + ५ जोड्दा ५ लाई कुन दुई सङ्ख्यामा फुटाउनु पर्छ?',
        questionEn: 'To solve 8 + 5 using make-10, split 5 into which two parts?',
        options: [2, 3, 4],
        correct: 2, // The needed part to make 10
        explanationNp: '८ लाई १० बनाउन २ चाहिन्छ, त्यसैले ५ लाई २ र ३ मा फुटाइन्छ।',
        explanationEn: '8 needs 2 to make 10, so 5 is split into 2 and 3.',
      },
      {
        id: 3,
        questionNp: '९ लाई १० बनाउन कति चाहिन्छ?',
        questionEn: 'How much is needed to make 9 into 10?',
        options: [1, 2, 0],
        correct: 1,
        explanationNp: '९ + १ = १० हुन्छ।',
        explanationEn: '9 + 1 = 10.',
      },
      {
        id: 4,
        questionNp: '७ + ६ लाई दश बनाएर जोड्दा कुन रूप हुन्छ?',
        questionEn: 'How is 7 + 6 written using make-10 strategy?',
        options: [12, 13, 14],
        correct: 13,
        explanationNp: '७ + ३ + ३ = १० + ३ = १३ हुन्छ।',
        explanationEn: '7 + 3 + 3 = 10 + 3 = 13.',
      },
      {
        id: 5,
        questionNp: '६ लाई १० बनाउन कति थप्नुपर्छ? ६ + [ ? ] = १०',
        questionEn: 'How much must be added to 6 to make 10? 6 + [ ? ] = 10',
        options: [3, 4, 5],
        correct: 4,
        explanationNp: '६ + ४ = १० हुन्छ।',
        explanationEn: '6 + 4 = 10.',
      },
      {
        id: 6,
        questionNp: '१० + ४ को जोडफल कति हो?',
        questionEn: 'What is 10 + 4?',
        options: [13, 14, 15],
        correct: 14,
        explanationNp: '१० + ४ = १४ (चौध) हुन्छ।',
        explanationEn: '10 + 4 = 14 (Fourteen).',
      },
      {
        id: 7,
        questionNp: '९ + ७ लाई १० बनाएर जोड्दा १० + कति हुन्छ?',
        questionEn: 'When solving 9 + 7 via make-10, it becomes 10 + what?',
        options: [5, 6, 7],
        correct: 6,
        explanationNp: '९ + १ + ६ = १० + ६ = १६ हुन्छ।',
        explanationEn: '9 + 1 + 6 = 10 + 6 = 16.',
      },
      {
        id: 8,
        questionNp: '८ + ८ को जोडफल दश बनाएर निकाल्दा कति आउँछ?',
        questionEn: 'What is 8 + 8 using the make-10 method?',
        options: [15, 16, 17],
        correct: 16,
        explanationNp: '८ + २ + ६ = १० + ६ = १६ हुन्छ।',
        explanationEn: '8 + 2 + 6 = 10 + 6 = 16.',
      },
      {
        id: 9,
        questionNp: '१० + ९ जोड्दा कति हुन्छ?',
        questionEn: 'What is 10 + 9?',
        options: [18, 19, 20],
        correct: 19,
        explanationNp: '१० + ९ = १९ (उन्नाइस) हुन्छ।',
        explanationEn: '10 + 9 = 19 (Nineteen).',
      },
      {
        id: 10,
        questionNp: '७ लाई १० बनाउन कति चाहिन्छ? ७ + [ ? ] = १०',
        questionEn: 'How much is needed to make 7 into 10? 7 + [ ? ] = 10',
        options: [2, 3, 4],
        correct: 3,
        explanationNp: '७ + ३ = १० हुन्छ।',
        explanationEn: '7 + 3 = 10.',
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
    (type: 'click' | 'step' | 'split' | 'success' | 'fanfare' | 'boop') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();

        if (type === 'click' || type === 'step') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(type === 'step' ? 620 : 480, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'split') {
          // Double pop for splitting
          [440, 580].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = ctx.currentTime + i * 0.08;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.12, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.12);
          });
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
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH10-02/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSpentSeconds: 150,
          metrics: {
            makeTenAdventureScore: score,
            starsAwarded: Math.min(3, Math.ceil(score / 3.3)),
          },
        }),
      });
    } catch (err) {}
  }, []);

  // Step advancement in Explore
  const handleNextStep = () => {
    if (step < 5) {
      playSound('step');
      const nextStep = step + 1;
      setStep(nextStep);

      if (nextStep === 2) {
        speak(
          `चरण २: पहिलो समूहमा ${NEP_NUMERALS[currentProb.a]} छ। यसलाई १० बनाउन ${NEP_NUMERALS[currentProb.need]} चाहिन्छ।`,
          `Step 2: Group 1 has ${currentProb.a}. We need ${currentProb.need} more to make 10.`
        );
      } else if (nextStep === 3) {
        playSound('split');
        speak(
          `चरण ३: दोस्रो सङ्ख्या ${NEP_NUMERALS[currentProb.b]} लाई ${NEP_NUMERALS[currentProb.need]} र ${NEP_NUMERALS[currentProb.remain]} मा फुटाऔँ।`,
          `Step 3: Split ${currentProb.b} into ${currentProb.need} and ${currentProb.remain}.`
        );
      } else if (nextStep === 4) {
        speak(
          `चरण ४: त्यो ${NEP_NUMERALS[currentProb.need]} पहिलो समूहमा राख्दा पूरा १० बन्यो!`,
          `Step 4: Move ${currentProb.need} to first group. Now we have a full 10!`
        );
      } else if (nextStep === 5) {
        playSound('success');
        speak(
          `चरण ५: १० मा बाँकी ${NEP_NUMERALS[currentProb.remain]} जोड्दा ${NEP_NUMERALS[currentProb.sum]} हुन्छ!`,
          `Step 5: 10 + ${currentProb.remain} = ${currentProb.sum}!`
        );
      }
    }
  };

  const handleResetStep = () => {
    playSound('click');
    setStep(1);
  };

  const handleSelectProblem = (idx: number) => {
    playSound('click');
    setProblemIdx(idx);
    setStep(1);
  };

  // Practice handlers
  const handleCheckPractice = () => {
    if (userNeedInput === practiceProb.need && userRemainInput === practiceProb.remain) {
      playSound('success');
      setPracticeFeedback('success');
      speak(
        `स्याबास! तपाईंले सही विभाजन गर्नुभयो! ${NEP_NUMERALS[practiceProb.b]} = ${NEP_NUMERALS[practiceProb.need]} + ${NEP_NUMERALS[practiceProb.remain]}।`,
        `Well done! Correct split! ${practiceProb.b} = ${practiceProb.need} + ${practiceProb.remain}.`
      );
    } else {
      playSound('boop');
      setPracticeFeedback('incorrect');
      speak('मिलेन, पहिलोलाई १० बनाउन कति चाहिन्छ ध्यान दिनुहोस्।', 'Not correct, check how much is needed to make 10.');
    }
  };

  const handleNextPracticeProblem = () => {
    playSound('click');
    setPracticeProbIdx((prev) => (prev + 1) % practiceList.length);
    setUserNeedInput(null);
    setUserRemainInput(null);
    setPracticeFeedback('idle');
  };

  // Quiz Handlers
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

  return (
    <div className="relative w-full h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 bg-slate-800/95 backdrop-blur border-b border-slate-700 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLibrary}
            className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition text-slate-200"
            title="Back to Chapter 10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Class 1 • Math • Chapter 10
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                Simulation 02
              </span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'np' ? 'दश बनाएर जोडौँ (Make Ten Strategy)' : 'Make Ten Adventure'}
            </h1>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => {
              playSound('click');
              setMode('EXPLORE_STEPS');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              mode === 'EXPLORE_STEPS' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            {language === 'np' ? 'दश बनाउने विधि' : 'Make 10 Steps'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setMode('SPLIT_PRACTICE');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              mode === 'SPLIT_PRACTICE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            {language === 'np' ? 'सङ्ख्या टुक्र्याउने' : 'Split Practice'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setMode('QUIZ');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              mode === 'QUIZ' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {language === 'np' ? 'मूल्याङ्कन' : 'Quiz'}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 transition text-slate-200"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>
          <button
            onClick={() => setLanguage((l) => (l === 'np' ? 'en' : 'np'))}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition"
          >
            {language === 'np' ? 'English' : 'नेपाली'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        {/* ========================================================================= */}
        {/* MODE 1: STEP-BY-STEP MAKE TEN EXPLORATION */}
        {/* ========================================================================= */}
        {mode === 'EXPLORE_STEPS' && (
          <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full gap-6">
            {/* Problem Selector Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
              <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">
                {language === 'np' ? 'जोड समस्या छान्नुहोस्:' : 'Select Problem:'}
              </span>
              {problems.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectProblem(idx)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                    problemIdx === idx
                      ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-700/80 hover:bg-slate-700 text-white'
                  }`}
                >
                  {NEP_NUMERALS[p.a]} + {NEP_NUMERALS[p.b]}
                </button>
              ))}
            </div>

            {/* Central Interactive Board */}
            <div className="bg-slate-800/85 rounded-3xl border border-slate-700 p-6 shadow-2xl flex flex-col gap-6">
              {/* Header Title & Equation */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-700 pb-3 gap-2">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <span>
                      {NEP_NUMERALS[currentProb.a]} + {NEP_NUMERALS[currentProb.b]} = ?
                    </span>
                    <span className="text-slate-400 text-sm font-normal">
                      ({currentProb.a} + {currentProb.b})
                    </span>
                  </h2>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 font-bold uppercase mr-1">
                    {language === 'np' ? 'चरण:' : 'Step:'}
                  </span>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                        step === s
                          ? 'bg-cyan-500 text-slate-950 scale-110 shadow'
                          : step > s
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {NEP_NUMERALS[s]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ten-Frame Interactive Visual Stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* FIRST TEN-FRAME (Holds A + Needs X to make 10) */}
                <div className="bg-slate-900/80 p-5 rounded-2xl border-2 border-cyan-500/40 flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {language === 'np' ? 'पहिलो दश-कोठे घर (Ten-Frame A)' : 'Ten-Frame A'}
                    </span>
                    <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full">
                      {step >= 4 ? '१० / १० (पूरा)' : `${NEP_NUMERALS[currentProb.a]} / १०`}
                    </span>
                  </div>

                  {/* 10-Cell Grid (2x5) */}
                  <div className="grid grid-cols-5 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-700">
                    {Array.from({ length: 10 }).map((_, cellIdx) => {
                      const isOriginalA = cellIdx < currentProb.a;
                      const isTransferred = step >= 4 && cellIdx >= currentProb.a && cellIdx < 10;
                      const isNeededTarget = step === 2 && cellIdx >= currentProb.a && cellIdx < 10;

                      return (
                        <div
                          key={cellIdx}
                          className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center font-black text-sm transition-all duration-500 ${
                            isOriginalA
                              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow'
                              : isTransferred
                              ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105 animate-scaleIn'
                              : isNeededTarget
                              ? 'bg-rose-500/20 border-rose-400 border-dashed animate-pulse text-rose-300'
                              : 'bg-slate-900 border-slate-700 text-slate-600'
                          }`}
                        >
                          {isOriginalA
                            ? NEP_NUMERALS[cellIdx + 1]
                            : isTransferred
                            ? NEP_NUMERALS[cellIdx + 1]
                            : isNeededTarget
                            ? '?'
                            : ''}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footnote */}
                  <span className="text-xs text-slate-400 mt-3 font-semibold text-center">
                    {step === 1 && (language === 'np' ? `सुरुमा ${NEP_NUMERALS[currentProb.a]} ओटा वस्तु छन्।` : `Initially ${currentProb.a} items.`)}
                    {step === 2 && (language === 'np' ? `१० बनाउन अझै ${NEP_NUMERALS[currentProb.need]} ओटा चाहिन्छ!` : `Needs ${currentProb.need} more to make 10!`)}
                    {step >= 4 && (language === 'np' ? `स्याबास! १ पूरा दश (१०) बन्यो!` : `1 Complete Ten (10) formed!`)}
                  </span>
                </div>

                {/* SECOND GROUP (B) & SPLITTING (Need + Remain) */}
                <div className="bg-slate-900/80 p-5 rounded-2xl border-2 border-amber-500/40 flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {language === 'np' ? 'दोस्रो समूह (Group B)' : 'Group B'}
                    </span>
                    <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full">
                      {NEP_NUMERALS[currentProb.b]} ओटा
                    </span>
                  </div>

                  {/* Display of Group B before / after split */}
                  {step < 3 ? (
                    /* Initial unsplit B units */
                    <div className="flex flex-wrap items-center justify-center gap-2 min-h-[110px] p-2">
                      {Array.from({ length: currentProb.b }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center shadow"
                        >
                          {NEP_NUMERALS[idx + 1]}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Split into Needed + Remaining */
                    <div className="flex flex-col items-center gap-3 w-full min-h-[110px]">
                      <div className="flex items-center justify-around w-full gap-4">
                        {/* Needed Part (Transfers to Ten-Frame) */}
                        <div className="flex-1 bg-amber-500/20 border border-amber-400 p-2.5 rounded-xl text-center">
                          <span className="text-[10px] font-bold text-amber-300 block mb-1">
                            {language === 'np' ? `१० बनाउन जाने (${NEP_NUMERALS[currentProb.need]})` : `For 10 (${currentProb.need})`}
                          </span>
                          <div className="flex justify-center gap-1.5">
                            {Array.from({ length: currentProb.need }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center ${
                                  step >= 4
                                    ? 'bg-slate-700 text-slate-400 border border-slate-600'
                                    : 'bg-amber-400 text-slate-950'
                                }`}
                              >
                                {NEP_NUMERALS[i + 1]}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Remaining Part */}
                        <div className="flex-1 bg-emerald-500/20 border border-emerald-400 p-2.5 rounded-xl text-center">
                          <span className="text-[10px] font-bold text-emerald-300 block mb-1">
                            {language === 'np' ? `बाँकी रहने (${NEP_NUMERALS[currentProb.remain]})` : `Remaining (${currentProb.remain})`}
                          </span>
                          <div className="flex justify-center gap-1.5">
                            {Array.from({ length: currentProb.remain }).map((_, i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded-lg bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center justify-center shadow"
                              >
                                {NEP_NUMERALS[i + 1]}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <span className="text-xs text-slate-400 mt-3 font-semibold text-center">
                    {step < 3 && (language === 'np' ? `दोस्रो समूहमा ${NEP_NUMERALS[currentProb.b]} छन्।` : `Group B has ${currentProb.b} items.`)}
                    {step === 3 && (language === 'np' ? `${NEP_NUMERALS[currentProb.b]} लाई ${NEP_NUMERALS[currentProb.need]} र ${NEP_NUMERALS[currentProb.remain]} मा फुटाइयो।` : `${currentProb.b} split into ${currentProb.need} and ${currentProb.remain}.`)}
                    {step >= 4 && (language === 'np' ? `अब दोस्रो समूहमा ${NEP_NUMERALS[currentProb.remain]} मात्र बाँकी छ।` : `Now only ${currentProb.remain} remaining in Group B.`)}
                  </span>
                </div>
              </div>

              {/* Mathematical Equation Breakdown Studio */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    {language === 'np' ? 'चरणबद्ध गणितीय सूत्र:' : 'Equation Steps:'}
                  </span>
                  <div className="text-xl md:text-2xl font-black text-white tracking-wide">
                    {step === 1 && `${NEP_NUMERALS[currentProb.a]} + ${NEP_NUMERALS[currentProb.b]} = ?`}
                    {step === 2 && (
                      <>
                        {NEP_NUMERALS[currentProb.a]} + <span className="text-rose-400">{NEP_NUMERALS[currentProb.need]}</span> = १०
                      </>
                    )}
                    {step === 3 && (
                      <>
                        {NEP_NUMERALS[currentProb.a]} + ({NEP_NUMERALS[currentProb.need]} + {NEP_NUMERALS[currentProb.remain]})
                      </>
                    )}
                    {step === 4 && (
                      <>
                        १० + {NEP_NUMERALS[currentProb.remain]} = ?
                      </>
                    )}
                    {step === 5 && (
                      <>
                        १० + {NEP_NUMERALS[currentProb.remain]} = <span className="text-amber-400">{NEP_NUMERALS[currentProb.sum]}</span> (स्याबास!)
                      </>
                    )}
                  </div>
                </div>

                {/* Step Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetStep}
                    className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                    title="Reset to Step 1"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    disabled={step >= 5}
                    onClick={handleNextStep}
                    className="px-6 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-black text-xs transition shadow-lg shadow-cyan-600/30 flex items-center gap-1.5"
                  >
                    <span>{step < 5 ? (language === 'np' ? 'अर्को चरण' : 'Next Step') : (language === 'np' ? 'सम्पन्न' : 'Done')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: SPLIT PRACTICE WORKSTATION */}
        {/* ========================================================================= */}
        {mode === 'SPLIT_PRACTICE' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              {/* Mission Header */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                    {language === 'np' ? 'अभ्यास कार्य' : 'Split Challenge'}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-0.5">
                    {language === 'np' ? (
                      <>
                        <span className="text-amber-400">{NEP_NUMERALS[practiceProb.a]}</span> लाई १० बनाउन{' '}
                        <span className="text-emerald-400">{NEP_NUMERALS[practiceProb.b]}</span> लाई फुटाउनुहोस्!
                      </>
                    ) : (
                      <>
                        Split <span className="text-emerald-400">{practiceProb.b}</span> to make{' '}
                        <span className="text-amber-400">{practiceProb.a}</span> into 10!
                      </>
                    )}
                  </h3>
                </div>

                <button
                  onClick={handleNextPracticeProblem}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को प्रश्न' : 'Next Challenge'}
                </button>
              </div>

              {/* Interactive Splitter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Part 1: How much needed for 10? */}
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-cyan-500/40 flex flex-col items-center">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    {language === 'np'
                      ? `${NEP_NUMERALS[practiceProb.a]} लाई १० बनाउन कति चाहिन्छ?`
                      : `How much needed to make ${practiceProb.a} into 10?`}
                  </span>

                  <div className="flex gap-2 my-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          playSound('click');
                          setUserNeedInput(n);
                        }}
                        className={`w-11 h-11 rounded-xl font-black text-lg transition border ${
                          userNeedInput === n
                            ? 'bg-cyan-500 text-slate-950 border-cyan-300 scale-105 shadow'
                            : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {NEP_NUMERALS[n]}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {language === 'np' ? `चाहिने सङ्ख्या: ${userNeedInput ? NEP_NUMERALS[userNeedInput] : '?'}` : `Needed: ${userNeedInput || '?'}`}
                  </span>
                </div>

                {/* Part 2: What remains from B? */}
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-emerald-500/40 flex flex-col items-center">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    {language === 'np'
                      ? `${NEP_NUMERALS[practiceProb.b]} बाट बाँकी कति रहन्छ?`
                      : `What remains from ${practiceProb.b}?`}
                  </span>

                  <div className="flex gap-2 my-3">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          playSound('click');
                          setUserRemainInput(n);
                        }}
                        className={`w-11 h-11 rounded-xl font-black text-lg transition border ${
                          userRemainInput === n
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 scale-105 shadow'
                            : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {NEP_NUMERALS[n]}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {language === 'np' ? `बाँकी रहने: ${userRemainInput ? NEP_NUMERALS[userRemainInput] : '?'}` : `Remaining: ${userRemainInput || '?'}`}
                  </span>
                </div>
              </div>

              {/* Status & Verify */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div className="text-lg font-black text-white">
                  {NEP_NUMERALS[practiceProb.b]} = {userNeedInput ? NEP_NUMERALS[userNeedInput] : '?'}{' '}
                  + {userRemainInput ? NEP_NUMERALS[userRemainInput] : '?'}
                </div>

                <button
                  disabled={!userNeedInput || !userRemainInput}
                  onClick={handleCheckPractice}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'np' ? 'जाँच गर्नुहोस्' : 'Check Split'}
                </button>
              </div>

              {practiceFeedback === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>
                    {language === 'np'
                      ? `स्याबास! १० + ${NEP_NUMERALS[practiceProb.remain]} = ${NEP_NUMERALS[practiceProb.sum]} हुन्छ!`
                      : `Excellent! 10 + ${practiceProb.remain} = ${practiceProb.sum}!`}
                  </span>
                </div>
              )}
              {practiceFeedback === 'incorrect' && (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-200 text-sm font-bold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-rose-400" />
                  <span>
                    {language === 'np'
                      ? 'मिलेन। पहिले १० बनाउन कति चाहिन्छ फेरि सोच्नुहोस्।'
                      : 'Not quite. Check how much is required to make ten.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: QUIZ EVALUATION */}
        {/* ========================================================================= */}
        {mode === 'QUIZ' && (
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full justify-center">
            {!quizCompleted ? (
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700 pb-3">
                  <span className="font-bold text-cyan-400">
                    {language === 'np'
                      ? `प्रश्न ${NEP_NUMERALS[quizIdx + 1]} / ${NEP_NUMERALS[quizList.length]}`
                      : `Question ${quizIdx + 1} of ${quizList.length}`}
                  </span>
                  <span>
                    {language === 'np' ? `अङ्क: ${NEP_NUMERALS[quizScore]}` : `Score: ${quizScore}`}
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-white">
                  {language === 'np' ? quizList[quizIdx].questionNp : quizList[quizIdx].questionEn}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {quizList[quizIdx].options.map((opt) => {
                    const isSelected = quizSelected === opt;
                    const isCorrectOpt = opt === quizList[quizIdx].correct;
                    let btnStyle = 'bg-slate-700/80 hover:bg-slate-700 text-white';

                    if (quizAnswered) {
                      if (isCorrectOpt) {
                        btnStyle = 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-500/30';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-600 text-white font-black';
                      } else {
                        btnStyle = 'bg-slate-800 text-slate-500 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        disabled={quizAnswered}
                        onClick={() => handleQuizAnswer(opt)}
                        className={`p-4 rounded-2xl text-xl font-bold transition flex flex-col items-center justify-center gap-1 border border-slate-600 ${btnStyle}`}
                      >
                        <span className="text-3xl">{NEP_NUMERALS[opt]}</span>
                        <span className="text-xs opacity-75">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {quizAnswered && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300">
                    <p className="font-bold text-cyan-400 mb-1">
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
                    className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/95 border-2 border-cyan-500/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Award className="w-10 h-10 text-cyan-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">
                    {language === 'np' ? 'बधाई छ! मूल्याङ्कन पूरा भयो!' : 'Congratulations! Quiz Completed!'}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    {language === 'np'
                      ? 'तपाईंले दश बनाएर जोड गर्ने विधि सफलतापूर्वक सिक्नुभयो।'
                      : 'You have mastered the Make-10 addition strategy.'}
                  </p>
                </div>

                <div className="text-4xl font-black text-cyan-400">
                  {NEP_NUMERALS[quizScore]} / {NEP_NUMERALS[quizList.length]}
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleQuizReset}
                    className="flex-1 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'पुनः परीक्षा दिनुहोस्' : 'Retake Quiz'}
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setMode('EXPLORE_STEPS');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'विधिमा फर्कनुहोस्' : 'Back to Steps'}
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

