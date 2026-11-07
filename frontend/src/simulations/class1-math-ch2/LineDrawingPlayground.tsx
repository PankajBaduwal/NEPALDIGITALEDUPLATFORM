/**
 * LineDrawingPlayground.tsx
 * Simulation 05: My Line Drawing Playground (आफैँ रेखा कोरौँ)
 * Class 1 Mathematics - Chapter 2: Lines (रेखाहरू)
 * Based on Nepal CDC Curriculum (मेरो गणित, कक्षा १ - २०७६)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  Pencil,
  Eraser,
  Palette,
  Undo2,
  Download,
  Share2,
  CheckCircle2,
  ChevronRight,
  Sun,
  Trees,
  Sliders,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

type ModeType = 'trace' | 'freehand' | 'stamp';
type StrokeType = 'straight' | 'curved';

interface PathPoint {
  x: number;
  y: number;
}

interface UserLine {
  id: string;
  points: PathPoint[];
  color: string;
  width: number;
  type: StrokeType;
}

interface TemplateGuide {
  id: string;
  nameEn: string;
  nameNp: string;
  type: StrokeType;
  pathD: string;
}

export const LineDrawingPlayground: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Playground Modes
  const [activeMode, setActiveMode] = useState<ModeType>('trace');
  const [selectedColor, setSelectedColor] = useState<string>('#2563eb');
  const [strokeWidth, setStrokeWidth] = useState<number>(6);

  // Template Guides for Tracing Mode
  const templates: TemplateGuide[] = [
    {
      id: 't_horiz',
      nameEn: 'Horizontal Straight Line',
      nameNp: 'तेर्सो सीधा रेखा',
      type: 'straight',
      pathD: 'M 80,140 L 520,140',
    },
    {
      id: 't_vert',
      nameEn: 'Vertical Straight Line',
      nameNp: 'ठाडो सीधा रेखा',
      type: 'straight',
      pathD: 'M 300,60 L 300,420',
    },
    {
      id: 't_slanted',
      nameEn: 'Slanted Straight Lines',
      nameNp: 'छड्के सीधा रेखाहरू',
      type: 'straight',
      pathD: 'M 100,100 L 480,380 M 480,100 L 100,380',
    },
    {
      id: 't_wave',
      nameEn: 'Curved Ocean Waves',
      nameNp: 'बाङ्गो छाल रेखा',
      type: 'curved',
      pathD: 'M 80,240 Q 180,160 280,240 T 480,240',
    },
    {
      id: 't_loop',
      nameEn: 'Curved Loops & Spiral',
      nameNp: 'बाङ्गो रिङ रेखा',
      type: 'curved',
      pathD: 'M 100,240 C 200,80 200,400 300,240 C 400,80 400,400 500,240',
    },
  ];

  const [activeTemplateIdx, setActiveTemplateIdx] = useState<number>(0);
  const currentTemplate = templates[activeTemplateIdx];

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lines, setLines] = useState<UserLine[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPoints, setCurrentPoints] = useState<PathPoint[]>([]);

  // Scores
  const [stars, setStars] = useState<number>(0);

  // Audio helper
  const speakText = (npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  const playSuccessFanfare = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + idx * 0.1 + 0.3);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    } catch (e) {}
  };

  useEffect(() => {
    if (activeMode === 'trace') {
      const np = `नमुनामाथि पेन्सिलले कोरेर ${currentTemplate.nameNp} बनाउनुहोस्।`;
      const en = `Trace over the dashed guide to practice ${currentTemplate.nameEn}.`;
      speakText(np, en);
    } else {
      const np = 'आफ्नो इच्छाअनुसार सीधा र बाङ्गो रेखाहरू कोरेर रमाइलो गर्नुहोस्!';
      const en = 'Freely draw straight and curved lines on your drawing playground!';
      speakText(np, en);
    }
  }, [activeMode, activeTemplateIdx, language]);

  // Redraw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Slate / Playground chalk board background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle wooden slate border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    // Draw saved lines
    lines.forEach((l) => {
      if (l.points.length < 2) return;
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(l.points[0].x, l.points[0].y);
      for (let i = 1; i < l.points.length; i++) {
        ctx.lineTo(l.points[i].x, l.points[i].y);
      }
      ctx.stroke();
    });

    // Draw current active stroke
    if (currentPoints.length > 1) {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
      }
      ctx.stroke();
    }
  }, [lines, currentPoints, selectedColor, strokeWidth]);

  // Coordinate mapper
  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>): PathPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const p = getCanvasPos(e);
    setCurrentPoints([p]);
    playChime();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const p = getCanvasPos(e);
    setCurrentPoints((prev) => [...prev, p]);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length >= 2) {
      const newLine: UserLine = {
        id: `stroke_${Date.now()}`,
        points: currentPoints,
        color: selectedColor,
        width: strokeWidth,
        type: activeMode === 'trace' ? currentTemplate.type : 'straight',
      };
      setLines((prev) => [...prev, newLine]);
      setCurrentPoints([]);

      if (activeMode === 'trace') {
        setStars((prev) => prev + 1);
        playSuccessFanfare();
        saveProgress(100);
      }
    }
  };

  const handleUndo = () => {
    setLines((prev) => prev.slice(0, prev.length - 1));
  };

  const handleClear = () => {
    setLines([]);
    setCurrentPoints([]);
  };

  // Stamp sticker applicator
  const applyStamp = (type: 'sun' | 'tree' | 'ladder') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    if (type === 'sun') {
      // Sun: circle (curved) + rays (straight)
      const rays: UserLine[] = [];
      // 8 rays (straight lines)
      for (let angle = 0; angle < 360; angle += 45) {
        const rad = (angle * Math.PI) / 180;
        const x1 = midX + Math.cos(rad) * 60;
        const y1 = midY + Math.sin(rad) * 60;
        const x2 = midX + Math.cos(rad) * 90;
        const y2 = midY + Math.sin(rad) * 90;
        rays.push({
          id: `ray_${angle}`,
          points: [
            { x: x1, y: y1 },
            { x: x2, y: y2 },
          ],
          color: '#fbbf24',
          width: 5,
          type: 'straight',
        });
      }
      // Circle (curved line)
      const circlePoints: PathPoint[] = [];
      for (let a = 0; a <= 360; a += 15) {
        const r = (a * Math.PI) / 180;
        circlePoints.push({ x: midX + Math.cos(r) * 50, y: midY + Math.sin(r) * 50 });
      }
      rays.push({
        id: `sun_core`,
        points: circlePoints,
        color: '#f59e0b',
        width: 6,
        type: 'curved',
      });
      setLines((prev) => [...prev, ...rays]);
      speakText('सूर्य: सीधा किरणहरू र बाङ्गो गोलो रेखा!', 'Sun: Straight rays and curved circle!');
    } else if (type === 'ladder') {
      // Ladder: 2 straight side rails + 4 straight rungs
      const r1: UserLine = {
        id: `ladder_l`,
        points: [
          { x: midX - 60, y: midY - 120 },
          { x: midX - 60, y: midY + 120 },
        ],
        color: '#60a5fa',
        width: 8,
        type: 'straight',
      };
      const r2: UserLine = {
        id: `ladder_r`,
        points: [
          { x: midX + 60, y: midY - 120 },
          { x: midX + 60, y: midY + 120 },
        ],
        color: '#60a5fa',
        width: 8,
        type: 'straight',
      };
      const rungs: UserLine[] = [-80, -30, 20, 70].map((offset, i) => ({
        id: `rung_${i}`,
        points: [
          { x: midX - 60, y: midY + offset },
          { x: midX + 60, y: midY + offset },
        ],
        color: '#93c5fd',
        width: 6,
        type: 'straight',
      }));
      setLines((prev) => [...prev, r1, r2, ...rungs]);
      speakText('भर्‍याङ: सबै सीधा रेखाहरू!', 'Ladder: All straight lines!');
    }
    playSuccessFanfare();
  };

  const saveProgress = async (score: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH2-05/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, score),
          completedLevels: activeTemplateIdx + 1,
          totalLevels: templates.length,
          starsEarned: stars + 1,
          timeSpentSeconds: 150,
        }),
      });
    } catch (e) {}
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #fef3c7 50%, #f3e8ff 100%)',
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
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>
              {language === 'np' ? 'आफैँ रेखा कोरौँ' : 'My Line Drawing Playground'}
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {language === 'np' ? 'कक्षा १ गणित • अध्याय २: रेखाहरू' : 'Class 1 Math • Chapter 2: Lines'}
            </span>
          </div>
        </div>

        {/* Header Right */}
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

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveMode('trace')}
              style={{
                background: activeMode === 'trace' ? '#16a34a' : 'transparent',
                color: activeMode === 'trace' ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {language === 'np' ? 'नमुना कोर्ने (Trace)' : 'Tracing Mode'}
            </button>
            <button
              onClick={() => setActiveMode('freehand')}
              style={{
                background: activeMode === 'freehand' ? '#16a34a' : 'transparent',
                color: activeMode === 'freehand' ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {language === 'np' ? 'स्वतन्त्र कोर्ने (Freehand)' : 'Free Drawing'}
            </button>
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

      {/* Main Layout */}
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
        {/* Left Toolbar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Tracing Templates (if activeMode === 'trace') */}
          {activeMode === 'trace' ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                border: '2px solid #e2e8f0',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                {language === 'np' ? 'नमुना रेखाहरू (Templates)' : 'Practice Guides'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {templates.map((tpl, i) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setActiveTemplateIdx(i);
                      handleClear();
                    }}
                    style={{
                      background: activeTemplateIdx === i ? '#dcfce7' : '#f8fafc',
                      border: activeTemplateIdx === i ? '2px solid #16a34a' : '1px solid #e2e8f0',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '13px',
                      color: activeTemplateIdx === i ? '#166534' : '#334155',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{language === 'np' ? tpl.nameNp : tpl.nameEn}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        background: tpl.type === 'straight' ? '#dbeafe' : '#fee2e2',
                        color: tpl.type === 'straight' ? '#1d4ed8' : '#b91c1c',
                        padding: '2px 6px',
                        borderRadius: '6px',
                      }}
                    >
                      {tpl.type === 'straight'
                        ? language === 'np'
                          ? 'सीधा'
                          : 'Straight'
                        : language === 'np'
                        ? 'बाङ्गो'
                        : 'Curved'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Fun Line Stamps (Sun & Ladder) */
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                border: '2px solid #e2e8f0',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                {language === 'np' ? 'रेखाहरूबाट बनेका वस्तु' : 'Stamps from Lines'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => applyStamp('sun')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#b45309',
                    cursor: 'pointer',
                  }}
                >
                  <Sun size={20} />
                  <span>{language === 'np' ? 'सूर्य (Sun - Circle & Rays)' : 'Sun (Curved & Straight)'}</span>
                </button>
                <button
                  onClick={() => applyStamp('ladder')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#e0f2fe',
                    border: '1px solid #bfdbfe',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#0369a1',
                    cursor: 'pointer',
                  }}
                >
                  <Sliders size={20} />
                  <span>{language === 'np' ? 'भर्‍याङ (Ladder - Straight)' : 'Ladder (Straight Lines)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Color & Pen Thickness */}
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
              {language === 'np' ? 'रङ र मोटाई' : 'Colors & Thickness'}
            </h3>

            {/* Colors */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['#2563eb', '#dc2626', '#16a34a', '#fbbf24', '#ffffff', '#ec4899'].map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: col,
                    border: selectedColor === col ? '3px solid #0f172a' : '2px solid #cbd5e1',
                    cursor: 'pointer',
                    transform: selectedColor === col ? 'scale(1.15)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
              ))}
            </div>

            {/* Stroke Width */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[4, 8, 14].map((w) => (
                <button
                  key={w}
                  onClick={() => setStrokeWidth(w)}
                  style={{
                    flex: 1,
                    background: strokeWidth === w ? '#e2e8f0' : '#f8fafc',
                    border: '1px solid #cbd5e1',
                    padding: '8px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${w}px`,
                      background: selectedColor,
                      borderRadius: '4px',
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={handleUndo}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: '10px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <Undo2 size={16} /> {language === 'np' ? 'पछाडि' : 'Undo'}
              </button>
              <button
                onClick={handleClear}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  padding: '10px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '12px',
                  color: '#e11d48',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={16} /> {language === 'np' ? 'सफा गर्नुस्' : 'Clear'}
              </button>
            </div>
          </div>
        </aside>

        {/* Right Slate / Sandpit Drawing Surface */}
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
          {/* Header Description */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b' }}>
              {activeMode === 'trace'
                ? language === 'np'
                  ? `नमुना: ${currentTemplate.nameNp} (${currentTemplate.type === 'straight' ? 'सीधा रेखा' : 'बाङ्गो रेखा'})`
                  : `Template: ${currentTemplate.nameEn}`
                : language === 'np'
                ? 'स्वतन्त्र रेखा चित्रकला पाटी'
                : 'Free Line Drawing Canvas'}
            </span>

            <span
              style={{
                background: '#dcfce7',
                color: '#15803d',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              {language === 'np' ? 'पेन्सिलले कोर्नुहोस् ✏️' : 'Draw with your finger or mouse ✏️'}
            </span>
          </div>

          {/* Interactive Chalkboard Canvas */}
          <div
            style={{
              flex: 1,
              minHeight: '440px',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.4)',
              border: '6px solid #475569',
            }}
          >
            {/* SVG Dashed Template Overlay for Tracing Mode */}
            {activeMode === 'trace' && (
              <svg
                viewBox="0 0 640 480"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                <path
                  d={currentTemplate.pathD}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="8"
                  strokeDasharray="12 10"
                  strokeLinecap="round"
                />
              </svg>
            )}

            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                cursor: 'crosshair',
                touchAction: 'none',
              }}
            />
          </div>

          {/* Footer Controls */}
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {language === 'np'
                  ? 'सीधा रेखा र बाङ्गो रेखा आफैँ कोरेर अभ्यास गर्नुहोस्।'
                  : 'Practice drawing straight and curved lines.'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {activeMode === 'trace' && activeTemplateIdx < templates.length - 1 && (
                <button
                  onClick={() => {
                    setActiveTemplateIdx(activeTemplateIdx + 1);
                    handleClear();
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
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
                  {language === 'np' ? 'अर्को नमुना' : 'Next Template'}
                  <ChevronRight size={18} />
                </button>
              )}

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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
export default LineDrawingPlayground;

