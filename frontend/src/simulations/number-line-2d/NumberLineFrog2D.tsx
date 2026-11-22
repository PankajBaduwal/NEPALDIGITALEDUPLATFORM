/**
 * NumberLineFrog2D.tsx (Pure 2D Edition)
 * Interactive Number Line & Counting Frog (सङ्ख्या रेखा र भ्यागुताको उफ्राइ)
 * Class 1–5 Primary Mathematics · Nepal CDC Curriculum
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
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Award,
} from 'lucide-react';
import { FrogAudio } from './FrogAudio';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
  embedded?: boolean;
}

const NEP_NUMS = ['०','१','२','३','४','५','६','७','८','९','१०','११','१२','१३','१४','१५','१६','१७','१८','१९','२०'];
const NEP_WORDS = [
  'शून्य','एक','दुई','तीन','चार','पाँच','छ','सात','आठ','नौ','दश',
  'एघार','बाह्र','तेह्र','चौध','पन्ध्र','सोह्र','सत्र','अठार','उन्नीस','बीस'
];
const ENG_WORDS = [
  'Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty'
];

type Mode = 'COUNTING' | 'ADDITION' | 'SUBTRACTION' | 'SKIP_COUNT';

export const NumberLineFrog2D: React.FC<Props> = ({
  onBackToLibrary,
  embedded = false,
}) => {
  const [position, setPosition] = useState<number>(0);
  const [lang, setLang] = useState<'ne' | 'en'>('ne');
  const [muted, setMuted] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>('COUNTING');
  const [stars, setStars] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([0]);
  const [target, setTarget] = useState<number>(5);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const isNe = lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const hopTo = (newPos: number) => {
    const clamped = Math.max(0, Math.min(20, newPos));
    if (clamped === position) return;

    if (!muted) {
      FrogAudio.playRibbit();
    }

    setPosition(clamped);
    setHistory((prev) => [...prev.slice(-4), clamped]);

    // Check challenge
    if (mode === 'ADDITION' || mode === 'SUBTRACTION') {
      if (clamped === target) {
        if (!muted) FrogAudio.playSuccess();
        setStars((s) => s + 1);
        setFeedback(isNe ? 'सबास! लक्ष्यमा पुग्नुभयो!' : 'Great job! Target reached!');
        setTimeout(() => {
          setFeedback(null);
          setTarget(Math.floor(Math.random() * 15) + 3);
        }, 1800);
      }
    }
  };

  const jumpBy = (delta: number) => {
    hopTo(position + delta);
  };

  const resetGame = () => {
    setPosition(0);
    setHistory([0]);
    setFeedback(null);
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

  return (
    <div
      style={{
        width: '100%',
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F5F7F5',
        color: '#26332E',
        fontFamily: "'Mukta', sans-serif",
      }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 18px',
          background: '#187C68',
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
            <div style={{ fontSize: 11, fontWeight: 700, color: '#A7F3D0' }}>
              {L('कक्षा १–५ • गणित • अन्तरक्रियात्मक सङ्ख्यारेखा', 'Class 1–5 • Mathematics • Interactive Number Line')}
            </div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
              🐸 {L('सङ्ख्या रेखा र भ्यागुतो (Interactive Number Line Frog)', 'Interactive Number Line & Counting Frog')}
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
            <span>{isNe ? NEP_NUMS[stars % 21] : stars}</span>
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
            onClick={() => {
              FrogAudio.setMuted(!muted);
              setMuted(!muted);
            }}
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

      {/* ── Mode Selection ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: '10px 18px',
          background: '#EAF0EB',
          borderBottom: '1px solid #DCE5DE',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {[
          { key: 'COUNTING', np: 'गन्ती तथा उफ्राइ', en: 'Counting & Hopping', icon: '🔢' },
          { key: 'ADDITION', np: 'जोड (अगाडि उफ्रने)', en: 'Addition (+ Forward)', icon: '➕' },
          { key: 'SUBTRACTION', np: 'घटाउ (पछाडि उफ्रने)', en: 'Subtraction (− Backward)', icon: '➖' },
          { key: 'SKIP_COUNT', np: 'फड्को गन्ती (Skip Count)', en: 'Skip Count', icon: '🦘' },
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
                padding: '8px 16px',
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

        <button
          onClick={resetGame}
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
          <RotateCcw size={14} /> {L('सुरु (०)', 'Reset (0)')}
        </button>
      </div>

      {/* ── Frog Position HUD Card ────────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '16px 24px',
          borderBottom: '2px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: '#E6F3E9',
              border: '2px solid #187C68',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}
          >
            🐸
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 800 }}>
              {L('भ्यागुतो हाल रहेको स्थान (Current Position):', 'Current Frog Position:')}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#187C68' }}>
              {isNe ? NEP_NUMS[position] : position}
              <span style={{ fontSize: 16, color: '#475569', marginLeft: 8 }}>
                ({isNe ? NEP_WORDS[position] : ENG_WORDS[position]})
              </span>
            </div>
          </div>
        </div>

        {(mode === 'ADDITION' || mode === 'SUBTRACTION') && (
          <div
            style={{
              background: '#FEF3C7',
              border: '2px solid #F59E0B',
              borderRadius: 16,
              padding: '8px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 22 }}>🎯</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E' }}>
                {L('पुग्नुपर्ने लक्ष्य (Target):', 'Target Position:')}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#B45309' }}>
                {isNe ? NEP_NUMS[target] : target}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main 2D Number Line Stepping Stones ───────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '24px 18px',
          overflowX: 'auto',
          background: 'linear-gradient(180deg, #E0F2FE 0%, #F5F7F5 60%)',
        }}
      >
        {/* River & Lilypads Container */}
        <div
          style={{
            minWidth: '960px',
            position: 'relative',
            padding: '60px 20px 40px',
          }}
        >
          {/* River Stream */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 20,
              right: 20,
              height: 14,
              background: '#0284C7',
              borderRadius: 7,
              transform: 'translateY(-50%)',
              boxShadow: '0 4px 10px rgba(2,132,199,0.25)',
            }}
          />

          {/* 21 Stepping Stones (0 to 20) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {Array.from({ length: 21 }, (_, num) => {
              const isCurrent = num === position;
              const isTarget = (mode === 'ADDITION' || mode === 'SUBTRACTION') && num === target;

              return (
                <div
                  key={num}
                  onClick={() => hopTo(num)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {/* Frog Avatar above current stone */}
                  {isCurrent && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -55,
                        fontSize: 42,
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
                        animation: 'bounce 0.5s',
                        zIndex: 10,
                      }}
                    >
                      🐸
                    </div>
                  )}

                  {/* Target Flag */}
                  {isTarget && !isCurrent && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -40,
                        fontSize: 26,
                        animation: 'bounce 1s infinite',
                      }}
                    >
                      🎯
                    </div>
                  )}

                  {/* Lilypad Stone */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      background: isCurrent
                        ? '#187C68'
                        : isTarget
                        ? '#F59E0B'
                        : '#FFFFFF',
                      color: isCurrent || isTarget ? '#FFFFFF' : '#1E293B',
                      border: isCurrent
                        ? '3px solid #064E3B'
                        : isTarget
                        ? '3px solid #B45309'
                        : '2px solid #94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 16,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      transform: isCurrent ? 'scale(1.2)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isNe ? NEP_NUMS[num] : num}
                  </div>

                  {/* Tick Number Label */}
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      fontWeight: 800,
                      color: isCurrent ? '#187C68' : '#64748B',
                    }}
                  >
                    {isNe ? NEP_NUMS[num] : num}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 16,
              fontSize: 20,
              fontWeight: 900,
              color: '#10B981',
            }}
          >
            🌟 {feedback}
          </div>
        )}
      </div>

      {/* ── Hop Controls Panel ─────────────────────────────────── */}
      <footer
        style={{
          background: '#FFFFFF',
          borderTop: '2px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 15, color: '#187C68' }}>
          🎮 {L('उफ्रने बटनहरू (Hop Buttons):', 'Hop Controls:')}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Step Backwards */}
          <button
            onClick={() => jumpBy(-5)}
            disabled={position < 5}
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              padding: '10px 18px',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 900,
              cursor: position < 5 ? 'not-allowed' : 'pointer',
              opacity: position < 5 ? 0.4 : 1,
            }}
          >
            −५ {L('(पछाडि ५)', '(-5 Back)')}
          </button>
          <button
            onClick={() => jumpBy(-1)}
            disabled={position === 0}
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              padding: '10px 18px',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 900,
              cursor: position === 0 ? 'not-allowed' : 'pointer',
              opacity: position === 0 ? 0.4 : 1,
            }}
          >
            −१ {L('(पछाडि १)', '(-1 Back)')}
          </button>

          {/* Step Forwards */}
          <button
            onClick={() => jumpBy(1)}
            disabled={position >= 20}
            style={{
              background: '#E6F3E9',
              border: '2px solid #187C68',
              color: '#187C68',
              padding: '10px 22px',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 900,
              cursor: position >= 20 ? 'not-allowed' : 'pointer',
              opacity: position >= 20 ? 0.4 : 1,
            }}
          >
            +१ {L('(अगाडि १)', '(+1 Forward)')}
          </button>
          <button
            onClick={() => jumpBy(2)}
            disabled={position > 18}
            style={{
              background: '#E6F3E9',
              border: '2px solid #187C68',
              color: '#187C68',
              padding: '10px 20px',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 900,
              cursor: position > 18 ? 'not-allowed' : 'pointer',
              opacity: position > 18 ? 0.4 : 1,
            }}
          >
            +२ {L('(अगाडि २)', '(+2 Forward)')}
          </button>
          <button
            onClick={() => jumpBy(5)}
            disabled={position > 15}
            style={{
              background: '#E6F3E9',
              border: '2px solid #187C68',
              color: '#187C68',
              padding: '10px 20px',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 900,
              cursor: position > 15 ? 'not-allowed' : 'pointer',
              opacity: position > 15 ? 0.4 : 1,
            }}
          >
            +५ {L('(अगाडि ५)', '(+5 Forward)')}
          </button>
        </div>
      </footer>
    </div>
  );
};
