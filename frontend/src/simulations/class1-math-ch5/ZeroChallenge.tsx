/**
 * ZeroChallenge.tsx
 * Simulation 05: Zero Challenge (शून्यको खेल)
 * Class 1 Mathematics - Chapter 5: Zero (शून्य)
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
  Zap,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface ChallengeQuestion {
  level: number;
  titleNp: string;
  titleEn: string;
  promptNp: string;
  promptEn: string;
  options: { labelNp: string; labelEn: string; value: number; icon: string }[];
  correctValue: number;
  explanationNp: string;
  explanationEn: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

export const ZeroChallenge: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Navigation & Settings
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Progressive Levels: 1 to 5
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [levelScore, setLevelScore] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedVal, setSelectedVal] = useState<number | null>(null);
  const [challengeComplete, setChallengeComplete] = useState<boolean>(false);

  // Stars
  const [stars, setStars] = useState<number>(0);

  // Challenges pool (1 challenge per level)
  const challenges: ChallengeQuestion[] = [
    {
      level: 1,
      titleNp: 'तह १: खाली भाँडो पहिचान',
      titleEn: 'Level 1: Identify Empty Container',
      promptNp: 'कुन टोकरी खाली छ? (० वस्तु भएको छान्नुहोस्)',
      promptEn: 'Which basket is empty? (Select the one with 0 items)',
      options: [
        { labelNp: 'टोकरी क (३ स्याउ)', labelEn: 'Basket A (3)', value: 3, icon: '🍎🍎🍎' },
        { labelNp: 'टोकरी ख (खाली)', labelEn: 'Basket B (Empty)', value: 0, icon: '🧺' },
        { labelNp: 'टोकरी ग (१ स्याउ)', labelEn: 'Basket C (1)', value: 1, icon: '🍎' },
      ],
      correctValue: 0,
      explanationNp: 'टोकरी ख खाली छ, यसमा शून्य (०) स्याउ छन्।',
      explanationEn: 'Basket B is empty, containing zero (0) apples.',
    },
    {
      level: 2,
      titleNp: 'तह २: खाली र भरिएको तुलना',
      titleEn: 'Level 2: Compare Empty vs Occupied',
      promptNp: 'शून्य (०) फूल भएको गमला कुन हो?',
      promptEn: 'Which pot has zero (0) flowers?',
      options: [
        { labelNp: 'गमला क (खाली)', labelEn: 'Pot A (Empty)', value: 0, icon: '🪴' },
        { labelNp: 'गमला ख (४ फूल)', labelEn: 'Pot B (4)', value: 4, icon: '🌸🌸🌸🌸' },
      ],
      correctValue: 0,
      explanationNp: 'गमला क खाली छ, यसमा कुनै फूल छैन (० फूल)।',
      explanationEn: 'Pot A is empty, it has no flowers (0 flowers).',
    },
    {
      level: 3,
      titleNp: 'तह ३: दृश्यमा सङ्ख्या गणना',
      titleEn: 'Level 3: Count Objects in Scene',
      promptNp: 'यस खाली पोखरीमा कति वटा हाँस पौडिरहेका छन्?',
      promptEn: 'How many ducks are swimming in this empty pond?',
      options: [
        { labelNp: 'शून्य (०)', labelEn: 'Zero (0)', value: 0, icon: '🌊' },
        { labelNp: 'दुई (२)', labelEn: 'Two (2)', value: 2, icon: '🦆🦆' },
        { labelNp: 'चार (४)', labelEn: 'Four (4)', value: 4, icon: '🦆🦆🦆🦆' },
      ],
      correctValue: 0,
      explanationNp: 'पोखरीमा कुनै पनि हाँस छैन, त्यसैले शून्य (०) हाँस छन्।',
      explanationEn: 'There are no ducks in the pond, so the count is zero (0).',
    },
    {
      level: 4,
      titleNp: 'तह ४: वस्तु हटाएपछिको बाँकी',
      titleEn: 'Level 4: Remainder after Removal',
      promptNp: 'रुखमा २ वटा चरा थिए, ती दुवै उडेपछि कति चरा बाँकी रहन्छन्?',
      promptEn: 'There were 2 birds on a tree. After both fly away, how many birds remain?',
      options: [
        { labelNp: 'शून्य (०)', labelEn: 'Zero (0)', value: 0, icon: '🪵' },
        { labelNp: 'एक (१)', labelEn: 'One (1)', value: 1, icon: '🐦' },
        { labelNp: 'दुई (२)', labelEn: 'Two (2)', value: 2, icon: '🐦🐦' },
      ],
      correctValue: 0,
      explanationNp: 'दुवै चरा उडेपछि हाँगा खाली हुन्छ र शून्य (०) बाँकी रहन्छन्।',
      explanationEn: 'After both fly away, zero (0) birds remain.',
    },
    {
      level: 5,
      titleNp: 'तह ५: मिश्रित शून्य ज्ञान',
      titleEn: 'Level 5: Mixed Zero Mastery',
      promptNp: 'सङ्ख्या "०" ले के जनाउँछ?',
      promptEn: 'What does the numeral "0" represent?',
      options: [
        { labelNp: 'कुनै वस्तु नभएको (Empty / None)', labelEn: 'No objects (Empty / None)', value: 0, icon: '⭐' },
        { labelNp: 'धेरै वस्तु भएको (Many objects)', labelEn: 'Many objects', value: 9, icon: '🍎🍎🍎' },
        { labelNp: 'एक मात्र वस्तु (Only one)', labelEn: 'Only one', value: 1, icon: '🍎' },
      ],
      correctValue: 0,
      explanationNp: 'शून्य (०) ले कुनै समूहमा कुनै पनि वस्तु नभएको अवस्था जनाउँछ।',
      explanationEn: 'Zero (0) represents the absence of any objects in a group.',
    },
  ];

  const activeChallenge = challenges[currentLevel - 1];

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
  const saveProgress = async (finalStars: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH5-05/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, finalStars * 20),
          completionStatus: finalStars >= 5 ? 'COMPLETED' : 'IN_PROGRESS',
          timeSpentSeconds: 120,
          attemptsCount: 1,
          metadata: {
            stars: finalStars,
            level: currentLevel,
          },
        }),
      });
    } catch {
      // Ignore background errors
    }
  };

  // Select Answer
  const handleAnswer = (val: number) => {
    if (isAnswered) return;
    setSelectedVal(val);
    setIsAnswered(true);

    const isCorrect = val === activeChallenge.correctValue;
    if (isCorrect) {
      playTone(659.25, 'triangle', 0.4);
      setLevelScore((s) => s + 1);
      const ns = stars + 1;
      setStars(ns);
      speakText('सबास! ' + activeChallenge.explanationNp, 'Splendid! ' + activeChallenge.explanationEn);
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText('गलत भयो। ' + activeChallenge.explanationNp, 'Not quite. ' + activeChallenge.explanationEn);
    }
  };

  // Next Level
  const handleNextLevel = () => {
    if (currentLevel < challenges.length) {
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);
      setSelectedVal(null);
      setIsAnswered(false);
      speakText(challenges[nextLvl - 1].promptNp, challenges[nextLvl - 1].promptEn);
    } else {
      setChallengeComplete(true);
      playTone(880, 'sine', 0.6);
      saveProgress(stars);
      speakText(
        'शानदार! तपाईंले शून्य चुनौतीका सबै तहहरू पार गर्नुभयो!',
        'Splendid! You completed all levels of the Zero Challenge!'
      );
    }
  };

  useEffect(() => {
    speakText(
      'शून्यको खेल चुनौतीमा स्वागत छ! ५ तहका चुनौतीहरू पूरा गरौँ।',
      'Welcome to Zero Challenge! Let us conquer all 5 levels.'
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
              कक्षा १ • गणित • अध्याय ५ : शून्य (Zero)
            </div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f0fdfa' }}>
              {language === 'np'
                ? 'सिमुलेसन ०५: शून्यको खेल (Zero Challenge)'
                : 'Simulation 05: Zero Challenge'}
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
            <span>{stars} / 5 Stars</span>
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

      {/* LEVEL PROGRESS STEPPER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid rgba(129, 140, 248, 0.2)',
        }}
      >
        {challenges.map((c) => {
          const isCurrent = c.level === currentLevel;
          const isPassed = c.level < currentLevel;

          return (
            <div
              key={c.level}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '12px',
                background: isCurrent ? '#4f46e5' : isPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                border: isCurrent ? '2px solid #a5b4fc' : '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              <span>{isPassed ? '✓' : `तह ${formatNum(c.level)}`}</span>
            </div>
          );
        })}
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
          maxWidth: '750px',
          margin: '0 auto',
          width: '100%',
          gap: '24px',
        }}
      >
        {!challengeComplete ? (
          <div
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.85)',
              borderRadius: '24px',
              padding: '28px',
              border: '2px solid rgba(129, 140, 248, 0.4)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {/* Header Badge */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 800 }}>
                {language === 'np' ? activeChallenge.titleNp : activeChallenge.titleEn}
              </div>
              <h2 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 900, color: '#fef08a' }}>
                {language === 'np' ? activeChallenge.promptNp : activeChallenge.promptEn}
              </h2>
            </div>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {activeChallenge.options.map((opt) => {
                const isSelected = selectedVal === opt.value;
                const isCorrect = opt.value === activeChallenge.correctValue;

                return (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    disabled={isAnswered}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 24px',
                      borderRadius: '16px',
                      background:
                        isAnswered && isCorrect
                          ? 'rgba(16, 185, 129, 0.3)'
                          : isAnswered && isSelected
                          ? 'rgba(239, 68, 68, 0.3)'
                          : 'rgba(30, 41, 59, 0.8)',
                      border:
                        isAnswered && isCorrect
                          ? '2px solid #10b981'
                          : isAnswered && isSelected
                          ? '2px solid #ef4444'
                          : '2px solid rgba(129, 140, 248, 0.3)',
                      color: '#ffffff',
                      cursor: isAnswered ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '28px' }}>{opt.icon}</span>
                      <span style={{ fontSize: '16px', fontWeight: 800 }}>
                        {language === 'np' ? opt.labelNp : opt.labelEn}
                      </span>
                    </div>

                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#a5b4fc' }}>
                      {formatNum(opt.value)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next */}
            {isAnswered && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '14px', color: '#cbd5e1', textAlign: 'center' }}>
                  {language === 'np' ? activeChallenge.explanationNp : activeChallenge.explanationEn}
                </div>

                <button
                  onClick={handleNextLevel}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '12px',
                    background: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{language === 'np' ? 'अर्को तह' : 'Next Level'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Completion Trophy Banner */
          <div
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '24px',
              padding: '32px',
              border: '2px solid #10b981',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <Trophy size={54} color="#fbbf24" />
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#f0fdf4' }}>
              {language === 'np'
                ? 'शानदार! शून्य चुनौती सफलतापूर्वक पूरा भयो!'
                : 'Splendid! Zero Challenge Mastered!'}
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#a7f3d0' }}>
              {language === 'np'
                ? 'तपाईंले शून्य (०) को अवधारणा सम्पूर्ण रूपमा सिक्नुभयो।'
                : 'You have completely mastered the concept of Zero (0).'}
            </p>

            <button
              onClick={onBackToLibrary}
              style={{
                marginTop: '12px',
                padding: '12px 28px',
                borderRadius: '14px',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Award size={18} />
              <span>{language === 'np' ? 'लाइब्रेरी फिर्ता जानुहोस्' : 'Return to Library'}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ZeroChallenge;

