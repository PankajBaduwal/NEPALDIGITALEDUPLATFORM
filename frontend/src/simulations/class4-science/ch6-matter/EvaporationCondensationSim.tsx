/**
 * EvaporationCondensationSim.tsx
 * Simulation 22: 2D Evaporation and Condensation Lab
 * Grade 4 Science • Chapter 6: Matter
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * 1. Evaporation: Boiling water in flask on tripod stand over Bunsen burner,
 *    energetic bubbles forming and bursting into swirling steam vapor plumes.
 * 2. Condensation: Steam strikes an inclined cold glass plate cooled with ice cubes;
 *    vapor cools and condenses into glistening water droplets coalescing.
 * 3. Collection: Droplets drip one by one from the plate edge into a receiving beaker below,
 *    creating water ripples and filling the beaker with pure distilled water.
 * 4. Interactive controls: Flame level, Ice refill, Temperature readouts, Bilingual EN/NE, and Quiz.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Flame, Droplets, RotateCcw, Sparkles, Snowflake, Check, Info } from 'lucide-react';

interface WaterDrop {
  x: number;
  y: number;
  vy: number;
  r: number;
}

export const EvaporationCondensationSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [flameLevel, setFlameLevel] = useState<number>(2); // 0 = off, 1 = low, 2 = high
  const [hasIce, setHasIce] = useState<boolean>(true);
  const iceLevel = hasIce ? 100 : 0;
  const [distilledVolume, setDistilledVolume] = useState<number>(15); // ml collected
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const dropsRef = useRef<WaterDrop[]>([]);
  const ripplesRef = useRef<{ x: number; y: number; r: number; alpha: number }[]>([]);

  const handleToggleFlame = () => {
    const nextLevel = (flameLevel + 1) % 3;
    setFlameLevel(nextLevel);
    if (nextLevel > 0) ScienceAudio.playFireTorch();
    else ScienceAudio.playPop();
  };

  const handleRefillIce = () => {
    setHasIce(true);
    ScienceAudio.playWaterDrop();
  };

  const handleReset = () => {
    setFlameLevel(2);
    setHasIce(true);
    setDistilledVolume(10);
    dropsRef.current = [];
    ripplesRef.current = [];
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

      // Lab counter surface
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 480, 880, 80);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.lineTo(880, 480);
      ctx.stroke();

      // 2. LEFT APPARATUS: BOILING FLASK & BUNSEN BURNER
      const flaskX = 220;
      const flaskY = 240;
      const flaskW = 140;
      const flaskH = 150;

      // Tripod & Burner under flask
      drawFlaskTripodAndBurner(ctx, flaskX + flaskW * 0.5, 480, flameLevel, time);

      // Boiling Flask with bubbling water
      drawBoilingFlask(ctx, flaskX, flaskY, flaskW, flaskH, flameLevel, time);

      // 3. RISING STEAM PLUME (VAPOR)
      if (flameLevel > 0) {
        drawRisingSteam(ctx, flaskX + flaskW * 0.5, flaskY + 10, flameLevel, time);
      }

      // 4. INCLINED CHILLED CONDENSING PLATE WITH ICE CUBES
      const plateStartX = 260;
      const plateStartY = 110;
      const plateEndX = 500;
      const plateEndY = 190;

      drawCondensingPlate(ctx, plateStartX, plateStartY, plateEndX, plateEndY, hasIce, flameLevel, time);

      // 5. RIGHT APPARATUS: RECEIVING BEAKER & DRIPPING DISTILLED WATER
      const dripOriginX = plateEndX - 10;
      const dripOriginY = plateEndY + 5;
      const receiverX = 460;
      const receiverY = 320;
      const receiverW = 100;
      const receiverH = 160;

      updateAndDrawDrippingDrops(ctx, dripOriginX, dripOriginY, receiverX, receiverY, receiverW, receiverH, flameLevel, hasIce);
      drawReceivingBeaker(ctx, receiverX, receiverY, receiverW, receiverH, distilledVolume, time);

      // 6. PROCESS LABELS & HUD OVERLAYS
      drawProcessAnnotations(ctx, flaskX, flaskY, plateStartX, plateStartY, receiverX, receiverY, flameLevel, hasIce, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [flameLevel, hasIce, distilledVolume, lang]);

  // Tripod and Burner
  function drawFlaskTripodAndBurner(ctx: CanvasRenderingContext2D, cx: number, baseY: number, flame: number, t: number) {
    ctx.save();
    // Legs
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 75, baseY);
    ctx.lineTo(cx - 55, baseY - 80);
    ctx.moveTo(cx + 75, baseY);
    ctx.lineTo(cx + 55, baseY - 80);
    ctx.stroke();

    // Wire mesh gauze
    ctx.fillStyle = '#475569';
    ctx.fillRect(cx - 70, baseY - 85, 140, 6);

    // Burner base
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(cx, baseY - 5, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Burner tube
    ctx.fillStyle = '#d97706';
    ctx.fillRect(cx - 6, baseY - 80, 12, 75);

    // Animated flame
    if (flame > 0) {
      const flameH = flame === 1 ? 35 : 55;
      const flicker = Math.sin(t * 18) * 4;

      const outerGrad = ctx.createRadialGradient(cx, baseY - 80, 4, cx, baseY - 80 - flameH * 0.5, flameH);
      outerGrad.addColorStop(0, '#60a5fa');
      outerGrad.addColorStop(0.3, '#f97316');
      outerGrad.addColorStop(0.8, '#facc15');
      outerGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 10, baseY - 80);
      ctx.quadraticCurveTo(cx - 14, baseY - 80 - flameH * 0.6, cx, baseY - 80 - flameH + flicker);
      ctx.quadraticCurveTo(cx + 14, baseY - 80 - flameH * 0.6, cx + 10, baseY - 80);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Boiling Erlenmeyer Flask
  function drawBoilingFlask(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    flame: number,
    t: number
  ) {
    ctx.save();
    const neckW = 32;
    const neckH = 50;
    const cx = x + w * 0.5;

    // Flask outline path
    ctx.beginPath();
    ctx.moveTo(cx - neckW * 0.5, y);
    ctx.lineTo(cx + neckW * 0.5, y);
    ctx.lineTo(cx + neckW * 0.5, y + neckH);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(cx - neckW * 0.5, y + neckH);
    ctx.closePath();

    // Water level inside flask
    const waterY = y + neckH + 30;
    const waterGrad = ctx.createLinearGradient(0, waterY, 0, y + h);
    waterGrad.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
    waterGrad.addColorStop(1, 'rgba(2, 132, 199, 0.8)');
    ctx.fillStyle = waterGrad;

    ctx.save();
    ctx.clip(); // clip water within flask
    ctx.fillRect(x, waterY, w, h);

    // Boiling bubbles inside water if flame is on
    if (flame > 0) {
      const bubbleCount = flame === 1 ? 8 : 22;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;

      for (let b = 0; b < bubbleCount; b++) {
        const bx = x + 15 + ((b * 27 + t * 40) % (w - 30));
        const by = (y + h - 10) - (((t * 80 + b * 24) % (y + h - waterY - 5)));
        const br = 2 + (b % 4);
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();

    // Glass wall stroke
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Flask lip rim
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, y, neckW * 0.5 + 3, 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Temperature label on flask
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    const tempText = flame === 2 ? '100°C (Boiling)' : flame === 1 ? '70°C (Warm)' : '25°C (Cool)';
    ctx.fillText(tempText, cx, y + h - 15);

    ctx.restore();
  }

  // Rising Steam Plume
  function drawRisingSteam(ctx: CanvasRenderingContext2D, sx: number, sy: number, flame: number, t: number) {
    ctx.save();
    const particleCount = flame === 1 ? 14 : 30;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';

    for (let p = 0; p < particleCount; p++) {
      const progress = ((t * 40 + p * 12) % 150) / 150;
      const px = sx + Math.sin(t * 3 + p) * (15 + progress * 40) + progress * 70;
      const py = sy - (progress * 130);
      const pr = 6 + progress * 24;

      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Inclined Condensing Plate with Ice
  function drawCondensingPlate(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    icePresent: boolean,
    flame: number,
    t: number
  ) {
    ctx.save();
    // Metal/Glass inclined surface
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Ice Cubes on the top surface of the plate
    if (icePresent) {
      const icePositions = [
        { u: 0.2, s: 26 },
        { u: 0.45, s: 30 },
        { u: 0.7, s: 28 },
      ];

      icePositions.forEach((pos, idx) => {
        const ix = x1 + (x2 - x1) * pos.u;
        const iy = y1 + (y2 - y1) * pos.u - 15;

        // Ice cube
        ctx.save();
        ctx.translate(ix, iy);
        ctx.rotate(0.3);
        const iceGrad = ctx.createLinearGradient(-pos.s * 0.5, -pos.s * 0.5, pos.s * 0.5, pos.s * 0.5);
        iceGrad.addColorStop(0, 'rgba(224, 242, 254, 0.95)');
        iceGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.8)');
        iceGrad.addColorStop(1, 'rgba(125, 211, 252, 0.7)');
        ctx.fillStyle = iceGrad;
        ctx.beginPath();
        ctx.roundRect(-pos.s * 0.5, -pos.s * 0.5, pos.s, pos.s, 4);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
    }

    // Condensed droplets forming underneath the inclined plate
    if (flame > 0 && icePresent) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
      for (let d = 0; d < 7; d++) {
        const u = 0.25 + d * 0.1;
        const dx = x1 + (x2 - x1) * u;
        const dy = y1 + (y2 - y1) * u + 7 + Math.sin(t * 3 + d) * 1.5;
        ctx.beginPath();
        ctx.arc(dx, dy, 3 + (d % 2), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Droplet Physics dripping from plate into beaker
  function updateAndDrawDrippingDrops(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    flame: number,
    ice: boolean
  ) {
    ctx.save();

    // Spawn new drops if boiling and ice present
    if (flame > 0 && ice && Math.random() < (flame === 2 ? 0.08 : 0.03)) {
      dropsRef.current.push({
        x: ox,
        y: oy,
        vy: 1.5,
        r: 3.5,
      });
    }

    const waterSurfaceY = ry + rh - (distilledVolume * 2);

    // Update and draw existing drops
    const nextDrops: WaterDrop[] = [];
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 6;

    dropsRef.current.forEach((drop) => {
      drop.vy += 0.35; // gravity
      drop.y += drop.vy;

      if (drop.y >= waterSurfaceY) {
        // Drop hit surface: create ripple and increment volume
        ripplesRef.current.push({ x: drop.x, y: waterSurfaceY, r: 2, alpha: 0.9 });
        setDistilledVolume((prev) => Math.min(65, prev + 0.2));
        ScienceAudio.playWaterDrop();
      } else {
        // Draw tear-shaped droplet
        ctx.beginPath();
        ctx.ellipse(drop.x, drop.y, drop.r * 0.7, drop.r * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        nextDrops.push(drop);
      }
    });

    dropsRef.current = nextDrops;

    // Draw ripples in receiving beaker
    setRipplesRef(
      ripplesRef.current
        .map((rip) => ({ ...rip, r: rip.r + 1.2, alpha: rip.alpha - 0.03 }))
        .filter((rip) => rip.alpha > 0)
    );

    ripplesRef.current.forEach((rip) => {
      ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(rip.x, rip.y, rip.r * 1.4, rip.r * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.restore();
  }

  function setRipplesRef(updated: { x: number; y: number; r: number; alpha: number }[]) {
    ripplesRef.current = updated;
  }

  // Receiving Beaker
  function drawReceivingBeaker(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    vol: number,
    t: number
  ) {
    ctx.save();
    // Beaker body
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x, y + 6);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y);
    ctx.stroke();

    // Distilled water fill
    const fillH = vol * 2;
    const waterTop = y + h - fillH;

    const distGrad = ctx.createLinearGradient(0, waterTop, 0, y + h);
    distGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    distGrad.addColorStop(1, 'rgba(2, 132, 199, 0.85)');
    ctx.fillStyle = distGrad;
    ctx.fillRect(x + 3, waterTop, w - 6, fillH);

    // Milliliter marks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    for (let my = y + 30; my <= y + h - 20; my += 25) {
      ctx.beginPath();
      ctx.moveTo(x + w - 12, my);
      ctx.lineTo(x + w, my);
      ctx.stroke();
      const markMl = Math.round((y + h - my) * 0.5);
      ctx.fillText(`${markMl}`, x + w - 15, my + 3);
    }

    // Label
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pure Distilled Water', x + w * 0.5, y + h + 18);

    ctx.restore();
  }

  // Annotation HUD Tags
  function drawProcessAnnotations(
    ctx: CanvasRenderingContext2D,
    fx: number,
    fy: number,
    px: number,
    py: number,
    rx: number,
    ry: number,
    flame: number,
    ice: boolean,
    currentLang: Language
  ) {
    ctx.save();
    // 1. Evaporation Tag
    drawAnnotationCard(
      ctx,
      fx + 70,
      fy - 35,
      currentLang === 'en' ? '1. Evaporation' : '1. वाष्पीकरण (Evaporation)',
      currentLang === 'en' ? 'Water absorbs heat → turns to steam' : 'पानी तातेर बाफमा परिणत हुन्छ',
      '#f97316'
    );

    // 2. Condensation Tag
    drawAnnotationCard(
      ctx,
      px + 120,
      py - 45,
      currentLang === 'en' ? '2. Condensation' : '2. सङ्घनन (Condensation)',
      currentLang === 'en' ? 'Cold surface cools steam → liquid drops' : 'चिसो सतहले बाफलाई पानीको थोपा बनाउँछ',
      '#38bdf8'
    );

    // 3. Collection Tag
    drawAnnotationCard(
      ctx,
      rx + 50,
      ry - 35,
      currentLang === 'en' ? '3. Collection' : '3. संकलन (Collection)',
      currentLang === 'en' ? 'Pure distilled drops collect in beaker' : 'शुद्ध पानी बिकरमा जम्मा हुन्छ',
      '#4ade80'
    );

    ctx.restore();
  }

  function drawAnnotationCard(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    title: string,
    desc: string,
    borderCol: string
  ) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 1.5;
    ctx.roundRect(x - 90, y - 18, 180, 38, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = borderCol;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(title, x, y - 3);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '9px system-ui';
    ctx.fillText(desc, x, y + 11);
    ctx.restore();
  }

  const handleQuizAnswer = (concept: string) => {
    if (concept === 'condensation') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! Condensation turns vapor into liquid drops.' : 'सबास! बाफ चिसिएर पानी बन्ने प्रक्रिया सङ्घनन हो।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Try again! Evaporation turns liquid into gas, condensation turns gas into liquid.' : 'फेरि सोच्नुहोस्! बाफ चिसिएर पानी बन्नुलाई सङ्घनन भनिन्छ।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Evaporation & Condensation Lab' : 'वाष्पीकरण र सङ्घनन प्रयोगशाला'}
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

          {/* Top Status Badge */}
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
              <Droplets size={14} className="text-sky-400" />
              <span>
                {lang === 'en'
                  ? `Collected: ${Math.round(distilledVolume)} ml Pure Distilled Water`
                  : `संकलन भएको: ${Math.round(distilledVolume)} मिलि शुद्ध पानी`}
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
                  background: flameLevel > 0 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${flameLevel > 0 ? '#f97316' : 'rgba(255, 255, 255, 0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {flameLevel > 0 ? '🔥' : '💧'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {flameLevel > 0
                    ? lang === 'en' ? 'Boiling & Vaporizing (100°C)' : 'उम्लने र बाष्पीकरण हुँदै (100°C)'
                    : lang === 'en' ? 'Burner Standby' : 'बर्नर तयार अवस्था'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en'
                    ? 'Steam rises, strikes cold condensing plate, drips into beaker'
                    : 'बाफ माथि उड्छ, चिसो प्लेटमा ठोकिएर सङ्घनन भई बिकरमा खस्छ'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Ice Remaining' : 'बाँकी हिउँ'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                  {Math.round(iceLevel)}%
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Distilled Volume' : 'शुद्ध पानी'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>
                  {Math.round(distilledVolume)} ml
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
              <span style={{ fontSize: '16px' }}>♨️</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Evaporation & Condensation Station' : 'वाष्पीकरण र सङ्घनन अनुसन्धान'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Heating water turns liquid into steam vapor (Evaporation). Cooling steam vapor turns it back into pure liquid droplets (Condensation).'
                : 'पानी तातेर बाफ बन्ने प्रक्रिया वाष्पीकरण हो भने बाफ चिसिएर फेरि पानी बन्ने प्रक्रिया सङ्घनन हो।'}
            </p>
          </div>

          {/* 2. Flame Controller */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#fb923c' }}>
              <Flame size={14} />
              <span>{lang === 'en' ? 'Bunsen Burner Control' : 'बन्सेन बर्नर नियन्त्रण'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { lvl: 0, labelEn: 'Off', labelNe: 'बन्द' },
                { lvl: 1, labelEn: 'Medium', labelNe: 'मध्यम' },
                { lvl: 2, labelEn: 'High Boil', labelNe: 'उम्लने' },
              ].map((item) => (
                <button
                  key={item.lvl}
                  onClick={() => {
                    setFlameLevel(item.lvl);
                    if (item.lvl > 0) ScienceAudio.playFireTorch();
                    else ScienceAudio.playPop();
                  }}
                  style={{
                    background: flameLevel === item.lvl ? 'rgba(249, 115, 22, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${flameLevel === item.lvl ? '#f97316' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '8px',
                    padding: '10px 4px',
                    color: flameLevel === item.lvl ? '#fb923c' : '#94a3b8',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.lvl > 0 ? '🔥' : '⚪'}</span>
                  <span>{lang === 'en' ? item.labelEn : item.labelNe}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Ice Refill Control */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Condensing Plate Cooling' : 'सङ्घनन प्लेट चिस्याउने'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                {Math.round(iceLevel)}% Ice
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'en'
                ? 'Ice cubes keep the glass plate freezing cold so rising steam instantly condenses.'
                : 'हिउँले प्लेटलाई चिसो राखिराख्छ, जसले गर्दा तातो बाफ ठोक्किनासाथ पानीका थोपा बन्दछन्।'}
            </p>

            <button
              onClick={handleRefillIce}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              <Snowflake size={14} />
              <span>{lang === 'en' ? '❄️ Refill Fresh Ice Cubes' : '❄️ नयाँ हिउँ थप्नुहोस्'}</span>
            </button>
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
              {lang === 'en' ? 'Concept Check' : 'विज्ञान अवधारणा जाँच'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'What is the process called when steam vapor cools down and turns back into liquid water?'
                : 'तातो बाफ चिसिएर फेरि तरल पानी बन्ने प्रक्रियालाई के भनिन्छ?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleQuizAnswer('evaporation')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 6px',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {lang === 'en' ? 'Evaporation' : 'वाष्पीकरण'}
              </button>

              <button
                onClick={() => handleQuizAnswer('condensation')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 6px',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {lang === 'en' ? 'Condensation' : 'सङ्घनन'}
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
                ? 'Evaporation and condensation together allow water to purify and circulate throughout nature in the water cycle.'
                : 'वाष्पीकरण र सङ्घनन दुवै मिलेर प्रकृतिमा पानी शुद्धीकरण हुन्छ र जलचक्र निरन्तर चलिरहन्छ।'}
            </p>
          </div>

          {/* 6. Complete Evaporation & Condensation Lab Button */}
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
            <span>{lang === 'en' ? 'Complete Evaporation Lab' : 'वाष्पीकरण प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
