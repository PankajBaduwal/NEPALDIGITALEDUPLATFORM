/**
 * MetalsNonMetalsLabSim.tsx
 * Simulation 37: 2D Metals and Non-metals Laboratory
 * Grade 6 Science • Unit 10: Materials in Daily Life
 *
 * Full 2D Interactive Materials Workbench featuring 4 physical tests:
 * 1. Hammer Malleability Test: Metals flatten; non-metals shatter
 * 2. Electric Conductivity Test: Lamp circuit with flowing electrons
 * 3. Surface Lustre Test: Sandpaper reveals metallic sheen and sparkles
 * 4. Sonorous Ring Test: Striking creates resonant acoustic sound rings
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Hammer, Zap, Bell, Sparkles, CheckCircle2 } from 'lucide-react';

type MaterialSample = 'copper' | 'iron' | 'aluminium' | 'sulfur' | 'coal_carbon';
type PhysicalTest = 'malleability' | 'conductivity' | 'lustre' | 'sonorous';

interface MaterialInfo {
  id: MaterialSample;
  nameEn: string;
  nameNe: string;
  isMetal: boolean;
  color: string;
  lustreColor: string;
}

const MATERIALS: MaterialInfo[] = [
  { id: 'copper', nameEn: 'Copper', nameNe: 'तामा (Copper)', isMetal: true, color: '#b45309', lustreColor: '#fb923c' },
  { id: 'iron', nameEn: 'Iron', nameNe: 'फलाम (Iron)', isMetal: true, color: '#475569', lustreColor: '#cbd5e1' },
  { id: 'aluminium', nameEn: 'Aluminium', nameNe: 'आल्मुनियम (Aluminium)', isMetal: true, color: '#64748b', lustreColor: '#f8fafc' },
  { id: 'sulfur', nameEn: 'Sulfur', nameNe: 'गन्धक (Sulfur)', isMetal: false, color: '#eab308', lustreColor: '#ca8a04' },
  { id: 'coal_carbon', nameEn: 'Charcoal', nameNe: 'काठको कोइला (Charcoal)', isMetal: false, color: '#1e293b', lustreColor: '#0f172a' },
];

export const MetalsNonMetalsLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Testing State
  const [sampleId, setSampleId] = useState<MaterialSample>('copper');
  const [activeTest, setActiveTest] = useState<PhysicalTest>('malleability');
  const [isActing, setIsActing] = useState<boolean>(false);
  const [isShattered, setIsShattered] = useState<boolean>(false);
  const [isFlattened, setIsFlattened] = useState<boolean>(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const currentMat = MATERIALS.find(m => m.id === sampleId) || MATERIALS[0];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Sound rings for sonorous test
  const soundRingsRef = useRef<Array<{ r: number; alpha: number }>>([]);

  const handleReset = () => {
    setIsActing(false);
    setIsShattered(false);
    setIsFlattened(false);
    soundRingsRef.current = [];
    ScienceAudio.playWhoosh();
  };

  // Trigger test action
  const runTest = () => {
    setIsActing(true);
    if (activeTest === 'malleability') {
      ScienceAudio.playClick();
      setTimeout(() => {
        if (currentMat.isMetal) {
          setIsFlattened(true);
          ScienceAudio.playSuccess();
        } else {
          setIsShattered(true);
          ScienceAudio.playWhoosh();
        }
        setIsActing(false);
        if (!isCompleted) {
          setIsCompleted(true);
          setStars(3);
        }
      }, 700);
    } else if (activeTest === 'sonorous') {
      if (currentMat.isMetal) {
        ScienceAudio.playCelebration();
        soundRingsRef.current = [
          { r: 20, alpha: 1 },
          { r: 40, alpha: 0.8 },
          { r: 60, alpha: 0.6 },
        ];
      } else {
        ScienceAudio.playWhoosh();
      }
      setTimeout(() => setIsActing(false), 800);
    } else {
      ScienceAudio.playSuccess();
      setTimeout(() => setIsActing(false), 1200);
    }
  };

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

      // Lab Backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#f8fafc');
      bg.addColorStop(0.7, '#f1f5f9');
      bg.addColorStop(1, '#ffffff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Workbench
      const tableY = h - 60;
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, tableY, w - 40, 20);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, tableY + 20, w - 40, 40);

      const cx = w * 0.45;

      if (activeTest === 'malleability') {
        // --- 1. MALLEABILITY ANVIL & HAMMER ---
        // Steel Anvil Block
        const anvilW = 180;
        const anvilH = 80;
        const anvilY = tableY - anvilH;

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cx - anvilW / 2, anvilY, anvilW, anvilH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.fillRect(cx - anvilW / 2 + 10, anvilY, anvilW - 20, 10); // flat hardened steel top

        // Material Sample on anvil
        const sampleBaseY = anvilY;
        if (!isShattered) {
          const sampleW = isFlattened ? 120 : 50;
          const sampleH = isFlattened ? 8 : 40;
          ctx.fillStyle = currentMat.color;
          ctx.beginPath();
          ctx.roundRect(cx - sampleW / 2, sampleBaseY - sampleH, sampleW, sampleH, isFlattened ? 2 : 6);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Shattered non-metal fragments!
          ctx.fillStyle = currentMat.color;
          for (let f = 0; f < 10; f++) {
            const fx = cx + Math.sin(f * 2.3) * 60;
            const fy = sampleBaseY - 4 - Math.abs(Math.cos(f * 3.1) * 8);
            ctx.fillRect(fx, fy, 8, 6);
          }
        }

        // Animated Blacksmith Hammer
        const hammerRot = isActing ? 0 : -Math.PI / 4;
        const hammerPivotX = cx + 80;
        const hammerPivotY = anvilY - 140;

        ctx.save();
        ctx.translate(hammerPivotX, hammerPivotY);
        ctx.rotate(hammerRot);

        // Hammer Wooden Handle
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-10, -10, 20, 150);

        // Heavy Iron Hammer Head
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-40, 140, 80, 45, 6);
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Malleability status banner
        if (isFlattened) {
          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(lang === 'en' ? '✓ Malleable: Flattened into sheet without breaking!' : '✓ कुटिएर पाता बन्यो (कुट्दा पाता बन्ने गुण)!', cx - 140, anvilY - 80);
        } else if (isShattered) {
          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(lang === 'en' ? '✗ Brittle: Shattered into powdery pieces!' : '✗ सजिलै टुक्रा-टुक्रा भयो (कमजोर र भंगुर)!', cx - 120, anvilY - 80);
        }
      } else if (activeTest === 'conductivity') {
        // --- 2. ELECTRICAL CONDUCTIVITY CIRCUIT ---
        // Battery cell on left
        const batX = cx - 130;
        const batY = tableY - 120;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(batX - 30, batY - 20, 60, 40);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(batX + 30, batY - 8, 8, 16); // (+) terminal
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('1.5V Cell', batX - 24, batY + 4);

        // Light bulb on right
        const bulbX = cx + 130;
        const bulbY = tableY - 120;
        ctx.fillStyle = '#475569';
        ctx.fillRect(bulbX - 16, bulbY + 10, 32, 20); // base socket

        // Bulb glass & glow
        const isBulbLit = currentMat.isMetal;
        if (isBulbLit) {
          const bulbGlow = ctx.createRadialGradient(bulbX, bulbY - 10, 5, bulbX, bulbY - 10, 45);
          bulbGlow.addColorStop(0, '#ffffff');
          bulbGlow.addColorStop(0.3, '#fef08a');
          bulbGlow.addColorStop(0.8, 'rgba(250, 204, 21, 0.4)');
          bulbGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
          ctx.fillStyle = bulbGlow;
          ctx.beginPath();
          ctx.arc(bulbX, bulbY - 10, 45, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = isBulbLit ? '#facc15' : 'rgba(255, 255, 255, 0.2)';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bulbX, bulbY - 10, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Sample placed between circuit test probes in center
        const sampleX = cx;
        const sampleY = tableY - 40;
        const sW = 60;
        const sH = 30;

        ctx.fillStyle = currentMat.color;
        ctx.fillRect(sampleX - sW / 2, sampleY - sH / 2, sW, sH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(sampleX - sW / 2, sampleY - sH / 2, sW, sH);

        // Connecting Wires
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;
        // Wire 1: Battery to Sample
        ctx.beginPath();
        ctx.moveTo(batX - 30, batY);
        ctx.lineTo(batX - 60, batY);
        ctx.lineTo(batX - 60, sampleY);
        ctx.lineTo(sampleX - sW / 2, sampleY);
        ctx.stroke();

        // Wire 2: Sample to Bulb
        ctx.beginPath();
        ctx.moveTo(sampleX + sW / 2, sampleY);
        ctx.lineTo(bulbX + 50, sampleY);
        ctx.lineTo(bulbX + 50, bulbY + 20);
        ctx.lineTo(bulbX + 16, bulbY + 20);
        ctx.stroke();

        // Wire 3: Bulb to Battery
        ctx.beginPath();
        ctx.moveTo(bulbX - 16, bulbY + 20);
        ctx.lineTo(batX + 38, batY);
        ctx.stroke();

        // Flowing electron dots if metal
        if (currentMat.isMetal) {
          ctx.fillStyle = '#38bdf8';
          for (let e = 0; e < 10; e++) {
            const ex = (sampleX - sW / 2 + ((t * 80 + e * 30) % (sW * 3))) - sW;
            if (ex >= sampleX - sW / 2 && ex <= sampleX + sW / 2) {
              ctx.beginPath();
              ctx.arc(ex, sampleY, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Conductivity verdict
        ctx.font = 'bold 13px sans-serif';
        if (currentMat.isMetal) {
          ctx.fillStyle = '#34d399';
          ctx.fillText(lang === 'en' ? '✓ Good Conductor of Electricity!' : '✓ विद्युतको राम्रो सुचालक (Good Conductor)!', cx - 120, tableY - 160);
        } else {
          ctx.fillStyle = '#f87171';
          ctx.fillText(lang === 'en' ? '✗ Poor Conductor / Insulator!' : '✗ विद्युतको कुचालक (Insulator / Non-conductor)!', cx - 130, tableY - 160);
        }
      } else if (activeTest === 'lustre') {
        // --- 3. METALLIC LUSTRE TEST ---
        // Sample block in center
        const sampleW = 140;
        const sampleH = 90;
        const sampleY = tableY - 110;

        ctx.fillStyle = currentMat.color;
        ctx.fillRect(cx - sampleW / 2, sampleY, sampleW, sampleH);

        // Polished half with sandpaper
        const polishW = sampleW * 0.55;
        ctx.fillStyle = currentMat.lustreColor;
        ctx.fillRect(cx - sampleW / 2 + sampleW * 0.45, sampleY, polishW, sampleH);

        // Sparkle glints if metal
        if (currentMat.isMetal) {
          ctx.fillStyle = '#ffffff';
          for (let s = 0; s < 6; s++) {
            const sx = cx + 15 + Math.sin(t * 5 + s) * 35;
            const sy = sampleY + 20 + Math.cos(t * 4 + s) * 30;
            ctx.beginPath();
            ctx.arc(sx, sy, 2 + Math.sin(t * 8 + s) * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Sandpaper sheet
        const sandX = cx + 80;
        const sandY = sampleY - 40 + Math.sin(t * 8) * 10;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(sandX, sandY, 50, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('Sandpaper', sandX + 2, sandY + 22);

        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(lang === 'en' ? 'Unpolished' : 'नघोटिएको', cx - sampleW / 2, sampleY + sampleH + 18);
        ctx.fillText(lang === 'en' ? 'Polished Surface' : 'घोटिएको चम्किलो भाग', cx + 10, sampleY + sampleH + 18);
      } else if (activeTest === 'sonorous') {
        // --- 4. SONOROUS CHIME TEST ---
        // Suspended sample by thread
        const sampleY = tableY - 140;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, tableY - 240);
        ctx.lineTo(cx, sampleY - 30);
        ctx.stroke();

        ctx.fillStyle = currentMat.color;
        ctx.beginPath();
        ctx.arc(cx, sampleY, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Acoustic sound ripple rings expanding outwards
        if (currentMat.isMetal && soundRingsRef.current.length > 0) {
          soundRingsRef.current.forEach(ring => {
            ring.r += 1.5;
            ring.alpha -= 0.015;
            if (ring.alpha > 0) {
              ctx.strokeStyle = `rgba(56, 189, 248, ${ring.alpha})`;
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.arc(cx, sampleY, ring.r, 0, Math.PI * 2);
              ctx.stroke();
            }
          });
        }

        // Striking rod
        const rodX = cx - 70;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(rodX - 30, sampleY - 20);
        ctx.lineTo(rodX + 15, sampleY);
        ctx.stroke();

        // Verdict
        ctx.font = 'bold 13px sans-serif';
        if (currentMat.isMetal) {
          ctx.fillStyle = '#34d399';
          ctx.fillText(lang === 'en' ? '🔔 Sonorous: Produces clear ringing metallic chime!' : '🔔 सुमधुर ध्वनि (Sonorous): प्रस्ट टिनिनि आवाज निकाल्छ!', cx - 140, tableY - 40);
        } else {
          ctx.fillStyle = '#f87171';
          ctx.fillText(lang === 'en' ? 'Dull sound: Non-sonorous (no ringing sound).' : 'धमिलो आवाज: सुमधुर ध्वनि नआउने (Non-sonorous)।', cx - 120, tableY - 40);
        }
      }

      // HUD Badge in top-left
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 250, 75, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Testing Material:' : 'परीक्षण गरिएको पदार्थ:', 32, 40);
      ctx.fillStyle = currentMat.isMetal ? '#38bdf8' : '#f59e0b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(lang === 'en' ? currentMat.nameEn : currentMat.nameNe, 32, 62);
      ctx.fillStyle = currentMat.isMetal ? '#34d399' : '#f87171';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(currentMat.isMetal ? 'CLASSIFICATION: METAL' : 'CLASSIFICATION: NON-METAL', 32, 82);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [currentMat, activeTest, isActing, isFlattened, isShattered, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  return (
    <SimulationLayout
      titleEn="Metals and Non-metals Laboratory"
      titleNe="धातु र अधातु परीक्षण प्रयोगशाला"
      learningAreaEn="Materials"
      learningAreaNe="पदार्थका स्रोतहरू र प्रयोग"
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
          {/* Material Selector */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} />
              {lang === 'en' ? 'Select Material Sample' : 'परीक्षण नमुना छान्नुहोस्'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
              {MATERIALS.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSampleId(m.id);
                    handleReset();
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: sampleId === m.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: sampleId === m.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: sampleId === m.id ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>{lang === 'en' ? m.nameEn : m.nameNe}</div>
                  <div style={{ fontSize: '9px', color: m.isMetal ? '#34d399' : '#fbbf24', marginTop: '2px' }}>
                    {m.isMetal ? '● Metal' : '▲ Non-Metal'}
                  </div>
                </button>
              ))}
            </div>

            {/* Test Selector */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 'bold' }}>
                {lang === 'en' ? 'Select Physical Test:' : 'भौतिक परीक्षण छान्नुहोस्:'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[
                  { id: 'malleability', en: 'Hammer Malleability', ne: 'कुट्दा पाता बन्ने', icon: Hammer },
                  { id: 'conductivity', en: 'Electric Conductivity', ne: 'विद्युत सुचालक', icon: Zap },
                  { id: 'lustre', en: 'Surface Lustre', ne: 'चम्किलोपन', icon: Sparkles },
                  { id: 'sonorous', en: 'Sonorous Ring', ne: 'सुमधुर ध्वनि', icon: Bell },
                ].map(test => {
                  const Icon = test.icon;
                  return (
                    <button
                      key={test.id}
                      onClick={() => {
                        setActiveTest(test.id as PhysicalTest);
                        handleReset();
                        ScienceAudio.playClick();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: activeTest === test.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                        background: activeTest === test.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                        color: activeTest === test.id ? '#ffffff' : '#94a3b8',
                        fontWeight: 'bold',
                        fontSize: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon size={14} />
                      <span>{lang === 'en' ? test.en : test.ne}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Run Test Button */}
            <button
              onClick={runTest}
              disabled={isActing}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} />
              {lang === 'en' ? 'Perform Physical Test' : 'परीक्षण गर्नुहोस्'}
            </button>
          </div>

          {/* Educational Concept Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {lang === 'en' ? 'Key Differences: Metals vs Non-Metals' : 'धातु र अधातुका मुख्य भिन्नता'}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en'
                ? 'Metals are lustrous, malleable (can be beaten into sheets), ductile (can be drawn into wires), sonorous, and excellent conductors of heat and electricity. Non-metals are brittle, dull, and electrical insulators.'
                : 'धातुहरू चम्किला, कुट्दा पाता बन्ने (Malleable), तन्काएर तार बनाउन सकिने (Ductile), ठटाउँदा टिनिनि आवाज आउने (Sonorous), र ताप तथा विद्युतका राम्रा सुचालक हुन्छन्। अधातुहरू भने कमजोर, टल्किन नसक्ने र कुचालक हुन्छन्।'}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: Materials Around Us' : '1. खोज: वरपरका वस्तुहरू')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Testing Properties' : '2. अन्वेषण: गुण परीक्षण')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Malleability vs Brittleness' : '3. अवलोकन: लचिलोपन र भंगुरता')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: Conduction Flow' : '4. बुझाइ: विद्युत प्रवाह')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Classification Quiz' : '5. चुनौती: धातु प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'From copper electric wires to coal fuel, human civilization is built upon knowing the distinct properties of elements.'
                  : 'बिजुलीका तामाका तारदेखि बाल्ने कोइलासम्म, मानव सभ्यता पदार्थका विभिन्न गुणहरूको सही पहिचानमा निर्भर छ।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Switch between Copper and Charcoal, then click "Hammer Malleability". Watch how metal deforms plastically while charcoal shatters into dust!'
                  : 'तामा र कोइला बीच बदल्नुहोस्, र "कुट्दा पाता बन्ने" परीक्षण गर्नुहोस्। धातु पाता बन्छ तर कोइला फुटेर धूलो हुन्छ!')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Test conductivity: Notice the light bulb turns brightly on for Copper, Iron, and Aluminium, but stays off for Sulfur.'
                  : 'विद्युत सुचालक परीक्षण गर्नुहोस्: तामा, फलाम र आल्मुनियममा चिम बल्छ, तर गन्धक (Sulfur) मा चिम बल्दैन।')}
                {stage === 'understand' && (lang === 'en'
                  ? 'Metals have free delocalized valence electrons that carry both electrical current and acoustic vibrations rapidly.'
                  : 'धातुहरूमा स्वतन्त्र इलेक्ट्रोनहरू हुने भएकाले तिनले विद्युत र कम्पनलाई सजिलै एक ठाउँबाट अर्को ठाउँमा लैजान्छन्।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'The property of metals that allows them to be beaten into thin sheets without breaking is called:'
                    : 'धातुलाई नभाँचीकन कुटेर पातलो पाता बनाउन सकिने गुणलाई के भनिन्छ?'}
                </p>
                {[
                  { id: 1, en: 'Malleability', ne: 'कुट्दा पाता बन्ने गुण (Malleability)' },
                  { id: 2, en: 'Ductility', ne: 'तन्कने गुण (Ductility)' },
                  { id: 3, en: 'Brittleness', ne: 'भंगुरता (Brittleness)' },
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
