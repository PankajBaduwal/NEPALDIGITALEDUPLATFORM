/**
 * AdditionPlayground.tsx
 * Simulation 01: Addition Playground (जोड खेलमैदान)
 * Class 1 Mathematics - Chapter 10: Addition up to 20 (योगफल २० सम्म आउने जोड)
 * Nepal Digital Education Platform
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  HelpCircle,
  Lightbulb,
  Award,
} from 'lucide-react';
import {
  AdditionPlaygroundEnvironment,
  PlaygroundObjectType,
} from './AdditionPlaygroundEnvironment';

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

interface StoryMission {
  id: number;
  countA: number;
  countB: number;
  type: PlaygroundObjectType;
  itemNameNp: string;
  itemNameEn: string;
  storyNp: string;
  storyEn: string;
}

interface QuizItem {
  id: number;
  countA: number;
  countB: number;
  questionNp: string;
  questionEn: string;
  options: number[];
  correct: number;
  explanationNp: string;
  explanationEn: string;
}

export const AdditionPlayground: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Mode: 'PLAYGROUND' | 'QUIZ'
  const [mode, setMode] = useState<'PLAYGROUND' | 'QUIZ'>('PLAYGROUND');

  // 3D Three.js Ref
  const mountRef = useRef<HTMLDivElement | null>(null);
  const envRef = useRef<AdditionPlaygroundEnvironment | null>(null);

  // Active Story Missions
  const missions: StoryMission[] = useMemo(
    () => [
      {
        id: 1,
        countA: 6,
        countB: 4,
        type: 'APPLES',
        itemNameNp: 'स्याउ',
        itemNameEn: 'apples',
        storyNp: 'पहिलो टोकरीमा ६ ओटा स्याउ छन् र दोस्रो टोकरीमा ४ ओटा स्याउ छन्। जम्मा कति ओटा स्याउ भए?',
        storyEn: 'There are 6 apples in the first basket and 4 apples in the second basket. How many apples altogether?',
      },
      {
        id: 2,
        countA: 8,
        countB: 5,
        type: 'BANANAS',
        itemNameNp: 'केरा',
        itemNameEn: 'bananas',
        storyNp: 'पहिलो टोकरीमा ८ ओटा केरा छन् र दोस्रो टोकरीमा ५ ओटा केरा छन्। जम्मा कति ओटा केरा भए?',
        storyEn: 'There are 8 bananas in the first basket and 5 bananas in the second basket. How many bananas altogether?',
      },
      {
        id: 3,
        countA: 9,
        countB: 6,
        type: 'BALLOONS',
        itemNameNp: 'बेलुन',
        itemNameEn: 'balloons',
        storyNp: 'रामसँग ९ ओटा बेलुन छन् र सीतासँग ६ ओटा बेलुन छन्। दुवैको मिलाउँदा जम्मा कति भयो?',
        storyEn: 'Ram has 9 balloons and Sita has 6 balloons. How many balloons in total?',
      },
      {
        id: 4,
        countA: 10,
        countB: 5,
        type: 'FLOWERS',
        itemNameNp: 'फूल',
        itemNameEn: 'flowers',
        storyNp: 'बगैँचामा १० ओटा राता फूल र ५ ओटा पहेँला फूल छन्। जम्मा कति ओटा फूल फुलेका छन्?',
        storyEn: 'In the garden, there are 10 red flowers and 5 yellow flowers. How many flowers altogether?',
      },
      {
        id: 5,
        countA: 7,
        countB: 8,
        type: 'TOY_BLOCKS',
        itemNameNp: 'ब्लकहरू',
        itemNameEn: 'blocks',
        storyNp: 'पहिलो बाकसमा ७ ओटा र दोस्रो बाकसमा ८ ओटा ब्लक छन्। दुवै जोड्दा कति हुन्छ?',
        storyEn: 'First box has 7 blocks and second box has 8 blocks. How many when combined?',
      },
    ],
    []
  );

  const [activeMissionIdx, setActiveMissionIdx] = useState(0);
  const currentMission = missions[activeMissionIdx];

  // Interaction State
  const [isCombined, setIsCombined] = useState(false);
  const [userSelectedTotal, setUserSelectedTotal] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'incorrect'>('idle');

  // Quiz State
  const quizList: QuizItem[] = useMemo(
    () => [
      {
        id: 1,
        countA: 6,
        countB: 4,
        questionNp: '६ + ४ को जोडफल कति हुन्छ?',
        questionEn: 'What is the sum of 6 + 4?',
        options: [9, 10, 11],
        correct: 10,
        explanationNp: '६ र ४ जोड्दा १० हुन्छ (६ + ४ = १०)।',
        explanationEn: '6 and 4 combined makes 10 (6 + 4 = 10).',
      },
      {
        id: 2,
        countA: 8,
        countB: 5,
        questionNp: 'पहिलो समूहमा ८ र दोस्रो समूहमा ५ हुँदा जम्मा कति हुन्छ?',
        questionEn: 'If group 1 has 8 and group 2 has 5, what is the total?',
        options: [12, 13, 14],
        correct: 13,
        explanationNp: '८ + ५ = १३ (तेह्र) हुन्छ।',
        explanationEn: '8 + 5 = 13 (Thirteen).',
      },
      {
        id: 3,
        countA: 9,
        countB: 6,
        questionNp: '९ ओटा बेलुनमा ६ ओटा बेलुन थप्दा कति हुन्छ?',
        questionEn: 'Adding 6 balloons to 9 balloons gives how many?',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '९ + ६ = १५ (पन्ध्र) हुन्छ।',
        explanationEn: '9 + 6 = 15 (Fifteen).',
      },
      {
        id: 4,
        countA: 10,
        countB: 5,
        questionNp: '१० + ५ को मान कति हुन्छ?',
        questionEn: 'What is the value of 10 + 5?',
        options: [15, 16, 20],
        correct: 15,
        explanationNp: '१० + ५ = १५ (पन्ध्र) हुन्छ।',
        explanationEn: '10 + 5 = 15 (Fifteen).',
      },
      {
        id: 5,
        countA: 7,
        countB: 8,
        questionNp: '७ + ८ जोड्दा कति आउँछ?',
        questionEn: 'What is the result of adding 7 + 8?',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '७ + ८ = १५ हुन्छ।',
        explanationEn: '7 + 8 = 15.',
      },
      {
        id: 6,
        countA: 11,
        countB: 4,
        questionNp: '११ + ४ को जोडफल कति हो?',
        questionEn: 'What is the sum of 11 + 4?',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '११ + ४ = १५ हुन्छ।',
        explanationEn: '11 + 4 = 15.',
      },
      {
        id: 7,
        countA: 12,
        countB: 6,
        questionNp: '१२ ओटा स्याउमा ६ ओटा स्याउ मिसाउँदा कति हुन्छ?',
        questionEn: 'Combining 12 apples and 6 apples yields how many?',
        options: [17, 18, 19],
        correct: 18,
        explanationNp: '१२ + ६ = १८ (अठार) हुन्छ।',
        explanationEn: '12 + 6 = 18 (Eighteen).',
      },
      {
        id: 8,
        countA: 14,
        countB: 5,
        questionNp: '१४ + ५ को मान कुन हो?',
        questionEn: 'Which is the value of 14 + 5?',
        options: [18, 19, 20],
        correct: 19,
        explanationNp: '१४ + ५ = १९ (उन्नाइस) हुन्छ।',
        explanationEn: '14 + 5 = 19 (Nineteen).',
      },
      {
        id: 9,
        countA: 10,
        countB: 10,
        questionNp: '१० र १० जोड्दा कति हुन्छ?',
        questionEn: 'What is 10 plus 10?',
        options: [18, 19, 20],
        correct: 20,
        explanationNp: '१० + १० = २० (बीस) हुन्छ।',
        explanationEn: '10 + 10 = 20 (Twenty).',
      },
      {
        id: 10,
        countA: 13,
        countB: 7,
        questionNp: '१३ + ७ को जोडफल कति हुन्छ?',
        questionEn: 'What is the sum of 13 + 7?',
        options: [19, 20, 21],
        correct: 20,
        explanationNp: '१३ + ७ = २० (बीस) हुन्छ।',
        explanationEn: '13 + 7 = 20 (Twenty).',
      },
    ],
    []
  );

  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Web Audio Synthesizer
  const playSound = useCallback(
    (type: 'click' | 'combine' | 'success' | 'fanfare' | 'boop') => {
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
        } else if (type === 'combine') {
          // Swoosh jump chime
          [260, 330, 392, 523, 659].forEach((freq, idx) => {
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

  // Initialize 3D Environment
  useEffect(() => {
    if (!mountRef.current) return;
    const env = new AdditionPlaygroundEnvironment(mountRef.current);
    envRef.current = env;

    env.onObjectClick = (info) => {
      playSound('click');
      speak(
        `${info.basket === 'A' ? 'पहिलो समूह' : info.basket === 'B' ? 'दोस्रो समूह' : 'मिसाइएको समूह'}को वस्तु ${NEP_NUMERALS[info.id]}।`,
        `Item ${info.id} of ${info.basket === 'A' ? 'first basket' : 'second basket'}.`
      );
    };

    return () => {
      env.destroy();
      envRef.current = null;
    };
  }, []);

  // Sync 3D scene when mission changes
  useEffect(() => {
    if (envRef.current) {
      envRef.current.spawnObjects(currentMission.countA, currentMission.countB, currentMission.type);
      setIsCombined(false);
      setUserSelectedTotal(null);
      setFeedback('idle');
    }
  }, [activeMissionIdx, currentMission]);

  // Record progress API
  const recordProgress = useCallback(async (score: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH10-01/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSpentSeconds: 150,
          metrics: {
            additionPlaygroundScore: score,
            starsAwarded: Math.min(3, Math.ceil(score / 3.3)),
          },
        }),
      });
    } catch (err) {}
  }, []);

  // Combine Groups
  const handleCombineGroups = () => {
    playSound('combine');
    setIsCombined(true);
    envRef.current?.triggerCombine();
    const total = currentMission.countA + currentMission.countB;
    speak(
      `दुवै समूहका वस्तुहरू बीचमा मिसाइयो! अब जम्मा कति भयो, गन्नुहोस्।`,
      `Both groups are combined in the center! Count how many there are now.`
    );
  };

  // Reset positions
  const handleReset = () => {
    playSound('click');
    setIsCombined(false);
    setUserSelectedTotal(null);
    setFeedback('idle');
    envRef.current?.resetPositions();
  };

  // Check user selected total
  const handleSelectTotalOption = (val: number) => {
    playSound('click');
    setUserSelectedTotal(val);
    const correctTotal = currentMission.countA + currentMission.countB;

    if (val === correctTotal) {
      playSound('success');
      setFeedback('success');
      speak(
        `स्याबास! ${NEP_NUMERALS[currentMission.countA]} + ${NEP_NUMERALS[currentMission.countB]} = ${NEP_NUMERALS[correctTotal]} हुन्छ!`,
        `Well done! ${currentMission.countA} + ${currentMission.countB} = ${correctTotal}!`
      );
    } else {
      playSound('boop');
      setFeedback('incorrect');
      speak('मिलेन, फेरि गनेर मिलाउनुहोस्।', 'Not correct, count again.');
    }
  };

  // Generate 3 option numbers for total
  const totalOptions = useMemo(() => {
    const correctTotal = currentMission.countA + currentMission.countB;
    const pool = [correctTotal - 1, correctTotal, correctTotal + 1].filter((n) => n > 0 && n <= 20);
    return Array.from(new Set(pool)).sort((a, b) => a - b);
  }, [currentMission]);

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
      speak('मिलेन। सही उत्तर र व्याख्या हेर्नुहोस्।', 'Incorrect. Check the explanation.');
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

  const totalSum = currentMission.countA + currentMission.countB;

  return (
    <div className="relative w-full h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Header Bar */}
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
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                3D WebGL
              </span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'np' ? 'जोड खेलमैदान (२० सम्मको जोड)' : 'Addition Playground (Up to 20)'}
            </h1>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => {
              playSound('click');
              setMode('PLAYGROUND');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              mode === 'PLAYGROUND' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            {language === 'np' ? '३डी खेलमैदान' : '3D Playground'}
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
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
          >
            {language === 'np' ? 'English' : 'नेपाली'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* ========================================================================= */}
        {/* MODE 1: 3D PLAYGROUND WORKBENCH */}
        {/* ========================================================================= */}
        {mode === 'PLAYGROUND' && (
          <div className="relative w-full h-full flex flex-col">
            {/* Mission Carousel Selector */}
            <div className="absolute top-3 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur p-3 rounded-2xl border border-slate-700/80 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'np' ? 'समस्या छान्नुहोस्:' : 'Select Mission:'}
                </span>
                <div className="flex gap-1.5">
                  {missions.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        playSound('click');
                        setActiveMissionIdx(idx);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                        activeMissionIdx === idx
                          ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {NEP_NUMERALS[m.countA]} + {NEP_NUMERALS[m.countB]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Audio Guide */}
              <button
                onClick={() => speak(currentMission.storyNp, currentMission.storyEn)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Volume2 className="w-4 h-4" />
                {language === 'np' ? 'कथा सुन्नुहोस्' : 'Listen Story'}
              </button>
            </div>

            {/* 3D Canvas Mount Point */}
            <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

            {/* Story Banner Floating Box */}
            <div className="absolute top-20 left-4 max-w-sm bg-slate-900/85 backdrop-blur border border-emerald-500/40 p-4 rounded-2xl shadow-xl z-10 hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                {language === 'np' ? 'जोडको कथा' : 'Addition Story'}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {language === 'np' ? currentMission.storyNp : currentMission.storyEn}
              </p>
            </div>

            {/* Bottom Interactive Dashboard */}
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/90 backdrop-blur p-4 rounded-3xl border border-slate-700 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              {/* Basket Counts Display */}
              <div className="flex items-center gap-3">
                {/* Basket A Pill */}
                <div className="flex items-center gap-2 bg-blue-950/70 border border-blue-500/50 px-3 py-1.5 rounded-2xl">
                  <span className="text-[10px] text-blue-300 font-bold uppercase">
                    {language === 'np' ? 'टोकरी १' : 'Basket 1'}
                  </span>
                  <span className="text-xl font-black text-blue-400">
                    {NEP_NUMERALS[currentMission.countA]}
                  </span>
                </div>

                <span className="text-2xl font-black text-amber-400">+</span>

                {/* Basket B Pill */}
                <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/50 px-3 py-1.5 rounded-2xl">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase">
                    {language === 'np' ? 'टोकरी २' : 'Basket 2'}
                  </span>
                  <span className="text-xl font-black text-emerald-400">
                    {NEP_NUMERALS[currentMission.countB]}
                  </span>
                </div>

                <span className="text-2xl font-black text-white">=</span>

                {/* Combined Total Display */}
                <div className="flex items-center gap-2 bg-amber-950/70 border border-amber-500/60 px-4 py-1.5 rounded-2xl">
                  <span className="text-[10px] text-amber-300 font-bold uppercase">
                    {language === 'np' ? 'जम्मा' : 'Total'}
                  </span>
                  <span className="text-2xl font-black text-amber-400">
                    {userSelectedTotal !== null ? NEP_NUMERALS[userSelectedTotal] : '?'}
                  </span>
                </div>
              </div>

              {/* Action: Combine & Reset */}
              <div className="flex items-center gap-2">
                {!isCombined ? (
                  <button
                    onClick={handleCombineGroups}
                    className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/30 flex items-center gap-2 animate-bounce"
                  >
                    <Sparkles className="w-4 h-4" />
                    {language === 'np' ? 'दुवै समूह मिसाउनुहोस्' : 'Combine Groups'}
                  </button>
                ) : (
                  /* Pick total options */
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold mr-1">
                      {language === 'np' ? 'जम्मा कति भयो?' : 'How many in total?'}
                    </span>
                    {totalOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSelectTotalOption(opt)}
                        className={`w-11 h-11 rounded-xl font-black text-base transition flex items-center justify-center border ${
                          userSelectedTotal === opt
                            ? opt === totalSum
                              ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-lg'
                              : 'bg-rose-600 text-white border-rose-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'
                        }`}
                      >
                        {NEP_NUMERALS[opt]}
                      </button>
                    ))}
                    <button
                      onClick={handleReset}
                      className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition ml-2"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: QUIZ EVALUATION */}
        {/* ========================================================================= */}
        {mode === 'QUIZ' && (
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full justify-center p-6">
            {!quizCompleted ? (
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700 pb-3">
                  <span className="font-bold text-amber-400">
                    {language === 'np'
                      ? `प्रश्न ${NEP_NUMERALS[quizIdx + 1]} / ${NEP_NUMERALS[quizList.length]}`
                      : `Question ${quizIdx + 1} of ${quizList.length}`}
                  </span>
                  <span>
                    {language === 'np' ? `अङ्क: ${NEP_NUMERALS[quizScore]}` : `Score: ${quizScore}`}
                  </span>
                </div>

                {/* Question */}
                <h3 className="text-xl md:text-2xl font-black text-white">
                  {language === 'np' ? quizList[quizIdx].questionNp : quizList[quizIdx].questionEn}
                </h3>

                {/* Options Grid */}
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

                {/* Explanation */}
                {quizAnswered && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300">
                    <p className="font-bold text-amber-400 mb-1">
                      {language === 'np' ? 'व्याख्या:' : 'Explanation:'}
                    </p>
                    <p>
                      {language === 'np' ? quizList[quizIdx].explanationNp : quizList[quizIdx].explanationEn}
                    </p>
                  </div>
                )}

                {/* Next */}
                {quizAnswered && (
                  <button
                    onClick={handleQuizNext}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Completion */
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
                      ? 'तपाईंले दुई समूहका वस्तुहरू मिसाएर २० सम्मको जोडफल निकाल्न सिक्नुभयो।'
                      : 'You have mastered combining object groups for additions up to 20.'}
                  </p>
                </div>

                <div className="text-4xl font-black text-amber-400">
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
                      setMode('PLAYGROUND');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'खेलमैदानमा फर्कनुहोस्' : 'Back to Playground'}
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

