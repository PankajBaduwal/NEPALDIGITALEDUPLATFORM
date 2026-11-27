/**
 * WaterCycleSim.tsx
 * Simulation 23: 2D Water Cycle Panoramic Himalayan Landscape (जलचक्र - हिमाली दृश्य)
 * Grade 4 Science • Chapter 6: Matter (पदार्थ)
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - Panoramic Nepali topography: Snow-capped Himalayan summits, terraced hills, pine forest, and mountain lake.
 * - Continuous 4-stage hydrological cycle:
 *   1. Evaporation (वाष्पीकरण): Rising vapor particles from lake and transpiration from forest trees
 *   2. Condensation (सङ्घनन): Water vapor cools in high altitude to form puffy white/grey storm clouds
 *   3. Precipitation (वर्षा तथा हिमपात): Rain plunging onto hills and snow replenishing high mountain glaciers
 *   4. Collection & Surface Runoff (संकलन तथा नदी प्रवाह): Meltwater streams and rivers flowing downhill back into the lake
 * - Interactive stage focus buttons (All, Evaporation, Condensation, Precipitation, Collection)
 * - Play/Pause controls, weather sliders, bilingual EN/NE, and mastery quiz.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Sun, CloudRain, Droplets, RotateCcw, Sparkles, Play, Pause, Mountain, Check } from 'lucide-react';

type CycleStage = 'all' | 'evaporation' | 'condensation' | 'precipitation' | 'collection';

interface VaporParticle {
  x: number;
  y: number;
  vy: number;
  alpha: number;
  r: number;
}

interface RainParticle {
  x: number;
  y: number;
  vy: number;
  len: number;
  isSnow: boolean;
}

export const WaterCycleSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [activeStage, setActiveStage] = useState<CycleStage>('all');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [sunPower, setSunPower] = useState<number>(80); // 0 to 100%
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const vaporRef = useRef<VaporParticle[]>([]);
  const rainRef = useRef<RainParticle[]>([]);

  // Initialize particles
  useEffect(() => {
    // 25 vapor particles from lake
    const vList: VaporParticle[] = [];
    for (let i = 0; i < 28; i++) {
      vList.push({
        x: 520 + Math.random() * 320,
        y: 380 + Math.random() * 120,
        vy: 1.2 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.6,
        r: 3 + Math.random() * 4,
      });
    }
    vaporRef.current = vList;

    // 40 rain particles
    const rList: RainParticle[] = [];
    for (let i = 0; i < 45; i++) {
      const isSnow = Math.random() < 0.35;
      rList.push({
        x: isSnow ? 140 + Math.random() * 300 : 380 + Math.random() * 440,
        y: 120 + Math.random() * 320,
        vy: isSnow ? 1.5 + Math.random() * 1.5 : 8 + Math.random() * 5,
        len: isSnow ? 3 : 12,
        isSnow,
      });
    }
    rainRef.current = rList;
  }, []);

  const handleStageSelect = (stg: CycleStage) => {
    setActiveStage(stg);
    ScienceAudio.playPop();
    if (stg !== 'all') {
      setStars(Math.min(3, 2));
    }
  };

  const handleReset = () => {
    setActiveStage('all');
    setIsPlaying(true);
    setSunPower(80);
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
      if (isPlaying) time += 0.03;
      ctx.clearRect(0, 0, 880, 560);

      // 1. SKY GRADIENT
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 360);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.5, '#38bdf8');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 880, 380);

      // 2. RADIANT SUN (Top Right)
      drawSun(ctx, 760, 80, sunPower, time);

      // 3. SNOW-CAPPED HIMALAYAS
      drawHimalayanMountains(ctx);

      // 4. TERRACED HILLS & GREEN VALLEY
      drawHillsAndValley(ctx);

      // 5. ALPINE LAKE & RIVER (COLLECTION)
      drawLakeAndRiver(ctx, time);

      // 6. EVAPORATION PARTICLES (from water & forest)
      if (activeStage === 'all' || activeStage === 'evaporation') {
        updateAndDrawVapor(ctx, time, sunPower);
      }

      // 7. CONDENSATION: STORM CLOUDS
      if (activeStage === 'all' || activeStage === 'condensation' || activeStage === 'precipitation') {
        drawCondensationClouds(ctx, time, activeStage);
      }

      // 8. PRECIPITATION: RAIN AND SNOW
      if (activeStage === 'all' || activeStage === 'precipitation') {
        updateAndDrawPrecipitation(ctx);
      }

      // 9. CYCLE ARROWS & ANNOTATION LABELS
      drawCycleHUD(ctx, activeStage, time, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeStage, isPlaying, sunPower, lang]);

  // Sun
  function drawSun(ctx: CanvasRenderingContext2D, sx: number, sy: number, power: number, t: number) {
    ctx.save();
    const radius = 32;
    const rayIntensity = power / 100;

    // Solar corona glow
    const corona = ctx.createRadialGradient(sx, sy, radius * 0.5, sx, sy, radius * 2.8 * rayIntensity);
    corona.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
    corona.addColorStop(0.4, 'rgba(253, 224, 71, 0.4)');
    corona.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(sx, sy, radius * 2.8 * rayIntensity, 0, Math.PI * 2);
    ctx.fill();

    // Solid sun core
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Radiating rotating rays
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
    ctx.lineWidth = 3;
    for (let r = 0; r < 12; r++) {
      const angle = (r / 12) * Math.PI * 2 + t * 0.3;
      const rayLen = 14 + Math.sin(t * 3 + r) * 4;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(angle) * (radius + 4), sy + Math.sin(angle) * (radius + 4));
      ctx.lineTo(sx + Math.cos(angle) * (radius + 4 + rayLen), sy + Math.sin(angle) * (radius + 4 + rayLen));
      ctx.stroke();
    }
    ctx.restore();
  }

  // Himalayan Mountains
  function drawHimalayanMountains(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Far Peaks
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(0, 310);
    ctx.lineTo(120, 130);
    ctx.lineTo(260, 320);
    ctx.closePath();
    ctx.fill();

    // Snowcap Peak 1
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(120, 130);
    ctx.lineTo(165, 195);
    ctx.lineTo(145, 185);
    ctx.lineTo(125, 205);
    ctx.lineTo(105, 185);
    ctx.lineTo(75, 195);
    ctx.closePath();
    ctx.fill();

    // Main Mount Everest / Machhapuchhre Peak (Center-left)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(160, 330);
    ctx.lineTo(310, 85);
    ctx.lineTo(470, 330);
    ctx.closePath();
    ctx.fill();

    // Snowcap Main Peak
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(310, 85);
    ctx.lineTo(365, 165);
    ctx.lineTo(345, 155);
    ctx.lineTo(325, 180);
    ctx.lineTo(295, 160);
    ctx.lineTo(260, 175);
    ctx.closePath();
    ctx.fill();

    // Glacier Tongue running down mountain valley
    const glacierGrad = ctx.createLinearGradient(310, 170, 280, 320);
    glacierGrad.addColorStop(0, '#e0f2fe');
    glacierGrad.addColorStop(0.6, '#bae6fd');
    glacierGrad.addColorStop(1, '#7dd3fc');
    ctx.fillStyle = glacierGrad;
    ctx.beginPath();
    ctx.moveTo(310, 170);
    ctx.lineTo(325, 180);
    ctx.quadraticCurveTo(310, 250, 290, 320);
    ctx.lineTo(275, 320);
    ctx.quadraticCurveTo(295, 250, 295, 160);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Hills and Valley
  function drawHillsAndValley(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Mid-ground Forest Ridge
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(0, 330);
    ctx.bezierCurveTo(150, 270, 300, 320, 480, 290);
    ctx.lineTo(480, 440);
    ctx.lineTo(0, 440);
    ctx.closePath();
    ctx.fill();

    // Pine Trees on Ridge
    for (let tx = 30; tx < 440; tx += 45) {
      drawPineSilhouette(ctx, tx, 300 + (tx % 30));
    }

    // Foreground lush green valley slope
    const slopeGrad = ctx.createLinearGradient(0, 320, 500, 560);
    slopeGrad.addColorStop(0, '#22c55e');
    slopeGrad.addColorStop(0.5, '#16a34a');
    slopeGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = slopeGrad;
    ctx.beginPath();
    ctx.moveTo(0, 330);
    ctx.bezierCurveTo(180, 340, 340, 410, 460, 460);
    ctx.lineTo(460, 560);
    ctx.lineTo(0, 560);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawPineSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(x, y - 25);
    ctx.lineTo(x + 12, y);
    ctx.lineTo(x - 12, y);
    ctx.closePath();
    ctx.fill();
  }

  // Alpine Lake & River (Collection)
  function drawLakeAndRiver(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    // Flowing River from Glacier to Lake
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(280, 320);
    ctx.bezierCurveTo(340, 370, 400, 420, 480, 450);
    ctx.stroke();

    // Lake body from x: 440 to 880, y: 390 to 560
    const lakeGrad = ctx.createLinearGradient(550, 390, 750, 560);
    lakeGrad.addColorStop(0, '#38bdf8');
    lakeGrad.addColorStop(0.3, '#0ea5e9');
    lakeGrad.addColorStop(0.7, '#0284c7');
    lakeGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = lakeGrad;

    ctx.beginPath();
    ctx.moveTo(460, 450);
    ctx.bezierCurveTo(550, 400, 700, 410, 880, 390);
    ctx.lineTo(880, 560);
    ctx.lineTo(460, 560);
    ctx.closePath();
    ctx.fill();

    // Lake surface waves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    for (let ly = 430; ly <= 530; ly += 25) {
      ctx.beginPath();
      for (let lx = 520; lx < 860; lx += 30) {
        ctx.moveTo(lx, ly + Math.sin(t * 3 + lx * 0.05) * 2);
        ctx.lineTo(lx + 18, ly + Math.sin(t * 3 + lx * 0.05) * 2);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Evaporation: rising water vapor
  function updateAndDrawVapor(ctx: CanvasRenderingContext2D, t: number, power: number) {
    ctx.save();
    const vSpeed = (power / 100) * 1.8;

    vaporRef.current.forEach((p) => {
      p.y -= p.vy * vSpeed;
      if (p.y < 160) {
        p.y = 440 + Math.random() * 80;
        p.x = 520 + Math.random() * 320;
      }

      ctx.fillStyle = `rgba(186, 230, 253, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x + Math.sin(t * 2 + p.y * 0.05) * 8, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Arrow indicator pointing up from lake
    drawWavyVaporArrow(ctx, 680, 410, 680, 220);
    ctx.restore();
  }

  function drawWavyVaporArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x1 + 15, (y1 + y2) * 0.5, x2, y2);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 6, y2 + 10);
    ctx.lineTo(x2 + 6, y2 + 10);
    ctx.closePath();
    ctx.fill();
  }

  // Condensation Clouds
  function drawCondensationClouds(ctx: CanvasRenderingContext2D, t: number, stg: CycleStage) {
    ctx.save();
    // Cloud 1: Mountain Summit Snowcloud (darker grey storm)
    drawPuffyCloud(ctx, 240, 110, 75, '#cbd5e1', '#64748b');

    // Cloud 2: Central Raincloud
    drawPuffyCloud(ctx, 500, 130, 95, '#e2e8f0', '#94a3b8');

    // Cloud 3: Floating cloud
    drawPuffyCloud(ctx, 690, 150, 65, '#f8fafc', '#cbd5e1');
    ctx.restore();
  }

  function drawPuffyCloud(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    topCol: string,
    botCol: string
  ) {
    const cGrad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    cGrad.addColorStop(0, topCol);
    cGrad.addColorStop(1, botCol);
    ctx.fillStyle = cGrad;

    ctx.beginPath();
    ctx.arc(cx - r * 0.5, cy, r * 0.6, 0, Math.PI * 2);
    ctx.arc(cx, cy - r * 0.35, r * 0.75, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.6, cy, r * 0.55, 0, Math.PI * 2);
    ctx.arc(cx, cy + r * 0.25, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Precipitation: Falling Rain and Snow
  function updateAndDrawPrecipitation(ctx: CanvasRenderingContext2D) {
    ctx.save();
    rainRef.current.forEach((r) => {
      r.y += r.vy;

      if (r.y > 480) {
        r.y = 150 + Math.random() * 40;
      }

      if (r.isSnow) {
        // Snow particle (white snowflake dot)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Rain drop streak
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 2, r.y + r.len);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // Cycle Annotations HUD
  function drawCycleHUD(
    ctx: CanvasRenderingContext2D,
    stg: CycleStage,
    t: number,
    currentLang: Language
  ) {
    ctx.save();
    // 1. Evaporation Tag (Lake surface)
    drawStageBadge(
      ctx,
      710,
      360,
      currentLang === 'en' ? '1. Evaporation (वाष्पीकरण)' : '१. वाष्पीकरण (Evaporation)',
      stg === 'evaporation' || stg === 'all',
      '#facc15'
    );

    // 2. Condensation Tag (Clouds)
    drawStageBadge(
      ctx,
      500,
      80,
      currentLang === 'en' ? '2. Condensation (सङ्घनन)' : '२. सङ्घनन (Condensation)',
      stg === 'condensation' || stg === 'all',
      '#38bdf8'
    );

    // 3. Precipitation Tag (Rain/Snow)
    drawStageBadge(
      ctx,
      270,
      220,
      currentLang === 'en' ? '3. Precipitation (वर्षा/हिमपात)' : '३. वर्षा र हिमपात (Precipitation)',
      stg === 'precipitation' || stg === 'all',
      '#60a5fa'
    );

    // 4. Collection Tag (River/Lake Runoff)
    drawStageBadge(
      ctx,
      380,
      480,
      currentLang === 'en' ? '4. Collection (संकलन र नदी)' : '४. जल संकलन र नदी (Collection)',
      stg === 'collection' || stg === 'all',
      '#4ade80'
    );

    ctx.restore();
  }

  function drawStageBadge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    isActive: boolean,
    col: string
  ) {
    ctx.save();
    ctx.fillStyle = isActive ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.6)';
    ctx.strokeStyle = isActive ? col : '#475569';
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.roundRect(x - 85, y - 14, 170, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isActive ? col : '#94a3b8';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 4);
    ctx.restore();
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'sun') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! Solar energy powers the entire water cycle.' : 'सबास! सूर्यको तापले नै सम्पूर्ण जलचक्रलाई चलाउँछ।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. The Sun provides the main thermal energy.' : 'मिलेन। सूर्य नै जलचक्रको मुख्य शक्ति स्रोत हो।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'The Water Cycle Simulator' : 'जलचक्र (The Water Cycle)'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 6: Matter'
          : 'कक्षा ४ विज्ञान • एकाइ ६: पदार्थ'
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

          {/* Active Stage Floating Badge */}
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
                {activeStage === 'all'
                  ? lang === 'en' ? 'Full Hydrological Cycle in Motion' : 'पूर्ण हिमाली जलचक्र'
                  : activeStage === 'evaporation'
                  ? lang === 'en' ? 'Stage 1: Solar Evaporation & Transpiration' : 'पहिलो चरण: सौर्य वाष्पीकरण'
                  : activeStage === 'condensation'
                  ? lang === 'en' ? 'Stage 2: High Altitude Cloud Condensation' : 'दोस्रो चरण: बादल सङ्घनन'
                  : activeStage === 'precipitation'
                  ? lang === 'en' ? 'Stage 3: Rain & Snowfall Precipitation' : 'तेस्रो चरण: वर्षा तथा हिमपात'
                  : lang === 'en' ? 'Stage 4: Mountain River Runoff & Collection' : 'चौथो चरण: नदी प्रवाह र संकलन'}
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
                🌊
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {lang === 'en' ? 'Himalayan Hydrological System' : 'हिमालयी जल प्रणाली'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en'
                    ? 'Glacier melt → River runoff → Terai evaporation → Mountain monsoon rainfall'
                    : 'हिमनदी पग्लने → नदी प्रवाह → तराई वाष्पीकरण → पहाडी वर्षा'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Solar Power' : 'सौर्य शक्ति'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#facc15' }}>
                  {sunPower}%
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
              <span style={{ fontSize: '16px' }}>💧</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Hydrological Discovery Station' : 'जलचक्र अनुसन्धान केन्द्र'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'The water cycle continuously recirculates Earth’s water through evaporation, condensation, precipitation, and collection.'
                : 'जलचक्रले पृथ्वीको पानीलाई वाष्पीकरण, सङ्घनन, वर्षा र संकलनमार्फत निरन्तर घुमाइरहन्छ।'}
            </p>
          </div>

          {/* 2. Cycle Stage Selectors */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Inspect Cycle Stages' : 'जलचक्रका चरणहरू'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {[
                { id: 'all', nameEn: '🔄 All Stages', nameNe: '🔄 सम्पूर्ण चक्र' },
                { id: 'evaporation', nameEn: '☀️ Evaporation', nameNe: '☀️ वाष्पीकरण' },
                { id: 'condensation', nameEn: '☁️ Condensation', nameNe: '☁️ सङ्घनन' },
                { id: 'precipitation', nameEn: '🌧️ Precipitation', nameNe: '🌧️ वर्षा/हिमपात' },
                { id: 'collection', nameEn: '🏞️ Collection', nameNe: '🏞️ संकलन' },
              ].map((stg) => (
                <button
                  key={stg.id}
                  onClick={() => handleStageSelect(stg.id as CycleStage)}
                  style={{
                    background: activeStage === stg.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activeStage === stg.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: activeStage === stg.id ? '#38bdf8' : '#e2e8f0',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {lang === 'en' ? stg.nameEn : stg.nameNe}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Environmental Controls (Sun Power & Animation) */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#facc15' }}>
                <Sun size={14} />
                <span>{lang === 'en' ? 'Solar Radiation Heat' : 'सौर्य ताप शक्ति'}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#facc15' }}>
                {sunPower}%
              </span>
            </div>

            <input
              type="range"
              min={20}
              max={100}
              value={sunPower}
              onChange={(e) => setSunPower(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#facc15',
                cursor: 'pointer',
              }}
            />

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid #e2e8f0',
                color: '#ffffff',
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
              <span>{isPlaying ? (lang === 'en' ? 'Pause Animation' : 'रोक्नुहोस्') : (lang === 'en' ? 'Resume Animation' : 'सुरु गर्नुहोस्')}</span>
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
              {lang === 'en' ? 'Water Cycle Quiz' : 'जलचक्र प्रश्न'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'What is the main energy source that evaporates water and drives the water cycle?'
                : 'पानीलाई बाफ बनाई सम्पूर्ण जलचक्र चलाउने मुख्य शक्ति स्रोत के हो?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleQuizAnswer('wind')}
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
                {lang === 'en' ? 'Wind (हावा)' : 'हावा'}
              </button>

              <button
                onClick={() => handleQuizAnswer('sun')}
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
                {lang === 'en' ? 'Sun (सूर्य)' : 'सूर्य'}
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
                ? 'Solar heat drives the continuous cycle of water from Earth surface to atmosphere and back through precipitation.'
                : 'सूर्यको तापले पानीलाई निरन्तर बाफ बनाएर आकाशमा पुर्‍याउँछ र बादल बनेर वर्षाको रूपमा फेरि जमिनमा फर्काउँछ।'}
            </p>
          </div>

          {/* 6. Complete Water Cycle Lab Button */}
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
            <span>{lang === 'en' ? 'Complete Water Cycle Lab & Quiz' : 'जलचक्र प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
