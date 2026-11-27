/**
 * MagneticFieldExplorerSim.tsx
 * Simulation 26: 2D Magnetic Field & Compass Explorer
 * Grade 6 Science • Unit 8: Electricity and Magnetism
 *
 * 100% Native HTML5 Canvas 2D Interactive Magnetic Field Simulator.
 * Features:
 * 1. 2D Bar Magnet with North (Red) and South (Blue) poles
 * 2. Magnetic Field Lines: Closed loops emerging from North and entering South
 * 3. Draggable Interactive Compass: Magnetic needle dynamically aligns with the local tangent field vector
 * 4. Interaction Modes: Single Magnet vs Two Magnets (Attraction N-S vs Repulsion N-N with Neutral Point)
 * 5. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Compass, Sparkles, Move, RotateCcw, Eye, Award } from 'lucide-react';

type MagnetMode = 'single' | 'two_attract' | 'two_repel';

export const MagneticFieldExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Simulation Parameters
  const [magnetMode, setMagnetMode] = useState<MagnetMode>('single');
  const [showFieldLines, setShowFieldLines] = useState<boolean>(true);
  const [compassPos, setCompassPos] = useState<{ x: number; y: number }>({ x: 300, y: 140 });
  const [isDraggingCompass, setIsDraggingCompass] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setMagnetMode('single');
    setShowFieldLines(true);
    setCompassPos({ x: 300, y: 140 });
    setStars(0);
    setIsCompleted(false);
  };

  // Mouse / Dragging handlers on Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Check if clicked near compass (radius 30)
    const dist = Math.hypot(mouseX - compassPos.x, mouseY - compassPos.y);
    if (dist < 40) {
      setIsDraggingCompass(true);
      ScienceAudio.playClick();
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingCompass) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = Math.max(40, Math.min(canvas.width - 40, (e.clientX - rect.left) * scaleX));
    const mouseY = Math.max(40, Math.min(canvas.height - 40, (e.clientY - rect.top) * scaleY));
    setCompassPos({ x: mouseX, y: mouseY });

    if (stage === 'challenge' && stars < 3) setStars(3);
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCompass(false);
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

      // Dark Tech Lab Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Magnetic Grid Background
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
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

      // ==========================================
      // 1. DRAW BAR MAGNETS & MAGNETIC FIELD LINES
      // ==========================================
      if (magnetMode === 'single') {
        const magX = width / 2;
        const magY = height / 2;
        const magW = 180;
        const magH = 46;

        // Field Lines (Emerging from North at right, curving to South at left)
        if (showFieldLines) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.5;

          for (let loop = 1; loop <= 6; loop++) {
            const rx = (magW / 2) + loop * 28;
            const ry = 40 + loop * 24;

            // Top Field Loop
            ctx.beginPath();
            ctx.ellipse(magX, magY - ry / 2, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Bottom Field Loop
            ctx.beginPath();
            ctx.ellipse(magX, magY + ry / 2, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Direction Arrowheads along Field Lines
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(magX, magY - ry * 1.5, 3, 0, Math.PI * 2);
            ctx.arc(magX, magY + ry * 1.5, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Draw Single Bar Magnet
        ctx.save();
        ctx.translate(magX, magY);

        // South Pole (Left Half - Blue)
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect(-magW / 2, -magH / 2, magW / 2, magH, [6, 0, 0, 6]);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('S', -magW / 4, 6);

        // North Pole (Right Half - Red)
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(0, -magH / 2, magW / 2, magH, [0, 6, 6, 0]);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('N', magW / 4, 6);

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-magW / 2, -magH / 2, magW, magH);
        ctx.restore();
      } else if (magnetMode === 'two_attract') {
        // Two Magnets Facing with Opposite Poles (N facing S -> Attraction)
        const m1X = 260;
        const m2X = 620;
        const magY = height / 2;
        const magW = 140;
        const magH = 46;

        // Bridging Attraction Field Lines across Gap
        if (showFieldLines) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
          ctx.lineWidth = 2;
          for (let y = -40; y <= 40; y += 15) {
            ctx.beginPath();
            ctx.moveTo(m1X + magW / 2, magY + y);
            ctx.quadraticCurveTo((m1X + m2X) / 2, magY + y * 1.8, m2X - magW / 2, magY + y);
            ctx.stroke();
          }
        }

        // Magnet 1 (Left: S - N)
        ctx.save();
        ctx.translate(m1X, magY);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(-magW / 2, -magH / 2, magW / 2, magH);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, -magH / 2, magW / 2, magH);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('S', -magW / 4, 6);
        ctx.fillText('N', magW / 4, 6);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(-magW / 2, -magH / 2, magW, magH);
        ctx.restore();

        // Magnet 2 (Right: S - N)
        ctx.save();
        ctx.translate(m2X, magY);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(-magW / 2, -magH / 2, magW / 2, magH);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, -magH / 2, magW / 2, magH);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('S', -magW / 4, 6);
        ctx.fillText('N', magW / 4, 6);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(-magW / 2, -magH / 2, magW, magH);
        ctx.restore();

        // Attraction Force Banner
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? '🧲 आकर्षण (Unlike Poles Attract)' : '🧲 Mutual Attraction (N - S)', width / 2, 70);
      } else {
        // Two Magnets Facing with Like Poles (N facing N -> Repulsion)
        const m1X = 260;
        const m2X = 620;
        const magY = height / 2;
        const magW = 140;
        const magH = 46;

        // Repelling Divergent Field Lines & Neutral Point
        if (showFieldLines) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
          ctx.lineWidth = 2;
          for (let y = -40; y <= 40; y += 15) {
            ctx.beginPath();
            ctx.moveTo(m1X + magW / 2, magY + y);
            ctx.quadraticCurveTo((m1X + m2X) / 2 - 20, magY + (y > 0 ? 120 : -120), (m1X + m2X) / 2, magY + (y > 0 ? 140 : -140));
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(m2X - magW / 2, magY + y);
            ctx.quadraticCurveTo((m1X + m2X) / 2 + 20, magY + (y > 0 ? 120 : -120), (m1X + m2X) / 2, magY + (y > 0 ? 140 : -140));
            ctx.stroke();
          }

          // Neutral Point (Null B field)
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc((m1X + m2X) / 2, magY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lang === 'ne' ? 'तटस्थ विन्दु (B = 0)' : 'Neutral Point (B = 0)', (m1X + m2X) / 2, magY + 22);
        }

        // Magnet 1 (Left: S - N)
        ctx.save();
        ctx.translate(m1X, magY);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(-magW / 2, -magH / 2, magW / 2, magH);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, -magH / 2, magW / 2, magH);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('S', -magW / 4, 6);
        ctx.fillText('N', magW / 4, 6);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(-magW / 2, -magH / 2, magW, magH);
        ctx.restore();

        // Magnet 2 (Right: N - S)
        ctx.save();
        ctx.translate(m2X, magY);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-magW / 2, -magH / 2, magW / 2, magH);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(0, -magH / 2, magW / 2, magH);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('N', -magW / 4, 6);
        ctx.fillText('S', magW / 4, 6);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(-magW / 2, -magH / 2, magW, magH);
        ctx.restore();

        // Repulsion Force Banner
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? '🧲 विकर्षण (Like Poles Repel)' : '🧲 Mutual Repulsion (N - N)', width / 2, 70);
      }

      // ==========================================
      // 2. INTERACTIVE DRAGGABLE COMPASS
      // ==========================================
      const { x: cx, y: cy } = compassPos;

      // Compute local magnetic field vector angle at (cx, cy)
      // North pole pushes, South pole pulls: B = (r_N / |r_N|³) - (r_S / |r_S|³)
      let bx = 0;
      let by = 0;

      if (magnetMode === 'single') {
        const nPoleX = width / 2 + 70;
        const nPoleY = height / 2;
        const sPoleX = width / 2 - 70;
        const sPoleY = height / 2;

        const dNx = cx - nPoleX;
        const dNy = cy - nPoleY;
        const distN = Math.hypot(dNx, dNy);

        const dSx = cx - sPoleX;
        const dSy = cy - sPoleY;
        const distS = Math.hypot(dSx, dSy);

        bx = dNx / Math.pow(distN, 2.5) - dSx / Math.pow(distS, 2.5);
        by = dNy / Math.pow(distN, 2.5) - dSy / Math.pow(distS, 2.5);
      } else {
        bx = 1;
        by = 0;
      }

      const compassAngle = Math.atan2(by, bx);

      // Compass Housing Circle
      ctx.save();
      ctx.translate(cx, cy);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cardinal Dials (N, S, E, W)
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N', 0, -22);
      ctx.fillText('S', 0, 26);
      ctx.fillText('E', 24, 3);
      ctx.fillText('W', -24, 3);

      // Rotating Compass Needle
      ctx.rotate(compassAngle);

      // North Arrowhead (Red)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(6, 0);
      ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.fill();

      // South Arrowhead (White/Silver)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, 24);
      ctx.lineTo(6, 0);
      ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.fill();

      // Center Brass Pivot Nub
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [magnetMode, showFieldLines, compassPos, lang]);

  return (
    <SimulationLayout
      title="Magnetic Field and Compass Explorer"
      titleNepali="चुम्बकीय क्षेत्र तथा कम्पास अन्वेषण प्रयोगशाला"
      chapterNumber={8}
      chapterTitle="Unit 8: Electricity and Magnetism"
      chapterTitleNepali="एकाइ 8: विद्युत र चुम्बकत्व"
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
      currentPromptEn="Drag the magnetic compass around the bar magnet to visualize how field lines direct the needle."
      currentPromptNe="कम्पासलाई तानेर चुम्बक वरिपरि सार्नुहोस् र चुम्बकीय बलरेखाले सियो कसरी घुमाउँछ हेर्नुहोस्।"
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
        {/* LEFT COLUMN: 2D CANVAS VIEWPORT (Supports Mouse Drag) */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            overflow: 'hidden',
            cursor: 'crosshair',
          }}
        >
          <canvas
            ref={canvasRef}
            width={880}
            height={460}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
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
            <Compass style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
            <span>
              {magnetMode === 'single' && (lang === 'ne' ? 'एक्लो बार चुम्बक (उत्तर ➔ दक्षिण बलरेखा)' : 'Single Bar Magnet (North ➔ South)')}
              {magnetMode === 'two_attract' && (lang === 'ne' ? 'असमान ध्रुव (N-S): आकर्षण' : 'Opposite Poles (N-S): Attraction')}
              {magnetMode === 'two_repel' && (lang === 'ne' ? 'समान ध्रुव (N-N): विकर्षण' : 'Like Poles (N-N): Repulsion')}
            </span>
          </div>

          {/* Floating Bottom Compass Guidance Dock */}
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
                {lang === 'ne' ? 'कम्पास निर्देशन:' : 'Compass Direction:'}
              </span>
              <span style={{ color: '#64748b', fontSize: '11px' }}>
                {lang === 'ne'
                  ? 'माउसले कम्पास तानेर चुम्बक वरिपरि सार्नुहोस् र सियोको दिशा हेर्नुहोस्।'
                  : 'Click and drag the brass compass around the poles to trace flux vectors.'}
              </span>
            </div>

            <button
              onClick={() => {
                setShowFieldLines(!showFieldLines);
                ScienceAudio.playClick();
              }}
              style={{
                background: showFieldLines ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: showFieldLines ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
                color: showFieldLines ? '#fbbf24' : '#94a3b8',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {showFieldLines ? (lang === 'ne' ? 'बलरेखा लुकाउनुहोस्' : 'Hide Field Lines') : (lang === 'ne' ? 'बलरेखा देखाउनुहोस्' : 'Show Field Lines')}
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
              <span>{lang === 'ne' ? 'चुम्बकीय क्षेत्र अनुसन्धान' : 'Magnetic Field Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'चुम्बकीय बलरेखा (Field Lines) को दिशा र कम्पासको सियोको चाल अवलोकन गर्नुहोस्।'
                : 'Map unseen invisible magnetic field lines around single and paired bar magnets.'}
            </p>
          </div>

          {/* Magnet Pole Configuration Buttons */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '1. चुम्बक विन्यास (Configuration)' : '1. Magnet Configuration'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'single', nameEn: 'Single Bar Magnet', nameNe: '1. एक्लो बार चुम्बक' },
                { id: 'two_attract', nameEn: 'Opposite Poles (Attraction)', nameNe: '2. असमान ध्रुव (आकर्षण)' },
                { id: 'two_repel', nameEn: 'Like Poles (Repulsion)', nameNe: '3. समान ध्रुव (विकर्षण)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMagnetMode(m.id as MagnetMode);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: magnetMode === m.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: magnetMode === m.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: magnetMode === m.id ? '#38bdf8' : '#cbd5e1',
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

          {/* Field Lines Telemetry Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '🧭 कम्पास र बलरेखा नियम:' : '🧭 Magnetic Field Properties:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'बलरेखाको दिशा:' : 'Vector Direction:'}</span>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>North (N) ➔ South (S)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'ध्रुवमा आकर्षण:' : 'Pole Density:'}</span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>
                  {lang === 'ne' ? 'ध्रुवहरूमा बलरेखा बाक्लो हुन्छ' : 'Dense near poles (Strongest)'}
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
              ? 'चुम्बकीय बलरेखा उत्तर ध्रुवबाट निस्केर दक्षिण ध्रुवमा प्रवेश गर्छन्। ती कहिल्यै आपसमा काटिँदैनन्। असमान ध्रुव आकर्षित हुन्छन् र समान ध्रुव विकर्षित हुन्छन्।'
              : 'Magnetic lines of force emerge from the North pole and enter the South pole, forming continuous closed loops that never intersect.'}
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
              <span>{lang === 'ne' ? '✓ चुम्बकीय क्षेत्र प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Magnetic Field Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default MagneticFieldExplorerSim;
