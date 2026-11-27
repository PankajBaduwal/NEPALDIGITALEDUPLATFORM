/**
 * AnimalLifeCyclesSim.tsx
 * Master Interactive 2D Amphibian Metamorphosis: Frog Life Cycle
 * (भ्यागुतोको पूर्ण रूपान्तरण जीवनचक्र - 2डी अन्तरक्रियात्मक प्रयोगशाला)
 * Grade 4 Science • Chapter 5: Life Process
 *
 * 100% Native 2D Canvas & Vector Graphics (Zero WebGL/3D Dependencies)
 * - Ultra-Rich Natural Colors: Lush lotus pond, floating green lily pads, clear blue water cross-section,
 *   translucent jelly eggs (frog spawn), swimming tadpole, and bright green leopard-spotted adult frog.
 * - 4-Stage Complete Amphibian Metamorphosis:
 *   1. Frog Spawn: Floating gelatinous egg mass with dark embryos inside.
 *   2. Aquatic Tadpole: Swishing swimming tail, external feathery gills, grazing on algae.
 *   3. Froglet with Limbs: Hind and forelimbs developing, tail being absorbed, lungs forming.
 *   4. Adult Amphibian Frog: Breathing on lily pad, croaking vocal sac, webbed feet, and insect catching!
 * - Interactive Controls: Metamorphosis Scrubber, Stage buttons, "Shoot Tongue / Catch Fly" action, and Audio FX.
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
  Check,
  Award,
  Droplets,
  Eye,
  Layers,
} from 'lucide-react';

interface FrogStage {
  id: string;
  stepNum: number;
  nameEn: string;
  nameNe: string;
  habitatEn: string;
  habitatNe: string;
  breathingEn: string;
  breathingNe: string;
  descriptionEn: string;
  descriptionNe: string;
  factEn: string;
  factNe: string;
}

export const AnimalLifeCyclesSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Metamorphosis timeline: 0.0 (Eggs) -> 1.0 (Tadpole) -> 2.0 (Froglet) -> 3.0 (Adult Frog)
  const [metaProgress, setMetaProgress] = useState<number>(0.0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [showTongue, setShowTongue] = useState<boolean>(false);

  // Challenge stage state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const frogStages: FrogStage[] = [
    {
      id: 'egg',
      stepNum: 1,
      nameEn: '1. Frog Spawn / Egg Mass',
      nameNe: '1. अण्डाको थुप्रो (Frog Spawn)',
      habitatEn: 'Calm shallow pond attached to aquatic weeds',
      habitatNe: 'पोखरीको शान्त पानीमा लेउ र झारमा टाँसिएको',
      breathingEn: 'Oxygen diffuses directly through jelly sphere',
      breathingNe: 'जेली खोलबाट सिधै अक्सिजन भित्र पस्छ',
      descriptionEn: 'Female frogs lay thousands of soft eggs enveloped in a buoyant, protective gelatinous jelly mass.',
      descriptionNe: 'पोथी भ्यागुतोले पानीमा हजारौँ अण्डाहरू पार्छ जसलाई बाक्लो जेलीजस्तो पारदर्शी खोलले जोगाउँछ।',
      factEn: 'The slippery jelly expands in water, protecting embryos from hungry fish and keeping them warm.',
      factNe: 'चिप्लो जेलीले गर्दा माछाहरूले अण्डा खान सक्दैनन् र घामको न्यानो कायम रहन्छ।',
    },
    {
      id: 'tadpole',
      stepNum: 2,
      nameEn: '2. Swimming Tadpole',
      nameNe: '2. चेपागाँडा (Aquatic Tadpole)',
      habitatEn: 'Exclusively underwater with fish-like swimming',
      habitatNe: 'माछाझैँ पानीभित्र मात्र पौडिएर बस्छ',
      breathingEn: 'External and internal feathery gills',
      breathingNe: 'पानीमा सास फेर्न फुल्का वा गिल्स (Gills)',
      descriptionEn: 'The tadpole hatches with a finned tail and gills, swimming continuously and feeding on pond algae.',
      descriptionNe: 'अण्डा फुटेर पुच्छर भएको चेपागाँडा निस्कन्छ जसले माछाझैँ फुल्काबाट सास फेर्छ र लेउ खान्छ।',
      factEn: 'Tadpoles are strictly herbivorous grazers using microscopic rasping teeth.',
      factNe: 'यस अवस्थामा चेपागाँडाले पोखरीको हरियो लेउ मात्र खान्छ।',
    },
    {
      id: 'froglet',
      stepNum: 3,
      nameEn: '3. Froglet with Limbs',
      nameNe: '3. खुट्टा पलाएको चेपागाँडा (Froglet)',
      habitatEn: 'Shallow pond edge transitioning to land',
      habitatNe: 'पोखरीको छेउ र जमिनको बीचमा',
      breathingEn: 'Developing internal lungs & moist skin',
      breathingNe: 'फोक्सोको विकास र ओसिलो छाला',
      descriptionEn: 'Powerful hind legs sprout first, followed by front arms. The long swimming tail is slowly reabsorbed as lungs form.',
      descriptionNe: 'पहिले पछाडिका दुई बलिया खुट्टा पलाउँछन्, त्यसपछि अगाडिका हातहरू। पुच्छर बिस्तारै सुक्दै जान्छ र फोक्सो बन्छ।',
      factEn: 'Tail tissue is broken down by cellular apoptosis to provide energy for lung and limb construction.',
      factNe: 'पुच्छरको भाग शरीरभित्रै घुलेर नयाँ खुट्टा र फोक्सो बन्न ऊर्जा दिन्छ।',
    },
    {
      id: 'adult',
      stepNum: 4,
      nameEn: '4. Adult Amphibian Frog',
      nameNe: '4. वयस्क भ्यागुतो (Adult Amphibian)',
      habitatEn: 'Dual amphibious life: both land and freshwater',
      habitatNe: 'उभयचर: जमिन र पानी दुवै ठाउँमा',
      breathingEn: 'Lungs on land & moist cutaneous skin underwater',
      breathingNe: 'जमिनमा फोक्सोले र पानीभित्र ओसिलो छालाले सास फेर्छ',
      descriptionEn: 'Tail completely disappears! The carnivorous adult leaps with webbed feet and captures flying insects with a rapid sticky tongue.',
      descriptionNe: 'पुच्छर पूर्ण रूपमा हराउँछ। वयस्क भ्यागुतोले जमिनमा उफ्रिँदै लामो च्यापच्यापे जिब्रोले किराहरू समात्छ।',
      factEn: 'Frogs absorb water and oxygen directly through their permeable glandular skin without ever drinking water with their mouth!',
      factNe: 'भ्यागुतोले मुखले कहिल्यै पानी पिउँदैन; यसले आफ्नो छालाबाटै पानी र अक्सिजन सोस्छ!',
    },
  ];

  const currentStageIndex = Math.min(3, Math.floor(metaProgress));
  const activeFrogStage = frogStages[currentStageIndex];

  // Auto-play interval
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
          ScienceAudio.playWaterDrop();
          return Number((prev + 0.05).toFixed(2));
        });
      }, 160);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  // Action: Tongue catch fly
  const handleCatchFly = () => {
    setShowTongue(true);
    ScienceAudio.playPop();
    setTimeout(() => {
      setShowTongue(false);
    }, 700);
  };

  const handleReset = () => {
    setMetaProgress(0.0);
    setIsAutoPlaying(false);
    setShowTongue(false);
    ScienceAudio.playWhoosh();
  };

  // ══════════════════════════════════════════════════════════════════
  // MASTER 2D CANVAS RENDERER: VIBRANT LOTUS POND METAMORPHOSIS
  // ══════════════════════════════════════════════════════════════════
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const waterSurfaceY = height * 0.42;
    const timeSec = Date.now() * 0.001;
    const p = metaProgress;

    ctx.clearRect(0, 0, width, height);

    // ─────────────────────────────────────────────────────────────
    // 1. POND SHORELINE & SKY (Above Water)
    // ─────────────────────────────────────────────────────────────
    const skyGrad = ctx.createLinearGradient(0, 0, 0, waterSurfaceY);
    skyGrad.addColorStop(0, '#7dd3fc');
    skyGrad.addColorStop(1, '#dbeafe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, waterSurfaceY);

    // Lush Cattails & Reeds along Pond Bank
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;
    for (let r = 10; r < 140; r += 16) {
      const rh = 65 + Math.sin(r * 3) * 20;
      ctx.beginPath();
      ctx.moveTo(r, waterSurfaceY);
      ctx.quadraticCurveTo(r + 8, waterSurfaceY - rh * 0.6, r + 15, waterSurfaceY - rh);
      ctx.stroke();

      // Brown Cattail Head
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(r + 11, waterSurfaceY - rh + 6, 8, 22, 4);
      ctx.fill();
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CLEAR FRESHWATER POND (Below Water)
    // ─────────────────────────────────────────────────────────────
    const pondGrad = ctx.createLinearGradient(0, waterSurfaceY, 0, height);
    pondGrad.addColorStop(0, '#0284c7'); // Surface turquoise
    pondGrad.addColorStop(0.5, '#0369a1');
    pondGrad.addColorStop(1, '#075985');
    ctx.fillStyle = pondGrad;
    ctx.fillRect(0, waterSurfaceY, width, height - waterSurfaceY);

    // Riverbed Sand & Smooth Boulders
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, height * 0.86, width, height - height * 0.86);

    const stones = [
      { x: 100, y: height * 0.91, rx: 35, ry: 16, col: '#64748b' },
      { x: 260, y: height * 0.89, rx: 42, ry: 18, col: '#78716c' },
      { x: 490, y: height * 0.92, rx: 38, ry: 17, col: '#94a3b8' },
      { x: 720, y: height * 0.88, rx: 45, ry: 20, col: '#64748b' },
    ];
    stones.forEach((st) => {
      ctx.fillStyle = st.col;
      ctx.beginPath();
      ctx.ellipse(st.x, st.y, st.rx, st.ry, 0.1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Submerged Green Pond Algae Weeds
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3.5;
    for (let w = 180; w < width; w += 160) {
      ctx.beginPath();
      ctx.moveTo(w, height * 0.88);
      ctx.bezierCurveTo(
        w + Math.sin(timeSec * 2 + w) * 20,
        height * 0.65,
        w - Math.cos(timeSec * 2 + w) * 16,
        height * 0.48,
        w + Math.sin(timeSec * 2) * 22,
        waterSurfaceY + 15
      );
      ctx.stroke();
    }

    // ─────────────────────────────────────────────────────────────
    // 3. FLOATING LILY PADS ON SURFACE
    // ─────────────────────────────────────────────────────────────
    const lilyPadX = width * 0.52;
    const lilyPadY = waterSurfaceY;
    const lilyPadR = 95;

    ctx.save();
    // Drop shadow in water
    ctx.fillStyle = 'rgba(2, 60, 90, 0.5)';
    ctx.beginPath();
    ctx.ellipse(lilyPadX, lilyPadY + 14, lilyPadR, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Floating Green Lily Pad (Heart slit notched leaf)
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(lilyPadX, lilyPadY, lilyPadR, 26, 0, 0.2, Math.PI * 1.8);
    ctx.lineTo(lilyPadX, lilyPadY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Veins on Lily Pad
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1.5;
    for (let a = 0.3; a < Math.PI * 1.7; a += 0.4) {
      ctx.beginPath();
      ctx.moveTo(lilyPadX, lilyPadY);
      ctx.lineTo(lilyPadX + Math.cos(a) * (lilyPadR * 0.85), lilyPadY + Math.sin(a) * 22);
      ctx.stroke();
    }

    // Blooming Pink Lotus Flower (Right side of lily pad)
    const lotusX = lilyPadX + 75;
    const lotusY = lilyPadY - 14;
    ctx.fillStyle = '#f472b6';
    for (let lp = -2; lp <= 2; lp++) {
      ctx.beginPath();
      ctx.ellipse(lotusX + lp * 6, lotusY + Math.abs(lp) * 3, 7, 16, lp * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(lotusX, lotusY + 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ─────────────────────────────────────────────────────────────
    // 4. METAMORPHOSIS RENDER ACROSS 4 STAGES
    // ─────────────────────────────────────────────────────────────

    // ═════════════════════════════════════════════════════════════
    // STAGE 1: FROG SPAWN / EGG MASS (p < 1.0)
    // ═════════════════════════════════════════════════════════════
    if (p < 1.0) {
      const eggAlpha = 1.0 - Math.max(0, (p - 0.7) / 0.3);
      ctx.save();
      ctx.globalAlpha = eggAlpha;

      const spawnX = width * 0.38;
      const spawnY = waterSurfaceY + 80;

      // Group of translucent jelly eggs
      for (let i = 0; i < 28; i++) {
        const ox = Math.cos(i * 1.8) * (20 + (i % 4) * 12);
        const oy = Math.sin(i * 1.8) * (14 + (i % 3) * 10);
        const ex = spawnX + ox;
        const ey = spawnY + oy;

        // Gelatinous Translucent Capsule
        const jellyGrad = ctx.createRadialGradient(ex - 2, ey - 2, 2, ex, ey, 14);
        jellyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        jellyGrad.addColorStop(0.65, 'rgba(186, 230, 253, 0.45)');
        jellyGrad.addColorStop(1, 'rgba(2, 132, 199, 0.25)');

        ctx.fillStyle = jellyGrad;
        ctx.beginPath();
        ctx.arc(ex, ey, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Dark Central Embryo Dot
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(ex, ey, 4.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pin Callout
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(spawnX - 75, spawnY - 65, 150, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'en' ? '🥚 Frog Spawn' : '🥚 अण्डाको थुप्रो', spawnX, spawnY - 48);
      ctx.restore();
    }

    // ═════════════════════════════════════════════════════════════
    // STAGE 2: SWIMMING TADPOLE (0.7 <= p < 2.0)
    // ═════════════════════════════════════════════════════════════
    if (p >= 0.7 && p < 2.0) {
      const tadAlpha = p < 1.0 ? (p - 0.7) / 0.3 : 1.0 - Math.max(0, (p - 1.8) / 0.2);
      ctx.save();
      ctx.globalAlpha = tadAlpha;

      const tadX = width * 0.46;
      const tadY = waterSurfaceY + 110 + Math.sin(timeSec * 3) * 8;
      const tailWiggle = Math.sin(timeSec * 12) * 16;

      // Long swimming tail fin
      ctx.fillStyle = 'rgba(74, 222, 128, 0.65)';
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tadX - 10, tadY);
      ctx.quadraticCurveTo(tadX - 60, tadY - 14 + tailWiggle * 0.5, tadX - 110, tadY + tailWiggle);
      ctx.quadraticCurveTo(tadX - 60, tadY + 14 + tailWiggle * 0.5, tadX - 10, tadY);
      ctx.fill();
      ctx.stroke();

      // Oval Tadpole Body
      ctx.fillStyle = '#1e293b'; // Dark olive black
      ctx.beginPath();
      ctx.ellipse(tadX, tadY, 26, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // External Feathery Gills (Red branches behind head)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      for (let g = -1; g <= 1; g++) {
        ctx.beginPath();
        ctx.moveTo(tadX - 6, tadY - 12);
        ctx.lineTo(tadX - 16 + g * 4, tadY - 24 + g * 3);
        ctx.stroke();
      }

      // Eye
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(tadX + 14, tadY - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(tadX + 15, tadY - 6, 2, 0, Math.PI * 2);
      ctx.fill();

      // Tadpole Callout Pin
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(tadX - 65, tadY - 55, 130, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'en' ? '🐟 Tadpole' : '🐟 चेपागाँडा (Tadpole)', tadX, tadY - 38);
      ctx.restore();
    }

    // ═════════════════════════════════════════════════════════════
    // STAGE 3: FROGLET WITH LEGS (1.7 <= p < 3.0)
    // ═════════════════════════════════════════════════════════════
    if (p >= 1.7 && p < 3.0) {
      const fletAlpha = p < 2.0 ? (p - 1.7) / 0.3 : 1.0 - Math.max(0, (p - 2.8) / 0.2);
      ctx.save();
      ctx.globalAlpha = fletAlpha;

      const fletX = width * 0.48;
      const fletY = waterSurfaceY + 45;

      // Shortening Absorbing Tail
      ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.beginPath();
      ctx.moveTo(fletX - 18, fletY + 5);
      ctx.quadraticCurveTo(fletX - 45, fletY + 8, fletX - 60, fletY + 14);
      ctx.quadraticCurveTo(fletX - 45, fletY + 20, fletX - 18, fletY + 15);
      ctx.fill();

      // Hind Legs Sprouting (Muscular Z-shape folded)
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(fletX - 12, fletY + 10);
      ctx.lineTo(fletX - 35, fletY + 35);
      ctx.lineTo(fletX - 15, fletY + 55);
      ctx.stroke();

      // Small Front Arms
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(fletX + 10, fletY + 12);
      ctx.lineTo(fletX + 18, fletY + 28);
      ctx.stroke();

      // Metamorphosing Frog Body (Turning mottled green)
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(fletX, fletY, 26, 18, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Froglet Callout Pin
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(fletX - 70, fletY - 55, 140, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'en' ? '🐸 Froglet' : '🐸 खुट्टा पलाएको चेपागाँडा', fletX, fletY - 38);
      ctx.restore();
    }

    // ═════════════════════════════════════════════════════════════
    // STAGE 4: ADULT AMPHIBIAN FROG ON LILY PAD (p >= 2.8)
    // ═════════════════════════════════════════════════════════════
    if (p >= 2.8) {
      const adultAlpha = Math.min(1.0, (p - 2.8) / 0.2);
      ctx.save();
      ctx.globalAlpha = adultAlpha;

      const frogX = lilyPadX - 15;
      const frogY = lilyPadY - 24;
      const throatBreathe = Math.sin(timeSec * 5) * 3; // Pulsing vocal sac

      // Muscular Folded Hind Jumping Legs
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(frogX - 25, frogY + 10, 22, 14, -0.4, 0, Math.PI * 2);
      ctx.ellipse(frogX + 25, frogY + 10, 22, 14, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Webbed Hind Feet resting on Lily Pad
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(frogX - 35, frogY + 20, 14, 6, 0.2, 0, Math.PI * 2);
      ctx.ellipse(frogX + 35, frogY + 20, 14, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Main Frog Body
      const bodyGrad = ctx.createRadialGradient(frogX, frogY - 5, 8, frogX, frogY, 32);
      bodyGrad.addColorStop(0, '#4ade80'); // Bright vibrant green
      bodyGrad.addColorStop(0.7, '#16a34a');
      bodyGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(frogX, frogY, 28, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Leopard Dark Spots on Back
      ctx.fillStyle = '#14532d';
      const spots = [
        { x: frogX - 10, y: frogY - 6, r: 4 },
        { x: frogX + 8, y: frogY - 8, r: 5 },
        { x: frogX - 4, y: frogY + 6, r: 4.5 },
        { x: frogX + 12, y: frogY + 4, r: 3.5 },
      ];
      spots.forEach((sp) => {
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Front Forelegs resting in front
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(frogX - 16, frogY + 14, 6, 12, 0.2, 0, Math.PI * 2);
      ctx.ellipse(frogX + 16, frogY + 14, 6, 12, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing Throat / Vocal Sac (Croaking)
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(frogX, frogY + 12, 12 + throatBreathe, 7 + throatBreathe, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bulging Golden Eyes with Horizontal Slit Pupils
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(frogX - 14, frogY - 18, 7.5, 0, Math.PI * 2);
      ctx.arc(frogX + 14, frogY - 18, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Horizontal Pupil Slits
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(frogX - 18, frogY - 19, 8, 3);
      ctx.fillRect(frogX + 10, frogY - 19, 8, 3);

      // Interactive Rapid Tongue Projection Catching a Flying Insect
      if (showTongue) {
        const flyX = width * 0.82;
        const flyY = height * 0.22;

        // Long Sticky Pink Tongue
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(frogX, frogY - 5);
        ctx.lineTo(flyX, flyY);
        ctx.stroke();

        // Sticky club tip
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(flyX, flyY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Flying Dragonfly / Insect caught
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(flyX + 2, flyY - 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Adult Frog Pin
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(frogX - 75, frogY - 60, 150, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'en' ? '🐸 Adult Frog' : '🐸 वयस्क भ्यागुतो', frogX, frogY - 43);
      ctx.restore();
    }
  }, [metaProgress, showTongue, lang]);

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
      qEn: 'Which breathing organ does a tadpole use while swimming underwater?',
      qNe: 'पानीभित्र पौडिँदा चेपागाँडाले कुन अङ्गबाट सास फेर्छ?',
      optionsEn: [
        'External and internal feathery gills',
        'Lungs like human beings',
        'Large wings',
        'Sharp pointed horns',
      ],
      optionsNe: [
        'फुल्का वा गिल्स (Gills)',
        'मानिसको जस्तो फोक्सोले',
        'ठूला पखेटाले',
        'तिखा सिङले',
      ],
      correct: 0,
      expEn: 'Tadpoles are strictly aquatic and breathe dissolved oxygen through gills, which later transform into lungs.',
      expNe: 'चेपागाँडाले माछाझैँ फुल्काबाट पानीमा घुलेको अक्सिजन लिएर सास फेर्छ।',
    },
    {
      qEn: 'During frog metamorphosis, what happens to the tadpole’s long swimming tail?',
      qNe: 'भ्यागुतो बन्ने क्रममा चेपागाँडाको लामो पुच्छर के हुन्छ?',
      optionsEn: [
        'It is gradually reabsorbed into the body to provide nutrients for developing legs and lungs',
        'It falls off into the water like a fallen leaf',
        'It turns into a sharp walking stick',
        'It flies away in the sky',
      ],
      optionsNe: [
        'शरीरभित्रै सुकेर नयाँ खुट्टा र फोक्सो बन्न ऊर्जा दिन्छ',
        'पातझैँ पानीमा खसेर हराउँछ',
        'हिँड्ने लौरो बन्छ',
        'आकाशमा उडेर जान्छ',
      ],
      correct: 0,
      expEn: 'Through cellular apoptosis, tail proteins and lipids are digested and repurposed for limb growth.',
      expNe: 'पुच्छरको कोषहरू शरीरभित्रै घुलेर नयाँ अङ्गहरूको विकासमा प्रयोग हुन्छ।',
    },
    {
      qEn: 'Why is an adult frog classified as an "amphibian"?',
      qNe: 'वयस्क भ्यागुतोलाई किन "उभयचर" (Amphibian) भनिन्छ?',
      optionsEn: [
        'It can live both on terrestrial land and in freshwater aquatic habitats',
        'It only lives in deep frozen ice',
        'It can fly like birds',
        'It only lives inside hot volcanoes',
      ],
      optionsNe: [
        'यो जमिन र पानी दुवै ठाउँमा बाँच्न सक्छ',
        'यो हिउँभित्र मात्र बस्न सक्छ',
        'यो चराझैँ उड्न सक्छ',
        'यो आगोभित्र मात्र बस्छ',
      ],
      correct: 0,
      expEn: 'Amphibians have a two-phase life history: aquatic larvae that metamorphose into air-breathing adults.',
      expNe: 'उभयचर भनेको जमिन र पानी दुवै वातावरणमा जीवन बिताउन सक्ने जीव हो।',
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
      title="Amphibian Metamorphosis: Frog Life Cycle"
      titleNepali="उभयचर रूपान्तरण: भ्यागुतोको पूर्ण जीवनचक्र"
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
      currentPromptEn="Scrub the metamorphosis timeline to see how a water-breathing tadpole transforms into a land-leaping adult frog!"
      currentPromptNe="समयरेखा चलाउनुहोस् र पानीमा पौडिने चेपागाँडा कसरी जमिनमा उफ्रिने भ्यागुतोमा बदलिन्छ हेर्नुहोस्!"
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
            {frogStages.map((st, i) => {
              const isCurrent = Math.floor(metaProgress) === i;
              return (
                <button
                  key={st.id}
                  onClick={() => {
                    setMetaProgress(i);
                    setIsAutoPlaying(false);
                    ScienceAudio.playClick();
                  }}
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

          {/* Action: Catch Fly Tongue */}
          {metaProgress >= 2.8 && (
            <div
              style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
                zIndex: 10,
              }}
            >
              <button
                onClick={handleCatchFly}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 15px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(244, 63, 94, 0.45)',
                }}
              >
                👅 {lang === 'en' ? 'Catch Insect' : 'किरा समात्नुहोस्'}
              </button>
            </div>
          )}

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
                  }}
                >
                  {isAutoPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '2px' }} />}
                </button>

                <button
                  onClick={handleReset}
                  title="Reset to Spawn"
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
                    {lang === 'en' ? activeFrogStage.nameEn : activeFrogStage.nameNe}
                  </div>
                  <div style={{ fontSize: '11px', color: '#4ade80' }}>
                    {lang === 'en' ? activeFrogStage.breathingEn : activeFrogStage.breathingNe}
                  </div>
                </div>
              </div>

              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(34, 197, 94, 0.25)',
                  color: '#4ade80',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {lang === 'en' ? `Stage ${currentStageIndex + 1} of 4` : `चरण ${currentStageIndex + 1} / 4`}
              </span>
            </div>

            {/* Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                {lang === 'en' ? 'Eggs' : 'अण्डा'}
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
                  accentColor: '#22c55e',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e' }}>
                {lang === 'en' ? 'Adult Frog' : 'वयस्क भ्यागुतो'}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: AMPHIBIAN LAB WORKSPACE
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
          {/* Active Stage Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#4ade80" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#4ade80' }}>
                {lang === 'en' ? activeFrogStage.nameEn : activeFrogStage.nameNe}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.5 }}>
              {lang === 'en' ? activeFrogStage.descriptionEn : activeFrogStage.descriptionNe}
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
              <strong style={{ color: '#38bdf8' }}>{lang === 'en' ? 'Habitat: ' : 'बासस्थान: '}</strong>
              {lang === 'en' ? activeFrogStage.habitatEn : activeFrogStage.habitatNe}
            </div>
          </div>

          {/* Biological Fact */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
              {lang === 'en' ? 'HERPETOLOGY SCIENCE FACT' : 'उभयचर विज्ञान तथ्य'}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
              {lang === 'en' ? activeFrogStage.factEn : activeFrogStage.factNe}
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
                    ? `Metamorphosis Quiz (${quizIdx + 1}/${quizQuestions.length})`
                    : `रूपान्तरण प्रश्नोत्तर (${quizIdx + 1}/${quizQuestions.length})`}
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
                        ? '✓ Correct! Excellent Metamorphosis Knowledge.'
                        : '✓ स्याबास! सही उत्तर।'
                      : lang === 'en'
                      ? '✗ Not quite. See explanation below.'
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
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Amphibian Lab & Quiz' : 'प्रयोग पूरा गर्नुहोस् र प्रश्न हल गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
export default AnimalLifeCyclesSim;
