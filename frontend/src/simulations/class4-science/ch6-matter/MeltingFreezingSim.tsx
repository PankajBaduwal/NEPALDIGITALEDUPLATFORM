/**
 * MeltingFreezingSim.tsx
 * Simulation 21: 2D Melting and Freezing Thermal Lab
 * Grade 4 Science • Chapter 6: Matter
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - Dual process modes: Melting and Freezing
 * - Realistic crystal physics:
 *   - Melting: Translucent faceted ice cubes soften, droplets trickle down, water pool rises
 *   - Freezing: Sub-zero cryo cooling, dendritic ice needles branch across water, solidifying into ice
 * - Functional Bunsen Burner & Thermometer with latent heat phase plateau at 0°C
 * - Interactive Play/Pause/Scrub controls, Bilingual EN/NE, and Mastery Quiz
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Flame, Snowflake, RotateCcw, Play, Pause, Sparkles, Thermometer, Check } from 'lucide-react';

type ProcessMode = 'melting' | 'freezing';

export const MeltingFreezingSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [mode, setMode] = useState<ProcessMode>('melting');
  const [progress, setProgress] = useState<number>(0); // 0 to 100%
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Auto-play progress
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          ScienceAudio.playSuccess();
          setStars(3);
          setIsCompleted(true);
          setStage('understand');
          return 100;
        }
        return prev + 1;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (progress >= 100) setProgress(0);
    setIsPlaying(!isPlaying);
    ScienceAudio.playPop();
  };

  const handleModeChange = (newMode: ProcessMode) => {
    setMode(newMode);
    setProgress(0);
    setIsPlaying(false);
    ScienceAudio.playWhoosh();
  };

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(false);
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

      // 1. LAB BACKGROUND
      const bg = ctx.createLinearGradient(0, 0, 0, 560);
      bg.addColorStop(0, '#f8fafc');
      bg.addColorStop(0.65, '#f1f5f9');
      bg.addColorStop(1, '#0b0f19');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 880, 560);

      // Lab counter surface
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 480, 880, 80);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.lineTo(880, 480);
      ctx.stroke();

      // Temperature calculation based on progress & mode
      // Melting: starts at -10°C, reaches 0°C at 20%, stays at 0°C until 80%, then warms to 25°C
      let currentTemp = 0;
      if (mode === 'melting') {
        if (progress < 20) currentTemp = -10 + (progress / 20) * 10;
        else if (progress <= 80) currentTemp = 0; // Latent heat phase
        else currentTemp = ((progress - 80) / 20) * 25;
      } else {
        // Freezing: starts at 25°C, reaches 0°C at 30%, stays 0°C until 85%, drops to -10°C
        if (progress < 30) currentTemp = 25 - (progress / 30) * 25;
        else if (progress <= 85) currentTemp = 0;
        else currentTemp = -((progress - 85) / 15) * 10;
      }

      // Draw Heating apparatus or Cryo chamber
      if (mode === 'melting') {
        drawTripodAndBurner(ctx, 420, 480, isPlaying && progress < 100, time);
      } else {
        drawCryoCoolerBase(ctx, 420, 480, isPlaying, time);
      }

      // Draw Laboratory Beaker
      const beakerX = 300;
      const beakerY = 150;
      const beakerW = 240;
      const beakerH = 260;

      drawBeakerContent(ctx, beakerX, beakerY, beakerW, beakerH, mode, progress, time);
      drawGlassBeaker(ctx, beakerX, beakerY, beakerW, beakerH);

      // Draw Thermometer dipped in beaker
      drawLabThermometer(ctx, beakerX + beakerW * 0.5 + 40, beakerY + 20, currentTemp, lang);

      // Draw Phase Status HUD Banner
      drawPhaseHUD(ctx, 420, 90, mode, progress, currentTemp, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, progress, isPlaying, lang]);

  // Tripod Stand and Bunsen Burner
  function drawTripodAndBurner(ctx: CanvasRenderingContext2D, cx: number, baseY: number, isBurning: boolean, t: number) {
    ctx.save();
    // Metal Tripod legs
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - 130, baseY);
    ctx.lineTo(cx - 100, baseY - 65);
    ctx.moveTo(cx + 130, baseY);
    ctx.lineTo(cx + 100, baseY - 65);
    ctx.stroke();

    // Wire mesh gauze
    ctx.fillStyle = '#475569';
    ctx.fillRect(cx - 130, baseY - 70, 260, 8);

    // Bunsen Burner
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(cx, baseY - 5, 40, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d97706';
    ctx.fillRect(cx - 7, baseY - 65, 14, 60);

    // Flame
    if (isBurning) {
      const flameH = 45 + Math.sin(t * 15) * 5;
      const outerGrad = ctx.createRadialGradient(cx, baseY - 65, 5, cx, baseY - 65 - flameH * 0.5, flameH);
      outerGrad.addColorStop(0, '#60a5fa');
      outerGrad.addColorStop(0.35, '#f97316');
      outerGrad.addColorStop(0.8, '#eab308');
      outerGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 12, baseY - 65);
      ctx.quadraticCurveTo(cx - 16, baseY - 65 - flameH * 0.6, cx, baseY - 65 - flameH);
      ctx.quadraticCurveTo(cx + 16, baseY - 65 - flameH * 0.6, cx + 12, baseY - 65);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Cryo Cooling Base
  function drawCryoCoolerBase(ctx: CanvasRenderingContext2D, cx: number, baseY: number, isActive: boolean, t: number) {
    ctx.save();
    // Insulated Ice Bath Tub
    const tubGrad = ctx.createLinearGradient(cx - 140, baseY - 70, cx + 140, baseY);
    tubGrad.addColorStop(0, '#1e293b');
    tubGrad.addColorStop(0.5, '#334155');
    tubGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = tubGrad;
    ctx.beginPath();
    ctx.roundRect(cx - 135, baseY - 65, 270, 65, [8, 8, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cold ice-salt cooling mixture label
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('❄️ Cryo Cooling Chamber (-15°C Salt-Ice Bath)', cx, baseY - 20);

    // Floating ice crystals around base
    if (isActive) {
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
      for (let i = 0; i < 8; i++) {
        const ix = cx - 110 + (i * 30);
        const iy = baseY - 55 + Math.sin(t * 3 + i) * 4;
        ctx.beginPath();
        ctx.arc(ix, iy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Beaker Contents (Ice cubes melting OR Water freezing)
  function drawBeakerContent(
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    bw: number,
    bh: number,
    curMode: ProcessMode,
    pct: number,
    t: number
  ) {
    ctx.save();

    // 1. Water Pool at the bottom
    let waterHeight = 0;
    if (curMode === 'melting') {
      waterHeight = (pct / 100) * (bh * 0.55);
    } else {
      waterHeight = (1 - pct / 100 * 0.8) * (bh * 0.55);
    }

    const waterTop = by + bh - waterHeight;

    if (waterHeight > 2) {
      const waterGrad = ctx.createLinearGradient(bx, waterTop, bx, by + bh);
      waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
      waterGrad.addColorStop(1, 'rgba(2, 132, 199, 0.75)');
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.moveTo(bx + 4, by + bh - 4);
      ctx.lineTo(bx + 4, waterTop);
      // Gentle surface ripples
      for (let wx = bx + 4; wx <= bx + bw - 4; wx += 16) {
        ctx.lineTo(wx, waterTop + Math.sin((wx * 0.05) + t * 3) * 1.5);
      }
      ctx.lineTo(bx + bw - 4, by + bh - 4);
      ctx.closePath();
      ctx.fill();
    }

    // 2. Ice Cubes in Melting Mode
    if (curMode === 'melting') {
      const meltRatio = 1 - (pct / 100); // 1 = full size, 0 = fully melted
      if (meltRatio > 0.05) {
        const iceCubes = [
          { x: bx + 55, y: by + bh - waterHeight - 35, size: 50 * meltRatio, rot: 0.15 },
          { x: bx + 125, y: by + bh - waterHeight - 45, size: 58 * meltRatio, rot: -0.2 },
          { x: bx + 185, y: by + bh - waterHeight - 30, size: 48 * meltRatio, rot: 0.1 },
          { x: bx + 95, y: by + bh - waterHeight - 75, size: 45 * meltRatio, rot: 0.05 },
        ];

        iceCubes.forEach((cube) => {
          drawIceCube(ctx, cube.x, cube.y, cube.size, cube.rot);
        });

        // Trickling melt droplets
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let d = 0; d < 4; d++) {
          const dx = bx + 60 + d * 38;
          const dy = by + bh - waterHeight - 15 + ((t * 40 + d * 20) % 25);
          ctx.beginPath();
          ctx.arc(dx, dy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // 3. Freezing Mode: Dendritic ice crystals forming and spreading
      const freezeRatio = pct / 100;
      if (freezeRatio > 0.15) {
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
        ctx.lineWidth = 2.5;

        // Ice needles branching across liquid
        const needles = [
          { sx: bx + 30, sy: by + bh - 15, len: 120 * freezeRatio, ang: -0.8 },
          { sx: bx + 90, sy: by + bh - 25, len: 140 * freezeRatio, ang: -0.4 },
          { sx: bx + 150, sy: by + bh - 20, len: 130 * freezeRatio, ang: -0.6 },
          { sx: bx + 210, sy: by + bh - 15, len: 110 * freezeRatio, ang: -1.2 },
          { sx: bx + 70, sy: by + bh - 50, len: 90 * freezeRatio, ang: 0.3 },
          { sx: bx + 170, sy: by + bh - 60, len: 100 * freezeRatio, ang: -0.2 },
        ];

        needles.forEach((nd) => {
          ctx.beginPath();
          ctx.moveTo(nd.sx, nd.sy);
          const ex = nd.sx + Math.cos(nd.ang) * nd.len;
          const ey = nd.sy + Math.sin(nd.ang) * nd.len;
          ctx.lineTo(ex, ey);
          // Side branches
          ctx.lineTo(ex + Math.cos(nd.ang + 0.6) * (nd.len * 0.3), ey + Math.sin(nd.ang + 0.6) * (nd.len * 0.3));
          ctx.stroke();
        });

        // Frost opacity overlaying as it solidifies
        ctx.fillStyle = `rgba(186, 230, 253, ${freezeRatio * 0.45})`;
        ctx.fillRect(bx + 4, by + bh - waterHeight, bw - 8, waterHeight);
      }
    }

    ctx.restore();
  }

  // Draw 2D Hexagonal Faceted Ice Cube
  function drawIceCube(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Cube body with soft cyan crystal gradient
    const iceGrad = ctx.createLinearGradient(-s * 0.5, -s * 0.5, s * 0.5, s * 0.5);
    iceGrad.addColorStop(0, 'rgba(224, 242, 254, 0.9)');
    iceGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.75)');
    iceGrad.addColorStop(1, 'rgba(125, 211, 252, 0.6)');
    ctx.fillStyle = iceGrad;

    ctx.beginPath();
    ctx.roundRect(-s * 0.5, -s * 0.5, s, s, 6);
    ctx.fill();

    // Internal facet crack lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, -s * 0.3);
    ctx.lineTo(s * 0.1, s * 0.2);
    ctx.lineTo(s * 0.35, s * 0.35);
    ctx.moveTo(-s * 0.2, s * 0.3);
    ctx.lineTo(s * 0.2, -s * 0.2);
    ctx.stroke();

    // Bright edge highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-s * 0.5, -s * 0.5, s, s);

    ctx.restore();
  }

  // Draw Borosilicate Glass Beaker
  function drawGlassBeaker(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.save();
    // Glass Walls
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Spout at top left
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x, y + 8);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y);
    ctx.stroke();

    // Graduated milliliter marks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    for (let my = y + 50; my <= y + h - 30; my += 35) {
      ctx.beginPath();
      ctx.moveTo(x, my);
      ctx.lineTo(x + 16, my);
      ctx.stroke();
      const val = Math.round((y + h - my) * 1.8);
      ctx.fillText(`${val} ml`, x + 20, my + 3);
    }
    ctx.restore();
  }

  // Lab Thermometer
  function drawLabThermometer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    temp: number,
    currentLang: Language
  ) {
    ctx.save();
    const h = 280;
    const w = 18;

    // Tube
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h - 25, 9);
    ctx.fill();
    ctx.stroke();

    // Bulb
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h - 12, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Column (-15°C to 40°C range)
    const norm = (temp - (-15)) / (40 - (-15));
    const colHeight = (h - 50) * Math.min(1, Math.max(0, norm));
    const colTop = y + h - 25 - colHeight;

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(x + 5, colTop, w - 10, colHeight + 5, 4);
    ctx.fill();

    // Digital badge
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(x - 22, y - 35, 62, 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(temp)}°C`, x + 9, y - 18);

    ctx.restore();
  }

  // Phase HUD Overlay
  function drawPhaseHUD(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    curMode: ProcessMode,
    pct: number,
    temp: number,
    currentLang: Language
  ) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = curMode === 'melting' ? '#f97316' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.roundRect(cx - 180, cy - 25, 360, 50, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';

    let phaseName = '';
    if (curMode === 'melting') {
      phaseName = pct < 20
        ? currentLang === 'en' ? 'Phase: Solid Ice Warming' : 'अवस्था: ठोस हिउँ तात्दैछ'
        : pct <= 80
        ? currentLang === 'en' ? 'Phase: Melting at 0°C (Latent Heat)' : 'अवस्था: 0°C मा पग्लने प्रक्रिया जारी'
        : currentLang === 'en' ? 'Phase: Liquid Water Warming' : 'अवस्था: तरल पानी तात्दैछ';
    } else {
      phaseName = pct < 30
        ? currentLang === 'en' ? 'Phase: Liquid Water Cooling' : 'अवस्था: तरल पानी चिसिँदैछ'
        : pct <= 85
        ? currentLang === 'en' ? 'Phase: Freezing into Ice at 0°C' : 'अवस्था: 0°C मा हिउँ जम्दैछ'
        : currentLang === 'en' ? 'Phase: Solid Ice Sub-zero' : 'अवस्था: ठोस हिउँ थप चिसियो';
    }

    ctx.fillText(phaseName, cx, cy);

    // Progress bar inside HUD
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 150, cy + 12, 300, 6);
    ctx.fillStyle = curMode === 'melting' ? '#f97316' : '#38bdf8';
    ctx.fillRect(cx - 150, cy + 12, (300 * pct) / 100, 6);

    ctx.restore();
  }

  const handleQuizAnswer = (tempChoice: string) => {
    setQuizAnswered(true);
    if (tempChoice === '0') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! Pure water freezes and melts at 0°C.' : 'सबास! शुद्ध पानी 0°C मा पग्लन्छ र जम्छ।');
      setStars(3);
      setIsCompleted(true);
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. The melting and freezing point of water is 0°C.' : 'मिलेन। पानीको पग्लने र जम्ने बिन्दु 0°C हो।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Melting & Freezing Lab' : 'पग्लने र जम्ने प्रक्रिया (Melting & Freezing)'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 6: Matter'
          : 'कक्षा 4 विज्ञान • एकाइ 6: पदार्थ'
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

          {/* Top Floating Badge */}
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
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '6px 14px',
                borderRadius: '10px',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>
                {mode === 'melting'
                  ? lang === 'en'
                    ? 'Melting Experiment: Solid Ice → Liquid Water'
                    : 'पग्लने प्रयोग: ठोस हिउँबाट तरल पानी'
                  : lang === 'en'
                  ? 'Freezing Experiment: Liquid Water → Solid Ice'
                  : 'जम्ने प्रयोग: तरल पानीबाट ठोस हिउँ'}
              </span>
            </div>
          </div>

          {/* Bottom Floating Readout Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: mode === 'melting' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  border: `1px solid ${mode === 'melting' ? '#f97316' : '#38bdf8'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {mode === 'melting' ? '🔥' : '❄️'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {mode === 'melting'
                    ? lang === 'en' ? 'Phase Transition: Melting (0°C)' : 'अवस्था परिवर्तन: पग्लने क्रिया (0°C)'
                    : lang === 'en' ? 'Phase Transition: Freezing (0°C)' : 'अवस्था परिवर्तन: जम्ने क्रिया (0°C)'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {mode === 'melting'
                    ? lang === 'en' ? 'Ice absorbs heat, lattice breaks down' : 'हिउँले ताप सोस्छ, अणुहरू खुकुला हुन्छन्'
                    : lang === 'en' ? 'Water loses heat, crystalline lattice locks' : 'पानी चिसो भई अणुहरू बाँधिन्छन्'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Progress' : 'प्रगति'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>
                  {progress}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: 380px PERSISTENT SIDEBAR
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* 1. Discovery Station Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>🌡️</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Phase Change Discovery Station' : 'अवस्था परिवर्तन अनुसन्धान केन्द्र'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Observe the reversible phase change of pure water: Melting absorbs heat at 0°C, while Freezing releases heat at 0°C.'
                : 'पानीको उल्टिन सक्ने अवस्था परिवर्तन हेर्नुहोस्: 0°C मा ताप पाएर हिउँ पग्लन्छ र ताप गुमाएर पानी जम्छ।'}
            </p>
          </div>

          {/* 2. Mode Switcher (Melting vs Freezing) */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Select Process' : 'प्रक्रिया छान्नुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                onClick={() => handleModeChange('melting')}
                style={{
                  background: mode === 'melting' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${mode === 'melting' ? '#f97316' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '10px',
                  padding: '12px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '20px' }}>🔥</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: mode === 'melting' ? '#fb923c' : '#e2e8f0' }}>
                  {lang === 'en' ? 'Melting' : 'पग्लने प्रक्रिया'}
                </span>
              </button>

              <button
                onClick={() => handleModeChange('freezing')}
                style={{
                  background: mode === 'freezing' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${mode === 'freezing' ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '10px',
                  padding: '12px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '20px' }}>❄️</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: mode === 'freezing' ? '#38bdf8' : '#e2e8f0' }}>
                  {lang === 'en' ? 'Freezing' : 'जम्ने प्रक्रिया'}
                </span>
              </button>
            </div>
          </div>

          {/* 3. Experiment Playback & Progress */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#e2e8f0' }}>
                {lang === 'en' ? 'Experiment Playback' : 'प्रयोग सञ्चालन'}
              </span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8' }}>
                {progress}%
              </span>
            </div>

            <button
              onClick={handleTogglePlay}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: isPlaying ? '#d97706' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>
                {isPlaying
                  ? lang === 'en' ? 'Pause Experiment' : 'रोक्नुहोस्'
                  : progress >= 100
                  ? lang === 'en' ? 'Replay Experiment' : 'पुनः सुरु गर्नुहोस्'
                  : lang === 'en' ? 'Start Experiment' : 'प्रयोग सुरु गर्नुहोस्'}
              </span>
            </button>

            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => {
                setProgress(Number(e.target.value));
                setIsPlaying(false);
              }}
              style={{
                width: '100%',
                accentColor: mode === 'melting' ? '#f97316' : '#38bdf8',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b' }}>
              <span>0% ({mode === 'melting' ? 'Ice' : 'Water'})</span>
              <span>100% ({mode === 'melting' ? 'Water' : 'Ice'})</span>
            </div>
          </div>

          {/* 4. Concept Check Question */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              {lang === 'en' ? 'Concept Check' : 'अवधारणा जाँच'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'At what temperature does ice melt into water and water freeze into ice?'
                : 'कुन तापक्रममा हिउँ पग्लिएर पानी बन्छ र पानी जमेर हिउँ बन्छ?'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {['-10', '0', '100'].map((val) => (
                <button
                  key={val}
                  onClick={() => handleQuizAnswer(val)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 4px',
                    color: '#e2e8f0',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {val}°C
                </button>
              ))}
            </div>

            {quizFeedback && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontSize: '11px',
                  color: '#38bdf8',
                  textAlign: 'center',
                }}
              >
                {quizFeedback}
              </div>
            )}
          </div>

          {/* 5. Curriculum Key Takeaway Card */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', marginBottom: '4px' }}>
              ℹ️ {lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रम निष्कर्ष'}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.45' }}>
              {lang === 'en'
                ? 'Water changes from solid to liquid at 0°C (melting point) and freezes back from liquid to solid at 0°C (freezing point).'
                : '0°C मा हिउँ पग्लिएर पानी बन्छ (पग्लने बिन्दु) र 0°C मा नै पानी जमेर हिउँ बन्छ (जम्ने बिन्दु)।'}
            </p>
          </div>

          {/* 6. Complete Melting & Freezing Lab Button */}
          <button
            onClick={() => {
              ScienceAudio.playSuccess();
              setStars(3);
              setIsCompleted(true);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              marginTop: 'auto',
            }}
          >
            <span>✓</span>
            <span>{lang === 'en' ? 'Complete Melting & Freezing Lab' : 'पग्लने र जम्ने प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
