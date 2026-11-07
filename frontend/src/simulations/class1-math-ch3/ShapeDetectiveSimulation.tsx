/**
 * ShapeDetectiveSimulation.tsx
 * Simulation 04: Shape Detective (आकार खोजौँ)
 * Class 1 Mathematics - Chapter 3: Geometrical Shapes (ज्यामितीय आकारहरू)
 * Based on Nepal CDC Curriculum (मेरो गणित, कक्षा १ - २०७६)
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Search,
  CheckCircle2,
  Trophy,
  Sparkles,
  ChevronRight,
  HelpCircle,
  MapPin,
  Eye,
  Award,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

type ShapeType = 'circle' | 'triangle' | 'quadrilateral';

interface DetectiveItem {
  id: string;
  nameEn: string;
  nameNp: string;
  shape: ShapeType;
  shapeNp: 'वृत्त' | 'त्रिभुज' | 'चतुर्भुज';
  x: number; // percentage in scene canvas
  y: number;
  icon: string;
  discovered: boolean;
  explanationEn: string;
  explanationNp: string;
}

interface LocationScene {
  id: 'classroom' | 'playground' | 'village';
  titleEn: string;
  titleNp: string;
  bgGradient: string;
  items: DetectiveItem[];
}

export const ShapeDetectiveSimulation: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Detective Location
  const [activeLocationIdx, setActiveLocationIdx] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<DetectiveItem | null>(null);
  const [stars, setStars] = useState(0);

  // Locations definition
  const locations: LocationScene[] = [
    // 1. Classroom
    {
      id: 'classroom',
      titleEn: 'Location A: Classroom (कक्षाकोठा)',
      titleNp: 'स्थान १: कक्षाकोठा',
      bgGradient: 'linear-gradient(180deg, #e0f2fe 0%, #f1f5f9 60%, #cbd5e1 100%)',
      items: [
        {
          id: 'c_clock',
          nameEn: 'Wall Clock',
          nameNp: 'भित्ते घडी',
          shape: 'circle',
          shapeNp: 'वृत्त',
          x: 20,
          y: 22,
          icon: '⏰',
          discovered: false,
          explanationEn: 'The clock has a circular face with no corners.',
          explanationNp: 'घडीको गोलो मुख वृत्त आकारको छ जसमा कुनै कुना हुँदैन।',
        },
        {
          id: 'c_board',
          nameEn: 'Blackboard',
          nameNp: 'कालोपाटी (Blackboard)',
          shape: 'quadrilateral',
          shapeNp: 'चतुर्भुज',
          x: 50,
          y: 28,
          icon: '📋',
          discovered: false,
          explanationEn: 'The blackboard has 4 straight edges and 4 corners.',
          explanationNp: 'कालोपाटी ४ वटा सीधा सिधा किनारा भएको चतुर्भुज (आयताकार) हो।',
        },
        {
          id: 'c_pennant',
          nameEn: 'Wall Flag',
          nameNp: 'भित्ते त्रिकोणात्मक झन्डा',
          shape: 'triangle',
          shapeNp: 'त्रिभुज',
          x: 80,
          y: 20,
          icon: '🚩',
          discovered: false,
          explanationEn: 'The decorative flag has 3 sides and 3 corners.',
          explanationNp: 'यो भित्ते झन्डा ३ वटा किनारा भएको त्रिभुज हो।',
        },
        {
          id: 'c_book',
          nameEn: 'Math Textbook',
          nameNp: 'गणित किताब',
          shape: 'quadrilateral',
          shapeNp: 'चतुर्भुज',
          x: 32,
          y: 68,
          icon: '📕',
          discovered: false,
          explanationEn: 'The textbook cover has 4 straight sides.',
          explanationNp: 'गणित किताबको कभर ४ वटा किनारा भएको चतुर्भुज हो।',
        },
        {
          id: 'c_ruler',
          nameEn: 'Set Square Ruler',
          nameNp: 'त्रिकोणात्मक रुलर (Set Square)',
          shape: 'triangle',
          shapeNp: 'त्रिभुज',
          x: 68,
          y: 68,
          icon: '📐',
          discovered: false,
          explanationEn: 'This drafting ruler has 3 straight sides forming a triangle.',
          explanationNp: 'यो ज्यामितीय रुलर ३ वटा सिधा किनारा मिलेर बनेको त्रिभुज हो।',
        },
      ],
    },

    // 2. Playground
    {
      id: 'playground',
      titleEn: 'Location B: School Playground (खेलमैदान)',
      titleNp: 'स्थान २: विद्यालय खेलमैदान',
      bgGradient: 'linear-gradient(180deg, #bae6fd 0%, #bbf7d0 50%, #86efac 100%)',
      items: [
        {
          id: 'p_ball',
          nameEn: 'Football Silhouette',
          nameNp: 'भकुन्डो (बल)',
          shape: 'circle',
          shapeNp: 'वृत्त',
          x: 25,
          y: 72,
          icon: '⚽',
          discovered: false,
          explanationEn: 'The circular outline of the ball represents a circle.',
          explanationNp: 'बलको गोलो घेरा वृत्त आकारको हुन्छ।',
        },
        {
          id: 'p_cone',
          nameEn: 'Traffic Safety Cone',
          nameNp: 'सुरक्षा कोन (Cone)',
          shape: 'triangle',
          shapeNp: 'त्रिभुज',
          x: 48,
          y: 65,
          icon: '⚠️',
          discovered: false,
          explanationEn: 'The triangular side profile of the safety cone is a triangle.',
          explanationNp: 'खेलमैदानको सुरक्षा कोनको अघिल्लो भाग त्रिभुज आकारको छ।',
        },
        {
          id: 'p_sandbox',
          nameEn: 'Square Sandbox',
          nameNp: 'बालुवा खेल्ने बाकस',
          shape: 'quadrilateral',
          shapeNp: 'चतुर्भुज',
          x: 75,
          y: 70,
          icon: '📦',
          discovered: false,
          explanationEn: 'The sandbox has 4 equal straight edges.',
          explanationNp: 'बालुवाको बाकस ४ वटा बराबर सिधा किनारा भएको चतुर्भुज हो।',
        },
        {
          id: 'p_swing',
          nameEn: 'Swing A-Frame',
          nameNp: 'पिङको त्रिकोणात्मक खम्बा',
          shape: 'triangle',
          shapeNp: 'त्रिभुज',
          x: 35,
          y: 30,
          icon: '⛺',
          discovered: false,
          explanationEn: 'The top support frame of the swing forms a sturdy triangle.',
          explanationNp: 'पिङ अड्याउने दुई खम्बा मिलेर त्रिभुज आकार बनेको छ।',
        },
        {
          id: 'p_merry',
          nameEn: 'Round Merry-Go-Round',
          nameNp: 'गोलो घुम्ने चक्का',
          shape: 'circle',
          shapeNp: 'वृत्त',
          x: 70,
          y: 32,
          icon: '🎡',
          discovered: false,
          explanationEn: 'The spinning ride is round like a circle.',
          explanationNp: 'घुम्ने चक्का पूरै गोलो वृत्त आकारको छ।',
        },
      ],
    },

    // 3. Nepalese Village
    {
      id: 'village',
      titleEn: 'Location C: Nepalese Village (नेपाली गाउँ)',
      titleNp: 'स्थान ३: नेपाली गाउँ',
      bgGradient: 'linear-gradient(180deg, #fef3c7 0%, #fed7aa 40%, #86efac 100%)',
      items: [
        {
          id: 'v_roof',
          nameEn: 'Cottage Slate Roof',
          nameNp: 'गाउँले घरको छाना',
          shape: 'triangle',
          shapeNp: 'त्रिभुज',
          x: 30,
          y: 28,
          icon: '🏠',
          discovered: false,
          explanationEn: 'Traditional village cottage roofs have a triangular gable.',
          explanationNp: 'नेपाली घरको छानाको छेउ त्रिभुज आकारको हुन्छ।',
        },
        {
          id: 'v_drum',
          nameEn: 'Village Madal (मादल)',
          nameNp: 'मादलको गोलो मुख',
          shape: 'circle',
          shapeNp: 'वृत्त',
          x: 20,
          y: 70,
          icon: '🥁',
          discovered: false,
          explanationEn: 'The traditional Nepali Madal head is a circular shape.',
          explanationNp: 'मादलको खरी लगाइएको गोलो मुख वृत्त आकारको छ।',
        },
        {
          id: 'v_window',
          nameEn: 'Carved Wooden Window',
          nameNp: 'काठको आँखीझ्याल',
          shape: 'quadrilateral',
          shapeNp: 'चतुर्भुज',
          x: 70,
          y: 30,
          icon: '🪟',
          discovered: false,
          explanationEn: 'The wooden window frame is a 4-sided quadrilateral.',
          explanationNp: 'नेपाली घरको काठको आँखीझ्याल चतुर्भुज आकारको छ।',
        },
        {
          id: 'v_door',
          nameEn: 'House Wooden Door',
          nameNp: 'काठको ढोका',
          shape: 'quadrilateral',
          shapeNp: 'चतुर्भुज',
          x: 52,
          y: 65,
          icon: '🚪',
          discovered: false,
          explanationEn: 'The tall wooden door is a 4-sided rectangular quadrilateral.',
          explanationNp: 'घरको काठको मूलढोका ४ वटा किनारा भएको चतुर्भुज हो।',
        },
        {
          id: 'v_well',
          nameEn: 'Village Well Rim',
          nameNp: 'गाउँको इनारको गोलो मुख',
          shape: 'circle',
          shapeNp: 'वृत्त',
          x: 82,
          y: 72,
          icon: '🕳️',
          discovered: false,
          explanationEn: 'The stone rim of the village drinking well is round.',
          explanationNp: 'गाउँको इनारको माथिल्लो घेरा गोलो वृत्त आकारको छ।',
        },
      ],
    },
  ];

  const [currentScene, setCurrentScene] = useState<LocationScene>(locations[0]);

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

  const playTone = (type: 'detect' | 'complete') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'detect') {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
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
      }
    } catch (e) {}
  };

  useEffect(() => {
    const sceneCopy = JSON.parse(JSON.stringify(locations[activeLocationIdx]));
    setCurrentScene(sceneCopy);
    setSelectedItem(null);
    speakText(
      `${sceneCopy.titleNp}। वरिपरिका वस्तुहरूमा लुकेका वृत्त, त्रिभुज र चतुर्भुज खोज्नुहोस्!`,
      `${sceneCopy.titleEn}. Discover hidden circles, triangles, and quadrilaterals!`
    );
  }, [activeLocationIdx, language]);

  // Click / discover item
  const handleItemClick = (item: DetectiveItem) => {
    playTone('detect');
    setSelectedItem(item);

    // Mark discovered
    const updated = currentScene.items.map((i) =>
      i.id === item.id ? { ...i, discovered: true } : i
    );
    setCurrentScene({ ...currentScene, items: updated });

    setStars((s) => s + 1);
    speakText(
      `फेला पर्‍यो! ${item.nameNp} को आकार ${item.shapeNp} हो। ${item.explanationNp}`,
      `Discovered! ${item.nameEn} is a ${item.shape}. ${item.explanationEn}`
    );

    // Check all discovered in location
    const allFound = updated.every((i) => i.discovered);
    if (allFound) {
      playTone('complete');
      saveProgress(100);
    }
  };

  const saveProgress = async (score: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH3-04/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, score),
          completedLevels: activeLocationIdx + 1,
          totalLevels: locations.length,
          starsEarned: stars + 3,
          timeSpentSeconds: 140,
        }),
      });
    } catch (e) {}
  };

  const discoveredCount = currentScene.items.filter((i) => i.discovered).length;
  const isLocationComplete = discoveredCount === currentScene.items.length;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
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
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0369a1' }}>
              {language === 'np' ? 'आकार खोजौँ (Shape Detective)' : 'Shape Detective'}
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {language === 'np'
                ? 'कक्षा १ गणित • अध्याय ३: ज्यामितीय आकारहरू (Geometrical Shapes)'
                : 'Class 1 Math • Chapter 3: Geometrical Shapes'}
            </span>
          </div>
        </div>

        {/* Location selector */}
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
            {locations.map((loc, idx) => (
              <button
                key={loc.id}
                onClick={() => setActiveLocationIdx(idx)}
                style={{
                  background: activeLocationIdx === idx ? '#0284c7' : 'transparent',
                  color: activeLocationIdx === idx ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {language === 'np' ? loc.titleNp.split(':')[1] : loc.titleEn.split(':')[1]}
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
        {/* Left Detective Checklist & Clues */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Search size={20} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {language === 'np' ? currentScene.titleNp : currentScene.titleEn}
              </h3>
            </div>
            <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              {language === 'np'
                ? 'दृश्यमा भएका वस्तुहरू पत्ता लगाउनुहोस् र तिनीहरूको ज्यामितीय आकार बुझ्नुहोस्।'
                : 'Click objects in the scene to inspect their hidden geometrical shapes.'}
            </p>

            {/* Progress indicator */}
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, color: '#0369a1' }}>
              🔍 {language === 'np' ? `पत्ता लागेका आकारहरू: ${discoveredCount} / ${currentScene.items.length}` : `Discovered: ${discoveredCount} of ${currentScene.items.length}`}
            </div>
          </div>

          {/* Detective Clues Checklist */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
              flex: 1,
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#475569' }}>
              {language === 'np' ? 'आकार खोज सूची (Detective Clues)' : 'Clue Checklist'}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentScene.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: item.discovered ? '#f0fdf4' : '#f8fafc',
                    border: item.discovered ? '1px solid #86efac' : '1px solid #e2e8f0',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: item.discovered ? '#15803d' : '#334155' }}>
                        {language === 'np' ? item.nameNp : item.nameEn}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {item.discovered
                          ? language === 'np'
                            ? `✓ आकार: ${item.shapeNp}`
                            : `✓ Shape: ${item.shape}`
                          : language === 'np'
                          ? 'खोज्न बाँकी'
                          : 'Hidden'}
                      </div>
                    </div>
                  </div>
                  {item.discovered ? <CheckCircle2 size={18} color="#16a34a" /> : <Eye size={18} color="#94a3b8" />}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Scene Environment Area */}
        <section
          style={{
            background: currentScene.bgGradient,
            borderRadius: '24px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '4px solid #ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Header Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <span style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              📍 {language === 'np' ? currentScene.titleNp : currentScene.titleEn}
            </span>
            <span style={{ background: 'rgba(15,23,42,0.8)', color: '#ffffff', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
              {language === 'np' ? 'वस्तुमा थिचेर आकार चिन्नुहोस् 🔍' : 'Tap objects to inspect shapes 🔍'}
            </span>
          </div>

          {/* Interactive Object Map Canvas */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              minHeight: '440px',
              marginTop: '16px',
            }}
          >
            {currentScene.items.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    position: 'absolute',
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: 'translate(-50%, -50%)',
                    background: item.discovered
                      ? 'rgba(255, 255, 255, 0.95)'
                      : 'rgba(255, 255, 255, 0.75)',
                    border: isSelected
                      ? '3px solid #0284c7'
                      : item.discovered
                      ? '2px solid #16a34a'
                      : '2px dashed #94a3b8',
                    borderRadius: '24px',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: isSelected
                      ? '0 12px 24px rgba(2,132,199,0.3)'
                      : '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '36px' }}>{item.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                      {language === 'np' ? item.nameNp : item.nameEn}
                    </div>
                    {item.discovered && (
                      <span
                        style={{
                          background:
                            item.shape === 'circle'
                              ? '#dcfce7'
                              : item.shape === 'triangle'
                              ? '#fee2e2'
                              : '#dbeafe',
                          color:
                            item.shape === 'circle'
                              ? '#15803d'
                              : item.shape === 'triangle'
                              ? '#b91c1c'
                              : '#1d4ed8',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        {language === 'np' ? item.shapeNp : item.shape}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Item Inspector Panel */}
          {selectedItem && (
            <div
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px',
                padding: '16px 20px',
                border: '2px solid #0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 20,
                marginTop: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '32px' }}>{selectedItem.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                    {language === 'np' ? selectedItem.nameNp : selectedItem.nameEn} • {language === 'np' ? selectedItem.shapeNp : selectedItem.shape.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', marginTop: '2px' }}>
                    {language === 'np' ? selectedItem.explanationNp : selectedItem.explanationEn}
                  </div>
                </div>
              </div>

              <button
                onClick={() => speakText(selectedItem.explanationNp, selectedItem.explanationEn)}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                }}
              >
                <Volume2 size={16} /> {language === 'np' ? 'सुन्नुहोस्' : 'Listen'}
              </button>
            </div>
          )}

          {/* Location Completed Card */}
          {isLocationComplete && (
            <div
              style={{
                background: '#10b981',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={28} />
                <span style={{ fontWeight: 800, fontSize: '15px' }}>
                  {language === 'np'
                    ? 'बधाई छ! यस स्थानका सबै आकारहरू पत्ता लागे!'
                    : 'Congratulations! All shapes discovered in this location!'}
                </span>
              </div>

              {activeLocationIdx < locations.length - 1 ? (
                <button
                  onClick={() => setActiveLocationIdx((idx) => idx + 1)}
                  style={{
                    background: '#ffffff',
                    color: '#065f46',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {language === 'np' ? 'अर्को स्थान' : 'Next Location'}
                </button>
              ) : (
                <button
                  onClick={onBackToLibrary}
                  style={{
                    background: '#ffffff',
                    color: '#0284c7',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
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
export default ShapeDetectiveSimulation;

