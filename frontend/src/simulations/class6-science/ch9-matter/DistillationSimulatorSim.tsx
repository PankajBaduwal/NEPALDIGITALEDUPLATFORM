/**
 * DistillationSimulatorSim.tsx
 * Simulation 34: 2D Distillation Simulator (आसवन प्रक्रिया सिमुलेटर)
 * Grade 6 Science • Unit 9: Matter (पदार्थ)
 *
 * Full 2D Interactive Chemistry Distillation Apparatus featuring:
 * 1. Liebig Condenser Assembly: Round-bottom flask, wire gauze, tripod, burner,
 *    thermometer (100°C), water-jacketed condenser tube, receiver flask.
 * 2. Distillation Formula: Distillation = Evaporation + Condensation (आसवन = वाष्पीकरण + संघनन)
 * 3. Steam generation in boiling flask, vapor condensation, droplet flow, and pure distilled water collection.
 * 4. Coolant flow simulation (Cold water IN at bottom, Warm water OUT at top).
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Flame, Droplets, Thermometer, Sparkles, Play, RotateCcw, CheckCircle2 } from 'lucide-react';

export const DistillationSimulatorSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Distillation Simulation State
  const [isHeating, setIsHeating] = useState<boolean>(false);
  const [coolantOn, setCoolantOn] = useState<boolean>(true);
  const [tempC, setTempC] = useState<number>(25);
  const [collectedMl, setCollectedMl] = useState<number>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Particles for boiling bubbles and steam
  const bubblesRef = useRef<Array<{ x: number; y: number; r: number; speed: number }>>([]);
  const dropsRef = useRef<Array<{ x: number; y: number; speed: number; alpha: number }>>([]);

  // Initialize bubbles
  useEffect(() => {
    const bubbles: Array<{ x: number; y: number; r: number; speed: number }> = [];
    for (let i = 0; i < 25; i++) {
      bubbles.push({
        x: Math.random() * 60 - 30,
        y: Math.random() * 40,
        r: Math.random() * 3 + 2,
        speed: Math.random() * 1.5 + 1,
      });
    }
    bubblesRef.current = bubbles;
  }, []);

  // Simulation physics ticker
  useEffect(() => {
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isHeating) {
        setTempC(prev => {
          const target = 100;
          const next = Math.min(target, prev + dt * 15);
          return Math.round(next * 10) / 10;
        });

        if (tempC >= 95 && coolantOn) {
          setCollectedMl(prev => {
            const next = Math.min(180, prev + dt * 8);
            if (next >= 120 && !isCompleted) {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
            }
            return Math.round(next * 10) / 10;
          });
        }
      } else {
        setTempC(prev => {
          const next = Math.max(25, prev - dt * 10);
          return Math.round(next * 10) / 10;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isHeating, coolantOn, tempC, isCompleted]);

  // 2D Canvas Animation Loop
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
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.7, '#1e293b');
      bgGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Tabletop
      const tableY = h - 60;
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, tableY, w - 40, 20);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, tableY + 20, w - 40, 40);

      // Coordinates setup
      // Flask Center:
      const flaskX = w * 0.22;
      const flaskY = tableY - 140;
      const flaskR = 48;

      // 1. Bunsen Burner & Tripod
      const burnerX = flaskX;
      const burnerBaseY = tableY;
      const burnerTopY = tableY - 70;

      // Tripod legs
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(flaskX - 45, tableY);
      ctx.lineTo(flaskX - 35, burnerTopY);
      ctx.lineTo(flaskX + 35, burnerTopY);
      ctx.lineTo(flaskX + 45, tableY);
      ctx.stroke();

      // Tripod Ring & Wire Gauze
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(flaskX - 42, burnerTopY - 4, 84, 6);
      // Wire Gauze mesh pattern
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      for (let gx = flaskX - 38; gx <= flaskX + 38; gx += 6) {
        ctx.beginPath();
        ctx.moveTo(gx, burnerTopY - 4);
        ctx.lineTo(gx, burnerTopY + 2);
        ctx.stroke();
      }

      // Bunsen Burner Body
      ctx.fillStyle = '#475569';
      ctx.fillRect(burnerX - 25, burnerBaseY - 10, 50, 10); // base
      ctx.fillStyle = '#64748b';
      ctx.fillRect(burnerX - 6, burnerTopY + 18, 12, burnerBaseY - burnerTopY - 28); // tube

      // Burner Flame (if heating)
      if (isHeating) {
        const flicker = Math.sin(t * 15) * 4;
        const flameGrad = ctx.createRadialGradient(burnerX, burnerTopY + 14, 2, burnerX, burnerTopY + 4, 18);
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.3, '#38bdf8');
        flameGrad.addColorStop(0.7, '#0284c7');
        flameGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(burnerX - 12, burnerTopY + 16);
        ctx.quadraticCurveTo(burnerX, burnerTopY - 18 + flicker, burnerX + 12, burnerTopY + 16);
        ctx.closePath();
        ctx.fill();

        // Inner hot blue cone
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.moveTo(burnerX - 6, burnerTopY + 16);
        ctx.quadraticCurveTo(burnerX, burnerTopY - 6 + flicker * 0.5, burnerX + 6, burnerTopY + 16);
        ctx.closePath();
        ctx.fill();
      }

      // 2. Round-bottom Flask
      // Flask Neck
      const neckW = 20;
      const neckTop = flaskY - 110;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;

      // Flask Solution (Impure salt water / Copper sulfate solution - Deep Cyan)
      ctx.save();
      ctx.beginPath();
      ctx.arc(flaskX, flaskY, flaskR - 2, 0, Math.PI * 2);
      ctx.clip();

      const solHeight = 55;
      const solGrad = ctx.createLinearGradient(0, flaskY, 0, flaskY + flaskR);
      solGrad.addColorStop(0, '#0284c7');
      solGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = solGrad;
      ctx.fillRect(flaskX - flaskR, flaskY + flaskR - solHeight, flaskR * 2, solHeight);

      // Boiling Bubbles
      if (isHeating && tempC > 50) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        bubblesRef.current.forEach(b => {
          b.y += b.speed * (tempC / 50);
          if (b.y > solHeight) {
            b.y = 0;
            b.x = (Math.random() - 0.5) * (flaskR * 1.4);
          }
          const bx = flaskX + b.x;
          const by = flaskY + flaskR - b.y;
          ctx.beginPath();
          ctx.arc(bx, by, b.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();

      // Flask Outline
      ctx.beginPath();
      // Round bottom
      ctx.arc(flaskX, flaskY, flaskR, Math.PI * 0.15, Math.PI * 0.85, false);
      // Neck left
      ctx.lineTo(flaskX - neckW / 2, neckTop);
      ctx.lineTo(flaskX + neckW / 2, neckTop);
      // Neck right to bulb
      ctx.lineTo(flaskX + neckW / 2, flaskY - flaskR * 0.7);
      ctx.stroke();

      // Side arm exit of flask
      const sideArmStartX = flaskX + neckW / 2;
      const sideArmStartY = flaskY - 65;
      const condStartX = flaskX + 60;
      const condStartY = flaskY - 45;

      ctx.beginPath();
      ctx.moveTo(sideArmStartX, sideArmStartY - 6);
      ctx.lineTo(condStartX, condStartY - 6);
      ctx.lineTo(condStartX, condStartY + 6);
      ctx.lineTo(sideArmStartX, sideArmStartY + 6);
      ctx.stroke();

      // Rubber stopper on top of flask
      ctx.fillStyle = '#475569';
      ctx.fillRect(flaskX - neckW / 2 - 2, neckTop - 8, neckW + 4, 10);

      // Thermometer inside stopper down into vapor
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(flaskX, neckTop - 50);
      ctx.lineTo(flaskX, flaskY - 40);
      ctx.stroke();

      // Thermometer red mercury column proportional to temp
      const thermoTop = neckTop - 45;
      const thermoBot = flaskY - 42;
      const thermoSpan = thermoBot - thermoTop;
      const mercuryH = ((tempC - 20) / 80) * thermoSpan;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(flaskX, thermoBot);
      ctx.lineTo(flaskX, thermoBot - mercuryH);
      ctx.stroke();
      // Thermometer bulb
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(flaskX, thermoBot, 3, 0, Math.PI * 2);
      ctx.fill();

      // 3. Liebig Condenser (Slanted assembly)
      // Slanted line parameters
      const condEndX = w * 0.68;
      const condEndY = tableY - 110;
      const angle = Math.atan2(condEndY - condStartY, condEndX - condStartX);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const normalX = -sinA;
      const normalY = cosA;

      // Outer cooling jacket (Glass)
      const jacketW = 24;
      ctx.fillStyle = coolantOn ? 'rgba(56, 189, 248, 0.18)' : 'rgba(148, 163, 184, 0.1)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(condStartX + normalX * jacketW, condStartY + normalY * jacketW);
      ctx.lineTo(condEndX + normalX * jacketW, condEndY + normalY * jacketW);
      ctx.lineTo(condEndX - normalX * jacketW, condEndY - normalY * jacketW);
      ctx.lineTo(condStartX - normalX * jacketW, condStartY - normalY * jacketW);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner vapor tube
      const innerW = 7;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(condStartX + normalX * innerW, condStartY + normalY * innerW);
      ctx.lineTo(condEndX + 35 + normalX * innerW, condEndY + 20 + normalY * innerW);
      ctx.lineTo(condEndX + 35 - normalX * innerW, condEndY + 20 - normalY * innerW);
      ctx.lineTo(condStartX - normalX * innerW, condStartY - normalY * innerW);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Coolant water ports
      // Cold Water IN (at bottom end)
      const inX = condEndX - 30;
      const inY = condEndY - 20;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(inX, inY + 20, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Water IN (Cold) ↓' : 'चिसो पानी भित्र ↓', inX - 35, inY + 40);

      // Warm Water OUT (at top end)
      const outX = condStartX + 30;
      const outY = condStartY + 20;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(outX, outY - 20, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Water OUT (Warm) ↑' : 'तातो पानी बाहिर ↑', outX - 35, outY - 30);

      // Condensing vapor dots & droplets inside inner tube
      if (tempC >= 80) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 12; i++) {
          const frac = ((t * 0.4 + i / 12) % 1);
          const px = condStartX + (condEndX - condStartX) * frac;
          const py = condStartY + (condEndY - condStartY) * frac;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Distillate Delivery adapter & Receiver Conical Flask
      const recvX = condEndX + 45;
      const recvY = tableY - 60;
      const recvW = 55;
      const recvH = 60;

      // Delivery drip tip
      const tipX = condEndX + 35;
      const tipY = condEndY + 20;

      // Falling pure water drop
      if (tempC >= 95 && coolantOn) {
        const dropY = tipY + ((t * 80) % (recvY - tipY));
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(tipX, dropY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Receiver Flask (Conical Flask)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(recvX - 10, recvY - recvH + 10);
      ctx.lineTo(recvX - 10, recvY - recvH + 25);
      ctx.lineTo(recvX - recvW / 2, recvY);
      ctx.lineTo(recvX + recvW / 2, recvY);
      ctx.lineTo(recvX + 10, recvY - recvH + 25);
      ctx.lineTo(recvX + 10, recvY - recvH + 10);
      ctx.stroke();

      // Pure Distillate Liquid collected
      const collH = Math.min(35, (collectedMl / 180) * 35);
      if (collH > 0) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.beginPath();
        ctx.moveTo(recvX - (recvW / 2 - 2), recvY - 1);
        ctx.lineTo(recvX + (recvW / 2 - 2), recvY - 1);
        ctx.lineTo(recvX + (recvW / 2 - 2 - collH * 0.4), recvY - collH);
        ctx.lineTo(recvX - (recvW / 2 - 2 - collH * 0.4), recvY - collH);
        ctx.closePath();
        ctx.fill();
      }

      // Labels on canvas
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(lang === 'en' ? 'Boiling Flask (मिश्रण भएको भाँडो)' : 'उमाल्ने फ्लास्क', flaskX - 70, flaskY - flaskR - 15);
      ctx.fillText(lang === 'en' ? 'Liebig Condenser (कन्डेन्सर)' : 'कन्डेन्सर नली', condStartX + 80, condStartY - 30);
      ctx.fillText(lang === 'en' ? 'Distillate (शुद्ध पानी)' : 'आसवन पानी', recvX - 35, tableY + 15);

      // Live metrics HUD in top-left
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(25, 25, 240, 85, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText(lang === 'en' ? 'Distillation Temperature:' : 'तापक्रम:', 38, 50);
      ctx.fillStyle = tempC >= 100 ? '#ef4444' : tempC >= 60 ? '#f59e0b' : '#38bdf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`${tempC.toFixed(1)} °C ${tempC >= 100 ? '(Boiling / उम्लिरहेको)' : ''}`, 38, 72);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${lang === 'en' ? 'Distillate Volume:' : 'जम्मा भएको पानी:'} ${collectedMl.toFixed(0)} mL`, 38, 95);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isHeating, coolantOn, tempC, collectedMl, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  const handleReset = () => {
    setIsHeating(false);
    setTempC(25);
    setCollectedMl(0);
    ScienceAudio.playWhoosh();
  };

  return (
    <SimulationLayout
      titleEn="Distillation Apparatus Simulator"
      titleNe="आसवन प्रक्रिया सिमुलेटर"
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

        {/* Sidebar Controls & Educational Inquiry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Main Control Panel */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} />
              {lang === 'en' ? 'Laboratory Controls' : 'प्रयोगशाला नियन्त्रण'}
            </h3>

            {/* Heat Toggle Button */}
            <button
              onClick={() => {
                setIsHeating(h => !h);
                ScienceAudio.playClick();
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: isHeating ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: '#ffffff',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px',
                boxShadow: isHeating ? '0 0 16px rgba(239,68,68,0.4)' : 'none',
              }}
            >
              <Flame size={18} />
              {isHeating
                ? (lang === 'en' ? 'Turn OFF Bunsen Burner' : 'बन्सेन बर्नर बन्द गर्नुहोस्')
                : (lang === 'en' ? 'Ignite Bunsen Burner' : 'बन्सेन बर्नर बाल्नुहोस्')}
            </button>

            {/* Coolant Toggle */}
            <button
              onClick={() => {
                setCoolantOn(c => !c);
                ScienceAudio.playClick();
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                background: coolantOn ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                color: coolantOn ? '#38bdf8' : '#94a3b8',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <Droplets size={16} />
              {coolantOn
                ? (lang === 'en' ? 'Cooling Water: RUNNING' : 'शीतलक पानी: चालु')
                : (lang === 'en' ? 'Cooling Water: OFF' : 'शीतलक पानी: बन्द')}
            </button>

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
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={14} />
              {lang === 'en' ? 'Reset Experiment' : 'पुनः सुरु गर्नुहोस्'}
            </button>
          </div>

          {/* Scientific Formula Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {lang === 'en' ? 'Distillation Principle (आसवन सिद्धान्त)' : 'आसवन सिद्धान्त'}
            </h4>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', textAlign: 'center', margin: '8px 0', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8' }}>
                {lang === 'en' ? 'Distillation = Evaporation + Condensation' : 'आसवन = वाष्पीकरण + संघनन'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'When solution boils at 100°C, pure water turns into steam (evaporation). Inside the cold Liebig condenser, steam cools down into liquid droplets (condensation), leaving non-volatile impurities behind!'
                : '१००°C मा घोल उम्लिँदा शुद्ध पानी बाफ बन्छ (वाष्पीकरण)। चिसो लाइबिग कन्डेन्सर भित्र बाफ पुनः तरल थोपामा परिणत हुन्छ (संघनन), र अशुद्धिहरू उमाल्ने फ्लास्कमा नै रहन्छन्!'}
            </p>
          </div>

          {/* Inquiry Stage Guide */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: Apparatus Parts' : '१. खोज: उपकरणका भागहरू')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Heating & Steam' : '२. अन्वेषण: ताप र बाफ निर्माण')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Condensation Flow' : '३. अवलोकन: संघनन र थोपा प्रवाह')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Water Purity' : '४. बुझाइ: पानीको शुद्धता')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Check Knowledge' : '५. चुनौती: ज्ञान परीक्षण')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Notice how cold water enters from the lower inlet and exits through the upper outlet to ensure the jacket is always completely filled.'
                  : 'कन्डेन्सरको बाहिरी ज्याकेट सधैं भरिभराउ रहोस् भनेर चिसो पानी तल्लो मुखबाट हालिन्छ र तातो पानी माथिल्लो मुखबाट बाहिर निस्कन्छ।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Ignite the Bunsen burner. Watch the mercury thread rise up the thermometer to 100°C as boiling begins.'
                  : 'बन्सेन बर्नर बाल्नुहोस्। तापक्रम १००°C मा पुगेपछि पानी उम्लिन सुरु भएको अवलोकन गर्नुहोस्।')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Observe pure distilled water droplets forming in the inner condenser tube and collecting in the receiver.'
                  : 'कन्डेन्सरको भित्री नलीमा शुद्ध पानीका थोपा बनेर रिसिभर फ्लास्कमा जम्मा भएको हेर्नुहोस्।')}
                {stage === 'understand' && (lang === 'en'
                  ? 'Distilled water has zero dissolved salts. It is used in car batteries, laboratories, and medicinal injections.'
                  : 'आसवन गरिएको पानीमा कुनै घुलित लवण हुँदैन। यसलाई गाडीको ब्याट्री, प्रयोगशाला र सुई लगाउने औषधि बनाउन प्रयोग गरिन्छ।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'Why does cold water enter the condenser from the bottom instead of the top?'
                    : 'कन्डेन्सरमा चिसो पानी माथिबाट नहालेर किन तलबाट छिराइन्छ?'}
                </p>
                {[
                  { id: 1, en: 'To fill the jacket completely without air pockets', ne: 'हावाको खाली ठाउँ नराखी ज्याकेट पुरै पानीले भरियोस् भनेर' },
                  { id: 2, en: 'To make the water flow faster', ne: 'पानी छिटो बगोस् भनेर' },
                  { id: 3, en: 'To heat the water up', ne: 'पानी तताउन' },
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
