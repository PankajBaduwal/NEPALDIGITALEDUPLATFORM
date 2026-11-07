/**
 * NumberLineAdventure.tsx
 * Simulation 04: Number Line Adventure (सङ्ख्यारेखाको साहसिक यात्रा)
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
  ChevronLeft,
  Compass,
  Footprints,
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

const NEP_NAMES: Record<number, string> = {
  11: 'एघार', 12: 'बाह्र', 13: 'तेह्र', 14: 'चौध', 15: 'पन्ध्र',
  16: 'सोह्र', 17: 'सत्र', 18: 'अठार', 19: 'उन्नाइस', 20: 'बीस',
};

const EN_NAMES: Record<number, string> = {
  11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen',
  16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty',
};

interface ChallengeItem {
  id: number;
  type: 'BEFORE' | 'AFTER' | 'BETWEEN' | 'MISSING';
  questionNp: string;
  questionEn: string;
  contextNum1: number;
  contextNum2?: number;
  targetNum: number;
  options: number[];
  correct: number;
  explanationNp: string;
  explanationEn: string;
}

export const NumberLineAdventure: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Mode: 'EXPLORE_LINE' | 'ADVENTURE' | 'QUIZ'
  const [mode, setMode] = useState<'EXPLORE_LINE' | 'ADVENTURE' | 'QUIZ'>('EXPLORE_LINE');

  // EXPLORE STATE: Position of character on stepping stones (0 to 20)
  const [currentPos, setCurrentPos] = useState<number>(11);

  // ADVENTURE CHALLENGES
  const challenges: ChallengeItem[] = useMemo(
    () => [
      {
        id: 1,
        type: 'BEFORE',
        questionNp: '१५ को ठीक अगाडि कुन सङ्ख्या आउँछ? [ ? ] १५',
        questionEn: 'Which number comes just before 15? [ ? ] 15',
        contextNum1: 15,
        targetNum: 14,
        options: [13, 14, 16],
        correct: 14,
        explanationNp: '१५ को ठीक अघिल्लो सङ्ख्या १४ (चौध) हो।',
        explanationEn: 'The number just before 15 is 14 (Fourteen).',
      },
      {
        id: 2,
        type: 'AFTER',
        questionNp: '१७ को ठीक पछाडि कुन सङ्ख्या आउँछ? १७ [ ? ]',
        questionEn: 'Which number comes just after 17? 17 [ ? ]',
        contextNum1: 17,
        targetNum: 18,
        options: [16, 18, 19],
        correct: 18,
        explanationNp: '१७ को ठीक पछिल्लो सङ्ख्या १८ (अठार) हो।',
        explanationEn: 'The number just after 17 is 18 (Eighteen).',
      },
      {
        id: 3,
        type: 'BETWEEN',
        questionNp: '१२ र १४ को ठीक बीचमा कुन सङ्ख्या पर्दछ? १२ [ ? ] १४',
        questionEn: 'Which number lies between 12 and 14? 12 [ ? ] 14',
        contextNum1: 12,
        contextNum2: 14,
        targetNum: 13,
        options: [11, 13, 15],
        correct: 13,
        explanationNp: '१२ र १४ को बीचमा १३ (तेह्र) पर्दछ।',
        explanationEn: 'Between 12 and 14 lies 13 (Thirteen).',
      },
      {
        id: 4,
        type: 'MISSING',
        questionNp: 'क्रम पूरा गर्नुहोस्: १६, १७, [ ? ], १९',
        questionEn: 'Complete the sequence: 16, 17, [ ? ], 19',
        contextNum1: 17,
        targetNum: 18,
        options: [15, 18, 20],
        correct: 18,
        explanationNp: '१६, १७ पछि १८ (अठार) आउँछ।',
        explanationEn: '16, 17 is followed by 18 (Eighteen).',
      },
      {
        id: 5,
        type: 'BEFORE',
        questionNp: '२० को ठीक अगाडि कुन सङ्ख्या आउँछ? [ ? ] २०',
        questionEn: 'Which number comes just before 20? [ ? ] 20',
        contextNum1: 20,
        targetNum: 19,
        options: [18, 19, 21],
        correct: 19,
        explanationNp: '२० को ठीक अगाडि १९ (उन्नाइस) हुन्छ।',
        explanationEn: 'Just before 20 comes 19 (Nineteen).',
      },
      {
        id: 6,
        type: 'BETWEEN',
        questionNp: '१८ र २० को ठीक बीचमा कुन सङ्ख्या पर्दछ? १८ [ ? ] २०',
        questionEn: 'Which number lies between 18 and 20? 18 [ ? ] 20',
        contextNum1: 18,
        contextNum2: 20,
        targetNum: 19,
        options: [17, 19, 21],
        correct: 19,
        explanationNp: '१८ र २० को बीचमा १९ (उन्नाइस) पर्दछ।',
        explanationEn: 'Between 18 and 20 lies 19 (Nineteen).',
      },
      {
        id: 7,
        type: 'AFTER',
        questionNp: '११ को ठीक पछाडि कुन सङ्ख्या आउँछ? ११ [ ? ]',
        questionEn: 'Which number comes just after 11? 11 [ ? ]',
        contextNum1: 11,
        targetNum: 12,
        options: [10, 12, 13],
        correct: 12,
        explanationNp: '११ पछि १२ (बाह्र) आउँछ।',
        explanationEn: 'After 11 comes 12 (Twelve).',
      },
      {
        id: 8,
        type: 'MISSING',
        questionNp: 'क्रम पूरा गर्नुहोस्: १३, १४, १५, [ ? ]',
        questionEn: 'Complete the sequence: 13, 14, 15, [ ? ]',
        contextNum1: 15,
        targetNum: 16,
        options: [16, 17, 12],
        correct: 16,
        explanationNp: '१५ पछि १६ (सोह्र) आउँछ।',
        explanationEn: 'After 15 comes 16 (Sixteen).',
      },
      {
        id: 9,
        type: 'BEFORE',
        questionNp: '११ को ठीक अगाडि कुन सङ्ख्या आउँछ? [ ? ] ११',
        questionEn: 'Which number comes just before 11? [ ? ] 11',
        contextNum1: 11,
        targetNum: 10,
        options: [9, 10, 12],
        correct: 10,
        explanationNp: '११ को ठीक अगाडि १० (दश) हुन्छ।',
        explanationEn: 'Just before 11 comes 10 (Ten).',
      },
      {
        id: 10,
        type: 'BETWEEN',
        questionNp: '१४ र १६ को ठीक बीचमा कुन सङ्ख्या पर्दछ? १४ [ ? ] १६',
        questionEn: 'Which number lies between 14 and 16? 14 [ ? ] 16',
        contextNum1: 14,
        contextNum2: 16,
        targetNum: 15,
        options: [13, 15, 17],
        correct: 15,
        explanationNp: '१४ र १६ को बीचमा १५ (पन्ध्र) पर्दछ।',
        explanationEn: 'Between 14 and 16 lies 15 (Fifteen).',
      },
    ],
    []
  );

  const [challengeIdx, setChallengeIdx] = useState(0);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeAnswered, setChallengeAnswered] = useState(false);
  const [challengeSelected, setChallengeSelected] = useState<number | null>(null);
  const [adventureCompleted, setAdventureCompleted] = useState(false);

  // Audio Synthesizer
  const playSound = useCallback(
    (type: 'hop' | 'success' | 'fanfare' | 'boop') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();

        if (type === 'hop') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
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
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH9-04/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSpentSeconds: 120,
          metrics: {
            numberLineScore: score,
            starsAwarded: Math.min(3, Math.ceil(score / 3.3)),
          },
        }),
      });
    } catch (err) {}
  }, []);

  const handleHopTo = (num: number) => {
    playSound('hop');
    setCurrentPos(num);
    const nepText = NEP_NAMES[num] ? `${NEP_NUMERALS[num]}, ${NEP_NAMES[num]}` : `${num}`;
    const enText = EN_NAMES[num] ? `${num}, ${EN_NAMES[num]}` : `${num}`;
    speak(nepText, enText);
  };

  const handleAdventureAnswer = (opt: number) => {
    if (challengeAnswered) return;
    setChallengeSelected(opt);
    setChallengeAnswered(true);
    const currentQ = challenges[challengeIdx];
    if (opt === currentQ.correct) {
      playSound('success');
      setChallengeScore((prev) => prev + 1);
      speak('स्याबास! सही उत्तर।', 'Well done! Correct answer.');
    } else {
      playSound('boop');
      speak('पुनः विचार गर्नुहोस्। सही उत्तर हेर्नुहोस्।', 'Check the explanation.');
    }
  };

  const handleAdventureNext = () => {
    playSound('hop');
    if (challengeIdx + 1 < challenges.length) {
      setChallengeIdx((prev) => prev + 1);
      setChallengeAnswered(false);
      setChallengeSelected(null);
    } else {
      setAdventureCompleted(true);
      playSound('fanfare');
      recordProgress(challengeScore);
    }
  };

  const handleAdventureReset = () => {
    playSound('hop');
    setChallengeIdx(0);
    setChallengeScore(0);
    setChallengeAnswered(false);
    setChallengeSelected(null);
    setAdventureCompleted(false);
  };

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
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold">
                Simulation 04
              </span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {language === 'np' ? 'सङ्ख्यारेखाको साहसिक यात्रा (० देखि २०)' : 'Number Line Adventure (0 to 20)'}
            </h1>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => {
              playSound('hop');
              setMode('EXPLORE_LINE');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              mode === 'EXPLORE_LINE' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {language === 'np' ? 'सङ्ख्यारेखा खोज्ने' : 'Explore Line'}
          </button>
          <button
            onClick={() => {
              playSound('hop');
              setMode('ADVENTURE');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              mode === 'ADVENTURE' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {language === 'np' ? 'साहसिक चुनौती' : 'Adventure Missions'}
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
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition"
          >
            {language === 'np' ? 'English' : 'नेपाली'}
          </button>
        </div>
      </header>

      {/* Main Screen */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        {/* ========================================================================= */}
        {/* MODE 1: EXPLORE NUMBER LINE 0 TO 20 */}
        {/* ========================================================================= */}
        {mode === 'EXPLORE_LINE' && (
          <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full justify-between gap-6">
            {/* Top Prompt Card */}
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 font-bold uppercase">
                  {language === 'np' ? 'सङ्ख्यारेखा निर्देशन' : 'Number Line Guide'}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                  {language === 'np'
                    ? `तपाईं अहिले ढुङ्गा ${NEP_NUMERALS[currentPos]} (${NEP_NAMES[currentPos] || currentPos}) मा हुनुहुन्छ।`
                    : `You are currently standing on stone ${currentPos} (${EN_NAMES[currentPos] || currentPos}).`}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'np'
                    ? 'कुनै पनि ढुङ्गामा क्लिक गरेर उफ्रनुहोस् वा तलका अघिल्लो/पछिल्लो बटन प्रयोग गर्नुहोस्।'
                    : 'Click any stepping stone to hop, or use Previous / Next buttons.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPos <= 0}
                  onClick={() => handleHopTo(currentPos - 1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {language === 'np' ? 'अघिल्लो (-१)' : 'Previous'}
                </button>
                <button
                  disabled={currentPos >= 20}
                  onClick={() => handleHopTo(currentPos + 1)}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-1 shadow-lg shadow-teal-500/20"
                >
                  {language === 'np' ? 'पछिल्लो (+१)' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stepping Stone Number Path Display (Scrollable or 2-row wrapped) */}
            <div className="bg-slate-900/90 p-6 rounded-3xl border border-teal-500/30 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
              {/* Stepping river background aesthetic */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-teal-950/30 to-blue-950/40 pointer-events-none" />

              {/* Stone path from 0 to 20 */}
              <div className="relative z-10 w-full flex flex-wrap items-center justify-center gap-2 md:gap-3">
                {Array.from({ length: 21 }).map((_, num) => {
                  const isCurrent = currentPos === num;
                  const isHighlightRange = num >= 11 && num <= 20;

                  return (
                    <button
                      key={num}
                      onClick={() => handleHopTo(num)}
                      className={`relative group w-12 h-14 md:w-14 md:h-16 rounded-2xl flex flex-col items-center justify-center font-black transition-all transform duration-300 ${
                        isCurrent
                          ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 scale-110 shadow-xl shadow-amber-500/40 ring-4 ring-amber-300 -translate-y-2'
                          : isHighlightRange
                          ? 'bg-slate-800 hover:bg-teal-700/80 text-teal-300 border-2 border-teal-500/50 hover:scale-105'
                          : 'bg-slate-800/60 hover:bg-slate-700 text-slate-400 border border-slate-700 hover:scale-102'
                      }`}
                    >
                      {/* Character avatar badge when current */}
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white rounded-full p-0.5 shadow">
                          <Footprints className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <span className="text-base md:text-lg leading-tight">{NEP_NUMERALS[num]}</span>
                      <span className="text-[10px] opacity-75 font-normal leading-tight">{num}</span>
                    </button>
                  );
                })}
              </div>

              {/* River path connector line */}
              <div className="w-11/12 h-1 bg-gradient-to-r from-slate-700 via-teal-500/60 to-slate-700 rounded-full mt-4" />
            </div>

            {/* Three Essential Relationship Cards: Before, Active, After */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Before */}
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'np' ? 'ठीक अगाडिको सङ्ख्या (Before)' : 'Number Just Before'}
                </span>
                <span className="text-3xl font-black text-rose-400 my-2">
                  {currentPos > 0 ? NEP_NUMERALS[currentPos - 1] : '—'}
                </span>
                <span className="text-xs text-slate-400">
                  {currentPos > 0
                    ? `${NEP_NUMERALS[currentPos]} भन्दा १ कम = ${NEP_NUMERALS[currentPos - 1]}`
                    : 'कुनै छैन'}
                </span>
              </div>

              {/* Card 2: Current */}
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-5 rounded-2xl border-2 border-amber-400/60 flex flex-col items-center text-center shadow-lg">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {language === 'np' ? 'हालको सङ्ख्या (Current)' : 'Selected Number'}
                </span>
                <span className="text-4xl font-black text-amber-300 my-1">
                  {NEP_NUMERALS[currentPos]}
                </span>
                <span className="text-xs font-bold text-white">
                  {language === 'np' ? NEP_NAMES[currentPos] || '' : EN_NAMES[currentPos] || ''} ({currentPos})
                </span>
              </div>

              {/* Card 3: After */}
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'np' ? 'ठीक पछाडिको सङ्ख्या (After)' : 'Number Just After'}
                </span>
                <span className="text-3xl font-black text-emerald-400 my-2">
                  {currentPos < 20 ? NEP_NUMERALS[currentPos + 1] : '—'}
                </span>
                <span className="text-xs text-slate-400">
                  {currentPos < 20
                    ? `${NEP_NUMERALS[currentPos]} भन्दा १ बढी = ${NEP_NUMERALS[currentPos + 1]}`
                    : 'कुनै छैन'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: ADVENTURE CHALLENGES (BEFORE, AFTER, BETWEEN, MISSING) */}
        {/* ========================================================================= */}
        {mode === 'ADVENTURE' && (
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full justify-center">
            {!adventureCompleted ? (
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                      {challenges[challengeIdx].type}
                    </span>
                    <span className="font-bold text-white">
                      {language === 'np'
                        ? `चुनौती ${NEP_NUMERALS[challengeIdx + 1]} / ${NEP_NUMERALS[challenges.length]}`
                        : `Mission ${challengeIdx + 1} of ${challenges.length}`}
                    </span>
                  </div>
                  <span className="font-bold text-amber-400">
                    {language === 'np' ? `अङ्क: ${NEP_NUMERALS[challengeScore]}` : `Score: ${challengeScore}`}
                  </span>
                </div>

                {/* Question */}
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white">
                    {language === 'np' ? challenges[challengeIdx].questionNp : challenges[challengeIdx].questionEn}
                  </h3>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {challenges[challengeIdx].options.map((opt) => {
                    const isSelected = challengeSelected === opt;
                    const isCorrectOpt = opt === challenges[challengeIdx].correct;
                    let btnStyle = 'bg-slate-700/80 hover:bg-slate-700 text-white';

                    if (challengeAnswered) {
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
                        disabled={challengeAnswered}
                        onClick={() => handleAdventureAnswer(opt)}
                        className={`p-5 rounded-2xl text-xl font-black transition flex flex-col items-center justify-center gap-1 border border-slate-600 ${btnStyle}`}
                      >
                        <span className="text-3xl">{NEP_NUMERALS[opt]}</span>
                        <span className="text-xs opacity-75">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {challengeAnswered && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300">
                    <p className="font-bold text-amber-400 mb-1">
                      {language === 'np' ? 'व्याख्या:' : 'Explanation:'}
                    </p>
                    <p>
                      {language === 'np'
                        ? challenges[challengeIdx].explanationNp
                        : challenges[challengeIdx].explanationEn}
                    </p>
                  </div>
                )}

                {/* Next Button */}
                {challengeAnswered && (
                  <button
                    onClick={handleAdventureNext}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{language === 'np' ? 'अर्को चुनौती' : 'Next Mission'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Completion Celebration Card */
              <div className="bg-slate-800/95 border-2 border-teal-500/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <Award className="w-10 h-10 text-teal-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">
                    {language === 'np' ? 'बधाई छ! साहसिक यात्रा सफल भयो!' : 'Congratulations! Adventure Completed!'}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    {language === 'np'
                      ? 'तपाईंले सङ्ख्यारेखामा अघिल्लो, पछिल्लो र बीचको सङ्ख्या कुशलतापूर्वक चिन्नुभयो।'
                      : 'You mastered numbers before, after, between, and sequence gaps on the number line.'}
                  </p>
                </div>

                <div className="text-4xl font-black text-teal-400">
                  {NEP_NUMERALS[challengeScore]} / {NEP_NUMERALS[challenges.length]}
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleAdventureReset}
                    className="flex-1 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'फेरि यात्रा गर्नुहोस्' : 'Restart Adventure'}
                  </button>
                  <button
                    onClick={() => {
                      playSound('hop');
                      setMode('EXPLORE_LINE');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition"
                  >
                    {language === 'np' ? 'सङ्ख्यारेखामा फर्कनुहोस्' : 'Back to Line'}
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

