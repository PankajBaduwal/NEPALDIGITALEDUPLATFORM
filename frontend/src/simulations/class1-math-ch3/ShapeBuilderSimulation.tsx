/**
 * ShapeBuilderSimulation.tsx
 * Simulation 05: Build with Shapes (आकारहरूबाट चित्र बनाऔँ)
 * Class 1 Mathematics - Chapter 3: Geometrical Shapes (ज्यामितीय आकारहरू)
 * Based on Nepal CDC Curriculum (मेरो गणित, कक्षा १ - २०७६)
 */

import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  RotateCw,
  Trash2,
  ChevronRight,
  Shapes,
  Maximize2,
  Square,
  Circle,
  Triangle,
  Download,
  Share2,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

type ShapeKind = 'circle' | 'triangle' | 'square' | 'rectangle';

interface PlacedShape {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
}

interface Blueprint {
  id: string;
  titleEn: string;
  titleNp: string;
  hintEn: string;
  hintNp: string;
}

export const ShapeBuilderSimulation: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Construction State
  const [placedShapes, setPlacedShapes] = useState<PlacedShape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#ef4444');
  const [stars, setStars] = useState(0);

  // Guided Blueprint Templates
  const blueprints: Blueprint[] = [
    {
      id: 'house',
      titleEn: 'Build a Village House (घर)',
      titleNp: 'गाउँको घर बनाऔँ',
      hintEn: 'Use a Triangle for the roof and a Quadrilateral for the walls!',
      hintNp: 'छानाका लागि त्रिभुज र भित्ताका लागि चतुर्भुज प्रयोग गर्नुहोस्!',
    },
    {
      id: 'robot',
      titleEn: 'Build a Friendly Robot (रोबोट)',
      titleNp: 'रमाइलो रोबोट बनाऔँ',
      hintEn: 'Use Quadrilaterals for body & head, Circles for eyes!',
      hintNp: 'शरीरका लागि चतुर्भुज र आँखाका लागि वृत्त प्रयोग गर्नुहोस्!',
    },
    {
      id: 'bus',
      titleEn: 'Build a School Bus (बस)',
      titleNp: 'विद्यालय बस बनाऔँ',
      hintEn: 'Use Rectangles for the bus body and Circles for wheels!',
      hintNp: 'बसको शरीरका लागि आयताकार चतुर्भुज र पाङ्ग्राका लागि वृत्त प्रयोग गर्नुहोस्!',
    },
    {
      id: 'flower',
      titleEn: 'Build a Garden Flower (फूल)',
      titleNp: 'सुन्दर फूल बनाऔँ',
      hintEn: 'Use Circles for petals and Triangles for leaves!',
      hintNp: 'फूलका लागि वृत्त र पातका लागि त्रिभुज प्रयोग गर्नुहोस्!',
    },
  ];

  const [activeBlueprintIdx, setActiveBlueprintIdx] = useState<number>(0);
  const currentBlueprint = blueprints[activeBlueprintIdx];

  // Dragging inside canvas
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Audio synthesizer
  const speakText = (npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const playTone = (freq: number) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  const playFanfare = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        g.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + idx * 0.1 + 0.3);
        o.start(ctx.currentTime + idx * 0.1);
        o.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    } catch (e) {}
  };

  // Add a shape to canvas
  const handleAddShape = (kind: ShapeKind) => {
    playTone(550);
    const newShape: PlacedShape = {
      id: `shape_${Date.now()}`,
      kind,
      x: 280 + (Math.random() - 0.5) * 60,
      y: 200 + (Math.random() - 0.5) * 60,
      rotation: 0,
      scale: 1,
      color: selectedColor,
    };
    setPlacedShapes((prev) => [...prev, newShape]);
    setSelectedShapeId(newShape.id);
    setStars((s) => s + 1);

    const kindNp =
      kind === 'circle' ? 'वृत्त' : kind === 'triangle' ? 'त्रिभुज' : 'चतुर्भुज';
    speakText(
      `नयाँ ${kindNp} थपियो!`,
      `Added a ${kind}!`
    );
  };

  // Pointer move dragging
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffsetRef.current.x;
    const newY = e.clientY - rect.top - dragOffsetRef.current.y;

    setPlacedShapes((prev) =>
      prev.map((s) => (s.id === draggingId ? { ...s, x: newX, y: newY } : s))
    );
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  // Rotate selected shape
  const handleRotateSelected = () => {
    if (!selectedShapeId) return;
    playTone(600);
    setPlacedShapes((prev) =>
      prev.map((s) =>
        s.id === selectedShapeId ? { ...s, rotation: (s.rotation + 45) % 360 } : s
      )
    );
  };

  // Scale selected shape
  const handleScaleSelected = (delta: number) => {
    if (!selectedShapeId) return;
    playTone(650);
    setPlacedShapes((prev) =>
      prev.map((s) =>
        s.id === selectedShapeId
          ? { ...s, scale: Math.max(0.6, Math.min(2.0, s.scale + delta)) }
          : s
      )
    );
  };

  // Delete selected shape
  const handleDeleteSelected = () => {
    if (!selectedShapeId) return;
    playTone(300);
    setPlacedShapes((prev) => prev.filter((s) => s.id !== selectedShapeId));
    setSelectedShapeId(null);
  };

  // Clear all
  const handleClear = () => {
    playTone(250);
    setPlacedShapes([]);
    setSelectedShapeId(null);
  };

  // Complete blueprint
  const handleCompleteBlueprint = () => {
    playFanfare();
    setStars((s) => s + 5);
    speakText(
      'अति राम्रो! तपाईंले आकारहरू जोडेर सुन्दर चित्र बनाउनुभयो!',
      'Awesome! You successfully built a picture using shapes!'
    );
    saveProgress(100);
  };

  const saveProgress = async (score: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH3-05/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, score),
          completedLevels: activeBlueprintIdx + 1,
          totalLevels: blueprints.length,
          starsEarned: stars + 5,
          timeSpentSeconds: 160,
        }),
      });
    } catch (e) {}
  };

  const selectedShape = placedShapes.find((s) => s.id === selectedShapeId);

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fef3c7 0%, #ecfdf5 50%, #eff6ff 100%)',
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
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#d97706' }}>
              {language === 'np' ? 'आकारहरूबाट चित्र बनाऔँ' : 'Build with Shapes'}
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {language === 'np'
                ? 'कक्षा १ गणित • अध्याय ३: ज्यामितीय आकारहरू (वृत्त, त्रिभुज, चतुर्भुज)'
                : 'Class 1 Math • Chapter 3: Geometrical Shapes'}
            </span>
          </div>
        </div>

        {/* Blueprint switcher & tools */}
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

          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '3px' }}>
            {blueprints.map((bp, idx) => (
              <button
                key={bp.id}
                onClick={() => {
                  setActiveBlueprintIdx(idx);
                  speakText(bp.hintNp, bp.hintEn);
                }}
                style={{
                  background: activeBlueprintIdx === idx ? '#d97706' : 'transparent',
                  color: activeBlueprintIdx === idx ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {language === 'np' ? bp.titleNp.split(' ')[0] : bp.titleEn.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Language Toggle */}
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

          {/* Sound Toggle */}
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
        {/* Left Toolbar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Blueprint Goal Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              {language === 'np' ? currentBlueprint.titleNp : currentBlueprint.titleEn}
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              {language === 'np' ? currentBlueprint.hintNp : currentBlueprint.hintEn}
            </p>

            <button
              onClick={() => speakText(currentBlueprint.hintNp, currentBlueprint.hintEn)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center',
                background: '#fef3c7',
                color: '#b45309',
                border: 'none',
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Volume2 size={16} /> {language === 'np' ? 'सुन्नुहोस्' : 'Listen Hint'}
            </button>
          </div>

          {/* Add Shapes Palette */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#475569' }}>
              {language === 'np' ? 'आकार थप्नुहोस् (Add Shape)' : 'Shape Building Blocks'}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {/* Circle */}
              <button
                onClick={() => handleAddShape('circle')}
                style={{
                  background: '#f0fdf4',
                  border: '2px solid #10b981',
                  borderRadius: '16px',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: selectedColor }} />
                <span style={{ fontWeight: 800, fontSize: '12px', color: '#065f46' }}>
                  {language === 'np' ? 'वृत्त (Circle)' : 'Circle'}
                </span>
              </button>

              {/* Triangle */}
              <button
                onClick={() => handleAddShape('triangle')}
                style={{
                  background: '#fef2f2',
                  border: '2px solid #ef4444',
                  borderRadius: '16px',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '18px solid transparent',
                    borderRight: '18px solid transparent',
                    borderBottom: `36px solid ${selectedColor}`,
                  }}
                />
                <span style={{ fontWeight: 800, fontSize: '12px', color: '#991b1b' }}>
                  {language === 'np' ? 'त्रिभुज (Triangle)' : 'Triangle'}
                </span>
              </button>

              {/* Square */}
              <button
                onClick={() => handleAddShape('square')}
                style={{
                  background: '#eff6ff',
                  border: '2px solid #2563eb',
                  borderRadius: '16px',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '36px', height: '36px', background: selectedColor, borderRadius: '4px' }} />
                <span style={{ fontWeight: 800, fontSize: '12px', color: '#1e40af' }}>
                  {language === 'np' ? 'वर्ग (Square)' : 'Square'}
                </span>
              </button>

              {/* Rectangle */}
              <button
                onClick={() => handleAddShape('rectangle')}
                style={{
                  background: '#eff6ff',
                  border: '2px solid #3b82f6',
                  borderRadius: '16px',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '48px', height: '28px', background: selectedColor, borderRadius: '4px' }} />
                <span style={{ fontWeight: 800, fontSize: '12px', color: '#1e40af' }}>
                  {language === 'np' ? 'आयत (Rectangle)' : 'Rectangle'}
                </span>
              </button>
            </div>

            {/* Color Palette */}
            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>
                {language === 'np' ? 'रङ छान्नुहोस्' : 'Color Picker'}
              </span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {['#ef4444', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: col,
                      border: selectedColor === col ? '3px solid #0f172a' : '2px solid #e2e8f0',
                      cursor: 'pointer',
                      transform: selectedColor === col ? 'scale(1.15)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Transform & Shape Controls */}
          {selectedShape && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                border: '2px solid #38bdf8',
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#0369a1' }}>
                {language === 'np' ? 'छानिएको आकारको नियन्त्रण' : 'Transform Shape'}
              </h4>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleRotateSelected}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCw size={14} /> {language === 'np' ? 'घुमाउनुहोस्' : 'Rotate'}
                </button>
                <button
                  onClick={() => handleScaleSelected(0.2)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {language === 'np' ? 'ठूलो (+)' : 'Bigger (+)'}
                </button>
                <button
                  onClick={() => handleScaleSelected(-0.2)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {language === 'np' ? 'सानो (-)' : 'Smaller (-)'}
                </button>
                <button
                  onClick={handleDeleteSelected}
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleClear}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              padding: '10px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#e11d48',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={16} /> {language === 'np' ? 'सबै सफा गर्नुस्' : 'Clear Board'}
          </button>
        </aside>

        {/* Right Interactive Construction Canvas */}
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
          {/* Header Legend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b' }}>
              {language === 'np'
                ? `चित्रमा प्रयोग भएका आकारहरू: ${placedShapes.length}`
                : `Shapes on Canvas: ${placedShapes.length}`}
            </span>

            <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700 }}>
              {language === 'np' ? 'आकारलाई तानेर आफ्नो चित्र बनाउनुहोस् 🎨' : 'Drag shapes to build your creation 🎨'}
            </span>
          </div>

          {/* Construction Board Area */}
          <div
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              flex: 1,
              minHeight: '440px',
              background: '#f8fafc',
              borderRadius: '20px',
              border: '2px dashed #94a3b8',
              position: 'relative',
              overflow: 'hidden',
              cursor: draggingId ? 'grabbing' : 'default',
            }}
          >
            {/* Grid Dots */}
            <svg
              viewBox="0 0 600 440"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <defs>
                <pattern id="buildDotGrid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="#cbd5e1" />
                </pattern>
              </defs>
              <rect width="600" height="440" fill="url(#buildDotGrid)" />
            </svg>

            {/* Render Placed Shapes */}
            {placedShapes.map((shape) => {
              const isSelected = selectedShapeId === shape.id;

              return (
                <div
                  key={shape.id}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelectedShapeId(shape.id);
                    setDraggingId(shape.id);
                    if (canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      dragOffsetRef.current = {
                        x: e.clientX - rect.left - shape.x,
                        y: e.clientY - rect.top - shape.y,
                      };
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: `${shape.x}px`,
                    top: `${shape.y}px`,
                    transform: `translate(-50%, -50%) rotate(${shape.rotation}deg) scale(${shape.scale})`,
                    cursor: 'grab',
                    zIndex: isSelected ? 30 : 10,
                    outline: isSelected ? '3px dashed #0284c7' : 'none',
                    outlineOffset: '6px',
                    transition: draggingId === shape.id ? 'none' : 'transform 0.15s ease',
                  }}
                >
                  {shape.kind === 'circle' && (
                    <div
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: shape.color,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      }}
                    />
                  )}

                  {shape.kind === 'square' && (
                    <div
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '6px',
                        background: shape.color,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      }}
                    />
                  )}

                  {shape.kind === 'rectangle' && (
                    <div
                      style={{
                        width: '110px',
                        height: '60px',
                        borderRadius: '6px',
                        background: shape.color,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      }}
                    />
                  )}

                  {shape.kind === 'triangle' && (
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '40px solid transparent',
                        borderRight: '40px solid transparent',
                        borderBottom: `70px solid ${shape.color}`,
                        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))',
                      }}
                    />
                  )}
                </div>
              );
            })}

            {placedShapes.length === 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }}
              >
                <Shapes size={48} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                <div style={{ fontWeight: 800, fontSize: '16px' }}>
                  {language === 'np'
                    ? 'देब्रेबाट आकार थप्नुहोस् र चित्र बनाउनुहोस्'
                    : 'Click any shape on the left to start building!'}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {language === 'np'
                ? 'आकारहरू मिलाएर आफ्नो मनपर्ने चित्र बनाउनुहोस्!'
                : 'Combine shapes creatively to build your own masterpiece!'}
            </span>

            <button
              onClick={handleCompleteBlueprint}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(16,185,129,0.35)',
              }}
            >
              <Sparkles size={18} />
              {language === 'np' ? 'चित्र सम्पन्न भयो (Finish)' : 'Finish Picture'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
export default ShapeBuilderSimulation;

