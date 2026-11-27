/**
 * SpringBalanceLabSim.tsx
 * Simulation 17: 2D Spring Balance Laboratory
 * Grade 6 Science • Unit 6: Force and Motion
 *
 * 100% Native HTML5 Canvas 2D Interactive Physics Balance.
 * Features:
 * 1. Hooke's Law: F = k * Δx
 * 2. Mass vs Weight: Mass (g/kg) is constant, Weight (W = mg in Newtons) changes with gravity
 * 3. Gravitational environments: Earth (g = 9.8 m/s²), Moon (g = 1.63 m/s²), Space Zero-G (g = 0)
 * 4. Procedural helical spring coils stretching dynamically with red pointer needle
 * 5. Slotted calibrated hanging weights (100g, 200g, 500g)
 * 6. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Scale, Globe, Moon, Sparkles, Plus, Minus, RotateCcw, Award } from 'lucide-react';

type GravityPreset = 'earth' | 'moon' | 'space';

export const SpringBalanceLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Mass & Gravity State
  const [massGrams, setMassGrams] = useState<number>(400); // 100g to 1000g
  const [gravityEnv, setGravityEnv] = useState<GravityPreset>('earth');

  const gMap: Record<GravityPreset, { g: number; nameEn: string; nameNe: string; icon: string }> = {
    earth: { g: 9.8, nameEn: 'Earth', nameNe: 'पृथ्वी (g = 9.8)', icon: '🌍' },
    moon: { g: 1.63, nameEn: 'Moon', nameNe: 'चन्द्रमा (g = 1.63)', icon: '🌕' },
    space: { g: 0, nameEn: 'Zero-G Space', nameNe: 'शून्य गुरुत्व (g = 0)', icon: '🚀' },
  };

  const currentG = gMap[gravityEnv];
  const massKg = massGrams / 1000;
  const weightNewtons = parseFloat((massKg * currentG.g).toFixed(2));
  // Spring constant k = 50 N/m
  const kSpring = 50;
  const extensionCm = parseFloat(((weightNewtons / kSpring) * 100).toFixed(1));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setMassGrams(400);
    setGravityEnv('earth');
    setStars(0);
    setIsCompleted(false);
  };

  const handleAddWeight = (deltaGrams: number) => {
    ScienceAudio.playDing();
    setMassGrams((prev) => Math.max(100, Math.min(1000, prev + deltaGrams)));
    if (stage === 'challenge' && stars < 3) setStars(3);
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

      // Dark Lab Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Studio Gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.6);
      bgGrad.addColorStop(0, '#111e33');
      bgGrad.addColorStop(1, '#060a14');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Floor Countertop
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 430, width, height - 430);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 430);
      ctx.lineTo(width, 430);
      ctx.stroke();

      // ── LABORATORY RETORT STAND ──
      const standX = 360;
      // Heavy Steel Base
      ctx.fillStyle = '#334155';
      ctx.fillRect(standX - 80, 410, 160, 20);
      // Vertical Steel Rod
      ctx.fillStyle = '#64748b';
      ctx.fillRect(standX - 6, 60, 12, 350);
      // Horizontal Top Arm
      ctx.fillRect(standX - 6, 60, 120, 12);

      // ── SPRING BALANCE HOUSING & CYLINDER ──
      const balX = standX + 90;
      const balTopY = 72;
      const balW = 48;
      const balH = 260;

      // Top Hanging Ring
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(balX, balTopY + 10, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Clear Glass/Plastic Body Casing
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(balX - balW / 2, balTopY + 20, balW, balH, 8);
      ctx.fill();
      ctx.stroke();

      // Calibrated Metric Scale Marks on Left & Right
      // 0 to 10 Newtons (0 to 1000 grams)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let n = 0; n <= 10; n++) {
        const markY = balTopY + 40 + n * 20;
        // Newton marks (left)
        ctx.beginPath();
        ctx.moveTo(balX - balW / 2 + 2, markY);
        ctx.lineTo(balX - balW / 2 + 10, markY);
        ctx.stroke();
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${n}N`, balX - balW / 2 + 12, markY + 3);

        // Gram marks (right)
        ctx.beginPath();
        ctx.moveTo(balX + balW / 2 - 2, markY);
        ctx.lineTo(balX + balW / 2 - 8, markY);
        ctx.stroke();
      }

      // ── PROCEDURAL HELICAL SPRING COIL ──
      // Dynamic extension: 0N = markY 0 (balTopY + 40), 10N = markY 10 (balTopY + 240)
      const maxExtPix = 200;
      const currentExtPix = (weightNewtons / 10) * maxExtPix;
      const springStartY = balTopY + 35;
      const springEndY = springStartY + 40 + currentExtPix;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(balX, springStartY);

      const coils = 14;
      const coilStep = (springEndY - springStartY) / coils;
      for (let c = 0; c < coils; c++) {
        const cy = springStartY + c * coilStep;
        const dir = c % 2 === 0 ? 1 : -1;
        ctx.lineTo(balX + dir * 12, cy + coilStep / 2);
        ctx.lineTo(balX, cy + coilStep);
      }
      ctx.stroke();

      // ── RED POINTER NEEDLE ──
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(balX - balW / 2 + 2, springEndY);
      ctx.lineTo(balX - 4, springEndY - 4);
      ctx.lineTo(balX - 4, springEndY + 4);
      ctx.closePath();
      ctx.fill();

      // ── LOWER HOOK & CALIBRATED HANGING WEIGHTS ──
      const hookStartY = springEndY;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(balX, hookStartY);
      ctx.lineTo(balX, balTopY + balH + 15);
      ctx.arc(balX, balTopY + balH + 25, 10, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Hanging Brass Weights
      const wY = balTopY + balH + 35;
      const wWidth = 44 + (massGrams / 1000) * 20;
      const wHeight = 35 + (massGrams / 1000) * 30;

      ctx.save();
      ctx.translate(balX, wY);

      // Weight Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, wHeight + 6, wWidth / 2 + 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brass Cylindrical Weight Body
      const brassGrad = ctx.createLinearGradient(-wWidth / 2, 0, wWidth / 2, 0);
      brassGrad.addColorStop(0, '#ca8a04');
      brassGrad.addColorStop(0.5, '#fef08a');
      brassGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = brassGrad;
      ctx.beginPath();
      ctx.roundRect(-wWidth / 2, 0, wWidth, wHeight, 6);
      ctx.fill();
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Weight Imprint
      ctx.fillStyle = '#713f12';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${massGrams} g`, 0, wHeight / 2 + 4);
      ctx.restore();

      // ── RIGHT READOUT HUD CARD ──
      const hudX = 560;
      const hudY = 80;
      const hudW = 280;
      const hudH = 300;

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
      ctx.fillText(lang === 'ne' ? '📊 भौतिक मापन परिणाम:' : '📊 Physical Measurements:', hudX + 16, hudY + 28);

      // Mass (kg)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(
        lang === 'ne' ? `पिण्ड (Mass, m): ${massKg} kg (${massGrams}g)` : `Mass (m): ${massKg} kg (${massGrams}g)`,
        hudX + 16,
        hudY + 65
      );
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(lang === 'ne' ? '• पिण्ड ब्रह्माण्डभरि स्थिर रहन्छ।' : '• Mass is constant anywhere.', hudX + 16, hudY + 80);

      // Local Gravity g
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(
        lang === 'ne' ? `गुरुत्वप्रवेग (g): ${currentG.g} m/s²` : `Gravity (g): ${currentG.g} m/s²`,
        hudX + 16,
        hudY + 115
      );

      // Weight (W = mg in Newtons)
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(
        lang === 'ne' ? `तौल (Weight, W): ${weightNewtons} N` : `Weight (W = mg): ${weightNewtons} N`,
        hudX + 16,
        hudY + 155
      );
      ctx.fillStyle = '#f87171';
      ctx.font = '10px sans-serif';
      ctx.fillText('W = m × g (Newtons)', hudX + 16, hudY + 172);

      // Spring Extension
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(
        lang === 'ne' ? `कमानीको प्रसार (Δx): ${extensionCm} cm` : `Spring Extension (Δx): ${extensionCm} cm`,
        hudX + 16,
        hudY + 210
      );

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(lang === 'ne' ? 'हुकको नियम: F = k × Δx (k = 50 N/m)' : "Hooke's Law: F = k × Δx (k = 50 N/m)", hudX + 16, hudY + 230);

      // Gravity Environment Indicator
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(hudX + 16, hudY + 250, hudW - 32, 34, 8);
      ctx.fill();
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${currentG.icon} ${lang === 'ne' ? currentG.nameNe : currentG.nameEn}`, hudX + 28, hudY + 272);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [massGrams, gravityEnv, weightNewtons, extensionCm, currentG, lang]);

  return (
    <SimulationLayout
      title="Spring Balance and Hooke's Law Laboratory"
      titleNepali="कमानीदार तराजु तथा हुकको नियम प्रयोगशाला"
      chapterNumber={6}
      chapterTitle="Unit 6: Force and Motion"
      chapterTitleNepali="एकाइ 6: बल र गति"
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
      currentPromptEn="Hang calibrated weights to stretch the helical spring and test how weight changes on the Moon and Zero-G."
      currentPromptNe="कमानीदार तराजुमा तौल झुण्ड्याउनुहोस् र चन्द्रमा तथा शून्य गुरुत्वमा तौल कसरी बदलिन्छ जाँच्नुहोस्।"
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

          {/* Floating Top Gravity Badge */}
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
            <Scale style={{ width: '14px', height: '14px' }} />
            <span>
              {gMap[gravityEnv].icon} {lang === 'ne' ? gMap[gravityEnv].nameNe : gMap[gravityEnv].nameEn} | g = {currentG.g} m/s²
            </span>
          </div>

          {/* Floating Bottom Weight Banner */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {lang === 'ne' ? 'तौल (Weight W = m × g):' : 'Weight (W = m × g):'}
              </span>
              <span style={{ fontFamily: 'monospace', color: '#f87171', fontWeight: 700, fontSize: '13px' }}>
                {weightNewtons} N
              </span>
              <span style={{ color: '#64748b' }}>|</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>
                {lang === 'ne' ? `कमानी प्रसार: ${extensionCm} cm` : `Extension: ${extensionCm} cm`}
              </span>
            </div>
            <span style={{ color: '#64748b', fontSize: '11px' }}>
              {lang === 'ne' ? 'हुकको नियम: F = k × Δx' : "Hooke's Law: F = k · Δx"}
            </span>
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
              <span>{lang === 'ne' ? 'कमानीदार तराजु प्रयोगशाला' : "Hooke's Law Discovery Station"}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'कमानीमा तौल झुण्ड्याएर प्रसार नाप्नुहोस् र पृथ्वी, चन्द्रमा तथा अन्तरिक्षमा तौलको फरक हेर्नुहोस्।'
                : 'Stretch calibrated springs, test mass vs weight, and compare gravity on Earth, Moon, and Space.'}
            </p>
          </div>

          {/* Gravity Environment Selection */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '1. गुरुत्व वातावरण छान्नुहोस् (Gravity Field)' : '1. Gravity Field'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {(['earth', 'moon', 'space'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => {
                    setGravityEnv(env);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: gravityEnv === env ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                    background: gravityEnv === env ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: gravityEnv === env ? '#fbbf24' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{gMap[env].icon}</span>
                  <span style={{ fontSize: '10px' }}>{lang === 'ne' ? gMap[env].nameNe : gMap[env].nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hanging Mass Slider */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Scale style={{ width: '13px', height: '13px' }} />
                {lang === 'ne' ? 'झुण्ड्याइएको पिण्ड (Mass m):' : 'Hanging Mass (m):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {massGrams} g ({massKg} kg)
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={massGrams}
              onChange={(e) => setMassGrams(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>100 g</span>
              <span>500 g</span>
              <span>1000 g (1 kg)</span>
            </div>
          </div>

          {/* Quick Add Slotted Weights */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? 'तौल थप्नुहोस् (Quick Weights)' : 'Quick Slotted Weights'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[100, 200, 500].map((w) => (
                <button
                  key={w}
                  onClick={() => handleAddWeight(w)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid #e2e8f0',
                    color: '#fbbf24',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  +{w}g
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '📊 भौतिक गणना (Physics Metrics):' : '📊 Physics Metrics:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'पिण्ड (Mass m):' : 'Mass (m):'}</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{massKg} kg ({massGrams} g)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'गुरुत्वप्रवेग (g):' : 'Gravity Acceleration (g):'}</span>
                <span style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{currentG.g} m/s²</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#f87171', fontWeight: 700 }}>{lang === 'ne' ? 'तौल (Weight W = mg):' : 'Weight (W = mg):'}</span>
                <span style={{ fontWeight: 700, color: '#f87171', fontFamily: 'monospace' }}>{weightNewtons} N</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#34d399', fontWeight: 700 }}>{lang === 'ne' ? 'कमानीको प्रसार (Δx):' : 'Extension (Δx):'}</span>
                <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{extensionCm} cm</span>
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
              ? 'पिण्ड ब्रह्माण्डभरि स्थिर रहन्छ, तर तौल (W = mg) गुरुत्वअनुसार बदलिन्छ। कमानीको प्रसार भारसँग समानुपातिक हुन्छ (हुकको नियम)।'
              : 'Mass is constant everywhere, but Weight varies with local gravity (W = mg). Helical spring stretch is proportional to weight.'}
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
              <span>{lang === 'ne' ? '✓ कमानीदार तराजु प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Spring Balance Lab & Quiz'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default SpringBalanceLabSim;
