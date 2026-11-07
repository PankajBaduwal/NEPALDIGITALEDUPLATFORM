/**
 * ShapeColoringSimulation.tsx
 * Simulation 03: Colour the Shapes (आकारहरूमा रङ भरौँ)
 * Class 1 Mathematics - Chapter 3: Geometrical Shapes (ज्यामितीय आकारहरू)
 * Based on Nepal CDC Curriculum (मेरो गणित, कक्षा १ - २०७६)
 * Textbook Color Rules:
 *  - Triangle (त्रिभुज) = RED (रातो)
 *  - Quadrilateral (चतुर्भुज) = BLUE (निलो)
 *  - Circle (वृत्त) = GREEN (हरियो)
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Palette,
  Eraser,
  Undo2,
  HelpCircle,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

type ShapeType = 'circle' | 'triangle' | 'quadrilateral';
type ColorChoice = 'red' | 'blue' | 'green' | null;

interface ColoredShapeItem {
  id: string;
  nameEn: string;
  nameNp: string;
  shapeType: ShapeType;
  d: string; // SVG path
  currentColor: ColorChoice;
  isCorrect?: boolean;
}

interface ColoringScene {
  id: string;
  titleEn: string;
  titleNp: string;
  instructionEn: string;
  instructionNp: string;
  shapes: ColoredShapeItem[];
}

export const ShapeColoringSimulation: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Selected coloring brush
  const [activeBrush, setActiveBrush] = useState<'red' | 'blue' | 'green' | 'eraser'>('red');

  // Multi-scene progression
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [history, setHistory] = useState<Record<string, ColorChoice>[]>([]);

  // Scores
  const [stars, setStars] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

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

  const playTone = (type: 'paint' | 'success' | 'click' | 'error') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'paint') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.1 + 0.35);
          o.start(ctx.currentTime + i * 0.1);
          o.stop(ctx.currentTime + i * 0.1 + 0.35);
        });
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {}
  };

  // Scenes list
  const scenes: ColoringScene[] = [
    // Scene 1: Basic Shapes Gallery
    {
      id: 'sc1_gallery',
      titleEn: 'Basic Shapes Gallery',
      titleNp: 'साधारण आकारहरू',
      instructionEn: 'Color: Triangle = RED, Quadrilateral = BLUE, Circle = GREEN!',
      instructionNp: 'पाठ्यपुस्तक नियम: त्रिभुजमा रातो, चतुर्भुजमा निलो र वृत्तमा हरियो रङ भरौँ!',
      shapes: [
        { id: 's1_tri1', nameEn: 'Equilateral Triangle', nameNp: 'त्रिभुज १', shapeType: 'triangle', d: 'M 140,80 L 220,220 L 60,220 Z', currentColor: null },
        { id: 's1_circle1', nameEn: 'Circle', nameNp: 'वृत्त १', shapeType: 'circle', d: 'M 350,150 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0', currentColor: null },
        { id: 's1_quad1', nameEn: 'Rectangle', nameNp: 'चतुर्भुज १', shapeType: 'quadrilateral', d: 'M 440,90 L 580,90 L 580,210 L 440,210 Z', currentColor: null },
        { id: 's1_quad2', nameEn: 'Square', nameNp: 'चतुर्भुज २', shapeType: 'quadrilateral', d: 'M 90,290 L 210,290 L 210,410 L 90,410 Z', currentColor: null },
        { id: 's1_tri2', nameEn: 'Right Triangle', nameNp: 'त्रिभुज २', shapeType: 'triangle', d: 'M 260,290 L 400,410 L 260,410 Z', currentColor: null },
        { id: 's1_circle2', nameEn: 'Small Circle', nameNp: 'सानो वृत्त', shapeType: 'circle', d: 'M 490,350 m -45,0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0', currentColor: null },
      ],
    },

    // Scene 2: Village House & Sun
    {
      id: 'sc2_house',
      titleEn: 'Village House & Sun',
      titleNp: 'गाउँको घर र सूर्य',
      instructionEn: 'Triangle roof = RED, Quadrilateral walls/door = BLUE, Round sun/attic = GREEN!',
      instructionNp: 'त्रिभुज छानामा रातो, चतुर्भुज भित्ता/ढोकामा निलो, र गोलो घाममा हरियो रङ लगाउनुहोस्!',
      shapes: [
        // Sun
        { id: 'h_sun', nameEn: 'Sun', nameNp: 'सूर्य (वृत्त)', shapeType: 'circle', d: 'M 110,90 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0', currentColor: null },
        // Roof
        { id: 'h_roof', nameEn: 'Triangular Roof', nameNp: 'छाना (त्रिभुज)', shapeType: 'triangle', d: 'M 320,80 L 480,210 L 160,210 Z', currentColor: null },
        // Attic round window
        { id: 'h_attic', nameEn: 'Attic Window', nameNp: 'छानाको गोलो झ्याल (वृत्त)', shapeType: 'circle', d: 'M 320,165 m -22,0 a 22,22 0 1,0 44,0 a 22,22 0 1,0 -44,0', currentColor: null },
        // Main House Body (quadrilateral)
        { id: 'h_body', nameEn: 'House Wall', nameNp: 'घरको भित्ता (चतुर्भुज)', shapeType: 'quadrilateral', d: 'M 190,210 L 450,210 L 450,420 L 190,420 Z', currentColor: null },
        // Door
        { id: 'h_door', nameEn: 'Door', nameNp: 'ढोका (चतुर्भुज)', shapeType: 'quadrilateral', d: 'M 285,310 L 355,310 L 355,420 L 285,420 Z', currentColor: null },
        // Window Left
        { id: 'h_win_l', nameEn: 'Left Window', nameNp: 'देब्रे झ्याल (चतुर्भुज)', shapeType: 'quadrilateral', d: 'M 215,250 L 265,250 L 265,300 L 215,300 Z', currentColor: null },
        // Window Right
        { id: 'h_win_r', nameEn: 'Right Window', nameNp: 'दाहिने झ्याल (चतुर्भुज)', shapeType: 'quadrilateral', d: 'M 375,250 L 425,250 L 425,300 L 375,300 Z', currentColor: null },
      ],
    },

    // Scene 3: School Bus
    {
      id: 'sc3_bus',
      titleEn: 'School Bus (विद्यालय बस)',
      titleNp: 'विद्यालय बस',
      instructionEn: 'Bus body/windows = BLUE, wheels = GREEN, front hood/flag = RED!',
      instructionNp: 'बसको शरीर/झ्याल (चतुर्भुज) = निलो, पाङ्ग्रा (वृत्त) = हरियो, झन्डा (त्रिभुज) = रातो!',
      shapes: [
        // Bus flag (Triangle)
        { id: 'b_flag', nameEn: 'Bus Flag', nameNp: 'बसको झन्डा (त्रिभुज)', shapeType: 'triangle', d: 'M 140,110 L 200,150 L 140,150 Z', currentColor: null },
        // Bus Main Body (Quadrilateral)
        { id: 'b_body', nameEn: 'Bus Body', nameNp: 'बसको शरीर (चतुर्भुज)', shapeType: 'quadrilateral', d: 'M 100,160 L 500,160 L 500,340 L 100,340 Z', currentColor: null },
        // Front Hood (Triangle slope)
        { id: 'b_hood', nameEn: 'Front Hood Wedge', nameNp: 'अघिल्लो भाग (त्रिभुज)', shapeType: 'triangle', d: 'M 500,240 L 560,340 L 500,340 Z', currentColor: null },
        // Windows (Quadrilaterals)
        { id: 'b_w1', nameEn: 'Window 1', nameNp: 'झ्याल १ (चतुर्भुज)', shapeType: 'quadrilateral', d: 'M 140,190 L 200,190 L 200,245 L 140,245 Z', currentColor: null },
        { id: 'b_w2', nameEn: 'Window 2', nameNp: 'झ्याल २ (चतुर्भुज)', shapeType: 'quadrilateral', d: 'M 230,190 L 290,190 L 290,245 L 230,245 Z', currentColor: null },
        { id: 'b_w3', nameEn: 'Window 3', nameNp: 'झ्याल ३ (चतुर्भुज)', shapeType: 'quadrilateral', d: 'M 320,190 L 380,190 L 380,245 L 320,245 Z', currentColor: null },
        { id: 'b_w4', nameEn: 'Window 4', nameNp: 'झ्याल ४ (चतुर्भुज)', shapeType: 'quadrilateral', d: 'M 410,190 L 470,190 L 470,245 L 410,245 Z', currentColor: null },
        // Wheels (Circles)
        { id: 'b_wh1', nameEn: 'Front Wheel', nameNp: 'अघिल्लो पाङ्ग्रा (वृत्त)', shapeType: 'circle', d: 'M 440,360 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0', currentColor: null },
        { id: 'b_wh2', nameEn: 'Rear Wheel', nameNp: 'पछिल्लो पाङ्ग्रा (वृत्त)', shapeType: 'circle', d: 'M 200,360 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0', currentColor: null },
      ],
    },

    // Scene 4: Friendly Robot
    {
      id: 'sc4_robot',
      titleEn: 'Friendly Robot (रोबोट)',
      titleNp: 'रमाइलो रोबोट',
      instructionEn: 'Head/chest = BLUE, ears/feet = RED, round eyes/buttons = GREEN!',
      instructionNp: 'टाउको र छाती (चतुर्भुज) = निलो, कान र खुट्टा (त्रिभुज) = रातो, आँखा (वृत्त) = हरियो!',
      shapes: [
        // Ears (Triangles)
        { id: 'r_ear_l', nameEn: 'Left Ear', nameNp: 'देब्रे कान (त्रिभुज)', shapeType: 'triangle', d: 'M 220,110 L 250,70 L 250,110 Z', currentColor: null },
        { id: 'r_ear_r', nameEn: 'Right Ear', nameNp: 'दाहिने कान (त्रिभुज)', shapeType: 'triangle', d: 'M 350,70 L 380,110 L 350,110 Z', currentColor: null },
        // Head (Quadrilateral)
        { id: 'r_head', nameEn: 'Robot Head', nameNp: 'रोबोटको टाउको (चतुर्भुज)', shapeType: 'quadrilateral', d: 'M 230,110 L 370,110 L 370,210 L 230,210 Z', currentColor: null },
        // Eyes (Circles)
        { id: 'r_eye_l', nameEn: 'Left Eye', nameNp: 'देब्रे आँखा (वृत्त)', shapeType: 'circle', d: 'M 270,150 m -18,0 a 18,18 0 1,0 36,0 a 18,18 0 1,0 -36,0', currentColor: null },
        { id: 'r_eye_r', nameEn: 'Right Eye', nameNp: 'दाहिने आँखा (वृत्त)', shapeType: 'circle', d: 'M 330,150 m -18,0 a 18,18 0 1,0 36,0 a 18,18 0 1,0 -36,0', currentColor: null },
        // Body (Quadrilateral)
        { id: 'r_body', nameEn: 'Robot Torso', nameNp: 'रोबोटको छाती (चतुर्भुज)', shapeType: 'quadrilateral', d: 'M 200,230 L 400,230 L 400,390 L 200,390 Z', currentColor: null },
        // Belly Button (Circle)
        { id: 'r_btn', nameEn: 'Belly Button', nameNp: 'पेटको बटन (वृत्त)', shapeType: 'circle', d: 'M 300,310 m -24,0 a 24,24 0 1,0 48,0 a 24,24 0 1,0 -48,0', currentColor: null },
        // Feet (Triangles)
        { id: 'r_foot_l', nameEn: 'Left Foot', nameNp: 'देब्रे खुट्टा (त्रिभुज)', shapeType: 'triangle', d: 'M 220,390 L 280,390 L 250,450 Z', currentColor: null },
        { id: 'r_foot_r', nameEn: 'Right Foot', nameNp: 'दाहिने खुट्टा (त्रिभुज)', shapeType: 'triangle', d: 'M 320,390 L 380,390 L 350,450 Z', currentColor: null },
      ],
    },
  ];

  const [activeScene, setActiveScene] = useState<ColoringScene>(scenes[0]);

  // Sync active scene
  useEffect(() => {
    const sceneCopy = JSON.parse(JSON.stringify(scenes[currentSceneIdx]));
    setActiveScene(sceneCopy);
    setHistory([]);
    speakText(sceneCopy.instructionNp, sceneCopy.instructionEn);
  }, [currentSceneIdx, language]);

  // Color shape handler
  const handleShapeClick = (shapeId: string) => {
    playTone('paint');

    // Save history
    const currentColors: Record<string, ColorChoice> = {};
    activeScene.shapes.forEach((s) => {
      currentColors[s.id] = s.currentColor;
    });
    setHistory((prev) => [...prev, currentColors]);

    const updated = activeScene.shapes.map((item) => {
      if (item.id === shapeId) {
        if (activeBrush === 'eraser') {
          return { ...item, currentColor: null, isCorrect: undefined };
        }

        // Textbook evaluation rule:
        // Triangle = Red, Quadrilateral = Blue, Circle = Green
        const isCorrect =
          (activeBrush === 'red' && item.shapeType === 'triangle') ||
          (activeBrush === 'blue' && item.shapeType === 'quadrilateral') ||
          (activeBrush === 'green' && item.shapeType === 'circle');

        return {
          ...item,
          currentColor: activeBrush,
          isCorrect,
        };
      }
      return item;
    });

    setActiveScene({
      ...activeScene,
      shapes: updated,
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prevHistory = [...history];
    const lastState = prevHistory.pop()!;
    setHistory(prevHistory);

    const reverted = activeScene.shapes.map((item) => {
      const col = lastState[item.id] || null;
      const isCorrect = col
        ? (col === 'red' && item.shapeType === 'triangle') ||
          (col === 'blue' && item.shapeType === 'quadrilateral') ||
          (col === 'green' && item.shapeType === 'circle')
        : undefined;
      return { ...item, currentColor: col, isCorrect };
    });

    setActiveScene({ ...activeScene, shapes: reverted });
    playTone('click');
  };

  const handleReset = () => {
    playTone('click');
    const resetShapes = activeScene.shapes.map((s) => ({
      ...s,
      currentColor: null,
      isCorrect: undefined,
    }));
    setActiveScene({ ...activeScene, shapes: resetShapes });
    setHistory([]);
  };

  const handleCheckAnswers = () => {
    const uncolored = activeScene.shapes.filter((s) => !s.currentColor);
    if (uncolored.length > 0) {
      playTone('error');
      speakText('कृपया सबै आकारहरूमा रङ भर्नुहोस्!', 'Please color all shapes first!');
      return;
    }

    const wrong = activeScene.shapes.filter((s) => {
      return !(
        (s.currentColor === 'red' && s.shapeType === 'triangle') ||
        (s.currentColor === 'blue' && s.shapeType === 'quadrilateral') ||
        (s.currentColor === 'green' && s.shapeType === 'circle')
      );
    });

    if (wrong.length === 0) {
      playTone('success');
      setStars((s) => s + 4);
      setShowCelebration(true);
      speakText(
        'स्याबास! त्रिभुजमा रातो, चतुर्भुजमा निलो र वृत्तमा हरियो रङ एकदम सही छ!',
        'Splendid! Triangles in Red, Quadrilaterals in Blue, and Circles in Green!'
      );
      saveProgress(100);
    } else {
      playTone('error');
      speakText(
        'केही आकारको रङ मिलेन। त्रिभुजमा रातो, चतुर्भुजमा निलो र वृत्तमा हरियो हुनुपर्छ।',
        'Some colors are not correct. Triangles must be Red, Quadrilaterals Blue, and Circles Green.'
      );
    }
  };

  const handleNextScene = () => {
    setShowCelebration(false);
    if (currentSceneIdx + 1 < scenes.length) {
      setCurrentSceneIdx((idx) => idx + 1);
    } else {
      speakText('बधाई छ! तपाईंले सबै चित्रहरू रङ्गाउनुभयो!', 'Congratulations! You colored all pictures!');
    }
  };

  const saveProgress = async (score: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH3-03/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, score),
          completedLevels: currentSceneIdx + 1,
          totalLevels: scenes.length,
          starsEarned: stars + 4,
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
        background: 'linear-gradient(135deg, #fef2f2 0%, #eff6ff 50%, #f0fdf4 100%)',
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
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>
              {language === 'np' ? 'आकारहरूमा रङ भरौँ' : 'Colour the Shapes'}
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {language === 'np' ? 'कक्षा १ गणित • अध्याय ३: ज्यामितीय आकारहरू' : 'Class 1 Math • Chapter 3: Geometrical Shapes'}
            </span>
          </div>
        </div>

        {/* Status & Scene Selector */}
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
            {scenes.map((sc, i) => (
              <button
                key={sc.id}
                onClick={() => {
                  setCurrentSceneIdx(i);
                  playTone('click');
                }}
                style={{
                  background: currentSceneIdx === i ? '#dc2626' : 'transparent',
                  color: currentSceneIdx === i ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {i + 1}
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
          {/* Mission Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              {language === 'np' ? activeScene.titleNp : activeScene.titleEn}
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: '#334155',
                lineHeight: 1.5,
                margin: '0 0 14px 0',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '12px',
                borderLeft: '4px solid #dc2626',
              }}
            >
              {language === 'np' ? activeScene.instructionNp : activeScene.instructionEn}
            </p>

            <button
              onClick={() => speakText(activeScene.instructionNp, activeScene.instructionEn)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center',
                background: '#fee2e2',
                color: '#b91c1c',
                border: 'none',
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Volume2 size={16} /> {language === 'np' ? 'नियम सुन्नुहोस्' : 'Listen Rule'}
            </button>
          </div>

          {/* Textbook Color Palette */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
            }}
          >
            <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#475569' }}>
              {language === 'np' ? 'पाठ्यपुस्तक रङ नियम' : 'Textbook Color Rules'}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Red - Triangle */}
              <button
                onClick={() => {
                  setActiveBrush('red');
                  playTone('click');
                  speakText('रातो रङ: त्रिभुजका लागि', 'Red Color for Triangles');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeBrush === 'red' ? '#fee2e2' : '#f8fafc',
                  border: activeBrush === 'red' ? '3px solid #dc2626' : '2px solid #e2e8f0',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dc2626' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#991b1b' }}>
                    {language === 'np' ? 'रातो रङ (Red)' : 'Red Color'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>
                    {language === 'np' ? '🔺 त्रिभुज (Triangle)' : '🔺 For Triangles'}
                  </div>
                </div>
              </button>

              {/* Blue - Quadrilateral */}
              <button
                onClick={() => {
                  setActiveBrush('blue');
                  playTone('click');
                  speakText('निलो रङ: चतुर्भुजका लागि', 'Blue Color for Quadrilaterals');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeBrush === 'blue' ? '#dbeafe' : '#f8fafc',
                  border: activeBrush === 'blue' ? '3px solid #2563eb' : '2px solid #e2e8f0',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e40af' }}>
                    {language === 'np' ? 'निलो रङ (Blue)' : 'Blue Color'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 700 }}>
                    {language === 'np' ? '🟦 चतुर्भुज (Quadrilateral)' : '🟦 For Quadrilaterals'}
                  </div>
                </div>
              </button>

              {/* Green - Circle */}
              <button
                onClick={() => {
                  setActiveBrush('green');
                  playTone('click');
                  speakText('हरियो रङ: वृत्तका लागि', 'Green Color for Circles');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeBrush === 'green' ? '#dcfce7' : '#f8fafc',
                  border: activeBrush === 'green' ? '3px solid #16a34a' : '2px solid #e2e8f0',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#16a34a' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#166534' }}>
                    {language === 'np' ? 'हरियो रङ (Green)' : 'Green Color'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>
                    {language === 'np' ? '🟢 वृत्त (Circle)' : '🟢 For Circles'}
                  </div>
                </div>
              </button>

              {/* Eraser */}
              <button
                onClick={() => {
                  setActiveBrush('eraser');
                  playTone('click');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeBrush === 'eraser' ? '#f1f5f9' : '#ffffff',
                  border: activeBrush === 'eraser' ? '3px solid #64748b' : '2px dashed #cbd5e1',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475569',
                  }}
                >
                  <Eraser size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#334155' }}>
                    {language === 'np' ? 'इरेजर (Eraser)' : 'Eraser'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {language === 'np' ? 'रङ हटाउनुहोस्' : 'Clear a shape'}
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
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
                  fontSize: '12px',
                  fontWeight: 700,
                  color: history.length === 0 ? '#94a3b8' : '#334155',
                  cursor: history.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <Undo2 size={15} /> {language === 'np' ? 'पछाडि' : 'Undo'}
              </button>
              <button
                onClick={handleReset}
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
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#e11d48',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={15} /> {language === 'np' ? 'खाली' : 'Reset'}
              </button>
            </div>
          </div>
        </aside>

        {/* Right Canvas Area */}
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
                {language === 'np' ? 'त्रिभुज = रातो 🔴' : 'Triangle = Red 🔴'}
              </span>
              <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
                {language === 'np' ? 'चतुर्भुज = निलो 🟦' : 'Quadrilateral = Blue 🟦'}
              </span>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
                {language === 'np' ? 'वृत्त = हरियो 🟢' : 'Circle = Green 🟢'}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>
              {language === 'np'
                ? `रङ भरिएका आकारहरू: ${activeScene.shapes.filter((s) => s.currentColor).length} / ${activeScene.shapes.length}`
                : `Colored Shapes: ${activeScene.shapes.filter((s) => s.currentColor).length} / ${activeScene.shapes.length}`}
            </div>
          </div>

          {/* Interactive SVG Coloring Canvas */}
          <div
            style={{
              flex: 1,
              minHeight: '440px',
              background: '#f8fafc',
              borderRadius: '18px',
              border: '2px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg
              viewBox="0 0 640 480"
              style={{
                width: '100%',
                maxHeight: '480px',
                cursor: activeBrush === 'eraser' ? 'crosshair' : 'pointer',
              }}
            >
              <defs>
                <pattern id="shapeDotGrid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="3" cy="3" r="1.5" fill="#e2e8f0" />
                </pattern>
              </defs>
              <rect width="640" height="480" fill="url(#shapeDotGrid)" />

              {/* Render Shape Paths */}
              {activeScene.shapes.map((item) => {
                let fillColor = '#ffffff';
                let strokeColor = '#334155';

                if (item.currentColor === 'red') {
                  fillColor = '#ef4444';
                  strokeColor = '#b91c1c';
                } else if (item.currentColor === 'blue') {
                  fillColor = '#3b82f6';
                  strokeColor = '#1d4ed8';
                } else if (item.currentColor === 'green') {
                  fillColor = '#22c55e';
                  strokeColor = '#15803d';
                }

                return (
                  <path
                    key={item.id}
                    d={item.d}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    onClick={() => handleShapeClick(item.id)}
                    style={{
                      transition: 'fill 0.2s ease, transform 0.15s ease',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Footer Controls */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {language === 'np' ? 'आकारमा थिचेर रङ भर्नुहोस्।' : 'Tap any shape to apply the selected colour.'}
            </span>

            <button
              onClick={handleCheckAnswers}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 20px rgba(16,185,129,0.35)',
              }}
            >
              <CheckCircle2 size={20} />
              {language === 'np' ? 'जाँच्नुहोस् (Check)' : 'Check My Coloring'}
            </button>
          </div>

          {/* Celebration Dialog Modal */}
          {showCelebration && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(6px)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                padding: '20px',
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  padding: '36px',
                  textAlign: 'center',
                  maxWidth: '420px',
                  width: '100%',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                  }}
                >
                  <Trophy size={44} color="#f59e0b" />
                </div>

                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>
                  {language === 'np' ? 'स्याबास! धेरै राम्रो!' : 'Great Job! Perfect!'}
                </h2>
                <p style={{ fontSize: '15px', color: '#475569', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                  {language === 'np'
                    ? 'तपाईंले त्रिभुजमा रातो, चतुर्भुजमा निलो र वृत्तमा हरियो रङ ठिकसँग भर्नुभयो।'
                    : 'You accurately colored Triangles Red, Quadrilaterals Blue, and Circles Green!'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
                  {[1, 2, 3].map((s) => (
                    <Sparkles key={s} size={32} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>

                <button
                  onClick={handleNextScene}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: '16px',
                    width: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {language === 'np' ? 'अर्को चित्रमा जानुहोस्' : 'Continue to Next Picture'}
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
export default ShapeColoringSimulation;

