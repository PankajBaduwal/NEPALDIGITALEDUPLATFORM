import React from 'react';
import { toNp } from '../class1-math-kit/nepali';

interface Base10Blocks2DProps {
  hundreds: number;
  tens: number;
  ones: number;
  lang?: 'ne' | 'en';
  title?: string;
  color?: string;
  compact?: boolean;
}

export const Base10Blocks2D: React.FC<Base10Blocks2DProps> = ({
  hundreds,
  tens,
  ones,
  lang = 'en',
  title,
  color = '#187C68',
  compact = false,
}) => {
  const isNe = lang === 'ne';
  const total = hundreds * 100 + tens * 10 + ones;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        borderRadius: 16,
        padding: compact ? '10px 14px' : '16px 20px',
        border: `2px solid ${color}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        maxWidth: '100%',
      }}
    >
      {/* Header / Summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ fontSize: compact ? 15 : 18, fontWeight: 900, color: '#26332E' }}>
          {title || (isNe ? 'ब्लक प्रतिनिधित्व' : 'Base-10 Blocks')}
        </div>
        <div
          style={{
            background: color,
            color: '#FFFFFF',
            borderRadius: 10,
            padding: '4px 12px',
            fontSize: compact ? 16 : 20,
            fontWeight: 900,
          }}
        >
          {isNe ? toNp(total) : total}
        </div>
      </div>

      {/* Columns: Hundreds, Tens, Ones */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(140px, 1fr) minmax(110px, 1fr) minmax(110px, 1fr)',
          gap: 12,
        }}
      >
        {/* Hundreds Column */}
        <div
          style={{
            background: '#F0FDF4',
            borderRadius: 12,
            padding: 10,
            border: '1.5px solid #BBF7D0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 6 }}>
            {isNe ? `सय (${toNp(hundreds)})` : `Hundreds (${hundreds})`}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              justifyContent: 'center',
              minHeight: 60,
              alignItems: 'center',
            }}
          >
            {Array.from({ length: Math.min(hundreds, 9) }).map((_, i) => (
              <svg
                key={i}
                width={compact ? 42 : 54}
                height={compact ? 42 : 54}
                viewBox="0 0 100 100"
                style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.12))' }}
              >
                <rect width="100" height="100" rx="4" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
                {Array.from({ length: 9 }).map((_, r) => (
                  <line
                    key={`h-${r}`}
                    x1="0"
                    y1={(r + 1) * 10}
                    x2="100"
                    y2={(r + 1) * 10}
                    stroke="#15803D"
                    strokeWidth="1.2"
                    strokeOpacity="0.7"
                  />
                ))}
                {Array.from({ length: 9 }).map((_, c) => (
                  <line
                    key={`v-${c}`}
                    x1={(c + 1) * 10}
                    y1="0"
                    x2={(c + 1) * 10}
                    y2="100"
                    stroke="#15803D"
                    strokeWidth="1.2"
                    strokeOpacity="0.7"
                  />
                ))}
              </svg>
            ))}
            {hundreds === 0 && (
              <span style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                {isNe ? 'खाली' : 'None'}
              </span>
            )}
          </div>
        </div>

        {/* Tens Column */}
        <div
          style={{
            background: '#EFF6FF',
            borderRadius: 12,
            padding: 10,
            border: '1.5px solid #BFDBFE',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1E40AF', marginBottom: 6 }}>
            {isNe ? `दशक (${toNp(tens)})` : `Tens (${tens})`}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              justifyContent: 'center',
              minHeight: 60,
              alignItems: 'center',
            }}
          >
            {Array.from({ length: Math.min(tens, 19) }).map((_, i) => (
              <svg
                key={i}
                width={compact ? 12 : 16}
                height={compact ? 54 : 70}
                viewBox="0 0 20 100"
                style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))' }}
              >
                <rect width="20" height="100" rx="3" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
                {Array.from({ length: 9 }).map((_, r) => (
                  <line
                    key={r}
                    x1="0"
                    y1={(r + 1) * 10}
                    x2="20"
                    y2={(r + 1) * 10}
                    stroke="#1D4ED8"
                    strokeWidth="1.5"
                    strokeOpacity="0.8"
                  />
                ))}
              </svg>
            ))}
            {tens === 0 && (
              <span style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                {isNe ? 'खाली' : 'None'}
              </span>
            )}
          </div>
        </div>

        {/* Ones Column */}
        <div
          style={{
            background: '#FFFBEB',
            borderRadius: 12,
            padding: 10,
            border: '1.5px solid #FDE68A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#92400E', marginBottom: 6 }}>
            {isNe ? `एकाइ (${toNp(ones)})` : `Ones (${ones})`}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              justifyContent: 'center',
              maxWidth: 140,
              minHeight: 60,
              alignItems: 'center',
            }}
          >
            {Array.from({ length: Math.min(ones, 29) }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: compact ? 12 : 16,
                  height: compact ? 12 : 16,
                  background: '#F59E0B',
                  border: '1.5px solid #B45309',
                  borderRadius: 3,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                }}
              />
            ))}
            {ones === 0 && (
              <span style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                {isNe ? 'खाली' : 'None'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
