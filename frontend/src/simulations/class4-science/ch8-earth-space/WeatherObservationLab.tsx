/**
 * WeatherObservationLab.tsx
 * Simulation 33: 2D Weather Observation Laboratory
 * Grade 4 Science • Chapter 8: The Earth and Space
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - 4 Full Interactive Meteorological Instruments:
 *   1. Cup Anemometer: 3 spinning cups with dynamic km/h tachometer
 *   2. Wind Vane: Pivoting directional arrow with 8 compass compass directions
 *   3. Rain Gauge: Graduated cylinder measuring rainfall in mm
 *   4. Standard Thermometer: Mercury tube reading ambient air temp in °C
 * - Real-time animated outdoor weather environment with interactive Wind & Rain sliders
 * - Meteorological Logbook: Record weather observations into a digital notebook
 * - Bilingual EN/NE, audio feedback, and mastery challenge.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Thermometer, CloudRain, Compass, Wind, ClipboardList, Sparkles, Check, RotateCcw } from 'lucide-react';

interface WeatherLogEntry {
  day: string;
  temp: number;
  rain: number;
  windSpeed: number;
  windDir: string;
}

export const WeatherObservationLab: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Environmental Controls
  const [tempCelsius, setTempCelsius] = useState<number>(24); // 0 to 45°C
  const [rainMm, setRainMm] = useState<number>(25); // 0 to 100 mm
  const [windKmh, setWindKmh] = useState<number>(35); // 0 to 100 km/h
  const [windAngleDeg, setWindAngleDeg] = useState<number>(45); // 0 to 360° (45 = NE)

  const [activeTab, setActiveTab] = useState<'station' | 'log'>('station');
  const [logBook, setLogBook] = useState<WeatherLogEntry[]>([
    { day: 'Day 1', temp: 22, rain: 15, windSpeed: 25, windDir: 'NE' },
    { day: 'Day 2', temp: 26, rain: 40, windSpeed: 45, windDir: 'N' },
  ]);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const handleRecordLog = () => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const dirIdx = Math.round((windAngleDeg % 360) / 45) % 8;
    const dir = directions[dirIdx];

    const newEntry: WeatherLogEntry = {
      day: `Day ${logBook.length + 1}`,
      temp: tempCelsius,
      rain: rainMm,
      windSpeed: windKmh,
      windDir: dir,
    };

    setLogBook((prev) => [...prev, newEntry]);
    ScienceAudio.playSuccess();
    setStars(3);
    setIsCompleted(true);
    setStage('understand');
  };

  const handleReset = () => {
    setTempCelsius(24);
    setRainMm(25);
    setWindKmh(35);
    setWindAngleDeg(45);
    setLogBook([
      { day: 'Day 1', temp: 22, rain: 15, windSpeed: 25, windDir: 'NE' },
    ]);
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    setQuizFeedback(null);
    ScienceAudio.playWhoosh();
  };

  // 60 FPS Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let cupAngle = 0;

    const render = () => {
      time += 0.03;
      cupAngle += (windKmh / 100) * 0.25;
      ctx.clearRect(0, 0, 880, 560);

      // 1. OBSERVATORY LAWN BACKGROUND
      drawObservatoryBackground(ctx, rainMm, windKmh, time);

      // 2. CUP ANEMOMETER (Top Left, x: 220, y: 180)
      drawCupAnemometer(ctx, 220, 180, cupAngle, windKmh, lang);

      // 3. WIND VANE (Top Right, x: 640, y: 180)
      drawWindVane(ctx, 640, 180, windAngleDeg, lang);

      // 4. THERMOMETER (Bottom Left, x: 220, y: 400)
      drawStationThermometer(ctx, 220, 390, tempCelsius, lang);

      // 5. RAIN GAUGE (Bottom Right, x: 640, y: 400)
      drawRainGauge(ctx, 640, 390, rainMm, lang);

      // 6. CENTRAL WEATHER SUMMARY BADGE
      drawCentralSummaryBadge(ctx, 440, 280, tempCelsius, rainMm, windKmh, windAngleDeg, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [tempCelsius, rainMm, windKmh, windAngleDeg, lang]);

  // Observatory Lawn Background
  function drawObservatoryBackground(ctx: CanvasRenderingContext2D, rain: number, wind: number, t: number) {
    ctx.save();
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, 420);
    if (rain > 40) {
      sky.addColorStop(0, '#334155'); // Overcast grey storm sky
      sky.addColorStop(1, '#64748b');
    } else {
      sky.addColorStop(0, '#0284c7'); // Clear blue sky
      sky.addColorStop(1, '#bae6fd');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 880, 560);

    // Weather station grass field at bottom
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 460, 880, 100);

    // White picket fence in background
    ctx.fillStyle = '#f8fafc';
    for (let fx = 0; fx < 880; fx += 25) {
      ctx.fillRect(fx, 435, 12, 35);
      // Triangular fence tip
      ctx.beginPath();
      ctx.moveTo(fx, 435);
      ctx.lineTo(fx + 6, 425);
      ctx.lineTo(fx + 12, 435);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillRect(0, 445, 880, 5);

    // Wind streaks blowing across sky
    if (wind > 15) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.8;
      for (let w = 0; w < 6; w++) {
        const wy = 60 + w * 55;
        const wx = ((t * (wind * 1.5) + w * 140) % 980) - 100;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + 80, wy + (Math.sin(w) * 6));
        ctx.stroke();
      }
    }

    // Raindrop streaks if raining
    if (rain > 5) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;
      for (let r = 0; r < 25; r++) {
        const rx = (r * 37 + t * 40) % 880;
        const ry = (r * 29 + t * (rain * 8)) % 480;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 3, ry + 12);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Instrument 1: Cup Anemometer
  function drawCupAnemometer(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    angle: number,
    speed: number,
    currentLang: Language
  ) {
    ctx.save();
    // Instrument Panel Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.roundRect(cx - 130, cy - 80, 260, 160, 12);
    ctx.fill();
    ctx.stroke();

    // Central mounting mast
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 50);
    ctx.lineTo(cx, cy - 10);
    ctx.stroke();

    // 3 Rotating Hemispherical Cups
    ctx.save();
    ctx.translate(cx, cy - 15);
    ctx.rotate(angle);

    for (let c = 0; c < 3; c++) {
      const cAngle = (c / 3) * Math.PI * 2;
      ctx.save();
      ctx.rotate(cAngle);

      // Arm
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(36, 0);
      ctx.stroke();

      // Cup Hemisphere (Red & Silver)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(36, 0, 10, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();

    // Title & Live Speed Readout
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'en' ? 'Anemometer' : 'वायु गति मापक (Anemometer)', cx, cy - 58);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`${Math.round(speed)} km/h`, cx, cy + 68);

    ctx.restore();
  }

  // Instrument 2: Wind Vane
  function drawWindVane(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    deg: number,
    currentLang: Language
  ) {
    ctx.save();
    // Instrument Panel Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.roundRect(cx - 130, cy - 80, 260, 160, 12);
    ctx.fill();
    ctx.stroke();

    // Compass Cross Arms (N, S, E, W)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 35, cy);
    ctx.lineTo(cx + 35, cy);
    ctx.moveTo(cx, cy - 35);
    ctx.lineTo(cx, cy + 35);
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('N', cx, cy - 40);
    ctx.fillText('S', cx, cy + 46);
    ctx.fillText('E', cx + 45, cy + 3);
    ctx.fillText('W', cx - 45, cy + 3);

    // Rotating Direction Arrow Pointer (rad)
    const rad = (deg - 90) * (Math.PI / 180);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rad);

    // Arrow Shaft
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();

    // Arrowhead (Points into wind)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(18, -8);
    ctx.lineTo(18, 8);
    ctx.closePath();
    ctx.fill();

    // Feather Tail
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-35, -12, 10, 24);
    ctx.restore();

    // Title & Direction Name
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const dirIdx = Math.round((deg % 360) / 45) % 8;

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'en' ? 'Wind Vane' : 'वायु दिशा सूचक (Wind Vane)', cx, cy - 58);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 13px system-ui';
    ctx.fillText(`${directions[dirIdx]} • ${deg}°`, cx, cy + 68);

    ctx.restore();
  }

  // Instrument 3: Thermometer
  function drawStationThermometer(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    temp: number,
    currentLang: Language
  ) {
    ctx.save();
    // Instrument Panel Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.roundRect(cx - 130, cy - 70, 260, 160, 12);
    ctx.fill();
    ctx.stroke();

    // Thermometer tube
    const tx = cx - 40;
    const ty = cy - 45;
    const tw = 16;
    const th = 100;

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw, th, 8);
    ctx.fill();

    // Red Bulb at bottom
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(tx + tw * 0.5, ty + th - 6, 12, 0, Math.PI * 2);
    ctx.fill();

    // Mercury column (0 to 50°C scale)
    const norm = Math.min(1, Math.max(0, temp / 50));
    const colH = (th - 25) * norm;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(tx + 4, ty + th - 15 - colH, tw - 8, colH + 10, 3);
    ctx.fill();

    // Scale markings
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    [0, 10, 20, 30, 40, 50].forEach((m) => {
      const my = ty + th - 15 - (th - 25) * (m / 50);
      ctx.fillText(`${m}°`, tx + tw + 6, my + 3);
    });

    // Title & Temperature Readout
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'en' ? 'Thermometer' : 'तापमान मापक (Thermometer)', cx, cy - 50);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`${temp}°C`, cx + 45, cy + 10);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui';
    ctx.fillText(currentLang === 'en' ? 'Air Temperature' : 'हावाको तापक्रम', cx + 45, cy + 30);

    ctx.restore();
  }

  // Instrument 4: Rain Gauge
  function drawRainGauge(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    rain: number,
    currentLang: Language
  ) {
    ctx.save();
    // Instrument Panel Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.roundRect(cx - 130, cy - 70, 260, 160, 12);
    ctx.fill();
    ctx.stroke();

    // Funnel & Cylinder
    const gx = cx - 45;
    const gy = cy - 45;
    const gw = 28;
    const gh = 100;

    // Funnel on top
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(gx - 8, gy);
    ctx.lineTo(gx + gw + 8, gy);
    ctx.lineTo(gx + gw, gy + 15);
    ctx.lineTo(gx, gy + 15);
    ctx.closePath();
    ctx.fill();

    // Glass Measuring Cylinder
    ctx.fillStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.fillRect(gx, gy + 15, gw, gh - 15);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(gx, gy + 15, gw, gh - 15);

    // Blue Rainwater level (0 to 100 mm scale)
    const norm = Math.min(1, Math.max(0, rain / 100));
    const fillH = (gh - 18) * norm;
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(gx + 2, gy + gh - fillH, gw - 4, fillH);

    // Millimeter marks
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    [0, 25, 50, 75, 100].forEach((mm) => {
      const my = gy + gh - (gh - 18) * (mm / 100);
      ctx.fillText(`${mm}`, gx + gw + 6, my + 3);
    });

    // Title & Rainfall Readout
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'en' ? 'Rain Gauge' : 'वर्षा मापक (Rain Gauge)', cx, cy - 50);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`${rain} mm`, cx + 45, cy + 10);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui';
    ctx.fillText(currentLang === 'en' ? 'Precipitation' : 'संकलित वर्षा', cx + 45, cy + 30);

    ctx.restore();
  }

  // Central Weather Summary Badge
  function drawCentralSummaryBadge(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    t: number,
    r: number,
    w: number,
    deg: number,
    currentLang: Language
  ) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.roundRect(cx - 100, cy - 35, 200, 70, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'en' ? 'Station Report' : 'मौसम रिपोर्ट', cx, cy - 14);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px system-ui';
    ctx.fillText(`${t}°C • ${r}mm Rain`, cx, cy + 6);
    ctx.fillText(`${Math.round(w)} km/h • ${deg}°`, cx, cy + 22);

    ctx.restore();
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'anemometer') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! The Anemometer measures wind speed with spinning cups.' : 'सबास! एनिमोमिटर (Anemometer) ले हावाको गति नाप्दछ।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. A wind vane points to direction, an anemometer measures speed.' : 'मिलेन। विन्ड भेनले दिशा देखाउँछ भने एनिमोमिटरले गति नाप्छ।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Weather Observation Laboratory' : 'मौसम मापन प्रयोगशाला (Weather Station)'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 8: The Earth and Space'
          : 'कक्षा 4 विज्ञान • एकाइ 8: पृथ्वी र अन्तरिक्ष'
      }
      currentStage={stage}
      onStageChange={setStage}
      language={lang}
      onLanguageChange={setLang}
      stars={stars}
      maxStars={3}
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
            LEFT COLUMN: INTERACTIVE 2D CANVAS VIEWPORT
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <canvas
            ref={canvasRef}
            width={880}
            height={560}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
            }}
          />

          {/* Top Floating Badge */}
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
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '6px 14px',
                borderRadius: '10px',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Wind size={14} className="text-sky-400" />
              <span>
                {lang === 'en' ? 'Weather Observation Instruments in Operation' : 'मौसम मापन उपकरणहरू सञ्चालनमा'}
              </span>
            </div>
          </div>

          {/* Bottom Floating Readout Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                📊
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {lang === 'en' ? 'Meteorological Weather Station' : 'मौसम विज्ञान केन्द्र'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en'
                    ? `Thermometer: ${tempCelsius}°C • Rain Gauge: ${rainMm}mm • Anemometer: ${windKmh}km/h`
                    : `थर्मोमिटर: ${tempCelsius}°C • वर्षा मापक: ${rainMm}mm • एनिमोमिटर: ${windKmh}km/h`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Log Entries' : 'अभिलेख संख्या'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>
                  {logBook.length} Records
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: 380px PERSISTENT SIDEBAR
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* 1. Discovery Station Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>🌡️</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Weather Observatory Station' : 'मौसम अवलोकन प्रयोगशाला'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Meteorologists use scientific instruments to record temperature (Thermometer), rainfall (Rain Gauge), wind speed (Anemometer), and wind direction (Wind Vane).'
                : 'मौसमविद्हरूले थर्मोमिटर, वर्षा मापक, एनिमोमिटर र विन्ड भेन जस्ता यन्त्रहरूको प्रयोग गरी मौसमको अध्ययन गर्दछन्।'}
            </p>
          </div>

          {/* 2. Weather Parameters Sliders */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#38bdf8' }}>
              {lang === 'en' ? 'Adjust Weather Parameters' : 'मौसमका सूचकहरू'}
            </h4>

            {/* Temperature Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                <span>{lang === 'en' ? 'Temperature' : 'तापक्रम'}</span>
                <span style={{ fontWeight: '700', color: '#f43f5e' }}>{tempCelsius}°C</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={tempCelsius}
                onChange={(e) => setTempCelsius(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f43f5e', cursor: 'pointer' }}
              />
            </div>

            {/* Rain Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                <span>{lang === 'en' ? 'Rainfall' : 'वर्षा'}</span>
                <span style={{ fontWeight: '700', color: '#38bdf8' }}>{rainMm} mm</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={rainMm}
                onChange={(e) => setRainMm(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            {/* Wind Speed Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                <span>{lang === 'en' ? 'Wind Speed' : 'हावाको गति'}</span>
                <span style={{ fontWeight: '700', color: '#facc15' }}>{windKmh} km/h</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={windKmh}
                onChange={(e) => setWindKmh(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#facc15', cursor: 'pointer' }}
              />
            </div>

            {/* Wind Direction Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                <span>{lang === 'en' ? 'Wind Direction' : 'दिशा'}</span>
                <span style={{ fontWeight: '700', color: '#34d399' }}>{windAngleDeg}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={windAngleDeg}
                onChange={(e) => setWindAngleDeg(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
              />
            </div>

            {/* Record to Logbook Button */}
            <button
              onClick={handleRecordLog}
              style={{
                marginTop: '4px',
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <ClipboardList size={14} />
              <span>{lang === 'en' ? '📝 Record in Weather Logbook' : '📝 मौसम डायरीमा रेकर्ड गर्नुहोस्'}</span>
            </button>
          </div>

          {/* 3. Logbook Entries */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
              maxHeight: '140px',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#facc15', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ClipboardList size={13} />
              <span>{lang === 'en' ? 'Daily Weather Records' : 'दैनिक मौसम अभिलेख'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {logBook.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#475569',
                  }}
                >
                  <span style={{ fontWeight: '700', color: '#38bdf8' }}>{entry.day}</span>
                  <span>{entry.temp}°C</span>
                  <span>{entry.rain}mm</span>
                  <span>{entry.windSpeed}km/h {entry.windDir}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Quick Quiz */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              {lang === 'en' ? 'Instruments Quiz' : 'मौसम यन्त्र प्रश्न'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'Which meteorological instrument uses spinning hemispherical cups to measure wind speed?'
                : 'हावाको गति नाप्नका लागि घुम्ने कचौरा आकारका कपहरू भएको यन्त्र कुन हो?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleQuizAnswer('wind_vane')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {lang === 'en' ? 'Wind Vane' : 'विन्ड भेन'}
              </button>

              <button
                onClick={() => handleQuizAnswer('anemometer')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 4px',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {lang === 'en' ? 'Anemometer' : 'एनिमोमिटर'}
              </button>
            </div>

            {quizFeedback && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontSize: '11px',
                  color: '#38bdf8',
                  textAlign: 'center',
                }}
              >
                {quizFeedback}
              </div>
            )}
          </div>

          {/* 5. Complete Weather Observation Lab Button */}
          <button
            onClick={() => {
              ScienceAudio.playSuccess();
              setStars(3);
              setIsCompleted(true);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              marginTop: 'auto',
            }}
          >
            <span>✓</span>
            <span>{lang === 'en' ? 'Complete Weather Lab & Quiz' : 'मौसम अवलोकन प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
