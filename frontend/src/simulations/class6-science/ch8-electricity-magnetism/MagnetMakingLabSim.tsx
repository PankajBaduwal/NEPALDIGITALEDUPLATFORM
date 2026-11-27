/**
 * MagnetMakingLabSim.tsx
 * Simulation 27: 2D Magnet Making Laboratory (चुम्बक निर्माण प्रयोगशाला)
 * Grade 6 Science • Unit 8: Electricity and Magnetism (विद्युत र चुम्बकत्व)
 *
 * 100% Native HTML5 Canvas 2D Interactive Magnetization Studio.
 * Features:
 * 1. Single Touch Stroking Method: Stroke iron bar with N pole in one consistent direction
 * 2. Microscopic Magnetic Domains Inset: Shows random magnetic dipoles aligning in parallel order
 * 3. Testing Magnet Strength: Attract iron paper clips (0 to 12 clips)
 * 4. Demagnetization: Hammering or heating destroys molecular domain alignment
 * 5. 5-Stage inquiry pedagogy, bilingual EN/NE, audio effects, and 3-star scoring.
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Sparkles, RefreshCw, Flame, Hammer, Magnet, RotateCcw, Award } from 'lucide-react';

export const MagnetMakingLabSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Stroking State
  const [strokeCount, setStrokeCount] = useState<number>(0);
  const [isStroking, setIsStroking] = useState<boolean>(false);
  const [isTestingClips, setIsTestingClips] = useState<boolean>(false);

  // Alignment percentage (20 strokes = 100% saturation)
  const alignmentPercent = Math.min(100, strokeCount * 5);
  const clipsAttracted = Math.round((alignmentPercent / 100) * 12);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokeAnimRef = useRef<number>(0); // 0 to 1 progress during stroke

  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setStrokeCount(0);
    setIsStroking(false);
    setIsTestingClips(false);
    setStars(0);
    setIsCompleted(false);
  };

  const handleStroke = () => {
    if (isStroking) return;
    setIsStroking(true);
    strokeAnimRef.current = 0;
    ScienceAudio.playDing();

    const interval = setInterval(() => {
      strokeAnimRef.current += 0.05;
      if (strokeAnimRef.current >= 1) {
        clearInterval(interval);
        setIsStroking(false);
        setStrokeCount((prev) => prev + 1);
        if (strokeCount + 1 >= 10 && stage === 'challenge' && stars < 3) {
          setStars(3);
        }
      }
    }, 25);
  };

  const handleDemagnetize = (method: 'hammer' | 'heat') => {
    ScienceAudio.playBuzzer();
    setStrokeCount(0);
    setIsTestingClips(false);
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

      // Dark Tech Lab Backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Laboratory Bench Countertop
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 390, width, height - 390);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 390);
      ctx.lineTo(width, 390);
      ctx.stroke();

      // ==========================================
      // 1. SOFT IRON BAR BEING MAGNETIZED
      // ==========================================
      const barX = 360;
      const barY = 250;
      const barW = 280;
      const barH = 36;

      // Iron Bar Body
      const ironGrad = ctx.createLinearGradient(barX - barW / 2, barY, barX + barW / 2, barY);
      if (alignmentPercent > 40) {
        // Red North at right end, Blue South at left end
        ironGrad.addColorStop(0, '#3b82f6');
        ironGrad.addColorStop(0.3, '#64748b');
        ironGrad.addColorStop(0.7, '#64748b');
        ironGrad.addColorStop(1, '#ef4444');
      } else {
        ironGrad.addColorStop(0, '#64748b');
        ironGrad.addColorStop(0.5, '#94a3b8');
        ironGrad.addColorStop(1, '#475569');
      }

      ctx.fillStyle = ironGrad;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(barX - barW / 2, barY - barH / 2, barW, barH, 6);
      ctx.fill();
      ctx.stroke();

      // Magnetic Pole Labels if magnetized
      if (alignmentPercent > 40) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('S', barX - barW / 2 + 20, barY + 5);
        ctx.fillText('N', barX + barW / 2 - 20, barY + 5);
      }

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'ne' ? 'कच्चा फलामको टुक्रा (Iron Bar)' : 'Soft Iron Bar', barX, barY + 35);

      // ==========================================
      // 2. STROKING PERMANENT MAGNET (ANIMATED ARC)
      // ==========================================
      let magnetX = barX - barW / 2 + 20;
      let magnetY = barY - 45;

      if (isStroking) {
        const t = strokeAnimRef.current;
        if (t < 0.7) {
          // Linear stroke from left to right along the iron bar
          const st = t / 0.7;
          magnetX = barX - barW / 2 + 20 + st * (barW - 40);
          magnetY = barY - 30;
        } else {
          // Arc lift and return to beginning
          const rt = (t - 0.7) / 0.3;
          magnetX = barX + barW / 2 - 20 - rt * (barW - 40);
          magnetY = barY - 30 - Math.sin(rt * Math.PI) * 50;
        }
      }

      // Draw Stroking Bar Magnet (Red North pole touching the iron)
      ctx.save();
      ctx.translate(magnetX, magnetY);
      ctx.rotate(-0.25);

      // South Pole (Top Half - Blue)
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-14, -60, 28, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('S', 0, -42);

      // North Pole (Bottom Half - Red, touching iron)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-14, -30, 28, 30);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('N', 0, -12);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-14, -60, 28, 60);
      ctx.restore();

      // ==========================================
      // 3. PAPER CLIPS ATTRACTION TEST
      // ==========================================
      if (isTestingClips && clipsAttracted > 0) {
        const rightPoleX = barX + barW / 2;
        for (let c = 0; c < clipsAttracted; c++) {
          const cx = rightPoleX + 10 + (c % 4) * 14;
          const cy = barY + Math.floor(c / 4) * 16 - 10;
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(cx, cy, 18, 8, 4);
          ctx.stroke();
        }
      }

      // ==========================================
      // 4. MICROSCOPIC MAGNETIC DOMAINS INSET
      // ==========================================
      const insetX = 640;
      const insetY = 40;
      const insetW = 210;
      const insetH = 200;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(insetX, insetY, insetW, insetH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? '🔬 डोमेन संरचना (1000X)' : '🔬 Molecular Domains (1000X)', insetX + 16, insetY + 24);

      // 4x4 Grid of Magnetic Dipole Arrows
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const dx = insetX + 35 + c * 40;
          const dy = insetY + 55 + r * 35;

          // Alignment logic: unmagnetized = pseudo-random angles, magnetized = 0 deg (pointing right)
          const seedAngle = ((r * 7 + c * 13) % 6) - 3;
          const alignFactor = alignmentPercent / 100;
          const currentAngle = seedAngle * (1 - alignFactor);

          ctx.save();
          ctx.translate(dx, dy);
          ctx.rotate(currentAngle);

          // Dipole Arrow (Red tip North, Blue tail South)
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-12, 0);
          ctx.lineTo(12, 0);
          ctx.stroke();

          // Arrowhead
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(12, 0);
          ctx.lineTo(6, -4);
          ctx.lineTo(6, 4);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }

      // Inset Footer Note
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        alignmentPercent === 100
          ? lang === 'ne' ? '✓ पूर्ण चुम्बकीकरण (100%)' : '✓ Full Saturation (100%)'
          : lang === 'ne' ? `डोमेन मिलान: ${alignmentPercent}%` : `Domain Order: ${alignmentPercent}%`,
        insetX + insetW / 2,
        insetY + insetH - 12
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [strokeCount, isStroking, isTestingClips, alignmentPercent, clipsAttracted, lang]);

  return (
    <SimulationLayout
      title="Magnet Making Laboratory (Single Touch & Molecular Domains)"
      titleNepali="चुम्बक निर्माण प्रयोगशाला (एकल स्पर्श विधि र डोमेन)"
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
      currentPromptEn="Stroke the iron bar repeatedly in one direction to align molecular domains and create a permanent magnet."
      currentPromptNe="फलामको टुक्रालाई एउटै दिशामा चुम्बकले घोट्नुहोस् र डोमेनहरू मिलाएर चुम्बक बनाउनुहोस्।"
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

          {/* Floating Top Magnetization Status Badge */}
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
            <Magnet style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
            <span>
              {lang === 'ne'
                ? `चुम्बकीकरण: ${alignmentPercent}% | घोटिएको पटक: ${strokeCount} | टाँसिएका पिन: ${clipsAttracted}`
                : `Domain Alignment: ${alignmentPercent}% | Strokes: ${strokeCount} | Clips Lifted: ${clipsAttracted}`}
            </span>
          </div>

          {/* Floating Bottom Domain Order Banner */}
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
                {lang === 'ne' ? 'आणविक डोमेन स्थिति:' : 'Molecular Domain State:'}
              </span>
              <span style={{ color: alignmentPercent >= 80 ? '#4ade80' : '#fbbf24', fontWeight: 600 }}>
                {alignmentPercent === 100
                  ? (lang === 'ne' ? '✓ सबै डोमेन एकै दिशामा मिले - शक्तिशाली चुम्बक बन्यो!' : '✓ 100% Saturated: Uniform magnetic polarity!')
                  : alignmentPercent > 0
                  ? (lang === 'ne' ? `आंशिक रूपमा मिलेका डोमेन (${alignmentPercent}%)` : `Partially aligned (${alignmentPercent}%)`)
                  : (lang === 'ne' ? 'अनियमित डोमेन (चुम्बकीय गुण छैन)' : 'Randomly oriented (No magnetism)')}
              </span>
            </div>

            <button
              onClick={() => {
                setIsTestingClips(!isTestingClips);
                ScienceAudio.playDing();
              }}
              style={{
                background: isTestingClips ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: isTestingClips ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                color: isTestingClips ? '#38bdf8' : '#cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {lang === 'ne' ? 'पिन टाँस्ने परीक्षण' : 'Test Paper Clips'}
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
              <span>{lang === 'ne' ? 'चुम्बक निर्माण कार्यशाला' : 'Magnet Making Station'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              {lang === 'ne'
                ? 'एकल स्पर्श विधिबाट फलामलाई चुम्बक बनाउनुहोस् र विचुम्बकन विधिहरू जाँच्नुहोस्।'
                : 'Stroke iron bar repeatedly in one direction to align molecular domains.'}
            </p>
          </div>

          {/* Stroke Magnet Action Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>
              {lang === 'ne' ? '१. एकल स्पर्श विधि (Single Touch Method)' : '1. Single Touch Stroking'}
            </div>
            <button
              onClick={handleStroke}
              disabled={isStroking}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: isStroking ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Magnet style={{ width: '15px', height: '15px' }} />
              <span>{lang === 'ne' ? `चुम्बकले घोट्नुहोस् (${strokeCount} पटक)` : `Stroke with Magnet (${strokeCount})`}</span>
            </button>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', textAlign: 'center' }}>
              {lang === 'ne' ? 'एउटै दिशामा घोटेर आणविक डोमेन मिलाउनुहोस्' : 'Stroke in one direction only from end to end'}
            </div>
          </div>

          {/* Demagnetization Actions */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#f87171', marginBottom: '8px' }}>
              {lang === 'ne' ? '२. विचुम्बकन विधि (Demagnetize)' : '2. Demagnetization Methods'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              <button
                onClick={() => handleDemagnetize('hammer')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Hammer style={{ width: '13px', height: '13px' }} />
                <span>{lang === 'ne' ? 'हथौडा हिर्काउने' : 'Hammering'}</span>
              </button>
              <button
                onClick={() => handleDemagnetize('heat')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Flame style={{ width: '13px', height: '13px' }} />
                <span>{lang === 'ne' ? 'तताउने (Heating)' : 'Red Heat'}</span>
              </button>
            </div>
          </div>

          {/* Domain Theory Telemetry Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              {lang === 'ne' ? '🔬 आणविक सिद्धान्त (Domain Theory):' : '🔬 Molecular Domain Theory:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'डोमेन मिलान (Alignment):' : 'Domain Alignment:'}</span>
                <span style={{ fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>{alignmentPercent}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{lang === 'ne' ? 'टाँसिएको पिन क्षमता:' : 'Paper Clips Lifted:'}</span>
                <span style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{clipsAttracted} Pins</span>
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
              ? 'फलामका भित्री आणविक चुम्बक (Domains) अव्यवस्थित हुन्छन्। चुम्बकले एउटै दिशामा घोट्दा ती समानान्तर भई चुम्बक बन्छ। हथौडाले हिर्काउँदा वा तताउँदा डोमेन बिग्रिएर विचुम्बकन हुन्छ।'
              : 'Stroking aligns molecular magnetic domains parallel to one another. Hammering or heating disrupts this alignment, destroying magnetism.'}
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
              <span>{lang === 'ne' ? '✓ चुम्बक निर्माण प्रयोगशाला पूरा गर्नुहोस्' : '✓ Complete Magnet Making Lab'}</span>
            </button>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default MagnetMakingLabSim;
