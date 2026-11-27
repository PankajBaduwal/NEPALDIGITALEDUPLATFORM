/**
 * RestMotionExplorerSim.tsx
 * Simulation 15: 2D Rest and Relative Motion Explorer
 * Grade 6 Science • Unit 6: Force and Motion
 *
 * 100% Native HTML5 Canvas 2D Interactive Kinematics Simulation.
 * Features:
 * 1. Classic Nepalese Science Textbook Scenario:
 *    - Roadside Observer POV: The passenger and bus move forward with speed v. Roadside trees are at rest.
 *    - In-Bus Passenger POV: The co-passenger is completely at rest (v = 0), while roadside trees rush backward!
 * 2. Real-time Frame of Reference switcher with parallax scrolling background (Himalayas, trees, road)
 * 3. Speed regulator (0 to 80 km/h) with dynamic velocity vector arrows
 * 4. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Bus, Trees, Eye, Play, Pause, RotateCcw, Sparkles, Award } from 'lucide-react';

type ReferencePOV = 'roadside' | 'inside_bus';

export const RestMotionExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // POV: Roadside vs In-Bus
  const [pov, setPov] = useState<ReferencePOV>('roadside');
  const [busSpeedKmh, setBusSpeedKmh] = useState<number>(45); // 0 to 80 km/h
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollOffsetRef = useRef<number>(0);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setPov('roadside');
    setBusSpeedKmh(45);
    setIsPlaying(true);
    scrollOffsetRef.current = 0;
    setStars(0);
    setIsCompleted(false);
  };

  const handleTogglePov = (newPov: ReferencePOV) => {
    ScienceAudio.playClick();
    setPov(newPov);
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

      // Update scroll animation based on speed
      if (isPlaying) {
        scrollOffsetRef.current += (busSpeedKmh / 10) * 0.8;
      }
      const scroll = scrollOffsetRef.current;

      // ── SKY & HIMALAYAN BACKGROUND ──
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 240);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.6, '#38bdf8');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, 240);

      // Himalayan Peaks (Parallax layer 1: very slow scroll in bus POV)
      const peakOffset = pov === 'inside_bus' ? -scroll * 0.1 : 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, 180);
      for (let p = -2; p <= 8; p++) {
        const px = ((p * 180 + peakOffset) % (width + 360)) - 180;
        ctx.lineTo(px, 180);
        ctx.lineTo(px + 90, 70);
        ctx.lineTo(px + 180, 180);
      }
      ctx.closePath();
      ctx.fill();

      // Green Foothills (Parallax layer 2)
      const hillOffset = pov === 'inside_bus' ? -scroll * 0.3 : 0;
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(0, 240);
      for (let h = -2; h <= 8; h++) {
        const hx = ((h * 160 + hillOffset) % (width + 320)) - 160;
        ctx.quadraticCurveTo(hx + 80, 150, hx + 160, 240);
      }
      ctx.closePath();
      ctx.fill();

      // Roadway Base (Asphalt)
      const roadY = 240;
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, roadY, width, height - roadY);

      // Road White Center Dotted Line
      const roadOffset = pov === 'inside_bus' ? -scroll * 2 : 0;
      ctx.fillStyle = '#facc15';
      for (let d = -2; d <= 24; d++) {
        const dx = ((d * 60 + roadOffset) % (width + 120)) - 60;
        ctx.fillRect(dx, roadY + 80, 36, 6);
      }

      // ==========================================
      // PERSPECTIVE 1: ROADSIDE OBSERVER POV
      // ==========================================
      if (pov === 'roadside') {
        // Roadside Trees (Stationary relative to ground)
        for (let t = 0; t < 5; t++) {
          const tx = 90 + t * 180;
          const ty = roadY + 10;
          // Trunk
          ctx.fillStyle = '#78350f';
          ctx.fillRect(tx - 6, ty - 60, 12, 60);
          // Foliage
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.arc(tx, ty - 70, 26, 0, Math.PI * 2);
          ctx.fill();
        }

        // Roadside Observer Person standing on the pavement
        const obsX = 80;
        const obsY = roadY + 40;
        // Head & Body
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(obsX, obsY - 45, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(obsX - 8, obsY - 33, 16, 32);
        // Observer Callout
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? '👁️ बाटोमा उभिएको व्यक्ति' : '👁️ Roadside Observer', obsX, obsY + 16);
        ctx.fillStyle = '#a7f3d0';
        ctx.fillText(lang === 'ne' ? '' : '(At Rest / v = 0)', obsX, obsY + 30);

        // Moving Passenger Bus (travels across road)
        const busX = ((scroll * 3) % (width + 300)) - 250;
        const busY = roadY + 20;
        const busW = 220;
        const busH = 90;

        // Bus Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(busX + busW / 2, busY + busH + 4, busW / 2 + 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bus Chassis (Red/Orange Nepali Sajha Yatayat style)
        const busGrad = ctx.createLinearGradient(busX, busY, busX, busY + busH);
        busGrad.addColorStop(0, '#f97316');
        busGrad.addColorStop(0.7, '#ea580c');
        busGrad.addColorStop(1, '#9a3412');
        ctx.fillStyle = busGrad;
        ctx.beginPath();
        ctx.roundRect(busX, busY, busW, busH, [16, 24, 6, 6]);
        ctx.fill();
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bus Windows with Passengers inside
        ctx.fillStyle = '#e0f2fe';
        for (let w = 0; w < 4; w++) {
          const wx = busX + 24 + w * 42;
          ctx.beginPath();
          ctx.roundRect(wx, busY + 14, 34, 28, 4);
          ctx.fill();
          ctx.strokeStyle = '#0284c7';
          ctx.stroke();

          // Passenger silhouette head
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(wx + 17, busY + 30, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bus Wheels
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(busX + 45, busY + busH, 18, 0, Math.PI * 2);
        ctx.arc(busX + busW - 45, busY + busH, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(busX + 45, busY + busH, 8, 0, Math.PI * 2);
        ctx.arc(busX + busW - 45, busY + busH, 8, 0, Math.PI * 2);
        ctx.fill();

        // Velocity Arrow on Bus
        if (busSpeedKmh > 0) {
          ctx.strokeStyle = '#22c55e';
          ctx.fillStyle = '#22c55e';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(busX + busW / 2, busY - 15);
          ctx.lineTo(busX + busW / 2 + 70, busY - 15);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(busX + busW / 2 + 70, busY - 15);
          ctx.lineTo(busX + busW / 2 + 58, -21 + busY);
          ctx.lineTo(busX + busW / 2 + 58, -9 + busY);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#22c55e';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(`v = +${busSpeedKmh} km/h`, busX + busW / 2 + 40, busY - 26);
        }
      }

      // ==========================================
      // PERSPECTIVE 2: IN-BUS PASSENGER POV
      // ==========================================
      if (pov === 'inside_bus') {
        // Outside trees rushing backwards through the bus window!
        const treeOffset = -scroll * 3.5;
        for (let t = -2; t <= 10; t++) {
          const tx = ((t * 180 + treeOffset) % (width + 360)) - 180;
          const ty = roadY + 20;
          ctx.fillStyle = '#78350f';
          ctx.fillRect(tx - 6, ty - 60, 12, 60);
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.arc(tx, ty - 70, 26, 0, Math.PI * 2);
          ctx.fill();

          // Speed lines showing trees moving backward
          if (busSpeedKmh > 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tx + 40, ty - 70);
            ctx.lineTo(tx + 90, ty - 70);
            ctx.stroke();
          }
        }

        // Inside Bus Window Frame and Seat Interior
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        // Top window sill
        ctx.fillRect(0, 0, width, 55);
        // Bottom window sill
        ctx.fillRect(0, 310, width, height - 310);
        // Left & Right Bus Pillars
        ctx.fillRect(0, 0, 70, height);
        ctx.fillRect(width - 70, 0, 70, height);

        // Window Border Highlight
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 6;
        ctx.strokeRect(70, 55, width - 140, 255);

        // Co-Passenger sitting right beside you! (Completely AT REST in this frame)
        const passX = 240;
        const passY = 360;

        // Bus Seat Backrest
        ctx.fillStyle = '#1e3a8a';
        ctx.roundRect(passX - 45, passY - 140, 90, 140, 16);
        ctx.fill();

        // Passenger Body
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(passX - 30, passY - 70, 60, 70);
        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(passX, passY - 95, 24, 0, Math.PI * 2);
        ctx.fill();

        // Rest Callout on Passenger
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? '💺 सँगै बसेको यात्रु (Co-Passenger)' : '💺 Co-Passenger Beside You', passX, passY + 30);
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'ne' ? '✓ विश्राममा (At Rest, v = 0)' : '✓ At Rest Relative to Bus (v = 0)', passX, passY + 48);

        // Outside tree rushing velocity indicator
        if (busSpeedKmh > 0) {
          ctx.strokeStyle = '#ef4444';
          ctx.fillStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(600, 130);
          ctx.lineTo(520, 130);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(520, 130);
          ctx.lineTo(532, 124);
          ctx.lineTo(532, 136);
          ctx.closePath();
          ctx.fill();

          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(`v = -${busSpeedKmh} km/h`, 600, 115);
        }
      }

      // ── BOTTOM SUMMARY BANNER ──
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 270, 15, 540, 48, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      if (pov === 'roadside') {
        ctx.fillText(
          lang === 'ne'
            ? 'सडकबाट हेर्दा: बस र यात्रु गतिशील छन्, रुखहरू स्थिर छन्।'
            : 'Roadside View: Bus and passengers are moving; trees are at rest.',
          width / 2,
          44
        );
      } else {
        ctx.fillText(
          lang === 'ne'
            ? 'बसभित्रबाट हेर्दा: सँगैको साथी स्थिर छ, बाहिरका रुखहरू पछाडि दौडिन्छन्।'
            : 'Bus View: Co-passenger is at rest; outside trees rush backwards.',
          width / 2,
          44
        );
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [pov, busSpeedKmh, isPlaying, lang]);

  return (
    <SimulationLayout
      title="Rest and Relative Motion Explorer"
      titleNepali="विश्राम र सापेक्ष गति प्रयोगशाला"
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
      currentPromptEn="Switch reference frames between the Roadside and Inside the Bus to discover how motion is relative."
      currentPromptNe="सडक छेउ र बसभित्रको दृश्य बदल्नुहोस् र गति किन सापेक्षिक हुन्छ बुझ्नुहोस्।"
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
            {pov === 'roadside' ? <Trees style={{ width: '14px', height: '14px' }} /> : <Bus style={{ width: '14px', height: '14px' }} />}
            <span>
              {lang === 'ne'
                ? `अवलोकन विन्दु: ${pov === 'roadside' ? 'सडक किनार (Roadside)' : 'बसभित्र (Inside Bus)'} | गति: ${busSpeedKmh} km/h`
                : `Reference Frame: ${pov === 'roadside' ? 'Roadside Observer' : 'Inside Bus Passenger'} | Speed: ${busSpeedKmh} km/h`}
            </span>
          </div>

          {/* Floating Bottom Animation Dock */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {lang === 'ne' ? 'सापेक्ष गतिको स्थिति:' : 'Relative Velocity:'}
              </span>
              <span style={{ color: '#64748b', fontSize: '11px' }}>
                {pov === 'roadside'
                  ? (lang === 'ne' ? 'सडक स्थिर छ, बस र यात्रु अगाडि बढिरहेका छन्।' : 'Road is stationary; Bus and passengers move forward.')
                  : (lang === 'ne' ? 'यात्रु स्थिर देखिन्छ, बाहिरका रुखहरू पछाडि दौडिरहेका छन्!' : 'Co-passenger appears at rest; Trees rush backwards!')}
              </span>
            </div>
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                ScienceAudio.playClick();
              }}
              style={{
                background: isPlaying ? 'rgba(255, 255, 255, 0.08)' : 'rgba(16, 185, 129, 0.25)',
                border: isPlaying ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #10b981',
                color: isPlaying ? '#e2e8f0' : '#34d399',
                borderRadius: '8px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isPlaying ? <Pause style={{ width: '13px', height: '13px' }} /> : <Play style={{ width: '13px', height: '13px' }} />}
              <span>{isPlaying ? (lang === 'ne' ? 'रोक्नुहोस्' : 'Pause') : (lang === 'ne' ? 'चलाउनुहोस्' : 'Resume')}</span>
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
              <span>{lang === 'ne' ? 'सापेक्ष गति अन्वेषण केन्द्र' : 'Relativity Discovery Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'अवलोकनकर्ताको दृष्टिकोण बदल्नुहोस् र कुनै पनि वस्तु स्थिर वा गतिशील कसरी हुन्छ बुझ्नुहोस्।'
                : 'Switch frames of reference to discover how rest and motion are purely relative concepts.'}
            </p>
          </div>

          {/* POV Frame Selection Buttons */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '1. अवलोकनकर्ताको स्थान (Frame of Reference)' : '1. Frame of Reference'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleTogglePov('roadside')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: pov === 'roadside' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                  background: pov === 'roadside' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: pov === 'roadside' ? '#38bdf8' : '#cbd5e1',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Trees style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700 }}>
                    {lang === 'ne' ? 'सडक किनारबाट अवलोकन' : 'Roadside Observer POV'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {lang === 'ne' ? 'सडक स्थिर, बस र यात्रु गतिशील' : 'Road at rest, bus & passenger moving'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTogglePov('inside_bus')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: pov === 'inside_bus' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                  background: pov === 'inside_bus' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: pov === 'inside_bus' ? '#fbbf24' : '#cbd5e1',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Bus style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700 }}>
                    {lang === 'ne' ? 'बसभित्रको सिटबाट अवलोकन' : 'Inside Bus Passenger POV'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {lang === 'ne' ? 'यात्रु स्थिर, रुखहरू पछाडि सर्दैछन्' : 'Passenger at rest, trees rushing back'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Bus Speed Slider */}
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
                <Bus style={{ width: '13px', height: '13px' }} />
                {lang === 'ne' ? 'बसको गति (Speed):' : 'Bus Velocity:'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {busSpeedKmh} km/h
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              value={busSpeedKmh}
              onChange={(e) => setBusSpeedKmh(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>0 km/h (Rest)</span>
              <span>40 km/h</span>
              <span>80 km/h (Express)</span>
            </div>
          </div>

          {/* Kinematics Diagnostics Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '🔍 सापेक्ष वेग विश्लेषण (Telemetry)' : '🔍 Relative Velocity Matrix'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'यात्रुको गति:' : 'Passenger Velocity:'}</span>
                <span style={{ fontWeight: 700, color: pov === 'roadside' ? '#38bdf8' : '#4ade80' }}>
                  {pov === 'roadside' ? `+${busSpeedKmh} km/h (Motion)` : '0 km/h (At Rest)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'सडक किनारका रुख:' : 'Roadside Trees:'}</span>
                <span style={{ fontWeight: 700, color: pov === 'roadside' ? '#4ade80' : '#f87171' }}>
                  {pov === 'roadside' ? '0 km/h (At Rest)' : `-${busSpeedKmh} km/h (Moving Back)`}
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
              ? 'कुनै वस्तु स्थिर छ वा गतिशील भन्ने कुरा अवलोकनकर्ताको स्थान (Frame of Reference) मा भर पर्दछ। ब्रह्माण्डमा कुनै पनि वस्तु पूर्ण विश्राममा छैन।'
              : 'Motion is purely relative: whether an object is at rest or in motion depends strictly on the chosen reference frame.'}
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
              <span>{lang === 'ne' ? '✓ विश्राम र गति प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Rest & Motion Lab & Quiz'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default RestMotionExplorerSim;
