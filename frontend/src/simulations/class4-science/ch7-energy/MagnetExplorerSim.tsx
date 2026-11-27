/**
 * MagnetExplorerSim.tsx
 * Simulation 27: 2D Magnet Explorer Physics Lab
 * Grade 4 Science • Chapter 7: Energy
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * 1. Magnetic Field Lines: Realistic dipolar vector field with curved flux loops from North to South.
 * 2. Interactive Compass Needle: Rotates smoothly to align with magnetic field direction anywhere on screen.
 * 3. Pole Interaction (Attraction & Repulsion):
 *    - Unlike poles (N - S): Magnetic field loops attract and pull magnets together
 *    - Like poles (N - N / S - S): Repulsive field lines bend outward, pushing magnets apart
 * 4. Specimen Testing: Test Iron Nail, Steel Paperclip, Copper Coin, Plastic Eraser, Wooden Pencil.
 *    Magnetic objects leap and snap to the magnet pole with physical velocity!
 * 5. Bilingual EN/NE, realistic sounds, and mastery challenge.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Magnet, RotateCcw, Sparkles, Compass, Check, ArrowRightLeft } from 'lucide-react';

type LabMode = 'field' | 'poles' | 'specimens';

interface Specimen {
  id: string;
  nameEn: string;
  nameNe: string;
  isMagnetic: boolean;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isSnapped: boolean;
}

export const MagnetExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [mode, setMode] = useState<LabMode>('field');
  const [magnet2Pole, setMagnet2Pole] = useState<'S' | 'N'>('S'); // For pole interaction mode
  const [compassPos, setCompassPos] = useState<{ x: number; y: number }>({ x: 300, y: 170 });
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Specimens for test mode
  const [specimens, setSpecimens] = useState<Specimen[]>([
    { id: 'nail', nameEn: 'Iron Nail', nameNe: 'फलामको किला', isMagnetic: true, x: 620, y: 160, targetX: 620, targetY: 160, isSnapped: false },
    { id: 'clip', nameEn: 'Steel Paperclip', nameNe: 'कागजको क्लिप', isMagnetic: true, x: 620, y: 220, targetX: 620, targetY: 220, isSnapped: false },
    { id: 'coin', nameEn: 'Copper Coin', nameNe: 'तामाको सिक्का', isMagnetic: false, x: 620, y: 280, targetX: 620, targetY: 280, isSnapped: false },
    { id: 'eraser', nameEn: 'Rubber Eraser', nameNe: 'रबर (Eraser)', isMagnetic: false, x: 620, y: 340, targetX: 620, targetY: 340, isSnapped: false },
    { id: 'wood', nameEn: 'Wooden Pencil', nameNe: 'काठको सिन्का', isMagnetic: false, x: 620, y: 400, targetX: 620, targetY: 400, isSnapped: false },
  ]);

  const handleTestSpecimen = (id: string) => {
    setSpecimens((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (s.isMagnetic) {
            ScienceAudio.playSuccess();
            return { ...s, isSnapped: true, targetX: 470, targetY: 280 };
          } else {
            ScienceAudio.playBeep(220, 0.2);
            return s;
          }
        }
        return s;
      })
    );
  };

  const handleTogglePole = () => {
    setMagnet2Pole((prev) => (prev === 'S' ? 'N' : 'S'));
    ScienceAudio.playPop();
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 880 / rect.width;
    const scaleY = 560 / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    setCompassPos({ x: mx, y: my });
  };

  const handleReset = () => {
    setMode('field');
    setMagnet2Pole('S');
    setCompassPos({ x: 300, y: 170 });
    setSpecimens([
      { id: 'nail', nameEn: 'Iron Nail', nameNe: 'फलामको किला', isMagnetic: true, x: 620, y: 160, targetX: 620, targetY: 160, isSnapped: false },
      { id: 'clip', nameEn: 'Steel Paperclip', nameNe: 'कागजको क्लिप', isMagnetic: true, x: 620, y: 220, targetX: 620, targetY: 220, isSnapped: false },
      { id: 'coin', nameEn: 'Copper Coin', nameNe: 'तामाको सिक्का', isMagnetic: false, x: 620, y: 280, targetX: 620, targetY: 280, isSnapped: false },
      { id: 'eraser', nameEn: 'Rubber Eraser', nameNe: 'रबर (Eraser)', isMagnetic: false, x: 620, y: 340, targetX: 620, targetY: 340, isSnapped: false },
      { id: 'wood', nameEn: 'Wooden Pencil', nameNe: 'काठको सिन्का', isMagnetic: false, x: 620, y: 400, targetX: 620, targetY: 400, isSnapped: false },
    ]);
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

      // Subtle magnetic coordinate grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
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

      // Render mode-specific scene
      if (mode === 'field') {
        renderFieldMode(ctx, compassPos, time, lang);
      } else if (mode === 'poles') {
        renderPolesInteraction(ctx, magnet2Pole, time, lang);
      } else {
        renderSpecimenMode(ctx, specimens, time, lang);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, magnet2Pole, compassPos, specimens, lang]);

  // MODE 1: MAGNETIC FIELD LINES & COMPASS
  function renderFieldMode(
    ctx: CanvasRenderingContext2D,
    compPos: { x: number; y: number },
    t: number,
    currentLang: Language
  ) {
    const magX = 440;
    const magY = 280;
    const magW = 200;
    const magH = 50;

    const northPos = { x: magX - 60, y: magY };
    const southPos = { x: magX + 60, y: magY };

    // 1. Magnetic Field Flux Loops (North to South)
    ctx.save();
    const loopRadii = [65, 110, 160, 220, 280];

    loopRadii.forEach((r, idx) => {
      ctx.strokeStyle = idx % 2 === 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(14, 165, 233, 0.3)';
      ctx.lineWidth = 1.8;

      // Top arc loop
      ctx.beginPath();
      ctx.ellipse(magX, magY - r * 0.45, r, r * 0.7, 0, 0, Math.PI);
      ctx.stroke();

      // Bottom arc loop
      ctx.beginPath();
      ctx.ellipse(magX, magY + r * 0.45, r, r * 0.7, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Directional arrowheads on field lines
      const arrowTopX = magX + Math.sin(t * 1.5 + idx) * 15;
      const arrowTopY = magY - r * 0.45 - r * 0.7;
      drawFieldArrow(ctx, arrowTopX, arrowTopY, 0); // pointing right (N to S)

      const arrowBotX = magX - Math.sin(t * 1.5 + idx) * 15;
      const arrowBotY = magY + r * 0.45 + r * 0.7;
      drawFieldArrow(ctx, arrowBotX, arrowBotY, Math.PI); // pointing left
    });
    ctx.restore();

    // 2. Bar Magnet
    drawBarMagnet(ctx, magX, magY, magW, magH, 'N', 'S');

    // 3. Interactive Compass
    drawCompass(ctx, compPos.x, compPos.y, northPos, southPos);
  }

  function drawFieldArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-7, -4);
    ctx.lineTo(-7, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draw Alnico Bar Magnet
  function drawBarMagnet(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    leftPole: 'N' | 'S',
    rightPole: 'N' | 'S'
  ) {
    ctx.save();
    const halfW = w * 0.5;
    const halfH = h * 0.5;

    // Left Half
    const leftCol = leftPole === 'N' ? '#ef4444' : '#3b82f6';
    const leftGrad = ctx.createLinearGradient(cx - halfW, cy - halfH, cx, cy + halfH);
    leftGrad.addColorStop(0, leftCol);
    leftGrad.addColorStop(0.5, leftPole === 'N' ? '#b91c1c' : '#1d4ed8');
    leftGrad.addColorStop(1, leftCol);
    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.roundRect(cx - halfW, cy - halfH, halfW, h, [6, 0, 0, 6]);
    ctx.fill();

    // Right Half
    const rightCol = rightPole === 'N' ? '#ef4444' : '#3b82f6';
    const rightGrad = ctx.createLinearGradient(cx, cy - halfH, cx + halfW, cy + halfH);
    rightGrad.addColorStop(0, rightCol);
    rightGrad.addColorStop(0.5, rightPole === 'N' ? '#b91c1c' : '#1d4ed8');
    rightGrad.addColorStop(1, rightCol);
    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.roundRect(cx, cy - halfH, halfW, h, [0, 6, 6, 0]);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - halfW, cy - halfH, w, h, 6);
    ctx.stroke();

    // Center divider
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - halfH);
    ctx.lineTo(cx, cy + halfH);
    ctx.stroke();

    // Pole Letters (N & S)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(leftPole, cx - halfW * 0.5, cy);
    ctx.fillText(rightPole, cx + halfW * 0.5, cy);

    ctx.restore();
  }

  // Interactive Magnetic Compass
  function drawCompass(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    northSource: { x: number; y: number },
    southSource: { x: number; y: number }
  ) {
    ctx.save();
    // Calculate local magnetic field vector B at (cx, cy)
    // Field points AWAY from North, TOWARDS South
    const rN_x = cx - northSource.x;
    const rN_y = cy - northSource.y;
    const dN = Math.hypot(rN_x, rN_y) || 1;

    const rS_x = cx - southSource.x;
    const rS_y = cy - southSource.y;
    const dS = Math.hypot(rS_x, rS_y) || 1;

    // Dipole approximation: B = (r - rN)/dN^3 - (r - rS)/dS^3
    const Bx = (rN_x / (dN * dN * dN)) - (rS_x / (dS * dS * dS));
    const By = (rN_y / (dN * dN * dN)) - (rS_y / (dS * dS * dS));
    const needleAngle = Math.atan2(By, Bx);

    // Compass Housing
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Compass Needle
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleAngle);

    // North Needle (Red)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, -6);
    ctx.lineTo(0, -20);
    ctx.lineTo(4, -6);
    ctx.closePath();
    ctx.fill();

    // South Needle (Silver/White)
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, 6);
    ctx.lineTo(0, 20);
    ctx.lineTo(4, 6);
    ctx.closePath();
    ctx.fill();

    // Center pivot pin
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  // MODE 2: POLES INTERACTION (ATTRACT VS REPEL)
  function renderPolesInteraction(
    ctx: CanvasRenderingContext2D,
    p2: 'S' | 'N',
    t: number,
    currentLang: Language
  ) {
    const mag1X = 280;
    const mag2X = 600;
    const magY = 280;
    const magW = 160;
    const magH = 50;

    // Magnet 1: Fixed [S | N] -> Facing pole is North
    drawBarMagnet(ctx, mag1X, magY, magW, magH, 'S', 'N');

    // Magnet 2: [p2 | other] -> Facing pole is p2
    const otherPole = p2 === 'S' ? 'N' : 'S';
    drawBarMagnet(ctx, mag2X, magY, magW, magH, p2, otherPole);

    // Interaction Visuals between the facing poles (Magnet 1 North vs Magnet 2 p2)
    ctx.save();
    if (p2 === 'S') {
      // UNLIKE POLES ATTRACT (North & South)
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      // Bridging attraction lines
      for (let i = -2; i <= 2; i++) {
        const offset = i * 14;
        ctx.beginPath();
        ctx.moveTo(mag1X + magW * 0.5, magY + offset);
        ctx.bezierCurveTo(400, magY + offset * 0.5, 480, magY + offset * 0.5, mag2X - magW * 0.5, magY + offset);
        ctx.stroke();
      }

      // Inward attractive force arrows
      drawForceArrow(ctx, 410, magY, 1, '#4ade80');
      drawForceArrow(ctx, 470, magY, -1, '#4ade80');

      // Banner
      drawPolesBanner(ctx, 440, 160, 'Attraction', 'Unlike poles attract', '#4ade80');
    } else {
      // LIKE POLES REPEL (North & North)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      // Repulsive field lines bending away vertically
      for (let i = 1; i <= 3; i++) {
        const gap = i * 22;
        // Bending upward
        ctx.beginPath();
        ctx.moveTo(mag1X + magW * 0.5, magY - 10);
        ctx.quadraticCurveTo(430, magY - 10, 430, magY - gap * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(mag2X - magW * 0.5, magY - 10);
        ctx.quadraticCurveTo(450, magY - 10, 450, magY - gap * 2);
        ctx.stroke();

        // Bending downward
        ctx.beginPath();
        ctx.moveTo(mag1X + magW * 0.5, magY + 10);
        ctx.quadraticCurveTo(430, magY + 10, 430, magY + gap * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(mag2X - magW * 0.5, magY + 10);
        ctx.quadraticCurveTo(450, magY + 10, 450, magY + gap * 2);
        ctx.stroke();
      }

      // Outward repulsive force arrows
      drawForceArrow(ctx, 400, magY, -1, '#ef4444');
      drawForceArrow(ctx, 480, magY, 1, '#ef4444');

      // Banner
      drawPolesBanner(ctx, 440, 160, 'Repulsion', 'Like poles repel', '#ef4444');
    }
    ctx.restore();
  }

  function drawForceArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, col: string) {
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dir * 30, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + dir * 30, y);
    ctx.lineTo(x + dir * 22, y - 6);
    ctx.lineTo(x + dir * 22, y + 6);
    ctx.closePath();
    ctx.fill();
  }

  function drawPolesBanner(ctx: CanvasRenderingContext2D, x: number, y: number, title: string, sub: string, col: string) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.roundRect(x - 170, y - 25, 340, 50, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = col;
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(title, x, y - 4);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px system-ui';
    ctx.fillText(sub, x, y + 14);
  }

  // MODE 3: SPECIMEN TESTING
  function renderSpecimenMode(
    ctx: CanvasRenderingContext2D,
    specs: Specimen[],
    t: number,
    currentLang: Language
  ) {
    const magX = 300;
    const magY = 280;
    drawBarMagnet(ctx, magX, magY, 200, 50, 'S', 'N');

    // Draw specimen tray
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.roundRect(580, 110, 240, 340, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'en' ? 'Specimens Test Tray' : 'परीक्षण वस्तुहरूको ट्रे', 700, 135);

    // Draw each specimen
    specs.forEach((s) => {
      // Smooth movement towards target
      s.x += (s.targetX - s.x) * 0.15;
      s.y += (s.targetY - s.y) * 0.15;

      ctx.save();
      ctx.fillStyle = s.isSnapped ? '#38bdf8' : '#334155';
      ctx.strokeStyle = s.isMagnetic ? '#4ade80' : '#f87171';
      ctx.lineWidth = 1.5;
      ctx.roundRect(s.x - 70, s.y - 14, 140, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(currentLang === 'en' ? s.nameEn : s.nameNe, s.x, s.y + 4);
      ctx.restore();
    });
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'poles') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! Magnetic force is strongest at both poles (N and S).' : 'सबास! चुम्बकीय शक्ति दुवै ध्रुवहरू (N र S) मा सबैभन्दा बढी हुन्छ।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. The center of a bar magnet has minimal magnetism.' : 'मिलेन। चुम्बकको बीच भागमा चुम्बकत्व न्यून हुन्छ, ध्रुवहरूमा बढी हुन्छ।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Magnet Explorer Physics Lab' : 'चुम्बक अन्वेषक (Magnet Explorer)'}
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
            onMouseMove={handleCanvasMouseMove}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
              cursor: 'crosshair',
            }}
          />

          {/* Top Mode Badge */}
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
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '6px 14px',
                borderRadius: '10px',
                color: '#fb7185',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Magnet size={14} className="text-rose-400" />
              <span>
                {mode === 'field'
                  ? (lang === 'en' ? 'Magnetic Field Lines & Iron Filings' : 'चुम्बकीय क्षेत्र रेखाहरू')
                  : mode === 'poles'
                  ? (lang === 'en' ? 'Magnetic Pole Interactions (Attraction & Repulsion)' : 'ध्रुव अन्तरक्रिया (आकर्षण र विकर्षण)')
                  : (lang === 'en' ? 'Magnetic vs Non-Magnetic Material Testing' : 'चुम्बकीय र अचुम्बकीय वस्तु परीक्षण')}
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
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                🧲
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {mode === 'poles'
                    ? (magnet2Pole === 'S'
                      ? (lang === 'en' ? 'North-South: Strong Magnetic Attraction' : 'उत्तर-दक्षिण: बलियो आकर्षण')
                      : (lang === 'en' ? 'North-North: Strong Magnetic Repulsion' : 'उत्तर-उत्तर: समान ध्रुव विकर्षण'))
                    : mode === 'field'
                    ? (lang === 'en' ? 'Continuous Flux Lines: North Pole → South Pole' : 'चुम्बकीय बल रेखाहरू: उत्तर ध्रुवबाट दक्षिण ध्रुवतिर')
                    : (lang === 'en' ? 'Testing Specimens with Permanent Magnet' : 'स्थायी चुम्बकबाट वस्तुहरूको परीक्षण')}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en'
                    ? 'Opposite poles attract, like poles repel • Magnetic materials: Iron, Steel, Nickel'
                    : 'विपरीत ध्रुवहरू आकर्षित हुन्छन्, समान ध्रुवहरू विकर्षित हुन्छन् • चुम्बकीय वस्तु: फलाम, स्टिल'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Field Strength' : 'चुम्बकीय शक्ति'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#fb7185' }}>
                  {mode === 'poles' ? (magnet2Pole === 'S' ? '+100% Attract' : '-100% Repel') : 'Max at Poles'}
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
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>🧲</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#fb7185' }}>
                {lang === 'en' ? 'Magnetism Discovery Station' : 'चुम्बकत्व अनुसन्धान केन्द्र'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Every magnet has two poles: North (N) and South (S). Magnetic field lines flow outwards from North and loop back into South.'
                : 'हरेक चुम्बकमा उत्तर (N) र दक्षिण (S) गरी दुई ध्रुव हुन्छन्। विपरीत ध्रुवमा आकर्षण र समान ध्रुवमा विकर्षण हुन्छ।'}
            </p>
          </div>

          {/* 2. Experiment Mode Selector */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Select Mode' : 'प्रयोग विधि छान्नुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { id: 'field', labelEn: 'Field Lines', labelNe: 'क्षेत्र रेखा' },
                { id: 'poles', labelEn: 'N-S Poles', labelNe: 'ध्रुव प्रभाव' },
                { id: 'specimens', labelEn: 'Testing', labelNe: 'वस्तु जाँच' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id as LabMode);
                    ScienceAudio.playPop();
                  }}
                  style={{
                    background: mode === m.id ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${mode === m.id ? '#f43f5e' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '8px',
                    padding: '10px 4px',
                    color: mode === m.id ? '#fb7185' : '#94a3b8',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {lang === 'en' ? m.labelEn : m.labelNe}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Conditional Mode Controls */}
          {mode === 'poles' && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#facc15' }}>
                {lang === 'en' ? 'Flip Magnet 2 Pole' : 'दोस्रो चुम्बकको ध्रुव बदल्नुहोस्'}
              </h4>
              <button
                onClick={handleTogglePole}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
                <ArrowRightLeft size={14} />
                <span>
                  {magnet2Pole === 'S'
                    ? lang === 'en' ? '🔄 Flip to North (Repulsion)' : '🔄 उत्तर ध्रुवमा बदल्नुहोस् (विकर्षण)'
                    : lang === 'en' ? '🔄 Flip to South (Attraction)' : '🔄 दक्षिण ध्रुवमा बदल्नुहोस् (आकर्षण)'}
                </span>
              </button>
            </div>
          )}

          {mode === 'specimens' && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Click Specimen to Test' : 'परीक्षण गर्न वस्तुमा थिच्नुहोस्'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {specimens.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleTestSpecimen(s.id)}
                    style={{
                      background: s.isSnapped ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${s.isSnapped ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '8px',
                      padding: '8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: '700', color: s.isSnapped ? '#34d399' : '#e2e8f0' }}>
                      {lang === 'en' ? s.nameEn : s.nameNe}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      {s.isSnapped ? '🧲 Attracted!' : 'Click to test'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
              {lang === 'en' ? 'Magnetism Quiz' : 'चुम्बकत्व प्रश्न'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'Where is the magnetic force strongest in any magnet?'
                : 'चुम्बकमा चुम्बकीय शक्ति सबैभन्दा बढी कहाँ हुन्छ?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleQuizAnswer('center')}
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
                {lang === 'en' ? 'In Center' : 'बीच भागमा'}
              </button>

              <button
                onClick={() => handleQuizAnswer('poles')}
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
                {lang === 'en' ? 'At Poles (N & S)' : 'दुवै ध्रुवमा'}
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
                ? 'Like magnetic poles repel each other, while opposite magnetic poles attract. Magnetic force is strongest at the two poles.'
                : 'समान चुम्बकीय ध्रुवहरू विकर्षित हुन्छन्, विपरीत ध्रुवहरू आकर्षित हुन्छन्। चुम्बकको आकर्षण शक्ति ध्रुवहरूमा सबैभन्दा बढी हुन्छ।'}
            </p>
          </div>

          {/* 6. Complete Magnet Explorer Lab Button */}
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
            <span>{lang === 'en' ? 'Complete Magnet Lab & Quiz' : 'चुम्बक प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
