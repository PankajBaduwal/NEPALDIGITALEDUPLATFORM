/**
 * ════════════════════════════════════════════════════════════════════════════
 * BOTANICAL LABORATORY: SEED GERMINATION & PLANT LIFE CYCLE
 * वनस्पति प्रयोगशाला: बीउको अङ्कुरण र बिरुवाको जीवन चक्र
 * Class 4 Science - Unit 5: Life Process (जीवन प्रक्रिया)
 *
 * Ultra-realistic botanical simulation:
 * - Clear, museum-grade callout labels with leader lines positioned in safe margins (NEVER inside parts)
 * - Ultra-high definition Himalayan landscape, atmospheric lighting, and clouds
 * - Natural geological soil stratification (O/A/B horizons, pebbles, moisture matrix)
 * - Anatomically accurate dicot kidney bean germination (Testa, Hilum, Micropyle, Cotyledons)
 * - Taproot with Calyptra (Root Cap) and microscopic absorption root hairs
 * - Phototropic hypocotyl arching & heart-shaped true leaves with reticulate venation
 * - Interactive bilingual controls, X-ray cutaway, and 4 experimental condition modes
 * ════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Play,
  Pause,
  RotateCcw,
  Droplets,
  Sun,
  Thermometer,
  Sparkles,
  Check,
  Eye,
  Layers,
  Award,
} from 'lucide-react';

interface DayMilestone {
  day: number;
  stageNameEn: string;
  stageNameNe: string;
  scientificFactEn: string;
  scientificFactNe: string;
  botanyFocusEn: string;
  botanyFocusNe: string;
}

interface CalloutPin {
  key: string;
  targetX: number;
  targetY: number;
  side: 'left' | 'right';
  badgeX: number;
  badgeY: number;
  titleEn: string;
  titleNe: string;
  subEn: string;
  subNe: string;
  color: string;
}

export const SeedGerminationSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Time-lapse progression: 0.0 (Dormant Seed) to 8.0 (Fully Leafed Seedling)
  const [growthDay, setGrowthDay] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Environmental sliders
  const [moistureLevel, setMoistureLevel] = useState<number>(75); // % (0-100)
  const [sunlightLevel, setSunlightLevel] = useState<number>(85); // % (0-100)
  const [temperatureC, setTemperatureC] = useState<number>(25); // °C (0-45)

  // Interactive Tools & View Modes
  const [showXRay, setShowXRay] = useState<boolean>(false); // Seed & Stem internal cross-section
  const [showLabels, setShowLabels] = useState<boolean>(true); // Anatomical callout labels
  const [isWatering, setIsWatering] = useState<boolean>(false); // Active rain animation
  const [inspectedPart, setInspectedPart] = useState<string | null>('seedCoat');
  const [experimentMode, setExperimentMode] = useState<'normal' | 'no-water' | 'no-sun' | 'waterlogged'>('normal');

  // Challenge quiz state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Canvas Reference & Animation Particles
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rainDropsRef = useRef<Array<{ x: number; y: number; speed: number; length: number; opacity: number }>>([]);
  const soilMoistureParticlesRef = useRef<Array<{ x: number; y: number; radius: number; alpha: number }>>([]);
  const sapParticlesRef = useRef<Array<{ progress: number; speed: number; xOffset: number }>>([]);
  const calloutHitBoxesRef = useRef<Array<{ key: string; x: number; y: number; w: number; h: number }>>([]);

  const dayMilestones: DayMilestone[] = [
    {
      day: 0,
      stageNameEn: 'Day 0: Dormant Dry Seed (सुप्त बीउ)',
      stageNameNe: 'दिन ०: आराम गरिरहेको सुक्खा बीउ',
      scientificFactEn: 'The dry kidney bean is in a dormant state with less than 10% water. The embryo waits for warm moisture to awaken.',
      scientificFactNe: 'बीउ आरामको अवस्थामा छ। पानी र न्यानोपन पाएपछि मात्र यसभित्रको सुप्त जीवन (भ्रूण) जाग्छ।',
      botanyFocusEn: 'Dormancy protects the seed during harsh winters and dry seasons.',
      botanyFocusNe: 'सुप्तावस्थाले बीउलाई चिसो र खडेरीबाट जोगाउँछ।',
    },
    {
      day: 1,
      stageNameEn: 'Day 1: Imbibition & Swelling (पानी सोस्ने)',
      stageNameNe: 'दिन १: बीउले पानी सोसेर फुल्छ',
      scientificFactEn: 'The seed absorbs water through the micropyle pore. It swells by over 35%, softening the tough seed coat (testa).',
      scientificFactNe: 'बीउले सानो छिद्र (Micropyle) बाट पानी सोस्छ, जसले गर्दा बीउ फुलेर बाहिरी बोक्रा नरम हुन्छ।',
      botanyFocusEn: 'Water activates enzymes that convert stored starch into glucose energy.',
      botanyFocusNe: 'पानीले बीउभित्रका इन्जाइम सक्रिय बनाउँछ र खाना पग्लन थाल्छ।',
    },
    {
      day: 2,
      stageNameEn: 'Day 2: Testa Cracking & Radicle Eruption (बोक्रा फुट्ने)',
      stageNameNe: 'दिन २: बीउको बाहिरी बोक्रा फुट्छ',
      scientificFactEn: 'Internal turgor pressure splits the seed coat open. The radicle (embryonic primary root) begins to push out.',
      scientificFactNe: 'भित्री चापले गर्दा कडा बोक्रा फुट्छ र पहिलो जरा (Radicle) बाहिर निस्कन थाल्छ।',
      botanyFocusEn: 'The root cap (calyptra) protects delicate dividing cells as it enters soil.',
      botanyFocusNe: 'जराको टुप्पोमा रहेको टोपी (Calyptra) ले माटोभित्र पस्दा जरालाई चोट लाग्न दिँदैन।',
    },
    {
      day: 3,
      stageNameEn: 'Day 3: Gravitropism & Taproot Extension (जरा तल सर्ने)',
      stageNameNe: 'दिन ३: जरा गुरुत्वाकर्षणतिर तल बढ्छ',
      scientificFactEn: 'Statolith cells in the root tip detect gravity (positive gravitropism), driving the primary root deeper into moist loam.',
      scientificFactNe: 'जराका कोषहरूले गुरुत्वाकर्षण थाहा पाउँछन् र जरा सिधै तल माटोको गहिराइतिर जान्छ।',
      botanyFocusEn: 'Fine microscopic root hairs begin emerging to absorb dissolved minerals.',
      botanyFocusNe: 'पानी र खनिज सोस्नका लागि जरामा मसिनो सेता रौँहरू उम्रन थाल्छन्।',
    },
    {
      day: 4,
      stageNameEn: 'Day 4: Hypocotyl Hook Arching (काण्डको धनुष आकार)',
      stageNameNe: 'दिन ४: डाँठ धनुषझैँ बांगिएर माटो फोड्छ',
      scientificFactEn: 'The hypocotyl stem elongates and curves into an inverted "U" arch, pulling the fragile cotyledons upward without damaging them.',
      scientificFactNe: 'डाँठ धनुषझैँ बांगिएर माटो फोड्दै माथि आउँछ, जसले गर्दा बीउका कलिला पात सुरक्षित रहन्छन्।',
      botanyFocusEn: 'Negative gravitropism directs the shoot away from the earth and toward light.',
      botanyFocusNe: 'काण्ड जमिनभन्दा विपरीत उज्यालोतर्फ माथि बढ्छ।',
    },
    {
      day: 5,
      stageNameEn: 'Day 5: Soil Breakthrough & Phototropism (जमिन बाहिर निस्कने)',
      stageNameNe: 'दिन ५: बिरुवा जमिनमाथि निस्कन्छ',
      scientificFactEn: 'The shoot breaks free of the soil surface. Exposure to sunlight triggers phototropism, straightening the hypocotyl stem.',
      scientificFactNe: 'बिरुवा जमिनमाथि देखा पर्छ। घामको प्रकाश देख्नासाथ डाँठ सिधा हुन थाल्छ।',
      botanyFocusEn: 'Light triggers chlorophyll synthesis, turning pale stems into vibrant green.',
      botanyFocusNe: 'घामको किरणले गर्दा पहेंलो डाँठ हरियो बन्न थाल्छ।',
    },
    {
      day: 6,
      stageNameEn: 'Day 6: Cotyledons Open & Green (दलहरू खुल्ने)',
      stageNameNe: 'दिन ६: बीउका दलहरू (Cotyledons) खुल्छन्',
      scientificFactEn: 'The twin cotyledons spread open like leaves, turning green to nourish the seedling while the seed coat drops away.',
      scientificFactNe: 'बीउका दुई दलहरू पातझैँ खुल्छन् र हरियो भएर बिरुवालाई खाना दिन थाल्छन्।',
      botanyFocusEn: 'Secondary lateral roots branch extensively to anchor the growing plant.',
      botanyFocusNe: 'बिरुवालाई बलियोसँग अड्याउन शाखा जराहरू चारैतिर फैलिन्छन्।',
    },
    {
      day: 7,
      stageNameEn: 'Day 7: Plumule Unfurling & First True Leaves (पहिलो हरिया पात)',
      stageNameNe: 'दिन ७: मुन्टोबाट वास्तविक पातहरू निस्कन्छन्',
      scientificFactEn: 'The epicotyl and plumule emerge from between the cotyledons, unfurling heart-shaped true leaves with visible veins.',
      scientificFactNe: 'दलहरूको बीचबाट मुन्टो पलाउँछ र नसा भएका वास्तविक हरिया पातहरू फैलिन्छन्।',
      botanyFocusEn: 'Stomata on the new leaves open to absorb carbon dioxide for active photosynthesis.',
      botanyFocusNe: 'पातका मसिना प्वाल (Stomata) बाट हावा लिँदै खाना बनाउने काम सुरु हुन्छ।',
    },
    {
      day: 8,
      stageNameEn: 'Day 8: Autonomous Seedling & Active Photosynthesis (आत्मनिर्भर बिरुवा)',
      stageNameNe: 'दिन ८: बिरुवा पूर्ण रूपमा आत्मनिर्भर बन्छ',
      scientificFactEn: 'The cotyledons shrivel after transferring all energy reserves. The seedling is now self-sufficient through photosynthesis and root absorption.',
      scientificFactNe: 'खाना सकिएपछि पुराना दलहरू सुक्छन् र बिरुवा आफ्नै पात र जराको भरमा हुर्कन थाल्छ।',
      botanyFocusEn: 'The plant is now a fully established independent organism capable of autotrophic life.',
      botanyFocusNe: 'बिरुवा अब आफैं खाना बनाउने पूर्ण जीवन चक्रमा प्रवेश गरेको छ।',
    },
  ];

  const currentMilestone =
    dayMilestones.find((m) => Math.floor(growthDay) === m.day) || dayMilestones[0];

  const anatomyData: Record<
    string,
    { nameEn: string; nameNe: string; descEn: string; descNe: string; roleEn: string; roleNe: string; color: string }
  > = {
    seedCoat: {
      nameEn: 'Seed Coat (Testa & Micropyle)',
      nameNe: 'बीउको बाहिरी बोक्रा (Testa)',
      descEn: 'The tough, protective outer shield of the bean seed. Features the hilum attachment scar and the microscopic micropyle pore that permits water imbibition.',
      descNe: 'बीउलाई किरा, चोट र सुक्खापनबाट बचाउने कडा बाहिरी छाला। यसमा रहेको सानो छिद्र (Micropyle) बाट पानी भित्र पस्छ।',
      roleEn: 'Protection & Controlled Hydration',
      roleNe: 'सुरक्षा र पानी सोस्ने नियन्त्रण',
      color: '#854d0e',
    },
    cotyledon: {
      nameEn: 'Cotyledons (Twin Seed Leaves)',
      nameNe: 'बीउका दलहरू (Cotyledons)',
      descEn: 'The fleshy twin halves of a bean packed with stored starch, proteins, and minerals. They supply all energy until the true leaves open and photosynthesize.',
      descNe: 'बीउभित्रको खानाको भण्डार। यसमा स्टार्च र प्रोटिन हुन्छ जसले नयाँ पात ननिस्कुन्जेल बिरुवालाई पोषण दिन्छ।',
      roleEn: 'Energy & Nutrient Reserve for Embryo',
      roleNe: 'बिरुवाको लागि पहिलो खानाको भण्डार',
      color: '#ca8a04',
    },
    radicle: {
      nameEn: 'Radicle (Embryonic Primary Root)',
      nameNe: 'मूल जरा (Radicle)',
      descEn: 'The very first embryonic structure that cracks through the seed coat. It exhibits positive gravitropism, growing downward to anchor the plant and drink groundwater.',
      descNe: 'बीउबाट सबैभन्दा पहिले निस्कने भाग। यो बिरुवालाई जमिनमा अड्याउन र पानी पिउन सिधै तल माटोभित्र जान्छ।',
      roleEn: 'Anchorage & Water Absorption',
      roleNe: 'बिरुवालाई अड्याउने र पानी सोस्ने',
      color: '#0284c7',
    },
    rootHairs: {
      nameEn: 'Root Hairs (Absorption Zone)',
      nameNe: 'जराका मसिनो रौँहरू (Root Hairs)',
      descEn: 'Thousands of microscopic, single-celled epidermal filaments that radiate into soil pore spaces, increasing root surface area by over 500% to maximize water absorption.',
      descNe: 'जराको वरिपरि पलाउने हजारौं मसिनो सेता रौँहरू। यिनले माटोबाट प्रशस्त पानी र खनिज मल सोस्न मद्दत गर्छन्।',
      roleEn: 'Maximizing Mineral & Water Uptake',
      roleNe: 'धेरै पानी सोस्न जराको क्षेत्रफल बढाउने',
      color: '#06b6d4',
    },
    hypocotyl: {
      nameEn: 'Hypocotyl (Stem Hook)',
      nameNe: 'काण्ड वा डाँठ (Hypocotyl Stem)',
      descEn: 'The embryonic stem between the radicle and cotyledons. It arches into an inverted "U" shape to penetrate the dense soil crust without tearing the delicate shoot apex.',
      descNe: 'जरा र बीउको बीचको डाँठ। यो धनुषझैँ बांगिएर माटो फोड्दै बाहिर निस्कन्छ र घाम देखेपछि सिधा हुन्छ।',
      roleEn: 'Soil Breakthrough & Lifting Cotyledons',
      roleNe: 'पातहरूलाई जमिनभन्दा माथि घामतिर उठाउने',
      color: '#16a34a',
    },
    plumule: {
      nameEn: 'Plumule & True Foliage Leaves',
      nameNe: 'वास्तविक हरिया पातहरू (True Leaves)',
      descEn: 'The shoot apex nestled between the cotyledons. Once elevated into sunlight, it expands into broad, vein-threaded heart-shaped green leaves capable of active photosynthesis.',
      descNe: 'बिरुवाको मुन्टोबाट निस्कने हरिया पातहरू। यिनले घामको प्रकाश, हावाको कार्बन डाइअक्साइड र जराको पानी मिलाएर खाना बनाउँछन्।',
      roleEn: 'Photosynthesis & Autotrophic Energy',
      roleNe: 'प्रकाश संश्लेषणबाट खाना र अक्सिजन बनाउने',
      color: '#15803d',
    },
  };

  // Automated time-lapse loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setGrowthDay((prev) => {
          if (prev >= 8.0) {
            setIsPlaying(false);
            ScienceAudio.playCelebration();
            setStars(3);
            setIsCompleted(true);
            return 8.0;
          }
          return Math.min(8.0, prev + 0.05 * playbackSpeed);
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Rain drop particles initialization
  useEffect(() => {
    const drops = [];
    for (let i = 0; i < 45; i++) {
      drops.push({
        x: Math.random() * 880,
        y: Math.random() * 400,
        speed: 7 + Math.random() * 9,
        length: 12 + Math.random() * 12,
        opacity: 0.4 + Math.random() * 0.5,
      });
    }
    rainDropsRef.current = drops;

    // Soil moisture shimmering particles
    const moisture = [];
    for (let i = 0; i < 40; i++) {
      moisture.push({
        x: 80 + Math.random() * 720,
        y: 280 + Math.random() * 250,
        radius: 1.5 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.6,
      });
    }
    soilMoistureParticlesRef.current = moisture;

    // Vascular sap particles
    const sap = [];
    for (let i = 0; i < 15; i++) {
      sap.push({
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.012,
        xOffset: (Math.random() - 0.5) * 4,
      });
    }
    sapParticlesRef.current = sap;
  }, []);

  // ═════════════════════════════════════════════════════════════════════
  // MAIN 2D BOTANICAL CANVAS RENDERING
  // ═════════════════════════════════════════════════════════════════════
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const groundY = height * 0.44; // Natural ground line (44% from top)
    const centerX = width * 0.5;

    // Effective growth progress factor (0.0 to 1.0)
    let effectiveDay = growthDay;
    if (experimentMode === 'no-water') {
      effectiveDay = Math.min(0.5, growthDay);
    } else if (experimentMode === 'waterlogged') {
      effectiveDay = Math.min(2.5, growthDay);
    }

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // ─────────────────────────────────────────────────────────────
    // 1. SKY, ATMOSPHERE & HIMALAYAN PANORAMA (Above Ground)
    // ─────────────────────────────────────────────────────────────
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    if (experimentMode === 'no-sun') {
      // Dark closet / cardboard box condition
      skyGrad.addColorStop(0, '#1e293b');
      skyGrad.addColorStop(1, '#0f172a');
    } else {
      const sunRatio = sunlightLevel / 100;
      skyGrad.addColorStop(0, '#0284c7'); // Deep Himalayan azure
      skyGrad.addColorStop(0.35, '#38bdf8'); // Sky blue
      skyGrad.addColorStop(0.7, '#7dd3fc');
      skyGrad.addColorStop(0.9, '#bae6fd');
      skyGrad.addColorStop(1, `rgba(254, 243, 199, ${0.5 + sunRatio * 0.4})`); // Warm golden horizon
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, groundY);

    if (experimentMode !== 'no-sun') {
      // Distant Majestic Snow-Capped Himalayan Peaks
      ctx.save();
      // Peak 1: Left Annapurna Range
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(80, groundY - 65);
      ctx.lineTo(130, groundY - 45);
      ctx.lineTo(190, groundY - 80);
      ctx.lineTo(260, groundY);
      ctx.closePath();
      ctx.fill();

      // Peak 1 Snow highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(80, groundY - 65);
      ctx.lineTo(65, groundY - 40);
      ctx.lineTo(95, groundY - 42);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(190, groundY - 80);
      ctx.lineTo(170, groundY - 50);
      ctx.lineTo(210, groundY - 55);
      ctx.closePath();
      ctx.fill();

      // Peak 2: Right Majestic Mount Machapuchare / Manaslu Silhouette
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(width - 290, groundY);
      ctx.lineTo(width - 200, groundY - 95);
      ctx.lineTo(width - 150, groundY - 60);
      ctx.lineTo(width - 90, groundY - 85);
      ctx.lineTo(width, groundY - 30);
      ctx.lineTo(width, groundY);
      ctx.closePath();
      ctx.fill();

      // Snow Face
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(width - 200, groundY - 95);
      ctx.lineTo(width - 220, groundY - 60);
      ctx.lineTo(width - 175, groundY - 65);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Mid-Range Terraced Pine Hills (Lush Greenery with atmospheric haze)
      ctx.fillStyle = 'rgba(21, 128, 61, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.bezierCurveTo(width * 0.2, groundY - 38, width * 0.45, groundY - 18, width * 0.68, groundY - 42);
      ctx.bezierCurveTo(width * 0.85, groundY - 55, width * 0.95, groundY - 25, width, groundY);
      ctx.fill();

      // Soft Floating Cumulus Clouds
      const cloudTime = Date.now() * 0.0003;
      const drawCloud = (cx: number, cy: number, scale: number) => {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 20 * scale, cy - 8 * scale, 24 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 42 * scale, cy - 2 * scale, 20 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 60 * scale, cy + 4 * scale, 15 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawCloud(((cloudTime * 40) % (width + 120)) - 60, 48, 1.0);
      drawCloud((((cloudTime * 25) + 400) % (width + 160)) - 80, 75, 0.75);

      // Radiant Sun, Corona & Volumetric Beams
      const sunX = width * 0.82;
      const sunY = height * 0.14;
      const sunBrightness = sunlightLevel / 100;

      // Volumetric Sunbeams pointing toward the germination seedbed
      ctx.save();
      const beamGrad = ctx.createLinearGradient(sunX, sunY, centerX, groundY);
      beamGrad.addColorStop(0, `rgba(254, 240, 138, ${0.15 * sunBrightness})`);
      beamGrad.addColorStop(0.7, `rgba(254, 240, 138, ${0.05 * sunBrightness})`);
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(centerX - 120, groundY);
      ctx.lineTo(centerX + 100, groundY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Sun Outer Corona Aura
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 140 * sunBrightness);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      sunGlow.addColorStop(0.25, 'rgba(251, 191, 36, 0.55)');
      sunGlow.addColorStop(0.65, 'rgba(245, 158, 11, 0.18)');
      sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 140 * sunBrightness, 0, Math.PI * 2);
      ctx.fill();

      // Sun Core Disk
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Shimmering Sun Rays
      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.strokeStyle = `rgba(253, 224, 71, ${0.3 + sunBrightness * 0.4})`;
      ctx.lineWidth = 2.5;
      const rayTime = Date.now() * 0.0008;
      for (let i = 0; i < 12; i++) {
        const angle = rayTime + (i * Math.PI) / 6;
        const rLen = 52 + Math.sin(rayTime * 3 + i) * 10;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 32, Math.sin(angle) * 32);
        ctx.lineTo(Math.cos(angle) * rLen, Math.sin(angle) * rLen);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────
    // 2. GEOLOGICAL SUBTERRANEAN STRATIFIED SOIL CROSS-SECTION
    // ─────────────────────────────────────────────────────────────
    const moistFactor = moistureLevel / 100;

    // Soil Horizon O: Organic Humus Layer (Rich, dark crumbly earth)
    const humusDark = moistFactor > 0.5 ? '#241206' : '#361d0d';
    const topsoilWarm = moistFactor > 0.5 ? '#3d200e' : '#522f18';
    const soilTopGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 75);
    soilTopGrad.addColorStop(0, humusDark);
    soilTopGrad.addColorStop(1, topsoilWarm);
    ctx.fillStyle = soilTopGrad;
    ctx.fillRect(0, groundY, width, 75);

    // Soil Horizon A & B: Loamy Subsoil (Mineral clay, quartz, gravel)
    const subsoilColor = moistFactor > 0.5 ? '#532f17' : '#6b4022';
    const subsoilGrad = ctx.createLinearGradient(0, groundY + 75, 0, height);
    subsoilGrad.addColorStop(0, topsoilWarm);
    subsoilGrad.addColorStop(0.45, subsoilColor);
    subsoilGrad.addColorStop(1, '#341a0b');
    ctx.fillStyle = subsoilGrad;
    ctx.fillRect(0, groundY + 75, width, height - (groundY + 75));

    // Realistic Soil Aggregates & Micro-granule Specks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 50; i++) {
      const sx = (i * 43) % width;
      const sy = groundY + 12 + ((i * 29) % (height - groundY - 20));
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let i = 0; i < 45; i++) {
      const sx = (i * 57 + 15) % width;
      const sy = groundY + 20 + ((i * 37) % (height - groundY - 30));
      ctx.fillRect(sx, sy, 3, 2);
    }

    // Embedded 3D River Pebbles & Granite Stones with Highlights
    const pebbles = [
      { x: width * 0.16, y: groundY + 70, rx: 14, ry: 9, col: '#78716c' },
      { x: width * 0.28, y: groundY + 145, rx: 18, ry: 11, col: '#a8a29e' },
      { x: width * 0.76, y: groundY + 90, rx: 15, ry: 9, col: '#64748b' },
      { x: width * 0.86, y: groundY + 175, rx: 22, ry: 13, col: '#78716c' },
      { x: width * 0.22, y: groundY + 225, rx: 17, ry: 10, col: '#57534e' },
      { x: width * 0.72, y: groundY + 215, rx: 19, ry: 12, col: '#94a3b8' },
    ];
    pebbles.forEach((peb) => {
      // Pebble bottom shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(peb.x + 2, peb.y + 3, peb.rx, peb.ry, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Pebble body
      ctx.fillStyle = peb.col;
      ctx.beginPath();
      ctx.ellipse(peb.x, peb.y, peb.rx, peb.ry, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Top specular rim
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(peb.x, peb.y - 1.5, peb.rx * 0.75, peb.ry * 0.6, 0.15, Math.PI, Math.PI * 2);
      ctx.stroke();
    });

    // Subsoil Moisture Shimmering Water Droplets
    if (moistureLevel > 15) {
      soilMoistureParticlesRef.current.forEach((mp) => {
        ctx.fillStyle = `rgba(56, 189, 248, ${mp.alpha * moistFactor})`;
        ctx.beginPath();
        ctx.arc(mp.x, mp.y, mp.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Surface Turf Layer & Lush Swaying Grass
    const turfGrad = ctx.createLinearGradient(0, groundY - 6, 0, groundY + 6);
    turfGrad.addColorStop(0, '#15803d');
    turfGrad.addColorStop(1, '#166534');
    ctx.fillStyle = turfGrad;
    ctx.fillRect(0, groundY - 3, width, 6);

    // Multi-Layer Grass Blades (Back forest green + Front emerald)
    const timeSec = Date.now() * 0.002;
    // Back layer
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2.5;
    for (let x = 4; x < width; x += 16) {
      const sway = Math.sin(timeSec + x) * 2.5;
      const bladeH = 9 + (Math.sin(x * 9) * 4 + 4);
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.quadraticCurveTo(x + sway * 0.4, groundY - bladeH * 0.5, x + sway, groundY - bladeH);
      ctx.stroke();
    }
    // Front layer
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.8;
    for (let x = 10; x < width; x += 14) {
      const sway = Math.sin(timeSec + x + 1) * 3;
      const bladeH = 12 + (Math.sin(x * 13) * 5 + 4);
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.quadraticCurveTo(x + sway * 0.5, groundY - bladeH * 0.6, x + sway, groundY - bladeH);
      ctx.stroke();
    }

    // ─────────────────────────────────────────────────────────────
    // 3. ANATOMICAL SEED POSITION & EMBRYO SWELLING
    // ─────────────────────────────────────────────────────────────
    const seedY = groundY + 62;
    const initialSeedRadius = 24;

    // Imbibition swelling: swells from 1.0 to 1.35x between Day 0 and Day 2
    let swellFactor = 1.0;
    if (effectiveDay > 0) {
      swellFactor = 1.0 + Math.min(0.35, effectiveDay * 0.18) * moistFactor;
    }
    const seedWidth = initialSeedRadius * swellFactor;
    const seedHeight = initialSeedRadius * 0.72 * swellFactor;

    // ─────────────────────────────────────────────────────────────
    // 4. UNDERGROUND ROOT SYSTEM (Radicle, Meristem, Root Hairs)
    // ─────────────────────────────────────────────────────────────
    let rTipX = centerX - 6;
    let rTipY = seedY + 12;
    const rootProgress = Math.min(1.0, Math.max(0, (effectiveDay - 1.5) / 5.5));
    const maxRootDepth = 155 * rootProgress;

    if (effectiveDay >= 1.5) {
      ctx.save();
      // Primary Taproot (Radicle)
      ctx.strokeStyle = '#fef9c3'; // Living root tissue cream
      ctx.lineWidth = 6.5 * (1 - rootProgress * 0.3);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX - 8, seedY + 6);

      const rP1x = centerX - 12;
      const rP1y = seedY + 30;
      const rP2x = centerX - 5;
      const rP2y = seedY + 70;
      rTipX = centerX - 8 + Math.sin(effectiveDay * 0.9) * 4;
      rTipY = seedY + 12 + maxRootDepth;

      ctx.bezierCurveTo(rP1x, rP1y, rP2x, rP2y, rTipX, rTipY);
      ctx.stroke();

      // Root Cap (Calyptra) at the apical meristem
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(rTipX, rTipY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Microscopic Root Hairs Zone (Day 3.0+)
      if (effectiveDay >= 3.0) {
        const hairAlpha = Math.min(1.0, (effectiveDay - 3.0) / 1.5);
        ctx.strokeStyle = `rgba(254, 249, 195, ${0.85 * hairAlpha})`;
        ctx.lineWidth = 1.3;

        const hairCount = 24;
        for (let i = 0; i < hairCount; i++) {
          const tPos = 0.22 + (i / hairCount) * 0.65;
          const hy = seedY + 16 + maxRootDepth * tPos;
          const hx = centerX - 9;
          const hairLen = (9 + Math.sin(i * 3) * 6) * hairAlpha;

          // Left hair
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx - hairLen, hy + Math.sin(i * 2) * 3);
          ctx.stroke();

          // Right hair
          ctx.beginPath();
          ctx.moveTo(hx + 4, hy);
          ctx.lineTo(hx + 4 + hairLen, hy + Math.cos(i * 2) * 3);
          ctx.stroke();
        }
      }

      // Secondary Lateral Roots (Day 5.0+)
      if (effectiveDay >= 5.0) {
        const branchProgress = Math.min(1.0, (effectiveDay - 5.0) / 3.0);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.6;

        // Branch 1: Left lateral
        ctx.beginPath();
        ctx.moveTo(centerX - 10, seedY + 48);
        ctx.quadraticCurveTo(centerX - 35, seedY + 65, centerX - 55 * branchProgress, seedY + 95 * branchProgress);
        ctx.stroke();

        // Branch 2: Right lateral
        ctx.beginPath();
        ctx.moveTo(centerX - 4, seedY + 68);
        ctx.quadraticCurveTo(centerX + 35, seedY + 85, centerX + 50 * branchProgress, seedY + 120 * branchProgress);
        ctx.stroke();

        // Branch 3: Deep lower lateral
        if (effectiveDay >= 6.5) {
          ctx.beginPath();
          ctx.moveTo(centerX - 7, seedY + 98);
          ctx.quadraticCurveTo(centerX - 32, seedY + 122, centerX - 45 * branchProgress, seedY + 150 * branchProgress);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────
    // 5. ABOVE-GROUND SHOOT (Hypocotyl Arch & Stem)
    // ─────────────────────────────────────────────────────────────
    let stemTipX = centerX;
    let stemTipY = seedY;

    if (effectiveDay >= 3.5) {
      ctx.save();
      const isEtiolated = experimentMode === 'no-sun';
      const stemColor = isEtiolated ? '#fef08a' : '#22c55e';

      ctx.strokeStyle = stemColor;
      ctx.lineWidth = isEtiolated ? 4.5 : 6.5;
      ctx.lineCap = 'round';

      if (effectiveDay < 5.2) {
        // Hypocotyl Hook Arch Phase (inverted "U" rising through soil)
        const archHeight = (effectiveDay - 3.5) * 34;
        const archApexY = seedY - archHeight;

        ctx.beginPath();
        ctx.moveTo(centerX + 6, seedY);
        ctx.bezierCurveTo(centerX + 18, seedY - archHeight * 0.7, centerX + 8, archApexY, centerX - 4, archApexY + 10);
        ctx.stroke();

        stemTipX = centerX - 4;
        stemTipY = archApexY + 10;
      } else {
        // Straightening Upright Phase (Phototropism toward sunlight)
        const straightProgress = Math.min(1.0, (effectiveDay - 5.2) / 2.8);
        const stemHeight = 72 + straightProgress * 115 * (isEtiolated ? 1.35 : 1.0);
        const uprightY = groundY - stemHeight;
        const windSway = Math.sin(Date.now() * 0.002) * (straightProgress * 4.5);

        ctx.beginPath();
        ctx.moveTo(centerX - 4, seedY);
        ctx.bezierCurveTo(
          centerX - 6,
          groundY + 15,
          centerX + windSway * 0.5,
          groundY - stemHeight * 0.45,
          centerX + windSway,
          uprightY
        );
        ctx.stroke();

        stemTipX = centerX + windSway;
        stemTipY = uprightY;

        // Animated Vascular Xylem/Phloem Sap Flow (in X-ray mode)
        if (effectiveDay >= 5.5 && showXRay) {
          sapParticlesRef.current.forEach((sp) => {
            sp.progress += sp.speed;
            if (sp.progress > 1.0) sp.progress = 0;
            const sapY = seedY - sp.progress * (seedY - uprightY);
            const sapX = centerX + (sp.progress - 0.5) * windSway + sp.xOffset;

            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(sapX, sapY, 1.8, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }
      ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────
    // 6. THE SEED & COTYLEDONS (Kidney Bean Volume & Cutaway)
    // ─────────────────────────────────────────────────────────────
    ctx.save();
    let cotylX = centerX;
    let cotylY = seedY;

    if (effectiveDay >= 5.2) {
      cotylX = stemTipX;
      cotylY = stemTipY;
    }

    if (showXRay || effectiveDay < 2.0) {
      // ═══════════════════════════════════════════════════════════
      // INNER ANATOMICAL CUTAWAY (X-RAY CROSS SECTION)
      // ═══════════════════════════════════════════════════════════
      // 1. Testa Border
      ctx.fillStyle = '#854d0e';
      ctx.beginPath();
      ctx.ellipse(cotylX, cotylY, seedWidth, seedHeight, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // 2. Twin Cotyledons (Starch food stores)
      ctx.fillStyle = effectiveDay < 5.0 ? '#fef08a' : '#86efac';
      ctx.beginPath();
      ctx.ellipse(cotylX, cotylY, seedWidth * 0.88, seedHeight * 0.86, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Central fissure line
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cotylX - seedWidth * 0.7, cotylY - 2);
      ctx.lineTo(cotylX + seedWidth * 0.7, cotylY + 2);
      ctx.stroke();

      // 3. Sleeping Embryo Axis (Plumule & Radicle inside)
      if (effectiveDay < 4.0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cotylX - 4, cotylY - 4, 8, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(cotylX - 8, cotylY - 6, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hilum & Micropyle Pore Marker
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(cotylX - seedWidth * 0.6, cotylY - seedHeight * 0.45, 5, 2.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cotylX - seedWidth * 0.6 + 6, cotylY - seedHeight * 0.45, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // ═══════════════════════════════════════════════════════════
      // REALISTIC EXTERNAL SEED / OPEN COTYLEDONS
      // ═══════════════════════════════════════════════════════════
      if (effectiveDay < 5.2) {
        // Underground bean seed
        const beanGrad = ctx.createLinearGradient(cotylX - seedWidth, cotylY - seedHeight, cotylX + seedWidth, cotylY + seedHeight);
        beanGrad.addColorStop(0, '#92400e');
        beanGrad.addColorStop(0.6, '#78350f');
        beanGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = beanGrad;
        ctx.beginPath();
        ctx.ellipse(cotylX, cotylY, seedWidth, seedHeight, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // 3D Glossy Specular Sheen Reflection
        const shineGrad = ctx.createLinearGradient(cotylX - 10, cotylY - 14, cotylX + 10, cotylY);
        shineGrad.addColorStop(0, 'rgba(255,255,255,0.45)');
        shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = shineGrad;
        ctx.beginPath();
        ctx.ellipse(cotylX - 4, cotylY - 6, seedWidth * 0.65, seedHeight * 0.42, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Hilum Attachment Scar
        ctx.fillStyle = '#3f1805';
        ctx.beginPath();
        ctx.ellipse(cotylX - 10, cotylY - 4, 6, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Organic Crack Fissure on Day 2+
        if (effectiveDay >= 2.0) {
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(cotylX - 6, cotylY - 8);
          ctx.lineTo(cotylX - 12, cotylY + 8);
          ctx.stroke();
        }
      } else {
        // Unfolded Cotyledons Above Ground (Open like green ears)
        const openSpread = Math.min(1.0, (effectiveDay - 5.2) / 1.8);
        const cotylColor = experimentMode === 'no-sun' ? '#fef08a' : '#4ade80';

        // Left Cotyledon
        ctx.fillStyle = cotylColor;
        ctx.beginPath();
        ctx.ellipse(cotylX - 15 * openSpread, cotylY - 4, 13, 8, -0.4 * openSpread, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Right Cotyledon
        ctx.fillStyle = cotylColor;
        ctx.beginPath();
        ctx.ellipse(cotylX + 15 * openSpread, cotylY - 4, 13, 8, 0.4 * openSpread, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();

    // ─────────────────────────────────────────────────────────────
    // 7. TRUE FOLIAGE LEAVES & ACTIVE PHOTOSYNTHESIS (Day 6.0+)
    // ─────────────────────────────────────────────────────────────
    let leafBaseX = stemTipX;
    let leafBaseY = stemTipY - 10;

    if (effectiveDay >= 6.0) {
      ctx.save();
      const leafSpread = Math.min(1.0, (effectiveDay - 6.0) / 2.0);
      const isEtiolated = experimentMode === 'no-sun';
      const leafColor = isEtiolated ? '#fef08a' : '#16a34a';
      const veinColor = isEtiolated ? '#fde047' : '#86efac';

      leafBaseX = stemTipX;
      leafBaseY = stemTipY - 10;
      const leafLength = 36 * leafSpread;
      const leafWidth = 22 * leafSpread;

      // Left True Leaf
      ctx.save();
      ctx.translate(leafBaseX, leafBaseY);
      ctx.rotate(-0.55 * leafSpread);

      ctx.fillStyle = leafColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-leafWidth * 0.8, -leafLength * 0.4, -leafWidth, -leafLength * 0.8, 0, -leafLength);
      ctx.bezierCurveTo(leafWidth * 0.4, -leafLength * 0.7, leafWidth * 0.3, -leafLength * 0.3, 0, 0);
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Veins
      ctx.strokeStyle = veinColor;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -leafLength * 0.95);
      ctx.moveTo(0, -leafLength * 0.3);
      ctx.lineTo(-leafWidth * 0.45, -leafLength * 0.45);
      ctx.moveTo(0, -leafLength * 0.6);
      ctx.lineTo(-leafWidth * 0.4, -leafLength * 0.7);
      ctx.stroke();
      ctx.restore();

      // Right True Leaf
      ctx.save();
      ctx.translate(leafBaseX, leafBaseY);
      ctx.rotate(0.55 * leafSpread);

      ctx.fillStyle = leafColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(leafWidth * 0.8, -leafLength * 0.4, leafWidth, -leafLength * 0.8, 0, -leafLength);
      ctx.bezierCurveTo(-leafWidth * 0.4, -leafLength * 0.7, -leafWidth * 0.3, -leafLength * 0.3, 0, 0);
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Veins
      ctx.strokeStyle = veinColor;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -leafLength * 0.95);
      ctx.moveTo(0, -leafLength * 0.3);
      ctx.lineTo(leafWidth * 0.45, -leafLength * 0.45);
      ctx.moveTo(0, -leafLength * 0.6);
      ctx.lineTo(leafWidth * 0.4, -leafLength * 0.7);
      ctx.stroke();
      ctx.restore();

      // Photosynthesis Oxygen Bubbles in Sunlight
      if (!isEtiolated && sunlightLevel > 30) {
        const bubbleTime = Date.now() * 0.003;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        for (let i = 0; i < 6; i++) {
          const bx = leafBaseX + Math.sin(bubbleTime + i * 2) * 35;
          const by = leafBaseY - 20 - ((bubbleTime * 25 + i * 18) % 65);
          ctx.beginPath();
          ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────
    // 8. INTERACTIVE RAINFALL ANIMATION (When Watering)
    // ─────────────────────────────────────────────────────────────
    if (isWatering) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      rainDropsRef.current.forEach((drop) => {
        drop.y += drop.speed;
        if (drop.y > groundY + 50) {
          drop.y = -10;
          drop.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.length);
        ctx.stroke();
      });

      // Water Spout Can Badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(width * 0.34, 16, width * 0.32, 38, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'en' ? '💧 Watering the Soil Matrix...' : '💧 माटोमा पानी हालिँदैछ...', width * 0.5, 40);
      ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────
    // 9. MUSEUM-GRADE CALLOUT LABELS & LEADER LINES
    //    (Zero collision: positioned strictly in external side margins)
    // ─────────────────────────────────────────────────────────────
    calloutHitBoxesRef.current = [];

    if (showLabels) {
      const activePins: CalloutPin[] = [];

      // 1. Seed Coat Pin (Always present, target on right edge of seed)
      activePins.push({
        key: 'seedCoat',
        targetX: cotylX + seedWidth * 0.85,
        targetY: cotylY,
        side: 'right',
        badgeX: 575,
        badgeY: seedY - 10,
        titleEn: 'Testa (Seed Coat)',
        titleNe: 'बीउको बाहिरी बोक्रा',
        subEn: 'Protective Waterproof Shield',
        subNe: 'कडा सुरक्षात्मक छाला',
        color: '#854d0e',
      });

      // 2. Radicle Pin (when root emerges, target on primary root)
      if (effectiveDay >= 1.8) {
        activePins.push({
          key: 'radicle',
          targetX: rTipX - 4,
          targetY: rTipY - 6,
          side: 'left',
          badgeX: 305,
          badgeY: Math.min(480, rTipY - 6),
          titleEn: 'Radicle (Primary Root)',
          titleNe: 'मूल जरा (Radicle)',
          subEn: 'Positive Gravitropism',
          subNe: 'गुरुत्वाकर्षणतिर सिधै तल',
          color: '#0284c7',
        });
      }

      // 3. Root Hairs Pin (absorption zone)
      if (effectiveDay >= 3.0) {
        activePins.push({
          key: 'rootHairs',
          targetX: centerX + 18,
          targetY: seedY + maxRootDepth * 0.45,
          side: 'right',
          badgeX: 575,
          badgeY: Math.min(490, seedY + maxRootDepth * 0.45 + 10),
          titleEn: 'Root Hairs Zone',
          titleNe: 'जराका मसिनो सेता रौँ',
          subEn: '500% Surface Absorption',
          subNe: 'पानी र खनिज सोस्ने',
          color: '#06b6d4',
        });
      }

      // 4. Hypocotyl Pin (emerging stem hook)
      if (effectiveDay >= 4.0) {
        const hypY = effectiveDay < 5.2 ? stemTipY : groundY - 25;
        activePins.push({
          key: 'hypocotyl',
          targetX: centerX - 6,
          targetY: hypY,
          side: 'left',
          badgeX: 305,
          badgeY: Math.min(groundY - 15, Math.max(90, hypY)),
          titleEn: 'Hypocotyl (Stem Hook)',
          titleNe: 'काण्ड वा डाँठ (Hypocotyl)',
          subEn: 'Arching Soil Breakthrough',
          subNe: 'धनुषझैँ माटो फोड्ने',
          color: '#16a34a',
        });
      }

      // 5. Cotyledon Pin (carried up on stem)
      if (effectiveDay >= 5.0) {
        activePins.push({
          key: 'cotyledon',
          targetX: cotylX + 18,
          targetY: cotylY - 4,
          side: 'right',
          badgeX: 575,
          badgeY: Math.max(70, cotylY - 20),
          titleEn: 'Cotyledons (Seed Leaves)',
          titleNe: 'बीउका दलहरू (Cotyledons)',
          subEn: 'Starch & Energy Reserve',
          subNe: 'पहिलो खानाको गोदाम',
          color: '#ca8a04',
        });
      }

      // 6. Plumule & True Leaves Pin
      if (effectiveDay >= 6.0) {
        activePins.push({
          key: 'plumule',
          targetX: leafBaseX - 16,
          targetY: leafBaseY - 22,
          side: 'left',
          badgeX: 305,
          badgeY: Math.max(45, leafBaseY - 30),
          titleEn: 'True Foliage Leaves',
          titleNe: 'वास्तविक हरिया पातहरू',
          subEn: 'Solar Photosynthesis',
          subNe: 'प्रकाश संश्लेषण इन्जिन',
          color: '#15803d',
        });
      }

      // Render Each Callout Pin & Leader Line
      activePins.forEach((pin) => {
        const isSelected = inspectedPart === pin.key;
        ctx.save();

        // Target Anchor Pin on plant part
        const pulse = Math.sin(Date.now() * 0.007) * 2.5;
        // Outer pulsing ring
        ctx.strokeStyle = isSelected ? 'rgba(2, 132, 199, 0.75)' : 'rgba(34, 197, 94, 0.6)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(pin.targetX, pin.targetY, 7 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Solid target center dot
        ctx.fillStyle = isSelected ? '#0284c7' : '#16a34a';
        ctx.beginPath();
        ctx.arc(pin.targetX, pin.targetY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Measure text for badge dimensions
        ctx.font = 'bold 11px Inter, sans-serif';
        const titleTxt = lang === 'en' ? pin.titleEn : pin.titleNe;
        const titleW = ctx.measureText(titleTxt).width;

        ctx.font = '600 9.5px Inter, sans-serif';
        const subTxt = lang === 'en' ? pin.subEn : pin.subNe;
        const subW = ctx.measureText(subTxt).width;

        const badgeW = Math.max(titleW, subW) + 26;
        const badgeH = 34;
        const badgeY = pin.badgeY - badgeH / 2;
        const badgeX = pin.side === 'left' ? pin.badgeX - badgeW : pin.badgeX;

        // Save hitbox for interactive canvas click
        calloutHitBoxesRef.current.push({
          key: pin.key,
          x: badgeX,
          y: badgeY,
          w: badgeW,
          h: badgeH,
        });

        // Anchor points for leader line
        const lineAnchorX = pin.side === 'left' ? badgeX + badgeW : badgeX;
        const lineAnchorY = pin.badgeY;
        const elbowX = pin.side === 'left' ? pin.targetX - 22 : pin.targetX + 22;

        // Leader Line
        ctx.strokeStyle = isSelected ? '#0284c7' : 'rgba(15, 23, 42, 0.6)';
        ctx.lineWidth = isSelected ? 2.2 : 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pin.targetX, pin.targetY);
        ctx.lineTo(elbowX, lineAnchorY);
        ctx.lineTo(lineAnchorX, lineAnchorY);
        ctx.stroke();

        // Card Drop Shadow
        ctx.shadowColor = isSelected ? 'rgba(2, 132, 199, 0.25)' : 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = isSelected ? 12 : 8;
        ctx.shadowOffsetY = 2;

        // Card Surface
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.96)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = isSelected ? '#0284c7' : '#cbd5e1';
        ctx.lineWidth = isSelected ? 2 : 1.2;
        ctx.stroke();

        // Left Colored Indicator Pill
        ctx.fillStyle = pin.color;
        ctx.beginPath();
        ctx.roundRect(badgeX + 3.5, badgeY + 4, 3.5, badgeH - 8, 2);
        ctx.fill();

        // Typography
        ctx.textAlign = 'left';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(titleTxt, badgeX + 12, badgeY + 14);

        ctx.font = '600 9.5px Inter, sans-serif';
        ctx.fillStyle = isSelected ? '#0284c7' : '#64748b';
        ctx.fillText(subTxt, badgeX + 12, badgeY + 27);

        ctx.restore();
      });
    }
  }, [
    growthDay,
    moistureLevel,
    sunlightLevel,
    temperatureC,
    showXRay,
    showLabels,
    isWatering,
    inspectedPart,
    experimentMode,
    lang,
  ]);

  // Continuous animation frame loop
  useEffect(() => {
    let handle: number;
    const loop = () => {
      renderCanvas();
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, [renderCanvas]);

  // Handle canvas click on callouts
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check hitboxes
    const hit = calloutHitBoxesRef.current.find(
      (b) => clickX >= b.x && clickX <= b.x + b.w && clickY >= b.y && clickY <= b.y + b.h
    );

    if (hit) {
      setInspectedPart(hit.key);
      ScienceAudio.playPop();
    }
  };

  // Water plant interactive action
  const handleWaterClick = () => {
    setIsWatering(true);
    setMoistureLevel((prev) => Math.min(100, prev + 25));
    ScienceAudio.playWaterDrop();
    setTimeout(() => {
      setIsWatering(false);
    }, 2200);
  };

  // Reset simulation
  const handleReset = () => {
    setGrowthDay(1.0);
    setIsPlaying(false);
    setMoistureLevel(75);
    setSunlightLevel(85);
    setTemperatureC(25);
    setExperimentMode('normal');
    setShowXRay(false);
    setInspectedPart('seedCoat');
    ScienceAudio.playWhoosh();
  };

  // Quiz Questions for Stage: Challenge
  const quizQuestions = [
    {
      qEn: 'What is the primary function of the seed cotyledons before true leaves emerge?',
      qNe: 'वास्तविक पातहरू ननिस्कुन्जेल बीउका दलहरू (Cotyledons) को मुख्य काम के हो?',
      optionsEn: [
        'They provide stored starch & protein food to feed the embryo',
        'They act as wings to help the seed fly away in wind',
        'They absorb sunlight at midnight',
        'They make the soil cold and icy',
      ],
      optionsNe: [
        'भ्रूणलाई आवश्यक पर्ने खाना (स्टार्च र प्रोटिन) उपलब्ध गराउने',
        'बीउलाई हावामा उडाउन पखेटाको काम गर्ने',
        'मध्यरातमा घामको प्रकाश सोस्ने',
        'माटोलाई चिसो र हिउँजस्तो बनाउने',
      ],
      correct: 0,
      expEn: 'The cotyledons serve as the starch and protein food reserve for the dormant embryo until true leaves can perform photosynthesis.',
      expNe: 'वास्तविक पातले खाना बनाउन नथालेसम्म बीउभित्रको भ्रूणलाई खाना दिने काम दलहरू (Cotyledons) ले गर्छन्।',
    },
    {
      qEn: 'Which structure is the first to emerge from the cracked seed during germination?',
      qNe: 'अङ्कुरण हुँदा बीउको बोक्रा फुटेर सबैभन्दा पहिले कुन भाग बाहिर निस्कन्छ?',
      optionsEn: [
        'Radicle (Primary Root)',
        'Plumule (True Leaves)',
        'Flower Petal',
        'Wooden Bark',
      ],
      optionsNe: [
        'मूल जरा (Radicle)',
        'हरियो पात (Plumule)',
        'फूलको पात (Petal)',
        'रूखको बोक्रा',
      ],
      correct: 0,
      expEn: 'The radicle (embryonic root) always emerges first due to gravitropism to anchor the seed and drink water.',
      expNe: 'बीउबाट सबैभन्दा पहिले मूल जरा (Radicle) निस्कन्छ जसले बिरुवालाई जमिनमा अड्याउँछ र पानी सोस्छ।',
    },
    {
      qEn: 'Why do root hairs matter so much for the young seedling?',
      qNe: 'कलिलो बिरुवाको लागि जराका मसिनो रौँहरू किन धेरै महत्त्वपूर्ण हुन्छन्?',
      optionsEn: [
        'They multiply root surface area by 500% to maximize water & mineral uptake',
        'They keep the plant warm during winter',
        'They produce seeds underground',
        'They scare away earthworms',
      ],
      optionsNe: [
        'यिनले जराको क्षेत्रफल ५००% बढाएर धेरै पानी र खनिज मल सोस्न मद्दत गर्छन्',
        'यिनले बिरुवालाई जाडोमा न्यानो राख्छन्',
        'यिनले जमिनमुनि बीउ बनाउँछन्',
        'यिनले गँड्यौलालाई भगाउँछन्',
      ],
      correct: 0,
      expEn: 'Microscopic root hairs enormously expand the root surface area in soil pore spaces for rapid hydration.',
      expNe: 'जराका मसिना रौँहरूले माटोभित्र जराको क्षेत्रफल धेरै गुणा बढाएर पानी र मल सोस्छन्।',
    },
  ];

  const handleQuizAnswer = (idx: number) => {
    setQuizSelected(idx);
    if (idx === quizQuestions[quizIdx].correct) {
      setQuizFeedback('correct');
      ScienceAudio.playSuccess();
      if (stars < 3) setStars((prev) => Math.min(3, prev + 1));
    } else {
      setQuizFeedback('wrong');
      ScienceAudio.playError();
    }
  };

  return (
    <SimulationLayout
      title="Botanical Lab: Seed Germination & Plant Life Cycle"
      titleNepali="वनस्पति प्रयोगशाला: बीउको अङ्कुरण र बिरुवाको जीवन चक्र"
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
      currentPromptEn="Observe how moisture awakens the dormant embryo. Use the timeline slider, water the soil, and inspect the anatomical callouts!"
      currentPromptNe="ओस र पानीले कसरी बीउको भित्री जीवन जगाउँछ हेर्नुहोस्। समयरेखा चलाउनुहोस्, पानी हाल्नुहोस् र अङ्गहरू जाँच्नुहोस्!"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 390px',
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
            background: '#ffffff',
          }}
        >
          {/* Main 2D Canvas */}
          <canvas
            ref={canvasRef}
            width={880}
            height={560}
            onClick={handleCanvasClick}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
              cursor: 'pointer',
            }}
          />

          {/* Top Quick-Access Mode Badges */}
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
            {/* X-Ray Cutaway Toggle */}
            <button
              onClick={() => {
                setShowXRay(!showXRay);
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 13px',
                borderRadius: '8px',
                border: showXRay ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: showXRay ? 'rgba(14, 165, 233, 0.12)' : 'rgba(255, 255, 255, 0.95)',
                color: showXRay ? '#0284c7' : '#0f172a',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Layers size={14} color={showXRay ? '#0284c7' : '#64748b'} />
              {lang === 'en'
                ? showXRay
                  ? 'Internal X-Ray: ON'
                  : 'X-Ray View (भित्री भाग)'
                : showXRay
                ? 'भित्री दृश्य: चालु'
                : 'भित्री भाग हेर्नुहोस्'}
            </button>

            {/* Labels Toggle */}
            <button
              onClick={() => {
                setShowLabels(!showLabels);
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 13px',
                borderRadius: '8px',
                border: showLabels ? '2px solid #16a34a' : '1px solid #cbd5e1',
                background: showLabels ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.95)',
                color: showLabels ? '#16a34a' : '#0f172a',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Eye size={14} color={showLabels ? '#16a34a' : '#64748b'} />
              {lang === 'en' ? 'Labels (नामहरू)' : 'नामहरू'}
            </button>
          </div>

          {/* Top-Right Quick Water Action Tool */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              zIndex: 10,
            }}
          >
            <button
              onClick={handleWaterClick}
              disabled={isWatering}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 800,
                cursor: isWatering ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              }}
            >
              <Droplets size={16} />
              {lang === 'en' ? 'Water Plant (पानी हाल)' : 'पानी हाल्नुहोस्'}
            </button>
          </div>

          {/* Bottom Interactive Time-Lapse Control Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.96)',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              backdropFilter: 'blur(12px)',
              padding: '12px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 10,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Top row: Stage Name & Play Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
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
                    background: isPlaying ? '#ef4444' : '#16a34a',
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '2px' }} />}
                </button>

                <button
                  onClick={() => {
                    setGrowthDay(0);
                    setIsPlaying(false);
                    ScienceAudio.playClick();
                  }}
                  title="Reset to Day 0"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#f8fafc',
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
                    {lang === 'en' ? currentMilestone.stageNameEn : currentMilestone.stageNameNe}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {lang === 'en' ? currentMilestone.botanyFocusEn : currentMilestone.botanyFocusNe}
                  </div>
                </div>
              </div>

              {/* Day indicator badge & Speed selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: 'rgba(14, 165, 233, 0.12)',
                    color: '#0284c7',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  {lang === 'en' ? `Day ${growthDay.toFixed(1)} / 8.0` : `दिन ${growthDay.toFixed(1)} / ८.०`}
                </span>

                <button
                  onClick={() => {
                    setPlaybackSpeed((prev) => (prev === 1.0 ? 2.0 : 1.0));
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {playbackSpeed}x Speed
                </button>
              </div>
            </div>

            {/* Bottom Row: Scrubber Timeline Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                {lang === 'en' ? 'Day 0' : 'दिन ०'}
              </span>
              <input
                type="range"
                min="0"
                max="8"
                step="0.1"
                value={growthDay}
                onChange={(e) => {
                  setGrowthDay(parseFloat(e.target.value));
                  setIsPlaying(false);
                }}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  accentColor: '#16a34a',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>
                {lang === 'en' ? 'Day 8' : 'दिन ८'}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: BOTANICAL LAB WORKSPACE & ANATOMY INSPECTOR (390px)
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
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(21, 128, 61, 0.02) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#16a34a" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a' }}>
                {lang === 'en' ? 'Botanical Discovery Station' : 'वनस्पति अनुसन्धान केन्द्र'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              {lang === 'en' ? currentMilestone.scientificFactEn : currentMilestone.scientificFactNe}
            </div>
          </div>

          {/* Condition Experiments Mode Tabs */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
              {lang === 'en' ? 'EXPERIMENT CONDITIONS' : 'प्रयोगात्मक अवस्थाहरू'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => {
                  setExperimentMode('normal');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: experimentMode === 'normal' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                  background: experimentMode === 'normal' ? 'rgba(34, 197, 94, 0.12)' : '#f8fafc',
                  color: experimentMode === 'normal' ? '#15803d' : '#0f172a',
                  textAlign: 'left',
                }}
              >
                {lang === 'en' ? '🌱 Normal (Optimal)' : '🌱 सामान्य (राम्रो)'}
              </button>

              <button
                onClick={() => {
                  setExperimentMode('no-water');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: experimentMode === 'no-water' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                  background: experimentMode === 'no-water' ? 'rgba(245, 158, 11, 0.12)' : '#f8fafc',
                  color: experimentMode === 'no-water' ? '#b45309' : '#0f172a',
                  textAlign: 'left',
                }}
              >
                {lang === 'en' ? '🏜️ No Water (Dry)' : '🏜️ पानीबिना (सुक्खा)'}
              </button>

              <button
                onClick={() => {
                  setExperimentMode('no-sun');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: experimentMode === 'no-sun' ? '2px solid #9333ea' : '1px solid #e2e8f0',
                  background: experimentMode === 'no-sun' ? 'rgba(147, 51, 234, 0.12)' : '#f8fafc',
                  color: experimentMode === 'no-sun' ? '#7e22ce' : '#0f172a',
                  textAlign: 'left',
                }}
              >
                {lang === 'en' ? '📦 Dark Box (No Sun)' : '📦 अँध्यारो बाकस'}
              </button>

              <button
                onClick={() => {
                  setExperimentMode('waterlogged');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: experimentMode === 'waterlogged' ? '2px solid #0891b2' : '1px solid #e2e8f0',
                  background: experimentMode === 'waterlogged' ? 'rgba(8, 145, 178, 0.12)' : '#f8fafc',
                  color: experimentMode === 'waterlogged' ? '#0e7490' : '#0f172a',
                  textAlign: 'left',
                }}
              >
                {lang === 'en' ? '🌊 Waterlogged' : '🌊 धेरै पानी (सड्ने)'}
              </button>
            </div>
          </div>

          {/* Environmental Sliders */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Moisture Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Droplets size={13} color="#0284c7" />
                  {lang === 'en' ? 'Soil Moisture' : 'माटोको ओस/पानी'}
                </span>
                <strong style={{ color: '#0284c7' }}>{moistureLevel}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={moistureLevel}
                onChange={(e) => setMoistureLevel(parseInt(e.target.value))}
                style={{ width: '100%', height: '5px', accentColor: '#0284c7', cursor: 'pointer' }}
              />
            </div>

            {/* Sunlight Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sun size={13} color="#ca8a04" />
                  {lang === 'en' ? 'Sunlight Intensity' : 'घामको तीव्रता'}
                </span>
                <strong style={{ color: '#ca8a04' }}>{sunlightLevel}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sunlightLevel}
                onChange={(e) => setSunlightLevel(parseInt(e.target.value))}
                style={{ width: '100%', height: '5px', accentColor: '#ca8a04', cursor: 'pointer' }}
              />
            </div>

            {/* Temperature Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Thermometer size={13} color="#dc2626" />
                  {lang === 'en' ? 'Soil Temperature' : 'माटोको तापक्रम'}
                </span>
                <strong style={{ color: '#dc2626' }}>{temperatureC}°C</strong>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                value={temperatureC}
                onChange={(e) => setTemperatureC(parseInt(e.target.value))}
                style={{ width: '100%', height: '5px', accentColor: '#dc2626', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Clickable Anatomy Explorer Cards */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              {lang === 'en' ? 'INSPECT ANATOMICAL ORGANS' : 'अङ्गहरू छनौट गरी बुझ्नुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {Object.keys(anatomyData).map((key) => {
                const part = anatomyData[key];
                const isSelected = inspectedPart === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setInspectedPart(key);
                      ScienceAudio.playClick();
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? 'rgba(14, 165, 233, 0.1)' : '#f8fafc',
                      color: isSelected ? '#0284c7' : '#0f172a',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>{key === 'seedCoat' ? '🌰' : key === 'cotyledon' ? '🍃' : key === 'radicle' ? '🌱' : key === 'rootHairs' ? '🪱' : key === 'hypocotyl' ? '🌿' : '☘️'}</span>
                    <span>{lang === 'en' ? part.nameEn.split(' ')[0] : part.nameNe.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Anatomy Card Detail */}
            {inspectedPart && anatomyData[inspectedPart] && (
              <div
                style={{
                  marginTop: '10px',
                  background: 'rgba(14, 165, 233, 0.08)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7' }}>
                  {lang === 'en' ? anatomyData[inspectedPart].nameEn : anatomyData[inspectedPart].nameNe}
                </div>
                <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                  {lang === 'en' ? anatomyData[inspectedPart].roleEn : anatomyData[inspectedPart].roleNe}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px', lineHeight: 1.45 }}>
                  {lang === 'en' ? anatomyData[inspectedPart].descEn : anatomyData[inspectedPart].descNe}
                </div>
              </div>
            )}
          </div>

          {/* Stage 5: Challenge Quiz Card */}
          {stage === 'challenge' && (
            <div
              style={{
                marginTop: 'auto',
                background: '#f8fafc',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Award size={16} color="#ca8a04" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#ca8a04' }}>
                  {lang === 'en'
                    ? `Botanist Challenge (${quizIdx + 1}/${quizQuestions.length})`
                    : `वनस्पति चुनौती (${quizIdx + 1}/${quizQuestions.length})`}
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
                            ? '1.5px solid #16a34a'
                            : '1.5px solid #dc2626'
                          : '1px solid #e2e8f0',
                      background:
                        quizSelected === i
                          ? i === quizQuestions[quizIdx].correct
                            ? 'rgba(34, 197, 94, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)'
                          : '#ffffff',
                      color: '#0f172a',
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
                      color: quizFeedback === 'correct' ? '#16a34a' : '#dc2626',
                      marginBottom: '4px',
                    }}
                  >
                    {quizFeedback === 'correct'
                      ? lang === 'en'
                        ? '✓ Correct! Excellent Botanical Knowledge.'
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
                        background: '#0284c7',
                        color: '#ffffff',
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
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(22, 163, 74, 0.35)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Botany Lab & Take Quiz' : 'प्रयोग पूरा गर्नुहोस् र प्रश्न हल गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default SeedGerminationSim;
