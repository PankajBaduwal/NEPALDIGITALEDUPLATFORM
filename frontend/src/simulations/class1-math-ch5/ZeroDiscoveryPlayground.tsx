/**
 * ZeroDiscoveryPlayground.tsx
 * Simulation 01: The Zero Discovery Playground (शून्य चिनौँ)
 * Class 1 Mathematics - Chapter 5: Zero (शून्य)
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
  Eye,
  Plus,
  Minus,
  HelpCircle,
  Award,
} from 'lucide-react';
import { ZeroPlaygroundEnvironment } from './ZeroPlaygroundEnvironment';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

interface QuizQuestion {
  questionNp: string;
  questionEn: string;
  options: number[];
  correct: number;
  explanationNp: string;
  explanationEn: string;
  focus: 'DEFAULT' | 'BASKET' | 'TREE' | 'POND' | 'BENCH';
  setup: { apples: number; birds: number; ducks: number; people: number };
}

export const ZeroDiscoveryPlayground: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Navigation & Settings
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Stage: 1 to 5, or 'FREE_EXPLORE' or 'ASSESSMENT'
  const [activeStage, setActiveStage] = useState<number | 'FREE_EXPLORE' | 'ASSESSMENT'>(1);
  const [cameraFocus, setCameraFocus] = useState<'DEFAULT' | 'BASKET' | 'TREE' | 'POND' | 'BENCH'>('DEFAULT');

  // Environment Reference
  const mountRef = useRef<HTMLDivElement | null>(null);
  const envRef = useRef<ZeroPlaygroundEnvironment | null>(null);

  // Live item counts in 3D scene
  const [appleCount, setAppleCount] = useState<number>(3);
  const [birdCount, setBirdCount] = useState<number>(3);
  const [duckCount, setDuckCount] = useState<number>(3);
  const [peopleCount, setPeopleCount] = useState<number>(2);

  // Stage 1 State: Guided Apple Removal
  const [stage1ApplesLeft, setStage1ApplesLeft] = useState<number>(3);
  const [stage1ZeroRevealed, setStage1ZeroRevealed] = useState<boolean>(false);

  // Stage 2 State: Empty vs Non-Empty Group Selection
  const [stage2PairIndex, setStage2PairIndex] = useState<number>(0);
  const [stage2Feedback, setStage2Feedback] = useState<boolean | null>(null);

  // Stage 3 State: Removal Target
  const [stage3Target, setStage3Target] = useState<'BIRDS' | 'DUCKS' | 'APPLES'>('BIRDS');
  const [stage3Remaining, setStage3Remaining] = useState<number>(4);

  // Stage 4 State: Spot Explorer
  const [stage4SpotIndex, setStage4SpotIndex] = useState<number>(0);
  const [stage4Selected, setStage4Selected] = useState<number | null>(null);

  // Assessment State (12 Questions)
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedQuizChoice, setSelectedQuizChoice] = useState<number | null>(null);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);

  // Score & Stars
  const [stars, setStars] = useState<number>(0);

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

  // Audio Tone Synthesis (Web Audio API)
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
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH5-01/progress', {
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
      // Progress API background ignore
    }
  };

  // Helper formatting
  const formatNum = (n: number): string => (language === 'np' ? NEP_DIGITS[n] : n.toString());
  const formatName = (n: number): string => (language === 'np' ? NEP_NAMES[n] : EN_NAMES[n]);

  // 12 Assessment Questions Data
  const assessmentQuestions: QuizQuestion[] = [
    {
      questionNp: 'यो खाली टोकरीमा कति वटा स्याउ छन्?',
      questionEn: 'How many apples are in this empty basket?',
      options: [0, 1, 3],
      correct: 0,
      explanationNp: 'खाली टोकरीमा कुनै स्याउ छैन, त्यसैले यसको सङ्ख्या शून्य (०) हो।',
      explanationEn: 'There are no apples in an empty basket, so the count is zero (0).',
      focus: 'BASKET',
      setup: { apples: 0, birds: 2, ducks: 2, people: 1 },
    },
    {
      questionNp: 'रुखको यस खाली हाँगामा कति वटा चरा छन्?',
      questionEn: 'How many birds are on this empty tree branch?',
      options: [2, 0, 4],
      correct: 0,
      explanationNp: 'हाँगामा कुनै चरा छैन, त्यसैले चराको सङ्ख्या शून्य (०) हो।',
      explanationEn: 'There are no birds on the branch, so the number of birds is zero (0).',
      focus: 'TREE',
      setup: { apples: 2, birds: 0, ducks: 3, people: 1 },
    },
    {
      questionNp: 'यो खाली पोखरीमा कति वटा हाँस छन्?',
      questionEn: 'How many ducks are in this empty pond?',
      options: [0, 2, 5],
      correct: 0,
      explanationNp: 'पोखरी खाली छ, हाँसको सङ्ख्या शून्य (०) हो।',
      explanationEn: 'The pond is empty, so there are zero (0) ducks.',
      focus: 'POND',
      setup: { apples: 3, birds: 2, ducks: 0, people: 1 },
    },
    {
      questionNp: 'यो खाली बेन्चमा कति जना मानिस बसिरहेका छन्?',
      questionEn: 'How many people are sitting on this empty bench?',
      options: [1, 3, 0],
      correct: 0,
      explanationNp: 'बेन्चमा कोही पनि छैन, त्यसैले शून्य (०) जना छन्।',
      explanationEn: 'Nobody is on the bench, so the count is zero (0).',
      focus: 'BENCH',
      setup: { apples: 2, birds: 2, ducks: 2, people: 0 },
    },
    {
      questionNp: 'टोकरीमा ३ वटा स्याउ थिए, ती सबै खाएपछि कति बाँकी रहन्छ?',
      questionEn: 'There were 3 apples in the basket. After all are taken, how many remain?',
      options: [3, 1, 0],
      correct: 0,
      explanationNp: 'सबै स्याउ निकालेपछि टोकरी खाली हुन्छ र शून्य (०) बाँकी रहन्छ।',
      explanationEn: 'When all apples are removed, the basket becomes empty with zero (0) remaining.',
      focus: 'BASKET',
      setup: { apples: 0, birds: 1, ducks: 1, people: 1 },
    },
    {
      questionNp: 'पोखरीमा हाँसहरू गन्नुहोस्। कति वटा हाँस छन्?',
      questionEn: 'Count the ducks in the pond. How many ducks are there?',
      options: [2, 3, 0],
      correct: 2,
      explanationNp: 'पोखरीमा २ वटा हाँसहरू पौडिरहेका छन्।',
      explanationEn: 'There are 2 ducks swimming in the pond.',
      focus: 'POND',
      setup: { apples: 1, birds: 1, ducks: 2, people: 1 },
    },
    {
      questionNp: 'कुनै समूहमा कुनै पनि वस्तु छैन भने त्यसलाई के भनिन्छ?',
      questionEn: 'When a group has no objects, what is that number called?',
      options: [0, 1, 9],
      correct: 0,
      explanationNp: 'कुनै समूहमा केही पनि नहुँदा त्यसलाई शून्य (०) भनिन्छ।',
      explanationEn: 'When there are no objects in a group, we call it zero (0).',
      focus: 'DEFAULT',
      setup: { apples: 0, birds: 0, ducks: 0, people: 0 },
    },
    {
      questionNp: 'टोकरीमा कति वटा स्याउ छन्? गन्नुहोस्।',
      questionEn: 'How many apples are in the basket? Count them.',
      options: [1, 4, 0],
      correct: 4,
      explanationNp: 'टोकरीमा ४ वटा राता स्याउहरू छन्।',
      explanationEn: 'There are 4 red apples in the basket.',
      focus: 'BASKET',
      setup: { apples: 4, birds: 1, ducks: 1, people: 1 },
    },
    {
      questionNp: 'रुखमा २ वटा चरा थिए। ती दुवै उडेर गएपछि रुखमा कति चरा बाँकी रहन्छन्?',
      questionEn: 'There were 2 birds on the tree. After both fly away, how many birds remain?',
      options: [0, 1, 2],
      correct: 0,
      explanationNp: 'दुवै चरा उडेपछि रुखमा शून्य (०) चरा बाँकी रहन्छन्।',
      explanationEn: 'After both fly away, zero (0) birds remain.',
      focus: 'TREE',
      setup: { apples: 1, birds: 0, ducks: 1, people: 1 },
    },
    {
      questionNp: 'बेन्चमा कति जना साथीहरू बसिरहेका छन्?',
      questionEn: 'How many friends are sitting on the bench?',
      options: [0, 3, 1],
      correct: 3,
      explanationNp: 'बेन्चमा ३ जना साथीहरू बसिरहेका छन्।',
      explanationEn: 'There are 3 friends sitting on the bench.',
      focus: 'BENCH',
      setup: { apples: 1, birds: 1, ducks: 1, people: 3 },
    },
    {
      questionNp: 'कुन सङ्ख्याले "खाली" (Empty) अवस्था जनाउँछ?',
      questionEn: 'Which numeral represents an "Empty" condition?',
      options: [0, 5, 8],
      correct: 0,
      explanationNp: 'सङ्ख्या ० (शून्य) ले खाली वा कुनै वस्तु नभएको अवस्था जनाउँछ।',
      explanationEn: 'Numeral 0 (zero) represents an empty state or absence of objects.',
      focus: 'DEFAULT',
      setup: { apples: 0, birds: 0, ducks: 0, people: 0 },
    },
    {
      questionNp: 'शून्य (०) को नेपाली नाम के हो?',
      questionEn: 'What is the Nepali name for the number 0?',
      options: [0, 1, 2],
      correct: 0,
      explanationNp: '० लाई नेपालीमा "शून्य" (Shunya) भनिन्छ।',
      explanationEn: '0 is called "शून्य" (Zero) in Nepali.',
      focus: 'DEFAULT',
      setup: { apples: 0, birds: 0, ducks: 0, people: 0 },
    },
  ];

  // ==========================================
  // INITIALIZE 3D ENVIRONMENT
  // ==========================================
  useEffect(() => {
    if (!mountRef.current) return;
    const env = new ZeroPlaygroundEnvironment(mountRef.current);
    envRef.current = env;

    // Default Scene population
    env.setBasketApples(3);
    env.setTreeBirds(3);
    env.setPondDucks(3);
    env.setBenchPeople(2);

    // Click handler for 3D objects
    env.onObjectClick = (id: string, type: string) => {
      if (activeStage === 1) {
        handleStage1RemoveApple();
      } else if (activeStage === 3) {
        handleStage3Remove();
      }
    };

    speakText(
      'शून्यको खेलमैदानमा स्वागत छ! शून्य भनेको के हो जान्न सुरु गरौँ।',
      'Welcome to the Zero Discovery Playground! Let us discover what zero means.'
    );

    return () => {
      env.destroy();
      envRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Environment when camera focus changes
  const applyCameraFocus = (focus: 'DEFAULT' | 'BASKET' | 'TREE' | 'POND' | 'BENCH') => {
    setCameraFocus(focus);
    if (envRef.current) {
      envRef.current.focusOn(focus);
    }
  };

  // Sync stage setup with 3D environment
  useEffect(() => {
    if (!envRef.current) return;

    if (activeStage === 1) {
      applyCameraFocus('BASKET');
      setStage1ApplesLeft(3);
      setStage1ZeroRevealed(false);
      envRef.current.setBasketApples(3);
      speakText(
        'टोकरीमा ३ वटा स्याउहरू छन्। अब स्याउहरू एक–एक गरेर निकालौँ।',
        'There are 3 apples in the basket. Let us remove the apples one by one.'
      );
    } else if (activeStage === 2) {
      applyCameraFocus('BASKET');
      setStage2PairIndex(0);
      setStage2Feedback(null);
      envRef.current.setBasketApples(0);
      speakText('खाली समूह र भरिएको समूह पहिचान गर्नुहोस्।', 'Identify empty and non-empty groups.');
    } else if (activeStage === 3) {
      applyCameraFocus('TREE');
      setStage3Target('BIRDS');
      setStage3Remaining(4);
      envRef.current.setTreeBirds(4);
      speakText(
        'रुखमा ४ वटा चरा छन्। चरामा क्लिक गरेर उडाउनुहोस् र शून्य बनाउनुहोस्।',
        'There are 4 birds on the tree. Click birds to make them fly away until zero remain.'
      );
    } else if (activeStage === 4) {
      applyCameraFocus('POND');
      setStage4SpotIndex(0);
      setStage4Selected(null);
      envRef.current.setPondDucks(0);
      speakText('वरिपरिका ठाउँहरू हेरेर शून्य खोजौँ।', 'Look at different locations to find zero.');
    } else if (activeStage === 'ASSESSMENT') {
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(false);
      setQuizComplete(false);
      loadQuizQuestion(0);
    } else if (activeStage === 'FREE_EXPLORE') {
      applyCameraFocus('DEFAULT');
      speakText(
        'खुला अन्वेषण मोड! वस्तुहरू थप्नुहोस् वा हटाउनुहोस् र सङ्ख्या हेर्नुहोस्।',
        'Free Exploration Mode! Add or remove objects to see the count update.'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStage]);

  // ==========================================
  // STAGE 1: REMOVING APPLES ONE BY ONE
  // ==========================================
  const handleStage1RemoveApple = () => {
    if (stage1ApplesLeft > 0) {
      const nextCount = stage1ApplesLeft - 1;
      setStage1ApplesLeft(nextCount);
      if (envRef.current) {
        envRef.current.setBasketApples(nextCount);
      }
      playTone(440 + nextCount * 60, 'triangle', 0.25);

      if (nextCount > 0) {
        speakText(
          `एक स्याउ निकालियो। अब ${formatNum(nextCount)} वटा स्याउ बाँकी छन्।`,
          `One apple removed. Now ${nextCount} apples remain.`
        );
      } else {
        // Count reached 0!
        setStage1ZeroRevealed(true);
        playTone(659.25, 'triangle', 0.4);
        setTimeout(() => playTone(880, 'sine', 0.6), 200);
        setStars((s) => s + 2);
        speakText(
          'टोकरी खाली भयो! कुनै पनि स्याउ बाँकी छैन, त्यसैले स्याउको सङ्ख्या शून्य (०) हो!',
          'The basket is empty! No apples remain, so the count is ZERO (0)!'
        );
      }
    }
  };

  const handleStage1Reset = () => {
    setStage1ApplesLeft(3);
    setStage1ZeroRevealed(false);
    if (envRef.current) {
      envRef.current.setBasketApples(3);
    }
    speakText('फेरि ३ वटा स्याउ राखियो।', '3 apples placed back in the basket.');
  };

  // ==========================================
  // STAGE 2: EMPTY VS NON-EMPTY PAIR IDENTIFICATION
  // ==========================================
  const stage2Pairs = [
    {
      titleNp: 'कुन टोकरीमा शून्य (०) स्याउ छन्?',
      titleEn: 'Which basket has zero (0) apples?',
      options: [
        { id: 'EMPTY', labelNp: 'खाली टोकरी (Empty Basket)', labelEn: 'Empty Basket', count: 0, isZero: true },
        { id: 'FULL', labelNp: '३ स्याउ भएको टोकरी (3 Apples)', labelEn: 'Basket with 3 Apples', count: 3, isZero: false },
      ],
      targetZero: true,
    },
    {
      titleNp: 'कुन भाँडोमा वस्तुहरू छन्? (Non-Empty Group)',
      titleEn: 'Which container has objects? (Non-Empty Group)',
      options: [
        { id: 'EMPTY', labelNp: 'खाली भाँडो (० वस्तु)', labelEn: 'Empty Pot (0 items)', count: 0, isZero: true },
        { id: 'FULL', labelNp: '४ वटा फूल भएको भाँडो', labelEn: 'Pot with 4 Flowers', count: 4, isZero: false },
      ],
      targetZero: false,
    },
    {
      titleNp: 'कुन बक्स शून्य (०) खेलौना भएको हो?',
      titleEn: 'Which box has zero (0) toys?',
      options: [
        { id: 'EMPTY', labelNp: 'खाली बक्स (० खेलौना)', labelEn: 'Empty Box (0 toys)', count: 0, isZero: true },
        { id: 'FULL', labelNp: '२ वटा बल भएको बक्स', labelEn: 'Box with 2 balls', count: 2, isZero: false },
      ],
      targetZero: true,
    },
  ];

  const handleStage2Select = (isZero: boolean) => {
    const pair = stage2Pairs[stage2PairIndex];
    const isCorrect = pair.targetZero ? isZero : !isZero;

    setStage2Feedback(isCorrect);
    if (isCorrect) {
      playTone(659.25, 'triangle', 0.35);
      setStars((s) => s + 1);
      speakText('अति उत्तम! सही पहिचान गर्नुभयो।', 'Splendid! You identified correctly.');
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText('ध्यान दिएर हेर्नुहोस्, कुन भाँडो खाली छ?', 'Look carefully, which container is empty?');
    }
  };

  // ==========================================
  // STAGE 3: INTERACTIVE OBJECT REMOVAL
  // ==========================================
  const handleStage3Remove = () => {
    if (stage3Remaining > 0) {
      const next = stage3Remaining - 1;
      setStage3Remaining(next);
      playTone(400 + next * 70, 'triangle', 0.2);

      if (stage3Target === 'BIRDS') {
        if (envRef.current) envRef.current.setTreeBirds(next);
        if (next === 0) {
          playTone(880, 'sine', 0.5);
          setStars((s) => s + 2);
          speakText(
            'सबै चरा उडेर गए! हाँगामा शून्य (०) चरा बाँकी छन्!',
            'All birds flew away! Zero (0) birds remain on the branch!'
          );
        } else {
          speakText(`एक चरा उड्यो, अब ${formatNum(next)} बाँकी छन्।`, `One bird flew away, ${next} remain.`);
        }
      } else if (stage3Target === 'DUCKS') {
        if (envRef.current) envRef.current.setPondDucks(next);
        if (next === 0) {
          playTone(880, 'sine', 0.5);
          setStars((s) => s + 2);
          speakText('सबै हाँस गए! पोखरीमा शून्य (०) हाँस छन्!', 'All ducks left! Zero (0) ducks in the pond!');
        } else {
          speakText(`एक हाँस गयो, अब ${formatNum(next)} बाँकी छन्।`, `One duck left, ${next} remain.`);
        }
      }
    }
  };

  const handleStage3Switch = (target: 'BIRDS' | 'DUCKS') => {
    setStage3Target(target);
    const count = 4;
    setStage3Remaining(count);
    if (envRef.current) {
      if (target === 'BIRDS') {
        applyCameraFocus('TREE');
        envRef.current.setTreeBirds(count);
        speakText('रुखका चराहरू हटाएर शून्य बनाऔँ।', 'Make birds fly away to reach zero.');
      } else {
        applyCameraFocus('POND');
        envRef.current.setPondDucks(count);
        speakText('पोखरीका हाँसहरू हटाएर शून्य बनाऔँ।', 'Move ducks away to reach zero.');
      }
    }
  };

  // ==========================================
  // STAGE 4: FIND ZERO IN THE ENVIRONMENT
  // ==========================================
  const stage4Spots = [
    {
      titleNp: 'खाली पोखरी (Empty Pond)',
      titleEn: 'Empty Pond',
      questionNp: 'यो पोखरीमा कति वटा हाँस छन्?',
      questionEn: 'How many ducks are in this pond?',
      correct: 0,
      focus: 'POND' as const,
      ducks: 0,
      birds: 2,
      people: 2,
    },
    {
      titleNp: 'खाली बेन्च (Empty Bench)',
      titleEn: 'Empty Bench',
      questionNp: 'यो बेन्चमा कति जना बसिरहेका छन्?',
      questionEn: 'How many people are sitting on this bench?',
      correct: 0,
      focus: 'BENCH' as const,
      ducks: 2,
      birds: 2,
      people: 0,
    },
    {
      titleNp: 'खाली हाँगा (Empty Branch)',
      titleEn: 'Empty Tree Branch',
      questionNp: 'यस हाँगामा कति वटा चरा छन्?',
      questionEn: 'How many birds are on this branch?',
      correct: 0,
      focus: 'TREE' as const,
      ducks: 2,
      birds: 0,
      people: 2,
    },
  ];

  const handleStage4Pick = (choice: number) => {
    setStage4Selected(choice);
    const spot = stage4Spots[stage4SpotIndex];
    if (choice === spot.correct) {
      playTone(659.25, 'triangle', 0.35);
      setStars((s) => s + 1);
      speakText('सबास! यो स्थान खाली छ, त्यसैले शून्य (०) हो।', 'Correct! This place is empty, so it is zero (0).');
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText('गलत भयो, ध्यान दिएर हेर्नुहोस्।', 'Incorrect, look closely.');
    }
  };

  const handleStage4NextSpot = () => {
    const nextIdx = (stage4SpotIndex + 1) % stage4Spots.length;
    setStage4SpotIndex(nextIdx);
    setStage4Selected(null);
    const spot = stage4Spots[nextIdx];
    applyCameraFocus(spot.focus);
    if (envRef.current) {
      envRef.current.setPondDucks(spot.ducks);
      envRef.current.setTreeBirds(spot.birds);
      envRef.current.setBenchPeople(spot.people);
    }
  };

  // ==========================================
  // ASSESSMENT LOGIC (12 QUESTIONS)
  // ==========================================
  const loadQuizQuestion = (idx: number) => {
    const q = assessmentQuestions[idx];
    setQuizAnswered(false);
    setSelectedQuizChoice(null);
    applyCameraFocus(q.focus);
    if (envRef.current) {
      envRef.current.setBasketApples(q.setup.apples);
      envRef.current.setTreeBirds(q.setup.birds);
      envRef.current.setPondDucks(q.setup.ducks);
      envRef.current.setBenchPeople(q.setup.people);
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
      // Completed quiz!
      setQuizComplete(true);
      const finalScorePercent = (quizScore / assessmentQuestions.length) * 100;
      const finalStars = Math.round((quizScore / assessmentQuestions.length) * 5) + stars;
      setStars(finalStars);
      saveProgress(finalScorePercent, finalStars);
      speakText(
        `अमूल्य उपलब्धि! तपाईंले ${quizScore} वटा प्रश्नहरूको सही उत्तर दिनुभयो।`,
        `Splendid achievement! You answered ${quizScore} questions correctly.`
      );
    }
  };

  // ==========================================
  // FREE EXPLORATION CONTROLS
  // ==========================================
  const adjustItem = (type: 'APPLES' | 'BIRDS' | 'DUCKS' | 'PEOPLE', delta: number) => {
    if (type === 'APPLES') {
      const next = Math.max(0, Math.min(5, appleCount + delta));
      setAppleCount(next);
      if (envRef.current) envRef.current.setBasketApples(next);
      speakText(`टोकरीमा ${formatNum(next)} स्याउ (${formatName(next)})`, `${next} apples in basket (${formatName(next)})`);
    } else if (type === 'BIRDS') {
      const next = Math.max(0, Math.min(4, birdCount + delta));
      setBirdCount(next);
      if (envRef.current) envRef.current.setTreeBirds(next);
      speakText(`रुखमा ${formatNum(next)} चरा (${formatName(next)})`, `${next} birds on tree (${formatName(next)})`);
    } else if (type === 'DUCKS') {
      const next = Math.max(0, Math.min(4, duckCount + delta));
      setDuckCount(next);
      if (envRef.current) envRef.current.setPondDucks(next);
      speakText(`पोखरीमा ${formatNum(next)} हाँस (${formatName(next)})`, `${next} ducks in pond (${formatName(next)})`);
    } else if (type === 'PEOPLE') {
      const next = Math.max(0, Math.min(3, peopleCount + delta));
      setPeopleCount(next);
      if (envRef.current) envRef.current.setBenchPeople(next);
      speakText(`बेन्चमा ${formatNum(next)} जना (${formatName(next)})`, `${next} people on bench (${formatName(next)})`);
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
              कक्षा १ • गणित • अध्याय ५ : शून्य (Zero)
            </div>
            <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#f0fdfa' }}>
              {language === 'np'
                ? 'सिमुलेसन ०१: शून्य चिनौँ (The Zero Discovery Playground)'
                : 'Simulation 01: The Zero Discovery Playground'}
            </h1>
          </div>
        </div>

        {/* CONTROLS: CAMERA FOCUS, SOUND, LANGUAGE, STARS */}
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
              { id: 'BASKET', np: 'टोकरी (Basket)', en: 'Basket' },
              { id: 'TREE', np: 'रुख (Tree)', en: 'Tree' },
              { id: 'POND', np: 'पोखरी (Pond)', en: 'Pond' },
              { id: 'BENCH', np: 'बेन्च (Bench)', en: 'Bench' },
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

          {/* Stars Counter */}
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

      {/* STAGE SELECTION TABS */}
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
          { key: 1, np: '१. शून्य के हो? (What is Zero?)', en: '1. What is Zero?' },
          { key: 2, np: '२. खाली समूह (Empty Groups)', en: '2. Empty Groups' },
          { key: 3, np: '३. वस्तु हटाऔँ (Removing Objects)', en: '3. Removing Objects' },
          { key: 4, np: '४. शून्य खोजौँ (Find Zero)', en: '4. Find Zero' },
          { key: 'ASSESSMENT', np: '५. १२-प्रश्न परीक्षा (Evaluation)', en: '5. Assessment' },
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

      {/* MAIN 3D WORKSPACE WITH FLOATING INTERACTIVE PANELS */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        {/* 3D WebGL Canvas Container */}
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* ======================================================== */}
        {/* STAGE 1 OVERLAY: WHAT IS ZERO?                           */}
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
              <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                {language === 'np' ? 'चरण १ • शून्यको परिचय' : 'Stage 1 • What is Zero?'}
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 900, color: '#fef08a' }}>
                {stage1ZeroRevealed
                  ? language === 'np'
                    ? 'टोकरी खाली भयो! शून्य (०) स्याउ बाँकी छन्!'
                    : 'The basket is empty! Zero (0) apples remain!'
                  : language === 'np'
                  ? `टोकरीमा ${formatNum(stage1ApplesLeft)} वटा स्याउ छन्।`
                  : `There are ${stage1ApplesLeft} apples in the basket.`}
              </h2>
            </div>

            {/* Big Zero Showcase Badge */}
            {stage1ZeroRevealed && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'rgba(2, 132, 199, 0.25)',
                  border: '2px solid #38bdf8',
                  borderRadius: '18px',
                  padding: '12px 24px',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <span style={{ fontSize: '48px', fontWeight: 900, color: '#facc15', lineHeight: 1 }}>
                  {language === 'np' ? '०' : '0'}
                </span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff' }}>
                    {language === 'np' ? 'शून्य (Zero)' : 'Zero (शून्य)'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {language === 'np'
                      ? 'कुनै समूहमा कुनै वस्तु छैन भने त्यसलाई शून्य (०) भनिन्छ।'
                      : 'When there are no objects in a group, we call it zero (0).'}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {!stage1ZeroRevealed ? (
                <button
                  onClick={handleStage1RemoveApple}
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
                  <Minus size={18} />
                  <span>{language === 'np' ? 'स्याउ निकाल्नुहोस् (Remove Apple)' : 'Remove 1 Apple'}</span>
                </button>
              ) : (
                <button
                  onClick={handleStage1Reset}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={16} />
                  <span>{language === 'np' ? 'फेरि सुरु गर्नुहोस्' : 'Reset Apples'}</span>
                </button>
              )}

              {stage1ZeroRevealed && (
                <button
                  onClick={() => setActiveStage(2)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: '#059669',
                    border: 'none',
                    borderRadius: '14px',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <span>{language === 'np' ? 'अर्को चरण २ मा जानुहोस्' : 'Next Stage 2'}</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 2 OVERLAY: EMPTY VS NON-EMPTY                      */}
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
              gap: '16px',
              maxWidth: '680px',
              width: '90%',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 800 }}>
                {language === 'np' ? 'चरण २ • खाली र भरिएका समूहहरू' : 'Stage 2 • Empty vs Non-Empty Groups'}
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 900, color: '#fef08a' }}>
                {language === 'np'
                  ? stage2Pairs[stage2PairIndex].titleNp
                  : stage2Pairs[stage2PairIndex].titleEn}
              </h2>
            </div>

            {/* Options Pair */}
            <div style={{ display: 'flex', gap: '16px', width: '100%', justifyContent: 'center' }}>
              {stage2Pairs[stage2PairIndex].options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleStage2Select(opt.isZero)}
                  style={{
                    flex: 1,
                    maxWidth: '260px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '2px solid rgba(56, 189, 248, 0.3)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{opt.isZero ? '🫙' : '🍎🍎'}</span>
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>
                    {language === 'np' ? opt.labelNp : opt.labelEn}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {language === 'np' ? `सङ्ख्या: ${formatNum(opt.count)}` : `Count: ${opt.count}`}
                  </span>
                </button>
              ))}
            </div>

            {/* Feedback & Progress */}
            {stage2Feedback !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontWeight: 800,
                    color: stage2Feedback ? '#34d399' : '#f87171',
                    fontSize: '14px',
                  }}
                >
                  {stage2Feedback
                    ? language === 'np'
                      ? 'उत्तम! सही उत्तर (+१ तारा)'
                      : 'Splendid! Correct (+1 Star)'
                    : language === 'np'
                    ? 'पुनः प्रयास गर्नुहोस्!'
                    : 'Try again!'}
                </span>

                {stage2Feedback && stage2PairIndex < stage2Pairs.length - 1 && (
                  <button
                    onClick={() => {
                      setStage2PairIndex((i) => i + 1);
                      setStage2Feedback(null);
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
                    {language === 'np' ? 'अर्को जोडी' : 'Next Pair'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 3 OVERLAY: REMOVING OBJECTS                        */}
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
              gap: '14px',
              maxWidth: '680px',
              width: '90%',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 800 }}>
                {language === 'np' ? 'चरण ३ • वस्तुहरू हटाउँदै शून्य बनाऔँ' : 'Stage 3 • Removing Objects to Zero'}
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 900, color: '#fef08a' }}>
                {stage3Remaining === 0
                  ? language === 'np'
                    ? 'सबै वस्तुहरू हटे! शून्य (०) बाँकी छन्!'
                    : 'All objects removed! Zero (0) remain!'
                  : language === 'np'
                  ? `अहिले ${formatNum(stage3Remaining)} वटा ${stage3Target === 'BIRDS' ? 'चराहरू' : 'हाँसहरू'} छन्।`
                  : `Currently ${stage3Remaining} ${stage3Target === 'BIRDS' ? 'birds' : 'ducks'} present.`}
              </h2>
            </div>

            {/* Target Selector */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleStage3Switch('BIRDS')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  background: stage3Target === 'BIRDS' ? '#0284c7' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                🐦 {language === 'np' ? 'रुखका चराहरू' : 'Birds on Tree'}
              </button>
              <button
                onClick={() => handleStage3Switch('DUCKS')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  background: stage3Target === 'DUCKS' ? '#0284c7' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                🦆 {language === 'np' ? 'पोखरीका हाँसहरू' : 'Ducks in Pond'}
              </button>
            </div>

            {/* Remove Action Button */}
            {stage3Remaining > 0 ? (
              <button
                onClick={handleStage3Remove}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  borderRadius: '14px',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Minus size={18} />
                <span>
                  {language === 'np'
                    ? `एक ${stage3Target === 'BIRDS' ? 'चरा उडाउनुहोस्' : 'हाँस हटाउनुहोस्'}`
                    : `Remove 1 ${stage3Target === 'BIRDS' ? 'Bird' : 'Duck'}`}
                </span>
              </button>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10b981',
                  borderRadius: '14px',
                  padding: '10px 20px',
                }}
              >
                <Sparkles size={24} color="#34d399" />
                <span style={{ fontWeight: 800, color: '#34d399', fontSize: '15px' }}>
                  {language === 'np'
                    ? 'शानदार! गणना: ० (शून्य)'
                    : 'Splendid! Final Count: 0 (Zero)'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 4 OVERLAY: FIND ZERO IN THE ENVIRONMENT            */}
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
                {language === 'np' ? 'चरण ४ • वातावरणमा शून्य खोजौँ' : 'Stage 4 • Find Zero in Environment'}
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 900, color: '#fef08a' }}>
                {language === 'np'
                  ? stage4Spots[stage4SpotIndex].questionNp
                  : stage4Spots[stage4SpotIndex].questionEn}
              </h2>
            </div>

            {/* Answer Choices */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {[0, 1, 2, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => handleStage4Pick(val)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: stage4Selected === val ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
                    border: '2px solid rgba(56, 189, 248, 0.3)',
                    color: '#ffffff',
                    fontSize: '26px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {formatNum(val)}
                </button>
              ))}
            </div>

            {/* Next Spot */}
            {stage4Selected !== null && (
              <button
                onClick={handleStage4NextSpot}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                <span>{language === 'np' ? 'अर्को स्थान हेर्नुहोस्' : 'Next Location'}</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 5 / ASSESSMENT OVERLAY: 12 QUESTIONS               */}
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 800 }}>
                      {language === 'np' ? 'अध्याय ५ • मूल्याङ्कन प्रश्न' : 'Chapter 5 • Evaluation'}
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
                        fontSize: '30px',
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

                {/* Explanation and Next Button */}
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
              /* Quiz Completion Banner */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                }}
              >
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

        {/* ======================================================== */}
        {/* FREE EXPLORATION CONTROLS OVERLAY                        */}
        {/* ======================================================== */}
        {activeStage === 'FREE_EXPLORE' && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '16px 24px',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            {/* Apples */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🍎</span>
              <button
                onClick={() => adjustItem('APPLES', -1)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                -
              </button>
              <span style={{ fontWeight: 900, minWidth: '20px', textAlign: 'center' }}>
                {formatNum(appleCount)}
              </span>
              <button
                onClick={() => adjustItem('APPLES', 1)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>

            {/* Birds */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🐦</span>
              <button
                onClick={() => adjustItem('BIRDS', -1)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                -
              </button>
              <span style={{ fontWeight: 900, minWidth: '20px', textAlign: 'center' }}>
                {formatNum(birdCount)}
              </span>
              <button
                onClick={() => adjustItem('BIRDS', 1)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>

            {/* Ducks */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🦆</span>
              <button
                onClick={() => adjustItem('DUCKS', -1)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                -
              </button>
              <span style={{ fontWeight: 900, minWidth: '20px', textAlign: 'center' }}>
                {formatNum(duckCount)}
              </span>
              <button
                onClick={() => adjustItem('DUCKS', 1)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>

            {/* People on Bench */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🧒</span>
              <button
                onClick={() => adjustItem('PEOPLE', -1)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                -
              </button>
              <span style={{ fontWeight: 900, minWidth: '20px', textAlign: 'center' }}>
                {formatNum(peopleCount)}
              </span>
              <button
                onClick={() => adjustItem('PEOPLE', 1)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZeroDiscoveryPlayground;

