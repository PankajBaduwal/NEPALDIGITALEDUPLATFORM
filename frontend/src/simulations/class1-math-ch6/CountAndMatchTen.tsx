/**
 * CountAndMatchTen.tsx
 * Simulation 04: Count and Match Ten (गनेर दशसँग मिलाऔँ)
 * Class 1 Mathematics - Chapter 6: Ten (दश)
 * Nepal Digital Education Platform
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Award,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface MatchScene {
  id: string;
  titleNp: string;
  titleEn: string;
  itemNameNp: string;
  itemNameEn: string;
  icon: string;
  actualCount: number;
  options: number[];
  targetCardNp: string;
  targetCardEn: string;
  bgGradient: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दश'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

export const CountAndMatchTen: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Navigation & Settings
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scenes to count and match
  const scenes: MatchScene[] = [
    {
      id: 'FLOWERS',
      titleNp: 'बगैँचाका फूलहरू गनौँ',
      titleEn: 'Count Flowers in Garden',
      itemNameNp: 'फूलहरू',
      itemNameEn: 'Flowers',
      icon: '🌸',
      actualCount: 10,
      options: [8, 10, 6],
      targetCardNp: '१० (दश)',
      targetCardEn: '10 (Ten)',
      bgGradient: 'linear-gradient(135deg, #15803d, #166534)',
    },
    {
      id: 'FISH',
      titleNp: 'पोखरीका माछाहरू गनौँ',
      titleEn: 'Count Fish in Pond',
      itemNameNp: 'माछाहरू',
      itemNameEn: 'Fish',
      icon: '🐟',
      actualCount: 10,
      options: [7, 10, 9],
      targetCardNp: '१० (दश)',
      targetCardEn: '10 (Ten)',
      bgGradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    },
    {
      id: 'PENCILS',
      titleNp: 'कक्षाकोठाका सिसाकलम गनौँ',
      titleEn: 'Count Pencils in Classroom',
      itemNameNp: 'सिसाकलमहरू',
      itemNameEn: 'Pencils',
      icon: '✏️',
      actualCount: 10,
      options: [10, 8, 5],
      targetCardNp: '१० (दश)',
      targetCardEn: '10 (Ten)',
      bgGradient: 'linear-gradient(135deg, #b45309, #78350f)',
    },
    {
      id: 'APPLES',
      titleNp: 'बजारका स्याउहरू गनौँ',
      titleEn: 'Count Apples in Market',
      itemNameNp: 'स्याउहरू',
      itemNameEn: 'Apples',
      icon: '🍎',
      actualCount: 10,
      options: [9, 10, 7],
      targetCardNp: '१० (दश)',
      targetCardEn: '10 (Ten)',
      bgGradient: 'linear-gradient(135deg, #dc2626, #991b1b)',
    },
    {
      id: 'BIRDS',
      titleNp: 'रुखका चराहरू गनौँ',
      titleEn: 'Count Birds on Tree',
      itemNameNp: 'चराहरू',
      itemNameEn: 'Birds',
      icon: '🐦',
      actualCount: 10,
      options: [10, 6, 8],
      targetCardNp: '१० (दश)',
      targetCardEn: '10 (Ten)',
      bgGradient: 'linear-gradient(135deg, #0d9488, #115e59)',
    },
  ];

  // Active Scene Index
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const activeScene = scenes[currentSceneIdx];

  // User click on individual items for interactive counting
  const [clickedItemIndices, setClickedItemIndices] = useState<number[]>([]);
  const [selectedMatchChoice, setSelectedMatchChoice] = useState<number | null>(null);
  const [sceneFeedback, setSceneFeedback] = useState<boolean | null>(null);

  // Stars
  const [stars, setStars] = useState<number>(0);

  // Helper formatting
  const formatNum = (n: number): string => (language === 'np' ? NEP_DIGITS[n] : n.toString());
  const formatName = (n: number): string => (language === 'np' ? NEP_NAMES[n] : EN_NAMES[n]);

  // Audio Speech Synthesis
  const speakText = useCallback((npText: string, enText: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = language === 'np' ? npText : enText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'np' ? 'ne-NP' : 'en-US';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }, [language, soundEnabled]);

  // Tone Synthesis
  const playTone = useCallback((freq = 523.25, type: OscillatorType = 'sine', duration = 0.25) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext unavailable
    }
  }, [soundEnabled]);

  // Save Progress API
  const saveProgress = async (newStars: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH6-04/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, newStars * 15),
          completionStatus: newStars >= 5 ? 'COMPLETED' : 'IN_PROGRESS',
          timeSpentSeconds: 150,
          attemptsCount: 1,
          metadata: {
            stars: newStars,
            scene: activeScene.id,
          },
        }),
      });
    } catch {
      // Ignore background errors
    }
  };

  // Reset Scene
  const resetScene = (idx: number) => {
    setCurrentSceneIdx(idx);
    setClickedItemIndices([]);
    setSelectedMatchChoice(null);
    setSceneFeedback(null);
    speakText(
      `${scenes[idx].titleNp}। वस्तुहरूमा थिचेर गन्नुहोस् र सही सङ्ख्या छान्नुहोस्।`,
      `${scenes[idx].titleEn}. Tap items to count and pick the correct number.`
    );
  };

  // Click on item to count
  const handleItemClick = (idx: number) => {
    if (clickedItemIndices.includes(idx)) return;
    const next = [...clickedItemIndices, idx];
    setClickedItemIndices(next);
    const count = next.length;
    playTone(400 + count * 45, 'triangle', 0.2);

    if (count === activeScene.actualCount) {
      speakText(`१० वटा पुग्यो! अब सङ्ख्या कार्ड छान्नुहोस्।`, `Ten reached! Now pick the number card.`);
    } else {
      speakText(`${formatNum(count)}`, `${count}`);
    }
  };

  // Select matching numeral
  const handleMatchSelect = (choice: number) => {
    setSelectedMatchChoice(choice);
    const isCorrect = choice === activeScene.actualCount;
    setSceneFeedback(isCorrect);

    if (isCorrect) {
      playTone(659.25, 'triangle', 0.4);
      const ns = stars + 1;
      setStars(ns);
      saveProgress(ns);
      speakText(
        `अति राम्रो! ${activeScene.itemNameNp}को सङ्ख्या ठ्याक्कै १० हो!`,
        `Splendid! The count is exactly 10!`
      );
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText('गलत भयो, फेरि गन्नुहोस्।', 'Incorrect, please count again.');
    }
  };

  const handleNextScene = () => {
    if (currentSceneIdx < scenes.length - 1) {
      resetScene(currentSceneIdx + 1);
    }
  };

  useEffect(() => {
    resetScene(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#042f2e',
        color: '#f8fafc',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* HEADER / NAVIGATION BAR */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: 'rgba(2, 44, 34, 0.95)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBackToLibrary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <ArrowLeft size={18} />
            <span>{language === 'np' ? 'फिर्ता (Library)' : 'Back to Library'}</span>
          </button>

          <div>
            <div style={{ fontSize: '11px', color: '#5eead4', textTransform: 'uppercase', fontWeight: 800 }}>
              कक्षा १ • गणित • अध्याय ६ : दश (Ten)
            </div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f0fdfa' }}>
              {language === 'np'
                ? 'सिमुलेसन ०४: गनेर दशसँग मिलाऔँ (Count and Match Ten)'
                : 'Simulation 04: Count and Match Ten'}
            </h1>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '6px 14px',
              borderRadius: '20px',
              color: '#fef08a',
              fontWeight: 800,
            }}
          >
            <Trophy size={16} color="#fbbf24" />
            <span>{stars} Stars</span>
          </div>

          <button
            onClick={() => setLanguage((l) => (l === 'np' ? 'en' : 'np'))}
            style={{
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            {language === 'np' ? 'नेपाली | EN' : 'EN | नेपाली'}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: soundEnabled ? '#5eead4' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* SCENES STRIP */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.2)',
          overflowX: 'auto',
        }}
      >
        {scenes.map((sc, idx) => {
          const isSelected = idx === currentSceneIdx;

          return (
            <button
              key={sc.id}
              onClick={() => resetScene(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '12px',
                border: isSelected ? '2px solid #5eead4' : '1px solid rgba(255, 255, 255, 0.15)',
                background: isSelected ? 'rgba(13, 148, 136, 0.8)' : 'rgba(30, 41, 59, 0.6)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{sc.icon}</span>
              <span>{language === 'np' ? sc.titleNp : sc.titleEn}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN WORKSPACE */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          maxWidth: '850px',
          margin: '0 auto',
          width: '100%',
          gap: '24px',
        }}
      >
        {/* Interactive Counting Canvas Card */}
        <div
          style={{
            width: '100%',
            height: '280px',
            borderRadius: '24px',
            background: activeScene.bgGradient,
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '4px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Live Counter */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'rgba(0,0,0,0.5)',
              padding: '6px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              color: '#fef08a',
            }}
          >
            {language === 'np'
              ? `गनेको सङ्ख्या: ${formatNum(clickedItemIndices.length)} / १०`
              : `Counted: ${clickedItemIndices.length} / 10`}
          </div>

          {/* 10 Clickable Items */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', padding: '20px' }}>
            {Array.from({ length: activeScene.actualCount }).map((_, i) => {
              const isCounted = clickedItemIndices.includes(i);

              return (
                <button
                  key={i}
                  onClick={() => handleItemClick(i)}
                  style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '44px',
                    transform: isCounted ? 'scale(1.18)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    filter: isCounted ? 'drop-shadow(0 0 12px #facc15)' : 'none',
                  }}
                  title={language === 'np' ? `गन्न थिच्नुहोस्` : `Click to count`}
                >
                  <span>{activeScene.icon}</span>
                  {isCounted && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#10b981',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {formatNum(clickedItemIndices.indexOf(i) + 1)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Matching Numerals Row */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            borderRadius: '20px',
            padding: '20px 32px',
            border: '2px solid rgba(45, 212, 191, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            width: '100%',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fef08a' }}>
            {language === 'np' ? 'सही सङ्ख्या कार्ड छान्नुहोस्:' : 'Select the matching number card:'}
          </h2>

          <div style={{ display: 'flex', gap: '16px' }}>
            {activeScene.options.map((opt) => {
              const isSelected = selectedMatchChoice === opt;
              const isCorrect = opt === activeScene.actualCount;

              return (
                <button
                  key={opt}
                  onClick={() => handleMatchSelect(opt)}
                  disabled={selectedMatchChoice !== null}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '20px',
                    background:
                      selectedMatchChoice === opt
                        ? isCorrect
                          ? '#10b981'
                          : '#ef4444'
                        : 'rgba(30, 41, 59, 0.8)',
                    border: '3px solid rgba(45, 212, 191, 0.4)',
                    color: '#ffffff',
                    fontSize: '32px',
                    fontWeight: 900,
                    cursor: selectedMatchChoice !== null ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span>{formatNum(opt)}</span>
                  <span style={{ fontSize: '10px', opacity: 0.85 }}>{formatName(opt)}</span>
                </button>
              );
            })}
          </div>

          {sceneFeedback !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                style={{
                  fontWeight: 800,
                  color: sceneFeedback ? '#34d399' : '#f87171',
                  fontSize: '15px',
                }}
              >
                {sceneFeedback
                  ? language === 'np'
                    ? 'शानदार! सही जोडी मिल्यो (+१ तारा)'
                    : 'Splendid! Matched (+1 Star)'
                  : language === 'np'
                  ? 'पुनः प्रयास गर्नुहोस्!'
                  : 'Try again!'}
              </span>

              {sceneFeedback && currentSceneIdx < scenes.length - 1 && (
                <button
                  onClick={handleNextScene}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{language === 'np' ? 'अर्को दृश्य' : 'Next Scene'}</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CountAndMatchTen;

