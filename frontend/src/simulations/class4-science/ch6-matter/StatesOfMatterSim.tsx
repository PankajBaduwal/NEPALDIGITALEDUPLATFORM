/**
 * StatesOfMatterSim.tsx
 * Simulation 20: 2D Interactive Molecular Particle Chamber
 * Grade 4 Science • Chapter 6: Matter
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - Real-time 2D molecular kinetics (H2O molecules with central Oxygen and two Hydrogen ears):
 *   1. Solid: Rigid crystalline lattice with micro-vibrations and frost edges
 *   2. Liquid: Cohesive fluid flow conforming to container, surface waves
 *   3. Gas: High-velocity elastic collisions, wall rebounds, thermal trails
 * - Interactive Bunsen Burner with realistic animated flame (blue core + orange mantle)
 * - Dynamic laboratory Thermometer (-20°C to 120°C) with mercury column
 * - Interactive thermal controls (Heat / Cool, State selectors, Flame power)
 * - Bilingual (EN/NE), sound effects, and mastery challenge
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Flame, Snowflake, RotateCcw, Sparkles, Thermometer, Gauge, Check } from 'lucide-react';

type MatterState = 'solid' | 'liquid' | 'gas';

interface Molecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  angle: number;
}

export const StatesOfMatterSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [activeState, setActiveState] = useState<MatterState>('solid');
  const [tempCelsius, setTempCelsius] = useState<number>(-10); // -20°C to 120°C
  const [burnerPower, setBurnerPower] = useState<number>(0); // 0 = off, 1 = low, 2 = high
  const [exploredStates, setExploredStates] = useState<MatterState[]>(['solid']);

  // Challenge stage state
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const moleculesRef = useRef<Molecule[]>([]);

  // Initialize 48 molecules in grid
  useEffect(() => {
    const list: Molecule[] = [];
    const cols = 8;
    const rows = 6;
    const startX = 280;
    const startY = 240;
    const spacingX = 35;
    const spacingY = 32;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bx = startX + c * spacingX + (r % 2 === 1 ? 16 : 0);
        const by = startY + r * spacingY;
        list.push({
          x: bx,
          y: by,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          baseX: bx,
          baseY: by,
          angle: Math.random() * Math.PI * 2,
        });
      }
    }
    moleculesRef.current = list;
  }, []);

  const handleStateChange = (st: MatterState) => {
    setActiveState(st);
    ScienceAudio.playPop();

    if (st === 'solid') {
      setTempCelsius(-10);
      setBurnerPower(0);
    } else if (st === 'liquid') {
      setTempCelsius(40);
      setBurnerPower(1);
    } else {
      setTempCelsius(115);
      setBurnerPower(2);
    }

    if (!exploredStates.includes(st)) {
      const next = [...exploredStates, st];
      setExploredStates(next);
      setStars(Math.min(3, next.length));
      if (next.length >= 3) {
        setIsCompleted(true);
        setStage('understand');
        ScienceAudio.playSuccess();
      }
    }
  };

  const handleTempChange = (newTemp: number) => {
    setTempCelsius(newTemp);
    if (newTemp <= 0 && activeState !== 'solid') {
      setActiveState('solid');
      setBurnerPower(0);
    } else if (newTemp > 0 && newTemp < 100 && activeState !== 'liquid') {
      setActiveState('liquid');
      setBurnerPower(1);
    } else if (newTemp >= 100 && activeState !== 'gas') {
      setActiveState('gas');
      setBurnerPower(2);
    }
  };

  const handleHeat = () => {
    const nextTemp = Math.min(120, tempCelsius + 25);
    handleTempChange(nextTemp);
    ScienceAudio.playFireTorch();
  };

  const handleCool = () => {
    const nextTemp = Math.max(-20, tempCelsius - 25);
    handleTempChange(nextTemp);
    ScienceAudio.playWaterDrop();
  };

  const handleReset = () => {
    setActiveState('solid');
    setTempCelsius(-10);
    setBurnerPower(0);
    setExploredStates(['solid']);
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    setChallengeFeedback(null);
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
      bg.addColorStop(1, '#ffffff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 880, 560);

      // Lab counter bench surface
      const bench = ctx.createLinearGradient(0, 480, 0, 560);
      bench.addColorStop(0, '#e2e8f0');
      bench.addColorStop(0.2, '#cbd5e1');
      bench.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = bench;
      ctx.fillRect(0, 480, 880, 80);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.lineTo(880, 480);
      ctx.stroke();

      // Tripod stand for beaker
      drawTripodStand(ctx, 410, 480);

      // Bunsen Burner underneath
      drawBunsenBurner(ctx, 410, 480, burnerPower, time);

      // 2. GLASS BEAKER / CHAMBER
      const chamberX = 240;
      const chamberY = 110;
      const chamberW = 340;
      const chamberH = 340;
      drawGlassChamber(ctx, chamberX, chamberY, chamberW, chamberH, tempCelsius);

      // 3. MOLECULAR SIMULATION INSIDE CHAMBER
      updateAndDrawMolecules(ctx, chamberX, chamberY, chamberW, chamberH, activeState, tempCelsius, time);

      // 4. THERMOMETER ON THE RIGHT
      drawThermometer(ctx, 640, 100, tempCelsius, lang);

      // 5. KINETIC ENERGY GAUGE ON THE LEFT
      drawKineticGauge(ctx, 90, 130, tempCelsius, activeState, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeState, tempCelsius, burnerPower, lang]);

  // Tripod Stand
  function drawTripodStand(ctx: CanvasRenderingContext2D, cx: number, baseY: number) {
    ctx.save();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    // Left leg
    ctx.beginPath();
    ctx.moveTo(cx - 150, baseY);
    ctx.lineTo(cx - 120, baseY - 60);
    ctx.stroke();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(cx + 150, baseY);
    ctx.lineTo(cx + 120, baseY - 60);
    ctx.stroke();
    // Center post
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.lineTo(cx, baseY - 60);
    ctx.stroke();
    // Horizontal gauze ring
    ctx.fillStyle = '#475569';
    ctx.fillRect(cx - 160, baseY - 65, 320, 8);
    // Wire mesh pattern
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    for (let x = cx - 150; x <= cx + 150; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, baseY - 65);
      ctx.lineTo(x, baseY - 57);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Bunsen Burner
  function drawBunsenBurner(ctx: CanvasRenderingContext2D, cx: number, baseY: number, power: number, t: number) {
    ctx.save();
    // Cast iron base
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(cx, baseY - 5, 45, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brass barrel tube
    const tubeGrad = ctx.createLinearGradient(cx - 9, 0, cx + 9, 0);
    tubeGrad.addColorStop(0, '#78350f');
    tubeGrad.addColorStop(0.5, '#d97706');
    tubeGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = tubeGrad;
    ctx.fillRect(cx - 8, baseY - 65, 16, 60);

    // Collar with air hole
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 9, baseY - 25, 18, 10);

    // Animated flame if power > 0
    if (power > 0) {
      const flameH = power === 1 ? 40 : 65;
      const flicker = Math.sin(t * 18) * 3;
      const topFlameY = baseY - 65 - flameH + flicker;

      // Outer orange flame
      ctx.save();
      const outerGrad = ctx.createRadialGradient(cx, baseY - 65, 5, cx, baseY - 65 - flameH * 0.5, flameH);
      outerGrad.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
      outerGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.9)');
      outerGrad.addColorStop(0.8, 'rgba(234, 179, 8, 0.8)');
      outerGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 14, baseY - 65);
      ctx.quadraticCurveTo(cx - 18, baseY - 65 - flameH * 0.6, cx, topFlameY);
      ctx.quadraticCurveTo(cx + 18, baseY - 65 - flameH * 0.6, cx + 14, baseY - 65);
      ctx.closePath();
      ctx.fill();

      // Inner intense blue cone
      const innerGrad = ctx.createLinearGradient(cx, baseY - 65, cx, baseY - 65 - flameH * 0.45);
      innerGrad.addColorStop(0, '#38bdf8');
      innerGrad.addColorStop(0.6, '#0284c7');
      innerGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 7, baseY - 65);
      ctx.quadraticCurveTo(cx - 9, baseY - 65 - flameH * 0.25, cx, baseY - 65 - flameH * 0.45);
      ctx.quadraticCurveTo(cx + 9, baseY - 65 - flameH * 0.25, cx + 7, baseY - 65);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // Glass Chamber
  function drawGlassChamber(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, temp: number) {
    ctx.save();
    // Glass interior glow depending on temperature
    let glowColor = 'rgba(56, 189, 248, 0.05)';
    if (temp <= 0) glowColor = 'rgba(147, 197, 253, 0.12)';
    else if (temp >= 100) glowColor = 'rgba(251, 146, 60, 0.1)';

    ctx.fillStyle = glowColor;
    ctx.fillRect(x, y, w, h);

    // Frost crystals on glass if sub-zero
    if (temp < 0) {
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
      ctx.lineWidth = 1.5;
      // Corner frost
      drawFrostCorner(ctx, x + 5, y + 5, 1, 1);
      drawFrostCorner(ctx, x + w - 5, y + 5, -1, 1);
      drawFrostCorner(ctx, x + 5, y + h - 5, 1, -1);
      drawFrostCorner(ctx, x + w - 5, y + h - 5, -1, -1);
    }

    // Glass wall border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);

    // Rim highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + w - 2, y + 2);
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + 2, y + h - 2);
    ctx.stroke();

    // Volume graduation marks on glass side
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    for (let markY = y + 50; markY < y + h - 30; markY += 45) {
      ctx.beginPath();
      ctx.moveTo(x + w - 20, markY);
      ctx.lineTo(x + w, markY);
      ctx.stroke();
      const ml = Math.round((y + h - markY) * 1.5);
      ctx.fillText(`${ml} ml`, x + w - 24, markY + 3);
    }
    ctx.restore();
  }

  function drawFrostCorner(ctx: CanvasRenderingContext2D, sx: number, sy: number, dx: number, dy: number) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx * 28, sy + dy * 8);
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx * 8, sy + dy * 28);
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx * 22, sy + dy * 22);
    ctx.stroke();
  }

  // Update & Draw Molecules
  function updateAndDrawMolecules(
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    bw: number,
    bh: number,
    state: MatterState,
    temp: number,
    t: number
  ) {
    const list = moleculesRef.current;
    const padding = 16;
    const minX = bx + padding;
    const maxX = bx + bw - padding;
    const minY = by + padding;
    const maxY = by + bh - padding;

    // Molecular colors
    let oColor = '#ef4444'; // Red Oxygen
    let hColor = '#f8fafc'; // White Hydrogen
    let bondColor = '#94a3b8';

    if (state === 'solid') {
      // Solid: ordered grid with small thermal vibration
      const vibAmp = Math.max(0.4, (temp + 30) * 0.08);

      // Ice bond connections between neighbors
      ctx.save();
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.35)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const dx = list[i].baseX - list[j].baseX;
          const dy = list[i].baseY - list[j].baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 42) {
            ctx.beginPath();
            ctx.moveTo(list[i].x, list[i].y);
            ctx.lineTo(list[j].x, list[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      list.forEach((m, idx) => {
        m.x = m.baseX + Math.sin(t * 20 + idx) * vibAmp;
        m.y = m.baseY + Math.cos(t * 18 + idx * 1.5) * vibAmp;
        drawH2O(ctx, m.x, m.y, 0, oColor, hColor, bondColor);
      });
    } else if (state === 'liquid') {
      // Liquid: fluid pool at bottom, sliding smoothly
      const speed = 1.2 + (temp - 0) * 0.03;
      const liquidCeiling = by + bh * 0.4;

      // Draw subtle blue liquid pool tint
      ctx.save();
      const fluidGrad = ctx.createLinearGradient(0, liquidCeiling, 0, by + bh);
      fluidGrad.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
      fluidGrad.addColorStop(1, 'rgba(2, 132, 199, 0.55)');
      ctx.fillStyle = fluidGrad;
      ctx.beginPath();
      ctx.moveTo(bx + 4, by + bh - 4);
      ctx.lineTo(bx + 4, liquidCeiling);
      // Fluid wave at surface
      for (let wx = bx + 4; wx <= bx + bw - 4; wx += 20) {
        ctx.lineTo(wx, liquidCeiling + Math.sin((wx * 0.04) + t * 4) * 3);
      }
      ctx.lineTo(bx + bw - 4, by + bh - 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      list.forEach((m) => {
        m.x += m.vx * speed;
        m.y += m.vy * speed;

        // Bounce within liquid pool
        if (m.x < minX) { m.x = minX; m.vx = Math.abs(m.vx); }
        if (m.x > maxX) { m.x = maxX; m.vx = -Math.abs(m.vx); }
        if (m.y < liquidCeiling + 10) { m.y = liquidCeiling + 10; m.vy = Math.abs(m.vy); }
        if (m.y > maxY) { m.y = maxY; m.vy = -Math.abs(m.vy); }

        m.angle += 0.02;
        drawH2O(ctx, m.x, m.y, m.angle, '#0284c7', hColor, '#38bdf8');
      });
    } else {
      // Gas: high velocity bouncing off all walls, escaping steam
      const speed = 3.5 + (temp - 100) * 0.08;

      list.forEach((m) => {
        m.x += m.vx * speed;
        m.y += m.vy * speed;

        if (m.x < minX) { m.x = minX; m.vx = Math.abs(m.vx); }
        if (m.x > maxX) { m.x = maxX; m.vx = -Math.abs(m.vx); }
        if (m.y < minY) { m.y = minY; m.vy = Math.abs(m.vy); }
        if (m.y > maxY) { m.y = maxY; m.vy = -Math.abs(m.vy); }

        m.angle += 0.08;

        // Thermal kinetic trail
        ctx.save();
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m.x - m.vx * 6, m.y - m.vy * 6);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        ctx.restore();

        drawH2O(ctx, m.x, m.y, m.angle, '#ea580c', '#fed7aa', '#fdba74');
      });

      // Rising steam clouds above chamber
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let s = 0; s < 12; s++) {
        const sx = bx + bw * 0.5 + Math.sin(t * 3 + s) * 70;
        const sy = by - ((t * 40 + s * 18) % 90);
        ctx.beginPath();
        ctx.arc(sx, sy, 8 + (s % 6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Draw H2O Molecule: Oxygen sphere with 2 angled Hydrogen ears
  function drawH2O(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    oColor: string,
    hColor: string,
    bondColor: string
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Hydrogen 1 (at 104.5 degree tetrahedral bond)
    const h1x = -7;
    const h1y = -6;
    const h2x = 7;
    const h2y = -6;

    // Bonds
    ctx.strokeStyle = bondColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(h1x, h1y);
    ctx.moveTo(0, 0);
    ctx.lineTo(h2x, h2y);
    ctx.stroke();

    // Central Oxygen Atom
    ctx.fillStyle = oColor;
    ctx.beginPath();
    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Hydrogen Atoms
    ctx.fillStyle = hColor;
    ctx.beginPath();
    ctx.arc(h1x, h1y, 4, 0, Math.PI * 2);
    ctx.arc(h2x, h2y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 4. THERMOMETER DISPLAY
  function drawThermometer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    temp: number,
    currentLang: Language
  ) {
    ctx.save();
    const h = 330;
    const w = 24;

    // Glass bulb & tube
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h - 30, 12);
    ctx.fill();
    ctx.stroke();

    // Mercury Bulb at base
    const bulbY = y + h - 15;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x + w * 0.5, bulbY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Mercury column height (-20°C = bottom, 120°C = top)
    const norm = (temp - (-20)) / (120 - (-20)); // 0 to 1
    const colHeight = (h - 60) * Math.min(1, Math.max(0, norm));
    const colTop = y + h - 35 - colHeight;

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(x + 7, colTop, w - 14, colHeight + 10, 5);
    ctx.fill();

    // Graduation lines
    ctx.strokeStyle = '#94a3b8';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';

    const temps = [-20, 0, 20, 40, 60, 80, 100, 120];
    temps.forEach((t) => {
      const tn = (t - (-20)) / (120 - (-20));
      const lineY = y + h - 35 - (h - 60) * tn;
      ctx.beginPath();
      ctx.moveTo(x + w, lineY);
      ctx.lineTo(x + w + 8, lineY);
      ctx.stroke();
      ctx.fillText(`${t}°C`, x + w + 12, lineY + 3);
    });

    // Digital readout badge
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(x - 20, y - 40, 75, 30, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(temp)}°C`, x + 17, y - 20);

    ctx.restore();
  }

  // 5. KINETIC ENERGY GAUGE
  function drawKineticGauge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    temp: number,
    state: MatterState,
    currentLang: Language
  ) {
    ctx.save();
    // Dial panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.roundRect(x - 65, y - 20, 130, 150, 12);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'en' ? 'Kinetic Energy' : 'गतिशक्ति (Kinetic)', x, y);

    // Arc gauge
    const radius = 42;
    ctx.beginPath();
    ctx.arc(x, y + 60, radius, Math.PI * 0.8, Math.PI * 2.2);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Active energy arc
    const energyNorm = Math.min(1, Math.max(0, (temp + 20) / 140));
    const arcEnd = Math.PI * 0.8 + (Math.PI * 1.4 * energyNorm);
    const gaugeGrad = ctx.createLinearGradient(x - radius, y + 60, x + radius, y + 60);
    gaugeGrad.addColorStop(0, '#38bdf8');
    gaugeGrad.addColorStop(0.5, '#22c55e');
    gaugeGrad.addColorStop(1, '#ef4444');
    ctx.beginPath();
    ctx.arc(x, y + 60, radius, Math.PI * 0.8, arcEnd);
    ctx.strokeStyle = gaugeGrad;
    ctx.lineWidth = 8;
    ctx.stroke();

    // Needle pointer
    const needleAngle = Math.PI * 0.8 + (Math.PI * 1.4 * energyNorm);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 60);
    ctx.lineTo(x + Math.cos(needleAngle) * (radius - 8), y + 60 + Math.sin(needleAngle) * (radius - 8));
    ctx.stroke();

    // Center pivot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y + 60, 4, 0, Math.PI * 2);
    ctx.fill();

    // State name badge
    let badgeColor = '#38bdf8';
    let label = 'Solid';
    if (state === 'liquid') {
      badgeColor = '#0ea5e9';
      label = 'Liquid';
    } else if (state === 'gas') {
      badgeColor = '#f97316';
      label = 'Gas';
    }

    ctx.fillStyle = badgeColor;
    ctx.font = 'bold 12px system-ui';
    ctx.fillText(label, x, y + 115);

    ctx.restore();
  }

  // Curriculum Challenge handling
  const handleAnswerChallenge = (choice: string) => {
    const isCorrect = choice === 'gas';
    if (isCorrect) {
      ScienceAudio.playSuccess();
      setChallengeFeedback(lang === 'en' ? 'Excellent! Gas molecules move freely at high speed!' : 'सबास! ग्यासका अणुहरू तीव्र गतिमा जथाभावी घुम्छन्!');
      setStars(3);
      setIsCompleted(true);
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setChallengeFeedback(lang === 'en' ? 'Try again! Think which state has the highest energy.' : 'फेरि सोच्नुहोस्! कुन अवस्थामा अणुहरू सबैभन्दा छिटो भाग्छन्?');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Three States of Matter' : 'पदार्थका तीन अवस्था (ठोस, तरल, ग्यास)'}
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

          {/* Top Floating State Badge */}
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
                {activeState === 'solid'
                  ? lang === 'en'
                    ? 'Solid State: Rigid Crystalline Lattice'
                    : 'ठोस अवस्था: नियमित र कसिलो अणुहरूको जालो'
                  : activeState === 'liquid'
                  ? lang === 'en'
                    ? 'Liquid State: Free-flowing Fluid Molecules'
                    : 'तरल अवस्था: बग्न सक्ने खुकुला अणुहरू'
                  : lang === 'en'
                  ? 'Gas State: High Kinetic Energy Gas Particles'
                  : 'ग्यास अवस्था: तीव्र गतिमा उड्ने अणुहरू'}
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
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {activeState === 'solid' ? '🧊' : activeState === 'liquid' ? '💧' : '💨'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {activeState === 'solid'
                    ? lang === 'en' ? 'Ice (Solid $H_2O$)' : 'बरफ (ठोस $H_2O$)'
                    : activeState === 'liquid'
                    ? lang === 'en' ? 'Water (Liquid $H_2O$)' : 'पानी (तरल $H_2O$)'
                    : lang === 'en' ? 'Steam (Gas $H_2O$)' : 'वाष्प (ग्यास $H_2O$)'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {activeState === 'solid'
                    ? lang === 'en' ? 'Fixed shape and volume • Low vibration' : 'निश्चित आकार र आयतन • कम कम्पन'
                    : activeState === 'liquid'
                    ? lang === 'en' ? 'Fixed volume, takes container shape • Rolling flow' : 'निश्चित आयतन, भाँडोको आकार • बग्ने'
                    : lang === 'en' ? 'No fixed shape or volume • Rapid expansion' : 'आकार र आयतन अनिश्चित • तीव्र फैलावट'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Temperature' : 'तापक्रम'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: tempCelsius > 40 ? '#f43f5e' : '#38bdf8' }}>
                  {tempCelsius}°C
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
              <span style={{ fontSize: '16px' }}>⚛️</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'States of Matter Discovery Station' : 'पदार्थका अवस्था अनुसन्धान केन्द्र'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Matter exists in three primary states: Solid, Liquid, and Gas. Heating adds thermal kinetic energy, causing molecules to break free and move faster.'
                : 'पदार्थ ठोस, तरल र ग्यास गरी तीन अवस्थामा हुन्छ। तापक्रम बढाउँदा अणुहरूमा ऊर्जा बढी गति तीव्र हुन्छ।'}
            </p>
          </div>

          {/* 2. Select Matter State Buttons */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Select State of Matter' : 'पदार्थको अवस्था छान्नुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                onClick={() => handleStateChange('solid')}
                style={{
                  background: activeState === 'solid' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${activeState === 'solid' ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '10px',
                  padding: '12px 6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '20px' }}>🧊</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: activeState === 'solid' ? '#38bdf8' : '#e2e8f0' }}>
                  {lang === 'en' ? 'Solid' : 'ठोस'}
                </span>
              </button>

              <button
                onClick={() => handleStateChange('liquid')}
                style={{
                  background: activeState === 'liquid' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${activeState === 'liquid' ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '10px',
                  padding: '12px 6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '20px' }}>💧</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: activeState === 'liquid' ? '#38bdf8' : '#e2e8f0' }}>
                  {lang === 'en' ? 'Liquid' : 'तरल'}
                </span>
              </button>

              <button
                onClick={() => handleStateChange('gas')}
                style={{
                  background: activeState === 'gas' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${activeState === 'gas' ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '10px',
                  padding: '12px 6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '20px' }}>💨</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: activeState === 'gas' ? '#f59e0b' : '#e2e8f0' }}>
                  {lang === 'en' ? 'Gas' : 'ग्यास'}
                </span>
              </button>
            </div>
          </div>

          {/* 3. Thermal Controls: Heat & Cool */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#e2e8f0' }}>
                <Thermometer size={14} color="#f43f5e" />
                <span>{lang === 'en' ? 'Thermal Energy Control' : 'ताप शक्ति नियन्त्रण'}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: tempCelsius > 40 ? '#f43f5e' : '#38bdf8' }}>
                {tempCelsius}°C
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={handleHeat}
                style={{
                  background: 'linear-gradient(135deg, #f97316, #e11d48)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 8px',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Flame size={14} />
                <span>{lang === 'en' ? 'Heat (+25°C)' : 'तताउनुहोस्'}</span>
              </button>

              <button
                onClick={handleCool}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 8px',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Snowflake size={14} />
                <span>{lang === 'en' ? 'Cool (-25°C)' : 'चिस्याउनुहोस्'}</span>
              </button>
            </div>

            <input
              type="range"
              min={-20}
              max={120}
              value={tempCelsius}
              onChange={(e) => handleTempChange(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: tempCelsius > 40 ? '#f43f5e' : '#38bdf8',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b' }}>
              <span>-20°C</span>
              <span>0°C (Melt)</span>
              <span>100°C (Boil)</span>
              <span>120°C (Steam)</span>
            </div>
          </div>

          {/* 4. Interactive Concept Check */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              {lang === 'en' ? 'Concept Check' : 'अवधारणा जाँच प्रश्न'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'In which state do water molecules possess the highest speed and kinetic energy?'
                : 'पानीका अणुहरू कुन अवस्थामा सबैभन्दा बढी गति र ऊर्जाका साथ उड्छन्?'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {['solid', 'liquid', 'gas'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleAnswerChallenge(st)}
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
                  {st === 'solid'
                    ? lang === 'en' ? 'Solid' : 'ठोस'
                    : st === 'liquid'
                    ? lang === 'en' ? 'Liquid' : 'तरल'
                    : lang === 'en' ? 'Gas' : 'ग्यास'}
                </button>
              ))}
            </div>

            {challengeFeedback && (
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
                {challengeFeedback}
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
                ? 'Solids hold their shape, liquids take the shape of their container, and gases spread to fill any available space.'
                : 'ठोसको आफ्नै आकार हुन्छ, तरलले भाँडोको आकार लिन्छ, र ग्यास सबैतिर फैलिन्छ।'}
            </p>
          </div>

          {/* 6. Complete States of Matter Lab Button */}
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
            <span>{lang === 'en' ? 'Complete States of Matter Lab & Quiz' : 'पदार्थको प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
