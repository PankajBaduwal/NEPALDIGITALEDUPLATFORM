/**
 * NumberLineFrog2D.tsx (Pure 2D Edition)
 * Interactive Number Line & Counting Frog
 * Class 1–5 Primary Mathematics · Nepal CDC Curriculum
 */
import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize2,
  Minimize2,
  Award,
  Target,
  Calculator,
  Footprints,
} from 'lucide-react';
import { FrogAudio } from './FrogAudio';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
  embedded?: boolean;
}

const NEP_NUMS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
const NEP_WORDS = [
  'शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दश',
  'एघार', 'बाह्र', 'तेह्र', 'चौध', 'पन्ध्र', 'सोह्र', 'सत्र', 'अठार', 'उन्नीस', 'बीस',
];
const ENG_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
];

type Mode = 'COUNTING' | 'ADDITION' | 'SUBTRACTION' | 'SKIP_COUNT';

export const NumberLineFrog2D: React.FC<Props> = ({
  onBackToLibrary,
  embedded = false,
}) => {
  const [position, setPosition] = useState<number>(0);
  const [prevPosition, setPrevPosition] = useState<number>(0);
  const [lastDelta, setLastDelta] = useState<number>(0);
  const [lang, setLang] = useState<'ne' | 'en'>('en');
  const [muted, setMuted] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>('COUNTING');
  const [skipStep, setSkipStep] = useState<number>(2);
  const [stars, setStars] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([0]);
  const [target, setTarget] = useState<number>(7);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const isNe = lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const numStr = (n: number) => (isNe ? NEP_NUMS[n] ?? String(n).replace(/\d/g, (d) => NEP_NUMS[Number(d)]) : String(n));

  const pickNextTarget = (current: number, m: Mode) => {
    if (m === 'ADDITION') {
      const minT = Math.min(18, current + 2);
      return Math.min(20, minT + Math.floor(Math.random() * Math.max(1, 20 - minT)));
    }
    if (m === 'SUBTRACTION') {
      const maxT = Math.max(2, current - 2);
      return Math.max(0, Math.floor(Math.random() * maxT));
    }
    return Math.floor(Math.random() * 16) + 3;
  };

  const hopTo = (newPos: number) => {
    const clamped = Math.max(0, Math.min(20, newPos));
    if (clamped === position) return;

    if (!muted) FrogAudio.playRibbit();

    setPrevPosition(position);
    setLastDelta(clamped - position);
    setPosition(clamped);
    setHistory((prev) => [...prev.slice(-5), clamped]);

    if (mode === 'ADDITION' || mode === 'SUBTRACTION') {
      if (clamped === target) {
        if (!muted) FrogAudio.playSuccess();
        setStars((s) => s + 1);
        setFeedback(L('सबास! लक्ष्यमा पुग्नुभयो!', 'Great job! Target reached!'));
        window.setTimeout(() => {
          setFeedback(null);
          setTarget(pickNextTarget(clamped, mode));
        }, 1600);
      }
    }
  };

  const jumpBy = (delta: number) => hopTo(position + delta);

  const resetGame = () => {
    setPrevPosition(0);
    setLastDelta(0);
    setPosition(0);
    setHistory([0]);
    setFeedback(null);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setFeedback(null);
    if (newMode === 'ADDITION') {
      setTarget(Math.min(20, Math.max(5, position + 4)));
    } else if (newMode === 'SUBTRACTION') {
      const startPos = position < 5 ? 14 : position;
      if (position < 5) {
        setPosition(14);
        setPrevPosition(14);
        setHistory([14]);
      }
      setTarget(Math.max(0, startPos - 6));
    }
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

  // Equation preview string
  const equationText =
    lastDelta === 0
      ? `${numStr(position)}`
      : lastDelta > 0
      ? `${numStr(prevPosition)} + ${numStr(lastDelta)} = ${numStr(position)}`
      : `${numStr(prevPosition)} − ${numStr(Math.abs(lastDelta))} = ${numStr(position)}`;

  // SVG coordinates for jump arc (0..20 across viewBox 40..960)
  const xFor = (n: number) => 45 + (n / 20) * 910;
  const xStart = xFor(prevPosition);
  const xEnd = xFor(position);
  const xMid = (xStart + xEnd) / 2;
  const arcHeight = Math.min(95, Math.max(36, Math.abs(lastDelta) * 14));
  const arcY = 148 - arcHeight;

  return (
    <div
      style={{
        width: '100%',
        minHeight: embedded ? '100vh' : '88vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F5F7F8',
        color: '#263746',
        fontFamily: "'Manrope', 'Mukta', sans-serif",
        paddingBottom: embedded ? 68 : 0,
      }}
    >
      {/* ── Top Header ───────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          background: '#142D4E',
          color: '#FFFFFF',
          flexWrap: 'wrap',
          gap: 12,
          borderBottom: '3px solid #167C80',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!embedded && (
            <button
              type="button"
              onClick={onBackToLibrary}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.14)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '7px 13px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={15} /> {L('पुस्तकालय', 'Library')}
            </button>
          )}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9FCBCD', letterSpacing: '0.03em' }}>
              {L('कक्षा 1–5 • गणित • सङ्ख्या रेखा प्रयोगशाला', 'Class 1–5 • Mathematics • Number Line Lab')}
            </div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>
              {L('सङ्ख्या रेखा र भ्यागुतो', 'Interactive Number Line & Frog')}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              fontSize: 13,
            }}
          >
            <Award size={15} color="#D9A441" />
            <span>{numStr(stars)}</span>
          </div>

          

          <button
            type="button"
            aria-label={muted ? 'Unmute' : 'Mute'}
            onClick={() => {
              FrogAudio.setMuted(!muted);
              setMuted(!muted);
            }}
            style={{
              background: 'rgba(255,255,255,0.14)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '7px 10px',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <button
            type="button"
            aria-label="Toggle Fullscreen"
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255,255,255,0.14)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '7px 10px',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </header>

      {/* ── Mode Bar ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '10px 20px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {[
          { key: 'COUNTING', np: 'गन्ती र उफ्राइ', en: 'Counting & Hopping' },
          { key: 'ADDITION', np: 'जोड (+ अगाडि)', en: 'Addition (+ Forward)' },
          { key: 'SUBTRACTION', np: 'घटाउ (− पछाडि)', en: 'Subtraction (− Backward)' },
          { key: 'SKIP_COUNT', np: 'फड्को गन्ती', en: 'Skip Count' },
        ].map((tab) => {
          const active = mode === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => switchMode(tab.key as Mode)}
              style={{
                padding: '7px 15px',
                borderRadius: 9,
                border: active ? '1px solid #142D4E' : '1px solid #CBD5E1',
                background: active ? '#142D4E' : '#F8FAFC',
                color: active ? '#FFFFFF' : '#334155',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {L(tab.np, tab.en)}
            </button>
          );
        })}

        <button
          type="button"
          onClick={resetGame}
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 9,
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            color: '#475569',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} /> {L('शून्यमा फर्काउनुहोस्', 'Reset to 0')}
        </button>
      </div>

      {/* ── Main Content Container ───────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 20px', maxWidth: 1280, width: '100%', margin: '0 auto' }}>
        {/* 3-Card Summary Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
          }}
        >
          {/* Card 1: Current Position */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#E8F1F1',
                border: '1px solid #CFE3E4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                flexShrink: 0,
              }}
            >
              🐸
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {L('हालको स्थान', 'Current Position')}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#142D4E', lineHeight: 1.15 }}>
                {numStr(position)}
                <span style={{ fontSize: 14, fontWeight: 700, color: '#167C80', marginLeft: 8 }}>
                  ({isNe ? NEP_WORDS[position] : ENG_WORDS[position]})
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Live Equation & Path */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Calculator size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {L('गणितीय समीकरण', 'Hop Equation')}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#142D4E', lineHeight: 1.2 }}>
                {equationText}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                {L('उफ्राइ क्रम:', 'Path:')} {history.map((h) => numStr(h)).join(' → ')}
              </div>
            </div>
          </div>

          {/* Card 3: Mode Context (Target OR Skip Step Selector) */}
          {(mode === 'ADDITION' || mode === 'SUBTRACTION') ? (
            <div
              style={{
                background: '#FBF5E9',
                border: '1px solid #EBD7A5',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Target size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>
                    {L('पुग्नुपर्ने लक्ष्य', 'Target Stone')}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#B45309', lineHeight: 1.15 }}>
                    {numStr(target)}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 8,
                  background: '#FFFFFF',
                  color: '#92400E',
                  border: '1px solid #FDE68A',
                }}
              >
                {target > position
                  ? `${L('अगाडि', 'Ahead')}: +${numStr(target - position)}`
                  : target < position
                  ? `${L('पछाडि', 'Back')}: −${numStr(position - target)}`
                  : L('पुग्यो!', 'Reached!')}
              </span>
            </div>
          ) : mode === 'SKIP_COUNT' ? (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                {L('फड्को अन्तर छान्नुहोस्', 'Skip Count Interval')}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[2, 3, 5, 10].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSkipStep(s)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 8,
                      border: skipStep === s ? '1px solid #167C80' : '1px solid #CBD5E1',
                      background: skipStep === s ? '#167C80' : '#F8FAFC',
                      color: skipStep === s ? '#FFFFFF' : '#334155',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    +{numStr(s)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#F0FDFA',
                  border: '1px solid #99F6E4',
                  color: '#0F766E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Footprints size={20} />
              </div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.4 }}>
                {L(
                  'कुनै पनि ढुङ्गामा ट्याप गर्नुहोस् वा तलका बटनबाट भ्यागुतो उफार्नुहोस्।',
                  'Tap any stone on the number line or use the hop buttons below.'
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Interactive Number Line Canvas Card ──────────────── */}
        <div
          style={{
            flex: 1,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '18px 16px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 4px 16px -6px rgba(15,23,42,0.06)',
            overflowX: 'auto',
          }}
        >
          <div style={{ minWidth: 880, width: '100%' }}>
            <svg viewBox="0 0 1000 220" style={{ width: '100%', height: 'auto', display: 'block', select: 'none' } as any}>
              <defs>
                <linearGradient id="nlBg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F0F9FF" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="1000" height="220" rx="14" fill="url(#nlBg)" />

              {/* Main Number Line Axis */}
              <line x1="45" y1="150" x2="955" y2="150" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />

              {/* Highlighted Progress Segment from 0 to current position */}
              {position > 0 && (
                <line
                  x1={xFor(0)}
                  y1="150"
                  x2={xFor(position)}
                  y2="150"
                  stroke="#167C80"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              )}

              {/* Parabolic Jump Arc from prevPosition to position */}
              {lastDelta !== 0 && (
                <g>
                  <path
                    d={`M ${xStart} 130 Q ${xMid} ${arcY} ${xEnd} 130`}
                    fill="none"
                    stroke={lastDelta > 0 ? '#167C80' : '#D97706'}
                    strokeWidth="3"
                    strokeDasharray="6,4"
                  />
                  <rect
                    x={xMid - 22}
                    y={arcY - 12}
                    width="44"
                    height="22"
                    rx="11"
                    fill={lastDelta > 0 ? '#167C80' : '#D97706'}
                  />
                  <text
                    x={xMid}
                    y={arcY + 3}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="12"
                    fontWeight="800"
                  >
                    {lastDelta > 0 ? `+${numStr(lastDelta)}` : `−${numStr(Math.abs(lastDelta))}`}
                  </text>
                </g>
              )}

              {/* 21 Stepping Stones (0..20) */}
              {Array.from({ length: 21 }, (_, num) => {
                const cx = xFor(num);
                const isCurrent = num === position;
                const isTarget = (mode === 'ADDITION' || mode === 'SUBTRACTION') && num === target;
                const isSkipHighlight = mode === 'SKIP_COUNT' && num % skipStep === 0;
                const isMajor = num % 5 === 0;

                return (
                  <g
                    key={num}
                    onClick={() => hopTo(num)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Major Tick Line */}
                    <line
                      x1={cx}
                      y1="142"
                      x2={cx}
                      y2={isMajor ? 182 : 174}
                      stroke={isCurrent ? '#167C80' : '#CBD5E1'}
                      strokeWidth={isMajor ? 2.5 : 1.5}
                    />

                    {/* Target Marker */}
                    {isTarget && !isCurrent && (
                      <g transform={`translate(${cx}, 102)`}>
                        <circle cx="0" cy="0" r="14" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
                        <text x="0" y="5" textAnchor="middle" fontSize="14">🎯</text>
                      </g>
                    )}

                    {/* Frog Avatar above current stone */}
                    {isCurrent && (
                      <g transform={`translate(${cx}, 96)`}>
                        <circle cx="0" cy="0" r="22" fill="#E8F1F1" stroke="#167C80" strokeWidth="2.5" />
                        <text x="0" y="8" textAnchor="middle" fontSize="26">🐸</text>
                      </g>
                    )}

                    {/* Stepping Stone Circle */}
                    <circle
                      cx={cx}
                      cy="150"
                      r={isCurrent ? 19 : isMajor ? 17 : 15}
                      fill={
                        isCurrent
                          ? '#167C80'
                          : isTarget
                          ? '#F59E0B'
                          : isSkipHighlight
                          ? '#E0F2FE'
                          : '#FFFFFF'
                      }
                      stroke={
                        isCurrent
                          ? '#142D4E'
                          : isTarget
                          ? '#B45309'
                          : isSkipHighlight
                          ? '#0284C7'
                          : '#94A3B8'
                      }
                      strokeWidth={isCurrent || isTarget ? 3 : 2}
                    />
                    <text
                      x={cx}
                      y="155"
                      textAnchor="middle"
                      fill={isCurrent || isTarget ? '#FFFFFF' : '#1E293B'}
                      fontSize="13"
                      fontWeight="800"
                    >
                      {numStr(num)}
                    </text>

                    {/* Bottom Tick Numeral */}
                    <text
                      x={cx}
                      y="198"
                      textAnchor="middle"
                      fill={isCurrent ? '#167C80' : '#64748B'}
                      fontSize="11.5"
                      fontWeight={isMajor || isCurrent ? '800' : '600'}
                    >
                      {numStr(num)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {feedback && (
            <div
              style={{
                marginTop: 10,
                padding: '8px 16px',
                borderRadius: 10,
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontWeight: 800,
                fontSize: 15,
                textAlign: 'center',
              }}
            >
              🌟 {feedback}
            </div>
          )}
        </div>

        {/* ── Hop Controls Dock ────────────────────────────────── */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
          }}
        >
          {/* Backward Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#64748B', marginRight: 4 }}>
              {L('पछाडि:', 'Backward:')}
            </span>
            {[-5, -2, -1].map((delta) => {
              const disabled = position + delta < 0;
              return (
                <button
                  key={delta}
                  type="button"
                  disabled={disabled}
                  onClick={() => jumpBy(delta)}
                  style={{
                    minHeight: 46,
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    background: disabled ? '#F8FAFC' : '#FFFFFF',
                    color: disabled ? '#94A3B8' : '#142D4E',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  −{numStr(Math.abs(delta))}
                </button>
              );
            })}
          </div>

          {/* Forward Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#167C80', marginRight: 4 }}>
              {L('अगाडि:', 'Forward:')}
            </span>
            {(mode === 'SKIP_COUNT' ? [skipStep] : [1, 2, 5, 10]).map((delta) => {
              const disabled = position + delta > 20;
              return (
                <button
                  key={delta}
                  type="button"
                  disabled={disabled}
                  onClick={() => jumpBy(delta)}
                  style={{
                    minHeight: 46,
                    padding: '8px 18px',
                    borderRadius: 10,
                    border: disabled ? '1px solid #CBD5E1' : '1px solid #167C80',
                    background: disabled ? '#F8FAFC' : '#167C80',
                    color: disabled ? '#94A3B8' : '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  +{numStr(delta)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
