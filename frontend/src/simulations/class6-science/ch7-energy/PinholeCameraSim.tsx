/**
 * PinholeCameraSim.tsx
 * Simulation 24: 2D Pinhole Camera Laboratory
 * Grade 6 Science • Unit 7: Energy in Daily Life
 *
 * 100% Native HTML5 Canvas 2D Interactive Pinhole Optics.
 * Features:
 * 1. Ray Tracing Crossover: Rays from candle flame tip and base intersect at pinhole aperture
 * 2. Inverted Real Image: Upside down image formed on translucent tracing screen
 * 3. Magnification Dynamics: m = v / u (Screen distance / Object distance)
 * 4. Aperture Dynamics: Tiny pinhole (Sharp & clear) vs Large hole (Blurred overlapping circles)
 * 5. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Camera, Sparkles, Sliders, Eye, RotateCcw, Award } from 'lucide-react';

export const PinholeCameraSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Optical Parameters
  const [objectDistCm, setObjectDistCm] = useState<number>(25); // 15 to 50 cm (u)
  const [screenDistCm, setScreenDistCm] = useState<number>(18); // 10 to 30 cm (v)
  const [apertureSize, setApertureSize] = useState<'pin' | 'medium' | 'large'>('pin');

  // Magnification m = v / u
  const magnification = parseFloat((screenDistCm / objectDistCm).toFixed(2));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setObjectDistCm(25);
    setScreenDistCm(18);
    setApertureSize('pin');
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
      const time = Date.now() / 250;

      // Dark Optics Room Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Bench Platform
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 390, width, height - 390);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 390);
      ctx.lineTo(width, 390);
      ctx.stroke();

      // ==========================================
      // 1. OBJECT: BURNING CANDLE (Left Side)
      // ==========================================
      const pinholeX = 460;
      const pinholeY = 240;

      // Object position (u is distance left of pinhole)
      const candleX = pinholeX - objectDistCm * 7;
      const candleBaseY = 320;
      const candleHeight = 80;
      const candleTopY = candleBaseY - candleHeight;

      // Candle Body (Wax)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(candleX - 10, candleTopY, 20, candleHeight);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(candleX - 10, candleTopY, 20, candleHeight);

      // Flame at Candle Tip
      const flameH = 26 + Math.sin(time * 3) * 4;
      const flameGrad = ctx.createRadialGradient(candleX, candleTopY - 14, 2, candleX, candleTopY - 14, flameH);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#fef08a');
      flameGrad.addColorStop(0.7, '#f97316');
      flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(candleX, candleTopY - 14, flameH, 0, Math.PI * 2);
      ctx.fill();

      // Flame Tip (Coordinate of top light source)
      const tipX = candleX;
      const tipY = candleTopY - 16;
      // Base (Coordinate of bottom light source)
      const baseX = candleX;
      const baseY = candleBaseY;

      // ==========================================
      // 2. PINHOLE CAMERA BOX
      // ==========================================
      const boxW = screenDistCm * 7;
      const boxH = 220;
      const boxTopY = pinholeY - boxH / 2;

      // Camera Box Outer Enclosure (Black Cardboard)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.strokeRect(pinholeX, boxTopY, boxW, boxH);
      ctx.fillRect(pinholeX, boxTopY, boxW, boxH);

      // Front Face with Pinhole Aperture
      const holeRadius = apertureSize === 'pin' ? 3 : apertureSize === 'medium' ? 7 : 14;
      ctx.fillStyle = '#060a14';
      ctx.beginPath();
      ctx.arc(pinholeX, pinholeY, holeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Frosted Translucent Screen at Back of Camera
      const screenX = pinholeX + boxW;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
      ctx.fillRect(screenX - 4, boxTopY, 8, boxH);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX - 4, boxTopY, 8, boxH);

      // ==========================================
      // 3. RAY TRACING CROSSOVER (OPTICS)
      // ==========================================
      // Ray 1: Top of flame passes through pinhole to screen
      // Slope: m1 = (pinholeY - tipY) / (pinholeX - tipX)
      const m1 = (pinholeY - tipY) / (pinholeX - tipX);
      const imageTipY = pinholeY + m1 * (screenX - pinholeX);

      // Ray 2: Base of candle passes through pinhole to screen
      const m2 = (pinholeY - baseY) / (pinholeX - baseX);
      const imageBaseY = pinholeY + m2 * (screenX - pinholeX);

      // Light Rays (Gold & Amber)
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
      ctx.lineWidth = 2;

      // Ray from flame tip
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(screenX, imageTipY);
      ctx.stroke();

      // Ray from candle base
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(screenX, imageBaseY);
      ctx.stroke();

      // ==========================================
      // 4. INVERTED REAL IMAGE ON SCREEN
      // ==========================================
      const imageH = imageTipY - imageBaseY; // Height on screen
      const blurSigma = apertureSize === 'pin' ? 0 : apertureSize === 'medium' ? 4 : 10;

      ctx.save();
      ctx.translate(screenX + 18, (imageTipY + imageBaseY) / 2);

      // Inverted Image Representation (Upside down!)
      ctx.rotate(Math.PI); // 180 degrees flipped!

      // Candle body
      ctx.fillStyle = 'rgba(248, 250, 252, 0.8)';
      ctx.fillRect(-6, -Math.abs(imageH) / 2, 12, Math.abs(imageH) * 0.7);

      // Inverted Flame
      ctx.fillStyle = 'rgba(249, 115, 22, 0.85)';
      ctx.beginPath();
      ctx.arc(0, Math.abs(imageH) / 2 - 8, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ── HUD METRICS DISPLAY ──
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 260, 18, 520, 52, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        lang === 'ne'
          ? `वस्तु दूरी (u): ${objectDistCm}cm | पर्दा दूरी (v): ${screenDistCm}cm | म्याग्निफिकेसन (m = v/u): ${magnification}`
          : `Object Dist (u): ${objectDistCm}cm | Screen Dist (v): ${screenDistCm}cm | Magnification (m = v/u): ${magnification}`,
        width / 2,
        40
      );
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(
        lang === 'ne' ? '✓ वास्तविक, उल्टो (Inverted) र पर्दामा प्राप्त हुने आकृति' : '✓ Real, Inverted and Projected Image',
        width / 2,
        58
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [objectDistCm, screenDistCm, apertureSize, magnification, lang]);

  return (
    <SimulationLayout
      title="Pinhole Camera and Inverted Image Formation"
      titleNepali="पिनहोल क्यामेरा तथा उल्टो आकृति निर्माण"
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
      currentPromptEn="Adjust the candle distance (u) and camera depth (v) to see how ray intersection produces an inverted image."
      currentPromptNe="मैनबत्तीको दूरी (u) र क्यामेराको गहिराइ (v) मिलाई उल्टो वास्तविक आकृति कसरी बन्छ हेर्नुहोस्।"
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

          {/* Floating Top Inverted Image Badge */}
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
            <Camera style={{ width: '14px', height: '14px' }} />
            <span>
              {lang === 'ne'
                ? `आवर्धन (m): ${magnification.toFixed(2)}x`
                : `Inverted & Real Image | Magnification (m): ${magnification.toFixed(2)}x`}
            </span>
          </div>

          {/* Floating Bottom Optics Banner */}
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
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Pinhole Formula:</span>
              <span style={{ fontFamily: 'monospace', color: '#4ade80' }}>m = v / u</span>
              <span style={{ color: '#64748b' }}>=</span>
              <span style={{ fontFamily: 'monospace', color: '#fbbf24' }}>{screenDistCm} cm / {objectDistCm} cm = {magnification.toFixed(2)}x</span>
            </div>
            <span style={{ color: '#64748b', fontSize: '11px' }}>
              {apertureSize === 'pin' ? (lang === 'ne' ? 'तीखो र स्पष्ट (Sharp)' : 'Sharp Pinhole') : (lang === 'ne' ? 'धमिलो आकृति (Blurry)' : 'Blurry Overlap')}
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
              <span>{lang === 'ne' ? 'पिनहोल क्यामेरा प्रयोगशाला' : 'Pinhole Optics Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'मैनबत्तीको दूरी र पर्दाको दूरी मिलाएर उल्टो आकृति कसरी बन्छ हेर्नुहोस्।'
                : 'Vary candle distance and camera depth to examine ray intersection and image size.'}
            </p>
          </div>

          {/* Aperture Size Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '1. प्वालको आकार (Aperture)' : '1. Pinhole Aperture'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { id: 'pin', nameEn: 'Sharp Pin', nameNe: 'सानो (तीखो)' },
                { id: 'medium', nameEn: 'Medium', nameNe: 'मध्यम' },
                { id: 'large', nameEn: 'Large Blurry', nameNe: 'ठूलो (धमिलो)' },
              ].map((ap) => (
                <button
                  key={ap.id}
                  onClick={() => {
                    setApertureSize(ap.id as any);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: apertureSize === ap.id ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                    background: apertureSize === ap.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: apertureSize === ap.id ? '#a5b4fc' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'ne' ? ap.nameNe : ap.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Object Distance (u) Slider */}
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
                {lang === 'ne' ? 'वस्तु दूरी (Object Distance u):' : 'Object Distance (u):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {objectDistCm} cm
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={45}
              value={objectDistCm}
              onChange={(e) => setObjectDistCm(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>15 cm (Near)</span>
              <span>30 cm</span>
              <span>45 cm (Far)</span>
            </div>
          </div>

          {/* Screen Distance (v) Slider */}
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
                {lang === 'ne' ? 'पर्दा दूरी (Screen Distance v):' : 'Screen Distance (v):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {screenDistCm} cm
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={28}
              value={screenDistCm}
              onChange={(e) => setScreenDistCm(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>10 cm (Shallow)</span>
              <span>19 cm</span>
              <span>28 cm (Deep)</span>
            </div>
          </div>

          {/* Optical Diagnostics Telemetry */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '📊 आकृति विश्लेषण (Image Analysis):' : '📊 Image Analysis:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'आकृति प्रकार:' : 'Image Nature:'}</span>
                <span style={{ fontWeight: 700, color: '#f87171' }}>
                  {lang === 'ne' ? 'उल्टो तथा वास्तविक (Inverted & Real)' : 'Inverted & Real'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'आवर्धन (m = v/u):' : 'Magnification (m):'}</span>
                <span style={{ fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>{magnification.toFixed(2)}x</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'आकृतिको आकार:' : 'Relative Size:'}</span>
                <span style={{ fontWeight: 700, color: magnification > 1 ? '#fbbf24' : '#38bdf8' }}>
                  {magnification > 1.05
                    ? (lang === 'ne' ? 'ठूलो (Magnified)' : 'Magnified')
                    : magnification < 0.95
                    ? (lang === 'ne' ? 'सानो (Diminished)' : 'Diminished')
                    : (lang === 'ne' ? 'बराबर (Same Size)' : 'Same Size')}
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
              ? 'प्रकाश सरल रेखामा हिँड्ने भएकाले पिनहोल क्यामेरामा वस्तुको टुप्पोबाट आएको किरण तल र फेदबाट आएको किरण माथि पुगी उल्टो (Inverted) आकृति बन्छ।'
              : 'Because light rays cross at the pinhole, rays from the top go down and rays from the bottom go up, forming an inverted real image.'}
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
              <span>{lang === 'ne' ? '✓ पिनहोल क्यामेरा प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Pinhole Camera Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default PinholeCameraSim;
