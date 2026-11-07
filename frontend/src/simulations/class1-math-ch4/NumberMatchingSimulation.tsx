/**
 * NumberMatchingSimulation.tsx
 * Simulation 03: Number Matching World (वस्तु र सङ्ख्या मिलाऔँ)
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
  HelpCircle,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface MatchChallenge {
  quantity: number;
  numNp: string;
  nameEn: string;
  nameNp: string;
  icon: string;
}

export const NumberMatchingSimulation: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Language & Audio
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Rounds: 1 (1-3), 2 (4-6), 3 (7-9), 4 (Mixed 1-9)
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [stars, setStars] = useState(0);

  // Challenges pool
  const masterList: MatchChallenge[] = [
    { quantity: 1, numNp: '१', nameEn: 'One', nameNp: 'एक', icon: '🍄' },
    { quantity: 2, numNp: '२', nameEn: 'Two', nameNp: 'दुई', icon: '🦋' },
    { quantity: 3, numNp: '३', nameEn: 'Three', nameNp: 'तीन', icon: '🐇' },
    { quantity: 4, numNp: '४', nameEn: 'Four', nameNp: 'चार', icon: '🍎' },
    { quantity: 5, numNp: '५', nameEn: 'Five', nameNp: 'पाँच', icon: '🎈' },
    { quantity: 6, numNp: '६', nameEn: 'Six', nameNp: 'छ', icon: '🥭' },
    { quantity: 7, numNp: '७', nameEn: 'Seven', nameNp: 'सात', icon: '🐟' },
    { quantity: 8, numNp: '८', nameEn: 'Eight', nameNp: 'आठ', icon: '🐦' },
    { quantity: 9, numNp: '९', nameEn: 'Nine', nameNp: 'नौ', icon: '🌸' },
  ];

  // Active round items
  const [activeChallenges, setActiveChallenges] = useState<MatchChallenge[]>([]);
  const [selectedObj, setSelectedObj] = useState<MatchChallenge | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ isSuccess: boolean; textNp: string; textEn: string } | null>(null);

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

  const playTone = (type: 'success' | 'error' | 'click') => {
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
    let start = 0;
    let end = 3;
    if (currentRound === 2) {
      start = 3;
      end = 6;
    } else if (currentRound === 3) {
      start = 6;
      end = 9;
    } else if (currentRound === 4) {
      start = 0;
      end = 9;
    }

    const items = masterList.slice(start, end);
    setActiveChallenges(items);
    setMatchedIds([]);
    setSelectedObj(null);
    setFeedback(null);

    speakText(
      'वस्तुहरूको समूहलाई गन्नुहोस् र त्यसको सही सङ्ख्या वा नामसँग जोडा मिलाउनुहोस्!',
      'Count the object group, then match it to its correct numeral or number name!'
    );
  }, [currentRound, language]);

  // Handle numeral/name card click
  const handleNumeralMatch = (targetQuantity: number) => {
    if (!selectedObj) {
      playTone('error');
      speakText('पहिले देब्रेपट्टिबाट वस्तुको समूह छान्नुहोस्!', 'Please select an object group on the left first!');
      return;
    }

    if (selectedObj.quantity === targetQuantity) {
      playTone('success');
      setStars((s) => s + 2);
      const updated = [...matchedIds, targetQuantity];
      setMatchedIds(updated);

      setFeedback({
        isSuccess: true,
        textNp: `स्याबास! ${selectedObj.quantity} = ${selectedObj.numNp} (${selectedObj.nameNp})!`,
        textEn: `Great! ${selectedObj.quantity} = ${selectedObj.nameEn}!`,
      });
      speakText(
        `स्याबास! ${selectedObj.numNp} (${selectedObj.nameNp})।`,
        `Great job! ${selectedObj.quantity} (${selectedObj.nameEn}).`
      );

      setSelectedObj(null);

      if (updated.length === activeChallenges.length) {
        saveProgress(100);
      }
    } else {
      playTone('error');
      setFeedback({
        isSuccess: false,
        textNp: 'यो मिलेन। वस्तुहरूलाई फेरि ध्यानपूर्वक गन्नुहोस्।',
        textEn: 'Not quite. Please count the items carefully again.',
      });
      speakText('पुनः प्रयास गर्नुहोस्', 'Try again');
    }
  };

  const handleReset = () => {
    setMatchedIds([]);
    setSelectedObj(null);
    setFeedback(null);
  };

  const saveProgress = async (score: number) => {
    try {
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH4-03/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, score),
          completedLevels: currentRound,
          totalLevels: 4,
          starsEarned: stars + 3,
          timeSpentSeconds: 110,
        }),
      });
    } catch (e) {}
  };

  const isRoundComplete = matchedIds.length === activeChallenges.length && activeChallenges.length > 0;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #fef3c7 50%, #f0fdf4 100%)',
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
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>
              {language === 'np' ? 'वस्तु र सङ्ख्या मिलाऔँ' : 'Number Matching World'}
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {language === 'np' ? 'कक्षा १ गणित • अध्याय ४: ९ सम्मका सङ्ख्याहरू' : 'Class 1 Math • Chapter 4: Numbers up to 9'}
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

          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '3px' }}>
            {[1, 2, 3, 4].map((r) => (
              <button
                key={r}
                onClick={() => setCurrentRound(r)}
                style={{
                  background: currentRound === r ? '#2563eb' : 'transparent',
                  color: currentRound === r ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {r === 4 ? (language === 'np' ? 'मिश्रित' : 'Mixed') : `${language === 'np' ? 'चरण' : 'Rnd'} ${r}`}
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
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxSizing: 'border-box',
        }}
      >
        {/* Instruction Bar */}
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
                ? 'देब्रेबाट वस्तुको समूह छान्नुहोस् र दाहिनेपट्टिको सही सङ्ख्या वा नामसँग मिलाउनुहोस्'
                : 'Select an object group on the left, then tap its matching numeral on the right'}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {language === 'np'
                ? `मिलाउन बाँकी: ${activeChallenges.length - matchedIds.length}`
                : `Remaining to Match: ${activeChallenges.length - matchedIds.length}`}
            </span>
          </div>

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
            <RotateCcw size={16} /> {language === 'np' ? 'पुनः प्रयास' : 'Reset'}
          </button>
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

        {/* Dual Column Matching Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            flex: 1,
          }}
        >
          {/* Left Column: Object Groups */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
              border: '2px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              {language === 'np' ? '१. वस्तुहरूको समूह (Object Groups)' : '1. Object Groups'}
            </span>

            {activeChallenges.map((item) => {
              const isMatched = matchedIds.includes(item.quantity);
              const isSelected = selectedObj?.quantity === item.quantity;

              return (
                <button
                  key={item.quantity}
                  disabled={isMatched}
                  onClick={() => {
                    setSelectedObj(item);
                    playTone('click');
                    speakText(
                      `यो समूहमा कतिवटा वस्तु छन्? गन्नुहोस्।`,
                      `How many items are in this group? Count them.`
                    );
                  }}
                  style={{
                    background: isMatched ? '#f0fdf4' : isSelected ? '#dbeafe' : '#f8fafc',
                    border: isMatched ? '2px solid #16a34a' : isSelected ? '3px solid #2563eb' : '2px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isMatched ? 'default' : 'pointer',
                    opacity: isMatched ? 0.6 : 1,
                    transform: isSelected ? 'scale(1.02)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Repeated icons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '26px' }}>
                    {Array.from({ length: item.quantity }).map((_, i) => (
                      <span key={i}>{item.icon}</span>
                    ))}
                  </div>

                  {isMatched ? (
                    <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '14px' }}>✓ {language === 'np' ? 'मिल्यो' : 'Matched'}</span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700 }}>{language === 'np' ? 'छान्नुहोस्' : 'Select'}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Numeral & Name Cards */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
              border: '2px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              {language === 'np' ? '२. सङ्ख्या र नाम कार्ड (Numerals & Names)' : '2. Numerals & Names'}
            </span>

            {/* Shuffled/ordered list of cards */}
            {activeChallenges.map((item) => {
              const isMatched = matchedIds.includes(item.quantity);

              return (
                <button
                  key={item.quantity}
                  disabled={isMatched}
                  onClick={() => handleNumeralMatch(item.quantity)}
                  style={{
                    background: isMatched ? '#f0fdf4' : selectedObj ? '#fef3c7' : '#f8fafc',
                    border: isMatched ? '2px solid #16a34a' : '2px solid #cbd5e1',
                    borderRadius: '18px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isMatched ? 'default' : 'pointer',
                    opacity: isMatched ? 0.6 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Big Numeral */}
                    <span style={{ fontSize: '32px', fontWeight: 900, color: '#2563eb' }}>
                      {language === 'np' ? item.numNp : item.quantity}
                    </span>
                    {/* Dual notation */}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                        {language === 'np' ? item.nameNp : item.nameEn}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {language === 'np' ? `अङ्ग्रेजी: ${item.quantity} (${item.nameEn})` : `Nepali: ${item.numNp} (${item.nameNp})`}
                      </div>
                    </div>
                  </div>

                  {isMatched && <CheckCircle2 size={24} color="#16a34a" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Completion Modal Banner */}
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
                  {language === 'np' ? 'अति उत्तम! सबै सङ्ख्याहरू सही मिल्यो!' : 'Splendid! All numbers matched!'}
                </h3>
                <span style={{ fontSize: '14px', color: '#047857' }}>
                  {language === 'np'
                    ? `तपाईंले चरण ${currentRound} पूरा गर्नुभयो।`
                    : `You completed Round ${currentRound} successfully.`}
                </span>
              </div>
            </div>

            {currentRound < 4 ? (
              <button
                onClick={() => setCurrentRound((r) => r + 1)}
                style={{
                  background: '#2563eb',
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
export default NumberMatchingSimulation;

