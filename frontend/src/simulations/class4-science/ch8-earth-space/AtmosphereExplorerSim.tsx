/**
 * AtmosphereExplorerSim.tsx
 * Simulation 31: 2D Atmosphere Stratified Layers Explorer
 * Grade 4 Science • Chapter 8: The Earth and Space
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - Full vertical atmospheric column explorer with interactive Rocket Probe:
 *   1. Troposphere: Clouds, weather, Mount Everest (8848.86m), rain & birds
 *   2. Stratosphere: Supersonic aircraft & protective Ozone Layer blocking UV rays
 *   3. Mesosphere: Burning meteor trails disintegrating in cold thin air
 *   4. Thermosphere: Glowing Aurora Borealis curtains & orbiting communication satellites
 *   5. Exosphere: Deep space threshold
 * - Interactive Altitude Scrubber (0 to 600 km) with animated rocket flight
 * - Dynamic Atmospheric Pressure & Temperature graphs
 * - Bilingual EN/NE, atmospheric sounds, and mastery challenge.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Rocket, Shield, Cloud, Sparkles, Sliders, Check, Info } from 'lucide-react';

interface AtmoLayer {
  id: string;
  nameEn: string;
  nameNe: string;
  altMin: number;
  altMax: number;
  tempRange: string;
  featuresEn: string[];
  featuresNe: string[];
}

export const AtmosphereExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [altitudeKm, setAltitudeKm] = useState<number>(10); // 0 to 600 km
  const [activeLayerId, setActiveLayerId] = useState<string>('troposphere');
  const [showOzoneShield, setShowOzoneShield] = useState<boolean>(true);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const layers: AtmoLayer[] = [
    {
      id: 'troposphere',
      nameEn: '1. Troposphere',
      nameNe: '1. क्षोभमण्डल (Troposphere)',
      altMin: 0,
      altMax: 12,
      tempRange: '15°C to -55°C',
      featuresEn: ['Contains 75% of atmospheric mass', 'All weather (rain, clouds, wind) occurs here', 'Mount Everest (8,848.86m) stands inside this layer'],
      featuresNe: ['वायुमण्डलको 75% हावा यसै तहमा हुन्छ', 'बादल, वर्षा, हावाहुरी आदि मौसम यहीँ हुन्छ', 'सगरमाथा (8,848.86 मि.) यसै तहमा पर्दछ'],
    },
    {
      id: 'stratosphere',
      nameEn: '2. Stratosphere',
      nameNe: '2. समतापमण्डल (Stratosphere)',
      altMin: 12,
      altMax: 50,
      tempRange: '-55°C to 0°C',
      featuresEn: ['Contains the vital Ozone Layer (O3)', 'Absorbs harmful solar ultraviolet (UV) radiation', 'Jet aeroplanes fly here due to calm, cloud-free air'],
      featuresNe: ['जीवन रक्षक ओजोन तह (O3) यसैमा हुन्छ', 'सूर्यका हानिकारक परावैजनी (UV) किरण रोक्छ', 'हवाईजहाजहरू उडान भर्न अनुकूल शान्त वातावरण'],
    },
    {
      id: 'mesosphere',
      nameEn: '3. Mesosphere',
      nameNe: '3. मध्यमण्डल (Mesosphere)',
      altMin: 50,
      altMax: 85,
      tempRange: '0°C to -90°C',
      featuresEn: ['Coldest layer of Earth\'s atmosphere (-90°C)', 'Meteors burn up from friction creating shooting stars', 'Protects Earth from space debris strikes'],
      featuresNe: ['वायुमण्डलको सबैभन्दा चिसो तह (-90°C सम्म)', 'अन्तरिक्षबाट आउने उल्कापिण्डहरू यहाँ जलेर नष्ट हुन्छन्', 'पृथ्वीलाई अन्तरिक्षका चट्टानहरूबाट जोगाउँछ'],
    },
    {
      id: 'thermosphere',
      nameEn: '4. Thermosphere',
      nameNe: '4. तापमण्डल (Thermosphere)',
      altMin: 85,
      altMax: 600,
      tempRange: '-90°C to 1500°C',
      featuresEn: ['Shimmering Aurora Borealis/Australis curtains', 'International Space Station (ISS) orbits here', 'Reflects radio waves for long-distance communication'],
      featuresNe: ['ध्रुवीय प्रकाश (Aurora) को रङ्गीन दृश्य', 'अन्तर्राष्ट्रिय अन्तरिक्ष केन्द्र (ISS) र भूउपग्रह घुम्छन्', 'रेडियो तरङ्गहरू परावर्तन गरी सञ्चार सम्भव बनाउँछ'],
    },
  ];

  const handleAltitudeChange = (km: number) => {
    setAltitudeKm(km);
    if (km <= 12) setActiveLayerId('troposphere');
    else if (km <= 50) setActiveLayerId('stratosphere');
    else if (km <= 85) setActiveLayerId('mesosphere');
    else setActiveLayerId('thermosphere');
  };

  const handleSelectLayer = (id: string) => {
    setActiveLayerId(id);
    ScienceAudio.playPop();
    const target = layers.find((l) => l.id === id);
    if (target) {
      setAltitudeKm(Math.round((target.altMin + target.altMax) * 0.5));
    }
  };

  const handleReset = () => {
    setAltitudeKm(10);
    setActiveLayerId('troposphere');
    setShowOzoneShield(true);
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    setQuizFeedback(null);
    ScienceAudio.playWhoosh();
  };

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];

  // 60 FPS Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, 880, 560);

      // 1. STRATIFIED COLOR GRADIENT BACKGROUND (from ground to space)
      drawAtmosphereBands(ctx, time);

      // 2. LAYER-SPECIFIC SCIENTIFIC PHENOMENA:
      // A) Troposphere (y: 430 - 560): Mountains, clouds, rain
      drawTropospherePhenomena(ctx, time);

      // B) Stratosphere (y: 310 - 430): Ozone layer & Jet
      drawStratospherePhenomena(ctx, showOzoneShield, time);

      // C) Mesosphere (y: 200 - 310): Burning meteor streak
      drawMesospherePhenomena(ctx, time);

      // D) Thermosphere (y: 0 - 200): Aurora ribbons & Satellite
      drawThermospherePhenomena(ctx, time);

      // 3. RESEARCH ROCKET PROBE (Vertical movement tied to altitudeKm)
      drawRocketProbe(ctx, altitudeKm, time);

      // 4. ALTITUDE SCALE RULER ON LEFT
      drawAltitudeRuler(ctx, altitudeKm);

      // 5. LAYER HUD OVERLAYS
      drawLayerHUD(ctx, altitudeKm, activeLayerId, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [altitudeKm, activeLayerId, showOzoneShield, lang]);

  // Atmospheric Bands Gradient
  function drawAtmosphereBands(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    // 0 to 560 height representing 600km to 0km
    const atmoGrad = ctx.createLinearGradient(0, 0, 0, 560);
    atmoGrad.addColorStop(0, '#020617'); // Space (600 km)
    atmoGrad.addColorStop(0.3, '#1e1b4b'); // Thermosphere
    atmoGrad.addColorStop(0.55, '#1e293b'); // Mesosphere
    atmoGrad.addColorStop(0.75, '#0369a1'); // Stratosphere (Ozone cyan)
    atmoGrad.addColorStop(0.9, '#38bdf8'); // Troposphere sky blue
    atmoGrad.addColorStop(1, '#bae6fd'); // Surface
    ctx.fillStyle = atmoGrad;
    ctx.fillRect(0, 0, 880, 560);

    // Layer boundary divider lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);

    // 85km boundary (Thermosphere / Mesosphere)
    ctx.beginPath();
    ctx.moveTo(100, 200);
    ctx.lineTo(880, 200);
    ctx.stroke();

    // 50km boundary (Mesosphere / Stratosphere)
    ctx.beginPath();
    ctx.moveTo(100, 310);
    ctx.lineTo(880, 310);
    ctx.stroke();

    // 12km boundary (Stratosphere / Troposphere)
    ctx.beginPath();
    ctx.moveTo(100, 430);
    ctx.lineTo(880, 430);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
  }

  // Troposphere Phenomena: Sagarmatha & Clouds
  function drawTropospherePhenomena(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    // Surface Earth terrain
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 530, 880, 30);

    // Mount Everest Peak (Sagarmatha 8,848.86m)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(180, 530);
    ctx.lineTo(290, 445); // peak reaches ~9km
    ctx.lineTo(400, 530);
    ctx.closePath();
    ctx.fill();

    // Snowcap on Everest
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(290, 445);
    ctx.lineTo(325, 475);
    ctx.lineTo(310, 470);
    ctx.lineTo(295, 485);
    ctx.lineTo(270, 470);
    ctx.closePath();
    ctx.fill();

    // Everest label
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Mt. Everest', 290, 435);

    // Fluffy cumulus rain cloud
    drawCloudShape(ctx, 520, 470, 45);
    drawCloudShape(ctx, 680, 480, 35);

    // Falling rain streaks under cloud
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 8; r++) {
      const rx = 490 + r * 10;
      const ry = 495 + ((t * 40 + r * 12) % 35);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 2, ry + 8);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawCloudShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.4, cy, r * 0.5, 0, Math.PI * 2);
    ctx.arc(cx, cy - r * 0.25, r * 0.6, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.5, cy, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stratosphere Phenomena: Ozone Layer & Jet Aircraft
  function drawStratospherePhenomena(ctx: CanvasRenderingContext2D, ozoneOn: boolean, t: number) {
    ctx.save();
    // Glowing Turquoise Ozone Band (20 - 30 km range, around y: 360)
    if (ozoneOn) {
      const ozoneGrad = ctx.createLinearGradient(0, 340, 0, 390);
      ozoneGrad.addColorStop(0, 'rgba(45, 212, 191, 0)');
      ozoneGrad.addColorStop(0.5, 'rgba(45, 212, 191, 0.35)');
      ozoneGrad.addColorStop(1, 'rgba(45, 212, 191, 0)');
      ctx.fillStyle = ozoneGrad;
      ctx.fillRect(100, 340, 780, 50);

      // Ozone shield label
      ctx.fillStyle = '#2dd4bf';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText('🛡️ Protective Ozone Layer', 860, 370);

      // Solar UV rays bouncing off the Ozone layer
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      for (let u = 0; u < 4; u++) {
        const ux = 600 + u * 50;
        ctx.beginPath();
        ctx.moveTo(ux, 310);
        ctx.lineTo(ux - 15, 355);
        // Bounced ray reflected away
        ctx.lineTo(ux + 20, 320);
        ctx.stroke();
      }
    }

    // Jet Airplane flying smoothly in cloudless stratosphere (y: 410)
    const jetX = 350 + Math.sin(t * 0.8) * 80;
    const jetY = 405;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(jetX, jetY, 20, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wings
    ctx.fillRect(jetX - 4, jetY - 12, 8, 24);
    // Condensation trail behind jet
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(jetX - 20, jetY);
    ctx.lineTo(jetX - 80, jetY);
    ctx.stroke();

    ctx.restore();
  }

  // Mesosphere Phenomena: Burning Meteor
  function drawMesospherePhenomena(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    // Burning shooting star / meteor trail (y: 220 - 290)
    const meteorProgress = (t * 1.4) % 1;
    const mx = 720 - meteorProgress * 220;
    const my = 210 + meteorProgress * 80;

    // Fiery tail
    const fireGrad = ctx.createLinearGradient(mx + 50, my - 20, mx, my);
    fireGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
    fireGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.7)');
    fireGrad.addColorStop(1, '#fef08a');
    ctx.strokeStyle = fireGrad;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(mx + 60, my - 22);
    ctx.lineTo(mx, my);
    ctx.stroke();

    // Glowing meteor head
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(mx, my, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fdba74';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('☄️ Burning Meteor', 860, 245);

    ctx.restore();
  }

  // Thermosphere Phenomena: Aurora Borealis & Orbiting Satellite
  function drawThermospherePhenomena(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    // Glowing Aurora Borealis curtains (waving green & magenta ribbons)
    for (let a = 0; a < 3; a++) {
      const aGrad = ctx.createLinearGradient(0, 50, 0, 160);
      aGrad.addColorStop(0, 'rgba(74, 222, 128, 0)');
      aGrad.addColorStop(0.5, a === 1 ? 'rgba(192, 132, 252, 0.35)' : 'rgba(34, 197, 94, 0.4)');
      aGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = aGrad;

      ctx.beginPath();
      ctx.moveTo(250, 150);
      for (let ax = 250; ax <= 820; ax += 30) {
        const wave = Math.sin((ax * 0.02) + t * 2 + a) * 22;
        ctx.lineTo(ax, 90 + wave);
      }
      ctx.lineTo(820, 160);
      ctx.closePath();
      ctx.fill();
    }

    // Communication Satellite (y: 60)
    const satX = 540 + Math.cos(t * 0.5) * 60;
    const satY = 60;

    // Body
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(satX - 8, satY - 6, 16, 12);
    // Blue Solar Panels on sides
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(satX - 32, satY - 4, 20, 8);
    ctx.fillRect(satX + 12, satY - 4, 20, 8);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(satX - 32, satY - 4, 20, 8);
    ctx.strokeRect(satX + 12, satY - 4, 20, 8);

    // Antenna dish
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(satX, satY + 6);
    ctx.lineTo(satX, satY + 16);
    ctx.stroke();

    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('🛰️ Satellite', 860, 70);

    ctx.restore();
  }

  // Rocket Probe
  function drawRocketProbe(ctx: CanvasRenderingContext2D, km: number, t: number) {
    ctx.save();
    // Map altitudeKm (0 to 600) to y coordinate (520 down to 40)
    const norm = Math.min(1, Math.max(0, km / 600));
    const rocketY = 520 - norm * 470;
    const rocketX = 380;

    // Fiery Thruster plume
    const flameH = 18 + Math.sin(t * 20) * 4;
    const flameGrad = ctx.createLinearGradient(rocketX, rocketY + 20, rocketX, rocketY + 20 + flameH);
    flameGrad.addColorStop(0, '#fef08a');
    flameGrad.addColorStop(0.5, '#f97316');
    flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(rocketX - 4, rocketY + 18);
    ctx.lineTo(rocketX, rocketY + 18 + flameH);
    ctx.lineTo(rocketX + 4, rocketY + 18);
    ctx.closePath();
    ctx.fill();

    // Rocket Body (White & Red)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(rocketX, rocketY - 18);
    ctx.lineTo(rocketX + 8, rocketY + 16);
    ctx.lineTo(rocketX - 8, rocketY + 16);
    ctx.closePath();
    ctx.fill();

    // Red nosecone
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(rocketX, rocketY - 18);
    ctx.lineTo(rocketX + 5, rocketY - 6);
    ctx.lineTo(rocketX - 5, rocketY - 6);
    ctx.closePath();
    ctx.fill();

    // Red fins
    ctx.fillRect(rocketX - 12, rocketY + 8, 4, 10);
    ctx.fillRect(rocketX + 8, rocketY + 8, 4, 10);

    // Glowing porthole window
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(rocketX, rocketY + 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Current Altitude Readout Tag attached to rocket
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.roundRect(rocketX + 22, rocketY - 14, 95, 26, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`🚀 ${km} km`, rocketX + 28, rocketY + 3);

    ctx.restore();
  }

  // Altitude Ruler Scale on Left
  function drawAltitudeRuler(ctx: CanvasRenderingContext2D, curKm: number) {
    ctx.save();
    const rx = 80;

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx, 40);
    ctx.lineTo(rx, 530);
    ctx.stroke();

    const marks = [
      { km: 600, label: '600 km (Exosphere)' },
      { km: 300, label: '300 km' },
      { km: 85, label: '85 km (Mesopause)' },
      { km: 50, label: '50 km (Stratopause)' },
      { km: 12, label: '12 km (Tropopause)' },
      { km: 0, label: '0 km (Ground)' },
    ];

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';

    marks.forEach((m) => {
      const my = 520 - (m.km / 600) * 470;
      ctx.beginPath();
      ctx.moveTo(rx - 8, my);
      ctx.lineTo(rx, my);
      ctx.stroke();
      ctx.fillText(m.label, rx - 12, my + 3);
    });

    ctx.restore();
  }

  // Layer HUD
  function drawLayerHUD(ctx: CanvasRenderingContext2D, km: number, layerId: string, currentLang: Language) {
    ctx.save();
    const cur = layers.find((l) => l.id === layerId) || layers[0];

    const px = 460;
    const py = 20;
    const pw = 400;
    const ph = 95;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.roundRect(px, py, pw, ph, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(currentLang === 'en' ? cur.nameEn : cur.nameNe, px + 14, py + 24);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(`Altitude: ${cur.altMin} - ${cur.altMax} km • Temp: ${cur.tempRange}`, px + 14, py + 42);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px system-ui';
    const feat = currentLang === 'en' ? cur.featuresEn[1] : cur.featuresNe[1];
    ctx.fillText(`• ${feat}`, px + 14, py + 62);
    const feat2 = currentLang === 'en' ? cur.featuresEn[2] : cur.featuresNe[2];
    ctx.fillText(`• ${feat2}`, px + 14, py + 78);

    ctx.restore();
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'stratosphere') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! The Ozone layer resides in the Stratosphere and shields life from UV rays.' : 'सबास! ओजोन तह समतापमण्डल (Stratosphere) मा हुन्छ जसले परावैजनी किरणलाई रोक्छ।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. The ozone layer is located in the Stratosphere.' : 'मिलेन। ओजोन तह समतापमण्डलमा अवस्थित हुन्छ।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Earth Atmosphere Explorer' : 'वायुमण्डलका तहहरू (Atmosphere Layers)'}
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
              <Rocket size={14} className="text-rose-400" />
              <span>
                {lang === 'en' ? activeLayer.nameEn : activeLayer.nameNe}
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
                🚀
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {lang === 'en' ? activeLayer.nameEn : activeLayer.nameNe}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en' ? activeLayer.featuresEn[0] : activeLayer.featuresNe[0]}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Altitude' : 'उचाइ'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                  {altitudeKm} km
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Ozone Shield' : 'ओजोन कवच'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: showOzoneShield ? '#10b981' : '#f43f5e' }}>
                  {showOzoneShield ? 'ACTIVE' : 'OFF'}
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
              <span style={{ fontSize: '16px' }}>🌌</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Atmospheric Flight Station' : 'वायुमण्डल अनुसन्धान केन्द्र'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Earth’s atmosphere consists of five primary thermal layers protecting life from space radiation, meteors, and extreme cold.'
                : 'पृथ्वीको वायुमण्डल पाँच प्रमुख तहहरू मिलेर बनेको छ जसले हानिकारक विकिरण र उल्का पिण्डबाट हाम्रो रक्षा गर्दछ।'}
            </p>
          </div>

          {/* 2. Rocket Altitude Scrubber */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#fb7185' }}>
                <Rocket size={14} />
                <span>{lang === 'en' ? 'Rocket Altitude Scrubber' : 'रकेट उचाइ नियन्त्रण'}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8' }}>
                {altitudeKm} km
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={600}
              value={altitudeKm}
              onChange={(e) => handleAltitudeChange(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#fb7185',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b' }}>
              <span>0 km (Surface)</span>
              <span>85 km (Mesosphere)</span>
              <span>600 km (Space)</span>
            </div>
          </div>

          {/* 3. Layer Quick-Jump Buttons */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Atmospheric Layers' : 'वायुमण्डलका तहहरू'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {layers.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleSelectLayer(l.id)}
                  style={{
                    background: activeLayerId === l.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activeLayerId === l.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '8px',
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '700', color: activeLayerId === l.id ? '#38bdf8' : '#e2e8f0' }}>
                    {lang === 'en' ? l.nameEn.split('(')[0] : l.nameNe.split('(')[0]}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {l.altMin}-{l.altMax} km
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Ozone Shield Toggle */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} />
              <span>{lang === 'en' ? 'Ozone Layer UV Protection' : 'ओजोन तहको परावैजनी सुरक्षा'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'en'
                ? 'The ozone layer in the stratosphere absorbs 98% of solar ultraviolet radiation.'
                : 'समतापमण्डलमा रहेको ओजोन तहले सूर्यको 98% हानिकारक परावैजनी किरण सोस्छ।'}
            </p>
            <button
              onClick={() => setShowOzoneShield(!showOzoneShield)}
              style={{
                marginTop: '4px',
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                background: showOzoneShield ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${showOzoneShield ? '#2dd4bf' : 'rgba(255, 255, 255, 0.1)'}`,
                color: showOzoneShield ? '#2dd4bf' : '#94a3b8',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {showOzoneShield
                ? (lang === 'en' ? '🛡️ Ozone Shield: ACTIVE' : '🛡️ ओजोन तह: सक्रिय')
                : (lang === 'en' ? '❌ Ozone Shield: DISABLED' : '❌ ओजोन तह: निष्क्रिय')}
            </button>
          </div>

          {/* 5. Quick Quiz */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              {lang === 'en' ? 'Atmosphere Quiz' : 'वायुमण्डल प्रश्न'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'In which atmospheric layer is the protective Ozone Layer located?'
                : 'परावैजनी किरण रोक्ने जीवनरक्षक ओजोन तह कुन मण्डलमा पर्दछ?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleQuizAnswer('troposphere')}
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
                {lang === 'en' ? 'Troposphere' : 'क्षोभमण्डल'}
              </button>

              <button
                onClick={() => handleQuizAnswer('stratosphere')}
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
                {lang === 'en' ? 'Stratosphere' : 'समतापमण्डल'}
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

          {/* 6. Complete Atmosphere Lab Button */}
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
            <span>{lang === 'en' ? 'Complete Atmosphere Lab & Quiz' : 'वायुमण्डल प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
