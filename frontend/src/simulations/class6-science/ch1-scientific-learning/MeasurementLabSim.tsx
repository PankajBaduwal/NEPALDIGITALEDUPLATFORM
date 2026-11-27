/**
 * MeasurementLabSim.tsx
 * Simulation 2: 2D Virtual Measurement Laboratory
 * Grade 6 Science • Unit 1: Scientific Learning
 *
 * Full 2D Interactive Measurement Apparatus:
 * 1. Calibrated Metric Ruler: Precision length measurement (cm & mm) with movable specimen block
 * 2. Precision Beam Balance: Equal-arm balance comparing unknown mass to brass slotted weights
 *    with Local Nepalese Units (Dharni, Pau, Tola)
 * 3. Graduated Measuring Cylinder: Liquid meniscus & Water displacement for irregular solid (V2 - V1)
 *    with Local volumetric conversions: Mana & Pathi vs Litres
 * 4. Kid-friendly light educational theme (bg-slate-50, crisp white cards, natural wood workbench)
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Scale, Ruler, Droplets, RotateCcw, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, Award } from 'lucide-react';

type InstrumentMode = 'length' | 'mass' | 'volume';

export const MeasurementLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [mode, setMode] = useState<InstrumentMode>('length');

  // Length experiment state
  const [blockLengthMm, setBlockLengthMm] = useState<number>(65); // 6.5 cm

  // Mass experiment state
  const [sampleMassG, setSampleMassG] = useState<number>(400); // 400g = 2 Pau
  const [rightWeightG, setRightWeightG] = useState<number>(400);

  // Volume experiment state: Irregular stone immersion
  const [stoneSubmerged, setStoneSubmerged] = useState<boolean>(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const v1Ml = 60;
  const stoneVolumeMl = 25;
  const currentVolumeMl = stoneSubmerged ? v1Ml + stoneVolumeMl : v1Ml;

  const handleModeChange = (newMode: InstrumentMode) => {
    ScienceAudio.playPop();
    setMode(newMode);
    setStars((prev) => Math.min(3, prev + 1));
  };

  const handleReset = () => {
    setBlockLengthMm(65);
    setSampleMassG(400);
    setRightWeightG(400);
    setStoneSubmerged(false);
    setQuizAnswer(null);
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    ScienceAudio.playWhoosh();
  };

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

      // 1. Clean Educational Science Classroom Background
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#f8fafc');
      bg.addColorStop(0.6, '#f1f5f9');
      bg.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Natural Birch Wood Workbench Table
      const tableY = h - 65;
      // Top surface
      const woodGrad = ctx.createLinearGradient(0, tableY, 0, tableY + 25);
      woodGrad.addColorStop(0, '#fef3c7');
      woodGrad.addColorStop(0.5, '#fde68a');
      woodGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = woodGrad;
      ctx.fillRect(20, tableY, w - 40, 22);

      // Table front edge
      ctx.fillStyle = '#d97706';
      ctx.fillRect(20, tableY + 22, w - 40, 40);

      // Table soft shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(20, tableY - 6, w - 40, 6);

      const cx = w * 0.48;

      if (mode === 'length') {
        // --- 1. METRIC RULER LENGTH MEASUREMENT ---
        const rulerX = 70;
        const rulerY = tableY - 95;
        const rulerW = 520;
        const rulerH = 68;
        const pxPerMm = 4.2; // 1 cm = 42px

        // Wooden Calibrated Ruler with brass edge
        const rulerGrad = ctx.createLinearGradient(rulerX, rulerY, rulerX, rulerY + rulerH);
        rulerGrad.addColorStop(0, '#fef08a');
        rulerGrad.addColorStop(0.5, '#fef9c3');
        rulerGrad.addColorStop(1, '#facc15');
        ctx.fillStyle = rulerGrad;
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(rulerX, rulerY, rulerW, rulerH, 6);
        ctx.fill();
        ctx.stroke();

        // Brass end cap
        ctx.fillStyle = '#b45309';
        ctx.fillRect(rulerX, rulerY, 12, rulerH);

        // Millimeter & Centimeter ticks
        ctx.fillStyle = '#713f12';
        ctx.strokeStyle = '#713f12';
        for (let mm = 0; mm <= 110; mm++) {
          const mx = rulerX + 25 + mm * pxPerMm;
          if (mx > rulerX + rulerW - 15) break;

          if (mm % 10 === 0) {
            // 1 cm mark (Tall)
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(mx, rulerY);
            ctx.lineTo(mx, rulerY + 30);
            ctx.stroke();

            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(`${mm / 10}`, mx - 4, rulerY + 48);
          } else if (mm % 5 === 0) {
            // 0.5 cm mark (Medium)
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(mx, rulerY);
            ctx.lineTo(mx, rulerY + 20);
            ctx.stroke();
          } else {
            // 1 mm mark (Short)
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mx, rulerY);
            ctx.lineTo(mx, rulerY + 12);
            ctx.stroke();
          }
        }

        // Unit label on ruler
        ctx.fillStyle = '#92400e';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('METRIC (cm)', rulerX + rulerW - 95, rulerY + 50);

        // Specimen Object being measured: Wooden Pencil / Metal Bar
        const blockX = rulerX + 25;
        const blockW = blockLengthMm * pxPerMm;
        const blockY = rulerY - 45;
        const blockH = 34;

        // Metallic Blue Anodized Specimen Block
        const specGrad = ctx.createLinearGradient(blockX, blockY, blockX, blockY + blockH);
        specGrad.addColorStop(0, '#38bdf8');
        specGrad.addColorStop(0.5, '#0284c7');
        specGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = specGrad;
        ctx.strokeStyle = '#075985';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, 6);
        ctx.fill();
        ctx.stroke();

        // Measurement Dimension Arrow
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(blockX, blockY - 14);
        ctx.lineTo(blockX + blockW, blockY - 14);
        ctx.stroke();

        // End ticks
        ctx.beginPath();
        ctx.moveTo(blockX, blockY - 20);
        ctx.lineTo(blockX, blockY - 8);
        ctx.moveTo(blockX + blockW, blockY - 20);
        ctx.lineTo(blockX + blockW, blockY - 8);
        ctx.stroke();

        // Live Dimension Text Badge
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 15px sans-serif';
        const lengthText = `${(blockLengthMm / 10).toFixed(1)} cm (${blockLengthMm} mm)`;
        ctx.fillText(lengthText, blockX + blockW / 2 - 40, blockY - 24);
      } else if (mode === 'mass') {
        // --- 2. EQUAL-ARM BEAM BALANCE ---
        const standX = cx;
        const standBottomY = tableY;
        const standTopY = standBottomY - 190;

        // Brass Triangular Base & Upright Pillar
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(standX - 50, standBottomY);
        ctx.lineTo(standX + 50, standBottomY);
        ctx.lineTo(standX + 16, standBottomY - 25);
        ctx.lineTo(standX + 16, standTopY);
        ctx.lineTo(standX - 16, standTopY);
        ctx.lineTo(standX - 16, standBottomY - 25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Fulcrum Pivot Bearing
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(standX, standTopY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Dynamic tilt angle based on mass difference
        const massDiff = sampleMassG - rightWeightG;
        const targetAngle = Math.max(-0.25, Math.min(0.25, -massDiff * 0.002));
        const currentAngle = targetAngle + Math.sin(t * 3) * (Math.abs(targetAngle) < 0.01 ? 0.005 : 0.002);

        ctx.save();
        ctx.translate(standX, standTopY);
        ctx.rotate(currentAngle);

        // Beam Arm
        const armHalfLength = 150;
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.fillRect(-armHalfLength, -6, armHalfLength * 2, 12);
        ctx.strokeRect(-armHalfLength, -6, armHalfLength * 2, 12);

        // Center Pointer Indicator
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 48);
        ctx.stroke();

        // Left Pan Suspension
        ctx.restore();

        const leftPanX = standX - armHalfLength * Math.cos(currentAngle);
        const leftPanY = standTopY - armHalfLength * Math.sin(currentAngle);

        const rightPanX = standX + armHalfLength * Math.cos(currentAngle);
        const rightPanY = standTopY + armHalfLength * Math.sin(currentAngle);

        // Draw Left Pan (Sample Object)
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(leftPanX, leftPanY);
        ctx.lineTo(leftPanX - 40, leftPanY + 90);
        ctx.moveTo(leftPanX, leftPanY);
        ctx.lineTo(leftPanX + 40, leftPanY + 90);
        ctx.stroke();

        // Pan Dish
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(leftPanX, leftPanY + 90, 48, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Sample on left pan (Stone/Apple)
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(leftPanX - 25, leftPanY + 55, 50, 32, 8);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`Sample: ${sampleMassG}g`, leftPanX - 32, leftPanY + 76);

        // Draw Right Pan (Brass Standard Weights)
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(rightPanX, rightPanY);
        ctx.lineTo(rightPanX - 40, rightPanY + 90);
        ctx.moveTo(rightPanX, rightPanY);
        ctx.lineTo(rightPanX + 40, rightPanY + 90);
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(rightPanX, rightPanY + 90, 48, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Brass Slotted Weights on right pan
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(rightPanX - 22, rightPanY + 62, 44, 25, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`Weights: ${rightWeightG}g`, rightPanX - 32, rightPanY + 78);

        // Balance State Text Badge
        ctx.fillStyle = Math.abs(sampleMassG - rightWeightG) < 5 ? '#059669' : '#d97706';
        ctx.font = 'bold 14px sans-serif';
        const balanceStatus =
          Math.abs(sampleMassG - rightWeightG) < 5
            ? (lang === 'ne' ? '✓ सन्तुलित (Balanced: Masses Equal)' : '✓ BALANCED (Equal Mass)')
            : (lang === 'ne' ? '✕ असन्तुलित (Unbalanced)' : '✕ UNBALANCED (Adjust weights)');
        ctx.fillText(balanceStatus, cx - 80, standTopY - 45);
      } else {
        // --- 3. GRADUATED CYLINDER LIQUID VOLUME & IMMERSION ---
        const cylX = cx - 50;
        const cylY = tableY - 260;
        const cylW = 100;
        const cylH = 260;

        // Cylinder Glass Body
        ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cylX, cylY, cylW, cylH, 10);
        ctx.fill();
        ctx.stroke();

        // Heavy Stable Glass Base
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(cylX - 20, tableY - 14, cylW + 40, 14);

        // Water level calculation
        const pxPerMl = 2.4;
        const waterHeightPx = currentVolumeMl * pxPerMl;
        const waterTopY = cylY + cylH - waterHeightPx;

        // Blue Liquid
        const waterGrad = ctx.createLinearGradient(cylX, waterTopY, cylX, cylY + cylH);
        waterGrad.addColorStop(0, '#38bdf8');
        waterGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(cylX + 3, waterTopY, cylW - 6, waterHeightPx - 3);

        // Meniscus Curved Surface
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(cylX + cylW / 2, waterTopY, cylW / 2 - 4, 6, 0, 0, Math.PI);
        ctx.stroke();

        // Graduated Calibrated Marks (every 10 ml)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#1e293b';
        for (let ml = 10; ml <= 100; ml += 10) {
          const my = cylY + cylH - ml * pxPerMl;
          ctx.lineWidth = ml % 20 === 0 ? 2 : 1;
          const markLen = ml % 20 === 0 ? 20 : 12;

          ctx.beginPath();
          ctx.moveTo(cylX + cylW - markLen, my);
          ctx.lineTo(cylX + cylW - 4, my);
          ctx.stroke();

          if (ml % 20 === 0) {
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(`${ml}`, cylX + cylW - 45, my + 4);
          }
        }

        // Submerged Irregular Stone
        if (stoneSubmerged) {
          ctx.fillStyle = '#64748b';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Irregular pebble outline
          ctx.ellipse(cylX + cylW / 2, cylY + cylH - 30, 22, 16, Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Suspension string
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cylX + cylW / 2, cylY + cylH - 30);
          ctx.lineTo(cylX + cylW / 2, cylY - 20);
          ctx.stroke();

          // Small rising bubbles
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          for (let b = 0; b < 4; b++) {
            const by = cylY + cylH - 50 - ((t * 40 + b * 25) % (waterHeightPx - 50));
            ctx.beginPath();
            ctx.arc(cylX + cylW / 2 + (b % 2 === 0 ? 8 : -8), by, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Volumetric Reading Annotations
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 15px sans-serif';
        const volText = stoneSubmerged
          ? (lang === 'ne' ? `अन्तिम आयतन (V2) = ${currentVolumeMl} ml` : `Final Volume (V2) = ${currentVolumeMl} ml`)
          : (lang === 'ne' ? `सुरुको आयतन (V1) = ${currentVolumeMl} ml` : `Initial Volume (V1) = ${currentVolumeMl} ml`);
        ctx.fillText(volText, cylX - 160, cylY + 50);

        if (stoneSubmerged) {
          ctx.fillStyle = '#059669';
          ctx.font = 'bold 13px sans-serif';
          const dispText =
            lang === 'ne'
              ? `ढुङ्गाको आयतन = V2 - V1 = ${currentVolumeMl} - ${v1Ml} = ${stoneVolumeMl} cm³`
              : `Stone Volume = V2 - V1 = ${currentVolumeMl} - ${v1Ml} = ${stoneVolumeMl} cm³`;
          ctx.fillText(dispText, cylX - 160, cylY + 85);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, blockLengthMm, sampleMassG, rightWeightG, stoneSubmerged, lang]);

  return (
    <SimulationLayout
      titleEn="2D Virtual Measurement Lab"
      titleNe="नाप 2डी प्रयोगशाला"
      subject="Science"
      grade={6}
      chapter={1}
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
            width={720}
            height={480}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
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
            {mode === 'length' && <Ruler style={{ width: '14px', height: '14px' }} />}
            {mode === 'mass' && <Scale style={{ width: '14px', height: '14px' }} />}
            {mode === 'volume' && <Droplets style={{ width: '14px', height: '14px' }} />}
            <span>
              {mode === 'length' && (lang === 'ne' ? `1. लम्बाइ नाप: ${(blockLengthMm / 10).toFixed(1)} cm (${blockLengthMm} mm)` : `1. Length: ${(blockLengthMm / 10).toFixed(1)} cm`)}
              {mode === 'mass' && (lang === 'ne' ? `2. पिण्ड नाप: वस्तु ${sampleMassG}g vs ढक ${rightWeightG}g` : `2. Mass: Sample ${sampleMassG}g vs Weight ${rightWeightG}g`)}
              {mode === 'volume' && (lang === 'ne' ? `3. आयतन नाप: ${currentVolumeMl} ml` : `3. Volume: ${currentVolumeMl} ml (Stone: ${stoneVolumeMl} cm³)`)}
            </span>
          </div>

          {/* Floating Bottom Reading Banner */}
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
                {lang === 'ne' ? 'नापको मान (Reading):' : 'Active Reading:'}
              </span>
              <span style={{ color: '#4ade80', fontWeight: 700, fontFamily: 'monospace' }}>
                {mode === 'length' && `${(blockLengthMm / 10).toFixed(1)} cm = ${blockLengthMm} mm`}
                {mode === 'mass' && (sampleMassG === rightWeightG ? (lang === 'ne' ? '✓ सन्तुलित भयो! (Balanced)' : '✓ Balanced Perfectly!') : (lang === 'ne' ? 'अझै सन्तुलन मिलाउनुहोस्' : 'Adjust weights to balance'))}
                {mode === 'volume' && (stoneSubmerged ? `V2 - V1 = ${currentVolumeMl} - 50 = ${stoneVolumeMl} cm³` : `V1 = 50 ml`)}
              </span>
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
              <span>{lang === 'ne' ? 'नाप अनुसन्धान केन्द्र' : 'Measurement Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'लम्बाइ, पिण्ड र अनियमित वस्तुको आयतन नाप्ने व्यावहारिक विधि अभ्यास गर्नुहोस्।'
                : 'Master precision measurement of length, mass balance, and fluid displacement volume.'}
            </p>
          </div>

          {/* Mode Selector Buttons */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '1. नाप उपकरण छान्नुहोस्' : '1. Select Apparatus'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'length', nameEn: '1. Length (Ruler)', nameNe: '1. लम्बाइ नाप (स्केल)', icon: <Ruler style={{ width: '14px', height: '14px' }} /> },
                { id: 'mass', nameEn: '2. Mass (Beam Balance)', nameNe: '2. पिण्ड नाप (तराजु)', icon: <Scale style={{ width: '14px', height: '14px' }} /> },
                { id: 'volume', nameEn: '3. Volume (Measuring Cylinder)', nameNe: '3. आयतन नाप (सिलिन्डर)', icon: <Droplets style={{ width: '14px', height: '14px' }} /> },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id as any)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: mode === m.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: mode === m.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: mode === m.id ? '#38bdf8' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {m.icon}
                  <span>{lang === 'ne' ? m.nameNe : m.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode-Specific Workbench Controls */}
          {mode === 'length' && (
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
                  {lang === 'ne' ? 'वस्तुको लम्बाइ (Length):' : 'Adjust Specimen Length:'}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                  {(blockLengthMm / 10).toFixed(1)} cm
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="105"
                value={blockLengthMm}
                onChange={(e) => setBlockLengthMm(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                <span>1.5 cm</span>
                <span>{(blockLengthMm / 10).toFixed(1)} cm</span>
                <span>10.5 cm</span>
              </div>
            </div>
          )}

          {mode === 'mass' && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>
                {lang === 'ne' ? 'दायाँ पल्लामा ढक (Weights) राख्नुहोस्:' : 'Standard Weights (Right Pan):'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '8px' }}>
                {[100, 200, 400, 500, 600, 800].map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      ScienceAudio.playPop();
                      setRightWeightG(w);
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: rightWeightG === w ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                      background: rightWeightG === w ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                      color: rightWeightG === w ? '#fbbf24' : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {w}g
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                <span>{lang === 'ne' ? 'वस्तु:' : 'Sample:'} <strong style={{ color: '#0f172a' }}>{sampleMassG}g</strong></span>
                <span>{lang === 'ne' ? 'ढक:' : 'Weight:'} <strong style={{ color: '#fbbf24' }}>{rightWeightG}g</strong></span>
              </div>
            </div>
          )}

          {mode === 'volume' && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', marginBottom: '8px' }}>
                {lang === 'ne' ? 'अनियमित ठोस (ढुङ्गा) को विस्थापन:' : 'Fluid Displacement:'}
              </div>
              <button
                onClick={() => {
                  ScienceAudio.playSplash();
                  setStoneSubmerged((prev) => !prev);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: stoneSubmerged ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Droplets style={{ width: '14px', height: '14px' }} />
                <span>
                  {stoneSubmerged
                    ? (lang === 'ne' ? 'ढुङ्गा बाहिर निकाल्नुहोस्' : 'Remove Stone from Water')
                    : (lang === 'ne' ? 'ढुङ्गा पानीमा डुबाउनुहोस्' : 'Submerge Stone in Water')}
                </span>
              </button>
            </div>
          )}

          {/* Nepalese Traditional Units Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? 'नेपाली परम्परागत एकाइहरू:' : 'Traditional Nepalese Units:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#475569' }}>
              {mode === 'mass' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1 Pau</span>
                    <strong style={{ color: '#fbbf24' }}>200 g</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1 Dharni</span>
                    <strong style={{ color: '#fbbf24' }}>2.5 kg (2500 g)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1 Tola (gold)</span>
                    <strong style={{ color: '#fbbf24' }}>11.66 g</strong>
                  </div>
                </>
              ) : mode === 'volume' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1 Mana</span>
                    <strong style={{ color: '#34d399' }}>0.568 litre (568 ml)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1 Pathi (= 8 Mana)</span>
                    <strong style={{ color: '#34d399' }}>4.54 litres (4.54 L)</strong>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1 Haat</span>
                    <strong style={{ color: '#38bdf8' }}>about 18 inches (45 cm)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1 Bitta</span>
                    <strong style={{ color: '#38bdf8' }}>about 9 inches (22.5 cm)</strong>
                  </div>
                </>
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
              ? 'लम्बाइको SI एकाइ मिटर (m), पिण्डको किलोग्राम (kg) र आयतनको घन मिटर (m³) हो। अनियमित वस्तुको आयतन पानीको विस्थापन विधिबाट नापिन्छ।'
              : 'SI units are meter (m) for length, kilogram (kg) for mass, and m³ for volume. Irregular solids are measured via displacement.'}
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
              <span>{lang === 'ne' ? '✓ नाप प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Measurement Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default MeasurementLabSim;