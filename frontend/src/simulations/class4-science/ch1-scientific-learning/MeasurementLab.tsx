/**
 * MeasurementLab.tsx
 * Simulation 3: 2D Measurement Laboratory
 * Grade 4 Science • Chapter 1: Scientific Learning
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - 3 Dedicated Interactive Scientific Measurement Instruments:
 *   1. Dual-Pan Beam Balance: Central pivot needle, left mystery mass, right addable weights,
 *      physics equilibrium tilt calculation.
 *   2. Graduated Cylinder: Transparent borosilicate glass, liquid volume in ml,
 *      meniscus curve, and water displacement volume of an irregular stone (V2 - V1 = V_stone).
 *   3. Precision Metric Ruler: Standard 0-30cm ruler measuring pencil, eraser, and key.
 * - Bilingual EN/NE, tactile sounds, and curriculum mastery challenge.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Scale, Ruler, Cylinder, RotateCcw, Plus, Minus, Check, Sparkles } from 'lucide-react';

type ToolMode = 'mass' | 'volume' | 'length';

export const MeasurementLab: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [mode, setMode] = useState<ToolMode>('mass');

  // 1. Mass State (Beam Balance)
  const [leftMass, setLeftMass] = useState<number>(70); // Mystery apple: 70g
  const [rightMass, setRightMass] = useState<number>(0); // Added weights

  // 2. Volume State (Cylinder)
  const [liquidMl, setLiquidMl] = useState<number>(40); // 0 to 100 ml
  const [hasStoneInCylinder, setHasStoneInCylinder] = useState<boolean>(false); // stone = +25ml

  // 3. Length State (Ruler)
  const [selectedItem, setSelectedItem] = useState<'pencil' | 'eraser' | 'key'>('pencil');

  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const totalRightWeights = rightMass;
  const balanceTilt = Math.max(-15, Math.min(15, (rightMass - leftMass) * 0.2));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const handleAddWeight = (wt: number) => {
    const next = rightMass + wt;
    setRightMass(next);
    ScienceAudio.playPop();
    if (next === leftMass) {
      ScienceAudio.playSuccess();
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    }
  };

  const handleClearWeights = () => {
    setRightMass(0);
    ScienceAudio.playWhoosh();
  };

  const handleToggleStone = () => {
    setHasStoneInCylinder(!hasStoneInCylinder);
    ScienceAudio.playWaterDrop();
  };

  const handleReset = () => {
    setMode('mass');
    setLeftMass(70);
    setRightMass(0);
    setLiquidMl(40);
    setHasStoneInCylinder(false);
    setSelectedItem('pencil');
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
      bg.addColorStop(1, '#ffffff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 880, 560);

      // Lab counter bench surface
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 480, 880, 80);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.lineTo(880, 480);
      ctx.stroke();

      // Render Active Tool Mode
      if (mode === 'mass') {
        renderBeamBalance(ctx, 440, 360, leftMass, rightMass, time, lang);
      } else if (mode === 'volume') {
        renderGraduatedCylinder(ctx, 440, 240, liquidMl, hasStoneInCylinder, time, lang);
      } else {
        renderMetricRuler(ctx, 440, 270, selectedItem, lang);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, leftMass, rightMass, liquidMl, hasStoneInCylinder, selectedItem, lang]);

  // TOOL 1: DUAL-PAN BEAM BALANCE
  function renderBeamBalance(
    ctx: CanvasRenderingContext2D,
    cx: number,
    baseY: number,
    leftW: number,
    rightW: number,
    t: number,
    currentLang: Language
  ) {
    ctx.save();
    // Central Pillar Stand
    ctx.fillStyle = '#ca8a04'; // Polished Brass
    ctx.fillRect(cx - 10, baseY - 180, 20, 180);

    // Heavy base plate
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(cx, baseY, 90, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pivot Fulcrum & Pointer Dial
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, baseY - 180, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Beam Tilt Angle calculation (clamp between -0.22 and +0.22 rad)
    const diff = rightW - leftW; // positive = right is heavier
    const tilt = Math.max(-0.2, Math.min(0.2, diff * 0.005));
    const armLen = 160;

    // Moving Beam
    ctx.save();
    ctx.translate(cx, baseY - 180);
    ctx.rotate(tilt);

    // Horizontal Brass Beam
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-armLen, -5, armLen * 2, 10);

    // Central Needle Pointer
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 36);
    ctx.stroke();

    // Left Pan Suspension
    const leftHookX = -armLen + 10;
    const rightHookX = armLen - 10;
    ctx.restore();

    // Calculate Pan Coordinates based on tilt
    const lpx = cx - Math.cos(tilt) * (armLen - 10);
    const lpy = (baseY - 180) - Math.sin(tilt) * (armLen - 10) + 110;

    const rpx = cx + Math.cos(tilt) * (armLen - 10);
    const rpy = (baseY - 180) + Math.sin(tilt) * (armLen - 10) + 110;

    // Draw Left Suspension Chains & Pan
    drawHangingPan(ctx, cx - Math.cos(tilt) * (armLen - 10), (baseY - 180) - Math.sin(tilt) * (armLen - 10), lpx, lpy);
    // Draw Right Suspension Chains & Pan
    drawHangingPan(ctx, cx + Math.cos(tilt) * (armLen - 10), (baseY - 180) + Math.sin(tilt) * (armLen - 10), rpx, rpy);

    // Draw Left Mystery Mass (Red Apple on pan)
    drawApple(ctx, lpx, lpy - 16);

    // Draw Right Added Weights (Brass Dhak on pan)
    drawAddedWeights(ctx, rpx, lpy, rightW);

    // Balanced Status Indicator
    const isBalanced = leftW === rightW;
    ctx.fillStyle = isBalanced ? '#4ade80' : '#f87171';
    ctx.font = 'bold 15px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(
      isBalanced
        ? currentLang === 'en' ? '⚖️ EQUILIBRIUM BALANCED!' : '⚖️ सन्तुलन मिल्यो!'
        : diff < 0
        ? currentLang === 'en' ? 'Left is heavier' : 'बायाँ पल्ला गह्रौं छ'
        : currentLang === 'en' ? 'Right is heavier' : 'दायाँ पल्ला गह्रौं छ',
      cx,
      baseY - 225
    );

    ctx.restore();
  }

  function drawHangingPan(ctx: CanvasRenderingContext2D, hx: number, hy: number, px: number, py: number) {
    ctx.save();
    // 3 Fine Suspension Strings
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(px - 45, py);
    ctx.moveTo(hx, hy);
    ctx.lineTo(px, py + 4);
    ctx.moveTo(hx, hy);
    ctx.lineTo(px + 45, py);
    ctx.stroke();

    // Curved Brass Pan
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.ellipse(px, py + 4, 50, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawApple(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    // Red Apple
    const appGrad = ctx.createRadialGradient(x - 5, y - 5, 4, x, y, 22);
    appGrad.addColorStop(0, '#f87171');
    appGrad.addColorStop(0.6, '#ef4444');
    appGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = appGrad;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Stem & Leaf
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.quadraticCurveTo(x + 5, y - 28, x + 8, y - 30);
    ctx.stroke();

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(x + 9, y - 28, 6, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Mystery Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Apple (?)', x, y + 4);
    ctx.restore();
  }

  function drawAddedWeights(ctx: CanvasRenderingContext2D, x: number, y: number, totalW: number) {
    ctx.save();
    if (totalW === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('(Empty Pan)', x, y - 10);
      ctx.restore();
      return;
    }

    // Cylindrical Brass Dhak weights
    ctx.fillStyle = '#ca8a04';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;

    ctx.fillRect(x - 20, y - 22, 40, 22);
    ctx.strokeRect(x - 20, y - 22, 40, 22);

    // Knob on weight
    ctx.beginPath();
    ctx.arc(x, y - 26, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Weight label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${totalW}g`, x, y - 7);
    ctx.restore();
  }

  // TOOL 2: GRADUATED CYLINDER
  function renderGraduatedCylinder(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    vol: number,
    stone: boolean,
    t: number,
    currentLang: Language
  ) {
    ctx.save();
    const w = 70;
    const h = 260;
    const x = cx - w * 0.5;
    const y = cy - 40;

    // Heavy hexagonal base
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(cx - 65, y + h, 130, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Effective Volume (adds 25ml if stone dropped inside)
    const effectiveVol = stone ? vol + 25 : vol;

    // Blue liquid level
    const fillH = (h - 20) * (effectiveVol / 100);
    const waterTop = y + h - fillH;

    const waterGrad = ctx.createLinearGradient(0, waterTop, 0, y + h);
    waterGrad.addColorStop(0, '#38bdf8');
    waterGrad.addColorStop(0.5, '#0ea5e9');
    waterGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = waterGrad;

    ctx.save();
    ctx.fillRect(x + 3, waterTop, w - 6, fillH);

    // Meniscus curve at liquid surface
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, waterTop, (w - 8) * 0.5, 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    // If stone inside, draw grey stone immersed at bottom
    if (stone) {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(cx, y + h - 25, 18, 14, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Stone label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Stone', cx, y + h - 22);
    }
    ctx.restore();

    // Transparent Glass Cylinder Wall
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(x, y, w, h);

    // Spout lip at top left
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x, y + 8);
    ctx.stroke();

    // Graduation Marks (0 to 100 ml)
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;

    for (let ml = 0; ml <= 100; ml += 10) {
      const my = y + h - (h - 20) * (ml / 100);
      ctx.beginPath();
      ctx.moveTo(x + w, my);
      ctx.lineTo(x + w - 14, my);
      ctx.stroke();
      ctx.fillText(`${ml} ml`, x + w + 8, my + 3);
    }

    // Displacement Formula Banner
    if (stone) {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.5;
      ctx.roundRect(cx - 160, y - 60, 320, 45, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`Water Displacement: V2 - V1 = 65ml - 40ml = 25 ml`, cx, y - 38);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px system-ui';
      ctx.fillText(`Stone Volume = 25 cm³ (ढुङ्गाको आयतन = 25 घन से.मि.)`, cx, y - 22);
    }

    ctx.restore();
  }

  // TOOL 3: PRECISION METRIC RULER
  function renderMetricRuler(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    item: 'pencil' | 'eraser' | 'key',
    currentLang: Language
  ) {
    ctx.save();
    const rx = cx - 260;
    const ry = cy + 40;
    const rw = 520; // 0 to 20 cm scale (26 px per cm)
    const rh = 55;

    // Wooden / Acrylic Ruler
    const rulerGrad = ctx.createLinearGradient(0, ry, 0, ry + rh);
    rulerGrad.addColorStop(0, '#fef08a');
    rulerGrad.addColorStop(1, '#fde047');
    ctx.fillStyle = rulerGrad;
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, 6);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Graduation Tick Marks (cm and mm)
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.textAlign = 'center';

    const pxPerCm = 24;
    const totalCm = 20;

    for (let cm = 0; cm <= totalCm; cm++) {
      const markX = rx + 20 + cm * pxPerCm;
      // cm major line
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(markX, ry);
      ctx.lineTo(markX, ry + 22);
      ctx.stroke();

      // cm number
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(`${cm}`, markX, ry + 36);

      // mm minor lines
      if (cm < totalCm) {
        ctx.lineWidth = 1;
        for (let mm = 1; mm < 10; mm++) {
          const mmX = markX + (mm * pxPerCm) / 10;
          const lineH = mm === 5 ? 16 : 9;
          ctx.beginPath();
          ctx.moveTo(mmX, ry);
          ctx.lineTo(mmX, ry + lineH);
          ctx.stroke();
        }
      }
    }

    // Ruler Scale Brand Label
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('METRIC • cm / mm', rx + rw - 15, ry + rh - 8);

    // Draw Tested Object aligned to 0 mark (rx + 20)
    const objStartX = rx + 20;
    const objY = ry - 40;

    let objLengthCm = 0;
    if (item === 'pencil') {
      objLengthCm = 15.0; // 15 cm
      drawPencil(ctx, objStartX, objY, objLengthCm * pxPerCm);
    } else if (item === 'eraser') {
      objLengthCm = 5.0; // 5 cm
      drawEraser(ctx, objStartX, objY, objLengthCm * pxPerCm);
    } else {
      objLengthCm = 8.5; // 8.5 cm
      drawKey(ctx, objStartX, objY, objLengthCm * pxPerCm);
    }

    // Measurement Measurement Callout Tag
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.roundRect(cx - 100, cy - 120, 200, 48, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Length = ${objLengthCm} cm`, cx, cy - 98);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px system-ui';
    ctx.fillText(`(${objLengthCm * 10} mm • लम्बाइ)`, cx, cy - 82);

    ctx.restore();
  }

  function drawPencil(ctx: CanvasRenderingContext2D, x: number, y: number, lenPx: number) {
    ctx.save();
    // Yellow hexagonal pencil body
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x, y - 8, lenPx - 25, 16);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - 8, lenPx - 25, 16);

    // Sharpened wooden cone tip
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.moveTo(x + lenPx - 25, y - 8);
    ctx.lineTo(x + lenPx, y);
    ctx.lineTo(x + lenPx - 25, y + 8);
    ctx.closePath();
    ctx.fill();

    // Graphite lead tip
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(x + lenPx - 8, y - 2.5);
    ctx.lineTo(x + lenPx, y);
    ctx.lineTo(x + lenPx - 8, y + 2.5);
    ctx.closePath();
    ctx.fill();

    // Pink Eraser back
    ctx.fillStyle = '#f472b6';
    ctx.roundRect(x - 14, y - 8, 14, 16, [4, 0, 0, 4]);
    ctx.fill();
    ctx.restore();
  }

  function drawEraser(ctx: CanvasRenderingContext2D, x: number, y: number, lenPx: number) {
    ctx.save();
    // Blue/White eraser block
    ctx.fillStyle = '#38bdf8';
    ctx.roundRect(x, y - 12, lenPx, 24, 4);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ERASER', x + lenPx * 0.5, y + 4);
    ctx.restore();
  }

  function drawKey(ctx: CanvasRenderingContext2D, x: number, y: number, lenPx: number) {
    ctx.save();
    // Golden brass key
    ctx.fillStyle = '#ca8a04';
    // Ring handle
    ctx.beginPath();
    ctx.arc(x + 12, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 12, y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Key blade
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 22, y - 3, lenPx - 22, 6);
    // Key teeth
    ctx.fillRect(x + lenPx - 16, y + 3, 5, 8);
    ctx.fillRect(x + lenPx - 6, y + 3, 6, 10);
    ctx.restore();
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'balance') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! A beam balance scale measures mass in grams/kilograms.' : 'सबास! वस्तुको पिण्ड (Mass) नाप्न तराजु प्रयोग गरिन्छ।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. A ruler measures length, a balance measures mass.' : 'मिलेन। पिण्ड नाप्न तराजु र ढक प्रयोग गरिन्छ।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Measurement Laboratory' : 'नाप तथा तौल प्रयोगशाला (Measurement Lab)'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 1: Scientific Learning'
          : 'कक्षा 4 विज्ञान • एकाइ 1: वैज्ञानिक सिकाइ'
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
            LEFT COLUMN: INTERACTIVE 2D MEASUREMENT VIEWPORT
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
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
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
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#fbbf24',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Scale size={13} />
              {mode === 'mass'
                ? (lang === 'en' ? `Balance Weights: ${totalRightWeights}g` : `दायाँ पल्ला: ${totalRightWeights} ग्राम`)
                : mode === 'volume'
                ? (lang === 'en' ? `Liquid Level: ${hasStoneInCylinder ? '75 ml' : '50 ml'}` : `आयतन: ${hasStoneInCylinder ? '75 ml' : '50 ml'}`)
                : (lang === 'en' ? `Object: ${selectedItem}` : `वस्तु: ${selectedItem}`)}
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
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {mode === 'mass' ? '⚖️' : mode === 'volume' ? '🧪' : '📏'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {mode === 'mass'
                    ? (lang === 'en' ? `Beam Balance Tilt: ${balanceTilt.toFixed(1)}°` : `तराजु सन्तुलन अवस्था`)
                    : mode === 'volume'
                    ? (lang === 'en' ? `Displaced Stone Volume = 25 ml (cm³)` : `ढुङ्गाको आयतन = 25 मिलिलिटर`)
                    : (lang === 'en' ? `Length Measurement via Metric Ruler` : `स्केलबाट लम्बाइ मापन`)}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {mode === 'mass'
                    ? (lang === 'en' ? `Left Unknown Pan: 80g | Right Weights Pan: ${totalRightWeights}g` : `दायाँ ढक: ${totalRightWeights} ग्राम`)
                    : mode === 'volume'
                    ? (lang === 'en' ? `V_solid = V2 (Final) - V1 (Initial) = 75ml - 50ml = 25ml` : `ठोसको आयतन = अन्तिम आयतन - सुरुवाती आयतन = 25 मिलिलिटर`)
                    : (lang === 'en' ? `Read direct mm/cm markings aligned with object edges` : `वस्तुको छेउ सिधा राखी सेन्टिमिटर र मिलिमिटर हेर्नुहोस्`)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleReset}
                title="Reset Measurement Lab"
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
            RIGHT COLUMN: MEASUREMENT LAB WORKSPACE & CONTROLS (380px)
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
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(180, 83, 9, 0.05) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#fbbf24" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24' }}>
                {lang === 'ne' ? 'नाप तथा तौल अनुसन्धान केन्द्र' : 'Precision Measurement Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              {lang === 'ne'
                ? 'पिण्ड नाप्न तराजु (ग्राम/किग्रा), आयतन नाप्न सिलिन्डर (मिलिलिटर), र लम्बाइ नाप्न स्केल (सेमी) प्रयोग गरिन्छ।'
                : 'Standard instruments determine mass in grams/kg, liquid volume in milliliters, and length in centimeters with precision.'}
            </div>
          </div>

          {/* Instrument Mode Tabs */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
              {lang === 'en' ? 'SELECT INSTRUMENT' : 'नाप्ने यन्त्र छान्नुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[
                { id: 'mass', labelEn: 'Balance', labelNe: 'तराजु', icon: '⚖️' },
                { id: 'volume', labelEn: 'Cylinder', labelNe: 'सिलिन्डर', icon: '🧪' },
                { id: 'length', labelEn: 'Ruler', labelNe: 'स्केल', icon: '📏' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setMode(item.id as ToolMode);
                    ScienceAudio.playPop();
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                    border: mode === item.id ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                    background: mode === item.id ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: '#fff',
                  }}
                >
                  <div style={{ fontSize: '16px' }}>{item.icon}</div>
                  <div style={{ marginTop: '2px' }}>{lang === 'en' ? item.labelEn : item.labelNe}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode-Specific Interaction Controls */}
          {mode === 'mass' && (
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}>
                {lang === 'en' ? 'ADD STANDARD WEIGHTS' : 'दायाँ पल्लामा ढक थप्नुहोस्'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[10, 20, 50, 100].map((wt) => (
                  <button
                    key={wt}
                    onClick={() => handleAddWeight(wt)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#f59e0b',
                      color: '#0f172a',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    +{wt}g
                  </button>
                ))}
              </div>
              <button
                onClick={handleClearWeights}
                style={{
                  marginTop: '4px',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {lang === 'en' ? 'Clear All Weights' : 'सबै ढक हटाउनुहोस्'}
              </button>
            </div>
          )}

          {mode === 'volume' && (
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>
                {lang === 'en' ? 'WATER DISPLACEMENT EXPERIMENT' : 'पानी विस्थापन विधि'}
              </div>
              <button
                onClick={handleToggleStone}
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
                }}
              >
                {hasStoneInCylinder
                  ? (lang === 'en' ? '🪨 Remove Stone from Cylinder' : '🪨 ढुङ्गा बाहिर निकाल्नुहोस्')
                  : (lang === 'en' ? '🪨 Drop Stone into Water (+25ml)' : '🪨 ढुङ्गा पानीमा खसाल्नुहोस्')}
              </button>
            </div>
          )}

          {mode === 'length' && (
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24' }}>
                {lang === 'en' ? 'CHOOSE OBJECT TO MEASURE' : 'नाप्ने वस्तु रोज्नुहोस्'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {[
                  { id: 'pencil', label: 'Pencil' },
                  { id: 'eraser', label: 'Eraser' },
                  { id: 'key', label: 'Key' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item.id as 'pencil' | 'eraser' | 'key');
                      ScienceAudio.playPop();
                    }}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: selectedItem === item.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                      background: selectedItem === item.id ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                      color: '#fff',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Measurement Challenge Quiz */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
              {lang === 'en' ? 'Measurement Knowledge Quiz' : 'नाप सम्बन्धी प्रश्न'}
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 8px 0', lineHeight: 1.4 }}>
              {lang === 'en'
                ? 'Which instrument is used to determine the mass of an object in kilograms or grams?'
                : 'वस्तुको पिण्ड (Mass) किलोग्राम वा ग्राममा नाप्न कुन यन्त्र प्रयोग गरिन्छ?'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => handleQuizAnswer('ruler')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {lang === 'en' ? 'Ruler' : 'स्केल'}
              </button>
              <button
                onClick={() => handleQuizAnswer('balance')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {lang === 'en' ? 'Beam Balance' : 'तराजु'}
              </button>
            </div>
            {quizFeedback && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: quizFeedback.includes('✓') || quizFeedback.includes('Correct') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: quizFeedback.includes('✓') || quizFeedback.includes('Correct') ? '#4ade80' : '#f87171',
                  fontSize: '11px',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {quizFeedback}
              </div>
            )}
          </div>

          {/* Curriculum Key Takeaway */}
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24', marginBottom: '4px' }}>
              {lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रम मुख्य निष्कर्ष'}
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              {lang === 'en'
                ? 'Mass is measured in grams/kilograms using a beam balance. Liquid and irregular solid volumes are determined using a graduated cylinder via displacement.'
                : 'पिण्ड तराजुको मद्दतले ग्राम वा किलोग्राममा नापिन्छ। तरल र अनियमित आकारका ठोस वस्तुको आयतन नाप्ने सिलिन्डरबाट पत्ता लगाइन्छ।'}
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
            {lang === 'en' ? '✓ Complete Measurement Lab & Quiz' : '✓ नाप प्रयोगशाला पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
