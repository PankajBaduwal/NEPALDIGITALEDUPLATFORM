/**
 * HumanGrowthSim.tsx
 * Master Interactive 2D Human Growth & Development Studio
 * (मानव वृद्धि तथा विकास - 2डी अन्तरक्रियात्मक प्रयोगशाला)
 * Grade 4 Science • Chapter 5: Life Process
 *
 * 100% Native 2D Canvas & Vector Graphics (Zero WebGL/3D Dependencies)
 * - Continuous Human Age Scrubber: 0 to 80 Years with real-time stature scaling,
 *   growth metric chart (cm height), and age-appropriate illustrated character states:
 *   1. Infancy (0–1 yr): Baby in warm clothes, crawling, milk nutrition.
 *   2. Toddlerhood (2–5 yr): Playing with colorful educational blocks, walking.
 *   3. School Child (9–10 yr): Grade 4 student in school uniform with bag & book.
 *   4. Adult (20–55 yr): Fully matured, strong posture, career & family.
 *   5. Old Age / Senior (60+ yr): Silver hair, walking stick, wrinkles, and life wisdom.
 * - Interactive Nutrition Controls: Protein (Muscles), Calcium (Bones), Vitamins (Immunity).
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  RotateCcw,
  Sparkles,
  Check,
  Award,
  TrendingUp,
  Apple,
} from 'lucide-react';

interface GrowthStage {
  id: string;
  nameEn: string;
  nameNe: string;
  ageRangeEn: string;
  ageRangeNe: string;
  heightCm: number;
  milestonesEn: string;
  milestonesNe: string;
  nutritionEn: string;
  nutritionNe: string;
  themeColor: string;
}

export const HumanGrowthSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Age in years: 0 to 80
  const [ageYears, setAgeYears] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Nutrition toggles
  const [hasProtein, setHasProtein] = useState<boolean>(true);
  const [hasCalcium, setHasCalcium] = useState<boolean>(true);

  // Challenge stage state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stages: GrowthStage[] = [
    {
      id: 'infant',
      nameEn: '1. Infancy',
      nameNe: '1. शिशु अवस्था (Infancy)',
      ageRangeEn: '0 – 1 Year',
      ageRangeNe: '0 देखि 1 वर्ष',
      heightCm: 65,
      milestonesEn: 'Rapid brain development, crawls, begins teething, drinks mother’s milk.',
      milestonesNe: 'छिटो शारीरिक विकास, बामे सर्ने, साना दाँत पलाउने र आमाको दूध पिउने।',
      nutritionEn: 'Mother’s milk (Colostrum) provides essential antibodies and pure nutrition.',
      nutritionNe: 'आमाको दूधले रोगसँग लड्ने शक्ति र पूर्ण पोषण दिन्छ।',
      themeColor: '#fda4af',
    },
    {
      id: 'toddler',
      nameEn: '2. Early Childhood',
      nameNe: '2. बाल्यावस्था (Toddlerhood)',
      ageRangeEn: '2 – 5 Years',
      ageRangeNe: '2 देखि 5 वर्ष',
      heightCm: 100,
      milestonesEn: 'Learns walking, running, speaking full sentences, develops motor coordination.',
      milestonesNe: 'दौडन, खेल्न र स्पष्ट बोल्न सिक्ने; जिज्ञासु स्वभाव हुने।',
      nutritionEn: 'High-energy wholesome diet rich in fats, proteins, and fresh fruits.',
      nutritionNe: 'ऊर्जा दिने ताजा खाना, फलफूल र प्रोटिनयुक्त आहार।',
      themeColor: '#fbbf24',
    },
    {
      id: 'child',
      nameEn: '3. Middle Childhood',
      nameNe: '3. विद्यालय जाने उमेर (School Age)',
      ageRangeEn: '6 – 12 Years',
      ageRangeNe: '6 देखि 12 वर्ष',
      heightCm: 135,
      milestonesEn: 'Permanent adult teeth replace milk teeth, school learning, sports, and social skills.',
      milestonesNe: 'दूधका दाँत झरेर स्थायी दाँत आउने, विद्यालय जाने, पढ्ने र खेलकुद खेल्ने।',
      nutritionEn: 'Calcium for growing long bones, protein for muscle synthesis, and iron.',
      nutritionNe: 'हड्डी बलियो बनाउन क्याल्सियम र शरीर बढाउन प्रोटिन आवश्यक हुन्छ।',
      themeColor: '#4ade80',
    },
    {
      id: 'adult',
      nameEn: '4. Adulthood',
      nameNe: '4. वयस्क अवस्था (Adulthood)',
      ageRangeEn: '20 – 55 Years',
      ageRangeNe: '20 देखि 55 वर्ष',
      heightCm: 172,
      milestonesEn: 'Peak physical and intellectual maturity, independent career, raising healthy family.',
      milestonesNe: 'शारीरिक र मानसिक रूपमा पूर्ण परिपक्व, आत्मनिर्भर भएर काम गर्ने।',
      nutritionEn: 'Balanced maintenance diet to prevent lifestyle ailments and maintain muscle tone.',
      nutritionNe: 'सन्तुलित भोजन जसले शरीरलाई स्वस्थ र स्फूर्त राखोस्।',
      themeColor: '#38bdf8',
    },
    {
      id: 'elder',
      nameEn: '5. Old Age / Senior',
      nameNe: '5. वृद्धावस्था (Old Age)',
      ageRangeEn: '60+ Years',
      ageRangeNe: '60 वर्षभन्दा माथि',
      heightCm: 165,
      milestonesEn: 'Silver hair, skin wrinkling, slower reflexes, accompanied by deep life wisdom.',
      milestonesNe: 'कपाल फुल्ने, छाला चाउरी पर्ने, शरीर कमजोर हुने तर जीवनको धेरै अनुभव हुने।',
      nutritionEn: 'Easily digestible, nutrient-dense meals low in sodium with vitamin D supplements.',
      nutritionNe: 'सजिलै पच्ने, नुन कम भएको र भिटामिनयुक्त पौष्टिक खाना।',
      themeColor: '#c084fc',
    },
  ];

  // Determine active stage based on age
  let currentStageIndex = 0;
  if (ageYears <= 1) currentStageIndex = 0;
  else if (ageYears <= 5) currentStageIndex = 1;
  else if (ageYears <= 13) currentStageIndex = 2;
  else if (ageYears <= 55) currentStageIndex = 3;
  else currentStageIndex = 4;

  const currentStageData = stages[currentStageIndex];

  // Auto time-lapse loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setAgeYears((prev) => {
          if (prev >= 75) {
            setIsPlaying(false);
            ScienceAudio.playCelebration();
            setStars(3);
            setIsCompleted(true);
            setStage('understand');
            return 75;
          }
          return prev + 1;
        });
      }, 140);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Height interpolation based on age
  const calculateHeight = (age: number) => {
    if (age <= 1) return 50 + age * 25;
    if (age <= 5) return 75 + ((age - 1) / 4) * 35;
    if (age <= 12) return 110 + ((age - 5) / 7) * 35;
    if (age <= 20) return 145 + ((age - 12) / 8) * 27;
    if (age <= 55) return 172;
    return 172 - ((age - 55) / 25) * 8; // slight shrinkage in late elderhood
  };

  const currentHeightCm = Math.round(calculateHeight(ageYears));

  const handleReset = () => {
    setAgeYears(10);
    setIsPlaying(false);
    ScienceAudio.playWhoosh();
  };

  // ══════════════════════════════════════════════════════════════════
  // MASTER 2D CANVAS RENDERER: HUMAN GROWTH AND STATURE
  // ══════════════════════════════════════════════════════════════════
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const groundY = height * 0.78;
    const centerX = width * 0.52;
    const timeSec = Date.now() * 0.001;

    ctx.clearRect(0, 0, width, height);

    // ─────────────────────────────────────────────────────────────
    // 1. HEALTH CLINIC / LABORATORY BACKGROUND
    // ─────────────────────────────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.65, '#1e293b');
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Clean Tile Floor
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, groundY, width, height - groundY);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    for (let t = 0; t < width; t += 40) {
      ctx.beginPath();
      ctx.moveTo(t, groundY);
      ctx.lineTo(t + 25, height);
      ctx.stroke();
    }

    // ─────────────────────────────────────────────────────────────
    // 2. STATURE HEIGHT MEASUREMENT RULER (CM Scale on Left)
    // ─────────────────────────────────────────────────────────────
    const rulerX = width * 0.16;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(rulerX - 8, 30, 48, groundY - 30);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(rulerX - 8, 30, 48, groundY - 30);

    // Tick Marks (50 cm to 200 cm)
    for (let cm = 50; cm <= 200; cm += 10) {
      const yPos = groundY - ((cm - 50) / 150) * (groundY - 60);
      const isMajor = cm % 20 === 0;

      ctx.strokeStyle = isMajor ? '#38bdf8' : '#94a3b8';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(rulerX + 16, yPos);
      ctx.lineTo(rulerX + (isMajor ? 36 : 26), yPos);
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${cm}`, rulerX + 12, yPos + 3);
      }
    }

    // Dynamic Height Horizontal Indicator Bar
    const charHeadY = groundY - ((currentHeightCm - 50) / 150) * (groundY - 60);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(rulerX + 40, charHeadY);
    ctx.lineTo(centerX + 60, charHeadY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Height Readout Tag
    ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
    ctx.beginPath();
    ctx.roundRect(rulerX + 48, charHeadY - 14, 75, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentHeightCm} cm`, rulerX + 85, charHeadY);

    // ─────────────────────────────────────────────────────────────
    // 3. ILLUSTRATED HUMAN FIGURE ACROSS THE 5 STAGES
    // ─────────────────────────────────────────────────────────────
    ctx.save();
    const figH = groundY - charHeadY;
    const breathe = Math.sin(timeSec * 3) * 1.5;

    // Drop Shadow on Floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(centerX, groundY + 4, figH * 0.18 + 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── STAGE 1: INFANT (0-1 yr) ──
    if (ageYears <= 1) {
      // Crawling cute baby with diaper and warm bib
      const babyY = groundY - 32;

      // Body / Diaper
      ctx.fillStyle = '#fda4af'; // Soft pink onesie
      ctx.beginPath();
      ctx.ellipse(centerX, babyY, 26, 16, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Crawling Arms & Legs
      ctx.fillStyle = '#fed7aa'; // Skin tone
      ctx.beginPath();
      ctx.arc(centerX - 24, babyY + 12, 7, 0, Math.PI * 2);
      ctx.arc(centerX + 18, babyY + 14, 7, 0, Math.PI * 2);
      ctx.fill();

      // Baby Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(centerX - 18, babyY - 18, 17, 0, Math.PI * 2);
      ctx.fill();

      // Cheerful Baby Face
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(centerX - 23, babyY - 18, 2.5, 0, Math.PI * 2);
      ctx.arc(centerX - 13, babyY - 18, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Smiling mouth
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX - 18, babyY - 12, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // ── STAGE 2: TODDLER (2-5 yr) ──
    else if (ageYears <= 5) {
      const charScale = figH / 170;
      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(centerX, charHeadY + 22, 20, 0, Math.PI * 2);
      ctx.fill();

      // Toddler Hair
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(centerX, charHeadY + 14, 21, Math.PI, 0);
      ctx.fill();

      // Eyes & Smile
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(centerX - 6, charHeadY + 22, 2.5, 0, Math.PI * 2);
      ctx.arc(centerX + 6, charHeadY + 22, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Cheerful Yellow Dungarees / Jumper
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.roundRect(centerX - 16, charHeadY + 44, 32, figH * 0.42, 8);
      ctx.fill();

      // Short Legs
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(centerX - 14, charHeadY + 44 + figH * 0.42, 11, figH * 0.35);
      ctx.fillRect(centerX + 3, charHeadY + 44 + figH * 0.42, 11, figH * 0.35);

      // Red Shoes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(centerX - 18, groundY - 8, 16, 8, 4);
      ctx.roundRect(centerX + 2, groundY - 8, 16, 8, 4);
      ctx.fill();

      // Colorful Toy Blocks on Ground
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(centerX + 35, groundY - 20, 20, 20);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(centerX + 37, groundY - 38, 16, 18);
    }

    // ── STAGE 3: SCHOOL AGE CHILD (6-12 yr) ──
    else if (ageYears <= 13) {
      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(centerX, charHeadY + 22, 18, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#1e1b18';
      ctx.beginPath();
      ctx.arc(centerX, charHeadY + 16, 19, Math.PI, 0);
      ctx.fill();

      // Eyes & Smile
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(centerX - 6, charHeadY + 22, 2.5, 0, Math.PI * 2);
      ctx.arc(centerX + 6, charHeadY + 22, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Blue & White School Uniform Shirt with Tie
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(centerX - 18, charHeadY + 42, 36, figH * 0.38);

      // Red School Tie
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(centerX - 4, charHeadY + 43);
      ctx.lineTo(centerX + 4, charHeadY + 43);
      ctx.lineTo(centerX, charHeadY + 70);
      ctx.closePath();
      ctx.fill();

      // School Backpack Straps
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.strokeRect(centerX - 24, charHeadY + 45, 8, 35);
      ctx.strokeRect(centerX + 16, charHeadY + 45, 8, 35);

      // Navy Blue Uniform Trousers
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(centerX - 16, charHeadY + 42 + figH * 0.38, 14, figH * 0.44);
      ctx.fillRect(centerX + 2, charHeadY + 42 + figH * 0.38, 14, figH * 0.44);

      // Black School Shoes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(centerX - 20, groundY - 10, 18, 10, 4);
      ctx.roundRect(centerX + 2, groundY - 10, 18, 10, 4);
      ctx.fill();
    }

    // ── STAGE 4: ADULT (14-55 yr) ──
    else if (ageYears <= 55) {
      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(centerX, charHeadY + 20, 17, 0, Math.PI * 2);
      ctx.fill();

      // Styled Dark Hair
      ctx.fillStyle = '#171717';
      ctx.beginPath();
      ctx.arc(centerX, charHeadY + 14, 18, Math.PI, 0);
      ctx.fill();

      // Confident Facial Features
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(centerX - 6, charHeadY + 20, 2.5, 0, Math.PI * 2);
      ctx.arc(centerX + 6, charHeadY + 20, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Smart Teal / Cyan Professional Blazer & Shirt
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(centerX - 24, charHeadY + 40, 48, figH * 0.38, 6);
      ctx.fill();

      // White inner shirt V-neck
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(centerX - 8, charHeadY + 40);
      ctx.lineTo(centerX + 8, charHeadY + 40);
      ctx.lineTo(centerX, charHeadY + 65);
      ctx.closePath();
      ctx.fill();

      // Dark Trousers
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(centerX - 20, charHeadY + 40 + figH * 0.38, 18, figH * 0.45);
      ctx.fillRect(centerX + 2, charHeadY + 40 + figH * 0.38, 18, figH * 0.45);

      // Formal Shoes
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(centerX - 25, groundY - 10, 22, 10, 4);
      ctx.roundRect(centerX + 3, groundY - 10, 22, 10, 4);
      ctx.fill();
    }

    // ── STAGE 5: ELDER / SENIOR (56+ yr) ──
    else {
      // Slightly stooped posture with cane
      const stoopOffset = 8;
      // Head
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(centerX - stoopOffset, charHeadY + 22, 16, 0, Math.PI * 2);
      ctx.fill();

      // Silver White Hair
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(centerX - stoopOffset, charHeadY + 16, 17, Math.PI, 0);
      ctx.fill();

      // Spectacles / Glasses
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(centerX - stoopOffset - 11, charHeadY + 18, 9, 8);
      ctx.strokeRect(centerX - stoopOffset + 2, charHeadY + 18, 9, 8);
      ctx.beginPath();
      ctx.moveTo(centerX - stoopOffset - 2, charHeadY + 22);
      ctx.lineTo(centerX - stoopOffset + 2, charHeadY + 22);
      ctx.stroke();

      // Traditional Warm Woolen Shawl / Cardigan
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.roundRect(centerX - 26, charHeadY + 42, 46, figH * 0.38, 8);
      ctx.fill();

      // Trousers
      ctx.fillStyle = '#334155';
      ctx.fillRect(centerX - 20, charHeadY + 42 + figH * 0.38, 16, figH * 0.44);
      ctx.fillRect(centerX + 2, charHeadY + 42 + figH * 0.38, 16, figH * 0.44);

      // Wooden Walking Stick (Cane)
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX + 26, charHeadY + 65);
      ctx.lineTo(centerX + 34, groundY);
      // Curved handle
      ctx.arc(centerX + 26, charHeadY + 60, 6, 0, Math.PI, true);
      ctx.stroke();
    }
    ctx.restore();
  }, [ageYears, currentHeightCm]);

  useEffect(() => {
    let handle: number;
    const loop = () => {
      renderCanvas();
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, [renderCanvas]);

  // Quiz Questions for Stage: Challenge
  const quizQuestions = [
    {
      qEn: 'During which life stage do permanent adult teeth replace temporary milk teeth in children?',
      qNe: 'कुन उमेरमा बालबालिकाको दूधका दाँत झरेर स्थायी दाँत आउँछन्?',
      optionsEn: [
        'Middle Childhood (School Age: 6 to 12 years)',
        'Infancy (First 3 months)',
        'Old Age (65+ years)',
        'Adulthood (35 years)',
      ],
      optionsNe: [
        'बाल्यावस्था (विद्यालय जाने उमेर: 6 देखि 12 वर्ष)',
        'शिशु अवस्थामा (पहिलो 3 महिनामा)',
        'वृद्धावस्थामा (65 वर्षपछि)',
        'वयस्क अवस्थामा (35 वर्षमा)',
      ],
      correct: 0,
      expEn: 'Between ages 6 and 12, temporary milk teeth fall out and 32 permanent adult teeth emerge.',
      expNe: '6 देखि 12 वर्षको उमेरमा दूधका दाँत झरेर स्थायी बलिया दाँतहरू आउँछन्।',
    },
    {
      qEn: 'Which essential mineral is most critical for developing strong, elongated bones during human growth?',
      qNe: 'मानिसको हड्डीको वृद्धि र विकासका लागि सबैभन्दा महत्त्वपूर्ण खनिज कुन हो?',
      optionsEn: [
        'Calcium and Vitamin D',
        'Plastic polymer',
        'Rock salt only',
        'Lead and mercury',
      ],
      optionsNe: [
        'क्याल्सियम र भिटामिन डी (Calcium & Vitamin D)',
        'प्लास्टिक',
        'ढुङ्गे नुन मात्र',
        'सिसा र मर्करी',
      ],
      correct: 0,
      expEn: 'Calcium combines with phosphorus to form hydroxyapatite bone crystals under the regulation of Vitamin D.',
      expNe: 'क्याल्सियम र भिटामिन डीले हड्डी र दाँतलाई मजबुत र बलियो बनाउँछन्।',
    },
    {
      qEn: 'Why is mother’s first milk considered the most precious food for a newborn infant?',
      qNe: 'नवजात शिशुका लागि आमाको बिगौते दूध (Colostrum) किन सबैभन्दा महत्त्वपूर्ण अमृत मानिन्छ?',
      optionsEn: [
        'It is rich in antibodies that shield the baby from dangerous diseases and infections',
        'It makes the baby speak English immediately',
        'It turns hair golden yellow',
        'It is as heavy as river stone',
      ],
      optionsNe: [
        'यसमा रोगसँग लड्ने एन्टिबडीहरू हुन्छन् जसले शिशुलाई बिरामी हुनबाट बचाउँछ',
        'यसले तुरुन्तै विदेशी भाषा बोल्न सिकाउँछ',
        'यसले कपाल पहेँलो बनाउँछ',
        'यो ढुङ्गाजस्तै गहु्रङ्गो हुन्छ',
      ],
      correct: 0,
      expEn: 'Colostrum contains concentrated Immunoglobulin A (IgA) that provides natural passive immunity.',
      expNe: 'बिगौते दूधमा रोग प्रतिरोधात्मक क्षमता बढाउने तत्त्व हुन्छ जसले शिशुलाई जीवनभर स्वस्थ राख्छ।',
    },
  ];

  const handleQuizAnswer = (idx: number) => {
    setQuizSelected(idx);
    const curr = quizQuestions[quizIdx];
    if (idx === curr.correct) {
      setQuizFeedback('correct');
      ScienceAudio.playSuccess();
      setStars(3);
      setIsCompleted(true);
    } else {
      setQuizFeedback('wrong');
      ScienceAudio.playBonk();
    }
  };

  return (
    <SimulationLayout
      title="Human Growth & Development Studio"
      titleNepali="मानव वृद्धि तथा विकास प्रयोगशाला"
      chapterNumber={5}
      chapterTitle="Life Process"
      chapterTitleNepali="जीवन प्रक्रिया"
      currentStage={stage}
      onStageChange={(st) => {
        setStage(st);
        ScienceAudio.playClick();
      }}
      lang={lang}
      onLanguageChange={(l) => {
        setLang(l);
        ScienceAudio.playClick();
      }}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
      stars={stars}
      isCompleted={isCompleted}
      currentPromptEn="Drag the age slider from Infancy to Old Age to explore physical growth, height milestones, and nutrition!"
      currentPromptNe="उमेरको स्लाइडर शिशुदेखि वृद्धावस्थासम्म सार्नुहोस् र उचाइ तथा शारीरिक परिवर्तनहरू हेर्नुहोस्!"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 390px',
          height: '100%',
          overflow: 'hidden',
          background: '#ffffff',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN: INTERACTIVE 2D CANVAS VIEWPORT
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <canvas
            ref={canvasRef}
            width={880}
            height={560}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
            }}
          />

          {/* Top Quick Stage Switcher Pills */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              gap: '8px',
              zIndex: 10,
            }}
          >
            {stages.map((st, i) => {
              const isCurrent = currentStageIndex === i;
              const jumpAges = [0, 3, 10, 30, 68];
              return (
                <button
                  key={st.id}
                  onClick={() => {
                    setAgeYears(jumpAges[i]);
                    setIsPlaying(false);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: isCurrent ? `2px solid ${st.themeColor}` : '1px solid rgba(255,255,255,0.2)',
                    background: isCurrent ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {lang === 'en' ? st.nameEn.split(' ')[1] : st.nameNe.split(' ')[1]}
                </button>
              );
            })}
          </div>

          {/* Bottom Interactive Age Scrubber Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              backdropFilter: 'blur(12px)',
              padding: '12px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isPlaying ? '#ef4444' : '#38bdf8',
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <TrendingUp size={18} />
                </button>

                <button
                  onClick={handleReset}
                  title="Reset to 10 Years"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={14} />
                </button>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {lang === 'en' ? currentStageData.nameEn : currentStageData.nameNe}
                  </div>
                  <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                    {lang === 'en' ? `Age: ${ageYears} Years Old • Height: ${currentHeightCm} cm` : `उमेर: ${ageYears} वर्ष • उचाइ: ${currentHeightCm} सेन्टिमिटर`}
                  </div>
                </div>
              </div>

              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {ageYears} yrs
              </span>
            </div>

            {/* Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                0 yrs
              </span>
              <input
                type="range"
                min="0"
                max="80"
                value={ageYears}
                onChange={(e) => {
                  setAgeYears(parseInt(e.target.value));
                  setIsPlaying(false);
                }}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  accentColor: '#38bdf8',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#c084fc' }}>
                80 yrs
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: STAGE MILESTONES & NUTRITION LAB
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            borderLeft: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
          }}
        >
          {/* Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(3, 105, 161, 0.05) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
                {lang === 'en' ? currentStageData.nameEn : currentStageData.nameNe}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.5 }}>
              {lang === 'en' ? currentStageData.milestonesEn : currentStageData.milestonesNe}
            </div>
          </div>

          {/* Nutrition Card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Apple size={14} color="#4ade80" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80' }}>
                {lang === 'en' ? 'NUTRITIONAL REQUIREMENTS' : 'आवश्यक पौष्टिक आहार'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
              {lang === 'en' ? currentStageData.nutritionEn : currentStageData.nutritionNe}
            </div>
          </div>

          {/* Stage 5: Challenge Quiz Card */}
          {stage === 'challenge' && (
            <div
              style={{
                marginTop: 'auto',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Award size={16} color="#eab308" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#eab308' }}>
                  {lang === 'en'
                    ? `Growth Quiz (${quizIdx + 1}/${quizQuestions.length})`
                    : `वृद्धि प्रश्नोत्तर (${quizIdx + 1}/${quizQuestions.length})`}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600, marginBottom: '10px' }}>
                {lang === 'en' ? quizQuestions[quizIdx].qEn : quizQuestions[quizIdx].qNe}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(lang === 'en' ? quizQuestions[quizIdx].optionsEn : quizQuestions[quizIdx].optionsNe).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border:
                        quizSelected === i
                          ? i === quizQuestions[quizIdx].correct
                            ? '1px solid #22c55e'
                            : '1px solid #ef4444'
                          : '1px solid rgba(255,255,255,0.1)',
                      background:
                        quizSelected === i
                          ? i === quizQuestions[quizIdx].correct
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      fontSize: '11px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div style={{ marginTop: '10px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: quizFeedback === 'correct' ? '#4ade80' : '#f87171',
                      marginBottom: '4px',
                    }}
                  >
                    {quizFeedback === 'correct'
                      ? lang === 'en'
                        ? '✓ Correct! Excellent Human Biology Knowledge.'
                        : '✓ स्याबास! सही उत्तर।'
                      : lang === 'en'
                      ? '✗ Not quite. Look closely at the explanation.'
                      : '✗ मिलेन। तलको व्याख्या हेर्नुहोस्।'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    {lang === 'en' ? quizQuestions[quizIdx].expEn : quizQuestions[quizIdx].expNe}
                  </div>
                  {quizIdx < quizQuestions.length - 1 && (
                    <button
                      onClick={() => {
                        setQuizIdx((prev) => prev + 1);
                        setQuizSelected(null);
                        setQuizFeedback(null);
                      }}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#38bdf8',
                        color: '#090d16',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'en' ? 'Next Question →' : 'अर्को प्रश्न →'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Stage Progression Button */}
          <button
            onClick={() => {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
              setStage('challenge');
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Growth Lab & Quiz' : 'प्रयोग पूरा गर्नुहोस् र प्रश्न हल गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
export default HumanGrowthSim;
