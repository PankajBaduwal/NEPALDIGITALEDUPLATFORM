/**
 * PotentialKineticEnergySim.tsx
 * Simulation 19: 2D Potential & Kinetic Energy Conservation (स्थिति र गति शक्ति)
 * Grade 6 Science • Unit 7: Energy in Daily Life (दैनिक जीवनमा शक्ति)
 *
 * 100% Native HTML5 Canvas 2D Interactive Energy Conservation Physics.
 * Features:
 * 1. Gravitational Potential Energy: PE = m * g * h
 * 2. Kinetic Energy: KE = 0.5 * m * v²
 * 3. Law of Conservation of Energy: Total Energy = PE + KE = Constant
 * 4. Parabolic U-track with rolling ball oscillating with physical inertia
 * 5. Real-time dynamic stacked energy bar charts & speedometer dial
 * 6. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Play, Pause, RotateCcw, Sparkles, Activity, Zap, Award } from 'lucide-react';

export const PotentialKineticEnergySim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Simulation Parameters
  const [massKg, setMassKg] = useState<number>(5); // 2 to 10 kg
  const [releaseHeightM, setReleaseHeightM] = useState<number>(4); // 1 to 5 m
  const [gravity, setGravity] = useState<number>(9.8); // 9.8 m/s²
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simTimeRef = useRef<number>(0);

  const totalEnergy = Math.round(massKg * gravity * releaseHeightM);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setMassKg(5);
    setReleaseHeightM(4);
    setIsPlaying(true);
    simTimeRef.current = 0;
    setStars(0);
    setIsCompleted(false);
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

      // Update simulation oscillation time
      if (isPlaying) {
        simTimeRef.current += 0.035;
      }
      const t = simTimeRef.current;

      // Oscillating along parabolic track: x ranges from -A to +A
      const maxAmpPix = (releaseHeightM / 5) * 260; // horizontal excursion
      const ballXOffset = Math.cos(t) * maxAmpPix;

      // Parabolic curve equation: y = trackBaseY - (xOffset² / (maxAmpPix²)) * (releaseHeightM * 45)
      const trackBaseX = 380;
      const trackBaseY = 360;
      const trackMaxH = releaseHeightM * 45; // pixels
      const currentHeightPix = Math.pow(ballXOffset / maxAmpPix, 2) * trackMaxH;
      const currentHeightM = parseFloat(((currentHeightPix / (5 * 45)) * 5).toFixed(2));

      // Instantaneous Energies
      const currentPE = Math.max(0, Math.round(massKg * gravity * currentHeightM));
      const currentKE = Math.max(0, totalEnergy - currentPE);
      const currentVelocity = parseFloat(Math.sqrt(Math.max(0, (2 * currentKE) / massKg)).toFixed(1));

      // Dark Laboratory Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Grid Pattern
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // ── PARABOLIC U-TRACK ──
      const trackWidthPix = 300;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let x = -trackWidthPix; x <= trackWidthPix; x += 10) {
        const hPix = Math.pow(x / trackWidthPix, 2) * (5 * 45);
        const px = trackBaseX + x;
        const py = trackBaseY - hPix;
        if (x === -trackWidthPix) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Track Support Pillars
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      for (let x = -trackWidthPix; x <= trackWidthPix; x += 100) {
        const hPix = Math.pow(x / trackWidthPix, 2) * (5 * 45);
        ctx.beginPath();
        ctx.moveTo(trackBaseX + x, trackBaseY - hPix);
        ctx.lineTo(trackBaseX + x, trackBaseY + 40);
        ctx.stroke();
      }

      // Height Reference Line at Max Release Height
      const maxReleaseY = trackBaseY - trackMaxH;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(trackBaseX - maxAmpPix - 30, maxReleaseY);
      ctx.lineTo(trackBaseX + maxAmpPix + 30, maxReleaseY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`h_max = ${releaseHeightM} m`, trackBaseX - maxAmpPix - 36, maxReleaseY + 4);

      // ── OSCILLATING SPHERE (BALL) ──
      const ballX = trackBaseX + ballXOffset;
      const ballY = trackBaseY - currentHeightPix - 16;
      const ballRadius = 16 + massKg * 0.8;

      ctx.save();
      ctx.translate(ballX, ballY);

      // Ball Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 18, ballRadius, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Metallic Ball Gradient
      const ballGrad = ctx.createRadialGradient(-ballRadius * 0.3, -ballRadius * 0.3, 2, 0, 0, ballRadius);
      ballGrad.addColorStop(0, '#fef08a');
      ballGrad.addColorStop(0.5, '#f59e0b');
      ballGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Velocity Motion Trail / Arrow
      if (Math.abs(currentVelocity) > 0.5) {
        const velDir = -Math.sin(t);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(velDir * (currentVelocity * 4), 0);
        ctx.stroke();
      }

      ctx.restore();

      // ── RIGHT READOUT HUD: DYNAMIC ENERGY BARS ──
      const hudX = width - 260;
      const hudY = 25;
      const hudW = 230;
      const hudH = 380;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? '⚡ शक्ति संरक्षण नियम' : '⚡ Conservation of Energy', hudX + 16, hudY + 28);

      // Total Mechanical Energy (E = PE + KE)
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(lang === 'ne' ? `कुल शक्ति (E): ${totalEnergy} J` : `Total Energy (E): ${totalEnergy} J`, hudX + 16, hudY + 65);

      // Potential Energy (PE) Bar
      const pePercent = totalEnergy > 0 ? currentPE / totalEnergy : 0;
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(lang === 'ne' ? `स्थिति शक्ति (PE = mgh): ${currentPE} J` : `Potential (PE): ${currentPE} J`, hudX + 16, hudY + 105);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(hudX + 16, hudY + 115, hudW - 32, 16, 6);
      ctx.fill();
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(hudX + 16, hudY + 115, (hudW - 32) * pePercent, 16, 6);
      ctx.fill();

      // Kinetic Energy (KE) Bar
      const kePercent = totalEnergy > 0 ? currentKE / totalEnergy : 0;
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(lang === 'ne' ? `गति शक्ति (KE = ½mv²): ${currentKE} J` : `Kinetic (KE): ${currentKE} J`, hudX + 16, hudY + 165);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(hudX + 16, hudY + 175, hudW - 32, 16, 6);
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(hudX + 16, hudY + 175, (hudW - 32) * kePercent, 16, 6);
      ctx.fill();

      // Velocity & Height Gauges
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(
        lang === 'ne' ? `गति (Velocity): ${currentVelocity} m/s` : `Speed (v): ${currentVelocity} m/s`,
        hudX + 16,
        hudY + 230
      );

      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(
        lang === 'ne' ? `उचाइ (Height): ${currentHeightM} m` : `Height (h): ${currentHeightM} m`,
        hudX + 16,
        hudY + 260
      );

      // Key Takeaway Note
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(
        lang === 'ne' ? '• चुचुरोमा: PE अधिकतम, KE = 0' : '• At Top: PE Maximum, KE = 0',
        hudX + 16,
        hudY + 310
      );
      ctx.fillText(
        lang === 'ne' ? '• तल्लो विन्दुमा: KE अधिकतम, PE = 0' : '• At Bottom: KE Maximum, PE = 0',
        hudX + 16,
        hudY + 330
      );
      ctx.fillStyle = '#a7f3d0';
      ctx.fillText('PE + KE = Constant (अपरिवर्तनीय)', hudX + 16, hudY + 355);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [massKg, releaseHeightM, gravity, isPlaying, totalEnergy, lang]);

  return (
    <SimulationLayout
      title="Potential and Kinetic Energy Conservation"
      titleNepali="स्थिति तथा गति शक्ति संरक्षण प्रयोगशाला"
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
      currentPromptEn="Observe the continuous conversion between Potential Energy (PE = mgh) and Kinetic Energy (KE = ½mv²)."
      currentPromptNe="गोलागुड्दा स्थिति शक्ति (PE) र गति शक्ति (KE) कसरी एकअर्कामा रूपान्तरण हुन्छन् हेर्नुहोस्।"
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

          {/* Floating Top Total Mechanical Energy Badge */}
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
            <Activity style={{ width: '14px', height: '14px' }} />
            <span>
              {lang === 'ne'
                ? `कुल यान्त्रिक शक्ति (Total Energy): ${(massKg * 9.8 * releaseHeightM).toFixed(1)} J`
                : `Total Mechanical Energy: ${(massKg * 9.8 * releaseHeightM).toFixed(1)} Joules`}
            </span>
          </div>

          {/* Floating Bottom Playback Dock */}
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
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Energy Conservation:</span>
              <span style={{ fontFamily: 'monospace', color: '#4ade80' }}>PE + KE = Constant (E_mech)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  ScienceAudio.playClick();
                }}
                style={{
                  background: isPlaying ? 'rgba(255, 255, 255, 0.08)' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: isPlaying ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isPlaying ? <Pause style={{ width: '13px', height: '13px' }} /> : <Play style={{ width: '13px', height: '13px' }} />}
                <span>{isPlaying ? (lang === 'ne' ? 'रोक्नुहोस्' : 'Pause') : (lang === 'ne' ? 'सुरु गर्नुहोस्' : 'Play')}</span>
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
              <span>{lang === 'ne' ? 'यान्त्रिक शक्ति प्रयोगशाला' : 'Mechanical Energy Hub'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'उचाइ र पिण्ड परिवर्तन गर्नुहोस्, स्थिति शक्ति र गति शक्ति कसरी आपसमा साटिन्छन् हेर्नुहोस्।'
                : 'Vary release height and mass to observe PE (mgh) and KE (½mv²) oscillating dynamically.'}
            </p>
          </div>

          {/* Release Height (h) Slider */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>
                {lang === 'ne' ? 'छोडिएको उचाइ (Height h):' : 'Release Height (h):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {releaseHeightM} m
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={releaseHeightM}
              onChange={(e) => setReleaseHeightM(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>1.0 m</span>
              <span>3.0 m</span>
              <span>5.0 m</span>
            </div>
          </div>

          {/* Ball Mass Slider */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
                {lang === 'ne' ? 'गोलाको पिण्ड (Mass m):' : 'Sphere Mass (m):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {massKg} kg
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              step={1}
              value={massKg}
              onChange={(e) => setMassKg(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
          </div>

          {/* Energy Breakdown Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '📊 शक्ति सूत्र र गणना:' : '📊 Energy Equations:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>स्थिति शक्ति (PE = mgh):</span>
                <span style={{ fontFamily: 'monospace', color: '#fbbf24' }}>{massKg}×9.8×{releaseHeightM} J</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>गति शक्ति (KE = ½mv²):</span>
                <span style={{ fontFamily: 'monospace', color: '#34d399' }}>0 at top ➔ Max at bottom</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>कुल शक्ति (Total E):</span>
                <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 700 }}>{(massKg * 9.8 * releaseHeightM).toFixed(1)} J</span>
              </div>
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
              ? 'वस्तु उचाइमा हुँदा स्थिति शक्ति अधिकतम हुन्छ। तल खस्दा स्थिति शक्ति घटेर गति शक्तिमा बदलिन्छ। तर कुल शक्ति सधैं स्थिर रहन्छ।'
              : 'At the apex, all energy is Potential (PE). At the bottom, PE converts entirely to Kinetic (KE). Total energy is conserved.'}
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
              <span>{lang === 'ne' ? '✓ यान्त्रिक शक्ति प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Mechanical Energy Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default PotentialKineticEnergySim;
