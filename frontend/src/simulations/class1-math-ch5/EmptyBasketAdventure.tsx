/**
 * EmptyBasketAdventure.tsx
 * Simulation 02: Empty Basket Adventure (खाली टोकरी चिनौँ)
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
  Award,
  Package,
} from 'lucide-react';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface ContainerItem {
  id: string;
  nameNp: string;
  nameEn: string;
  icon: string;
  containerType: 'BASKET' | 'POT' | 'TRAY' | 'BOX';
  containerNameNp: string;
  containerNameEn: string;
  count: number; // 0 for empty, > 0 for occupied
  capacity: number;
}

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const NEP_NAMES = ['शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ'];
const EN_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

export const EmptyBasketAdventure: React.FC<Props> = ({
  onBackToLibrary,
  userRole = 'TEACHER',
}) => {
  // Navigation & Settings
  const [language, setLanguage] = useState<'np' | 'en'>('np');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active activity tab: 1 (Find Empty), 2 (Move In/Out), 3 (Match ०), 4 (Market Stall)
  const [activeTab, setActiveTab] = useState<'FIND_EMPTY' | 'MOVE_OBJECTS' | 'MATCH_ZERO' | 'MARKET_STALL'>('FIND_EMPTY');

  // Overall Stars
  const [stars, setStars] = useState(0);

  // ==========================================
  // TAB 1: FIND EMPTY CONTAINER STATE
  // ==========================================
  const [emptyRoundIndex, setEmptyRoundIndex] = useState(0);
  const emptyChallenges = [
    {
      promptNp: 'कुन टोकरी खाली छ? (शून्य स्याउ भएको टोकरी छान्नुहोस्)',
      promptEn: 'Which basket is empty? (Select the basket with zero apples)',
      containers: [
        { id: 'c1', labelNp: 'टोकरी क', labelEn: 'Basket A', count: 3, icon: '🍎' },
        { id: 'c2', labelNp: 'टोकरी ख (खाली)', labelEn: 'Basket B (Empty)', count: 0, icon: '🍎' },
        { id: 'c3', labelNp: 'टोकरी ग', labelEn: 'Basket C', count: 2, icon: '🍎' },
      ],
      correctId: 'c2',
    },
    {
      promptNp: 'कुन गमलामा शून्य (०) फूल छ? (खाली गमला छान्नुहोस्)',
      promptEn: 'Which pot has zero (0) flowers? (Select the empty pot)',
      containers: [
        { id: 'p1', labelNp: 'गमला क (खाली)', labelEn: 'Pot A (Empty)', count: 0, icon: '🌸' },
        { id: 'p2', labelNp: 'गमला ख', labelEn: 'Pot B', count: 4, icon: '🌸' },
        { id: 'p3', labelNp: 'गमला ग', labelEn: 'Pot C', count: 1, icon: '🌸' },
      ],
      correctId: 'p1',
    },
    {
      promptNp: 'कुन ट्रेमा शून्य (०) आँप छन्? (खाली ट्रे छान्नुहोस्)',
      promptEn: 'Which tray has zero (0) mangoes? (Select the empty tray)',
      containers: [
        { id: 't1', labelNp: 'ट्रे क', labelEn: 'Tray A', count: 5, icon: '🥭' },
        { id: 't2', labelNp: 'ट्रे ख', labelEn: 'Tray B', count: 2, icon: '🥭' },
        { id: 't3', labelNp: 'ट्रे ग (खाली)', labelEn: 'Tray C (Empty)', count: 0, icon: '🥭' },
      ],
      correctId: 't3',
    },
    {
      promptNp: 'कुन बक्समा शून्य (०) खेलौना छन्? (खाली बक्स छान्नुहोस्)',
      promptEn: 'Which box has zero (0) toys? (Select the empty box)',
      containers: [
        { id: 'b1', labelNp: 'बक्स क', labelEn: 'Box A', count: 3, icon: '🧸' },
        { id: 'b2', labelNp: 'बक्स ख (खाली)', labelEn: 'Box B (Empty)', count: 0, icon: '🧸' },
        { id: 'b3', labelNp: 'बक्स ग', labelEn: 'Box C', count: 4, icon: '🧸' },
      ],
      correctId: 'b2',
    },
  ];
  const [emptySelectedId, setEmptySelectedId] = useState<string | null>(null);
  const [emptyFeedback, setEmptyFeedback] = useState<boolean | null>(null);

  // ==========================================
  // TAB 2: MOVE OBJECTS IN AND OUT STATE
  // ==========================================
  const [moveItemCount, setMoveItemCount] = useState<number>(3);
  const [moveItemType, setMoveItemType] = useState<'APPLE' | 'FLOWER' | 'BALL'>('APPLE');

  // ==========================================
  // TAB 3: MATCH EMPTY GROUP WITH ०
  // ==========================================
  const [matchSelectedPair, setMatchSelectedPair] = useState<string | null>(null);
  const [matchDoneIds, setMatchDoneIds] = useState<string[]>([]);
  const matchCards = [
    { id: 'M1', labelNp: 'खाली टोकरी', labelEn: 'Empty Basket', count: 0, icon: '🧺', targetNumeral: '०' },
    { id: 'M2', labelNp: '३ स्याउ भएको टोकरी', labelEn: '3 Apples', count: 3, icon: '🍎🍎🍎', targetNumeral: '३' },
    { id: 'M3', labelNp: 'खाली गमला', labelEn: 'Empty Pot', count: 0, icon: '🪴', targetNumeral: '०' },
    { id: 'M4', labelNp: '५ फूल भएको गमला', labelEn: '5 Flowers', count: 5, icon: '🌸🌸🌸🌸🌸', targetNumeral: '५' },
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
      await fetch('/api/v1/simulation-activity/simulations/SIM-MATH-G1-CH5-02/progress', {
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
      // Background ignore
    }
  };

  // Tab 1 Handler: Pick Empty Container
  const handlePickEmptyContainer = (id: string) => {
    const challenge = emptyChallenges[emptyRoundIndex];
    setEmptySelectedId(id);

    if (id === challenge.correctId) {
      setEmptyFeedback(true);
      playTone(659.25, 'triangle', 0.35);
      const ns = stars + 1;
      setStars(ns);
      saveProgress(ns);
      speakText(
        'अति उत्तम! यो टोकरी खाली छ। यसमा शून्य (०) वस्तु छन्।',
        'Excellent! This container is empty. There are zero (0) objects.'
      );
    } else {
      setEmptyFeedback(false);
      playTone(280, 'sawtooth', 0.3);
      speakText('ध्यान दिएर हेर्नुहोस्। के यो टोकरीभित्र केही छ?', 'Look carefully. Is there anything inside this container?');
    }
  };

  const handleNextEmptyRound = () => {
    if (emptyRoundIndex < emptyChallenges.length - 1) {
      setEmptyRoundIndex((i) => i + 1);
      setEmptySelectedId(null);
      setEmptyFeedback(null);
      speakText(emptyChallenges[emptyRoundIndex + 1].promptNp, emptyChallenges[emptyRoundIndex + 1].promptEn);
    } else {
      setActiveTab('MOVE_OBJECTS');
    }
  };

  // Tab 2 Handler: Move in/out
  const handleMoveDelta = (delta: number) => {
    const next = Math.max(0, Math.min(6, moveItemCount + delta));
    setMoveItemCount(next);
    playTone(400 + next * 60, 'triangle', 0.2);

    if (next === 0) {
      playTone(880, 'sine', 0.5);
      const ns = stars + 2;
      setStars(ns);
      saveProgress(ns);
      speakText(
        'टोकरी पूर्ण रूपमा खाली भयो! गणना: शून्य (०)',
        'Container is completely empty! Count: Zero (0)'
      );
    } else {
      speakText(`अब ${formatNum(next)} वटा वस्तु बाँकी छन्।`, `Now ${next} objects remain.`);
    }
  };

  // Tab 3 Handler: Match with Numeral ०
  const handleMatchCard = (card: typeof matchCards[0]) => {
    if (matchDoneIds.includes(card.id)) return;
    playTone(587.33, 'triangle', 0.25);

    const nextDone = [...matchDoneIds, card.id];
    setMatchDoneIds(nextDone);

    if (card.count === 0) {
      speakText(
        `सही मिल्यो! ${card.labelNp} सङ्ख्या ० (शून्य) सँग जोडिन्छ।`,
        `Matched! ${card.labelEn} connects to numeral 0 (Zero).`
      );
    } else {
      speakText(`सही मिल्यो! सङ्ख्या ${formatNum(card.count)}`, `Matched! Number ${card.count}`);
    }

    if (nextDone.length === matchCards.length) {
      playTone(880, 'sine', 0.6);
      const ns = stars + 3;
      setStars(ns);
      saveProgress(ns);
    }
  };

  useEffect(() => {
    speakText(
      'खाली टोकरी चिनौँ सिमुलेसनमा स्वागत छ! खाली भाँडाहरू खोजेर शून्य पहिचान गरौँ।',
      'Welcome to Empty Basket Adventure! Identify empty containers and learn zero.'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #92400e 100%)',
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
          background: 'rgba(24, 10, 2, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
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
            <div style={{ fontSize: '11px', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 800 }}>
              कक्षा १ • गणित • अध्याय ५ : शून्य (Zero)
            </div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fef08a' }}>
              {language === 'np'
                ? 'सिमुलेसन ०२: खाली टोकरी चिनौँ (Empty Basket Adventure)'
                : 'Simulation 02: Empty Basket Adventure'}
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
              background: 'rgba(245, 158, 11, 0.25)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
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
              color: soundEnabled ? '#facc15' : '#94a3b8',
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
          background: 'rgba(15, 23, 42, 0.5)',
          borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
        }}
      >
        {[
          { key: 'FIND_EMPTY', np: '१. खाली भाँडो छान्नुहोस् (Find Empty)', en: '1. Find Empty' },
          { key: 'MOVE_OBJECTS', np: '२. वस्तुहरू राख्ने र निकाल्ने (Move In/Out)', en: '2. Move In/Out' },
          { key: 'MATCH_ZERO', np: '३. शून्य (०) जोडी मिलाऔँ (Match 0)', en: '3. Match Zero' },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '8px 18px',
                borderRadius: '12px',
                border: isSelected ? '2px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.15)',
                background: isSelected ? 'rgba(217, 119, 6, 0.8)' : 'rgba(30, 41, 59, 0.6)',
                color: '#ffffff',
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

      {/* MAIN CONTAINER WORKSPACE */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* ======================================================== */}
        {/* TAB 1: FIND EMPTY CONTAINER                              */}
        {/* ======================================================== */}
        {activeTab === 'FIND_EMPTY' && (
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
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fef08a' }}>
                {language === 'np'
                  ? emptyChallenges[emptyRoundIndex].promptNp
                  : emptyChallenges[emptyRoundIndex].promptEn}
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#fde68a' }}>
                {language === 'np'
                  ? `चरण ${emptyRoundIndex + 1} / ${emptyChallenges.length}`
                  : `Round ${emptyRoundIndex + 1} of ${emptyChallenges.length}`}
              </p>
            </div>

            {/* Containers Row */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {emptyChallenges[emptyRoundIndex].containers.map((c) => {
                const isSelected = emptySelectedId === c.id;
                const isCorrect = c.id === emptyChallenges[emptyRoundIndex].correctId;

                return (
                  <button
                    key={c.id}
                    onClick={() => handlePickEmptyContainer(c.id)}
                    style={{
                      width: '240px',
                      height: '240px',
                      borderRadius: '24px',
                      background: 'rgba(30, 41, 59, 0.75)',
                      border: isSelected
                        ? isCorrect
                          ? '4px solid #10b981'
                          : '4px solid #ef4444'
                        : '3px solid rgba(251, 191, 36, 0.3)',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px',
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#fef08a' }}>
                      {language === 'np' ? c.labelNp : c.labelEn}
                    </span>

                    {/* Container Visual Body */}
                    <div
                      style={{
                        position: 'relative',
                        width: '140px',
                        height: '110px',
                        borderRadius: '0 0 50px 50px',
                        background: 'linear-gradient(180deg, #b45309, #78350f)',
                        border: '3px solid #f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {c.count === 0 ? (
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 900,
                            color: '#cbd5e1',
                            fontStyle: 'italic',
                          }}
                        >
                          {language === 'np' ? 'खाली (०)' : 'Empty (0)'}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', padding: '8px' }}>
                          {Array.from({ length: c.count }).map((_, i) => (
                            <span key={i} style={{ fontSize: '24px' }}>
                              {c.icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 700 }}>
                      {language === 'np'
                        ? `वस्तु सङ्ख्या: ${formatNum(c.count)}`
                        : `Item Count: ${c.count}`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next */}
            {emptyFeedback !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '15px',
                    color: emptyFeedback ? '#34d399' : '#f87171',
                  }}
                >
                  {emptyFeedback
                    ? language === 'np'
                      ? 'शानदार! यो भाँडो खाली छ, अर्थात् यसमा शून्य (०) वस्तु छन्!'
                      : 'Splendid! This container is empty, meaning zero (0) objects!'
                    : language === 'np'
                    ? 'पुनः प्रयास गर्नुहोस्! खाली भाँडो छान्नुहोस्।'
                    : 'Try again! Look for the container with no items.'}
                </span>

                {emptyFeedback && (
                  <button
                    onClick={handleNextEmptyRound}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{language === 'np' ? 'अर्को अभ्यास' : 'Next Practice'}</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MOVE OBJECTS IN AND OUT                           */}
        {/* ======================================================== */}
        {activeTab === 'MOVE_OBJECTS' && (
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
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fef08a' }}>
                {language === 'np'
                  ? 'वस्तुहरू निकाल्दै टोकरीलाई खाली (०) बनाऔँ'
                  : 'Remove objects until the basket becomes empty (0)'}
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#fde68a' }}>
                {language === 'np'
                  ? 'स्याउहरू एक–एक गरेर निकाल्नुहोस् र शून्य अवस्था बुझ्नुहोस्।'
                  : 'Remove items one by one and observe the count reach zero.'}
              </p>
            </div>

            {/* Interactive Basket Card */}
            <div
              style={{
                width: '320px',
                height: '300px',
                borderRadius: '28px',
                background: 'rgba(30, 41, 59, 0.85)',
                border: '4px solid #f59e0b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#fef08a' }}>
                {moveItemCount === 0
                  ? language === 'np'
                    ? 'खाली टोकरी (Empty Basket)'
                    : 'Empty Basket'
                  : language === 'np'
                  ? `टोकरीमा ${formatNum(moveItemCount)} वटा स्याउ`
                  : `${moveItemCount} Apples in Basket`}
              </span>

              {/* Basket Cavity */}
              <div
                style={{
                  width: '220px',
                  height: '140px',
                  borderRadius: '0 0 90px 90px',
                  background: 'linear-gradient(180deg, #92400e, #451a03)',
                  border: '4px solid #b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: '14px',
                }}
              >
                {moveItemCount === 0 ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '42px', fontWeight: 900, color: '#facc15' }}>
                      {language === 'np' ? '०' : '0'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 800 }}>
                      {language === 'np' ? 'कुनै वस्तु छैन (Zero)' : 'No objects (Zero)'}
                    </div>
                  </div>
                ) : (
                  Array.from({ length: moveItemCount }).map((_, i) => (
                    <span key={i} style={{ fontSize: '36px' }}>
                      🍎
                    </span>
                  ))
                )}
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <button
                  onClick={() => handleMoveDelta(-1)}
                  disabled={moveItemCount === 0}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    background: '#ef4444',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: moveItemCount === 0 ? 'not-allowed' : 'pointer',
                    opacity: moveItemCount === 0 ? 0.4 : 1,
                  }}
                >
                  {language === 'np' ? '- १ स्याउ निकाल्नुहोस्' : '- Remove 1'}
                </button>

                <button
                  onClick={() => handleMoveDelta(1)}
                  disabled={moveItemCount >= 6}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    background: '#10b981',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: moveItemCount >= 6 ? 'not-allowed' : 'pointer',
                    opacity: moveItemCount >= 6 ? 0.4 : 1,
                  }}
                >
                  {language === 'np' ? '+ १ स्याउ थप्नुहोस्' : '+ Add 1'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MATCH EMPTY GROUP WITH NUMERAL ०                  */}
        {/* ======================================================== */}
        {activeTab === 'MATCH_ZERO' && (
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
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fef08a' }}>
                {language === 'np'
                  ? 'खाली भाँडोलाई सङ्ख्या ० सँग मिलाऔँ'
                  : 'Match empty containers with numeral 0'}
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#fde68a' }}>
                {language === 'np'
                  ? 'कार्डहरूमा क्लिक गरेर सही सङ्ख्या जोडी पूरा गर्नुहोस्।'
                  : 'Click on each card to confirm its count.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '640px', width: '100%' }}>
              {matchCards.map((card) => {
                const isMatched = matchDoneIds.includes(card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => handleMatchCard(card)}
                    style={{
                      padding: '20px',
                      borderRadius: '20px',
                      background: isMatched ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 41, 59, 0.8)',
                      border: isMatched ? '3px solid #10b981' : '2px solid rgba(251, 191, 36, 0.3)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: isMatched ? 'default' : 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '32px' }}>{card.icon}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 800, fontSize: '15px' }}>
                          {language === 'np' ? card.labelNp : card.labelEn}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {card.count === 0 ? 'कुनै वस्तु छैन' : `${card.count} Items`}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '28px',
                        fontWeight: 900,
                        color: isMatched ? '#34d399' : '#facc15',
                      }}
                    >
                      {formatNum(card.count)}
                    </div>
                  </button>
                );
              })}
            </div>

            {matchDoneIds.length === matchCards.length && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: 'rgba(16, 185, 129, 0.25)',
                  border: '2px solid #10b981',
                  borderRadius: '16px',
                  padding: '14px 28px',
                }}
              >
                <Trophy size={32} color="#fbbf24" />
                <span style={{ fontWeight: 800, color: '#f0fdf4', fontSize: '15px' }}>
                  {language === 'np'
                    ? 'शानदार! सबै भाँडाहरू सही सङ्ख्यासँग मिले! (+३ ताराहरू)'
                    : 'Splendid! All containers matched successfully! (+3 Stars)'}
                </span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EmptyBasketAdventure;

