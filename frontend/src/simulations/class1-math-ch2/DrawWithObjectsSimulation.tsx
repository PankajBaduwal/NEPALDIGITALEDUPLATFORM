/**
 * DrawWithObjectsSimulation.tsx
 * Simulation 04: Draw with Real Objects (वस्तुको प्रयोग गरी रेखा कोरौँ)
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
  CheckCircle2,
  BookOpen,
  Box,
  Compass,
  Pencil,
  ChevronRight,
  Maximize2,
  RotateCw,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

type ToolType = 'ruler' | 'book' | 'box' | 'freehand';

interface DrawnLine {
  id: string;
  toolUsed: ToolType;
  type: 'straight' | 'wobbly';
  color: string;
  points: { x: number; y: number }[];
  isStraight: boolean;
}

export const DrawWithObjectsSimulation: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Tool selection
  const [activeTool, setActiveTool] = useState<ToolType>('ruler');
  const [objectRotation, setObjectRotation] = useState<number>(0); // 0 (horiz), 45 (diag), 90 (vert)
  const [objectPos, setObjectPos] = useState<{ x: number; y: number }>({ x: 120, y: 220 });

  // Drawing state
  const [lines, setLines] = useState<DrawnLine[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  // Guided Activities
  const [activityStep, setActivityStep] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);
  const [feedbackMsg, setFeedbackMsg] = useState<{ np: string; en: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  };

  const playFanfare = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
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

  // Activity descriptions
  const activities = [
    {
      id: 1,
      titleEn: 'Step 1: Draw with a Wooden Ruler (स्केल)',
      titleNp: 'अभ्यास १: रुलर (स्केल) को सिधा किनारा प्रयोग गरौँ',
      instructionEn: 'Drag the pencil along the top edge of the wooden ruler to draw a perfectly straight line.',
      instructionNp: 'काठको रुलरको सिधा किनारामा पेन्सिल घोटेर एकदम सीधा रेखा खिच्नुहोस्।',
      recommendedTool: 'ruler',
    },
    {
      id: 2,
      titleEn: 'Step 2: Draw with a Textbook Edge (किताबको किनारा)',
      titleNp: 'अभ्यास २: किताबको सिधा किनारा प्रयोग गरौँ',
      instructionEn: 'Select the Book and draw along its edge. Books also have straight edges!',
      instructionNp: 'किताब छान्नुहोस् र यसको सिधा किनारामा रेखा कोर्नुहोस्। किताबको किनारा पनि सीधा हुन्छ!',
      recommendedTool: 'book',
    },
    {
      id: 3,
      titleEn: 'Step 3: Try Freehand Without Any Object (हातले मात्र)',
      titleNp: 'अभ्यास ३: कुनै वस्तु बिना हातले मात्र कोरी हेरौँ',
      instructionEn: 'Select Freehand and try drawing straight. Notice how hands wobble without a straight edge!',
      instructionNp: 'हातले मात्र कोर्दा रेखा बाङ्गो हुन सक्छ। सिधा किनारा किन चाहिन्छ विचार गर्नुहोस्!',
      recommendedTool: 'freehand',
    },
    {
      id: 4,
      titleEn: 'Step 4: Rotate Objects for Slanted & Vertical Lines',
      titleNp: 'अभ्यास ४: वस्तु घुमाएर छड्के वा ठाडो सीधा रेखा कोर्नुहोस्',
      instructionEn: 'Rotate your object using the rotate button and draw straight lines in different directions!',
      instructionNp: 'घुमाउने बटन थिचेर रुलर वा बट्टालाई घुमाई छड्के वा ठाडो सीधा रेखा खिच्नुहोस्!',
      recommendedTool: 'box',
    },
  ];

  const currentActivity = activities[activityStep - 1] || activities[0];

  useEffect(() => {
    speakText(currentActivity.instructionNp, currentActivity.instructionEn);
  }, [activityStep, language]);

  // Redraw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lined notebook paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let y = 30; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    // Red left margin line
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 0);
    ctx.lineTo(60, canvas.height);
    ctx.stroke();

    // Draw saved lines
    lines.forEach((line) => {
      if (line.points.length < 2) return;
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(line.points[0].x, line.points[0].y);
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      ctx.stroke();
    });

    // Draw current active stroke
    if (currentStroke.length > 1) {
      ctx.strokeStyle = activeTool === 'freehand' ? '#ef4444' : '#2563eb';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
    }
  }, [lines, currentStroke]);

  // Pointer event helpers
  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
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
    const pos = getCanvasPos(e);

    if (activeTool !== 'freehand') {
      // Snap start point to the edge of the object
      const startX = objectPos.x;
      const startY = objectPos.y;
      setCurrentStroke([{ x: startX, y: startY }]);
    } else {
      setCurrentStroke([pos]);
    }
    playTone(500);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getCanvasPos(e);

    if (activeTool !== 'freehand') {
      // Constrained drawing along the object's edge
      const rad = (objectRotation * Math.PI) / 180;
      const length = 320; // length of ruler/book edge

      // Project pointer along object axis
      const dx = pos.x - objectPos.x;
      const dy = pos.y - objectPos.y;
      const proj = dx * Math.cos(rad) + dy * Math.sin(rad);
      const clampedProj = Math.max(0, Math.min(length, proj));

      const snappedX = objectPos.x + clampedProj * Math.cos(rad);
      const snappedY = objectPos.y + clampedProj * Math.sin(rad);

      setCurrentStroke((prev) => {
        if (prev.length === 0) return [{ x: snappedX, y: snappedY }];
        return [prev[0], { x: snappedX, y: snappedY }];
      });
      playTone(600);
    } else {
      // Organic wobbly hand stroke
      const wobble = (Math.random() - 0.5) * 4;
      setCurrentStroke((prev) => [...prev, { x: pos.x + wobble, y: pos.y + wobble }]);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length >= 2) {
      const isStraight = activeTool !== 'freehand';
      const newLine: DrawnLine = {
        id: `line_${Date.now()}`,
        toolUsed: activeTool,
        type: isStraight ? 'straight' : 'wobbly',
        color: isStraight ? '#2563eb' : '#dc2626',
        points: currentStroke,
        isStraight,
      };

      setLines((prev) => [...prev, newLine]);
      setCurrentStroke([]);

      if (isStraight) {
        playFanfare();
        setStars((prev) => prev + 2);
        setFeedbackMsg({
          np: 'स्याबास! सिधा किनारा प्रयोग गर्दा रेखा एकदम सीधा बन्यो!',
          en: 'Superb! Using a straight edge produced a perfectly straight line!',
        });
        speakText(
          'स्याबास! सिधा किनारा प्रयोग गर्दा रेखा एकदम सीधा बन्यो!',
          'Superb! Using a straight edge produced a perfectly straight line!'
        );
        saveProgress(100);
      } else {
        setFeedbackMsg({
          np: 'हेर्नुहोस्, बिना वस्तु हातले मात्र कोर्दा रेखा बाङ्गो-टिङ्गो हुन सक्छ!',
          en: 'Notice that without a straight-edged object, lines can be wavy and wobbly!',
        });
        speakText(
          'हेर्नुहोस्, बिना वस्तु हातले मात्र कोर्दा रेखा बाङ्गो हुन सक्छ!',
          'Notice that without a straight-edged object, lines can be wavy and wobbly!'
        );
      }
    }
  };

  const handleResetCanvas = () => {
    setLines([]);
    setCurrentStroke([]);
    setFeedbackMsg(null);
  };

  const saveProgress = async (score: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH2-04/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, score),
          completedLevels: activityStep,
          totalLevels: 4,
          starsEarned: stars + 2,
          timeSpentSeconds: 100,
        }),
      });
    } catch (e) {}
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fef9c3 0%, #e0f2fe 50%, #f1f5f9 100%)',
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
              {language === 'np' ? 'वस्तुको प्रयोग गरी रेखा कोरौँ' : 'Draw with Real Objects'}
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

          {/* Steps */}
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
            {[1, 2, 3, 4].map((step) => (
              <button
                key={step}
                onClick={() => {
                  setActivityStep(step);
                  if (step === 1) setActiveTool('ruler');
                  if (step === 2) setActiveTool('book');
                  if (step === 3) setActiveTool('freehand');
                  if (step === 4) setActiveTool('box');
                }}
                style={{
                  background: activityStep === step ? '#d97706' : 'transparent',
                  color: activityStep === step ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {language === 'np' ? `चरण ${step}` : `Step ${step}`}
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
        {/* Left Control Drawer */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Mission description */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
            }}
          >
            <h2 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              {language === 'np' ? currentActivity.titleNp : currentActivity.titleEn}
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#334155',
                lineHeight: 1.5,
                margin: '0 0 16px 0',
                background: '#fef3c7',
                padding: '12px',
                borderRadius: '12px',
                borderLeft: '4px solid #d97706',
              }}
            >
              {language === 'np' ? currentActivity.instructionNp : currentActivity.instructionEn}
            </p>

            <button
              onClick={() => speakText(currentActivity.instructionNp, currentActivity.instructionEn)}
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
              <Volume2 size={16} /> {language === 'np' ? 'सुन्नुहोस् (Listen)' : 'Listen'}
            </button>
          </div>

          {/* Real Objects Tool Picker */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
            }}
          >
            <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#475569' }}>
              {language === 'np' ? 'वस्तु छान्नुहोस् (Pick Object)' : 'Choose Drawing Tool'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Ruler */}
              <button
                onClick={() => {
                  setActiveTool('ruler');
                  speakText('काठको रुलर: सीधा किनारा भएको वस्तु', 'Wooden Ruler with straight edge');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeTool === 'ruler' ? '#fef3c7' : '#f8fafc',
                  border: activeTool === 'ruler' ? '3px solid #d97706' : '2px solid #e2e8f0',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#fde68a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#92400e',
                  }}
                >
                  <Compass size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    {language === 'np' ? 'काठको रुलर (Ruler)' : 'Wooden Ruler'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                    {language === 'np' ? '✓ सिधा किनारा (Straight Edge)' : '✓ Straight Edge'}
                  </div>
                </div>
              </button>

              {/* Textbook */}
              <button
                onClick={() => {
                  setActiveTool('book');
                  speakText('गणित किताबको सिधा किनारा', 'Mathematics Textbook edge');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeTool === 'book' ? '#dbeafe' : '#f8fafc',
                  border: activeTool === 'book' ? '3px solid #2563eb' : '2px solid #e2e8f0',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1e40af',
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    {language === 'np' ? 'किताब (Book Edge)' : 'Textbook Edge'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                    {language === 'np' ? '✓ सिधा किनारा (Straight Edge)' : '✓ Straight Edge'}
                  </div>
                </div>
              </button>

              {/* Wooden Pencil Box */}
              <button
                onClick={() => {
                  setActiveTool('box');
                  speakText('काठको सिधा पेन्सिल बट्टा', 'Wooden Pencil Box edge');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeTool === 'box' ? '#ede9fe' : '#f8fafc',
                  border: activeTool === 'box' ? '3px solid #7c3aed' : '2px solid #e2e8f0',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#ddd6fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#5b21b6',
                  }}
                >
                  <Box size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    {language === 'np' ? 'पेन्सिल बट्टा (Box)' : 'Pencil Box'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                    {language === 'np' ? '✓ सिधा किनारा (Straight Edge)' : '✓ Straight Edge'}
                  </div>
                </div>
              </button>

              {/* Freehand contrast */}
              <button
                onClick={() => {
                  setActiveTool('freehand');
                  speakText('हातले मात्र (बिना कुनै वस्तु)', 'Freehand drawing without objects');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeTool === 'freehand' ? '#fee2e2' : '#f8fafc',
                  border: activeTool === 'freehand' ? '3px solid #dc2626' : '2px dashed #cbd5e1',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#fecaca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#b91c1c',
                  }}
                >
                  <Pencil size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    {language === 'np' ? 'हातले मात्र (Freehand)' : 'Freehand (No Object)'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>
                    {language === 'np' ? '✗ बिना सिधा किनारा (Wobbly)' : '✗ No straight guide'}
                  </div>
                </div>
              </button>
            </div>

            {/* Rotation Control for active straight edge */}
            {activeTool !== 'freehand' && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>
                    {language === 'np' ? 'वस्तु घुमाउनुहोस् (Rotate)' : 'Rotate Object'}
                  </span>
                  <button
                    onClick={() => {
                      setObjectRotation((prev) => (prev + 45) % 180);
                      playTone(400);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCw size={14} /> {objectRotation}°
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleResetCanvas}
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                color: '#e11d48',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={16} /> {language === 'np' ? 'कापी सफा गर्नुस्' : 'Clear Paper'}
            </button>
          </div>
        </aside>

        {/* Right Canvas / Desk Environment */}
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
          {/* Header Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b' }}>
              {language === 'np'
                ? `खिचिएका रेखाहरू: ${lines.length} (सीधा: ${lines.filter((l) => l.isStraight).length}, बाङ्गो: ${lines.filter((l) => !l.isStraight).length})`
                : `Drawn Lines: ${lines.length} (Straight: ${lines.filter((l) => l.isStraight).length}, Freehand: ${lines.filter((l) => !l.isStraight).length})`}
            </span>

            {feedbackMsg && (
              <span
                style={{
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                }}
              >
                {language === 'np' ? feedbackMsg.np : feedbackMsg.en}
              </span>
            )}
          </div>

          {/* Interactive Desk Paper Surface */}
          <div
            style={{
              flex: 1,
              minHeight: '440px',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
              border: '2px solid #cbd5e1',
            }}
          >
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
              }}
            />

            {/* Overlay Real Object (Ruler, Book, or Box) positioned on desk */}
            {activeTool !== 'freehand' && (
              <div
                style={{
                  position: 'absolute',
                  left: `${objectPos.x}px`,
                  top: `${objectPos.y}px`,
                  width: '320px',
                  height: activeTool === 'ruler' ? '50px' : activeTool === 'book' ? '120px' : '75px',
                  transformOrigin: '0 0',
                  transform: `rotate(${objectRotation}deg)`,
                  background:
                    activeTool === 'ruler'
                      ? 'linear-gradient(180deg, #d97706 0%, #b45309 100%)'
                      : activeTool === 'book'
                      ? 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)'
                      : 'linear-gradient(180deg, #9333ea 0%, #7e22ce 100%)',
                  borderRadius: '4px',
                  boxShadow: '4px 8px 20px rgba(0,0,0,0.3)',
                  pointerEvents: 'none',
                  borderTop: '3px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                }}
              >
                <span>
                  {activeTool === 'ruler'
                    ? '📏 Wooden Ruler'
                    : activeTool === 'book'
                    ? '📘 Math Textbook'
                    : '📦 Pencil Box'}
                </span>
                <span style={{ fontSize: '11px', opacity: 0.85 }}>
                  {language === 'np' ? 'यहाँ कोर्नुहोस् ⬆' : 'Draw along top edge ⬆'}
                </span>
              </div>
            )}
          </div>

          {/* Footer controls */}
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
                  ? 'वस्तुको सिधा किनारामा पेन्सिल तान्नुहोस्।'
                  : 'Drag along the straight edge with your pencil.'}
              </span>
            </div>

            {activityStep < 4 ? (
              <button
                onClick={() => setActivityStep(activityStep + 1)}
                style={{
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 16px rgba(217, 119, 6, 0.3)',
                }}
              >
                {language === 'np' ? 'अर्को अभ्यास' : 'Next Step'}
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={onBackToLibrary}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Trophy size={18} />
                {language === 'np' ? 'सम्पन्न भयो (Library)' : 'Finish & Return'}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
export default DrawWithObjectsSimulation;

