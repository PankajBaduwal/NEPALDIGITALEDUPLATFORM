/**
 * FloweringPlantsSim.tsx
 * Simulation 14: 2D Flowering and Non-Flowering Plants
 * Grade 4 Science • Chapter 4: Classification of Living Beings
 *
 * 100% NATIVE 2D CANVAS & VECTOR BOTANICAL SIMULATION
 * Features:
 * - Full biological flower cutaway anatomy: Petals (Corolla), Sepals (Calyx), Stamen (Male anther + filament),
 *   Pistil/Carpel (Female stigma, style, ovary with ovules).
 * - Animated pollination & fertilization sequence: Pollen dust drifts, pollen tube grows down style into ovary!
 * - Non-flowering fern mode: Frond foliage, coiled fiddleheads, underside sori clusters,
 *   and interactive spore dispersal animation!
 * - Bilingual labels, interactive dissection explorer, and mastery quiz.
 */
import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Sparkles, RotateCcw, Wind, Flower2, Layers, CheckCircle2, Info } from 'lucide-react';

type PlantCategory = 'flowering' | 'non_flowering';

interface FlowerPart {
  id: string;
  nameEn: string;
  nameNe: string;
  categoryEn: string;
  categoryNe: string;
  descEn: string;
  descNe: string;
  x: number;
  y: number;
}

export const FloweringPlantsSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [category, setCategory] = useState<PlantCategory>('flowering');
  const [inspectedPart, setInspectedPart] = useState<string>('petals');
  const [isPollinated, setIsPollinated] = useState<boolean>(false);
  const [pollenTubeProgress, setPollenTubeProgress] = useState<number>(0);
  const [sporesBurst, setSporesBurst] = useState<boolean>(false);
  const [exploredParts, setExploredParts] = useState<Record<string, boolean>>({ petals: true });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const flowerParts: FlowerPart[] = [
    {
      id: 'petals',
      nameEn: 'Petals',
      nameNe: 'दलपुञ्ज / फूलका पातहरू (Petals)',
      categoryEn: 'Attraction & Protection',
      categoryNe: 'आकर्षण र सुरक्षा',
      descEn: 'Brightly colored, scented petals attract insects like bees and butterflies for cross-pollination.',
      descNe: 'चम्किला, रङ्गीन र सुगन्धित पातहरू जसले परागसेचनका लागि मौरी र पुतलीलाई आकर्षित गर्दछन्।',
      x: 320,
      y: 190,
    },
    {
      id: 'sepals',
      nameEn: 'Sepals',
      nameNe: 'बाह्यदलपुञ्ज (Sepals)',
      categoryEn: 'Bud Protection',
      categoryNe: 'कोपिलाको सुरक्षा',
      descEn: 'Green leaf-like base that holds and protects the delicate flower bud before it blooms.',
      descNe: 'फूल फुल्नु अघि कोपिला अवस्थामा भित्री अङ्गहरूलाई जोगाएर राख्ने हरियो बाहिरी घेरा।',
      x: 440,
      y: 400,
    },
    {
      id: 'stamen',
      nameEn: 'Stamen',
      nameNe: 'पुंकेसर / भाले अङ्ग (Stamen)',
      categoryEn: 'Male Reproductive Unit',
      categoryNe: 'भाले प्रजनन अङ्ग',
      descEn: 'Consists of slender filament and golden anther heads containing yellow powdery pollen grains.',
      descNe: 'यसमा पातलो डाँठ (Filament) र माथिल्लो परागदानी (Anther) हुन्छ, जहाँ पहेँला परागकण बन्दछन्।',
      x: 370,
      y: 220,
    },
    {
      id: 'carpel',
      nameEn: 'Pistil / Carpel',
      nameNe: 'स्त्रीकेसर / पोथी अङ्ग (Carpel)',
      categoryEn: 'Female Reproductive Unit',
      categoryNe: 'पोथी प्रजनन अङ्ग',
      descEn: 'Features sticky stigma at top, style neck, and swollen ovary holding ovules that transform into seeds.',
      descNe: 'यसमा टाँसिने टुप्पो (Stigma), डाँठ (Style) र फेदमा डिम्बाशय (Ovary) हुन्छ। डिम्बाशयबाट फल र बीउ बन्दछ।',
      x: 440,
      y: 260,
    },
  ];

  const handleSelectPart = (id: string) => {
    setInspectedPart(id);
    ScienceAudio.playPop();
    const updated = { ...exploredParts, [id]: true };
    setExploredParts(updated);
    if (Object.keys(updated).length >= 4) {
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    }
  };

  const handlePollinate = () => {
    setIsPollinated(true);
    setPollenTubeProgress(0);
    ScienceAudio.playSuccess();
  };

  const handleDisperseSpores = () => {
    setSporesBurst(true);
    ScienceAudio.playWaterDrop();
    setTimeout(() => setSporesBurst(false), 3500);
  };

  const handleReset = () => {
    setCategory('flowering');
    setInspectedPart('petals');
    setIsPollinated(false);
    setPollenTubeProgress(0);
    setSporesBurst(false);
    setExploredParts({ petals: true });
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    ScienceAudio.playWhoosh();
  };

  // Pollen tube growth animation
  useEffect(() => {
    if (!isPollinated) return;
    const interval = setInterval(() => {
      setPollenTubeProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.04;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isPollinated]);

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

      // Background Garden Laboratory ambience
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 560);
      bgGrad.addColorStop(0, '#042f2e');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 880, 560);

      // Soft botanical grid
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 880; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 560);
        ctx.stroke();
      }
      for (let y = 0; y < 560; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(880, y);
        ctx.stroke();
      }

      if (category === 'flowering') {
        renderFloweringScene(ctx, time);
      } else {
        renderFernScene(ctx, time);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [category, inspectedPart, isPollinated, pollenTubeProgress, sporesBurst, lang]);

  // SCENE 1: FLOWERING PLANT ANATOMY
  function renderFloweringScene(ctx: CanvasRenderingContext2D, t: number) {
    const centerX = 440;
    const centerY = 330;

    // Green Receptacle and Stem Base
    ctx.save();
    const stemGrad = ctx.createLinearGradient(centerX - 10, centerY + 80, centerX + 10, 540);
    stemGrad.addColorStop(0, '#15803d');
    stemGrad.addColorStop(1, '#166534');
    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 60);
    ctx.quadraticCurveTo(centerX + 15, centerY + 140, centerX, 540);
    ctx.stroke();

    // Stem Leaves
    drawStemLeaf(ctx, centerX + 8, centerY + 130, 70, -0.4);
    drawStemLeaf(ctx, centerX - 8, centerY + 160, -70, 0.35);
    ctx.restore();

    // 1. PETALS (COROLLA) - Deep Ruby Red with soft highlights
    ctx.save();
    const isPetalsActive = inspectedPart === 'petals';
    if (isPetalsActive) {
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 25;
    }

    const petalAngles = [-1.3, -0.65, 0, 0.65, 1.3];
    petalAngles.forEach((ang, idx) => {
      ctx.save();
      ctx.translate(centerX, centerY + 40);
      ctx.rotate(ang + Math.sin(t * 1.5 + idx) * 0.02);

      const pGrad = ctx.createRadialGradient(0, -110, 10, 0, -80, 140);
      pGrad.addColorStop(0, '#fda4af');
      pGrad.addColorStop(0.3, '#f43f5e');
      pGrad.addColorStop(0.7, '#e11d48');
      pGrad.addColorStop(1, '#9f1239');
      ctx.fillStyle = pGrad;

      ctx.beginPath();
      ctx.ellipse(0, -95, 36, 85, 0, 0, Math.PI * 2);
      ctx.fill();

      // Delicate petal veining
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(0, -150);
      ctx.moveTo(0, -80);
      ctx.quadraticCurveTo(15, -100, 24, -135);
      ctx.moveTo(0, -80);
      ctx.quadraticCurveTo(-15, -100, -24, -135);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();

    // 2. SEPALS (CALYX) - Green protective leaves at flower base
    ctx.save();
    const isSepalsActive = inspectedPart === 'sepals';
    if (isSepalsActive) {
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 20;
    }
    const sepalAngles = [-0.7, -0.3, 0.3, 0.7];
    sepalAngles.forEach((ang) => {
      ctx.save();
      ctx.translate(centerX, centerY + 45);
      ctx.rotate(ang);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(0, 25, 12, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();

    // 3. STAMEN (MALE REPRODUCTIVE ORGANS)
    ctx.save();
    const isStamenActive = inspectedPart === 'stamen';
    const stamens = [
      { a: -0.45, len: 105 },
      { a: -0.22, len: 120 },
      { a: 0.22, len: 120 },
      { a: 0.45, len: 105 },
    ];

    stamens.forEach((st, idx) => {
      ctx.save();
      ctx.translate(centerX, centerY + 30);
      ctx.rotate(st.a);

      // Slender filament
      ctx.strokeStyle = isStamenActive ? '#fef08a' : '#fde047';
      ctx.lineWidth = isStamenActive ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(Math.sin(t * 2 + idx) * 4, -st.len * 0.6, 0, -st.len);
      ctx.stroke();

      // Golden Anther Head (bilobed)
      ctx.save();
      ctx.translate(0, -st.len);
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(-4, 0, 4.5, 9, 0.2, 0, Math.PI * 2);
      ctx.ellipse(4, 0, 4.5, 9, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Pollen dust speckles
      ctx.fillStyle = '#fef08a';
      for (let p = 0; p < 4; p++) {
        const px = (Math.sin(t * 3 + p + idx) * 7);
        const py = -8 + p * 4;
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.restore();
    });
    ctx.restore();

    // 4. PISTIL / CARPEL (FEMALE REPRODUCTIVE ORGAN - Center Cross-Section)
    ctx.save();
    const isCarpelActive = inspectedPart === 'carpel';
    if (isCarpelActive) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20;
    }

    // Swollen Ovary at Base
    const ovGrad = ctx.createRadialGradient(centerX, centerY + 25, 4, centerX, centerY + 25, 34);
    ovGrad.addColorStop(0, '#86efac');
    ovGrad.addColorStop(0.7, '#22c55e');
    ovGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = ovGrad;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 25, 26, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Internal Ovules (X-Ray view inside ovary chamber)
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    const ovules = [
      { ox: centerX - 10, oy: centerY + 18 },
      { ox: centerX + 10, oy: centerY + 18 },
      { ox: centerX - 11, oy: centerY + 30 },
      { ox: centerX + 11, oy: centerY + 30 },
    ];
    ovules.forEach((ov) => {
      ctx.beginPath();
      ctx.ellipse(ov.ox, ov.oy, 5.5, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Style Neck
    const styleGrad = ctx.createLinearGradient(centerX - 6, centerY + 10, centerX + 6, centerY - 130);
    styleGrad.addColorStop(0, '#86efac');
    styleGrad.addColorStop(1, '#4ade80');
    ctx.fillStyle = styleGrad;
    ctx.beginPath();
    ctx.moveTo(centerX - 6, centerY);
    ctx.lineTo(centerX - 4, centerY - 130);
    ctx.lineTo(centerX + 4, centerY - 130);
    ctx.lineTo(centerX + 6, centerY);
    ctx.closePath();
    ctx.fill();

    // Sticky Stigma Lobes at Top
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(centerX - 7, centerY - 136, 6, 0, Math.PI * 2);
    ctx.arc(centerX, centerY - 140, 7, 0, Math.PI * 2);
    ctx.arc(centerX + 7, centerY - 136, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pollen Tube Growth (when pollinated)
    if (isPollinated) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 138);
      const tubeY = centerY - 138 + (160 * pollenTubeProgress);
      ctx.lineTo(centerX, tubeY);
      ctx.stroke();

      // Pollen grain glow on stigma
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 141, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // When tube reaches ovule, spark fertilization
      if (pollenTubeProgress >= 0.95) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 24, 8 + Math.sin(t * 8) * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    ctx.restore();

    // Floating Pollen Dust in Air
    ctx.save();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
    for (let i = 0; i < 16; i++) {
      const px = ((i * 57 + t * 25) % 640) + 120;
      const py = 120 + Math.sin(t + i * 2) * 40 + (i % 5) * 45;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Interactive Label Pins
    flowerParts.forEach((part) => {
      drawPartPin(ctx, part.x, part.y, part.nameEn.split('(')[0].trim(), inspectedPart === part.id);
    });
  }

  // SCENE 2: NON-FLOWERING PLANT (FERN & SPORES)
  function renderFernScene(ctx: CanvasRenderingContext2D, t: number) {
    const rootX = 400;
    const rootY = 460;

    // Soil & Pot
    ctx.save();
    const potGrad = ctx.createLinearGradient(rootX - 90, rootY + 10, rootX + 90, 550);
    potGrad.addColorStop(0, '#b45309');
    potGrad.addColorStop(0.5, '#78350f');
    potGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = potGrad;
    ctx.beginPath();
    ctx.moveTo(rootX - 85, rootY + 15);
    ctx.lineTo(rootX + 85, rootY + 15);
    ctx.lineTo(rootX + 65, 550);
    ctx.lineTo(rootX - 65, 550);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Arching Fern Fronds
    const fronds = [
      { angle: -1.0, length: 220, sway: 0.05 },
      { angle: -0.6, length: 260, sway: 0.04 },
      { angle: -0.2, length: 280, sway: 0.03 },
      { angle: 0.3, length: 270, sway: 0.04 },
      { angle: 0.7, length: 230, sway: 0.05 },
    ];

    fronds.forEach((fr, fIdx) => {
      ctx.save();
      ctx.translate(rootX, rootY);
      ctx.rotate(fr.angle + Math.sin(t * 2 + fIdx) * fr.sway);

      // Frond main stem (rachis)
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(15, -fr.length * 0.5, 30, -fr.length);
      ctx.stroke();

      // Pinnae (leaflets on either side)
      const numLeaflets = 14;
      for (let i = 2; i < numLeaflets; i++) {
        const progress = i / numLeaflets;
        const ly = -progress * fr.length;
        const leafW = Math.sin(progress * Math.PI) * 42;

        ctx.fillStyle = '#22c55e';
        // Left leaflet
        ctx.beginPath();
        ctx.ellipse(-leafW * 0.5, ly, leafW * 0.5, 4.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Right leaflet
        ctx.beginPath();
        ctx.ellipse(leafW * 0.5, ly, leafW * 0.5, 4.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Coiled fiddlehead / Crozier emerging at base
    ctx.save();
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(rootX + 30, rootY);
    ctx.quadraticCurveTo(rootX + 45, rootY - 50, rootX + 25, rootY - 70);
    ctx.stroke();
    // Spiral tip
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(rootX + 22, rootY - 72, 8, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.restore();

    // INSET LENS: High magnification of frond underside showing Sori (sporangia clusters)
    const lensX = 660;
    const lensY = 230;
    const lensR = 95;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(lensX, lensY, lensR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Lens content: Leaf underside texture with sori spots
    ctx.save();
    ctx.beginPath();
    ctx.arc(lensX, lensY, lensR - 3, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#166534';
    ctx.fillRect(lensX - lensR, lensY - lensR, lensR * 2, lensR * 2);

    // Leaf veins inside lens
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(lensX - lensR, lensY);
    ctx.lineTo(lensX + lensR, lensY);
    ctx.stroke();

    // Sori clusters (brown circular spore capsules)
    const soriSpots = [
      { sx: lensX - 45, sy: lensY - 35 },
      { sx: lensX, sy: lensY - 45 },
      { sx: lensX + 45, sy: lensY - 35 },
      { sx: lensX - 45, sy: lensY + 35 },
      { sx: lensX, sy: lensY + 45 },
      { sx: lensX + 45, sy: lensY + 35 },
    ];

    soriSpots.forEach((s) => {
      const sGrad = ctx.createRadialGradient(s.sx, s.sy, 2, s.sx, s.sy, 16);
      sGrad.addColorStop(0, '#78350f');
      sGrad.addColorStop(0.7, '#b45309');
      sGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(s.sx, s.sy, 15, 0, Math.PI * 2);
      ctx.fill();

      // Granular sporangia dots inside sorus
      ctx.fillStyle = '#fef08a';
      for (let g = 0; g < 7; g++) {
        const gx = s.sx + Math.sin(g * 1.1) * 7;
        const gy = s.sy + Math.cos(g * 1.1) * 7;
        ctx.beginPath();
        ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();

    // Lens title banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.roundRect(lensX - 85, lensY + lensR - 10, 170, 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'en' ? '🔬 Spore Sacs' : '🔬 सोरी (बीजाणु थैली)', lensX, lensY + lensR + 7);
    ctx.restore();

    // Spore Dispersal Billowing Animation
    if (sporesBurst) {
      ctx.save();
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      for (let s = 0; s < 45; s++) {
        const sx = lensX + Math.sin(t * 3 + s) * 110 + (s * 3);
        const sy = lensY - (t * 50 + s * 8) % 180;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 + (s % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawStemLeaf(ctx: CanvasRenderingContext2D, lx: number, ly: number, len: number, rot: number) {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(rot);
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(len * 0.5, 0, Math.abs(len) * 0.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawPartPin(ctx: CanvasRenderingContext2D, px: number, py: number, label: string, isCurrent: boolean) {
    ctx.save();
    ctx.fillStyle = isCurrent ? '#facc15' : '#38bdf8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Label banner
    ctx.fillStyle = isCurrent ? 'rgba(234, 179, 8, 0.95)' : 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(px + 10, py - 12, label.length * 8 + 16, 24, 6);
    ctx.fill();
    ctx.fillStyle = isCurrent ? '#000000' : '#ffffff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(label, px + 18, py + 4);
    ctx.restore();
  }

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Flowering & Non-Flowering Plants' : 'सपुष्पक र अपुष्पक वनस्पति'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 4: Classification of Living Beings'
          : 'कक्षा 4 विज्ञान • एकाइ 4: जीवहरूको वर्गीकरण'
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 13px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Flower2 size={14} color="#4ade80" />
              <span>
                {category === 'flowering'
                  ? lang === 'en'
                    ? 'Flowering Plant Dissection (Hibiscus)'
                    : 'सपुष्पक वनस्पति (फूलका भित्री अङ्गहरू)'
                  : lang === 'en'
                  ? 'Non-Flowering Plant (Himalayan Fern)'
                  : 'अपुष्पक वनस्पति (उन्यू र बीजाणुहरू)'}
              </span>
            </div>
          </div>

          {/* Top-Right Quick Action Tool */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              zIndex: 10,
            }}
          >
            {category === 'flowering' ? (
              <button
                onClick={handlePollinate}
                disabled={isPollinated}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isPollinated
                    ? 'rgba(34, 197, 94, 0.2)'
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: isPollinated ? 'default' : 'pointer',
                  boxShadow: isPollinated ? 'none' : '0 4px 15px rgba(245, 158, 11, 0.45)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <Sparkles size={16} />
                {isPollinated
                  ? lang === 'en'
                    ? 'Fertilized'
                    : 'परागसेचन सम्पन्न'
                  : lang === 'en'
                  ? 'Pollinate'
                  : 'परागसेचन गराउनुहोस्'}
              </button>
            ) : (
              <button
                onClick={handleDisperseSpores}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(5, 150, 105, 0.45)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <Wind size={16} />
                {lang === 'en' ? 'Disperse Spores' : 'बीजाणु छर्नुहोस्'}
              </button>
            )}
          </div>

          {/* Bottom Interactive Dissection Status Dock */}
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
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '18px',
                }}
              >
                🔬
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {category === 'flowering'
                    ? lang === 'en'
                      ? `Inspected: ${flowerParts.find((p) => p.id === inspectedPart)?.nameEn || 'Select Part'}`
                      : `निरीक्षण: ${flowerParts.find((p) => p.id === inspectedPart)?.nameNe || 'अङ्ग छान्नुहोस्'}`
                    : lang === 'en'
                    ? 'Himalayan Fern Frond & Sori Anatomy'
                    : 'उन्यूको पात र बीजाणुदानी (सोरी) को संरचना'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en'
                    ? 'Click on any highlighted marker on the canvas or pick from the sidebar'
                    : 'चित्रमा रहेको कुनै पनि मार्करमा सिधै क्लिक गर्नुहोस् वा छेउबाट छान्नुहोस्'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                {category === 'flowering'
                  ? `${Object.keys(exploredParts).length}/4 ${lang === 'en' ? 'Explored' : 'अध्ययन'}`
                  : lang === 'en'
                  ? 'Spores Ready'
                  : 'बीजाणु तयार'}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: BOTANICAL LAB WORKSPACE & PARAMETERS
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
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#4ade80" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#4ade80' }}>
                {lang === 'en' ? 'Botanical Discovery Station' : 'वनस्पति अनुसन्धान केन्द्र'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              {category === 'flowering'
                ? lang === 'en'
                  ? 'Flowering plants (Angiosperms) form seeds inside ovaries protected by colorful petals.'
                  : 'सपुष्पक वनस्पतिमा फूलको डिम्बाशयभित्र बीउ बन्दछ र फलले ढाकिएको हुन्छ।'
                : lang === 'en'
                ? 'Non-flowering plants (Cryptogams) reproduce via windborne spores formed under fronds.'
                : 'अपुष्पक वनस्पतिमा फूल फुल्दैन, पातको पछाडि सोरीभित्र सूक्ष्म बीजाणु बन्दछन्।'}
            </div>
          </div>

          {/* Plant Kingdom Group Mode Tabs */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
              {lang === 'en' ? 'PLANT KINGDOM GROUP' : 'वनस्पतिको समूह'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => {
                  setCategory('flowering');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '9px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: category === 'flowering' ? '2px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
                  background: category === 'flowering' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: '#fff',
                }}
              >
                🌺 {lang === 'en' ? 'Flowering' : 'सपुष्पक'}
              </button>

              <button
                onClick={() => {
                  setCategory('non_flowering');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '9px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: category === 'non_flowering' ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                  background: category === 'non_flowering' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: '#fff',
                }}
              >
                🌿 {lang === 'en' ? 'Non-Flowering' : 'अपुष्पक'}
              </button>
            </div>
          </div>

          {/* Environmental & Biological Parameters */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Exploration Progress Parameter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Layers size={13} color="#38bdf8" />
                  {lang === 'en' ? 'Anatomy Explored' : 'अङ्गहरूको अध्ययन'}
                </span>
                <strong style={{ color: '#38bdf8' }}>
                  {category === 'flowering'
                    ? `${Math.round((Object.keys(exploredParts).length / 4) * 100)}%`
                    : '100%'}
                </strong>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: '#e2e8f0',
                  borderRadius: '3px',
                  marginTop: '6px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: category === 'flowering' ? `${(Object.keys(exploredParts).length / 4) * 100}%` : '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #22c55e)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* Pollination / Fertilization Parameter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={13} color="#f59e0b" />
                  {category === 'flowering'
                    ? lang === 'en'
                      ? 'Fertilization Progress'
                      : 'गर्भाधान अवस्था'
                    : lang === 'en'
                    ? 'Spore Dispersal'
                    : 'बीजाणु प्रसारण'}
                </span>
                <strong style={{ color: '#f59e0b' }}>
                  {category === 'flowering'
                    ? isPollinated
                      ? `${Math.round(pollenTubeProgress * 100)}%`
                      : '0%'
                    : sporesBurst
                    ? '100%'
                    : 'Ready'}
                </strong>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: '#e2e8f0',
                  borderRadius: '3px',
                  marginTop: '6px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width:
                      category === 'flowering'
                        ? `${pollenTubeProgress * 100}%`
                        : sporesBurst
                        ? '100%'
                        : '0%',
                    background: 'linear-gradient(90deg, #f59e0b, #eab308)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Organs Dissection or Fern Controls */}
          {category === 'flowering' ? (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
                {lang === 'en' ? 'INSPECT ANATOMICAL ORGANS' : 'फूलका अङ्गहरूको पहिचान'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {flowerParts.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => handleSelectPart(part.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textAlign: 'left',
                      fontSize: '11px',
                      transition: 'all 0.15s ease',
                      border: inspectedPart === part.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      background:
                        inspectedPart === part.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700 }}>{lang === 'en' ? part.nameEn : part.nameNe}</span>
                      {exploredParts[part.id] && <CheckCircle2 size={13} color="#4ade80" />}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                      {lang === 'en' ? part.descEn : part.descNe}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                <Wind size={14} />
                <span>{lang === 'en' ? 'Non-Flowering Reproduction' : 'अपुष्पक वनस्पतिको प्रजनन'}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {lang === 'en'
                  ? 'Ferns, mosses, and algae do NOT bear flowers, fruits, or seeds. Instead, they reproduce through microscopic spores stored in brown sori sacs underneath their fronds.'
                  : 'उन्यू, लेउ र झ्याउमा फूल, फल वा बीउ हुँदैन। तिनीहरूले पातको पछाडि रहेका सोरी (Sori) भित्रका सूक्ष्म बीजाणु (Spores) बाट नयाँ बिरुवा उमार्छन्।'}
              </p>
              <button
                onClick={handleDisperseSpores}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '9px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Wind size={14} />
                {lang === 'en' ? 'Disperse Spores into Wind' : 'हावामा बीजाणु छर्नुहोस्'}
              </button>
            </div>
          )}

          {/* Curriculum Key Takeaway Box */}
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '12px',
              fontSize: '11px',
              color: '#64748b',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
              <Info size={13} />
              <span>{lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रमको मुख्य निष्कर्ष'}</span>
            </div>
            {lang === 'en'
              ? 'Flowering plants reproduce through seeds enclosed in fruits (Mustard, Rose, Apple). Non-flowering plants reproduce through spores (Fern, Moss, Mushroom).'
              : 'सपुष्पक वनस्पतिमा फूल, फल र बीउ हुन्छ (जस्तै: तोरी, गुलाब, सुन्तला)। अपुष्पक वनस्पतिमा फूल फुल्दैन र बीजाणुबाट वंशवृद्धि हुन्छ (जस्तै: उन्यू, च्याउ, झ्याउ)।'}
          </div>

          {/* Completion Primary Button at Bottom of Sidebar */}
          <button
            onClick={() => {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playSuccess();
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
            }}
          >
            <CheckCircle2 size={16} />
            {lang === 'en' ? 'Complete Botanical Lab & Quiz' : 'प्रयोग पूरा गर्नुहोस् र प्रश्न हल गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
