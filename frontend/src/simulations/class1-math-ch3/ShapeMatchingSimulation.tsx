/**
 * ShapeMatchingSimulation.tsx
 * Simulation 02: Match the Shape (वस्तु र आकार मिलाऔँ)
 * Class 1 Mathematics - Chapter 3: Geometrical Shapes (ज्यामितीय आकारहरू)
 * Based on Nepal CDC Curriculum (मेरो गणित, कक्षा १ - २०७६)
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
  Shapes,
  HelpCircle,
  Clock,
  BookOpen,
  Square,
  Circle,
  Triangle,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

type ShapeType = 'circle' | 'triangle' | 'quadrilateral';

interface MatchItem {
  id: string;
  nameEn: string;
  nameNp: string;
  category: ShapeType;
  categoryNp: string;
  icon: string;
  hintEn: string;
  hintNp: string;
}

export const ShapeMatchingSimulation: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Round Progression (1: 4 items, 2: 6 items, 3: 8 items)
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [stars, setStars] = useState(0);

  // Pool of real-world objects
  const allObjects: MatchItem[] = [
    // Circle items
    {
      id: 'plate',
      nameEn: 'Dining Plate',
      nameNp: 'थाली',
      category: 'circle',
      categoryNp: 'वृत्त',
      icon: '🍽️',
      hintEn: 'The round surface of a dining plate is a circle.',
      hintNp: 'थालीको सतह गोलो वृत्त आकारको हुन्छ।',
    },
    {
      id: 'clock',
      nameEn: 'Wall Clock',
      nameNp: 'भित्ते घडी',
      category: 'circle',
      categoryNp: 'वृत्त',
      icon: '⏰',
      hintEn: 'The circular clock face has no straight edges.',
      hintNp: 'घडीको गोलो मुख वृत्त आकारको छ।',
    },
    {
      id: 'drum',
      nameEn: 'Drum Face (Madal)',
      nameNp: 'मादलको मुख',
      category: 'circle',
      categoryNp: 'वृत्त',
      icon: '🥁',
      hintEn: 'The leather face of a traditional drum is round.',
      hintNp: 'मादलको बजाउने गोलो छाला वृत्त आकारको छ।',
    },
    {
      id: 'wheel',
      nameEn: 'Cart Wheel',
      nameNp: 'गाडाको पाङ्ग्रा',
      category: 'circle',
      categoryNp: 'वृत्त',
      icon: '🎡',
      hintEn: 'A rolling wheel is a circle.',
      hintNp: 'गुड्ने पाङ्ग्रा पूरै गोलो वृत्त आकारको हुन्छ।',
    },

    // Triangle items
    {
      id: 'sign',
      nameEn: 'Traffic Sign',
      nameNp: 'ट्राफिक सङ्केत',
      category: 'triangle',
      categoryNp: 'त्रिभुज',
      icon: '⚠️',
      hintEn: 'Count the 3 straight edges of the sign.',
      hintNp: 'यो ट्राफिक बोर्डमा ३ वटा सिधा किनारा छन्।',
    },
    {
      id: 'roof',
      nameEn: 'Cottage Roof',
      nameNp: 'घरको छाना',
      category: 'triangle',
      categoryNp: 'त्रिभुज',
      icon: '🏠',
      hintEn: 'The roof gable forms a 3-cornered triangle.',
      hintNp: 'घरको छाना ३ वटा कुना भएको त्रिभुज आकारको छ।',
    },
    {
      id: 'pennant',
      nameEn: 'Triangular Flag',
      nameNp: 'त्रिकोणात्मक झन्डा',
      category: 'triangle',
      categoryNp: 'त्रिभुज',
      icon: '🚩',
      hintEn: 'The festive flag has 3 sides and 3 corners.',
      hintNp: 'मेलाको ध्वजा ३ वटा किनारा भएको त्रिभुज हो।',
    },
    {
      id: 'hanger',
      nameEn: 'Clothes Hanger',
      nameNp: 'कपडा झुन्ड्याउने ह्याङ्गर',
      category: 'triangle',
      categoryNp: 'त्रिभुज',
      icon: '📐',
      hintEn: 'The hanger is shaped like a triangle.',
      hintNp: 'ह्याङ्गरको आकार त्रिभुज जस्तो छ।',
    },

    // Quadrilateral items
    {
      id: 'book',
      nameEn: 'Math Textbook',
      nameNp: 'गणित किताब',
      category: 'quadrilateral',
      categoryNp: 'चतुर्भुज',
      icon: '📕',
      hintEn: 'The book cover has 4 straight sides.',
      hintNp: 'किताबको कभरमा चारवटा सिधा किनारा हुन्छन्।',
    },
    {
      id: 'door',
      nameEn: 'Classroom Door',
      nameNp: 'ढोका',
      category: 'quadrilateral',
      categoryNp: 'चतुर्भुज',
      icon: '🚪',
      hintEn: 'The door has 4 straight sides and 4 corners.',
      hintNp: 'ढोका ४ वटा सिधा किनारा भएको चतुर्भुज हो।',
    },
    {
      id: 'window',
      nameEn: 'Window Frame',
      nameNp: 'झ्याल',
      category: 'quadrilateral',
      categoryNp: 'चतुर्भुज',
      icon: '🪟',
      hintEn: 'The square window frame has 4 corners.',
      hintNp: 'झ्यालको फ्रेम ४ वटा कुना भएको चतुर्भुज हो।',
    },
    {
      id: 'gift',
      nameEn: 'Gift Box Face',
      nameNp: 'उपहारको बट्टा',
      category: 'quadrilateral',
      categoryNp: 'चतुर्भुज',
      icon: '🎁',
      hintEn: 'The face of a box has 4 straight edges.',
      hintNp: 'बट्टाको मुख चार किनारा भएको चतुर्भुज हो।',
    },
  ];

  // Active round items
  const [activeItems, setActiveItems] = useState<MatchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);

  // Placed items in bins: category -> item[]
  const [placedBins, setPlacedBins] = useState<{
    circle: MatchItem[];
    triangle: MatchItem[];
    quadrilateral: MatchItem[];
  }>({ circle: [], triangle: [], quadrilateral: [] });

  const [feedback, setFeedback] = useState<{ isSuccess: boolean; textNp: string; textEn: string } | null>(null);
  const [isRoundComplete, setIsRoundComplete] = useState(false);

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

  const playTone = (type: 'success' | 'click' | 'error') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
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
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {}
  };

  // Setup round
  useEffect(() => {
    let count = 4;
    if (currentRound === 2) count = 8;
    if (currentRound === 3) count = 12;

    const roundItems = allObjects.slice(0, count);
    setActiveItems(roundItems);
    setPlacedBins({ circle: [], triangle: [], quadrilateral: [] });
    setSelectedItem(null);
    setFeedback(null);
    setIsRoundComplete(false);

    speakText(
      'वस्तुलाई छान्नुहोस् र त्यसको सही आकार (वृत्त, त्रिभुज वा चतुर्भुज) को बाकसमा राख्नुहोस्!',
      'Select each object and place it into the matching shape box: Circle, Triangle, or Quadrilateral!'
    );
  }, [currentRound, language]);

  // Handle dropping / placing item into bin
  const handlePlaceInBin = (targetBin: ShapeType) => {
    if (!selectedItem) {
      playTone('error');
      speakText('पहिले माथिबाट कुनै वस्तु छान्नुहोस्!', 'Please select an object first!');
      return;
    }

    if (selectedItem.category === targetBin) {
      // Correct match!
      playTone('success');
      setStars((s) => s + 2);

      const updatedRemaining = activeItems.filter((i) => i.id !== selectedItem.id);
      setActiveItems(updatedRemaining);

      setPlacedBins((prev) => ({
        ...prev,
        [targetBin]: [...prev[targetBin], selectedItem],
      }));

      setFeedback({
        isSuccess: true,
        textNp: `स्याबास! ${selectedItem.nameNp} को आकार ${selectedItem.categoryNp} हो।`,
        textEn: `Great! ${selectedItem.nameEn} has a ${selectedItem.category} shape.`,
      });
      speakText(
        `स्याबास! ${selectedItem.nameNp} को आकार ${selectedItem.categoryNp} हो।`,
        `Great! ${selectedItem.nameEn} is a ${selectedItem.category}.`
      );

      setSelectedItem(null);

      // Check if all placed
      if (updatedRemaining.length === 0) {
        setIsRoundComplete(true);
        saveProgress(100);
      }
    } else {
      // Incorrect match
      playTone('error');
      const binNp = targetBin === 'circle' ? 'वृत्त' : targetBin === 'triangle' ? 'त्रिभुज' : 'चतुर्भुज';
      setFeedback({
        isSuccess: false,
        textNp: `${selectedItem.nameNp} ${binNp} होइन। यसको किनारा र कुना फेरि हेर्नुहोस्।`,
        textEn: `${selectedItem.nameEn} is not a ${targetBin}. Check its corners and edges.`,
      });
      speakText('पुनः प्रयास गर्नुहोस्', 'Try again');
    }
  };

  const handleReset = () => {
    let count = currentRound === 1 ? 4 : currentRound === 2 ? 8 : 12;
    setActiveItems(allObjects.slice(0, count));
    setPlacedBins({ circle: [], triangle: [], quadrilateral: [] });
    setSelectedItem(null);
    setFeedback(null);
    setIsRoundComplete(false);
  };

  const saveProgress = async (score: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH3-02/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, score),
          completedLevels: currentRound,
          totalLevels: 3,
          starsEarned: stars + 4,
          timeSpentSeconds: 120,
        }),
      });
    } catch (e) {}
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #fef3c7 100%)',
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
              {language === 'np' ? 'वस्तु र आकार मिलाऔँ' : 'Match the Shape'}
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {language === 'np'
                ? 'कक्षा १ गणित • अध्याय ३: ज्यामितीय आकारहरू (Geometrical Shapes)'
                : 'Class 1 Math • Chapter 3: Geometrical Shapes'}
            </span>
          </div>
        </div>

        {/* Controls */}
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

          {/* Round Buttons */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '3px' }}>
            {[1, 2, 3].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setCurrentRound(r);
                  playTone('click');
                }}
                style={{
                  background: currentRound === r ? '#059669' : 'transparent',
                  color: currentRound === r ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {language === 'np' ? `चरण ${r}` : `Round ${r}`}
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

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxSizing: 'border-box',
        }}
      >
        {/* Instruction & Status Bar */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '16px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            border: '2px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              {language === 'np'
                ? 'वस्तुलाई छान्नुहोस् र तलको मिल्दो आकारको बाकसमा थिच्नुहोस्'
                : 'Select an object above, then tap its matching shape box below'}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {language === 'np'
                ? `बाँकी वस्तुहरू: ${activeItems.length}`
                : `Remaining Objects: ${activeItems.length}`}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <RotateCcw size={16} /> {language === 'np' ? 'पुनः मिलाउनुहोस्' : 'Reset Round'}
            </button>
          </div>
        </div>

        {/* Top: Objects Carousel / Tray */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            border: '2px solid #e2e8f0',
            minHeight: '140px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
            {language === 'np' ? 'छान्न बाँकी वस्तुहरू' : 'Objects to Categorize'}
          </span>

          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              marginTop: '12px',
            }}
          >
            {activeItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    playTone('click');
                    speakText(
                      `${item.nameNp}। यसको आकार कुन हो?`,
                      `${item.nameEn}. Which shape does it match?`
                    );
                  }}
                  style={{
                    background: isSelected ? '#dbeafe' : '#f8fafc',
                    border: isSelected ? '3px solid #2563eb' : '2px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.05)' : 'none',
                    boxShadow: isSelected ? '0 8px 20px rgba(37,99,235,0.2)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{item.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                      {language === 'np' ? item.nameNp : item.nameEn}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {language === 'np' ? 'छान्नुहोस्' : 'Select'}
                    </div>
                  </div>
                </button>
              );
            })}

            {activeItems.length === 0 && (
              <div
                style={{
                  width: '100%',
                  textAlign: 'center',
                  padding: '24px',
                  color: '#15803d',
                  fontWeight: 800,
                  fontSize: '18px',
                }}
              >
                🎉 {language === 'np' ? 'सबै वस्तुहरू मिलिसके!' : 'All objects matched successfully!'}
              </div>
            )}
          </div>
        </div>

        {/* Feedback Alert Bar */}
        {feedback && (
          <div
            style={{
              background: feedback.isSuccess ? '#dcfce7' : '#fee2e2',
              border: feedback.isSuccess ? '1px solid #86efac' : '1px solid #fca5a5',
              padding: '12px 20px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {feedback.isSuccess ? <CheckCircle2 size={24} color="#15803d" /> : <HelpCircle size={24} color="#b91c1c" />}
            <span style={{ fontWeight: 800, fontSize: '14px', color: feedback.isSuccess ? '#166534' : '#991b1b' }}>
              {language === 'np' ? feedback.textNp : feedback.textEn}
            </span>
          </div>
        )}

        {/* Bottom: 3 Geometric Target Bins (Circle, Triangle, Quadrilateral) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            flex: 1,
          }}
        >
          {/* Bin 1: Circle (वृत्त) */}
          <div
            onClick={() => handlePlaceInBin('circle')}
            style={{
              background: '#f0fdf4',
              border: '3px dashed #10b981',
              borderRadius: '24px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              cursor: selectedItem ? 'pointer' : 'default',
              boxShadow: '0 8px 24px rgba(16,185,129,0.08)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Circle size={20} fill="#ffffff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                  {language === 'np' ? 'वृत्त (Circle)' : 'Circle (वृत्त)'}
                </h3>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                  {language === 'np' ? 'गोलो आकार' : 'Round, no corners'}
                </span>
              </div>
            </div>

            {/* Dropped objects list */}
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px', alignContent: 'flex-start' }}>
              {placedBins.circle.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '2px solid #10b981',
                    borderRadius: '14px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#065f46',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{language === 'np' ? item.nameNp : item.nameEn}</span>
                </div>
              ))}
              {placedBins.circle.length === 0 && (
                <div style={{ width: '100%', textAlign: 'center', color: '#6ee7b7', padding: '30px', fontSize: '13px' }}>
                  {language === 'np' ? 'यहाँ वृत्त आकारका वस्तु राख्नुहोस्' : 'Place circular items here'}
                </div>
              )}
            </div>
          </div>

          {/* Bin 2: Triangle (त्रिभुज) */}
          <div
            onClick={() => handlePlaceInBin('triangle')}
            style={{
              background: '#fef2f2',
              border: '3px dashed #ef4444',
              borderRadius: '24px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              cursor: selectedItem ? 'pointer' : 'default',
              boxShadow: '0 8px 24px rgba(239,68,68,0.08)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Triangle size={20} fill="#ffffff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#991b1b' }}>
                  {language === 'np' ? 'त्रिभुज (Triangle)' : 'Triangle (त्रिभुज)'}
                </h3>
                <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
                  {language === 'np' ? '३ वटा सिधा किनारा' : '3 straight sides, 3 corners'}
                </span>
              </div>
            </div>

            {/* Dropped objects list */}
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px', alignContent: 'flex-start' }}>
              {placedBins.triangle.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '2px solid #ef4444',
                    borderRadius: '14px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#991b1b',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{language === 'np' ? item.nameNp : item.nameEn}</span>
                </div>
              ))}
              {placedBins.triangle.length === 0 && (
                <div style={{ width: '100%', textAlign: 'center', color: '#fca5a5', padding: '30px', fontSize: '13px' }}>
                  {language === 'np' ? 'यहाँ त्रिभुज आकारका वस्तु राख्नुहोस्' : 'Place triangular items here'}
                </div>
              )}
            </div>
          </div>

          {/* Bin 3: Quadrilateral (चतुर्भुज) */}
          <div
            onClick={() => handlePlaceInBin('quadrilateral')}
            style={{
              background: '#eff6ff',
              border: '3px dashed #2563eb',
              borderRadius: '24px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              cursor: selectedItem ? 'pointer' : 'default',
              boxShadow: '0 8px 24px rgba(37,99,235,0.08)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Square size={20} fill="#ffffff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#1e40af' }}>
                  {language === 'np' ? 'चतुर्भुज (Quadrilateral)' : 'Quadrilateral (चतुर्भुज)'}
                </h3>
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                  {language === 'np' ? '४ वटा सिधा किनारा' : '4 straight sides, 4 corners'}
                </span>
              </div>
            </div>

            {/* Dropped objects list */}
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px', alignContent: 'flex-start' }}>
              {placedBins.quadrilateral.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '2px solid #2563eb',
                    borderRadius: '14px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#1e40af',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{language === 'np' ? item.nameNp : item.nameEn}</span>
                </div>
              ))}
              {placedBins.quadrilateral.length === 0 && (
                <div style={{ width: '100%', textAlign: 'center', color: '#93c5fd', padding: '30px', fontSize: '13px' }}>
                  {language === 'np' ? 'यहाँ चतुर्भुज आकारका वस्तु राख्नुहोस्' : 'Place quadrilateral items here'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Round Completion Modal Banner */}
        {isRoundComplete && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px 32px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
              border: '2px solid #10b981',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Trophy size={40} color="#f59e0b" />
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#065f46' }}>
                  {language === 'np' ? 'अति उत्तम! सबै वस्तुहरू सही मिल्यो!' : 'Splendid! All items matched correctly!'}
                </h3>
                <span style={{ fontSize: '14px', color: '#047857' }}>
                  {language === 'np'
                    ? `तपाईंले चरण ${currentRound} सफलतापूर्वक पूरा गर्नुभयो।`
                    : `You completed Round ${currentRound} successfully.`}
                </span>
              </div>
            </div>

            {currentRound < 3 ? (
              <button
                onClick={() => setCurrentRound((r) => r + 1)}
                style={{
                  background: '#059669',
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
                {language === 'np' ? 'अर्को चरण (Next Round)' : 'Next Round'}
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
                {language === 'np' ? 'सम्पन्न भयो (Library)' : 'Finish to Library'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default ShapeMatchingSimulation;

