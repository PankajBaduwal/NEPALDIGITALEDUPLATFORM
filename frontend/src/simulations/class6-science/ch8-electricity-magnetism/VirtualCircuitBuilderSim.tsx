/**
 * VirtualCircuitBuilderSim.tsx
 * Simulation 29: 2D Virtual Circuit Builder & Tester (भर्चुअल परिपथ निर्माण)
 * Grade 6 Science • Unit 8: Electricity and Magnetism (विद्युत र चुम्बकत्व)
 *
 * 100% Native HTML5 Canvas 2D Interactive Circuit Laboratory.
 * Features:
 * 1. Complete vs Incomplete Circuits (बन्द र खुला परिपथ)
 * 2. Series vs Parallel Circuit Wiring Comparisons (Dimmer shared voltage vs Independent full brightness)
 * 3. Conductor vs Insulator Material Tester: Copper, Iron, Graphite, Rubber, Wood
 * 4. Animated flowing yellow electron dots along wires
 * 5. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Power, Lightbulb, Sparkles, CheckCircle2, XCircle, RotateCcw, Award, Zap } from 'lucide-react';

type CircuitMode = 'simple' | 'series' | 'parallel' | 'conductor_test';
type TestMaterial = 'copper' | 'iron_nail' | 'pencil_lead' | 'rubber' | 'dry_wood';

export const VirtualCircuitBuilderSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Circuit Parameters
  const [circuitMode, setCircuitMode] = useState<CircuitMode>('simple');
  const [isSwitchClosed, setIsSwitchClosed] = useState<boolean>(true);
  const [testMaterial, setTestMaterial] = useState<TestMaterial>('copper');

  // Conductor classification
  const isConductor = testMaterial === 'copper' || testMaterial === 'iron_nail' || testMaterial === 'pencil_lead';
  const isCircuitActive = isSwitchClosed && (circuitMode !== 'conductor_test' || isConductor);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setCircuitMode('simple');
    setIsSwitchClosed(true);
    setTestMaterial('copper');
    setStars(0);
    setIsCompleted(false);
  };

  const handleToggleSwitch = () => {
    ScienceAudio.playClick();
    const next = !isSwitchClosed;
    setIsSwitchClosed(next);
    if (next && isCircuitActive) ScienceAudio.playDing();
  };

  const handleSelectMaterial = (m: TestMaterial) => {
    ScienceAudio.playClick();
    setTestMaterial(m);
    if (stage === 'challenge' && stars < 3) setStars(3);
  };

  // 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark Electronics Workbench Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Breadboard Workbench
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 390, width, height - 390);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 390);
      ctx.lineTo(width, 390);
      ctx.stroke();

      // ==========================================
      // 1. BATTERY POWER SOURCE (LEFT SIDE)
      // ==========================================
      const batX = 140;
      const batY = 240;

      // Battery Cell
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(batX - 25, batY - 50, 50, 100, 8);
      ctx.fill();
      ctx.stroke();

      // Positive Terminal Nub (Top)
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(batX - 10, batY - 60, 20, 10);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', batX, batY - 24);

      // Negative Terminal (Bottom)
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('-', batX, batY + 36);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('1.5V Cell', batX, batY + 68);

      // ==========================================
      // 2. KNIFE SWITCH (BOTTOM WIRE SECTION)
      // ==========================================
      const swX = 360;
      const swY = 320;

      ctx.fillStyle = '#334155';
      ctx.fillRect(swX - 30, swY - 8, 60, 16);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(swX - 20, swY, 5, 0, Math.PI * 2);
      ctx.arc(swX + 20, swY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Switch blade
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(swX - 20, swY);
      if (isSwitchClosed) {
        ctx.lineTo(swX + 20, swY); // Closed
      } else {
        ctx.lineTo(swX + 10, swY - 28); // Open
      }
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isSwitchClosed ? 'Closed (बन्द)' : 'Open (खुला)', swX, swY + 24);

      // ==========================================
      // 3. CIRCUIT LOOPS & LOAD BULBS
      // ==========================================
      const bulbBrightness = circuitMode === 'series' ? 0.5 : 1.0;

      const drawBulb = (bx: number, by: number, isLit: boolean, label: string) => {
        // Radiant Glow Aura if Active
        if (isLit) {
          const glowGrad = ctx.createRadialGradient(bx, by - 12, 6, bx, by - 12, 60 * bulbBrightness);
          glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
          glowGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
          glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(bx, by - 12, 60 * bulbBrightness, 0, Math.PI * 2);
          ctx.fill();
        }

        // Glass Bulb Sphere
        ctx.fillStyle = isLit ? '#fef08a' : 'rgba(255, 255, 255, 0.15)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(bx, by - 12, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Screw Base
        ctx.fillStyle = '#64748b';
        ctx.fillRect(bx - 10, by + 12, 20, 16);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, bx, by + 40);
      };

      // Wires Drawing
      ctx.strokeStyle = isCircuitActive ? '#ef4444' : '#64748b';
      ctx.lineWidth = 3.5;

      if (circuitMode === 'simple') {
        const bulbX = 600;
        const bulbY = 240;

        // Top wire from battery to bulb
        ctx.beginPath();
        ctx.moveTo(batX, batY - 60);
        ctx.lineTo(batX, 140);
        ctx.lineTo(bulbX, 140);
        ctx.lineTo(bulbX, bulbY - 36);
        ctx.stroke();

        // Bottom wire from bulb through switch to battery
        ctx.beginPath();
        ctx.moveTo(bulbX, bulbY + 28);
        ctx.lineTo(bulbX, swY);
        ctx.lineTo(swX + 20, swY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(swX - 20, swY);
        ctx.lineTo(batX, swY);
        ctx.lineTo(batX, batY + 50);
        ctx.stroke();

        drawBulb(bulbX, bulbY, isCircuitActive, 'Bulb (1.5V Full)');
      } else if (circuitMode === 'series') {
        const b1X = 500;
        const b2X = 680;
        const bulbY = 240;

        // Top wire to Bulb 1
        ctx.beginPath();
        ctx.moveTo(batX, batY - 60);
        ctx.lineTo(batX, 140);
        ctx.lineTo(b1X, 140);
        ctx.lineTo(b1X, bulbY - 36);
        ctx.stroke();

        // Connecting wire Bulb 1 to Bulb 2
        ctx.beginPath();
        ctx.moveTo(b1X, bulbY + 28);
        ctx.lineTo(b1X, bulbY + 50);
        ctx.lineTo(b2X, bulbY + 50);
        ctx.lineTo(b2X, bulbY + 28);
        ctx.stroke();

        // Return wire from Bulb 2 to Switch
        ctx.beginPath();
        ctx.moveTo(b2X, bulbY - 36);
        ctx.lineTo(b2X, 140);
        ctx.lineTo(760, 140);
        ctx.lineTo(760, swY);
        ctx.lineTo(swX + 20, swY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(swX - 20, swY);
        ctx.lineTo(batX, swY);
        ctx.lineTo(batX, batY + 50);
        ctx.stroke();

        drawBulb(b1X, bulbY, isCircuitActive, 'Bulb 1 (Dim 0.75V)');
        drawBulb(b2X, bulbY, isCircuitActive, 'Bulb 2 (Dim 0.75V)');
      } else if (circuitMode === 'parallel') {
        const b1X = 560;
        const b2X = 720;
        const bulbY = 240;

        // Parallel Rails
        ctx.beginPath();
        ctx.moveTo(batX, batY - 60);
        ctx.lineTo(batX, 140);
        ctx.lineTo(b2X, 140);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(b1X, 140);
        ctx.lineTo(b1X, bulbY - 36);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(b2X, 140);
        ctx.lineTo(b2X, bulbY - 36);
        ctx.stroke();

        // Return Rails
        ctx.beginPath();
        ctx.moveTo(b1X, bulbY + 28);
        ctx.lineTo(b1X, swY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(b2X, bulbY + 28);
        ctx.lineTo(b2X, swY);
        ctx.lineTo(swX + 20, swY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(swX - 20, swY);
        ctx.lineTo(batX, swY);
        ctx.lineTo(batX, batY + 50);
        ctx.stroke();

        drawBulb(b1X, bulbY, isCircuitActive, 'Bulb 1 (Full 1.5V)');
        drawBulb(b2X, bulbY, isCircuitActive, 'Bulb 2 (Full 1.5V)');
      } else if (circuitMode === 'conductor_test') {
        // Conductor Test Gap
        const gapX = 360;
        const gapY = 140;
        const bulbX = 640;
        const bulbY = 240;

        // Wire to test clip 1
        ctx.beginPath();
        ctx.moveTo(batX, batY - 60);
        ctx.lineTo(batX, gapY);
        ctx.lineTo(gapX - 50, gapY);
        ctx.stroke();

        // Wire from test clip 2 to bulb
        ctx.beginPath();
        ctx.moveTo(gapX + 50, gapY);
        ctx.lineTo(bulbX, gapY);
        ctx.lineTo(bulbX, bulbY - 36);
        ctx.stroke();

        // Return wire
        ctx.beginPath();
        ctx.moveTo(bulbX, bulbY + 28);
        ctx.lineTo(bulbX, swY);
        ctx.lineTo(batX, swY);
        ctx.lineTo(batX, batY + 50);
        ctx.stroke();

        // Material Specimen Bridging the Gap
        ctx.save();
        ctx.translate(gapX, gapY);

        let matColor = '#f59e0b'; // copper
        if (testMaterial === 'iron_nail') matColor = '#94a3b8';
        if (testMaterial === 'pencil_lead') matColor = '#334155';
        if (testMaterial === 'rubber') matColor = '#f43f5e';
        if (testMaterial === 'dry_wood') matColor = '#78350f';

        ctx.fillStyle = matColor;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-45, -10, 90, 20, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(testMaterial.toUpperCase(), 0, 4);

        ctx.restore();

        drawBulb(bulbX, bulbY, isCircuitActive, 'Indicator Bulb');
      }

      // Animated Electron Dots along Wires
      if (isCircuitActive) {
        ctx.fillStyle = '#fef08a';
        for (let e = 0; e < 8; e++) {
          const tDot = ((Date.now() / 15 + e * 50) % 400) / 400;
          const dotX = batX + tDot * (width * 0.6);
          ctx.beginPath();
          ctx.arc(dotX, 140, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── TOP STATUS BANNER ──
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = isCircuitActive ? '#4ade80' : '#f87171';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 240, 16, 480, 50, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isCircuitActive ? '#4ade80' : '#f87171';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      if (isCircuitActive) {
        ctx.fillText(
          lang === 'ne'
            ? '✓ पूर्ण बन्द परिपथ: करेन्ट प्रवाह भई बत्ती बल्यो।'
            : '✓ Complete Closed Circuit: Current flowing, bulb is lit.',
          width / 2,
          38
        );
      } else {
        ctx.fillText(
          lang === 'ne'
            ? '❌ खुला / अपूर्ण परिपथ: करेन्ट बन्द छ।'
            : '❌ Incomplete / Open Circuit: No current flow.',
          width / 2,
          38
        );
      }
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(
        circuitMode === 'series'
          ? lang === 'ne' ? 'श्रेणीक्रम (Series): दुबै बत्ती मधुरो (भोल्टेज बाँडफाँड)' : 'Series: Shared voltage, dimmer bulbs'
          : circuitMode === 'parallel'
            ? lang === 'ne' ? 'समानान्तरक्रम (Parallel): दुबै बत्ती पूरा चम्किलो (समान भोल्टेज)' : 'Parallel: Equal voltage, full brightness'
            : circuitMode === 'conductor_test'
              ? isConductor ? 'Conductor: Allows electricity to pass' : 'Insulator: Blocks electric current'
              : 'Simple Circuit',
        width / 2,
        56
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [circuitMode, isSwitchClosed, testMaterial, isConductor, isCircuitActive, lang]);

  return (
    <SimulationLayout
      title="Virtual Electric Circuit Builder & Tester"
      titleNepali="भर्चुअल विद्युत परिपथ निर्माण तथा परीक्षण"
      chapterNumber={8}
      chapterTitle="Unit 8: Electricity and Magnetism"
      chapterTitleNepali="एकाइ ८: विद्युत र चुम्बकत्व"
      currentStage={stage}
      onStageChange={(s) => {
        setStage(s);
        ScienceAudio.playClick();
      }}
      lang={lang}
      onLanguageChange={setLang}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
      stars={stars}
      isCompleted={isCompleted}
      currentPromptEn="Build simple, series, and parallel circuits or test conductors and insulators across the gap."
      currentPromptNe="सरल, श्रेणीक्रम र समानान्तर परिपथ बनाउनुहोस् वा सुचालक र कुचालक परीक्षण गर्नुहोस्।"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          height: '100%',
          overflow: 'hidden',
          background: '#090d16',
        }}
      >
        {/* LEFT COLUMN: 2D CANVAS VIEWPORT */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#090d16',
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={canvasRef}
            width={880}
            height={460}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#090d16',
            }}
          />

          {/* Floating Top Mode Badge */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '6px 14px',
              borderRadius: '9999px',
              backdropFilter: 'blur(8px)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#38bdf8',
            }}
          >
            <Zap style={{ width: '14px', height: '14px', color: isCircuitActive ? '#facc15' : '#94a3b8' }} />
            <span>
              {circuitMode === 'simple' && (lang === 'ne' ? 'सरल परिपथ (१ बत्ती)' : 'Simple Circuit (1 Bulb)')}
              {circuitMode === 'series' && (lang === 'ne' ? 'श्रेणीक्रम परिपथ (दुबै बत्ती मधुरो)' : 'Series Wiring (Dimmer Bulbs)')}
              {circuitMode === 'parallel' && (lang === 'ne' ? 'समानान्तरक्रम परिपथ (दुबै पूरा चम्किलो)' : 'Parallel Wiring (Full Brightness)')}
              {circuitMode === 'conductor_test' && (lang === 'ne' ? `सुचालक परीक्षण: ${testMaterial.toUpperCase()}` : `Conductor Test: ${testMaterial.toUpperCase()}`)}
            </span>
          </div>

          {/* Floating Bottom Switch Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backdropFilter: 'blur(8px)',
              color: '#e2e8f0',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {lang === 'ne' ? 'परिपथ अवस्था:' : 'Circuit State:'}
              </span>
              <span style={{ color: isCircuitActive ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                {isCircuitActive
                  ? (lang === 'ne' ? '✓ बन्द परिपथ (Closed Loop): करेन्ट प्रवाह भयो!' : '✓ Closed Circuit: Electrons flowing, Bulb glowing!')
                  : (lang === 'ne' ? '✗ खुला परिपथ (Open Loop): विद्युत प्रवाह बन्द' : '✗ Open Circuit: Incomplete loop, Bulb OFF')}
              </span>
            </div>

            <button
              onClick={handleToggleSwitch}
              style={{
                background: isSwitchClosed ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(239, 68, 68, 0.2)',
                border: isSwitchClosed ? 'none' : '1px solid #ef4444',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                boxShadow: isSwitchClosed ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
              }}
            >
              <Power style={{ width: '13px', height: '13px', display: 'inline', marginRight: '4px' }} />
              <span>{isSwitchClosed ? (lang === 'ne' ? 'स्वीच खुला गर्नुहोस् (ON)' : 'Open Switch (ON)') : (lang === 'ne' ? 'स्वीच बन्द गर्नुहोस् (OFF)' : 'Close Switch (OFF)')}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: 380px PERSISTENT CONTROL SIDEBAR */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflowY: 'auto',
            padding: '16px',
            gap: '14px',
          }}
        >
          {/* Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.6))',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '13px' }}>
              <Sparkles style={{ width: '16px', height: '16px' }} />
              <span>{lang === 'ne' ? 'विद्युत परिपथ निर्माण कार्यशाला' : 'Circuit Builder Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'सरल, श्रेणीक्रम र समानान्तर परिपथ जोड्नुहोस् र सुचालक/कुचालक परीक्षण गर्नुहोस्।'
                : 'Construct series and parallel topologies and test conductor conductivity across the gap.'}
            </p>
          </div>

          {/* Circuit Mode Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '१. परिपथ प्रकार छान्नुहोस्' : '1. Circuit Topology'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {[
                { id: 'simple', nameEn: 'Simple Circuit', nameNe: 'सरल परिपथ' },
                { id: 'series', nameEn: 'Series Wiring', nameNe: 'श्रेणीक्रम परिपथ' },
                { id: 'parallel', nameEn: 'Parallel Wiring', nameNe: 'समानान्तरक्रम' },
                { id: 'conductor_test', nameEn: 'Conductor Tester', nameNe: 'सुचालक परीक्षण' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setCircuitMode(m.id as CircuitMode);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: circuitMode === m.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: circuitMode === m.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: circuitMode === m.id ? '#38bdf8' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {lang === 'ne' ? m.nameNe : m.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Conductor Test Materials Panel */}
          {circuitMode === 'conductor_test' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                {lang === 'ne' ? '२. परीक्षणका लागि वस्तु छान्नुहोस्:' : '2. Test Material Sample:'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'copper', nameEn: 'Copper Wire (सुचालक - Metal)', isCond: true },
                  { id: 'iron_nail', nameEn: 'Iron Nail (सुचालक - Metal)', isCond: true },
                  { id: 'pencil_lead', nameEn: 'Graphite Pencil (सुचालक - Non-metal)', isCond: true },
                  { id: 'rubber', nameEn: 'Rubber Eraser (कुचालक - Insulator)', isCond: false },
                  { id: 'dry_wood', nameEn: 'Dry Wood (कुचालक - Insulator)', isCond: false },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMaterial(item.id as TestMaterial)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: testMaterial === item.id ? (item.isCond ? '1px solid #10b981' : '1px solid #ef4444') : '1px solid rgba(255,255,255,0.08)',
                      background: testMaterial === item.id ? (item.isCond ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)') : 'rgba(255,255,255,0.03)',
                      color: testMaterial === item.id ? (item.isCond ? '#34d399' : '#fca5a5') : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {item.nameEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Circuit Diagnostics Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '⚡ परिपथ विशेषता विश्लेषण:' : '⚡ Circuit Characteristics:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}>
              {circuitMode === 'series' && (
                <span>
                  {lang === 'ne'
                    ? 'श्रेणीक्रममा करेन्टको एउटा मात्र बाटो हुन्छ। एउटा बत्ती निकाल्दा अर्को पनि निभ्छ र दुबै बत्ती मधुरो (Dim) बल्छन्।'
                    : 'Single loop path. Bulbs share voltage and glow dimmer. Unscrewing one breaks the whole circuit.'}
                </span>
              )}
              {circuitMode === 'parallel' && (
                <span>
                  {lang === 'ne'
                    ? 'समानान्तरक्रममा प्रत्येक बत्तीले पूर्ण भोल्टेज पाउँछ र चम्किलो बल्छ। एउटा बत्ती निभ्दा पनि अर्को बलिरहन्छ (घरायसी वायरिङ)।'
                    : 'Independent parallel branches. Both bulbs receive full voltage and glow with full brightness.'}
                </span>
              )}
              {circuitMode === 'conductor_test' && (
                <span>
                  {isConductor
                    ? (lang === 'ne' ? 'सुचालकले आफूबाट विद्युत करेन्ट सजिलै प्रवाह हुन दिन्छ (बत्ती बल्यो)।' : 'Conductor closes the gap, allowing current to complete the circuit.')
                    : (lang === 'ne' ? 'कुचालकले विद्युत रोक्छ, परिपथ खुला रहन्छ (बत्ती बल्दैन)।' : 'Insulator blocks electric flow; the circuit remains open.')}
                </span>
              )}
              {circuitMode === 'simple' && (
                <span>
                  {lang === 'ne'
                    ? 'सेल, स्वीच र बत्ती जोडेर बनेको एक बन्द लुप सरल परिपथ हो।'
                    : 'A standard simple closed loop consisting of energy source, switch, and lamp.'}
                </span>
              )}
            </div>
          </div>

          {/* Curriculum Key Takeaway */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: '1.4',
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
              {lang === 'ne' ? '📚 पाठ्यक्रम मुख्य बुँदा:' : '📚 Curriculum Takeaway:'}
            </div>
            {lang === 'ne'
              ? 'घरायसी विद्युत वायरिङ सधैं समानान्तरक्रम (Parallel) मा गरिन्छ किनकि प्रत्येक उपकरणले पूर्ण २२० भोल्ट पाउँछन् र छुट्टाछुट्टै नियन्त्रण गर्न सकिन्छ।'
              : 'Domestic wiring uses parallel circuits so that each appliance receives full voltage and can operate independently.'}
          </div>

          {/* Sticky Complete Button */}
          <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
            <button
              onClick={() => {
                setIsCompleted(true);
                setStars(3);
                ScienceAudio.playSuccess();
              }}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Award style={{ width: '16px', height: '16px' }} />
              <span>{lang === 'ne' ? '✓ विद्युत परिपथ प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Circuit Builder Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default VirtualCircuitBuilderSim;
