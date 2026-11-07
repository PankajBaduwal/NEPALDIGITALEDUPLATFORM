/**
 * LineColoringSimulation.tsx
 * Simulation 02: Colour the Lines (रेखाहरूमा रङ भरौँ)
 * Class 1 Mathematics - Chapter 2: Lines (रेखाहरू)
 * Based on Nepal CDC Curriculum (मेरो गणित, कक्षा १ - २०७६)
 * Core Rule: Straight Lines = BLUE (निलो), Curved Lines = RED (रातो)
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
  Palette,
  Eraser,
  Undo2
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

type LineType = 'straight' | 'curved';
type ColorChoice = 'blue' | 'red' | null;

interface StrokeItem {
  id: string;
  nameEn: string;
  nameNp: string;
  type: LineType;
  d: string; // SVG path
  strokeWidth?: number;
  currentColor: ColorChoice;
  isCorrect?: boolean;
}

interface PictureScene {
  id: string;
  titleEn: string;
  titleNp: string;
  instructionEn: string;
  instructionNp: string;
  strokes: StrokeItem[];
}

export const LineColoringSimulation: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Selected tool
  const [activeColor, setActiveColor] = useState<'blue' | 'red' | 'eraser'>('blue');

  // Stage / Level State (1: Basic Lines, 2: Mixed Patterns, 3: Fun Pictures, 4: Assessment)
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [sceneIndex, setSceneIndex] = useState<number>(0);

  // History for undo
  const [history, setHistory] = useState<Record<string, ColorChoice>[]>([]);

  // Scores & Stars
  const [stars, setStars] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Audio synthesis
  const speakText = (npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Play audio tone
  const playSoundEffect = (type: 'paint' | 'success' | 'click' | 'error') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'paint') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'success') {
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.3); // C6
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start();
        osc.stop(now + 0.5);
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {}
  };

  // Define Scenes for each level
  // Level 1: Basic Lines
  const level1Scenes: PictureScene[] = [
    {
      id: 'l1_s1',
      titleEn: 'Basic Lines (Horizontal, Vertical & Curved)',
      titleNp: 'सीधा र बाङ्गो रेखाहरू',
      instructionEn: 'Color straight lines BLUE and curved lines RED!',
      instructionNp: 'सीधा रेखामा निलो (नीलो) र बाङ्गो रेखामा रातो रङ भरौँ!',
      strokes: [
        { id: 's1', nameEn: 'Horizontal Line', nameNp: 'तेर्सो सीधा रेखा', type: 'straight', d: 'M 100,100 L 400,100', strokeWidth: 10, currentColor: null },
        { id: 's2', nameEn: 'Curved Wave', nameNp: 'बाङ्गो छाल रेखा', type: 'curved', d: 'M 100,200 Q 250,120 400,200', strokeWidth: 10, currentColor: null },
        { id: 's3', nameEn: 'Vertical Line', nameNp: 'ठाडो सीधा रेखा', type: 'straight', d: 'M 150,280 L 150,480', strokeWidth: 10, currentColor: null },
        { id: 's4', nameEn: 'Curved Arc', nameNp: 'बाङ्गो अर्धवृत्त रेखा', type: 'curved', d: 'M 250,480 A 100,100 0 0,1 450,480', strokeWidth: 10, currentColor: null },
        { id: 's5', nameEn: 'Slanted Line', nameNp: 'छड्के सीधा रेखा', type: 'straight', d: 'M 350,280 L 520,380', strokeWidth: 10, currentColor: null },
      ],
    },
    {
      id: 'l1_s2',
      titleEn: 'More Simple Lines',
      titleNp: 'अरू साधारण रेखाहरू',
      instructionEn: 'Blue for straight, Red for curved!',
      instructionNp: 'सीधामा निलो, बाङ्गोमा रातो!',
      strokes: [
        { id: 's6', nameEn: 'Slanted Down', nameNp: 'छड्के सीधा रेखा', type: 'straight', d: 'M 100,120 L 300,240', strokeWidth: 10, currentColor: null },
        { id: 's7', nameEn: 'S-Curve', nameNp: 'बाङ्गो ‘S’ आकार रेखा', type: 'curved', d: 'M 350,100 C 450,150 280,250 420,300', strokeWidth: 10, currentColor: null },
        { id: 's8', nameEn: 'Straight Horizontal', nameNp: 'लामो तेर्सो सीधा रेखा', type: 'straight', d: 'M 120,340 L 500,340', strokeWidth: 10, currentColor: null },
        { id: 's9', nameEn: 'Deep Curve', nameNp: 'बाङ्गो खाल्टो रेखा', type: 'curved', d: 'M 140,420 Q 300,530 460,420', strokeWidth: 10, currentColor: null },
      ],
    },
  ];

  // Level 2: Mixed Patterns (From Textbook Page Activities)
  const level2Scenes: PictureScene[] = [
    {
      id: 'l2_s1',
      titleEn: 'Textbook Pattern 1: Ropes and Sticks',
      titleNp: 'पाठ्यपुस्तक अभ्यास: डोरी र लौरो',
      instructionEn: 'Straight stick lines are BLUE, curved rope lines are RED.',
      instructionNp: 'सीधा लौरोमा निलो र बाङ्गो डोरीमा रातो रङ लगाउनुहोस्।',
      strokes: [
        { id: 'm1', nameEn: 'Straight Stick 1', nameNp: 'सीधा लौरो १', type: 'straight', d: 'M 80,120 L 520,120', strokeWidth: 12, currentColor: null },
        { id: 'm2', nameEn: 'Wavy Rope 1', nameNp: 'बाङ्गो डोरी १', type: 'curved', d: 'M 80,220 Q 180,150 280,220 T 480,220', strokeWidth: 10, currentColor: null },
        { id: 'm3', nameEn: 'Slanted Stick', nameNp: 'छड्के लौरो', type: 'straight', d: 'M 120,480 L 300,280', strokeWidth: 12, currentColor: null },
        { id: 'm4', nameEn: 'Curved Snake Rope', nameNp: 'बाङ्गो घुमाउरो डोरी', type: 'curved', d: 'M 320,300 C 400,250 360,450 480,400', strokeWidth: 10, currentColor: null },
        { id: 'm5', nameEn: 'Straight Post', nameNp: 'सीधा खम्बा', type: 'straight', d: 'M 520,260 L 520,480', strokeWidth: 12, currentColor: null },
      ],
    },
  ];

  // Level 3: Everyday Composite Pictures (Ice Cream, Sailboat, House, Umbrella)
  const level3Scenes: PictureScene[] = [
    {
      id: 'l3_icecream',
      titleEn: 'Delicious Ice Cream (आइसक्रिम)',
      titleNp: 'मिठो आइसक्रिम',
      instructionEn: 'The cone has STRAIGHT edges (Blue). The scoops are CURVED (Red)!',
      instructionNp: 'आइसक्रिमको कोन सीधा रेखा (निलो) र माथिको गोलाकार बाङ्गो रेखा (रातो) हुन्छ!',
      strokes: [
        // Cone straight lines
        { id: 'ic_left', nameEn: 'Cone Left Side', nameNp: 'कोनको देब्रे सीधा रेखा', type: 'straight', d: 'M 200,260 L 300,480', strokeWidth: 10, currentColor: null },
        { id: 'ic_right', nameEn: 'Cone Right Side', nameNp: 'कोनको दाहिने सीधा रेखा', type: 'straight', d: 'M 400,260 L 300,480', strokeWidth: 10, currentColor: null },
        { id: 'ic_top', nameEn: 'Cone Top Rim', nameNp: 'कोनको मुखको सीधा रेखा', type: 'straight', d: 'M 200,260 L 400,260', strokeWidth: 10, currentColor: null },
        // Scoop curved lines
        { id: 'ic_scoop1', nameEn: 'Ice Cream Scoop Left', nameNp: 'आइसक्रिमको बाङ्गो देब्रे भाग', type: 'curved', d: 'M 200,260 C 180,180 260,160 300,190', strokeWidth: 10, currentColor: null },
        { id: 'ic_scoop2', nameEn: 'Ice Cream Scoop Right', nameNp: 'आइसक्रिमको बाङ्गो दाहिने भाग', type: 'curved', d: 'M 300,190 C 340,160 420,180 400,260', strokeWidth: 10, currentColor: null },
        { id: 'ic_cherry', nameEn: 'Cherry on Top', nameNp: 'माथिको बाङ्गो चेरी', type: 'curved', d: 'M 285,160 C 275,130 325,130 315,160', strokeWidth: 8, currentColor: null },
        { id: 'ic_cherry_stem', nameEn: 'Cherry Stem', nameNp: 'चेरीको बाङ्गो डाँठ', type: 'curved', d: 'M 300,135 Q 330,110 320,95', strokeWidth: 6, currentColor: null },
      ],
    },
    {
      id: 'l3_boat',
      titleEn: 'Sailboat on Water (डुङ्गा र नदी)',
      titleNp: 'तालमा डुङ्गा',
      instructionEn: 'Boat hull and mast have straight lines. Water waves are curved!',
      instructionNp: 'डुङ्गा र पालमा सीधा रेखा (निलो) र पानीको छालमा बाङ्गो रेखा (रातो) लगाउनुहोस्।',
      strokes: [
        // Boat Hull (straight lines)
        { id: 'bt_bottom', nameEn: 'Boat Bottom', nameNp: 'डुङ्गाको फेदको सीधा रेखा', type: 'straight', d: 'M 180,390 L 420,390', strokeWidth: 10, currentColor: null },
        { id: 'bt_bow', nameEn: 'Boat Bow', nameNp: 'डुङ्गाको अघिल्लो सीधा रेखा', type: 'straight', d: 'M 420,390 L 480,320', strokeWidth: 10, currentColor: null },
        { id: 'bt_deck', nameEn: 'Boat Deck', nameNp: 'डुङ्गाको माथिल्लो सीधा रेखा', type: 'straight', d: 'M 120,320 L 480,320', strokeWidth: 10, currentColor: null },
        { id: 'bt_stern', nameEn: 'Boat Stern', nameNp: 'डुङ्गाको पछिल्लो सीधा रेखा', type: 'straight', d: 'M 120,320 L 180,390', strokeWidth: 10, currentColor: null },
        // Mast & Sail (straight lines)
        { id: 'bt_mast', nameEn: 'Mast Pole', nameNp: 'पालको सीधा खम्बा', type: 'straight', d: 'M 290,130 L 290,320', strokeWidth: 10, currentColor: null },
        { id: 'bt_sail_diag', nameEn: 'Sail Edge', nameNp: 'पालको छड्के सीधा रेखा', type: 'straight', d: 'M 290,140 L 410,290', strokeWidth: 10, currentColor: null },
        { id: 'bt_sail_bottom', nameEn: 'Sail Bottom', nameNp: 'पालको तल्लो सीधा रेखा', type: 'straight', d: 'M 290,290 L 410,290', strokeWidth: 10, currentColor: null },
        // Water Waves (curved lines)
        { id: 'bt_wave1', nameEn: 'Top Water Wave', nameNp: 'पानीको माथिल्लो बाङ्गो छाल', type: 'curved', d: 'M 60,430 Q 140,410 220,430 T 380,430 T 540,430', strokeWidth: 8, currentColor: null },
        { id: 'bt_wave2', nameEn: 'Bottom Water Wave', nameNp: 'पानीको तल्लो बाङ्गो छाल', type: 'curved', d: 'M 80,480 Q 160,460 240,480 T 400,480 T 560,480', strokeWidth: 8, currentColor: null },
      ],
    },
    {
      id: 'l3_house',
      titleEn: 'Village House & Smoke (घर र धुवाँ)',
      titleNp: 'गाउँको घर र धुवाँ',
      instructionEn: 'House walls & roof are STRAIGHT (Blue). Chimney smoke is CURVED (Red)!',
      instructionNp: 'घरको भित्ता र छाना सीधा रेखा (निलो) र धुवाँ बाङ्गो रेखा (रातो) हुन्छ!',
      strokes: [
        // Roof
        { id: 'h_roof_l', nameEn: 'Roof Left', nameNp: 'छानाको देब्रे सीधा रेखा', type: 'straight', d: 'M 160,220 L 300,120', strokeWidth: 10, currentColor: null },
        { id: 'h_roof_r', nameEn: 'Roof Right', nameNp: 'छानाको दाहिने सीधा रेखा', type: 'straight', d: 'M 300,120 L 440,220', strokeWidth: 10, currentColor: null },
        { id: 'h_roof_b', nameEn: 'Roof Bottom', nameNp: 'छानाको तल्लो सीधा रेखा', type: 'straight', d: 'M 140,220 L 460,220', strokeWidth: 10, currentColor: null },
        // Walls
        { id: 'h_wall_l', nameEn: 'Left Wall', nameNp: 'देब्रे सीधा भित्ता', type: 'straight', d: 'M 180,220 L 180,420', strokeWidth: 10, currentColor: null },
        { id: 'h_wall_r', nameEn: 'Right Wall', nameNp: 'दाहिने सीधा भित्ता', type: 'straight', d: 'M 420,220 L 420,420', strokeWidth: 10, currentColor: null },
        { id: 'h_ground', nameEn: 'Ground Line', nameNp: 'भुइँको सीधा रेखा', type: 'straight', d: 'M 160,420 L 440,420', strokeWidth: 10, currentColor: null },
        // Door
        { id: 'h_door_l', nameEn: 'Door Left', nameNp: 'ढोकाको देब्रे सीधा भाग', type: 'straight', d: 'M 270,420 L 270,320', strokeWidth: 8, currentColor: null },
        { id: 'h_door_t', nameEn: 'Door Top', nameNp: 'ढोकाको माथिल्लो सीधा भाग', type: 'straight', d: 'M 270,320 L 330,320', strokeWidth: 8, currentColor: null },
        { id: 'h_door_r', nameEn: 'Door Right', nameNp: 'ढोकाको दाहिने सीधा भाग', type: 'straight', d: 'M 330,320 L 330,420', strokeWidth: 8, currentColor: null },
        // Smoke (Curved)
        { id: 'h_smoke1', nameEn: 'Smoke Curve 1', nameNp: 'धुवाँको बाङ्गो रेखा १', type: 'curved', d: 'M 380,140 Q 420,110 390,80', strokeWidth: 8, currentColor: null },
        { id: 'h_smoke2', nameEn: 'Smoke Curve 2', nameNp: 'धुवाँको बाङ्गो रेखा २', type: 'curved', d: 'M 390,80 Q 440,50 410,20', strokeWidth: 8, currentColor: null },
      ],
    },
  ];

  // Active Scene setup
  const [currentScene, setCurrentScene] = useState<PictureScene>(level1Scenes[0]);

  // Sync scene when level or scene index changes
  useEffect(() => {
    let targetList = level1Scenes;
    if (currentLevel === 2) targetList = level2Scenes;
    if (currentLevel === 3) targetList = level3Scenes;

    const idx = Math.min(sceneIndex, targetList.length - 1);
    const sceneCopy = JSON.parse(JSON.stringify(targetList[idx]));
    setCurrentScene(sceneCopy);
    setHistory([]);

    // Narrate instruction
    const tNp = sceneCopy.instructionNp;
    const tEn = sceneCopy.instructionEn;
    speakText(tNp, tEn);
  }, [currentLevel, sceneIndex, language]);

  // Handle stroke click / coloring
  const handleStrokeClick = (strokeId: string) => {
    playSoundEffect('paint');

    // Save history for undo
    const currentColors: Record<string, ColorChoice> = {};
    currentScene.strokes.forEach((s) => {
      currentColors[s.id] = s.currentColor;
    });
    setHistory((prev) => [...prev, currentColors]);

    const updatedStrokes = currentScene.strokes.map((stroke) => {
      if (stroke.id === strokeId) {
        if (activeColor === 'eraser') {
          return { ...stroke, currentColor: null, isCorrect: undefined };
        }
        const isCorrect =
          (activeColor === 'blue' && stroke.type === 'straight') ||
          (activeColor === 'red' && stroke.type === 'curved');

        return {
          ...stroke,
          currentColor: activeColor,
          isCorrect,
        };
      }
      return stroke;
    });

    setCurrentScene({
      ...currentScene,
      strokes: updatedStrokes,
    });
  };

  // Undo function
  const handleUndo = () => {
    if (history.length === 0) return;
    const prevHistory = [...history];
    const lastState = prevHistory.pop()!;
    setHistory(prevHistory);

    const revertedStrokes = currentScene.strokes.map((stroke) => {
      const col = lastState[stroke.id] || null;
      const isCorrect = col
        ? (col === 'blue' && stroke.type === 'straight') ||
          (col === 'red' && stroke.type === 'curved')
        : undefined;
      return {
        ...stroke,
        currentColor: col,
        isCorrect,
      };
    });

    setCurrentScene({
      ...currentScene,
      strokes: revertedStrokes,
    });
    playSoundEffect('click');
  };

  // Reset current drawing
  const handleResetScene = () => {
    playSoundEffect('click');
    const resetStrokes = currentScene.strokes.map((s) => ({
      ...s,
      currentColor: null,
      isCorrect: undefined,
    }));
    setCurrentScene({
      ...currentScene,
      strokes: resetStrokes,
    });
    setHistory([]);
  };

  // Check / Verify scene
  const handleCheckAnswers = () => {
    const uncolored = currentScene.strokes.filter((s) => !s.currentColor);
    if (uncolored.length > 0) {
      playSoundEffect('error');
      speakText('कृपया सबै रेखाहरूमा रङ भर्नुहोस्!', 'Please color all the lines first!');
      return;
    }

    const wrongStrokes = currentScene.strokes.filter((s) => {
      return !(
        (s.currentColor === 'blue' && s.type === 'straight') ||
        (s.currentColor === 'red' && s.type === 'curved')
      );
    });

    if (wrongStrokes.length === 0) {
      // 100% correct!
      playSoundEffect('success');
      setStars((prev) => prev + 3);
      setShowCelebration(true);
      speakText(
        'स्याबास! सीधा रेखामा निलो र बाङ्गो रेखामा रातो रङ सही छ!',
        'Excellent! Straight lines are Blue and Curved lines are Red!'
      );
      saveProgress(100);
    } else {
      playSoundEffect('error');
      speakText(
        `केही रेखाहरू मिलेनन्। सीधा रेखा निलो हुनुपर्छ र बाङ्गो रेखा रातो हुनुपर्छ।`,
        'Some lines are not correct. Straight lines must be Blue and curved lines Red.'
      );
    }
  };

  // Next Scene or Level
  const handleNextScene = () => {
    setShowCelebration(false);
    let targetList = level1Scenes;
    if (currentLevel === 2) targetList = level2Scenes;
    if (currentLevel === 3) targetList = level3Scenes;

    if (sceneIndex + 1 < targetList.length) {
      setSceneIndex(sceneIndex + 1);
    } else if (currentLevel < 3) {
      setCurrentLevel(currentLevel + 1);
      setSceneIndex(0);
    } else {
      // All levels done!
      speakText('बधाई छ! तपाईंले सबै रङ भर्ने चित्रहरू पूरा गर्नुभयो!', 'Congratulations! You completed all coloring levels!');
    }
  };

  // Save progress to backend
  const saveProgress = async (score: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH2-02/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, score),
          completedLevels: currentLevel,
          totalLevels: 3,
          starsEarned: stars + 3,
          timeSpentSeconds: 120,
        }),
      });
    } catch (err) {
      console.log('Progress save bypassed/offline');
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #fef3c7 50%, #fce7f3 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Fredoka', 'Mukta', 'Segoe UI', sans-serif",
        overflowX: 'hidden',
        color: '#1e293b',
      }}
    >
      {/* Header bar */}
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
              transition: 'all 0.2s',
            }}
          >
            <ArrowLeft size={18} /> {language === 'np' ? 'फर्कनुहोस्' : 'Library'}
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0284c7' }}>
              {language === 'np' ? 'रेखाहरूमा रङ भरौँ' : 'Colour the Lines'}
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {language === 'np' ? 'कक्षा १ गणित • अध्याय २: रेखाहरू' : 'Class 1 Math • Chapter 2: Lines'}
            </span>
          </div>
        </div>

        {/* Level indicator & tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
            }}
          >
            <Trophy size={16} color="#d97706" /> {stars} {language === 'np' ? 'तारा' : 'Stars'}
          </div>

          {/* Level Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '3px' }}>
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setCurrentLevel(lvl);
                  setSceneIndex(0);
                  playSoundEffect('click');
                }}
                style={{
                  background: currentLevel === lvl ? '#0284c7' : 'transparent',
                  color: currentLevel === lvl ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {language === 'np' ? `तह ${lvl}` : `Level ${lvl}`}
              </button>
            ))}
          </div>

          {/* Language toggle */}
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

      {/* Main Container */}
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
        {/* Left Toolbar / Activity Card */}
        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Mission Instruction Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Palette size={20} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {language === 'np' ? currentScene.titleNp : currentScene.titleEn}
              </h3>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#334155',
                lineHeight: 1.5,
                margin: '8px 0 16px 0',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '12px',
                borderLeft: '4px solid #0284c7',
              }}
            >
              {language === 'np' ? currentScene.instructionNp : currentScene.instructionEn}
            </p>

            {/* Read Loud Button */}
            <button
              onClick={() => speakText(currentScene.instructionNp, currentScene.instructionEn)}
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
              <Volume2 size={16} /> {language === 'np' ? 'सुन्नुहोस् (Listen)' : 'Listen to Rule'}
            </button>
          </div>

          {/* Color Palettes (The Textbook Rule!) */}
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
              {language === 'np' ? 'रङ छान्नुहोस् (Pick Color)' : 'Select Line Tool'}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Blue Brush (Straight) */}
              <button
                onClick={() => {
                  setActiveColor('blue');
                  playSoundEffect('click');
                  speakText('निलो रङ: सीधा रेखाका लागि', 'Blue Color for Straight Lines');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeColor === 'blue' ? '#dbeafe' : '#f8fafc',
                  border: activeColor === 'blue' ? '3px solid #2563eb' : '2px solid #e2e8f0',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transform: activeColor === 'blue' ? 'scale(1.02)' : 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: activeColor === 'blue' ? '0 4px 14px rgba(37,99,235,0.2)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.4)',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#1e40af' }}>
                    {language === 'np' ? 'निलो रङ (Blue)' : 'Blue Color'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600 }}>
                    {language === 'np' ? 'सीधा रेखा (Straight Lines)' : 'For Straight Lines'}
                  </div>
                </div>
              </button>

              {/* Red Brush (Curved) */}
              <button
                onClick={() => {
                  setActiveColor('red');
                  playSoundEffect('click');
                  speakText('रातो रङ: बाङ्गो रेखाका लागि', 'Red Color for Curved Lines');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeColor === 'red' ? '#fee2e2' : '#f8fafc',
                  border: activeColor === 'red' ? '3px solid #dc2626' : '2px solid #e2e8f0',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transform: activeColor === 'red' ? 'scale(1.02)' : 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: activeColor === 'red' ? '0 4px 14px rgba(220,38,38,0.2)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#dc2626',
                    boxShadow: '0 2px 6px rgba(220,38,38,0.4)',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#991b1b' }}>
                    {language === 'np' ? 'रातो रङ (Red)' : 'Red Color'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
                    {language === 'np' ? 'बाङ्गो रेखा (Curved Lines)' : 'For Curved Lines'}
                  </div>
                </div>
              </button>

              {/* Eraser */}
              <button
                onClick={() => {
                  setActiveColor('eraser');
                  playSoundEffect('click');
                  speakText('रङ मेट्ने इरेजर', 'Eraser tool');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: activeColor === 'eraser' ? '#f1f5f9' : '#ffffff',
                  border: activeColor === 'eraser' ? '3px solid #64748b' : '2px dashed #cbd5e1',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
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
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#334155' }}>
                    {language === 'np' ? 'रङ मेट्नुहोस् (Eraser)' : 'Eraser'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {language === 'np' ? 'गल्ती सच्याउन' : 'Clear a stroke'}
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Action Buttons */}
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
                <Undo2 size={15} /> {language === 'np' ? 'पछाडि (Undo)' : 'Undo'}
              </button>
              <button
                onClick={handleResetScene}
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
                <RotateCcw size={15} /> {language === 'np' ? 'खाली गर्नुस्' : 'Reset'}
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
          {/* Canvas Title & Textbook reminder badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {language === 'np' ? 'सीधा = निलो 🟦' : 'Straight = Blue 🟦'}
              </span>
              <span
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {language === 'np' ? 'बाङ्गो = रातो 🟥' : 'Curved = Red 🟥'}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>
              {language === 'np'
                ? `रङ भरिएका रेखाहरू: ${currentScene.strokes.filter((s) => s.currentColor).length} / ${currentScene.strokes.length}`
                : `Colored Lines: ${currentScene.strokes.filter((s) => s.currentColor).length} / ${currentScene.strokes.length}`}
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
              viewBox="0 0 600 520"
              style={{
                width: '100%',
                maxHeight: '480px',
                cursor: activeColor === 'eraser' ? 'crosshair' : 'pointer',
              }}
            >
              {/* Background Grid Accent */}
              <defs>
                <pattern id="dotGrid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="3" cy="3" r="1.5" fill="#e2e8f0" />
                </pattern>
                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect width="600" height="520" fill="url(#dotGrid)" />

              {/* Render Lines / Strokes */}
              {currentScene.strokes.map((stroke) => {
                let strokeColor = '#94a3b8'; // Default uncolored slate
                let isGlow = false;

                if (stroke.currentColor === 'blue') {
                  strokeColor = '#2563eb';
                  isGlow = true;
                } else if (stroke.currentColor === 'red') {
                  strokeColor = '#dc2626';
                  isGlow = true;
                }

                return (
                  <g key={stroke.id} onClick={() => handleStrokeClick(stroke.id)} style={{ cursor: 'pointer' }}>
                    {/* Invisible thicker hit area for child touch ease */}
                    <path
                      d={stroke.d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={(stroke.strokeWidth || 10) + 24}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Visible line */}
                    <path
                      d={stroke.d}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={stroke.strokeWidth || 10}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter={isGlow ? 'url(#lineGlow)' : undefined}
                      style={{
                        transition: 'stroke 0.25s ease, stroke-width 0.2s ease',
                      }}
                    />

                    {/* Dashed guide outline if uncolored */}
                    {!stroke.currentColor && (
                      <path
                        d={stroke.d}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Small icon indicator for accessibility */}
                    {stroke.currentColor && (
                      <circle
                        cx={stroke.d.split(' ')[1].split(',')[0]}
                        cy={stroke.d.split(' ')[1].split(',')[1]}
                        r="6"
                        fill="#ffffff"
                        stroke={strokeColor}
                        strokeWidth="2"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Action Footer */}
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Scene Navigation for multi-scene levels */}
              {level1Scenes.length > 1 && currentLevel === 1 && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {level1Scenes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSceneIndex(i)}
                      style={{
                        background: sceneIndex === i ? '#0284c7' : '#e2e8f0',
                        color: sceneIndex === i ? '#ffffff' : '#64748b',
                        border: 'none',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

              {level3Scenes.length > 1 && currentLevel === 3 && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {level3Scenes.map((sc, i) => (
                    <button
                      key={sc.id}
                      onClick={() => setSceneIndex(i)}
                      style={{
                        background: sceneIndex === i ? '#0284c7' : '#e2e8f0',
                        color: sceneIndex === i ? '#ffffff' : '#64748b',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {language === 'np' ? sc.titleNp.split(' ')[0] : sc.titleEn.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Check answers button */}
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
                transition: 'all 0.2s ease',
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
                  animation: 'popIn 0.3s ease',
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
                    ? 'तपाईंले सीधा रेखामा निलो र बाङ्गो रेखामा रातो रङ ठिकसँग भर्नुभयो।'
                    : 'You accurately colored straight lines Blue and curved lines Red!'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '28px',
                  }}
                >
                  {[1, 2, 3].map((star) => (
                    <Sparkles key={star} size={32} color="#f59e0b" fill="#f59e0b" />
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
                    boxShadow: '0 8px 20px rgba(2,132,199,0.3)',
                  }}
                >
                  {language === 'np' ? 'अर्को अभ्यासमा जानुहोस्' : 'Continue to Next Picture'}
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
export default LineColoringSimulation;

