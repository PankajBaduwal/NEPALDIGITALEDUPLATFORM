/**
 * TenObjectAdventure.tsx
 * Simulation 01: Ten Object Adventure (दश वस्तुहरू गनौँ)
 * Class 1 Mathematics - Chapter 6: Ten (दश)
 * Nepal Digital Education Platform
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  HelpCircle,
  Plus,
  Minus,
  Award,
} from 'lucide-react';
import { TenObjectsEnvironment, ClickedObjectInfo } from './TenObjectsEnvironment';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दश'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

interface QuizQuestion {
  questionNp: string;
  questionEn: string;
  options: number[];
  correct: number;
  explanationNp: string;
  explanationEn: string;
  focus: 'DEFAULT' | 'TREE' | 'GARDEN' | 'BASKET';
  setup: { treeCount: number; flowerCount: number; basketCount: number };
}

export const TenObjectAdventure: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Navigation & Settings
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Stage: 1 to 4, 'ASSESSMENT', or 'FREE_EXPLORE'
  const [activeStage, setActiveStage] = useState<number | 'ASSESSMENT' | 'FREE_EXPLORE'>(1);
  const [cameraFocus, setCameraFocus] = useState<'DEFAULT' | 'TREE' | 'GARDEN' | 'BASKET'>('DEFAULT');

  // 3D Environment Reference
  const mountRef = useRef<HTMLDivElement | null>(null);
  const envRef = useRef<TenObjectsEnvironment | null>(null);

  // Stage 1 State: Guided counting 1 to 10 step reveal
  const [stage1Step, setStage1Step] = useState<number>(1);

  // Stage 2 State: Count 10 objects on tree
  const [countedIndices, setCountedIndices] = useState<number[]>([]);
  const [stage2Complete, setStage2Complete] = useState<boolean>(false);

  // Stage 3 State: Find the Group of Ten
  const [stage3Round, setStage3Round] = useState<number>(0);
  const [stage3Selected, setStage3Selected] = useState<number | null>(null);
  const [stage3Feedback, setStage3Feedback] = useState<boolean | null>(null);

  // Stage 4 State: Arrange 10 objects in basket
  const [basketAppleCount, setBasketAppleCount] = useState<number>(0);

  // Assessment (15 Questions)
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedQuizChoice, setSelectedQuizChoice] = useState<number | null>(null);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);

  // Stars
  const [stars, setStars] = useState<number>(0);

  // Formatting helpers
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
  const saveProgress = async (finalScore: number, finalStars: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH6-01/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, Math.round(finalScore)),
          completionStatus: finalScore >= 60 ? 'COMPLETED' : 'IN_PROGRESS',
          timeSpentSeconds: 180,
          attemptsCount: 1,
          metadata: {
            stars: finalStars,
            stage: activeStage,
          },
        }),
      });
    } catch {
      // Background ignore
    }
  };

  // 15 Comprehensive Assessment Questions
  const assessmentQuestions: QuizQuestion[] = [
    {
      questionNp: 'रुखमा कति वटा स्याउहरू फलेका छन्? गन्नुहोस्।',
      questionEn: 'How many apples are on the tree? Count them.',
      options: [8, 10, 6],
      correct: 10,
      explanationNp: 'रुखमा ठ्याक्कै १० वटा स्याउहरू छन्।',
      explanationEn: 'There are exactly 10 apples on the tree.',
      focus: 'TREE',
      setup: { treeCount: 10, flowerCount: 5, basketCount: 0 },
    },
    {
      questionNp: 'सङ्ख्या "१०" को अङ्ग्रेजी रूप कुन हो?',
      questionEn: 'What is the English numeral form of "१०"?',
      options: [10, 1, 9],
      correct: 10,
      explanationNp: '१० लाई अङ्ग्रेजीमा "10" लेखिन्छ।',
      explanationEn: '१० is written as "10" in English.',
      focus: 'DEFAULT',
      setup: { treeCount: 10, flowerCount: 10, basketCount: 10 },
    },
    {
      questionNp: 'कुन समूहमा १० वटा फूलहरू छन्?',
      questionEn: 'Which group contains ten flowers?',
      options: [10, 7, 5],
      correct: 10,
      explanationNp: 'बगैँचाको यस समूहमा १० वटा फूलहरू छन्।',
      explanationEn: 'There are 10 flowers in this group.',
      focus: 'GARDEN',
      setup: { treeCount: 5, flowerCount: 10, basketCount: 0 },
    },
    {
      questionNp: '९ मा कति जोड्दा १० बन्छ? (९ + __ = १०)',
      questionEn: 'What number added to 9 makes 10? (9 + __ = 10)',
      options: [1, 2, 0],
      correct: 1,
      explanationNp: '९ मा १ जोड्दा १० हुन्छ (९ + १ = १०)।',
      explanationEn: 'Adding 1 to 9 makes 10 (9 + 1 = 10).',
      focus: 'DEFAULT',
      setup: { treeCount: 9, flowerCount: 1, basketCount: 10 },
    },
    {
      questionNp: '५ र ५ जोड्दा कति हुन्छ? (५ + ५ = ?)',
      questionEn: 'What is 5 plus 5? (5 + 5 = ?)',
      options: [8, 9, 10],
      correct: 10,
      explanationNp: '५ र ५ जोड्दा १० हुन्छ।',
      explanationEn: '5 and 5 together make 10.',
      focus: 'BASKET',
      setup: { treeCount: 5, flowerCount: 5, basketCount: 10 },
    },
    {
      questionNp: 'टोकरीमा कति वटा स्याउ छन्? गन्नुहोस्।',
      questionEn: 'How many apples are in the basket? Count them.',
      options: [10, 8, 4],
      correct: 10,
      explanationNp: 'टोकरीमा ठ्याक्कै १० वटा स्याउ छन्।',
      explanationEn: 'There are exactly 10 apples in the basket.',
      focus: 'BASKET',
      setup: { treeCount: 0, flowerCount: 0, basketCount: 10 },
    },
    {
      questionNp: '८ मा कति थप्दा १० पुग्छ? (८ + __ = १०)',
      questionEn: 'What number added to 8 makes 10? (8 + __ = 10)',
      options: [2, 3, 1],
      correct: 2,
      explanationNp: '८ मा २ थप्दा १० हुन्छ (८ + २ = १०)।',
      explanationEn: 'Adding 2 to 8 makes 10 (8 + 2 = 10).',
      focus: 'DEFAULT',
      setup: { treeCount: 8, flowerCount: 2, basketCount: 10 },
    },
    {
      questionNp: 'सङ्ख्या "10" को नेपाली नाम के हो?',
      questionEn: 'What is the Nepali name for number 10?',
      options: [10, 9, 8],
      correct: 10,
      explanationNp: '10 लाई नेपालीमा "दश" (Dash) भनिन्छ।',
      explanationEn: '10 is called "दश" (Ten) in Nepali.',
      focus: 'DEFAULT',
      setup: { treeCount: 10, flowerCount: 10, basketCount: 10 },
    },
    {
      questionNp: '७ र ३ मिलेर कुन सङ्ख्या बन्छ? (७ + ३ = ?)',
      questionEn: 'What number do 7 and 3 make? (7 + 3 = ?)',
      options: [9, 10, 8],
      correct: 10,
      explanationNp: '७ र ३ मिलेर १० बन्छ।',
      explanationEn: '7 and 3 make 10.',
      focus: 'DEFAULT',
      setup: { treeCount: 7, flowerCount: 3, basketCount: 10 },
    },
    {
      questionNp: '६ मा कति जोड्दा १० हुन्छ? (६ + __ = १०)',
      questionEn: 'What number added to 6 makes 10? (6 + __ = 10)',
      options: [4, 5, 3],
      correct: 4,
      explanationNp: '६ मा ४ जोड्दा १० हुन्छ (६ + ४ = १०)।',
      explanationEn: 'Adding 4 to 6 makes 10 (6 + 4 = 10).',
      focus: 'DEFAULT',
      setup: { treeCount: 6, flowerCount: 4, basketCount: 10 },
    },
    {
      questionNp: 'दशवटा वस्तुहरूको समूह जनाउने सङ्ख्या कुन हो?',
      questionEn: 'Which numeral represents a collection of ten objects?',
      options: [10, 0, 1],
      correct: 10,
      explanationNp: 'दशवटा वस्तुहरूको समूहलाई १० (10) ले जनाउँछ।',
      explanationEn: 'A group of ten objects is represented by 10 (१०).',
      focus: 'DEFAULT',
      setup: { treeCount: 10, flowerCount: 10, basketCount: 10 },
    },
    {
      questionNp: 'सङ्ख्या १० मा कतिवटा अङ्क हुन्छन्?',
      questionEn: 'How many digits are in the number 10?',
      options: [2, 1, 3],
      correct: 2,
      explanationNp: '१० मा १ र ० गरी दुईवटा अङ्क हुन्छन्।',
      explanationEn: 'Number 10 has two digits: 1 and 0.',
      focus: 'DEFAULT',
      setup: { treeCount: 10, flowerCount: 10, basketCount: 10 },
    },
    {
      questionNp: '९ पछिको सङ्ख्या कुन हो?',
      questionEn: 'Which number comes immediately after 9?',
      options: [10, 8, 7],
      correct: 10,
      explanationNp: '९ पछि १० आउँछ।',
      explanationEn: '10 comes immediately after 9.',
      focus: 'DEFAULT',
      setup: { treeCount: 9, flowerCount: 10, basketCount: 10 },
    },
    {
      questionNp: 'कुन जोडी जोड्दा १० बन्छ?',
      questionEn: 'Which pair makes 10?',
      options: [10, 8, 7],
      correct: 10,
      explanationNp: '४ र ६ जोड्दा १० बन्छ।',
      explanationEn: '4 and 6 make 10.',
      focus: 'DEFAULT',
      setup: { treeCount: 4, flowerCount: 6, basketCount: 10 },
    },
    {
      questionNp: 'हातका दुवै हातका औँलाहरू जम्मा कति वटा हुन्छन्?',
      questionEn: 'How many fingers are on both hands altogether?',
      options: [10, 5, 8],
      correct: 10,
      explanationNp: 'हाम्रा दुवै हातका औँलाहरू मिलेर १० वटा हुन्छन् (५ + ५ = १०)।',
      explanationEn: 'Both hands have 10 fingers altogether (5 + 5 = 10).',
      focus: 'DEFAULT',
      setup: { treeCount: 10, flowerCount: 10, basketCount: 10 },
    },
  ];

  // ==========================================
  // INITIALIZE 3D ENVIRONMENT
  // ==========================================
  useEffect(() => {
    if (!mountRef.current) return;
    const env = new TenObjectsEnvironment(mountRef.current);
    envRef.current = env;

    // Initial population
    env.setTreeApples(10, []);
    env.setGardenFlowers(10, []);
    env.setBasketApples(0);

    // Click handler for 3D objects
    env.onObjectClick = (info: ClickedObjectInfo) => {
      if (activeStage === 2) {
        handleStage2Click(info.index);
      }
    };

    speakText(
      'दश वस्तुहरू गनौँ सिमुलेसनमा स्वागत छ! १० को सङ्ख्या चिन्न सुरु गरौँ।',
      'Welcome to Ten Object Adventure! Let us discover the number ten.'
    );

    return () => {
      env.destroy();
      envRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyCameraFocus = (focus: 'DEFAULT' | 'TREE' | 'GARDEN' | 'BASKET') => {
    setCameraFocus(focus);
    if (envRef.current) {
      envRef.current.focusOn(focus);
    }
  };

  // Sync stage changes with 3D environment
  useEffect(() => {
    if (!envRef.current) return;

    if (activeStage === 1) {
      applyCameraFocus('TREE');
      setStage1Step(1);
      envRef.current.setTreeApples(1);
      speakText('पहिलो स्याउ आयो। सङ्ख्या १ (एक)।', 'First apple appeared. Number 1 (One).');
    } else if (activeStage === 2) {
      applyCameraFocus('TREE');
      setCountedIndices([]);
      setStage2Complete(false);
      envRef.current.setTreeApples(10, []);
      speakText(
        'रुखमा १० वटा स्याउ छन्। प्रत्येक स्याउमा क्लिक गरेर १० सम्म गन्नुहोस्।',
        'There are 10 apples on the tree. Click each apple to count up to 10.'
      );
    } else if (activeStage === 3) {
      applyCameraFocus('DEFAULT');
      setStage3Round(0);
      setStage3Selected(null);
      setStage3Feedback(null);
      speakText('कुन समूहमा १० वटा वस्तु छन् पत्ता लगाउनुहोस्।', 'Find which group contains ten objects.');
    } else if (activeStage === 4) {
      applyCameraFocus('BASKET');
      setBasketAppleCount(0);
      envRef.current.setBasketApples(0);
      speakText(
        'टोकरीमा १० वटा स्याउहरू जम्मा गरौँ।',
        'Collect ten apples into the basket.'
      );
    } else if (activeStage === 'ASSESSMENT') {
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(false);
      setQuizComplete(false);
      loadQuizQuestion(0);
    } else if (activeStage === 'FREE_EXPLORE') {
      applyCameraFocus('DEFAULT');
      speakText(
        'खुला अन्वेषण मोड! १० सम्मका वस्तुहरू थप्नुहोस् र सङ्ख्या हेर्नुहोस्।',
        'Free Exploration Mode! Add and count objects up to 10.'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStage]);

  // ==========================================
  // STAGE 1: STEP-BY-STEP REVEAL (1 TO 10)
  // ==========================================
  const handleStage1Next = () => {
    if (stage1Step < 10) {
      const next = stage1Step + 1;
      setStage1Step(next);
      if (envRef.current) envRef.current.setTreeApples(next);
      playTone(400 + next * 40, 'triangle', 0.25);

      if (next === 10) {
        playTone(880, 'sine', 0.6);
        setStars((s) => s + 2);
        speakText(
          '१० वटा स्याउ पुगे! दश भनेको दशवटा वस्तुहरूको समूह हो!',
          'Ten apples reached! Ten means a group containing ten objects!'
        );
      } else {
        speakText(`सङ्ख्या ${formatNum(next)}, ${formatName(next)}`, `Number ${next}, ${formatName(next)}`);
      }
    }
  };

  const handleStage1Reset = () => {
    setStage1Step(1);
    if (envRef.current) envRef.current.setTreeApples(1);
    speakText('फेरि सुरु गरियो। १ स्याउ।', 'Reset to 1 apple.');
  };

  // ==========================================
  // STAGE 2: CLICK TO COUNT 10 APPLES
  // ==========================================
  const handleStage2Click = (idx: number) => {
    if (countedIndices.includes(idx) || stage2Complete) return;

    const nextCounted = [...countedIndices, idx];
    setCountedIndices(nextCounted);
    const count = nextCounted.length;

    if (envRef.current) {
      envRef.current.setTreeApples(10, nextCounted);
    }

    playTone(400 + count * 45, 'triangle', 0.25);

    if (count === 10) {
      setStage2Complete(true);
      playTone(880, 'sine', 0.6);
      setStars((s) => s + 3);
      speakText(
        'शानदार! १० – १० – Ten – दश! तपाईंले सबै १० वटा स्याउ गन्नुभयो!',
        'Splendid! 10 – १० – Ten – दश! You counted all 10 apples!'
      );
    } else {
      speakText(`${formatNum(count)}, ${formatName(count)}`, `${count}, ${formatName(count)}`);
    }
  };

  // ==========================================
  // STAGE 3: FIND GROUP OF TEN
  // ==========================================
  const stage3Candidates = [
    {
      groups: [
        { id: 1, count: 5, icon: '🍎' },
        { id: 2, count: 10, icon: '🍎' },
        { id: 3, count: 7, icon: '🍎' },
      ],
      correctCount: 10,
    },
    {
      groups: [
        { id: 1, count: 10, icon: '🌸' },
        { id: 2, count: 8, icon: '🌸' },
        { id: 3, count: 6, icon: '🌸' },
      ],
      correctCount: 10,
    },
    {
      groups: [
        { id: 1, count: 4, icon: '🎈' },
        { id: 2, count: 7, icon: '🎈' },
        { id: 3, count: 10, icon: '🎈' },
      ],
      correctCount: 10,
    },
  ];

  const handleStage3Select = (count: number) => {
    setStage3Selected(count);
    const isCorrect = count === 10;
    setStage3Feedback(isCorrect);

    if (isCorrect) {
      playTone(659.25, 'triangle', 0.4);
      setStars((s) => s + 1);
      speakText('सबास! यस समूहमा ठ्याक्कै १० वटा वस्तु छन्।', 'Correct! This group has exactly 10 objects.');
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText('यसमा १० वटा छैन, फेरि गन्नुहोस्।', 'This does not have 10, count again.');
    }
  };

  // ==========================================
  // STAGE 4: ARRANGE 10 APPLES IN BASKET
  // ==========================================
  const handleStage4AddApple = () => {
    if (basketAppleCount < 10) {
      const next = basketAppleCount + 1;
      setBasketAppleCount(next);
      if (envRef.current) envRef.current.setBasketApples(next);
      playTone(400 + next * 45, 'triangle', 0.25);

      if (next === 10) {
        playTone(880, 'sine', 0.6);
        setStars((s) => s + 2);
        speakText(
          'वाह! टोकरीमा १० वटा स्याउ जम्मा भए! दश पूरा भयो!',
          'Hooray! 10 apples collected in the basket! Ten completed!'
        );
      } else {
        speakText(`टोकरीमा ${formatNum(next)} स्याउ (${formatName(next)})`, `${next} apples in basket`);
      }
    }
  };

  // ==========================================
  // ASSESSMENT LOGIC (15 QUESTIONS)
  // ==========================================
  const loadQuizQuestion = (idx: number) => {
    const q = assessmentQuestions[idx];
    setQuizAnswered(false);
    setSelectedQuizChoice(null);
    applyCameraFocus(q.focus);
    if (envRef.current) {
      envRef.current.setTreeApples(q.setup.treeCount, []);
      envRef.current.setGardenFlowers(q.setup.flowerCount, []);
      envRef.current.setBasketApples(q.setup.basketCount);
    }
    speakText(q.questionNp, q.questionEn);
  };

  const handleQuizAnswer = (choice: number) => {
    if (quizAnswered) return;
    const q = assessmentQuestions[quizIndex];
    setSelectedQuizChoice(choice);
    setQuizAnswered(true);

    const isCorrect = choice === q.correct;
    if (isCorrect) {
      playTone(659.25, 'triangle', 0.35);
      setQuizScore((s) => s + 1);
      speakText('सही उत्तर! ' + q.explanationNp, 'Correct! ' + q.explanationEn);
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText('गलत भयो। ' + q.explanationNp, 'Not quite. ' + q.explanationEn);
    }
  };

  const handleQuizNext = () => {
    if (quizIndex < assessmentQuestions.length - 1) {
      const nextIdx = quizIndex + 1;
      setQuizIndex(nextIdx);
      loadQuizQuestion(nextIdx);
    } else {
      setQuizComplete(true);
      const scorePct = (quizScore / assessmentQuestions.length) * 100;
      const finalStars = Math.round((quizScore / assessmentQuestions.length) * 5) + stars;
      setStars(finalStars);
      saveProgress(scorePct, finalStars);
      speakText(
        `अमूल्य उपलब्धि! तपाईंले ${quizScore} वटा प्रश्नहरूको सही उत्तर दिनुभयो।`,
        `Splendid achievement! You scored ${quizScore} out of ${assessmentQuestions.length}.`
      );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0f172a',
        color: '#f8fafc',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* HEADER / NAVIGATION BAR */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
              fontSize: '13px',
            }}
          >
            <ArrowLeft size={16} />
            <span>{language === 'np' ? 'फिर्ता (Library)' : 'Back to Library'}</span>
          </button>

          <div>
            <div style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 800 }}>
              कक्षा १ • गणित • अध्याय ६ : दश (Ten)
            </div>
            <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#f0fdfa' }}>
              {language === 'np'
                ? 'सिमुलेसन ०१: दश वस्तुहरू गनौँ (Ten Object Adventure)'
                : 'Simulation 01: Ten Object Adventure'}
            </h1>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Camera View Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            {[
              { id: 'DEFAULT', np: 'पूरा (Full)', en: 'Full' },
              { id: 'TREE', np: 'रुख (Tree)', en: 'Tree' },
              { id: 'GARDEN', np: 'बगैँचा (Garden)', en: 'Garden' },
              { id: 'BASKET', np: 'टोकरी (Basket)', en: 'Basket' },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => applyCameraFocus(view.id as any)}
                style={{
                  padding: '5px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  background: cameraFocus === view.id ? '#0284c7' : 'transparent',
                  color: cameraFocus === view.id ? '#ffffff' : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {language === 'np' ? view.np : view.en}
              </button>
            ))}
          </div>

          {/* Stars */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '5px 12px',
              borderRadius: '16px',
              color: '#fef08a',
              fontWeight: 800,
              fontSize: '13px',
            }}
          >
            <Trophy size={15} color="#fbbf24" />
            <span>{stars} Stars</span>
          </div>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage((l) => (l === 'np' ? 'en' : 'np'))}
            style={{
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            {language === 'np' ? 'नेपाली' : 'EN'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '7px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: soundEnabled ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      {/* STAGE SELECTOR STRIP */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(15, 23, 42, 0.75)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
          zIndex: 15,
          overflowX: 'auto',
        }}
      >
        {[
          { key: 1, np: '१. दशको खोज (Discover 10)', en: '1. Discover 10' },
          { key: 2, np: '२. १० वस्तु गनौँ (Count 10)', en: '2. Count 10' },
          { key: 3, np: '३. १० को समूह छान्नुहोस् (Find 10)', en: '3. Find 10' },
          { key: 4, np: '४. टोकरीमा १० राखौँ (Collect 10)', en: '4. Collect 10' },
          { key: 'ASSESSMENT', np: '५. १५-प्रश्न परीक्षा (Evaluation)', en: '5. Assessment' },
          { key: 'FREE_EXPLORE', np: '६. खुला खेल (Free Explore)', en: '6. Free Explore' },
        ].map((tab) => {
          const isSelected = activeStage === tab.key;
          return (
            <button
              key={tab.key.toString()}
              onClick={() => setActiveStage(tab.key as any)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                background: isSelected ? 'rgba(2, 132, 199, 0.8)' : 'rgba(30, 41, 59, 0.6)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {language === 'np' ? tab.np : tab.en}
            </button>
          );
        })}
      </div>

      {/* MAIN 3D WORKSPACE */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* ======================================================== */}
        {/* STAGE 1: STEP-BY-STEP REVEAL 1 TO 10                     */}
        {/* ======================================================== */}
        {activeStage === 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '20px 32px',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              maxWidth: '680px',
              width: '90%',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 800 }}>
                {language === 'np' ? 'चरण १ • १ देखि १० सम्मको खोज' : 'Stage 1 • Discover 1 to 10'}
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 900, color: '#fef08a' }}>
                {stage1Step === 10
                  ? language === 'np'
                    ? 'शानदार! १० वटा वस्तुहरूको समूह पूरा भयो!'
                    : 'Splendid! Group of 10 objects completed!'
                  : language === 'np'
                  ? `रुखमा ${formatNum(stage1Step)} वटा स्याउ छन् (${formatName(stage1Step)})`
                  : `${stage1Step} apples on the tree (${formatName(stage1Step)})`}
              </h2>
            </div>

            {/* Big Dual Numeral Showcase */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(2, 132, 199, 0.3)',
                  border: '2px solid #38bdf8',
                  borderRadius: '16px',
                  padding: '10px 24px',
                }}
              >
                <span style={{ fontSize: '36px', fontWeight: 900, color: '#facc15' }}>
                  {formatNum(stage1Step)}
                </span>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>
                  {formatName(stage1Step)}
                </div>
              </div>
            </div>

            {/* Next / Reset Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {stage1Step < 10 ? (
                <button
                  onClick={handleStage1Next}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{language === 'np' ? '+ अर्को स्याउ थप्नुहोस्' : '+ Next Apple'}</span>
                  <Plus size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setActiveStage(2)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '14px',
                    background: '#059669',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{language === 'np' ? 'चरण २ मा जानुहोस्' : 'Proceed to Stage 2'}</span>
                  <ChevronRight size={18} />
                </button>
              )}

              <button
                onClick={handleStage1Reset}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 2: COUNT 10 APPLES BY TAPPING                      */}
        {/* ======================================================== */}
        {activeStage === 2 && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '20px 32px',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              maxWidth: '680px',
              width: '90%',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 800 }}>
                {language === 'np' ? 'चरण २ • रुखका स्याउहरू गनौँ' : 'Stage 2 • Count 10 Apples'}
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 900, color: '#fef08a' }}>
                {stage2Complete
                  ? language === 'np'
                    ? 'शानदार! १० – १० – Ten – दश! सबै स्याउहरू गनियो!'
                    : 'Splendid! 10 – १० – Ten – दश! All apples counted!'
                  : language === 'np'
                  ? `स्याउमा थिचेर गन्नुहोस्: ${formatNum(countedIndices.length)} / १०`
                  : `Tap apples to count: ${countedIndices.length} / 10`}
              </h2>
            </div>

            {/* Visual Dot Progress Bar */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: i < countedIndices.length ? '#22c55e' : 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#ffffff',
                  }}
                >
                  {formatNum(i + 1)}
                </div>
              ))}
            </div>

            {stage2Complete && (
              <button
                onClick={() => setActiveStage(3)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '14px',
                  background: '#059669',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{language === 'np' ? 'अर्को चरण ३ मा जानुहोस्' : 'Proceed to Stage 3'}</span>
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 3: FIND THE GROUP OF TEN                           */}
        {/* ======================================================== */}
        {activeStage === 3 && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '20px 32px',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              maxWidth: '720px',
              width: '90%',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 800 }}>
                {language === 'np' ? 'चरण ३ • १० वटा भएको समूह छान्नुहोस्' : 'Stage 3 • Find the Group of 10'}
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 900, color: '#fef08a' }}>
                {language === 'np' ? 'कुन समूहमा १० वटा वस्तु छन्?' : 'Which group has 10 objects?'}
              </h2>
            </div>

            {/* Candidates */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {stage3Candidates[stage3Round].groups.map((grp) => {
                const isSelected = stage3Selected === grp.count;
                const isCorrect = grp.count === 10;

                return (
                  <button
                    key={grp.id}
                    onClick={() => handleStage3Select(grp.count)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '16px',
                      background: isSelected
                        ? isCorrect
                          ? 'rgba(16, 185, 129, 0.3)'
                          : 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(30, 41, 59, 0.8)',
                      border: isSelected
                        ? isCorrect
                          ? '3px solid #10b981'
                          : '3px solid #ef4444'
                        : '2px solid rgba(56, 189, 248, 0.3)',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{grp.icon}</span>
                    <span style={{ fontSize: '15px', fontWeight: 800 }}>
                      {language === 'np' ? `${formatNum(grp.count)} वटा` : `${grp.count} items`}
                    </span>
                  </button>
                );
              })}
            </div>

            {stage3Feedback !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontWeight: 800,
                    color: stage3Feedback ? '#34d399' : '#f87171',
                    fontSize: '14px',
                  }}
                >
                  {stage3Feedback
                    ? language === 'np'
                      ? 'सबास! सही समूह छान्नुभयो (+१ तारा)'
                      : 'Correct! (+1 Star)'
                    : language === 'np'
                    ? 'पुनः प्रयास गर्नुहोस्!'
                    : 'Try again!'}
                </span>

                {stage3Feedback && stage3Round < stage3Candidates.length - 1 && (
                  <button
                    onClick={() => {
                      setStage3Round((r) => r + 1);
                      setStage3Selected(null);
                      setStage3Feedback(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {language === 'np' ? 'अर्को राउन्ड' : 'Next Round'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 4: ARRANGE 10 IN BASKET                            */}
        {/* ======================================================== */}
        {activeStage === 4 && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '20px 32px',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              maxWidth: '680px',
              width: '90%',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 800 }}>
                {language === 'np' ? 'चरण ४ • टोकरीमा १० वटा स्याउ जम्मा गरौँ' : 'Stage 4 • Collect 10 in Basket'}
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 900, color: '#fef08a' }}>
                {basketAppleCount === 10
                  ? language === 'np'
                    ? 'वाह! टोकरीमा १० वटा स्याउ पूरा भए!'
                    : 'Hooray! 10 apples collected in basket!'
                  : language === 'np'
                  ? `टोकरीमा स्याउ: ${formatNum(basketAppleCount)} / १०`
                  : `Apples in basket: ${basketAppleCount} / 10`}
              </h2>
            </div>

            {/* Add Button */}
            {basketAppleCount < 10 ? (
              <button
                onClick={handleStage4AddApple}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: '14px',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
                }}
              >
                <Plus size={18} />
                <span>{language === 'np' ? '+ १ स्याउ टोकरीमा राख्नुहोस्' : '+ Put 1 Apple in Basket'}</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setActiveStage('ASSESSMENT')}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '14px',
                    background: '#059669',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{language === 'np' ? 'मूल्याङ्कनमा जानुहोस्' : 'Take Final Assessment'}</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 5: 15-QUESTION FINAL ASSESSMENT                    */}
        {/* ======================================================== */}
        {activeStage === 'ASSESSMENT' && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '24px 32px',
              border: '2px solid rgba(56, 189, 248, 0.5)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              maxWidth: '720px',
              width: '90%',
              zIndex: 10,
            }}
          >
            {!quizComplete ? (
              <>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 800 }}>
                      {language === 'np' ? 'अध्याय ६ • मूल्याङ्कन प्रश्न' : 'Chapter 6 • Evaluation'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#facc15', fontWeight: 800 }}>
                      {quizIndex + 1} / {assessmentQuestions.length}
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fef08a' }}>
                    {language === 'np'
                      ? assessmentQuestions[quizIndex].questionNp
                      : assessmentQuestions[quizIndex].questionEn}
                  </h2>
                </div>

                {/* Multiple Choice Options */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  {assessmentQuestions[quizIndex].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleQuizAnswer(opt)}
                      disabled={quizAnswered}
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '18px',
                        background:
                          quizAnswered && opt === assessmentQuestions[quizIndex].correct
                            ? '#10b981'
                            : quizAnswered && selectedQuizChoice === opt
                            ? '#ef4444'
                            : 'rgba(30, 41, 59, 0.8)',
                        border: '2px solid rgba(56, 189, 248, 0.4)',
                        color: '#ffffff',
                        fontSize: '28px',
                        fontWeight: 900,
                        cursor: quizAnswered ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span>{formatNum(opt)}</span>
                      <span style={{ fontSize: '10px', opacity: 0.85 }}>{formatName(opt)}</span>
                    </button>
                  ))}
                </div>

                {quizAnswered && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '13px', color: '#cbd5e1', textAlign: 'center' }}>
                      {language === 'np'
                        ? assessmentQuestions[quizIndex].explanationNp
                        : assessmentQuestions[quizIndex].explanationEn}
                    </div>

                    <button
                      onClick={handleQuizNext}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '12px',
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>
                        {quizIndex < assessmentQuestions.length - 1
                          ? language === 'np'
                            ? 'अर्को प्रश्न'
                            : 'Next Question'
                          : language === 'np'
                          ? 'नतिजा हेर्नुहोस्'
                          : 'View Results'}
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Completion Banner */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
                <Trophy size={48} color="#fbbf24" />
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#f0fdf4' }}>
                  {language === 'np'
                    ? 'बधाई छ! मूल्याङ्कन पूरा भयो!'
                    : 'Congratulations! Assessment Completed!'}
                </h2>
                <div style={{ fontSize: '15px', color: '#93c5fd' }}>
                  {language === 'np'
                    ? `तपाईंले ${assessmentQuestions.length} मध्ये ${quizScore} अङ्क प्राप्त गर्नुभयो।`
                    : `You scored ${quizScore} out of ${assessmentQuestions.length}.`}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={() => setActiveStage('FREE_EXPLORE')}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {language === 'np' ? 'खुला खेल (Free Explore)' : 'Free Explore'}
                  </button>

                  <button
                    onClick={onBackToLibrary}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Award size={16} />
                    <span>{language === 'np' ? 'लाइब्रेरी फिर्ता जानुहोस्' : 'Back to Library'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenObjectAdventure;

