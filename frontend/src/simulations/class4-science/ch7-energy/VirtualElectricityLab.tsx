/**
 * VirtualElectricityLab.tsx
 * Simulation 26: 2D Virtual Electricity Circuit Laboratory (विद्युत परिपथ प्रयोगशाला)
 * Grade 4 Science • Chapter 7: Energy (ऊर्जा)
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - Complete breadboard / test bench electric circuit:
 *   1. Dry Cell Battery pack (1.5V, 3.0V, 4.5V series cells) with brass terminals
 *   2. Single-Pole Knife Switch (चिम्टीदार स्विच) with flip animation & click sound
 *   3. Porcelain Holder Filament Bulb with dynamic voltage-proportional glow & aura
 *   4. Heavy insulated copper wires with animated circulating electron particles (drift velocity)
 *   5. Material Conductor vs. Insulator tester: Iron nail, Plastic ruler, Copper coin, Eraser
 * - Open vs. Closed circuit indicators, Bilingual EN/NE, and Mastery Quiz.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Zap, RotateCcw, Sparkles, Power, Sliders, Check, Info } from 'lucide-react';

type TestMaterial = 'wire' | 'nail' | 'plastic' | 'wood';

export const VirtualElectricityLab: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [isSwitchClosed, setIsSwitchClosed] = useState<boolean>(false);
  const [voltage, setVoltage] = useState<number>(3.0); // 1.5V, 3.0V, 4.5V
  const [testMaterial, setTestMaterial] = useState<TestMaterial>('wire');
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const isConductor = testMaterial === 'wire' || testMaterial === 'nail';
  const isCircuitComplete = isSwitchClosed && isConductor;

  const testMaterialConfig = {
    wire: { nameEn: 'Copper Wire', nameNe: 'तामाको तार', conductor: true },
    nail: { nameEn: 'Iron Nail', nameNe: 'फलामको किला', conductor: true },
    plastic: { nameEn: 'Plastic Ruler', nameNe: 'प्लास्टिकको स्केल', conductor: false },
    wood: { nameEn: 'Dry Wooden Stick', nameNe: 'सुकेको काठ', conductor: false },
  }[testMaterial];

  const handleToggleSwitch = () => {
    const nextState = !isSwitchClosed;
    setIsSwitchClosed(nextState);
    if (nextState) {
      ScienceAudio.playPop();
      if (isConductor) {
        setStars(3);
        setIsCompleted(true);
      }
    } else {
      ScienceAudio.playWhoosh();
    }
  };

  const handleReset = () => {
    setIsSwitchClosed(false);
    setVoltage(3.0);
    setTestMaterial('wire');
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

      // 1. LAB WORKBENCH BACKGROUND (Engineering Grid Pattern)
      const bg = ctx.createLinearGradient(0, 0, 0, 560);
      bg.addColorStop(0, '#f8fafc');
      bg.addColorStop(0.7, '#f1f5f9');
      bg.addColorStop(1, '#ffffff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 880, 560);

      // Graph paper grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 880; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 560);
        ctx.stroke();
      }
      for (let y = 0; y < 560; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(880, y);
        ctx.stroke();
      }

      // Wooden breadboard mounting base in center
      const boardX = 80;
      const boardY = 70;
      const boardW = 720;
      const boardH = 410;

      const boardGrad = ctx.createLinearGradient(boardX, boardY, boardX, boardY + boardH);
      boardGrad.addColorStop(0, '#1e293b');
      boardGrad.addColorStop(0.5, '#0f172a');
      boardGrad.addColorStop(1, '#020617');
      ctx.fillStyle = boardGrad;
      ctx.beginPath();
      ctx.roundRect(boardX, boardY, boardW, boardH, 16);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Screw brass corners on board
      ctx.fillStyle = '#ca8a04';
      [
        { sx: boardX + 16, sy: boardY + 16 },
        { sx: boardX + boardW - 16, sy: boardY + 16 },
        { sx: boardX + 16, sy: boardY + boardH - 16 },
        { sx: boardX + boardW - 16, sy: boardY + boardH - 16 },
      ].forEach((scr) => {
        ctx.beginPath();
        ctx.arc(scr.sx, scr.sy, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. CIRCUIT COMPONENTS POSITIONS:
      // Battery: Bottom Center (x: 360, y: 360)
      // Switch: Left (x: 180, y: 220)
      // Conductor Test Gap: Top (x: 440, y: 130)
      // Bulb: Right (x: 650, y: 220)

      const batteryPos = { x: 440, y: 390 };
      const switchPos = { x: 200, y: 250 };
      const testGapPos = { x: 440, y: 130 };
      const bulbPos = { x: 670, y: 250 };

      // 3. DRAW CONNECTING COPPER WIRES
      drawCircuitWires(
        ctx,
        batteryPos,
        switchPos,
        testGapPos,
        bulbPos,
        isCircuitComplete,
        voltage,
        time
      );

      // 4. DRAW BATTERY PACK
      drawBatteryPack(ctx, batteryPos.x, batteryPos.y, voltage);

      // 5. DRAW KNIFE SWITCH
      drawKnifeSwitch(ctx, switchPos.x, switchPos.y, isSwitchClosed);

      // 6. DRAW CONDUCTOR TEST GAP & CURRENT INSERTED OBJECT
      drawTestMaterialGap(ctx, testGapPos.x, testGapPos.y, testMaterial);

      // 7. DRAW FILAMENT BULB
      drawBulb(ctx, bulbPos.x, bulbPos.y, isCircuitComplete, voltage, time);

      // 8. CIRCUIT STATUS HUD OVERLAY
      drawCircuitHUD(ctx, isSwitchClosed, isConductor, isCircuitComplete, voltage, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSwitchClosed, voltage, testMaterial, isCircuitComplete, isConductor, lang]);

  // Circuit Wires and Electron Flow
  function drawCircuitWires(
    ctx: CanvasRenderingContext2D,
    bat: { x: number; y: number },
    sw: { x: number; y: number },
    gap: { x: number; y: number },
    blb: { x: number; y: number },
    complete: boolean,
    v: number,
    t: number
  ) {
    ctx.save();
    // Heavy insulated cable paths
    // Wire 1: Battery (-) to Switch
    ctx.strokeStyle = '#ef4444'; // Red (+) / Blue (-)
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bat.x - 70, bat.y);
    ctx.lineTo(sw.x, bat.y);
    ctx.lineTo(sw.x, sw.y + 35);
    ctx.stroke();

    // Wire 2: Switch to Test Gap
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(sw.x, sw.y - 35);
    ctx.lineTo(sw.x, gap.y);
    ctx.lineTo(gap.x - 60, gap.y);
    ctx.stroke();

    // Wire 3: Test Gap to Bulb
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(gap.x + 60, gap.y);
    ctx.lineTo(blb.x, gap.y);
    ctx.lineTo(blb.x, blb.y - 45);
    ctx.stroke();

    // Wire 4: Bulb to Battery (+)
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(blb.x, blb.y + 45);
    ctx.lineTo(blb.x, bat.y);
    ctx.lineTo(bat.x + 70, bat.y);
    ctx.stroke();

    // Electron Particles circulating when complete
    if (complete) {
      const eSpeed = (v / 1.5) * 1.6;
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;

      const pathPoints = [
        { x: bat.x - 70, y: bat.y },
        { x: sw.x, y: bat.y },
        { x: sw.x, y: gap.y },
        { x: gap.x - 60, y: gap.y },
        { x: gap.x + 60, y: gap.y },
        { x: blb.x, y: gap.y },
        { x: blb.x, y: bat.y },
        { x: bat.x + 70, y: bat.y },
      ];

      // Draw 24 moving electron dots around the loop
      for (let i = 0; i < 22; i++) {
        const loopT = ((t * eSpeed * 0.12 + i / 22) % 1);
        const pt = getPointAlongCircuit(pathPoints, loopT);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function getPointAlongCircuit(pts: { x: number; y: number }[], t: number) {
    const totalSegments = pts.length - 1;
    const scaledT = t * totalSegments;
    const segIdx = Math.min(totalSegments - 1, Math.floor(scaledT));
    const subT = scaledT - segIdx;
    const p0 = pts[segIdx];
    const p1 = pts[segIdx + 1];
    return {
      x: p0.x + (p1.x - p0.x) * subT,
      y: p0.y + (p1.y - p0.y) * subT,
    };
  }

  // Dry Cell Battery Pack
  function drawBatteryPack(ctx: CanvasRenderingContext2D, cx: number, cy: number, v: number) {
    ctx.save();
    const numCells = v === 1.5 ? 1 : v === 3.0 ? 2 : 3;
    const cellW = 44;
    const cellH = 75;
    const startX = cx - (numCells * cellW) * 0.5;

    for (let c = 0; c < numCells; c++) {
      const bx = startX + c * cellW;
      const by = cy - cellH * 0.5;

      // Battery body (blue / black metal casing)
      const batGrad = ctx.createLinearGradient(bx, by, bx + cellW, by);
      batGrad.addColorStop(0, '#1e3a8a');
      batGrad.addColorStop(0.5, '#3b82f6');
      batGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = batGrad;
      ctx.fillRect(bx, by, cellW - 4, cellH);

      // Gold band
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(bx, by + 18, cellW - 4, 10);

      // Positive Brass terminal on top
      ctx.fillStyle = '#eab308';
      ctx.fillRect(bx + cellW * 0.5 - 7, by - 8, 10, 8);

      // + and - signs
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+', bx + cellW * 0.5 - 2, by + 14);
      ctx.fillText('-', bx + cellW * 0.5 - 2, by + cellH - 8);
      ctx.font = '9px system-ui';
      ctx.fillText('1.5V', bx + cellW * 0.5 - 2, by + 46);
    }

    // Battery pack label
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Battery Pack (${v}V)`, cx, cy + 54);

    ctx.restore();
  }

  // Knife Switch
  function drawKnifeSwitch(ctx: CanvasRenderingContext2D, sx: number, sy: number, closed: boolean) {
    ctx.save();
    // Wooden / plastic base
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.roundRect(sx - 26, sy - 40, 52, 80, 8);
    ctx.fill();
    ctx.stroke();

    // Two brass contact terminals
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(sx - 10, sy - 34, 20, 12);
    ctx.fillRect(sx - 10, sy + 22, 20, 12);

    // Knife blade lever
    ctx.save();
    ctx.translate(sx, sy + 25);
    ctx.rotate(closed ? 0 : -0.75); // angled open or snapped closed

    // Copper lever arm
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-4, -60, 8, 60);

    // Insulated plastic handle on top
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(-7, -74, 14, 16, 4);
    ctx.fill();
    ctx.restore();

    // Switch Label
    ctx.fillStyle = closed ? '#4ade80' : '#f87171';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(closed ? 'Switch Closed (बन्द)' : 'Switch Open (खुला)', sx, sy + 58);

    ctx.restore();
  }

  // Test Material Gap
  function drawTestMaterialGap(ctx: CanvasRenderingContext2D, gx: number, gy: number, mat: TestMaterial) {
    ctx.save();
    // Metal alligator clips on each side
    ctx.fillStyle = '#64748b';
    ctx.fillRect(gx - 60, gy - 8, 18, 16);
    ctx.fillRect(gx + 42, gy - 8, 18, 16);

    // Current bridging object
    if (mat === 'wire') {
      // Copper wire bridge
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(gx - 45, gy);
      ctx.lineTo(gx + 45, gy);
      ctx.stroke();
    } else if (mat === 'nail') {
      // Steel Iron Nail
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(gx - 45, gy - 5);
      ctx.lineTo(gx + 40, gy);
      ctx.lineTo(gx - 45, gy + 5);
      ctx.closePath();
      ctx.fill();
      // Nail head
      ctx.fillRect(gx - 48, gy - 8, 6, 16);
    } else if (mat === 'plastic') {
      // Plastic Straw / Ruler
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(gx - 45, gy - 7, 90, 14);
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1;
      ctx.strokeRect(gx - 45, gy - 7, 90, 14);
    } else if (mat === 'wood') {
      // Wooden stick
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(gx - 45, gy - 6, 90, 12, 3);
      ctx.fill();
      // Wood grains
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx - 35, gy);
      ctx.lineTo(gx + 35, gy);
      ctx.stroke();
    }

    // Material tag
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    let matLabel = '';
    if (mat === 'wire') matLabel = 'Copper Wire (सुचालक - Conductor)';
    else if (mat === 'nail') matLabel = 'Iron Nail (सुचालक - Conductor)';
    else if (mat === 'plastic') matLabel = 'Plastic (कुचालक - Insulator)';
    else matLabel = 'Wood (कुचालक - Insulator)';

    ctx.fillText(matLabel, gx, gy - 22);

    ctx.restore();
  }

  // Filament Bulb
  function drawBulb(
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    lit: boolean,
    v: number,
    t: number
  ) {
    ctx.save();
    const brightness = lit ? (v / 4.5) : 0;

    // Golden Light Radiation Aura
    if (brightness > 0) {
      const auraR = 50 + brightness * 60;
      const glowGrad = ctx.createRadialGradient(bx, by, 12, bx, by, auraR);
      glowGrad.addColorStop(0, `rgba(254, 240, 138, ${brightness * 0.95})`);
      glowGrad.addColorStop(0.4, `rgba(250, 204, 21, ${brightness * 0.5})`);
      glowGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(bx, by, auraR, 0, Math.PI * 2);
      ctx.fill();

      // Animated light rays
      ctx.strokeStyle = `rgba(253, 224, 71, ${brightness * 0.6})`;
      ctx.lineWidth = 2;
      for (let r = 0; r < 8; r++) {
        const ang = (r / 8) * Math.PI * 2 + t * 0.2;
        ctx.beginPath();
        ctx.moveTo(bx + Math.cos(ang) * 32, by + Math.sin(ang) * 32);
        ctx.lineTo(bx + Math.cos(ang) * 55, by + Math.sin(ang) * 55);
        ctx.stroke();
      }
    }

    // Porcelain Bulb Holder
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(bx - 20, by + 18, 40, 25, 6);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glass Bulb Shell
    ctx.fillStyle = brightness > 0 ? 'rgba(254, 240, 138, 0.95)' : 'rgba(148, 163, 184, 0.25)';
    ctx.beginPath();
    ctx.arc(bx, by, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tungsten Filament
    ctx.strokeStyle = brightness > 0 ? '#ef4444' : '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx - 10, by + 12);
    ctx.lineTo(bx - 5, by - 8);
    ctx.lineTo(bx + 5, by - 8);
    ctx.lineTo(bx + 10, by + 12);
    ctx.stroke();

    // Bulb Label
    ctx.fillStyle = brightness > 0 ? '#facc15' : '#94a3b8';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(brightness > 0 ? `Bulb Glowing (${v}V)` : 'Bulb OFF', bx, by + 60);

    ctx.restore();
  }

  // Circuit HUD
  function drawCircuitHUD(
    ctx: CanvasRenderingContext2D,
    swClosed: boolean,
    conductor: boolean,
    complete: boolean,
    v: number,
    currentLang: Language
  ) {
    ctx.save();
    const cx = 440;
    const cy = 255;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = complete ? '#4ade80' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.roundRect(cx - 150, cy - 25, 300, 50, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';

    if (complete) {
      ctx.fillStyle = '#4ade80';
      ctx.fillText(currentLang === 'en' ? '⚡ Closed Circuit: Current Flows!' : '⚡ बन्द परिपथ: विद्युत बगिरहेको छ!', cx, cy);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px system-ui';
      ctx.fillText(currentLang === 'en' ? `Voltage: ${v} Volts • Bulb is Illuminated` : `भोल्टेज: ${v} भोल्ट • बत्ती बल्यो`, cx, cy + 15);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.fillText(
        !swClosed
          ? currentLang === 'en' ? '❌ Open Circuit: Switch is Open' : '❌ खुला परिपथ: स्विच खुला छ'
          : currentLang === 'en' ? '❌ Broken Circuit: Insulator Blocks Current' : '❌ परिपथ अवरुद्ध: कुचालकले रोकेको छ',
        cx,
        cy
      );
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px system-ui';
      ctx.fillText(currentLang === 'en' ? 'Close switch & use conductor to complete loop' : 'स्विच बन्द गर्नुहोस् र सुचालक वस्तु राख्नुहोस्', cx, cy + 15);
    }

    ctx.restore();
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'closed') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! Current only flows through a complete closed circuit.' : 'सबास! बत्ती बल्नका लागि परिपथ पूर्ण र बन्द (Closed) हुनुपर्छ।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Try again! An open circuit has a break in the path.' : 'मिलेन। खुला परिपथमा विद्युत प्रवाह हुन सक्दैन।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Virtual Electricity Circuit Lab' : 'विद्युत परिपथ प्रयोगशाला (Electric Circuit)'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 7: Energy'
          : 'कक्षा ४ विज्ञान • एकाइ ७: ऊर्जा'
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

          {/* Top Status Floating Badge */}
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
                border: '1px solid rgba(250, 204, 21, 0.3)',
                padding: '6px 14px',
                borderRadius: '10px',
                color: '#facc15',
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
                {isSwitchClosed && testMaterialConfig.conductor
                  ? (lang === 'en' ? `Closed Circuit Active: ${voltage}V Powered` : `बन्द परिपथ चालु: ${voltage}V प्रवाहित`)
                  : (lang === 'en' ? 'Open Circuit: No Current Flow' : 'खुला परिपथ: विद्युत बगेको छैन')}
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
                  background: isSwitchClosed && testMaterialConfig.conductor ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${isSwitchClosed && testMaterialConfig.conductor ? '#facc15' : 'rgba(255, 255, 255, 0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {isSwitchClosed && testMaterialConfig.conductor ? '💡' : '🔌'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {isSwitchClosed && testMaterialConfig.conductor
                    ? (lang === 'en' ? 'Bulb Glowing Brightly (Complete Loop)' : 'बत्ती बलिरहेको छ (पूर्ण परिपथ)')
                    : (lang === 'en' ? 'Bulb OFF (Broken Loop / Insulator)' : 'बत्ती निभेको छ (टुटेको परिपथ / कुचालक)')}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en'
                    ? `Test specimen: ${testMaterialConfig.nameEn} (${testMaterialConfig.conductor ? 'Conductor' : 'Insulator'})`
                    : `परीक्षण वस्तु: ${testMaterialConfig.nameNe} (${testMaterialConfig.conductor ? 'सुचालक' : 'कुचालक'})`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Circuit Status' : 'परिपथ अवस्था'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: isSwitchClosed ? '#10b981' : '#f43f5e' }}>
                  {isSwitchClosed ? (lang === 'en' ? 'Closed (बन्द)' : 'बन्द') : (lang === 'en' ? 'Open (खुला)' : 'खुला')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Voltage' : 'भोल्टेज'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#facc15' }}>
                  {voltage}V
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
              border: '1px solid rgba(250, 204, 21, 0.25)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>💡</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#facc15' }}>
                {lang === 'en' ? 'Circuit Discovery Station' : 'विद्युत परिपथ अनुसन्धान केन्द्र'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'An electric circuit is an unbroken conductive pathway through which electric charges flow from battery anode to cathode.'
                : 'विद्युत परिपथ ब्याट्री, स्विच, तार र लोड (बत्ती) मिलेर बन्ने एक बन्द बाटो हो जहाँबाट विद्युत धारा बग्दछ।'}
            </p>
          </div>

          {/* 2. Knife Switch Button */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Switch Control' : 'स्विच नियन्त्रण'}
            </div>
            <button
              onClick={handleToggleSwitch}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: isSwitchClosed ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isSwitchClosed ? '#10b981' : 'rgba(255, 255, 255, 0.15)'}`,
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Power size={14} />
              <span>
                {isSwitchClosed
                  ? lang === 'en' ? '🟢 Switch CLOSED (बन्द परिपथ)' : '🟢 स्विच बन्द छ (बत्ती बल्छ)'
                  : lang === 'en' ? '🔴 Switch OPEN (खुला परिपथ)' : '🔴 स्विच खुला छ (बत्ती बल्दैन)'}
              </span>
            </button>
          </div>

          {/* 3. Voltage Selector Tabs */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Battery Voltage (Cells in Series)' : 'ब्याट्री भोल्टेज (सेलहरूको सङ्ख्या)'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[1.5, 3.0, 4.5].map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setVoltage(v);
                    ScienceAudio.playPop();
                  }}
                  style={{
                    background: voltage === v ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${voltage === v ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '8px',
                    padding: '8px 4px',
                    color: voltage === v ? '#38bdf8' : '#e2e8f0',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {v}V ({v === 1.5 ? '1 Cell' : v === 3.0 ? '2 Cells' : '3 Cells'})
                </button>
              ))}
            </div>
          </div>

          {/* 4. Conductor vs Insulator Test Material */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Insert Test Material' : 'परीक्षण वस्तु छान्नुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {[
                { id: 'wire', labelEn: 'Copper Wire', labelNe: 'तामाको तार', cond: true },
                { id: 'nail', labelEn: 'Iron Nail', labelNe: 'फलामको किला', cond: true },
                { id: 'plastic', labelEn: 'Plastic Ruler', labelNe: 'प्लास्टिक', cond: false },
                { id: 'wood', labelEn: 'Wooden Stick', labelNe: 'काठको सिन्का', cond: false },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setTestMaterial(m.id as TestMaterial);
                    ScienceAudio.playPop();
                  }}
                  style={{
                    background: testMaterial === m.id ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${testMaterial === m.id ? '#facc15' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '700', color: testMaterial === m.id ? '#facc15' : '#e2e8f0' }}>
                    {lang === 'en' ? m.labelEn : m.labelNe}
                  </div>
                  <div style={{ fontSize: '10px', color: m.cond ? '#34d399' : '#f87171', marginTop: '2px' }}>
                    {m.cond ? (lang === 'en' ? 'Conductor' : 'सुचालक') : (lang === 'en' ? 'Insulator' : 'कुचालक')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Concept Check Quiz */}
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
                ? 'Under which condition does electric current flow and the bulb light up?'
                : 'कुन अवस्थामा परिपथमा विद्युत बग्छ र बत्ती बल्छ?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleQuizAnswer('open')}
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
                {lang === 'en' ? 'Open Circuit' : 'खुला परिपथ'}
              </button>

              <button
                onClick={() => handleQuizAnswer('closed')}
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
                {lang === 'en' ? 'Closed Circuit' : 'बन्द परिपथ'}
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

          {/* 6. Curriculum Key Takeaway Card */}
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
                ? 'Metals like copper and iron allow electric current to pass through freely (conductors). Plastic and wood block electric current (insulators).'
                : 'तामा र फलामजस्ता धातुले विद्युत प्रवाह गराउँछन् (सुचालक)। प्लास्टिक र काठले विद्युत रोक्दछन् (कुचालक)।'}
            </p>
          </div>

          {/* 7. Complete Electricity Lab Button */}
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
            <span>{lang === 'en' ? 'Complete Electricity Lab & Quiz' : 'विद्युत प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
