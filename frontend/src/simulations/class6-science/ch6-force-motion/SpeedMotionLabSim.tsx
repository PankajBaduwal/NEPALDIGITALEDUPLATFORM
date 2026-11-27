/**
 * SpeedMotionLabSim.tsx
 * Simulation 16: 2D Speed and Motion Laboratory (चाल र गति प्रयोगशाला)
 * Grade 6 Science • Unit 6: Force and Motion (बल र गति)
 *
 * 100% Native HTML5 Canvas 2D Interactive Kinematics Laboratory.
 * Features:
 * 1. Speed Formula: v = d / t (चाल = दूरी / समय) with SI unit (m/s) and km/h conversions
 * 2. 2D Race Track with selectable vehicles: Bicycle (5 m/s), Motorbike (15 m/s), Electric Car (25 m/s)
 * 3. Digital Stopwatch, Dynamic Speedometer Gauge, and live Distance-Time (d-t) Graph Plotter
 * 4. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Gauge, Timer, Play, RotateCcw, Sparkles, TrendingUp, Award, Bike, Car } from 'lucide-react';

type VehicleType = 'bicycle' | 'motorbike' | 'car';

export const SpeedMotionLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Kinematic Parameters
  const [vehicle, setVehicle] = useState<VehicleType>('motorbike');
  const [distanceMeters, setDistanceMeters] = useState<number>(200); // 100 to 500m
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [raceFinished, setRaceFinished] = useState<boolean>(false);

  // Vehicle Speeds in m/s
  const speedMap: Record<VehicleType, { speedMs: number; nameEn: string; nameNe: string; color: string }> = {
    bicycle: { speedMs: 5, nameEn: 'Bicycle (साइकल)', nameNe: 'साइकल', color: '#10b981' },
    motorbike: { speedMs: 15, nameEn: 'Motorbike (मोटरसाइकल)', nameNe: 'मोटरसाइकल', color: '#f59e0b' },
    car: { speedMs: 25, nameEn: 'Electric Car (कार)', nameNe: 'विद्युतीय कार', color: '#38bdf8' },
  };

  const currentVeh = speedMap[vehicle];
  const speedMs = currentVeh.speedMs;
  const speedKmh = Math.round(speedMs * 3.6);
  const totalTimeSeconds = parseFloat((distanceMeters / speedMs).toFixed(2));

  // Canvas & Timer Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elapsedRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const handleStartRace = () => {
    ScienceAudio.playDing();
    elapsedRef.current = 0;
    setIsRacing(true);
    setRaceFinished(false);
  };

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setIsRacing(false);
    setRaceFinished(false);
    elapsedRef.current = 0;
    setStars(0);
    setIsCompleted(false);
  };

  // 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let animId: number;

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isRacing && !raceFinished) {
        elapsedRef.current += dt;
        if (elapsedRef.current >= totalTimeSeconds) {
          elapsedRef.current = totalTimeSeconds;
          setRaceFinished(true);
          setIsRacing(false);
          ScienceAudio.playCheer();
          if (stage === 'challenge' && stars < 3) setStars(3);
        }
      }

      const elapsed = elapsedRef.current;
      const currentDist = Math.min(distanceMeters, elapsed * speedMs);
      const progress = currentDist / distanceMeters;

      const width = canvas.width;
      const height = canvas.height;

      // Clean Studio Track Lighting
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Studio Lighting
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 260);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, 260);

      // ── RACE RUNWAY TRACK ──
      const trackY = 240;
      const trackH = 100;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, trackY, width, trackH);

      // Red-White Alternating Kerbs
      for (let k = 0; k < width; k += 24) {
        ctx.fillStyle = k % 48 === 0 ? '#ef4444' : '#ffffff';
        ctx.fillRect(k, trackY - 6, 24, 6);
        ctx.fillRect(k, trackY + trackH, 24, 6);
      }

      // Track Distance Markers
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      for (let d = 0; d <= 5; d++) {
        const mx = 60 + d * ((width - 160) / 5);
        ctx.beginPath();
        ctx.moveTo(mx, trackY);
        ctx.lineTo(mx, trackY + trackH);
        ctx.stroke();
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round((d / 5) * distanceMeters)}m`, mx, trackY + trackH + 22);
      }

      // Checkered Finish Line Banner
      const finishX = width - 100;
      ctx.fillStyle = '#ffffff';
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 2; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#000000' : '#ffffff';
          ctx.fillRect(finishX + c * 10, trackY + r * 20, 10, 20);
        }
      }
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('FINISH', finishX + 10, trackY - 14);

      // ── ACTIVE VEHICLE SPRITE ──
      const startX = 60;
      const vehX = startX + progress * (finishX - startX);
      const vehY = trackY + 50;

      ctx.save();
      ctx.translate(vehX, vehY);

      // Vehicle Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 20, 36, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      if (vehicle === 'bicycle') {
        // Bicycle Rider
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        // Wheels
        ctx.beginPath();
        ctx.arc(-22, 12, 12, 0, Math.PI * 2);
        ctx.arc(22, 12, 12, 0, Math.PI * 2);
        ctx.stroke();
        // Frame
        ctx.beginPath();
        ctx.moveTo(-22, 12);
        ctx.lineTo(0, 12);
        ctx.lineTo(-8, -8);
        ctx.lineTo(-22, 12);
        ctx.lineTo(0, 12);
        ctx.lineTo(16, -10);
        ctx.lineTo(22, 12);
        ctx.stroke();
        // Rider
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(4, -20, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (vehicle === 'motorbike') {
        // Motorbike
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(-24, -8, 48, 18, 6);
        ctx.fill();
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Wheels
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-20, 14, 12, 0, Math.PI * 2);
        ctx.arc(20, 14, 12, 0, Math.PI * 2);
        ctx.fill();
        // Headlight beam
        ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
        ctx.beginPath();
        ctx.moveTo(24, -4);
        ctx.lineTo(85, -20);
        ctx.lineTo(85, 20);
        ctx.closePath();
        ctx.fill();
      } else {
        // Sports Car
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(-35, -12, 70, 24, [8, 14, 4, 4]);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(-15, -20, 36, 14, [6, 10, 0, 0]);
        ctx.fill();
        // Wheels
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-22, 12, 10, 0, Math.PI * 2);
        ctx.arc(22, 12, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // ── TOP LEFT: DIGITAL STOPWATCH & SPEED GAUGE ──
      const hudX = 30;
      const hudY = 20;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, 280, 190, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? '⏱️ डिजिटल चाल मापक (Kinematics)' : '⏱️ Live Kinematics Dashboard', hudX + 16, hudY + 28);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`${elapsed.toFixed(2)} s`, hudX + 16, hudY + 65);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(lang === 'ne' ? `कुल समय (d/v): ${totalTimeSeconds}s` : `Target Time (d/v): ${totalTimeSeconds}s`, hudX + 140, hudY + 62);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`${speedMs} m/s (${speedKmh} km/h)`, hudX + 16, hudY + 105);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(
        lang === 'ne' ? `पार गरेको दूरी: ${currentDist.toFixed(1)} m` : `Distance: ${currentDist.toFixed(1)} / ${distanceMeters} m`,
        hudX + 16,
        hudY + 140
      );

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText('v = d / t  (1 m/s = 3.6 km/h)', hudX + 16, hudY + 172);

      // ── TOP RIGHT: DISTANCE-TIME (d-t) GRAPH ──
      const gX = width - 320;
      const gY = 20;
      const gW = 290;
      const gH = 190;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(gX, gY, gW, gH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? '📈 दूरी-समय ग्राफ (Slope = Speed)' : '📈 Distance-Time Graph (Slope = v)', gX + 16, gY + 25);

      // Graph Axes
      const originX = gX + 40;
      const originY = gY + gH - 35;
      const plotW = gW - 65;
      const plotH = gH - 65;

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(originX, originY - plotH);
      ctx.lineTo(originX, originY);
      ctx.lineTo(originX + plotW, originY);
      ctx.stroke();

      // Axis Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText('d (m)', originX - 30, originY - plotH + 10);
      ctx.fillText('t (s)', originX + plotW - 10, originY + 16);

      // Theoretical Straight Line Plot (Uniform Speed)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX + plotW, originY - plotH);
      ctx.stroke();

      // Live Traced Line
      const curPlotX = originX + progress * plotW;
      const curPlotY = originY - progress * plotH;
      ctx.strokeStyle = currentVeh.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(curPlotX, curPlotY);
      ctx.stroke();

      // Tracer Dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(curPlotX, curPlotY, 4, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [vehicle, distanceMeters, isRacing, raceFinished, speedMs, totalTimeSeconds, currentVeh, lang]);

  return (
    <SimulationLayout
      title="Speed, Distance and Time Laboratory"
      titleNepali="चाल, दूरी र समय प्रयोगशाला"
      chapterNumber={6}
      chapterTitle="Unit 6: Force and Motion"
      chapterTitleNepali="एकाइ ६: बल र गति"
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
      currentPromptEn="Select a vehicle and track distance, then start the stopwatch to compute speed (v = d / t)."
      currentPromptNe="सवारी साधन र दूरी रोज्नुहोस्, र स्टपवाच सुरु गरी चाल (v = d / t) गणना गर्नुहोस्।"
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

          {/* Floating Top Vehicle & Speed Badge */}
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
              {lang === 'ne' ? speedMap[vehicle].nameNe : currentVeh.nameEn}: {speedMs} m/s ({(speedMs * 3.6).toFixed(0)} km/h) | {distanceMeters} m
            </span>
          </div>

          {/* Floating Bottom Telemetry Dock */}
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
                {lang === 'ne' ? 'स्टपवाच समय (Time):' : 'Stopwatch Time:'}
              </span>
              <span style={{ fontFamily: 'monospace', color: '#4ade80', fontWeight: 700, fontSize: '13px' }}>
                {totalTimeSeconds.toFixed(1)} s
              </span>
              <span style={{ color: '#64748b' }}>|</span>
              <span style={{ color: raceFinished ? '#4ade80' : isRacing ? '#facc15' : '#94a3b8' }}>
                {raceFinished
                  ? (lang === 'ne' ? '🏁 दौड समाप्त भयो!' : '🏁 Race Finished!')
                  : isRacing
                  ? (lang === 'ne' ? '🚀 गुडिरहेको छ...' : '🚀 Traveling...')
                  : (lang === 'ne' ? 'दौड सुरु गर्न तयार' : 'Ready to Start')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleStartRace}
                disabled={isRacing}
                style={{
                  background: isRacing ? 'rgba(255, 255, 255, 0.08)' : 'linear-gradient(135deg, #10b981, #0d9488)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  cursor: isRacing ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Play style={{ width: '13px', height: '13px' }} />
                <span>{lang === 'ne' ? 'दौड सुरु' : 'Start Race'}</span>
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
              <span>{lang === 'ne' ? 'चाल र गति अनुसन्धान केन्द्र' : 'Kinematics Discovery Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'सवारी साधन र दूरी रोज्नुहोस्, समय नापेर चाल गणना गर्नुहोस् (चाल = दूरी / समय)।'
                : 'Select vehicle, vary track distance, and track time to measure speed (v = d / t).'}
            </p>
          </div>

          {/* Vehicle Selection Grid */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '१. सवारी साधन रोज्नुहोस् (Vehicle)' : '1. Select Vehicle'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {(['bicycle', 'motorbike', 'car'] as const).map((v) => (
                <button
                  key={v}
                  disabled={isRacing}
                  onClick={() => {
                    setVehicle(v);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '8px',
                    border: vehicle === v ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: vehicle === v ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: vehicle === v ? '#38bdf8' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: isRacing ? 'not-allowed' : 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {lang === 'ne' ? speedMap[v].nameNe : v}
                </button>
              ))}
            </div>
          </div>

          {/* Track Distance Slider */}
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
                <Timer style={{ width: '13px', height: '13px' }} />
                {lang === 'ne' ? 'ट्र्याक दूरी (Distance d):' : 'Track Distance (d):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {distanceMeters} m
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={500}
              step={50}
              disabled={isRacing}
              value={distanceMeters}
              onChange={(e) => setDistanceMeters(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: isRacing ? 'not-allowed' : 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>100 m</span>
              <span>300 m</span>
              <span>500 m</span>
            </div>
          </div>

          {/* Speed Calculation Telemetry */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '⚡ चाल गणना (Speed Formula):' : '⚡ Kinematics Equation:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'दूरी (d):' : 'Distance (d):'}</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{distanceMeters} m</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'समय (t):' : 'Time (t):'}</span>
                <span style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{totalTimeSeconds.toFixed(1)} s</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#34d399', fontWeight: 700 }}>{lang === 'ne' ? 'चाल (Speed v = d / t):' : 'Speed (v = d / t):'}</span>
                <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{speedMs} m/s</span>
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
              ? 'एकाइ समयमा पार गरेको दूरीलाई चाल भनिन्छ। चालको SI एकाइ मिटर प्रति सेकेन्ड (m/s) हो। (v = d / t)'
              : 'Speed is distance covered per unit time. The SI unit of speed is meters per second (m/s). (v = d / t)'}
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
              <span>{lang === 'ne' ? '✓ चाल र गति प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Speed & Motion Lab & Quiz'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default SpeedMotionLabSim;
