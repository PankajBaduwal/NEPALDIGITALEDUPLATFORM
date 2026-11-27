/**
 * EnergyTransformationLabSim.tsx
 * Simulation 20: 2D Energy Transformation Laboratory
 * Grade 6 Science • Unit 7: Energy in Daily Life
 *
 * 100% Native HTML5 Canvas 2D Interactive Energy Conversion Studio.
 * Features:
 * 1. Transformation Chains:
 *    - Solar PV Cell: Solar Light (hν) ➔ Electrical Energy ➔ Output Device
 *    - Hydro Dam Turbine: Gravitational Potential (Water) ➔ Kinetic ➔ Electrical
 *    - Chemical Battery: Chemical Energy ➔ Electrical Current ➔ Output Device
 * 2. Selectable Output Appliances: Incandescent Bulb (Light/Heat), Electric Motor Fan (Mechanical/Kinetic), Buzzer (Sound)
 * 3. Animated traveling electrons and energy conversion flow particles
 * 4. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Sun, Droplets, BatteryCharging, Lightbulb, Fan, Volume2, Sparkles, ArrowRight, Zap, Award } from 'lucide-react';

type EnergySource = 'sun' | 'hydro' | 'battery';
type EnergyOutput = 'bulb' | 'motor_fan' | 'buzzer';

export const EnergyTransformationLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // System Setup
  const [source, setSource] = useState<EnergySource>('sun');
  const [output, setOutput] = useState<EnergyOutput>('bulb');
  const [powerActive, setPowerActive] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setSource('sun');
    setOutput('bulb');
    setPowerActive(true);
    setStars(0);
    setIsCompleted(false);
  };

  const handleSelectSource = (s: EnergySource) => {
    ScienceAudio.playClick();
    setSource(s);
  };

  const handleSelectOutput = (o: EnergyOutput) => {
    ScienceAudio.playClick();
    setOutput(o);
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
      const time = Date.now() / 250;

      // Dark Tech Laboratory Background
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Floor Platform
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 390, width, height - 390);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 390);
      ctx.lineTo(width, 390);
      ctx.stroke();

      // ==========================================
      // 1. LEFT SOURCE COMPONENT (x = 180, y = 240)
      // ==========================================
      const srcX = 180;
      const srcY = 240;

      if (source === 'sun') {
        // Glowing Sun in Sky
        const sunX = 140;
        const sunY = 100;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 45);
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.3, '#fef08a');
        sunGrad.addColorStop(0.7, '#f59e0b');
        sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 45, 0, Math.PI * 2);
        ctx.fill();

        // Solar Photovoltaic Panel on Stand
        ctx.fillStyle = '#1e3a8a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.save();
        ctx.translate(srcX, srcY);
        ctx.rotate(-0.3);
        ctx.roundRect(-50, -30, 100, 60, 6);
        ctx.fill();
        ctx.stroke();

        // Solar Grid Lines
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1;
        for (let g = -30; g <= 30; g += 20) {
          ctx.beginPath();
          ctx.moveTo(g, -30);
          ctx.lineTo(g, 30);
          ctx.stroke();
        }
        ctx.restore();

        // Photons Streaming from Sun to Solar Panel
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        for (let p = 0; p < 5; p++) {
          const streamT = ((Date.now() / 40 + p * 60) % 240) / 240;
          const px = sunX + streamT * (srcX - sunX);
          const py = sunY + streamT * (srcY - sunY);
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? 'सौर्य सेल (प्रकाश शक्ति)' : 'Solar PV Cell (Light Energy)', srcX, srcY + 70);
      } else if (source === 'hydro') {
        // Hydro Dam Reservoir & Water Chute
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(srcX - 70, srcY - 90, 80, 100, 8);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Falling Water Gush
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.fillRect(srcX + 10, srcY - 30, 20, 90);

        // Hydro Pelton Turbine Wheel spinning
        ctx.save();
        ctx.translate(srcX + 20, srcY + 60);
        ctx.rotate(time * 2);
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        // Buckets
        ctx.fillStyle = '#94a3b8';
        for (let b = 0; b < 6; b++) {
          ctx.fillRect(-4, -28, 8, 12);
          ctx.rotate(Math.PI / 3);
        }
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? 'जलविद्युत टर्बाइन (गति शक्ति)' : 'Hydro Turbine (Kinetic Energy)', srcX, srcY + 110);
      } else {
        // Chemical Dry Cell Battery
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(srcX - 35, srcY - 60, 70, 120, 8);
        ctx.fill();
        ctx.stroke();

        // Terminal Nubs (+ and -)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(srcX - 12, srcY - 72, 24, 12);

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CHEMICAL', srcX, srcY - 10);
        ctx.fillText('BATTERY', srcX, srcY + 10);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('⚡ 12V', srcX, srcY + 36);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'ne' ? 'ब्याट्री (रासायनिक शक्ति)' : 'Dry Cell (Chemical Energy)', srcX, srcY + 85);
      }

      // ==========================================
      // 2. MIDDLE ELECTRICAL TRANSMISSION WIRES
      // ==========================================
      const outX = 640;
      const outY = 240;

      // Top Copper Wire (Positive)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(srcX + 50, srcY - 40);
      ctx.lineTo(outX - 50, outY - 40);
      ctx.stroke();

      // Bottom Copper Wire (Negative / Ground)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(srcX + 50, srcY + 40);
      ctx.lineTo(outX - 50, outY + 40);
      ctx.stroke();

      // Flowing Yellow Electrons / Charge Packets along Wire
      if (powerActive) {
        ctx.fillStyle = '#fef08a';
        for (let e = 0; e < 6; e++) {
          const wireT = ((Date.now() / 20 + e * 70) % 380) / 380;
          const ex = srcX + 50 + wireT * (outX - srcX - 100);
          ctx.beginPath();
          ctx.arc(ex, srcY - 40, 4, 0, Math.PI * 2);
          ctx.arc(outX - 50 - wireT * (outX - srcX - 100), srcY + 40, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Central Energy Flow Transformation Box
      const midBoxX = (srcX + outX) / 2;
      const midBoxY = srcY;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(midBoxX - 85, midBoxY - 26, 170, 52, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ ELECTRICAL ENERGY', midBoxX, midBoxY - 4);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(lang === 'ne' ? 'विद्युत शक्ति प्रसारण' : 'Electron Current Flow', midBoxX, midBoxY + 14);

      // ==========================================
      // 3. RIGHT OUTPUT APPLIANCE
      // ==========================================
      if (output === 'bulb') {
        // Incandescent Bulb with Radiant Aura
        const bulbR = 36;
        if (powerActive) {
          const glowGrad = ctx.createRadialGradient(outX, outY - 10, 10, outX, outY - 10, 80);
          glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
          glowGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
          glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(outX, outY - 10, 80, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bulb Glass Dome
        ctx.fillStyle = powerActive ? '#fef08a' : 'rgba(255, 255, 255, 0.15)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(outX, outY - 14, bulbR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Base Socket
        ctx.fillStyle = '#64748b';
        ctx.fillRect(outX - 14, outY + 22, 28, 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? 'बत्ती (प्रकाश र ताप शक्ति)' : 'Bulb (Light & Heat Energy)', outX, outY + 70);
      } else if (output === 'motor_fan') {
        // Electric Motor Casing
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(outX - 30, outY - 30, 60, 60, 8);
        ctx.fill();
        ctx.stroke();

        // Spinning Fan Blades
        ctx.save();
        ctx.translate(outX, outY);
        if (powerActive) ctx.rotate(time * 3);
        ctx.fillStyle = '#38bdf8';
        for (let b = 0; b < 3; b++) {
          ctx.beginPath();
          ctx.ellipse(0, -32, 8, 24, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.rotate((Math.PI * 2) / 3);
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? 'पङ्खा (गति / यान्त्रिक शक्ति)' : 'Fan (Kinetic / Mechanical)', outX, outY + 70);
      } else {
        // Electronic Buzzer & Sound Waves
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(outX, outY, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#a855f7';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔊', outX, outY + 8);

        // Concentric Sound Wave Arcs
        if (powerActive) {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
          ctx.lineWidth = 2.5;
          for (let w = 1; w <= 3; w++) {
            const r = 36 + ((w * 16 + Date.now() / 40) % 50);
            ctx.beginPath();
            ctx.arc(outX + 20, outY, r, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
          }
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? 'बजर (ध्वनि शक्ति)' : 'Buzzer (Sound Energy)', outX, outY + 70);
      }

      // ── TOP TRANSFORMATION BANNER ──
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 280, 20, 560, 48, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      const srcName = source === 'sun' ? 'Solar Light' : source === 'hydro' ? 'Water Potential/Kinetic' : 'Chemical';
      const outName = output === 'bulb' ? 'Light & Heat' : output === 'motor_fan' ? 'Kinetic / Mechanical' : 'Sound';
      ctx.fillText(`${srcName} ➔ Electrical Current ➔ ${outName}`, width / 2, 48);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [source, output, powerActive, lang]);

  return (
    <SimulationLayout
      title="Energy Transformation Chains Laboratory"
      titleNepali="शक्ति रूपान्तरण चक्र प्रयोगशाला"
      chapterNumber={7}
      chapterTitle="Unit 7: Energy in Daily Life"
      chapterTitleNepali="एकाइ 7: दैनिक जीवनमा शक्ति"
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
      currentPromptEn="Select an energy source and an output device to trace how energy transforms from one form to another."
      currentPromptNe="शक्तिको स्रोत र उपकरण छान्नुहोस् र शक्ति कसरी एक रूपबाट अर्कोमा बदलिन्छ हेर्नुहोस्।"
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

          {/* Floating Top Transformation Chain Badge */}
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
            <Sparkles style={{ width: '14px', height: '14px' }} />
            <span>
              {source === 'sun' && (lang === 'ne' ? 'सौर्य शक्ति ➔ विद्युत शक्ति' : 'Solar ➔ Electrical')}
              {source === 'hydro' && (lang === 'ne' ? 'स्थितिशक्ति ➔ गतिशक्ति ➔ विद्युत शक्ति' : 'Potential ➔ Kinetic ➔ Electrical')}
              {source === 'battery' && (lang === 'ne' ? 'रासायनिक शक्ति ➔ विद्युत शक्ति' : 'Chemical ➔ Electrical')}
              {' ➔ '}
              {output === 'bulb' && (lang === 'ne' ? 'प्रकाश र ताप शक्ति' : 'Light & Heat')}
              {output === 'motor_fan' && (lang === 'ne' ? 'यान्त्रिक/गति शक्ति' : 'Kinetic / Mechanical')}
              {output === 'buzzer' && (lang === 'ne' ? 'ध्वनि शक्ति' : 'Sound Waves')}
            </span>
          </div>

          {/* Floating Bottom Conservation Banner */}
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
                {lang === 'ne' ? '💡 शक्ति संरक्षण:' : '💡 Conservation Law:'}
              </span>
              <span style={{ color: '#64748b', fontSize: '11px' }}>
                {lang === 'ne'
                  ? 'शक्ति नष्ट वा सिर्जना हुँदैन, केवल रूपान्तरण हुन्छ।'
                  : 'Energy cannot be created or destroyed, only transformed.'}
              </span>
            </div>

            <button
              onClick={() => {
                setPowerActive(!powerActive);
                ScienceAudio.playClick();
              }}
              style={{
                background: powerActive ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(239, 68, 68, 0.2)',
                border: powerActive ? 'none' : '1px solid #ef4444',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                boxShadow: powerActive ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
              }}
            >
              {powerActive ? (lang === 'ne' ? '⚡ चालु (Power ON)' : '⚡ Power ON') : (lang === 'ne' ? 'बन्द (Power OFF)' : 'Power OFF')}
            </button>
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
              <span>{lang === 'ne' ? 'शक्ति रूपान्तरण प्रयोगशाला' : 'Energy Transformation Hub'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'शक्तिको स्रोत र उपकरण जोडेर शक्ति कसरी एक रूपबाट अर्कोमा बदलिन्छ हेर्नुहोस्।'
                : 'Connect primary energy generators to household receivers to trace transformation chains.'}
            </p>
          </div>

          {/* Energy Sources Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '1. शक्तिको स्रोत छान्नुहोस् (Source)' : '1. Select Energy Source'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { id: 'sun', nameEn: 'Solar Cell', nameNe: 'सौर्य सेल' },
                { id: 'hydro', nameEn: 'Hydro Dam', nameNe: 'जलविद्युत' },
                { id: 'battery', nameEn: 'Battery', nameNe: 'ब्याट्री' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSource(s.id as EnergySource)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: source === s.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                    background: source === s.id ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: source === s.id ? '#fbbf24' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'ne' ? s.nameNe : s.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Energy Output Devices Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '2. उपयोग गर्ने उपकरण (Output Device)' : '2. Select Output Device'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { id: 'bulb', nameEn: 'Electric Bulb', nameNe: 'बत्ती' },
                { id: 'motor_fan', nameEn: 'Motor Fan', nameNe: 'पङ्खा' },
                { id: 'buzzer', nameEn: 'Sound Buzzer', nameNe: 'बजर' },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => handleSelectOutput(o.id as EnergyOutput)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: output === o.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: output === o.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: output === o.id ? '#38bdf8' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'ne' ? o.nameNe : o.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Live Transformation Chain Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '🔄 शक्ति रूपान्तरण प्रक्रिया:' : '🔄 Transformation Pipeline:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 700 }}>
                  {lang === 'ne' ? '1. इनपुट' : '1. Input'}
                </span>
                <span style={{ color: '#0f172a' }}>
                  {source === 'sun' && (lang === 'ne' ? 'सूर्यको प्रकाश (Light Energy)' : 'Solar Light Photons')}
                  {source === 'hydro' && (lang === 'ne' ? 'बाँधको पानी (Potential Energy)' : 'High Reservoir Water (PE)')}
                  {source === 'battery' && (lang === 'ne' ? 'इलेक्ट्रोलाइट्स (Chemical Energy)' : 'Chemical Redox Potential')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 700 }}>
                  {lang === 'ne' ? '2. प्रसारण' : '2. Channel'}
                </span>
                <span style={{ color: '#475569' }}>
                  {lang === 'ne' ? 'विद्युत करेन्ट (Electrical Energy)' : 'Flowing Electrons (Electrical)'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 700 }}>
                  {lang === 'ne' ? '3. आउटपुट' : '3. Final'}
                </span>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>
                  {output === 'bulb' && (lang === 'ne' ? 'उज्यालो र न्यानो (Light & Heat)' : 'Photons & Thermal Glow')}
                  {output === 'motor_fan' && (lang === 'ne' ? 'घूर्णन गति (Kinetic Motion)' : 'Rotational Kinetic Motion')}
                  {output === 'buzzer' && (lang === 'ne' ? 'आवाज (Sound Wave Oscillations)' : 'Acoustic Sound Waves')}
                </span>
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
              ? 'शक्तिलाई न त उत्पन्न गर्न सकिन्छ, न त नष्ट गर्न सकिन्छ; यसलाई केवल एक रूपबाट अर्को रूपमा रूपान्तरण गर्न सकिन्छ।'
              : 'Energy can neither be created nor destroyed; it can only be transformed from one form to another.'}
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
              <span>{lang === 'ne' ? '✓ शक्ति रूपान्तरण प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Energy Transformation Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default EnergyTransformationLabSim;
