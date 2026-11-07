/**
 * NumberSequenceSimulation.tsx
 * Simulation 05: Number Sequence Adventure (सङ्ख्या क्रम मिलाऔँ)
 * Class 1 Mathematics - Chapter 4: Numbers up to 9 (९ सम्मका सङ्ख्याहरू)
 * Based on Nepal CDC Curriculum (मेरो गणित, कक्षा १ - २०७६)
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
  HelpCircle,
  Footprints,
  Compass,
  Award,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

// Activity types
type ActivityMode = 'RIVER_CROSSING' | 'ARRANGE_SEQUENCE' | 'MISSING_NUMBERS' | 'BEFORE_AFTER';

interface MissingChallenge {
  sequence: (number | null)[];
  missingIndex: number;
  correctValue: number;
  options: number[];
}

interface BeforeAfterChallenge {
  type: 'AFTER' | 'BEFORE';
  targetNum: number;
  correctValue: number;
  options: number[];
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

export const NumberSequenceSimulation: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Script Mode: 'np' (१–९) vs 'en' (1–9)
  const [scriptMode, setScriptMode] = useState<'np' | 'en'>('np');

  // Active Mode
  const [activeMode, setActiveMode] = useState<ActivityMode>('RIVER_CROSSING');

  // Overall Score & Stars
  const [stars, setStars] = useState(0);

  // ==========================================
  // MODE 1: RIVER CROSSING STATE
  // ==========================================
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = start bank, 1..9 = stones
  const [characterPosition, setCharacterPosition] = useState<number>(0); // stone index 0..9
  const [crossingComplete, setCrossingComplete] = useState<boolean>(false);
  const [shuffledStoneOptions, setShuffledStoneOptions] = useState<number[]>([]);

  // ==========================================
  // MODE 2: ARRANGE SEQUENCE STATE
  // ==========================================
  const [arrangeRound, setArrangeRound] = useState<number>(1); // Round 1: 1-5, Round 2: 4-9, Round 3: 1-9
  const [availableCards, setAvailableCards] = useState<number[]>([]);
  const [placedCards, setPlacedCards] = useState<number[]>([]);
  const [arrangeSuccess, setArrangeSuccess] = useState<boolean>(false);

  // ==========================================
  // MODE 3: MISSING NUMBERS STATE
  // ==========================================
  const [missingRoundIndex, setMissingRoundIndex] = useState<number>(0);
  const missingChallenges: MissingChallenge[] = [
    { sequence: [1, 2, null, 4, 5], missingIndex: 2, correctValue: 3, options: [2, 3, 4] },
    { sequence: [null, 2, 3, 4, 5], missingIndex: 0, correctValue: 1, options: [1, 2, 6] },
    { sequence: [4, 5, 6, null, 8], missingIndex: 3, correctValue: 7, options: [5, 7, 8] },
    { sequence: [5, 6, 7, 8, null], missingIndex: 4, correctValue: 9, options: [7, 8, 9] },
    { sequence: [2, 3, null, 5, 6], missingIndex: 2, correctValue: 4, options: [4, 5, 7] },
  ];
  const [missingSelected, setMissingSelected] = useState<number | null>(null);
  const [missingFeedback, setMissingFeedback] = useState<boolean | null>(null);

  // ==========================================
  // MODE 4: BEFORE / AFTER STATE
  // ==========================================
  const [beforeAfterIndex, setBeforeAfterIndex] = useState<number>(0);
  const beforeAfterChallenges: BeforeAfterChallenge[] = [
    { type: 'AFTER', targetNum: 3, correctValue: 4, options: [2, 4, 5] },
    { type: 'AFTER', targetNum: 7, correctValue: 8, options: [6, 8, 9] },
    { type: 'BEFORE', targetNum: 5, correctValue: 4, options: [3, 4, 6] },
    { type: 'BEFORE', targetNum: 2, correctValue: 1, options: [1, 3, 4] },
    { type: 'AFTER', targetNum: 8, correctValue: 9, options: [7, 8, 9] },
  ];
  const [beforeAfterSelected, setBeforeAfterSelected] = useState<number | null>(null);
  const [beforeAfterFeedback, setBeforeAfterFeedback] = useState<boolean | null>(null);

  // Helpers to format numerals
  const formatNum = (num: number | null): string => {
    if (num === null) return '?';
    return scriptMode === 'np' ? NEP_DIGITS[num] : num.toString();
  };

  const formatName = (num: number): string => {
    return language === 'np' ? NEP_NAMES[num] : EN_NAMES[num];
  };

  // Audio Speech
  const speakText = useCallback((npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }, [language, soundEnabled]);

  // Audio Synthesizer Beeps/Chimes
  const playTone = useCallback((freq = 523.25, type: OscillatorType = 'sine', duration = 0.25) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext unavailable
    }
  }, [soundEnabled]);

  // Save progress API
  const saveProgress = async (newStars: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH4-05/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, newStars * 12),
          completionStatus: newStars >= 8 ? 'COMPLETED' : 'IN_PROGRESS',
          timeSpentSeconds: 160,
          attemptsCount: 1,
          metadata: {
            stars: newStars,
            lastMode: activeMode,
          },
        }),
      });
    } catch {
      // Ignore background progress save errors
    }
  };

  // ==========================================
  // INITIALIZERS
  // ==========================================
  // River crossing options generator
  const refreshRiverOptions = (nextExpected: number) => {
    if (nextExpected > 9) {
      setCrossingComplete(true);
      playTone(659.25, 'triangle', 0.4);
      setTimeout(() => playTone(880, 'sine', 0.6), 200);
      setStars((s) => {
        const ns = s + 3;
        saveProgress(ns);
        return ns;
      });
      speakText(
        'वाह! तपाईंले नदी तर्नुभयो! १ देखि ९ सम्मका सबै ढुङ्गाहरू पार भए!',
        'Hooray! You crossed the river! All stones 1 through 9 completed!'
      );
      return;
    }

    // 3 choices including the correct next number
    const wrong1 = nextExpected === 9 ? 7 : nextExpected + 1;
    const wrong2 = nextExpected === 1 ? 3 : nextExpected - 1;
    const set = Array.from(new Set([nextExpected, wrong1, wrong2])).slice(0, 3);
    // Shuffle
    set.sort(() => Math.random() - 0.5);
    setShuffledStoneOptions(set);
  };

  // River Crossing Step Handler
  const handleRiverStoneClick = (val: number) => {
    const expected = currentStep + 1;
    if (val === expected) {
      // Correct!
      playTone(523.25 + expected * 40, 'triangle', 0.3);
      setCurrentStep(expected);
      setCharacterPosition(expected);
      speakText(`${formatNum(expected)}, ${formatName(expected)}`, `Number ${expected}, ${formatName(expected)}`);
      refreshRiverOptions(expected + 1);
    } else {
      // Wrong stone!
      playTone(260, 'sawtooth', 0.3);
      speakText(
        `होइन, अब सङ्ख्या ${formatNum(expected)} मा टेकिनुपर्छ।`,
        `Not quite, the next stone is number ${expected}.`
      );
    }
  };

  // Reset River Crossing
  const resetRiverCrossing = () => {
    setCurrentStep(0);
    setCharacterPosition(0);
    setCrossingComplete(false);
    refreshRiverOptions(1);
    speakText(
      'ढुङ्गाहरूमा १ देखि ९ सम्म क्रमबद्ध टेकेर नदी तर्नुहोस्!',
      'Step on the numbered stones from 1 to 9 in order to cross the river!'
    );
  };

  // ==========================================
  // ARRANGE SEQUENCE HANDLERS
  // ==========================================
  const setupArrangeRound = (round: number) => {
    let pool: number[] = [];
    if (round === 1) pool = [1, 2, 3, 4, 5];
    else if (round === 2) pool = [4, 5, 6, 7, 8, 9];
    else pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setAvailableCards(shuffled);
    setPlacedCards([]);
    setArrangeSuccess(false);
  };

  const handlePickCard = (val: number) => {
    const newPlaced = [...placedCards, val];
    const newAvail = availableCards.filter((c) => c !== val);
    setPlacedCards(newPlaced);
    setAvailableCards(newAvail);
    playTone(500, 'sine', 0.15);

    // Check if full
    let targetPool: number[] = [];
    if (arrangeRound === 1) targetPool = [1, 2, 3, 4, 5];
    else if (arrangeRound === 2) targetPool = [4, 5, 6, 7, 8, 9];
    else targetPool = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    if (newPlaced.length === targetPool.length) {
      // Check order
      const isSorted = newPlaced.every((v, i) => v === targetPool[i]);
      if (isSorted) {
        setArrangeSuccess(true);
        playTone(659.25, 'triangle', 0.4);
        setTimeout(() => playTone(880, 'sine', 0.5), 180);
        setStars((s) => {
          const ns = s + 2;
          saveProgress(ns);
          return ns;
        });
        speakText('उत्तम! सङ्ख्याहरू सही क्रममा मिले!', 'Great! Numbers are in correct order!');
      } else {
        playTone(280, 'sawtooth', 0.3);
        speakText('क्रम मिलेन, फेरि मिलाउनुहोस्।', 'Order is incorrect, please rearrange.');
      }
    }
  };

  const handleRemovePlacedCard = (val: number) => {
    setPlacedCards(placedCards.filter((c) => c !== val));
    setAvailableCards([...availableCards, val]);
    setArrangeSuccess(false);
  };

  // ==========================================
  // MISSING NUMBERS HANDLER
  // ==========================================
  const handleMissingChoice = (chosen: number) => {
    const challenge = missingChallenges[missingRoundIndex];
    setMissingSelected(chosen);

    if (chosen === challenge.correctValue) {
      setMissingFeedback(true);
      playTone(600, 'triangle', 0.3);
      setStars((s) => {
        const ns = s + 1;
        saveProgress(ns);
        return ns;
      });
      speakText(
        `सबास! छुटेको सङ्ख्या ${formatNum(chosen)} हो!`,
        `Correct! The missing number is ${chosen}!`
      );
    } else {
      setMissingFeedback(false);
      playTone(280, 'sawtooth', 0.3);
      speakText('गलत भयो, फेरि प्रयास गर्नुहोस्।', 'Not correct, try again.');
    }
  };

  // ==========================================
  // BEFORE / AFTER HANDLER
  // ==========================================
  const handleBeforeAfterChoice = (chosen: number) => {
    const challenge = beforeAfterChallenges[beforeAfterIndex];
    setBeforeAfterSelected(chosen);

    if (chosen === challenge.correctValue) {
      setBeforeAfterFeedback(true);
      playTone(600, 'triangle', 0.3);
      setStars((s) => {
        const ns = s + 1;
        saveProgress(ns);
        return ns;
      });
      const directionText = challenge.type === 'AFTER' ? 'पछिको' : 'अघिको';
      const dirEn = challenge.type === 'AFTER' ? 'after' : 'before';
      speakText(
        `अति राम्रो! ${formatNum(challenge.targetNum)} को ${directionText} सङ्ख्या ${formatNum(chosen)} हो।`,
        `Excellent! Number ${dirEn} ${challenge.targetNum} is ${chosen}.`
      );
    } else {
      setBeforeAfterFeedback(false);
      playTone(280, 'sawtooth', 0.3);
      speakText('गलत भयो, फेरि प्रयास गर्नुहोस्।', 'Try again.');
    }
  };

  // Switch Mode Setup
  useEffect(() => {
    if (activeMode === 'RIVER_CROSSING') {
      resetRiverCrossing();
    } else if (activeMode === 'ARRANGE_SEQUENCE') {
      setupArrangeRound(arrangeRound);
    } else if (activeMode === 'MISSING_NUMBERS') {
      setMissingSelected(null);
      setMissingFeedback(null);
      speakText('खाली ठाउँमा छुटेको सङ्ख्या छान्नुहोस्।', 'Select the missing number in the sequence.');
    } else if (activeMode === 'BEFORE_AFTER') {
      setBeforeAfterSelected(null);
      setBeforeAfterFeedback(null);
      speakText('सङ्ख्याको अघि वा पछि आउने सङ्ख्या पहिचान गर्नुहोस्।', 'Identify the number that comes before or after.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        color: '#f8fafc',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* HEADER / NAVIGATION BAR */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: 'rgba(2, 44, 34, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBackToLibrary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <ArrowLeft size={18} />
            <span>{language === 'np' ? 'फिर्ता (Library)' : 'Back to Library'}</span>
          </button>

          <div>
            <div style={{ fontSize: '11px', color: '#5eead4', textTransform: 'uppercase', fontWeight: 800 }}>
              कक्षा १ • गणित • अध्याय ४ : ९ सम्मका सङ्ख्याहरू
            </div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f0fdfa' }}>
              {language === 'np'
                ? 'सिमुलेसन ०५: सङ्ख्या क्रम मिलाऔँ (Number Sequence Adventure)'
                : 'Simulation 05: Number Sequence Adventure'}
            </h1>
          </div>
        </div>

        {/* CONTROLS: NOTATION, SOUND, LANGUAGE, STARS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Script Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '10px',
              padding: '3px',
              border: '1px solid rgba(45, 212, 191, 0.3)',
            }}
          >
            <button
              onClick={() => setScriptMode('np')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '8px',
                background: scriptMode === 'np' ? '#0d9488' : 'transparent',
                color: scriptMode === 'np' ? '#ffffff' : '#99f6e4',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              देवनागरी (१–९)
            </button>
            <button
              onClick={() => setScriptMode('en')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '8px',
                background: scriptMode === 'en' ? '#0d9488' : 'transparent',
                color: scriptMode === 'en' ? '#ffffff' : '#99f6e4',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              English (1–9)
            </button>
          </div>

          {/* Star Counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '6px 14px',
              borderRadius: '20px',
              color: '#fef08a',
              fontWeight: 800,
            }}
          >
            <Trophy size={16} color="#fbbf24" />
            <span>{stars} Stars</span>
          </div>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage((l) => (l === 'np' ? 'en' : 'np'))}
            style={{
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            {language === 'np' ? 'नेपाली | EN' : 'EN | नेपाली'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: soundEnabled ? '#5eead4' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* ACTIVITY MODE TABS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.5)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.2)',
          flexWrap: 'wrap',
        }}
      >
        {[
          {
            key: 'RIVER_CROSSING',
            np: '१. नदी तर्ने खेल (River Crossing)',
            en: '1. River Crossing',
            icon: '🌊',
          },
          {
            key: 'ARRANGE_SEQUENCE',
            np: '२. क्रम मिलाऔँ (Order 1 to 9)',
            en: '2. Order 1 to 9',
            icon: '🚂',
          },
          {
            key: 'MISSING_NUMBERS',
            np: '३. छुटेको सङ्ख्या (Missing Numbers)',
            en: '3. Missing Numbers',
            icon: '❓',
          },
          {
            key: 'BEFORE_AFTER',
            np: '४. अघि र पछिको सङ्ख्या (Before & After)',
            en: '4. Before & After',
            icon: '↔️',
          },
        ].map((tab) => {
          const isSelected = activeMode === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveMode(tab.key as ActivityMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                border: isSelected ? '2px solid #5eead4' : '1px solid rgba(255, 255, 255, 0.15)',
                background: isSelected ? 'rgba(13, 148, 136, 0.7)' : 'rgba(30, 41, 59, 0.6)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              <span>{language === 'np' ? tab.np : tab.en}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN ACTIVITY AREA */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* ======================================================== */}
        {/* MODE 1: RIVER CROSSING ADVENTURE                         */}
        {/* ======================================================== */}
        {activeMode === 'RIVER_CROSSING' && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {/* Instruction banner */}
            <div
              style={{
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '12px 24px',
                borderRadius: '16px',
                border: '1px solid rgba(45, 212, 191, 0.3)',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fef08a' }}>
                {language === 'np'
                  ? '१ देखि ९ सम्मका ढुङ्गाहरूमा टेकेर नदी पार गर्नुहोस्!'
                  : 'Step on the numbered stones 1 through 9 to cross the river!'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#a7f3d0' }}>
                {language === 'np'
                  ? `अब आउने सङ्ख्या: ${formatNum(currentStep + 1)} (${formatName(currentStep + 1)})`
                  : `Next stone to step on: ${currentStep + 1} (${formatName(currentStep + 1)})`}
              </p>
            </div>

            {/* River Visual Canvas with Stones */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '920px',
                height: '240px',
                background: 'linear-gradient(180deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
                borderRadius: '24px',
                border: '8px solid #064e3b',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
              }}
            >
              {/* Left Riverbank (Start) */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '60px',
                  background: '#15803d',
                  borderRight: '6px solid #854d0e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {characterPosition === 0 && (
                  <span style={{ fontSize: '36px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>
                    🧒
                  </span>
                )}
              </div>

              {/* 9 Stepping Stones in Line */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  width: '100%',
                  marginLeft: '60px',
                  marginRight: '60px',
                  zIndex: 2,
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stoneNum) => {
                  const isSteppedOn = stoneNum <= currentStep;
                  const hasCharacter = characterPosition === stoneNum;

                  return (
                    <div
                      key={stoneNum}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      {/* Character Hopping Avatar */}
                      {hasCharacter && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-42px',
                            fontSize: '34px',
                            animation: 'bounce 0.6s infinite alternate',
                            zIndex: 10,
                          }}
                        >
                          🧒
                        </div>
                      )}

                      {/* Stone */}
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: isSteppedOn
                            ? 'radial-gradient(circle at 35% 35%, #4ade80, #16a34a)'
                            : 'radial-gradient(circle at 35% 35%, #94a3b8, #475569)',
                          border: isSteppedOn ? '3px solid #86efac' : '3px solid #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                          transform: isSteppedOn ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.25s ease',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '24px',
                            fontWeight: 900,
                            color: isSteppedOn ? '#ffffff' : '#f8fafc',
                          }}
                        >
                          {formatNum(stoneNum)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Riverbank (Finish) */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '60px',
                  background: '#15803d',
                  borderLeft: '6px solid #854d0e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '28px' }}>🏁</span>
              </div>
            </div>

            {/* Stepping Choice Buttons */}
            {!crossingComplete ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  marginTop: '10px',
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fef08a' }}>
                  {language === 'np'
                    ? `अर्को ढुङ्गा छान्नुहोस् (सङ्ख्या ${formatNum(currentStep + 1)}):`
                    : `Pick the next stone (Number ${currentStep + 1}):`}
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  {shuffledStoneOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleRiverStoneClick(opt)}
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '22px',
                        background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                        border: '3px solid #5eead4',
                        color: '#ffffff',
                        fontSize: '36px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span>{formatNum(opt)}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.85 }}>
                        {formatName(opt)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Crossing Success */
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.25)',
                  border: '2px solid #34d399',
                  borderRadius: '20px',
                  padding: '20px 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  maxWidth: '650px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Trophy size={40} color="#fbbf24" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#f0fdf4' }}>
                      {language === 'np'
                        ? 'शानदार! नदी सफलतापूर्वक पार भयो!'
                        : 'Splendid! River crossed successfully!'}
                    </h3>
                    <span style={{ fontSize: '13px', color: '#a7f3d0' }}>
                      {language === 'np'
                        ? 'तपाईंले १ देखि ९ सम्मको क्रम बुझ्नुभयो।'
                        : 'You learned the sequence 1 to 9.'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={resetRiverCrossing}
                  style={{
                    background: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RotateCcw size={16} />
                  <span>{language === 'np' ? 'फेरि खेल्नुहोस्' : 'Play Again'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: ARRANGE SEQUENCE (१ देखि ९ सम्म मिलाऔँ)             */}
        {/* ======================================================== */}
        {activeMode === 'ARRANGE_SEQUENCE' && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            {/* Header with Round Selector */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                maxWidth: '750px',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fef08a' }}>
                  {language === 'np'
                    ? 'सङ्ख्याहरूलाई सानोदेखि ठुलो क्रममा मिलाऔँ'
                    : 'Arrange numbers in increasing order (1 to 9)'}
                </h2>
                <div style={{ fontSize: '13px', color: '#a7f3d0' }}>
                  {language === 'np'
                    ? 'तलका कार्डहरू छानेर क्रमबद्ध राख्नुहोस्।'
                    : 'Click cards below to put them in ascending sequence.'}
                </div>
              </div>

              {/* Round selector */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setArrangeRound(r);
                      setupArrangeRound(r);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: arrangeRound === r ? '2px solid #5eead4' : '1px solid rgba(255,255,255,0.2)',
                      background: arrangeRound === r ? '#0d9488' : 'rgba(0,0,0,0.3)',
                      color: '#ffffff',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {language === 'np' ? `चरण ${formatNum(r)}` : `Round ${r}`}
                  </button>
                ))}
              </div>
            </div>

            {/* PLACED SEQUENCE TRAIN / SLOTS */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding: '20px',
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '24px',
                border: '2px dashed rgba(45, 212, 191, 0.4)',
                minHeight: '110px',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                width: '100%',
                maxWidth: '850px',
              }}
            >
              {placedCards.length === 0 ? (
                <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '15px' }}>
                  {language === 'np'
                    ? '👇 तलबाट कार्डहरू छानेर यहाँ क्रममा राख्नुहोस्'
                    : '👇 Click cards below to place them in order here'}
                </div>
              ) : (
                placedCards.map((num, i) => (
                  <button
                    key={i}
                    onClick={() => handleRemovePlacedCard(num)}
                    title={language === 'np' ? 'हटाउन क्लिक गर्नुहोस्' : 'Click to remove'}
                    style={{
                      width: '64px',
                      height: '74px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #10b981, #047857)',
                      border: '2px solid #6ee7b7',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    }}
                  >
                    <span style={{ fontSize: '28px', fontWeight: 900 }}>{formatNum(num)}</span>
                    <span style={{ fontSize: '10px', opacity: 0.85 }}>{formatName(num)}</span>
                  </button>
                ))
              )}
            </div>

            {/* AVAILABLE SHUFFLED CARDS */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                maxWidth: '800px',
              }}
            >
              {availableCards.map((num) => (
                <button
                  key={num}
                  onClick={() => handlePickCard(num)}
                  style={{
                    width: '68px',
                    height: '80px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: '3px solid #93c5fd',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '32px', fontWeight: 900 }}>{formatNum(num)}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.9 }}>
                    {formatName(num)}
                  </span>
                </button>
              ))}
            </div>

            {/* SUCCESS BANNER */}
            {arrangeSuccess && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.25)',
                  border: '2px solid #34d399',
                  borderRadius: '20px',
                  padding: '16px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <Sparkles size={32} color="#fbbf24" />
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#f0fdf4' }}>
                  {language === 'np'
                    ? 'उत्तम काम! सबै सङ्ख्याहरू सही क्रममा छन्! (+२ ताराहरू)'
                    : 'Splendid! All numbers in proper increasing order! (+2 Stars)'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 3: MISSING NUMBERS IN SEQUENCE                      */}
        {/* ======================================================== */}
        {activeMode === 'MISSING_NUMBERS' && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fef08a' }}>
                {language === 'np'
                  ? 'खाली ठाउँमा छुटेको सङ्ख्या पत्ता लगाऔँ'
                  : 'Find the missing number in the sequence'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#a7f3d0' }}>
                {language === 'np'
                  ? `प्रश्न ${missingRoundIndex + 1} / ${missingChallenges.length}`
                  : `Question ${missingRoundIndex + 1} of ${missingChallenges.length}`}
              </p>
            </div>

            {/* Number Chain with Missing Blank */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 32px',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '24px',
                border: '2px solid rgba(45, 212, 191, 0.3)',
              }}
            >
              {missingChallenges[missingRoundIndex].sequence.map((item, idx) => {
                const isBlank = item === null;
                return (
                  <div
                    key={idx}
                    style={{
                      width: '74px',
                      height: '84px',
                      borderRadius: '18px',
                      background: isBlank
                        ? missingFeedback
                          ? '#10b981'
                          : '#f59e0b'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: isBlank ? '3px dashed #ffffff' : '2px solid rgba(255, 255, 255, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    }}
                  >
                    <span style={{ fontSize: '34px', fontWeight: 900 }}>
                      {isBlank ? (missingFeedback ? formatNum(missingSelected) : '?') : formatNum(item)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Choice Options */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {missingChallenges[missingRoundIndex].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleMissingChoice(opt)}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                    border: '3px solid #5eead4',
                    color: '#ffffff',
                    fontSize: '34px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span>{formatNum(opt)}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.85 }}>
                    {formatName(opt)}
                  </span>
                </button>
              ))}
            </div>

            {/* Next question button */}
            {missingFeedback !== null && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span
                  style={{
                    fontWeight: 800,
                    color: missingFeedback ? '#34d399' : '#f87171',
                    fontSize: '15px',
                  }}
                >
                  {missingFeedback
                    ? language === 'np'
                      ? 'सबास! सही जवाफ (+१ तारा)'
                      : 'Correct! (+1 Star)'
                    : language === 'np'
                    ? 'पुनः प्रयास गर्नुहोस्!'
                    : 'Try again!'}
                </span>

                {missingFeedback && missingRoundIndex < missingChallenges.length - 1 && (
                  <button
                    onClick={() => {
                      setMissingRoundIndex((i) => i + 1);
                      setMissingSelected(null);
                      setMissingFeedback(null);
                    }}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 4: BEFORE AND AFTER NUMBERS                         */}
        {/* ======================================================== */}
        {activeMode === 'BEFORE_AFTER' && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fef08a' }}>
                {language === 'np'
                  ? beforeAfterChallenges[beforeAfterIndex].type === 'AFTER'
                    ? `सङ्ख्या ${formatNum(beforeAfterChallenges[beforeAfterIndex].targetNum)} को पछि कुन सङ्ख्या आउँछ?`
                    : `सङ्ख्या ${formatNum(beforeAfterChallenges[beforeAfterIndex].targetNum)} को अघि कुन सङ्ख्या आउँछ?`
                  : beforeAfterChallenges[beforeAfterIndex].type === 'AFTER'
                  ? `Which number comes AFTER ${beforeAfterChallenges[beforeAfterIndex].targetNum}?`
                  : `Which number comes BEFORE ${beforeAfterChallenges[beforeAfterIndex].targetNum}?`}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#a7f3d0' }}>
                {language === 'np'
                  ? `प्रश्न ${beforeAfterIndex + 1} / ${beforeAfterChallenges.length}`
                  : `Question ${beforeAfterIndex + 1} of ${beforeAfterChallenges.length}`}
              </p>
            </div>

            {/* Target Display Box */}
            <div
              style={{
                width: '120px',
                height: '130px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: '4px solid #fef08a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ fontSize: '54px', fontWeight: 900, lineHeight: 1 }}>
                {formatNum(beforeAfterChallenges[beforeAfterIndex].targetNum)}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800 }}>
                {formatName(beforeAfterChallenges[beforeAfterIndex].targetNum)}
              </span>
            </div>

            {/* Choices */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {beforeAfterChallenges[beforeAfterIndex].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleBeforeAfterChoice(opt)}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                    border: '3px solid #5eead4',
                    color: '#ffffff',
                    fontSize: '34px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span>{formatNum(opt)}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.85 }}>
                    {formatName(opt)}
                  </span>
                </button>
              ))}
            </div>

            {/* Feedback and next */}
            {beforeAfterFeedback !== null && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span
                  style={{
                    fontWeight: 800,
                    color: beforeAfterFeedback ? '#34d399' : '#f87171',
                    fontSize: '15px',
                  }}
                >
                  {beforeAfterFeedback
                    ? language === 'np'
                      ? 'सबास! सही उत्तर (+१ तारा)'
                      : 'Splendid! Correct (+1 Star)'
                    : language === 'np'
                    ? 'पुनः प्रयास गर्नुहोस्!'
                    : 'Try again!'}
                </span>

                {beforeAfterFeedback && beforeAfterIndex < beforeAfterChallenges.length - 1 && (
                  <button
                    onClick={() => {
                      setBeforeAfterIndex((i) => i + 1);
                      setBeforeAfterSelected(null);
                      setBeforeAfterFeedback(null);
                    }}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default NumberSequenceSimulation;

