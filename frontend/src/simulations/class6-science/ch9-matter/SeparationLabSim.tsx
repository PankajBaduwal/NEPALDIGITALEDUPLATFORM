/**
 * SeparationLabSim.tsx
 * Simulation 33: 2D Separation Laboratory
 * Grade 6 Science • Unit 9: Matter
 *
 * Full 2D Interactive Separation Suite featuring 4 fundamental curriculum methods:
 * 1. Sedimentation & Decantation: Heavy sand settles, clear water poured out
 * 2. Filtration: Filter paper funnel separates chalk residue from clear filtrate
 * 3. Evaporation: Salt solution heated on tripod; steam rises, leaving salt crystals
 * 4. Magnetic Separation: Bar magnet extracts iron filings from sulfur/sand
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Filter, Flame, Magnet, Sparkles, Play, RotateCcw, CheckCircle2 } from 'lucide-react';

type SepMethod = 'decantation' | 'filtration' | 'evaporation' | 'magnetic';

export const SeparationLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Separation Mode
  const [method, setMethod] = useState<SepMethod>('filtration');
  const [isSeparating, setIsSeparating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Animation ticker for separation progress
  useEffect(() => {
    let interval: any;
    if (isSeparating) {
      interval = setInterval(() => {
        setProgressPercent(prev => {
          if (prev >= 100) {
            setIsSeparating(false);
            if (!isCompleted) {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
            }
            return 100;
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isSeparating, isCompleted]);

  // 2D Canvas rendering
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

      // Lab Workbench
      const tableY = h - 60;
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, tableY, w - 40, 20);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, tableY + 20, w - 40, 40);

      const cx = w * 0.45;

      // Render based on selected separation method
      if (method === 'filtration') {
        // --- 1. FILTRATION APPARATUS ---
        // Retort Stand (Base + Rod + Clamp Ring)
        const standX = cx - 120;
        ctx.fillStyle = '#475569';
        ctx.fillRect(standX - 40, tableY - 12, 80, 12); // Base
        ctx.fillStyle = '#64748b';
        ctx.fillRect(standX - 4, tableY - 320, 8, 308); // Rod
        // Clamp arm holding funnel
        ctx.fillStyle = '#475569';
        ctx.fillRect(standX, tableY - 210, 110, 10);
        // Clamp ring around funnel
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(cx, tableY - 205, 36, 10, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Glass Funnel
        const funnelTopY = tableY - 240;
        const funnelNeckY = tableY - 170;
        const funnelStemBotY = tableY - 110;
        const funnelTopW = 70;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;

        // Funnel cone & stem
        ctx.beginPath();
        ctx.moveTo(cx - funnelTopW, funnelTopY);
        ctx.lineTo(cx - 5, funnelNeckY);
        ctx.lineTo(cx - 5, funnelStemBotY);
        ctx.lineTo(cx + 5, funnelStemBotY - 8); // beveled stem tip
        ctx.lineTo(cx + 5, funnelNeckY);
        ctx.lineTo(cx + funnelTopW, funnelTopY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // White Conical Filter Paper inside Funnel
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(cx - funnelTopW + 4, funnelTopY + 4);
        ctx.lineTo(cx, funnelNeckY + 2);
        ctx.lineTo(cx + funnelTopW - 4, funnelTopY + 4);
        ctx.closePath();
        ctx.fill();

        // Chalk Residue on filter paper
        const residueAlpha = Math.min(1, progressPercent / 50);
        ctx.fillStyle = `rgba(203, 213, 225, ${residueAlpha})`;
        ctx.beginPath();
        ctx.arc(cx, funnelNeckY - 6, 12, 0, Math.PI * 2);
        ctx.fill();

        // Beaker below to collect filtrate
        const bkW = 90;
        const bkH = 90;
        const bkY = tableY - bkH;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(cx - bkW / 2, bkY, bkW, bkH);

        // Clear Filtrate Liquid level in lower beaker
        const filtrateH = (progressPercent / 100) * 55;
        if (filtrateH > 0) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.fillRect(cx - bkW / 2 + 2, tableY - filtrateH, bkW - 4, filtrateH);
        }

        // Dripping water droplets from funnel tip
        if (isSeparating && progressPercent < 100) {
          const dripY = funnelStemBotY + ((t * 90) % (bkY + 20 - funnelStemBotY));
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(cx, dripY, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Labels
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'en' ? 'Insoluble Residue' : 'कागजमा बाँकी अवशेष', cx + 60, funnelTopY + 20);
        ctx.fillText(lang === 'en' ? 'Clear Filtrate' : 'छानिएको सफा झोल', cx + bkW / 2 + 15, tableY - 25);
      } else if (method === 'evaporation') {
        // --- 2. EVAPORATION APPARATUS ---
        // Tripod Stand & Burner
        const burnerTopY = tableY - 90;
        // Tripod legs
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 50, tableY);
        ctx.lineTo(cx - 40, burnerTopY);
        ctx.lineTo(cx + 40, burnerTopY);
        ctx.lineTo(cx + 50, tableY);
        ctx.stroke();

        // Wire Gauze
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cx - 45, burnerTopY - 4, 90, 6);

        // Bunsen Burner
        ctx.fillStyle = '#475569';
        ctx.fillRect(cx - 20, tableY - 10, 40, 10);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 6, burnerTopY + 25, 12, tableY - burnerTopY - 35);

        // Animated Flame (if active)
        if (isSeparating && progressPercent < 100) {
          const flicker = Math.sin(t * 15) * 4;
          const flameGrad = ctx.createRadialGradient(cx, burnerTopY + 20, 2, cx, burnerTopY + 5, 20);
          flameGrad.addColorStop(0, '#ffffff');
          flameGrad.addColorStop(0.3, '#38bdf8');
          flameGrad.addColorStop(0.7, '#0284c7');
          flameGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 10, burnerTopY + 22);
          ctx.quadraticCurveTo(cx, burnerTopY - 10 + flicker, cx + 10, burnerTopY + 22);
          ctx.closePath();
          ctx.fill();
        }

        // Porcelain Evaporating Dish (White shallow bowl)
        const dishY = burnerTopY - 16;
        const dishW = 85;
        const dishH = 22;

        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, dishY, dishW / 2, dishH, 0, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Liquid Water remaining in dish (evaporates as progress increases)
        const waterRemainingH = Math.max(0, (1 - progressPercent / 100) * 14);
        if (waterRemainingH > 0) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.beginPath();
          ctx.ellipse(cx, dishY + 12 - waterRemainingH * 0.5, (dishW / 2 - 8) * (waterRemainingH / 14), waterRemainingH, 0, 0, Math.PI);
          ctx.closePath();
          ctx.fill();
        }

        // Salt Crystals crusting dish (forms as water disappears)
        const saltAlpha = Math.min(1, progressPercent / 70);
        if (progressPercent > 30) {
          ctx.fillStyle = `rgba(255, 255, 255, ${saltAlpha})`;
          for (let s = 0; s < 18; s++) {
            const sx = cx + Math.sin(s * 1.7) * (dishW * 0.35);
            const sy = dishY + 12 - Math.abs(Math.cos(s * 2.1) * 6);
            ctx.fillRect(sx, sy, 4, 4);
          }
        }

        // Steam Vapor rising
        if (isSeparating && progressPercent < 95) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          for (let v = 0; v < 10; v++) {
            const vy = dishY - 20 - ((t * 40 + v * 15) % 120);
            const vx = cx + Math.sin(t * 3 + v) * 25;
            const vr = 4 + ((dishY - vy) / 120) * 14;
            ctx.beginPath();
            ctx.arc(vx, vy, vr, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Labels
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'en' ? 'Evaporating Dish' : 'वाष्पीकरण कचौरा', cx - 80, dishY - 25);
        ctx.fillText(lang === 'en' ? 'White Salt Crystals Remain' : 'सुकेको नूनको कण', cx - 50, dishY + 38);
      } else if (method === 'magnetic') {
        // --- 3. MAGNETIC SEPARATION ---
        // Petri Dish with sulfur powder and iron filings
        const dishX = cx;
        const dishY = tableY - 20;
        const dishR = 100;

        // Petri dish plate
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(dishX, dishY, dishR, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Yellow Sulfur powder base
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(dishX, dishY, dishR - 8, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bar Magnet position (moves down as separation progresses)
        const magnetY = tableY - 180 + (progressPercent / 100) * 70;
        const magnetW = 120;
        const magnetH = 32;

        // Magnet Body (Red North, Blue South)
        // North (Red)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(dishX - magnetW / 2, magnetY, magnetW / 2, magnetH);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('N', dishX - magnetW / 4 - 6, magnetY + 22);

        // South (Blue)
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(dishX, magnetY, magnetW / 2, magnetH);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('S', dishX + magnetW / 4 - 6, magnetY + 22);

        // Black Iron Filings leaping up to magnet poles
        const filingsOnMagnetCount = Math.floor((progressPercent / 100) * 60);
        ctx.fillStyle = '#0f172a';

        // Filings clinging to magnet poles
        for (let i = 0; i < filingsOnMagnetCount; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const poleCenterX = dishX + side * (magnetW * 0.35);
          const fx = poleCenterX + (Math.sin(i * 3) * 18);
          const fy = magnetY + magnetH + Math.abs(Math.cos(i * 5) * 16);
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Remaining filings in dish
        const filingsInDishCount = 60 - filingsOnMagnetCount;
        for (let j = 0; j < filingsInDishCount; j++) {
          const fx = dishX + Math.sin(j * 4.1) * (dishR * 0.7);
          const fy = dishY + Math.cos(j * 3.3) * 12;
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Labels
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'en' ? 'Iron Filings Attracted to Poles' : 'फलामको धूलो चुम्बकमा टाँसिएको', dishX - 110, magnetY - 15);
        ctx.fillText(lang === 'en' ? 'Sulfur Powder Remains Behind' : 'गन्धकको धूलो तलै बाँकी', dishX - 60, dishY + 40);
      } else if (method === 'decantation') {
        // --- 4. SEDIMENTATION & DECANTATION ---
        // Left Beaker (Mud settled at bottom)
        const bk1X = cx - 110;
        const bk1Y = tableY - 130;
        const bkW = 95;
        const bkH = 130;

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bk1X - bkW / 2, bk1Y, bkW, bkH);

        // Heavy Mud Sediment at bottom of left beaker
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bk1X - bkW / 2 + 2, bk1Y + bkH - 30, bkW - 4, 28);

        // Supernatant liquid level in left beaker (decreases as poured)
        const leftWaterH = Math.max(0, (1 - progressPercent / 100) * 65);
        if (leftWaterH > 0) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.fillRect(bk1X - bkW / 2 + 2, bk1Y + bkH - 30 - leftWaterH, bkW - 4, leftWaterH);
        }

        // Right Beaker (Receiving clear decanted water)
        const bk2X = cx + 110;
        const bk2Y = tableY - 130;
        ctx.strokeRect(bk2X - bkW / 2, bk2Y, bkW, bkH);

        // Decanted clear water in right beaker
        const rightWaterH = (progressPercent / 100) * 65;
        if (rightWaterH > 0) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.fillRect(bk2X - bkW / 2 + 2, bk2Y + bkH - rightWaterH, bkW - 4, rightWaterH);
        }

        // Pouring stream arc between beakers
        if (isSeparating && progressPercent < 100) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(bk1X + bkW / 2, bk1Y + 30);
          ctx.quadraticCurveTo((bk1X + bk2X) / 2, bk1Y - 10, bk2X - 20, bk2Y + 40);
          ctx.stroke();
        }

        // Labels
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'en' ? 'Sediment' : 'थिग्रिएको लेदो/बालुवा', bk1X - 60, bk1Y + bkH + 18);
        ctx.fillText(lang === 'en' ? 'Decanted Water' : 'खन्याइएको सफा पानी', bk2X - 70, bk2Y + bkH + 18);
      }

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
      ctx.fillText(lang === 'en' ? 'Separation Progress:' : 'छुट्याउने कार्य प्रगति:', 32, 42);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`${progressPercent}% ${progressPercent === 100 ? '✓ Complete' : ''}`, 32, 65);

      ctx.fillStyle = '#a855f7';
      ctx.font = '11px sans-serif';
      ctx.fillText(lang === 'en' ? `Method: ${method.toUpperCase()}` : `विधि: ${method}`, 32, 83);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [method, isSeparating, progressPercent, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  const handleReset = () => {
    setIsSeparating(false);
    setProgressPercent(0);
    ScienceAudio.playWhoosh();
  };

  const methodsList: Array<{ id: SepMethod; en: string; ne: string; icon: any }> = [
    { id: 'filtration', en: 'Filtration', ne: 'छान्ने विधि (Filtration)', icon: Filter },
    { id: 'evaporation', en: 'Evaporation', ne: 'वाष्पीकरण विधि (Evaporation)', icon: Flame },
    { id: 'magnetic', en: 'Magnetic Separation', ne: 'चुम्बकीय विधि (Magnetic)', icon: Magnet },
    { id: 'decantation', en: 'Decantation', ne: 'थिग्राउने र खन्याउने', icon: Sparkles },
  ];

  return (
    <SimulationLayout
      titleEn="Separation Laboratory"
      titleNe="मिश्रण छुट्याउने विधिहरू"
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
          {/* Method Selector */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} />
              {lang === 'en' ? 'Select Separation Technique' : 'छुट्याउने विधि छान्नुहोस्'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {methodsList.map(m => {
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMethod(m.id);
                      handleReset();
                      ScienceAudio.playClick();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: method === m.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      background: method === m.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                      color: method === m.id ? '#ffffff' : '#94a3b8',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <IconComponent size={16} />
                    <span>{lang === 'en' ? m.en : m.ne}</span>
                  </button>
                );
              })}
            </div>

            {/* Start / Reset Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => {
                  setIsSeparating(s => !s);
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSeparating ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
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
                {isSeparating
                  ? (lang === 'en' ? 'Pause' : 'रोक्नुहोस्')
                  : (lang === 'en' ? 'Start Process' : 'प्रक्रिया सुरु')}
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

          {/* Educational Method Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {method === 'filtration' && (lang === 'en' ? 'Filtration Principle' : 'छान्ने विधिको सिद्धान्त')}
              {method === 'evaporation' && (lang === 'en' ? 'Evaporation Principle' : 'वाष्पीकरण सिद्धान्त')}
              {method === 'magnetic' && (lang === 'en' ? 'Magnetic Separation Principle' : 'चुम्बकीय छुट्याउने विधि')}
              {method === 'decantation' && (lang === 'en' ? 'Decantation Principle' : 'थिग्राउने र खन्याउने')}
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
              {method === 'filtration' && (lang === 'en'
                ? 'Used to separate insoluble solid particles from a liquid using porous filter paper. Solid chalk remains as "residue" while clean liquid passes through as "filtrate".'
                : 'फिल्टर कागजको मसिना छिद्रहरू प्रयोग गरेर तरलबाट अघुलनशील ठोस कण छुट्याइन्छ। ठोस चक कागजमा "अवशेष" को रूपमा रहन्छ र सफा पानी तल "छानिएको झोल" को रूपमा जम्मा हुन्छ।')}
              {method === 'evaporation' && (lang === 'en'
                ? 'Used to recover a dissolved solid solute (like salt) from its liquid solvent (water) by heating the mixture until the solvent boils off as vapor.'
                : 'पानीमा पुरै घुलेको ठोस पदार्थ (जस्तै नून) लाई तताएर बाफ बनाई उडाएपछि कचौरामा शुद्ध नूनका कणहरू प्राप्त गरिन्छ।')}
              {method === 'magnetic' && (lang === 'en'
                ? 'Exploits ferromagnetic properties to extract magnetic substances (iron filings) from non-magnetic powders (sulfur or sand).'
                : 'चुम्बकीय गुण भएको पदार्थ (फलामको धूलो) लाई अचुम्बकीय पदार्थ (गन्धक वा बालुवा) बाट चुम्बकको सहायताले सजिलै तानेर छुट्याइन्छ।')}
              {method === 'decantation' && (lang === 'en'
                ? 'Heavier suspended solids (mud/sand) sink to the bottom by gravity (sedimentation), allowing the upper clear liquid to be carefully poured off.'
                : 'गहु्रङ्गा अघुलनशील कणहरू गुरुत्व बलले पिँधमा बस्छन् (थिग्रिने), र माथिको सफा पानीलाई नहल्लाईकन अर्को भाँडोमा खन्याइन्छ।')}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: Why Separate?' : '1. खोज: किन छुट्याउने?')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Method Mechanics' : '2. अन्वेषण: विधिको प्रक्रिया')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Products & Residue' : '3. अवलोकन: अवशेष र उत्पादन')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Physical Differences' : '4. बुझाइ: भौतिक भिन्नता')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Separation Quiz' : '5. चुनौती: विधि प्रश्नोत्तरी')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'In nature, matter rarely exists in pure form. We utilize differences in particle size, boiling point, density, and magnetism to separate mixtures.'
                  : 'प्रकृतिमा पदार्थहरू शुद्ध रूपमा कमै पाइन्छन्। कणको आकार, उम्लने विन्दु, घनत्व र चुम्बकीय गुणको भिन्नता प्रयोग गरेर मिश्रण छुट्याइन्छ।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Switch between methods and hit "Start Process" to observe each mechanical separation in action.'
                  : 'फरक-फरक विधि छानेर "प्रक्रिया सुरु" थिच्नुहोस् र प्रत्येक विधिको कार्यप्रणाली अवलोकन गर्नुहोस्।')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Notice how evaporation recovers only the solid solute (salt), whereas distillation recovers both the solute and pure solvent.'
                  : 'वाष्पीकरणले ठोस नून मात्र फर्काउँछ तर पानी बाफ बनेर उड्छ; तर आसवन विधिले नून र शुद्ध पानी दुवै जोगाउँछ।')}
                {stage === 'understand' && (lang === 'en'
                  ? 'Filtration works for heterogeneous suspensions (chalk in water), while evaporation is required for homogeneous solutions (salt in water).'
                  : 'छान्ने विधि अघुलनशील निलम्बन (चक र पानी) का लागि उपयोगी हुन्छ, तर घुलेको नून छुट्याउन वाष्पीकरण नै चाहिन्छ।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'Which method would you choose to separate iron nails from sawdust?'
                    : 'काठको धूलोबाट फलामका काँटीहरू छुट्याउन कुन विधि उत्तम हुन्छ?'}
                </p>
                {[
                  { id: 1, en: 'Magnetic Separation', ne: 'चुम्बकीय विधि (Magnetic Separation)' },
                  { id: 2, en: 'Evaporation', ne: 'वाष्पीकरण विधि (Evaporation)' },
                  { id: 3, en: 'Distillation', ne: 'आसवन विधि (Distillation)' },
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
