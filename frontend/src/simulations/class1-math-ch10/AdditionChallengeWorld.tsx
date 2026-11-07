/**
 * AdditionChallengeWorld.tsx
 * Simulation 05: Addition Challenge World (जोड चुनौती संसार)
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
  Store,
  Trees,
  Gamepad2,
  Wrench,
  Award,
  HelpCircle,
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

type VillageStation = 'FRUIT_SHOP' | 'BIRD_GARDEN' | 'TOY_HOUSE' | 'WORKSHOP' | 'MASTER_QUIZ';

interface MasterQuestion {
  id: number;
  stationName: string;
  questionNp: string;
  questionEn: string;
  verticalFormat?: { a: number; b: number };
  options: number[];
  correct: number;
  explanationNp: string;
  explanationEn: string;
}

export const AdditionChallengeWorld: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Village Station
  const [activeStation, setActiveStation] = useState<VillageStation>('FRUIT_SHOP');

  // ==========================================
  // STATION 1: FRUIT SHOP (Story-Based Addition)
  // ==========================================
  const fruitStories = useMemo(
    () => [
      {
        id: 1,
        a: 8,
        b: 5,
        sum: 13,
        storyNp: 'रामसँग ८ ओटा केरा थिए। बहिनीले थप ५ ओटा केरा दिइन्। अब रामसँग जम्मा कति ओटा केरा भए?',
        storyEn: 'Ram had 8 bananas. His sister gave him 5 more bananas. How many bananas does Ram have altogether?',
        options: [12, 13, 14],
      },
      {
        id: 2,
        a: 9,
        b: 6,
        sum: 15,
        storyNp: 'पसलमा ९ ओटा सुन्तला र ६ ओटा स्याउ छन्। दुवै मिलाउँदा जम्मा कति फलफूल छन्?',
        storyEn: 'There are 9 oranges and 6 apples in the shop. How many fruits are there in total?',
        options: [14, 15, 16],
      },
    ],
    []
  );
  const [fruitIdx, setFruitIdx] = useState(0);
  const currentFruit = fruitStories[fruitIdx];
  const [fruitSelected, setFruitSelected] = useState<number | null>(null);

  // ==========================================
  // STATION 2: BIRD GARDEN (Make-Ten Strategy)
  // ==========================================
  const birdProblems = useMemo(
    () => [
      { id: 1, a: 9, b: 6, need: 1, remain: 5, sum: 15 },
      { id: 2, a: 8, b: 7, need: 2, remain: 5, sum: 15 },
      { id: 3, a: 7, b: 6, need: 3, remain: 3, sum: 13 },
    ],
    []
  );
  const [birdIdx, setBirdIdx] = useState(0);
  const currentBird = birdProblems[birdIdx];
  const [birdSelected, setBirdSelected] = useState<number | null>(null);

  // ==========================================
  // STATION 3: TOY HOUSE (Three-Number Addition)
  // ==========================================
  const toyProblems = useMemo(
    () => [
      { id: 1, a: 4, b: 5, c: 6, sum: 15, options: [14, 15, 16] },
      { id: 2, a: 7, b: 3, c: 4, sum: 14, options: [13, 14, 15] },
      { id: 3, a: 8, b: 2, c: 6, sum: 16, options: [15, 16, 17] },
    ],
    []
  );
  const [toyIdx, setToyIdx] = useState(0);
  const currentToy = toyProblems[toyIdx];
  const [toySelected, setToySelected] = useState<number | null>(null);

  // ==========================================
  // STATION 4: WORKSHOP (Vertical Addition)
  // ==========================================
  const verticalProblems = useMemo(
    () => [
      { id: 1, a: 8, b: 7, sum: 15, options: [14, 15, 16] },
      { id: 2, a: 9, b: 6, sum: 15, options: [13, 15, 17] },
      { id: 3, a: 11, b: 5, sum: 16, options: [15, 16, 17] },
      { id: 4, a: 12, b: 7, sum: 19, options: [18, 19, 20] },
    ],
    []
  );
  const [vertIdx, setVertIdx] = useState(0);
  const currentVert = verticalProblems[vertIdx];
  const [vertSelected, setVertSelected] = useState<number | null>(null);

  // ==========================================
  // STATION 5: MASTER EVALUATION QUIZ (10 QUESTIONS)
  // ==========================================
  const masterList: MasterQuestion[] = useMemo(
    () => [
      {
        id: 1,
        stationName: 'कथा जोड (Story Addition)',
        questionNp: '८ ओटा केरा र ५ ओटा केरा जोड्दा जम्मा कति हुन्छ?',
        questionEn: 'How many bananas altogether in 8 bananas + 5 bananas?',
        options: [12, 13, 14],
        correct: 13,
        explanationNp: '८ + ५ = १३ (तेह्र) हुन्छ।',
        explanationEn: '8 + 5 = 13 (Thirteen).',
      },
      {
        id: 2,
        stationName: 'दश बनाउने विधि (Make Ten)',
        questionNp: '९ + ६ लाई १० बनाएर जोड्दा कति हुन्छ?',
        questionEn: 'Solve 9 + 6 using make-10:',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '९ + १ = १०, १० + ५ = १५ हुन्छ।',
        explanationEn: '9 + 1 = 10, 10 + 5 = 15.',
      },
      {
        id: 3,
        stationName: 'तीन सङ्ख्याको जोड (3-Number)',
        questionNp: '४ + ५ + ६ = कति हुन्छ?',
        questionEn: 'What is 4 + 5 + 6?',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '४ + ६ = १०, १० + ५ = १५ हुन्छ।',
        explanationEn: '4 + 6 = 10, 10 + 5 = 15.',
      },
      {
        id: 4,
        stationName: 'ठाडो जोड (Vertical Addition)',
        verticalFormat: { a: 8, b: 7 },
        questionNp: '८ मा ७ जोड्दा कति हुन्छ?',
        questionEn: 'What is 8 + 7 vertically?',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '८ + ७ = १५ हुन्छ।',
        explanationEn: '8 + 7 = 15.',
      },
      {
        id: 5,
        stationName: 'खाली ठाउँ भर्ने (Missing Addend)',
        questionNp: '१२ + [ ? ] = १७ मा खाली ठाउँमा कुन सङ्ख्या हुन्छ?',
        questionEn: 'In 12 + [ ? ] = 17, what is the missing number?',
        options: [4, 5, 6],
        correct: 5,
        explanationNp: '१२ + ५ = १७ हुन्छ।',
        explanationEn: '12 + 5 = 17.',
      },
      {
        id: 6,
        stationName: 'योगफल बनाउने (Build Total)',
        questionNp: 'कुन जोडी जोड्दा १५ बन्दछ?',
        questionEn: 'Which pair sums to 15?',
        options: [15, 14, 16], // represented as sum check
        correct: 15,
        explanationNp: '१० + ५ = १५ हुन्छ।',
        explanationEn: '10 + 5 = 15.',
      },
      {
        id: 7,
        stationName: 'मिश्रित अभ्यास (Mixed Practice)',
        questionNp: '१० + ९ को मान कति हुन्छ?',
        questionEn: 'What is 10 + 9?',
        options: [18, 19, 20],
        correct: 19,
        explanationNp: '१० + ९ = १९ (उन्नाइस) हुन्छ।',
        explanationEn: '10 + 9 = 19 (Nineteen).',
      },
      {
        id: 8,
        stationName: 'ठाडो जोड (Vertical Addition)',
        verticalFormat: { a: 11, b: 5 },
        questionNp: '११ मा ५ जोड्दा कति हुन्छ?',
        questionEn: 'What is 11 + 5 vertically?',
        options: [15, 16, 17],
        correct: 16,
        explanationNp: '११ + ५ = १६ (सोह्र) हुन्छ।',
        explanationEn: '11 + 5 = 16 (Sixteen).',
      },
      {
        id: 9,
        stationName: 'तीन सङ्ख्याको जोड (3-Number)',
        questionNp: '७ + ३ + ५ को जोडफल कति हुन्छ?',
        questionEn: 'What is 7 + 3 + 5?',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '७ + ३ = १०, १० + ५ = १५ हुन्छ।',
        explanationEn: '7 + 3 = 10, 10 + 5 = 15.',
      },
      {
        id: 10,
        stationName: 'खाली ठाउँ भर्ने (Missing Addend)',
        questionNp: '[ ? ] + ८ = १८ मा कुन सङ्ख्या हुनुपर्छ?',
        questionEn: 'In [ ? ] + 8 = 18, what is the missing addend?',
        options: [8, 9, 10],
        correct: 10,
        explanationNp: '१० + ८ = १८ हुन्छ।',
        explanationEn: '10 + 8 = 18.',
      },
    ],
    []
  );

  const [masterIdx, setMasterIdx] = useState(0);
  const [masterScore, setMasterScore] = useState(0);
  const [masterAnswered, setMasterAnswered] = useState(false);
  const [masterSelected, setMasterSelected] = useState<number | null>(null);
  const [masterCompleted, setMasterCompleted] = useState(false);

  // Audio Synthesizer
  const playSound = useCallback(
    (type: 'click' | 'success' | 'fanfare' | 'boop') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();

        if (type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
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
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH10-05/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSpentSeconds: 150,
          metrics: {
            challengeWorldScore: score,
            starsAwarded: Math.min(3, Math.ceil(score / 3.3)),
          },
        }),
      });
    } catch (err) {}
  }, []);

  // Station 1: Fruit
  const handleFruitSelect = (opt: number) => {
    playSound('click');
    setFruitSelected(opt);
    if (opt === currentFruit.sum) {
      playSound('success');
      speak(
        `स्याबास! ${NEP_NUMERALS[currentFruit.a]} + ${NEP_NUMERALS[currentFruit.b]} = ${NEP_NUMERALS[currentFruit.sum]} हुन्छ!`,
        `Well done! ${currentFruit.a} + ${currentFruit.b} = ${currentFruit.sum}!`
      );
    } else {
      playSound('boop');
      speak('मिलेन, फेरि गनेर हेर्नुहोस्।', 'Not correct, count again.');
    }
  };

  // Station 2: Bird
  const handleBirdSelect = (opt: number) => {
    playSound('click');
    setBirdSelected(opt);
    if (opt === currentBird.sum) {
      playSound('success');
      speak('स्याबास! १० बनाएर सही जोडफल निकाल्नुभयो!', 'Great job! Make 10 addition is correct!');
    } else {
      playSound('boop');
      speak('मिलेन, पुनः प्रयास गर्नुहोस्।', 'Try again.');
    }
  };

  // Station 3: Toy
  const handleToySelect = (opt: number) => {
    playSound('click');
    setToySelected(opt);
    if (opt === currentToy.sum) {
      playSound('success');
      speak('स्याबास! तीनवटै सङ्ख्याको जोड सही छ!', 'Correct three-number sum!');
    } else {
      playSound('boop');
      speak('मिलेन, फेरि जोड्नुहोस्।', 'Try again.');
    }
  };

  // Station 4: Vertical
  const handleVertSelect = (opt: number) => {
    playSound('click');
    setVertSelected(opt);
    if (opt === currentVert.sum) {
      playSound('success');
      speak('स्याबास! ठाडो जोडको उत्तर सही छ!', 'Correct vertical addition answer!');
    } else {
      playSound('boop');
      speak('मिलेन, फेरि जोड्नुहोस्।', 'Try again.');
    }
  };

  // Station 5: Master Quiz Handlers
  const handleMasterAnswer = (opt: number) => {
    if (masterAnswered) return;
    setMasterSelected(opt);
    setMasterAnswered(true);
    const q = masterList[masterIdx];

    if (opt === q.correct) {
      playSound('success');
      setMasterScore((prev) => prev + 1);
      speak('स्याबास! सही उत्तर।', 'Well done! Correct answer.');
    } else {
      playSound('boop');
      speak('मिलेन। सही उत्तर हेर्नुहोस्।', 'Check the explanation.');
    }
  };

  const handleMasterNext = () => {
    playSound('click');
    if (masterIdx + 1 < masterList.length) {
      setMasterIdx((prev) => prev + 1);
      setMasterAnswered(false);
      setMasterSelected(null);
    } else {
      setMasterCompleted(true);
      playSound('fanfare');
      recordProgress(masterScore);
    }
  };

  const handleMasterReset = () => {
    playSound('click');
    setMasterIdx(0);
    setMasterScore(0);
    setMasterAnswered(false);
    setMasterSelected(null);
    setMasterCompleted(false);
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
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                Simulation 05
              </span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'np' ? 'जोड चुनौती संसार (गाउँका ५ केन्द्रहरू)' : 'Addition Challenge World'}
            </h1>
          </div>
        </div>

        {/* Station Selector */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => {
              playSound('click');
              setActiveStation('FRUIT_SHOP');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeStation === 'FRUIT_SHOP' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            {language === 'np' ? '१. फलफूल पसल' : '1. Fruit Shop'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveStation('BIRD_GARDEN');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeStation === 'BIRD_GARDEN' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            {language === 'np' ? '२. चरा बगैँचा' : '2. Bird Garden'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveStation('TOY_HOUSE');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeStation === 'TOY_HOUSE' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            {language === 'np' ? '३. खेलौना घर' : '3. Toy House'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveStation('WORKSHOP');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeStation === 'WORKSHOP' ? 'bg-violet-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            {language === 'np' ? '४. ठाडो जोड' : '4. Vertical Add'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveStation('MASTER_QUIZ');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeStation === 'MASTER_QUIZ' ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {language === 'np' ? '५. महा-परीक्षा' : '5. Master Quiz'}
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
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition"
          >
            {language === 'np' ? 'English' : 'नेपाली'}
          </button>
        </div>
      </header>

      {/* Main Screen */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        {/* ========================================================================= */}
        {/* STATION 1: FRUIT SHOP (STORY-BASED ADDITION) */}
        {/* ========================================================================= */}
        {activeStation === 'FRUIT_SHOP' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                    {language === 'np' ? 'केन्द्र १: फलफूल पसल (कथा जोड)' : 'Station 1: Fruit Shop (Story Addition)'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {language === 'np' ? 'कथा पढेर जम्मा फलफूलको सङ्ख्या पत्ता लगाउनुहोस्!' : 'Read the story and find total fruits!'}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setFruitIdx((prev) => (prev + 1) % fruitStories.length);
                    setFruitSelected(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को कथा' : 'Next Story'}
                </button>
              </div>

              {/* Story Box */}
              <div className="p-6 bg-slate-900/80 rounded-2xl border border-amber-500/40">
                <p className="text-lg md:text-xl font-bold text-amber-200 leading-relaxed">
                  {language === 'np' ? currentFruit.storyNp : currentFruit.storyEn}
                </p>
              </div>

              {/* Equation Visual */}
              <div className="flex items-center justify-center text-3xl font-black text-white gap-3">
                <span>{NEP_NUMERALS[currentFruit.a]}</span>
                <span className="text-amber-400">+</span>
                <span>{NEP_NUMERALS[currentFruit.b]}</span>
                <span>=</span>
                <span className="text-emerald-400 underline decoration-dashed">
                  {fruitSelected ? NEP_NUMERALS[fruitSelected] : '?'}
                </span>
              </div>

              {/* Options */}
              <div className="grid grid-cols-3 gap-3">
                {currentFruit.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleFruitSelect(opt)}
                    className={`p-5 rounded-2xl text-2xl font-black transition border flex items-center justify-center ${
                      fruitSelected === opt
                        ? opt === currentFruit.sum
                          ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-lg'
                          : 'bg-rose-600 text-white border-rose-400'
                        : 'bg-slate-700/80 hover:bg-slate-700 text-white border-slate-600'
                    }`}
                  >
                    {NEP_NUMERALS[opt]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATION 2: BIRD GARDEN (MAKE TEN) */}
        {/* ========================================================================= */}
        {activeStation === 'BIRD_GARDEN' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                    {language === 'np' ? 'केन्द्र २: चरा बगैँचा (दश बनाउने विधि)' : 'Station 2: Bird Garden (Make Ten)'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {NEP_NUMERALS[currentBird.a]} + {NEP_NUMERALS[currentBird.b]} = ?
                  </h3>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setBirdIdx((prev) => (prev + 1) % birdProblems.length);
                    setBirdSelected(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को समस्या' : 'Next'}
                </button>
              </div>

              {/* Make Ten Visual Explainer Card */}
              <div className="p-6 bg-slate-900/90 rounded-2xl border border-emerald-500/40 flex flex-col items-center gap-3">
                <span className="text-xs text-slate-400 font-bold">
                  {language === 'np' ? 'दश बनाएर जोड्ने चरण:' : 'Make 10 Step:'}
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  {NEP_NUMERALS[currentBird.a]} + {NEP_NUMERALS[currentBird.need]} + {NEP_NUMERALS[currentBird.remain]} = १० + {NEP_NUMERALS[currentBird.remain]}
                </span>
              </div>

              {/* Options */}
              <div className="grid grid-cols-3 gap-3">
                {[currentBird.sum - 1, currentBird.sum, currentBird.sum + 1].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleBirdSelect(opt)}
                    className={`p-5 rounded-2xl text-2xl font-black transition border flex items-center justify-center ${
                      birdSelected === opt
                        ? opt === currentBird.sum
                          ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-lg'
                          : 'bg-rose-600 text-white border-rose-400'
                        : 'bg-slate-700/80 hover:bg-slate-700 text-white border-slate-600'
                    }`}
                  >
                    {NEP_NUMERALS[opt]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATION 3: TOY HOUSE (THREE-NUMBER ADDITION) */}
        {/* ========================================================================= */}
        {activeStation === 'TOY_HOUSE' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-sky-400 tracking-wider">
                    {language === 'np' ? 'केन्द्र ३: खेलौना घर (तीन सङ्ख्याको जोड)' : 'Station 3: Toy House (3-Number)'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {NEP_NUMERALS[currentToy.a]} + {NEP_NUMERALS[currentToy.b]} + {NEP_NUMERALS[currentToy.c]} = ?
                  </h3>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setToyIdx((prev) => (prev + 1) % toyProblems.length);
                    setToySelected(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को समस्या' : 'Next'}
                </button>
              </div>

              {/* Visual equation */}
              <div className="p-6 bg-slate-900/90 rounded-2xl border border-sky-500/40 flex items-center justify-center text-3xl font-black text-sky-300 gap-3">
                <span>{NEP_NUMERALS[currentToy.a]}</span>
                <span>+</span>
                <span>{NEP_NUMERALS[currentToy.b]}</span>
                <span>+</span>
                <span>{NEP_NUMERALS[currentToy.c]}</span>
                <span>=</span>
                <span className="text-white underline decoration-dashed">
                  {toySelected ? NEP_NUMERALS[toySelected] : '?'}
                </span>
              </div>

              {/* Options */}
              <div className="grid grid-cols-3 gap-3">
                {currentToy.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleToySelect(opt)}
                    className={`p-5 rounded-2xl text-2xl font-black transition border flex items-center justify-center ${
                      toySelected === opt
                        ? opt === currentToy.sum
                          ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-lg'
                          : 'bg-rose-600 text-white border-rose-400'
                        : 'bg-slate-700/80 hover:bg-slate-700 text-white border-slate-600'
                    }`}
                  >
                    {NEP_NUMERALS[opt]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATION 4: WORKSHOP (VERTICAL COLUMN ADDITION) */}
        {/* ========================================================================= */}
        {activeStation === 'WORKSHOP' && (
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-violet-400 tracking-wider">
                    {language === 'np' ? 'केन्द्र ४: ठाडो जोड (Vertical Addition)' : 'Station 4: Vertical Addition'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {language === 'np' ? 'ठाडो स्तम्भमा जोड गर्नुहोस्!' : 'Add the vertical column!'}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setVertIdx((prev) => (prev + 1) % verticalProblems.length);
                    setVertSelected(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को समस्या' : 'Next'}
                </button>
              </div>

              {/* Vertical Column Board */}
              <div className="flex justify-center my-4">
                <div className="bg-slate-900/90 p-8 rounded-3xl border border-violet-500/40 w-48 flex flex-col items-end text-4xl font-black text-white gap-2 shadow-inner">
                  <span>{NEP_NUMERALS[currentVert.a]}</span>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-violet-400">+</span>
                    <span>{NEP_NUMERALS[currentVert.b]}</span>
                  </div>
                  <div className="w-full h-1 bg-white rounded-full my-1" />
                  <span className="text-emerald-400">
                    {vertSelected ? NEP_NUMERALS[vertSelected] : '?'}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-3 gap-3">
                {currentVert.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleVertSelect(opt)}
                    className={`p-5 rounded-2xl text-2xl font-black transition border flex items-center justify-center ${
                      vertSelected === opt
                        ? opt === currentVert.sum
                          ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-lg'
                          : 'bg-rose-600 text-white border-rose-400'
                        : 'bg-slate-700/80 hover:bg-slate-700 text-white border-slate-600'
                    }`}
                  >
                    {NEP_NUMERALS[opt]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATION 5: MASTER EVALUATION QUIZ (10 QUESTIONS) */}
        {/* ========================================================================= */}
        {activeStation === 'MASTER_QUIZ' && (
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full justify-center">
            {!masterCompleted ? (
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700 pb-3">
                  <span className="font-bold text-rose-400">
                    {language === 'np'
                      ? `प्रश्न ${NEP_NUMERALS[masterIdx + 1]} / ${NEP_NUMERALS[masterList.length]}`
                      : `Question ${masterIdx + 1} of ${masterList.length}`}
                  </span>
                  <span>
                    {language === 'np' ? `अङ्क: ${NEP_NUMERALS[masterScore]}` : `Score: ${masterScore}`}
                  </span>
                </div>

                <span className="text-xs text-slate-400 font-semibold">
                  {masterList[masterIdx].stationName}
                </span>

                {/* If vertical question */}
                {masterList[masterIdx].verticalFormat ? (
                  <div className="flex justify-center my-2">
                    <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-700 w-36 flex flex-col items-end text-3xl font-black text-white gap-1">
                      <span>{NEP_NUMERALS[masterList[masterIdx].verticalFormat!.a]}</span>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-rose-400">+</span>
                        <span>{NEP_NUMERALS[masterList[masterIdx].verticalFormat!.b]}</span>
                      </div>
                      <div className="w-full h-0.5 bg-white rounded-full my-0.5" />
                      <span className="text-amber-400">?</span>
                    </div>
                  </div>
                ) : (
                  <h3 className="text-xl md:text-2xl font-black text-white">
                    {language === 'np' ? masterList[masterIdx].questionNp : masterList[masterIdx].questionEn}
                  </h3>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {masterList[masterIdx].options.map((opt) => {
                    const isSelected = masterSelected === opt;
                    const isCorrectOpt = opt === masterList[masterIdx].correct;
                    let btnStyle = 'bg-slate-700/80 hover:bg-slate-700 text-white';

                    if (masterAnswered) {
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
                        disabled={masterAnswered}
                        onClick={() => handleMasterAnswer(opt)}
                        className={`p-4 rounded-2xl text-xl font-bold transition flex items-center justify-center border border-slate-600 ${btnStyle}`}
                      >
                        {NEP_NUMERALS[opt]}
                      </button>
                    );
                  })}
                </div>

                {masterAnswered && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300">
                    <p className="font-bold text-amber-400 mb-1">
                      {language === 'np' ? 'व्याख्या:' : 'Explanation:'}
                    </p>
                    <p>
                      {language === 'np'
                        ? masterList[masterIdx].explanationNp
                        : masterList[masterIdx].explanationEn}
                    </p>
                  </div>
                )}

                {masterAnswered && (
                  <button
                    onClick={handleMasterNext}
                    className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/95 border-2 border-rose-500/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <Award className="w-10 h-10 text-rose-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">
                    {language === 'np' ? 'बधाई छ! महा-चुनौती पूरा भयो!' : 'Congratulations! Master Challenge Complete!'}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    {language === 'np'
                      ? 'तपाईंले कक्षा १ अध्याय १० (योगफल २० सम्म आउने जोड) सम्बन्धी सम्पूर्ण ज्ञान प्रमाणित गर्नुभयो।'
                      : 'You have mastered Addition up to 20 across all representations and strategies.'}
                  </p>
                </div>

                <div className="text-4xl font-black text-rose-400">
                  {NEP_NUMERALS[masterScore]} / {NEP_NUMERALS[masterList.length]}
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleMasterReset}
                    className="flex-1 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'पुनः परीक्षा दिनुहोस्' : 'Retake Challenge'}
                  </button>
                  <button
                    onClick={() => {
                      playSound('click');
                      setActiveStation('FRUIT_SHOP');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'पसलमा फर्कनुहोस्' : 'Back to Shop'}
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

