/**
 * FoodChainExplorerSim.tsx
 * Simulation 10: 2D Food Chain & Energy Pyramid Explorer (आहार शृङ्खला तथा जालो)
 * Grade 6 Science • Unit 4: Environment and Biodiversity (वातावरण र जैविक विविधता)
 *
 * 100% Native HTML5 Canvas 2D Trophic Dynamics Simulator.
 * Features:
 * - 5 Trophic Levels: Producer (Grass) -> Primary (Grasshopper) -> Secondary (Frog) -> Tertiary (Snake) -> Apex (Eagle)
 * - Lindeman's 10% Energy Transfer Law with animated glowing Joules energy packets
 * - Interactive Trophic Cascade Disruption (e.g. Remove Frogs -> Grasshopper pest explosion & Snake starvation)
 * - 2D Stepped Energy & Biomass Pyramid with real joules calculations
 * - Bilingual EN/NE labels, sound effects, and 5-stage inquiry learning
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Zap, AlertTriangle, RefreshCw, Sparkles, ArrowRight, ShieldCheck, Flame, ToggleLeft, ToggleRight, Check } from 'lucide-react';

interface TrophicSpecimen {
  id: string;
  level: number;
  nameEn: string;
  nameNe: string;
  organismEn: string;
  organismNe: string;
  joules: number;
  color: string;
  active: boolean;
  descEn: string;
  descNe: string;
}

export const FoodChainExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [selectedLevelId, setSelectedLevelId] = useState<string>('producer');
  const [disabledLinks, setDisabledLinks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'chain' | 'pyramid'>('chain');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const trophicLevels: TrophicSpecimen[] = [
    {
      id: 'producer',
      level: 1,
      nameEn: 'Trophic Level 1: Producer',
      nameNe: 'प्रथम तह: उत्पादक (Producer)',
      organismEn: 'Paddy / Green Grass',
      organismNe: 'धान तथा हरियो घाँस',
      joules: 10000,
      color: '#22c55e',
      active: !disabledLinks.includes('producer'),
      descEn: 'Captures solar energy via photosynthesis; foundation of terrestrial ecosystem.',
      descNe: 'सूर्यको प्रकाशबाट प्रकाश संश्लेषण गरी १०,००० जुल जैविक शक्ति उत्पादन गर्छ।',
    },
    {
      id: 'primary',
      level: 2,
      nameEn: 'Trophic Level 2: Primary Consumer',
      nameNe: 'दोस्रो तह: प्राथमिक उपभोक्ता (Herbivore)',
      organismEn: 'Grasshopper (फट्याङ्ग्रा)',
      organismNe: 'घाँस खाने फट्याङ्ग्रा',
      joules: 1000,
      color: '#84cc16',
      active: !disabledLinks.includes('primary'),
      descEn: 'Herbivore consuming grass. Retains exactly 10% (1,000 J); 90% lost as heat and metabolism.',
      descNe: 'घाँस खाने शाकाहारी जीव। लिन्डेम्यानको नियम अनुसार १०% (१,००० जुल) मात्र शक्ति सञ्चित गर्छ।',
    },
    {
      id: 'secondary',
      level: 3,
      nameEn: 'Trophic Level 3: Secondary Consumer',
      nameNe: 'तेस्रो तह: द्वितीय उपभोक्ता (Carnivore)',
      organismEn: 'Field Frog (भ्यागुतो)',
      organismNe: 'कीरा खाने भ्यागुतो',
      joules: 100,
      color: '#06b6d4',
      active: !disabledLinks.includes('secondary'),
      descEn: 'Carnivore insectivore feeding on grasshoppers. Retains 100 Joules of energy.',
      descNe: 'फट्याङ्ग्रा शिकार गर्ने मांसाहारी जीव; यसले १०० जुल शक्ति प्राप्त गर्छ।',
    },
    {
      id: 'tertiary',
      level: 4,
      nameEn: 'Trophic Level 4: Tertiary Consumer',
      nameNe: 'चौथो तह: तृतीय उपभोक्ता (Carnivore)',
      organismEn: 'Rat Snake (धामन सर्प)',
      organismNe: 'धामन सर्प (Predator)',
      joules: 10,
      color: '#eab308',
      active: !disabledLinks.includes('tertiary'),
      descEn: 'Carnivore hunting frogs. Energy dwindles to just 10 Joules at this level.',
      descNe: 'भ्यागुतो खाने शिकारी सर्प; यहाँसम्म पुग्दा शक्ति घटेर १० जुल मात्र बाँकी रहन्छ।',
    },
    {
      id: 'apex',
      level: 5,
      nameEn: 'Trophic Level 5: Apex Predator',
      nameNe: 'पाँचौं तह: सर्वोच्च उपभोक्ता (Apex)',
      organismEn: 'Himalayan Eagle (चिल / गिद्ध)',
      organismNe: 'हिमाली चिल / गरूड',
      joules: 1,
      color: '#ef4444',
      active: !disabledLinks.includes('apex'),
      descEn: 'Top-tier apex predator. Receives only 1 Joule of the original 10,000 Joules.',
      descNe: 'आहार चक्रको शीर्ष शिकारी; सुरुको १०,००० जुलबाट केवल १ जुल मात्र प्राप्त गर्छ।',
    },
  ];

  const currentLevel = trophicLevels.find((t) => t.id === selectedLevelId) || trophicLevels[0];

  const toggleLink = (id: string) => {
    ScienceAudio.playPop();
    if (disabledLinks.includes(id)) {
      setDisabledLinks(disabledLinks.filter((item) => item !== id));
    } else {
      setDisabledLinks([...disabledLinks, id]);
    }
  };

  const handleReset = () => {
    setDisabledLinks([]);
    setSelectedLevelId('producer');
    setViewMode('chain');
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    ScienceAudio.playWhoosh();
  };

  // 60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#021024');
      bgGrad.addColorStop(0.6, '#081f3d');
      bgGrad.addColorStop(1, '#020b18');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (viewMode === 'chain') {
        // --- VIEW 1: HORIZONTAL FOOD CHAIN FLOW ---
        const startX = 60;
        const cardW = 140;
        const cardH = 220;
        const spacing = 160;
        const cardY = 150;

        // Draw Connecting Energy Buses
        for (let i = 0; i < trophicLevels.length - 1; i++) {
          const fromX = startX + i * spacing + cardW;
          const toX = startX + (i + 1) * spacing;
          const linkBroken = !trophicLevels[i].active || !trophicLevels[i + 1].active;

          ctx.strokeStyle = linkBroken ? 'rgba(239, 68, 68, 0.4)' : '#38bdf8';
          ctx.lineWidth = linkBroken ? 2 : 4;
          ctx.beginPath();
          ctx.moveTo(fromX, cardY + cardH / 2);
          ctx.lineTo(toX, cardY + cardH / 2);
          ctx.stroke();

          // Arrowhead
          ctx.fillStyle = linkBroken ? '#ef4444' : '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(toX - 2, cardY + cardH / 2);
          ctx.lineTo(toX - 10, cardY + cardH / 2 - 6);
          ctx.lineTo(toX - 10, cardY + cardH / 2 + 6);
          ctx.closePath();
          ctx.fill();

          // 10% Energy Packet Particle moving
          if (!linkBroken) {
            const pProg = (time * 0.8 + i * 0.25) % 1;
            const px = fromX + (toX - fromX) * pProg;
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(px, cardY + cardH / 2, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // -90% Heat loss label radiating upwards
          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('-90% Heat', (fromX + toX) / 2, cardY + cardH / 2 - 14);
        }

        // Draw 5 Trophic Cards
        trophicLevels.forEach((t, idx) => {
          const x = startX + idx * spacing;
          const y = cardY;
          const isSelected = selectedLevelId === t.id;

          // Card Background
          ctx.fillStyle = t.active ? (isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.75)') : 'rgba(127, 29, 29, 0.35)';
          ctx.beginPath();
          ctx.roundRect(x, y, cardW, cardH, 12);
          ctx.fill();

          ctx.strokeStyle = t.active ? (isSelected ? t.color : 'rgba(71, 85, 105, 0.6)') : '#ef4444';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.stroke();

          // Header
          ctx.fillStyle = t.active ? t.color : '#991b1b';
          ctx.beginPath();
          ctx.roundRect(x, y, cardW, 30, [12, 12, 0, 0]);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`T${t.level}: ${t.joules} J`, x + cardW / 2, y + 19);

          // Card Icon / Graphic
          const imgCX = x + cardW / 2;
          const imgCY = y + 75;

          if (t.id === 'producer') {
            // Grass / Wheat
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 3;
            for (let b = -20; b <= 20; b += 10) {
              ctx.beginPath();
              ctx.moveTo(imgCX + b, imgCY + 25);
              ctx.quadraticCurveTo(imgCX + b + b * 0.4, imgCY - 10, imgCX + b * 1.5, imgCY - 30);
              ctx.stroke();
            }
          } else if (t.id === 'primary') {
            // Grasshopper
            ctx.fillStyle = '#84cc16';
            ctx.beginPath();
            ctx.ellipse(imgCX, imgCY, 18, 9, -Math.PI / 8, 0, Math.PI * 2);
            ctx.fill();
            // Jumping back leg
            ctx.strokeStyle = '#65a30d';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(imgCX - 10, imgCY);
            ctx.lineTo(imgCX - 22, imgCY - 16);
            ctx.lineTo(imgCX - 28, imgCY + 18);
            ctx.stroke();
          } else if (t.id === 'secondary') {
            // Frog
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath();
            ctx.ellipse(imgCX, imgCY, 18, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(imgCX - 7, imgCY - 12, 4, 0, Math.PI * 2);
            ctx.arc(imgCX + 7, imgCY - 12, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (t.id === 'tertiary') {
            // Snake
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(imgCX - 25, imgCY + 10);
            ctx.bezierCurveTo(imgCX - 15, imgCY - 20, imgCX + 15, imgCY + 20, imgCX + 25, imgCY - 10);
            ctx.stroke();
          } else {
            // Eagle
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.ellipse(imgCX, imgCY, 16, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            // Wings
            ctx.beginPath();
            ctx.moveTo(imgCX - 6, imgCY);
            ctx.lineTo(imgCX, imgCY - 18);
            ctx.lineTo(imgCX + 8, imgCY);
            ctx.closePath();
            ctx.fill();
          }

          // Organism Name
          ctx.fillStyle = t.active ? '#ffffff' : '#f87171';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lang === 'ne' ? t.organismNe.split(' ')[0] : t.organismEn.split(' ')[0], x + cardW / 2, y + 128);

          // Energy Joules Meter
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(`${t.joules.toLocaleString()} J`, x + cardW / 2, y + 152);

          // Status Badge
          ctx.fillStyle = t.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.4)';
          ctx.strokeStyle = t.active ? '#22c55e' : '#ef4444';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(x + 10, y + 175, cardW - 20, 24, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = t.active ? '#4ade80' : '#f87171';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(t.active ? (lang === 'ne' ? '✓ सक्रिय' : '✓ Active') : (lang === 'ne' ? '⚠️ विच्छेदित' : '⚠️ Extirpated'), x + cardW / 2, y + 191);
        });

        // Trophic Cascade Alert Banner below cards
        if (disabledLinks.length > 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.beginPath();
          ctx.roundRect(140, 410, 600, 36, 8);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            lang === 'ne'
              ? '🚨 पारिस्थितिक असन्तुलन: एउटा तह हराउँदा पूरै आहार चक्र बिथोलिन्छ!'
              : '🚨 Trophic Cascade: Disrupting a link causes catastrophic population imbalances!',
            440,
            433
          );
        }
      } else {
        // --- VIEW 2: ECOLOGICAL ENERGY PYRAMID ---
        const pyramidBaseY = 440;
        const pyrCenter = 440;

        trophicLevels.forEach((t, i) => {
          const stepW = 480 - i * 85;
          const stepH = 45;
          const stepY = pyramidBaseY - (i + 1) * stepH;

          // Tier Step
          ctx.fillStyle = t.active ? t.color : '#7f1d1d';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(pyrCenter - stepW / 2, stepY, stepW, stepH - 4, 6);
          ctx.fill();
          ctx.stroke();

          // Tier text
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            `${lang === 'ne' ? t.nameNe : t.nameEn} • ${t.joules.toLocaleString()} Joules (10%)`,
            pyrCenter,
            stepY + 26
          );
        });

        // Sun input at base
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          lang === 'ne' ? '☀️ सौर्य ऊर्जा: १०,००,००० जुल प्रकाश शक्ति' : '☀️ Solar Input: 1,000,000 Joules Radiant Energy (1% captured by plants)',
          pyrCenter,
          pyramidBaseY + 25
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedLevelId, disabledLinks, viewMode, lang]);

  return (
    <SimulationLayout
      titleEn="2D Food Chain & Energy Pyramid Explorer"
      titleNe="आहार शृङ्खला तथा जालो २डी अन्वेषक"
      subject="Science"
      grade={6}
      chapter={4}
      stage={stage}
      onStageChange={setStage}
      lang={lang}
      onLangChange={setLang}
      stars={stars}
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
            LEFT COLUMN: INTERACTIVE 2D FOOD CHAIN & PYRAMID VIEWPORT
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
          }}
        >
          {/* Main 2D Canvas */}
          <canvas
            ref={canvasRef}
            width={880}
            height={500}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
            }}
          />

          {/* Top Floating Badges */}
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
            {/* View Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '4px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid #e2e8f0',
                padding: '3px',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <button
                onClick={() => setViewMode('chain')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: viewMode === 'chain' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                  color: viewMode === 'chain' ? '#22d3ee' : '#94a3b8',
                }}
              >
                {lang === 'ne' ? 'आहार शृङ्खला' : 'Food Chain Flow'}
              </button>
              <button
                onClick={() => setViewMode('pyramid')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: viewMode === 'pyramid' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                  color: viewMode === 'pyramid' ? '#fbbf24' : '#94a3b8',
                }}
              >
                {lang === 'ne' ? 'ऊर्जा पिरामिड (10%)' : '10% Energy Pyramid'}
              </button>
            </div>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fbbf24',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              {lang === 'ne' ? 'लिन्डेम्यानको १०% नियम' : "Lindeman's 10% Law"}
            </span>
          </div>

          {/* Top-Right Reset Button */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              zIndex: 10,
            }}
          >
            <button
              onClick={handleReset}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} />
              {lang === 'ne' ? 'पुनः सुरु' : 'Reset'}
            </button>
          </div>

          {/* Bottom Floating Status Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              backdropFilter: 'blur(12px)',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={16} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'ne' ? currentLevel.nameNe : currentLevel.nameEn}: {lang === 'ne' ? currentLevel.organismNe : currentLevel.organismEn}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'ne' ? currentLevel.descNe : currentLevel.descEn}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#fbbf24',
                background: 'rgba(245, 158, 11, 0.15)',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                fontWeight: 800,
                fontFamily: 'monospace',
              }}
            >
              {currentLevel.joules} J
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: TROPHIC DISCOVERY STATION (380px)
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            borderLeft: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
            color: '#fff',
          }}
        >
          {/* Station Header Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Zap size={18} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>
                {lang === 'ne' ? 'आहार शृङ्खला अनुसन्धान केन्द्र' : 'Trophic Diagnostics Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
              {lang === 'ne'
                ? 'उत्पादकदेखि उच्च उपभोक्तासम्म १०% ऊर्जा स्थानान्तरण र कुनै जीव लोप हुँदा पर्ने असर जाँच्नुहोस्।'
                : 'Inspect biomass energy loss across trophic levels and test the ecological consequences of species extinction.'}
            </div>
          </div>

          {/* Trophic Level Selector (Buttons) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'पोषण तह छान्नुहोस्' : 'Select Trophic Level'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {trophicLevels.map((t) => {
                const active = selectedLevelId === t.id;
                const isOff = disabledLinks.includes(t.id);
                return (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: active ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: active ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    }}
                  >
                    <button
                      onClick={() => setSelectedLevelId(t.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: active ? '#38bdf8' : '#cbd5e1',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                        flex: 1,
                      }}
                    >
                      {lang === 'ne' ? t.nameNe : t.nameEn} ({lang === 'ne' ? t.organismNe.split(' ')[0] : t.organismEn.split(' ')[0]})
                    </button>

                    <button
                      onClick={() => toggleLink(t.id)}
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: 'none',
                        background: isOff ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.25)',
                        color: isOff ? '#f87171' : '#4ade80',
                      }}
                    >
                      {isOff ? (lang === 'ne' ? 'हटाइयो' : 'Removed') : (lang === 'ne' ? 'सक्रिय' : 'Active')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Level Diagnostics Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                {lang === 'ne' ? 'ऊर्जा मापन (Energy Available):' : 'Energy Available:'}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'monospace', color: '#fbbf24' }}>
                {currentLevel.joules} J
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.45 }}>
              {lang === 'ne' ? currentLevel.descNe : currentLevel.descEn}
            </div>
          </div>

          {/* Curriculum Key Takeaway Card */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '11px',
              color: '#475569',
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
              💡 {lang === 'ne' ? '१०% ऊर्जा स्थानान्तरण नियम:' : '10% Energy Transfer Law:'}
            </div>
            {lang === 'ne'
              ? 'प्रत्येक पोषण तहमा केवल १०% शक्ति मात्र अर्को तहमा पुग्छ। ९०% शक्ति ताप, श्वासप्रश्वास र उत्सर्जनमा खेर जान्छ।'
              : 'Only ~10% of chemical energy transfers to the subsequent trophic level. 90% is consumed in cellular respiration, motion, and released as heat.'}
          </div>

          {/* Prominent Completion Button */}
          <button
            onClick={() => {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Food Chain Lab & Quiz' : 'आहार शृङ्खला प्रयोगशाला पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default FoodChainExplorerSim;
