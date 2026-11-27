import React from 'react';
import { toNp } from '../class1-math-kit/nepali';
import { PLACES } from './h3';

interface Props {
  digits: number[]; // 5 digits [TTh, Th, H, T, O]
  lang?: 'ne' | 'en';
  onAddDigit?: (colIdx: number) => void;
  onDelDigit?: (colIdx: number) => void;
  interactive?: boolean;
}

export const PlaceValuePillars2D: React.FC<Props> = ({
  digits,
  lang = 'en',
  onAddDigit,
  onDelDigit,
  interactive = false,
}) => {
  const isNe = lang === 'ne';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '20px 24px',
        border: '2px solid #E2E8F0',
        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        width: '100%',
        maxWidth: 780,
      }}
    >
      {/* 5 Place Value Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
          alignItems: 'end',
          minHeight: 260,
        }}
      >
        {digits.map((val, idx) => {
          const place = PLACES[idx];
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                position: 'relative',
              }}
            >
              {/* Digit Value Top Badge */}
              <div
                style={{
                  background: place.color,
                  color: '#FFFFFF',
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 900,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                }}
              >
                {isNe ? toNp(val) : val}
              </div>

              {/* Vertical Stack Rod / Counters */}
              <div
                style={{
                  width: 44,
                  height: 180,
                  background: '#F8FAFC',
                  borderRadius: 12,
                  border: '2px dashed #CBD5E1',
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  alignItems: 'center',
                  padding: 4,
                  gap: 3,
                  position: 'relative',
                }}
              >
                {/* Central Rod Spine */}
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    bottom: 10,
                    width: 4,
                    background: '#E2E8F0',
                    zIndex: 1,
                  }}
                />

                {/* Counter Beads / Disks */}
                {Array.from({ length: val }).map((_, bIdx) => (
                  <div
                    key={bIdx}
                    style={{
                      width: 34,
                      height: 14,
                      borderRadius: 6,
                      background: place.color,
                      border: '1.5px solid rgba(0,0,0,0.2)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      zIndex: 2,
                    }}
                  />
                ))}
              </div>

              {/* + / - Interactive Buttons if enabled */}
              {interactive && (
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <button
                    type="button"
                    disabled={val >= 9}
                    onClick={() => onAddDigit?.(idx)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: 'none',
                      background: val >= 9 ? '#CBD5E1' : place.color,
                      color: '#FFFFFF',
                      fontWeight: 900,
                      cursor: val >= 9 ? 'not-allowed' : 'pointer',
                      fontSize: 12,
                    }}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    disabled={val <= 0}
                    onClick={() => onDelDigit?.(idx)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: 'none',
                      background: val <= 0 ? '#CBD5E1' : '#64748B',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      cursor: val <= 0 ? 'not-allowed' : 'pointer',
                      fontSize: 12,
                    }}
                  >
                    -
                  </button>
                </div>
              )}

              {/* Place Name Footer */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: place.color,
                  textAlign: 'center',
                  marginTop: 4,
                }}
              >
                {isNe ? place.np : place.en}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
