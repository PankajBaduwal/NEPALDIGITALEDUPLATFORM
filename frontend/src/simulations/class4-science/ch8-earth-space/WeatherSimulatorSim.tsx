/**
 * WeatherSimulatorSim.tsx
 * Simulation 32: 2D Weather Simulator & Climate Adaptation Lab (मौसम सिम्युलेटर)
 * Grade 4 Science • Chapter 8: The Earth and Space (पृथ्वी र अन्तरिक्ष)
 *
 * 100% NATIVE 2D CANVAS & VECTOR ANIMATED SIMULATION
 * Features:
 * - Dynamic Nepali valley landscape with traditional cottage and swaying pine trees
 * - 4 Rich weather systems:
 *   1. Sunny (घाम लागेको): Radiant sun, clear sky, children flying kites, cotton clothing
 *   2. Rainy / Monsoon (झरी परेको): Dark storm clouds, animated rain streaks, puddle ripples, umbrellas
 *   3. Snowy (हिउँ परेको): Alpine frost, drifting snowflakes accumulating on cottage roof, woolen clothes
 *   4. Windy (हावाहुरी): Wind streaks, swaying tree branches, soaring colorful Nepali kite (चङ्गा)
 * - Interactive sliders: Temperature, Humidity, and Wind velocity
 * - Lifestyle & Clothing adaptation guidance, Bilingual EN/NE, and mastery quiz.
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets, Sparkles, Check, RotateCcw, Shirt } from 'lucide-react';

type WeatherPreset = 'sunny' | 'rainy' | 'snowy' | 'windy';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export const WeatherSimulatorSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [preset, setPreset] = useState<WeatherPreset>('sunny');
  const [tempCelsius, setTempCelsius] = useState<number>(26);
  const [humidity, setHumidity] = useState<number>(40);
  const [windSpeed, setWindSpeed] = useState<number>(20);
  const [exploredPresets, setExploredPresets] = useState<Record<string, boolean>>({ sunny: true });
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize weather particles
  useEffect(() => {
    const pList: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      pList.push({
        x: Math.random() * 880,
        y: Math.random() * 560,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 5,
        size: 2 + Math.random() * 3,
        alpha: 0.5 + Math.random() * 0.5,
      });
    }
    particlesRef.current = pList;
  }, []);

  const handleSelectPreset = (p: WeatherPreset) => {
    setPreset(p);
    ScienceAudio.playPop();

    if (p === 'sunny') {
      setTempCelsius(28);
      setHumidity(35);
      setWindSpeed(15);
    } else if (p === 'rainy') {
      setTempCelsius(19);
      setHumidity(90);
      setWindSpeed(30);
      ScienceAudio.playWaterDrop();
    } else if (p === 'snowy') {
      setTempCelsius(-4);
      setHumidity(70);
      setWindSpeed(10);
    } else if (p === 'windy') {
      setTempCelsius(18);
      setHumidity(45);
      setWindSpeed(65);
    }

    const updated = { ...exploredPresets, [p]: true };
    setExploredPresets(updated);
    const count = Object.keys(updated).length;
    setStars(Math.min(3, count));
    if (count >= 4) {
      setIsCompleted(true);
      setStage('understand');
    }
  };

  const handleReset = () => {
    setPreset('sunny');
    setTempCelsius(26);
    setHumidity(40);
    setWindSpeed(20);
    setExploredPresets({ sunny: true });
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
      ctx.clearRect(0, 0, 880, 560);

      // 1. SKY & MOUNTAIN BACKGROUND BASED ON PRESET
      drawWeatherSkyAndLandscape(ctx, preset, time);

      // 2. NEPALI COTTAGE & FLORA
      drawNepaliCottageAndTrees(ctx, preset, windSpeed, time);

      // 3. WEATHER PHENOMENA PARTICLES (Rain, Snow, Wind, Sunbeams)
      drawWeatherParticles(ctx, preset, windSpeed, time);

      // 4. FLYING KITE IN WINDY MODE
      if (preset === 'windy') {
        drawFlyingKite(ctx, time, windSpeed);
      }

      // 5. WEATHER & CLOTHING HUD OVERLAY
      drawWeatherHUD(ctx, preset, tempCelsius, humidity, windSpeed, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [preset, tempCelsius, humidity, windSpeed, lang]);

  // Weather Sky & Hills
  function drawWeatherSkyAndLandscape(ctx: CanvasRenderingContext2D, p: WeatherPreset, t: number) {
    ctx.save();
    const sky = ctx.createLinearGradient(0, 0, 0, 420);

    if (p === 'sunny') {
      sky.addColorStop(0, '#0284c7');
      sky.addColorStop(0.6, '#38bdf8');
      sky.addColorStop(1, '#bae6fd');
    } else if (p === 'rainy') {
      sky.addColorStop(0, '#334155');
      sky.addColorStop(0.7, '#64748b');
      sky.addColorStop(1, '#94a3b8');
    } else if (p === 'snowy') {
      sky.addColorStop(0, '#475569');
      sky.addColorStop(0.7, '#94a3b8');
      sky.addColorStop(1, '#e2e8f0');
    } else {
      // Windy
      sky.addColorStop(0, '#0369a1');
      sky.addColorStop(0.7, '#60a5fa');
      sky.addColorStop(1, '#cbd5e1');
    }

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 880, 560);

    // Radiant Sun in Sunny mode
    if (p === 'sunny') {
      const sunGrad = ctx.createRadialGradient(720, 80, 10, 720, 80, 80);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      sunGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.4)');
      sunGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(720, 80, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(720, 80, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant Hills
    ctx.fillStyle = p === 'snowy' ? '#94a3b8' : '#15803d';
    ctx.beginPath();
    ctx.moveTo(0, 310);
    ctx.bezierCurveTo(240, 240, 540, 290, 880, 260);
    ctx.lineTo(880, 440);
    ctx.lineTo(0, 440);
    ctx.closePath();
    ctx.fill();

    // Foreground Slope / Valley
    const valleyGrad = ctx.createLinearGradient(0, 360, 0, 560);
    if (p === 'snowy') {
      valleyGrad.addColorStop(0, '#e2e8f0');
      valleyGrad.addColorStop(1, '#cbd5e1'); // Snow blanketed ground
    } else {
      valleyGrad.addColorStop(0, '#22c55e');
      valleyGrad.addColorStop(1, '#15803d');
    }
    ctx.fillStyle = valleyGrad;
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.bezierCurveTo(280, 360, 600, 410, 880, 380);
    ctx.lineTo(880, 560);
    ctx.lineTo(0, 560);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Nepali Cottage & Swaying Pine Trees
  function drawNepaliCottageAndTrees(
    ctx: CanvasRenderingContext2D,
    p: WeatherPreset,
    wind: number,
    t: number
  ) {
    ctx.save();
    // Swaying Pine Tree on Left
    const sway = Math.sin(t * (wind * 0.1)) * (wind * 0.18);
    const treeX = 140;
    const treeY = 430;

    // Trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(treeX - 8, treeY - 80, 16, 80);

    // Pine Foliage with wind bend
    ctx.fillStyle = p === 'snowy' ? '#e2e8f0' : '#166534';
    for (let tier = 0; tier < 3; tier++) {
      const ty = treeY - 80 - tier * 35;
      const tw = 45 - tier * 8;
      ctx.beginPath();
      ctx.moveTo(treeX + sway * (tier + 1), ty - 35);
      ctx.lineTo(treeX + tw + sway * tier, ty);
      ctx.lineTo(treeX - tw + sway * tier, ty);
      ctx.closePath();
      ctx.fill();
    }

    // Traditional Nepali Cottage (x: 480, y: 340)
    const hx = 480;
    const hy = 340;
    const hw = 160;
    const hh = 110;

    // Stone / Clay House Body
    ctx.fillStyle = '#92400e';
    ctx.fillRect(hx, hy, hw, hh);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.strokeRect(hx, hy, hw, hh);

    // Wooden Door
    ctx.fillStyle = '#451a03';
    ctx.fillRect(hx + 65, hy + 45, 30, 65);

    // Windows
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(hx + 20, hy + 30, 26, 26);
    ctx.fillRect(hx + 115, hy + 30, 26, 26);
    ctx.strokeStyle = '#451a03';
    ctx.strokeRect(hx + 20, hy + 30, 26, 26);
    ctx.strokeRect(hx + 115, hy + 30, 26, 26);

    // Sloped Red Clay Tile Roof (or Snow covered)
    ctx.fillStyle = p === 'snowy' ? '#f8fafc' : '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(hx - 25, hy);
    ctx.lineTo(hx + hw * 0.5, hy - 55);
    ctx.lineTo(hx + hw + 25, hy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // Weather Particles
  function drawWeatherParticles(
    ctx: CanvasRenderingContext2D,
    p: WeatherPreset,
    wind: number,
    t: number
  ) {
    ctx.save();
    const parts = particlesRef.current;

    if (p === 'rainy') {
      // Fast Rain streaks
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 1.8;
      parts.forEach((pt) => {
        pt.y += pt.vy * 2.2;
        pt.x += (wind * 0.1);
        if (pt.y > 560) { pt.y = -20; pt.x = Math.random() * 880; }

        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x + (wind * 0.15), pt.y + 14);
        ctx.stroke();
      });

      // Puddle splashes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      for (let s = 0; s < 6; s++) {
        const sx = 220 + (s * 85);
        const sy = 480 + (s % 3) * 15;
        const r = ((t * 20 + s * 10) % 15);
        ctx.beginPath();
        ctx.ellipse(sx, sy, r * 1.5, r * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (p === 'snowy') {
      // Gentle floating snowflakes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      parts.forEach((pt) => {
        pt.y += pt.vy * 0.45;
        pt.x += Math.sin(t * 2 + pt.y * 0.05) * 1.5 + (wind * 0.05);
        if (pt.y > 560) { pt.y = -10; pt.x = Math.random() * 880; }

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (p === 'windy') {
      // Horizontal wind gusts & blowing autumn leaves
      ctx.fillStyle = '#ea580c'; // Orange leaves
      parts.forEach((pt) => {
        pt.x += pt.vy * 2.5 + (wind * 0.2);
        pt.y += Math.sin(t * 3 + pt.x * 0.02) * 2;
        if (pt.x > 880) { pt.x = -20; pt.y = 100 + Math.random() * 400; }

        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, 4, 2, pt.x * 0.05, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  // Flying Nepali Kite (चङ्गा) in Windy mode
  function drawFlyingKite(ctx: CanvasRenderingContext2D, t: number, wind: number) {
    ctx.save();
    const kx = 680 + Math.sin(t * 2) * 35;
    const ky = 150 + Math.cos(t * 2.5) * 20;

    // String from ground
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(340, 480);
    ctx.quadraticCurveTo(500, 320, kx, ky);
    ctx.stroke();

    // Diamond Diamond Kite
    ctx.save();
    ctx.translate(kx, ky);
    ctx.rotate(Math.sin(t * 3) * 0.25);

    // Left Half (Red)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(-20, 0);
    ctx.lineTo(0, 22);
    ctx.closePath();
    ctx.fill();

    // Right Half (Yellow)
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, 22);
    ctx.closePath();
    ctx.fill();

    // Bamboo cross struts
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(0, 22);
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();

    // Kite Ribbon Tail
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.bezierCurveTo(Math.sin(t * 5) * 20, 45, Math.cos(t * 5) * 20, 70, 0, 90);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  // Weather & Clothing HUD
  function drawWeatherHUD(
    ctx: CanvasRenderingContext2D,
    p: WeatherPreset,
    temp: number,
    hum: number,
    wind: number,
    currentLang: Language
  ) {
    ctx.save();
    const px = 20;
    const py = 20;
    const pw = 420;
    const ph = 95;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = p === 'sunny' ? '#facc15' : p === 'rainy' ? '#38bdf8' : p === 'snowy' ? '#e2e8f0' : '#4ade80';
    ctx.lineWidth = 2;
    ctx.roundRect(px, py, pw, ph, 10);
    ctx.fill();
    ctx.stroke();

    let title = '';
    let clothing = '';
    if (p === 'sunny') {
      title = currentLang === 'en' ? '☀️ Sunny Weather (घाम लागेको)' : '☀️ घाम लागेको दिन (Sunny)';
      clothing = currentLang === 'en' ? 'Wear: Light cotton clothes, sunhat & drink water' : 'सुतीको कपडा, टोपी लगाउने र प्रशस्त पानी पिउने';
    } else if (p === 'rainy') {
      title = currentLang === 'en' ? '🌧️ Rainy Monsoon (झरी परेको)' : '🌧️ झरी परेको दिन (Monsoon Rain)';
      clothing = currentLang === 'en' ? 'Use: Umbrella (छाता), raincoat & waterproof boots' : 'छाता, रेनकोट र वाटरप्रूफ जुत्ता प्रयोग गर्ने';
    } else if (p === 'snowy') {
      title = currentLang === 'en' ? '❄️ Snowy Alpine (हिमपात)' : '❄️ हिउँ परेको दिन (Snowfall)';
      clothing = currentLang === 'en' ? 'Wear: Heavy woolen jacket, gloves & warm socks' : 'बाक्लो ऊनीको ज्याकेट, पन्जा र तातो कपडा लगाउने';
    } else {
      title = currentLang === 'en' ? '💨 Windy Gale (हावाहुरी)' : '💨 तीव्र बतास चलेको दिन (Windy)';
      clothing = currentLang === 'en' ? 'Fun: Great weather for flying kites (चङ्गा उडाउन)' : 'चङ्गा उडाउन अनुकूल, आँखामा धुलोबाट बच्ने';
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(title, px + 14, py + 24);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(`Temp: ${temp}°C • Humidity: ${hum}% • Wind: ${wind} km/h`, px + 14, py + 44);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px system-ui';
    ctx.fillText(`👕 ${clothing}`, px + 14, py + 66);

    ctx.restore();
  }

  const handleQuizAnswer = (choice: string) => {
    if (choice === 'raincoat') {
      ScienceAudio.playSuccess();
      setQuizFeedback(lang === 'en' ? 'Correct! Umbrellas and raincoats protect us from monsoon rain.' : 'सबास! पानी परेको बेला छाता र रेनकोटले हामीलाई ओभानो राख्छ।');
      setStars(3);
      setIsCompleted(true);
      setStage('understand');
    } else {
      ScienceAudio.playBeep(220, 0.2);
      setQuizFeedback(lang === 'en' ? 'Incorrect. Choose the gear suited for rainy weather.' : 'मिलेन। वर्षाको समयमा छाता वा रेनकोट प्रयोग गरिन्छ।');
    }
  };

  return (
    <SimulationLayout
      title={lang === 'en' ? 'Weather Simulator & Lifestyle' : 'मौसम सिम्युलेटर र जनजीवन (Weather Simulator)'}
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
                border: '1px solid rgba(250, 204, 21, 0.3)',
                padding: '6px 14px',
                borderRadius: '10px',
                color: '#facc15',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sun size={14} className="text-amber-400" />
              <span>
                {preset === 'sunny'
                  ? (lang === 'en' ? 'Sunny Day: Clear Blue Skies' : 'घाम लागेको दिन: सफा आकाश')
                  : preset === 'rainy'
                  ? (lang === 'en' ? 'Monsoon Downpour: Heavy Rain Precipitation' : 'झरी परेको: अविरल वर्षा')
                  : preset === 'snowy'
                  ? (lang === 'en' ? 'Winter Snowfall: Freezing Flurries' : 'हिउँ परेको: चिसो मौसम')
                  : (lang === 'en' ? 'Gale Force Winds: High Atmospheric Pressure Gradient' : 'हावाहुरी: तीव्र वायु')}
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
                {preset === 'sunny' ? '☀️' : preset === 'rainy' ? '🌧️' : preset === 'snowy' ? '❄️' : '💨'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {lang === 'en' ? `Atmospheric Condition: ${preset.toUpperCase()}` : `वायुमण्डलीय अवस्था: ${preset}`}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'en'
                    ? `Temperature: ${tempCelsius}°C • Wind: ${windSpeed} km/h`
                    : `तापक्रम: ${tempCelsius}°C • हावाको गति: ${windSpeed} किमी/घण्टा`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Wind Speed' : 'हावाको गति'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                  {windSpeed} km/h
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'en' ? 'Temperature' : 'तापक्रम'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: tempCelsius > 25 ? '#f43f5e' : '#38bdf8' }}>
                  {tempCelsius}°C
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
              <span style={{ fontSize: '16px' }}>🌤️</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'en' ? 'Meteorology Station' : 'मौसम अनुसन्धान केन्द्र'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Weather is the day-to-day atmospheric condition of temperature, wind, humidity, sunshine, and precipitation.'
                : 'मौसम भनेको कुनै स्थानको वायुमण्डलको दैनिक अवस्था हो जसमा घाम, पानी, तापक्रम र हावा समावेश हुन्छन्।'}
            </p>
          </div>

          {/* 2. Weather Preset Buttons */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'en' ? 'Select Weather' : 'मौसमको अवस्था रोज्नुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { id: 'sunny', labelEn: 'Sunny Day', labelNe: 'घाम लागेको', icon: '☀️' },
                { id: 'rainy', labelEn: 'Rainy Monsoon', labelNe: 'झरी परेको', icon: '🌧️' },
                { id: 'snowy', labelEn: 'Snowfall', labelNe: 'हिउँ परेको', icon: '❄️' },
                { id: 'windy', labelEn: 'Windy Gale', labelNe: 'हावाहुरी', icon: '💨' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectPreset(item.id as WeatherPreset)}
                  style={{
                    background: preset === item.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${preset === item.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '10px',
                    padding: '10px 8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: preset === item.id ? '#38bdf8' : '#e2e8f0' }}>
                    {lang === 'en' ? item.labelEn : item.labelNe}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Parameter Adjusters (Temperature & Wind) */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#e2e8f0' }}>
                  {lang === 'en' ? 'Temperature' : 'तापक्रम'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: tempCelsius > 25 ? '#f43f5e' : '#38bdf8' }}>
                  {tempCelsius}°C
                </span>
              </div>
              <input
                type="range"
                min={-10}
                max={40}
                value={tempCelsius}
                onChange={(e) => setTempCelsius(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: tempCelsius > 25 ? '#f43f5e' : '#38bdf8',
                  cursor: 'pointer',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#e2e8f0' }}>
                  {lang === 'en' ? 'Wind Speed' : 'हावाको गति'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#facc15' }}>
                  {windSpeed} km/h
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#facc15',
                  cursor: 'pointer',
                }}
              />
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
              {lang === 'en' ? 'Weather Adaptation Quiz' : 'मौसम अनुकूलता प्रश्न'}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748b' }}>
              {lang === 'en'
                ? 'What do we use to protect ourselves when going outside during heavy monsoon rain?'
                : 'वर्षायाममा झरी परेको बेला पानीबाट बच्न हामी के प्रयोग गर्दछौं?'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleQuizAnswer('sunglasses')}
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
                {lang === 'en' ? 'Sunglasses' : 'धूप चस्मा'}
              </button>

              <button
                onClick={() => handleQuizAnswer('raincoat')}
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
                {lang === 'en' ? 'Raincoat / Umbrella' : 'रेनकोट वा छाता'}
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

          {/* 5. Curriculum Key Takeaway Card */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', marginBottom: '4px' }}>
              ℹ️ {lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रम निष्कर्ष'}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.45' }}>
              {lang === 'en'
                ? 'Weather changes rapidly from day to day and determines what clothes we wear, what crops farmers plant, and our outdoor activities.'
                : 'मौसम छिटो-छिटो परिवर्तन भइरहन्छ र यसले हाम्रो पहिरन, खानपान, कृषि र दैनिक क्रियाकलापमा प्रत्यक्ष असर गर्छ।'}
            </p>
          </div>

          {/* 6. Complete Weather Simulator Lab Button */}
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
            <span>{lang === 'en' ? 'Complete Weather Lab & Quiz' : 'मौसम प्रयोगशाला पूरा गर्नुहोस्'}</span>
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
