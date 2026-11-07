/**
 * CountTheVillage.tsx
 * Simulation 04: Count the Village (गाउँमा गनौँ)
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
  MapPin,
  Award,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface VillageSpot {
  id: string;
  nameNp: string;
  nameEn: string;
  icon: string;
  promptNp: string;
  promptEn: string;
  actualCount: number;
  options: number[];
  explanationNp: string;
  explanationEn: string;
  isZero: boolean;
  bgGradient: string;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

export const CountTheVillage: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Navigation & Settings
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Village locations list (mix of zero and non-zero counts)
  const spots: VillageSpot[] = [
    {
      id: 'TREE_OCCUPIED',
      nameNp: 'पिपलको रुख (चराहरू भएको)',
      nameEn: 'Pipal Tree (with Birds)',
      icon: '🌳',
      promptNp: 'यस पिपलको रुखमा कति वटा चराहरू बसेका छन्?',
      promptEn: 'How many birds are sitting on this Pipal tree?',
      actualCount: 3,
      options: [1, 3, 0],
      explanationNp: 'रुखको हाँगामा ३ वटा चराहरू बसेका छन्।',
      explanationEn: 'There are 3 birds sitting on the tree branches.',
      isZero: false,
      bgGradient: 'linear-gradient(135deg, #15803d, #166534)',
    },
    {
      id: 'TREE_EMPTY',
      nameNp: 'सुकेको रुख (खाली)',
      nameEn: 'Dry Tree (Empty)',
      icon: '🪵',
      promptNp: 'यस रुखको हाँगामा कति वटा चरा छन्?',
      promptEn: 'How many birds are on this tree branch?',
      actualCount: 0,
      options: [0, 2, 4],
      explanationNp: 'यस रुखमा कुनै पनि चरा छैन, त्यसैले चराको सङ्ख्या शून्य (०) हो।',
      explanationEn: 'There are no birds on this tree, so the count is zero (0).',
      isZero: true,
      bgGradient: 'linear-gradient(135deg, #78350f, #451a03)',
    },
    {
      id: 'POND_OCCUPIED',
      nameNp: 'गाउँको पोखरी (हाँसहरू भएको)',
      nameEn: 'Village Pond (with Ducks)',
      icon: '🌊',
      promptNp: 'पोखरीमा कति वटा हाँसहरू पौडिरहेका छन्?',
      promptEn: 'How many ducks are swimming in the pond?',
      actualCount: 4,
      options: [2, 4, 0],
      explanationNp: 'पोखरीमा ४ वटा हाँसहरू पौडिरहेका छन्।',
      explanationEn: 'There are 4 ducks swimming in the pond.',
      isZero: false,
      bgGradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    },
    {
      id: 'POND_EMPTY',
      nameNp: 'सानो इनार (खाली)',
      nameEn: 'Small Well (Empty)',
      icon: '🪣',
      promptNp: 'यस इनार वरिपरि कति वटा हाँस छन्?',
      promptEn: 'How many ducks are around this well?',
      actualCount: 0,
      options: [0, 1, 3],
      explanationNp: 'यहाँ कुनै पनि हाँस छैन, सङ्ख्या शून्य (०) हो।',
      explanationEn: 'There are no ducks here, the count is zero (0).',
      isZero: true,
      bgGradient: 'linear-gradient(135deg, #475569, #1e293b)',
    },
    {
      id: 'BENCH_OCCUPIED',
      nameNp: 'चौतारीको बेन्च (मानिसहरू भएको)',
      nameEn: 'Village Bench (with People)',
      icon: '🪑',
      promptNp: 'बेन्चमा कति जना मानिसहरू बसिरहेका छन्?',
      promptEn: 'How many people are sitting on the bench?',
      actualCount: 2,
      options: [0, 2, 3],
      explanationNp: 'बेन्चमा २ जना बसिरहेका छन्।',
      explanationEn: 'There are 2 people sitting on the bench.',
      isZero: false,
      bgGradient: 'linear-gradient(135deg, #b45309, #78350f)',
    },
    {
      id: 'BENCH_EMPTY',
      nameNp: 'खाली बेन्च',
      nameEn: 'Empty Bench',
      icon: '🪑',
      promptNp: 'यस खाली बेन्चमा कति जना छन्?',
      promptEn: 'How many people are on this empty bench?',
      actualCount: 0,
      options: [0, 1, 4],
      explanationNp: 'बेन्च खाली छ, कोही छैन, त्यसैले शून्य (०) जना छन्।',
      explanationEn: 'The bench is empty, so there are zero (0) people.',
      isZero: true,
      bgGradient: 'linear-gradient(135deg, #334155, #0f172a)',
    },
    {
      id: 'ENCLOSURE_OCCUPIED',
      nameNp: 'बाख्राको खोर (भरिएको)',
      nameEn: 'Goat Pen (Occupied)',
      icon: '🐐',
      promptNp: 'खोरभित्र कति वटा बाख्राहरू छन्?',
      promptEn: 'How many goats are inside the pen?',
      actualCount: 3,
      options: [3, 0, 5],
      explanationNp: 'खोरभित्र ३ वटा बाख्राहरू छन्।',
      explanationEn: 'There are 3 goats inside the pen.',
      isZero: false,
      bgGradient: 'linear-gradient(135deg, #ca8a04, #854d0e)',
    },
    {
      id: 'ENCLOSURE_EMPTY',
      nameNp: 'खाली खोर',
      nameEn: 'Empty Pen',
      icon: '🚪',
      promptNp: 'यस खाली खोरभित्र कति वटा बाख्रा छन्?',
      promptEn: 'How many goats are in this empty pen?',
      actualCount: 0,
      options: [1, 2, 0],
      explanationNp: 'खोरभित्र कुनै पनि बाख्रा छैन, सङ्ख्या शून्य (०) हो।',
      explanationEn: 'There are no goats inside, the number is zero (0).',
      isZero: true,
      bgGradient: 'linear-gradient(135deg, #525252, #262626)',
    },
  ];

  // Active Spot Index
  const [currentSpotIndex, setCurrentSpotIndex] = useState(0);
  const activeSpot = spots[currentSpotIndex];

  // Selection state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [completedSpots, setCompletedSpots] = useState<string[]>([]);

  // Stars
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
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH5-04/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, newStars * 12),
          completionStatus: newStars >= 8 ? 'COMPLETED' : 'IN_PROGRESS',
          timeSpentSeconds: 160,
          attemptsCount: 1,
          metadata: {
            stars: newStars,
            completedCount: completedSpots.length,
          },
        }),
      });
    } catch {
      // Ignore background errors
    }
  };

  // Select answer
  const handleSelectAnswer = (choice: number) => {
    if (isAnswered) return;
    setSelectedAnswer(choice);
    setIsAnswered(true);

    const isCorrect = choice === activeSpot.actualCount;
    if (isCorrect) {
      playTone(659.25, 'triangle', 0.4);
      if (!completedSpots.includes(activeSpot.id)) {
        setCompletedSpots([...completedSpots, activeSpot.id]);
        const ns = stars + 1;
        setStars(ns);
        saveProgress(ns);
      }
      speakText('सबास! ' + activeSpot.explanationNp, 'Splendid! ' + activeSpot.explanationEn);
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText('गलत भयो। ' + activeSpot.explanationNp, 'Not quite. ' + activeSpot.explanationEn);
    }
  };

  // Next Spot
  const handleNextSpot = () => {
    const nextIdx = (currentSpotIndex + 1) % spots.length;
    setCurrentSpotIndex(nextIdx);
    setSelectedAnswer(null);
    setIsAnswered(false);
    speakText(spots[nextIdx].promptNp, spots[nextIdx].promptEn);
  };

  useEffect(() => {
    speakText(
      'गाउँमा गनौँ सिमुलेसनमा स्वागत छ! विभिन्न स्थानहरू हेरेर वस्तुहरूको सङ्ख्या वा शून्य पत्ता लगाऔँ।',
      'Welcome to Count the Village! Explore different village spots to count items or identify zero.'
    );
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
              कक्षा १ • गणित • अध्याय ५ : शून्य (Zero)
            </div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f0fdfa' }}>
              {language === 'np'
                ? 'सिमुलेसन ०४: गाउँमा गनौँ (Count the Village)'
                : 'Simulation 04: Count the Village'}
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
            <span>{stars} / 8 Stars</span>
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

      {/* VILLAGE MAP SPOTS STRIP */}
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
        {spots.map((spot, idx) => {
          const isSelected = idx === currentSpotIndex;
          const isDone = completedSpots.includes(spot.id);

          return (
            <button
              key={spot.id}
              onClick={() => {
                setCurrentSpotIndex(idx);
                setSelectedAnswer(null);
                setIsAnswered(false);
                speakText(spot.promptNp, spot.promptEn);
              }}
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
              <span>{spot.icon}</span>
              <span>{language === 'np' ? spot.nameNp : spot.nameEn}</span>
              {isDone && <CheckCircle2 size={14} color="#34d399" />}
            </button>
          );
        })}
      </div>

      {/* MAIN LOCATION WORKSPACE */}
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
        {/* Spot Visual Showcase Card */}
        <div
          style={{
            width: '100%',
            height: '280px',
            borderRadius: '24px',
            background: activeSpot.bgGradient,
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
          {/* Big Visual Representation */}
          {activeSpot.actualCount === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '72px' }}>{activeSpot.icon}</div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#fef08a',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '6px 20px',
                  borderRadius: '16px',
                  marginTop: '10px',
                }}
              >
                {language === 'np' ? 'यहाँ कोही/केही छैन (Empty)' : 'Nothing here (Empty)'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {Array.from({ length: activeSpot.actualCount }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '64px',
                    filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.3))',
                    animation: 'bounce 1s infinite alternate',
                  }}
                >
                  {activeSpot.icon}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Question & Choices */}
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
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#fef08a', textAlign: 'center' }}>
            {language === 'np' ? activeSpot.promptNp : activeSpot.promptEn}
          </h2>

          {/* Choices Row */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {activeSpot.options.map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === activeSpot.actualCount;

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectAnswer(opt)}
                  disabled={isAnswered}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '18px',
                    background:
                      isAnswered && isCorrect
                        ? '#10b981'
                        : isAnswered && isSelected
                        ? '#ef4444'
                        : 'rgba(30, 41, 59, 0.8)',
                    border: '3px solid rgba(45, 212, 191, 0.4)',
                    color: '#ffffff',
                    fontSize: '32px',
                    fontWeight: 900,
                    cursor: isAnswered ? 'default' : 'pointer',
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

          {/* Feedback & Next */}
          {isAnswered && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '14px', color: '#cbd5e1', textAlign: 'center' }}>
                {language === 'np' ? activeSpot.explanationNp : activeSpot.explanationEn}
              </div>

              <button
                onClick={handleNextSpot}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
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
                <span>{language === 'np' ? 'अर्को स्थान हेर्नुहोस्' : 'Next Location'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CountTheVillage;

