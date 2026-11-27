/**
 * ForceMotionPlaygroundSim.tsx
 * Simulation 14: 2D Force & Motion Playground
 * Grade 6 Science • Unit 6: Force and Motion
 *
 * 100% Native HTML5 Canvas 2D Interactive Vector Mechanics.
 * Features:
 * 1. Push, Pull, Friction, Gravity, and Normal Force vectors drawn live on body
 * 2. Balanced vs Unbalanced Forces (F_net = F_applied - f_friction)
 * 3. Real-time Acceleration (a = F_net / m) and Velocity Tracking (v = v0 + at)
 * 4. Surface friction modulators: Slick Ice (μ = 0.08), Polished Wood (μ = 0.28), Rough Carpet (μ = 0.65)
 * 5. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { ArrowRight, MoveHorizontal, RotateCcw, Sparkles, Gauge, ShieldAlert, Award } from 'lucide-react';

type SurfaceType = 'ice' | 'wood' | 'carpet';

export const ForceMotionPlaygroundSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Physics Parameters
  const [appliedForce, setAppliedForce] = useState<number>(45); // -100 to +100 N
  const [mass, setMass] = useState<number>(10); // 5 to 50 kg
  const [surface, setSurface] = useState<SurfaceType>('wood');
  const [showVectors, setShowVectors] = useState<boolean>(true);

  // Surface friction coefficients
  const muMap: Record<SurfaceType, number> = {
    ice: 0.08,
    wood: 0.28,
    carpet: 0.65,
  };
  const mu = muMap[surface];

  // Calculated normal force and friction
  const gravity = 9.8;
  const normalForce = Math.round(mass * gravity);
  const maxFriction = Math.round(normalForce * mu);
  const frictionForce = Math.min(Math.abs(appliedForce), maxFriction);
  const frictionSigned = appliedForce > 0 ? -frictionForce : appliedForce < 0 ? frictionForce : 0;
  const netForce =
    Math.abs(appliedForce) > maxFriction
      ? appliedForce > 0
        ? appliedForce - maxFriction
        : appliedForce + maxFriction
      : 0;
  const acceleration = parseFloat((netForce / mass).toFixed(2));

  // Canvas & Simulation Kinematics
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const posRef = useRef<number>(440); // Initial center x position
  const velRef = useRef<number>(0);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setAppliedForce(45);
    setMass(10);
    setSurface('wood');
    posRef.current = 440;
    velRef.current = 0;
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

      // Physics Integration (dt = 1/60s)
      const dt = 1 / 60;
      velRef.current += acceleration * dt * 4; // scaled for visual responsiveness
      if (Math.abs(netForce) === 0 && Math.abs(velRef.current) > 0.01) {
        // Dynamic deceleration when force removed
        const decel = (maxFriction / mass) * dt * 4;
        if (velRef.current > 0) velRef.current = Math.max(0, velRef.current - decel);
        else velRef.current = Math.min(0, velRef.current + decel);
      }
      posRef.current += velRef.current;

      // Wrap around track edges
      if (posRef.current > width + 60) posRef.current = -60;
      if (posRef.current < -60) posRef.current = width + 60;

      // Background Canvas
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, width, height);

      // Studio Ceiling Lighting Gradients
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 320);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#090e17');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, 320);

      // ── RUNWAY TRACK & SURFACE ──
      const trackY = 320;
      let surfColor1 = '#78350f';
      let surfColor2 = '#451a03';
      let surfTexture = 'WOOD';

      if (surface === 'ice') {
        surfColor1 = '#38bdf8';
        surfColor2 = '#0284c7';
        surfTexture = 'SLICK ICE (μ = 0.08)';
      } else if (surface === 'carpet') {
        surfColor1 = '#9333ea';
        surfColor2 = '#6b21a8';
        surfTexture = 'ROUGH CARPET (μ = 0.65)';
      } else {
        surfColor1 = '#d97706';
        surfColor2 = '#92400e';
        surfTexture = 'POLISHED WOOD (μ = 0.28)';
      }

      // Track Surface Block
      const trackGrad = ctx.createLinearGradient(0, trackY, 0, height);
      trackGrad.addColorStop(0, surfColor1);
      trackGrad.addColorStop(0.2, surfColor2);
      trackGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = trackGrad;
      ctx.fillRect(0, trackY, width, height - trackY);

      // Track Rulers & Distance Markers
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      for (let m = 0; m <= width; m += 40) {
        ctx.beginPath();
        ctx.moveTo(m, trackY);
        ctx.lineTo(m, trackY + (m % 200 === 0 ? 18 : 8));
        ctx.stroke();
        if (m % 200 === 0) {
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${(m / 40 - 11).toFixed(0)}m`, m, trackY + 30);
        }
      }

      // ── HEAVY WOODEN CRATE ──
      const cx = posRef.current;
      const crateSize = 70 + (mass - 5) * 1.2; // Box scales slightly with mass
      const cy = trackY - crateSize / 2;

      ctx.save();
      ctx.translate(cx, cy);

      // Crate Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, crateSize / 2 + 2, crateSize / 2 + 8, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crate Body
      const crateGrad = ctx.createLinearGradient(-crateSize / 2, -crateSize / 2, crateSize / 2, crateSize / 2);
      crateGrad.addColorStop(0, '#f59e0b');
      crateGrad.addColorStop(0.5, '#d97706');
      crateGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = crateGrad;
      ctx.beginPath();
      ctx.roundRect(-crateSize / 2, -crateSize / 2, crateSize, crateSize, 6);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Crate Cross Bracing
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-crateSize / 2 + 4, -crateSize / 2 + 4);
      ctx.lineTo(crateSize / 2 - 4, crateSize / 2 - 4);
      ctx.moveTo(crateSize / 2 - 4, -crateSize / 2 + 4);
      ctx.lineTo(-crateSize / 2 + 4, crateSize / 2 - 4);
      ctx.stroke();

      // Mass Label on Crate
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${mass} kg`, 0, 0);

      // ── LIVE FORCE VECTORS ──
      if (showVectors) {
        // 1. Applied Force Vector (Green / Emerald)
        if (Math.abs(appliedForce) > 0) {
          const arrowLen = (appliedForce / 100) * 120;
          ctx.strokeStyle = '#10b981';
          ctx.fillStyle = '#10b981';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(arrowLen, 0);
          ctx.stroke();

          // Arrowhead
          const headDir = appliedForce > 0 ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(arrowLen, 0);
          ctx.lineTo(arrowLen - headDir * 12, -7);
          ctx.lineTo(arrowLen - headDir * 12, 7);
          ctx.closePath();
          ctx.fill();

          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(`F_app = ${appliedForce} N`, arrowLen + headDir * 16, -10);
        }

        // 2. Friction Force Vector (Amber / Orange)
        if (Math.abs(frictionSigned) > 0) {
          const arrowLen = (frictionSigned / 100) * 120;
          ctx.strokeStyle = '#f97316';
          ctx.fillStyle = '#f97316';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, crateSize / 2);
          ctx.lineTo(arrowLen, crateSize / 2);
          ctx.stroke();

          const headDir = frictionSigned > 0 ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(arrowLen, crateSize / 2);
          ctx.lineTo(arrowLen - headDir * 10, crateSize / 2 - 6);
          ctx.lineTo(arrowLen - headDir * 10, crateSize / 2 + 6);
          ctx.closePath();
          ctx.fill();

          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(`f = ${frictionForce} N`, arrowLen + headDir * 16, crateSize / 2 + 16);
        }

        // 3. Gravity Vector (Downwards, Red)
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 75);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 75);
        ctx.lineTo(-6, 65);
        ctx.lineTo(6, 65);
        ctx.closePath();
        ctx.fill();
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`W = mg (${normalForce} N)`, 0, 92);

        // 4. Normal Force Vector (Upwards, Cyan)
        ctx.strokeStyle = '#06b6d4';
        ctx.fillStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -crateSize / 2);
        ctx.lineTo(0, -crateSize / 2 - 75);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -crateSize / 2 - 75);
        ctx.lineTo(-6, -crateSize / 2 - 65);
        ctx.lineTo(6, -crateSize / 2 - 65);
        ctx.closePath();
        ctx.fill();
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`N = ${normalForce} N`, 0, -crateSize / 2 - 82);
      }

      ctx.restore();

      // ── HUD METRICS DISPLAY (TOP LEFT & RIGHT) ──
      // Top Left: Net Force & Acceleration
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(24, 20, 260, 105, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = netForce !== 0 ? '#38bdf8' : '#94a3b8';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        lang === 'ne'
          ? `परिणामी बल (F_net): ${netForce} N`
          : `Net Force (F_net): ${netForce} N`,
        38,
        48
      );

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(
        lang === 'ne'
          ? `प्रवेग (Acceleration, a): ${acceleration} m/s²`
          : `Acceleration (a): ${acceleration} m/s²`,
        38,
        76
      );

      ctx.fillStyle = netForce !== 0 ? '#ef4444' : '#10b981';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(
        netForce !== 0
          ? lang === 'ne'
            ? '⚠️ असन्तुलित बल (Unbalanced Force) ➔ गति परिवर्तन'
            : '⚠️ Unbalanced Force ➔ Motion Change'
          : lang === 'ne'
          ? '✓ सन्तुलित बल (Balanced Force) ➔ स्थिर अवस्था'
          : '✓ Balanced Force ➔ Constant State',
        38,
        104
      );

      // Top Right: Surface Friction Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(width - 244, 20, 220, 70, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(lang === 'ne' ? 'सतह तथा घर्षण गुणाङ्क:' : 'Surface & Friction:', width - 230, 42);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(surfTexture, width - 230, 68);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [appliedForce, mass, surface, showVectors, acceleration, netForce, frictionForce, frictionSigned, normalForce, lang]);

  return (
    <SimulationLayout
      title="Force, Friction and Motion Playground"
      titleNepali="बल, घर्षण र गति प्रयोगशाला"
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
      currentPromptEn="Apply push or pull forces to overcome friction and observe how mass affects acceleration (F = ma)."
      currentPromptNe="घर्षण बललाई जित्न धकेल्ने वा तान्ने बल लगाउनुहोस् र पिण्डले प्रवेगमा पार्ने असर हेर्नुहोस्।"
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

          {/* Floating Top Status Badge */}
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
            <Gauge style={{ width: '14px', height: '14px' }} />
            <span>
              {lang === 'ne'
                ? `सतह: ${surface.toUpperCase()} | कुल बल: ${netForce.toFixed(1)} N | प्रवेग: ${acceleration.toFixed(2)} m/s²`
                : `Surface: ${surface.toUpperCase()} | Net Force: ${netForce.toFixed(1)} N | Accel: ${acceleration.toFixed(2)} m/s²`}
            </span>
          </div>

          {/* Floating Bottom Quick Formula Bar */}
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
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Newton's Second Law:</span>
              <span style={{ fontFamily: 'monospace', color: '#4ade80' }}>F_net = m × a</span>
              <span style={{ color: '#64748b' }}>➔</span>
              <span style={{ fontFamily: 'monospace', color: '#facc15' }}>a = {netForce.toFixed(1)} N / {mass} kg = {acceleration.toFixed(2)} m/s²</span>
            </div>
            <button
              onClick={() => {
                setShowVectors(!showVectors);
                ScienceAudio.playClick();
              }}
              style={{
                background: showVectors ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: showVectors ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                color: showVectors ? '#38bdf8' : '#94a3b8',
                borderRadius: '8px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {lang === 'ne' ? 'तीर (Vectors)' : 'Force Vectors'}
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
              <span>{lang === 'ne' ? 'बल तथा गति नियन्त्रण केन्द्र' : 'Dynamics Discovery Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'वस्तुमा बल लगाउनुहोस्, घर्षण बल र पिण्ड परिवर्तन गरी प्रवेग नाप्नुहोस्।'
                : 'Modulate applied forces, change contact surfaces, and observe acceleration in real time.'}
            </p>
          </div>

          {/* Surface Material Selection */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '1. सतह चयन (Surface Friction)' : '1. Track Surface'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {(['ice', 'wood', 'carpet'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSurface(s);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: surface === s ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: surface === s ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: surface === s ? '#38bdf8' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Applied Force Slider */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowRight style={{ width: '13px', height: '13px' }} />
                {lang === 'ne' ? 'लागू गरिएको बल (Force):' : 'Applied Force (F):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {appliedForce > 0 ? `+${appliedForce} N` : `${appliedForce} N`}
              </span>
            </div>
            <input
              type="range"
              min={-100}
              max={100}
              value={appliedForce}
              onChange={(e) => setAppliedForce(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>-100 N (Pull)</span>
              <span>0 N</span>
              <span>+100 N (Push)</span>
            </div>
          </div>

          {/* Object Mass Slider */}
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
                <Gauge style={{ width: '13px', height: '13px' }} />
                {lang === 'ne' ? 'वस्तुको पिण्ड (Mass):' : 'Object Mass (m):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {mass} kg
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
          </div>

          {/* Realtime Telemetry Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '8px 10px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#64748b' }}>{lang === 'ne' ? 'घर्षण बल' : 'Friction Force'}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', fontFamily: 'monospace' }}>
                {frictionForce.toFixed(1)} N
              </div>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '8px 10px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#64748b' }}>{lang === 'ne' ? 'कुल प्रवेग (a)' : 'Acceleration (a)'}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                {acceleration.toFixed(2)} m/s²
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
              ? 'असंतुलित बल (Unbalanced Force) ले मात्र वस्तुमा प्रवेग उत्पन्न गराउँछ। पिण्ड जति बढी हुन्छ, प्रवेग उति नै कम हुन्छ।'
              : 'An unbalanced net force produces acceleration directly proportional to force and inversely to mass (F = ma).'}
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
              <span>{lang === 'ne' ? '✓ बल र गति प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Force & Motion Lab & Quiz'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default ForceMotionPlaygroundSim;
