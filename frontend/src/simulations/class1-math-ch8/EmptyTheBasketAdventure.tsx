/**
 * EmptyTheBasketAdventure.tsx
 * Simulation 02: Empty the Basket Adventure (टोकरी खाली गर्ने साहसिक खेल)
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
  Minus,
  Equal,
  Package,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];

interface ContainerActivity {
  id: string;
  containerNameNp: string;
  containerNameEn: string;
  itemEmoji: string;
  itemNameNp: string;
  itemNameEn: string;
  initialCount: number;
  takeAwayTarget: number;
  descriptionNp: string;
  descriptionEn: string;
}

const CONTAINER_ACTIVITIES: ContainerActivity[] = [
  {
    id: 'act-1',
    containerNameNp: 'फलफूलको टोकरी',
    containerNameEn: 'Fruit Basket',
    itemEmoji: '🍎',
    itemNameNp: 'स्याउ',
    itemNameEn: 'Apples',
    initialCount: 8,
    takeAwayTarget: 3,
    descriptionNp: 'टोकरीमा ८ वटा स्याउ छन्। ३ वटा स्याउ बाहिर निकाल्नुहोस्।',
    descriptionEn: 'The basket contains 8 apples. Take away 3 apples.',
  },
  {
    id: 'act-2',
    containerNameNp: 'खेलौना बाकस',
    containerNameEn: 'Toy Box',
    itemEmoji: '🧸',
    itemNameNp: 'खेलौना',
    itemNameEn: 'Toys',
    initialCount: 7,
    takeAwayTarget: 4,
    descriptionNp: 'बाकसमा ७ वटा खेलौना छन्। ४ वटा खेलौना साथीलाई दिनुहोस्।',
    descriptionEn: 'The box contains 7 toys. Give away 4 toys to friends.',
  },
  {
    id: 'act-3',
    containerNameNp: 'चराको गुँड',
    containerNameEn: 'Bird Nest',
    itemEmoji: '🐦',
    itemNameNp: 'चराहरू',
    itemNameEn: 'Birds',
    initialCount: 6,
    takeAwayTarget: 2,
    descriptionNp: 'गुँडमा ६ वटा चरा छन्। २ वटा चरा उडेर गए। बाँकी कति रह्यो?',
    descriptionEn: 'A nest contains 6 birds. 2 birds fly away. How many remain?',
  },
  {
    id: 'act-4',
    containerNameNp: 'फूलको गमला',
    containerNameEn: 'Flower Pot',
    itemEmoji: '🌸',
    itemNameNp: 'फूलहरू',
    itemNameEn: 'Flowers',
    initialCount: 5,
    takeAwayTarget: 0,
    descriptionNp: 'गमलामा ५ वटा फूल छन्। शून्य (०) फूल हटाउँदा कति बाँकी रहन्छ?',
    descriptionEn: 'The pot has 5 flowers. Take away 0 flowers. How many remain?',
  },
  {
    id: 'act-5',
    containerNameNp: 'तरकारीको टोकरी',
    containerNameEn: 'Vegetable Basket',
    itemEmoji: '🥕',
    itemNameNp: 'गाँजर',
    itemNameEn: 'Carrots',
    initialCount: 9,
    takeAwayTarget: 5,
    descriptionNp: 'टोकरीमा ९ वटा गाँजर छन्। खरायोले ५ वटा गाँजर खायो।',
    descriptionEn: 'The basket has 9 carrots. The rabbit ate 5 carrots.',
  },
  {
    id: 'act-6',
    containerNameNp: 'संगमरमरको भाँडो',
    containerNameEn: 'Marble Jar',
    itemEmoji: '⚪',
    itemNameNp: 'गोलीहरू',
    itemNameEn: 'Marbles',
    initialCount: 10,
    takeAwayTarget: 6,
    descriptionNp: 'भाँडोमा १० वटा गोली छन्। ६ वटा बाहिर निकाल्नुहोस्।',
    descriptionEn: 'The jar has 10 marbles. Take out 6 marbles.',
  },
];

export const EmptyTheBasketAdventure: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active activity index
  const [actIndex, setActIndex] = useState<number>(0);
  const currentAct = CONTAINER_ACTIVITIES[actIndex];

  // Removed items tracker (indices of removed objects)
  const [removedIndices, setRemovedIndices] = useState<Set<number>>(new Set());
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  // Audio synthesis
  const playSound = useCallback(
    (type: 'click' | 'remove' | 'success' | 'fanfare', step?: number) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'click' || type === 'remove') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const freq = 420 - (step || 1) * 30;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
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
    setRemovedIndices(new Set());
    speak(currentAct.descriptionNp, currentAct.descriptionEn);
  }, [actIndex, currentAct, speak]);

  const handleToggleItem = (idx: number) => {
    if (removedIndices.has(idx)) {
      setRemovedIndices((prev) => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
      playSound('click');
    } else {
      if (removedIndices.size < currentAct.takeAwayTarget) {
        const next = new Set(removedIndices).add(idx);
        setRemovedIndices(next);
        playSound('remove', next.size);

        if (next.size === currentAct.takeAwayTarget) {
          const rem = currentAct.initialCount - currentAct.takeAwayTarget;
          playSound('success');
          speak(
            `स्याबास! ${currentAct.initialCount} बाट ${currentAct.takeAwayTarget} हटाउँदा ${rem} बाँकी रहन्छ।`,
            `Great! Taking away ${currentAct.takeAwayTarget} from ${currentAct.initialCount} leaves ${rem}.`
          );
        }
      }
    }
  };

  const isTargetReached = removedIndices.size === currentAct.takeAwayTarget;
  const remaining = currentAct.initialCount - removedIndices.size;

  const persistProgress = async (finalScore: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(
        '/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH8-02/progress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            timeSpentSeconds: 100,
            metrics: {
              emptyBasketScore: finalScore,
              activitiesCompleted: CONTAINER_ACTIVITIES.length,
            },
          }),
        }
      );
    } catch (e) {}
  };

  const handleNext = () => {
    playSound('click');
    if (actIndex < CONTAINER_ACTIVITIES.length - 1) {
      setActIndex((i) => i + 1);
      setScore((s) => s + 1);
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
              Class 1 • Math • Chapter 8 • Simulation 02
            </span>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              {language === 'np' ? 'टोकरी खाली गर्ने साहसिक खेल' : 'Empty the Basket Adventure'}
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
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-slate-950">
        {!completed ? (
          <div className="w-full max-w-3xl bg-slate-850/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
            {/* Activity Banner */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {language === 'np'
                  ? `अभ्यास ${NEP_DIGITS[actIndex + 1]} / ${NEP_DIGITS[CONTAINER_ACTIVITIES.length]}: ${currentAct.containerNameNp}`
                  : `Activity ${actIndex + 1} of ${CONTAINER_ACTIVITIES.length}: ${currentAct.containerNameEn}`}
              </span>
              <button
                onClick={() => speak(currentAct.descriptionNp, currentAct.descriptionEn)}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>{language === 'np' ? 'सुन्नुहोस्' : 'Listen'}</span>
              </button>
            </div>

            <h2 className="text-lg md:text-xl font-bold text-white text-center">
              {language === 'np' ? currentAct.descriptionNp : currentAct.descriptionEn}
            </h2>

            {/* Container vs Removed Dual Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inside Container Card */}
              <div className="bg-amber-950/20 border-2 border-amber-500/40 rounded-3xl p-5 flex flex-col items-center min-h-[220px] justify-between">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-amber-300">
                    {language === 'np' ? currentAct.containerNameNp : currentAct.containerNameEn}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black">
                    {language === 'np' ? `बाँकी: ${NEP_DIGITS[remaining]}` : `Left: ${remaining}`}
                  </span>
                </div>

                {/* Items in Container */}
                <div className="flex flex-wrap gap-2 justify-center items-center py-4">
                  {Array.from({ length: currentAct.initialCount }).map((_, i) => {
                    const isRemoved = removedIndices.has(i);
                    return (
                      <button
                        key={i}
                        onClick={() => handleToggleItem(i)}
                        className={`text-4xl p-2 rounded-2xl transition transform active:scale-90 ${
                          isRemoved
                            ? 'opacity-20 grayscale scale-75'
                            : 'hover:scale-110 drop-shadow-md'
                        }`}
                        title="Click to take away"
                      >
                        {currentAct.itemEmoji}
                      </button>
                    );
                  })}
                </div>

                <span className="text-[11px] text-slate-400 italic">
                  {language === 'np' ? 'हटाउन वस्तुमा थिच्नुहोस्' : 'Click item to take away'}
                </span>
              </div>

              {/* Outside Removal Card */}
              <div className="bg-rose-950/20 border-2 border-rose-500/40 rounded-3xl p-5 flex flex-col items-center min-h-[220px] justify-between">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-rose-300">
                    {language === 'np' ? 'हटाइएका वस्तुहरू' : 'Removed Items'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black">
                    {language === 'np'
                      ? `हटाइयो: ${NEP_DIGITS[removedIndices.size]} / ${NEP_DIGITS[currentAct.takeAwayTarget]}`
                      : `Removed: ${removedIndices.size} of ${currentAct.takeAwayTarget}`}
                  </span>
                </div>

                {/* Removed Items Grid */}
                <div className="flex flex-wrap gap-2 justify-center items-center py-4">
                  {removedIndices.size === 0 ? (
                    <span className="text-xs text-slate-500 italic">
                      {language === 'np' ? '(कुनै वस्तु हटाइएको छैन)' : '(No items removed yet)'}
                    </span>
                  ) : (
                    Array.from(removedIndices).map((idx) => (
                      <span key={idx} className="text-4xl p-1 animate-pulse">
                        {currentAct.itemEmoji}
                      </span>
                    ))
                  )}
                </div>

                <span className="text-[11px] text-slate-400 italic">
                  {language === 'np' ? 'हटाउने लक्ष्य' : 'Target to remove'}:{' '}
                  {language === 'np'
                    ? NEP_DIGITS[currentAct.takeAwayTarget]
                    : currentAct.takeAwayTarget}
                </span>
              </div>
            </div>

            {/* Live Subtraction Equation Formula */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 flex items-center justify-center gap-4 text-2xl font-black">
              <span className="text-amber-400">
                {language === 'np'
                  ? NEP_DIGITS[currentAct.initialCount]
                  : currentAct.initialCount}
              </span>
              <Minus className="w-6 h-6 text-rose-400 font-black" />
              <span className="text-rose-400">
                {language === 'np'
                  ? NEP_DIGITS[removedIndices.size]
                  : removedIndices.size}
              </span>
              <Equal className="w-6 h-6 text-emerald-400 font-black" />
              <span
                className={`px-3 py-1 rounded-xl border ${
                  isTargetReached
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                    : 'bg-slate-700 border-slate-600 text-slate-400'
                }`}
              >
                {language === 'np' ? NEP_DIGITS[remaining] : remaining}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setRemovedIndices(new Set());
                  playSound('click');
                }}
                className="px-3 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {language === 'np' ? 'सुरुबाट' : 'Reset'}
              </button>

              {isTargetReached && (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-rose-900/40 transition"
                >
                  {actIndex < CONTAINER_ACTIVITIES.length - 1
                    ? language === 'np'
                      ? 'अर्को अभ्यास'
                      : 'Next Container'
                    : language === 'np'
                    ? 'समाप्त गरौँ'
                    : 'Finish'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Completion Summary */
          <div className="w-full max-w-md bg-slate-850 border border-slate-700 rounded-3xl p-6 text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">
              {language === 'np' ? 'सबै टोकरीहरू पूरा भए!' : 'All Containers Completed!'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'np'
                ? 'तपाईंले भाँडा र टोकरीहरूबाट वस्तु निकालेर घटाउ गर्न सिक्नुभयो।'
                : 'You successfully learned subtraction by removing items from containers.'}
            </p>
            <div className="flex gap-2 w-full pt-2">
              <button
                onClick={() => {
                  setActIndex(0);
                  setRemovedIndices(new Set());
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

