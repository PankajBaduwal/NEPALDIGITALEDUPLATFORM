/**
 * SoilConservationLabSim.tsx
 * Simulation 45: 2D Soil Conservation & Erosion Laboratory
 * Grade 6 Science • Unit 11: Earth and Space
 *
 * Full 2D Comparative Hillside Erosion Experiment:
 * 1. 3 Slopes subjected to simulated torrential monsoon rainfall:
 *    - Slope A: Bare Deforested Slope -> 90% soil loss, mudslide
 *    - Slope B: Terraced Farming Slope -> Moderate runoff, terraces slow water
 *    - Slope C: Dense Forest Cover -> Tree canopy & roots prevent erosion (< 5% runoff)
 * 2. Real-time collection beakers measuring eroded sediment weight & runoff clarity
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { CloudRain, Trees, ShieldAlert, Sparkles, Play, RotateCcw, CheckCircle2 } from 'lucide-react';

type SlopeType = 'bare' | 'terraced' | 'forested';

export const SoilConservationLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Experiment State
  const [activeSlope, setActiveSlope] = useState<SlopeType>('terraced');
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const [rainDurationSec, setRainDurationSec] = useState<number>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Sediment calculations based on slope type:
  const sedimentMultiplier = activeSlope === 'bare' ? 8.5 : activeSlope === 'terraced' ? 2.5 : 0.4;
  const erodedSedimentGrams = Math.round(rainDurationSec * sedimentMultiplier);

  // Rain ticker
  useEffect(() => {
    let interval: any;
    if (isRaining) {
      interval = setInterval(() => {
        setRainDurationSec(prev => {
          const next = prev + 0.1;
          if (next >= 15) {
            setIsRaining(false);
            if (!isCompleted) {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
            }
            return 15;
          }
          return Math.round(next * 10) / 10;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRaining, isCompleted]);

  // 2D Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 0.04;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Monsoon sky backdrop
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      if (isRaining) {
        skyGrad.addColorStop(0, '#334155');
        skyGrad.addColorStop(1, '#475569');
      } else {
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(1, '#7dd3fc');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Rain Clouds if raining
      if (isRaining) {
        ctx.fillStyle = '#1e293b';
        for (let c = 0; c < 8; c++) {
          const cxPos = 60 + c * 85;
          const cyPos = 40 + Math.sin(c * 1.5) * 10;
          ctx.beginPath();
          ctx.arc(cxPos, cyPos, 35, 0, Math.PI * 2);
          ctx.fill();
        }

        // Falling Raindrops
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
        ctx.lineWidth = 1.5;
        for (let r = 0; r < 45; r++) {
          const rx = (r * 19 + Math.sin(t * 10 + r) * 10) % w;
          const ry = ((t * 220 + r * 35) % (h * 0.7));
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 16);
          ctx.stroke();
        }
      }

      // Hillside Slope geometry
      const groundY = h - 70;
      const hillTopX = 60;
      const hillTopY = 160;
      const hillBaseX = w * 0.65;
      const hillBaseY = groundY;

      // Base Ground below hill
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, groundY, w, 70);

      // Draw Slope Profile
      ctx.save();
      if (activeSlope === 'bare') {
        // --- 1. BARE DEFORESTED SLOPE ---
        // Brown eroded soil wedge
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(hillTopX, groundY);
        ctx.lineTo(hillTopX, hillTopY);
        ctx.lineTo(hillBaseX, hillBaseY);
        ctx.closePath();
        ctx.fill();

        // Erosion Gullies and rills
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 3;
        for (let g = 1; g <= 4; g++) {
          const gxStart = hillTopX + g * 35;
          const gyStart = hillTopY + g * 25;
          ctx.beginPath();
          ctx.moveTo(gxStart, gyStart);
          ctx.lineTo(gxStart + 80, gyStart + 70);
          ctx.stroke();
        }

        // Mudslide runoff stream if raining
        if (isRaining) {
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(hillTopX + 20, hillTopY + 20);
          ctx.lineTo(hillBaseX + 10, hillBaseY);
          ctx.stroke();
        }
      } else if (activeSlope === 'terraced') {
        // --- 2. TERRACED FARMING SLOPE ---
        // Terrace steps (5 terraces)
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.moveTo(hillTopX, groundY);
        ctx.lineTo(hillTopX, hillTopY);

        const stepCount = 5;
        const stepW = (hillBaseX - hillTopX) / stepCount;
        const stepH = (hillBaseY - hillTopY) / stepCount;

        for (let s = 0; s < stepCount; s++) {
          const sx = hillTopX + s * stepW;
          const sy = hillTopY + s * stepH;
          // Step flat top
          ctx.lineTo(sx + stepW, sy);
          // Step drop wall
          ctx.lineTo(sx + stepW, sy + stepH);
        }
        ctx.closePath();
        ctx.fill();

        // Green crops / paddy planted on flat terraces
        ctx.fillStyle = '#22c55e';
        for (let s = 0; s < stepCount; s++) {
          const sx = hillTopX + s * stepW;
          const sy = hillTopY + s * stepH;
          ctx.fillRect(sx + 2, sy - 3, stepW - 4, 4);

          // Paddy stalks
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2;
          for (let p = 0; p < 4; p++) {
            const px = sx + 8 + p * 12;
            ctx.beginPath();
            ctx.moveTo(px, sy);
            ctx.lineTo(px, sy - 10);
            ctx.stroke();
          }
        }
      } else if (activeSlope === 'forested') {
        // --- 3. DENSE FOREST SLOPE ---
        // Forested soil wedge
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(hillTopX, groundY);
        ctx.lineTo(hillTopX, hillTopY);
        ctx.lineTo(hillBaseX, hillBaseY);
        ctx.closePath();
        ctx.fill();

        // Lush green grass carpet
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(hillTopX, hillTopY);
        ctx.lineTo(hillBaseX, hillBaseY);
        ctx.stroke();

        // Dense Forest Trees (Sal / Pine) with deep roots
        for (let tIdx = 0; tIdx < 6; tIdx++) {
          const frac = (tIdx + 0.5) / 6;
          const tx = hillTopX + (hillBaseX - hillTopX) * frac;
          const ty = hillTopY + (hillBaseY - hillTopY) * frac;

          // Tree trunk
          ctx.fillStyle = '#78350f';
          ctx.fillRect(tx - 3, ty - 35, 6, 35);

          // Deep root network binding soil
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - 15, ty + 25);
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx + 15, ty + 20);
          ctx.stroke();

          // Green Canopy Foliage
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.arc(tx, ty - 45, 18, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Collection Beaker at the bottom of the slope
      const bkX = hillBaseX + 50;
      const bkW = 85;
      const bkH = 95;
      const bkY = groundY - bkH;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(bkX - bkW / 2, bkY, bkW, bkH);

      // Collected runoff water inside beaker
      const waterLevel = Math.min(65, rainDurationSec * 4.5);
      if (waterLevel > 0) {
        // Water color clarity:
        // Bare: muddy thick brown; Terraced: murky yellowish; Forested: clear crystal blue
        const liqColor = activeSlope === 'bare'
          ? 'rgba(120, 53, 15, 0.85)'
          : activeSlope === 'terraced'
          ? 'rgba(202, 138, 4, 0.6)'
          : 'rgba(56, 189, 248, 0.5)';

        ctx.fillStyle = liqColor;
        ctx.fillRect(bkX - bkW / 2 + 2, groundY - waterLevel, bkW - 4, waterLevel);

        // Sediment deposit at bottom of beaker
        const sedH = Math.min(30, erodedSedimentGrams * 0.25);
        if (sedH > 0) {
          ctx.fillStyle = '#451a03';
          ctx.fillRect(bkX - bkW / 2 + 2, groundY - sedH, bkW - 4, sedH);
        }
      }

      // Beaker Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Runoff Beaker' : 'बगेको माटो सङ्कलन', bkX - 45, groundY + 18);

      // Live metrics HUD in top-left
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 260, 95, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Rainfall Duration:' : 'वर्षाको समय:'} ${rainDurationSec.toFixed(1)} s`, 32, 40);
      ctx.fillText(
        `${lang === 'en' ? 'Soil Erosion Loss:' : 'माटो क्षय दर:'} ${activeSlope === 'bare' ? 'EXTREME (90%)' : activeSlope === 'terraced' ? 'MODERATE (25%)' : 'MINIMAL (<5%)'}`,
        32,
        60
      );

      ctx.fillStyle = activeSlope === 'bare' ? '#ef4444' : activeSlope === 'terraced' ? '#f59e0b' : '#34d399';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Sediment Loss:' : 'गुमेको माटो:'} ${erodedSedimentGrams} g`, 32, 85);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px sans-serif';
      ctx.fillText(
        `${lang === 'en' ? 'Runoff Clarity:' : 'पानीको सफाइ:'} ${activeSlope === 'bare' ? 'Thick Muddy' : activeSlope === 'terraced' ? 'Slightly Turbid' : 'Crystal Clear'}`,
        32,
        103
      );

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [activeSlope, isRaining, rainDurationSec, erodedSedimentGrams, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  const handleReset = () => {
    setIsRaining(false);
    setRainDurationSec(0);
    ScienceAudio.playWhoosh();
  };

  return (
    <SimulationLayout
      titleEn="Soil Conservation & Erosion Laboratory"
      titleNe="माटो संरक्षण तथा भू-क्षय प्रयोगशाला"
      learningAreaEn="Earth and Space"
      learningAreaNe="पृथ्वी र अन्तरिक्ष"
      currentStage={stage}
      onStageChange={handleStageChange}
      lang={lang}
      onLanguageToggle={() => {
        setLang(l => (l === 'en' ? 'ne' : 'en'));
        ScienceAudio.playClick();
      }}
      stars={stars}
      isCompleted={isCompleted}
      onBackToLibrary={onBackToLibrary}
    >
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 390px', gap: '16px', padding: '16px', height: '100%', overflow: 'hidden' }}>
        {/* 2D Canvas Viewport */}
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <canvas
            ref={canvasRef}
            width={720}
            height={520}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
          />
        </div>

        {/* Sidebar Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Slope Type Selector */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} />
              {lang === 'en' ? 'Hillside Terrain Slope' : 'पहाडी भिरालोपनको प्रकार'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {[
                { id: 'bare', en: '1. Bare Hillside', ne: '1. नाङ्गो डाँडा (Deforested)', col: '#ef4444' },
                { id: 'terraced', en: '2. Terraced Farm', ne: '2. कान्ले गरा खेती (Terraces)', col: '#f59e0b' },
                { id: 'forested', en: '3. Forested Hill', ne: '3. घना वनजङ्गल (Dense Forest)', col: '#22c55e' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSlope(s.id as SlopeType);
                    handleReset();
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: activeSlope === s.id ? `2px solid ${s.col}` : '1px solid rgba(255,255,255,0.1)',
                    background: activeSlope === s.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: activeSlope === s.id ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {lang === 'en' ? s.en : s.ne}
                </button>
              ))}
            </div>

            {/* Rain Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => {
                  setIsRaining(r => !r);
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isRaining ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <CloudRain size={14} />
                {isRaining
                  ? (lang === 'en' ? 'Stop Rain' : 'पानी रोक्नुहोस्')
                  : (lang === 'en' ? 'Start Heavy Rain' : 'भारी वर्षा गराउनुहोस्')}
              </button>

              <button
                onClick={handleReset}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={14} />
                {lang === 'en' ? 'Reset' : 'पुनः सुरु'}
              </button>
            </div>
          </div>

          {/* Conservation Concept Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trees size={16} />
              {lang === 'en' ? 'Nepal Hill Conservation Methods' : 'नेपालका पहाडमा माटो संरक्षणका उपाय'}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Terraced farming, contour plowing, and afforestation break torrential rainfall velocity and anchor loose fertile topsoil with root networks, preventing devastating landslides.'
                : 'भिरालो पहाडमा कान्ले वा गरा बनाएर खेती गर्दा र धेरै रुखबिरुवा रोप्दा वर्षाको भेलको गति रोकिन्छ र बिरुवाका जराले माटोलाई बलियोसँग समातेर पहिरो र भू-क्षय हुन दिँदैन।'}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: Soil Erosion Threats' : '1. खोज: भू-क्षयको समस्या')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Testing Slopes' : '2. अन्वेषण: भिरालोपन परीक्षण')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Sediment & Clarity' : '3. अवलोकन: बगेको लेदो र सफाइ')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Root Power' : '4. बुझाइ: जराको सामर्थ्य')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Conservation Quiz' : '5. चुनौती: संरक्षण प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Heavy monsoon rain washes away thousands of tons of Nepal’s fertile topsoil every year if trees are cut down.'
                  : 'नेपालमा मनसुनको भीषण वर्षाले बर्सेनि हजारौं टन मलिलो माटो बगाएर लैजान्छ, यदि रुखहरू काटिएका छन् भने।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Run the rain on "Bare Hillside" and watch the beaker fill with thick mud sediment within seconds.'
                  : '"नाङ्गो डाँडा" मा पानी पार्नुहोस् र केही सेकेन्डमै बाक्लो लेदोले भाँडो भरिएको हेर्नुहोस्।')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Now test the "Forested Hill". Notice how the water running into the beaker is crystal clear with almost zero sediment!'
                  : 'अब "घना वनजङ्गल" भएको भिरालोमा परीक्षण गर्नुहोस्। सङ्कलन भएको पानी कति सफा छ र माटो पटक्कै बगेको छैन!')}
                {stage === 'understand' && (lang === 'en'
                  ? 'Roots act as an underground reinforcement net holding soil aggregates firmly against gravity and water flow.'
                  : 'रुखबिरुवाका जराले भूमिगत जालो जस्तै काम गरी माटोका कणहरूलाई कसिलो गरी बाँधेर राख्छन्।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'Which traditional farming technique helps prevent soil erosion on steep hillsides in Nepal?'
                    : 'नेपालका भिरालो पहाडहरूमा भू-क्षय रोक्न कुन परम्परागत खेती प्रणाली अपनाइन्छ?'}
                </p>
                {[
                  { id: 1, en: 'Terrace Farming', ne: 'कान्ले / गरा खेती (Terrace Farming)' },
                  { id: 2, en: 'Vertical Plowing down the slope', ne: 'ठाडो जोत्ने विधि' },
                  { id: 3, en: 'Cutting all trees', ne: 'सबै रुख काट्ने' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setQuizAnswer(opt.id);
                      if (opt.id === 1) {
                        ScienceAudio.playSuccess();
                        setStars(3);
                        setIsCompleted(true);
                      } else {
                        ScienceAudio.playWhoosh();
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      marginBottom: '6px',
                      borderRadius: '6px',
                      border: quizAnswer === opt.id
                        ? (opt.id === 1 ? '1px solid #22c55e' : '1px solid #ef4444')
                        : '1px solid rgba(255,255,255,0.1)',
                      background: quizAnswer === opt.id
                        ? (opt.id === 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)')
                        : 'rgba(15, 23, 42, 0.5)',
                      color: '#0f172a',
                      fontSize: '11px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'en' ? opt.en : opt.ne}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};
