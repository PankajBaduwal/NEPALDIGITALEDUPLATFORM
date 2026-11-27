/**
 * PlanetEarthSim.tsx
 * Simulation 28: 2D Explore Planet Earth (हाम्रो पृथ्वी - ग्लोब अन्वेषक)
 * Grade 4 Science • Chapter 8: The Earth and Space (पृथ्वी र अन्तरिक्ष)
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - High-fidelity animated spherical Earth with realistic axial tilt (23.5°):
 *   - Continuous west-to-east planetary rotation with draggable manual spin
 *   - Continents (Asia, Himalayas, Africa, Europe, Americas, Australia) & Oceans
 *   - Day/Night terminator line with glowing city lights on the night hemisphere
 *   - Atmospheric cyan scattering rim glow
 * - Nepal Location Pinpoint (28°N, 84°E): Mount Everest & Himalayan ridge highlighted
 * - Geographical reference overlays: Equator (भूमध्य रेखा), Axis of Rotation, North/South Poles
 * - Rotation speed controls, Bilingual EN/NE, and curriculum mastery quiz.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Globe, RotateCw, MapPin, Sparkles, Sliders, Check, Sun, Moon } from 'lucide-react';

interface Landmark {
  id: string;
  nameEn: string;
  nameNe: string;
  descEn: string;
  descNe: string;
}

export const PlanetEarthSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [rotationSpeed, setRotationSpeed] = useState<number>(1); // 0 to 3x
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showNepalPin, setShowNepalPin] = useState<boolean>(true);
  const [selectedLandmark, setSelectedLandmark] = useState<string>('nepal');
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Rotation angle state ref
  const rotationAngleRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);

  const landmarks: Landmark[] = [
    {
      id: 'nepal',
      nameEn: 'Nepal & Himalayas (नेपाल र हिमालय)',
      nameNe: 'नेपाल र हिमालय पर्वतमाला',
      descEn: 'Located at 28°N, 84°E in South Asia. Home to Mount Everest (8848.86m), the highest peak on Earth.',
      descNe: 'दक्षिण एसियामा २८° उत्तर र ८४° पूर्वमा अवस्थित। यहाँ संसारकै सर्वोच्च शिखर सगरमाथा (८८४८.८६ मि.) पर्दछ।',
    },
    {
      id: 'equator',
      nameEn: 'Equator (भूमध्य रेखा / ०° अक्षांश)',
      nameNe: 'भूमध्य रेखा (Equator)',
      descEn: 'The imaginary line dividing Earth into Northern and Southern Hemispheres, receiving direct sunlight year-round.',
      descNe: 'पृथ्वीलाई उत्तरी र दक्षिणी गोलार्धमा विभाजन गर्ने शून्य डिग्री अक्षांश रेखा।',
    },
    {
      id: 'poles',
      nameEn: 'Poles (उत्तरी र दक्षिणी ध्रुव)',
      nameNe: 'ध्रुवीय क्षेत्र (North & South Poles)',
      descEn: 'The northernmost and southernmost points around which Earth rotates, permanently covered with ice sheets.',
      descNe: 'पृथ्वीको अक्षका दुई छेउहरू, जहाँ अत्यधिक चिसो हुन्छ र बाह्रै महिना हिउँ जमेको हुन्छ।',
    },
  ];

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;
    rotationAngleRef.current += deltaX * 0.008;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleReset = () => {
    rotationAngleRef.current = 0;
    setRotationSpeed(1);
    setShowGrid(true);
    setShowNepalPin(true);
    setSelectedLandmark('nepal');
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

    const render = () => {
      time += 0.03;
      if (!isDraggingRef.current) {
        rotationAngleRef.current += rotationSpeed * 0.006;
      }
      ctx.clearRect(0, 0, 880, 560);

      // 1. DEEP SPACE BACKGROUND WITH TWINKLING STARS
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 880, 560);

      // Distant stars
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 70; s++) {
        const sx = (s * 37) % 880;
        const sy = (s * 49 + Math.sin(time + s) * 2) % 560;
        const sr = 0.8 + ((s % 3) * 0.5);
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. SUNLIGHT ILLUMINATION (Radiating from Left)
      const sunX = 40;
      const sunY = 280;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 220);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      sunGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.15)');
      sunGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 220, 0, Math.PI * 2);
      ctx.fill();

      // Sun Core Icon
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
      ctx.fill();

      // 3. EARTH SPHERE
      const earthX = 470;
      const earthY = 280;
      const earthR = 175;

      // Atmospheric outer glow
      const atmoGrad = ctx.createRadialGradient(earthX, earthY, earthR, earthX, earthY, earthR + 25);
      atmoGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
      atmoGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.18)');
      atmoGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR + 25, 0, Math.PI * 2);
      ctx.fill();

      // Earth Disc with Tilt transform (23.5 degrees)
      ctx.save();
      ctx.translate(earthX, earthY);
      ctx.rotate(-0.41); // 23.5 degrees in radians

      // Clip inside Earth circle
      ctx.beginPath();
      ctx.arc(0, 0, earthR, 0, Math.PI * 2);
      ctx.clip();

      // Deep Ocean Blue Base
      const oceanGrad = ctx.createRadialGradient(-earthR * 0.4, -earthR * 0.4, 20, 0, 0, earthR);
      oceanGrad.addColorStop(0, '#0284c7');
      oceanGrad.addColorStop(0.7, '#0369a1');
      oceanGrad.addColorStop(1, '#075985');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(-earthR, -earthR, earthR * 2, earthR * 2);

      // Render Rotating Continents
      drawRotatingContinents(ctx, earthR, rotationAngleRef.current, time);

      // Geographical Latitude / Longitude Grid
      if (showGrid) {
        drawGeographicalGrid(ctx, earthR, rotationAngleRef.current);
      }

      // Nepal Landmark Pinpoint
      if (showNepalPin) {
        drawNepalPinpoint(ctx, earthR, rotationAngleRef.current, time, lang);
      }

      // Day & Night Terminator Shadow Overlay (Sun from left)
      drawDayNightTerminator(ctx, earthR);

      ctx.restore();

      // 4. AXIS OF ROTATION ROD (Through Poles)
      drawEarthAxisRod(ctx, earthX, earthY, earthR);

      // 5. HUD OVERLAY
      drawEarthHUD(ctx, rotationSpeed, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [rotationSpeed, showGrid, showNepalPin, selectedLandmark, lang]);

  // Continents drawing with spherical wrapping
  function drawRotatingContinents(ctx: CanvasRenderingContext2D, r: number, rot: number, t: number) {
    ctx.save();
    const continents = [
      // Asia & Himalayas (Center around rot = 0)
      { name: 'Asia', offset: 0, lat: -25, w: 140, h: 95, col: '#15803d' },
      // Europe
      { name: 'Europe', offset: -1.2, lat: -65, w: 75, h: 50, col: '#16a34a' },
      // Africa
      { name: 'Africa', offset: -1.1, lat: 25, w: 90, h: 110, col: '#ca8a04' },
      // Americas (West)
      { name: 'N. America', offset: 2.3, lat: -55, w: 105, h: 80, col: '#16a34a' },
      { name: 'S. America', offset: 2.7, lat: 45, w: 80, h: 115, col: '#15803d' },
      // Australia (East)
      { name: 'Australia', offset: 1.1, lat: 55, w: 70, h: 55, col: '#d97706' },
      // Antarctica (South pole ice cap)
      { name: 'Antarctica', offset: 0, lat: 145, w: 260, h: 45, col: '#f8fafc' },
      // Arctic ice cap (North pole)
      { name: 'Arctic', offset: 0, lat: -150, w: 210, h: 35, col: '#f8fafc' },
    ];

    continents.forEach((cont) => {
      // Calculate wrapped longitude angle on sphere
      let lon = (cont.offset + rot) % (Math.PI * 2);
      if (lon < -Math.PI) lon += Math.PI * 2;
      if (lon > Math.PI) lon -= Math.PI * 2;

      // Only draw if on visible hemisphere (-PI/2 to PI/2)
      if (Math.abs(lon) < Math.PI * 0.55) {
        const sphereX = Math.sin(lon) * (r * 0.85);
        const sphereY = cont.lat;
        const scaleX = Math.cos(lon); // foreshortening near limb

        ctx.save();
        ctx.translate(sphereX, sphereY);
        ctx.scale(scaleX, 1);

        ctx.fillStyle = cont.col;
        ctx.beginPath();
        ctx.ellipse(0, 0, cont.w * 0.5, cont.h * 0.5, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Himalayan Snow Ridge inside Asia
        if (cont.name === 'Asia') {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(10, 5, 32, 10, -0.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    });

    ctx.restore();
  }

  // Geographical Reference Grid (Equator, Tropics, Meridians)
  function drawGeographicalGrid(ctx: CanvasRenderingContext2D, r: number, rot: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.2;

    // Equator (Center latitude line)
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();

    // Tropic of Cancer & Capricorn
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Cancer (+23.5°)
    ctx.beginPath();
    ctx.moveTo(-r * 0.92, -r * 0.38);
    ctx.lineTo(r * 0.92, -r * 0.38);
    ctx.stroke();

    // Capricorn (-23.5°)
    ctx.beginPath();
    ctx.moveTo(-r * 0.92, r * 0.38);
    ctx.lineTo(r * 0.92, r * 0.38);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
  }

  // Nepal Location Pinpoint (28°N, 84°E)
  function drawNepalPinpoint(
    ctx: CanvasRenderingContext2D,
    r: number,
    rot: number,
    t: number,
    currentLang: Language
  ) {
    ctx.save();
    let lon = rot % (Math.PI * 2);
    if (lon < -Math.PI) lon += Math.PI * 2;
    if (lon > Math.PI) lon -= Math.PI * 2;

    // Visible on front face
    if (Math.abs(lon) < Math.PI * 0.48) {
      const pinX = Math.sin(lon) * (r * 0.75) + 12;
      const pinY = -r * 0.42;

      // Glowing beacon rings
      const pulse = 1 + Math.sin(t * 5) * 0.3;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pinX, pinY, 9 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Red pinpoint marker
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(pinX, pinY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Nepal Flag / Label tag
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.roundRect(pinX + 12, pinY - 14, 110, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('🇳🇵 Nepal (नेपाल)', pinX + 18, pinY + 3);
    }
    ctx.restore();
  }

  // Day & Night Terminator Shadow
  function drawDayNightTerminator(ctx: CanvasRenderingContext2D, r: number) {
    ctx.save();
    // Sunlight arrives from Left. Right hemisphere is in darkness.
    const termGrad = ctx.createLinearGradient(-r * 0.2, 0, r * 0.6, 0);
    termGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    termGrad.addColorStop(0.4, 'rgba(2, 6, 23, 0.65)');
    termGrad.addColorStop(1, 'rgba(2, 6, 23, 0.92)');
    ctx.fillStyle = termGrad;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    // Night city light dots on dark side
    ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
    for (let c = 0; c < 18; c++) {
      const cx = r * 0.3 + ((c * 19) % (r * 0.6));
      const cy = -r * 0.5 + ((c * 23) % (r * 0.9));
      ctx.beginPath();
      ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Earth Axis Rod (Through North & South Poles)
  function drawEarthAxisRod(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.41); // 23.5° tilt

    // North Pole Rod Top
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -r - 35);
    ctx.lineTo(0, -r);
    ctx.stroke();

    // North Pole Knob
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -r - 35, 7, 0, Math.PI * 2);
    ctx.fill();

    // South Pole Rod Bottom
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(0, r + 35);
    ctx.stroke();

    // South Pole Knob
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(0, r + 35, 7, 0, Math.PI * 2);
    ctx.fill();

    // Pole Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('North Pole (उत्तरी ध्रुव)', 0, -r - 46);
    ctx.fillText('South Pole (दक्षिणी ध्रुव)', 0, r + 55);

    ctx.restore();
  }

  // Earth HUD
  function drawEarthHUD(ctx: CanvasRenderingContext2D, spd: number, currentLang: Language) {
    ctx.save();
    const px = 20;
    const py = 20;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.roundRect(px, py, 260, 65, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(currentLang === 'en' ? 'Planet Earth (हाम्रो पृथ्वी)' : 'हाम्रो पृथ्वी (Planet Earth)', px + 14, py + 24);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px system-ui';
    ctx.fillText(currentLang === 'en' ? '• Axial Tilt: 23.5° (अक्षीय झुकाव)' : '• अक्षीय झुकाव: २३.५ डिग्री', px + 14, py + 42);
    ctx.fillText(currentLang === 'en' ? '• Rotation: West to East (24 Hours)' : '• परिक्रमण: पश्चिमबाट पूर्व (२४ घण्टा)', px + 14, py + 56);

    ctx.restore();
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'west_to_east') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! Earth rotates from West to East, causing the Sun to rise in the East.' : 'सबास! पृथ्वी पश्चिमबाट पूर्वतिर घुम्ने हुनाले सूर्य पूर्वमा उदाउँछ।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. Earth spins from West to East.' : 'मिलेन। पृथ्वी पश्चिमबाट पूर्वतर्फ घुम्दछ।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Explore Planet Earth' : 'हाम्रो पृथ्वी (Planet Earth Globe)'}
      subtitle={
        lang === 'en'
          ? 'Grade 4 Science • Chapter 8: The Earth and Space'
          : 'कक्षा ४ विज्ञान • एकाइ ८: पृथ्वी र अन्तरिक्ष'
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
              cursor: 'grab',
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
              <RotateCw size={14} className="text-sky-400" />
              <span>
                {lang === 'en' ? 'Click and drag to spin planet Earth' : 'हातले समातेर पृथ्वीलाई घुमाउनुहोस्'}
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
                🌍
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {lang === 'en' ? 'Planet Earth (Third Rock from the Sun)' : 'पृथ्वी ग्रह (हाम्रो साझा घर)'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en'
                    ? '23.5° Axial Tilt • 24 Hours Rotation (Day/Night) • 365.25 Days Revolution'
                    : '२३.५° को अक्षीय ढल्काइ • २४ घण्टामा एक परिक्रमण • ३६५ दिनमा एक वर्ष'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Rotation' : 'घुम्ने गति'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                  {rotationSpeed}x
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
              <span style={{ fontSize: '16px' }}>🌐</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Earth Discovery Station' : 'पृथ्वी ग्रह अनुसन्धान केन्द्र'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Earth is an oblate spheroid rotating from West to East, causing sunrise in the east and sunset in the west.'
                : 'पृथ्वी पश्चिमबाट पूर्वतिर घुम्दछ, जसले गर्दा सूर्य पूर्वबाट उदाएर पश्चिममा अस्ताउँछ। यसैले दिन र रात हुन्छ।'}
            </p>
          </div>

          {/* 2. Rotation Speed Control */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8' }}>
              {lang === 'en' ? 'Rotation Speed' : 'घुम्ने गति नियन्त्रण'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { s: 0, label: '0x' },
                { s: 1, label: '1x' },
                { s: 2, label: '2x' },
                { s: 3, label: '3x' },
              ].map((item) => (
                <button
                  key={item.s}
                  onClick={() => {
                    setRotationSpeed(item.s);
                    ScienceAudio.playPop();
                  }}
                  style={{
                    background: rotationSpeed === item.s ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${rotationSpeed === item.s ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '8px',
                    padding: '8px 4px',
                    color: rotationSpeed === item.s ? '#38bdf8' : '#94a3b8',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Geographical Overlays */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Geographical Overlays' : 'भौगोलिक रेखाहरू'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => setShowGrid(!showGrid)}
                style={{
                  background: showGrid ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${showGrid ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '10px',
                  padding: '10px 8px',
                  color: showGrid ? '#facc15' : '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                🌐 {lang === 'en' ? 'Equator Lines' : 'भूमध्य रेखा'}
              </button>

              <button
                onClick={() => setShowNepalPin(!showNepalPin)}
                style={{
                  background: showNepalPin ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${showNepalPin ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '10px',
                  padding: '10px 8px',
                  color: showNepalPin ? '#34d399' : '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                📍 {lang === 'en' ? 'Pinpoint Nepal' : 'नेपालको स्थान'}
              </button>
            </div>
          </div>

          {/* 4. Landmark Info */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', marginBottom: '6px' }}>
              {lang === 'en' ? 'Key Geographical Features' : 'मुख्य भौगोलिक जानकारी'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {landmarks.map((lm) => (
                <div
                  key={lm.id}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ fontWeight: '700', color: '#38bdf8' }}>{lang === 'en' ? lm.nameEn : lm.nameNe}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{lang === 'en' ? lm.descEn : lm.descNe}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Concept Check Quiz */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              {lang === 'en' ? 'Earth Rotation Quiz' : 'पृथ्वीको परिक्रमण प्रश्न'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'In which direction does Earth spin on its axis?'
                : 'पृथ्वी आफ्नो अक्षमा कुन दिशाबाट कुन दिशातिर घुम्दछ?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleQuizAnswer('east_to_west')}
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
                {lang === 'en' ? 'East to West' : 'पूर्वबाट पश्चिम'}
              </button>

              <button
                onClick={() => handleQuizAnswer('west_to_east')}
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
                {lang === 'en' ? 'West to East' : 'पश्चिमबाट पूर्व'}
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

          {/* 6. Complete Planet Earth Lab Button */}
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
            <span>{lang === 'en' ? 'Complete Planet Earth Lab & Quiz' : 'पृथ्वी प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
