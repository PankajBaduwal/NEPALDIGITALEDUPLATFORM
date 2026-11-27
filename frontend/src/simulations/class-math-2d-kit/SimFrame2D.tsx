/**
 * SimFrame2D.tsx
 * Shared 2D Simulation Frame for Classes 1–10 Mathematics
 * Clean, well-organized academic workspace for Smart Boards, Desktops, and Tablets.
 */
import React from 'react';
import { ArrowLeft, Volume2, VolumeX, Star, Maximize2, Minimize2, BookOpen, Gamepad2, Trophy } from 'lucide-react';
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
  /** Guidance prompt/speech */
  mascotGreeting?: string;
  /** Quiz questions for CHALLENGE mode */
  questions?: QuizQuestion[];
  /** Quiz question callback */
  onAskQuestion?: (q: any, index: number) => void;
}

const MODE_META: Record<Mode, { np: string; en: string; Icon: React.ElementType }> = {
  LEARN: { np: 'सिकौँ', en: 'Learn', Icon: BookOpen },
  PLAY: { np: 'खेलौँ', en: 'Explore', Icon: Gamepad2 },
  CHALLENGE: { np: 'अभ्यास', en: 'Challenge', Icon: Trophy },
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
        background: '#F5F7F8',
        fontFamily: FONT_NP,
        color: '#263746',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <style>{`
        @keyframes simFadeIn { 0% { opacity: 0; transform: translateY(-4px); } 100% { opacity: 1; transform: none; } }
        @keyframes simShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      `}</style>

      {/* ── Top Academic Header ────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 20px',
          background: '#142D4E',
          color: '#FFFFFF',
          borderBottom: '3px solid #167C80',
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
              background: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '7px 13px',
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          >
            <ArrowLeft size={15} /> {L('पुस्तकालय', 'Library')}
          </button>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9FCBCD', letterSpacing: '0.03em' }}>
              {L(`कक्षा ${toNp(grade)} • गणित • अध्याय ${toNp(kit.cfg.chapter)}`, `Class ${grade} • Mathematics • Chapter ${kit.cfg.chapter}`)}
            </div>
            <h1 style={{ margin: 0, fontSize: 17.5, fontWeight: 800, lineHeight: 1.25, color: '#FFFFFF' }}>
              {isNe ? kit.cfg.titleNp : kit.cfg.titleEn}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {extra}

          {/* Stars / Score Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(217, 164, 65, 0.2)',
              border: '1px solid rgba(217, 164, 65, 0.45)',
              color: '#F3E2B5',
              padding: '6px 12px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 13.5,
            }}
          >
            <Star size={15} fill="#D9A441" color="#D9A441" />
            <span>{isNe ? toNp(kit.stars) : kit.stars}</span>
          </div>

          {/* Language Switcher */}
          

          {/* Audio Mute Toggle */}
          <button
            type="button"
            aria-label="Toggle Sound"
            onClick={() => kit.setMuted(!muted)}
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '7px 10px',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            aria-label="Toggle Fullscreen"
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '7px 10px',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </header>

      {/* ── Mode Bar & Guidance Strip (Non-Overlapping) ───────── */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {modes.map((m) => {
            const meta = MODE_META[m];
            const Icon = meta.Icon;
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
                  padding: '7px 15px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  borderRadius: 9,
                  border: active ? '1px solid #142D4E' : '1px solid #CBD5E1',
                  background: active ? '#142D4E' : '#F8FAFC',
                  color: active ? '#FFFFFF' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} />
                <span>{L(meta.np, meta.en)}</span>
              </button>
            );
          })}
        </div>

        {/* Dedicated Clean Instruction / Audio Guidance Pill */}
        {Boolean(activeSpeech) && (
          <button
            type="button"
            onClick={() => {
              if (bubble.np || bubble.en) kit.say(bubble.np, bubble.en);
              else if (mascotGreeting) kit.say(mascotGreeting, mascotGreeting);
            }}
            title={L('फेरि सुन्नुहोस्', 'Click to hear instruction')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#E8F1F1',
              border: '1px solid #CFE3E4',
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 700,
              color: '#142D4E',
              cursor: 'pointer',
              maxWidth: 'min(540px, 100%)',
              textAlign: 'left',
            }}
          >
            <Volume2 size={15} color="#167C80" style={{ flexShrink: 0 }} />
            <span style={{ lineHeight: 1.35 }}>{activeSpeech}</span>
          </button>
        )}
      </div>

      {/* ── Central 2D Interactive Stage ─────────────────────── */}
      <main
        style={{
          position: 'relative',
          flex: 1,
          minHeight: '460px',
          margin: '14px 20px 0',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          background: '#FFFFFF',
          boxShadow: '0 4px 16px -6px rgba(15, 23, 42, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
        }}
      >
        {children}

        {/* HUD Indicator */}
        {hud && (
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            {hud}
          </div>
        )}

        {/* Toast / Instant Feedback */}
        {toast && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 18,
              transform: 'translateX(-50%)',
              background: toast.ok ? '#167C80' : '#D97706',
              color: '#FFFFFF',
              padding: '10px 24px',
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(15,23,42,0.2)',
              zIndex: 50,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              animation: toast.ok ? 'simFadeIn 0.25s' : 'simShake 0.35s',
            }}
          >
            {L(toast.np, toast.en)}
          </div>
        )}
      </main>

      {/* ── Interaction & Controls Panel ─────────────────────── */}
      {(controls || panel || (kit.mode === 'CHALLENGE' && questions && questions.length > 0)) && (
        <footer
          style={{
            margin: '12px 20px 16px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '14px 18px',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
          }}
        >
          {kit.mode === 'CHALLENGE' && questions && questions.length > 0 ? (
            <QuizPanel kit={kit} questions={questions} onAsk={onAskQuestion} />
          ) : (
            controls || panel
          )}
        </footer>
      )}
    </div>
  );
};
