/**
 * SoundVibrationLabSim.tsx
 * Simulation 25: 2D Sound & Vibration Laboratory
 * Grade 6 Science • Unit 7: Energy in Daily Life
 *
 * 100% Native HTML5 Canvas 2D Interactive Acoustics Studio.
 * Features:
 * 1. Sound Origin: Mechanical vibration of matter produces sound waves
 * 2. Vibrating Steel Ruler on Desk:
 *    - Short length -> High frequency (Hz) -> High Pitch
 *    - Long length -> Low frequency (Hz) -> Deep Low Pitch
 * 3. Tuning Fork Water Splash: Vibrating prongs dipped into water generate splash droplets & ripples
 * 4. Real-time Oscilloscope Display: Live sine waveform showing Frequency (Pitch) and Amplitude (Loudness)
 * 5. Procedural Web Audio API sound synthesis matching physical vibration frequencies
 * 6. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Volume2, VolumeX, Sparkles, Activity, Play, RotateCcw, Award } from 'lucide-react';

type AcousticInstrument = 'ruler' | 'tuning_fork';

export const SoundVibrationLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Acoustic Parameters
  const [instrument, setInstrument] = useState<AcousticInstrument>('ruler');
  const [rulerLengthCm, setRulerLengthCm] = useState<number>(15); // 10 to 30 cm
  const [amplitudeLevel, setAmplitudeLevel] = useState<number>(3); // 1 to 5 (Loudness)
  const [isVibrating, setIsVibrating] = useState<boolean>(false);

  // Frequency calculation: Inverse to vibrating length
  // 10 cm -> 600 Hz, 30 cm -> 150 Hz
  const calculatedFrequencyHz = Math.round(4500 / rulerLengthCm);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const splashParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; alpha: number }[]>([]);

  // Procedural Web Audio API synthesis
  const playTone = (freq: number, durationSec: number = 1.0) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const gainVal = (amplitudeLevel / 5) * 0.25;
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch {
      // Audio fallback
    }
  };

  const handlePluck = () => {
    setIsVibrating(true);
    playTone(calculatedFrequencyHz, 1.2);

    // Spawn water splash if in tuning fork mode
    if (instrument === 'tuning_fork') {
      for (let s = 0; s < 18; s++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
        const spd = 2 + Math.random() * 4;
        splashParticlesRef.current.push({
          x: 440 + (Math.random() - 0.5) * 20,
          y: 280,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          alpha: 1.0,
        });
      }
    }

    setTimeout(() => {
      setIsVibrating(false);
    }, 1200);

    if (stage === 'challenge' && stars < 3) setStars(3);
  };

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setInstrument('ruler');
    setRulerLengthCm(15);
    setAmplitudeLevel(3);
    setIsVibrating(false);
    splashParticlesRef.current = [];
    setStars(0);
    setIsCompleted(false);
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
      const time = Date.now() / 15;

      // Dark Laboratory Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Lab Desk Platform
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 390, width, height - 390);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 390);
      ctx.lineTo(width, 390);
      ctx.stroke();

      // ==========================================
      // INSTRUMENT 1: VIBRATING STEEL RULER
      // ==========================================
      if (instrument === 'ruler') {
        const deskX = 220;
        const deskY = 220;

        // Wooden Table Edge (Desk Surface)
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 3;
        ctx.fillRect(0, deskY, deskX, 170);
        ctx.strokeRect(0, deskY, deskX, 170);

        // Heavy Hand / G-Clamp holding ruler firmly on desk
        ctx.fillStyle = '#334155';
        ctx.fillRect(deskX - 70, deskY - 30, 60, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? 'दृढ पकड (Clamp)' : 'Clamped Desk', deskX - 40, deskY - 12);

        // Overhanging Vibrating Steel Ruler
        const rulerPixelLength = rulerLengthCm * 10;
        const rulerTipX = deskX + rulerPixelLength;

        // Ruler vibration vertical displacement
        let vibeY = 0;
        if (isVibrating) {
          const vibeFreq = calculatedFrequencyHz / 25;
          vibeY = Math.sin(time * vibeFreq) * (amplitudeLevel * 7);
        }

        // Draw multiple blur motion lines when vibrating
        if (isVibrating) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.lineWidth = 6;
          for (let b = -2; b <= 2; b++) {
            ctx.beginPath();
            ctx.moveTo(deskX, deskY - 4);
            ctx.quadraticCurveTo(deskX + rulerPixelLength * 0.6, deskY - 4, rulerTipX, deskY - 4 + vibeY * (b / 2));
            ctx.stroke();
          }
        }

        // Solid Steel Ruler
        const rulerGrad = ctx.createLinearGradient(deskX - 80, deskY - 5, rulerTipX, deskY - 5);
        rulerGrad.addColorStop(0, '#64748b');
        rulerGrad.addColorStop(0.5, '#cbd5e1');
        rulerGrad.addColorStop(1, '#94a3b8');
        ctx.strokeStyle = rulerGrad;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(deskX - 80, deskY - 4);
        ctx.lineTo(deskX, deskY - 4);
        ctx.quadraticCurveTo(deskX + rulerPixelLength * 0.5, deskY - 4, rulerTipX, deskY - 4 + vibeY);
        ctx.stroke();

        // Ruler Calibrated Markings
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let m = deskX; m <= rulerTipX; m += 15) {
          const tFactor = (m - deskX) / rulerPixelLength;
          const my = deskY - 4 + vibeY * Math.pow(tFactor, 2);
          ctx.beginPath();
          ctx.moveTo(m, my - 4);
          ctx.lineTo(m, my + 4);
          ctx.stroke();
        }

        // Free Tip Indicator & Sound Waves
        if (isVibrating) {
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
          ctx.lineWidth = 2;
          for (let w = 1; w <= 3; w++) {
            const wr = 15 + w * 18;
            ctx.beginPath();
            ctx.arc(rulerTipX + 10, deskY - 4 + vibeY, wr, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
          }
        }

        // Callout Dimension Label
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`L = ${rulerLengthCm} cm`, deskX + rulerPixelLength / 2, deskY + 36);
      }

      // ==========================================
      // INSTRUMENT 2: TUNING FORK & WATER SPLASH
      // ==========================================
      if (instrument === 'tuning_fork') {
        const forkX = 440;
        const forkY = 160;

        // Tuning Fork Steel U-Prongs
        const forkVibe = isVibrating ? Math.sin(time * 5) * 6 : 0;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';

        // Left Prong
        ctx.beginPath();
        ctx.moveTo(forkX - 24 + forkVibe, forkY);
        ctx.lineTo(forkX - 24 + forkVibe, forkY + 90);
        ctx.quadraticCurveTo(forkX - 24, forkY + 115, forkX, forkY + 115);
        ctx.stroke();

        // Right Prong
        ctx.beginPath();
        ctx.moveTo(forkX + 24 - forkVibe, forkY);
        ctx.lineTo(forkX + 24 - forkVibe, forkY + 90);
        ctx.quadraticCurveTo(forkX + 24, forkY + 115, forkX, forkY + 115);
        ctx.stroke();

        // Handle Stem
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(forkX - 6, forkY + 115, 12, 60);

        // Water Bowl Underneath
        const bowlY = 280;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(forkX, bowlY, 70, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Water Splash Particles
        for (let i = splashParticlesRef.current.length - 1; i >= 0; i--) {
          const sp = splashParticlesRef.current[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vy += 0.2; // gravity
          sp.alpha -= 0.02;

          ctx.fillStyle = `rgba(186, 230, 253, ${Math.max(0, sp.alpha)})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2);
          ctx.fill();

          if (sp.alpha <= 0) splashParticlesRef.current.splice(i, 1);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? 'कम्पायमान ट्युनिङ फोर्क (Tuning Fork)' : 'Vibrating Tuning Fork Prongs', forkX, forkY - 20);
      }

      // ==========================================
      // RIGHT OSCILLOSCOPE SCREEN (Waveform Display)
      // ==========================================
      const oscX = width - 290;
      const oscY = 30;
      const oscW = 260;
      const oscH = 220;

      // Monitor Housing
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(oscX, oscY, oscW, oscH, 16);
      ctx.fill();
      ctx.stroke();

      // Cathode Screen Grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1;
      for (let gx = oscX + 20; gx < oscX + oscW; gx += 25) {
        ctx.beginPath();
        ctx.moveTo(gx, oscY + 15);
        ctx.lineTo(gx, oscY + oscH - 15);
        ctx.stroke();
      }
      for (let gy = oscY + 20; gy < oscY + oscH; gy += 25) {
        ctx.beginPath();
        ctx.moveTo(oscX + 15, gy);
        ctx.lineTo(oscX + oscW - 15, gy);
        ctx.stroke();
      }

      // Live Oscilloscope Sine Wave Trace
      const oscMidY = oscY + oscH / 2;
      const waveFreq = (calculatedFrequencyHz / 100) * 0.08;
      const waveAmp = isVibrating ? amplitudeLevel * 9 : 4;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < oscW - 40; x += 3) {
        const sx = oscX + 20 + x;
        const sy = oscMidY + Math.sin(x * waveFreq + (isVibrating ? time * 0.5 : 0)) * waveAmp;
        if (x === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Oscilloscope Metrics
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? '📟 ओसिलोस्कोप (Waveform)' : '📟 Sound Waveform (Hz)', oscX + 16, oscY + 26);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`f = ${calculatedFrequencyHz} Hz`, oscX + 16, oscY + oscH - 35);

      ctx.fillStyle = calculatedFrequencyHz > 300 ? '#f59e0b' : '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(
        calculatedFrequencyHz > 300
          ? lang === 'ne' ? '• उच्च आवृत्ति ➔ तीखो स्वर (High Pitch)' : '• High Pitch (Sharp Sound)'
          : lang === 'ne' ? '• न्यून आवृत्ति ➔ मोटो स्वर (Low Pitch)' : '• Low Pitch (Deep Sound)',
        oscX + 16,
        oscY + oscH - 15
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [instrument, rulerLengthCm, amplitudeLevel, isVibrating, calculatedFrequencyHz, lang]);

  return (
    <SimulationLayout
      title="Sound and Vibration Laboratory (Pitch, Frequency, Waves)"
      titleNepali="ध्वनि र कम्पन प्रयोगशाला (आवृत्ति, स्वर, तरङ्ग)"
      chapterNumber={7}
      chapterTitle="Unit 7: Energy in Daily Life"
      chapterTitleNepali="एकाइ 7: दैनिक जीवनमा शक्ति"
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
      currentPromptEn="Pluck the vibrating steel ruler or tuning fork to explore how frequency affects pitch on the live oscilloscope."
      currentPromptNe="स्टिलको स्केल वा ट्युनिङ फोर्क हल्लाएर कम्पनले कसरी ध्वनि र स्वर (Pitch) उत्पन्न गर्छ हेर्नुहोस्।"
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

          {/* Floating Top Frequency Badge */}
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
            <Volume2 style={{ width: '14px', height: '14px' }} />
            <span>
              {lang === 'ne'
                ? `आवृत्ति (Frequency): ${calculatedFrequencyHz} Hz | ${calculatedFrequencyHz > 300 ? 'तीखो स्वर (High Pitch)' : 'मोटो स्वर (Low Pitch)'}`
                : `Frequency: ${calculatedFrequencyHz} Hz | ${calculatedFrequencyHz > 300 ? 'High Pitch' : 'Low Pitch'}`}
            </span>
          </div>

          {/* Floating Bottom Acoustic Action Dock */}
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
                {lang === 'ne' ? 'कम्पन स्थिति:' : 'Vibration State:'}
              </span>
              <span style={{ color: isVibrating ? '#34d399' : '#94a3b8', fontWeight: 600 }}>
                {isVibrating ? (lang === 'ne' ? '🔊 कम्पन भइरहेको छ... ध्वनि तरङ्ग प्रवाह!' : '🔊 Actively Vibrating: Generating Sound Waves!') : (lang === 'ne' ? 'कम्पन गराउन तयार' : 'Ready to Pluck')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handlePluck}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
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
                <Volume2 style={{ width: '13px', height: '13px' }} />
                <span>{lang === 'ne' ? 'कम्पन गराउनुहोस् (Pluck)' : 'Pluck / Vibrate'}</span>
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
              <span>{lang === 'ne' ? 'ध्वनि र कम्पन प्रयोगशाला' : 'Acoustics Discovery Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'कम्पनको लम्बाइ र आयाम परिवर्तन गरी स्वरको तीखोपन (Pitch) र ध्वनि तरङ्ग नाप्नुहोस्।'
                : 'Experiment with length and amplitude to investigate frequency and pitch.'}
            </p>
          </div>

          {/* Instrument Selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '1. ध्वनि उपकरण छान्नुहोस्' : '1. Acoustic Instrument'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'ruler', nameEn: '1. Vibrating Steel Ruler', nameNe: '1. स्टिलको स्केल (Pitch vs Length)' },
                { id: 'tuning_fork', nameEn: '2. Tuning Fork Splash', nameNe: '2. ट्युनिङ फोर्क र पानीका छिटा' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setInstrument(m.id as AcousticInstrument);
                    handleReset();
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: instrument === m.id ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                    background: instrument === m.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: instrument === m.id ? '#34d399' : '#cbd5e1',
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

          {/* Ruler Length Slider */}
          {instrument === 'ruler' && (
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
                  {lang === 'ne' ? 'कम्पायमान भागको लम्बाइ:' : 'Vibrating Ruler Length:'}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                  {rulerLengthCm} cm
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={30}
                value={rulerLengthCm}
                onChange={(e) => setRulerLengthCm(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                <span>10 cm (Short - High Pitch)</span>
                <span>30 cm (Long - Low Pitch)</span>
              </div>
            </div>
          )}

          {/* Amplitude Slider */}
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
                {lang === 'ne' ? 'आयाम / आवाजको ठूलोपन (Loudness):' : 'Amplitude (Loudness):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                Level {amplitudeLevel}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={amplitudeLevel}
              onChange={(e) => setAmplitudeLevel(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              <span>Soft (L1)</span>
              <span>Medium</span>
              <span>Loud (L5)</span>
            </div>
          </div>

          {/* Pitch & Frequency Telemetry Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '📟 ध्वनि मापदण्ड (Acoustic Metrics):' : '📟 Acoustic Metrics:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'आवृत्ति (Frequency):' : 'Frequency (f):'}</span>
                <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{calculatedFrequencyHz} Hz</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'स्वरको तीखोपन (Pitch):' : 'Sound Pitch:'}</span>
                <span style={{ fontWeight: 700, color: calculatedFrequencyHz > 300 ? '#fbbf24' : '#38bdf8' }}>
                  {calculatedFrequencyHz > 300
                    ? (lang === 'ne' ? 'तीखो स्वर (High Pitch)' : 'High Pitch (Sharp)')
                    : (lang === 'ne' ? 'मोटो स्वर (Low Pitch)' : 'Low Pitch (Deep)')}
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
              ? 'वस्तुको कम्पन (Vibration) ले ध्वनि उत्पन्न गर्दछ। कम्पनको लम्बाइ छोटो हुँदा आवृत्ति बढी र स्वर तीखो (High Pitch) हुन्छ।'
              : 'Sound is produced by vibrations. Higher frequency produces higher pitch; greater amplitude produces louder sound.'}
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
              <span>{lang === 'ne' ? '✓ ध्वनि र कम्पन प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Sound & Vibration Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default SoundVibrationLabSim;
