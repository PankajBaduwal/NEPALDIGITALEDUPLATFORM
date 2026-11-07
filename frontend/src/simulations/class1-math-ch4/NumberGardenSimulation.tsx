/**
 * NumberGardenSimulation.tsx
 * Simulation 02: Number Garden 1–9 (१ देखि ९ सम्म गनौँ)
 * Class 1 Mathematics - Chapter 4: Numbers up to 9 (९ सम्मका सङ्ख्याहरू)
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
  Hand,
  Flower2,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface CountableItem {
  id: number;
  counted: boolean;
  x: number; // percentage
  y: number;
  rotation: number;
}

interface NumberStage {
  num: number;
  numNp: string;
  nameEn: string;
  nameNp: string;
  itemNameEn: string;
  itemNameNp: string;
  icon: string;
  items: CountableItem[];
}

export const NumberGardenSimulation: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Target Number (1 to 9)
  const [activeNumber, setActiveNumber] = useState<number>(1);
  const [countedCount, setCountedCount] = useState<number>(0);
  const [stars, setStars] = useState(0);
  const [stageCompleted, setStageCompleted] = useState(false);

  // Numbers 1 to 9 configuration
  const numberStages: Record<number, {
    numNp: string;
    nameEn: string;
    nameNp: string;
    itemNameEn: string;
    itemNameNp: string;
    icon: string;
    positions: { x: number; y: number }[];
  }> = {
    1: { numNp: '१', nameEn: 'One', nameNp: 'एक', itemNameEn: 'Mushroom', itemNameNp: 'च्याउ', icon: '🍄', positions: [{ x: 50, y: 50 }] },
    2: { numNp: '२', nameEn: 'Two', nameNp: 'दुई', itemNameEn: 'Butterflies', itemNameNp: 'पुतली', icon: '🦋', positions: [{ x: 35, y: 45 }, { x: 65, y: 55 }] },
    3: { numNp: '३', nameEn: 'Three', nameNp: 'तीन', itemNameEn: 'Rabbits', itemNameNp: 'खरायो', icon: '🐇', positions: [{ x: 30, y: 60 }, { x: 50, y: 40 }, { x: 70, y: 60 }] },
    4: { numNp: '४', nameEn: 'Four', nameNp: 'चार', itemNameEn: 'Apples', itemNameNp: 'स्याउ', icon: '🍎', positions: [{ x: 28, y: 35 }, { x: 45, y: 65 }, { x: 60, y: 35 }, { x: 75, y: 65 }] },
    5: { numNp: '५', nameEn: 'Five', nameNp: 'पाँच', itemNameEn: 'Balloons', itemNameNp: 'बेलुन', icon: '🎈', positions: [{ x: 25, y: 40 }, { x: 40, y: 25 }, { x: 50, y: 60 }, { x: 65, y: 30 }, { x: 78, y: 50 }] },
    6: { numNp: '६', nameEn: 'Six', nameNp: 'छ', itemNameEn: 'Mangoes', itemNameNp: 'आँप', icon: '🥭', positions: [{ x: 22, y: 35 }, { x: 36, y: 60 }, { x: 50, y: 30 }, { x: 64, y: 65 }, { x: 75, y: 35 }, { x: 50, y: 70 }] },
    7: { numNp: '७', nameEn: 'Seven', nameNp: 'सात', itemNameEn: 'Fish', itemNameNp: 'माछा', icon: '🐟', positions: [{ x: 20, y: 50 }, { x: 32, y: 30 }, { x: 44, y: 65 }, { x: 56, y: 35 }, { x: 68, y: 60 }, { x: 80, y: 40 }, { x: 50, y: 50 }] },
    8: { numNp: '८', nameEn: 'Eight', nameNp: 'आठ', itemNameEn: 'Birds', itemNameNp: 'चरा', icon: '🐦', positions: [{ x: 18, y: 35 }, { x: 30, y: 60 }, { x: 40, y: 30 }, { x: 50, y: 65 }, { x: 60, y: 35 }, { x: 70, y: 60 }, { x: 82, y: 30 }, { x: 50, y: 45 }] },
    9: { numNp: '९', nameEn: 'Nine', nameNp: 'नौ', itemNameEn: 'Flowers', itemNameNp: 'फूल', icon: '🌸', positions: [{ x: 20, y: 30 }, { x: 35, y: 25 }, { x: 50, y: 20 }, { x: 65, y: 25 }, { x: 80, y: 30 }, { x: 28, y: 65 }, { x: 42, y: 70 }, { x: 58, y: 70 }, { x: 72, y: 65 }] },
  };

  const currentConfig = numberStages[activeNumber];
  const [items, setItems] = useState<CountableItem[]>([]);

  // Audio speech
  const speakText = (npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const playChime = (countNumber: number) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33];
      const freq = scale[(countNumber - 1) % scale.length];

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
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
        g.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.1);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + idx * 0.1 + 0.35);
        o.start(ctx.currentTime + idx * 0.1);
        o.stop(ctx.currentTime + idx * 0.1 + 0.35);
      });
    } catch (e) {}
  };

  // Initialize stage
  useEffect(() => {
    const freshItems = currentConfig.positions.map((p, i) => ({
      id: i + 1,
      counted: false,
      x: p.x,
      y: p.y,
      rotation: (Math.random() - 0.5) * 20,
    }));
    setItems(freshItems);
    setCountedCount(0);
    setStageCompleted(false);

    speakText(
      `सङ्ख्या ${currentConfig.numNp} (${currentConfig.nameNp})। बगैँचामा भएका ${currentConfig.itemNameNp}लाई छोएर गन्नुहोस्!`,
      `Number ${activeNumber} (${currentConfig.nameEn}). Touch and count the ${currentConfig.itemNameEn}!`
    );
  }, [activeNumber, language]);

  // Touch/count an item
  const handleItemTouch = (item: CountableItem) => {
    if (item.counted) return; // Prevent double counting!

    const newCount = countedCount + 1;
    playChime(newCount);

    const updated = items.map((i) => (i.id === item.id ? { ...i, counted: true } : i));
    setItems(updated);
    setCountedCount(newCount);

    const countWordNp = ['एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ'][newCount - 1] || `${newCount}`;
    speakText(countWordNp, `${newCount}`);

    // If all counted
    if (newCount === activeNumber) {
      setStageCompleted(true);
      playFanfare();
      setStars((s) => s + 2);
      speakText(
        `स्याबास! यहाँ जम्मा ${currentConfig.numNp} (${currentConfig.nameNp}) वटा ${currentConfig.itemNameNp} छन्!`,
        `Splendid! There are ${activeNumber} (${currentConfig.nameEn}) ${currentConfig.itemNameEn} in total!`
      );
      saveProgress(100);
    }
  };

  const handleResetStage = () => {
    setItems(items.map((i) => ({ ...i, counted: false })));
    setCountedCount(0);
    setStageCompleted(false);
  };

  const handleNextNumber = () => {
    if (activeNumber < 9) {
      setActiveNumber((n) => n + 1);
    } else {
      speakText('बधाई छ! तपाईंले १ देखि ९ सम्मका सबै वस्तुहरू गनिसक्नुभयो!', 'Congratulations! You counted all numbers 1 to 9!');
    }
  };

  const saveProgress = async (score: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH4-02/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, score),
          completedLevels: activeNumber,
          totalLevels: 9,
          starsEarned: stars + 2,
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
        background: 'linear-gradient(135deg, #ecfdf5 0%, #fef3c7 50%, #eff6ff 100%)',
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
              {language === 'np' ? '१ देखि ९ सम्म गनौँ' : 'Number Garden 1–9'}
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {language === 'np' ? 'कक्षा १ गणित • अध्याय ४: ९ सम्मका सङ्ख्याहरू' : 'Class 1 Math • Chapter 4: Numbers up to 9'}
            </span>
          </div>
        </div>

        {/* Number Tray 1 to 9 */}
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
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setActiveNumber(num)}
                style={{
                  background: activeNumber === num ? '#059669' : 'transparent',
                  color: activeNumber === num ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  minWidth: '28px',
                }}
              >
                {language === 'np' ? numberStages[num].numNp : num}
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

      {/* Main Workspace Layout */}
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
        {/* Left Number Card & Instruction */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Giant Number Showcase */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px 20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '72px', fontWeight: 900, color: '#059669', lineHeight: 1 }}>
              {language === 'np' ? currentConfig.numNp : activeNumber}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              {language === 'np' ? currentConfig.nameNp : currentConfig.nameEn}
            </div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
              {language === 'np'
                ? `अङ्ग्रेजी: ${activeNumber} (${currentConfig.nameEn})`
                : `Nepali: ${currentConfig.numNp} (${currentConfig.nameNp})`}
            </span>

            <div
              style={{
                marginTop: '16px',
                background: '#f0fdf4',
                padding: '12px',
                borderRadius: '14px',
                border: '1px solid #86efac',
                fontSize: '14px',
                fontWeight: 700,
                color: '#166534',
              }}
            >
              {language === 'np'
                ? `गनेको: ${countedCount} / ${activeNumber}`
                : `Counted: ${countedCount} of ${activeNumber}`}
            </div>
          </div>

          {/* Action & Listening */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              border: '2px solid #e2e8f0',
            }}
          >
            <button
              onClick={() =>
                speakText(
                  `सङ्ख्या ${currentConfig.numNp} (${currentConfig.nameNp})। ${currentConfig.itemNameNp}लाई गन्नुहोस्।`,
                  `Number ${activeNumber} (${currentConfig.nameEn}). Count the ${currentConfig.itemNameEn}.`
                )
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center',
                background: '#e0f2fe',
                color: '#0369a1',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '10px',
              }}
            >
              <Volume2 size={16} /> {language === 'np' ? 'सङ्ख्या उच्चारण सुन्नुहोस्' : 'Hear Pronunciation'}
            </button>

            <button
              onClick={handleResetStage}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '10px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={16} /> {language === 'np' ? 'फेरि गन्नुहोस् (Recount)' : 'Recount'}
            </button>
          </div>
        </aside>

        {/* Right Garden Playground Surface */}
        <section
          style={{
            background: 'linear-gradient(180deg, #bae6fd 0%, #dcfce7 60%, #86efac 100%)',
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
          {/* Header Legend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <span style={{ background: 'rgba(255,255,255,0.9)', padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              🌷 {language === 'np' ? `बगैँचा: ${currentConfig.itemNameNp} गनौँ` : `Count the ${currentConfig.itemNameEn}`}
            </span>
            <span style={{ background: 'rgba(15,23,42,0.8)', color: '#ffffff', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
              {language === 'np' ? 'प्रत्येक वस्तुलाई छुनुहोस् 👆' : 'Touch each object to count 👆'}
            </span>
          </div>

          {/* Interactive Garden Scene */}
          <div
            style={{
              flex: 1,
              minHeight: '440px',
              position: 'relative',
            }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemTouch(item)}
                style={{
                  position: 'absolute',
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.counted ? 1.15 : 1})`,
                  background: item.counted ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.75)',
                  border: item.counted ? '3px solid #16a34a' : '2px dashed #64748b',
                  borderRadius: '50%',
                  width: '76px',
                  height: '76px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: item.counted ? 'default' : 'pointer',
                  boxShadow: item.counted
                    ? '0 8px 24px rgba(22,163,74,0.3)'
                    : '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <span style={{ fontSize: '32px' }}>{currentConfig.icon}</span>
                {item.counted && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#16a34a',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      fontSize: '12px',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Stage Completed Banner */}
          {stageCompleted && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '20px 24px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                border: '2px solid #10b981',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Trophy size={36} color="#f59e0b" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                    {language === 'np'
                      ? `स्याबास! तपाईंले ${currentConfig.numNp} वटा ${currentConfig.itemNameNp} गन्नुभयो!`
                      : `Great! You counted all ${activeNumber} ${currentConfig.itemNameEn}!`}
                  </h3>
                  <span style={{ fontSize: '13px', color: '#047857' }}>
                    {language === 'np'
                      ? `${activeNumber} = ${currentConfig.numNp} (${currentConfig.nameNp})`
                      : `${activeNumber} = ${currentConfig.nameEn}`}
                  </span>
                </div>
              </div>

              {activeNumber < 9 ? (
                <button
                  onClick={handleNextNumber}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {language === 'np' ? `अर्को सङ्ख्या (${activeNumber + 1})` : `Next Number (${activeNumber + 1})`}
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
                    fontSize: '14px',
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
export default NumberGardenSimulation;

