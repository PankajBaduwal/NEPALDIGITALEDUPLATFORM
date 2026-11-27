/**
 * Chapter 19 · Time (समय - घडी)
 * Sim 2: Clock Tower (घडी टावर) — Pure 2D Edition
 * 100% 2D SVG / Interactive Analog Clock – No Three.js/WebGL dependencies.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

const CLOCK_HOURS_NP = ['१२', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११'];

export const ClockTower: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH19-02',
    chapter: 19,
    titleNp: 'घडी टावर (समय पढौँ)',
    titleEn: 'Clock Tower (Reading Time)',
  });

  const [hour, setHour] = useState<number>(3);
  const [minute, setMinute] = useState<number>(0);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const setTime = (h: number, m: number) => {
    kit.tap();
    setHour(h);
    setMinute(m);
    const mStr = m === 0 ? (isNe ? 'ठीक' : "o'clock") : (isNe ? '३० मिनेट' : 'half past');
    kit.say(
      `${toNp(h)} बजेको छ। (${mStr})`,
      `It is ${h}:${m === 0 ? '00' : '30'}.`
    );
  };

  const hourAngle = (hour % 12) * 30 + (minute / 60) * 30;
  const minuteAngle = minute * 6;

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: 'घडीको सानो सुईले के देखाउँछ?',
        en: 'What does the short hand of the clock show?',
        options: [
          { key: 'hour', label: isNe ? 'घण्टा (Hour)' : 'Hour' },
          { key: 'min', label: isNe ? 'मिनेट (Minute)' : 'Minute' },
          { key: 'sec', label: isNe ? 'सेकेन्ड (Second)' : 'Second' },
        ],
        answer: 'hour',
      },
      {
        np: 'घडीको लामो सुई १२ मा र सानो सुई ४ मा हुँदा कति बज्छ?',
        en: 'Short hand on 4, long hand on 12. What time is it?',
        options: [
          { key: '4', label: isNe ? '४ बजे (4:00)' : '4:00' },
          { key: '12', label: isNe ? '१२ बजे (12:00)' : '12:00' },
          { key: '6', label: isNe ? '६ बजे (6:00)' : '6:00' },
        ],
        answer: '4',
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
            fontSize: 22,
            color: '#187C68',
          }}
        >
          🕒 {isNe ? toNp(hour) : hour}:{minute === 0 ? '००' : '३०'}{' '}
          <span style={{ fontSize: 16, color: '#64748B' }}>
            {minute === 0 ? (isNe ? 'बजे' : "o'clock") : (isNe ? 'साढे' : 'half past')}
          </span>
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
              {L('घण्टा रोज्नुहोस्:', 'Select hour:')}
            </span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
              <button
                key={h}
                onClick={() => setTime(h, minute)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: hour === h ? '2px solid #187C68' : '1px solid #CBD5E1',
                  background: hour === h ? '#187C68' : '#FFFFFF',
                  color: hour === h ? '#FFFFFF' : '#334155',
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {isNe ? toNp(h) : h}
              </button>
            ))}

            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              <button
                onClick={() => setTime(hour, 0)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: minute === 0 ? '2px solid #187C68' : '1px solid #CBD5E1',
                  background: minute === 0 ? '#E6F3E9' : '#FFFFFF',
                  color: minute === 0 ? '#187C68' : '#334155',
                  fontWeight: 900,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                :00 {L('(ठीक)', "(o'clock)")}
              </button>
              <button
                onClick={() => setTime(hour, 30)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: minute === 30 ? '2px solid #187C68' : '1px solid #CBD5E1',
                  background: minute === 30 ? '#E6F3E9' : '#FFFFFF',
                  color: minute === 30 ? '#187C68' : '#334155',
                  fontWeight: 900,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                :30 {L('(साढे)', '(half past)')}
              </button>
            </div>
          </div>
        )
      }
    >
      {/* ── 2D SVG Analog Clock ───────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 460,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'linear-gradient(180deg, #E0F2FE 0%, #F5F7F5 60%)',
        }}
      >
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))' }}
        >
          {/* Outer Rim */}
          <circle cx="160" cy="160" r="150" fill="#187C68" />
          <circle cx="160" cy="160" r="140" fill="#FFFFFF" />

          {/* 12 Hour Numbers */}
          {Array.from({ length: 12 }, (_, i) => {
            const hNum = i === 0 ? 12 : i;
            const angle = (hNum * 30 * Math.PI) / 180;
            const x = 160 + 110 * Math.sin(angle);
            const y = 160 - 110 * Math.cos(angle);

            return (
              <text
                key={hNum}
                x={x}
                y={y + 7}
                textAnchor="middle"
                fill="#1E293B"
                fontSize="22"
                fontWeight="900"
                fontFamily="'Mukta', sans-serif"
              >
                {isNe ? toNp(hNum) : hNum}
              </text>
            );
          })}

          {/* Short Hour Hand */}
          <line
            x1="160"
            y1="160"
            x2={160 + 65 * Math.sin((hourAngle * Math.PI) / 180)}
            y2={160 - 65 * Math.cos((hourAngle * Math.PI) / 180)}
            stroke="#187C68"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Long Minute Hand */}
          <line
            x1="160"
            y1="160"
            x2={160 + 95 * Math.sin((minuteAngle * Math.PI) / 180)}
            y2={160 - 95 * Math.cos((minuteAngle * Math.PI) / 180)}
            stroke="#EF4444"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Center Pivot */}
          <circle cx="160" cy="160" r="8" fill="#187C68" />
        </svg>
      </div>
    </SimFrame2D>
  );
};
