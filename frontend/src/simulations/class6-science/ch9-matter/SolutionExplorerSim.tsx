/**
 * SolutionExplorerSim.tsx
 * Simulation 32: 2D Solution Explorer (घोल अन्वेषण)
 * Grade 6 Science • Unit 9: Matter (पदार्थ)
 *
 * Full 2D Interactive Solution Chemistry featuring:
 * 1. Solute + Solvent = Solution (घुल्य + घोलक = घोल)
 * 2. Saturation States:
 *    - Unsaturated (अतृप्त): Dissolves completely
 *    - Saturated (तृप्त): Maximum solute dissolved at this temperature
 *    - Supersaturated (अतितृप्त): Excess solute precipitates out into solid crystals
 * 3. Temperature Modulator (10°C to 90°C) showing increasing solubility limit
 * 4. Dynamic Solubility curve & Seed Crystal nucleation trigger
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Thermometer, Plus, RotateCcw, Sparkles, Beaker, CheckCircle2 } from 'lucide-react';

export const SolutionExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Solution State
  const [addedSoluteGrams, setAddedSoluteGrams] = useState<number>(20);
  const [temperatureC, setTemperatureC] = useState<number>(25);
  const [isStirring, setIsStirring] = useState<boolean>(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Maximum solubility in 100ml water: S(T) = 20 + (T * 0.45)
  const maxSolubilityGrams = Math.round(20 + temperatureC * 0.45);
  const dissolvedGrams = Math.min(addedSoluteGrams, maxSolubilityGrams);
  const undissolvedGrams = Math.max(0, addedSoluteGrams - maxSolubilityGrams);

  const saturationState = undissolvedGrams > 0
    ? 'supersaturated'
    : addedSoluteGrams === maxSolubilityGrams
    ? 'saturated'
    : 'unsaturated';

  // 2D Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 0.03;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Laboratory Backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#f8fafc');
      bg.addColorStop(0.7, '#f1f5f9');
      bg.addColorStop(1, '#ffffff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Lab Table
      const tableY = h - 60;
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, tableY, w - 40, 20);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, tableY + 20, w - 40, 40);

      // Beaker placement
      const bx = w * 0.45;
      const by = tableY - 200;
      const bw = 190;
      const bh = 190;
      const liquidH = 145;

      // Beaker Water with Solute Saturation color
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bx - bw / 2 + 6, by + bh - liquidH, bw - 12, liquidH - 4, [0, 0, 10, 10]);
      ctx.clip();

      // Liquid gradient (more solute = slightly denser color)
      const solDensity = dissolvedGrams / 65;
      const liqGrad = ctx.createLinearGradient(0, by + bh - liquidH, 0, by + bh);
      liqGrad.addColorStop(0, `rgba(56, 189, 248, ${0.25 + solDensity * 0.3})`);
      liqGrad.addColorStop(1, `rgba(14, 165, 233, ${0.45 + solDensity * 0.35})`);
      ctx.fillStyle = liqGrad;
      ctx.fillRect(bx - bw / 2, by + bh - liquidH, bw, liquidH);

      // Dissolved Solute ions / particles in solution
      const ionCount = Math.floor(dissolvedGrams * 0.9);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < ionCount; i++) {
        const stirOffset = isStirring ? Math.sin(t * 8 + i) * 12 : 0;
        const px = bx - bw / 2 + 15 + ((i * 37 + stirOffset) % (bw - 30));
        const py = by + bh - liquidH + 15 + ((i * 53 + stirOffset) % (liquidH - 35));
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Undissolved Solute Precipitate / Sediment at bottom
      if (undissolvedGrams > 0) {
        const sedH = Math.min(32, (undissolvedGrams / 40) * 32);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(bx, by + bh - 4, bw / 2 - 14, sedH, 0, 0, Math.PI * 2);
        ctx.fill();

        // Crystal sparkle facets
        ctx.fillStyle = '#cbd5e1';
        for (let c = 0; c < 14; c++) {
          const cx = bx + (Math.sin(c * 2) * (bw / 2 - 25));
          const cy = by + bh - 6 - Math.abs(Math.cos(c * 3) * (sedH * 0.7));
          ctx.fillRect(cx, cy, 3, 3);
        }
      }

      ctx.restore();

      // Glass Beaker Walls
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Lip left
      ctx.moveTo(bx - bw / 2 - 8, by);
      ctx.lineTo(bx - bw / 2, by);
      ctx.lineTo(bx - bw / 2, by + bh - 10);
      ctx.arcTo(bx - bw / 2, by + bh, bx - bw / 2 + 10, by + bh, 10);
      ctx.lineTo(bx + bw / 2 - 10, by + bh);
      ctx.arcTo(bx + bw / 2, by + bh, bx + bw / 2, by + bh - 10, 10);
      ctx.lineTo(bx + bw / 2, by);
      ctx.lineTo(bx + bw / 2 + 8, by);
      ctx.stroke();

      // Calibrated mL marks on beaker wall
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      for (let m = 1; m <= 4; m++) {
        const my = by + bh - m * 32;
        ctx.beginPath();
        ctx.moveTo(bx - bw / 2 + 4, my);
        ctx.lineTo(bx - bw / 2 + 20, my);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${m * 50}ml`, bx - bw / 2 + 24, my + 3);
      }

      // Stirring Rod
      const rodAngle = isStirring ? Math.sin(t * 12) * 0.15 + 0.15 : 0.18;
      const rodTopX = bx + 30 + (isStirring ? Math.sin(t * 12) * 15 : 0);
      const rodTopY = by - 50;
      const rodLen = 240;
      const rodBotX = rodTopX - Math.sin(rodAngle) * rodLen;
      const rodBotY = rodTopY + Math.cos(rodAngle) * rodLen;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rodTopX, rodTopY);
      ctx.lineTo(rodBotX, rodBotY);
      ctx.stroke();

      // Thermometer in beaker
      const thermoX = bx - bw / 2 + 35;
      const thermoY = by - 40;
      const thermoH = 180;

      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(thermoX, thermoY);
      ctx.lineTo(thermoX, thermoY + thermoH);
      ctx.stroke();

      // Red mercury thread based on temperatureC
      const mercH = ((temperatureC - 10) / 80) * (thermoH - 25);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(thermoX, thermoY + thermoH);
      ctx.lineTo(thermoX, thermoY + thermoH - mercH);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(thermoX, thermoY + thermoH, 4, 0, Math.PI * 2);
      ctx.fill();

      // State Banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      const stateBorderColor = saturationState === 'unsaturated' ? '#38bdf8' : saturationState === 'saturated' ? '#10b981' : '#f59e0b';
      ctx.strokeStyle = stateBorderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx - 120, by - 40, 240, 32, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = stateBorderColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      const stateLabels = {
        unsaturated: { en: 'Unsaturated Solution (अतृप्त घोल)', ne: 'अतृप्त घोल (Unsaturated)' },
        saturated: { en: 'Saturated Solution (तृप्त घोल)', ne: 'तृप्त घोल (Saturated)' },
        supersaturated: { en: 'Supersaturated with Sediment (अतितृप्त)', ne: 'अतितृप्त घोल (Precipitate Present)' },
      };
      ctx.fillText(lang === 'en' ? stateLabels[saturationState].en : stateLabels[saturationState].ne, bx, by - 19);
      ctx.textAlign = 'left';

      // Live metrics HUD
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 260, 95, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Solute Added:' : 'हालिएको घुल्य:'} ${addedSoluteGrams} g`, 32, 40);
      ctx.fillText(`${lang === 'en' ? 'Max Solubility Limit:' : 'घुलनशीलता सीमा:'} ${maxSolubilityGrams} g / 100mL`, 32, 58);
      ctx.fillText(`${lang === 'en' ? 'Dissolved:' : 'घुलेको:'} ${dissolvedGrams} g  |  ${lang === 'en' ? 'Precipitate:' : 'बाँकी:'} ${undissolvedGrams} g`, 32, 76);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Water Temp:' : 'पानीको तापक्रम:'} ${temperatureC} °C`, 32, 100);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [addedSoluteGrams, temperatureC, dissolvedGrams, undissolvedGrams, saturationState, isStirring, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  const handleReset = () => {
    setAddedSoluteGrams(20);
    setTemperatureC(25);
    setIsStirring(false);
    ScienceAudio.playWhoosh();
  };

  return (
    <SimulationLayout
      titleEn="Solution Chemistry Explorer"
      titleNe="घोल अन्वेषण प्रयोगशाला"
      learningAreaEn="Matter"
      learningAreaNe="पदार्थ"
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
          {/* Main Controls */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Beaker size={18} />
              {lang === 'en' ? 'Solution Modulator' : 'घोल नियन्त्रक'}
            </h3>

            {/* Solute Spoon Button */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <button
                onClick={() => {
                  setAddedSoluteGrams(g => Math.min(80, g + 5));
                  ScienceAudio.playClick();
                  if (addedSoluteGrams + 5 >= maxSolubilityGrams && !isCompleted) {
                    setIsCompleted(true);
                    setStars(3);
                  }
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
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
                <Plus size={14} />
                {lang === 'en' ? 'Add Solute (+5g)' : 'घुल्य थप्नुहोस् (+५g)'}
              </button>

              <button
                onClick={() => {
                  setIsStirring(s => !s);
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: isStirring ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                  background: isStirring ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                  color: isStirring ? '#34d399' : '#f8fafc',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} />
                {isStirring
                  ? (lang === 'en' ? 'Stirring...' : 'हल्लाउँदै...')
                  : (lang === 'en' ? 'Stir Rod' : 'घोल्नुहोस्')}
              </button>
            </div>

            {/* Temperature Slider */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Thermometer size={14} color="#ef4444" />
                  {lang === 'en' ? 'Water Temperature:' : 'तापक्रम:'}
                </span>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{temperatureC} °C</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={temperatureC}
                onChange={e => {
                  setTemperatureC(Number(e.target.value));
                  ScienceAudio.playClick();
                }}
                style={{ width: '100%', accentColor: '#ef4444', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                <span>10°C (Cold)</span>
                <span>50°C (Warm)</span>
                <span>90°C (Hot)</span>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: 'transparent',
                color: '#64748b',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={14} />
              {lang === 'en' ? 'Reset to Default (20g @ 25°C)' : 'सुरुवाती अवस्थामा फर्काउनुहोस्'}
            </button>
          </div>

          {/* Educational Concept Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {lang === 'en' ? 'Solute, Solvent & Solution' : 'घुल्य, घोलक र घोल'}
            </h4>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', textAlign: 'center', margin: '6px 0', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8' }}>
                {lang === 'en' ? 'Solute (Sugar) + Solvent (Water) = Solution' : 'घुल्य (चिनी) + घोलक (पानी) = घोल'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Solubility increases with temperature! Heating water gives water molecules more kinetic energy to break apart solute crystals, allowing more solid to dissolve.'
                : 'तापक्रम बढ्दा घुलनशीलता बढ्छ! पानी तताउँदा पानीका अणुहरूको गति बढ्छ र तिनले बढी नून वा चिनीका कणहरूलाई घुलाउन सक्छन्।'}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: What is a Solution?' : '१. खोज: घोल भनेको के हो?')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Saturation Point' : '२. अन्वेषण: तृप्त विन्दु')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Temperature Effect' : '३. अवलोकन: तापक्रमको प्रभाव')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Solubility Limit' : '४. बुझाइ: घुलनशीलता सीमा')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Solution Quiz' : '५. चुनौती: घोल प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Water is known as the "Universal Solvent" (सर्वघोलक) because it dissolves more substances than any other liquid on Earth.'
                  : 'पानीलाई "सर्वघोलक" भनिन्छ किनभने यसले पृथ्वीका अन्य कुनै पनि तरल पदार्थ भन्दा धेरै वस्तुहरूलाई घुलाउन सक्छ।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Keep clicking "Add Solute (+5g)". Watch what happens when the amount exceeds the saturation limit—sediment accumulates at the bottom!'
                  : '"घुल्य थप्नुहोस्" थिच्दै जानुहोस्। तृप्त सीमा नाघेपछि थपिएको नून नघुली पिँधमा थिग्रिन थालेको हेर्नुहोस्!')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Now slide the temperature up to 80°C. Notice how the undissolved sediment suddenly dissolves because warm water holds more solute!'
                  : 'अब तापक्रम बढाएर ८०°C मा पुर्याउनुहोस्। तातो पानीले बढी घुल्य घुलाउन सक्ने भएकाले पिँधको थिग्रिएको नून पनि घुल्न थाल्छ!')}
                {stage === 'understand' && (lang === 'en'
                  ? 'When a hot saturated solution cools down, the excess solute must crystallize out into solid crystals.'
                  : 'जब तातो तृप्त घोललाई चिसो पारिन्छ, बढी भएको घुल्य पुनः दानादार क्रिस्टल बनेर बाहिर निस्कन्छ।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'A solution that cannot dissolve any more solute at a given temperature is called:'
                    : 'कुनै निश्चित तापक्रममा थप घुल्य घुलाउन नसक्ने घोललाई के भनिन्छ?'}
                </p>
                {[
                  { id: 1, en: 'Saturated Solution (तृप्त घोल)', ne: 'तृप्त घोल (Saturated Solution)' },
                  { id: 2, en: 'Unsaturated Solution (अतृप्त घोल)', ne: 'अतृप्त घोल (Unsaturated Solution)' },
                  { id: 3, en: 'Dilute Solution (पातलो घोल)', ne: 'पातलो घोल (Dilute Solution)' },
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
