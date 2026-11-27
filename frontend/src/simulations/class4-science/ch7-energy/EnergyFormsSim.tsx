/**
 * EnergyFormsSim.tsx
 * Simulation 25: 2D Hydroelectric Energy Transformation Lab
 * Grade 4 Science • Chapter 7: Energy
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - Real-world Nepalese Hydroelectric Power Generation Station:
 *   1. High-altitude Dam Reservoir
 *   2. Penstock Pipe & Nozzle Jet
 *   3. Pelton Turbine Runner with rotating spoon cups
 *   4. Copper Coil Dynamo Generator
 *   5. Glowing Filament Bulb & Village House
 * - Interactive Penstock Valve flow slider (0% to 100%)
 * - Dynamic energy chain indicators, pulsating electric current, water spray particles
 * - Bilingual EN/NE, realistic sounds, and concept mastery challenge.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Play, Pause, RotateCcw, Sparkles, Sliders, Zap, Lightbulb, Check } from 'lucide-react';

interface SprayParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  r: number;
}

export const EnergyFormsSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [flowSpeed, setFlowSpeed] = useState<number>(80); // 0 to 100%
  const [activeFormIdx, setActiveFormIdx] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const sprayRef = useRef<SprayParticle[]>([]);

  const energyStages = [
    {
      id: 'potential',
      nameEn: '1. Potential Energy',
      nameNe: '1. स्थितिशक्ति (Potential Energy)',
      descEn: 'Water stored high up in the mountain reservoir has stored gravitational potential energy.',
      descNe: 'उचाइमा रहेको बाँधको पानीमा स्थिति ऊर्जा (Potential Energy) सञ्चित हुन्छ।',
    },
    {
      id: 'kinetic',
      nameEn: '2. Kinetic Energy',
      nameNe: '2. गतिशक्ति (Kinetic Energy)',
      descEn: 'As water rushes down the penstock pipe, potential energy converts into high-velocity kinetic energy.',
      descNe: 'पेनस्टक पाइपबाट बेगले पानी खस्दा स्थिति ऊर्जा तीव्र गतिशक्तिमा बदलिन्छ।',
    },
    {
      id: 'mechanical',
      nameEn: '3. Mechanical Energy',
      nameNe: '3. यान्त्रिक शक्ति (Mechanical Energy)',
      descEn: 'The high-pressure jet hits the Pelton wheel runner cups, causing the turbine shaft to spin rapidly.',
      descNe: 'पानीको तीव्र वेगले टर्बाइनको पंखालाई तीव्र गतिमा घुमाउँछ।',
    },
    {
      id: 'electrical',
      nameEn: '4. Electrical Energy',
      nameNe: '4. विद्युत शक्ति (Electrical Energy)',
      descEn: 'The spinning shaft rotates magnets inside copper coils of the generator, producing electric current.',
      descNe: 'टर्बाइनसँग जोडिएको जेनेरेटर/डाइनामो घुम्दा तारको कुण्डलीमा विद्युत उत्पन्न हुन्छ।',
    },
    {
      id: 'light_heat',
      nameEn: '5. Light & Heat Energy',
      nameNe: '5. प्रकाश र ताप शक्ति (Light & Heat)',
      descEn: 'Electric current flows through wires to illuminate the bulb filament and power village homes.',
      descNe: 'विद्युत बत्तीको फिलामेन्टमा पुगेर चम्किलो प्रकाश र ताप शक्तिमा रूपान्तरण हुन्छ।',
    },
  ];

  const handleToggleRunning = () => {
    setIsRunning(!isRunning);
    ScienceAudio.playPop();
  };

  const handleReset = () => {
    setIsRunning(true);
    setFlowSpeed(80);
    setActiveFormIdx(0);
    sprayRef.current = [];
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
    let turbineAngle = 0;

    const render = () => {
      if (isRunning) {
        time += 0.03;
        turbineAngle += (flowSpeed / 100) * 0.12;
      }
      ctx.clearRect(0, 0, 880, 560);

      // 1. BACKGROUND: MOUNTAIN HYDRO STATION
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 300);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.7, '#1e293b');
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 880, 560);

      // Distant Himalayan Peak in background
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, 220);
      ctx.lineTo(120, 60);
      ctx.lineTo(260, 220);
      ctx.closePath();
      ctx.fill();

      // Snow on Peak
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(120, 60);
      ctx.lineTo(155, 110);
      ctx.lineTo(135, 105);
      ctx.lineTo(120, 120);
      ctx.lineTo(95, 105);
      ctx.closePath();
      ctx.fill();

      // Hillside slope supporting the penstock
      ctx.fillStyle = '#1e3a1e';
      ctx.beginPath();
      ctx.moveTo(0, 160);
      ctx.lineTo(340, 390);
      ctx.lineTo(340, 560);
      ctx.lineTo(0, 560);
      ctx.closePath();
      ctx.fill();

      // Concrete Powerhouse structure
      ctx.fillStyle = '#334155';
      ctx.fillRect(320, 310, 260, 210);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.strokeRect(320, 310, 260, 210);

      // Tailrace water outlet channel at base
      const tailGrad = ctx.createLinearGradient(320, 480, 580, 560);
      tailGrad.addColorStop(0, '#0284c7');
      tailGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = tailGrad;
      ctx.fillRect(320, 480, 260, 40);

      // 2. HIGH ALTITUDE DAM RESERVOIR (Top Left, x: 20, y: 120)
      drawDamReservoir(ctx, 20, 100, 120, 80, isRunning, time);

      // 3. STEEL PENSTOCK PIPE (Downhill to powerhouse)
      drawPenstockPipe(ctx, 130, 150, 340, 380, flowSpeed, isRunning, time);

      // 4. SPEAR NOZZLE & WATER JET
      drawSpearNozzleAndJet(ctx, 340, 380, flowSpeed, isRunning, time);

      // 5. PELTON TURBINE RUNNER WHEEL (Mechanical Energy)
      const runnerX = 410;
      const runnerY = 380;
      drawPeltonTurbine(ctx, runnerX, runnerY, turbineAngle, flowSpeed, isRunning);

      // 6. GENERATOR / DYNAMO (Electrical Energy)
      const dynamoX = 520;
      const dynamoY = 380;
      drawDynamo(ctx, dynamoX, dynamoY, turbineAngle, flowSpeed, isRunning);

      // Connecting Shaft from Turbine to Dynamo
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(runnerX, runnerY);
      ctx.lineTo(dynamoX, dynamoY);
      ctx.stroke();

      // 7. TRANSMISSION WIRES WITH GLOWING ELECTRONS
      drawTransmissionWires(ctx, dynamoX, dynamoY - 25, 710, 260, flowSpeed, isRunning, time);

      // 8. GLOWING INCANDESCENT BULB & VILLAGE HOME (Light & Heat Energy)
      drawLightBulbAndHome(ctx, 720, 280, flowSpeed, isRunning, time);

      // 9. ENERGY FLOW PIPELINE HUD (Bottom)
      drawEnergyTransformationPipeline(ctx, flowSpeed, isRunning, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, flowSpeed, activeFormIdx, lang]);

  // Dam Reservoir
  function drawDamReservoir(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    running: boolean,
    t: number
  ) {
    ctx.save();
    // Concrete Dam Wall
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + w - 20, y - 10, 20, h + 20);

    // Deep Lake Water (Potential Energy)
    const damGrad = ctx.createLinearGradient(x, y, x, y + h);
    damGrad.addColorStop(0, '#38bdf8');
    damGrad.addColorStop(0.5, '#0ea5e9');
    damGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = damGrad;
    ctx.fillRect(x, y, w - 20, h);

    // Water surface waves
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let wx = x; wx <= x + w - 20; wx += 12) {
      ctx.lineTo(wx, y + Math.sin(t * 3 + wx * 0.1) * 2);
    }
    ctx.stroke();

    // Reservoir Label
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Dam', x + w * 0.5 - 10, y - 18);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '9px system-ui';
    ctx.fillText('Potential Energy', x + w * 0.5 - 10, y - 6);

    ctx.restore();
  }

  // Steel Penstock Pipe
  function drawPenstockPipe(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    speed: number,
    running: boolean,
    t: number
  ) {
    ctx.save();
    // Steel Pipe Body
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Water Flow inside penstock (Kinetic Energy)
    if (running && speed > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 12;
      ctx.setLineDash([16, 12]);
      ctx.lineDashOffset = -t * (speed * 0.8);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Pipe Supports
    ctx.fillStyle = '#64748b';
    [0.3, 0.6, 0.85].forEach((u) => {
      const px = x1 + (x2 - x1) * u;
      const py = y1 + (y2 - y1) * u;
      ctx.fillRect(px - 4, py, 8, 30);
    });

    ctx.restore();
  }

  // Spear Nozzle & High-Velocity Jet
  function drawSpearNozzleAndJet(
    ctx: CanvasRenderingContext2D,
    nx: number,
    ny: number,
    speed: number,
    running: boolean,
    t: number
  ) {
    ctx.save();
    // Tapered Nozzle
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(nx - 15, ny - 10);
    ctx.lineTo(nx + 10, ny - 4);
    ctx.lineTo(nx + 10, ny + 4);
    ctx.lineTo(nx - 15, ny + 10);
    ctx.closePath();
    ctx.fill();

    // High velocity water jet shooting into runner
    if (running && speed > 0) {
      const jetLen = 50;
      const jetGrad = ctx.createLinearGradient(nx + 10, ny, nx + 10 + jetLen, ny);
      jetGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      jetGrad.addColorStop(0.3, '#38bdf8');
      jetGrad.addColorStop(1, 'rgba(14, 165, 233, 0.8)');
      ctx.fillStyle = jetGrad;

      ctx.beginPath();
      ctx.moveTo(nx + 10, ny - 3);
      ctx.lineTo(nx + 10 + jetLen, ny - 6);
      ctx.lineTo(nx + 10 + jetLen, ny + 6);
      ctx.lineTo(nx + 10, ny + 3);
      ctx.closePath();
      ctx.fill();

      // Water spray particles splashing off Pelton cups
      if (Math.random() < 0.6) {
        sprayRef.current.push({
          x: nx + 10 + jetLen,
          y: ny,
          vx: (Math.random() - 0.2) * 5,
          vy: (Math.random() - 0.5) * 6,
          alpha: 0.9,
          r: 2 + Math.random() * 2,
        });
      }
    }

    // Update and draw spray particles
    const nextSpray: SprayParticle[] = [];
    ctx.fillStyle = '#bae6fd';
    sprayRef.current.forEach((sp) => {
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy += 0.2; // gravity into tailrace
      sp.alpha -= 0.04;

      if (sp.alpha > 0) {
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fill();
        nextSpray.push(sp);
      }
    });
    sprayRef.current = nextSpray;

    ctx.restore();
  }

  // Pelton Runner Wheel (Mechanical Rotation)
  function drawPeltonTurbine(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    angle: number,
    speed: number,
    running: boolean
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Runner Disc
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 10 Pelton Double-Spoon Buckets
    const numBuckets = 10;
    for (let i = 0; i < numBuckets; i++) {
      const bAngle = (i / numBuckets) * Math.PI * 2;
      ctx.save();
      ctx.rotate(bAngle);

      // Bucket spoon cup
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(42, 0, 10, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }

    // Center hub & bolt ring
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Label
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pelton Turbine', cx, cy - 55);
    ctx.fillStyle = '#4ade80';
    ctx.font = '9px system-ui';
    ctx.fillText('Mechanical Energy', cx, cy - 43);
  }

  // Dynamo / Generator (Electrical Energy)
  function drawDynamo(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    angle: number,
    speed: number,
    running: boolean
  ) {
    ctx.save();
    // Generator Outer Casing
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Copper Coils surrounding stator
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 5;
    for (let c = 0; c < 6; c++) {
      const ca = (c / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ca) * 28, cy + Math.sin(ca) * 28, 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Rotating Armature Magnet in center
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // North Pole (Red)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-6, -18, 12, 18);
    // South Pole (Blue)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-6, 0, 12, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, -6);
    ctx.fillText('S', 0, 12);
    ctx.restore();

    // Label
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Generator', cx, cy - 55);
    ctx.fillStyle = '#60a5fa';
    ctx.font = '9px system-ui';
    ctx.fillText('Electrical Energy', cx, cy - 43);

    ctx.restore();
  }

  // Transmission Wires with Glowing Electron Flow
  function drawTransmissionWires(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    speed: number,
    running: boolean,
    t: number
  ) {
    ctx.save();
    // Black electrical wire
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) * 0.5, y1 - 40, x2, y2);
    ctx.stroke();

    // Pulsating glowing electrical sparks
    if (running && speed > 0) {
      const sparkCount = 8;
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;

      for (let s = 0; s < sparkCount; s++) {
        const u = ((t * (speed * 0.02) + s / sparkCount) % 1);
        const bx = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * ((x1 + x2) * 0.5) + u * u * x2;
        const by = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * (y1 - 40) + u * u * y2;

        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Incandescent Light Bulb & Village House (Light & Heat)
  function drawLightBulbAndHome(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    speed: number,
    running: boolean,
    t: number
  ) {
    ctx.save();
    const brightness = running ? speed / 100 : 0;

    // Glowing Radial Light Aura
    if (brightness > 0.05) {
      const glowR = 60 + brightness * 50;
      const glowGrad = ctx.createRadialGradient(x, y, 10, x, y, glowR);
      glowGrad.addColorStop(0, `rgba(254, 240, 138, ${brightness * 0.85})`);
      glowGrad.addColorStop(0.5, `rgba(250, 204, 21, ${brightness * 0.4})`);
      glowGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glass Bulb Shell
    ctx.fillStyle = brightness > 0.2 ? 'rgba(254, 240, 138, 0.9)' : 'rgba(148, 163, 184, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Filament inside bulb
    ctx.strokeStyle = brightness > 0 ? '#ef4444' : '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 8);
    ctx.lineTo(x - 4, y - 6);
    ctx.lineTo(x + 4, y - 6);
    ctx.lineTo(x + 8, y + 8);
    ctx.stroke();

    // Screw base of bulb
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x - 10, y + 20, 20, 14);

    // Traditional Nepalese Village House below bulb
    const hx = x - 55;
    const hy = y + 70;
    // House walls
    ctx.fillStyle = '#92400e';
    ctx.fillRect(hx, hy, 110, 80);
    // Sloped red-tile roof
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(hx - 15, hy);
    ctx.lineTo(hx + 55, hy - 40);
    ctx.lineTo(hx + 125, hy);
    ctx.closePath();
    ctx.fill();
    // Glowing window
    ctx.fillStyle = brightness > 0.2 ? '#fef08a' : '#1e293b';
    ctx.fillRect(hx + 20, hy + 25, 24, 24);
    ctx.fillRect(hx + 65, hy + 25, 24, 24);

    // Label
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Bulb & Home', x, y - 35);
    ctx.fillStyle = '#facc15';
    ctx.font = '9px system-ui';
    ctx.fillText('Light & Heat Energy', x, y - 23);

    ctx.restore();
  }

  // Bottom Energy Transformation Pipeline HUD
  function drawEnergyTransformationPipeline(
    ctx: CanvasRenderingContext2D,
    speed: number,
    running: boolean,
    currentLang: Language
  ) {
    ctx.save();
    const px = 40;
    const py = 495;
    const pw = 800;
    const ph = 50;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.roundRect(px, py, pw, ph, 10);
    ctx.fill();
    ctx.stroke();

    const steps = [
      { name: 'स्थितिशक्ति (PE)', col: '#38bdf8' },
      { name: 'गतिशक्ति (KE)', col: '#0ea5e9' },
      { name: 'यान्त्रिक (Mechanical)', col: '#4ade80' },
      { name: 'विद्युत (Electrical)', col: '#60a5fa' },
      { name: 'प्रकाश र ताप (Light/Heat)', col: '#facc15' },
    ];

    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';

    steps.forEach((st, idx) => {
      const sx = px + 80 + idx * 155;
      ctx.fillStyle = st.col;
      ctx.fillText(st.name, sx, py + 28);

      // Arrow between steps
      if (idx < steps.length - 1) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('➔', sx + 75, py + 28);
      }
    });

    ctx.restore();
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'mechanical_to_electrical') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! The generator converts mechanical rotation into electrical energy.' : 'सबास! जेनेरेटरले यान्त्रिक ऊर्जालाई विद्युत ऊर्जामा बदल्छ।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. Think about what spins inside the dynamo.' : 'मिलेन। टर्बाइनको यान्त्रिक घुमाइबाट विद्युत बन्दछ।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Energy Forms & Transformation' : 'ऊर्जाका रूपहरू र रूपान्तरण (Energy Transformation)'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 7: Energy'
          : 'कक्षा 4 विज्ञान • एकाइ 7: ऊर्जा'
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

          {/* Live Generation Badge */}
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
              <Zap size={14} className="text-amber-400" />
              <span>
                {lang === 'en'
                  ? `Turbine: ${Math.round(flowSpeed * 12.5)} kW Clean Hydro Electricity`
                  : `उत्पादित विद्युत: ${Math.round(flowSpeed * 12.5)} किलोवाट जलविद्युत`}
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
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                ⚡
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {energyStages[activeFormIdx] ? (lang === 'en' ? energyStages[activeFormIdx].nameEn : energyStages[activeFormIdx].nameNe) : 'Hydroelectric Plant'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {energyStages[activeFormIdx] ? (lang === 'en' ? energyStages[activeFormIdx].descEn : energyStages[activeFormIdx].descNe) : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Flow Rate' : 'बहाव दर'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                  {flowSpeed}%
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Power Output' : 'विद्युत उत्पादन'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#facc15' }}>
                  {Math.round(flowSpeed * 12.5)} kW
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
              <span style={{ fontSize: '16px' }}>⚡</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Energy Transformation Station' : 'ऊर्जा रूपान्तरण अनुसन्धान केन्द्र'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Law of Conservation of Energy: Energy cannot be created or destroyed, only transformed from potential to kinetic and electrical energy.'
                : 'ऊर्जा संरक्षणको नियम: ऊर्जा न त बनाउन सकिन्छ न नष्ट नै, केवल स्थिति शक्तिबाट गति शक्ति र विद्युत शक्तिमा बदलिन्छ।'}
            </p>
          </div>

          {/* 2. Flow Valve Slider & Controls */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#38bdf8' }}>
                <Sliders size={14} />
                <span>{lang === 'en' ? 'Water Flow Valve' : 'पानीको बहाव नियन्त्रण'}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8' }}>
                {flowSpeed}%
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={flowSpeed}
              onChange={(e) => setFlowSpeed(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#38bdf8',
                cursor: 'pointer',
              }}
            />

            <button
              onClick={handleToggleRunning}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: isRunning ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                border: `1px solid ${isRunning ? '#f59e0b' : '#38bdf8'}`,
                color: isRunning ? '#facc15' : '#38bdf8',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              <span>{isRunning ? (lang === 'en' ? 'Pause Turbine' : 'टर्बाइन रोक्नुहोस्') : (lang === 'en' ? 'Start Turbine' : 'टर्बाइन चलाउनुहोस्')}</span>
            </button>
          </div>

          {/* 3. Energy Transformation Steps */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Transformation Steps' : 'ऊर्जा रूपान्तरणका चरणहरू'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {energyStages.map((st, idx) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setActiveFormIdx(idx);
                    ScienceAudio.playPop();
                  }}
                  style={{
                    background: activeFormIdx === idx ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activeFormIdx === idx ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '8px',
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '700', color: activeFormIdx === idx ? '#38bdf8' : '#e2e8f0' }}>
                    {lang === 'en' ? st.nameEn : st.nameNe}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {lang === 'en' ? st.descEn : st.descNe}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Concept Check Quiz */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              {lang === 'en' ? 'Transformation Quiz' : 'रूपान्तरण प्रश्न'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'What energy conversion occurs inside the electric generator / dynamo?'
                : 'विद्युत जेनेरेटर (डाइनामो) भित्र कुन ऊर्जा कुन ऊर्जामा रूपान्तरण हुन्छ?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleQuizAnswer('light_to_heat')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {lang === 'en' ? 'Light → Heat' : 'प्रकाश → ताप'}
              </button>

              <button
                onClick={() => handleQuizAnswer('mechanical_to_electrical')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {lang === 'en' ? 'Mechanical → Electric' : 'यान्त्रिक → विद्युत'}
              </button>
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
                ? 'Hydropower uses gravitational potential energy stored in dam reservoirs to generate clean electricity without burning fossil fuels.'
                : 'जलविद्युतले बाँधमा जम्मा भएको पानीको स्थिति शक्तिलाई यान्त्रिक र त्यसपछि स्वच्छ विद्युत शक्तिमा बदल्छ।'}
            </p>
          </div>

          {/* 6. Complete Energy Forms Lab Button */}
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
            <span>{lang === 'en' ? 'Complete Energy Forms Lab & Quiz' : 'ऊर्जा प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
