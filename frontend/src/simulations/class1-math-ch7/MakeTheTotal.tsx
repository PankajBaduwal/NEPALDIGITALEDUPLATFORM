/**
 * MakeTheTotal.tsx
 * Simulation 02: Make the Total (जम्मा सङ्ख्या पत्ता लगाऔँ)
 * Class 1 Mathematics - Chapter 7: Addition up to 10 (योगफल १० सम्म आउने जोड)
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
  Plus,
  Equal,
  Heart,
  HelpCircle,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];

interface SceneActivity {
  id: string;
  theme: 'BASKET' | 'TREE_BIRDS' | 'FLOWER_POT' | 'POND_FISH' | 'TOY_BOX';
  titleNp: string;
  titleEn: string;
  countA: number;
  countB: number;
  itemEmojiA: string;
  itemEmojiB: string;
  itemNameNp: string;
  itemNameEn: string;
  descriptionNp: string;
  descriptionEn: string;
}

const SCENE_ACTIVITIES: SceneActivity[] = [
  {
    id: 'act-1',
    theme: 'BASKET',
    titleNp: 'स्याउको टोकरीहरू',
    titleEn: 'Fruit Baskets',
    countA: 2,
    countB: 3,
    itemEmojiA: '🍎',
    itemEmojiB: '🍎',
    itemNameNp: 'स्याउ',
    itemNameEn: 'Apples',
    descriptionNp: 'पहिलो टोकरीमा २ वटा र दोस्रो टोकरीमा ३ वटा स्याउ छन्।',
    descriptionEn: 'The first basket has 2 apples and the second basket has 3 apples.',
  },
  {
    id: 'act-2',
    theme: 'TREE_BIRDS',
    titleNp: 'रुखका हाँगामा चराहरू',
    titleEn: 'Birds on Tree',
    countA: 3,
    countB: 2,
    itemEmojiA: '🐦',
    itemEmojiB: '🕊️',
    itemNameNp: 'चराहरू',
    itemNameEn: 'Birds',
    descriptionNp: 'रुखको हाँगामा ३ वटा चरा बसिरहेका छन् र २ वटा नयाँ चरा उडेर आइपुगे।',
    descriptionEn: 'Three birds are perched on the branch and two more birds arrive.',
  },
  {
    id: 'act-3',
    theme: 'FLOWER_POT',
    titleNp: 'गमलामा फूलहरू',
    titleEn: 'Flowers in Pot',
    countA: 4,
    countB: 1,
    itemEmojiA: '🌸',
    itemEmojiB: '🌼',
    itemNameNp: 'फूलहरू',
    itemNameEn: 'Flowers',
    descriptionNp: 'गमलामा ४ वटा फूल फुलेका छन् र थप १ वटा फूल रोपियो।',
    descriptionEn: 'There are 4 flowers in the pot and 1 more flower is planted.',
  },
  {
    id: 'act-4',
    theme: 'POND_FISH',
    titleNp: 'पोखरीमा माछाहरू',
    titleEn: 'Fish in Pond',
    countA: 5,
    countB: 2,
    itemEmojiA: '🐟',
    itemEmojiB: '🐠',
    itemNameNp: 'माछाहरू',
    itemNameEn: 'Fish',
    descriptionNp: 'पोखरीमा ५ वटा सुनौला माछा र २ वटा रंगिन माछा पौडिरहेका छन्।',
    descriptionEn: 'Five golden fish and two colorful fish are swimming in the pond.',
  },
  {
    id: 'act-5',
    theme: 'TOY_BOX',
    titleNp: 'बाकसमा खेलौना बलहरू',
    titleEn: 'Balls in Box',
    countA: 6,
    countB: 3,
    itemEmojiA: '⚽',
    itemEmojiB: '🏀',
    itemNameNp: 'बलहरू',
    itemNameEn: 'Balls',
    descriptionNp: 'बाकसमा ६ वटा फुटबल र ३ वटा बास्केटबल छन्।',
    descriptionEn: 'In the box there are 6 footballs and 3 basketballs.',
  },
  {
    id: 'act-6',
    theme: 'BASKET',
    titleNp: 'पाकेका आँपहरू',
    titleEn: 'Ripe Mangoes',
    countA: 5,
    countB: 5,
    itemEmojiA: '🥭',
    itemEmojiB: '🥭',
    itemNameNp: 'आँपहरू',
    itemNameEn: 'Mangoes',
    descriptionNp: '५ वटा पाकेका आँप र ५ वटा हरिया आँप एकै ठाउँमा मिलाउँदा कति हुन्छ?',
    descriptionEn: 'When combining 5 ripe mangoes and 5 green mangoes, what is the total?',
  },
  {
    id: 'act-7',
    theme: 'FLOWER_POT',
    titleNp: 'शून्य फूल थप्दा',
    titleEn: 'Adding Zero Flowers',
    countA: 4,
    countB: 0,
    itemEmojiA: '🌻',
    itemEmojiB: '🌱',
    itemNameNp: 'सूर्यमुखी फूल',
    itemNameEn: 'Sunflowers',
    descriptionNp: '४ वटा सूर्यमुखी फूलमा शून्य (०) फूल थप्दा जम्मा कति हुन्छ?',
    descriptionEn: 'When adding 0 sunflowers to 4 sunflowers, what is the total?',
  },
];

export const MakeTheTotal: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Scene Index
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentScene = SCENE_ACTIVITIES[currentIndex];

  // User Interactive Counting state
  const [countedA, setCountedA] = useState<Set<number>>(new Set());
  const [countedB, setCountedB] = useState<Set<number>>(new Set());
  const [selectedTotal, setSelectedTotal] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  // Sound generator
  const playSound = useCallback(
    (type: 'click' | 'pop' | 'success' | 'boop' | 'fanfare', step?: number) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'click' || type === 'pop') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(350 + (step || 1) * 45, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
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
    speak(currentScene.descriptionNp, currentScene.descriptionEn);
  }, [currentIndex, currentScene, speak]);

  const handleSelectOption = (num: number) => {
    const total = currentScene.countA + currentScene.countB;
    setSelectedTotal(num);
    const correct = num === total;
    setIsCorrect(correct);

    if (correct) {
      playSound('success');
      setScore((s) => s + 1);
      speak(
        `स्याबास! ${currentScene.countA} र ${currentScene.countB} जोड्दा जम्मा ${total} हुन्छ!`,
        `Great job! ${currentScene.countA} plus ${currentScene.countB} equals ${total}!`
      );
    } else {
      playSound('boop');
      speak('पुनः गनेर हेर्नुहोस्।', 'Please count again carefully.');
    }
  };

  const handleNextScene = () => {
    playSound('click');
    if (currentIndex < SCENE_ACTIVITIES.length - 1) {
      setCurrentIndex((i) => i + 1);
      setCountedA(new Set());
      setCountedB(new Set());
      setSelectedTotal(null);
      setIsCorrect(null);
    } else {
      setCompleted(true);
      playSound('success');
      persistProgress(score + 1);
    }
  };

  const persistProgress = async (finalScore: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(
        '/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH7-02/progress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            timeSpentSeconds: 100,
            metrics: {
              makeTotalScore: finalScore,
              scenesCompleted: SCENE_ACTIVITIES.length,
            },
          }),
        }
      );
    } catch (e) {}
  };

  const correctTotal = currentScene.countA + currentScene.countB;
  const optionChoices = [correctTotal - 1, correctTotal, correctTotal + 1]
    .filter((n) => n >= 0 && n <= 10)
    .sort((a, b) => a - b);

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
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
              Class 1 • Math • Chapter 7 • Simulation 02
            </span>
            <h1 className="text-base font-bold text-white">
              {language === 'np' ? 'जम्मा सङ्ख्या पत्ता लगाऔँ' : 'Make the Total'}
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        {!completed ? (
          <div className="w-full max-w-3xl bg-slate-850/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
            {/* Top Indicator */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {language === 'np'
                  ? `दृश्य ${NEP_DIGITS[currentIndex + 1]} / ${NEP_DIGITS[SCENE_ACTIVITIES.length]}`
                  : `Scene ${currentIndex + 1} of ${SCENE_ACTIVITIES.length}`}
              </span>
              <button
                onClick={() => speak(currentScene.descriptionNp, currentScene.descriptionEn)}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>{language === 'np' ? 'सुन्नुहोस्' : 'Listen'}</span>
              </button>
            </div>

            <h2 className="text-lg md:text-xl font-bold text-white text-center">
              {language === 'np' ? currentScene.descriptionNp : currentScene.descriptionEn}
            </h2>

            {/* Pictorial Dual Group Scene Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group A Card */}
              <div className="bg-amber-950/20 border-2 border-amber-500/40 rounded-2xl p-4 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="text-xs font-bold text-amber-300">
                    {language === 'np' ? 'पहिलो समूह (क)' : 'Group A'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black">
                    {language === 'np' ? NEP_DIGITS[currentScene.countA] : currentScene.countA}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center items-center min-h-[100px]">
                  {currentScene.countA === 0 ? (
                    <span className="text-xs text-slate-500 italic">
                      {language === 'np' ? '(खाली समूह - ०)' : '(Empty Group - 0)'}
                    </span>
                  ) : (
                    Array.from({ length: currentScene.countA }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCountedA((prev) => new Set(prev).add(i));
                          playSound('pop', i + 1);
                        }}
                        className={`text-4xl p-2 rounded-2xl transition transform active:scale-90 ${
                          countedA.has(i)
                            ? 'bg-amber-500/30 ring-2 ring-amber-400 scale-105'
                            : 'hover:scale-110'
                        }`}
                        title="Click to count"
                      >
                        {currentScene.itemEmojiA}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Group B Card */}
              <div className="bg-sky-950/20 border-2 border-sky-500/40 rounded-2xl p-4 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="text-xs font-bold text-sky-300">
                    {language === 'np' ? 'दोस्रो समूह (ख)' : 'Group B'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-black">
                    {language === 'np' ? NEP_DIGITS[currentScene.countB] : currentScene.countB}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center items-center min-h-[100px]">
                  {currentScene.countB === 0 ? (
                    <span className="text-xs text-slate-500 italic">
                      {language === 'np' ? '(खाली समूह - ०)' : '(Empty Group - 0)'}
                    </span>
                  ) : (
                    Array.from({ length: currentScene.countB }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCountedB((prev) => new Set(prev).add(i));
                          playSound('pop', i + 1);
                        }}
                        className={`text-4xl p-2 rounded-2xl transition transform active:scale-90 ${
                          countedB.has(i)
                            ? 'bg-sky-500/30 ring-2 ring-sky-400 scale-105'
                            : 'hover:scale-110'
                        }`}
                        title="Click to count"
                      >
                        {currentScene.itemEmojiB}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Addition Equation Formula Row */}
            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700 flex items-center justify-center gap-4 text-xl font-black">
              <span className="text-amber-400">
                {language === 'np' ? NEP_DIGITS[currentScene.countA] : currentScene.countA}
              </span>
              <Plus className="w-5 h-5 text-emerald-400" />
              <span className="text-sky-400">
                {language === 'np' ? NEP_DIGITS[currentScene.countB] : currentScene.countB}
              </span>
              <Equal className="w-5 h-5 text-emerald-400" />
              <span
                className={`px-3 py-1 rounded-xl border ${
                  isCorrect
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                    : 'bg-slate-700 border-slate-600 text-slate-400'
                }`}
              >
                {isCorrect
                  ? language === 'np'
                    ? NEP_DIGITS[correctTotal]
                    : correctTotal
                  : '?'}
              </span>
            </div>

            {/* Answer Options */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-300 text-center">
                {language === 'np' ? 'जम्मा सङ्ख्या छान्नुहोस्:' : 'Select the total number:'}
              </span>
              <div className="grid grid-cols-3 gap-3">
                {optionChoices.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`py-3 rounded-2xl font-black text-2xl border transition active:scale-95 ${
                      selectedTotal === opt
                        ? isCorrect
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    }`}
                  >
                    {language === 'np' ? NEP_DIGITS[opt] : opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Action Button */}
            {isCorrect && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextScene}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition"
                >
                  {currentIndex < SCENE_ACTIVITIES.length - 1
                    ? language === 'np'
                      ? 'अर्को चित्र'
                      : 'Next Scene'
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
              {language === 'np' ? 'सबै दृश्यहरू पूरा भए!' : 'All Scenes Completed!'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'np'
                ? 'तपाईंले चित्रहरू हेरेर जोड गर्न सफलता प्राप्त गर्नुभयो।'
                : 'You successfully solved picture-based addition activities.'}
            </p>
            <div className="flex gap-2 w-full pt-2">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setCountedA(new Set());
                  setCountedB(new Set());
                  setSelectedTotal(null);
                  setIsCorrect(null);
                  setCompleted(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'np' ? 'पुनः खेल्नुहोस्' : 'Play Again'}
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
    </div>
  );
};

