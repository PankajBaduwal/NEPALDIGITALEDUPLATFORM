/**
 * EcosystemSimulatorSim.tsx
 * Simulation 9: 2D Ecosystem Simulator (पारिस्थितिक प्रणाली २डी सिमुलेटर)
 * Grade 6 Science • Unit 4: Environment and Biodiversity (वातावरण र जैविक विविधता)
 *
 * 100% Native HTML5 Canvas 2D Ecological Simulator.
 * Features:
 * - Mountain forest & wetland ecosystem featuring Producers, Consumers (Primary, Secondary, Tertiary), and Decomposers
 * - Dynamic Abiotic Controls: Sunlight Intensity, Rainfall Volume, and Soil Fertility
 * - Real-time Population Health Gauges: Producers, Herbivores, Carnivores, Decomposers
 * - Animated Nutrient & Energy Flow cycles (Sun -> Producers -> Consumers -> Decomposers -> Soil)
 * - Bilingual EN/NE labels, ambient nature audio, and 5-stage inquiry pedagogy
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Sun, CloudRain, Sprout, Bug, Fish, Sparkles, RefreshCw, Eye, ShieldCheck, Activity, Check } from 'lucide-react';

type ComponentFilter = 'all' | 'producers' | 'consumers' | 'decomposers' | 'abiotic';

export const EcosystemSimulatorSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Environmental Controls
  const [sunlight, setSunlight] = useState<number>(75); // 0 - 100%
  const [rainfall, setRainfall] = useState<number>(60); // 0 - 100%
  const [soilNutrient, setSoilNutrient] = useState<'low' | 'medium' | 'rich'>('rich');
  const [activeFilter, setActiveFilter] = useState<ComponentFilter>('all');
  const [showCycles, setShowCycles] = useState<boolean>(true);

  // Calculated Ecological Health indices
  const plantHealth = Math.min(100, Math.round(sunlight * 0.45 + rainfall * 0.4 + (soilNutrient === 'rich' ? 25 : soilNutrient === 'medium' ? 15 : 5)));
  const herbivoreHealth = Math.min(100, Math.round(plantHealth * 0.85 + (rainfall > 20 ? 15 : 0)));
  const carnivoreHealth = Math.min(100, Math.round(herbivoreHealth * 0.8 + (plantHealth > 30 ? 20 : 0)));
  const decomposerHealth = Math.min(100, Math.round(rainfall * 0.5 + 40));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (plantHealth >= 80 && herbivoreHealth >= 75 && !isCompleted) {
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    }
  }, [plantHealth, herbivoreHealth, isCompleted]);

  const handleReset = () => {
    setSunlight(75);
    setRainfall(60);
    setSoilNutrient('rich');
    setActiveFilter('all');
    setShowCycles(true);
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

      // 1. Sky & Sun
      const sunRatio = sunlight / 100;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 260);
      if (rainfall > 65) {
        // Overcast rainy sky
        skyGrad.addColorStop(0, '#334155');
        skyGrad.addColorStop(1, '#64748b');
      } else {
        skyGrad.addColorStop(0, `rgba(2, 132, 199, ${0.4 + sunRatio * 0.6})`);
        skyGrad.addColorStop(0.7, `rgba(56, 189, 248, ${0.4 + sunRatio * 0.6})`);
        skyGrad.addColorStop(1, '#e0f2fe');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radiant Sun (Abiotic)
      const sunX = 760;
      const sunY = 65;
      const sunR = 24 + sunRatio * 16;
      if (rainfall <= 80) {
        const glow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, sunR * 2.5);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        glow.addColorStop(0.4, 'rgba(250, 204, 21, 0.6)');
        glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant Himalayan Peaks
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(50, 220);
      ctx.lineTo(160, 90);
      ctx.lineTo(270, 220);
      ctx.lineTo(410, 70);
      ctx.lineTo(550, 220);
      ctx.lineTo(680, 110);
      ctx.lineTo(790, 220);
      ctx.lineTo(880, 230);
      ctx.lineTo(0, 230);
      ctx.closePath();
      ctx.fill();

      // Hillside Forest (Producers)
      const hillGrad = ctx.createLinearGradient(0, 200, 0, canvas.height);
      const isLush = plantHealth >= 60;
      hillGrad.addColorStop(0, isLush ? '#15803d' : '#854d0e');
      hillGrad.addColorStop(0.4, isLush ? '#166534' : '#713f12');
      hillGrad.addColorStop(1, isLush ? '#14532d' : '#451a03');
      ctx.fillStyle = hillGrad;
      ctx.beginPath();
      ctx.moveTo(0, 240);
      ctx.quadraticCurveTo(240, 190, 480, 250);
      ctx.quadraticCurveTo(720, 210, 880, 260);
      ctx.lineTo(880, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Wetland Pond in center (Abiotic & Aquatic biome)
      const pondGrad = ctx.createLinearGradient(0, 380, 0, canvas.height);
      pondGrad.addColorStop(0, '#0284c7');
      pondGrad.addColorStop(0.6, '#0369a1');
      pondGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = pondGrad;
      ctx.beginPath();
      ctx.moveTo(280, 390);
      ctx.quadraticCurveTo(450, 350, 640, 400);
      ctx.quadraticCurveTo(700, 480, 560, 510);
      ctx.quadraticCurveTo(340, 520, 260, 460);
      ctx.closePath();
      ctx.fill();

      // Water Ripple Waves
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      for (let w = 0; w < 4; w++) {
        const wx = 340 + w * 75 + Math.sin(time + w) * 12;
        const wy = 410 + (w % 3) * 25;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + 22, wy);
        ctx.stroke();
      }

      // 2. Render Biotic Components

      // PRODUCERS: Forest Trees & Water Lilies
      if (activeFilter === 'all' || activeFilter === 'producers') {
        const treeSlots = [
          { x: 90, y: 280, scale: 0.9 },
          { x: 190, y: 260, scale: 1.1 },
          { x: 710, y: 280, scale: 0.95 },
          { x: 800, y: 260, scale: 1.15 },
        ];

        treeSlots.forEach((t) => {
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.scale(t.scale, t.scale);

          // Trunk
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-6, -35, 12, 38);

          // Foliage
          ctx.fillStyle = isLush ? '#16a34a' : '#ca8a04';
          ctx.beginPath();
          ctx.arc(0, -55, 28, 0, Math.PI * 2);
          ctx.arc(-16, -42, 18, 0, Math.PI * 2);
          ctx.arc(16, -42, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Water Lilies in pond
        for (let l = 0; l < 3; l++) {
          const lx = 340 + l * 80;
          const ly = 420 + (l % 2) * 30;
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.ellipse(lx, ly, 16, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          // Pink Flower
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(lx, ly - 3, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // CONSUMERS: Deer (Primary), Fish/Frog (Secondary), Eagle (Tertiary)
      if (activeFilter === 'all' || activeFilter === 'consumers') {
        // Spotted Deer Grazing on bank
        ctx.save();
        ctx.translate(190, 360 + Math.sin(time * 2) * 1.5);
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(18, -14, 7, 0, Math.PI * 2);
        ctx.fill();
        // Legs
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-10, 8);
        ctx.lineTo(-10, 24);
        ctx.moveTo(10, 8);
        ctx.lineTo(10, 24);
        ctx.stroke();
        ctx.restore();

        // Fish swimming in pond
        const fishX = 400 + Math.sin(time * 2) * 50;
        const fishY = 440 + Math.cos(time * 1.5) * 15;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(fishX, fishY, 11, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flying Eagle in sky
        const eagleX = (time * 65) % 940 - 30;
        const eagleY = 120 + Math.sin(time * 2) * 10;
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(eagleX, eagleY, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wings
        ctx.beginPath();
        ctx.moveTo(eagleX - 4, eagleY);
        ctx.lineTo(eagleX, eagleY - 14 + Math.sin(time * 10) * 6);
        ctx.lineTo(eagleX + 6, eagleY);
        ctx.closePath();
        ctx.fill();
      }

      // DECOMPOSERS: Fungi / Mushrooms on forest floor & dead log
      if (activeFilter === 'all' || activeFilter === 'decomposers') {
        const mushroomSlots = [
          { x: 120, y: 430 },
          { x: 135, y: 435 },
          { x: 740, y: 390 },
          { x: 755, y: 395 },
        ];

        mushroomSlots.forEach((m) => {
          ctx.save();
          ctx.translate(m.x, m.y);
          // Stem
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(-2, -12, 4, 12);
          // Cap
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, -12, 8, Math.PI, Math.PI * 2);
          ctx.fill();
          // White dots
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-3, -15, 1.2, 0, Math.PI * 2);
          ctx.arc(3, -15, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // 3. Dynamic Rainfall Streaks
      if (rainfall > 25) {
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.55)';
        ctx.lineWidth = 1.2;
        const rainDensity = Math.round((rainfall / 100) * 60);
        for (let r = 0; r < rainDensity; r++) {
          const rx = (r * 17 + time * 350) % canvas.width;
          const ry = (r * 29 + time * 600) % 460;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 3, ry + 14);
          ctx.stroke();
        }
      }

      // 4. Energy Flow Cycle Overlay
      if (showCycles) {
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2.5;

        // Solar to Producer
        ctx.strokeStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(sunX - 20, sunY + 20);
        ctx.lineTo(240, 240);
        ctx.stroke();

        // Producer to Herbivore (Deer)
        ctx.strokeStyle = '#4ade80';
        ctx.beginPath();
        ctx.moveTo(210, 280);
        ctx.lineTo(190, 350);
        ctx.stroke();

        // Animal to Decomposer
        ctx.strokeStyle = '#f87171';
        ctx.beginPath();
        ctx.moveTo(190, 370);
        ctx.lineTo(135, 430);
        ctx.stroke();

        // Decomposer Nutrients back to Soil
        ctx.strokeStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(135, 435);
        ctx.quadraticCurveTo(150, 470, 200, 390);
        ctx.stroke();
        ctx.restore();
      }

      // 5. Ecological Health Status HUD (Top Left)
      const hudX = 20;
      const hudY = 20;
      const hudW = 260;
      const hudH = 130;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? 'पारिस्थितिक स्वास्थ्य सूचकांक:' : 'Ecosystem Vitality Gauges:', hudX + 12, hudY + 22);

      const gauges = [
        { label: lang === 'ne' ? 'उत्पादक (बिरुवा)' : 'Producers (Flora)', val: plantHealth, color: '#22c55e' },
        { label: lang === 'ne' ? 'शाकाहारी (मृग)' : 'Herbivores (Fauna)', val: herbivoreHealth, color: '#f59e0b' },
        { label: lang === 'ne' ? 'मांसाहारी (शिकारी)' : 'Carnivores (Predators)', val: carnivoreHealth, color: '#ef4444' },
        { label: lang === 'ne' ? 'विच्छेदक (च्याउ)' : 'Decomposers (Fungi)', val: decomposerHealth, color: '#a855f7' },
      ];

      gauges.forEach((g, idx) => {
        const gy = hudY + 40 + idx * 22;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '9px sans-serif';
        ctx.fillText(g.label, hudX + 12, gy);

        // Bar background
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(hudX + 130, gy - 8, 85, 9);

        // Bar fill
        ctx.fillStyle = g.color;
        ctx.fillRect(hudX + 130, gy - 8, (85 * g.val) / 100, 9);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${g.val}%`, hudX + hudW - 12, gy);
        ctx.textAlign = 'left';
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [sunlight, rainfall, soilNutrient, activeFilter, showCycles, plantHealth, herbivoreHealth, carnivoreHealth, decomposerHealth, lang]);

  return (
    <SimulationLayout
      titleEn="2D Ecosystem Simulator"
      titleNe="पारिस्थितिक प्रणाली २डी सिमुलेटर"
      subject="Science"
      grade={6}
      chapter={4}
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
            LEFT COLUMN: INTERACTIVE 2D ECOSYSTEM CANVAS VIEWPORT
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
            height={500}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
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
              <Activity size={14} color="#38bdf8" />
              {lang === 'ne' ? 'पारिस्थितिक प्रणाली २डी' : 'Ecosystem Web & Trophic Levels'}
            </span>

            <button
              onClick={() => setShowCycles((p) => !p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: showCycles ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
                background: showCycles ? 'rgba(245, 158, 11, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                color: showCycles ? '#fbbf24' : '#cbd5e1',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Activity size={14} color={showCycles ? '#fbbf24' : '#94a3b8'} />
              {lang === 'ne'
                ? showCycles
                  ? 'ऊर्जा प्रवाह: चालु'
                  : 'ऊर्जा प्रवाह देखाउनुहोस्'
                : showCycles
                  ? 'Energy Flow: ON'
                  : 'Show Energy Flow'}
            </button>
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
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} />
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
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
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
                  background: 'rgba(34, 197, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sun size={16} color="#4ade80" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'ne' ? 'सक्रिय फिल्टर: ' : 'Active Ecological Filter: '}
                  <span style={{ color: '#38bdf8' }}>
                    {activeFilter === 'all'
                      ? (lang === 'ne' ? 'सबै घटक' : 'All Components')
                      : activeFilter === 'producers'
                        ? (lang === 'ne' ? 'उत्पादक' : 'Producers')
                        : activeFilter === 'consumers'
                          ? (lang === 'ne' ? 'उपभोक्ता' : 'Consumers')
                          : (lang === 'ne' ? 'विच्छेदक' : 'Decomposers')}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'ne'
                    ? `घाम: ${sunlight}% • वर्षा: ${rainfall}% • माटो: ${soilNutrient}`
                    : `Sunlight: ${sunlight}% • Rainfall: ${rainfall}% • Soil Fertility: ${soilNutrient}`}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#4ade80',
                background: 'rgba(34, 197, 94, 0.12)',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                fontWeight: 700,
              }}
            >
              {lang === 'ne' ? 'सन्तुलित जैविक पर्यावरण' : 'Biomass Equilibrium: Stable'}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: ECOSYSTEM DISCOVERY STATION (380px)
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
            color: '#fff',
          }}
        >
          {/* Station Header Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sun size={18} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>
                {lang === 'ne' ? 'पारिस्थितिक प्रणाली अनुसन्धान' : 'Ecosystem Discovery Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
              {lang === 'ne'
                ? 'जैविक घटक (उत्पादक, उपभोक्ता, विच्छेदक) र अजैविक तत्व (घाम, पानी, माटो) बीचको अन्तरसम्बन्ध प्रत्यक्ष जाँच्नुहोस्।'
                : 'Tune biotic trophic tiers and abiotic conditions (sun, rain, soil) to explore stability in natural biomes.'}
            </div>
          </div>

          {/* Component Filter Buttons (2x2 Grid) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'जैविक घटक फिल्टर (Biotic Filters)' : 'Select Trophic Level'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { id: 'all', labelEn: 'All Components', labelNe: 'सबै घटक' },
                { id: 'producers', labelEn: 'Producers (Green)', labelNe: 'उत्पादक (रुख/घाँस)' },
                { id: 'consumers', labelEn: 'Consumers (Animals)', labelNe: 'उपभोक्ता (जनावर)' },
                { id: 'decomposers', labelEn: 'Decomposers (Fungi)', labelNe: 'विच्छेदक (च्याउ)' },
              ].map((f) => {
                const active = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as ComponentFilter)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: active ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: active ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: active ? '#38bdf8' : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {lang === 'ne' ? f.labelNe : f.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Abiotic Tuning Sliders Deck */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'अजैविक तत्व नियन्त्रण (Abiotic Factors):' : 'Abiotic Factor Controls:'}
            </div>

            {/* Solar Radiation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                  <Sun size={13} color="#facc15" />
                  {lang === 'ne' ? 'घामको तीव्रता' : 'Solar Radiation'}
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

            {/* Precipitation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                  <CloudRain size={13} color="#38bdf8" />
                  {lang === 'ne' ? 'वर्षाको मात्रा' : 'Precipitation'}
                </span>
                <strong style={{ color: '#38bdf8' }}>{rainfall}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            {/* Soil Nutrient Level */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#fbbf24', display: 'block', marginBottom: '6px' }}>
                {lang === 'ne' ? 'माटोको उर्वराशक्ति (Soil Fertility):' : 'Soil Nutrient Level:'}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['low', 'medium', 'rich'] as const).map((lvl) => {
                  const active = soilNutrient === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setSoilNutrient(lvl)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: active ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: active ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        color: active ? '#fbbf24' : '#cbd5e1',
                      }}
                    >
                      {lvl === 'low'
                        ? (lang === 'ne' ? 'कम' : 'Low')
                        : lvl === 'medium'
                          ? (lang === 'ne' ? 'मध्यम' : 'Med')
                          : (lang === 'ne' ? 'मलिलो' : 'Rich')}
                    </button>
                  );
                })}
              </div>
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
              color: '#475569',
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
              💡 {lang === 'ne' ? 'पाठ्यक्रम मुख्य निष्कर्ष:' : 'Curriculum Key Takeaway:'}
            </div>
            {lang === 'ne'
              ? 'अजैविक तत्व (घाम, पानी, माटो) अनुकूल भएमा उत्पादक फस्टाउँछन्, जसले सम्पूर्ण आहार चक्रलाई सन्तुलित राखी जीवहरूलाई ऊर्जा प्रदान गर्छ।'
              : 'Balanced abiotic factors sustain green producers via photosynthesis, ensuring steady chemical energy flow to primary and secondary consumers.'}
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
            {lang === 'en' ? 'Complete Ecosystem Lab & Quiz' : 'पारिस्थितिक प्रणाली प्रयोगशाला पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default EcosystemSimulatorSim;
