/**
 * CountOnAdventure.tsx
 * Simulation 04: Count On Adventure (गनेर जोडौँ)
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
  Footprints,
  Plus,
  Equal,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दश'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

interface StepMission {
  startNum: number;
  addSteps: number;
  itemEmoji: string;
  itemNameNp: string;
  itemNameEn: string;
}

const MISSIONS: StepMission[] = [
  { startNum: 2, addSteps: 3, itemEmoji: '🍎', itemNameNp: 'स्याउ', itemNameEn: 'Apples' },
  { startNum: 4, addSteps: 2, itemEmoji: '🌸', itemNameNp: 'फूल', itemNameEn: 'Flowers' },
  { startNum: 5, addSteps: 3, itemEmoji: '🥭', itemNameNp: 'आँप', itemNameEn: 'Mangoes' },
  { startNum: 6, addSteps: 2, itemEmoji: '⚽', itemNameNp: 'बल', itemNameEn: 'Balls' },
  { startNum: 8, addSteps: 1, itemEmoji: '🐦', itemNameNp: 'चरा', itemNameEn: 'Birds' },
  { startNum: 7, addSteps: 3, itemEmoji: '⭐', itemNameNp: 'तारा', itemNameEn: 'Stars' },
];

export const CountOnAdventure: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mission Tracking
  const [missionIndex, setMissionIndex] = useState<number>(0);
  const currentMission = MISSIONS[missionIndex];

  // Character Current Position on Stone Path (0 to 10)
  const [currentPosition, setCurrentPosition] = useState<number>(currentMission.startNum);
  const [stepsTaken, setStepsTaken] = useState<number>(0);
  const [isMissionComplete, setIsMissionComplete] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Audio synthesis
  const playSound = useCallback(
    (type: 'step' | 'success' | 'fanfare', stepIndex?: number) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === 'step') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const freq = 340 + (stepIndex || 1) * 45;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.12);
        } else if (type === 'success' || type === 'fanfare') {
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = ctx.currentTime + idx * 0.09;
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
    setCurrentPosition(currentMission.startNum);
    setStepsTaken(0);
    setIsMissionComplete(false);
    speak(
      `हामी ${currentMission.startNum} मा छौँ। अब ${currentMission.addSteps} पाइला अगाडि गनौँ।`,
      `We start at ${currentMission.startNum}. Now count on ${currentMission.addSteps} more steps.`
    );
  }, [currentMission, speak]);

  const handleStepForward = () => {
    if (stepsTaken >= currentMission.addSteps) return;

    const nextPos = currentPosition + 1;
    const nextSteps = stepsTaken + 1;
    setCurrentPosition(nextPos);
    setStepsTaken(nextSteps);
    playSound('step', nextPos);

    speak(`${NEP_NAMES[nextPos]}!`, `${EN_NAMES[nextPos]}!`);

    if (nextSteps === currentMission.addSteps) {
      setIsMissionComplete(true);
      playSound('success');
      setScore((s) => s + 1);
      setTimeout(() => {
        speak(
          `सबास! ${currentMission.startNum} मा ${currentMission.addSteps} जोड्दा ${nextPos} पुगियो!`,
          `Great! Starting from ${currentMission.startNum} and counting on ${currentMission.addSteps} steps gives ${nextPos}!`
        );
      }, 700);
      persistProgress(score + 1);
    }
  };

  const persistProgress = async (finalScore: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(
        '/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH7-04/progress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            timeSpentSeconds: 90,
            metrics: {
              countOnScore: finalScore,
              missionsCompleted: MISSIONS.length,
            },
          }),
        }
      );
    } catch (e) {}
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
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
              Class 1 • Math • Chapter 7 • Simulation 04
            </span>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Footprints className="w-4 h-4 text-emerald-400" />
              {language === 'np' ? 'गनेर जोडौँ' : 'Count On Adventure'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLanguage((l) => (l === 'np' ? 'en' : 'np'));
              playSound('step');
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

      {/* Main Stepping Stone Adventure Canvas */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-950">
        <div className="w-full max-w-4xl bg-slate-850/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
          {/* Mission Progress Indicator */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {language === 'np'
                ? `अभ्यास ${NEP_DIGITS[missionIndex + 1]} / ${NEP_DIGITS[MISSIONS.length]}`
                : `Mission ${missionIndex + 1} of ${MISSIONS.length}`}
            </span>
            <div className="text-xs text-slate-300">
              {language === 'np'
                ? `सुरुवाती सङ्ख्या: ${NEP_DIGITS[currentMission.startNum]} | थप पाइला: ${NEP_DIGITS[currentMission.addSteps]}`
                : `Start: ${currentMission.startNum} | Add: ${currentMission.addSteps}`}
            </div>
          </div>

          {/* Spoken Guidance Prompt */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 text-center flex flex-col items-center gap-2">
            <p className="text-base md:text-lg font-bold text-white">
              {language === 'np'
                ? `हामीले ${NEP_NAMES[currentMission.startNum]} (${NEP_DIGITS[currentMission.startNum]}) गनिसक्यौँ। अब ${NEP_NAMES[currentMission.addSteps]} (${NEP_DIGITS[currentMission.addSteps]}) वटा थप गनौँ!`
                : `We already counted ${EN_NAMES[currentMission.startNum]} (${currentMission.startNum}). Now count on ${EN_NAMES[currentMission.addSteps]} (${currentMission.addSteps}) more!`}
            </p>
            <div className="flex items-center gap-3 text-xl font-black text-amber-400">
              <span>{language === 'np' ? NEP_DIGITS[currentMission.startNum] : currentMission.startNum}</span>
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>{language === 'np' ? NEP_DIGITS[currentMission.addSteps] : currentMission.addSteps}</span>
              <Equal className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400">
                {isMissionComplete
                  ? language === 'np'
                    ? NEP_DIGITS[currentMission.startNum + currentMission.addSteps]
                    : currentMission.startNum + currentMission.addSteps
                  : '?'}
              </span>
            </div>
          </div>

          {/* Stepping Stones Path: 0 to 10 */}
          <div className="py-6 flex flex-wrap justify-center items-center gap-2 md:gap-3">
            {Array.from({ length: 11 }).map((_, stoneNum) => {
              const isCurrent = stoneNum === currentPosition;
              const isStart = stoneNum === currentMission.startNum;
              const isInPath =
                stoneNum > currentMission.startNum &&
                stoneNum <= currentMission.startNum + currentMission.addSteps;
              const isReached = stoneNum <= currentPosition;

              return (
                <div key={stoneNum} className="relative flex flex-col items-center">
                  {/* Stepping Character Indicator on Current Stone */}
                  {isCurrent && (
                    <div className="absolute -top-10 animate-bounce flex flex-col items-center">
                      <span className="text-3xl">🏃‍♂️</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (stoneNum === currentPosition + 1 && stepsTaken < currentMission.addSteps) {
                        handleStepForward();
                      }
                    }}
                    className={`w-12 h-14 md:w-16 md:h-18 rounded-2xl flex flex-col items-center justify-center font-black text-lg md:text-xl border-2 transition-all duration-300 ${
                      isCurrent
                        ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/40 scale-110 z-10'
                        : isStart
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : isReached
                        ? 'bg-emerald-700/80 border-emerald-500 text-emerald-100'
                        : isInPath
                        ? 'bg-slate-800 border-amber-500/60 text-slate-200 animate-pulse'
                        : 'bg-slate-800/50 border-slate-700 text-slate-500'
                    }`}
                  >
                    <span>{language === 'np' ? NEP_DIGITS[stoneNum] : stoneNum}</span>
                    <span className="text-[9px] opacity-75">
                      {language === 'np' ? NEP_NAMES[stoneNum] : EN_NAMES[stoneNum]}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action Step Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setCurrentPosition(currentMission.startNum);
                setStepsTaken(0);
                setIsMissionComplete(false);
                playSound('step');
              }}
              className="px-3 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {language === 'np' ? 'सुरुबाट' : 'Reset'}
            </button>

            {!isMissionComplete ? (
              <button
                onClick={handleStepForward}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm md:text-base shadow-lg shadow-emerald-900/40 active:scale-95 transition flex items-center gap-2"
              >
                <Footprints className="w-5 h-5" />
                {language === 'np'
                  ? `अर्को पाइला गनौँ (${NEP_DIGITS[stepsTaken + 1]} / ${NEP_DIGITS[currentMission.addSteps]})`
                  : `Count Next Step (${stepsTaken + 1} of ${currentMission.addSteps})`}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (missionIndex < MISSIONS.length - 1) {
                    setMissionIndex((i) => i + 1);
                    playSound('step');
                  } else {
                    playSound('fanfare');
                    onBackToLibrary();
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm md:text-base shadow-lg shadow-indigo-900/40 active:scale-95 transition flex items-center gap-2"
              >
                {missionIndex < MISSIONS.length - 1
                  ? language === 'np'
                    ? 'अर्को अभ्यास'
                    : 'Next Mission'
                  : language === 'np'
                  ? 'पुस्तकालय फर्कनुहोस्'
                  : 'Return to Library'}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

