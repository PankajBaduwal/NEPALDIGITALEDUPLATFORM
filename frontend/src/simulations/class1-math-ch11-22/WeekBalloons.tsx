/**
 * Chapter 19 · Time (समय - हप्ताका सात दिन)
 * Sim 1: Week Balloons (हप्ताका सात दिन) — Pure 2D Edition
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

interface Day {
  id: number;
  nameEn: string;
  nameNp: string;
  color: string;
}

const DAYS_OF_WEEK: Day[] = [
  { id: 1, nameEn: 'Sunday', nameNp: 'आइतबार', color: '#EF4444' },
  { id: 2, nameEn: 'Monday', nameNp: 'सोमबार', color: '#F97316' },
  { id: 3, nameEn: 'Tuesday', nameNp: 'मङ्गलबार', color: '#F59E0B' },
  { id: 4, nameEn: 'Wednesday', nameNp: 'बुधबार', color: '#10B981' },
  { id: 5, nameEn: 'Thursday', nameNp: 'बिहीबार', color: '#3B82F6' },
  { id: 6, nameEn: 'Friday', nameNp: 'शुक्रबार', color: '#6366F1' },
  { id: 7, nameEn: 'Saturday', nameNp: 'शनिबार', color: '#8B5CF6' },
];

export const WeekBalloons: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH19-01',
    chapter: 19,
    titleNp: 'हप्ताका सात दिन (Week Balloons)',
    titleEn: 'Days of the Week (Week Balloons)',
  });

  const [placedDays, setPlacedDays] = useState<Day[]>([]);
  const [unplacedDays, setUnplacedDays] = useState<Day[]>(() =>
    [...DAYS_OF_WEEK].sort(() => Math.random() - 0.5)
  );

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const handlePickBalloon = (day: Day) => {
    kit.tap();
    const nextExpectedIndex = placedDays.length + 1;

    if (day.id === nextExpectedIndex) {
      kit.good(
        `सबास! ${isNe ? day.nameNp : day.nameEn} हप्ताको ${toNp(day.id)} दिन हो!`,
        `Correct! ${day.nameEn} is day ${day.id}!`
      );
      setPlacedDays((prev) => [...prev, day]);
      setUnplacedDays((prev) => prev.filter((d) => d.id !== day.id));
    } else {
      const expected = DAYS_OF_WEEK[nextExpectedIndex - 1];
      kit.oops(
        `अहिले ${isNe ? expected.nameNp : expected.nameEn} को पालो हो!`,
        `Next is ${expected.nameEn}!`
      );
    }
  };

  const restartWeek = () => {
    kit.tap();
    setPlacedDays([]);
    setUnplacedDays([...DAYS_OF_WEEK].sort(() => Math.random() - 0.5));
  };

  const isFinished = placedDays.length === 7;

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: 'एक हप्तामा कति दिन हुन्छन्?',
        en: 'How many days are in a week?',
        options: [
          { key: '7', label: isNe ? '७ दिन' : '7 days' },
          { key: '5', label: isNe ? '५ दिन' : '5 days' },
          { key: '6', label: isNe ? '६ दिन' : '6 days' },
        ],
        answer: '7',
      },
      {
        np: 'नेपालमा हप्ताको पहिलो दिन कुन हो?',
        en: 'Which is the first day of the week in Nepal?',
        options: [
          { key: 'sun', label: isNe ? 'आइतबार' : 'Sunday' },
          { key: 'mon', label: isNe ? 'सोमबार' : 'Monday' },
          { key: 'sat', label: isNe ? 'शनिबार' : 'Saturday' },
        ],
        answer: 'sun',
      },
      {
        np: 'शुक्रबारभन्दा ठिक अघि कुन बार आउँछ?',
        en: 'Which day comes right before Friday?',
        options: [
          { key: 'thu', label: isNe ? 'बिहीबार' : 'Thursday' },
          { key: 'wed', label: isNe ? 'बुधबार' : 'Wednesday' },
          { key: 'sat', label: isNe ? 'शनिबार' : 'Saturday' },
        ],
        answer: 'thu',
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
            padding: '8px 18px',
            boxShadow: '0 4px 12px rgba(24,124,104,0.15)',
            fontWeight: 900,
            fontSize: 18,
            color: '#187C68',
          }}
        >
          📅 {L(`राखिएका दिन: ${toNp(placedDays.length)}/७`, `Days placed: ${placedDays.length}/7`)}
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={restartWeek}
              style={{
                background: '#187C68',
                color: '#FFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              🔄 {L('पुनः क्रम मिलाऔँ', 'Restart Ordering')}
            </button>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 800 }}>
              💡 {L('आइतबारदेखि शनिबारसम्म क्रमअनुसार बेलुन छुनुहोस्!', 'Tap balloons in order from Sunday to Saturday!')}
            </span>
          </div>
        )
      }
    >
      {/* ── 2D Week Calendar Train & Balloons ──────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 460,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 24,
          background: 'linear-gradient(180deg, #BAE6FD 0%, #F5F7F5 65%)',
        }}
      >
        {/* Floating Balloons Pool */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', zIndex: 10 }}>
          {unplacedDays.map((day) => (
            <div
              key={day.id}
              onClick={() => handlePickBalloon(day)}
              style={{
                width: 90,
                height: 110,
                borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                background: day.color,
                color: '#FFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 20px ${day.color}50`,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                animation: 'simBob 3s infinite ease-in-out',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.9 }}>
                {isNe ? toNp(day.id) : day.id}
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, textAlign: 'center', padding: '0 4px' }}>
                {isNe ? day.nameNp : day.nameEn}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Train Track (7 Slots) */}
        <div
          style={{
            width: 'min(860px, 96vw)',
            background: '#FFFFFF',
            borderRadius: 24,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            padding: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
            alignItems: 'center',
          }}
        >
          {DAYS_OF_WEEK.map((day, idx) => {
            const isFilled = placedDays.some((d) => d.id === day.id);
            return (
              <div
                key={day.id}
                style={{
                  height: 90,
                  borderRadius: 14,
                  background: isFilled ? day.color : '#F1F5F9',
                  border: isFilled ? 'none' : '2px dashed #CBD5E1',
                  color: isFilled ? '#FFFFFF' : '#94A3B8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 4,
                  transition: 'all 0.3s ease',
                  boxShadow: isFilled ? `0 4px 12px ${day.color}40` : 'none',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 900 }}>{isNe ? toNp(idx + 1) : idx + 1}</div>
                <div style={{ fontSize: 13, fontWeight: 900, textAlign: 'center' }}>
                  {isFilled ? (isNe ? day.nameNp : day.nameEn) : '?'}
                </div>
              </div>
            );
          })}
        </div>

        {isFinished && (
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#10B981',
              animation: 'simPop 0.3s ease',
            }}
          >
            🎉 {L('सबास! हप्ताका सबै सात दिनको क्रम मिल्यो!', 'Great! All 7 days ordered perfectly!')}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
