/**
 * ManyFewAdventure.tsx
 * Simulation 01: Many and Few Adventure (धेरै र थोरै चिनौँ)
 * Class 1 Mathematics - Chapter 4: Numbers up to 9 (९ सम्मका सङ्ख्याहरू)
 * Based on Nepal CDC Curriculum (मेरो गणित, कक्षा १ - २०७६)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Maximize2,
  Scale,
  ShoppingBasket,
} from 'lucide-react';
import { ManyFewEnvironment } from './ManyFewEnvironment';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

type QuestionMode = 'find_many' | 'find_few';

interface LevelRound {
  countA: number;
  countB: number;
  itemType: 'apple' | 'mango' | 'flower' | 'ball';
  itemTypeNp: string;
  itemTypeEn: string;
  mode: QuestionMode;
}

export const ManyFewAdventure: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const envRef = useRef<ManyFewEnvironment | null>(null);

  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Levels: 1 (Intro), 2 (Compare Pairs), 3 (Count & Compare), 4 (Challenge), 5 (Assessment)
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [roundIdx, setRoundIdx] = useState<number>(0);
  const [stars, setStars] = useState(0);

  // Feedback State
  const [feedback, setFeedback] = useState<{ isSuccess: boolean; textNp: string; textEn: string } | null>(null);

  // Rounds for Level 1, 2, 3
  const levelRounds: LevelRound[] = [
    { countA: 3, countB: 7, itemType: 'apple', itemTypeNp: 'स्याउ', itemTypeEn: 'Apples', mode: 'find_many' },
    { countA: 6, countB: 2, itemType: 'apple', itemTypeNp: 'स्याउ', itemTypeEn: 'Apples', mode: 'find_few' },
    { countA: 2, countB: 8, itemType: 'mango', itemTypeNp: 'आँप', itemTypeEn: 'Mangoes', mode: 'find_many' },
    { countA: 7, countB: 3, itemType: 'mango', itemTypeNp: 'आँप', itemTypeEn: 'Mangoes', mode: 'find_few' },
    { countA: 4, countB: 9, itemType: 'flower', itemTypeNp: 'फूल', itemTypeEn: 'Flowers', mode: 'find_many' },
    { countA: 8, countB: 2, itemType: 'ball', itemTypeNp: 'बल', itemTypeEn: 'Balls', mode: 'find_few' },
  ];

  const currentRound = levelRounds[roundIdx % levelRounds.length];

  // Assessment State (15 Questions)
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [assessmentFinished, setAssessmentFinished] = useState(false);

  // Audio speech
  const speakText = (npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const playTone = (type: 'success' | 'error' | 'click') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          g.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + idx * 0.1 + 0.3);
          o.start(ctx.currentTime + idx * 0.1);
          o.stop(ctx.currentTime + idx * 0.1 + 0.3);
        });
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(480, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {}
  };

  // Mount 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const env = new ManyFewEnvironment(mountRef.current);
    envRef.current = env;
    env.populateBaskets(currentRound.countA, currentRound.countB, currentRound.itemType);

    return () => {
      env.destroy();
      envRef.current = null;
    };
  }, []);

  // Update baskets on round change
  useEffect(() => {
    setFeedback(null);
    if (envRef.current) {
      envRef.current.populateBaskets(currentRound.countA, currentRound.countB, currentRound.itemType);
    }

    if (currentLevel < 5) {
      const modeNp = currentRound.mode === 'find_many' ? 'धेरै (Many)' : 'थोरै (Few)';
      const modeEn = currentRound.mode === 'find_many' ? 'MANY' : 'FEW';
      const promptNp = `कुन बाकसमा ${modeNp} ${currentRound.itemTypeNp} छन्? छान्नुहोस्!`;
      const promptEn = `Which basket has ${modeEn} ${currentRound.itemTypeEn}? Click it!`;
      speakText(promptNp, promptEn);
    }
  }, [roundIdx, currentLevel, language]);

  // Click on Basket handler
  const handleBasketClick = (selectedBasket: 'A' | 'B') => {
    const isBasketAMany = currentRound.countA > currentRound.countB;
    const targetIsA =
      currentRound.mode === 'find_many' ? isBasketAMany : !isBasketAMany;

    const isCorrect = selectedBasket === (targetIsA ? 'A' : 'B');

    if (isCorrect) {
      playTone('success');
      setStars((s) => s + 2);
      const chosenCount = selectedBasket === 'A' ? currentRound.countA : currentRound.countB;
      const otherCount = selectedBasket === 'A' ? currentRound.countB : currentRound.countA;
      const wordNp = currentRound.mode === 'find_many' ? 'धेरै' : 'थोरै';
      const wordEn = currentRound.mode === 'find_many' ? 'more' : 'fewer';

      setFeedback({
        isSuccess: true,
        textNp: `स्याबास! बाकस ${selectedBasket} मा ${chosenCount} वटा छन्, जुन अर्को बाकसको (${otherCount}) भन्दा ${wordNp} हो!`,
        textEn: `Great job! Basket ${selectedBasket} has ${chosenCount}, which is ${wordEn} than ${otherCount}!`,
      });

      speakText(
        `स्याबास! यो बाकसमा ${wordNp} छ।`,
        `Splendid! This basket has ${wordEn}.`
      );
    } else {
      playTone('error');
      const targetWordNp = currentRound.mode === 'find_many' ? 'धेरै' : 'थोरै';
      const targetWordEn = currentRound.mode === 'find_many' ? 'more' : 'fewer';

      setFeedback({
        isSuccess: false,
        textNp: `यो मिलेन। हामीले ${targetWordNp} भएको बाकस खोज्दै छौँ। गनेर हेर्नुहोस्!`,
        textEn: `Not quite. We are looking for the basket with ${targetWordEn} items. Try counting!`,
      });
      speakText('पुनः प्रयास गर्नुहोस्', 'Try again');
    }
  };

  // Next round
  const handleNextRound = () => {
    setRoundIdx((idx) => idx + 1);
  };

  // 15 Comprehensive Assessment Questions
  const assessmentQuestions = [
    {
      qNp: '१. धेरै र थोरैमा कुन शब्दले बढी सङ्ख्या जनाउँछ?',
      qEn: '1. Which word means a larger quantity?',
      options: [
        { np: 'धेरै (Many)', en: 'Many', isCorrect: true },
        { np: 'थोरै (Few)', en: 'Few', isCorrect: false },
      ],
    },
    {
      qNp: '२. ३ वटा स्याउ र ७ वटा स्याउमा कुन धेरै हो?',
      qEn: '2. Between 3 apples and 7 apples, which is many?',
      options: [
        { np: '७ वटा स्याउ (7 Apples)', en: '7 Apples', isCorrect: true },
        { np: '३ वटा स्याउ (3 Apples)', en: '3 Apples', isCorrect: false },
      ],
    },
    {
      qNp: '३. ५ वटा चरा र २ वटा चरामा कुन थोरै हो?',
      qEn: '3. Between 5 birds and 2 birds, which is few?',
      options: [
        { np: '२ वटा चरा (2 Birds)', en: '2 Birds', isCorrect: true },
        { np: '५ वटा चरा (5 Birds)', en: '5 Birds', isCorrect: false },
      ],
    },
    {
      qNp: '४. सङ्ख्या १ लाई नेपाली अक्षरमा कसरी लेखिन्छ?',
      qEn: '4. How is the number 1 written in Nepali words?',
      options: [
        { np: 'एक (Ek)', en: 'Ek', isCorrect: true },
        { np: 'दुई (Dui)', en: 'Dui', isCorrect: false },
        { np: 'तीन (Teen)', en: 'Teen', isCorrect: false },
      ],
    },
    {
      qNp: '५. सङ्ख्या ४ लाई अङ्ग्रेजी अक्षरमा के भनिन्छ?',
      qEn: '5. What is the English name for numeral 4?',
      options: [
        { np: 'Four', en: 'Four', isCorrect: true },
        { np: 'Five', en: 'Five', isCorrect: false },
        { np: 'Three', en: 'Three', isCorrect: false },
      ],
    },
    {
      qNp: '६. ५ भन्दा पछि आउने सङ्ख्या कुन हो?',
      qEn: '6. Which number comes immediately after 5?',
      options: [
        { np: '६ (Six)', en: '6 (Six)', isCorrect: true },
        { np: '४ (Four)', en: '4 (Four)', isCorrect: false },
        { np: '७ (Seven)', en: '7 (Seven)', isCorrect: false },
      ],
    },
    {
      qNp: '७. ८ भन्दा अगाडि आउने सङ्ख्या कुन हो?',
      qEn: '7. Which number comes immediately before 8?',
      options: [
        { np: '७ (Seven)', en: '7 (Seven)', isCorrect: true },
        { np: '९ (Nine)', en: '9 (Nine)', isCorrect: false },
        { np: '६ (Six)', en: '6 (Six)', isCorrect: false },
      ],
    },
    {
      qNp: '८. १, २, __, ४ मा छुटेको सङ्ख्या कुन हो?',
      qEn: '8. Fill the missing number: 1, 2, __, 4',
      options: [
        { np: '३ (Three)', en: '3 (Three)', isCorrect: true },
        { np: '५ (Five)', en: '5 (Five)', isCorrect: false },
        { np: '२ (Two)', en: '2 (Two)', isCorrect: false },
      ],
    },
    {
      qNp: '९. ६, __, ८ मा छुटेको सङ्ख्या कुन हो?',
      qEn: '9. Fill the missing number: 6, __, 8',
      options: [
        { np: '७ (Seven)', en: '7 (Seven)', isCorrect: true },
        { np: '५ (Five)', en: '5 (Five)', isCorrect: false },
        { np: '९ (Nine)', en: '9 (Nine)', isCorrect: false },
      ],
    },
    {
      qNp: '१०. अङ्क ९ लाई नेपालीमा कसरी लेखिन्छ?',
      qEn: '10. What is the Devanagari numeral for 9?',
      options: [
        { np: '९', en: '९', isCorrect: true },
        { np: '६', en: '६', isCorrect: false },
        { np: '८', en: '८', isCorrect: false },
      ],
    },
    {
      qNp: '११. एक हप्तामा कति दिन हुन्छन्?',
      qEn: '11. How many days are there in a week?',
      options: [
        { np: '७ (सात)', en: '7 (Seven)', isCorrect: true },
        { np: '५ (पाँच)', en: '5 (Five)', isCorrect: false },
        { np: '९ (नौ)', en: '9 (Nine)', isCorrect: false },
      ],
    },
    {
      qNp: '१२. हातका औँलाहरू (एउटा हातमा) कतिवटा हुन्छन्?',
      qEn: '12. How many fingers on one hand?',
      options: [
        { np: '५ (पाँच)', en: '5 (Five)', isCorrect: true },
        { np: '४ (चार)', en: '4 (Four)', isCorrect: false },
        { np: '६ (छ)', en: '6 (Six)', isCorrect: false },
      ],
    },
    {
      qNp: '१३. ९ र ३ मा कुन थोरै हो?',
      qEn: '13. Between 9 and 3, which is fewer?',
      options: [
        { np: '३ (थोरै)', en: '3 (Few)', isCorrect: true },
        { np: '९ (धेरै)', en: '9 (Many)', isCorrect: false },
      ],
    },
    {
      qNp: '१४. नेपाली अक्षर "नौ" कुन अङ्कको नाम हो?',
      qEn: '14. What numeral is represented by Nepali name "Nau" (नौ)?',
      options: [
        { np: '९ (Nine)', en: '9', isCorrect: true },
        { np: '६ (Six)', en: '6', isCorrect: false },
        { np: '७ (Seven)', en: '7', isCorrect: false },
      ],
    },
    {
      qNp: '१५. १ देखि ९ सम्मको क्रममा सबैभन्दा पहिलो सङ्ख्या कुन हो?',
      qEn: '15. Which is the first number in the sequence 1 to 9?',
      options: [
        { np: '१ (One)', en: '1', isCorrect: true },
        { np: '९ (Nine)', en: '9', isCorrect: false },
        { np: '० (Zero)', en: '0', isCorrect: false },
      ],
    },
  ];

  const handleAssessmentAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      playTone('success');
      setAssessmentScore((s) => s + 1);
    } else {
      playTone('error');
    }

    if (assessmentIndex + 1 < assessmentQuestions.length) {
      setAssessmentIndex((idx) => idx + 1);
    } else {
      setAssessmentFinished(true);
      saveFinalProgress(assessmentScore + (isCorrect ? 1 : 0));
    }
  };

  const saveFinalProgress = async (finalScore: number) => {
    const percentage = Math.round((finalScore / assessmentQuestions.length) * 100);
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH4-01/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentScore: finalScore,
          totalQuestions: assessmentQuestions.length,
          percentage,
          completedLevels: [1, 2, 3, 4, 5],
          timeSpentSeconds: 160,
          isCompleted: percentage >= 60,
        }),
      });
    } catch (e) {}
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Fredoka', 'Mukta', 'Segoe UI', sans-serif",
        color: '#ffffff',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBackToLibrary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '12px',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} /> {language === 'np' ? 'फर्कनुहोस्' : 'Library'}
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fbbf24' }}>
              {language === 'np' ? 'धेरै र थोरै चिनौँ (Many and Few Adventure)' : 'Many and Few Adventure'}
            </h1>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
              {language === 'np'
                ? 'कक्षा १ गणित • अध्याय ४: ९ सम्मका सङ्ख्याहरू (Numbers up to 9)'
                : 'Class 1 Math • Chapter 4: Numbers up to 9'}
            </span>
          </div>
        </div>

        {/* Level pills & tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              background: '#fef3c7',
              color: '#b45309',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Trophy size={16} color="#d97706" /> {stars} {language === 'np' ? 'तारा' : 'Stars'}
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '3px' }}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setCurrentLevel(lvl);
                  playTone('click');
                }}
                style={{
                  background: currentLevel === lvl ? '#f59e0b' : 'transparent',
                  color: currentLevel === lvl ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {lvl === 5 ? (language === 'np' ? 'जाँच' : 'Quiz') : `${language === 'np' ? 'तह' : 'Lvl'} ${lvl}`}
              </button>
            ))}
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'np' ? 'en' : 'np')}
            style={{
              background: '#ede9fe',
              color: '#6d28d9',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {language === 'np' ? 'English' : 'नेपाली'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: soundEnabled ? '#dcfce7' : '#fee2e2',
              color: soundEnabled ? '#15803d' : '#b91c1c',
              border: 'none',
              padding: '8px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: currentLevel === 5 ? '1fr' : '360px 1fr',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left Instruction & Control Panel */}
        {currentLevel < 5 && (
          <aside
            style={{
              background: '#1e293b',
              borderRight: '1px solid #334155',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 20,
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Mission Card */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid #334155',
                  padding: '16px',
                  borderRadius: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Scale size={20} color="#fbbf24" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fbbf24' }}>
                    {language === 'np' ? 'धेरै र थोरै तुलना' : 'Many vs Few Challenge'}
                  </h3>
                </div>

                <div
                  style={{
                    background: currentRound.mode === 'find_many' ? '#fef3c7' : '#e0f2fe',
                    color: currentRound.mode === 'find_many' ? '#b45309' : '#0369a1',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '13px',
                    marginBottom: '10px',
                  }}
                >
                  🎯 {currentRound.mode === 'find_many'
                    ? (language === 'np' ? 'धेरै (MANY) भएको बाकस खोज्नुहोस्!' : 'Find the basket with MANY!')
                    : (language === 'np' ? 'थोरै (FEW) भएको बाकस खोज्नुहोस्!' : 'Find the basket with FEW!')}
                </div>

                <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {language === 'np'
                    ? `दुवै बाकसमा भएका ${currentRound.itemTypeNp}लाई हेर्नुहोस्। कुनमा धेरै र कुनमा थोरै छन् तुलना गर्नुहोस्।`
                    : `Observe the ${currentRound.itemTypeEn} in both baskets. Compare which has more and which has fewer.`}
                </p>
              </div>

              {/* Baskets Selection Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8' }}>
                  {language === 'np' ? 'बाकस छान्नुहोस् (Pick a Basket):' : 'Select Basket:'}
                </span>

                <button
                  onClick={() => handleBasketClick('A')}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px rgba(2,132,199,0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingBasket size={22} />
                    <span>{language === 'np' ? 'देब्रे बाकस क (Basket A)' : 'Left Basket A'}</span>
                  </div>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '13px' }}>
                    {currentRound.countA}
                  </span>
                </button>

                <button
                  onClick={() => handleBasketClick('B')}
                  style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px rgba(217,119,6,0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingBasket size={22} />
                    <span>{language === 'np' ? 'दाहिने बाकस ख (Basket B)' : 'Right Basket B'}</span>
                  </div>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '13px' }}>
                    {currentRound.countB}
                  </span>
                </button>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  style={{
                    background: feedback.isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: feedback.isSuccess ? '1px solid #10b981' : '1px solid #ef4444',
                    padding: '14px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {feedback.isSuccess ? <CheckCircle2 size={24} color="#10b981" /> : <XCircle size={24} color="#ef4444" />}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                    {language === 'np' ? feedback.textNp : feedback.textEn}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button
                onClick={() => speakText('धेरै भनेको बढी सङ्ख्या र थोरै भनेको कम सङ्ख्या हो।', 'Many means more quantity, and few means less quantity.')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid #334155',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <Volume2 size={14} /> {language === 'np' ? 'सुन्नुहोस्' : 'Listen Rule'}
              </button>

              <button
                onClick={handleNextRound}
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {language === 'np' ? 'अर्को जोडी' : 'Next Pair'} <ChevronRight size={16} />
              </button>
            </div>
          </aside>
        )}

        {/* 3D Canvas Area (Levels 1-4) */}
        {currentLevel < 5 && (
          <div
            ref={mountRef}
            onClick={(e) => {
              if (!envRef.current) return;
              const hit = envRef.current.raycastBasket(e.clientX, e.clientY);
              if (hit) handleBasketClick(hit);
            }}
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            {/* Basket labels over 3D space */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '25%',
                transform: 'translateX(-50%)',
                background: 'rgba(2, 132, 199, 0.9)',
                color: '#ffffff',
                padding: '6px 16px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '14px',
                pointerEvents: 'none',
              }}
            >
              {language === 'np' ? 'बाकस क (Basket A)' : 'Basket A'}
            </div>

            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '25%',
                transform: 'translateX(50%)',
                background: 'rgba(217, 119, 6, 0.9)',
                color: '#ffffff',
                padding: '6px 16px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '14px',
                pointerEvents: 'none',
              }}
            >
              {language === 'np' ? 'बाकस ख (Basket B)' : 'Basket B'}
            </div>
          </div>
        )}

        {/* Level 5: Final Assessment */}
        {currentLevel === 5 && (
          <div
            style={{
              maxWidth: '780px',
              width: '100%',
              margin: '32px auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {!assessmentFinished ? (
              <div
                style={{
                  background: '#1e293b',
                  borderRadius: '24px',
                  padding: '36px',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                  border: '1px solid #334155',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24' }}>
                    {language === 'np'
                      ? `प्रश्न ${assessmentIndex + 1} / ${assessmentQuestions.length}`
                      : `Question ${assessmentIndex + 1} of ${assessmentQuestions.length}`}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b' }}>
                    {language === 'np' ? `अङ्क: ${assessmentScore}` : `Score: ${assessmentScore}`}
                  </span>
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '24px', lineHeight: 1.4 }}>
                  {language === 'np'
                    ? assessmentQuestions[assessmentIndex].qNp
                    : assessmentQuestions[assessmentIndex].qEn}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {assessmentQuestions[assessmentIndex].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAssessmentAnswer(opt.isCorrect)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '2px solid #334155',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: 700,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#fbbf24')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#334155')}
                    >
                      {language === 'np' ? opt.np : opt.en}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Assessment Results */
              <div
                style={{
                  background: '#1e293b',
                  borderRadius: '24px',
                  padding: '40px',
                  textAlign: 'center',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                  border: '1px solid #334155',
                }}
              >
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                  }}
                >
                  <Trophy size={48} color="#d97706" />
                </div>

                <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', margin: '0 0 10px 0' }}>
                  {language === 'np' ? 'मूल्याङ्कन सम्पन्न भयो!' : 'Assessment Complete!'}
                </h2>

                <p style={{ fontSize: '16px', color: '#cbd5e1', margin: '0 0 24px 0' }}>
                  {language === 'np'
                    ? `तपाईंले ${assessmentQuestions.length} मा ${assessmentScore} अङ्क प्राप्त गर्नुभयो।`
                    : `You scored ${assessmentScore} out of ${assessmentQuestions.length}.`}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Sparkles key={s} size={32} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      setAssessmentIndex(0);
                      setAssessmentScore(0);
                      setAssessmentFinished(false);
                    }}
                    style={{
                      background: '#334155',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {language === 'np' ? 'पुनः प्रयास गर्नुस्' : 'Try Again'}
                  </button>
                  <button
                    onClick={onBackToLibrary}
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 28px',
                      borderRadius: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {language === 'np' ? 'लाइब्रेरीमा फर्कनुहोस्' : 'Return to Library'}
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
export default ManyFewAdventure;

