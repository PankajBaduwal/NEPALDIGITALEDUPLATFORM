/**
 * PlantGrowthSim.tsx
 * Master Interactive 2D Botanical Laboratory: Plant Growth & Blooming Marigold (Sayapatri)
 * (बिरुवाको वृद्धि तथा सयपत्री फूल फुल्ने प्रक्रिया - २डी अन्तरक्रियात्मक प्रयोगशाला)
 * Grade 4 Science • Chapter 5: Life Process (जीवन प्रक्रिया)
 *
 * 100% Native 2D Canvas & Vector Graphics (Zero WebGL/3D Dependencies)
 * - Ultra-Rich Natural Colors: Terracotta garden pot, compost-rich black soil, lush green stems,
 *   radiant golden Marigold / Sayapatri (सयपत्री) petals, glowing sunlight corona, and falling raindrops.
 * - Continuous Organic Growth: Seedling (0%) -> Vegetative Foliage (40%) -> Budding (70%) -> Full Golden Blossom (100%).
 * - Interactive Lab Controls: Sunlight Slider (0-100%), Moisture Slider (0-100%), Fertilizer Toggle,
 *   Watering Can button (animates water stream and soil saturation), and Growth Score calculation.
 * - Click-to-inspect anatomical callouts: Root System, Stem (Xylem/Phloem), Leaves (Chlorophyll), Flower Petals.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Sun,
  Droplets,
  Sparkles,
  RotateCcw,
  Check,
  Award,
  Flower2,
  Leaf,
  Layers,
} from 'lucide-react';

export const PlantGrowthSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Environmental sliders
  const [sunlight, setSunlight] = useState<number>(75); // 0 to 100%
  const [moisture, setMoisture] = useState<number>(70); // 0 to 100%
  const [hasFertilizer, setHasFertilizer] = useState<boolean>(true);
  const [isWatering, setIsWatering] = useState<boolean>(false);

  // Manual growth progress scrubber (0 to 100)
  const [growthPercent, setGrowthPercent] = useState<number>(35);
  const [isPlayingGrowth, setIsPlayingGrowth] = useState<boolean>(false);
  const [inspectedPart, setInspectedPart] = useState<string>('stem');

  // Challenge stage state
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [challengeSelected, setChallengeSelected] = useState<number | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<'correct' | 'wrong' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rainDropsRef = useRef<Array<{ x: number; y: number; speed: number; len: number }>>([]);

  // Calculate real-time health / growth rate score (0 to 100)
  const healthScore = Math.min(
    100,
    Math.round(
      (1 - Math.abs(sunlight - 80) / 100) * 45 +
        (1 - Math.abs(moisture - 70) / 100) * 40 +
        (hasFertilizer ? 15 : 0)
    )
  );

  // Auto-growth animation loop when playing
  useEffect(() => {
    let timer: any;
    if (isPlayingGrowth) {
      timer = setInterval(() => {
        setGrowthPercent((prev) => {
          if (prev >= 100) {
            setIsPlayingGrowth(false);
            ScienceAudio.playCelebration();
            setStars(3);
            setIsCompleted(true);
            setStage('understand');
            return 100;
          }
          return Math.min(100, prev + 2);
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlayingGrowth]);

  // Raindrops init
  useEffect(() => {
    const drops = [];
    for (let i = 0; i < 30; i++) {
      drops.push({
        x: 350 + Math.random() * 180,
        y: Math.random() * 200,
        speed: 7 + Math.random() * 6,
        len: 12 + Math.random() * 8,
      });
    }
    rainDropsRef.current = drops;
  }, []);

  const handleWaterClick = () => {
    setIsWatering(true);
    setMoisture((prev) => Math.min(100, prev + 20));
    ScienceAudio.playWaterDrop();
    setTimeout(() => setIsWatering(false), 2000);
  };

  const handleReset = () => {
    setSunlight(75);
    setMoisture(70);
    setHasFertilizer(true);
    setGrowthPercent(20);
    setIsPlayingGrowth(false);
    ScienceAudio.playWhoosh();
  };

  // ══════════════════════════════════════════════════════════════════
  // MASTER 2D CANVAS RENDERER: GREENHOUSE & SAYAPATRI FLOWER
  // ══════════════════════════════════════════════════════════════════
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width * 0.5;
    const timeSec = Date.now() * 0.001;

    ctx.clearRect(0, 0, width, height);

    // ─────────────────────────────────────────────────────────────
    // 1. GREENHOUSE SKY & WALLS BACKGROUND
    // ─────────────────────────────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#e0f2fe'); // Soft skylight blue
    bgGrad.addColorStop(0.55, '#f0fdf4');
    bgGrad.addColorStop(1, '#dcfce7');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Conservatory Greenhouse Glass Window Panes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 3;
    // Vertical mullions
    for (let x = 80; x < width; x += 180) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height * 0.72);
      ctx.stroke();
    }
    // Horizontal window transoms
    ctx.beginPath();
    ctx.moveTo(0, height * 0.35);
    ctx.lineTo(width, height * 0.35);
    ctx.stroke();

    // Wooden Greenhouse Table Bench
    ctx.fillStyle = '#78350f'; // Dark polished wood
    ctx.fillRect(0, height * 0.72, width, 18);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, height * 0.72 + 18, width, height - (height * 0.72 + 18));

    // Dynamic Radiant Sunbeams
    const sunBrightness = sunlight / 100;
    const sunX = width * 0.8;
    const sunY = height * 0.16;

    const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 140 * sunBrightness);
    sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
    sunGlow.addColorStop(0.4, 'rgba(251, 191, 36, 0.35)');
    sunGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 140 * sunBrightness, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();

    // ─────────────────────────────────────────────────────────────
    // 2. TERRACOTTA CLAY POT WITH COMPOST SOIL
    // ─────────────────────────────────────────────────────────────
    const potTopY = height * 0.58;
    const potBottomY = height * 0.72;
    const potTopW = 210;
    const potBottomW = 150;

    ctx.save();
    // Pot Shadow on Table
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX, potBottomY + 6, potBottomW * 0.65, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Terracotta Clay Pot Body
    const potGrad = ctx.createLinearGradient(centerX - potTopW * 0.5, potTopY, centerX + potTopW * 0.5, potTopY);
    potGrad.addColorStop(0, '#c2410c'); // Warm terracotta orange
    potGrad.addColorStop(0.35, '#ea580c');
    potGrad.addColorStop(0.7, '#f97316');
    potGrad.addColorStop(1, '#9a3412');

    ctx.fillStyle = potGrad;
    ctx.beginPath();
    ctx.moveTo(centerX - potTopW * 0.5, potTopY);
    ctx.lineTo(centerX + potTopW * 0.5, potTopY);
    ctx.lineTo(centerX + potBottomW * 0.5, potBottomY);
    ctx.lineTo(centerX - potBottomW * 0.5, potBottomY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pot Upper Rim Lip
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(centerX - potTopW * 0.54, potTopY - 14, potTopW * 1.08, 16, 6);
    ctx.fill();
    ctx.stroke();

    // Dark Compost Soil Surface
    const moistFactor = moisture / 100;
    const soilColor = moistFactor > 0.5 ? '#27180e' : '#452b1a';
    ctx.fillStyle = soilColor;
    ctx.beginPath();
    ctx.ellipse(centerX, potTopY - 6, potTopW * 0.48, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fertilizer Nutrients Granules (White & Brown organic specks)
    if (hasFertilizer) {
      ctx.fillStyle = '#ffffff';
      for (let f = 0; f < 14; f++) {
        const fx = centerX - potTopW * 0.35 + (f * 17) % (potTopW * 0.7);
        const fy = potTopY - 6 + Math.sin(f * 4) * 6;
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // ─────────────────────────────────────────────────────────────
    // 3. GROWING SAYAPATRI (MARIGOLD) PLANT
    // ─────────────────────────────────────────────────────────────
    const t = growthPercent / 100; // 0.0 to 1.0
    const stemBaseY = potTopY - 6;
    const maxStemHeight = 210;
    const currentStemHeight = 35 + t * maxStemHeight;
    const stemApexY = stemBaseY - currentStemHeight;

    const sway = Math.sin(timeSec * 2.5) * (t * 4); // Gentle wind sway

    ctx.save();
    // Main Plant Stem
    const stemColor = t > 0.3 ? '#16a34a' : '#4ade80';
    ctx.strokeStyle = stemColor;
    ctx.lineWidth = 5 + t * 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, stemBaseY);
    ctx.bezierCurveTo(
      centerX + sway * 0.3,
      stemBaseY - currentStemHeight * 0.4,
      centerX - sway * 0.2,
      stemBaseY - currentStemHeight * 0.7,
      centerX + sway,
      stemApexY
    );
    ctx.stroke();

    // Secondary Stem Branches & Pinnate Serrated Leaves
    const numLeafPairs = Math.floor(t * 6);
    for (let i = 1; i <= numLeafPairs; i++) {
      const frac = i / 6;
      const branchY = stemBaseY - currentStemHeight * frac;
      const branchX = centerX + sway * frac;
      const leafLen = (20 + frac * 28) * Math.min(1.0, t * 1.5);

      // Left Leaf with serrated leaflets
      ctx.save();
      ctx.translate(branchX, branchY);
      ctx.rotate(-0.55 - Math.sin(timeSec + i) * 0.05);

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-leafLen * 0.5, -12, -leafLen * 0.8, -10, -leafLen, 0);
      ctx.bezierCurveTo(-leafLen * 0.6, 12, -leafLen * 0.3, 8, 0, 0);
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // Right Leaf
      ctx.save();
      ctx.translate(branchX, branchY);
      ctx.rotate(0.55 + Math.sin(timeSec + i) * 0.05);

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(leafLen * 0.5, -12, leafLen * 0.8, -10, leafLen, 0);
      ctx.bezierCurveTo(leafLen * 0.6, 12, leafLen * 0.3, 8, 0, 0);
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────
    // 4. SAYAPATRI (MARIGOLD) FLOWER BLOOM (t >= 0.55)
    // ─────────────────────────────────────────────────────────────
    const flowerX = centerX + sway;
    const flowerY = stemApexY;

    if (t >= 0.55) {
      const bloomProgress = Math.min(1.0, (t - 0.55) / 0.45); // 0 to 1
      const flowerRadius = 14 + bloomProgress * 38;

      ctx.save();
      ctx.translate(flowerX, flowerY);

      // Green Calyx Base Cup (Sepals)
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, 10, 14 * bloomProgress + 6, 0, Math.PI);
      ctx.fill();

      // Dense Concentric Rings of Ruffled Golden Orange Petals
      const rings = [
        { count: 18, radius: flowerRadius, col: '#ea580c' }, // Outer deep orange petals
        { count: 16, radius: flowerRadius * 0.82, col: '#f97316' },
        { count: 14, radius: flowerRadius * 0.64, col: '#facc15' }, // Radiant golden yellow
        { count: 12, radius: flowerRadius * 0.44, col: '#fef08a' }, // Center core
      ];

      rings.forEach((ring, rIdx) => {
        ctx.fillStyle = ring.col;
        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 1;

        for (let p = 0; p < ring.count; p++) {
          const angle = (p * Math.PI * 2) / ring.count + rIdx * 0.2;
          const px = Math.cos(angle) * ring.radius;
          const py = Math.sin(angle) * (ring.radius * 0.85);

          ctx.beginPath();
          ctx.ellipse(px, py, 10 * bloomProgress, 6 * bloomProgress, angle, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      });

      // Flower Center Disk Core
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, 0, 8 * bloomProgress, 0, Math.PI * 2);
      ctx.fill();

      // Sparkling Pollen Particles
      if (bloomProgress > 0.7) {
        ctx.fillStyle = '#fef08a';
        for (let pol = 0; pol < 8; pol++) {
          const polX = (Math.sin(timeSec * 3 + pol) * 45);
          const polY = -25 - ((timeSec * 25 + pol * 16) % 50);
          ctx.beginPath();
          ctx.arc(polX, polY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    } else {
      // Tiny Green Unopened Bud (t < 0.55)
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, 7 + t * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    // ─────────────────────────────────────────────────────────────
    // 5. ANIMATED FALLING WATERING CAN RAIN
    // ─────────────────────────────────────────────────────────────
    if (isWatering) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      rainDropsRef.current.forEach((drop) => {
        drop.y += drop.speed;
        if (drop.y > potTopY) drop.y = 20;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.len);
        ctx.stroke();
      });
      ctx.restore();
    }
  }, [sunlight, moisture, hasFertilizer, growthPercent, isWatering]);

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
      qEn: 'What three crucial elements are required for a green plant to produce food via photosynthesis?',
      qNe: 'बिरुवाले प्रकाश संश्लेषण (Photosynthesis) द्वारा खाना बनाउन कुन तीनवटा कुराहरू चाहिन्छन्?',
      optionsEn: [
        'Sunlight, Water, and Carbon Dioxide ($CO_2$)',
        'Plastic, Ice, and Salt',
        'Milk, Honey, and Darkness',
        'Heavy Rocks, Iron, and Smoke',
      ],
      optionsNe: [
        'सूर्यको प्रकाश, पानी र कार्बन डाइअक्साइड ग्यास',
        'प्लास्टिक, बरफ र नुन',
        'दूध, मह र अँध्यारो',
        'ठूलो ढुङ्गा, फलाम र धुवाँ',
      ],
      correct: 0,
      expEn: 'Chlorophyll in leaves uses solar photons to synthesize glucose from water and carbon dioxide, releasing oxygen.',
      expNe: 'पातको हरियो क्लोरोफिलले घामको प्रकाश र हावाको कार्बन डाइअक्साइड मिलाएर ग्लुकोज बनाउँछ।',
    },
    {
      qEn: 'Which vascular tissue transports water and dissolved minerals from the roots up to the leaves?',
      qNe: 'जराले सोसेको पानी र खनिज मल पातसम्म पुर्याउने नलीलाई के भनिन्छ?',
      optionsEn: ['Xylem (जाइलेम)', 'Phloem (फ्लोएम)', 'Stomata (स्टोमाटा)', 'Epidermis (छाला)'],
      optionsNe: ['जाइलेम (Xylem)', 'फ्लोएम (Phloem)', 'स्टोमाटा (Stomata)', 'इपिडर्मिस (Epidermis)'],
      correct: 0,
      expEn: 'Xylem vessels carry water upwards from roots; Phloem transports synthesized sugar downwards to roots and fruits.',
      expNe: 'जाइलेमले जराबाट पानी माथि लैजान्छ र फ्लोएमले बनेको खाना बिरुवाभरि बाँड्छ।',
    },
    {
      qEn: 'Why do marigold flowers (सयपत्री) develop bright golden-orange petals?',
      qNe: 'सयपत्री फूलमा चम्किला पहेँला र सुन्तला रङ्गका दलहरू (Petals) किन हुन्छन्?',
      optionsEn: [
        'To attract pollinating bees and butterflies with vivid visual cues',
        'To scare away garden soil worms',
        'To make the roots grow colder',
        'To reflect all sunlight away from the plant',
      ],
      optionsNe: [
        'परागसेचनका लागि मौरी र पुतलीलाई आकर्षित गर्न',
        'गँड्यौलालाई भगाउन',
        'जरालाई चिसो पार्न',
        'घामको प्रकाश फर्काउन',
      ],
      correct: 0,
      expEn: 'Bright petals and sweet nectar entice insect pollinators to transfer pollen for seed formation.',
      expNe: 'चम्किलो रङ्ग देखेर मौरी र पुतली आउँछन् र फूलमा परागसेचन गराएर बीउ बनाउन मद्दत गर्छन्।',
    },
  ];

  const handleChallengeAnswer = (idx: number) => {
    setChallengeSelected(idx);
    const curr = quizQuestions[challengeIdx];
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
      title="Greenhouse Studio: Plant Growth & Blooming Marigold"
      titleNepali="हरितगृह प्रयोगशाला: बिरुवाको वृद्धि तथा सयपत्री फूल"
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
      currentPromptEn="Balance sunlight, moisture, and fertilizer to help the Sayapatri plant grow tall and bloom with golden petals!"
      currentPromptNe="घाम, पानी र मलको सन्तुलन मिलाएर सयपत्रीको बिरुवालाई हुर्काउनुहोस् र सुनौलो फूल फुलाउनुहोस्!"
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

          {/* Top Quick Actions */}
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
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.45)',
              }}
            >
              <Droplets size={16} />
              {lang === 'en' ? 'Water Pot (पानी हाल)' : 'पानी हाल्नुहोस्'}
            </button>
          </div>

          {/* Bottom Interactive Growth Scrubber Bar */}
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
                    setIsPlayingGrowth(!isPlayingGrowth);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isPlayingGrowth ? '#ef4444' : '#22c55e',
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Flower2 size={18} />
                </button>

                <button
                  onClick={handleReset}
                  title="Reset to Seedling"
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
                    {growthPercent >= 80
                      ? lang === 'en'
                        ? 'Golden Bloom (सयपत्री फूल फुल्दै)'
                        : 'सुनौलो सयपत्री फूल'
                      : growthPercent >= 45
                      ? lang === 'en'
                        ? 'Vegetative Shoot & Foliage'
                        : 'हरिया पात र हाँगाहरू'
                      : lang === 'en'
                      ? 'Young Seedling Sprout'
                      : 'सानो बिरुवा'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#4ade80' }}>
                    {lang === 'en' ? `Plant Health: ${healthScore}% Optimal` : `बिरुवाको स्वास्थ्य: ${healthScore}%`}
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
                {growthPercent}% Growth
              </span>
            </div>

            {/* Growth Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                {lang === 'en' ? 'Sprout' : 'टुसा'}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={growthPercent}
                onChange={(e) => {
                  setGrowthPercent(parseInt(e.target.value));
                  setIsPlayingGrowth(false);
                }}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  accentColor: '#22c55e',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#facc15' }}>
                {lang === 'en' ? 'Golden Flower' : 'सयपत्री फूल'}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: GREENHOUSE LAB CONTROLS
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
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flower2 size={16} color="#4ade80" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#4ade80' }}>
                {lang === 'en' ? 'Botanical Greenhouse Station' : 'हरितगृह वनस्पति अनुसन्धान'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px', lineHeight: 1.5 }}>
              {lang === 'en'
                ? 'Marigold (Tagetes erecta / सयपत्री) requires abundant warm sunlight, moist well-drained soil, and organic compost to bloom vigorously.'
                : 'सयपत्री फूल राम्रोसँग फुल्न प्रशस्त घाम, चिसो माटो र कम्पोस्ट मलको आवश्यकता पर्दछ।'}
            </div>
          </div>

          {/* Environmental Sliders */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sun size={13} color="#facc15" />
                  {lang === 'en' ? 'Sunlight (घामको प्रकाश)' : 'घामको प्रकाश'}
                </span>
                <strong style={{ color: '#facc15' }}>{sunlight}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sunlight}
                onChange={(e) => setSunlight(parseInt(e.target.value))}
                style={{ width: '100%', height: '5px', accentColor: '#facc15', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Droplets size={13} color="#38bdf8" />
                  {lang === 'en' ? 'Moisture (माटोको ओस)' : 'माटोको ओस'}
                </span>
                <strong style={{ color: '#38bdf8' }}>{moisture}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={moisture}
                onChange={(e) => setMoisture(parseInt(e.target.value))}
                style={{ width: '100%', height: '5px', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
              <span style={{ fontSize: '11px', color: '#475569' }}>
                {lang === 'en' ? 'Organic Fertilizer (कम्पोस्ट मल)' : 'कम्पोस्ट मल'}
              </span>
              <button
                onClick={() => {
                  setHasFertilizer(!hasFertilizer);
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: hasFertilizer ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.2)',
                  background: hasFertilizer ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.05)',
                  color: hasFertilizer ? '#4ade80' : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {hasFertilizer ? (lang === 'en' ? 'Added ✓' : 'थपिएको ✓') : (lang === 'en' ? 'None' : 'छैन')}
              </button>
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
                    ? `Botany Quiz (${challengeIdx + 1}/${quizQuestions.length})`
                    : `प्रश्नोत्तर (${challengeIdx + 1}/${quizQuestions.length})`}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600, marginBottom: '10px' }}>
                {lang === 'en' ? quizQuestions[challengeIdx].qEn : quizQuestions[challengeIdx].qNe}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(lang === 'en' ? quizQuestions[challengeIdx].optionsEn : quizQuestions[challengeIdx].optionsNe).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleChallengeAnswer(i)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border:
                        challengeSelected === i
                          ? i === quizQuestions[challengeIdx].correct
                            ? '1px solid #22c55e'
                            : '1px solid #ef4444'
                          : '1px solid rgba(255,255,255,0.1)',
                      background:
                        challengeSelected === i
                          ? i === quizQuestions[challengeIdx].correct
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
                        ? '✓ Correct! Excellent Plant Science.'
                        : '✓ स्याबास! सही उत्तर।'
                      : lang === 'en'
                      ? '✗ Not quite. Look at the explanation below.'
                      : '✗ मिलेन। तलको व्याख्या हेर्नुहोस्।'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    {lang === 'en' ? quizQuestions[challengeIdx].expEn : quizQuestions[challengeIdx].expNe}
                  </div>
                  {challengeIdx < quizQuestions.length - 1 && (
                    <button
                      onClick={() => {
                        setChallengeIdx((prev) => prev + 1);
                        setChallengeSelected(null);
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
            {lang === 'en' ? 'Complete Growth Lab & Quiz' : 'प्रयोग पूरा गर्नुहोस् र प्रश्न हल गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
export default PlantGrowthSim;
