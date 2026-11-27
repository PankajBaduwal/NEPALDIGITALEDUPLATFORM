/**
 * ButterflyLifeCycleSim.tsx
 * Master Interactive 2D Metamorphosis Simulation: Butterfly Life Cycle
 * (पुतलीको जीवनचक्र - 2डी अन्तरक्रियात्मक रूपान्तरण प्रयोगशाला)
 * Grade 4 Science • Chapter 5: Life Process
 *
 * 100% Native 2D Canvas & Vector Graphics (Zero WebGL/3D Dependencies)
 * - Ultra-Rich Natural Color Palette: Lush garden foliage, dew-kissed milkweed leaves,
 *   banded tiger caterpillar, jade chrysalis with gold crown studs, and brilliant Monarch wings.
 * - 4-Stage Complete Metamorphosis:
 *   1. Egg: Pearl-ribbed translucent eggs on leaf underside with dewdrops and embryo silhouette.
 *   2. Caterpillar / Larva: Realistic undulating crawling body, chewing leaves with bite marks!
 *   3. Chrysalis / Pupa: Jade-green pupa hanging from a silk button, becoming translucent with wing preview.
 *   4. Adult Butterfly: Flying Monarch with delicate wing veins, flapping animation, and nectar sipping!
 * - Interactive Lab Controls: Metamorphosis Stage selector, Continuous Scrubbing Timeline,
 *   Feed Caterpillar button (adds bite marks & grows caterpillar), Flap Wings button, and Anatomy Callouts.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  Calendar,
  Layers,
  Award,
  Leaf,
  Wind,
} from 'lucide-react';

type MetamorphosisStage = 'egg' | 'caterpillar' | 'pupa' | 'butterfly';

interface StageConfig {
  id: MetamorphosisStage;
  stepNum: number;
  nameEn: string;
  nameNe: string;
  durationEn: string;
  durationNe: string;
  primaryActionEn: string;
  primaryActionNe: string;
  descriptionEn: string;
  descriptionNe: string;
  scientificFactEn: string;
  scientificFactNe: string;
}

export const ButterflyLifeCycleSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Metamorphosis timeline: 0.0 (Egg) -> 1.0 (Caterpillar) -> 2.0 (Pupa) -> 3.0 (Butterfly)
  const [metaProgress, setMetaProgress] = useState<number>(0.0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Interactive stage states
  const [leafBites, setLeafBites] = useState<number>(0); // Feeding caterpillar adds leaf bites
  const [isFlapping, setIsFlapping] = useState<boolean>(true); // Butterfly wing flapping toggle
  const [butterflyFlyOffset, setButterflyFlyOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showAnatomyLabels, setShowAnatomyLabels] = useState<boolean>(true);
  const [inspectedAnatomy, setInspectedAnatomy] = useState<string>('stage');

  // Challenge stage state
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [challengeChoice, setChallengeChoice] = useState<number | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<'correct' | 'wrong' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stages: StageConfig[] = [
    {
      id: 'egg',
      stepNum: 1,
      nameEn: '1. Egg Stage',
      nameNe: '1. अण्डा (Egg Stage)',
      durationEn: '3 to 5 days',
      durationNe: '3 देखि 5 दिन',
      primaryActionEn: 'Protected inside tiny pearl egg shell',
      primaryActionNe: 'पातको पछाडि सुरक्षित रूपमा रहन्छ',
      descriptionEn: 'The female butterfly deposits microscopic, translucent ribbed eggs on the underside of nutritious milkweed leaves.',
      descriptionNe: 'पोथी पुतलीले पातको पछाडि साना, मोतीजस्ता चम्किला अण्डाहरू पार्छ।',
      scientificFactEn: 'Eggs are laid with a natural waterproof glue so rainstorms cannot wash them off the leaf.',
      scientificFactNe: 'अण्डालाई वर्षाले नबगाओस् भनेर पुतलीले प्राकृतिक च्यापच्यापे गमले पातमा टाँसिदिन्छ।',
    },
    {
      id: 'caterpillar',
      stepNum: 2,
      nameEn: '2. Caterpillar / Larva',
      nameNe: '2. झुसिल्किरा (Larva Stage)',
      durationEn: '10 to 14 days',
      durationNe: '10 देखि 14 दिन',
      primaryActionEn: 'Eating leaf voraciously to grow 2000x in size',
      primaryActionNe: 'पातहरू खाएर शरीर 2,000 गुणा ठूलो बनाउँछ',
      descriptionEn: 'The caterpillar hatches hungry! It munches leaves non-stop, molting its skin 5 times (instars) to accommodate rapid growth.',
      descriptionNe: 'अण्डाबाट निस्किएपछि झुसिल्किराले दिनरात पात खान्छ र 5 पटकसम्म आफ्नो पुरानो छाला फेर्छ।',
      scientificFactEn: 'The caterpillar possesses 6 true jointed legs in front and 10 fleshy suction prolegs along its abdomen.',
      scientificFactNe: 'यसका अगाडि 6 वटा वास्तविक खुट्टा र पछाडि 10 वटा समात्ने नक्कली खुट्टाहरू हुन्छन्।',
    },
    {
      id: 'pupa',
      stepNum: 3,
      nameEn: '3. Chrysalis / Pupa',
      nameNe: '3. प्युपा (Chrysalis Stage)',
      durationEn: '9 to 14 days',
      durationNe: '9 देखि 14 दिन',
      primaryActionEn: 'Complete metamorphosis inside silk chrysalis',
      primaryActionNe: 'भित्रभित्रै पुतली बन्ने अद्भुत रूपान्तरण',
      descriptionEn: 'The caterpillar anchors itself upside down with silk in a "J" shape, shedding its skin to form a jade-green chrysalis with gold rim studs.',
      descriptionNe: 'झुसिल्किराले रेशमी धागोले आफूलाई उल्टो झुन्ड्याउँछ र हरियो चम्किलो प्युपामा रूपान्तरण हुन्छ।',
      scientificFactEn: 'Inside the chrysalis, larval tissues break down into cellular soup, and imaginal discs blossom into wings, eyes, and legs!',
      scientificFactNe: 'प्युपाभित्र पुरानो शरीर पग्लिएर नयाँ पुतलीको पखेटा, आँखा र खुट्टाहरू बन्दै जान्छन्।',
    },
    {
      id: 'butterfly',
      stepNum: 4,
      nameEn: '4. Adult Butterfly',
      nameNe: '4. वयस्क पुतली (Adult Stage)',
      durationEn: '2 to 6 weeks',
      durationNe: '2 देखि 6 हप्ता',
      primaryActionEn: 'Flying, pollinating flowers & sipping nectar',
      primaryActionNe: 'उड्ने, फूलको रस पिउने र परागसेचन गर्ने',
      descriptionEn: 'The adult butterfly pumps fluid into its damp wings to expand them, basking in warm sunlight before taking flight to sip nectar.',
      descriptionNe: 'पुतली बाहिर निस्केर आफ्ना भिजेका पखेटा घाममा सुकाउँछ र फूलहरूको रस चुस्दै उड्न थाल्छ।',
      scientificFactEn: 'Butterflies taste nectar using chemoreceptors located on their feet (tarsi)!',
      scientificFactNe: 'पुतलीले खानाको स्वाद जिब्रोले होइन, आफ्ना खुट्टाका औंलाहरूले पत्ता लगाउँछ!',
    },
  ];

  // Active current stage according to progress (0..3)
  const currentStageIndex = Math.min(3, Math.floor(metaProgress));
  const activeStage = stages[currentStageIndex];

  // Auto-play time-lapse progression
  useEffect(() => {
    let timer: any;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setMetaProgress((prev) => {
          if (prev >= 3.0) {
            setIsAutoPlaying(false);
            ScienceAudio.playCelebration();
            setStars(3);
            setIsCompleted(true);
            setStage('understand');
            return 3.0;
          }
          ScienceAudio.playPop();
          return Number((prev + 0.05).toFixed(2));
        });
      }, 180);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  // Feed caterpillar action
  const handleFeedCaterpillar = () => {
    setLeafBites((prev) => Math.min(8, prev + 1));
    ScienceAudio.playWaterDrop();
  };

  // Jump to specific stage
  const handleSelectStage = (idx: number) => {
    setMetaProgress(idx);
    setIsAutoPlaying(false);
    ScienceAudio.playClick();
  };

  // Reset simulation
  const handleReset = () => {
    setMetaProgress(0.0);
    setIsAutoPlaying(false);
    setLeafBites(0);
    setIsFlapping(true);
    setButterflyFlyOffset({ x: 0, y: 0 });
    ScienceAudio.playWhoosh();
  };

  // ══════════════════════════════════════════════════════════════════
  // MASTER 2D CANVAS RENDERER: VIBRANT GARDEN METAMORPHOSIS
  // ══════════════════════════════════════════════════════════════════
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    ctx.clearRect(0, 0, width, height);

    // ─────────────────────────────────────────────────────────────
    // 1. GARDEN ENVIRONMENT BACKGROUND
    // ─────────────────────────────────────────────────────────────
    // Soft blurred sunny botanical garden background
    const bgGrad = ctx.createRadialGradient(width * 0.7, height * 0.25, 40, centerX, centerY, width * 0.8);
    bgGrad.addColorStop(0, '#fef9c3'); // Warm sunlight
    bgGrad.addColorStop(0.35, '#dcfce7'); // Pale garden green
    bgGrad.addColorStop(0.75, '#bbf7d0');
    bgGrad.addColorStop(1, '#86efac');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Soft bokeh light spheres in background
    const timeSec = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 9; i++) {
      const bx = (i * 110 + Math.sin(timeSec + i) * 15) % width;
      const by = (i * 70 + Math.cos(timeSec * 0.8 + i) * 10) % height;
      const br = 25 + (i * 7) % 25;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    // ─────────────────────────────────────────────────────────────
    // 2. LARGE NATURAL MILKWEED LEAF (Host Plant)
    // ─────────────────────────────────────────────────────────────
    ctx.save();
    const leafBaseX = width * 0.12;
    const leafBaseY = height * 0.68;
    const leafTipX = width * 0.88;
    const leafTipY = height * 0.42;

    // Organic Leaf Shape
    const leafGrad = ctx.createLinearGradient(leafBaseX, leafBaseY, leafTipX, leafTipY);
    leafGrad.addColorStop(0, '#15803d'); // Deep forest green
    leafGrad.addColorStop(0.5, '#16a34a'); // Vibrant leaf green
    leafGrad.addColorStop(1, '#22c55e');

    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.moveTo(leafBaseX, leafBaseY);
    // Upper leaf margin curve
    ctx.bezierCurveTo(width * 0.3, height * 0.2, width * 0.65, height * 0.22, leafTipX, leafTipY);
    // Lower leaf margin curve
    ctx.bezierCurveTo(width * 0.68, height * 0.82, width * 0.32, height * 0.86, leafBaseX, leafBaseY);
    ctx.fill();

    // Leaf Border Outline
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Primary Central Midrib Vein
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(leafBaseX, leafBaseY);
    ctx.quadraticCurveTo(width * 0.5, height * 0.48, leafTipX, leafTipY);
    ctx.stroke();

    // Secondary Branching Lateral Veins
    ctx.strokeStyle = 'rgba(134, 239, 172, 0.6)';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 6; i++) {
      const frac = i / 7;
      const vx = leafBaseX + (leafTipX - leafBaseX) * frac;
      const vy = leafBaseY + (leafTipY - leafBaseY) * frac - Math.sin(frac * Math.PI) * 20;

      // Upper vein
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.quadraticCurveTo(vx + 15, vy - 35, vx + 35, vy - 55);
      ctx.stroke();

      // Lower vein
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.quadraticCurveTo(vx + 10, vy + 35, vx + 25, vy + 55);
      ctx.stroke();
    }

    // Caterpillar Chewed Bite Marks along Leaf Edge
    if (leafBites > 0) {
      ctx.fillStyle = '#dcfce7'; // Background color showing through bites
      const biteSpots = [
        { x: width * 0.58, y: height * 0.27, r: 18 },
        { x: width * 0.64, y: height * 0.3, r: 24 },
        { x: width * 0.48, y: height * 0.25, r: 16 },
        { x: width * 0.72, y: height * 0.35, r: 20 },
        { x: width * 0.42, y: height * 0.28, r: 15 },
        { x: width * 0.52, y: height * 0.72, r: 20 },
        { x: width * 0.6, y: height * 0.68, r: 18 },
        { x: width * 0.38, y: height * 0.74, r: 16 },
      ];
      for (let b = 0; b < Math.min(leafBites, biteSpots.length); b++) {
        const spot = biteSpots[b];
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#854d0e'; // Brown browned chewed leaf edge
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Shimmering Morning Dew Drops on Leaf
    const dewDrops = [
      { x: width * 0.35, y: height * 0.42, r: 5 },
      { x: width * 0.76, y: height * 0.46, r: 4 },
      { x: width * 0.45, y: height * 0.65, r: 6 },
    ];
    dewDrops.forEach((dew) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(dew.x, dew.y, dew.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dew.x - dew.r * 0.3, dew.y - dew.r * 0.3, dew.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // ─────────────────────────────────────────────────────────────
    // 3. METAMORPHOSIS RENDER: ACCORDING TO metaProgress
    // ─────────────────────────────────────────────────────────────
    // Progress spans:
    // [0.0 - 0.99]: Egg Stage
    // [1.0 - 1.99]: Caterpillar Stage
    // [2.0 - 2.99]: Pupa / Chrysalis Stage
    // [3.0]: Adult Butterfly Stage

    const p = metaProgress;

    // ═════════════════════════════════════════════════════════════
    // STAGE 1: BUTTERFLY EGGS ON LEAF
    // ═════════════════════════════════════════════════════════════
    if (p < 1.0) {
      const eggAlpha = 1.0 - Math.max(0, (p - 0.7) / 0.3); // Fades during hatch
      ctx.save();
      ctx.globalAlpha = eggAlpha;

      const clusterX = width * 0.45;
      const clusterY = height * 0.48;

      // Group of 3 pearl-ribbed butterfly eggs
      const eggOffsets = [
        { dx: 0, dy: 0, scale: 1.0 },
        { dx: -24, dy: 8, scale: 0.9 },
        { dx: 22, dy: 6, scale: 0.88 },
      ];

      eggOffsets.forEach((eo) => {
        const ex = clusterX + eo.dx;
        const ey = clusterY + eo.dy;
        const ew = 16 * eo.scale;
        const eh = 24 * eo.scale;

        // Egg Base Drop Shadow
        ctx.fillStyle = 'rgba(20, 83, 45, 0.4)';
        ctx.beginPath();
        ctx.ellipse(ex, ey + eh * 0.85, ew * 0.8, eh * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Iridescent Pearl Egg Body (Dome / Barrel shaped with vertical ribs)
        const eggGrad = ctx.createLinearGradient(ex - ew, ey - eh, ex + ew, ey + eh);
        eggGrad.addColorStop(0, '#ffffff');
        eggGrad.addColorStop(0.3, '#fef08a'); // Warm creamy pearl
        eggGrad.addColorStop(0.8, '#fde047');
        eggGrad.addColorStop(1, '#ca8a04');

        ctx.fillStyle = eggGrad;
        ctx.beginPath();
        ctx.moveTo(ex, ey - eh);
        ctx.bezierCurveTo(ex + ew * 1.2, ey - eh * 0.5, ex + ew, ey + eh * 0.7, ex, ey + eh);
        ctx.bezierCurveTo(ex - ew, ey + eh * 0.7, ex - ew * 1.2, ey - eh * 0.5, ex, ey - eh);
        ctx.fill();

        // Vertical Surface Ribs (Morphology of butterfly egg)
        ctx.strokeStyle = 'rgba(202, 138, 4, 0.4)';
        ctx.lineWidth = 1.2;
        for (let r = -2; r <= 2; r++) {
          ctx.beginPath();
          ctx.moveTo(ex, ey - eh + 2);
          ctx.quadraticCurveTo(ex + r * (ew * 0.45), ey, ex + r * (ew * 0.35), ey + eh - 2);
          ctx.stroke();
        }

        // Glossy Specular Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.ellipse(ex - ew * 0.35, ey - eh * 0.4, ew * 0.25, eh * 0.25, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Developing Embryo Silhouette (Visible on Day 3-5 near hatching)
        if (p > 0.4) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
          ctx.beginPath();
          ctx.arc(ex, ey + 2, ew * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Egg Stage Callout Pin
      if (showAnatomyLabels) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(clusterX - 70, clusterY - 60, 140, 26, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'en' ? '🥚 Butterfly Eggs' : '🥚 पुतलीका अण्डाहरू', clusterX, clusterY - 43);
      }
      ctx.restore();
    }

    // ═════════════════════════════════════════════════════════════
    // STAGE 2: MONARCH CATERPILLAR CRAWLING & EATING
    // ═════════════════════════════════════════════════════════════
    if (p >= 0.7 && p < 2.0) {
      const catAlpha = p < 1.0 ? (p - 0.7) / 0.3 : 1.0 - Math.max(0, (p - 1.8) / 0.2);
      ctx.save();
      ctx.globalAlpha = catAlpha;

      const catX = width * 0.48;
      const catY = height * 0.46;
      const crawlWave = Math.sin(timeSec * 5) * 6; // Undulating locomotion

      // Banded Caterpillar Body (13 segments: yellow, white, black stripes)
      const numSegments = 11;
      const segRadius = 14 + leafBites * 0.8; // Grows larger as it feeds!

      for (let s = 0; s < numSegments; s++) {
        // Curve body across leaf
        const segX = catX - (s - 5) * 16 + Math.sin(crawlWave * 0.3 + s * 0.6) * 3;
        const segY = catY + Math.sin(s * 0.5 + crawlWave * 0.4) * 8 - (s > 7 ? 6 : 0);

        // Segment Base Color
        ctx.fillStyle = s % 2 === 0 ? '#facc15' : '#ffffff'; // Alternating bright yellow and white
        ctx.beginPath();
        ctx.arc(segX, segY, segRadius, 0, Math.PI * 2);
        ctx.fill();

        // Black Tiger Banding Stripes
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(segX, segY, segRadius, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();

        // Fleshy Suction Prolegs along abdomen (bottom)
        if (s >= 3 && s <= 8) {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(segX - 3, segY + segRadius - 2, 6, 7, 3);
          ctx.fill();
        }
      }

      // Caterpillar Head Capsule (Leftmost segment s = 0)
      const headX = catX + 5 * 16 + 8;
      const headY = catY - 2;

      ctx.fillStyle = '#0f172a'; // Shiny black head
      ctx.beginPath();
      ctx.arc(headX, headY, segRadius + 1, 0, Math.PI * 2);
      ctx.fill();

      // Chewing Mandibles & True Jointed Thoracic Legs
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(headX + 5, headY + 5, 4, 0, Math.PI * 2);
      ctx.fill();

      // Long Sensory Filaments / Tentacles (Front)
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(headX, headY - segRadius);
      ctx.quadraticCurveTo(headX + 15, headY - segRadius - 25, headX + 22, headY - segRadius - 32);
      ctx.stroke();

      // Rear Filaments
      const tailX = catX - 5 * 16 - 8;
      ctx.beginPath();
      ctx.moveTo(tailX, catY - segRadius);
      ctx.quadraticCurveTo(tailX - 10, catY - segRadius - 15, tailX - 15, catY - segRadius - 20);
      ctx.stroke();

      // Caterpillar Pin
      if (showAnatomyLabels) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(headX - 60, headY - 65, 150, 26, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'en' ? '🐛 Caterpillar' : '🐛 भोको झुसिल्किरा', headX + 15, headY - 48);
      }
      ctx.restore();
    }

    // ═════════════════════════════════════════════════════════════
    // STAGE 3: JADE CHRYSALIS / PUPA
    // ═════════════════════════════════════════════════════════════
    if (p >= 1.7 && p < 3.0) {
      const pupaAlpha = p < 2.0 ? (p - 1.7) / 0.3 : 1.0 - Math.max(0, (p - 2.8) / 0.2);
      ctx.save();
      ctx.globalAlpha = pupaAlpha;

      const twigX = centerX;
      const twigY = height * 0.25;

      // Wooden Twig / Stem from which chrysalis hangs
      ctx.strokeStyle = '#573318';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(twigX - 80, twigY - 10);
      ctx.lineTo(twigX + 80, twigY + 5);
      ctx.stroke();

      // Silk Button Pad
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(twigX, twigY, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cremaster (Black connecting hook anchor)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(twigX, twigY);
      ctx.lineTo(twigX, twigY + 16);
      ctx.stroke();

      // Jade-Green Chrysalis Shell
      const chrysalisY = twigY + 16;
      const chrysalisW = 26;
      const chrysalisH = 55;

      const chrysalisGrad = ctx.createLinearGradient(twigX - chrysalisW, chrysalisY, twigX + chrysalisW, chrysalisY + chrysalisH);
      if (p > 2.5) {
        // Translucent mode before eclosion: folded orange monarch wings visible inside!
        chrysalisGrad.addColorStop(0, 'rgba(22, 101, 52, 0.7)');
        chrysalisGrad.addColorStop(0.4, 'rgba(234, 88, 12, 0.85)'); // Orange monarch wing
        chrysalisGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)'); // Black wing margins
      } else {
        // Pure opaque glossy Jade Green
        chrysalisGrad.addColorStop(0, '#4ade80');
        chrysalisGrad.addColorStop(0.35, '#16a34a');
        chrysalisGrad.addColorStop(0.85, '#15803d');
        chrysalisGrad.addColorStop(1, '#14532d');
      }

      ctx.fillStyle = chrysalisGrad;
      ctx.beginPath();
      ctx.moveTo(twigX, chrysalisY);
      // Left contour
      ctx.bezierCurveTo(twigX - chrysalisW * 1.3, chrysalisY + chrysalisH * 0.35, twigX - chrysalisW, chrysalisY + chrysalisH * 0.8, twigX, chrysalisY + chrysalisH);
      // Right contour
      ctx.bezierCurveTo(twigX + chrysalisW, chrysalisY + chrysalisH * 0.8, twigX + chrysalisW * 1.3, chrysalisY + chrysalisH * 0.35, twigX, chrysalisY);
      ctx.fill();

      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Gleaming Golden Crown Studs (Unique to Monarch Chrysalis)
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      const goldenStudCount = 7;
      for (let g = 0; g < goldenStudCount; g++) {
        const gx = twigX - chrysalisW * 0.75 + (g * (chrysalisW * 1.5)) / (goldenStudCount - 1);
        const gy = chrysalisY + chrysalisH * 0.28 + Math.sin((g / (goldenStudCount - 1)) * Math.PI) * 4;
        ctx.beginPath();
        ctx.arc(gx, gy, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Specular Reflection Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(twigX - chrysalisW * 0.35, chrysalisY + chrysalisH * 0.45, 4, 18, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Chrysalis Pin
      if (showAnatomyLabels) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(twigX + 35, chrysalisY + 20, 140, 26, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'en' ? '💎 Chrysalis' : '💎 चम्किलो प्युपा', twigX + 105, chrysalisY + 37);
      }
      ctx.restore();
    }

    // ═════════════════════════════════════════════════════════════
    // STAGE 4: GLORIOUS MONARCH BUTTERFLY FLAPPING & FLYING
    // ═════════════════════════════════════════════════════════════
    if (p >= 2.8) {
      const bflyAlpha = Math.min(1.0, (p - 2.8) / 0.2);
      ctx.save();
      ctx.globalAlpha = bflyAlpha;

      // Gentle aerodynamic hovering movement
      const hoverY = isFlapping ? Math.sin(timeSec * 4) * 8 : 0;
      const bflyX = centerX + butterflyFlyOffset.x;
      const bflyY = height * 0.42 + hoverY + butterflyFlyOffset.y;

      // Wing Flap scale factor: -1.0 to 1.0 (cosine flap)
      const flapAngle = isFlapping ? Math.cos(timeSec * 14) * 0.85 : 0.2;
      const wingFlapScaleX = Math.cos(flapAngle);

      // Render Wing Helper
      const drawMonarchWing = (isRight: boolean) => {
        ctx.save();
        ctx.translate(bflyX, bflyY);
        ctx.scale(isRight ? wingFlapScaleX : -wingFlapScaleX, 1);

        // 1. Forewing (Large upper wing)
        const forewingGrad = ctx.createRadialGradient(0, 0, 15, 60, -50, 110);
        forewingGrad.addColorStop(0, '#f97316'); // Fiery orange
        forewingGrad.addColorStop(0.65, '#ea580c');
        forewingGrad.addColorStop(0.9, '#c2410c');
        forewingGrad.addColorStop(1, '#090d16'); // Black outer border

        ctx.fillStyle = forewingGrad;
        ctx.beginPath();
        ctx.moveTo(4, -8);
        ctx.bezierCurveTo(35, -75, 95, -85, 120, -45);
        ctx.bezierCurveTo(125, -15, 95, 20, 20, 10);
        ctx.closePath();
        ctx.fill();

        // Thick Black Wing Margins & Venation
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Branching Black Veins
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, -8);
        ctx.lineTo(85, -55);
        ctx.moveTo(35, -25);
        ctx.lineTo(105, -30);
        ctx.moveTo(45, -15);
        ctx.lineTo(95, 0);
        ctx.moveTo(30, -35);
        ctx.lineTo(70, -65);
        ctx.stroke();

        // White Pearl Spots on Black Outer Margin
        ctx.fillStyle = '#ffffff';
        const spotCoords = [
          { x: 110, y: -45, r: 2.5 },
          { x: 115, y: -30, r: 2.5 },
          { x: 108, y: -15, r: 2.2 },
          { x: 98, y: 0, r: 2.2 },
          { x: 82, y: 10, r: 2.0 },
        ];
        spotCoords.forEach((sp) => {
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // 2. Hindwing (Smaller lower wing)
        const hindwingGrad = ctx.createRadialGradient(0, 0, 10, 45, 30, 75);
        hindwingGrad.addColorStop(0, '#f97316');
        hindwingGrad.addColorStop(0.75, '#ea580c');
        hindwingGrad.addColorStop(1, '#090d16');

        ctx.fillStyle = hindwingGrad;
        ctx.beginPath();
        ctx.moveTo(5, 5);
        ctx.bezierCurveTo(45, 15, 80, 25, 75, 65);
        ctx.bezierCurveTo(60, 95, 20, 85, 4, 30);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Hindwing white edge dots
        ctx.fillStyle = '#ffffff';
        const hindSpots = [
          { x: 70, y: 50, r: 2.0 },
          { x: 62, y: 72, r: 2.0 },
          { x: 45, y: 82, r: 2.0 },
          { x: 28, y: 75, r: 1.8 },
        ];
        hindSpots.forEach((sp) => {
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      };

      // Draw Left & Right Wings
      drawMonarchWing(false);
      drawMonarchWing(true);

      // Central Slender Butterfly Body (Head, Thorax, Abdomen)
      // Abdomen
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(bflyX, bflyY + 14, 5, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thorax
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(bflyX, bflyY - 4, 6.5, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head Capsule & Compound Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(bflyX, bflyY - 16, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Golden Compound Eyes
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(bflyX - 3.5, bflyY - 17, 1.8, 0, Math.PI * 2);
      ctx.arc(bflyX + 3.5, bflyY - 17, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Slender Clubbed Antennae
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      // Left antenna
      ctx.beginPath();
      ctx.moveTo(bflyX - 2, bflyY - 20);
      ctx.quadraticCurveTo(bflyX - 16, bflyY - 35, bflyX - 22, bflyY - 42);
      ctx.stroke();
      // Club tip
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(bflyX - 22, bflyY - 42, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Right antenna
      ctx.beginPath();
      ctx.moveTo(bflyX + 2, bflyY - 20);
      ctx.quadraticCurveTo(bflyX + 16, bflyY - 35, bflyX + 22, bflyY - 42);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bflyX + 22, bflyY - 42, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Butterfly Pin
      if (showAnatomyLabels) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bflyX - 75, bflyY - 70, 150, 26, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'en' ? '🦋 Adult Butterfly' : '🦋 वयस्क पुतली', bflyX, bflyY - 53);
      }
      ctx.restore();
    }
  }, [metaProgress, leafBites, isFlapping, butterflyFlyOffset, showAnatomyLabels, lang]);

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

  // Metamorphosis Challenge Questions
  const challengeQuestions = [
    {
      qEn: 'What are the 4 stages of complete butterfly metamorphosis in the correct chronological order?',
      qNe: 'पुतलीको पूर्ण रूपान्तरणका चार चरणहरू सही क्रममा कुन हुन्?',
      optionsEn: [
        'Egg → Caterpillar (Larva) → Chrysalis (Pupa) → Adult Butterfly',
        'Butterfly → Pupa → Egg → Caterpillar',
        'Caterpillar → Egg → Cocoon → Tadpole',
        'Seed → Stem → Flower → Fruit',
      ],
      optionsNe: [
        'अण्डा (Egg) → झुसिल्किरा (Larva) → प्युपा (Pupa) → वयस्क पुतली (Adult)',
        'पुतली → प्युपा → अण्डा → झुसिल्किरा',
        'झुसिल्किरा → अण्डा → कोकुन → भ्यागुतो',
        'बीउ → काण्ड → फूल → फल',
      ],
      correct: 0,
      expEn: 'Complete metamorphosis has four distinct anatomical stages: Egg, Larva (caterpillar), Pupa (chrysalis), and Adult.',
      expNe: 'पुतलीको जीवनचक्रमा चार मुख्य चरणहरू हुन्छन्: अण्डा, झुसिल्किरा, प्युपा र वयस्क पुतली।',
    },
    {
      qEn: 'During which stage does the organism consume massive amounts of plant food to grow thousands of times larger?',
      qNe: 'पुतलीको कुन चरणमा यसले दिनरात पात खाएर आफ्नो शरीर हजारौँ गुणा ठूलो बनाउँछ?',
      optionsEn: [
        'Larva (Caterpillar)',
        'Egg Stage',
        'Chrysalis (Pupa)',
        'Adult Butterfly',
      ],
      optionsNe: [
        'झुसिल्किरा (Larva Stage)',
        'अण्डाको अवस्थामा',
        'प्युपाको अवस्थामा',
        'वयस्क पुतली भएपछि',
      ],
      correct: 0,
      expEn: 'The caterpillar is the primary feeding and rapid growth stage of the butterfly life cycle.',
      expNe: 'झुसिल्किराको मुख्य काम नै धेरै पात खाएर शरीरमा शक्ति जम्मा गर्नु र ठूलो हुनु हो।',
    },
    {
      qEn: 'How does an adult butterfly taste nectar from flowers?',
      qNe: 'वयस्क पुतलीले फूलको रसको स्वाद कसरी पत्ता लगाउँछ?',
      optionsEn: [
        'Using chemoreceptors located on its feet (tarsi)',
        'Through its large colorful wings',
        'Using its long silk tail',
        'With its green stomach',
      ],
      optionsNe: [
        'आफ्ना खुट्टाका औंलाहरू (Feet receptors) द्वारा टेकेर',
        'रङ्गीचङ्गी पखेटाले छोएर',
        'रेशमी पुच्छरले सुँघेर',
        'पेटको छालाले',
      ],
      correct: 0,
      expEn: 'Butterflies land on flowers and taste nectar with chemical sensors on their feet before unfurling their proboscis.',
      expNe: 'पुतलीले फूलमा टेक्नासाथ आफ्ना खुट्टाका स्वाद संवेदकहरूबाट रस मीठो छ कि छैन थाहा पाउँछ।',
    },
  ];

  const handleChallengeAnswer = (idx: number) => {
    setChallengeChoice(idx);
    const curr = challengeQuestions[challengeIdx];
    if (idx === curr.correct) {
      setChallengeFeedback('correct');
      ScienceAudio.playSuccess();
      setStars(3);
      setIsCompleted(true);
    } else {
      setChallengeFeedback('wrong');
      ScienceAudio.playBonk();
    }
  };

  return (
    <SimulationLayout
      title="Metamorphosis Studio: Butterfly Life Cycle"
      titleNepali="रूपान्तरण प्रयोगशाला: पुतलीको पूर्ण जीवनचक्र"
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
      currentPromptEn="Follow the 4 miraculous stages of complete metamorphosis! Scrub the timeline, feed the caterpillar, and fly the butterfly."
      currentPromptNe="पुतलीको पूर्ण रूपान्तरणका 4 अद्भुत चरणहरू हेर्नुहोस्! समयरेखा सार्नुहोस्, झुसिल्किरालाई पात खुवाउनुहोस् र पुतली उडाउनुहोस्।"
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
          {/* Main 2D Canvas */}
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

          {/* Top Stage Jump Pills */}
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
              const isCurrent = Math.floor(metaProgress) === i;
              return (
                <button
                  key={st.id}
                  onClick={() => handleSelectStage(i)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: isCurrent ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.2)',
                    background: isCurrent ? 'rgba(34, 197, 94, 0.3)' : 'rgba(15, 23, 42, 0.82)',
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

          {/* Top-Right Interactive Actions (Feed Caterpillar / Flap Wings) */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              display: 'flex',
              gap: '8px',
              zIndex: 10,
            }}
          >
            {metaProgress >= 0.7 && metaProgress < 2.0 && (
              <button
                onClick={handleFeedCaterpillar}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(22, 163, 74, 0.45)',
                }}
              >
                <Leaf size={15} />
                {lang === 'en' ? `Feed Leaf` : `पात खुवाउनुहोस् (${leafBites}/8)`}
              </button>
            )}

            {metaProgress >= 2.8 && (
              <button
                onClick={() => {
                  setIsFlapping(!isFlapping);
                  ScienceAudio.playPop();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(234, 88, 12, 0.45)',
                }}
              >
                <Wind size={15} />
                {lang === 'en' ? (isFlapping ? 'Rest Wings' : 'Flap Wings') : 'पखेटा चलाउनुहोस्'}
              </button>
            )}
          </div>

          {/* Bottom Interactive Metamorphosis Scrubber Dock */}
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
            {/* Top row: Stage Name & Play Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => {
                    setIsAutoPlaying(!isAutoPlaying);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isAutoPlaying ? '#ef4444' : '#22c55e',
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  {isAutoPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '2px' }} />}
                </button>

                <button
                  onClick={handleReset}
                  title="Reset to Egg Stage"
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
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    {lang === 'en' ? activeStage.nameEn : activeStage.nameNe}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {lang === 'en' ? activeStage.primaryActionEn : activeStage.primaryActionNe}
                  </div>
                </div>
              </div>

              {/* Stage Progress Number Tag */}
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(234, 88, 12, 0.25)',
                  color: '#fb923c',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {lang === 'en' ? `Stage ${currentStageIndex + 1} of 4` : `चरण ${currentStageIndex + 1} / 4`}
              </span>
            </div>

            {/* Bottom Row: Scrubber Timeline Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                {lang === 'en' ? 'Egg' : 'अण्डा'}
              </span>
              <input
                type="range"
                min="0"
                max="3"
                step="0.01"
                value={metaProgress}
                onChange={(e) => {
                  setMetaProgress(parseFloat(e.target.value));
                  setIsAutoPlaying(false);
                }}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  accentColor: '#ea580c',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#f97316' }}>
                {lang === 'en' ? 'Adult Butterfly' : 'वयस्क पुतली'}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: METAMORPHOSIS LAB NOTES & ANATOMY INSPECTOR
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
          {/* Active Stage Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(194, 65, 12, 0.05) 100%)',
              border: '1px solid rgba(234, 88, 12, 0.3)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#fb923c" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#fb923c' }}>
                {lang === 'en' ? activeStage.nameEn : activeStage.nameNe}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.5 }}>
              {lang === 'en' ? activeStage.descriptionEn : activeStage.descriptionNe}
            </div>
            <div
              style={{
                marginTop: '8px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.06)',
                fontSize: '11px',
                color: '#475569',
              }}
            >
              <strong style={{ color: '#4ade80' }}>{lang === 'en' ? 'Duration: ' : 'अवधि: '}</strong>
              {lang === 'en' ? activeStage.durationEn : activeStage.durationNe}
            </div>
          </div>

          {/* Scientific Fact Box */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Info size={14} color="#38bdf8" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>
                {lang === 'en' ? 'ENTOMOLOGY SCIENCE FACT' : 'वैज्ञानिक तथ्य'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
              {lang === 'en' ? activeStage.scientificFactEn : activeStage.scientificFactNe}
            </div>
          </div>

          {/* Stage Quick Selection Cards */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              {lang === 'en' ? 'JUMP TO METAMORPHOSIS STAGE' : 'कुनै चरणमा जानुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {stages.map((st, i) => (
                <button
                  key={st.id}
                  onClick={() => handleSelectStage(i)}
                  style={{
                    padding: '9px 10px',
                    borderRadius: '8px',
                    border:
                      Math.floor(metaProgress) === i
                        ? '2px solid #ea580c'
                        : '1px solid rgba(255,255,255,0.1)',
                    background:
                      Math.floor(metaProgress) === i
                        ? 'rgba(234, 88, 12, 0.2)'
                        : 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fb923c' }}>
                    {lang === 'en' ? st.nameEn.split(' ')[1] : st.nameNe.split(' ')[1]}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {lang === 'en' ? st.durationEn : st.durationNe}
                  </div>
                </button>
              ))}
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
                    ? `Life Cycle Quiz (${challengeIdx + 1}/${challengeQuestions.length})`
                    : `जीवनचक्र प्रश्नोत्तर (${challengeIdx + 1}/${challengeQuestions.length})`}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600, marginBottom: '10px' }}>
                {lang === 'en' ? challengeQuestions[challengeIdx].qEn : challengeQuestions[challengeIdx].qNe}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(lang === 'en' ? challengeQuestions[challengeIdx].optionsEn : challengeQuestions[challengeIdx].optionsNe).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleChallengeAnswer(i)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border:
                        challengeChoice === i
                          ? i === challengeQuestions[challengeIdx].correct
                            ? '1px solid #22c55e'
                            : '1px solid #ef4444'
                          : '1px solid rgba(255,255,255,0.1)',
                      background:
                        challengeChoice === i
                          ? i === challengeQuestions[challengeIdx].correct
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

              {challengeFeedback && (
                <div style={{ marginTop: '10px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: challengeFeedback === 'correct' ? '#4ade80' : '#f87171',
                      marginBottom: '4px',
                    }}
                  >
                    {challengeFeedback === 'correct'
                      ? lang === 'en'
                        ? '✓ Correct! Excellent Biology Knowledge.'
                        : '✓ स्याबास! सही उत्तर।'
                      : lang === 'en'
                      ? '✗ Not quite. See explanation below.'
                      : '✗ मिलेन। तलको व्याख्या हेर्नुहोस्।'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    {lang === 'en' ? challengeQuestions[challengeIdx].expEn : challengeQuestions[challengeIdx].expNe}
                  </div>
                  {challengeIdx < challengeQuestions.length - 1 && (
                    <button
                      onClick={() => {
                        setChallengeIdx((prev) => prev + 1);
                        setChallengeChoice(null);
                        setChallengeFeedback(null);
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
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Metamorphosis & Take Quiz' : 'प्रयोग पूरा गर्नुहोस् र प्रश्न हल गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
export default ButterflyLifeCycleSim;
