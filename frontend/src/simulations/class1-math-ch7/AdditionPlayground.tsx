/**
 * AdditionPlayground.tsx
 * Simulation 01: Addition Playground (जोड्ने खेलमैदान)
 * Class 1 Mathematics - Chapter 7: Addition up to 10 (योगफल १० सम्म आउने जोड)
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
  ChevronLeft,
  HelpCircle,
  Plus,
  Equal,
  Star,
  Layers,
} from 'lucide-react';
import { AdditionEnvironment, ObjectType, ClickedObjectInfo } from './AdditionEnvironment';

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
  countA: number;
  countB: number;
  type: ObjectType;
  options: number[];
  correct: number;
  explanationNp: string;
  explanationEn: string;
}

export const AdditionPlayground: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Navigation & Settings
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Stage: 1 to 5, 'ASSESSMENT', or 'FREE_EXPLORE'
  const [activeStage, setActiveStage] = useState<number | 'ASSESSMENT' | 'FREE_EXPLORE'>(1);

  // 3D Environment Reference
  const mountRef = useRef<HTMLDivElement | null>(null);
  const envRef = useRef<AdditionEnvironment | null>(null);

  // Current Object Groups State
  const [objectType, setObjectType] = useState<ObjectType>('APPLES');
  const [countA, setCountA] = useState<number>(2);
  const [countB, setCountB] = useState<number>(1);
  const [isCombined, setIsCombined] = useState<boolean>(false);
  const [combiningActive, setCombiningActive] = useState<boolean>(false);

  // Interaction click tracking
  const [clickedA, setClickedA] = useState<Set<number>>(new Set());
  const [clickedB, setClickedB] = useState<Set<number>>(new Set());
  const [clickedCombined, setClickedCombined] = useState<Set<number>>(new Set());

  // Stage 1 State: Guided Addition Intro
  const [stage1Step, setStage1Step] = useState<number>(1);

  // Stage 2 State: Combine Pairs
  const [stage2Round, setStage2Round] = useState<number>(0);
  const [selectedTotalChoice, setSelectedTotalChoice] = useState<number | null>(null);
  const [stage2Feedback, setStage2Feedback] = useState<boolean | null>(null);

  // Stage 4 State: Addition with Zero
  const [stage4Round, setStage4Round] = useState<number>(0);

  // Assessment (15 Questions)
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedQuizChoice, setSelectedQuizChoice] = useState<number | null>(null);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);

  // Overall stars
  const [stars, setStars] = useState<number>(0);

  // ── Audio Synthesis ──────────────────────────────────────────────
  const playSound = useCallback(
    (type: 'click' | 'combine' | 'success' | 'boop' | 'fanfare' | 'ramp', param?: number) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(650, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.05);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } else if (type === 'ramp') {
          const step = param || 1;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const freq = 320 + step * 50;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'combine') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(260, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.35);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
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
          osc.frequency.setValueAtTime(240, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      } catch (e) {
        // AudioContext fallback
      }
    },
    [soundEnabled]
  );

  // Web Speech API Voice Narration
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

  // ── Initialize 3D Environment ────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const env = new AdditionEnvironment(mountRef.current);
    envRef.current = env;

    env.onObjectClick = (info: ClickedObjectInfo) => {
      playSound('ramp', info.index + 1);
      if (info.group === 'A') {
        setClickedA((prev) => new Set(prev).add(info.index));
      } else if (info.group === 'B') {
        setClickedB((prev) => new Set(prev).add(info.index));
      } else {
        setClickedCombined((prev) => new Set(prev).add(info.index));
      }
    };

    return () => {
      env.dispose();
      envRef.current = null;
    };
  }, [playSound]);

  // Sync objects with 3D environment
  const syncEnvironment = useCallback(
    (type: ObjectType, a: number, b: number, combined: boolean) => {
      if (!envRef.current) return;
      envRef.current.updateObjects(type, a, b, combined);
      setClickedA(new Set());
      setClickedB(new Set());
      setClickedCombined(new Set());
    },
    []
  );

  // Handle Animated Combine Action
  const handleCombineAction = () => {
    if (combiningActive || isCombined || !envRef.current) return;
    setCombiningActive(true);
    playSound('combine');
    envRef.current.animateCombine(() => {
      setIsCombined(true);
      setCombiningActive(false);
      playSound('success');
      const total = countA + countB;
      speak(
        `${countA} र ${countB} मिलाउँदा जम्मा ${total} भयो!`,
        `Combining ${countA} and ${countB} makes ${total} altogether!`
      );
    });
  };

  // Reset current round objects
  const handleResetRound = () => {
    setIsCombined(false);
    setClickedA(new Set());
    setClickedB(new Set());
    setClickedCombined(new Set());
    if (envRef.current) {
      envRef.current.updateObjects(objectType, countA, countB, false);
      envRef.current.setCameraPreset('PANORAMA');
    }
  };

  // ── STAGE 2 PRESET PAIRS ─────────────────────────────────────────
  const stage2Pairs: Array<{ type: ObjectType; a: number; b: number }> = [
    { type: 'FLOWERS', a: 2, b: 1 },
    { type: 'APPLES', a: 3, b: 2 },
    { type: 'BALLS', a: 4, b: 1 },
    { type: 'MANGOES', a: 2, b: 3 },
    { type: 'APPLES', a: 5, b: 2 },
  ];

  // ── STAGE 4 ZERO PRESETS ─────────────────────────────────────────
  const stage4Pairs: Array<{ type: ObjectType; a: number; b: number }> = [
    { type: 'APPLES', a: 3, b: 0 },
    { type: 'FLOWERS', a: 0, b: 4 },
    { type: 'BALLS', a: 5, b: 0 },
    { type: 'MANGOES', a: 0, b: 0 },
  ];

  // ── 15 ASSESSMENT QUESTIONS ──────────────────────────────────────
  const quizQuestions: QuizQuestion[] = [
    {
      questionNp: '२ वटा स्याउ र १ वटा स्याउ मिलाउँदा जम्मा कति वटा स्याउ हुन्छन्?',
      questionEn: 'How many apples are there altogether when combining 2 apples and 1 apple?',
      countA: 2,
      countB: 1,
      type: 'APPLES',
      options: [2, 3, 4],
      correct: 3,
      explanationNp: '२ + १ = ३ हुन्छ।',
      explanationEn: '2 + 1 = 3.',
    },
    {
      questionNp: '३ वटा फूल र २ वटा फूल जोड्दा कति हुन्छ?',
      questionEn: 'What is the sum of 3 flowers and 2 flowers?',
      countA: 3,
      countB: 2,
      type: 'FLOWERS',
      options: [4, 5, 6],
      correct: 5,
      explanationNp: '३ + २ = ५ हुन्छ।',
      explanationEn: '3 + 2 = 5.',
    },
    {
      questionNp: '४ वटा बल र १ वटा बलको जम्मा योगफल कति हो?',
      questionEn: 'Find the total of 4 balls and 1 ball.',
      countA: 4,
      countB: 1,
      type: 'BALLS',
      options: [5, 4, 6],
      correct: 5,
      explanationNp: '४ + १ = ५ हुन्छ।',
      explanationEn: '4 + 1 = 5.',
    },
    {
      questionNp: '२ वटा आँप र ३ वटा आँप मिलाउँदा कति हुन्छ?',
      questionEn: 'What is 2 mangoes combined with 3 mangoes?',
      countA: 2,
      countB: 3,
      type: 'MANGOES',
      options: [4, 5, 6],
      correct: 5,
      explanationNp: '२ + ३ = ५ हुन्छ।',
      explanationEn: '2 + 3 = 5.',
    },
    {
      questionNp: '५ वटा स्याउ र २ वटा स्याउ जोड्दा कति हुन्छ?',
      questionEn: 'Complete 5 + 2 = ?',
      countA: 5,
      countB: 2,
      type: 'APPLES',
      options: [6, 7, 8],
      correct: 7,
      explanationNp: '५ + २ = ७ हुन्छ।',
      explanationEn: '5 + 2 = 7.',
    },
    {
      questionNp: '६ वटा बल र ३ वटा बल जोड्दा कति हुन्छ?',
      questionEn: 'Complete 6 + 3 = ?',
      countA: 6,
      countB: 3,
      type: 'BALLS',
      options: [8, 9, 10],
      correct: 9,
      explanationNp: '६ + ३ = ९ हुन्छ।',
      explanationEn: '6 + 3 = 9.',
    },
    {
      questionNp: '५ वटा फूल र ५ वटा फूल मिलाउँदा कति हुन्छ?',
      questionEn: 'Complete 5 + 5 = ?',
      countA: 5,
      countB: 5,
      type: 'FLOWERS',
      options: [9, 10, 8],
      correct: 10,
      explanationNp: '५ + ५ = १० हुन्छ।',
      explanationEn: '5 + 5 = 10.',
    },
    {
      questionNp: '३ वटा स्याउमा शून्य (०) स्याउ जोड्दा कति हुन्छ?',
      questionEn: 'What is 3 apples + 0 apples?',
      countA: 3,
      countB: 0,
      type: 'APPLES',
      options: [0, 3, 4],
      correct: 3,
      explanationNp: 'कुनै वस्तु नजोड्दा सङ्ख्या ३ नै रहन्छ: ३ + ० = ३।',
      explanationEn: 'Adding zero does not change the count: 3 + 0 = 3.',
    },
    {
      questionNp: '० वटा आँप र ४ वटा आँपको जम्मा योगफल कति हो?',
      questionEn: 'What is 0 + 4 = ?',
      countA: 0,
      countB: 4,
      type: 'MANGOES',
      options: [0, 4, 5],
      correct: 4,
      explanationNp: '० + ४ = ४ हुन्छ।',
      explanationEn: '0 + 4 = 4.',
    },
    {
      questionNp: '७ वटा बल र २ वटा बल जोड्दा कति हुन्छ?',
      questionEn: 'Complete 7 + 2 = ?',
      countA: 7,
      countB: 2,
      type: 'BALLS',
      options: [8, 9, 10],
      correct: 9,
      explanationNp: '७ + २ = ९ हुन्छ।',
      explanationEn: '7 + 2 = 9.',
    },
    {
      questionNp: '४ वटा फूल र ४ वटा फूल मिलाउँदा जम्मा कति हुन्छन्?',
      questionEn: 'What is 4 + 4 = ?',
      countA: 4,
      countB: 4,
      type: 'FLOWERS',
      options: [7, 8, 9],
      correct: 8,
      explanationNp: '४ + ४ = ८ हुन्छ।',
      explanationEn: '4 + 4 = 8.',
    },
    {
      questionNp: '८ वटा स्याउ र २ वटा स्याउ मिलाउँदा कति बन्छ?',
      questionEn: 'What is 8 + 2 = ?',
      countA: 8,
      countB: 2,
      type: 'APPLES',
      options: [9, 10, 8],
      correct: 10,
      explanationNp: '८ + २ = १० हुन्छ।',
      explanationEn: '8 + 2 = 10.',
    },
    {
      questionNp: '१ वटा आँप र ६ वटा आँप जोड्दा कति हुन्छ?',
      questionEn: 'Complete 1 + 6 = ?',
      countA: 1,
      countB: 6,
      type: 'MANGOES',
      options: [6, 7, 8],
      correct: 7,
      explanationNp: '१ + ६ = ७ हुन्छ।',
      explanationEn: '1 + 6 = 7.',
    },
    {
      questionNp: '९ वटा बल र १ वटा बल जोड्दा कति बन्छ?',
      questionEn: 'Complete 9 + 1 = ?',
      countA: 9,
      countB: 1,
      type: 'BALLS',
      options: [9, 10, 8],
      correct: 10,
      explanationNp: '९ + १ = १० हुन्छ।',
      explanationEn: '9 + 1 = 10.',
    },
    {
      questionNp: '० + ० को योगफल कति हुन्छ?',
      questionEn: 'What is 0 + 0 = ?',
      countA: 0,
      countB: 0,
      type: 'APPLES',
      options: [0, 1, 2],
      correct: 0,
      explanationNp: 'दुवै समूह खाली हुँदा योगफल शून्य (०) नै हुन्छ।',
      explanationEn: 'Both groups being empty gives 0 total: 0 + 0 = 0.',
    },
  ];

  // Stage Switch Handler
  const handleStageSelect = (stage: number | 'ASSESSMENT' | 'FREE_EXPLORE') => {
    playSound('click');
    setActiveStage(stage);
    setIsCombined(false);
    setSelectedTotalChoice(null);
    setStage2Feedback(null);

    if (stage === 1) {
      setStage1Step(1);
      setObjectType('APPLES');
      setCountA(2);
      setCountB(1);
      syncEnvironment('APPLES', 2, 1, false);
      speak(
        'समूह क मा २ वटा र समूह ख मा १ वटा स्याउ छन्। दुवै मिलाउँदा कति हुन्छ?',
        'Group A has 2 apples and Group B has 1 apple. How many altogether?'
      );
    } else if (stage === 2) {
      setStage2Round(0);
      const pair = stage2Pairs[0];
      setObjectType(pair.type);
      setCountA(pair.a);
      setCountB(pair.b);
      syncEnvironment(pair.type, pair.a, pair.b, false);
      speak(
        'समूह क र समूह ख का वस्तुहरू गन्नुहोस् र एकै ठाउँमा मिसाउनुहोस्।',
        'Count Group A and Group B, then combine them to find the total.'
      );
    } else if (stage === 3) {
      setObjectType('APPLES');
      setCountA(3);
      setCountB(2);
      syncEnvironment('APPLES', 3, 2, false);
      speak(
        'आफूले चाहेको सङ्ख्या रोज्नुहोस् र जोडको गणितीय वाक्य बनाउनुहोस्।',
        'Choose your desired numbers in both baskets and discover the addition equation.'
      );
    } else if (stage === 4) {
      setStage4Round(0);
      const pair = stage4Pairs[0];
      setObjectType(pair.type);
      setCountA(pair.a);
      setCountB(pair.b);
      syncEnvironment(pair.type, pair.a, pair.b, false);
      speak(
        'शून्य (०) जोड्दा सङ्ख्यामा केही फरक पर्दैन। अवलोकन गर्नुहोस्!',
        'Adding zero does not change the quantity. Observe the baskets!'
      );
    } else if (stage === 'ASSESSMENT') {
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(false);
      setSelectedQuizChoice(null);
      setQuizComplete(false);
      const q = quizQuestions[0];
      setObjectType(q.type);
      setCountA(q.countA);
      setCountB(q.countB);
      syncEnvironment(q.type, q.countA, q.countB, false);
      speak(q.questionNp, q.questionEn);
    } else if (stage === 'FREE_EXPLORE') {
      syncEnvironment(objectType, countA, countB, false);
      speak(
        'खुला खेलमैदानमा स्वागत छ! वस्तुहरू परिवर्तन गरी रमाइलोसँग जोड सिक्नुहोस्।',
        'Welcome to free playground! Change objects and practice addition freely.'
      );
    }
  };

  // Submit Progress to Backend API
  const persistProgress = useCallback(
    async (score: number) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch(
          '/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH7-01/progress',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              timeSpentSeconds: 120,
              metrics: {
                additionPlaygroundScore: score,
                starsAwarded: Math.min(3, Math.ceil(score / 5)),
              },
            }),
          }
        );
      } catch (err) {
        console.error('Failed to persist progress:', err);
      }
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
            className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition text-slate-200"
            title="Return to Simulation Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Class 1 • Math • Chapter 7
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                3D WebGL
              </span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'np' ? 'जोड्ने खेलमैदान' : 'Addition Playground'}
            </h1>
          </div>
        </div>

        {/* Stage Selector Pills */}
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

        {/* Controls: Audio & Language */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLanguage((l) => (l === 'np' ? 'en' : 'np'));
              playSound('click');
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white active:scale-95 transition"
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
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── 3D CANVAS VIEWPORT ──────────────────────────────────────── */}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Camera Focus Shortcuts */}
        <div className="absolute top-4 left-4 z-10 flex gap-1.5 bg-slate-900/80 backdrop-blur p-1 rounded-xl border border-slate-700 text-xs">
          {(['PANORAMA', 'GROUP_A', 'GROUP_B', 'COMBINED'] as const).map((cam) => (
            <button
              key={cam}
              onClick={() => {
                playSound('click');
                envRef.current?.setCameraPreset(cam);
              }}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              {cam === 'PANORAMA'
                ? language === 'np'
                  ? 'मैदान'
                  : 'Playground'
                : cam === 'GROUP_A'
                ? language === 'np'
                  ? 'समूह क'
                  : 'Basket A'
                : cam === 'GROUP_B'
                ? language === 'np'
                  ? 'समूह ख'
                  : 'Basket B'
                : language === 'np'
                ? 'जम्मा'
                : 'Combined'}
            </button>
          ))}
        </div>

        {/* Current Active Equation Badge in Center Top */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/85 backdrop-blur px-4 py-2 rounded-2xl border border-emerald-500/40 shadow-xl flex items-center gap-3">
          <div className="text-center">
            <span className="text-[10px] text-amber-300 font-semibold block">
              {language === 'np' ? 'समूह क' : 'Group A'}
            </span>
            <span className="text-xl font-black text-amber-400">
              {language === 'np' ? NEP_DIGITS[countA] : countA}
            </span>
          </div>
          <Plus className="w-5 h-5 text-emerald-400" />
          <div className="text-center">
            <span className="text-[10px] text-sky-300 font-semibold block">
              {language === 'np' ? 'समूह ख' : 'Group B'}
            </span>
            <span className="text-xl font-black text-sky-400">
              {language === 'np' ? NEP_DIGITS[countB] : countB}
            </span>
          </div>
          <Equal className="w-5 h-5 text-emerald-400" />
          <div className="text-center px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-300 font-semibold block">
              {language === 'np' ? 'जम्मा' : 'Total'}
            </span>
            <span className="text-xl font-black text-emerald-400">
              {isCombined
                ? language === 'np'
                  ? NEP_DIGITS[countA + countB]
                  : countA + countB
                : '?'}
            </span>
          </div>
        </div>

        {/* ── STAGE-SPECIFIC INTERACTIVE OVERLAYS ───────────────────── */}

        {/* STAGE 1: Guided Addition Introduction */}
        {activeStage === 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-2xl bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {language === 'np' ? 'तह १: जोडको अवधारणा' : 'Level 1: Understanding Addition'}
              </span>
              <button
                onClick={() =>
                  speak(
                    'दुई समूहलाई एकै ठाउँमा राख्दा जम्मा सङ्ख्या पत्ता लाग्छ।',
                    'When we put two groups together, we find the total.'
                  )
                }
                className="text-slate-400 hover:text-white"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-medium text-slate-200">
              {language === 'np'
                ? isCombined
                  ? 'दुवै टोकरीका स्याउ एकै ठाउँमा राख्दा जम्मा ३ वटा भए: २ + १ = ३'
                  : 'बायाँ टोकरीमा २ वटा र दायाँ टोकरीमा १ वटा स्याउ छन्। दुवैलाई मिसाउन "एकै ठाउँमा राखौँ" थिच्नुहोस्।'
                : isCombined
                ? 'Moving both baskets together gives 3 apples altogether: 2 + 1 = 3'
                : 'Left basket has 2 apples and right basket has 1 apple. Click "Combine Baskets" to see the total.'}
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleResetRound}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {language === 'np' ? 'पुनः प्रयास' : 'Reset'}
              </button>
              {!isCombined ? (
                <button
                  onClick={handleCombineAction}
                  disabled={combiningActive}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 active:scale-95 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'np' ? 'एकै ठाउँमा राखौँ' : 'Combine Baskets'}
                </button>
              ) : (
                <button
                  onClick={() => handleStageSelect(2)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-900/40 active:scale-95 transition flex items-center gap-2"
                >
                  {language === 'np' ? 'तह २ मा जाऔँ' : 'Go to Level 2'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STAGE 2: Combine Two Groups & Select Answer */}
        {activeStage === 2 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-2xl bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {language === 'np'
                  ? `तह २: जोडा ${NEP_DIGITS[stage2Round + 1]} / ${NEP_DIGITS[stage2Pairs.length]}`
                  : `Level 2: Pair ${stage2Round + 1} of ${stage2Pairs.length}`}
              </span>
              <span className="text-xs text-slate-400">
                {language === 'np'
                  ? `${countA} र ${countB} मिलाउँदा कति हुन्छ?`
                  : `How many when adding ${countA} and ${countB}?`}
              </span>
            </div>

            {!isCombined ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  {language === 'np'
                    ? 'वस्तुहरू गन्नुहोस् र मिसाउन "एकै ठाउँमा राखौँ" थिच्नुहोस्।'
                    : 'Count each group, then click Combine to merge them.'}
                </span>
                <button
                  onClick={handleCombineAction}
                  disabled={combiningActive}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg active:scale-95 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'np' ? 'एकै ठाउँमा राखौँ' : 'Combine'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-amber-300">
                  {language === 'np' ? 'जम्मा सङ्ख्या छान्नुहोस्:' : 'Select the correct total:'}
                </span>
                <div className="flex gap-2">
                  {[countA + countB - 1, countA + countB, countA + countB + 1]
                    .filter((n) => n >= 0 && n <= 10)
                    .sort((a, b) => a - b)
                    .map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          const correct = opt === countA + countB;
                          setSelectedTotalChoice(opt);
                          setStage2Feedback(correct);
                          if (correct) {
                            playSound('fanfare');
                            speak(
                              `स्याबास! ${countA} + ${countB} = ${opt} हो!`,
                              `Excellent! ${countA} + ${countB} = ${opt}!`
                            );
                          } else {
                            playSound('boop');
                            speak(
                              'फेरि गनेर हेर्नुहोस्।',
                              'Count again carefully.'
                            );
                          }
                        }}
                        className={`flex-1 py-3 rounded-xl font-black text-lg border transition ${
                          selectedTotalChoice === opt
                            ? stage2Feedback
                              ? 'bg-emerald-600 border-emerald-400 text-white'
                              : 'bg-rose-600 border-rose-400 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {language === 'np' ? NEP_DIGITS[opt] : opt}
                      </button>
                    ))}
                </div>
                {stage2Feedback === true && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {language === 'np' ? 'सटीक उत्तर!' : 'Correct Answer!'}
                    </span>
                    <button
                      onClick={() => {
                        if (stage2Round < stage2Pairs.length - 1) {
                          const nextIdx = stage2Round + 1;
                          setStage2Round(nextIdx);
                          const p = stage2Pairs[nextIdx];
                          setObjectType(p.type);
                          setCountA(p.a);
                          setCountB(p.b);
                          setIsCombined(false);
                          setSelectedTotalChoice(null);
                          setStage2Feedback(null);
                          syncEnvironment(p.type, p.a, p.b, false);
                        } else {
                          handleStageSelect(3);
                        }
                      }}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition"
                    >
                      {stage2Round < stage2Pairs.length - 1
                        ? language === 'np'
                          ? 'अर्को जोडा'
                          : 'Next Pair'
                        : language === 'np'
                        ? 'तह ३ मा जाऔँ'
                        : 'Go to Level 3'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STAGE 3: Build Addition with Objects */}
        {activeStage === 3 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-2xl bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {language === 'np' ? 'तह ३: वस्तुबाट जोड निर्माण' : 'Level 3: Build Addition with Objects'}
              </span>
              <span className="text-xs text-slate-400">
                {language === 'np' ? 'योगफल १० भन्दा बढी हुनुहुँदैन' : 'Total must not exceed 10'}
              </span>
            </div>

            {/* Controls to adjust Count A and Count B */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-300 block">
                    {language === 'np' ? 'टोकरी क' : 'Basket A'}
                  </span>
                  <span className="text-lg font-black text-white">
                    {language === 'np' ? NEP_DIGITS[countA] : countA}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      if (countA > 0) {
                        const next = countA - 1;
                        setCountA(next);
                        setIsCombined(false);
                        syncEnvironment(objectType, next, countB, false);
                        playSound('click');
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      if (countA + countB < 10) {
                        const next = countA + 1;
                        setCountA(next);
                        setIsCombined(false);
                        syncEnvironment(objectType, next, countB, false);
                        playSound('click');
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-sky-300 block">
                    {language === 'np' ? 'टोकरी ख' : 'Basket B'}
                  </span>
                  <span className="text-lg font-black text-white">
                    {language === 'np' ? NEP_DIGITS[countB] : countB}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      if (countB > 0) {
                        const next = countB - 1;
                        setCountB(next);
                        setIsCombined(false);
                        syncEnvironment(objectType, countA, next, false);
                        playSound('click');
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      if (countA + countB < 10) {
                        const next = countB + 1;
                        setCountB(next);
                        setIsCombined(false);
                        syncEnvironment(objectType, countA, next, false);
                        playSound('click');
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {isCombined && (
                <div className="text-sm font-bold text-emerald-400">
                  {language === 'np'
                    ? `${NEP_DIGITS[countA]} + ${NEP_DIGITS[countB]} = ${NEP_DIGITS[countA + countB]}`
                    : `${countA} + ${countB} = ${countA + countB}`}
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                {!isCombined ? (
                  <button
                    onClick={handleCombineAction}
                    disabled={combiningActive}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg active:scale-95 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'np' ? 'मिसाएर हेरौँ' : 'Combine & Count'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleStageSelect(4)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg active:scale-95 transition flex items-center gap-1"
                  >
                    {language === 'np' ? 'तह ४ मा जाऔँ' : 'Go to Level 4'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: Addition with Zero */}
        {activeStage === 4 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-2xl bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {language === 'np' ? 'तह ४: शून्य (०) को जोड' : 'Level 4: Addition with Zero'}
              </span>
              <span className="text-xs text-amber-300">
                {countA === 0
                  ? language === 'np'
                    ? 'बायाँ टोकरी खाली छ (०)'
                    : 'Left basket is empty (0)'
                  : language === 'np'
                  ? 'दायाँ टोकरी खाली छ (०)'
                  : 'Right basket is empty (0)'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200">
              {language === 'np'
                ? isCombined
                  ? `कुनै वस्तु नभएको समूह (०) जोड्दा जम्मा सङ्ख्या ${countA + countB} नै रहन्छ: ${countA} + ${countB} = ${countA + countB}`
                  : `एउटा टोकरीमा ${countA > 0 ? countA : countB} वटा वस्तु छन् र अर्को खाली (०) छ। दुवै मिसाएर हेर्नुहोस्।`
                : isCombined
                ? `Adding an empty group (0) does not change the total: ${countA} + ${countB} = ${countA + countB}`
                : `One basket has ${countA > 0 ? countA : countB} items and the other has zero (0). Combine them to observe.`}
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleResetRound}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {language === 'np' ? 'पुनः' : 'Reset'}
              </button>
              {!isCombined ? (
                <button
                  onClick={handleCombineAction}
                  disabled={combiningActive}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg active:scale-95 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'np' ? 'एकै ठाउँमा राखौँ' : 'Combine'}
                </button>
              ) : (
                <div className="flex gap-2">
                  {stage4Round < stage4Pairs.length - 1 ? (
                    <button
                      onClick={() => {
                        const next = stage4Round + 1;
                        setStage4Round(next);
                        const p = stage4Pairs[next];
                        setObjectType(p.type);
                        setCountA(p.a);
                        setCountB(p.b);
                        setIsCombined(false);
                        syncEnvironment(p.type, p.a, p.b, false);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      {language === 'np' ? 'अर्को उदाहरण' : 'Next Example'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStageSelect('ASSESSMENT')}
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg active:scale-95 transition flex items-center gap-1"
                    >
                      <Trophy className="w-4 h-4" />
                      {language === 'np' ? 'मूल्याङ्कन सुरु गरौँ' : 'Start Assessment'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ASSESSMENT MODAL / OVERLAY (15 Questions) ─────────────── */}
        {activeStage === 'ASSESSMENT' && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            {!quizComplete ? (
              <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-bold text-white">
                      {language === 'np' ? 'जोड मूल्याङ्कन' : 'Addition Quiz'}
                    </h2>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 font-bold border border-slate-700">
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
                  <div className="mt-3 flex items-center justify-center gap-4 py-2 bg-slate-800/50 rounded-2xl border border-slate-800 text-lg font-black text-amber-400">
                    <span>
                      {language === 'np'
                        ? NEP_DIGITS[quizQuestions[quizIndex].countA]
                        : quizQuestions[quizIndex].countA}
                    </span>
                    <Plus className="w-5 h-5 text-emerald-400" />
                    <span>
                      {language === 'np'
                        ? NEP_DIGITS[quizQuestions[quizIndex].countB]
                        : quizQuestions[quizIndex].countB}
                    </span>
                    <Equal className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400">?</span>
                  </div>
                </div>

                {/* Multiple Choice Options */}
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
                          : 'bg-slate-800 border-slate-700 hover:border-emerald-500 hover:bg-slate-750 text-white active:scale-95'
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

                {/* Next Question / Finish */}
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
                          setCountA(q.countA);
                          setCountB(q.countB);
                          syncEnvironment(q.type, q.countA, q.countB, false);
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
              /* Quiz Completion Summary Screen */
              <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-xl">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    {language === 'np' ? 'मूल्याङ्कन सम्पन्न भयो!' : 'Quiz Completed!'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'np'
                      ? 'तपाईंले कक्षा १ को जोड सम्बन्धी सीप अभ्यास गर्नुभयो।'
                      : 'You mastered addition combinations up to 10.'}
                  </p>
                </div>

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
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    {language === 'np' ? 'पुस्तकालय फर्कनुहोस्' : 'Return to Library'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FREE EXPLORATION CONTROLS (Bottom Panel) */}
        {activeStage === 'FREE_EXPLORE' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-xl bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'np' ? 'खुला अन्वेषण' : 'Free Exploration'}
              </span>
              <div className="flex gap-1">
                {(['APPLES', 'MANGOES', 'FLOWERS', 'BALLS'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setObjectType(t);
                      syncEnvironment(t, countA, countB, isCombined);
                      playSound('click');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      objectType === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'APPLES'
                      ? language === 'np'
                        ? 'स्याउ'
                        : 'Apples'
                      : t === 'MANGOES'
                      ? language === 'np'
                        ? 'आँप'
                        : 'Mangoes'
                      : t === 'FLOWERS'
                      ? language === 'np'
                        ? 'फूल'
                        : 'Flowers'
                      : language === 'np'
                      ? 'बल'
                      : 'Balls'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300">A: {countA}</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={countA}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val + countB <= 10) {
                      setCountA(val);
                      setIsCombined(false);
                      syncEnvironment(objectType, val, countB, false);
                    }
                  }}
                  className="w-20 accent-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-sky-300">B: {countB}</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={countB}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (countA + val <= 10) {
                      setCountB(val);
                      setIsCombined(false);
                      syncEnvironment(objectType, countA, val, false);
                    }
                  }}
                  className="w-20 accent-sky-500"
                />
              </div>

              <button
                onClick={handleCombineAction}
                disabled={combiningActive}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                {language === 'np' ? 'मिसाउनुहोस्' : 'Combine'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

