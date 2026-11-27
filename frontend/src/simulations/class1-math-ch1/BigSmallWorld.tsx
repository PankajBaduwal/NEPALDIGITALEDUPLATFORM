/**
 * BigSmallWorld.tsx (Pure 2D Edition)
 * Grade 1 Mathematics • Chapter 1: आकारप्रकार र स्थान (Shapes & Position)
 * 2D Simulation: Big and Small World (ठूलो र सानो संसार)
 * 100% 2D SVG & Canvas – No Three.js/WebGL dependencies.
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
  Award,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AudioController } from '../audio/AudioController';
import { FONT_NP, toNp } from '../class1-math-kit/nepali';
import { MODE_1_PAIRS, Mode1Pair } from './BigSmallLevels';

interface BigSmallWorldProps {
  onBackToLibrary: () => void;
  userRole?: string;
  initialLanguage?: 'ne' | 'en';
}

type Mode = 'PAIRS' | 'SORTING' | 'RESIZER';

interface BasketItem {
  id: string;
  nameEn: string;
  nameNp: string;
  icon: string;
  category: 'big' | 'small';
}

const SORTING_ITEMS: BasketItem[] = [
  { id: 'el', nameEn: 'Elephant', nameNp: 'हात्ती', icon: '🐘', category: 'big' },
  { id: 'mo', nameEn: 'Mouse', nameNp: 'मुसो', icon: '🐭', category: 'small' },
  { id: 'wh', nameEn: 'Blue Whale', nameNp: 'ह्वेल माछा', icon: '🐋', category: 'big' },
  { id: 'an', nameEn: 'Tiny Ant', nameNp: 'कमिला', icon: '🐜', category: 'small' },
  { id: 'tr', nameEn: 'Big Tree', nameNp: 'ठूलो रूख', icon: '🌳', category: 'big' },
  { id: 'fl', nameEn: 'Little Flower', nameNp: 'सानो फूल', icon: '🌸', category: 'small' },
  { id: 'pl', nameEn: 'Airplane', nameNp: 'हवाईजहाज', icon: '✈️', category: 'big' },
  { id: 'bi', nameEn: 'Bicycle', nameNp: 'साइकल', icon: '🚲', category: 'small' },
];

export const BigSmallWorld: React.FC<BigSmallWorldProps> = ({
  onBackToLibrary,
  initialLanguage = 'ne',
}) => {
  const [lang, setLang] = useState<'ne' | 'en'>(initialLanguage);
  const [muted, setMuted] = useState(false);
  const [mode, setMode] = useState<Mode>('PAIRS');
  const [pairIdx, setPairIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sorting mode state
  const [sortingItems, setSortingItems] = useState<BasketItem[]>(SORTING_ITEMS);
  const [bigBasket, setBigBasket] = useState<BasketItem[]>([]);
  const [smallBasket, setSmallBasket] = useState<BasketItem[]>([]);

  // Resizer state
  const [resizerScale, setResizerScale] = useState(1);

  const isNe = lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const currentPair: Mode1Pair = MODE_1_PAIRS[pairIdx % MODE_1_PAIRS.length];

  // Voice narration of question
  useEffect(() => {
    if (mode === 'PAIRS' && currentPair) {
      const q = isNe ? currentPair.questionNe : currentPair.questionEn;
      if (!muted) {
        AudioController.speak(q, lang);
      }
    }
  }, [pairIdx, mode, lang, muted]);

  const toggleSound = () => {
    AudioController.setMuted(!muted);
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSelectPairChoice = (choice: 'A' | 'B') => {
    if (!currentPair) return;

    if (choice === currentPair.correctChoice) {
      AudioController.playSuccess();
      const praise = isNe ? currentPair.explanationNe : currentPair.explanationEn;
      setFeedback({ ok: true, text: praise });
      setStars((s) => s + 1);
      AudioController.speak(praise, lang);

      setTimeout(() => {
        setFeedback(null);
        setPairIdx((i) => i + 1);
      }, 1800);
    } else {
      AudioController.playBoop();
      const hint = isNe ? 'फेरि ध्यान दिएर हेरौँ! कुन ठूलो वा सानो छ?' : "Look carefully! Which one is bigger or smaller?";
      setFeedback({ ok: false, text: hint });
      AudioController.speak(hint, lang);
    }
  };

  const handleSortItem = (item: BasketItem, target: 'big' | 'small') => {
    AudioController.playPop();

    if (item.category === target) {
      AudioController.playSuccess();
      setStars((s) => s + 1);
      setSortingItems((prev) => prev.filter((it) => it.id !== item.id));
      if (target === 'big') {
        setBigBasket((b) => [...b, item]);
      } else {
        setSmallBasket((b) => [...b, item]);
      }
      const msg = target === 'big' ? (isNe ? 'सबास! यो ठूलो वस्तु हो!' : 'Great! This is BIG!') : (isNe ? 'सबास! यो सानो वस्तु हो!' : 'Great! This is SMALL!');
      setFeedback({ ok: true, text: msg });
      AudioController.speak(msg, lang);
      setTimeout(() => setFeedback(null), 1200);
    } else {
      AudioController.playBoop();
      const msg = isNe ? 'ओहो! यो त्यहाँ मिल्दैन, अर्को डालो हेरौँ!' : "Oops! Try placing in the other basket!";
      setFeedback({ ok: false, text: msg });
      AudioController.speak(msg, lang);
    }
  };

  const resetSorting = () => {
    setSortingItems(SORTING_ITEMS);
    setBigBasket([]);
    setSmallBasket([]);
    setFeedback(null);
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F5F7F5',
        fontFamily: FONT_NP,
        color: '#26332E',
      }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 18px',
          background: '#142D4E', borderBottom: '3px solid #167C80',
          color: '#FFFFFF',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBackToLibrary}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> {L('पुस्तकालय', 'Library')}
          </button>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9FCBCD' }}>
              {L('कक्षा १ • गणित • अध्याय १', 'Class 1 • Mathematics • Chapter 1')}
            </div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
              {L('ठूलो र सानो संसार (Big and Small World)', 'Big and Small World (ठूलो र सानो)')}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.22)',
              padding: '6px 14px',
              borderRadius: 20,
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            <Award size={16} color="#FDE047" />
            <span>{isNe ? toNp(stars) : stars}</span>
          </div>

          <button
            onClick={() => setLang(isNe ? 'en' : 'ne')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isNe ? 'English' : 'नेपाली'}
          </button>

          <button
            onClick={toggleSound}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 10px',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 10px',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* ── Mode Navigation ───────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: '10px 18px',
          background: '#FFFFFF',
          borderBottom: '1px solid #DCE5DE',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {[
          { key: 'PAIRS', np: 'ठूलो कि सानो?', en: 'Big or Small?', icon: '🐘' },
          { key: 'SORTING', np: 'डालोमा छुट्याऔँ', en: 'Sort to Baskets', icon: '🧺' },
          { key: 'RESIZER', np: 'जादुई आकार यन्त्र', en: 'Magic Resizer', icon: '🔍' },
        ].map((tab) => {
          const active = mode === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setMode(tab.key as Mode);
                setFeedback(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 12,
                border: active ? '2px solid #187C68' : '1px solid #CBD5E1',
                background: active ? '#187C68' : '#FFFFFF',
                color: active ? '#FFFFFF' : '#26332E',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: active ? '0 2px 6px rgba(24,124,104,0.25)' : 'none',
              }}
            >
              <span>{tab.icon}</span>
              <span>{L(tab.np, tab.en)}</span>
            </button>
          );
        })}

        {mode === 'SORTING' && (
          <button
            onClick={resetSorting}
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 12,
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#475569',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> {L('पुनः सुरु', 'Reset')}
          </button>
        )}
      </div>

      {/* ── Mode 1: Pair Selection ────────────────────────────── */}
      {mode === 'PAIRS' && currentPair && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Question Banner */}
          <div
            style={{
              background: '#E7F1FC',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #BFDBFE',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>❓</span>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#1E3A8A' }}>
                {L(currentPair.questionNe, currentPair.questionEn)}
              </div>
            </div>
            <button
              onClick={() => {
                const q = isNe ? currentPair.questionNe : currentPair.questionEn;
                AudioController.speak(q, lang);
              }}
              style={{
                background: '#3B82F6',
                color: '#FFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Volume2 size={16} /> {L('सुन्नुहोस्', 'Hear')}
            </button>
          </div>

          {/* Side by side comparison cards */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 32,
              padding: 24,
              flexWrap: 'wrap',
            }}
          >
            {/* Choice A */}
            <div
              onClick={() => handleSelectPairChoice('A')}
              style={{
                width: 'min(320px, 90vw)',
                height: '320px',
                background: '#FFFFFF',
                borderRadius: 24,
                border: '3px solid #DCE5DE',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#187C68';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#DCE5DE';
              }}
            >
              <span style={{ fontSize: currentPair.itemA.sizeRank > 3 ? 120 : 64, transition: 'font-size 0.2s' }}>
                {currentPair.itemA.icon}
              </span>
              <div style={{ marginTop: 16, fontSize: 18, fontWeight: 900, color: '#187C68' }}>
                {isNe ? currentPair.itemA.nameNe : currentPair.itemA.nameEn}
              </div>
            </div>

            {/* Choice B */}
            <div
              onClick={() => handleSelectPairChoice('B')}
              style={{
                width: 'min(320px, 90vw)',
                height: '320px',
                background: '#FFFFFF',
                borderRadius: 24,
                border: '3px solid #DCE5DE',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#187C68';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#DCE5DE';
              }}
            >
              <span style={{ fontSize: currentPair.itemB.sizeRank > 3 ? 120 : 64, transition: 'font-size 0.2s' }}>
                {currentPair.itemB.icon}
              </span>
              <div style={{ marginTop: 16, fontSize: 18, fontWeight: 900, color: '#187C68' }}>
                {isNe ? currentPair.itemB.nameNe : currentPair.itemB.nameEn}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mode 2: Sorting into Baskets ──────────────────────── */}
      {mode === 'SORTING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, gap: 16 }}>
          {/* Items waiting to be sorted */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              border: '2px solid #E2E8F0',
              padding: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 900, color: '#187C68', marginBottom: 10 }}>
              📦 {L('वस्तु छान्नुहोस् र सही डालोमा हाल्नुहोस्:', 'Select item to sort into basket:')}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', minHeight: 60, alignItems: 'center' }}>
              {sortingItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#F8FAFC',
                    border: '2px solid #CBD5E1',
                    borderRadius: 14,
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 32 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{isNe ? item.nameNp : item.nameEn}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => handleSortItem(item, 'big')}
                      style={{
                        background: '#F59E0B',
                        color: '#FFF',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                      title="Sort to Big"
                    >
                      {L('ठूलो', 'Big')}
                    </button>
                    <button
                      onClick={() => handleSortItem(item, 'small')}
                      style={{
                        background: '#3B82F6',
                        color: '#FFF',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                      title="Sort to Small"
                    >
                      {L('सानो', 'Small')}
                    </button>
                  </div>
                </div>
              ))}
              {sortingItems.length === 0 && (
                <div style={{ color: '#16A34A', fontWeight: 900, fontSize: 18 }}>
                  🎉 {L('सबै वस्तुहरू सही डालोमा हालियो! बधाई छ!', 'All items sorted correctly! Wonderful!')}
                </div>
              )}
            </div>
          </div>

          {/* Two Baskets */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Big Basket */}
            <div
              style={{
                background: '#FEF3C7',
                borderRadius: 20,
                border: '3px dashed #F59E0B',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, color: '#92400E', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🧺</span>
                <span>{L('ठूला वस्तुहरूको डालो (BIG BASKET)', 'BIG BASKET (ठूलो डालो)')}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', gap: 10, flexWrap: 'wrap', padding: '14px 0', alignItems: 'center' }}>
                {bigBasket.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      background: '#FFFFFF',
                      padding: '8px 14px',
                      borderRadius: 12,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                      fontSize: 32,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>{it.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{isNe ? it.nameNp : it.nameEn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Small Basket */}
            <div
              style={{
                background: '#DBEAFE',
                borderRadius: 20,
                border: '3px dashed #3B82F6',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🧺</span>
                <span>{L('साना वस्तुहरूको डालो (SMALL BASKET)', 'SMALL BASKET (सानो डालो)')}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', gap: 10, flexWrap: 'wrap', padding: '14px 0', alignItems: 'center' }}>
                {smallBasket.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      background: '#FFFFFF',
                      padding: '8px 14px',
                      borderRadius: 12,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                      fontSize: 24,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>{it.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{isNe ? it.nameNp : it.nameEn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mode 3: Magic Resizer ─────────────────────────────── */}
      {mode === 'RESIZER' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            gap: 24,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 900, color: '#187C68' }}>
            🔍 {L('स्लाइडर तानेर वस्तुलाई ठूलो वा सानो बनाउनुहोस्!', 'Drag the slider to make the object BIG or SMALL!')}
          </div>

          <div
            style={{
              width: '320px',
              height: '240px',
              background: '#FFFFFF',
              borderRadius: 24,
              border: '2px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            <span
              style={{
                fontSize: `${40 * resizerScale}px`,
                transition: 'font-size 0.1s ease',
              }}
            >
              🍎
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 900, fontSize: 14 }}>{L('सानो (Small)', 'Small')}</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={resizerScale}
              onChange={(e) => setResizerScale(parseFloat(e.target.value))}
              style={{ width: '240px', accentColor: '#187C68' }}
            />
            <span style={{ fontWeight: 900, fontSize: 14 }}>{L('ठूलो (Big)', 'Big')}</span>
          </div>
        </div>
      )}

      {/* Feedback Overlay */}
      {feedback && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: feedback.ok ? '#10B981' : '#F59E0B',
            color: '#FFFFFF',
            padding: '16px 32px',
            borderRadius: 24,
            fontSize: 20,
            fontWeight: 900,
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            zIndex: 40,
            pointerEvents: 'none',
          }}
        >
          {feedback.ok ? '🌟 ' : '💡 '}
          {feedback.text}
        </div>
      )}
    </div>
  );
};
