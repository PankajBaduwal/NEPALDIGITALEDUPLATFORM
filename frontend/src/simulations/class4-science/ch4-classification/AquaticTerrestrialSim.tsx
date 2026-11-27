/**
 * AquaticTerrestrialSim.tsx
 * Simulation 13: 2D Aquatic and Terrestrial Biomes (जलचर र स्थलचर जीवहरू)
 * Grade 4 Science • Chapter 4: Classification of Living Beings (जीवहरूको वर्गीकरण)
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - Rich panoramic split biotope: Himalayan pine forest/meadow & pristine alpine lake/river.
 * - Frame-by-frame animated wildlife: Himalayan Trout with moving gills and undulating fins,
 *   grazing Musk Deer with breathing cycle and ear twitches, Lotus with water-repellent leaf droplets,
 *   Himalayan Pine with pine cones and needle leaves, and an adventurous Tree Frog.
 * - Interactive X-Ray & Adaptation callouts, water ripple physics, and interactive classification challenge.
 */
import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Check, RotateCcw, Droplets, Mountain, Sparkles, Volume2, Info } from 'lucide-react';

interface Organism {
  id: string;
  nameEn: string;
  nameNe: string;
  habitat: 'aquatic' | 'terrestrial';
  habitatNe: 'जलचर (Aquatic)' | 'स्थलचर (Terrestrial)';
  adaptationEn: string;
  adaptationNe: string;
  taglineEn: string;
  taglineNe: string;
  keyFeatures: { en: string; ne: string }[];
}

export const AquaticTerrestrialSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const organisms: Organism[] = [
    {
      id: 'fish',
      nameEn: 'Himalayan Trout (असला माछा)',
      nameNe: 'असला माछा (Snow Trout)',
      habitat: 'aquatic',
      habitatNe: 'जलचर (Aquatic)',
      taglineEn: 'Cold mountain river swimmer',
      taglineNe: 'हिमाली चिसो खोलामा पौडने माछा',
      adaptationEn: 'Streamlined torpedo body cuts water resistance. Red gills extract dissolved oxygen. Pectoral and caudal fins provide thrust and steering.',
      adaptationNe: 'पानी चिर्न डुङ्गा आकारको शरीर। पानीमा घुलेको अक्सिजन लिन फुल्का (Gills)। पौडिन र दिशा बदल्न पखेटा (Fins)।',
      keyFeatures: [
        { en: 'Gills (फुल्का) for breathing dissolved oxygen', ne: 'अक्सिजन लिन राता फुल्काहरू' },
        { en: 'Streamlined shape reduces drag', ne: 'पानी चिर्ने डुङ्गा आकारको शरीर' },
        { en: 'Lateral line senses water currents', ne: 'पानीको तरङ्ग थाहा पाउने रेखा' },
      ],
    },
    {
      id: 'deer',
      nameEn: 'Musk Deer (कस्तुरी मृग)',
      nameNe: 'कस्तुरी मृग (Musk Deer)',
      habitat: 'terrestrial',
      habitatNe: 'स्थलचर (Terrestrial)',
      taglineEn: 'Agile high-altitude forest herbivore',
      taglineNe: 'हिमाली भीरपाखामा उफ्रने स्तनधारी',
      adaptationEn: 'Thick hollow fur insulates against sub-zero mountain cold. Sturdy hooves grip steep rocky cliffs. Lungs breathe atmospheric air.',
      adaptationNe: 'न्यानो राख्न बाक्लो भुत्ला। भीरपाखा चढ्न खुर र हिँड्न बलिया खुट्टा। वायुमण्डलीय हावाबाट सास फेर्न फोक्सो।',
      keyFeatures: [
        { en: 'Lungs (फोक्सो) for atmospheric air', ne: 'खुला हावाबाट अक्सिजन लिन फोक्सो' },
        { en: 'Insulating fur against sub-zero freeze', ne: 'चिसोबाट जोगिने बाक्लो रौं' },
        { en: 'Sharp hooves for rocky mountain cliffs', ne: 'भीरमा नचिप्लिने दह्रा खुरहरू' },
      ],
    },
    {
      id: 'lotus',
      nameEn: 'Lotus Flower (कमलको फूल)',
      nameNe: 'कमलको फूल (Lotus)',
      habitat: 'aquatic',
      habitatNe: 'जलचर (Aquatic)',
      taglineEn: 'Aquatic beauty with floating leaves',
      taglineNe: 'पानीमा तैरिने पात र फूल',
      adaptationEn: 'Broad flat leaves with waxy cuticles float on water and repel droplets. Spongy hollow petioles store air for buoyancy and respiration.',
      adaptationNe: 'पातको माथिल्लो भागमा मैनजस्तो तह हुन्छ जसले पानी टाँसिन दिँदैन। डाँठमा हावाका कोठाहरू (Air spaces) हुन्छन् जसले पानीमा तैरिन मद्दत गर्छ।',
      keyFeatures: [
        { en: 'Waxy surface (Lotus effect) repels water', ne: 'पानी नटाँसिने मैनजस्तो तह' },
        { en: 'Air channels in stem keep plant afloat', ne: 'डाँठभित्र हावा भरिएका नलीहरू' },
        { en: 'Flexible stems sway with water currents', ne: 'छालसँगै लचकदार हुने डाँठ' },
      ],
    },
    {
      id: 'pine',
      nameEn: 'Himalayan Pine (सल्लाको रूख)',
      nameNe: 'सल्लाको रूख (Himalayan Pine)',
      habitat: 'terrestrial',
      habitatNe: 'स्थलचर (Terrestrial)',
      taglineEn: 'Deep-rooted evergreen mountain tree',
      taglineNe: 'सधैं हरियो रहने हिमाली रूख',
      adaptationEn: 'Slender needle-shaped leaves with thick cuticle minimize water loss from mountain winds. Deep taproots anchor firmly in steep hillside soil.',
      adaptationNe: 'सियोजस्ता पातहरूले पानीको वाष्पीकरण घटाउँछन्। गहिरो जराले भिरालो माटो समातेर रूखलाई ढल्न दिँदैन।',
      keyFeatures: [
        { en: 'Needle leaves prevent drought loss', ne: 'पानी उड्न नदिने सियोजस्ता पात' },
        { en: 'Deep taproot anchors against wind', ne: 'पहाडको भीरमा समात्ने गहिरो जरा' },
        { en: 'Woody cones protect seeds from snow', ne: 'हिउँबाट बीउ जोगाउने काठे कोण' },
      ],
    },
  ];

  const [activeOrgIdx, setActiveOrgIdx] = useState<number>(0);
  const [matchedMap, setMatchedMap] = useState<Record<string, boolean>>({});
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [showXRay, setShowXRay] = useState<boolean>(true);
  const [ripples, setRipples] = useState<{ x: number; y: number; r: number; alpha: number }[]>([]);

  const activeOrg = organisms[activeOrgIdx];

  // Water ripple interaction
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 880 / rect.width;
    const scaleY = 560 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // If clicked in water area (y > 330)
    if (clickY > 320) {
      setRipples((prev) => [...prev, { x: clickX, y: clickY, r: 5, alpha: 0.9 }]);
      ScienceAudio.playWaterDrop();
    }
  };

  const handleClassify = (choice: 'aquatic' | 'terrestrial') => {
    const isCorrect = activeOrg.habitat === choice;
    if (isCorrect) {
      ScienceAudio.playSuccess();
      const nextMap = { ...matchedMap, [activeOrg.id]: true };
      setMatchedMap(nextMap);
      setQuizFeedback(lang === 'en' ? `Correct! ${activeOrg.nameEn} is ${activeOrg.habitat === 'aquatic' ? 'Aquatic' : 'Terrestrial'}.` : `सबास! ${activeOrg.nameNe} ${choice === 'aquatic' ? 'जलचर' : 'स्थलचर'} जीव हो।`);
      const count = Object.keys(nextMap).length;
      setStars(Math.min(3, count));
      if (count >= organisms.length) {
        setIsCompleted(true);
        setStage('understand');
      } else {
        setTimeout(() => {
          setActiveOrgIdx((prev) => (prev + 1) % organisms.length);
          setQuizFeedback(null);
        }, 1200);
      }
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? `Try again! Notice where it lives and breathes.` : `फेरि प्रयास गर्नुहोस्! यो कहाँ बस्छ र कसरी सास फेर्छ ध्यान दिनुहोस्।`);
      setTimeout(() => setQuizFeedback(null), 1800);
    }
  };

  const handleReset = () => {
    setActiveOrgIdx(0);
    setMatchedMap({});
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    setQuizFeedback(null);
    ScienceAudio.playWhoosh();
  };

  // 60 FPS Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, 880, 560);

      // 1. SKY & DISTANT HIMALAYAS
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 260);
      skyGrad.addColorStop(0, '#0284c7'); // Rich sky blue
      skyGrad.addColorStop(0.5, '#7dd3fc');
      skyGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 880, 320);

      // Sun with gentle pulse
      const sunPulse = 1 + Math.sin(time * 0.8) * 0.05;
      ctx.save();
      const sunGrad = ctx.createRadialGradient(780, 70, 5, 780, 70, 60 * sunPulse);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 1)');
      sunGrad.addColorStop(0.4, 'rgba(253, 224, 71, 0.6)');
      sunGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(780, 70, 60 * sunPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(780, 70, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Fluffy clouds drifting
      const cloudOffset1 = (time * 12) % 1000 - 120;
      const cloudOffset2 = ((time * 8) + 400) % 1000 - 120;
      drawCloud(ctx, cloudOffset1, 45, 60);
      drawCloud(ctx, cloudOffset2, 85, 48);

      // Snow-capped Himalayan Peaks
      drawHimalayanPeaks(ctx);

      // 2. TERRESTRIAL HILLSIDE (Top Left to Mid Right)
      ctx.save();
      // Far Green Ridge
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(0, 220);
      ctx.bezierCurveTo(150, 180, 320, 230, 480, 200);
      ctx.bezierCurveTo(620, 175, 750, 215, 880, 195);
      ctx.lineTo(880, 350);
      ctx.lineTo(0, 350);
      ctx.closePath();
      ctx.fill();

      // Main Terrestrial Slope with lush grass gradient
      const hillGrad = ctx.createLinearGradient(0, 140, 480, 380);
      hillGrad.addColorStop(0, '#22c55e');
      hillGrad.addColorStop(0.5, '#16a34a');
      hillGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = hillGrad;
      ctx.beginPath();
      ctx.moveTo(0, 140);
      ctx.bezierCurveTo(160, 150, 280, 210, 380, 270);
      ctx.bezierCurveTo(440, 305, 490, 335, 520, 350);
      ctx.lineTo(0, 350);
      ctx.closePath();
      ctx.fill();

      // Earth / Soil Strata Edge along the lake bank
      const bankGrad = ctx.createLinearGradient(350, 280, 520, 400);
      bankGrad.addColorStop(0, '#78350f');
      bankGrad.addColorStop(0.5, '#5a2a0a');
      bankGrad.addColorStop(1, '#3b1d07');
      ctx.fillStyle = bankGrad;
      ctx.beginPath();
      ctx.moveTo(380, 270);
      ctx.bezierCurveTo(440, 305, 490, 335, 520, 350);
      ctx.lineTo(520, 440);
      ctx.bezierCurveTo(450, 400, 370, 350, 340, 320);
      ctx.closePath();
      ctx.fill();

      // River pebbles on the shore
      drawShorePebbles(ctx);
      ctx.restore();

      // 3. AQUATIC BIOME (Clear Alpine Lake / River)
      // Water body from x: 380 to 880, and y: 310 to 560
      ctx.save();
      const waterGrad = ctx.createLinearGradient(500, 300, 700, 560);
      waterGrad.addColorStop(0, '#38bdf8'); // Sparkling surface
      waterGrad.addColorStop(0.25, '#0ea5e9');
      waterGrad.addColorStop(0.65, '#0284c7');
      waterGrad.addColorStop(1, '#0369a1'); // Deep underwater
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.moveTo(380, 320);
      ctx.bezierCurveTo(460, 305, 620, 310, 880, 305);
      ctx.lineTo(880, 560);
      ctx.lineTo(440, 560);
      ctx.bezierCurveTo(390, 480, 360, 390, 380, 320);
      ctx.closePath();
      ctx.fill();

      // Sandy/Pebble lake floor
      const bedGrad = ctx.createLinearGradient(400, 510, 880, 560);
      bedGrad.addColorStop(0, '#92400e');
      bedGrad.addColorStop(0.4, '#b45309');
      bedGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = bedGrad;
      ctx.beginPath();
      ctx.moveTo(430, 530);
      ctx.bezierCurveTo(550, 515, 710, 525, 880, 510);
      ctx.lineTo(880, 560);
      ctx.lineTo(430, 560);
      ctx.closePath();
      ctx.fill();

      // Underwater light caustics
      drawUnderwaterCaustics(ctx, time);

      // Submerged aquatic plants (Hydrilla / Vallisneria ribbons waving)
      drawAquaticRibbons(ctx, time);

      // Animated rising oxygen bubbles
      drawBubbles(ctx, time);

      // Water surface waves & glistening line
      drawWaterSurface(ctx, time);

      // Render interactive user ripples
      drawRipples(ctx);
      ctx.restore();

      // 4. DRAW LIVING ORGANISMS IN THEIR NATURAL BIOMES

      // A) Himalayan Pine Tree (Terrestrial, x: 90, y: 110)
      drawPineTree(ctx, 90, 110, activeOrg.id === 'pine', time);

      // B) Himalayan Musk Deer (Terrestrial, x: 250, y: 220)
      drawMuskDeer(ctx, 250, 220, activeOrg.id === 'deer', time);

      // C) Lotus Flower with floating pads (Aquatic surface, x: 550, y: 320)
      drawLotusPlant(ctx, 550, 320, activeOrg.id === 'lotus', time);

      // D) Himalayan Snow Trout (Submerged aquatic, x: 680, y: 410)
      drawSnowTrout(ctx, 680, 410, activeOrg.id === 'fish', time);

      // E) Tiny Tree Frog on reed near the shoreline
      drawTreeFrog(ctx, 400, 275, time);

      // 5. SELECTION SPOTLIGHT / ADAPTATION CALLOUT HUD
      drawAdaptationCallout(ctx, activeOrg, showXRay, time, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeOrg, activeOrgIdx, showXRay, lang, ripples]);

  // Helper drawing functions
  function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.7, y - r * 0.2, r * 0.75, 0, Math.PI * 2);
    ctx.arc(x + r * 1.4, y, r * 0.65, 0, Math.PI * 2);
    ctx.arc(x + r * 0.7, y + r * 0.25, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHimalayanPeaks(ctx: CanvasRenderingContext2D) {
    // Majestic snow mountains
    ctx.save();
    // Peak 1
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(320, 190);
    ctx.lineTo(440, 60);
    ctx.lineTo(550, 195);
    ctx.closePath();
    ctx.fill();
    // Peak 1 Snow cap
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(440, 60);
    ctx.lineTo(485, 110);
    ctx.lineTo(460, 105);
    ctx.lineTo(445, 125);
    ctx.lineTo(430, 108);
    ctx.lineTo(405, 115);
    ctx.closePath();
    ctx.fill();

    // Peak 2 (Higher)
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(510, 195);
    ctx.lineTo(650, 40);
    ctx.lineTo(790, 200);
    ctx.closePath();
    ctx.fill();
    // Peak 2 Snow cap
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(650, 40);
    ctx.lineTo(705, 100);
    ctx.lineTo(680, 95);
    ctx.lineTo(660, 118);
    ctx.lineTo(640, 98);
    ctx.lineTo(610, 106);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawShorePebbles(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const pebbles = [
      { x: 390, y: 325, r: 6, c: '#a8a29e' },
      { x: 410, y: 335, r: 8, c: '#78716c' },
      { x: 425, y: 345, r: 5, c: '#d6d3d1' },
      { x: 405, y: 350, r: 7, c: '#57534e' },
      { x: 440, y: 365, r: 9, c: '#78716c' },
      { x: 460, y: 380, r: 6, c: '#a8a29e' },
      { x: 480, y: 400, r: 10, c: '#57534e' },
    ];
    pebbles.forEach((p) => {
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * 1.3, p.r, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawUnderwaterCaustics(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const offsetX = 480 + i * 90;
      ctx.beginPath();
      ctx.moveTo(offsetX + Math.sin(t + i) * 20, 330);
      ctx.bezierCurveTo(
        offsetX + 30 + Math.cos(t * 1.2 + i) * 25,
        390,
        offsetX - 20 + Math.sin(t * 0.9 + i) * 30,
        450,
        offsetX + 15 + Math.cos(t + i) * 20,
        510
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawAquaticRibbons(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    const plants = [
      { x: 490, h: 120, col: '#15803d' },
      { x: 520, h: 150, col: '#16a34a' },
      { x: 740, h: 140, col: '#15803d' },
      { x: 820, h: 170, col: '#22c55e' },
      { x: 850, h: 130, col: '#166534' },
    ];
    plants.forEach((p, idx) => {
      ctx.strokeStyle = p.col;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p.x, 520);
      const sway1 = Math.sin(t * 1.5 + idx * 0.8) * 16;
      const sway2 = Math.sin(t * 1.2 + idx * 1.1) * 25;
      ctx.bezierCurveTo(p.x + sway1, 520 - p.h * 0.4, p.x + sway2, 520 - p.h * 0.7, p.x + sway1 * 1.4, 520 - p.h);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawBubbles(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      const bx = 500 + ((i * 43 + 30) % 360);
      const by = 500 - (((t * 40 + i * 55) % 180));
      const br = 2.5 + (i % 4);
      ctx.beginPath();
      ctx.arc(bx + Math.sin(t * 2 + i) * 4, by, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWaterSurface(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(380, 320);
    for (let x = 380; x <= 880; x += 20) {
      const wave = Math.sin((x * 0.03) + t * 2) * 3;
      ctx.lineTo(x, 310 + wave);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawRipples(ctx: CanvasRenderingContext2D) {
    if (ripples.length === 0) return;
    ctx.save();
    setRipples((prev) =>
      prev
        .map((r) => ({ ...r, r: r.r + 1.2, alpha: r.alpha - 0.02 }))
        .filter((r) => r.alpha > 0)
    );
    ripples.forEach((rip) => {
      ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(rip.x, rip.y, rip.r * 1.6, rip.r * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  // 4A: PINE TREE
  function drawPineTree(ctx: CanvasRenderingContext2D, x: number, y: number, isSelected: boolean, t: number) {
    ctx.save();
    // Highlighting ring if selected
    if (isSelected) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(x, y + 60, 85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Thick bark trunk
    const trunkGrad = ctx.createLinearGradient(x - 12, y + 70, x + 12, y + 170);
    trunkGrad.addColorStop(0, '#78350f');
    trunkGrad.addColorStop(0.5, '#451a03');
    trunkGrad.addColorStop(1, '#291102');
    ctx.fillStyle = trunkGrad;
    ctx.beginPath();
    ctx.moveTo(x - 9, y + 60);
    ctx.lineTo(x + 9, y + 60);
    ctx.lineTo(x + 16, y + 155);
    ctx.lineTo(x - 16, y + 155);
    ctx.closePath();
    ctx.fill();

    // Visible roots in soil bank
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 150);
    ctx.quadraticCurveTo(x - 35, y + 175, x - 50, y + 205);
    ctx.moveTo(x + 12, y + 150);
    ctx.quadraticCurveTo(x + 35, y + 175, x + 55, y + 210);
    ctx.stroke();

    // Pine foliage tiers (Needle foliage tiers)
    const tiers = [
      { yOffset: -30, w: 55, h: 45, col: '#166534' },
      { yOffset: 10, w: 80, h: 55, col: '#15803d' },
      { yOffset: 50, w: 105, h: 65, col: '#16a34a' },
    ];
    tiers.forEach((tier) => {
      ctx.fillStyle = tier.col;
      ctx.beginPath();
      ctx.moveTo(x, y + tier.yOffset);
      ctx.lineTo(x + tier.w, y + tier.yOffset + tier.h);
      ctx.lineTo(x + tier.w * 0.7, y + tier.yOffset + tier.h - 5);
      ctx.lineTo(x + tier.w * 0.4, y + tier.yOffset + tier.h);
      ctx.lineTo(x, y + tier.yOffset + tier.h - 8);
      ctx.lineTo(x - tier.w * 0.4, y + tier.yOffset + tier.h);
      ctx.lineTo(x - tier.w * 0.7, y + tier.yOffset + tier.h - 5);
      ctx.lineTo(x - tier.w, y + tier.yOffset + tier.h);
      ctx.closePath();
      ctx.fill();
    });

    // Brown pine cones
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(x + 25, y + 75, 4, 8, 0.3, 0, Math.PI * 2);
    ctx.ellipse(x - 28, y + 80, 4, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Label tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(x - 48, y + 160, 96, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'en' ? 'Pine (सल्ला)' : 'सल्ला (Pine)', x, y + 175);
    ctx.restore();
  }

  // 4B: MUSK DEER
  function drawMuskDeer(ctx: CanvasRenderingContext2D, x: number, y: number, isSelected: boolean, t: number) {
    ctx.save();
    const breathe = Math.sin(t * 3) * 1.5;

    if (isSelected) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(x + 15, y + 15, 60, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Deer legs
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    // Back legs
    ctx.beginPath();
    ctx.moveTo(x - 18, y + 20);
    ctx.lineTo(x - 24, y + 55);
    ctx.lineTo(x - 22, y + 65);
    ctx.moveTo(x - 6, y + 20);
    ctx.lineTo(x - 10, y + 55);
    ctx.lineTo(x - 8, y + 65);
    // Front legs
    ctx.moveTo(x + 28, y + 20);
    ctx.lineTo(x + 30, y + 55);
    ctx.lineTo(x + 32, y + 65);
    ctx.moveTo(x + 40, y + 20);
    ctx.lineTo(x + 43, y + 55);
    ctx.lineTo(x + 45, y + 65);
    ctx.stroke();

    // Dark hooves
    ctx.fillStyle = '#1e293b';
    [
      { hx: x - 22, hy: y + 65 },
      { hx: x - 8, hy: y + 65 },
      { hx: x + 32, hy: y + 65 },
      { hx: x + 45, hy: y + 65 },
    ].forEach((h) => {
      ctx.beginPath();
      ctx.arc(h.hx, h.hy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Body (warm dark-brown fur with breathing expansion)
    const bodyGrad = ctx.createLinearGradient(x - 25, y - 5, x + 40, y + 25);
    bodyGrad.addColorStop(0, '#92400e');
    bodyGrad.addColorStop(0.5, '#78350f');
    bodyGrad.addColorStop(1, '#5a2a0a');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(x + 10, y + 14, 34, 19 + breathe * 0.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // White fur rosettes / spots (camouflaging spots)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(x - 4, y + 8, 2, 0, Math.PI * 2);
    ctx.arc(x + 5, y + 5, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 16, y + 9, 2, 0, Math.PI * 2);
    ctx.arc(x + 2, y + 17, 2, 0, Math.PI * 2);
    ctx.fill();

    // Neck and Head
    const earTwitch = Math.sin(t * 5) * 0.1;
    ctx.save();
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(x + 28, y + 8);
    ctx.lineTo(x + 42, y - 10);
    ctx.lineTo(x + 52, y - 6);
    ctx.lineTo(x + 38, y + 18);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(x + 48, y - 12, 11, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Snout / Nose
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(x + 58, y - 13, 3, 0, Math.PI * 2);
    ctx.fill();

    // Big alert black eye with catchlight
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + 46, y - 14, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 45.5, y - 14.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Large sensitive ears
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(x + 40, y - 24, 4, 10, -0.3 + earTwitch, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(x + 40, y - 24, 2, 7, -0.3 + earTwitch, 0, Math.PI * 2);
    ctx.fill();

    // Musk deer characteristic visible curved tusk/canine tooth
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 54, y - 10);
    ctx.lineTo(x + 52, y - 4);
    ctx.stroke();
    ctx.restore();

    // Label tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(x - 25, y + 75, 90, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'en' ? 'Musk Deer (मृग)' : 'कस्तुरी मृग (Deer)', x + 20, y + 90);
    ctx.restore();
  }

  // 4C: LOTUS PLANT (AQUATIC)
  function drawLotusPlant(ctx: CanvasRenderingContext2D, x: number, y: number, isSelected: boolean, t: number) {
    ctx.save();
    const bob = Math.sin(t * 1.8) * 2;

    if (isSelected) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(x, y + bob, 55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Underwater flexible stem reaching down to silt bed
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + 10 + bob);
    ctx.bezierCurveTo(x - 20, y + 80, x + 30, y + 140, x - 10, 520);
    ctx.stroke();

    // Underwater rhizome root anchoring in silt
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 25, 520);
    ctx.lineTo(x + 35, 522);
    ctx.stroke();

    // Floating broad waxy circular leaf (Water lily pad with cleft)
    ctx.save();
    ctx.translate(x + 25, y + 6 + bob);
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 14, 0, 0.2, Math.PI * 1.85);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Leaf veins radiating
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    for (let a = 0.4; a < Math.PI * 1.7; a += 0.3) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 32, Math.sin(a) * 12);
      ctx.stroke();
    }

    // Beaded water droplets on leaf (Lotus effect)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(10, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(-8, 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Beautiful Pink Lotus Bloom
    ctx.save();
    ctx.translate(x - 12, y - 10 + bob);

    // Outer Petals
    const petalGrad = ctx.createLinearGradient(0, 15, 0, -25);
    petalGrad.addColorStop(0, '#f43f5e');
    petalGrad.addColorStop(0.6, '#fb7185');
    petalGrad.addColorStop(1, '#ffe4e6');
    ctx.fillStyle = petalGrad;

    const petals = [-0.6, -0.3, 0, 0.3, 0.6];
    petals.forEach((ang) => {
      ctx.save();
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(0, -14, 7, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Golden seedpod center
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, -4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Label tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(x - 45, y + 40, 90, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'en' ? 'Lotus (कमल)' : 'कमल (Lotus)', x, y + 55);
    ctx.restore();
  }

  // 4D: SNOW TROUT (ASALA MACHHA)
  function drawSnowTrout(ctx: CanvasRenderingContext2D, x: number, y: number, isSelected: boolean, t: number) {
    ctx.save();
    // Undulating swimming motion
    const swim = Math.sin(t * 4);
    const swimTail = Math.sin(t * 4 - 0.8) * 8;
    const gillBeat = Math.abs(Math.sin(t * 3.5));

    if (isSelected) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(x, y, 65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Streamlined fish body with gradient
    ctx.save();
    ctx.translate(x, y + swim * 2);

    // Caudal (Tail) fin waving
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.moveTo(-45, 0);
    ctx.lineTo(-75 + swimTail, -18);
    ctx.lineTo(-65 + swimTail * 0.8, 0);
    ctx.lineTo(-75 + swimTail, 18);
    ctx.closePath();
    ctx.fill();

    // Dorsal fin
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(-5, -32);
    ctx.lineTo(15, -16);
    ctx.closePath();
    ctx.fill();

    // Torpedo Body
    const fishGrad = ctx.createLinearGradient(0, -22, 0, 22);
    fishGrad.addColorStop(0, '#064e3b'); // Dark olive back
    fishGrad.addColorStop(0.35, '#059669');
    fishGrad.addColorStop(0.7, '#10b981');
    fishGrad.addColorStop(1, '#ecfdf5'); // Pale white belly
    ctx.fillStyle = fishGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 48, 19, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lateral sensory line (gold/red stripe typical of Himalayan trout)
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-40, 2);
    ctx.quadraticCurveTo(0, 3, 30, -2);
    ctx.stroke();

    // Delicate dark freckles / spots
    ctx.fillStyle = '#064e3b';
    [-20, -10, 0, 10, 20].forEach((sx) => {
      ctx.beginPath();
      ctx.arc(sx, -7, 1.3, 0, Math.PI * 2);
      ctx.arc(sx - 5, -2, 1.1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Operculum (Gill cover) beating
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(22, 1, 10, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
    // Red gill flap visible when open
    if (gillBeat > 0.4) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(21, 2, 7, -0.6, 0.6);
      ctx.fill();
    }

    // Pectoral fin oscillating
    ctx.save();
    ctx.translate(14, 9);
    ctx.rotate(0.3 + Math.sin(t * 4) * 0.25);
    ctx.fillStyle = 'rgba(5, 150, 105, 0.85)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eye with shiny iris
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(36, -5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(37, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(36.5, -6, 1, 0, Math.PI * 2);
    ctx.fill();

    // Mouth nibbling
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(46, 2, 3, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    // Label tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(x - 50, y + 45, 100, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'en' ? 'Trout (माछा)' : 'असला माछा (Trout)', x, y + 60);
    ctx.restore();
  }

  // 4E: TREE FROG
  function drawTreeFrog(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
    ctx.save();
    const throatPulse = Math.sin(t * 4.5) * 2;
    // Green frog body
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(x, y, 9, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Head & throat
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(x + 7, y - 2, 5, 4 + throatPulse * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Big black eyes on top
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + 7, y - 6, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5: ADAPTATION CALLOUT HUD OVERLAY
  function drawAdaptationCallout(
    ctx: CanvasRenderingContext2D,
    org: Organism,
    xray: boolean,
    t: number,
    currentLang: Language
  ) {
    ctx.save();
    // Glassmorphism HUD Panel in bottom corner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = org.habitat === 'aquatic' ? '#38bdf8' : '#4ade80';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 12;

    const panelX = 24;
    const panelY = 380;
    const panelW = 340;
    const panelH = 160;

    ctx.roundRect(panelX, panelY, panelW, panelH, 12);
    ctx.fill();
    ctx.stroke();

    // Habitat badge
    const isAq = org.habitat === 'aquatic';
    ctx.fillStyle = isAq ? '#0284c7' : '#15803d';
    ctx.roundRect(panelX + 14, panelY + 12, 130, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(
      currentLang === 'en' ? (isAq ? '💧 AQUATIC (जलचर)' : '🏔️ TERRESTRIAL (स्थलचर)') : org.habitatNe,
      panelX + 79,
      panelY + 28
    );

    // Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(currentLang === 'en' ? org.nameEn : org.nameNe, panelX + 155, panelY + 28);

    // Adaptation details
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui';
    ctx.fillText(currentLang === 'en' ? 'Adaptations for survival:' : 'बाँच्नका लागि अनुकूलता:', panelX + 16, panelY + 54);

    org.keyFeatures.forEach((feat, idx) => {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(panelX + 22, panelY + 74 + idx * 24, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px system-ui';
      ctx.fillText(currentLang === 'en' ? feat.en : feat.ne, panelX + 34, panelY + 78 + idx * 24);
    });

    ctx.restore();
  }

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Aquatic & Terrestrial Biomes' : 'जलचर र स्थलचर जीवहरू'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 4: Classification of Living Beings'
          : 'कक्षा ४ विज्ञान • एकाइ ४: जीवहरूको वर्गीकरण'
      }
      currentStage={stage}
      onStageChange={setStage}
      language={lang}
      onLanguageChange={setLang}
      stars={stars}
      maxStars={3}
      isCompleted={isCompleted}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          height: '100%',
          overflow: 'hidden',
          background: '#ffffff',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN: INTERACTIVE 2D BIOME CANVIEWPORT
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

          {/* Top Quick Badges Floating Bar */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Droplets size={13} />
              {lang === 'en'
                ? `Classified: ${Object.keys(matchedMap).length} / ${organisms.length}`
                : `वर्गीकरण: ${Object.keys(matchedMap).length} / ${organisms.length}`}
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
              }}
            >
              {lang === 'en' ? 'Click water to create ripples • Tap animals to inspect' : 'पानीमा छुनुहोस् वा जीव छान्नुहोस्'}
            </span>
          </div>

          {/* Bottom Floating Interactive Dock */}
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
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: activeOrg.habitat === 'aquatic' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  border: activeOrg.habitat === 'aquatic' ? '1px solid #0ea5e9' : '1px solid #22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {activeOrg.habitat === 'aquatic' ? '🐟' : '🦌'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {lang === 'en' ? activeOrg.nameEn : activeOrg.nameNe}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: activeOrg.habitat === 'aquatic' ? 'rgba(14, 165, 233, 0.25)' : 'rgba(34, 197, 94, 0.25)',
                      color: activeOrg.habitat === 'aquatic' ? '#0284c7' : '#16a34a',
                      border: activeOrg.habitat === 'aquatic' ? '1px solid rgba(14, 165, 233, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
                    }}
                  >
                    {lang === 'en' ? activeOrg.habitat : activeOrg.habitatNe}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {lang === 'en' ? activeOrg.adaptationEn : activeOrg.adaptationNe}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleReset}
                title="Reset Biome Lab"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} />
                {lang === 'ne' ? 'रिसेट' : 'Reset'}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: BIOME LAB WORKSPACE & CLASSIFIER (380px)
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
          {/* Header Discovery Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(3, 105, 161, 0.05) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
                {lang === 'ne' ? 'प्राकृतिक बासस्थान अनुसन्धान केन्द्र' : 'Biome Discovery Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              {lang === 'ne'
                ? 'पानीमा बस्ने जीवहरूलाई जलचर र जमिनमा बस्ने जीवहरूलाई स्थलचर भनिन्छ। दुवैको शरीर आफ्नो परिवेश अनुसार बनेको हुन्छ।'
                : 'Aquatic animals have specialized gills and fins for life in water, while terrestrial animals possess lungs and limbs for land.'}
            </div>
          </div>

          {/* Habitat Classification Challenge Box */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '14px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#facc15', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mountain size={14} color="#facc15" />
              <span>{lang === 'en' ? 'Habitat Classification Challenge' : 'बासस्थान पहिचान चुनौती'}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#475569', margin: '4px 0 10px 0' }}>
              {lang === 'en'
                ? `Where does "${activeOrg.nameEn}" live and survive naturally?`
                : `"${activeOrg.nameNe}" स्वाभाविक रूपमा कहाँ बस्छ र बाँच्छ?`}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleClassify('aquatic')}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                }}
              >
                <Droplets size={14} />
                {lang === 'en' ? 'Aquatic (जलचर)' : 'जलचर (Aquatic)'}
              </button>

              <button
                onClick={() => handleClassify('terrestrial')}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                }}
              >
                <Mountain size={14} />
                {lang === 'en' ? 'Terrestrial (स्थलचर)' : 'स्थलचर (Terrestrial)'}
              </button>
            </div>

            {quizFeedback && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: quizFeedback.includes('✓') || quizFeedback.includes('Correct') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: quizFeedback.includes('✓') || quizFeedback.includes('Correct') ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: quizFeedback.includes('✓') || quizFeedback.includes('Correct') ? '#4ade80' : '#f87171',
                  textAlign: 'center',
                }}
              >
                {quizFeedback}
              </div>
            )}
          </div>

          {/* Progress Meter */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
              <span>{lang === 'en' ? 'Organisms Classified' : 'वर्गीकरण प्रगति'}</span>
              <strong style={{ color: '#38bdf8' }}>{Object.keys(matchedMap).length} / {organisms.length}</strong>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(Object.keys(matchedMap).length / organisms.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8, #22c55e)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Organism Selector Grid */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              {lang === 'en' ? 'SELECT ORGANISM TO INSPECT' : 'जीव छनौट गरी अध्ययन गर्नुहोस्'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
              {organisms.map((org, idx) => {
                const isSelected = activeOrgIdx === idx;
                const isMatched = matchedMap[org.id] !== undefined;
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      setActiveOrgIdx(idx);
                      ScienceAudio.playPop();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{lang === 'en' ? org.nameEn.split('(')[0] : org.nameNe.split('(')[0]}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        {lang === 'en' ? org.habitat : org.habitatNe}
                      </div>
                    </div>
                    {isMatched && <Check size={14} color="#4ade80" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curriculum Key Takeaway */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
              {lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रम मुख्य निष्कर्ष'}
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              {lang === 'en'
                ? 'Aquatic organisms use gills for oxygen and fins for propulsion in water. Terrestrial organisms use lungs for air and sturdy limbs for locomotion.'
                : 'जलचर प्राणीहरूमा पानीमा अक्सिजन लिन फुल्का र तैरिन पखेटा हुन्छन्। स्थलचर प्राणीहरूमा हावाबाट सास फेर्न फोक्सो र हिँड्न खुट्टा हुन्छन्।'}
            </p>
          </div>

          {/* Complete Lab & Quiz Button */}
          <button
            onClick={() => {
              ScienceAudio.playSuccess();
              setStars(3);
              setIsCompleted(true);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? '✓ Complete Biome Lab & Quiz' : '✓ बासस्थान प्रयोगशाला पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
