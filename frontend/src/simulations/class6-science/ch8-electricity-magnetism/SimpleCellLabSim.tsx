/**
 * SimpleCellLabSim.tsx
 * Simulation 30: 2D Simple Voltaic Cell Laboratory
 * Grade 6 Science • Unit 8: Electricity and Magnetism
 *
 * 100% Native HTML5 Canvas 2D Interactive Electrochemical Cell.
 * Features:
 * 1. Anode: Zinc (Zn) plate oxidation releasing electrons (Zn ➔ Zn²⁺ + 2e⁻)
 * 2. Cathode: Copper (Cu) plate reduction generating hydrogen gas bubbles (2H⁺ + 2e⁻ ➔ H₂↑)
 * 3. Electrolyte: Dilute Sulfuric Acid (H₂SO₄)
 * 4. Cell Defects: Local Action (zinc amalgamation) & Polarization (hydrogen film on copper)
 * 5. Digital Voltmeter (~1.08V) & connecting glowing LED bulb
 * 6. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Zap, Beaker, Sparkles, Activity, ShieldAlert, RotateCcw, Award, BatteryCharging } from 'lucide-react';

interface Bubble {
  x: number;
  y: number;
  vy: number;
  radius: number;
}

export const SimpleCellLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Electrochemical Parameters
  const [acidConcentration, setAcidConcentration] = useState<number>(20); // 5 to 40%
  const [hasPolarization, setHasPolarization] = useState<boolean>(false);
  const [isAmalgamated, setIsAmalgamated] = useState<boolean>(true);

  // Voltmeter reading
  const nominalVoltage = 1.08;
  const measuredVoltage = hasPolarization
    ? 0.38
    : parseFloat((nominalVoltage * (acidConcentration / 20)).toFixed(2));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setAcidConcentration(20);
    setHasPolarization(false);
    setIsAmalgamated(true);
    bubblesRef.current = [];
    setStars(0);
    setIsCompleted(false);
  };

  const handleTogglePolarization = () => {
    ScienceAudio.playClick();
    setHasPolarization(!hasPolarization);
  };

  const handleToggleAmalgamation = () => {
    ScienceAudio.playClick();
    setIsAmalgamated(!isAmalgamated);
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
      const time = Date.now() / 250;

      // Dark Chemistry Lab Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Lab Work Bench
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 390, width, height - 390);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 390);
      ctx.lineTo(width, 390);
      ctx.stroke();

      // ==========================================
      // 1. GLASS BEAKER & ELECTROLYTE SOLUTION
      // ==========================================
      const beakerX = 360;
      const beakerY = 180;
      const beakerW = 280;
      const beakerH = 210;

      // Acid Solution
      const acidGrad = ctx.createLinearGradient(0, beakerY + 40, 0, beakerY + beakerH);
      acidGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      acidGrad.addColorStop(1, 'rgba(2, 132, 199, 0.55)');
      ctx.fillStyle = acidGrad;
      ctx.beginPath();
      ctx.roundRect(beakerX - beakerW / 2 + 6, beakerY + 40, beakerW - 12, beakerH - 44, 12);
      ctx.fill();

      // Glass Beaker Outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(beakerX - beakerW / 2, beakerY + 20);
      ctx.lineTo(beakerX - beakerW / 2, beakerY + beakerH - 6);
      ctx.arcTo(beakerX - beakerW / 2, beakerY + beakerH, beakerX - beakerW / 2 + 16, beakerY + beakerH, 16);
      ctx.lineTo(beakerX + beakerW / 2 - 16, beakerY + beakerH);
      ctx.arcTo(beakerX + beakerW / 2, beakerY + beakerH, beakerX + beakerW / 2, beakerY + beakerH - 6, 16);
      ctx.lineTo(beakerX + beakerW / 2, beakerY + 20);
      ctx.stroke();

      // Electrolyte Label
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Dilute H₂SO₄ (पातलो सल्फ्युरिक एसिड)', beakerX, beakerY + beakerH - 15);

      // ==========================================
      // 2. ELECTRODE PLATES: ZINC (ANODE) & COPPER (CATHODE)
      // ==========================================
      const zincX = beakerX - 70;
      const copperX = beakerX + 70;
      const plateW = 34;
      const plateH = 170;
      const plateTopY = beakerY - 10;

      // Zinc Plate (Anode, Negative pole in voltaic cell, Silver-gray)
      const zincGrad = ctx.createLinearGradient(zincX - plateW / 2, 0, zincX + plateW / 2, 0);
      zincGrad.addColorStop(0, '#64748b');
      zincGrad.addColorStop(0.5, '#cbd5e1');
      zincGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = zincGrad;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(zincX - plateW / 2, plateTopY, plateW, plateH, 4);
      ctx.fill();
      ctx.stroke();

      // Zinc Label
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Zn (-)', zincX, plateTopY + 25);
      ctx.fillText('Zinc', zincX, plateTopY + 42);

      // Copper Plate (Cathode, Positive pole, Reddish-gold)
      const copperGrad = ctx.createLinearGradient(copperX - plateW / 2, 0, copperX + plateW / 2, 0);
      copperGrad.addColorStop(0, '#b45309');
      copperGrad.addColorStop(0.5, '#f59e0b');
      copperGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = copperGrad;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(copperX - plateW / 2, plateTopY, plateW, plateH, 4);
      ctx.fill();
      ctx.stroke();

      // Copper Label
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Cu (+)', copperX, plateTopY + 25);
      ctx.fillText('Copper', copperX, plateTopY + 42);

      // ==========================================
      // 3. HYDROGEN BUBBLES GENERATION (H2 on Copper)
      // ==========================================
      if (Math.random() < 0.4) {
        bubblesRef.current.push({
          x: copperX + (Math.random() - 0.5) * 26,
          y: beakerY + beakerH - 40,
          vy: -1.2 - Math.random() * 1.5,
          radius: 2 + Math.random() * 3,
        });
      }

      // If Local Action is occurring (not amalgamated), bubbles also wastefully form on Zinc!
      if (!isAmalgamated && Math.random() < 0.3) {
        bubblesRef.current.push({
          x: zincX + (Math.random() - 0.5) * 26,
          y: beakerY + beakerH - 40,
          vy: -1.0 - Math.random() * 1.2,
          radius: 1.5 + Math.random() * 2.5,
        });
      }

      // Draw and update bubbles
      for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
        const b = bubblesRef.current[i];
        b.y += b.vy;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (b.y <= beakerY + 40) bubblesRef.current.splice(i, 1);
      }

      // Polarization Layer (Film of H2 gas bubbles blanketing Copper plate)
      if (hasPolarization) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(copperX - plateW / 2 - 4, plateTopY + 50, plateW + 8, plateH - 60, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('H₂ Film (Polarization)', copperX, plateTopY + 100);
      }

      // ==========================================
      // 4. DIGITAL VOLTMETER & GLOWING LED
      // ==========================================
      const vmX = 670;
      const vmY = 160;
      const vmW = 160;
      const vmH = 120;

      // Voltmeter Case
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(vmX - vmW / 2, vmY - vmH / 2, vmW, vmH, 12);
      ctx.fill();
      ctx.stroke();

      // LCD Display Screen
      ctx.fillStyle = '#022c22';
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(vmX - 60, vmY - 40, 120, 45, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${measuredVoltage.toFixed(2)} V`, vmX, vmY - 10);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText('DC VOLTMETER', vmX, vmY + 25);

      // Connecting Wires from Plates to Voltmeter
      // Wire from Zinc Anode (-) to Voltmeter COM
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(zincX, plateTopY);
      ctx.lineTo(zincX, plateTopY - 40);
      ctx.lineTo(vmX - 40, plateTopY - 40);
      ctx.lineTo(vmX - 40, vmY - vmH / 2);
      ctx.stroke();

      // Wire from Copper Cathode (+) to Voltmeter V
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(copperX, plateTopY);
      ctx.lineTo(copperX, plateTopY - 60);
      ctx.lineTo(vmX + 40, plateTopY - 60);
      ctx.lineTo(vmX + 40, vmY - vmH / 2);
      ctx.stroke();

      // Glowing LED Indicator attached to cell
      const ledX = 670;
      const ledY = 320;
      const isLit = measuredVoltage > 0.8;

      if (isLit) {
        const ledGrad = ctx.createRadialGradient(ledX, ledY, 4, ledX, ledY, 35);
        ledGrad.addColorStop(0, '#ffffff');
        ledGrad.addColorStop(0.4, '#38bdf8');
        ledGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = ledGrad;
        ctx.beginPath();
        ctx.arc(ledX, ledY, 35, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isLit ? '#38bdf8' : '#334155';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ledX, ledY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(isLit ? 'LED LIT' : 'LED DIM / OFF', ledX, ledY + 30);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [acidConcentration, hasPolarization, isAmalgamated, measuredVoltage, lang]);

  return (
    <SimulationLayout
      title="Simple Voltaic Cell & Electrochemistry Laboratory"
      titleNepali="सरल सेल तथा विद्युत-रसायन प्रयोगशाला"
      chapterNumber={8}
      chapterTitle="Unit 8: Electricity and Magnetism"
      chapterTitleNepali="एकाइ 8: विद्युत र चुम्बकत्व"
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
      currentPromptEn="Observe how chemical reactions between Zinc, Copper, and H₂SO₄ generate 1.08V and learn about cell defects."
      currentPromptNe="जिंक, तामा र सल्फ्युरिक एसिडबीचको रासायनिक प्रतिक्रियाबाट 1.08 भोल्ट विद्युत कसरी बन्छ हेर्नुहोस्।"
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
        {/* LEFT COLUMN: 2D CANVAS VIEWPORT */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
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
              background: '#ffffff',
            }}
          />

          {/* Floating Top Voltage Status Badge */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '6px 14px',
              borderRadius: '9999px',
              backdropFilter: 'blur(8px)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#38bdf8',
            }}
          >
            <BatteryCharging style={{ width: '14px', height: '14px', color: '#10b981' }} />
            <span>
              {lang === 'ne'
                ? `विद्युत भोल्टेज: ${measuredVoltage} V | ${hasPolarization ? 'ध्रुवीकरण असर' : 'सफा क्याथोड'} | ${isAmalgamated ? 'अमालगम जिंक' : 'स्थानीय असर'}`
                : `Cell Potential: ${measuredVoltage} V | ${hasPolarization ? 'Polarized' : 'Depolarized'} | ${isAmalgamated ? 'Amalgamated' : 'Local Action'}`}
            </span>
          </div>

          {/* Floating Bottom Electrochemistry Banner */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
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
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Redox Half-Reactions:</span>
              <span style={{ fontFamily: 'monospace', color: '#fbbf24' }}>Zn ➔ Zn²⁺ + 2e⁻ (Anode)</span>
              <span style={{ color: '#64748b' }}>|</span>
              <span style={{ fontFamily: 'monospace', color: '#34d399' }}>2H⁺ + 2e⁻ ➔ H₂↑ (Cathode)</span>
            </div>

            <button
              onClick={handleReset}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #e2e8f0',
                color: '#475569',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <RotateCcw style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
              {lang === 'ne' ? 'रिसेट' : 'Reset'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: 380px PERSISTENT CONTROL SIDEBAR */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderLeft: '1px solid #e2e8f0',
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
              <span>{lang === 'ne' ? 'सरल सेल (Voltaic Cell) प्रयोगशाला' : 'Voltaic Cell Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'जिंक र तामाको पाताबाट 1.08 भोल्ट विद्युत उत्पादन गर्नुहोस् र सेलका कमजोरीहरू हटाउनुहोस्।'
                : 'Generate 1.08V electromotive force and investigate local action and polarization defects.'}
            </p>
          </div>

          {/* Cell Defects & Remedies Controls */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '1. सेलका कमजोरी र निवारण (Cell Defects)' : '1. Defects & Remediation'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={handleTogglePolarization}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: hasPolarization ? '1px solid #ef4444' : '1px solid #10b981',
                  background: hasPolarization ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: hasPolarization ? '#fca5a5' : '#34d399',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {hasPolarization
                  ? (lang === 'ne' ? '⚠️ ध्रुवीकरण सक्रिय (तामामा H₂ ग्यास - 0.38V)' : '⚠️ Polarization Active (H₂ on Cu - 0.38V)')
                  : (lang === 'ne' ? '✓ डि-पोलराइजर प्रयोग (1.08V पूर्ण भोल्टेज)' : '✓ Depolarized (1.08V Full Voltage)')}
              </button>

              <button
                onClick={handleToggleAmalgamation}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: isAmalgamated ? '1px solid #38bdf8' : '1px solid #f59e0b',
                  background: isAmalgamated ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isAmalgamated ? '#38bdf8' : '#fbbf24',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {isAmalgamated
                  ? (lang === 'ne' ? '✓ पारो (Hg) ले लेपिएको जिंक (सुरक्षित)' : '✓ Amalgamated Zinc (Protected with Hg)')
                  : (lang === 'ne' ? '⚠️ स्थानीय असर (अशुद्ध जिंक एसिडमा पग्लँदै)' : '⚠️ Local Action (Impure Zinc Dissolving)')}
              </button>
            </div>
          </div>

          {/* Acid Concentration Slider */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
                {lang === 'ne' ? 'एसिडको मात्रा (Dilute H₂SO₄):' : 'Acid Concentration (H₂SO₄):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {acidConcentration}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              value={acidConcentration}
              onChange={(e) => setAcidConcentration(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>10% (Dilute)</span>
              <span>25%</span>
              <span>40% (Concentrated)</span>
            </div>
          </div>

          {/* Cell Telemetry Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '⚡ सेल भोल्टेज र इलेक्ट्रोड:' : '⚡ Electrochemical Potentials:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'ऋण ध्रुव (Anode / Negative):' : 'Anode (Negative Pole):'}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Zinc Plate (Zn)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'धन ध्रुव (Cathode / Positive):' : 'Cathode (Positive Pole):'}</span>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>Copper Plate (Cu)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#34d399', fontWeight: 700 }}>{lang === 'ne' ? 'उत्पन्न भोल्टेज (Voltage):' : 'Measured Voltage:'}</span>
                <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{measuredVoltage} V</span>
              </div>
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
              color: '#64748b',
              lineHeight: '1.4',
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
              {lang === 'ne' ? '📚 पाठ्यक्रम मुख्य बुँदा:' : '📚 Curriculum Takeaway:'}
            </div>
            {lang === 'ne'
              ? 'सरल सेलले रासायनिक शक्तिलाई विद्युत शक्तिमा बदल्छ (1.08 भोल्ट)। जिंकमा हुने स्थानीय असर रोक्न पारोको लेप (Amalgamation) लाइन्छ र ध्रुवीकरण हटाउन डि-पोलराइजर चाहिन्छ।'
              : 'Simple voltaic cells convert chemical energy into electricity. Zinc local action is cured with mercury coating, and polarization with depolarizers.'}
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
              <span>{lang === 'ne' ? '✓ सरल सेल प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Simple Cell Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default SimpleCellLabSim;
