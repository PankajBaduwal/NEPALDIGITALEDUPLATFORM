/**
 * Class 4 lesson 7 · Time
 * Clock24 — 2D 24-Hour Clock vs 12-Hour Clock with dynamic Day/Night sky and dual rings.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, Props, mcq } from './h4';

const pad = (n: number) => String(n).padStart(2, '0');
const h24 = (t: number) => `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
const h12 = (t: number) => {
  const h = Math.floor(t / 60);
  return `${h % 12 || 12}:${pad(t % 60)} ${h < 12 ? 'AM' : 'PM'}`;
};
const getTimePeriod = (t: number): [string, string] => {
  const h = Math.floor(t / 60);
  if (h < 5) return ['रात', 'Night'];
  if (h < 12) return ['बिहान', 'Morning'];
  if (h < 17) return ['दिउँसो', 'Afternoon'];
  if (h < 20) return ['साँझ', 'Evening'];
  return ['रात', 'Night'];
};

export const Clock24: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L7-01',
    chapter: 7,
    titleNp: '24 घण्टे घडी (12 घण्टा ↔ 24 घण्टा)',
    titleEn: '24-Hour Clock (12-Hour ↔ 24-Hour)',
  });

  const [t, setT] = useState(15 * 60 + 45); // 15:45 (3:45 PM)

  const hours = Math.floor(t / 60);
  const minutes = t % 60;
  const period = getTimePeriod(t);
  const isDay = hours >= 6 && hours < 18;

  const updateTime = (newMinutes: number, speak = false) => {
    const wrapped = ((newMinutes % 1440) + 1440) % 1440;
    setT(wrapped);
    kit.tap();
    if (speak) {
      const p = getTimePeriod(wrapped);
      kit.say(
        `${h24(wrapped)} = ${h12(wrapped)} (${p[0]})`,
        `${h24(wrapped)} = ${h12(wrapped)} (${p[1]})`
      );
    }
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qVal = rnd(0, 95) * 15;
      const wr12 = (v: number) => [
        h12((v + 720) % 1440),
        h12((v + 60) % 1440),
        h12((v + 1380) % 1440),
      ];
      const wr24 = (v: number) => [
        h24((v + 720) % 1440),
        h24((v + 60) % 1440),
        h24((v + 1380) % 1440),
      ];

      if (i % 2 === 0) {
        return mcq(
          `${h12(qVal)} लाई 24 घण्टे समयमा रूपान्तरण गर्दा कति हुन्छ?`,
          `Convert ${h12(qVal)} to 24-hour time:`,
          h24(qVal),
          wr24(qVal),
          i
        );
      } else {
        return mcq(
          `${h24(qVal)} लाई 12 घण्टे समयमा रूपान्तरण गर्दा कति हुन्छ?`,
          `Convert ${h24(qVal)} to 12-hour time:`,
          h12(qVal),
          wr12(qVal),
          i
        );
      }
    });
  }, []);

  // Clock Hand Angles
  const minuteAngle = (minutes / 60) * 360 - 90;
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30 - 90;

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `24 घण्टे घडी: दिउँसो 12 बजेपछि थप 1 घण्टा = 13:00, 2 बजे = 14:00। अहिले ${h24(t)} = ${h12(t)} (${period[0]})`,
        `24-Hour time: after 12 noon, add 12 hours: 1 PM = 13:00. Currently ${h24(t)} = ${h12(t)} (${period[1]})`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Presets */}
          {[
            [6, 0],
            [9, 30],
            [12, 0],
            [15, 45],
            [19, 15],
            [22, 30],
          ].map(([h, m]) => (
            <button
              key={`${h}-${m}`}
              onClick={() => updateTime(h * 60 + m, true)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: hours === h && minutes === m ? '2px solid #187C68' : '1px solid #CBD5E1',
                background: hours === h && minutes === m ? '#E6F3E9' : '#FFFFFF',
                color: hours === h && minutes === m ? '#187C68' : '#334155',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {pad(h)}:{pad(m)}
            </button>
          ))}

          {/* Steppers */}
          <button
            onClick={() => updateTime(t - 60)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            −1h
          </button>
          <button
            onClick={() => updateTime(t + 60)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            +1h
          </button>
          <button
            onClick={() => updateTime(t - 15)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            −15m
          </button>
          <button
            onClick={() => updateTime(t + 15)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            +15m
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 640, gap: 16 }}>
        {/* Time Comparison Banner with Day/Night Indicator */}
        <div
          style={{
            background: isDay ? '#FEF9C3' : '#1E293B',
            border: isDay ? '2px solid #F59E0B' : '2px solid #334155',
            borderRadius: 16,
            padding: '12px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            width: '100%',
          }}
        >
          <div style={{ fontSize: 32 }}>{isDay ? '☀️' : '🌙'}</div>
          <div>
            <div style={{ fontSize: 30, fontWeight: 900, color: isDay ? '#92400E' : '#F8FAFC' }}>
              {h24(t)} <span style={{ fontSize: 18, opacity: 0.8 }}>(24-hour)</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: isDay ? '#B45309' : '#94A3B8' }}>
              {h12(t)} · {kit.t(period[0], period[1])}
            </div>
          </div>
        </div>

        {/* 2D Dual-Ring SVG Clock Face */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '2px solid #E2E8F0',
            padding: 24,
            boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <svg width="280" height="280" viewBox="0 0 280 280">
            {/* Outer Dial Circle */}
            <circle cx="140" cy="140" r="132" fill="#F8FAFC" stroke="#0284C7" strokeWidth="4" />
            <circle cx="140" cy="140" r="92" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

            {/* Outer 24-Hour Numbers (13-24 / 00) */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const num = idx + 13 <= 23 ? idx + 13 : 0;
              const angle = ((idx + 1) / 12) * 2 * Math.PI - Math.PI / 2;
              const tx = 140 + 112 * Math.cos(angle);
              const ty = 140 + 112 * Math.sin(angle);
              const isActive = hours === num;

              return (
                <text
                  key={`outer-${idx}`}
                  x={tx}
                  y={ty + 4}
                  textAnchor="middle"
                  fill={isActive ? '#187C68' : '#0369A1'}
                  fontSize={isActive ? '13' : '11'}
                  fontWeight={isActive ? '900' : '700'}
                >
                  {pad(num)}
                </text>
              );
            })}

            {/* Inner 12-Hour Numbers (1-12) */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const num = idx + 1;
              const angle = (num / 12) * 2 * Math.PI - Math.PI / 2;
              const tx = 140 + 72 * Math.cos(angle);
              const ty = 140 + 72 * Math.sin(angle);
              const isActive = (hours % 12 || 12) === num;

              return (
                <text
                  key={`inner-${idx}`}
                  x={tx}
                  y={ty + 5}
                  textAnchor="middle"
                  fill={isActive ? '#187C68' : '#1E293B'}
                  fontSize={isActive ? '16' : '13'}
                  fontWeight={isActive ? '900' : '700'}
                >
                  {num}
                </text>
              );
            })}

            {/* Hour Hand */}
            <g transform={`rotate(${hourAngle}, 140, 140)`}>
              <line x1="140" y1="140" x2="195" y2="140" stroke="#1E293B" strokeWidth="5.5" strokeLinecap="round" />
            </g>

            {/* Minute Hand */}
            <g transform={`rotate(${minuteAngle}, 140, 140)`}>
              <line x1="140" y1="140" x2="225" y2="140" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* Center Pivot Pin */}
            <circle cx="140" cy="140" r="7" fill="#EF4444" />
          </svg>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginTop: 8 }}>
            {kit.t('बाहिरी घेरा: 24 घण्टे (13-24) · भित्री घेरा: 12 घण्टे (1-12)', 'Outer ring: 24-Hour (13-24) · Inner ring: 12-Hour (1-12)')}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default Clock24;
