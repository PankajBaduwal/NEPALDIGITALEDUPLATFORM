/**
 * PaperChromatographyLabSim.tsx
 * Simulation 35: 2D Paper Chromatography Laboratory
 * Grade 6 Science • Unit 9: Matter
 *
 * Full 2D Interactive Chromatography featuring:
 * 1. Capillary Action: Solvent front ascending filter paper strip
 * 2. Dye Separation:
 *    - Black Ink: Yellow (Rf=0.85), Red (Rf=0.55), Blue (Rf=0.25)
 *    - Plant Leaf: Carotene (Rf=0.92), Xanthophyll (Rf=0.70), Chlorophyll a (Rf=0.45), Chlorophyll b (Rf=0.28)
 * 3. Retention Factor (Rf) Calculation: Rf = Spot Distance / Solvent Front Distance
 * 4. Millimeter Ruler & Real-time measurement
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Play, RotateCcw, Sparkles, Ruler, CheckCircle2 } from 'lucide-react';

type SampleType = 'black_ink' | 'plant_chlorophyll';

export const PaperChromatographyLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Experiment State
  const [sample, setSample] = useState<SampleType>('black_ink');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [solventFrontCm, setSolventFrontCm] = useState<number>(0); // 0 to 8.0 cm
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // Timer ticker
  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setSolventFrontCm(prev => {
          if (prev >= 8.0) {
            setIsRunning(false);
            if (!isCompleted) {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
            }
            return 8.0;
          }
          return Math.round((prev + 0.05) * 100) / 100;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning, isCompleted]);

  // Derived pigment positions (in cm)
  const pigments = sample === 'black_ink'
    ? [
        { nameEn: 'Yellow Dye', nameNe: 'पहेंलो रङ्ग', rf: 0.85, color: '#facc15', cm: Math.round(solventFrontCm * 0.85 * 10) / 10 },
        { nameEn: 'Red Dye', nameNe: 'रातो रङ्ग', rf: 0.55, color: '#ef4444', cm: Math.round(solventFrontCm * 0.55 * 10) / 10 },
        { nameEn: 'Blue Dye', nameNe: 'नीलो रङ्ग', rf: 0.25, color: '#3b82f6', cm: Math.round(solventFrontCm * 0.25 * 10) / 10 },
      ]
    : [
        { nameEn: 'Carotene', nameNe: 'क्यारोटिन', rf: 0.92, color: '#f97316', cm: Math.round(solventFrontCm * 0.92 * 10) / 10 },
        { nameEn: 'Xanthophyll', nameNe: 'जान्थोफिल', rf: 0.70, color: '#eab308', cm: Math.round(solventFrontCm * 0.70 * 10) / 10 },
        { nameEn: 'Chlorophyll a', nameNe: 'क्लोरोफिल a', rf: 0.45, color: '#10b981', cm: Math.round(solventFrontCm * 0.45 * 10) / 10 },
        { nameEn: 'Chlorophyll b', nameNe: 'क्लोरोफिल b', rf: 0.28, color: '#84cc16', cm: Math.round(solventFrontCm * 0.28 * 10) / 10 },
      ];

  // 2D Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
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

      // Lab Workbench
      const tableY = h - 50;
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, tableY, w - 40, 15);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, tableY + 15, w - 40, 35);

      // Chromatography Chamber (Tall glass gas jar / beaker)
      const jarX = w * 0.4;
      const jarY = tableY - 380;
      const jarW = 180;
      const jarH = 380;

      // Solvent Pool at bottom
      const solventPoolH = 40;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.fillRect(jarX - jarW / 2 + 5, tableY - solventPoolH, jarW - 10, solventPoolH);

      // Glass Chamber Walls
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Lip left
      ctx.moveTo(jarX - jarW / 2 - 10, jarY);
      ctx.lineTo(jarX - jarW / 2, jarY);
      ctx.lineTo(jarX - jarW / 2, tableY - 10);
      ctx.arcTo(jarX - jarW / 2, tableY, jarX - jarW / 2 + 10, tableY, 10);
      ctx.lineTo(jarX + jarW / 2 - 10, tableY);
      ctx.arcTo(jarX + jarW / 2, tableY, jarX + jarW / 2, tableY - 10, 10);
      ctx.lineTo(jarX + jarW / 2, jarY);
      ctx.lineTo(jarX + jarW / 2 + 10, jarY);
      ctx.stroke();

      // Top Glass Cover Plate / Watch glass
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(jarX - jarW / 2 - 15, jarY - 8, jarW + 30, 8, 4);
      ctx.fill();
      ctx.stroke();

      // Clip / Suspension rod from top cover
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(jarX, jarY);
      ctx.lineTo(jarX, jarY + 25);
      ctx.stroke();

      // Whatman Chromatography Paper Strip
      const paperW = 70;
      const paperTopY = jarY + 25;
      const paperBotY = tableY - 15; // Dips slightly into solvent pool
      const paperH = paperBotY - paperTopY;

      // Paper rectangle
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.fillRect(jarX - paperW / 2, paperTopY, paperW, paperH);
      ctx.shadowBlur = 0;

      // Baseline (Pencil line, 2 cm from bottom of paper)
      const baselineY = paperBotY - 45;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(jarX - paperW / 2, baselineY);
      ctx.lineTo(jarX + paperW / 2, baselineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Baseline Label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(lang === 'en' ? 'Baseline' : 'सुरुवाती रेखा', jarX - paperW / 2 - 50, baselineY + 3);

      // Max travel scale: 8 cm corresponds to 240 pixels (30 px / cm)
      const pxPerCm = 30;
      const solventFrontY = baselineY - solventFrontCm * pxPerCm;

      // Wet paper region (solvent front climbing)
      if (solventFrontCm > 0) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(jarX - paperW / 2, solventFrontY, paperW, paperBotY - solventFrontY);

        // Solvent Front Line
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(jarX - paperW / 2, solventFrontY);
        ctx.lineTo(jarX + paperW / 2, solventFrontY);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(lang === 'en' ? 'Solvent Front →' : 'घोलक रेखा →', jarX - paperW / 2 - 95, solventFrontY + 4);
      }

      // Initial spot at baseline if not started or partially dissolved
      if (solventFrontCm < 0.5) {
        ctx.fillStyle = sample === 'black_ink' ? '#0f172a' : '#15803d';
        ctx.beginPath();
        ctx.arc(jarX, baselineY, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Separated pigment spots / bands
      pigments.forEach(p => {
        if (p.cm > 0.2) {
          const spotY = baselineY - p.cm * pxPerCm;
          const spotGrad = ctx.createRadialGradient(jarX, spotY, 2, jarX, spotY, 14);
          spotGrad.addColorStop(0, p.color);
          spotGrad.addColorStop(0.7, p.color);
          spotGrad.addColorStop(1, 'rgba(255,255,255,0)');

          ctx.fillStyle = spotGrad;
          ctx.beginPath();
          ctx.ellipse(jarX, spotY, 18, 7, 0, 0, Math.PI * 2);
          ctx.fill();

          // Spot indicator tag
          ctx.fillStyle = p.color;
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(`${lang === 'en' ? p.nameEn : p.nameNe} (${p.cm.toFixed(1)} cm)`, jarX + paperW / 2 + 10, spotY + 4);
        }
      });

      // 2. Metric Ruler alongside the paper
      const rulerX = jarX + jarW / 2 + 30;
      const rulerY = baselineY - 8.5 * pxPerCm;
      const rulerH = 9.0 * pxPerCm;
      const rulerW = 40;

      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.fillRect(rulerX, rulerY, rulerW, rulerH);
      ctx.strokeRect(rulerX, rulerY, rulerW, rulerH);

      // Ruler centimeter graduations
      ctx.fillStyle = '#713f12';
      ctx.font = 'bold 10px sans-serif';
      for (let cm = 0; cm <= 8; cm++) {
        const ry = baselineY - cm * pxPerCm;
        ctx.beginPath();
        ctx.moveTo(rulerX, ry);
        ctx.lineTo(rulerX + 16, ry);
        ctx.stroke();
        ctx.fillText(`${cm}`, rulerX + 20, ry + 4);

        // Half cm ticks
        if (cm < 8) {
          ctx.beginPath();
          ctx.moveTo(rulerX, ry - pxPerCm * 0.5);
          ctx.lineTo(rulerX + 10, ry - pxPerCm * 0.5);
          ctx.stroke();
        }
      }

      ctx.fillText('cm', rulerX + 18, rulerY + 12);

      // Live metrics HUD
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 240, 75, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Solvent Front Distance:' : 'घोलक चढेको दुरी:', 32, 42);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`${solventFrontCm.toFixed(2)} cm / 8.0 cm`, 32, 65);

      ctx.fillStyle = '#a855f7';
      ctx.font = '11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Method: Capillary Action' : 'विधि: केशिकत्व क्रिया', 32, 83);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [sample, solventFrontCm, pigments, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSolventFrontCm(0);
    ScienceAudio.playWhoosh();
  };

  return (
    <SimulationLayout
      titleEn="Paper Chromatography Laboratory"
      titleNe="कागज क्रोमाटोग्राफी प्रयोगशाला"
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

        {/* Sidebar Controls & Rf Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Main Controls */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ruler size={18} />
              {lang === 'en' ? 'Chromatography Controls' : 'क्रोमाटोग्राफी नियन्त्रण'}
            </h3>

            {/* Sample Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => {
                  setSample('black_ink');
                  handleReset();
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: sample === 'black_ink' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  background: sample === 'black_ink' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {lang === 'en' ? 'Black Marker Ink' : 'कालो मसी'}
              </button>
              <button
                onClick={() => {
                  setSample('plant_chlorophyll');
                  handleReset();
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: sample === 'plant_chlorophyll' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                  background: sample === 'plant_chlorophyll' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {lang === 'en' ? 'Green Leaf Extract' : 'हरियो पातको रस'}
              </button>
            </div>

            {/* Start / Pause & Reset */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => {
                  setIsRunning(r => !r);
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isRunning ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Play size={14} />
                {isRunning
                  ? (lang === 'en' ? 'Pause Run' : 'रोक्नुहोस्')
                  : (lang === 'en' ? 'Start Run' : 'सुरु गर्नुहोस्')}
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
                  fontSize: '12px',
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

          {/* Retention Factor (Rf) Table */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#facc15', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {lang === 'en' ? 'Retention Factor (Rf) Values' : 'Rf मान तालिका'}
            </h4>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
              <code>Rf = Spot Distance ÷ Solvent Front Distance</code>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pigments.map(p => {
                const liveRf = solventFrontCm > 0.5 ? (p.cm / solventFrontCm).toFixed(2) : '-';
                return (
                  <div
                    key={p.nameEn}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '6px',
                      borderLeft: `4px solid ${p.color}`,
                    }}
                  >
                    <div>
                      <div style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px' }}>
                        {lang === 'en' ? p.nameEn : p.nameNe}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '10px' }}>
                        {p.cm.toFixed(1)} cm
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '12px' }}>
                        Rf = {liveRf}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '9px' }}>
                        (Ideal: {p.rf})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: What is Chromatography?' : '1. खोज: क्रोमाटोग्राफी के हो?')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Capillary Rise' : '2. अन्वेषण: केशिकत्व फैलावट')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Band Resolution' : '3. अवलोकन: रङ्ग छुट्टिने क्रम')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Relative Affinity' : '4. बुझाइ: आकर्षण र घुलनशीलता')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Rf Quiz' : '5. चुनौती: Rf प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Chromatography comes from the Greek words chroma (color) and graphein (to write). It separates complex mixtures based on solubility in a moving solvent.'
                  : 'क्रोमाटोग्राफी ग्रीक शब्द "क्रोमा" र "ग्राफिन" बाट बनेको हो। यसले गतिशिल घोलकमा घुलनशीलताको आधारमा जटिल मिश्रण छुट्याउँछ।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Click "Start Run". Capillary action causes the liquid solvent to climb upwards through microscopic pores between cellulose fibers of the paper.'
                  : '"सुरु गर्नुहोस्" थिच्नुहोस्। फिल्टर कागजका मसिना छिद्रहरू हुँदै केशिकत्व बलले घोलकलाई बिस्तारै माथितिर तान्छ।')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Notice how black ink is not a single chemical, but an engineered mixture of yellow, red, and blue dye pigments!'
                  : 'कालो मसी एउटै पदार्थ नभई पहेंलो, रातो र नीलो रङ्गका कणहरू मिलेर बनेको मिश्रण हो भन्ने प्रस्ट देखिन्छ!')}
                {stage === 'understand' && (lang === 'en'
                  ? 'Substances with higher solubility in solvent travel faster (higher Rf), while substances strongly adsorbed to paper fibers lag behind (lower Rf).'
                  : 'घोलकमा बढी घुल्ने रङ्ग छिटो माथि पुग्छ (उच्च Rf), तर कागजका फाइबरसँग बलियो टाँसिने रङ्ग तलै रोकिन्छ (न्यून Rf)।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'If a pigment spot travels 4 cm while the solvent front travels 8 cm, what is its Rf value?'
                    : 'यदि रङ्गको थोपा 4 से.मी. र घोलक रेखा 8 से.मी. चढ्छ भने, यसको Rf मान कति हुन्छ?'}
                </p>
                {[
                  { id: 1, en: '0.50 (4 ÷ 8)', ne: '0.50 (4 ÷ 8)' },
                  { id: 2, en: '2.00 (8 ÷ 4)', ne: '2.00 (8 ÷ 4)' },
                  { id: 3, en: '32.0 (4 × 8)', ne: '32.0 (4 × 8)' },
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
