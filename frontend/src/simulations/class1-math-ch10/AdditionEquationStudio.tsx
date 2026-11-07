/**
 * AdditionEquationStudio.tsx
 * Simulation 03: Addition Equation Studio (जोड वाक्य निर्माण प्रयोगशाला)
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
  Calculator,
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

type StudioTab = 'PICTURE_EQUATION' | 'HORIZONTAL' | 'THREE_NUMBER' | 'MISSING_ADDEND' | 'QUIZ';

interface PictureItem {
  id: number;
  count1: number;
  count2: number;
  sum: number;
  nameNp: string;
  nameEn: string;
}

interface HorizontalItem {
  id: number;
  a: number;
  b: number;
  ans: number;
  options: number[];
}

interface ThreeNumberItem {
  id: number;
  a: number;
  b: number;
  c: number;
  sum: number;
  tenPairA: number;
  tenPairB: number;
}

interface MissingAddendItem {
  id: number;
  type: 'FIRST' | 'SECOND';
  known1: number;
  total: number;
  missing: number;
  options: number[];
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

export const AdditionEquationStudio: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<StudioTab>('PICTURE_EQUATION');

  // ==========================================
  // TAB 1: PICTURE TO EQUATION
  // ==========================================
  const pictureItems: PictureItem[] = useMemo(
    () => [
      { id: 1, count1: 8, count2: 4, sum: 12, nameNp: 'स्याउ', nameEn: 'apples' },
      { id: 2, count1: 7, count2: 6, sum: 13, nameNp: 'फूल', nameEn: 'flowers' },
      { id: 3, count1: 9, count2: 5, sum: 14, nameNp: 'बेलुन', nameEn: 'balloons' },
      { id: 4, count1: 10, count2: 7, sum: 17, nameNp: 'तारा', nameEn: 'stars' },
    ],
    []
  );
  const [picIdx, setPicIdx] = useState(0);
  const currentPic = pictureItems[picIdx];
  const [slot1, setSlot1] = useState<number | null>(null);
  const [slot2, setSlot2] = useState<number | null>(null);
  const [slotSum, setSlotSum] = useState<number | null>(null);
  const [picFeedback, setPicFeedback] = useState<'idle' | 'success' | 'incorrect'>('idle');

  // ==========================================
  // TAB 2: HORIZONTAL ADDITION
  // ==========================================
  const horizontalItems: HorizontalItem[] = useMemo(
    () => [
      { id: 1, a: 7, b: 5, ans: 12, options: [11, 12, 13] },
      { id: 2, a: 9, b: 4, ans: 13, options: [12, 13, 14] },
      { id: 3, a: 10, b: 6, ans: 16, options: [15, 16, 17] },
      { id: 4, a: 8, b: 8, ans: 16, options: [15, 16, 17] },
      { id: 5, a: 12, b: 5, ans: 17, options: [16, 17, 18] },
    ],
    []
  );
  const [horizIdx, setHorizIdx] = useState(0);
  const currentHoriz = horizontalItems[horizIdx];
  const [horizAnswer, setHorizAnswer] = useState<number | null>(null);
  const [horizFeedback, setHorizFeedback] = useState<'idle' | 'success' | 'incorrect'>('idle');

  // ==========================================
  // TAB 3: THREE-NUMBER ADDITION
  // ==========================================
  const threeNumItems: ThreeNumberItem[] = useMemo(
    () => [
      { id: 1, a: 6, b: 4, c: 3, sum: 13, tenPairA: 6, tenPairB: 4 },
      { id: 2, a: 8, b: 2, c: 4, sum: 14, tenPairA: 8, tenPairB: 2 },
      { id: 3, a: 7, b: 3, c: 5, sum: 15, tenPairA: 7, tenPairB: 3 },
      { id: 4, a: 5, b: 5, c: 6, sum: 16, tenPairA: 5, tenPairB: 5 },
      { id: 5, a: 9, b: 1, c: 8, sum: 18, tenPairA: 9, tenPairB: 1 },
    ],
    []
  );
  const [threeIdx, setThreeIdx] = useState(0);
  const currentThree = threeNumItems[threeIdx];
  const [threeStep, setThreeStep] = useState<1 | 2>(1); // 1 = combine pair to 10, 2 = add c to 10
  const [threeAnswer, setThreeAnswer] = useState<number | null>(null);

  // ==========================================
  // TAB 4: MISSING ADDEND
  // ==========================================
  const missingItems: MissingAddendItem[] = useMemo(
    () => [
      { id: 1, type: 'SECOND', known1: 8, total: 12, missing: 4, options: [3, 4, 5] },
      { id: 2, type: 'FIRST', known1: 5, total: 14, missing: 9, options: [8, 9, 10] },
      { id: 3, type: 'SECOND', known1: 10, total: 16, missing: 6, options: [5, 6, 7] },
      { id: 4, type: 'FIRST', known1: 7, total: 15, missing: 8, options: [7, 8, 9] },
      { id: 5, type: 'SECOND', known1: 12, total: 18, missing: 6, options: [5, 6, 7] },
    ],
    []
  );
  const [missingIdx, setMissingIdx] = useState(0);
  const currentMissing = missingItems[missingIdx];
  const [missingSelected, setMissingSelected] = useState<number | null>(null);
  const [missingFeedback, setMissingFeedback] = useState<'idle' | 'success' | 'incorrect'>('idle');

  // ==========================================
  // TAB 5: QUIZ EVALUATION (10 QUESTIONS)
  // ==========================================
  const quizList: QuizItem[] = useMemo(
    () => [
      {
        id: 1,
        questionNp: '८ + ४ = कति हुन्छ?',
        questionEn: 'What is 8 + 4?',
        options: [11, 12, 13],
        correct: 12,
        explanationNp: '८ + ४ = १२ (बाह्र) हुन्छ।',
        explanationEn: '8 + 4 = 12 (Twelve).',
      },
      {
        id: 2,
        questionNp: '६ + ४ + ३ जोड्दा कति हुन्छ?',
        questionEn: 'What is 6 + 4 + 3?',
        options: [12, 13, 14],
        correct: 13,
        explanationNp: '६ र ४ जोड्दा १० हुन्छ, १० + ३ = १३।',
        explanationEn: '6 + 4 = 10, 10 + 3 = 13.',
      },
      {
        id: 3,
        questionNp: '८ + [ ? ] = १२ मा खाली ठाउँमा के हुन्छ?',
        questionEn: 'In 8 + [ ? ] = 12, what is the missing addend?',
        options: [3, 4, 5],
        correct: 4,
        explanationNp: '८ मा ४ थप्दा १२ हुन्छ (८ + ४ = १२)।',
        explanationEn: 'Adding 4 to 8 yields 12 (8 + 4 = 12).',
      },
      {
        id: 4,
        questionNp: '७ + ५ = कति हुन्छ?',
        questionEn: 'What is 7 + 5?',
        options: [11, 12, 13],
        correct: 12,
        explanationNp: '७ + ५ = १२ हुन्छ।',
        explanationEn: '7 + 5 = 12.',
      },
      {
        id: 5,
        questionNp: '८ + २ + ५ जोड्दा कति आउँछ?',
        questionEn: 'What is 8 + 2 + 5?',
        options: [14, 15, 16],
        correct: 15,
        explanationNp: '८ + २ = १०, १० + ५ = १५।',
        explanationEn: '8 + 2 = 10, 10 + 5 = 15.',
      },
      {
        id: 6,
        questionNp: '[ ? ] + ५ = १४ मा खाली ठाउँमा कुन सङ्ख्या हुन्छ?',
        questionEn: 'In [ ? ] + 5 = 14, what is the missing number?',
        options: [8, 9, 10],
        correct: 9,
        explanationNp: '९ + ५ = १४ हुन्छ।',
        explanationEn: '9 + 5 = 14.',
      },
      {
        id: 7,
        questionNp: '१० + ६ को मान कति हुन्छ?',
        questionEn: 'What is 10 + 6?',
        options: [15, 16, 17],
        correct: 16,
        explanationNp: '१० + ६ = १६ (सोह्र) हुन्छ।',
        explanationEn: '10 + 6 = 16 (Sixteen).',
      },
      {
        id: 8,
        questionNp: '७ + ३ + ६ जोड्दा कति हुन्छ?',
        questionEn: 'What is 7 + 3 + 6?',
        options: [15, 16, 17],
        correct: 16,
        explanationNp: '७ + ३ = १०, १० + ६ = १६।',
        explanationEn: '7 + 3 = 10, 10 + 6 = 16.',
      },
      {
        id: 9,
        questionNp: '१० + [ ? ] = १६ मा खाली ठाउँ भर्नुहोस्।',
        questionEn: 'Fill in the blank: 10 + [ ? ] = 16.',
        options: [5, 6, 7],
        correct: 6,
        explanationNp: '१० मा ६ जोड्दा १६ हुन्छ।',
        explanationEn: '10 + 6 = 16.',
      },
      {
        id: 10,
        questionNp: '९ + १ + ८ को जोडफल कति हो?',
        questionEn: 'What is the sum of 9 + 1 + 8?',
        options: [17, 18, 19],
        correct: 18,
        explanationNp: '९ + १ = १०, १० + ८ = १८ (अठार)।',
        explanationEn: '9 + 1 = 10, 10 + 8 = 18 (Eighteen).',
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
    (type: 'click' | 'tile' | 'success' | 'fanfare' | 'boop') => {
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
        } else if (type === 'tile') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(380, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
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
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH10-03/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSpentSeconds: 150,
          metrics: {
            equationStudioScore: score,
            starsAwarded: Math.min(3, Math.ceil(score / 3.3)),
          },
        }),
      });
    } catch (err) {}
  }, []);

  // Picture to Equation Actions
  const handlePlaceNumberTile = (num: number) => {
    playSound('tile');
    if (slot1 === null) {
      setSlot1(num);
    } else if (slot2 === null) {
      setSlot2(num);
    } else if (slotSum === null) {
      setSlotSum(num);
    }
  };

  const handleVerifyPictureEquation = () => {
    if (slot1 === currentPic.count1 && slot2 === currentPic.count2 && slotSum === currentPic.sum) {
      playSound('success');
      setPicFeedback('success');
      speak(
        `स्याबास! समीकरण मिल्यो: ${NEP_NUMERALS[currentPic.count1]} + ${NEP_NUMERALS[currentPic.count2]} = ${NEP_NUMERALS[currentPic.sum]}!`,
        `Well done! Equation matched: ${currentPic.count1} + ${currentPic.count2} = ${currentPic.sum}!`
      );
    } else {
      playSound('boop');
      setPicFeedback('incorrect');
      speak('समीकरण अझै मिलेन, पुनः जाँच गर्नुहोस्।', 'Equation not matching, check again.');
    }
  };

  const handleResetPicSlots = () => {
    playSound('click');
    setSlot1(null);
    setSlot2(null);
    setSlotSum(null);
    setPicFeedback('idle');
  };

  const handleNextPicItem = () => {
    playSound('click');
    setPicIdx((prev) => (prev + 1) % pictureItems.length);
    handleResetPicSlots();
  };

  // Horizontal Actions
  const handleSelectHorizAnswer = (ans: number) => {
    playSound('click');
    setHorizAnswer(ans);
    if (ans === currentHoriz.ans) {
      playSound('success');
      setHorizFeedback('success');
      speak(
        `स्याबास! ${NEP_NUMERALS[currentHoriz.a]} + ${NEP_NUMERALS[currentHoriz.b]} = ${NEP_NUMERALS[currentHoriz.ans]} हुन्छ!`,
        `Correct! ${currentHoriz.a} + ${currentHoriz.b} = ${currentHoriz.ans}!`
      );
    } else {
      playSound('boop');
      setHorizFeedback('incorrect');
      speak('मिलेन, फेरि जोड्नुहोस्।', 'Incorrect sum, try again.');
    }
  };

  const handleNextHoriz = () => {
    playSound('click');
    setHorizIdx((prev) => (prev + 1) % horizontalItems.length);
    setHorizAnswer(null);
    setHorizFeedback('idle');
  };

  // Three-Number Actions
  const handleNextThree = () => {
    playSound('click');
    setThreeIdx((prev) => (prev + 1) % threeNumItems.length);
    setThreeStep(1);
    setThreeAnswer(null);
  };

  // Missing Addend Actions
  const handleSelectMissing = (opt: number) => {
    playSound('click');
    setMissingSelected(opt);
    if (opt === currentMissing.missing) {
      playSound('success');
      setMissingFeedback('success');
      speak('स्याबास! लुकेको सही सङ्ख्या पत्ता लगाउनुभयो!', 'Great job! Correct missing addend!');
    } else {
      playSound('boop');
      setMissingFeedback('incorrect');
      speak('मिलेन, फेरि प्रयास गर्नुहोस्।', 'Not correct, try again.');
    }
  };

  const handleNextMissing = () => {
    playSound('click');
    setMissingIdx((prev) => (prev + 1) % missingItems.length);
    setMissingSelected(null);
    setMissingFeedback('idle');
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
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold">
                Simulation 03
              </span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'np' ? 'जोड वाक्य निर्माण प्रयोगशाला' : 'Addition Equation Studio'}
            </h1>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('PICTURE_EQUATION');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'PICTURE_EQUATION' ? 'bg-violet-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {language === 'np' ? 'चित्रबाट समीकरण' : 'Picture Eq'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('HORIZONTAL');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'HORIZONTAL' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {language === 'np' ? 'तेर्सो जोड' : 'Horizontal'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('THREE_NUMBER');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'THREE_NUMBER' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {language === 'np' ? 'तीन सङ्ख्याको जोड' : '3-Number Add'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('MISSING_ADDEND');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'MISSING_ADDEND' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {language === 'np' ? 'खाली ठाउँ भर्ने' : 'Missing Addend'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('QUIZ');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              activeTab === 'QUIZ' ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
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
            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition"
          >
            {language === 'np' ? 'English' : 'नेपाली'}
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        {/* ========================================================================= */}
        {/* TAB 1: PICTURE TO EQUATION BUILDER */}
        {/* ========================================================================= */}
        {activeTab === 'PICTURE_EQUATION' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-violet-400 tracking-wider">
                    {language === 'np' ? 'कार्य १: चित्र हेरी समीकरण बनाउनुहोस्' : 'Activity 1: Picture to Equation'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {language === 'np'
                      ? `चित्रका ${currentPic.nameNp} गनेर जोड वाक्य पूरा गर्नुहोस्!`
                      : `Count the ${currentPic.nameEn} and complete the addition equation!`}
                  </h3>
                </div>

                <button
                  onClick={handleNextPicItem}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को चित्र' : 'Next Picture'}
                </button>
              </div>

              {/* Picture Display: Two Collections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/80 p-5 rounded-2xl border border-violet-500/30">
                {/* Group 1 */}
                <div className="flex flex-col items-center p-3 bg-violet-950/40 rounded-xl border border-violet-500/40">
                  <span className="text-xs font-bold text-violet-300 uppercase mb-2">
                    {language === 'np' ? `समूह १: ${NEP_NUMERALS[currentPic.count1]} ओटा` : `Group 1: ${currentPic.count1}`}
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-[200px]">
                    {Array.from({ length: currentPic.count1 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-lg bg-violet-500 text-white font-bold text-xs flex items-center justify-center shadow"
                      >
                        {NEP_NUMERALS[i + 1]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group 2 */}
                <div className="flex flex-col items-center p-3 bg-amber-950/40 rounded-xl border border-amber-500/40">
                  <span className="text-xs font-bold text-amber-300 uppercase mb-2">
                    {language === 'np' ? `समूह २: ${NEP_NUMERALS[currentPic.count2]} ओटा` : `Group 2: ${currentPic.count2}`}
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-[200px]">
                    {Array.from({ length: currentPic.count2 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow"
                      >
                        {NEP_NUMERALS[i + 1]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Equation Slots to fill */}
              <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-900/90 p-5 rounded-2xl border border-slate-700">
                {/* Slot 1 */}
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-violet-500 flex items-center justify-center text-2xl font-black text-violet-300 shadow">
                  {slot1 ? NEP_NUMERALS[slot1] : '?'}
                </div>

                <span className="text-3xl font-black text-white">+</span>

                {/* Slot 2 */}
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-amber-500 flex items-center justify-center text-2xl font-black text-amber-300 shadow">
                  {slot2 ? NEP_NUMERALS[slot2] : '?'}
                </div>

                <span className="text-3xl font-black text-white">=</span>

                {/* Slot Sum */}
                <div className="w-16 h-14 rounded-2xl bg-slate-800 border-2 border-emerald-500 flex items-center justify-center text-2xl font-black text-emerald-300 shadow">
                  {slotSum ? NEP_NUMERALS[slotSum] : '?'}
                </div>
              </div>

              {/* Number Tiles Rack (Click to place) */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase">
                  {language === 'np' ? 'समीकरणमा राख्न अङ्क छान्नुहोस्:' : 'Click number tiles to place in equation:'}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 17].map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePlaceNumberTile(num)}
                      className="w-11 h-11 rounded-xl bg-slate-700 hover:bg-violet-600 text-white font-black text-base flex items-center justify-center border border-slate-600 transition transform hover:scale-110 shadow"
                    >
                      {NEP_NUMERALS[num]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions & Feedback */}
              <div className="flex items-center justify-between border-t border-slate-700 pt-3">
                <button
                  onClick={handleResetPicSlots}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  {language === 'np' ? 'खाली गर्नुहोस्' : 'Reset Slots'}
                </button>

                <button
                  disabled={!slot1 || !slot2 || !slotSum}
                  onClick={handleVerifyPictureEquation}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs shadow-lg transition"
                >
                  {language === 'np' ? 'समीकरण जाँच गर्नुहोस्' : 'Check Equation'}
                </button>
              </div>

              {picFeedback === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>
                    {language === 'np'
                      ? `उत्कृष्ट! ${NEP_NUMERALS[currentPic.count1]} + ${NEP_NUMERALS[currentPic.count2]} = ${NEP_NUMERALS[currentPic.sum]} समीकरण पूर्ण रूपमा सही छ!`
                      : `Excellent! ${currentPic.count1} + ${currentPic.count2} = ${currentPic.sum} is completely correct!`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HORIZONTAL ADDITION */}
        {/* ========================================================================= */}
        {activeTab === 'HORIZONTAL' && (
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                    {language === 'np' ? 'कार्य २: तेर्सो जोड' : 'Activity 2: Horizontal Addition'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {language === 'np' ? 'सही जोडफल छान्नुहोस्!' : 'Choose the correct sum!'}
                  </h3>
                </div>

                <button
                  onClick={handleNextHoriz}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को प्रश्न' : 'Next'}
                </button>
              </div>

              {/* Big Equation Banner */}
              <div className="p-8 bg-slate-900/80 rounded-2xl border border-slate-700 flex items-center justify-center text-4xl md:text-5xl font-black text-white gap-4">
                <span>{NEP_NUMERALS[currentHoriz.a]}</span>
                <span className="text-amber-400">+</span>
                <span>{NEP_NUMERALS[currentHoriz.b]}</span>
                <span className="text-white">=</span>
                <span className="text-emerald-400 underline decoration-dashed">
                  {horizAnswer ? NEP_NUMERALS[horizAnswer] : '?'}
                </span>
              </div>

              {/* 3 Options */}
              <div className="grid grid-cols-3 gap-3">
                {currentHoriz.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectHorizAnswer(opt)}
                    className={`p-5 rounded-2xl text-2xl font-black transition border flex flex-col items-center justify-center ${
                      horizAnswer === opt
                        ? opt === currentHoriz.ans
                          ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-lg'
                          : 'bg-rose-600 text-white border-rose-400'
                        : 'bg-slate-700/80 hover:bg-slate-700 text-white border-slate-600'
                    }`}
                  >
                    <span>{NEP_NUMERALS[opt]}</span>
                    <span className="text-xs opacity-75 font-normal">({opt})</span>
                  </button>
                ))}
              </div>

              {horizFeedback === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>
                      {language === 'np'
                        ? `स्याबास! ${NEP_NUMERALS[currentHoriz.a]} + ${NEP_NUMERALS[currentHoriz.b]} = ${NEP_NUMERALS[currentHoriz.ans]}!`
                        : `Well done! ${currentHoriz.a} + ${currentHoriz.b} = ${currentHoriz.ans}!`}
                    </span>
                  </div>
                  <button
                    onClick={handleNextHoriz}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    {language === 'np' ? 'अगाडि बढ्नुहोस्' : 'Continue'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: THREE-NUMBER ADDITION */}
        {/* ========================================================================= */}
        {activeTab === 'THREE_NUMBER' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                    {language === 'np' ? 'कार्य ३: तीन सङ्ख्याको जोड (दश बनाएर)' : 'Activity 3: Three-Number Addition'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {language === 'np'
                      ? 'पहिले १० बनाउने दुई सङ्ख्या जोड्नुहोस्, अनि तेस्रो सङ्ख्या थप्नुहोस्!'
                      : 'Make 10 first with a pair, then add the third number!'}
                  </h3>
                </div>

                <button
                  onClick={handleNextThree}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को समस्या' : 'Next Problem'}
                </button>
              </div>

              {/* Three-Group Banner */}
              <div className="p-6 bg-slate-900/90 rounded-2xl border border-amber-500/30 flex flex-col items-center gap-4">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  {language === 'np' ? 'समीकरण:' : 'Original Equation:'}
                </span>

                <div className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/50">
                    {NEP_NUMERALS[currentThree.a]}
                  </span>
                  <span>+</span>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/50">
                    {NEP_NUMERALS[currentThree.b]}
                  </span>
                  <span>+</span>
                  <span className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded-xl border border-sky-500/50">
                    {NEP_NUMERALS[currentThree.c]}
                  </span>
                  <span>= ?</span>
                </div>

                {/* Step 1 -> Pair makes 10 */}
                <div className="w-full bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
                  <span className="text-xs text-slate-400 font-bold mb-1">
                    {language === 'np'
                      ? `पहिले ${NEP_NUMERALS[currentThree.tenPairA]} र ${NEP_NUMERALS[currentThree.tenPairB]} जोड्दा १० बन्छ:`
                      : `First ${currentThree.tenPairA} + ${currentThree.tenPairB} makes 10:`}
                  </span>
                  <span className="text-xl font-black text-amber-400">
                    ({NEP_NUMERALS[currentThree.tenPairA]} + {NEP_NUMERALS[currentThree.tenPairB]}) + {NEP_NUMERALS[currentThree.c]} = १० + {NEP_NUMERALS[currentThree.c]}
                  </span>
                </div>

                {/* Step 2 -> 10 + C = Final */}
                <div className="text-2xl font-black text-emerald-400">
                  १० + {NEP_NUMERALS[currentThree.c]} = {NEP_NUMERALS[currentThree.sum]}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MISSING ADDEND */}
        {/* ========================================================================= */}
        {activeTab === 'MISSING_ADDEND' && (
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-cyan-400 tracking-wider">
                    {language === 'np' ? 'कार्य ४: खाली ठाउँको सङ्ख्या पत्ता लगाऔँ' : 'Activity 4: Find Missing Addend'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {language === 'np' ? 'खाली कोष्ठमा कुन सङ्ख्या हुन्छ?' : 'What number belongs in the box?'}
                  </h3>
                </div>

                <button
                  onClick={handleNextMissing}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को प्रश्न' : 'Next'}
                </button>
              </div>

              {/* Equation with Blank */}
              <div className="p-8 bg-slate-900/90 rounded-2xl border border-slate-700 flex items-center justify-center text-4xl md:text-5xl font-black text-white gap-4">
                {currentMissing.type === 'SECOND' ? (
                  <>
                    <span>{NEP_NUMERALS[currentMissing.known1]}</span>
                    <span className="text-amber-400">+</span>
                    <span className="px-4 py-1 rounded-2xl bg-slate-800 border-2 border-cyan-400 border-dashed text-cyan-300">
                      {missingSelected ? NEP_NUMERALS[missingSelected] : '?'}
                    </span>
                    <span>=</span>
                    <span className="text-emerald-400">{NEP_NUMERALS[currentMissing.total]}</span>
                  </>
                ) : (
                  <>
                    <span className="px-4 py-1 rounded-2xl bg-slate-800 border-2 border-cyan-400 border-dashed text-cyan-300">
                      {missingSelected ? NEP_NUMERALS[missingSelected] : '?'}
                    </span>
                    <span className="text-amber-400">+</span>
                    <span>{NEP_NUMERALS[currentMissing.known1]}</span>
                    <span>=</span>
                    <span className="text-emerald-400">{NEP_NUMERALS[currentMissing.total]}</span>
                  </>
                )}
              </div>

              {/* Option Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {currentMissing.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectMissing(opt)}
                    className={`p-5 rounded-2xl text-2xl font-black transition border flex flex-col items-center justify-center ${
                      missingSelected === opt
                        ? opt === currentMissing.missing
                          ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-lg'
                          : 'bg-rose-600 text-white border-rose-400'
                        : 'bg-slate-700/80 hover:bg-slate-700 text-white border-slate-600'
                    }`}
                  >
                    <span>{NEP_NUMERALS[opt]}</span>
                    <span className="text-xs opacity-75 font-normal">({opt})</span>
                  </button>
                ))}
              </div>

              {missingFeedback === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>
                      {language === 'np'
                        ? `स्याबास! छुटेको सङ्ख्या ${NEP_NUMERALS[currentMissing.missing]} हो!`
                        : `Well done! The missing number is ${currentMissing.missing}!`}
                    </span>
                  </div>
                  <button
                    onClick={handleNextMissing}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    {language === 'np' ? 'अगाडि बढ्नुहोस्' : 'Continue'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: QUIZ EVALUATION (10 QUESTIONS) */}
        {/* ========================================================================= */}
        {activeTab === 'QUIZ' && (
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full justify-center">
            {!quizCompleted ? (
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700 pb-3">
                  <span className="font-bold text-violet-400">
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
                    <p className="font-bold text-violet-400 mb-1">
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
                    className="w-full py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/95 border-2 border-violet-500/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Award className="w-10 h-10 text-violet-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">
                    {language === 'np' ? 'बधाई छ! परीक्षा सम्पन्न भयो!' : 'Congratulations! Assessment Complete!'}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    {language === 'np'
                      ? 'तपाईंले जोड वाक्य निर्माण, तीन सङ्ख्याको जोड र खाली ठाउँ भर्नमा दक्षता हासिल गर्नुभयो।'
                      : 'You have mastered constructing equations, three-number additions, and missing addends.'}
                  </p>
                </div>

                <div className="text-4xl font-black text-violet-400">
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
                      setActiveTab('PICTURE_EQUATION');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'समीकरण प्रयोगशालामा फर्कनुहोस्' : 'Back to Studio'}
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

