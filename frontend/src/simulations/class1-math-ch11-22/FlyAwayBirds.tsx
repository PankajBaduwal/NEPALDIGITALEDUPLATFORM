/**
 * Chapter 11 · Subtraction of numbers up to 20 (२० सम्मका सङ्ख्याको घटाउ)
 * Sim 1: Fly-Away Birds (चरा उडे!) — Pure 2D Edition
 * 100% 2D SVG / CSS Animations – No Three.js/WebGL dependencies.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const MISSIONS = [
  { s: 12, k: 3 },
  { s: 15, k: 5 },
  { s: 18, k: 6 },
  { s: 20, k: 8 },
  { s: 14, k: 4 },
];

const BIRD_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

export const FlyAwayBirds: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH11-01',
    chapter: 11,
    titleNp: 'चरा उडे! (२० सम्मको घटाउ)',
    titleEn: 'Fly-Away Birds (Take away up to 20)',
  });

  const [start, setStart] = useState(15);
  const [taken, setTaken] = useState(0);
  const [mi, setMi] = useState(0);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const remaining = Math.max(0, start - taken);

  const mission = MISSIONS[mi % MISSIONS.length];

  const flyOneBird = () => {
    if (remaining <= 0) return;
    kit.tap();
    setTaken((t) => t + 1);
  };

  const resetBirds = (newStart?: number) => {
    setStart(newStart ?? start);
    setTaken(0);
  };

  const nextMission = () => {
    const nextIdx = (mi + 1) % MISSIONS.length;
    setMi(nextIdx);
    setStart(MISSIONS[nextIdx].s);
    setTaken(0);
    kit.good(
      `नयाँ कथा: ${toNp(MISSIONS[nextIdx].s)} चरा बसेका छन्!`,
      `New mission: ${MISSIONS[nextIdx].s} birds on the wall!`
    );
  };

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: '१५ चरामा ३ चरा उडे भने कति बाँकी रहन्छन्? (१५ − ३ = ?)',
        en: '15 birds on a wall, 3 fly away. How many remain? (15 − 3 = ?)',
        options: [
          { key: '12', label: isNe ? '१२' : '12' },
          { key: '11', label: isNe ? '११' : '11' },
          { key: '18', label: isNe ? '१८' : '18' },
        ],
        answer: '12',
      },
      {
        np: '१८ चरामा ६ चरा उडे भने कति बाँकी? (१८ − ६ = ?)',
        en: '18 birds on a wall, 6 fly away. How many remain? (18 − 6 = ?)',
        options: [
          { key: '12', label: isNe ? '१२' : '12' },
          { key: '14', label: isNe ? '१४' : '14' },
          { key: '10', label: isNe ? '१०' : '10' },
        ],
        answer: '12',
      },
      {
        np: '२० मा ८ घटाउँदा कति हुन्छ? (२० − ८ = ?)',
        en: 'What is 20 − 8?',
        options: [
          { key: '12', label: isNe ? '१२' : '12' },
          { key: '13', label: isNe ? '१३' : '13' },
          { key: '11', label: isNe ? '११' : '11' },
        ],
        answer: '12',
      },
      {
        np: '१४ चरामा ४ चरा उडे भने कति चरा बाँकी? (१४ − ४ = ?)',
        en: '14 birds, 4 fly away. How many remain? (14 − 4 = ?)',
        options: [
          { key: '10', label: isNe ? '१०' : '10' },
          { key: '9', label: isNe ? '९' : '9' },
          { key: '8', label: isNe ? '८' : '8' },
        ],
        answer: '10',
      },
    ],
    [isNe]
  );

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      hud={
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #187C68',
            borderRadius: 16,
            padding: '8px 16px',
            boxShadow: '0 4px 12px rgba(24,124,104,0.15)',
            fontWeight: 900,
            fontSize: 22,
            color: '#187C68',
          }}
        >
          {isNe ? toNp(start) : start} − {isNe ? toNp(taken) : taken} ={' '}
          <span style={{ color: '#047857' }}>{isNe ? toNp(remaining) : remaining}</span>
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={flyOneBird}
              disabled={remaining === 0}
              style={{
                background: remaining === 0 ? '#94A3B8' : '#187C68',
                color: '#FFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 900,
                cursor: remaining === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 10px rgba(24,124,104,0.25)',
              }}
            >
              🕊️ {L('१ चरा उडाउनुहोस् (−१)', 'Make 1 Bird Fly Away (−1)')}
            </button>

            <button
              onClick={() => resetBirds()}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '12px 18px',
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔄 {L('सबै चरा फर्काउनुहोस्', 'Reset All Birds')}
            </button>

            {kit.mode === 'LEARN' && (
              <button
                onClick={nextMission}
                style={{
                  background: '#E7F1FC',
                  color: '#1E3A8A',
                  border: '1px solid #BFDBFE',
                  padding: '12px 20px',
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                  marginLeft: 'auto',
                }}
              >
                👉 {L('अर्को कथा / समस्या', 'Next Story Mission')}
              </button>
            )}
          </div>
        )
      }
    >
      {/* ── 2D Garden Scene & Birds on Wall ──────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 440,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          background: 'linear-gradient(180deg, #BAE6FD 0%, #E0F2FE 45%, #DCFCE7 75%, #F5F7F5 100%)',
          overflow: 'hidden',
          paddingBottom: 24,
        }}
      >
        {/* Floating Clouds */}
        <div style={{ position: 'absolute', top: 30, left: '10%', fontSize: 44, opacity: 0.8 }}>☁️</div>
        <div style={{ position: 'absolute', top: 50, right: '15%', fontSize: 56, opacity: 0.7 }}>☁️</div>
        <div style={{ position: 'absolute', top: 15, right: '40%', fontSize: 36, opacity: 0.9 }}>☀️</div>

        {/* Trees */}
        <div style={{ position: 'absolute', bottom: 110, left: 20, fontSize: 80 }}>🌳</div>
        <div style={{ position: 'absolute', bottom: 120, right: 30, fontSize: 90 }}>🌲</div>

        {/* Flown away birds animation area */}
        {taken > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 70,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              background: 'rgba(255,255,255,0.85)',
              padding: '6px 16px',
              borderRadius: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <span style={{ fontSize: 24 }}>🕊️</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#0369A1' }}>
              {L(`उडेका चरा: ${toNp(taken)} वटा`, `Flown away: ${taken} birds`)}
            </span>
          </div>
        )}

        {/* Birds Sitting on Wall Grid */}
        <div
          style={{
            zIndex: 10,
            width: 'min(720px, 92vw)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(52px, 1fr))',
            gap: 10,
            padding: '16px 20px',
            marginBottom: -8,
            justifyItems: 'center',
          }}
        >
          {Array.from({ length: start }).map((_, i) => {
            const isGone = i >= remaining;
            const birdColor = BIRD_COLORS[i % BIRD_COLORS.length];

            return (
              <div
                key={i}
                onClick={() => {
                  if (!isGone) {
                    flyOneBird();
                  }
                }}
                style={{
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 34,
                  cursor: isGone ? 'default' : 'pointer',
                  opacity: isGone ? 0.15 : 1,
                  transform: isGone ? 'translateY(-60px) scale(0.6)' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  filter: isGone ? 'grayscale(100%)' : `drop-shadow(0 4px 6px ${birdColor}40)`,
                }}
                title={isGone ? 'उडेको चरा' : 'चरा उडाउन छुनुहोस्!'}
              >
                🐦
              </div>
            );
          })}
        </div>

        {/* Stone Garden Wall */}
        <div
          style={{
            width: 'min(780px, 96vw)',
            height: 90,
            background: 'linear-gradient(180deg, #D4D4D8 0%, #A1A1AA 40%, #71717A 100%)',
            borderRadius: '16px 16px 0 0',
            border: '3px solid #52525B',
            borderBottom: 'none',
            boxShadow: '0 -4px 14px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: 16,
            letterSpacing: '0.05em',
            zIndex: 5,
          }}
        >
          🧱 {L(`पर्खालमा बाँकी चरा: ${toNp(remaining)} वटा`, `Birds remaining on wall: ${remaining}`)}
        </div>
      </div>
    </SimFrame2D>
  );
};
