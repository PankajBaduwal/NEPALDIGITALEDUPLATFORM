/**
 * Lesson 14 · Pictograph and table
 * Tally & Pictograph — children vote for pets; tally marks (bundles of 5), table and pictograph row grow together.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, rnd } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const PETS = [
  { np: 'कुकुर', en: 'Dog', emoji: '🐶', color: '#F59E0B' },
  { np: 'बिरालो', en: 'Cat', emoji: '🐱', color: '#8B5CF6' },
  { np: 'खरायो', en: 'Rabbit', emoji: '🐰', color: '#EC4899' },
  { np: 'चरा', en: 'Bird', emoji: '🐦', color: '#0EA5E9' },
];

const MAXV = 15;

export const TallyChart: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L14-01',
    chapter: 14,
    titleNp: 'ट्याली र चित्रचार्ट',
    titleEn: 'Tally and Pictograph',
  });

  const [counts, setCounts] = useState<number[]>([4, 6, 3, 5]);

  const handleVote = (i: number) => {
    if (counts[i] >= MAXV) {
      kit.oops('यो पङ्क्ति भरियो', 'Row is full');
      return;
    }
    kit.tap();
    const next = [...counts];
    next[i] += 1;
    setCounts(next);
    kit.say(`${PETS[i].np} — जम्मा ${toNp(next[i])}`, `${PETS[i].en} — count ${next[i]}`);
  };

  const handleClear = () => {
    kit.tap();
    setCounts([0, 0, 0, 0]);
  };

  const handleRandomize = () => {
    kit.tap();
    setCounts([rnd(2, 9), rnd(2, 9), rnd(2, 9), rnd(2, 9)]);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      kit.say(
        'हरेक 5 वटा गन्दा 1 समूह बन्छ — 4 वटा ठाडो धर्को र 1 छड्के धर्को।',
        'Every 5 counts form a bundle: 4 vertical lines and 1 diagonal slash.'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz questions for Challenge Mode
  const maxIdx = counts.indexOf(Math.max(...counts));
  const questions: QuizQuestion[] = [
    {
      np: `तालिकामा सबैभन्दा बढी मनपराइएको जनावर कुन हो?`,
      en: `Which pet has the highest number of votes?`,
      answer: PETS[maxIdx].en,
      options: PETS.map((p) => ({
        key: p.en,
        label: kit.lang === 'ne' ? `${p.emoji} ${p.np}` : `${p.emoji} ${p.en}`,
      })),
    },
    {
      np: `${PETS[0].np}को लागि कतिवटा भोट आएको छ?`,
      en: `How many votes did the ${PETS[0].en} receive?`,
      answer: String(counts[0]),
      options: numChoices(counts[0], 12, [1, -1, 2, -2]).map((v) => ({
        key: String(v),
        label: toNp(v),
      })),
    },
    {
      np: 'ट्याली चिन्हमा 1 समूह (बन्डल) ले कति सङ्ख्या बुझाउँछ?',
      en: 'How much does one complete tally bundle represent?',
      answer: '5',
      options: [
        { key: '5', label: '5' },
        { key: '10', label: '10' },
        { key: '4', label: '4' },
      ],
    },
  ];

  const totalVotes = counts.reduce((a, b) => a + b, 0);

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontSize: 15,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      {kit.t('जम्मा भोट', 'Total Votes')}:{' '}
      <span style={{ color: '#059669', fontSize: 18 }}>{toNp(totalVotes)}</span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#26332E' }}>
          {kit.t('भोट थप्नुहोस्:', 'Vote for:')}
        </span>
        {PETS.map((p, i) => (
          <CBtn key={p.en} color={p.color} onClick={() => handleVote(i)}>
            {p.emoji} +1 {kit.t(p.np, p.en)}
          </CBtn>
        ))}

        <CBtn color="#64748B" onClick={handleClear}>
          ↺ {kit.t('खाली गरौँ', 'Clear')}
        </CBtn>
        <CBtn color="#187C68" onClick={handleRandomize}>
          🎲 {kit.t('नयाँ नतिजा', 'Random Data')}
        </CBtn>
      </div>
    </Controls>
  );

  // Helper to render Tally SVG Bundle (||||/)
  const renderTally = (n: number) => {
    const bundles = Math.floor(n / 5);
    const remainder = n % 5;

    return (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {Array.from({ length: bundles }).map((_, b) => (
          <svg key={b} width="40" height="30" viewBox="0 0 40 30">
            {/* 4 vertical bars */}
            <line x1="6" y1="4" x2="6" y2="26" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <line x1="14" y1="4" x2="14" y2="26" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <line x1="22" y1="4" x2="22" y2="26" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="4" x2="30" y2="26" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            {/* 1 diagonal slash across */}
            <line x1="2" y1="26" x2="34" y2="4" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ))}
        {remainder > 0 && (
          <svg width={remainder * 9 + 4} height="30" viewBox={`0 0 ${remainder * 9 + 4} 30`}>
            {Array.from({ length: remainder }).map((_, r) => (
              <line
                key={r}
                x1={6 + r * 8}
                y1="4"
                x2={6 + r * 8}
                y2="26"
                stroke="#1E293B"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}
          </svg>
        )}
        {n === 0 && <span style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>0</span>}
      </div>
    );
  };

  return (
    <SimFrame2D kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} grade={2}>
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 820,
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 24,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 180px 1fr 60px',
              gap: 12,
              paddingBottom: 8,
              borderBottom: '2px solid #E2E8F0',
              fontWeight: 900,
              fontSize: 14,
              color: '#64748B',
            }}
          >
            <div>{kit.t('जनावर (Pet)', 'Pet')}</div>
            <div>{kit.t('ट्याली चिन्ह (Tally)', 'Tally Marks')}</div>
            <div>{kit.t('चित्रचार्ट (Pictograph)', 'Pictograph')}</div>
            <div style={{ textAlign: 'right' }}>{kit.t('संख्या', 'Count')}</div>
          </div>

          {/* Table Rows for each pet */}
          {PETS.map((pet, i) => (
            <div
              key={pet.en}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 180px 1fr 60px',
                gap: 12,
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: i < PETS.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}
            >
              {/* Pet Name with clickable vote badge */}
              <div
                onClick={() => handleVote(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: 15,
                  color: '#1E293B',
                }}
              >
                <span style={{ fontSize: 24 }}>{pet.emoji}</span>
                <span>{kit.t(pet.np, pet.en)}</span>
              </div>

              {/* Tally Marks */}
              <div>{renderTally(counts[i])}</div>

              {/* Pictograph Emoji Icons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {Array.from({ length: counts[i] }).map((_, k) => (
                  <span key={k} style={{ fontSize: 20 }}>
                    {pet.emoji}
                  </span>
                ))}
              </div>

              {/* Number Count Badge */}
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    background: '#F1F5F9',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontWeight: 900,
                    fontSize: 15,
                    color: pet.color,
                  }}
                >
                  {toNp(counts[i])}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SimFrame2D>
  );
};
