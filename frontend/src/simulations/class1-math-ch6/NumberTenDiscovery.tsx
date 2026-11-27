/**
 * NumberTenDiscovery.tsx
 * Simulation 02: Number Ten Discovery World
 * Class 1 Mathematics - Chapter 6: Ten
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
  Layers,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const NEP_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दश'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

export const NumberTenDiscovery: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Navigation & Settings
  const [language, setLanguage] = useState<'np' | 'en'>('en');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Tab: 1 (Discover 10 / 10), 2 (Card Picker), 3 (Numeral Match), 4 (Name Match)
  const [activeTab, setActiveTab] = useState<'DISCOVER' | 'PICK_CARD' | 'MATCH_NUMERAL' | 'MATCH_NAME'>('DISCOVER');

  // Stars
  const [stars, setStars] = useState<number>(0);

  // Tab 2 State: Card Picker (Pick 10 / 10 among distractors)
  const [pickerRound, setPickerRound] = useState<number>(0);
  const pickerRounds = [
    {
      promptNp: 'सङ्ख्या "10" भएको कार्ड छान्नुहोस्:',
      promptEn: 'Select the card showing number "10":',
      target: '10',
      options: ['7', '10', '8', '5'],
    },
    {
      promptNp: 'सङ्ख्या "10" (Ten) भएको कार्ड छान्नुहोस्:',
      promptEn: 'Select the card showing number "10":',
      target: '10',
      options: ['1', '9', '10', '6'],
    },
    {
      promptNp: 'नाम "दश" लेखिएको कार्ड छान्नुहोस्:',
      promptEn: 'Select the card with name "दश":',
      target: 'दश',
      options: ['पाँच', 'दश', 'आठ', 'सात'],
    },
    {
      promptNp: 'नाम "Ten" लेखिएको कार्ड छान्नुहोस्:',
      promptEn: 'Select the card with name "Ten":',
      target: 'Ten',
      options: ['Two', 'Nine', 'Ten', 'Four'],
    },
  ];
  const [pickerSelected, setPickerSelected] = useState<string | null>(null);
  const [pickerFeedback, setPickerFeedback] = useState<boolean | null>(null);

  // Tab 3 State: Numeral Matching (Objects to 10 / 10)
  const [matchedGroups, setMatchedGroups] = useState<string[]>([]);
  const matchCandidates = [
    { id: 'M1', count: 10, labelNp: '10 वटा ताराहरू', labelEn: '10 Stars', icon: '⭐' },
    { id: 'M2', count: 6, labelNp: '6 वटा फूलहरू', labelEn: '6 Flowers', icon: '🌸' },
    { id: 'M3', count: 10, labelNp: '10 वटा बेलुनहरू', labelEn: '10 Balloons', icon: '🎈' },
    { id: 'M4', count: 8, labelNp: '8 वटा चराहरू', labelEn: '8 Birds', icon: '🐦' },
  ];

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
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH6-02/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(100, newStars * 15),
          completionStatus: newStars >= 6 ? 'COMPLETED' : 'IN_PROGRESS',
          timeSpentSeconds: 150,
          attemptsCount: 1,
          metadata: {
            stars: newStars,
            tab: activeTab,
          },
        }),
      });
    } catch {
      // Ignore background errors
    }
  };

  // Tab 2 Handler: Card selection
  const handleCardPick = (opt: string) => {
    const round = pickerRounds[pickerRound];
    setPickerSelected(opt);
    const isCorrect = opt === round.target;
    setPickerFeedback(isCorrect);

    if (isCorrect) {
      playTone(659.25, 'triangle', 0.4);
      const ns = stars + 1;
      setStars(ns);
      saveProgress(ns);
      speakText('सबास! सही कार्ड छान्नुभयो।', 'Splendid! You picked the correct card.');
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText('गलत भयो, फेरि प्रयास गर्नुहोस्।', 'Incorrect, please try again.');
    }
  };

  const handleNextPickerRound = () => {
    if (pickerRound < pickerRounds.length - 1) {
      const nextIdx = pickerRound + 1;
      setPickerRound(nextIdx);
      setPickerSelected(null);
      setPickerFeedback(null);
      speakText(pickerRounds[nextIdx].promptNp, pickerRounds[nextIdx].promptEn);
    } else {
      setActiveTab('MATCH_NUMERAL');
    }
  };

  // Tab 3 Handler: Match 10 items
  const handleMatchPick = (id: string, count: number) => {
    if (matchedGroups.includes(id)) return;

    if (count === 10) {
      playTone(659.25, 'triangle', 0.35);
      const next = [...matchedGroups, id];
      setMatchedGroups(next);
      const ns = stars + 1;
      setStars(ns);
      saveProgress(ns);
      speakText('सबास! यस समूहमा ठ्याक्कै 10 वटा वस्तु छन्।', 'Correct! This group contains 10 items.');
    } else {
      playTone(280, 'sawtooth', 0.3);
      speakText(`यसमा 10 होइन, ${formatNum(count)} वटा मात्र छन्।`, `Not ten, this has only ${count} items.`);
    }
  };

  useEffect(() => {
    speakText(
      '10 चिनौँ सिमुलेसनमा स्वागत छ! सङ्ख्या 10 को रूप, नाम र वस्तु सम्बन्ध बुझौँ।',
      'Welcome to Number Ten Discovery World! Discover the number ten, its forms and names.'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E7F1FC 0%, #E6F3E9 100%)',
        color: '#26332E',
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
          background: '#FFFFFF',
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
              background: '#FFFFFF',
              border: '1px solid #DCE5DE',
              borderRadius: '10px',
              color: '#26332E',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <ArrowLeft size={18} />
            <span>{language === 'np' ? 'फिर्ता (Library)' : 'Back to Library'}</span>
          </button>

          <div>
            <div style={{ fontSize: '11px', color: '#26332E', textTransform: 'uppercase', fontWeight: 800 }}>
              Class 1 • Maths • Chapter 6 : Ten
            </div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#26332E' }}>
              {language === 'np'
                ? 'सिमुलेसन 02: 10 चिनौँ (Number Ten Discovery World)'
                : 'Simulation 02: Number Ten Discovery World'}
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
              color: '#26332E',
              fontWeight: 800,
            }}
          >
            <Trophy size={16} color="#fbbf24" />
            <span>{stars} Stars</span>
          </div>

          

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '8px',
              background: '#FFFFFF',
              border: '1px solid #DCE5DE',
              borderRadius: '8px',
              color: soundEnabled ? '#5eead4' : '#26332E',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* ACTIVITY TABS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.9)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.2)',
        }}
      >
        {[
          { key: 'DISCOVER', np: '1. 10 को परिचय (Introduce 10)', en: '1. Introduce 10' },
          { key: 'PICK_CARD', np: '2. 10 को कार्ड छान्नुहोस् (Pick Card)', en: '2. Pick Card' },
          { key: 'MATCH_NUMERAL', np: '3. 10 वस्तुको जोडी (Match 10 Items)', en: '3. Match 10' },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '8px 18px',
                borderRadius: '12px',
                border: isSelected ? '2px solid #5eead4' : '1px solid rgba(255, 255, 255, 0.15)',
                background: isSelected ? 'rgba(13, 148, 136, 0.8)' : '#F1F5F9',
                color: '#26332E',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {language === 'np' ? tab.np : tab.en}
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
        {/* ======================================================== */}
        {/* TAB 1: INTRODUCE 10                                      */}
        {/* ======================================================== */}
        {activeTab === 'DISCOVER' && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#26332E' }}>
                {language === 'np' ? 'सङ्ख्या 10 को परिचय' : 'Discover the Number 10 (Ten)'}
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#26332E' }}>
                {language === 'np'
                  ? 'दश (10) ले ठ्याक्कै 10 वटा वस्तुहरूको समूहलाई जनाउँछ।'
                  : 'Number 10 represents a collection of exactly ten objects.'}
              </p>
            </div>

            {/* 4 Pillars of Number 10 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
                maxWidth: '680px',
                width: '100%',
              }}
            >
              {/* 1. Devanagari Numeral */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '2px solid rgba(45, 212, 191, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '13px', color: '#26332E', fontWeight: 800 }}>
                  {language === 'np' ? 'नेपाली सङ्ख्या (Devanagari)' : 'Devanagari Numeral'}
                </span>
                <span style={{ fontSize: '54px', fontWeight: 900, color: '#26332E' }}>10</span>
                <span style={{ fontSize: '16px', fontWeight: 800 }}>Ten</span>
              </div>

              {/* 2. English Numeral */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '2px solid rgba(45, 212, 191, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '13px', color: '#26332E', fontWeight: 800 }}>
                  {language === 'np' ? 'अङ्ग्रेजी सङ्ख्या (English)' : 'English Numeral'}
                </span>
                <span style={{ fontSize: '54px', fontWeight: 900, color: '#26332E' }}>10</span>
                <span style={{ fontSize: '16px', fontWeight: 800 }}>Ten</span>
              </div>
            </div>

            {/* 10 Apples Showcase */}
            <div
              style={{
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '20px',
                padding: '20px 32px',
                border: '2px dashed rgba(45, 212, 191, 0.4)',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '32px' }}>🍎</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#26332E' }}>
                    {formatNum(i + 1)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('PICK_CARD')}
              style={{
                padding: '12px 24px',
                borderRadius: '14px',
                background: '#FFFFFF',
                color: '#26332E',
                border: 'none',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{language === 'np' ? 'अभ्यास सुरु गरौँ' : 'Start Practice'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PICK CARD CHALLENGE                               */}
        {/* ======================================================== */}
        {activeTab === 'PICK_CARD' && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#26332E' }}>
                {language === 'np'
                  ? pickerRounds[pickerRound].promptNp
                  : pickerRounds[pickerRound].promptEn}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#26332E' }}>
                {language === 'np'
                  ? `प्रश्न ${pickerRound + 1} / ${pickerRounds.length}`
                  : `Question ${pickerRound + 1} of ${pickerRounds.length}`}
              </p>
            </div>

            {/* 4 Cards */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {pickerRounds[pickerRound].options.map((opt) => {
                const isSelected = pickerSelected === opt;
                const isCorrect = opt === pickerRounds[pickerRound].target;

                return (
                  <button
                    key={opt}
                    onClick={() => handleCardPick(opt)}
                    style={{
                      width: '120px',
                      height: '130px',
                      borderRadius: '20px',
                      background: isSelected
                        ? isCorrect
                          ? '#10b981'
                          : '#ef4444'
                        : '#F1F5F9',
                      border: isSelected
                        ? isCorrect
                          ? '3px solid #6ee7b7'
                          : '3px solid #fca5a5'
                        : '2px solid rgba(45, 212, 191, 0.4)',
                      color: '#26332E',
                      fontSize: '32px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {pickerFeedback !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  style={{
                    fontWeight: 800,
                    color: pickerFeedback ? '#34d399' : '#f87171',
                    fontSize: '15px',
                  }}
                >
                  {pickerFeedback
                    ? language === 'np'
                      ? 'शानदार! सही उत्तर (+1 तारा)'
                      : 'Correct! (+1 Star)'
                    : language === 'np'
                    ? 'पुनः प्रयास गर्नुहोस्!'
                    : 'Try again!'}
                </span>

                {pickerFeedback && (
                  <button
                    onClick={handleNextPickerRound}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      color: '#26332E',
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {language === 'np' ? 'अर्को प्रश्न' : 'Next Question'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MATCH 10 OBJECTS                                  */}
        {/* ======================================================== */}
        {activeTab === 'MATCH_NUMERAL' && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#26332E' }}>
                {language === 'np'
                  ? '10 वटा वस्तुहरू भएका समूहहरू छान्नुहोस्'
                  : 'Select the groups containing 10 items'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#26332E' }}>
                {language === 'np'
                  ? '10 वटा वस्तु भएका कार्डहरूमा क्लिक गर्नुहोस्।'
                  : 'Click on the cards that contain exactly 10 objects.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '640px', width: '100%' }}>
              {matchCandidates.map((c) => {
                const isMatched = matchedGroups.includes(c.id);

                return (
                  <button
                    key={c.id}
                    onClick={() => handleMatchPick(c.id, c.count)}
                    style={{
                      padding: '20px',
                      borderRadius: '20px',
                      background: isMatched ? 'rgba(16, 185, 129, 0.3)' : '#F1F5F9',
                      border: isMatched ? '3px solid #10b981' : '2px solid rgba(45, 212, 191, 0.3)',
                      color: '#26332E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '32px' }}>{c.icon}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800 }}>
                          {language === 'np' ? c.labelNp : c.labelEn}
                        </div>
                        <div style={{ fontSize: '12px', color: '#26332E' }}>
                          {formatNum(c.count)} Items
                        </div>
                      </div>
                    </div>

                    {isMatched && <CheckCircle2 size={24} color="#34d399" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NumberTenDiscovery;

