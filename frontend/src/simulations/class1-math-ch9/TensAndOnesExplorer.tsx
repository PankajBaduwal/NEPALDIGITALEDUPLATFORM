/**
 * TensAndOnesExplorer.tsx
 * Simulation 03: Tens and Ones Explorer (दहाइ र एकाइ पत्ता लगाऔँ)
 * Class 1 Mathematics - Chapter 9: Numbers 11 to 20 (११ देखि २० सम्मका सङ्ख्याहरू)
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
  Columns,
  Grid,
  Layers,
  HelpCircle,
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

const NEP_NAMES: Record<number, string> = {
  11: 'एघार', 12: 'बाह्र', 13: 'तेह्र', 14: 'चौध', 15: 'पन्ध्र',
  16: 'सोह्र', 17: 'सत्र', 18: 'अठार', 19: 'उन्नाइस', 20: 'बीस',
};

const EN_NAMES: Record<number, string> = {
  11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen',
  16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty',
};

interface QuizItem {
  id: number;
  questionNp: string;
  questionEn: string;
  tens: number;
  ones: number;
  total: number;
  options: number[];
  correct: number;
  explanationNp: string;
  explanationEn: string;
}

export const TensAndOnesExplorer: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Mode: 'EXPLORE' | 'BUILDER' | 'QUIZ'
  const [mode, setMode] = useState<'EXPLORE' | 'BUILDER' | 'QUIZ'>('EXPLORE');

  // EXPLORE STATE: Selected Number 11 to 20
  const [selectedNum, setSelectedNum] = useState<number>(16);

  // BUILDER STATE: User adds rods (10s) and cubes (1s)
  const [builderTarget, setBuilderTarget] = useState<number>(17);
  const [userTens, setUserTens] = useState<number>(0);
  const [userOnes, setUserOnes] = useState<number>(0);
  const [builderFeedback, setBuilderFeedback] = useState<'idle' | 'success' | 'incorrect'>('idle');

  // QUIZ STATE
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const quizList: QuizItem[] = useMemo(
    () => [
      {
        id: 1,
        questionNp: 'सङ्ख्या १६ मा कति वटा दहाइ र कति वटा एकाइ छन्?',
        questionEn: 'How many tens and ones are there in number 16?',
        tens: 1,
        ones: 6,
        total: 16,
        options: [16, 61, 10],
        correct: 16,
        explanationNp: '१६ मा १ दहाइ र ६ एकाइ हुन्छन्।',
        explanationEn: '16 has 1 ten and 6 ones.',
      },
      {
        id: 2,
        questionNp: '१ दहाइ र ४ एकाइ मिलेर कुन सङ्ख्या बन्छ?',
        questionEn: 'What number is formed by 1 ten and 4 ones?',
        tens: 1,
        ones: 4,
        total: 14,
        options: [14, 41, 15],
        correct: 14,
        explanationNp: '१ दहाइ (१०) र ४ एकाइ (४) मिलेर १४ (चौध) बन्छ।',
        explanationEn: '1 ten (10) and 4 ones (4) make 14 (Fourteen).',
      },
      {
        id: 3,
        questionNp: 'सङ्ख्या २० मा एकाइको स्थानमा कुन अङ्क हुन्छ?',
        questionEn: 'What digit is in the ones place of number 20?',
        tens: 2,
        ones: 0,
        total: 20,
        options: [0, 2, 1],
        correct: 0,
        explanationNp: '२० मा दहाइमा २ र एकाइमा ० (शून्य) हुन्छ।',
        explanationEn: 'In 20, tens digit is 2 and ones digit is 0.',
      },
      {
        id: 4,
        questionNp: '१ दहाइ र ९ एकाइ मिलेर बन्ने सङ्ख्या के हो?',
        questionEn: 'What number is 1 ten and 9 ones?',
        tens: 1,
        ones: 9,
        total: 19,
        options: [19, 91, 18],
        correct: 19,
        explanationNp: '१ दहाइ र ९ एकाइ मिलेर १९ (उन्नाइस) हुन्छ।',
        explanationEn: '1 ten and 9 ones make 19 (Nineteen).',
      },
      {
        id: 5,
        questionNp: 'सङ्ख्या ११ मा दहाइको स्थानमा कुन अङ्क छ?',
        questionEn: 'What digit is in the tens place of number 11?',
        tens: 1,
        ones: 1,
        total: 11,
        options: [1, 2, 0],
        correct: 1,
        explanationNp: '११ मा दहाइमा १ र एकाइमा पनि १ हुन्छ।',
        explanationEn: 'In 11, the tens digit is 1 and ones digit is 1.',
      },
      {
        id: 6,
        questionNp: '२ वटा दहाइका छडहरू मिलेर कति हुन्छ?',
        questionEn: 'How much is 2 ten-rods?',
        tens: 2,
        ones: 0,
        total: 20,
        options: [12, 20, 2],
        correct: 20,
        explanationNp: '१० + १० = २० (२ दहाइ) हुन्छ।',
        explanationEn: '10 + 10 = 20 (2 tens).',
      },
      {
        id: 7,
        questionNp: 'सङ्ख्या १३ मा एकाइ कति ओटा छन्?',
        questionEn: 'How many ones are there in number 13?',
        tens: 1,
        ones: 3,
        total: 13,
        options: [1, 3, 4],
        correct: 3,
        explanationNp: '१३ मा १ दहाइ र ३ एकाइ छन्।',
        explanationEn: 'In 13, there are 1 ten and 3 ones.',
      },
      {
        id: 8,
        questionNp: '१ दहाइ र ७ एकाइ मिलेर कुन सङ्ख्या बन्छ?',
        questionEn: 'What number is formed by 1 ten and 7 ones?',
        tens: 1,
        ones: 7,
        total: 17,
        options: [16, 17, 18],
        correct: 17,
        explanationNp: '१ दहाइ र ७ एकाइ = १७ (सत्र)।',
        explanationEn: '1 ten and 7 ones = 17 (Seventeen).',
      },
      {
        id: 9,
        questionNp: 'सङ्ख्या १८ मा दहाइ र एकाइको जोड कसरी लेखिन्छ?',
        questionEn: 'How is number 18 expressed as addition of tens and ones?',
        tens: 1,
        ones: 8,
        total: 18,
        options: [18, 108, 80],
        correct: 18,
        explanationNp: '१० + ८ = १८ हुन्छ।',
        explanationEn: '10 + 8 = 18.',
      },
      {
        id: 10,
        questionNp: 'सङ्ख्या १५ मा कति वटा एकाइ छन्?',
        questionEn: 'How many ones are there in number 15?',
        tens: 1,
        ones: 5,
        total: 15,
        options: [1, 5, 10],
        correct: 5,
        explanationNp: '१५ मा ५ एकाइ छन्।',
        explanationEn: 'There are 5 ones in 15.',
      },
    ],
    []
  );

  // Audio Synthesizer
  const playSound = useCallback(
    (type: 'click' | 'place' | 'success' | 'fanfare' | 'boop') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();

        if (type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(500, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'place') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
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

  // Progress Recording
  const recordProgress = useCallback(async (score: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH9-03/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSpentSeconds: 120,
          metrics: {
            tensAndOnesScore: score,
            starsAwarded: Math.min(3, Math.ceil(score / 3.3)),
          },
        }),
      });
    } catch (err) {}
  }, []);

  // Handle number click in Explore mode
  const handleSelectExplore = (num: number) => {
    playSound('click');
    setSelectedNum(num);
    const tens = num === 20 ? 2 : 1;
    const ones = num === 20 ? 0 : num - 10;
    speak(
      `${NEP_NUMERALS[num]}, ${NEP_NAMES[num]}। दहाइमा ${NEP_NUMERALS[tens]}, एकाइमा ${NEP_NUMERALS[ones]}।`,
      `${num}, ${EN_NAMES[num]}. Tens: ${tens}, Ones: ${ones}.`
    );
  };

  // Builder actions
  const handleAddTenRod = () => {
    if (userTens < 2) {
      playSound('place');
      setUserTens((prev) => prev + 1);
      setBuilderFeedback('idle');
    }
  };

  const handleRemoveTenRod = () => {
    if (userTens > 0) {
      playSound('click');
      setUserTens((prev) => prev - 1);
      setBuilderFeedback('idle');
    }
  };

  const handleAddOneCube = () => {
    if (userOnes < 9) {
      playSound('place');
      setUserOnes((prev) => prev + 1);
      setBuilderFeedback('idle');
    }
  };

  const handleRemoveOneCube = () => {
    if (userOnes > 0) {
      playSound('click');
      setUserOnes((prev) => prev - 1);
      setBuilderFeedback('idle');
    }
  };

  const handleResetBuilder = () => {
    playSound('click');
    setUserTens(0);
    setUserOnes(0);
    setBuilderFeedback('idle');
  };

  const handleCheckBuilder = () => {
    const total = userTens * 10 + userOnes;
    if (total === builderTarget) {
      playSound('success');
      setBuilderFeedback('success');
      speak(
        `स्याबास! तपाईंले ठिक सङ्ख्या ${NEP_NUMERALS[builderTarget]} बनाउनुभयो!`,
        `Well done! You correctly built number ${builderTarget}!`
      );
    } else {
      playSound('boop');
      setBuilderFeedback('incorrect');
      speak('अझै मिलेन, फेरि गनेर मिलाउनुहोस्।', 'Not matching yet, count and adjust.');
    }
  };

  const handleNextBuilderTarget = () => {
    playSound('click');
    const available = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const currentIdx = available.indexOf(builderTarget);
    const nextTarget = available[(currentIdx + 1) % available.length];
    setBuilderTarget(nextTarget);
    setUserTens(0);
    setUserOnes(0);
    setBuilderFeedback('idle');
  };

  // Quiz actions
  const handleQuizAnswer = (opt: number) => {
    if (quizAnswered) return;
    setQuizSelected(opt);
    setQuizAnswered(true);
    const q = quizList[quizIndex];
    if (opt === q.correct) {
      playSound('success');
      setQuizScore((prev) => prev + 1);
      speak('स्याबास! सही उत्तर।', 'Well done! Correct answer.');
    } else {
      playSound('boop');
      speak('फेरि प्रयास गर्नुहोस्। सही उत्तर हेर्नुहोस्।', 'Check the explanation.');
    }
  };

  const handleQuizNext = () => {
    playSound('click');
    if (quizIndex + 1 < quizList.length) {
      setQuizIndex((prev) => prev + 1);
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
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setQuizSelected(null);
    setQuizCompleted(false);
  };

  const expTens = selectedNum === 20 ? 2 : 1;
  const expOnes = selectedNum === 20 ? 0 : selectedNum - 10;
  const builderCurrentTotal = userTens * 10 + userOnes;

  return (
    <div className="relative w-full h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 bg-slate-800/95 backdrop-blur border-b border-slate-700 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLibrary}
            className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition text-slate-200"
            title="Back to Chapter 9"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Class 1 • Math • Chapter 9
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                Simulation 03
              </span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'np' ? 'दहाइ र एकाइ पत्ता लगाऔँ (स्थानमान)' : 'Tens and Ones Explorer (Place Value)'}
            </h1>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => {
              playSound('click');
              setMode('EXPLORE');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              mode === 'EXPLORE' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            {language === 'np' ? 'स्थानमान तालिका' : 'Place Value Chart'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setMode('BUILDER');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              mode === 'BUILDER' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {language === 'np' ? 'छड र क्युब मिलाउने' : 'Rods & Cubes'}
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
            {language === 'np' ? 'परीक्षा' : 'Quiz'}
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
        {/* MODE 1: EXPLORE PLACE VALUE CHART */}
        {/* ========================================================================= */}
        {mode === 'EXPLORE' && (
          <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
            {/* Number Selector Carousel */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
              <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">
                {language === 'np' ? 'सङ्ख्या छान्नुहोस्:' : 'Choose Number:'}
              </span>
              {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSelectExplore(num)}
                  className={`w-11 h-11 rounded-xl font-bold flex flex-col items-center justify-center transition-all ${
                    selectedNum === num
                      ? 'bg-cyan-500 text-slate-950 scale-105 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-300'
                      : 'bg-slate-700/80 hover:bg-slate-700 text-white hover:scale-102'
                  }`}
                >
                  <span className="text-sm leading-none">{NEP_NUMERALS[num]}</span>
                  <span className="text-[10px] leading-none opacity-80">{num}</span>
                </button>
              ))}
            </div>

            {/* Central Interactive Chart */}
            <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-6 shadow-2xl flex flex-col gap-6">
              {/* Header Title with Spoken Word */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-700 pb-3 gap-2">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <span className="text-cyan-400">{NEP_NUMERALS[selectedNum]}</span>
                    <span>({selectedNum})</span>
                    <span className="text-slate-400 font-normal text-sm">
                      • {language === 'np' ? NEP_NAMES[selectedNum] : EN_NAMES[selectedNum]}
                    </span>
                  </h2>
                </div>

                <button
                  onClick={() =>
                    speak(
                      `${NEP_NUMERALS[selectedNum]} मा ${NEP_NUMERALS[expTens]} दहाइ र ${NEP_NUMERALS[expOnes]} एकाइ छन्।`,
                      `Number ${selectedNum} has ${expTens} tens and ${expOnes} ones.`
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow"
                >
                  <Volume2 className="w-4 h-4" />
                  {language === 'np' ? 'उच्चारण सुन्नुहोस्' : 'Listen'}
                </button>
              </div>

              {/* Two Column Layout: Tens (दहाइ) vs Ones (एकाइ) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TENS COLUMN */}
                <div className="bg-slate-900/70 p-5 rounded-2xl border-2 border-emerald-500/40 flex flex-col items-center justify-between min-h-[300px]">
                  <div className="w-full text-center border-b border-emerald-500/30 pb-2">
                    <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">
                      {language === 'np' ? 'दहाइ (Tens)' : 'Tens Column'}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {language === 'np' ? '१० वटा एकाइ बराबर १ दहाइ' : '10 units = 1 Ten Rod'}
                    </p>
                  </div>

                  {/* 3D-styled Rod Representation */}
                  <div className="flex items-center justify-center gap-6 py-4">
                    {Array.from({ length: expTens }).map((_, rodIdx) => (
                      <div
                        key={rodIdx}
                        className="flex flex-col items-center bg-emerald-500/20 border-2 border-emerald-400 rounded-xl p-2 shadow-lg shadow-emerald-500/10"
                      >
                        <span className="text-[10px] font-bold text-emerald-300 mb-1">
                          {language === 'np' ? `१ दहाइ (${NEP_NUMERALS[10]})` : '1 Ten (10)'}
                        </span>
                        {/* 10 stacked segments */}
                        <div className="flex flex-col gap-0.5">
                          {Array.from({ length: 10 }).map((_, segIdx) => (
                            <div
                              key={segIdx}
                              className="w-8 h-3.5 bg-gradient-to-r from-emerald-400 to-emerald-500 border border-emerald-300 rounded-xs flex items-center justify-center text-[8px] font-bold text-emerald-950"
                            >
                              {10 - segIdx}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center bg-slate-800/80 px-4 py-2 rounded-xl border border-emerald-500/30">
                    <span className="text-xs text-slate-400 block">{language === 'np' ? 'दहाइको सङ्ख्या:' : 'Tens Value:'}</span>
                    <span className="text-xl font-black text-emerald-400">
                      {NEP_NUMERALS[expTens]} {language === 'np' ? 'दहाइ' : 'Tens'} = {NEP_NUMERALS[expTens * 10]}
                    </span>
                  </div>
                </div>

                {/* ONES COLUMN */}
                <div className="bg-slate-900/70 p-5 rounded-2xl border-2 border-sky-500/40 flex flex-col items-center justify-between min-h-[300px]">
                  <div className="w-full text-center border-b border-sky-500/30 pb-2">
                    <span className="text-sm font-black text-sky-400 uppercase tracking-widest">
                      {language === 'np' ? 'एकाइ (Ones)' : 'Ones Column'}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {language === 'np' ? 'छुट्टाटुट्टै १-१ वटा क्युबहरू' : 'Single Unit Cubes'}
                    </p>
                  </div>

                  {/* 3D-styled Single Cubes */}
                  <div className="flex flex-wrap items-center justify-center gap-3 py-4 max-w-[240px] min-h-[160px]">
                    {expOnes === 0 ? (
                      <span className="text-slate-500 text-xs italic">
                        {language === 'np' ? 'शून्य एकाइ (०)' : 'Zero Ones (0)'}
                      </span>
                    ) : (
                      Array.from({ length: expOnes }).map((_, cubeIdx) => (
                        <div
                          key={cubeIdx}
                          className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 border-2 border-sky-300 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md transition-transform hover:scale-110"
                        >
                          {NEP_NUMERALS[cubeIdx + 1]}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="text-center bg-slate-800/80 px-4 py-2 rounded-xl border border-sky-500/30">
                    <span className="text-xs text-slate-400 block">{language === 'np' ? 'एकाइको सङ्ख्या:' : 'Ones Value:'}</span>
                    <span className="text-xl font-black text-sky-400">
                      {NEP_NUMERALS[expOnes]} {language === 'np' ? 'एकाइ' : 'Ones'} = {NEP_NUMERALS[expOnes]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Place Value Summary Card */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 rounded-2xl border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center border-r border-slate-700 pr-4">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {language === 'np' ? 'दहाइ' : 'Tens'}
                    </span>
                    <span className="text-2xl font-black text-emerald-400">{NEP_NUMERALS[expTens]}</span>
                  </div>
                  <div className="text-center border-r border-slate-700 pr-4">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {language === 'np' ? 'एकाइ' : 'Ones'}
                    </span>
                    <span className="text-2xl font-black text-sky-400">{NEP_NUMERALS[expOnes]}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {language === 'np' ? 'जम्मा सङ्ख्या' : 'Total'}
                    </span>
                    <span className="text-2xl font-black text-amber-400">{NEP_NUMERALS[selectedNum]}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{language === 'np' ? 'विस्तारित रूप:' : 'Expanded Form:'}</span>
                  <span className="text-lg font-black text-white">
                    {expTens * 10} + {expOnes} = {selectedNum} ({NEP_NUMERALS[expTens * 10]} + {NEP_NUMERALS[expOnes]} = {NEP_NUMERALS[selectedNum]})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: BUILDER (RODS & CUBES INTERACTIVE LABORATORY) */}
        {/* ========================================================================= */}
        {mode === 'BUILDER' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 shadow-2xl flex flex-col gap-6">
              {/* Mission Header */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                    {language === 'np' ? 'प्रयोगात्मक कार्य' : 'Hands-on Challenge'}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-0.5">
                    {language === 'np' ? (
                      <>
                        सङ्ख्या <span className="text-amber-400">{NEP_NUMERALS[builderTarget]}</span> बनाउनुहोस्!
                      </>
                    ) : (
                      <>
                        Build number <span className="text-amber-400">{builderTarget}</span>!
                      </>
                    )}
                  </h3>
                </div>

                <button
                  onClick={handleNextBuilderTarget}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को सङ्ख्या' : 'Next Target'}
                </button>
              </div>

              {/* Two Workstations: Tens Rod Controls vs Ones Cubes Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tens Workstation */}
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-emerald-500/40 flex flex-col items-center justify-between min-h-[260px]">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {language === 'np' ? '१० को छड (Tens Rods)' : 'Tens Rods (10 each)'}
                  </span>

                  <div className="flex items-center justify-center gap-4 py-2">
                    {userTens === 0 ? (
                      <span className="text-xs text-slate-500 italic">
                        {language === 'np' ? 'कुनै छड थपिएको छैन' : 'No ten-rods added'}
                      </span>
                    ) : (
                      Array.from({ length: userTens }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-32 bg-emerald-500 rounded-xl border-2 border-emerald-300 flex flex-col items-center justify-center text-emerald-950 font-black shadow-lg"
                        >
                          <span className="text-xs">१०</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={handleAddTenRod}
                      disabled={userTens >= 2}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition"
                    >
                      + {language === 'np' ? '१ छड थप्नुहोस्' : 'Add 1 Rod'}
                    </button>
                    <button
                      onClick={handleRemoveTenRod}
                      disabled={userTens <= 0}
                      className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-300 font-bold text-xs transition"
                    >
                      -
                    </button>
                  </div>
                </div>

                {/* Ones Workstation */}
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-sky-500/40 flex flex-col items-center justify-between min-h-[260px]">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    {language === 'np' ? 'एकाइ क्युब (Unit Cubes)' : 'Unit Cubes (1 each)'}
                  </span>

                  <div className="flex flex-wrap items-center justify-center gap-2 py-2 max-w-[200px] min-h-[120px]">
                    {userOnes === 0 ? (
                      <span className="text-xs text-slate-500 italic">
                        {language === 'np' ? 'कुनै क्युब थपिएको छैन' : 'No cubes added'}
                      </span>
                    ) : (
                      Array.from({ length: userOnes }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 bg-sky-500 rounded-lg border-2 border-sky-300 flex items-center justify-center text-white font-black text-xs shadow"
                        >
                          {NEP_NUMERALS[idx + 1]}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={handleAddOneCube}
                      disabled={userOnes >= 9}
                      className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs transition"
                    >
                      + {language === 'np' ? '१ क्युब थप्नुहोस्' : 'Add 1 Cube'}
                    </button>
                    <button
                      onClick={handleRemoveOneCube}
                      disabled={userOnes <= 0}
                      className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-300 font-bold text-xs transition"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>

              {/* Status and Check */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">
                    {language === 'np' ? 'तपाईंको जम्मा मान:' : 'Your Total Value:'}
                  </span>
                  <div className="text-2xl font-black text-amber-400">
                    {userTens * 10} + {userOnes} = {builderCurrentTotal} ({NEP_NUMERALS[builderCurrentTotal]})
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleResetBuilder}
                    className="p-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                    title="Reset"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCheckBuilder}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {language === 'np' ? 'जाँच गर्नुहोस्' : 'Check'}
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {builderFeedback === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    {language === 'np'
                      ? `स्याबास! तपाईंले ठीक ${NEP_NUMERALS[builderTarget]} बनाउनुभयो!`
                      : `Excellent! You built exactly ${builderTarget}!`}
                  </div>
                </div>
              )}
              {builderFeedback === 'incorrect' && (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-200 text-sm font-bold flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    {language === 'np'
                      ? `अझै पुगेन वा बढी भयो। तपाईंलाई ${NEP_NUMERALS[builderTarget]} बनाउनु छ!`
                      : `Not matching yet. Target is ${builderTarget}!`}
                  </div>
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
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700 pb-3">
                  <span className="font-bold text-cyan-400">
                    {language === 'np'
                      ? `प्रश्न ${NEP_NUMERALS[quizIndex + 1]} / ${NEP_NUMERALS[quizList.length]}`
                      : `Question ${quizIndex + 1} of ${quizList.length}`}
                  </span>
                  <span>
                    {language === 'np' ? `अङ्क: ${NEP_NUMERALS[quizScore]}` : `Score: ${quizScore}`}
                  </span>
                </div>

                {/* Question */}
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white">
                    {language === 'np' ? quizList[quizIndex].questionNp : quizList[quizIndex].questionEn}
                  </h3>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {quizList[quizIndex].options.map((opt) => {
                    const isSelected = quizSelected === opt;
                    const isCorrectOpt = opt === quizList[quizIndex].correct;
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
                        className={`p-4 rounded-2xl text-lg font-bold transition flex flex-col items-center justify-center gap-1 border border-slate-600 ${btnStyle}`}
                      >
                        <span className="text-2xl">{NEP_NUMERALS[opt]}</span>
                        <span className="text-xs opacity-75">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback */}
                {quizAnswered && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300">
                    <p className="font-bold text-cyan-400 mb-1">
                      {language === 'np' ? 'व्याख्या:' : 'Explanation:'}
                    </p>
                    <p>
                      {language === 'np'
                        ? quizList[quizIndex].explanationNp
                        : quizList[quizIndex].explanationEn}
                    </p>
                  </div>
                )}

                {/* Next Button */}
                {quizAnswered && (
                  <button
                    onClick={handleQuizNext}
                    className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Quiz Finished Celebratory Card */
              <div className="bg-slate-800/95 border-2 border-cyan-500/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Award className="w-10 h-10 text-cyan-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">
                    {language === 'np' ? 'बधाई छ! मूल्याङ्कन पूरा भयो!' : 'Congratulations! Assessment Complete!'}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    {language === 'np'
                      ? 'तपाईंले दहाइ र एकाइको स्थानमान अवधारणा सफलतापूर्वक सिक्नुभयो।'
                      : 'You have mastered place values for numbers 11 to 20.'}
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
                    {language === 'np' ? 'फेरि परीक्षा दिनुहोस्' : 'Retake Quiz'}
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setMode('EXPLORE');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'स्थानमान तालिकामा फर्कनुहोस्' : 'Back to Chart'}
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

