/**
 * TallShortAdventure.tsx (Pure 2D Edition)
 * Grade 1 Mathematics • Chapter 1: आकारप्रकार र स्थान (Shapes & Position)
 * 2D Simulation: Tall and Short Adventure
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
  Award,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AudioController } from '../audio/AudioController';
import { FONT_NP, toNp } from '../class1-math-kit/nepali';
import { MODE_1_HEIGHT_PAIRS, Mode1HeightPair } from './TallShortLevels';

interface TallShortAdventureProps {
  onBackToLibrary: () => void;
  userRole?: string;
  initialLanguage?: 'ne' | 'en';
}

type Mode = 'PAIRS' | 'ORDERING' | 'RULER';

interface TreeItem {
  id: string;
  nameEn: string;
  nameNp: string;
  heightPx: number;
  icon: string;
}

const ORDERING_TREES: TreeItem[] = [
  { id: 'short_bush', nameEn: 'Bush', nameNp: 'झाडी', heightPx: 90, icon: '🌿' },
  { id: 'mid_tree', nameEn: 'Apple Tree', nameNp: 'स्याउको रूख', heightPx: 180, icon: '🌳' },
  { id: 'tall_pine', nameEn: 'Tall Pine', nameNp: 'सल्लाको रूख', heightPx: 260, icon: '🌲' },
];

export const TallShortAdventure: React.FC<TallShortAdventureProps> = ({
  onBackToLibrary,
  initialLanguage = 'ne',
}) => {
  const [lang, setLang] = useState<'ne' | 'en'>('en');
  const [muted, setMuted] = useState(false);
  const [mode, setMode] = useState<Mode>('PAIRS');
  const [pairIdx, setPairIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ordering mode state
  const [orderedItems, setOrderedItems] = useState<TreeItem[]>([
    ORDERING_TREES[2],
    ORDERING_TREES[0],
    ORDERING_TREES[1],
  ]);

  const isNe = lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const currentPair: Mode1HeightPair = MODE_1_HEIGHT_PAIRS[pairIdx % MODE_1_HEIGHT_PAIRS.length];

  // Voice narration of current question
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

  const handleSelectChoice = (choice: 'A' | 'B') => {
    if (!currentPair) return;

    if (choice === currentPair.correctChoice) {
      AudioController.playSuccess();
      const msg = isNe ? currentPair.explanationNe : currentPair.explanationEn;
      setFeedback({ ok: true, text: msg });
      setStars((s) => s + 1);
      AudioController.speak(msg, lang);

      setTimeout(() => {
        setFeedback(null);
        setPairIdx((i) => i + 1);
      }, 1800);
    } else {
      AudioController.playBoop();
      const hint = isNe ? 'जमिनबाट उचाइ हेरौँ! कुन अग्लो वा होचो छ?' : 'Check the height from the ground! Which is taller or shorter?';
      setFeedback({ ok: false, text: hint });
      AudioController.speak(hint, lang);
    }
  };

  const swapOrder = (i: number, j: number) => {
    AudioController.playPop();
    const copy = [...orderedItems];
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
    setOrderedItems(copy);

    // Check if sorted ascending by heightPx
    const isAscending = copy[0].heightPx < copy[1].heightPx && copy[1].heightPx < copy[2].heightPx;
    if (isAscending) {
      AudioController.playSuccess();
      setStars((s) => s + 2);
      const msg = isNe ? 'सबास! सबैभन्दा होचोदेखि सबैभन्दा अग्लोसम्म सही क्रम मिल्यो!' : 'Great! Perfect order from shortest to tallest!';
      setFeedback({ ok: true, text: msg });
      AudioController.speak(msg, lang);
      setTimeout(() => setFeedback(null), 2000);
    }
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
              {L('कक्षा 1 • गणित • अध्याय 1', 'Class 1 • Mathematics • Chapter 1')}
            </div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
              {L('अग्लो र होचो साहसिक यात्रा (Tall and Short Adventure)', 'Tall and Short Adventure')}
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
          { key: 'PAIRS', np: 'अग्लो कि होचो?', en: 'Tall or Short?', icon: '🦒' },
          { key: 'ORDERING', np: 'उचाइको क्रम मिलाऔँ', en: 'Order by Height', icon: '📏' },
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
      </div>

      {/* ── Mode 1: Height Comparison Pairs ───────────────────── */}
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

          {/* Common Baseline Ground and Height Comparison Cards */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: 40,
              padding: '40px 24px',
              position: 'relative',
            }}
          >
            {/* Ground Plane Line */}
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: 40,
                right: 40,
                height: 6,
                background: '#16A34A',
                borderRadius: 3,
                zIndex: 1,
              }}
            />

            {/* Choice A */}
            <div
              onClick={() => handleSelectChoice('A')}
              style={{
                width: 'min(280px, 45vw)',
                height: `${Math.min(320, Math.max(140, currentPair.itemA.heightMeters * 65))}px`,
                background: '#FFFFFF',
                borderRadius: '20px 20px 0 0',
                border: '3px solid #DCE5DE',
                borderBottom: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                cursor: 'pointer',
                zIndex: 2,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#187C68';
                e.currentTarget.style.background = '#F0FDF4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#DCE5DE';
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <span style={{ fontSize: 72 }}>{currentPair.itemA.icon}</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#187C68' }}>
                  {isNe ? currentPair.itemA.nameNe : currentPair.itemA.nameEn}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 800 }}>
                  {currentPair.itemA.heightMeters} m
                </div>
              </div>
            </div>

            {/* Choice B */}
            <div
              onClick={() => handleSelectChoice('B')}
              style={{
                width: 'min(280px, 45vw)',
                height: `${Math.min(320, Math.max(140, currentPair.itemB.heightMeters * 65))}px`,
                background: '#FFFFFF',
                borderRadius: '20px 20px 0 0',
                border: '3px solid #DCE5DE',
                borderBottom: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                cursor: 'pointer',
                zIndex: 2,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#187C68';
                e.currentTarget.style.background = '#F0FDF4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#DCE5DE';
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <span style={{ fontSize: 72 }}>{currentPair.itemB.icon}</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#187C68' }}>
                  {isNe ? currentPair.itemB.nameNe : currentPair.itemB.nameEn}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 800 }}>
                  {currentPair.itemB.heightMeters} m
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mode 2: Height Ordering ───────────────────────────── */}
      {mode === 'ORDERING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, gap: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#187C68', textAlign: 'center' }}>
            📏 {L('होचोदेखि अग्लोसम्म क्रम मिलाउन साटासाट गर्नुहोस्:', 'Order from shortest to tallest (tap Swap buttons):')}
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: 32,
              position: 'relative',
              paddingBottom: 40,
            }}
          >
            {/* Ground Line */}
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: 20,
                right: 20,
                height: 6,
                background: '#16A34A',
                borderRadius: 3,
                zIndex: 1,
              }}
            />

            {orderedItems.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  width: '180px',
                  height: `${item.heightPx + 60}px`,
                  background: '#FFFFFF',
                  borderRadius: '16px 16px 0 0',
                  border: '2px solid #CBD5E1',
                  borderBottom: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  zIndex: 2,
                }}
              >
                <span style={{ fontSize: 56 }}>{item.icon}</span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{isNe ? item.nameNp : item.nameEn}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {idx > 0 && (
                      <button
                        onClick={() => swapOrder(idx, idx - 1)}
                        style={{
                          background: '#E2E8F0',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        ← {L('बायाँ', 'Left')}
                      </button>
                    )}
                    {idx < orderedItems.length - 1 && (
                      <button
                        onClick={() => swapOrder(idx, idx + 1)}
                        style={{
                          background: '#E2E8F0',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {L('दायाँ', 'Right')} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
