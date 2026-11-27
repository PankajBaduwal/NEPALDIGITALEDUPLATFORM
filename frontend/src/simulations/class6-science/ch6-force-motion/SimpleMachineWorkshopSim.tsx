/**
 * SimpleMachineWorkshopSim.tsx
 * Simulation 18: 2D Simple Machine Workshop
 * Grade 6 Science • Unit 6: Force and Motion
 *
 * 100% Native HTML5 Canvas 2D Interactive Simple Machines Laboratory.
 * Features:
 * 1. Three Classes of Levers:
 *    - Class 1: Fulcrum in Middle
 *    - Class 2: Load in Middle
 *    - Class 3: Effort in Middle
 * 2. Pulley Systems: Fixed Pulley (MA = 1) vs Movable Pulley (MA = 2)
 * 3. Inclined Plane: MA = Length / Height (l / h)
 * 4. Real-time Mechanical Advantage (MA) and Required Effort (N) computation
 * 5. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Wrench, Sparkles, Sliders, ArrowUpRight, Check, RotateCcw, Award } from 'lucide-react';

type MachineType = 'class1_lever' | 'class2_lever' | 'class3_lever' | 'pulley' | 'inclined_plane';

export const SimpleMachineWorkshopSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Machine Selection
  const [machine, setMachine] = useState<MachineType>('class1_lever');
  const [loadWeightN, setLoadWeightN] = useState<number>(120); // 20 - 200 N
  const [effortArmM, setEffortArmM] = useState<number>(2.0); // 0.5 - 3.0 m
  const [loadArmM, setLoadArmM] = useState<number>(1.0); // 0.5 - 2.0 m
  const [rampLengthM, setRampLengthM] = useState<number>(4.0); // 2 - 6 m
  const [rampHeightM, setRampHeightM] = useState<number>(1.5); // 0.5 - 2.5 m
  const [isMovablePulley, setIsMovablePulley] = useState<boolean>(false);

  // Computed Mechanical Advantage
  let ma = 1.0;
  let requiredEffortN = loadWeightN;

  if (machine === 'class1_lever' || machine === 'class2_lever' || machine === 'class3_lever') {
    ma = parseFloat((effortArmM / loadArmM).toFixed(2));
    requiredEffortN = parseFloat((loadWeightN / ma).toFixed(1));
  } else if (machine === 'pulley') {
    ma = isMovablePulley ? 2.0 : 1.0;
    requiredEffortN = parseFloat((loadWeightN / ma).toFixed(1));
  } else if (machine === 'inclined_plane') {
    ma = parseFloat((rampLengthM / rampHeightM).toFixed(2));
    requiredEffortN = parseFloat((loadWeightN / ma).toFixed(1));
  }

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setMachine('class1_lever');
    setLoadWeightN(120);
    setEffortArmM(2.0);
    setLoadArmM(1.0);
    setRampLengthM(4.0);
    setRampHeightM(1.5);
    setIsMovablePulley(false);
    setStars(0);
    setIsCompleted(false);
  };

  const handleSelectMachine = (m: MachineType) => {
    ScienceAudio.playClick();
    setMachine(m);
    if (m === 'class2_lever') {
      setEffortArmM(2.4);
      setLoadArmM(1.2);
    } else if (m === 'class3_lever') {
      setEffortArmM(1.0);
      setLoadArmM(2.0);
    } else {
      setEffortArmM(2.0);
      setLoadArmM(1.0);
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

      // Dark Workshop Studio Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Floor Countertop
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 390, width, height - 390);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 390);
      ctx.lineTo(width, 390);
      ctx.stroke();

      // ==========================================
      // MACHINE 1: LEVERS (Class 1, 2, 3)
      // ==========================================
      if (machine.includes('lever')) {
        const fulcrumX = machine === 'class1_lever' ? 420 : machine === 'class2_lever' ? 240 : 240;
        const fulcrumY = 320;
        const beamY = fulcrumY;

        // Triangular Fulcrum
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fulcrumX, fulcrumY);
        ctx.lineTo(fulcrumX - 28, fulcrumY + 50);
        ctx.lineTo(fulcrumX + 28, fulcrumY + 50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? 'टेको (Fulcrum, F)' : 'Fulcrum (F)', fulcrumX, fulcrumY + 68);

        // Rigid Steel Beam Lever
        const beamStartX = 140;
        const beamEndX = 700;
        const beamGrad = ctx.createLinearGradient(0, beamY - 8, 0, beamY + 8);
        beamGrad.addColorStop(0, '#94a3b8');
        beamGrad.addColorStop(0.5, '#cbd5e1');
        beamGrad.addColorStop(1, '#475569');
        ctx.fillStyle = beamGrad;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(beamStartX, beamY - 8, beamEndX - beamStartX, 16, 4);
        ctx.fill();
        ctx.stroke();

        // Load Position
        let loadPosPix = 240;
        if (machine === 'class1_lever') loadPosPix = fulcrumX - loadArmM * 80;
        else if (machine === 'class2_lever') loadPosPix = fulcrumX + loadArmM * 80;
        else if (machine === 'class3_lever') loadPosPix = fulcrumX + loadArmM * 110;

        // Draw Heavy Load Block
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(loadPosPix - 26, beamY - 58, 52, 50, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`${loadWeightN} N`, loadPosPix, beamY - 28);
        ctx.fillText(lang === 'ne' ? 'भार (L)' : 'Load (L)', loadPosPix, beamY - 65);

        // Effort Position
        let effortPosPix = 600;
        if (machine === 'class1_lever') effortPosPix = fulcrumX + effortArmM * 80;
        else if (machine === 'class2_lever') effortPosPix = fulcrumX + effortArmM * 80;
        else if (machine === 'class3_lever') effortPosPix = fulcrumX + effortArmM * 110;

        // Draw Downward / Upward Effort Vector Arrow
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(effortPosPix, beamY - 80);
        ctx.lineTo(effortPosPix, beamY - 14);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(effortPosPix, beamY - 8);
        ctx.lineTo(effortPosPix - 8, beamY - 22);
        ctx.lineTo(effortPosPix + 8, beamY - 22);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`${requiredEffortN} N`, effortPosPix, beamY - 95);
        ctx.fillText(lang === 'ne' ? 'प्रयास (E)' : 'Effort (E)', effortPosPix, beamY - 112);

        // Distance Rulers under Lever
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(`Load Arm = ${loadArmM}m`, (fulcrumX + loadPosPix) / 2, beamY + 30);
        ctx.fillText(`Effort Arm = ${effortArmM}m`, (fulcrumX + effortPosPix) / 2, beamY + 30);
      }

      // ==========================================
      // MACHINE 2: PULLEY SYSTEM
      // ==========================================
      if (machine === 'pulley') {
        const topRigY = 90;
        // Top Support Beam
        ctx.fillStyle = '#475569';
        ctx.fillRect(260, topRigY - 14, 340, 14);

        if (!isMovablePulley) {
          // Fixed Single Pulley
          const pX = 420;
          const pY = topRigY + 40;
          // Axle & Wheel
          ctx.fillStyle = '#94a3b8';
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(pX, pY, 36, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(pX, pY, 8, 0, Math.PI * 2);
          ctx.fill();

          // Rope
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 4;
          // Left side (hangs load)
          ctx.beginPath();
          ctx.moveTo(pX - 36, pY);
          ctx.lineTo(pX - 36, 320);
          // Over wheel
          ctx.arc(pX, pY, 36, Math.PI, 0);
          // Right side (pulled down by person)
          ctx.lineTo(pX + 36, 300);
          ctx.stroke();

          // Load
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.roundRect(pX - 60, 320, 48, 48, 6);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${loadWeightN} N`, pX - 36, 350);

          // Effort
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(`Effort: ${requiredEffortN} N (MA = 1)`, pX + 90, 290);
        } else {
          // Movable Pulley System (MA = 2)
          const pX = 420;
          const pY = 220; // Lower floating wheel
          // Rope anchored at top left
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(360, topRigY);
          ctx.lineTo(360, pY);
          ctx.arc(pX, pY, 60, Math.PI, 0, true);
          ctx.lineTo(480, topRigY);
          ctx.stroke();

          // Floating Pulley Wheel
          ctx.fillStyle = '#94a3b8';
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(pX, pY, 36, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Load suspended from floating pulley axle
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.roundRect(pX - 26, pY + 45, 52, 48, 6);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${loadWeightN} N`, pX, pY + 74);

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(`Effort: ${requiredEffortN} N (MA = 2!)`, pX + 110, 140);
        }
      }

      // ==========================================
      // MACHINE 3: INCLINED PLANE
      // ==========================================
      if (machine === 'inclined_plane') {
        const rampBaseX = 180;
        const rampBaseY = 390;
        const rampWidthPix = 360;
        const rampHeightPix = rampHeightM * 90;

        // Wooden Wedge Triangle
        ctx.fillStyle = 'rgba(217, 119, 6, 0.4)';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rampBaseX, rampBaseY);
        ctx.lineTo(rampBaseX + rampWidthPix, rampBaseY);
        ctx.lineTo(rampBaseX + rampWidthPix, rampBaseY - rampHeightPix);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Heavy Barrel / Box being pulled up slope
        const t = 0.5; // mid slope
        const boxX = rampBaseX + t * rampWidthPix;
        const boxY = rampBaseY - t * rampHeightPix;
        const angle = Math.atan2(rampHeightPix, rampWidthPix);

        ctx.save();
        ctx.translate(boxX, boxY);
        ctx.rotate(-angle);
        ctx.fillStyle = '#ef4444';
        ctx.roundRect(-24, -38, 48, 38, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${loadWeightN} N`, 0, -18);

        // Pull Force Vector Up Along Incline
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(24, -19);
        ctx.lineTo(85, -19);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`E = ${requiredEffortN} N`, 70, -28);
        ctx.restore();

        // Dimensions
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`Length (l) = ${rampLengthM} m`, rampBaseX + rampWidthPix / 2, rampBaseY - rampHeightPix / 2 - 25);
        ctx.fillText(`Height (h) = ${rampHeightM} m`, rampBaseX + rampWidthPix + 45, rampBaseY - rampHeightPix / 2);
      }

      // ── RIGHT READOUT HUD: MECHANICAL ADVANTAGE ──
      const hudX = width - 260;
      const hudY = 30;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, 230, 200, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? '⚙️ यन्त्रको फाइदा (MA):' : '⚙️ Mechanical Advantage:', hudX + 16, hudY + 28);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`MA = ${ma}`, hudX + 16, hudY + 65);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(
        lang === 'ne' ? `आवश्यक प्रयास: ${requiredEffortN} N` : `Effort Required: ${requiredEffortN} N`,
        hudX + 16,
        hudY + 105
      );

      ctx.fillStyle = '#ef4444';
      ctx.font = '12px sans-serif';
      ctx.fillText(
        lang === 'ne' ? `उठाउने भार: ${loadWeightN} N` : `Load to Lift: ${loadWeightN} N`,
        hudX + 16,
        hudY + 135
      );

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(
        ma > 1
          ? lang === 'ne'
            ? '✓ बल गुणा गर्छ (कम बलले धेरै भार)'
            : '✓ Force Multiplier (Less Effort)'
          : ma === 1
          ? lang === 'ne'
            ? '✓ दिशा परिवर्तन (Direction Only)'
            : '✓ Changes Force Direction'
          : lang === 'ne'
          ? '✓ गति गुणा गर्छ (Distance Multiplier)'
          : '✓ Distance Multiplier',
        hudX + 16,
        hudY + 172
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [machine, loadWeightN, effortArmM, loadArmM, rampLengthM, rampHeightM, isMovablePulley, ma, requiredEffortN, lang]);

  return (
    <SimulationLayout
      title="Simple Machine Workshop (Levers, Pulleys, Incline)"
      titleNepali="सरल यन्त्र कार्यशाला (उत्तोलक, घिर्नी, छड्के सतह)"
      chapterNumber={6}
      chapterTitle="Unit 6: Force and Motion"
      chapterTitleNepali="एकाइ 6: बल र गति"
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
      currentPromptEn="Experiment with 3 classes of levers, fixed/movable pulleys, and inclined planes to calculate Mechanical Advantage."
      currentPromptNe="उत्तोलकका 3 श्रेणी, घिर्नी र छड्के सतह प्रयोग गरी यान्त्रिक फाइदा (MA) गणना गर्नुहोस्।"
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

          {/* Floating Top Machine Badge */}
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
            <Wrench style={{ width: '14px', height: '14px' }} />
            <span>
              {machine === 'class1_lever' && (lang === 'ne' ? 'प्रथम श्रेणी उत्तोलक (आधार विन्दु बीचमा)' : 'Class 1 Lever (Fulcrum in Middle)')}
              {machine === 'class2_lever' && (lang === 'ne' ? 'दोस्रो श्रेणी उत्तोलक (भार बीचमा)' : 'Class 2 Lever (Load in Middle)')}
              {machine === 'class3_lever' && (lang === 'ne' ? 'तेस्रो श्रेणी उत्तोलक (प्रयास बीचमा)' : 'Class 3 Lever (Effort in Middle)')}
              {machine === 'pulley' && (lang === 'ne' ? (isMovablePulley ? 'चल घिर्नी (Movable Pulley)' : 'अचल घिर्नी (Fixed Pulley)') : (isMovablePulley ? 'Movable Pulley' : 'Fixed Pulley'))}
              {machine === 'inclined_plane' && (lang === 'ne' ? 'छड्के सतह (Inclined Plane)' : 'Inclined Plane Ramp')}
            </span>
          </div>

          {/* Floating Bottom Mechanical Advantage Banner */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {lang === 'ne' ? 'यान्त्रिक फाइदा (MA):' : 'Mechanical Advantage (MA):'}
              </span>
              <span style={{ fontFamily: 'monospace', color: '#4ade80', fontWeight: 700 }}>
                {ma.toFixed(2)}
              </span>
              <span style={{ color: '#64748b' }}>|</span>
              <span style={{ color: '#fbbf24' }}>
                {lang === 'ne' ? `आवश्यक प्रयास बल (Effort): ${requiredEffortN.toFixed(1)} N` : `Required Effort (E): ${requiredEffortN.toFixed(1)} N`}
              </span>
            </div>
            <span style={{ color: '#64748b', fontSize: '11px' }}>
              {ma > 1 ? (lang === 'ne' ? '⚡ बल बचत हुन्छ (MA > 1)' : '⚡ Force Multiplier (MA > 1)') : (lang === 'ne' ? '⚡ गति/दूरी बचत हुन्छ' : '⚡ Speed Multiplier')}
            </span>
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
              <span>{lang === 'ne' ? 'सरल यन्त्र कार्यशाला' : 'Simple Machine Workshop'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'उत्तोलक, घिर्नी र छड्के सतहको भुजा र कोण परिवर्तन गरी यान्त्रिक फाइदा जाँच्नुहोस्।'
                : 'Configure levers, pulleys, and inclined planes to calculate Mechanical Advantage.'}
            </p>
          </div>

          {/* Machine Selection Grid */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '1. यन्त्र चयन (Select Machine)' : '1. Machine Type'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {[
                { id: 'class1_lever', nameEn: 'Class 1 Lever', nameNe: 'प्रथम उत्तोलक' },
                { id: 'class2_lever', nameEn: 'Class 2 Lever', nameNe: 'दोस्रो उत्तोलक' },
                { id: 'class3_lever', nameEn: 'Class 3 Lever', nameNe: 'तेस्रो उत्तोलक' },
                { id: 'pulley', nameEn: 'Pulley System', nameNe: 'घिर्नी प्रणाली' },
                { id: 'inclined_plane', nameEn: 'Inclined Plane', nameNe: 'छड्के सतह' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMachine(m.id as MachineType)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: machine === m.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                    background: machine === m.id ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: machine === m.id ? '#fbbf24' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    gridColumn: m.id === 'inclined_plane' ? 'span 2' : 'auto',
                  }}
                >
                  {lang === 'ne' ? m.nameNe : m.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Load Weight Slider */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#f87171' }}>
                {lang === 'ne' ? 'उठाउने भार (Load Weight L):' : 'Load Weight (L):'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                {loadWeightN} N
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={200}
              step={10}
              value={loadWeightN}
              onChange={(e) => setLoadWeightN(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f43f5e', cursor: 'pointer' }}
            />
          </div>

          {/* Machine-Specific Parameter Sliders */}
          {machine.includes('lever') && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399' }}>
                    {lang === 'ne' ? 'प्रयास भुजा (Effort Arm):' : 'Effort Arm (E.A.):'}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0f172a' }}>{effortArmM} m</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={effortArmM}
                  onChange={(e) => setEffortArmM(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa' }}>
                    {lang === 'ne' ? 'भार भुजा (Load Arm):' : 'Load Arm (L.A.):'}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0f172a' }}>{loadArmM} m</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={loadArmM}
                  onChange={(e) => setLoadArmM(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {machine === 'pulley' && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                {lang === 'ne' ? 'घर्षण प्रणाली प्रकार:' : 'Pulley Configuration:'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => {
                    setIsMovablePulley(false);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: !isMovablePulley ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: !isMovablePulley ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: !isMovablePulley ? '#38bdf8' : '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'ne' ? 'अचल घिर्नी (Fixed, MA=1)' : 'Fixed (MA=1)'}
                </button>
                <button
                  onClick={() => {
                    setIsMovablePulley(true);
                    ScienceAudio.playClick();
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: isMovablePulley ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: isMovablePulley ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: isMovablePulley ? '#38bdf8' : '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'ne' ? 'चल घिर्नी (Movable, MA=2)' : 'Movable (MA=2)'}
                </button>
              </div>
            </div>
          )}

          {machine === 'inclined_plane' && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
                    {lang === 'ne' ? 'छड्के सतहको लम्बाइ (Length l):' : 'Ramp Length (l):'}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0f172a' }}>{rampLengthM} m</span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={6.0}
                  step={0.5}
                  value={rampLengthM}
                  onChange={(e) => setRampLengthM(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>
                    {lang === 'ne' ? 'छड्के सतहको उचाइ (Height h):' : 'Ramp Height (h):'}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0f172a' }}>{rampHeightM} m</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  value={rampHeightM}
                  onChange={(e) => setRampHeightM(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* Mechanical Advantage Telemetry */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
              {lang === 'ne' ? '📊 यान्त्रिक फाइदा गणना (MA Formula):' : '📊 Mechanical Advantage (MA):'}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {machine.includes('lever') && (
                <span>
                  MA = Effort Arm / Load Arm = {effortArmM}m / {loadArmM}m = <strong style={{ color: '#4ade80' }}>{ma.toFixed(2)}</strong>
                </span>
              )}
              {machine === 'pulley' && (
                <span>
                  MA = Number of Supporting Ropes = <strong style={{ color: '#4ade80' }}>{ma.toFixed(2)}</strong>
                </span>
              )}
              {machine === 'inclined_plane' && (
                <span>
                  MA = Ramp Length / Ramp Height = {rampLengthM}m / {rampHeightM}m = <strong style={{ color: '#4ade80' }}>{ma.toFixed(2)}</strong>
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
              color: '#64748b',
              lineHeight: '1.4',
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
              {lang === 'ne' ? '📚 पाठ्यक्रम मुख्य बुँदा:' : '📚 Curriculum Takeaway:'}
            </div>
            {lang === 'ne'
              ? 'सरल यन्त्रले काम सजिलो, छिटो र सुविधाजनक बनाउँछ। यान्त्रिक फाइदा (MA) 1 भन्दा बढी भएमा थोरै बलले धेरै भार उठाउन सकिन्छ।'
              : 'Simple machines multiply force or change direction. When MA > 1, less effort force is required to lift a heavier load.'}
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
              <span>{lang === 'ne' ? '✓ सरल यन्त्र कार्यशाला पूरा गर्नुहोस्' : '✓ Complete Simple Machine Lab & Quiz'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default SimpleMachineWorkshopSim;
