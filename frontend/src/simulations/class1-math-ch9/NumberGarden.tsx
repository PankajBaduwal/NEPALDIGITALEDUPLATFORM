/**
 * NumberGarden.tsx
 * Simulation 01: Number Garden 11–20 (११ देखि २० सम्मको सङ्ख्या बगैँचा)
 * Class 1 Mathematics - Chapter 9: Numbers 11 to 20 (११ देखि २० सम्मका सङ्ख्याहरू)
 * Nepal Digital Education Platform
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Eye,
  HelpCircle,
} from 'lucide-react';
import {
  NumberGardenEnvironment,
  GardenObjectType,
  ClickedGardenObject,
} from './NumberGardenEnvironment';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_NUMERALS: Record<number, string> = {
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

interface QuizQuestion {
  questionNp: string;
  questionEn: string;
  count: number;
  type: GardenObjectType;
  options: number[];
  correct: number;
  explanationNp: string;
  explanationEn: string;
}

export const NumberGarden: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Stage: 1, 2, 3, 4, 'ASSESSMENT', or 'FREE_EXPLORE'
  const [activeStage, setActiveStage] = useState<number | 'ASSESSMENT' | 'FREE_EXPLORE'>(1);

  // 3D Environment Reference
  const mountRef = useRef<HTMLDivElement | null>(null);
  const envRef = useRef<NumberGardenEnvironment | null>(null);

  // Current Garden Target
  const [objectType, setObjectType] = useState<GardenObjectType>('APPLES');
  const [targetCount, setTargetCount] = useState<number>(12);
  const [countedSet, setCountedSet] = useState<Set<number>>(new Set());

  // Interactive User Selection
  const [userSelected, setUserSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 15 Assessment Questions
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedQuizChoice, setSelectedQuizChoice] = useState<number | null>(null);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);

  // Sound generator
  const playSound = useCallback(
    (type: 'click' | 'tap' | 'success' | 'boop' | 'fanfare', step?: number) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(550, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } else if (type === 'tap') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const freq = 280 + (step || 1) * 30;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
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

  useEffect(() => {
    if (!mountRef.current) return;
    const env = new NumberGardenEnvironment(mountRef.current);
    envRef.current = env;

    env.onObjectClick = (info: ClickedGardenObject) => {
      setCountedSet((prev) => {
        if (prev.has(info.id)) return prev;
        const next = new Set(prev).add(info.id);
        playSound('tap', next.size);
        if (next.size === targetCount) {
          playSound('success');
          speak(
            `स्याबास! यहाँ जम्मा ${NEP_NUMERALS[targetCount]} (${NEP_NAMES[targetCount]}) वटा वस्तु छन्।`,
            `Great! There are ${targetCount} (${EN_NAMES[targetCount]}) items altogether.`
          );
        }
        env.setObjects(objectType, targetCount, next);
        return next;
      });
    };

    return () => {
      env.dispose();
      envRef.current = null;
    };
  }, [targetCount, objectType, playSound, speak]);

  const syncEnvironment = useCallback(
    (type: GardenObjectType, count: number) => {
      if (!envRef.current) return;
      envRef.current.setObjects(type, count, new Set());
      setCountedSet(new Set());
    },
    []
  );

  const handleStageSelect = (stage: number | 'ASSESSMENT' | 'FREE_EXPLORE') => {
    playSound('click');
    setActiveStage(stage);
    setUserSelected(null);
    setIsCorrect(null);

    if (stage === 1) {
      // Activity A: Count 12 apples
      setObjectType('APPLES');
      setTargetCount(12);
      syncEnvironment('APPLES', 12);
      speak(
        'बगैँचामा १२ वटा स्याउ छन्। एक-एक गरी गन्नुहोस्।',
        'There are 12 apples in the garden. Count them one by one.'
      );
    } else if (stage === 2) {
      // Activity B: Find the correct number (15 flowers)
      setObjectType('FLOWERS');
      setTargetCount(15);
      syncEnvironment('FLOWERS', 15);
      speak(
        'यहाँ कति ओटा फूल छन्? गनेर सही सङ्ख्या छान्नुहोस्।',
        'How many flowers are here? Count and select the correct number.'
      );
    } else if (stage === 3) {
      // Activity C: 18 balloons
      setObjectType('BALLOONS');
      setTargetCount(18);
      syncEnvironment('BALLOONS', 18);
      speak(
        'यहाँ १८ वटा बेलुन छन्। गन्ती पूरा गर्नुहोस्।',
        'There are 18 balloons. Complete the count.'
      );
    } else if (stage === 4) {
      // Activity D: Match quantity & numeral (20 butterflies)
      setObjectType('BUTTERFLIES');
      setTargetCount(20);
      syncEnvironment('BUTTERFLIES', 20);
      speak(
        '२० वटा पुतलीहरूलाई सङ्ख्या कार्डसँग जोडा मिलाउनुहोस्।',
        'Match 20 butterflies with the numeral card.'
      );
    } else if (stage === 'ASSESSMENT') {
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(false);
      setSelectedQuizChoice(null);
      setQuizComplete(false);
      const q = quizQuestions[0];
      setObjectType(q.type);
      setTargetCount(q.count);
      syncEnvironment(q.type, q.count);
      speak(q.questionNp, q.questionEn);
    } else if (stage === 'FREE_EXPLORE') {
      syncEnvironment(objectType, targetCount);
      speak(
        'खुला बगैँचामा ११ देखि २० सम्मका वस्तुहरू गन्दै रमाउनुहोस्।',
        'Count items from 11 to 20 freely in the number garden.'
      );
    }
  };

  // 15 Comprehensive Assessment Questions for 11–20
  const quizQuestions: QuizQuestion[] = [
    {
      questionNp: 'यहाँ कति ओटा स्याउ छन्?',
      questionEn: 'How many apples are there?',
      count: 11,
      type: 'APPLES',
      options: [11, 12, 13],
      correct: 11,
      explanationNp: 'यहाँ ११ (एघार) वटा स्याउ छन्।',
      explanationEn: 'There are 11 (Eleven) apples.',
    },
    {
      questionNp: 'यहाँ कति ओटा फूल छन्?',
      questionEn: 'How many flowers are there?',
      count: 14,
      type: 'FLOWERS',
      options: [13, 14, 15],
      correct: 14,
      explanationNp: 'यहाँ १४ (चौध) वटा फूल छन्।',
      explanationEn: 'There are 14 (Fourteen) flowers.',
    },
    {
      questionNp: 'यहाँ कति ओटा पुतली छन्?',
      questionEn: 'How many butterflies are there?',
      count: 16,
      type: 'BUTTERFLIES',
      options: [15, 16, 17],
      correct: 16,
      explanationNp: 'यहाँ १६ (सोह्र) वटा पुतली छन्।',
      explanationEn: 'There are 16 (Sixteen) butterflies.',
    },
    {
      questionNp: 'यहाँ कति ओटा बेलुन छन्?',
      questionEn: 'How many balloons are there?',
      count: 18,
      type: 'BALLOONS',
      options: [17, 18, 19],
      correct: 18,
      explanationNp: 'यहाँ १८ (अठार) वटा बेलुन छन्।',
      explanationEn: 'There are 18 (Eighteen) balloons.',
    },
    {
      questionNp: 'यहाँ कति ओटा स्याउ छन्?',
      questionEn: 'How many apples are there?',
      count: 20,
      type: 'APPLES',
      options: [18, 19, 20],
      correct: 20,
      explanationNp: 'यहाँ २० (बीस) वटा स्याउ छन्।',
      explanationEn: 'There are 20 (Twenty) apples.',
    },
    {
      questionNp: 'सङ्ख्या १३ को नेपाली नाम के हो?',
      questionEn: 'What is the Nepali name for 13?',
      count: 13,
      type: 'FLOWERS',
      options: [12, 13, 14],
      correct: 13,
      explanationNp: '१३ लाई "तेह्र" (Thirteen) भनिन्छ।',
      explanationEn: '13 is Thirteen (तेह्र).',
    },
    {
      questionNp: '१० र ५ मिलेर कुन सङ्ख्या बन्छ?',
      questionEn: 'What number is formed by 10 and 5?',
      count: 15,
      type: 'APPLES',
      options: [14, 15, 16],
      correct: 15,
      explanationNp: '१० + ५ = १५ (पन्ध्र) हुन्छ।',
      explanationEn: '10 + 5 = 15 (Fifteen).',
    },
    {
      questionNp: 'यहाँ कति ओटा पुतली छन्?',
      questionEn: 'How many butterflies are there?',
      count: 12,
      type: 'BUTTERFLIES',
      options: [11, 12, 13],
      correct: 12,
      explanationNp: 'यहाँ १२ (बाह्र) वटा पुतली छन्।',
      explanationEn: 'There are 12 (Twelve) butterflies.',
    },
    {
      questionNp: '१० र ७ मिलेर कुन सङ्ख्या बन्छ?',
      questionEn: 'What number is formed by 10 and 7?',
      count: 17,
      type: 'FLOWERS',
      options: [16, 17, 18],
      correct: 17,
      explanationNp: '१० + ७ = १७ (सत्र) हुन्छ।',
      explanationEn: '10 + 7 = 17 (Seventeen).',
    },
    {
      questionNp: 'यहाँ कति ओटा बेलुन छन्?',
      questionEn: 'How many balloons are there?',
      count: 19,
      type: 'BALLOONS',
      options: [18, 19, 20],
      correct: 19,
      explanationNp: 'यहाँ १९ (उन्नाइस) वटा बेलुन छन्।',
      explanationEn: 'There are 19 (Nineteen) balloons.',
    },
    {
      questionNp: 'सङ्ख्या १६ को नेपाली नाम के हो?',
      questionEn: 'What is the Nepali name for 16?',
      count: 16,
      type: 'APPLES',
      options: [15, 16, 17],
      correct: 16,
      explanationNp: '१६ लाई "सोह्र" (Sixteen) भनिन्छ।',
      explanationEn: '16 is Sixteen (सोह्र).',
    },
    {
      questionNp: '१० र २ मिलेर कुन सङ्ख्या बन्छ?',
      questionEn: 'What number is formed by 10 and 2?',
      count: 12,
      type: 'FLOWERS',
      options: [11, 12, 13],
      correct: 12,
      explanationNp: '१० + २ = १२ (बाह्र) हुन्छ।',
      explanationEn: '10 + 2 = 12 (Twelve).',
    },
    {
      questionNp: '१० र १० मिलेर कति बन्छ?',
      questionEn: 'What number is formed by 10 and 10?',
      count: 20,
      type: 'BUTTERFLIES',
      options: [18, 19, 20],
      correct: 20,
      explanationNp: '१० + १० = २० (बीस) हुन्छ।',
      explanationEn: '10 + 10 = 20 (Twenty).',
    },
    {
      questionNp: 'यहाँ कति ओटा फूल छन्?',
      questionEn: 'How many flowers are there?',
      count: 13,
      type: 'FLOWERS',
      options: [12, 13, 14],
      correct: 13,
      explanationNp: 'यहाँ १३ (तेह्र) वटा फूल छन्।',
      explanationEn: 'There are 13 (Thirteen) flowers.',
    },
    {
      questionNp: 'सङ्ख्या १८ को अङ्क कुन हो?',
      questionEn: 'Which is the numeral for Eighteen?',
      count: 18,
      type: 'APPLES',
      options: [17, 18, 19],
      correct: 18,
      explanationNp: 'अठारलाई १८ (18) लेखिन्छ।',
      explanationEn: 'Eighteen is written as 18 (१८).',
    },
  ];

  const persistProgress = useCallback(
    async (score: number) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch(
          '/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH9-01/progress',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              timeSpentSeconds: 120,
              metrics: {
                numberGardenScore: score,
                starsAwarded: Math.min(3, Math.ceil(score / 5)),
              },
            }),
          }
        );
      } catch (err) {}
    },
    []
  );

  return (
    <div className="relative w-full h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Header Bar */}
      <header className="h-16 px-4 bg-slate-800/90 backdrop-blur border-b border-slate-700 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLibrary}
            className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition text-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Class 1 • Math • Chapter 9
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                3D WebGL
              </span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'np' ? '११ देखि २० सम्मको सङ्ख्या बगैँचा' : 'Number Garden 11–20'}
            </h1>
          </div>
        </div>

        {/* Stage Pills */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60 text-xs">
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              onClick={() => handleStageSelect(s)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeStage === s
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {s === 1
                ? language === 'np'
                  ? '१२ स्याउ'
                  : 'Count 12'
                : s === 2
                ? language === 'np'
                  ? '१५ फूल'
                  : 'Find 15'
                : s === 3
                ? language === 'np'
                  ? '१८ बेलुन'
                  : 'Count 18'
                : language === 'np'
                ? '२० पुतली'
                : 'Match 20'}
            </button>
          ))}
          <button
            onClick={() => handleStageSelect('ASSESSMENT')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              activeStage === 'ASSESSMENT'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {language === 'np' ? 'मूल्याङ्कन' : 'Quiz'}
          </button>
          <button
            onClick={() => handleStageSelect('FREE_EXPLORE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              activeStage === 'FREE_EXPLORE'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'np' ? 'खुला बगैँचा' : 'Free Explore'}
          </button>
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

      {/* 3D Viewport */}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Camera Focus Controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-1.5 bg-slate-900/80 backdrop-blur p-1 rounded-xl border border-slate-700 text-xs">
          {(['GARDEN', 'TABLE', 'TREE'] as const).map((cam) => (
            <button
              key={cam}
              onClick={() => {
                playSound('click');
                envRef.current?.setCameraPreset(cam);
              }}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              {cam === 'GARDEN'
                ? language === 'np'
                  ? 'पूरै बगैँचा'
                  : 'Garden'
                : cam === 'TABLE'
                ? language === 'np'
                  ? 'टेबुल'
                  : 'Table'
                : language === 'np'
                ? 'रुख'
                : 'Tree'}
            </button>
          ))}
        </div>

        {/* Live Count Counter Top Right */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/85 backdrop-blur px-5 py-2.5 rounded-2xl border border-emerald-500/40 shadow-xl flex items-center gap-4">
          <div className="text-center">
            <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
              {language === 'np' ? 'गनेको सङ्ख्या' : 'Counted'}
            </span>
            <span className="text-2xl font-black text-amber-400">
              {language === 'np' ? NEP_NUMERALS[countedSet.size] || countedSet.size : countedSet.size}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">
              {language === 'np' ? 'अक्षरेपी नाम' : 'Number Name'}
            </span>
            <span className="text-base font-bold text-white">
              {language === 'np'
                ? NEP_NAMES[countedSet.size] || '—'
                : EN_NAMES[countedSet.size] || '—'}
            </span>
          </div>
        </div>

        {/* ── INTERACTIVE STAGE PANELS ─────────────────────────────── */}
        {typeof activeStage === 'number' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-2xl bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {language === 'np'
                  ? `तह ${activeStage}: सङ्ख्या ${NEP_NUMERALS[targetCount]} (${NEP_NAMES[targetCount]})`
                  : `Level ${activeStage}: Number ${targetCount} (${EN_NAMES[targetCount]})`}
              </span>
              <button
                onClick={() =>
                  speak(
                    `यहाँ ${NEP_NUMERALS[targetCount]} (${NEP_NAMES[targetCount]}) वटा वस्तु छन्। गन्नुहोस्।`,
                    `There are ${targetCount} (${EN_NAMES[targetCount]}) objects. Count them.`
                  )
                }
                className="text-slate-400 hover:text-white"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-medium text-slate-200">
              {language === 'np'
                ? countedSet.size < targetCount
                  ? `३डी वस्तुहरूमा थिचेर गन्नुहोस् (गनेको: ${NEP_NUMERALS[countedSet.size] || countedSet.size} / ${NEP_NUMERALS[targetCount]})।`
                  : `सबास! तपाईंले ठ्याक्कै ${NEP_NUMERALS[targetCount]} (${NEP_NAMES[targetCount]}) वटा वस्तु गन्नुभयो!`
                : countedSet.size < targetCount
                ? `Click each 3D object to count (Counted: ${countedSet.size} of ${targetCount}).`
                : `Awesome! You accurately counted ${targetCount} (${EN_NAMES[targetCount]}) items!`
              }
            </p>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {
                  syncEnvironment(objectType, targetCount);
                  playSound('click');
                }}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {language === 'np' ? 'पुनः' : 'Reset'}
              </button>

              {countedSet.size >= targetCount && (
                <button
                  onClick={() => {
                    if (activeStage < 4) {
                      handleStageSelect(activeStage + 1);
                    } else {
                      handleStageSelect('ASSESSMENT');
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg active:scale-95 transition flex items-center gap-1.5"
                >
                  {activeStage < 4
                    ? language === 'np'
                      ? 'अर्को तह'
                      : 'Next Level'
                    : language === 'np'
                    ? 'मूल्याङ्कन सुरु गरौँ'
                    : 'Start Quiz'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── 15-QUESTION ASSESSMENT OVERLAY ───────────────────────── */}
        {activeStage === 'ASSESSMENT' && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            {!quizComplete ? (
              <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-bold text-white">
                      {language === 'np' ? 'सङ्ख्या ११–२० मूल्याङ्कन' : 'Numbers 11–20 Quiz'}
                    </h2>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                    {language === 'np'
                      ? `प्रश्न ${NEP_NUMERALS[quizIndex + 1] || quizIndex + 1} / १५`
                      : `Question ${quizIndex + 1} of 15`}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    {language === 'np'
                      ? quizQuestions[quizIndex].questionNp
                      : quizQuestions[quizIndex].questionEn}
                  </h3>
                </div>

                {/* Choices */}
                <div className="grid grid-cols-3 gap-3">
                  {quizQuestions[quizIndex].options.map((opt) => (
                    <button
                      key={opt}
                      disabled={quizAnswered}
                      onClick={() => {
                        const correct = opt === quizQuestions[quizIndex].correct;
                        setSelectedQuizChoice(opt);
                        setQuizAnswered(true);
                        if (correct) {
                          setQuizScore((s) => s + 1);
                          playSound('success');
                        } else {
                          playSound('boop');
                        }
                      }}
                      className={`py-4 rounded-2xl font-black text-xl border transition ${
                        quizAnswered
                          ? opt === quizQuestions[quizIndex].correct
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                            : selectedQuizChoice === opt
                            ? 'bg-rose-600 border-rose-400 text-white'
                            : 'bg-slate-800/50 border-slate-700 text-slate-500'
                          : 'bg-slate-800 border-slate-700 hover:border-emerald-500 hover:bg-slate-750 text-white active:scale-95'
                      }`}
                    >
                      <span>{language === 'np' ? NEP_NUMERALS[opt] || opt : opt}</span>
                      <span className="block text-xs font-normal opacity-80 mt-0.5">
                        {language === 'np' ? NEP_NAMES[opt] : EN_NAMES[opt]}
                      </span>
                    </button>
                  ))}
                </div>

                {quizAnswered && (
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
                    <span className="font-bold text-emerald-400 block mb-1">
                      {selectedQuizChoice === quizQuestions[quizIndex].correct
                        ? language === 'np'
                          ? 'सही उत्तर!'
                          : 'Correct!'
                        : language === 'np'
                        ? 'समाधान:'
                        : 'Explanation:'}
                    </span>
                    {language === 'np'
                      ? quizQuestions[quizIndex].explanationNp
                      : quizQuestions[quizIndex].explanationEn}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  {quizAnswered && (
                    <button
                      onClick={() => {
                        if (quizIndex < quizQuestions.length - 1) {
                          const nextIdx = quizIndex + 1;
                          setQuizIndex(nextIdx);
                          setQuizAnswered(false);
                          setSelectedQuizChoice(null);
                          const q = quizQuestions[nextIdx];
                          setObjectType(q.type);
                          setTargetCount(q.count);
                          syncEnvironment(q.type, q.count);
                          speak(q.questionNp, q.questionEn);
                        } else {
                          setQuizComplete(true);
                          playSound('fanfare');
                          persistProgress(quizScore);
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition"
                    >
                      {quizIndex < quizQuestions.length - 1
                        ? language === 'np'
                          ? 'अर्को प्रश्न'
                          : 'Next Question'
                        : language === 'np'
                        ? 'नतिजा हेरौँ'
                        : 'View Results'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400">
                  <Trophy className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-white">
                  {language === 'np' ? 'मूल्याङ्कन सम्पन्न भयो!' : 'Quiz Completed!'}
                </h2>
                <div className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex justify-around">
                  <div>
                    <span className="text-xs text-slate-400 block">
                      {language === 'np' ? 'जम्मा प्रश्न' : 'Total'}
                    </span>
                    <span className="text-xl font-bold text-white">१५ / 15</span>
                  </div>
                  <div className="w-px bg-slate-700" />
                  <div>
                    <span className="text-xs text-emerald-400 block">
                      {language === 'np' ? 'सही उत्तर' : 'Correct'}
                    </span>
                    <span className="text-xl font-bold text-emerald-400">
                      {language === 'np' ? NEP_NUMERALS[quizScore] || quizScore : quizScore}
                    </span>
                  </div>
                  <div className="w-px bg-slate-700" />
                  <div>
                    <span className="text-xs text-amber-400 block">
                      {language === 'np' ? 'ताराहरू' : 'Stars'}
                    </span>
                    <span className="text-xl font-bold text-amber-400">
                      {quizScore >= 13 ? '★★★' : quizScore >= 8 ? '★★☆' : '★☆☆'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 w-full pt-2">
                  <button
                    onClick={() => handleStageSelect('ASSESSMENT')}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {language === 'np' ? 'पुनः प्रयास' : 'Try Again'}
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
        )}

        {/* FREE EXPLORE CONTROLS */}
        {activeStage === 'FREE_EXPLORE' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-xl bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'np' ? 'खुला अन्वेषण' : 'Free Exploration'}
              </span>
              <div className="flex gap-1">
                {(['APPLES', 'FLOWERS', 'BUTTERFLIES', 'BALLOONS'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setObjectType(t);
                      syncEnvironment(t, targetCount);
                      playSound('click');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      objectType === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'APPLES' ? 'स्याउ' : t === 'FLOWERS' ? 'फूल' : t === 'BUTTERFLIES' ? 'पुतली' : 'बेलुन'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300">
                  {language === 'np' ? 'सङ्ख्या:' : 'Count:'} {targetCount} ({language === 'np' ? NEP_NUMERALS[targetCount] : targetCount})
                </span>
                <input
                  type="range"
                  min="11"
                  max="20"
                  value={targetCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setTargetCount(val);
                    syncEnvironment(objectType, val);
                  }}
                  className="w-28 accent-emerald-500"
                />
              </div>

              <button
                onClick={() => {
                  syncEnvironment(objectType, targetCount);
                  playSound('click');
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                {language === 'np' ? 'खाली गर्नुहोस्' : 'Reset'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

