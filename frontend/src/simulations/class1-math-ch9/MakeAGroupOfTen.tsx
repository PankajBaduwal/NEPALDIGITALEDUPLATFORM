/**
 * MakeAGroupOfTen.tsx
 * Simulation 02: Make a Group of Ten (दशको समूह बनाऔँ)
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
  Package,
  Boxes,
  HelpCircle,
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
  targetNumber: number;
  options: number[];
  correct: number;
  explanationNp: string;
  explanationEn: string;
}

export const MakeAGroupOfTen: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modes: 'EXPLORE' (learn 11-20 grouping), 'PRACTICE' (interactive grouping puzzle), 'QUIZ' (evaluation)
  const [mode, setMode] = useState<'EXPLORE' | 'PRACTICE' | 'QUIZ'>('EXPLORE');

  // EXPLORE MODE STATE
  const [selectedNum, setSelectedNum] = useState<number>(14);
  const [isBundled, setIsBundled] = useState<boolean>(true);
  const [highlightedItem, setHighlightedItem] = useState<number | null>(null);

  // PRACTICE MODE STATE
  const [practiceTarget, setPracticeTarget] = useState<number>(13);
  const [selectedUnitsCount, setSelectedUnitsCount] = useState<number>(0);
  const [practiceFeedback, setPracticeFeedback] = useState<'idle' | 'success' | 'incorrect'>('idle');

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
        questionNp: '१० वटाको १ समूह र ३ वटा छुट्टै एकाइ मिलेर कुन सङ्ख्या बन्छ?',
        questionEn: 'What number is formed by 1 group of 10 and 3 loose ones?',
        targetNumber: 13,
        options: [12, 13, 14],
        correct: 13,
        explanationNp: '१० + ३ = १३ (तेह्र) हुन्छ।',
        explanationEn: '10 + 3 = 13 (Thirteen).',
      },
      {
        id: 2,
        questionNp: 'सङ्ख्या १५ मा १० को समूह बनाएपछि कति वटा एकाइ बाँकी रहन्छन्?',
        questionEn: 'In number 15, how many ones are left after making a group of 10?',
        targetNumber: 15,
        options: [4, 5, 6],
        correct: 5,
        explanationNp: '१५ मा १ दश र ५ एकाइ हुन्छन्, त्यसैले ५ वटा बाँकी रहन्छन्।',
        explanationEn: 'In 15, there is 1 ten and 5 ones, so 5 remain.',
      },
      {
        id: 3,
        questionNp: '१० + ८ मिलेर कुन सङ्ख्या बन्छ?',
        questionEn: 'What number is formed by 10 + 8?',
        targetNumber: 18,
        options: [17, 18, 19],
        correct: 18,
        explanationNp: '१० + ८ = १८ (अठार) हुन्छ।',
        explanationEn: '10 + 8 = 18 (Eighteen).',
      },
      {
        id: 4,
        questionNp: 'सङ्ख्या २० मा १० का कति वटा पूरा समूह हुन्छन्?',
        questionEn: 'How many full groups of 10 are there in 20?',
        targetNumber: 20,
        options: [1, 2, 3],
        correct: 2,
        explanationNp: '२० मा १० का २ वटा पूरा समूह (२ दश) हुन्छन्।',
        explanationEn: 'In 20, there are 2 complete groups of 10 (2 tens).',
      },
      {
        id: 5,
        questionNp: '१० को १ समूह र १ एकाइ मिलेर बन्ने सङ्ख्या कुन हो?',
        questionEn: 'What number is 1 group of ten and 1 one?',
        targetNumber: 11,
        options: [11, 12, 21],
        correct: 11,
        explanationNp: '१० + १ = ११ (एघार) बन्दछ।',
        explanationEn: '10 + 1 = 11 (Eleven).',
      },
      {
        id: 6,
        questionNp: '१७ बनाउन १० मा कति थप्नुपर्छ?',
        questionEn: 'How many ones must be added to 10 to make 17?',
        targetNumber: 17,
        options: [6, 7, 8],
        correct: 7,
        explanationNp: '१० + ७ = १७ हुन्छ।',
        explanationEn: '10 + 7 = 17.',
      },
      {
        id: 7,
        questionNp: '१ दश र ९ एकाइ मिलेर बन्ने सङ्ख्या के हो?',
        questionEn: 'What number is formed by 1 ten and 9 ones?',
        targetNumber: 19,
        options: [18, 19, 20],
        correct: 19,
        explanationNp: '१ दश र ९ एकाइ मिलेर १९ (उन्नाइस) बन्छ।',
        explanationEn: '1 ten and 9 ones make 19 (Nineteen).',
      },
      {
        id: 8,
        questionNp: 'सङ्ख्या १४ लाई कसरी लेख्न सकिन्छ?',
        questionEn: 'How can number 14 be represented?',
        targetNumber: 14,
        options: [14, 15, 13],
        correct: 14,
        explanationNp: '१० + ४ = १४ (१ दश र ४ एकाइ)।',
        explanationEn: '10 + 4 = 14 (1 ten and 4 ones).',
      },
      {
        id: 9,
        questionNp: 'सङ्ख्या १२ मा कति वटा दश र कति वटा एकाइ छन्?',
        questionEn: 'In number 12, how many tens and how many ones are there?',
        targetNumber: 12,
        options: [12, 21, 10],
        correct: 12,
        explanationNp: '१२ मा १ दश र २ एकाइ हुन्छन्।',
        explanationEn: '12 has 1 ten and 2 ones.',
      },
      {
        id: 10,
        questionNp: '१० + ६ को मान कति हुन्छ?',
        questionEn: 'What is the sum of 10 + 6?',
        targetNumber: 16,
        options: [15, 16, 17],
        correct: 16,
        explanationNp: '१० + ६ = १६ (सोह्र) हुन्छ।',
        explanationEn: '10 + 6 = 16 (Sixteen).',
      },
    ],
    []
  );

  // Web Audio Synthesizer
  const playSound = useCallback(
    (type: 'click' | 'bundle' | 'success' | 'fanfare' | 'boop') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();

        if (type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(480, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'bundle') {
          // Whimsical swoosh bundle chime
          [330, 440, 550, 660, 880].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = ctx.currentTime + idx * 0.05;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.12, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.25);
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

  // Record progress API
  const recordProgress = useCallback(async (score: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH9-02/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSpentSeconds: 120,
          metrics: {
            makeGroupOfTenScore: score,
            starsAwarded: Math.min(3, Math.ceil(score / 3.3)),
          },
        }),
      });
    } catch (err) {}
  }, []);

  // When Explore number changes
  const handleSelectNumber = (num: number) => {
    playSound('click');
    setSelectedNum(num);
    setIsBundled(true);
    setHighlightedItem(null);
    const nepNum = NEP_NUMERALS[num];
    const nepName = NEP_NAMES[num];
    const enName = EN_NAMES[num];
    const tens = num === 20 ? 2 : 1;
    const ones = num === 20 ? 0 : num - 10;
    speak(
      `${nepNum}, ${nepName}! ${tens === 1 ? '१ दश' : '२ दश'} र ${NEP_NUMERALS[ones]} एकाइ।`,
      `${num}, ${enName}! ${tens} ten and ${ones} ones.`
    );
  };

  const handleToggleBundle = () => {
    playSound('bundle');
    setIsBundled((prev) => !prev);
  };

  // Practice handlers
  const handlePracticeAddUnit = () => {
    if (selectedUnitsCount < practiceTarget) {
      playSound('click');
      setSelectedUnitsCount((prev) => prev + 1);
    }
  };

  const handlePracticeReset = () => {
    playSound('click');
    setSelectedUnitsCount(0);
    setPracticeFeedback('idle');
  };

  const handlePracticeVerify = () => {
    if (selectedUnitsCount === practiceTarget) {
      playSound('success');
      setPracticeFeedback('success');
      speak('स्याबास! तपाईंले सही समूह बनाउनुभयो!', 'Well done! You made the correct group!');
    } else {
      playSound('boop');
      setPracticeFeedback('incorrect');
      speak('फेरि मिलाउनुहोस्।', 'Try counting again.');
    }
  };

  const handleNextPracticeTarget = () => {
    playSound('click');
    const available = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const currentIdx = available.indexOf(practiceTarget);
    const nextTarget = available[(currentIdx + 1) % available.length];
    setPracticeTarget(nextTarget);
    setSelectedUnitsCount(0);
    setPracticeFeedback('idle');
  };

  // Quiz handlers
  const handleQuizAnswer = (selected: number) => {
    if (quizAnswered) return;
    setQuizSelected(selected);
    setQuizAnswered(true);
    const q = quizList[quizIndex];
    if (selected === q.correct) {
      playSound('success');
      setQuizScore((prev) => prev + 1);
      speak('स्याबास! सही उत्तर।', 'Great job! Correct answer.');
    } else {
      playSound('boop');
      speak('पुनः प्रयास गर्नुहोस्। सही उत्तर हेर्नुहोस्।', 'Not quite. Check the correct answer.');
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

  // Calculation for tens and ones
  const tensCount = selectedNum === 20 ? 2 : 1;
  const onesCount = selectedNum === 20 ? 0 : selectedNum - 10;

  return (
    <div className="relative w-full h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Header Bar */}
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
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                Simulation 02
              </span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'np' ? 'दशको समूह बनाऔँ (१० + क = ११ देखि २०)' : 'Make a Group of Ten (10 + N)'}
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
              mode === 'EXPLORE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            {language === 'np' ? 'दशको समूह सिक्ने' : 'Explore Bundling'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setMode('PRACTICE');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              mode === 'PRACTICE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            {language === 'np' ? 'समूह बनाउने अभ्यास' : 'Practice Builder'}
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
            {language === 'np' ? 'मूल्याङ्कन परीक्षा' : 'Quiz Challenge'}
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
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
          >
            {language === 'np' ? 'English' : 'नेपाली'}
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* ========================================================================= */}
        {/* MODE 1: EXPLORE BUNDLING (१० + क = ११ देखि २०) */}
        {/* ========================================================================= */}
        {mode === 'EXPLORE' && (
          <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
            {/* Number Selector Row 11 - 20 */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
              <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">
                {language === 'np' ? 'सङ्ख्या छान्नुहोस्:' : 'Choose Number:'}
              </span>
              {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSelectNumber(num)}
                  className={`w-11 h-11 rounded-xl font-bold flex flex-col items-center justify-center transition-all ${
                    selectedNum === num
                      ? 'bg-amber-500 text-slate-950 scale-105 shadow-lg shadow-amber-500/30 ring-2 ring-amber-300'
                      : 'bg-slate-700/80 hover:bg-slate-700 text-white hover:scale-102'
                  }`}
                >
                  <span className="text-sm leading-none">{NEP_NUMERALS[num]}</span>
                  <span className="text-[10px] leading-none opacity-80">{num}</span>
                </button>
              ))}
            </div>

            {/* Central Stage: Interactive Visual Workbench */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[380px]">
              {/* Left & Center: Bundles & Ones Display (8 cols) */}
              <div className="lg:col-span-8 bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-3xl border border-slate-700/80 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                {/* Background glow decoration */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Subheader banner */}
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <span>{NEP_NUMERALS[selectedNum]}</span>
                      <span className="text-amber-400">({selectedNum})</span>
                      <span className="text-slate-400 font-normal text-sm">
                        • {language === 'np' ? NEP_NAMES[selectedNum] : EN_NAMES[selectedNum]}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedNum === 20
                        ? language === 'np'
                          ? '२० मा १० का २ वटा पूरा समूह (दहाइ) हुन्छन् र एकाइ शून्य रहन्छ।'
                          : '20 consists of 2 complete bundles of ten with zero ones.'
                        : language === 'np'
                        ? `१० वटाको १ समूह (दहाइ) र थप ${NEP_NUMERALS[onesCount]} वटा छुट्टाछुट्टै एकाइ।`
                        : `1 bundle of ten and ${onesCount} loose unit blocks.`}
                    </p>
                  </div>

                  <button
                    onClick={handleToggleBundle}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                      isBundled
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    {isBundled
                      ? language === 'np'
                        ? 'समूह खोल्नुहोस्'
                        : 'Unbundle'
                      : language === 'np'
                      ? '१० को समूह बाँध्नुहोस्'
                      : 'Bundle 10'}
                  </button>
                </div>

                {/* Interactive Visual Display: Tens Bundle vs Ones Blocks */}
                <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-6 py-6">
                  {/* TENS COLUMN (दहाइ) */}
                  <div className="flex-1 w-full flex flex-col items-center bg-slate-900/60 p-4 rounded-2xl border border-emerald-500/30">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
                      <Package className="w-4 h-4" />
                      {language === 'np' ? `दहाइ (१० को समूह: ${NEP_NUMERALS[tensCount]})` : `Tens (Groups of 10: ${tensCount})`}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 min-h-[160px]">
                      {Array.from({ length: tensCount }).map((_, bundleIdx) => (
                        <div
                          key={bundleIdx}
                          className={`relative p-3 rounded-2xl transition-all duration-500 ${
                            isBundled
                              ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/30 border-2 border-amber-400 shadow-lg shadow-amber-500/10'
                              : 'bg-slate-800/80 border border-slate-700'
                          }`}
                        >
                          {/* Bundle ribbon tag */}
                          {isBundled && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow">
                              १० को समूह (10)
                            </div>
                          )}

                          {/* 10 stacked or bundled wooden/crystal cubes */}
                          <div className="grid grid-cols-2 gap-1.5">
                            {Array.from({ length: 10 }).map((_, itemIdx) => (
                              <div
                                key={itemIdx}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner transition-transform hover:scale-110 ${
                                  isBundled
                                    ? 'bg-amber-400 text-amber-950 border border-amber-300'
                                    : 'bg-emerald-500 text-emerald-950 border border-emerald-300'
                                }`}
                              >
                                {NEP_NUMERALS[itemIdx + 1]}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <span className="mt-3 text-xs font-semibold text-emerald-300">
                      {tensCount === 1 ? '१ दश = १०' : '२ दश = २०'}
                    </span>
                  </div>

                  {/* PLUS CONNECTOR */}
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-amber-400">+</span>
                  </div>

                  {/* ONES COLUMN (एकाइ) */}
                  <div className="flex-1 w-full flex flex-col items-center bg-slate-900/60 p-4 rounded-2xl border border-sky-500/30">
                    <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 mb-3">
                      <Boxes className="w-4 h-4" />
                      {language === 'np' ? `एकाइ (बाँकी क्युबहरू: ${NEP_NUMERALS[onesCount]})` : `Ones (Loose Cubes: ${onesCount})`}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 min-h-[160px] p-2">
                      {onesCount === 0 ? (
                        <div className="text-slate-500 text-xs italic text-center p-4">
                          {language === 'np' ? 'शून्य एकाइ (कुनै बाँकी छैन)' : 'Zero ones (all bundled)'}
                        </div>
                      ) : (
                        Array.from({ length: onesCount }).map((_, idx) => (
                          <div
                            key={idx}
                            onMouseEnter={() => setHighlightedItem(idx + 1)}
                            onMouseLeave={() => setHighlightedItem(null)}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white font-bold flex items-center justify-center text-sm shadow-md border border-sky-300 transition-transform transform hover:scale-115 cursor-pointer"
                          >
                            {NEP_NUMERALS[idx + 1]}
                          </div>
                        ))
                      )}
                    </div>

                    <span className="mt-3 text-xs font-semibold text-sky-300">
                      {language === 'np' ? `${NEP_NUMERALS[onesCount]} एकाइ` : `${onesCount} Ones`}
                    </span>
                  </div>
                </div>

                {/* Bottom Mathematical Formula Card */}
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold">
                      {language === 'np' ? 'गणितीय सूत्र:' : 'Equation:'}
                    </span>
                    <span className="text-xl md:text-2xl font-black text-white tracking-wide">
                      {tensCount === 2 ? (
                        <>
                          १० + १० = <span className="text-amber-400">२०</span> (बीस)
                        </>
                      ) : (
                        <>
                          १० + {NEP_NUMERALS[onesCount]} ={' '}
                          <span className="text-amber-400">{NEP_NUMERALS[selectedNum]}</span> ({NEP_NAMES[selectedNum]})
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-bold">
                      दहाइ = {NEP_NUMERALS[tensCount]}
                    </span>
                    <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 rounded-lg font-bold">
                      एकाइ = {NEP_NUMERALS[onesCount]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Place Value Table & Audio Guide (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Place Value Table (स्थानमान तालिका) */}
                <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      {language === 'np' ? 'स्थानमान तालिका (Place Value)' : 'Place Value Table'}
                    </h3>

                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="bg-slate-900/60 text-xs font-bold text-slate-400">
                          <th className="p-2 border border-slate-700 text-emerald-400">
                            {language === 'np' ? 'दहाइ (Tens)' : 'Tens'}
                          </th>
                          <th className="p-2 border border-slate-700 text-sky-400">
                            {language === 'np' ? 'एकाइ (Ones)' : 'Ones'}
                          </th>
                          <th className="p-2 border border-slate-700 text-amber-400">
                            {language === 'np' ? 'सङ्ख्या (Number)' : 'Total'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-slate-800/40 text-lg font-black text-white">
                          <td className="p-3 border border-slate-700 text-emerald-300 bg-emerald-500/10">
                            {NEP_NUMERALS[tensCount]}
                          </td>
                          <td className="p-3 border border-slate-700 text-sky-300 bg-sky-500/10">
                            {NEP_NUMERALS[onesCount]}
                          </td>
                          <td className="p-3 border border-slate-700 text-amber-300 bg-amber-500/10">
                            {NEP_NUMERALS[selectedNum]}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-4 p-3 rounded-xl bg-slate-900/50 border border-slate-700 text-xs text-slate-300 space-y-2">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p>
                          {language === 'np'
                            ? '११ देखि १९ सम्मका प्रत्येक सङ्ख्यामा सधैँ १ दश र बाँकी एकाइ हुन्छन्।'
                            : 'Every number from 11 to 19 has exactly 1 ten and additional ones.'}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <p>
                          {language === 'np'
                            ? '२० मा १० का २ पूरा समूह हुन्छन्, त्यसैले २ दहाइ र ० एकाइ हुन्छ।'
                            : '20 has 2 full tens bundles, which means 2 tens and 0 ones.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      speak(
                        `${NEP_NUMERALS[selectedNum]} मा ${tensCount === 1 ? '१ दश' : '२ दश'} र ${NEP_NUMERALS[onesCount]} एकाइ छन्। १० र ${NEP_NUMERALS[onesCount]} मिलेर ${NEP_NUMERALS[selectedNum]} बन्दछ।`,
                        `In ${selectedNum}, there is ${tensCount} ten and ${onesCount} ones. 10 and ${onesCount} make ${selectedNum}.`
                      )
                    }
                    className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Volume2 className="w-4 h-4" />
                    {language === 'np' ? 'उच्चारण सुन्नुहोस्' : 'Listen Explanation'}
                  </button>
                </div>

                {/* Quick Number Cards Navigator */}
                <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-4 shadow-xl flex-1 flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {language === 'np' ? 'क्रमशः अगाडि बढ्नुहोस्:' : 'Step Through:'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={selectedNum <= 11}
                      onClick={() => handleSelectNumber(selectedNum - 1)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-xs font-bold transition"
                    >
                      ← {language === 'np' ? 'अघिल्लो' : 'Previous'}
                    </button>
                    <button
                      disabled={selectedNum >= 20}
                      onClick={() => handleSelectNumber(selectedNum + 1)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold text-white transition"
                    >
                      {language === 'np' ? 'पछिल्लो' : 'Next'} →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: PRACTICE BUILDER (प्रयोगशाला) */}
        {/* ========================================================================= */}
        {mode === 'PRACTICE' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-5xl mx-auto w-full">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
              {/* Mission Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-700 pb-4 gap-4">
                <div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    {language === 'np' ? 'चुनौती कार्य' : 'Mission Challenge'}
                  </span>
                  <h2 className="text-2xl font-extrabold text-white mt-1">
                    {language === 'np' ? (
                      <>
                        सङ्ख्या <span className="text-amber-400">{NEP_NUMERALS[practiceTarget]}</span> ({NEP_NAMES[practiceTarget]}) बनाउनुहोस्!
                      </>
                    ) : (
                      <>
                        Build the number <span className="text-amber-400">{practiceTarget}</span> ({EN_NAMES[practiceTarget]})!
                      </>
                    )}
                  </h2>
                </div>

                <button
                  onClick={handleNextPracticeTarget}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {language === 'np' ? 'अर्को सङ्ख्या छान्नुहोस्' : 'Try Another'}
                </button>
              </div>

              {/* Workbench Layout: 1 Ten Bundle Pre-loaded + Clickable Single Units */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pre-bundled 10 */}
                <div className="bg-slate-900/70 p-5 rounded-2xl border border-amber-500/40 flex flex-col items-center justify-between min-h-[220px]">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {language === 'np' ? '१ दशको समूह (सधैँ तयार १०)' : '1 Group of Ten (Ready 10)'}
                  </span>
                  <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-400/50 flex flex-wrap gap-2 justify-center max-w-[200px]">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 font-bold text-xs flex items-center justify-center shadow"
                      >
                        {NEP_NUMERALS[i + 1]}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-300">
                    {language === 'np' ? 'आधार = १०' : 'Base = 10'}
                  </span>
                </div>

                {/* Additional Units Box */}
                <div className="bg-slate-900/70 p-5 rounded-2xl border border-sky-500/40 flex flex-col items-center justify-between min-h-[220px]">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    {language === 'np'
                      ? `थपिएका एकाइहरू (${NEP_NUMERALS[Math.max(0, selectedUnitsCount - 10)]})`
                      : `Added Loose Units (${Math.max(0, selectedUnitsCount - 10)})`}
                  </span>

                  {/* Loose units area */}
                  <div className="flex flex-wrap items-center justify-center gap-2 p-3 min-h-[100px] w-full">
                    {selectedUnitsCount <= 10 ? (
                      <span className="text-xs text-slate-500 italic">
                        {language === 'np' ? 'तलको हरियो बटन थिचेर एकाइ थप्नुहोस्' : 'Click the button below to add ones'}
                      </span>
                    ) : (
                      Array.from({ length: selectedUnitsCount - 10 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-lg bg-sky-400 text-sky-950 font-bold text-xs flex items-center justify-center shadow animate-scaleIn"
                        >
                          {NEP_NUMERALS[i + 1]}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Buttons to Add / Reset */}
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => {
                        playSound('click');
                        if (selectedUnitsCount < 20) {
                          setSelectedUnitsCount((prev) => (prev < 10 ? 10 + 1 : prev + 1));
                        }
                      }}
                      className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
                    >
                      + {language === 'np' ? '१ एकाइ थप्नुहोस्' : 'Add 1 Unit'}
                    </button>
                    <button
                      onClick={handlePracticeReset}
                      className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status and Verification */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400">
                    {language === 'np' ? 'तपाईंले बनाएको जम्मा सङ्ख्या:' : 'Current Total Built:'}
                  </span>
                  <div className="text-2xl font-black text-amber-400">
                    १० + {NEP_NUMERALS[Math.max(0, selectedUnitsCount - 10)]} ={' '}
                    {NEP_NUMERALS[selectedUnitsCount || 10]}
                  </div>
                </div>

                <button
                  onClick={handlePracticeVerify}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {language === 'np' ? 'जाँच गर्नुहोस् (Check)' : 'Check Answer'}
                </button>
              </div>

              {/* Feedback Alert */}
              {practiceFeedback === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    {language === 'np'
                      ? `स्याबास! १० र ${NEP_NUMERALS[practiceTarget - 10]} मिलेर ठीक ${NEP_NUMERALS[practiceTarget]} बन्यो!`
                      : `Well done! 10 and ${practiceTarget - 10} equals exactly ${practiceTarget}!`}
                  </div>
                </div>
              )}
              {practiceFeedback === 'incorrect' && (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-200 text-sm font-bold flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    {language === 'np'
                      ? `अझै पुगेन वा बढी भयो। तपाईंलाई ${NEP_NUMERALS[practiceTarget]} बनाउनु छ!`
                      : `Not quite right yet. You need to make ${practiceTarget}!`}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: QUIZ EVALUATION (१० प्रश्नहरूको परीक्षा) */}
        {/* ========================================================================= */}
        {mode === 'QUIZ' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-3xl mx-auto w-full justify-center">
            {!quizCompleted ? (
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700 pb-3">
                  <span className="font-bold text-amber-400">
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

                {/* Feedback & Explanation */}
                {quizAnswered && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300">
                    <p className="font-bold text-amber-400 mb-1">
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
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Quiz Finished Celebratory Card */
              <div className="bg-slate-800/95 border-2 border-amber-500/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Award className="w-10 h-10 text-amber-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">
                    {language === 'np' ? 'बधाई छ! मूल्याङ्कन पूरा भयो!' : 'Congratulations! Quiz Completed!'}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    {language === 'np'
                      ? 'तपाईंले दशको समूह र एकाइ सम्बन्धी ज्ञान सफलतापूर्वक हासिल गर्नुभयो।'
                      : 'You have mastered groups of ten and place values 11–20.'}
                  </p>
                </div>

                <div className="text-4xl font-black text-amber-400">
                  {NEP_NUMERALS[quizScore]} / {NEP_NUMERALS[quizList.length]}
                  <span className="text-xs text-slate-400 block font-normal mt-1">
                    {quizScore >= 8 ? 'उत्कृष्ट (Outstanding)' : 'राम्रो (Good effort)'}
                  </span>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleQuizReset}
                    className="flex-1 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'फेरि प्रयास गर्नुहोस्' : 'Retake Quiz'}
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setMode('EXPLORE');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'सिकाइमा फर्कनुहोस्' : 'Back to Explore'}
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

