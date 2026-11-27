/**
 * DeforestationConservationSim.tsx
 * Simulation 10: 2D Deforestation and Conservation Hillside
 * Grade 4 Science • Chapter 3: Organisms and Environment
 *
 * 100% Native HTML5 Canvas 2D Interactive Physics Simulation.
 * Features:
 * - Panoramic Himalayan hillside cross-section with village settlement and mountain river
 * - Underground root anchor network X-ray view showing roots binding topsoil
 * - Dynamic monsoon rain, soil erosion, and mudslide particle cascade
 * - River siltation: crystalline blue alpine water vs turbid brown mud runoff
 * - Real-time Landslide Risk Meter
 * - Community forestry afforestation controls
 * - Bilingual EN/NE labels, sound effects, and 5-stage inquiry learning
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Trees, CloudRain, Shield, AlertTriangle, RotateCcw, Plus, Scissors, Sparkles, Eye, Check } from 'lucide-react';

interface MudParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

export const DeforestationConservationSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [treeCount, setTreeCount] = useState<number>(6); // 0 to 8
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const [showRoots, setShowRoots] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mudParticlesRef = useRef<MudParticle[]>([]);

  // Calculate landslide risk percentage
  const landslideRisk = Math.max(
    5,
    Math.min(95, Math.round((1 - treeCount / 8) * 80 + (isRaining ? 15 : 0)))
  );

  const handlePlantTree = () => {
    ScienceAudio.playPop();
    const next = Math.min(8, treeCount + 1);
    setTreeCount(next);
    if (next >= 6 && !isCompleted) {
      ScienceAudio.playSuccess();
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    }
  };

  const handleCutTree = () => {
    ScienceAudio.playBeep(260, 0.15);
    setTreeCount((prev) => Math.max(0, prev - 1));
  };

  const handleToggleRain = () => {
    ScienceAudio.playWhoosh();
    setIsRaining((prev) => !prev);
  };

  const handleReset = () => {
    setTreeCount(6);
    setIsRaining(false);
    setShowRoots(true);
    mudParticlesRef.current = [];
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    ScienceAudio.playWhoosh();
  };

  // 60 FPS Canvas Physics Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Sky & Himalayan Mountain Backdrop
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 300);
      if (isRaining) {
        skyGrad.addColorStop(0, '#334155');
        skyGrad.addColorStop(1, '#475569');
      } else {
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.7, '#7dd3fc');
        skyGrad.addColorStop(1, '#e0f2fe');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant Snowy Himalayan Peaks
      ctx.fillStyle = isRaining ? '#94a3b8' : '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(80, 200);
      ctx.lineTo(200, 70);
      ctx.lineTo(310, 200);
      ctx.lineTo(440, 60);
      ctx.lineTo(580, 210);
      ctx.lineTo(720, 80);
      ctx.lineTo(840, 210);
      ctx.lineTo(880, 220);
      ctx.lineTo(0, 220);
      ctx.closePath();
      ctx.fill();

      // 2. Hillside Slope (From top-right to bottom-left)
      // Path of the mountain hill surface
      const getHillY = (x: number) => {
        // Higher on right (x=880 -> y=160), lower on left (x=0 -> y=420)
        const t = x / 880;
        return 420 - t * 260 + Math.sin(t * Math.PI) * 20;
      };

      // Topsoil and Subsoil Layers
      const slopeGrad = ctx.createLinearGradient(0, 200, 0, canvas.height);
      const isEroded = treeCount <= 2 && isRaining;
      if (isEroded) {
        slopeGrad.addColorStop(0, '#78350f'); // bare mud
        slopeGrad.addColorStop(0.5, '#451a03');
        slopeGrad.addColorStop(1, '#1c1917');
      } else if (treeCount >= 5) {
        slopeGrad.addColorStop(0, '#15803d'); // lush green grass
        slopeGrad.addColorStop(0.15, '#166534');
        slopeGrad.addColorStop(0.4, '#78350f');
        slopeGrad.addColorStop(1, '#292524');
      } else {
        slopeGrad.addColorStop(0, '#65a30d'); // patchy grass
        slopeGrad.addColorStop(0.2, '#78350f');
        slopeGrad.addColorStop(1, '#1c1917');
      }

      ctx.fillStyle = slopeGrad;
      ctx.beginPath();
      ctx.moveTo(0, getHillY(0));
      for (let x = 0; x <= 880; x += 10) {
        ctx.lineTo(x, getHillY(x));
      }
      ctx.lineTo(880, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Topsoil surface contour outline
      ctx.strokeStyle = isEroded ? '#451a03' : '#15803d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= 880; x += 10) {
        if (x === 0) ctx.moveTo(x, getHillY(x));
        else ctx.lineTo(x, getHillY(x));
      }
      ctx.stroke();

      // 3. Mountain River at the Hill Base (Left side: x: 0 to 180, y: 440 to 520)
      const riverWaterGrad = ctx.createLinearGradient(0, 440, 0, 520);
      if (treeCount <= 2 && isRaining) {
        // Silted muddy brown water
        riverWaterGrad.addColorStop(0, '#92400e');
        riverWaterGrad.addColorStop(1, '#78350f');
      } else {
        // Clean alpine river
        riverWaterGrad.addColorStop(0, '#06b6d4');
        riverWaterGrad.addColorStop(1, '#0284c7');
      }
      ctx.fillStyle = riverWaterGrad;
      ctx.beginPath();
      ctx.moveTo(0, 430);
      ctx.quadraticCurveTo(90, 420, 180, 445);
      ctx.lineTo(190, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // River label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        treeCount <= 2 && isRaining
          ? (lang === 'ne' ? 'धमिलो बाढी (Muddy Runoff)' : 'Muddy Silted River')
          : (lang === 'ne' ? 'सफा नदी (Clean River)' : 'Clean Fresh River'),
        20,
        480
      );

      // 4. Nepali Hillside Village Houses (Safe when trees present, in danger during mudslide)
      const villageX = 170;
      const villageY = getHillY(villageX) - 20;

      // House 1 (Stone cottage with slate roof)
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(villageX, villageY - 24, 40, 24);
      // Slate roof
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(villageX - 6, villageY - 24);
      ctx.lineTo(villageX + 20, villageY - 42);
      ctx.lineTo(villageX + 46, villageY - 24);
      ctx.closePath();
      ctx.fill();
      // Wooden door & window
      ctx.fillStyle = '#78350f';
      ctx.fillRect(villageX + 14, villageY - 14, 10, 14);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(villageX + 28, villageY - 18, 6, 6);

      // House 2
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(villageX + 50, villageY - 18, 32, 20);
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(villageX + 44, villageY - 18);
      ctx.lineTo(villageX + 66, villageY - 34);
      ctx.lineTo(villageX + 88, villageY - 18);
      ctx.closePath();
      ctx.fill();

      // Village safety warning marker if risk > 60%
      if (landslideRisk >= 60) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.beginPath();
        ctx.roundRect(villageX - 5, villageY - 70, 95, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? '⚠️ पहिरोको जोखिम!' : '⚠️ Landslide Danger!', villageX + 42, villageY - 56);
      }

      // 5. Trees on the Hillside (Anchoring roots)
      const maxTreeSlots = 8;
      for (let i = 0; i < maxTreeSlots; i++) {
        // Slot coordinates along slope
        const tx = 270 + i * 72;
        const ty = getHillY(tx);
        const hasTree = i < treeCount;

        if (hasTree) {
          // Tree Trunk
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.moveTo(tx - 6, ty + 4);
          ctx.lineTo(tx + 6, ty + 4);
          ctx.lineTo(tx + 4, ty - 38);
          ctx.lineTo(tx - 4, ty - 38);
          ctx.closePath();
          ctx.fill();

          // Foliage Layers (Pine & Rhododendron mix)
          const foliageGrad = ctx.createLinearGradient(0, ty - 85, 0, ty - 30);
          foliageGrad.addColorStop(0, '#22c55e');
          foliageGrad.addColorStop(0.6, '#15803d');
          foliageGrad.addColorStop(1, '#166534');
          ctx.fillStyle = foliageGrad;

          // Tier 1
          ctx.beginPath();
          ctx.moveTo(tx, ty - 80);
          ctx.lineTo(tx - 26, ty - 45);
          ctx.lineTo(tx + 26, ty - 45);
          ctx.closePath();
          ctx.fill();

          // Tier 2
          ctx.beginPath();
          ctx.moveTo(tx, ty - 65);
          ctx.lineTo(tx - 32, ty - 30);
          ctx.lineTo(tx + 32, ty - 30);
          ctx.closePath();
          ctx.fill();

          // Underground Root Network (X-Ray View)
          if (showRoots) {
            ctx.strokeStyle = 'rgba(217, 119, 6, 0.85)';
            ctx.lineWidth = 2.5;

            // Taproot
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + 2, ty + 38);
            ctx.stroke();

            // Lateral anchoring roots clutching soil
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(tx, ty + 8);
            ctx.quadraticCurveTo(tx - 25, ty + 20, tx - 38, ty + 28);
            ctx.moveTo(tx, ty + 12);
            ctx.quadraticCurveTo(tx + 25, ty + 22, tx + 40, ty + 26);
            ctx.moveTo(tx, ty + 20);
            ctx.quadraticCurveTo(tx - 18, ty + 36, tx - 28, ty + 45);
            ctx.moveTo(tx, ty + 24);
            ctx.quadraticCurveTo(tx + 18, ty + 38, tx + 30, ty + 46);
            ctx.stroke();

            // Root soil anchor web glow
            ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
            ctx.beginPath();
            ctx.ellipse(tx, ty + 25, 42, 24, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Tree Stump (Cut down)
          ctx.fillStyle = '#451a03';
          ctx.fillRect(tx - 8, ty - 10, 16, 12);
          // Axe chop cut marks
          ctx.fillStyle = '#a16207';
          ctx.beginPath();
          ctx.ellipse(tx, ty - 10, 8, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Soil erosion fissures around stump
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tx - 12, ty + 2);
          ctx.lineTo(tx - 20, ty + 15);
          ctx.moveTo(tx + 10, ty + 2);
          ctx.lineTo(tx + 18, ty + 18);
          ctx.stroke();
        }
      }

      // 6. Dynamic Monsoon Rain & Mudslide Physics
      if (isRaining) {
        // Rain Streaks
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
        ctx.lineWidth = 1.5;
        for (let r = 0; r < 70; r++) {
          const rx = (r * 13 + time * 400) % canvas.width;
          const ry = (r * 29 + time * 650) % 400;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 16);
          ctx.stroke();
        }

        // Dark Monsoon Rain Clouds
        ctx.fillStyle = '#475569';
        for (let c = 0; c < 5; c++) {
          ctx.beginPath();
          ctx.arc(100 + c * 170, 45, 55, 0, Math.PI * 2);
          ctx.arc(140 + c * 170, 35, 65, 0, Math.PI * 2);
          ctx.arc(180 + c * 170, 50, 50, 0, Math.PI * 2);
          ctx.fill();
        }

        // Spawn mud runoff particles if trees are missing
        if (treeCount < 6) {
          const missingTrees = 8 - treeCount;
          for (let m = 0; m < missingTrees * 2; m++) {
            mudParticlesRef.current.push({
              x: 350 + Math.random() * 450,
              y: 200 + Math.random() * 100,
              vx: -Math.random() * 3 - 2, // flow downhill to left
              vy: Math.random() * 2 + 1.5,
              r: Math.random() * 3 + 2,
              alpha: 0.85,
            });
          }
        }
      }

      // Update & Render Mudslide Runoff Particles
      for (let i = mudParticlesRef.current.length - 1; i >= 0; i--) {
        const p = mudParticlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;

        // Stick along slope
        const hillY = getHillY(p.x);
        if (p.y < hillY - 4) {
          p.y = hillY - 2;
        }

        if (p.alpha <= 0 || p.x <= 80) {
          mudParticlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(120, 53, 15, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. HUD Status Meters & Gauges (Top right)
      const hudX = 580;
      const hudY = 15;
      const hudW = 280;
      const hudH = 110;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 10);
      ctx.fill();
      ctx.stroke();

      // Landslide Risk Meter
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? 'पहिरोको जोखिम मिटर:' : 'Landslide Risk Meter:', hudX + 12, hudY + 24);

      // Gauge Bar Background
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(hudX + 12, hudY + 34, hudW - 24, 16, 8);
      ctx.fill();

      // Gauge Bar Fill
      const riskRatio = landslideRisk / 100;
      const barGrad = ctx.createLinearGradient(hudX + 12, 0, hudX + hudW - 12, 0);
      barGrad.addColorStop(0, '#22c55e'); // Low risk
      barGrad.addColorStop(0.5, '#eab308'); // Moderate
      barGrad.addColorStop(1, '#ef4444'); // Extreme
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(hudX + 12, hudY + 34, (hudW - 24) * riskRatio, 16, 8);
      ctx.fill();

      // Risk text label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${landslideRisk}%`, hudX + hudW - 16, hudY + 46);

      // Status Explanation
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      if (treeCount >= 6) {
        ctx.fillStyle = '#4ade80';
        ctx.fillText(
          lang === 'ne' ? '✓ रुखका जराले माटो बलियो पारेको छ' : '✓ Dense roots anchoring topsoil securely',
          hudX + 12,
          hudY + 70
        );
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(
          lang === 'ne' ? 'सामुदायिक वन: गाउँ पूर्ण सुरक्षित' : 'Community Forest: Village safe from erosion',
          hudX + 12,
          hudY + 86
        );
      } else if (treeCount >= 3) {
        ctx.fillStyle = '#facc15';
        ctx.fillText(
          lang === 'ne' ? '⚠️ वन विनाश सुरु: माटो खुकुलो हुँदैछ' : '⚠️ Deforestation underway: loose soil',
          hudX + 12,
          hudY + 70
        );
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(
          lang === 'ne' ? 'अझ धेरै रुख रोप्न आवश्यक छ' : 'Plant more saplings to protect slope',
          hudX + 12,
          hudY + 86
        );
      } else {
        ctx.fillStyle = '#f87171';
        ctx.fillText(
          lang === 'ne' ? '🚨 गम्भीर खतरा: रुख बिनाको नाङ्गो डाँडा' : '🚨 CRITICAL: Bare hillside with no roots',
          hudX + 12,
          hudY + 70
        );
        ctx.fillStyle = '#fca5a5';
        ctx.fillText(
          lang === 'ne' ? 'ठूलो वर्षामा पहिरो जाने उच्च जोखिम!' : 'High risk of destructive mudslide!',
          hudX + 12,
          hudY + 86
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [treeCount, isRaining, showRoots, landslideRisk, lang]);

  return (
    <SimulationLayout
      titleEn="2D Deforestation and Conservation Hillside"
      titleNe="वन विनाश र संरक्षण 2डी प्रयोगशाला"
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
            LEFT COLUMN: INTERACTIVE 2D HILLSIDE CANVIEWPORT
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
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ade80',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Trees size={13} />
              {lang === 'ne' ? `रुख संख्या: ${treeCount}/8` : `Trees: ${treeCount}/8`}
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: landslideRisk >= 60 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                border: landslideRisk >= 60 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
                color: landslideRisk >= 60 ? '#f87171' : '#4ade80',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <AlertTriangle size={13} />
              {lang === 'ne' ? `पहिरो जोखिम: ${landslideRisk}%` : `Landslide Risk: ${landslideRisk}%`}
            </span>

            <button
              onClick={() => setShowRoots(!showRoots)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: showRoots ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                background: showRoots ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.8)',
                color: showRoots ? '#38bdf8' : '#cbd5e1',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Eye size={13} />
              {lang === 'ne' ? (showRoots ? 'जरा: देखियो' : 'जरा देखाउनुहोस्') : (showRoots ? 'Roots: Visible' : 'Show Roots')}
            </button>

            <button
              onClick={handleToggleRain}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: isRaining ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.15)',
                background: isRaining ? 'rgba(6, 182, 212, 0.25)' : 'rgba(15, 23, 42, 0.8)',
                color: isRaining ? '#22d3ee' : '#cbd5e1',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <CloudRain size={13} />
              {isRaining
                ? (lang === 'ne' ? 'वर्षा रोक्नुहोस्' : 'Stop Monsoon')
                : (lang === 'ne' ? 'मनसुन वर्षा सुरु' : 'Trigger Monsoon')}
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
                  background: landslideRisk >= 60 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  border: landslideRisk >= 60 ? '1px solid #ef4444' : '1px solid #22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {landslideRisk >= 60 ? '⚠️' : '🌲'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {landslideRisk >= 60
                    ? (lang === 'ne' ? 'पहिरोको उच्च जोखिम! माटो बग्ने खतरा' : 'High Landslide Risk! Soil unstable')
                    : (lang === 'ne' ? 'पहाडी ढलान सुरक्षित र स्थिर छ' : 'Hillside Soil Anchored & Stable')}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {lang === 'ne'
                    ? 'दायाँ प्यानलबाट थप रुख रोपेर माटोलाई बलियो बनाउनुहोस् वा कटान गरी असर हेर्नुहोस्'
                    : 'Plant more trees to bind soil with roots, or cut trees to observe deforestation erosion'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleReset}
                title="Reset Hillside"
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
            RIGHT COLUMN: CONSERVATION LAB WORKSPACE & PARAMETERS (380px)
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
                {lang === 'ne' ? 'सामुदायिक वन तथा जलाधार केन्द्र' : 'Himalayan Watershed Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              {lang === 'ne'
                ? 'रुखका जराहरूले माटोलाई जालीझैँ समातेर राख्छन्। वन विनाशले पहिरो र बाढी निम्त्याउँछ।'
                : 'Subterranean root networks bind mountain topsoil, while canopy leaves intercept rain impact to stop soil erosion.'}
            </div>
          </div>

          {/* Hillside Management Action Cards */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
              {lang === 'en' ? 'FOREST ACTIONS' : 'वन व्यवस्थापन कार्यहरू'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={handlePlantTree}
                disabled={treeCount >= 8}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: treeCount >= 8 ? 'not-allowed' : 'pointer',
                  opacity: treeCount >= 8 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                }}
              >
                <Plus size={15} />
                {lang === 'ne' ? 'रुख रोप्नुहोस्' : 'Plant Tree'}
              </button>

              <button
                onClick={handleCutTree}
                disabled={treeCount === 0}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: treeCount === 0 ? 'not-allowed' : 'pointer',
                  opacity: treeCount === 0 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                }}
              >
                <Scissors size={15} />
                {lang === 'ne' ? 'रुख काट्नुहोस्' : 'Cut Tree'}
              </button>
            </div>
          </div>

          {/* Environmental Parameters & Risk Meters */}
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
            {/* Landslide Risk Meter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <AlertTriangle size={13} color={landslideRisk >= 60 ? '#f87171' : '#4ade80'} />
                  {lang === 'en' ? 'Landslide Risk' : 'पहिरोको जोखिम'}
                </span>
                <strong style={{ color: landslideRisk >= 60 ? '#f87171' : '#4ade80' }}>
                  {landslideRisk}%
                </strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${landslideRisk}%`,
                    height: '100%',
                    background: landslideRisk >= 60 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #22c55e, #38bdf8)',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>

            {/* Forest Canopy Density */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Trees size={13} color="#4ade80" />
                  {lang === 'en' ? 'Forest Canopy Density' : 'वनको घनत्व'}
                </span>
                <strong style={{ color: '#4ade80' }}>{Math.round((treeCount / 8) * 100)}%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(treeCount / 8) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #0ea5e9, #22c55e)',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
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
                ? 'Community forests in Nepal protect soil against heavy monsoon erosion. Preserving trees protects hillside villages from catastrophic landslides and keeps downstream rivers clean.'
                : 'सामुदायिक वनले मनसुनको भेलबाट माटो जोगाउँछ। रुखहरू जोगाउनाले पहाडी बस्तीलाई पहिरोबाट बचाउँछ र खोलानालालाई सफा राख्छ।'}
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
            {lang === 'en' ? '✓ Complete Conservation Lab & Quiz' : '✓ वन संरक्षण प्रयोगशाला पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default DeforestationConservationSim;
