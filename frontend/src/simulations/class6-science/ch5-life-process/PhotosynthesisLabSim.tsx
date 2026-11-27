/**
 * PhotosynthesisLabSim.tsx
 * Simulation 12: Photosynthesis Laboratory & Cellular Starch Studio
 * Grade 6 Science • Unit 5: Life Process
 *
 * 100% Native HTML5 Canvas 2D Interactive Botanical Laboratory.
 * Features:
 * 1. Biochemical Formula:
 *    6CO₂ + 6H₂O + Sunlight (Chlorophyll) ➔ C₆H₁₂O₆ (Glucose) + 6O₂ (Oxygen)
 * 2. Interactive Modes:
 *    - Mode A: Leaf Anatomical Cross-Section & Stomata (Cuticle, Palisade Cells, Chloroplasts, Guard Cells)
 *    - Mode B: Hydrilla Inverted Funnel Oxygen Bubbler (Sunlight intensity, bubbling rate, glowing splinter test)
 *    - Mode C: Starch Iodine Test (Half-covered leaf de-starched -> Blue-Black colorimetric reaction)
 * 3. Dynamic Modulators:
 *    - Sunlight Intensity (0% - 100%), CO₂ concentration (Low, Normal, High), Temperature (5°C - 45°C)
 * 4. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Sun,
  Wind,
  Droplets,
  Thermometer,
  Sparkles,
  Beaker,
  Flame,
  CheckCircle2,
  Layers,
  Award,
  RotateCcw,
  Check,
} from 'lucide-react';

export type LabTab = 'leaf_anatomy' | 'hydrilla_apparatus' | 'iodine_test';

interface Bubble {
  x: number;
  y: number;
  vy: number;
  radius: number;
  alpha: number;
}

interface Photon {
  x: number;
  y: number;
  vy: number;
  length: number;
}

export const PhotosynthesisLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Active View Tabs: 'leaf_anatomy' | 'hydrilla_apparatus' | 'iodine_test'
  const [activeTab, setActiveTab] = useState<'leaf_anatomy' | 'hydrilla_apparatus' | 'iodine_test'>('hydrilla_apparatus');

  // Modulator Controls
  const [sunlight, setSunlight] = useState<number>(85); // 0 - 100%
  const [co2Level, setCo2Level] = useState<'low' | 'normal' | 'high'>('normal');
  const [temperature, setTemperature] = useState<number>(28); // 5 - 45°C

  // Experiments
  const [splinterTested, setSplinterTested] = useState<boolean>(false);
  const [splinterFlaring, setSplinterFlaring] = useState<boolean>(false);
  const [iodineTested, setIodineTested] = useState<boolean>(false);
  const [gasCollectedMl, setGasCollectedMl] = useState<number>(12);

  // Challenge Quiz
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);

  // Computed Photosynthetic Reaction Rates
  const co2Factor = co2Level === 'high' ? 1.4 : co2Level === 'normal' ? 1.0 : 0.3;
  const tempFactor =
    temperature >= 20 && temperature <= 35
      ? 1.0
      : Math.max(0.1, 1.0 - Math.abs(temperature - 28) * 0.05);
  const bubbleFrequency = Math.round((sunlight / 100) * 50 * co2Factor * tempFactor); // bubbles / min
  const glucoseMgPerHr = Math.round(bubbleFrequency * 1.6);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const photonsRef = useRef<Photon[]>([]);

  // Reset Simulation
  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setSunlight(85);
    setCo2Level('normal');
    setTemperature(28);
    setSplinterTested(false);
    setSplinterFlaring(false);
    setIodineTested(false);
    setGasCollectedMl(12);
    bubblesRef.current = [];
    photonsRef.current = [];
    setQuizAnswered(false);
    setStars(0);
    setIsCompleted(false);
  };

  // Perform glowing splinter test
  const handleSplinterTest = () => {
    if (gasCollectedMl < 5) {
      ScienceAudio.playBuzzer();
      return;
    }
    ScienceAudio.playDing();
    setSplinterTested(true);
    setSplinterFlaring(true);
    setTimeout(() => {
      setSplinterFlaring(false);
    }, 2500);

    if (stage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  // Perform Iodine Test
  const handleIodineTest = () => {
    ScienceAudio.playDing();
    setIodineTested(true);
  };

  // 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark Laboratory Backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0a1322');
      bgGrad.addColorStop(0.6, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Floor / Lab Countertop
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 420, width, height - 420);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 420);
      ctx.lineTo(width, 420);
      ctx.stroke();

      // ==========================================
      // VIEW 1: HYDRILLA INVERTED FUNNEL APPARATUS
      // ==========================================
      if (activeTab === 'hydrilla_apparatus') {
        const beakerX = 440;
        const beakerY = 160;
        const beakerW = 260;
        const beakerH = 260;

        // Lamp Light Source (Left Side)
        const lampX = 140;
        const lampY = 180;
        const lampOn = sunlight > 0;

        // Lamp Stand & Hood
        ctx.fillStyle = '#475569';
        ctx.fillRect(lampX - 10, lampY, 20, 240); // Stand
        ctx.fillStyle = '#334155';
        ctx.fillRect(lampX - 40, 410, 80, 12); // Base

        // Lamp Head Dome
        ctx.save();
        ctx.translate(lampX, lampY);
        ctx.rotate(0.35); // Aim towards beaker
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(0, 0, 36, Math.PI / 2, (Math.PI * 3) / 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (lampOn) {
          // Glowing Bulb
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(6, 0, 16, 0, Math.PI * 2);
          ctx.fill();

          // Light Cone Beam
          const beamGrad = ctx.createRadialGradient(10, 0, 10, 280, 80, 360);
          beamGrad.addColorStop(0, `rgba(253, 224, 71, ${0.45 * (sunlight / 100)})`);
          beamGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(10, -28);
          ctx.lineTo(340, -100);
          ctx.lineTo(340, 200);
          ctx.lineTo(10, 28);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Beaker Glass Body
        ctx.save();
        ctx.translate(beakerX, beakerY);

        // Water in Beaker
        const waterGrad = ctx.createLinearGradient(0, 40, 0, beakerH);
        waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        waterGrad.addColorStop(1, 'rgba(2, 132, 199, 0.65)');
        ctx.fillStyle = waterGrad;
        ctx.beginPath();
        ctx.roundRect(-beakerW / 2 + 6, 40, beakerW - 12, beakerH - 42, 12);
        ctx.fill();

        // Glass Outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-beakerW / 2, 20);
        ctx.lineTo(-beakerW / 2, beakerH - 8);
        ctx.arcTo(-beakerW / 2, beakerH, -beakerW / 2 + 16, beakerH, 16);
        ctx.lineTo(beakerW / 2 - 16, beakerH);
        ctx.arcTo(beakerW / 2, beakerH, beakerW / 2, beakerH - 8, 16);
        ctx.lineTo(beakerW / 2, 20);
        ctx.stroke();

        // Inverted Glass Funnel
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-beakerW / 2 + 30, beakerH - 15);
        ctx.lineTo(beakerW / 2 - 30, beakerH - 15);
        ctx.lineTo(12, 110);
        ctx.lineTo(12, 35);
        ctx.lineTo(-12, 35);
        ctx.lineTo(-12, 110);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inverted Test Tube Over Funnel Stem
        const tubeW = 28;
        const tubeH = 140;
        const tubeTopY = -40;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, tubeTopY + tubeW / 2, tubeW / 2, Math.PI, 0); // Rounded top of test tube
        ctx.lineTo(tubeW / 2, 85);
        ctx.lineTo(-tubeW / 2, 85);
        ctx.closePath();
        ctx.stroke();

        // Gas pocket collected at top of test tube (Displaced water)
        const gasHeight = Math.min(65, 10 + gasCollectedMl * 2.5);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.5)'; // Oxygen gas pocket
        ctx.beginPath();
        ctx.arc(0, tubeTopY + tubeW / 2, tubeW / 2 - 2, Math.PI, 0);
        ctx.lineTo(tubeW / 2 - 2, tubeTopY + tubeW / 2 + gasHeight);
        ctx.lineTo(-tubeW / 2 + 2, tubeTopY + tubeW / 2 + gasHeight);
        ctx.closePath();
        ctx.fill();

        // Water meniscus in test tube below gas
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.fillRect(-tubeW / 2 + 2, tubeTopY + tubeW / 2 + gasHeight, tubeW - 4, tubeH - gasHeight);

        // Hydrilla Aquatic Plant Sprigs inside Funnel
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let p = -3; p <= 3; p++) {
          const px = p * 18;
          ctx.beginPath();
          ctx.moveTo(px, beakerH - 20);
          ctx.quadraticCurveTo(px + Math.sin(Date.now() / 600 + p) * 6, beakerH - 60, px * 0.4, 130);
          ctx.stroke();

          // Whorled leaves
          ctx.fillStyle = '#22c55e';
          for (let l = 0; l < 4; l++) {
            const ly = beakerH - 30 - l * 20;
            ctx.beginPath();
            ctx.ellipse(px + 6, ly, 7, 3, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(px - 6, ly, 7, 3, -0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Generate Rising O2 Bubbles from Hydrilla Cut Stem up into Test Tube
        if (bubbleFrequency > 0 && Math.random() < bubbleFrequency / 100) {
          bubblesRef.current.push({
            x: (Math.random() - 0.5) * 10,
            y: 110,
            vy: -1.8 - Math.random() * 1.5,
            radius: 2 + Math.random() * 3,
            alpha: 0.9,
          });
          setGasCollectedMl((prev) => Math.min(22, prev + 0.05));
        }

        // Draw and update bubbles
        for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
          const b = bubblesRef.current[i];
          b.y += b.vy;
          b.x += Math.sin(Date.now() / 150 + i) * 0.3;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Bubble pops into test tube gas chamber
          if (b.y <= tubeTopY + tubeW / 2 + gasHeight) {
            bubblesRef.current.splice(i, 1);
          }
        }

        // Glowing Splinter Flame Test Animation
        if (splinterFlaring) {
          ctx.save();
          ctx.translate(0, tubeTopY - 20);
          // Splinter Wood Stick
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-2, -60, 4, 60);

          // Oxygen flare burst!
          const flareR = 26 + Math.sin(Date.now() / 50) * 8;
          const flameGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, flareR);
          flameGrad.addColorStop(0, '#ffffff');
          flameGrad.addColorStop(0.3, '#fde047');
          flameGrad.addColorStop(0.7, '#f97316');
          flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.arc(0, 0, flareR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔥 OXYGEN CONFIRMED! (FLAME RELIT)', 0, -35);
          ctx.restore();
        }

        ctx.restore();

        // Right Info Card: Real-time Chemistry Readout
        const cardX = 640;
        const cardY = 100;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, 210, 220, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(lang === 'ne' ? '📊 प्रकाश संश्लेषण दर:' : '📊 Reaction Kinetics:', cardX + 16, cardY + 28);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(
          lang === 'ne' ? `अक्सिजन फोका: ${bubbleFrequency} / मिनेट` : `O₂ Rate: ${bubbleFrequency} bubbles/min`,
          cardX + 16,
          cardY + 60
        );

        ctx.fillStyle = '#fbbf24';
        ctx.fillText(
          lang === 'ne' ? `ग्लुकोज उत्पादन: ${glucoseMgPerHr} mg/घण्टा` : `Glucose: ${glucoseMgPerHr} mg/hr`,
          cardX + 16,
          cardY + 90
        );

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(
          lang === 'ne' ? `संकलित अक्सिजन: ${gasCollectedMl.toFixed(1)} mL` : `Gas Volume: ${gasCollectedMl.toFixed(1)} mL`,
          cardX + 16,
          cardY + 120
        );

        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';
        ctx.fillText(lang === 'ne' ? 'रासायनिक समीकरण:' : 'Chemical Equation:', cardX + 16, cardY + 155);
        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('6CO₂ + 6H₂O', cardX + 16, cardY + 175);
        ctx.fillText('➔ C₆H₁₂O₆ + 6O₂', cardX + 16, cardY + 195);
      }

      // ==========================================
      // VIEW 2: LEAF CELLULAR ANATOMY CROSS-SECTION
      // ==========================================
      if (activeTab === 'leaf_anatomy') {
        const lx = 80;
        const ly = 120;
        const lw = 720;

        // 1. Waxy Cuticle Layer
        ctx.fillStyle = 'rgba(187, 247, 208, 0.5)';
        ctx.fillRect(lx, ly, lw, 14);
        ctx.fillStyle = '#166534';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Waxy Cuticle', lx + 12, ly + 11);

        // 2. Upper Epidermis
        ctx.fillStyle = '#86efac';
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 18; i++) {
          ctx.beginPath();
          ctx.roundRect(lx + i * 40, ly + 14, 38, 28, 4);
          ctx.fill();
          ctx.stroke();
        }

        // 3. Palisade Mesophyll Layer (Columnar Cells filled with Chloroplasts)
        for (let i = 0; i < 20; i++) {
          const cx = lx + i * 36;
          const cy = ly + 46;
          ctx.fillStyle = '#16a34a';
          ctx.strokeStyle = '#14532d';
          ctx.beginPath();
          ctx.roundRect(cx, cy, 33, 110, 6);
          ctx.fill();
          ctx.stroke();

          // Green Chloroplast Organelles inside
          ctx.fillStyle = '#22c55e';
          for (let c = 0; c < 7; c++) {
            ctx.beginPath();
            ctx.ellipse(cx + 16, cy + 14 + c * 14, 10, 5, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 4. Spongy Mesophyll Layer with Air Spaces
        ctx.fillStyle = '#4ade80';
        for (let s = 0; s < 24; s++) {
          const sx = lx + 20 + (s % 12) * 60 + ((s > 11 ? 25 : 0));
          const sy = ly + 165 + Math.floor(s / 12) * 45;
          ctx.beginPath();
          ctx.arc(sx, sy, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // 5. Vascular Bundle (Vein): Xylem (water) & Phloem (food)
        const vx = lx + lw / 2;
        const vy = ly + 190;
        ctx.fillStyle = '#0284c7'; // Xylem
        ctx.beginPath();
        ctx.arc(vx - 20, vy, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316'; // Phloem
        ctx.beginPath();
        ctx.arc(vx + 20, vy, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Xylem (H₂O)', vx - 20, vy + 4);
        ctx.fillText('Phloem (Food)', vx + 20, vy + 4);

        // 6. Lower Epidermis with Stomata & Guard Cells
        for (let i = 0; i < 18; i++) {
          const ex = lx + i * 40;
          const ey = ly + 260;
          if (i === 6 || i === 12) {
            // Stomatal Pore with two kidney-shaped guard cells
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.ellipse(ex + 8, ey + 14, 7, 12, 0.3, 0, Math.PI * 2);
            ctx.ellipse(ex + 30, ey + 14, 7, 12, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Pore label
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('Stoma (CO₂/O₂)', ex + 20, ey + 36);
          } else {
            ctx.fillStyle = '#86efac';
            ctx.beginPath();
            ctx.roundRect(ex, ey, 38, 28, 4);
            ctx.fill();
            ctx.stroke();
          }
        }

        // Photon Light Rays Striking Upper Leaf Surface
        if (sunlight > 0) {
          ctx.strokeStyle = `rgba(250, 204, 21, ${0.6 * (sunlight / 100)})`;
          ctx.lineWidth = 2;
          for (let r = 0; r < 14; r++) {
            const rx = lx + 30 + r * 50;
            ctx.beginPath();
            ctx.moveTo(rx - 20, ly - 40);
            ctx.lineTo(rx, ly);
            ctx.stroke();
          }
        }
      }

      // ==========================================
      // VIEW 3: STARCH IODINE COLORIMETRIC TEST
      // ==========================================
      if (activeTab === 'iodine_test') {
        const leafCenterX = 440;
        const leafCenterY = 250;

        ctx.save();
        ctx.translate(leafCenterX, leafCenterY);

        // Large Potted Plant Leaf
        ctx.beginPath();
        ctx.moveTo(0, -140);
        ctx.bezierCurveTo(160, -100, 190, 80, 0, 150);
        ctx.bezierCurveTo(-190, 80, -160, -100, 0, -140);
        ctx.closePath();

        if (!iodineTested) {
          // Normal Green Leaf with Black Paper Strip covering middle
          ctx.fillStyle = '#22c55e';
          ctx.fill();
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Black Paper Strip across middle (Blocked from sunlight)
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#475569';
          ctx.fillRect(-160, -30, 320, 60);
          ctx.strokeRect(-160, -30, 320, 60);

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lang === 'ne' ? 'कालो कागजले ढाकिएको भाग (घाम नपरेको)' : 'Covered with Black Paper (No Light)', 0, 5);
        } else {
          // Iodine Dropped: Exposed ends turn deep Blue-Black (Starch present!)
          // Covered strip stays Pale Yellow-Brown (No Starch synthesized!)
          const starchGrad = ctx.createLinearGradient(0, -140, 0, 150);
          starchGrad.addColorStop(0, '#1e1b4b'); // Blue-Black
          starchGrad.addColorStop(0.35, '#172554');
          starchGrad.addColorStop(0.38, '#d97706'); // Covered pale brown
          starchGrad.addColorStop(0.62, '#b45309');
          starchGrad.addColorStop(0.65, '#172554');
          starchGrad.addColorStop(1, '#1e1b4b'); // Blue-Black

          ctx.fillStyle = starchGrad;
          ctx.fill();
          ctx.strokeStyle = '#312e81';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Result Callout
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lang === 'ne' ? 'नीलो-कालो (स्टार्च प्रमाणित!)' : 'Blue-Black (Starch Present!)', 0, -80);
          ctx.fillText(lang === 'ne' ? 'हल्का खैरो (स्टार्च नभएको)' : 'Pale Brown (No Starch Formed)', 0, 5);
          ctx.fillText(lang === 'ne' ? 'नीलो-कालो (स्टार्च प्रमाणित!)' : 'Blue-Black (Starch Present!)', 0, 100);
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, sunlight, co2Level, temperature, gasCollectedMl, splinterFlaring, iodineTested, lang]);

  return (
    <SimulationLayout
      title="Photosynthesis Laboratory & Oxygen Production"
      titleNepali="प्रकाश संश्लेषण प्रयोगशाला तथा अक्सिजन उत्पादन"
      chapterNumber={5}
      chapterTitle="Unit 5: Life Process"
      chapterTitleNepali="एकाइ 5: जीवन प्रक्रिया"
      currentStage={stage}
      onStageChange={(s) => {
        setStage(s);
        ScienceAudio.playClick();
      }}
      lang={lang}
      onLanguageChange={setLang}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
      stars={stars}
      isCompleted={isCompleted}
      currentPromptEn="Adjust sunlight and CO₂ to produce oxygen bubbles from Hydrilla or perform the glowing splinter and starch iodine tests."
      currentPromptNe="घामको किरण र कार्बनडाइअक्साइड मिलाई अक्सिजनका फोका निकाल्नुहोस् वा सलाईको काँटी र स्टार्च परीक्षण गर्नुहोस्।"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          height: '100%',
          overflow: 'hidden',
          background: '#090d16',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN: INTERACTIVE 2D PHOTOSYNTHESIS VIEWPORT
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#090d16',
          }}
        >
          {/* Main 2D Canvas */}
          <canvas
            ref={canvasRef}
            width={880}
            height={500}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#090d16',
            }}
          />

          {/* Top Floating Badges */}
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
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Beaker size={14} color="#38bdf8" />
              {activeTab === 'hydrilla_apparatus'
                ? (lang === 'ne' ? '1. हाइड्रिला अक्सिजन संकलन' : 'Hydrilla Oxygen Apparatus')
                : activeTab === 'leaf_anatomy'
                  ? (lang === 'ne' ? '2. पातको कोषीय संरचना' : 'Leaf Cellular Anatomy')
                  : (lang === 'ne' ? '3. स्टार्च आयोडिन परीक्षण' : 'Starch Iodine Test')}
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span>{lang === 'ne' ? `O₂ दर: ${bubbleFrequency}/मि` : `O₂ Rate: ${bubbleFrequency}/min`}</span>
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fbbf24',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span>{lang === 'ne' ? `ग्लुकोज: ${glucoseMgPerHr} mg/घ` : `Glucose: ${glucoseMgPerHr} mg/h`}</span>
            </span>
          </div>

          {/* Top-Right Reset Button */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              zIndex: 10,
            }}
          >
            <button
              onClick={handleReset}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={14} />
              {lang === 'ne' ? 'रिसेट' : 'Reset'}
            </button>
          </div>

          {/* Bottom Floating Status Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.92)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Beaker size={16} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                  {activeTab === 'hydrilla_apparatus'
                    ? (lang === 'ne' ? 'हाइड्रिला अक्सिजन संकलन' : 'Hydrilla Inverted Funnel Apparatus')
                    : activeTab === 'leaf_anatomy'
                      ? (lang === 'ne' ? 'पातको कोषीय क्रस-सेक्सन' : 'Palisade & Spongy Mesophyll Cells')
                      : (lang === 'ne' ? 'स्टार्च आयोडिन परीक्षण' : 'Boiled Leaf Starch Verification')}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {lang === 'ne'
                    ? `अक्सिजन संकलन: ${gasCollectedMl.toFixed(1)} mL • प्रकाश: ${sunlight}% • CO₂: ${co2Level}`
                    : `Oxygen Collected: ${gasCollectedMl.toFixed(1)} mL • Sunlight: ${sunlight}% • CO₂: ${co2Level}`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeTab === 'hydrilla_apparatus' && (
                <button
                  onClick={handleSplinterTest}
                  disabled={splinterFlaring}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: splinterFlaring ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)',
                  }}
                >
                  <Flame size={14} />
                  <span>{lang === 'ne' ? 'सलाईको काँटी परीक्षण' : 'Glowing Splinter Test'}</span>
                </button>
              )}

              {activeTab === 'iodine_test' && (
                <button
                  onClick={handleIodineTest}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)',
                  }}
                >
                  <Droplets size={14} />
                  <span>{lang === 'ne' ? 'आयोडिन घोल थप्नुहोस्' : 'Add Iodine Reagent'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: PHOTOSYNTHESIS DISCOVERY STATION (380px)
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(10, 20, 40, 0.95)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
            color: '#fff',
          }}
        >
          {/* Station Header Card */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sun size={18} color="#facc15" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.3px' }}>
                {lang === 'ne' ? 'प्रकाश संश्लेषण अनुसन्धान' : 'Photosynthesis Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.45 }}>
              {lang === 'ne'
                ? 'बिरुवाले घामको प्रकाश, पानी र CO₂ प्रयोग गरी खाना (ग्लुकोज) र अक्सिजन बनाउने रासायनिक प्रक्रिया जाँच्नुहोस्।'
                : 'Control photon flux, CO₂ availability, and thermal conditions to measure photosynthetic rate and oxygen generation.'}
            </div>
          </div>

          {/* Mode Selector Tabs (3 Tabs) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {[
              { id: 'hydrilla_apparatus', icon: Beaker, labelEn: 'Hydrilla Lab', labelNe: 'हाइड्रिला' },
              { id: 'leaf_anatomy', icon: Layers, labelEn: 'Leaf Anatomy', labelNe: 'पात कोष' },
              { id: 'iodine_test', icon: Sparkles, labelEn: 'Starch Test', labelNe: 'स्टार्च जाँच्ने' },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as LabTab);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: active ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: active ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: active ? '#38bdf8' : '#cbd5e1',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <IconComp size={14} color={active ? '#38bdf8' : '#94a3b8'} />
                  <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{lang === 'ne' ? tab.labelNe : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Environmental Parameter Sliders */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Sunlight Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                  <Sun size={13} color="#facc15" />
                  {lang === 'ne' ? 'घामको तीव्रता (Light):' : 'Sunlight Intensity:'}
                </span>
                <strong style={{ color: '#facc15' }}>{sunlight}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sunlight}
                onChange={(e) => setSunlight(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#facc15', cursor: 'pointer' }}
              />
            </div>

            {/* CO2 Concentration */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#38bdf8', display: 'block', marginBottom: '6px' }}>
                {lang === 'ne' ? 'CO₂ को मात्रा (Baking Soda):' : 'CO₂ Concentration:'}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['low', 'normal', 'high'] as const).map((lvl) => {
                  const active = co2Level === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => {
                        setCo2Level(lvl);
                        ScienceAudio.playClick();
                      }}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: active ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: active ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        color: active ? '#38bdf8' : '#cbd5e1',
                        textTransform: 'uppercase',
                      }}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Temperature Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                  <Thermometer size={13} color="#f87171" />
                  {lang === 'ne' ? 'तापक्रम (Temp):' : 'Temperature:'}
                </span>
                <strong style={{ color: '#f87171' }}>{temperature}°C</strong>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f87171', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Photosynthesis Reaction Formula Card */}
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '11px',
              color: '#cbd5e1',
            }}
          >
            <div style={{ fontWeight: 800, color: '#4ade80', marginBottom: '4px' }}>
              🌿 {lang === 'ne' ? 'रासायनिक समीकरण:' : 'Photosynthesis Equation:'}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#f8fafc', fontWeight: 700 }}>
              6CO₂ + 6H₂O + Solar → C₆H₁₂O₆ + 6O₂ ↑
            </div>
          </div>

          {/* Curriculum Key Takeaway Card */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '11px',
              color: '#cbd5e1',
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
              💡 {lang === 'ne' ? 'पाठ्यक्रम मुख्य निष्कर्ष:' : 'Curriculum Key Takeaway:'}
            </div>
            {lang === 'ne'
              ? 'प्रकाश संश्लेषणको लागि घामको प्रकाश, क्लोरोफिल, पानी र कार्बनडाइअक्साइड अनिवार्य हुन्छ। यस प्रक्रियाबाट अक्सिजन ग्यास उप-उत्पादनका रूपमा निस्कन्छ।'
              : 'Chlorophyll in leaf mesophyll captures photons to hydrolyze water, generating chemical glucose and liberating gaseous oxygen as a vital byproduct.'}
          </div>

          {/* Prominent Completion Button */}
          <button
            onClick={() => {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Photosynthesis Lab & Quiz' : 'प्रकाश संश्लेषण प्रयोगशाला पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default PhotosynthesisLabSim;
