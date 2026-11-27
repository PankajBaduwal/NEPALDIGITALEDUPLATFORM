/**
 * CentrifugationSimulatorSim.tsx
 * Simulation 36: 2D Centrifugation Simulator (सेन्ट्रिफ्युगेसन प्रयोगशाला)
 * Grade 6 Science • Unit 9: Matter (पदार्थ)
 *
 * 100% Native HTML5 Canvas 2D Interactive Centrifugal Separation Laboratory.
 * Features:
 * 1. Centrifugal Force Separation: Fc = m * ω² * r
 * 2. 4-Tube Symmetrical Balanced Rotor spinning up to 3000 RPM with motion blur
 * 3. Clear phase separation: Dense bottom Pellet vs Clear top Supernatant
 * 4. Sample types: Blood (Plasma vs RBCs) & Milk (Skim milk vs Cream)
 * 5. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { RotateCw, Sparkles, Play, Pause, Activity, RotateCcw, Award } from 'lucide-react';

type CentrifugeSample = 'blood' | 'milk';

export const CentrifugationSimulatorSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Centrifuge Parameters
  const [sampleType, setSampleType] = useState<CentrifugeSample>('blood');
  const [targetRpm, setTargetRpm] = useState<number>(2500); // 500 to 3000
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [separationPercent, setSeparationPercent] = useState<number>(0); // 0 to 100%

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotorAngleRef = useRef<number>(0);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setIsSpinning(false);
    setSeparationPercent(0);
    rotorAngleRef.current = 0;
    setStars(0);
    setIsCompleted(false);
  };

  const handleToggleSpin = () => {
    ScienceAudio.playClick();
    const next = !isSpinning;
    setIsSpinning(next);
    if (next) ScienceAudio.playDing();
  };

  // 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Speed up spin and separation
      if (isSpinning) {
        rotorAngleRef.current += (targetRpm / 60) * 0.08;
        if (separationPercent < 100) {
          setSeparationPercent((prev) => {
            const next = Math.min(100, prev + 0.35 * (targetRpm / 2000));
            if (next >= 100 && stage === 'challenge' && stars < 3) {
              setStars(3);
              ScienceAudio.playCheer();
            }
            return next;
          });
        }
      }

      const width = canvas.width;
      const height = canvas.height;

      // Dark Laboratory Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Lab Work Counter
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 390, width, height - 390);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 390);
      ctx.lineTo(width, 390);
      ctx.stroke();

      // ==========================================
      // 1. TOP-DOWN ROTOR SPINNER (Left Center)
      // ==========================================
      const rotorX = 280;
      const rotorY = 220;
      const rotorRadius = 120;

      // Outer Centrifuge Casing Bowl
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(rotorX, rotorY, rotorRadius + 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotating Rotor Arm Assembly
      ctx.save();
      ctx.translate(rotorX, rotorY);
      ctx.rotate(rotorAngleRef.current);

      // Spinning Blur Rings when high RPM
      if (isSpinning && targetRpm > 1000) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(0, 0, rotorRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4 Metal Rotor Arms (Cross)
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-rotorRadius, -6, rotorRadius * 2, 12);
      ctx.fillRect(-6, -rotorRadius, 12, rotorRadius * 2);

      // 4 Centrifuge Test Tube Holders on Rim
      const tubeAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
      tubeAngles.forEach((ang) => {
        const tx = Math.cos(ang) * rotorRadius;
        const ty = Math.sin(ang) * rotorRadius;

        // Tube Buckets
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(tx, ty, 14, 22, ang, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Center Spindle Hub
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        lang === 'ne'
          ? `घुम्ने गति: ${isSpinning ? targetRpm : 0} RPM`
          : `Rotor Speed: ${isSpinning ? targetRpm : 0} RPM`,
        rotorX,
        rotorY + rotorRadius + 60
      );

      // ==========================================
      // 2. DETAILED TEST TUBE CUTAWAY INSET (Right Side)
      // ==========================================
      const tubeInsetX = 640;
      const tubeInsetY = 220;
      const tubeW = 60;
      const tubeH = 240;

      // Inset Frame
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(tubeInsetX - 110, 40, 220, 330, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        lang === 'ne' ? '🔬 नलीको भित्री तह (Phase Separation)' : '🔬 Test Tube Phases (100X)',
        tubeInsetX,
        65
      );

      // Glass Test Tube Outline
      const tubeTopY = 90;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tubeInsetX - tubeW / 2, tubeTopY);
      ctx.lineTo(tubeInsetX - tubeW / 2, tubeTopY + tubeH - tubeW / 2);
      ctx.arc(tubeInsetX, tubeTopY + tubeH - tubeW / 2, tubeW / 2, Math.PI, 0, true);
      ctx.lineTo(tubeInsetX + tubeW / 2, tubeTopY);
      ctx.stroke();

      // Liquid Contents (Unseparated vs Separated Phases)
      const sep = separationPercent / 100;

      if (sampleType === 'blood') {
        // Unseparated: Whole blood dark red
        // Separated: Top Plasma (Yellow 55%), Middle Buffy Coat (White 1%), Bottom RBCs (Dark Red 44%)
        const plasmaH = (tubeH - 40) * 0.55 * sep;
        const rbcH = (tubeH - 40) * 0.44 * sep;

        // Base Liquid (Unseparated or remaining mix)
        ctx.fillStyle = '#991b1b'; // Whole blood
        ctx.beginPath();
        ctx.moveTo(tubeInsetX - tubeW / 2 + 2, tubeTopY + 20);
        ctx.lineTo(tubeInsetX - tubeW / 2 + 2, tubeTopY + tubeH - tubeW / 2);
        ctx.arc(tubeInsetX, tubeTopY + tubeH - tubeW / 2, tubeW / 2 - 2, Math.PI, 0, true);
        ctx.lineTo(tubeInsetX + tubeW / 2 - 2, tubeTopY + 20);
        ctx.closePath();
        ctx.fill();

        // Top Supernatant Layer: Plasma (Yellow / Straw colored)
        if (sep > 0.05) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(tubeInsetX - tubeW / 2 + 2, tubeTopY + 20, tubeW - 4, plasmaH);

          // Middle Buffy Coat (WBCs & Platelets)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(tubeInsetX - tubeW / 2 + 2, tubeTopY + 20 + plasmaH, tubeW - 4, 4 * sep);
        }

        // Bottom Pellet: Packed Red Blood Cells (RBCs)
        if (sep > 0.05) {
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.moveTo(tubeInsetX - tubeW / 2 + 2, tubeTopY + tubeH - rbcH);
          ctx.lineTo(tubeInsetX - tubeW / 2 + 2, tubeTopY + tubeH - tubeW / 2);
          ctx.arc(tubeInsetX, tubeTopY + tubeH - tubeW / 2, tubeW / 2 - 2, Math.PI, 0, true);
          ctx.lineTo(tubeInsetX + tubeW / 2 - 2, tubeTopY + tubeH - rbcH);
          ctx.closePath();
          ctx.fill();
        }

        // Phase Labels on Inset
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(lang === 'ne' ? '• प्लाज्मा (हल्का पहेँलो ५५%)' : '• Plasma (Straw Fluid ~55%)', tubeInsetX + tubeW / 2 + 10, tubeTopY + 45);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(lang === 'ne' ? '• सेतो रक्तकोष (WBCs)' : '• Buffy Coat (WBCs ~1%)', tubeInsetX + tubeW / 2 + 10, tubeTopY + 130);

        ctx.fillStyle = '#f87171';
        ctx.fillText(lang === 'ne' ? '• रातो रक्तकोष (RBCs ४४%)' : '• RBC Pellet (Dense ~44%)', tubeInsetX + tubeW / 2 + 10, tubeTopY + 205);
      } else {
        // Milk: Top Cream (Fat globules) vs Bottom Skim Milk (Water & proteins)
        ctx.fillStyle = '#f8fafc'; // Milk
        ctx.fillRect(tubeInsetX - tubeW / 2 + 2, tubeTopY + 20, tubeW - 4, tubeH - 40);

        if (sep > 0.05) {
          // Top Cream (Yellow-white)
          ctx.fillStyle = '#fde047';
          ctx.fillRect(tubeInsetX - tubeW / 2 + 2, tubeTopY + 20, tubeW - 4, (tubeH - 40) * 0.3 * sep);
        }
      }

      // Separation Progress Bar
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        lang === 'ne' ? `विभाजन प्रगति: ${Math.round(separationPercent)}%` : `Separation: ${Math.round(separationPercent)}%`,
        tubeInsetX,
        350
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [sampleType, targetRpm, isSpinning, separationPercent, stage, stars, lang]);

  return (
    <SimulationLayout
      title="High-Speed Centrifugation Simulator (Centrifugal Force)"
      titleNepali="उच्च गति सेन्ट्रिफ्युगेसन सिमुलेटर (अपकेन्द्री बल)"
      chapterNumber={9}
      chapterTitle="Unit 9: Matter"
      chapterTitleNepali="एकाइ ९: पदार्थ"
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
      currentPromptEn="Spin the centrifuge rotor at high RPM to separate blood into light plasma and dense red blood cell pellet."
      currentPromptNe="सेन्ट्रिफ्युजलाई तीव्र गतिमा घुमाएर रगतबाट प्लाज्मा र रातो रक्तकोष छुट्याउनुहोस्।"
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

          {/* Floating Top RPM & Separation Badge */}
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
            <RotateCw style={{ width: '14px', height: '14px', color: isSpinning ? '#f59e0b' : '#38bdf8' }} />
            <span>
              {lang === 'ne'
                ? `रोटर: ${targetRpm} RPM | छुट्याइएको: ${separationPercent.toFixed(0)}% | ${sampleType === 'blood' ? 'रगत (Blood)' : 'दूध (Milk)'}`
                : `Rotor: ${targetRpm} RPM | Separation: ${separationPercent.toFixed(0)}% | ${sampleType === 'blood' ? 'Blood' : 'Milk'}`}
            </span>
          </div>

          {/* Floating Bottom Spin Action Dock */}
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
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {lang === 'ne' ? 'अपकेन्द्री स्थिति:' : 'Centrifugation:'}
              </span>
              <span style={{ color: isSpinning ? '#f59e0b' : separationPercent >= 90 ? '#4ade80' : '#94a3b8', fontWeight: 600 }}>
                {isSpinning
                  ? (lang === 'ne' ? `🌀 तीव्र गतिमा घुमिरहेको छ (${targetRpm} RPM)...` : `🌀 Spinning at ${targetRpm} RPM: Sedimentation active!`)
                  : separationPercent >= 90
                  ? (lang === 'ne' ? '✓ घनत्वका आधारमा पूर्ण रूपमा छुट्टियो!' : '✓ Separation complete by density gradient!')
                  : (lang === 'ne' ? 'घुमाउन सुरु गर्नुहोस्' : 'Ready to centrifuge')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleToggleSpin}
                style={{
                  background: isSpinning ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                }}
              >
                <RotateCw style={{ width: '13px', height: '13px' }} />
                <span>{isSpinning ? (lang === 'ne' ? 'रोक्नुहोस् (Stop)' : 'Stop Rotor') : (lang === 'ne' ? 'घुमाउनुहोस् (Spin)' : 'Start Spin')}</span>
              </button>
              <button
                onClick={handleReset}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
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
              <span>{lang === 'ne' ? 'सेन्ट्रिफ्युगेसन प्रयोगशाला' : 'Centrifugation Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'अपकेन्द्री बल (Centrifugal Force) द्वारा तरल पदार्थबाट भारी र हलुका घटकहरू छुट्याउनुहोस्।'
                : 'Accelerate sedimentation to separate cellular fractions and colloidal emulsions by density.'}
            </p>
          </div>

          {/* Sample Selection */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '१. नमुना छान्नुहोस् (Sample Type)' : '1. Select Sample'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {[
                { id: 'blood', nameEn: 'Blood Sample', nameNe: 'रगत (Plasma vs RBCs)' },
                { id: 'milk', nameEn: 'Milk Sample', nameNe: 'दूध (Cream vs Skim)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSampleType(s.id as CentrifugeSample);
                    handleReset();
                  }}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: sampleType === s.id ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.08)',
                    background: sampleType === s.id ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: sampleType === s.id ? '#f43f5e' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {lang === 'ne' ? s.nameNe : s.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Rotor RPM Slider */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>
                {lang === 'ne' ? 'रोटर गति (Rotor RPM):' : 'Rotor Speed (RPM):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {targetRpm} RPM
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={3000}
              step={250}
              disabled={isSpinning}
              value={targetRpm}
              onChange={(e) => setTargetRpm(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: isSpinning ? 'not-allowed' : 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>500 RPM (Slow)</span>
              <span>1750 RPM</span>
              <span>3000 RPM (High-G)</span>
            </div>
          </div>

          {/* Centrifugal Telemetry Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '🔬 अवसादन विश्लेषण (Sedimentation):' : '🔬 Sedimentation Telemetry:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'माथिल्लो तह (Supernatant):' : 'Upper Supernatant:'}</span>
                <span style={{ fontWeight: 700, color: '#fef08a' }}>
                  {sampleType === 'blood' ? (lang === 'ne' ? 'हल्का प्लाज्मा (५५%)' : 'Liquid Plasma (55%)') : (lang === 'ne' ? 'तर / क्रीम (Fat Cream)' : 'Light Cream')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'तल्लो पिँध (Sediment Pellet):' : 'Bottom Pellet:'}</span>
                <span style={{ fontWeight: 700, color: '#f87171' }}>
                  {sampleType === 'blood' ? (lang === 'ne' ? 'रातो रक्तकोष RBCs (४५%)' : 'Dense RBC Pellet (45%)') : (lang === 'ne' ? 'फ्याटविहीन दूध (Skim Milk)' : 'Skim Milk Base')}
                </span>
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
              ? 'सेन्ट्रिफ्युगेसन विधिमा मिश्रणलाई तीव्र गतिमा घुमाउँदा अपकेन्द्री बल (Centrifugal Force) ले बढी घनत्व भएका भारी कणहरूलाई नलीको फेदमा थिग्र्याउँछ र हलुका घटक माथि रहन्छ।'
              : 'Centrifugation uses centrifugal acceleration to separate particles based on density, mass, and shape. Dense matter pellets at the bottom.'}
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
              <span>{lang === 'ne' ? '✓ सेन्ट्रिफ्युगेसन प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Centrifugation Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default CentrifugationSimulatorSim;
