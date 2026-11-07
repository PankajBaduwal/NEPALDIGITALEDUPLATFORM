/**
 * WhereDidEverythingGo.tsx
 * Simulation 03: Where Did Everything Go? (वस्तुहरू कहाँ गए?)
 * Class 1 Mathematics - Chapter 5: Zero (शून्य)
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
  Wind,
  Award,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface SceneData {
  id: string;
  titleNp: string;
  titleEn: string;
  itemNameNp: string;
  itemNameEn: string;
  icon: string;
  initialCount: number;
  locationNp: string;
  locationEn: string;
  background: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

export const WhereDidEverythingGo: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Navigation & Settings
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scenes list
  const scenes: SceneData[] = [
    {
      id: 'BIRDS',
      titleNp: 'रुखका चराहरू उडेर गए',
      titleEn: 'Birds on Tree Fly Away',
      itemNameNp: 'चरा',
      itemNameEn: 'Birds',
      icon: '🐦',
      initialCount: 4,
      locationNp: 'रुखको हाँगामा',
      locationEn: 'on the tree branch',
      background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 60%, #15803d 100%)',
    },
    {
      id: 'DUCKS',
      titleNp: 'पोखरीका हाँसहरू पौडेर गए',
      titleEn: 'Ducks in Pond Swim Away',
      itemNameNp: 'हाँस',
      itemNameEn: 'Ducks',
      icon: '🦆',
      initialCount: 3,
      locationNp: 'पोखरीमा',
      locationEn: 'in the pond',
      background: 'linear-gradient(180deg, #0284c7 0%, #0369a1 60%, #075985 100%)',
    },
    {
      id: 'APPLES',
      titleNp: 'टोकरीका स्याउहरू खाइयो',
      titleEn: 'Apples Eaten from Basket',
      itemNameNp: 'स्याउ',
      itemNameEn: 'Apples',
      icon: '🍎',
      initialCount: 5,
      locationNp: 'टोकरीमा',
      locationEn: 'in the basket',
      background: 'linear-gradient(180deg, #78350f 0%, #92400e 60%, #451a03 100%)',
    },
    {
      id: 'BALLOONS',
      titleNp: 'बेलुनहरू हावामा उडे',
      titleEn: 'Balloons Float Away in the Sky',
      itemNameNp: 'बेलुन',
      itemNameEn: 'Balloons',
      icon: '🎈',
      initialCount: 4,
      locationNp: 'आकाशमा',
      locationEn: 'in the sky',
      background: 'linear-gradient(180deg, #f472b6 0%, #db2777 60%, #9d174d 100%)',
    },
  ];

  // Active scene index
  const [sceneIndex, setSceneIndex] = useState(0);
  const activeScene = scenes[sceneIndex];

  // Active items left
  const [itemsLeft, setItemsLeft] = useState<number>(activeScene.initialCount);
  const [departedIndices, setDepartedIndices] = useState<number[]>([]);
  const [questionAnswered, setQuestionAnswered] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Overall Stars
  const [stars, setStars] = useState(0);

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
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH5-03/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, newStars * 15),
          completionStatus: newStars >= 6 ? 'COMPLETED' : 'IN_PROGRESS',
          timeSpentSeconds: 140,
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

  // Reset scene
  const resetScene = (idx: number) => {
    const sc = scenes[idx];
    setItemsLeft(sc.initialCount);
    setDepartedIndices([]);
    setQuestionAnswered(false);
    setSelectedAnswer(null);
    speakText(
      `${sc.locationNp} ${formatNum(sc.initialCount)} वटा ${sc.itemNameNp} छन्। वस्तुमा थिचेर हटाउनुहोस्।`,
      `There are ${sc.initialCount} ${sc.itemNameEn} ${sc.locationEn}. Tap to remove them one by one.`
    );
  };

  // Tap an item to depart
  const handleItemDepart = (idx: number) => {
    if (departedIndices.includes(idx)) return;

    const nextDeparted = [...departedIndices, idx];
    setDepartedIndices(nextDeparted);
    const remaining = activeScene.initialCount - nextDeparted.length;
    setItemsLeft(remaining);

    playTone(400 + remaining * 60, 'triangle', 0.25);

    if (remaining === 0) {
      playTone(880, 'sine', 0.6);
      speakText(
        `सबै ${activeScene.itemNameNp} गए! अब त्यहाँ शून्य (०) बाँकी छन्।`,
        `All ${activeScene.itemNameEn} are gone! Now zero (0) remain.`
      );
    } else {
      speakText(
        `एक ${activeScene.itemNameNp} गयो। अब ${formatNum(remaining)} बाँकी छन्।`,
        `One departed. Now ${remaining} remain.`
      );
    }
  };

  // Answer the final question
  const handleAnswerPick = (val: number) => {
    setSelectedAnswer(val);
    setQuestionAnswered(true);

    if (val === 0) {
      playTone(659.25, 'triangle', 0.4);
      const ns = stars + 2;
      setStars(ns);
      saveProgress(ns);
      speakText(
        'शानदार! सबै वस्तुहरू गएपछि बाँकी सङ्ख्या शून्य (०) हुन्छ।',
        'Splendid! When all objects are gone, the remaining count is zero (0).'
      );
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText('गलत भयो, कुनै पनि वस्तु बाँकी छैन भने शून्य (०) हुन्छ।', 'Incorrect, when no objects remain it is zero (0).');
    }
  };

  const handleNextScene = () => {
    const nextIdx = (sceneIndex + 1) % scenes.length;
    setSceneIndex(nextIdx);
    resetScene(nextIdx);
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
        background: '#0f172a',
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
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
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
            <div style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 800 }}>
              कक्षा १ • गणित • अध्याय ५ : शून्य (Zero)
            </div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f0fdfa' }}>
              {language === 'np'
                ? 'सिमुलेसन ०३: वस्तुहरू कहाँ गए? (Where Did Everything Go?)'
                : 'Simulation 03: Where Did Everything Go?'}
            </h1>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Star Counter */}
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

          {/* Language Switch */}
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

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: soundEnabled ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* SCENE SELECTION STRIP */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
        }}
      >
        {scenes.map((sc, idx) => {
          const isSelected = idx === sceneIndex;
          return (
            <button
              key={sc.id}
              onClick={() => {
                setSceneIndex(idx);
                resetScene(idx);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '12px',
                border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                background: isSelected ? 'rgba(2, 132, 199, 0.7)' : 'rgba(30, 41, 59, 0.6)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
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
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          gap: '24px',
        }}
      >
        {/* Animated Scene Canvas Frame */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '320px',
            borderRadius: '28px',
            background: activeScene.background,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            border: '4px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Top Info Banner */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '20px',
              right: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              padding: '8px 16px',
              borderRadius: '14px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#fef08a' }}>
              {language === 'np' ? activeScene.titleNp : activeScene.titleEn}
            </div>

            <div
              style={{
                fontSize: '16px',
                fontWeight: 900,
                color: itemsLeft === 0 ? '#facc15' : '#ffffff',
              }}
            >
              {language === 'np'
                ? `बाँकी: ${formatNum(itemsLeft)} (${formatName(itemsLeft)})`
                : `Remaining: ${itemsLeft} (${formatName(itemsLeft)})`}
            </div>
          </div>

          {/* Interactive Living Entities Row */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '40px',
            }}
          >
            {Array.from({ length: activeScene.initialCount }).map((_, i) => {
              const isDeparted = departedIndices.includes(i);
              return (
                <button
                  key={i}
                  disabled={isDeparted}
                  onClick={() => handleItemDepart(i)}
                  style={{
                    fontSize: '64px',
                    background: 'none',
                    border: 'none',
                    cursor: isDeparted ? 'default' : 'pointer',
                    opacity: isDeparted ? 0 : 1,
                    transform: isDeparted ? 'translateY(-120px) scale(0.2)' : 'scale(1)',
                    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.4))',
                  }}
                  title={language === 'np' ? 'हटाउन क्लिक गर्नुहोस्' : 'Click to remove'}
                >
                  {activeScene.icon}
                </button>
              );
            })}
          </div>

          {/* Zero Indicator Badge when empty */}
          {itemsLeft === 0 && (
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                padding: '16px 32px',
                borderRadius: '20px',
                border: '2px solid #facc15',
                animation: 'pulse 1.5s infinite',
              }}
            >
              <span style={{ fontSize: '48px', fontWeight: 900, color: '#facc15', lineHeight: 1 }}>
                {language === 'np' ? '०' : '0'}
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                {language === 'np'
                  ? 'सबै वस्तुहरू गए! सङ्ख्या शून्य (०) भयो!'
                  : 'All objects left! Count is ZERO (0)!'}
              </span>
            </div>
          )}
        </div>

        {/* BOTTOM QUESTION / EVALUATION */}
        {itemsLeft === 0 && !questionAnswered && (
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.85)',
              borderRadius: '20px',
              padding: '20px 32px',
              border: '2px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              width: '100%',
              maxWidth: '680px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#fef08a' }}>
              {language === 'np'
                ? `सबै ${activeScene.itemNameNp}हरू गएपछि अब त्यहाँ कति बाँकी छन्?`
                : `After all ${activeScene.itemNameEn} left, how many remain now?`}
            </h3>

            <div style={{ display: 'flex', gap: '14px' }}>
              {[0, 1, activeScene.initialCount].map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleAnswerPick(choice)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    border: '2px solid #38bdf8',
                    color: '#ffffff',
                    fontSize: '28px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {formatNum(choice)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CELEBRATION & NEXT SCENE */}
        {questionAnswered && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.25)',
              border: '2px solid #10b981',
              borderRadius: '20px',
              padding: '16px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '680px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Trophy size={36} color="#fbbf24" />
              <div>
                <div style={{ fontWeight: 800, color: '#f0fdf4', fontSize: '16px' }}>
                  {language === 'np'
                    ? 'शानदार! तपाईंले शून्य (०) को अवधारणा बुझ्नुभयो!'
                    : 'Splendid! You understood the concept of zero (0)!'}
                </div>
                <div style={{ fontSize: '12px', color: '#a7f3d0' }}>
                  {language === 'np'
                    ? 'कुनै पनि समूहबाट सबै वस्तु हटेपछि शून्य (०) बाँकी रहन्छ।'
                    : 'When all objects leave a collection, zero (0) remains.'}
                </div>
              </div>
            </div>

            <button
              onClick={handleNextScene}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '12px',
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
          </div>
        )}
      </main>
    </div>
  );
};

export default WhereDidEverythingGo;

