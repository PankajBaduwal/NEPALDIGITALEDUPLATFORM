/**
 * ShapeExplorer3D.tsx
 * Simulation 01: Shape Explorer 3D (आकारहरू चिनौँ)
 * Class 1 Mathematics - Chapter 3: Geometrical Shapes (ज्यामितीय आकारहरू)
 * Based on Nepal CDC Curriculum (मेरो गणित, कक्षा १ - २०७६)
 * Covers: Circle (वृत्त), Triangle (त्रिभुज), Quadrilateral (चतुर्भुज)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCw,
  Trophy,
  Sparkles,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Shapes,
  Maximize2,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { ShapeEnvironment, InteractiveShapeObject } from './ShapeEnvironment';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

export const ShapeExplorer3D: React.FC<Props> = ({ onBackToLibrary, userRole = 'TEACHER' }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const envRef = useRef<ShapeEnvironment | null>(null);

  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Level (1: Meet, 2: Identify, 3: Real-World, 4: Comparison, 5: Challenge, 6: Assessment)
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [selectedShape, setSelectedShape] = useState<InteractiveShapeObject | null>(null);

  // Level 2 & 3 prompt state
  const [targetCategory, setTargetCategory] = useState<'circle' | 'triangle' | 'quadrilateral'>('circle');
  const [feedback, setFeedback] = useState<{ isSuccess: boolean; textNp: string; textEn: string } | null>(null);
  const [stars, setStars] = useState(0);

  // Level 4 (Smallest / Largest)
  const [comparisonTarget, setComparisonTarget] = useState<'smallest_circle' | 'largest_triangle' | 'smallest_quad'>('smallest_circle');

  // Level 6 Assessment State
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [assessmentFinished, setAssessmentFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ qIndex: number; isCorrect: boolean }[]>([]);

  // Drag rotation helpers
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);

  // Audio speech synthesis
  const speakText = (npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const playTone = (type: 'success' | 'click' | 'error') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.1 + 0.3);
          o.start(ctx.currentTime + i * 0.1);
          o.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(480, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {}
  };

  // Initialize 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const env = new ShapeEnvironment(mountRef.current);
    envRef.current = env;

    // Default select circle disc
    const defaultObj = env.interactiveObjects[0];
    if (defaultObj) {
      setSelectedShape(defaultObj);
      env.selectObject(defaultObj);
    }

    return () => {
      env.destroy();
      envRef.current = null;
    };
  }, []);

  // Handle Level Instructions
  useEffect(() => {
    setFeedback(null);
    if (currentLevel === 1) {
      speakText(
        'आकारहरू चिनौँ। ३डी मोडेललाई छोएर वृत्त, त्रिभुज र चतुर्भुज हेर्नुहोस्।',
        'Meet the Shapes. Click or tap any 3D model to explore Circle, Triangle, and Quadrilateral.'
      );
    } else if (currentLevel === 2) {
      const catNp = targetCategory === 'circle' ? 'वृत्त (Circle)' : targetCategory === 'triangle' ? 'त्रिभुज (Triangle)' : 'चतुर्भुज (Quadrilateral)';
      speakText(`खेलमैदानमा भएको ${catNp} आकार खोज्नुहोस्!`, `Find the ${targetCategory} shape in the 3D playground!`);
    } else if (currentLevel === 3) {
      speakText('वास्तविक वस्तुहरू (घडी, थाली, छाना, किताब) को आकार पत्ता लगाउनुहोस्!', 'Recognize geometrical shapes in real-world everyday objects!');
    } else if (currentLevel === 4) {
      speakText('सबैभन्दा सानो वा ठूलो आकार खोज्नुहोस्!', 'Compare sizes to identify the smallest or largest shape!');
    } else if (currentLevel === 5) {
      speakText('मिश्रित आकार चुनौती! सोधिएको आकार पत्ता लगाउनुहोस्।', 'Mixed Shape Challenge! Identify the asked shape.');
    } else if (currentLevel === 6) {
      speakText('अध्याय ३ को अन्तिम मूल्याङ्कन सुरु भयो!', 'Final Assessment for Chapter 3 Geometrical Shapes has started!');
    }
  }, [currentLevel, targetCategory, language]);

  // Handle Raycasting Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;

    if (!envRef.current) return;
    const clickedObj = envRef.current.raycast(e.clientX, e.clientY);
    if (clickedObj) {
      handleObjectSelected(clickedObj);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !envRef.current) return;
    const deltaX = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;
    envRef.current.rotateSelected(deltaX);
    envRef.current.isUserRotating = true;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    if (envRef.current) {
      envRef.current.isUserRotating = false;
    }
  };

  // Object Selected handler based on current level
  const handleObjectSelected = (obj: InteractiveShapeObject) => {
    setSelectedShape(obj);
    if (envRef.current) envRef.current.selectObject(obj);

    if (currentLevel === 1) {
      // Free Exploration & Listening
      playTone('click');
      speakText(
        `यो ${obj.nameNp} हो। यसको आकार ${obj.categoryNp} हो।`,
        `This is a ${obj.nameEn}. Its shape is a ${obj.category}.`
      );
    } else if (currentLevel === 2) {
      // Find requested shape
      if (obj.category === targetCategory) {
        playTone('success');
        setStars((s) => s + 2);
        setFeedback({
          isSuccess: true,
          textNp: `स्याबास! तपाईंले सही ${obj.categoryNp} आकार छान्नुभयो!`,
          textEn: `Great job! You found the correct ${obj.category} shape!`,
        });
        speakText(
          `स्याबास! यो ${obj.categoryNp} हो।`,
          `Great job! This is indeed a ${obj.category}.`
        );
      } else {
        playTone('error');
        setFeedback({
          isSuccess: false,
          textNp: `यो ${obj.categoryNp} हो, तर हामीले खोजेको ${targetCategory === 'circle' ? 'वृत्त' : targetCategory === 'triangle' ? 'त्रिभुज' : 'चतुर्भुज'} हो। पुनः प्रयास गर्नुहोस्।`,
          textEn: `This is a ${obj.category}. Please try to find the ${targetCategory}!`,
        });
        speakText('पुनः प्रयास गर्नुहोस्', 'Try again');
      }
    } else if (currentLevel === 3) {
      // Real-World Recognition
      playTone('success');
      setStars((s) => s + 1);
      setFeedback({
        isSuccess: true,
        textNp: `${obj.nameNp}: ${obj.descriptionNp}`,
        textEn: `${obj.nameEn}: ${obj.descriptionEn}`,
      });
      speakText(obj.descriptionNp, obj.descriptionEn);
    } else if (currentLevel === 4) {
      // Size Comparison (Smallest / Largest)
      let isCorrect = false;
      if (comparisonTarget === 'smallest_circle' && obj.id === 'clock') isCorrect = true;
      if (comparisonTarget === 'largest_triangle' && obj.id === 'triangle_prism') isCorrect = true;
      if (comparisonTarget === 'smallest_quad' && obj.id === 'window') isCorrect = true;

      if (isCorrect) {
        playTone('success');
        setStars((s) => s + 3);
        setFeedback({
          isSuccess: true,
          textNp: `अति राम्रो! तपाईंले सही आकार छान्नुभयो!`,
          textEn: `Excellent! You correctly identified the target size!`,
        });
        speakText('अति राम्रो! एकदम सही!', 'Excellent! That is correct!');
      } else {
        playTone('error');
        setFeedback({
          isSuccess: false,
          textNp: `यो मिलेन। आकारहरूको आकारलाई ध्यानपूर्वक हेर्नुहोस्।`,
          textEn: `Not quite. Carefully compare the relative sizes of the objects.`,
        });
      }
    } else if (currentLevel === 5) {
      // Mixed Challenge
      playTone('click');
      speakText(
        `${obj.nameNp} (${obj.categoryNp})`,
        `${obj.nameEn} (${obj.category})`
      );
    }
  };

  // 12 Chapter Assessment Questions
  const assessmentQuestions = [
    {
      qNp: '१. थाली (Plate) को आकार कस्तो हुन्छ?',
      qEn: '1. What is the geometrical shape of a dining plate?',
      options: [
        { np: 'वृत्त (Circle)', en: 'Circle', isCorrect: true },
        { np: 'त्रिभुज (Triangle)', en: 'Triangle', isCorrect: false },
        { np: 'चतुर्भुज (Quadrilateral)', en: 'Quadrilateral', isCorrect: false },
      ],
    },
    {
      qNp: '२. तीनवटा सिधा किनारा र तीनवटा कुना भएको आकार कुन हो?',
      qEn: '2. Which shape has 3 straight edges and 3 corners?',
      options: [
        { np: 'त्रिभुज (Triangle)', en: 'Triangle', isCorrect: true },
        { np: 'वृत्त (Circle)', en: 'Circle', isCorrect: false },
        { np: 'चतुर्भुज (Quadrilateral)', en: 'Quadrilateral', isCorrect: false },
      ],
    },
    {
      qNp: '३. गणित किताब (Book cover) को आकार कुन हो?',
      qEn: '3. What shape is the front cover of a textbook?',
      options: [
        { np: 'चतुर्भुज (Quadrilateral)', en: 'Quadrilateral', isCorrect: true },
        { np: 'वृत्त (Circle)', en: 'Circle', isCorrect: false },
        { np: 'त्रिभुज (Triangle)', en: 'Triangle', isCorrect: false },
      ],
    },
    {
      qNp: '४. भित्ते घडी (Clock face) को आकार कुन हो?',
      qEn: '4. What shape does a round wall clock have?',
      options: [
        { np: 'वृत्त (Circle)', en: 'Circle', isCorrect: true },
        { np: 'त्रिभुज (Triangle)', en: 'Triangle', isCorrect: false },
        { np: 'चतुर्भुज (Quadrilateral)', en: 'Quadrilateral', isCorrect: false },
      ],
    },
    {
      qNp: '५. बाटोको ट्राफिक चेतावनी बोर्ड कस्तो आकारको हुन्छ?',
      qEn: '5. What shape is a standard triangular road sign?',
      options: [
        { np: 'त्रिभुज (Triangle)', en: 'Triangle', isCorrect: true },
        { np: 'वृत्त (Circle)', en: 'Circle', isCorrect: false },
        { np: 'चतुर्भुज (Quadrilateral)', en: 'Quadrilateral', isCorrect: false },
      ],
    },
    {
      qNp: '६. चारवटा सिधा किनारा भएको कोठाको झ्याल कुन आकार हो?',
      qEn: '6. What shape is a 4-sided window frame?',
      options: [
        { np: 'चतुर्भुज (Quadrilateral)', en: 'Quadrilateral', isCorrect: true },
        { np: 'त्रिभुज (Triangle)', en: 'Triangle', isCorrect: false },
        { np: 'वृत्त (Circle)', en: 'Circle', isCorrect: false },
      ],
    },
    {
      qNp: '७. कुन आकारमा कुनै पनि कुना हुँदैन?',
      qEn: '7. Which shape has no straight edges or sharp corners?',
      options: [
        { np: 'वृत्त (Circle)', en: 'Circle', isCorrect: true },
        { np: 'त्रिभुज (Triangle)', en: 'Triangle', isCorrect: false },
        { np: 'चतुर्भुज (Quadrilateral)', en: 'Quadrilateral', isCorrect: false },
      ],
    },
    {
      qNp: '८. घरको छाना (Cottage roof) को छेउ कुन आकार जस्तो देखिन्छ?',
      qEn: '8. What shape does the side gable of a house roof represent?',
      options: [
        { np: 'त्रिभुज (Triangle)', en: 'Triangle', isCorrect: true },
        { np: 'वृत्त (Circle)', en: 'Circle', isCorrect: false },
        { np: 'चतुर्भुज (Quadrilateral)', en: 'Quadrilateral', isCorrect: false },
      ],
    },
    {
      qNp: '९. कक्षाकोठाको ढोका (Door) को आकार कुन हो?',
      qEn: '9. What geometrical shape is a classroom door?',
      options: [
        { np: 'चतुर्भुज (Quadrilateral)', en: 'Quadrilateral', isCorrect: true },
        { np: 'त्रिभुज (Triangle)', en: 'Triangle', isCorrect: false },
        { np: 'वृत्त (Circle)', en: 'Circle', isCorrect: false },
      ],
    },
    {
      qNp: '१०. मादलको गोलो छाला भएको मुख कुन आकार हो?',
      qEn: '10. What shape is the circular face of a traditional drum (Madal)?',
      options: [
        { np: 'वृत्त (Circle)', en: 'Circle', isCorrect: true },
        { np: 'त्रिभुज (Triangle)', en: 'Triangle', isCorrect: false },
        { np: 'चतुर्भुज (Quadrilateral)', en: 'Quadrilateral', isCorrect: false },
      ],
    },
    {
      qNp: '११. पाठ्यपुस्तक अनुसार त्रिभुजमा कुन रङ भरिन्छ?',
      qEn: '11. According to the textbook rule, what color is used for Triangles?',
      options: [
        { np: 'रातो (Red)', en: 'Red', isCorrect: true },
        { np: 'निलो (Blue)', en: 'Blue', isCorrect: false },
        { np: 'हरियो (Green)', en: 'Green', isCorrect: false },
      ],
    },
    {
      qNp: '१२. पाठ्यपुस्तक अनुसार वृत्तमा कुन रङ भरिन्छ?',
      qEn: '12. According to the textbook rule, what color is used for Circles?',
      options: [
        { np: 'हरियो (Green)', en: 'Green', isCorrect: true },
        { np: 'रातो (Red)', en: 'Red', isCorrect: false },
        { np: 'निलो (Blue)', en: 'Blue', isCorrect: false },
      ],
    },
  ];

  const handleAssessmentAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      playTone('success');
      setAssessmentScore((s) => s + 1);
    } else {
      playTone('error');
    }
    setUserAnswers((prev) => [...prev, { qIndex: assessmentIndex, isCorrect }]);

    if (assessmentIndex + 1 < assessmentQuestions.length) {
      setAssessmentIndex((idx) => idx + 1);
    } else {
      setAssessmentFinished(true);
      saveFinalProgress(assessmentScore + (isCorrect ? 1 : 0));
    }
  };

  const saveFinalProgress = async (finalScore: number) => {
    const percentage = Math.round((finalScore / assessmentQuestions.length) * 100);
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH3-01/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentScore: finalScore,
          totalQuestions: assessmentQuestions.length,
          percentage,
          completedLevels: [1, 2, 3, 4, 5, 6],
          timeSpentSeconds: 180,
          isCompleted: percentage >= 60,
        }),
      });
    } catch (e) {}
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Fredoka', 'Mukta', 'Segoe UI', sans-serif",
        color: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBackToLibrary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '12px',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} /> {language === 'np' ? 'फर्कनुहोस्' : 'Library'}
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
              {language === 'np' ? 'आकारहरू चिनौँ (Shape Explorer 3D)' : 'Shape Explorer 3D'}
            </h1>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
              {language === 'np'
                ? 'कक्षा १ गणित • अध्याय ३: ज्यामितीय आकारहरू (वृत्त, त्रिभुज, चतुर्भुज)'
                : 'Class 1 Math • Chapter 3: Geometrical Shapes (Circle, Triangle, Quadrilateral)'}
            </span>
          </div>
        </div>

        {/* Level pills & tools */}
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

          {/* Level Switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '3px' }}>
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setCurrentLevel(lvl);
                  if (lvl === 2) setTargetCategory('circle');
                  playTone('click');
                }}
                style={{
                  background: currentLevel === lvl ? '#0284c7' : 'transparent',
                  color: currentLevel === lvl ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {lvl === 6 ? (language === 'np' ? 'जाँच' : 'Quiz') : `${language === 'np' ? 'तह' : 'Lvl'} ${lvl}`}
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

      {/* Main Content Layout */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: currentLevel === 6 ? '1fr' : '360px 1fr',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left Instruction Panel (Levels 1-5) */}
        {currentLevel < 6 && (
          <aside
            style={{
              background: '#1e293b',
              borderRight: '1px solid #334155',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 20,
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Level Mission Header */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid #334155',
                  padding: '16px',
                  borderRadius: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Shapes size={20} color="#38bdf8" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
                    {currentLevel === 1 && (language === 'np' ? 'तह १: आकारहरूसँग परिचय' : 'Level 1: Meet the Shapes')}
                    {currentLevel === 2 && (language === 'np' ? 'तह २: आकार पत्ता लगाउनुहोस्' : 'Level 2: Identify the Shape')}
                    {currentLevel === 3 && (language === 'np' ? 'तह ३: वास्तविक वस्तुहरूको आकार' : 'Level 3: Real-World Objects')}
                    {currentLevel === 4 && (language === 'np' ? 'तह ४: सानो र ठूलो आकारको तुलना' : 'Level 4: Shape Comparison')}
                    {currentLevel === 5 && (language === 'np' ? 'तह ५: आकार चुनौती' : 'Level 5: Mixed Challenge')}
                  </h3>
                </div>

                <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {currentLevel === 1 &&
                    (language === 'np'
                      ? '३डी खेलमैदानमा रहेको कुनै पनि वस्तुलाई छुनुहोस्। माउस वा औँलाले घुमाएर हेर्नुहोस्!'
                      : 'Click or drag any 3D model in the playground to observe Circle, Triangle, and Quadrilateral.')}
                  {currentLevel === 2 &&
                    (language === 'np'
                      ? `खेलमैदानमा भएको ${targetCategory === 'circle' ? 'वृत्त (Circle)' : targetCategory === 'triangle' ? 'त्रिभुज (Triangle)' : 'चतुर्भुज (Quadrilateral)'} आकार छान्नुहोस्!`
                      : `Find and click on the ${targetCategory.toUpperCase()} shape!`)}
                  {currentLevel === 3 &&
                    (language === 'np'
                      ? 'थाली, घडी, छाना, किताब, झ्याल जस्ता वस्तुहरू छान्नुहोस् र तिनका आकारहरू सिक्नुहोस्।'
                      : 'Click real-world objects to explore their geometric faces and outlines.')}
                  {currentLevel === 4 &&
                    (language === 'np'
                      ? 'सबैभन्दा सानो वा ठूलो आकार भएको वस्तु पत्ता लगाउनुहोस्।'
                      : 'Identify the smallest or largest shape in the scene.')}
                  {currentLevel === 5 &&
                    (language === 'np'
                      ? '३डी मोडेललाई जुनसुकै कोणबाट घुमाएर आकार चिन्नुहोस्!'
                      : 'Rotate models from any angle to verify your shape mastery!')}
                </p>
              </div>

              {/* Level 2 Shape Selection Buttons */}
              {currentLevel === 2 && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { key: 'circle', np: 'वृत्त', en: 'Circle', col: '#10b981' },
                    { key: 'triangle', np: 'त्रिभुज', en: 'Triangle', col: '#ef4444' },
                    { key: 'quadrilateral', np: 'चतुर्भुज', en: 'Quadrilateral', col: '#2563eb' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setTargetCategory(cat.key as any);
                        playTone('click');
                      }}
                      style={{
                        flex: 1,
                        background: targetCategory === cat.key ? cat.col : '#334155',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 4px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {language === 'np' ? cat.np : cat.en}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Shape Information Card */}
              {selectedShape && (
                <div
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '2px solid #0284c7',
                    borderRadius: '20px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        background:
                          selectedShape.category === 'circle'
                            ? '#10b981'
                            : selectedShape.category === 'triangle'
                            ? '#ef4444'
                            : '#2563eb',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {language === 'np' ? selectedShape.categoryNp : selectedShape.category.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {language === 'np' ? '३डी मोडेल' : '3D Object'}
                    </span>
                  </div>

                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>
                    {language === 'np' ? selectedShape.nameNp : selectedShape.nameEn}
                  </h2>

                  <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {language === 'np' ? selectedShape.descriptionNp : selectedShape.descriptionEn}
                  </p>

                  <div
                    style={{
                      background: 'rgba(0,0,0,0.25)',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#38bdf8',
                      fontWeight: 600,
                    }}
                  >
                    💡 {language === 'np' ? selectedShape.faceHintNp : selectedShape.faceHintEn}
                  </div>

                  <button
                    onClick={() => speakText(selectedShape.descriptionNp, selectedShape.descriptionEn)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <Volume2 size={16} /> {language === 'np' ? 'सुन्नुहोस् (Listen)' : 'Listen Description'}
                  </button>
                </div>
              )}

              {/* Feedback Alert */}
              {feedback && (
                <div
                  style={{
                    background: feedback.isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: feedback.isSuccess ? '1px solid #10b981' : '1px solid #ef4444',
                    padding: '14px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {feedback.isSuccess ? <CheckCircle2 size={24} color="#10b981" /> : <XCircle size={24} color="#ef4444" />}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                    {language === 'np' ? feedback.textNp : feedback.textEn}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Level Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {language === 'np' ? 'माउस वा औँलाले वस्तु घुमाउनुहोस् 🔄' : 'Drag to rotate 3D objects 🔄'}
              </span>
              <button
                onClick={() => {
                  setCurrentLevel((prev) => Math.min(6, prev + 1));
                  playTone('click');
                }}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {language === 'np' ? 'अर्को तह' : 'Next Level'} <ChevronRight size={16} />
              </button>
            </div>
          </aside>
        )}

        {/* 3D Canvas Playground Area (Levels 1-5) */}
        {currentLevel < 6 && (
          <div
            ref={mountRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              position: 'relative',
              cursor: 'grab',
            }}
          >
            {/* Overlay hint banner */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '8px 16px',
                borderRadius: '14px',
                border: '1px solid #334155',
                fontSize: '12px',
                fontWeight: 700,
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                pointerEvents: 'none',
              }}
            >
              <Compass size={16} /> {language === 'np' ? '३डी आकार खेलमैदान' : '3D Playground'}
            </div>
          </div>
        )}

        {/* Level 6: Assessment View */}
        {currentLevel === 6 && (
          <div
            style={{
              maxWidth: '780px',
              width: '100%',
              margin: '32px auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {!assessmentFinished ? (
              <div
                style={{
                  background: '#1e293b',
                  borderRadius: '24px',
                  padding: '36px',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                  border: '1px solid #334155',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
                    {language === 'np'
                      ? `प्रश्न ${assessmentIndex + 1} / ${assessmentQuestions.length}`
                      : `Question ${assessmentIndex + 1} of ${assessmentQuestions.length}`}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b' }}>
                    {language === 'np' ? `अङ्क: ${assessmentScore}` : `Score: ${assessmentScore}`}
                  </span>
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '24px', lineHeight: 1.4 }}>
                  {language === 'np'
                    ? assessmentQuestions[assessmentIndex].qNp
                    : assessmentQuestions[assessmentIndex].qEn}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {assessmentQuestions[assessmentIndex].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAssessmentAnswer(opt.isCorrect)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '2px solid #334155',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: 700,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#334155')}
                    >
                      {language === 'np' ? opt.np : opt.en}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Assessment Results Card */
              <div
                style={{
                  background: '#1e293b',
                  borderRadius: '24px',
                  padding: '40px',
                  textAlign: 'center',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                  border: '1px solid #334155',
                }}
              >
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                  }}
                >
                  <Trophy size={48} color="#d97706" />
                </div>

                <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', margin: '0 0 10px 0' }}>
                  {language === 'np' ? 'मूल्याङ्कन सम्पन्न भयो!' : 'Assessment Complete!'}
                </h2>

                <p style={{ fontSize: '16px', color: '#cbd5e1', margin: '0 0 24px 0' }}>
                  {language === 'np'
                    ? `तपाईंले ${assessmentQuestions.length} मा ${assessmentScore} अङ्क प्राप्त गर्नुभयो।`
                    : `You scored ${assessmentScore} out of ${assessmentQuestions.length}.`}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Sparkles key={s} size={32} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      setAssessmentIndex(0);
                      setAssessmentScore(0);
                      setAssessmentFinished(false);
                      setUserAnswers([]);
                    }}
                    style={{
                      background: '#334155',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {language === 'np' ? 'पुनः प्रयास गर्नुस्' : 'Try Again'}
                  </button>
                  <button
                    onClick={onBackToLibrary}
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 28px',
                      borderRadius: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {language === 'np' ? 'लाइब्रेरीमा फर्कनुहोस्' : 'Return to Library'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default ShapeExplorer3D;

