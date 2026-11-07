/**
 * MakeTenChallenge.tsx
 * Simulation 03: Make Ten Challenge (दश बनाऔँ)
 * Class 1 Mathematics - Chapter 6: Ten (दश)
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
  HelpCircle,
  Award,
  ArrowRightLeft,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दश'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

interface CombinationPair {
  a: number;
  b: number;
  nameNp: string;
  nameEn: string;
}

export const MakeTenChallenge: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Navigation & Settings
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Mode: 'EXPLORE_PAIRS' or 'SOLVE_PUZZLE'
  const [activeMode, setActiveMode] = useState<'EXPLORE_PAIRS' | 'SOLVE_PUZZLE'>('EXPLORE_PAIRS');

  // Interactive Two-Basket Distribution (a + b = 10)
  const [basketACount, setBasketACount] = useState<number>(5);
  const basketBCount = 10 - basketACount;

  // Stars
  const [stars, setStars] = useState<number>(0);

  // Puzzle Mode State
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const puzzles = [
    { givenA: 1, neededB: 9, options: [8, 9, 7], icon: '🍎' },
    { givenA: 2, neededB: 8, options: [7, 8, 9], icon: '🌸' },
    { givenA: 3, neededB: 7, options: [6, 7, 8], icon: '🎈' },
    { givenA: 4, neededB: 6, options: [5, 6, 7], icon: '🥭' },
    { givenA: 5, neededB: 5, options: [4, 5, 6], icon: '⭐' },
    { givenA: 8, neededB: 2, options: [1, 2, 3], icon: '🍄' },
    { givenA: 7, neededB: 3, options: [2, 3, 4], icon: '🦋' },
  ];
  const [selectedPuzzleChoice, setSelectedPuzzleChoice] = useState<number | null>(null);
  const [puzzleFeedback, setPuzzleFeedback] = useState<boolean | null>(null);

  // Helper formatting
  const formatNum = (n: number): string => (language === 'np' ? NEP_DIGITS[n] : n.toString());
  const formatName = (n: number): string => (language === 'np' ? NEP_NAMES[n] : EN_NAMES[n]);

  // Audio Speech Synthesis
  const speakText = useCallback((npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }, [language, soundEnabled]);

  // Tone Synthesis
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

  // Save Progress API
  const saveProgress = async (newStars: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH6-03/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, newStars * 15),
          completionStatus: newStars >= 6 ? 'COMPLETED' : 'IN_PROGRESS',
          timeSpentSeconds: 150,
          attemptsCount: 1,
          metadata: {
            stars: newStars,
            mode: activeMode,
          },
        }),
      });
    } catch {
      // Ignore background errors
    }
  };

  // Transfer item from A to B or vice-versa
  const handleShiftToB = () => {
    if (basketACount > 0) {
      const nextA = basketACount - 1;
      setBasketACount(nextA);
      playTone(450 + nextA * 30, 'triangle', 0.2);
      speakText(
        `टोकरी १ मा ${formatNum(nextA)}, टोकरी २ मा ${formatNum(10 - nextA)}, जम्मा १०`,
        `Basket 1 has ${nextA}, Basket 2 has ${10 - nextA}, Total is 10`
      );
    }
  };

  const handleShiftToA = () => {
    if (basketACount < 10) {
      const nextA = basketACount + 1;
      setBasketACount(nextA);
      playTone(450 + nextA * 30, 'triangle', 0.2);
      speakText(
        `टोकरी १ मा ${formatNum(nextA)}, टोकरी २ मा ${formatNum(10 - nextA)}, जम्मा १०`,
        `Basket 1 has ${nextA}, Basket 2 has ${10 - nextA}, Total is 10`
      );
    }
  };

  // Preset Combination Shortcut
  const handlePresetPair = (a: number) => {
    setBasketACount(a);
    playTone(659.25, 'triangle', 0.3);
    speakText(
      `${formatNum(a)} र ${formatNum(10 - a)} मिलेर १० बन्छ।`,
      `${a} and ${10 - a} together make 10.`
    );
  };

  // Puzzle Choice Handler
  const handlePuzzleSelect = (choice: number) => {
    const p = puzzles[puzzleIndex];
    setSelectedPuzzleChoice(choice);
    const isCorrect = choice === p.neededB;
    setPuzzleFeedback(isCorrect);

    if (isCorrect) {
      playTone(659.25, 'triangle', 0.4);
      const ns = stars + 1;
      setStars(ns);
      saveProgress(ns);
      speakText(
        `सबास! ${formatNum(p.givenA)} र ${formatNum(choice)} मिलेर १० हुन्छ!`,
        `Splendid! ${p.givenA} and ${choice} together make 10!`
      );
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText('गलत भयो, फेरि सोच्नुहोस्।', 'Incorrect, please think again.');
    }
  };

  const handleNextPuzzle = () => {
    if (puzzleIndex < puzzles.length - 1) {
      const nextIdx = puzzleIndex + 1;
      setPuzzleIndex(nextIdx);
      setSelectedPuzzleChoice(null);
      setPuzzleFeedback(null);
    }
  };

  useEffect(() => {
    speakText(
      'दश बनाऔँ सिमुलेसनमा स्वागत छ! दुई समूहका वस्तुहरू जोडेर १० बनाउने तरिका सिकौँ।',
      'Welcome to Make Ten Challenge! Learn how two groups of objects combine to make 10.'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
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
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(129, 140, 248, 0.3)',
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
            <div style={{ fontSize: '11px', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 800 }}>
              कक्षा १ • गणित • अध्याय ६ : दश (Ten)
            </div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f0fdfa' }}>
              {language === 'np'
                ? 'सिमुलेसन ०३: दश बनाऔँ (Make Ten Challenge)'
                : 'Simulation 03: Make Ten Challenge'}
            </h1>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: soundEnabled ? '#a5b4fc' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* MODE TABS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.5)',
          borderBottom: '1px solid rgba(129, 140, 248, 0.2)',
        }}
      >
        <button
          onClick={() => setActiveMode('EXPLORE_PAIRS')}
          style={{
            padding: '8px 20px',
            borderRadius: '12px',
            border: activeMode === 'EXPLORE_PAIRS' ? '2px solid #a5b4fc' : '1px solid rgba(255, 255, 255, 0.15)',
            background: activeMode === 'EXPLORE_PAIRS' ? 'rgba(79, 70, 229, 0.8)' : 'rgba(30, 41, 59, 0.6)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          {language === 'np' ? '१. दुई समूहमा बाँडौँ (Distribute Ten)' : '1. Distribute Ten'}
        </button>

        <button
          onClick={() => setActiveMode('SOLVE_PUZZLE')}
          style={{
            padding: '8px 20px',
            borderRadius: '12px',
            border: activeMode === 'SOLVE_PUZZLE' ? '2px solid #a5b4fc' : '1px solid rgba(255, 255, 255, 0.15)',
            background: activeMode === 'SOLVE_PUZZLE' ? 'rgba(79, 70, 229, 0.8)' : 'rgba(30, 41, 59, 0.6)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          {language === 'np' ? '२. १० बनाउने खेल (Make Ten Quiz)' : '2. Make Ten Quiz'}
        </button>
      </div>

      {/* MAIN WORKSPACE */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%',
          gap: '24px',
        }}
      >
        {/* ======================================================== */}
        {/* MODE 1: INTERACTIVE TWO-BASKET DISTRIBUTOR               */}
        {/* ======================================================== */}
        {activeMode === 'EXPLORE_PAIRS' && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            {/* Title / Formula banner */}
            <div
              style={{
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.75)',
                padding: '16px 32px',
                borderRadius: '20px',
                border: '2px solid rgba(129, 140, 248, 0.4)',
              }}
            >
              <div style={{ fontSize: '13px', color: '#a5b4fc', fontWeight: 800 }}>
                {language === 'np' ? 'दश बनाउने जोड (Combinations that make 10)' : 'Combinations of 10'}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#facc15', marginTop: '4px' }}>
                {formatNum(basketACount)} + {formatNum(basketBCount)} = {formatNum(10)}
              </div>
              <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>
                {language === 'np'
                  ? `${formatName(basketACount)} र ${formatName(basketBCount)} मिलेर दश हुन्छ।`
                  : `${formatName(basketACount)} and ${formatName(basketBCount)} make Ten.`}
              </div>
            </div>

            {/* Two Baskets Container */}
            <div style={{ display: 'flex', gap: '24px', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              {/* Basket A */}
              <div
                style={{
                  width: '320px',
                  height: '240px',
                  borderRadius: '24px',
                  background: 'rgba(30, 41, 59, 0.85)',
                  border: '3px solid #38bdf8',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
                  {language === 'np' ? `टोकरी १: ${formatNum(basketACount)} स्याउ` : `Basket 1: ${basketACount} Apples`}
                </div>

                {/* Apples inside Basket A */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Array.from({ length: basketACount }).map((_, i) => (
                    <span key={i} style={{ fontSize: '28px' }}>
                      🍎
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: '24px', fontWeight: 900, color: '#fef08a' }}>
                  {formatNum(basketACount)}
                </div>
              </div>

              {/* Transfer Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleShiftToB}
                  disabled={basketACount === 0}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '14px',
                    background: '#4f46e5',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: basketACount === 0 ? 'not-allowed' : 'pointer',
                    opacity: basketACount === 0 ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title={language === 'np' ? '१ स्याउ दायाँ सार्नुहोस्' : 'Move 1 Apple Right'}
                >
                  <span>→</span>
                </button>

                <button
                  onClick={handleShiftToA}
                  disabled={basketBCount === 0}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '14px',
                    background: '#4f46e5',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: basketBCount === 0 ? 'not-allowed' : 'pointer',
                    opacity: basketBCount === 0 ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title={language === 'np' ? '१ स्याउ बायाँ सार्नुहोस्' : 'Move 1 Apple Left'}
                >
                  <span>←</span>
                </button>
              </div>

              {/* Basket B */}
              <div
                style={{
                  width: '320px',
                  height: '240px',
                  borderRadius: '24px',
                  background: 'rgba(30, 41, 59, 0.85)',
                  border: '3px solid #f472b6',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#f472b6' }}>
                  {language === 'np' ? `टोकरी २: ${formatNum(basketBCount)} स्याउ` : `Basket 2: ${basketBCount} Apples`}
                </div>

                {/* Apples inside Basket B */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Array.from({ length: basketBCount }).map((_, i) => (
                    <span key={i} style={{ fontSize: '28px' }}>
                      🍎
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: '24px', fontWeight: 900, color: '#fef08a' }}>
                  {formatNum(basketBCount)}
                </div>
              </div>
            </div>

            {/* Quick Combination Presets Strip */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { a: 1, label: '१ + ९' },
                { a: 2, label: '२ + ८' },
                { a: 3, label: '३ + ७' },
                { a: 4, label: '४ + ६' },
                { a: 5, label: '५ + ५' },
                { a: 6, label: '६ + ४' },
                { a: 7, label: '७ + ३' },
                { a: 8, label: '८ + २' },
                { a: 9, label: '९ + १' },
              ].map((p) => (
                <button
                  key={p.a}
                  onClick={() => handlePresetPair(p.a)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: basketACount === p.a ? '#059669' : 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: SOLVE MAKE TEN QUIZ                              */}
        {/* ======================================================== */}
        {activeMode === 'SOLVE_PUZZLE' && (
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
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#fef08a' }}>
                {language === 'np'
                  ? `${formatNum(puzzles[puzzleIndex].givenA)} मा कति जोड्दा १० हुन्छ?`
                  : `What number added to ${puzzles[puzzleIndex].givenA} makes 10?`}
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#a5b4fc' }}>
                {language === 'np'
                  ? `प्रश्न ${puzzleIndex + 1} / ${puzzles.length}`
                  : `Question ${puzzleIndex + 1} of ${puzzles.length}`}
              </p>
            </div>

            {/* Visual Formula Display */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'rgba(30, 41, 59, 0.8)',
                padding: '20px 32px',
                borderRadius: '20px',
                border: '2px solid rgba(129, 140, 248, 0.4)',
              }}
            >
              <span style={{ fontSize: '42px', fontWeight: 900, color: '#38bdf8' }}>
                {formatNum(puzzles[puzzleIndex].givenA)}
              </span>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff' }}>+</span>
              <span
                style={{
                  fontSize: '42px',
                  fontWeight: 900,
                  color: selectedPuzzleChoice !== null ? '#facc15' : '#94a3b8',
                  borderBottom: '3px dashed #facc15',
                  minWidth: '50px',
                  textAlign: 'center',
                }}
              >
                {selectedPuzzleChoice !== null ? formatNum(selectedPuzzleChoice) : '?'}
              </span>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff' }}>=</span>
              <span style={{ fontSize: '42px', fontWeight: 900, color: '#22c55e' }}>
                {formatNum(10)}
              </span>
            </div>

            {/* Multiple Choice Options */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {puzzles[puzzleIndex].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handlePuzzleSelect(opt)}
                  disabled={selectedPuzzleChoice !== null}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '20px',
                    background:
                      selectedPuzzleChoice === opt
                        ? opt === puzzles[puzzleIndex].neededB
                          ? '#10b981'
                          : '#ef4444'
                        : 'rgba(30, 41, 59, 0.85)',
                    border: '2px solid rgba(129, 140, 248, 0.4)',
                    color: '#ffffff',
                    fontSize: '34px',
                    fontWeight: 900,
                    cursor: selectedPuzzleChoice !== null ? 'default' : 'pointer',
                  }}
                >
                  {formatNum(opt)}
                </button>
              ))}
            </div>

            {puzzleFeedback !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  style={{
                    fontWeight: 800,
                    color: puzzleFeedback ? '#34d399' : '#f87171',
                    fontSize: '15px',
                  }}
                >
                  {puzzleFeedback
                    ? language === 'np'
                      ? 'शानदार! सही उत्तर (+१ तारा)'
                      : 'Splendid! Correct (+1 Star)'
                    : language === 'np'
                    ? 'पुनः प्रयास गर्नुहोस्!'
                    : 'Try again!'}
                </span>

                {puzzleFeedback && puzzleIndex < puzzles.length - 1 && (
                  <button
                    onClick={handleNextPuzzle}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}
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

export default MakeTenChallenge;

