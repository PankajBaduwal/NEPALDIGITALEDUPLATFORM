/**
 * ConnectTheDotsSimulation.tsx
 * Simulation 03: Connect the Dots (थोप्लाहरू जोडेर रेखा बनाऔँ)
 * Class 1 Mathematics - Chapter 2: Lines (रेखाहरू)
 * Based on Nepal CDC Curriculum (मेरो गणित, कक्षा १ - २०७६)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  HelpCircle,
  Play,
  Award,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface Dot {
  id: number;
  x: number;
  y: number;
  label?: string;
}

interface DotPuzzle {
  id: string;
  titleEn: string;
  titleNp: string;
  typeEn: 'Straight Line' | 'Zigzag Line' | 'Curved Line' | 'Picture';
  typeNp: 'सीधा रेखा' | 'जिग्-ज्याग् रेखा' | 'बाङ्गो रेखा' | 'चित्र';
  instructionEn: string;
  instructionNp: string;
  dots: Dot[];
  isCurved?: boolean;
}

export const ConnectTheDotsSimulation: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Puzzles
  const puzzles: DotPuzzle[] = [
    {
      id: 'p1_straight_horiz',
      titleEn: 'Connect 2 Dots (Horizontal)',
      titleNp: 'दुई थोप्ला जोडेर सीधा रेखा बनाऔँ',
      typeEn: 'Straight Line',
      typeNp: 'सीधा रेखा',
      instructionEn: 'Tap or drag from Dot 1 to Dot 2 to make a straight line.',
      instructionNp: 'थोप्ला १ बाट थोप्ला २ सम्म जोडेर तेर्सो सीधा रेखा बनाउनुहोस्।',
      dots: [
        { id: 1, x: 120, y: 260, label: '१' },
        { id: 2, x: 480, y: 260, label: '२' },
      ],
    },
    {
      id: 'p2_straight_vert',
      titleEn: 'Connect 2 Dots (Vertical)',
      titleNp: 'ठाडो सीधा रेखा बनाऔँ',
      typeEn: 'Straight Line',
      typeNp: 'सीधा रेखा',
      instructionEn: 'Drag from Dot 1 down to Dot 2 to draw a straight line.',
      instructionNp: 'थोप्ला १ बाट थोप्ला २ सम्म जोडेर ठाडो सीधा रेखा बनाउनुहोस्।',
      dots: [
        { id: 1, x: 300, y: 100, label: '१' },
        { id: 2, x: 300, y: 420, label: '२' },
      ],
    },
    {
      id: 'p3_straight_collinear',
      titleEn: 'Connect 3 Dots (Straight Line)',
      titleNp: 'तीन थोप्ला जोडेर लामो सीधा रेखा',
      typeEn: 'Straight Line',
      typeNp: 'सीधा रेखा',
      instructionEn: 'Join 1 to 2, then 2 to 3. All three lie on one straight line!',
      instructionNp: '१ बाट २ र २ बाट ३ जोड्नुहोस्। यी तीनै थोप्ला एउटै सीधा रेखामा पर्छन्!',
      dots: [
        { id: 1, x: 100, y: 380, label: '१' },
        { id: 2, x: 300, y: 260, label: '२' },
        { id: 3, x: 500, y: 140, label: '३' },
      ],
    },
    {
      id: 'p4_zigzag',
      titleEn: 'Connect Dots in Zigzag',
      titleNp: 'छड्के-छड्के जिग्-ज्याग् रेखा',
      typeEn: 'Zigzag Line',
      typeNp: 'जिग्-ज्याग् रेखा',
      instructionEn: 'Join 1 to 4 in order to make a mountain zigzag line.',
      instructionNp: 'हिमालको चुचुरो जस्तै १ देखि ४ सम्मका थोप्लाहरू क्रमैसँग जोड्नुहोस्।',
      dots: [
        { id: 1, x: 100, y: 360, label: '१' },
        { id: 2, x: 220, y: 160, label: '२' },
        { id: 3, x: 380, y: 360, label: '३' },
        { id: 4, x: 500, y: 160, label: '४' },
      ],
    },
    {
      id: 'p5_curved_arc',
      titleEn: 'Curved Arc Path',
      titleNp: 'बाङ्गो इन्द्रेणी रेखा',
      typeEn: 'Curved Line',
      typeNp: 'बाङ्गो रेखा',
      instructionEn: 'Connect 1 through 5 to form a smooth curved rainbow line!',
      instructionNp: '१ देखि ५ सम्मका थोप्लाहरू जोडेर इन्द्रेणी जस्तै बाङ्गो रेखा बनाउनुहोस्!',
      isCurved: true,
      dots: [
        { id: 1, x: 100, y: 360, label: '१' },
        { id: 2, x: 170, y: 210, label: '२' },
        { id: 3, x: 300, y: 140, label: '३' },
        { id: 4, x: 430, y: 210, label: '४' },
        { id: 5, x: 500, y: 360, label: '५' },
      ],
    },
    {
      id: 'p6_kite',
      titleEn: 'Kite (चङ्गा) Dot-to-Dot',
      titleNp: 'चङ्गाको चित्र बनाऔँ',
      typeEn: 'Picture',
      typeNp: 'चित्र',
      instructionEn: 'Connect all dots in order 1 to 5 to reveal a high flying kite!',
      instructionNp: '१ देखि ५ सम्म थोप्लाहरू जोडेर सुन्दर चङ्गा बनाउनुहोस्!',
      dots: [
        { id: 1, x: 300, y: 80, label: '१' },
        { id: 2, x: 450, y: 240, label: '२' },
        { id: 3, x: 300, y: 440, label: '३' },
        { id: 4, x: 150, y: 240, label: '४' },
        { id: 5, x: 300, y: 80, label: '५' }, // Closes the diamond
      ],
    },
  ];

  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState(0);
  const currentPuzzle = puzzles[currentPuzzleIdx];

  // Connected dots sequence
  const [connectedIds, setConnectedIds] = useState<number[]>([1]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stars, setStars] = useState(0);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Audio tone helper
  const playMusicalChime = (index: number) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Pentatonic scale frequencies
      const freqs = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
      const freq = freqs[(index - 1) % freqs.length];

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  const playFanfare = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.12 + 0.4);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.4);
      });
    } catch (e) {}
  };

  const speakText = (npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // On puzzle switch
  useEffect(() => {
    setConnectedIds([1]);
    setIsCompleted(false);
    setPointerPos(null);
    speakText(currentPuzzle.instructionNp, currentPuzzle.instructionEn);
  }, [currentPuzzleIdx, language]);

  // Touch / Mouse coordinate translator
  const getCoordinates = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 600 / rect.width;
    const scaleY = 520 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Pointer down on dot
  const handleDotPointerDown = (dotId: number) => {
    const nextExpected = connectedIds[connectedIds.length - 1];
    if (dotId === nextExpected) {
      setIsDragging(true);
    }
  };

  // Pointer move
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const pos = getCoordinates(e);
    if (!pos) return;
    setPointerPos(pos);

    // Check collision with the next target dot
    const nextDotIndex = connectedIds.length;
    if (nextDotIndex < currentPuzzle.dots.length) {
      const nextDot = currentPuzzle.dots[nextDotIndex];
      const dist = Math.hypot(pos.x - nextDot.x, pos.y - nextDot.y);

      // Snap radius of 30px
      if (dist < 32) {
        connectToDot(nextDot.id);
      }
    }
  };

  // Connect to dot logic
  const connectToDot = (dotId: number) => {
    playMusicalChime(dotId);
    const updated = [...connectedIds, dotId];
    setConnectedIds(updated);

    if (updated.length === currentPuzzle.dots.length) {
      // Completed puzzle!
      setIsCompleted(true);
      setIsDragging(false);
      setPointerPos(null);
      playFanfare();
      setStars((prev) => prev + 2);
      saveProgress(100);

      const msgNp = `स्याबास! तपाईंले थोप्ला जोडेर ${currentPuzzle.typeNp} बनाउनुभयो!`;
      const msgEn = `Great job! You connected the dots to make a ${currentPuzzle.typeEn}!`;
      speakText(msgNp, msgEn);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setPointerPos(null);
  };

  // Reset current puzzle
  const handleReset = () => {
    setConnectedIds([1]);
    setIsCompleted(false);
    setPointerPos(null);
    speakText('पुनः प्रयास गर्नुहोस्', 'Try again');
  };

  // Save progress
  const saveProgress = async (score: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH2-03/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, score),
          completedLevels: currentPuzzleIdx + 1,
          totalLevels: puzzles.length,
          starsEarned: stars + 2,
          timeSpentSeconds: 90,
        }),
      });
    } catch (e) {}
  };

  // Build SVG Path from connected dots
  const getDrawnPath = () => {
    if (connectedIds.length <= 1) return '';
    const points = connectedIds.map((id, index) => currentPuzzle.dots[index]);

    if (currentPuzzle.isCurved) {
      // Smooth curve path (Catmull-Rom or Bezier)
      let d = `M ${points[0].x},${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        d += ` Q ${prev.x},${prev.y} ${midX},${midY} T ${curr.x},${curr.y}`;
      }
      return d;
    } else {
      // Straight lines
      return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    }
  };

  const lastConnectedDot = currentPuzzle.dots[connectedIds.length - 1];
  const nextTargetDot =
    connectedIds.length < currentPuzzle.dots.length ? currentPuzzle.dots[connectedIds.length] : null;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #eff6ff 50%, #fdf4ff 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Fredoka', 'Mukta', 'Segoe UI', sans-serif",
        color: '#1e293b',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBackToLibrary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f1f5f9',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            <ArrowLeft size={18} /> {language === 'np' ? 'फर्कनुहोस्' : 'Library'}
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#059669' }}>
              {language === 'np' ? 'थोप्लाहरू जोडेर रेखा बनाऔँ' : 'Connect the Dots'}
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {language === 'np' ? 'कक्षा १ गणित • अध्याय २: रेखाहरू' : 'Class 1 Math • Chapter 2: Lines'}
            </span>
          </div>
        </div>

        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              background: '#fef3c7',
              color: '#b45309',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Trophy size={16} color="#d97706" /> {stars} {language === 'np' ? 'तारा' : 'Stars'}
          </div>

          {/* Puzzle Index pills */}
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
            {puzzles.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setCurrentPuzzleIdx(idx)}
                style={{
                  background: currentPuzzleIdx === idx ? '#059669' : 'transparent',
                  color: currentPuzzleIdx === idx ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Language */}
          <button
            onClick={() => setLanguage(language === 'np' ? 'en' : 'np')}
            style={{
              background: '#ede9fe',
              color: '#6d28d9',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {language === 'np' ? 'English' : 'नेपाली'}
          </button>

          {/* Sound */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: soundEnabled ? '#dcfce7' : '#fee2e2',
              color: soundEnabled ? '#15803d' : '#b91c1c',
              border: 'none',
              padding: '8px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 20px',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '24px',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Instruction Panel */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                background: '#d1fae5',
                color: '#065f46',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '10px',
              }}
            >
              {language === 'np' ? currentPuzzle.typeNp : currentPuzzle.typeEn}
            </span>

            <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              {language === 'np' ? currentPuzzle.titleNp : currentPuzzle.titleEn}
            </h2>

            <p
              style={{
                fontSize: '14px',
                color: '#334155',
                lineHeight: 1.6,
                margin: '0 0 20px 0',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '12px',
                borderLeft: '4px solid #059669',
              }}
            >
              {language === 'np' ? currentPuzzle.instructionNp : currentPuzzle.instructionEn}
            </p>

            <button
              onClick={() => speakText(currentPuzzle.instructionNp, currentPuzzle.instructionEn)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center',
                background: '#e0f2fe',
                color: '#0369a1',
                border: 'none',
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Volume2 size={16} /> {language === 'np' ? 'सुन्नुहोस् (Listen)' : 'Listen to Prompt'}
            </button>
          </div>

          {/* Line Type Educational Guide */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#475569' }}>
              {language === 'np' ? 'सिकाई तथ्य (Learning Note)' : 'Key Concept'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }} />
                <span>
                  {language === 'np'
                    ? 'दुई थोप्लालाई नमोडी जोड्दा **सीधा रेखा** बन्छ।'
                    : 'Joining two dots directly creates a **straight line**.'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626' }} />
                <span>
                  {language === 'np'
                    ? 'घुमाएर वा मोडेर जोड्दा **बाङ्गो रेखा** बन्छ।'
                    : 'Joining dots in a curve creates a **curved line**.'}
                </span>
              </div>
            </div>

            <button
              onClick={handleReset}
              style={{
                marginTop: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={16} /> {language === 'np' ? 'पुनः प्रयास गर्नुस्' : 'Reset Dots'}
            </button>
          </div>
        </aside>

        {/* Right Canvas Playground */}
        <section
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '3px solid #e2e8f0',
            position: 'relative',
          }}
        >
          {/* Header Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
              {language === 'np'
                ? `जोडिएका थोप्लाहरू: ${connectedIds.length} / ${currentPuzzle.dots.length}`
                : `Connected Dots: ${connectedIds.length} / ${currentPuzzle.dots.length}`}
            </span>

            {nextTargetDot && (
              <span
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  animation: 'pulse 1.5s infinite',
                }}
              >
                {language === 'np'
                  ? `अब थोप्ला ${nextTargetDot.label || nextTargetDot.id} मा जानुहोस्`
                  : `Next: Move to Dot ${nextTargetDot.id}`}
              </span>
            )}
          </div>

          {/* SVG Canvas Board */}
          <div
            style={{
              flex: 1,
              minHeight: '440px',
              background: '#f8fafc',
              borderRadius: '20px',
              border: '2px dashed #94a3b8',
              position: 'relative',
              overflow: 'hidden',
              touchAction: 'none',
              cursor: isDragging ? 'grabbing' : 'pointer',
            }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 600 520"
              style={{ width: '100%', height: '100%' }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Grid Background */}
              <defs>
                <pattern id="dotPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="1.5" fill="#cbd5e1" />
                </pattern>
                <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect width="600" height="520" fill="url(#dotPattern)" />

              {/* Already Connected Line Path */}
              {connectedIds.length > 1 && (
                <path
                  d={getDrawnPath()}
                  fill="none"
                  stroke={currentPuzzle.isCurved ? '#dc2626' : '#2563eb'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Active Rubber-Band Drag Line */}
              {isDragging && pointerPos && lastConnectedDot && (
                <line
                  x1={lastConnectedDot.x}
                  y1={lastConnectedDot.y}
                  x2={pointerPos.x}
                  y2={pointerPos.y}
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
              )}

              {/* Dots rendering */}
              {currentPuzzle.dots.map((dot, idx) => {
                const isConnected = connectedIds.includes(dot.id);
                const isCurrentHead = dot.id === lastConnectedDot?.id;
                const isNextTarget = dot.id === nextTargetDot?.id;

                let dotColor = '#94a3b8';
                if (isConnected) dotColor = '#059669';
                if (isCurrentHead) dotColor = '#2563eb';
                if (isNextTarget) dotColor = '#f59e0b';

                return (
                  <g
                    key={dot.id}
                    onPointerDown={() => handleDotPointerDown(dot.id)}
                    onClick={() => {
                      // Click-to-connect fallback for keyboard/mouse ease
                      if (isNextTarget) connectToDot(dot.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Pulsing ring for next target */}
                    {isNextTarget && (
                      <circle
                        cx={dot.x}
                        cy={dot.y}
                        r="24"
                        fill="rgba(245, 158, 11, 0.25)"
                        filter="url(#dotGlow)"
                      >
                        <animate
                          attributeName="r"
                          values="18;28;18"
                          dur="1.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Main Dot Circle */}
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r="16"
                      fill={dotColor}
                      stroke="#ffffff"
                      strokeWidth="3"
                    />

                    {/* Dot Number Label */}
                    <text
                      x={dot.x}
                      y={dot.y + 5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="14"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {dot.label || dot.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Completion Banner */}
          {isCompleted && (
            <div
              style={{
                marginTop: '16px',
                background: '#d1fae5',
                border: '2px solid #34d399',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                animation: 'popIn 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={32} color="#059669" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: '#065f46' }}>
                    {language === 'np' ? 'अति राम्रो! रेखा बन्यो!' : 'Great Job! Line Completed!'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#047857' }}>
                    {language === 'np'
                      ? `यो ${currentPuzzle.typeNp} हो।`
                      : `This is a ${currentPuzzle.typeEn}.`}
                  </div>
                </div>
              </div>

              {currentPuzzleIdx < puzzles.length - 1 ? (
                <button
                  onClick={() => setCurrentPuzzleIdx(currentPuzzleIdx + 1)}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {language === 'np' ? 'अर्को थोप्ला अभ्यास' : 'Next Puzzle'}
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={onBackToLibrary}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Trophy size={18} />
                  {language === 'np' ? 'लाइब्रेरीमा फर्कनुहोस्' : 'Finish to Library'}
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
export default ConnectTheDotsSimulation;

