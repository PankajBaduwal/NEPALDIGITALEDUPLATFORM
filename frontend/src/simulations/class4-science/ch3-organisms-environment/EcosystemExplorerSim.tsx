/**
 * EcosystemExplorerSim.tsx
 * Simulation 8: 2D Ecosystem Explorer Sandbox
 * Grade 4 Science • Chapter 3: Organisms and Environment
 *
 * 100% Native HTML5 Canvas 2D Interactive Ecological Simulation.
 * Features:
 * - Living mountain meadow and alpine freshwater stream biotope
 * - Biotic components: Producers (Trees, Grass), Herbivores (Musk Deer), Carnivores (Himalayan Eagle/Danfe), Aquatic (Fish)
 * - Abiotic sliders: Sunlight intensity, Water stream volume
 * - Dynamic Food Chain Energy Flow arrows with glowing particle pulses
 * - Real-time Ecosystem Health & Biodiversity index
 * - Bilingual EN/NE labels, environmental audio, and 5-stage inquiry learning
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Trees, Sun, Droplets, RotateCcw, Plus, Minus, Heart, Sparkles, Activity, Eye, Check } from 'lucide-react';

interface Animal {
  id: number;
  x: number;
  y: number;
  vx: number;
  facingRight: boolean;
  type: 'deer' | 'fish' | 'bird';
  bob: number;
}

export const EcosystemExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [treeCount, setTreeCount] = useState<number>(4);      // 1 to 7
  const [deerCount, setDeerCount] = useState<number>(3);      // 0 to 5
  const [sunlight, setSunlight] = useState<number>(75);       // 20 to 100%
  const [waterLevel, setWaterLevel] = useState<number>(80);   // 20 to 100%
  const [showFoodChain, setShowFoodChain] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const animalsRef = useRef<Animal[]>([]);

  // Health Score Calculation
  const healthScore = Math.min(
    100,
    Math.round(
      treeCount * 7 +
      deerCount * 6 +
      (sunlight / 100) * 20 +
      (waterLevel / 100) * 25 +
      (treeCount >= 3 && deerCount >= 2 ? 15 : 0)
    )
  );

  useEffect(() => {
    if (healthScore >= 85 && !isCompleted) {
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    }
  }, [healthScore, isCompleted]);

  // Maintain animal state instances
  useEffect(() => {
    const list: Animal[] = [];
    for (let i = 0; i < deerCount; i++) {
      list.push({
        id: i,
        x: 120 + i * 110 + (Math.random() - 0.5) * 40,
        y: 350 + (i % 2) * 25,
        vx: (Math.random() > 0.5 ? 1 : -1) * 0.4,
        facingRight: Math.random() > 0.5,
        type: 'deer',
        bob: Math.random() * Math.PI,
      });
    }
    // Fish in stream
    const fishCount = Math.max(1, Math.floor(waterLevel / 25));
    for (let f = 0; f < fishCount; f++) {
      list.push({
        id: 100 + f,
        x: 350 + f * 90,
        y: 450 + (f % 2) * 20,
        vx: 0.8,
        facingRight: true,
        type: 'fish',
        bob: f,
      });
    }
    animalsRef.current = list;
  }, [deerCount, waterLevel]);

  const handleReset = () => {
    setTreeCount(4);
    setDeerCount(3);
    setSunlight(75);
    setWaterLevel(80);
    setShowFoodChain(false);
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    ScienceAudio.playWhoosh();
  };

  // 60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Sky with Sunlight Intensity Gradient
      const sunRatio = sunlight / 100;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 320);
      skyGrad.addColorStop(0, `rgba(2, 132, 199, ${0.4 + sunRatio * 0.6})`);
      skyGrad.addColorStop(0.7, `rgba(125, 211, 252, ${0.3 + sunRatio * 0.7})`);
      skyGrad.addColorStop(1, `rgba(224, 242, 254, ${0.4 + sunRatio * 0.6})`);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glowing Sun Disc
      const sunX = 760;
      const sunY = 70;
      const sunRadius = 24 + sunRatio * 14;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, sunRadius * 2.5);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      sunGlow.addColorStop(0.4, 'rgba(250, 204, 21, 0.7)');
      sunGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Distant Himalayan Peaks
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(50, 240);
      ctx.lineTo(160, 110);
      ctx.lineTo(260, 240);
      ctx.lineTo(390, 90);
      ctx.lineTo(520, 240);
      ctx.lineTo(650, 130);
      ctx.lineTo(760, 240);
      ctx.lineTo(880, 250);
      ctx.lineTo(0, 250);
      ctx.closePath();
      ctx.fill();

      // Midground Green Hills
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(0, 260);
      ctx.quadraticCurveTo(240, 210, 480, 270);
      ctx.quadraticCurveTo(720, 220, 880, 280);
      ctx.lineTo(880, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Foreground Alpine Meadow Ground
      const groundGrad = ctx.createLinearGradient(0, 310, 0, canvas.height);
      groundGrad.addColorStop(0, '#16a34a');
      groundGrad.addColorStop(0.4, '#15803d');
      groundGrad.addColorStop(1, '#166534');
      ctx.fillStyle = groundGrad;
      ctx.beginPath();
      ctx.moveTo(0, 320);
      ctx.quadraticCurveTo(300, 300, 560, 330);
      ctx.quadraticCurveTo(740, 310, 880, 340);
      ctx.lineTo(880, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // 2. Meandering Freshwater Stream (Abiotic Water Resource)
      const streamWaterRatio = waterLevel / 100;
      const streamWidth = 35 + streamWaterRatio * 55;
      const streamGrad = ctx.createLinearGradient(0, 420, 0, 500);
      streamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      streamGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.9)');
      streamGrad.addColorStop(1, 'rgba(2, 132, 199, 0.95)');

      ctx.fillStyle = streamGrad;
      ctx.beginPath();
      ctx.moveTo(0, 470 - streamWidth / 2);
      ctx.quadraticCurveTo(300, 430, 560, 470);
      ctx.quadraticCurveTo(740, 490, 880, 460);
      ctx.lineTo(880, 460 + streamWidth);
      ctx.quadraticCurveTo(740, 490 + streamWidth, 560, 470 + streamWidth);
      ctx.quadraticCurveTo(300, 430 + streamWidth, 0, 470 + streamWidth);
      ctx.closePath();
      ctx.fill();

      // Stream Flowing Ripple Waves
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      for (let w = 0; w < 6; w++) {
        const wx = (w * 150 + time * 60) % 860;
        const wy = 465 + Math.sin(wx * 0.01) * 15;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + 25, wy);
        ctx.stroke();
      }

      // 3. Render Trees (Producers)
      const treeSlots = [
        { x: 80, y: 310, scale: 0.85 },
        { x: 200, y: 290, scale: 0.95 },
        { x: 340, y: 300, scale: 0.8 },
        { x: 480, y: 285, scale: 1.05 },
        { x: 620, y: 295, scale: 0.9 },
        { x: 730, y: 310, scale: 0.85 },
        { x: 820, y: 300, scale: 1.0 },
      ];

      for (let i = 0; i < treeCount && i < treeSlots.length; i++) {
        const t = treeSlots[i];
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.scale(t.scale, t.scale);

        // Trunk
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-7, -40, 14, 42);

        // Foliage Layers
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, -65, 34, 0, Math.PI * 2);
        ctx.arc(-18, -48, 22, 0, Math.PI * 2);
        ctx.arc(18, -48, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(-6, -72, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 4. Render Animals (Consumers)
      animalsRef.current.forEach((a) => {
        a.bob += 0.05;
        if (a.type === 'deer') {
          // Wander slowly
          a.x += a.vx;
          if (a.x < 60) {
            a.x = 60;
            a.vx = Math.abs(a.vx);
            a.facingRight = true;
          } else if (a.x > 820) {
            a.x = 820;
            a.vx = -Math.abs(a.vx);
            a.facingRight = false;
          }

          // Draw Deer
          ctx.save();
          ctx.translate(a.x, a.y + Math.sin(a.bob) * 1.5);
          if (!a.facingRight) ctx.scale(-1, 1);

          // Body
          ctx.fillStyle = '#92400e';
          ctx.beginPath();
          ctx.ellipse(0, 0, 18, 11, 0, 0, Math.PI * 2);
          ctx.fill();

          // Neck & Head
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.ellipse(14, -10, 6, 12, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(20, -18, 7, 0, Math.PI * 2);
          ctx.fill();

          // Ears
          ctx.beginPath();
          ctx.ellipse(18, -26, 3, 7, Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();

          // Eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(22, -19, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(22.5, -19, 1, 0, Math.PI * 2);
          ctx.fill();

          // 4 Legs
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-10, 8);
          ctx.lineTo(-10, 24);
          ctx.moveTo(-4, 8);
          ctx.lineTo(-4, 24);
          ctx.moveTo(8, 8);
          ctx.lineTo(8, 24);
          ctx.moveTo(14, 8);
          ctx.lineTo(14, 24);
          ctx.stroke();

          // White tail tip
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(-18, -4, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        } else if (a.type === 'fish') {
          // Fish swimming in brook
          a.x += a.vx;
          if (a.x > 880) a.x = 20;

          ctx.save();
          ctx.translate(a.x, a.y + Math.sin(a.bob * 2) * 3);

          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Tail fin
          ctx.beginPath();
          ctx.moveTo(-9, 0);
          ctx.lineTo(-15, -4);
          ctx.lineTo(-15, 4);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      });

      // 5. Flying Danfe Bird (Carnivore / Omnivore) in Sky
      const birdX = (time * 70) % 940 - 30;
      const birdY = 120 + Math.sin(time * 2) * 15;
      const wingFlap = Math.sin(time * 12);

      ctx.save();
      ctx.translate(birdX, birdY);
      // Iridescent blue/emerald Danfe plumage
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wings
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.moveTo(-2, -2);
      ctx.lineTo(2, wingFlap * 14 - 8);
      ctx.lineTo(8, -2);
      ctx.closePath();
      ctx.fill();

      // Beak
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(16, 2);
      ctx.lineTo(12, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 6. Food Chain Energy Flow Overlay
      if (showFoodChain) {
        // Sun to Tree Arrow
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(sunX - 20, sunY + 20);
        ctx.lineTo(500, 260);
        ctx.stroke();

        // Tree to Deer Arrow
        ctx.strokeStyle = '#4ade80';
        ctx.beginPath();
        ctx.moveTo(500, 310);
        ctx.lineTo(340, 350);
        ctx.stroke();

        // Deer to Eagle/Danfe Arrow
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(340, 350);
        ctx.lineTo(birdX, birdY + 10);
        ctx.stroke();
        ctx.setLineDash([]);

        // Food Chain Legend Box (Bottom Left)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(20, 20, 250, 100, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(lang === 'ne' ? 'आहार शृंखला (Food Chain):' : 'Ecological Food Web:', 30, 40);

        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.fillText('☀️ सूर्य (Energy) → 🌲 उत्पादक (Producer)', 30, 58);
        ctx.fillStyle = '#4ade80';
        ctx.fillText('🌲 रुख → 🦌 शाकाहारी (Herbivore)', 30, 76);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('🦌 मृग → 🦅 मांसाहारी (Carnivore)', 30, 94);
      }

      // 7. Ecosystem Health Index Meter (Top Left)
      const meterX = 20;
      const meterY = showFoodChain ? 130 : 20;
      const meterW = 240;
      const meterH = 75;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(meterX, meterY, meterW, meterH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? 'पारिस्थितिक स्वास्थ्य (Health):' : 'Ecosystem Health Index:', meterX + 12, meterY + 22);

      // Gauge bar
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(meterX + 12, meterY + 32, meterW - 24, 14, 7);
      ctx.fill();

      const healthRatio = healthScore / 100;
      const hGrad = ctx.createLinearGradient(meterX + 12, 0, meterX + meterW - 12, 0);
      hGrad.addColorStop(0, '#ef4444');
      hGrad.addColorStop(0.5, '#eab308');
      hGrad.addColorStop(1, '#22c55e');
      ctx.fillStyle = hGrad;
      ctx.beginPath();
      ctx.roundRect(meterX + 12, meterY + 32, (meterW - 24) * healthRatio, 14, 7);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${healthScore}%`, meterX + meterW - 16, meterY + 44);

      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#facc15' : '#f87171';
      ctx.fillText(
        healthScore >= 80
          ? (lang === 'ne' ? '✓ सन्तुलित र स्वस्थ वातावरण' : '✓ Flourishing Balanced Habitat')
          : (lang === 'ne' ? '⚠️ वन र पानीको मात्रा बढाउनुहोस्' : '⚠️ Add more trees or water for balance'),
        meterX + 12,
        meterY + 62
      );

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [treeCount, deerCount, sunlight, waterLevel, showFoodChain, healthScore, lang]);

  return (
    <SimulationLayout
      titleEn="2D Ecosystem Explorer Sandbox"
      titleNe="पारिस्थितिक प्रणाली 2डी अन्वेषक"
      subject="Science"
      grade={4}
      chapter={3}
      stage={stage}
      onStageChange={setStage}
      lang={lang}
      onLangChange={setLang}
      stars={stars}
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
            LEFT COLUMN: INTERACTIVE 2D ECOSYSTEM CANVIEWPORT
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
            height={520}
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
                background: healthScore >= 70 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                border: healthScore >= 70 ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                color: healthScore >= 70 ? '#4ade80' : '#fbbf24',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Heart size={13} />
              {lang === 'ne' ? `स्वास्थ्य सूचकांक: ${healthScore}%` : `Ecosystem Health: ${healthScore}%`}
            </span>

            <button
              onClick={() => {
                setShowFoodChain(!showFoodChain);
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: showFoodChain ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
                background: showFoodChain ? 'rgba(245, 158, 11, 0.25)' : 'rgba(15, 23, 42, 0.8)',
                color: showFoodChain ? '#fbbf24' : '#cbd5e1',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Activity size={13} />
              {lang === 'ne' ? (showFoodChain ? 'आहार चक्र: चालु' : 'आहार चक्र देखाउनुहोस्') : (showFoodChain ? 'Food Web: ON' : 'Show Food Web')}
            </button>
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
                  background: healthScore >= 70 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  border: healthScore >= 70 ? '1px solid #22c55e' : '1px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {healthScore >= 70 ? '🌿' : '⚖️'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {healthScore >= 80
                    ? (lang === 'ne' ? 'पारिस्थितिक प्रणाली पूर्ण सन्तुलित र स्वस्थ छ!' : 'Ecosystem in Optimal Dynamic Equilibrium!')
                    : (lang === 'ne' ? 'पारिस्थितिक प्रणालीको अध्ययन जारी राख्नुहोस्' : 'Ecosystem Active: Balancing Population & Resources')}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {lang === 'ne'
                    ? `उत्पादक रुख: ${treeCount} | उपभोक्ता मृग: ${deerCount} | घाम: ${sunlight}% | पानी: ${waterLevel}%`
                    : `Producers: ${treeCount} trees | Consumers: ${deerCount} deer | Solar: ${sunlight}% | Hydration: ${waterLevel}%`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleReset}
                title="Reset Ecosystem"
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
            RIGHT COLUMN: ECOSYSTEM LAB WORKSPACE & TUNING (380px)
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
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#4ade80" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#4ade80' }}>
                {lang === 'ne' ? 'पारिस्थितिक प्रणाली अन्वेषक' : 'Ecosystem Sandbox Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              {lang === 'ne'
                ? 'उत्पादक (रुख), उपभोक्ता (मृग) र निर्जीव तत्वहरू (घाम र पानी) मिलेर पर्यावरण सन्तुलन बन्दछ।'
                : 'Living producers, consumers, and abiotic solar and water resources interact in continuous energy flow.'}
            </div>
          </div>

          {/* Biotic Population Controls */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              {lang === 'en' ? 'BIOTIC POPULATION TUNING' : 'सजीव प्राणीको संख्या नियन्त्रण'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Tree Producer Stepper */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80' }}>
                    🌲 {lang === 'ne' ? 'उत्पादक रुख (Trees)' : 'Producers (Trees)'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {lang === 'ne' ? 'खाना र अक्सिजन बनाउँछ' : 'Produces biomass via photosynthesis'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      ScienceAudio.playPop();
                      setTreeCount((p) => Math.max(1, p - 1));
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#4ade80', minWidth: '16px', textAlign: 'center' }}>
                    {treeCount}
                  </span>
                  <button
                    onClick={() => {
                      ScienceAudio.playPop();
                      setTreeCount((p) => Math.min(7, p + 1));
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#16a34a',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Deer Consumer Stepper */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#facc15' }}>
                    🦌 {lang === 'ne' ? 'शाकाहारी उपभोक्ता (Deer)' : 'Herbivores (Deer)'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {lang === 'ne' ? 'बिरुवा खान्छ' : 'Feeds on grass and shrub boughs'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      ScienceAudio.playPop();
                      setDeerCount((p) => Math.max(0, p - 1));
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#facc15', minWidth: '16px', textAlign: 'center' }}>
                    {deerCount}
                  </span>
                  <button
                    onClick={() => {
                      ScienceAudio.playPop();
                      setDeerCount((p) => Math.min(5, p + 1));
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#d97706',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Abiotic Sliders */}
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
            {/* Sunlight Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sun size={13} color="#facc15" />
                  {lang === 'en' ? 'Sunlight Intensity' : 'घामको तीव्रता'}
                </span>
                <strong style={{ color: '#facc15' }}>{sunlight}%</strong>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={sunlight}
                onChange={(e) => setSunlight(Number(e.target.value))}
                style={{ width: '100%', height: '5px', accentColor: '#facc15', cursor: 'pointer', marginTop: '6px' }}
              />
            </div>

            {/* Water Stream Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Droplets size={13} color="#38bdf8" />
                  {lang === 'en' ? 'Glacial Stream Hydration' : 'खोलाको पानी'}
                </span>
                <strong style={{ color: '#38bdf8' }}>{waterLevel}%</strong>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={waterLevel}
                onChange={(e) => setWaterLevel(Number(e.target.value))}
                style={{ width: '100%', height: '5px', accentColor: '#38bdf8', cursor: 'pointer', marginTop: '6px' }}
              />
            </div>
          </div>

          {/* Ecosystem Health Progress Meter */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
              <span>{lang === 'en' ? 'Ecosystem Health Index' : 'स्वास्थ्य सूचकांक'}</span>
              <strong style={{ color: healthScore >= 70 ? '#4ade80' : '#fbbf24' }}>{healthScore}%</strong>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${healthScore}%`,
                  height: '100%',
                  background: healthScore >= 70 ? 'linear-gradient(90deg, #0ea5e9, #22c55e)' : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                  borderRadius: '3px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Curriculum Key Takeaway */}
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#4ade80', marginBottom: '4px' }}>
              {lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रम मुख्य निष्कर्ष'}
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              {lang === 'en'
                ? 'An ecosystem is balanced when producers (plants) capture sunlight and water to support consumers (animals). Disruption to abiotic factors disrupts the entire food chain.'
                : 'पारिस्थितिक प्रणालीमा उत्पादक (बिरुवा) ले घाम र पानीको प्रयोग गरी खाना बनाउँछन् जसले उपभोक्ता (जनावर) लाई धान्छ। कुनै एक तत्वमा असर परेमा सम्पूर्ण आहार चक्र प्रभावित हुन्छ।'}
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
            {lang === 'en' ? '✓ Complete Ecosystem Lab & Quiz' : '✓ पारिस्थितिक प्रयोगशाला पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default EcosystemExplorerSim;
