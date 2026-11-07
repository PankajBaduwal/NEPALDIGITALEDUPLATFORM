/**
 * NumberOrderingChallengeWorld.tsx
 * Simulation 05: Number Ordering and Challenge World (सङ्ख्या मिलाउने चुनौती संसार)
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
  Store,
  Compass,
  TrainTrack,
  Mountain,
  Award,
  HelpCircle,
} from 'lucide-react';

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

type StationId = 'SHOP' | 'COMPARE' | 'TRAIN' | 'MASTER';

interface MasterQuestion {
  id: number;
  station: string;
  questionNp: string;
  questionEn: string;
  options: string[];
  correct: string;
  explanationNp: string;
  explanationEn: string;
}

export const NumberOrderingChallengeWorld: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Village Station: 'SHOP', 'COMPARE', 'TRAIN', 'MASTER'
  const [activeStation, setActiveStation] = useState<StationId>('SHOP');

  // ==========================================
  // STATION 1: NUMBER SHOP (Matching Names)
  // ==========================================
  const [shopTargetNum, setShopTargetNum] = useState<number>(14);
  const [shopAnswered, setShopAnswered] = useState<boolean>(false);
  const [shopFeedback, setShopFeedback] = useState<'idle' | 'success' | 'incorrect'>('idle');

  // ==========================================
  // STATION 2: SMALLEST & LARGEST COMPARISON
  // ==========================================
  const [compareMode, setCompareMode] = useState<'SMALLEST' | 'LARGEST'>('SMALLEST');
  const [compareNumbers, setCompareNumbers] = useState<number[]>([12, 17, 14, 19]);
  const [compareSelected, setCompareSelected] = useState<number | null>(null);
  const [compareFeedback, setCompareFeedback] = useState<'idle' | 'success' | 'incorrect'>('idle');

  // ==========================================
  // STATION 3: TRAIN ORDERING (Ascending/Descending)
  // ==========================================
  const [trainOrderMode, setTrainOrderMode] = useState<'ASCENDING' | 'DESCENDING'>('ASCENDING');
  const [trainPool, setTrainPool] = useState<number[]>([18, 12, 15, 11]);
  const [trainSlots, setTrainSlots] = useState<(number | null)[]>([null, null, null, null]);
  const [trainFeedback, setTrainFeedback] = useState<'idle' | 'success' | 'incorrect'>('idle');

  // ==========================================
  // STATION 4: MASTER VILLAGE CHALLENGE (QUIZ)
  // ==========================================
  const masterQuestions: MasterQuestion[] = useMemo(
    () => [
      {
        id: 1,
        station: 'पसल (Number Shop)',
        questionNp: 'सङ्ख्या १७ को नेपाली नाम के हो?',
        questionEn: 'What is the Nepali name for number 17?',
        options: ['सोह्र', 'सत्र', 'अठार'],
        correct: 'सत्र',
        explanationNp: '१७ लाई "सत्र" (Seventeen) भनिन्छ।',
        explanationEn: '17 is सत्र (Seventeen).',
      },
      {
        id: 2,
        station: 'तुलना (Compare)',
        questionNp: '११, १५, १३, १८ मध्ये सबैभन्दा सानो सङ्ख्या कुन हो?',
        questionEn: 'Which is the smallest number among 11, 15, 13, 18?',
        options: ['११', '१३', '१५'],
        correct: '११',
        explanationNp: '११ सबैभन्दा सानो सङ्ख्या हो।',
        explanationEn: '11 is the smallest number.',
      },
      {
        id: 3,
        station: 'तुलना (Compare)',
        questionNp: '१४, २०, १६, १२ मध्ये सबैभन्दा ठूलो सङ्ख्या कुन हो?',
        questionEn: 'Which is the largest number among 14, 20, 16, 12?',
        options: ['१६', '२०', '१४'],
        correct: '२०',
        explanationNp: '२० सबैभन्दा ठूलो सङ्ख्या हो।',
        explanationEn: '20 is the largest number.',
      },
      {
        id: 4,
        station: 'रेल (Train Order)',
        questionNp: '११, १२, १३, १४ कुन क्रममा छन्?',
        questionEn: 'In what order are 11, 12, 13, 14?',
        options: ['बढ्दो क्रम (Ascending)', 'घट्दो क्रम (Descending)', 'उल्टो क्रम'],
        correct: 'बढ्दो क्रम (Ascending)',
        explanationNp: 'सानोबाट ठूलोतिर जाँदा बढ्दो क्रम (Ascending order) हुन्छ।',
        explanationEn: 'Smallest to largest is Ascending order.',
      },
      {
        id: 5,
        station: 'पसल (Number Shop)',
        questionNp: '"उन्नाइस" कुन अङ्कको नाम हो?',
        questionEn: 'Which numeral is "Unnais" (Nineteen)?',
        options: ['१८', '१९', '२०'],
        correct: '१९',
        explanationNp: '१९ लाई "उन्नाइस" भनिन्छ।',
        explanationEn: '19 is Unnais (Nineteen).',
      },
      {
        id: 6,
        station: 'रेल (Train Order)',
        questionNp: '२०, १९, १८, १७ कुन क्रममा छन्?',
        questionEn: 'In what order are 20, 19, 18, 17?',
        options: ['घट्दो क्रम (Descending)', 'बढ्दो क्रम (Ascending)', 'कुनै होइन'],
        correct: 'घट्दो क्रम (Descending)',
        explanationNp: 'ठूलोबाट सानोतिर जाँदा घट्दो क्रम (Descending order) हुन्छ।',
        explanationEn: 'Largest to smallest is Descending order.',
      },
      {
        id: 7,
        station: 'पसल (Number Shop)',
        questionNp: 'सङ्ख्या १२ को नेपाली नाम के हो?',
        questionEn: 'What is the Nepali name for number 12?',
        options: ['एघार', 'बाह्र', 'तेह्र'],
        correct: 'बाह्र',
        explanationNp: '१२ लाई "बाह्र" भनिन्छ।',
        explanationEn: '12 is Bahra (Twelve).',
      },
      {
        id: 8,
        station: 'तुलना (Compare)',
        questionNp: '१५ र १९ मा कुन ठूलो हो?',
        questionEn: 'Which is greater: 15 or 19?',
        options: ['१५', '१९', 'दुवै बराबर'],
        correct: '१९',
        explanationNp: '१९ सङ्ख्या १५ भन्दा ठूलो छ।',
        explanationEn: '19 is greater than 15.',
      },
      {
        id: 9,
        station: 'पसल (Number Shop)',
        questionNp: 'सङ्ख्या २० को नेपाली नाम के हो?',
        questionEn: 'What is the Nepali name for 20?',
        options: ['उन्नाइस', 'बीस', 'दश'],
        correct: 'बीस',
        explanationNp: '२० लाई "बीस" भनिन्छ।',
        explanationEn: '20 is Beas (Twenty).',
      },
      {
        id: 10,
        station: 'चुनौती (Master Challenge)',
        questionNp: '११ देखि २० सम्ममा जम्मा कति वटा सङ्ख्याहरू हुन्छन्?',
        questionEn: 'How many numbers are there in total from 11 to 20?',
        options: ['९', '१०', '११'],
        correct: '१०',
        explanationNp: '११ देखि २० सम्म जम्मा १० वटा सङ्ख्याहरू हुन्छन्।',
        explanationEn: 'From 11 to 20 there are exactly 10 numbers.',
      },
    ],
    []
  );

  const [masterIdx, setMasterIdx] = useState(0);
  const [masterScore, setMasterScore] = useState(0);
  const [masterAnswered, setMasterAnswered] = useState(false);
  const [masterSelected, setMasterSelected] = useState<string | null>(null);
  const [masterCompleted, setMasterCompleted] = useState(false);

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
          osc.frequency.setValueAtTime(520, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'place') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(420, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
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
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH9-05/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSpentSeconds: 120,
          metrics: {
            challengeWorldScore: score,
            starsAwarded: Math.min(3, Math.ceil(score / 3.3)),
          },
        }),
      });
    } catch (err) {}
  }, []);

  // Station 1: Shop actions
  const handleShopSelectName = (name: string) => {
    playSound('click');
    setShopAnswered(true);
    if (name === NEP_NAMES[shopTargetNum]) {
      playSound('success');
      setShopFeedback('success');
      speak(`स्याबास! ${NEP_NUMERALS[shopTargetNum]} लाई ${name} भनिन्छ।`, `Correct! ${shopTargetNum} is ${name}.`);
    } else {
      playSound('boop');
      setShopFeedback('incorrect');
      speak('मिलेन, फेरि प्रयास गर्नुहोस्।', 'Not matching, try again.');
    }
  };

  const handleNextShopTarget = () => {
    playSound('click');
    const available = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const nextTarget = available[(available.indexOf(shopTargetNum) + 1) % available.length];
    setShopTargetNum(nextTarget);
    setShopAnswered(false);
    setShopFeedback('idle');
  };

  // Station 2: Compare actions
  const handleComparePick = (num: number) => {
    playSound('click');
    setCompareSelected(num);
    const correctTarget =
      compareMode === 'SMALLEST' ? Math.min(...compareNumbers) : Math.max(...compareNumbers);

    if (num === correctTarget) {
      playSound('success');
      setCompareFeedback('success');
      speak(
        `स्याबास! ${NEP_NUMERALS[num]} सबैभन्दा ${compareMode === 'SMALLEST' ? 'सानो' : 'ठूलो'} सङ्ख्या हो!`,
        `Well done! ${num} is the ${compareMode === 'SMALLEST' ? 'smallest' : 'largest'} number!`
      );
    } else {
      playSound('boop');
      setCompareFeedback('incorrect');
      speak('मिलेन, फेरि ध्यान दिएर हेर्नुहोस्।', 'Incorrect, check the values again.');
    }
  };

  const handleNextCompareSet = () => {
    playSound('click');
    const sets = [
      [11, 14, 16, 18],
      [13, 19, 12, 17],
      [15, 20, 11, 14],
      [18, 13, 16, 12],
    ];
    const randomSet = sets[Math.floor(Math.random() * sets.length)];
    setCompareNumbers(randomSet);
    setCompareSelected(null);
    setCompareFeedback('idle');
  };

  // Station 3: Train ordering
  const handleTrainPlaceNumber = (num: number) => {
    playSound('place');
    const emptyIdx = trainSlots.indexOf(null);
    if (emptyIdx !== -1) {
      const newSlots = [...trainSlots];
      newSlots[emptyIdx] = num;
      setTrainSlots(newSlots);
      setTrainPool((prev) => prev.filter((n) => n !== num));
    }
  };

  const handleTrainRemoveSlot = (slotIdx: number) => {
    const val = trainSlots[slotIdx];
    if (val !== null) {
      playSound('click');
      const newSlots = [...trainSlots];
      newSlots[slotIdx] = null;
      setTrainSlots(newSlots);
      setTrainPool((prev) => [...prev, val]);
      setTrainFeedback('idle');
    }
  };

  const handleTrainVerify = () => {
    if (trainSlots.includes(null)) {
      playSound('boop');
      speak('सबै डिब्बामा सङ्ख्या राख्नुहोस्।', 'Fill all carriages first.');
      return;
    }
    const currentValues = trainSlots as number[];
    let isCorrect = true;
    for (let i = 0; i < currentValues.length - 1; i++) {
      if (trainOrderMode === 'ASCENDING' && currentValues[i] > currentValues[i + 1]) {
        isCorrect = false;
        break;
      }
      if (trainOrderMode === 'DESCENDING' && currentValues[i] < currentValues[i + 1]) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      playSound('fanfare');
      setTrainFeedback('success');
      speak(
        `स्याबास! रेलगाडीको क्रम मिलेको छ!`,
        `Excellent! The train carriages are perfectly ordered!`
      );
    } else {
      playSound('boop');
      setTrainFeedback('incorrect');
      speak('क्रम मिलेन, फेरि मिलाउनुहोस्।', 'Incorrect order, rearrange the numbers.');
    }
  };

  const handleTrainReset = () => {
    playSound('click');
    setTrainPool([18, 12, 15, 11]);
    setTrainSlots([null, null, null, null]);
    setTrainFeedback('idle');
  };

  // Station 4: Master Challenge actions
  const handleMasterAnswer = (opt: string) => {
    if (masterAnswered) return;
    setMasterSelected(opt);
    setMasterAnswered(true);
    const q = masterQuestions[masterIdx];
    if (opt === q.correct) {
      playSound('success');
      setMasterScore((prev) => prev + 1);
      speak('स्याबास! सही उत्तर।', 'Well done! Correct answer.');
    } else {
      playSound('boop');
      speak('पुनः प्रयास गर्नुहोस्। सही उत्तर हेर्नुहोस्।', 'Check the explanation.');
    }
  };

  const handleMasterNext = () => {
    playSound('click');
    if (masterIdx + 1 < masterQuestions.length) {
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

  // Generate 3 shop choices
  const shopOptions = useMemo(() => {
    const correctName = NEP_NAMES[shopTargetNum];
    const allNames = Object.values(NEP_NAMES).filter((n) => n !== correctName);
    const shuffled = allNames.sort(() => 0.5 - Math.random()).slice(0, 2);
    return [correctName, ...shuffled].sort(() => 0.5 - Math.random());
  }, [shopTargetNum]);

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
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold">
                Simulation 05
              </span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'np' ? 'सङ्ख्या मिलाउने चुनौती संसार (११ देखि २०)' : 'Number Ordering Challenge World'}
            </h1>
          </div>
        </div>

        {/* Village Station Selector */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => {
              playSound('click');
              setActiveStation('SHOP');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeStation === 'SHOP' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            {language === 'np' ? '१. नाम पसल' : '1. Name Shop'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveStation('COMPARE');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeStation === 'COMPARE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            {language === 'np' ? '२. सानो/ठूलो' : '2. Compare'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveStation('TRAIN');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeStation === 'TRAIN' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrainTrack className="w-3.5 h-3.5" />
            {language === 'np' ? '३. क्रम रेल' : '3. Order Train'}
          </button>
          <button
            onClick={() => {
              playSound('click');
              setActiveStation('MASTER');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeStation === 'MASTER' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {language === 'np' ? '४. महा-चुनौती' : '4. Master Quiz'}
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

      {/* Main Village Screen */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        {/* ========================================================================= */}
        {/* STATION 1: NUMBER NAME SHOP (अक्षरमा नाम जोडा मिलाउने) */}
        {/* ========================================================================= */}
        {activeStation === 'SHOP' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              {/* Station Banner */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">
                    {language === 'np' ? 'केन्द्र १: सङ्ख्या नाम पसल' : 'Station 1: Number Name Shop'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {language === 'np' ? 'सङ्ख्याको सही नेपाली नाम पत्ता लगाउनुहोस्!' : 'Find the correct word name!'}
                  </h3>
                </div>

                <button
                  onClick={handleNextShopTarget}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                >
                  {language === 'np' ? 'अर्को सङ्ख्या' : 'Next Number'}
                </button>
              </div>

              {/* Big Shop Numeral Display */}
              <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900 to-indigo-950/40 rounded-3xl border-2 border-indigo-500/40 shadow-inner">
                <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-2">
                  {language === 'np' ? 'यो सङ्ख्याको नाम के हो?' : 'What is the name of this number?'}
                </span>
                <span className="text-7xl font-black text-amber-400 tracking-tight">
                  {NEP_NUMERALS[shopTargetNum]}
                </span>
                <span className="text-sm font-semibold text-slate-400 mt-1">({shopTargetNum})</span>
              </div>

              {/* Word Name Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {shopOptions.map((name) => {
                  const isCorrect = name === NEP_NAMES[shopTargetNum];
                  let btnStyle = 'bg-slate-700/80 hover:bg-indigo-600/50 text-white';

                  if (shopAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-500/30';
                    } else {
                      btnStyle = 'bg-slate-800 text-slate-500 opacity-40';
                    }
                  }

                  return (
                    <button
                      key={name}
                      disabled={shopAnswered}
                      onClick={() => handleShopSelectName(name)}
                      className={`p-5 rounded-2xl text-xl font-bold transition flex items-center justify-center border border-slate-600 ${btnStyle}`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Continue */}
              {shopFeedback === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span>
                      {language === 'np'
                        ? `उत्कृष्ट! ${NEP_NUMERALS[shopTargetNum]} लाई "${NEP_NAMES[shopTargetNum]}" भनिन्छ।`
                        : `Excellent! ${shopTargetNum} is "${NEP_NAMES[shopTargetNum]}".`}
                    </span>
                  </div>
                  <button
                    onClick={handleNextShopTarget}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    {language === 'np' ? 'अगाडि बढ्नुहोस्' : 'Continue'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATION 2: SMALLEST & LARGEST COMPARISON (सानो र ठूलो) */}
        {/* ========================================================================= */}
        {activeStation === 'COMPARE' && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              {/* Station Banner */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                    {language === 'np' ? 'केन्द्र २: तुलना हिमाल' : 'Station 2: Comparison Mountain'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {compareMode === 'SMALLEST'
                      ? language === 'np'
                        ? 'सबैभन्दा सानो सङ्ख्या छान्नुहोस्!'
                        : 'Choose the smallest number!'
                      : language === 'np'
                      ? 'सबैभन्दा ठूलो सङ्ख्या छान्नुहोस्!'
                      : 'Choose the largest number!'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playSound('click');
                      setCompareMode((m) => (m === 'SMALLEST' ? 'LARGEST' : 'SMALLEST'));
                      setCompareSelected(null);
                      setCompareFeedback('idle');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
                  >
                    {compareMode === 'SMALLEST'
                      ? language === 'np'
                        ? 'ठूलो खोज्ने बनाउनुहोस्'
                        : 'Switch to Largest'
                      : language === 'np'
                      ? 'सानो खोज्ने बनाउनुहोस्'
                      : 'Switch to Smallest'}
                  </button>
                  <button
                    onClick={handleNextCompareSet}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    {language === 'np' ? 'नयाँ सङ्ख्याहरू' : 'New Set'}
                  </button>
                </div>
              </div>

              {/* 4 Cards to Pick */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                {compareNumbers.map((num) => {
                  const isSelected = compareSelected === num;
                  const isTarget =
                    compareMode === 'SMALLEST'
                      ? num === Math.min(...compareNumbers)
                      : num === Math.max(...compareNumbers);

                  let cardStyle = 'bg-slate-700/80 hover:bg-slate-700 text-white hover:scale-105';

                  if (compareSelected !== null) {
                    if (isTarget) {
                      cardStyle = 'bg-emerald-600 text-white scale-105 shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-300';
                    } else if (isSelected) {
                      cardStyle = 'bg-rose-600 text-white';
                    } else {
                      cardStyle = 'bg-slate-800 text-slate-500 opacity-40';
                    }
                  }

                  return (
                    <button
                      key={num}
                      disabled={compareSelected !== null}
                      onClick={() => handleComparePick(num)}
                      className={`h-36 rounded-3xl flex flex-col items-center justify-center border border-slate-600 transition-all ${cardStyle}`}
                    >
                      <span className="text-4xl font-black">{NEP_NUMERALS[num]}</span>
                      <span className="text-xs opacity-75 mt-1">({num})</span>
                      <span className="text-xs font-semibold mt-1">
                        {language === 'np' ? NEP_NAMES[num] : EN_NAMES[num]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Continue */}
              {compareFeedback === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>
                      {language === 'np'
                        ? `स्याबास! ${NEP_NUMERALS[compareSelected!]} सबैभन्दा ${
                            compareMode === 'SMALLEST' ? 'सानो' : 'ठूलो'
                          } सङ्ख्या हो।`
                        : `Well done! ${compareSelected} is the ${
                            compareMode === 'SMALLEST' ? 'smallest' : 'largest'
                          } number.`}
                    </span>
                  </div>
                  <button
                    onClick={handleNextCompareSet}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    {language === 'np' ? 'अर्को चुनौती' : 'Next Challenge'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATION 3: TRAIN ORDERING (बढ्दो र घट्दो क्रमको रेल) */}
        {/* ========================================================================= */}
        {activeStation === 'TRAIN' && (
          <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full justify-center">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl flex flex-col gap-6">
              {/* Banner */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                    {language === 'np' ? 'केन्द्र ३: क्रम मिलाउने रेल' : 'Station 3: Number Train'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                    {trainOrderMode === 'ASCENDING'
                      ? language === 'np'
                        ? 'सङ्ख्याहरूलाई बढ्दो क्रममा (सानोदेखि ठूलो) मिलाउनुहोस्!'
                        : 'Order numbers in Ascending order (Smallest to Largest)!'
                      : language === 'np'
                      ? 'सङ्ख्याहरूलाई घट्दो क्रममा (ठूलोदेखि सानो) मिलाउनुहोस्!'
                      : 'Order numbers in Descending order (Largest to Smallest)!'}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setTrainOrderMode((m) => (m === 'ASCENDING' ? 'DESCENDING' : 'ASCENDING'));
                    handleTrainReset();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
                >
                  {trainOrderMode === 'ASCENDING'
                    ? language === 'np'
                      ? 'घट्दो क्रम बनाउनुहोस्'
                      : 'Switch to Descending'
                    : language === 'np'
                    ? 'बढ्दो क्रम बनाउनुहोस्'
                    : 'Switch to Ascending'}
                </button>
              </div>

              {/* Train Carriages (Slots) */}
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-amber-500/30 flex flex-col items-center gap-4">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  {trainOrderMode === 'ASCENDING'
                    ? language === 'np'
                      ? 'सानो → → → ठूलो'
                      : 'Smallest → → → Largest'
                    : language === 'np'
                    ? 'ठूलो → → → सानो'
                    : 'Largest → → → Smallest'}
                </span>

                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                  {trainSlots.map((slotNum, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTrainRemoveSlot(idx)}
                      className={`w-20 h-24 md:w-24 md:h-28 rounded-2xl border-2 flex flex-col items-center justify-center font-black transition-all ${
                        slotNum !== null
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg scale-105'
                          : 'bg-slate-800/80 border-dashed border-slate-600 text-slate-500 hover:border-amber-400'
                      }`}
                    >
                      <span className="text-xs text-slate-400 font-medium block mb-1">
                        {language === 'np' ? `डिब्बा ${NEP_NUMERALS[idx + 1]}` : `Car ${idx + 1}`}
                      </span>
                      {slotNum !== null ? (
                        <>
                          <span className="text-3xl font-black">{NEP_NUMERALS[slotNum]}</span>
                          <span className="text-[10px] opacity-75">{slotNum}</span>
                        </>
                      ) : (
                        <span className="text-xs italic text-slate-500">
                          {language === 'np' ? 'खाली' : 'Empty'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Pool of Numbers */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase">
                  {language === 'np' ? 'रेलमा राख्न सङ्ख्या छान्नुहोस्:' : 'Pick a number to load into the train:'}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {trainPool.map((num) => (
                    <button
                      key={num}
                      onClick={() => handleTrainPlaceNumber(num)}
                      className="w-14 h-14 rounded-2xl bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-white font-black text-xl flex flex-col items-center justify-center transition-all transform hover:scale-110 shadow-md border border-slate-600"
                    >
                      <span>{NEP_NUMERALS[num]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons & Feedback */}
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-700">
                <button
                  onClick={handleTrainReset}
                  className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs transition"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  {language === 'np' ? 'पुनः मिलाउनुहोस्' : 'Reset'}
                </button>

                <button
                  onClick={handleTrainVerify}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition shadow-lg shadow-emerald-500/20"
                >
                  {language === 'np' ? 'जाँच गर्नुहोस्' : 'Check Order'}
                </button>
              </div>

              {trainFeedback === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>
                    {language === 'np'
                      ? 'स्याबास! सबै सङ्ख्याहरू ठीक क्रममा मिलेका छन्!'
                      : 'Excellent! All numbers are properly ordered!'}
                  </span>
                </div>
              )}
              {trainFeedback === 'incorrect' && (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-200 text-sm font-bold flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-rose-400" />
                  <span>
                    {language === 'np'
                      ? 'क्रम अझै मिलेन। सङ्ख्याको तुलना गरेर फेरि मिलाउनुहोस्।'
                      : 'Not in order yet. Compare carefully and try again.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATION 4: MASTER VILLAGE CHALLENGE (१० प्रश्नहरूको महा-परीक्षा) */}
        {/* ========================================================================= */}
        {activeStation === 'MASTER' && (
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full justify-center">
            {!masterCompleted ? (
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700 pb-3">
                  <span className="font-bold text-rose-400">
                    {language === 'np'
                      ? `प्रश्न ${NEP_NUMERALS[masterIdx + 1]} / ${NEP_NUMERALS[masterQuestions.length]}`
                      : `Question ${masterIdx + 1} of ${masterQuestions.length}`}
                  </span>
                  <span>
                    {language === 'np' ? `अङ्क: ${NEP_NUMERALS[masterScore]}` : `Score: ${masterScore}`}
                  </span>
                </div>

                {/* Station Tag */}
                <span className="text-xs text-slate-400 font-semibold">
                  {masterQuestions[masterIdx].station}
                </span>

                {/* Question */}
                <h3 className="text-xl md:text-2xl font-black text-white">
                  {language === 'np'
                    ? masterQuestions[masterIdx].questionNp
                    : masterQuestions[masterIdx].questionEn}
                </h3>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {masterQuestions[masterIdx].options.map((opt) => {
                    const isSelected = masterSelected === opt;
                    const isCorrectOpt = opt === masterQuestions[masterIdx].correct;
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
                        className={`p-4 rounded-2xl text-lg font-bold transition flex items-center justify-center border border-slate-600 ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {masterAnswered && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300">
                    <p className="font-bold text-amber-400 mb-1">
                      {language === 'np' ? 'व्याख्या:' : 'Explanation:'}
                    </p>
                    <p>
                      {language === 'np'
                        ? masterQuestions[masterIdx].explanationNp
                        : masterQuestions[masterIdx].explanationEn}
                    </p>
                  </div>
                )}

                {/* Next */}
                {masterAnswered && (
                  <button
                    onClick={handleMasterNext}
                    className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Finish Card */
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
                      ? 'तपाईंले कक्षा १ अध्याय ९ सम्बन्धी सम्पूर्ण ज्ञान प्रमाणित गर्नुभयो।'
                      : 'You have mastered numbers 11 to 20, ordering, comparison, and number names.'}
                  </p>
                </div>

                <div className="text-4xl font-black text-rose-400">
                  {NEP_NUMERALS[masterScore]} / {NEP_NUMERALS[masterQuestions.length]}
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
                      setActiveStation('SHOP');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
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

