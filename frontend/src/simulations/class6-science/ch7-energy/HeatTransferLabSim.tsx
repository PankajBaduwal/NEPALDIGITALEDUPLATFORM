/**
 * HeatTransferLabSim.tsx
 * Simulation 21: 2D Heat Transfer Laboratory (ताप सञ्चालन प्रयोगशाला)
 * Grade 6 Science • Unit 7: Energy in Daily Life (दैनिक जीवनमा शक्ति)
 *
 * 100% Native HTML5 Canvas 2D Interactive Thermodynamics Laboratory.
 * Features:
 * 1. Conduction (सञ्चालन):
 *    - Metal Rod (Copper vs Iron vs Glass insulator) heated by Bunsen burner
 *    - Thermal gradient propagation melting wax droplets and dropping metal pins sequentially
 * 2. Convection (संवहन):
 *    - Liquid convection in beaker with Potassium Permanganate (KMnO₄) purple circulating convection currents
 * 3. Radiation (विकिरण):
 *    - Infrared electromagnetic waves traveling across vacuum directly from heat source
 * 4. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Flame, Waves, Sun, Sparkles, Play, RotateCcw, Award } from 'lucide-react';

type TransferMode = 'conduction' | 'convection' | 'radiation';

export const HeatTransferLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Experiment State
  const [mode, setMode] = useState<TransferMode>('conduction');
  const [rodMaterial, setRodMaterial] = useState<'copper' | 'iron' | 'glass'>('copper');
  const [isHeating, setIsHeating] = useState<boolean>(false);
  const [heatProgress, setHeatProgress] = useState<number>(0); // 0 to 1
  const [pinsDropped, setPinsDropped] = useState<boolean[]>([false, false, false, false]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Material thermal conductivity speeds
  const speedFactor = rodMaterial === 'copper' ? 1.4 : rodMaterial === 'iron' ? 0.8 : 0.2;

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setIsHeating(false);
    setHeatProgress(0);
    setPinsDropped([false, false, false, false]);
    setStars(0);
    setIsCompleted(false);
  };

  const handleStartHeating = () => {
    ScienceAudio.playDing();
    setIsHeating(true);
    setHeatProgress(0);
    setPinsDropped([false, false, false, false]);
  };

  // 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const time = Date.now() / 250;

      // Heating progress integration
      if (isHeating && heatProgress < 1) {
        setHeatProgress((prev) => {
          const next = Math.min(1, prev + 0.003 * speedFactor);
          // Check pin drops in conduction mode
          if (mode === 'conduction') {
            const pinThresholds = [0.25, 0.5, 0.75, 0.95];
            setPinsDropped((curPins) => {
              const updated = [...curPins];
              pinThresholds.forEach((th, idx) => {
                if (next >= th && !updated[idx]) {
                  updated[idx] = true;
                  ScienceAudio.playPop();
                }
              });
              if (updated[3] && stage === 'challenge' && stars < 3) {
                setStars(3);
              }
              return updated;
            });
          }
          return next;
        });
      }

      // Dark Laboratory Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Lab Countertop Bench
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 390, width, height - 390);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 390);
      ctx.lineTo(width, 390);
      ctx.stroke();

      // ==========================================
      // MODE 1: CONDUCTION (सञ्चालन)
      // ==========================================
      if (mode === 'conduction') {
        const rodStartX = 200;
        const rodEndX = 680;
        const rodY = 220;
        const rodH = 20;

        // Bunsen Burner at Left End (Heating Source)
        const burnerX = rodStartX - 10;
        const burnerY = 320;

        // Burner Base & Pipe
        ctx.fillStyle = '#475569';
        ctx.fillRect(burnerX - 25, burnerY + 40, 50, 16);
        ctx.fillRect(burnerX - 8, burnerY - 40, 16, 80);

        // Bunsen Flame
        if (isHeating) {
          const flameH = 45 + Math.sin(time * 3) * 6;
          const flameGrad = ctx.createRadialGradient(burnerX, burnerY - 40, 2, burnerX, burnerY - 40, flameH);
          flameGrad.addColorStop(0, '#ffffff');
          flameGrad.addColorStop(0.3, '#38bdf8'); // Hot inner blue flame
          flameGrad.addColorStop(0.7, '#f59e0b');
          flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.arc(burnerX, burnerY - 40, flameH, 0, Math.PI * 2);
          ctx.fill();
        }

        // Retort Stand Clamps holding the rod
        ctx.fillStyle = '#64748b';
        ctx.fillRect(rodEndX - 40, rodY - 14, 16, 170); // Stand rod
        ctx.fillRect(rodEndX - 60, rodY - 6, 40, 12); // Clamp

        // Metal / Glass Rod Body
        let baseColor = '#b45309'; // Copper
        if (rodMaterial === 'iron') baseColor = '#64748b';
        if (rodMaterial === 'glass') baseColor = '#94a3b8';

        // Thermal Propagation Gradient along Rod
        const rodGrad = ctx.createLinearGradient(rodStartX, rodY, rodEndX, rodY);
        if (isHeating) {
          const heatPos = Math.min(1, heatProgress * 1.1);
          rodGrad.addColorStop(0, '#ef4444'); // Glowing hot red
          rodGrad.addColorStop(Math.min(1, heatPos * 0.5), '#f59e0b');
          rodGrad.addColorStop(heatPos, baseColor);
          rodGrad.addColorStop(1, baseColor);
        } else {
          rodGrad.addColorStop(0, baseColor);
          rodGrad.addColorStop(1, baseColor);
        }

        ctx.fillStyle = rodGrad;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(rodStartX, rodY - rodH / 2, rodEndX - rodStartX, rodH, 6);
        ctx.fill();
        ctx.stroke();

        // 4 Wax Droplets and Metal Pins attached underneath rod
        const pinPositions = [0.25, 0.5, 0.75, 0.95];
        pinPositions.forEach((posFraction, idx) => {
          const px = rodStartX + posFraction * (rodEndX - rodStartX - 60);
          const dropped = pinsDropped[idx];

          if (!dropped) {
            // Wax Droplet (Yellow)
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(px, rodY + rodH / 2 + 4, 6, 0, Math.PI * 2);
            ctx.fill();

            // Hanging Metal Pin
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(px, rodY + rodH / 2 + 8);
            ctx.lineTo(px, rodY + rodH / 2 + 45);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(px, rodY + rodH / 2 + 45, 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Pin has fallen to the table!
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px - 14, 385);
            ctx.lineTo(px + 14, 385);
            ctx.stroke();

            // Melted wax smear
            ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
            ctx.beginPath();
            ctx.ellipse(px, 388, 12, 3, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Heat flow arrow above rod
        if (isHeating) {
          ctx.strokeStyle = '#ef4444';
          ctx.fillStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(rodStartX + 40, rodY - 30);
          ctx.lineTo(rodStartX + 40 + heatProgress * (rodEndX - rodStartX - 100), rodY - 30);
          ctx.stroke();
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(lang === 'ne' ? 'ताप प्रसारण दिशा ➔' : 'Thermal Heat Wave Flow ➔', rodStartX + 40, rodY - 40);
        }
      }

      // ==========================================
      // MODE 2: CONVECTION (संवहन)
      // ==========================================
      if (mode === 'convection') {
        const beakerX = 440;
        const beakerY = 160;
        const beakerW = 240;
        const beakerH = 220;

        // Burner Underneath Beaker
        const burnerX = beakerX;
        const burnerY = 360;
        ctx.fillStyle = '#475569';
        ctx.fillRect(burnerX - 30, burnerY + 15, 60, 15);
        ctx.fillRect(burnerX - 8, burnerY - 30, 16, 45);

        // Flame
        if (isHeating) {
          const flameH = 35 + Math.sin(time * 3) * 5;
          const flameGrad = ctx.createRadialGradient(burnerX, burnerY - 30, 2, burnerX, burnerY - 30, flameH);
          flameGrad.addColorStop(0, '#ffffff');
          flameGrad.addColorStop(0.3, '#38bdf8');
          flameGrad.addColorStop(0.7, '#f97316');
          flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.arc(burnerX, burnerY - 30, flameH, 0, Math.PI * 2);
          ctx.fill();
        }

        // Glass Beaker Body
        ctx.save();
        ctx.translate(beakerX, beakerY);

        // Water
        const waterGrad = ctx.createLinearGradient(0, 30, 0, beakerH);
        waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        waterGrad.addColorStop(1, 'rgba(2, 132, 199, 0.65)');
        ctx.fillStyle = waterGrad;
        ctx.beginPath();
        ctx.roundRect(-beakerW / 2 + 6, 30, beakerW - 12, beakerH - 32, 12);
        ctx.fill();

        // Glass Outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(-beakerW / 2, 20, beakerW, beakerH - 20);

        // Potassium Permanganate Crystal (KMnO4) at Bottom Center
        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.arc(0, beakerH - 10, 8, 0, Math.PI * 2);
        ctx.fill();

        // Cyclical Convection Streams (Warm Purple Water Rising, Cool Blue Water Sinking)
        if (isHeating) {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)'; // Purple warm plume rising
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';

          // Upward Central Plume
          ctx.beginPath();
          ctx.moveTo(0, beakerH - 12);
          ctx.lineTo(0, 60);
          ctx.stroke();

          // Left Circulation Loop
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
          ctx.beginPath();
          ctx.arc(-55, 120, 45, -Math.PI / 2, Math.PI / 2, true);
          ctx.stroke();

          // Right Circulation Loop
          ctx.beginPath();
          ctx.arc(55, 120, 45, -Math.PI / 2, Math.PI / 2, false);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lang === 'ne' ? 'तातो पानी माथि जान्छ ⬆️' : 'Warm Fluid Rises ⬆️', 0, 45);
          ctx.fillText(lang === 'ne' ? 'चिसो तल आउँछ ⬇️' : 'Cool Sinks ⬇️', -75, 130);
          ctx.fillText(lang === 'ne' ? 'चिसो तल आउँछ ⬇️' : 'Cool Sinks ⬇️', 75, 130);
        }
        ctx.restore();
      }

      // ==========================================
      // MODE 3: RADIATION (विकिरण)
      // ==========================================
      if (mode === 'radiation') {
        const srcX = 220;
        const srcY = 240;
        const detX = 660;
        const detY = 240;

        // High Temp Glowing Infrared Radiator Source
        const radGrad = ctx.createRadialGradient(srcX, srcY, 10, srcX, srcY, 70);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.3, '#f59e0b');
        radGrad.addColorStop(0.7, '#ef4444');
        radGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(srcX, srcY, 70, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? '🔥 तातो विकिरण स्रोत' : '🔥 Thermal Radiation Source', srcX, srcY + 95);

        // Vacuum Chamber Between Source and Sensor
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(srcX + 80, srcY - 80, detX - srcX - 160, 160);
        ctx.setLineDash([]);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(lang === 'ne' ? 'शून्य माध्यम (Vacuum / Space)' : 'Vacuum / No Medium Needed', (srcX + detX) / 2, srcY - 90);

        // Traveling Infrared Radiation Wavefronts
        if (isHeating) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 3;
          for (let w = 0; w < 4; w++) {
            const waveX = srcX + 70 + ((w * 80 + Date.now() / 20) % (detX - srcX - 140));
            ctx.beginPath();
            ctx.arc(srcX, srcY, waveX - srcX, -Math.PI / 4, Math.PI / 4);
            ctx.stroke();
          }
        }

        // Thermometer / Heat Sensor
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(detX - 25, detY - 60, 50, 120, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isHeating ? '#ef4444' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(detX, detY + 35, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(isHeating ? '58°C' : '22°C', detX, detY - 20);
        ctx.fillText(lang === 'ne' ? 'ताप सेन्सर' : 'Sensor', detX, detY + 80);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, rodMaterial, isHeating, heatProgress, pinsDropped, speedFactor, lang]);

  return (
    <SimulationLayout
      title="Heat Transfer Laboratory (Conduction, Convection, Radiation)"
      titleNepali="ताप सञ्चालन प्रयोगशाला (सञ्चालन, संवहन, विकिरण)"
      chapterNumber={7}
      chapterTitle="Unit 7: Energy in Daily Life"
      chapterTitleNepali="एकाइ ७: दैनिक जीवनमा शक्ति"
      currentStage={stage}
      onStageChange={(s) => {
        setStage(s);
        ScienceAudio.playClick();
      }}
      lang={lang}
      onLanguageChange={setLang}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
      stars={stars}
      isCompleted={isCompleted}
      currentPromptEn="Compare how heat travels through solids (Conduction), liquids (Convection), and empty space (Radiation)."
      currentPromptNe="ठोस (सञ्चालन), तरल (संवहन) र शून्य माध्यम (विकिरण) मा ताप कसरी सर्छ तुलना गर्नुहोस्।"
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
        {/* LEFT COLUMN: 2D CANVAS VIEWPORT */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={canvasRef}
            width={880}
            height={460}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
            }}
          />

          {/* Floating Top Mode Badge */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '6px 14px',
              borderRadius: '9999px',
              backdropFilter: 'blur(8px)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#38bdf8',
            }}
          >
            <Flame style={{ width: '14px', height: '14px', color: '#f43f5e' }} />
            <span>
              {mode === 'conduction' && (lang === 'ne' ? `सञ्चालन (Conduction): ${rodMaterial.toUpperCase()} Rod` : `Conduction: ${rodMaterial.toUpperCase()} Rod`)}
              {mode === 'convection' && (lang === 'ne' ? 'संवहन (Convection): तरल पदार्थको परिसञ्चरण' : 'Convection: Fluid Thermal Circulation')}
              {mode === 'radiation' && (lang === 'ne' ? 'विकिरण (Radiation): शून्य माध्यममा इन्फ्रारेड तरङ्ग' : 'Radiation: Infrared Waves in Vacuum')}
            </span>
          </div>

          {/* Floating Bottom Action Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backdropFilter: 'blur(8px)',
              color: '#e2e8f0',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {lang === 'ne' ? 'ताप सञ्चालन अवस्था:' : 'Heat Status:'}
              </span>
              <span style={{ color: isHeating ? '#f43f5e' : '#94a3b8', fontWeight: 600 }}>
                {isHeating ? (lang === 'ne' ? '🔥 बन्सेन बर्नर चालु छ...' : '🔥 Burner Heating Active...') : (lang === 'ne' ? 'ताप सुरु गर्न तयार' : 'Ready to Heat')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleStartHeating}
                disabled={isHeating}
                style={{
                  background: isHeating ? 'rgba(255, 255, 255, 0.08)' : 'linear-gradient(135deg, #f43f5e, #ea580c)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  cursor: isHeating ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(244, 63, 94, 0.3)',
                }}
              >
                <Flame style={{ width: '13px', height: '13px' }} />
                <span>{lang === 'ne' ? 'ताप दिनुहोस् (Heat ON)' : 'Apply Heat'}</span>
              </button>
              <button
                onClick={handleReset}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 380px PERSISTENT CONTROL SIDEBAR */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderLeft: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflowY: 'auto',
            padding: '16px',
            gap: '14px',
          }}
        >
          {/* Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.6))',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '13px' }}>
              <Sparkles style={{ width: '16px', height: '16px' }} />
              <span>{lang === 'ne' ? 'ताप सञ्चालन प्रयोगशाला' : 'Thermodynamics Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'ठोस (सञ्चालन), तरल (संवहन) र शून्य माध्यम (विकिरण) मा ताप सर्ने विधि जाँच्नुहोस्।'
                : 'Investigate how thermal energy travels through solids, fluids, and vacuum.'}
            </p>
          </div>

          {/* Mode Selector Buttons */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '१. ताप सर्ने तरिका छान्नुहोस् (Transfer Mode)' : '1. Heat Transfer Mode'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'conduction', nameEn: '1. Conduction (सञ्चालन)', nameNe: '१. सञ्चालन (ठोस पदार्थ)' },
                { id: 'convection', nameEn: '2. Convection (संवहन)', nameNe: '२. संवहन (तरल/ग्यास)' },
                { id: 'radiation', nameEn: '3. Radiation (विकिरण)', nameNe: '३. विकिरण (शून्य माध्यम)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id as TransferMode);
                    handleReset();
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: mode === m.id ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.08)',
                    background: mode === m.id ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: mode === m.id ? '#f43f5e' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {lang === 'ne' ? m.nameNe : m.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Material Selection (for Conduction Mode) */}
          {mode === 'conduction' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                {lang === 'ne' ? '२. डण्डीको धातु (Rod Material)' : '2. Rod Material'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { id: 'copper', nameEn: 'Copper', nameNe: 'तामा (छिटो)' },
                  { id: 'iron', nameEn: 'Iron', nameNe: 'फलाम (मध्यम)' },
                  { id: 'glass', nameEn: 'Glass', nameNe: 'काँच (कुचालक)' },
                ].map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => {
                      setRodMaterial(mat.id as any);
                      handleReset();
                    }}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: rodMaterial === mat.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                      background: rodMaterial === mat.id ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                      color: rodMaterial === mat.id ? '#fbbf24' : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'ne' ? mat.nameNe : mat.nameEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scientific Mechanism Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
              {lang === 'ne' ? '🔬 वैज्ञानिक प्रक्रिया (Mechanism):' : '🔬 Scientific Mechanism:'}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {mode === 'conduction' && (
                <span>
                  {lang === 'ne'
                    ? 'अणुहरूको स्थान परिवर्तन नभई केवल कम्पन (Vibration) मार्फत तातो छेउबाट चिसो छेउतिर ताप सर्ने प्रक्रिया सञ्चालन हो।'
                    : 'Molecules vibrate vigorously and transfer kinetic energy to neighbors without leaving their physical lattice positions.'}
                </span>
              )}
              {mode === 'convection' && (
                <span>
                  {lang === 'ne'
                    ? 'तरल वा ग्यासका ताता अणुहरू हलुका भई माथि जाने र चिसो पानी तल आउने चक्र नै संवहन हो (Convection Currents)।'
                    : 'Heated fluid expands, decreases in density, and rises, while cooler dense fluid sinks, forming continuous circulation loops.'}
                </span>
              )}
              {mode === 'radiation' && (
                <span>
                  {lang === 'ne'
                    ? 'कुनै माध्यमबिना शून्य अन्तरिक्षमा पनि प्रकाशको चालमा विद्युतीय चुम्बकीय इन्फ्रारेड तरङ्गद्वारा ताप सर्ने प्रक्रिया विकिरण हो।'
                    : 'Infrared electromagnetic waves transfer thermal radiation at the speed of light through vacuum with zero physical medium.'}
                </span>
              )}
            </div>
          </div>

          {/* Curriculum Key Takeaway */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '11px',
              color: '#64748b',
              lineHeight: '1.4',
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
              {lang === 'ne' ? '📚 पाठ्यक्रम मुख्य बुँदा:' : '📚 Curriculum Takeaway:'}
            </div>
            {lang === 'ne'
              ? 'ताप सधैं उच्च तापक्रम भएको स्थानबाट न्यून तापक्रम भएको स्थानतिर सर्दछ। ठोसमा सञ्चालन, तरलमा संवहन र शून्यमा विकिरण हुन्छ।'
              : 'Heat flows from higher to lower temperature. Conduction occurs in solids, convection in fluids, and radiation across vacuum.'}
          </div>

          {/* Sticky Complete Button */}
          <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
            <button
              onClick={() => {
                setIsCompleted(true);
                setStars(3);
                ScienceAudio.playSuccess();
              }}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Award style={{ width: '16px', height: '16px' }} />
              <span>{lang === 'ne' ? '✓ ताप सञ्चालन प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Heat Transfer Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default HeatTransferLabSim;
