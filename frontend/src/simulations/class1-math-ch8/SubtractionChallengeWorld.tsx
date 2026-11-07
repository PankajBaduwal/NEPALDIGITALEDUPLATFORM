/**
 * SubtractionChallengeWorld.tsx
 * Simulation 05: Subtraction Challenge World (घटाउ चुनौती संसार)
 * Class 1 Mathematics - Chapter 8: Subtraction up to 10 (१० सम्मका सङ्ख्याहरूको घटाउ)
 * Nepal Digital Education Platform
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Home,
  Flower2,
  Compass,
  Minus,
  Equal,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];

interface VillageStation {
  id: string;
  nameNp: string;
  nameEn: string;
  icon: string;
  problemType: 'REMOVAL' | 'BIRDS' | 'VERTICAL' | 'ZERO' | 'MISSING';
  itemEmoji: string;
  total: number;
  takeAway: number;
  questionNp: string;
  questionEn: string;
  options: number[];
  correctAnswer: number;
  explanationNp: string;
  explanationEn: string;
}

const VILLAGE_STATIONS: VillageStation[] = [
  {
    id: 'st-fruit-shop',
    nameNp: 'फलफूल पसल',
    nameEn: 'Fruit Shop',
    icon: '🍎',
    problemType: 'REMOVAL',
    itemEmoji: '🍎',
    total: 9,
    takeAway: 4,
    questionNp: 'पसलमा ९ वटा फलफूल छन्। ४ वटा बिक्री भएपछि कति बाँकी रहन्छन्?',
    questionEn: 'There are 9 fruits in the shop. 4 are sold. How many remain?',
    options: [4, 5, 6],
    correctAnswer: 5,
    explanationNp: '९ − ४ = ५ हुन्छ।',
    explanationEn: '9 − 4 = 5.',
  },
  {
    id: 'st-bird-garden',
    nameNp: 'चराको बगैँचा',
    nameEn: 'Bird Garden',
    icon: '🐦',
    problemType: 'BIRDS',
    itemEmoji: '🐦',
    total: 7,
    takeAway: 3,
    questionNp: 'रुखमा ७ वटा चरा थिए। ३ वटा चरा उडेर गए। कति चरा बाँकी छन्?',
    questionEn: 'There were 7 birds on the tree. 3 flew away. How many remain?',
    options: [3, 4, 5],
    correctAnswer: 4,
    explanationNp: '७ − ३ = ४ हुन्छ।',
    explanationEn: '7 − 3 = 4.',
  },
  {
    id: 'st-toy-house',
    nameNp: 'खेलौना घर',
    nameEn: 'Toy House',
    icon: '🧸',
    problemType: 'VERTICAL',
    itemEmoji: '🧸',
    total: 9,
    takeAway: 5,
    questionNp: 'ठाडो घटाउ गर्नुहोस्: ९ बाट ५ घटाउँदा कति हुन्छ?',
    questionEn: 'Perform vertical subtraction: 9 minus 5 = ?',
    options: [3, 4, 5],
    correctAnswer: 4,
    explanationNp: '९ − ५ = ४ हुन्छ।',
    explanationEn: '9 − 5 = 4.',
  },
  {
    id: 'st-flower-garden',
    nameNp: 'फूलबारी',
    nameEn: 'Flower Garden',
    icon: '🌸',
    problemType: 'ZERO',
    itemEmoji: '🌸',
    total: 8,
    takeAway: 0,
    questionNp: 'फूलबारीमा ८ वटा फूल छन्। शून्य (०) फूल टिप्दा कति बाँकी रहन्छन्?',
    questionEn: 'There are 8 flowers. Taking away 0 leaves how many flowers?',
    options: [0, 7, 8],
    correctAnswer: 8,
    explanationNp: 'शून्य घटाउँदा सङ्ख्या उही रहन्छ: ८ − ० = ८।',
    explanationEn: 'Subtracting zero leaves the count unchanged: 8 − 0 = 8.',
  },
  {
    id: 'st-challenge-station',
    nameNp: 'सङ्ख्या चुनौती केन्द्र',
    nameEn: 'Challenge Station',
    icon: '⭐',
    problemType: 'MISSING',
    itemEmoji: '⭐',
    total: 7,
    takeAway: 3,
    questionNp: 'खाली ठाउँ भर्नुहोस्: ७ − [ ? ] = ४',
    questionEn: 'Find the missing number: 7 − [ ? ] = 4',
    options: [2, 3, 4],
    correctAnswer: 3,
    explanationNp: '७ बाट ३ घटाउँदा ४ हुन्छ।',
    explanationEn: '7 minus 3 equals 4.',
  },
];

export const SubtractionChallengeWorld: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active station index
  const [activeStationIdx, setActiveStationIdx] = useState<number>(0);
  const currentStation = VILLAGE_STATIONS[activeStationIdx];

  // User Answer state
  const [userSelected, setUserSelected] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  // Audio synthesis
  const playSound = useCallback(
    (type: 'click' | 'success' | 'boop' | 'fanfare') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'click') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.06);
        } else if (type === 'success') {
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = ctx.currentTime + idx * 0.08;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.15, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.35);
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
    setUserSelected(null);
    setIsAnswerCorrect(null);
    speak(currentStation.questionNp, currentStation.questionEn);
  }, [activeStationIdx, currentStation, speak]);

  const handleSelectOption = (ans: number) => {
    setUserSelected(ans);
    const correct = ans === currentStation.correctAnswer;
    setIsAnswerCorrect(correct);

    if (correct) {
      playSound('success');
      setScore((s) => s + 1);
      speak(
        `सटीक उत्तर! ${currentStation.explanationNp}`,
        `Correct answer! ${currentStation.explanationEn}`
      );
    } else {
      playSound('boop');
      speak('पुनः प्रयास गर्नुहोस्।', 'Please try again.');
    }
  };

  const persistProgress = async (finalScore: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(
        '/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH8-05/progress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            timeSpentSeconds: 120,
            metrics: {
              challengeWorldScore: finalScore,
              stationsCompleted: VILLAGE_STATIONS.length,
            },
          }),
        }
      );
    } catch (e) {}
  };

  const handleNext = () => {
    playSound('click');
    if (activeStationIdx < VILLAGE_STATIONS.length - 1) {
      setActiveStationIdx((i) => i + 1);
    } else {
      setCompleted(true);
      playSound('success');
      persistProgress(score + 1);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Header Bar */}
      <header className="h-16 px-4 bg-slate-800/95 backdrop-blur border-b border-slate-700 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLibrary}
            className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition text-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
              Class 1 • Math • Chapter 8 • Simulation 05
            </span>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              {language === 'np' ? 'घटाउ चुनौती संसार' : 'Subtraction Challenge World'}
            </h1>
          </div>
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

      {/* Main Village Exploration Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-slate-950">
        {!completed ? (
          <div className="w-full max-w-3xl bg-slate-850/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
            {/* Village Stations Tab Selector */}
            <div className="flex flex-wrap justify-center gap-2">
              {VILLAGE_STATIONS.map((st, idx) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setActiveStationIdx(idx);
                    playSound('click');
                  }}
                  className={`px-3 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 border transition ${
                    activeStationIdx === idx
                      ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-900/40 scale-105'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <span>{st.icon}</span>
                  <span>{language === 'np' ? st.nameNp : st.nameEn}</span>
                </button>
              ))}
            </div>

            {/* Current Station Problem Header */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                {language === 'np'
                  ? `केन्द्र ${NEP_DIGITS[activeStationIdx + 1]} / ५: ${currentStation.nameNp}`
                  : `Station ${activeStationIdx + 1} of 5: ${currentStation.nameEn}`}
              </span>
              <h2 className="text-base md:text-lg font-bold text-white">
                {language === 'np' ? currentStation.questionNp : currentStation.questionEn}
              </h2>
            </div>

            {/* Visual Object / Equation Arena */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
              {currentStation.problemType === 'VERTICAL' ? (
                /* Vertical Equation Display */
                <div className="bg-slate-850 border-2 border-emerald-500/40 rounded-2xl p-4 flex flex-col items-end w-36 font-black text-3xl">
                  <span className="text-amber-400">
                    {language === 'np' ? NEP_DIGITS[currentStation.total] : currentStation.total}
                  </span>
                  <div className="flex items-center gap-2 text-rose-400">
                    <Minus className="w-5 h-5" />
                    <span>
                      {language === 'np' ? NEP_DIGITS[currentStation.takeAway] : currentStation.takeAway}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-600 my-2" />
                  <span className="text-emerald-400">
                    {userSelected !== null
                      ? language === 'np'
                        ? NEP_DIGITS[userSelected]
                        : userSelected
                      : '?'}
                  </span>
                </div>
              ) : (
                /* Horizontal Object & Equation Arena */
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Array.from({ length: currentStation.total }).map((_, i) => {
                      const isRemoved = i < currentStation.takeAway;
                      return (
                        <span
                          key={i}
                          className={`text-3xl p-1 transition ${
                            isRemoved ? 'opacity-25 line-through grayscale scale-90' : 'drop-shadow'
                          }`}
                        >
                          {currentStation.itemEmoji}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 text-xl font-black text-rose-400">
                    <span>{language === 'np' ? NEP_DIGITS[currentStation.total] : currentStation.total}</span>
                    <Minus className="w-5 h-5 text-rose-400" />
                    <span>{language === 'np' ? NEP_DIGITS[currentStation.takeAway] : currentStation.takeAway}</span>
                    <Equal className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400">
                      {userSelected !== null
                        ? language === 'np'
                          ? NEP_DIGITS[userSelected]
                          : userSelected
                        : '?'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-300 text-center font-bold">
                {language === 'np' ? 'सही उत्तर छान्नुहोस्:' : 'Select the correct answer:'}
              </span>
              <div className="grid grid-cols-3 gap-3">
                {currentStation.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`py-3 rounded-2xl font-black text-2xl border transition active:scale-95 ${
                      userSelected === opt
                        ? isAnswerCorrect
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                          : 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750'
                    }`}
                  >
                    {language === 'np' ? NEP_DIGITS[opt] : opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Station Action */}
            {isAnswerCorrect && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-rose-900/40 transition"
                >
                  {activeStationIdx < VILLAGE_STATIONS.length - 1
                    ? language === 'np'
                      ? 'अर्को केन्द्र'
                      : 'Next Station'
                    : language === 'np'
                    ? 'समाप्त गरौँ'
                    : 'Finish'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Completion Summary */
          <div className="w-full max-w-md bg-slate-850 border border-slate-700 rounded-3xl p-6 text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">
              {language === 'np' ? 'घटाउ चुनौती संसार सम्पन्न भयो!' : 'All Village Challenges Completed!'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'np'
                ? 'तपाईंले कक्षा १ को १० सम्मका सङ्ख्याहरूको घटाउ सम्बन्धी सबै अभ्यासहरू पूरा गर्नुभयो।'
                : 'You mastered all subtraction concepts up to 10 in Class 1 Mathematics.'}
            </p>
            <div className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex justify-around">
              <div>
                <span className="text-xs text-slate-400 block">
                  {language === 'np' ? 'केन्द्रहरू' : 'Stations'}
                </span>
                <span className="text-xl font-bold text-white">५ / 5</span>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <span className="text-xs text-emerald-400 block">
                  {language === 'np' ? 'सटीक उत्तर' : 'Score'}
                </span>
                <span className="text-xl font-bold text-emerald-400">
                  {language === 'np' ? NEP_DIGITS[score] : score}
                </span>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <span className="text-xs text-amber-400 block">
                  {language === 'np' ? 'ताराहरू' : 'Stars'}
                </span>
                <span className="text-xl font-bold text-amber-400">★★★</span>
              </div>
            </div>
            <div className="flex gap-2 w-full pt-2">
              <button
                onClick={() => {
                  setActiveStationIdx(0);
                  setUserSelected(null);
                  setIsAnswerCorrect(null);
                  setCompleted(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'np' ? 'पुनः खेल्नुहोस्' : 'Play Again'}
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
    </div>
  );
};

