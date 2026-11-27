/**
 * ThermalExpansionSim.tsx
 * Simulation 22: 2D Thermal Expansion Laboratory (ताप र वस्तुको प्रसार)
 * Grade 6 Science • Unit 7: Energy in Daily Life (दैनिक जीवनमा शक्ति)
 *
 * 100% Native HTML5 Canvas 2D Interactive Thermodynamics Laboratory.
 * Features:
 * 1. Gravesande's Ring & Ball Experiment:
 *    - Cold brass sphere easily passes through the ring.
 *    - Heated sphere expands in volume (ΔV) and gets stuck on top of the ring!
 *    - Quenching with cold water causes contraction, allowing it to drop through once more.
 * 2. Bimetallic Strip Fire Alarm:
 *    - Differential expansion between Brass (high α) and Iron (low α) bends strip to complete an electric bell alarm circuit.
 * 3. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Flame, Droplets, Sparkles, RotateCcw, AlertCircle, CheckCircle2, Award, Bell } from 'lucide-react';

type ExpMode = 'ring_and_ball' | 'bimetallic_strip';

export const ThermalExpansionSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Experiment State
  const [expMode, setExpMode] = useState<ExpMode>('ring_and_ball');
  const [temperatureC, setTemperatureC] = useState<number>(25); // 25°C to 300°C
  const [isHeating, setIsHeating] = useState<boolean>(false);
  const [isTestingDrop, setIsTestingDrop] = useState<boolean>(false);

  // Derived Ball Expansion: Base radius 28px, Ring opening 30px
  // When T reaches 250°C, radius expands to 33px -> STUCK!
  const thermalExpansionDelta = ((temperatureC - 25) / 275) * 5;
  const currentBallRadius = 28 + thermalExpansionDelta;
  const isTooLargeForRing = currentBallRadius > 30;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setTemperatureC(25);
    setIsHeating(false);
    setIsTestingDrop(false);
    setStars(0);
    setIsCompleted(false);
  };

  const handleCoolDown = () => {
    ScienceAudio.playDing();
    setTemperatureC(25);
    setIsHeating(false);
  };

  // 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Dynamic heating simulation
      if (isHeating && temperatureC < 300) {
        setTemperatureC((prev) => Math.min(300, prev + 1.2));
      }

      const width = canvas.width;
      const height = canvas.height;
      const time = Date.now() / 250;

      // Dark Laboratory Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Laboratory Bench Countertop
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 400, width, height - 400);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 400);
      ctx.lineTo(width, 400);
      ctx.stroke();

      // ==========================================
      // EXPERIMENT 1: GRAVESANDE'S RING AND BALL
      // ==========================================
      if (expMode === 'ring_and_ball') {
        const standX = 320;
        const ringY = 240;

        // Stand Base & Vertical Column
        ctx.fillStyle = '#334155';
        ctx.fillRect(standX - 50, 385, 100, 15);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(standX - 6, 80, 12, 310);

        // Horizontal Iron Ring Bracket
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(standX - 6, ringY - 6, 120, 12);

        // Circular Ring (Opening radius = 30px)
        const ringCenterX = standX + 114;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.ellipse(ringCenterX, ringY, 32, 12, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Bunsen Burner heating ball
        const burnerX = ringCenterX;
        const burnerY = 360;
        ctx.fillStyle = '#475569';
        ctx.fillRect(burnerX - 20, burnerY + 20, 40, 20);
        ctx.fillRect(burnerX - 6, burnerY - 30, 12, 50);

        if (isHeating) {
          const flameH = 40 + Math.sin(time * 3) * 6;
          const flameGrad = ctx.createRadialGradient(burnerX, burnerY - 30, 2, burnerX, burnerY - 30, flameH);
          flameGrad.addColorStop(0, '#ffffff');
          flameGrad.addColorStop(0.3, '#38bdf8');
          flameGrad.addColorStop(0.7, '#f59e0b');
          flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.arc(burnerX, burnerY - 30, flameH, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hanging Brass Ball on Chain
        // If testing drop:
        // - If cold: passes right through to ringY + 80
        // - If hot (expanded): gets stuck exactly at ringY - currentBallRadius + 4
        let ballY = ringY - 80;
        if (isTestingDrop) {
          ballY = isTooLargeForRing ? ringY - currentBallRadius + 6 : ringY + 80;
        }

        // Hanging Chain
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ringCenterX, 60);
        ctx.lineTo(ringCenterX, ballY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Brass Sphere
        ctx.save();
        ctx.translate(ringCenterX, ballY);

        // Thermal Glowing Shader when hot
        const ballGrad = ctx.createRadialGradient(
          -currentBallRadius * 0.3,
          -currentBallRadius * 0.3,
          2,
          0,
          0,
          currentBallRadius
        );
        if (temperatureC > 150) {
          ballGrad.addColorStop(0, '#fef08a');
          ballGrad.addColorStop(0.4, '#f97316');
          ballGrad.addColorStop(1, '#dc2626'); // Glowing hot red
        } else {
          ballGrad.addColorStop(0, '#fde047');
          ballGrad.addColorStop(0.6, '#ca8a04');
          ballGrad.addColorStop(1, '#854d0e'); // Normal polished brass
        }

        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(0, 0, currentBallRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = temperatureC > 150 ? '#991b1b' : '#713f12';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // ── STATUS READOUT CARD ──
        const cardX = 580;
        const cardY = 100;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, 260, 240, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(lang === 'ne' ? '🔬 रिङ र गोलाको नतिजा:' : '🔬 Ring & Ball Observations:', cardX + 16, cardY + 28);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(
          lang === 'ne' ? `तापक्रम (Temp): ${Math.round(temperatureC)}°C` : `Temperature: ${Math.round(temperatureC)}°C`,
          cardX + 16,
          cardY + 65
        );

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(
          lang === 'ne'
            ? `गोलाको व्यास: ${(currentBallRadius * 2).toFixed(1)} mm`
            : `Ball Diameter: ${(currentBallRadius * 2).toFixed(1)} mm`,
          cardX + 16,
          cardY + 95
        );

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(
          lang === 'ne' ? 'रिङको भित्री व्यास: 60.0 mm' : 'Ring Inner Hole: 60.0 mm',
          cardX + 16,
          cardY + 120
        );

        // Result Badge
        ctx.fillStyle = isTooLargeForRing ? '#ef4444' : '#10b981';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(
          isTooLargeForRing
            ? lang === 'ne'
              ? '❌ फैलिएको गोला रिङमा अड्कियो!'
              : '❌ Expanded Ball Stuck in Ring!'
            : lang === 'ne'
            ? '✓ चिसो गोला रिङबाट सजिलै छिर्छ।'
            : '✓ Ball Passes Easily Through Ring.',
          cardX + 16,
          cardY + 165
        );

        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';
        ctx.fillText(
          lang === 'ne' ? 'नियम: तापले ठोस वस्तुको आयतन बढाउँछ।' : 'Principle: Heat expands volume of solids (ΔV).',
          cardX + 16,
          cardY + 205
        );
      }

      // ==========================================
      // EXPERIMENT 2: BIMETALLIC STRIP FIRE ALARM
      // ==========================================
      if (expMode === 'bimetallic_strip') {
        const stripStartX = 200;
        const stripY = 240;
        const stripLength = 280;

        // Strip curvature bends upwards as temperature rises (Brass on bottom expands more than Iron on top)
        const bendAmountPix = ((temperatureC - 25) / 275) * 45;

        // Fixed Support Clamp at Left
        ctx.fillStyle = '#475569';
        ctx.fillRect(stripStartX - 30, stripY - 30, 30, 60);

        // Layer 1: Iron (फलाम, Low expansion, Silver Top)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(stripStartX, stripY - 3);
        ctx.quadraticCurveTo(stripStartX + stripLength / 2, stripY - 3 - bendAmountPix, stripStartX + stripLength, stripY - 3 - bendAmountPix * 1.5);
        ctx.stroke();

        // Layer 2: Brass (तामा/पित्तल, High expansion, Gold Bottom)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(stripStartX, stripY + 3);
        ctx.quadraticCurveTo(stripStartX + stripLength / 2, stripY + 3 - bendAmountPix, stripStartX + stripLength, stripY + 3 - bendAmountPix * 1.5);
        ctx.stroke();

        // Electrical Contact Screw at Top Right (Trigger Point)
        const contactX = stripStartX + stripLength;
        const contactY = stripY - 50;

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(contactX, contactY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Circuit Complete Check
        const stripTipY = stripY - 3 - bendAmountPix * 1.5;
        const circuitClosed = stripTipY <= contactY + 8;

        // Electric Alarm Bell (Top Center)
        const bellX = 640;
        const bellY = 160;
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bellX, bellY, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (circuitClosed) {
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔔 FIRE ALARM RINGING! 🔔', bellX, bellY - 50);
          if (stage === 'challenge' && stars < 3) setStars(3);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Circuit Open (Normal)', bellX, bellY - 50);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [expMode, temperatureC, isHeating, isTestingDrop, isTooLargeForRing, currentBallRadius, stage, stars, lang]);

  return (
    <SimulationLayout
      title="Thermal Expansion Laboratory (Ring & Ball, Bimetallic Strip)"
      titleNepali="ताप र वस्तुको प्रसार प्रयोगशाला (रिङ र गोला, द्वि-धातु पत्ती)"
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
      currentPromptEn="Heat the brass ball to see it expand and get stuck in the ring, or bend the bimetallic strip to trigger a fire alarm."
      currentPromptNe="गोलालाई तताएर रिङमा अड्काउनुहोस् वा द्वि-धातु पत्ती तताएर अग्नि सूचक घण्टी बजाउनुहोस्।"
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

          {/* Floating Top Temperature Badge */}
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
            <Flame style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
            <span>
              {lang === 'ne'
                ? `तापक्रम: ${temperatureC.toFixed(0)}°C | ${isHeating ? 'तताइँदैछ (Heating)' : 'स्थिर'}`
                : `Temperature: ${temperatureC.toFixed(0)}°C | ${isHeating ? 'Heating Active' : 'Stable'}`}
            </span>
          </div>

          {/* Floating Bottom Status Dock */}
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
                {expMode === 'ring_and_ball' ? (lang === 'ne' ? 'प्रसार स्थिति:' : 'Expansion State:') : (lang === 'ne' ? 'अलार्म स्थिति:' : 'Alarm Status:')}
              </span>
              <span style={{ color: isTooLargeForRing ? '#f87171' : '#34d399', fontWeight: 600 }}>
                {expMode === 'ring_and_ball'
                  ? isTooLargeForRing
                    ? (lang === 'ne' ? '⚠️ धातुको गोला फैलियो - रिङमा अड्कियो!' : '⚠️ Brass ball expanded - Stuck in ring!')
                    : (lang === 'ne' ? '✓ चिसो गोला - सजिलै रिङबाट छिर्छ।' : '✓ Cold ball passes freely through ring.')
                  : temperatureC >= 110
                  ? (lang === 'ne' ? '🔔 द्वि-धातु पत्ती बाङ्गिएर सर्किट जोडियो - घण्टी बज्यो!' : '🔔 Bimetallic strip curved - Fire alarm ringing!')
                  : (lang === 'ne' ? 'सर्किट खुला छ - अलार्म मौन छ।' : 'Normal temperature - Circuit open.')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleCoolDown}
                style={{
                  background: 'rgba(14, 165, 233, 0.2)',
                  border: '1px solid #0ea5e9',
                  color: '#38bdf8',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Droplets style={{ width: '13px', height: '13px' }} />
                <span>{lang === 'ne' ? 'चिसो पार्नुहोस्' : 'Cool Down'}</span>
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
              <span>{lang === 'ne' ? 'वस्तुको ताप प्रसार केन्द्र' : 'Thermal Expansion Hub'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'तापले धातु कसरी फैलिन्छ (Expansion) र चिसो हुँदा खुम्चिन्छ (Contraction) जाँच्नुहोस्।'
                : "Explore Gravesande's ring & ball expansion and differential bending in bimetallic fire alarms."}
            </p>
          </div>

          {/* Mode Selector Buttons */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '१. प्रयोग छान्नुहोस् (Experiment Mode)' : '1. Select Experiment'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'ring_and_ball', nameEn: "1. Gravesande's Ring & Ball", nameNe: '१. रिङ र गोलाको प्रयोग' },
                { id: 'bimetallic_strip', nameEn: '2. Bimetallic Strip Alarm', nameNe: '२. द्वि-धातु पत्ती (फायर अलार्म)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setExpMode(m.id as ExpMode);
                    handleReset();
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: expMode === m.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                    background: expMode === m.id ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: expMode === m.id ? '#fbbf24' : '#cbd5e1',
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

          {/* Heating & Cooling Action Cards */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
              {lang === 'ne' ? '२. तापक्रम नियन्त्रक (Thermal Modulation)' : '2. Thermal Modulation'}
            </div>
            <button
              onClick={() => {
                setIsHeating(!isHeating);
                ScienceAudio.playClick();
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: isHeating ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isHeating ? '0 2px 10px rgba(239, 68, 68, 0.4)' : '0 2px 8px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Flame style={{ width: '15px', height: '15px' }} />
              <span>{isHeating ? (lang === 'ne' ? 'बर्नर बन्द गर्नुहोस् (Flame OFF)' : 'Flame OFF') : (lang === 'ne' ? 'बर्नर बाल्नुहोस् (Heat ON)' : 'Apply Heat (Bunsen Burner)')}</span>
            </button>

            {expMode === 'ring_and_ball' && (
              <button
                onClick={() => {
                  setIsTestingDrop(!isTestingDrop);
                  ScienceAudio.playDing();
                }}
                style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {isTestingDrop
                  ? (lang === 'ne' ? 'माथि तान्नुहोस् (Pull Up Ball)' : 'Pull Up Ball')
                  : (lang === 'ne' ? 'रिङबाट छिराउनुहोस् (Test Drop)' : 'Test Drop Through Ring')}
              </button>
            )}
          </div>

          {/* Thermal Telemetry Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '📊 ताप प्रसार तथ्याङ्क:' : '📊 Thermal Expansion Metrics:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'तापक्रम (T):' : 'Temperature (T):'}</span>
                <span style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{temperatureC.toFixed(0)} °C</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'गोलाको अर्धव्यास (Radius):' : 'Ball Radius:'}</span>
                <span style={{ fontWeight: 700, color: isTooLargeForRing ? '#f87171' : '#34d399', fontFamily: 'monospace' }}>
                  {currentBallRadius.toFixed(2)} px
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'रिङको भित्री प्वाल:' : 'Ring Inner Hole:'}</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>41.00 px</span>
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
              ? 'वस्तुलाई तताउँदा त्यसका अणुहरूको कम्पन बढेर आयतन फैलिन्छ (Expansion), र चिसो पार्दा खुम्चिन्छ। द्वि-धातु पत्तीमा तामा फलामभन्दा छिटो फैलिने हुनाले बाङ्गिन्छ।'
              : 'Solids expand upon heating and contract upon cooling. In bimetallic strips, brass expands more than iron, curving to close alarm circuits.'}
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
              <span>{lang === 'ne' ? '✓ ताप प्रसार प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Thermal Expansion Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default ThermalExpansionSim;
