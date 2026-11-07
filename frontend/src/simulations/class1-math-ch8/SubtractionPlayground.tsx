/**
 * SubtractionPlayground.tsx
 * Simulation 01: Subtraction Playground (घटाउ खेलमैदान)
 * Class 1 Mathematics - Chapter 8: Subtraction up to 10 (१० सम्मका सङ्ख्याहरूको घटाउ)
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
  Minus,
  Equal,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { SubtractionEnvironment, SubtractionObjectType, ClickedObjectInfo } from './SubtractionEnvironment';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दश'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

interface QuizQuestion {
  questionNp: string;
  questionEn: string;
  total: number;
  takeAway: number;
  type: SubtractionObjectType;
  options: number[];
  correct: number;
  explanationNp: string;
  explanationEn: string;
}

export const SubtractionPlayground: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Stage: 1, 2, 3, 4, 'ASSESSMENT', or 'FREE_EXPLORE'
  const [activeStage, setActiveStage] = useState<number | 'ASSESSMENT' | 'FREE_EXPLORE'>(1);

  // 3D Environment Reference
  const mountRef = useRef<HTMLDivElement | null>(null);
  const envRef = useRef<SubtractionEnvironment | null>(null);

  // Current Subtraction Problem State
  const [objectType, setObjectType] = useState<SubtractionObjectType>('APPLES');
  const [initialCount, setInitialCount] = useState<number>(6);
  const [targetTakeAway, setTargetTakeAway] = useState<number>(2);
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);

  // User Answer state for interactive selection
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Assessment Quiz (15 Questions)
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedQuizChoice, setSelectedQuizChoice] = useState<number | null>(null);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);

  // Remaining count calculation
  const remainingCount = initialCount - removedIndices.length;

  // Sound generator
  const playSound = useCallback(
    (type: 'click' | 'remove' | 'success' | 'boop' | 'fanfare', step?: number) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.05);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } else if (type === 'remove') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const freq = 450 - (step || 1) * 35;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
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
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
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

  // Initialize 3D Environment
  useEffect(() => {
    if (!mountRef.current) return;
    const env = new SubtractionEnvironment(mountRef.current);
    envRef.current = env;

    env.onObjectClick = (info: ClickedObjectInfo) => {
      if (!info.isRemoved && removedIndices.length < targetTakeAway) {
        playSound('remove', removedIndices.length + 1);
        env.animateRemove(info.id, () => {
          setRemovedIndices((prev) => {
            const next = [...prev, info.id];
            if (next.length === targetTakeAway) {
              const rem = initialCount - targetTakeAway;
              speak(
                `${targetTakeAway} वटा हटाइयो। अब ${rem} वटा बाँकी छन्!`,
                `Removed ${targetTakeAway}. Now ${rem} remain!`
              );
            }
            return next;
          });
        });
      }
    };

    return () => {
      env.dispose();
      envRef.current = null;
    };
  }, [initialCount, targetTakeAway, removedIndices.length, playSound, speak]);

  const syncEnvironment = useCallback(
    (type: SubtractionObjectType, total: number, removed: number[]) => {
      if (!envRef.current) return;
      envRef.current.setObjects(type, total, removed);
    },
    []
  );

  // Handle Level Transition
  const handleStageSelect = (stage: number | 'ASSESSMENT' | 'FREE_EXPLORE') => {
    playSound('click');
    setActiveStage(stage);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);

    if (stage === 1) {
      // Level 1: Remove 1 object
      setObjectType('APPLES');
      setInitialCount(5);
      setTargetTakeAway(1);
      setRemovedIndices([]);
      syncEnvironment('APPLES', 5, []);
      speak(
        '५ वटा स्याउ छन्। १ वटा स्याउ हटाउनुहोस् र बाँकी कति रह्यो गन्नुहोस्।',
        'There are 5 apples. Take away 1 apple and count how many remain.'
      );
    } else if (stage === 2) {
      // Level 2: Remove 2 or 3 objects
      setObjectType('BANANAS');
      setInitialCount(6);
      setTargetTakeAway(2);
      setRemovedIndices([]);
      syncEnvironment('BANANAS', 6, []);
      speak(
        '६ वटा केरा छन्। २ वटा केरा हटाउनुहोस्।',
        'There are 6 bananas. Take away 2 bananas.'
      );
    } else if (stage === 3) {
      // Level 3: Subtraction within 10 (including zero)
      setObjectType('FLOWERS');
      setInitialCount(8);
      setTargetTakeAway(3);
      setRemovedIndices([]);
      syncEnvironment('FLOWERS', 8, []);
      speak(
        '८ वटा फूल छन्। ३ वटा फूल हटाउनुहोस्।',
        'There are 8 flowers. Take away 3 flowers.'
      );
    } else if (stage === 4) {
      // Level 4: Picture-based problem
      setObjectType('BALLS');
      setInitialCount(7);
      setTargetTakeAway(4);
      setRemovedIndices([]);
      syncEnvironment('BALLS', 7, []);
      speak(
        '७ वटा बल छन्। ४ वटा बल हटाउनुहोस् र बाँकी सङ्ख्या छान्नुहोस्।',
        'There are 7 balls. Take away 4 balls and select the remainder.'
      );
    } else if (stage === 'ASSESSMENT') {
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(false);
      setSelectedQuizChoice(null);
      setQuizComplete(false);
      const q = quizQuestions[0];
      setObjectType(q.type);
      setInitialCount(q.total);
      setTargetTakeAway(q.takeAway);
      setRemovedIndices([]);
      syncEnvironment(q.type, q.total, []);
      speak(q.questionNp, q.questionEn);
    } else if (stage === 'FREE_EXPLORE') {
      setRemovedIndices([]);
      syncEnvironment(objectType, initialCount, []);
      speak(
        'खुला खेलमैदानमा वस्तुहरू हटाउँदै घटाउ अभ्यास गर्नुहोस्।',
        'Practice removing objects freely in the subtraction playground.'
      );
    }
  };

  // 15 Comprehensive Assessment Questions
  const quizQuestions: QuizQuestion[] = [
    {
      questionNp: '५ वटा स्याउबाट २ वटा स्याउ हटाउँदा कति बाँकी रहन्छन्?',
      questionEn: 'How many apples are left when 2 are taken away from 5?',
      total: 5,
      takeAway: 2,
      type: 'APPLES',
      options: [2, 3, 4],
      correct: 3,
      explanationNp: '५ − २ = ३ हुन्छ।',
      explanationEn: '5 − 2 = 3.',
    },
    {
      questionNp: '६ वटा केराबाट १ वटा केरा हटाउँदा कति बाँकी हुन्छ?',
      questionEn: 'What is 6 − 1 = ?',
      total: 6,
      takeAway: 1,
      type: 'BANANAS',
      options: [4, 5, 6],
      correct: 5,
      explanationNp: '६ − १ = ५ हुन्छ।',
      explanationEn: '6 − 1 = 5.',
    },
    {
      questionNp: '४ वटा फूलबाट ४ वटै फूल हटाउँदा कति बाँकी रहन्छन्?',
      questionEn: 'What is 4 − 4 = ?',
      total: 4,
      takeAway: 4,
      type: 'FLOWERS',
      options: [0, 1, 2],
      correct: 0,
      explanationNp: 'सबै वस्तु हटाउँदा शून्य (०) बाँकी रहन्छ: ४ − ४ = ०।',
      explanationEn: 'Taking away everything leaves zero: 4 − 4 = 0.',
    },
    {
      questionNp: '७ वटा बलबाट शून्य (०) बल हटाउँदा कति बाँकी हुन्छ?',
      questionEn: 'What is 7 − 0 = ?',
      total: 7,
      takeAway: 0,
      type: 'BALLS',
      options: [0, 6, 7],
      correct: 7,
      explanationNp: 'शून्य घटाउँदा सङ्ख्यामा परिवर्तन हुँदैन: ७ − ० = ७।',
      explanationEn: 'Subtracting zero leaves the count unchanged: 7 − 0 = 7.',
    },
    {
      questionNp: '८ वटा चराबाट ३ वटा चरा उडेर जाँदा कति चरा बाँकी रहन्छन्?',
      questionEn: 'There are 8 birds. 3 fly away. How many remain?',
      total: 8,
      takeAway: 3,
      type: 'BIRDS',
      options: [4, 5, 6],
      correct: 5,
      explanationNp: '८ − ३ = ५ हुन्छ।',
      explanationEn: '8 − 3 = 5.',
    },
    {
      questionNp: '१० वटा स्याउबाट ४ वटा स्याउ हटाउँदा कति बाँकी हुन्छन्?',
      questionEn: 'Complete 10 − 4 = ?',
      total: 10,
      takeAway: 4,
      type: 'APPLES',
      options: [5, 6, 7],
      correct: 6,
      explanationNp: '१० − ४ = ६ हुन्छ।',
      explanationEn: '10 − 4 = 6.',
    },
    {
      questionNp: '९ वटा बलबाट ५ वटा बल हटाउँदा कति बाँकी रहन्छ?',
      questionEn: 'Complete 9 − 5 = ?',
      total: 9,
      takeAway: 5,
      type: 'BALLS',
      options: [3, 4, 5],
      correct: 4,
      explanationNp: '९ − ५ = ४ हुन्छ।',
      explanationEn: '9 − 5 = 4.',
    },
    {
      questionNp: '३ वटा केराबाट २ वटा केरा खाँदा कति बाँकी रहन्छ?',
      questionEn: 'What is 3 − 2 = ?',
      total: 3,
      takeAway: 2,
      type: 'BANANAS',
      options: [1, 2, 0],
      correct: 1,
      explanationNp: '३ − २ = १ हुन्छ।',
      explanationEn: '3 − 2 = 1.',
    },
    {
      questionNp: '७ वटा फूलबाट २ वटा फूल चुँड्दा कति बाँकी रहन्छन्?',
      questionEn: 'What is 7 − 2 = ?',
      total: 7,
      takeAway: 2,
      type: 'FLOWERS',
      options: [4, 5, 6],
      correct: 5,
      explanationNp: '७ − २ = ५ हुन्छ।',
      explanationEn: '7 − 2 = 5.',
    },
    {
      questionNp: '१० वटा चराबाट ५ वटा चरा उड्दा कति बाँकी हुन्छन्?',
      questionEn: 'What is 10 − 5 = ?',
      total: 10,
      takeAway: 5,
      type: 'BIRDS',
      options: [4, 5, 6],
      correct: 5,
      explanationNp: '१० − ५ = ५ हुन्छ।',
      explanationEn: '10 − 5 = 5.',
    },
    {
      questionNp: '८ वटा स्याउबाट ६ वटा स्याउ हटाउँदा कति बाँकी रहन्छन्?',
      questionEn: 'What is 8 − 6 = ?',
      total: 8,
      takeAway: 6,
      type: 'APPLES',
      options: [1, 2, 3],
      correct: 2,
      explanationNp: '८ − ६ = २ हुन्छ।',
      explanationEn: '8 − 6 = 2.',
    },
    {
      questionNp: '६ वटा बलबाट ३ वटा बल दिँदा कति बाँकी रहन्छ?',
      questionEn: 'Complete 6 − 3 = ?',
      total: 6,
      takeAway: 3,
      type: 'BALLS',
      options: [2, 3, 4],
      correct: 3,
      explanationNp: '६ − ३ = ३ हुन्छ।',
      explanationEn: '6 − 3 = 3.',
    },
    {
      questionNp: '९ वटा केराबाट ३ वटा केरा हटाउँदा कति बाँकी हुन्छ?',
      questionEn: 'Complete 9 − 3 = ?',
      total: 9,
      takeAway: 3,
      type: 'BANANAS',
      options: [5, 6, 7],
      correct: 6,
      explanationNp: '९ − ३ = ६ हुन्छ।',
      explanationEn: '9 − 3 = 6.',
    },
    {
      questionNp: '१० वटा फूलबाट १ वटा फूल हटाउँदा कति बाँकी रहन्छ?',
      questionEn: 'Complete 10 − 1 = ?',
      total: 10,
      takeAway: 1,
      type: 'FLOWERS',
      options: [8, 9, 10],
      correct: 9,
      explanationNp: '१० − १ = ९ हुन्छ।',
      explanationEn: '10 − 1 = 9.',
    },
    {
      questionNp: '५ वटा चराबाट ५ वटै उडेर जाँदा गुँडमा कति चरा बाँकी रहन्छन्?',
      questionEn: 'There are 5 birds. All 5 fly away. How many remain?',
      total: 5,
      takeAway: 5,
      type: 'BIRDS',
      options: [0, 1, 5],
      correct: 0,
      explanationNp: 'सबै उडेपछि गुँडमा शून्य (०) चरा बाँकी रहन्छन्।',
      explanationEn: 'When all 5 leave, zero (0) remain.',
    },
  ];

  // Submit Progress
  const persistProgress = useCallback(
    async (score: number) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch(
          '/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH8-01/progress',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              timeSpentSeconds: 120,
              metrics: {
                subtractionPlaygroundScore: score,
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
      {/* ── HEADER BAR ────────────────────────────────────────────── */}
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
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
                Class 1 • Math • Chapter 8
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                3D WebGL
              </span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'np' ? 'घटाउ खेलमैदान' : 'Subtraction Playground'}
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
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {language === 'np' ? `तह ${NEP_DIGITS[s]}` : `Level ${s}`}
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
            {language === 'np' ? 'खुला खेल' : 'Free Explore'}
          </button>
        </div>

        {/* Controls */}
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

      {/* ── 3D CANVAS VIEWPORT ──────────────────────────────────────── */}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Camera Focus Controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-1.5 bg-slate-900/80 backdrop-blur p-1 rounded-xl border border-slate-700 text-xs">
          {(['PLAYGROUND', 'MAIN_BASKET', 'REMOVAL_BASKET'] as const).map((cam) => (
            <button
              key={cam}
              onClick={() => {
                playSound('click');
                envRef.current?.setCameraPreset(cam);
              }}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              {cam === 'PLAYGROUND'
                ? language === 'np'
                  ? 'खेलमैदान'
                  : 'Playground'
                : cam === 'MAIN_BASKET'
                ? language === 'np'
                  ? 'मुख्य टोकरी'
                  : 'Main Basket'
                : language === 'np'
                ? 'हटाउने टोकरी'
                : 'Removal Basket'}
            </button>
          ))}
        </div>

        {/* Live Equation Badge Top Right */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/85 backdrop-blur px-4 py-2 rounded-2xl border border-rose-500/40 shadow-xl flex items-center gap-3">
          <div className="text-center">
            <span className="text-[10px] text-amber-300 font-semibold block">
              {language === 'np' ? 'सुरुमा' : 'Initial'}
            </span>
            <span className="text-xl font-black text-amber-400">
              {language === 'np' ? NEP_DIGITS[initialCount] : initialCount}
            </span>
          </div>
          <Minus className="w-5 h-5 text-rose-400 font-black" />
          <div className="text-center">
            <span className="text-[10px] text-rose-300 font-semibold block">
              {language === 'np' ? 'हटाइयो' : 'Removed'}
            </span>
            <span className="text-xl font-black text-rose-400">
              {language === 'np' ? NEP_DIGITS[removedIndices.length] : removedIndices.length}
            </span>
          </div>
          <Equal className="w-5 h-5 text-emerald-400" />
          <div className="text-center px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-300 font-semibold block">
              {language === 'np' ? 'बाँकी' : 'Left'}
            </span>
            <span className="text-xl font-black text-emerald-400">
              {language === 'np' ? NEP_DIGITS[remainingCount] : remainingCount}
            </span>
          </div>
        </div>

        {/* ── INTERACTIVE STAGE PANELS ─────────────────────────────── */}
        {typeof activeStage === 'number' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-2xl bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                {language === 'np'
                  ? `तह ${NEP_DIGITS[activeStage]}: घटाउ अभ्यास`
                  : `Level ${activeStage}: Subtraction Practice`}
              </span>
              <button
                onClick={() =>
                  speak(
                    `${initialCount} वटा वस्तु छन्। ${targetTakeAway} वटा हटाउनुहोस्।`,
                    `There are ${initialCount} objects. Take away ${targetTakeAway}.`
                  )
                }
                className="text-slate-400 hover:text-white"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-medium text-slate-200">
              {language === 'np'
                ? removedIndices.length < targetTakeAway
                  ? `३डी टोकरीबाट ${targetTakeAway} वटा वस्तुमा थिचेर हटाउनुहोस् (अझै ${targetTakeAway - removedIndices.length} वटा हटाउन बाँकी)।`
                  : `सबास! ${initialCount} − ${targetTakeAway} = ${remainingCount} हुन्छ!`
                : removedIndices.length < targetTakeAway
                ? `Click on ${targetTakeAway} objects in the 3D basket to remove them (${targetTakeAway - removedIndices.length} left to remove).`
                : `Great! ${initialCount} − ${targetTakeAway} = ${remainingCount}!`
              }
            </p>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {
                  setRemovedIndices([]);
                  syncEnvironment(objectType, initialCount, []);
                  playSound('click');
                }}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {language === 'np' ? 'पुनः' : 'Reset'}
              </button>

              {removedIndices.length >= targetTakeAway && (
                <button
                  onClick={() => {
                    if (activeStage < 4) {
                      handleStageSelect(activeStage + 1);
                    } else {
                      handleStageSelect('ASSESSMENT');
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg active:scale-95 transition flex items-center gap-1.5"
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
                      {language === 'np' ? 'घटाउ मूल्याङ्कन' : 'Subtraction Quiz'}
                    </h2>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-rose-400 font-bold border border-slate-700">
                    {language === 'np'
                      ? `प्रश्न ${NEP_DIGITS[quizIndex + 1]} / १५`
                      : `Question ${quizIndex + 1} of 15`}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    {language === 'np'
                      ? quizQuestions[quizIndex].questionNp
                      : quizQuestions[quizIndex].questionEn}
                  </h3>
                  <div className="mt-3 flex items-center justify-center gap-4 py-2 bg-slate-800/50 rounded-2xl border border-slate-800 text-xl font-black text-rose-400">
                    <span>
                      {language === 'np'
                        ? NEP_DIGITS[quizQuestions[quizIndex].total]
                        : quizQuestions[quizIndex].total}
                    </span>
                    <Minus className="w-5 h-5 text-rose-400 font-black" />
                    <span>
                      {language === 'np'
                        ? NEP_DIGITS[quizQuestions[quizIndex].takeAway]
                        : quizQuestions[quizIndex].takeAway}
                    </span>
                    <Equal className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400">?</span>
                  </div>
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
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40'
                            : selectedQuizChoice === opt
                            ? 'bg-rose-600 border-rose-400 text-white'
                            : 'bg-slate-800/50 border-slate-700 text-slate-500'
                          : 'bg-slate-800 border-slate-700 hover:border-rose-500 hover:bg-slate-750 text-white active:scale-95'
                      }`}
                    >
                      {language === 'np' ? NEP_DIGITS[opt] : opt}
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
                          setInitialCount(q.total);
                          setTargetTakeAway(q.takeAway);
                          setRemovedIndices([]);
                          syncEnvironment(q.type, q.total, []);
                          speak(q.questionNp, q.questionEn);
                        } else {
                          setQuizComplete(true);
                          playSound('fanfare');
                          persistProgress(quizScore);
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-rose-900/40 transition"
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
                      {language === 'np' ? NEP_DIGITS[quizScore] : quizScore}
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
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
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
                {language === 'np' ? 'खुला घटाउ अन्वेषण' : 'Free Exploration'}
              </span>
              <div className="flex gap-1">
                {(['APPLES', 'BANANAS', 'FLOWERS', 'BALLS', 'BIRDS'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setObjectType(t);
                      syncEnvironment(t, initialCount, removedIndices);
                      playSound('click');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      objectType === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'APPLES'
                      ? 'स्याउ'
                      : t === 'BANANAS'
                      ? 'केरा'
                      : t === 'FLOWERS'
                      ? 'फूल'
                      : t === 'BALLS'
                      ? 'बल'
                      : 'चरा'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300">
                  {language === 'np' ? 'सुरु सङ्ख्या:' : 'Start:'} {initialCount}
                </span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={initialCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setInitialCount(val);
                    setRemovedIndices([]);
                    syncEnvironment(objectType, val, []);
                  }}
                  className="w-24 accent-rose-500"
                />
              </div>

              <button
                onClick={() => {
                  setRemovedIndices([]);
                  syncEnvironment(objectType, initialCount, []);
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

