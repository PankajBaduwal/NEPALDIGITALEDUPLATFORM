/**
 * ElectromagnetWorkshopSim.tsx
 * Simulation 28: 2D Electromagnet Workshop
 * Grade 6 Science • Unit 8: Electricity and Magnetism
 *
 * 100% Native HTML5 Canvas 2D Interactive Solenoid Electromagnetism.
 * Features:
 * 1. Insulated copper wire wrapped around a soft iron nail core
 * 2. Instant magnetic field generation on switch closure and demagnetization on opening
 * 3. Modulators of magnetic strength:
 *    - Number of coil turns (N = 10, 20, 40 turns)
 *    - Battery voltage (1.5V single cell vs 3.0V dual cell)
 * 4. Realistic attraction of steel paper pins snapping to nail tip and dropping when power cut
 * 5. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Zap, Power, Sparkles, Battery, RotateCcw, Award } from 'lucide-react';

export const ElectromagnetWorkshopSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Electrical Parameters
  const [coilTurns, setCoilTurns] = useState<number>(20); // 10, 20, 40
  const [batteryCount, setBatteryCount] = useState<number>(1); // 1 (1.5V) or 2 (3.0V)
  const [isSwitchClosed, setIsSwitchClosed] = useState<boolean>(true);

  // Magnetic Strength & Lifted Pins count
  const maxPins = Math.round((coilTurns / 10) * batteryCount * 3);
  const pinsLifted = isSwitchClosed ? maxPins : 0;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setCoilTurns(20);
    setBatteryCount(1);
    setIsSwitchClosed(true);
    setStars(0);
    setIsCompleted(false);
  };

  const handleToggleSwitch = () => {
    ScienceAudio.playClick();
    const next = !isSwitchClosed;
    setIsSwitchClosed(next);
    if (next) {
      ScienceAudio.playDing();
      if (stage === 'challenge' && stars < 3) setStars(3);
    } else {
      ScienceAudio.playPop();
    }
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

      // Dark Tech Lab Backdrop
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
      // 1. SOFT IRON NAIL WITH COPPER COIL SOLENOID
      // ==========================================
      const nailX = 420;
      const nailY = 220;
      const nailW = 280;
      const nailH = 22;

      // Soft Iron Nail Head & Body
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;

      // Nail Flat Head (Left)
      ctx.fillRect(nailX - nailW / 2 - 8, nailY - 20, 16, 40);
      ctx.strokeRect(nailX - nailW / 2 - 8, nailY - 20, 16, 40);

      // Nail Cylindrical Shank
      ctx.fillRect(nailX - nailW / 2, nailY - nailH / 2, nailW - 40, nailH);
      ctx.strokeRect(nailX - nailW / 2, nailY - nailH / 2, nailW - 40, nailH);

      // Nail Sharp Point (Right Tip)
      ctx.beginPath();
      ctx.moveTo(nailX + nailW / 2 - 40, nailY - nailH / 2);
      ctx.lineTo(nailX + nailW / 2, nailY);
      ctx.lineTo(nailX + nailW / 2 - 40, nailY + nailH / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wrapped Copper Wire Coils (Solenoid)
      const coilStartX = nailX - nailW / 2 + 30;
      const coilEndX = nailX + nailW / 2 - 60;
      const coilSpan = coilEndX - coilStartX;
      const turns = coilTurns;
      const step = coilSpan / turns;

      ctx.strokeStyle = '#f59e0b'; // Shiny copper wire
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      for (let t = 0; t < turns; t++) {
        const cx = coilStartX + t * step;
        ctx.beginPath();
        ctx.ellipse(cx, nailY, step * 0.45, nailH / 2 + 5, 0.2, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }

      // Magnetic Field Loops around Solenoid when Active
      if (isSwitchClosed) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 2;
        for (let l = 1; l <= 3; l++) {
          const rx = 150 + l * 25;
          const ry = 45 + l * 20;
          ctx.beginPath();
          ctx.ellipse(nailX - 10, nailY, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Magnetic Pole Badges on Nail
        ctx.fillStyle = '#ef4444'; // North (Red)
        ctx.beginPath();
        ctx.roundRect(nailX + nailW / 2 - 25, nailY - 32, 22, 18, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('N', nailX + nailW / 2 - 14, nailY - 19);

        ctx.fillStyle = '#3b82f6'; // South (Blue)
        ctx.beginPath();
        ctx.roundRect(nailX - nailW / 2 - 20, nailY - 32, 22, 18, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('S', nailX - nailW / 2 - 9, nailY - 19);
      }

      // ==========================================
      // 2. STEEL PAPER PINS (Attracted vs Fallen)
      // ==========================================
      const tipX = nailX + nailW / 2;
      const tipY = nailY;

      for (let p = 0; p < maxPins; p++) {
        if (isSwitchClosed) {
          // Pins lifted and clustered clinging to nail sharp tip
          const pinAngle = (p * 0.4) - 0.8;
          const pinLen = 28;
          const px = tipX + Math.cos(pinAngle) * 14;
          const py = tipY + Math.sin(pinAngle) * 14;

          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + Math.cos(pinAngle) * pinLen, py + Math.sin(pinAngle) * pinLen);
          ctx.stroke();

          // Pin head
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Pins lying flat on the bench table!
          const fx = 560 + (p % 6) * 22;
          const fy = 385;
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(fx + 22, fy);
          ctx.stroke();
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ==========================================
      // 3. BATTERY & KNIFE SWITCH CIRCUIT
      // ==========================================
      // DC Dry Cell Battery (Left lower bench)
      const batX = 140;
      const batY = 320;
      for (let b = 0; b < batteryCount; b++) {
        const bx = batX + b * 55;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(bx, batY - 25, 48, 50, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(bx + 18, batY - 32, 12, 7); // + terminal nub

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('1.5V', bx + 24, batY + 6);
      }

      // Knife Switch (Lower Center)
      const swX = 420;
      const swY = 320;
      ctx.fillStyle = '#334155';
      ctx.fillRect(swX - 30, swY - 8, 60, 16);

      // Copper Contacts
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(swX - 20, swY, 5, 0, Math.PI * 2);
      ctx.arc(swX + 20, swY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Switch Blade Lever
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(swX - 20, swY);
      if (isSwitchClosed) {
        ctx.lineTo(swX + 20, swY); // Closed
      } else {
        ctx.lineTo(swX + 10, swY - 30); // Open
      }
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isSwitchClosed ? 'Switch ON' : 'Switch OFF', swX, swY + 22);

      // Connecting Wires
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(coilStartX, nailY - nailH / 2);
      ctx.lineTo(batX + 24, nailY - 50);
      ctx.lineTo(batX + 24, batY - 32);
      ctx.stroke();

      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(batX + batteryCount * 50 - 2, batY);
      ctx.lineTo(swX - 20, batY);
      ctx.stroke();

      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(swX + 20, swY);
      ctx.lineTo(coilEndX, swY);
      ctx.lineTo(coilEndX, nailY + nailH / 2);
      ctx.stroke();

      // ==========================================
      // 4. READOUT HUD CARD
      // ==========================================
      const hudX = width - 250;
      const hudY = 25;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, 220, 210, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? '🧲 विद्युत चुम्बकीय सामर्थ्य:' : '🧲 Electromagnet Strength:', hudX + 16, hudY + 28);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(lang === 'ne' ? `तारको फन्को (N): ${coilTurns}` : `Coil Turns (N): ${coilTurns}`, hudX + 16, hudY + 62);

      ctx.fillStyle = '#fbbf24';
      ctx.fillText(
        lang === 'ne' ? `भोल्टेज: ${batteryCount * 1.5}V` : `Voltage: ${batteryCount * 1.5}V (${batteryCount} Cells)`,
        hudX + 16,
        hudY + 95
      );

      ctx.fillStyle = isSwitchClosed ? '#4ade80' : '#f87171';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(
        lang === 'ne' ? `टाँसिएका पिनहरू: ${pinsLifted}` : `Pins Lifted: ${pinsLifted}`,
        hudX + 16,
        hudY + 135
      );

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText('B ∝ N × I', hudX + 16, hudY + 165);
      ctx.fillText(
        lang === 'ne' ? '• अस्थायी चुम्बक: करेन्ट काट्दा हराउँछ।' : '• Temporary magnet: vanishes when off.',
        hudX + 16,
        hudY + 185
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [coilTurns, batteryCount, isSwitchClosed, maxPins, pinsLifted, lang]);

  return (
    <SimulationLayout
      title="Electromagnet Workshop & Solenoid Coil"
      titleNepali="विद्युत चुम्बक कार्यशाला तथा सोलेनोइड तार"
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
      currentPromptEn="Toggle the switch and change coil turns or battery voltage to see how electromagnet strength varies."
      currentPromptNe="स्वीच थिच्नुहोस्, तारको फन्को र ब्याट्री थपेर विद्युत चुम्बकको शक्ति बढाउनुहोस्।"
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

          {/* Floating Top Electromagnet Status Badge */}
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
            <Zap style={{ width: '14px', height: '14px', color: isSwitchClosed ? '#facc15' : '#94a3b8' }} />
            <span>
              {isSwitchClosed
                ? (lang === 'ne' ? `विद्युत चुम्बक चालु: ${coilTurns} फन्को, ${batteryCount * 1.5}V ➔ ${pinsLifted} पिन टाँसियो` : `Electromagnet Active: ${coilTurns} Turns, ${batteryCount * 1.5}V ➔ ${pinsLifted} Pins`)
                : (lang === 'ne' ? 'विद्युत चुम्बक बन्द (चुम्बकीय शक्ति शून्य)' : 'Circuit Open: Electromagnet Inactive')}
            </span>
          </div>

          {/* Floating Bottom Solenoid Law Banner */}
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
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Electromagnet Strength:</span>
              <span style={{ fontFamily: 'monospace', color: '#4ade80' }}>B ∝ Current (I) × Turns (N)</span>
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
              {isSwitchClosed ? (lang === 'ne' ? 'स्वीच खुला गर्नुहोस् (ON)' : 'Open Switch (ON)') : (lang === 'ne' ? 'स्वीच बन्द गर्नुहोस् (OFF)' : 'Close Switch (OFF)')}
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
              <span>{lang === 'ne' ? 'विद्युत चुम्बक अनुसन्धान केन्द्र' : 'Electromagnet Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'तारको फन्को र ब्याट्रीको भोल्टेज थपेर विद्युत चुम्बकको शक्ति कसरी बढ्छ जाँच्नुहोस्।'
                : 'Modify solenoid coil turns and battery voltage to measure magnetic lifting strength.'}
            </p>
          </div>

          {/* Coil Turns Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '1. तारको फन्को संख्या (Coil Turns)' : '1. Solenoid Coil Turns'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[10, 20, 40].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setCoilTurns(t);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: coilTurns === t ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                    background: coilTurns === t ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: coilTurns === t ? '#fbbf24' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t} {lang === 'ne' ? 'फन्को' : 'Turns'}
                </button>
              ))}
            </div>
          </div>

          {/* Battery Voltage Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '2. ब्याट्री भोल्टेज (Current Strength)' : '2. Battery Potential (Voltage)'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {[
                { count: 1, label: '1 Cell (1.5V)', labelNe: '1 सेल (1.5 भोल्ट)' },
                { count: 2, label: '2 Cells (3.0V)', labelNe: '2 सेल (3.0 भोल्ट)' },
              ].map((b) => (
                <button
                  key={b.count}
                  onClick={() => {
                    setBatteryCount(b.count);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px 6px',
                    borderRadius: '8px',
                    border: batteryCount === b.count ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: batteryCount === b.count ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: batteryCount === b.count ? '#38bdf8' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'ne' ? b.labelNe : b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '📊 चुम्बकीय शक्ति विश्लेषण:' : '📊 Electromagnet Metrics:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'सर्किट स्थिति:' : 'Circuit State:'}</span>
                <span style={{ fontWeight: 700, color: isSwitchClosed ? '#34d399' : '#f87171' }}>
                  {isSwitchClosed ? (lang === 'ne' ? 'विद्युत प्रवाहित (Active)' : 'Closed / Energized') : (lang === 'ne' ? 'विद्युत बन्द (Open)' : 'Open / De-energized')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'टाँसिएका पिनको संख्या:' : 'Paper Clips Lifted:'}</span>
                <span style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{pinsLifted} Clips</span>
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
              ? 'विद्युत चुम्बक अस्थायी चुम्बक हो। करेन्ट प्रवाह हुँदा मात्र यसले चुम्बकीय गुण देखाउँछ। तारको फन्को र करेन्ट बढाउँदा चुम्बकीय शक्ति बढ्छ।'
              : 'Electromagnets are temporary magnets. Magnetic field strength increases directly with coil turns and electric current (B ∝ I·N).'}
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
              <span>{lang === 'ne' ? '✓ विद्युत चुम्बक प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Electromagnet Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default ElectromagnetWorkshopSim;
