/**
 * SimFrame2D.tsx
 * Shared 2D Simulation Frame for Classes 1–6 Mathematics
 * Designed for Smart Boards, Desktops, and Tablets.
 * Adheres to the Nepal Digital Education Platform 2D Design System.
 */
import React from 'react';
import { ArrowLeft, Volume2, VolumeX, Star, Maximize2, Minimize2 } from 'lucide-react';
import { SimKit, Mode, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { FONT_NP, toNp } from '../class1-math-kit/nepali';

export interface SimFrame2DProps {
  kit: SimKit;
  onBack: () => void;
  /** Main 2D interactive stage content (SVG, Canvas, or interactive 2D components) */
  children: React.ReactNode;
  /** Controls panel displayed beneath the 2D stage */
  panel?: React.ReactNode;
  controls?: React.ReactNode;
  /** Overlay HUD (e.g. current equation, counter, or status) */
  hud?: React.ReactNode;
  /** Tab modes to enable. Defaults to ['LEARN', 'PLAY', 'CHALLENGE'] */
  modes?: Mode[];
  /** Extra header controls or badges */
  extra?: React.ReactNode;
  /** Grade level display. Defaults to 1 */
  grade?: number;
  /** Mascot prompt/speech */
  mascotGreeting?: string;
  /** Quiz questions for CHALLENGE mode */
  questions?: QuizQuestion[];
  /** Quiz question callback */
  onAskQuestion?: (q: any, index: number) => void;
}

const MODE_META: Record<Mode, { np: string; en: string; icon: string }> = {
  LEARN: { np: 'सिकौँ', en: 'Learn', icon: '📖' },
  PLAY: { np: 'खेलौँ', en: 'Play', icon: '🎈' },
  CHALLENGE: { np: 'चुनौती', en: 'Challenge', icon: '🏆' },
};

export const SimFrame2D: React.FC<SimFrame2DProps> = ({
  kit,
  onBack,
  children,
  panel,
  controls,
  hud,
  modes = ['LEARN', 'PLAY', 'CHALLENGE'],
  extra,
  grade = 1,
  mascotGreeting,
  questions,
  onAskQuestion,
}) => {
  const { lang, bubble, toast, muted } = kit;
  const isNe = lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const activeSpeech = bubble.np || bubble.en ? L(bubble.np, bubble.en) : mascotGreeting;

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
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <style>{`
        @keyframes simPop { 0% { transform: scale(0.7); opacity: 0; } 70% { transform: scale(1.06); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes simShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        @keyframes simBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
      {/* ── Top Header ────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 18px',
          background: '#187C68',
          color: '#FFFFFF',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.18)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
          >
            <ArrowLeft size={16} /> {L('पुस्तकालय', 'Library')}
          </button>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.04em' }}>
              {L(`कक्षा ${toNp(grade)} • गणित • अध्याय ${toNp(kit.cfg.chapter)}`, `Class ${grade} • Mathematics • Chapter ${kit.cfg.chapter}`)}
            </div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, lineHeight: 1.25 }}>
              {isNe ? kit.cfg.titleNp : kit.cfg.titleEn}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {extra}

          {/* Stars Pill */}
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
            <Star size={16} fill="#FDE047" color="#FDE047" />
            <span>{isNe ? toNp(kit.stars) : kit.stars}</span>
          </div>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => kit.setLang(isNe ? 'en' : 'ne')}
            style={{
              background: 'rgba(255,255,255,0.18)',
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

          {/* Audio Mute Toggle */}
          <button
            type="button"
            aria-label="Toggle Sound"
            onClick={() => kit.setMuted(!muted)}
            style={{
              background: 'rgba(255,255,255,0.18)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 10px',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            aria-label="Toggle Fullscreen"
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255,255,255,0.18)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 10px',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* ── Central 2D Interactive Stage ─────────────────────── */}
      <main
        style={{
          position: 'relative',
          flex: 1,
          minHeight: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: '#FFFFFF',
        }}
      >
        {children}

        {/* Mascot Speech Bubble */}
        {Boolean(activeSpeech) && (
          <div
            style={{
              position: 'absolute',
              left: 16,
              top: 16,
              maxWidth: 'min(520px, 85%)',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              animation: 'simPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              zIndex: 30,
            }}
          >
            <div style={{ fontSize: 36, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))', animation: 'simBob 2.5s infinite' }}>🐼</div>
            <div
              onClick={() => {
                if (bubble.np || bubble.en) {
                  kit.say(bubble.np, bubble.en);
                } else if (mascotGreeting) {
                  kit.say(mascotGreeting, mascotGreeting);
                }
              }}
              style={{
                background: '#FFFFFF',
                border: '2px solid #187C68',
                borderRadius: 18,
                padding: '10px 16px',
                fontSize: 15,
                fontWeight: 800,
                color: '#26332E',
                lineHeight: 1.4,
                boxShadow: '0 6px 18px rgba(24,124,104,0.15)',
                cursor: 'pointer',
              }}
              title="Click to replay audio"
            >
              {activeSpeech} <span style={{ opacity: 0.6 }}>🔊</span>
            </div>
          </div>
        )}

        {/* HUD Indicator */}
        {hud && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            {hud}
          </div>
        )}

        {/* Toast / Instant Praise */}
        {toast && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '40%',
              transform: 'translateX(-50%)',
              background: toast.ok ? '#10B981' : '#F59E0B',
              color: '#FFFFFF',
              padding: '14px 32px',
              borderRadius: 30,
              fontSize: 24,
              fontWeight: 900,
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              zIndex: 50,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              animation: toast.ok ? 'simPop 0.35s' : 'simShake 0.4s',
            }}
          >
            {toast.ok ? '🌟 ' : '💡 '}
            {L(toast.np, toast.en)}
          </div>
        )}
      </main>

      {/* ── Mode Switcher & Interaction Panel ────────────────── */}
      <footer
        style={{
          background: '#F5F7F5',
          borderTop: '1px solid #DCE5DE',
          padding: '12px 18px 16px',
        }}
      >
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {modes.map((m) => {
            const meta = MODE_META[m];
            const active = kit.mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => kit.setMode(m)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 20px',
                  fontSize: 15,
                  fontWeight: 800,
                  borderRadius: 14,
                  border: active ? '2px solid #187C68' : '1px solid #CBD5E1',
                  background: active ? '#187C68' : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#334155',
                  cursor: 'pointer',
                  boxShadow: active ? '0 3px 8px rgba(24,124,104,0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{meta.icon}</span>
                <span>{L(meta.np, meta.en)}</span>
              </button>
            );
          })}
        </div>

        {/* When in CHALLENGE mode and questions are supplied, show QuizPanel */}
        {kit.mode === 'CHALLENGE' && questions && questions.length > 0 ? (
          <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: 16, border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <QuizPanel kit={kit} questions={questions} onAsk={onAskQuestion} />
          </div>
        ) : (
          controls || panel
        )}
      </footer>
    </div>
  );
};
