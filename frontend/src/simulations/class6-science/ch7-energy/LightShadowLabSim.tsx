/**
 * LightShadowLabSim.tsx
 * Simulation 23: 2D Light & Shadow Laboratory (प्रकाश र छायाँ प्रयोगशाला)
 * Grade 6 Science • Unit 7: Energy in Daily Life (दैनिक जीवनमा शक्ति)
 *
 * 100% Native HTML5 Canvas 2D Interactive Optics Laboratory.
 * Features:
 * 1. Rectilinear Propagation of Light: 3 aligned pinhole cardboards demonstrating light travels in straight lines
 * 2. Medium Classification: Transparent (काँच), Translucent (बटर पेपर), Opaque (काठ)
 * 3. Shadow Geometry: Umbra (गाढा छायाँ - complete darkness) and Penumbra (मधुरो छायाँ - partial shadow)
 * 4. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Sun, Eye, Sliders, Sparkles, CheckCircle2, RotateCcw, Award } from 'lucide-react';

type OpticsMode = 'rectilinear' | 'materials' | 'umbra_penumbra';
type MediumType = 'transparent' | 'translucent' | 'opaque';

export const LightShadowLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Experiment State
  const [opticsMode, setOpticsMode] = useState<OpticsMode>('rectilinear');
  const [middleCardShiftMm, setMiddleCardShiftMm] = useState<number>(0); // 0 = perfectly aligned
  const [medium, setMedium] = useState<MediumType>('opaque');
  const [sourceSize, setSourceSize] = useState<'point' | 'extended'>('extended');

  // Rectilinear visibility: visible only when aligned (shift < 4mm)
  const isFlameVisible = Math.abs(middleCardShiftMm) < 4;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setMiddleCardShiftMm(0);
    setMedium('opaque');
    setSourceSize('extended');
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
      const time = Date.now() / 250;

      // Dark Optics Lab Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Bench Platform
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 390, width, height - 390);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 390);
      ctx.lineTo(width, 390);
      ctx.stroke();

      // ==========================================
      // MODE 1: RECTILINEAR PROPAGATION
      // ==========================================
      if (opticsMode === 'rectilinear') {
        const candleX = 140;
        const candleY = 250;

        // Burning Candle
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(candleX - 10, candleY, 20, 90);
        // Wick
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(candleX, candleY);
        ctx.lineTo(candleX, candleY - 14);
        ctx.stroke();

        // Flickering Flame
        const flameH = 24 + Math.sin(time * 3) * 4;
        const flameGrad = ctx.createRadialGradient(candleX, candleY - 18, 2, candleX, candleY - 18, flameH);
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.3, '#fef08a');
        flameGrad.addColorStop(0.7, '#f97316');
        flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(candleX, candleY - 18, flameH, 0, Math.PI * 2);
        ctx.fill();

        // 3 Cardboard Screens with Center Pinholes
        const cardXPositions = [280, 440, 600];
        const baseHoleY = candleY - 18;

        cardXPositions.forEach((cx, idx) => {
          const shiftY = idx === 1 ? middleCardShiftMm * 4 : 0;
          const holeY = baseHoleY + shiftY;

          // Cardboard Screen
          ctx.fillStyle = '#78350f';
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(cx - 10, baseHoleY - 110 + shiftY, 20, 220, 6);
          ctx.fill();
          ctx.stroke();

          // Pinhole Aperture
          ctx.fillStyle = '#060a14';
          ctx.beginPath();
          ctx.arc(cx, holeY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Cardboard Label
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Card ${String.fromCharCode(65 + idx)}`, cx, 380);
        });

        // Straight Laser Ray of Light
        if (isFlameVisible) {
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(candleX, baseHoleY);
          ctx.lineTo(740, baseHoleY);
          ctx.stroke();

          // Glowing Ray Aura
          ctx.strokeStyle = 'rgba(253, 224, 71, 0.3)';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(candleX, baseHoleY);
          ctx.lineTo(740, baseHoleY);
          ctx.stroke();
        } else {
          // Ray blocked at Cardboard B!
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(candleX, baseHoleY);
          ctx.lineTo(440, baseHoleY);
          ctx.stroke();
        }

        // Observer's Eye at Right
        const eyeX = 740;
        const eyeY = baseHoleY;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(eyeX - 4, eyeY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(eyeX - 4, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Observation Callout
        ctx.fillStyle = isFlameVisible ? '#4ade80' : '#f87171';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          isFlameVisible
            ? lang === 'ne'
              ? '✓ बत्ती देखियो (प्रकाश सरल रेखामा हिँड्छ)'
              : '✓ Light Visible (Light travels in a straight line)'
            : lang === 'ne'
              ? '❌ बत्ती देखिएन (कार्ड B सरेकाले बाटो छेकियो)'
              : '❌ Light Blocked (Card B misaligned)',
          width / 2,
          70
        );
      }

      // ==========================================
      // MODE 2: MEDIUM TYPES (PARADARSHI, APARADARSHI)
      // ==========================================
      if (opticsMode === 'materials') {
        const torchX = 160;
        const torchY = 240;
        const matX = 440;
        const screenX = 700;

        // Flashlight Torch
        ctx.fillStyle = '#334155';
        ctx.fillRect(torchX - 60, torchY - 20, 60, 40);
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(torchX, torchY - 32);
        ctx.lineTo(torchX, torchY + 32);
        ctx.lineTo(torchX - 16, torchY + 20);
        ctx.lineTo(torchX - 16, torchY - 20);
        ctx.closePath();
        ctx.fill();

        // Light Beam from Torch to Material
        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.beginPath();
        ctx.moveTo(torchX, torchY - 28);
        ctx.lineTo(matX - 15, torchY - 60);
        ctx.lineTo(matX - 15, torchY + 60);
        ctx.lineTo(torchX, torchY + 28);
        ctx.closePath();
        ctx.fill();

        // Test Material Plate
        ctx.save();
        ctx.translate(matX, torchY);

        if (medium === 'transparent') {
          // Transparent Glass
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.roundRect(-15, -90, 30, 180, 8);
          ctx.fill();
          ctx.stroke();

          // Light passes completely through to screen!
          ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
          ctx.beginPath();
          ctx.moveTo(15, -60);
          ctx.lineTo(screenX - matX, -90);
          ctx.lineTo(screenX - matX, 90);
          ctx.lineTo(15, 60);
          ctx.closePath();
          ctx.fill();
        } else if (medium === 'translucent') {
          // Translucent Butter Paper
          ctx.fillStyle = 'rgba(254, 240, 138, 0.5)';
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.roundRect(-15, -90, 30, 180, 8);
          ctx.fill();
          ctx.stroke();

          // Diffused partial light
          ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
          ctx.beginPath();
          ctx.moveTo(15, -60);
          ctx.lineTo(screenX - matX, -90);
          ctx.lineTo(screenX - matX, 90);
          ctx.lineTo(15, 60);
          ctx.closePath();
          ctx.fill();
        } else {
          // Opaque Wood Block
          ctx.fillStyle = '#78350f';
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 3;
          ctx.roundRect(-15, -90, 30, 180, 8);
          ctx.fill();
          ctx.stroke();

          // Dark Shadow on Screen!
          ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
          ctx.fillRect(screenX - 10, torchY - 80, 20, 160);
        }
        ctx.restore();

        // White Projection Screen at Right
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(screenX - 6, torchY - 110, 12, 220, 4);
        ctx.fill();
        ctx.stroke();
      }

      // ==========================================
      // MODE 3: UMBRA & PENUMBRA SHADOWS
      // ==========================================
      if (opticsMode === 'umbra_penumbra') {
        const srcX = 140;
        const srcY = 240;
        const objX = 400;
        const objY = 240;
        const objR = 36;
        const screenX = 720;

        // Light Source (Point vs Extended)
        const srcR = sourceSize === 'point' ? 6 : 40;
        const srcGrad = ctx.createRadialGradient(srcX, srcY, 2, srcX, srcY, srcR);
        srcGrad.addColorStop(0, '#ffffff');
        srcGrad.addColorStop(0.5, '#fef08a');
        srcGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = srcGrad;
        ctx.beginPath();
        ctx.arc(srcX, srcY, srcR, 0, Math.PI * 2);
        ctx.fill();

        // Opaque Obstacle Sphere (काठको बल)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(objX, objY, objR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Shadow Rays & Screen
        // Extended Source forms Umbra (inner dark) and Penumbra (outer soft)
        const umbraH = sourceSize === 'point' ? 100 : 70;
        const penumbraH = sourceSize === 'point' ? 100 : 160;

        // Penumbra Outer Cone
        if (sourceSize === 'extended') {
          ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
          ctx.beginPath();
          ctx.moveTo(objX, objY - objR);
          ctx.lineTo(screenX, objY - penumbraH);
          ctx.lineTo(screenX, objY + penumbraH);
          ctx.lineTo(objX, objY + objR);
          ctx.closePath();
          ctx.fill();
        }

        // Umbra Inner Cone (Complete darkness)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.moveTo(objX, objY - objR);
        ctx.lineTo(screenX, objY - umbraH);
        ctx.lineTo(screenX, objY + umbraH);
        ctx.lineTo(objX, objY + objR);
        ctx.closePath();
        ctx.fill();

        // Screen
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(screenX, objY - 140, 10, 280);

        // Labels on Screen
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(lang === 'ne' ? 'गाढा छायाँ (Umbra)' : 'Umbra (Dark Shadow)', screenX + 20, objY);
        if (sourceSize === 'extended') {
          ctx.fillText(lang === 'ne' ? 'मधुरो छायाँ (Penumbra)' : 'Penumbra (Soft Shadow)', screenX + 20, objY - 90);
          ctx.fillText(lang === 'ne' ? 'मधुरो छायाँ (Penumbra)' : 'Penumbra (Soft Shadow)', screenX + 20, objY + 90);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [opticsMode, middleCardShiftMm, medium, sourceSize, isFlameVisible, lang]);

  return (
    <SimulationLayout
      title="Light, Shadows, Umbra and Penumbra Laboratory"
      titleNepali="प्रकाश, छायाँ, गाढा छायाँ र मधुरो छायाँ प्रयोगशाला"
      chapterNumber={7}
      chapterTitle="Unit 7: Energy in Daily Life"
      chapterTitleNepali="एकाइ ७: दैनिक जीवनमा शक्ति"
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
      currentPromptEn="Verify rectilinear propagation of light or test transparent, translucent, and opaque shadow casting."
      currentPromptNe="प्रकाश सरल रेखामा हिँड्छ प्रमाणित गर्नुहोस् वा पारदर्शी र अपारदर्शी वस्तुको छायाँ हेर्नुहोस्।"
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
            <Sun style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
            <span>
              {opticsMode === 'rectilinear' && (lang === 'ne' ? '१. प्रकाशको सरल रेखीय प्रसारण' : '1. Rectilinear Propagation')}
              {opticsMode === 'materials' && (lang === 'ne' ? `२. अप्टिकल माध्यम: ${medium.toUpperCase()}` : `2. Optical Media: ${medium.toUpperCase()}`)}
              {opticsMode === 'umbra_penumbra' && (lang === 'ne' ? `३. गाढा र मधुरो छायाँ (${sourceSize === 'point' ? 'बिन्दु स्रोत' : 'विस्तृत स्रोत'})` : `3. Shadows (${sourceSize === 'point' ? 'Point Source' : 'Extended Source'})`)}
            </span>
          </div>

          {/* Floating Bottom Alignment Banner */}
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
                {opticsMode === 'rectilinear' ? (lang === 'ne' ? 'दृष्टि रेखा (Sight Line):' : 'Line of Sight:') : (lang === 'ne' ? 'छायाँको प्रकार:' : 'Shadow Formation:')}
              </span>
              <span style={{ color: isFlameVisible ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                {opticsMode === 'rectilinear'
                  ? isFlameVisible
                    ? (lang === 'ne' ? '✓ प्वालहरू सिधा रेखामा छन् - मैनबत्ती देखियो!' : '✓ Cardboards aligned - Candle flame visible!')
                    : (lang === 'ne' ? '✗ कार्डबोर्ड B सरेको छ - प्रकाश छेकियो!' : '✗ Misaligned - Light travels straight, blocked!')
                  : opticsMode === 'materials'
                    ? medium === 'transparent'
                      ? (lang === 'ne' ? 'पारदर्शी: प्रकाश छिर्छ, छायाँ बन्दैन' : 'Transparent: Light passes, no shadow')
                      : medium === 'translucent'
                        ? (lang === 'ne' ? 'अर्धपारदर्शी: केही प्रकाश छिर्छ, मधुरो छायाँ' : 'Translucent: Partial light, faint shadow')
                        : (lang === 'ne' ? 'अपारदर्शी: प्रकाश रोकिन्छ, गाढा छायाँ बन्छ' : 'Opaque: Light blocked, dark shadow')
                    : sourceSize === 'point'
                      ? (lang === 'ne' ? 'बिन्दु स्रोत: केवल गाढा छायाँ (Umbra) बन्छ' : 'Point Source: Umbra only, sharp edges')
                      : (lang === 'ne' ? 'विस्तृत स्रोत: गाढा (Umbra) र मधुरो (Penumbra) दुवै बन्छ' : 'Extended Source: Umbra + Penumbra')}
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
              <span>{lang === 'ne' ? 'प्रकाश तथा छायाँ प्रयोगशाला' : 'Optics & Shadow Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'प्रकाश सरल रेखामा हिँड्छ प्रमाणित गर्नुहोस् र पारदर्शी/अपारदर्शी छायाँ परीक्षण गर्नुहोस्।'
                : 'Explore rectilinear propagation, optical mediums, and shadow geometry.'}
            </p>
          </div>

          {/* Mode Selector Buttons */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              {lang === 'ne' ? '१. अप्टिक्स प्रयोग छान्नुहोस्' : '1. Select Optics Experiment'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'rectilinear', nameEn: '1. Rectilinear Propagation', nameNe: '१. सरल रेखामा प्रकाश' },
                { id: 'materials', nameEn: '2. Optical Media Types', nameNe: '२. पारदर्शी र अपारदर्शी' },
                { id: 'umbra_penumbra', nameEn: '3. Umbra & Penumbra', nameNe: '३. गाढा र मधुरो छायाँ' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setOpticsMode(m.id as OpticsMode);
                    handleReset();
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: opticsMode === m.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                    background: opticsMode === m.id ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: opticsMode === m.id ? '#fbbf24' : '#cbd5e1',
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

          {/* Mode-Specific Modulator */}
          {opticsMode === 'rectilinear' && (
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
                  {lang === 'ne' ? 'बीचको कार्डबोर्ड (B) सार्नुहोस्:' : 'Shift Middle Cardboard (B):'}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                  {middleCardShiftMm} mm
                </span>
              </div>
              <input
                type="range"
                min={-20}
                max={20}
                step={1}
                value={middleCardShiftMm}
                onChange={(e) => setMiddleCardShiftMm(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                <span>-20 mm</span>
                <span>0 mm (Aligned)</span>
                <span>+20 mm</span>
              </div>
            </div>
          )}

          {opticsMode === 'materials' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                {lang === 'ne' ? '२. माध्यम छान्नुहोस् (Medium):' : '2. Optical Medium:'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'transparent', nameEn: 'Glass (Transparent)', nameNe: 'काँच (पारदर्शी - प्रकाश छिर्छ)' },
                  { id: 'translucent', nameEn: 'Butter Paper (Translucent)', nameNe: 'बटर पेपर (अर्धपारदर्शी)' },
                  { id: 'opaque', nameEn: 'Wood Block (Opaque)', nameNe: 'काठ (अपारदर्शी - पूर्ण छायाँ)' },
                ].map((med) => (
                  <button
                    key={med.id}
                    onClick={() => {
                      setMedium(med.id as MediumType);
                      ScienceAudio.playClick();
                    }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: medium === med.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                      background: medium === med.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                      color: medium === med.id ? '#38bdf8' : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {lang === 'ne' ? med.nameNe : med.nameEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {opticsMode === 'umbra_penumbra' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                {lang === 'ne' ? '२. प्रकाशको स्रोत छान्नुहोस्:' : '2. Light Source Geometry:'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {[
                  { id: 'point', nameEn: 'Point Source', nameNe: 'बिन्दु स्रोत' },
                  { id: 'extended', nameEn: 'Extended Source', nameNe: 'विस्तृत स्रोत' },
                ].map((src) => (
                  <button
                    key={src.id}
                    onClick={() => {
                      setSourceSize(src.id as any);
                      ScienceAudio.playClick();
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: sourceSize === src.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                      background: sourceSize === src.id ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                      color: sourceSize === src.id ? '#fbbf24' : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {lang === 'ne' ? src.nameNe : src.nameEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scientific Insight Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
              {lang === 'ne' ? '🔍 अप्टिक्स नियम (Optics Law):' : '🔍 Optical Principle:'}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {opticsMode === 'rectilinear' && (
                <span>
                  {lang === 'ne'
                    ? 'समान र पारदर्शी माध्यममा प्रकाश सधैं सरल रेखामा (Straight Line) हिँड्छ। कुनै अवरोध आएमा छायाँ बन्छ।'
                    : 'Light travels along straight-line paths (rectilinear propagation) through homogeneous media.'}
                </span>
              )}
              {opticsMode === 'materials' && (
                <span>
                  {lang === 'ne'
                    ? 'अपारदर्शी वस्तुले प्रकाशलाई पूर्ण रूपमा रोक्ने हुँदा त्यसको पछाडि छायाँ निर्माण हुन्छ।'
                    : 'Opaque materials absorb/reflect light rays, forming dark shadow silhouettes behind the obstacle.'}
                </span>
              )}
              {opticsMode === 'umbra_penumbra' && (
                <span>
                  {lang === 'ne'
                    ? 'पूर्ण अँध्यारो भागलाई गाढा छायाँ (Umbra) र आंशिक प्रकाश छिरेको वरिपरिको भागलाई मधुरो छायाँ (Penumbra) भनिन्छ।'
                    : 'Umbra is total geometric shadow; penumbra is the surrounding gradient where light is partially occluded.'}
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
              ? 'प्रकाश सरल रेखामा हिँड्ने भएकाले अपारदर्शी वस्तुमा पर्दा छायाँ बन्छ। सूर्यग्रहण र चन्द्रग्रहण पनि यसै नियममा आधारित छन्।'
              : 'Rectilinear propagation explains shadows and eclipses (solar and lunar). Umbra is pitch dark; penumbra is faint.'}
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
              <span>{lang === 'ne' ? '✓ प्रकाश र छायाँ प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Light & Shadow Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default LightShadowLabSim;
