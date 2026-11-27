/**
 * MixtureLabSim.tsx
 * Simulation 31: 2D Mixture Laboratory (मिश्रण प्रयोगशाला)
 * Grade 6 Science • Unit 9: Matter (पदार्थ)
 *
 * Full 2D Interactive Chemistry Laboratory featuring:
 * 1. Homogeneous Mixtures (सजातीय मिश्रण): Uniform composition (Salt in water, Sugar solution)
 * 2. Heterogeneous Mixtures (विजातीय मिश्रण): Visible phase separation (Sand in water, Oil-water, Chalk suspension)
 * 3. Interactive Stirring Rod & Particle Dispersion Dynamics
 * 4. Tyndall Effect Laser Scattering Test: True solution vs Colloidal suspension
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Beaker, Sparkles, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';

type MixtureSample = 'salt' | 'sugar' | 'sand' | 'oil' | 'chalk';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

export const MixtureLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Experiment State
  const [sample, setSample] = useState<MixtureSample>('salt');
  const [isStirring, setIsStirring] = useState<boolean>(false);
  const [isLaserOn, setIsLaserOn] = useState<boolean>(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const isHomogeneous = sample === 'salt' || sample === 'sugar';

  // Spawn sample particles
  useEffect(() => {
    const pts: Particle[] = [];
    const count = isHomogeneous ? 30 : 60;
    for (let i = 0; i < count; i++) {
      let col = '#ffffff';
      let r = 2;
      if (sample === 'salt') {
        col = 'rgba(255, 255, 255, 0.4)';
        r = 1.5;
      } else if (sample === 'sugar') {
        col = 'rgba(254, 240, 138, 0.4)';
        r = 1.8;
      } else if (sample === 'sand') {
        col = '#d97706';
        r = 3.5;
      } else if (sample === 'oil') {
        col = '#facc15';
        r = 4;
      } else if (sample === 'chalk') {
        col = 'rgba(241, 245, 249, 0.8)';
        r = 2.8;
      }

      pts.push({
        x: Math.random() * 160 - 80,
        y: sample === 'oil' ? Math.random() * 20 : sample === 'sand' ? 120 + Math.random() * 20 : Math.random() * 120,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r,
        color: col,
      });
    }
    particlesRef.current = pts;
  }, [sample]);

  // 2D Canvas rendering loop
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

      // Beaker placement
      const bx = w * 0.45;
      const by = tableY - 170;
      const bw = 170;
      const bh = 170;
      const liquidH = 135;

      // Beaker Liquid Gradient based on sample
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bx - bw / 2 + 6, by + bh - liquidH, bw - 12, liquidH - 4, [0, 0, 10, 10]);
      ctx.clip();

      let liqGrad = ctx.createLinearGradient(0, by + bh - liquidH, 0, by + bh);
      if (sample === 'salt' || sample === 'sugar') {
        liqGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
        liqGrad.addColorStop(1, 'rgba(14, 165, 233, 0.4)');
      } else if (sample === 'sand') {
        liqGrad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
        liqGrad.addColorStop(1, 'rgba(217, 119, 6, 0.35)');
      } else if (sample === 'oil') {
        // Dual layer: Oil on top, water below!
        liqGrad.addColorStop(0, 'rgba(250, 204, 21, 0.7)');
        liqGrad.addColorStop(0.25, 'rgba(250, 204, 21, 0.7)');
        liqGrad.addColorStop(0.26, 'rgba(56, 189, 248, 0.3)');
        liqGrad.addColorStop(1, 'rgba(14, 165, 233, 0.4)');
      } else if (sample === 'chalk') {
        liqGrad.addColorStop(0, 'rgba(241, 245, 249, 0.45)');
        liqGrad.addColorStop(1, 'rgba(203, 213, 225, 0.65)');
      }

      ctx.fillStyle = liqGrad;
      ctx.fillRect(bx - bw / 2, by + bh - liquidH, bw, liquidH);

      // Particles motion
      particlesRef.current.forEach(p => {
        if (isStirring) {
          // Circular vortex motion
          p.x += Math.cos(t * 8 + p.y * 0.05) * 2;
          p.y += Math.sin(t * 8 + p.x * 0.05) * 1.5;
        } else {
          // Natural settling / floating
          if (sample === 'sand') {
            p.y = Math.min(liquidH - 8, p.y + 0.6); // settles to bottom
          } else if (sample === 'oil') {
            p.y = Math.max(8, p.y - 0.5); // floats to top
          } else if (sample === 'chalk') {
            p.y = Math.min(liquidH - 10, p.y + 0.15); // slow cloudy settling
          }
        }

        // Keep inside liquid bounds
        if (p.x < -bw / 2 + 15) p.x = -bw / 2 + 15;
        if (p.x > bw / 2 - 15) p.x = bw / 2 - 15;
        if (p.y < 5) p.y = 5;
        if (p.y > liquidH - 5) p.y = liquidH - 5;

        // Render particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(bx + p.x, by + bh - liquidH + p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Tyndall Effect Laser Beam inside beaker
      if (isLaserOn) {
        const laserY = by + bh - liquidH * 0.5;
        if (isHomogeneous) {
          // True solution: laser passes through invisibly!
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bx - bw / 2, laserY);
          ctx.lineTo(bx + bw / 2, laserY);
          ctx.stroke();
        } else {
          // Colloid / Suspension: Glowing scattered beam (Tyndall Cone)!
          const laserGrad = ctx.createLinearGradient(bx - bw / 2, laserY, bx + bw / 2, laserY);
          laserGrad.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
          laserGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.7)');
          laserGrad.addColorStop(1, 'rgba(239, 68, 68, 0.5)');

          ctx.fillStyle = laserGrad;
          ctx.beginPath();
          ctx.moveTo(bx - bw / 2, laserY - 3);
          ctx.lineTo(bx + bw / 2, laserY - 9);
          ctx.lineTo(bx + bw / 2, laserY + 9);
          ctx.lineTo(bx - bw / 2, laserY + 3);
          ctx.closePath();
          ctx.fill();

          // Scattering sparkle points
          ctx.fillStyle = '#ffffff';
          for (let s = 0; s < 8; s++) {
            const sx = bx - bw / 2 + Math.random() * bw;
            const sy = laserY + (Math.random() - 0.5) * 10;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();

      // Glass Beaker Walls & Graduations
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Lip left
      ctx.moveTo(bx - bw / 2 - 8, by);
      ctx.lineTo(bx - bw / 2, by);
      ctx.lineTo(bx - bw / 2, by + bh - 10);
      // Bottom curve
      ctx.arcTo(bx - bw / 2, by + bh, bx - bw / 2 + 10, by + bh, 10);
      ctx.lineTo(bx + bw / 2 - 10, by + bh);
      ctx.arcTo(bx + bw / 2, by + bh, bx + bw / 2, by + bh - 10, 10);
      // Right wall
      ctx.lineTo(bx + bw / 2, by);
      ctx.lineTo(bx + bw / 2 + 8, by);
      ctx.stroke();

      // Measurement tick marks (mL)
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      for (let mark = 1; mark <= 4; mark++) {
        const my = by + bh - mark * 30;
        ctx.beginPath();
        ctx.moveTo(bx - bw / 2 + 4, my);
        ctx.lineTo(bx - bw / 2 + 20, my);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${mark * 50}ml`, bx - bw / 2 + 24, my + 3);
      }

      // Stirring Rod (Glass Rod)
      const rodAngle = isStirring ? Math.sin(t * 12) * 0.15 + 0.15 : 0.18;
      const rodTopX = bx + 25 + (isStirring ? Math.sin(t * 12) * 15 : 0);
      const rodTopY = by - 50;
      const rodLen = 220;
      const rodBotX = rodTopX - Math.sin(rodAngle) * rodLen;
      const rodBotY = rodTopY + Math.cos(rodAngle) * rodLen;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rodTopX, rodTopY);
      ctx.lineTo(rodBotX, rodBotY);
      ctx.stroke();

      // Laser Pointer on the left
      const laserSourceX = 60;
      const laserSourceY = by + bh - liquidH * 0.5;

      // Laser body
      ctx.fillStyle = '#475569';
      ctx.fillRect(laserSourceX - 35, laserSourceY - 10, 35, 20);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(laserSourceX - 8, laserSourceY - 6, 8, 12);
      ctx.fillStyle = isLaserOn ? '#ef4444' : '#64748b';
      ctx.beginPath();
      ctx.arc(laserSourceX - 2, laserSourceY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Laser beam before beaker and after beaker
      if (isLaserOn) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        // From pointer to beaker
        ctx.beginPath();
        ctx.moveTo(laserSourceX, laserSourceY);
        ctx.lineTo(bx - bw / 2, laserSourceY);
        ctx.stroke();

        // From beaker exit to right wall
        ctx.beginPath();
        ctx.moveTo(bx + bw / 2, laserSourceY);
        ctx.lineTo(w - 40, laserSourceY);
        ctx.stroke();

        // Red dot on right screen/wall
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(w - 40, laserSourceY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Sample Badge overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = isHomogeneous ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx - 110, by - 40, 220, 32, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHomogeneous ? '#34d399' : '#fbbf24';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      const sampleNames: Record<MixtureSample, { en: string; ne: string }> = {
        salt: { en: 'Salt in Water (नून र पानी)', ne: 'नून र पानीको घोल' },
        sugar: { en: 'Sugar in Water (चिनी र पानी)', ne: 'चिनी र पानीको घोल' },
        sand: { en: 'Sand in Water (बालुवा र पानी)', ne: 'बालुवा र पानीको मिश्रण' },
        oil: { en: 'Oil in Water (तेल र पानी)', ne: 'तेल र पानीको मिश्रण' },
        chalk: { en: 'Chalk in Water (चक र पानी)', ne: 'चकको धूलो र पानी' },
      };
      ctx.fillText(lang === 'en' ? sampleNames[sample].en : sampleNames[sample].ne, bx, by - 19);
      ctx.textAlign = 'left';

      // Laser test result banner
      if (isLaserOn) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(25, 25, 280, 50, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(lang === 'en' ? 'Tyndall Test (टिण्डल प्रभाव):' : 'टिण्डल प्रभाव परीक्षण:', 35, 45);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '11px sans-serif';
        if (isHomogeneous) {
          ctx.fillText(
            lang === 'en' ? 'Beam invisible (True Solution)' : 'किरण नदेखिने (सजातीय घोल)',
            35,
            62
          );
        } else {
          ctx.fillText(
            lang === 'en' ? 'Scattered Beam Visible (Colloid/Suspension)' : 'किरण प्रस्ट देखिने (विजातीय मिश्रण)',
            35,
            62
          );
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [sample, isStirring, isLaserOn, isHomogeneous, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  const sampleButtons: Array<{ id: MixtureSample; en: string; ne: string; type: 'homo' | 'hetero' }> = [
    { id: 'salt', en: 'Salt + Water', ne: 'नून + पानी', type: 'homo' },
    { id: 'sugar', en: 'Sugar + Water', ne: 'चिनी + पानी', type: 'homo' },
    { id: 'sand', en: 'Sand + Water', ne: 'बालुवा + पानी', type: 'hetero' },
    { id: 'oil', en: 'Oil + Water', ne: 'तेल + पानी', type: 'hetero' },
    { id: 'chalk', en: 'Chalk + Water', ne: 'चक + पानी', type: 'hetero' },
  ];

  return (
    <SimulationLayout
      titleEn="Mixture Laboratory"
      titleNe="मिश्रण प्रयोगशाला"
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
          {/* Sample Selector */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Beaker size={18} />
              {lang === 'en' ? 'Select Mixture Sample' : 'मिश्रणको नमुना छान्नुहोस्'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              {sampleButtons.map(btn => (
                <button
                  key={btn.id}
                  onClick={() => {
                    setSample(btn.id);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: sample === btn.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: sample === btn.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: sample === btn.id ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>{lang === 'en' ? btn.en : btn.ne}</div>
                  <div style={{ fontSize: '9px', color: btn.type === 'homo' ? '#34d399' : '#fbbf24', marginTop: '2px' }}>
                    {btn.type === 'homo'
                      ? (lang === 'en' ? '● Homogeneous' : '● सजातीय')
                      : (lang === 'en' ? '▲ Heterogeneous' : '▲ विजातीय')}
                  </div>
                </button>
              ))}
            </div>

            {/* Action Buttons: Stir & Laser */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => {
                  setIsStirring(s => !s);
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isStirring ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
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
                <RefreshCw size={14} className={isStirring ? 'animate-spin' : ''} />
                {isStirring
                  ? (lang === 'en' ? 'Stop Stirring' : 'हल्लाउन बन्द')
                  : (lang === 'en' ? 'Stir Beaker' : 'चम्चाले हल्लाउनुहोस्')}
              </button>

              <button
                onClick={() => {
                  setIsLaserOn(l => !l);
                  ScienceAudio.playClick();
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: isLaserOn ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                  background: isLaserOn ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                  color: isLaserOn ? '#ef4444' : '#f8fafc',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Zap size={14} />
                {isLaserOn
                  ? (lang === 'en' ? 'Laser ON' : 'लेजर चालु')
                  : (lang === 'en' ? 'Laser OFF' : 'लेजर बन्द')}
              </button>
            </div>
          </div>

          {/* Classification Info Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: isHomogeneous ? '#34d399' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {isHomogeneous
                ? (lang === 'en' ? 'Homogeneous Mixture (सजातीय मिश्रण)' : 'सजातीय मिश्रण')
                : (lang === 'en' ? 'Heterogeneous Mixture (विजातीय मिश्रण)' : 'विजातीय मिश्रण')}
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
              {isHomogeneous
                ? (lang === 'en'
                  ? 'Constituent particles are uniformly distributed throughout the solution and cannot be seen separately even under a normal microscope. Does not scatter light (Tyndall effect negative).'
                  : 'मिश्रणका कणहरू पुरै घोलमा समान रूपले फैलिएका हुन्छन् र नाङ्गो आँखाले छुट्ट्याउन सकिँदैन। प्रकाशको किरण छरिँदैन (टिण्डल प्रभाव नेगेटिभ)।')
                : (lang === 'en'
                  ? 'Constituents are not uniformly mixed and distinct boundaries are visible (e.g. sand settles, oil floats). Suspended particles scatter light making laser path visible!'
                  : 'घटकहरू समान रूपले मिसिएका हुँदैनन् र छुट्टाछुट्टै तह वा कण प्रस्ट देखिन्छन् (जस्तै बालुवा थिग्रिन्छ, तेल तैरिन्छ)। यसले प्रकाशको किरण छरेर बाटो देखाउँछ (टिण्डल प्रभाव)!')}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: Types of Mixtures' : '१. खोज: मिश्रणका प्रकार')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Stirring & Dispersion' : '२. अन्वेषण: घोल्ने र फैलावट')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Tyndall Effect' : '३. अवलोकन: टिण्डल प्रभाव')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: True Solution' : '४. बुझाइ: वास्तविक घोल')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Mixture Quiz' : '५. चुनौती: मिश्रण प्रश्नोत्तरी')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Click through the mixture samples to compare how soluble substances (salt/sugar) behave versus insoluble ones (sand/oil/chalk).'
                  : 'घुलनशील (नून/चिनी) र अघुलनशील (बालुवा/तेल/चक) पदार्थहरूको व्यवहार तुलना गर्न नमुनाहरू छान्नुहोस्।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Turn on stirring. Notice how stirring speeds up dissolving for salt/sugar, but sand settles back down as soon as stirring stops.'
                  : 'घोल्ने बटन थिच्नुहोस्। हल्लाउँदा नून/चिनी छिट्टै घुल्छ, तर बालुवा हल्लाउन छाड्ने बित्तिकै फेरि पिँधमा थिग्रिन्छ।')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Turn on the red laser pointer. Compare the laser beam path inside the salt solution versus the chalk suspension.'
                  : 'रातो लेजर बटन थिच्नुहोस्। नूनको घोलमा र चकको धूलो भएको पानीमा लेजरको किरण कस्तो देखिन्छ दाँज्नुहोस्।')}
                {stage === 'understand' && (lang === 'en'
                  ? 'In true solutions, solute particles are smaller than 1 nanometer and cannot scatter visible light rays.'
                  : 'सजातीय वास्तविक घोलमा घुल्यका कणहरू १ नानोमिटर भन्दा साना हुने भएकाले तिनले प्रकाश छर्न सक्दैनन्।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'Which of the following is a homogeneous mixture?'
                    : 'तलका मध्ये कुन चाहिँ सजातीय मिश्रण हो?'}
                </p>
                {[
                  { id: 1, en: 'Chalk powder in water', ne: 'चकको धूलो र पानी' },
                  { id: 2, en: 'Salt completely dissolved in water', ne: 'पानीमा राम्ररी घुलेको नून' },
                  { id: 3, en: 'Mustard oil in water', ne: 'पानीमा तोरीको तेल' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setQuizAnswer(opt.id);
                      if (opt.id === 2) {
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
                        ? (opt.id === 2 ? '1px solid #22c55e' : '1px solid #ef4444')
                        : '1px solid rgba(255,255,255,0.1)',
                      background: quizAnswer === opt.id
                        ? (opt.id === 2 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)')
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
